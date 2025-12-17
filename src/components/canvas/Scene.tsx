import { useEffect } from 'react'
import { Sky } from '@react-three/drei'
import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'
import CameraController from './CameraController'
import Hotspot from './Hotspot'
import CentralHall from './areas/CentralHall'
import Library from './areas/Library'

export default function Scene() {
  const setLoading = useGameStore((state) => state.setLoading)
  const { viewpoints, currentViewpointData, isLoading: navLoading } = useNavigation()

  useEffect(() => {
    if (!navLoading && viewpoints.length > 0) {
      // Loading complete once navigation data is ready
      const timer = setTimeout(() => {
        setLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [navLoading, viewpoints, setLoading])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Sky */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Camera Controller */}
      {viewpoints.length > 0 && (
        <CameraController viewpoints={viewpoints} transitionDuration={1.2} />
      )}

      {/* Environment */}
      <CentralHall />
      <Library />

      {/* Hotspots for current viewpoint */}
      {currentViewpointData?.hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} />
      ))}
    </>
  )
}
