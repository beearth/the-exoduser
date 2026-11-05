"""C2 step 1: STRUCTURE CHECK ONLY. Simple armour pushed off the base body, weights by Data Transfer, body mask, assembly.
blender -b --factory-startup --disable-autoexec EXO_Warrior_C1.blend --python c2_structure.py -- <outdir>"""
import bpy, bmesh, sys, os, json, math
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
OUT = sys.argv[sys.argv.index('--')+1]; os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene; col = sc.collection; rig = bpy.data.objects['EXO_Warrior_Rig']; body = bpy.data.objects['Body']; me = body.data
rec = {'label': 'structure check only, not final sculpt', 'pieces': {}}
def save(): json.dump(rec, open(f'{OUT}/c2.json', 'w'), indent=1, ensure_ascii=False)
V = np.zeros(len(me.vertices)*3); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3)
FN = np.zeros(len(me.vertices)*3); me.vertex_normals.foreach_get('vector', FN); FN = FN.reshape(-1, 3)
fs = np.zeros(len(me.polygons), dtype=np.int32); me.attributes['.sculpt_face_set'].data.foreach_get('value', fs)
fc = np.array([tuple(p.center) for p in me.polygons]); fvs = [list(p.vertices) for p in me.polygons]
head_z = V[:, 2].max()
head_faces = np.isin(fs, [17, 2, 3, 4, 5, 7, 8])
# face opening: everything behind the cheek line or above the brow stays armoured
brow = head_z-.085
helm = head_faces & ((fc[:, 1] > -.045) | (fc[:, 2] > brow))
upper = {'L': fs == 21, 'R': fs == 20}; fore = {'L': fs == 12, 'R': fs == 11}; shin = {'L': fs == 15, 'R': fs == 16}
sel = {'helm': (helm, .020), 'chest': (fs == 1, .022)}
for sd in 'LR':
    u = upper[sd]; z1 = fc[u, 2].max(); sel[f'pauldron.{sd}'] = (u & (fc[:, 2] > z1-(z1-fc[u, 2].min())*.42), .030)
    f = fore[sd]; zw = fc[f, 2].min(); ze = fc[f, 2].max(); hand = np.array([np.linalg.norm(c-V[fvs[i][0]]) < 9 and False for i, c in enumerate(fc)])
    hset = (fs == (9 if sd == 'L' else 10)) | (fs >= 64) & (fc[:, 2] > .6) & (np.sign(fc[:, 0]) == (1 if sd == 'L' else -1))
    sel[f'glove.{sd}'] = ((f & (fc[:, 2] < zw+(ze-zw)*.42)) | hset, .012)
    sel[f'greave.{sd}'] = (shin[sd], .016)
mat = bpy.data.materials.new('iron_struct'); mat.use_nodes = True; b = mat.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (.055, .055, .06, 1); b.inputs['Metallic'].default_value = .85; b.inputs['Roughness'].default_value = .46
hidden = np.zeros(len(me.polygons), dtype=bool); armour = {}
def erode(mask):
    edge = {}
    for i in np.where(mask)[0]:
        vs = fvs[int(i)]
        for a, c in zip(vs, vs[1:]+vs[:1]): edge[tuple(sorted((a, c)))] = edge.get(tuple(sorted((a, c))), 0)+1
    rim = {v for e, n in edge.items() if n == 1 for v in e}
    return np.array([bool(m) and not (set(fvs[i]) & rim) for i, m in enumerate(mask)])
def hull(off):
    # inflate the whole closed body, voxel it: a smooth shell with no folds, fingers and cavities merged
    t = body.copy(); t.data = me.copy(); col.objects.link(t); t.modifiers.clear(); t.parent = None; t.matrix_world = body.matrix_world.copy()
    for g in list(t.vertex_groups): t.vertex_groups.remove(g)
    for v, n in zip(t.data.vertices, FN): v.co += Vector(n)*off
    t.data.remesh_voxel_size = .014; t.data.remesh_voxel_adaptivity = 0; bpy.context.view_layer.objects.active = t; t.select_set(True); bpy.ops.object.voxel_remesh(); t.select_set(False)
    return t
bvh_body = BVHTree.FromPolygons([tuple(v) for v in V], fvs)
for name, (mask, off) in sel.items():
    off = off+.010
    hidden |= erode(mask)
    t = hull(off); bm = bmesh.new(); bm.from_mesh(t.data); bm.faces.ensure_lookup_table(); dele = []
    for f in bm.faces:
        hit = bvh_body.find_nearest(f.calc_center_median())
        if hit[2] is None or not mask[hit[2]]: dele.append(f)
    bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    # keep only sizeable islands, soften the cut rim
    seen = set(); isl = []
    for v in bm.verts:
        if v in seen: continue
        st = [v]; seen.add(v); c = []
        while st:
            x = st.pop(); c.append(x)
            for e in x.link_edges:
                y = e.other_vert(x)
                if y not in seen: seen.add(y); st.append(y)
        isl.append(c)
    isl.sort(key=len, reverse=True)
    for c in isl[1:]:
        if len(c) < 60: bmesh.ops.delete(bm, geom=c, context='VERTS')
    for _ in range(6):
        rim = [v for v in bm.verts if v.is_boundary]; bmesh.ops.smooth_vert(bm, verts=rim, factor=.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    bpy.data.objects.remove(t)
    m2 = bpy.data.meshes.new('A_'+name); bm.to_mesh(m2); bm.free(); o = bpy.data.objects.new('A_'+name, m2); col.objects.link(o); o.parent = rig
    for p in m2.polygons: p.use_smooth = True
    m2.materials.append(mat)
    so = o.modifiers.new('sol', 'SOLIDIFY'); so.thickness = .006; so.offset = 1; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='sol')
    # weights only from Data Transfer, no painting
    # source = only the body faces this piece covers, so a glove can't pick up thigh weights across the gap
    srcO = body.copy(); srcO.data = me.copy(); col.objects.link(srcO); srcO.modifiers.clear(); srcO.parent = None; srcO.matrix_world = body.matrix_world.copy()
    sb = bmesh.new(); sb.from_mesh(srcO.data); sb.faces.ensure_lookup_table(); bmesh.ops.delete(sb, geom=[f for f in sb.faces if not mask[f.index]], context='FACES_ONLY'); bmesh.ops.delete(sb, geom=[v for v in sb.verts if not v.link_faces], context='VERTS'); sb.to_mesh(srcO.data); sb.free(); srcO.data.update()
    dt = o.modifiers.new('w', 'DATA_TRANSFER'); dt.object = srcO; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}; dt.vert_mapping = 'POLYINTERP_NEAREST'; dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
    o.select_set(True); bpy.ops.object.datalayout_transfer(modifier='w'); bpy.ops.object.modifier_apply(modifier='w'); o.select_set(False); bpy.data.objects.remove(srcO)
    bpy.ops.object.vertex_group_limit_total(limit=4) if False else None
    arm = o.modifiers.new('a', 'ARMATURE'); arm.object = rig; armour[name] = o
    un = sum(1 for v in m2.vertices if not v.groups); rec['pieces'][name] = {'tris': sum(len(p.vertices)-2 for p in m2.polygons), 'verts': len(m2.vertices), 'offset_m': off, 'unweighted': un, 'groups': len(o.vertex_groups)}
save()
# masked body: same 14 parts with the fully covered faces removed
orig_parts = [o for o in sc.objects if o.name.startswith('P_')]; masked = {}
pvcount = 0
for o in orig_parts:
    oo = o.copy(); oo.data = o.data.copy(); oo.name = 'M_'+o.name[2:]; col.objects.link(oo); oo.parent = rig; o.hide_render = True; o.hide_set(True)
    # part face -> body face through vertex indices
    od = oo.data; orig = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', orig)
    hidden_keys = {tuple(sorted(fvs[i])) for i in np.where(hidden)[0]}
    bm = bmesh.new(); bm.from_mesh(od); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    dele = [f for f in bm.faces if tuple(sorted(int(orig[v.index]) for v in f.verts)) in hidden_keys]
    bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS'); bm.to_mesh(od); bm.free(); od.update()
    masked[o.name[2:]] = oo
    wn = FN; ov = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', ov); od.normals_split_custom_set_from_vertices([tuple(wn[i]) for i in ov])
rec['mask'] = {'body_faces': len(me.polygons), 'hidden_faces': int(hidden.sum()), 'hidden_share': round(float(hidden.mean()), 3), 'masked_tris': sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in masked.values()), 'armour_tris': sum(v['tris'] for v in rec['pieces'].values())}; save()
# visible normals like an engine
for o in masked.values():
    m = o.modifiers.new('whole_normals', 'DATA_TRANSFER'); m.object = body; m.use_object_transform = True; m.use_loop_data = True; m.data_types_loops = {'CUSTOM_NORMAL'}; m.loop_mapping = 'NEAREST_POLYNOR'
# piercing: whole body under each piece vs that piece, in each pose
def eval_mesh(o):
    d = bpy.context.evaluated_depsgraph_get(); e = o.evaluated_get(d); m = e.to_mesh(); n = len(m.vertices); a = np.zeros(n*3); m.vertices.foreach_get('co', a); return e, m, a.reshape(-1, 3)
kept_v = set(v for i, vs in enumerate(fvs) if not hidden[i] for v in vs)
poses = {'rest': 1, 'idle': 2, 'stress': 3}; res = {}
for pname, frame in poses.items():
    sc.frame_set(frame); bpy.context.view_layer.update(); e, m, BV = eval_mesh(body); BN = np.zeros(len(m.vertices)*3); m.vertex_normals.foreach_get('vector', BN); BN = BN.reshape(-1, 3); e.to_mesh_clear(); row = {}
    for name, (mask, off) in sel.items():
        o = armour[name]; d = bpy.context.evaluated_depsgraph_get(); ae = o.evaluated_get(d); bm = bmesh.new(); bm.from_mesh(ae.to_mesh()); bmesh.ops.triangulate(bm, faces=bm.faces); bm.normal_update(); tree = BVHTree.FromBMesh(bm); ae.to_mesh_clear()
        src = sorted({v for i in np.where(mask)[0] for v in fvs[int(i)]}); er = erode(mask); inner = sorted({v for i in np.where(er)[0] for v in fvs[int(i)]})
        pierce = kept = 0; mx = 0.0
        for v in inner:
            hit = tree.ray_cast(Vector(BV[v]), Vector(BN[v]), .25)
            # no armour above the body along its normal = the body point poked through
            if hit[0] is None:
                pierce += 1
                if v in kept_v: kept += 1
        bm.free(); row[name] = {'inner_verts': len(inner), 'body_through_armour': pierce, 'after_mask': kept}
    res[pname] = row; print('POSE', pname, {k: (v['body_through_armour'], v['after_mask']) for k, v in row.items()}, flush=True)
rec['piercing'] = res; save()
# render
cam = sc.camera; PITCH = 33; dist = 26.14; target = Vector((0, 0, .95))
def shot(tag, frame, yaw, res_):
    sc.frame_set(frame); dv = Vector((math.sin(math.radians(yaw))*math.cos(math.radians(PITCH)), -math.cos(math.radians(yaw))*math.cos(math.radians(PITCH)), math.sin(math.radians(PITCH)))); cam.location = target+dv*dist; cam.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_percentage = res_; sc.render.use_border = True; sc.render.use_crop_to_border = True; sc.cycles.samples = 48; sc.render.filepath = f'{OUT}/{tag}.png'; bpy.ops.render.render(write_still=True)
for pname, frame in (('idle', 2), ('stress', 3)):
    for yaw in (0, 60, 180):
        shot(f'c2s-{pname}-y{yaw:03d}-1x', frame, yaw, 100); shot(f'c2s-{pname}-y{yaw:03d}-5x', frame, yaw, 500)
for o in masked.values(): o.modifiers.remove(o.modifiers['whole_normals'])
sc.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C2_structure.blend', compress=True, copy=True)
bpy.ops.object.select_all(action='DESELECT')
for o in list(masked.values())+list(armour.values())+[rig]+[x for x in sc.objects if '.eye.' in x.name]: o.hide_set(False); o.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.export_scene.fbx(filepath=f'{OUT}/EXO_Warrior_C2_structure.fbx', use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False, use_armature_deform_only=True, bake_anim=True, bake_anim_use_all_actions=False, bake_anim_use_nla_strips=False, bake_anim_force_startend_keying=True, bake_anim_simplify_factor=0, bake_anim_step=1, mesh_smooth_type='FACE', use_custom_props=False)
rec['export'] = {'fbx_bytes': os.path.getsize(f'{OUT}/EXO_Warrior_C2_structure.fbx')}; save(); print('C2S_DONE', flush=True)
