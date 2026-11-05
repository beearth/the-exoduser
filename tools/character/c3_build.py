"""C3 STRUCTURE CHECK: gear set A and a visibly different set B on one skeleton, plus weapon blocks. Simple shapes, not final sculpt.
blender -b --factory-startup --disable-autoexec EXO_Warrior_C1.blend --python c3_build.py -- <outdir>"""
import bpy, bmesh, sys, os, json, math
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
OUT = sys.argv[sys.argv.index('--')+1]; os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene; col = sc.collection; rig = bpy.data.objects['EXO_Warrior_Rig']; body = bpy.data.objects['Body']; me = body.data
rec = {'label': 'structure check only, not final sculpt'}
def save(): json.dump(rec, open(f'{OUT}/c3.json', 'w'), indent=1, ensure_ascii=False)
V = np.zeros(len(me.vertices)*3); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3); FN = np.zeros(len(me.vertices)*3); me.vertex_normals.foreach_get('vector', FN); FN = FN.reshape(-1, 3)
fs = np.zeros(len(me.polygons), dtype=np.int32); me.attributes['.sculpt_face_set'].data.foreach_get('value', fs)
fc = np.array([tuple(p.center) for p in me.polygons]); fvs = [list(p.vertices) for p in me.polygons]; hz = V[:, 2].max(); brow = hz-.085
head = np.isin(fs, [17, 2, 3, 4, 5, 7, 8])
helmA = head & ((fc[:, 1] > -.045) | (fc[:, 2] > brow))
bvh_body = BVHTree.FromPolygons([tuple(v) for v in V], fvs)
def erode(mask):
    edge = {}
    for i in np.where(mask)[0]:
        vs = fvs[int(i)]
        for a, c in zip(vs, vs[1:]+vs[:1]): edge[tuple(sorted((a, c)))] = edge.get(tuple(sorted((a, c))), 0)+1
    rim = {v for e, n in edge.items() if n == 1 for v in e}
    return np.array([bool(m) and not (set(fvs[i]) & rim) for i, m in enumerate(mask)])
def hull(off):
    t = body.copy(); t.data = me.copy(); col.objects.link(t); t.modifiers.clear(); t.parent = None; t.matrix_world = body.matrix_world.copy(); t.hide_render = False; t.hide_viewport = False
    for g in list(t.vertex_groups): t.vertex_groups.remove(g)
    for v, n in zip(t.data.vertices, FN): v.co += Vector(n)*off
    t.data.remesh_voxel_size = .014; t.data.remesh_voxel_adaptivity = 0; bpy.context.view_layer.objects.active = t; t.select_set(True); bpy.ops.object.voxel_remesh(); t.select_set(False); return t
def keep_largest(bm):
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
def rim_smooth(bm, n):
    for _ in range(n):
        r = [v for v in bm.verts if v.is_boundary]
        if r: bmesh.ops.smooth_vert(bm, verts=r, factor=.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
def weight_from(o, mask):
    s = body.copy(); s.data = me.copy(); col.objects.link(s); s.modifiers.clear(); s.parent = None; s.matrix_world = body.matrix_world.copy(); s.hide_viewport = False
    sb = bmesh.new(); sb.from_mesh(s.data); sb.faces.ensure_lookup_table(); bmesh.ops.delete(sb, geom=[f for f in sb.faces if not mask[f.index]], context='FACES_ONLY'); bmesh.ops.delete(sb, geom=[v for v in sb.verts if not v.link_faces], context='VERTS'); sb.to_mesh(s.data); sb.free(); s.data.update()
    bpy.context.view_layer.objects.active = o; o.select_set(True); d = o.modifiers.new('w', 'DATA_TRANSFER'); d.object = s; d.use_vert_data = True; d.data_types_verts = {'VGROUP_WEIGHTS'}; d.vert_mapping = 'POLYINTERP_NEAREST'; d.layers_vgroup_select_src = 'ALL'; d.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.datalayout_transfer(modifier='w'); bpy.ops.object.modifier_apply(modifier='w'); o.select_set(False); bpy.data.objects.remove(s)
    o.parent = rig; a = o.modifiers.new('a', 'ARMATURE'); a.object = rig
    for p in o.data.polygons: p.use_smooth = True
def mat(name, rgb, metal, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough; return m
ironA = mat('Iron_A', (.055, .055, .06), .85, .42); ironB = mat('Iron_B', (.20, .13, .09), .55, .5); steel = mat('Steel', (.5, .52, .55), .9, .35)
def piece(nm, mask, off, ratio, m, keep=None, shape=None):
    t = hull(off); bm = bmesh.new(); bm.from_mesh(t.data); bm.faces.ensure_lookup_table(); dele = []
    for f in bm.faces:
        c = f.calc_center_median()
        if keep is not None: ok = keep(c)
        else:
            h = bvh_body.find_nearest(c); ok = h[2] is not None and mask[h[2]]
        if not ok: dele.append(f)
    bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS'); keep_largest(bm); rim_smooth(bm, 8); bm.to_mesh(t.data); bm.free(); t.data.update(); t.name = nm; t.data.materials.append(m); bpy.context.view_layer.objects.active = t; t.select_set(True)
    s0 = t.copy(); s0.data = t.data.copy(); col.objects.link(s0); s0.hide_viewport = False
    d_ = t.modifiers.new('d', 'DECIMATE'); d_.ratio = ratio; bpy.ops.object.modifier_apply(modifier='d')
    w_ = t.modifiers.new('s', 'SHRINKWRAP'); w_.target = s0; w_.wrap_method = 'NEAREST_SURFACEPOINT'; bpy.ops.object.modifier_apply(modifier='s'); bpy.data.objects.remove(s0)
    bm = bmesh.new(); bm.from_mesh(t.data); rim_smooth(bm, 5)
    if shape:
        for v in bm.verts: v.co = shape(v.co.copy())
    bm.to_mesh(t.data); bm.free(); t.data.update()
    so = t.modifiers.new('t', 'SOLIDIFY'); so.thickness = .006; so.offset = 1; bpy.ops.object.modifier_apply(modifier='t'); t.select_set(False); weight_from(t, mask); return t
# keep rules
neck_back = fc[np.isin(fs, [17])][:, 2].min()
def helm_keep(c):
    # geometric cut: the whole skull cap incl. the nape, face left open
    return c.z > neck_back+.012 and (c.y > -.05 or c.z > brow+.018)
def side_sets(sd): return {'u': 21 if sd == 'L' else 20, 'f': 12 if sd == 'L' else 11, 'h': 9 if sd == 'L' else 10, 's': 15 if sd == 'L' else 16, 't': 24 if sd == 'L' else 23, 'ft': 14 if sd == 'L' else 13}
A = {}; B = {}; masks = {'A': {}, 'B': {}}; RA = .19; RB = .17
A['helm'] = piece('A_helm', helmA, .030, RA, ironA, keep=helm_keep); masks['A']['helm'] = helmA
A['chest'] = piece('A_chest', fs == 1, .032, RA, ironA); masks['A']['chest'] = fs == 1
for sd, sg in (('L', 1), ('R', -1)):
    k = side_sets(sd); u = fs == k['u']; z1 = fc[u, 2].max(); pa = u & (fc[:, 2] > z1-(z1-fc[u, 2].min())*.42)
    A['pauldron.'+sd] = piece('A_pauldron.'+sd, pa, .040, RA, ironA); masks['A']['pauldron.'+sd] = pa
    f = fs == k['f']; zw = fc[f, 2].min(); ze = fc[f, 2].max(); hs = (fs == k['h']) | ((fs >= 64) & (fc[:, 2] > .6) & (np.sign(fc[:, 0]) == sg)); gl = (f & (fc[:, 2] < zw+(ze-zw)*.42)) | hs
    A['glove.'+sd] = piece('A_glove.'+sd, gl, .022, RA, ironA); masks['A']['glove.'+sd] = gl
    A['greave.'+sd] = piece('A_greave.'+sd, fs == k['s'], .026, RA, ironA); masks['A']['greave.'+sd] = fs == k['s']
# Set B: a tall crested helm, long flared coat over torso + thighs, wide shoulders, bracers, tall boots
def crest(c):
    if c.z > brow: c.z += (c.z-brow)*.55; c.y += (c.z-brow)*.18
    return c
helmB = head & (fc[:, 2] > brow-.01)
B['helm'] = piece('B_helm', helmB, .040, RB, ironB, keep=lambda c: c.z > brow-.005, shape=crest); masks['B']['helm'] = helmB
hipz = fc[np.isin(fs, [18])][:, 2].max(); coatm = np.isin(fs, [1, 18, 19, 23, 24])
def flare(c):
    if c.z < hipz:
        k_ = (hipz-c.z); r = Vector((c.x, c.y+.0, 0)); c.x += r.x*k_*.75; c.y += (c.y+.02)*k_*1.0
    return c
B['coat'] = piece('B_coat', coatm, .040, RB, ironB, shape=flare); masks['B']['coat'] = coatm
for sd, sg in (('L', 1), ('R', -1)):
    k = side_sets(sd); u = fs == k['u']; z1 = fc[u, 2].max(); pa = u & (fc[:, 2] > z1-(z1-fc[u, 2].min())*.55); pc = Vector(tuple(V[[v for i in np.where(pa)[0] for v in fvs[int(i)]]].mean(0)))
    def wide(c, pc=pc, sg=sg):
        c = pc+(c-pc)*1.0; c.x = pc.x+(c.x-pc.x)*1.7+sg*.05; c.z = pc.z+(c.z-pc.z)*1.15+.03; c.y = pc.y+(c.y-pc.y)*1.35; return c
    B['shoulder.'+sd] = piece('B_shoulder.'+sd, pa, .050, RB, ironB, shape=wide); masks['B']['shoulder.'+sd] = pa
    f = fs == k['f']; B['bracer.'+sd] = piece('B_bracer.'+sd, f, .020, RB, ironB); masks['B']['bracer.'+sd] = f
    bt = (fs == k['ft']) | (fs == k['s']); bt = bt & (fc[:, 2] < .34)
    bo = (fs == k['ft']) | (fs >= 25) & (fs <= 63) & (fc[:, 2] < .12) & (np.sign(fc[:, 0]) == sg) | ((fs == k['s']) & (fc[:, 2] < .34))
    B['boot.'+sd] = piece('B_boot.'+sd, bo, .024, RB, ironB); masks['B']['boot.'+sd] = bo
rec['sets'] = {s: {k: sum(len(p.vertices)-2 for p in o.data.polygons) for k, o in D.items()} for s, D in (('A', A), ('B', B))}; rec['sets']['A_total'] = sum(rec['sets']['A'].values()); rec['sets']['B_total'] = sum(rec['sets']['B'].values()); save(); print('SETS', rec['sets'], flush=True)
# verified masks: hide a body face only where its own piece really lies above it, at rest
def verified(setname, D):
    h_ = {}; cov = {}
    for k, o in D.items():
        bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.triangulate(bm, faces=bm.faces); tr = BVHTree.FromBMesh(bm); bm.free(); mk = masks[setname][k]; er = erode(mk); inner = {v for i in np.where(er)[0] for v in fvs[int(i)]}
        hit = {v: tr.ray_cast(Vector(V[v]), Vector(FN[v]), .4)[0] is not None for v in inner}; hd = np.zeros(len(fvs), dtype=bool)
        for i in np.where(er)[0]:
            if all(hit[v] for v in fvs[int(i)]): hd[int(i)] = True
        h_[k] = hd; cov[k] = {'not_covered_share': round(sum(not x for x in hit.values())/max(1, len(hit)), 3), 'hidden': int(hd.sum())}
    return h_, cov
hA, cA = verified('A', A); hB, cB = verified('B', B); rec['coverage'] = {'A': cA, 'B': cB}; save(); print('COV', {k: v['not_covered_share'] for k, v in cA.items()}, {k: v['not_covered_share'] for k, v in cB.items()}, flush=True)
parts = [o for o in sc.objects if o.name.startswith('P_')]
def masked_parts(prefix, hidden):
    out = {}; keys = {tuple(sorted(fvs[i])) for i in np.where(hidden)[0]}
    for o in parts:
        oo = o.copy(); oo.data = o.data.copy(); oo.name = prefix+o.name[2:]; col.objects.link(oo); oo.parent = rig; oo.hide_render = False; oo.hide_viewport = False
        od = oo.data; org = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', org); bm = bmesh.new(); bm.from_mesh(od); bm.verts.ensure_lookup_table(); dele = [f for f in bm.faces if tuple(sorted(int(org[v.index]) for v in f.verts)) in keys]
        bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS'); bm.to_mesh(od); bm.free(); od.update()
        if not od.polygons: bpy.data.objects.remove(oo); continue
        ov = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', ov); od.normals_split_custom_set_from_vertices([tuple(FN[i]) for i in ov]); out[o.name[2:]] = oo
    return out
for o in parts: o.hide_render = True; o.hide_viewport = False
HA = np.logical_or.reduce(list(hA.values())); HB = np.logical_or.reduce(list(hB.values())); MA = masked_parts('MA_', HA); MB = masked_parts('MB_', HB)
eyes = [o for o in sc.objects if '.eye.' in o.name]
# thigh band check: render set A with and without armour shadows
for o in MB.values(): o.hide_render = True
for o in B.values(): o.hide_render = True
for o in MA.values(): m = o.modifiers.new('n', 'DATA_TRANSFER'); m.object = body; m.use_object_transform = True; m.use_loop_data = True; m.data_types_loops = {'CUSTOM_NORMAL'}; m.loop_mapping = 'NEAREST_POLYNOR'
for o in MB.values(): m = o.modifiers.new('n', 'DATA_TRANSFER'); m.object = body; m.use_object_transform = True; m.use_loop_data = True; m.data_types_loops = {'CUSTOM_NORMAL'}; m.loop_mapping = 'NEAREST_POLYNOR'
cam = sc.camera; PIT = 33; D_ = 26.14; tg = Vector((0, 0, .95))
def shot(tag, frame, yaw, pct):
    sc.frame_set(frame); dv = Vector((math.sin(math.radians(yaw))*math.cos(math.radians(PIT)), -math.cos(math.radians(yaw))*math.cos(math.radians(PIT)), math.sin(math.radians(PIT)))); cam.location = tg+dv*D_; cam.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler(); sc.render.resolution_x = 1920; sc.render.resolution_y = 1080; sc.render.resolution_percentage = pct; sc.render.use_border = True; sc.render.use_crop_to_border = True; sc.render.border_min_x, sc.render.border_max_x = .4375, .5625; sc.render.border_min_y, sc.render.border_max_y = (.5-95/1080, .5+95/1080); sc.cycles.samples = 48; sc.render.filepath = f'{OUT}/{tag}.png'; bpy.ops.render.render(write_still=True)
shot('A-idle-y060-5x', 2, 60, 500); shot('A-idle-y180-5x', 2, 180, 500)
for o in A.values(): o.visible_shadow = False
shot('A-idle-y060-noshadow-5x', 2, 60, 500)
for o in A.values(): o.visible_shadow = True; o.hide_render = True
for o in MA.values(): o.hide_render = True
for o in list(B.values())+list(MB.values()): o.hide_render = False
shot('B-idle-y060-5x', 2, 60, 500); shot('B-idle-y180-5x', 2, 180, 500); shot('B-stress-y060-5x', 3, 60, 500)
for o in list(MA.values())+list(MB.values()): o.modifiers.remove(o.modifiers['n'])
# ---- export: each set file carries the same skeleton
sc.frame_set(1)
def export(objs, path):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.hide_render = False; o.hide_viewport = False; o.hide_set(False); o.select_set(True)
    rig.hide_set(False); rig.select_set(True); bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.fbx(filepath=path, use_selection=True, object_types={'ARMATURE', 'MESH'}, add_leaf_bones=False, use_armature_deform_only=True, bake_anim=True, bake_anim_use_all_actions=False, bake_anim_use_nla_strips=False, bake_anim_force_startend_keying=True, bake_anim_simplify_factor=0, bake_anim_step=1, mesh_smooth_type='FACE', use_custom_props=False)
export(list(A.values())+list(MA.values())+eyes, f'{OUT}/C3_SetA.fbx'); export(list(B.values())+list(MB.values()), f'{OUT}/C3_SetB.fbx')
# ---- weapon blocks: origin at the grip, blade along +Y
def block(name, boxes):
    bm = bmesh.new()
    for c, s in boxes:
        r = bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, verts=r['verts'], vec=Vector(s)); bmesh.ops.translate(bm, verts=r['verts'], vec=Vector(c))
    m = bpy.data.meshes.new(name); bm.to_mesh(m); bm.free(); m.materials.append(steel); o = bpy.data.objects.new(name, m); col.objects.link(o); return o
sw = block('W_Greatsword', [((0, .02, 0), (.035, .30, .035)), ((0, .19, 0), (.26, .035, .05)), ((0, .95, 0), (.11, 1.45, .018))])
ax = block('W_Axe', [((0, .35, 0), (.04, 1.05, .04)), ((.14, .78, 0), (.26, .30, .025)), ((-.06, .78, 0), (.08, .16, .03))])
for o, p in ((sw, 'W_Greatsword'), (ax, 'W_Axe')):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.export_scene.fbx(filepath=f'{OUT}/{p}.fbx', use_selection=True, object_types={'MESH'}, bake_anim=False, mesh_smooth_type='FACE', axis_forward='Z', axis_up='Y')
rec['export'] = {n: os.path.getsize(f'{OUT}/{n}.fbx') for n in ('C3_SetA', 'C3_SetB', 'W_Greatsword', 'W_Axe')}; rec['bone_count_deform'] = sum(1 for b in rig.data.bones if b.use_deform); save()
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C3_structure.blend', compress=True, copy=True); print('C3_DONE', flush=True)
