import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'
import type { Hotspot as HotspotType } from '../../types/navigation'

interface HotspotProps {
  hotspot: HotspotType
}

export default function Hotspot({ hotspot }: HotspotProps) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const navigateTo = useGameStore((state) => state.navigateTo)
  const setHoveredHotspot = useGameStore((state) => state.setHoveredHotspot)
  const isTransitioning = useGameStore((state) => state.isTransitioning)

  // Pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      meshRef.current.scale.setScalar(hovered ? 1.2 : pulse)
    }
    if (ringRef.current) {
      const ringPulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5
      ringRef.current.scale.setScalar(1 + ringPulse * 0.3)
      const material = ringRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.3 + ringPulse * 0.4
    }
  })

  const handleClick = () => {
    if (!isTransitioning) {
      navigateTo(hotspot.targetViewpoint)
    }
  }

  const handlePointerOver = () => {
    setHovered(true)
    setHoveredHotspot(hotspot.id)
  }

  const handlePointerOut = () => {
    setHovered(false)
    setHoveredHotspot(null)
  }

  // Color based on icon type
  const getColor = () => {
    switch (hotspot.icon) {
      case 'door':
        return '#c9a227'
      case 'stairs':
        return '#708090'
      case 'arrow':
      default:
        return '#4a9eff'
    }
  }

  const color = getColor()
  const emissiveColor = hovered ? '#ffcc00' : color

  return (
    <group position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}>
      {/* Main orb */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial
          color={hovered ? '#ffcc00' : color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        color={hovered ? '#ffcc00' : color}
        intensity={hovered ? 2 : 0.5}
        distance={3}
        decay={2}
      />
    </group>
  )
}
