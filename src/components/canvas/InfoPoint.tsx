import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'
import type { InfoPointRef } from '../../types/navigation'
import { beginHover, endHover } from './hoverCursor'

interface InfoPointProps {
  infoPoint: InfoPointRef
}

export default function InfoPoint({ infoPoint }: InfoPointProps) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)
  // `contentId`, not `id`. The store holds whatever key `InfoPanel` looks up
  // in cv.json, and cv.json is keyed by content — `library`, not
  // `info-library-overview`. Dispatching the ref's own id meant every panel in
  // the game resolved to null and sat on "Loading..." forever.
  const isActive = activeInfoPoint === infoPoint.contentId

  // Floating and pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating motion
      const float = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
      meshRef.current.position.y = infoPoint.position.y + float

      // Scale pulse
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1
      meshRef.current.scale.setScalar(hovered || isActive ? 1.3 : pulse)
    }
    if (outerRef.current) {
      // Rotate outer ring
      outerRef.current.rotation.y += 0.01
      outerRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  const handleClick = () => {
    if (isActive) {
      setActiveInfoPoint(null)
    } else {
      setActiveInfoPoint(infoPoint.contentId)
    }
  }

  const handlePointerOver = () => {
    setHovered(true)
    beginHover()
  }

  const handlePointerOut = () => {
    setHovered(false)
    endHover()
  }

  const baseColor = '#00ff88'
  const activeColor = '#ffff00'
  const color = isActive ? activeColor : baseColor

  return (
    <group position={[infoPoint.position.x, 0, infoPoint.position.z]}>
      {/* Main info orb */}
      <mesh
        ref={meshRef}
        position={[0, infoPoint.position.y, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isActive ? 1 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Rotating outer ring */}
      <mesh
        ref={outerRef}
        position={[0, infoPoint.position.y, 0]}
      >
        <torusGeometry args={[0.4, 0.03, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered || isActive ? 0.8 : 0.4}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        position={[0, infoPoint.position.y, 0]}
        color={color}
        intensity={hovered || isActive ? 3 : 1}
        distance={4}
        decay={2}
      />
    </group>
  )
}
