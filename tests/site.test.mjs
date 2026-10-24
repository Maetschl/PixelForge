import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => assert.ok(fs.existsSync(path.join(root, relative)), `missing ${relative}`);

for (const file of [
  'dist/index.html', 'dist/styles.css', 'dist/app.js', 'dist/image-pipeline.js',
  'dist/pipeline-worker.js', 'dist/favicon.svg', 'dist/assets/pixel-forge-sample.svg',
  'dist/vendor/three/build/three.module.js', 'dist/vendor/three/examples/jsm/loaders/FBXLoader.js',
  '.github/workflows/pages.yml', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json',
]) exists(file);

const html = read('dist/index.html');
const app = read('dist/app.js');
const workflow = read('.github/workflows/pages.yml');

assert.match(html, /https:\/\/github\.com\/Maetschl\/PixelForge/);
assert.match(html, /data-i18n="sourceCode"/);
assert.match(app, /\.\/assets\/pixel-forge-sample\.svg/);
assert.match(app, /pixel-forge\.locale/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /path: dist/);
assert.doesNotMatch(html, /(?:src|href)="https?:\/\/(?!github\.com\/Maetschl\/PixelForge)/);

console.log('site checks passed');
