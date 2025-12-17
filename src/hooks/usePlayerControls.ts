import { useState, useEffect } from 'react'

interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

const keyMap: Record<string, keyof KeyState> = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export function usePlayerControls(): KeyState {
  const [keys, setKeys] = useState<KeyState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keyMap[event.code]
      if (key) {
        setKeys((prev) => ({ ...prev, [key]: true }))
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = keyMap[event.code]
      if (key) {
        setKeys((prev) => ({ ...prev, [key]: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
