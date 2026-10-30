using System;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class Program {
 static int SaveBoundary(string output){
 var rows=new List<object>();int failed=0;Action<bool,string> check=(ok,name)=>{rows.Add(new{name,passed=ok});if(!ok)failed++;};
 try{var encoded=CombatSaveCodec.Encode(new CombatSaveModel());var text=SaveJson.Write(encoded);check(encoded.Get("skills")==null&&encoded.Get("skillSlots")==null,"스킬 없는 모델은 누락 키를 null 참조로 쓰지 않음");check(encoded.Members.Count==5&&SaveJson.Parse(text).Kind==JsonKind.Object,"신규 기본 모델의 저장 직렬화");}catch(Exception e){check(false,"신규 기본 모델 저장 예외: "+e.GetType().Name);}
 var raw=JsonValue.NewObject().Set("player",JsonValue.NewObject()).Set("skills",JsonValue.NewObject().Set("unknownSkill",JsonValue.Of(3.0))).Set("skillSlots",JsonValue.NewArray().Add(JsonValue.Of("unknownSkill")));
 raw.Get("skills").Set("whirlwind",JsonValue.Of(0.0));
 CombatSaveModel decoded;string decodeError;CombatSaveCodec.TryDecode(raw,out decoded,out decodeError);
 var decodedSkills=CombatSaveCodec.Encode(decoded).Get("skills");check(decodedSkills.Has("whirlwind"),"미이식 스킬의 0레벨 키도 저장 왕복 보존");
 decoded.SkillSlots[0]=null;var decodedSlots=CombatSaveCodec.Encode(decoded).Get("skillSlots");check(decodedSlots.Items[0].Kind==JsonKind.String&&decodedSlots.Items[0].Text=="unknownSkill","미이식 슬롯은 빈 소유 슬롯으로 덮지 않음");
 var model=new CombatSaveModel{Raw=raw};var saved=CombatSaveCodec.Encode(model);check(SaveJson.Write(saved.Get("skills"))==SaveJson.Write(raw.Get("skills")),"미소유 스킬 원본 보존");check(SaveJson.Write(saved.Get("skillSlots"))==SaveJson.Write(raw.Get("skillSlots")),"미소유 슬롯 원본 보존");
 File.WriteAllText(output,JsonSerializer.Serialize(new{scope="저장 모델 경계 회귀",failed,checks=rows}));return failed==0?0:2;
 }
 static int MovementOracle(string seedPath,string oraclePath,string output){
 var options=new JsonSerializerOptions{IncludeFields=true,PropertyNameCaseInsensitive=true};using var doc=JsonDocument.Parse(File.ReadAllText(oraclePath));var rows=new List<object>();int failed=0;
 foreach(var test in doc.RootElement.GetProperty("cases").EnumerateArray()){var seed=JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(seedPath),options);foreach(var item in seed.equipped)if(item!=null&&item.slot=="boots")item.spd=test.GetProperty("boots").GetDouble();var cfg=SourceStarterFixture.CreateKiSlash();cfg.EnemyAiEnabled=false;var sim=new Simulation(cfg);sim.ApplyEquipment(new InventoryState(seed));var p=sim.Player;p.Speed=test.GetProperty("speed").GetSingle();p.State=test.GetProperty("state").GetString();p.StateTicks=100;sim.PlayerWebSlow=test.GetProperty("slow").GetBoolean()?60:0;sim.SetPlayerCombatInput(p.State=="sBlock",p.State=="sDraw"||p.State=="kiGather",false);sim.Tick(1,0,300,0,false,false);double expected=test.GetProperty("expected").GetDouble();bool ok=Math.Abs(p.X-expected)<.00001;if(!ok)failed++;rows.Add(new{state=test.GetProperty("state").GetString(),boots=test.GetProperty("boots").GetDouble(),slow=test.GetProperty("slow").GetBoolean(),expected,actual=p.X,passed=ok});}
 File.WriteAllText(output,JsonSerializer.Serialize(new{scope="현재 웹 원문 이동 식 실행 대조",failed,checks=rows}));return failed==0?0:2;
 }
 static int Main(string[] args){
 if(args[0]=="--movement-oracle")return MovementOracle(args[1],args[2],args[3]);
 if(args[0]=="--save-boundary")return SaveBoundary(args[1]);
 var options=new JsonSerializerOptions{IncludeFields=true,PropertyNameCaseInsensitive=true,WriteIndented=true};
 var seed=JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(args[0]),options);
 var rows=new List<object>();int mismatches=0,checks=0;var failures=new List<object>();
 using var web=JsonDocument.Parse(File.ReadAllText(args[1]));
 foreach(string key in new[]{"Walk","Diagonal","RMB","LMB","Q","E"}){
  var cfg=SourceStarterFixture.CreateKiSlash();cfg.StartX=4020;cfg.StartY=7420;cfg.EnemyAiEnabled=false;
  var s=new Simulation(cfg);s.ApplyEquipment(new InventoryState(seed));s.Random01=()=>.5;s.Materials=1000;s.IsProjectileWall=(x,y)=>false;s.CrossbowAuto=false;
  var p=s.Player;p.Hp=p.MaxHp;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;
  for(int f=0;f<90;f++){
   bool held=f<14;s.SetPlayerCombatInput(key=="Q"&&held,key=="E"&&held,false);s.SetRollInput(key=="Diagonal",false,false,true,false);s.SetSkillInput(false,false,false,false,false,false,false,false);s.SetMagicInput(key=="RMB"&&held);
   s.Tick(1,key=="Diagonal"?-1:0,p.X+300,p.Y,key=="LMB"&&held,false);
   rows.Add(new{key,sample=f,x=p.X,y=p.Y,state=p.State,st2=p.StateTicks,st=p.Stamina,mp=p.Mana,magic=s.MaliceOrbs.ConvertAll(b=>new{x=b.X,y=b.Y,vx=b.Vx,vy=b.Vy}),ki=s.Projectiles.FindAll(b=>b.Active).ConvertAll(b=>new{x=b.X,y=b.Y})});
   foreach(var w in web.RootElement.GetProperty("trace").EnumerateArray())if(w.GetProperty("key").GetString()==key&&w.GetProperty("sample").GetInt32()==f){
    double error=Math.Sqrt(Math.Pow(p.X-w.GetProperty("x").GetDouble(),2)+Math.Pow(p.Y-w.GetProperty("y").GetDouble(),2));bool state=p.State==w.GetProperty("state").GetString();checks++;
    bool timer=p.StateTicks==w.GetProperty("st2").GetSingle();
    bool resources=Math.Abs(p.Stamina-w.GetProperty("st").GetDouble())<.005&&Math.Abs(p.Mana-w.GetProperty("mp").GetDouble())<.005;
    bool shots=true;var wm=w.GetProperty("magic");if(wm.GetArrayLength()!=s.MaliceOrbs.Count)shots=false;else for(int k=0;k<s.MaliceOrbs.Count;k++){var b=s.MaliceOrbs[k];if(Math.Abs(b.X-wm[k].GetProperty("x").GetDouble())>.03||Math.Abs(b.Y-wm[k].GetProperty("y").GetDouble())>.03)shots=false;}
    if(error>.03||!state||!timer||!resources||!shots){mismatches++;if(failures.Count<50)failures.Add(new{key,frame=f,error,timer,resources,shots,unity=p.State,web=w.GetProperty("state").GetString(),unitySt2=p.StateTicks,webSt2=w.GetProperty("st2").GetDouble()});}
   }
  }
 }
 File.WriteAllText(args[2],JsonSerializer.Serialize(new{scope="실제 Core 동일 장비·동시입력, 웹 실제 update 로그와 프레임 대조",checks,mismatches,failures,trace=rows},options));Console.WriteLine($"프레임 {checks} / 불일치 {mismatches}");return mismatches==0?0:2;
 }
}