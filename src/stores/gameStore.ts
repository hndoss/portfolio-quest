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
  markAreaVisited: (area: AreaId) => void

  // UI actions
  setLoading: (loading: boolean) => void
  setPaused: (paused: boolean) => void
  setActiveInfoPoint: (infoPointId: string | null) => void
  setQuickTravelOpen: (open: boolean) => void

  // Telescope mode actions
  enterTelescopeMode: () => void
  exitTelescopeMode: () => void
  setFocusedTool: (toolId: string | null) => void
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  currentArea: 'observatory',
  currentViewpoint: 'observatory-center',
  targetViewpoint: null,
  isTransitioning: false,
  isLoading: true,
  isPaused: false,
  activeInfoPoint: null,
  hoveredHotspot: null,
  visitedAreas: new Set<AreaId>(['observatory']),
  isQuickTravelOpen: false,
  telescopeMode: false,
  focusedTool: null,

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
  markAreaVisited: (area) =>
    set((state) => ({
      visitedAreas: new Set([...state.visitedAreas, area]),
    })),

  // UI actions
  setLoading: (loading) => set({ isLoading: loading }),
  setPaused: (paused) => set({ isPaused: paused }),
  setActiveInfoPoint: (infoPointId) => set({ activeInfoPoint: infoPointId }),
  setQuickTravelOpen: (open) => set({ isQuickTravelOpen: open }),

  // Telescope mode actions
  enterTelescopeMode: () => set({ telescopeMode: true, focusedTool: 'grafana' }),
  exitTelescopeMode: () => set({ telescopeMode: false, focusedTool: null }),
  setFocusedTool: (toolId) => set({ focusedTool: toolId }),
}))
