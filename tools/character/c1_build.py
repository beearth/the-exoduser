"""C1: Blender Studio Human Base Meshes (CC0) male realistic -> 1.85m -> Rigify -> temporary 14 parts -> deformation check.
blender -b --factory-startup --disable-autoexec <bundle.blend> --python c1_build.py -- <outdir>"""
import bpy, bmesh, sys, os, json, math
import numpy as np
from mathutils import Vector, Euler, Matrix
from mathutils.bvhtree import BVHTree
OUT = sys.argv[sys.argv.index('--')+1]; os.makedirs(OUT, exist_ok=True)
rec = {'source': 'Human Base Meshes v1.4.1 Body Male - Realistic (CC0 per bundle README)', 'stages': {}}
def save(): json.dump(rec, open(f'{OUT}/c1.json', 'w'), indent=1, ensure_ascii=False)

src = bpy.data.objects['GEO-body_male_realistic']; eyes = [bpy.data.objects[f'GEO-body_male_realistic.eye.{s}'] for s in 'LR']
scene = bpy.data.scenes.new('C1'); bpy.context.window.scene = scene
col = scene.collection
body = src.copy(); body.data = src.data.copy(); body.name = 'Body'; col.objects.link(body)
for m in list(body.modifiers): body.modifiers.remove(m)
eo = []
for e in eyes:
    x = e.copy(); x.data = e.data.copy(); x.parent = None; x.matrix_world = e.matrix_world.copy(); col.objects.link(x); eo.append(x)
for o in [body]+eo: o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)
V = np.array([tuple(v.co) for v in body.data.vertices]); mn, mx = V.min(0), V.max(0); s = 1.85/(mx[2]-mn[2])
T = Matrix.Scale(s, 4) @ Matrix.Translation(Vector((-(mn[0]+mx[0])/2, 0, -mn[2])))
for o in [body]+eo: o.data.transform(T); o.data.update()
V = np.array([tuple(v.co) for v in body.data.vertices])
rec['stages']['scale'] = {'factor': round(s, 4), 'height_m': round(float(V[:,2].max()-V[:,2].min()), 3), 'width_m': round(float(np.ptp(V[:,0])), 3), 'quads': len(body.data.polygons), 'tris': sum(len(p.vertices)-2 for p in body.data.polygons)}
fs = np.zeros(len(body.data.polygons), dtype=np.int32); body.data.attributes['.sculpt_face_set'].data.foreach_get('value', fs)

# ---- 14 temporary parts from the bundle's own face sets
def side(x): return 'L' if x > 0 else 'R'
part_of_set = {}
for i in np.unique(fs):
    vs = sorted({v for p in np.where(fs == i)[0] for v in body.data.polygons[int(p)].vertices}); a = V[vs]; c = a.mean(0)
    zf = c[2]/1.85; ax = abs(c[0])
    if zf < .056: p = 'foot.'+side(c[0])
    elif zf < .30: p = 'shin.'+side(c[0])
    elif zf < .49 and int(i) in (23, 24): p = 'thigh.'+side(c[0])
    elif int(i) in (18, 19, 1): p = 'torso'
    elif ax > .28 and zf < .56: p = 'hand.'+side(c[0])
    elif int(i) in (11, 12): p = 'forearm.'+side(c[0])
    elif int(i) in (20, 21): p = 'upperarm.'+side(c[0])
    else: p = 'head'
    part_of_set[int(i)] = p
parts = sorted(set(part_of_set.values())); rec['stages']['parts'] = {'count': len(parts), 'names': parts, 'temporary': True, 'sets': {p: [k for k, v in part_of_set.items() if v == p] for p in parts}}
save()
assert len(parts) == 14, parts
face_part = np.array([part_of_set[int(i)] for i in fs])

# joint = centroid of the shared border between two parts
def border(a, b):
    A = {v for i in np.where(face_part == a)[0] for v in body.data.polygons[int(i)].vertices}
    B = {v for i in np.where(face_part == b)[0] for v in body.data.polygons[int(i)].vertices}
    S = sorted(A & B)
    if not S: raise RuntimeError(f'no border {a}/{b}')
    return Vector(V[S].mean(0))
J = {}
for sd in 'LR':
    J['shoulder.'+sd] = border('torso', 'upperarm.'+sd); J['elbow.'+sd] = border('upperarm.'+sd, 'forearm.'+sd); J['wrist.'+sd] = border('forearm.'+sd, 'hand.'+sd)
    J['hip.'+sd] = border('torso', 'thigh.'+sd); J['knee.'+sd] = border('thigh.'+sd, 'shin.'+sd); J['ankle.'+sd] = border('shin.'+sd, 'foot.'+sd)
J['neck'] = border('torso', 'head')
headV = V[sorted({v for i in np.where(face_part == 'head')[0] for v in body.data.polygons[int(i)].vertices})]; top = Vector((0, float(headV[:,1].mean()), float(headV[:,2].max())))
footV = {sd: V[sorted({v for i in np.where(face_part == 'foot.'+sd)[0] for v in body.data.polygons[int(i)].vertices})] for sd in 'LR'}
handV = {sd: V[sorted({v for i in np.where(face_part == 'hand.'+sd)[0] for v in body.data.polygons[int(i)].vertices})] for sd in 'LR'}
rec['stages']['joints_m'] = {k: [round(x, 3) for x in v] for k, v in J.items()}; save()

# ---- Rigify metarig fitted to those joints
bpy.ops.preferences.addon_enable(module='rigify')
bpy.ops.object.armature_human_metarig_add(); meta = bpy.context.object
bpy.ops.object.mode_set(mode='EDIT'); eb = meta.data.edit_bones
def drop(name):
    b = eb.get(name)
    if b is None: return
    for c in list(b.children_recursive): eb.remove(c)
    eb.remove(b)
for n in ('face', 'breast.L', 'breast.R', 'pelvis.L', 'pelvis.R', 'heel.02.L', 'heel.02.R'): drop(n)
for sd in 'LR':
    for n in (f'palm.01.{sd}', f'palm.02.{sd}', f'palm.03.{sd}', f'palm.04.{sd}'): drop(n)
def seg(n, a, b): eb[n].head = a; eb[n].tail = b
hipc = (J['hip.L']+J['hip.R'])/2; neck = J['neck']
chain = [hipc.lerp(neck, t) for t in (0, .18, .36, .56, .78, 1.0)]
for n, a, b in (('spine', chain[0], chain[1]), ('spine.001', chain[1], chain[2]), ('spine.002', chain[2], chain[3]), ('spine.003', chain[3], chain[4]), ('spine.004', chain[4], chain[5])): seg(n, a, b)
hb = (neck+top)/2
seg('spine.005', neck, hb); seg('spine.006', hb, top)
for sd in 'LR':
    sg = 1 if sd == 'L' else -1
    seg(f'shoulder.{sd}', Vector((sg*.02, chain[4].y-.02, chain[4].z+.02)), J['shoulder.'+sd])
    # a slight bend so Rigify gets a stable pole plane
    el = J['elbow.'+sd]+Vector((0, .012, 0)); kn = J['knee.'+sd]+Vector((0, -.015, 0))
    seg(f'upper_arm.{sd}', J['shoulder.'+sd], el); seg(f'forearm.{sd}', el, J['wrist.'+sd])
    tip = Vector(handV[sd].mean(0)); d = (tip-J['wrist.'+sd]); seg(f'hand.{sd}', J['wrist.'+sd], J['wrist.'+sd]+d.normalized()*max(d.length*1.5, .1))
    seg(f'thigh.{sd}', J['hip.'+sd], kn); seg(f'shin.{sd}', kn, J['ankle.'+sd])
    fv = footV[sd]; toe_y = float(fv[:,1].min()); heel_y = float(fv[:,1].max()); ball = Vector((J['ankle.'+sd].x, heel_y+(toe_y-heel_y)*.68, .03)); tp = Vector((J['ankle.'+sd].x, toe_y, .025))
    seg(f'foot.{sd}', J['ankle.'+sd], ball); seg(f'toe.{sd}', ball, tp)
    h = eb[f'heel.02.{sd}'] if f'heel.02.{sd}' in eb else None
    # recreate the heel marker Rigify's leg needs
    nb = eb.new(f'heel.02.{sd}'); nb.parent = eb[f'foot.{sd}']; nb.use_connect = False; nb.head = Vector((J['ankle.'+sd].x-sg*.04, heel_y, .0)); nb.tail = Vector((J['ankle.'+sd].x+sg*.04, heel_y, .0)); nb.roll = 0
    for n, zv in ((f'upper_arm.{sd}', Vector((0, 1, 0))), (f'forearm.{sd}', Vector((0, 1, 0))), (f'thigh.{sd}', Vector((0, 1, 0))), (f'shin.{sd}', Vector((0, 1, 0))), (f'foot.{sd}', Vector((0, 0, 1))), (f'toe.{sd}', Vector((0, 0, 1))), (f'hand.{sd}', Vector((0, 1, 0)))):
        eb[n].align_roll(zv)
bpy.ops.object.mode_set(mode='OBJECT')
SEG = 3
for sd in 'LR':
    for n in (f'upper_arm.{sd}', f'thigh.{sd}'):
        meta.pose.bones[n].rigify_parameters.segments = SEG
rec['stages']['twist_segments'] = SEG
bones = [b.name for b in meta.data.bones]; rec['stages']['metarig'] = {'bones': len(bones)}; save()
bpy.ops.object.select_all(action='DESELECT'); meta.select_set(True); bpy.context.view_layer.objects.active = meta
bpy.ops.pose.rigify_generate(); rig = next(o for o in col.objects if o.type == 'ARMATURE' and o is not meta)
rig.name = 'EXO_Warrior_Rig'; defb = [b.name for b in rig.data.bones if b.use_deform]
rec['stages']['rigify'] = {'bones_total': len(rig.data.bones), 'deform_bones': len(defb), 'deform_names': defb}; save(); meta.hide_render = True; meta.hide_viewport = True

# ---- weights on the whole body, then parts inherit them (no per-part painting)
bpy.ops.object.mode_set(mode='OBJECT') if bpy.context.object and bpy.context.object.mode != 'OBJECT' else None
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
r = bpy.ops.object.parent_set(type='ARMATURE_AUTO'); nw = sum(1 for v in body.data.vertices if len(v.groups) == 0)
rec['stages']['weights'] = {'op': str(r), 'method': 'bone heat on the whole closed body', 'unweighted_verts': nw, 'groups': len(body.vertex_groups)}; save()
print('WEIGHTS', rec['stages']['weights'], flush=True)
for e in eo:
    g = e.vertex_groups.new(name='DEF-spine.006'); g.add(list(range(len(e.data.vertices))), 1.0, 'REPLACE'); m = e.modifiers.new('a', 'ARMATURE'); m.object = rig; e.parent = rig
body.data.polygons.foreach_set('use_smooth', [True]*len(body.data.polygons)); body.data.update()
whole_n = np.zeros((len(body.data.vertices), 3)); body.data.vertex_normals.foreach_get('vector', whole_n.ravel())

# ---- split, keeping shared-vertex weights and the whole body's normals so the seam cannot shade
pobj = {}
for p in parts:
    o = body.copy(); o.data = body.data.copy(); o.name = 'P_'+p; col.objects.link(o); o.parent = rig
    bm = bmesh.new(); bm.from_mesh(o.data); bm.faces.ensure_lookup_table(); idl = bm.verts.layers.int.new('orig');
    for v in bm.verts: v[idl] = v.index
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if face_part[f.index] != p], context='FACES_ONLY')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(o.data); bm.free(); o.data.update()
    orig = np.zeros(len(o.data.vertices), dtype=np.int32); o.data.attributes['orig'].data.foreach_get('value', orig)
    o.data.normals_split_custom_set_from_vertices([tuple(whole_n[i]) for i in orig]); pobj[p] = o
body.hide_render = True
for o in pobj.values():
    m = o.modifiers.new('whole_normals', 'DATA_TRANSFER'); m.object = body; m.use_object_transform = True; m.use_loop_data = True; m.data_types_loops = {'CUSTOM_NORMAL'}; m.loop_mapping = 'NEAREST_POLYNOR'
rec['stages']['split'] = {p: {'faces': len(o.data.polygons), 'verts': len(o.data.vertices)} for p, o in pobj.items()}; save()

# ---- deformation test poses (static poses on the FK controls, not an animation)
pb = rig.pose.bones
for sd in 'LR':
    for n in (f'upper_arm_parent.{sd}', f'thigh_parent.{sd}'):
        if n in pb and 'IK_FK' in pb[n]: pb[n]['IK_FK'] = 1.0
def setr(n, x=0, y=0, z=0):
    b = pb.get(n)
    if b is None: rec.setdefault('missing_controls', []).append(n); return
    b.rotation_mode = 'XYZ'; b.rotation_euler = Euler((math.radians(x), math.radians(y), math.radians(z)))
def clear():
    for b in pb:
        b.rotation_mode = 'QUATERNION'; b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
POSES = {
 'rest': {},
 'idle': {'upper_arm_fk.L': (10, 0, 6), 'upper_arm_fk.R': (10, 0, -6), 'forearm_fk.L': (22, 0, 0), 'forearm_fk.R': (22, 0, 0), 'thigh_fk.L': (-8, 0, 3), 'shin_fk.L': (14, 0, 0), 'foot_fk.L': (-6, 0, 0), 'thigh_fk.R': (4, 0, -2), 'shin_fk.R': (4, 0, 0), 'spine_fk.002': (4, 0, 0), 'spine_fk.003': (3, 0, 0)},
 'stress': {'upper_arm_fk.L': (75, 0, 45), 'forearm_fk.L': (105, 0, 0), 'upper_arm_fk.R': (-35, 0, -55), 'forearm_fk.R': (85, 0, 0), 'thigh_fk.L': (-85, 0, 12), 'shin_fk.L': (105, 0, 0), 'foot_fk.L': (-15, 0, 0), 'thigh_fk.R': (35, 0, -10), 'shin_fk.R': (55, 0, 0), 'spine_fk.001': (10, 0, 0), 'spine_fk.002': (12, 15, 0), 'spine_fk.003': (10, 15, 0)},
}
def eval_verts(o):
    d = bpy.context.evaluated_depsgraph_get(); e = o.evaluated_get(d); m = e.to_mesh(); a = np.zeros(len(m.vertices)*3); m.vertices.foreach_get('co', a); e.to_mesh_clear(); return a.reshape(-1, 3)
def seam_gap():
    seen = {}; worst = 0.0
    for p, o in pobj.items():
        a = eval_verts(o); orig = np.zeros(len(o.data.vertices), dtype=np.int32); o.data.attributes['orig'].data.foreach_get('value', orig)
        for i, co in zip(orig, a):
            i = int(i)
            if i in seen: worst = max(worst, float(np.linalg.norm(seen[i]-co)))
            else: seen[i] = co
    return worst
def overlap_pairs():
    d = bpy.context.evaluated_depsgraph_get(); tr = {}
    for p, o in pobj.items():
        e = o.evaluated_get(d); bm = bmesh.new(); bm.from_mesh(e.to_mesh()); bmesh.ops.triangulate(bm, faces=bm.faces); bm.faces.ensure_lookup_table(); tr[p] = (BVHTree.FromBMesh(bm), np.array([tuple(f.calc_center_median()) for f in bm.faces])); bm.free(); e.to_mesh_clear()
    adj = {('forearm.L','upperarm.L'),('forearm.R','upperarm.R'),('forearm.L','hand.L'),('forearm.R','hand.R'),('head','torso'),('torso','upperarm.L'),('torso','upperarm.R'),('thigh.L','torso'),('thigh.R','torso'),('shin.L','thigh.L'),('shin.R','thigh.R'),('foot.L','shin.L'),('foot.R','shin.R')}
    out = {}
    ks = sorted(tr)
    for i, a in enumerate(ks):
        for b in ks[i+1:]:
            ov = tr[a][0].overlap(tr[b][0]); n = len(ov)
            if n:
                c = np.array([tr[a][1][i] for i, _ in ov]); out[f'{a}|{b}'] = {'pairs': n, 'adjacent': (a, b) in adj or (b, a) in adj, 'z_m': [round(float(c[:,2].min()), 3), round(float(c[:,2].max()), 3)]}
    return out
# ---- render: game camera 33 deg, same FOV, hero height on screen from the current game
scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = 48; scene.cycles.use_denoising = False; scene.cycles.seed = 1
scene.render.resolution_x = 1920; scene.render.resolution_y = 1080; scene.render.image_settings.file_format = 'PNG'; scene.view_settings.view_transform = 'Standard'
w = bpy.data.worlds.new('w'); w.use_nodes = True; scene.world = w; w.node_tree.nodes['Background'].inputs[0].default_value = (.32, .34, .38, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .55
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); col.objects.link(sun); sun.data.energy = 2.6; sun.data.angle = math.radians(6); sun.rotation_euler = (math.radians(52), 0, math.radians(35))
mat = bpy.data.materials.new('body_clay'); mat.use_nodes = True; b = mat.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (.46, .43, .41, 1); b.inputs['Roughness'].default_value = .62
for o in list(pobj.values())+eo: o.data.materials.clear(); o.data.materials.append(mat)
bpy.ops.mesh.primitive_plane_add(size=30); fl = bpy.context.object; fm = bpy.data.materials.new('floor'); fm.use_nodes = True; fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.10, .10, .11, 1); fm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .9; fl.data.materials.append(fm)
HERO_PX = 88.0; FOVV = 46.9453; PITCH = 33.0
px_per_m = HERO_PX/1.85; dist = (1080/(2*math.tan(math.radians(FOVV/2))))/px_per_m
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); col.objects.link(cam); scene.camera = cam; cam.data.sensor_fit = 'VERTICAL'; cam.data.angle_y = math.radians(FOVV); cam.data.clip_end = 400
rec['stages']['camera'] = {'pitch': PITCH, 'fov_v': FOVV, 'hero_px_1080p': HERO_PX, 'distance_m': round(dist, 2), 'note': 'hero size on screen from the current game capture (about 88px); 1x is the same pixel density'}
target = Vector((0, 0, .95))
def shot(tag, yaw, res=1.0, crop=True):
    dv = Vector((math.sin(math.radians(yaw))*math.cos(math.radians(PITCH)), -math.cos(math.radians(yaw))*math.cos(math.radians(PITCH)), math.sin(math.radians(PITCH))))
    cam.location = target+dv*dist; cam.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler()
    scene.render.resolution_percentage = int(100*res); scene.render.use_border = crop; scene.render.use_crop_to_border = crop
    scene.render.border_min_x, scene.render.border_max_x = (.5-120/1920, .5+120/1920); scene.render.border_min_y, scene.render.border_max_y = (.5-95/1080, .5+95/1080)
    scene.render.filepath = f'{OUT}/{tag}.png'; bpy.ops.render.render(write_still=True)
res = {}
for pname, pose in POSES.items():
    clear()
    for n, r in pose.items(): setr(n, *r)
    bpy.context.view_layer.update()
    res[pname] = {'seam_gap_mm': round(seam_gap()*1000, 4), 'part_overlaps': overlap_pairs()}
    print('POSE', pname, res[pname]['seam_gap_mm'], len(res[pname]['part_overlaps']), flush=True)
    for yaw in (0, 60, 180):
        shot(f'c1-{pname}-y{yaw:03d}-1x', yaw, 1.0); shot(f'c1-{pname}-y{yaw:03d}-5x', yaw, 5.0)
    rec['stages']['poses'] = res; save()
for f, pname in enumerate(('rest', 'idle', 'stress'), 1):
    clear()
    for n, r in POSES[pname].items(): setr(n, *r)
    for b in pb:
        if b.name.endswith('_fk.L') or b.name.endswith('_fk.R') or 'spine_fk' in b.name:
            b.keyframe_insert('rotation_quaternion' if b.rotation_mode == 'QUATERNION' else 'rotation_euler', frame=f)
scene.frame_start = 1; scene.frame_end = 3; scene.frame_set(1); bpy.context.view_layer.update()
for o in pobj.values(): o.modifiers.remove(o.modifiers['whole_normals'])
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C1.blend', compress=True, copy=True)
bpy.ops.object.select_all(action='DESELECT')
for o in list(pobj.values())+eo+[rig]: o.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.fbx(filepath=f'{OUT}/EXO_Warrior_C1.fbx', use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False, use_armature_deform_only=True, bake_anim=True, bake_anim_use_all_actions=False, bake_anim_use_nla_strips=False, bake_anim_force_startend_keying=True, bake_anim_simplify_factor=0, bake_anim_step=1, mesh_smooth_type='FACE', use_custom_props=False)
rec['stages']['export'] = {'fbx_bytes': os.path.getsize(f'{OUT}/EXO_Warrior_C1.fbx')}; save(); print('C1_DONE', flush=True)
