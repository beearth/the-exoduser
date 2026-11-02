from sprite_export import *
P=ROOT/'enemy-headless_knight-attack8-r30';I=ROOT/'enemy-headless_knight-idle8-r30';M=json.loads((I/'metadata.json').read_text(encoding='utf8'));G=Image.open(I/'generated.png').convert('RGBA');native=M['directions'];out={};rec=[];bd=Image.new('RGB',(900,1200),(22,25,31));dr=ImageDraw.Draw(bd);fo=ImageFont.truetype(FONT,13)
def neck(im):
 a=np.array(im);r=a[:,:,0].astype(float);g=a[:,:,1].astype(float);b=a[:,:,2].astype(float);mask=(a[:,:,3]>=128)&(r>g*1.85)&(r>b*1.35)&(r>50);mask[:,:round(im.width*.35)]=False;mask[:,round(im.width*.68):]=False;cc=sorted(components(mask),key=lambda q:min(y for y,x in q));cc=[q for q in cc if len(q)>12]
 if not cc:raise ValueError('no neck')
 q=cc[0];return min(y for y,x in q)
for i,d in enumerate(native):
 gi=G.crop((round(i%4*G.width/4),round(i//4*G.height/2),round((i%4+1)*G.width/4),round((i//4+1)*G.height/2)));W=Image.open(P/('generated-'+('A' if i<4 else 'B')+'.png')).convert('RGBA');gw=W.crop((0,round(i%4*W.height/4),round(W.width/4),round((i%4+1)*W.height/4)));ny0=neck(gi);ny1=neck(gw);h0=box(gi,128)[3]-ny0;h1=box(gw,128)[3]-ny1;scale=h0*M['records'][i]['cameraScale']/h1;out[d]=scale;rec.append(dict(direction=d,idleNeckY=ny0,idleFoot=box(gi,128)[3],motionNeckY=ny1,motionFoot=box(gw,128)[3],scale=scale));x=i%4*225;y=i//4*600
 for im,j,ny in [(gi,0,ny0),(gw,1,ny1)]:
  q=im.copy();dd=ImageDraw.Draw(q);dd.line((0,ny,q.width,ny),fill=(0,255,0,255),width=2);q.thumbnail((220,270),Image.Resampling.NEAREST);bd.paste(q,(x,y+j*290+20),q)
 dr.text((x+4,y),d+' '+str(round(scale,4)),font=fo,fill='white')
bd.save(P/'body-camera-landmarks.png');cal=dict(reason='neck-stump top to foot distance matched to selected idle; one constant per direction across4keys, excludes raised cleaver from scale measurement',scales=out,measurements=rec);(P/'camera-calibration.json').write_text(json.dumps(cal,ensure_ascii=False,indent=2),encoding='utf8');print(cal)
