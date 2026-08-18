import { describe, it, expect } from 'vitest'
import {
  BRASS_ON_OAK,
  BRASS_ON_TEAL,
  borderSvg,
  damaskSvg,
  panelSvg,
  tracerySvg,
} from '../components/canvas/ornament'

/**
 * These run without a DOM because the module is pure string generation. That
 * is deliberate — the same strings are rasterised offline with `rsvg-convert`
 * for visual review, so what is asserted here and what is looked at and what
 * the GPU receives are all the same bytes.
 */

const viewBox = (svg: string) => svg.match(/viewBox="0 0 (\d+) (\d+)"/)!.slice(1).map(Number)

describe('panelSvg', () => {
  it('matches the panel aspect ratio rather than stretching a square', () => {
    const [w, h] = viewBox(panelSvg(2.2, 4.0))
    // Stretching one square artwork over a tall panel turns every circle into
    // an oval, which is the usual giveaway that ornament was applied cheaply.
    expect(w / h).toBeCloseTo(2.2 / 4.0, 2)
  })

  it('caps the long edge at 512 either way round', () => {
    expect(Math.max(...viewBox(panelSvg(2.2, 4.0)))).toBe(512)
    expect(Math.max(...viewBox(panelSvg(4.0, 2.2)))).toBe(512)
  })

  it('is deterministic', () => {
    expect(panelSvg(2.6, 1.33)).toBe(panelSvg(2.6, 1.33))
  })

  it('draws corner scrolls in all four corners', () => {
    const scrolls = panelSvg(2.2, 4.0).match(/stroke-linecap="round"/g)
    expect(scrolls).toHaveLength(4)
  })

  it('only adds midpoint bosses to panels taller than they are wide', () => {
    const count = (s: string) => (s.match(/<circle/g) ?? []).length
    // A quatrefoil is 4 lobes + 1 centre = 5 circles in both cases.
    expect(count(panelSvg(4.0, 2.2))).toBe(5)
    expect(count(panelSvg(2.2, 4.0))).toBe(5 + 4)
  })

  it('honours the ink it is given', () => {
    expect(panelSvg(2, 2, BRASS_ON_TEAL)).toContain(BRASS_ON_TEAL.ground)
    expect(panelSvg(2, 2, BRASS_ON_OAK)).toContain(BRASS_ON_OAK.ground)
  })
})

describe('damaskSvg', () => {
  it('is square, so it can repeat on both axes', () => {
    const [w, h] = viewBox(damaskSvg())
    expect(w).toBe(h)
  })

  it('draws every motif at its wrapped copies so the tile has no seam', () => {
    // Centre motif plus four corner motifs; the corners each need copies at
    // the opposite edge or the pattern breaks at the repeat.
    const motifs = (damaskSvg().match(/<g transform="translate/g) ?? []).length
    expect(motifs).toBeGreaterThan(5)
  })

  it('is deterministic', () => {
    expect(damaskSvg()).toBe(damaskSvg())
  })
})

describe('borderSvg', () => {
  it('varies with its seed but never within a seed', () => {
    expect(borderSvg(3)).toBe(borderSvg(3))
    expect(borderSvg(3)).not.toBe(borderSvg(7))
  })

  it('keeps the scallop path relative, so the band wraps', () => {
    // An absolute `M` per period would restart the pen and leave a seam.
    const path = borderSvg(3).match(/<path d="M 0 32([^"]*)"/)![1]
    expect(path).not.toContain('M')
    expect(path.trim().startsWith('c')).toBe(true)
  })
})

describe('tracerySvg', () => {
  it('draws one mullion fewer than it has lights', () => {
    const mullions = (s: string) => (s.match(/<line x1="([\d.]+)" y1="0" x2="\1"/g) ?? []).length
    expect(mullions(tracerySvg(3))).toBe(2)
    expect(mullions(tracerySvg(4))).toBe(3)
  })

  it('draws an arch head per light', () => {
    expect((tracerySvg(3).match(/Q /g) ?? []).length).toBe(3)
  })

  it('leads dark on light, because it becomes an emissive map', () => {
    // Inverted, the lead would glow and the glass would be the dark part.
    expect(tracerySvg(3)).toContain('fill="#ffe9bd"')
    expect(tracerySvg(3)).toContain('stroke="#1b1408"')
  })
})
