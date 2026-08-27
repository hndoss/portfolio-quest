"""Firedog: a brass front post with the billet bar running back under it.

Placed *in front of* the flames in React, so what matters is the silhouette of
the post — it is read as a dark shape against fire, not as brass.
"""

from lib import Prop, box, finish, join, lathe


class Andiron(Prop):
    slug = "andiron"

    def build(self):
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
        return join(parts, "Andiron")
