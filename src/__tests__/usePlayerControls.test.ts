import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayerControls } from '../hooks/usePlayerControls'

describe('usePlayerControls', () => {
  const dispatchKeyEvent = (type: 'keydown' | 'keyup', code: string) => {
    const event = new KeyboardEvent(type, { code })
    window.dispatchEvent(event)
  }

  describe('initial state', () => {
    it('should have all keys as false initially', () => {
      const { result } = renderHook(() => usePlayerControls())
      expect(result.current).toEqual({
        forward: false,
        backward: false,
        left: false,
        right: false,
      })
    })
  })

  describe('WASD controls', () => {
    it('should set forward to true on W keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyW'))
      expect(result.current.forward).toBe(true)
    })

    it('should set forward to false on W keyup', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyW'))
      act(() => dispatchKeyEvent('keyup', 'KeyW'))
      expect(result.current.forward).toBe(false)
    })

    it('should set backward to true on S keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyS'))
      expect(result.current.backward).toBe(true)
    })

    it('should set left to true on A keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyA'))
      expect(result.current.left).toBe(true)
    })

    it('should set right to true on D keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyD'))
      expect(result.current.right).toBe(true)
    })
  })

  describe('arrow key controls', () => {
    it('should set forward to true on ArrowUp keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'ArrowUp'))
      expect(result.current.forward).toBe(true)
    })

    it('should set backward to true on ArrowDown keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'ArrowDown'))
      expect(result.current.backward).toBe(true)
    })

    it('should set left to true on ArrowLeft keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'ArrowLeft'))
      expect(result.current.left).toBe(true)
    })

    it('should set right to true on ArrowRight keydown', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'ArrowRight'))
      expect(result.current.right).toBe(true)
    })
  })

  describe('multiple keys', () => {
    it('should handle multiple keys pressed simultaneously', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => {
        dispatchKeyEvent('keydown', 'KeyW')
        dispatchKeyEvent('keydown', 'KeyA')
      })
      expect(result.current.forward).toBe(true)
      expect(result.current.left).toBe(true)
      expect(result.current.backward).toBe(false)
      expect(result.current.right).toBe(false)
    })
  })

  describe('unmapped keys', () => {
    it('should ignore unmapped keys', () => {
      const { result } = renderHook(() => usePlayerControls())
      act(() => dispatchKeyEvent('keydown', 'KeyX'))
      expect(result.current).toEqual({
        forward: false,
        backward: false,
        left: false,
        right: false,
      })
    })
  })
})
