"""Demo v0 Dark Druid R2: replace the failed torso/feather/boot surfaces.

Offline Blender silhouette gate only. The original GLB and R1 remain read-only;
no SDF, old staff loft, local proportional scaling, Unity, rig, or GLB export.
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
WORK = Path('G:/exoduser-wt/demo-art-boss/_work/r2')
OUT = Path('I:/EXODUSER-Storage/demo-art/boss/r2')
WORK.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest().upper() == SOURCE_SHA

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
source = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
scale = 2.70/source.dimensions.z
source.scale = (scale, scale, scale)
bpy.context.view_layer.update()
source.location.z -= min((source.matrix_world @ v.co).z for v in source.data.vertices)
bpy.ops.object.select_all(action='DESELECT')
source.select_set(True)
bpy.context.view_layer.objects.active = source
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
source.name = 'Original_Meshy_unchanged_surface_reference'
source.hide_set(True)

neutral = bpy.data.materials.new('R2_Neutral_surface_gate')
neutral.diffuse_color = (.20, .21, .22, 1)
neutral.use_nodes = True
shader = neutral.node_tree.nodes.get('Principled BSDF')
shader.inputs['Base Color'].default_value = neutral.diffuse_color
shader.inputs['Roughness'].default_value = .88


def mesh_object(name, verts, faces):
    mesh = bpy.data.meshes.new(name+'_mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(neutral)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj


# Preserve the original sculpted stag skull, antlers and upper hair. Every
# torso/feather/armour/boot face below this mask is absent from the R2 render.
# The source mesh remains intact and hidden in the same .blend for comparison.
old = source.data
kept_faces = []
used = set()
for face in old.polygons:
    ids = tuple(face.vertices)
    centre = sum((old.vertices[i].co for i in ids), Vector())/len(ids)
    keep = centre.z >= 2.20 or (centre.z >= 1.94 and abs(centre.x) <= .245)
    if keep:
        kept_faces.append(ids)
        used.update(ids)
mapping = {idx: pos for pos, idx in enumerate(sorted(used))}
retained = mesh_object('R2_Retained_stag_skull_antlers',
                       [tuple(old.vertices[i].co) for i in sorted(used)],
                       [tuple(mapping[i] for i in f) for f in kept_faces])


def ring_shell(name, stations, sides=16, rib=False):
    """Hand specified retopology rings for a new anatomical surface."""
    verts = []
    faces = []
    for r, (cx, cy, z, rx, ry) in enumerate(stations):
        for i in range(sides):
            a = 2*math.pi*i/sides
            x = cx+rx*math.cos(a)
            y = cy+ry*math.sin(a)
            if rib and 1.48 < z < 1.95 and math.sin(a) < -.2:
                # The front sternum caves in, while the side ribs catch light.
                y += .035*(1-abs(math.cos(a)))
                y -= .012*abs(math.cos(a))*math.sin(27*z)
            verts.append((x, y, z))
        if r:
            prev = (r-1)*sides
            curr = r*sides
            for i in range(sides):
                j = (i+1)%sides
                faces.append((prev+i, prev+j, curr+j, curr+i))
    faces.append(tuple(reversed(range(sides))))
    faces.append(tuple((len(stations)-1)*sides+i for i in range(sides)))
    obj = mesh_object(name, verts, faces)
    bevel = obj.modifiers.new('Soft_anatomical_planes', 'SUBSURF')
    bevel.levels = 1
    bevel.render_levels = 1
    return obj


# Bent, sunken ribcage replaces the source's heroic V breastplate outright.
torso = ring_shell('R2_New_hunched_ribcage', [
    (-.040, -.070, 1.04, .105, .090),
    (-.035, -.052, 1.18, .125, .105),
    (-.026, -.038, 1.34, .113, .095),
    (-.036, -.055, 1.52, .125, .100),
    (-.056, -.074, 1.70, .146, .098),
    (-.064, -.098, 1.86, .154, .103),
    (-.078, -.135, 2.00, .118, .094),
    (-.088, -.175, 2.12, .070, .065),
    (-.090, -.185, 2.20, .045, .047),
], rib=True)


def cloth_panel(name, rows, width_segments=7, wave=0):
    """Editable quad drape drawn from explicit inner/outer cloth edge points."""
    vertices = []
    faces = []
    for row, (z, xi, yi, xo, yo) in enumerate(rows):
        for j in range(width_segments):
            t = j/(width_segments-1)
            x = xi+(xo-xi)*t
            y = yi+(yo-yi)*t + .016*math.sin(2.7*row+3.4*t+wave)*t*(1-t)
            zz = z + .012*math.sin(row*2.1+t*4+wave)*t*(1-t)
            vertices.append((x,y,zz))
        if row:
            prev = (row-1)*width_segments
            curr = row*width_segments
            for j in range(width_segments-1):
                faces.append((prev+j,prev+j+1,curr+j+1,curr+j))
    obj = mesh_object(name, vertices, faces)
    solid = obj.modifiers.new('Worn_cloth_thickness','SOLIDIFY')
    solid.thickness = .005
    sub = obj.modifiers.new('Worn_cloth_softness','SUBSURF')
    sub.levels = 1
    sub.render_levels = 1
    return obj


# Three continuous, irregular cloth sheets replace the source's stacked feather
# armour. The front stays open to show the wasted chest and separated legs.
left_drape = cloth_panel('R2_Left_worn_shroud', [
    (2.035,-.075,-.095,-.235,.010),
    (1.885,-.085,-.072,-.277,.006),
    (1.690,-.091,-.060,-.286,.025),
    (1.445,-.073,-.050,-.271,.061),
    (1.205,-.063,-.055,-.260,.070),
    (.955,-.067,-.052,-.290,.073),
    (.710,-.055,-.047,-.256,.085),
    (.445,-.052,-.039,-.232,.092),
], wave=.3)
right_drape = cloth_panel('R2_Right_worn_shroud', [
    (1.975,.055,-.060,.235,.028),
    (1.830,.083,-.050,.267,.043),
    (1.620,.084,-.033,.278,.063),
    (1.390,.068,-.030,.253,.077),
    (1.145,.053,-.034,.245,.093),
    (.880,.064,-.023,.267,.100),
    (.620,.058,-.012,.255,.105),
    (.495,.070,-.009,.226,.090),
], wave=1.7)
back_drape = cloth_panel('R2_Back_worn_shroud', [
    (2.025,-.195,.050,.195,.050),
    (1.830,-.245,.123,.258,.114),
    (1.590,-.255,.170,.259,.163),
    (1.330,-.262,.190,.265,.181),
    (1.080,-.278,.203,.273,.196),
    (.800,-.286,.209,.269,.208),
    (.560,-.263,.211,.266,.214),
    (.365,-.236,.201,.241,.207),
], width_segments=11, wave=2.2)


def limb(name, stations, sides=10):
    return ring_shell(name, stations, sides=sides)


left_arm = limb('R2_Left_withered_arm', [
    (-.159,-.096,1.914,.067,.067),
    (-.251,-.074,1.733,.056,.052),
    (-.324,-.090,1.495,.046,.043),
    (-.395,-.115,1.294,.039,.037),
    (-.438,-.135,1.121,.032,.030),
    (-.442,-.143,1.051,.045,.032),
    (-.452,-.147,.985,.042,.027),
])
right_arm = limb('R2_Right_withered_arm', [
    (.157,-.075,1.866,.067,.063),
    (.242,-.068,1.674,.052,.048),
    (.320,-.085,1.450,.045,.040),
    (.385,-.104,1.242,.036,.034),
    (.416,-.119,1.080,.031,.029),
    (.426,-.128,1.010,.041,.031),
    (.432,-.136,.945,.038,.025),
])

# Two bowed, fragile legs and single-piece pointed boots replace the bulky
# original shin guards and feet; no split fingers or long detachable claws.
left_leg = limb('R2_Left_thin_leg_boot', [
    (-.100,.005,1.130,.078,.072),
    (-.125,-.006,.850,.062,.060),
    (-.146,-.015,.595,.047,.048),
    (-.158,-.018,.342,.037,.040),
    (-.166,-.022,.175,.040,.045),
    (-.169,-.050,.095,.049,.066),
    (-.168,-.097,.047,.055,.095),
    (-.171,-.141,.031,.038,.048),
])
right_leg = limb('R2_Right_thin_leg_boot', [
    (.094,.013,1.125,.079,.070),
    (.132,.025,.830,.062,.061),
    (.146,.015,.560,.048,.046),
    (.147,.002,.295,.037,.039),
    (.154,-.010,.156,.040,.044),
    (.153,-.040,.086,.050,.067),
    (.155,-.084,.041,.052,.088),
    (.154,-.135,.028,.036,.047),
])

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.12,.12,.12)
scene.view_settings.view_transform = 'Standard'


def area(name, xyz, power, size):
    lamp = bpy.data.lights.new(name,'AREA')
    lamp.energy = power
    lamp.size = size
    obj = bpy.data.objects.new(name,lamp)
    scene.collection.objects.link(obj)
    obj.location = xyz
    obj.rotation_euler = (Vector((0,0,1.4))-obj.location).to_track_quat('-Z','Y').to_euler()


area('Key_matched',(-3,-4,5),700,4)
area('Fill_matched',(3,-2,3),200,4)
area('Rim_matched',(1,4,4),500,3)
cam_data = bpy.data.cameras.new('Matched_ortho')
cam = bpy.data.objects.new('Matched_ortho',cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.type = 'ORTHO'


def render(label,name,eye,scale):
    cam.location = eye
    cam.rotation_euler = (Vector((0,0,1.35))-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.ortho_scale = scale
    scene.render.filepath = str(OUT / f'{label}_{name}_neutral.png')
    bpy.ops.render.render(write_still=True)


views = (
    ('front',(0,-5,1.35),5.6),
    ('side',(5,0,1.35),5.6),
    ('game55',(3,-5,2.8),5.6),
    ('game_size',(3,-5,2.8),17.0),
)
source_original_material = source.data.materials[0]
source.data.materials[0] = neutral
candidate_objects = [retained,torso,left_drape,right_drape,back_drape,
                     left_arm,right_arm,left_leg,right_leg]
for obj in candidate_objects:
    obj.hide_render = True
source.hide_render = False
for name,eye,scale in views:
    render('before_original',name,eye,scale)
source.data.materials[0] = source_original_material
source.hide_render = True
for obj in candidate_objects:
    obj.hide_render = False
for name,eye,scale in views:
    render('after_r2',name,eye,scale)

blend = WORK / 'dark_druid_demo_r2_surface_rebuild.blend'
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
shutil.copy2(blend,OUT/blend.name)
metrics = {
    'source':str(SOURCE), 'source_sha256':SOURCE_SHA,
    'method':'source_face_removal_plus_explicit_anatomy_and_cloth_quad_retopology',
    'retained_source_faces':len(kept_faces),
    'removed_source_faces':len(old.polygons)-len(kept_faces),
    'candidate_objects':[o.name for o in candidate_objects],
    'views':[v[0] for v in views],
    'actual_game_capture':False,
    'unity_rig_export':False,
}
(OUT/'r2_metrics.json').write_text(json.dumps(metrics,indent=2)+'\n',encoding='utf-8')
print('R2_METRICS',json.dumps(metrics))
