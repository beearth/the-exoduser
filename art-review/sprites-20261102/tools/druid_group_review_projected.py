from sprite_export import *
name=sys.argv[1];P=ROOT/name;m=json.loads((P/'metadata.json').read_text(encoding='utf8'));attack='attack' in name;L,T,R,B=m['padding'];source=Image.open('G:/exoduser-wt/codex-hd2d/unity/Assets/Exoduser/Resources/Art/boss/dark_druid/'+('attack' if attack else 'walk')+'.png').convert('RGBA');xs=[0,222,444,665,887];ys=[0,222,444,665,887,1109,1331,1552,1774];maxDW=max(round((m['candidateX'][c+1]-m['candidateX'][c])*102/(2*(xs[c+1]-xs[c]))) for c in range(4));maxDH=max(round((m['candidateY'][r+1]-m['candidateY'][r])*155/(2*(ys[r+1]-ys[r]))) for r in range(8));FW=math.ceil(max(1088,5*maxDW+80)/2)*2;FH=math.ceil(max(780,3*maxDH+120)/2)*2;font=ImageFont.truetype(FONT,15);small=ImageFont.truetype(FONT,12);allframes={};grips=Image.new('RGB',(960,8*260),(22,25,31));draw=ImageDraw.Draw(grips)
for di,d in enumerate(DIRS):
 allframes[di]=[]
 for k in range(4):
  q=Image.open(P/d/(str(k)+'.png')).convert('RGBA');o=source.crop((xs[k],ys[di],xs[k+1],ys[di+1]));ow,oh=o.size;dw,dh=round(q.width*102/(ow*2)),round(q.height*155/(oh*2));pc=q.resize((dw,dh),Image.Resampling.NEAREST);orig=Image.new('RGBA',pc.size);orig.paste(o.resize((102,155),Image.Resampling.NEAREST),(round(L*102/(ow*2)),round(T*155/(oh*2))));f=Image.new('RGB',(FW,FH),(22,25,31));dr=ImageDraw.Draw(f);dr.text((8,5),'드루이드 '+('공격' if attack else '보행')+' '+KO[di]+' '+str(k)+' / 원본1x | 후보1x | 후보3x',font=font,fill='white');dr.text((8,28),'155px 정규화 검토목표·150ms/key / 실제 Unity 화면1x·조명·접지 미검증',font=small,fill='#bbb8b0')
  for im,x,y in [(orig,8,280),(pc,maxDW+32,280),(pc.resize((dw*3,dh*3),Image.Resampling.NEAREST),maxDW*2+64,60)]:f.paste(im,(x,y),im)
  f.save(P/d/('motion-%d.png'%k));allframes[di].append(f);r=m['records'][di*4+k];gx,gy=r['destinationGrip'];crop=q.crop((gx-40,gy-40,gx+40,gy+40)).resize((240,240),Image.Resampling.NEAREST);grips.paste(crop,(k*240,di*260+20),crop);draw.text((k*240+3,di*260),d+' '+str(k),font=small,fill='white')
grips.save(P/'grips32-native-3x.png')
for di,d in enumerate(DIRS):
 qs=[Image.open(P/d/(str(k)+'.png')).convert('RGBA') for k in range(4)];ns=[Image.open(P/d/(str(k)+'.normal.png')).convert('RGBA') for k in range(4)];nat=Image.new('RGBA',(sum(q.width for q in qs),qs[0].height));nor=nat.copy();strip=Image.new('RGB',(maxDW*3*4,maxDH*3),(22,25,31));off=0
 for k,(q,n) in enumerate(zip(qs,ns)):
  nat.paste(q,(off,0));nor.paste(n,(off,0));off+=q.width;ow=xs[k+1]-xs[k];oh=ys[di+1]-ys[di];dw=round(q.width*102/(ow*2));dh=round(q.height*155/(oh*2));z=q.resize((dw*3,dh*3),Image.Resampling.NEAREST);strip.paste(z,(k*maxDW*3+round((maxDW-dw)*1.5),0),z)
 nat.save(P/d/'keys4-native.png');nor.save(P/d/'keys4.normal.png');strip.save(P/d/'keys4-3x.png')
for page in range(2):
 ids=list(range(page*4,page*4+4));board=Image.new('RGB',(FW*4,FH*4),(22,25,31));motions=[]
 for row,di in enumerate(ids):
  for k,f in enumerate(allframes[di]):board.paste(f,(k*FW,row*FH))
 for k in range(4):
  f=Image.new('RGB',(FW*2,FH*2),(22,25,31))
  for j,di in enumerate(ids):f.paste(allframes[di][k],(j%2*FW,j//2*FH))
  f.save(P/('page-%d-motion-%02d.png'%(page+1,k)));motions.append(f)
 board.save(P/('comparison-page-%d-grid.png'%(page+1)));pal=board.quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);qq=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in motions];qq[0].save(P/('comparison-page-%d.gif'%(page+1)),save_all=True,append_images=qq[1:],duration=150,loop=0,optimize=False)
print(name+' review pages2, keys32, grips32')
