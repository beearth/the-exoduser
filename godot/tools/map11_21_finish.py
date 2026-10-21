"""MAP11-21 offline grade: concept palette, lifted pedestal, restrained detail."""
from pathlib import Path
import sys,json,hashlib
import numpy as np
from PIL import Image,ImageFilter
from scipy.ndimage import shift,gaussian_filter
raw,dst,concept=map(Path,sys.argv[1:4]);dst.mkdir(parents=True,exist_ok=True)
prefix=raw.name
ref=np.asarray(Image.open(concept).convert('RGB')).astype(float)/255
# Reject green key and nearly black background before computing concept chroma.
r,g,b=ref.transpose(2,0,1); valid=(np.maximum.reduce([r,g,b])>.12)&~((g>r*1.35)&(g>b*1.25))
median=np.median(ref[valid],axis=0); l=float((median*np.array([.2126,.7152,.0722])).sum());gain=np.clip(median/max(l,.01),.78,1.18)
for i in range(3):
 im=Image.open(raw/f'{prefix}_{i}_diffuse.png').convert('RGBA');a=np.asarray(im).astype(float)/255
 z=np.asarray(Image.open(raw/f'{prefix}_{i}_depth.png').convert('RGB')).astype(float)[:,:,0]/255
 mask=a[:,:,3]>.5;occ=np.zeros_like(z)
 for radius in (2,5,10):
  for dy,dx in ((0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1),(-1,0),(-1,1)):
   nz=shift(z,(dy*radius,dx*radius),order=0,mode='nearest');nm=shift(mask,(dy*radius,dx*radius),order=0,mode='constant');delta=nz-z
   occ+=np.clip((delta-.008)/.06,0,1)*np.clip(1-delta/.22,0,1)*nm/24
 rgb=a[:,:,:3]*(1-.35*gaussian_filter(occ,.65))[:,:,None]*1.85*gain
 # Lift only dark diffuse texels increasingly toward the foot. Keep silhouette alpha.
 foot=np.clip((np.arange(a.shape[0])/a.shape[0]-.65)/.35,0,1)[:,None]
 lum=(rgb*np.array([.2126,.7152,.0722])).sum(axis=2);lift=np.clip((.15-lum)/.15,0,1)*foot*.11
 rgb+=lift[:,:,None]*np.array([1.0,.87,.78])
 lum=(rgb*np.array([.2126,.7152,.0722])).sum(axis=2);rgb=lum[:,:,None]+1.06*(rgb-lum[:,:,None]);rgb=(rgb-.25)*1.10+.25
 if prefix=="tour_blood_basin":
  red=(rgb[:,:,0]>rgb[:,:,1]*1.8)&(rgb[:,:,0]>rgb[:,:,2]*1.6)
  rgb[red]=rgb[red]*np.array([.42,.75,.85])+np.array([.025,.008,.008])
 a[:,:,:3]=np.clip(rgb,0,.94)
 out=Image.fromarray(np.uint8(np.clip(a,0,1)*255)).filter(ImageFilter.UnsharpMask(radius=.7,percent=25,threshold=4));out=out.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(.28));out.putalpha(im.getchannel('A'));out.save(dst/f'{prefix}_{i}_diffuse.png')
 n=np.asarray(Image.open(raw/f'{prefix}_{i}_normal.png').convert('RGBA')).astype(float)/255;v=n[:,:,:3]*2-1;v[:,:,:2]*=1.35;v/=np.maximum(np.linalg.norm(v,axis=2)[:,:,None],1e-6);n[:,:,:3]=v*.5+.5
 Image.fromarray(np.uint8(np.clip(n,0,1)*255)).save(dst/f'{prefix}_{i}_normal.png')
(dst/'render.json').write_bytes((raw/'render.json').read_bytes())
(dst/'look.json').write_text(json.dumps({'concept':concept.name,'concept_sha256':hashlib.sha256(concept.read_bytes()).hexdigest(),'concept_median':median.tolist(),'rgb_gain':gain.tolist(),'blood_red_gain':[.42,.75,.85] if prefix=='tour_blood_basin' else None,'blood_red_bias':[.025,.008,.008] if prefix=='tour_blood_basin' else None,'ao_strength':.35,'exposure':1.85,'foot_luma_threshold':.15,'foot_lift':.11,'foot_start':.65,'saturation':1.06,'contrast':1.10,'unsharp':[.7,25,4],'normal_xy_gain':1.35,'denoise_median':3,'denoise_gaussian':.28},indent=2))
