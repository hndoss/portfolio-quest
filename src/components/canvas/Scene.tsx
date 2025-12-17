import { useEffect } from 'react'
import { Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useGameStore } from '../../stores/gameStore'
import Player from './Player'
import CentralHall from './areas/CentralHall'

export default function Scene() {
  const setLoading = useGameStore((state) => state.setLoading)

  useEffect(() => {
    // Simulate asset loading completion
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [setLoading])

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Sky sunPosition={[100, 20, 100]} />
      <Physics gravity={[0, -9.81, 0]}>
        <Player />
        <CentralHall />
      </Physics>
    </>
  )
}
