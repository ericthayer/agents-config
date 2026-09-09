import readline from 'node:readline/promises';
import { AGENTS, detectFrameworks, resolveProject } from './project.js';
import { buildPlan, writePlan } from './generate.js';

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--force') options.force = true;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--stack' || arg === '--agents') {
      const value = args[++i];
      if (!value || value.startsWith('-')) throw new Error(`${arg} requires a value`);
      options[arg.slice(2)] = arg === '--agents' ? value.split(',').map(item => item.trim()) : value;
    } else throw new Error(`Unknown argument: ${arg}. Use --help.`);
  }
  return options;
}

export async function runInit({ args = process.argv.slice(2), projectDir = process.cwd() } = {}) {
  const options = parseArgs(args);
  if (options.help) {
    console.log(`agents-init - Initialize AI agent configuration

Usage: agents-init [--stack react|angular|vue] [--agents copilot,claude]
  --dry-run    Preview without writing any files
  --force      Replace planned files; retain unrelated files
  --yes, -y    Use detected/default settings without prompts
  --help, -h   Show help

Install @agents-config/react, @agents-config/angular, or @agents-config/vue.
Existing agents-config installations continue to select React.
Multiple installed presets require --stack or an interactive choice.
`);
    return;
  }
  const interactive = Boolean(process.stdin.isTTY) && !options.yes;
  const rl = interactive ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  const confirm = async message => /^(y|yes)$/i.test((await rl.question(`${message} (y/n) `)).trim());
  const choose = async candidates => {
    console.log(candidates.map((item, index) => `${index + 1}. ${item}`).join('\n'));
    const answer = (await rl.question('Choose stack: ')).trim();
    const result = candidates[Number(answer) - 1] ?? (candidates.includes(answer) ? answer : null);
    if (!result) throw new Error('Invalid stack selection');
    return result;
  };
  try {
    const project = await resolveProject({
      projectDir, stack: options.stack,
      choose: interactive ? choose : undefined,
      confirmMismatch: interactive ? confirm : undefined
    });
    if (interactive && !project.config?.project.framework && !detectFrameworks(project.packageJson).length) {
      const frameworks = Object.keys(project.preset.frameworks);
      if (frameworks.length > 1) {
        const answer = (await rl.question(`Framework (${frameworks.join(', ')}; default ${project.framework}): `)).trim();
        if (answer && !frameworks.includes(answer)) throw new Error(`Invalid framework: ${answer}`);
        if (answer) project.framework = answer;
      }
    }
    if (interactive && !options.agents && !project.config?.agents) {
      const ids = Object.keys(AGENTS);
      console.log(ids.map((id, index) => `${index + 1}. ${AGENTS[id].name}`).join('\n'));
      const answer = (await rl.question('Assistants (comma-separated names/numbers, all; default copilot,claude): ')).trim();
      options.agents = !answer ? ['copilot', 'claude'] : answer === 'all' ? ids :
        answer.split(',').map(value => ids[Number(value.trim()) - 1] ?? value.trim());
    }
    if (interactive && !project.config) {
      project.config = {
        project: {},
        features: {}
      };
      for (const [field, choices] of [
        ['styling', project.stack === 'react' ? ['vanilla', 'tailwind', 'mui', 'styled'] : ['vanilla', 'tailwind']],
        ['database', ['none', 'supabase', 'firebase', 'prisma']]
      ]) {
        const answer = (await rl.question(`${field} (${choices.join(', ')}; Enter to detect): `)).trim();
        if (answer && !choices.includes(answer)) throw new Error(`Invalid ${field}: ${answer}`);
        if (answer) project.config.project[field] = answer;
      }
      if (project.stack === 'react') project.config.features.gemini = await confirm('Does this application use Gemini AI features?');
    }
    const plan = buildPlan(project, options);
    console.log(`Selected ${project.stack} (${project.framework})`);
    for (const warning of plan.warnings) console.warn(`Warning: ${warning}`);
    for (const file of plan.files) console.log(`  ${file.relativePath}`);
    if (!options.dryRun && !options.yes) {
      if (!interactive) throw new Error('Noninteractive initialization requires --yes (or use --dry-run).');
      if (!await confirm('Create these files?')) { console.log('Aborted'); return; }
    }
    const { written, skipped } = writePlan(projectDir, plan, options);
    console.log(`${options.dryRun ? 'Dry run complete; would write' : 'Setup complete; wrote'} ${written.length} files; preserved ${skipped.length} existing files.`);
    if (skipped.length) console.log('Existing content was retained. Use --force only to intentionally replace planned files.');
  } finally {
    rl?.close();
  }
}
