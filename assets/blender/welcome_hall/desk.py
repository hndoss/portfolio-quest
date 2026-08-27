"""The welcome desk: a curved reception counter.

Layered ornament is what makes it read as furniture rather than as a mass — a
moulded plinth, recessed panels between pilasters, a cornice, a lipped counter
and brass inlay. Stacked chamfers that catch light in bands are what read as
"carved" from across the room.

Exposes `arc_centre` after build: the counter props stand on a radius measured
from the desk's arc centre, not from its bounding-box origin.
"""

import math

import bpy
from mathutils import Vector

from lib import Prop, finish, join, lathe, primitive, soften

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


class Desk(Prop):
    slug = "welcome-desk"
    # No params dict: this prop's numbers are module constants because the
    # counter props import DESK_TOP and PROP_RADIUS to stand on the counter.
    # A params copy alongside them would be a second place to edit.

    def __init__(self):
        super().__init__()
        self.arc_centre = Vector((0.0, 0.0, 0.0))

    def build(self):
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
                             location=(3.02 * math.cos(mid),
                                       3.02 * math.sin(mid), 0.54))
            boss.scale = (0.45, 1.0, 1.0)
            boss.rotation_euler.z = mid
            parts.append(finish(boss, "brass"))

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
        self.arc_centre = Vector((
            -(max(v.x for v in bbox) + min(v.x for v in bbox)) / 2,
            -(max(v.y for v in bbox) + min(v.y for v in bbox)) / 2,
            0.0,
        ))
        desk.location = self.arc_centre
        return desk
