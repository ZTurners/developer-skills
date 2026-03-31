'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { addSkill, listSkills, getSkill } = require('../src/index');

// ── listSkills ──────────────────────────────────────────────────────────────

describe('listSkills', () => {
  it('returns a non-empty array of skill names', () => {
    const skills = listSkills();
    assert.ok(Array.isArray(skills));
    assert.ok(skills.length > 0);
  });

  it('includes the built-in skills: react, typescript, node', () => {
    const skills = listSkills();
    assert.ok(skills.includes('react'));
    assert.ok(skills.includes('typescript'));
    assert.ok(skills.includes('node'));
  });
});

// ── getSkill ────────────────────────────────────────────────────────────────

describe('getSkill', () => {
  it('returns metadata for a known skill', () => {
    const skill = getSkill('node');
    assert.ok(skill);
    assert.equal(skill.name, 'node');
    assert.ok(typeof skill.description === 'string' && skill.description.length > 0);
    assert.ok(Array.isArray(skill.files) && skill.files.length > 0);
  });

  it('returns undefined for an unknown skill', () => {
    assert.equal(getSkill('nonexistent'), undefined);
  });
});

// ── addSkill ────────────────────────────────────────────────────────────────

describe('addSkill', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dev-skills-test-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('throws for an unknown skill', () => {
    assert.throws(
      () => addSkill('nonexistent', tmpDir, { log: () => {} }),
      /Unknown skill "nonexistent"/
    );
  });

  it('adds node skill files to an empty directory', () => {
    const dest = fs.mkdtempSync(path.join(tmpDir, 'node-'));
    const logs = [];
    const { added, skipped } = addSkill('node', dest, { log: (m) => logs.push(m) });

    assert.ok(added.length > 0, 'expected at least one file to be added');
    for (const f of added) {
      assert.ok(fs.existsSync(path.join(dest, f)), `expected ${f} to exist`);
    }
  });

  it('skips files that already exist', () => {
    const dest = fs.mkdtempSync(path.join(tmpDir, 'node-skip-'));
    // First add – should add files
    addSkill('node', dest, { log: () => {} });
    // Second add – all files already exist
    const { added, skipped } = addSkill('node', dest, { log: () => {} });
    assert.equal(added.length, 0, 'no new files should be added');
    assert.ok(skipped.length > 0, 'some files should be skipped');
  });

  it('adds typescript skill files to an empty directory', () => {
    const dest = fs.mkdtempSync(path.join(tmpDir, 'ts-'));
    const { added } = addSkill('typescript', dest, { log: () => {} });
    assert.ok(added.length > 0, 'expected at least one typescript file to be added');
  });

  it('adds react skill files to an empty directory', () => {
    const dest = fs.mkdtempSync(path.join(tmpDir, 'react-'));
    const { added } = addSkill('react', dest, { log: () => {} });
    assert.ok(added.length > 0, 'expected at least one react file to be added');
  });
});
