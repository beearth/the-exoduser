"""Source-only ESRGAN and deterministic north ground alpha retouch; no synthesis."""
from pathlib import Path
import sys,subprocess,json,hashlib
import numpy as np,cv2
from PIL import Image,ImageFilter
root=Path(__file__).resolve().parents[1];work=Path(sys.argv[1]);tool=Path.home()/'exoduser-wt/_tools/realesrgan/bin/realesrgan-ncnn-vulkan';out=root/'assets/maps/map11/upscale01/north';out.mkdir(parents=True,exist_ok=True)
rows=[]
sources=[('root',root.parent/'assets/map/ch1/floor_objects/prop_g_root.png',root/'assets/map/props/prop_g_root.png',1024),('moss',root.parent/'assets/map/ch1/collision/prop_pool.png',root/'assets/map/props/prop_pool.png',1280),('blood',Path(__file__).parent/'upscale01_sources/patch_bloodpool_roots.png',root/'assets/map/map11/patches/patch_bloodpool_roots.png',1024)]
for i in [0,2]:sources.append((f'bones{i}',Path(__file__).parent/f'upscale01_sources/skull_pyramid_{i}_diffuse.png',root/f'assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_{i}_diffuse.png',600))
for name,src,old,size in sources:
 hi=work/'sources'/f'{name}_x4.png'
 if not hi.exists():
  with (work/f'esrgan-{name}.log').open('w') as f:subprocess.run([str(tool),'-i',str(src),'-o',str(hi),'-n','realesrgan-x4plus','-s','4','-t','256'],cwd=tool.parent,stdout=f,stderr=subprocess.STDOUT,check=True)
 original=Image.open(src).convert('RGBA');processed=Image.open(old).convert('RGBA');enhanced=Image.open(hi).convert('RGB')
 if name=='blood':
  # Exact approved source crop from MAP11-20, before its 1024 thumbnail.
  enhanced=enhanced.crop(tuple(v*4 for v in [159,151,1766,1803]))
 else:
  assert original.size==processed.size,(name,original.size,processed.size)
 target=(round(processed.width*size/processed.height),size) if name.startswith('bones') else (size,round(processed.height*size/processed.width))
 rgb=np.asarray(enhanced.resize(target,Image.Resampling.LANCZOS),dtype=float)
 # Reapply original accepted offline colour treatment by smooth ratio; no extra sharpening.
 if name.startswith('bones'):
  raw=np.asarray(original.convert('RGB'),dtype=float);oldrgb=np.asarray(processed.convert('RGB'),dtype=float)
  gain=np.clip(oldrgb/np.maximum(raw,12),.25,3.5).astype('float32');gain=cv2.resize(gain,target,interpolation=cv2.INTER_LINEAR);rgb*=gain
 else:
  # Accepted prop colour matched at low frequency, keeping model-restored high detail.
  low=np.asarray(enhanced.resize(processed.size,Image.Resampling.LANCZOS),dtype=float)
  delta=np.asarray(processed.convert('RGB'),dtype=float)-low
  delta=cv2.GaussianBlur(delta.astype('float32'),(0,0),4);rgb+=cv2.resize(delta,target,interpolation=cv2.INTER_LINEAR)
 alpha=np.asarray(processed.getchannel('A').resize(target,Image.Resampling.BILINEAR),dtype=float)/255
 h,w=alpha.shape;y,x=np.mgrid[:h,:w].astype(float);u=x/w;v=y/h
 if name=='root':
  # Break the dark support plate into existing brighter roots, retain centre contact.
  l=rgb.mean(2);detail=np.clip((l-25)/48,0,1)
  radius=np.hypot((u-.5)/.52,(v-.56)/.55);edge=np.clip((1-radius+.075*np.sin(u*25)+.055*np.sin(v*31))/.45,0,1)
  edge=edge*edge*(3-2*edge);alpha*=edge*(.15+.55*detail)
 elif name in ['moss','blood']:
  # Texture-following, asymmetric seep: authored vein chroma and local creases,
  # rather than an opaque oval lip or a translated shadow.
  l=rgb.mean(2);red=np.clip((rgb[:,:,0]-rgb[:,:,1]-4)/30,0,1)
  detail=np.clip(np.abs(l-cv2.GaussianBlur(l,(0,0),max(2,w/120)))/8,0,1)
  radius=np.hypot((u-.5)/.58,(v-.5)/.58)
  reach=.13*np.sin(u*26+v*7)+.10*np.sin(v*29-u*9)+.10*detail+.10*red
  edge=np.clip((1-radius+reach)/.46,0,1);edge=edge*edge*(3-2*edge)
  alpha*=edge*(.62 if name=='blood' else .64)
  # Remove the bright/dark hard lip's contrast, leaving pigment within cracks.
  rgb=cv2.GaussianBlur(rgb,(0,0),.55)*.25+rgb*.75
 else:
  # The last 8% of the original render is a low dark support apron.
  l=rgb.mean(2);edge=np.clip((1-v)/.085+.07*np.sin(u*33),0,1)
  preserve=np.clip((l-28)/45,0,1);alpha*=np.maximum(edge,preserve)
 im=Image.fromarray(np.dstack([np.clip(rgb,0,255).astype('uint8'),np.clip(alpha*255,0,255).astype('uint8')]))
 im.save(out/(name+'.png'))
 rows.append({'name':name,'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_size':list(original.size),'model':'realesrgan-x4plus','inference':4,'output_size':list(im.size),'output_rgba_bytes':w*h*4,'sha256':hashlib.sha256((out/(name+'.png')).read_bytes()).hexdigest()})
(work/'props.json').write_text(json.dumps(rows,indent=2)+'\n');(out/'manifest.json').write_text(json.dumps(rows,indent=2)+'\n')
print('props',len(rows))

# One inventory after both stages; no model outputs or temporary RGB masters in runtime.
manifest=root/'assets/maps/map11/upscale01/manifest.json'
if manifest.exists():
 data=json.loads(manifest.read_text());inventory=[]
 for p in sorted(manifest.parent.rglob('*.png')):
  im=Image.open(p)
  inventory.append({'file':str(p.relative_to(root)),'size':list(im.size),'rgba_bytes':im.width*im.height*4,'png_bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'import':'lossless'})
 data['assets']=inventory;data['memory_rgba_bytes']=sum(r['rgba_bytes'] for r in inventory)
 manifest.write_text(json.dumps(data,indent=2)+'\n')
