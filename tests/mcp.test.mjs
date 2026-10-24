import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const serverPath = path.join(root, 'mcp/server.mjs');
const samplePath = path.join(root, 'dist/assets/pixel-forge-sample.svg');
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelforge-mcp-'));
const outputPath = path.join(tempDir, 'sample-pixelart.png');
const client = new Client({ name: 'pixelforge-test-client', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });

try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(tools.tools.some((tool) => tool.name === 'pixelate_image'), 'pixelate_image tool should be registered');

  const resources = await client.listResources();
  assert.ok(resources.resources.some((resource) => resource.uri === 'pixelforge://capabilities'), 'capabilities resource should be registered');
  const capabilities = await client.readResource({ uri: 'pixelforge://capabilities' });
  assert.match(capabilities.contents[0].text, /pixelart/);

  const result = await client.callTool({
    name: 'pixelate_image',
    arguments: {
      sourcePath: samplePath,
      outputPath,
      resolution: 128,
      maxColors: 24,
      removeBackground: true,
      borderEnabled: true,
      borderWidth: 1,
      borderColor: '#131313',
    },
  });
  assert.equal(result.isError, undefined);
  assert.equal(result.structuredContent.width, 128);
  assert.equal(result.structuredContent.height, 128);
  assert.ok(result.structuredContent.usedColors <= 24);
  assert.ok(result.structuredContent.transparentPixels > 0);
  const metadata = await sharp(outputPath).metadata();
  assert.equal(metadata.width, 128);
  assert.equal(metadata.height, 128);

  const overwrite = await client.callTool({ name: 'pixelate_image', arguments: { sourcePath: samplePath, outputPath } });
  assert.equal(overwrite.isError, true, 'existing output should not be overwritten by default');

  const invalid = await client.callTool({ name: 'pixelate_image', arguments: { sourcePath: samplePath, resolution: 8 } });
  assert.equal(invalid.isError, true, 'invalid resolution should be rejected');

  const missing = await client.callTool({ name: 'pixelate_image', arguments: { sourcePath: path.join(tempDir, 'missing.png') } });
  assert.equal(missing.isError, true, 'missing source should be rejected');

  const remote = await client.callTool({ name: 'pixelate_image', arguments: { sourcePath: 'https://example.com/image.png' } });
  assert.equal(remote.isError, true, 'remote URLs should be rejected');

  console.log('MCP tests passed');
} finally {
  await client.close().catch(() => {});
  await fs.rm(tempDir, { recursive: true, force: true });
}
