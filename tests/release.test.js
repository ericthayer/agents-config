import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { releasePackages, runCommand, synchronizeVersions, validateReleaseRef } from '../scripts/release-packages.js';
import { assertNotSuperseded, parsePublishArgs, publishPackages, registryStatus } from '../scripts/publish-packages.js';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-release-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const packages = {};
  for (const { name, directory, dependencies } of releasePackages) {
    const manifest = { name, version: '1.5.0', type: 'module',
      dependencies: Object.fromEntries(dependencies.map(name => [name, '1.5.0'])) };
    await fs.mkdir(path.join(root, directory), { recursive: true });
    await fs.writeFile(path.join(root, directory, 'package.json'), JSON.stringify(manifest));
    packages[directory] = structuredClone(manifest);
  }
  packages['node_modules/@agents-config/core'] = { resolved: 'packages/core', link: true };
  packages['node_modules/external'] = { version: '9.0.0', integrity: 'unchanged' };
  await fs.writeFile(path.join(root, 'package-lock.json'),
    JSON.stringify({ name: 'agents-config', version: '1.5.0', lockfileVersion: 3, packages }));
  return root;
}

const readJson = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const digest = bytes => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

test('release advances every manifest, exact dependency and lock entry together', async t => {
  const root = await fixture(t);
  await synchronizeVersions(root, '1.6.0');
  const lock = await readJson(path.join(root, 'package-lock.json'));
  for (const { directory, dependencies } of releasePackages) {
    const manifest = await readJson(path.join(root, directory, 'package.json'));
    assert.equal(manifest.version, '1.6.0');
    assert.equal(lock.packages[directory].version, '1.6.0');
    for (const name of dependencies) {
      assert.equal(manifest.dependencies[name], '1.6.0');
      assert.equal(lock.packages[directory].dependencies[name], '1.6.0');
    }
  }
  assert.equal(lock.version, '1.6.0');
  assert.deepEqual(lock.packages['node_modules/external'], { version: '9.0.0', integrity: 'unchanged' });
  assert.deepEqual(lock.packages['node_modules/@agents-config/core'], { resolved: 'packages/core', link: true });
});

test('invalid manifests or lockfiles fail before any version is written', async t => {
  const root = await fixture(t);
  const filename = path.join(root, 'packages/vue/package.json');
  const manifest = await readJson(filename);
  manifest.dependencies['@agents-config/core'] = '^1.5.0';
  await fs.writeFile(filename, JSON.stringify(manifest));
  await assert.rejects(synchronizeVersions(root, '1.6.0'), /exact|dependency/i);
  assert.equal((await readJson(path.join(root, 'package.json'))).version, '1.5.0');
});

test('stale lock entries and non-advancing versions cannot create a release', async t => {
  const root = await fixture(t);
  for (const version of ['1.5.0', '1.4.9', '01.6.0', '1.6.0-beta.1']) {
    await assert.rejects(synchronizeVersions(root, version), /version/i);
  }
  const filename = path.join(root, 'package-lock.json');
  const lock = await readJson(filename);
  lock.packages['packages/vue'].version = '1.4.0';
  await fs.writeFile(filename, JSON.stringify(lock));
  await assert.rejects(synchronizeVersions(root, '1.6.0'), /lockfile/i);
  assert.equal((await readJson(path.join(root, 'packages/core/package.json'))).version, '1.5.0');
});

test('release ref must be an exact version tag at HEAD and the expected commit', async () => {
  const sha = 'a'.repeat(40);
  const run = async () => sha;
  await validateReleaseRef({ version: '1.6.0', ref: 'refs/tags/v1.6.0', commit: sha, run });
  await assert.rejects(validateReleaseRef({ version: '1.6.0', ref: 'main', run }), /tag/i);
  await assert.rejects(validateReleaseRef({ version: '1.6.0', ref: 'refs/tags/v1.5.0', run }), /tag/i);
  await assert.rejects(validateReleaseRef({ version: '1.6.0;echo bad', ref: 'main', run }), /version/i);
  await assert.rejects(validateReleaseRef({ version: '1.6.0', ref: 'refs/tags/v1.6.0',
    commit: 'b'.repeat(40), run }), /commit/i);
  await assert.rejects(validateReleaseRef({ version: '1.6.0', ref: 'refs/tags/v1.6.0',
    run: async (_command, args) => args.includes('HEAD') ? sha : 'b'.repeat(40) }), /HEAD/i);
});

test('CLI accepts workflow arguments and rejects missing, unknown or duplicate arguments', () => {
  assert.deepEqual(parsePublishArgs(['--check-ref', '--version', '1.6.0', '--ref',
    'refs/tags/v1.6.0', '--commit', '']),
  { 'check-ref': true, version: '1.6.0', ref: 'refs/tags/v1.6.0', commit: '' });
  for (const args of [['--version'], ['--version', '--check-ref'], ['--force'],
    ['--version', '1.6.0', '--version', '1.7.0'], ['--check-ref', '--check-ref']]) {
    assert.throws(() => parsePublishArgs(args), /argument/i);
  }
});

function npmError(code) {
  return Object.assign(new Error(`npm ${code}`), { stdout: JSON.stringify({ error: { code } }) });
}

test('registry only treats explicit E404 as absence', async () => {
  const artifact = { name: '@agents-config/core', version: '1.6.0', integrity: digest('core'), shasum: 'hash' };
  assert.equal(await registryStatus(artifact, async () => { throw npmError('E404'); }), 'absent');
  assert.equal(await registryStatus(artifact, async () => JSON.stringify({ integrity: artifact.integrity })), 'identical');
  for (const error of [npmError('E401'), npmError('E403'), npmError('E500'), npmError('ENOTFOUND'),
    Object.assign(new Error('timeout'), { stdout: 'not json' })]) {
    await assert.rejects(registryStatus(artifact, async () => { throw error; }));
  }
  await assert.rejects(registryStatus(artifact, async () => '{}'), /identity/i);
  await assert.rejects(registryStatus(artifact, async () => 'not json'));
  assert.equal(await registryStatus(artifact, async () => JSON.stringify({ shasum: artifact.shasum })), 'identical');
  await assert.rejects(registryStatus(artifact, async () =>
    JSON.stringify({ integrity: digest('different'), shasum: artifact.shasum })), /identity/i);
  await assert.rejects(registryStatus(artifact, async () => JSON.stringify({ integrity: digest('different') })), /identity/i);
});

async function publishFixture(t) {
  const root = await fixture(t);
  const published = new Map();
  const latest = new Map();
  const calls = [];
  let failName;
  const run = async (command, args, options) => {
    assert.equal(command, 'npm');
    if (args[0] === 'pack') {
      const manifest = await readJson(path.join(options.cwd, 'package.json'));
      const filename = `${manifest.name.replaceAll('/', '-').replaceAll('@', '')}.tgz`;
      const content = Buffer.from(JSON.stringify(manifest));
      const destination = args[args.indexOf('--pack-destination') + 1];
      await fs.writeFile(path.join(destination, filename), content);
      calls.push(`pack:${manifest.name}`);
      return JSON.stringify([{ ...manifest, filename, integrity: digest(content),
        shasum: createHash('sha1').update(content).digest('hex'), files: [{ path: 'package.json' }] }]);
    }
    if (args[0] === 'view') {
      calls.push(`view:${args[1]}`);
      if (args[2] === 'dist-tags.latest') {
        if (!latest.has(args[1])) throw npmError('E404');
        return JSON.stringify(latest.get(args[1]));
      }
      if (!published.has(args[1])) throw npmError('E404');
      return JSON.stringify(published.get(args[1]));
    }
    assert.equal(args[0], 'publish');
    const content = await fs.readFile(args[1]);
    const manifest = JSON.parse(content);
    calls.push(`publish:${manifest.name}`);
    if (manifest.name === failName) throw new Error('publish interrupted');
    published.set(`${manifest.name}@${manifest.version}`, { integrity: digest(content) });
    latest.set(manifest.name, manifest.version);
    return '';
  };
  const packManifest = async filename => readJson(filename);
  return { root, published, latest, calls, run, packManifest, failOn: name => { failName = name; } };
}

test('all local artifacts and registry identities are preflighted before ordered publication', async t => {
  const fixture = await publishFixture(t);
  await publishPackages({ ...fixture, version: '1.5.0' });
  assert.deepEqual(fixture.calls.slice(0, 5), releasePackages.map(pkg => `pack:${pkg.name}`));
  assert.ok(fixture.calls.slice(5, 15).every(call => call.startsWith('view:')));
  assert.deepEqual(fixture.calls.slice(15), releasePackages.map(pkg => `publish:${pkg.name}`));
});

test('partial release retry skips identical versions and resumes in dependency order', async t => {
  const fixture = await publishFixture(t);
  fixture.failOn('@agents-config/angular');
  await assert.rejects(publishPackages({ ...fixture, version: '1.5.0' }), /interrupted/);
  assert.equal(fixture.published.size, 2);
  fixture.failOn(undefined);
  fixture.calls.length = 0;
  await publishPackages({ ...fixture, version: '1.5.0' });
  assert.deepEqual(fixture.calls.filter(call => call.startsWith('publish:')),
    ['publish:@agents-config/angular', 'publish:@agents-config/vue', 'publish:agents-config']);
  fixture.calls.length = 0;
  await publishPackages({ ...fixture, version: '1.5.0' });
  assert.ok(fixture.calls.every(call => !call.startsWith('publish:')));
});

test('retrying an older partial release never downgrades latest tags', async t => {
  const fixture = await publishFixture(t);
  fixture.failOn('@agents-config/angular');
  await assert.rejects(publishPackages({ ...fixture, version: '1.5.0' }), /interrupted/);
  for (const pkg of releasePackages) fixture.latest.set(pkg.name, '1.7.0');
  fixture.failOn(undefined);
  fixture.calls.length = 0;
  await assert.rejects(publishPackages({ ...fixture, version: '1.5.0' }), /superseded/i);
  assert.ok(fixture.calls.every(call => !call.startsWith('publish:')));
  assert.ok([...fixture.latest.values()].every(version => version === '1.7.0'));
});

test('latest preflight accepts absent/equal/older tags but rejects outages and malformed tags', async () => {
  const artifact = { name: '@agents-config/core', version: '1.10.0' };
  await assertNotSuperseded(artifact, async () => { throw npmError('E404'); });
  for (const latest of ['1.9.0', '1.10.0', '0.99.0']) {
    await assertNotSuperseded(artifact, async () => JSON.stringify(latest));
  }
  await assert.rejects(assertNotSuperseded(artifact, async () => '"1.11.0"'), /superseded/);
  await assert.rejects(assertNotSuperseded(artifact, async () => { throw npmError('E403'); }), /E403/);
  await assert.rejects(assertNotSuperseded(artifact, async () => 'null'), /version/i);
  await assert.rejects(assertNotSuperseded(artifact, async () => '"2.0.0-beta.1"'), /version/i);
});

test('a later package identity collision blocks all publication', async t => {
  const fixture = await publishFixture(t);
  fixture.published.set('agents-config@1.5.0', { integrity: digest('wrong legacy') });
  await assert.rejects(publishPackages({ ...fixture, version: '1.5.0' }), /identity/i);
  assert.ok(fixture.calls.every(call => !call.startsWith('publish:')));
});

test('a broken final artifact prevents registry access and publication', async t => {
  const fixture = await publishFixture(t);
  const run = async (...args) => {
    const result = await fixture.run(...args);
    if (args[1][0] === 'pack' && args[2].cwd === fixture.root) {
      const [pack] = JSON.parse(result);
      pack.integrity = digest('corrupted');
      return JSON.stringify([pack]);
    }
    return result;
  };
  await assert.rejects(publishPackages({ ...fixture, run, version: '1.5.0' }), /integrity/i);
  assert.ok(fixture.calls.every(call => call.startsWith('pack:')));
});

test('missing tarball entrypoints and assets fail before registry access', async t => {
  for (const extra of [{ exports: { '.': './missing.js' } }, { files: ['missing/'] },
    { bin: { 'agents-init': 'missing.js' } }]) {
    const fixture = await publishFixture(t);
    const filename = path.join(fixture.root, 'package.json');
    await fs.writeFile(filename, JSON.stringify({ ...await readJson(filename), ...extra }));
    await assert.rejects(publishPackages({ ...fixture, version: '1.5.0' }), /Missing tarball/i);
    assert.ok(fixture.calls.every(call => call.startsWith('pack:')));
  }
});

test('registry errors on a later package prevent every publish', async t => {
  const fixture = await publishFixture(t);
  const run = async (command, args, options) => {
    if (args[0] === 'view' && args[1] === 'agents-config@1.5.0') throw npmError('E403');
    return fixture.run(command, args, options);
  };
  await assert.rejects(publishPackages({ ...fixture, run, version: '1.5.0' }), /E403/);
  assert.ok(fixture.calls.every(call => !call.startsWith('publish:')));
});

test('real npm tarballs retain reproducible identity across a mocked publish retry', async t => {
  const root = await fixture(t);
  await synchronizeVersions(root, '1.6.0');
  const registry = new Map();
  let writes = 0;
  const run = async (command, args, options) => {
    if (args[0] === 'pack') return runCommand(command, args, options);
    if (args[0] === 'view') {
      if (!registry.has(args[1])) throw npmError('E404');
      return JSON.stringify(registry.get(args[1]));
    }
    assert.equal(args[0], 'publish');
    const manifest = JSON.parse(await runCommand('tar', ['-xOf', args[1], 'package/package.json']));
    registry.set(`${manifest.name}@${manifest.version}`, { integrity: digest(await fs.readFile(args[1])) });
    writes++;
    return '';
  };
  await publishPackages({ root, version: '1.6.0', run });
  await publishPackages({ root, version: '1.6.0', run });
  assert.equal(writes, 5);
  assert.equal(registry.size, 5);
});

test('release config commits every version source and delegates publishing explicitly', async () => {
  const config = await readJson(new URL('../.releaserc.json', import.meta.url));
  const plugins = config.plugins.map(plugin => Array.isArray(plugin) ? plugin[0] : plugin);
  assert.ok(!plugins.includes('@semantic-release/npm'));
  assert.ok(plugins.indexOf('./scripts/release-packages.js') < plugins.indexOf('@semantic-release/git'));
  const git = config.plugins.find(plugin => Array.isArray(plugin) && plugin[0] === '@semantic-release/git')[1];
  for (const { directory } of releasePackages) {
    assert.ok(git.assets.includes(path.posix.join(directory, 'package.json')));
  }
  assert.ok(git.assets.includes('package-lock.json'));
  const release = await fs.readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  const publish = await fs.readFile(new URL('../.github/workflows/publish.yml', import.meta.url), 'utf8');
  assert.match(release, /uses: \.\/\.github\/workflows\/publish\.yml/);
  assert.match(publish, /  workflow_call:/);
  assert.match(publish, /  workflow_dispatch:/);
  assert.doesNotMatch(publish, /^  (push|release):/m);
  assert.match(publish, /group: agents-config-npm-publish/);
  assert.match(publish, /cancel-in-progress: false/);
  assert.doesNotMatch(release + publish, /\|\| true|git reset/);
});
