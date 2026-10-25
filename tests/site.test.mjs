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
  'dist/assets/examples/pixelart-crystal-skull.png', 'dist/assets/examples/pixelart-harbor-village.png', 'dist/assets/examples/pixelart-volcano-forge.png',
  'dist/assets/examples/pixelperfect-ranger-source.png', 'dist/assets/examples/pixelperfect-ranger-reference.png',
  'dist/vendor/three/build/three.module.js', 'dist/vendor/three/examples/jsm/loaders/FBXLoader.js',
  '.github/workflows/pages.yml', 'README.md', 'AGENTS.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json',
  'mcp/server.mjs', 'mcp/image-io.mjs', 'mcp/pixelforge.example.json',
  'skills/pixelforge/SKILL.md', 'skills/pixelforge/README.md', 'tests/mcp.test.mjs',
]) exists(file);

const html = read('dist/index.html');
const styles = read('dist/styles.css');
const app = read('dist/app.js');
const workflow = read('.github/workflows/pages.yml');
const readme = read('README.md');
const packageJson = JSON.parse(read('package.json'));
const skill = read('skills/pixelforge/SKILL.md');
const agents = read('AGENTS.md');

assert.match(html, /https:\/\/github\.com\/Maetschl\/PixelForge/);
assert.match(html, /data-i18n="sourceCode"/);
assert.match(html, /data-i18n="mcpGuide"/);
assert.match(html, /data-i18n="assetPrompt"/);
assert.match(html, /id="clear-source-button"/);
assert.match(html, /data-i18n="clean"/);
assert.match(html, /id="advanced-toggle"[^>]*aria-pressed="false"/);
assert.match(html, /id="mode-pp"[^>]*aria-pressed="false"/);
assert.match(html, /id="pp-settings"[^>]*hidden/);
assert.match(html, /id="advanced-pipeline"[^>]*hidden/);
assert.match(html, /data-stage-id="alpha-cutoff"/);
assert.match(html, /data-stage-id="background-removal"/);
assert.match(html, /data-stage-id="final-border"/);
assert.match(html, /class="advanced-divider"/);
assert.match(html, /class="[^"]*floating-export-button[^"]*"[^>]*id="export-button"/);
assert.match(html, /name="keywords"[^>]*pixelart/);
assert.doesNotMatch(app, /test-mouse-adventure\.png/);
assert.match(app, /pixel-forge\.locale/);
assert.match(app, /\.\/pipeline-core\.mjs/);
assert.match(app, /type: 'module'/);
assert.match(app, /Local pixelart studio/);
assert.match(app, /pixelart-crystal-skull\.png/);
assert.match(app, /pixelart-harbor-village\.png/);
assert.match(app, /pixelart-volcano-forge\.png/);
assert.match(app, /Math\.random\(\)/);
assert.match(app, /const exampleSettings =/);
assert.match(app, /palette: 24, contrast: 42, edges: 0/);
assert.match(app, /removeBackground: true, borderEnabled: true, borderWidth: 1, borderColor: '#131313'/);
assert.match(app, /function loadRandomSample\(\)/);
assert.match(app, /els\.sampleButton\.addEventListener\('click', loadRandomSample\)/);
assert.doesNotMatch(app, /renderAll\(\);\s*loadRandomSample\(\);/);
assert.match(app, /function clearActiveSource\(\)/);
assert.match(app, /state\.mode === 'pp'/);
assert.match(app, /processPerfectPixel/);
assert.match(app, /pixelperfect-ranger-source\.png/);
assert.match(app, /pixelSizeMode/);
assert.match(app, /function toggleAdvancedPipeline\(\)/);
assert.match(app, /state\.pipeline\.advanced/);
assert.match(app, /trace: state\.pipeline\.advanced\.enabled/);
assert.match(app, /alphaCutoffPercent/);
assert.match(app, /cellCoverageThreshold/);
assert.match(app, /els\.clearSourceButton\.addEventListener\('click', clearActiveSource\)/);
assert.match(app, /state\.requestId \+= 1/);
assert.match(styles, /\.floating-export-button \{[^}]*position: fixed/);
assert.match(styles, /\.topbar-actions \{[^}]*padding-right:/);
assert.match(styles, /\.advanced-pipeline \{/);
assert.match(styles, /\.advanced-divider::before/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(workflow, /path: dist/);
assert.doesNotMatch(html, /(?:src|href)="https?:\/\/(?!github\.com\/Maetschl\/PixelForge)/);
assert.match(readme, /pixelart/);
assert.match(readme, /## Asset generation prompt/);
assert.match(readme, /Generate \[SUBJECT\] as an isolated asset/);
assert.match(readme, /genuinely transparent background with an alpha channel/);
assert.match(readme, /A PNG with genuine background transparency/);
assert.ok(packageJson.keywords.includes('pixelart'));
assert.match(skill, /pixelate_image/);
assert.match(agents, /local-only/);

console.log('site checks passed');
