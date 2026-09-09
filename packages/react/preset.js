import { fileURLToPath } from 'node:url';

export default {
  id: 'react',
  frameworks: { next: 'Next.js', react: 'React (Vite/CRA)', remix: 'Remix', astro: 'Astro' },
  root: fileURLToPath(new URL('./content/', import.meta.url)),
  rules: ['accessibility', 'component-architecture', 'spec-driven-development', 'web-performance'],
  skills: ['accessibility-audit', 'scaffold-component', 'workflows'],
  instructions: ['development-standards', 'web-interface-guidelines'],
  features: {
    tailwind: { rules: ['tailwind-v4'] },
    mui: { rules: ['mui'], instructions: ['mui'] },
    supabase: { rules: ['supabase'] },
    gemini: { rules: ['gemini'], skills: ['integrate-gemini'] },
    storybook: { instructions: ['storybook'] },
    threejs: { rules: ['three-js-react'] },
    github: { skills: ['github-automation'] }
  }
};
