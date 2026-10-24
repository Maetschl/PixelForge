---
name: pixelforge
description: Use PixelForge's local MCP to create transparent pixelart PNGs from local images, tune colors, remove backgrounds, add borders, and export exact square resolutions.
---

# PixelForge pixelart skill

Use this skill when the user asks to create, convert, reduce, or export `pixelart` from a local image.

## Workflow

1. Confirm the source is a local PNG, JPEG, WebP, or SVG path.
2. Choose an output path without overwriting an existing file unless the user explicitly requests replacement.
3. Call the MCP tool `pixelate_image` with only the required adjustments.
4. Use these defaults unless the user specifies otherwise:
   - resolution: `128`
   - maxColors: `48`
   - contrast: `0`
   - edgeStrength: `0`
   - removeBackground: `false`
   - borderEnabled: `false`
   - borderColor: `#131313`
   - borderWidth: `2`
5. Report the output path, dimensions, used colors versus the configured limit, and transparency information.

## Safety and scope

- Never pass a remote URL or upload the user's file.
- Treat paths as local and validate that the expected source exists.
- Keep the original source unchanged.
- The MCP currently supports 2D processing only. Use the PixelForge web editor for interactive 3D model workflows.
- Preserve the exact requested resolution and the strict maximum color limit.
