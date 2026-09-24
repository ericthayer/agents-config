import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-package-smoke-'));
const stacks = process.argv.includes('--react-only') ? ['react'] : ['react', 'angular', 'vue'];
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const cli = (dir, name, args = []) => run(process.execPath, [path.join(dir, 'node_modules/.bin', name), ...args], dir);
const json = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));

function project(name, packages, dependencies) {
  const dir = path.join(temp, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name, private: true }));
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--save-dev', ...packages], dir);
  const pkg = json(dir, 'package.json');
  pkg.dependencies = dependencies;
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
  return dir;
}

try {
  run(process.execPath, ['scripts/prepare-packages.js'], root);
  const tarballs = {};
  for (const name of ['core', ...stacks, 'legacy']) {
    const cwd = name === 'legacy' ? root : path.join(root, 'packages', name);
    const [pack] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temp], cwd));
    tarballs[name] = path.join(temp, pack.filename);
    assert.ok(pack.files.some(file => file.path === 'LICENSE'));
    if (name === 'legacy') {
      for (const required of ['AGENTS.md', 'bin/agents-init.js', 'bin/agents-analyze.js', 'rules/component-architecture.md', 'adapters/copilot.template.md']) {
        assert.ok(pack.files.some(file => file.path === required), `Legacy path missing: ${required}`);
      }
    } else if (name !== 'core') {
      assert.ok(pack.files.some(file => file.path === 'preset.js'));
      assert.ok(pack.files.some(file => file.path === 'bin/agents-init.js'));
      if (name !== 'react') assert.ok(!pack.files.some(file => /react-19|three-js-react|mui\.md/.test(file.path)));
    } else assert.ok(pack.files.some(file => file.path === 'src/init.js'));
  }

  for (const stack of [...stacks, 'legacy']) {
    const expected = stack === 'legacy' ? 'react' : stack;
    const dependencies = expected === 'angular' ? { '@angular/core': '^20.0.0' } :
      expected === 'vue' ? { vue: '^3.5.0' } : { react: '^19.0.0' };
    const packs = stack === 'legacy' ? [tarballs.core, tarballs.react, tarballs.legacy] : [tarballs.core, tarballs[stack]];
    const dir = project(`consumer-${stack}`, packs, dependencies);
    if (stack === 'legacy') {
      const pkg = json(dir, 'package.json');
      delete pkg.devDependencies['@agents-config/react'];
      delete pkg.devDependencies['@agents-config/core'];
      fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg));
    }
    const component = expected === 'angular' ? 'src/app/example.component.ts' :
      expected === 'vue' ? 'src/components/Example.vue' : 'src/components/Example.tsx';
    fs.mkdirSync(path.dirname(path.join(dir, component)), { recursive: true });
    fs.writeFileSync(path.join(dir, component), expected === 'vue' ? '<template><button>Save</button></template>' : 'export class Example {}');
    assert.match(cli(dir, 'agents-init', ['--help']), /--stack/);
    assert.match(run('npm', ['exec', '--offline', '--', 'agents-init', '--help'], dir), /--stack/);
    const preview = cli(dir, 'agents-init', ['--dry-run']);
    assert.match(preview, /Dry run complete/);
    assert.ok(!fs.existsSync(path.join(dir, '.agents')));
    cli(dir, 'agents-init', ['--yes', '--agents', 'copilot,claude,cursor,gemini,codex,windsurf']);
    const config = json(dir, '.agents-project.json');
    assert.equal(config.project.stack, expected);
    for (const filename of ['.github/copilot-instructions.md', 'CLAUDE.md', '.cursorrules', '.gemini/config.md', '.codex/AGENTS.md', '.windsurfrules']) {
      const content = fs.readFileSync(path.join(dir, filename), 'utf8');
      assert.ok(!content.includes('{{'));
      for (const [, target] of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        assert.ok(fs.existsSync(path.resolve(dir, path.dirname(filename), target)), `${filename} -> ${target}`);
      }
      if (expected !== 'react') assert.doesNotMatch(content, /React|JSX|useState|Server Components/);
    }
    const custom = path.join(dir, '.agents/skills/scaffold-component/SKILL.md');
    fs.writeFileSync(custom, 'consumer customization');
    cli(dir, 'agents-init', ['--yes']);
    assert.equal(fs.readFileSync(custom, 'utf8'), 'consumer customization');
    cli(dir, 'agents-init', ['--yes', '--force']);
    assert.notEqual(fs.readFileSync(custom, 'utf8'), 'consumer customization');
    cli(dir, 'agents-analyze', ['--dry-run']);
    cli(dir, 'agents-analyze', ['--yes']);
    const context = fs.readFileSync(path.join(dir, '.agents/PROJECT-CONTEXT.md'), 'utf8');
    if (expected !== 'react') assert.doesNotMatch(context, /React Context|useState|\.tsx|\.jsx/);
    cli(dir, 'agents-analyze', ['--verify']);
    console.log(`Installed ${stack}: init, adapters, preservation, analysis verified`);
  }
  if (stacks.includes('vue')) {
    const dir = project('multiple-presets', [tarballs.core, tarballs.react, tarballs.vue], {});
    const result = spawnSync(process.execPath, [path.join(dir, 'node_modules/.bin/agents-init'), '--yes'], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Multiple presets/);
    cli(dir, 'agents-init', ['--stack', 'vue', '--yes']);
    assert.equal(json(dir, '.agents-project.json').project.stack, 'vue');
    const app = path.join(dir, 'apps', 'child');
    fs.mkdirSync(app, { recursive: true });
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ dependencies: { '@agents-config/vue': '1.5.0', vue: '^3.5.0' } }));
    run(process.execPath, [path.join(dir, 'node_modules/.bin/agents-init'), '--yes'], app);
    assert.equal(json(app, '.agents-project.json').project.stack, 'vue');
    console.log('Multiple presets and hoisted consumer resolution verified');
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
