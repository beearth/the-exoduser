from retouch_common import *
out=P/'idle-raw';out.mkdir(exist_ok=True);receipt=[]
for letter in ['A','B']:
 g=Image.open(P/('idle-'+letter+'-generated.png')).convert('RGBA');aa=np.array(g);cc=sorted(components(aa[:,:,3]>=128),key=len,reverse=True)[:4];items=[]
 for pts in cc:
  yy,xx=np.array(pts).T;items.append(dict(b=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)],pixels=len(pts),cy=float(np.mean(yy)),cx=float(np.mean(xx))))
 items=sorted(items,key=lambda r:r['cy']);items=sorted(items[:2],key=lambda r:r['cx'])+sorted(items[2:],key=lambda r:r['cx'])
 for j,it in enumerate(items):
  di=j+(0 if letter=='A' else 4);d=DIRS[di];b=it['b'];b=[max(0,b[0]-12),max(0,b[1]-12),min(g.width,b[2]+12),min(g.height,b[3]+12)];q=g.crop(b);q.save(out/(d+'.png'));it.update(direction=d,crop=b,file=str(out/(d+'.png')));receipt.append(it)
(P/'idle-extraction.json').write_text(json.dumps(receipt,indent=2));print(json.dumps(receipt))
