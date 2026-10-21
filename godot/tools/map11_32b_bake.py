"""Native-size, unrotated source patch composition. No reflection or synthesis.
Run after map11_32_split.py, supplying the approved 2000x1125 source PNG.
"""
from pathlib import Path
import sys,json,hashlib
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1];out=root/'assets/maps/map11/target32'
a=np.asarray(Image.open(sys.argv[1]).convert('RGB'))
old=np.asarray(Image.open(out/'floor.png').convert('RGBA'))
# Wide overlapping patches sample distinct ground portions. No mirror/rotation.
y,x=np.mgrid[-2000:1725,-600:2600].astype(np.float32)
acc=np.zeros((*x.shape,3),np.float32);weights=np.zeros(x.shape,np.float32)
rng=np.random.default_rng(32021)
patches=[]
# Dense jittered overlaps from multiple ground depths, not a tiled mirrored crop.
for iy,cy in enumerate(range(-2200,2000,190)):
 for ix,cx in enumerate(range(-850,2900,190)):
  dx=int(cx+rng.integers(-45,45));dy=int(cy+rng.integers(-45,45))
  w0=int(rng.integers(360,510));h0=int(rng.integers(330,480))
  sx=int(rng.integers(735,1250-w0));sy=int(rng.integers(260,1100-h0))
  x0=max(0,int(dx-w0/2+600));x1=min(3200,int(dx+w0/2+601))
  y0=max(0,int(dy-h0/2+2000));y1=min(3725,int(dy+h0/2+2001))
  if x1<=x0 or y1<=y0:continue
  xx=x[y0:y1,x0:x1];yy=y[y0:y1,x0:x1]
  u=xx-dx+w0/2;v=yy-dy+h0/2
  radius=np.maximum(np.abs(u-w0/2)/(w0/2),np.abs(v-h0/2)/(h0/2))
  edge=1-radius+.06*np.sin(xx/57+iy)*np.sin(yy/83+ix)
  w=np.clip(edge/.32,0,1);w=w*w*(3-2*w)
  px=np.clip(sx+u,0,1999).astype(int);py=np.clip(sy+v,0,1124).astype(int)
  acc[y0:y1,x0:x1]+=a[py,px]*w[...,None];weights[y0:y1,x0:x1]+=w
  patches.append({'source':[sx,sy,w0,h0],'center':[dx,dy]})
assert weights.min()>0
base=acc/weights[...,None]
# Fixed look: muted grey/violet ground, blood and moss retain source luminance.
lum=base.mean(2);red=np.clip((base[:,:,0]-base[:,:,1]-2)/22,0,1)
green=np.clip((base[:,:,1]-base[:,:,0]+2)/18,0,1)*(1-red)
palette=np.array([85,81,94],np.float32)[None,None,:]*(1-red[...,None]) + np.array([53,31,41])[None,None,:]*red[...,None]
palette=palette*(1-green[...,None]*.28)+np.array([69,75,64])[None,None,:]*green[...,None]*.28
base=base*.78+(palette+(lum-70)[...,None]*.50)*.22
# Preserve the accepted START/source pixels and original static root AO.
ox=np.clip(x+600,0,3199).astype(int);oy=np.clip(y+600,0,2324).astype(int)
inside=np.minimum.reduce([x,1999-x,y,1124-y]);keep=np.clip(inside/(110+25*np.sin(x/119)),0,1);keep=keep*keep*(3-2*keep)
base=base*(1-keep[...,None])+old[oy,ox,:3]*keep[...,None]
# North transition crosses the former black void; wide irregular falloff.
d=np.maximum.reduce([(-x)/600,(x-1999)/600,(-y-850)/1150,(y-1124)/600,np.zeros_like(x)])
f=np.clip(1-d,0,1)**(1.6+.55*np.sin(x/197)*np.sin(y/183));f=f*f*(3-2*f)
rgba=np.dstack([np.clip(base,0,255).astype('uint8'),(f*255).astype('uint8')]);Image.fromarray(rgba).save(out/'floor_32b.png')
b=base;vein=np.clip((b[:,:,0]-b[:,:,1]-3)/24,0,1)*np.clip((100-b.max(2))/65,0,1)
Image.fromarray((vein*f*255).astype('uint8')).save(out/'veins_32b.png')
# Trim disconnected parallax silhouettes independently (no transparent full frame).
fg=Image.open(out/'foreground.png').convert('RGBA');fragments=[]
for i,box in enumerate([(0,0,350,1125),(350,0,2000,1125)]):
 im=fg.crop(box);bbox=im.getbbox();im=im.crop(bbox);im.save(out/f'foreground_32b_{i}.png')
 fragments.append({'file':f'foreground_32b_{i}.png','source_box':[box[0]+bbox[0],box[1]+bbox[1],box[0]+bbox[2],box[1]+bbox[3]]})
manifest={'source_sha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'floor_box':[-600,-2000,2600,1725],'patches':patches,'reflection':False,'rotation':False,'source_scale':1,'foreground':fragments,'palette':['55515e','351f29','454b40','787482'],'static_bakes':['floor_32b.png'],'runtime':['vein pulse','white tree light','low mist','parallax foreground']}
(out/'bake_32b.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('baked floor/root/AO/seam, native-size asymmetric patches, trimmed foreground')
