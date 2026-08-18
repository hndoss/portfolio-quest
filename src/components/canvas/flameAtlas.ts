import { CanvasTexture, LinearFilter, SRGBColorSpace, type Texture } from 'three'

/**
 * A hand-drawn-style flame flipbook, generated at runtime.
 *
 * This is the third attempt at the brazier fire. The first two generated the
 * flame per-pixel from noise, and both read as CG: noise gives you *texture*,
 * and fire is *shape*. Fortiche draw every flame in Arcane as 2D artwork on
 * twos, so the way to look like that is to draw shapes, not to filter noise.
 *
 * So each frame here is composed the way a 2D FX artist blocks one in: a
 * silhouette built from a teardrop profile with a travelling wave running up
 * it, filled with a few flat colour bands as nested insets, plus detached
 * licks rising off the tip. No gradients, no per-pixel noise, hard edges
 * throughout — the canvas antialiaser supplies the only softness.
 *
 * Drawn rather than shipped as a PNG: no binary asset in the repo, no
 * licensing question, and the palette stays tunable from code.
 */

export const FLAME_COLS = 6
export const FLAME_ROWS = 4
export const FLAME_FRAMES = FLAME_COLS * FLAME_ROWS

/** Pixels per frame. 24 frames at 12fps is a two-second loop. */
const CELL = 160
const TAU = Math.PI * 2

const MARGIN_SIDE = 8
const MARGIN_TOP = 10
const MARGIN_BOTTOM = 6

/**
 * Colour bands, outermost first. Each is a smaller copy of the same
 * silhouette, so they nest into flat concentric steps rather than a gradient.
 */
const BANDS = [
  { w: 1.0, h: 1.0, color: '#c3300a' },
  { w: 0.72, h: 0.88, color: '#ef6a12' },
  { w: 0.46, h: 0.7, color: '#ffa326' },
  { w: 0.22, h: 0.46, color: '#fff3d0' },
]

/**
 * Widest the flame is allowed to get, as a fraction of the half-cell. A flame
 * is a tall thing: at 0.62 the silhouette is roughly 1:2.3 against its height,
 * and the remaining margin is what the sway needs to swing into.
 */
const SPREAD = 0.62

/**
 * Unswayed profile, peaking at 1.
 *
 * Moderately wide where it leaves the coals, bulging just above that, then a
 * long taper to a point. The first attempt used `u^0.35 * (1-u)^0.7`, which is
 * only near-zero *extremely* close to u = 0 — at 5% height it was already at
 * 69% of full width, so the flame came out as a broad wedge.
 */
function shape(u: number): number {
  return (Math.pow(1 - u, 1.55) * (0.42 + Math.min(1, u / 0.28))) / 0.85
}

/**
 * Fraction of the cell the flame body occupies. The rest is headroom for the
 * licks — they have to clear the tip to read as detached, and at first they
 * rose from 60% and were simply buried inside the silhouette.
 */
const BODY_H = 0.84

/**
 * Half-width of one edge at height `u`.
 *
 * `pulse` is a bulge travelling *up* the flame: it is a function of
 * `p - u`, so as the frame advances the swelling climbs. `phase` is offset
 * between the left and right edges so the silhouette is never symmetric —
 * a mirrored outline is an instant tell that something was generated.
 *
 * Every term is periodic in `p` so the flipbook loops seamlessly; a
 * non-looping atlas visibly jumps once per cycle.
 */
function halfWidth(u: number, p: number, phase: number): number {
  const pulse =
    1 + 0.1 * Math.sin(TAU * (p * 2 - u * 1.2) + phase) + 0.07 * Math.sin(TAU * (p * 3 - u * 2.1) + phase * 1.7)
  return Math.max(0, SPREAD * shape(u) * pulse)
}

/** Lateral position of the flame's spine — a slower wave, growing at the tip. */
function axis(u: number, p: number): number {
  return (
    (Math.sin(TAU * (p * 2 - u * 0.9)) * 0.1 +
      Math.sin(TAU * (p * 3 + u * 0.6) + 1.7) * 0.045) *
    Math.pow(u, 1.3)
  )
}

type Geom = { cx: number; baseY: number; maxW: number; maxH: number }

/**
 * One band as a closed path. `u` runs 0..1 over the band's *own* profile while
 * its geometric height is scaled by `hScale`, so every band tapers to a point
 * at its own tip instead of being cut off flat.
 */
function bandPath(
  ctx: CanvasRenderingContext2D,
  g: Geom,
  p: number,
  wScale: number,
  hScale: number
) {
  const STEPS = 32
  ctx.beginPath()

  // Up the left edge, then back down the right. The two edges carry different
  // wave phases, so they are not mirror images of each other.
  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS
    const gy = u * hScale
    const x = g.cx + axis(gy, p) * g.maxW - halfWidth(u, p, 2.1) * wScale * g.maxW
    const y = g.baseY - gy * g.maxH * BODY_H
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  for (let i = STEPS; i >= 0; i--) {
    const u = i / STEPS
    const gy = u * hScale
    ctx.lineTo(
      g.cx + axis(gy, p) * g.maxW + halfWidth(u, p, 0) * wScale * g.maxW,
      g.baseY - gy * g.maxH * BODY_H
    )
  }

  ctx.closePath()
}

/**
 * Licks that have pinched off the tip and are rising on their own.
 *
 * This is the detail the noise versions could never produce: eroding a
 * silhouette can thin it, but it cannot separate a piece and carry it away.
 * Detachment is most of what makes fire look alive.
 */
const LICKS = 3

function drawLicks(ctx: CanvasRenderingContext2D, g: Geom, p: number) {
  for (let j = 0; j < LICKS; j++) {
    const phase = (p + j / LICKS) % 1
    const size = (0.15 - 0.1 * phase) * g.maxW
    if (size < 1) continue

    // Capped below 1 so the licks stay inside their cell. The first pass let
    // them rise to 1.22 and they were clipped into the frame above.
    const rise = 0.8 + 0.2 * phase
    const x = g.cx + (axis(rise, p) + (j - 1) * 0.09) * g.maxW
    const y = g.baseY - rise * g.maxH

    ctx.globalAlpha = Math.max(0, 1 - phase) * 0.9
    ctx.fillStyle = j % 2 ? '#ffa326' : '#ef6a12'
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.quadraticCurveTo(x + size * 0.62, y + size * 0.15, x, y + size * 0.55)
    ctx.quadraticCurveTo(x - size * 0.62, y + size * 0.15, x, y - size)
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawFrame(ctx: CanvasRenderingContext2D, ox: number, oy: number, p: number) {
  const g: Geom = {
    cx: ox + CELL / 2,
    baseY: oy + CELL - MARGIN_BOTTOM,
    maxW: CELL / 2 - MARGIN_SIDE,
    maxH: CELL - MARGIN_TOP - MARGIN_BOTTOM,
  }

  drawLicks(ctx, g, p)

  // Outermost first, so each hotter band paints over the middle of the last.
  for (const band of BANDS) {
    ctx.fillStyle = band.color
    bandPath(ctx, g, p, band.w, band.h)
    ctx.fill()
  }
}

let cached: Texture | null = null

/**
 * Built once, on first use. Twenty-four frames of path filling is a couple of
 * milliseconds, but it must not happen during render.
 */
export function flameAtlas(): Texture {
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = FLAME_COLS * CELL
  canvas.height = FLAME_ROWS * CELL
  const ctx = canvas.getContext('2d')!

  for (let f = 0; f < FLAME_FRAMES; f++) {
    drawFrame(ctx, (f % FLAME_COLS) * CELL, Math.floor(f / FLAME_COLS) * CELL, f / FLAME_FRAMES)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  // Mipmaps are off deliberately. Every cell of a flipbook sits next to a
  // different frame, and higher mip levels average across those boundaries —
  // the classic flipbook bleed, where a distant flame smears neighbouring
  // frames into itself. Standard practice is to pad or drop the mips.
  texture.generateMipmaps = false
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter

  cached = texture
  return texture
}
