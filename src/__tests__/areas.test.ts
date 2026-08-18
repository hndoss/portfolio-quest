import { describe, it, expect } from 'vitest'
import { AREAS, AREA_BY_ID } from '../data/areas'
import { MAPPED_AREA_IDS } from '../components/ui/CastleMap'
import navigationData from '../../public/data/viewpoints.json'
import type { NavigationData } from '../types/navigation'

/**
 * `data/areas.ts` and `public/data/viewpoints.json` are two hand-written tables
 * with no compile-time link, which is the same shape of problem CLAUDE.md
 * flags around the 81 hand-placed coordinates. A `defaultViewpoint` that no
 * longer resolves fails silently — the room is drawn on the map, you click it,
 * and nothing happens. These tests are the link.
 */
const nav = navigationData as NavigationData

describe('area registry', () => {
  it('names a start viewpoint that exists', () => {
    expect(nav.viewpoints.some((v) => v.id === nav.startViewpoint)).toBe(true)
  })

  it.each(AREAS)('$name enters at a viewpoint that exists', (area) => {
    const viewpoint = nav.viewpoints.find((v) => v.id === area.defaultViewpoint)
    expect(viewpoint, `no viewpoint "${area.defaultViewpoint}"`).toBeDefined()
    expect(viewpoint?.areaId).toBe(area.id)
  })

  it('covers every area the navigation data uses', () => {
    const inData = new Set(nav.viewpoints.map((v) => v.areaId))
    expect([...inData].sort()).toEqual(AREAS.map((a) => a.id).sort())
  })

  it('has no duplicate ids', () => {
    expect(AREA_BY_ID.size).toBe(AREAS.length)
  })
})

describe('castle map', () => {
  it('draws every area exactly once', () => {
    expect([...MAPPED_AREA_IDS].sort()).toEqual(AREAS.map((a) => a.id).sort())
  })
})
