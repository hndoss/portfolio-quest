"""Shared modelling helpers for portfolio-quest props.

Import from a build script that Blender runs headless:

    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from lib import *

Conventions enforced here so individual props never restate them:
  * 1 Blender unit = 1 metre = 1 three.js unit
  * every asset is grounded to z = 0, so React places it with no fudge offset
  * export is glTF 2.0 binary, +Y up, modifiers applied
  * base colours are LINEAR (see PALETTE)

`Prop` is the contract every asset implements. See the class docstring.
"""

import math
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass

import bmesh
import bpy
from mathutils import Vector

__all__ = [
    "PALETTE", "MATS", "reset", "material", "finish", "soften", "lathe",
    "primitive", "box", "rod", "join", "ground", "export_glb", "setup_preview",
    "render_preview", "to_three", "Prop", "Check",
]


# Base colours are LINEAR, not sRGB. Linear 0.11 displays as sRGB ~0.37, so
# naively pasting hex values here produces washed-out pastels. glTF stores
# linear too, so whatever is set here is exactly what three.js receives.
# Convert a target sRGB channel s to linear with: ((s + 0.055) / 1.055) ** 2.4
PALETTE = {
    "brass":      ((0.72, 0.44, 0.07), 1.0, 0.30, 1.0),
    "dark_metal": ((0.030, 0.028, 0.026), 0.7, 0.48, 1.0),
    "glass":      ((0.72, 0.85, 0.92), 0.0, 0.06, 0.30),
    "wood":       ((0.330, 0.150, 0.055), 0.0, 0.62, 1.0),
    "wood_light": ((0.520, 0.290, 0.110), 0.0, 0.58, 1.0),
    # Hall furniture sits against #a08453 walls and a #8a5a2e floor. `wood` and
    # `wood_light` are both *lighter* than that (sRGB #9C6C42 and #BF935D), so
    # furniture made from them merges into the wall behind it. `oak` is the
    # dark member of the pair — sRGB #5A3A22, a clear value step below the
    # room — with `wood` serving as its highlight.
    "oak":        ((0.102, 0.042, 0.016), 0.0, 0.66, 1.0),
    "sand":       ((0.62, 0.42, 0.15), 0.0, 0.85, 1.0),
    "ceramic":    ((0.012, 0.045, 0.058), 0.10, 0.38, 1.0),
    "stone":      ((0.360, 0.310, 0.230), 0.0, 0.44, 1.0),
    "ink":        ((0.004, 0.004, 0.008), 0.0, 0.20, 1.0),
    "feather":    ((0.80, 0.75, 0.62), 0.0, 0.70, 1.0),
    "teal":       ((0.020, 0.180, 0.150), 0.0, 0.50, 1.0),
}

MATS = {}


def material(name, color, metalness, roughness, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metalness
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Alpha"].default_value = alpha
    if alpha < 1.0:
        # Required for the exporter to emit alphaMode: BLEND. The attribute was
        # renamed in EEVEE Next, so set whichever this build exposes.
        for attr, value in (("blend_method", "BLEND"),
                            ("surface_render_method", "BLENDED")):
            try:
                setattr(mat, attr, value)
            except (AttributeError, TypeError):
                pass
    return mat


def reset():
    """Empty scene plus a freshly built palette."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()
    for key, (color, metal, rough, alpha) in PALETTE.items():
        MATS[key] = material(key.title().replace("_", ""), color, metal, rough, alpha)


def finish(obj, mat_key, smooth=True):
    obj.data.materials.append(MATS[mat_key])
    for poly in obj.data.polygons:
        poly.use_smooth = smooth
    return obj


def soften(obj, width=0.018, segments=3):
    """Heavy edge rounding — the main cartoon-vs-CAD lever.

    Costly: rounding one crease replaces it with `segments` rings of geometry,
    and on a lathed surface that multiplies across every step. Keep the
    underlying `segments=` of the lathe lean before reaching for a wider bevel.
    """
    bevel = obj.modifiers.new("Bevel", "BEVEL")
    bevel.width = width
    bevel.segments = segments
    bevel.limit_method = "ANGLE"
    bevel.angle_limit = math.radians(35)
    bevel.use_clamp_overlap = True
    return obj


def lathe(name, profile, segments=32, angle=360.0, closed=False):
    """Revolve a 2D silhouette of (radius, height) points around the Z axis.

    Most props here are lathes: domes, pots, bulbs and curved counters are the
    same operation with different curves and sweep angles.

    closed=True treats the profile as a loop (a cross-section rather than an
    outline), which a partial sweep needs so the result is a capped solid.
    """
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, z)) for r, z in profile]
    pairs = list(zip(verts, verts[1:]))
    if closed:
        pairs.append((verts[-1], verts[0]))
    edges = [bm.edges.new(pair) for pair in pairs]

    bmesh.ops.spin(
        bm, geom=edges + verts, axis=(0, 0, 1), cent=(0, 0, 0), dvec=(0, 0, 0),
        angle=math.radians(angle), steps=segments, use_duplicate=False,
    )
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    if closed and angle < 359.9:
        bmesh.ops.holes_fill(bm, edges=bm.edges[:])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def primitive(kind, **kwargs):
    getattr(bpy.ops.mesh, f"primitive_{kind}_add")(**kwargs)
    return bpy.context.active_object


def box(name, size, location, mat, smooth=False):
    """An axis-aligned box of explicit metre dimensions, transform applied.

    `primitive_cube_add` only takes a uniform `size`, so the shape comes from a
    scale — which has to be baked before `join()`, or the joined result inherits
    the active object's scale instead of each part's own.
    """
    obj = primitive("cube", size=1.0, location=location)
    obj.name = name
    obj.scale = size
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, mat, smooth=smooth)


def rod(name, radius, length, location, rotation=(0, 0, 0), mat="dark_metal",
        vertices=10):
    obj = primitive("cylinder", vertices=vertices, radius=radius, depth=length,
                    location=location)
    obj.name = name
    obj.rotation_euler = rotation
    return finish(obj, mat)


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = name
    obj.data.name = name
    return obj


def ground(obj):
    """Apply transforms and sit the object's lowest point exactly on z = 0.

    This is why React can place a prop at a surface height directly, with no
    per-model offset constant.
    """
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    lowest = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
    obj.location.z -= lowest
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


@dataclass(frozen=True)
class Check:
    """One invariant, evaluated against the built mesh."""

    name: str
    ok: bool
    detail: str = ""


class Prop(ABC):
    """One exported asset.

    A subclass sets `slug`, optionally `params`, and implements `build()`.
    Everything the asset contract requires — grounding, export at the origin,
    metrics, invariant checks — happens here, so that no prop restates it and
    no prop can quietly opt out of a rule the runtime depends on.

    `build()` returns raw geometry and must not call `ground()`.

    `params` holds the prop's spec numbers. Keeping them in one named dict is
    what makes a prop reviewable: `(0.032, 0.036)` in a profile list says
    nothing, `waist_r` says what the number is for and what would break if it
    moved. Treat it as read-only.

    Failing checks do not abort the build. The preview still renders, so the
    edit-rebuild-look loop keeps working on a half-finished prop, but
    `build.py` exits non-zero afterwards so a violation cannot ship unnoticed.
    """

    slug = ""
    params = {}

    def __init__(self):
        if not self.slug:
            raise ValueError(f"{type(self).__name__} must set a slug")
        self.obj = None

    @abstractmethod
    def build(self):
        """Assemble and return the object."""

    def checks(self, obj):
        """Invariants for this prop. Override to add shape rules, and yield
        from `super().checks(obj)` to keep the contract-level ones."""
        lowest = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
        yield Check("grounded", abs(lowest) < 1e-6, f"lowest vertex z={lowest:.6f}")

    def make(self):
        self.obj = ground(self.build())
        return self.obj

    def verify(self):
        """Return the checks that failed, printing every result."""
        failed = []
        for check in self.checks(self.obj):
            if not check.ok:
                failed.append(check)
                print(f"  FAIL {self.slug}/{check.name}: {check.detail}")
        return failed

    def export(self, out_dir):
        """Write the .glb and return this prop's manifest entry."""
        path = export_glb(self.obj, out_dir, self.slug)
        dims = self.obj.dimensions

        # Count the evaluated mesh: modifiers like the bevel are not baked into
        # obj.data, so the raw count understates what actually ships.
        evaluated = self.obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
        mesh = evaluated.to_mesh()
        tris = sum(len(poly.vertices) - 2 for poly in mesh.polygons)
        evaluated.to_mesh_clear()

        bytes_ = os.path.getsize(path)
        print(f"PROP {self.slug}: {dims.x:.3f} x {dims.y:.3f} x {dims.z:.3f}m "
              f"tris={tris} {bytes_ / 1024:.1f}KB")
        return {
            "slug": self.slug,
            "tris": tris,
            "bytes": bytes_,
            # three.js axes, so the runtime can use these without converting.
            "size": [round(dims.x, 4), round(dims.z, 4), round(dims.y, 4)],
        }


def to_three(vec):
    """Blender (x, y, z) -> three.js (x, z, -y), matching the +Y-up export."""
    return (vec.x, vec.z, -vec.y)


def export_glb(obj, out_dir, slug):
    """Export one object at the origin, unrotated. Placement is React's job."""
    keep_loc, keep_rot = obj.location.copy(), obj.rotation_euler.copy()
    obj.location = (0, 0, 0)
    obj.rotation_euler = (0, 0, 0)

    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    path = os.path.join(out_dir, f"{slug}.glb")
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB",
        use_selection=True, export_yup=True, export_apply=True,
    )

    obj.location, obj.rotation_euler = keep_loc, keep_rot
    return path


def setup_preview(camera_at, look_at, lens=45, key=380, fill=140):
    """Eye-level preview render. Always look at the result before shipping:
    dimensions and tri counts say nothing about whether a silhouette reads."""
    scene = bpy.context.scene
    for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue

    # AgX lifts and desaturates, which would misrepresent the exported colours.
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass

    bpy.ops.object.camera_add(location=camera_at)
    camera = bpy.context.active_object
    scene.camera = camera
    camera.data.lens = lens
    aim = Vector(look_at) - camera.location
    camera.rotation_euler = aim.to_track_quat("-Z", "Y").to_euler()

    for loc, energy, size in ((( 1.6, -3.4, 3.6), key, 3.5),
                              ((-3.2, -2.0, 2.4), fill, 3.5)):
        bpy.ops.object.light_add(type="AREA", location=loc)
        bpy.context.active_object.data.energy = energy
        bpy.context.active_object.data.size = size

    finish(primitive("plane", size=30, location=(0, 0, -0.001)),
           "dark_metal", smooth=False)
    return scene


def render_preview(path, width=960, height=620):
    scene = bpy.context.scene
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.filepath = path
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
