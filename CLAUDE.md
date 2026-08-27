# portfolio-quest

See `/mnt/shared/development/CLAUDE.md` for global development guidelines.

3D portfolio game: React 19 + @react-three/fiber + three.js. Six areas explored
from fixed camera viewpoints.

## Domains

Two domains with one contract between them. Each has its own instructions,
loaded when you touch that subtree:

| Domain | Path | Instructions |
|---|---|---|
| Asset authoring | `assets/blender/` | [`assets/blender/CLAUDE.md`](assets/blender/CLAUDE.md) |
| Runtime | `src/` | [`src/CLAUDE.md`](src/CLAUDE.md) |

They meet at `public/models/props/*.glb` plus the generated manifest
`src/generated/props.ts`. This file holds what both sides must agree on; put
domain-specific knowledge in the domain file, not here.

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

## The asset contract

Binding on both sides. Breaking any of these desyncs the two domains silently.

- **1 Blender unit = 1 m = 1 three.js unit.**
- **Every asset is grounded to Blender `z = 0`** (three.js `y = 0`), so React
  places it at a surface height with no per-model offset constant.
- **Assets export at the origin, unrotated.** Placement is the runtime's job.
- Export is glTF 2.0 binary, **+Y up**, modifiers applied.
- Axis conversion is Blender `(x, y, z)` → three.js `(x, z, -y)`.
- **Base colours are LINEAR, not sRGB.** glTF stores linear, so what is in
  `PALETTE` is exactly what three.js receives. Convert an sRGB channel `s` with
  `((s + 0.055) / 1.055) ** 2.4`. Pasting hex straight in yields washed pastels.
- **Slugs live in `src/generated/props.ts`**, emitted by `npm run models`.
  Never hand-write a `.glb` path; import from the manifest so a rename fails
  the build instead of 404ing at runtime.
- The `.glb` files are **build artifacts**. Never hand-edit them; regenerate.

## Runtime facts that constrain authoring

Discovered at runtime, but they decide how a model must be built.

**The hall runs on two punctual lights** — the chandelier at `[0, 4.45, -1.2]`
and the hearth at `[0, 0.8, -4.6]`. Everything else that glows is emissive.
Nothing lights the corners, so a prop far from both is carried by ambient plus
hemisphere alone and needs value contrast built into its own materials. This is
why hall furniture uses `oak` against `wood` rather than one wood tone.

**There is no environment map.** A flat horizontal surface at `metalness: 1.0`
has nothing to reflect and renders black — the side table's first brass inlay
did exactly this. Put brass on vertical faces, or on edges standing proud,
where the key light can catch it.

**Framing.** The hall camera is fixed at `(0, 1.6, 5.2)` with `fov: 75`.
Visible half-width at depth `z` is `(5.2 - z) * 1.3643`: 14.9 m at the north
wall, but only 3.8 m at `z = 2.4`. A prop at `|x| > 4` must sit north of about
`z 1.5` or it is not on screen at all.

## Build

```bash
npm run models     # rebuild every .glb + the manifest + preview renders
npm run dev
npm run build      # tsc -b && vite build
npm run test:run
```
