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
 static int QeBoundary(string output){
 var rows=new List<object>();int failed=0;Action<bool,string> check=(ok,name)=>{rows.Add(new{name,passed=ok});if(!ok)failed++;};
 var cfg=SourceStarterFixture.CreateKiSlash();cfg.EnemyAiEnabled=false;cfg.InitialIframes=0;var s=new Simulation(cfg);s.Random01=()=>.5;
 check(s.Skills.Learned("maliceSwipe")&&s.Skills.Learned("shieldThrow"),"신규 캐릭터 기본 칼등처내기·불꽃칼날 학습");
 s.SetPlayerCombatInput(false,true,false);s.Tick(0,0,300,0,false,false);s.SetPlayerCombatInput(false,false,false);s.Tick(0,0,300,0,false,false);
 var st=typeof(Simulation);Func<string,double> number=name=>{var f=st.GetField(name);return f==null?0:Convert.ToDouble(f.GetValue(s));};Func<int> waveCount=()=>{var f=st.GetField("ShieldWaves");return f==null?0:((System.Collections.ICollection)f.GetValue(s)).Count;};
 check(s.Player.State=="sBash","E 탭은 기존 sBash로 진입");check(s.Player.Iframes==40,"불꽃칼날 발동 시40틱 무적");check(number("ShieldThrowCd")==704,"시전틱 쿨다운705→704");check(number("ShieldWingTicks")==39,"시전틱 강화40→39");check(waveCount()==1,"기본 합체의 파동을1개 생성");
 for(int i=0;i<17;i++){s.SetPlayerCombatInput(false,false,false);s.Tick(0,0,300,0,false,false);}check(waveCount()==0,"파동이210px 사거리 초과 후 소멸");
 var r=new Simulation(cfg);r.Random01=()=>.5;r.AttachDruidBoss();r.AfterEnemyTick=null;r.AutoShieldThrow();var enemy=new EnemyState{Id=99,X=100,Y=0,Radius=10,Hp=100000,MaxHp=100000,Poise=100,MaxPoise=100};r.Enemies.Add(enemy);var rainbow=new BossProjectile{X=37,Y=0,Vx=-1,Life=100,Ml=100,Dmg=10,BlackBean=true};var physical=new BossProjectile{X=37,Y=0,Vx=-1,Life=100,Ml=100,Dmg=10};r.Druid.Projectiles.Add(rainbow);r.Druid.Projectiles.Add(physical);r.GiantSlamCd=100;r.Tick(0,0,300,0,false,false);check(!rainbow.Friendly&&r.ShieldWaveReflections==1,"무지개탄은 E 파동 반사 제외·일반탄만 반사");check(physical.Friendly&&physical.BlueBean&&physical.ParryBlueBean&&physical.Homing&&physical.Life==120,"일반탄은 유도 블루콩 수명120");check(r.GiantSlamCd==69,"물리탄 패링 한 발당 지옥강타 쿨30틱 회복");int hp=enemy.Hp;r.Tick(0,0,300,0,false,false);check(r.ShieldWaveHits==1&&enemy.Hp==hp,"같은 적은 파동1회만 타격");check(enemy.Web._groggy&&enemy.Web.groggyT==90&&enemy.State=="hit","파동 원본 그로기 마커90 보존");
 var d=new Simulation(cfg);d.AutoShieldThrow();d.FireZones.Add(new FireZone{Type="holyDome",X=0,Y=0,R=200,T=9,MaxT=10,Lv=1});d.Tick(0,0,300,0,false,false);check(d.ShieldThrowCd==703,"회복영역 소멸틱에도 원본 쿨 보너스1 적용");
 var b=new Simulation(cfg);b.Random01=()=>.5;var boss=new EnemyState{Id=100,IsBoss=true,X=37,Y=0,Radius=10,Hp=100000,MaxHp=100000,Poise=100,MaxPoise=100};b.Enemies.Add(boss);b.AutoShieldThrow();b.Tick(0,0,300,0,false,false);check(boss.Poise==100&&boss.Web._groggy,"원본 파동은 boss 필드만 검사하며 ib 보스를 임의 치환하지 않음");
 File.WriteAllText(output,JsonSerializer.Serialize(new{scope="신규 캐릭터 E 실제 제어·파동 경계",failed,checks=rows}));Console.WriteLine($"E 경계 실패 {failed}");return failed==0?0:2;
 }
 static int QeOracle(string oraclePath,string output){
 using var doc=JsonDocument.Parse(File.ReadAllText(oraclePath));int checks=0,failed=0;var rows=new List<object>();
 foreach(var row in doc.RootElement.GetProperty("cases").EnumerateArray()){
  var i=row.GetProperty("input");var e=row.GetProperty("expected");var cfg=SourceStarterFixture.CreateKiSlash();cfg.EnemyAiEnabled=false;var s=new Simulation(cfg);var eq=new InventoryItem[InventoryItemJson.SlotCount];if(i.GetProperty("shield").GetBoolean())eq[Array.IndexOf(InventoryState.Slots,"shield")]=new InventoryItem{slot="shield",atk=i.GetProperty("shieldAtk").GetDouble()};eq[Array.IndexOf(InventoryState.Slots,"cape")]=new InventoryItem{slot="cape",affixes=new[]{new InventoryAffix{id="skillBoost",value=.12}}};s.ApplyEquipment(new InventoryState(new InventorySeedData{equipped=eq,bag=new InventoryItem[0]}));s.Player.X=4020;s.Player.Y=7420;s.Player.Facing=i.GetProperty("angle").GetSingle();s.Player.BaseAttack=i.GetProperty("baseAtk").GetInt32();s.Player.Iframes=i.GetProperty("iframes").GetSingle();s.ShieldFuse=i.GetProperty("fused").GetBoolean();s.SBashChgMul=i.GetProperty("charge").GetDouble();s.Skills.Levels["maliceSwipe"]=s.Skills.Levels["shieldThrow"]=i.GetProperty("lv").GetInt32();s.AutoShieldThrow();
  Action<bool,string> check=(ok,key)=>{checks++;if(!ok){failed++;if(rows.Count<30)rows.Add(new{input=i.ToString(),key});}};Action<double,double,string> close=(a,b,key)=>check(Math.Abs(a-b)<.00001,key);
  close(s.ShieldThrowCd,e.GetProperty("cd").GetDouble(),"쿨다운");close(s.ShieldWingTicks,e.GetProperty("wing").GetDouble(),"강화수명");close(s.Player.Iframes,e.GetProperty("iframes").GetDouble(),"기존무적보존");close(s.LastShieldThrowDamage,e.GetProperty("damage").GetDouble(),"원본피해");
  var wave=e.GetProperty("wave");check(s.ShieldWaves.Count==(wave.ValueKind==JsonValueKind.Null?0:1),"파동생성");if(s.ShieldWaves.Count>0){var w=s.ShieldWaves[0];close(w.X,wave.GetProperty("x").GetDouble(),"발사x");close(w.Y,wave.GetProperty("y").GetDouble(),"발사y");close(w.Vx,wave.GetProperty("vx").GetDouble(),"속도x");close(w.Vy,wave.GetProperty("vy").GetDouble(),"속도y");close(w.Radius,wave.GetProperty("r").GetDouble(),"판정길이");close(w.Width,wave.GetProperty("width").GetDouble(),"판정폭");close(w.MaxDist,wave.GetProperty("maxDist").GetDouble(),"사거리");foreach(var p in row.GetProperty("points").EnumerateArray())check(Simulation.InShieldWave(w,p.GetProperty("x").GetDouble(),p.GetProperty("y").GetDouble(),0)==p.GetProperty("hit").GetBoolean(),"파동직사각경계");}
 }
 File.WriteAllText(output,JsonSerializer.Serialize(new{scope="현재 웹 원본 E 불꽃칼날 수치·판정 경계",checks,failed,failures=rows}));Console.WriteLine($"E 원본 대조 {checks}, 차이 {failed}");return failed==0?0:2;
 }
 static int Main(string[] args){
 if(args[0]=="--qe-oracle")return QeOracle(args[1],args[2]);
 if(args[0]=="--qe-boundary")return QeBoundary(args[1]);
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