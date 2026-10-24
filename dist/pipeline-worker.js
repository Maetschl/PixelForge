importScripts('./image-pipeline.js');

self.onmessage = (event) => {
  try {
    const { requestId, width, height, pixels, config } = event.data;
    const result = self.PixelForgePipeline.processImageData(new Uint8ClampedArray(pixels), width, height, config);
    self.postMessage({ type: 'result', requestId, ...result }, [result.pixels]);
  } catch (error) {
    self.postMessage({ type: 'error', message: error?.message || 'Pipeline error' });
  }
};
