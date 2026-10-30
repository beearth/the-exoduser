using System;using System.IO;using System.Collections.Generic;using System.Text.Json;using Exoduser.UnityPort.Core;
partial class Program {
 static int RollTrace(string[] args){
  using var doc=JsonDocument.Parse(File.ReadAllText(args[0]));var opts=new JsonSerializerOptions{IncludeFields=true,PropertyNameCaseInsensitive=true};var cfg=SourceStarterFixture.CreateKiSlash();cfg.StartX=4020;cfg.StartY=7420;cfg.InitialIframes=0;cfg.EnemyAiEnabled=false;
  var s=new Simulation(cfg);s.Random01=()=>.5;s.ApplyEquipment(new InventoryState(JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(args[1]),opts)));s.CrossbowAuto=false;s.SpawnHoles=null;var p=s.Player;p.Hp=p.MaxHp;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;p.Shield=p.MaxShield;p.Iframes=0;int checks=0;var failures=new List<object>();
  foreach(var w in doc.RootElement.GetProperty("trace").EnumerateArray()){
   int tick=w.GetProperty("sample").GetInt32();s.SetRollInput(false,false,false,tick==0,tick==0);s.Tick(0,0,p.X+300,p.Y,false,false);
   double distance=Math.Abs(p.X-w.GetProperty("x").GetDouble())+Math.Abs(p.Y-w.GetProperty("y").GetDouble());
   bool ok=distance<.03&&p.State==w.GetProperty("state").GetString()&&p.StateTicks==w.GetProperty("st2").GetSingle()&&Math.Abs(p.Mana-w.GetProperty("mp").GetDouble())<.005&&Math.Abs(p.Stamina-w.GetProperty("st").GetDouble())<.005&&s.RollActive==w.GetProperty("roll").GetBoolean()&&s.RollMoveT==w.GetProperty("rollTicks").GetDouble()&&Math.Abs(s.HarpGauge-w.GetProperty("gauge").GetDouble())<.005&&p.Iframes==w.GetProperty("iframes").GetSingle();
   checks++;if(!ok)failures.Add(new{tick,distance,actual=new{x=p.X,y=p.Y,state=p.State,st2=p.StateTicks,mp=p.Mana,st=p.Stamina,roll=s.RollActive,rollTicks=s.RollMoveT,gauge=s.HarpGauge,iframes=p.Iframes},expected=w.ToString()});
  }
  File.WriteAllText(args[2],JsonSerializer.Serialize(new{scope="실제 웹 방향키+Space80틱→현재Core, 열린 방향·적제외·초기무적0",checks,failed=failures.Count,failures},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine($"구르기 원문 대조 {checks}, 차이 {failures.Count}");return failures.Count==0?0:2;
 }
}
