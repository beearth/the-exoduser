from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull
import json
import argparse
args=argparse.ArgumentParser(description='Bake opaque-pixel contact hulls for MAP11 sprites; run from repository root')
args.add_argument('--report',type=Path,required=True)
opts=args.parse_args()
root=Path('godot')
paths=[root/'assets/map/props'/f for f in ['prop_altar.png','prop_corpsetree.png','prop_cocoon.png','bone_arch.png','prop_g_root.png']]
paths += [root/'assets/map/props'/('rotforest_tree_%02d.png'%i) for i in range(1,13)]
paths += list((root/'assets/map/map11/props').glob('*.png'))
entries={}
def shape(im):
 a=np.array(im.convert('RGBA'))[:,:,3]>=32
 yy,xx=np.where(a);edge=a & ~ndi.binary_erosion(a)
 y,x=np.where(edge);points=np.column_stack((x,y));h=points[ConvexHull(points).vertices]
 # Hull of opaque pixel SQUARES, rather than pixel centers.
 corners=np.concatenate([h+v for v in [[0,0],[1,0],[1,1],[0,1]]]);h=corners[ConvexHull(corners).vertices]
 return {'bbox':[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)],'hull':h.tolist()}
for p in paths:
 if not p.exists():continue
 entries['res://'+p.relative_to(root).as_posix()]=shape(Image.open(p))
p=root/'assets/map/ch1/collision/cage_gate.png'
for side in range(2):
 box=(60+side*55,75,115+side*55,268)
 entries['res://'+p.relative_to(root).as_posix()+'#'+str(side)]=shape(Image.open(p).crop(box))
s='extends RefCounted\n## Offline alpha>=32/255 opaque-pixel hulls. No runtime image readback.\nconst SHAPES={\n'
for key,row in entries.items():
 coords=','.join('Vector2(%d,%d)'%tuple(v) for v in row['hull'])
 s+=' '+json.dumps(key)+': ['+coords+'],\n'
s+='}\n';(root/'scripts/maps/map11/ground_contact_data.gd').write_text(s)
opts.report.write_text(json.dumps(entries,indent=2))
print('Baked opaque hulls:',len(entries))
