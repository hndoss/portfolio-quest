import type { AreaId } from '../types/game'

/**
 * The six areas, and the viewpoint each one is entered at.
 *
 * This list used to live inside `QuickTravel.tsx`. The castle map needs exactly
 * the same list, and the failure mode of copying it is the one this codebase
 * already knows well from `viewpoints.json`: two hand-written tables that agree
 * until someone edits one of them. `areas.test.ts` checks every
 * `defaultViewpoint` here still resolves against the navigation data, because
 * nothing else would — a stale id fails silently at runtime as a click that
 * does nothing.
 *
 * Order is the reading order of the map, top to bottom.
 */
export interface AreaEntry {
  id: AreaId
  name: string
  defaultViewpoint: string
}

export const AREAS: AreaEntry[] = [
  { id: 'observatory', name: 'The Observatory', defaultViewpoint: 'observatory-entrance' },
  { id: 'library', name: 'The Library', defaultViewpoint: 'library-entrance' },
  { id: 'central-hall', name: 'Central Hall', defaultViewpoint: 'hall-entrance' },
  { id: 'forge', name: 'The Forge', defaultViewpoint: 'forge-entrance' },
  { id: 'pipelines', name: 'The Pipelines', defaultViewpoint: 'pipelines-entrance' },
  { id: 'treasury', name: 'The Treasury', defaultViewpoint: 'treasury-entrance' },
]

export const AREA_BY_ID = new Map(AREAS.map((area) => [area.id, area]))
