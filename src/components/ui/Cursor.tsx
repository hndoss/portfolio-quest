import { useEffect, useState } from 'react'
import { useGameStore } from '../../stores/gameStore'

type CursorType = 'default' | 'pointer' | 'move'

const cursorStyles: Record<CursorType, React.CSSProperties> = {
  default: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.8)',
    borderRadius: '50%',
    backgroundColor: 'transparent',
  },
  pointer: {
    width: '24px',
    height: '24px',
    border: '2px solid #ffcc00',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,204,0,0.2)',
    boxShadow: '0 0 10px rgba(255,204,0,0.5)',
  },
  move: {
    width: '28px',
    height: '28px',
    border: '2px solid #4a9eff',
    borderRadius: '50%',
    backgroundColor: 'rgba(74,158,255,0.2)',
    boxShadow: '0 0 12px rgba(74,158,255,0.5)',
  },
}

const baseStyle: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 9999,
  transform: 'translate(-50%, -50%)',
  transition: 'width 0.15s, height 0.15s, border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
}

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const hoveredHotspot = useGameStore((state) => state.hoveredHotspot)
  const isLoading = useGameStore((state) => state.isLoading)

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }

    const handleMouseLeave = () => {
      setVisible(false)
    }

    const handleMouseEnter = () => {
      setVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      document.body.style.cursor = 'default'
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  if (isLoading || !visible) return null

  const cursorType: CursorType = hoveredHotspot ? 'move' : 'default'

  return (
    <div
      style={{
        ...baseStyle,
        ...cursorStyles[cursorType],
        left: position.x,
        top: position.y,
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
