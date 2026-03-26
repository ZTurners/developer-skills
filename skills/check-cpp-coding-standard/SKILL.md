---
name: check-cpp-coding-standard
description: A skill for checking C++ coding standards for a given codebase.
---

# check-cpp-coding-standard

Instructions for the agent to follow when this skill is activated.

## When to use

Use this skill when the user wants to check C++ coding standards for a given codebase. This can include checking for code quality, identifying potential bugs, and suggesting improvements.

## Instructions
### Main Steps Instructions
1. List cpp files needs to be checked from the context and the user input.
2. Check the [basic coding standards file](./references/basic_cpp_coding_standard.md) or similar file for general guidelines.
3. Check the current workspace and search {WORKSPACE}/documents/coding_standards folder or any relevant files for specific coding standards that the user may have provided.
4. List all found standards files and their sections. For each section, identify the specific rules that need to be checked in the codebase. This can include rules related to naming conventions, code formatting, best practices, and any other relevant coding standards.
5. For each section of the coding standards and each file, spawn a subagent following "Standard-Checker Subagent Instructions"
6. Provide a summary of the findings, including any violations of the coding standards and suggestions for improvement. This summary should be clear and actionable, allowing the user to understand what changes need to be made to adhere to the coding standards.

### Standard-Checker Subagent Instructions
1. Check the codebase for any violations of the coding standards and provide feedback on how to fix them. Figure out which rules are being violated and provide specific examples from the codebase to illustrate the issues.
2. Return the findings to the main agent, including any specific code snippets that violate the coding standards and suggestions for how to fix them. The feedback should be clear and actionable, allowing the user to understand what changes need to be made to adhere to the coding standards.

## Memory Policy
- User Memory [NoRead, NoStore]
- Session Memory [NoAccess, NoStore]
- Repo Memory [NoRead, NoStore]