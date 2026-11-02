from master_south_r38 import *
import shutil
DIRS=['south','south-west','west','north-west','north','north-east','east','south-east']
def tracked(raw):
 a=np.array(raw);r,g,b=[a[:,:,i].astype(float) for i in range(3)];valid=a[:,:,3]>=128;mag=valid&(r>110)&(b>100)&(g<np.minimum(r,b)*.60);cy=valid&(g>120)&(b>120)&(r<np.minimum(g,b)*.55)
 blue=valid&(b>160)&(r<100)&(g<150);orange=valid&(r>180)&(g>65)&(g<165)&(b<80);tracked.lastFeet={}
 for key,mm in [('left',blue),('right',orange)]:
  pts=sorted(components(mm),key=len,reverse=True)
  if pts:
   yy,xx=np.array(pts[0]).T;tracked.lastFeet[key]=[float((xx.min()+xx.max())/2),float((yy.min()+yy.max())/2)]
 a[blue|orange,:3]=[95,73,48]
 mc=sorted(components(mag),key=len,reverse=True)
 if not mc:raise ValueError('LEFT hand magenta tracking missing')
 hand=mc[0];hy=np.array([z[0] for z in hand]);hx=np.array([z[1] for z in hand]);gr=[float((hx.min()+hx.max())/2),float((hy.min()+hy.max())/2)];a[mag,:3]=[115,116,94];glyphs=[];feature=None;bb=box(raw)
 for pts in sorted(components(cy),key=len,reverse=True):
  if len(pts)<4:continue
  yy=np.array([z[0] for z in pts]);xx=np.array([z[1] for z in pts]);x1,x2=int(xx.min()),int(xx.max()+1);y1,y2=int(yy.min()),int(yy.max()+1);head=(y1+y2)/2<bb[1]+(bb[3]-bb[1])*.45;fill=[185,173,144] if head else [38,33,29];a[yy,xx,:3]=fill;glyphs.append(dict(box=[x1,y1,x2,y2],surface='forehead' if head else 'cloth'))
  if head:feature=[max(0,round((x1+x2)/2-(y2-y1)*1.2)),max(0,y1-round((y2-y1)*.1)),min(raw.width,round((x1+x2)/2+(y2-y1)*1.2)),min(raw.height,y1+round((y2-y1)*5.4))]
 a[~valid]=0;a[valid,3]=255
 if feature:
  x1,y1,x2,y2=feature;rr=a[y1:y2,x1:x2,:3].astype(float);v=np.max(rr,axis=2);ch=v-np.min(rr,axis=2);Y,X=np.indices(v.shape);first=[v for v in glyphs if v['surface']=='forehead'][0]['box'];gh=first[3]-first[1];cx=(first[0]+first[2])/2;beard=(Y+y1>first[1]+gh*2.0)&(Y+y1<first[1]+gh*5.3)&(abs(X+x1-cx)<gh*.85)&(ch<32)&(v>80);tones=np.array([[111,115,107],[145,150,138],[178,183,168],[204,207,191]]);idx=np.clip(((v-80)/35).astype(int),0,3);reg=a[y1:y2,x1:x2];reg[beard,:3]=tones[idx[beard]];a[y1:y2,x1:x2]=reg
 q,removed=alphaClean(Image.fromarray(a));return q,gr,mag,glyphs,feature,removed
def stamp(im,glyphs,bb,sc,mode='all'):
 for rec in glyphs:
  x1,y1,x2,y2=rec['box'];sz=(max(2,round((x2-x1)*sc)),max(3,round((y2-y1)*sc)));pos=(round((x1-bb[0])*sc),round((y1-bb[1])*sc));color=(73,61,44) if rec['surface']=='forehead' else (18,17,15);im.paste(color,(*pos,pos[0]+sz[0],pos[1]+sz[1]),glyph().resize(sz,Image.Resampling.NEAREST))
def bodyPrepare(raw,scale=None,targetHeight=None):
 q,gr,hand,gs,ft,removed=tracked(raw);feet=tracked.lastFeet.copy();bb=box(q)
 if ft is None:
  aa=np.array(q);v=np.max(aa[:,:,:3],axis=2);ch=v-np.min(aa[:,:,:3],axis=2);yy,xx=np.indices(v.shape);mm=(aa[:,:,3]>0)&(ch<30)&(v>140)&(yy>bb[1]+(bb[3]-bb[1])*.22)&(yy<bb[1]+(bb[3]-bb[1])*.59);cc=sorted(components(mm),key=len,reverse=True)
  if cc and len(cc[0])>=16:
   yy,xx=np.array(cc[0]).T;hh=max(12,yy.max()-yy.min());ft=[max(0,int(xx.min()-hh*.4)),max(0,int(yy.min()-hh*.5)),min(raw.width,int(xx.max()+hh*.4+1)),min(raw.height,int(yy.max()+hh*.1+1))]
 sc=scale if scale is not None else targetHeight/(bb[3]-bb[1]);orig=q.crop(bb).resize((round((bb[2]-bb[0])*sc),round((bb[3]-bb[1])*sc)),Image.Resampling.BOX);orig,_=alphaClean(orig);em0=glowMask(q);yy,xx=np.indices(em0.shape);em0&=(yy>bb[1]+(bb[3]-bb[1])*.19)&(yy<bb[1]+(bb[3]-bb[1])*.58)&(abs(xx-(bb[0]+bb[2])/2)<(bb[2]-bb[0])*.24);ee=Image.fromarray(np.uint8(em0)*255).crop(bb).resize(orig.size,Image.Resampling.NEAREST);body=material(orig,np.array(ee)>0)
 if ft:
  x1,y1,x2,y2=ft;roi=[max(0,round((x1-bb[0])*sc)),max(0,round((y1-bb[1])*sc)),min(body.width,round((x2-bb[0])*sc)),min(body.height,round((y2-bb[1])*sc))];oa=np.array(orig);ba=np.array(body);sx,sy,ex,ey=roi;reg=ba[sy:ey,sx:ex];fine=oa[sy:ey,sx:ex];mask=(reg[:,:,3]>0)&(fine[:,:,3]>0);reg[mask,:3]=fine[mask,:3];ba[sy:ey,sx:ex]=reg;body=Image.fromarray(ba)
 stamp(body,gs,bb,sc);hand=Image.fromarray(np.uint8(hand)*255).crop(bb).resize(body.size,Image.Resampling.NEAREST);return body,ee,hand,[(gr[0]-bb[0])*sc,(gr[1]-bb[1])*sc],dict(rawBox=bb,bodyScale=sc,gripRaw=gr,glyphs=gs,faceProtected=ft,footMarkers=feet,removed=removed)
def setupKit(factor):
 k=Image.open(r'G:/exoduser/tmp/design-review/20261031_hd2d_sprites/candidates/dark-druid-canonical-staff-r175-rgb-alpha-exact.png').convert('RGBA');em=glowMask(k,(410,170,630,390));k,_=alphaClean(k);k=material(k,em);ss=.2422381950683837*factor;size=(round(k.width*ss),round(k.height*ss));return k.resize(size,Image.Resampling.BOX),Image.fromarray(np.uint8(em)*255).resize(size,Image.Resampling.NEAREST),[532*ss,953*ss],ss
def place(body,ee,hand,gr,o,pad,kit,kem,sg,ang,projection=1,front=False):
 L,T,R,B=pad;W=o.width*2+L+R;H=o.height*2+T+B;ob=box(o);oa=np.array(o);yy,xx=np.where(oa[max(0,ob[3]-round(o.height*.12)):ob[3],:,3]>=200);root=float(xx.min()+xx.max())+L;ba=np.array(body);bb=box(body);yy,xx=np.where(ba[max(0,bb[3]-round(body.height*.10)):bb[3],:,3]>0);fx=(xx.min()+xx.max())/2;xy=(round(root-fx),ob[3]*2+T-bb[3]);B0=Image.new('RGBA',(W,H));B0.paste(body,xy);E0=Image.new('L',(W,H));E0.paste(ee,xy);HM=Image.new('L',(W,H));HM.paste(hand,xy);dg=[round(gr[0])+xy[0],round(gr[1])+xy[1]];c=math.cos(ang);s=math.sin(ang);cf=(c,s,sg[0]-c*dg[0]-s*dg[1],-s,c,sg[1]+s*dg[0]-c*dg[1]);pr=kit.transform((W,H),Image.Transform.AFFINE,cf,Image.Resampling.BICUBIC);pe=kem.transform((W,H),Image.Transform.AFFINE,cf,Image.Resampling.NEAREST);ac=Image.alpha_composite(B0,pr) if front else Image.alpha_composite(pr,B0)
 if front:ac.paste(B0,(0,0),HM)
 ba=np.array(B0)[:,:,3];e=np.maximum(np.where(ba>=128,np.array(E0),0),np.where(ba<128,np.array(pe),0))
 if front:e=np.maximum(np.array(pe),np.array(E0))
 a=np.array(ac);a[a[:,:,3]<128]=0;a[a[:,:,3]>=128,3]=255;ac=Image.fromarray(a);ac,_=alphaClean(ac);axis=o.width+L;f=projection
 if f!=1:
  cf=(1/f,0,axis-axis/f,0,1,0);ac=ac.transform((W,H),Image.Transform.AFFINE,cf,Image.Resampling.NEAREST);e=np.array(Image.fromarray(e.astype('uint8')).transform((W,H),Image.Transform.AFFINE,cf,Image.Resampling.NEAREST));dg[0]=round(axis+f*(dg[0]-axis))
 target=ob[3]*2+T;shift=target-box(ac)[3]
 if shift:
  z=Image.new('RGBA',ac.size);z.paste(ac,(0,shift));ac=z;z=Image.new('L',ac.size);z.paste(Image.fromarray(e.astype('uint8')),(0,shift));e=np.array(z);dg[1]+=shift
 a=np.array(ac);e[a[:,:,3]==0]=0;em=np.zeros_like(a);em[:,:,:3]=GLOW;em[:,:,3]=e;em[e==0]=0
 rec=dict(sourceFoot=ob[3],targetFoot=target,actualFoot=box(ac)[3],bodyTranslation=xy,destinationGrip=dg,staffAngle=ang,projectionX=f,YRegistrationCorrection=shift,border=int(np.sum(np.concatenate([a[0,:,3],a[-1,:,3],a[:,0,3],a[:,-1,3]])>0)),components=[len(z) for z in components(a[:,:,3]>0)],normalAlphaMismatch=0)
 return ac,nf(ac),Image.fromarray(em),rec
def review(ac,o,old,label,pad,baseW):
 L,T,R,B=pad;dw=round(ac.width*baseW/(o.width*2));dh=round(ac.height*155/(o.height*2));pc=ac.resize((dw,dh),Image.Resampling.NEAREST);orig=Image.new('RGBA',pc.size);orig.paste(o.resize((round(baseW),155),Image.Resampling.NEAREST),(round(L*baseW/(o.width*2)),round(T*155/(o.height*2))));oldpc=old.resize(pc.size,Image.Resampling.NEAREST);FW=max(1088,6*dw+80);FH=max(700,dh*3+110);f=Image.new('RGB',(math.ceil(FW/2)*2,math.ceil(FH/2)*2),(22,25,31));dr=ImageDraw.Draw(f);font=ImageFont.truetype(r'C:/Windows/Fonts/malgun.ttf',15);dr.text((8,6),'드루이드 LOCK 재교정 '+label+' / 원본1x | 기존1x | 교정1x | 교정3x',font=font,fill='white');dr.text((8,30),'155px 정규화·실제Player1x/빛/접지 미검증; D2/D3/황록/마른몸/긴머리',font=font,fill='#bdb7af')
 for q,x,y in [(orig,8,260),(oldpc,dw+24,260),(pc,dw*2+40,260),(pc.resize((dw*3,dh*3),Image.Resampling.NEAREST),dw*3+64,70)]:f.paste(q,(x,y),q)
 zoom=Image.new('RGB',(dw*3,dh*3),(22,25,31));zoom.paste(pc.resize((dw*3,dh*3),Image.Resampling.NEAREST),(0,0),pc.resize((dw*3,dh*3),Image.Resampling.NEAREST));return f,zoom,pc

# Non-face neutral highlights remain dark feather material; ash-white beard is protected separately.
def material(im,glow):
 a=np.array(im);m=a[:,:,3]>=128;small=im.convert('RGB').resize((max(1,im.width//6),max(1,im.height//6)),Image.Resampling.BOX).filter(ImageFilter.MedianFilter(3));rgb=np.array(small.resize(im.size,Image.Resampling.NEAREST));p=rgb.astype(float);r,g,b=[p[:,:,i] for i in range(3)];v=np.max(p,axis=2);ch=v-np.min(p,axis=2);grey=(ch<30)&(v>75);bone=(r>125)&(g>105)&(b>75)&(g>b*1.07)&~grey;dark=(v<80)&(ch<32)&~grey&~bone;rest=~(grey|bone|dark)
 pals=[[[28,32,36],[44,48,49],[55,59,59],[65,67,63]],[[104,94,73],[143,131,105],[185,173,144],[209,197,168]],[[18,22,25],[28,32,36],[44,48,49],[65,67,63]],[[35,29,23],[57,45,33],[78,60,42],[101,77,51],[127,101,74],[150,125,94]]];out=np.zeros_like(rgb)
 for mm,pp in zip([grey,bone,dark,rest],pals):
  vv=rgb[mm].astype(float);pal=np.array(pp);dist=np.sum((vv[:,None,:]-pal[None,:,:])**2,axis=2);out[mm]=pal[np.argmin(dist,axis=1)]
 out[glow]=GLOW;out[~m]=0;return Image.fromarray(np.dstack([out,np.where(m,255,0).astype('uint8')]))
