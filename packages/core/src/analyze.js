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
import { AGENTS, SCHEMA_VERSION, resolveProject, readJson, detectFrameworks, stackForFramework } from './project.js';
import { assertSafeDestination } from './generate.js';
import { nativePatterns, guidedOptions, namingDefaults } from './analysis-frameworks.js';

export { guidedOptions } from './analysis-frameworks.js';

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

function printHelp() {
  console.log(`
${colors.bright}agents-analyze${colors.reset} - Analyze and customize AI agent configurations

${colors.bright}Usage:${colors.reset}
  npx agents-analyze              Analyze codebase and update agent files
  npx agents-analyze --guided     Interactive mode with customization questions
  npx agents-analyze --dry-run    Preview changes without writing files
  npx agents-analyze --report     Generate analysis report only
  npx agents-analyze --verify     Verify current configuration
  npx agents-analyze --verbose    Show detailed analysis output
  npx agents-analyze --yes        Generate reports without confirmation
  npx agents-analyze --stack vue  Select an installed react, angular, or vue preset
  npx agents-analyze --help       Show this help message

${colors.bright}Description:${colors.reset}
  Scans your codebase to understand its structure, patterns, and conventions,
  then updates your AI agent configuration files with project-specific context.

${colors.bright}What it analyzes:${colors.reset}
  - Project structure and file organization
  - Components, pages, and API routes
  - Custom hooks, composables, services, templates, and utilities
  - Dependencies and their versions
  - Configuration files and patterns
  - Existing conventions and naming patterns
  - Test coverage and testing patterns
  - Environment and deployment setup

${colors.bright}What it preserves:${colors.reset}
  - Existing agent guidance and adapter files
  - .agents-project.json, including custom overrides and exclusions

${colors.bright}Outputs:${colors.reset}
  - .agents/ANALYSIS.md - Full analysis report
  - .agents/PROJECT-CONTEXT.md - AI-ready project summary

${colors.bright}Prerequisites:${colors.reset}
  Run 'npx agents-init' first to create initial configuration

${colors.bright}More Info:${colors.reset}
  https://github.com/ericthayer/agents-config
`);
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

async function promptText(rl, prompt, defaultValue = '') {
  const defaultHint = defaultValue ? ` (default: ${defaultValue})` : '';
  const answer = await question(rl, `${colors.bright}${prompt}${colors.reset}${colors.dim}${defaultHint}${colors.reset}\n> `);
  return answer.trim() || defaultValue;
}

async function selectOption(rl, prompt, options) {
  console.log(`\n${colors.bright}${prompt}${colors.reset}`);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt}`);
  });
  const answer = await question(rl, '\n> ');
  const index = parseInt(answer.trim()) - 1;
  return (index >= 0 && index < options.length) ? options[index] : options[0];
}

/**
 * Run guided customization prompts
 */
export async function runGuidedMode(rl, analysis, patterns) {
  const customizations = {
    projectDescription: '',
    componentPatterns: [],
    stateManagementNotes: '',
    dataFetchingNotes: '',
    errorHandlingApproach: '',
    dosAndDonts: { dos: [], donts: [] },
    domainRules: [],
  };

  log.header('📋 Guided Customization');
  log.info('Answer these questions to customize PROJECT-CONTEXT.md for your codebase.\n');
  log.info('Press Enter to skip any question.\n');

  // Project description
  customizations.projectDescription = await promptText(
    rl,
    '1. Describe what this project does (one sentence):',
    analysis.readme?.description || ''
  );

  // Component patterns
  console.log('');
  const options = guidedOptions(analysis.stack ?? analysis.packageJson.stack);
  const compPatternOptions = options.composition;
  const compPattern = await selectOption(rl, '2. What component composition pattern do you use?', compPatternOptions);
  if (compPattern !== 'None/Other') {
    customizations.componentPatterns.push(compPattern);
  }

  // State management notes (if detected)
  if (patterns.stateManagement) {
    console.log('');
    log.info(`Detected: ${patterns.stateManagement.tool}`);
    customizations.stateManagementNotes = await promptText(
      rl,
      `3. Any specific ${patterns.stateManagement.tool} patterns or store structure?`,
      ''
    );
  }

  // Error handling
  console.log('');
  const errorOptions = options.errors;
  const errorApproach = await selectOption(rl, '4. How do you handle errors?', errorOptions);
  customizations.errorHandlingApproach = errorApproach;

  // Do's and Don'ts
  console.log('');
  log.subheader("5. What should AI agents ALWAYS do in this codebase?");
  log.info("(Enter one per line, empty line to finish)");
  while (true) {
    const doItem = await question(rl, `${colors.green}✓${colors.reset} `);
    if (!doItem.trim()) break;
    customizations.dosAndDonts.dos.push(doItem.trim());
  }

  console.log('');
  log.subheader("6. What should AI agents NEVER do in this codebase?");
  log.info("(Enter one per line, empty line to finish)");
  while (true) {
    const dontItem = await question(rl, `${colors.red}✗${colors.reset} `);
    if (!dontItem.trim()) break;
    customizations.dosAndDonts.donts.push(dontItem.trim());
  }

  // Domain rules
  console.log('');
  log.subheader("7. Any domain-specific rules? (e.g., 'All prices in cents', 'IDs are UUIDs')");
  log.info("(Enter one per line, empty line to finish)");
  while (true) {
    const rule = await question(rl, `${colors.blue}→${colors.reset} `);
    if (!rule.trim()) break;
    customizations.domainRules.push(rule.trim());
  }

  console.log('');
  log.success('Customization complete!');

  return customizations;
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
  } catch (error) {
    throw new Error(`Could not scan ${dir}: ${error.message}`);
  }

  return results;
}

/**
 * Categorize files by type
 */
export function categorizeFiles(files, projectDir, stack = 'react') {
  const categories = {
    components: [],
    pages: [],
    api: [],
    hooks: [],
    composables: [],
    services: [],
    templates: [],
    directives: [],
    utils: [],
    tests: [],
    styles: [],
    config: [],
    other: [],
  };

  for (const file of files) {
    const relativePath = path.relative(projectDir, file).split(path.sep).join('/');
    const ext = path.extname(file);
    const basename = path.basename(file);
    const inDir = names => relativePath.split('/').slice(0, -1).some(dir => names.includes(dir.toLowerCase()));
    const source = /\.(?:[cm]?[jt]sx?|vue)$/.test(ext);
    let category = 'other';
    if (/\.(?:test|spec)\./.test(basename) || inDir(['__tests__', 'tests', 'test', 'e2e'])) {
      category = 'tests';
    } else if (/\.(css|scss|less|sass)$/.test(ext)) {
      category = 'styles';
    } else if (basename.includes('config') || basename.startsWith('.env')) {
      category = 'config';
    } else if (stack === 'angular' && ext === '.html' && inDir(['app', 'components', 'src'])) {
      category = 'templates';
    } else if (stack === 'angular' && /\.(?:service)\.[jt]s$/.test(basename)) {
      category = 'services';
    } else if (stack === 'angular' && /\.(?:directive|pipe)\.[jt]s$/.test(basename)) {
      category = 'directives';
    } else if (stack === 'angular' && /\.(?:routes|routing|routing\.module|guard|resolver)\.[jt]s$/.test(basename)) {
      category = 'pages';
    } else if (source && inDir(['api', 'server', 'functions'])) {
      category = 'api';
    } else if (source && (inDir(['pages', 'views', 'routes', 'router']) ||
        (stack === 'react' && inDir(['app']) && !inDir(['components'])))) {
      category = 'pages';
    } else if (source && stack === 'vue' && (inDir(['composables']) || /^use[A-Z]/.test(basename))) {
      category = 'composables';
    } else if (source && stack === 'react' && (inDir(['hooks']) || /^use[A-Z]/.test(basename))) {
      category = 'hooks';
    } else if (source && inDir(['services'])) {
      category = 'services';
    } else if (source && inDir(['utils', 'lib', 'helpers'])) {
      category = 'utils';
    } else if (source && (inDir(['components']) || (stack === 'vue' && ext === '.vue') ||
        (stack === 'angular' && (basename.includes('.component.') || inDir(['app']))))) {
      category = 'components';
    }
    categories[category].push(relativePath);
  }

  return categories;
}

/**
 * Extract naming conventions from file names
 */
export function analyzeNamingConventions(files, stack = 'react') {
  const defaults = namingDefaults(stack);
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
  const extensionCounts = new Map();
  let testCount = 0;
  let specCount = 0;
  let indexCount = 0;

  for (const file of files) {
    const basename = path.basename(file, path.extname(file)).replace(/\.component$/, '');
    const ext = path.extname(file);

    // Check test patterns
    if (file.includes('.test.')) testCount++;
    else if (file.includes('.spec.')) specCount++;
    if (/\.(?:test|spec)\./.test(file) || /(?:^|[/\\])(?:__tests__|tests|test|e2e)[/\\]/.test(file)) continue;

    // Check for index files
    if (basename === 'index') indexCount++;
    const componentExtensions = stack === 'angular' ? ['.ts', '.js'] :
      stack === 'vue' ? ['.vue'] : ['.tsx', '.jsx'];
    if (!componentExtensions.includes(ext) || basename === 'index') continue;
    if (/^[A-Z][a-zA-Z0-9]*$/.test(basename)) pascalCount++;
    else if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(basename)) kebabCount++;
    else if (/^[a-z][a-zA-Z0-9]*$/.test(basename)) camelCount++;
    extensionCounts.set(ext, (extensionCounts.get(ext) ?? 0) + 1);
  }

  // Determine conventions
  if (pascalCount > camelCount && pascalCount > kebabCount) {
    conventions.componentStyle = 'PascalCase';
  } else if (camelCount > pascalCount && camelCount > kebabCount) {
    conventions.componentStyle = 'camelCase';
  } else if (kebabCount > 0) {
    conventions.componentStyle = 'kebab-case';
  }

  conventions.componentStyle ??= defaults.componentStyle;
  conventions.fileExtension = [...extensionCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? defaults.fileExtension;
  conventions.testNaming = testCount + specCount === 0 ? defaults.testNaming : testCount >= specCount ? '.test.' : '.spec.';
  conventions.indexFiles = indexCount > 5;
  conventions.barrelExports = indexCount > 10;

  return conventions;
}

/**
 * Analyze package.json for dependencies and scripts
 */
export function analyzePackageJson(projectDir, project = {}) {
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

    const pkg = project.packageJson ?? readJson(path.join(projectDir, 'package.json'), { optional: true }) ?? {};
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const frameworkId = project.framework ?? detectFrameworks(pkg)[0] ?? project.stack ?? 'react';
    const stack = project.stack ?? stackForFramework(frameworkId);
    const labels = { next: 'Next.js', react: deps.gatsby ? 'Gatsby' : deps.vite ? 'React (Vite)' : 'React', remix: 'Remix',
      astro: 'Astro', angular: 'Angular', vue: 'Vue', nuxt: 'Nuxt (unsupported)', svelte: 'Svelte' };
    analysis.stack = stack;
    analysis.frameworkId = frameworkId;
    analysis.framework = frameworkId === 'react' ? labels.react :
      project.preset?.frameworks[frameworkId] ?? labels[frameworkId] ?? frameworkId;

    analysis.name = pkg.name;
    analysis.version = pkg.version;
    analysis.type = pkg.type || 'commonjs';
    analysis.scripts = pkg.scripts || {};

    if (frameworkId === 'next' && deps.next) {
      analysis.keyDependencies.push(`next@${deps['next']}`);
    }
    for (const dependency of stack === 'angular' ? ['@angular/core', '@angular/forms', '@angular/router', 'rxjs'] :
      stack === 'vue' ? ['vue', 'vue-router', 'pinia'] : []) {
      if (deps[dependency]) analysis.keyDependencies.push(`${dependency}@${deps[dependency]}`);
    }

    // React version
    if (stack === 'react' && deps['react']) {
      analysis.keyDependencies.push(`react@${deps['react']}`);
      if (deps['react'].includes('19') || deps['react'].includes('canary')) {
        analysis.features.push('React 19');
      }
    }

    // Styling detection
    if (deps['tailwindcss']) {
      analysis.styling = 'Tailwind CSS';
      analysis.keyDependencies.push(`tailwindcss@${deps['tailwindcss']}`);
    } else if (stack === 'react' && deps['@mui/material']) {
      analysis.styling = 'Material-UI';
      analysis.keyDependencies.push(`@mui/material@${deps['@mui/material']}`);
    } else if (stack === 'react' && deps['styled-components']) {
      analysis.styling = 'Styled Components';
    } else if (stack === 'react' && deps['@emotion/react']) {
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
    } else if (deps['jasmine-core']) {
      analysis.testing = 'Jasmine';
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
    if (deps['storybook'] || deps[`@storybook/${stack}`]) {
      analysis.features.push('Storybook');
    }
    if (stack === 'react' && (deps['three'] || deps['@react-three/fiber'])) {
      analysis.features.push('Three.js/R3F');
    }
    if (stack === 'react' && deps['framer-motion']) {
      analysis.features.push('Framer Motion');
    }
    if (stack === 'react' && (deps['react-query'] || deps['@tanstack/react-query'])) {
      analysis.features.push('TanStack Query');
    }
    if (stack === 'react' && deps['zustand']) {
      analysis.features.push('Zustand');
    }
    if (stack === 'react' && deps['jotai']) {
      analysis.features.push('Jotai');
    }
    if (stack === 'react' && (deps['redux'] || deps['@reduxjs/toolkit'])) {
      analysis.features.push('Redux');
    }
    if (deps['zod']) {
      analysis.features.push('Zod validation');
    }
    if (stack === 'react' && deps['react-hook-form']) {
      analysis.features.push('React Hook Form');
    }
    for (const [dependency, feature] of stack === 'angular' ?
      [['rxjs', 'RxJS'], ['@ngrx/store', 'NgRx'], ['@ngrx/signals', 'NgRx'], ['@angular/forms', 'Angular reactive forms']] :
      stack === 'vue' ? [['pinia', 'Pinia'], ['@tanstack/vue-query', 'TanStack Vue Query'], ['vee-validate', 'VeeValidate']] : []) {
      if (deps[dependency] && !analysis.features.includes(feature)) analysis.features.push(feature);
    }

    // TypeScript
    if (deps['typescript']) {
      analysis.features.push('TypeScript');
      analysis.keyDependencies.push(`typescript@${deps['typescript']}`);
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
 * Detect development patterns from dependencies and code
 */
export function detectPatterns(packageJson, categories) {
  const patterns = {
    stateManagement: null,
    dataFetching: null,
    formHandling: null,
    styling: null,
    animation: null,
    routing: null,
    validation: null,
    apiLayer: null,
    errorHandling: null,
    componentComposition: null,
  };

  const features = packageJson.features || [];
  const stack = packageJson.stack ?? stackForFramework(packageJson.frameworkId) ?? 'react';

  // State Management Detection
  if (features.includes('Redux')) {
    patterns.stateManagement = {
      tool: 'Redux Toolkit',
      description: 'Use Redux Toolkit for global state. Store slices in `/store` or `/redux`. Use `createSlice` for reducers.',
      rules: [
        'Keep reducers pure - no side effects',
        'Use RTK Query for API state when possible',
        'Normalize nested data with `createEntityAdapter`',
      ],
    };
  } else if (features.includes('Zustand')) {
    patterns.stateManagement = {
      tool: 'Zustand',
      description: 'Use Zustand stores for global state. Keep stores small and focused.',
      rules: [
        'One store per domain (userStore, cartStore)',
        'Use `persist` middleware for localStorage sync',
        'Prefer selectors to prevent unnecessary re-renders',
      ],
    };
  } else if (features.includes('Jotai')) {
    patterns.stateManagement = {
      tool: 'Jotai',
      description: 'Use Jotai atoms for atomic state management.',
      rules: [
        'Define atoms in dedicated files (atoms/*.ts)',
        'Use derived atoms for computed values',
        'Prefer `atomWithStorage` for persisted state',
      ],
    };
  } else {
    patterns.stateManagement = {
      tool: 'React Context + useState',
      description: 'Use React Context for shared state, useState for local state.',
      rules: [
        'Context for auth, theme, and other app-wide state',
        'URL state for filters, tabs, pagination',
        'Avoid prop drilling beyond 2-3 levels',
      ],
    };
  }

  // Data Fetching Detection
  if (features.includes('TanStack Query')) {
    patterns.dataFetching = {
      tool: 'TanStack Query',
      description: 'Use TanStack Query for server state management.',
      rules: [
        'Define query keys as constants',
        'Use `useQuery` for reads, `useMutation` for writes',
        'Configure staleTime and cacheTime appropriately',
        'Implement optimistic updates for better UX',
      ],
    };
  } else if (packageJson.framework?.includes('Next')) {
    patterns.dataFetching = {
      tool: 'Next.js Server Actions + fetch',
      description: 'Use Server Actions for mutations, fetch with caching for reads.',
      rules: [
        "Use 'use server' for server-side mutations",
        'Leverage Next.js fetch caching and revalidation',
        'Use `revalidatePath` or `revalidateTag` after mutations',
      ],
    };
  } else {
    patterns.dataFetching = {
      tool: 'fetch/axios',
      description: 'Use fetch or axios for API calls.',
      rules: [
        'Centralize API calls in /api or /services folder',
        'Handle loading, error, and success states',
        'Implement proper error boundaries',
      ],
    };
  }

  // Form Handling Detection
  if (features.includes('React Hook Form')) {
    patterns.formHandling = {
      tool: 'React Hook Form',
      description: 'Use React Hook Form for all forms.',
      rules: [
        'Use `useForm` with Zod resolver for validation',
        'Define form schemas with Zod',
        'Use Controller for controlled components (MUI, etc.)',
        'Show inline validation errors near fields',
      ],
    };
  } else {
    patterns.formHandling = {
      tool: 'Controlled components',
      description: 'Use controlled form components with useState.',
      rules: [
        'Validate on blur and on submit',
        'Disable submit button during submission',
        'Focus first error field on validation failure',
      ],
    };
  }

  // Validation Detection
  if (features.includes('Zod validation')) {
    patterns.validation = {
      tool: 'Zod',
      description: 'Use Zod for runtime validation and type inference.',
      rules: [
        'Define schemas in /schemas or alongside forms',
        'Use `z.infer<typeof schema>` for TypeScript types',
        'Validate API responses with Zod',
        'Use `.safeParse()` for user input',
      ],
    };
  }

  // Animation Detection
  if (features.includes('Framer Motion')) {
    patterns.animation = {
      tool: 'Framer Motion',
      description: 'Use Framer Motion for animations.',
      rules: [
        'Use `motion` components for animated elements',
        'Define animation variants for reusability',
        'Use `AnimatePresence` for exit animations',
        'Respect `prefers-reduced-motion`',
      ],
    };
  }

  // Styling patterns (already detected, add rules)
  if (packageJson.styling === 'Tailwind CSS') {
    patterns.styling = {
      tool: 'Tailwind CSS',
      description: 'Use Tailwind utility classes for styling.',
      rules: [
        'Use `cn()` helper for conditional classes',
        'Extract repeated patterns to components, not @apply',
        'Use CSS variables for theme tokens',
        'Mobile-first responsive design (sm:, md:, lg:)',
      ],
    };
  } else if (packageJson.styling === 'Material-UI') {
    patterns.styling = {
      tool: 'Material-UI (MUI)',
      description: 'Use MUI components and sx prop for styling.',
      rules: [
        'Use `sx` prop for one-off styles',
        'Use `styled()` for reusable styled components',
        'Theme tokens via `theme.palette`, `theme.spacing`',
        'Support light/dark mode via MUI theming',
      ],
    };
  }

  // Component composition patterns
  if (categories?.components?.length > 20) {
    patterns.componentComposition = {
      description: 'Large component library detected.',
      rules: [
        'Use compound components for complex UI (Menu, Menu.Item)',
        'Prefer composition over props for flexibility',
        'Create shared primitives (Button, Input, Card)',
        'Use render props or children for customization',
      ],
    };
  }

  const native = nativePatterns(stack, features);
  if (native) {
    Object.assign(patterns, native);
    patterns.animation = null;
    if (packageJson.styling === 'Material-UI') patterns.styling = null;
  }
  return patterns;
}

/**
 * Detect existing .agents-project.json configuration
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
export function generateAnalysisReport(analysis) {
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
  if (analysis.stack) lines.push(`**Stack:** ${analysis.stack}`);
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

  if (analysis.patterns) {
    lines.push('## Development Patterns', '');
    for (const value of Object.values(analysis.patterns)) {
      if (value?.tool) lines.push(`- **${value.tool}:** ${value.description}`);
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
export function generateProjectContext(analysis, patterns = null, customizations = null) {
  const lines = [];
  const defaults = namingDefaults(analysis.stack ?? analysis.packageJson.stack);

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
  // Use customization description if provided, otherwise fallback to readme
  const description = customizations?.projectDescription || analysis.readme?.description;
  if (description) {
    lines.push(`- **Purpose:** ${description}`);
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
    for (const [category, label] of [['composables', 'Composables'], ['services', 'Services'],
      ['templates', 'Templates'], ['directives', 'Directives/Pipes']]) {
      if (analysis.categories[category]?.length > 0) {
        lines.push(`- **${label}:** ${analysis.categories[category].length} files`);
      }
    }
    if (analysis.categories.utils.length > 0) {
      lines.push(`- **Utilities:** ${analysis.categories.utils.length} files`);
    }
  }
  lines.push('');

  lines.push('## Coding Standards');
  lines.push('');
  if (analysis.conventions) {
    lines.push(`- **Component naming:** ${analysis.conventions.componentStyle || defaults.componentStyle}`);
    lines.push(`- **File extension:** ${analysis.conventions.fileExtension || defaults.fileExtension}`);
    lines.push(`- **Test files:** ${analysis.conventions.testNaming || defaults.testNaming}`);
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

  // Project-Specific Patterns section - now with auto-detected patterns!
  lines.push('## Project-Specific Patterns');
  lines.push('');

  // State Management (auto-detected)
  if (patterns?.stateManagement) {
    lines.push('### State Management');
    lines.push('');
    lines.push(`**${patterns.stateManagement.tool}**: ${patterns.stateManagement.description}`);
    lines.push('');
    for (const rule of patterns.stateManagement.rules) {
      lines.push(`- ${rule}`);
    }
    if (customizations?.stateManagementNotes) {
      lines.push('');
      lines.push(`> **Project note:** ${customizations.stateManagementNotes}`);
    }
    lines.push('');
  }

  // Data Fetching (auto-detected)
  if (patterns?.dataFetching) {
    lines.push('### Data Fetching');
    lines.push('');
    lines.push(`**${patterns.dataFetching.tool}**: ${patterns.dataFetching.description}`);
    lines.push('');
    for (const rule of patterns.dataFetching.rules) {
      lines.push(`- ${rule}`);
    }
    if (customizations?.dataFetchingNotes) {
      lines.push('', `> **Project note:** ${customizations.dataFetchingNotes}`);
    }
    lines.push('');
  }

  if (patterns?.routing) {
    lines.push('### Routing', '', `**${patterns.routing.tool}**: ${patterns.routing.description}`, '');
    for (const rule of patterns.routing.rules) lines.push(`- ${rule}`);
    lines.push('');
  }

  // Form Handling (auto-detected)
  if (patterns?.formHandling) {
    lines.push('### Form Handling');
    lines.push('');
    lines.push(`**${patterns.formHandling.tool}**: ${patterns.formHandling.description}`);
    lines.push('');
    for (const rule of patterns.formHandling.rules) {
      lines.push(`- ${rule}`);
    }
    lines.push('');
  }

  // Validation (auto-detected)
  if (patterns?.validation) {
    lines.push('### Validation');
    lines.push('');
    lines.push(`**${patterns.validation.tool}**: ${patterns.validation.description}`);
    lines.push('');
    for (const rule of patterns.validation.rules) {
      lines.push(`- ${rule}`);
    }
    lines.push('');
  }

  // Styling (auto-detected)
  if (patterns?.styling) {
    lines.push('### Styling');
    lines.push('');
    lines.push(`**${patterns.styling.tool}**: ${patterns.styling.description}`);
    lines.push('');
    for (const rule of patterns.styling.rules) {
      lines.push(`- ${rule}`);
    }
    lines.push('');
  }

  // Animation (auto-detected)
  if (patterns?.animation) {
    lines.push('### Animation');
    lines.push('');
    lines.push(`**${patterns.animation.tool}**: ${patterns.animation.description}`);
    lines.push('');
    for (const rule of patterns.animation.rules) {
      lines.push(`- ${rule}`);
    }
    lines.push('');
  }

  // Component Composition (from customization or auto-detected)
  if (customizations?.componentPatterns?.length > 0 || patterns?.componentComposition) {
    lines.push('### Component Composition');
    lines.push('');
    if (customizations?.componentPatterns?.length > 0) {
      lines.push(`**Pattern:** ${customizations.componentPatterns.join(', ')}`);
      lines.push('');
    }
    if (patterns?.componentComposition?.rules) {
      for (const rule of patterns.componentComposition.rules) {
        lines.push(`- ${rule}`);
      }
      lines.push('');
    }
  }

  // Error Handling (from customization)
  if (customizations?.errorHandlingApproach) {
    lines.push('### Error Handling');
    lines.push('');
    lines.push(`**Approach:** ${customizations.errorHandlingApproach}`);
    lines.push('');
  }

  // Do's and Don'ts (from customization)
  if (customizations?.dosAndDonts?.dos?.length > 0 || customizations?.dosAndDonts?.donts?.length > 0) {
    lines.push('## Do\'s and Don\'ts');
    lines.push('');

    if (customizations.dosAndDonts.dos?.length > 0) {
      lines.push('### ✅ Always Do');
      lines.push('');
      for (const item of customizations.dosAndDonts.dos) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    if (customizations.dosAndDonts.donts?.length > 0) {
      lines.push('### ❌ Never Do');
      lines.push('');
      for (const item of customizations.dosAndDonts.donts) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }
  }

  // Domain Rules (from customization)
  if (customizations?.domainRules?.length > 0) {
    lines.push('## Domain Rules');
    lines.push('');
    for (const rule of customizations.domainRules) {
      lines.push(`- ${rule}`);
    }
    lines.push('');
  }

  // If no patterns were detected and no customizations, show TODOs
  const hasPatterns = patterns && Object.values(patterns).some(p => p !== null);
  const hasCustomizations = customizations && (
    customizations.projectDescription ||
    customizations.componentPatterns?.length > 0 ||
    customizations.dosAndDonts?.dos?.length > 0 ||
    customizations.dosAndDonts?.donts?.length > 0 ||
    customizations.domainRules?.length > 0
  );

  if (!hasPatterns && !hasCustomizations) {
    lines.push('<!-- No patterns detected. Run `npx agents-analyze --guided` to add customizations -->');
    lines.push('');
    lines.push('- [ ] TODO: Document component composition patterns');
    lines.push('- [ ] TODO: Document state management approach');
    lines.push('- [ ] TODO: Document API/data fetching patterns');
    lines.push('- [ ] TODO: Document error handling conventions');
    lines.push('');
  } else if (!hasCustomizations) {
    lines.push('---');
    lines.push('');
    lines.push('> 💡 **Tip:** Run `npx agents-analyze --guided` to add custom Do\'s/Don\'ts and domain rules.');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Verify the current configuration
 */
export function verifyConfiguration(projectDir, analysis) {
  const issues = [];
  const warnings = [];
  const successes = [];

  // Check for .agents-project.json
  if (!analysis.projectConfig) {
    issues.push('Missing .agents-project.json - run `npx agents-init` first');
  } else {
    successes.push('.agents-project.json exists');

    // Check version
    if (!['1.0.0', '1.1.0', SCHEMA_VERSION].includes(analysis.projectConfig.version)) {
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
    const detectedFramework = analysis.packageJson.frameworkId;

    if (configFramework && detectedFramework && configFramework !== detectedFramework) {
      warnings.push(`Framework mismatch: config says '${configFramework}' but detected '${detectedFramework}'`);
    }
    const configStack = analysis.projectConfig.project.stack ?? stackForFramework(configFramework);
    if (configStack && analysis.stack && configStack !== analysis.stack) {
      issues.push(`Stack mismatch: config says '${configStack}' but selected '${analysis.stack}'. Run agents-init to switch stacks.`);
    }
  }

  return { issues, warnings, successes };
}

/**
 * Main analysis function
 */
export async function runAnalyze({ args = process.argv.slice(2), projectDir = process.cwd() } = {}) {
  const isYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');
  const isReportOnly = args.includes('--report');
  const isVerifyOnly = args.includes('--verify');
  const isHelp = args.includes('--help') || args.includes('-h');
  const isVerbose = args.includes('--verbose') || args.includes('-v');
  const isGuided = args.includes('--guided') || args.includes('-g');
  if (isHelp) {
    printHelp();
    return;
  }
  const flags = new Set(['--dry-run', '--report', '--verify', '--verbose', '-v', '--guided', '-g', '--yes', '-y']);
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--stack') { index++; continue; }
    if (!flags.has(args[index]) && !args[index].startsWith('--stack=')) {
      throw new Error(`Unknown argument: ${args[index]}. Use --help.`);
    }
  }
  const stackIndex = args.indexOf('--stack');
  const stack = stackIndex >= 0 ? args[stackIndex + 1] : args.find(arg => arg.startsWith('--stack='))?.slice(8);
  if ((stackIndex >= 0 || args.some(arg => arg.startsWith('--stack='))) && (!stack || stack.startsWith('-'))) {
    throw new Error('--stack requires a value: react, angular, or vue');
  }
  projectDir = path.resolve(projectDir);
  log.header('🔍 agents-analyze - Codebase Analysis');

  // Check prerequisites
  const agentsProjectPath = path.join(projectDir, '.agents-project.json');
  const agentsDir = path.join(projectDir, '.agents');

  if (!fs.existsSync(agentsProjectPath) && !fs.existsSync(agentsDir)) {
    throw new Error('No agents configuration found. Run `npx agents-init` first to set up agent configuration.');
  }

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) && !isYes;
  let rl;
  const prompt = () => rl ??= createPrompt();

  try {
    const project = await resolveProject({
      projectDir, stack,
      choose: interactive ? choices => selectOption(prompt(), 'Choose a stack:', choices) : undefined,
      confirmMismatch: interactive ? message => confirm(prompt(), `${message} Continue?`) : undefined,
    });
    const previousStack = project.config?.project.stack ?? stackForFramework(project.config?.project.framework);
    if (previousStack && previousStack !== project.stack) {
      throw new Error('Existing configuration uses a different stack. Run agents-init --force to switch before analyzing.');
    }
    log.info('Scanning project...');

    // Run all analyses
    const fileStructure = scanDirectory(projectDir);
    const categories = categorizeFiles(fileStructure.files, projectDir, project.stack);
    const conventions = analyzeNamingConventions(
      [...categories.components, ...categories.pages, ...categories.tests], project.stack,
    );
    const packageJson = analyzePackageJson(projectDir, project);
    const tsconfig = analyzeTypeScriptConfig(projectDir);
    const projectConfig = project.config;
    const agentConfigs = detectAgentConfigs(projectDir);
    const readme = analyzeReadme(projectDir);
    const keyFiles = detectKeyFiles(projectDir);

    const analysis = {
      stack: project.stack,
      framework: project.framework,
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
    if (isVerbose) {
      for (const [category, files] of Object.entries(categories)) {
        for (const file of files) log.detail(`${category}: ${file}`);
      }
    }

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
        throw new Error(`Configuration verification failed: ${verification.issues.join('; ')}`);
      }

      console.log('');
      log.success('Configuration verified!');
      return { analysis, verification };
    }

    // Detect patterns from dependencies
    const patterns = detectPatterns(packageJson, categories);
    analysis.patterns = patterns;

    // Run guided mode if requested
    let customizations = null;
    if (isGuided) {
      if (!interactive) throw new Error('--guided requires an interactive terminal.');
      customizations = await runGuidedMode(prompt(), analysis, patterns);
    }

    // Generate reports
    const analysisReport = generateAnalysisReport(analysis);
    const projectContext = generateProjectContext(analysis, patterns, customizations);
    const result = { analysis, patterns, customizations, analysisReport, projectContext };

    // Report only mode
    if (isReportOnly) {
      console.log('');
      log.header('📊 Analysis Report');
      console.log(analysisReport);
      return result;
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
      return result;
    }

    // Confirm with user
    console.log('');
    if (!interactive && !isYes) throw new Error('Generating analysis files requires --yes or an interactive terminal. Use --report or --dry-run to preview.');
    const shouldProceed = isYes || await confirm(prompt(), 'Generate these files?');

    if (!shouldProceed) {
      log.info('Aborted.');
      return { ...result, aborted: true };
    }

    // Write files
    console.log('');
    log.info('Writing files...');

    for (const file of filesToCreate) {
      assertSafeDestination(projectDir, file.relativePath);
    }
    for (const file of filesToCreate) {
      assertSafeDestination(projectDir, file.relativePath);
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
    return result;

  } finally {
    rl?.close();
  }
}
