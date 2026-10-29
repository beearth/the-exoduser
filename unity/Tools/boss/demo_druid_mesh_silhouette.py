"""Dark Druid demo v0 mesh silhouette study; execute with Blender 5.1 -b -P.

The input GLB is read-only. This first gate edits its real mesh vertices and
stops before remesh, UV projection, rigging or Unity if the silhouette fails.
"""
from pathlib import Path
import hashlib
import json
import math
import shutil

import bpy
from mathutils import Vector

SOURCE = Path('I:/EXODUSER-Storage/Meshy/dd_body_20261028_2202/model.glb')
SOURCE_SHA = '2651AAEB1AF39851F296630266E176740ADDB210027DEE71600A6763AC328A7B'
WORK = Path('G:/exoduser-wt/demo-art-boss/_work')
OUT = Path('I:/EXODUSER-Storage/demo-art/boss')
WORK.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)


def smooth(a, b, x):
    t = max(0.0, min(1.0, (x-a)/(b-a)))
    return t*t*(3-2*t)


def bell(x, center, radius):
    return max(0.0, 1.0-abs(x-center)/radius)**2


actual = hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper()
assert actual == SOURCE_SHA, (actual, SOURCE_SHA)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
before = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
factor = 2.70 / before.dimensions.z
before.scale = (factor, factor, factor)
bpy.context.view_layer.update()
low = min((before.matrix_world @ v.co).z for v in before.data.vertices)
before.location.z -= low
bpy.ops.object.select_all(action='DESELECT')
before.select_set(True)
bpy.context.view_layer.objects.active = before
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
before.name = 'BEFORE_original_mesh_2p70m_normalized'
before.hide_set(True)
candidate = before.copy()
candidate.data = before.data.copy()
bpy.context.scene.collection.objects.link(candidate)
candidate.name = 'AFTER_local_sculpt_candidate'
candidate.hide_set(False)

# All dimensions below are in metres after normalizing the original's 1.904 m
# bound to the locked 2.70 m antler bound. These hand-authored sculpt fields
# act on the actual 97,789 vertex source mesh, not a generated replacement.
for vertex in candidate.data.vertices:
    x, y, z = vertex.co
    ax = abs(x)
    sign = 1 if x >= 0 else -1

    # Shoulder feathers fall into a vertical shroud. The centre remains near
    # 44 cm torso width; outer feathers approach a 70 cm cloak width.
    shroud_height = smooth(0.66, 1.26, z) * (1-smooth(2.12, 2.32, z))
    outer = smooth(0.17, 0.43, ax)
    shoulder = bell(z, 1.95, 0.36) * outer
    x *= 1 - (0.30*shroud_height*outer + 0.07*shoulder)
    z -= shoulder * (0.075 if sign < 0 else 0.105)

    # The cursed upper back bends forward; the mask and antlers follow the
    # neck while the hips stay planted. The right shoulder sits lower.
    hunch = smooth(1.52, 2.30, z)
    y -= 0.095*hunch
    x -= 0.022*smooth(1.48, 2.27, z)

    # Sink the armour-like breast and soften its V-shaped depth without
    # erasing the existing sternum and rib ornament.
    chest = bell(z, 1.61, 0.31)*math.exp(-(x/0.31)**2)
    front = 1-smooth(-0.10, 0.02, y)
    y += 0.047*chest*front
    x *= 1-0.075*chest

    # Long, uneasy arms: pull the distal forearms/hands down by a local falloff
    # while retaining shoulder attachment and the original asymmetry.
    arm = smooth(0.34, 0.50, abs(x)) * bell(z, 1.20, 0.60)
    z -= 0.12*arm
    x -= sign*0.015*arm

    # Reduce the heavy boots/calves around each limb's own centre, rather than
    # uniformly scaling the body or moving the feet off the ground.
    leg = 1-smooth(0.72, 1.08, z)
    foot = 1-smooth(0.18, 0.42, z)
    if ax < 0.40:
        centre = 0.225*sign
        x = centre + (x-centre)*(1-0.11*leg-0.13*foot)
        y *= 1-0.08*leg-0.09*foot

    vertex.co = (x, y, z)

candidate.data.update()
for poly in candidate.data.polygons:
    poly.use_smooth = True

neutral = bpy.data.materials.new('Neutral_silhouette_gate')
neutral.diffuse_color = (0.20, 0.21, 0.22, 1)
neutral.use_nodes = True
shader = neutral.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = neutral.diffuse_color
shader.inputs['Roughness'].default_value = 0.85
original_material = before.data.materials[0]

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (0.12, 0.12, 0.12)
scene.view_settings.view_transform = 'Standard'


def area(name, xyz, power, size):
    lamp = bpy.data.lights.new(name, 'AREA')
    lamp.energy = power
    lamp.size = size
    obj = bpy.data.objects.new(name, lamp)
    scene.collection.objects.link(obj)
    obj.location = xyz
    obj.rotation_euler = (Vector((0, 0, 1.4)) - obj.location).to_track_quat('-Z', 'Y').to_euler()


area('Key_matched', (-3, -4, 5), 700, 4)
area('Fill_matched', (3, -2, 3), 200, 4)
area('Rim_matched', (1, 4, 4), 500, 3)
cam_data = bpy.data.cameras.new('Matched_ortho')
cam = bpy.data.objects.new('Matched_ortho', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = 'ORTHO'


def render(label, name, eye, scale):
    cam.location = eye
    cam.rotation_euler = (Vector((0, 0, 1.35))-cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.ortho_scale = scale
    scene.render.filepath = str(OUT / f'{label}_{name}_neutral.png')
    bpy.ops.render.render(write_still=True)


views = (
    ('front', (0, -5, 1.35), 5.6),
    ('side', (5, 0, 1.35), 5.6),
    ('game55', (3, -5, 2.8), 5.6),
    ('game_size', (3, -5, 2.8), 17.0),
)
for obj, label in ((before, 'before'), (candidate, 'after')):
    before.hide_render = obj is not before
    candidate.hide_render = obj is not candidate
    obj.data.materials[0] = neutral
    for name, eye, scale in views:
        render(label, name, eye, scale)
    obj.data.materials[0] = original_material

before.hide_render = True
candidate.hide_render = False
blend = WORK / 'dark_druid_demo_silhouette_gate.blend'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
shutil.copy2(blend, OUT / blend.name)


def bounds(obj):
    xs = [v.co.x for v in obj.data.vertices]
    ys = [v.co.y for v in obj.data.vertices]
    zs = [v.co.z for v in obj.data.vertices]
    return [[min(xs), min(ys), min(zs)], [max(xs), max(ys), max(zs)]]


manifest = {
    'gate': 'silhouette_only',
    'source_glb': str(SOURCE),
    'source_sha256': actual,
    'before_bounds_m': bounds(before),
    'after_bounds_m': bounds(candidate),
    'vertices': len(candidate.data.vertices),
    'faces': len(candidate.data.polygons),
    'blend': str(OUT / blend.name),
    'views': [x[0] for x in views],
    'render_engine': scene.render.engine,
    'actual_game_capture': False,
    'remesh_decimate_projection_rig_animation': 'held_until_silhouette_gate',
}
(OUT / 'silhouette_manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
print('DEMO_SILHOUETTE', json.dumps(manifest))
