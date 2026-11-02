from sprite_export import *
P=ROOT/'reference/bone-archer-shot-yaw-guide.png';bd=Image.new('RGB',(1280,960),(235,231,219));d=ImageDraw.Draw(bd);fo=ImageFont.truetype(FONT,16)
for row,name in enumerate(['SOUTH DOWN','NORTH UP','NORTH-WEST UP-LEFT']):
 for k in range(4):
  ox=k*320;oy=row*320;cx=ox+160;cy=oy+150;d.text((ox+8,oy+7),name+' '+['READY','DRAW','RELEASE','RECOVER'][k],font=fo,fill=(20,20,20));d.ellipse((cx-22,oy+45,cx+22,oy+90),outline=(60,60,60),width=3);d.line([(cx,oy+90),(cx,oy+200),(cx-23,oy+270)],fill=(60,60,60),width=5);d.line([(cx,oy+200),(cx+23,oy+270)],fill=(60,60,60),width=5);vx,vy=[(0,1),(0,-1),(-.94,-.34)][row];left=1 if row==0 else -1;ls=(cx+left*30,oy+110);rs=(cx-left*30,oy+110)
  if k in [1,2]:
   bx=cx+round(vx*55);by=oy+120+round(vy*42);rh=(cx-round(vx*15),oy+105-round(vy*10));rh=(rh[0]-round(vx*24),rh[1]-round(vy*15)) if k==2 else rh;d.line([ls,((ls[0]+bx)//2,oy+125),(bx,by)],fill=(20,90,210),width=5);d.line([rs,(rs[0]-left*40,oy+135),rh],fill=(225,100,20),width=5);d.line([(bx,by-48),(bx,by+48)],fill=(20,145,60),width=5)
   if k==1:
    tip=(bx+round(vx*50),by+round(vy*50));start=(bx-round(vx*30),by-round(vy*30));d.line([start,tip],fill=(210,20,30),width=5);d.ellipse((tip[0]-6,tip[1]-6,tip[0]+6,tip[1]+6),fill=(210,20,30))
  else:
   bx=cx+left*60;by=oy+180;d.line([ls,(cx+left*38,oy+150),(bx,by)],fill=(20,90,210),width=5);d.line([rs,(cx-left*40,oy+160),(cx-left*30,oy+200)],fill=(225,100,20),width=5);d.line([(bx,by-45),(bx,by+45)],fill=(20,145,60),width=5)
bd.save(P)
