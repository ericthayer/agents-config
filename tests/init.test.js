import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildPlan, writePlan } from '../packages/core/src/generate.js';
import react from '../packages/react/preset.js';
import { validateConfig } from '../packages/core/src/project.js';

function fixture(t) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-init-'));
  t.after(() => fs.rmSync(projectDir, { recursive: true, force: true }));
  return { projectDir, preset: react, stack: 'react', framework: 'react', config: null, packageJson: {} };
}

test('React generation keeps core rule names and all six adapter destinations', t => {
  const project = fixture(t);
  const plan = buildPlan(project, { agents: ['copilot', 'claude', 'cursor', 'gemini', 'codex', 'windsurf'] });
  assert.deepEqual(plan.config.rules.include, react.rules);
  for (const file of ['.github/copilot-instructions.md', 'CLAUDE.md', '.cursorrules', '.gemini/config.md', '.codex/AGENTS.md', '.windsurfrules']) {
    assert.ok(plan.files.some(entry => entry.relativePath === file));
  }
  assert.equal(plan.config.features.gemini, false, 'assistant choice is not SDK usage');
});

test('dry-run writes nothing; non-force preserves nested files and force updates only planned files', t => {
  const project = fixture(t);
  const plan = buildPlan(project, {});
  writePlan(project.projectDir, plan, { dryRun: true });
  assert.deepEqual(fs.readdirSync(project.projectDir), []);
  writePlan(project.projectDir, plan, {});
  const custom = path.join(project.projectDir, '.agents/skills/scaffold-component/SKILL.md');
  fs.writeFileSync(custom, 'my customization');
  fs.writeFileSync(path.join(project.projectDir, '.agents/custom.txt'), 'keep');
  writePlan(project.projectDir, plan, {});
  assert.equal(fs.readFileSync(custom, 'utf8'), 'my customization');
  writePlan(project.projectDir, plan, { force: true });
  assert.notEqual(fs.readFileSync(custom, 'utf8'), 'my customization');
  assert.equal(fs.readFileSync(path.join(project.projectDir, '.agents/custom.txt'), 'utf8'), 'keep');
});

test('config migration preserves overrides, exclusions, and custom names', t => {
  const project = fixture(t);
  project.config = { version: '1.1.0', project: { name: 'Custom', framework: 'react' },
    agents: ['claude'], rules: { include: ['react-19-compiler'], exclude: ['web-performance'] },
    overrides: { custom: true }, extra: 'keep' };
  const { config } = buildPlan(project, {});
  assert.equal(config.project.name, 'Custom');
  assert.equal(config.extra, 'keep');
  assert.deepEqual(config.overrides, { custom: true });
  assert.deepEqual(config.agents, ['claude']);
  assert.ok(!config.rules.include.includes('web-performance'));
  assert.ok(config.rules.include.includes('react-19-compiler'));
  assert.equal(config.project.stack, 'react');
  assert.equal(validateConfig(config), config);
});

test('missing required assets fail before any writes', t => {
  const project = fixture(t);
  project.preset = { ...react, rules: [...react.rules, 'missing-required-rule'] };
  assert.throws(() => buildPlan(project, {}), /missing-required-rule/);
  assert.deepEqual(fs.readdirSync(project.projectDir), []);
});

test('symlinked destinations are rejected before any file is written', t => {
  const project = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(project.projectDir, '.agents'), 'dir');
  const plan = buildPlan(project, {});
  assert.throws(() => writePlan(project.projectDir, plan, { force: true }), /symlinked/);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('all generated adapter links point at files in the output plan', t => {
  const project = fixture(t);
  const plan = buildPlan(project, { agents: ['copilot', 'claude', 'cursor', 'gemini', 'codex', 'windsurf'] });
  const destinations = new Set(plan.files.map(file => file.relativePath));
  for (const file of plan.files.filter(file => !file.relativePath.startsWith('.agents/') && file.relativePath !== '.agents-project.json')) {
    if (file.relativePath.includes('COMMIT_') || file.relativePath.includes('GITHUB_') || file.relativePath.includes('pr-')) continue;
    for (const match of file.content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      assert.ok(destinations.has(path.posix.normalize(path.posix.join(path.posix.dirname(file.relativePath), match[1]))), `${file.relativePath}: ${match[1]}`);
    }
  }
});

test('a non-force stack switch fails rather than mixing existing instructions', t => {
  const project = fixture(t);
  project.config = { version: '1.2.0', project: { name: 'Prior', stack: 'vue', framework: 'vue' } };
  assert.throws(() => buildPlan(project), /different stack/);
  assert.deepEqual(fs.readdirSync(project.projectDir), []);
  fs.mkdirSync(path.join(project.projectDir, '.agents/rules'), { recursive: true });
  fs.writeFileSync(path.join(project.projectDir, '.agents/rules/vue-state.md'), 'Keep until reviewed');
  const forced = buildPlan(project, { force: true });
  assert.ok(forced.warnings.some(warning => warning.includes('existing files')));
  assert.ok(forced.warnings.some(warning => warning.includes('.agents/rules/vue-state.md')));
});

test('duplicate core destinations are rejected rather than overwritten', t => {
  const project = fixture(t);
  project.stack = 'angular';
  project.preset = { ...react, id: 'angular', frameworks: { angular: 'Angular' } };
  project.framework = 'angular';
  assert.throws(() => buildPlan(project), /Duplicate asset/);
});

test('React integration assets match enabled project dependencies', t => {
  const project = fixture(t);
  project.framework = 'next';
  project.packageJson.dependencies = {
    next: '^15', react: '^19', '@mui/material': '^7',
    '@supabase/supabase-js': '^2', '@google/genai': '^1',
    '@storybook/react': '^9', '@react-three/fiber': '^9'
  };
  const plan = buildPlan(project);
  assert.deepEqual(plan.config.rules.include, [...react.rules, 'mui', 'supabase', 'gemini', 'three-js-react']);
  for (const file of ['.agents/instructions/mui.instructions.md', '.agents/instructions/storybook.instructions.md',
    '.agents/skills/integrate-gemini/SKILL.md']) {
    assert.ok(plan.files.some(entry => entry.relativePath === file), file);
  }
});

test('legacy 1.0 configs acquire GitHub features without losing additional fields', t => {
  const project = fixture(t);
  project.config = { version: '1.0.0', project: { name: 'Legacy', framework: 'react', custom: true }, agents: ['copilot'] };
  const { config } = buildPlan(project);
  assert.equal(config.features.github, true);
  assert.equal(config.project.custom, true);
  assert.equal(config.version, '1.2.0');
});

test('regeneration preserves user-rule links and links to existing project context', t => {
  const project = fixture(t);
  fs.mkdirSync(path.join(project.projectDir, '.agents/rules'), { recursive: true });
  fs.writeFileSync(path.join(project.projectDir, 'README.md'), 'Team policy');
  fs.writeFileSync(path.join(project.projectDir, '.agents/PROJECT-CONTEXT.md'), 'Existing context');
  const customContent = 'Follow [team policy](../../README.md).\nOptional [notes](../../NOTES.md).';
  fs.writeFileSync(path.join(project.projectDir, '.agents/rules/team-policy.md'), customContent);
  project.config = { version: '1.1.0', project: { name: 'Team', framework: 'react' }, rules: { include: ['team-policy'] } };
  const plan = buildPlan(project, { force: true });
  assert.equal(plan.files.find(file => file.relativePath === '.agents/rules/team-policy.md').content, customContent);
  assert.match(plan.files.find(file => file.relativePath === '.agents/AGENTS.md').content, /\]\(PROJECT-CONTEXT\.md\)/);
});
