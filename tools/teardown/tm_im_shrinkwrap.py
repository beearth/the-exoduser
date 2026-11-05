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
def dev(src,dst,n=20000):
    bm=bmesh.new();bm.from_mesh(dst.data);bmesh.ops.triangulate(bm,faces=bm.faces);tree=BVHTree.FromBMesh(bm)
    v=np.array([tuple(x.co) for x in src.data.vertices]);idx=np.random.default_rng(1).choice(len(v),min(n,len(v)),replace=False)
    d=np.array([tree.find_nearest(Vector(v[i]))[3] for i in idx]);bm.free();return d
def stats(o):
    bm=bmesh.new();bm.from_mesh(o.data);bm.edges.ensure_lookup_table()
    deg={}
    for f in bm.faces: deg[len(f.verts)]=deg.get(len(f.verts),0)+1
    bd=sum(1 for e in bm.edges if len(e.link_faces)==1);nm=sum(1 for e in bm.edges if len(e.link_faces)>2)
    val={}
    for v in bm.verts: val[len(v.link_edges)]=val.get(len(v.link_edges),0)+1
    seen=set();comp=[]
    for v in bm.verts:
        if v.index in seen: continue
        s=[v];seen.add(v.index);c=0
        while s:
            x=s.pop();c+=1
            for e in x.link_edges:
                y=e.other_vert(x)
                if y.index not in seen: seen.add(y.index);s.append(y)
        comp.append(c)
    bm.free();comp.sort(reverse=True)
    return {'faces':len(o.data.polygons),'verts':len(o.data.vertices),'tris':tcount(o),'face_degree':{str(k):deg[k] for k in sorted(deg)},'boundary_edges':bd,'nonmanifold_edges':nm,'components':len(comp),'largest_component_verts':comp[:3],'interior_valence4_share':round(val.get(4,0)/len(o.data.vertices),3),'area_m2':round(surface(o),3)}
bpy.ops.wm.obj_import(filepath=f'{OUT}/im_4000.obj',forward_axis='Y',up_axis='Z')
L=bpy.context.selected_objects[0];L.name='im_4000_sw';L.data.materials.clear()
act(L);m=L.modifiers.new('sw','SHRINKWRAP');m.target=H;m.wrap_method='NEAREST_SURFACEPOINT';bpy.ops.object.modifier_apply(modifier='sw')
s=stats(L);d1=dev(L,H);d2=dev(H,L)
s['low_to_high_mm_rms_max']=[round(float(np.sqrt((d1**2).mean())*1e3),2),round(float(d1.max()*1e3),2)]
s['high_to_low_mm_rms_max']=[round(float(np.sqrt((d2**2).mean())*1e3),2),round(float(d2.max()*1e3),2)]
s['high_to_low_mm_p50_p95_p99']=[round(float(np.percentile(d2,q)*1e3),2) for q in (50,95,99)]
bm=bmesh.new();bm.from_mesh(L.data);bmesh.ops.triangulate(bm,faces=bm.faces);tree=BVHTree.FromBMesh(bm)
V=np.array([tuple(x.co) for x in H.data.vertices]);D=np.array([tree.find_nearest(Vector(p))[3] for p in V]);bm.free()
far=V[D>.05]
s['high_verts_over_50mm']={'count':int(len(far)),'share':round(float(len(far)/len(V)),4),'rms_without_mm':round(float(np.sqrt((D[D<=.05]**2).mean())*1e3),2)}
if len(far): s['high_verts_over_50mm'].update(bbox_min=[round(float(x),3) for x in far.min(0)],bbox_max=[round(float(x),3) for x in far.max(0)])
bm=bmesh.new();bm.from_mesh(H.data);bm.verts.ensure_lookup_table();seen=set();cs=[]
idx=set(np.where(D>.05)[0].tolist())
for i in list(idx):
    if i in seen: continue
    st=[i];seen.add(i);c=[]
    while st:
        x=st.pop();c.append(x)
        for e in bm.verts[x].link_edges:
            y=e.other_vert(bm.verts[x]).index
            if y in idx and y not in seen: seen.add(y);st.append(y)
    cs.append(c)
bm.free();cs.sort(key=len,reverse=True)
s['far_clusters_top']=[{'verts':len(c),'min':[round(float(x),3) for x in V[c].min(0)],'max':[round(float(x),3) for x in V[c].max(0)],'max_mm':round(float(D[c].max()*1e3),1)} for c in cs[:6]]
rec['stages']['sw4000']=s;save();print('SW',s,flush=True)
act(L);bpy.ops.object.shade_smooth();shot(L,clay(),'tm-im-vox-4000-sw-shape')
print('DONE',flush=True)
