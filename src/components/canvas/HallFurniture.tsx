import { DoubleSide } from 'three'
import Prop from './Prop'
import {
  ANDIRON_AT,
  BANNER_AT,
  BANNER_W,
  BENCH_AT,
  CANDLESTICK_Z,
  CANDLE_FLAME_Y,
  FIRE_IRONS_AT,
  HEARTH_CHAIR_AT,
  HEARTH_TABLE_AT,
  HEARTH_TABLE_YAW,
  LOG_BASKET_AT,
  REFECTORY_AT,
  REFECTORY_TOP,
  RUNNER_FROM,
  RUNNER_TO,
  RUNNER_W,
  TAPESTRY_AT,
  TAPESTRY_BOTTOM,
  TAPESTRY_TOP,
  TAPESTRY_W,
} from './hallLayout'
import { ornamentMap } from './textures'
import { BRASS_ON_TEAL, borderSvg, damaskSvg } from './ornament'

/**
 * The hall's furniture: what filled the floor once the welcome desk moved to
 * the Office and the compass inlay came out.
 *
 * The split here is deliberate. **Solid furniture is Blender**, loaded through
 * `Prop.tsx` from the `assets/blender/great_hall/` scene package — chairs,
 * candlesticks, hearth irons. Turned and chamfered forms are what that pipeline
 * exists for, and building them from inline boxes reads as CAD.
 *
 * **Cloth is a textured quad here**, not a model. A rug and a tapestry are
 * planes; all their value is in the surface, and the surface is procedural in
 * `textures.ts`. Modelling them in Blender would add polygons to the one part
 * of the room where, per the pipeline notes, geometry is already at
 * diminishing returns and texture is the whole remaining gap.
 *
 * Palette: `oak` and `wood` on the props are sRGB #5A3A22 and #9C6C42, both a
 * clear value step below the #a08453 walls. The cloth is the room's cool half —
 * teal against a warm floor is the split the art direction is built on.
 */

const CLOTH = '#2b5559'

export default function HallFurniture() {
  return (
    <group>
      <Runner />
      <HearthGroup />
      <RefectoryGroup />
      <HearthDressing />
      <Tapestry />
      <Banners />
    </group>
  )
}

/**
 * Two quads, not one: a brass border and a teal field laid 2mm above it.
 *
 * Separate heights rather than a shared plane — coplanar faces z-fight into
 * speckle, which is the same rule the Blender props follow for overlapping
 * solids. Both are flat on the floor, so `receiveShadow` matters and
 * `castShadow` would be wasted.
 */
function Runner() {
  const length = RUNNER_FROM - RUNNER_TO
  const midZ = (RUNNER_FROM + RUNNER_TO) / 2
  const inset = 0.18

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, midZ]}>
        <planeGeometry args={[RUNNER_W, length]} />
        <meshStandardMaterial
          map={ornamentMap(borderSvg(3, BRASS_ON_TEAL), 2, Math.round(length / 1.2))}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, midZ]}>
        <planeGeometry args={[RUNNER_W - inset * 2, length - inset * 2]} />
        <meshStandardMaterial
          color={CLOTH}
          map={ornamentMap(damaskSvg(BRASS_ON_TEAL), 2, Math.round(length / 1.1))}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
    </group>
  )
}

function HearthGroup() {
  return (
    <group>
      {HEARTH_CHAIR_AT.map(({ position, yaw }) => (
        <Prop key={position[0]} slug="hall-chair" position={position} rotation={[0, yaw, 0]} />
      ))}
      <Prop
        slug="hall-side-table"
        position={HEARTH_TABLE_AT}
        rotation={[0, HEARTH_TABLE_YAW, 0]}
      />
    </group>
  )
}

function RefectoryGroup() {
  // The table itself needs no rotation: the .glb is built long in Blender Y,
  // and three.js z = -blender y, so it already runs along Z.
  const [tx] = REFECTORY_AT

  return (
    <group>
      <Prop slug="refectory-table" position={REFECTORY_AT} />
      <Prop slug="hall-bench" position={BENCH_AT} />

      {CANDLESTICK_Z.map((z) => (
        <Prop key={z} slug="candlestick" position={[tx, REFECTORY_TOP, z]} />
      ))}

      {/* Flames as emissive spheres above 1.0 with toneMapped off, so Bloom
          (luminanceThreshold 1.0) picks out exactly these. Three more punctual
          lights here would be three more per-fragment evaluations across every
          material in the room; the hall stays on two. */}
      {CANDLESTICK_Z.map((z) => (
        <mesh key={z} position={[tx, CANDLE_FLAME_Y, z]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial
            color="#ffbe6a"
            emissive="#ff8c1a"
            emissiveIntensity={3.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function HearthDressing() {
  return (
    <group>
      {ANDIRON_AT.map((position) => (
        <Prop key={position[0]} slug="andiron" position={position} />
      ))}
      <Prop slug="log-basket" position={LOG_BASKET_AT} rotation={[0, 0.4, 0]} />
      <Prop slug="fire-irons" position={FIRE_IRONS_AT} rotation={[0, -0.5, 0]} />
    </group>
  )
}

/**
 * The north-west bay's hanging, mirroring the hourglass in the east bay.
 *
 * Built as border-behind-panel for the same reason the runner is: two planes at
 * different depths rather than one plane with an inset texture.
 */
function Tapestry() {
  const height = TAPESTRY_TOP - TAPESTRY_BOTTOM
  const midY = (TAPESTRY_TOP + TAPESTRY_BOTTOM) / 2
  const [x, , z] = TAPESTRY_AT
  const inset = 0.16

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, midY, 0]}>
        <planeGeometry args={[TAPESTRY_W, height]} />
        <meshStandardMaterial
          map={ornamentMap(borderSvg(7, BRASS_ON_TEAL), 2, 4)}
          roughness={0.95}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, midY, 0.012]}>
        <planeGeometry args={[TAPESTRY_W - inset * 2, height - inset * 2]} />
        <meshStandardMaterial
          color={CLOTH}
          map={ornamentMap(damaskSvg(BRASS_ON_TEAL), 2, 3)}
          roughness={0.95}
          metalness={0}
          side={DoubleSide}
        />
      </mesh>

      {/* Rod, overhanging the cloth at both ends so it reads as hung rather
          than pasted on. */}
      <mesh castShadow position={[0, TAPESTRY_TOP + 0.06, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, TAPESTRY_W + 0.36, 10]} />
        <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (TAPESTRY_W / 2 + 0.18), TAPESTRY_TOP + 0.06, 0.05]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Narrow banners in the side-wall strips.
 *
 * 0.45 wide because that is what fits — see BANNER_AT for the measurement.
 * Seen at a raking angle from the fixed camera, so they read as vertical
 * colour accents at the frame edges rather than as anything you look at.
 */
function Banners() {
  const height = 2.4

  return (
    <group>
      {BANNER_AT.map(({ position, rotation }) => (
        <group key={`${position[0]},${position[2]}`} position={position} rotation={rotation}>
          <mesh>
            <planeGeometry args={[BANNER_W, height]} />
            <meshStandardMaterial
              color={CLOTH}
              map={ornamentMap(damaskSvg(BRASS_ON_TEAL), 1, 4)}
              roughness={0.95}
              metalness={0}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[0, height / 2 + 0.05, 0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, BANNER_W + 0.16, 8]} />
            <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
