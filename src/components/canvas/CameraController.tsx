import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'
import type { Viewpoint } from '../../types/navigation'
import type { AreaId } from '../../types/game'

interface CameraControllerProps {
  viewpoints: Viewpoint[]
  transitionDuration?: number
}

export default function CameraController({
  viewpoints,
  transitionDuration = 1.0,
}: CameraControllerProps) {
  const { camera } = useThree()
  const transitionProgress = useRef(0)
  const startPosition = useRef(new THREE.Vector3())
  const startLookAt = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const targetAreaId = useRef<AreaId | null>(null)

  const currentViewpoint = useGameStore((state) => state.currentViewpoint)
  const targetViewpoint = useGameStore((state) => state.targetViewpoint)
  const isTransitioning = useGameStore((state) => state.isTransitioning)
  const completeTransition = useGameStore((state) => state.completeTransition)
  const setCurrentViewpoint = useGameStore((state) => state.setCurrentViewpoint)
  const setCurrentArea = useGameStore((state) => state.setCurrentArea)

  // Find viewpoint by ID
  const findViewpoint = (id: string | null): Viewpoint | undefined => {
    if (!id) return undefined
    return viewpoints.find((v) => v.id === id)
  }

  // Initialize camera to start viewpoint
  useEffect(() => {
    if (!currentViewpoint && viewpoints.length > 0) {
      const startVp = viewpoints[0]
      camera.position.set(startVp.position.x, startVp.position.y, startVp.position.z)
      camera.lookAt(startVp.lookAt.x, startVp.lookAt.y, startVp.lookAt.z)
      setCurrentViewpoint(startVp.id)
      setCurrentArea(startVp.areaId as AreaId)
    }
  }, [viewpoints, currentViewpoint, camera, setCurrentViewpoint, setCurrentArea])

  // Start transition when target changes
  useEffect(() => {
    if (isTransitioning && targetViewpoint) {
      const targetVp = findViewpoint(targetViewpoint)
      if (targetVp) {
        // Capture current camera state as start
        startPosition.current.copy(camera.position)
        // Get current look direction
        const currentLookAt = new THREE.Vector3()
        camera.getWorldDirection(currentLookAt)
        currentLookAt.multiplyScalar(10).add(camera.position)
        startLookAt.current.copy(currentLookAt)

        // Set target
        targetPosition.current.set(targetVp.position.x, targetVp.position.y, targetVp.position.z)
        targetLookAt.current.set(targetVp.lookAt.x, targetVp.lookAt.y, targetVp.lookAt.z)
        targetAreaId.current = targetVp.areaId as AreaId

        // Reset progress
        transitionProgress.current = 0
      }
    }
  }, [isTransitioning, targetViewpoint, camera])

  // Animate camera during transition
  useFrame((_, delta) => {
    if (!isTransitioning) return

    transitionProgress.current += delta / transitionDuration

    if (transitionProgress.current >= 1) {
      // Transition complete
      camera.position.copy(targetPosition.current)
      camera.lookAt(targetLookAt.current)
      if (targetAreaId.current) {
        setCurrentArea(targetAreaId.current)
      }
      completeTransition()
    } else {
      // Ease in-out interpolation
      const t = easeInOutCubic(transitionProgress.current)

      // Interpolate position
      camera.position.lerpVectors(startPosition.current, targetPosition.current, t)

      // Interpolate look-at point
      const currentLookAt = new THREE.Vector3().lerpVectors(
        startLookAt.current,
        targetLookAt.current,
        t
      )
      camera.lookAt(currentLookAt)
    }
  })

  return null
}

// Easing function for smooth transitions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
