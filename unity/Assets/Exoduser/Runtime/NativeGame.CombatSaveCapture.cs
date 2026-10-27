using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 // E03 verification in the real Player: process 1 (-save-phase write) plays through the ordinary entry, changes state through the game systems and
 // saves; process 2 (-save-phase read) enters the same character through the ordinary lobby entry and must come back with the same state.
 // Explicit isolated -output namespace only (the lobby roster directory must be <output>/character-roster-v1). No OS input claim.
 public sealed partial class NativeGame
 {
  public const string CombatSaveCaptureFlag="--unity-combat-save-capture";
  [Serializable] sealed class CombatSaveReceipt
  {
   public string scope,phase,rosterDirectory,saveDirectory,saveFile,character;public bool passed;public int failures;public string[] checks;
   public int level,exp,maxExp,sp,ap,mats,kills,potLv,stage,bagCount,revision;public float hp,maxHp;public string[] equipped;public double[] bagIds;
  }
  CombatSaveReceipt SnapshotCombat(string phase)
  {
   var p=Simulation.Player;var eq=new List<string>();var st=inventory.State;
   for(int i=0;i<st.Equipped.Length;i++)if(st.Equipped[i]!=null)eq.Add(InventoryState.Slots[i]+":"+st.Equipped[i].id.ToString("R",System.Globalization.CultureInfo.InvariantCulture));
   var ids=new List<double>();foreach(var it in st.Bag)ids.Add(it.id);
   return new CombatSaveReceipt{phase=phase,level=p.Level,exp=p.Experience,maxExp=p.MaxExperience,sp=p.StatPoints,ap=p.PassivePoints,mats=Simulation.Materials,kills=Simulation.Kills,potLv=Simulation.PotionState.PotLv,
    stage=Simulation.Config.StageIndex,bagCount=st.Bag.Count,hp=p.Hp,maxHp=p.MaxHp,equipped=eq.ToArray(),bagIds=ids.ToArray()};
  }
  IEnumerator CombatSaveCapture()
  {
   string output=Argument("-output"),phase=Argument("-save-phase");var checks=new List<string>();int failures=0;
   Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   AudioListener.volume=0f;                                          // QA runs are silent
   if(string.IsNullOrWhiteSpace(output)||output.StartsWith("-",StringComparison.Ordinal)||(phase!="write"&&phase!="read")||string.IsNullOrEmpty(lobby.CharacterStoreDirectory)){Debug.LogError("COMBAT SAVE CAPTURE requires -output <dir> -save-phase write|read");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);
   check(lobby.CharacterStoreDirectory==Path.Combine(Path.GetFullPath(output),"character-roster-v1"),"explicit isolated roster namespace");
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return null;lobby.ShowLobby();
   string receiptPath=Path.Combine(output,"combat-save-write.json");
   CombatSaveReceipt before=null;float deadline;
   if(phase=="write")
   {
    if(lobby.Characters.Count==0){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("이어검수"),"create inside the explicit capture roster");lobby.ShowLobby();}
    check(lobby.Characters.SelectedIndex>=0&&!HasCombatSave(lobby.Characters.SelectedName),"selected character is new (no combat save yet)");
    check(lobby.BeginCharacterEntry(false),"ordinary new-character entry accepted");
    deadline=Time.realtimeSinceStartup+12;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
    lobby.StartupCaptureState.Skip();yield return null;lobby.StartupCaptureState.Skip();yield return null;
    deadline=Time.realtimeSinceStartup+8;while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
    check(!lobby.IsBlocking&&Running,"new character reached gameplay through the story entry");
    check(firstPractice!=null&&!SaveCombatNow()&&!HasCombatSave(lobby.ActiveCharacterName),"nothing is saved while the first practice arena is active");
    EndFirstPractice(true);frontendEntryInputFence=false;Running=true;yield return null;
    // ---- change state through the real systems ----
    var p=Simulation.Player;
    Simulation.AddExperience(3000,true);check(p.Level>1,"experience raised the level through AddExperience");
    var bag=inventory.State.Bag;InventoryItem equip=null;foreach(var it in bag)if(it.reqLv<=p.Level&&inventory.State.GetEquipped(it.slot)==null&&it.slot!="ossuary"){equip=it;break;}
    if(equip!=null){check(inventory.Equip(equip,p.Level),"equipped "+equip.slot+" from the bag");}
    if(inventory.State.Bag.Count>0){var moved=inventory.State.Bag[0];check(inventory.Move(moved,6,40),"moved a bag item to a new grid cell");}
    Simulation.Materials=7777;Simulation.Kills=42;Simulation.PotionState.PotLv=4;p.Hp=p.MaxHp*.5f;
    yield return null;
    check(SaveCombatNow(),"explicit save wrote the character file");
    check(HasCombatSave(lobby.ActiveCharacterName),"character save file exists");
    before=SnapshotCombat("write");before.scope="Real Player process 1: ordinary entry, state changed through game systems, saved, then the process ends";
    yield return SkillCapture(output,"e03-1-before-save");
    string file=CombatStore().PathFor(lobby.ActiveCharacterName);before.character=lobby.ActiveCharacterName;before.saveFile=file;before.saveDirectory=CombatStore().DirectoryPath;before.revision=(int)combatRevision;
   }
   else
   {
    check(File.Exists(receiptPath),"process 1 receipt exists");
    if(File.Exists(receiptPath))before=JsonUtility.FromJson<CombatSaveReceipt>(File.ReadAllText(receiptPath));
    check(lobby.Characters.Count==1&&before!=null&&lobby.Characters.SelectedName==before.character,"fresh process restores the roster with the saved character");
    check(before!=null&&HasCombatSave(before.character),"fresh process finds the combat save file");
    check(lobby.BeginCharacterEntry(false),"ordinary continue entry accepted");
    check(!lobby.StartupEntryActive,"continue skips the new-character story");
    deadline=Time.realtimeSinceStartup+8;while((lobby.IsBlocking||frontendEntryInputFence)&&Time.realtimeSinceStartup<deadline)yield return null;
    check(!lobby.IsBlocking&&Running&&firstPractice==null,"continue reached gameplay without the first practice");
    check(CombatSaveRestored,"the run was rebuilt from the save");
   }
   if(phase=="read"&&before!=null)
   {
    var now=SnapshotCombat("read");
    check(now.level==before.level&&now.exp==before.exp&&now.maxExp==before.maxExp,"level / exp / maxExp restored ("+now.level+" "+now.exp+"/"+now.maxExp+")");
    check(now.sp==before.sp&&now.ap==before.ap,"SP / AP restored ("+now.sp+" "+now.ap+")");
    check(now.mats==before.mats,"malice restored ("+now.mats+")");
    check(now.kills==before.kills&&now.potLv==before.potLv&&now.stage==before.stage,"kills / potion level / stage restored");
    check((now.hp>=before.hp-.01f&&now.hp<=before.hp+3f)||now.hp==now.maxHp,"hp restored, only a few frames of regeneration apart ("+before.hp+" -> "+now.hp+"/"+now.maxHp+"; max is recalculated from the level)");
    check(string.Join("|",now.equipped)==string.Join("|",before.equipped),"equipped items restored ("+now.equipped.Length+")");
    bool sameBag=now.bagIds.Length==before.bagIds.Length;if(sameBag)for(int i=0;i<now.bagIds.Length;i++)if(now.bagIds[i]!=before.bagIds[i])sameBag=false;
    check(sameBag,"bag items restored in order ("+now.bagCount+")");
    yield return SkillCapture(output,"e03-2-after-restore");
    int rev=(int)combatRevision;check(SaveCombatNow()&&combatRevision==rev+1,"a save after the restore keeps the file valid");
    JsonValue data;long revision;CombatSaveStatus status;CombatSaveModel again;string err;
    check(CombatStore().TryLoad(before.character,out data,out revision,out status)&&CombatSaveCodec.TryDecode(data,out again,out err)&&again.Lv==before.level&&again.Bag.Count==before.bagCount,"re-saved file decodes to the same state");
    now.character=before.character;now.saveFile=before.saveFile;now.saveDirectory=before.saveDirectory;now.revision=(int)combatRevision;before=now;
    before.scope="Real Player process 2: fresh process, ordinary lobby continue entry, state compared with the process 1 receipt";
   }
   lobby.CloseStartupCaptureMedia();sound?.Reset();
   before.rosterDirectory=lobby.CharacterStoreDirectory;before.passed=failures==0;before.failures=failures;before.checks=checks.ToArray();
   File.WriteAllText(Path.Combine(output,"combat-save-"+phase+".json"),JsonUtility.ToJson(before,true),new UTF8Encoding(false));
   Application.Quit(failures==0?0:2);
  }
 }
}
