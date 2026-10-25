// Shared, browser-safe pipeline core. It is imported by the web app, worker, and MCP.

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function parseHexColor(value) {
    const normalized = String(value || '#131313').replace('#', '');
    const hex = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized;
    return [
      Number.parseInt(hex.slice(0, 2), 16) || 19,
      Number.parseInt(hex.slice(2, 4), 16) || 19,
      Number.parseInt(hex.slice(4, 6), 16) || 19,
    ];
  }

  function srgbToLinear(value) {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4);
  }

  function linearToSrgb(value) {
    const channel = clamp(value, 0, 1);
    return channel <= .0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - .055;
  }

  function rgbToOklab(r, g, b) {
    const lr = srgbToLinear(r); const lg = srgbToLinear(g); const lb = srgbToLinear(b);
    const l = Math.cbrt(.4122214708 * lr + .5363325363 * lg + .0514459929 * lb);
    const m = Math.cbrt(.2119034982 * lr + .6806995451 * lg + .1073969566 * lb);
    const s = Math.cbrt(.0883024619 * lr + .2817188376 * lg + .6299787005 * lb);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
  }

  function oklabDistance(first, second) {
    const dL = first[0] - second[0]; const da = first[1] - second[1]; const db = first[2] - second[2];
    return Math.hypot(dL, da, db);
  }

  function alphaBounds(data, width, height) {
    let minX = width; let minY = height; let maxX = -1; let maxY = -1;
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 8) continue;
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    return maxX < 0 ? null : { minX, minY, maxX, maxY };
  }

  function applyAlphaCutoff(input, cutoff = 51) {
    const output = new Uint8ClampedArray(input);
    const threshold = clamp(Number(cutoff), 0, 255);
    for (let index = 3; index < output.length; index += 4) {
      if (output[index] <= threshold) output[index] = 0;
    }
    return output;
  }

  function sourceBackgroundReferences(data, width, height, bounds) {
    const coordinates = [];
    const step = Math.max(1, Math.floor(Math.min(width, height) / 24));
    for (let x = bounds.minX; x <= bounds.maxX; x += step) {
      coordinates.push([x, bounds.minY], [x, bounds.maxY]);
    }
    for (let y = bounds.minY + step; y < bounds.maxY; y += step) {
      coordinates.push([bounds.minX, y], [bounds.maxX, y]);
    }
    coordinates.push(
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
      [bounds.minX, bounds.minY], [bounds.maxX, bounds.minY], [bounds.minX, bounds.maxY], [bounds.maxX, bounds.maxY],
    );
    const references = [];
    const seen = new Set();
    coordinates.forEach(([x, y]) => {
      const index = (y * width + x) * 4;
      if (data[index + 3] < 8) return;
      const key = `${data[index] >> 3},${data[index + 1] >> 3},${data[index + 2] >> 3}`;
      if (seen.has(key)) return;
      seen.add(key);
      references.push(rgbToOklab(data[index], data[index + 1], data[index + 2]));
    });
    return references;
  }

  function removeBackgroundFloodFill(input, width, height, tolerance = 0.08) {
    const output = new Uint8ClampedArray(input);
    const bounds = alphaBounds(input, width, height);
    if (!bounds) return output;
    const references = sourceBackgroundReferences(input, width, height, bounds);
    if (!references.length) return output;
    const visible = width * height;
    const removed = new Uint8Array(visible);
    const queue = new Int32Array(visible);
    let head = 0; let tail = 0;
    const colorCache = new Map();
    const getLab = (pixelIndex) => {
      const sourceIndex = pixelIndex * 4;
      if (input[sourceIndex + 3] < 8) return false;
      const key = `${input[sourceIndex] >> 3},${input[sourceIndex + 1] >> 3},${input[sourceIndex + 2] >> 3}`;
      if (colorCache.has(key)) return colorCache.get(key);
      const lab = rgbToOklab(input[sourceIndex], input[sourceIndex + 1], input[sourceIndex + 2]);
      colorCache.set(key, lab);
      return lab;
    };
    const referenceDistance = (pixelIndex) => {
      const lab = getLab(pixelIndex);
      if (!lab) return Infinity;
      let distance = Infinity;
      references.forEach((reference) => { distance = Math.min(distance, oklabDistance(lab, reference)); });
      return distance;
    };
    const referenceReach = tolerance * 1.55;
    const localStepTolerance = Math.max(.018, tolerance * .62);
    const isBackgroundSeed = (pixelIndex) => referenceDistance(pixelIndex) <= referenceReach;
    const canContinueBackground = (currentIndex, nextIndex) => {
      const currentLab = getLab(currentIndex);
      const nextLab = getLab(nextIndex);
      if (!currentLab || !nextLab) return false;
      const localDistance = oklabDistance(currentLab, nextLab);
      if (localDistance > localStepTolerance) return false;
      return referenceDistance(nextIndex) <= referenceReach || referenceDistance(currentIndex) <= referenceReach;
    };
    const seed = (pixelIndex) => {
      if (pixelIndex < 0 || pixelIndex >= visible || removed[pixelIndex]) return;
      removed[pixelIndex] = 1;
      queue[tail] = pixelIndex;
      tail += 1;
    };
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const top = bounds.minY * width + x;
      const bottom = bounds.maxY * width + x;
      if (isBackgroundSeed(top)) seed(top);
      if (isBackgroundSeed(bottom)) seed(bottom);
    }
    for (let y = bounds.minY + 1; y < bounds.maxY; y += 1) {
      const left = y * width + bounds.minX;
      const right = y * width + bounds.maxX;
      if (isBackgroundSeed(left)) seed(left);
      if (isBackgroundSeed(right)) seed(right);
    }
    while (head < tail) {
      const pixelIndex = queue[head]; head += 1;
      const x = pixelIndex % width; const y = Math.floor(pixelIndex / width);
      if (x > 0 && canContinueBackground(pixelIndex, pixelIndex - 1)) seed(pixelIndex - 1);
      if (x < width - 1 && canContinueBackground(pixelIndex, pixelIndex + 1)) seed(pixelIndex + 1);
      if (y > 0 && canContinueBackground(pixelIndex, pixelIndex - width)) seed(pixelIndex - width);
      if (y < height - 1 && canContinueBackground(pixelIndex, pixelIndex + width)) seed(pixelIndex + width);
    }
    for (let pixelIndex = 0; pixelIndex < visible; pixelIndex += 1) {
      const outputIndex = pixelIndex * 4;
      if (removed[pixelIndex]) {
        output[outputIndex + 3] = 0;
        continue;
      }
      if (input[outputIndex + 3] < 8) continue;
      const x = pixelIndex % width; const y = Math.floor(pixelIndex / width);
      const neighbors = [];
      if (x > 0) neighbors.push(pixelIndex - 1);
      if (x < width - 1) neighbors.push(pixelIndex + 1);
      if (y > 0) neighbors.push(pixelIndex - width);
      if (y < height - 1) neighbors.push(pixelIndex + width);
      if (neighbors.some((neighbor) => removed[neighbor])) output[outputIndex + 3] = Math.min(output[outputIndex + 3], 112);
    }
    return output;
  }

  function addAlphaBorder(input, width, height, borderWidth, color) {
    const output = new Uint8ClampedArray(input);
    const radius = clamp(Math.ceil(Number(borderWidth) || 2), 1, 8);
    const borderColor = parseHexColor(color);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const pixelIndex = y * width + x; const outputIndex = pixelIndex * 4;
      if (input[outputIndex + 3] >= 8) continue;
      let shouldPaint = false;
      for (let dy = -radius; dy <= radius && !shouldPaint; dy += 1) for (let dx = -radius; dx <= radius && !shouldPaint; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const distanceX = Math.abs(dx); const distanceY = Math.abs(dy);
        const diagonal = distanceX > 0 && distanceY > 0;
        const maxDistance = Math.max(distanceX, distanceY);
        const allowedDistance = diagonal ? radius - 1 : radius;
        if (maxDistance > allowedDistance) continue;
        const sourceX = x + dx; const sourceY = y + dy;
        if (sourceX < 0 || sourceX >= width || sourceY < 0 || sourceY >= height) continue;
        if (input[(sourceY * width + sourceX) * 4 + 3] >= 8) shouldPaint = true;
      }
      if (shouldPaint) {
        output[outputIndex] = borderColor[0]; output[outputIndex + 1] = borderColor[1]; output[outputIndex + 2] = borderColor[2]; output[outputIndex + 3] = 255;
      }
    }
    return output;
  }

  function applySourceEffects(input, width, height, config = {}) {
    let output = applyAlphaCutoff(input);
    if (config.removeBackground) output = removeBackgroundFloodFill(output, width, height, clamp(Number(config.backgroundTolerance) || 0.08, 0.01, 0.5));
    output = applyAlphaCutoff(output);
    return { pixels: output.buffer, width, height };
  }

  function oklabToRgb(L, a, b) {
    const l = Math.pow(L + .3963377774 * a + .2158037573 * b, 3);
    const m = Math.pow(L - .1055613458 * a - .0638541728 * b, 3);
    const s = Math.pow(L - .0894841775 * a - 1.291485548 * b, 3);
    return [
      Math.round(clamp(255 * linearToSrgb(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), 0, 255)),
      Math.round(clamp(255 * linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), 0, 255)),
      Math.round(clamp(255 * linearToSrgb(-.0041960863 * l - .7034186147 * m + 1.707614701 * s), 0, 255)),
    ];
  }

  function colorInfo(rgb, count = 1) {
    const lab = rgbToOklab(rgb[0], rgb[1], rgb[2]);
    const chroma = Math.hypot(lab[1], lab[2]);
    return { rgb, lab, chroma, hue: Math.atan2(lab[2], lab[1]), count, weight: count * (1 + clamp(chroma * 5, 0, 1) * .75) };
  }

  function buildHistogram(pixels) {
    const buckets = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3];
      if (alpha < 8) continue;
      const r = pixels[i] >> 3; const g = pixels[i + 1] >> 3; const b = pixels[i + 2] >> 3;
      const key = (r << 10) | (g << 5) | b;
      const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
      bucket.r += pixels[i] * alpha; bucket.g += pixels[i + 1] * alpha; bucket.b += pixels[i + 2] * alpha; bucket.count += alpha;
      buckets.set(key, bucket);
    }
    return [...buckets.values()].map((bucket) => colorInfo([
      bucket.r / bucket.count,
      bucket.g / bucket.count,
      bucket.b / bucket.count,
    ], bucket.count));
  }

  function medianCut(points, maxColors) {
    if (!points.length || maxColors < 1) return [];
    const boxes = [{ points: points.slice(), weight: points.reduce((sum, point) => sum + point.weight, 0) }];
    while (boxes.length < maxColors) {
      let candidateIndex = -1; let candidateScore = -1;
      boxes.forEach((box, index) => {
        if (box.points.length < 2) return;
        const ranges = [0, 1, 2].map((axis) => {
          const values = box.points.map((point) => point.lab[axis]);
          return Math.max(...values) - Math.min(...values);
        });
        const score = Math.max(...ranges) * box.weight;
        if (score > candidateScore) { candidateScore = score; candidateIndex = index; }
      });
      if (candidateIndex < 0) break;
      const box = boxes[candidateIndex];
      const axis = [0, 1, 2].reduce((best, current) => {
        const currentRange = Math.max(...box.points.map((point) => point.lab[current])) - Math.min(...box.points.map((point) => point.lab[current]));
        return currentRange > best.range ? { axis: current, range: currentRange } : best;
      }, { axis: 0, range: -1 }).axis;
      box.points.sort((a, b) => a.lab[axis] - b.lab[axis]);
      const halfway = box.weight / 2; let accumulated = 0; let splitAt = 1;
      for (let i = 0; i < box.points.length - 1; i += 1) {
        accumulated += box.points[i].weight;
        if (accumulated >= halfway) { splitAt = i + 1; break; }
      }
      const first = box.points.slice(0, splitAt); const second = box.points.slice(splitAt);
      if (!second.length) break;
      boxes.splice(candidateIndex, 1,
        { points: first, weight: first.reduce((sum, point) => sum + point.weight, 0) },
        { points: second, weight: second.reduce((sum, point) => sum + point.weight, 0) });
    }
    return boxes.map((box) => {
      const weight = box.points.reduce((sum, point) => sum + point.count, 0);
      const rgb = [0, 1, 2].map((channel) => Math.round(box.points.reduce((sum, point) => sum + point.rgb[channel] * point.count, 0) / weight));
      return colorInfo(rgb, weight);
    });
  }

  function hueDistance(first, second) {
    const distance = Math.abs(first - second);
    return Math.min(distance, Math.PI * 2 - distance);
  }

  function uniquePalette(palette, maxColors) {
    const seen = new Set();
    return palette.filter((point) => {
      const key = point.rgb.join(',');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, maxColors);
  }

  function buildPalette(pixels, maxColors) {
    const points = buildHistogram(pixels);
    if (!points.length) return [colorInfo([0, 0, 0])];
    const accentSlots = maxColors >= 4 ? Math.max(1, Math.round(maxColors * .2)) : 0;
    const candidates = points.filter((point) => point.chroma > .035 && point.count >= 2).sort((a, b) => (b.chroma * Math.sqrt(b.count)) - (a.chroma * Math.sqrt(a.count)));
    const accents = [];
    while (accents.length < accentSlots && candidates.length) {
      const next = candidates.shift();
      if (!accents.some((point) => hueDistance(point.hue, next.hue) < .35 && Math.abs(point.lab[0] - next.lab[0]) < .08)) accents.push(next);
    }
    const dominant = medianCut(points, Math.max(1, maxColors - accents.length));
    return uniquePalette([...dominant, ...accents], maxColors);
  }

  function nearestColor(r, g, b, palette) {
    const lab = rgbToOklab(r, g, b);
    let best = 0; let bestDistance = Infinity;
    for (let i = 0; i < palette.length; i += 1) {
      const color = palette[i].lab;
      const dL = lab[0] - color[0]; const da = lab[1] - color[1]; const db = lab[2] - color[2];
      const distance = dL * dL + da * da + db * db;
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    }
    return best;
  }

  function processImageData(input, width, height, config) {
    const started = Date.now();
    const normalizedInput = applyAlphaCutoff(input);
    const resolution = config.resolution;
    const contrastFactor = 1 + config.contrast / 100;
    const maxColors = clamp(config.maxColors || 48, 2, 48);
    const cellCoverageThreshold = clamp(Number(config.cellCoverageThreshold ?? 0.18), 0, 1);
    const paletteBudget = config.borderEnabled ? Math.max(1, maxColors - 1) : maxColors;
    const palette = buildPalette(normalizedInput, paletteBudget);
    const pixelCount = width * height;
    const adjusted = new Uint8ClampedArray(pixelCount * 4);
    const luminance = new Float32Array(pixelCount);
    const alpha = new Uint8Array(pixelCount);

    for (let i = 0; i < pixelCount; i += 1) {
      const sourceIndex = i * 4; const a = normalizedInput[sourceIndex + 3]; alpha[i] = a;
      if (a < 8) continue;
      const base = palette[nearestColor(normalizedInput[sourceIndex], normalizedInput[sourceIndex + 1], normalizedInput[sourceIndex + 2], palette)].rgb;
      const r = clamp(128 + (base[0] - 128) * contrastFactor, 0, 255);
      const g = clamp(128 + (base[1] - 128) * contrastFactor, 0, 255);
      const b = clamp(128 + (base[2] - 128) * contrastFactor, 0, 255);
      adjusted[sourceIndex] = r; adjusted[sourceIndex + 1] = g; adjusted[sourceIndex + 2] = b; adjusted[sourceIndex + 3] = a;
      luminance[i] = r * .299 + g * .587 + b * .114;
    }

    const edgeFactor = config.edgeStrength / 100;
    const mapped = new Uint16Array(pixelCount);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const i = y * width + x; const sourceIndex = i * 4;
      if (alpha[i] < 8) continue;
      let edge = 0;
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const tl = luminance[i - width - 1], tc = luminance[i - width], tr = luminance[i - width + 1];
        const ml = luminance[i - 1], mr = luminance[i + 1]; const bl = luminance[i + width - 1], bc = luminance[i + width], br = luminance[i + width + 1];
        const gx = -tl + tr - 2 * ml + 2 * mr - bl + br; const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
        edge = clamp(Math.hypot(gx, gy) / 720, 0, 1);
      }
      const darken = edge * edgeFactor * .62;
      mapped[i] = nearestColor(adjusted[sourceIndex] * (1 - darken), adjusted[sourceIndex + 1] * (1 - darken), adjusted[sourceIndex + 2] * (1 - darken), palette);
    }

    const output = new Uint8ClampedArray(resolution * resolution * 4);
    const scaleX = width / resolution; const scaleY = height / resolution;
    const counts = new Uint32Array(palette.length); const used = new Set();
    for (let oy = 0; oy < resolution; oy += 1) {
      const y0 = Math.floor(oy * scaleY); const y1 = Math.max(y0 + 1, Math.floor((oy + 1) * scaleY));
      for (let ox = 0; ox < resolution; ox += 1) {
        counts.fill(0);
        const x0 = Math.floor(ox * scaleX); const x1 = Math.max(x0 + 1, Math.floor((ox + 1) * scaleX));
        let alphaSum = 0; let best = 0; let bestCount = 0;
        for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) {
          const sourcePixel = y * width + x;
          const sampleAlpha = alpha[sourcePixel];
          if (sampleAlpha < 8) continue;
          alphaSum += sampleAlpha;
          const colorIndex = mapped[sourcePixel];
          const colorWeight = sampleAlpha >= 128 ? sampleAlpha : (sampleAlpha * sampleAlpha) / 255;
          counts[colorIndex] += colorWeight;
          if (counts[colorIndex] > bestCount) { bestCount = counts[colorIndex]; best = colorIndex; }
        }
        const outputIndex = (oy * resolution + ox) * 4;
        const cellArea = Math.max(1, (y1 - y0) * (x1 - x0));
        const coverage = alphaSum / (cellArea * 255);
        if (!alphaSum || coverage < cellCoverageThreshold) { output[outputIndex + 3] = 0; continue; }
        let runnerUp = -1; let runnerUpCount = 0;
        for (let index = 0; index < counts.length; index += 1) {
          if (index === best) continue;
          if (counts[index] > runnerUpCount) { runnerUpCount = counts[index]; runnerUp = index; }
        }
        if (runnerUp >= 0 && runnerUpCount >= bestCount * .55 && palette[runnerUp].chroma > palette[best].chroma + .025) best = runnerUp;
        const color = palette[best].rgb;
        output[outputIndex] = color[0]; output[outputIndex + 1] = color[1]; output[outputIndex + 2] = color[2]; output[outputIndex + 3] = 255;
        used.add(color.join(','));
      }
    }
    const finalPixels = config.borderEnabled
      ? addAlphaBorder(output, resolution, resolution, config.borderWidth, config.borderColor)
      : output;
    if (config.borderEnabled) {
      used.clear();
      for (let index = 0; index < finalPixels.length; index += 4) {
        if (finalPixels[index + 3] >= 8) used.add(`${finalPixels[index]},${finalPixels[index + 1]},${finalPixels[index + 2]}`);
      }
    }
    return {
      pixels: finalPixels.buffer,
      usedColors: used.size,
      paletteSize: palette.length,
      borderApplied: Boolean(config.borderEnabled),
      elapsedMs: Date.now() - started,
    };
  }

export { processImageData, applySourceEffects, applyAlphaCutoff, removeBackgroundFloodFill, addAlphaBorder };
