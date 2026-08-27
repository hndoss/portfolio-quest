"""Build one scene's props: export the .glb files and a manifest fragment.

    blender --background --python assets/blender/build.py -- welcome_hall

Everything a scene needs is declared in its package (`PROPS`, `layout`,
`preview`, `BLEND`, `PREVIEW`), so adding a prop means adding one module and
one entry to `PROPS` — not editing four parallel lists.

Exits non-zero if any prop's invariant checks failed. The preview still
renders first, so the edit-rebuild-look loop keeps working on a prop that is
mid-revision; only shipping is blocked.
"""

import importlib
import json
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
GLB_DIR = os.path.join(ROOT, "public", "models", "props")
FRAGMENTS = os.path.join(HERE, "_manifest")

sys.path.insert(0, HERE)
from lib import reset  # noqa: E402


def main(name):
    # Importing the package instantiates its Prop objects, which happens before
    # reset() wipes the scene — safe only because no __init__ touches bpy.
    scene = importlib.import_module(name)

    reset()
    os.makedirs(GLB_DIR, exist_ok=True)
    os.makedirs(FRAGMENTS, exist_ok=True)

    # Verify each prop as it is built. `layout()` moves props into the preview
    # arrangement, so anything checked afterwards would be measuring the
    # preview, not the asset.
    by_slug, failed = {}, []
    for prop in scene.PROPS:
        if prop.slug in by_slug:
            sys.exit(f"duplicate slug {prop.slug!r} in {name}.PROPS")
        prop.make()
        failed += prop.verify()
        by_slug[prop.slug] = prop

    scene.layout(by_slug)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, scene.BLEND))

    entries = [prop.export(GLB_DIR) for prop in scene.PROPS]

    with open(os.path.join(FRAGMENTS, f"{name}.json"), "w") as fh:
        json.dump({"scene": name, "props": entries}, fh, indent=2)
        fh.write("\n")

    preview_path = os.path.join(HERE, scene.PREVIEW)
    scene.preview(preview_path)
    print(f"\npreview: {preview_path}")

    if failed:
        print(f"\n{len(failed)} check(s) failed in {name}")
        sys.exit(1)


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(args) != 1:
        sys.exit("usage: blender --background --python build.py -- <scene>")
    main(args[0])
