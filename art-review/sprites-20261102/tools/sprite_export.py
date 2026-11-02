from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, json, sys, hashlib, math
from pathlib import Path
from collections import Counter, deque
ROOT=Path('G:/exoduser/tmp/design-review/20261102_sprites')
OLD=Path('G:/exoduser/tmp/design-review/20261031_hd2d_sprites')
DIRS=['south','south-west','west','north-west','north','north-east','east','south-east']
KO=['남','남서','서','북서','북','북동','동','남동']
FONT='C:/Windows/Fonts/malgun.ttf'
def box(im,t=64):
 a=np.array(im)[:,:,3]; yy,xx=np.where(a>=t)
 return (int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)) if len(xx) else (0,0,0,0)
def components(mask):
 h,w=mask.shape; visited=np.zeros_like(mask,bool); result=[]
 for y,x in zip(*np.where(mask)):
  if visited[y,x]:continue
  q=deque([(int(y),int(x))]); visited[y,x]=1; pts=[]
  while q:
   yy,xx=q.popleft();pts.append((yy,xx))
   for dy in [-1,0,1]:
    for dx in [-1,0,1]:
     ny,nx=yy+dy,xx+dx
     if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not visited[ny,nx]:visited[ny,nx]=1;q.append((ny,nx))
  result.append(pts)
 return result
def clean(im):
 a=np.array(im);mask=a[:,:,3]>=128
 comps=components(mask); removed=0
 for pts in comps:
  if len(pts)<=8:
   for y,x in pts:mask[y,x]=False;removed+=1
 # Palette reduction is without dithering. Small noise is suppressed before clustering.
 rgb=Image.fromarray(a[:,:,:3])
 rgb=rgb.quantize(colors=64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
 b=np.array(rgb);res=np.dstack([b,np.where(mask,255,0).astype('uint8')]);res[~mask]=0
 return Image.fromarray(res),removed

def normal(im):
 a=np.array(im);m=a[:,:,3]>=128;h,w=m.shape;dist=np.where(m,999,0).astype(float)
 for y in range(h):
  for x in range(w):
   if not m[y,x]:continue
   v=dist[y,x]
   if x==0 or y==0:v=1
   if x:v=min(v,dist[y,x-1]+1)
   if y:v=min(v,dist[y-1,x]+1)
   if x and y:v=min(v,dist[y-1,x-1]+1.414214)
   dist[y,x]=v
 for y in range(h-1,-1,-1):
  for x in range(w-1,-1,-1):
   if not m[y,x]:continue
   v=dist[y,x]
   if x==w-1 or y==h-1:v=min(v,1)
   if x+1<w:v=min(v,dist[y,x+1]+1)
   if y+1<h:v=min(v,dist[y+1,x]+1)
   if x+1<w and y+1<h:v=min(v,dist[y+1,x+1]+1.414214)
   dist[y,x]=v
 d=np.minimum(dist,4); yy,xx=np.gradient(d);n=np.dstack([-xx*.64,yy*.64,np.ones_like(d)]);n/=np.linalg.norm(n,axis=2)[:,:,None]
 b=np.rint((n*.5+.5)*255).astype('uint8');b[~m]=[128,128,255]
 return Image.fromarray(np.dstack([b,a[:,:,3]]))
def base_grid(cells,source,title,durations,outdir,labels):
 font=ImageFont.truetype(FONT,15);small=ImageFont.truetype(FONT,12);n=len(cells);rows=n;cw=544;rh=320
 board=Image.new('RGB',(cw,54+rh*rows),(22,25,31)); dr=ImageDraw.Draw(board);dr.text((12,5),title,font=font,fill='#e5dccb');dr.text((12,28),'원본 1x (48→96) | 리마스터 1x (96) | 리마스터 3x (288)',font=small,fill='#bcb8b0')
 frames=[]
 for i,(c,s) in enumerate(zip(cells,source)):
  f=Image.new('RGB',(cw,rh),(22,25,31));d=ImageDraw.Draw(f);d.text((12,3),labels[i],font=small,fill='#e5dccb')
  for im,x,y in [(s.resize((96,96),Image.Resampling.NEAREST),8,120),(c,120,120),(c.resize((288,288),Image.Resampling.NEAREST),240,24)]:f.paste(im,(x,y),im)
  board.paste(f,(0,54+i*rh));frames.append(f)
 outdir.mkdir(parents=True,exist_ok=True);board.save(outdir/'comparison-grid.png')
 frames[0].save(outdir/'comparison.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=False)
 for i,f in enumerate(frames):f.save(outdir/('motion-%02d.png'%i))
 return board

def idle():
 path=ROOT/(sys.argv[1] if len(sys.argv)>1 else 'warrior-idle8-r6'); raw=Image.open(path/'generated.png').convert('RGBA'); bboxes=[]; gs=[];ss=[]
 for d in range(8):
  x=(d%4)*raw.width//4;y=(d//4)*raw.height//2;g=raw.crop((x,y,x+raw.width//4,y+raw.height//2));gs.append(g);bboxes.append(box(g,128));ss.append(Image.open(Path('G:/exoduser/img/exoduser_warrior')/(DIRS[d]+'.png')).convert('RGBA').crop((0,0,48,48)))
 # A single shared scale for the whole eight-direction group.
 scale=min((box(s)[3]-box(s)[1])*2/(b[3]-b[1]) for s,b in zip(ss,bboxes))
 cells=[];receipts=[];atlas=Image.new('RGBA',(96*4,96*2));norm=atlas.copy()
 for d,(g,b,s) in enumerate(zip(gs,bboxes,ss)):
  sb=box(s);cropped=g.crop(b);res=cropped.resize((round(cropped.width*scale),round(cropped.height*scale)),Image.Resampling.NEAREST);res,removed=clean(res)
  dest=Image.new('RGBA',(96,96));x=round((sb[0]+sb[2])-res.width/2);y=sb[3]*2-res.height;dest.paste(res,(x,y));cells.append(dest);atlas.paste(dest,((d%4)*96,(d//4)*96));nm=normal(dest);norm.paste(nm,((d%4)*96,(d//4)*96));dest.save(path/(DIRS[d]+'.png'));nm.save(path/(DIRS[d]+'.normal.png'))
  receipts.append(dict(direction=DIRS[d],sourceBox=sb,rawBox=b,globalScale=scale,translate=[x,y],sourceFoot=sb[3],targetFoot=sb[3]*2,actualFoot=box(dest)[3],removedDetachedPixels=removed,alphaComponents=[len(p) for p in components(np.array(dest)[:,:,3]>0)],pivot=[48,48],pixelDensityFactor=2))
 atlas.save(path/'atlas.png');norm.save(path/'atlas.normal.png');base_grid(cells,ss,'전사 대기 8방향 — 후보 / 실게임 미검증',[300]*8,path,KO)
 meta=dict(group='warrior-idle8',cellSize=[96,96],atlasSize=atlas.size,directions=DIRS,frames=receipts,sourceFrameIndices=[0],aliases={'idle':[0,0],'hurt':[0],'die':[0],'block':[0]},aliasMeaning='기존 중립 재사용; 신규 피격·사망 동작 아님',normalMethod='실루엣 bevel 추정; 실제 재질/PBR 아님',runtimeAdoption=0,screenScaleEvidence='game.html CHAR_LIST fw/fh48; SpriteAnimator.draw f.w/f.h; _pScale=2. 원본48→96px/2x후보96→96px. Unity 실제 카메라 검수 별도.',dotVerdict='3x 직접 검수 전 미확인',alphaMismatch=int(np.sum(np.array(atlas)[:,:,3]!=np.array(norm)[:,:,3])))
 (path/'metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(meta,ensure_ascii=False))
if __name__=='__main__':idle()
