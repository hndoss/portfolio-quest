"""Hall chair: a high-backed oak armchair with a cushioned seat.

Back at +Y so the chair faces +Z in three.js. Every horizontal dimension is
quoted from the seat, which is the part the eye actually sizes a chair by.
"""

from lib import Prop, box, finish, join, lathe, soften


class Chair(Prop):
    slug = "hall-chair"
    params = {
        "seat_w": 0.52,
        "back_top": 1.30,
    }

    def build(self):
        back_top = self.params["back_top"]
        seat_w = self.params["seat_w"]
        parts = []

        # Back posts run the full height in one piece — a post spliced at seat
        # level shows as a seam exactly where the light band from the seat lands.
        for sx in (-1, 1):
            parts.append(box("BackPost", (0.08, 0.08, back_top),
                             (sx * 0.225, 0.215, back_top / 2), "oak"))
            parts.append(box("FrontLeg", (0.075, 0.075, 0.44),
                             (sx * 0.225, -0.215, 0.22), "oak"))

        # Seat spans 0.385..0.46, so the legs (to 0.44) die *inside* it rather than
        # meeting its underside on a shared plane.
        parts.append(box("Seat", (seat_w, 0.48, 0.075), (0, 0, 0.4225), "wood"))
        parts.append(box("Apron", (0.46, 0.42, 0.06), (0, 0, 0.355), "oak"))

        # Cushion sunk 0.015 into the seat for the same reason.
        parts.append(box("Cushion", (0.44, 0.40, 0.07), (0, -0.01, 0.48), "teal"))

        # Recessed back panel, held inside the posts' 0.08 depth.
        parts.append(box("BackPanel", (0.38, 0.05, 0.58), (0, 0.215, 0.86), "oak"))
        parts.append(box("BackPanelInlay", (0.26, 0.02, 0.44),
                         (0, 0.183, 0.86), "wood"))

        # Crest rail, stopping 0.03 below the post tops so the finials read.
        parts.append(box("Crest", (0.58, 0.10, 0.14), (0, 0.215, 1.20), "wood"))
        parts.append(box("CrestBand", (0.50, 0.03, 0.045), (0, 0.155, 1.20), "brass"))

        for sx in (-1, 1):
            parts.append(box("Arm", (0.06, 0.405, 0.075),
                             (sx * 0.245, 0.0125, 0.70), "wood"))
            parts.append(box("ArmPost", (0.055, 0.055, 0.24),
                             (sx * 0.245, -0.17, 0.58), "oak"))

        chair = join(parts, "HallChair")
        soften(chair, width=0.009, segments=2)

        # Finials last: they are lathes, and a bevel across a lathe step is the
        # single most expensive thing in this file.
        finials = []
        for sx in (-1, 1):
            finial = lathe("Finial", [
                (0.000, 0.000), (0.048, 0.006), (0.052, 0.026), (0.040, 0.044),
                (0.030, 0.060), (0.034, 0.078), (0.022, 0.096), (0.000, 0.104),
            ], segments=12)
            finial.location = (sx * 0.225, 0.215, back_top)
            finials.append(finish(finial, "brass"))

        return join([chair] + finials, "HallChair")
