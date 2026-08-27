"""Desk service bell.

A brass dome on a dark plinth with a strike knob on a short stem. The dome is
the whole silhouette: the plinth reads as a shadow under it and the knob as a
full stop on top, so the dome profile is the only part worth tuning.
"""

from lib import Prop, finish, join, lathe, primitive, soften


class Bell(Prop):
    slug = "desk-bell"
    params = {
        # Built at full size, then taken down as a set. The pair reads by
        # relative size against the hourglass, not by real-world dimensions.
        "scale": 0.82,
    }

    def build(self):
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
        scale = self.params["scale"]
        bell.scale = (scale, scale, scale)
        return bell
