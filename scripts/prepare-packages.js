import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const copy = (source, destination) => {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
};

// Root documents remain the editable source for the legacy React package.
fs.rmSync(path.join(root, 'packages/react/content'), { recursive: true, force: true });
for (const item of ['AGENTS.md', 'rules', 'skills', 'instructions']) {
  copy(path.join(root, item), path.join(root, 'packages/react/content', item));
}
for (const item of ['schemas', 'skills/github-automation']) {
  fs.rmSync(path.join(root, 'packages/core/content', item), { recursive: true, force: true });
}
for (const item of ['COMMIT_CONVENTION.md', 'GITHUB_AUTH_SETUP.md', 'pr-template-commits.md', 'pr-body-semantic-release.md']) {
  copy(path.join(root, '.github', item), path.join(root, 'packages/react/content/github', item));
}
copy(path.join(root, 'schemas/agents-project.schema.json'), path.join(root, 'packages/core/content/schemas/agents-project.schema.json'));
copy(path.join(root, 'skills/github-automation'), path.join(root, 'packages/core/content/skills/github-automation'));
for (const name of ['core', 'react', 'angular', 'vue']) {
  copy(path.join(root, 'LICENSE'), path.join(root, 'packages', name, 'LICENSE'));
}
