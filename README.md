# PixelForge

PixelForge is a local-first `pixelart` editor for turning images and local 3D models into indexed pixel art.

**Try it online:** [maetschl.github.io/PixelForge](https://maetschl.github.io/PixelForge/)

## What it does

- Import an image with drag-and-drop, file selection, or clipboard paste.
- Frame, move, scale, and inspect the source image on a sharp high-resolution canvas.
- Switch between 2D and 3D workflows without losing either mode's state.
- Load local `.glb`, `.gltf`, `.obj`, `.mtl`, and `.fbx` files and orbit/zoom the model.
- Remove connected backgrounds and add an optional configurable border non-destructively.
- Run a perceptual indexed-color pipeline with contrast, Sobel edge emphasis, and majority-color cell sampling.
- Inspect the exact output at 1:1 on white and black backgrounds.
- Export a transparent PNG at the selected square resolution, from `16×16` through `512×512`.
- Use the local MCP server or optional agent skill to automate 2D pixelart generation.

The `Load example` action chooses randomly from three local fixtures: a crystal skull, a harbor village, and a volcano forge. The same fixture is not chosen twice in a row.

Everything is processed locally. The web editor does not upload images, models, or project data. Local files are held in browser memory and local object URLs; the `Source code`, agent-guide, and asset-prompt links are the only intentional navigation outside the app.

## Run locally

The web application is buildless. The optional local MCP adds Node dependencies for image decoding and MCP transport:

```sh
npm install
npm run dev
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173). A static server is required because ES modules, workers, and local model loaders are used.

## Test

```sh
npm test
```

The checks cover the image pipeline, transparency and source treatment, model-mode assets, and the static GitHub Pages package.

## Use PixelForge with an agent

PixelForge includes a local MCP server for automated 2D `pixelart` processing. It accepts local PNG, JPEG, WebP, and SVG paths and writes a transparent PNG locally. It never accepts remote URLs or uploads files.

Start it with:

```sh
npm run mcp
```

Configure a compatible MCP client with the example in [`mcp/pixelforge.example.json`](./mcp/pixelforge.example.json), replacing the repository path with an absolute path. The main tool is `pixelate_image`; its capabilities are also available through `pixelforge://capabilities`.

The optional agent instructions live in [`skills/pixelforge/SKILL.md`](./skills/pixelforge/SKILL.md). Copy that folder into the skill directory used by your agent when you want the agent to discover PixelForge workflows automatically. [`AGENTS.md`](./AGENTS.md) contains repository-level instructions for coding agents.

The MCP v1 processes 2D images independently of the browser UI. The web editor continues to provide the 2D and 3D interactive workflows; 3D MCP rendering is reserved for a later phase.

## Asset generation prompt

This prompt has worked well for generating simple, readable assets that PixelForge can turn into `pixelart` for fantasy maps and games. Replace the bracketed description with the subject you want:

```text
Generate [SUBJECT] as an isolated asset for a fantasy map or game.

BACKGROUND — REQUIRED:
Use a genuinely transparent background with an alpha channel. Everything outside the asset must be fully transparent, including gaps between branches, structures, and other elements. Do not render a white background, a colored background, or a checkerboard pattern. Avoid white fringes, halos, and stray pixels around the edges.

STYLE:
Use a simplified cartoon style with large shapes, clear silhouettes, flat colors, and a balanced palette. Create volume through a few clearly defined, solid shadow areas. No gradients, textures, realistic rendering, bloom, or soft lighting effects.

Keep outlines very thin and subtle. Avoid thick black borders; let adjacent colors define most shapes.

DETAIL:
Retain only the essential features that make the subject recognizable. Remove small decorations, repetitive lines, and unnecessary surface details. The asset must remain clearly readable at a small size.

PERSPECTIVE:
Use a mostly frontal, slightly elevated view, revealing some depth and top surfaces without a pronounced side angle.

COMPOSITION:
Create one compact, self-contained asset, centered with generous transparent margins. Show the entire subject without cropping. Keep coherent proportions and well-constructed shapes.

For locations, group all elements into a single map landmark. Include only a small, organically shaped footprint of solid ground or water when needed. This footprint is part of the asset; everything beyond it must be transparent. Do not create a rectangular tile, pedestal, or floating chunk of terrain.

EDGES:
Use clean, smooth, anti-aliased edges. Keep foreground colors opaque, with partial transparency limited to edge smoothing. No cast shadows outside the asset’s footprint.

EXCLUSIONS:
No background scenery, sky, horizon, frames, square platforms, text, labels, watermarks, or unrelated objects.

REFERENCE:
If a reference image is attached, match its visual style, level of detail, and perspective without copying its subject matter or background.

OUTPUT:
A PNG with genuine background transparency, ready to place directly over a map or game scene.
```

For the best PixelForge result, keep the subject centered, preserve genuine alpha transparency, and avoid small details that disappear during indexed-color sampling.

## Project structure

```text
dist/
  index.html             application shell
  styles.css             dark workbench UI and responsive layout
  app.js                 state, input, canvas interaction, 2D/3D mode, export
  image-pipeline.js      pure pixel-art processing functions
  pipeline-core.mjs      shared ESM pipeline entrypoint
  pipeline-worker.js     background processing worker
  vendor/three/          local Three.js runtime and loaders
  assets/                local original and demo example assets
tests/                   Node regression checks and local model fixture
mcp/                     local MCP server, image adapter, and client config
skills/pixelforge/       optional agent skill and installation guide
AGENTS.md                repository instructions for coding agents
.github/workflows/        GitHub Pages deployment workflow
```

## Deployment

The `main` branch deploys `dist/` through GitHub Actions. The workflow runs the same checks used locally, uploads only the static `dist/` directory, and deploys it with the GitHub Pages Actions source.

## Contributing

Fork the repository, create a focused branch, run `npm test`, and open a pull request with a short description of the behavior or regression being addressed. Please keep the app buildless, local-only, and free of CDN/runtime network dependencies.

## License and third-party code

PixelForge is released under the [MIT License](./LICENSE). Vendored runtime notices are listed in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
