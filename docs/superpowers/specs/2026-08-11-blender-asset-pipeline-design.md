# Blender Asset Pipeline — Design

**Date:** 2026-08-11
**Status:** Approved design, pending implementation plan
**Scope:** Tooling setup only. Authoring actual assets is out of scope and will be specced separately.

## Context

`portfolio-quest` renders six areas — CentralHall, Library, Forge, Pipelines, Treasury, Observatory — as
**2,276 lines of hand-written R3F primitives** (`boxGeometry`, `planeGeometry`, `pointLight`). There are no
imported models and no `public/models/` directory.

Four measurements shaped this design:

| Fact | Value | Source |
|---|---|---|
| Area JSX | 2,276 lines / 6 files | `src/components/canvas/areas/` |
| JS bundle | 1.14 MB (~300 KB gzipped, mostly three.js) | `dist/assets/index-DTj2g3d3.js` |
| Area mounting | All six mount unconditionally; no lazy loading | `src/components/canvas/Scene.tsx:52-57` |
| Hard-coded world coordinates | **81** (20 viewpoints + 38 hotspots + 23 infoPoints) | `public/data/viewpoints.json` |

The 81 coordinates are the binding constraint. `viewpoints.json` encodes camera positions, hotspot placements,
and infoPoint anchors in absolute world space, chosen against the geometry that exists today. It is a
**shadow schema of the geometry** with no link back to constants like `Forge.tsx`'s `ROOM_WIDTH = 14`.
Changing room geometry desyncs those coordinates with no compile error and no failing test.

## Decisions

### D1 — Blender authors props, not rooms

Rooms, walls, floors, and lighting stay as parametric R3F code. Blender produces discrete "hero" objects
(anvil, bookshelf, chest, telescope) exported as `.glb`.

**Rationale:** prop swaps touch none of the 81 coordinates. Modelling whole rooms would invalidate all of
them, require re-placing every camera and hotspot by hand, discard 2,276 working lines, and force a choice
between baked lighting and the existing dynamic lights (`Forge.tsx` runs three `pointLight`s at intensity
20/10/8). Props simply receive the lights already in the scene.

**Rejected:** whole-area `.glb` per room (coordinate churn, requires building lazy area mounting first);
glTF→TSX codegen (an exporter to maintain, loses materials and UVs, solves a problem that only exists for props).

**Escape hatch:** each area is already its own component, so a single area can be upgraded to a full-room
model later without touching the other five. A future *kit-bash* approach — Blender exports modular wall
segments and columns that JSX instances parametrically — is the natural long-term shape but is deliberately
deferred until the art style is known.

### D2 — Live MCP via blender-mcp

Claude drives a running Blender GUI through `blender-mcp`, so modelling is collaborative and observable
rather than blind script execution.

**Rejected:** headless `blender --background --python` scripts (reproducible, but no viewport feedback and
hand-tweaks make committed scripts go stale); running both paths (two things to keep in sync).

### D3 — Per-prop pop-in loading

Each prop is wrapped in its own `<Suspense fallback={null}>`. Rooms render immediately as they do today;
props appear as they resolve.

**Rationale:** `App.tsx` currently has no Suspense boundary at all, and `useGLTF` suspends — so the first
`.glb` would throw without one. A single boundary around `<Scene />` would gate first paint on *every* prop
in the game, because all six areas mount at once. Per-prop boundaries keep `gameStore.isLoading` and
`LoadingScreen` untouched, and prevent one slow asset from blocking the scene.

**Revisit trigger:** if pop-in looks bad with real assets on screen, introduce a loading gate then.

## Environment (verified 2026-08-11)

| Component | State |
|---|---|
| Blender | 5.2.0 LTS installed at `/usr/sbin/blender`, build 2026-08-08 |
| Blender Python | 3.14.6 — **system** Python, not a bundled interpreter (Arch links `python`) |
| Legacy `bl_info` addons | **Supported.** Probe confirmed `addon_install` + `addon_enable` + `register()` all succeed on 5.2. No `blender_manifest.toml` wrapper needed. |
| Addon directory | `~/.config/blender/5.2/scripts/addons` |
| `uv` | Not installed. Available as `extra/uv` 0.12.1 |
| `blender-mcp` | 1.8.0, released 2026-08-03, `requires_python >=3.10` |

Note: the MCP **server** runs under a `uv`-provisioned interpreter; the **addon** runs inside Blender's
Python 3.14.6. They are separate runtimes communicating over a TCP socket.

## Repository layout

```
assets/blender/              # source of truth, git-tracked
  _reference.blend           # 1.8 m human proxy + 14 x 5 x 16 room volume
  props/<name>.blend
public/models/               # exported runtime assets, git-tracked
  <name>.glb
.mcp.json                    # project-scoped MCP server config, committed
```

`.blend` files are committed — they are the source, and losing them means re-modelling. Simple props run
1–3 MB, acceptable for plain git. **Threshold:** if any single file exceeds 10 MB, evaluate git-lfs. Not now.

## Conventions

- **Units:** Blender metric, 1 unit = 1 m = 1 three.js unit.
- **Orientation:** export glTF 2.0 Binary (`.glb`) with **+Y Up**; the exporter converts Blender's Z-up.
- **Transforms:** applied before export, so exported scale is `1,1,1`.
- **Compression:** none initially. Draco and meshopt require configuring a decoder on the loader and buy
  nothing at 20–60 KB per prop. Introduce only when total asset size justifies it.
- **Scale discipline:** every prop is modelled against `_reference.blend` so it cannot drift from room scale.

## Tooling setup

1. Install `uv` from the Arch repo (`extra/uv`), not the curl installer — keeps it under pacman.
2. Install the blender-mcp addon into `~/.config/blender/5.2/scripts/addons` and enable it.
3. Write project-scoped `.mcp.json`, **pinned to an exact version**:

```json
{
  "mcpServers": {
    "blender": { "command": "uvx", "args": ["blender-mcp@1.8.0"] }
  }
}
```

Pinning is deliberate: unpinned `uvx blender-mcp` re-resolves to latest on every launch, which is a silent
breakage vector given the project's history of Blender 5.x issues.

## R3F loading seam

A single small component — `src/components/canvas/Prop.tsx` — owns `.glb` loading, so areas do not each
reinvent it:

- Wraps `useGLTF` in `<Suspense fallback={null}>`.
- Accepts position/rotation/scale props, matching how `Forge.tsx` already parameterises `<Wall>`.
- Exposes `useGLTF.preload` for props known to be needed.

Areas change only by adding prop elements alongside existing JSX. `Scene.tsx`, `App.tsx`, `gameStore`, and
`LoadingScreen` are unmodified.

## Out of scope

Authoring any specific asset; lazy area mounting; asset compression; kit-bash modular geometry;
changes to `viewpoints.json`; whole-area models.

## Risks

| Risk | Status | Mitigation |
|---|---|---|
| blender-mcp incompatible with Blender 5.2 / Python 3.14 | **Open** — untestable until installed. Upstream has closed 5.0/5.1/5.2 issues (timeouts, truncated JSON), so 5.x is exercised but not friction-free. | Verify with a trivial scene query immediately after install. Fallback: headless scripts, which need no addon. |
| Legacy addon format removed in Blender 5.x | **Closed** — probe confirmed supported. | — |
| Props drift from room scale | Open | `_reference.blend` with human proxy and room volume. |
| Unpinned MCP server auto-updates into a break | Closed by design | Exact version pin in `.mcp.json`. |

## Acceptance criteria

1. `uv --version` succeeds.
2. blender-mcp addon appears enabled in Blender preferences and its socket server starts.
3. Claude can query the Blender scene through the MCP server and receive a valid response.
4. `.mcp.json` exists, is committed, and pins an exact `blender-mcp` version.
5. `assets/blender/_reference.blend` exists with the human proxy and room volume.
6. A placeholder `.glb` loads in **Forge** (the pilot area) via `Prop.tsx`, with the room still rendering
   immediately and `LoadingScreen` behaviour unchanged.
7. `npm run build` and `npm run test:run` still pass.
