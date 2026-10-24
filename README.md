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
Generate [DESCRIPTION OF THE OBJECT, CHARACTER, OR LOCATION] as an asset for a fantasy map or game.

Use a simplified cartoon style with large shapes, clear silhouettes, flat colors, and a balanced palette. Create volume through a few clearly defined shadow areas, without gradients, textures, or realistic rendering. Keep outlines very thin and subtle; avoid thick black borders and let adjacent colors define most shapes.

Keep the detail level low: retain the essential features that make the subject recognizable, while removing small decorations, repetitive lines, and surface details. It should remain clearly readable at a small size.

Use a mostly frontal, slightly elevated view, with enough perspective to reveal depth and top surfaces, without a pronounced side angle.

Keep the composition compact and self-contained, centered on a pure white background with generous margins. Show the entire subject without cropping. For locations, group the elements into a single map landmark and restrict any ground or water to a small, organically shaped footprint.

No background scenery, horizon, frames, square platforms, text, or labels. Maintain coherent proportions and well-constructed shapes.

If a reference image is attached, use it to match the visual style, level of detail, and perspective without copying its subject matter.
```

For the best PixelForge result, keep the subject centered, use a pure background, and avoid small details that disappear during indexed-color sampling.

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
