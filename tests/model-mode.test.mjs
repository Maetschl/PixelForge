import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(decodeURIComponent(new URL('..', import.meta.url).pathname));
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'dist/app.js'), 'utf8');
const fixture = fs.readFileSync(path.join(root, 'tests/fixtures/test-cube.obj'), 'utf8');

assert.match(html, /<script type="importmap">/);
assert.match(html, /"three": "\.\/vendor\/three\/build\/three\.module\.js"/);
assert.match(html, /id="mode-2d"/);
assert.match(html, /id="mode-pp"/);
assert.match(html, /id="mode-3d"/);
assert.match(html, /accept="image\/\*,\.glb,\.gltf,\.obj,\.fbx,\.mtl"/);
assert.match(html, /id="source-3d-canvas"/);
assert.match(app, /new GLTFLoader/);
assert.match(app, /new OBJLoader/);
assert.match(app, /new MTLLoader/);
assert.match(app, /new FBXLoader/);
assert.match(app, /readRenderTargetPixels/);
assert.match(app, /setURLModifier/);
assert.match(app, /disposeThreeObject\(state\.three\.modelRoot\)/);
assert.match(app, /state\.three\.objectUrls\.forEach\(\(url\) => URL\.revokeObjectURL\(url\)\)/);
assert.match(app, /state\.model\.root = null/);
assert.match(fixture, /o PixelForgeCube/);
assert.match(fixture, /f 1 2 3 4/);

for (const file of [
  'dist/vendor/three/build/three.module.js',
  'dist/vendor/three/examples/jsm/controls/OrbitControls.js',
  'dist/vendor/three/examples/jsm/loaders/GLTFLoader.js',
  'dist/vendor/three/examples/jsm/loaders/OBJLoader.js',
  'dist/vendor/three/examples/jsm/loaders/MTLLoader.js',
  'dist/vendor/three/examples/jsm/loaders/FBXLoader.js',
]) assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} should be vendored`);

console.log('model mode assets and integration checks passed');
