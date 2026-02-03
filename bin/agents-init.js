#!/usr/bin/env node

/**
 * agents-init - Initialize AI agent configuration for a project
 * 
 * Usage:
 *   npx agents-init              # Interactive mode
 *   npx agents-init --dry-run    # Preview without writing files
 *   npx agents-init --force      # Overwrite existing files
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  file: (msg) => console.log(`  ${colors.dim}${msg}${colors.reset}`),
};

// Available agents and their config files
const AGENTS = {
  copilot: {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
    template: 'copilot.template.md',
  },
  claude: {
    name: 'Claude (Anthropic)',
    file: 'CLAUDE.md',
    template: 'claude.template.md',
  },
  cursor: {
    name: 'Cursor',
    file: '.cursorrules',
    template: 'cursor.template.md',
  },
  gemini: {
    name: 'Gemini (Google)',
    file: '.gemini/config.md',
    template: 'gemini.template.md',
  },
  codex: {
    name: 'Codex (OpenAI)',
    file: '.codex/AGENTS.md',
    template: 'codex.template.md',
  },
  windsurf: {
    name: 'Windsurf/Codeium',
    file: '.windsurfrules',
    template: 'windsurf.template.md',
  },
};

// Available frameworks/technologies
const FRAMEWORKS = {
  next: 'Next.js',
  react: 'React (Vite/CRA)',
  remix: 'Remix',
  astro: 'Astro',
};

const STYLING = {
  tailwind: 'Tailwind CSS',
  mui: 'Material-UI (MUI)',
  vanilla: 'Vanilla CSS/CSS Modules',
  styled: 'Styled Components',
};

const DATABASES = {
  supabase: 'Supabase',
  firebase: 'Firebase',
  prisma: 'Prisma',
  none: 'None/Other',
};

// Core rules always included
const CORE_RULES = ['accessibility', 'component-architecture', 'spec-driven-development', 'web-performance'];

// Core skills always included
const CORE_SKILLS = ['accessibility-audit', 'scaffold-component', 'workflows'];

// Core skill workflows always included

// Core instructions always included
const CORE_INSTRUCTIONS = ['development-standards', 'web-interface-guidelines'];

// .github files to include (excluding workflows which are package-specific)
const GITHUB_FILES = [
  'COMMIT_CONVENTION.md',
  'GITHUB_AUTH_SETUP.md',
  'pr-template-commits.md',
  'pr-body-semantic-release.md',
];

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
  console.log(`
${colors.bright}agents-init${colors.reset} - Initialize AI agent configuration

${colors.bright}Usage:${colors.reset}
  npx agents-init              Interactive mode
  npx agents-init --dry-run    Preview without writing files
  npx agents-init --force      Overwrite existing files
  npx agents-init --help       Show this help message

${colors.bright}Description:${colors.reset}
  Sets up AI agent configuration files for your project:
  
  1. Creates a .agents/ folder with relevant rules, skills, and instructions
  2. Creates adapter files for your AI coding assistants
  3. Creates .agents-project.json for project-specific config

${colors.bright}What gets copied:${colors.reset}
  .agents/
    - AGENTS.md (core guidelines)
    - prompts/ (reusable AI workflow templates)
    - rules/ (coding standards based on your stack)
    - skills/ (specialized workflows)
    - instructions/ (process guidelines)
  
  .github/
    - COMMIT_CONVENTION.md (conventional commits guide)
    - GITHUB_AUTH_SETUP.md (GitHub CLI/token setup)
    - pr-template-commits.md (PR description template)
    - pr-body-semantic-release.md (semantic release PR template)

${colors.bright}Supported Agents:${colors.reset}
  - GitHub Copilot (.github/copilot-instructions.md)
  - Claude (CLAUDE.md)
  - Cursor (.cursorrules)
  - Gemini (.gemini/config.md)
  - Codex (.codex/AGENTS.md)
  - Windsurf (.windsurfrules)

${colors.bright}Package:${colors.reset}
  npm: https://www.npmjs.com/package/agents-config

${colors.bright}More Info:${colors.reset}
  https://github.com/ericthayer/agents-config
`);
  process.exit(0);
}

// Create readline interface for interactive prompts
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

async function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function multiSelect(rl, prompt, options) {
  console.log(`\n${colors.bright}${prompt}${colors.reset}`);
  console.log(`${colors.cyan}(Enter comma-separated numbers, or 'all')${colors.reset}\n`);
  
  const keys = Object.keys(options);
  keys.forEach((key, i) => {
    console.log(`  ${i + 1}. ${options[key]}`);
  });
  
  const answer = await question(rl, '\n> ');
  
  if (answer.toLowerCase() === 'all') {
    return keys;
  }
  
  const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
  return indices.filter(i => i >= 0 && i < keys.length).map(i => keys[i]);
}

async function singleSelect(rl, prompt, options) {
  console.log(`\n${colors.bright}${prompt}${colors.reset}\n`);
  
  const keys = Object.keys(options);
  keys.forEach((key, i) => {
    console.log(`  ${i + 1}. ${options[key]}`);
  });
  
  const answer = await question(rl, '\n> ');
  const index = parseInt(answer.trim()) - 1;
  
  if (index >= 0 && index < keys.length) {
    return keys[index];
  }
  return keys[0]; // Default to first option
}

async function confirm(rl, prompt) {
  const answer = await question(rl, `${colors.bright}${prompt} (y/n)${colors.reset} `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

function detectExistingConfig(projectDir) {
  const detected = {
    agents: [],
    framework: null,
    styling: null,
    database: null,
    gemini: false,
    storybook: false,
    threejs: false,
    hasAgentsFolder: false,
  };
  
  // Check for existing agent configs
  Object.entries(AGENTS).forEach(([key, config]) => {
    const filePath = path.join(projectDir, config.file);
    if (fs.existsSync(filePath)) {
      detected.agents.push(key);
    }
  });
  
  // Check for existing .agents folder
  if (fs.existsSync(path.join(projectDir, '.agents'))) {
    detected.hasAgentsFolder = true;
  }
  
  // Check package.json for framework/dependencies
  const pkgPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Framework detection
      if (deps['next']) detected.framework = 'next';
      else if (deps['remix'] || deps['@remix-run/react']) detected.framework = 'remix';
      else if (deps['astro']) detected.framework = 'astro';
      else if (deps['react']) detected.framework = 'react';
      
      // Styling detection
      if (deps['tailwindcss']) detected.styling = 'tailwind';
      else if (deps['@mui/material']) detected.styling = 'mui';
      else if (deps['styled-components']) detected.styling = 'styled';
      
      // Database detection
      if (deps['@supabase/supabase-js']) detected.database = 'supabase';
      else if (deps['firebase']) detected.database = 'firebase';
      else if (deps['@prisma/client']) detected.database = 'prisma';
      
      // Additional feature detection
      if (deps['@google/generative-ai']) detected.gemini = true;
      if (deps['storybook'] || deps['@storybook/react'] || deps['@storybook/nextjs']) detected.storybook = true;
      if (deps['three'] || deps['@react-three/fiber']) detected.threejs = true;
      
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  // Check for .gemini folder (indicates Gemini usage)
  if (fs.existsSync(path.join(projectDir, '.gemini'))) {
    detected.gemini = true;
  }
  
  return detected;
}

function determineRules(config) {
  const rules = [...CORE_RULES];
  
  if (config.styling === 'tailwind') rules.push('tailwind-v4');
  if (config.styling === 'mui') rules.push('mui');
  if (config.database === 'supabase') rules.push('supabase');
  if (config.gemini) rules.push('gemini');
  if (config.threejs) rules.push('three-js-react');
  
  return rules;
}

function determineSkills(config) {
  const skills = [...CORE_SKILLS];
  
  if (config.gemini) skills.push('integrate-gemini');
  
  // Additional skills can be installed via: npx add-skill vercel-labs/agent-skills
  
  return skills;
}

function determineInstructions(config) {
  const instructions = [...CORE_INSTRUCTIONS];
  
  if (config.styling === 'mui') instructions.push('mui');
  if (config.storybook) instructions.push('storybook');
  
  return instructions;
}

function generateProjectConfig(config) {
  const rulesInclude = determineRules(config);
  
  return {
    $schema: 'https://raw.githubusercontent.com/ericthayer/agents-config/main/schemas/agents-project.schema.json',
    version: '1.0.0',
    project: {
      name: config.projectName || path.basename(process.cwd()),
      framework: config.framework || 'react',
      styling: config.styling || 'vanilla',
      database: config.database || 'none',
    },
    agents: config.agents || ['copilot', 'claude'],
    features: {
      gemini: config.gemini || false,
      storybook: config.storybook || false,
      threejs: config.threejs || false,
    },
    rules: {
      include: rulesInclude,
      exclude: [],
    },
    overrides: {},
  };
}

function copyFileSync(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyFolderSync(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyAgentsFolder(projectDir, config, filesToCreate) {
  const agentsDir = path.join(projectDir, '.agents');
  const rules = determineRules(config);
  const skills = determineSkills(config);
  const instructions = determineInstructions(config);
  
  // AGENTS.md
  const agentsMdSrc = path.join(PACKAGE_ROOT, 'AGENTS.md');
  const agentsMdDest = path.join(agentsDir, 'AGENTS.md');
  if (fs.existsSync(agentsMdSrc)) {
    filesToCreate.push({
      src: agentsMdSrc,
      dest: agentsMdDest,
      relativePath: '.agents/AGENTS.md',
      type: 'file',
    });
  }
  
  // Prompts (reusable AI agent workflows)
  const promptsDir = path.join(PACKAGE_ROOT, 'prompts');
  const promptsDest = path.join(agentsDir, 'prompts');
  if (fs.existsSync(promptsDir)) {
    filesToCreate.push({
      src: promptsDir,
      dest: promptsDest,
      relativePath: '.agents/prompts/',
      type: 'folder',
    });
  }
  
  // Rules
  for (const rule of rules) {
    const src = path.join(PACKAGE_ROOT, 'rules', `${rule}.md`);
    const dest = path.join(agentsDir, 'rules', `${rule}.md`);
    if (fs.existsSync(src)) {
      filesToCreate.push({
        src,
        dest,
        relativePath: `.agents/rules/${rule}.md`,
        type: 'file',
      });
    }
  }
  
  // Skills
  for (const skill of skills) {
    const srcDir = path.join(PACKAGE_ROOT, 'skills', skill);
    const destDir = path.join(agentsDir, 'skills', skill);
    
    if (fs.existsSync(srcDir)) {
      // Copy entire skill folder
      filesToCreate.push({
        src: srcDir,
        dest: destDir,
        relativePath: `.agents/skills/${skill}/`,
        type: 'folder',
      });
    }
  }
  
  // Instructions
  for (const instruction of instructions) {
    const src = path.join(PACKAGE_ROOT, 'instructions', `${instruction}.instructions.md`);
    const dest = path.join(agentsDir, 'instructions', `${instruction}.instructions.md`);
    if (fs.existsSync(src)) {
      filesToCreate.push({
        src,
        dest,
        relativePath: `.agents/instructions/${instruction}.instructions.md`,
        type: 'file',
      });
    }
  }
  
  return filesToCreate;
}

function copyGithubFolder(projectDir, filesToCreate) {
  const githubDir = path.join(projectDir, '.github');
  
  // Copy individual .github files (not workflows)
  for (const file of GITHUB_FILES) {
    const src = path.join(PACKAGE_ROOT, '.github', file);
    const dest = path.join(githubDir, file);
    if (fs.existsSync(src)) {
      filesToCreate.push({
        src,
        dest,
        relativePath: `.github/${file}`,
        type: 'file',
      });
    }
  }
  
  return filesToCreate;
}

function loadTemplate(templateName) {
  const templatePath = path.join(PACKAGE_ROOT, 'adapters', templateName);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }
  return null;
}

function processTemplate(template, config) {
  if (!template) return '';
  
  const projectConfig = generateProjectConfig(config);
  
  return template
    .replace(/\{\{PROJECT_NAME\}\}/g, projectConfig.project.name)
    .replace(/\{\{FRAMEWORK\}\}/g, FRAMEWORKS[projectConfig.project.framework] || projectConfig.project.framework)
    .replace(/\{\{STYLING\}\}/g, STYLING[projectConfig.project.styling] || projectConfig.project.styling)
    .replace(/\{\{DATABASE\}\}/g, DATABASES[projectConfig.project.database] || projectConfig.project.database)
    .replace(/\{\{RULES_LIST\}\}/g, projectConfig.rules.include.map(r => `- .agents/rules/${r}.md`).join('\n'))
    .replace(/\{\{PACKAGE_PATH\}\}/g, '.agents');
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

async function main() {
  log.header('🤖 agents-init - AI Agent Configuration');
  
  const projectDir = process.cwd();
  const rl = createPrompt();
  
  try {
    // Detect existing configuration
    log.info('Scanning project...');
    const detected = detectExistingConfig(projectDir);
    
    if (detected.framework) {
      log.info(`Detected framework: ${FRAMEWORKS[detected.framework]}`);
    }
    if (detected.styling) {
      log.info(`Detected styling: ${STYLING[detected.styling]}`);
    }
    if (detected.database) {
      log.info(`Detected database: ${DATABASES[detected.database]}`);
    }
    if (detected.gemini) {
      log.info('Detected Gemini integration');
    }
    if (detected.storybook) {
      log.info('Detected Storybook');
    }
    if (detected.threejs) {
      log.info('Detected Three.js');
    }
    if (detected.hasAgentsFolder) {
      log.warn('Existing .agents folder found');
      if (!isForce) {
        log.warn('Use --force to overwrite existing files');
      }
    }
    if (detected.agents.length > 0) {
      log.warn(`Existing agent configs found: ${detected.agents.join(', ')}`);
    }
    
    // Interactive prompts
    const selectedAgents = await multiSelect(rl, 'Which AI agents do you use?', 
      Object.fromEntries(Object.entries(AGENTS).map(([k, v]) => [k, v.name]))
    );
    
    const framework = detected.framework || await singleSelect(rl, 'Which framework?', FRAMEWORKS);
    const styling = detected.styling || await singleSelect(rl, 'Which styling approach?', STYLING);
    const database = detected.database || await singleSelect(rl, 'Which database/backend?', DATABASES);
    
    // Ask about Gemini if not detected
    let gemini = detected.gemini;
    if (!gemini && selectedAgents.includes('gemini')) {
      gemini = true;
    }
    if (!gemini) {
      gemini = await confirm(rl, '\nDoes this project use Gemini AI features?');
    }
    
    const config = {
      projectName: path.basename(projectDir),
      agents: selectedAgents,
      framework,
      styling,
      database,
      gemini,
      storybook: detected.storybook,
      threejs: detected.threejs,
    };
    
    // Collect all files to create
    const filesToCreate = [];
    
    // Add .agents folder contents
    copyAgentsFolder(projectDir, config, filesToCreate);
    
    // Add .github folder contents only when GitHub Copilot is selected
    if (selectedAgents.includes('copilot')) {
      copyGithubFolder(projectDir, filesToCreate);
    }
    
    // Add agent adapter files
    for (const agentKey of selectedAgents) {
      const agent = AGENTS[agentKey];
      const filePath = path.join(projectDir, agent.file);
      const exists = fs.existsSync(filePath);
      
      if (exists && !isForce) {
        // Skip existing files unless --force
        continue;
      }
      
      const template = loadTemplate(agent.template);
      const content = processTemplate(template, config);
      
      filesToCreate.push({
        dest: filePath,
        relativePath: agent.file,
        content,
        type: 'adapter',
        exists,
      });
    }
    
    // Add project config file
    const projectConfigPath = path.join(projectDir, '.agents-project.json');
    const projectConfigExists = fs.existsSync(projectConfigPath);
    if (!projectConfigExists || isForce) {
      filesToCreate.push({
        dest: projectConfigPath,
        relativePath: '.agents-project.json',
        content: JSON.stringify(generateProjectConfig(config), null, 2),
        type: 'config',
        exists: projectConfigExists,
      });
    }
    
    // Show summary
    log.header('📁 Files to be created:');
    
    console.log(`\n${colors.bright}.agents/ folder:${colors.reset}`);
    filesToCreate.filter(f => f.relativePath.startsWith('.agents/')).forEach(f => {
      log.file(f.relativePath);
    });
    
    console.log(`\n${colors.bright}.github/ folder:${colors.reset}`);
    filesToCreate.filter(f => f.relativePath.startsWith('.github/') && f.type === 'file').forEach(f => {
      log.file(f.relativePath);
    });
    
    console.log(`\n${colors.bright}Adapter files:${colors.reset}`);
    filesToCreate.filter(f => f.type === 'adapter').forEach(f => {
      const prefix = f.exists ? '(overwrite) ' : '';
      log.file(`${prefix}${f.relativePath}`);
    });
    
    console.log(`\n${colors.bright}Config:${colors.reset}`);
    filesToCreate.filter(f => f.type === 'config').forEach(f => {
      log.file(f.relativePath);
    });
    
    // Warn about skipped files
    const skippedAgents = selectedAgents.filter(key => {
      const agent = AGENTS[key];
      const filePath = path.join(projectDir, agent.file);
      return fs.existsSync(filePath) && !isForce;
    });
    
    if (skippedAgents.length > 0) {
      console.log(`\n${colors.yellow}Skipped (use --force to overwrite):${colors.reset}`);
      skippedAgents.forEach(key => {
        log.file(AGENTS[key].file);
      });
    }
    
    if (isDryRun) {
      log.header('🔍 Dry run complete - no files written');
      rl.close();
      return;
    }
    
    const shouldProceed = await confirm(rl, '\nCreate these files?');
    
    if (!shouldProceed) {
      log.info('Aborted');
      rl.close();
      return;
    }
    
    log.header('✍️  Creating files...');
    
    for (const file of filesToCreate) {
      try {
        if (file.type === 'file') {
          copyFileSync(file.src, file.dest);
        } else if (file.type === 'folder') {
          copyFolderSync(file.src, file.dest);
        } else {
          // adapter or config - write content
          writeFile(file.dest, file.content);
        }
        log.success(`Created ${file.relativePath}`);
      } catch (error) {
        log.error(`Failed to create ${file.relativePath}: ${error.message}`);
      }
    }
    
    log.header('✅ Setup complete!');
    console.log(`
${colors.cyan}What was created:${colors.reset}

  ${colors.bright}.agents/${colors.reset}
    Your project's local copy of rules, skills, and instructions.
    AI agents can read these files for context.

  ${colors.bright}.github/${colors.reset}
    PR templates, commit conventions, and GitHub workflow guides.

  ${colors.bright}Adapter files${colors.reset}
    Thin config files that reference .agents/ for each AI tool.

  ${colors.bright}.agents-project.json${colors.reset}
    Project-specific configuration and overrides.

${colors.cyan}Next steps:${colors.reset}

1. Review the files in .agents/ and customize as needed
2. Commit the .agents/ folder and adapter files to git
3. Your AI agents will now follow consistent guidelines

${colors.cyan}Optional skills:${colors.reset}

  ${colors.bright}npx add-skill vercel-labs/agent-skills${colors.reset}
    Install Vercel's React best practices (45+ performance rules)

${colors.cyan}Useful commands:${colors.reset}

  ${colors.bright}npx agents-init --force${colors.reset}    Regenerate all config files
  ${colors.bright}npx agents-init --dry-run${colors.reset}  Preview changes without writing

${colors.cyan}Documentation:${colors.reset}
  https://github.com/ericthayer/agents-config
`);
    
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
