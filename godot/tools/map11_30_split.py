"""MAP11-30 deterministic paint-over split. No synthesis/noise/dithering.
Usage: python map11_30_split.py supplied_target.png [asset_dir]
Requires Pillow, numpy, OpenCV. Source coordinate polygons stay reviewable here.
"""
import sys,json,hashlib
from pathlib import Path
import numpy as np
import cv2
from PIL import Image,ImageDraw,ImageFilter
src=Path(sys.argv[1]); out=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[1]/'assets/maps/map11/target30'
out.mkdir(parents=True,exist_ok=True)
im=Image.open(src).convert('RGB'); a=np.asarray(im); H,W=a.shape[:2]
assert (W,H)==(2000,1125)
# Broad continuous floor region, excluding vertical trunks, pods and front branches.
floor_poly=[(560,300),(780,185),(870,215),(1080,300),(1350,310),(1515,425),(1555,600),(1400,795),(1190,890),(870,885),(610,805),(430,660),(405,505)]
m=Image.new('L',im.size);ImageDraw.Draw(m).polygon(floor_poly,fill=255)
# Clone the adjacent central floor with reflected coordinates. Crossfade is 48px,
# confined to erased outer material, never blur the complete source illustration.
y,x=np.mgrid[:H,:W].astype(np.float32)
def reflect(v,lo,hi):
 t=(v-lo)%(2*(hi-lo));return lo+np.minimum(t,2*(hi-lo)-t)
clone=np.asarray(im.crop((530,330,1470,820)).resize(im.size,Image.Resampling.BICUBIC))
w=np.asarray(m.filter(ImageFilter.GaussianBlur(20)),dtype=np.float32)/255
floor=(a*w[...,None]+clone*(1-w[...,None])).astype('uint8')
# Source floor ellipse -> unchanged circular simulation plane. Fixed camera .36.
n=4096; yy,xx=np.mgrid[:n,:n].astype(np.float32)
wx=(xx/(n-1)-.5)*4800; wy=(yy/(n-1)-.5)*4800
sx=1000+wx*(820/1700);sy=550+wy*(350/1700)
b=cv2.remap(floor,sx,sy,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
r=np.hypot(wx,wy); alpha=np.clip((2050-r)/300,0,1); alpha=alpha*alpha*(3-2*alpha)
Image.fromarray(np.dstack([b,(alpha*255).astype('uint8')])).save(out/'floor.png')
# Purple veins are selected from existing chroma only, not painted random points.
purple=np.clip((b[:,:,0].astype(float)+b[:,:,2]-2*b[:,:,1]-12)/70,0,1)
purple*=np.clip((b[:,:,2].astype(float)-b[:,:,1]+3)/18,0,1)
Image.fromarray((purple*alpha*255).astype('uint8')).save(out/'veins.png')
regions=[
 ('west_mouth',[(0,0),(430,0),(405,70),(375,125),(405,210),(470,250),(565,290),(620,335),(665,400),(570,432),(470,450),(340,480),(210,455),(80,420),(0,440)],(335,450)),
 ('north_west',[(430,0),(845,0),(850,52),(785,90),(755,130),(694,151),(603,160),(537,193),(445,199),(458,140),(510,100)],(625,170)),
 ('north_heart',[(860,0),(1160,0),(1160,55),(1115,100),(1070,137),(1100,180),(1190,207),(1200,250),(1110,266),(1000,228),(921,218),(850,239),(800,213),(840,170),(885,120)],(985,235)),
 ('north_east',[(1140,0),(1510,0),(1500,83),(1430,140),(1400,190),(1465,250),(1532,278),(1490,305),(1410,322),(1300,295),(1190,272),(1110,237),(1130,200),(1190,175),(1170,90)],(1310,302)),
 ('east_mouth',[(1580,0),(2000,0),(2000,672),(1925,630),(1850,600),(1740,610),(1630,570),(1530,542),(1440,526),(1375,499),(1410,463),(1515,427),(1615,410),(1675,370),(1680,290),(1690,235),(1740,200),(1740,140),(1620,105)],(1790,583)),
 ('south_west',[(0,375),(83,415),(180,470),(203,565),(260,628),(340,660),(400,730),(410,800),(350,850),(390,940),(480,990),(460,1125),(0,1125)],(215,950)),
 ('south_east',[(2000,620),(1935,650),(1900,715),(1840,770),(1780,822),(1690,850),(1580,865),(1530,922),(1450,960),(1400,1055),(1400,1125),(2000,1125)],(1800,1010)),
]
meta=[]
for i,(name,poly,foot) in enumerate(regions):
 mask=Image.new('L',im.size);ImageDraw.Draw(mask).polygon(poly,fill=255)
 # Inner feather keeps arbitrary crop edges out of the game frame. Feather
 # source frame boundaries too: a crop edge can become visible after Y sorting.
 raw=np.asarray(mask).copy(); padded=cv2.copyMakeBorder(raw,60,60,60,60,cv2.BORDER_CONSTANT)
 distance=cv2.distanceTransform(padded,cv2.DIST_L2,5)[60:-60,60:-60]
 soft=np.clip(distance/48,0,1);soft=soft*soft*(3-2*soft)
 # The lowest 100 source pixels are a ground apron, not a polygon cut.
 lower=np.clip((max(p[1] for p in poly)-y)/65,0,1)
 soft*=lower
 mask=Image.fromarray((soft*255).astype('uint8'))
 box=mask.getbbox();rgba=im.convert('RGBA');rgba.putalpha(mask);rgba=rgba.crop(box)
 rgba.save(out/(name+'.png'))
 # A separate low apron retains the same roots, blended at its upper cut.
 mx=np.asarray(mask,dtype=float)/255
 apron_weight=np.clip((y-(foot[1]-100))/100,0,1)*np.clip((foot[1]+75-y)/75,0,1)
 apron=im.convert('RGBA');apron.putalpha(Image.fromarray((mx*apron_weight*180).astype('uint8')));apron.crop(box).save(out/(name+'_root.png'))
 shadow=cv2.GaussianBlur((mx*apron_weight).astype('float32'),(0,0),12)
 sh=np.zeros((H,W,4),dtype='uint8');sh[:,:,3]=(shadow*130).astype('uint8');Image.fromarray(sh).crop(box).save(out/(name+'_shadow.png'))
 v=np.array([(foot[0]-1000)/820,(foot[1]-550)/350]);v=v/np.linalg.norm(v)*1755
 meta.append(dict(id=name,box=box,source_foot=foot,foot=[round(float(z),3) for z in v],offset=[box[0]-foot[0],box[1]-foot[1]],scale=2.25))
# Foreground branches only: lower border, continuous alpha edge, no screen overlay.
fg=Image.new('L',im.size)
ImageDraw.Draw(fg).polygon([(0,880),(130,920),(380,990),(530,955),(620,1015),(810,1060),(1020,1100),(1170,1060),(1320,1040),(1450,1025),(1560,1030),(1700,970),(1880,885),(2000,830),(2000,1125),(0,1125)],fill=255)
rgba=im.convert('RGBA');rgba.putalpha(fg.filter(ImageFilter.GaussianBlur(1)));rgba.crop((0,820,2000,1125)).save(out/'foreground.png')
# Source perimeter as distant continuous mass, behind the independently sorted
# front silhouettes. Circular world mask below removes every combat floor pixel.
bg=im.convert('RGBA'); bg_alpha=np.clip((np.hypot((x-1000)*2.9,(y-550)*2.9)-1650)/350,0,1)
bg.putalpha(Image.fromarray((bg_alpha*255).astype('uint8')));bg.save(out/'backmass.png')
# No stochastic fog: grayscale structure copied from the source gray perimeter.
fog=im.crop((1440,30,1696,286)).resize((256,256),Image.Resampling.LANCZOS).convert('L').filter(ImageFilter.GaussianBlur(14));fog.save(out/'fog.png')
# RGB curves (source pixels remain identity); applied to legacy environment only.
# 0, .25, .5, .75, 1 -> .025,.29,.56,.79,1.0, channel gains 1.04,.94,1.02.
curve={'resource':'legacy_to_target_curve.png','source_target':'identity: already painted in target look','calibration':'baseline ROI 650,400,600,300 -> target ROI 650,400,700,300; channel quantiles .1,.3,.5,.7,.9'}
manifest={'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_size':[W,H],'floor_size':[n,n],'world_extent':4800,'source_floor_ellipse':[1000,550,820,350],'radius':1700,'boundary_radius':1755,'regions':meta,'curve':curve,'new_generation':False,'dither':False,'method':'source-adjacent reflected clone, feathered source polygons, cubic inverse projection; no inpainting model'}
(out/'split.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False))
# Optional baseline frame makes the independent current-frame -> target RGB curve.
# Target-derived layers themselves keep identity, avoiding double color grading.
if len(sys.argv)>3:
 baseline=np.asarray(Image.open(sys.argv[3]).convert('RGB'))[400:700,650:1250]
 target=a[400:700,650:1350];q=[.1,.3,.5,.7,.9]
 bx=np.quantile(baseline.reshape(-1,3),q,axis=0);ty=np.quantile(target.reshape(-1,3),q,axis=0)
 cur=np.empty((1,256,3),dtype='uint8');knots=[]
 for c in range(3):
  values=np.r_[0,bx[:,c],255];outputs=np.r_[0,ty[:,c],255]
  unique=np.unique(values);means=np.array([outputs[values==v].mean() for v in unique])
  cur[0,:,c]=np.interp(np.arange(256),unique,means).clip(0,255).astype('uint8')
  knots.append({'input':unique.tolist(),'output':means.tolist()})
 Image.fromarray(cur).save(out/'legacy_to_target_curve.png')
 (out/'curve_calibration.json').write_text(json.dumps({'baseline_roi':[650,400,600,300],'target_roi':[650,400,700,300],'quantiles':q,'rgb':knots,'target_layers':'identity','baseline_sha256':hashlib.sha256(Path(sys.argv[3]).read_bytes()).hexdigest()},indent=2)+'\n')
