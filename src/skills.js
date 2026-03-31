'use strict';

/**
 * Registry of available developer skill repositories.
 * Each skill includes metadata and a list of template files
 * that will be added to the user's project.
 */
const SKILLS = {
  react: {
    name: 'react',
    description: 'React application skill – adds a minimal React project structure',
    files: [
      'src/App.jsx',
      'src/index.jsx',
      'public/index.html',
      '.gitignore',
    ],
  },
  typescript: {
    name: 'typescript',
    description: 'TypeScript skill – adds tsconfig and type definitions',
    files: [
      'tsconfig.json',
      'src/index.ts',
      '.gitignore',
    ],
  },
  node: {
    name: 'node',
    description: 'Node.js skill – adds a minimal Node.js project structure',
    files: [
      'src/index.js',
      '.gitignore',
      '.env.example',
    ],
  },
};

/**
 * Returns the list of all available skill names.
 * @returns {string[]}
 */
function listSkills() {
  return Object.keys(SKILLS);
}

/**
 * Returns the metadata for a given skill, or undefined if not found.
 * @param {string} name
 * @returns {{ name: string, description: string, files: string[] } | undefined}
 */
function getSkill(name) {
  return SKILLS[name];
}

module.exports = { listSkills, getSkill };
