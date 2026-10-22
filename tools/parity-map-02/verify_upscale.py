from PIL import Image
from pathlib import Path
import numpy as np,json,hashlib
root=Path.cwd();folder=root/'godot/assets/map/web_parity/chunks1440';out=Path.home()/'exoduser-wt/_out/PARITY-MAP-02/upscale';rows=[];ims={};fail=[]
for y in range(8):
 for x in range(8):
  n=f'chunk_{x}_{y}.png';im=Image.open(folder/n).convert('RGBA');a=np.asarray(im);ims[x,y]=a
  original=Image.open(root/'assets/map/ch1/production_finish'/n).convert('RGBA').crop((1,1,1025,1025)).resize((1334,1334),Image.Resampling.LANCZOS)
  src=np.asarray(original).astype(np.int16);delta=a[1:-1,1:-1].astype(np.int16)-src
  # Resampling of the contextual RGB may differ by a few levels at source tile boundaries.
  alpha_ok=bool(np.array_equal(a[1:-1,1:-1,3],src[:,:,3]))
  chroma=np.stack([delta[:,:,0]-delta[:,:,1],delta[:,:,1]-delta[:,:,2]])
  row={'name':n,'size':list(im.size),'alpha_exact':alpha_ok,'max_chroma_delta':int(abs(chroma).max()),'p99_chroma_delta':float(np.percentile(abs(chroma),99)),'max_rgb_delta':int(abs(delta[:,:,:3]).max())};rows.append(row)
  if im.size!=(1336,1336) or not alpha_ok or row['p99_chroma_delta']>2:fail.append(n)
for y in range(8):
 for x in range(8):
  if x<7:
   if not np.array_equal(ims[x,y][:,-1],ims[x+1,y][:,1]):fail.append(f'bleed H{x},{y}')
   if not np.array_equal(ims[x,y][:,-2],ims[x+1,y][:,0]):fail.append(f'bleed Hreverse{x},{y}')
  if y<7:
   if not np.array_equal(ims[x,y][-1],ims[x,y+1][1]):fail.append(f'bleed V{x},{y}')
   if not np.array_equal(ims[x,y][-2],ims[x,y+1][0]):fail.append(f'bleed Vreverse{x},{y}')
(out/'asset_checks.json').write_text(json.dumps({'chunks':64,'adjacent_seams':112,'bleed_directions':224,'failures':fail,'rows':rows},indent=2))
# Nonresampled 1440p scale crops: original on left, bounded ESRGAN on right.
for x,y,px,py in [(3,7,500,400),(0,0,450,600),(3,3,400,400)]:
 src=Image.open(root/f'assets/map/ch1/production_finish/chunk_{x}_{y}.png').crop((1,1,1025,1025)).resize((1334,1334),Image.Resampling.LANCZOS)
 high=Image.open(folder/f'chunk_{x}_{y}.png').crop((1,1,1335,1335))
 canvas=Image.new('RGB',(1024,540));canvas.paste(src.crop((px,py,px+512,py+512)),(0,28));canvas.paste(high.crop((px,py,px+512,py+512)),(512,28))
 from PIL import ImageDraw
 ImageDraw.Draw(canvas).text((8,8),'WEB source 1440p equivalent | GODOT x4plus color-preserved; 1x',fill='white')
 canvas.save(out/f'chunk_{x}_{y}_crop_1x.png')
print(json.dumps({'chunks':64,'bleed_checks':224,'failures':fail}))
raise SystemExit(bool(fail))
