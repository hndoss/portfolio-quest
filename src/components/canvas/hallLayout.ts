/**
 * The central hall's dimensions and fixed placements, in one place.
 *
 * These numbers used to live twice — `CentralHall.tsx` had `ROOM_SIZE`, and
 * `HallDressing.tsx` had its own `ROOM_SIZE` plus a `WALL_FACE` derived from
 * it by hand. Changing the room meant finding both copies and every literal
 * that had been measured against them, which is exactly the failure mode
 * `public/data/viewpoints.json` already has. One module, one source.
 *
 * The hall is 16 x 12 rather than the original 20 x 20. What made it read as
 * too big was never the footprint, it was the 18m of bare floor between the
 * entrance camera and a blank far wall; at 12m deep that sightline is 11m and
 * the fireplace at the end of it is a presence rather than a detail. Keeping
 * the walls at 6m while shrinking the floor takes the proportion from 1:3.3 to
 * 1:2.7, so the room gets smaller and taller-feeling at the same time.
 */

export const HALL_WIDTH = 16
export const HALL_DEPTH = 12
export const HALL_HEIGHT = 6
export const WALL_THICKNESS = 0.5

export const HALF_WIDTH = HALL_WIDTH / 2
export const HALF_DEPTH = HALL_DEPTH / 2

/** Inner surface of each wall — what dressing is measured from. */
export const FACE_X = HALF_WIDTH - WALL_THICKNESS / 2
export const FACE_Z = HALF_DEPTH - WALL_THICKNESS / 2

export const DOOR_WIDTH = 3
export const DOOR_HEIGHT = 4

export type WallId = 'north' | 'south' | 'east' | 'west'

export interface Wall {
  id: WallId
  /** Yaw that turns a component's local +Z into the room-facing normal. */
  yaw: number
  /** Length of the wall. Differs per axis now that the room is a rectangle. */
  span: number
  /** North is solid: it carries the fireplace. */
  door: boolean
  /** Wall-local offset `u` mapped into world XZ. */
  at: (u: number) => [number, number]
  /** Pilaster offsets along the wall, from its midpoint. */
  pilasters: number[]
}

/**
 * Pilaster offsets are hand-placed to clear what is already on each wall, not
 * evenly spaced — even spacing cut straight through the doorways and windows.
 *
 * South (16): the inner pair at 3.2 clears the doorway surround, which reaches
 * 1.65.
 * Short walls (12): only an outer pair fits. The doorway takes the middle and
 * the two windows at z = +/-3 take everything between.
 *
 * North has none at all. It is the wall the entrance camera looks straight at,
 * and it was carrying four pilasters plus a fireplace plus an hourglass plus
 * two corner pillars — too many verticals to read as anything but a picket
 * fence. It was also wrong twice over: the abacus is 1.18 wide, so the outer
 * pilaster spanned 5.41-6.59 and the corner pillar 5.80-6.80, two pieces of
 * stone occupying the same space; and the inner one cleared the fireplace
 * mantel by 0.21. Removing them leaves the fireplace and the hourglass as the
 * only things on the wall, which is what a focal wall wants. The cornice still
 * runs across the top, so the room keeps the scale cue the colonnade was there
 * to give. (The corner pillars used to bracket the ends as well; see the note
 * where `PILLAR_AT` was, below.)
 */
const SOUTH_WALL_PILASTERS = [-6.0, -3.2, 3.2, 6.0]
const SHORT_WALL_PILASTERS = [-5.0, 5.0]

export const WALLS: Wall[] = [
  {
    id: 'north',
    yaw: 0,
    span: HALL_WIDTH,
    door: false,
    at: (u) => [u, -FACE_Z],
    pilasters: [],
  },
  {
    id: 'south',
    yaw: Math.PI,
    span: HALL_WIDTH,
    door: true,
    at: (u) => [u, FACE_Z],
    pilasters: SOUTH_WALL_PILASTERS,
  },
  {
    id: 'east',
    yaw: -Math.PI / 2,
    span: HALL_DEPTH,
    door: true,
    at: (u) => [FACE_X, u],
    pilasters: SHORT_WALL_PILASTERS,
  },
  {
    id: 'west',
    yaw: Math.PI / 2,
    span: HALL_DEPTH,
    door: true,
    at: (u) => [-FACE_X, u],
    pilasters: SHORT_WALL_PILASTERS,
  },
]

/**
 * Lifts a wall-local offset (along the wall, height, depth into the room) into
 * world space. Only Y-rotation is involved, so the full matrix reduces to this.
 */
export function place(
  wall: Wall,
  u: number,
  y: number,
  depth: number
): [number, number, number] {
  const [x, z] = wall.at(u)
  return [x + depth * Math.sin(wall.yaw), y, z + depth * Math.cos(wall.yaw)]
}

/* --- fixed placements ------------------------------------------------- */

/**
 * `DESK_AT` is gone with the desk. Two rules it cost us are worth keeping,
 * because the floor it stood on is still empty and whatever goes there next
 * will be tempted to break both:
 *
 * 1. **Nothing stands on the entrance axis.** Centred at x 0 the desk cut the
 *    fire off at roughly 0.7m, reducing the room's focal point to a glow over a
 *    countertop. The profile pedestal made the same mistake from the other
 *    direction. The fireplace closes that axis; nothing else may sit in it.
 * 2. **Nothing sits close to the camera.** The entrance camera is at z 5.2 and
 *    anything within ~2m of it fills the bottom of the frame. That is why the
 *    compass rose had to go behind the desk rather than in front of it.
 */
export const CHANDELIER_AT: [number, number, number] = [0, 4.15, -1.2]

/**
 * `COMPASS_AT` / `COMPASS_SCALE` are gone with the floor inlay.
 *
 * It never read as a compass. Two annuli — r 1.75-2.00 and r 1.00-1.25 — around
 * an empty 1m-radius centre, with four 0.4m cone markers in the gap between
 * them: no needle, no star, nothing in the middle. At 7.6m from the camera it
 * read as two circles on the floor, which is what it was.
 *
 * Its function had also gone. The four cones were colour-keyed to the
 * `AreaPlaque` over each doorway, making it a signpost to the four navigation
 * orbs; travel is the HUD castle map now and the orbs are deleted. Two of the
 * four colours (`#00ff88`, `#87ceeb`) were the old generic HUD palette and
 * belonged to nothing in the room.
 *
 * The floor here is for the runner instead. The one thing worth keeping from
 * the old note: at z 3.4 the entrance camera stood *inside* the inlay, because
 * anything on this floor within ~2m of the lens fills the bottom of the frame.
 */

/**
 * Two braziers, down from four.
 *
 * The corners needed fire when they were the darkest part of the frame and
 * nothing else in the room was burning. The hearth is the fire now, so these
 * flank the approach to it instead of hiding in the corners. Pulled in from
 * x = 6.3 because at the room's full half-width they sat on the frame edge
 * and only half a bowl was ever visible.
 */
export const BRAZIER_AT: [number, number][] = [
  [-5.4, -3.4],
  [5.4, -3.4],
]

/**
 * `PILLAR_AT` is gone. Four free-standing corner pillars, laid out for the old
 * 20 x 20 room and never re-measured for a 16 x 12 one.
 *
 * The north pair stood 1.45m in from the side wall, which put each of them
 * 0.7m along from that wall's pilaster at z +/-5. From the entrance camera
 * those project to 33.5 and 37.2 degrees off-axis; with `fov: 75` on a 16:9
 * window the horizontal half-angle is 53.75, so the two shafts landed 3.4% of
 * the screen width apart — roughly 66px at 1080p. Two stone verticals of near
 * identical height and profile, side by side. The same doubling that got the
 * north wall's pilasters removed, rotated into the corner.
 *
 * The south pair was worse: visible half-width at the camera's z is
 * `(5.2 - z) * 1.3643`, which at z 4.3 is 1.23m. They sat at |x| 6.3 and were
 * never in frame at all — four meshes each, drawn every frame, never seen.
 *
 * Nothing structural is lost. The cornice runs all four walls and the
 * colonnade carries the order; in a hall this size a pillar 1.45m off the wall
 * holds nothing up.
 */

/**
 * Windows are on the side walls only. The north wall is the fireplace, and
 * lighting the wall a fire stands against is self-defeating — the fire needs
 * somewhere dark to be bright in.
 */
export const WINDOW_AT: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [-(FACE_X - 0.15), 3.2, -3], rotation: [0, Math.PI / 2, 0] },
  { position: [-(FACE_X - 0.15), 3.2, 3], rotation: [0, Math.PI / 2, 0] },
  { position: [FACE_X - 0.15, 3.2, -3], rotation: [0, -Math.PI / 2, 0] },
  { position: [FACE_X - 0.15, 3.2, 3], rotation: [0, -Math.PI / 2, 0] },
]

/**
 * Between the inner and outer pilasters on the long walls.
 *
 * Both north sconces are gone: the hourglass took the east bay and the
 * tapestry the west, and each sconce sat at y 3 dead centre of its bay.
 *
 * What is left is worth knowing about — both remaining sconces are at
 * z = +5.6, on the south wall, which is *behind* the entrance camera at
 * z 5.2. Neither is ever seen. They are kept because the south wall is a
 * viewpoint away from being looked at, but nothing should be tuned against
 * them.
 */
export const SCONCE_AT: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [-4.5, 3, FACE_Z - 0.15], rotation: [0, Math.PI, 0] },
  { position: [4.5, 3, FACE_Z - 0.15], rotation: [0, Math.PI, 0] },
]

/* --- furniture -------------------------------------------------------- */

/**
 * Everything below is placed against one constraint: visible half-width from
 * the entrance camera is `(5.2 - z) * 1.3643` — `fov: 75` on a 16:9 window.
 * At the north wall that is 14.9m, so the whole far wall is in shot; at z 2.4
 * it has collapsed to 3.8m. Anything at |x| > 4 has to live north of z ~1.5 or
 * it simply is not on screen.
 *
 * The two standing rules from the desk still hold: nothing on the entrance
 * axis, nothing within ~2m of the lens.
 */

/**
 * Runner from the doorway to the hearth slab.
 *
 * It starts at z 5.7, half a metre *behind* the camera, so the rug has no
 * visible near edge — it flows out from under the viewer the way an entrance
 * runner does. It stops at the hearth slab, which reaches z -4.25.
 */
export const RUNNER_W = 2.4
export const RUNNER_FROM = 5.7
export const RUNNER_TO = -4.3

/**
 * Two chairs turned on the fire at (0, -4.9), flanking the runner.
 *
 * Yaw is `atan2(dx, dz)` toward the hearth, not eyeballed: a chair a few
 * degrees off reads as knocked askew rather than arranged. They sit at |x| 2.0
 * so their 0.76m footprints clear the runner's 1.2 edge by 0.42.
 */
export const HEARTH_CHAIR_AT: { position: [number, number, number]; yaw: number }[] = [
  { position: [-2.0, 0, -1.6], yaw: 2.596 },
  { position: [2.0, 0, -1.6], yaw: -2.596 },
]

/** Beside the west chair, not between the two — between them is the aisle. */
export const HEARTH_TABLE_AT: [number, number, number] = [-3.2, 0, -1.5]
export const HEARTH_TABLE_YAW = 2.596

/**
 * Refectory table down the east flank, balancing the hourglass above it.
 *
 * Pulled north to z -0.3 so that at its outer edge (x 4.95) only the last
 * 0.13m falls outside the frustum; at the original z 0.3 it lost 0.73m.
 */
export const REFECTORY_AT: [number, number, number] = [4.4, 0, -0.3]
export const REFECTORY_TOP = 0.78
export const BENCH_AT: [number, number, number] = [3.35, 0, -0.3]
export const CANDLESTICK_Z = [-1.5, -0.3, 0.9]
/** Height of the wick above the floor: table top plus the candlestick. */
export const CANDLE_FLAME_Y = REFECTORY_TOP + 0.44

/**
 * Hearth dressing.
 *
 * The andirons stand at z -4.7, which is *south* of the flame quads at
 * z -4.89 — in front of the fire, not behind it. That is the whole point of
 * them: a dark shape against the brightest thing in the room costs nothing and
 * buys a contrast edge no light can. They sit on the hearth slab, top y 0.14.
 *
 * The .glb's billet bar runs +Y in Blender, which is -Z here, so it already
 * points back into the firebox with no placement rotation.
 */
export const ANDIRON_AT: [number, number, number][] = [
  [-1.0, 0.14, -4.7],
  [1.0, 0.14, -4.7],
]
/** Off the slab, which reaches |x| 1.8 — these stand on the floor beside it. */
export const LOG_BASKET_AT: [number, number, number] = [2.35, 0, -4.6]
export const FIRE_IRONS_AT: [number, number, number] = [-2.35, 0, -4.6]

/**
 * Tapestry in the north-west bay, mirroring the hourglass in the east one.
 *
 * This is the only wide free wall the camera can see. The side walls measure
 * out at 0.55m and 0.61m between pilaster, window and doorway — see BANNER_AT.
 */
export const TAPESTRY_AT: [number, number, number] = [-4.1, 0, -(FACE_Z - 0.06)]
export const TAPESTRY_W = 2.3
export const TAPESTRY_TOP = 5.2
export const TAPESTRY_BOTTOM = 1.5

/**
 * Banners, in what the side walls actually leave.
 *
 * Measured rather than assumed: the pilaster abacus is 1.18 wide and centred
 * at z +/-5, so it spans 4.41-5.59; the window with its mullions spans
 * 2.20-3.80; the doorway with its timber surround spans -1.65 to 1.65. The
 * free strips are 0.55m and 0.61m. A tapestry does not fit in 0.61m — a banner
 * does, at 0.45 wide with 8cm clearance either side.
 *
 * Only the two north strips per wall are used. The southern pair would need
 * |x| 7.69 to be visible at z +1.95, and the frustum only reaches 4.4 there.
 */
/**
 * Painted wall panels — the ornament layer, not geometry.
 *
 * Three placements, ordered by how much of the frame they own:
 *
 * 1. **The overmantel.** The chimney breast is 3.2 wide and runs y 3.08 to
 *    5.25, dead centre of the only sightline the room has. It was blank stone.
 *    This is the most-looked-at surface in the hall.
 * 2 & 3. **The north corners.** With the corner pillars gone and the north
 *    pilasters gone before them, the wall runs clear from the tapestry's edge
 *    at x -5.25 to the side wall at -7.75, and from the hourglass frame at
 *    5.15 to 7.75. Two 2.5m-wide blanks either side of the focal wall.
 *
 * Each stands slightly proud of the surface behind it — 0.03 off the wall,
 * 0.015 off the breast — because a panel flush with its ground z-fights, and
 * because a shadow line under the moulding is what says "applied" instead of
 * "printed on".
 */
export const WALL_PANEL_AT: { position: [number, number, number]; size: [number, number] }[] = [
  { position: [0, 4.385, -4.985], size: [2.6, 1.33] },
  { position: [-6.5, 3.1, -(FACE_Z - 0.03)], size: [2.2, 4.0] },
  { position: [6.45, 3.1, -(FACE_Z - 0.03)], size: [2.2, 4.0] },
]

export const BANNER_W = 0.45
export const BANNER_AT: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [-(FACE_X - 0.06), 3.6, -1.95], rotation: [0, Math.PI / 2, 0] },
  { position: [-(FACE_X - 0.06), 3.6, -4.1], rotation: [0, Math.PI / 2, 0] },
  { position: [FACE_X - 0.06, 3.6, -1.95], rotation: [0, -Math.PI / 2, 0] },
  { position: [FACE_X - 0.06, 3.6, -4.1], rotation: [0, -Math.PI / 2, 0] },
]

/**
 * The hourglass, in the north wall's east bay.
 *
 * With the north pilasters gone the bay runs clear from the fireplace mantel
 * at x 2.4 to what was then the corner pillar at x 5.8 — 3.4 wide, midpoint
 * 4.1. That is more than double the 1.62 the pilasters used to leave, which is
 * what let the glass get wider rather than just taller. The pillar has since
 * gone too, so the bay now runs to the east wall; the hourglass stays where it
 * was placed, since 4.15 still centres it between mantel and corner.
 *
 * The component builds itself with local +Z pointing into the room, which is
 * already the north wall's facing, so it needs no rotation.
 */
export const HOURGLASS_AT: [number, number, number] = [4.15, 0, -FACE_Z]

/**
 * What clicking the hourglass opens.
 *
 * Not an area in `cv.json` but a view of its own, because the object is an
 * instrument for measuring time: it answers how long, and nothing else. It
 * used to open `central-hall` — about-me, core-expertise and philosophy —
 * which is a general introduction wearing an hourglass as a button.
 *
 * That area is still in `cv.json` and still reachable through
 * `getContentById`; it is simply no longer behind this object.
 */
export const HOURGLASS_CONTENT_ID = 'time'
