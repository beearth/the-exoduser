using System;
namespace Exoduser.UnityPort.Core {
 [Serializable] public sealed class SkillUiData {public string sourceSha256,forgeSha256;public SkillUiDescription skill;public SkillUiSlot[] slots;}
 [Serializable] public sealed class SkillUiDescription {public string id,name,description,descriptionEn;}
 [Serializable] public sealed class SkillUiSlot {public string key,kind,definition,variable;public int index;}
 // UI admission only. The existing Simulation owns attacks, costs, timing and damage.
 public static class SkillUiState {
  public const int LmbSlot=6,SlotCount=13;
  // UI guards prevent a new attack, but only an actual button release ends an existing charge.
  public static bool AttackHeld(bool held,bool releaseFence,bool overSlot,bool charging)=>held&&(charging||(!releaseFence&&!overSlot));
  public static float StaminaCost(Simulation sim)=>sim.Config.ActiveAttack=="kiSlash"?10+(Math.Max(1,sim.Config.KiSlashLevel)-1)*2:5;
  public static bool TryEquipKiSlash(Simulation sim,int slot){
   if(sim==null||slot!=LmbSlot||sim.Player.Hp<=0||sim.Player.State!="idle"||sim.Player.KiChargeActive)return false;
   sim.Config.ActiveAttack="kiSlash";return true;
  }
  public static string Status(Simulation sim){
   var p=sim.Player;
   if(p.Hp<=0)return "전투 불가";
   if(p.KiChargeActive)return "충전 "+Simulation.KiChargeTier(p.KiChargeTicks)+" / 3 · 놓으면 발사";
   if(p.State=="wRecover")return "공격 회복 "+(Math.Max(0,p.StateTicks)/60f).ToString("0.0")+"초";
   if(p.State!="idle")return p.State=="wSwing"?"공격 중":"행동 중";
   if(p.Stamina<StaminaCost(sim))return "체력 부족";
   return "준비";
  }
 }
}
