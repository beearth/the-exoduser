using System;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // E03 combat progress save. Web: dbSave/dbRestore/doAutoSave/dbSaveForce (game.html 3542-3986). One file per character under
 // <persistentDataPath>/combat-save-v1 (QA runs: next to the isolated roster). The web resumes a loaded character at the start of the stage
 // (position is not saved), which is exactly what ResetRun builds. Format and field names are the web `characters.data` object.
 public sealed partial class NativeGame
 {
  CombatSaveStore combatStore;bool combatStoreResolved;
  string combatKey="";long combatRevision;
  CombatSaveModel pendingCombat;InventoryState pendingInventory;double pendingMats;
  bool combatBlocked;string combatBlockReason="";
  bool combatPending,combatMenuSeen;float combatLastSave=-100;
  public CombatSaveStatus CombatSaveState {get;private set;}
  public bool CombatSaveRestored {get;private set;}
  const float CombatAutosaveSeconds=30f,CombatForceSpacing=5f;   // web setInterval(doAutoSave,30000); dbSaveForce >= 5 s apart

  CombatSaveStore CombatStore()
  {
   if(combatStoreResolved)return combatStore;
   combatStoreResolved=true;
   // Ordinary run: persistentDataPath. Fixtures without a roster directory stay IO-free (the roster directory is empty for them).
   string roster=lobby==null?"":lobby.CharacterStoreDirectory;
   if(!string.IsNullOrEmpty(roster))combatStore=new CombatSaveStore(Path.Combine(Path.GetDirectoryName(roster),"combat-save-v1"));
   return combatStore;
  }
  public bool HasCombatSave(string characterName){var store=CombatStore();return store!=null&&!string.IsNullOrEmpty(characterName)&&store.Exists(characterName);}
  void DeleteCombatSave(string characterName){var store=CombatStore();if(store!=null&&!string.IsNullOrEmpty(characterName))store.Delete(characterName);}
  void BlockCombatSave(string reason){combatBlocked=true;combatBlockReason=reason;Debug.LogError("COMBAT SAVE not restored, writes disabled to keep the file: "+reason);}

  // ---- ResetRun hook 1: before the Simulation exists (stage index is part of its config) ----
  void CombatBeginRun(SimulationConfig config)
  {
   pendingCombat=null;pendingInventory=null;combatLastRaw=null;combatKey="";combatBlocked=false;combatBlockReason="";CombatSaveRestored=false;combatPending=false;
   var store=lobby==null?null:CombatStore();string name=lobby==null?"":lobby.ActiveCharacterName;
   if(store==null||string.IsNullOrEmpty(name))return;
   combatKey=name;combatRevision=0;
   if(!store.Exists(name))return;                                   // first run of this character: the first save creates the file
   JsonValue data;long revision;CombatSaveStatus status;
   if(!store.TryLoad(name,out data,out revision,out status)){CombatSaveState=status;BlockCombatSave("load "+status);return;}
   CombatSaveState=status;combatRevision=revision;
   if(data.Get("player")==null)return;                              // created but never played (web stores only charIdx then)
   CombatSaveModel m;string error;
   if(!CombatSaveCodec.TryDecode(data,out m,out error)){BlockCombatSave(error);return;}
   if(m.Lv<1||m.Lv>1461||m.Exp<0||m.Exp>int.MaxValue||m.MaxExp<1||m.MaxExp>int.MaxValue||m.Sp>int.MaxValue||m.Ap>int.MaxValue||m.Kills>int.MaxValue||m.Stage<0||m.Stage>1000||m.PotLvHp<0||m.PotLvHp>1000){BlockCombatSave("a value is outside what the Unity player can hold");return;}
   InventoryState inventoryState;
   try{inventoryState=new InventoryState(new InventorySeedData{equipped=(InventoryItem[])m.Equipped.Clone(),bag=m.Bag.ToArray()});}
   catch(ArgumentException e){BlockCombatSave("inventory: "+e.Message);return;}
   double newShared,mats;bool clear;var game=data.Get("game");
   CombatSaveCodec.ResolveMats(game==null?0:CombatSaveCodec.Number(game,"mats",0),store.LoadSharedMats(),out newShared,out mats,out clear);
   if(newShared!=store.LoadSharedMats())store.SaveSharedMats(newShared);
   combatLastRaw=m.Raw;pendingCombat=m;pendingInventory=inventoryState;pendingMats=Math.Min(mats,int.MaxValue);
   config.StageIndex=(int)m.Stage;
  }
  // ---- ResetRun hook 2: right after inventory.Reset() (before the equipment stats are recalculated) ----
  void CombatRestoreState()
  {
   if(pendingCombat!=null)
   {
    var m=pendingCombat;var p=Simulation.Player;
    inventory.Restore(pendingInventory);
    p.Level=(int)m.Lv;p.Experience=(int)m.Exp;p.MaxExperience=(int)m.MaxExp;p.StatPoints=(int)m.Sp;p.PassivePoints=(int)m.Ap;p.TransDate=m.TransLvDate;p.TransCount=(int)m.TransLvCount;
    Simulation.Materials=(int)pendingMats;Simulation.Kills=(int)m.Kills;Simulation.PotionState.PotLv=(int)m.PotLvHp;
     Simulation.RestoreSkills(m.Skills,m.SkillSlots,m.UltSlot,m.ActiveCtSk);
     Simulation.ApplyLoadedStarterSkillDefaults(m.Skills,!BuildFlavor.Current.DemoMode);
     Simulation.ShieldFuse=true; // 원본 _ensureBaseWingStrike는 기존 저장에도 무료 기본 합체 보장   // B03
   }
   else if(combatKey.Length>0&&!combatBlocked){var store=CombatStore();if(store!=null&&store.HasSharedMats)Simulation.Materials=(int)Math.Min(store.LoadSharedMats(),int.MaxValue);}   // account-shared malice, also for a new character
  }
  // ---- ResetRun hook 3: after ApplyEquipment (maxima known; web `pd.hp||P.mhp`) ----
  void CombatRestoreResources()
  {
   if(pendingCombat==null)return;
   var m=pendingCombat;var p=Simulation.Player;
   p.Hp=Mathf.Min(p.MaxHp,(float)CombatSaveCodec.Or(m.Hp,p.MaxHp));p.Mana=Mathf.Min(p.MaxMana,(float)CombatSaveCodec.Or(m.Mp,p.MaxMana));
   p.Stamina=Mathf.Min(p.MaxStamina,(float)CombatSaveCodec.Or(m.St,p.MaxStamina));p.Shield=Mathf.Min(p.MaxShield,(float)m.Shield);
   levelUpSeen=p.Level;CombatSaveRestored=true;pendingCombat=null;pendingInventory=null;
  }

  static double Round3(double v){return Math.Round(v,3);}
  CombatSaveModel CaptureCombat()
  {
   var p=Simulation.Player;var m=new CombatSaveModel{Raw=null};
   m.Lv=p.Level;m.Exp=p.Experience;m.MaxExp=p.MaxExperience;m.Sp=Math.Max(0,p.StatPoints);m.Ap=Math.Max(0,p.PassivePoints);m.TransLvDate=p.TransDate;m.TransLvCount=p.TransCount;
   m.BaseAtk=p.BaseAttack;m.BaseDef=p.BaseDefense;m.Hp=Round3(p.Hp);m.Mhp=p.MaxHp;m.Mp=Round3(p.Mana);m.Mmp=Round3(p.MaxMana);m.St=Round3(p.Stamina);m.Mst=Round3(p.MaxStamina);
   m.Speed=Round3(p.Speed);m.Shield=Round3(p.Shield);m.Mshield=Round3(p.MaxShield);
   for(int i=0;i<m.Equipped.Length;i++)m.Equipped[i]=inventory.State.Equipped[i];
   m.Bag.AddRange(inventory.State.Bag);
   m.Stage=Simulation.Config.StageIndex;m.Kills=Simulation.Kills;m.PotLvHp=Simulation.PotionState.PotLv;m.BagMax=InventoryState.BagMax;
   Simulation.CaptureSkills(out m.Skills,out m.SkillSlots,out m.UltSlot,out m.ActiveCtSk);   // B03
   m.ShieldFuse=Simulation.ShieldFuse;m.ActiveRmbSkill="maliceSwipe"; m.Raw=combatLastRaw;
   return m;
  }
  JsonValue combatLastRaw;

  // Called by gameplay events (level up, equipment change, pause, ...) and by the 30 s timer; coalesced to one write per 5 s.
  public void RequestCombatSave(){if(combatKey.Length>0)combatPending=true;}
  bool CombatSaveAllowed(){return combatKey.Length>0&&!NativeReviewArgs.Any&&!combatBlocked&&Simulation!=null&&firstPractice==null&&lobby!=null&&!lobby.IsBlocking;}
  public bool SaveCombatNow()
  {
   if(!CombatSaveAllowed())return false;
   var store=CombatStore();if(store==null)return false;
   var data=CombatSaveCodec.Encode(CaptureCombat());
   if(!store.SaveSharedMats(Math.Max(0,Simulation.Materials)))Debug.LogWarning("COMBAT SAVE shared malice file not written");
   long revision;CombatSaveStatus status;
   bool ok=store.TrySave(combatKey,data,combatRevision,out revision,out status);
   CombatSaveState=status;combatPending=false;combatLastSave=Time.unscaledTime;
   if(ok){combatRevision=revision;combatLastRaw=data;}
   else Debug.LogWarning("COMBAT SAVE write failed: "+status+" (the previous file is kept)");
   return ok;
  }
  void UpdateCombatSave()
  {
   if(!CombatSaveAllowed()){combatMenuSeen=menu;return;}
   float now=Time.unscaledTime;
   if(now-combatLastSave>=CombatAutosaveSeconds)combatPending=true;
   if(menu&&!combatMenuSeen)combatPending=true;                      // pause / settings opened
   combatMenuSeen=menu;
   if(combatPending&&now-combatLastSave>=CombatForceSpacing)SaveCombatNow();
  }
  void FlushCombatSave(){if(CombatSaveAllowed())SaveCombatNow();}
 }
}
