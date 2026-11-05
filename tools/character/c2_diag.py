import bpy,bmesh,numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
sc=bpy.context.scene;sc.frame_set(1);body=bpy.data.objects['Body'];me=body.data
V=np.zeros(len(me.vertices)*3);me.vertices.foreach_get('co',V);V=V.reshape(-1,3);N=np.zeros(len(me.vertices)*3);me.vertex_normals.foreach_get('vector',N);N=N.reshape(-1,3)
fs=np.zeros(len(me.polygons),dtype=np.int32);me.attributes['.sculpt_face_set'].data.foreach_get('value',fs)
fvs=[list(p.vertices) for p in me.polygons];fc=np.array([tuple(p.center) for p in me.polygons]);head=np.isin(fs,[17,2,3,4,5,7,8]);hz=V[:,2].max();helm=head&((fc[:,1]>-.045)|(fc[:,2]>hz-.085))
a=bpy.data.objects['A_helm'];print('A_helm matrix',[round(x,4) for x in a.matrix_world.translation],'parent',a.parent.name if a.parent else None,'parent_inv',[round(x,4) for x in a.matrix_parent_inverse.translation])
d=bpy.context.evaluated_depsgraph_get();e=a.evaluated_get(d);m=e.to_mesh();bm=bmesh.new();bm.from_mesh(m);bmesh.ops.triangulate(bm,faces=bm.faces);tree=BVHTree.FromBMesh(bm);co=np.array([tuple(v.co) for v in bm.verts]);print('armour eval bbox',co.min(0).round(3),co.max(0).round(3),'world bbox',np.array([tuple(a.matrix_world@Vector(v)) for v in co[:2000]]).min(0).round(3));e.to_mesh_clear()
inner=sorted({v for i in np.where(helm)[0] for v in fvs[int(i)]});back=[v for v in inner if V[v][1]>.06];print('head verts back region',len(back),'body head bbox',V[inner].min(0).round(3),V[inner].max(0).round(3))
miss=[v for v in back if tree.ray_cast(Vector(V[v]),Vector(N[v]),.25)[0] is None];print('miss in back',len(miss))
for v in miss[:6]:
    p=Vector(V[v]);n=Vector(N[v]);f=tree.find_nearest(p);rv=tree.ray_cast(p+n*.25,-n,.5);print('v',v,'p',tuple(round(x,3) for x in p),'n',tuple(round(x,2) for x in n),'nearDist',round(f[3],4),'revHit',rv[0] is not None,'revDist',round(rv[3],3) if rv[0] else None)
print('DIAG_DONE')
