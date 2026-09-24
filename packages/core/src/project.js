import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = '1.2.0';
export const STACKS = ['react', 'angular', 'vue'];
export const AGENTS = {
  copilot: { name: 'GitHub Copilot', file: '.github/copilot-instructions.md' },
  claude: { name: 'Claude', file: 'CLAUDE.md' },
  cursor: { name: 'Cursor', file: '.cursorrules' },
  gemini: { name: 'Gemini', file: '.gemini/config.md' },
  codex: { name: 'Codex', file: '.codex/AGENTS.md' },
  windsurf: { name: 'Windsurf', file: '.windsurfrules' }
};

export function readJson(file, { optional = false } = {}) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null;
    throw error;
  }
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('expected an object');
    }
    return value;
  } catch (error) {
    throw new Error(`Invalid JSON in ${file}: ${error.message}`);
  }
}

export function stackForFramework(framework) {
  if (['react', 'next', 'remix', 'astro'].includes(framework)) return 'react';
  return ['angular', 'vue'].includes(framework) ? framework : null;
}

export function detectFrameworks(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const frameworks = [];
  if (deps.next) frameworks.push('next');
  else if (deps.remix || deps['@remix-run/react']) frameworks.push('remix');
  else if (deps.astro) frameworks.push('astro');
  else if (deps.react) frameworks.push('react');
  if (deps['@angular/core']) frameworks.push('angular');
  if (deps.nuxt) frameworks.push('nuxt');
  else if (deps.vue) frameworks.push('vue');
  if (deps.svelte || deps['@sveltejs/kit']) frameworks.push('svelte');
  return frameworks;
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function validateConfig(config) {
  if (!isObject(config)) throw new Error('Invalid project configuration');
  if (!['1.0.0', '1.1.0', SCHEMA_VERSION].includes(config.version)) {
    throw new Error(`Unsupported config version: ${config.version}`);
  }
  const project = config.project;
  if (!isObject(project)) throw new Error('Invalid project metadata');
  if (project.stack !== undefined && !STACKS.includes(project.stack)) throw new Error('Invalid project.stack');
  if (typeof project.name !== 'string' || !project.name) throw new Error('Invalid project.name');
  if (project.framework !== undefined && !['next', 'react', 'remix', 'astro', 'vue', 'angular', 'svelte', 'other'].includes(project.framework)) {
    throw new Error('Invalid project.framework');
  }
  if (project.styling !== undefined && !['tailwind', 'mui', 'vanilla', 'styled', 'emotion', 'css-modules', 'other'].includes(project.styling)) {
    throw new Error('Invalid project.styling');
  }
  if (project.database !== undefined && !['supabase', 'firebase', 'prisma', 'drizzle', 'none', 'other'].includes(project.database)) {
    throw new Error('Invalid project.database');
  }
  if (project.stack && stackForFramework(project.framework) && project.stack !== stackForFramework(project.framework)) {
    throw new Error('Config stack and framework disagree');
  }
  if (config.agents !== undefined && (!Array.isArray(config.agents) || config.agents.some(agent => !Object.hasOwn(AGENTS, agent)))) {
    throw new Error('Invalid agents list');
  }
  if (config.rules !== undefined && !isObject(config.rules)) throw new Error('Invalid rules');
  for (const key of ['include', 'exclude']) {
    if (config.rules?.[key] !== undefined && (!Array.isArray(config.rules[key]) ||
      config.rules[key].some(rule => typeof rule !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(rule)))) {
      throw new Error(`Invalid rule ${key}`);
    }
  }
  if (config.features !== undefined && (!isObject(config.features) ||
    Object.values(config.features).some(value => typeof value !== 'boolean'))) throw new Error('Invalid features');
  if (config.overrides !== undefined && !isObject(config.overrides)) throw new Error('Invalid overrides');
  return config;
}

/** Resolve only known installed presets; never execute a path supplied in config. */
export async function resolveProject({ projectDir, stack, choose, confirmMismatch } = {}) {
  const dir = path.resolve(projectDir ?? process.cwd());
  if (stack !== undefined && !STACKS.includes(stack)) throw new Error(`Unknown stack '${stack}'. Use react, angular, or vue.`);
  const packageJson = readJson(path.join(dir, 'package.json'), { optional: true }) ?? {};
  if (packageJson.name !== undefined && (typeof packageJson.name !== 'string' || !packageJson.name)) {
    throw new Error('Invalid package.json name');
  }
  for (const field of ['dependencies', 'devDependencies']) {
    if (packageJson[field] !== undefined && (!isObject(packageJson[field]) ||
      Object.values(packageJson[field]).some(value => typeof value !== 'string'))) {
      throw new Error(`Invalid package.json ${field}`);
    }
  }
  const raw = readJson(path.join(dir, '.agents-project.json'), { optional: true });
  const config = raw ? validateConfig(raw) : null;
  const require = createRequire(path.join(dir, 'package.json'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const declared = STACKS.filter(id => deps[`@agents-config/${id}`] || (id === 'react' && deps['agents-config']));
  let selected = stack ?? config?.project.stack ?? stackForFramework(config?.project.framework);
  if (!selected) {
    if (declared.length === 1) selected = declared[0];
    else if (declared.length > 1 && choose) selected = await choose(declared);
    else if (declared.length > 1) throw new Error('Multiple presets installed. Choose --stack react|angular|vue.');
    else throw new Error('No preset declared. Install @agents-config/react, @agents-config/angular, or @agents-config/vue.');
  }
  if (!STACKS.includes(selected)) throw new Error('Invalid stack selection');
  let presetPath;
  try {
    presetPath = require.resolve(`@agents-config/${selected}/preset`);
  } catch (error) {
    // A legacy package can have its React dependency nested rather than hoisted.
    if (error.code !== 'MODULE_NOT_FOUND' && error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error;
    if (selected === 'react' && deps['agents-config']) {
      const legacyRequire = createRequire(require.resolve('agents-config/package.json'));
      presetPath = legacyRequire.resolve('@agents-config/react/preset');
    } else {
      throw new Error(`Preset not installed. Run npm install --save-dev @agents-config/${selected}`);
    }
  }
  const { default: preset } = await import(pathToFileURL(presetPath).href);
  validatePreset(preset, selected);
  const detected = detectFrameworks(packageJson);
  const matches = detected.filter(id => Object.hasOwn(preset.frameworks, id));
  if (detected.some(id => !Object.hasOwn(preset.frameworks, id))) {
    const message = `Detected ${detected.join(', ')} but selected ${selected}; this preset does not cover all detected frameworks.`;
    if (!confirmMismatch || !await confirmMismatch(message)) throw new Error(message);
  }
  const previous = config?.project.framework;
  const framework = matches[0] ?? (Object.hasOwn(preset.frameworks, previous) ? previous : selected);
  return { projectDir: dir, preset, stack: selected, framework, config, packageJson };
}

export function validatePreset(preset, expected) {
  if (!isObject(preset) || preset.id !== expected || !isObject(preset.frameworks) ||
    typeof preset.root !== 'string' || !path.isAbsolute(preset.root) ||
    !Object.hasOwn(preset.frameworks, preset.id)) throw new Error('Invalid preset descriptor');
  if (Object.entries(preset.frameworks).some(([id, label]) =>
    stackForFramework(id) !== expected || typeof label !== 'string' || !label.trim())) {
    throw new Error('Invalid preset frameworks');
  }
  const validateNames = (names, field) => {
    if (!Array.isArray(names) || names.some(name => typeof name !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(name))) {
      throw new Error(`Invalid preset ${field}`);
    }
  };
  for (const field of ['rules', 'skills', 'instructions']) validateNames(preset[field], field);
  if (!isObject(preset.features)) throw new Error('Invalid preset features');
  for (const feature of Object.values(preset.features)) {
    if (!isObject(feature)) throw new Error('Invalid preset feature');
    for (const field of ['rules', 'skills', 'instructions']) {
      if (feature[field] !== undefined) validateNames(feature[field], field);
    }
  }
  return preset;
}
