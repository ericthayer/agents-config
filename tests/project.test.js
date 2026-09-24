import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { detectFrameworks, stackForFramework, validateConfig, resolveProject, validatePreset } from '../packages/core/src/project.js';
import { buildPlan } from '../packages/core/src/generate.js';

const repo = fileURLToPath(new URL('../', import.meta.url));
function consumer(t, dependencies, config) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-project-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies }));
  fs.symlinkSync(path.join(repo, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  if (config) fs.writeFileSync(path.join(dir, '.agents-project.json'), JSON.stringify(config));
  return dir;
}

test('framework families preserve React aliases and recognize Angular/Vue', () => {
  assert.equal(stackForFramework('next'), 'react');
  assert.equal(stackForFramework('angular'), 'angular');
  assert.equal(stackForFramework('vue'), 'vue');
  assert.equal(stackForFramework('nuxt'), null);
  assert.deepEqual(detectFrameworks({ dependencies: { '@angular/core': '^20.0.0' } }), ['angular']);
  assert.deepEqual(detectFrameworks({ dependencies: { vue: '^3.5.0', nuxt: '^4.0.0' } }), ['nuxt']);
});

test('legacy config preserves custom fields and rejects invalid boundaries', () => {
  const config = { version: '1.1.0', project: { name: 'Example', framework: 'react' }, overrides: { x: 1 } };
  assert.deepEqual(validateConfig(config), config);
  assert.throws(() => validateConfig({ ...config, project: { stack: 'unknown' } }), /stack/);
  assert.throws(() => validateConfig({ ...config, agents: 'copilot' }), /agents/);
  assert.throws(() => validateConfig({ ...config, rules: { include: ['../escape'] } }), /rule/);
  assert.throws(() => validateConfig({ ...config, project: { ...config.project, styling: {} } }), /styling/);
  assert.throws(() => validateConfig({ ...config, agents: ['__proto__'] }), /agents/);
});

test('legacy installation defaults to React regardless of bin owner', async t => {
  const projectDir = consumer(t, { 'agents-config': '1.5.0', react: '^19' });
  const project = await resolveProject({ projectDir });
  assert.equal(project.stack, 'react');
  assert.equal(project.framework, 'react');
});

test('multiple declared presets require selection, then honor persisted config', async t => {
  const projectDir = consumer(t, { '@agents-config/react': '1.5.0', '@agents-config/vue': '1.5.0' });
  await assert.rejects(resolveProject({ projectDir }), /Multiple presets/);
  assert.equal((await resolveProject({ projectDir, stack: 'react' })).stack, 'react');
  fs.writeFileSync(path.join(projectDir, '.agents-project.json'), JSON.stringify({
    version: '1.1.0', project: { name: 'Existing', framework: 'next' }
  }));
  assert.equal((await resolveProject({ projectDir })).stack, 'react');
});

test('dependency mismatch and unsupported Nuxt fail unattended', async t => {
  const projectDir = consumer(t, { '@agents-config/react': '1.5.0', vue: '^3.5' });
  await assert.rejects(resolveProject({ projectDir }), /Detected vue/);
  assert.equal((await resolveProject({ projectDir, confirmMismatch: async () => true })).stack, 'react');
});

test('invalid or missing selection fails without downloading a package', async t => {
  const projectDir = consumer(t, {});
  await assert.rejects(resolveProject({ projectDir }), /No preset declared/);
  await assert.rejects(resolveProject({ projectDir, stack: '../unknown' }), /Unknown stack/);
});

test('descriptor asset names cannot escape package boundaries', () => {
  assert.throws(() => validatePreset({ id: 'react', root: repo, frameworks: { react: 'React' },
    rules: ['../bad'], skills: [], instructions: [], features: {} }, 'react'), /Invalid preset rules/);
});

test('preset frameworks must belong to the selected stack family', () => {
  assert.throws(() => validatePreset({ id: 'vue', root: repo, frameworks: { vue: 'Vue', react: 'React' },
    rules: [], skills: [], instructions: [], features: {} }, 'vue'), /frameworks/);
});

test('malformed consumer package metadata fails at the file boundary', async t => {
  const projectDir = consumer(t, { '@agents-config/react': '1.5.0' });
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ name: 42 }));
  await assert.rejects(resolveProject({ projectDir }), /package.json name/);
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({ dependencies: [] }));
  await assert.rejects(resolveProject({ projectDir }), /package.json dependencies/);
});

test('resolved consumers without package names can generate and retain local rules', async t => {
  const projectDir = consumer(t, { '@agents-config/react': '1.5.0' });
  const resolved = await resolveProject({ projectDir });
  assert.equal(buildPlan(resolved).config.project.name, path.basename(projectDir));
  fs.mkdirSync(path.join(projectDir, '.agents/rules'), { recursive: true });
  fs.writeFileSync(path.join(projectDir, '.agents/rules/team-policy.md'), 'Keep my policy unchanged.');
  fs.writeFileSync(path.join(projectDir, '.agents-project.json'), JSON.stringify({
    version: '1.1.0', project: { name: 'Custom', framework: 'react' },
    rules: { include: ['team-policy'] }
  }));
  const next = await resolveProject({ projectDir });
  assert.ok(buildPlan(next).config.rules.include.includes('team-policy'));
});
