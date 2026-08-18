import { useMemo } from 'react'
import { Instance, Instances, RoundedBoxGeometry } from '@react-three/drei'
import Fire from './Fire'
import { BRAZIER_AT, HALL_HEIGHT, WALLS, place } from './hallLayout'
import { surfaceMaps, type SurfaceKind } from './textures'

/**
 * Wall dressing for the central hall: pilasters, cornice, braziers and a
 * chandelier.
 *
 * Repeating verticals at a known spacing give the eye a unit to count, which
 * is what actually communicates the size of a room. Without them the hall was
 * bare floor ending in a blank slab, and no amount of shrinking it would have
 * fixed that on its own.
 *
 * Wall geometry, pilaster offsets and the room's dimensions all come from
 * `hallLayout.ts`. This file used to carry its own `ROOM_SIZE` and a
 * `WALL_FACE` derived from it by hand, which let the dressing drift out of
 * step with the room it dresses. Pilaster counts differ per wall — south takes
 * four, the short walls two, and north none at all — and `wall.pilasters` owns
 * that.
 *
 * Everything here is instanced. A pilaster is six boxes and there are eight of
 * them; drawn naively that is 48 draw calls added to a scene only just cut
 * down to ~104 total. `<Instances>` uploads one geometry and one material and
 * issues a single call for every copy, so the whole colonnade costs six.
 */

type Part = {
  key: string
  size: [number, number, number]
  y: number
  /** Distance of the part's centre from the wall face. */
  depth: number
  color: string
  surface: SurfaceKind
  metalness?: number
}

/**
 * Standard material for a part, textured at its own physical size.
 *
 * `roughness` is deliberately absent: the roughness map supplies it, and a
 * scalar `roughness` would multiply the map rather than be overridden by it.
 */
function partMaterial(part: Part) {
  const [w, h] = part.size
  const { map, roughnessMap } = surfaceMaps(part.surface, w, h)
  return (
    <meshStandardMaterial
      color={part.color}
      map={map}
      roughnessMap={roughnessMap}
      metalness={part.metalness ?? 0.1}
    />
  )
}

/**
 * A pilaster as stacked slabs of decreasing depth. Nothing here is curved —
 * the "carved" read comes entirely from horizontal steps catching the key
 * light in bands, which is the cheapest ornament there is.
 *
 * No two parts share a face plane: the panel stands 0.02 proud of the shaft
 * rather than flush inside it. Coplanar faces z-fight into speckle.
 */
// Deliberately lighter than the #a08453 wall behind them. When pilaster and
// wall share a colour the eye reads one moulded slab with bumps on it; a
// value step is what separates "applied ornament" from "lumpy wall", and it
// does more at a distance than any amount of surface detail.
const PILASTER_PARTS: Part[] = [
  { key: 'plinth', size: [0.95, 0.55, 0.45], y: 0.275, depth: 0.225, color: '#9d8055', surface: 'stone' },
  { key: 'shaft', size: [0.68, 4.15, 0.3], y: 2.625, depth: 0.15, color: '#c0a271', surface: 'stone' },
  { key: 'panel', size: [0.4, 3.85, 0.32], y: 2.625, depth: 0.16, color: '#6a5330', surface: 'stone' },
  { key: 'band', size: [0.76, 0.12, 0.36], y: 1.62, depth: 0.18, color: '#c9a227', surface: 'metal', metalness: 0.85 },
  { key: 'capital', size: [1.05, 0.5, 0.5], y: 4.95, depth: 0.25, color: '#b19366', surface: 'stone' },
  { key: 'abacus', size: [1.18, 0.22, 0.58], y: 5.31, depth: 0.29, color: '#c6a877', surface: 'stone' },
]

export function Colonnade() {
  return (
    <group>
      {PILASTER_PARTS.map((part) => (
        <Instances key={part.key} castShadow receiveShadow limit={32}>
          {/* Chamfered rather than square. A perfect 90-degree edge returns no
              highlight at all, which is exactly what moulded plastic looks
              like; a 3cm bevel catches a thin bright line along every arris
              and is most of what reads as cut stone. Cheap here because the
              geometry is uploaded once and instanced sixteen times. */}
          <RoundedBoxGeometry args={part.size} radius={0.03} smoothness={2} bevelSegments={2} creaseAngle={0.6} />
          {partMaterial(part)}
          {WALLS.flatMap((wall) =>
            wall.pilasters.map((u) => (
              <Instance
                key={`${wall.id}-${u}`}
                position={place(wall, u, part.y, part.depth)}
                rotation={[0, wall.yaw, 0]}
              />
            ))
          )}
        </Instances>
      ))}

      {/* Cornice: one continuous band tying the capitals together. Without it
          the pilasters read as separate posts rather than one order. Drawn on
          every wall including north, which has no pilasters left — it is what
          carries the order across the blank focal wall. */}
      {WALLS.map((wall) => (
        <group key={wall.id}>
          <mesh castShadow receiveShadow position={place(wall, 0, 5.62, 0.21)} rotation={[0, wall.yaw, 0]}>
            <boxGeometry args={[wall.span, 0.34, 0.42]} />
            <meshStandardMaterial color="#8a6f45" {...surfaceMaps('stone', wall.span, 0.34)} />
          </mesh>
          <mesh position={place(wall, 0, 5.41, 0.24)} rotation={[0, wall.yaw, 0]}>
            <boxGeometry args={[wall.span, 0.07, 0.46]} />
            <meshStandardMaterial
              color="#c9a227"
              metalness={0.85}
              {...surfaceMaps('metal', wall.span, 0.5)}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Braziers flanking the approach to the fireplace. Positions come from
 * `hallLayout.ts`.
 *
 * There were four, one in each corner, back when the corners were the darkest
 * part of the frame and nothing else in the room was burning. The hearth is
 * the fire now, so two is enough and they earn more standing either side of
 * the axis the eye already travels along.
 *
 * Sized for the distance they are seen from, not for a person standing next to
 * one. The first version — a realistic 1.7m — subtended so little of the frame
 * that it read as a floating candle. At 2.4m tall with a bowl you can actually
 * see into, it reads as a fixture.
 */
const LEG_ANGLES = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3]
const LEG_R_BOTTOM = 0.58
const LEG_R_TOP = 0.18
const LEG_RISE = 1.3
const LEG_REACH = LEG_R_BOTTOM - LEG_R_TOP
const LEG_LEN = Math.hypot(LEG_REACH, LEG_RISE)
const LEG_MID_R = (LEG_R_BOTTOM + LEG_R_TOP) / 2

const BOWL_H = 0.46
const BOWL_R = 0.66
const BOWL_Y = LEG_RISE + BOWL_H / 2
const RIM_Y = LEG_RISE + BOWL_H

/** Fixed jitter — coals must not reshuffle between renders. */
const COALS = [
  [0.0, 0.0, 0.03],
  [0.27, 0.03, 0.15],
  [-0.23, 0.0, 0.2],
  [0.11, 0.04, -0.25],
  [-0.18, 0.02, -0.16],
]

export function Braziers() {
  /**
   * Legs, derived from their two endpoints rather than guessed. Identical
   * construction to the chandelier struts: the Z Euler term tilts the
   * cylinder within its local YX plane and the Y term swings that tilt round
   * to the leg's bearing. The braziers have no yaw of their own, so a local
   * rotation is already the world rotation.
   */
  const legs = useMemo(
    () =>
      BRAZIER_AT.flatMap(([x, z]) =>
        LEG_ANGLES.map((angle) => ({
          key: `${x},${z},${angle}`,
          position: [
            x + Math.cos(angle) * LEG_MID_R,
            LEG_RISE / 2,
            z + Math.sin(angle) * LEG_MID_R,
          ] as [number, number, number],
          rotation: [0, -angle, Math.atan2(LEG_REACH, LEG_RISE)] as [number, number, number],
        }))
      ),
    []
  )

  return (
    <group>
      <Instances castShadow receiveShadow limit={16}>
        <cylinderGeometry args={[0.045, 0.07, LEG_LEN, 6]} />
        <meshStandardMaterial color="#8a6a24" metalness={0.8} roughness={0.42} />
        {legs.map((leg) => (
          <Instance key={leg.key} position={leg.position} rotation={leg.rotation} />
        ))}
      </Instances>

      {/* Bowl. The emissive is standing in for the firelight that should be
          falling on it: with no punctual light in the corner the brass renders
          as a black silhouette under its own fire, which looks broken. Kept
          well below the 1.0 bloom threshold so it warms without glowing. */}
      <Instances castShadow receiveShadow limit={8}>
        <cylinderGeometry args={[BOWL_R, 0.26, BOWL_H, 14]} />
        <meshStandardMaterial
          color="#a8823a"
          metalness={0.85}
          emissive="#5a2205"
          emissiveIntensity={0.9}
          {...surfaceMaps('metal', BOWL_R * 3, BOWL_H)}
        />
        {BRAZIER_AT.map(([x, z]) => (
          <Instance key={`${x},${z}`} position={[x, BOWL_Y, z]} />
        ))}
      </Instances>

      {/* Rim. A lip catches a highlight all the way round and is most of what
          separates a bowl from a bucket. */}
      <Instances limit={8}>
        <torusGeometry args={[BOWL_R, 0.05, 8, 24]} />
        <meshStandardMaterial color="#c9a227" metalness={0.92} roughness={0.2} />
        {BRAZIER_AT.map(([x, z]) => (
          <Instance key={`${x},${z}`} position={[x, RIM_Y, z]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </Instances>

      {/* Coals, emissive above 1 with toneMapped off so the Bloom pass
          (luminanceThreshold 1.0) picks out exactly these. Solid geometry
          rather than shader, because the coals need to sit *behind* the flame
          in depth and read as physical objects in the bowl. */}
      <Instances limit={32}>
        <dodecahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial
          color="#ff7a2a"
          emissive="#ff3c00"
          emissiveIntensity={2.1}
          toneMapped={false}
        />
        {BRAZIER_AT.flatMap(([x, z]) =>
          COALS.map(([dx, dy, dz], i) => (
            <Instance key={`${x},${z},${i}`} position={[x + dx, RIM_Y - 0.17 + dy, z + dz]} />
          ))
        )}
      </Instances>

      {/* Each fire gets its own seed. Sharing one would have all four on the
          same flipbook frame, which reads as a strobe rather than as fire the
          moment two are in frame together.

          The quad is larger than the flame drawn inside it: the atlas keeps
          side margins for the sway and headroom for the detached licks, so
          roughly 0.6 of this width and 0.85 of this height is actual flame. */}
      {BRAZIER_AT.map(([x, z], i) => (
        <Fire
          key={`${x},${z}`}
          position={[x, RIM_Y - 0.12, z]}
          width={1.9}
          height={1.85}
          intensity={2.2}
          seed={i * 0.37}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */

const CANDLES = [
  { radius: 1.05, count: 8, y: 4.5 },
  { radius: 0.6, count: 4, y: 4.94 },
]

/** Horizontal and vertical span of a strut, from hub down to the outer ring. */
const STRUT_REACH = 1.0
const STRUT_RISE = 0.9

interface ChandelierProps {
  position: [number, number, number]
}

/**
 * Hangs over the desk. Solves two problems at once: it fills the empty upper
 * quarter of the frame, and it gives the hall's one warm point light a
 * physical source to come from instead of floating at [0,5,0].
 */
export function Chandelier({ position }: ChandelierProps) {
  const brass = <meshStandardMaterial color="#c9a227" metalness={0.9} roughness={0.25} />
  const [, hangY] = position

  const candles = useMemo(
    () =>
      CANDLES.flatMap(({ radius, count, y }) =>
        Array.from({ length: count }, (_, i) => {
          const angle = (i / count) * Math.PI * 2
          return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius }
        })
      ),
    []
  )

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Chain up to the ceiling */}
      <mesh position={[0, (HALL_HEIGHT + hangY + 0.9) / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, HALL_HEIGHT - hangY - 0.9, 6]} />
        {brass}
      </mesh>
      <mesh position={[0, HALL_HEIGHT - 0.12, 0]}>
        <cylinderGeometry args={[0.3, 0.16, 0.24, 10]} />
        {brass}
      </mesh>

      {/* Two tiers of ring */}
      <mesh castShadow position={[0, hangY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.055, 8, 40]} />
        {brass}
      </mesh>
      <mesh castShadow position={[0, hangY + 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.045, 8, 32]} />
        {brass}
      </mesh>

      {/* Hub the struts converge on */}
      <mesh position={[0, hangY + 0.95, 0]}>
        <sphereGeometry args={[0.11, 10, 8]} />
        {brass}
      </mesh>

      {/* Struts from the hub down to the outer ring.
          Derived from the two endpoints rather than guessed. A cylinder points
          along local +Y; with three.js' default XYZ Euler order the Z term is
          applied first, so it tilts the axis within the local YX plane and the
          Y term then swings that tilt around to the strut's bearing. Getting
          the Z sign wrong leans the arms up-and-out instead of down-and-out. */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * STRUT_REACH * 0.5, hangY + STRUT_RISE * 0.5 + 0.05, Math.sin(angle) * STRUT_REACH * 0.5]}
          rotation={[0, -angle, Math.atan2(STRUT_REACH, STRUT_RISE)]}
        >
          <cylinderGeometry args={[0.022, 0.022, Math.hypot(STRUT_REACH, STRUT_RISE), 5]} />
          {brass}
        </mesh>
      ))}

      <Instances limit={16}>
        <cylinderGeometry args={[0.05, 0.055, 0.28, 6]} />
        <meshStandardMaterial color="#e8ddc0" roughness={0.85} />
        {candles.map((c, i) => (
          <Instance key={i} position={[c.x, c.y + 0.14, c.z]} />
        ))}
      </Instances>

      {/* Flames. Emissive above 1 with toneMapped off, so the Bloom pass
          (luminanceThreshold 1.0) picks out exactly these and nothing else. */}
      <Instances limit={16}>
        <sphereGeometry args={[0.085, 8, 8]} />
        <meshStandardMaterial
          color="#ffbe6a"
          emissive="#ff8c1a"
          emissiveIntensity={3.4}
          toneMapped={false}
        />
        {candles.map((c, i) => (
          <Instance key={i} position={[c.x, c.y + 0.36, c.z]} />
        ))}
      </Instances>

      {/* The hall's single warm light, relocated from mid-air to the fixture
          that is now visibly producing it. */}
      <pointLight position={[0, hangY + 0.3, 0]} color="#ffe4c4" intensity={22} distance={26} decay={2} />
    </group>
  )
}
