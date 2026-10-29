using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort {
 // 기존 원화의 픽셀 좌표만 사용한다. 원본/다른 창의 Texture·Importer는 변경하지 않는다.
 public static class NativeStageClearMaterialLayout {
  public const float Outset=16,CornerScale=44f/56f;
  public sealed class Patch {public string Name;public bool Iron,Button;public float Sx,Sy,Sw,Sh,X,Y,W,H,Tint=1;}
  // 원화 모서리의 검은 사각 여백은 2px행 UV clip으로 제외. 각 쌍은 [포함시작,제외끝].
  static readonly int[][] Spans={
   new[]{0,0,0,0,20,34,5,52,5,56,6,56,6,56,4,56,6,56,4,52,3,52,3,40,2,42,1,41,1,28,1,28,1,28,2,26,7,24,7,19,6,22,6,23,2,24,2,24,3,23,4,22,4,15,5,14},
   new[]{0,0,0,0,6,35,3,51,0,51,0,50,0,50,0,52,0,52,0,51,4,53,16,54,14,54,15,55,28,55,28,55,28,55,29,54,32,49,37,49,34,50,33,50,32,54,32,54,33,52,34,50,41,51,40,49},
   new[]{2,24,2,24,2,23,7,22,7,20,7,18,2,26,2,28,1,28,1,27,1,27,3,40,2,43,3,43,4,52,4,55,4,56,5,56,6,56,6,56,5,56,4,54,17,50,23,48,26,30,26,31,0,0,0,0},
   new[]{32,54,32,54,33,54,34,49,37,49,40,49,30,54,28,55,28,55,28,55,28,55,16,54,13,54,13,53,4,52,1,52,0,52,0,51,1,50,0,50,0,51,4,52,4,39,8,31,25,30,25,30,0,0,0,0}
  };
  public static List<Patch> Plan(float width,float height,NativeStageClearPresentation.Area button){
   var p=new List<Patch>();float x=-Outset,y=-Outset,w=width+Outset*2,h=height+Outset*2,k=CornerScale;
   Cover(p,"본문-iron",false,x,y,w,h,.45f);
   for(int c=0;c<4;c++){float sx=(c%2)*924,sy=(c/2)*1000,dx=x+(c%2)*(w-44),dy=y+(c/2)*(h-44);var spans=Spans[c];for(int row=0;row<56;row+=2){int lo=spans[row],hi=spans[row+1];if(hi>lo)Add(p,"모서리"+c,false,false,sx+lo,sy+row,hi-lo,2,dx+lo*k,dy+row*k,(hi-lo)*k,2*k);}}
   Add(p,"상단테",false,false,56,9,(w-88)/k,10,x+44,y+9*k,w-88,10*k);
   Add(p,"하단테",false,false,56,1032,(w-88)/k,10,x+44,y+h-24*k,w-88,10*k);
   Add(p,"좌측테",false,false,6,56,9,(h-88)/k,x+6*k,y+44,9*k,h-88);
   Add(p,"우측테",false,false,965,56,10,(h-88)/k,x+w-15*k,y+44,10*k,h-88);
   Cover(p,"버튼-iron",true,button.X,button.Y,button.Width,button.Height,.65f);
   // 빈 안쪽 프레임의 10px 마모 테만 재사용. 기능칸/내용/기사 그림은 포함하지 않음.
   const float ix=263,iy=372,iw=687,ih=579,n=10;float bx=button.X,by=button.Y,bw=button.Width,bh=button.Height;
   for(int c=0;c<4;c++)Add(p,"버튼모서리"+c,false,true,ix+(c%2)*(iw-n),iy+(c/2)*(ih-n),n,n,bx+(c%2)*(bw-n),by+(c/2)*(bh-n),n,n);
   Add(p,"버튼상단",false,true,ix+n,iy,bw-2*n,n,bx+n,by,bw-2*n,n);
   Add(p,"버튼하단",false,true,ix+n,iy+ih-n,bw-2*n,n,bx+n,by+bh-n,bw-2*n,n);
   Add(p,"버튼좌측",false,true,ix,iy+n,n,bh-2*n,bx,by+n,n,bh-2*n);
   Add(p,"버튼우측",false,true,ix+iw-n,iy+n,n,bh-2*n,bx+bw-n,by+n,n,bh-2*n);
   return p;
  }
  // 소수 GUI 배율에서 각 행의 좌표/높이를 따로 정수화하면 가로띠가 생긴다.
  // 공유 경계를 먼저 반올림하고, 샘플링할 원화 UV를 같은 affine mapping으로 역보정한다.
  public static Patch PixelAligned(Patch p,float tx,float ty,float scale){
   float ox=tx+p.X*scale,oy=ty+p.Y*scale,ow=p.W*scale,oh=p.H*scale;
   float x=(float)Math.Floor(ox+.5001f),y=(float)Math.Floor(oy+.5001f),right=(float)Math.Floor(ox+ow+.5001f),bottom=(float)Math.Floor(oy+oh+.5001f);
   return new Patch{Name=p.Name,Iron=p.Iron,Button=p.Button,Tint=p.Tint,X=x,Y=y,W=right-x,H=bottom-y,Sx=p.Sx+(x-ox)*p.Sw/ow,Sy=p.Sy+(y-oy)*p.Sh/oh,Sw=(right-x)*p.Sw/ow,Sh=(bottom-y)*p.Sh/oh};
  }

  static void Cover(List<Patch> p,string name,bool button,float x,float y,float w,float h,float tint){float s=Math.Max(w/480,h/480),sw=w/s,sh=h/s;Add(p,name,true,button,(480-sw)/2,(480-sh)/2,sw,sh,x,y,w,h,tint);}
  static void Add(List<Patch> p,string name,bool iron,bool button,float sx,float sy,float sw,float sh,float x,float y,float w,float h,float tint=1){p.Add(new Patch{Name=name,Iron=iron,Button=button,Sx=sx,Sy=sy,Sw=sw,Sh=sh,X=x,Y=y,W=w,H=h,Tint=tint});}
 }
}
