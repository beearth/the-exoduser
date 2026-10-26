using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort;
class Program
{
 static readonly List<object> Rows=new List<object>(); static int failed;
 static void Check(bool ok,string name){Rows.Add(new {name,passed=ok});if(!ok){failed++;Console.WriteLine("FAIL "+name);}}
 static bool Near(double x,double y,double eps=.0001){return Math.Abs(x-y)<=eps;}
 static Simulation Make(){var s=new Simulation(new SimulationConfig{EnemyAiEnabled=false});s.Random01=()=>.5;return s;}
 static int Main(string[] args)
 {
  var s=Make();var e=s.SpawnNormalEnemy(40,0);
  Check(e.Hp==875&&Near(e.Shield,875)&&e.Attack==31,"source lv1 etype0 HP875 shield875 attack31");
  Check(Near(e.Speed,.645)&&Near(e.Radius,22),"source .5 random movement/radius");
  var opening=Make();int openingDraws=0;double[] openingTape={.5,.1,.2,.3,.4,.5,.6,.7,.8};opening.Random01=()=>openingTape[openingDraws++];
  var openingEnemy=opening.SpawnOpeningEnemy(40,0);
  Check(openingDraws==9&&openingEnemy.Elite==0&&openingEnemy.Hp==875&&Near(openingEnemy.Speed,.597)&&Near(openingEnemy.Radius,20.8,.00001)&&Near(openingEnemy.StateTicks,45)&&Near(openingEnemy.Facing,Math.PI*.8)&&Near(openingEnemy.ProjectileTicks,240)&&Near(openingEnemy.BossPatternTicks,42)&&Near(openingEnemy.BossOrbitAngle,Math.PI*1.4)&&Near(openingEnemy.ErraticAngle,Math.PI*1.6),"opening ordinary constructor consumes nine source draws including dormant boss orbit and erratic angle");
  opening=Make();openingDraws=0;double[] eliteTape={.01,.75,.1,.2,.3,.4,.5,.6,.7,.8};opening.Random01=()=>eliteTape[openingDraws++];openingEnemy=opening.SpawnOpeningEnemy(40,0);
  Check(openingDraws==10&&openingEnemy.Elite==1&&openingEnemy.EliteAttackModifier==30&&openingEnemy.Hp==1751&&openingEnemy.Attack==40&&Near(openingEnemy.Radius,22.464,.00001)&&Near(openingEnemy.ProjectileCooldownTicks,192)&&Near(openingEnemy.ErraticAngle,Math.PI*1.6),"opening magic3percent source roll includes M30 draw and applies multipliers before integer truncation");
  opening=Make();openingDraws=0;opening.Random01=()=>{openingDraws++;return .5;};opening.CanMove=(x,y,r)=>false;
  Check(opening.SpawnOpeningEnemy(40,0)==null&&openingDraws==0,"opening rejected position consumes neither elite nor constructor RNG");
  opening=Make();openingEnemy=opening.SpawnOpeningEnemy(40,0);for(int i=0;i<19;i++)opening.Tick(0,0,100,0,false,false);
  bool openingFading=openingEnemy.SpawnTicks==1;opening.Tick(0,0,100,0,false,false);
  Check(openingFading&&openingEnemy.SpawnTicks==0,"opening source20tick spawn fade expires in simulation, independently of render frames");
  s.Tick(0,0,100,0,true,false);Check(s.Player.State=="wSwing"&&Near(s.Player.StateTicks,5)&&Near(s.Player.Stamina,95),"original swing5/cost5 admission");
  s.Tick(0,0,100,0,false,false);Check(Near(e.Shield,875),"no premature hit tick2");
  s.Tick(0,0,100,0,false,false);Check(Near(e.Shield,743)&&e.Hp==875,"original hit on frame3 JS132 damage shield first");
  s=Make();s.Tick(1,1,100,0,false,false);Check(Near(s.Player.X,2.6/Math.Sqrt(2))&&Near(s.Player.Y,2.6/Math.Sqrt(2)),"diagonal normalization original2.6px");
  s=Make();s.CanMove=(x,y,r)=>x<=0;s.Tick(1,1,100,0,false,false);Check(Near(s.Player.X,0)&&Near(s.Player.Y,2.6/Math.Sqrt(2)),"wall collision axis slide");
  s=Make();e=s.SpawnNormalEnemy(40,0);s.HurtEnemy(e,875);Check(e.Hp==875&&Near(e.Shield,0)&&s.Kills==0,"shield depletion is not death");
  s.HurtEnemy(e,875);Check(!e.Alive&&s.Kills==1&&s.Materials==4&&s.Player.Experience==1,"source death rewards4mat1XP exactly once");
  s.HurtEnemy(e,875);Check(s.Kills==1&&s.Materials==4,"duplicate death pays nothing");
  s=Make();for(int i=0;i<15;i++){e=s.SpawnNormalEnemy(40,0);s.HurtEnemy(e,875);s.HurtEnemy(e,875);}
  Check(s.Player.Level==2&&s.Player.Experience==0&&s.Player.MaxExperience==20&&s.Player.StatPoints==3&&s.Player.PassivePoints==1,"15 lv1 kills naturalXP level2 SP3 AP1");
  s=Make();int draws=0;s.Random01=()=>{draws++;return .5;};s.CanMove=(x,y,r)=>false;e=s.SpawnNormalEnemy(40,0);Check(e==null&&draws==0,"rejected position consumes no enemy RNG");
  s=Make();e=s.SpawnNormalEnemy(40,0);s.HurtEnemy(e,1750);s.Tick(0,0,100,0,false,true);Check(s.CollectedLoot.Count==0,"unimplemented item factory cannot fake pickup");
  var mapData=JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[1]),new JsonSerializerOptions{IncludeFields=true});var map=new SourceMap(mapData);
  Check(mapData.width==200&&mapData.height==200&&mapData.chunks.Length==64,"original200x200 map/64chunks");
  Check(map.CanMove(4020,7420,15),"original south start is walkable");
  s=Make();s.Player.X=4020;s.Player.Y=7420;s.CanMove=map.CanMove;e=s.SpawnNormalEnemy(3679.0845f,7829.23f);
  Check(e!=null&&map.CanMove(e.X,e.Y,10)&&!map.CanMove(e.X,e.Y,e.Radius),"opening ring04 source r10 spawn accepts body intersecting tile wall");
  s.Config.EnemyAiEnabled=true;s.RescueEnemyFromTiles=map.RescueEnemyFromTiles;s.PushEnemyOutOfTiles=map.PushEnemyOutOfTiles;
  float ringStartX=e.X,ringStartY=e.Y;s.Tick(0,0,100,0,false,false);
  Check(e.Alive&&map.CanMove(e.X,e.Y,e.Radius)&&(e.X!=ringStartX||e.Y!=ringStartY),"ordinary enemy tick rescues ring04 before pursuit without changing collision geometry");
  double ringDistance=Math.Sqrt((e.X-s.Player.X)*(e.X-s.Player.X)+(e.Y-s.Player.Y)*(e.Y-s.Player.Y));
  for(int i=0;i<53;i++)s.Tick(0,0,100,0,false,false);
  Check(e.Alive&&Math.Sqrt((e.X-s.Player.X)*(e.X-s.Player.X)+(e.Y-s.Player.Y)*(e.Y-s.Player.Y))<ringDistance,"ring04 continues pursuit through54 ticks rather than remaining stuck");
  Check(mapData.altarMoat!=null&&mapData.altarMoat.hill=="Art/map/altar_moat/hill"&&
   mapData.altarMoat.channel=="Art/map/altar_moat/moat"&&mapData.altarMoat.glow=="Art/map/altar_moat/moatGlow"&&
   mapData.altarMoat.bubble=="Art/map/altar_moat/moatBubble","original altar terrain resources bound");
  Check(map.CanMove(5200,3920,15),"west bridge crosses the blocked moat band");
  Check(map.Blocked(5880,4258.4f)&&map.Blocked(6556.8f,3920),"south and east liquid mid-band block movement");
  Check(!map.CanMove(0,0,15)&&!map.CanMove(-1,100,15)&&!map.CanMove(float.NaN,0,15),"map wall bounds/nonfinite rejected");
  foreach(var c in mapData.colliders)Check(map.Blocked(c.x,c.y),"original prop ellipse center blocked "+c.x+","+c.y);
  string oracle=args.Length>2?args[2]:"";
  if(File.Exists(oracle)){
   using var doc=JsonDocument.Parse(File.ReadAllText(oracle));int mismatches=0,total=0;
   foreach(var sample in doc.RootElement.GetProperty("samples").EnumerateArray()){
    bool got=map.CanMove(sample[0].GetSingle(),sample[1].GetSingle(),sample[2].GetSingle());if(got!=sample[3].GetBoolean())mismatches++;total++;
   }Check(mismatches==0,"original JS canMv collision oracle "+total+" samples mismatches"+mismatches);
  }
  var pets=new SourcePets();s=Make();pets.Reset(0,0,0);
  Check(Near(pets.Crow.Y,-20)&&Near(pets.Cat.Y,10)&&Near(pets.Xbow.X,-30)&&Near(pets.Iris.Y,-34),"source four simultaneous pet spawn offsets");
  pets.Tick(s);
  double tx=Math.Cos(.025)*38,ty=-22+Math.Sin(.035)*10;
  Check(Near(pets.Crow.X,tx*.12)&&Near(pets.Crow.Y,-20+(ty+20)*.12)&&pets.Crow.Moving,"crow exact orbit and d*.12 movement");
  Check(Near(pets.Cat.X,Math.Cos(.018)*28*.12)&&Near(pets.Cat.Y,10+(22+Math.Sin(.022)*4)*.12),"cat exact ground follow formula");
  s.Player.X=2000;s.Player.Y=2000;pets.Tick(s);
  Check(Near(pets.Crow.X,1976)&&Near(pets.Crow.Y,1982)&&Near(pets.Cat.X,2018)&&Near(pets.Xbow.X,1970),"source520px unstuck offsets");
  s=Make();e=s.SpawnNormalEnemy(600,0);pets.Reset(0,0,0);pets.Tick(s);
  Check(Near(pets.Iris.X,20+(600+Math.Cos(51*.03)*20-20)*.12)&&Near(pets.Iris.Y,-34+(-e.Radius-15+Math.Sin(51*.03)*8+34)*.12),"iris800px nearest target head orbit");
  double irisX=pets.Iris.X,irisT=pets.Iris.T;pets.IrisOff=true;pets.Tick(s);
  Check(Near(pets.Iris.X,irisX)&&Near(pets.Iris.T,irisT)&&e.Hp==875&&s.Kills==0,"iris off freezes movement and all pets cause no damage");
  int[] runGroups={2,1,0,1,2,1,0,1},idleGroups={1,1,0,1,1,0,0,0};bool mappings=true;
  for(int i=0;i<8;i++)mappings&=SourcePets.CatRunGroup(i)==runGroups[i]&&SourcePets.CatIdleGroup(i)==idleGroups[i]&&SourcePets.CatRunFlip(i)==(i==0||i==1||i==7);
  Check(mappings,"all eight source animation groups and mirrors");
  var petData=JsonSerializer.Deserialize<PetDialogueData>(File.ReadAllText(Path.Combine(Path.GetDirectoryName(args[1]),"pets.json")),new JsonSerializerOptions{IncludeFields=true});
  Check(petData.entries.Length==171&&petData.languages.Length==27&&petData.sourceSha256.StartsWith("dee094fd"),"snapshot171 dialogue IDs plus27 original translation tables");
  var dlg=new SourcePetDialogue(petData);s=Make();dlg.Tick(s,false,0,false,false);
  Check(dlg.CurrentId=="tut_start"&&dlg.Who=="crow"&&dlg.Text=="일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야."&&dlg.Remaining==300&&Near(dlg.Alpha,.6),"original opening line and five second timer");
  dlg.SetLanguage("en");string english=dlg.Text;int remainder=dlg.Remaining;dlg.SetLanguage("ko");
  Check(english!=dlg.Text&&dlg.Remaining==remainder&&dlg.Who=="crow","live source translation refresh preserves active timer and speaker");
  for(int i=0;i<300;i++)dlg.Tick(s,false,0,false,false);
  Check(dlg.Who=="cat"&&dlg.Text=="…아직 살아있네. 좌클릭으로 저것들 쳐봐."&&dlg.Remaining==300,"source response begins exactly after300ticks");
  s.Player.Hp=1;dlg.Tick(s,false,0,false,false);
  Check(dlg.CurrentId=="hp_critical"&&dlg.Who=="crow"&&dlg.Remaining==180,"survival priority interrupts pending response with exact180ticks");
  dlg.Reset();s=Make();e=s.SpawnNormalEnemy(40,0);s.HurtEnemy(e,1);s.HurtPlayer(1);
  Check(s.PetAttackCount==1&&s.PetHitCount==1,"pet counters consume admitted damage entries");
  s.Player.Iframes=999;s.HurtPlayer(1);Check(s.PetHitCount==2,"source hit attempt counts before iframe rejection");
  s.PetLessonActive=true;s.HurtPlayer(1);Check(s.PetHitCount==2,"lesson hit attempt does not advance pet counter");
  var killDialogue=new SourcePetDialogue(petData);var killSim=Make();killSim.Player.Hp=1;killSim.PetKilled+=killDialogue.OnKill;
  var killed=killSim.SpawnNormalEnemy(40,0);killSim.HurtEnemy(killed,1750);
  Check(killDialogue.CurrentId=="low_hp_kill"&&killDialogue.Remaining==240,"source kill callback speaks immediately without waiting for next pet tick");
  var lessonSim=Make();var lessonEnemy=lessonSim.SpawnNormalEnemy(40,0);int lessonKills=0;lessonSim.PetKilled+=_=>lessonKills++;
  lessonSim.RegisterFirstPracticeActor(lessonEnemy);lessonSim.HurtEnemy(lessonEnemy,1);
  Check(lessonSim.PetAttackCount==0&&lessonKills==0&&!lessonEnemy.Alive,"lesson kill bypasses both normal pet attack and kill events");
  pets.Reset(0,0,0); // measure the active iris nearest-target path as well as crow/cat/xbow.
  for(int i=0;i<100;i++)dlg.Tick(s,false,0,false,false);
  long allocated=GC.GetAllocatedBytesForCurrentThread();
  for(int i=0;i<10000;i++){pets.Tick(s);dlg.Tick(s,false,0,false,false);}
  long petBytes=GC.GetAllocatedBytesForCurrentThread()-allocated;
  Check(petBytes==0,"pet motion and dialogue10000stable CPU ticks allocate0bytes (view/GPU unmeasured)");
  var result=JsonSerializer.Serialize(new {scope="standalone_dotnet_not_Unity_runtime",passed=failed==0,failed,checks=Rows},new JsonSerializerOptions{WriteIndented=true});
  if(args.Length>0)File.WriteAllText(args[0],result);Console.WriteLine("CORE_RESULT "+Rows.Count+" checks / "+failed+" failures");return failed==0?0:2;
 }
}
