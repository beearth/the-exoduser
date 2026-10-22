from PIL import Image,ImageFilter
from pathlib import Path
import numpy as np,json,hashlib
root=Path.cwd();out=Path.home()/'exoduser-wt/_out/PARITY-MAP-02/upscale';target=root/'godot/assets/map/web_parity/chunks1440';target.mkdir(exist_ok=True)
rows=[];cores={}
for y in range(8):
 for x in range(8):
  name=f'chunk_{x}_{y}.png';margin=16;context=margin*1024/1334
  raw=Image.open(out/'raw'/name).convert('RGB').resize((1334+2*margin,1334+2*margin),Image.Resampling.LANCZOS,box=(256-4*context,256-4*context,4352+4*context,4352+4*context))
  src=Image.open(out/'input'/name).convert('RGBA').resize((1334+2*margin,1334+2*margin),Image.Resampling.LANCZOS,box=(64-context,64-context,1088+context,1088+context))
  # Preserve original chroma/alpha and local tone. Only replace bounded luminance detail.
  a=np.asarray(src,dtype=np.float32);b=np.asarray(raw,dtype=np.float32)
  lum=lambda z:z[:,:,0]*.299+z[:,:,1]*.587+z[:,:,2]*.114
  al=Image.fromarray(lum(a).astype(np.uint8));bl=Image.fromarray(lum(b).astype(np.uint8))
  higha=np.asarray(al,dtype=np.float32)-np.asarray(al.filter(ImageFilter.GaussianBlur(3)),dtype=np.float32)
  highb=np.asarray(bl,dtype=np.float32)-np.asarray(bl.filter(ImageFilter.GaussianBlur(3)),dtype=np.float32)
  delta=np.clip((highb-higha)*.6,-8,8)
  # Equal RGB increments leave channel differences/chroma unchanged (except output clamp).
  a[...,:3]=np.clip(a[...,:3]+delta[...,None],0,255)
  core=Image.fromarray(a.round().astype(np.uint8)).crop((margin,margin,margin+1334,margin+1334))
  alpha=Image.open(root/'assets/map/ch1/production_finish'/name).convert('RGBA').crop((1,1,1025,1025)).resize((1334,1334),Image.Resampling.LANCZOS).getchannel('A')
  core.putalpha(alpha);cores[x,y]=core
# One common master for all final bleed pixels. No independently generated border.
master=Image.new('RGBA',(10672,10672))
for (x,y),im in cores.items():master.paste(im,(x*1334,y*1334))
for y in range(8):
 for x in range(8):
  name=f'chunk_{x}_{y}.png';im=master.crop((x*1334-1,y*1334-1,(x+1)*1334+1,(y+1)*1334+1))
  if x==0:im.paste(im.crop((1,0,2,1336)),(0,0))
  if x==7:im.paste(im.crop((1334,0,1335,1336)),(1335,0))
  if y==0:im.paste(im.crop((0,1,1336,2)),(0,0))
  if y==7:im.paste(im.crop((0,1334,1336,1335)),(0,1335))
  im.save(target/name)
  rows.append({'name':name,'source_sha256':hashlib.sha256((root/'assets/map/ch1/production_finish'/name).read_bytes()).hexdigest(),'sha256':hashlib.sha256((target/name).read_bytes()).hexdigest(),'pixel_size':[1336,1336],'core':1334,'world_size':1000,'bleed':1})
(target/'provenance.json').write_text(json.dumps({'model':'realesrgan-x4plus','original_neighbor_context':64,'grading_neighbor_context_target_px':16,'inference_scale':4,'target_screen':'camera1.0 1440p','texel_per_screen_pixel':1334/(1000*1440/1080),'luminance_detail':'delta=clamp(0.6*(modelY-Gaussian3(modelY)-sourceY+Gaussian3(sourceY)),-8,8); RGB=sourceRGB+delta; original resampled alpha','chunks':rows},indent=2))
