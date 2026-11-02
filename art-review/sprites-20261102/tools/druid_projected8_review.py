from sprite_export import *
kind=sys.argv[1];P=ROOT/('druid-'+kind+'8-r29-projected');m=json.loads((P/'metadata.json').read_text(encoding='utf8'));S=Image.open('G:/exoduser-wt/codex-hd2d/unity/Assets/Exoduser/Resources/Art/boss/dark_druid/'+kind+'.png').convert('RGBA');xs=m['sourceX'];ys=m['sourceY'];L,T,R,B=m['padding'];frames=[];font=ImageFont.truetype(FONT,15);maxDW=0;maxDH=0;views=[];gripbd=Image.new('RGB',(360*3,380*2),(22,25,31));gdr=ImageDraw.Draw(gripbd);gcnt=0
for i,r in enumerate(m['records']):
 col=i if kind=='transform' else i%4;row=0 if kind=='transform' else i//4;ow=xs[col+1]-xs[col];oh=ys[row+1]-ys[row];q=Image.open(P/(DIRS[i]+'.png' if kind=='beast' else 'frame-'+str(i)+'.png')).convert('RGBA');o=S.crop((xs[col],ys[row],xs[col+1],ys[row+1]));lw=155*1.12*ow/oh if kind in ['beast','dive','transform'] else 155*9.3/14.1;dw=round(q.width*lw/(ow*2));dh=round(q.height*155/(oh*2));maxDW=max(maxDW,dw);maxDH=max(maxDH,dh);pc=q.resize((dw,dh),Image.Resampling.NEAREST);orig=Image.new('RGBA',pc.size);orig.paste(o.resize((round(lw),155),Image.Resampling.NEAREST),(round(L*lw/(ow*2)),round(T*155/(oh*2))));views.append((orig,pc));gxgy=r.get('destinationGrip')
 if gxgy:
  gx,gy=gxgy;gg=q.crop((gx-60,gy-60,gx+60,gy+60)).resize((360,360),Image.Resampling.NEAREST);gripbd.paste(gg,(gcnt%3*360,gcnt//3*380+20),gg);gdr.text((gcnt%3*360+4,gcnt//3*380),str(i),font=font,fill='white');gcnt+=1
FW=math.ceil(max(1088,maxDW*5+80)/2)*2;FH=math.ceil(max(700,maxDH*3+120)/2)*2
for i,(orig,pc) in enumerate(views):
 f=Image.new('RGB',(FW,FH),(22,25,31));dr=ImageDraw.Draw(f);dr.text((8,5),'드루이드 '+kind+' '+str(i)+' / 원본1x | 후보1x | 후보3x',font=font,fill='white');dr.text((8,28),'155px 정규화 검토목표 / Native 픽셀배율 역보정·실제Player 미검증',font=font,fill='#bbb8b0')
 for im,x,y in [(orig,8,280),(pc,maxDW+32,280),(pc.resize((pc.width*3,pc.height*3),Image.Resampling.NEAREST),maxDW*2+64,60)]:f.paste(im,(x,y),im)
 f.save(P/('phase-%02d.png'%i));frames.append(f);zoom=pc.resize((pc.width*3,pc.height*3),Image.Resampling.NEAREST);back=Image.new('RGB',zoom.size,(22,25,31));back.paste(zoom,(0,0),zoom);back.save(P/('phase-%02d-3x.png'%i))
bd=Image.new('RGB',(FW,FH*8))
for i,f in enumerate(frames):bd.paste(f,(0,FH*i))
bd.save(P/'comparison-grid.png');seq=list(range(8)) if kind in ['beast','transform'] else list(range(8))+list(range(7,-1,-1));dur=500 if kind=='beast' else 125;pal=bd.quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);qq=[]
for j,i in enumerate(seq):frames[i].save(P/('motion-%02d.png'%j));qq.append(frames[i].quantize(palette=pal,dither=Image.Dither.NONE))
qq[0].save(P/'comparison.gif',save_all=True,append_images=qq[1:],duration=dur,loop=0,optimize=False);gripbd.save(P/'grips6-native-3x.png');print(dict(group=kind,frames=8,sequenceFrames=len(seq),frameMs=dur,videoSize=[FW,FH],grips=gcnt))
