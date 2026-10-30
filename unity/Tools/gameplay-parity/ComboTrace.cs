using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
partial class Program {
 static int ComboTrace(string[] args){
  using var web=JsonDocument.Parse(File.ReadAllText(args[0]));
  var opt=new JsonSerializerOptions{IncludeFields=true,PropertyNameCaseInsensitive=true};
  var seed=JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(args[1]),opt);
  var failures=new List<object>();var trace=new List<object>();int checks=0,mismatches=0;
  foreach(var test in web.RootElement.GetProperty("cases").EnumerateArray()){
   string name=test.GetProperty("name").GetString();int release=test.GetProperty("release").GetInt32(),q=test.GetProperty("q").GetInt32();
   var cfg=SourceStarterFixture.CreateKiSlash();cfg.StartX=4020;cfg.StartY=7420;cfg.EnemyAiEnabled=false;
   var s=new Simulation(cfg);s.ApplyEquipment(new InventoryState(seed));s.CrossbowAuto=false;s.Random01=()=>.5;s.IsProjectileWall=(x,y)=>false;
   var p=s.Player;p.Hp=p.MaxHp;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;
   var expected=web.RootElement.GetProperty("trace").EnumerateArray().Where(x=>x.GetProperty("key").GetString()==name).ToArray();
   for(int frame=0;frame<260;frame++){
    s.SetPlayerCombatInput(q>=0&&frame>=q&&frame<q+20,false,false);s.SetMagicInput(false);s.SetSkillInput(false,false,false,false,false,false,false,false);s.SetRollInput(false,false,false,true,false);
    s.Tick(1,0,p.X+300,p.Y,frame<release,false);
    var w=expected[frame];var shots=s.Projectiles.Where(x=>x.Active).ToArray();var wk=w.GetProperty("ki");
    double distance=Math.Sqrt(Math.Pow(p.X-w.GetProperty("x").GetDouble(),2)+Math.Pow(p.Y-w.GetProperty("y").GetDouble(),2));
    bool state=p.State==w.GetProperty("state").GetString()&&p.StateTicks==w.GetProperty("st2").GetSingle();
    bool charge=p.KiChargeActive==w.GetProperty("charging").GetBoolean()&&p.KiChargeTicks==w.GetProperty("charge").GetSingle();
    bool combo=s.KiComboStep==w.GetProperty("step").GetInt32()&&s.KiComboTicks==w.GetProperty("combo").GetSingle()&&s.KiCooldownTicks==w.GetProperty("cd").GetSingle();
    bool resources=Math.Abs(p.Stamina-w.GetProperty("st").GetDouble())<.005&&Math.Abs(p.Mana-w.GetProperty("mp").GetDouble())<.005;
    bool projectiles=shots.Length==wk.GetArrayLength();
    if(projectiles)for(int j=0;j<shots.Length;j++){var a=shots[j];var b=wk[j];if(Math.Abs(a.X-b.GetProperty("x").GetDouble())>.05||Math.Abs(a.Y-b.GetProperty("y").GetDouble())>.05||a.Step!=b.GetProperty("step").GetInt32()||a.Life!=b.GetProperty("life").GetSingle()||a.Damage!=b.GetProperty("dmg").GetInt32()||Math.Abs(a.Radius-b.GetProperty("r").GetDouble())>.001)projectiles=false;}
    checks++;if(distance>.05||!state||!charge||!combo||!resources||!projectiles){mismatches++;if(failures.Count<30)failures.Add(new{name,frame,distance,state,charge,combo,resources,projectiles,actual=p.State,timer=p.StateTicks,chargeT=p.KiChargeTicks,comboT=s.KiComboTicks,shots=shots.Length,expected=w.ToString()});}
    trace.Add(new{name,frame,x=p.X,y=p.Y,state=p.State,st2=p.StateTicks,st=p.Stamina,mp=p.Mana,charge=p.KiChargeTicks,charging=p.KiChargeActive,step=s.KiComboStep,combo=s.KiComboTicks,cd=s.KiCooldownTicks,ki=shots.Select(a=>new{x=a.X,y=a.Y,dmg=a.Damage,step=a.Step,life=a.Life,r=a.Radius}).ToArray()});
   }
  }
  File.WriteAllText(args[2],JsonSerializer.Serialize(new{범위="실제 현재 Core와 웹 update의 3타 충전·이동·Q캔슬 연속대조",checks,mismatches,failures,trace},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine($"3타 연속 {checks}, 차이 {mismatches}");return mismatches==0?0:2;
 }
}