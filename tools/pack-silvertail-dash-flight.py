"""Pack GPT Image poses into Silvertail's transparent 8-direction runtime sheet."""
from pathlib import Path
import json
import shutil
import numpy as np
from PIL import Image, ImageOps, ImageDraw
from scipy import ndimage

ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'output/imagegen/silvertail_dash_20260924/source.png'
rgb=np.array(Image.open(src).convert('RGB'))
r,g,b=rgb.astype(np.int16).transpose(2,0,1)
mask=~((g>100)&(g>r*1.35)&(g>b*1.35))
labels,count=ndimage.label(mask,np.ones((3,3)))
objects=[]
for label,sl in enumerate(ndimage.find_objects(labels),1):
    if sl is None:continue
    area=np.count_nonzero(labels[sl]==label)
    if area<1000:continue
    ys,xs=sl;objects.append((label,xs.start,ys.start,xs.stop,ys.stop))
assert len(objects)==30, f'Expected 30 distinct poses, got {len(objects)}'
objects.sort(key=lambda o:(o[2]+o[4])/2)
rows=[sorted(objects[i:i+6],key=lambda o:o[1]) for i in range(0,30,6)]
sheet=Image.new('RGBA',(384,512));metadata=[]
for row in range(8):
    source_row=[0,1,2,3,4,3,2,1][row]
    for col,obj in enumerate(rows[source_row]):
        label,x0,y0,x1,y1=obj
        px=rgb[y0:y1,x0:x1].copy()
        alpha=np.where(labels[y0:y1,x0:x1]==label,255,0).astype(np.uint8)
        px[:,:,1]=np.minimum(px[:,:,1],np.maximum(px[:,:,0],px[:,:,2]))
        pose=Image.fromarray(np.dstack((px,alpha)))
        scale=.22
        pose=pose.resize((round(pose.width*scale),round(pose.height*scale)),Image.Resampling.LANCZOS)
        if row>=5:pose=ImageOps.mirror(pose)
        ar=np.array(pose);h,w=ar.shape[:2];yy,xx=np.indices((h,w))
        feet=(ar[:,:,3]>180)&(ar[:,:,:3].max(axis=2)<115)&(yy>=h*.65)
        anchor_x=float(np.median(xx[feet])) if feet.any() else w/2
        x=round(32-anchor_x);y=50-h
        assert x>0 and x+w<64 and y>0 and y+h<64,(row,col,x,y,w,h)
        sheet.alpha_composite(pose,(col*64+x,row*64+y))
        metadata.append(dict(row=row,frame=col,source_bbox=[x0,y0,x1,y1],placement=[x,y],size=[w,h]))
dest=ROOT/'img/exoduser_silvertail/dash-flight-v1.png';sheet.save(dest)
out=ROOT/'output/imagegen/silvertail_dash_20260924'
shutil.copy2(ROOT/'tmp/silvertail_dash_prompt.txt',out/'prompt.txt')
(out/'packing.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
preview=Image.new('RGB',(384,512),(36,39,43));preview.paste(sheet,(0,0),sheet)
preview.resize((1152,1536),Image.Resampling.NEAREST).save(out/'packed-preview.png')
print('Packed',dest.relative_to(ROOT),sheet.size,'RGBA; 48 cells, scale .22')
