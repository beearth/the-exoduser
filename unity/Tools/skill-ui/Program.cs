using System;using System.IO;using System.Linq;using System.Text.Json;using Exoduser.UnityPort.Core;
class Program {
 static int passed;static void Check(bool ok,string name){if(!ok)throw new Exception(name);passed++;}
 static int Main(){var options=new JsonSerializerOptions{IncludeFields=true};var data=JsonSerializer.Deserialize<SkillUiData>(File.ReadAllText("../../Assets/Exoduser/Resources/Data/skill_ui.json"),options);
 Check(!SkillUiState.AttackHeld(true,false,true,false),"UI slot blocks new attack");
 Check(SkillUiState.AttackHeld(true,true,true,true),"existing charge follows held input across UI guards");
 Check(!SkillUiState.AttackHeld(false,true,true,true),"actual release ends charge");
 Check(data.slots.Select(s=>s.key).SequenceEqual(new[]{"1","2","3","4","F","Z","LMB","RMB","Shift","E","Q","Ctrl","Space"}),"source slot order");Check(data.skill.id=="kiSlash"&&data.skill.description.Contains("2초"),"source description");
 var sim=new Simulation(SourceStarterFixture.CreateBasicWeapon());sim.Player.Hp=113;sim.Player.Stamina=61;sim.Player.Mana=47;sim.Player.Experience=4;sim.Materials=123;
 string before=JsonSerializer.Serialize(sim.Player,options);int ticks=sim.TickCount;
 for(int i=-1;i<=13;i++)if(i!=6)Check(!SkillUiState.TryEquipKiSlash(sim,i),"unsupported slot must reject "+i);
 Check(SkillUiState.TryEquipKiSlash(sim,6)&&sim.Config.ActiveAttack=="kiSlash","admitted kiSlash activation");Check(JsonSerializer.Serialize(sim.Player,options)==before&&sim.TickCount==ticks&&sim.Materials==123,"selection preserves resources/position/progression/time");
 foreach(string state in new[]{"wSwing","wWindup","wRecover","pStun","fallen"}){sim.Player.State=state;Check(!SkillUiState.TryEquipKiSlash(sim,6),"busy equip rejected "+state);}
 sim.Player.State="idle";sim.Player.KiChargeActive=true;Check(!SkillUiState.TryEquipKiSlash(sim,6),"active charge rejected");sim.Player.KiChargeActive=false;sim.Player.Hp=0;Check(!SkillUiState.TryEquipKiSlash(sim,6),"dead equip rejected");sim.Player.Hp=100;
 sim.Config.KiSlashLevel=1;Check(SkillUiState.StaminaCost(sim)==10,"Lv1 source cost");sim.Config.KiSlashLevel=20;Check(SkillUiState.StaminaCost(sim)==48,"Lv20 source cost");sim.Config.KiSlashLevel=1;
 sim.Player.Stamina=9;Check(SkillUiState.Status(sim)=="체력 부족","unavailable resource");sim.Player.Stamina=10;Check(SkillUiState.Status(sim)=="준비","ready boundary");sim.Player.State="wRecover";sim.Player.StateTicks=30;Check(SkillUiState.Status(sim).Contains("0.5"),"actual action recovery");sim.Player.KiChargeActive=true;sim.Player.KiChargeTicks=80;Check(SkillUiState.Status(sim).Contains("2 / 3"),"actual charge tier");
 File.WriteAllText("result.json",JsonSerializer.Serialize(new{passed,failed=0,scope="slot admission, immutable selection, source costs and actual-state projection"}));Console.WriteLine("SKILL_UI "+passed+" passed");return 0;
 }
}
