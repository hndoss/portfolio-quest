"""Central-hall furniture: seating, tables, and hearth irons.

    npm run models

Everything the hall needed once the welcome desk moved out and the floor was
left bare. The desk props (bell, quill, hourglass) live in `welcome_hall.py`
and belong to the Office now; nothing here depends on them.

Orientation convention, which matters for anything with a front:
three.js `z = -blender y`, so a chair whose back is at **+Y in Blender** faces
**+Z in three.js**, which is React's un-rotated forward. Long objects are built
along Y so they run along Z in the room without a placement rotation.

Style follows assets/blender/CLAUDE.md: exaggerate the primary shape, keep
secondary detail simple, and chamfer much harder than realism would. Bevels are
the expensive part — tessellation stays lean so `soften()` has less to multiply.
"""

import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import (  # noqa: E402
    export_glb, finish, ground, join, lathe, primitive, render_preview,
    report, reset, setup_preview, soften,
)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
GLB_DIR = os.path.join(ROOT, "public", "models", "props")
BLEND_OUT = os.path.join(HERE, "great-hall.blend")
PREVIEW = os.path.join(HERE, "_preview_hall.png")

reset()
os.makedirs(GLB_DIR, exist_ok=True)


def box(name, size, location, mat, smooth=False):
    """An axis-aligned box of explicit metre dimensions, transform applied.

    `primitive_cube_add` only takes a uniform `size`, so the shape comes from a
    scale — which has to be baked before `join()`, or the joined result inherits
    the active object's scale instead of each part's own.
    """
    obj = primitive("cube", size=1.0, location=location)
    obj.name = name
    obj.scale = size
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, mat, smooth=smooth)


def rod(name, radius, length, location, rotation=(0, 0, 0), mat="dark_metal",
        vertices=10):
    obj = primitive("cylinder", vertices=vertices, radius=radius, depth=length,
                    location=location)
    obj.name = name
    obj.rotation_euler = rotation
    return finish(obj, mat)


# --- hall chair --------------------------------------------------------------

# Back at +Y so the chair faces +Z in three.js. Every horizontal dimension is
# quoted from the seat, which is the part the eye actually sizes a chair by.
SEAT_TOP = 0.46
SEAT_W = 0.52
BACK_TOP = 1.30


def build_chair():
    parts = []

    # Back posts run the full height in one piece — a post spliced at seat
    # level shows as a seam exactly where the light band from the seat lands.
    for sx in (-1, 1):
        parts.append(box("BackPost", (0.08, 0.08, BACK_TOP),
                         (sx * 0.225, 0.215, BACK_TOP / 2), "oak"))
        parts.append(box("FrontLeg", (0.075, 0.075, 0.44),
                         (sx * 0.225, -0.215, 0.22), "oak"))

    # Seat spans 0.385..0.46, so the legs (to 0.44) die *inside* it rather than
    # meeting its underside on a shared plane.
    parts.append(box("Seat", (SEAT_W, 0.48, 0.075), (0, 0, 0.4225), "wood"))
    parts.append(box("Apron", (0.46, 0.42, 0.06), (0, 0, 0.355), "oak"))

    # Cushion sunk 0.015 into the seat for the same reason.
    parts.append(box("Cushion", (0.44, 0.40, 0.07), (0, -0.01, 0.48), "teal"))

    # Recessed back panel, held inside the posts' 0.08 depth.
    parts.append(box("BackPanel", (0.38, 0.05, 0.58), (0, 0.215, 0.86), "oak"))
    parts.append(box("BackPanelInlay", (0.26, 0.02, 0.44), (0, 0.183, 0.86), "wood"))

    # Crest rail, stopping 0.03 below the post tops so the finials read.
    parts.append(box("Crest", (0.58, 0.10, 0.14), (0, 0.215, 1.20), "wood"))
    parts.append(box("CrestBand", (0.50, 0.03, 0.045), (0, 0.155, 1.20), "brass"))

    # Arms, from the back posts forward.
    for sx in (-1, 1):
        parts.append(box("Arm", (0.06, 0.405, 0.075),
                         (sx * 0.245, 0.0125, 0.70), "wood"))
        parts.append(box("ArmPost", (0.055, 0.055, 0.24),
                         (sx * 0.245, -0.17, 0.58), "oak"))

    chair = join(parts, "HallChair")
    soften(chair, width=0.009, segments=2)

    # Finials last: they are lathes, and a bevel across a lathe step is the
    # single most expensive thing in this file.
    finials = []
    for sx in (-1, 1):
        finial = lathe("Finial", [
            (0.000, 0.000), (0.048, 0.006), (0.052, 0.026), (0.040, 0.044),
            (0.030, 0.060), (0.034, 0.078), (0.022, 0.096), (0.000, 0.104),
        ], segments=12)
        finial.location = (sx * 0.225, 0.215, BACK_TOP)
        finials.append(finish(finial, "brass"))

    return ground(join([chair] + finials, "HallChair"))


# --- low table beside the hearth group ---------------------------------------

def build_side_table():
    parts = [
        box("Top", (0.90, 0.55, 0.055), (0, 0, 0.395), "wood"),
        box("Apron", (0.82, 0.47, 0.075), (0, 0, 0.330), "oak"),
        box("Shelf", (0.70, 0.40, 0.035), (0, 0, 0.130), "oak"),
    ]
    for sx in (-1, 1):
        for sy in (-1, 1):
            parts.append(box("Leg", (0.065, 0.065, 0.37),
                             (sx * 0.385, sy * 0.215, 0.185), "oak"))
    # Brass on the *edges*, not as a sheet on the top. A flat horizontal plate
    # at metalness 1.0 has nothing to reflect — no envmap here and none in the
    # three.js scene either — so it renders as a black rectangle. A vertical
    # face standing 0.01 proud of the top catches the key light instead.
    for sy in (-1, 1):
        parts.append(box("EdgeBand", (0.90, 0.014, 0.030),
                         (0, sy * 0.278, 0.395), "brass"))

    table = join(parts, "HallSideTable")
    soften(table, width=0.008, segments=2)
    return ground(table)


# --- refectory table ---------------------------------------------------------

# Long along Y, so it runs along Z in the room with no placement rotation.
REF_LEN = 4.0
REF_W = 1.10
REF_TOP = 0.78


def build_refectory_table():
    parts = [
        box("Top", (REF_W, REF_LEN, 0.09), (0, 0, REF_TOP - 0.045), "wood"),
        # A second, slightly smaller slab under the top reads as a thick
        # two-plank board and costs one box.
        box("Underboard", (REF_W - 0.10, REF_LEN - 0.12, 0.05), (0, 0, 0.710), "oak"),
        box("Stretcher", (0.14, 2.90, 0.13), (0, 0, 0.290), "oak"),
    ]

    for sy in (-1, 1):
        y = sy * 1.55
        parts += [
            box("TrestleFoot", (0.95, 0.20, 0.12), (0, y, 0.060), "oak"),
            box("TrestleStandard", (0.70, 0.13, 0.56), (0, y, 0.400), "oak"),
            box("TrestleCleat", (0.85, 0.18, 0.08), (0, y, 0.700), "oak"),
            box("TrestleStrap", (0.74, 0.025, 0.05), (0, y - 0.075, 0.400), "brass"),
        ]

    table = join(parts, "RefectoryTable")
    soften(table, width=0.010, segments=2)
    return ground(table)


def build_bench():
    parts = [
        box("Seat", (0.35, 1.90, 0.075), (0, 0, 0.4225), "wood"),
        box("Stretcher", (0.09, 1.30, 0.09), (0, 0, 0.200), "oak"),
    ]
    for sy in (-1, 1):
        y = sy * 0.70
        parts += [
            box("LegSlab", (0.30, 0.08, 0.40), (0, y, 0.200), "oak"),
            box("LegFoot", (0.36, 0.16, 0.07), (0, y, 0.035), "oak"),
        ]
    bench = join(parts, "HallBench")
    soften(bench, width=0.008, segments=2)
    return ground(bench)


# --- candlestick -------------------------------------------------------------

CANDLE_H = 0.16


def build_candlestick():
    stem = lathe("Stem", [
        (0.000, 0.000), (0.075, 0.000), (0.078, 0.014), (0.068, 0.026),
        (0.032, 0.036), (0.026, 0.058), (0.040, 0.074), (0.030, 0.090),
        (0.022, 0.132), (0.036, 0.152), (0.028, 0.170), (0.021, 0.214),
        (0.032, 0.238), (0.050, 0.252), (0.045, 0.264), (0.026, 0.270),
        (0.024, 0.290), (0.000, 0.290),
    ], segments=18)
    finish(stem, "brass")

    # Sunk 0.01 into the socket, not resting on its rim.
    candle = rod("Candle", 0.021, CANDLE_H, (0, 0, 0.280 + CANDLE_H / 2),
                 mat="feather", vertices=12)

    return ground(join([stem, candle], "Candlestick"))


# --- hearth irons ------------------------------------------------------------

def build_andiron():
    """Firedog: a brass front post with the billet bar running back under it.

    Placed *in front of* the flames in React, so what matters is the silhouette
    of the post — it is read as a dark shape against fire, not as brass.
    """
    post = lathe("Post", [
        (0.000, 0.000), (0.062, 0.000), (0.064, 0.020), (0.046, 0.036),
        (0.028, 0.062), (0.026, 0.300), (0.037, 0.332), (0.030, 0.360),
        (0.024, 0.418), (0.041, 0.460), (0.047, 0.500), (0.030, 0.532),
        (0.017, 0.550), (0.000, 0.556),
    ], segments=16)
    finish(post, "brass")

    parts = [
        post,
        box("Billet", (0.045, 0.60, 0.035), (0, 0.30, 0.105), "dark_metal"),
        box("RearFoot", (0.05, 0.07, 0.10), (0, 0.575, 0.050), "dark_metal"),
    ]
    return ground(join(parts, "Andiron"))


def build_log_basket():
    # closed=True: the profile is a cross-section that runs up the outside,
    # over the rim and back down the inside, which is what makes a vessel with
    # a wall rather than a solid lump.
    body = lathe("BasketBody", [
        (0.000, 0.000), (0.300, 0.000), (0.330, 0.022), (0.355, 0.300),
        (0.360, 0.340), (0.335, 0.340), (0.330, 0.300), (0.305, 0.032),
        (0.000, 0.032),
    ], segments=22, closed=True)
    finish(body, "oak")

    parts = [body]
    # Two hoops. A basket reads as woven from banding, not from weave detail
    # nobody can resolve at 8m.
    for z, r in ((0.090, 0.338), (0.250, 0.353)):
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.016,
                                         major_segments=22, minor_segments=6,
                                         location=(0, 0, z))
        parts.append(finish(bpy.context.active_object, "brass"))

    # Logs, sitting proud of the rim so the basket reads as full.
    for i, (x, y, z, yaw) in enumerate((
        (-0.09, 0.02, 0.315, 0.10), (0.10, -0.05, 0.325, -0.22),
        (0.00, 0.06, 0.415, 0.42),
    )):
        parts.append(rod(f"Log{i}", 0.072, 0.52, (x, y, z),
                         rotation=(math.pi / 2, 0, yaw), mat="oak", vertices=7))

    return ground(join(parts, "LogBasket"))


def build_fire_irons():
    """Stand plus three irons. The irons lean rather than stand plumb — a
    vertical bundle reads as a fence post."""
    base = lathe("IronsBase", [
        (0.000, 0.000), (0.155, 0.000), (0.160, 0.014), (0.140, 0.028),
        (0.048, 0.036), (0.040, 0.052), (0.000, 0.052),
    ], segments=18)
    finish(base, "dark_metal")

    parts = [
        base,
        rod("StandPost", 0.020, 0.82, (0, 0, 0.45), mat="brass", vertices=10),
    ]

    finial = lathe("IronsFinial", [
        (0.000, 0.000), (0.044, 0.010), (0.048, 0.032), (0.032, 0.052),
        (0.020, 0.070), (0.000, 0.078),
    ], segments=12)
    finial.location = (0, 0, 0.845)
    parts.append(finish(finial, "brass"))

    # Three irons at 120 degrees, leaning out by 7 degrees.
    LEAN = math.radians(12)
    for i, bearing in enumerate((0.4, 2.5, 4.4)):
        dx, dy = math.cos(bearing), math.sin(bearing)
        # A cylinder points along +Z; the Z Euler term swings the lean round to
        # this iron's bearing, exactly as the chandelier struts do.
        parts.append(rod(f"Iron{i}", 0.011, 0.80,
                         (dx * 0.115, dy * 0.115, 0.40),
                         rotation=(0, LEAN, -bearing + math.pi / 2),
                         mat="dark_metal", vertices=6))

    # Distinct business ends, so three irons do not read as three sticks.
    tip_x, tip_y = math.cos(0.4) * 0.135, math.sin(0.4) * 0.135
    parts.append(box("ShovelPan", (0.10, 0.085, 0.012), (tip_x, tip_y, 0.020),
                     "dark_metal"))
    hook_x, hook_y = math.cos(2.5) * 0.135, math.sin(2.5) * 0.135
    parts.append(rod("PokerHook", 0.010, 0.055, (hook_x, hook_y, 0.055),
                     rotation=(math.pi / 2, 0, 2.5), mat="dark_metal", vertices=6))
    tong_x, tong_y = math.cos(4.4) * 0.135, math.sin(4.4) * 0.135
    for s in (-1, 1):
        parts.append(box("TongArm", (0.014, 0.014, 0.10),
                         (tong_x + s * 0.018, tong_y, 0.050), "dark_metal"))

    return ground(join(parts, "FireIrons"))


# --- build, lay out, export --------------------------------------------------

PROPS = [
    ("hall-chair", build_chair()),
    ("hall-side-table", build_side_table()),
    ("refectory-table", build_refectory_table()),
    ("hall-bench", build_bench()),
    ("candlestick", build_candlestick()),
    ("andiron", build_andiron()),
    ("log-basket", build_log_basket()),
    ("fire-irons", build_fire_irons()),
]

# Preview layout only. `export_glb` restores both location and rotation, so
# every prop still ships at the origin, unrotated.
#
# Two rows, and the two long pieces turned broadside. Laid out in one line the
# row spanned 11m while `setup_preview`'s lights sit near the origin — the
# chair blew out to white and `fire-irons` fell off the frame entirely, which
# is exactly the "preview lights blow out easily" trap in the pipeline notes.
BY_SLUG = dict(PROPS)


def row(slugs, y, turn=False):
    cursor = 0.0
    for slug in slugs:
        obj = BY_SLUG[slug]
        if turn:
            obj.rotation_euler = (0, 0, math.pi / 2)
        # Rotating swaps which dimension is the row's width.
        width = obj.dimensions.y if turn else obj.dimensions.x
        cursor += width / 2 + 0.45
        obj.location = (cursor, y, 0)
        cursor += width / 2
    return cursor


back = row(["refectory-table", "hall-bench"], 1.7, turn=True)
front = row(["hall-chair", "hall-side-table", "log-basket", "fire-irons",
             "candlestick", "andiron"], -0.9)
span = max(back, front)

bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)

for slug, obj in PROPS:
    report(obj, slug, export_glb(obj, GLB_DIR, slug))

# Low key/fill, then a spread of area lights along the row — one pair near the
# origin cannot light 6m of furniture evenly.
setup_preview(camera_at=(span / 2, -7.6, 3.1),
              look_at=(span / 2, 0.4, 0.55), lens=38, key=90, fill=45)
for x in (0.6, span / 2, span - 0.6):
    bpy.ops.object.light_add(type="AREA", location=(x, -3.2, 3.4))
    light = bpy.context.active_object
    light.data.energy = 170
    light.data.size = 3.0

render_preview(PREVIEW, width=1500, height=680)
print(f"\npreview: {PREVIEW}")
