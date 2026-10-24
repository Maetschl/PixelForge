import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => assert.ok(fs.existsSync(path.join(root, relative)), `missing ${relative}`);

for (const file of [
  'dist/index.html', 'dist/styles.css', 'dist/app.js', 'dist/image-pipeline.js',
  'dist/pipeline-core.mjs', 'dist/pipeline-worker.js', 'dist/favicon.svg', 'dist/assets/pixel-forge-sample.svg',
  'dist/vendor/three/build/three.module.js', 'dist/vendor/three/examples/jsm/loaders/FBXLoader.js',
  '.github/workflows/pages.yml', 'README.md', 'AGENTS.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json',
  'mcp/server.mjs', 'mcp/image-io.mjs', 'mcp/pixelforge.example.json',
  'skills/pixelforge/SKILL.md', 'skills/pixelforge/README.md', 'tests/mcp.test.mjs',
]) exists(file);

const html = read('dist/index.html');
const app = read('dist/app.js');
const workflow = read('.github/workflows/pages.yml');
const readme = read('README.md');
const packageJson = JSON.parse(read('package.json'));
const skill = read('skills/pixelforge/SKILL.md');
const agents = read('AGENTS.md');

assert.match(html, /https:\/\/github\.com\/Maetschl\/PixelForge/);
assert.match(html, /data-i18n="sourceCode"/);
assert.match(html, /data-i18n="mcpGuide"/);
assert.match(html, /name="keywords"[^>]*pixelart/);
assert.match(app, /\.\/assets\/pixel-forge-sample\.svg/);
assert.match(app, /pixel-forge\.locale/);
assert.match(app, /\.\/pipeline-core\.mjs/);
assert.match(app, /type: 'module'/);
assert.match(app, /Local pixelart studio/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /path: dist/);
assert.doesNotMatch(html, /(?:src|href)="https?:\/\/(?!github\.com\/Maetschl\/PixelForge)/);
assert.match(readme, /pixelart/);
assert.ok(packageJson.keywords.includes('pixelart'));
assert.match(skill, /pixelate_image/);
assert.match(agents, /local-only/);

console.log('site checks passed');
