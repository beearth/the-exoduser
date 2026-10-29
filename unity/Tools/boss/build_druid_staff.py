"""Dark Druid left-hand staff: independent, zero-credit geometry study.

Source dimensions are DARK_DRUID_DESIGN_LOCK.md section 3. Y up, metres.
Exports editable OBJ/MTL and two software-rendered review frames. No body adoption.
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw
from numba import njit

OUT = Path(__file__).resolve().parent
V, F, M = [], [], []
MAT = {
    "charred_root": ((69, 57, 43), "Kd 0.2706 0.2235 0.1686\nNs 24"),
    "raised_bark": ((117, 91, 63), "Kd 0.4588 0.3569 0.2471\nNs 18"),
    "recess": ((38, 34, 27), "Kd 0.1490 0.1333 0.1059\nNs 8"),
    "leather": ((75, 42, 31), "Kd 0.2941 0.1647 0.1216\nNs 20"),
    "bone": ((182, 165, 126), "Kd 0.7137 0.6471 0.4941\nNs 36"),
    "orb": ((71, 76, 37), "Kd 0.2784 0.2980 0.1451\nKe 0.6196 0.6588 0.2275\nNs 64"),
}
KEYS = list(MAT)


def vertex(p):
    V.append(tuple(float(q) for q in p))
    return len(V)


def face(ids, mat):
    F.append(tuple(ids))
    M.append(KEYS.index(mat))


def tube(points, radii, material, sides=16, ridges=0.0, seed=0):
    """Parallel transport-ish local frame: tangent cross preferred forward axis."""
    points = np.asarray(points, dtype=float)
    rings = []
    for i, p in enumerate(points):
        tangent = points[min(i + 1, len(points) - 1)] - points[max(i - 1, 0)]
        tangent /= np.linalg.norm(tangent)
        basis = np.array([0.0, 0.0, 1.0])
        if abs(np.dot(tangent, basis)) > .90:
            basis = np.array([1.0, 0.0, 0.0])
        u = np.cross(tangent, basis); u /= np.linalg.norm(u)
        w = np.cross(tangent, u)
        ring = []
        for j in range(sides):
            a = 2 * math.pi * j / sides
            grain = 1 + ridges * (.46 * math.sin(7*a + .08*i + seed) +
                                  .28 * math.sin(13*a - .14*i + seed*.7) +
                                  .18 * math.sin(19*a + .41*i))
            ring.append(vertex(p + radii[i] * grain * (math.cos(a)*u + math.sin(a)*w)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for j in range(sides):
            k = (j + 1) % sides
            face((rings[i][j], rings[i][k], rings[i+1][k]), material)
            face((rings[i][j], rings[i+1][k], rings[i+1][j]), material)


def sphere(center, radius, material, segments=24, rows=12, squash=(1, 1, 1)):
    cx, cy, cz = center; rx, ry, rz = np.array(squash) * radius
    rings = []
    for i in range(1, rows):
        lat = math.pi*i/rows
        ring = []
        for j in range(segments):
            lon = 2*math.pi*j/segments
            ring.append(vertex((cx+rx*math.sin(lat)*math.cos(lon),
                                cy+ry*math.cos(lat),
                                cz+rz*math.sin(lat)*math.sin(lon))))
        rings.append(ring)
    top = vertex((cx, cy+ry, cz)); bottom = vertex((cx, cy-ry, cz))
    for j in range(segments):
        k=(j+1)%segments
        face((top,rings[0][j],rings[0][k]),material)
        face((bottom,rings[-1][k],rings[-1][j]),material)
    for a,b in zip(rings[:-1],rings[1:]):
        for j in range(segments):
            k=(j+1)%segments
            face((a[j],b[j],b[k]),material)
            face((a[j],b[k],a[k]),material)


# 2.30 m staff, crooked 4 cm root shaft. The bark is sculpted into the tube,
# not represented by disconnected cylinders. Its lower end transitions to bone.
shaft = []
for y in np.linspace(.07, 1.91, 233):
    x = .017*math.sin(2.9*y) + .009*math.sin(12.4*y) + .006*y*y
    z = .011*math.sin(4.1*y + .7) + .007*math.sin(9.3*y)
    shaft.append((x,y,z))
tube(shaft,[.019+ .0027*math.sin(7*y)+.0018*y for _,y,_ in shaft],
     "charred_root",24,.19,2)

# Raised, partially broken bark cords preserve a readable wood grain in closeup.
for strand in range(7):
    pts=[]; rad=[]
    for y in np.linspace(.13,1.83,160):
        if .72 < y < .98: continue
        a = strand*2*math.pi/7 + .23*y + .11*math.sin(8*y+strand)
        x = .017*math.sin(2.9*y)+.009*math.sin(12.4*y)+.006*y*y
        z = .011*math.sin(4.1*y+.7)+.007*math.sin(9.3*y)
        pts.append((x+.0208*math.cos(a),y,z+.0208*math.sin(a)))
        rad.append(.0018 + .0009*math.sin(10*y+strand)**2)
    # Two segments across the leather interruption.
    cut = next(i for i,p in enumerate(pts) if p[1]>.98)
    tube(pts[:cut],rad[:cut],"raised_bark",6)
    tube(pts[cut:],rad[cut:],"raised_bark",6)

# The 20 cm hand wrap is centred at 0.85 m from the blunt end. Ribbon-like
# crossing leather occupies one continuous grip, with a few visible seams.
for strand in (0,1):
    pts=[]; radii=[]
    for t in np.linspace(0,1,270):
        y=.75+.20*t
        a=math.pi*strand+10*math.pi*t
        cx=.017*math.sin(2.9*y)+.009*math.sin(12.4*y)+.006*y*y
        cz=.011*math.sin(4.1*y+.7)+.007*math.sin(9.3*y)
        pts.append((cx+.0225*math.cos(a),y,cz+.0225*math.sin(a)))
        radii.append(.0042)
    tube(pts,radii,"leather",8)
for y in (.75,.95):
    pts=[]
    for a in np.linspace(0,2*math.pi,65):
        pts.append((.017*math.sin(2.9*y)+.009*math.sin(12.4*y)+.006*y*y+.023*math.cos(a),y,
                    .011*math.sin(4.1*y+.7)+.007*math.sin(9.3*y)+.023*math.sin(a)))
    tube(pts,[.005]*len(pts),"recess",8)

# Bird skull: 8 cm above the grip, facing forward. Long hooked beak and paired
# dark orbital sockets give it a bird reading at the 55-degree inspection angle.
bird_y=1.035
sphere((.030,bird_y,.033),.034,"bone",20,10,(.75,1.05,.75))
tube([(.035,bird_y-.010,.055),(.037,bird_y-.023,.084),(.036,bird_y-.045,.114),
      (.031,bird_y-.054,.120)], [.020,.015,.007,.001],"bone",12)
for side in (-1,1):
    sphere((.030+side*.022,bird_y+.006,.058),.008,"recess",12,6,(.55,1,.45))

# Blunt bone butt and two small fractured spurs.
tube([(shaft[0][0],.095,shaft[0][2]),(.010,.045,.004),(.010,.003,.004)],
     [.024,.030,.021],"bone",18,.09)
for side in (-1,1):
    tube([(.010+side*.016,.060,.004),(.010+side*.029,.035,.012),
          (.010+side*.032,.018,.016)],[.008,.006,.001],"bone",8)

# 40 cm five-root claw cage. The orb is deliberately visible through open gaps.
# Root bases emerge from the shaft at 1.88 m, spread around a 16 cm orb and
# converge into sharp, offset hook tips below the 2.30 m overall length.
orb_center=np.array([.036,2.065,.005])
sphere(orb_center,.080,"orb",32,18,(1,1,.94))
for root in range(6):
    a=2*math.pi*root/6 + .13
    pts=[]; rs=[]
    for t in np.linspace(0,1,65):
        y=1.900+(.400-.020*(root%3))*t
        reach=.020+.090*math.sin(math.pi*min(1,t*1.05))**.8
        twist=a+.23*t + .14*math.sin(3.5*t+root)
        base=np.array([.036+reach*math.cos(twist),y,.005+reach*math.sin(twist)])
        pts.append(base)
        rs.append(.017*(1-t)**.92+.0018)
    tube(pts,rs,"charred_root",12,.13,root)
    # One barbed side branch on alternating cage claws, not decorative clutter.
    if root%2==0:
        i=37; p=pts[i]
        tube([p,(p[0]+.023*math.cos(a+.8),p[1]+.035,p[2]+.023*math.sin(a+.8)),
                 (p[0]+.030*math.cos(a+.8),p[1]+.058,p[2]+.030*math.sin(a+.8))],
             [.008,.005,.001],"raised_bark",8)


def save_obj():
    with (OUT/'dark_druid_staff_v1.mtl').open('w',encoding='ascii',newline='\n') as f:
        for index,(name,(_,props)) in enumerate(MAT.items()):
            f.write(f'newmtl {name}\nKa 0.08 0.08 0.08\n{props}\nillum 2\n')
            if index < len(MAT)-1: f.write('\n')
    with (OUT/'dark_druid_staff_v1.obj').open('w',encoding='ascii',newline='\n') as f:
        f.write('# EXODUSER staff candidate; Y-up metres\nmtllib dark_druid_staff_v1.mtl\n')
        for v in V: f.write('v %.6f %.6f %.6f\n'%v)
        last=-1
        for tri,mat in zip(F,M):
            if mat!=last: f.write('usemtl '+KEYS[mat]+'\n'); last=mat
            f.write('f %d %d %d\n'%tri)


@njit
def raster(v2, depths, faces, colors, width, height):
    image=np.empty((height,width,3),dtype=np.uint8)
    image[:,:,:]=26
    zbuf=np.full((height,width),-1e10,dtype=np.float32)
    for i in range(faces.shape[0]):
        a,b,c=faces[i,0]-1,faces[i,1]-1,faces[i,2]-1
        x0,y0=v2[a,0],v2[a,1]; x1,y1=v2[b,0],v2[b,1]; x2,y2=v2[c,0],v2[c,1]
        det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0)
        if abs(det)<.01: continue
        xa=max(0,int(min(x0,x1,x2))); xb=min(width-1,int(max(x0,x1,x2))+1)
        ya=max(0,int(min(y0,y1,y2))); yb=min(height-1,int(max(y0,y1,y2))+1)
        for y in range(ya,yb+1):
            for x in range(xa,xb+1):
                w1=((x-x0)*(y2-y0)-(x2-x0)*(y-y0))/det
                w2=((x1-x0)*(y-y0)-(x-x0)*(y1-y0))/det
                w0=1-w1-w2
                if w0>=0 and w1>=0 and w2>=0:
                    z=w0*depths[a]+w1*depths[b]+w2*depths[c]
                    if z>zbuf[y,x]:
                        zbuf[y,x]=z
                        image[y,x,0]=colors[i,0]
                        image[y,x,1]=colors[i,1]
                        image[y,x,2]=colors[i,2]
    return image


def render(name, width, height, yaw, pitch, zoom, center_y):
    verts=np.asarray(V,dtype=np.float32); faces=np.asarray(F,dtype=np.int32)
    # Camera directly faces the bird skull (+Z); orbit a little for 3D reading.
    yaw=math.radians(yaw); pitch=math.radians(pitch)
    right=np.array([math.cos(yaw),0,-math.sin(yaw)])
    up=np.array([math.sin(yaw)*math.sin(pitch),math.cos(pitch),math.cos(yaw)*math.sin(pitch)])
    forward=np.cross(right,up)
    v2=np.empty((len(verts),2),dtype=np.float32)
    v2[:,0]=width/2+(verts@right)*zoom
    v2[:,1]=height/2-(verts@up-center_y*math.cos(pitch))*zoom
    depths=verts@forward
    p=verts[faces-1]
    norms=np.cross(p[:,1]-p[:,0],p[:,2]-p[:,0]); norms/=np.maximum(np.linalg.norm(norms,axis=1)[:,None],1e-8)
    light=np.array([-.6,.8,1.1]); light/=np.linalg.norm(light)
    shade=np.clip(.43+.55*np.abs(norms@light),.22,1.0)
    colors=np.array([MAT[KEYS[i]][0] for i in M],dtype=np.float32)*shade[:,None]
    colors[np.asarray(M)==KEYS.index('orb')] += np.array([85,90,25])
    colors=np.clip(colors,0,255).astype(np.uint8)
    img=Image.fromarray(raster(v2,depths,faces,colors,width,height))
    d=ImageDraw.Draw(img)
    d.text((25,25),f'DARK DRUID STAFF  |  {name}  |  2.30m',fill=(195,188,162))
    d.text((25,height-40),'GEOMETRY STUDY / NO BODY OR RUNTIME ADOPTION',fill=(131,125,111))
    img.save(OUT/f'staff_{name}.png')


save_obj()
render('game55',1600,900,25,55,580,1.15)
render('front',1200,1600,0,3,620,1.15)
render('cage_detail',1200,1200,24,17,2600,2.06)
print(f'vertices={len(V)} faces={len(F)} bounds={np.min(V,axis=0)}..{np.max(V,axis=0)}')
