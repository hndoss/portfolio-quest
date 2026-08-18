import { useEffect, useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'
import CameraController from './CameraController'
import Hotspot from './Hotspot'
import InfoPoint from './InfoPoint'
import TelescopeMode from './TelescopeMode'
import CentralHall from './areas/CentralHall'
import Library from './areas/Library'
import Forge from './areas/Forge'
import Pipelines from './areas/Pipelines'
import Treasury from './areas/Treasury'
import Observatory from './areas/Observatory'

export default function Scene() {
  const setLoading = useGameStore((state) => state.setLoading)
  const targetViewpoint = useGameStore((state) => state.targetViewpoint)
  const { viewpoints, currentViewpointData, isLoading: navLoading } = useNavigation()

  // Only the area you are in stays mounted, plus wherever you are flying to.
  //
  // This matters far more than it looks: in three.js every light in the scene
  // compiles into every material's shader regardless of distance, so mounting
  // all six areas meant paying for 27 point lights on every pixel of whichever
  // room you were actually looking at. `distance` attenuates a light's
  // contribution, not its cost. Unmounting is the only way to stop paying.
  const activeAreas = useMemo(() => {
    const areaOf = new Map(viewpoints.map((v) => [v.id, v.areaId]))
    const active = new Set<string>()
    if (currentViewpointData) active.add(currentViewpointData.areaId)
    if (targetViewpoint) {
      const destination = areaOf.get(targetViewpoint)
      if (destination) active.add(destination)
    }
    // Before navigation data resolves there is no current viewpoint yet, and
    // an empty set would render an empty room on first paint.
    if (active.size === 0) active.add('central-hall')
    return active
  }, [viewpoints, currentViewpointData, targetViewpoint])

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
      {/* Warm/cool complementary lighting — the thing doing most of the work
          in painterly fantasy interiors. A single golden key light stands in
          for sun through windows; the cool hemisphere fills the shadows blue
          so they read as atmosphere instead of as absence of light.

          Kept to three lights on purpose: every light is evaluated per-pixel
          in every material, so colour belongs in materials and emissives. */}
      <ambientLight intensity={0.5} color="#4a5f8a" />
      <hemisphereLight args={['#7fa3d8', '#5a3f22', 0.9]} />
      {/* normalBias offsets the shadow lookup along the surface normal, which
          is what stops a lit surface from shadowing itself into moiré. The
          shadow camera also has to be widened: three.js defaults a
          directional light's frustum to +/-5 units and this hall is 20 across,
          so most of the room fell outside the shadow map entirely. */}
      {/* Steep angle on purpose: at ~38 degrees elevation this light threw long
          raking shadows that sliced the floor into hard diagonal wedges. High
          and slightly to one side keeps shadows short and readable. */}
      <directionalLight
        position={[11, 26, 9]}
        intensity={3.0}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
      />

      {/* Aerial perspective: distant geometry fades into the haze, which is
          what gives the reference its sense of depth. */}
      <fogExp2 attach="fog" args={['#243044', 0.022]} />

      {/* Camera Controller */}
      {viewpoints.length > 0 && (
        <CameraController viewpoints={viewpoints} transitionDuration={1.2} />
      )}

      {/* Environment — only the active area(s), see activeAreas above */}
      {activeAreas.has('central-hall') && <CentralHall />}
      {activeAreas.has('library') && <Library />}
      {activeAreas.has('forge') && <Forge />}
      {activeAreas.has('pipelines') && <Pipelines />}
      {activeAreas.has('treasury') && <Treasury />}
      {activeAreas.has('observatory') && <Observatory />}

      {/* Telescope overlay. Mounted unconditionally, as on main: it reads
          `telescopeMode` from the store and renders nothing when off. */}
      <TelescopeMode />

      {/* Hotspots for current viewpoint */}
      {currentViewpointData?.hotspots.map((hotspot) => (
        <Hotspot key={hotspot.id} hotspot={hotspot} />
      ))}

      {/* InfoPoints for current viewpoint */}
      {currentViewpointData?.infoPoints.map((infoPoint) => (
        <InfoPoint key={infoPoint.id} infoPoint={infoPoint} />
      ))}
    </>
  )
}
