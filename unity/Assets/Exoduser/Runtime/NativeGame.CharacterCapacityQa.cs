// QA-only overlay for exact product candidate a9ddfbff; never runs without capacity-* phases.
// Route capacity-* phases here from CharacterStoreSmoke, preserving other phases.
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using UnityEngine;
using UnityEngine.Video;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class CharacterCapacityReceipt
  {
   public string scope="Isolated actual Player callbacks, JsonUtility and fresh processes; API focus checks, no native OS input claim";
   public string candidate="a9ddfbffce87c9be34c9d2fd39626081ec7f3423",phase,primarySha,backupSha,runtimeSha,graphicsDevice;
   public bool passed,listenerPaused;public int failures,count,selectedIndex,scroll,actualWidth,actualHeight,directVideoPlayers;
   public float listenerVolume;public string activeName;public List<string> checks=new List<string>();
  }
  static string CapacityHash(string path)
  {
   if(!File.Exists(path))return "missing";
   using(var sha=SHA256.Create())using(var stream=File.OpenRead(path))return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
  }
  IEnumerator CharacterCapacityQa()
  {
   var body=CharacterCapacityQaBody();
   while(true)
   {
    bool more;object current;
    try{more=body.MoveNext();current=more?body.Current:null;}
    catch(Exception ex)
    {
     Debug.LogError("CHARACTER_CAPACITY_QA_FAILED "+ex);
     string output=Argument("-output");
     if(!string.IsNullOrEmpty(output)&&Path.IsPathRooted(output)&&Directory.Exists(output))File.WriteAllText(Path.Combine(output,Argument("-roster-phase")+"-failure.txt"),ex.ToString());
     Application.Quit(2);yield break;
    }
    if(!more)yield break;yield return current;
   }
  }
  IEnumerator CharacterCapacityQaBody()
  {
   string output=Argument("-output"),phase=Argument("-roster-phase");
   if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))
    throw new InvalidOperationException("Capacity QA requires explicit --unity-qa-sandbox and absolute -output");
   Directory.CreateDirectory(output);pauseSmoke=true;Application.runInBackground=true;
   AudioListener.volume=0;AudioListener.pause=true;
   var receipt=new CharacterCapacityReceipt{phase=phase,graphicsDevice=SystemInfo.graphicsDeviceName,runtimeSha=CapacityHash(typeof(NativeGame).Assembly.Location)};
   Action<bool,string> check=(ok,name)=>{receipt.checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)receipt.failures++;};
   string directory=Path.Combine(Path.GetFullPath(output),"character-roster-v1"),primary=Path.Combine(directory,CharacterRosterStore.DataFileName),backup=Path.Combine(directory,CharacterRosterStore.BackupFileName);
   check(lobby.CharacterStoreDirectory==directory,"explicit isolated roster directory");
   bool large=phase=="capacity-large"||phase=="capacity-large-reload";
   int targetCount=large?5000:6;
   if(phase=="capacity-create")
   {
    check(lobby.CharacterStoreState==CharacterStoreStatus.Missing&&lobby.Characters.Count==0,"new isolated store is empty");
    for(int i=1;i<=6;i++)check(lobby.OpenCharacterCreation()&&lobby.ConfirmCharacterVisual()&&lobby.CreateCharacter("검수"+i),"persist identity "+i);
   }
   else if(phase=="capacity-promote")
   {
    string seed=Path.Combine(output,"seed-primary.bin");
    check(lobby.CharacterStoreState==CharacterStoreStatus.Loaded&&lobby.Characters.Count==5&&lobby.Characters.SelectedIndex==4,"load legacy v1 five-entry roster");
    check(CapacityHash(primary)==CapacityHash(seed),"loading v1 preserves exact original bytes");
    check(lobby.OpenCharacterCreation()&&lobby.ConfirmCharacterVisual()&&lobby.CreateCharacter("검수6"),"create sixth entry from v1");
    check(CapacityHash(backup)==CapacityHash(seed),"first v2 write preserves raw v1 bytes in backup");
   }
   else if(phase=="capacity-reload"||phase=="capacity-promoted-reload"||large)
   {
    check(lobby.CharacterStoreState==CharacterStoreStatus.Loaded&&lobby.Characters.Count==targetCount&&lobby.Characters.SelectedIndex==targetCount-1,"fresh Player restores all names and last selection");
    if(phase=="capacity-promoted-reload")check(CapacityHash(backup)==CapacityHash(Path.Combine(output,"seed-primary.bin")),"fresh load retains v1 backup bytes");
    if(large)check(new FileInfo(primary).Length>65536,"JsonUtility reads payload above old 64KiB limit");
   }
   else check(false,"known capacity phase");
   check(lobby.Characters.Count==targetCount,"expected count without five-entry cap");
   string before=CapacityHash(primary),beforeBackup=CapacityHash(backup);
   check(lobby.OpenCharacterCreation(),"creation remains available above five entries");
   check(lobby.ConfirmCharacterVisual(),"name form available above five entries");
   check(!lobby.CreateCharacter("검수1")&&lobby.Characters.Count==targetCount,"duplicate rejection preserves count");
   lobby.SetPlaybackFocus(false);lobby.SetPlaybackFocus(true);
   check(lobby.CharacterModalOpen&&lobby.Characters.Count==targetCount,"API focus round trip preserves modal and roster");
   lobby.CloseCharacterCreation();
   check(CapacityHash(primary)==before&&CapacityHash(backup)==beforeBackup,"cancel, duplicate and focus do not write roster files");
   // Migration phases preserve the first v1 backup: no subsequent selection write.
   if(phase!="capacity-promote"&&phase!="capacity-promoted-reload")
    check(lobby.SelectCharacter(0)&&lobby.SelectCharacter(targetCount-1),"select first then last entry through lobby API");
   check(lobby.Characters.SelectedName==(large?"검수5000":"검수6"),"last selected identity is exact");
   var scroll=typeof(NativeLobby).GetField("characterScroll",BindingFlags.Instance|BindingFlags.NonPublic);
   receipt.scroll=scroll==null?-1:(int)scroll.GetValue(lobby);
   check(receipt.scroll<=targetCount-1&&receipt.scroll+2>targetCount-1,"selected last entry revealed inside two-card scroll viewport");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.6f);
   receipt.actualWidth=Screen.width;receipt.actualHeight=Screen.height;
   check(Screen.width==1920&&Screen.height==1080,"actual 1920x1080 Player viewport available");
   yield return SkillCapture(output,phase+"-last-selected-actual-"+Screen.width+"x"+Screen.height);
   check(lobby.EnterSelectedCharacter()&&lobby.ActiveCharacterName==(large?"검수5000":"검수6"),"last selected identity directly enters native preview");
   receipt.activeName=lobby.ActiveCharacterName;
   yield return new WaitForSecondsRealtime(.2f);
   SetGameFocus(false);check(!Running,"API focus loss pauses preview");SetGameFocus(true);check(!Running,"API focus return never automatically resumes preview");
   yield return SkillCapture(output,phase+"-last-entered-actual-"+Screen.width+"x"+Screen.height);
   ApplyPauseCommand(PauseMenuCommand.ReturnLobby);
   check(lobby.IsBlocking&&lobby.Characters.Count==targetCount&&lobby.Characters.SelectedIndex==targetCount-1,"return preserves count and last selection");
   var snapshot=JsonUtility.FromJson<CharacterRosterSnapshot>(File.ReadAllText(primary));
   check(snapshot.version==2&&snapshot.names.Length==targetCount&&snapshot.selectedIndex==targetCount-1,"actual JsonUtility store has v2, complete names and selection");
   bool exactNames=snapshot.names.Length==targetCount;
   for(int i=0;i<snapshot.names.Length;i++)if(snapshot.names[i]!="검수"+(i+1))exactNames=false;
   check(exactNames,"every persisted name matches its original ordinal");
   receipt.count=lobby.Characters.Count;receipt.selectedIndex=lobby.Characters.SelectedIndex;
   receipt.primarySha=CapacityHash(primary);receipt.backupSha=CapacityHash(backup);
   receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;
   foreach(var video in FindObjectsByType<VideoPlayer>(FindObjectsSortMode.None))if(video.audioOutputMode==VideoAudioOutputMode.Direct)receipt.directVideoPlayers++;
   check(receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.directVideoPlayers==0,"listener mute and no Direct video audio route");
   receipt.passed=receipt.failures==0;
   File.WriteAllText(Path.Combine(output,phase+".json"),JsonUtility.ToJson(receipt,true));
   lobbySmoke=false;lobby.AutomatedInput=false;
   Application.Quit(receipt.passed?0:2);
  }
 }
}
