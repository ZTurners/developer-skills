# dev-skills

Skill repositories for developers, installable via `npx`.

## Usage

```bash
# Add a skill to your project
npx dev-skills add <skill>

# List all available skills
npx dev-skills list

# Show help
npx dev-skills help
```

## Available Skills

| Skill        | Description                                                    |
|--------------|----------------------------------------------------------------|
| `react`      | Adds a minimal React project structure                         |
| `typescript` | Adds a `tsconfig.json` and a starter TypeScript source file    |
| `node`       | Adds a minimal Node.js project structure with an HTTP server   |

## Examples

```bash
# Scaffold a React project
npx dev-skills add react

# Add TypeScript configuration
npx dev-skills add typescript

# Scaffold a Node.js project
npx dev-skills add node
```

Running `add` copies the skill's template files into the current directory.
Files that already exist are skipped without being overwritten.

## Development

```bash
npm test
```
