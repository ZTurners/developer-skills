'use strict';

const fs = require('fs');
const path = require('path');
const { listSkills, getSkill } = require('./skills');

/**
 * Adds a skill's template files to the target directory.
 *
 * @param {string} skillName  - Name of the skill to add.
 * @param {string} targetDir  - Absolute path to the directory to add files to.
 * @param {{ log?: (msg: string) => void }} [options]
 * @returns {{ added: string[], skipped: string[] }}
 */
function addSkill(skillName, targetDir, options = {}) {
  const log = options.log || console.log;
  const skill = getSkill(skillName);

  if (!skill) {
    const available = listSkills().join(', ');
    throw new Error(
      `Unknown skill "${skillName}". Available skills: ${available}`
    );
  }

  const skillTemplatesDir = path.join(__dirname, '..', 'skills', skillName);
  const added = [];
  const skipped = [];

  for (const relFile of skill.files) {
    const src = path.join(skillTemplatesDir, relFile);
    const dest = path.join(targetDir, relFile);

    if (!fs.existsSync(src)) {
      // Template file is not present in this installation – skip silently.
      skipped.push(relFile);
      continue;
    }

    if (fs.existsSync(dest)) {
      log(`  skip  ${relFile} (already exists)`);
      skipped.push(relFile);
      continue;
    }

    const destDir = path.dirname(dest);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    log(`  add   ${relFile}`);
    added.push(relFile);
  }

  return { added, skipped };
}

module.exports = { addSkill, listSkills, getSkill };
