"""Brass candlestick: a turned baluster stem with a candle in its socket.

The 18-point profile is the whole prop — foot at 0.078 is the widest point and
sets the silhouette, the waist at 0.021 is the narrowest, and the socket at
0.280 is where the candle sinks in.
"""

from lib import Prop, finish, join, lathe, rod


class Candlestick(Prop):
    slug = "candlestick"
    params = {
        "foot_r": 0.078,     # widest point, sets the silhouette
        "waist_r": 0.021,    # narrowest, at 74% of height
        "socket_z": 0.280,
        "candle_h": 0.16,
        "candle_sink": 0.010,
    }

    def build(self):
        p = self.params

        stem = lathe("Stem", [
            (0.000, 0.000), (0.075, 0.000), (0.078, 0.014), (0.068, 0.026),
            (0.032, 0.036), (0.026, 0.058), (0.040, 0.074), (0.030, 0.090),
            (0.022, 0.132), (0.036, 0.152), (0.028, 0.170), (0.021, 0.214),
            (0.032, 0.238), (0.050, 0.252), (0.045, 0.264), (0.026, 0.270),
            (0.024, 0.290), (0.000, 0.290),
        ], segments=18)
        finish(stem, "brass")

        # Sunk into the socket, not resting on its rim.
        candle_h = p["candle_h"]
        candle = rod("Candle", 0.021, candle_h,
                     (0, 0, p["socket_z"] + candle_h / 2),
                     mat="feather", vertices=12)

        return join([stem, candle], "Candlestick")
