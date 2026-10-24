# PixelForge agent skill

This optional skill teaches an agent how to use the local PixelForge MCP for 2D `pixelart` processing.

## Install

Copy the `skills/pixelforge/` directory into the skills directory supported by your agent. Keep the `SKILL.md` filename unchanged.

Configure the MCP server using [`mcp/pixelforge.example.json`](../../mcp/pixelforge.example.json), replacing its placeholder path with the absolute path to this repository.

The server is local-only and communicates over stdio. It does not provide 3D MCP rendering in the first version.
