import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../stores/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      currentArea: 'central-hall',
      isLoading: true,
      isPaused: false,
      activeInfoPoint: null,
    })
  })

  describe('initial state', () => {
    it('should start in central-hall', () => {
      expect(useGameStore.getState().currentArea).toBe('central-hall')
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
  })

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
})
