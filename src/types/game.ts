export type AreaId =
  | 'central-hall'
  | 'library'
  | 'forge'
  | 'pipelines'
  | 'treasury'
  | 'watchtower'

export interface GameState {
  currentArea: AreaId
  currentViewpoint: string | null
  targetViewpoint: string | null
  isTransitioning: boolean
  isLoading: boolean
  isPaused: boolean
  activeInfoPoint: string | null
  hoveredHotspot: string | null
}
