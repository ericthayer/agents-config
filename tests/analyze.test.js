import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline';
import {
  runAnalyze, categorizeFiles, analyzeNamingConventions, analyzePackageJson,
  detectPatterns, guidedOptions, runGuidedMode, verifyConfiguration,
} from '../packages/core/src/analyze.js';

const repo = fileURLToPath(new URL('../', import.meta.url));
const forbidden = /React Context|useState|React Hook Form|Render props|Higher-order|\.tsx|Custom Hooks|error boundaries/i;

function consumer(t, stack, { dependencies = {}, framework = stack, version = '1.2.0', workspacePresets = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-analysis-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'fixture', dependencies: { [`@agents-config/${stack}`]: '1.5.0', ...dependencies },
  }));
  if (workspacePresets) {
    fs.symlinkSync(path.join(repo, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  } else {
    // The analyzer needs installed descriptors, not the content-generation assets.
    for (const [id, frameworks] of Object.entries({
      react: { react: 'React', next: 'Next.js', remix: 'Remix', astro: 'Astro' },
      angular: { angular: 'Angular' },
      vue: { vue: 'Vue' },
    })) {
      const presetDir = path.join(dir, 'node_modules/@agents-config', id);
      fs.mkdirSync(presetDir, { recursive: true });
      fs.writeFileSync(path.join(presetDir, 'package.json'), JSON.stringify({
        name: `@agents-config/${id}`, type: 'module', exports: { './preset': './preset.js' },
      }));
      fs.writeFileSync(path.join(presetDir, 'preset.js'), `export default ${JSON.stringify({
        id, root: presetDir, frameworks, rules: [], skills: [], instructions: [], features: {},
      })};`);
    }
  }
  fs.writeFileSync(path.join(dir, '.agents-project.json'), JSON.stringify({
    version, project: { name: 'Custom name', stack, framework },
    agents: [], overrides: { custom: 'preserve' }, rules: { exclude: ['accessibility'] },
  }));
  fs.mkdirSync(path.join(dir, '.agents'));
  fs.writeFileSync(path.join(dir, '.agents/AGENTS.md'), '# Existing guidance');
  return dir;
}

function files(dir, names) {
  return names.map(name => path.join(dir, name));
}

test('test classification precedes component, page, composable, and service classification', () => {
  for (const stack of ['react', 'angular', 'vue']) {
    const categories = categorizeFiles(files('/app', [
      'src/components/Button.test.tsx', 'src/app/home.component.spec.ts',
      'src/composables/useData.spec.ts', 'src/services/data.service.spec.ts',
      'src/components/__tests__/Button.ts', 'src/pages/home.spec.js',
    ]), '/app', stack);
    assert.equal(categories.tests.length, 6);
    assert.equal(categories.components.length, 0);
    assert.equal(categories.pages.length, 0);
  }
});

test('Angular sources, templates, services, and routes receive native categories', () => {
  const categories = categorizeFiles(files('/app', [
    'src/app/user-profile.component.ts', 'src/app/user-profile.component.html',
    'src/app/user-profile.component.scss', 'src/app/user.service.ts',
    'src/app/app.routes.ts', 'src/app/auth.guard.ts',
    'src/app/dashboard.ts', 'src/app/dashboard.html', 'src/app/app.config.ts',
  ]), '/app', 'angular');
  assert.equal(categories.components.length, 2);
  assert.equal(categories.templates.length, 2);
  assert.equal(categories.services.length, 1);
  assert.equal(categories.pages.length, 2);
  assert.equal(categories.styles.length, 1);
  assert.equal(categories.config.length, 1);
});

test('Vue SFCs, views, and composables receive native categories', () => {
  const categories = categorizeFiles(files('/app', [
    'src/App.vue', 'src/components/UserCard.vue', 'src/views/HomeView.vue',
    'src/composables/useUser.ts', 'src/router/index.ts',
  ]), '/app', 'vue');
  assert.equal(categories.components.length, 2);
  assert.equal(categories.pages.length, 2);
  assert.equal(categories.composables.length, 1);
  assert.equal(categories.hooks.length, 0);
});

test('naming excludes tests and uses framework-native defaults for empty projects', () => {
  assert.equal(analyzeNamingConventions([], 'angular').fileExtension, '.ts');
  assert.equal(analyzeNamingConventions([], 'angular').testNaming, '.spec.');
  assert.equal(analyzeNamingConventions([], 'vue').fileExtension, '.vue');
  const angular = analyzeNamingConventions(['src/user-profile.component.ts', 'src/User.test.tsx'], 'angular');
  assert.equal(angular.componentStyle, 'kebab-case');
  assert.equal(angular.fileExtension, '.ts');
  const vue = analyzeNamingConventions(['src/UserCard.vue', 'src/user.test.tsx'], 'vue');
  assert.equal(vue.componentStyle, 'PascalCase');
  assert.equal(vue.fileExtension, '.vue');
  assert.equal(analyzeNamingConventions(['src/Button.tsx'], 'react').fileExtension, '.tsx');
});

for (const stack of ['angular', 'vue']) {
  test(`${stack} patterns and guided options never default to React`, t => {
    const dir = consumer(t, stack);
    const pkg = analyzePackageJson(dir, { stack, framework: stack });
    const patterns = detectPatterns(pkg, {});
    assert.doesNotMatch(JSON.stringify({ patterns, guided: guidedOptions(stack) }), forbidden);
    for (const key of ['stateManagement', 'formHandling', 'dataFetching', 'routing', 'componentComposition']) {
      assert.ok(patterns[key]?.rules.length, key);
    }
    assert.match(patterns.stateManagement.tool, stack === 'angular' ? /signals/i : /ref|reactive/i);
    assert.match(patterns.formHandling.tool, stack === 'angular' ? /reactive forms/i : /v-model/i);
  });

  test(`${stack} report and context honor persisted stack without framework dependencies`, async t => {
    const dir = consumer(t, stack);
    const before = fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8');
    const result = await runAnalyze({ projectDir: dir, args: ['--dry-run'] });
    assert.equal(result.analysis.stack, stack);
    assert.equal(result.analysis.packageJson.frameworkId, stack);
    assert.doesNotMatch(result.projectContext, forbidden);
    assert.match(result.projectContext, /### Routing/);
    assert.match(result.analysisReport, stack === 'angular' ? /Angular/ : /Vue/);
    assert.equal(fs.existsSync(path.join(dir, '.agents/PROJECT-CONTEXT.md')), false);
    assert.equal(fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8'), before);
    const report = await runAnalyze({ projectDir: dir, args: ['--report', '--stack', stack] });
    assert.equal(report.analysis.stack, stack);
    assert.equal(fs.existsSync(path.join(dir, '.agents/ANALYSIS.md')), false);
    const verified = await runAnalyze({ projectDir: dir, args: ['--verify'] });
    assert.deepEqual(verified.verification.issues, []);
    assert.ok(!verified.verification.warnings.some(warning => /mismatch|version/i.test(warning)));
  });
}

test('native dependency detection recognizes Pinia, Vue Query, Angular forms, and RxJS', t => {
  const vue = consumer(t, 'vue', { dependencies: { vue: '^3.5', pinia: '^3', '@tanstack/vue-query': '^5', 'vee-validate': '^4' } });
  const angular = consumer(t, 'angular', { dependencies: { '@angular/core': '^20', '@angular/forms': '^20', rxjs: '^7' } });
  const vuePatterns = detectPatterns(analyzePackageJson(vue, { stack: 'vue', framework: 'vue' }), {});
  assert.match(vuePatterns.stateManagement.tool, /Pinia/);
  assert.match(vuePatterns.dataFetching.tool, /Vue Query/);
  assert.match(vuePatterns.formHandling.tool, /VeeValidate/);
  const angularPackage = analyzePackageJson(angular, { stack: 'angular', framework: 'angular' });
  assert.ok(angularPackage.features.includes('RxJS'));
  assert.ok(angularPackage.keyDependencies.some(dep => dep.startsWith('@angular/core@')));
});

test('native stacks do not adopt React integration patterns from incidental dependencies', t => {
  for (const stack of ['angular', 'vue']) {
    const dir = consumer(t, stack, { dependencies: {
      'react-hook-form': '^7', '@mui/material': '^7', zustand: '^5',
      'framer-motion': '^12', '@react-three/fiber': '^9',
    } });
    const pkg = analyzePackageJson(dir, { stack, framework: stack });
    const patterns = detectPatterns(pkg, { components: Array(30).fill('component') });
    assert.doesNotMatch(JSON.stringify({ pkg, patterns }), /\bReact\b|Material-UI|Framer Motion|Zustand|R3F|render props/i);
    assert.ok(patterns.componentComposition.rules.length);
  }
});

test('React Next.js identifier is retained and verification does not compare display labels', async t => {
  const dir = consumer(t, 'react', { framework: 'next', dependencies: { next: '^15', react: '^19' }, version: '1.1.0' });
  const configPath = path.join(dir, '.agents-project.json');
  const legacy = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  delete legacy.project.stack;
  const before = JSON.stringify(legacy);
  fs.writeFileSync(configPath, before);
  const result = await runAnalyze({ projectDir: dir, args: ['--report'] });
  assert.equal(result.analysis.stack, 'react');
  assert.equal(result.analysis.packageJson.frameworkId, 'next');
  assert.match(result.projectContext, /Next\.js Server Actions/);
  assert.ok(!verifyConfiguration(dir, result.analysis).warnings.some(warning => /mismatch|version/i.test(warning)));
  assert.equal(fs.readFileSync(configPath, 'utf8'), before);
});

test('React display names retain original dependency-specific wording with the real preset', async t => {
  for (const [dependencies, expected] of [
    [{ react: '^19' }, 'React'],
    [{ react: '^19', vite: '^6' }, 'React (Vite)'],
    [{ react: '^18', gatsby: '^5' }, 'Gatsby'],
  ]) {
    const dir = consumer(t, 'react', { dependencies, workspacePresets: true });
    const result = await runAnalyze({ projectDir: dir, args: ['--report'] });
    assert.equal(result.analysis.packageJson.frameworkId, 'react');
    assert.equal(result.analysis.packageJson.framework, expected);
    assert.match(result.analysisReport, new RegExp(`\\*\\*Framework:\\*\\* ${expected.replace(/[()]/g, '\\$&')}`));
  }
});

for (const stack of ['angular', 'vue']) {
  test(`${stack} resolves the actual workspace preset through its thin CLI wrapper`, t => {
    const dependencies = stack === 'angular' ? { '@angular/core': '^20' } : { vue: '^3.5' };
    const dir = consumer(t, stack, { dependencies, workspacePresets: true });
    const result = spawnSync(process.execPath, [path.join(repo, `packages/${stack}/bin/agents-analyze.js`), '--report'], {
      cwd: dir, encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, stack === 'angular' ? /Angular/ : /Vue/);
    assert.doesNotMatch(result.stdout, forbidden);
  });
}

test('malformed JSON fails without modifying configuration', async t => {
  const dir = consumer(t, 'vue');
  fs.writeFileSync(path.join(dir, '.agents-project.json'), '{invalid');
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--report'] }), /Invalid JSON/);
  assert.equal(fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8'), '{invalid');
});

test('explicit stack uses shared resolution and mismatches fail unattended', async t => {
  const dir = consumer(t, 'vue', { dependencies: { vue: '^3.5' } });
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--report', '--stack', 'react'] }), /Detected vue|different stack/);
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--stack'] }), /stack.*value|stack.*requires/i);
});

test('core module import has no CLI side effects and wrapper reports failures nonzero', t => {
  const imported = spawnSync(process.execPath, ['--input-type=module', '-e',
    `await import(${JSON.stringify(new URL('../packages/core/src/analyze.js', import.meta.url).href)})`,
  ], { encoding: 'utf8' });
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(imported.stdout, '');
  const dir = consumer(t, 'react');
  const failed = spawnSync(process.execPath, [path.join(repo, 'bin/agents-analyze.js'), '--stack', 'unknown'], {
    cwd: dir, encoding: 'utf8',
  });
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Unknown stack/);
  const help = spawnSync(process.execPath, [path.join(repo, 'bin/agents-analyze.js'), '--help'], {
    cwd: dir, encoding: 'utf8',
  });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--stack/);
});

test('guided customization uses native composition and error handling for every stack', async () => {
  for (const stack of ['react', 'angular', 'vue']) {
    const answers = ['Domain app', '1', 'Domain-specific state', '1', 'Use labels', '', 'Never hide errors', '', 'IDs are UUIDs', ''];
    const rl = { question(_prompt, callback) { callback(answers.shift()); } };
    const patterns = detectPatterns({ stack, features: [] }, {});
    const customizations = await runGuidedMode(rl, { stack, packageJson: { stack } }, patterns);
    assert.equal(customizations.projectDescription, 'Domain app');
    assert.deepEqual(customizations.dosAndDonts, { dos: ['Use labels'], donts: ['Never hide errors'] });
    assert.deepEqual(customizations.domainRules, ['IDs are UUIDs']);
    assert.equal(customizations.componentPatterns[0], guidedOptions(stack).composition[0]);
    if (stack !== 'react') assert.doesNotMatch(JSON.stringify(customizations), forbidden);
    assert.equal(answers.length, 0);
  }
});

function interactive(t, answers) {
  for (const stream of [process.stdin, process.stdout]) {
    const descriptor = Object.getOwnPropertyDescriptor(stream, 'isTTY');
    Object.defineProperty(stream, 'isTTY', { configurable: true, value: true });
    t.after(() => {
      if (descriptor) Object.defineProperty(stream, 'isTTY', descriptor);
      else delete stream.isTTY;
    });
  }
  let closed = false;
  t.mock.method(readline, 'createInterface', () => ({
    question(_prompt, callback) {
      assert.ok(answers.length, 'Unexpected additional prompt');
      callback(answers.shift());
    },
    close() { closed = true; },
  }));
  return () => closed;
}

test('confirmed generation writes both outputs and preserves all existing configuration', async t => {
  const dir = consumer(t, 'react', { version: '1.0.0' });
  const before = fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8');
  const closed = interactive(t, ['y']);
  const result = await runAnalyze({ projectDir: dir, args: [] });
  assert.equal(fs.readFileSync(path.join(dir, '.agents/ANALYSIS.md'), 'utf8'), result.analysisReport);
  assert.equal(fs.readFileSync(path.join(dir, '.agents/PROJECT-CONTEXT.md'), 'utf8'), result.projectContext);
  assert.equal(fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8'), before);
  assert.equal(fs.readFileSync(path.join(dir, '.agents/AGENTS.md'), 'utf8'), '# Existing guidance');
  assert.equal(closed(), true);
});

test('declining generation leaves outputs untouched', async t => {
  const dir = consumer(t, 'react');
  const closed = interactive(t, ['n']);
  assert.equal((await runAnalyze({ projectDir: dir, args: [] })).aborted, true);
  assert.equal(fs.existsSync(path.join(dir, '.agents/ANALYSIS.md')), false);
  assert.equal(closed(), true);
});

test('symlinked output fails before either report is written', async t => {
  const dir = consumer(t, 'react');
  const target = path.join(dir, 'user-notes.md');
  fs.writeFileSync(target, 'User notes');
  fs.symlinkSync(target, path.join(dir, '.agents/PROJECT-CONTEXT.md'));
  interactive(t, ['y']);
  await assert.rejects(runAnalyze({ projectDir: dir, args: [] }), /symlink/i);
  assert.equal(fs.existsSync(path.join(dir, '.agents/ANALYSIS.md')), false);
  assert.equal(fs.readFileSync(target, 'utf8'), 'User notes');
});

test('symlinked output ancestor is rejected without writing through it', async t => {
  const dir = consumer(t, 'react');
  const target = path.join(dir, 'user-guidance');
  fs.renameSync(path.join(dir, '.agents'), target);
  fs.symlinkSync(target, path.join(dir, '.agents'), 'dir');
  interactive(t, ['y']);
  await assert.rejects(runAnalyze({ projectDir: dir, args: [] }), /symlink/i);
  assert.equal(fs.existsSync(path.join(target, 'ANALYSIS.md')), false);
  assert.equal(fs.existsSync(path.join(target, 'PROJECT-CONTEXT.md')), false);
});

test('verify fails on missing guidance and guided mode refuses unattended prompting', async t => {
  const dir = consumer(t, 'react');
  fs.unlinkSync(path.join(dir, '.agents/AGENTS.md'));
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--verify'] }), /verification failed/i);
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--guided', '--dry-run'] }), /interactive terminal/);
});

test('explicit unattended generation writes reports without altering configuration', async t => {
  const dir = consumer(t, 'vue', { dependencies: { vue: '^3.5' } });
  const before = fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8');
  const result = await runAnalyze({ projectDir: dir, args: ['--yes'] });
  assert.equal(fs.readFileSync(path.join(dir, '.agents/PROJECT-CONTEXT.md'), 'utf8'), result.projectContext);
  assert.equal(fs.readFileSync(path.join(dir, '.agents/ANALYSIS.md'), 'utf8'), result.analysisReport);
  assert.equal(fs.readFileSync(path.join(dir, '.agents-project.json'), 'utf8'), before);
});

test('unattended analysis confirmation does not bypass stack safety checks', async t => {
  const dir = consumer(t, 'vue', { dependencies: { vue: '^3.5' } });
  await assert.rejects(runAnalyze({ projectDir: dir, args: ['--yes', '--stack', 'react'] }), /Detected vue|different stack/);
  assert.equal(fs.existsSync(path.join(dir, '.agents/PROJECT-CONTEXT.md')), false);
});
