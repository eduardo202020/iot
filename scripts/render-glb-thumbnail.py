"""Render a repeatable square catalog thumbnail from a GLB asset with Blender.

Usage:
  blender --background --python scripts/render-glb-thumbnail.py -- input.glb output.png
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def look_at(camera: bpy.types.Object, target: Vector) -> None:
    direction = target - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def main() -> None:
    separator = sys.argv.index("--")
    source_path = Path(sys.argv[separator + 1]).resolve()
    output_path = Path(sys.argv[separator + 2]).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source_path))

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"El GLB no contiene mallas: {source_path}")

    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in corners), min(point.y for point in corners), min(point.z for point in corners)))
    maximum = Vector((max(point.x for point in corners), max(point.y for point in corners), max(point.z for point in corners)))
    center = (minimum + maximum) / 2
    dimensions = maximum - minimum
    longest = max(dimensions)

    # Normalize visual size so scans authored in meters and props authored in
    # centimeters receive the same catalog framing and light intensity.
    target_longest = 2.0
    normalization_scale = target_longest / longest
    roots = [obj for obj in bpy.context.scene.objects if obj.parent is None and obj.type != "CAMERA"]
    for root in roots:
        # Scale the translation as well as the geometry. Without this, multi-part
        # scans whose object origins are far from (0, 0, 0) render off camera.
        root.location = (root.location - center) * normalization_scale
        root.scale *= normalization_scale
    dimensions *= normalization_scale
    longest = target_longest

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    scene.render.filepath = str(output_path)
    scene.render.image_settings.color_mode = "RGBA"
    if scene.world is None:
        scene.world = bpy.data.worlds.new("CatalogWorld")
    scene.world.color = (0.008, 0.018, 0.035)

    world = scene.world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    background.inputs["Color"].default_value = (0.006, 0.017, 0.035, 1.0)
    background.inputs["Strength"].default_value = 0.32

    camera_data = bpy.data.cameras.new("CatalogCamera")
    camera = bpy.data.objects.new("CatalogCamera", camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera_data.lens = 58
    camera_data.sensor_width = 36

    distance = longest * 2.15
    camera.location = Vector((distance * 0.72, -distance, distance * 0.52))
    look_at(camera, Vector((0, 0, dimensions.z * 0.04)))

    key_data = bpy.data.lights.new("Key", "AREA")
    key_data.energy = 900
    key_data.shape = "DISK"
    key_data.size = max(longest * 1.4, 2.0)
    key = bpy.data.objects.new("Key", key_data)
    scene.collection.objects.link(key)
    key.location = Vector((-distance * 0.65, -distance * 0.45, distance * 1.1))
    look_at(key, Vector((0, 0, 0)))

    fill_data = bpy.data.lights.new("Fill", "AREA")
    fill_data.energy = 620
    fill_data.size = max(longest, 1.5)
    fill = bpy.data.objects.new("Fill", fill_data)
    scene.collection.objects.link(fill)
    fill.location = Vector((distance * 0.8, -distance * 0.25, distance * 0.45))
    look_at(fill, Vector((0, 0, 0)))

    rim_data = bpy.data.lights.new("Rim", "AREA")
    rim_data.energy = 1050
    rim_data.size = max(longest * 0.8, 1.2)
    rim = bpy.data.objects.new("Rim", rim_data)
    scene.collection.objects.link(rim)
    rim.location = Vector((-distance * 0.25, distance * 0.75, distance * 0.9))
    look_at(rim, Vector((0, 0, 0)))

    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_depth = "8"
    bpy.ops.render.render(write_still=True)

    triangles = sum(len(mesh.data.loop_triangles) for mesh in meshes)
    print(
        f"MUSEIQ_RENDER source={source_path.name} output={output_path.name} "
        f"meshes={len(meshes)} triangles={triangles} dimensions={tuple(round(value, 3) for value in dimensions)}"
    )


if __name__ == "__main__":
    main()
