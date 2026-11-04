import bpy, sys, json, numpy as np
from mathutils import Vector, kdtree
tex, orig = sys.argv[sys.argv.index("--")+1:][:2]
def load(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    out={}
    for o in bpy.context.scene.objects:
        if o.type=="MESH":
            M=np.array(o.matrix_world)
            v=np.array([tuple(x.co) for x in o.data.vertices])
            v=(M[:3,:3]@v.T).T+M[:3,3]
            out[o.name]=v
    return out
T=load(tex); O=load(orig)
print("names equal", set(T)==set(O), len(T), len(O))
same=sum(1 for k in T if k in O and len(T[k])==len(O[k]))
print("same vertex count parts", same)
names=sorted(set(T)&set(O))
# centroids and bbox corners as point set
def pts(D):
    P=[]
    for n in names:
        v=D[n]; P.append(v.mean(0)); P.append(v.min(0)); P.append(v.max(0))
    return np.array(P)
A=pts(T); B=pts(O)
def umeyama(A,B):
    ma,mb=A.mean(0),B.mean(0)
    Ac,Bc=A-ma,B-mb
    H=Ac.T@Bc/len(A)
    U,S,Vt=np.linalg.svd(H)
    d=np.sign(np.linalg.det(U@Vt)); D=np.diag([1,1,d])
    R=Vt.T@D@U.T
    s=(S*np.diag(D)).sum()/ (Ac**2).sum()*len(A)
    t=mb-s*R@ma
    return s,R,t
s,R,t=umeyama(A,B)
ang=np.degrees(np.arctan2(R[1,0],R[0,0]))
print("scale",s,"yaw deg",ang,"R",R.round(5).tolist(),"t",t)
# refine with only centroids (rotation constrained to yaw): done by svd; check tilt
print("R[2,2]",R[2,2])
errs=[]
for n in names:
    p=(s*(R@T[n].T)).T+t
    if False:
        e=np.linalg.norm(p-O[n],axis=1)
    else:
        kd=kdtree.KDTree(len(O[n]))
        for i,x in enumerate(O[n]): kd.insert(Vector(x),i)
        kd.balance()
        e=np.array([kd.find(Vector(x))[2] for x in p])
    errs.append((e.max(),e.mean(),n,len(T[n]),len(O[n])))
errs.sort(reverse=True)
print("worst 12", [(round(x[0]*1000,2),round(x[1]*1000,2),x[2],x[3],x[4]) for x in errs[:12]]); print("over1mm",[(x[2],round(x[0]*1000,2)) for x in errs if x[0]>0.001])
print("max mm",errs[0][0]*1000,"mean of means mm",np.mean([e[1] for e in errs])*1000)
json.dump({"scale":s,"R":R.tolist(),"t":t.tolist(),"yawDeg":float(ang)},open("I:/EXODUSER-Storage/char-modular/bake/align.json","w"))
