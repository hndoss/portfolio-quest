import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  Color,
  type Mesh,
  NormalBlending,
  PlaneGeometry,
  type ShaderMaterial,
} from 'three'
import { FLAME_COLS, FLAME_FRAMES, FLAME_ROWS, flameAtlas } from './flameAtlas'

/**
 * Animated fire and its smoke.
 *
 * The flame has two implementations, selectable per instance so they can be
 * compared in place:
 *
 * - `flipbook` (default) samples a drawn sprite atlas — see `flameAtlas.ts`.
 *   Shapes, hard edges, licks that detach. This is what Fortiche actually do.
 * - `procedural` generates the flame per-pixel from noise. Kept because it is
 *   asset-free and tunes continuously, but noise gives *texture* where fire
 *   wants *shape*, and it never stops looking rendered.
 *
 * Both step to 12fps. Fortiche animate Arcane's hand-drawn fire and smoke on
 * twos against 24fps 3D; the stutter is the style, and a smoothly interpolated
 * flame reads as CG precisely *because* it is smooth.
 *
 * The smoke is procedural in both cases, and alpha-blended rather than
 * additive so it occludes. Fire without byproducts is the most commonly cited
 * reason an effect fails to convince — without it a flame reads as a gas pilot
 * light.
 *
 * Nothing here emits light. Every punctual light in three.js compiles into
 * every material in the scene, which is why this hall was cut from 27 lights
 * to 3; the flame clears the bloom threshold, and bloom sells it as a source.
 */

/** Unit quad, base at the origin, scaled per use. Shared by every fire. */
const BILLBOARD_GEOMETRY = new PlaneGeometry(1, 1, 1, 1)
BILLBOARD_GEOMETRY.translate(0, 0.5, 0)

/** Steps per second. 12 is Arcane's rate for hand-drawn elements. */
const STEP_FPS = 12

/* --------------------------- flipbook flame --------------------------- */

interface FlameProps {
  position: [number, number, number]
  width: number
  height: number
  seed: number
  intensity: number
}

function FlipbookFlame({ position, width, height, seed, intensity }: FlameProps) {
  const mesh = useRef<Mesh>(null)
  const frame = useRef(-1)

  // Cloned per fire so each can sit on a different frame. Clones share the
  // underlying `source`, so all four cost one GPU upload.
  const map = useMemo(() => {
    const texture = flameAtlas().clone()
    texture.needsUpdate = true
    texture.repeat.set(1 / FLAME_COLS, 1 / FLAME_ROWS)
    return texture
  }, [])

  // meshBasicMaterial multiplies its map by `color`, and a Color's channels
  // may exceed 1. That is the whole HDR boost — no custom shader needed to get
  // the flame over the bloom threshold.
  const tint = useMemo(() => new Color().setRGB(intensity, intensity, intensity), [intensity])

  const startFrame = useMemo(
    () => Math.round(seed * FLAME_FRAMES) % FLAME_FRAMES,
    [seed]
  )

  useFrame((state) => {
    const self = mesh.current
    if (!self) return

    // Cylindrical billboard: yaw toward the camera, upright axis untouched.
    // Cheaper than a vertex shader for four quads, and it leaves the material
    // as a stock meshBasicMaterial.
    const camera = state.camera.position
    self.rotation.y = Math.atan2(camera.x - position[0], camera.z - position[2])

    const next = (Math.floor(state.clock.elapsedTime * STEP_FPS) + startFrame) % FLAME_FRAMES
    if (next === frame.current) return
    frame.current = next

    // Texture v runs bottom-up while the atlas is laid out top-down, hence the
    // inversion on the row.
    map.offset.set(
      (next % FLAME_COLS) / FLAME_COLS,
      1 - (Math.floor(next / FLAME_COLS) + 1) / FLAME_ROWS
    )
  })

  return (
    <mesh
      ref={mesh}
      position={position}
      geometry={BILLBOARD_GEOMETRY}
      scale={[width, height, 1]}
      frustumCulled={false}
      renderOrder={3}
    >
      <meshBasicMaterial
        map={map}
        color={tint}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

/* -------------------------- procedural flame -------------------------- */

/**
 * Cylindrical billboarding done in the vertex shader, for the procedural
 * variant and the smoke. Building the quad from the camera's world-space right
 * vector keeps it facing the viewer; locking its vertical axis to world +Y
 * keeps it upright when the camera pitches.
 */
const VERTEX_SHADER = /* glsl */ `
  uniform float uWidth;
  uniform float uHeight;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Column 0 of the view matrix, read across rows, is the camera's right
    // vector in world space. Flattening y gives the cylindrical axis.
    vec3 right = normalize(vec3(viewMatrix[0][0], 0.0, viewMatrix[2][0]));
    vec3 origin = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

    vec3 world = origin
      + right * (position.x * uWidth)
      + vec3(0.0, position.y * uHeight, 0.0);

    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`

const NOISE = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  // Quantised to whole animation frames. The per-source seed goes in *before*
  // the floor so the four fires do not all step on the same tick, which would
  // read as the whole scene strobing.
  float steppedTime(float t, float seed, float fps) {
    return floor((t + seed * 37.0) * fps) / fps;
  }
`

const FLAME_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uFps;
  uniform float uBands;
  uniform vec3 uCore;
  uniform vec3 uMid;
  uniform vec3 uEdge;
  uniform float uIntensity;
  varying vec2 vUv;

  ${NOISE}

  void main() {
    float t = vUv.y;          // 0 at the coals, 1 at the tip
    float x = vUv.x - 0.5;
    float time = steppedTime(uTime, uSeed, uFps);

    float sway = (fbm(vec2(t * 1.8 - time * 0.8, uSeed)) - 0.5) * 0.30 * pow(t, 1.15);
    float breathe = 0.86 + 0.28 * fbm(vec2(time * 0.9, uSeed * 5.0));

    float wOuter = 0.90 * pow(t, 0.35) * pow(1.0 - t, 0.70) * breathe;
    float wInner = 0.55 * pow(t, 0.40) * pow(1.0 - t, 0.85) * breathe;

    float turbOuter = fbm(vec2(vUv.x * 3.2 + uSeed, t * 2.6 - time * 1.5));
    float turbInner = fbm(vec2(vUv.x * 4.5 + uSeed * 2.0, t * 3.4 - time * 2.3));

    float outer = clamp(
      1.0 - abs(x - sway) / max(wOuter, 1e-3) - turbOuter * 0.85 * pow(t, 1.25),
      0.0, 1.0
    );
    float inner = clamp(
      1.0 - abs(x - sway * 0.7) / max(wInner, 1e-3) - turbInner * 0.70 * t,
      0.0, 1.0
    );

    float alpha = smoothstep(0.06, 0.30, max(outer, inner * 1.15));
    if (alpha <= 0.002) discard;

    float heat = clamp(max(outer * 1.15, inner * 1.85) * (1.0 - t * 0.45), 0.0, 1.0);
    heat = floor(heat * uBands) / max(uBands - 1.0, 1.0);

    vec3 col = mix(uEdge, uMid, smoothstep(0.05, 0.55, heat));
    col = mix(col, uCore, smoothstep(0.55, 0.95, heat));

    float flicker = 0.88 + 0.24 * fbm(vec2(time * 2.4, uSeed * 11.0));

    gl_FragColor = vec4(col * uIntensity * flicker, alpha);
  }
`

function ProceduralFlame({ position, width, height, seed, intensity }: FlameProps) {
  const material = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: seed },
      uFps: { value: STEP_FPS },
      uBands: { value: 5 },
      uWidth: { value: width },
      uHeight: { value: height },
      uCore: { value: new Color('#fff3d0') },
      uMid: { value: new Color('#ffa326') },
      uEdge: { value: new Color('#c3300a') },
      uIntensity: { value: intensity },
    }),
    [seed, width, height, intensity]
  )

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh position={position} geometry={BILLBOARD_GEOMETRY} frustumCulled={false} renderOrder={3}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FLAME_FRAGMENT}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}

/* -------------------------------- smoke ------------------------------- */

const SMOKE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uFps;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uOpacity;
  varying vec2 vUv;

  ${NOISE}

  void main() {
    float t = vUv.y;          // 0 at the flame tip, 1 at the top of the plume
    float x = vUv.x - 0.5;
    float time = steppedTime(uTime, uSeed, uFps);

    // Domain warping — fbm displacing its own sample point. Straight scrolling
    // noise slides like a texture on a conveyor; warping it curls the puffs
    // around each other, which is what smoke actually does.
    vec2 p = vec2(vUv.x * 2.0 + uSeed, t * 1.6 - time * 0.35);
    vec2 q = vec2(fbm(p), fbm(p + 5.2));
    float n = fbm(p + q * 0.9);

    float w = 0.18 + 0.40 * pow(t, 0.7);
    float drift = (q.x - 0.5) * 0.3 * t;
    float body = (1.0 - abs(x + drift) / max(w, 1e-3)) * n * 1.7;

    body *= smoothstep(0.0, 0.22, t) * (1.0 - smoothstep(0.30, 0.85, t));

    // Thresholded rather than clamped, so the puffs have edges. A soft falloff
    // gives a photographic haze; a defined boundary is what reads as drawn.
    float alpha = smoothstep(0.12, 0.55, body) * uOpacity;
    if (alpha <= 0.003) discard;

    // Warm where the fire still lights it, cooling as it climbs. Held warm
    // deliberately long: smoke lit from below in an unlit corner is *lighter*
    // than its background, and a physically-plausible dark grey simply
    // disappeared against the shadowed wall.
    vec3 col = mix(uHot, uCool, smoothstep(0.05, 0.80, t));

    gl_FragColor = vec4(col, alpha);
  }
`

function Smoke({ position, width, height, seed }: Omit<FlameProps, 'intensity'>) {
  const material = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: seed + 0.5 },
      uFps: { value: STEP_FPS },
      uWidth: { value: width },
      uHeight: { value: height },
      // Darker than they look. A raw ShaderMaterial is not run through the
      // renderer's ACES tone mapping the way the rest of the scene is, so
      // these values land on screen brighter than the numbers suggest —
      // picked against the render, not on paper.
      uHot: { value: new Color('#7a5433') },
      uCool: { value: new Color('#2b2d33') },
      uOpacity: { value: 0.55 },
    }),
    [seed, width, height]
  )

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    // Drawn before the flame so the additive core lays over it, and
    // alpha-blended rather than additive so it actually occludes the wall
    // behind — additive smoke would brighten the dark corner instead of
    // shading it.
    <mesh position={position} geometry={BILLBOARD_GEOMETRY} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={SMOKE_FRAGMENT}
        transparent
        depthWrite={false}
        blending={NormalBlending}
      />
    </mesh>
  )
}

/* -------------------------------- fire -------------------------------- */

interface FireProps {
  /** World position of the base of the flame. */
  position: [number, number, number]
  width?: number
  height?: number
  /** Decorrelates one fire from the next — equal seeds animate in lockstep. */
  seed?: number
  /** Pushed above 1 so the core clears the Bloom pass's luminance threshold. */
  intensity?: number
  smoke?: boolean
  variant?: 'flipbook' | 'procedural'
}

export default function Fire({
  position,
  width = 1.6,
  height = 1.5,
  seed = 0,
  intensity = 1.9,
  smoke = true,
  variant = 'flipbook',
}: FireProps) {
  const Flame = variant === 'flipbook' ? FlipbookFlame : ProceduralFlame

  return (
    <group>
      {smoke && (
        <Smoke
          position={[position[0], position[1] + height * 0.55, position[2]]}
          width={width * 1.5}
          height={height * 1.5}
          seed={seed}
        />
      )}
      <Flame
        position={position}
        width={width}
        height={height}
        seed={seed}
        intensity={intensity}
      />
    </group>
  )
}
