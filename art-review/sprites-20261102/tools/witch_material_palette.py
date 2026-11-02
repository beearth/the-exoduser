from sprite_export import *
P=ROOT/'enemy-gut_witch-idle8-r30/material-palette.json'
def groups(a):
 r=a[:,0].astype(float);g=a[:,1].astype(float);b=a[:,2].astype(float);v=(b>r*1.15)&(b>g*1.6)&(b>65);red=(r>b*1.25)&(r>g*1.25)&~v;bone=(r>100)&(g>80)&((np.max(a,axis=1)-np.min(a,axis=1))<65)&~v&~red;return [v,red,bone,~(v|red|bone)]
def palette():
 if P.exists():return json.loads(P.read_text(encoding='utf8'))['groups']
 src=ROOT/'enemy-gut_witch-idle8-r30/generated.png';a=np.array(Image.open(src).convert('RGBA'));pix=a[:,:,:3][a[:,:,3]>=128];gg=[]
 for mask,n in zip(groups(pix),[8,12,12,24]):
  vals=pix[mask];im=Image.fromarray(vals.reshape((-1,1,3)));q=im.quantize(colors=n,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);pp=q.getpalette();gg.append([pp[i*3:i*3+3] for i in range(n)])
 P.write_text(json.dumps(dict(source=str(src),sourceSHA256=hashlib.sha256(src.read_bytes()).hexdigest(),groupMeaning=['violetorb','redentrails','bone','robeandskin'],groups=gg,dither=False),ensure_ascii=False,indent=2),encoding='utf8');return gg
PAL=None
def materialClean(im):
 global PAL
 if PAL is None:PAL=palette()
 a=np.array(im);mask=a[:,:,3]>=128;removed=0
 for pts in components(mask):
  if len(pts)<=8:
   for y,x in pts:mask[y,x]=False;removed+=1
 pix=a[:,:,:3][mask];out=pix.copy()
 for mm,colors in zip(groups(pix),PAL):
  if not np.any(mm):continue
  vv=pix[mm].astype(np.int32);pp=np.array(colors,dtype=np.int32);dist=np.sum((vv[:,None,:]-pp[None,:,:])**2,axis=2);out[mm]=pp[np.argmin(dist,axis=1)]
 rgb=np.zeros_like(a[:,:,:3]);rgb[mask]=out;return Image.fromarray(np.dstack([rgb,np.where(mask,255,0).astype('uint8')])),removed
