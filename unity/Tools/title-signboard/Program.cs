using System;
using Exoduser.UnityPort;
class Program
{
 static int checks;
 static void Check(bool ok,string reason){checks++;if(!ok)throw new Exception(reason);}
 static bool Near(double a,double b)=>Math.Abs(a-b)<.002;
 static void Main()
 {
  int[,] sizes={{1920,1080},{2560,1080},{3840,1080},{1600,900},{2560,1600},{7680,2160},{12800,3600}};
  for(int i=0;i<sizes.GetLength(0);i++)
  {
   int w=sizes[i,0],h=sizes[i,1];var r=NativeTitleSignboardLayout.Cover(w,h);
   Check(r.X<=0&&r.Y<=0&&r.X+r.Width>=w-.002&&r.Y+r.Height>=h-.002,"전체 물리 화면을 덮어야 함");
   Check(Near(r.Width/r.Height,2036d/1016),"인물과 배경 종횡비 보존");
   Check(Near(r.X*2+r.Width,w)&&Near(r.Y*2+r.Height,h),"정중앙 크롭");
   // Approved master: moon center, face, and feet must all survive every supported crop.
   foreach(var p in new[]{new[]{.417,.365},new[]{.59,.39},new[]{.57,.765},new[]{.635,.758}})
   {double x=r.X+p[0]*r.Width,y=r.Y+p[1]*r.Height;Check(x>=0&&x<=w&&y>=0&&y<=h,"승인 달/얼굴/양발 보존");}
   var b=NativeTitleSignboardLayout.Buffer(w,h);
   Check(b.Width>=1&&b.Height>=1&&b.Width<=3840&&b.Height<=2160,"렌더 버퍼 상한");
   Check(Math.Abs(b.Width/(double)b.Height-w/(double)h)<.004,"버퍼 종횡비 보존");
  }
  Check(Near(NativeTitleSignboardLayout.Cover(1920,1080).X,-122.125984),"16:9 C2 cover");
  Check(Near(NativeTitleSignboardLayout.Cover(2560,1080).Y,-98.7426326),"21:9 C2 cover");
  Check(Near(NativeTitleSignboardLayout.Cover(3840,1080).Y,-418.113949),"32:9 C2 cover");
  Check(Near(NativeTitleSignboardLayout.Advance(2,.016,false),2.016),"활성 시간 진행");
  Check(Near(NativeTitleSignboardLayout.Advance(2,20,false),2.1),"포커스 복귀 시간 점프 차단");
  Check(Near(NativeTitleSignboardLayout.Advance(2,-1,false),2),"음수 시간 차단");
  Check(Near(NativeTitleSignboardLayout.Advance(2,.1,true),2),"움직임 감소/정지 시 시간 보존");
  var invalid=NativeTitleSignboardLayout.Cover(0,-10);Check(invalid.Width>0&&invalid.Height>0,"최소화 중 유효 크롭");
  Console.WriteLine("PASS "+checks+" approved title crop, protected subject, bounded buffer and motion clock checks");
 }
}
