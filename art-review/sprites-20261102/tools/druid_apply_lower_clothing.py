from sprite_export import *
P=ROOT/'druid-bodies8-r19';base=Image.open(P/'body8-corrected-before-hem.png').convert('RGBA');gen=Image.open(P/'lower-clothing.generated.png').convert('RGBA');targets=json.loads((P/'hem-targets-v3.json').read_text());dst=base.copy();records=[]
for i,t in enumerate(targets):
 old=base.crop((i%4*362,i//4*543,(i%4+1)*362,(i//4+1)*543));g=gen.crop((round(i%4*gen.width/4),round(i//4*gen.height/2),round((i%4+1)*gen.width/4),round((i//4+1)*gen.height/2)));g=g.resize((round(g.width*543/g.height),543),Image.Resampling.BOX);pad=Image.new('RGBA',(362,543));pad.paste(g,((362-g.width)//2,0));g=pad;a=np.array(old);b=np.array(g);a1=a.copy();start,end=t['editRange'];a1[start:end]=b[start:end]
 # Blend RGB for the first8 rows only where both versions are opaque; alpha/geometry below is the generated edit.
 for yy in range(start,min(start+8,end)):
  w=(yy-start+1)/8;both=(a[yy,:,3]>=128)&(b[yy,:,3]>=128);a1[yy,both,:3]=np.rint(a[yy,both,:3]*(1-w)+b[yy,both,:3]*w).astype('uint8')
 mask=np.zeros(a.shape[:2],bool);mask[start:end]=True;outside=int(np.sum(np.any(a1!=a,axis=2)&~mask));feetChanged=int(np.sum(np.any(a1[end:]!=a[end:],axis=2)));c=Image.fromarray(a1);dst.paste(c,(i%4*362,i//4*543));records.append(dict(direction=t['direction'],editRange=[start,end],outsideEditRGBA=outside,protectedBootRGBA=feetChanged,changedPixels=int(np.sum(np.any(a1!=a,axis=2)))))
dst.save(P/'body8-lower-clothing-r22.png');(P/'lower-clothing-selection-receipt.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(records,ensure_ascii=False))
