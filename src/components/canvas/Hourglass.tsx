import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
  type Texture,
  Vector2,
} from 'three'
import { useGameStore } from '../../stores/gameStore'
import { HOURGLASS_AT, HOURGLASS_CONTENT_ID } from './hallLayout'
import { beginHover, endHover } from './hoverCursor'
import { surfaceMaps } from './textures'

/**
 * A monumental hourglass set into the north wall, east of the fireplace.
 *
 * This is the hall's one piece of content. Everything else in the room is
 * architecture or wayfinding; clicking the glass opens the profile panel.
 *
 * Deliberately the only vertical in a room made of horizontals: mantel,
 * cornice, hearth and floor inlay all run across the frame, so five metres of
 * uninterrupted rise reads instantly from the entrance eleven metres away.
 *
 * It is also the only thing in the hall that announces itself as clickable.
 * The room has no floating info orbs, so the affordance has to come from the
 * object — hence the aura and the drifting motes, which are the signal that
 * something here responds, not decoration.
 */

/* --- deterministic jitter --------------------------------------------- */

/**
 * Seeded PRNG. Particle layouts must not reshuffle when the area remounts —
 * the same reason the logs and coals in `Fireplace.tsx` are hand-written
 * arrays rather than `Math.random()`.
 */
function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* --- soft sprites ------------------------------------------------------ */

const sprites = new Map<string, Texture>()

/**
 * A radial falloff in a canvas, used both for the mote sprites and for the
 * aura behind the glass.
 *
 * `PointsMaterial` draws hard-edged squares without one, and a square particle
 * is the single most recognisable tell of an untextured particle system.
 * `power` shapes the falloff: 1 is linear and hazy, 3 is a tight core with a
 * long tail, which is what a glowing mote wants.
 */
function radialSprite(power: number, size = 64): Texture {
  const key = `${power}:${size}`
  const cached = sprites.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)
  const mid = (size - 1) / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - mid, y - mid) / mid
      const a = Math.max(0, 1 - d) ** power
      const i = (y * size + x) * 4
      image.data[i] = image.data[i + 1] = image.data[i + 2] = 255
      image.data[i + 3] = Math.round(a * 255)
    }
  }

  ctx.putImageData(image, 0, 0)
  const texture = new CanvasTexture(canvas)
  sprites.set(key, texture)
  return texture
}

/* --- the alcove ------------------------------------------------------- */

/**
 * The surround projects into the room instead of cutting into the wall.
 *
 * three.js has no CSG, so a recess cannot be subtracted from the wall slab.
 * The read comes from depth instead: a dark back panel sitting on the wall
 * face, and an architrave standing proud of it. At the entrance camera's
 * distance that difference is the whole illusion.
 */
const REVEAL_D = 0.6

const OPENING_W = 1.6
const JAMB_W = 0.2
const FRAME_W = OPENING_W + JAMB_W * 2
const JAMB_X = OPENING_W / 2 + JAMB_W / 2

const SILL_H = 0.28
const OPENING_TOP = 5.0
const OPENING_H = OPENING_TOP - SILL_H
const OPENING_MID = (SILL_H + OPENING_TOP) / 2
const LINTEL_H = 0.22

/* --- the glass -------------------------------------------------------- */

const BULB_H = 1.9
const NECK_H = 0.2
const WAIST_R = 0.07
const GLASS_H = BULB_H * 2 + NECK_H

/** Bottom of the glass, measured from the floor of the alcove. */
const GLASS_BASE = SILL_H + 0.3
const WAIST_Y = GLASS_BASE + BULB_H

/**
 * Half-silhouette of one bulb, from its outer end (t = 0) to the waist
 * (t = 1). Curved rather than conical: a pair of cones reads as two funnels
 * stacked mouth to mouth, and the swell at the shoulder is most of what makes
 * the shape legible as an hourglass at all.
 *
 * Widened from a 0.53 max radius once the north pilasters came out. The bay
 * they used to bracket was 1.62 across; it is 3.4 now, and at the old width
 * the glass read as a thin tube in a large frame.
 */
const BULB: [number, number][] = [
  [0.0, 0.66],
  [0.08, 0.685],
  [0.2, 0.7],
  [0.35, 0.695],
  [0.5, 0.66],
  [0.64, 0.595],
  [0.76, 0.5],
  [0.86, 0.37],
  [0.94, 0.21],
  [1.0, WAIST_R],
]

/**
 * Flattened on Z so a 1.4-deep object fits a 0.6-deep alcove.
 *
 * The camera never moves — `viewpoints.json` fixes it at the entrance — so
 * depth compression is unobservable, and the alternative was either an alcove
 * projecting a metre into the room or an hourglass too small to be monumental.
 * This is the trick relief sculpture has always used.
 */
const SQUASH = 0.42

/* --- the sand --------------------------------------------------------- */

const PILE_H = 0.68
const PILE_R = 0.6
const PILE_TOP = GLASS_BASE + PILE_H

/**
 * Sand yet to fall, drawn as a truncated cone standing on the waist: wide and
 * flat on top, tapering into the neck. That funnel shape is what sand in a
 * partly-drained bulb actually forms, and one primitive gets it exactly.
 */
const TOP_SAND_H = 1.2
const TOP_SAND_R = 0.66

/** Drop from the waist to the top of the pile. */
const FALL_H = WAIST_Y - PILE_TOP

const SAND_COLOR = '#d9a441'

/* --- particles -------------------------------------------------------- */

/**
 * Few and slow, on purpose.
 *
 * There used to be a solid cylinder here with a scrolling grain texture, plus
 * 44 fast points on top of it. Together they read as a rod being extruded —
 * continuous, and far too quick for an instrument that is supposed to be
 * measuring years. An hourglass counting a career should barely appear to
 * move. Fourteen grains crossing 1.22m at roughly half a metre per second is
 * one arriving every fifth of a second: a trickle you can follow individually,
 * which is the whole point of sand as a metaphor for time.
 */
const GRAIN_COUNT = 14
const GRAIN_SPEED_MIN = 0.32
const GRAIN_SPEED_RANGE = 0.23

const MOTE_COUNT = 150

function glassProfile(): Vector2[] {
  const points: Vector2[] = []

  // Lower bulb: outer end up to the waist.
  for (const [t, r] of BULB) points.push(new Vector2(r, t * BULB_H))

  // Neck.
  points.push(new Vector2(WAIST_R, BULB_H + NECK_H))

  // Upper bulb: waist back out. Starts one entry in — the reversed list would
  // otherwise repeat the neck point and lathe a ring of degenerate faces.
  for (let i = BULB.length - 2; i >= 0; i--) {
    const [t, r] = BULB[i]
    points.push(new Vector2(r, BULB_H + NECK_H + (1 - t) * BULB_H))
  }

  return points
}

/**
 * A dome rather than a cone.
 *
 * The pile was a `cylinderGeometry` taper, which gives a mathematically
 * straight slope — the one silhouette a heap of sand never has. Real spoil
 * slumps: steep at the apex, flattening as it spreads to the angle of repose.
 * A lathe over a curved profile costs the same and fixes it.
 */
function pileProfile(): Vector2[] {
  const points: Vector2[] = []
  const steps = 9
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    points.push(new Vector2(PILE_R * (1 - t ** 1.9), PILE_H * t ** 0.72))
  }
  return points
}

interface ParticleFieldProps {
  lit: boolean
}

/**
 * Grains falling inside the glass, one at a time.
 *
 * These are the entire stream — there is no cylinder behind them any more.
 * They live inside the squashed group, so their spread is flattened with
 * everything else, and they cost one draw call between them.
 */
function FallingGrains({ lit }: ParticleFieldProps) {
  const points = useRef<Points>(null)

  const { geometry, speed } = useMemo(() => {
    const random = rng(0x5a17)
    const position = new Float32Array(GRAIN_COUNT * 3)
    const rate = new Float32Array(GRAIN_COUNT)

    for (let i = 0; i < GRAIN_COUNT; i++) {
      // Evenly spaced down the drop rather than randomly placed, so the
      // spacing between arrivals is regular. Scattered starts clump, and a
      // clump of grains is a stream again.
      const t = (i + random() * 0.35) / GRAIN_COUNT

      // Barely any lateral spread. Sand leaving a neck falls almost straight;
      // the slight widening near the bottom is the stream fraying as it slows.
      const spread = 0.02 + (1 - t) * 0.07
      position[i * 3] = (random() - 0.5) * spread
      position[i * 3 + 1] = PILE_TOP + t * FALL_H
      position[i * 3 + 2] = (random() - 0.5) * spread
      rate[i] = GRAIN_SPEED_MIN + random() * GRAIN_SPEED_RANGE
    }

    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(position, 3))
    return { geometry: geom, speed: rate }
  }, [])

  useFrame((_, delta) => {
    const attr = points.current?.geometry.attributes.position
    if (!attr) return
    const array = attr.array as Float32Array

    for (let i = 0; i < GRAIN_COUNT; i++) {
      const y = i * 3 + 1
      array[y] -= speed[i] * delta
      // Recycled at the waist rather than respawned, so the column never
      // thins out and never has to allocate.
      if (array[y] < PILE_TOP) array[y] += FALL_H
    }

    attr.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={3}>
      <pointsMaterial
        map={radialSprite(2)}
        color={lit ? '#ffe0a0' : SAND_COLOR}
        size={0.1}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

/**
 * Motes drifting up the alcove, outside the glass.
 *
 * These are the affordance. The hall has no info orbs, so nothing else in the
 * room signals that an object can be clicked; slow upward motion in an
 * otherwise static frame is what draws the eye, and it reads as atmosphere
 * rather than as UI.
 *
 * Rising, not falling. Sand falls inside the glass — motes doing the same
 * outside it would read as a leak.
 */
function AuraMotes({ lit }: ParticleFieldProps) {
  const points = useRef<Points>(null)

  const { geometry, speed, phase, baseX } = useMemo(() => {
    const random = rng(0x2c91)
    const position = new Float32Array(MOTE_COUNT * 3)
    const rate = new Float32Array(MOTE_COUNT)
    const offset = new Float32Array(MOTE_COUNT)
    const home = new Float32Array(MOTE_COUNT)

    for (let i = 0; i < MOTE_COUNT; i++) {
      // Spread across the full alcove opening and the full depth in front of
      // the glass, not a band in the middle of it. The field has to envelop
      // the instrument — motes confined to the centre read as a plume rising
      // off it, which is a different thing entirely.
      const x = (random() - 0.5) * OPENING_W
      home[i] = x
      position[i * 3] = x
      position[i * 3 + 1] = SILL_H + random() * OPENING_H
      position[i * 3 + 2] = 0.06 + random() * (REVEAL_D + 0.3)
      rate[i] = 0.09 + random() * 0.2
      offset[i] = random() * Math.PI * 2
    }

    const geom = new BufferGeometry()
    geom.setAttribute('position', new BufferAttribute(position, 3))
    return { geometry: geom, speed: rate, phase: offset, baseX: home }
  }, [])

  useFrame((state, delta) => {
    const attr = points.current?.geometry.attributes.position
    if (!attr) return
    const array = attr.array as Float32Array
    const t = state.clock.elapsedTime
    const rise = lit ? 2.1 : 1

    for (let i = 0; i < MOTE_COUNT; i++) {
      const y = i * 3 + 1
      array[y] += speed[i] * delta * rise
      if (array[y] > OPENING_TOP) array[y] = SILL_H

      // Lateral sway keeps them from climbing in parallel lines, which is what
      // makes a particle field look like a grid scrolling.
      array[i * 3] = baseX[i] + Math.sin(t * 0.55 + phase[i]) * 0.11
    }

    attr.needsUpdate = true
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false} renderOrder={5}>
      <pointsMaterial
        map={radialSprite(2.6)}
        color={lit ? '#bff2ea' : '#7fd4cc'}
        size={lit ? 0.1 : 0.07}
        sizeAttenuation
        transparent
        opacity={lit ? 1 : 0.75}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

export default function Hourglass() {
  const [hovered, setHovered] = useState(false)
  const aura = useRef<MeshBasicMaterial>(null)
  const auraMesh = useRef<Mesh>(null)
  const setActiveInfoPoint = useGameStore((state) => state.setActiveInfoPoint)
  const activeInfoPoint = useGameStore((state) => state.activeInfoPoint)
  const isActive = activeInfoPoint === HOURGLASS_CONTENT_ID

  const profile = useMemo(() => glassProfile(), [])
  const pile = useMemo(() => pileProfile(), [])

  const lit = hovered || isActive

  useFrame((state) => {
    // Slow breath on the aura. Deliberately off any round number so it never
    // syncs with the flipbook fire across the room, which would read as the
    // whole scene pulsing on one clock.
    const material = aura.current
    if (material) {
      const breath = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.73)
      const base = lit ? 0.5 : 0.26
      material.opacity = base + breath * (lit ? 0.16 : 0.09)
    }
    if (auraMesh.current) {
      const breath = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.73)
      auraMesh.current.scale.setScalar(1 + breath * 0.04 + (lit ? 0.06 : 0))
    }
  })

  const handleClick = () => {
    setActiveInfoPoint(isActive ? null : HOURGLASS_CONTENT_ID)
  }

  const handlePointerOver = () => {
    setHovered(true)
    beginHover()
  }

  const handlePointerOut = () => {
    setHovered(false)
    endHover()
  }

  const brass = (
    <meshStandardMaterial
      color={lit ? '#e8c14a' : '#c9a227'}
      metalness={0.9}
      roughness={0.24}
    />
  )

  /**
   * Flat colour, no map.
   *
   * The sand used to take the shared stone grain, which multiplies the base
   * colour by a noise tile — fine on a 4m wall, wrong here. The pile is a
   * lathe and the upper mass a cylinder, so the same texture landed at two
   * different densities on two shapes touching the same material, and the two
   * halves of one body of sand read as two different colours. Sand at this
   * distance wants to be one value.
   */
  const sand = (
    <meshStandardMaterial
      color={SAND_COLOR}
      emissive="#7a4a12"
      emissiveIntensity={lit ? 0.5 : 0.3}
      roughness={0.92}
      metalness={0}
    />
  )

  return (
    <group position={HOURGLASS_AT}>
      {/* Back panel, on the wall face and a hair proud of it so the two do not
          z-fight. Near-black: the recess has to read as depth, and the only
          cue available at this distance is value. It also has to be dark for
          the aura in front of it to register — additive blending adds to
          whatever is behind, so a lit wall would swallow the glow. */}
      <mesh position={[0, OPENING_MID, 0.015]}>
        <boxGeometry args={[OPENING_W, OPENING_H, 0.03]} />
        <meshStandardMaterial color="#14100c" roughness={1} metalness={0} />
      </mesh>

      {/* The aura. A single soft quad against the dark panel, breathing on a
          slow cycle. Cheaper and steadier than a light: a pointLight here
          would compile into every material in the scene for one glow that
          only ever falls on a 1.6m panel. */}
      <mesh ref={auraMesh} position={[0, OPENING_MID, 0.05]}>
        <planeGeometry args={[OPENING_W * 1.05, OPENING_H * 0.98]} />
        <meshBasicMaterial
          ref={aura}
          map={radialSprite(1.5, 128)}
          color={lit ? '#9ff0e4' : '#3fa89e'}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Jambs */}
      {[-JAMB_X, JAMB_X].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, OPENING_MID, REVEAL_D / 2]}>
          <boxGeometry args={[JAMB_W, OPENING_H, REVEAL_D]} />
          <meshStandardMaterial color="#b19366" {...surfaceMaps('stone', JAMB_W, OPENING_TOP)} />
        </mesh>
      ))}

      {/* Lintel */}
      <mesh castShadow receiveShadow position={[0, OPENING_TOP + LINTEL_H / 2, REVEAL_D / 2]}>
        <boxGeometry args={[FRAME_W, LINTEL_H, REVEAL_D]} />
        <meshStandardMaterial color="#a08453" {...surfaceMaps('stone', FRAME_W, LINTEL_H)} />
      </mesh>

      {/* Sill, standing slightly proud of the jambs so it catches the key
          light as a horizontal — the same job the fireplace mantel does. */}
      <mesh castShadow receiveShadow position={[0, SILL_H / 2, REVEAL_D / 2 + 0.03]}>
        <boxGeometry args={[FRAME_W + 0.12, SILL_H, REVEAL_D + 0.06]} />
        <meshStandardMaterial color="#c6a877" {...surfaceMaps('stone', FRAME_W, SILL_H)} />
      </mesh>

      {/* Brass band across the lintel, echoing the pilaster bands, the cornice
          and the fireplace breast. */}
      <mesh position={[0, OPENING_TOP + LINTEL_H / 2, REVEAL_D + 0.01]}>
        <boxGeometry args={[FRAME_W - 0.1, 0.08, 0.04]} />
        <meshStandardMaterial color="#c9a227" metalness={0.88} roughness={0.22} />
      </mesh>

      {/* The hourglass itself, flattened on Z. Grouped so the squash applies to
          glass, sand and grains together and nothing drifts out of the rest. */}
      <group position={[0, 0, REVEAL_D * 0.52]} scale={[1, 1, SQUASH]}>
        {/* Brass plates top and bottom */}
        <mesh castShadow position={[0, GLASS_BASE - 0.15, 0]}>
          <cylinderGeometry args={[0.78, 0.83, 0.3, 22]} />
          {brass}
        </mesh>
        <mesh castShadow position={[0, GLASS_BASE + GLASS_H + 0.15, 0]}>
          <cylinderGeometry args={[0.83, 0.78, 0.3, 22]} />
          {brass}
        </mesh>

        {/* Three posts tying the plates together. Two would read as a frame
            seen edge-on; three is what an instrument of this kind has. */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle) => (
          <mesh
            key={angle}
            castShadow
            position={[Math.cos(angle) * 0.74, GLASS_BASE + GLASS_H / 2, Math.sin(angle) * 0.74]}
          >
            <cylinderGeometry args={[0.05, 0.05, GLASS_H, 8]} />
            {brass}
          </mesh>
        ))}

        {/* Sand already fallen — a slumped dome, not a cone. */}
        <mesh position={[0, GLASS_BASE, 0]}>
          <latheGeometry args={[pile, 22]} />
          {sand}
        </mesh>

        {/* Sand yet to fall. */}
        <mesh position={[0, WAIST_Y + TOP_SAND_H / 2, 0]}>
          <cylinderGeometry args={[TOP_SAND_R, 0.07, TOP_SAND_H, 22]} />
          {sand}
        </mesh>

        {/* The stream is nothing but the grains. Anything solid drawn between
            the bulbs is a rod, and a rod cannot fall grain by grain. */}
        <FallingGrains lit={lit} />

        {/* Glass last. Depth-write off so the sand and grains inside are not
            sorted away, and double-sided so the far wall of the bulb still
            catches a highlight. Tinted cool on purpose: the hearth owns the
            warm end of the palette, and a second warm glow beside it would
            flatten the split the whole room is built on. */}
        <mesh renderOrder={4} position={[0, GLASS_BASE, 0]}>
          <latheGeometry args={[profile, 28]} />
          <meshStandardMaterial
            color="#9fd8d2"
            emissive="#2e6f72"
            emissiveIntensity={lit ? 0.55 : 0.3}
            transparent
            opacity={0.24}
            roughness={0.08}
            metalness={0.1}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Motes drift in front of the glass, outside the squash — they fill the
          alcove, not the instrument. */}
      <AuraMotes lit={lit} />

      {/* Hit target. A slab across the whole alcove rather than the glass
          itself: the lathe is mostly empty space and transparent besides, so
          picking it directly means hunting for a pixel that registers.
          Invisible meshes are skipped by the raycaster, hence opacity 0
          rather than `visible={false}`. */}
      <mesh
        position={[0, OPENING_MID, REVEAL_D * 0.75]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[OPENING_W, OPENING_H, 0.05]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
