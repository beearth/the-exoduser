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
   Check(Near(r.Width/r.Height,3840d/1080),"인물과 배경 종횡비 보존");
   Check(Near(r.X*2+r.Width,w)&&Near(r.Y*2+r.Height,h),"정중앙 크롭");
   // 10-28 Kling 32:9 master (original at x=960): moon center, face, and both feet must survive every supported crop.
   foreach(var p in new[]{new[]{1748d/3840,190d/1080},new[]{2195d/3840,330d/1080},new[]{2185d/3840,805d/1080},new[]{2330d/3840,790d/1080}})
   {double x=r.X+p[0]*r.Width,y=r.Y+p[1]*r.Height;Check(x>=0&&x<=w&&y>=0&&y<=h,"승인 달/얼굴/양발 보존");}
   var b=NativeTitleSignboardLayout.Buffer(w,h);
   Check(b.Width>=1&&b.Height>=1&&b.Width<=3840&&b.Height<=2160,"렌더 버퍼 상한");
   Check(Math.Abs(b.Width/(double)b.Height-w/(double)h)<.004,"버퍼 종횡비 보존");
  }
  Check(Near(NativeTitleSignboardLayout.Cover(1920,1080).X,-960)&&Near(NativeTitleSignboardLayout.Cover(1920,1080).Y,0),"16:9는 가운데 원본 1920만");
  Check(Near(NativeTitleSignboardLayout.Cover(2560,1080).X,-640)&&Near(NativeTitleSignboardLayout.Cover(2560,1080).Y,0),"21:9는 가운데 2560");
  Check(Near(NativeTitleSignboardLayout.Cover(3840,1080).X,0)&&Near(NativeTitleSignboardLayout.Cover(3840,1080).Y,0),"32:9는 전체, 위아래 잘림 0");
  Check(Near(NativeTitleSignboardLayout.Advance(2,.016,false),2.016),"활성 시간 진행");
  Check(Near(NativeTitleSignboardLayout.Advance(2,20,false),2.1),"포커스 복귀 시간 점프 차단");
  Check(Near(NativeTitleSignboardLayout.Advance(2,-1,false),2),"음수 시간 차단");
  Check(Near(NativeTitleSignboardLayout.Advance(2,.1,true),2),"움직임 감소/정지 시 시간 보존");
  var invalid=NativeTitleSignboardLayout.Cover(0,-10);Check(invalid.Width>0&&invalid.Height>0,"최소화 중 유효 크롭");
  Check(NativeTitleSignboardLayout.VideoWidth(1920,1080)==3840,"모든 화면이 같은 32:9 판");
  Check(NativeTitleSignboardLayout.VideoWidth(3840,1080)==3840,"32:9는3840판");
  Check(NativeTitleSignboardLayout.VideoWidth(1280,720)==3840,"720p도 같은 판");
  Check(NativeTitleSignboardLayout.VideoFile(2560)=="title_motion_1028_superwide_20261107.mp4","10-28 Kling 32:9 확장판 하나만 요청");
  Console.WriteLine("PASS "+checks+" approved title crop, protected subject, bounded buffer and motion clock checks");
 }
}
