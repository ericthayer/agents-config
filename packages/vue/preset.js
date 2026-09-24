import { fileURLToPath } from 'node:url';

export default {
  id: 'vue',
  frameworks: { vue: 'Vue' },
  root: fileURLToPath(new URL('./', import.meta.url)),
  rules: ['component-architecture', 'vue-composition-api', 'vue-composables', 'vue-state', 'vue-router', 'vue-forms'],
  skills: ['scaffold-component'],
  instructions: ['vue-testing'],
  features: {}
};
