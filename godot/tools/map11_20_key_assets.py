from PIL import Image
import numpy as np
from scipy import ndimage as ndi
from pathlib import Path
import json,hashlib
import argparse
args=argparse.ArgumentParser(description='MAP11-20 accepted MagicLight assets: chroma key, despill, silhouette cleanup and midtones')
args.add_argument('source',type=Path)
args.add_argument('--report',type=Path,required=True)
opts=args.parse_args()
src=opts.source
dst=Path('godot/assets/map/map11/props');dst.mkdir(parents=True,exist_ok=True)
report={}
for name in ['hell_skull_pyramid','hell_impaled_corpse','hell_spike_pit']:
 raw=(src/(name+'.png')).read_bytes()
 a=np.asarray(Image.open(src/(name+'.png')).convert('RGB'),dtype=float)/255
 chrom=a[:,:,1]-np.maximum(a[:,:,0],a[:,:,2])
 dist=np.linalg.norm(a-np.array([0,1,0]),axis=2)
 alpha=np.clip((.095-chrom)/.065,0,1)*np.clip((dist-.35)/.25,0,1)
 labels,n=ndi.label(alpha>.5);sizes=np.bincount(labels.ravel());sizes[0]=0
 # Main connected silhouette only: all peripheral blood drops/points disappear.
 keep=ndi.binary_dilation(labels==sizes.argmax(),iterations=2)
 alpha*=keep
 a[:,:,1]=np.minimum(a[:,:,1],np.maximum(a[:,:,0],a[:,:,2])*.98)
 # Preserve cavities/creases while lifting the readable bone/cloth midtone.
 a=np.clip(a**.64*1.22,0,.94)
 if name=='hell_skull_pyramid':a*=np.array([1,.95,.85])
 if name=='hell_impaled_corpse':a=np.clip(a**.74*1.18,0,.96)
 rgba=np.dstack([a,alpha]);rgba[alpha<.002]=0
 yy,xx=np.where(alpha>.002);box=(max(0,int(xx.min())-4),max(0,int(yy.min())-4),min(a.shape[1],int(xx.max())+5),min(a.shape[0],int(yy.max())+5))
 im=Image.fromarray(np.uint8(rgba*255)).crop(box);im.thumbnail((1024,1024),Image.Resampling.LANCZOS);
 if name=='hell_skull_pyramid':
  pixels=np.array(im);hole=np.zeros(pixels.shape[:2],dtype=bool)
  hole[23:94,505:582]=pixels[23:94,505:582,:3].max(axis=2)<125
  pixels[hole]=0;im=Image.fromarray(pixels)
 im.save(dst/(name+'.png'))
 report[name]={'source_sha256':hashlib.sha256(raw).hexdigest(),'bbox':box,'size':im.size,'source_components':n,'retained_components':1}
# Regenerate patches from accepted source, preserving MAP11-19 mask/crop.
for name in ['patch_bloodpool_roots','patch_bone_pile','patch_cracked_flesh_slab']:
 a=np.asarray(Image.open(src/(name+'.png')).convert('RGB'),dtype=float)/255
 chrom=a[:,:,1]-np.maximum(a[:,:,0],a[:,:,2]);dist=np.linalg.norm(a-np.array([0,1,0]),axis=2)
 alpha=np.clip((.095-chrom)/.065,0,1)*np.clip((dist-.35)/.25,0,1)
 labels,n=ndi.label(alpha>.5);sizes=np.bincount(labels.ravel());sizes[0]=0;main=labels==sizes.argmax()
 alpha*=ndi.binary_dilation(main,iterations=3)
 feather=np.clip(ndi.distance_transform_edt(main)/70,0,1);alpha*=feather*feather*(3-2*feather)
 a[:,:,1]=np.minimum(a[:,:,1],np.maximum(a[:,:,0],a[:,:,2])*.98)
 if name=='patch_bone_pile':a=np.clip(a**.48*1.42,0,.94)*np.array([1,.90,.68])
 elif name=='patch_bloodpool_roots':a=np.clip(a**.57*1.5,0,.94)*np.array([1,.76,.62])
 else:a=np.clip(a**.64*1.4,0,.94)*np.array([1,.84,.72])
 rgba=np.dstack((a,alpha));rgba[alpha<.002]=0
 yy,xx=np.where(alpha>.002);box=(max(0,int(xx.min())-4),max(0,int(yy.min())-4),min(a.shape[1],int(xx.max())+5),min(a.shape[0],int(yy.max())+5))
 im=Image.fromarray(np.uint8(rgba*255)).crop(box);im.thumbnail((1024,1024),Image.Resampling.LANCZOS);im.save(Path('godot/assets/map/map11/patches')/(name+'.png'))
 report[name]={'bbox':box,'size':im.size}
opts.report.write_text(json.dumps(report,indent=2))
