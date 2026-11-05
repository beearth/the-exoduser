# Mac PixelOE practice: run with the venv python.  usage: poe_run.py <in_dir> <out_dir>
import sys,os,time,json
import numpy as np,torch
from PIL import Image
from pixeloe.torch.pixelize import pixelize
ind,out=sys.argv[1:3]
PS=2
V=[('A_contrast',dict(mode='contrast',do_quant=False)),
   ('B_contrast_q20',dict(mode='contrast',do_quant=True,num_colors=20,quant_mode='repeat-kmeans',dither_mode='none')),
   ('C_kcentroid',dict(mode='k_centroid',do_quant=False)),
   ('D_kcentroid_q20',dict(mode='k_centroid',do_quant=True,num_colors=20,quant_mode='repeat-kmeans',dither_mode='none'))]
def dots(a,th=40):
    a=a.astype(np.int32);h,w,_=a.shape;n=0;total=(h-2)*(w-2)
    for dy,dx in []:pass
    c=a[1:-1,1:-1];iso=np.ones(c.shape[:2],bool)
    for dy in(-1,0,1):
        for dx in(-1,0,1):
            if dy==0 and dx==0:continue
            nb=a[1+dy:h-1+dy,1+dx:w-1+dx];iso&=(np.abs(c-nb).max(axis=2)>th)
    return int(iso.sum()),total
res={}
for name in ['still-idle-1x','still-attack1-1x']:
    img=Image.open(os.path.join(ind,name+'.png')).convert('RGB');src=np.asarray(img)
    H,W=src.shape[:2];W2,H2=W//PS*PS,H//PS*PS
    base=src[:H2,:W2]
    # baseline: same grid by box mean, so the dot count is comparable
    bm=base.reshape(H2//PS,PS,W2//PS,PS,3).mean(axis=(1,3)).round().astype(np.uint8)
    res[name]={'orig_grid_box':dots(bm)+(len(np.unique(bm.reshape(-1,3),axis=0)),),'orig_1x':dots(base)+(len(np.unique(base.reshape(-1,3),axis=0)),)}
    t=torch.from_numpy(base.copy()).float().permute(2,0,1)[None]/255
    panels=[('orig',np.repeat(np.repeat(base,3,0),3,1))]
    for k,kw in V:
        t0=time.time()
        try:
            r=pixelize(t,pixel_size=PS,thickness=2,no_post_upscale=True,backend='torch',**kw)
        except Exception as e:
            res[name][k]='ERR '+repr(e)[:200];continue
        a=(r[0].clamp(0,1).permute(1,2,0).cpu().numpy()*255).round().astype(np.uint8)
        Image.fromarray(a).save(os.path.join(out,f'{name}_{k}.png'))
        res[name][k]=dots(a)+(len(np.unique(a.reshape(-1,3),axis=0)),a.shape[:2],round(time.time()-t0,2))
        panels.append((k,np.repeat(np.repeat(a,PS*3,0),PS*3,1)))
    h=min(p[1].shape[0] for p in panels);w=min(p[1].shape[1] for p in panels)
    sep=np.full((h,6,3),255,np.uint8);row=[]
    for _,p in panels:row+= [p[:h,:w],sep]
    Image.fromarray(np.hstack(row[:-1])).save(os.path.join(out,f'board_{name}.png'))
print(json.dumps(res,ensure_ascii=False,indent=0))
json.dump(res,open(os.path.join(out,'dots.json'),'w'),ensure_ascii=False,indent=1)
