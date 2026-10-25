import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { processPerfectPixel, reducePerfectPixel } from '../dist/pipeline-core.mjs';

function rgba(width, height, fill) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) data.set(fill(x, y), (y * width + x) * 4);
  return data;
}

const sourcePath = fileURLToPath(new URL('../dist/assets/examples/pixelperfect-ranger-source.png', import.meta.url));
const referencePath = fileURLToPath(new URL('../dist/assets/examples/pixelperfect-ranger-reference.png', import.meta.url));
const sourceMeta = await sharp(sourcePath).metadata();
const referenceMeta = await sharp(referencePath).metadata();
assert.deepEqual([sourceMeta.width, sourceMeta.height], [1261, 1247]);
assert.deepEqual([referenceMeta.width, referenceMeta.height], [89, 88]);

const sourceRaw = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const sourcePixels = new Uint8ClampedArray(sourceRaw.data);
const ranger = processPerfectPixel(sourcePixels, sourceRaw.info.width, sourceRaw.info.height, { targetResolution: 128 });
assert.equal(new Uint8ClampedArray(ranger.pixels).length, 128 * 128 * 4);
assert.ok(ranger.detectedPixelSize >= 13.5 && ranger.detectedPixelSize <= 14.5, 'ranger block size should be close to 14px');
assert.ok(ranger.logicalWidth >= 88 && ranger.logicalWidth <= 91);
assert.ok(ranger.logicalHeight >= 87 && ranger.logicalHeight <= 90);
assert.ok(ranger.transparentPixels > 0, 'transparent source margins should remain transparent');

const blocks = rgba(8, 8, (x, y) => (x < 4 ? (y < 4 ? [220, 40, 30, 255] : [40, 80, 220, 255]) : [20, 180, 80, 255]));
const reduced = reducePerfectPixel(blocks, 8, 8, 4);
assert.deepEqual([reduced.width, reduced.height], [2, 2]);
const logicalColors = new Set();
for (let i = 0; i < reduced.pixels.length; i += 4) logicalColors.add([...reduced.pixels.slice(i, i + 4)].join(','));
assert.deepEqual([...logicalColors].sort(), ['20,180,80,255', '220,40,30,255', '40,80,220,255'].sort(), 'nearest reduction must not interpolate block colors');

const transparentSource = rgba(20, 20, (x, y) => {
  if (x >= 7 && x < 13 && y >= 6 && y < 14) return [230, 100, 40, 255];
  return [0, 0, 0, 0];
});
const before = [...transparentSource];
const bordered = processPerfectPixel(transparentSource, 20, 20, {
  pixelSizeMode: 'manual', pixelSize: 2, targetResolution: 20,
  borderEnabled: true, borderWidth: 1, borderColor: '#131313',
});
const borderedPixels = new Uint8ClampedArray(bordered.pixels);
assert.deepEqual([...transparentSource], before, 'PP must not mutate its source');
assert.ok(borderedPixels.some((value, index) => index % 4 === 3 && value === 255 && borderedPixels[index - 3] === 19), 'border must be applied to the final PP raster');

const moved = processPerfectPixel(transparentSource, 20, 20, {
  pixelSizeMode: 'manual', pixelSize: 2, targetResolution: 32,
  transform: { x: 4, y: 4, scale: 1 },
});
assert.equal(new Uint8ClampedArray(moved.pixels).length, 32 * 32 * 4, 'fit must use the shared export resolution');
assert.ok(moved.transparentPixels > 0, 'fit must preserve transparent margins');

console.log('perfect pixel tests passed');
