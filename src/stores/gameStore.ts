import { create } from 'zustand'
import type { AreaId, GameState } from '../types/game'

interface GameStore extends GameState {
  // Navigation actions
  setCurrentViewpoint: (viewpointId: string) => void
  navigateTo: (viewpointId: string) => void
  completeTransition: () => void
  setHoveredHotspot: (hotspotId: string | null) => void

  // Area actions
  setCurrentArea: (area: AreaId) => void

  // UI actions
  setLoading: (loading: boolean) => void
  setPaused: (paused: boolean) => void
  setActiveInfoPoint: (infoPointId: string | null) => void
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  currentArea: 'central-hall',
  currentViewpoint: null,
  targetViewpoint: null,
  isTransitioning: false,
  isLoading: true,
  isPaused: false,
  activeInfoPoint: null,
  hoveredHotspot: null,

  // Navigation actions
  setCurrentViewpoint: (viewpointId) =>
    set({ currentViewpoint: viewpointId, targetViewpoint: null, isTransitioning: false }),

  navigateTo: (viewpointId) =>
    set({ targetViewpoint: viewpointId, isTransitioning: true }),

  completeTransition: () =>
    set((state) => ({
      currentViewpoint: state.targetViewpoint,
      targetViewpoint: null,
      isTransitioning: false,
    })),

  setHoveredHotspot: (hotspotId) => set({ hoveredHotspot: hotspotId }),

  // Area actions
  setCurrentArea: (area) => set({ currentArea: area }),

  // UI actions
  setLoading: (loading) => set({ isLoading: loading }),
  setPaused: (paused) => set({ isPaused: paused }),
  setActiveInfoPoint: (infoPointId) => set({ activeInfoPoint: infoPointId }),
}))
