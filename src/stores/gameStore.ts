import { create } from 'zustand'
import type { AreaId, GameState } from '../types/game'

interface GameStore extends GameState {
  setCurrentArea: (area: AreaId) => void
  setLoading: (loading: boolean) => void
  setPaused: (paused: boolean) => void
  setActiveInfoPoint: (infoPointId: string | null) => void
}

export const useGameStore = create<GameStore>((set) => ({
  currentArea: 'central-hall',
  isLoading: true,
  isPaused: false,
  activeInfoPoint: null,

  setCurrentArea: (area) => set({ currentArea: area }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPaused: (paused) => set({ isPaused: paused }),
  setActiveInfoPoint: (infoPointId) => set({ activeInfoPoint: infoPointId }),
}))
