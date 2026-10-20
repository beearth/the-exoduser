from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
import json
import argparse
args=argparse.ArgumentParser(description='Bake attached contact AO from accepted MAP11 lower alpha silhouettes')
args.add_argument('--bounds',type=Path,required=True)
args.add_argument('--report',type=Path,required=True)
opts=args.parse_args()
root=Path('godot');out=root/'assets/map/map11/contact_masks';out.mkdir(exist_ok=True)
entries=json.loads(opts.bounds.read_text());report={}
for path,row in entries.items():
 if '#' in path:continue
 p=root/path.removeprefix('res://') if hasattr(path,'removeprefix') else root/path[6:]
 a=np.asarray(Image.open(p).convert('RGBA'),dtype=float)[:,:,3]/255
 h,w=a.shape;pad=max(4,round(h*.025));y0=round(h*.72)
 mask=np.pad(a,((pad,pad),(pad,pad)))
 # Ground contact follows the real lower silhouette, including root tips.
 spread=ndi.maximum_filter(mask,size=max(3,round(h*.012))|1)
 halo=ndi.gaussian_filter(spread,sigma=max(1,h*.007))
 yy=np.arange(h+2*pad)-pad;fade=np.clip((yy-h*.68)/(h*.14),0,1);fade=fade*fade*(3-2*fade)
 alpha=np.clip(halo*fade[:,None],0,1)[y0:,:]
 rgba=np.zeros((*alpha.shape,4),dtype=np.uint8);rgba[:,:,3]=np.uint8(alpha*255)
 im=Image.fromarray(rgba);im.thumbnail((512,256),Image.Resampling.LANCZOS)
 im.save(out/(p.stem+'.png'))
 report[path]={'offset':[-pad,y0-pad],'source_size':[w+2*pad,h+2*pad-y0],'texture_size':list(im.size),'padding':pad,'source_height':h,'lower_crop_start':y0}
opts.report.write_text(json.dumps(report,indent=2))
s='extends RefCounted\n## Lower-silhouette contact masks, baked from original alpha; no displaced cast shadows.\nconst MASKS={\n'
for path,row in report.items():
 p=Path(path);s+=' '+json.dumps(path)+': {"texture":preload("res://assets/map/map11/contact_masks/'+p.stem+'.png"),"offset":Vector2(%s,%s),"size":Vector2(%s,%s)},\n'%(*row['offset'],*row['source_size'])
s+='}\n';(root/'scripts/maps/map11/ground_contact_masks.gd').write_text(s)
print('Contact masks:',len(report))
