---
name: project-to-knowledge
description: "Generates or updates knowledge documentation for a project, or loads existing knowledge into the session. Use when the user asks to update knowledge, generate knowledge, document the project, index the codebase, learn from knowledge, or recall project knowledge."
---

# project-to-knowledge

Scan the project in {WORKSPACE}, generate structured Markdown knowledge files
organized by subsystem, save them under `{WORKSPACE}/copilot/knowledge/{ProjectName}/`,
and optionally load that knowledge into the current session.

See [skills/README.md](../../README.md) for the definition of **Knowledge**,
**Experience**, and **Memory** that this skill operates within.

## When to use

Use this skill when the user asks for any of the following:

- Update knowledge, generate knowledge, or document the project.
- Index the codebase or produce a reference for the AI agent.
- Learn from knowledge, load knowledge, or recall project knowledge into the
  current session.

## Memory Policy

- User Memory [NoAccess, NoStore]
- Session Memory [Read, Store]
- Repo Memory [NoAccess, NoStore]

---

## Mode A — Update Knowledge

Triggered when the user asks to update, generate, or refresh project knowledge.

### Step 0 — Apply Memory Policy

Re-read the Memory Policy section above before proceeding.

### Step 1 — Identify the Project

1. Determine `{ProjectName}` from the workspace root folder name, any
   top-level `package.json` / `*.csproj` / `pyproject.toml` / `Cargo.toml`
   name field, or ask the user if ambiguous.
2. Confirm the target output path:

       {WORKSPACE}/copilot/knowledge/{ProjectName}/

### Step 2 — Scan the Project Structure

Explore the workspace to understand:

- Top-level folder layout (source, tests, docs, config, scripts, assets).
- Primary language(s) and framework(s).
- Entry points and build artifacts.
- Major subsystems, modules, and their dependencies.
- Any existing `copilot/knowledge/` content to identify stale sections.

Prefer broad, shallow scans first. Read source files only enough to gather
architectural facts — do not read implementation detail unless it is needed
to describe the contract of a module.

### Step 3 — Design the Knowledge Index

Produce a folder plan that uses folder names as the search index.
Each folder name must be short, lowercase, and kebab-case so that an AI
agent can locate it by topic without reading every file.

Recommended layout (adapt to the actual project shape):

```
copilot/knowledge/{ProjectName}/
  00_overview/
    architecture.md       # high-level system map
    tech-stack.md         # languages, frameworks, tooling
  01_structure/
    folder-map.md         # what each top-level folder contains
    entry-points.md       # main executables, start scripts, APIs
  02_modules/
    <module-name>.md      # one file per major module (repeat as needed)
  03_build/
    build-system.md       # how to build, test, lint, package
    environment.md        # required env vars, prerequisites
  04_apis/
    <api-name>.md         # external or internal API contracts
  05_conventions/
    coding-style.md       # language conventions, naming rules
    patterns.md           # recurring design patterns in this codebase
```

Add, remove, or rename folders to match what the project actually contains.
The number prefix controls the load order when an agent reads the index
sequentially.

### Step 4 — Present the Plan

Before writing any files, show the user:

- The resolved `{ProjectName}` and output root path.
- The proposed folder/file list from Step 3.
- Which existing files (if any) will be overwritten.

Ask the user to confirm, adjust the structure, or cancel.

### Step 5 — Generate and Save Knowledge Files

After the user confirms:

1. Create the folder structure under
   `{WORKSPACE}/copilot/knowledge/{ProjectName}/`.
2. Write each `.md` file with factual, concise content derived from the scan.
3. Every file must begin with a level-1 heading that matches its purpose,
   followed by a short one-line summary of what the file covers.

File writing rules:

- All files must have the `.md` extension.
- Content must reflect the current state of the source code — no speculation.
- Keep each file focused on a single topic so agents can load only what they
  need.
- Cross-reference related files using relative Markdown links where useful.
- If a section has no relevant content in this project, skip the file rather
  than creating an empty placeholder.

### Step 6 — Record Session State

Write a brief note to session memory recording:

- The project name.
- The knowledge root path.
- The list of files written.

This allows a follow-up "learn from knowledge" request in the same session to
skip the scan and go directly to loading.

---

## Mode B — Learn from Knowledge

Triggered when the user asks to learn from, load, or recall project knowledge.

### Step 0 — Apply Memory Policy

Re-read the Memory Policy section above before proceeding.

### Step 1 — Locate the Knowledge Root

1. Check session memory for a previously recorded knowledge path from Mode A.
2. If not found, search the workspace for
   `{WORKSPACE}/copilot/knowledge/` and list available project folders.
3. If multiple projects exist, ask the user which project to load.
   If only one exists, use it automatically.

### Step 2 — Build the Topic Index

List all folders and files under the knowledge root without reading file
contents yet. Present the index to the user as a tree.

### Step 3 — Ask the User to Confirm Which Files to Load

Ask the user to confirm which files or folders to load. The user may:

- Answer **all** to approve loading every file in the index.
- Name specific folders or files to load only a subset.
- Apply a topic filter (e.g. "just load the build and API docs").

Do not read any file content until the user confirms.

### Step 4 — Load Knowledge into Session

Read the approved files in index order (numeric prefix first, then
alphabetically within each folder).

Loading rules:

- Read all approved `.md` files fully.
- After loading, write a compact summary to session memory noting which files
  were loaded and the key facts extracted from each.
- Confirm to the user which files were loaded and offer to answer questions
  based on the loaded knowledge.

Only load files whose folder or filename matches any topic filter confirmed
in Step 3.
