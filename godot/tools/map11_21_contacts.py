"""Generate setup-only preloads, opaque hulls and foot-attached AO from baked PNGs."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull
root=Path(__file__).resolve().parents[1];folder=root/'assets/map/map11/props/tour_25d'
shapes=[];masks=[];metadata=[];assets={}
for p in sorted(folder.glob('*/*_diffuse.png')):
 im=Image.open(p).convert('RGBA');a=np.asarray(im)[:,:,3]/255;h,w=a.shape;solid=a>=32/255;yy,xx=np.where(solid);y,x=np.where(solid&~ndi.binary_erosion(solid));pts=np.column_stack((x,y));pts=pts[ConvexHull(pts).vertices];corners=np.concatenate([pts+v for v in [[0,0],[1,0],[1,1],[0,1]]]);hull=corners[ConvexHull(corners).vertices]
 key='res://'+p.relative_to(root).as_posix();shapes.append(' '+json.dumps(key)+': ['+','.join('Vector2(%d,%d)'%tuple(v) for v in hull)+'],\n')
 pad=max(4,round(h*.02));y0=round(h*.78);spread=ndi.maximum_filter(np.pad(a,((pad,pad),(pad,pad))),size=max(3,round(h*.008))|1);halo=ndi.gaussian_filter(spread,sigma=max(1,h*.005));fade=np.clip((np.arange(h+2*pad)-pad-h*.77)/(h*.13),0,1);fade=fade*fade*(3-2*fade);alpha=np.clip(halo*fade[:,None],0,1)[y0:,:]
 rgba=np.zeros((*alpha.shape,4),dtype=np.uint8);rgba[:,:,3]=np.uint8(alpha*255);mask=Image.fromarray(rgba);mask.thumbnail((512,256),Image.Resampling.LANCZOS);mp=p.with_name(p.name.replace('_diffuse','_contact'));mask.save(mp)
 masks.append(' '+json.dumps(key)+': {"texture":preload("res://'+mp.relative_to(root).as_posix()+'"),"offset":Vector2(%d,%d),"size":Vector2(%d,%d)},\n'%(-pad,y0-pad,w+2*pad,h+2*pad-y0))
 assets.setdefault(p.parent.name,[]).append([key,key.replace('_diffuse','_normal')]);metadata.append({'key':key,'size':[w,h],'bbox':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)],'foot':[(int(xx.min())+int(xx.max()+1))/2,int(yy.max()+1)],'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for file,rows in [('ground_contact_data.gd',shapes),('ground_contact_masks.gd',masks)]:
 p=root/'scripts/maps/map11'/file;s=''.join(line for line in p.read_text().splitlines(True) if '/tour_25d/' not in line);i=s.rfind('}');p.write_text(s[:i]+''.join(rows)+s[i:])
s='extends RefCounted\n## Setup-only baked PNGs; no GLB or tick-time resource lookups.\nconst ASSETS={\n'
for name,pairs in assets.items():s+=' '+json.dumps(name)+': [\n'+''.join('  [preload('+json.dumps(d)+'),preload('+json.dumps(n)+')],\n' for d,n in pairs)+' ],\n'
(root/'scripts/maps/map11/tour_textures.gd').write_text(s+'}\n');(folder/'feet.json').write_text(json.dumps(metadata,indent=2))
