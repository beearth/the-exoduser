"""High scan -> game asset, end to end, headless.
blender --background --factory-startup --python tm_pipeline.py -- <high.gltf> <outdir> [--target-quads 4000] [--px-per-m 512] [--tex 2048x1024] [--mask 1024x512]
Stages: retopo (voxel + Quadriflow + shrinkwrap), uv (scripted seams, own pack), bake (BaseColor/Normal/AO/Rough), lod (x.5 chain), export FBX.
Each stage writes before/after PNG and settings into OUT/tm.json."""
import bpy, bmesh, sys, os, json, math, time
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
a = sys.argv[sys.argv.index('--')+1:]
HIGH, OUT = a[0], a[1]; opt = dict(zip(a[2::2], a[3::2]))
QUADS = int(opt.get('--target-quads', 4000)); PXM = float(opt.get('--px-per-m', 512)); METHOD = opt.get('--retopo', 'quadriflow')
TW, TH = map(int, opt.get('--tex', '2048x1024').split('x')); MW, MH = map(int, opt.get('--mask', '1024x512').split('x'))
NAME = opt.get('--name', 'A2_TM_Log'); os.makedirs(OUT, exist_ok=True)
rec = {'input': os.path.basename(HIGH), 'blender': bpy.app.version_string, 'stages': {}}
def save(): json.dump(rec, open(f'{OUT}/tm.json', 'w'), indent=1, ensure_ascii=False)
def tcount(o): return sum(len(p.vertices)-2 for p in o.data.polygons)
def act(o, sel=()):
    bpy.ops.object.mode_set(mode='OBJECT') if bpy.context.object and bpy.context.object.mode != 'OBJECT' else None
    bpy.ops.object.select_all(action='DESELECT')
    for s in sel: s.select_set(True)
    o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=HIGH)
H = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]; H.name = 'HIGH'
for o in bpy.context.scene.objects:
    if o is not H and o.type == 'EMPTY': pass
act(H); bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM'); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# pivot: bottom centre at world origin
co = np.array([tuple(v.co) for v in H.data.vertices]); mn, mx = co.min(0), co.max(0)
H.data.transform(__import__('mathutils').Matrix.Translation(-Vector(((mn[0]+mx[0])/2, (mn[1]+mx[1])/2, mn[2])))); H.data.update()
co = np.array([tuple(v.co) for v in H.data.vertices]); mn, mx = co.min(0), co.max(0); size = mx-mn
rec['high'] = {'tris': tcount(H), 'size_m': [round(float(x),3) for x in size]}
def surface(o):
    o.data.calc_loop_triangles(); return sum(t.area for t in o.data.loop_triangles)
rec['high']['area_m2'] = round(surface(H), 3)
# ---- renderer
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 32; sc.cycles.use_denoising = False; sc.cycles.seed = 1
sc.render.image_settings.file_format = 'PNG'; sc.render.resolution_x = 1280; sc.render.resolution_y = 720
w = bpy.data.worlds.new('w'); w.use_nodes = True; sc.world = w; w.node_tree.nodes['Background'].inputs[0].default_value = (1,1,1,1); w.node_tree.nodes['Background'].inputs[1].default_value = .35
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun); sun.data.energy = 3; sun.rotation_euler = (math.radians(68), 0, math.radians(35))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = 'ORTHO'
P = math.radians(34); Y = math.radians(25); dv = Vector((math.sin(Y)*math.cos(P), -math.cos(Y)*math.cos(P), math.sin(P)))
ctr = Vector((0,0,size[2]/2)); cam.location = ctr+dv*20; cam.rotation_euler = (-dv).to_track_quat('-Z','Y').to_euler(); cam.data.ortho_scale = float(size.max())*1.1; cam.data.clip_end = 200
def clay(): 
    m = bpy.data.materials.get('clay') or bpy.data.materials.new('clay'); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (.6,.6,.6,1); b.inputs['Roughness'].default_value = .8; return m
def wiremat():
    m = bpy.data.materials.get('wiremat')
    if m: return m
    m = bpy.data.materials.new('wiremat'); m.use_nodes = True; t = m.node_tree; t.nodes.clear(); o_ = t.nodes.new('ShaderNodeOutputMaterial')
    b = t.nodes.new('ShaderNodeBsdfPrincipled'); b.inputs['Base Color'].default_value = (.72,.72,.72,1); w_ = t.nodes.new('ShaderNodeWireframe'); w_.use_pixel_size = True; w_.inputs[0].default_value = .7
    e = t.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (.02,.02,.04,1); x = t.nodes.new('ShaderNodeMixShader')
    t.links.new(w_.outputs[0], x.inputs[0]); t.links.new(b.outputs[0], x.inputs[1]); t.links.new(e.outputs[0], x.inputs[2]); t.links.new(x.outputs[0], o_.inputs[0]); return m
def shot(o, mat, tag):
    for ob in sc.objects:
        if ob.type == 'MESH': ob.hide_render = ob is not o
    old = list(o.data.materials); o.data.materials.clear()
    if mat: o.data.materials.append(mat)
    else:
        for m in old: o.data.materials.append(m)
    sc.render.filepath = f'{OUT}/{tag}.png'; bpy.ops.render.render(write_still=True)
    o.data.materials.clear()
    for m in old: o.data.materials.append(m)
# ---- 1 retopo
t0 = time.time()
L = H.copy(); L.data = H.data.copy(); L.name = NAME+'_LOD0'; sc.collection.objects.link(L); L.data.materials.clear()
act(L)
L.data.remesh_voxel_size = .012; L.data.use_remesh_preserve_attributes = False; bpy.ops.object.voxel_remesh()
vox = tcount(L)
if METHOD == 'quadriflow':
    r = bpy.ops.object.quadriflow_remesh(use_mesh_symmetry=False, use_preserve_sharp=False, use_preserve_boundary=False, preserve_attributes=False, smooth_normals=False, mode='FACES', target_faces=QUADS, seed=1)
    print('QF', r, len(L.data.polygons), flush=True)
    if len(L.data.polygons) > QUADS*2.5: raise SystemExit('QUADRIFLOW_NO_EFFECT faces=%d' % len(L.data.polygons))
else:
    m = L.modifiers.new('d','DECIMATE'); m.ratio = QUADS*2/max(tcount(L),1); bpy.ops.object.modifier_apply(modifier='d')
m = L.modifiers.new('sw','SHRINKWRAP'); m.target = H; m.wrap_method = 'NEAREST_SURFACEPOINT'; bpy.ops.object.modifier_apply(modifier='sw')
bpy.ops.object.shade_smooth()
bmq = bmesh.new(); bmq.from_mesh(L.data); bmesh.ops.triangulate(bmq, faces=bmq.faces, quad_method='BEAUTY', ngon_method='BEAUTY'); bmq.to_mesh(L.data); bmq.free(); L.data.update()
def dev(src, dst, n=20000):
    bm = bmesh.new(); bm.from_mesh(dst.data); tree = BVHTree.FromBMesh(bm)
    v = np.array([tuple(x.co) for x in src.data.vertices]); idx = np.random.default_rng(1).choice(len(v), min(n,len(v)), replace=False)
    d = np.array([tree.find_nearest(Vector(v[i]))[3] for i in idx]); bm.free(); return d
d1 = dev(L, H); d2 = dev(H, L)
rec['stages']['retopo'] = {'method': METHOD, 'voxel_size_m': .012, 'voxel_tris': vox, 'target_quads': QUADS, 'tris': tcount(L), 'verts': len(L.data.vertices), 'area_m2': round(surface(L),3),
  'low_to_high_mm_rms_max': [round(float(np.sqrt((d1**2).mean())*1e3),2), round(float(d1.max()*1e3),2)], 'high_to_low_mm_rms_max': [round(float(np.sqrt((d2**2).mean())*1e3),2), round(float(d2.max()*1e3),2)], '_': 0}
save(); print('RETOPO', rec['stages']['retopo'], flush=True)
shot(H, wiremat(), 'tm-retopo-before'); shot(L, wiremat(), 'tm-retopo-after'); shot(H, clay(), 'tm-retopo-shape-before'); shot(L, clay(), 'tm-retopo-shape-after')
# ---- 2 uv: scripted seams, min-stretch unwrap, own pack in pixel space
t0 = time.time(); act(L); L.data.uv_layers.new(name='UVMap'); bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(L.data)
degen0 = len(bm.faces); bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=.002)
bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
# collapse slivers: a face whose shortest altitude is under 3mm has no usable UV area
for _ in range(3):
    sl = [f for f in bm.faces if f.calc_area() < 2e-5]
    if not sl: break
    bmesh.ops.dissolve_degenerate(bm, edges=list({e for f in sl for e in f.edges}), dist=.012)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table(); bm.faces.ensure_lookup_table()
xs = np.array([v.co.x for v in bm.verts]); x0, x1 = xs.min(), xs.max(); L_ = x1-x0
nb = 24; cs = np.zeros((nb,2)); cnt = np.zeros(nb)
for v in bm.verts:
    i = min(int((v.co.x-x0)/L_*nb), nb-1); cs[i] += (v.co.y, v.co.z); cnt[i] += 1
cs = cs/np.maximum(cnt,1)[:,None]
def th(v):
    i = min(int((v.co.x-x0)/L_*nb), nb-1); return math.atan2(v.co.y-cs[i,0], -(v.co.z-cs[i,1]))  # 0 = straight down
capA, capB = x0+.05*L_, x1-.05*L_
for e in bm.edges: e.seam = False
# cap rings: boundary between face regions
def reg(f):
    x = f.calc_center_median().x; return 0 if x < capA else 2 if x > capB else 1
for e in bm.edges:
    fs = e.link_faces
    if len(fs) == 2 and reg(fs[0]) != reg(fs[1]): e.seam = True
# one bottom seam: cheapest edge path from cap A to cap B, hugging straight-down
import heapq
ringA = {v for e in bm.edges if e.seam for v in e.verts if v.co.x < (x0+x1)/2}; ringB = {v for e in bm.edges if e.seam for v in e.verts if v.co.x >= (x0+x1)/2}
start = min(ringA, key=lambda v: abs(th(v))); dist = {start: 0}; prev = {}; hp = [(0, start.index)]; end = None
while hp:
    d, i = heapq.heappop(hp); v = bm.verts[i]
    if d > dist[v]: continue
    if v in ringB: end = v; break
    for e in v.link_edges:
        if e.seam: continue
        o = e.other_vert(v); c = e.calc_length()*(1+6*abs(th(o))); nd = d+c
        if nd < dist.get(o, 1e18): dist[o] = nd; prev[o] = (v, e); heapq.heappush(hp, (nd, o.index))
v = end
while v is not start and v in prev:
    u, e = prev[v]; e.seam = True; v = u
seams = sum(e.seam for e in bm.edges); degen = degen0-len(bm.faces)
bmesh.update_edit_mesh(L.data)
bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.uv.unwrap(method=opt.get('--unwrap','MINIMUM_STRETCH'), margin=0.02)
bm = bmesh.from_edit_mesh(L.data); uvl = bm.loops.layers.uv.active; bm.faces.ensure_lookup_table()
seen = set(); islands = []
for f in bm.faces:
    if f.index in seen: continue
    st = [f]; seen.add(f.index); cur = []
    while st:
        g = st.pop(); cur.append(g)
        for l in g.loops:
            if l.edge.seam: continue
            for l2 in l.edge.link_loops:
                if l2.face.index not in seen: seen.add(l2.face.index); st.append(l2.face)
    islands.append(cur)
# world area per uv area -> uniform pixels per metre
def uvA(f):
    u = [l[uvl].uv for l in f.loops]; return sum(abs((u[i]-u[0]).cross(u[i+1]-u[0])) for i in range(1,len(u)-1))/2
PAD = 12
pack = []
for isl in islands:
    pxperuv = PXM*math.sqrt(sum(f.calc_area() for f in isl)/max(sum(uvA(f) for f in isl),1e-12))
    pts = np.array([tuple(l[uvl].uv) for f in isl for l in f.loops])*pxperuv
    best = None
    for ang in np.radians(np.arange(0, 180, 3)):
        c, s_ = math.cos(ang), math.sin(ang); q = pts@np.array([[c,-s_],[s_,c]]); e = q.max(0)-q.min(0)
        if e[0] < e[1]: continue
        if best is None or e[0]*e[1] < best[0]: best = (e[0]*e[1], ang, q.min(0), e)
    if best is None: best = (0, 0, pts.min(0), pts.max(0)-pts.min(0))
    pack.append((isl, best, pxperuv))
pack.sort(key=lambda p: -p[1][3][1])
def shelf(scale):
    X = PAD; Y_ = PAD; sh = 0; out = []
    for isl, b, _p in pack:
        w_, h_ = b[3]*scale
        if w_+2*PAD > TW or h_+2*PAD > TH: return None
        if X+w_+PAD > TW: X = PAD; Y_ += sh+2*PAD; sh = 0
        out.append((X, Y_)); X += w_+2*PAD; sh = max(sh, h_)
    return out if Y_+sh+PAD <= TH else None
scale = 1.0
while shelf(scale) is None and scale > .3: scale *= .98
pos = shelf(scale)
for (isl, b, pxperuv), (X, Y_) in zip(pack, pos):
    c, s_ = math.cos(b[1]), math.sin(b[1]); R = np.array([[c,-s_],[s_,c]])
    for f in isl:
        for l in f.loops:
            q = (np.array(tuple(l[uvl].uv))*pxperuv@R-b[2])*scale
            l[uvl].uv = ((q[0]+X)/TW, (q[1]+Y_)/TH)
bmesh.update_edit_mesh(L.data); bpy.ops.object.mode_set(mode='OBJECT')
# stretch: per-tri (uv px area / world area) relative spread; used share
L.data.calc_loop_triangles(); uv = L.data.uv_layers[0].data; dens = []; wts = []; ua = 0
for t in L.data.loop_triangles:
    u = [Vector((uv[i].uv.x*TW, uv[i].uv.y*TH)) for i in t.loops]; A = abs((u[1]-u[0]).cross(u[2]-u[0]))/2; ua += A
    if t.area > 1e-8: dens.append(math.sqrt(A/t.area)); wts.append(t.area)
dens = np.array(dens); wts = np.array(wts); o_ = np.argsort(dens); cw = np.cumsum(wts[o_])/wts.sum(); wp = lambda q: float(dens[o_][np.searchsorted(cw, q)])
rec['stages']['uv'] = {'seam_plan': '바닥 세로 심 1개 + 양끝 5% 고리 심 (스크립트로 지정, 스마트 UV 아님)', 'seam_edges': seams, 'islands': len(islands), 'tex': [TW,TH], 'target_px_per_m': PXM,
  'area_weighted_px_per_m_p5_p50_p95': [round(wp(.05),1), round(wp(.5),1), round(wp(.95),1)], 'sliver_faces_removed': degen, 'tris_after_cleanup': tcount(L) if False else None, 'used_share': round(ua/(TW*TH),3), 'pack_scale': round(scale,3), 'padding_px': PAD, '_': 0}
save(); print('UV', rec['stages']['uv'], flush=True)
# ---- 3 bake
t0 = time.time()
def newimg(n, w_, h_, cs_='Non-Color', col=(0,0,0,1)):
    im = bpy.data.images.new(n, w_, h_, alpha=False, float_buffer=False); im.colorspace_settings.name = cs_; im.generated_color = col; return im
L.data.materials.clear(); bakemat = bpy.data.materials.new('bake'); bakemat.use_nodes = True; L.data.materials.append(bakemat)
node = bakemat.node_tree.nodes.new('ShaderNodeTexImage'); bakemat.node_tree.nodes.active = node
sc.render.bake.use_selected_to_active = True; sc.render.bake.cage_extrusion = .03; sc.render.bake.max_ray_distance = .10; sc.render.bake.margin = 16; sc.render.bake.margin_type = 'EXTEND'
for ob in sc.objects:
    if ob.type == 'MESH': ob.hide_render = False
act(L, [H])
bk = {}
def bake(tag, typ, w_, h_, cs_, spp, col=(0,0,0,1), **kw):
    t1 = time.time(); im = newimg(f'{NAME}_{tag}', w_, h_, cs_, col); node.image = im; sc.cycles.samples = spp
    bpy.ops.object.bake(type=typ, **kw); im.filepath_raw = f'{OUT}/{NAME}_{tag}.png'; im.file_format = 'PNG'; im.save(); bk[tag] = {'type': typ, 'size': [w_,h_], 'samples': spp, '_': 0}; print('BAKE', tag, bk[tag], flush=True); return im
imN = bake('Normal', 'NORMAL', TW, TH, 'Non-Color', 8, (.5,.5,1,1), normal_space='TANGENT')
imC = bake('BaseColor', 'DIFFUSE', TW, TH, 'sRGB', 8, pass_filter={'COLOR'})
imR = bake('Rough', 'ROUGHNESS', MW, MH, 'Non-Color', 8)
sc.world.light_settings.distance = 1.0
imA = bake('AO', 'AO', MW, MH, 'Non-Color', 256)
# ARM packed R=AO G=Rough B=0
a_ = np.array(imA.pixels[:]).reshape(MH,MW,4); r_ = np.array(imR.pixels[:]).reshape(MH,MW,4)
arm = np.dstack([a_[:,:,0], r_[:,:,0], np.zeros((MH,MW)), np.ones((MH,MW))]); ima = bpy.data.images.new(f'{NAME}_ARM', MW, MH, alpha=True); ima.colorspace_settings.name = 'Non-Color'; ima.pixels[:] = arm.astype(np.float32).ravel(); ima.filepath_raw = f'{OUT}/{NAME}_ARM.png'; ima.file_format = 'PNG'; ima.save()
rec['stages']['bake'] = {'engine': 'Cycles CPU', 'selected_to_active': True, 'cage_extrusion_m': .03, 'max_ray_m': .10, 'margin_px': 16, 'ao_distance_m': 1.0, 'maps': bk, 'ao_highpass_noise': round(float(np.abs(a_[1:-1,1:-1,0]-(a_[:-2,1:-1,0]+a_[2:,1:-1,0]+a_[1:-1,:-2,0]+a_[1:-1,2:,0])/4).mean()),5), '_': 0}
save()
def lit(normal=True, color=True):
    m = bpy.data.materials.new('lit'); m.use_nodes = True; t = m.node_tree; b = t.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = .8
    if color:
        c = t.nodes.new('ShaderNodeTexImage'); c.image = imC; t.links.new(c.outputs[0], b.inputs['Base Color'])
    else: b.inputs['Base Color'].default_value = (.6,.6,.6,1)
    if normal:
        n = t.nodes.new('ShaderNodeNormalMap'); i_ = t.nodes.new('ShaderNodeTexImage'); i_.image = imN; t.links.new(i_.outputs[0], n.inputs['Color']); t.links.new(n.outputs[0], b.inputs['Normal'])
    return m
sc.cycles.samples = 32
shot(L, lit(False,False), 'tm-bake-before'); shot(L, lit(True,False), 'tm-bake-after'); shot(L, lit(True,True), 'tm-bake-after-color'); shot(H, None, 'tm-bake-high-reference')
# ---- 4 LOD
t0 = time.time(); act(L); lods = [L]; L.data.materials.clear(); L.data.materials.append(lit(True,True))
base = tcount(L)
for i, ratio in ((1,.5),(2,.25)):
    o = L.copy(); o.data = L.data.copy(); o.name = f'{NAME}_LOD{i}'; sc.collection.objects.link(o); act(o)
    m = o.modifiers.new('d','DECIMATE'); m.ratio = ratio; m.use_collapse_triangulate = True; bpy.ops.object.modifier_apply(modifier='d'); bpy.ops.object.shade_smooth(); lods.append(o)
rec['stages']['lod'] = {'chain': [tcount(o) for o in lods], 'method': 'Decimate COLLAPSE, UV 유지, 같은 텍스처 공유', 'dev_mm_rms_max_to_high': [[round(float(np.sqrt((d**2).mean())*1e3),2), round(float(d.max()*1e3),2)] for d in (dev(o,H) for o in lods)], '_': 0}
save(); print('LOD', rec['stages']['lod'], flush=True)
shot(lods[0], wiremat(), 'tm-lod-before'); shot(lods[2], wiremat(), 'tm-lod-after'); shot(lods[1], wiremat(), 'tm-lod-mid'); shot(lods[2], None, 'tm-lod-after-color')
# ---- export
bpy.ops.object.select_all(action='DESELECT')
for o in lods: o.select_set(True); o.data.materials.clear()
mm = bpy.data.materials.new(NAME); 
for o in lods: o.data.materials.append(mm)
bpy.context.view_layer.objects.active = lods[0]
bpy.ops.export_scene.fbx(filepath=f'{OUT}/{NAME}.fbx', use_selection=True, object_types={'MESH'}, mesh_smooth_type='FACE', use_tspace=False, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y', bake_anim=False, add_leaf_bones=False, path_mode='STRIP')
rec['stages']['export'] = {'fbx': NAME+'.fbx', 'axis': '-Z forward, Y up', 'smooth': 'FACE', 'bytes': os.path.getsize(f'{OUT}/{NAME}.fbx')}
save(); print('TM_DONE', flush=True)
