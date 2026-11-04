using System;
using Exoduser.UnityPort;
class Program {
 static int checks;
 static void Check(bool x,string message){checks++;if(!x)throw new Exception(message);}
 static void Near(float actual,float expected,string message){Check(Math.Abs(actual-expected)<.002f,message+": "+actual+" != "+expected);}
 static void Box(HudProtoRect r,float x,float y,float w,float h,string m){Near(r.X,x,m+" x");Near(r.Y,y,m+" y");Near(r.Width,w,m+" w");Near(r.Height,h,m+" h");}
 static void Main(){
  Check(NativeHudPrototypeLayout.Parse(null)==HudPrototypeMode.None,"null args stay legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"game"})==HudPrototypeMode.None,"no arg stays legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"game","--hud-proto=a"})==HudPrototypeMode.A,"A opt-in");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=B"})==HudPrototypeMode.B,"B case insensitive");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=d"})==HudPrototypeMode.None,"unknown stays legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto="})==HudPrototypeMode.None,"empty stays legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto","a"})==HudPrototypeMode.None,"only explicit equals form");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=a","--hud-proto=b"})==HudPrototypeMode.None,"ambiguous stays legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=a","--hud-proto=a"})==HudPrototypeMode.None,"duplicate stays legacy");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--not-hud-proto=a"})==HudPrototypeMode.None,"unrelated arg stays legacy");
  bool refused=false;try{NativeHudPrototypeLayout.Create(HudPrototypeMode.None,1920,1080);}catch(ArgumentException){refused=true;}Check(refused,"no legacy layout is synthesized");
  float[][] starts={new float[]{627.5f,676.5f,725.5f,774.5f,834.5f,883.5f,943.5f,992.5f,1052.5f,1101.5f,1150.5f,1199.5f,1248.5f},new float[]{596.5f,649.5f,702.5f,755.5f,817.5f,870.5f,932.5f,993.5f,1063.5f,1116.5f,1169.5f,1222.5f,1275.5f}};
  for(int m=0;m<2;m++){
   bool b=m==1;var mode=b?HudPrototypeMode.B:HudPrototypeMode.A;var l=NativeHudPrototypeLayout.Create(mode,1920,1080);
   Box(l.Plate,b?576.5f:605.5f,b?982:992,b?767:709,b?84:74,"plate");
   Box(l.Rail,b?398.5f:447.5f,1066,b?1123:1025,14,"rail actual JS inset18");
   Box(l.LeftFrame,b?380.5f:429.5f,b?858:880,b?212:190,b?212:190,"left frame");
   Box(l.RightFrame,b?1327.5f:1300.5f,b?858:880,b?212:190,b?212:190,"right frame");
   Near(l.OrbCenterY,b?964:975,"orb center");Near(l.LeftFrame.Bottom,1070,"orb sink 4");Near(l.Plate.Bottom,1066,"plate grounds on rail");Near(l.Rail.Bottom,1080,"rail reaches viewport bottom");
   Near(l.Plate.X-l.LeftFrame.Right,b?-16:-14,"left overlap");Near(l.RightFrame.X-l.Plate.Right,b?-16:-14,"right overlap");
   Near(l.LeftLiquid.Width,b?176:156,"liquid diameter");Near(l.Plate.Height/l.Outer,b?84f/212:74f/190,"plate proportion");
   Near(l.RowWidth,b?727:665,"row width");Near(l.SlotInk,b?640:572,"functional ink");Check(l.SlotInk/l.Plate.Width>=.8f,"functional width at least80pct");
   if(b)Box(l.Pedestal,885,966,150,100,"B pedestal deliberately unchanged from mock despite offcenter L/R");else Near(l.Pedestal.Width,0,"A no pedestal");
   for(int i=0;i<13;i++){
    bool big=b&&(i==6||i==7);float d=big?56:b?48:44;var r=l.Slot(i);
    Box(r,starts[m][i],big?982:b?994:1000,d,d,"slot "+m+"/"+i);
    Check(l.HitTest(r.X+d/2,r.Y+d/2)==i,"center clicks own slot");
    Near(l.ChipTop(i),r.Bottom-8,"chip overlaps bottom8");
    if(i>0)Near(r.X-l.Slot(i-1).Right,(i==4||i==6||i==8)?(b?14:16):5,"group separation");
   }
   Check(l.HitTest(960,900)==-1,"world above row never blocks");Check(l.HitTest(0,1000)==-1,"world beside row never blocks");
   foreach(float width in new[]{1920f,2560,3840}){var w=NativeHudPrototypeLayout.Create(mode,width,1080);Near(w.Plate.Width,l.Plate.Width,"ultrawide no stretch");Near(w.Plate.X-l.Plate.X,(width-1920)/2,"ultrawide centers");for(int i=0;i<13;i++)Near(w.Slot(i).X-l.Slot(i).X,(width-1920)/2,"slot center shift");}
  }
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=c"})==(HudPrototypeMode)3,"C explicitly opts in");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=C"})==(HudPrototypeMode)3,"C case insensitive");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=c","--hud-proto=a"})==HudPrototypeMode.None,"C plus A is ambiguous");
  Check(NativeHudPrototypeLayout.Parse(new[]{"--hud-proto=c","--hud-proto=c"})==HudPrototypeMode.None,"duplicate C stays legacy");
  var c=NativeHudPrototypeLayout.Create((HudPrototypeMode)3,1920,1080);
  var a=NativeHudPrototypeLayout.Create(HudPrototypeMode.A,1920,1080);
  Box(c.Plate,605.5f,992,709,74,"C retains A plate bounds");
  Near(c.Liquid,156,"C retains A liquid diameter");Near(c.Outer,234.445714f,"C original frame aspect model 263/175");
  Box(c.LeftFrame,384.488571f,837.554286f,234.445714f,234.445714f,"C left source frame");
  Box(c.RightFrame,1293.934286f,837.554286f,234.445714f,234.445714f,"C right source frame");
  Box(c.LeftLiquid,427.277143f,876.777143f,156,156,"C left liquid source offset");
  Box(c.RightLiquid,1336.722857f,876.777143f,156,156,"C right liquid source offset");
  Near(c.LeftFrame.Bottom,1072,"C frame grounds six pixels into rail");
  Near(c.LeftLiquid.X-c.LeftFrame.X,48*156f/175,"C source liquid x registration");
  Near(c.LeftLiquid.Y-c.LeftFrame.Y,44*156f/175,"C source liquid y registration");
  Box(c.Pedestal,935.5f,992,109,74,"C support derives from both mouse slots");
  Near(c.Pedestal.X+c.Pedestal.Width/2,(c.Slot(6).X+c.Slot(7).Right)/2,"C support center follows mouse pair");
  for(int i=0;i<13;i++){
   var r=c.Slot(i);var prior=a.Slot(i);Box(r,prior.X,prior.Y,prior.Width,prior.Height,"C A slot "+i);
   Check(c.HitTest(r.X+r.Width/2,r.Y+r.Height/2)==i,"C visible slot and input share bounds");
   Near(c.ChipTop(i),1036,"C shared chip baseline");
  }
  for(int i=6;i<=7;i++){
   var r=c.Slot(i);Check(r.X>=c.Pedestal.X+8&&r.Right<=c.Pedestal.Right-8,"C mouse slot supported with margin");
   Check(c.ChipTop(i)+15<=c.Pedestal.Bottom,"C mouse chip inside support");
   Check(r.X+r.Width/2-9.5f>=c.Pedestal.X&&r.X+r.Width/2+9.5f<=c.Pedestal.Right,"C mouse label fully supported");
  }
  foreach(float width in new[]{1920f,2560,3840}){var w=NativeHudPrototypeLayout.Create((HudPrototypeMode)3,width,1080);
   Near(w.Plate.X-c.Plate.X,(width-1920)/2,"C ultrawide centered");Near(w.LeftLiquid.Width,156,"C ultrawide no stretch");
   Near(w.Pedestal.X-c.Pedestal.X,(width-1920)/2,"C mouse support follows row");
  }
  Console.WriteLine("PASS "+checks+" HUD prototype argument/layout/input contracts");
 }
}
