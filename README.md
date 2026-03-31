# dev-skills

A collection of reusable GitHub Copilot skills for VS Code.

## Installation

Use [`npx skills`](https://www.npmjs.com/package/skills) to install all skills from this repository. It automatically detects your installed coding agents and installs into the correct directories.

```bash
npx skills add git@github.com:ZTurners/developer-skills.git
```

To install a specific skill by name:

```bash
npx skills add git@github.com:ZTurners/developer-skills.git --skill session-to-experience
```

To list available skills without installing:

```bash
npx skills add git@github.com:ZTurners/developer-skills.git --list
```

## Available Skills

| Skill | Name | Description |
|-------|------|-------------|
| session-to-experience | `session-to-experience` | Extracts reusable knowledge from the current session and saves it into `*.exp.md` experience files |
| common | `common` | Shared memory policy instruction used across other skills |