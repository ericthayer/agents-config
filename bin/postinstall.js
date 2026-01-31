#!/usr/bin/env node

/**
 * Post-install script for @anthropic-agents/config
 * Displays helpful information after npm install
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

console.log(`
${colors.bright}${colors.green}✓ agents-config installed${colors.reset}

${colors.cyan}Quick Start:${colors.reset}
  Run ${colors.bright}npx agents-init${colors.reset} to set up AI agent configuration for this project.

${colors.cyan}What this does:${colors.reset}
  • Creates adapter files for your AI coding assistants (Copilot, Claude, Cursor, etc.)
  • Sets up shared guidelines for consistent, accessible, performant code
  • Allows project-specific customization via .agents-project.json

${colors.cyan}Learn more:${colors.reset}
  https://github.com/ericthayer/agents-config
`);
