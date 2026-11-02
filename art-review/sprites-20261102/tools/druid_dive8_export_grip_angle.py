from sprite_export import *
P=ROOT/'druid-dive-emerge8-r27-kit';P.mkdir(exist_ok=True);raw=Image.open(ROOT/'druid-dive8-r27-body/generated.png').convert('RGBA');S=Image.open('G:/exoduser-wt/codex-hd2d/unity/Assets/Exoduser/Resources/Art/boss/dark_druid/dive.png').convert('RGBA');cfg=json.loads((ROOT/'druid-bodies8-r19/rigid-kit-config-r23.json').read_text(encoding='utf8'));master=Image.open(ROOT/cfg['bodySheet']).convert('RGBA').crop((0,0,362,543));kit=Image.open(cfg['staffSource']).convert('RGBA');ka=np.array(kit);ka[ka[:,:,3]<128]=0;kit=Image.fromarray(ka);ps=cfg['staffFixedNativeScale']*2;prop=kit.resize((round(kit.width*ps),round(kit.height*ps)),Image.Resampling.BOX);sg=[v*ps for v in cfg['staffSourceGrip']];xs=[0,444,887,1331,1774];ys=[0,444,887];dx=[0,1144,2286,3430,4572];dy=[0,1112,2222];A=Image.new('RGBA',(4572,2222));N=A.copy();gs=[];os=[];rr=[];previews={'dive':[],'emerge':[]};font=ImageFont.truetype(FONT,15)
def solid(im):
 a=np.array(im);a[a[:,:,3]<128]=0;cc=sorted(components(a[:,:,3]>=128),key=len,reverse=True);rm=0
 for pts in cc[1:]:
  for y,x in pts:a[y,x]=0;rm+=1
 return Image.fromarray(a),rm
for i in range(8):
 r=(xs[i%4],ys[i//4],xs[i%4+1],ys[i//4+1]);g,rm=solid(raw.crop(r));gs.append((g,rm));os.append(S.crop(r))
bs=844/(box(gs[0][0],128)[3]-box(gs[0][0],128)[1]);grips=[[294,214],[299,221],[281,293],[228,370],[249,366],[307,365],None,None]
def nf(im):
 a=np.array(im);m=a[:,:,3]>=128;l=Image.fromarray(np.where(m,255,0).astype('uint8'));ds=np.zeros(m.shape,float)
 for z in range(4):ds+=np.array(l)>0;l=l.filter(ImageFilter.MinFilter(3))
 yy,xx=np.gradient(ds);v=np.dstack([-xx*.64,yy*.64,np.ones_like(ds)]);v/=np.linalg.norm(v,axis=2)[:,:,None];b=np.rint((v*.5+.5)*255).astype('uint8');b[~m]=[128,128,255];return Image.fromarray(np.dstack([b,a[:,:,3]]))
for i,((g,rm),o) in enumerate(zip(gs,os)):
 if i==0:g,rm=solid(master);sc=422/471*2
 else:sc=bs
 bb=box(g,128);ob=box(o);q=g.crop(bb).resize((round((bb[2]-bb[0])*sc),round((bb[3]-bb[1])*sc)),Image.Resampling.BOX);q,rm2=clean(q);qa=np.array(q);qb=box(q);yy,xx=np.where(qa[max(0,qb[3]-40):qb[3],:,3]>=128);fx=(xx.min()+xx.max())/2;oa=np.array(o);yy,xx=np.where(oa[max(0,ob[3]-30):ob[3],:,3]>=128);rx=(xx.min()+xx.max())+128;fy=ob[3]*2+192;xy=(round(rx-fx),fy-qb[3]);w=dx[i%4+1]-dx[i%4];h=dy[i//4+1]-dy[i//4];B=Image.new('RGBA',(w,h));B.paste(q,xy);dg=None;pr=Image.new('RGBA',(w,h))
 if grips[i]:
  dg=[round((grips[i][0]-bb[0])*sc+xy[0]),round((grips[i][1]-bb[1])*sc+xy[1])];ang=[.10,.10,.10,-.35,-.75,-1.25,0,0][i];c=math.cos(ang);s=math.sin(ang);pr=prop.transform((w,h),Image.Transform.AFFINE,(c,s,sg[0]-c*dg[0]-s*dg[1],-s,c,sg[1]+s*dg[0]-c*dg[1]),Image.Resampling.BICUBIC);pa=np.array(pr);pa[fy:]=0;pr=Image.fromarray(pa)
 ac=Image.alpha_composite(pr,B)
 if i in [3,4]:
  ac=Image.alpha_composite(B,pr);hm=Image.new('L',(w,h));ImageDraw.Draw(hm).ellipse((dg[0]-32,dg[1]-40,dg[0]+32,dg[1]+40),fill=255);ha=np.minimum(np.array(hm),np.array(B)[:,:,3]);ac.paste(B,(0,0),Image.fromarray(ha))
 aa=np.array(ac);aa[aa[:,:,3]<128]=0;ac,rm3=clean(Image.fromarray(aa));nn=nf(ac);ac.save(P/('frame-%d.png'%i));nn.save(P/('frame-%d.normal.png'%i));A.paste(ac,(dx[i%4],dy[i//4]));N.paste(nn,(dx[i%4],dy[i//4]));aa=np.array(ac);rr.append(dict(frame=i,bodyScale=sc,rawBox=bb,bodyTranslation=xy,staffScale=ps,staffAngle=[.10,.10,.10,-.35,-.75,-1.25,0,0][i],staffVisible=grips[i] is not None,destinationGrip=dg,sourceFoot=ob[3],targetFoot=fy,actualFoot=box(ac)[3],groundOcclusionY=fy,border=int(np.sum(np.concatenate([aa[0,:,3],aa[-1,:,3],aa[:,0,3],aa[:,-1,3]])>0)),normalAlphaMismatch=int(np.sum(aa[:,:,3]!=np.array(nn)[:,:,3])),components=[len(z) for z in components(aa[:,:,3]>0)],removed=rm+rm2+rm3,frame0Reuse='current idle body, new density only' if i==0 else None))
 for kind,owidth in [('dive',174),('emerge',102)]:
  dw=round(w*owidth/(o.width*2));dh=round(h*155/(o.height*2));pc=ac.resize((dw,dh),Image.Resampling.NEAREST);orig=Image.new('RGBA',pc.size);orig.paste(o.resize((owidth,155),Image.Resampling.NEAREST),(round(128*owidth/(o.width*2)),round(192*155/(o.height*2))));f=Image.new('RGB',(1280,700),(22,25,31));dr=ImageDraw.Draw(f);dr.text((8,5),'드루이드 '+kind+' '+str(i)+' / 원본1x | 후보1x | 후보3x',font=font,fill='white');dr.text((8,28),'155px 정규화검토목표 / 단계125ms 시안·실제상태시간/Unity 미검증',font=font,fill='#bbb8b0')
  for im,x,y in [(orig,8,280),(pc,260,280),(pc.resize((dw*3,dh*3),Image.Resampling.NEAREST),560,80)]:f.paste(im,(x,y),im)
  previews[kind].append(f);f.save(P/(kind+'-phase-%02d.png'%i))
A.save(P/'atlas.png');N.save(P/'atlas.normal.png');seq=list(range(8))+list(range(7,-1,-1))
for kind,frames in previews.items():
 bd=Image.new('RGB',(1280,700*8))
 for i,f in enumerate(frames):bd.paste(f,(0,i*700))
 bd.save(P/(kind+'-comparison-grid.png'));pal=bd.quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);qq=[]
 for j,i in enumerate(seq):frames[i].save(P/(kind+'-motion-%02d.png'%j));qq.append(frames[i].quantize(palette=pal,dither=Image.Dither.NONE))
 qq[0].save(P/(kind+'-comparison.gif'),save_all=True,append_images=qq[1:],duration=125,loop=0,optimize=False)
meta=dict(group='druid-dive-emerge8',sourceBytesIdentical=True,uniqueNewBodies=7,frame0Reuse='current idle body with S3; no new pose count',aliasSheets=['dive','emerge'],sourceSize=S.size,base2x=[3548,1774],candidateSize=A.size,sourceX=xs,sourceY=ys,candidateX=dx,candidateY=dy,padding=[128,192,128,32],runtimePPU=100,normal='silhouette bevel estimate',runtimeAdoption=0,pivot='original bottom-left pivot pixels*2+[128,32], normalize padded cell',logicalDraw='legacy dw/dh scaled by paddedCell/(2*sourceCell); dive aspect1.12 vs emerge9.3r independent',emergeOldCrop='legacy inset3px, edgefade9%; padded explicitrect adaptation needs actual Player gate',staffFixedScale=ps,staffVisibility='frames0..5 fixed S3, below source foot hidden by ground;6/7 hidden as original',preview='125ms perphase forward/reverse illustration, not state timing evidence',actualStateTicks={'dive':50,'erupt':40,'telePrep':40,'teleWarn':60},referenceDisplay='155px normalized study; actual Unity1x unverified',records=rr);(P/'metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8');(P/'technical-checks.json').write_text(json.dumps(rr,indent=2));print(dict(frames=8,bodyScale=bs,border=sum(r['border'] for r in rr),normal=sum(r['normalAlphaMismatch'] for r in rr),feet=[r['actualFoot']-r['targetFoot'] for r in rr]))
