"""Hall bench: a plank seat on slab legs, matching the refectory table."""

from lib import Prop, box, join, soften


class Bench(Prop):
    slug = "hall-bench"

    def build(self):
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
        return bench
