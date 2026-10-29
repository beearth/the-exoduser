"""Offline warrior silhouette candidate; source GLB and rig remain untouched."""
import bpy, json, math, hashlib, pathlib, faulthandler
import numpy as np
faulthandler.dump_traceback_later(25, repeat=True)
from mathutils import Vector

ROOT = pathlib.Path('I:/EXODUSER-Storage/demo-art/character/warrior-r1')
ROOT.mkdir(parents=True, exist_ok=True)
SRC = pathlib.Path('I:/EXODUSER-Storage/Meshy/warrior_rig_20261027_2025/rigged_character_glb.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SRC))
rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
body = next(o for o in bpy.context.scene.objects if o.type == 'MESH' and o.vertex_groups)
for obj in list(bpy.context.scene.objects):
    if obj not in (rig, body):
        bpy.data.objects.remove(obj, do_unlink=True)

def fingerprint():
    return {
        'bones': [(b.name, b.parent.name if b.parent else None, [list(r) for r in b.matrix_local]) for b in rig.data.bones],
        'weights': hashlib.sha256(str([(v.index, [(g.group, g.weight) for g in v.groups]) for v in body.data.vertices]).encode()).hexdigest(),
        'vertices': len(body.data.vertices), 'polygons': len(body.data.polygons),
        'uv_sha256': hashlib.sha256(str([list(v.uv) for v in body.data.uv_layers.active.data]).encode()).hexdigest(),
    }
print('STAGE fingerprint', flush=True)
before = fingerprint()
print('STAGE world points', flush=True)
mw = body.matrix_world.copy()
inv = mw.inverted()
points = [mw @ v.co for v in body.data.vertices]
lo = min(p.z for p in points); hi = max(p.z for p in points); height = hi-lo
head = rig.matrix_world @ rig.data.bones['Head'].head_local
headfront = rig.matrix_world @ rig.data.bones['headfront'].head_local
front = headfront-head; front.z=0
if front.length < .0001: front = Vector((0,-1,0))
front.normalize(); back=-front
right=front.cross(Vector((0,0,1))).normalized()
center = Vector((0,0,lo))
texture = next(n.image for n in body.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE' and n.image and n.image.colorspace_settings.name=='sRGB')
print('STAGE image', texture.size[:], flush=True)
pixels=list(texture.pixels[:]); tw,th=texture.size
print('STAGE UV', len(body.data.loops), flush=True)
colors={}
uv=body.data.uv_layers.active
loop_vertices=np.empty(len(body.data.loops), dtype=np.int32)
body.data.loops.foreach_get('vertex_index', loop_vertices)
loop_uv=np.empty(len(body.data.loops)*2, dtype=np.float32)
uv.data.foreach_get('uv',loop_uv)
loop_uv=loop_uv.reshape(-1,2)
for vi,(u,v) in zip(loop_vertices,loop_uv):
    vi=int(vi)
    if vi not in colors:
        ix=min(tw-1,max(0,int(u*tw))); iy=min(th-1,max(0,int(v*th)))
        k=(iy*tw+ix)*4; colors[vi]=pixels[k:k+3]

print('STAGE morph', flush=True)
basis=body.shape_key_add(name='Basis')
candidate=body.shape_key_add(name='CapeSilhouette_R1')
changed=[]
for v,p in zip(body.data.vertices,points):
    c=colors.get(v.index,[0,0,0]); h=(p.z-lo)/height
    depth=(p-center).dot(back); lateral=(p-center).dot(right)
    # Restrict sculpt to rear burgundy cloth below shoulder, excluding skin/boots.
    if .16<h<.78 and depth>.055 and c[0]>c[1]*1.16 and c[0]>c[2]*1.10:
        vertical=math.sin(math.pi*(h-.16)/.62)**1.4
        rear=min(1,max(0,(depth-.055)/.06))
        offset=right*(lateral*.48*vertical*rear)+back*(.055*vertical*rear)
        candidate.data[v.index].co=inv@(p+offset)
        changed.append(v.index)
print('STAGE render', len(changed), flush=True)
candidate.value=0
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=16
scene.render.resolution_x=768; scene.render.resolution_y=768; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
scene.world=bpy.data.worlds.new('NeutralWorld'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.11,.11,.11,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
scene.view_settings.view_transform='AgX'
camdata=bpy.data.cameras.new('ReviewCamera'); cam=bpy.data.objects.new('ReviewCamera',camdata)
scene.collection.objects.link(cam); scene.camera=cam; camdata.type='ORTHO'; camdata.ortho_scale=height*1.13
target=Vector((0,0,lo+height*.5))
def aim(obj, point): obj.rotation_euler=(point-obj.location).to_track_quat('-Z','Y').to_euler()
for name,pos,power,size in [('Key',front*3+right*2+Vector((0,0,4)),650,4),('Fill',front*2-right*3+Vector((0,0,2)),280,3)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=pos; aim(obj,target)
def render(name, direction, game=False):
    cam.location=target+direction.normalized()*5; aim(cam,target)
    scene.render.resolution_x=1920 if game else 768; scene.render.resolution_y=1080 if game else 768
    camdata.ortho_scale=height*math.cos(.85)/.095*1920/1080 if game else height*1.13
    scene.render.filepath=str(ROOT/(name+'.png')); bpy.ops.render.render(write_still=True)
for val,label in [(0,'before'),(1,'after')]:
    candidate.value=val
    render(label+'_front',front)
    render(label+'_rear',back)
    render(label+'_game',front*math.cos(.85)+Vector((0,0,math.sin(.85))),True)
candidate.value=1
# Preserve original texture/normal data. Material tuning is separately reversible.
normal_nodes=[]
for mat in body.data.materials:
    for node in mat.node_tree.nodes:
        if node.type=='NORMAL_MAP': normal_nodes.append({'material':mat.name,'strength':node.inputs['Strength'].default_value})
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'warrior_r1.blend'))
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active=body
bpy.ops.export_scene.gltf(filepath=str(ROOT/'warrior_r1.glb'), use_selection=True, export_animations=True, export_morph=True)
after=fingerprint()
manifest={
    'status':'RETOUCH_OFFLINE_ONLY','hero':'warrior','source':str(SRC),
    'source_sha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),
    'height_m':height,'blender_axis':'Z up; source rig transforms retained','glb_axis':'glTF +Y up exporter',
    'change':'rear burgundy cloth shape key; original basis/skin weights/UV/bones retained',
    'changed_vertices':len(changed),'topology_weights_uv_rest_bones_unchanged':before==after,
    'before':before,'after':after,'normal_nodes':normal_nodes,
    'texture_projection':'Not performed: action-pose reference is unsuitable for safe UV projection onto neutral rig without calibrated correspondence',
    'animation':'No retarget/new rig; original rest skeleton and weights unchanged. Deformed cloth motion not validated.',
    'runtime':'Current Steam-keyshot source uses SpriteRenderer Art/player, NOT this 3D model. No Unity integration performed.',
    'game_preview':'Blender orthographic proxy, elevation 0.85 rad; 9.5 percent body-height target. Not actual Unity camera capture.',
    'missing':['greatsword not attached','cape leg weights require animation review','Unity import and actual Player 1x review'],
}
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('CANDIDATE_RESULT='+json.dumps({k:v for k,v in manifest.items() if k not in ('before','after')},ensure_ascii=False))
