import { AdditiveBlending, DoubleSide } from 'three'
import Fireplace from '../Fireplace'
import Hourglass from '../Hourglass'
import HallFurniture from '../HallFurniture'
import { Braziers, Chandelier, Colonnade } from '../HallDressing'
import {
  CHANDELIER_AT,
  DOOR_HEIGHT,
  DOOR_WIDTH,
  FACE_X,
  FACE_Z,
  HALF_DEPTH,
  HALF_WIDTH,
  HALL_DEPTH,
  HALL_HEIGHT,
  HALL_WIDTH,
  SCONCE_AT,
  WALLS,
  WALL_PANEL_AT,
  WALL_THICKNESS,
  WINDOW_AT,
  type Wall,
} from '../hallLayout'
import { ornamentMap, surfaceMaps } from '../textures'
import { BRASS_ON_OAK, panelSvg, tracerySvg } from '../ornament'

/**
 * The central hall.
 *
 * Layout comes from `hallLayout.ts` rather than from literals here — the same
 * numbers drive the wall dressing, and having two copies is how the room and
 * its ornament drift apart.
 *
 * The room is 16 x 12: the north wall is solid and carries the fireplace, and
 * the other three keep their doorways. There is no pedestal at the centre any
 * more; the desk is the only thing on the entrance axis.
 */
export default function CentralHall() {
  return (
    <group>
      {/* Floor - polished stone with pattern */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[HALL_WIDTH, HALL_DEPTH]} />
        <meshStandardMaterial
          color="#8a5a2e"
          metalness={0.2}
          {...surfaceMaps('stone', HALL_WIDTH, HALL_DEPTH)}
        />
      </mesh>

      {/* No floor compass. It read as two circles rather than a rose, and it
          was a signpost to the four navigation orbs, which are gone. See the
          note where `COMPASS_AT` was in hallLayout.ts. */}

      {/* Ceiling */}
      <mesh position={[0, HALL_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL_WIDTH, HALL_DEPTH]} />
        <meshStandardMaterial color="#152028" />
      </mesh>

      {WALLS.map((wall) => (
        <HallWall key={wall.id} wall={wall} />
      ))}

      {/* Fireplace, centred on the solid north wall. */}
      <Fireplace />

      {/* The hall's only piece of content. Clicking it opens the profile
          panel; the room carries no floating info orbs. */}
      <Hourglass />

      {/* Furniture: runner, hearth group, refectory table, hearth irons and
          the wall hangings. Blender props plus textured cloth — see
          HallFurniture.tsx for which is which and why.

          No welcome desk. It is the one object in the room that read as
          another century, it holds no content now that the hourglass does, and
          `WelcomeDesk.tsx` stays on disk for the Office — the room it was
          invented for. */}
      <HallFurniture />

      {/* Plaques over the two wing doorways and the entrance. There is no
          Observatory plaque: it has no doorway off this room any more, being
          reached by stair rather than through the north wall. */}
      <AreaPlaque
        position={[-(FACE_X - 0.12), 4.72, 0]}
        rotation={[0, Math.PI / 2, 0]}
        color="#ffa54f"
      />
      <AreaPlaque
        position={[FACE_X - 0.12, 4.72, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#ff4500"
      />
      <AreaPlaque
        position={[0, 4.72, FACE_Z - 0.12]}
        rotation={[0, Math.PI, 0]}
        color="#00ff88"
      />

      {/* Wall dressing. The colonnade supplies the rhythm that tells the eye
          how big the room is; the braziers now flank the approach to the fire
          rather than hiding in the corners. */}
      <Colonnade />
      <Braziers />
      <Chandelier position={CHANDELIER_AT} />

      {/* No corner pillars. They doubled the wall pilasters at the north end
          and were off-frame entirely at the south — see the note where
          `PILLAR_AT` was in hallLayout.ts. */}

      {/* Tall arched windows with visible shafts. Real volumetrics are far too
          expensive here; these are emissive glass plus additive quads, which
          is the standard cheat and reads convincingly because the eye reads
          the shaft's shape, not its physics. */}
      {WINDOW_AT.map((w, i) => (
        <ArchWindow key={i} position={w.position} rotation={w.rotation} />
      ))}

      {SCONCE_AT.map((s, i) => (
        <WallSconce key={i} position={s.position} rotation={s.rotation} />
      ))}

      {/* Painted panels. This is the ornament layer the room was missing:
          the reference art carries its richness in drawn fields, not in
          modelled relief, and until `ornament.ts` existed every surface here
          was one flat colour times a noise tile. */}
      {WALL_PANEL_AT.map(({ position, size }) => (
        <WallPanel key={`${position[0]},${position[1]}`} position={position} size={size} />
      ))}
    </group>
  )
}

/**
 * One wall, with or without a doorway.
 *
 * North is solid and gets a single slab. The other three are built as two side
 * sections plus a header, which is how you get an opening without CSG.
 */
function HallWall({ wall }: { wall: Wall }) {
  const isLong = wall.id === 'north' || wall.id === 'south'
  const { span } = wall

  // Distance of the wall's mid-plane from the origin, along its own axis.
  const offset =
    wall.id === 'north' ? -HALF_DEPTH : wall.id === 'south' ? HALF_DEPTH : wall.id === 'east' ? HALF_WIDTH : -HALF_WIDTH

  /** Lifts (along-wall, height) into world space for this wall's axis. */
  const at = (u: number, y: number): [number, number, number] =>
    isLong ? [u, y, offset] : [offset, y, u]

  const size = (along: number, height: number): [number, number, number] =>
    isLong ? [along, height, WALL_THICKNESS] : [WALL_THICKNESS, height, along]

  if (!wall.door) {
    return (
      <mesh castShadow receiveShadow position={at(0, HALL_HEIGHT / 2)}>
        <boxGeometry args={size(span, HALL_HEIGHT)} />
        <meshStandardMaterial color="#a08453" {...surfaceMaps('stone', span, HALL_HEIGHT)} />
      </mesh>
    )
  }

  const sideWidth = (span - DOOR_WIDTH) / 2
  const topHeight = HALL_HEIGHT - DOOR_HEIGHT
  const sideU = span / 2 - sideWidth / 2

  return (
    <group>
      {[-sideU, sideU].map((u) => (
        <mesh key={u} castShadow receiveShadow position={at(u, HALL_HEIGHT / 2)}>
          <boxGeometry args={size(sideWidth, HALL_HEIGHT)} />
          <meshStandardMaterial color="#a08453" {...surfaceMaps('stone', sideWidth, HALL_HEIGHT)} />
        </mesh>
      ))}

      {/* Header over the opening */}
      <mesh castShadow receiveShadow position={at(0, DOOR_HEIGHT + topHeight / 2)}>
        <boxGeometry args={size(DOOR_WIDTH, topHeight)} />
        <meshStandardMaterial color="#a08453" {...surfaceMaps('stone', DOOR_WIDTH, topHeight)} />
      </mesh>

      {/* Timber surround */}
      <mesh position={at(0, DOOR_HEIGHT / 2)} rotation={[0, isLong ? 0 : Math.PI / 2, 0]}>
        <boxGeometry args={[DOOR_WIDTH + 0.3, DOOR_HEIGHT + 0.2, 0.15]} />
        <meshStandardMaterial color="#3d2c1e" {...surfaceMaps('wood', DOOR_WIDTH, DOOR_HEIGHT)} />
      </mesh>
    </group>
  )
}

interface ArchWindowProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

const GLASS_W = 1.5
const GLASS_H = 2.6

/** Gothic window: emissive glass, stone tracery, and a fake light shaft. */
function ArchWindow({ position, rotation }: ArchWindowProps) {
  // Leading drawn into the map rather than modelled. The window used to be a
  // flat emissive rectangle, which reads as a glowing hole rather than glass —
  // what says "window" is the lattice, and a lattice costs nothing here.
  //
  // The same texture drives colour and emissive. It must NOT be tagged sRGB on
  // the emissive slot: only colour is gamma-encoded, and the dark lead would
  // come back grey. `emissiveMap` multiplies `emissive`, so the lead lines go
  // black and the quarrels stay hot enough for Bloom to catch them.
  const leaded = ornamentMap(tracerySvg(3), 1, 1)
  const leadedLinear = ornamentMap(tracerySvg(3), 1, 1, false)

  const glass = (
    <meshStandardMaterial
      color="#fff4dd"
      map={leaded}
      emissive="#ffdfa8"
      emissiveMap={leadedLinear}
      emissiveIntensity={2.6}
      toneMapped={false}
      side={DoubleSide}
    />
  )

  return (
    <group position={position} rotation={rotation}>
      {/* Rectangular light plus a half-disc above it makes the pointed-arch
          silhouette without any custom geometry. */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[GLASS_W, GLASS_H]} />
        {glass}
      </mesh>
      <mesh position={[0, GLASS_H / 2, 0.02]}>
        <circleGeometry args={[GLASS_W / 2, 20, 0, Math.PI]} />
        {glass}
      </mesh>

      {/* Stone mullions — thin bars are what make it read as a window rather
          than a glowing rectangle. */}
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x * GLASS_W, 0, 0.06]}>
          <boxGeometry args={[0.09, GLASS_H + 0.5, 0.12]} />
          <meshStandardMaterial color="#4a3a28" roughness={0.85} />
        </mesh>
      ))}
      {[-0.8, 0.1, 1.0].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[GLASS_W + 0.1, 0.07, 0.12]} />
          <meshStandardMaterial color="#4a3a28" roughness={0.85} />
        </mesh>
      ))}

      {/* The shaft. Additive and depth-write off so it layers like light
          instead of occluding what is behind it. Two crossed quads give it
          volume from more than one viewing angle. */}
      {[0, Math.PI / 2].map((yaw) => (
        <mesh key={yaw} position={[0, -1.9, 2.3]} rotation={[-0.62, yaw, 0]}>
          <planeGeometry args={[GLASS_W * 1.25, 6]} />
          <meshBasicMaterial
            color="#ffd79a"
            transparent
            opacity={0.075}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

interface AreaPlaqueProps {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
}

/**
 * A plaque over a doorway, marking where it leads.
 *
 * This was a pole-mounted banner hanging beside each door. In a 12m-deep room
 * the side walls have no clear space left between the doorway surround, the
 * windows and the pilasters, and the banners ended up hanging across the
 * openings themselves. Above the door is the only free wall, and a plaque is
 * what belongs there.
 */
function AreaPlaque({ position, rotation, color }: AreaPlaqueProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 1.15, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.48, 1.03, 0.03]} />
        <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Emissive is self-lit — it costs nothing per pixel, unlike a
          pointLight, which is evaluated on every fragment in the scene. */}
      <mesh position={[0, 0, 0.08]}>
        <circleGeometry args={[0.32, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
    </group>
  )
}

interface WallPanelProps {
  position: [number, number, number]
  size: [number, number]
}

/**
 * One painted panel, drawn at its own aspect ratio.
 *
 * `panelSvg` takes the panel's world metres rather than pixels so its frame
 * inset and medallion stay square on a 2.2 x 4.0 panel. Stretching one square
 * artwork across a tall rectangle is the usual reason applied ornament looks
 * cheap — the ovals give it away before anyone can say why.
 */
function WallPanel({ position, size }: WallPanelProps) {
  const [w, h] = size

  return (
    <mesh receiveShadow position={position}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        map={ornamentMap(panelSvg(w, h, BRASS_ON_OAK))}
        roughness={0.82}
        metalness={0.15}
      />
    </mesh>
  )
}

interface WallSconceProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

function WallSconce({ position, rotation }: WallSconceProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bracket */}
      <mesh castShadow position={[0, 0, 0.15]}>
        <boxGeometry args={[0.15, 0.4, 0.3]} />
        <meshStandardMaterial color="#3d2c1e" />
      </mesh>
      {/* Torch holder */}
      <mesh castShadow position={[0, 0.1, 0.35]}>
        <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#2a2018" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Flame glow. Self-lit rather than an actual light: four sconces were
          four more per-fragment lights for a 0.1-radius sphere. */}
      <mesh position={[0, 0.35, 0.35]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial
          color="#ff8c1a"
          emissive="#ff6600"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
