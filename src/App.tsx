import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, Vignette } from '@react-three/postprocessing'
import Scene from './components/canvas/Scene'
import { useGameStore } from './stores/gameStore'
import LoadingScreen from './components/ui/LoadingScreen'
import HUD from './components/ui/HUD'
import TransitionOverlay from './components/ui/TransitionOverlay'
import InfoPanel from './components/ui/InfoPanel'
import QuickTravel from './components/ui/QuickTravel'
import TelescopeStatusBar from './components/ui/TelescopeStatusBar'

/**
 * Logs which renderer WebGL actually got. A browser that has fallen back to
 * software rendering (SwiftShader, llvmpipe) will run this scene at ~10fps no
 * matter how well optimised it is, so this is the first thing to check when
 * the framerate looks wrong.
 */
function useGpuReport() {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const gl = document.createElement('canvas').getContext('webgl2')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    const renderer = info
      ? String(gl?.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : 'unavailable'
    const software = /swiftshader|llvmpipe|software|microsoft basic/i.test(renderer)
    console.info(
      `%c[gpu] ${renderer}${software ? ' — SOFTWARE RENDERING, not your GPU' : ''}`,
      `color:${software ? '#ff5555' : '#55cc77'}`
    )
  }, [])
}

function App() {
  const isLoading = useGameStore((state) => state.isLoading)
  useGpuReport()

  return (
    <>
      {/* shadows="soft" swaps in PCFSoftShadowMap: multiple shadow-map taps per
          pixel instead of one, so edges read as penumbra rather than a hard
          stencil. Hard shadow edges are the single most "old game" tell. */}
      <Canvas shadows="soft" dpr={[1, 2]} camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <Scene />

        {/* Bloom is most of the "animated film" quality in stylised 3D: it
            bleeds light out of bright surfaces the way a camera lens does.
            luminanceThreshold sits above 1 so only the deliberately
            over-bright emissives glow — windows, sconces, the orb — while
            ordinary lit surfaces stay crisp. Those materials set
            toneMapped={false} precisely so they can exceed 1. */}
        <EffectComposer>
          {/* Ambient occlusion, and it has to run before bloom so the glow
              spreads over the already-darkened image.

              This is the single biggest thing separating "assembled from
              bricks" from "carved": three lights give every surface a smooth
              gradient, so a box sitting on a floor meets it with no contact
              darkening at all. AO puts shade back into every crevice, seam and
              inside corner, which is where the eye looks for solidity. Tinted
              cool rather than black to stay inside the warm/cool split. */}
          {/* Tuned tight rather than strong. A wide radius at high intensity
              shades whole wall panels, which desaturates them to grey and
              undoes the palette; a short radius puts the darkening only in
              the seams and corners, where it reads as contact. The tint is a
              saturated deep teal, not black, so shadowed areas stay on the
              cool side of the split instead of going neutral. */}
          <N8AO
            aoRadius={0.5}
            distanceFalloff={0.8}
            intensity={1.7}
            quality="medium"
            halfRes
            color="#123039"
          />
          <Bloom
            intensity={1.15}
            luminanceThreshold={1.0}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <Vignette offset={0.28} darkness={0.62} />
        </EffectComposer>

        {/* FPS/ms/memory readout, dev builds only — never ships to production */}
        {import.meta.env.DEV && <Stats />}
      </Canvas>
      <HUD />
      <TransitionOverlay />
      <InfoPanel />
      <QuickTravel />
      <TelescopeStatusBar />
      {isLoading && <LoadingScreen />}
    </>
  )
}

export default App
