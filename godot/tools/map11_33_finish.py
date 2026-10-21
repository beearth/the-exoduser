"""MAP11-33 deterministic masks and lossless trim. Run once from UPSCALE-01 parent.
No generation/inpaint/resample/sharpen; all RGB is preserved except skull soil tint.
"""
from pathlib import Path
import json,hashlib,shutil
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1];dst=root/'assets/maps/map11/finish33';dst.mkdir(exist_ok=True)
records=[]
def smooth(t):
 t=np.clip(t,0,1);return t*t*(3-2*t)
def save(im,p,source):
 p.parent.mkdir(exist_ok=True,parents=True);im.save(p)
 # Preserve accepted lossless/filter import settings with the new cache identity.
 old=Path(str(source)+'.import')
 if old.exists():
  text=old.read_text();src='res://'+str(source.relative_to(root));new='res://'+str(p.relative_to(root))
  text='\n'.join(line for line in text.split('\n') if not line.startswith('uid='))
  text=text.replace(hashlib.md5(src.encode()).hexdigest(),hashlib.md5(new.encode()).hexdigest()).replace(source.name,p.name).replace(src,new)
  Path(str(p)+'.import').write_text(text)
 records.append({'path':str(p.relative_to(root)),'source':str(source.relative_to(root)),'size':list(im.size),'mode':im.mode,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
# The lower-left rectangular cut is the foreground fragment's bottom, not a floor tile.
src=root/'assets/maps/map11/upscale01/target32/foreground_32b_0.png';a=np.array(Image.open(src).convert('RGBA'));h,w=a.shape[:2];y,x=np.mgrid[:h,:w]
reach=64+15*np.sin(x/23)+9*np.sin(x/11+.7)
a[:,:,3]=(a[:,:,3]*smooth((h-1-y)/reach)).astype('uint8');save(Image.fromarray(a),dst/'foreground_0.png',src)
# All trunks shared source y=0; break the common horizontal start with an irregular
# source-coordinate feather. Interior bark and RGB are byte-identical.
recipe=json.loads((root/'assets/maps/map11/target32/split.json').read_text())
for row in recipe['regions']:
 src=root/('assets/maps/map11/upscale01/target32/'+row['id']+'.png');a=np.array(Image.open(src).convert('RGBA'));h,w=a.shape[:2];y,x=np.mgrid[:h,:w]
 sx=row['box'][0]+x/1.5;sy=row['box'][1]+y/1.5
 start=22+18*np.sin(sx/71)+12*np.sin(sx/31+.9)
 width=130+35*np.sin(sx/137+.3)+25*np.sin(sx/53)
 a[:,:,3]=(a[:,:,3]*smooth((sy-start)/width)).astype('uint8');save(Image.fromarray(a),dst/(row['id']+'.png'),src)
# Short dark soil contamination on the lowest silhouette, no blur or loss of bone detail.
for name in ['bones0','bones2']:
 src=root/('assets/maps/map11/upscale01/north/'+name+'.png');a=np.array(Image.open(src).convert('RGBA'));h,w=a.shape[:2];y,x=np.mgrid[:h,:w]
 soil=smooth((y/h-(.875+.018*np.sin(x/19)+.012*np.sin(x/7)))/.105)*.46
 tint=np.array([65,57,66]);a[:,:,:3]=(a[:,:,:3]*(1-soil[:,:,None])+tint*soil[:,:,None]).astype('uint8')
 a[:,:,3]=(a[:,:,3]*(1-.24*smooth((y/h-.955)/.045))).astype('uint8');save(Image.fromarray(a),dst/(name+'.png'),src)
# Trim strictly zero-alpha margins + retain two source texels of filter bleed.
meta=json.loads((root/'assets/maps/map11/target32b/ground.json').read_text());before=after=0
for row in meta['tiles']:
 src=root/('assets/maps/map11/target32b/'+row['file']);im=Image.open(src).convert('RGBA');before+=im.width*im.height*4
 core=im.crop((2,2,2050,2050));box=core.getchannel('A').getbbox();assert box
 x0,y0,x1,y1=[v+2 for v in box];crop=(max(0,x0-2),max(0,y0-2),min(2052,x1+2),min(2052,y1+2));cut=im.crop(crop)
 if cut.getchannel('A').getextrema()==(255,255):cut=cut.convert('RGB')
 # Prove exact reconstructed visible RGBA, including preserved opaque alpha.
 restored=Image.new('RGBA',im.size);restored.paste(cut.convert('RGBA'),crop[:2])
 # RGB outside zero alpha is immaterial; all visible nonzero-alpha texels exact.
 old=np.array(im)[2:2050,2:2050];new=np.array(restored)[2:2050,2:2050]
 assert np.array_equal(old[:,:,3],new[:,:,3])
 mask=old[:,:,3]>0;assert np.array_equal(old[mask],new[mask])
 row['position']=[row['position'][0]+x0-2,row['position'][1]+y0-2];row['region']=[x0-crop[0],y0-crop[1],x1-x0,y1-y0];row['size']=[x1-x0,y1-y0]
 save(cut,dst/'ground'/row['file'],src);after+=cut.width*cut.height*(3 if cut.mode=='RGB' else 4)
(dst/'ground/ground.json').write_text(json.dumps(meta,indent=2)+'\n')
(dst/'manifest.json').write_text(json.dumps({'assets':records,'ground_before_rgba_bytes':before,'ground_after_data_bytes':after,'rgb_unmodified_except_skull_soil':True},indent=2)+'\n')
print('ground MiB',before/2**20,'->',after/2**20,'files',len(records))
