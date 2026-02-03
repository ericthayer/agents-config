#!/usr/bin/env node

/**
 * agents-analyze - Analyze and customize AI agent configurations
 * 
 * Usage:
 *   npx agents-analyze              # Analyze and update agent files
 *   npx agents-analyze --dry-run    # Preview analysis without writing files
 *   npx agents-analyze --report     # Generate analysis report only
 *   npx agents-analyze --verify     # Verify current configuration
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
  magenta: '\x1b[35m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  subheader: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`),
  file: (msg) => console.log(`  ${colors.dim}${msg}${colors.reset}`),
  detail: (msg) => console.log(`    ${colors.dim}${msg}${colors.reset}`),
  finding: (msg) => console.log(`  ${colors.magenta}→${colors.reset} ${msg}`),
};

// Known agents and their config files
const AGENTS = {
  copilot: {
    name: 'GitHub Copilot',
    file: '.github/copilot-instructions.md',
  },
  claude: {
    name: 'Claude (Anthropic)',
    file: 'CLAUDE.md',
  },
  cursor: {
    name: 'Cursor',
    file: '.cursorrules',
  },
  gemini: {
    name: 'Gemini (Google)',
    file: '.gemini/config.md',
  },
  codex: {
    name: 'Codex (OpenAI)',
    file: '.codex/AGENTS.md',
  },
  windsurf: {
    name: 'Windsurf/Codeium',
    file: '.windsurfrules',
  },
};

// File patterns to scan for project analysis
const SCAN_PATTERNS = {
  components: ['**/components/**/*.{tsx,jsx,ts,js}', '**/src/**/*.{tsx,jsx}'],
  pages: ['**/pages/**/*.{tsx,jsx}', '**/app/**/*.{tsx,jsx}', '**/routes/**/*.{tsx,jsx}'],
  api: ['**/api/**/*.{ts,js}', '**/server/**/*.{ts,js}', '**/functions/**/*.{ts,js}'],
  hooks: ['**/hooks/**/*.{ts,tsx,js,jsx}', '**/use*.{ts,tsx,js,jsx}'],
  utils: ['**/utils/**/*.{ts,js}', '**/lib/**/*.{ts,js}', '**/helpers/**/*.{ts,js}'],
  tests: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/__tests__/**/*'],
  styles: ['**/*.css', '**/*.scss', '**/*.module.css', '**/tailwind.config.*'],
  config: ['*.config.{ts,js,mjs,cjs}', 'tsconfig*.json', '.env*'],
};

// Directories to always ignore
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.cache',
  'coverage',
  '.turbo',
  '.vercel',
];

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isReportOnly = args.includes('--report');
const isVerifyOnly = args.includes('--verify');
const isHelp = args.includes('--help') || args.includes('-h');
const isVerbose = args.includes('--verbose') || args.includes('-v');

if (isHelp) {
  console.log(`
${colors.bright}agents-analyze${colors.reset} - Analyze and customize AI agent configurations

${colors.bright}Usage:${colors.reset}
  npx agents-analyze              Analyze codebase and update agent files
  npx agents-analyze --dry-run    Preview changes without writing files
  npx agents-analyze --report     Generate analysis report only
  npx agents-analyze --verify     Verify current configuration
  npx agents-analyze --verbose    Show detailed analysis output
  npx agents-analyze --help       Show this help message

${colors.bright}Description:${colors.reset}
  Scans your codebase to understand its structure, patterns, and conventions,
  then updates your AI agent configuration files with project-specific context.

${colors.bright}What it analyzes:${colors.reset}
  - Project structure and file organization
  - Components, pages, and API routes
  - Custom hooks and utilities
  - Dependencies and their versions
  - Configuration files and patterns
  - Existing conventions and naming patterns
  - Test coverage and testing patterns
  - Environment and deployment setup

${colors.bright}What it updates:${colors.reset}
  - .agents/AGENTS.md with project-specific context
  - Agent adapter files (copilot-instructions.md, CLAUDE.md, etc.)
  - .agents-project.json with detected features

${colors.bright}Outputs:${colors.reset}
  - .agents/ANALYSIS.md - Full analysis report
  - .agents/PROJECT-CONTEXT.md - AI-ready project summary

${colors.bright}Prerequisites:${colors.reset}
  Run 'npx agents-init' first to create initial configuration

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

async function confirm(rl, prompt) {
  const answer = await question(rl, `${colors.bright}${prompt} (y/n)${colors.reset} `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

/**
 * Recursively scan directory for files matching patterns
 */
function scanDirectory(dir, maxDepth = 10, currentDepth = 0) {
  const results = {
    files: [],
    dirs: [],
    totalFiles: 0,
    totalDirs: 0,
  };
  
  if (currentDepth >= maxDepth) return results;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.includes(entry.name) || entry.name.startsWith('.')) {
          continue;
        }
        results.dirs.push(fullPath);
        results.totalDirs++;
        
        const subResults = scanDirectory(fullPath, maxDepth, currentDepth + 1);
        results.files.push(...subResults.files);
        results.dirs.push(...subResults.dirs);
        results.totalFiles += subResults.totalFiles;
        results.totalDirs += subResults.totalDirs;
      } else {
        results.files.push(fullPath);
        results.totalFiles++;
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
  
  return results;
}

/**
 * Categorize files by type
 */
function categorizeFiles(files, projectDir) {
  const categories = {
    components: [],
    pages: [],
    api: [],
    hooks: [],
    utils: [],
    tests: [],
    styles: [],
    config: [],
    other: [],
  };
  
  for (const file of files) {
    const relativePath = path.relative(projectDir, file);
    const ext = path.extname(file);
    const basename = path.basename(file);
    const dirPath = path.dirname(relativePath);
    
    // Categorize based on path patterns
    if (relativePath.includes('components/') || relativePath.includes('Components/')) {
      categories.components.push(relativePath);
    } else if (relativePath.includes('pages/') || relativePath.includes('app/') && ext.match(/\.(tsx?|jsx?)$/)) {
      categories.pages.push(relativePath);
    } else if (relativePath.includes('api/') || relativePath.includes('server/') || relativePath.includes('functions/')) {
      categories.api.push(relativePath);
    } else if (relativePath.includes('hooks/') || basename.startsWith('use')) {
      categories.hooks.push(relativePath);
    } else if (relativePath.includes('utils/') || relativePath.includes('lib/') || relativePath.includes('helpers/')) {
      categories.utils.push(relativePath);
    } else if (basename.includes('.test.') || basename.includes('.spec.') || relativePath.includes('__tests__')) {
      categories.tests.push(relativePath);
    } else if (ext.match(/\.(css|scss|less|sass)$/)) {
      categories.styles.push(relativePath);
    } else if (basename.includes('config') || basename === 'tsconfig.json' || basename.startsWith('.env')) {
      categories.config.push(relativePath);
    } else {
      categories.other.push(relativePath);
    }
  }
  
  return categories;
}

/**
 * Extract naming conventions from file names
 */
function analyzeNamingConventions(files) {
  const conventions = {
    componentStyle: null, // PascalCase, camelCase, kebab-case
    fileExtension: null, // .tsx, .jsx, .ts, .js
    testNaming: null, // .test., .spec., __tests__
    indexFiles: false,
    barrelExports: false,
  };
  
  let pascalCount = 0;
  let camelCount = 0;
  let kebabCount = 0;
  let tsxCount = 0;
  let jsxCount = 0;
  let testCount = 0;
  let specCount = 0;
  let indexCount = 0;
  
  for (const file of files) {
    const basename = path.basename(file, path.extname(file));
    const ext = path.extname(file);
    
    // Check component naming
    if (basename.match(/^[A-Z][a-zA-Z0-9]*$/)) pascalCount++;
    else if (basename.match(/^[a-z][a-zA-Z0-9]*$/)) camelCount++;
    else if (basename.match(/^[a-z][a-z0-9-]*$/)) kebabCount++;
    
    // Check extensions
    if (ext === '.tsx') tsxCount++;
    else if (ext === '.jsx') jsxCount++;
    
    // Check test patterns
    if (file.includes('.test.')) testCount++;
    else if (file.includes('.spec.')) specCount++;
    
    // Check for index files
    if (basename === 'index') indexCount++;
  }
  
  // Determine conventions
  if (pascalCount > camelCount && pascalCount > kebabCount) {
    conventions.componentStyle = 'PascalCase';
  } else if (camelCount > pascalCount && camelCount > kebabCount) {
    conventions.componentStyle = 'camelCase';
  } else if (kebabCount > 0) {
    conventions.componentStyle = 'kebab-case';
  }
  
  conventions.fileExtension = tsxCount > jsxCount ? '.tsx' : '.jsx';
  conventions.testNaming = testCount >= specCount ? '.test.' : '.spec.';
  conventions.indexFiles = indexCount > 5;
  conventions.barrelExports = indexCount > 10;
  
  return conventions;
}

/**
 * Analyze package.json for dependencies and scripts
 */
function analyzePackageJson(projectDir) {
  const analysis = {
    name: null,
    version: null,
    type: null, // 'module' or 'commonjs'
    framework: null,
    styling: null,
    database: null,
    testing: null,
    linting: null,
    buildTool: null,
    deployment: null,
    features: [],
    scripts: {},
    keyDependencies: [],
  };
  
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return analysis;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    analysis.name = pkg.name;
    analysis.version = pkg.version;
    analysis.type = pkg.type || 'commonjs';
    analysis.scripts = pkg.scripts || {};
    
    // Framework detection
    if (deps['next']) {
      analysis.framework = 'Next.js';
      analysis.keyDependencies.push(`next@${deps['next']}`);
    } else if (deps['remix'] || deps['@remix-run/react']) {
      analysis.framework = 'Remix';
    } else if (deps['astro']) {
      analysis.framework = 'Astro';
    } else if (deps['nuxt']) {
      analysis.framework = 'Nuxt';
    } else if (deps['svelte'] || deps['@sveltejs/kit']) {
      analysis.framework = 'SvelteKit';
    } else if (deps['gatsby']) {
      analysis.framework = 'Gatsby';
    } else if (deps['react']) {
      analysis.framework = deps['vite'] ? 'React (Vite)' : 'React';
    } else if (deps['vue']) {
      analysis.framework = 'Vue';
    }
    
    // React version
    if (deps['react']) {
      analysis.keyDependencies.push(`react@${deps['react']}`);
      if (deps['react'].includes('19') || deps['react'].includes('canary')) {
        analysis.features.push('React 19');
      }
    }
    
    // Styling detection
    if (deps['tailwindcss']) {
      analysis.styling = 'Tailwind CSS';
      analysis.keyDependencies.push(`tailwindcss@${deps['tailwindcss']}`);
    } else if (deps['@mui/material']) {
      analysis.styling = 'Material-UI';
      analysis.keyDependencies.push(`@mui/material@${deps['@mui/material']}`);
    } else if (deps['styled-components']) {
      analysis.styling = 'Styled Components';
    } else if (deps['@emotion/react']) {
      analysis.styling = 'Emotion';
    } else if (deps['sass'] || deps['node-sass']) {
      analysis.styling = 'Sass/SCSS';
    }
    
    // Database detection
    if (deps['@supabase/supabase-js']) {
      analysis.database = 'Supabase';
      analysis.keyDependencies.push(`@supabase/supabase-js@${deps['@supabase/supabase-js']}`);
    } else if (deps['firebase']) {
      analysis.database = 'Firebase';
    } else if (deps['@prisma/client']) {
      analysis.database = 'Prisma';
    } else if (deps['drizzle-orm']) {
      analysis.database = 'Drizzle';
    } else if (deps['mongoose']) {
      analysis.database = 'MongoDB (Mongoose)';
    }
    
    // Testing detection
    if (deps['vitest']) {
      analysis.testing = 'Vitest';
    } else if (deps['jest']) {
      analysis.testing = 'Jest';
    } else if (deps['@playwright/test']) {
      analysis.testing = 'Playwright';
    } else if (deps['cypress']) {
      analysis.testing = 'Cypress';
    }
    
    // Linting detection
    if (deps['eslint']) {
      analysis.linting = 'ESLint';
      if (deps['prettier']) {
        analysis.linting += ' + Prettier';
      }
    } else if (deps['biome'] || deps['@biomejs/biome']) {
      analysis.linting = 'Biome';
    }
    
    // Build tool detection
    if (deps['turbo'] || deps['@turbo/gen']) {
      analysis.buildTool = 'Turborepo';
      analysis.features.push('Monorepo');
    } else if (deps['nx']) {
      analysis.buildTool = 'Nx';
      analysis.features.push('Monorepo');
    } else if (deps['vite']) {
      analysis.buildTool = 'Vite';
    } else if (deps['webpack']) {
      analysis.buildTool = 'Webpack';
    }
    
    // Additional features
    if (deps['@google/generative-ai']) {
      analysis.features.push('Google Gemini AI');
    }
    if (deps['openai']) {
      analysis.features.push('OpenAI API');
    }
    if (deps['@anthropic-ai/sdk']) {
      analysis.features.push('Anthropic Claude');
    }
    if (deps['storybook'] || deps['@storybook/react']) {
      analysis.features.push('Storybook');
    }
    if (deps['three'] || deps['@react-three/fiber']) {
      analysis.features.push('Three.js/R3F');
    }
    if (deps['framer-motion']) {
      analysis.features.push('Framer Motion');
    }
    if (deps['react-query'] || deps['@tanstack/react-query']) {
      analysis.features.push('TanStack Query');
    }
    if (deps['zustand']) {
      analysis.features.push('Zustand');
    }
    if (deps['jotai']) {
      analysis.features.push('Jotai');
    }
    if (deps['redux'] || deps['@reduxjs/toolkit']) {
      analysis.features.push('Redux');
    }
    if (deps['zod']) {
      analysis.features.push('Zod validation');
    }
    if (deps['react-hook-form']) {
      analysis.features.push('React Hook Form');
    }
    
    // TypeScript
    if (deps['typescript']) {
      analysis.features.push('TypeScript');
      analysis.keyDependencies.push(`typescript@${deps['typescript']}`);
    }
    
  } catch (e) {
    log.warn(`Could not parse package.json: ${e.message}`);
  }
  
  return analysis;
}

/**
 * Analyze TypeScript configuration
 */
function analyzeTypeScriptConfig(projectDir) {
  const analysis = {
    strict: false,
    baseUrl: null,
    paths: {},
    target: null,
    jsx: null,
  };
  
  const tsconfigPath = path.join(projectDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) return null;
  
  try {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    // Handle JSON with comments
    const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    const tsconfig = JSON.parse(cleaned);
    
    const opts = tsconfig.compilerOptions || {};
    analysis.strict = opts.strict || false;
    analysis.baseUrl = opts.baseUrl;
    analysis.paths = opts.paths || {};
    analysis.target = opts.target;
    analysis.jsx = opts.jsx;
    
  } catch (e) {
    // Ignore parse errors
  }
  
  return analysis;
}

/**
 * Detect existing .agents-project.json configuration
 */
function loadProjectConfig(projectDir) {
  const configPath = path.join(projectDir, '.agents-project.json');
  if (!fs.existsSync(configPath)) return null;
  
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    log.warn('Could not parse .agents-project.json');
    return null;
  }
}

/**
 * Detect existing agent configuration files
 */
function detectAgentConfigs(projectDir) {
  const configs = {};
  
  for (const [key, agent] of Object.entries(AGENTS)) {
    const filePath = path.join(projectDir, agent.file);
    if (fs.existsSync(filePath)) {
      try {
        configs[key] = {
          path: agent.file,
          content: fs.readFileSync(filePath, 'utf8'),
          size: fs.statSync(filePath).size,
        };
      } catch (e) {
        configs[key] = { path: agent.file, error: e.message };
      }
    }
  }
  
  return configs;
}

/**
 * Analyze README for project description
 */
function analyzeReadme(projectDir) {
  const readmePath = path.join(projectDir, 'README.md');
  if (!fs.existsSync(readmePath)) return null;
  
  try {
    const content = fs.readFileSync(readmePath, 'utf8');
    
    // Extract title (first h1)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract description (first paragraph after title)
    const descMatch = content.match(/^#.+\n\n([^\n#]+)/m);
    const description = descMatch ? descMatch[1].trim() : null;
    
    return { title, description, length: content.length };
  } catch (e) {
    return null;
  }
}

/**
 * Look for key project files
 */
function detectKeyFiles(projectDir) {
  const keyFiles = {
    readme: fs.existsSync(path.join(projectDir, 'README.md')),
    contributing: fs.existsSync(path.join(projectDir, 'CONTRIBUTING.md')),
    license: fs.existsSync(path.join(projectDir, 'LICENSE')),
    changelog: fs.existsSync(path.join(projectDir, 'CHANGELOG.md')),
    envExample: fs.existsSync(path.join(projectDir, '.env.example')) || fs.existsSync(path.join(projectDir, '.env.local.example')),
    docker: fs.existsSync(path.join(projectDir, 'Dockerfile')) || fs.existsSync(path.join(projectDir, 'docker-compose.yml')),
    cicd: fs.existsSync(path.join(projectDir, '.github/workflows')),
    husky: fs.existsSync(path.join(projectDir, '.husky')),
    editorconfig: fs.existsSync(path.join(projectDir, '.editorconfig')),
    nvmrc: fs.existsSync(path.join(projectDir, '.nvmrc')),
  };
  
  return keyFiles;
}

/**
 * Generate the analysis report
 */
function generateAnalysisReport(analysis) {
  const lines = [];
  
  lines.push('# Project Analysis Report');
  lines.push('');
  lines.push(`> Generated by \`npx agents-analyze\` on ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  
  // Project Overview
  lines.push('## Project Overview');
  lines.push('');
  if (analysis.packageJson.name) {
    lines.push(`**Name:** ${analysis.packageJson.name}`);
  }
  if (analysis.readme?.description) {
    lines.push(`**Description:** ${analysis.readme.description}`);
  }
  if (analysis.packageJson.framework) {
    lines.push(`**Framework:** ${analysis.packageJson.framework}`);
  }
  if (analysis.packageJson.styling) {
    lines.push(`**Styling:** ${analysis.packageJson.styling}`);
  }
  if (analysis.packageJson.database) {
    lines.push(`**Database:** ${analysis.packageJson.database}`);
  }
  lines.push('');
  
  // Tech Stack
  lines.push('## Tech Stack');
  lines.push('');
  if (analysis.packageJson.keyDependencies.length > 0) {
    lines.push('### Key Dependencies');
    for (const dep of analysis.packageJson.keyDependencies) {
      lines.push(`- ${dep}`);
    }
    lines.push('');
  }
  if (analysis.packageJson.features.length > 0) {
    lines.push('### Features');
    for (const feature of analysis.packageJson.features) {
      lines.push(`- ${feature}`);
    }
    lines.push('');
  }
  
  // Project Structure
  lines.push('## Project Structure');
  lines.push('');
  lines.push(`- **Total Files:** ${analysis.fileStructure.totalFiles}`);
  lines.push(`- **Total Directories:** ${analysis.fileStructure.totalDirs}`);
  lines.push('');
  
  if (analysis.categories) {
    lines.push('### File Distribution');
    lines.push('');
    lines.push('| Category | Count |');
    lines.push('|----------|-------|');
    for (const [cat, files] of Object.entries(analysis.categories)) {
      if (files.length > 0) {
        lines.push(`| ${cat} | ${files.length} |`);
      }
    }
    lines.push('');
  }
  
  // Conventions
  if (analysis.conventions) {
    lines.push('## Coding Conventions');
    lines.push('');
    if (analysis.conventions.componentStyle) {
      lines.push(`- **Component Naming:** ${analysis.conventions.componentStyle}`);
    }
    if (analysis.conventions.fileExtension) {
      lines.push(`- **File Extension:** ${analysis.conventions.fileExtension}`);
    }
    if (analysis.conventions.testNaming) {
      lines.push(`- **Test Naming:** ${analysis.conventions.testNaming}`);
    }
    if (analysis.conventions.indexFiles) {
      lines.push('- **Index Files:** Uses index.ts/js for exports');
    }
    if (analysis.conventions.barrelExports) {
      lines.push('- **Barrel Exports:** Uses barrel pattern extensively');
    }
    lines.push('');
  }
  
  // TypeScript Config
  if (analysis.tsconfig) {
    lines.push('## TypeScript Configuration');
    lines.push('');
    lines.push(`- **Strict Mode:** ${analysis.tsconfig.strict ? 'Yes' : 'No'}`);
    if (analysis.tsconfig.baseUrl) {
      lines.push(`- **Base URL:** ${analysis.tsconfig.baseUrl}`);
    }
    if (Object.keys(analysis.tsconfig.paths).length > 0) {
      lines.push('- **Path Aliases:**');
      for (const [alias, paths] of Object.entries(analysis.tsconfig.paths)) {
        lines.push(`  - \`${alias}\` → \`${paths[0]}\``);
      }
    }
    lines.push('');
  }
  
  // Key Files
  lines.push('## Project Setup');
  lines.push('');
  const keyFileLabels = {
    readme: 'README.md',
    contributing: 'CONTRIBUTING.md',
    license: 'LICENSE',
    changelog: 'CHANGELOG.md',
    envExample: 'Environment example',
    docker: 'Docker support',
    cicd: 'GitHub Actions CI/CD',
    husky: 'Git hooks (Husky)',
    editorconfig: 'EditorConfig',
    nvmrc: '.nvmrc (Node version)',
  };
  for (const [key, label] of Object.entries(keyFileLabels)) {
    const status = analysis.keyFiles[key] ? '✅' : '❌';
    lines.push(`- ${status} ${label}`);
  }
  lines.push('');
  
  // Agent Configs
  if (Object.keys(analysis.agentConfigs).length > 0) {
    lines.push('## Agent Configurations');
    lines.push('');
    for (const [key, config] of Object.entries(analysis.agentConfigs)) {
      const agent = AGENTS[key];
      lines.push(`### ${agent.name}`);
      lines.push(`- **File:** \`${config.path}\``);
      lines.push(`- **Size:** ${(config.size / 1024).toFixed(1)} KB`);
      lines.push('');
    }
  }
  
  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  lines.push('Based on this analysis, consider updating your agent configurations with:');
  lines.push('');
  
  const recommendations = [];
  
  if (analysis.packageJson.framework) {
    recommendations.push(`- Framework-specific patterns for ${analysis.packageJson.framework}`);
  }
  if (analysis.packageJson.styling) {
    recommendations.push(`- ${analysis.packageJson.styling} component patterns and class naming`);
  }
  if (analysis.tsconfig?.paths && Object.keys(analysis.tsconfig.paths).length > 0) {
    recommendations.push('- Import alias patterns (e.g., `@/components/...`)');
  }
  if (analysis.conventions?.componentStyle) {
    recommendations.push(`- ${analysis.conventions.componentStyle} naming convention for components`);
  }
  if (analysis.categories?.api?.length > 0) {
    recommendations.push('- API route patterns and data fetching conventions');
  }
  if (analysis.packageJson.testing) {
    recommendations.push(`- Testing patterns using ${analysis.packageJson.testing}`);
  }
  
  for (const rec of recommendations) {
    lines.push(rec);
  }
  
  if (recommendations.length === 0) {
    lines.push('- No specific recommendations at this time.');
  }
  
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Run `npx agents-analyze` again after making changes to update this report.*');
  
  return lines.join('\n');
}

/**
 * Generate PROJECT-CONTEXT.md for AI consumption
 */
function generateProjectContext(analysis) {
  const lines = [];
  
  lines.push('# Project Context');
  lines.push('');
  lines.push('> **This file provides project-specific context for AI coding assistants.**');
  lines.push('> Auto-generated by `npx agents-analyze`. Edit as needed.');
  lines.push('>');
  lines.push('> This file **extends** the general guidelines in [AGENTS.md](./AGENTS.md).');
  lines.push('> Project-specific patterns here override generic rules when they conflict.');
  lines.push('');
  
  lines.push('## Project Identity');
  lines.push('');
  if (analysis.packageJson.name) {
    lines.push(`- **Name:** ${analysis.packageJson.name}`);
  }
  if (analysis.readme?.description) {
    lines.push(`- **Purpose:** ${analysis.readme.description}`);
  }
  lines.push('');
  
  lines.push('## Technology Stack');
  lines.push('');
  const stack = [];
  if (analysis.packageJson.framework) stack.push(analysis.packageJson.framework);
  if (analysis.packageJson.styling) stack.push(analysis.packageJson.styling);
  if (analysis.packageJson.database) stack.push(analysis.packageJson.database);
  if (analysis.packageJson.testing) stack.push(analysis.packageJson.testing);
  if (analysis.packageJson.features.includes('TypeScript')) stack.push('TypeScript');
  lines.push(stack.join(' + '));
  lines.push('');
  
  if (analysis.packageJson.features.length > 0) {
    lines.push('### Additional Libraries');
    for (const feature of analysis.packageJson.features) {
      lines.push(`- ${feature}`);
    }
    lines.push('');
  }
  
  lines.push('## File Organization');
  lines.push('');
  
  // Smart directory description
  if (analysis.categories) {
    if (analysis.categories.components.length > 0) {
      const componentDir = analysis.categories.components[0].split('/')[0];
      lines.push(`- **Components:** \`${componentDir}/\` (${analysis.categories.components.length} files)`);
    }
    if (analysis.categories.pages.length > 0) {
      const pagesDir = analysis.categories.pages[0].split('/')[0];
      lines.push(`- **Pages/Routes:** \`${pagesDir}/\` (${analysis.categories.pages.length} files)`);
    }
    if (analysis.categories.api.length > 0) {
      lines.push(`- **API Routes:** ${analysis.categories.api.length} files`);
    }
    if (analysis.categories.hooks.length > 0) {
      lines.push(`- **Custom Hooks:** ${analysis.categories.hooks.length} files`);
    }
    if (analysis.categories.utils.length > 0) {
      lines.push(`- **Utilities:** ${analysis.categories.utils.length} files`);
    }
  }
  lines.push('');
  
  lines.push('## Coding Standards');
  lines.push('');
  if (analysis.conventions) {
    lines.push(`- **Component naming:** ${analysis.conventions.componentStyle || 'PascalCase'}`);
    lines.push(`- **File extension:** ${analysis.conventions.fileExtension || '.tsx'}`);
    lines.push(`- **Test files:** ${analysis.conventions.testNaming || '.test.'}`);
  }
  if (analysis.tsconfig?.strict) {
    lines.push('- **TypeScript:** Strict mode enabled');
  }
  if (analysis.tsconfig?.paths && Object.keys(analysis.tsconfig.paths).length > 0) {
    lines.push('- **Import aliases:** Use `@/` prefix for src imports');
  }
  lines.push('');
  
  // Key scripts
  if (analysis.packageJson.scripts && Object.keys(analysis.packageJson.scripts).length > 0) {
    lines.push('## Available Scripts');
    lines.push('');
    const importantScripts = ['dev', 'build', 'start', 'test', 'lint', 'format'];
    for (const script of importantScripts) {
      if (analysis.packageJson.scripts[script]) {
        lines.push(`- \`npm run ${script}\` - ${analysis.packageJson.scripts[script]}`);
      }
    }
    lines.push('');
  }
  
  lines.push('## Project-Specific Patterns');
  lines.push('');
  lines.push('<!-- Add project-specific patterns, conventions, and notes below -->');
  lines.push('');
  lines.push('- [ ] TODO: Document component composition patterns');
  lines.push('- [ ] TODO: Document state management approach');
  lines.push('- [ ] TODO: Document API/data fetching patterns');
  lines.push('- [ ] TODO: Document error handling conventions');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Verify the current configuration
 */
function verifyConfiguration(projectDir, analysis) {
  const issues = [];
  const warnings = [];
  const successes = [];
  
  // Check for .agents-project.json
  if (!analysis.projectConfig) {
    issues.push('Missing .agents-project.json - run `npx agents-init` first');
  } else {
    successes.push('.agents-project.json exists');
    
    // Check version
    if (analysis.projectConfig.version !== '1.1.0') {
      warnings.push(`Config version ${analysis.projectConfig.version} - consider running agents-init to update`);
    }
  }
  
  // Check for .agents folder
  const agentsDir = path.join(projectDir, '.agents');
  if (!fs.existsSync(agentsDir)) {
    issues.push('Missing .agents/ folder - run `npx agents-init` first');
  } else {
    successes.push('.agents/ folder exists');
    
    // Check for AGENTS.md
    if (!fs.existsSync(path.join(agentsDir, 'AGENTS.md'))) {
      issues.push('Missing .agents/AGENTS.md');
    } else {
      successes.push('.agents/AGENTS.md exists');
    }
  }
  
  // Check agent configs match .agents-project.json
  if (analysis.projectConfig?.agents) {
    for (const agent of analysis.projectConfig.agents) {
      if (!analysis.agentConfigs[agent]) {
        warnings.push(`Agent '${agent}' listed in config but no config file found`);
      } else {
        successes.push(`${AGENTS[agent].name} config file exists`);
      }
    }
  }
  
  // Check for PROJECT-CONTEXT.md
  if (!fs.existsSync(path.join(agentsDir, 'PROJECT-CONTEXT.md'))) {
    warnings.push('Missing .agents/PROJECT-CONTEXT.md - run `npx agents-analyze` to generate');
  } else {
    successes.push('.agents/PROJECT-CONTEXT.md exists');
  }
  
  // Check for framework/styling mismatches
  if (analysis.projectConfig?.project) {
    const configFramework = analysis.projectConfig.project.framework;
    const detectedFramework = analysis.packageJson.framework?.toLowerCase().split(' ')[0];
    
    if (configFramework && detectedFramework && !detectedFramework.includes(configFramework)) {
      warnings.push(`Framework mismatch: config says '${configFramework}' but detected '${detectedFramework}'`);
    }
  }
  
  return { issues, warnings, successes };
}

/**
 * Main analysis function
 */
async function main() {
  log.header('🔍 agents-analyze - Codebase Analysis');
  
  const projectDir = process.cwd();
  
  // Check prerequisites
  const agentsProjectPath = path.join(projectDir, '.agents-project.json');
  const agentsDir = path.join(projectDir, '.agents');
  
  if (!fs.existsSync(agentsProjectPath) && !fs.existsSync(agentsDir)) {
    log.error('No agents configuration found.');
    log.info('Run `npx agents-init` first to set up agent configuration.');
    process.exit(1);
  }
  
  const rl = createPrompt();
  
  try {
    log.info('Scanning project...');
    
    // Run all analyses
    const fileStructure = scanDirectory(projectDir);
    const categories = categorizeFiles(fileStructure.files, projectDir);
    const conventions = analyzeNamingConventions(fileStructure.files);
    const packageJson = analyzePackageJson(projectDir);
    const tsconfig = analyzeTypeScriptConfig(projectDir);
    const projectConfig = loadProjectConfig(projectDir);
    const agentConfigs = detectAgentConfigs(projectDir);
    const readme = analyzeReadme(projectDir);
    const keyFiles = detectKeyFiles(projectDir);
    
    const analysis = {
      fileStructure,
      categories,
      conventions,
      packageJson,
      tsconfig,
      projectConfig,
      agentConfigs,
      readme,
      keyFiles,
    };
    
    // Display summary
    log.success(`Scanned ${fileStructure.totalFiles} files in ${fileStructure.totalDirs} directories`);
    
    if (packageJson.framework) {
      log.info(`Framework: ${packageJson.framework}`);
    }
    if (packageJson.styling) {
      log.info(`Styling: ${packageJson.styling}`);
    }
    if (packageJson.database) {
      log.info(`Database: ${packageJson.database}`);
    }
    if (packageJson.features.length > 0) {
      log.info(`Features: ${packageJson.features.join(', ')}`);
    }
    
    console.log('');
    log.subheader('File Distribution:');
    for (const [cat, files] of Object.entries(categories)) {
      if (files.length > 0 && cat !== 'other') {
        log.file(`${cat}: ${files.length} files`);
      }
    }
    
    // Verify mode
    if (isVerifyOnly) {
      console.log('');
      log.header('📋 Configuration Verification');
      
      const verification = verifyConfiguration(projectDir, analysis);
      
      if (verification.successes.length > 0) {
        log.subheader('Passed:');
        for (const success of verification.successes) {
          log.success(success);
        }
      }
      
      if (verification.warnings.length > 0) {
        console.log('');
        log.subheader('Warnings:');
        for (const warning of verification.warnings) {
          log.warn(warning);
        }
      }
      
      if (verification.issues.length > 0) {
        console.log('');
        log.subheader('Issues:');
        for (const issue of verification.issues) {
          log.error(issue);
        }
        process.exit(1);
      }
      
      console.log('');
      log.success('Configuration verified!');
      process.exit(0);
    }
    
    // Generate reports
    const analysisReport = generateAnalysisReport(analysis);
    const projectContext = generateProjectContext(analysis);
    
    // Report only mode
    if (isReportOnly) {
      console.log('');
      log.header('📊 Analysis Report');
      console.log(analysisReport);
      process.exit(0);
    }
    
    // Determine what files to create/update
    const filesToCreate = [];
    
    const analysisPath = path.join(agentsDir, 'ANALYSIS.md');
    const contextPath = path.join(agentsDir, 'PROJECT-CONTEXT.md');
    
    filesToCreate.push({
      path: analysisPath,
      relativePath: '.agents/ANALYSIS.md',
      content: analysisReport,
      action: fs.existsSync(analysisPath) ? 'update' : 'create',
    });
    
    filesToCreate.push({
      path: contextPath,
      relativePath: '.agents/PROJECT-CONTEXT.md',
      content: projectContext,
      action: fs.existsSync(contextPath) ? 'update' : 'create',
    });
    
    // Show what will be created/updated
    console.log('');
    log.header('📝 Files to Generate');
    
    for (const file of filesToCreate) {
      const actionLabel = file.action === 'update' ? 'Update' : 'Create';
      log.file(`${actionLabel}: ${file.relativePath}`);
    }
    
    // Dry run mode
    if (isDryRun) {
      console.log('');
      log.warn('Dry run mode - no files written.');
      console.log('');
      log.subheader('PROJECT-CONTEXT.md preview:');
      console.log(colors.dim + '─'.repeat(50) + colors.reset);
      console.log(projectContext);
      console.log(colors.dim + '─'.repeat(50) + colors.reset);
      process.exit(0);
    }
    
    // Confirm with user
    console.log('');
    const shouldProceed = await confirm(rl, 'Generate these files?');
    
    if (!shouldProceed) {
      log.info('Aborted.');
      process.exit(0);
    }
    
    // Write files
    console.log('');
    log.info('Writing files...');
    
    for (const file of filesToCreate) {
      const dir = path.dirname(file.path);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file.path, file.content, 'utf8');
      log.success(`${file.action === 'update' ? 'Updated' : 'Created'} ${file.relativePath}`);
    }
    
    // Next steps
    console.log('');
    log.header('✨ Analysis Complete!');
    log.info('Next steps:');
    log.file('1. Review .agents/ANALYSIS.md for full project analysis');
    log.file('2. Edit .agents/PROJECT-CONTEXT.md with project-specific details');
    log.file('3. Share PROJECT-CONTEXT.md with your AI assistants');
    log.file('4. Run `npx agents-analyze --verify` to check configuration');
    console.log('');
    log.subheader('Pro tip:');
    log.file('Reference PROJECT-CONTEXT.md in your agent instructions:');
    log.file('  "Read .agents/PROJECT-CONTEXT.md for project conventions"');
    console.log('');
    
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  log.error(err.message);
  if (isVerbose) {
    console.error(err);
  }
  process.exit(1);
});
