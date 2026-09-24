import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const dependencyFields = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];

export const releasePackages = [
  { name: '@agents-config/core', directory: 'packages/core', dependencies: [] },
  { name: '@agents-config/react', directory: 'packages/react', dependencies: ['@agents-config/core'] },
  { name: '@agents-config/angular', directory: 'packages/angular', dependencies: ['@agents-config/core'] },
  { name: '@agents-config/vue', directory: 'packages/vue', dependencies: ['@agents-config/core'] },
  { name: 'agents-config', directory: '', dependencies: ['@agents-config/core', '@agents-config/react'] },
];

export async function runCommand(command, args, options = {}) {
  const { stdout } = await execute(command, args, {
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...options,
  });
  return stdout;
}

export function validateVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Invalid stable release version: ${version}`);
  }
}

export async function readRelease(root, version) {
  const manifests = [];
  const names = new Set(releasePackages.map(pkg => pkg.name));
  for (const pkg of releasePackages) {
    const filename = path.join(root, pkg.directory, 'package.json');
    const manifest = JSON.parse(await fs.readFile(filename, 'utf8'));
    version ??= manifest.version;
    validateVersion(version);
    if (manifest.name !== pkg.name || manifest.version !== version || manifest.private === true) {
      throw new Error(`Invalid release manifest: ${filename}; expected ${pkg.name}@${version}, public`);
    }
    for (const name of pkg.dependencies) {
      if (manifest.dependencies?.[name] !== version) {
        throw new Error(`${pkg.name} must depend on exact ${name}@${version}`);
      }
    }
    for (const field of dependencyFields) {
      for (const [name, range] of Object.entries(manifest[field] ?? {})) {
        if ((names.has(name) || name.startsWith('@agents-config/')) &&
            (!pkg.dependencies.includes(name) || range !== version)) {
          throw new Error(`${pkg.name}: invalid internal dependency ${name} in ${field}`);
        }
      }
    }
    manifests.push({ ...pkg, manifest, filename });
  }
  const lockfile = path.join(root, 'package-lock.json');
  const lock = JSON.parse(await fs.readFile(lockfile, 'utf8'));
  if (lock.lockfileVersion !== 3 || lock.version !== version || !lock.packages) {
    throw new Error('Expected a synchronized npm v3 package-lock.json');
  }
  for (const { directory, manifest } of manifests) {
    const entry = lock.packages[directory];
    if (!entry || entry.version !== version) {
      throw new Error(`Lockfile version mismatch: ${directory || 'root'}`);
    }
    for (const field of dependencyFields) {
      const actual = entry[field] ?? {};
      const expected = manifest[field] ?? {};
      if (Object.keys(actual).length !== Object.keys(expected).length ||
          Object.entries(expected).some(([name, range]) => actual[name] !== range)) {
        throw new Error(`Lockfile dependency mismatch: ${directory || 'root'} ${field}`);
      }
    }
  }
  return { manifests, lockfile, lock, version };
}

export async function synchronizeVersions(root, version) {
  validateVersion(version);
  const release = await readRelease(root);
  const current = release.version.split('.').map(BigInt);
  const next = version.split('.').map(BigInt);
  const difference = next.findIndex((part, index) => part !== current[index]);
  if (difference === -1 || next[difference] < current[difference]) {
    throw new Error(`Release version must advance ${release.version}: ${version}`);
  }
  const names = new Set(releasePackages.map(pkg => pkg.name));
  const update = manifest => {
    manifest.version = version;
    for (const field of dependencyFields) {
      for (const name of Object.keys(manifest[field] ?? {})) {
        if (names.has(name)) manifest[field][name] = version;
      }
    }
  };
  for (const { directory, manifest } of release.manifests) {
    update(manifest);
    update(release.lock.packages[directory]);
  }
  release.lock.version = version;
  // Validate the entire release before touching any manifest or lock entry.
  for (const { filename, manifest } of release.manifests) {
    await fs.writeFile(filename, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  await fs.writeFile(release.lockfile, `${JSON.stringify(release.lock, null, 2)}\n`);
}

export async function validateReleaseRef({ root = process.cwd(), version, ref, commit, run = runCommand }) {
  validateVersion(version);
  if (ref !== `refs/tags/v${version}`) throw new Error('Release ref must be the exact version tag');
  const tagCommit = (await run('git', ['rev-parse', '--verify', `${ref}^{commit}`], { cwd: root })).trim();
  const head = (await run('git', ['rev-parse', '--verify', 'HEAD'], { cwd: root })).trim();
  if (head !== tagCommit) throw new Error('HEAD does not match the release tag');
  if (commit && (!/^[a-f0-9]{40}$/.test(commit) || commit !== tagCommit)) {
    throw new Error('Release tag does not match the expected commit');
  }
  return tagCommit;
}

export async function verifyConditions(_config, { cwd }) {
  await readRelease(cwd);
}

export async function prepare(_config, { cwd, nextRelease }) {
  await synchronizeVersions(cwd, nextRelease.version);
  for (const args of [['run', 'prepare:packages'], ['test'], ['run', 'test:packages']]) {
    await runCommand('npm', args, { cwd });
  }
}

export async function success(_config, { nextRelease }) {
  if (!process.env.GITHUB_OUTPUT) return;
  validateVersion(nextRelease.version);
  if (nextRelease.gitTag !== `v${nextRelease.version}` || !/^[a-f0-9]{40}$/.test(nextRelease.gitHead)) {
    throw new Error('Invalid semantic-release output');
  }
  await fs.appendFile(process.env.GITHUB_OUTPUT,
    `version=${nextRelease.version}\nref=refs/tags/${nextRelease.gitTag}\ncommit=${nextRelease.gitHead}\n`);
}
