"""Welcome-hall desk and its counter props.

    npm run models

Style: exaggerate the primary shape, simplify secondary detail, and round every
edge much harder than realism would. Precision reads as cold; chunky beveled
forms read as friendly and stay legible from across a room.

Prints three.js-space placements at the end — paste those into
src/components/canvas/WelcomeDesk.tsx when geometry moves.
"""

import math

from lib import render_preview, setup_preview, to_three

from .bell import Bell
from .desk import DESK_TOP, PROP_RADIUS, Desk
from .hourglass import Hourglass
from .quill import Quill

BLEND = "welcome-hall.blend"
PREVIEW = "_preview.png"

# Build order is load-bearing: the counter props are placed relative to the
# desk's arc centre, which only exists once the desk has been built.
PROPS = [Bell(), Quill(), Hourglass(), Desk()]

# Bearing in degrees along the counter arc, measured from its centre.
COUNTER = {"desk-bell": -13.0, "quill-inkpot": 1.5, "hourglass": 14.0}


def layout(by_slug):
    """Stand the counter props on the desk. Preview and .blend only —
    `export_glb` restores location and rotation, so every prop still ships at
    the origin, unrotated."""
    centre = by_slug["welcome-desk"].arc_centre
    for slug, degrees in COUNTER.items():
        obj = by_slug[slug].obj
        theta = math.radians(degrees)
        obj.location = (
            centre.x + PROP_RADIUS * math.sin(theta),
            centre.y - PROP_RADIUS * math.cos(theta),
            DESK_TOP,
        )
        obj.rotation_euler = (0, 0, theta)

    print("\n--- paste into WelcomeDesk.tsx (three.js axes) ---")
    print(f"const COUNTER_HEIGHT = {DESK_TOP}")
    for slug in COUNTER:
        obj = by_slug[slug].obj
        # y is the counter height, printed as the named constant instead.
        x, _, z = to_three(obj.location)
        print(f"  {obj.name:<16} "
              f"position={{[{x:.3f}, COUNTER_HEIGHT, {z:.3f}]}} "
              f"rotation={{[0, {obj.rotation_euler.z:.3f}, 0]}}")


def preview(path):
    setup_preview(camera_at=(0.9, -5.4, 1.75), look_at=(0.0, -0.9, 1.00), lens=42)
    render_preview(path)
