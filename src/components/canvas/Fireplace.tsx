import Fire from './Fire'
import { FACE_Z } from './hallLayout'
import { surfaceMaps } from './textures'

/**
 * The hall's fireplace, centred on the solid north wall.
 *
 * This replaces the profile pedestal that used to stand at the centre of the
 * room. The pedestal's only job was anchoring an infoPoint, and it stood
 * directly between the entrance camera and the desk; a fireplace does the work
 * a centrepiece is supposed to do without occluding anything, because it is
 * against a wall rather than in the middle of the floor.
 *
 * Built from stacked boxes rather than a carved opening: three.js has no CSG,
 * and two jambs with a lintel across them produce the same silhouette for four
 * meshes instead of a boolean.
 */

/** Front face of the north wall. Everything here is measured from it. */
const WALL = -FACE_Z

const BREAST_W = 4.2
const BREAST_D = 0.9
const BREAST_Z = WALL + BREAST_D / 2

const OPENING_W = 2.4
const OPENING_H = 2.3

const JAMB_W = (BREAST_W - OPENING_W) / 2
const JAMB_X = OPENING_W / 2 + JAMB_W / 2

const LINTEL_H = 0.5
const LINTEL_Y = OPENING_H + LINTEL_H / 2

const MANTEL_H = 0.28
const MANTEL_D = 1.15
const MANTEL_Y = OPENING_H + LINTEL_H + MANTEL_H / 2

/**
 * Above the mantel the breast narrows and stops short of the cornice, which
 * runs the wall at y 5.41. A breast that ran the full height would push
 * through it.
 */
const UPPER_W = 3.2
const UPPER_D = 0.75
const UPPER_TOP = 5.25
const UPPER_BASE = OPENING_H + LINTEL_H + MANTEL_H
const UPPER_H = UPPER_TOP - UPPER_BASE

const HEARTH_W = 3.6
const HEARTH_D = 1.5

/**
 * The fire burns on a raised grate rather than on the floor of the firebox,
 * which is what a hearth this size would actually have, and keeps the flames
 * clear of the hearth slab in front of them.
 */
const GRATE_H = 0.45
const GRATE_TOP = GRATE_H

/**
 * Three flames of deliberately unequal size, spacing and depth.
 *
 * Two evenly-spaced identical quads read as one sprite drawn twice, which is
 * exactly what it looked like — a pair of matching candle flames rather than a
 * fire. A hearth fire is one mass with a dominant centre, so the middle flame
 * is the tallest and the outer two are shorter, dimmer, unevenly placed and
 * offset in depth so their silhouettes cross rather than sit side by side.
 *
 * Seeds are spread across the flipbook so no two are ever on the same frame.
 */
const FLAMES = [
  { x: -0.63, z: 0.82, w: 1.35, h: 1.35, intensity: 1.95, seed: 0.11 },
  { x: 0.04, z: 0.9, w: 1.95, h: 2.0, intensity: 2.4, seed: 0.61 },
  { x: 0.62, z: 0.86, w: 1.2, h: 1.15, intensity: 1.85, seed: 0.34 },
]

/** Fixed jitter — logs and coals must not reshuffle between renders. */
const LOGS: [number, number, number][] = [
  [-0.32, 0.14, -0.06],
  [0.3, 0.15, 0.05],
  [-0.02, 0.33, -0.02],
]

const COALS: [number, number, number][] = [
  [0.0, 0.05, 0.06],
  [0.34, 0.03, 0.12],
  [-0.36, 0.04, 0.02],
  [0.16, 0.02, -0.14],
  [-0.15, 0.06, -0.12],
]

export default function Fireplace() {
  const stone = (w: number, h: number, color: string) => (
    <meshStandardMaterial color={color} {...surfaceMaps('stone', w, h)} />
  )

  return (
    <group>
      {/* Jambs */}
      {[-JAMB_X, JAMB_X].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, OPENING_H / 2, BREAST_Z]}>
          <boxGeometry args={[JAMB_W, OPENING_H, BREAST_D]} />
          {stone(JAMB_W, OPENING_H, '#b19366')}
        </mesh>
      ))}

      {/* Lintel across the opening */}
      <mesh castShadow receiveShadow position={[0, LINTEL_Y, BREAST_Z]}>
        <boxGeometry args={[BREAST_W, LINTEL_H, BREAST_D]} />
        {stone(BREAST_W, LINTEL_H, '#a08453')}
      </mesh>

      {/* Mantel shelf. Stands proud of everything else, so it catches the key
          light as one long horizontal — the strongest line in the room. */}
      <mesh castShadow receiveShadow position={[0, MANTEL_Y, WALL + MANTEL_D / 2]}>
        <boxGeometry args={[BREAST_W + 0.6, MANTEL_H, MANTEL_D]} />
        {stone(BREAST_W + 0.6, MANTEL_H, '#c6a877')}
      </mesh>

      {/* Chimney breast above the mantel */}
      <mesh castShadow receiveShadow position={[0, UPPER_BASE + UPPER_H / 2, WALL + UPPER_D / 2]}>
        <boxGeometry args={[UPPER_W, UPPER_H, UPPER_D]} />
        {stone(UPPER_W, UPPER_H, '#b8965e')}
      </mesh>

      {/* Brass band on the breast, echoing the pilaster bands and the cornice */}
      <mesh position={[0, UPPER_BASE + 0.42, WALL + UPPER_D + 0.01]}>
        <boxGeometry args={[UPPER_W - 0.5, 0.1, 0.04]} />
        <meshStandardMaterial color="#c9a227" metalness={0.88} roughness={0.22} />
      </mesh>

      {/* Firebox liner: back, two sides and a top, leaving the front open.
          Deliberately near-black — the flames are additive, so whatever sits
          behind them sets how hot they read, and soot is the darkest thing
          available.

          It has to be a liner rather than a solid block. A block filling the
          opening is closer to the camera than the flames standing inside it,
          and since the fire depth-tests even though it does not depth-write,
          the box simply occluded the fire. Everything in here now sits in
          front of the liner and behind the jamb faces at WALL + 0.9. */}
      <mesh position={[0, OPENING_H / 2, WALL + 0.05]}>
        <boxGeometry args={[OPENING_W, OPENING_H, 0.1]} />
        <meshStandardMaterial color="#0e0a07" roughness={1} metalness={0} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (OPENING_W / 2 - 0.05), OPENING_H / 2, WALL + 0.45]}>
          <boxGeometry args={[0.1, OPENING_H, 0.9]} />
          <meshStandardMaterial color="#120d09" roughness={1} metalness={0} />
        </mesh>
      ))}
      <mesh position={[0, OPENING_H - 0.05, WALL + 0.45]}>
        <boxGeometry args={[OPENING_W, 0.1, 0.9]} />
        <meshStandardMaterial color="#0e0a07" roughness={1} metalness={0} />
      </mesh>

      {/* Hearth slab, projecting into the room */}
      <mesh castShadow receiveShadow position={[0, 0.07, WALL + HEARTH_D / 2]}>
        <boxGeometry args={[HEARTH_W, 0.14, HEARTH_D]} />
        {stone(HEARTH_W, HEARTH_D, '#8a6f45')}
      </mesh>

      {/* Grate the fire sits on. See GRATE_H — this exists so the desk does not
          eat the flames. */}
      <mesh castShadow receiveShadow position={[0, GRATE_H / 2, WALL + 0.45]}>
        <boxGeometry args={[OPENING_W - 0.24, GRATE_H, 0.8]} />
        <meshStandardMaterial color="#3a2f26" roughness={0.9} metalness={0.3} />
      </mesh>
      {/* Brass bars along its front, so it reads as a grate and not a step. */}
      {[-0.72, -0.24, 0.24, 0.72].map((x) => (
        <mesh key={x} position={[x, GRATE_H - 0.06, WALL + 0.87]}>
          <boxGeometry args={[0.07, 0.34, 0.07]} />
          <meshStandardMaterial color="#8a6a24" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}

      {/* Logs, lying across the grate */}
      {LOGS.map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, GRATE_TOP + y, WALL + 0.45 + z]} rotation={[0, i * 0.4 - 0.4, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.1, 1.15, 7]} />
          <meshStandardMaterial color="#4a3221" roughness={0.95} />
        </mesh>
      ))}

      {/* Coals. Emissive above 1 with toneMapped off, so the Bloom pass
          (luminanceThreshold 1.0) picks out exactly these. */}
      {COALS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, GRATE_TOP + 0.04 + y, WALL + 0.52 + z]}>
          <dodecahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#ff7a2a" emissive="#ff3c00" emissiveIntensity={2.1} toneMapped={false} />
        </mesh>
      ))}

      {/* Two flames rather than one wide one. A single quad scaled to fill the
          opening reads as a poster of a fire; two overlapping at different
          seeds cross each other's silhouettes and read as depth.

          Smoke is off: it would rise straight through the lintel. A real
          chimney draws it away, and there is nothing above the opening to
          draw it into. */}
      {FLAMES.map((f, i) => (
        <Fire
          key={i}
          position={[f.x, GRATE_TOP - 0.04, WALL + f.z]}
          width={f.w}
          height={f.h}
          intensity={f.intensity}
          seed={f.seed}
          smoke={false}
        />
      ))}

      {/* The room's second and last punctual light. Justified here in a way it
          was not at the pedestal: this is the focal point of the hall, and
          emissive alone throws nothing onto the hearth or the floor in front
          of it. Removing the pedestal light and the four infoPoint lights
          leaves the hall on two, down from six. */}
      <pointLight position={[0, GRATE_TOP + 0.35, WALL + 1.15]} color="#ff9a4a" intensity={10} distance={15} decay={2} />
    </group>
  )
}
