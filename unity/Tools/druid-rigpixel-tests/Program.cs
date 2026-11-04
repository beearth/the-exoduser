using System;using System.IO;using System.Linq;using System.Text.Json;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
class DruidRigTests
{
 static int checks,bad;
 static void Check(bool ok,string label){checks++;if(!ok){bad++;Console.WriteLine("FAIL "+label);}}
 static void Near(double a,double b,string label){Check(Math.Abs(a-b)<.00001,label+" actual="+a+" expected="+b);}
 static DruidData Data(string state,string move,double remaining){return new DruidData{S=state,RmMoveId=move,St2=remaining};}
 static void Phase(string state,string move,string name,double duration,int slash=0,int beat=0,bool grabbed=false,string actual=null)
 {
  var d=Data(state,move,duration);d.SlashIdx=slash;d.HbBeat=beat;
  if(state.EndsWith("Wind")&&state!="bossSlashWind")d.RmTeleTotal=duration;
  if(state=="bossDruidDive")d.DiveMax=duration;
  double previous=-1;
  for(int t=0;t<=duration;t++)
  {
   d.St2=duration-t;var p=NativeDruidRigPolicy.Select(d,false,grabbed,actual);
   Check(p.Name==name,"phase "+state+"/"+move+"/"+slash+"/"+beat);
   Check(p.Frame>=previous&&p.Frame>=0&&p.Frame<=NativeDruidRigPolicy.Frames(name),"monotonic bounded frame "+name);
   Near(d.St2,duration-t,"Core counter unchanged");previous=p.Frame;
   if(t==0)Near(p.Frame,0,"phase first frame "+name);
   if(t==duration)Near(p.Frame,NativeDruidRigPolicy.Frames(name),"phase last frame "+name);
  }
 }
 // 11-04 default druid set rule: legacy-arg > arg > 3d-arena > demo > default; Core default stays off
 static void DruidSet(string[] a,bool arena,bool demo,bool want,string why)
 {
  string r;bool on=NativeReviewArgs.DecideDruidSet(a,arena,demo,out r);Check(on==want&&r==why,"druid set "+(a==null?"null":string.Join(" ",a))+" arena="+arena+" demo="+demo+" -> "+on+"/"+r+" expected "+want+"/"+why);
 }
 static void HsvOk(string hex,string label)
 {   // B5: S <= .40, no primary lime (hue 63 deg olive-yellow with low saturation is the allowed withered tone)
  int r=Convert.ToInt32(hex.Substring(1,2),16),g=Convert.ToInt32(hex.Substring(3,2),16),b=Convert.ToInt32(hex.Substring(5,2),16);
  double max=Math.Max(r,Math.Max(g,b))/255.0,min=Math.Min(r,Math.Min(g,b))/255.0,s=max<=0?0:(max-min)/max;
  Check(s<=.40,label+" saturation "+s+" <= .40 (RGB "+r+","+g+","+b+")");Console.WriteLine(label+" "+hex+" RGB("+r+","+g+","+b+") S="+s.ToString("0.000")+" V="+max.ToString("0.000"));
 }
 static void RetouchB()
 {
  HsvOk(NativeDruidRigPolicy.GlowEmissionHex,"glow emission");HsvOk(NativeDruidRigPolicy.GlowPaletteHex,"glow palette");
  Check(NativeDruidRigPolicy.Palette("druid_glow")==NativeDruidRigPolicy.GlowPaletteHex&&NativeDruidRigPolicy.Palette("lantern_orb")==NativeDruidRigPolicy.GlowPaletteHex,"glow palette routed");
  // B8 entry/exit windows
  var w=new NativeArenaReviewPolicy.EntryExitWindow();bool en,ex;int entry=0,exit=0;
  w.Step(0,false,out en,out ex);Check(!en&&!ex,"window idle");
  w.Step(1,false,out en,out ex);Check(en&&!ex,"entry starts on LoadPhase 0->1 outside the arena");entry++;
  for(int i=1;i<NativeArenaReviewPolicy.SeqEntryExitFrames;i++){w.Step(i<50?1:2,i>=50,out en,out ex);if(en)entry++;}
  Check(entry==NativeArenaReviewPolicy.SeqEntryExitFrames,"entry window is exactly 300 frames: "+entry);w.Step(0,true,out en,out ex);Check(!en,"entry window closed");
  w.Step(0,false,out en,out ex);Check(ex,"exit starts when InArena turns false");exit++;
  for(int i=1;i<400;i++){w.Step(0,false,out en,out ex);if(ex)exit++;}
  Check(exit==NativeArenaReviewPolicy.SeqEntryExitFrames,"exit window is exactly 300 frames: "+exit);
  var w2=new NativeArenaReviewPolicy.EntryExitWindow();w2.Step(1,true,out en,out ex);w2.Step(2,true,out en,out ex);Check(!en&&!ex,"LoadPhase inside the arena opens nothing");
  // pure black run
  var run=new NativeArenaReviewPolicy.BlackRun();for(int i=0;i<10;i++)run.Add(0,1/60.0);run.Add(40,1/60.0);for(int i=0;i<4;i++)run.Add(.2,1/60.0);
  Check(run.Longest==10&&Math.Abs(run.LongestSeconds-10/60.0)<1e-9&&Math.Abs(run.Total-14/60.0)<1e-9,"black run longest "+run.Longest+" total "+run.Total);
  Check(NativeArenaReviewPolicy.PureBlackMaxSeconds==.5&&Math.Abs(NativeArenaReviewPolicy.LumaY(255,255,255)-255)<1e-9&&NativeArenaReviewPolicy.LumaY(0,0,0)==0,"black limit and luma");
  // far enemy / bullet cuts
  Check(NativeArenaReviewPolicy.InTopThird(800,5,1080)&&!NativeArenaReviewPolicy.InTopThird(700,5,1080)&&!NativeArenaReviewPolicy.InTopThird(800,-1,1080)&&NativeArenaReviewPolicy.InTopThird(720,1,1080),"top third rule");
  var line=new DruidTelegraph{Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Line,X=0,Y=0,Dir=0,Length=600,Width=80};
  Check(NativeArenaReviewPolicy.TeleTowardHero(line,300,20,20),"line toward hero");Check(!NativeArenaReviewPolicy.TeleTowardHero(line,-300,0,20),"line away from hero");Check(!NativeArenaReviewPolicy.TeleTowardHero(line,900,0,20),"line out of reach");
  var cone=new DruidTelegraph{Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.Cone,X=0,Y=0,Dir=Math.PI,Radius=300,Angle=1.0};
  Check(NativeArenaReviewPolicy.TeleTowardHero(cone,-200,10,20),"cone wraps across +-pi");Check(!NativeArenaReviewPolicy.TeleTowardHero(cone,200,0,20),"cone behind");
  var arenaWide=new DruidTelegraph{Kind=DruidTeleKind.GroundDecal,Shape=DruidTeleShape.ArenaMinusSafe,X=0,Y=0};Check(!NativeArenaReviewPolicy.TeleTowardHero(arenaWide,0,0,20)&&!NativeArenaReviewPolicy.TeleTowardHero(null,0,0,20),"arena-wide pulse and null never count");
 }
 static void DruidSetRule()
 {
  var none=new string[0];var rm=new[]{"--unity-druid-remodel"};var lg=new[]{"--unity-druid-legacy"};var both=new[]{"--unity-druid-remodel","--unity-druid-legacy"};
  DruidSet(none,false,false,false,"default");DruidSet(null,false,false,false,"default");
  DruidSet(none,true,false,true,"3d-arena");DruidSet(none,false,true,true,"demo");DruidSet(none,true,true,true,"3d-arena");
  DruidSet(rm,false,false,true,"arg");DruidSet(rm,true,true,true,"arg");
  DruidSet(lg,false,false,false,"legacy-arg");DruidSet(lg,true,false,false,"legacy-arg");DruidSet(lg,false,true,false,"legacy-arg");DruidSet(lg,true,true,false,"legacy-arg");
  DruidSet(both,true,true,false,"legacy-arg");DruidSet(both,false,false,false,"legacy-arg");
  Check(!DruidRemodelSettings.Default,"Core default stays off");Check(!new Simulation(SourceStarterFixture.CreateKiSlash(),SourceStarterFixture.Seed).DruidRemodel,"a directly constructed Simulation keeps the web-port druid");
  Check(NativeReviewArgs.IsReviewArgument("--unity-druid-legacy")&&NativeReviewArgs.IsReviewArgument("--unity-druid-remodel"),"druid args are review arguments");
 }
 static void EnemyCanvas()
 {
  int before=checks;float texel;
  foreach(var c in new[]{new[]{1069,1,1088,1},new[]{4000,1,2016,2},new[]{30000,3,1280,24},new[]{500,1,512,1},new[]{500,3,192,3},new[]{2044,1,2048,1},new[]{2045,1,1056,2}})
  {
   int size=NativeRigPixelPolicy.EnemyTextureSize(.01f,c[1],c[0],out texel);
   Check(size==c[2]&&texel==c[3],"enemy box "+c[0]+" base="+c[1]+" size="+size+" texel="+texel);
   Check(size>=64&&size<=NativeRigPixelPolicy.EnemyMaxRt&&size%32==0&&(size-4)*texel>=c[0],"enemy bounded canvas includes box and padding "+c[0]);
  }
  NativeRigPixelPolicy.EnemyTextureSize(.01f,1,4000,out texel);
  Check(NativeRigPixelPolicy.EnemyTextureSize(.01f,1,500,out texel)==512&&texel==1,"enemy next small frame restores texel 1");
  foreach(float invalid in new[]{0f,-1f,float.NaN,float.PositiveInfinity,float.NegativeInfinity})
  {
   Check(NativeRigPixelPolicy.EnemyTextureSize(invalid,1,500,out texel)==0,"enemy invalid wpp "+invalid);
   Check(NativeRigPixelPolicy.EnemyTextureSize(.01f,1,invalid,out texel)==0,"enemy invalid box "+invalid);
  }
  Check(NativeRigPixelPolicy.EnemyTextureSize(.01f,0,500,out texel)==0&&NativeRigPixelPolicy.EnemyTextureSize(.01f,-1,500,out texel)==0,"enemy invalid base texel");
  foreach(float wpp in new[]{float.Epsilon,.01f,float.MaxValue})foreach(float box in new[]{float.Epsilon,1069f,4000f,30000f,float.MaxValue})
  {
   int size=NativeRigPixelPolicy.EnemyTextureSize(wpp,1,box,out texel);
   Check(size>=64&&size<=2048&&size%32==0&&texel>=1&&!float.IsInfinity(texel)&&(size-4)*(double)texel>=box,"enemy finite inputs never overflow wpp="+wpp+" box="+box);
  }
  Check(NativeRigPixelPolicy.TextureSize(.01f,1,10.73f)==0,"hero TextureSize retains 1024 cap");
  int druidTexel;Check(NativeRigPixelPolicy.DruidMaxRt==2048&&NativeRigPixelPolicy.DruidCanvas(.01f,1,4000,out druidTexel)==2016&&druidTexel==2,"druid canvas unchanged");
  Console.WriteLine("enemy-rt checks="+(checks-before)+" cap="+NativeRigPixelPolicy.EnemyMaxRt);
 }
 // Bounds/canvas regression: no Unity types or Player required.
 delegate bool NearEdge(double ax,double ay,double az,double bx,double by,double bz,double near,out double x,out double y,out double z);
 static void DruidBounds()
 {
  int before=checks;
  var boneMethod=typeof(NativeDruidRigPolicy).GetMethod("BoundsBone");
  Check(boneMethod!=null,"weighted/range bounds policy exists");
  if(boneMethod!=null)
  {
   var bone=(Func<bool,double,double,bool>)Delegate.CreateDelegate(typeof(Func<bool,double,double,bool>),boneMethod);
   Check(bone(true,0,3.83276391),"weighted bone at foot kept");
   Check(bone(true,4*3.83276391*3.83276391,3.83276391),"bone at exactly twice body height kept");
   Check(!bone(true,4*3.83276391*3.83276391+.001,3.83276391),"bone beyond twice body height rejected");
   Check(!bone(false,0,3.83276391),"zero-weight helper at foot excluded");
   Check(!bone(false,10000,3.83276391),"zero-weight remote helper excluded");
   foreach(double v in new[]{-1d,double.NaN,double.PositiveInfinity,double.NegativeInfinity})Check(!bone(true,v,3.83276391),"invalid bone distance "+v);
   foreach(double v in new[]{0d,-1d,double.NaN,double.PositiveInfinity,double.NegativeInfinity})Check(!bone(true,0,v),"invalid body height "+v);
   foreach(double h in new[]{.01,1,3.83276391,10000})
   {
    Check(bone(true,h*h,h)&&!bone(true,4.01*h*h,h),"world-scale-independent bone cutoff "+h);
    Check(!bone(false,h*h,h),"zero weight independent of scale "+h);
   }
  }
  var nearMethod=typeof(NativeDruidRigPolicy).GetMethod("ClipNearPlaneEdge");
  Check(nearMethod!=null,"near plane edge policy exists");
  if(nearMethod!=null)
  {
   var edge=(NearEdge)Delegate.CreateDelegate(typeof(NearEdge),nearMethod);double x,y,z;
   Check(edge(-2,0,-1,2,4,3,1,out x,out y,out z),"straddling edge clipped");Near(x,0,"near intersection x");Near(y,2,"near intersection y");Near(z,1,"near intersection depth");
   Check(edge(2,4,3,-2,0,-1,1,out x,out y,out z),"reversed edge clipped");Near(x,0,"reverse x");Near(y,2,"reverse y");Near(z,1,"reverse depth");
   Check(!edge(0,0,2,1,1,3,1,out x,out y,out z),"fully front edge needs no intersection");
   Check(!edge(0,0,-2,1,1,.5,1,out x,out y,out z),"fully behind edge contributes nothing");
   Check(!edge(0,0,1,1,1,1,1,out x,out y,out z),"coplanar edge has no divide by zero");
   Check(edge(0,0,1,2,4,3,1,out x,out y,out z),"near-plane endpoint retained");Near(z,1,"endpoint depth");
   foreach(double v in new[]{double.NaN,double.PositiveInfinity,double.NegativeInfinity})
    Check(!edge(0,0,v,1,1,3,1,out x,out y,out z),"invalid depth rejected "+v);
   Check(!edge(0,0,-1,1,1,3,0,out x,out y,out z),"invalid near plane rejected");
   Check(!edge(double.NaN,0,-1,1,1,3,1,out x,out y,out z),"invalid coordinate rejected");
   // A box crossing z=1: four front corners plus the four true edge intersections.
   double loX=double.PositiveInfinity,hiX=double.NegativeInfinity,loY=loX,hiY=hiX;
   for(int i=0;i<4;i++)
   {
    double a=(i&1)==0?-1:1,b=(i&2)==0?-1:1;
    Check(edge(a,b,-1,a,b,3,1,out x,out y,out z),"box crossing edge "+i);
    loX=Math.Min(loX,x/z);hiX=Math.Max(hiX,x/z);loY=Math.Min(loY,y/z);hiY=Math.Max(hiY,y/z);
   }
   Near(loX,-1,"clipped box left");Near(hiX,1,"clipped box right");Near(loY,-1,"clipped box bottom");Near(hiY,1,"clipped box top");
  }
  int tx;foreach(float wpp in new[]{float.Epsilon,.01f,float.MaxValue})foreach(float box in new[]{6144.3408203125f,30000f,1000000000f})
  {
   int size=NativeRigPixelPolicy.DruidCanvas(wpp,1,box,out tx);
   Check(size>=64&&size<=2048&&size%32==0&&tx>=1&&(size-4)*(double)tx>=box,"druid large finite box includes padding wpp="+wpp+" box="+box+" RT="+size+" texel="+tx);
  }
  int s=NativeRigPixelPolicy.DruidCanvas(.01f,1,6144.3408203125f,out tx);Check(s==1568&&tx==4,"6144.34px regression RT=1568 texel=4");
  Check(NativeRigPixelPolicy.DruidCanvas(.01f,1,500,out tx)==512&&tx==1,"next small druid frame restores texel 1");
  Console.WriteLine("druid-bounds checks="+(checks-before));
 }
 static void DruidFrameFallback()
 {
  int before=checks;
  var issueType=typeof(NativeDruidRigPolicy).GetNestedType("FrameIssue");
  var fallback=typeof(NativeDruidRigPolicy).GetMethod("RequiresLegacyFallback");
  Check(issueType!=null,"frame issue classification exists");Check(fallback!=null,"view fallback decision policy exists");
  if(issueType!=null&&fallback!=null)
  {
   foreach(var name in new[]{"NearPlane","CanvasSize","RenderException","RenderTextureCreation"})
   {
    bool actual=(bool)fallback.Invoke(null,new[]{Enum.Parse(issueType,name)});
    bool expected=name=="RenderException"||name=="RenderTextureCreation";
    Check(actual==expected,"frame fallback "+name+" actual="+actual+" expected="+expected);
   }
   Check((bool)fallback.Invoke(null,new[]{Enum.ToObject(issueType,999)}),"unknown frame failure keeps the safe legacy fallback");
  }
  Console.WriteLine("druid-frame-fallback checks="+(checks-before));
 }
 static int Main()
 {
  Check(!NativeDruidRigPolicy.Requested(null),"default off");Check(!NativeDruidRigPolicy.Requested(new string[0]),"empty off");
  Check(NativeDruidRigPolicy.Requested(new[]{"--boss-render=rigpixel"}),"equals flag");Check(NativeDruidRigPolicy.Requested(new[]{"--boss-render","rigpixel"}),"split flag");
  foreach(var a in new[]{"--boss-render=rigpixel-extra","--boss-render=RigPixel","--hero-render=rigpixel","x--boss-render=rigpixel"})Check(!NativeDruidRigPolicy.Requested(new[]{a}),"exact option "+a);
  Check(!NativeDruidRigPolicy.Requested(new[]{"--boss-render=rigpixel","--boss-render=sprite"}),"last wins off");Check(NativeDruidRigPolicy.Requested(new[]{"--boss-render=sprite","--boss-render=rigpixel"}),"last wins on");
  var idle=Data("idle",null,0);Check(NativeDruidRigPolicy.Select(idle,false).Name=="Idle","standing idle");Check(NativeDruidRigPolicy.Select(idle,true).Name=="Walk","Core motion walk");
  Check(NativeDruidRigPolicy.Select(Data("eDeath",null,0),false).Held,"missing death held");
  for(int slash=0;slash<3;slash++)
  {
   Phase("bossSlashWind","slashCombo","slash"+(slash+1)+"_tele",slash==0?DruidRemodelData.Moves[0].Tele:DruidRemodelData.SlashLinkTele,slash);
   Phase("bossSlash","slashCombo","slash"+(slash+1)+"_act",DruidRemodelData.SlashActive,slash);
   var d=Data("bossSlash","slashCombo",DruidRemodelData.SlashHitAt);d.SlashIdx=slash;
   Near(NativeDruidRigPolicy.Select(d,false).Frame,6,"author hit6 aligns Core damage for slash "+slash);
  }
  Phase("bossSlamWind","slam","slam_tele",DruidRemodelData.Moves[1].Tele);Phase("bossSlam","slam","slam_act",DruidRemodelData.SlamActive);
  Phase("bossChargeWind","charge","charge_tele",DruidRemodelData.Moves[2].Tele);Phase("bossCharge","charge","charge_run",DruidRemodelData.ChargeTicks);
  Check(NativeDruidRigPolicy.Select(Data("bossCharge","charge",20),false).StripHorizontalRoot,"charge planar root removed");
  Phase("bossGrabWind","grab","grab_tele",DruidRemodelData.Moves[5].Tele);Phase("bossGrabLunge","grab","grab_lunge",DruidRemodelData.GrabLungeTicks);Phase("bossGrab","grab","grab_hold",DruidRemodelData.GrabTicks);
  Check(NativeDruidRigPolicy.Select(Data("bossGrabLunge","grab",10),false).StripHorizontalRoot,"lunge planar root removed");
  Phase("bossDruidDive","burrowStrike","burrow_dive",DruidRemodelData.Moves[6].Tele);
  var erupt=Data("bossDruidErupt","burrowStrike",DruidRemodelData.BurrowEruptWarn+DruidRemodelData.BurrowEruptPost);erupt.EruptMax=erupt.St2;
  Check(NativeDruidRigPolicy.Select(erupt,false).Name=="burrow_erupt_warn","erupt warning first");Near(NativeDruidRigPolicy.Select(erupt,false).Frame,0,"erupt warn frame0");
  erupt.St2=DruidRemodelData.BurrowEruptPost;erupt.EruptHit=true;Check(NativeDruidRigPolicy.Select(erupt,false).Name=="burrow_erupt","erupt actual boundary");Near(NativeDruidRigPolicy.Select(erupt,false).Frame,0,"erupt active frame0");
  erupt.St2=0;Near(NativeDruidRigPolicy.Select(erupt,false).Frame,6,"erupt active end");Check(!NativeDruidRigPolicy.Select(erupt,false).StripHorizontalRoot,"burrow vertical root retained");
  Phase("bossRmWind","groundFissure","fissure_tele",DruidRemodelData.Moves[3].Tele);
  var fissure=Data("bossRec","groundFissure",60);Check(NativeDruidRigPolicy.Select(fissure,false).Name=="fissure_act","instant act inside recovery");
  fissure.St2=40;var fp=NativeDruidRigPolicy.Select(fissure,false);Check(fp.Name=="fissure_rec","rec follows act20");Near(fp.Frame,0,"fissure recovery first");fissure.St2=0;Near(NativeDruidRigPolicy.Select(fissure,false).Frame,60,"fissure rec finish inside Core window");
  Phase("bossHeartWind","heartbeat","heart_tele",DruidRemodelData.Moves[11].Tele);
  Phase("bossHeartWind","heartbeat","heart_beat",DruidRemodelData.HeartbeatBeatWind,0,1);Phase("bossHeartWind","heartbeat","heart_beat",DruidRemodelData.HeartbeatBeatWind,0,2);Phase("bossHeartPause","heartbeat","heart_pause",DruidRemodelData.HeartbeatPause);
  foreach(var pair in new[]{new[]{"slashCombo","slash_rec"},new[]{"slam","slam_rec"},new[]{"charge","charge_rec"},new[]{"burrowStrike","burrow_rec"},new[]{"heartbeat","heart_rec"}})
  {
   double duration=DruidRemodelData.Moves.First(m=>m.Id==pair[0]).Rec;Phase("bossRec",pair[0],pair[1],duration);
   var normal=Data("bossRec",pair[0],duration/2);var bonus=Data("bossRec",pair[0],duration/2+30);bonus.RmBonusApplied=true;
   Near(NativeDruidRigPolicy.Select(normal,false).ElapsedTicks,NativeDruidRigPolicy.Select(bonus,false).ElapsedTicks,"parry bonus preserves elapsed "+pair[0]);
  }
  Phase("bossRec","grab","grab_throw",DruidRemodelData.GrabHeldRecovery,0,0,true);Phase("bossRec","grab","grab_miss_rec",DruidRemodelData.GrabMissRecovery);Phase("recover","grab","grab_miss_rec",40);
  Phase("bossRec","grab","charge_rec",DruidRemodelData.GrabMissRecovery,0,0,false,"charge");
  foreach(var pair in new[]{new[]{"druid_bone","#b9ad90"},new[]{"druid_bark","#4a3826"},new[]{"druid_feather","#1c2024"},new[]{"druid_hair","#2a2624"},new[]{"druid_beard","#8f8a82"},new[]{"druid_glow","#7b7d52"},new[]{"druid_moss","#36421f"},new[]{"staff_bark","#4a3826"},new[]{"staff_leather","#2e231b"},new[]{"staff_bone","#b9ad90"},new[]{"lantern_orb","#7b7d52"},new[]{"front_panel_cloth","#26211d"}})Check(NativeDruidRigPolicy.Palette(pair[0])==pair[1],"LOCK palette "+pair[0]);Check(NativeDruidRigPolicy.Palette("iron")==null,"hero palette isolated");
  using(var json=JsonDocument.Parse(File.ReadAllText("unity/Assets/Exoduser/Resources/Art/Bosses/Druid/oldman-import.json")))
  {
   var source=json.RootElement;Check(source.GetProperty("sourceVersion").GetString()=="v9.1","current source");Check(source.GetProperty("clips").GetArrayLength()==38,"38 imported clips");
   Check(source.GetProperty("boneCount").GetInt32()==65&&source.GetProperty("oldManBones").GetInt32()==34&&source.GetProperty("huskBones").GetInt32()==23&&source.GetProperty("huskPoseBones").GetInt32()==6,"65 bones = 34 + 23 HK + 6 HP + OM_Lift/OM_Staff");
   Check(source.GetProperty("oldManTriangles").GetInt32()==78323&&source.GetProperty("huskTriangles").GetInt32()==73906,"triangle contract");
   Check(source.GetProperty("socketParent").GetString()=="OM_Staff"&&source.GetProperty("rigidHuskCorrectedErrorMetres").GetDouble()<.0001&&source.GetProperty("socketCorrectedErrorMetres").GetDouble()<.0001,"socket rest restored");
   double husk=source.GetProperty("huskFootRadiusMetres").GetDouble(),man=source.GetProperty("oldManFootRadiusMetres").GetDouble();Check(husk>0&&man>0,"measured footprints");
   // Scale rule: footprint circle = Core hit radius (Core: BossRemodelSet.RadiusFor = LifeRadiusPx 130/111/57 since 11-04 (recalculated on the measured hero 1.609 u), px/100 world). No display multiplier.
   double origR=130;double[] rpx=new double[3];for(int i=0;i<3;i++){rpx[i]=DruidRemodelData.Set.RadiusFor(i,origR);}
   Near(rpx[0],130,"P1 Core radius px");Near(rpx[1],111,"P2 Core radius px");Near(rpx[2],57,"P3 Core radius px");
   {double heroWorld=1.6094975,huskTop=4.8295,horn=2.71;double[] hero={rpx[0]/100/husk*huskTop/heroWorld,rpx[1]/100/husk*huskTop/heroWorld,rpx[2]/100/man*horn/heroWorld};Check(Math.Abs(hero[0]-2.8)<=.05&&Math.Abs(hero[1]-2.38)<=.05&&Math.Abs(hero[2]-2.0)<=.05,"hero height multiples P1/P2/P3 "+hero[0]+" "+hero[1]+" "+hero[2]);Console.WriteLine("hero multiples P1="+hero[0]+" P2="+hero[1]+" P3 horn="+hero[2]);}
   var args3=NativeArenaReviewPolicy.EdgeLives(new[]{"--unity-boss-arena-p3-edge"});Check(!args3[0]&&!args3[1]&&args3[2],"edge arg p3");
   var all3=NativeArenaReviewPolicy.EdgeLives(new[]{"--unity-boss-arena-edge"});Check(all3[0]&&all3[1]&&all3[2],"edge arg all");
   var pick=NativeArenaReviewPolicy.EdgeLives(new[]{"--unity-boss-arena-edge=1,3"});Check(pick[0]&&!pick[1]&&pick[2],"edge arg list 1,3");
   var bad1=NativeArenaReviewPolicy.EdgeLives(new[]{"--unity-boss-arena-edge=x,9"});Check(bad1[0]&&bad1[1]&&bad1[2],"edge arg invalid list = all");
   {   // --unity-boss-arena-seq: needs the review arg; contact bot = attack 120 -> roll 12 -> attack 60 -> dash 15
    bool pr;
    Check(NativeArenaReviewPolicy.SeqRequested(new[]{"--unity-boss-arena-review","--unity-boss-arena-seq"})&&!NativeArenaReviewPolicy.SeqRequested(new[]{"--unity-boss-arena-seq"})&&!NativeArenaReviewPolicy.SeqRequested(new[]{"--unity-boss-arena-review"})&&!NativeArenaReviewPolicy.SeqRequested(null),"seq arg needs review arg");
    Check(NativeArenaReviewPolicy.ContactAt(0,out pr)==NativeArenaReviewPolicy.ContactStep.Attack&&!pr&&NativeArenaReviewPolicy.ContactAt(119,out pr)==NativeArenaReviewPolicy.ContactStep.Attack,"seq contact attack 2s");
    Check(NativeArenaReviewPolicy.ContactAt(120,out pr)==NativeArenaReviewPolicy.ContactStep.Roll&&pr&&NativeArenaReviewPolicy.ContactAt(123,out pr)==NativeArenaReviewPolicy.ContactStep.Roll&&!pr,"seq contact roll press");
    Check(NativeArenaReviewPolicy.ContactAt(132,out pr)==NativeArenaReviewPolicy.ContactStep.Attack&&NativeArenaReviewPolicy.ContactAt(191,out pr)==NativeArenaReviewPolicy.ContactStep.Attack,"seq contact attack 1s");
    Check(NativeArenaReviewPolicy.ContactAt(192,out pr)==NativeArenaReviewPolicy.ContactStep.Dash&&pr&&NativeArenaReviewPolicy.ContactAt(206,out pr)==NativeArenaReviewPolicy.ContactStep.Dash&&NativeArenaReviewPolicy.ContactAt(207,out pr)==NativeArenaReviewPolicy.ContactStep.Attack,"seq contact dash then repeat");
   }
   var none=NativeArenaReviewPolicy.EdgeLives(new string[0]);Check(!none[0]&&!none[1]&&!none[2],"edge arg absent = none");
   {   // arena fix 11-04: canvas never 0 for the druid (cap 2048, texel steps), the shared TextureSize keeps the 1024 cap
    int tx;float wpp=.01f;
    int s1069=NativeRigPixelPolicy.DruidCanvas(wpp,1,1069,out tx);Check(s1069>0&&s1069<=NativeRigPixelPolicy.DruidMaxRt&&tx>=1,"druid canvas 1069px box nonzero size="+s1069+" texel="+tx);
    int s4000=NativeRigPixelPolicy.DruidCanvas(wpp,1,4000,out tx);Check(s4000>0&&s4000<=NativeRigPixelPolicy.DruidMaxRt&&tx>=2,"druid canvas 4000px box nonzero size="+s4000+" texel="+tx);
    int s30000=NativeRigPixelPolicy.DruidCanvas(wpp,3,30000,out tx);Check(s30000>0&&s30000<=NativeRigPixelPolicy.DruidMaxRt&&tx>=3,"druid canvas 30000px box at texel 3 size="+s30000+" texel="+tx);
    Check(NativeRigPixelPolicy.DruidCanvas(wpp,1,500,out tx)>0&&tx==1,"druid canvas small box keeps texel 1");
    Check(NativeRigPixelPolicy.DruidCanvas(float.NaN,1,500,out tx)==0&&NativeRigPixelPolicy.DruidCanvas(wpp,1,0,out tx)==0,"druid canvas invalid inputs = 0");
    Check(NativeRigPixelPolicy.TextureSize(wpp,1,(1069+4)*wpp)==0&&NativeRigPixelPolicy.TextureSize(wpp,1,(1069+4)*wpp,2048)>0,"enemy/hero cap stays 1024, druid cap 2048");
    // measured arena preview 5 (heroIdleWorld 1.6094975): P1 3.1421766, P2 2.6587646 -> footprint = Core radius rule, heights 1.95x / 1.65x hero
    Check(Math.Abs(NativeDruidRigPolicy.HeroRatio(3.1421766f,1.6094975f)-1.952)<.001&&Math.Abs(NativeDruidRigPolicy.HeroRatio(2.6587646f,1.6094975f)-1.652)<.001&&NativeDruidRigPolicy.HeroRatio(1,0)==0,"hero height ratio from measured values");
   }
   Console.WriteLine("scale P1="+rpx[0]/100/husk+" P2="+rpx[1]/100/husk+" P3 oldman="+rpx[2]/100/man+" P3 horn height m="+2.71*rpx[2]/100/man);
   foreach(var clip in source.GetProperty("clips").EnumerateArray())Near(clip.GetProperty("duration").GetDouble()*60,NativeDruidRigPolicy.Frames(clip.GetProperty("name").GetString()),"real asset duration "+clip.GetProperty("name"));
  }
  Check(NativeDruidRigPolicy.AllClips.Distinct().Count()==38,"unique contract clips");
  // v9.1 state layer, collapse, intro, death
  for(int life=0;life<3;life++)
  {
   var d=Data("idle",null,0);d.BossPhase=life;var pl=NativeDruidRigPolicy.Select(d,false);Check(pl.Life==life&&pl.Overlay=="state_P"+(life+1)&&!pl.Transition,"state overlay life "+life);
   var a=Data("bossSlam","slam",3);a.BossPhase=life;Check(NativeDruidRigPolicy.Select(a,false).Overlay=="state_P"+(life+1),"action keeps state overlay "+life);
  }
  Check(NativeDruidRigPolicy.Select(Data("idle",null,0),false,false,null,false,-1).Life==2,"no lives = state_P3");
  for(int life=0;life<2;life++)
  {
   string name=life==0?"phase12_collapse":"phase23_collapse";double previous=-1;
   for(int t=0;t<=DruidRemodelData.CollapseTicks;t++)
   {
    var rest=Data("bossDruidRest",null,DruidRemodelData.CollapseTicks);rest.BossPhase=life;var p=NativeDruidRigPolicy.Select(rest,false,false,null,true,t);
    Check(p.Name==name&&p.Transition&&p.Overlay==null,"collapse plan "+name);Check(p.Frame>=previous&&p.Frame<=120,"collapse frame bounded");previous=p.Frame;Near(rest.St2,DruidRemodelData.CollapseTicks,"collapse leaves Core St2");
    if(t==0)Near(p.Frame,0,name+" first frame");if(t==DruidRemodelData.CollapseTicks)Near(p.Frame,120,name+" last frame");
   }
  }
  var third=Data("bossDruidRest",null,120);third.BossPhase=2;Check(NativeDruidRigPolicy.Select(third,false,false,null,true,5).Held,"life 3 rest holds idle");
  Check(NativeDruidRigPolicy.Select(Data("bossDruidRest",null,120),false,false,null,true,-1).Held,"unknown collapse time holds idle");
  Near(NativeDruidRigPolicy.Intro(0).Frame,0,"intro first");Near(NativeDruidRigPolicy.Intro(NativeDruidRigPolicy.IntroTicks).Frame,165,"intro last");Check(NativeDruidRigPolicy.Intro(10).Transition&&NativeDruidRigPolicy.Intro(10).Life==0,"intro plan");
  Near(NativeDruidRigPolicy.Death(0,66).Frame,0,"death first");Near(NativeDruidRigPolicy.Death(66,66).Frame,150,"death last");Near(NativeDruidRigPolicy.Death(99,66).Frame,150,"death held after body ticks");Check(NativeDruidRigPolicy.Death(5,66).Life==2,"death is life 3");
  Near(NativeDruidRigPolicy.Frames("state_P2"),1,"state frames");Check(NativeDruidRigPolicy.Palette("druid_husk_bark")=="#2a2018","husk bark palette");
  Check(NativeDruidRigPolicy.Phase23HuskOffFrame==108&&NativeDruidRigPolicy.IntroTicks==90,"authored switch frames");
  DruidSetRule();
  RetouchB();
  EnemyCanvas();
  DruidBounds();
  DruidFrameFallback();
  Console.WriteLine("druid-rigpixel checks="+checks+" failed="+bad);return bad==0?0:1;
 }
}
