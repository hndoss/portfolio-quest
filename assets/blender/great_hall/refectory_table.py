"""Refectory table: a long trestle board.

Long along Y, so it runs along Z in the room with no placement rotation.
"""

from lib import Prop, box, join, soften


class RefectoryTable(Prop):
    slug = "refectory-table"
    params = {"length": 4.0, "width": 1.10, "top_z": 0.78}

    def build(self):
        p = self.params
        length, width, top_z = p["length"], p["width"], p["top_z"]

        parts = [
            box("Top", (width, length, 0.09), (0, 0, top_z - 0.045), "wood"),
            # A second, slightly smaller slab under the top reads as a thick
            # two-plank board and costs one box.
            box("Underboard", (width - 0.10, length - 0.12, 0.05),
                (0, 0, 0.710), "oak"),
            box("Stretcher", (0.14, 2.90, 0.13), (0, 0, 0.290), "oak"),
        ]

        for sy in (-1, 1):
            y = sy * 1.55
            parts += [
                box("TrestleFoot", (0.95, 0.20, 0.12), (0, y, 0.060), "oak"),
                box("TrestleStandard", (0.70, 0.13, 0.56), (0, y, 0.400), "oak"),
                box("TrestleCleat", (0.85, 0.18, 0.08), (0, y, 0.700), "oak"),
                box("TrestleStrap", (0.74, 0.025, 0.05),
                    (0, y - 0.075, 0.400), "brass"),
            ]

        table = join(parts, "RefectoryTable")
        soften(table, width=0.010, segments=2)
        return table
