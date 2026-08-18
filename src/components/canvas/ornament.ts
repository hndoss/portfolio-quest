/**
 * Drawn ornament, as SVG.
 *
 * `textures.ts` can only make noise — fbm multiplied over a flat colour. That
 * gives a surface grain and nothing else, which is why every wall in the hall
 * reads as one tone no matter how it is lit. The Arcane reference carries
 * almost all of its richness in *painted* fields: framed panels with scrollwork,
 * pierced lattice, tracery, running borders. Those are drawings, not meshes,
 * and nothing here could draw until now.
 *
 * Everything in this module is a pure string. That is the point:
 *
 *   - it can be unit-tested without a DOM (`ornament.test.ts`)
 *   - it can be rasterised offline with `rsvg-convert` and looked at before it
 *     ships, which is the same check the Blender previews exist for
 *   - the browser turns it into a texture through a data URI, so what is
 *     verified offline is byte-identical to what renders
 *
 * Nothing here uses `Math.random`. A wall that reshuffles its own ornament
 * between reloads is the same class of bug as particles that respawn on
 * remount — jitter is seeded from the caller's `seed` instead.
 */

export interface Ink {
  /** Panel ground. Dark — gold line-work needs something to sit on. */
  ground: string
  /** Primary line colour. */
  line: string
  /** Brighter accent for bosses and centres. */
  accent: string
  /** Optional second ground for recessed fields. */
  field?: string
}

/** Piltover: brass line-work on deep teal shadow. */
export const BRASS_ON_TEAL: Ink = {
  ground: '#16282b',
  line: '#c9a227',
  accent: '#f0d68a',
  field: '#1d3438',
}

/** The warmer half of the split, for panels on stone walls. */
export const BRASS_ON_OAK: Ink = {
  ground: '#3a2a16',
  line: '#c9a227',
  accent: '#f0d68a',
  field: '#48341c',
}

/** Deterministic hash-based jitter, so a given seed always draws the same. */
function jitter(seed: number, i: number): number {
  const h = Math.imul(seed * 374761393 + i * 668265263, 1274126177) >>> 0
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296
}

function svg(w: number, h: number, body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ` +
    `width="${w}" height="${h}">${body}</svg>`
  )
}

/**
 * Four lobes and a diamond — the quatrefoil that carries most gothic panel
 * ornament. Drawn as circles plus an outline rather than one clever path,
 * because the lobes need to overlap the diamond's edges to read as cut stone
 * rather than as a flower sitting on top of a square.
 */
function quatrefoil(cx: number, cy: number, r: number, ink: Ink, sw: number): string {
  const d = r * 0.62
  const lobe = r * 0.46
  const circles = [
    [cx, cy - d],
    [cx + d, cy],
    [cx, cy + d],
    [cx - d, cy],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${lobe}" fill="none" stroke="${ink.line}" stroke-width="${sw}"/>`)
    .join('')

  const diamond =
    `<path d="M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z" ` +
    `fill="none" stroke="${ink.line}" stroke-width="${sw}"/>`

  return `${diamond}${circles}<circle cx="${cx}" cy="${cy}" r="${r * 0.13}" fill="${ink.accent}"/>`
}

/**
 * A corner scroll: a quarter bracket that curls inward.
 *
 * `sx`/`sy` of -1 or 1 mirror it into each corner, so one path serves all four
 * and the panel cannot end up with three corners that disagree.
 */
function cornerScroll(x: number, y: number, size: number, sx: number, sy: number, ink: Ink, sw: number): string {
  const s = size
  const d =
    `M ${x} ${y + sy * s} ` +
    `L ${x} ${y + sy * s * 0.34} ` +
    `C ${x} ${y + sy * s * 0.1} ${x + sx * s * 0.1} ${y} ${x + sx * s * 0.34} ${y} ` +
    `L ${x + sx * s} ${y} ` +
    `M ${x + sx * s * 0.30} ${y + sy * s * 0.30} ` +
    `c ${sx * s * 0.30} ${0} ${sx * s * 0.34} ${sy * s * 0.36} ${sx * s * 0.02} ${sy * s * 0.36} ` +
    `c ${-sx * s * 0.22} ${0} ${-sx * s * 0.20} ${-sy * s * 0.24} ${sx * s * 0.04} ${-sy * s * 0.24}`
  return `<path d="${d}" fill="none" stroke="${ink.line}" stroke-width="${sw}" stroke-linecap="round"/>`
}

/**
 * A framed wall panel: double moulding, corner scrolls, a central medallion
 * and a lobe at each midpoint.
 *
 * `aspect` is width/height in world metres. The viewBox is scaled to it so the
 * frame's inset and the medallion stay circular on a tall panel instead of
 * stretching into ovals — the whole reason ornament looks cheap is usually
 * non-uniform scaling, not the drawing.
 */
export function panelSvg(widthM: number, heightM: number, ink: Ink = BRASS_ON_OAK): string {
  const px = 512
  const w = widthM >= heightM ? px : Math.round((px * widthM) / heightM)
  const h = widthM >= heightM ? Math.round((px * heightM) / widthM) : px
  const short = Math.min(w, h)
  const sw = short * 0.012

  const m1 = short * 0.055
  const m2 = short * 0.105
  const parts: string[] = [
    `<rect width="${w}" height="${h}" fill="${ink.ground}"/>`,
    `<rect x="${m1}" y="${m1}" width="${w - m1 * 2}" height="${h - m1 * 2}" ` +
      `fill="none" stroke="${ink.line}" stroke-width="${sw * 1.4}"/>`,
    `<rect x="${m2}" y="${m2}" width="${w - m2 * 2}" height="${h - m2 * 2}" ` +
      `fill="${ink.field ?? ink.ground}" stroke="${ink.line}" stroke-width="${sw * 0.7}"/>`,
  ]

  const inset = m2 + short * 0.05
  const scroll = short * 0.17
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      parts.push(
        cornerScroll(sx > 0 ? inset : w - inset, sy > 0 ? inset : h - inset, scroll, sx, sy, ink, sw)
      )
    }
  }

  parts.push(quatrefoil(w / 2, h / 2, short * 0.19, ink, sw))

  // Midpoint bosses on the long axis, which is what keeps a tall panel from
  // reading as one motif floating in an empty box.
  const bosses = h > w ? [h * 0.22, h * 0.78] : []
  for (const y of bosses) {
    parts.push(`<circle cx="${w / 2}" cy="${y}" r="${short * 0.045}" fill="none" stroke="${ink.line}" stroke-width="${sw}"/>`)
    parts.push(`<circle cx="${w / 2}" cy="${y}" r="${short * 0.016}" fill="${ink.accent}"/>`)
  }

  return svg(w, h, parts.join(''))
}

/**
 * Seamless damask for cloth — the tapestry field and the runner.
 *
 * Tiling is the whole difficulty: the motif is drawn once at the centre and
 * again at all eight wrapped offsets, so whatever crosses an edge is completed
 * by its own copy on the far side. Drawing only the centre motif leaves a hard
 * seam at every repeat, which is the same failure `valueNoise` wraps its
 * lattice to avoid.
 */
export function damaskSvg(ink: Ink = BRASS_ON_TEAL): string {
  const s = 256
  const sw = 4.2

  const motif = (cx: number, cy: number) =>
    `<g transform="translate(${cx} ${cy}) scale(1.42)">` +
    `<path d="M 0 -44 C 26 -30 34 -8 0 30 C -34 -8 -26 -30 0 -44 Z" ` +
    `fill="none" stroke="${ink.line}" stroke-width="${sw}"/>` +
    `<path d="M 0 -16 C 16 -6 18 8 0 22 C -18 8 -16 -6 0 -16 Z" ` +
    `fill="none" stroke="${ink.line}" stroke-width="${sw * 0.7}"/>` +
    `<circle cx="0" cy="-30" r="4.5" fill="${ink.accent}"/>` +
    `<path d="M -40 12 C -22 4 -12 16 0 34 C 12 16 22 4 40 12" ` +
    `fill="none" stroke="${ink.line}" stroke-width="${sw * 0.8}"/>` +
    `</g>`

  const parts = [`<rect width="${s}" height="${s}" fill="${ink.ground}"/>`]
  // Centre plus the four half-offset positions, each drawn at every wrap so
  // nothing is clipped at a tile edge.
  for (const [bx, by] of [
    [s / 2, s / 2],
    [0, 0],
    [s, 0],
    [0, s],
    [s, s],
  ]) {
    for (const dx of [-s, 0, s]) {
      for (const dy of [-s, 0, s]) {
        if (Math.abs(bx + dx - s / 2) > s || Math.abs(by + dy - s / 2) > s) continue
        parts.push(motif(bx + dx, by + dy))
      }
    }
  }

  return svg(s, s, parts.join(''))
}

/**
 * A running border band, for rug edges and floor inlay. Tiles along X only.
 *
 * The wave is drawn one full period wide and repeated, and the leaf phase is
 * seeded so two bands in the same room are not identical.
 */
export function borderSvg(seed = 3, ink: Ink = BRASS_ON_TEAL): string {
  const w = 256
  const h = 64
  const sw = 3.4
  const parts = [
    `<rect width="${w}" height="${h}" fill="${ink.ground}"/>`,
    `<line x1="0" y1="${h * 0.14}" x2="${w}" y2="${h * 0.14}" stroke="${ink.line}" stroke-width="${sw}"/>`,
    `<line x1="0" y1="${h * 0.86}" x2="${w}" y2="${h * 0.86}" stroke="${ink.line}" stroke-width="${sw}"/>`,
  ]

  // One period per 64px, four to the tile, so the band wraps cleanly.
  const period = 64
  let d = `M 0 ${h / 2}`
  // Relative curves, so each scallop continues from wherever the last ended
  // and the band wraps without the seam a per-period absolute `M` would leave.
  for (let i = 0; i < w / period; i++) {
    d += ` c ${period * 0.25} ${-h * 0.3} ${period * 0.75} ${-h * 0.3} ${period} 0`
  }
  parts.push(`<path d="${d}" fill="none" stroke="${ink.line}" stroke-width="${sw}"/>`)

  for (let i = 0; i < w / period; i++) {
    const cx = i * period + period / 2
    const r = 5 + jitter(seed, i) * 2.5
    parts.push(`<circle cx="${cx}" cy="${h * 0.34}" r="${r}" fill="${ink.accent}"/>`)
    parts.push(
      `<path d="M ${cx} ${h * 0.56} c ${-14} ${8} ${-16} ${18} ${-2} ${20} ` +
        `c ${14} ${-2} ${12} ${-12} ${2} ${-20} Z" fill="none" ` +
        `stroke="${ink.line}" stroke-width="${sw * 0.75}"/>`
    )
  }

  return svg(w, h, parts.join(''))
}

/**
 * Gothic tracery for the window glass.
 *
 * The windows are currently a flat emissive rectangle plus a half-disc, which
 * is why they read as glowing holes rather than as windows. Leading drawn into
 * the emissive map costs nothing per pixel and is the whole difference.
 *
 * Drawn dark-on-light, unlike the panels: this becomes an emissive map, so the
 * *lead* has to be the dark part and the glass the bright part.
 */
export function tracerySvg(lights = 3): string {
  const w = 256
  const h = 420
  const lead = '#1b1408'
  const sw = w * 0.032

  const glass = ['#ffe9bd', '#ffd591', '#f3c9ab', '#ffdf9f', '#e9c9a0']
  const parts = [`<rect width="${w}" height="${h}" fill="${glass[0]}"/>`]

  // Quarrels: a diamond lattice is what a leaded light actually is, and it
  // reads at distance where individual panes do not.
  const step = w / 5
  for (let i = -6; i < 14; i++) {
    parts.push(
      `<line x1="${i * step}" y1="0" x2="${i * step + h}" y2="${h}" stroke="${lead}" stroke-width="${sw * 0.32}"/>`,
      `<line x1="${i * step}" y1="0" x2="${i * step - h}" y2="${h}" stroke="${lead}" stroke-width="${sw * 0.32}"/>`
    )
  }

  // Coloured lights, one per bay, tinting the diamond field beneath.
  const bay = w / lights
  for (let i = 0; i < lights; i++) {
    parts.push(
      `<rect x="${i * bay + sw}" y="${h * 0.18}" width="${bay - sw * 2}" height="${h * 0.46}" ` +
        `fill="${glass[(i % (glass.length - 1)) + 1]}" fill-opacity="0.85"/>`
    )
  }

  // Mullions between the lights, and the arch heads above them.
  for (let i = 1; i < lights; i++) {
    parts.push(`<line x1="${i * bay}" y1="0" x2="${i * bay}" y2="${h}" stroke="${lead}" stroke-width="${sw}"/>`)
  }
  for (let i = 0; i < lights; i++) {
    const cx = i * bay + bay / 2
    parts.push(
      `<path d="M ${i * bay + sw / 2} ${h * 0.30} ` +
        `Q ${cx} ${h * 0.12} ${(i + 1) * bay - sw / 2} ${h * 0.30}" ` +
        `fill="none" stroke="${lead}" stroke-width="${sw * 0.8}"/>`
    )
  }

  parts.push(
    `<rect x="${sw / 2}" y="${sw / 2}" width="${w - sw}" height="${h - sw}" ` +
      `fill="none" stroke="${lead}" stroke-width="${sw}"/>`,
    `<line x1="0" y1="${h * 0.72}" x2="${w}" y2="${h * 0.72}" stroke="${lead}" stroke-width="${sw * 0.8}"/>`
  )

  return svg(w, h, parts.join(''))
}
