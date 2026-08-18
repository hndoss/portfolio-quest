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
"""

import math
import os

import bmesh
import bpy
from mathutils import Vector

__all__ = [
    "PALETTE", "MATS", "reset", "material", "finish", "soften", "lathe",
    "primitive", "join", "ground", "export_glb", "setup_preview",
    "render_preview", "report", "to_three",
]


# --- palette -----------------------------------------------------------------

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


# --- geometry ----------------------------------------------------------------

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


# --- export ------------------------------------------------------------------

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


def report(obj, slug, path=None):
    bbox = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    size = [max(v[i] for v in bbox) - min(v[i] for v in bbox) for i in range(3)]
    kb = f" {os.path.getsize(path) / 1024:.1f}KB" if path else ""

    # Count the evaluated mesh, not obj.data — modifiers like the bevel are not
    # baked into obj.data, so the raw count understates what actually ships.
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    tris = sum(len(p.vertices) - 2 for p in mesh.polygons)
    evaluated.to_mesh_clear()

    print(f"PROP {slug}: {size[0]:.3f} x {size[1]:.3f} x {size[2]:.3f}m "
          f"tris={tris}{kb}")


# --- preview -----------------------------------------------------------------

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
