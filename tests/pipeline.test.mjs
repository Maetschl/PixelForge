import assert from 'node:assert/strict';
import fs from 'node:fs';
const { processImageData, applySourceEffects } = await import('../dist/pipeline-core.mjs');

function pixels(width, height, fill) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const color = fill(x, y);
    const index = (y * width + x) * 4;
    data.set(color, index);
  }
  return data;
}

function resultColors(result) {
  const output = new Uint8ClampedArray(result.pixels);
  const colors = new Set();
  for (let i = 0; i < output.length; i += 4) if (output[i + 3]) colors.add(`${output[i]},${output[i + 1]},${output[i + 2]}`);
  return { output, colors };
}

const solid = processImageData(pixels(16, 16, () => [230, 120, 40, 255]), 16, 16, { resolution: 8, maxColors: 48, contrast: 0, edgeStrength: 0 });
assert.equal(resultColors(solid).colors.size, 1, 'a solid image should stay one color');
assert.equal(new Uint8ClampedArray(solid.pixels).length, 8 * 8 * 4, 'output must match target resolution');

const transparent = processImageData(pixels(8, 8, (x, y) => x < 4 && y < 4 ? [20, 220, 180, 255] : [0, 0, 0, 0]), 8, 8, { resolution: 4, maxColors: 8, contrast: 0, edgeStrength: 0 });
const transparentOutput = resultColors(transparent).output;
assert.equal(transparentOutput[(3 * 4 + 3) * 4 + 3], 0, 'empty cells should preserve transparency');

const gradient = processImageData(pixels(32, 32, (x, y) => [x * 8, y * 8, (x + y) * 4, 255]), 32, 32, { resolution: 16, maxColors: 4, contrast: 35, edgeStrength: 50 });
assert.ok(resultColors(gradient).colors.size <= 4, 'output must not exceed the palette limit');

const majority = processImageData(pixels(8, 8, (x, y) => (x < 4 && y < 4) || (x >= 4 && y >= 4) ? [245, 30, 30, 255] : [25, 40, 230, 255]), 8, 8, { resolution: 2, maxColors: 2, contrast: 0, edgeStrength: 0 });
const majorityColors = resultColors(majority).colors;
assert.equal(majorityColors.size, 2, 'cell majority sampling should retain dominant colors');
assert.ok([...majorityColors].some((color) => {
  const [r, g, b] = color.split(',').map(Number);
  return b > r + 80;
}), 'chromatic blue accents should survive palette mapping');

const minorityCyan = processImageData(pixels(32, 32, (x, y) => x >= 11 && x < 21 && y >= 10 && y < 22 ? [150, 195, 215, 255] : [248, 246, 238, 255]), 32, 32, { resolution: 16, maxColors: 8, contrast: 0, edgeStrength: 0 });
assert.ok([...resultColors(minorityCyan).colors].some((color) => {
  const [r, g, b] = color.split(',').map(Number);
  return b > r + 12 && b >= g;
}), 'minority celeste clusters should receive a palette color');

const original = pixels(12, 12, (x, y) => {
  if (x >= 4 && x < 8 && y >= 4 && y < 8) return [222, 72, 55, 255];
  return [248, 248, 242, 255];
});
const removedBackground = applySourceEffects(original, 12, 12, { removeBackground: true, backgroundTolerance: 0.08 });
const removedPixels = new Uint8ClampedArray(removedBackground.pixels);
assert.equal(removedPixels[3], 0, 'connected corner background should become transparent');
assert.equal(removedPixels[(5 * 12 + 5) * 4 + 3], 255, 'the subject should remain opaque after background removal');

const enclosed = pixels(12, 12, (x, y) => {
  if (x >= 3 && x < 9 && y >= 3 && y < 9) return [220, 70, 50, 255];
  if (x >= 5 && x < 7 && y >= 5 && y < 7) return [250, 250, 245, 255];
  return [248, 248, 242, 255];
});
const enclosedResult = new Uint8ClampedArray(applySourceEffects(enclosed, 12, 12, { removeBackground: true }).pixels);
assert.equal(enclosedResult[(5 * 12 + 5) * 4 + 3], 255, 'interior regions not connected to the edge must remain visible');

const gradientBackground = pixels(64, 64, (x, y) => {
  const tone = 24 + Math.round(x * 1.6 + y * .8);
  return x >= 20 && x < 44 && y >= 18 && y < 46 ? [220, 70, 45, 255] : [tone, tone + 7, tone + 13, 255];
});
const gradientRemoved = new Uint8ClampedArray(applySourceEffects(gradientBackground, 64, 64, { removeBackground: true, backgroundTolerance: 0.08 }).pixels);
assert.equal(gradientRemoved[3], 0, 'a connected gradient background should be removed from the edge');
assert.equal(gradientRemoved[(30 * 64 + 30) * 4 + 3], 255, 'the subject must survive a gradient background removal');

const paddedBackground = pixels(32, 32, (x, y) => {
  if (x < 4 || x >= 28 || y < 4 || y >= 28) return [0, 0, 0, 0];
  return x >= 12 && x < 20 && y >= 11 && y < 22 ? [40, 150, 220, 255] : [248, 247, 240, 255];
});
const paddedRemoved = new Uint8ClampedArray(applySourceEffects(paddedBackground, 32, 32, { removeBackground: true }).pixels);
assert.equal(paddedRemoved[(6 * 32 + 6) * 4 + 3], 0, 'background inside transparent padding should be removed');
assert.equal(paddedRemoved[(15 * 32 + 15) * 4 + 3], 255, 'the subject inside transparent padding must remain visible');

const bordered = new Uint8ClampedArray(applySourceEffects(removedPixels, 12, 12, { borderEnabled: true, borderWidth: 1, borderColor: '#131313' }).pixels);
assert.equal(bordered[(3 * 12 + 5) * 4 + 3], 255, 'border should add alpha outside the subject');
assert.deepEqual([...bordered.slice((3 * 12 + 5) * 4, (3 * 12 + 5) * 4 + 3)], [19, 19, 19], 'border should use the configured color');

const supersampled = pixels(512, 512, (x, y) => x >= 160 && x < 352 && y >= 160 && y < 352 ? [40, 80, 120, 255] : [0, 0, 0, 0]);
const supersampledBorder = new Uint8ClampedArray(applySourceEffects(supersampled, 512, 512, { borderEnabled: true, borderWidth: 3, borderColor: '#cccccc' }).pixels);
const supersampledResult = new Uint8ClampedArray(processImageData(supersampledBorder, 512, 512, { resolution: 128, maxColors: 48, contrast: 0, edgeStrength: 0 }).pixels);
const borderCell = (x, y) => (y * 128 + x) * 4;
assert.equal(supersampledResult[borderCell(38, 64) + 3], 0, 'a one-cell border should not spill two cells outward');
assert.deepEqual([...supersampledResult.slice(borderCell(39, 64), borderCell(39, 64) + 3)], [204, 204, 204], 'the first outside cell should contain the border');

const unchanged = new Uint8ClampedArray(applySourceEffects(original, 12, 12, { removeBackground: false, borderEnabled: false }).pixels);
assert.deepEqual([...unchanged], [...original], 'disabled source effects must leave the original composition unchanged');

console.log('pipeline tests passed');
