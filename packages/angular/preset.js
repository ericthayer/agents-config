import { fileURLToPath } from 'node:url';

export default {
  id: 'angular',
  frameworks: { angular: 'Angular' },
  root: fileURLToPath(new URL('./', import.meta.url)),
  rules: ['component-architecture', 'angular-signals', 'angular-state', 'angular-router', 'angular-forms'],
  skills: ['scaffold-component'],
  instructions: ['angular-testing'],
  features: {}
};
