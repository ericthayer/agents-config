import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import angular from '../packages/angular/preset.js';
import vue from '../packages/vue/preset.js';
import { buildPlan } from '../packages/core/src/generate.js';
import { validateConfig } from '../packages/core/src/project.js';

for (const preset of [angular, vue]) {
  test(`${preset.id} composes complete native guidance and all adapter links`, t => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), `agents-${preset.id}-`));
    t.after(() => fs.rmSync(projectDir, { recursive: true, force: true }));
    const project = { projectDir, preset, stack: preset.id, framework: preset.id, config: null,
      packageJson: { dependencies: { [preset.id === 'angular' ? '@angular/core' : 'vue']: '*' } } };
    const plan = buildPlan(project, { agents: ['copilot', 'claude', 'cursor', 'gemini', 'codex', 'windsurf'] });
    assert.equal(validateConfig(plan.config), plan.config);
    assert.ok(plan.config.rules.include.includes('component-architecture'));
    assert.ok(plan.files.some(file => file.relativePath === `.agents/instructions/${preset.id}-testing.instructions.md`));
    const known = new Set(plan.files.map(file => file.relativePath));
    for (const file of plan.files.filter(file => file.relativePath !== '.agents-project.json')) {
      assert.doesNotMatch(file.content, /\bReact\b|\bJSX\b|\.tsx|\buseState\b|Server Components/, file.relativePath);
      assert.doesNotMatch(file.content, /not included in this configuration/, file.relativePath);
      for (const [, destination] of file.content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        if (/^[a-z]+:|^#/i.test(destination)) continue;
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file.relativePath), destination.split('#')[0]));
        assert.ok(known.has(resolved), `${file.relativePath} -> ${destination}`);
      }
    }
  });

  test(`${preset.id} reports unsupported integrations without importing their rules`, t => {
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-features-'));
    t.after(() => fs.rmSync(projectDir, { recursive: true, force: true }));
    const plan = buildPlan({ projectDir, preset, stack: preset.id, framework: preset.id, config: null,
      packageJson: { dependencies: { '@mui/material': '*', '@supabase/supabase-js': '*', '@google/genai': '*', three: '*', storybook: '*' } } });
    for (const name of ['mui', 'supabase', 'gemini', 'threejs', 'storybook']) {
      assert.ok(plan.warnings.some(warning => warning.startsWith(name)));
    }
    assert.ok(!plan.files.some(file => /rules\/(mui|supabase|gemini|three-js-react)\.md/.test(file.relativePath)));
  });
}
