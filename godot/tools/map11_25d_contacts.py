"""Offline render alpha -> MAP11-20 hull and attached contact AO entries only."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull
root=Path(__file__).resolve().parents[1]
folder=root/'assets/map/map11/props/skull_25d'
shapes=[]; masks=[]; metadata=[]
for i in range(3):
 p=folder/f'skull_{i}_diffuse.png'; im=Image.open(p).convert('RGBA'); a=np.asarray(im)[:,:,3]/255.; h,w=a.shape
 solid=a>=32/255; yy,xx=np.where(solid); y,x=np.where(solid & ~ndi.binary_erosion(solid))
 pts=np.column_stack((x,y)); pts=pts[ConvexHull(pts).vertices]
 corners=np.concatenate([pts+v for v in [[0,0],[1,0],[1,1],[0,1]]]); hull=corners[ConvexHull(corners).vertices]
 key='res://'+p.relative_to(root).as_posix()
 shapes.append(' '+json.dumps(key)+': ['+','.join('Vector2(%d,%d)'%tuple(v) for v in hull)+'],\n')
 pad=max(4,round(h*.025)); y0=round(h*.72)
 spread=ndi.maximum_filter(np.pad(a,((pad,pad),(pad,pad))),size=max(3,round(h*.012))|1)
 halo=ndi.gaussian_filter(spread,sigma=max(1,h*.007))
 fade=np.clip((np.arange(h+2*pad)-pad-h*.68)/(h*.14),0,1); fade=fade*fade*(3-2*fade)
 alpha=np.clip(halo*fade[:,None],0,1)[y0:,:]
 rgba=np.zeros((*alpha.shape,4),dtype=np.uint8);rgba[:,:,3]=np.uint8(alpha*255)
 mask=Image.fromarray(rgba);mask.thumbnail((512,256),Image.Resampling.LANCZOS)
 mask_path=folder/f'skull_{i}_contact.png';mask.save(mask_path)
 masks.append(' '+json.dumps(key)+': {"texture":preload("res://'+mask_path.relative_to(root).as_posix()+'"),"offset":Vector2(%d,%d),"size":Vector2(%d,%d)},\n'%(-pad,y0-pad,w+2*pad,h+2*pad-y0))
 metadata.append({'variant':i,'size':[w,h],'bbox':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)],'foot':[(int(xx.min())+int(xx.max()+1))/2,int(yy.max()+1)],'alpha_threshold':32})
# Idempotently replace only this task's additions, preserve all original entries.
for filename,rows in [('ground_contact_data.gd',shapes),('ground_contact_masks.gd',masks)]:
 path=root/'scripts/maps/map11'/filename
 lines=[line for line in path.read_text().splitlines(True) if '/skull_25d/' not in line]
 text=''.join(lines); index=text.rfind('}')
 path.write_text(text[:index]+''.join(rows)+text[index:])
(folder/'feet.json').write_text(json.dumps(metadata,indent=2))
