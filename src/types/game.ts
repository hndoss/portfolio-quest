export type AreaId =
  | 'central-hall'
  | 'library'
  | 'forge'
  | 'pipelines'
  | 'treasury'
  | 'watchtower'

export interface PlayerPosition {
  x: number
  y: number
  z: number
}

export interface GameState {
  currentArea: AreaId
  isLoading: boolean
  isPaused: boolean
  activeInfoPoint: string | null
}
