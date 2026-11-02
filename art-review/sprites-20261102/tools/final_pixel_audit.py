from sprite_export import *
ss=json.loads((ROOT/'CHECKPOINT.json').read_text(encoding='utf8'))['selectedGroups'];rr=[]
for d in ss:
 P=ROOT/d;m=json.loads((P/'metadata.json').read_text(encoding='utf8'));a=np.array(Image.open(P/'atlas.png').convert('RGBA'));n=np.array(Image.open(P/'atlas.normal.png').convert('RGBA'));mask=a[:,:,3]>0;pad=np.pad(mask,1);near=np.zeros_like(mask,dtype='uint8')
 for dy in [-1,0,1]:
  for dx in [-1,0,1]:
   if dx or dy:near+=pad[1+dy:1+dy+mask.shape[0],1+dx:1+dx+mask.shape[1]]
 rec=m.get('records',m.get('frames',[]));rr.append(dict(group=d,atlas=list(Image.open(P/'atlas.png').size),normalAlphaMismatch=int(np.sum(a[:,:,3]!=n[:,:,3])),isolatedSingleAlphaPixels=int(np.sum(mask&(near==0))),partialAlphaPixels=int(np.sum((a[:,:,3]>0)&(a[:,:,3]<255))),records=len(rec),atlasSHA256=hashlib.sha256((P/'atlas.png').read_bytes()).hexdigest(),normalSHA256=hashlib.sha256((P/'atlas.normal.png').read_bytes()).hexdigest()))
(ROOT/'final-pixel-audit.json').write_text(json.dumps(dict(scope='selected31 atlas packages;30logical groups, not Player',runtimeAdoption=0,records=rr),indent=2),encoding='utf8');print(json.dumps(rr,ensure_ascii=False))
