import { useState } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useNavigation } from '../../hooks/useNavigation'
import { AREA_BY_ID } from '../../data/areas'
import type { AreaId } from '../../types/game'

/**
 * The castle map: navigation for the whole world, in the corner of the screen.
 *
 * This replaces the glowing orbs that used to stand between rooms. In the hall
 * those orbs were the only exits, so removing them and adding this had to be
 * one change or the game became a locked room.
 *
 * The division of labour now is: **the map moves you between areas, orbs move
 * you within one**. That is why the hall ends up with no orbs at all — every
 * hotspot it had was a door to somewhere else — while the library still has its
 * arrows for walking from the entrance to the shelves.
 *
 * It is a cutaway elevation, not a floor plan. A plan would be the more honest
 * projection of the world coordinates (library at x -12..-30, forge at +12..+30,
 * pipelines and treasury running out along +z), but the two rooms that read as
 * vertical in the fiction — you *climb* to the observatory and *descend* to the
 * pipelines — both sit on the same north-south axis, so a plan puts them side by
 * side and throws that away. Sliced open from the side, the silhouette says
 * tower-hall-cellar-vault at a glance, which is the one thing the player needs
 * from a map this small.
 *
 * The geometry below is therefore hand-drawn and deliberately not derived from
 * `viewpoints.json`. Only the room *list* is shared (`data/areas.ts`); the
 * shapes are a diagram of the fiction, and tying them to world coordinates
 * would be a false precision that breaks the moment a room moves.
 */

/**
 * Rooms in draw order: outline, interior detail, and the marker anchor.
 *
 * `detail` is windows and doors, and it is drawn brighter the more of the
 * castle you have seen — a room you have visited has its lights on. That is the
 * whole discovery cue, and it costs one extra path per room.
 *
 * The tower went through a draft where its spire flared wider than its shaft.
 * The two notches that left at the spire's base read as arrow barbs and the
 * silhouette came out as a rocket rather than a castle. It needs a corbel band
 * between shaft and roof, and the roof must barely overhang.
 */
const ROOMS: { id: AreaId; path: string; detail: string; cx: number; cy: number }[] = [
  {
    id: 'observatory',
    // Roof, corbelled crown, then the shaft.
    path: 'M100 6 L122 34 L120 34 L120 44 L116 44 L116 78 L84 78 L84 44 L80 44 L80 34 L78 34 Z',
    detail: 'M96 52 h8 v14 h-8 Z',
    cx: 100,
    cy: 60,
  },
  {
    id: 'library',
    path: 'M8 94 H52 V140 H8 Z',
    detail: 'M17 106 h7 v13 h-7 Z M33 106 h7 v13 h-7 Z',
    cx: 30,
    cy: 117,
  },
  {
    id: 'central-hall',
    path: 'M52 78 H148 V140 H52 Z',
    // Arched front door, flanked by the two windows.
    detail: 'M92 140 v-13 a8 8 0 0 1 16 0 v13 Z M66 96 h8 v13 h-8 Z M126 96 h8 v13 h-8 Z',
    cx: 100,
    cy: 109,
  },
  {
    id: 'forge',
    path: 'M148 94 H192 V140 H148 Z',
    detail: 'M160 106 h7 v13 h-7 Z M176 106 h7 v13 h-7 Z',
    cx: 170,
    cy: 117,
  },
  {
    id: 'pipelines',
    path: 'M30 148 H170 V190 H30 Z',
    // Two runs of pipe rather than windows. It is a cellar.
    detail: 'M44 158 h52 v6 h-52 Z M104 174 h52 v6 h-52 Z',
    cx: 100,
    cy: 169,
  },
  {
    id: 'treasury',
    // Barrel vault, so the deepest room reads as a strongroom and not a cellar.
    path: 'M54 240 V214 A46 18 0 0 1 146 214 V240 Z',
    detail: 'M100 226 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 Z',
    cx: 100,
    cy: 226,
  },
]

/** Battlements. Three merlons a wing is enough to read as a castle. */
const MERLONS: [number, number][] = [
  [10, 88], [24, 88], [38, 88],       // library wing
  [154, 88], [168, 88], [182, 88],    // forge wing
  [56, 72], [68, 72], [124, 72], [136, 72], // hall roofline, either side of the tower
]

/**
 * Piltover brass against teal shadow, same as the world. The old HUD green
 * (#00ff88) belongs to nothing in the scene.
 */
const STATE_STYLE = {
  current: { fill: '#7a5a24', stroke: '#ffd27a', width: 2.4, dash: undefined, detail: '#ffe6b0', detailOpacity: 0.9 },
  visited: { fill: '#33291c', stroke: '#b8965e', width: 1.6, dash: undefined, detail: '#d8a94e', detailOpacity: 0.55 },
  unvisited: { fill: '#171410', stroke: '#5f5340', width: 1.4, dash: '4 3', detail: '#5f5340', detailOpacity: 0.18 },
} as const

const HOVER_STROKE = '#ffe6b0'

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    zIndex: 100,
    // The SVG is 200x250, so the panel is this wide and 1.25x that tall plus
    // the caption. One number to change if it wants to be bigger again.
    width: '240px',
    padding: '0.7rem 0.7rem 0.55rem',
    borderRadius: '8px',
    border: '1px solid #4a3c28',
    backgroundColor: 'rgba(12, 20, 24, 0.72)',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
    userSelect: 'none',
  },
  svg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
  },
  caption: {
    marginTop: '0.45rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    color: '#e8c88a',
    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
    // Fixed height so the panel does not jump as the caption changes.
    height: '1.2rem',
    lineHeight: '1.2rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

export default function CastleMap() {
  const [hovered, setHovered] = useState<AreaId | null>(null)
  const isLoading = useGameStore((state) => state.isLoading)
  const currentArea = useGameStore((state) => state.currentArea)
  const visitedAreas = useGameStore((state) => state.visitedAreas)
  const isTransitioning = useGameStore((state) => state.isTransitioning)
  const navigateTo = useGameStore((state) => state.navigateTo)
  const { viewpoints } = useNavigation()

  if (isLoading) return null

  const travel = (id: AreaId) => {
    if (id === currentArea || isTransitioning) return
    const target = AREA_BY_ID.get(id)?.defaultViewpoint
    // Guard rather than trust: the entry is hand-written and the viewpoint file
    // it names is hand-written too, with nothing linking them at compile time.
    if (target && viewpoints.some((v) => v.id === target)) navigateTo(target)
  }

  const stateOf = (id: AreaId) =>
    id === currentArea ? 'current' : visitedAreas.has(id) ? 'visited' : 'unvisited'

  // Unvisited rooms stay clickable. A map you carry shows the whole castle;
  // gating travel on having already been somewhere is what made QuickTravel
  // useless from a cold start, and with the orbs gone it would strand the
  // player in the hall permanently.
  const caption = AREA_BY_ID.get(hovered ?? currentArea)?.name ?? ''

  return (
    <div style={styles.panel}>
      <svg viewBox="0 0 200 250" style={styles.svg} aria-label="Castle map">
        {/* Ground line. Everything under it is cellar. */}
        <line
          x1="0"
          y1="144"
          x2="200"
          y2="144"
          stroke="#6b5a3e"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.7"
        />

        {/* Stairs down: hall to pipelines, pipelines to treasury. Decoration —
            the rooms themselves are the click targets. The first is off-centre
            so it does not come out of the hall's front door. */}
        <rect x="60" y="140" width="12" height="9" fill="#3a3021" />
        <rect x="94" y="190" width="12" height="9" fill="#3a3021" />

        {MERLONS.map(([x, y]) => (
          <rect key={`${x},${y}`} x={x} y={y} width="8" height="7" fill="#33291c" stroke="#7d6844" strokeWidth="1" />
        ))}

        {ROOMS.map((room) => {
          const state = stateOf(room.id)
          const style = STATE_STYLE[state]
          const isHovered = hovered === room.id

          return (
            <g key={room.id}>
              <path
                d={room.path}
                fill={style.fill}
                stroke={isHovered ? HOVER_STROKE : style.stroke}
                strokeWidth={isHovered ? style.width + 0.8 : style.width}
                strokeDasharray={style.dash}
                strokeLinejoin="round"
                style={{ cursor: room.id === currentArea ? 'default' : 'pointer' }}
                onClick={() => travel(room.id)}
                onPointerEnter={() => setHovered(room.id)}
                onPointerLeave={() => setHovered((prev) => (prev === room.id ? null : prev))}
              />

              {/* Lights on. Drawn over the outline, so it must not eat the
                  click — the outline path is the hit target. */}
              <path
                d={room.detail}
                fill={style.detail}
                fillOpacity={style.detailOpacity}
                pointerEvents="none"
              />

              {state === 'unvisited' && (
                <text
                  x={room.cx}
                  y={room.cy + 5}
                  textAnchor="middle"
                  fontSize="15"
                  fill="#8a7550"
                  pointerEvents="none"
                >
                  ?
                </text>
              )}

              {/* You are here. Animated in SMIL rather than useFrame or state:
                  a React re-render per frame for a pulsing dot is exactly the
                  mistake the old Cursor.tsx made. */}
              {state === 'current' && (
                <circle cx={room.cx} cy={room.cy} r="3.5" fill="#ffd27a" pointerEvents="none">
                  <animate attributeName="r" values="3;5.5;3" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      <div style={styles.caption}>{caption}</div>
    </div>
  )
}

/** Exported for tests: the map must draw every area exactly once. */
export const MAPPED_AREA_IDS = ROOMS.map((r) => r.id)
