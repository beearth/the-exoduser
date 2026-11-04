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
  foreach(var pair in new[]{new[]{"druid_bone","#b9ad90"},new[]{"druid_bark","#4a3826"},new[]{"druid_feather","#1c2024"},new[]{"druid_hair","#2a2624"},new[]{"druid_beard","#8f8a82"},new[]{"druid_glow","#a8642a"},new[]{"druid_moss","#36421f"},new[]{"staff_bark","#4a3826"},new[]{"staff_leather","#2e231b"},new[]{"staff_bone","#b9ad90"},new[]{"lantern_orb","#a8642a"},new[]{"front_panel_cloth","#26211d"}})Check(NativeDruidRigPolicy.Palette(pair[0])==pair[1],"LOCK palette "+pair[0]);Check(NativeDruidRigPolicy.Palette("iron")==null,"hero palette isolated");
  using(var json=JsonDocument.Parse(File.ReadAllText("unity/Assets/Exoduser/Resources/Art/Bosses/Druid/oldman-import.json")))
  {
   var source=json.RootElement;Check(source.GetProperty("sourceVersion").GetString()=="v9.1","current source");Check(source.GetProperty("clips").GetArrayLength()==38,"38 imported clips");
   Check(source.GetProperty("boneCount").GetInt32()==65&&source.GetProperty("oldManBones").GetInt32()==34&&source.GetProperty("huskBones").GetInt32()==23&&source.GetProperty("huskPoseBones").GetInt32()==6,"65 bones = 34 + 23 HK + 6 HP + OM_Lift/OM_Staff");
   Check(source.GetProperty("oldManTriangles").GetInt32()==78323&&source.GetProperty("huskTriangles").GetInt32()==73906,"triangle contract");
   Check(source.GetProperty("socketParent").GetString()=="OM_Staff"&&source.GetProperty("rigidHuskCorrectedErrorMetres").GetDouble()<.0001&&source.GetProperty("socketCorrectedErrorMetres").GetDouble()<.0001,"socket rest restored");
   double husk=source.GetProperty("huskFootRadiusMetres").GetDouble(),man=source.GetProperty("oldManFootRadiusMetres").GetDouble();Check(husk>0&&man>0,"measured footprints");
   // Scale rule: footprint circle = Core hit radius (Core: Round(OrigR*BodyScale), px/100 world). No display multiplier.
   double origR=44;double[] rpx=new double[3];for(int i=0;i<3;i++){rpx[i]=Math.Max(10,Math.Round(origR*DruidRemodelData.BodyScale[i]));}
   Near(rpx[0],44,"P1 Core radius px");Near(rpx[1],37,"P2 Core radius px");Near(rpx[2],31,"P3 Core radius px");
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
  Check(NativeDruidRigPolicy.Phase23HuskOffFrame==108&&NativeDruidRigPolicy.IntroTicks==90,"authored switch frames");Console.WriteLine("druid-rigpixel checks="+checks+" failed="+bad);return bad==0?0:1;
 }
}
