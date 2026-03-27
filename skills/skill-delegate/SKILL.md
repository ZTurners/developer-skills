---
name: skill-delegate
description: >
  Detects when the user is operating in an ArieoEngine context (by repository
  name, cwd, or explicit mention of "ArieoEngine") and automatically discovers,
  caches, and delegates to the most relevant sub-skill found in
  {WORKSPACE}/document[s]/**/*.skill.md. USE FOR: any ArieoEngine operation
  or action when inside the ArieoEngine repository. DO NOT USE FOR: general
  coding questions unrelated to ArieoEngine.
applyTo: "**"
---
# skill-delegate

A dispatch skill that discovers ArieoEngine sub-skills at runtime, caches
their metadata, selects the best match for the current request, and runs it
in a subagent.

---

## When to use

Activate this skill whenever **any** of the following is true:

- The user mentions "ArieoEngine" in their request.
- The current workspace / repository is the ArieoEngine repository.
- The user asks for an operation and the workspace contains a
  `documents/skills/` folder (ArieoEngine convention).

---

## Memory Policy

- User Memory [NoAccess, NoStore]
- Session Memory [Read, Store]  ← used for the skill-header cache
- Repo Memory [NoAccess, NoStore]

---

## Skill-Header Cache Format (Session Memory)

Cache is stored at `/memories/session/arieo_skill_cache.md`.

```
# ArieoEngine Skill Header Cache
_last_indexed: <ISO-8601 timestamp of the cache build>

## <relative-path-to-skill-file>
last_modified: <ISO-8601 mtime of the file when last read>
<verbatim YAML frontmatter block copied from the file>
```

Example entry:

```
## documents/skills/build-module.skill.md
last_modified: 2026-03-20T10:15:00Z
---
name: build-module
description: Builds a single ArieoEngine module from source.
triggers: [build, compile, make]
---
```

---

## Instructions

Follow every numbered step in order.

### Step 0 — Load Memory Policy

Re-read the Memory Policy section above before doing anything else.

### Step 1 — Confirm ArieoEngine Context

Check at least one of:

- Repository name or current working directory contains "ArieoEngine"
  (case-insensitive).
- User's request explicitly references "ArieoEngine".
- A `documents/skills/` folder exists at the workspace root.

If none of the above is true, **stop** and respond:

> "This skill applies only to ArieoEngine repositories. No ArieoEngine
> context was detected."

### Step 2 — Load the Skill-Header Cache

2a. Attempt to read `/memories/session/arieo_skill_cache.md`.

2b. For every `*.skill.md` file found in
    `{WORKSPACE}/documents/skills/` (recursive), do:
    - Read the **actual** last-modified timestamp of the file from the
      filesystem (use `stat` or equivalent).
    - Compare it against the `last_modified` value in the cache for that file.
    - If the file is **new** or the **mtime differs**, re-read the YAML
      frontmatter block (everything between the first `---` and the closing
      `---`) and update that entry in the cache.
    - Remove cache entries for files that no longer exist.

2c. Save the updated cache back to `/memories/session/arieo_skill_cache.md`.

### Step 3 — Select the Best Skill

3a. Build a candidate list from the cache. Each candidate has:
    `name`, `description`, optional `triggers` array, and file path.

3b. Score each candidate against the user's request:
    - **+3** for each word in `triggers` that appears in the user's request
      (case-insensitive).
    - **+2** if the `name` appears in the user's request.
    - **+1** for semantic overlap between `description` and the request.

3c. Pick the candidate with the highest score.

3d. If two candidates tie, prefer the one whose `name` most closely matches a
    keyword the user used.

3e. If **no** candidate scores above 0, list the top-3 candidates by
    description similarity and ask the user to confirm which one to use.

### Step 4 — Delegate to a Subagent

4a. Read the **full content** of the selected `*.skill.md` file.

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

| Situation                            | Action                                          |
| ------------------------------------ | ----------------------------------------------- |
| `documents/skills/` folder missing | Inform the user; suggest they create it         |
| No `*.skill.md` files found        | Inform the user; offer to scaffold a skill file |
| Selected skill file unreadable       | Skip it, try next-best candidate, warn user     |
| Cache file corrupt / unparseable     | Delete it and rebuild from scratch              |

---

## Output Format

- Before delegating, print a one-line banner:
  ```
  [arieo-engine-skill-delegate] → delegating to: <skill-name> (<file-path>)
  ```
- Then output the subagent result directly.
- Do **not** add extra summaries or preamble beyond the banner.
