"""Create a mobile-friendly GLB while preserving the source asset.

Usage:
  blender --background --python scripts/optimize-glb-mobile.py -- input.glb output.glb [max_texture_px]
"""

from __future__ import annotations

import sys
from pathlib import Path

import bpy
from mathutils import Vector


def main() -> None:
    separator = sys.argv.index("--")
    source_path = Path(sys.argv[separator + 1]).resolve()
    output_path = Path(sys.argv[separator + 2]).resolve()
    max_texture_px = int(sys.argv[separator + 3]) if len(sys.argv) > separator + 3 else 1024
    output_path.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source_path))

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"El GLB no contiene mallas: {source_path}")

    original_triangles = sum(len(obj.data.loop_triangles) for obj in meshes)
    resized_images = 0
    for image in bpy.data.images:
        width, height = image.size
        longest = max(width, height)
        if longest <= max_texture_px:
            continue
        ratio = max_texture_px / longest
        image.scale(max(1, round(width * ratio)), max(1, round(height * ratio)))
        resized_images += 1

    # Keep the whole scan within a mobile-friendly triangle budget. Some source
    # files split a single specimen into many meshes, so a per-mesh ceiling alone
    # is not enough (the gold scan, for example, contains 23 separate meshes).
    max_total_triangles = 120_000
    global_ratio = min(1.0, max_total_triangles / max(1, original_triangles))
    for obj in meshes:
        triangles = len(obj.data.loop_triangles)
        target_ratio = min(global_ratio, 50_000 / max(1, triangles))
        if target_ratio >= 0.999:
            continue
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        modifier = obj.modifiers.new(name="MuseIQ mobile decimate", type="DECIMATE")
        modifier.ratio = max(0.01, target_ratio)
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.select_set(False)

    # Export every specimen centered and with a longest dimension of one meter.
    # That gives the native viewer and AR scene one predictable scale across all
    # source scans, regardless of the units used during photogrammetry.
    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector(tuple(min(point[axis] for point in corners) for axis in range(3)))
    maximum = Vector(tuple(max(point[axis] for point in corners) for axis in range(3)))
    center = (minimum + maximum) / 2
    longest_dimension = max(maximum - minimum)
    normalization_scale = 1.0 / max(longest_dimension, 0.000001)
    roots = [obj for obj in bpy.context.scene.objects if obj.parent is None and obj.type != "CAMERA"]
    for root in roots:
        root.location = (root.location - center) * normalization_scale
        root.scale *= normalization_scale

    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format="GLB",
        export_apply=True,
        export_image_format="AUTO",
        export_jpeg_quality=78,
    )

    optimized_triangles = sum(len(obj.data.loop_triangles) for obj in meshes)
    print(
        f"MUSEIQ_OPTIMIZE source={source_path.name} output={output_path.name} "
        f"triangles={original_triangles}->{optimized_triangles} "
        f"resized_images={resized_images} max_texture_px={max_texture_px}"
    )


if __name__ == "__main__":
    main()
