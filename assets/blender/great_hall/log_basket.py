"""Log basket: a banded oak vessel with logs standing proud of the rim."""

import math

import bpy

from lib import Prop, finish, join, lathe, rod


class LogBasket(Prop):
    slug = "log-basket"

    def build(self):
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
                             rotation=(math.pi / 2, 0, yaw), mat="oak",
                             vertices=7))

        return join(parts, "LogBasket")
