"""Quill standing in an inkpot.

A ceramic pot with a lipped rim, ink sitting below the lip, and a feather
leaning out of it. The feather is a flattened sphere tapered along its length —
a straight cylinder with a point reads as a dart, not a quill.
"""

import math

import bpy

from lib import Prop, finish, join, lathe, primitive


class Quill(Prop):
    slug = "quill-inkpot"
    params = {
        "vane_half": 0.115,      # half-length of the feather along its own axis
        "vane_taper_x": 0.68,    # width lost from base to tip
        "vane_taper_z": 0.35,    # thickness lost from base to tip
        "lean_deg": 60.0,
    }

    def build(self):
        p = self.params

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
        half = p["vane_half"]
        vane = primitive("uv_sphere", segments=20, ring_count=12, radius=1.0)
        vane.name = "QuillVane"
        vane.scale = (0.044, half, 0.0055)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for v in vane.data.vertices:
            t = (v.co.y + half) / (2 * half)
            v.co.x *= 1.0 - p["vane_taper_x"] * t
            v.co.z *= 1.0 - p["vane_taper_z"] * t
        vane.location.y = 0.036
        finish(vane, "feather")

        shaft = primitive("cylinder", vertices=12, radius=0.0052, depth=0.270,
                          rotation=(math.radians(90), 0, 0),
                          location=(0, -0.012, 0))
        shaft.name = "QuillShaft"
        finish(shaft, "feather")

        quill = join([vane, shaft], "Quill")
        quill.rotation_euler = (math.radians(p["lean_deg"]), 0, math.radians(14))
        quill.location = (0.0, 0.062, 0.205)

        return join([pot, ink, quill], "QuillAndInkpot")
