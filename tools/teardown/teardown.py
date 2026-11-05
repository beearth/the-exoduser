"""Blender headless asset teardown.
blender --background --factory-startup --python teardown.py -- <mesh> --out DIR --name NAME
        [--tex role=path ...] [--renders] [--lod N] [--scale S]
roles: albedo normal rough ao arm mask height detail opacity (free-form; first 4 go on the sheet)
Writes DIR/NAME.json and, with --renders, DIR/NAME-{wire,uv,channels,silhouette,normal,ground}.png.
No window, no sound, nothing opened. Measures only; never saves a .blend."""
import bpy, bmesh, sys, os, re, json, math
import numpy as np
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:]
mesh_path = argv[0]; out = None; name = None; texarg = {}; renders = False; lod = 0; scale = 1.0
i = 1
while i < len(argv):
    a = argv[i]
    if a == '--out': out = argv[i+1]; i += 2
    elif a == '--name': name = argv[i+1]; i += 2
    elif a == '--tex': r, p = argv[i+1].split('=', 1); texarg[r] = p; i += 2
    elif a == '--renders': renders = True; i += 1
    elif a == '--lod': lod = int(argv[i+1]); i += 2
    elif a == '--scale': scale = float(argv[i+1]); i += 2
    else: raise SystemExit('unknown arg ' + a)
os.makedirs(out, exist_ok=True)
name = name or os.path.splitext(os.path.basename(mesh_path))[0]

bpy.ops.wm.read_factory_settings(use_empty=True)
ext = mesh_path.lower().rsplit('.', 1)[-1]
if ext == 'fbx': bpy.ops.import_scene.fbx(filepath=mesh_path)
elif ext in ('gltf', 'glb'): bpy.ops.import_scene.gltf(filepath=mesh_path)
elif ext == 'obj': bpy.ops.wm.obj_import(filepath=mesh_path)
else: raise SystemExit('unsupported ' + ext)
dg = bpy.context.evaluated_depsgraph_get()
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if not meshes: raise SystemExit('no mesh')

LOD = re.compile(r'lod[_ ]?(\d)', re.I)
def lod_of(o):
    m = LOD.search(o.name) or LOD.search(o.data.name)
    return int(m.group(1)) if m else 0
def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)

by_lod = {}
for o in meshes:
    d = by_lod.setdefault(lod_of(o), {'tris': 0, 'verts': 0, 'objects': []})
    d['tris'] += tris(o); d['verts'] += len(o.data.vertices)
    d['objects'].append({'name': o.name, 'tris': tris(o), 'verts': len(o.data.vertices), 'mats': [s.material.name if s.material else None for s in o.material_slots]})
main = [o for o in meshes if lod_of(o) == lod] or meshes

# ---- geometry, world space, triangulated
P = []; UVS = []; has_uv = True; per_obj = []
for o in main:
    me = o.data; me.calc_loop_triangles()
    mw = o.matrix_world
    co = np.array([tuple(mw @ v.co) for v in me.vertices], dtype=np.float64) * scale
    lt = np.zeros(len(me.loop_triangles) * 3, dtype=np.int32); me.loop_triangles.foreach_get('vertices', lt)
    ll = np.zeros(len(me.loop_triangles) * 3, dtype=np.int32); me.loop_triangles.foreach_get('loops', ll)
    P.append(co[lt].reshape(-1, 3, 3))
    if me.uv_layers:
        uv = np.zeros(len(me.loops) * 2, dtype=np.float64); me.uv_layers[0].data.foreach_get('uv', uv)
        UVS.append(uv.reshape(-1, 2)[ll].reshape(-1, 3, 2))
    else:
        has_uv = False; UVS.append(np.zeros((len(lt) // 3, 3, 2)))
    _p, _u = P[-1], UVS[-1]
    _a = float((0.5*np.linalg.norm(np.cross(_p[:,1]-_p[:,0], _p[:,2]-_p[:,0]), axis=1)).sum()); _ua = float((0.5*np.abs(np.cross(_u[:,1]-_u[:,0], _u[:,2]-_u[:,0]))).sum())
    per_obj.append({'name': o.name, 'tris': len(_p), 'area_m2': round(_a,3), 'uv_area': round(_ua,4), 'px_per_m_at_1k': round(math.sqrt(1024*1024*_ua/max(_a,1e-9)),1), 'mats': [s.material.name if s.material else None for s in o.material_slots]})
P = np.concatenate(P); UVS = np.concatenate(UVS)
A = 0.5 * np.linalg.norm(np.cross(P[:,1]-P[:,0], P[:,2]-P[:,0]), axis=1)
UA = 0.5 * np.abs(np.cross(UVS[:,1]-UVS[:,0], UVS[:,2]-UVS[:,0]))
mn = P.reshape(-1,3).min(0); mx = P.reshape(-1,3).max(0); size = mx - mn
area = float(A.sum())

# M2 pivot: root origin (first mesh's parent chain root) vs bbox bottom centre
root = main[0]
while root.parent: root = root.parent
piv = np.array(tuple(root.matrix_world.translation)) * scale
bot = np.array([(mn[0]+mx[0])/2, (mn[1]+mx[1])/2, mn[2]])
piv_rel = piv - bot

# M3 density by height thirds
cz = P[:,:,2].mean(1); h = max(size[2], 1e-6)
thirds = []
for k, nm in enumerate(['low', 'mid', 'high']):
    m = (cz >= mn[2] + h*k/3) & (cz <= mn[2] + h*(k+1)/3 if k == 2 else cz < mn[2] + h*(k+1)/3)
    a = float(A[m].sum()); n = int(m.sum())
    thirds.append({'band': nm, 'tri_share': round(n/len(A), 3), 'area_share': round(a/max(area,1e-9), 3), 'tris_per_m2': round(n/max(a,1e-9), 1)})
pct = np.percentile(A*1e4, [10, 50, 90])  # cm2

# M4 UV
vcount = {}
islands = 0
bm_total_islands = 0
for o in main:
    if not o.data.uv_layers: continue
    bm = bmesh.new(); bm.from_mesh(o.data); uvl = bm.loops.layers.uv.active
    seen = set()
    for f in bm.faces:
        if f.index in seen: continue
        bm_total_islands += 1; stack = [f]; seen.add(f.index)
        while stack:
            g = stack.pop()
            for l in g.loops:
                for l2 in l.edge.link_loops:
                    if l2 is l or l2.face.index in seen: continue
                    # same edge, same UV on both ends -> same island
                    a1, a2 = l[uvl].uv, l.link_loop_next[uvl].uv
                    b1, b2 = l2.link_loop_next[uvl].uv, l2[uvl].uv
                    if (a1-b1).length < 1e-5 and (a2-b2).length < 1e-5:
                        seen.add(l2.face.index); stack.append(l2.face)
    bm.free()
N = 1024
cnt = np.zeros((N, N), dtype=np.int32)
outside = float(np.mean((UVS < -1e-4) | (UVS > 1+1e-4))) if has_uv else None
if has_uv:
    W = np.mod(UVS, 1.0) if outside and outside > 0 else UVS
    # wrapped triangles crossing the seam would smear: only rasterize tris whose span stays local
    spans = UVS.max(1) - UVS.min(1)
    Tp = UVS - np.floor(UVS.min(1, keepdims=True))
    for t, sp in zip(Tp, spans):
        if sp.max() > 1: continue
        x = t[:,0]*N; y = t[:,1]*N
        x0, x1 = int(np.floor(x.min())), int(np.ceil(x.max())); y0, y1 = int(np.floor(y.min())), int(np.ceil(y.max()))
        if x1-x0 > 2048 or y1-y0 > 2048: continue
        gx, gy = np.meshgrid(np.arange(x0, x1+1)+.5, np.arange(y0, y1+1)+.5)
        d = (y[1]-y[2])*(x[0]-x[2]) + (x[2]-x[1])*(y[0]-y[2])
        if abs(d) < 1e-12: continue
        a = ((y[1]-y[2])*(gx-x[2]) + (x[2]-x[1])*(gy-y[2]))/d
        b = ((y[2]-y[0])*(gx-x[2]) + (x[0]-x[2])*(gy-y[2]))/d
        c = 1-a-b
        ins = (a >= -1e-3) & (b >= -1e-3) & (c >= -1e-3)
        if ins.any(): np.add.at(cnt, (gy[ins].astype(int) % N, gx[ins].astype(int) % N), 1)
covered = cnt > 0
# neighbouring tris share boundary pixels, so count only >=3 hits as real overlap evidence
uv_use = float(covered.mean()) if has_uv else None
overlap = float((cnt >= 3).sum()/max(covered.sum(), 1)) if has_uv else None

# ---- textures: explicit, else from material nodes
tex = dict(texarg)
if not tex:
    for o in main:
        for s in o.material_slots:
            m = s.material
            if not m or not m.use_nodes: continue
            for n in m.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image and n.image.filepath:
                    low = n.image.name.lower()
                    role = 'normal' if '_nor' in low or 'normal' in low else 'albedo' if '_diff' in low or 'base' in low or 'color' in low else 'arm' if '_arm' in low or 'rough' in low or 'metal' in low else 'ao' if '_ao' in low else None
                    if role and role not in tex: tex[role] = bpy.path.abspath(n.image.filepath)
base = os.path.dirname(mesh_path)
texinfo = {}
for r, p in list(tex.items()):
    fp = p if os.path.isabs(p) else os.path.join(base, p)
    if not os.path.exists(fp): texinfo[r] = {'path': p, 'missing': True}; continue
    im = bpy.data.images.load(fp, check_existing=True)
    texinfo[r] = {'file': os.path.basename(fp), 'w': im.size[0], 'h': im.size[1], 'channels': im.channels, 'depth': im.depth, 'bytes': os.path.getsize(fp), 'path': fp}

# M5 texel density from the albedo (else first map)
ref = texinfo.get('albedo') or next((v for v in texinfo.values() if 'w' in v), None)
uvarea = float(UA.sum())
td = None
if ref and 'w' in ref and area > 0:
    td = math.sqrt(ref['w']*ref['h']*uvarea/area)
td_1k = math.sqrt(1024*1024*uvarea/area) if area > 0 else None

res = {
  'source': os.path.basename(mesh_path), 'lod_measured': lod,
  'M1': {'lods': {str(k): {'tris': v['tris'], 'verts': v['verts'], 'objects': len(v['objects'])} for k, v in sorted(by_lod.items())},
         'objects_total': len(meshes), 'materials_total': len({s.material.name for o in meshes for s in o.material_slots if s.material}),
         'object_list': by_lod[lod_of(main[0])]['objects'][:40]},
  'M2': {'size_m': [round(float(x),3) for x in size], 'surface_m2': round(area,3), 'pivot_from_bottom_centre_m': [round(float(x),3) for x in piv_rel],
         'pivot_on_floor': bool(abs(piv_rel[2]) < 0.02*max(size.max(),.01) and np.hypot(piv_rel[0],piv_rel[1]) < 0.1*max(size.max(),.01))},
  'M3': {'tris_per_m2_all': round(len(A)/max(area,1e-9),1), 'thirds': thirds, 'tri_area_cm2_p10_p50_p90': [round(float(x),2) for x in pct]},
  'M4': {'has_uv': has_uv, 'uv_layers': max(len(o.data.uv_layers) for o in main), 'islands': bm_total_islands, 'uv_area_sum': round(uvarea,4),
         'use_0_1': round(uv_use,3) if uv_use is not None else None, 'overlap_ge3': round(overlap,4) if overlap is not None else None, 'loops_outside_0_1': round(outside,4) if outside is not None else None},
  'M5': {'px_per_m_from_ref': round(td,1) if td else None, 'ref_tex': (ref or {}).get('file'), 'ref_wh': [ref['w'],ref['h']] if ref and 'w' in ref else None, 'px_per_m_at_1k_uv': round(td_1k,1) if td_1k else None, 'per_object': per_obj[:30]},
  'M6': {k: {kk: vv for kk, vv in v.items() if kk != 'path'} for k, v in texinfo.items()},
}
json.dump(res, open(os.path.join(out, name + '.json'), 'w'), indent=1, ensure_ascii=False)
print('TEARDOWN', name, 'tris', len(A), 'size', res['M2']['size_m'], 'td', res['M5']['px_per_m_from_ref'], flush=True)
if not renders: sys.exit(0)

# ---- renders (Cycles CPU, fixed seed, no denoise/blur)
scene = bpy.context.scene
for o in meshes:
    keep = o in main
    o.hide_render = not keep
scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = 32; scene.cycles.use_denoising = False
scene.cycles.seed = 1; scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 960; scene.render.resolution_y = 720; scene.render.resolution_percentage = 100
w = bpy.data.worlds.new('w'); w.use_nodes = True; scene.world = w
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (1,1,1,1); bg.inputs[1].default_value = .35
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); scene.collection.objects.link(sun)
sun.data.energy = 3; sun.rotation_euler = (math.radians(60), 0, math.radians(35))
ctr = Vector(tuple((mn+mx)/2/scale))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'
PITCH = math.radians(34); YAW = math.radians(25)
d = Vector((math.sin(YAW)*math.cos(PITCH), -math.cos(YAW)*math.cos(PITCH), math.sin(PITCH)))
def aim(center, ortho):
    cam.location = center + d * (float(size.max())/scale*3 + 5)
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    cam.data.ortho_scale = ortho; cam.data.clip_end = 100000
right = (-d).cross(Vector((0,0,1))).normalized(); up = right.cross(-d).normalized()
cs = [Vector((x,y,z)) for x in (mn[0],mx[0]) for y in (mn[1],mx[1]) for z in (mn[2],mx[2])]
cs = [c/scale for c in cs]
sx = max(abs((c-ctr).dot(right)) for c in cs)*2; sy = max(abs((c-ctr).dot(up)) for c in cs)*2
fit = max(sx, sy*960/720)*1.08
aim(ctr, fit)
def setmat(fn):
    m = bpy.data.materials.new('t'); m.use_nodes = True; t = m.node_tree; t.nodes.clear()
    o_ = t.nodes.new('ShaderNodeOutputMaterial'); fn(t, o_)
    for o in main:
        o.data.materials.clear(); o.data.materials.append(m)
def clay(col=(.6,.6,.6,1), rough=.8, normal=None):
    def f(t, o_):
        b = t.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = col; b.inputs['Roughness'].default_value = rough
        t.links.new(b.outputs[0], o_.inputs[0])
        if normal:
            n = t.nodes.new('ShaderNodeNormalMap'); i_ = t.nodes.new('ShaderNodeTexImage'); i_.image = bpy.data.images.load(normal, check_existing=True); i_.image.colorspace_settings.name = 'Non-Color'
            t.links.new(i_.outputs[0], n.inputs['Color']); t.links.new(n.outputs[0], b.inputs['Normal'])
    return f
def rend(tag):
    scene.render.filepath = os.path.join(out, f'{name}-{tag}.png'); bpy.ops.render.render(write_still=True)
# silhouette: flat black on white, no lighting
def emit(col):
    def f(t, o_):
        e = t.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = col; t.links.new(e.outputs[0], o_.inputs[0])
    return f
setmat(emit((0,0,0,1))); sun.hide_render = True; bg.inputs[1].default_value = 1; rend('silhouette')
# coverage of the silhouette
px = bpy.data.images.load(os.path.join(out, f'{name}-silhouette.png')); arr = np.array(px.pixels[:]).reshape(720,960,4)[:,:,0]
res['M8'] = {'silhouette_fill_of_bbox': None}
rows = np.where((arr<.5).any(1))[0]; cols = np.where((arr<.5).any(0))[0]
if len(rows): res['M8'] = {'silhouette_px_share': round(float((arr<.5).mean()),4), 'fill_of_own_bbox': round(float((arr<.5).sum()/((rows[-1]-rows[0]+1)*(cols[-1]-cols[0]+1))),4)}
# wire
def wire(t, o_):
    b = t.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = (.72,.72,.72,1); b.inputs['Roughness'].default_value = .9
    w_ = t.nodes.new('ShaderNodeWireframe'); w_.use_pixel_size = True; w_.inputs[0].default_value = .6
    e = t.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (.02,.02,.04,1)
    mx_ = t.nodes.new('ShaderNodeMixShader'); t.links.new(w_.outputs[0], mx_.inputs[0]); t.links.new(b.outputs[0], mx_.inputs[1]); t.links.new(e.outputs[0], mx_.inputs[2]); t.links.new(mx_.outputs[0], o_.inputs[0])
sun.hide_render = False; bg.inputs[1].default_value = .35
setmat(wire); rend('wire')
aim(ctr, fit/5); rend('wirezoom'); aim(ctr, fit)
# M7: clay no normal / clay normal at a grazing sun, side by side
sun.rotation_euler = (math.radians(72), 0, math.radians(35))
nm = texinfo.get('normal', {}).get('path')
setmat(clay()); rend('_n0')
if nm:
    setmat(clay(normal=nm)); rend('_n1')
def rgb(path):
    im = bpy.data.images.load(path); return np.array(im.pixels[:], dtype=np.float32).reshape(im.size[1], im.size[0], im.channels)[:,:,:4]
def write(arr, path):
    h_, w_ = arr.shape[:2]; im = bpy.data.images.new('o', w_, h_, alpha=True)
    if arr.shape[2] == 3: arr = np.dstack([arr, np.ones((h_,w_))])
    im.pixels[:] = arr.astype(np.float32).ravel(); im.filepath_raw = path; im.file_format = 'PNG'; im.save()
a0 = rgb(os.path.join(out, f'{name}-_n0.png'))
a1 = rgb(os.path.join(out, f'{name}-_n1.png')) if nm else a0*0
write(np.hstack([a0, a1]), os.path.join(out, f'{name}-normal.png'))
for s in ('_n0','_n1'):
    p = os.path.join(out, f'{name}-{s}.png')
    if os.path.exists(p): os.remove(p)
# M9 ground contact: lowest 18% of the height, zoomed, with the map on if any
sun.rotation_euler = (math.radians(60), 0, math.radians(35))
gc = ctr.copy(); gc.z = (mn[2] + h*.09)/scale
aim(gc, max(sx*.75, h/scale*.3)); setmat(clay(normal=nm)); rend('ground')
# UV layout
scene.camera = None
img = np.ones((1024,1024,4), dtype=np.float32); img[:,:,:3] = .08
c = np.clip(cnt/3,0,1); img[:,:,0] += c*.55; img[:,:,1] += c*.55; img[:,:,2] += c*.5
img[cnt>=3] = (.8,.2,.15,1)
write(img, os.path.join(out, f'{name}-uv.png'))
# channel sheet
order = ['albedo','normal','rough','arm','ao','mask','height','detail']
ids = [r for r in order if r in texinfo and 'path' in texinfo[r]][:4]
if ids:
    S = 512; sheet = np.zeros((S, S*len(ids), 4), dtype=np.float32); sheet[:,:,3] = 1
    for j, r in enumerate(ids):
        im = bpy.data.images.load(texinfo[r]['path'], check_existing=True).copy(); im.colorspace_settings.name = 'Non-Color' if r != 'albedo' else 'sRGB'
        im.scale(S, S); a = np.array(im.pixels[:], dtype=np.float32).reshape(S, S, im.channels)
        sheet[:, j*S:(j+1)*S, :3] = a[:,:,:3] if im.channels >= 3 else np.dstack([a[:,:,0]]*3)
    write(sheet, os.path.join(out, f'{name}-channels.png')); res['M6_sheet_order'] = ids
json.dump(res, open(os.path.join(out, name + '.json'), 'w'), indent=1, ensure_ascii=False)
print('RENDERED', name, flush=True)
