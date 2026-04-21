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
| `session-to-experience` | [session-to-experience](skills/session-to-experience/SKILL.md) | Extracts reusable knowledge from the current session and saves it into `*.exp.md` experience files |
| `project-to-knowledge` | [project-to-knowledge](skills/project-to-knowledge/SKILL.md) | Generates structured Markdown knowledge docs for a project, or loads existing knowledge into the session |
| `skill-delegate` | [skill-delegate](skills/skill-delegate/SKILL.md) | Discovers project-specific skills under `copilot/skills/`, selects the best match, and delegates to it via subagent |
| `common` | [common](skills/common/memory_policy.instruction.md) | Shared memory policy instruction used across other skills |

## Concepts

See [skills/README.md](skills/README.md) for a full explanation of **Knowledge**, **Experience**, and **Memory** — the three pillars of the Copilot support system used by these skills.

---

## Usage Examples

### Save the current session as experience

```
save exp
```
```
update exp about authentication and caching
```

### Learn from past experience

```
learn from experience about database migrations
```
```
recall experience about build errors
```

### Generate knowledge for this project

```
update knowledge
```
```
generate knowledge for this project
```

### Load project knowledge into the session

```
learn from knowledge
```
```
load knowledge — just the build and API sections
```

### Delegate to a project-specific skill

```
build the auth module
```
```
run the linter and fix all warnings
```
> `skill-delegate` picks the best matching skill from `copilot/skills/` automatically.
> If the selected skill declares `## Preload Knowledge` or `## Preload Experience`
> sections, the relevant files are loaded into the session before delegation.

test3


test
test2
test3