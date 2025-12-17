import { Canvas } from '@react-three/fiber'
import Scene from './components/canvas/Scene'
import { useGameStore } from './stores/gameStore'
import LoadingScreen from './components/ui/LoadingScreen'
import HUD from './components/ui/HUD'
import Cursor from './components/ui/Cursor'
import TransitionOverlay from './components/ui/TransitionOverlay'
import InfoPanel from './components/ui/InfoPanel'

function App() {
  const isLoading = useGameStore((state) => state.isLoading)

  return (
    <>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <Scene />
      </Canvas>
      <HUD />
      <Cursor />
      <TransitionOverlay />
      <InfoPanel />
      {isLoading && <LoadingScreen />}
    </>
  )
}

export default App
