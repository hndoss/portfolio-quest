import { CanvasTexture, NoColorSpace, RepeatWrapping, SRGBColorSpace, Texture } from 'three'

/**
 * Procedurally generated surface textures.
 *
 * The scene had no textures at all, which is most of why it read as moulded
 * plastic: a 20m wall painted one flat RGB has no information in it, so the
 * only shading variation is the lighting term. Arcane's look is roughly 80%
 * painted surface and 20% geometry — adding polygons does not move toward it,
 * breaking up the surface does.
 *
 * These are canvas-generated fractal noise rather than image files: no assets
 * to author or ship, and the scale can be tuned per-surface from code. They
 * are a stand-in for hand-painted maps, not a replacement.
 */

const TEX_SIZE = 512

/** Hash-based value noise. Deterministic, so surfaces never reshuffle. */
function hash2(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 2246822519
  h = (h ^ (h >>> 13)) >>> 0
  h = Math.imul(h, 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * Smoothstep-interpolated value noise, tiling on `periodX` x `periodY`.
 *
 * The two periods have to be independent. A stretched surface samples x at a
 * different lattice frequency from y, and wrapping both on the y period leaves
 * the x edge unmatched — which showed up as a vertical seam down every tile of
 * the wood grain.
 */
function valueNoise(
  x: number,
  y: number,
  periodX: number,
  periodY: number,
  seed: number
): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  // Wrapping the lattice coordinates is what makes the tile seamless; without
  // it the repeat seams show as hard lines across every wall.
  const wrap = (v: number, p: number) => ((v % p) + p) % p
  const ax = wrap(x0, periodX)
  const ay = wrap(y0, periodY)
  const bx = wrap(x0 + 1, periodX)
  const by = wrap(y0 + 1, periodY)

  const n00 = hash2(ax, ay, seed)
  const n10 = hash2(bx, ay, seed)
  const n01 = hash2(ax, by, seed)
  const n11 = hash2(bx, by, seed)

  return (
    n00 * (1 - sx) * (1 - sy) +
    n10 * sx * (1 - sy) +
    n01 * (1 - sx) * sy +
    n11 * sx * sy
  )
}

type FbmOptions = {
  octaves: number
  /** Lattice cells across the tile at the first octave. */
  baseFreq: number
  seed: number
  /**
   * Anisotropy. >1 stretches the pattern horizontally (wood grain), <1
   * compresses it into vertical streaks (woven cloth).
   */
  stretchX?: number
}

function fbm(u: number, v: number, o: FbmOptions): number {
  let sum = 0
  let amp = 1
  let norm = 0
  let freq = o.baseFreq
  const sx = o.stretchX ?? 1

  for (let i = 0; i < o.octaves; i++) {
    const fx = Math.max(1, Math.round(freq / sx))
    sum += amp * valueNoise(u * fx, v * freq, fx, freq, o.seed + i * 101)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return sum / norm
}

type SurfaceSpec = {
  seed: number
  octaves: number
  baseFreq: number
  stretchX?: number
  /** How far the albedo is allowed to darken. 0 = flat, 1 = to black. */
  contrast: number
  /** Roughness range written into the roughness map. */
  roughness: [number, number]
  /** Extra low-frequency blotching, read as grime settling unevenly. */
  grime?: number
}

/**
 * Renders one tile into two canvases: an albedo multiplier and a roughness
 * map. They must be separate textures because three.js needs the albedo
 * tagged sRGB and the roughness map left linear — a single Texture object
 * cannot be both.
 */
function renderSurface(spec: SurfaceSpec): { albedo: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const albedo = document.createElement('canvas')
  const rough = document.createElement('canvas')
  albedo.width = albedo.height = TEX_SIZE
  rough.width = rough.height = TEX_SIZE

  const aCtx = albedo.getContext('2d')!
  const rCtx = rough.getContext('2d')!
  const aImg = aCtx.createImageData(TEX_SIZE, TEX_SIZE)
  const rImg = rCtx.createImageData(TEX_SIZE, TEX_SIZE)

  const [rLo, rHi] = spec.roughness

  for (let y = 0; y < TEX_SIZE; y++) {
    for (let x = 0; x < TEX_SIZE; x++) {
      const u = x / TEX_SIZE
      const v = y / TEX_SIZE
      const n = fbm(u, v, spec)

      let blotch = 0
      if (spec.grime) {
        blotch = spec.grime * (1 - fbm(u, v, { octaves: 2, baseFreq: 3, seed: spec.seed + 777 }))
      }

      // Centred just under white so the map mostly darkens: `map` multiplies
      // the material colour, so a mid-grey tile would halve every hue that
      // was tuned against the untextured look.
      const shade = Math.max(0, Math.min(1, 1 - spec.contrast * (1 - n) - blotch))
      const roughVal = rLo + (rHi - rLo) * n

      const i = (y * TEX_SIZE + x) * 4
      const c = Math.round(shade * 255)
      aImg.data[i] = c
      aImg.data[i + 1] = c
      aImg.data[i + 2] = c
      aImg.data[i + 3] = 255

      const r = Math.round(roughVal * 255)
      rImg.data[i] = r
      rImg.data[i + 1] = r
      rImg.data[i + 2] = r
      rImg.data[i + 3] = 255
    }
  }

  aCtx.putImageData(aImg, 0, 0)
  rCtx.putImageData(rImg, 0, 0)
  return { albedo, rough }
}

// Contrast is kept low on purpose. The map multiplies the base colour, so
// heavy darkening does not read as "textured" — it reads as dirty, and it
// drags a tuned warm palette toward mud. Surface interest wants variation,
// not depth.
const SURFACES = {
  stone: { seed: 11, octaves: 5, baseFreq: 4, contrast: 0.22, roughness: [0.62, 0.98], grime: 0.07 },
  wood: { seed: 27, octaves: 5, baseFreq: 6, stretchX: 7, contrast: 0.34, roughness: [0.55, 0.9], grime: 0.06 },
  metal: { seed: 43, octaves: 4, baseFreq: 8, contrast: 0.18, roughness: [0.18, 0.55], grime: 0.04 },
  // Woven cloth: the runner and the tapestries. `stretchX` below 1 compresses
  // the lattice in x, which is what turns fbm blotches into the fine parallel
  // streaks a warp reads as. Higher contrast than stone because a rug is
  // *supposed* to look like it has a nap.
  fabric: { seed: 61, octaves: 4, baseFreq: 12, stretchX: 0.45, contrast: 0.3, roughness: [0.82, 1.0], grime: 0.05 },
} satisfies Record<string, SurfaceSpec>

export type SurfaceKind = keyof typeof SURFACES

type Prototype = { albedo: Texture; rough: Texture }

/**
 * Built once per kind, on first use. Generating a 512x512 five-octave tile is
 * ~40ms of main-thread work, so it must not happen during render or on every
 * material.
 */
const prototypes = new Map<SurfaceKind, Prototype>()

function prototypeFor(kind: SurfaceKind): Prototype {
  const cached = prototypes.get(kind)
  if (cached) return cached

  const { albedo, rough } = renderSurface(SURFACES[kind])

  const albedoTex = new CanvasTexture(albedo)
  albedoTex.colorSpace = SRGBColorSpace
  albedoTex.wrapS = albedoTex.wrapT = RepeatWrapping

  const roughTex = new CanvasTexture(rough)
  roughTex.wrapS = roughTex.wrapT = RepeatWrapping

  const made = { albedo: albedoTex, rough: roughTex }
  prototypes.set(kind, made)
  return made
}

/* --- drawn ornament ---------------------------------------------------- */

const ornaments = new Map<string, Texture>()

/**
 * Turns an SVG string from `ornament.ts` into a texture.
 *
 * Via a data URI and an `Image` rather than a canvas the way the noise above
 * works, for one reason: the SVG is the *same string* that `rsvg-convert`
 * rasterises offline, so what gets reviewed before shipping is byte-identical
 * to what the GPU receives. A canvas re-implementation would be a second
 * drawing that only resembles the first.
 *
 * Decoding is asynchronous, so the texture is handed back immediately and
 * marked dirty on load — the same contract `TextureLoader` uses. A frame or
 * two of untextured material on first paint is invisible next to the .glb
 * loads already in flight.
 *
 * `srgb` must be false for emissive and roughness maps: only colour is stored
 * gamma-encoded, and tagging a leading map as sRGB washes the lead grey.
 */
export function ornamentMap(
  svg: string,
  repeatX = 1,
  repeatY = 1,
  srgb = true
): Texture {
  const key = `${repeatX}:${repeatY}:${srgb}:${svg}`
  const cached = ornaments.get(key)
  if (cached) return cached

  const image = new Image()
  const texture = new Texture(image)
  texture.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  // Ornament is line-work; anisotropy is what keeps a 1px gold rule from
  // dissolving into shimmer when the wall is seen at a raking angle.
  texture.anisotropy = 8
  image.onload = () => {
    texture.needsUpdate = true
  }
  image.src = `data:image/svg+xml;base64,${btoa(svg)}`

  ornaments.set(key, texture)
  return texture
}

/** Texels per world metre. One value everywhere keeps grain consistent. */
const DENSITY = 0.55

const variants = new Map<string, { map: Texture; roughnessMap: Texture }>()

/**
 * Maps for a surface of the given world size.
 *
 * Every box in three.js gets 0..1 UVs per face regardless of how big it is, so
 * a shared material would put the same number of tiles on a 20m wall as on a
 * 0.68m pilaster. Deriving `repeat` from the object's real dimensions is what
 * keeps the grain the same physical size across the room — inconsistent texel
 * density reads as wrong even when nobody can say why.
 *
 * Clones share the underlying image, so all variants of a kind cost one GPU
 * upload no matter how many repeats are in play.
 */
export function surfaceMaps(kind: SurfaceKind, widthM: number, heightM: number) {
  const rx = Math.max(1, Math.round(widthM * DENSITY))
  const ry = Math.max(1, Math.round(heightM * DENSITY))
  const key = `${kind}:${rx}:${ry}`

  const cached = variants.get(key)
  if (cached) return cached

  const proto = prototypeFor(kind)
  const map = proto.albedo.clone()
  map.repeat.set(rx, ry)
  map.needsUpdate = true

  const roughnessMap = proto.rough.clone()
  roughnessMap.repeat.set(rx, ry)
  roughnessMap.needsUpdate = true

  const made = { map, roughnessMap }
  variants.set(key, made)
  return made
}
