using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
static class Program
{
 static int passed;
 static void Check(bool value,string name){if(!value)throw new Exception(name);passed++;}
 static FirstPracticeFlow AttackFlow(){var f=new FirstPracticeFlow();f.Start();f.ObserveMovement(0,0,120,0,true);for(int i=0;i<90;i++)f.Tick();return f;}
 static FirstPracticeFlow AtStep(PracticeStep step){var f=new FirstPracticeFlow();f.Start();typeof(FirstPracticeFlow).GetProperty("Index").SetValue(f,Array.IndexOf(FirstPracticeFlow.Order,step));return f;}
 static Simulation Sim(){var config=SourceStarterFixture.CreateKiSlash();config.EnemyAiEnabled=false;return new Simulation(config,SourceStarterFixture.Seed);}
 static void Tick(Simulation s,bool held=false){s.Tick(0,0,1000,0,held,false);}
 static void Wait(Simulation s,int frames){for(int i=0;i<frames;i++)Tick(s);}
 static EnemyState Actor(Simulation s,FirstPracticeFlow f){var e=s.SpawnNormalEnemy(s.Player.X+100,s.Player.Y);e.Hp=e.MaxHp=1;e.Attack=0;e.Speed=0;s.RegisterFirstPracticeActor(e);f.AdmitEnemy(e.Id);return e;}
 static void Bind(Simulation s,FirstPracticeFlow f){s.FirstPracticeHit+=h=>f.ObserveKill(h.EnemyId,h.AttackKind,h.Step,h.ChargeTier,h.Killed,h.FromTick);}
 static void Main(string[] args)
 {
  var f=new FirstPracticeFlow();f.ObserveMovement(0,0,200,0,true);Check(!f.MovementDone,"intro ignores movement");f.Start();
  f.ObserveMovement(0,0,120,0,false);Check(f.MoveDistance==0,"no input cannot count displacement");
  f.ObserveMovement(0,0,0,0,true);Check(f.MoveDistance==0,"blocked input cannot pass");
  f.ObserveMovement(0,0,119,0,true);Check(!f.MovementDone,"119 pixels incomplete");f.ObserveMovement(119,0,120,0,true);Check(f.MovementDone,"120 actual pixels complete");
  for(int i=0;i<89;i++)f.Tick();Check(f.Phase==FirstPracticePhase.Success,"success lasts90 ticks");f.Tick();Check(f.Phase==FirstPracticePhase.Practice&&f.Step==PracticeStep.Left,"next exercise after90 ticks");
  var collision=Sim();var move=new FirstPracticeFlow();move.Start();collision.CanMove=(x,y,r)=>false;
  for(int i=0;i<120;i++){float x=collision.Player.X,y=collision.Player.Y;collision.Tick(1,0,1000,0,false,false);move.ObserveMovement(x,y,collision.Player.X,collision.Player.Y,true);}
  Check(!move.MovementDone&&move.MoveDistance==0,"real collision Tick blocks movement evidence for120 ticks");collision.CanMove=(x,y,r)=>true;
  for(int i=0;i<60&&!move.MovementDone;i++){float x=collision.Player.X,y=collision.Player.Y;collision.Tick(1,0,1000,0,false,false);move.ObserveMovement(x,y,collision.Player.X,collision.Player.Y,true);}
  Check(move.MovementDone&&move.MoveDistance>=120,"real open collision Tick reaches120 actual pixels");
  var s=Sim();f=AttackFlow();Bind(s,f);var external=Actor(s,f);s.HurtEnemy(external,999999);Check(!external.Alive&&f.LeftKills==0,"external HurtEnemy cannot earn a kill");
  var harness=Actor(s,f);s.Player.Facing=0;s.SpawnKiSlash(3,120);Wait(s,3);Check(!harness.Alive&&f.LeftKills==0&&!f.FullChargeKill,"external SpawnKiSlash cannot earn a kill");
  s=Sim();f=AttackFlow();Bind(s,f);Tick(s,true);Wait(s,55);Tick(s,true);Wait(s,55);Tick(s,true);for(int i=0;i<120;i++)Tick(s,true);Tick(s);Check(!f.FullChargeKill&&f.LeftKills==0,"charging and casting without a killed actor cannot pass");
  s=Sim();f=AttackFlow();Bind(s,f);Tick(s,true);Wait(s,55);Tick(s,true);Wait(s,55);Tick(s,true);for(int i=0;i<80;i++)Tick(s,true);Actor(s,f);Tick(s);Wait(s,3);Check(f.LeftKills==1&&!f.FullChargeKill,"tier2 kill counts kill but not fullcharge");
  s=Sim();f=AttackFlow();Bind(s,f);
  var stranger=s.SpawnNormalEnemy(100,0);stranger.Hp=1;stranger.Shield=0;Tick(s,true);Wait(s,130);Check(f.LeftKills==0,"nonlesson actor cannot count");
  for(int i=0;i<10;i++){Actor(s,f);Tick(s,true);Wait(s,130);}
  Check(f.LeftKills==10&&!f.AttackDone,"ten actual kills still require fullcharge kill");
  Tick(s,true);Wait(s,55);Tick(s,true);Wait(s,55);Tick(s,true);for(int i=0;i<120;i++)Tick(s,true);var charged=Actor(s,f);Tick(s);Wait(s,3);
  Check(!charged.Alive&&f.FullChargeKill&&f.AttackDone,"real Tick tier3 kill plus10 completes supported exercise");
  int count=f.LeftKills;f.ObserveKill(charged.Id,"kiSlash",3,3,true,true);Check(f.LeftKills==count,"duplicate evidence cannot count again");
  s=Sim();f=AttackFlow();Bind(s,f);var dummy=Actor(s,f);int shield=(int)dummy.Shield;Tick(s,true);Wait(s,3);
  Check(!dummy.Alive&&dummy.Shield==shield,"lesson actual hit kills while preserving source shield fields");
  Check(s.Kills==0&&s.Materials==0&&s.Player.Experience==0&&s.Player.Level==1&&s.Loot.Count==0&&s.PotionHp+s.PotionMana+s.PotionStamina==0,"lesson kill produces no ordinary rewards");
  var quiet=Sim();var qf=AttackFlow();var still=Actor(quiet,qf);still.X=quiet.Player.X;still.Y=quiet.Player.Y;quiet.Player.Iframes=0;float qhp=quiet.Player.Hp,qshield=quiet.Player.Shield,qx=quiet.Player.X,qy=quiet.Player.Y;
  Wait(quiet,900);Check(!quiet.Config.EnemyAiEnabled&&quiet.Player.Hp==qhp&&quiet.Player.Shield==qshield&&quiet.Player.Poise==4&&quiet.Player.KnockbackX==0&&quiet.Player.KnockbackY==0&&quiet.Player.X==qx&&quiet.Player.Y==qy,"scoped stopped dummy cannot convert atk0 to minimum damage or knockback");
  foreach(bool skip in new[]{true,false}){
   var original=Sim();var control=Sim();original.SpawnNormalEnemy(300,300);control.SpawnNormalEnemy(300,300);original.Materials=17;original.Player.Hp=123;original.Loot.Add(new LootState{Id=42,X=10,Y=20});
   var player=original.Player;var enemy=original.Enemies[0];var loot=original.Loot[0];
   var session=new FirstPracticeSession(original,SourceStarterFixture.CreateKiSlash());var trial=AttackFlow();Bind(session.Arena,trial);Actor(session.Arena,trial);Tick(session.Arena,true);Wait(session.Arena,20);trial.End(skip);var restored=session.End();
   session.Arena.Player.Mana=0;session.Arena.Player.Stamina=0;session.Arena.Player.Hp=1;session.Arena.Player.Shield=0;session.Arena.Player.KnockbackX=3;session.PrepareTick();
   Check(session.Arena.Player.Mana==session.Arena.Player.MaxMana&&session.Arena.Player.Stamina==session.Arena.Player.MaxStamina&&session.Arena.Player.Hp==123&&session.Arena.Player.Shield==original.Player.Shield&&session.Arena.Player.KnockbackX==0,"source per-tick refill stays inside transient arena");
   session.Arena.Config.PlayerSpeed=99;Check(original.Config.PlayerSpeed!=99&&!ReferenceEquals(original.Config,session.Arena.Config),"arena Config shares no mutable reference with original");
   Check(ReferenceEquals(restored,original)&&ReferenceEquals(restored.Player,player)&&ReferenceEquals(restored.Enemies[0],enemy)&&ReferenceEquals(restored.Loot[0],loot),"skip/finish restores whole original object graph");
   Check(restored.Materials==17&&restored.Player.Hp==123&&restored.TickCount==0,"skip/finish preserves original resource and clock");
   var next=restored.SpawnNormalEnemy(400,400);var expected=control.SpawnNormalEnemy(400,400);Check(next.Speed==expected.Speed&&next.Radius==expected.Radius&&next.StateTicks==expected.StateTicks,"skip/finish preserves original RNG");
  }
  // right click: a lesson actor killed by a real fireball explosion inside Tick counts; a non-admitted one and a trap hit do not
  var rs=Sim();var rf=AtStep(PracticeStep.Right);Bind(rs,rf);var shotAt=rs.SpawnNormalEnemy(rs.Player.X+160,rs.Player.Y);shotAt.Hp=shotAt.MaxHp=1;shotAt.Attack=0;shotAt.Speed=0;rs.RegisterFirstPracticeActor(shotAt);rf.AdmitEnemy(shotAt.Id);
  var stray=rs.SpawnNormalEnemy(rs.Player.X+160,rs.Player.Y+300);stray.Hp=stray.MaxHp=1;
  for(int i=0;i<200&&shotAt.Alive;i++){rs.SetMagicInput(true);rs.Tick(0,0,rs.Player.X+160,rs.Player.Y,false,false);}
  Check(!shotAt.Alive&&rf.RightKills==1,"a real fireball explosion kills an admitted lesson actor and counts one right-click kill");
  rf.ObserveKill(shotAt.Id,"fireball",0,0,true,true);Check(rf.RightKills==1,"duplicate fireball evidence cannot count again");
  rf.ObserveKill(stray.Id,"fireball",0,0,true,true);Check(rf.RightKills==1,"non-admitted enemy cannot count");
  rf.ObserveKill(shotAt.Id,"kiSlash",3,3,true,true);Check(rf.RightKills==1&&rf.LeftKills==0,"a ki slash kill cannot earn a right-click kill");
  // spike trap: only the trap zone damages a trap actor; shield absorbs first; completion needs 10 kills AND an escape after placing
  var ts=Sim();var tf=AtStep(PracticeStep.Trap);Bind(ts,tf);ts.PrepareTrapPractice();
  var trapActor=ts.SpawnNormalEnemy(ts.Player.X+30,ts.Player.Y);trapActor.Hp=trapActor.MaxHp=1;trapActor.Shield=trapActor.MaxShield=1;trapActor.Attack=0;trapActor.Speed=0;ts.RegisterFirstPracticeActor(trapActor,true);tf.AdmitEnemy(trapActor.Id);
  ts.HurtEnemy(trapActor,999999);Check(trapActor.Alive,"an ordinary hit cannot kill a spike-trap lesson actor");
  ts.SetSkillInput(true,false,false,false,false,false,false,false);ts.Tick(0,0,ts.Player.X+100,ts.Player.Y,false,false);ts.SetSkillInput(false,false,false,false,false,false,false,false);
  var zone=ts.PracticeTrapZone();Check(zone!=null,"slot 1 places a spike trap zone");tf.ObserveTrap(zone.Id,0,false);Check(tf.TrapPlaced&&!tf.TrapEscaped,"zone placed, not yet escaped");
  for(int i=0;i<60&&trapActor.Alive;i++)ts.Tick(0,0,ts.Player.X+100,ts.Player.Y,false,false);
  Check(!trapActor.Alive&&tf.TrapKills==1,"trap damage ticks defeat the actor and count one trap kill");
  tf.ObserveTrap(zone.Id,119,true);Check(!tf.TrapEscaped,"119 px from the zone is not an escape");tf.ObserveTrap(zone.Id,120,false);Check(!tf.TrapEscaped,"escape needs a held direction");tf.ObserveTrap(zone.Id,120,true);Check(tf.TrapEscaped,"held direction at 120 px completes the escape");
  Check(ts.Kills==0&&ts.Player.Experience==0&&ts.Loot.Count==0,"trap lesson kills give no ordinary rewards");
  var chain=AtStep(PracticeStep.Trap);for(int i=0;i<10;i++){chain.AdmitEnemy(100+i);}chain.ObserveTrap(1,200,true);for(int i=0;i<9;i++)chain.ObserveKill(100+i,"spikeTrap",0,0,true,true);Check(chain.Phase==FirstPracticePhase.Practice,"nine trap kills are not enough");chain.ObserveKill(109,"spikeTrap",0,0,true,true);Check(chain.TrapDone&&chain.Phase==FirstPracticePhase.Done,"ten trap kills after an escape finish the last supported step");
  var order=new FirstPracticeFlow();order.Start();order.ObserveMovement(0,0,120,0,true);for(int i=0;i<90;i++)order.Tick();Check(order.Step==PracticeStep.Left,"flow order move then left");
  using(var data=JsonDocument.Parse(File.ReadAllText(args[0]))){Check(data.RootElement.GetProperty("movementPixels").GetInt32()==120&&data.RootElement.GetProperty("leftKills").GetInt32()==10&&data.RootElement.GetProperty("fullChargeFrames").GetInt32()==120,"source ledger objective thresholds");Check(data.RootElement.GetProperty("entries").GetArrayLength()==32,"thirty-two exact KO EN source pairs (first two exercises, right click, spike trap, labels, states)");foreach(var entry in data.RootElement.GetProperty("entries").EnumerateArray())if(entry.GetProperty("id").GetString()=="attackHint")foreach(var lang in new[]{"ko","en"}){string copy=entry.GetProperty(lang).GetString();Check(copy.Contains("\n")&&!copy.Contains("\\n"),"runtime source copy contains actual newline for "+lang);}}
  Console.WriteLine("FIRST PRACTICE PASS "+passed);if(args.Length>1)File.WriteAllText(args[1],JsonSerializer.Serialize(new{passed,failed=0,scope="new first practice model/real Simulation.Tick evidence only; no Unity rendering or OS input"}));
 }
}
