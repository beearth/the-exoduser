"""S3 staff neck study: fuse authored root masses as one level-set surface.

This is a new volume construction, not a tube-coordinate retouch of staff v2.
It preserves v2 and writes only a separate I: review candidate. No Unity import.
"""
from pathlib import Path
import json
import math
import shutil
import numpy as np
from numba import njit, prange
from skimage.measure import marching_cubes

ROOT = Path(__file__).resolve().parents[2]
STUDIES = ROOT / "Assets/Exoduser/Remodel/Boss/DarkDruid/Studies"
SOURCE = STUDIES / "dark_druid_staff_v2.obj"
SOURCE_MTL = STUDIES / "dark_druid_staff_v2.mtl"
OUT = Path("I:/EXODUSER-Storage/boss/staff-neck-sdf-20261029")
NAME = "dark_druid_staff_neck_sdf"

# Hand-placed, thick root masses follow the S3 cage silhouette. The first bough
# descends into the 4 cm shaft; all other boughs enter its swollen neck.
PATHS = (
    (((-.003,1.515,.004,.018),(.000,1.650,.003,.019),(.008,1.780,.002,.024),
      (.019,1.875,.002,.032),(.026,1.940,.004,.036),(.030,1.988,.006,.023))),
    (((.025,1.905,.010,.027),(-.025,1.965,.048,.025),(-.086,2.052,.077,.021),
      (-.126,2.135,.058,.018),(-.091,2.223,.003,.012),(-.054,2.298,-.020,.002))),
    (((.026,1.909,.010,.027),(.065,1.976,.052,.026),(.116,2.055,.072,.022),
      (.133,2.130,.030,.017),(.095,2.222,-.014,.011),(.080,2.288,-.039,.002))),
    (((.025,1.907,-.006,.025),(-.034,1.988,-.046,.022),(-.097,2.087,-.081,.019),
      (-.081,2.173,-.084,.014),(-.021,2.272,-.057,.003))),
    (((.026,1.908,-.007,.025),(.077,1.993,-.046,.022),(.123,2.095,-.073,.018),
      (.094,2.190,-.080,.013),(.044,2.291,-.055,.002))),
    # Two diagonal boughs cross the illuminated core and fuse into side roots.
    (((-.115,2.105,.064,.014),(-.068,2.126,.102,.015),(.004,2.158,.115,.014),
      (.071,2.181,.096,.013),(.125,2.136,.039,.012))),
    (((.115,2.075,.069,.014),(.056,2.094,.107,.015),(-.010,2.112,.115,.014),
      (-.071,2.154,.101,.013),(-.119,2.139,.054,.012))),
)


def segments():
    """Sample smooth authored splines into variable-radius capsule segments."""
    result = []
    for path in PATHS:
        nodes = np.asarray(path, np.float32)
        samples = []
        for i in range(len(nodes)-1):
            a, b = nodes[i], nodes[i+1]
            before, after = nodes[max(0,i-1)], nodes[min(i+2,len(nodes)-1)]
            for j in range(5):
                t = j/5
                samples.append((2*t**3-3*t**2+1)*a + (t**3-2*t**2+t)*.5*(b-before)
                               + (-2*t**3+3*t**2)*b + (t**3-t**2)*.5*(after-a))
        samples.append(nodes[-1])
        for a,b in zip(samples[:-1],samples[1:]):
            result.append(np.concatenate([a,b]))
    return np.asarray(result,np.float32)


@njit(parallel=True)
def field(xs, ys, zs, segs):
    values = np.empty((len(xs),len(ys),len(zs)),np.float32)
    blend = .012
    for ix in prange(len(xs)):
        x = xs[ix]
        for iy in range(len(ys)):
            y = ys[iy]
            for iz in range(len(zs)):
                z = zs[iz]
                d = 10.0
                for s in range(len(segs)):
                    ax,ay,az,ra,bx,by,bz,rb = segs[s]
                    dx,dy,dz = bx-ax,by-ay,bz-az
                    den = dx*dx+dy*dy+dz*dz
                    t = max(0.0,min(1.0,((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/den))
                    px,py,pz = ax+t*dx,ay+t*dy,az+t*dz
                    radius = ra+t*(rb-ra)
                    q = math.sqrt((x-px)**2+(y-py)**2+(z-pz)**2)-radius
                    h = max(blend-abs(d-q),0.0)/blend
                    d = min(d,q)-.25*blend*h*h
                # Bark's broad vertical furrows are cut in the actual surface.
                angle = math.atan2(z-.002,x-.02)
                relief = .0016*math.sin(9*angle+9*y)+.0008*math.sin(17*angle-14*y)
                values[ix,iy,iz] = d+relief
    return values


def source_geometry():
    vertices=[]; uv=[]; faces=[]; mats=[]; current=""
    for line in SOURCE.open(encoding="ascii"):
        if line.startswith("v "):
            vertices.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("vt "):
            uv.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("usemtl "):
            current=line.split()[1]
        elif line.startswith("f "):
            tri=tuple(int(q.split('/')[0])-1 for q in line.split()[1:])
            hi=max(vertices[i][1] for i in tri)
            # Retain the gripped lower staff, skull, butt, orb and its shell.
            # The upper procedural roots and their floating moss are replaced.
            if current in ("charred_root","raised_bark") and hi>1.56: continue
            if current=="recess" and hi>1.60: continue
            faces.append(tri); mats.append(current)
    return vertices,uv,faces,mats


def build():
    OUT.mkdir(parents=True,exist_ok=True)
    xs=np.arange(-.175,.176,.003,dtype=np.float32)
    ys=np.arange(1.515,2.305,.003,dtype=np.float32)
    zs=np.arange(-.17,.171,.003,dtype=np.float32)
    segs=segments()
    values=field(xs,ys,zs,segs)
    verts,faces,norms,_=marching_cubes(values,0,spacing=(.003,.003,.003),gradient_direction="ascent")
    verts+=np.array([xs[0],ys[0],zs[0]],np.float32)
    # The voxel grid rounds tiny tip ends; return the upper envelope to 2.30 m.
    peak=float(np.max(verts[:,1]))
    top=verts[:,1]>2.15
    verts[top,1]+=(verts[top,1]-2.15)/(peak-2.15)*(2.30-peak)
    # Check outward orientation from the straight neck, correcting if needed.
    sample=faces[(verts[faces].mean(axis=1)[:,1]>1.68)&(verts[faces].mean(axis=1)[:,1]<1.74)]
    p=verts[sample]
    n=np.cross(p[:,1]-p[:,0],p[:,2]-p[:,0])
    radial=p.mean(axis=1)[:,(0,2)]-np.array([.004,.002])
    if np.median(np.sum(n[:,(0,2)]*radial,axis=1))<0:
        faces=faces[:,(0,2,1)]
    base_v,base_uv,base_f,base_m=source_geometry()
    offset=len(base_v)
    out_v=base_v+[tuple(map(float,v)) for v in verts]
    # UV stays inside the same existing bark atlas patch used by v2.
    out_uv=base_uv+[(.175+.115*((math.atan2(v[2]-.002,v[0]-.02)+math.pi)/(2*math.pi)),
                     .43+.14*((v[1]-1.515)/.72%1)) for v in verts]
    out_f=base_f+[tuple(int(i)+offset for i in tri) for tri in faces]
    out_m=base_m+["charred_root"]*len(faces)
    obj=OUT/(NAME+".obj")
    with obj.open("w",encoding="ascii",newline="\n") as f:
        f.write("# Dark Druid S3 neck level-set study; Y-up metres\nmtllib "+NAME+".mtl\n")
        for v in out_v: f.write("v %.6f %.6f %.6f\n"%v)
        for uv in out_uv: f.write("vt %.6f %.6f\n"%uv)
        last=None
        for tri,mat in zip(out_f,out_m):
            if mat!=last: f.write("usemtl "+mat+"\n"); last=mat
            f.write("f "+" ".join(f"{i+1}/{i+1}" for i in tri)+"\n")
    shutil.copyfile(SOURCE_MTL,OUT/(NAME+".mtl"))
    # All new boughs must form one connected shell; report exact component count.
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    edges=np.concatenate((faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]))
    graph=coo_matrix((np.ones(len(edges),np.uint8),(edges[:,0],edges[:,1])),shape=(len(verts),len(verts))).tocsr()
    components,_=connected_components(graph,directed=False)
    # The retained lower shaft reaches to 1.56; the new shell begins at 1.515.
    # Count retained shaft vertices enclosed by the level-set in their shared zone.
    overlap=0
    for x,y,z in base_v:
        if 1.52<=y<=1.56:
            ix=int(round((x-xs[0])/.003)); iy=int(round((y-ys[0])/.003)); iz=int(round((z-zs[0])/.003))
            if 0<=ix<len(xs) and 0<=iy<len(ys) and 0<=iz<len(zs) and values[ix,iy,iz]<0:
                overlap+=1
    from scipy.spatial import cKDTree
    # v2 begins with three 191-ring shafts and their separate grain seams.
    # This is sampled surface-vertex distance, not triangle intersection.
    old_shaft=np.asarray([v for v in base_v[:9696] if 1.88<=v[1]<=1.901])
    old_cage=np.asarray([v for v in base_v[9696:] if 1.897<=v[1]<=1.94])
    v2_nearest=float(np.min(cKDTree(old_cage).query(old_shaft)[0]))
    metrics=dict(obj=str(obj),new_shell_vertices=len(verts),new_shell_triangles=len(faces),
               new_shell_components=components,lower_shaft_vertices_inside_shell=overlap,
               v2_nearest_shaft_cage_vertex_distance_m=v2_nearest,
               total_vertices=len(out_v),total_triangles=len(out_f),
               min_y=float(np.min(verts[:,1])),max_y=float(np.max(verts[:,1])))
    (OUT/"neck_metrics.json").write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(metrics)


if __name__=="__main__":
    build()
