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
 // Web game.html salvageVal oracle (unity/Tools/inv-salvage-oracle/oracle.json) + junk salvage behaviour of InventoryState.
 static int SalvageChecks(string oraclePath)
 {
  using(var doc=JsonDocument.Parse(File.ReadAllText(oraclePath))){
   int total=0,mismatches=0;string first="";
   foreach(var row in doc.RootElement.GetProperty("rows").EnumerateArray()){
    var it=new InventoryItem{rarity=row.GetProperty("rarity").GetInt32(),enh=row.GetProperty("enh").GetInt32(),tier=row.GetProperty("tier").GetInt32()};
    int want=row.GetProperty("value").GetInt32(),got=InventoryState.SalvageValue(it);total++;
    if(got!=want){mismatches++;if(first.Length==0)first=" first r"+it.rarity+" e"+it.enh+" t"+it.tier+" want"+want+" got"+got;}
   }
   Check(total==224&&mismatches==0,"web salvageVal oracle "+total+" rows mismatches"+mismatches+first);
  }
  Check(InventoryState.SalvageValue(null)==0,"salvage null item is 0");
  var st=new InventoryState(new InventorySeedData{equipped=new InventoryItem[InventoryState.Slots.Length],bag=new InventoryItem[0]});
  InventoryItem Mk(int r,int t,bool fav,bool junk){return new InventoryItem{slot="ring1",name="r"+r+"t"+t,rarity=r,tier=t,fav=fav,junk=junk};}
  var a=Mk(0,0,false,true);var b=Mk(2,3,false,true);var fav=Mk(4,1,true,true);var keep=Mk(1,0,false,false);
  st.Bag.Add(a);st.Bag.Add(b);st.Bag.Add(fav);st.Bag.Add(keep);st.Selected=keep;
  var junk=st.JunkItems();
  Check(junk.Count==2&&junk.Contains(a)&&junk.Contains(b),"junk list excludes favorites and unmarked");
  int gained=st.SalvageJunk(out int count);
  Check(count==2&&gained==1000+10006,"junk salvage count2 total 11006 ("+gained+")");
  Check(st.Bag.Count==2&&st.Bag.Contains(fav)&&st.Bag.Contains(keep)&&st.Selected==null,"junk salvage keeps favorite/unmarked, clears selection like web");
  Check(st.SalvageJunk(out count)==0&&count==0,"second junk salvage pays nothing");
  Check(st.SalvageOne(fav)==0&&st.Bag.Contains(fav),"single salvage refuses favorite");
  st.Selected=keep;int one=st.SalvageOne(keep);
  Check(one==2000&&!st.Bag.Contains(keep)&&ReferenceEquals(st.Selected,fav),"single salvage pays 2000 and selects next bag item");
  Check(st.SalvageOne(keep)==0,"single salvage of a removed item pays nothing");
  Console.WriteLine("SALVAGE_RESULT "+Rows.Count+" checks / "+failed+" failures");return failed==0?0:2;
 }
 static int Main(string[] args)
 {
  if(args.Length>0&&args[0]=="--sink-only")return SinkHazardChecks();
  if(args.Length>1&&args[0]=="--salvage-only")return SalvageChecks(args[1]);
  var s=Make();var e=s.SpawnNormalEnemy(40,0);
  Check(e.Hp==875&&Near(e.Shield,875)&&e.Attack==31,"source lv1 etype0 HP875 shield875 attack31");
  Check(Near(e.Speed,.645)&&Near(e.Radius,22),"source .5 random movement/radius");
  s.Tick(0,0,100,0,true,false);Check(s.Player.State=="wWindup"&&s.Player.BasicWindup&&!s.Player.KiChargeActive&&Near(s.Player.StateTicks,Simulation.BasicWindupTicks)&&Near(s.Player.Stamina,95),"D-MO-2 first strike winds up 24 ticks, cost5 paid at the input");
  for(int i=0;i<Simulation.BasicWindupTicks-1;i++){s.Tick(0,0,100,0,false,false);Check(s.Player.State=="wWindup"&&Near(e.Shield,875),"windup tick "+(i+2)+" keeps the state and does not hit");}
  s.Tick(0,0,100,0,false,false);Check(s.Player.State=="wSwing"&&!s.Player.BasicWindup&&Near(s.Player.StateTicks,5),"windup tick 25 enters the original swing5");
  s.Tick(0,0,100,0,false,false);Check(Near(e.Shield,875),"no premature hit on swing tick2");
  s.Tick(0,0,100,0,false,false);Check(Near(e.Shield,743)&&e.Hp==875,"original hit on swing frame3 (input+27) JS132 damage shield first");
  while(s.Player.State=="wSwing")s.Tick(0,0,100,0,false,false);Check(s.Player.State=="wRecover"&&Near(s.Player.StateTicks,s.AttackRecoverTicks())&&s.AttackRecoverTicks()==Math.Max(s.AttackRecoverBaseTicks()-Simulation.BasicRecoverRebateTicks,4),"first-strike recover = max(base-6,4)");
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
