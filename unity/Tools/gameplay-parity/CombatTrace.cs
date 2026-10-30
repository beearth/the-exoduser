using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort.Core;
partial class Program {
 static double Hypot(double x,double y)=>Math.Sqrt(x*x+y*y);
 static int CombatMain(string[] args){
  Console.OutputEncoding=System.Text.Encoding.UTF8;
  using var doc=JsonDocument.Parse(File.ReadAllText(args[0]));var opts=new JsonSerializerOptions{IncludeFields=true,PropertyNameCaseInsensitive=true};var trace=new List<object>();var failures=new List<object>();int checks=0,failed=0;
  foreach(var test in doc.RootElement.GetProperty("initial").EnumerateArray()){
   string name=test.GetProperty("name").GetString();var cfg=SourceStarterFixture.CreateKiSlash();cfg.StartX=4020;cfg.StartY=7420;cfg.EnemyAiEnabled=true;cfg.InitialIframes=0;var s=new Simulation(cfg);s.Random01=()=>.5;s.ApplyEquipment(new InventoryState(JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(args[1]),opts)));s.AttachDruidBoss();s.CrossbowAuto=false;s.SpawnHoles=null;s.Materials=1000;s.IsProjectileWall=(x,y)=>false;var p=s.Player;p.Hp=p.MaxHp;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;p.Shield=p.MaxShield;p.Iframes=0;
   var e=s.SpawnEnemy(p.X+(name=="타격넉백"?70:300),p.Y,0);e.Alerted=true;e.State="idle";e.StateTicks=0;e.ProjectileTicks=0;e.Web.projCd=1000000000;
   var rows=doc.RootElement.GetProperty("trace").EnumerateArray().Where(x=>x.GetProperty("key").GetString()==name).ToArray();
   if(test.TryGetProperty("execution",out var execution)){
    var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
    typeof(Simulation).GetMethod("EnsureEnemyLoop",flags).Invoke(s,null);
    var context=(EnemyTickContext)typeof(Simulation).GetField("tickCtx",flags).GetValue(s);
    context.EnemyTierFrame=execution.GetProperty("enemyTierFrame").GetDouble();
    s.CrossbowAuto=execution.GetProperty("xbowEnabled").GetBoolean();s.CrossbowTimer=execution.GetProperty("xbowTimer").GetDouble();
    if(execution.TryGetProperty("pet",out var pet)){
     var type=typeof(Simulation);foreach(var pair in new[]{new KeyValuePair<string,object>("CrossbowPetEnabled",true),new KeyValuePair<string,object>("CrossbowPetX",pet.GetProperty("x").GetDouble()),new KeyValuePair<string,object>("CrossbowPetY",pet.GetProperty("y").GetDouble()),new KeyValuePair<string,object>("CrossbowPetT",pet.GetProperty("t").GetDouble())}){var field=type.GetField(pair.Key);if(field!=null)field.SetValue(s,pair.Value);}
    }
   }
   if(args.Length>3&&args[3]=="--phase-diagnosis"){
    // 재생 시작 시 글로벌 AI 격프레임 위상을 기록하지 않은 첫 촬영의 원인 진단 전용이다.
    // 첫 적 타이머 변화로 홀짝만 재구성하며 최종 동작 합격 근거로 사용하지 않는다.
    var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
    typeof(Simulation).GetMethod("EnsureEnemyLoop",flags).Invoke(s,null);
    var context=(EnemyTickContext)typeof(Simulation).GetField("tickCtx",flags).GetValue(s);
    context.EnemyTierFrame=rows[0].GetProperty("enemy").GetProperty("st2").GetDouble()<0?1:0;
   }
   for(int frame=0;frame<300;frame++){
    s.SetPlayerCombatInput(false,false,false);s.SetMagicInput(false);s.SetSkillInput(false,false,false,false,false,false,false,false);s.SetRollInput(false,false,false,name=="이동추적",false);s.Tick(name=="이동추적"?1:0,0,p.X+300,p.Y,name=="타격넉백"&&frame<14,false);
    var w=rows[frame];var we=w.GetProperty("enemy");double distance=Hypot(p.X-w.GetProperty("x").GetDouble(),p.Y-w.GetProperty("y").GetDouble());
    bool player=distance<.08&&Math.Abs(p.Hp-w.GetProperty("hp").GetDouble())<.005&&Math.Abs(p.Shield-w.GetProperty("shield").GetDouble())<.01&&p.State==w.GetProperty("state").GetString()&&p.StateTicks==w.GetProperty("st2").GetSingle();
    bool enemy=we.ValueKind==JsonValueKind.Null?!e.Alive:Hypot(e.X-we.GetProperty("x").GetDouble(),e.Y-we.GetProperty("y").GetDouble())<.08&&e.State==we.GetProperty("state").GetString()&&e.StateTicks==we.GetProperty("st2").GetSingle()&&Math.Abs(e.Hp-we.GetProperty("hp").GetDouble())<.01&&Math.Abs(e.Shield-we.GetProperty("shield").GetDouble())<.01&&e.Alive==we.GetProperty("alive").GetBoolean();
    checks++;if(!player||!enemy){failed++;if(failures.Count<20)failures.Add(new{name,frame,player,enemy,distance,actual=new{px=p.X,py=p.Y,hp=p.Hp,shield=p.Shield,state=p.State,timer=p.StateTicks,ex=e.X,ey=e.Y,ehp=e.Hp,eshield=e.Shield,es=e.State,et=e.StateTicks},expected=w.ToString()});}
    trace.Add(new{key=name,frame,x=p.X,y=p.Y,hp=p.Hp,shield=p.Shield,state=p.State,st2=p.StateTicks,enemy=new{x=e.X,y=e.Y,hp=e.Hp,shield=e.Shield,state=e.State,st2=e.StateTicks,alive=e.Alive}});
   }
  }
  File.WriteAllText(args[2],JsonSerializer.Serialize(new{범위="웹 실제 update 대 실제 Simulation, 단일적·열린지형·난수.5·탄막타이머제외",checks,failed,failures,trace},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine($"적 연속 대조 {checks}, 차이 {failed}");return failed==0?0:2;
 }
}
