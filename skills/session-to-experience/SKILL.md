---
name: session-to-experience
description: "Saves or stores the current session into experience knowledge files (*.exp.md). Use when the user asks to save exp, learn from experience, share experience, or store the current session, conversation, learnings, QA, or solutions into copilot/experience files."
---
# session-to-experience

Review the current session, extract reusable knowledge by topic, match that
knowledge to existing experience files when possible, ask the user to confirm
the proposed updates, and then update or create the approved `.exp.md` files.
Also supports learning from existing experience files and advising on sharing.

## When to use

Use this skill when the user asks for any of the following:

- Save or store the current session.
- Persist the current discussion as experience or knowledge.
- Convert the current conversation into reusable how-to notes.
- Update or create `.exp.md` files from the current session.
- Save learnings into `copilot/experience` files.
- Learn from experience, review past experience, or recall knowledge.
- Share experience files with others.

## Memory Policy

- User Memory [NoAccess, NoStore]
- Session Memory [Read, NoStore]
- Repo Memory [NoAccess, NoStore]

## Constraints

- Do not write any experience file until the user confirms the proposed
  updates and creates.
- Before confirmation, only inspect candidate experience file headers and short
  introductions. Do not fully read unrelated files.
- Prefer updating an existing topic file over creating a duplicate topic file.
- Keep stored content durable and reusable. Remove purely transient details
  unless they are required to understand the solution.
- Preserve existing user-written content whenever possible. Merge carefully
  instead of replacing whole files.
- If one session covers multiple topics, update multiple files.
- New experience files are **always** created in
  `copilot/experience/.local/`. No exceptions.
- When searching for experience files, always search the full tree
  `copilot/experience/**/*.exp.md` which includes the `.local/` subfolder.

## Instructions

Follow every numbered step in order.

### Step 0 - Apply Memory Policy

Re-read the Memory Policy section above before proceeding.

### Step 1 - Review the Current Session

Review the current conversation and extract:

- Main topics discussed or worked on.
- Tasks performed.
- Problems encountered.
- Solutions, fixes, or decisions reached.
- Useful concept questions and answers.

Convert the session into a short topic list. Each topic should have:

- A topic name.
- A one-line description.
- A draft list of how-to steps.
- A draft QA list.

If the session does not contain durable knowledge worth storing, stop and tell
the user there is nothing substantial to save yet.

### Step 2 - Locate the Experience Folder

New experience files are **always** created in:

    {WORKSPACE}/copilot/experience/.local/

This keeps created files local to the user. There are no exceptions — even if
the user names a different path, still place the file inside `.local/`.

If the `.local/` folder does not exist yet, create it automatically before
writing the first file.

For **searching** existing experience files (used by Steps 3 and the
"Learn from experience" flow), always search:

    {WORKSPACE}/copilot/experience/**/*.exp.md

This includes both shared files in `copilot/experience/` and local files in
`copilot/experience/.local/`.

### Step 3 - Find Candidate Experience Files

Search `{WORKSPACE}/copilot/experience/**/*.exp.md` (including `.local/`).

For each topic from Step 1:

1. Find candidate files whose filename or header appears related to the topic.
2. Read only the file head needed for matching, usually the first 20 to 40
   lines.
3. Match using only lightweight signals:
   - Filename such as `<topic>.exp.md`
   - Frontmatter `name` or `description` if present
   - First heading
   - One-line description under the heading

Do not fully read all experience files at this step.

### Step 4 - Choose Update vs Create

For each extracted topic, decide one of the following:

- Update an existing `.exp.md` file because the topic clearly matches.
- Create a new `.exp.md` file because no existing file is a good fit.

Prefer a single best match. Avoid spreading the same topic across multiple
files unless the user explicitly asks for that.

### Step 5 - Ask for User Confirmation

Before making any file changes, present a concise plan to the user that
includes:

- The extracted topics.
- The full path of each file (always under `copilot/experience/.local/`)
  that will be updated or created.
- Whether the `.local/` folder needs to be created.

Ask the user to confirm the update/create plan.

If the user changes the mapping, file names, or topic split, follow the user's
instruction and then proceed.

### Step 6 - Read Only Approved Target Files

After the user confirms:

- Fully read only the existing experience files that were approved for update.
- Do not read unrelated experience files.

### Step 7 - Update or Create the Experience Files

Write each approved topic into its target `.exp.md` file.

The required experience file structure is:

```md
# <Topic Name>

<Short description of the topic and what the file is about>

## How to

<Describe how to handle this kind of task based on the session>

## QA

- Q: <Problem, question, or issue>
  A: <Resolution, answer, or fix>
```

When updating an existing file:

- Keep the topic heading unless it is clearly wrong.
- Refresh the short description if the existing one is weak or missing.
- Merge new procedural knowledge into `## How to`.
- Merge new problems and answers into `## QA`.
- Deduplicate repeated points.
- Preserve useful existing material.

When creating a new file:

- **Always** place it in `copilot/experience/.local/`. No exceptions.
  If the `.local/` folder does not exist, create it first.
- Name it using a clear kebab-case topic name, for example
  `copilot/experience/.local/python-env-debugging.exp.md`.
- Fill all three required parts: topic heading and description, `## How to`,
  and `## QA`.

### Step 8 - Report the Result

After writing the approved files, report:

- Which files were updated.
- Which files were created.
- A one-line summary of the topics stored.

---

## Learn from Experience

When the user wants to learn from or recall existing experience, follow this
flow instead of the save flow above.

### L1 - Get the Keyword

If the user did not provide a keyword or topic, ask:

> What keyword or topic would you like to search for in experience files?

Proceed once you have at least one keyword.

### L2 - Search Experience Filenames

Search `{WORKSPACE}/copilot/experience/**/*.exp.md` (including `.local/`)
for filenames that contain or relate to the keyword. List every matching file
with its relative path.

If no files match, tell the user and stop.

### L3 - Ask the User to Confirm Which Files to Load

Present the matching filenames and ask which ones to load. The user may:

- Pick specific files by number or name.
- Answer **"all"** to approve loading every matched file.

Do not read any file until the user confirms.

### L4 - Load and Present the Approved Files

Fully read only the approved files. Present their content to the user in a
clear, readable format so they can learn from it.

---

## Sharing Experience

When the user asks how to share experience files with others, respond with
the following guidance and **do not perform any file operations**:

> To share an experience file, move it from
> `copilot/experience/.local/` to `copilot/experience/`.
> Files in `copilot/experience/` (outside `.local/`) are visible to everyone
> who has access to the repository. Files in `.local/` stay local to you.

---

## Content Rules

- Store reusable knowledge, not a raw transcript.
- Rewrite session details into concise, durable guidance.
- Prefer direct instructions in `## How to`.
- Put concrete issues, troubleshooting steps, and concept clarifications in
  `## QA`.
- If a topic has no useful QA from the session, add only the meaningful items;
  do not invent filler questions.

## Output Format

Use this format before confirmation:

```md
Proposed experience updates

- Topic: <topic>
  File: <copilot/experience/.local/new-file.exp.md | copilot/experience/.local/existing-file.exp.md>
  Action: <update | create>
  Summary: <one line>

Please confirm whether to proceed with these experience file changes.
```

Use this format after completion:

```md
Experience files updated

- Updated: <copilot/experience/.local/file.exp.md>
- Created: <copilot/experience/.local/file.exp.md>

Stored topics: <topic 1>, <topic 2>
```
