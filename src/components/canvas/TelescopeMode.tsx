import { useEffect, useCallback } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useCVData } from '../../hooks/useCVData'

// Tool positions arranged in a constellation-like pattern
const TOOL_POSITIONS: Record<string, [number, number, number]> = {
  grafana: [0, 0, -8],
  prometheus: [-2, 1, -9],
  alertmanager: [2, 1.5, -9],
  datadog: [-1.5, -1, -8.5],
  sumo: [1.5, -0.5, -8.5],
}

const TOOL_ORDER = ['grafana', 'prometheus', 'alertmanager', 'datadog', 'sumo']

export default function TelescopeMode() {
  const telescopeMode = useGameStore((state) => state.telescopeMode)
  const focusedTool = useGameStore((state) => state.focusedTool)
  const setFocusedTool = useGameStore((state) => state.setFocusedTool)
  const exitTelescopeMode = useGameStore((state) => state.exitTelescopeMode)
  const { getTelescopeTools } = useCVData()

  const tools = getTelescopeTools()

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!telescopeMode) return

      if (e.key === 'Escape') {
        exitTelescopeMode()
        return
      }

      const currentIndex = TOOL_ORDER.indexOf(focusedTool || 'grafana')

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextIndex = (currentIndex + 1) % TOOL_ORDER.length
        setFocusedTool(TOOL_ORDER[nextIndex])
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevIndex = (currentIndex - 1 + TOOL_ORDER.length) % TOOL_ORDER.length
        setFocusedTool(TOOL_ORDER[prevIndex])
      }
    },
    [telescopeMode, focusedTool, setFocusedTool, exitTelescopeMode]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!telescopeMode) return null

  return (
    <group position={[0, 0, -30]}>
      {/* Dark sky backdrop */}
      <mesh position={[0, 1.5, -12]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial color="#020208" />
      </mesh>

      {/* Ambient starfield */}
      {[...Array(50)].map((_, i) => (
        <mesh
          key={`star-${i}`}
          position={[
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 10 + 1.5,
            -11 - Math.random() * 2,
          ]}
        >
          <circleGeometry args={[0.02 + Math.random() * 0.02, 6]} />
          <meshBasicMaterial color="#ffffff" opacity={0.3 + Math.random() * 0.4} transparent />
        </mesh>
      ))}

      {/* Tool stars */}
      {tools.map((tool) => {
        const position = TOOL_POSITIONS[tool.id] || [0, 0, -8]
        const isFocused = focusedTool === tool.id

        return (
          <group key={tool.id} position={position}>
            {/* Star glow */}
            <mesh>
              <circleGeometry args={[isFocused ? 0.25 : 0.12, 16]} />
              <meshBasicMaterial
                color={isFocused ? '#ffdd44' : '#88aaff'}
                opacity={isFocused ? 1 : 0.6}
                transparent
              />
            </mesh>

            {/* Star core */}
            <mesh position={[0, 0, 0.01]}>
              <circleGeometry args={[isFocused ? 0.1 : 0.05, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Focused tool indicator ring */}
            {isFocused && (
              <mesh position={[0, 0, 0.02]}>
                <ringGeometry args={[0.3, 0.35, 24]} />
                <meshBasicMaterial color="#ffdd44" opacity={0.8} transparent />
              </mesh>
            )}

            {/* Tool label (only for focused) */}
            {isFocused && (
              <group position={[0, -0.5, 0.01]}>
                {/* Label background */}
                <mesh>
                  <planeGeometry args={[1.2, 0.25]} />
                  <meshBasicMaterial color="#000000" opacity={0.7} transparent />
                </mesh>
              </group>
            )}

            {/* Clickable area */}
            <mesh
              onClick={() => setFocusedTool(tool.id)}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default'
              }}
            >
              <circleGeometry args={[0.4, 16]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        )
      })}

      {/* Telescope viewfinder frame */}
      <mesh position={[0, 1.5, -6]}>
        <ringGeometry args={[3.8, 4, 48]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}
