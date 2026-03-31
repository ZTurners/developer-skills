---
name: skill-delegate
description: >
  Discovers, caches, and delegates to the most relevant sub-skill found in
  {WORKSPACE}/copilot/skills/**/*.skill.md (primary) and
  {WORKSPACE}/documents/**/*.skill.md (fallback). USE FOR: any operation
  when the workspace contains project-specific skills. DO NOT USE FOR: general
  coding questions unrelated to any loaded skill.
applyTo: "**"
---
# skill-delegate

A dispatch skill that discovers project sub-skills at runtime, caches
their metadata, selects the best match for the current request, and runs it
in a subagent.

---

## When to use

Activate this skill whenever **any** of the following is true:

- The user asks for an operation and the workspace contains a
  `copilot/skills/` folder.
- The user asks for an operation and the workspace contains a
  `documents/skills/` folder.

---

## Memory Policy

- User Memory [NoAccess, NoStore]
- Session Memory [Read, Store]  ← used for the skill-header cache
- Repo Memory [NoAccess, NoStore]

---

## Skill-Header Cache Format (Session Memory)

Cache is stored at `/memories/session/skill_cache.md`.

```
# Skill Header Cache
_last_indexed: <ISO-8601 timestamp of the cache build>

## <relative-path-to-skill-file>
last_modified: <ISO-8601 mtime of the file when last read>
<verbatim YAML frontmatter block copied from the file>
```

Example entry:

```
## copilot/skills/build-module.skill.md
last_modified: 2026-03-20T10:15:00Z
---
name: build-module
description: Builds a single module from source.
triggers: [build, compile, make]
---
```

Preload directives are declared inside the skill file body (not in frontmatter)
using dedicated Markdown sections. See Step 3.5 for how they are detected and
loaded.

---

## Instructions

Follow every numbered step in order.

### Step 0 — Load Memory Policy

Re-read the Memory Policy section above before doing anything else.

### Step 1 — Locate Skill Folders

Search for skill files in this priority order:

1. `{WORKSPACE}/copilot/skills/**/*.skill.md` (primary)
2. `{WORKSPACE}/documents/skills/**/*.skill.md` (fallback)

Collect all `*.skill.md` files found across both locations. If no skill files
are found anywhere, **stop** and inform the user that no project skills were
detected and suggest creating one under `{WORKSPACE}/copilot/skills/`.

### Step 2 — Load the Skill-Header Cache

2a. Attempt to read `/memories/session/skill_cache.md`.

2b. For every `*.skill.md` file discovered in Step 1, do:
    - Read the **actual** last-modified timestamp of the file from the
      filesystem (use `stat` or equivalent).
    - Compare it against the `last_modified` value in the cache for that file.
    - If the file is **new** or the **mtime differs**, re-read the YAML
      frontmatter block (everything between the first `---` and the closing
      `---`) and update that entry in the cache.
    - Remove cache entries for files that no longer exist.

2c. Save the updated cache back to `/memories/session/skill_cache.md`.

### Step 3 — Select the Best Skill

3a. Build a candidate list from the cache. Each candidate has:
    `name`, `description`, optional `triggers` array, and file path.

3b. Score each candidate against the user's request:
    - **+3** for each word in `triggers` that appears in the user's request
      (case-insensitive).
    - **+2** if the `name` appears in the user's request.
    - **+1** for semantic overlap between `description` and the request.
    - **+1 bonus** for skills found under `copilot/skills/` over `documents/skills/`
      when scores are otherwise equal (prefer the primary location).

3c. Pick the candidate with the highest score.

3d. If two candidates tie, prefer the one whose `name` most closely matches a
    keyword the user used.

3e. If **no** candidate scores above 0, list the top-3 candidates by
    description similarity and ask the user to confirm which one to use.

### Step 3.5 — Preload Knowledge and Experience (copilot skills only)

This step applies **only** to skills sourced from `{WORKSPACE}/copilot/skills/`.
Skip it entirely for skills sourced from `documents/skills/`.

3.5a. Read the full content of the selected `*.skill.md` file.

3.5b. Scan the skill body (not the YAML frontmatter) for the following
      optional Markdown sections. Each section contains a bullet list of
      keyword strings:

      ```md
      ## Preload Knowledge
      - overview
      - modules

      ## Preload Experience
      - build
      - module-lifecycle
      ```

      - A `## Preload Knowledge` heading signals knowledge keywords.
      - A `## Preload Experience` heading signals experience keywords.
      - Keywords are plain words (not paths), trimmed and case-insensitive.
      - Both sections are optional. If neither is present, skip to Step 4.

3.5c. **Load Knowledge** (if `## Preload Knowledge` section is present):
      For each keyword in the list:
      1. Search **all subfolders and files** under `{WORKSPACE}/copilot/knowledge/**`
         recursively. A file is a match if **either**:
         - The name of any **ancestor folder** in its path contains the keyword, or
         - The **filename** (without extension) contains the keyword.
         Matching is case-insensitive and partial (substring) is allowed.
      2. Read all matched `*.md` files.
      3. Summarise the loaded content into session memory under
         `/memories/session/preloaded_knowledge.md`, appending if the file
         already exists from a prior preload in this session.

3.5d. **Load Experience** (if `## Preload Experience` section is present):
      For each keyword in `preload-experience`:
      1. Search `{WORKSPACE}/copilot/experience/**/*.exp.md` for files whose
         `topics:` frontmatter list or filename contains the keyword
         (case-insensitive).
      2. Read the matching experience files.
      3. Summarise the loaded content into session memory under
         `/memories/session/preloaded_experience.md`, appending if the file
         already exists.

3.5e. After loading, print a brief preload summary before the delegation
      banner, for example:
      ```
      [skill-delegate] preloaded knowledge: overview (matched: 00_overview), modules (matched: 02_modules)
      [skill-delegate] preloaded experience: build, module-lifecycle
      ```
      If a keyword matched no files, note it as "(no match)" rather than
      failing.

---

### Step 4 — Delegate to a Subagent

4a. Read the **full content** of the selected `*.skill.md` file (already read
    in Step 3.5a if preloading ran; do not re-read).

4b. Launch a new subagent with:
    - The full text of the selected skill file as the system/context prompt.
    - The original user request forwarded verbatim.
    - The current workspace root so the subagent can resolve paths.

4c. Stream the subagent's response back to the user without modification.

### Step 5 — Post-Delegation

After the subagent completes:

- Note in the session cache (as a comment) which skill was last used and
  when, so future requests in the same session can up-weight that skill.
- Do **not** write anything to user or repo memory.

---

## Error Handling

| Situation                                  | Action                                                              |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Neither skills folder exists               | Inform the user; suggest creating `{WORKSPACE}/copilot/skills/`     |
| No `*.skill.md` files found               | Inform the user; offer to scaffold a skill file                     |
| Selected skill file unreadable             | Skip it, try next-best candidate, warn user                         |
| Cache file corrupt / unparseable           | Delete it and rebuild from scratch                                  |
| `preload-knowledge` keyword matches nothing | Note "(no match)" in preload summary; continue delegation          |
| `preload-experience` keyword matches nothing | Note "(no match)" in preload summary; continue delegation         |

---

## Output Format

- Before delegating, print a one-line banner:
  ```
  [skill-delegate] → delegating to: <skill-name> (<file-path>)
  ```
- Then output the subagent result directly.
- Do **not** add extra summaries or preamble beyond the banner.
