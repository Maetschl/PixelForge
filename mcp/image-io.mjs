import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as pipeline from '../dist/pipeline-core.mjs';

const DEFAULTS = {
  resolution: 128,
  maxColors: 48,
  contrast: 0,
  edgeStrength: 0,
  removeBackground: false,
  backgroundTolerance: 0.08,
  borderEnabled: false,
  borderWidth: 2,
  borderColor: '#131313',
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  overwrite: false,
};

export const CAPABILITIES = `# PixelForge MCP capabilities

PixelForge is a local-only pixelart processor. The MCP accepts local PNG, JPEG, WebP, and SVG files and writes transparent PNG output locally.

The first MCP version exposes 2D processing only. The web editor still supports 3D model previews; 3D MCP rendering is planned for a later version.

Defaults: 128x128, 48 colors, 0% contrast, 0% edge strength, background removal off, border off, border color #131313, border width 2px.
`;

function assertLocalPath(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a local file path.`);
  if (/^(?:https?:|data:|file:)/i.test(value)) throw new Error(`${field} must not be a URL.`);
  return path.resolve(value);
}

function validateHexColor(value) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('borderColor must be a six-digit hexadecimal color.');
}

function normalizeOptions(options = {}) {
  const config = { ...DEFAULTS, ...options };
  if (!Number.isInteger(config.resolution) || config.resolution < 16 || config.resolution > 512) throw new Error('resolution must be an integer from 16 to 512.');
  if (!Number.isInteger(config.maxColors) || config.maxColors < 2 || config.maxColors > 48) throw new Error('maxColors must be an integer from 2 to 48.');
  for (const key of ['contrast', 'edgeStrength']) if (!Number.isFinite(config[key]) || config[key] < 0 || config[key] > 100) throw new Error(`${key} must be between 0 and 100.`);
  if (!Number.isFinite(config.backgroundTolerance) || config.backgroundTolerance < 0.01 || config.backgroundTolerance > 0.5) throw new Error('backgroundTolerance must be between 0.01 and 0.5.');
  if (!Number.isInteger(config.borderWidth) || config.borderWidth < 1 || config.borderWidth > 8) throw new Error('borderWidth must be an integer from 1 to 8.');
  if (!Number.isFinite(config.scale) || config.scale < 0.1 || config.scale > 8) throw new Error('scale must be between 0.1 and 8.');
  if (!Number.isFinite(config.offsetX) || !Number.isFinite(config.offsetY)) throw new Error('offsetX and offsetY must be finite numbers.');
  validateHexColor(config.borderColor);
  config.sourcePath = assertLocalPath(config.sourcePath, 'sourcePath');
  if (config.outputPath) config.outputPath = assertLocalPath(config.outputPath, 'outputPath');
  return config;
}

async function composeSource(sourcePath, resolution, scale, offsetX, offsetY) {
  const factor = Math.min(4, Math.max(2, Math.ceil(1024 / resolution)));
  const size = resolution * factor;
  const fitSize = Math.max(1, Math.round(resolution * 0.86 * scale * factor));
  const resized = await sharp(sourcePath, { animated: false })
    .ensureAlpha()
    .resize({ width: fitSize, height: fitSize, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((size - resized.info.width) / 2 + offsetX * factor);
  const top = Math.round((size - resized.info.height) / 2 + offsetY * factor);
  const canvas = await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized.data, left, top }])
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(canvas.data), width: size, height: size, factor };
}

function effectConfig(config, factor) {
  return {
    removeBackground: config.removeBackground,
    backgroundTolerance: config.backgroundTolerance,
    borderEnabled: config.borderEnabled,
    borderWidth: Math.max(1, config.borderWidth * factor - 1),
    borderColor: config.borderColor,
  };
}

function outputPathFor(sourcePath, resolution, requested) {
  if (requested) return requested;
  const extension = path.extname(sourcePath);
  const stem = path.basename(sourcePath, extension);
  return path.join(path.dirname(sourcePath), `${stem}-pixelart-${resolution}x${resolution}.png`);
}

export async function pixelateImage(options) {
  const config = normalizeOptions(options);
  const outputPath = outputPathFor(config.sourcePath, config.resolution, config.outputPath);
  if (!config.overwrite) {
    try {
      await fs.access(outputPath);
      throw new Error(`Output already exists: ${outputPath}. Set overwrite to true to replace it.`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  const started = Date.now();
  const composed = await composeSource(config.sourcePath, config.resolution, config.scale, config.offsetX, config.offsetY);
  const effects = pipeline.applySourceEffects(composed.data, composed.width, composed.height, effectConfig(config, composed.factor));
  const result = pipeline.processImageData(new Uint8ClampedArray(effects.pixels), composed.width, composed.height, {
    resolution: config.resolution,
    maxColors: config.maxColors,
    contrast: config.contrast,
    edgeStrength: config.edgeStrength,
  });
  const pixels = new Uint8ClampedArray(result.pixels);
  let transparentPixels = 0;
  for (let index = 3; index < pixels.length; index += 4) if (pixels[index] < 8) transparentPixels += 1;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(pixels), { raw: { width: config.resolution, height: config.resolution, channels: 4 } }).png().toFile(outputPath);
  return {
    outputPath,
    width: config.resolution,
    height: config.resolution,
    usedColors: result.usedColors,
    maxColors: config.maxColors,
    transparentPixels,
    elapsedMs: Date.now() - started,
  };
}
