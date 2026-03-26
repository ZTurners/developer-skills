---
name: check-cpp-coding-standard
description: A skill for checking C++ coding standards for a given codebase.
---

# check-cpp-coding-standard

Instructions for the agent to follow when this skill is activated.

## When to use
Use this skill when the user wants to check C++ coding standards for a given codebase. This can include checking for code quality, identifying potential bugs, and suggesting improvements.

## Memory Policy
- User Memory [NoAccess, NoStore]
- Session Memory [NoAccess, NoStore]
- Repo Memory [NoAccess, NoStore]

## Constraints
- Do not make broad refactors unless the user explicitly asks.
- Do not change unrelated files.
- Do not prioritize formatting over correctness/safety findings.
- Do not approve code that violates project-critical style or ownership rules.

## Instructions
0. Following the "Memory Policy" specified above
1. Check the [basic coding standards file](./references/basic_cpp_coding_standard.md) or similar file for general guidelines.
2. Check the current workspace and search {WORKSPACE}/documents/coding_standards folder or any relevant files for specific coding standards that the user may have provided.
3. List all found standards files and their sections. For each section, identify the specific rules that need to be checked in the codebase. This can include rules related to naming conventions, code formatting, best practices, and any other relevant coding standards.
4. List cpp files needs to be checked from the context and the user input.
5. Spawn one subagent for each file. The subagent will be responsible for checking the specific coding standards against the code in the file and providing feedback on any violations or areas for improvement.
6. Provide a summary of the findings, including any violations of the coding standards and suggestions for improvement. This summary should be clear and actionable, allowing the user to understand what changes need to be made to adhere to the coding standards.

## Output Format
Findings (highest severity first)
- Open questions / assumptions
- Suggested patch summary
- Validation run (what was checked, what was not)
- *DO NOT* only provide ambiguous feedback like following:
  - "18 files have naming convention issues" (fix: list the specific files and lines, and broken rule sections in which standard file).