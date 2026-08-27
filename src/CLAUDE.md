# Runtime (React + three.js)

See the repo root [`CLAUDE.md`](../CLAUDE.md) for art direction and the asset
contract. This file covers the runtime domain only — how the scene renders and
how it consumes assets. How assets are *authored* lives in
[`assets/blender/CLAUDE.md`](../assets/blender/CLAUDE.md).

## Rendering decisions

**Few lights, colour in materials.** Every light in a three.js scene compiles
into every material's shader regardless of distance — `distance` attenuates a
light's contribution, not its cost. The scene originally had 27 point lights
across six areas and ran fragment-bound. Now: ambient + hemisphere + one
directional key.

**Only the active area is mounted** (`Scene.tsx`), plus the destination during a
camera transition. This is the only way to stop paying for other areas' lights.

**Emissive + bloom.** Things that should read as light sources set
`toneMapped={false}` and push `emissiveIntensity` above 1; `Bloom` uses
`luminanceThreshold={1.0}` so exactly those objects glow and nothing else.
Glows are emissive materials, which are self-lit and cost nothing per pixel.

**Shadows**: `shadows="soft"` (PCFSoftShadowMap). The directional light needs a
widened shadow camera — three.js defaults the frustum to ±5 units and the hall
is 20 across — plus `normalBias` to prevent acne. Keep the light steep; a low
angle threw raking shadows that sliced the floor into hard wedges.

**Light shafts** are emissive glass plus crossed additive quads with
`depthWrite={false}`. Real volumetrics are far too expensive.

## Loading props

`components/canvas/Prop.tsx` owns all `.glb` loading:

- Each prop gets its **own `<Suspense fallback={null}>`**, so a slow asset only
  delays itself. A single boundary higher up would hold back every prop in the
  area until the last one resolved.
- `useGLTF` caches by url and returns the *same* object, so the scene is
  **cloned** before use. Without that, a model can only appear once.
- Take urls from `generated/props.ts`, never as string literals. That file is
  emitted by `npm run models`; editing it by hand is pointless since the next
  build overwrites it.

## Key constraints

**`public/data/viewpoints.json` holds 57 hand-written entities** — 16
viewpoints, 26 hotspots, 15 infoPoints, or 73 xyz objects once each viewpoint's
`position` and `lookAt` are counted. It is a shadow schema of the geometry
with no compile-time link to it. Moving room geometry silently desyncs all of
them: no compile error, no failing test. Treat any change to room dimensions or
layout as a change to that file too.

Adding new objects is safe; moving existing geometry is not.

## Gotchas

- Anything tracking the mouse must use a ref and a direct DOM write, never React
  state. A previous `Cursor.tsx` re-rendered on every `mousemove` and visibly
  lagged the pointer, which read as the whole app being slow.
- When framerate looks wrong, **check the renderer string before profiling**. A
  browser fallen back to software rendering (SwiftShader, llvmpipe) runs this
  scene at ~10fps no matter what. `App.tsx` logs `[gpu] …` in dev for this.
- Speckled surfaces: z-fighting shimmers randomly as the camera moves, shadow
  acne forms stable bands along the light direction. Different fixes.
