using System;
using Exoduser.UnityPort;
class Program {
 static int checks; static void Check(bool ok,string message){checks++;if(!ok)throw new Exception(message);}
 static bool Near(float a,float b){return Math.Abs(a-b)<.002f;}
 static void Main(){
  float[,] sizes={{1920,1080},{2560,1080},{3840,1080},{1600,900},{2560,1600}};
  for(int i=0;i<sizes.GetLength(0);i++){float w=sizes[i,0],h=sizes[i,1];var a=NativeUiSafeArea.Fit(w,h);
   Check(Near(a.Width/a.Height,16f/9),"16:9 "+w);Check(Near(a.X*2+a.Width,w)&&Near(a.Y*2+a.Height,h),"central "+w);
   Check(a.X>=0&&a.Y>=0&&a.X+a.Width<=w+.002f&&a.Y+a.Height<=h+.002f,"inside "+w);
   Check(Near(a.Scale,a.Height/1080),"height scale "+w);
   foreach(float x in new[]{0f,12,956,1500,1920})foreach(float y in new[]{0f,62,540,996,1080}){float px=a.X+x*a.Scale,py=h-(a.Y+y*a.Scale);Check(Near(a.LocalX(px),x)&&Near(a.LocalY(py,h),y),"bottom origin roundtrip "+w);}
   // All 13 skill centers use the same centered dock; outside bars cannot hit its logical rectangle.
   for(int slot=0;slot<13;slot++){float x=560+slot*64,y=1010;Check(Near(a.LocalX(a.X+x*a.Scale),x)&&Near(a.LocalY(h-a.Y-y*a.Scale,h),y),"HUD pointer "+slot);}
   if(a.X>0)Check(a.LocalX(a.X-1)<0&&a.LocalX(a.X+a.Width+1)>1920,"side bars excluded "+w);
   if(a.Y>0)Check(a.LocalY(h-a.Y+1,h)<0&&a.LocalY(h-a.Y-a.Height-1,h)>1080,"top bottom excluded "+w);
  }
  for(int i=0;i<sizes.GetLength(0);i++){float w=sizes[i,0],h=sizes[i,1];var e=NativeUiEdgeArea.Fit(w,h);Check(Near(e.Scale,h/1080),"edge height scale");Check(Near(e.Width*e.Scale,w),"physical edge width");Check(Near(e.LocalX(w-20*e.Scale),e.Width-20),"right pointer");Check(Near(e.LocalY(h-16*e.Scale,h),16),"top pointer");Check(Near((e.Width-560)*e.Scale+560*e.Scale,w),"right panel hits screen edge");}var baseArea=NativeUiSafeArea.Fit(1920,1080);foreach(float w in new[]{2560f,3840f}){var wide=NativeUiSafeArea.Fit(w,1080);Check(Near(wide.Scale,baseArea.Scale)&&Near(wide.Width,1920)&&Near(wide.Height,1080),"same height same size "+w);}
  for(int i=0;i<sizes.GetLength(0);i++){float w=sizes[i,0],h=sizes[i,1];var center=NativeUiSafeArea.Fit(w,h);var edge=NativeUiEdgeArea.Fit(w,h);var body=NativeSkillBodyArea.Fit(w,h);Check(body.Top*edge.Scale>=center.Y+294*center.Scale+4*edge.Scale-.01f,"skill body below actual centered slot row "+w+"x"+h);Check((body.Top+body.Height)*edge.Scale<=center.Y+998*center.Scale-24*edge.Scale+.01f,"skill body above actual centered close buttons "+w+"x"+h);Check(body.Height>500,"skill usable body height "+w+"x"+h);}
  var loading=new System.Collections.Generic.HashSet<int>();foreach(int id in NativeLoadingSelection.Images){Check(NativeLoadingSelection.IsAllowed(id),"승인 로딩 ID");loading.Add(id);}Check(loading.Count==16,"폐기3장을 뺀16장");foreach(int id in new[]{13,14,17})Check(!loading.Contains(id)&&!NativeLoadingSelection.IsAllowed(id),"폐기 이미지 순환제외");for(int stage=0;stage<160;stage++)Check(loading.Contains(NativeLoadingSelection.ForStage(stage)),"모든 전환은 승인 목록");Check(NativeLoadingSelection.ForStage(0)==1&&NativeLoadingSelection.ForStage(16)==1,"16장 순환");
  Check(NativeLoadingTips.Count==4,"실제Native기능에맞는승인팁4개");foreach(int h in new[]{900,1080,1600}){int font=NativeLoadingTips.FontPixels(h);Check(font>=11&&font<=16,"물리팁폰트11..16");}Check(NativeLoadingTips.FontPixels(900)==11&&NativeLoadingTips.FontPixels(1080)==14&&NativeLoadingTips.FontPixels(1600)==16,"vh팁서체반올림");Check(NativeLoadingTips.Pick(1,false,"V","F2").Contains("V"),"실제인벤바인딩");Check(NativeLoadingTips.Pick(2,false,"V","F2").Contains("F2키"),"실제수거바인딩");Check(NativeLoadingTips.Pick(2,true,"V","F2").Contains("Press F2"),"승인영문과실제수거바인딩");Check(NativeLoadingTips.Pick(-1,false,"TAB","R")==NativeLoadingTips.Pick(3,false,"TAB","R"),"단계음수안전");for(int stage=0;stage<64;stage++)foreach(bool english in new[]{false,true}){var tip=NativeLoadingTips.Pick(stage,english,"TAB","R");Check(!string.IsNullOrWhiteSpace(tip),"모든팁비어있지않음");Check(!tip.Contains("합체")&&!tip.Contains("groggy")&&!tip.Contains("30%"),"미확인기능/수치팁미삽입");}
  Check(NativeLoadingTips.Pick(1,false,null,null)==NativeLoadingTips.Pick(0,false,null,null)&&NativeLoadingTips.Pick(2,true,null,null)==NativeLoadingTips.Pick(0,true,null,null),"미지정키팁은조작을허위안내하지않음");
  Console.WriteLine("PASS "+checks+" safe-area/pointer/loading checks");
 }
}
