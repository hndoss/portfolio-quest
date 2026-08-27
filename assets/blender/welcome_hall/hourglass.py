"""Hourglass: two glass bulbs between wooden caps, held by three brass posts.

Envelope rule: the glass is the subject, so the bulb bellies should be the
widest thing in the silhouette and the waist should be visible in outline.

That rule is currently BROKEN and the shape has not been re-cut yet:

    belly radius   0.0710   the bulbs, what the eye should see
    post outer     0.0825   0.072 ring + 0.0105 radius -> stands proud
    cap radius     0.1000   41% wider than the belly

So the hardware wins the silhouette and the waist never appears in outline.
Fixing it means re-cutting BULB and the cap profile, which moves geometry — see
the src/CLAUDE.md warning about viewpoints.json before doing it. Once the
shape is fixed, add the envelope invariant to `checks()` so it cannot regress.
"""

import math

from lib import Prop, finish, join, lathe, primitive, soften

# Half the glass: swept for the top bulb and mirrored in Z for the bottom.
BULB = [
    (0.0060, 0.000), (0.024, 0.012), (0.046, 0.030), (0.062, 0.052),
    (0.070, 0.078), (0.071, 0.100), (0.064, 0.118), (0.049, 0.130),
    (0.027, 0.137), (0.000, 0.139),
]


class Hourglass(Prop):
    slug = "hourglass"
    params = {
        "belly_r": 0.0710,     # widest point of BULB
        "cap_r": 0.1000,       # outer radius of the wooden caps
        "post_ring_r": 0.0720,  # circle the three posts stand on
        "post_r": 0.0105,
        "post_count": 3,
        "cap_z": 0.155,
        "scale": (1.06, 1.06, 1.10),
    }

    def build(self):
        p = self.params

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
        for z in (p["cap_z"], -p["cap_z"]):
            cap = lathe("Cap", [
                (0.000, 0.000), (0.094, 0.000), (0.100, 0.010),
                (0.098, 0.030), (0.086, 0.038), (0.000, 0.038),
            ], closed=True)
            cap.scale.z = -1.0 if z < 0 else 1.0
            cap.location.z = z
            caps.append(finish(cap, "wood_light", smooth=False))
            soften(cap, width=0.008)

        posts = []
        for i in range(p["post_count"]):
            angle = math.radians(90 + i * (360 / p["post_count"]))
            post = primitive("cylinder", vertices=10, radius=p["post_r"],
                             depth=0.320,
                             location=(p["post_ring_r"] * math.cos(angle),
                                       p["post_ring_r"] * math.sin(angle), 0))
            posts.append(finish(post, "brass"))

        glass = join([top, bottom, sand_low, sand_high] + caps + posts,
                     "Hourglass")
        glass.scale = p["scale"]
        return glass
