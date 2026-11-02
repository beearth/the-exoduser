from PIL import Image,ImageDraw,ImageFont,ImageFilter
from pathlib import Path
import numpy as np,sys,json,math,colorsys
sys.path.insert(0,r'G:/exoduser/tmp/design-review/20261102_sprites/tools')
from sprite_export import components,box
P=Path(r'I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites/druid-lock-retouch-20261103')
O=P.parent;GLOW=np.array([158,168,58])
def nf(im):
 a=np.array(im);m=a[:,:,3]>=128;l=Image.fromarray(np.uint8(m)*255);ds=np.zeros(m.shape,float)
 for _ in range(4):ds+=np.array(l)>0;l=l.filter(ImageFilter.MinFilter(3))
 yy,xx=np.gradient(ds);v=np.dstack([-xx*.64,yy*.64,np.ones_like(ds)]);v/=np.linalg.norm(v,axis=2)[:,:,None];rgb=np.rint((v*.5+.5)*255).astype('uint8');rgb[~m]=[128,128,255];return Image.fromarray(np.dstack([rgb,a[:,:,3]]))
def alphaClean(im):
 a=np.array(im);m=a[:,:,3]>=128;cc=sorted(components(m),key=len,reverse=True);removed=0
 for z in cc[1:]:
  if len(z)<=64:
   for y,x in z:m[y,x]=False;removed+=1
 a[~m]=0;a[m,3]=255;return Image.fromarray(a),removed
def material(im,glow):
 a=np.array(im);m=a[:,:,3]>0;pix=a[:,:,:3];q=np.array(im.convert('RGB').quantize(colors=96,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB'));q[glow]=GLOW;q[~m]=0;return Image.fromarray(np.dstack([q,a[:,:,3]]))
def glowMask(im,roi=None):
 a=np.array(im);r,g,b=[a[:,:,i].astype(float) for i in range(3)];m=(a[:,:,3]>=128)&(r>75)&(g>r*.85)&(g>b*1.5)&(r>b*1.4)
 if roi:
  z=np.zeros(m.shape,bool);x1,y1,x2,y2=roi;z[y1:y2,x1:x2]=True;m&=z
 return m
def glyph():
 s=np.array(Image.open(r'G:/exoduser/tmp/design-review/20261031_hd2d_sprites/source/druid-canonical-forehead-sigil-reference.png').convert('RGBA'));m=np.zeros(s.shape[:2],bool);m[6:47,5:25]=(np.max(s[6:47,5:25,:3],axis=2)<105)&(s[6:47,5:25,3]>0);ys,xs=np.where(m);return Image.fromarray(np.uint8(m)*255).crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
if __name__=='__main__':
 src=P/'south-master-r36-blank.png';g=Image.open(src).convert('RGBA');mk=glyph();g.paste((73,61,44),(494,307,530,371),mk.resize((36,64),Image.Resampling.NEAREST));g.paste((50,44,35),(489,846,537,936),mk.resize((48,90),Image.Resampling.NEAREST));g.save(P/'master-body-selected.png');g,rm=alphaClean(g);bb=box(g);factor=1240/444;bh=422*factor;sc=bh/(bb[3]-bb[1]);body=g.crop(bb).resize((round((bb[2]-bb[0])*sc),round((bb[3]-bb[1])*sc)),Image.Resampling.BOX);body,_=alphaClean(body)
 rawGlow=glowMask(g,(450,350,580,725));bg=Image.fromarray(np.uint8(rawGlow)*255).crop(bb).resize(body.size,Image.Resampling.NEAREST);body=material(body,np.array(bg)>0)
 src0=Image.open(r'G:/exoduser-wt/codex-hd2d/unity/Assets/Exoduser/Resources/Art/boss/dark_druid/base8_v3.png').convert('RGBA').crop((0,0,414,620));sb=box(src0);oa=np.array(src0);ys,xs=np.where(oa[max(0,sb[3]-72):sb[3],:,3]>=200);root=(xs.min()+xs.max())+160;ba=np.array(body);b=box(body);ys,xs=np.where(ba[max(0,b[3]-100):b[3],:,3]>=128);fx=(xs.min()+xs.max())/2;xy=(round(root-fx),sb[3]*2+192-b[3]);B=Image.new('RGBA',(1148,1464));B.paste(body,xy);E=Image.new('L',B.size);E.paste(bg,xy);gr=[round((658-bb[0])*sc)+xy[0],round((1042-bb[1])*sc)+xy[1]]
 kit=Image.open(r'G:/exoduser/tmp/design-review/20261031_hd2d_sprites/candidates/dark-druid-canonical-staff-r175-rgb-alpha-exact.png').convert('RGBA');kg=glowMask(kit,(410,170,630,390));kit,_=alphaClean(kit);kit=material(kit,kg);ss=.2422381950683837*factor;pg=[532*ss,953*ss];pr=kit.resize((round(kit.width*ss),round(kit.height*ss)),Image.Resampling.BOX);pe=Image.fromarray(np.uint8(kg)*255).resize(pr.size,Image.Resampling.NEAREST);ang=.10;c=math.cos(ang);s=math.sin(ang);cf=(c,s,pg[0]-c*gr[0]-s*gr[1],-s,c,pg[1]+s*gr[0]-c*gr[1]);pr=pr.transform(B.size,Image.Transform.AFFINE,cf,Image.Resampling.BICUBIC);pe=pe.transform(B.size,Image.Transform.AFFINE,cf,Image.Resampling.NEAREST);ac=Image.alpha_composite(pr,B);ac,rm2=alphaClean(ac);a=np.array(ac);em=np.maximum(np.array(pe),np.array(E));em[a[:,:,3]==0]=0;ac=material(ac,em>0);a=np.array(ac);er=np.zeros_like(a);er[:,:,:3]=GLOW;er[:,:,3]=em;er[em==0]=0;D=P/'south-idle-r36';D.mkdir(exist_ok=True);ac.save(D/'south.png');nf(ac).save(D/'south.normal.png');Image.fromarray(er).save(D/'south.emission.png');B.save(D/'south.body.png');pr.save(D/'south.staff.png')
 pc=ac.resize((144,183),Image.Resampling.NEAREST);orig=Image.new('RGBA',pc.size);orig.paste(src0.resize((104,155),Image.Resampling.NEAREST),(20,24));old=Image.open(O/'druid-idle8-r23-kit-hem/south.png').convert('RGBA').resize((144,183),Image.Resampling.NEAREST);f=Image.new('RGB',(1024,650),(22,25,31));dr=ImageDraw.Draw(f);font=ImageFont.truetype(r'C:/Windows/Fonts/malgun.ttf',16);dr.text((10,8),'드루이드 LOCK 재교정 / 원본1x | 기존후보1x | 교정1x | 교정3x',font=font,fill='white');dr.text((10,34),'155px 정규화 비교·실제Player 미검증 / D2·D3·발광·체형·머리',font=font,fill='#c7c1b6')
 for q,x,y in [(orig,8,240),(old,168,240),(pc,328,240),(pc.resize((432,549),Image.Resampling.NEAREST),500,80)]:f.paste(q,(x,y),q)
 f.save(D/'comparison-1x-3x.png');pc.save(D/'candidate-1x.png');pc.resize((432,549),Image.Resampling.NEAREST).save(D/'candidate-3x.png');m=dict(group='south-idle-lock-retouch-r36',sourceBody=src.name,bodyBox=bb,bodyScale=sc,bodyNativeHeight=422,sourceToGroupFactor=factor,bodyTranslation=xy,gripRaw=[658,1042],destinationGrip=gr,staffFixedNativeScale=.2422381950683837,staffScale=ss,staffAngle=ang,sourceFoot=sb[3],targetFoot=sb[3]*2+192,actualFoot=box(ac)[3],normalAlphaMismatch=int(np.sum(np.array(nf(ac))[:,:,3]!=a[:,:,3])),glowRGB=GLOW.tolist(),glowHue=colorsys.rgb_to_hsv(*(GLOW/255))[0]*360,bodyEmissionPixels=int(np.sum(np.array(E)>0)),staffEmissionPixels=int(np.sum(np.array(pe)>0)),partialAlpha=int(np.sum((a[:,:,3]>0)&(a[:,:,3]<255))),components=[len(z) for z in components(a[:,:,3]>0)],runtimePPU=100,runtimeAdoption=0,actualPlayerVerified=False)
 (D/'metadata.json').write_text(json.dumps(m,indent=2),encoding='utf8');print(json.dumps(m))
