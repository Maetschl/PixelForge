import * as pipeline from './pipeline-core.mjs';

self.onmessage = (event) => {
  try {
    const { requestId, width, height, pixels, config } = event.data;
    const result = config?.mode === 'pp'
      ? pipeline.processPerfectPixel(new Uint8ClampedArray(pixels), width, height, config)
      : pipeline.processImageData(new Uint8ClampedArray(pixels), width, height, config);
    self.postMessage({ type: 'result', requestId, ...result }, [result.pixels]);
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || 'Pipeline error' });
  }
};
