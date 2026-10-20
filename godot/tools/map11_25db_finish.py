"""Offline depth AO, warm bone grade and stronger matte normals; no new art."""
from pathlib import Path
import sys,json,shutil
import numpy as np
from PIL import Image,ImageFilter
from scipy.ndimage import shift,gaussian_filter
raw=Path(sys.argv[1]); dst=Path(sys.argv[2]);dst.mkdir(parents=True,exist_ok=True)
for i in range(3):
 im=Image.open(raw/f'skull_{i}_diffuse.png').convert('RGBA'); a=np.asarray(im).astype(float)/255
 z=np.asarray(Image.open(raw/f'skull_{i}_depth.png').convert('RGB')).astype(float)[:,:,0]/255
 mask=a[:,:,3]>.5; occ=np.zeros_like(z)
 # Screen-space offline AO: nearer neighbouring surfaces obscure recesses.
 for r in (2,5,10):
  for dy,dx in ((0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1),(-1,0),(-1,1)):
   nz=shift(z,(dy*r,dx*r),order=0,mode='nearest'); nm=shift(mask,(dy*r,dx*r),order=0,mode='constant')
   delta=nz-z
   occ+=np.clip((delta-.008)/.06,0,1)*np.clip(1-delta/.22,0,1)*nm/24
 ao=1-.55*gaussian_filter(occ,.65)
 rgb=a[:,:,:3]*ao[:,:,None]*1.85*np.array([1.10,1.025,.86])
 # Luma saturation 0.92, contrast 1.12 around .25; bounded highlights.
 l=(rgb*np.array([.2126,.7152,.0722])).sum(axis=2);rgb=l[:,:,None]+.92*(rgb-l[:,:,None]);rgb=(rgb-.25)*1.12+.25
 a[:,:,:3]=np.clip(rgb,0,.94)
 finished=Image.fromarray(np.uint8(np.clip(a,0,1)*255))
 finished=finished.filter(ImageFilter.UnsharpMask(radius=1.1,percent=85,threshold=3));finished.putalpha(im.getchannel('A'))
 finished.save(dst/f'skull_{i}_diffuse.png')
 normal=Image.open(raw/f'skull_{i}_normal.png').convert('RGBA'); n=np.asarray(normal).astype(float)/255;v=n[:,:,:3]*2-1;v[:,:,:2]*=1.65;v/=np.maximum(np.linalg.norm(v,axis=2)[:,:,None],1e-6);n[:,:,:3]=v*.5+.5
 Image.fromarray(np.uint8(np.clip(n,0,1)*255)).save(dst/f'skull_{i}_normal.png')
shutil.copyfile(raw/'render.json',dst/'render.json')
(dst/'look.json').write_text(json.dumps({'key_view':[-.55,.72,.8],'ambient':.48,'key':.78,'rim_rgb':[.10,.075,.045],'ao_radii_output_px':[2,5,10],'ao_bias':.008,'ao_range':.22,'ao_strength':.55,'exposure':1.85,'rgb_gain':[1.10,1.025,.86],'saturation':.92,'contrast':1.12,'pivot':.25,'ceiling':.94,'unsharp':[1.1,85,3],'normal_xy_gain':1.65,'pedestal_discard':False},indent=2))
