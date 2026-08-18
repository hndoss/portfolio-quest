# portfolio-quest

See `/mnt/shared/development/CLAUDE.md` for global development guidelines.

3D portfolio game: React 19 + @react-three/fiber + three.js. Six areas explored
from fixed camera viewpoints.

## Art direction

**Target: League of Legends / Arcane (Fortiche).** Stylised painterly fantasy —
rich, ornate, warm. *Not* flat cartoon, not toon-shaded, not photoreal.

Arcane's look is roughly **80% painted texture, 20% geometry**. Adding polygons
does not move toward it; painted surface detail does. Current state has the
lighting, palette and post-processing layer done, and no textures at all — that
is the single biggest remaining gap.

Palette is Piltover: warm brass and honey against deep teal shadow, strongly
split warm/cool. No greys — the scene was originally monochrome grey and that
was the main reason it read as drab.

## Rendering decisions

**Few lights, colour in materials.** Every light in a three.js scene compiles
into every material's shader regardless of distance — `distance` attenuates a
light's contribution, not its cost. The scene originally had 27 point lights
across six areas and ran fragment-bound. Now: ambient + hemisphere + one
directional key. Glows are **emissive materials**, which are self-lit and cost
nothing per pixel.

**Only the active area is mounted** (`Scene.tsx`), plus the destination during a
camera transition. This is the only way to stop paying for other areas' lights.

**Emissive + bloom.** Things that should read as light sources set
`toneMapped={false}` and push `emissiveIntensity` above 1; `Bloom` uses
`luminanceThreshold={1.0}` so exactly those objects glow and nothing else.

**Shadows**: `shadows="soft"` (PCFSoftShadowMap). The directional light needs a
widened shadow camera — three.js defaults the frustum to ±5 units and the hall
is 20 across — plus `normalBias` to prevent acne. Keep the light steep; a low
angle threw raking shadows that sliced the floor into hard wedges.

**Light shafts** are emissive glass plus crossed additive quads with
`depthWrite={false}`. Real volumetrics are far too expensive.

## Key constraints

**`public/data/viewpoints.json` holds 81 hand-written world coordinates** — 20
viewpoints, 38 hotspots, 23 infoPoints. It is a shadow schema of the geometry
with no compile-time link to it. Moving room geometry silently desyncs all of
them: no compile error, no failing test. Treat any change to room dimensions or
layout as a change to that file too.

Adding new objects is safe; moving existing geometry is not.

## Models

`npm run models` rebuilds every `.glb` from Blender source. See
`assets/blender/CLAUDE.md` for the pipeline, conventions, and the gotchas that
have already cost round trips.

`src/components/canvas/Prop.tsx` owns all `.glb` loading — per-prop Suspense,
scene cloning, hover/click animation.

## Gotchas

- Anything tracking the mouse must use a ref and a direct DOM write, never React
  state. A previous `Cursor.tsx` re-rendered on every `mousemove` and visibly
  lagged the pointer, which read as the whole app being slow.
- When framerate looks wrong, **check the renderer string before profiling**. A
  browser fallen back to software rendering (SwiftShader, llvmpipe) runs this
  scene at ~10fps no matter what. `App.tsx` logs `[gpu] …` in dev for this.
- Speckled surfaces: z-fighting shimmers randomly as the camera moves, shadow
  acne forms stable bands along the light direction. Different fixes.
