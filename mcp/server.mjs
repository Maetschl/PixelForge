import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { CAPABILITIES, pixelateImage } from './image-io.mjs';

const outputSchema = z.object({
  outputPath: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  usedColors: z.number().int(),
  maxColors: z.number().int(),
  transparentPixels: z.number().int(),
  elapsedMs: z.number().int(),
});

export function createPixelForgeServer() {
  const server = new McpServer({ name: 'pixelforge', version: '1.0.0' });
  server.registerTool('pixelate_image', {
    title: 'Create pixelart from a local image',
    description: 'Process a local PNG, JPEG, WebP, or SVG through the PixelForge 2D pixelart pipeline and write a transparent PNG locally.',
    inputSchema: {
      sourcePath: z.string().describe('Absolute or relative local image path.'),
      outputPath: z.string().optional().describe('Optional local PNG output path.'),
      resolution: z.number().int().min(16).max(512).optional().describe('Square output resolution, default 128.'),
      maxColors: z.number().int().min(2).max(48).optional().describe('Maximum indexed colors, default 48.'),
      contrast: z.number().min(0).max(100).optional(),
      edgeStrength: z.number().min(0).max(100).optional(),
      removeBackground: z.boolean().optional(),
      backgroundTolerance: z.number().min(0.01).max(0.5).optional(),
      borderEnabled: z.boolean().optional(),
      borderWidth: z.number().int().min(1).max(8).optional(),
      borderColor: z.string().optional(),
      scale: z.number().min(0.1).max(8).optional(),
      offsetX: z.number().optional(),
      offsetY: z.number().optional(),
      overwrite: z.boolean().optional(),
    },
    outputSchema,
  }, async (args) => {
    try {
      const result = await pixelateImage(args);
      return {
        structuredContent: result,
        content: [{ type: 'text', text: `Created ${result.width}×${result.height} pixelart at ${result.outputPath} using ${result.usedColors}/${result.maxColors} colors.` }],
      };
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }] };
    }
  });
  server.registerResource('capabilities', 'pixelforge://capabilities', {
    title: 'PixelForge MCP capabilities',
    description: 'Supported local pixelart formats and pipeline behavior.',
    mimeType: 'text/markdown',
  }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: CAPABILITIES }] }));
  return server;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const server = createPixelForgeServer();
  await server.connect(new StdioServerTransport());
}
