---
name: check-cpp-coding-standard
description: A skill for checking C++ coding standards for a given codebase.
---

# check-cpp-coding-standard

Instructions for the agent to follow when this skill is activated.

## When to use

Use this skill when the user wants to check C++ coding standards for a given codebase. This can include checking for code quality, identifying potential bugs, and suggesting improvements.

## Instructions

1. Check the basic coding standards file in {SKILL_FOLDER}/references/basic_cpp_coding_standards.md
2. Check the current workspace and search {WORKSPACE}/documents/coding_standards folder or any relevant files for specific coding standards that the user may have provided.
3. Check the codebase for any violations of the coding standards and provide feedback on how to fix them. Figure out which rules are being violated and provide specific examples from the codebase to illustrate the issues.
4. Provide a summary of the findings and suggest improvements to the codebase based on the coding standards.
