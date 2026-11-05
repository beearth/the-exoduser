# where the ray test says "through": mark points, by material region, in the rest pose
import bpy,bmesh,sys,json,os,math
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
OUT=sys.argv[sys.argv.index('--')+1]
sc=bpy.context.scene;sc.frame_set(1);body=bpy.data.objects['Body'];me=body.data
V=np.zeros(len(me.vertices)*3);me.vertices.foreach_get('co',V);V=V.reshape(-1,3);N=np.zeros(len(me.vertices)*3);me.vertex_normals.foreach_get('vector',N);N=N.reshape(-1,3)
fs=np.zeros(len(me.polygons),dtype=np.int32);me.attributes['.sculpt_face_set'].data.foreach_get('value',fs)
fvs=[list(p.vertices) for p in me.polygons];fc=np.array([tuple(p.center) for p in me.polygons]);head_z=V[:,2].max();brow=head_z-.085
head=np.isin(fs,[17,2,3,4,5,7,8]);helm=head&((fc[:,1]>-.045)|(fc[:,2]>brow));chest=fs==1
def erode(mask):
    edge={}
    for i in np.where(mask)[0]:
        vs=fvs[int(i)]
        for a,c in zip(vs,vs[1:]+vs[:1]):edge[tuple(sorted((a,c)))]=edge.get(tuple(sorted((a,c))),0)+1
    rim={v for e,n in edge.items() if n==1 for v in e}
    return np.array([bool(m) and not (set(fvs[i])&rim) for i,m in enumerate(mask)]),rim
res={};mark=[]
for name,mask in (('helm',helm),('chest',chest)):
    a=bpy.data.objects['A_'+name];d=bpy.context.evaluated_depsgraph_get();e=a.evaluated_get(d);bm=bmesh.new();bm.from_mesh(e.to_mesh());bmesh.ops.triangulate(bm,faces=bm.faces);tree=BVHTree.FromBMesh(bm);e.to_mesh_clear()
    er,rim=erode(mask);inner=sorted({v for i in np.where(er)[0] for v in fvs[int(i)]});miss=[]
    for v in inner:
        h=tree.ray_cast(Vector(V[v]),Vector(N[v]),.25)
        if h[0] is None:miss.append(v)
    # classify: signed distance from the nearest armour point; really outside = no armour within the shell and the body point is farther out than the armour surface
    out=[];inner_miss=[];rimd=[]
    Rv=V[sorted(rim)]
    for v in miss:
        loc,nor,idx,dist=tree.find_nearest(Vector(V[v]));s=(Vector(V[v])-loc).dot(nor);dr=float(np.min(np.linalg.norm(Rv-V[v],axis=1)))
        # surface sign: inner sheet normals point to the body as well, so use the outward body normal
        out_by=(Vector(V[v])-loc).dot(Vector(N[v]));rimd.append(dr)
        if dist<.004 or out_by>0.002:out.append(v)
        else:inner_miss.append(v)
    res[name]={'inner_verts':len(inner),'ray_miss':len(miss),'body_normal_points_away_or_cavity':len(inner_miss),'at_or_beyond_armour':len(out),'miss_dist_to_rim_cm':[round(float(np.percentile(rimd,q))*100,1) for q in (50,90,100)] if rimd else [],'z_range':[round(float(V[miss,2].min()),3),round(float(V[miss,2].max()),3)] if miss else [], 'facesets':{str(int(k)):int(c) for k,c in zip(*np.unique([fs[i] for i,vs in enumerate(fvs) if set(vs)&set(miss)],return_counts=True))}};bm.free();mark.append((name,miss,out))
json.dump(res,open(f'{OUT}/c2-pierce.json','w'),indent=1);print('PIERCE',res,flush=True)
# marker render: every ray miss yellow, confirmed outside red
for n,c in (('miss',(1,.8,0,1)),('out',(1,0,0,1))):
    m=bpy.data.materials.new(n);m.use_nodes=True;t=m.node_tree;t.nodes.clear();e_=t.nodes.new('ShaderNodeEmission');e_.inputs[0].default_value=c;e_.inputs[1].default_value=3;o_=t.nodes.new('ShaderNodeOutputMaterial');t.links.new(e_.outputs[0],o_.inputs[0])
for name,miss,out in mark:
    for vs,mn in ((miss,'miss'),(out,'out')):
        if not vs:continue
        ms=bpy.data.meshes.new('mk');bm=bmesh.new()
        for v in vs:
            r=bmesh.ops.create_icosphere(bm,subdivisions=1,radius=.006);bmesh.ops.translate(bm,verts=r['verts'],vec=Vector(V[v])+Vector(N[v])*.05)
        bm.to_mesh(ms);bm.free();ob=bpy.data.objects.new(f'mk_{name}_{mn}',ms);sc.collection.objects.link(ob);ms.materials.append(bpy.data.materials[mn])
cam=sc.camera;P=33;dist=4.5;t=Vector((0,0,1.5))
for y in (0,60,180):
    dv=Vector((math.sin(math.radians(y))*math.cos(math.radians(P)),-math.cos(math.radians(y))*math.cos(math.radians(P)),math.sin(math.radians(P))));cam.location=t+dv*dist;cam.rotation_euler=(-dv).to_track_quat('-Z','Y').to_euler();sc.render.resolution_percentage=100;sc.render.use_border=False;cam.data.angle_y=math.radians(25);sc.render.resolution_x=900;sc.render.resolution_y=900;sc.cycles.samples=24;sc.render.filepath=f'{OUT}/pierce-y{y:03d}.png';bpy.ops.render.render(write_still=True)
print('PIERCE_DONE')
