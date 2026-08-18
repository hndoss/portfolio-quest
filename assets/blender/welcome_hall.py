"""Welcome-hall desk and its counter props.

    npm run models

Style: exaggerate the primary shape, simplify secondary detail, and round
every edge much harder than realism would. Precision reads as cold; chunky
beveled forms read as friendly and stay legible from across a room.

Prints three.js-space placements at the end — paste those into
src/components/canvas/WelcomeDesk.tsx when geometry moves.
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import (  # noqa: E402
    export_glb, finish, ground, join, lathe, primitive, render_preview,
    report, reset, setup_preview, soften,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
GLB_DIR = os.path.join(ROOT, "public", "models", "props")
BLEND_OUT = os.path.join(HERE, "welcome-hall.blend")
PREVIEW = os.path.join(HERE, "_preview.png")

reset()
os.makedirs(GLB_DIR, exist_ok=True)


# --- service bell ------------------------------------------------------------

def build_bell():
    dome = lathe("BellDome", [
        (0.000, 0.124), (0.038, 0.121), (0.070, 0.112), (0.098, 0.097),
        (0.119, 0.077), (0.134, 0.053), (0.143, 0.028), (0.148, 0.010),
        (0.150, 0.000), (0.144, 0.000), (0.000, 0.000),
    ])
    finish(dome, "brass")

    base = lathe("BellBase", [
        (0.000, 0.000), (0.152, 0.000), (0.158, 0.008),
        (0.156, 0.020), (0.148, 0.026), (0.000, 0.026),
    ], closed=True)
    base.location.z = -0.020
    finish(base, "dark_metal", smooth=False)
    soften(base, width=0.006)

    stem = primitive("cylinder", vertices=16, radius=0.014, depth=0.030,
                     location=(0, 0, 0.136))
    finish(stem, "brass")

    knob = lathe("BellKnob", [
        (0.000, 0.052), (0.020, 0.049), (0.031, 0.038),
        (0.034, 0.022), (0.028, 0.007), (0.014, 0.000), (0.000, 0.000),
    ])
    knob.location.z = 0.148
    finish(knob, "brass")

    bell = join([dome, base, stem, knob], "DeskBell")
    bell.scale = (0.82, 0.82, 0.82)
    return ground(bell)


# --- quill and inkpot --------------------------------------------------------

def build_quill():
    pot = lathe("InkPot", [
        (0.000, 0.000), (0.062, 0.000), (0.078, 0.016), (0.084, 0.046),
        (0.074, 0.076), (0.052, 0.094), (0.038, 0.104), (0.037, 0.118),
        (0.049, 0.124), (0.046, 0.130), (0.034, 0.124), (0.032, 0.084),
        (0.000, 0.084),
    ])
    finish(pot, "ceramic")

    ink = primitive("cylinder", vertices=24, radius=0.031, depth=0.005,
                    location=(0, 0, 0.086))
    finish(ink, "ink", smooth=False)

    # Width runs along X — the axis the quill is later rotated about — so the
    # feather stays face-on. Build it on any other axis and the rotation turns
    # it edge-on to the room, where it reads as a spike.
    VANE_HALF = 0.115
    vane = primitive("uv_sphere", segments=20, ring_count=12, radius=1.0)
    vane.name = "QuillVane"
    vane.scale = (0.044, VANE_HALF, 0.0055)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for v in vane.data.vertices:
        t = (v.co.y + VANE_HALF) / (2 * VANE_HALF)
        v.co.x *= 1.0 - 0.68 * t
        v.co.z *= 1.0 - 0.35 * t
    vane.location.y = 0.036
    finish(vane, "feather")

    shaft = primitive("cylinder", vertices=12, radius=0.0052, depth=0.270,
                      rotation=(math.radians(90), 0, 0), location=(0, -0.012, 0))
    shaft.name = "QuillShaft"
    finish(shaft, "feather")

    quill = join([vane, shaft], "Quill")
    quill.rotation_euler = (math.radians(60), 0, math.radians(14))
    quill.location = (0.0, 0.062, 0.205)

    return ground(join([pot, ink, quill], "QuillAndInkpot"))


# --- hourglass ---------------------------------------------------------------

BULB = [
    (0.0060, 0.000), (0.024, 0.012), (0.046, 0.030), (0.062, 0.052),
    (0.070, 0.078), (0.071, 0.100), (0.064, 0.118), (0.049, 0.130),
    (0.027, 0.137), (0.000, 0.139),
]


def build_hourglass():
    top = lathe("BulbTop", BULB)
    top.location.z = 0.016
    finish(top, "glass")

    bottom = lathe("BulbBottom", BULB)
    bottom.scale.z = -1.0
    bottom.location.z = -0.016
    finish(bottom, "glass")

    sand_low = lathe("SandLow", [
        (0.000, 0.000), (0.060, 0.000), (0.060, 0.012),
        (0.031, 0.050), (0.000, 0.066),
    ])
    sand_low.location.z = -0.150
    finish(sand_low, "sand", smooth=False)

    sand_high = lathe("SandHigh", [
        (0.000, 0.000), (0.007, 0.000), (0.048, 0.056),
        (0.060, 0.076), (0.060, 0.090), (0.000, 0.090),
    ])
    sand_high.location.z = 0.034
    finish(sand_high, "sand", smooth=False)

    caps = []
    for z in (0.155, -0.155):
        cap = lathe("Cap", [
            (0.000, 0.000), (0.094, 0.000), (0.100, 0.010),
            (0.098, 0.030), (0.086, 0.038), (0.000, 0.038),
        ], closed=True)
        cap.scale.z = -1.0 if z < 0 else 1.0
        cap.location.z = z
        caps.append(finish(cap, "wood_light", smooth=False))
        soften(cap, width=0.008)

    posts = []
    for i in range(3):
        angle = math.radians(90 + i * 120)
        post = primitive("cylinder", vertices=10, radius=0.0105, depth=0.320,
                         location=(0.072 * math.cos(angle),
                                   0.072 * math.sin(angle), 0))
        posts.append(finish(post, "brass"))

    glass = join([top, bottom, sand_low, sand_high] + caps + posts, "Hourglass")
    glass.scale = (1.06, 1.06, 1.10)
    return ground(glass)


# --- the desk ----------------------------------------------------------------

# A gentle arc over a large radius reads as "a desk that curves". A wide sweep
# over a small radius reads as a round bar, however correct the dimensions are.
DESK_SWEEP = 52.0
DESK_TOP = 1.12
PROP_RADIUS = 2.86

# 18 steps across 52 degrees is one every ~2.9 degrees. Denser is invisible at
# player distance and multiplies straight into the bevel's geometry cost.
DESK_SEGMENTS = 18


PANELS = 4
PILASTER_DEG = 3.6


def arc(name, profile, start_deg, width_deg, segments=3):
    """A lathe covering only part of the sweep, rotated into place.

    Panels and mouldings on a curved desk have to follow the curve; building
    them as flat boxes would leave them floating off the surface. Revolving a
    short arc keeps every piece flush by construction.
    """
    piece = lathe(name, profile, segments=segments, angle=width_deg, closed=True)
    piece.rotation_euler.z = math.radians(start_deg)
    return piece


def build_desk():
    parts = []

    # Moulded plinth. Stacked chamfers rather than one square edge — a profile
    # that catches light in bands is what reads as "carved" at a distance.
    plinth = lathe("Plinth", [
        (2.58, 0.00), (3.10, 0.00), (3.12, 0.05), (3.08, 0.09),
        (3.02, 0.13), (3.00, 0.20), (2.58, 0.20),
    ], segments=DESK_SEGMENTS, angle=DESK_SWEEP, closed=True)
    parts.append(finish(plinth, "wood_light", smooth=False))
    soften(plinth, width=0.012, segments=2)

    # Recessed body: the panels and pilasters sit proud of this. Its outer face
    # is pulled in to 2.95 and it runs past the plinth and cornice vertically,
    # so no surface is ever coplanar with an overlay — coplanar faces z-fight
    # into speckle.
    body = lathe("DeskBody", [
        (2.62, 0.16), (2.95, 0.16), (2.95, 0.92), (2.62, 0.92),
    ], segments=DESK_SEGMENTS, angle=DESK_SWEEP, closed=True)
    parts.append(finish(body, "wood", smooth=False))

    # Panels framed in brass, with pilasters between them.
    span = (DESK_SWEEP - (PANELS + 1) * PILASTER_DEG) / PANELS
    for i in range(PANELS + 1):
        start = i * (PILASTER_DEG + span)
        pilaster = arc("Pilaster", [
            (2.96, 0.14), (3.05, 0.14), (3.07, 0.20),
            (3.07, 0.88), (3.05, 0.94), (2.96, 0.94),
        ], start, PILASTER_DEG)
        # No bevel here: a bevel on each of five pilasters multiplied the
        # export past 700KB for rounding you cannot see across a room.
        parts.append(finish(pilaster, "wood_light", smooth=False))

        if i == PANELS:
            break

        panel_start = start + PILASTER_DEG
        frame = arc("PanelFrame", [
            (2.96, 0.30), (3.03, 0.30), (3.03, 0.78), (2.96, 0.78),
        ], panel_start + 0.4, span - 0.8)
        parts.append(finish(frame, "brass", smooth=False))

        inset = arc("PanelInset", [
            (2.96, 0.34), (3.018, 0.34), (3.018, 0.74), (2.96, 0.74),
        ], panel_start + 1.1, span - 2.2)
        parts.append(finish(inset, "wood_light", smooth=False))

        # A raised boss centred on each panel — small, but it is the kind of
        # detail that separates "decorated" from "blank".
        mid = math.radians(panel_start + span / 2)
        boss = primitive("uv_sphere", segments=12, ring_count=8, radius=0.055,
                         location=(3.02 * math.cos(mid), 3.02 * math.sin(mid), 0.54))
        boss.scale = (0.45, 1.0, 1.0)
        boss.rotation_euler.z = mid
        parts.append(finish(boss, "brass"))

    # Profiled cornice under the counter.
    cornice = lathe("Cornice", [
        (2.62, 0.88), (3.02, 0.88), (3.08, 0.93), (3.10, 0.99),
        (3.04, 1.02), (2.62, 1.02),
    ], segments=DESK_SEGMENTS, angle=DESK_SWEEP, closed=True)
    parts.append(finish(cornice, "wood_light", smooth=False))
    soften(cornice, width=0.010, segments=2)

    # Counter with a moulded lip rather than a flat slab edge.
    slab = lathe("DeskTop", [
        (2.48, 1.02), (3.12, 1.02), (3.17, 1.06), (3.17, 1.10),
        (3.12, DESK_TOP), (2.48, DESK_TOP),
    ], segments=DESK_SEGMENTS, angle=DESK_SWEEP, closed=True)
    parts.append(finish(slab, "stone", smooth=False))
    soften(slab, width=0.016, segments=2)

    # Brass inlay following the counter edge.
    inlay = lathe("Inlay", [
        (3.13, 1.10), (3.16, 1.10), (3.16, 1.125), (3.13, 1.125),
    ], segments=DESK_SEGMENTS, angle=DESK_SWEEP, closed=True)
    parts.append(finish(inlay, "brass", smooth=False))

    # A standing placard: the clearest "someone works here" cue, which is what
    # separates a reception desk from an altar.
    board = primitive("cube", size=1.0, location=(2.72, 0, 1.30))
    board.name = "DeskSign"
    board.scale = (0.030, 0.185, 0.115)
    parts.append(finish(board, "teal", smooth=False))
    soften(board, width=0.020)

    parts += [
        finish(primitive("cylinder", vertices=10, radius=0.016, depth=0.16,
                         location=(2.72, offset, 1.18)), "brass")
        for offset in (-0.16, 0.16)
    ]

    desk = join(parts, "WelcomeDesk")

    # The sweep starts at +X; centre it on -Y so the convex face meets the
    # visitor, since Blender -Y becomes +Z after the glTF +Y-up conversion.
    desk.rotation_euler = (0, 0, math.radians(-90 - DESK_SWEEP / 2))
    bpy.ops.object.select_all(action="DESELECT")
    desk.select_set(True)
    bpy.context.view_layer.objects.active = desk
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

    # Recentre on the origin so React places the desk, not its arc centre.
    bbox = [desk.matrix_world @ Vector(c) for c in desk.bound_box]
    offset = Vector((
        -(max(v.x for v in bbox) + min(v.x for v in bbox)) / 2,
        -(max(v.y for v in bbox) + min(v.y for v in bbox)) / 2,
        0.0,
    ))
    desk.location = offset
    return ground(desk), offset


# --- build, lay out, export --------------------------------------------------

bell = build_bell()
quill = build_quill()
hourglass = build_hourglass()
desk, arc_centre = build_desk()

COUNTER = ((bell, -13.0), (quill, 1.5), (hourglass, 14.0))
for obj, degrees in COUNTER:
    theta = math.radians(degrees)
    obj.location = (
        arc_centre.x + PROP_RADIUS * math.sin(theta),
        arc_centre.y - PROP_RADIUS * math.cos(theta),
        DESK_TOP,
    )
    obj.rotation_euler = (0, 0, theta)

bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

for obj, slug in ((desk, "welcome-desk"), (bell, "desk-bell"),
                  (quill, "quill-inkpot"), (hourglass, "hourglass")):
    report(obj, slug, export_glb(obj, GLB_DIR, slug))

print("\n--- paste into WelcomeDesk.tsx (three.js axes) ---")
print(f"const COUNTER_HEIGHT = {DESK_TOP}")
for obj, _ in COUNTER:
    loc = obj.location
    print(f"  {obj.name:<16} position={{[{loc.x:.3f}, COUNTER_HEIGHT, {-loc.y:.3f}]}} "
          f"rotation={{[0, {obj.rotation_euler.z:.3f}, 0]}}")

setup_preview(camera_at=(0.9, -5.4, 1.75), look_at=(0.0, -0.9, 1.00), lens=42)
render_preview(PREVIEW)
print(f"\npreview: {PREVIEW}")
