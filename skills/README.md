# Copilot Design

This document explains the three concepts that make up the Copilot support
system in this workspace: **Knowledge**, **Experience**, and **Memory**.

---

## Knowledge

**Folder:** `copilot/knowledge/`  
**Format:** Plain Markdown (`.md`)  
**Tracked in git:** Yes  

Knowledge is a **curated, up-to-date description of the codebase**.
It answers the question *"what exists and how does it work?"*

- Written as reference documentation: architecture, APIs, module contracts,
  build system rules, platform support.
- Organized by system and layer (e.g. `00_core/`,
  `01_interfaces/`, `02_modules/`).
- Updated by the `update-knowledge` skill, which diffs the source tree against
  the last recorded commit and regenerates only the stale sections.
- Intended to be read by the AI agent at the start of any coding task so it
  understands the current state of the project without re-scanning source.

> Think of it as a living manual that always reflects the real source code.

---

## Experience

**Folder:** `copilot/experience/`  
**Format:** `*.exp.md` with YAML frontmatter  
**Tracked in git:** Shared files yes, personal `.local/` files no  

Experience is **accumulated procedural knowledge from development sessions**.
It answers the question *"what have we done, what went wrong, and how did we fix it?"*

- Written as QA pairs and how-to recipes: problems encountered, solutions
  found, step-by-step workflows.
- Created and updated by the `session-to-experience` skill at the end of a
  session, or on demand.
- Organized by topic, one file per topic (e.g. `update-skills.exp.md`).
- Each file carries a `topics:` list in its YAML frontmatter so it can be
  found and filtered by topic.
- **Can be loaded into an existing session by topic** — ask the agent to recall or
  load experience about a specific topic and it will read the matching
  `*.exp.md` files to prime itself before starting work.
- Split into two zones:
  - `copilot/experience/` — shared, committed, visible to the whole team.
  - `copilot/experience/.local/` — personal, gitignored, local to the developer.

> Think of it as a team wiki built up from real debugging sessions, not from
> upfront design. Load it at the start of a session to pick up where you left off.

---

## Memory

**Location:** `/memories/` (inside the AI agent tool system, not the repo)  
**Format:** Markdown managed by the agent  
**Tracked in git:** Never  

Memory is the **AI agent's own working scratch pad**. It is not part of the
repository. It answers the question *"what does the agent need to remember
right now, or across sessions?"*

Three scopes exist:

| Scope | Path | Lifetime | Purpose |
|-------|------|----------|---------|
| User | `/memories/` | Permanent, cross-workspace | User preferences, recurring patterns |
| Session | `/memories/session/` | Current conversation only | Task context, skill caches, in-progress notes |
| Repo | `/memories/repo/` | Workspace-scoped | Codebase conventions, verified build facts |

Skills write to Memory to cache intermediate state (e.g. the skill-header
cache used by `skill-delegate`) or to track progress within a task.

> Think of it as the agent's short- and long-term working memory — invisible
> to git, wiped per session, or persisted across all sessions depending on
> scope.

---

## Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                        Source Code                           │
└──────────────────────────┬───────────────────────────────────┘
                           │  update-knowledge skill reads
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  Knowledge  (copilot/knowledge/)                             │
│  What the codebase IS right now                              │
└──────────────────────────┬───────────────────────────────────┘
                           │  agent reads before coding tasks
                           │
┌──────────────────────────┴───────────────────────────────────┐
│                      AI Agent                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Memory  (/memories/)                                 │   │
│  │  Operational scratch pad — session / user / repo      │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────┬───────────────────────────────────────────────────┘
           │  session-to-experience          ▲
           │  skill writes                   │  loaded into session
           ▼                                 │  by topic on demand
┌──────────────────────────────────────────────────────────────┐
│  Experience  (copilot/experience/)                           │
│  What we LEARNED from working on it                          │
└──────────────────────────────────────────────────────────────┘
```

The agent reads **Knowledge** to understand the project, uses **Memory** as a
scratchpad while working, writes back to **Experience** at the end of a session
to preserve what was learned, and can reload **Experience** by topic at any
point to pick up prior context.

---

## Key Differences

| | Knowledge | Experience | Memory |
|---|---|---|---|
| **Question answered** | What is it? | What did we learn? | What does the agent need right now? |
| **Format** | Reference docs | QA + how-to recipes | Free-form agent notes |
| **Updated by** | `update-knowledge` skill (against source code) | `session-to-experience` skill (against conversation) | Agent inline, per skill |
| **Lifetime** | Persists, versioned with code | Persists, grows over time; loaded by topic on demand | Session or cross-session, never in git |
| **Scope** | Whole team | Team (shared) + personal (.local/) | Per-agent, per-scope |
| **Git tracked** | Yes | Shared yes / .local/ no | Never |

---

## Skills

Skills live in `copilot/skills/` and are the *procedures* that operate on
the three stores above. A skill is not knowledge itself — it is the
instruction set for *how to update or use* knowledge, experience, or memory.

| Skill | What it does |
|-------|-------------|
| `update-knowledge` | Syncs `copilot/knowledge/` against source code |
| `session-to-experience` | Saves session learnings into `copilot/experience/` |
| `update-skills` | Restores agent skills from `skills-lock.json` |
| `skill-delegate` | Discovers and routes to the best matching skill |
