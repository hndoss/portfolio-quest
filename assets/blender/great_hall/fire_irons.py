"""Stand plus three irons.

The irons lean rather than stand plumb — a vertical bundle reads as a fence
post. Each gets a distinct business end so three irons do not read as three
sticks.
"""

import math

from lib import Prop, box, finish, join, lathe, rod


class FireIrons(Prop):
    slug = "fire-irons"
    params = {
        "lean_deg": 12.0,
        "iron_ring_r": 0.115,
        "bearings": (0.4, 2.5, 4.4),   # radians, roughly 120 degrees apart
    }

    def build(self):
        p = self.params

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

        lean = math.radians(p["lean_deg"])
        ring = p["iron_ring_r"]
        for i, bearing in enumerate(p["bearings"]):
            dx, dy = math.cos(bearing), math.sin(bearing)
            # A cylinder points along +Z; the Z Euler term swings the lean round to
            # this iron's bearing, exactly as the chandelier struts do.
            parts.append(rod(f"Iron{i}", 0.011, 0.80,
                             (dx * ring, dy * ring, 0.40),
                             rotation=(0, lean, -bearing + math.pi / 2),
                             mat="dark_metal", vertices=6))

        tip = 0.135
        tip_x, tip_y = math.cos(0.4) * tip, math.sin(0.4) * tip
        parts.append(box("ShovelPan", (0.10, 0.085, 0.012),
                         (tip_x, tip_y, 0.020), "dark_metal"))
        hook_x, hook_y = math.cos(2.5) * tip, math.sin(2.5) * tip
        parts.append(rod("PokerHook", 0.010, 0.055, (hook_x, hook_y, 0.055),
                         rotation=(math.pi / 2, 0, 2.5), mat="dark_metal",
                         vertices=6))
        tong_x, tong_y = math.cos(4.4) * tip, math.sin(4.4) * tip
        for s in (-1, 1):
            parts.append(box("TongArm", (0.014, 0.014, 0.10),
                             (tong_x + s * 0.018, tong_y, 0.050), "dark_metal"))

        return join(parts, "FireIrons")
