import assert from 'node:assert/strict';
import fs from 'node:fs';
const { processImageData, applySourceEffects, applyAlphaCutoff } = await import('../dist/pipeline-core.mjs');

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

const alphaCutoffInput = pixels(3, 1, (x) => x === 0 ? [11, 22, 33, 51] : x === 1 ? [44, 55, 66, 52] : [77, 88, 99, 0]);
const alphaCutoff = applyAlphaCutoff(alphaCutoffInput);
assert.equal(alphaCutoff[3], 0, 'alpha at exactly 20% should become transparent');
assert.equal(alphaCutoff[7], 52, 'alpha above 20% should remain visible');
assert.deepEqual([...alphaCutoff.slice(4, 7)], [44, 55, 66], 'alpha cutoff must not modify RGB channels');
const alphaCutoffSource = new Uint8ClampedArray(applySourceEffects(alphaCutoffInput, 3, 1, { removeBackground: true }).pixels);
assert.equal(alphaCutoffSource[3], 0, 'near-transparent source pixels must stay transparent after background removal');
const alphaCutoffPipeline = new Uint8ClampedArray(processImageData(alphaCutoffInput, 3, 1, { resolution: 3, maxColors: 2, contrast: 0, edgeStrength: 0 }).pixels);
assert.equal(alphaCutoffPipeline[3], 0, 'direct pipeline input at 20% alpha must become transparent');
assert.equal(alphaCutoffPipeline[7], 255, 'direct pipeline input above 20% alpha must remain visible');

const sparseCell = pixels(4, 4, (x, y) => x === 1 && y === 1 ? [245, 245, 245, 112] : [0, 0, 0, 0]);
const sparseCellOutput = new Uint8ClampedArray(processImageData(sparseCell, 4, 4, { resolution: 1, maxColors: 4, contrast: 0, edgeStrength: 0 }).pixels);
assert.equal(sparseCellOutput[3], 0, 'a sparse antialiased residue must not become an opaque cell');

const coveredCell = pixels(4, 4, (x) => x < 2 ? [42, 68, 94, 255] : [0, 0, 0, 0]);
const coveredCellOutput = new Uint8ClampedArray(processImageData(coveredCell, 4, 4, { resolution: 1, maxColors: 4, contrast: 0, edgeStrength: 0 }).pixels);
assert.equal(coveredCellOutput[3], 255, 'a sufficiently covered cell must remain visible');
assert.deepEqual([...coveredCellOutput.slice(0, 3)], [42, 68, 94], 'cell majority must use the covered subject color');

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

const bordered = new Uint8ClampedArray(processImageData(removedPixels, 12, 12, { resolution: 12, maxColors: 48, contrast: 0, edgeStrength: 0, borderEnabled: true, borderWidth: 1, borderColor: '#131313' }).pixels);
assert.equal(bordered[(3 * 12 + 5) * 4 + 3], 255, 'border should add alpha outside the subject');
assert.deepEqual([...bordered.slice((3 * 12 + 5) * 4, (3 * 12 + 5) * 4 + 3)], [19, 19, 19], 'border should use the configured color');

const singlePixel = pixels(9, 9, (x, y) => x === 4 && y === 4 ? [80, 120, 160, 255] : [1, 2, 3, 0]);
const onePixelBorder = new Uint8ClampedArray(processImageData(singlePixel, 9, 9, { resolution: 9, maxColors: 48, contrast: 0, edgeStrength: 0, borderEnabled: true, borderWidth: 1, borderColor: '#abcdef' }).pixels);
assert.equal(onePixelBorder[(4 * 9 + 3) * 4 + 3], 255, 'one-pixel border should paint the left side');
assert.equal(onePixelBorder[(3 * 9 + 3) * 4 + 3], 0, 'one-pixel border must not paint a diagonal');
assert.deepEqual([...onePixelBorder.slice((4 * 9 + 3) * 4, (4 * 9 + 3) * 4 + 3)], [171, 205, 239], 'border should use the configured hexadecimal color');

const fourPixelBorder = new Uint8ClampedArray(processImageData(singlePixel, 9, 9, { resolution: 9, maxColors: 48, contrast: 0, edgeStrength: 0, borderEnabled: true, borderWidth: 4, borderColor: '#abcdef' }).pixels);
assert.equal(fourPixelBorder[(4 * 9 + 0) * 4 + 3], 255, 'four-pixel border should reach four cells on a side');
assert.equal(fourPixelBorder[(0 * 9 + 0) * 4 + 3], 0, 'four-pixel border must not reach a diagonal at distance four');
assert.equal(fourPixelBorder[(1 * 9 + 1) * 4 + 3], 255, 'four-pixel border should reach diagonals up to distance three');
assert.deepEqual([...fourPixelBorder.slice((4 * 9 + 4) * 4, (4 * 9 + 4) * 4 + 3)], [80, 120, 160], 'border must not overwrite visible source pixels');

const supersampled = pixels(512, 512, (x, y) => x >= 160 && x < 352 && y >= 160 && y < 352 ? [40, 80, 120, 255] : [0, 0, 0, 0]);
const supersampledResult = new Uint8ClampedArray(processImageData(supersampled, 512, 512, { resolution: 128, maxColors: 48, contrast: 0, edgeStrength: 0, borderEnabled: true, borderWidth: 3, borderColor: '#cccccc' }).pixels);
const borderCell = (x, y) => (y * 128 + x) * 4;
assert.equal(supersampledResult[borderCell(36, 64) + 3], 0, 'a three-cell final border should not spill four cells outward');
assert.deepEqual([...supersampledResult.slice(borderCell(37, 64), borderCell(37, 64) + 3)], [204, 204, 204], 'the first outside cell should contain the final border');

const unchanged = new Uint8ClampedArray(applySourceEffects(original, 12, 12, { removeBackground: false, borderEnabled: false }).pixels);
assert.deepEqual([...unchanged], [...original], 'disabled source effects must leave the original composition unchanged');

console.log('pipeline tests passed');
