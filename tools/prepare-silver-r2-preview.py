"""Prepare the approved r2 atlases with the two CTO walking retouches only."""
from pathlib import Path
import argparse,json,shutil,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from scipy import ndimage as ndi

def write_runtime_metadata(output):
    """Describe final atlas pixels independently of master-image crop stats."""
    specs=[('01_idle',96,(48,94)),('02_walk',96,(48,94)),('03_basic_attack',160,(80,124)),('04_spin',160,(80,124)),('05_shift',128,(64,100)),('06_hurt',96,(48,94))]
    dirs=['s','se','e','ne','n','nw','w','sw']
    for name,cell,foot in specs:
        root=output/name;image=Image.open(root/'atlas.png').convert('RGBA');cols=image.width//cell;rows=image.height//cell;frames=[]
        for row in range(rows):
            for col in range(cols):
                rect=[col*cell,row*cell,cell,cell];i=row*cols+col
                direction=(['s','sw','w','nw','n','ne','e','se','s_return'][i] if name=='04_spin' else dirs[row])
                frames.append(dict(direction=direction,slot=i if name=='04_spin' else col,rect=rect,rgba_sha256=hashlib.sha256(image.crop((rect[0],rect[1],rect[0]+cell,rect[1]+cell)).tobytes()).hexdigest()))
        path=root/'metadata.json';meta=json.loads(path.read_text(encoding='utf-8'));meta['runtime']=dict(image='atlas.png',dimensions=[image.width,image.height],cell_size=[cell,cell],columns=cols,rows=rows,render_scale=.5,foot_anchor=list(foot),logical_foot_y_from_center=foot[1]*.5-cell*.25,frames=frames);path.write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')

parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True);parser.add_argument('--north-legs',type=Path,required=True);parser.add_argument('--output',type=Path,required=True);parser.add_argument('--evidence',type=Path,required=True);args=parser.parse_args()
assert all(p.is_absolute() for p in [args.source,args.output,args.evidence]);args.output.mkdir(parents=True,exist_ok=True);args.evidence.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',14);res=Image.Resampling.NEAREST
groups=['01_idle','02_walk','03_basic_attack','04_spin','05_shift','06_hurt']
for group in groups:
    dst=args.output/group;dst.mkdir(exist_ok=True)
    for name in ['atlas.png','normal.png','metadata.json']:shutil.copy2(args.source/'candidate'/group/name,dst/name)

walk=Image.open(args.output/'02_walk/atlas.png').convert('RGBA');old=walk.copy()
source=np.array(Image.open(args.north_legs).convert('RGBA'));labels,n=ndi.label(source[:,:,3]>=160,np.ones((3,3)));counts=np.bincount(labels.ravel());counts[0]=0;ids=np.where(counts>1000)[0];assert len(ids)==4
parts=[]
for k in ids:
    yy,xx=np.where(labels==k);box=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)];p=source[box[1]:box[3],box[0]:box[2]].copy();mask=labels[box[1]:box[3],box[0]:box[2]]==k;p[~mask]=0;p[mask,3]=255;parts.append((float(np.mean(xx)),Image.fromarray(p)))
parts=[p for x,p in sorted(parts,key=lambda v:v[0])];shared_scale=31/max(p.height for p in parts)
n_before=[];n_after=[];n_records=[]
for f in range(4):
    p=old.crop((f*96,4*96,f*96+96,5*96));n_before.append(p);a=np.array(p);original=a.copy();yy,xx=np.indices((96,96))
    wm=Image.new('L',(96,96));ImageDraw.Draw(wm).polygon([(48,35),(57,35),(73,95),(64,95)],fill=255);weapon=(np.array(wm)>0)&(a[:,:,3]>0)
    slit=Image.new('L',(96,96));ImageDraw.Draw(slit).polygon([(45,64),(51,64),(64,95),(32,95)],fill=255)
    red=(a[:,:,0]>28)&(a[:,:,0]>a[:,:,1].astype(float)*1.55)&(a[:,:,0]>a[:,:,2].astype(float)*1.15)
    clear=((np.array(slit)>0)|((yy>=80)&(xx>=32)&(xx<=66)&~red))&~weapon;a[clear]=0
    legs=Image.new('RGBA',(96,96));p=parts[f];pa=np.array(p);py,px=np.indices(pa.shape[:2]);top=(pa[:,:,3]>0)&(py<p.height*.08);hip=float(np.median(px[top]));w,h=round(p.width*shared_scale),round(p.height*shared_scale);x=round(48-hip*shared_scale);y=95-h;small=np.array(p.resize((w,h),res));mask=small[:,:,3]>=160;small[:,:,3]=mask.astype('uint8')*255
    pal=Image.fromarray(small[:,:,:3][mask].reshape(1,-1,3)).quantize(colors=16,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);small[:,:,:3]=np.array(Image.fromarray(small[:,:,:3]).quantize(palette=pal,dither=Image.Dither.NONE).convert('RGB'));small[~mask]=0;legs.alpha_composite(Image.fromarray(small),(x,y))
    legs.alpha_composite(Image.fromarray(a));after=np.array(legs);after[weapon]=original[weapon]
    assert np.array_equal(after[:64],original[:64]);assert np.array_equal(after[weapon],original[weapon])
    lab,n=ndi.label(after[:,:,3]>0,np.ones((3,3)));assert n==1,('N',f,n)
    p2=Image.fromarray(after);walk.paste(p2,(f*96,4*96));n_after.append(p2);n_records.append(dict(frame=f,upper64rows_unchanged=True,weapon_pixels_unchanged=True,foot_anchor=[48,94],method='open central torn-cloth slit; newly drawn rear armored heel/toe legs',shared_leg_scale=shared_scale,leg_placement=[x,y],source_part_sha256=hashlib.sha256(p.tobytes()).hexdigest()))

se=old.crop((2*96,96,3*96,192));a=np.array(se);before=a.copy();yy,xx=np.indices((96,96));foot=(yy>=86)&(xx>=56)&(xx<=81)&(a[:,:,3]>0)&(a[:,:,:3].max(2)<34);a[foot,:3]=(34,25,28);assert np.array_equal(a[:,:,3],before[:,:,3]);walk.paste(Image.fromarray(a),(2*96,96))
walk.save(args.output/'02_walk/atlas.png')
for row in range(8):
    for f in range(4):
        if row==4 or (row==1 and f==2):continue
        assert np.array_equal(np.array(old.crop((f*96,row*96,f*96+96,row*96+96))),np.array(walk.crop((f*96,row*96,f*96+96,row*96+96))))

alpha=np.array(walk)[:,:,3];h=ndi.gaussian_filter(np.minimum(ndi.distance_transform_edt(alpha>0),5),1.1);dy,dx=np.gradient(h);v=np.stack((-dx*.35,dy*.35,np.ones_like(dx)),2);v/=np.linalg.norm(v,axis=2,keepdims=True);rgb=np.rint((v*.5+.5)*255).astype('uint8');rgb[alpha==0]=(128,128,255);Image.fromarray(np.dstack((rgb,alpha))).save(args.output/'02_walk/normal.png')
meta=json.loads((args.output/'02_walk/metadata.json').read_text(encoding='utf-8'));meta['r3_cto_retouch']=dict(north=n_records,se_frame2_forefoot_outline=dict(reference_color=[34,25,28],changed_pixels=int(foot.sum()),alpha_unchanged=True),source_r2_preserved=True);(args.output/'02_walk/metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')

board=Image.new('RGB',(1152,710),'#34363d');d=ImageDraw.Draw(board)
for row,frames in enumerate([n_before,n_after]):
    for f,p in enumerate(frames):
        q=p.resize((288,288),res);board.paste(q,(f*288,row*350+45),q);d.text((f*288+8,row*350+12),('r2 이전 / ' if row==0 else 'r3 교정 / ')+f'N {f}',font=font,fill='#dfd6c2')
board.save(args.evidence/'N_walk_before_after_3x.png')
board=Image.new('RGB',(576,350),'#34363d');d=ImageDraw.Draw(board)
for i,p in enumerate([se,Image.fromarray(a)]):q=p.resize((288,288),res);board.paste(q,(i*288,45),q);d.text((i*288+8,12),'SE2 / '+('r2 이전' if i==0 else 'r3 외곽선'),font=font,fill='#dfd6c2')
board.save(args.evidence/'SE2_outline_before_after_3x.png')
receipt=dict(source=str(args.source),north=n_records,se_changed_pixels=int(foot.sum()),se_outline_color=[34,25,28],unchanged_other_walk_cells=27,atlases={g:hashlib.sha256((args.output/g/'atlas.png').read_bytes()).hexdigest() for g in groups})
for group in groups:
    path=args.output/group/'metadata.json';meta=json.loads(path.read_text(encoding='utf-8'));meta['stage']='DEVELOPMENT_FLAG_PREVIEW_CTO_CANDIDATE';meta['preview_query']='spr=silver_r2';meta['atlas_sha256']=receipt['atlases'][group];meta['normal_usage']='silhouette draft retained for future integration; not applied by this web preview';meta['r2_cto_verdict']='idle/walk candidate passed; not product/game PASS'
    for item in meta.get('frames',[]):
        for frame in item.get('frames',[]):
            frame.pop('sha256',None)
            x,y,w,h=frame['rect'];frame['rgba_sha256']=hashlib.sha256(Image.open(args.output/group/'atlas.png').crop((x,y,x+w,y+h)).convert('RGBA').tobytes()).hexdigest()
    meta['hash_definition']='atlas_sha256 hashes PNG file bytes; rgba_sha256 hashes decoded frame RGBA bytes';path.write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8',newline='\n')
write_runtime_metadata(args.output)
(args.evidence/'retouch_receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf-8');print('r3 art retouches prepared; original r2 unchanged; SE pixels',int(foot.sum()))
