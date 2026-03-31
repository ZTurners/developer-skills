#!/usr/bin/env node
'use strict';

const path = require('path');
const { addSkill, listSkills } = require('../src/index');

const [,, command, skillName] = process.argv;

function printHelp() {
  console.log(`
Usage: dev-skills <command> [skill]

Commands:
  add <skill>   Add a skill repository to the current directory
  list          List all available skills
  help          Show this help message

Available skills:
  ${listSkills().join(', ')}

Examples:
  npx dev-skills add react
  npx dev-skills add typescript
  npx dev-skills add node
  npx dev-skills list
`);
}

function printList() {
  const skills = listSkills();
  console.log('Available skills:\n');
  const { getSkill } = require('../src/skills');
  for (const name of skills) {
    const skill = getSkill(name);
    console.log(`  ${name.padEnd(14)} ${skill.description}`);
  }
  console.log();
}

switch (command) {
  case 'add': {
    if (!skillName) {
      console.error('Error: please specify a skill name.\n');
      printHelp();
      process.exit(1);
    }
    const targetDir = process.cwd();
    console.log(`\nAdding skill "${skillName}" to ${targetDir} ...\n`);
    try {
      const { added, skipped } = addSkill(skillName, targetDir);
      if (added.length === 0 && skipped.length > 0) {
        console.log('\nAll files already exist – nothing was added.');
      } else {
        console.log(`\nDone. ${added.length} file(s) added, ${skipped.length} skipped.`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
    break;
  }

  case 'list':
    printList();
    break;

  case undefined:
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;

  default:
    console.error(`Unknown command "${command}".\n`);
    printHelp();
    process.exit(1);
}
