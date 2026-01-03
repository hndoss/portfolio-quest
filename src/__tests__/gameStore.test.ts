import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../stores/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      currentArea: 'central-hall',
      currentViewpoint: null,
      targetViewpoint: null,
      isTransitioning: false,
      isLoading: true,
      isPaused: false,
      activeInfoPoint: null,
      hoveredHotspot: null,
      visitedAreas: new Set(['central-hall']),
      isQuickTravelOpen: false,
      telescopeMode: false,
      focusedTool: null,
    })
  })

  describe('initial state', () => {
    it('should start in central-hall', () => {
      expect(useGameStore.getState().currentArea).toBe('central-hall')
    })

    it('should have no current viewpoint initially', () => {
      expect(useGameStore.getState().currentViewpoint).toBeNull()
    })

    it('should not be transitioning initially', () => {
      expect(useGameStore.getState().isTransitioning).toBe(false)
    })

    it('should start in loading state', () => {
      expect(useGameStore.getState().isLoading).toBe(true)
    })

    it('should not be paused initially', () => {
      expect(useGameStore.getState().isPaused).toBe(false)
    })

    it('should have no active info point', () => {
      expect(useGameStore.getState().activeInfoPoint).toBeNull()
    })

    it('should have no hovered hotspot', () => {
      expect(useGameStore.getState().hoveredHotspot).toBeNull()
    })

    it('should have central-hall as visited area', () => {
      expect(useGameStore.getState().visitedAreas.has('central-hall')).toBe(true)
    })

    it('should have quick travel closed', () => {
      expect(useGameStore.getState().isQuickTravelOpen).toBe(false)
    })
  })

  describe('navigation actions', () => {
    describe('setCurrentViewpoint', () => {
      it('should set current viewpoint', () => {
        useGameStore.getState().setCurrentViewpoint('hall-entrance')
        expect(useGameStore.getState().currentViewpoint).toBe('hall-entrance')
      })

      it('should clear target viewpoint and transitioning', () => {
        useGameStore.setState({ targetViewpoint: 'hall-center', isTransitioning: true })
        useGameStore.getState().setCurrentViewpoint('hall-entrance')
        expect(useGameStore.getState().targetViewpoint).toBeNull()
        expect(useGameStore.getState().isTransitioning).toBe(false)
      })
    })

    describe('navigateTo', () => {
      it('should set target viewpoint', () => {
        useGameStore.getState().navigateTo('hall-center')
        expect(useGameStore.getState().targetViewpoint).toBe('hall-center')
      })

      it('should set isTransitioning to true', () => {
        useGameStore.getState().navigateTo('hall-center')
        expect(useGameStore.getState().isTransitioning).toBe(true)
      })
    })

    describe('completeTransition', () => {
      it('should move target to current viewpoint', () => {
        useGameStore.setState({
          currentViewpoint: 'hall-entrance',
          targetViewpoint: 'hall-center',
          isTransitioning: true,
        })
        useGameStore.getState().completeTransition()
        expect(useGameStore.getState().currentViewpoint).toBe('hall-center')
      })

      it('should clear target viewpoint', () => {
        useGameStore.setState({ targetViewpoint: 'hall-center', isTransitioning: true })
        useGameStore.getState().completeTransition()
        expect(useGameStore.getState().targetViewpoint).toBeNull()
      })

      it('should set isTransitioning to false', () => {
        useGameStore.setState({ isTransitioning: true })
        useGameStore.getState().completeTransition()
        expect(useGameStore.getState().isTransitioning).toBe(false)
      })
    })

    describe('setHoveredHotspot', () => {
      it('should set hovered hotspot', () => {
        useGameStore.getState().setHoveredHotspot('hotspot-1')
        expect(useGameStore.getState().hoveredHotspot).toBe('hotspot-1')
      })

      it('should clear hovered hotspot', () => {
        useGameStore.getState().setHoveredHotspot('hotspot-1')
        useGameStore.getState().setHoveredHotspot(null)
        expect(useGameStore.getState().hoveredHotspot).toBeNull()
      })
    })
  })

  describe('area actions', () => {
    describe('setCurrentArea', () => {
      it('should update current area to library', () => {
        useGameStore.getState().setCurrentArea('library')
        expect(useGameStore.getState().currentArea).toBe('library')
      })

      it('should update current area to forge', () => {
        useGameStore.getState().setCurrentArea('forge')
        expect(useGameStore.getState().currentArea).toBe('forge')
      })
    })

    describe('markAreaVisited', () => {
      it('should add library to visited areas', () => {
        useGameStore.getState().markAreaVisited('library')
        expect(useGameStore.getState().visitedAreas.has('library')).toBe(true)
      })

      it('should preserve previously visited areas', () => {
        useGameStore.getState().markAreaVisited('library')
        useGameStore.getState().markAreaVisited('forge')
        expect(useGameStore.getState().visitedAreas.has('central-hall')).toBe(true)
        expect(useGameStore.getState().visitedAreas.has('library')).toBe(true)
        expect(useGameStore.getState().visitedAreas.has('forge')).toBe(true)
      })

      it('should handle marking same area multiple times', () => {
        useGameStore.getState().markAreaVisited('library')
        useGameStore.getState().markAreaVisited('library')
        expect(useGameStore.getState().visitedAreas.size).toBe(2) // central-hall + library
      })
    })
  })

  describe('UI actions', () => {
    describe('setLoading', () => {
      it('should set loading to false', () => {
        useGameStore.getState().setLoading(false)
        expect(useGameStore.getState().isLoading).toBe(false)
      })

      it('should set loading to true', () => {
        useGameStore.getState().setLoading(false)
        useGameStore.getState().setLoading(true)
        expect(useGameStore.getState().isLoading).toBe(true)
      })
    })

    describe('setPaused', () => {
      it('should pause the game', () => {
        useGameStore.getState().setPaused(true)
        expect(useGameStore.getState().isPaused).toBe(true)
      })

      it('should unpause the game', () => {
        useGameStore.getState().setPaused(true)
        useGameStore.getState().setPaused(false)
        expect(useGameStore.getState().isPaused).toBe(false)
      })
    })

    describe('setActiveInfoPoint', () => {
      it('should set active info point', () => {
        useGameStore.getState().setActiveInfoPoint('info-1')
        expect(useGameStore.getState().activeInfoPoint).toBe('info-1')
      })

      it('should clear active info point', () => {
        useGameStore.getState().setActiveInfoPoint('info-1')
        useGameStore.getState().setActiveInfoPoint(null)
        expect(useGameStore.getState().activeInfoPoint).toBeNull()
      })
    })

    describe('setQuickTravelOpen', () => {
      it('should open quick travel', () => {
        useGameStore.getState().setQuickTravelOpen(true)
        expect(useGameStore.getState().isQuickTravelOpen).toBe(true)
      })

      it('should close quick travel', () => {
        useGameStore.getState().setQuickTravelOpen(true)
        useGameStore.getState().setQuickTravelOpen(false)
        expect(useGameStore.getState().isQuickTravelOpen).toBe(false)
      })
    })
  })

  describe('telescope mode', () => {
    describe('initial state', () => {
      it('should not be in telescope mode initially', () => {
        expect(useGameStore.getState().telescopeMode).toBe(false)
      })

      it('should have no focused tool initially', () => {
        expect(useGameStore.getState().focusedTool).toBeNull()
      })
    })

    describe('enterTelescopeMode', () => {
      it('should set telescopeMode to true', () => {
        useGameStore.getState().enterTelescopeMode()
        expect(useGameStore.getState().telescopeMode).toBe(true)
      })

      it('should set first tool as focused when entering', () => {
        useGameStore.getState().enterTelescopeMode()
        expect(useGameStore.getState().focusedTool).toBe('grafana')
      })
    })

    describe('exitTelescopeMode', () => {
      it('should set telescopeMode to false', () => {
        useGameStore.setState({ telescopeMode: true, focusedTool: 'grafana' })
        useGameStore.getState().exitTelescopeMode()
        expect(useGameStore.getState().telescopeMode).toBe(false)
      })

      it('should clear focused tool when exiting', () => {
        useGameStore.setState({ telescopeMode: true, focusedTool: 'grafana' })
        useGameStore.getState().exitTelescopeMode()
        expect(useGameStore.getState().focusedTool).toBeNull()
      })
    })

    describe('setFocusedTool', () => {
      it('should set focused tool', () => {
        useGameStore.setState({ telescopeMode: true })
        useGameStore.getState().setFocusedTool('prometheus')
        expect(useGameStore.getState().focusedTool).toBe('prometheus')
      })

      it('should allow changing focused tool', () => {
        useGameStore.setState({ telescopeMode: true, focusedTool: 'grafana' })
        useGameStore.getState().setFocusedTool('datadog')
        expect(useGameStore.getState().focusedTool).toBe('datadog')
      })

      it('should allow clearing focused tool', () => {
        useGameStore.setState({ telescopeMode: true, focusedTool: 'grafana' })
        useGameStore.getState().setFocusedTool(null)
        expect(useGameStore.getState().focusedTool).toBeNull()
      })
    })
  })

  describe('observatory containers (beacon/ledger)', () => {
    it('should open beacon overlay via setActiveInfoPoint', () => {
      useGameStore.getState().setActiveInfoPoint('beacon')
      expect(useGameStore.getState().activeInfoPoint).toBe('beacon')
    })

    it('should open ledger overlay via setActiveInfoPoint', () => {
      useGameStore.getState().setActiveInfoPoint('ledger')
      expect(useGameStore.getState().activeInfoPoint).toBe('ledger')
    })

    it('should close overlay by setting activeInfoPoint to null', () => {
      useGameStore.getState().setActiveInfoPoint('beacon')
      useGameStore.getState().setActiveInfoPoint(null)
      expect(useGameStore.getState().activeInfoPoint).toBeNull()
    })
  })
})
