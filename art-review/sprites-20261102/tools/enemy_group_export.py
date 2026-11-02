from sprite_export import *
from witch_material_palette import materialClean
name=sys.argv[1];mode=sys.argv[2];P=ROOT/('enemy-'+name+'-'+mode+'-r30');P.mkdir(exist_ok=True);native=['south','south-east','east','north-east','north','north-west','west','south-west'];S=Image.open(ROOT/'enemy5-reference'/(name+'-original8.png')).convert('RGBA');src=[S.crop((i%4*256,i//4*256,(i%4+1)*256,(i//4+1)*256)) for i in range(8)];idx={'bone_centipede_pro':8,'headless_knight':23,'bone_archer':35,'apostle_knight':2,'gut_witch':27}[name]
walksrc=[]
if mode=='walk8':
 for i,d in enumerate(native):
  W=Image.open('G:/exoduser-wt/codex-hd2d/unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_'+d.replace('-','_')+'.png').convert('RGBA');aa=[]
  for k in range(4):aa.append(Image.alpha_composite(src[i],W.crop((idx%8*1024+k*256,idx//8*256,idx%8*1024+(k+1)*256,(idx//8+1)*256))))
  walksrc.append(aa)
def sourceAt(i,k):
 s=walksrc[i][k] if mode=='walk8' else src[i]
 if mode=='hurt8':
  a=np.array(s);a[:,:,1]=np.rint(a[:,:,1]*.62).astype('uint8');a[:,:,2]=np.rint(a[:,:,2]*.62).astype('uint8');s=Image.fromarray(a)
 return s
K=1 if mode=='idle8' else (2 if mode=='hurt8' else 4);raws=[];bb=[]
if mode=='idle8':
 G=Image.open(P/'generated.png').convert('RGBA')
 for i in range(8):raws.append([G.crop((round(i%4*G.width/4),round(i//4*G.height/2),round((i%4+1)*G.width/4),round((i//4+1)*G.height/2)))])
elif mode=='hurt8':
 G=Image.open(P/'generated.png').convert('RGBA')
 for i in range(8):
  rr=[]
  for k in range(K):j=i*K+k;rr.append(G.crop((round(j%4*G.width/4),round(j//4*G.height/4),round((j%4+1)*G.width/4),round((j//4+1)*G.height/4))))
  raws.append(rr)
else:
 for i in range(8):
  G=Image.open(P/('generated-'+('A' if i<4 else 'B')+'.png')).convert('RGBA');raws.append([G.crop((round(k*G.width/4),round(i%4*G.height/4),round((k+1)*G.width/4),round((i%4+1)*G.height/4))) for k in range(K)])
ov={}
if (P/'raw-overrides.json').exists():
 ov=json.loads((P/'raw-overrides.json').read_text(encoding='utf8'))
 for ds,v in ov.items():
  G=Image.open(P/v['file']).convert('RGBA');gc,gr=v['grid'];di=native.index(ds);raws[di]=[G.crop((round(c*G.width/gc),round(r*G.height/gr),round((c+1)*G.width/gc),round((r+1)*G.height/gr))) for c,r in v['cells']]
keyOv={}
if (P/'raw-key-overrides.json').exists():
 keyOv=json.loads((P/'raw-key-overrides.json').read_text(encoding='utf8'))
 for ds,ks in keyOv.items():
  for kk,v in ks.items():raws[native.index(ds)][int(kk)]=Image.open(P/v['file']).convert('RGBA')
rawRemoved={}
rawPolicy=json.loads((P/'raw-component-policy.json').read_text()) if (P/'raw-component-policy.json').exists() else {}
for i in range(8):
 for k in range(K):
  g=raws[i][k];a=np.array(g);mask=a[:,:,3]>=128;cc=sorted(components(mask),key=len,reverse=True);removed=0
  for pts in cc[1:]:
   if name=='gut_witch' and len(pts)>32 and not rawPolicy.get(native[i],{}).get('keepLargest',False):continue
   for y,x in pts:mask[y,x]=False;removed+=1
  a[~mask]=0;a[mask,3]=255;raws[i][k]=Image.fromarray(a);rawRemoved[str(i)+':'+str(k)]=removed
# Whole-view provider camera correction, never separate per-key zoom.
if (P/'camera-calibration.json').exists():calibration=json.loads((P/'camera-calibration.json').read_text(encoding='utf8'))
else:calibration={}
# One scale per direction for entire motion, inherited from the idle authoring camera, never per frame.
if mode=='idle8':
 ratios=[(box(s)[3]-box(s)[1])*2/(box(g[0],128)[3]-box(g[0],128)[1]) for s,g in zip(src,raws)];scale=float(np.median(ratios));scales=[scale]*8
else:
 im=json.loads((ROOT/('enemy-'+name+'-idle8-r30')/'metadata.json').read_text(encoding='utf8'));scales=[]
 for i in range(8):
  ref=Image.open(ROOT/('enemy-'+name+'-idle8-r30')/(native[i]+'.png')).convert('RGBA');rb=box(ref);b=box(raws[i][0],128);scales.append((rb[3]-rb[1])/(b[3]-b[1]))
for ds,sc in calibration.get('scales',{}).items():scales[native.index(ds)]=sc
L=R=128;T=96;B=32;cw=768;ch=640;A=Image.new('RGBA',(cw*K,ch*8 if K>1 else ch*2));N=A.copy();records=[];views=[]
def nf(im):
 a=np.array(im);m=a[:,:,3]>=128;l=Image.fromarray(np.where(m,255,0).astype('uint8'));ds=np.zeros(m.shape,float)
 for z in range(4):ds+=np.array(l)>0;l=l.filter(ImageFilter.MinFilter(3))
 yy,xx=np.gradient(ds);v=np.dstack([-xx*.64,yy*.64,np.ones_like(ds)]);v/=np.linalg.norm(v,axis=2)[:,:,None];b=np.rint((v*.5+.5)*255).astype('uint8');b[~m]=[128,128,255];return Image.fromarray(np.dstack([b,a[:,:,3]]))
# idle uses 4x2 layout
if K==1:A=Image.new('RGBA',(cw*4,ch*2));N=A.copy()
for i in range(8):
 v=[];d=P/native[i];d.mkdir(exist_ok=True)
 for k in range(K):
  g=raws[i][k];b=box(g,128);s=sourceAt(i,k);sb=box(s);sc=scales[i];q=g.crop(b).resize((round((b[2]-b[0])*sc),round((b[3]-b[1])*sc)),Image.Resampling.BOX);q,rm=(materialClean(q) if name=='gut_witch' else clean(q));pal=q if name=='gut_witch' else q.convert('RGB').quantize(colors=24,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB');pal.putalpha(q.getchannel('A'));q=pal;a=np.array(q);cs=sorted(components(a[:,:,3]>0),key=len,reverse=True)
  # Keep intentional complete objects; remove tiny detached alpha islands only, never erase larger weapons.
  qb=box(q);oa=np.array(s);yy,xx=np.where(oa[max(0,sb[3]-24):sb[3],:,3]>=64);footx=(xx.min()+xx.max())/2*2+L;qa=np.array(q);yy,xx=np.where(qa[max(0,qb[3]-48):qb[3],:,3]>=128);fx=(xx.min()+xx.max())/2;xy=(round(footx-fx),sb[3]*2+T-qb[3]);c=Image.new('RGBA',(cw,ch));c.paste(q,xy);nm=nf(c);fn=(P/(native[i]+'.png')) if K==1 else d/(str(k)+'.png');c.save(fn);nm.save(str(fn).replace('.png','.normal.png'));ax=i%4*cw if K==1 else k*cw;ay=i//4*ch if K==1 else i*ch;A.paste(c,(ax,ay));N.paste(nm,(ax,ay));ca=np.array(c);records.append(dict(direction=native[i],key=k,sourceBox=sb,rawBox=b,rawCellSize=g.size,rawBorder=int(np.sum(np.concatenate([np.array(g)[0,:,3],np.array(g)[-1,:,3],np.array(g)[:,0,3],np.array(g)[:,-1,3]])>=128)),cameraScale=sc,translation=xy,rect=[ax,ay,cw,ch],sourceFoot=sb[3],targetFoot=sb[3]*2+T,actualFoot=box(c)[3],border=int(np.sum(np.concatenate([ca[0,:,3],ca[-1,:,3],ca[:,0,3],ca[:,-1,3]])>0)),normalAlphaMismatch=int(np.sum(ca[:,:,3]!=np.array(nm)[:,:,3])),alphaComponents=[len(z) for z in components(ca[:,:,3]>0)],removedDetachedPixels=rm,rawRemovedDetachedPixels=rawRemoved[str(i)+':'+str(k)]));v.append(c)
 views.append(v)
A.save(P/'atlas.png');N.save(P/'atlas.normal.png');m=dict(name=name,mode=mode,cell=[cw,ch],baseSourceCell=[256,256],base2x=[512,512],padding=[L,T,R,B],directions=native,keys=K,atlasSize=A.size,runtimePPU=100,runtimeAdoption=0,sourcePivot=[.5,.5],candidatePivot=[(256+L)/cw,(256+B)/ch],scaleContract='NativeSpriteFor PPU100; new logical draw e.Radius*7/512, compensate padding cw/512,ch/512; same Core center. Fullbody walk must hide legacy body and replace partial-overlay state, not drop-in compatible.',fullBodyCandidate=True,legacyPartialOverlayCompatible=False,requiresStateSourceAdapter=True,walkSource='distance/128 mod4; 4 original partial overlays over base',attackSource='legacy idle alias; new 4-key pose proposal unbound',hurtSource='legacy idle plus red tint; new 2-key reaction proposal unbound',normal='silhouette bevel4 estimate, shared diffuse alpha',reviewScale='128px normalized source cell, not actual Player1x proof',sourceOverrides=ov,sourceKeyOverrides=keyOv,rawComponentPolicy=rawPolicy,cameraCalibration=calibration,records=records);(P/'metadata.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf8');(P/'technical-checks.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
# Pixel-perfect 1x normalized review, same foot baseline. 2x atlas maps to same logical 128px source cell.
font=ImageFont.truetype(FONT,15);fw=1088;rh=560;frames=[]
for i in range(8):
 for k in range(K):
  c=views[i][k].resize((192,160),Image.Resampling.NEAREST);o=Image.new('RGBA',(192,160));o.paste(sourceAt(i,k).resize((128,128),Image.Resampling.NEAREST),(32,24));f=Image.new('RGB',(fw,rh),(22,25,31));dr=ImageDraw.Draw(f);dr.text((8,6),name+' '+mode+' '+native[i]+' key'+str(k)+' / 원본1x | 후보1x | 후보3x',font=font,fill='white');dr.text((8,30),'원본셀128px 정규화 검토 / 실제Player·공격/피격 상태연결 미검증',font=font,fill='#bbb8b0')
  for im,x,y in [(o,8,220),(c,220,220),(c.resize((576,480),Image.Resampling.NEAREST),440,60)]:f.paste(im,(x,y),im)
  f.save(P/('phase-%02d.png'%(i*K+k)));frames.append(f);zoom=c.resize((576,480),Image.Resampling.NEAREST);back=Image.new('RGB',zoom.size,(22,25,31));back.paste(zoom,(0,0),zoom);back.save(P/('phase-%02d-3x.png'%(i*K+k)))
# 2 pages for large groups, 4 dirs/page, 4-key strips native3x.
for page in range(2):
 b=Image.new('RGB',(fw,rh*4*K))
 for j in range(4*K):b.paste(frames[page*4*K+j],(0,j*rh))
 b.save(P/('comparison-grid-page-'+str(page+1)+'.png'))
 for k in range(K):
  b=Image.new('RGB',(fw,rh*4))
  for j in range(4):b.paste(frames[(page*4+j)*K+k],(0,j*rh))
  b.save(P/('page-'+str(page+1)+'-motion-%02d.png'%k))
 pal=Image.open(P/('page-'+str(page+1)+'-motion-00.png')).quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);seq=list(range(K));qq=[Image.open(P/('page-'+str(page+1)+'-motion-%02d.png'%k)).quantize(palette=pal,dither=Image.Dither.NONE) for k in seq];qq[0].save(P/('page-'+str(page+1)+'.gif'),save_all=True,append_images=qq[1:],duration=150 if K==4 else 200,loop=0,optimize=False)
for i in range(8):
 strip=Image.new('RGB',(576*K,480),(22,25,31))
 for k in range(K):strip.paste(Image.open(P/('phase-%02d-3x.png'%(i*K+k))),(k*576,0))
 strip.save(P/(native[i]+'-keys-3x.png'))
 if K==4:
  fold=Image.new('RGB',(1152,960),(22,25,31))
  for k in range(4):fold.paste(Image.open(P/('phase-%02d-3x.png'%(i*K+k))),(k%2*576,k//2*480))
  fold.save(P/(native[i]+'-keys4-3x-folded.png'))
if K==2:
 for page in range(2):
  stages=[]
  for st in range(4):
   b=Image.new('RGB',(fw,rh*4),(22,25,31))
   for j in range(4):
    i=page*4+j
    if st in [1,2]:f=frames[i*K+st-1]
    else:
     cc=Image.open(ROOT/('enemy-'+name+'-idle8-r30')/(native[i]+'.png')).convert('RGBA').resize((192,160),Image.Resampling.NEAREST);oo=Image.new('RGBA',(192,160));oo.paste(src[i].resize((128,128),Image.Resampling.NEAREST),(32,24));f=Image.new('RGB',(fw,rh),(22,25,31));dd=ImageDraw.Draw(f);dd.text((8,6),name+' neutral / 원본1x | 후보1x | 후보3x',font=font,fill='white')
     for im,x,y in [(oo,8,220),(cc,220,220),(cc.resize((576,480),Image.Resampling.NEAREST),440,60)]:f.paste(im,(x,y),im)
    b.paste(f,(0,j*rh))
   stages.append(b)
  idx=0
  for st,nrep in enumerate([6,2,3,6]):
   for rep in range(nrep):stages[st].save(P/('page-'+str(page+1)+'-motion-%02d.png'%idx));idx+=1
  pal=stages[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);qq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in stages];qq[0].save(P/('page-'+str(page+1)+'.gif'),save_all=True,append_images=qq[1:],duration=[300,100,150,300],loop=0,optimize=False)
 m['hurtReviewSequence']=['idle','impact','recovery','idle'];m['hurtReviewMs']=[300,100,150,300];m['hurtReviewUnbound']=True;(P/'metadata.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf8')
if K==1:
 pal=frames[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);qq=[]
 for i,f in enumerate(frames):f.save(P/('motion-%02d.png'%i));qq.append(f.quantize(palette=pal,dither=Image.Dither.NONE))
 qq[0].save(P/'comparison.gif',save_all=True,append_images=qq[1:],duration=500,loop=0,optimize=False)
print(dict(group=name+'-'+mode,frames=len(records),size=A.size,border=sum(r['border'] for r in records),normal=sum(r['normalAlphaMismatch'] for r in records),feet=[r['actualFoot']-r['targetFoot'] for r in records],scales=scales))
