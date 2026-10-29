"""Read-only local OBJ review raster for matching v2 and S3-neck study views.

Camera and key-light vectors mirror the Unity separation study. This is a
software shape review, not Unity, PBR, an arena frame, or a product verdict.
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image
from numba import njit

ROOT=Path(__file__).resolve().parents[2]
STUDIES=ROOT/"Assets/Exoduser/Remodel/Boss/DarkDruid/Studies"
SOURCE=ROOT/"Assets/Exoduser/Remodel/Boss/DarkDruid/Source/Druid_BaseColor.jpg"
OTHER=Path("I:/EXODUSER-Storage/boss/staff-neck-sdf-20261029/dark_druid_staff_neck_sdf.obj")
OUT=Path("I:/EXODUSER-Storage/boss/staff-neck-sdf-20261029/compare")
WIDTH,HEIGHT=1600,900
BASE={
 "charred_root":(243,233,215),"raised_bark":(233,216,190),
 "recess":(38,34,27),"leather":(75,42,31),"bone":(182,165,126),
 "orb":(51,58,22),"orb_vein":(39,42,18),
}


def load_obj(path):
    verts=[]; uv=[]; faces=[]; mats=[]; current=""
    for line in path.open(encoding="ascii"):
        if line.startswith("v "): verts.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("vt "): uv.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("usemtl "): current=line.split()[1]
        elif line.startswith("f "):
            tri=[q.split("/") for q in line.split()[1:]]
            faces.append(tuple(int(q[0])-1 for q in tri))
            mats.append(current)
    return np.asarray(verts,np.float32),np.asarray(uv,np.float32),np.asarray(faces,np.int32),mats


@njit
def raster(xy,z,faces,colors):
    rgb=np.empty((HEIGHT,WIDTH,3),np.uint8)
    rgb[:]=18
    depth=np.full((HEIGHT,WIDTH),-1e10,np.float32)
    for i in range(len(faces)):
        a,b,c=faces[i]
        x0,y0=xy[a]; x1,y1=xy[b]; x2,y2=xy[c]
        det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0)
        if abs(det)<.015: continue
        xa=max(0,int(min(x0,x1,x2))); xb=min(WIDTH-1,int(max(x0,x1,x2))+1)
        ya=max(0,int(min(y0,y1,y2))); yb=min(HEIGHT-1,int(max(y0,y1,y2))+1)
        for y in range(ya,yb+1):
            for x in range(xa,xb+1):
                w1=((x-x0)*(y2-y0)-(x2-x0)*(y-y0))/det
                w2=((x1-x0)*(y-y0)-(x-x0)*(y1-y0))/det
                w0=1-w1-w2
                if w0>=0 and w1>=0 and w2>=0:
                    d=w0*z[a]+w1*z[b]+w2*z[c]
                    if d>depth[y,x]:
                        depth[y,x]=d
                        rgb[y,x]=colors[i]
    return rgb


def view(name, eye, target, ortho, verts, uv, faces, mats, atlas):
    eye=np.asarray(eye,float); target=np.asarray(target,float)
    toward=eye-target; toward/=np.linalg.norm(toward)
    right=np.cross((0,1,0),toward); right/=np.linalg.norm(right)
    up=np.cross(toward,right)
    offset=verts-target
    scale=HEIGHT/(2*ortho)
    xy=np.empty((len(verts),2),np.float32)
    xy[:,0]=WIDTH/2+offset@right*scale
    xy[:,1]=HEIGHT/2-offset@up*scale
    depth=(offset@toward).astype(np.float32)
    tris=verts[faces]
    normal=np.cross(tris[:,1]-tris[:,0],tris[:,2]-tris[:,0])
    normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-10)
    key=np.array([-.37,.74,.55]); key/=np.linalg.norm(key)
    light=np.clip(.28+.72*np.abs(normal@key),.2,1.)
    colors=np.empty((len(faces),3),np.uint8)
    w,h=atlas.shape[1],atlas.shape[0]
    for i,mat in enumerate(mats):
        base=np.array(BASE[mat],float)
        if mat in ("charred_root","raised_bark"):
            u,v=np.mean(uv[faces[i]],axis=0)
            px=int((u%1)*w)%w; py=int((1-v%1)*h)%h
            base=base*atlas[py,px]/255.
        c=base*light[i]
        if mat=="orb": c+=np.array([130,138,45])
        colors[i]=np.clip(c,0,255).astype(np.uint8)
    image=Image.fromarray(raster(xy,depth,faces,colors))
    image.save(OUT/name)
    print(name,len(verts),len(faces))


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    atlas=np.asarray(Image.open(SOURCE).convert("RGB"))
    cameras=(
        ("front",(0,1.15,5),(0,1.15,0),1.46),
        ("game55",(2.3,4.1,3.3),(0,1.15,0),1.46),
        ("neck",(.03,2.43,3),(.03,2.08,0),.34),
        ("neck55",(2.33,5.03,3.3),(.03,2.08,0),.34),
        ("neck_side",(3.03,2.43,0),(.03,2.08,0),.34),
    )
    for label,path in (("v2",STUDIES/"dark_druid_staff_v2.obj"),("neck_sdf",OTHER)):
        geometry=load_obj(path)
        for name,eye,target,size in cameras:
            view(label+"_"+name+".png",eye,target,size,*geometry,atlas)


if __name__=="__main__": main()
