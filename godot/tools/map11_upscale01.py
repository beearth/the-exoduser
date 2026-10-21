"""UPSCALE-01. Replay approved logical source coordinates against Real-ESRGAN originals.
Run: python map11_upscale01.py --work /absolute/output --sources /original/MAP11-30
External x4 model inference is cached, NEVER fed a split/downscaled intermediate.
Only alpha masks may be resized; RGB always sampled from the enhanced original.
"""
from pathlib import Path
import argparse, subprocess, json, hashlib, runpy, sys, tempfile
import numpy as np, cv2
from PIL import Image
P=argparse.ArgumentParser();P.add_argument('--work',type=Path,required=True);P.add_argument('--sources',type=Path,required=True);P.add_argument('--tool',type=Path,default=Path.home()/'exoduser-wt/_tools/realesrgan/bin/realesrgan-ncnn-vulkan');args=P.parse_args()
ROOT=Path(__file__).resolve().parents[1]; W=args.work;W.mkdir(parents=True,exist_ok=True);(W/'sources').mkdir(exist_ok=True)
report={'tool':str(args.tool),'model':'realesrgan-x4plus','inference_scale':4,'runtime_density':{'field':1.5,'arena':2},'assets':[],'sources':[]}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def infer(src,name):
 dst=W/'sources'/f'{name}_x4.png'
 if not dst.exists():
  with (W/f'esrgan-{name}.log').open('w') as log:
   subprocess.run([str(args.tool),'-i',str(src),'-o',str(dst),'-n','realesrgan-x4plus','-s','4','-t','256'],cwd=args.tool.parent,stdout=log,stderr=subprocess.STDOUT,check=True)
 orig=Image.open(src).convert('RGB');hi=Image.open(dst).convert('RGB');assert hi.size==(orig.width*4,orig.height*4)
 # Per-channel mean match plus opponent chroma restoration. No unsharp/noise.
 a=np.asarray(orig,dtype=np.float32);small=np.asarray(hi.resize(orig.size,Image.Resampling.BOX),dtype=np.float32)
 mean_delta=a.mean((0,1))-small.mean((0,1))
 oldc=a-a.mean(2,keepdims=True);newc=small-small.mean(2,keepdims=True)
 sat=float(np.clip(np.mean(np.abs(oldc))/max(np.mean(np.abs(newc)),.001),.95,1.10))
 b=np.asarray(hi,dtype=np.float32);b+=mean_delta;l=b.mean(2,keepdims=True);b=l+(b-l)*sat
 b=np.clip(b,0,255).astype('uint8');correct=W/'sources'/f'{name}_corrected.png';Image.fromarray(b).save(correct)
 report['sources'].append({'source':str(src),'sha256':sha(src),'size':list(orig.size),'model_output_sha256':sha(dst),'mean_rgb_delta':mean_delta.tolist(),'chroma_gain':sat,'corrected_sha256':sha(correct)})
 return b

def remap(a,x,y):return cv2.remap(a,(x*4).astype('float32'),(y*4).astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
def sample_mask(a,x,y):return cv2.remap(a.astype('float32'),x.astype('float32'),y.astype('float32'),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
def reflect(v,lo,hi):
 t=(v-lo)%(2*(hi-lo));return lo+np.minimum(t,2*(hi-lo)-t)
def save(im,path,logical=None):
 path.parent.mkdir(parents=True,exist_ok=True);im.save(path)
 report['assets'].append({'file':str(path.relative_to(ROOT)),'size':list(im.size),'logical_size':logical,'rgba_bytes':im.width*im.height*4,'disk_bytes':path.stat().st_size,'sha256':sha(path),'import':'lossless'})
def alpha_image(rgb,alpha):return Image.fromarray(np.dstack([np.clip(rgb,0,255).astype('uint8'),np.clip(alpha*255,0,255).astype('uint8')]))
def grid(box,d):
 x0,y0,x1,y1=box;y,x=np.mgrid[:round((y1-y0)*d),:round((x1-x0)*d)].astype('float32');return x/d+x0,y/d+y0
# Run original splitter in scratch to reuse its authored polygons and alpha masks.
def baseline(which,source):
 scratch=W/f'base{which}';scratch.mkdir(exist_ok=True)
 before=sys.argv;sys.argv=[str(ROOT/f'tools/map11_{which}_split.py'),str(source),str(scratch)]
 try:ns=runpy.run_path(sys.argv[0])
 finally:sys.argv=before
 return scratch,ns

def cut_sources(a,base,rows,d,out):
 for row in rows:
  name=row['id'];mask=Image.open(base/(name+'.png')).convert('RGBA').getchannel('A')
  box=row['box'];x,y=grid(box,d)
  rgb=remap(a,x,y);alpha=np.asarray(mask.resize((x.shape[1],x.shape[0]),Image.Resampling.BILINEAR))/255
  save(alpha_image(rgb,alpha),out/(name+'.png'),[box[2]-box[0],box[3]-box[1]])

def tiles(out,name,box,d,render):
 # <=2048 including a one-texel gutter. Each tile samples one common coordinate plane.
 width=round((box[2]-box[0])*d);height=round((box[3]-box[1])*d);rows=[];core=2046
 for iy in range(0,height,core):
  for ix in range(0,width,core):
   cw=min(core,width-ix);ch=min(core,height-iy)
   yy,xx=np.mgrid[iy-1:iy+ch+1,ix-1:ix+cw+1].astype('float32')
   x=xx/d+box[0];y=yy/d+box[1]
   im=render(x,y);file=f'{name}_{ix//core}_{iy//core}.png';save(im,out/file,[cw/d,ch/d])
   rows.append({'file':file,'position':[(ix/d+box[0]),(iy/d+box[1])],'core':[cw,ch],'size':list(im.size),'density':d})
 (out/(name+'.json')).write_text(json.dumps({'tiles':rows,'box':box,'density':d,'bleed':1},indent=2)+'\n')
 return rows
field_src=args.sources/'ch1_field_corridor_target.png';arena_src=args.sources/'ch1_boss_arena_target.png'
field=infer(field_src,'field');arena=infer(arena_src,'arena')
for kind,a,src,d in [('32',field,field_src,1.5),('30',arena,arena_src,2)]:
 base,ns=baseline(kind,src);out=ROOT/f'assets/maps/map11/upscale01/target{kind}';out.mkdir(parents=True,exist_ok=True)
 recipe=json.loads((base/'split.json').read_text());cut_sources(a,base,recipe['regions'],d,out)
 if kind=='32':
  combined=np.maximum.reduce(ns['mask_list']).astype('float32')
  def source_floor(x,y):
   c=sample_mask(combined,x,y)[...,None]
   return remap(a,x,y)*(1-c)+remap(a,reflect(x,700,1300),reflect(y,500,1050))*c
  def first_floor(x,y):
   inside=np.minimum.reduce([x,1999-x,y,1124-y]);wavy=95+35*np.sin(x/139)+25*np.sin(y/137+x/199)
   keep=np.clip(inside/wavy,0,1);keep=keep*keep*(3-2*keep)
   return source_floor(x,y)*keep[...,None]+remap(a,reflect(x,700,1300),reflect(y,500,1050))*(1-keep[...,None])
  patch_recipe=json.loads((ROOT/'assets/maps/map11/target32/bake_32b.json').read_text())
  def render(x,y):
   acc=np.zeros((*x.shape,3),np.float32);weights=np.zeros(x.shape,np.float32)
   # Reconstruct original jitter indices from recipe's saved centers.
   for p in patch_recipe['patches']:
    sx,sy,w0,h0=p['source'];dx,dy=p['center']
    ix=round((dx+850)/190);iy=round((dy+2200)/190)
    u=x-dx+w0/2;v=y-dy+h0/2
    radius=np.maximum(np.abs(u-w0/2)/(w0/2),np.abs(v-h0/2)/(h0/2))
    edge=1-radius+.06*np.sin(x/57+iy)*np.sin(y/83+ix)
    valid=(u>=0)&(u<=w0)&(v>=0)&(v<=h0)
    if not valid.any():continue
    w=np.clip(edge/.32,0,1);w=w*w*(3-2*w)*valid
    # Full high-resolution source coordinates, no native integer truncation.
    rgb=remap(a,np.clip(sx+u,0,1999),np.clip(sy+v,0,1124))
    acc+=rgb*w[...,None];weights+=w
   b=acc/np.maximum(weights[...,None],.0001)
   lum=b.mean(2);red=np.clip((b[:,:,0]-b[:,:,1]-2)/22,0,1);green=np.clip((b[:,:,1]-b[:,:,0]+2)/18,0,1)*(1-red)
   palette=np.array([85,81,94])*(1-red[...,None])+np.array([53,31,41])*red[...,None]
   palette=palette*(1-green[...,None]*.28)+np.array([69,75,64])*green[...,None]*.28
   b=b*.78+(palette+(lum-70)[...,None]*.50)*.22
   inside=np.minimum.reduce([x,1999-x,y,1124-y]);keep=np.clip(inside/(110+25*np.sin(x/119)),0,1);keep=keep*keep*(3-2*keep)
   b=b*(1-keep[...,None])+first_floor(x,y)*keep[...,None]
   dist=np.maximum.reduce([-x/600,(x-1999)/600,(-y-850)/1150,(y-1124)/600,np.zeros_like(x)])
   f=np.clip(1-dist,0,1)**(1.6+.55*np.sin(x/197)*np.sin(y/183));f=f*f*(3-2*f)
   return alpha_image(b,f)
  tiles(out,'floor',[-600,-2000,2600,1725],d,render)
  for i,f in enumerate(patch_recipe['foreground']):
   box=f['source_box'];x,y=grid(box,d);mask=Image.open(ROOT/'assets/maps/map11/target32'/f['file']).getchannel('A').resize((x.shape[1],x.shape[0]),Image.Resampling.BILINEAR)
   save(alpha_image(remap(a,x,y),np.asarray(mask)/255),out/f['file'])
 else:
  w=ns['w'].astype('float32');detail=Image.open(ROOT/'assets/maps/map11/target30/floor_detail.png').convert('RGBA')
  # Original shadow/root/BACK alpha is reused, RGB is sampled from the original.
  under=np.asarray(Image.open(ROOT/'assets/maps/map11/target30/static_underlay.png').convert('RGBA'))
  def render(x,y):
   # Match original n/(n-1) mapping exactly in logical 4096 plane.
   sx=1000+(x/4095-.5)*4096;sy=562.5+(y/4095-.5)*4096
   c=sample_mask(w,sx,sy)[...,None]
   rgb=remap(a,sx,sy)*c+remap(a,reflect(sx,650,1350),reflect(sy,350,780))*(1-c)
   r=np.hypot((x/4095-.5)*4096*ns['source_scale'],(y/4095-.5)*4096*ns['source_scale'])
   alpha=np.clip((5400-r)/800,0,1);alpha=alpha*alpha*(3-2*alpha)
   # Keep 30c's authored continuous cracks (not ESRGAN input).
   de=cv2.remap(np.asarray(detail),x,y,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
   da=de[:,:,3:]/255;rgb=rgb*(1-da)+de[:,:,:3]*da
   # Static underlay: preserve root/shadow opacity, take new source RGB for BACK.
   ua=sample_mask(under[:,:,3]/255,sx,sy);inside=(sx>=0)&(sx<=1999)&(sy>=0)&(sy<=1124);ua*=inside
   # Existing composited underlay contains black shadow pixels: preserve their ratio.
   low_src=remap(a,sx,sy).astype(float);orig_rgb=cv2.remap(np.asarray(Image.open(arena_src).convert('RGB')),sx,sy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
   old=cv2.remap(under[:,:,:3],sx,sy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
   ratio=np.clip(old.astype(float)/np.maximum(orig_rgb,1),0,1.3)
   over=low_src*ratio
   final_alpha=ua+alpha*(1-ua)
   rgb=(over*ua[...,None]+rgb*alpha[...,None]*(1-ua[...,None]))/np.maximum(final_alpha[...,None],.00001)
   return alpha_image(rgb,final_alpha)
  tiles(out,'floor',[0,0,4096,4096],d,render)
  box=[0,820,2000,1125];x,y=grid(box,d);mask=Image.open(base/'foreground.png').getchannel('A').resize((x.shape[1],x.shape[0]),Image.Resampling.BILINEAR)
  fg=alpha_image(remap(a,x,y),np.asarray(mask)/255)
  for i in range(2):save(fg.crop((i*2000,0,(i+1)*2000,610)),out/f'foreground_{i}.png')
report['memory_rgba_bytes']=sum(r['rgba_bytes'] for r in report['assets'])
(W/'pipeline.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/'assets/maps/map11/upscale01/manifest.json').write_text(json.dumps(report,indent=2)+'\n')
print('UPSCALE pipeline assets',len(report['assets']),'RGBA bytes',report['memory_rgba_bytes'])
