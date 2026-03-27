---
name: session-to-experience
description: "Saves or stores the current session into experience knowledge files (*.exp.md). Use when the user asks to save exp for the current session, conversation, learnings, QA, or solutions into copilot/experience files."
---
# generate-experience

Review the current session, extract reusable knowledge by topic, match that
knowledge to existing experience files when possible, ask the user to confirm
the proposed updates, and then update or create the approved `.exp.md` files.

## When to use

Use this skill when the user asks for any of the following:

- Save or store the current session.
- Persist the current discussion as experience or knowledge.
- Convert the current conversation into reusable how-to notes.
- Update or create `.exp.md` files from the current session.
- Save learnings into `copilot/experience` files.

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

Find the most likely storage location in this priority order:

1. A path explicitly named by the user.
2. `{WORKSPACE}/copilot/experience/`
3. `{WORKSPACE}/exp/knowledge/`
4. `{WORKSPACE}/exp/knowledage/`
5. Any workspace folder that already contains `*.exp.md` files.

If no suitable folder exists, propose a new folder path and ask the user to
confirm it together with the file update plan.

### Step 3 - Find Candidate Experience Files

Search the chosen experience folder for `*.exp.md` files.

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
- Which file each topic will update, or the new file that will be created.
- The target experience folder if it had to be inferred or created.

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

- Name it using a clear kebab-case topic name, for example
  `python-env-debugging.exp.md`.
- Fill all three required parts: topic heading and description, `## How to`,
  and `## QA`.

### Step 8 - Report the Result

After writing the approved files, report:

- Which files were updated.
- Which files were created.
- A one-line summary of the topics stored.

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
  File: <existing-file.exp.md | new-file.exp.md>
  Action: <update | create>
  Summary: <one line>

Please confirm whether to proceed with these experience file changes.
```

Use this format after completion:

```md
Experience files updated

- Updated: <file>
- Created: <file>

Stored topics: <topic 1>, <topic 2>
```
