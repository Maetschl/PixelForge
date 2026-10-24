# PixelForge agent instructions

PixelForge is a local-first, local-only `pixelart` editor and MCP server. Keep image and model processing local: do not add uploads, remote image URLs, CDNs, or backend services.

## Commands

- `npm install` installs web and local MCP dependencies.
- `npm run dev` serves the static web app from `dist/` at port 4173.
- `npm run mcp` starts the MCP server over stdio.
- `npm test` runs web, pipeline, model-mode, site, and MCP tests.

## Architecture

- `dist/` is the buildless published web app.
- `dist/pipeline-core.mjs` is the shared 2D pipeline entrypoint.
- `dist/app.js` owns browser state, canvas interaction, Three.js, and export.
- `dist/pipeline-worker.js` runs the browser pipeline off the main thread.
- `mcp/` contains the local 2D MCP server and image adapter.
- `skills/pixelforge/` contains an optional reusable agent skill.

## MCP contract

Use the `pixelate_image` tool for local PNG, JPEG, WebP, and SVG files. It writes a transparent PNG and returns its path, dimensions, color counts, elapsed time, and transparent-pixel count. Defaults are 128×128, 48 colors, 0 contrast, 0 edge strength, no background removal, and no border.

The MCP v1 is 2D-only and does not control the open browser session. The web app still supports interactive 2D and 3D editing.

## Change discipline

- Preserve the strict 2–48 color limit and exact output dimensions.
- Preserve transparency and non-destructive source effects.
- Do not overwrite user files by default.
- Update tests and documentation when changing the MCP schema or pipeline behavior.
