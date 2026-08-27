"""Central-hall furniture: seating, tables, and hearth irons.

    npm run models

Everything the hall needed once the welcome desk moved out and the floor was
left bare. The desk props (bell, quill, hourglass) belong to the Office now;
nothing here depends on them.

Orientation convention, which matters for anything with a front:
three.js `z = -blender y`, so a chair whose back is at **+Y in Blender** faces
**+Z in three.js**, which is React's un-rotated forward. Long objects are built
along Y so they run along Z in the room without a placement rotation.
"""

import math

import bpy

from lib import render_preview, setup_preview

from .andiron import Andiron
from .bench import Bench
from .candlestick import Candlestick
from .chair import Chair
from .fire_irons import FireIrons
from .log_basket import LogBasket
from .refectory_table import RefectoryTable
from .side_table import SideTable

BLEND = "great-hall.blend"
PREVIEW = "_preview_hall.png"

PROPS = [Chair(), SideTable(), RefectoryTable(), Bench(),
         Candlestick(), Andiron(), LogBasket(), FireIrons()]

# Preview rows. Laid out in one line the row spanned 11m while `setup_preview`'s
# lights sit near the origin — the chair blew out to white and `fire-irons` fell
# off the frame entirely. Two rows, with the two long pieces turned broadside.
BACK_ROW = ["refectory-table", "hall-bench"]
FRONT_ROW = ["hall-chair", "hall-side-table", "log-basket", "fire-irons",
             "candlestick", "andiron"]

_span = 0.0


def _row(by_slug, slugs, y, turn=False):
    cursor = 0.0
    for slug in slugs:
        obj = by_slug[slug].obj
        if turn:
            obj.rotation_euler = (0, 0, math.pi / 2)
        # Rotating swaps which dimension is the row's width.
        width = obj.dimensions.y if turn else obj.dimensions.x
        cursor += width / 2 + 0.45
        obj.location = (cursor, y, 0)
        cursor += width / 2
    return cursor


def layout(by_slug):
    """Preview and .blend only — `export_glb` restores both location and
    rotation, so every prop still ships at the origin, unrotated."""
    global _span
    back = _row(by_slug, BACK_ROW, 1.7, turn=True)
    front = _row(by_slug, FRONT_ROW, -0.9)
    _span = max(back, front)


def preview(path):
    # Low key/fill, then a spread of area lights along the row — one pair near
    # the origin cannot light 6m of furniture evenly.
    setup_preview(camera_at=(_span / 2, -7.6, 3.1),
                  look_at=(_span / 2, 0.4, 0.55), lens=38, key=90, fill=45)
    for x in (0.6, _span / 2, _span - 0.6):
        bpy.ops.object.light_add(type="AREA", location=(x, -3.2, 3.4))
        light = bpy.context.active_object
        light.data.energy = 170
        light.data.size = 3.0

    render_preview(path, width=1500, height=680)
