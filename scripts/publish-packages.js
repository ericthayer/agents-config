import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRelease, runCommand, validateReleaseRef, validateVersion } from './release-packages.js';

const registry = 'https://registry.npmjs.org';
const hash = (algorithm, bytes, encoding) => createHash(algorithm).update(bytes).digest(encoding);

function isRegistryMissingPackage(error) {
  for (const stream of [error.stdout, error.stderr]) {
    if (typeof stream !== 'string' || stream === '') continue;
    try {
      if (JSON.parse(stream)?.error?.code === 'E404') return true;
    } catch {
      if (/\bE404\b/.test(stream) &&
          (/\b404\b[\s\S]*\bNot Found\b/i.test(stream) || /is not in this registry/i.test(stream))) {
        return true;
      }
    }
  }
  return false;
}

async function registryValue(spec, field, run) {
  let output;
  try {
    output = await run('npm', ['view', spec, field, '--json', '--registry', registry]);
  } catch (error) {
    if (isRegistryMissingPackage(error)) return { found: false };
    throw error;
  }
  return { found: true, value: JSON.parse(output) };
}

export async function registryStatus(artifact, run = runCommand) {
  const response = await registryValue(`${artifact.name}@${artifact.version}`, 'dist', run);
  if (!response.found) return 'absent';
  const dist = response.value;
  // Prefer the stronger digest. Never fall back to SHA-1 after an integrity mismatch.
  const identical = typeof dist?.integrity === 'string'
    ? dist.integrity === artifact.integrity
    : typeof dist?.shasum === 'string' && dist.shasum === artifact.shasum;
  if (!identical) throw new Error(`Registry artifact identity mismatch: ${artifact.name}@${artifact.version}`);
  return 'identical';
}

export async function assertNotSuperseded(artifact, run = runCommand) {
  const response = await registryValue(artifact.name, 'dist-tags.latest', run);
  if (!response.found) return;
  validateVersion(response.value);
  const latest = response.value.split('.').map(BigInt);
  const target = artifact.version.split('.').map(BigInt);
  const difference = latest.findIndex((part, index) => part !== target[index]);
  if (difference !== -1 && latest[difference] > target[difference]) {
    throw new Error(`Release ${artifact.version} is superseded by ${artifact.name}@${response.value}; refusing to downgrade latest.`);
  }
}

function validatePackFiles(manifest, files) {
  if (!Array.isArray(files) || files.some(file => typeof file.path !== 'string')) {
    throw new Error(`Invalid pack file listing: ${manifest.name}`);
  }
  const paths = new Set(files.map(file => file.path));
  const targets = ['package.json', ...Object.values(manifest.bin ?? {})];
  function exportsTargets(value) {
    if (typeof value === 'string') targets.push(value);
    else if (value && typeof value === 'object') Object.values(value).forEach(exportsTargets);
  }
  exportsTargets(manifest.exports);
  for (const target of targets) {
    if (!paths.has(target.replace(/^\.\//, ''))) {
      throw new Error(`Missing tarball entry point: ${manifest.name} ${target}`);
    }
  }
  for (const entry of manifest.files ?? []) {
    const prefix = entry.replace(/^\.\//, '').replace(/\/$/, '');
    if (!paths.has(prefix) && ![...paths].some(filename => filename.startsWith(`${prefix}/`))) {
      throw new Error(`Missing tarball asset: ${manifest.name} ${entry}`);
    }
  }
}

async function readPackManifest(filename) {
  return JSON.parse(await runCommand('tar', ['-xOf', filename, 'package/package.json']));
}

export async function publishPackages({
  root = process.cwd(), version, run = runCommand, packManifest = readPackManifest,
}) {
  const { manifests } = await readRelease(root, version);
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'agents-release-'));
  try {
    const artifacts = [];
    // Pack and validate every package before the first registry operation.
    for (const { directory, manifest } of manifests) {
      const result = JSON.parse(await run('npm',
        ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
        { cwd: path.join(root, directory) }));
      if (!Array.isArray(result) || result.length !== 1) throw new Error(`Invalid npm pack output: ${manifest.name}`);
      const pack = result[0];
      if (pack.name !== manifest.name || pack.version !== version ||
          typeof pack.filename !== 'string' || path.basename(pack.filename) !== pack.filename) {
        throw new Error(`Invalid packed package: ${manifest.name}`);
      }
      const filename = path.join(temporary, pack.filename);
      const bytes = await fs.readFile(filename);
      const integrity = `sha512-${hash('sha512', bytes, 'base64')}`;
      const shasum = hash('sha1', bytes, 'hex');
      if (integrity !== pack.integrity || shasum !== pack.shasum) {
        throw new Error(`Tarball integrity mismatch: ${manifest.name}`);
      }
      const packed = await packManifest(filename);
      if (JSON.stringify(packed) !== JSON.stringify(manifest)) {
        throw new Error(`Tarball manifest mismatch: ${manifest.name}`);
      }
      validatePackFiles(manifest, pack.files);
      artifacts.push({ name: manifest.name, version, filename, integrity, shasum });
    }
    const pending = [];
    // A collision or registry outage on even the last package blocks the entire attempt.
    for (const artifact of artifacts) {
      if (await registryStatus(artifact, run) === 'absent') pending.push(artifact);
      else console.log(`Already published with identical artifact: ${artifact.name}@${version}`);
    }
    if (pending.length) {
      for (const artifact of artifacts) await assertNotSuperseded(artifact, run);
    }
    for (const artifact of pending) {
      console.log(`Publishing ${artifact.name}@${version}`);
      await run('npm', ['publish', artifact.filename, '--ignore-scripts', '--access', 'public',
        '--registry', registry, '--tag', 'latest']);
    }
    return pending.map(artifact => artifact.name);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

export function parsePublishArgs(args) {
  const values = {};
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--check-ref' && !values['check-ref']) {
      values['check-ref'] = true;
    } else if (['--version', '--ref', '--commit'].includes(argument) &&
        values[argument.slice(2)] === undefined && args[index + 1] !== undefined &&
        !args[index + 1].startsWith('--')) {
      values[argument.slice(2)] = args[++index];
    } else {
      throw new Error(`Invalid or duplicate publish argument: ${argument}`);
    }
  }
  return values;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const values = parsePublishArgs(process.argv.slice(2));
    await validateReleaseRef(values);
    if (values['check-ref']) await readRelease(process.cwd(), values.version);
    else await publishPackages(values);
  } catch (error) {
    console.error(`Publish failed: ${error.message}`);
    if (error.stderr) console.error(error.stderr);
    process.exitCode = 1;
  }
}
