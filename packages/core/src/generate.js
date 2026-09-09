import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS, SCHEMA_VERSION, stackForFramework, validatePreset } from './project.js';

const CORE_ROOT = fileURLToPath(new URL('../content/', import.meta.url));
const CORE = {
  rules: ['accessibility', 'spec-driven-development', 'web-performance'],
  skills: ['accessibility-audit', 'workflows'],
  instructions: ['development-standards', 'web-interface-guidelines']
};
const GITHUB_FILES = ['COMMIT_CONVENTION.md', 'GITHUB_AUTH_SETUP.md', 'pr-template-commits.md', 'pr-body-semantic-release.md'];
const unique = values => [...new Set(values)];
const markdown = value => String(value).replace(/[\r\n]/g, ' ').replace(/([\\`*_[\]<>])/g, '\\$1');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Required asset missing: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function collectFolder(root, prefix, files) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const source = path.join(root, entry.name);
    const relativePath = `${prefix}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symlinked source asset: ${source}`);
    if (entry.isDirectory()) collectFolder(source, relativePath, files);
    else files.push({ relativePath, content: read(source) });
  }

}

function existingFiles(root, prefix) {
  if (!fs.existsSync(root)) return [];
  if (fs.lstatSync(root).isSymbolicLink()) return [prefix];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const relative = `${prefix}/${entry.name}`;
    return entry.isDirectory() ? existingFiles(path.join(root, entry.name), relative) : [relative];
  });
}

function link(from, to) {
  return path.posix.relative(path.posix.dirname(from), to);
}

function renderAssetLinks(text, from, knownFiles, projectDir) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (original, label, destination) => {
    if (/^(?:[a-z]+:|#)/i.test(destination)) return original;
    const [target, anchor] = destination.split('#');
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(from), target));
    const insideProject = !resolved.startsWith('../') && !path.posix.isAbsolute(resolved);
    const available = knownFiles.has(resolved) ||
      [...knownFiles].some(file => file.startsWith(`${resolved}/`)) ||
      (insideProject && fs.existsSync(path.join(projectDir, resolved)));
    if (available) return `[${label}](${link(from, resolved)}${anchor ? `#${anchor}` : ''})`;
    return `${label} (\`${destination}\`; not included in this configuration)`;
  });
}

/** Build a complete in-memory output plan before touching the consumer. */
export function buildPlan(project, options = {}) {
  const { projectDir, preset, stack, framework, packageJson } = project;
  validatePreset(preset, stack);
  const previous = project.config ?? {};
  const previousStack = previous.project?.stack ?? stackForFramework(previous.project?.framework);
  if (previousStack && previousStack !== stack && !options.force) {
    throw new Error('Existing configuration uses a different stack. Use --force to regenerate intentionally.');
  }
  const switching = previousStack && previousStack !== stack;
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const agents = options.agents ?? previous.agents ?? ['copilot', 'claude'];
  if (!Array.isArray(agents) || !agents.length || agents.some(id => !Object.hasOwn(AGENTS, id))) {
    throw new Error('Choose at least one valid assistant with --agents');
  }
  const styling = previous.project?.styling ?? (deps.tailwindcss ? 'tailwind' : deps['@mui/material'] ? 'mui' : deps['styled-components'] ? 'styled' : 'vanilla');
  const database = previous.project?.database ?? (deps['@supabase/supabase-js'] ? 'supabase' : deps.firebase ? 'firebase' : deps['@prisma/client'] ? 'prisma' : 'none');
  const features = {
    gemini: Boolean(deps['@google/generative-ai'] || deps['@google/genai']),
    storybook: Object.keys(deps).some(name => name === 'storybook' || name.startsWith('@storybook/')),
    threejs: Boolean(deps.three || deps['@react-three/fiber']),
    github: agents.includes('copilot'),
    ...previous.features
  };
  if (options.agents) features.github = agents.includes('copilot');
  if (previous.version === '1.0.0' && previous.features?.github === undefined) features.github = agents.includes('copilot');
  const enabled = unique([styling, database, ...Object.keys(features).filter(key => features[key])]);
  const warnings = [];
  const lists = { rules: [], skills: [], instructions: [] };
  const sources = new Map();
  function include(root, field, names) {
    for (const name of names) {
      const key = `${field}/${name}`;
      if (sources.has(key) && sources.get(key) !== root) throw new Error(`Duplicate asset destination: ${key}`);
      sources.set(key, root);
      if (!lists[field].includes(name)) lists[field].push(name);
    }
  }
  if (stack !== 'react') {
    for (const field of Object.keys(lists)) include(CORE_ROOT, field, CORE[field]);
  }
  for (const field of Object.keys(lists)) include(preset.root, field, preset[field]);
  for (const capability of enabled) {
    const extra = Object.hasOwn(preset.features, capability) ? preset.features[capability] : undefined;
    if (extra) {
      for (const field of Object.keys(lists)) include(preset.root, field, extra[field] ?? []);
    } else if (capability === 'github' && stack !== 'react') {
      include(CORE_ROOT, 'skills', ['github-automation']);
    } else if (!['none', 'vanilla', 'github'].includes(capability)) {
      warnings.push(`${capability} integration guidance is not included in the ${stack} preset.`);
    }
  }
  const excluded = previous.rules?.exclude ?? [];
  for (const rule of previous.rules?.include ?? []) {
    if (lists.rules.includes(rule) || excluded.includes(rule)) continue;
    const presetFile = path.join(preset.root, 'rules', `${rule}.md`);
    const coreFile = path.join(CORE_ROOT, 'rules', `${rule}.md`);
    if (fs.existsSync(presetFile)) include(preset.root, 'rules', [rule]);
    else if (stack !== 'react' && fs.existsSync(coreFile)) include(CORE_ROOT, 'rules', [rule]);
    else if (switching) warnings.push(`Previous-stack rule '${rule}' is not included in ${stack}; any existing file is retained.`);
    else {
      const local = path.join(projectDir, '.agents/rules', `${rule}.md`);
      if (!fs.existsSync(local)) throw new Error(`Configured rule '${rule}' is unavailable in the preset or .agents/rules.`);
      include(path.join(projectDir, '.agents'), 'rules', [rule]);
    }
  }
  lists.rules = lists.rules.filter(rule => !excluded.includes(rule));
  const config = {
    ...previous,
    $schema: previous.$schema ?? 'https://raw.githubusercontent.com/ericthayer/agents-config/main/schemas/agents-project.schema.json',
    version: SCHEMA_VERSION,
    project: { ...previous.project, name: previous.project?.name ?? packageJson.name ?? path.basename(projectDir), stack, framework, styling, database },
    agents: unique(agents),
    features,
    rules: { ...previous.rules, include: lists.rules, exclude: excluded },
    overrides: previous.overrides ?? {}
  };
  const files = [];
  let guidelines = read(path.join(preset.root, 'AGENTS.md'));
  if (stack !== 'react') guidelines = `${read(path.join(CORE_ROOT, 'AGENTS.md'))}\n\n---\n\n${guidelines}`;
  files.push({ relativePath: '.agents/AGENTS.md', content: guidelines });
  for (const field of Object.keys(lists)) {
    for (const name of lists[field]) {
      const root = sources.get(`${field}/${name}`);
      if (field === 'skills') collectFolder(path.join(root, field, name), `.agents/skills/${name}`, files);
      else {
        const filename = `${name}${field === 'instructions' ? '.instructions' : ''}.md`;
        files.push({
          relativePath: `.agents/${field}/${filename}`,
          content: read(path.join(root, field, filename)),
          isUserContent: root === path.join(projectDir, '.agents')
        });
      }
    }
  }
  if (features.github) {
    const githubRoot = stack === 'react' ? preset.root : CORE_ROOT;
    for (const file of GITHUB_FILES) files.push({ relativePath: `.github/${file}`, content: read(path.join(githubRoot, 'github', file)) });
  }
  const template = read(path.join(CORE_ROOT, 'adapter.template.md'));
  for (const id of config.agents) {
    const file = AGENTS[id].file;
    const list = field => files.filter(entry => entry.relativePath.startsWith(`.agents/${field}/`))
      .map(entry => `- [${entry.relativePath.slice(8)}](${link(file, entry.relativePath)})`).join('\n');
    const values = {
      AGENT: AGENTS[id].name, PROJECT_NAME: markdown(config.project.name),
      PACKAGE_NAME: `@agents-config/${stack}`, FRAMEWORK: markdown(preset.frameworks[framework]),
      STYLING: markdown(styling), DATABASE: markdown(database),
      GUIDELINES_PATH: link(file, '.agents/AGENTS.md'),
      RULES_LIST: list('rules'), SKILLS_LIST: list('skills'), INSTRUCTIONS_LIST: list('instructions')
    };
    files.push({ relativePath: file, content: template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
      if (!(key in values)) throw new Error(`Unknown adapter placeholder: ${key}`);
      return values[key];
    }) });
  }
  files.push({ relativePath: '.agents-project.json', content: `${JSON.stringify(config, null, 2)}\n` });
  const known = new Set(files.map(file => file.relativePath));
  if (known.size !== files.length) throw new Error('Duplicate destination in generation plan');
  for (const file of files) {
    if (file.relativePath.endsWith('.md') && !file.isUserContent) {
      file.content = renderAssetLinks(file.content, file.relativePath, known, projectDir);
    }
  }
  if (switching) {
    warnings.push('Stack changed: existing files outside this plan are retained. Review .agents/ for previous-stack content.');
    for (const retained of existingFiles(path.join(projectDir, '.agents'), '.agents').filter(file => !known.has(file))) {
      warnings.push(`Retained outside the new plan: ${retained}`);
    }
  }
  return { config, files, warnings };
}

export function assertSafeDestination(projectDir, relativePath) {
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes('..')) throw new Error(`Unsafe destination: ${relativePath}`);
  let current = path.resolve(projectDir);
  for (const part of ['.', ...relativePath.split('/')]) {
    current = path.join(current, part);
    let stat;
    try { stat = fs.lstatSync(current); }
    catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (stat.isSymbolicLink()) throw new Error(`Refusing symlinked destination: ${current}`);
    if (current !== path.resolve(projectDir, relativePath) && !stat.isDirectory()) {
      throw new Error(`Destination parent is not a directory: ${current}`);
    }
    if (current === path.resolve(projectDir, relativePath) && !stat.isFile()) {
      throw new Error(`Destination is not a file: ${current}`);
    }
  }
}

export function writePlan(projectDir, plan, { dryRun = false, force = false } = {}) {
  for (const file of plan.files) assertSafeDestination(projectDir, file.relativePath);
  const written = [], skipped = [];
  for (const file of plan.files) {
    const destination = path.join(projectDir, file.relativePath);
    if (!force && fs.existsSync(destination)) {
      skipped.push(file.relativePath);
      continue;
    }
    if (!dryRun) {
      assertSafeDestination(projectDir, file.relativePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, file.content, { flag: force ? 'w' : 'wx' });
    }
    written.push(file.relativePath);
  }
  return { written, skipped };
}
