"""Low table beside the hearth group."""

from lib import Prop, box, join, soften


class SideTable(Prop):
    slug = "hall-side-table"

    def build(self):
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
        return table
