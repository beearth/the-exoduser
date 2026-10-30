using System;
using System.IO;
using System.Text.Json;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
partial class Program
{
 static int ChainBoundaryTrace(string[] args)
 {
  var root=JsonDocument.Parse(File.ReadAllText(args[0])).RootElement;var failures=new List<object>();int checks=0;
  foreach(var item in root.GetProperty("cases").EnumerateArray())
  {
   var input=item.GetProperty("input");string name=input.GetProperty("name").GetString();int hold=input.GetProperty("hold").GetInt32();float wall=input.TryGetProperty("wall",out var w)?w.GetSingle():0;
   var sim=new Simulation(new SimulationConfig{StartX=0,StartY=0,PlayerStaminaRegen=0,PlayerManaRegen=0,PlayerHpRegen=0,EnemyAiEnabled=false});sim.Random01=()=>.5;sim.CanMove=(x,y,r)=>wall==0||x+r<wall;
   if(input.TryGetProperty("gauge",out var gauge))sim.HarpGauge=gauge.GetDouble();if(input.TryGetProperty("st",out var stamina))sim.Player.Stamina=stamina.GetSingle();
   if(input.TryGetProperty("state",out var state)){sim.Player.State=state.GetString();sim.Player.StateTicks=100;sim.Player.Poise=0;}
   foreach(var row in item.GetProperty("trace").EnumerateArray())
   {
    int frame=row.GetProperty("frame").GetInt32();bool held=frame<hold||(input.TryGetProperty("pressAgain",out var p)&&p.GetInt32()==frame);sim.SetPlayerCombatInput(false,false,held);sim.Tick(0,0,sim.Player.X+1000,sim.Player.Y,false,false);
    var actual=new Dictionary<string,object>{{"x",sim.Player.X},{"y",sim.Player.Y},{"st",sim.Player.Stamina},{"state",sim.Player.State},{"iframes",sim.Player.Iframes},{"poise",sim.Player.Poise},{"gauge",sim.HarpGauge},{"hold",sim.DashHold},{"holdF",sim.DashHoldF},{"harp",sim.HarpActive},{"dash",sim.DashActive},{"tier",sim.HarpTier},{"hx",sim.HarpX},{"hy",sim.HarpY},{"dist",sim.HarpDist},{"maxDist",sim.HarpMaxDist},{"left",sim.DashLeft}};
    foreach(var pair in actual){checks++;var expected=row.GetProperty(pair.Key);bool ok;if(pair.Value is bool b)ok=b==expected.GetBoolean();else if(pair.Value is string s)ok=s==expected.GetString();else ok=Math.Abs(Convert.ToDouble(pair.Value)-expected.GetDouble())<.003;if(!ok)failures.Add(new{사례=name,틱=frame,항목=pair.Key,웹=expected.ToString(),Unity=pair.Value});}
   }
  }
  File.WriteAllText(args[1],JsonSerializer.Serialize(new{검사=checks,불일치=failures.Count,실패=failures},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine($"검사 {checks}, 불일치 {failures.Count}");return failures.Count==0?0:2;
 }
}
