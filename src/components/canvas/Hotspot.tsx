import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import type { Hotspot as HotspotType } from '../../types/navigation'

interface HotspotProps {
  hotspot: HotspotType
}

export default function Hotspot({ hotspot }: HotspotProps) {
  const [hovered, setHovered] = useState(false)
  const navigateTo = useGameStore((state) => state.navigateTo)
  const setHoveredHotspot = useGameStore((state) => state.setHoveredHotspot)
  const isTransitioning = useGameStore((state) => state.isTransitioning)

  const handleClick = () => {
    if (!isTransitioning) {
      navigateTo(hotspot.targetViewpoint)
    }
  }

  const handlePointerOver = () => {
    setHovered(true)
    setHoveredHotspot(hotspot.id)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    setHoveredHotspot(null)
    document.body.style.cursor = 'default'
  }

  // Color based on icon type
  const getColor = () => {
    if (hovered) return '#ffcc00'
    switch (hotspot.icon) {
      case 'door':
        return '#8b4513'
      case 'stairs':
        return '#708090'
      case 'arrow':
      default:
        return '#4a9eff'
    }
  }

  return (
    <group position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}>
      {/* Clickable mesh */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={hovered ? '#ffcc00' : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Pulsing ring effect when hovered */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}
