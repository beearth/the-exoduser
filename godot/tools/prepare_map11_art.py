"""Deterministic MAP11-16 approved Seedream input processing (Pillow/numpy)."""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
p=argparse.ArgumentParser(); p.add_argument('source',type=Path); p.add_argument('destination',type=Path); p.add_argument('receipt',type=Path); a=p.parse_args()
a.destination.mkdir(parents=True,exist_ok=True)
receipt={}
for name in ['flesh_tree_v1.png','floor_fissure_v2.png']:
 receipt[name]={'sha256':hashlib.sha256((a.source/name).read_bytes()).hexdigest()}
im=Image.open(a.source/'flesh_tree_v1.png').convert('RGB'); rgb=np.asarray(im,dtype=np.float32)/255
# Distance from the measured green chromaticity tolerates background brightness variation.
key=np.median(np.concatenate([rgb[:30].reshape(-1,3),rgb[-30:].reshape(-1,3)]),axis=0); key/=np.linalg.norm(key)
unit=rgb/np.maximum(np.linalg.norm(rgb,axis=2,keepdims=True),.001)
distance=np.linalg.norm(unit-key,axis=2)
t=np.clip((distance-.16)/.24,0,1); alpha=t*t*(3-2*t)
# Unmix green contamination in the transition, then cap residual green excess.
background=np.array([.26,.55,.23]); rgb=np.clip((rgb-background*(1-alpha[...,None]))/np.maximum(alpha[...,None],.08),0,1)
rgb[:,:,1]=np.minimum(rgb[:,:,1],np.maximum(rgb[:,:,0],rgb[:,:,2]))
rgba=np.dstack([rgb,alpha]); out=Image.fromarray(np.uint8(np.clip(rgba,0,1)*255),'RGBA'); box=out.getbbox(); out=out.crop(box)
out.thumbnail((1024,1536),Image.Resampling.LANCZOS); out.save(a.destination/'flesh_tree_seedream_rgba.png')
receipt['tree']={'key_chromaticity':key.tolist(),'distance_transition':[.16,.40],'crop':box,'output':out.size,'alpha':'straight RGBA; distance smoothstep, green unmix and cap'}
floor=Image.open(a.source/'floor_fissure_v2.png').convert('RGB'); data=np.asarray(floor,dtype=np.float32)
# Blend half-period offset only in 192px seam shoulders; the center retains source detail.
for axis in [1,0]:
 n=data.shape[axis]; pos=np.arange(n); d=np.minimum(pos,n-1-pos); t=np.clip(d/192,0,1); w=t*t*(3-2*t)
 w=w.reshape((1,n,1) if axis==1 else (n,1,1)); data=data*w+np.roll(data,n//2,axis=axis)*(1-w)
# Equal edge pairs make repeat sampling continuous after resampling.
out=Image.fromarray(np.uint8(np.clip(data,0,255))).resize((1024,1024),Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(.45))
data=np.array(out); data[:,0]=data[:,-1]=((data[:,0].astype(float)+data[:,-1])/2).astype('uint8'); data[0]=data[-1]=((data[0].astype(float)+data[-1])/2).astype('uint8')
Image.fromarray(data).save(a.destination/'floor_fissure_seedream_tile.png')
receipt['floor']={'output':[1024,1024],'offset_blend_shoulder_px':192,'half_period_px':floor.width//2,'post_resize_blur_px':.45,'equal_opposite_edges':True}
a.receipt.write_text(json.dumps(receipt,indent=2))
