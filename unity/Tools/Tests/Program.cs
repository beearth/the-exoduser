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
 static int SinkHazardChecks()
 {
  var s=new Simulation(new SimulationConfig{StageIndex=0,EnemyAiEnabled=false});s.Random01=()=>.5;s.AttachDruidBoss();
  var boss=new EnemyState{IsBoss=true,Etype=0,Hp=1,MaxHp=1,Attack=1,BaseAttack=1,Level=1,Radius=22,X=100,Y=100};s.Enemies.Add(boss);
  var poison=new BossProjectile{DruidPoison=true};var reflected=new BossProjectile{DruidPoison=true,Friendly=true};var other=new BossProjectile();
  s.Druid.Projectiles.Add(poison);s.Druid.Projectiles.Add(reflected);s.Druid.Projectiles.Add(other);
  s.Druid.LavaPools.Add(new LavaPool());s.Druid.Orbs.Add(new DruidOrb());
  s.HarnessKill(boss);
  Check(s.DruidFled&&boss.SinkDruid,"LT-8 stage-0 druid death starts sink");
  Check(!s.Druid.Projectiles.Contains(poison)&&s.Druid.Projectiles.Contains(reflected)&&s.Druid.Projectiles.Contains(other),"LT-8 sink removes only hostile druid poison projectiles");
  Check(s.Druid.LavaPools.Count==0&&s.Druid.Orbs.Count==0,"LT-8 sink clears lava pools and orbs immediately");
  Console.WriteLine("SINK_RESULT "+Rows.Count+" checks / "+failed+" failures");return failed==0?0:2;
 }
 static int Main(string[] args)
 {
  if(args.Length>0&&args[0]=="--sink-only")return SinkHazardChecks();
  var s=Make();var e=s.SpawnNormalEnemy(40,0);
  Check(e.Hp==875&&Near(e.Shield,875)&&e.Attack==31,"source lv1 etype0 HP875 shield875 attack31");
  Check(Near(e.Speed,.645)&&Near(e.Radius,22),"source .5 random movement/radius");
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
  Check(!map.CanMove(0,0,15)&&!map.CanMove(-1,100,15)&&!map.CanMove(float.NaN,0,15),"map wall bounds/nonfinite rejected");
  foreach(var c in mapData.colliders)Check(map.Blocked(c.x,c.y),"original prop ellipse center blocked "+c.x+","+c.y);
  string oracle=args.Length>2?args[2]:"";
  if(File.Exists(oracle)){
   using var doc=JsonDocument.Parse(File.ReadAllText(oracle));int mismatches=0,total=0;
   foreach(var sample in doc.RootElement.GetProperty("samples").EnumerateArray()){
    bool got=map.CanMove(sample[0].GetSingle(),sample[1].GetSingle(),sample[2].GetSingle());if(got!=sample[3].GetBoolean())mismatches++;total++;
   }Check(mismatches==0,"original JS canMv collision oracle "+total+" samples mismatches"+mismatches);
  }
  var result=JsonSerializer.Serialize(new {scope="standalone_dotnet_not_Unity_runtime",passed=failed==0,failed,checks=Rows},new JsonSerializerOptions{WriteIndented=true});
  if(args.Length>0)File.WriteAllText(args[0],result);Console.WriteLine("CORE_RESULT "+Rows.Count+" checks / "+failed+" failures");return failed==0?0:2;
 }
}
