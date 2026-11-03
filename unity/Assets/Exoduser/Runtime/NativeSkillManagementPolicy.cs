using System;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Skills;
namespace Exoduser.UnityPort {
 // Only the six live executors may change the skill ledger. Definition-only skills remain viewable, never learned or charged.
 public static class NativeSkillManagementPolicy {
  public static bool Supported(string id){return id=="kiSlash"||Array.IndexOf(Simulation.PortedSkillIds,id)>=0;}
  public static int Level(Simulation sim,string id){return sim==null?0:id=="kiSlash"?Math.Max(1,sim.Config.KiSlashLevel):sim.Skills.Level(id);}
  public static bool CanUpgrade(Simulation sim,string id){return sim!=null&&Supported(id)&&SkillRules.CanUpgrade(Level(sim,id)>0,Level(sim,id),sim.Player.StatPoints,sim.Player.Level);}
  static void SetLevel(Simulation sim,string id,int value){if(value<=0)sim.Skills.Levels.Remove(id);else sim.Skills.Levels[id]=value;if(id=="kiSlash")sim.Config.KiSlashLevel=Math.Max(1,value);}
  public static bool Upgrade(Simulation sim,string id){if(!CanUpgrade(sim,id))return false;sim.Player.StatPoints-=SkillRules.UpgradeSpCost;SetLevel(sim,id,Level(sim,id)+1);return true;}
  public static bool CanLearn(Simulation sim,string id,int sp,int mats,int reqLv){return sim!=null&&Supported(id)&&Level(sim,id)==0&&sim.Player.Level>=reqLv&&sp>=0&&mats>=0&&sim.Player.StatPoints>=sp&&sim.Materials>=sim.MaliceCost(mats);}
  public static bool Learn(Simulation sim,string id,int sp,int mats,int reqLv){if(!CanLearn(sim,id,sp,mats,reqLv))return false;sim.Player.StatPoints-=sp;sim.Materials-=sim.MaliceCost(mats);SetLevel(sim,id,1);return true;}
  public static bool LevelDown(Simulation sim,string id){if(sim==null||!Supported(id)||Level(sim,id)<=1)return false;SetLevel(sim,id,Level(sim,id)-1);sim.Player.StatPoints+=SkillRules.UpgradeSpCost;return true;}
  public static bool CanEquip(Simulation sim,int slot,string id){if(sim==null||!Supported(id)||Level(sim,id)<1)return false;if(slot>=0&&slot<4)return id=="spikeTrap"||id=="iceOrb";switch(slot){case 4:return id=="holyDome";case 6:return id=="kiSlash";case 7:return id=="fireball";case 11:return id=="iceOrb";case 12:return id=="giantSlam";default:return false;}}
  static int Numeric(int slot){return slot<4?slot:slot==4?SkillRules.SlotF:slot==12?SkillRules.SlotSpace:-1;}
  public static bool Equip(Simulation sim,int slot,string id){if(!CanEquip(sim,slot,id))return false;if(slot==6)return SkillUiState.TryEquipKiSlash(sim,slot);if(slot==7){sim.Skills.MagicSkill=id;return true;}if(slot==11){sim.Skills.CtSkill=id;return true;}int n=Numeric(slot);if(n<0)return false;for(int i=0;i<sim.Skills.Slots.Length;i++)if(sim.Skills.Slots[i]==id)sim.Skills.Slots[i]=null;sim.Skills.Slots[n]=id;return true;}
  public static bool Unequip(Simulation sim,int slot){int n=Numeric(slot);if(sim==null||n<0||n>=sim.Skills.Slots.Length||sim.Skills.Slots[n]==null)return false;sim.Skills.Slots[n]=null;return true;}
  public static int ResetRefund(Simulation sim,string id,int learnSp){int level=Level(sim,id);return level<=0?0:(id=="kiSlash"||id=="fireball"?0:Math.Max(0,learnSp))+(level-1)*SkillRules.UpgradeSpCost;}
  public static bool Reset(Simulation sim,string id,int learnSp){if(sim==null||!Supported(id)||Level(sim,id)<1)return false;int refund=ResetRefund(sim,id,learnSp);bool keep=id=="kiSlash"||id=="fireball";if(keep&&Level(sim,id)<=1)return false;sim.Player.StatPoints+=refund;SetLevel(sim,id,keep?1:0);if(!keep){for(int i=0;i<sim.Skills.Slots.Length;i++)if(sim.Skills.Slots[i]==id)sim.Skills.Slots[i]=null;if(sim.Skills.CtSkill==id)sim.Skills.CtSkill=null;}return true;}
 }
}
