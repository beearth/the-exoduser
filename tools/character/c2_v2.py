"""C2: (a) reduce structure armour under 10k tris, mask only what armour really covers, recount piercing.
(b) one LOCK sculpt attempt: chest lames + overlapping rounded pauldrons, generated plates, no hand work.
blender -b --factory-startup --disable-autoexec EXO_Warrior_C1.blend --python c2_v2.py -- <outdir>"""
import bpy, bmesh, sys, os, json, math
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
OUT = sys.argv[sys.argv.index('--')+1]; os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene; col = sc.collection; rig = bpy.data.objects['EXO_Warrior_Rig']; body = bpy.data.objects['Body']; me = body.data
rec = {}
def save(): json.dump(rec, open(f'{OUT}/c2v2.json', 'w'), indent=1, ensure_ascii=False)
V = np.zeros(len(me.vertices)*3); me.vertices.foreach_get('co', V); V = V.reshape(-1, 3); FN = np.zeros(len(me.vertices)*3); me.vertex_normals.foreach_get('vector', FN); FN = FN.reshape(-1, 3)
fs = np.zeros(len(me.polygons), dtype=np.int32); me.attributes['.sculpt_face_set'].data.foreach_get('value', fs)
fc = np.array([tuple(p.center) for p in me.polygons]); fvs = [list(p.vertices) for p in me.polygons]; head_z = V[:, 2].max(); brow = head_z-.085
head = np.isin(fs, [17, 2, 3, 4, 5, 7, 8]); helm = head & ((fc[:, 1] > -.045) | (fc[:, 2] > brow))
sel = {'helm': (helm, .030), 'chest': (fs == 1, .032)}
for sd, fu, ff, fh, fsn in (('L', 21, 12, 9, 15), ('R', 20, 11, 10, 16)):
    u = fs == fu; z1 = fc[u, 2].max(); sel[f'pauldron.{sd}'] = (u & (fc[:, 2] > z1-(z1-fc[u, 2].min())*.42), .040)
    f = fs == ff; zw = fc[f, 2].min(); ze = fc[f, 2].max(); sg = 1 if sd == 'L' else -1
    hset = (fs == fh) | ((fs >= 64) & (fc[:, 2] > .6) & (np.sign(fc[:, 0]) == sg)); sel[f'glove.{sd}'] = ((f & (fc[:, 2] < zw+(ze-zw)*.42)) | hset, .022)
    sel[f'greave.{sd}'] = (fs == fsn, .026)
def erode(mask):
    edge = {}
    for i in np.where(mask)[0]:
        vs = fvs[int(i)]
        for a, c in zip(vs, vs[1:]+vs[:1]): edge[tuple(sorted((a, c)))] = edge.get(tuple(sorted((a, c))), 0)+1
    rim = {v for e, n in edge.items() if n == 1 for v in e}
    return np.array([bool(m) and not (set(fvs[i]) & rim) for i, m in enumerate(mask)])
bvh_body = BVHTree.FromPolygons([tuple(v) for v in V], fvs)
def hull(off):
    t = body.copy(); t.data = me.copy(); col.objects.link(t); t.modifiers.clear(); t.parent = None; t.matrix_world = body.matrix_world.copy()
    for g in list(t.vertex_groups): t.vertex_groups.remove(g)
    for v, n in zip(t.data.vertices, FN): v.co += Vector(n)*off
    t.data.remesh_voxel_size = .014; t.data.remesh_voxel_adaptivity = 0; bpy.context.view_layer.objects.active = t; t.select_set(True); bpy.ops.object.voxel_remesh(); t.select_set(False)
    return t
def cut(t, mask):
    bm = bmesh.new(); bm.from_mesh(t.data); bm.faces.ensure_lookup_table(); dele = []
    for f in bm.faces:
        h = bvh_body.find_nearest(f.calc_center_median())
        if h[2] is None or not mask[h[2]]: dele.append(f)
    bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
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
    bm.to_mesh(t.data); bm.free(); t.data.update()
def weight_from(o, mask):
    s = body.copy(); s.data = me.copy(); col.objects.link(s); s.modifiers.clear(); s.parent = None; s.matrix_world = body.matrix_world.copy()
    sb = bmesh.new(); sb.from_mesh(s.data); sb.faces.ensure_lookup_table(); bmesh.ops.delete(sb, geom=[f for f in sb.faces if not mask[f.index]], context='FACES_ONLY'); bmesh.ops.delete(sb, geom=[v for v in sb.verts if not v.link_faces], context='VERTS'); sb.to_mesh(s.data); sb.free(); s.data.update()
    bpy.context.view_layer.objects.active = o; o.select_set(True); d = o.modifiers.new('w', 'DATA_TRANSFER'); d.object = s; d.use_vert_data = True; d.data_types_verts = {'VGROUP_WEIGHTS'}; d.vert_mapping = 'POLYINTERP_NEAREST'; d.layers_vgroup_select_src = 'ALL'; d.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.datalayout_transfer(modifier='w'); bpy.ops.object.modifier_apply(modifier='w'); o.select_set(False); bpy.data.objects.remove(s)
    o.parent = rig; a = o.modifiers.new('a', 'ARMATURE'); a.object = rig
    for p in o.data.polygons: p.use_smooth = True
TARGET = 10000
iron = bpy.data.materials.new('iron'); iron.use_nodes = True; b = iron.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (.055, .055, .06, 1); b.inputs['Metallic'].default_value = .85; b.inputs['Roughness'].default_value = .42
# ---- (a) reduced pieces: sheet count -> Decimate -> Shrinkwrap back on the undecimated sheet -> Solidify
sheets = {}
for name, (mask, off) in sel.items():
    t = hull(off); cut(t, mask); t.name = 'S_'+name; sheets[name] = t
total_sheet = sum(len(s.data.polygons) for s in sheets.values())
ratio = (TARGET*.41)/sum(sum(len(p.vertices)-2 for p in s.data.polygons) for s in sheets.values())
A = {}
for name, s in sheets.items():
    o = s.copy(); o.data = s.data.copy(); o.name = 'A_'+name; col.objects.link(o); o.hide_render = False; o.hide_viewport = False; o.data.materials.append(iron); bpy.context.view_layer.objects.active = o; o.select_set(True)
    m = o.modifiers.new('d', 'DECIMATE'); m.ratio = ratio; bpy.ops.object.modifier_apply(modifier='d')
    m = o.modifiers.new('s', 'SHRINKWRAP'); m.target = s; m.wrap_method = 'NEAREST_SURFACEPOINT'; bpy.ops.object.modifier_apply(modifier='s')
    m = o.modifiers.new('t', 'SOLIDIFY'); m.thickness = .006; m.offset = 1; bpy.ops.object.modifier_apply(modifier='t'); o.select_set(False)
    A[name] = o; s.hide_render = True; s.hide_viewport = True
    weight_from(o, sel[name][0])
rec['reduced'] = {'decimate_ratio': round(ratio, 4), 'pieces': {k: sum(len(p.vertices)-2 for p in o.data.polygons) for k, o in A.items()}}; rec['reduced']['total_tris'] = sum(rec['reduced']['pieces'].values()); save()
# ---- mask: hide a body face only if every vertex really has armour straight above it, at rest
trees = {}
for k, o in A.items():
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.triangulate(bm, faces=bm.faces); trees[k] = BVHTree.FromBMesh(bm); bm.free()
hidden = np.zeros(len(fvs), dtype=bool); cov = {}
for k, (mask, off) in sel.items():
    er = erode(mask); inner = {v for i in np.where(er)[0] for v in fvs[int(i)]}
    hit = {v: trees[k].ray_cast(Vector(V[v]), Vector(FN[v]), .25)[0] is not None for v in inner}
    n = 0
    for i in np.where(er)[0]:
        if all(hit[v] for v in fvs[int(i)]): hidden[int(i)] = True; n += 1
    miss = [v for v, h in hit.items() if not h]; cov[k] = {'candidate_faces': int(er.sum()), 'hidden': n, 'not_covered_verts': len(miss), 'not_covered_share': round(len(miss)/max(1, len(inner)), 3)}
rec['mask'] = {'pieces': cov, 'hidden_faces': int(hidden.sum()), 'share': round(float(hidden.mean()), 3)}; save()
parts = [o for o in sc.objects if o.name.startswith('P_')]; masked = {}
keys = {tuple(sorted(fvs[i])) for i in np.where(hidden)[0]}
for o in parts:
    oo = o.copy(); oo.data = o.data.copy(); oo.name = 'M_'+o.name[2:]; col.objects.link(oo); oo.parent = rig; o.hide_render = True; o.hide_viewport = True
    od = oo.data; org = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', org)
    bm = bmesh.new(); bm.from_mesh(od); bm.verts.ensure_lookup_table(); dele = [f for f in bm.faces if tuple(sorted(int(org[v.index]) for v in f.verts)) in keys]
    bmesh.ops.delete(bm, geom=dele, context='FACES_ONLY'); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS'); bm.to_mesh(od); bm.free(); od.update()
    if not od.polygons: bpy.data.objects.remove(oo); continue
    ov = np.zeros(len(od.vertices), dtype=np.int32); od.attributes['orig'].data.foreach_get('value', ov); od.normals_split_custom_set_from_vertices([tuple(FN[i]) for i in ov]); masked[o.name[2:]] = oo
    m = oo.modifiers.new('n', 'DATA_TRANSFER'); m.object = body; m.use_object_transform = True; m.use_loop_data = True; m.data_types_loops = {'CUSTOM_NORMAL'}; m.loop_mapping = 'NEAREST_POLYNOR'
kept = {v for i, vs in enumerate(fvs) if not hidden[i] for v in vs}
# real piercing: a still-visible body vertex lying outside the armour in a pose, at places armour covered at rest
def pierce():
    d = bpy.context.evaluated_depsgraph_get(); e = body.evaluated_get(d); m = e.to_mesh(); BV = np.zeros(len(m.vertices)*3); m.vertices.foreach_get('co', BV); BV = BV.reshape(-1, 3); BN = np.zeros(len(m.vertices)*3); m.vertex_normals.foreach_get('vector', BN); BN = BN.reshape(-1, 3); e.to_mesh_clear(); out = {}
    for k, (mask, off) in sel.items():
        ae = A[k].evaluated_get(d); bm = bmesh.new(); bm.from_mesh(ae.to_mesh()); bmesh.ops.triangulate(bm, faces=bm.faces); tree = BVHTree.FromBMesh(bm); ae.to_mesh_clear(); bm.free()
        er = erode(mask); inner = {v for i in np.where(er)[0] for v in fvs[int(i)]}; n = 0; nk = 0
        for v in inner:
            if v not in kept: continue
            nk += 1
            h = tree.find_nearest(Vector(BV[v]))
            if h[0] is not None and h[3] < .012 and (Vector(BV[v])-h[0]).dot(Vector(BN[v])) > 0: n += 1
        out[k] = {'kept_inner': nk, 'kept_verts_through': n}
    return out
rec['real_piercing'] = {}
for nm, f in (('rest', 1), ('idle', 2), ('stress', 3)):
    sc.frame_set(f); bpy.context.view_layer.update(); rec['real_piercing'][nm] = pierce(); print('RP', nm, {k: v['kept_verts_through'] for k, v in rec['real_piercing'][nm].items()}, flush=True); save()
cam = sc.camera; PIT = 33; D = 26.14; tg = Vector((0, 0, .95))
def shot(tag, frame, yaw, pct):
    sc.frame_set(frame); dv = Vector((math.sin(math.radians(yaw))*math.cos(math.radians(PIT)), -math.cos(math.radians(yaw))*math.cos(math.radians(PIT)), math.sin(math.radians(PIT)))); cam.location = tg+dv*D; cam.rotation_euler = (-dv).to_track_quat('-Z', 'Y').to_euler(); sc.render.resolution_x = 1920; sc.render.resolution_y = 1080; sc.render.resolution_percentage = pct; sc.render.use_border = True; sc.render.use_crop_to_border = True; sc.render.border_min_x, sc.render.border_max_x = .4375, .5625; sc.render.border_min_y, sc.render.border_max_y = (.5-95/1080, .5+95/1080); sc.cycles.samples = 48; sc.render.filepath = f'{OUT}/{tag}.png'; bpy.ops.render.render(write_still=True)
shot('reduced-idle-y060-5x', 2, 60, 500); shot('reduced-stress-y060-5x', 3, 60, 500)
sc.frame_set(1); bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C2_reduced.blend', compress=True, copy=True)
# ---- (b) LOCK attempt: replace chest + pauldrons with overlapping plates from the undecimated sheets
for k in ('chest', 'pauldron.L', 'pauldron.R'): A[k].hide_render = True; A[k].hide_viewport = True
def plates(name, axis, origin, n, lap, flare, thick, base_off):
    s = sheets[name]; s.hide_viewport = False; mask = sel[name][0]; out = []
    bm0 = bmesh.new(); bm0.from_mesh(s.data); dmin = min((v.co-origin).dot(axis) for v in bm0.verts); dmax = max((v.co-origin).dot(axis) for v in bm0.verts); bm0.free(); h = (dmax-dmin)/n
    for i in range(n):
        o = s.copy(); o.data = s.data.copy(); o.name = f'L_{name}_{i}'; col.objects.link(o); o.hide_render = False; o.hide_viewport = False; bm = bmesh.new(); bm.from_mesh(o.data)
        a = dmin+i*h; c = a+h+lap
        r = bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=origin+axis*a, plane_no=axis, clear_inner=True); r = bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=origin+axis*c, plane_no=axis, clear_outer=True)
        bm.normal_update(); bm.verts.ensure_lookup_table()
        off = base_off+(n-1-i)*.0015
        for v in bm.verts:
            t = ((v.co-origin).dot(axis)-a)/(c-a); v.co += v.normal*(off+(flare*t*t))
        for _ in range(3): bmesh.ops.smooth_vert(bm, verts=[v for v in bm.verts if v.is_boundary], factor=.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=.25, use_axis_x=True, use_axis_y=True, use_axis_z=True); bm.to_mesh(o.data); bm.free(); o.data.update(); bpy.context.view_layer.objects.active = o; o.select_set(True); o.data.materials.clear(); o.data.materials.append(iron)
        m = o.modifiers.new('d', 'DECIMATE'); m.ratio = .55; bpy.ops.object.modifier_apply(modifier='d')
        m = o.modifiers.new('t', 'SOLIDIFY'); m.thickness = thick; m.offset = 1; m.use_rim = True; bpy.ops.object.modifier_apply(modifier='t')
        m = o.modifiers.new('b', 'BEVEL'); m.width = thick*.35; m.segments = 2; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(50); bpy.ops.object.modifier_apply(modifier='b'); o.select_set(False)
        weight_from(o, mask); out.append(o)
    s.hide_viewport = True; return out
sh = {sd: Vector(tuple(V[fvs[int(np.where(fs == (21 if sd == 'L' else 20))[0][0])][0]])) for sd in 'LR'}
L = []
L += plates('chest', Vector((0, 0, -1)), Vector((0, 0, 1.6)), 6, .014, .007, .006, .004)
for sd, sg in (('L', 1), ('R', -1)):
    ax = Vector((sg*.46, 0, -.89)).normalized(); org = Vector((sg*.17, 0, 1.47))
    L += plates(f'pauldron.{sd}', ax, org, 4, .018, .014, .007, .006)
rec['lock'] = {'plates': len(L), 'tris': sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in L)}; save()
shot('lock-idle-y060-1x', 2, 60, 100); shot('lock-idle-y060-5x', 2, 60, 500); shot('lock-idle-y000-5x', 2, 0, 500); shot('lock-idle-y180-5x', 2, 180, 500); shot('lock-stress-y060-5x', 3, 60, 500)
for o in masked.values(): o.modifiers.remove(o.modifiers['n'])
sc.frame_set(1); bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/EXO_Warrior_C2_lock_attempt.blend', compress=True, copy=True); print('V2_DONE', flush=True)
