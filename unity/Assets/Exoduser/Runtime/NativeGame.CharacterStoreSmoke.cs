using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  IEnumerator CharacterStoreSmoke()
  {
   string output=Argument("-output"),phase=Argument("-roster-phase");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
   check(lobby.CharacterStoreDirectory==Path.Combine(Path.GetFullPath(output),"character-roster-v1"),"explicit fixture uses isolated output directory");
   if(phase=="create"){
    check(lobby.CharacterStoreState==CharacterStoreStatus.Missing&&lobby.Characters.Count==0,"new store starts empty without reading existing saves");
    foreach(string name in new[]{"아린","루나"}){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter(name),"persist new identity "+name);}
    check(lobby.SelectCharacter(0)&&lobby.CharacterStoreState==CharacterStoreStatus.Saved,"persist selection independently of creation");
    yield return SkillCapture(output,"store-created-720p");
    string path=Path.Combine(lobby.CharacterStoreDirectory,"characters.v1.json"),original=File.ReadAllText(path);var future=CharacterRosterStore.Capture(lobby.Characters);future.version=999;
    try{
     string futureJson=JsonUtility.ToJson(future,true);File.WriteAllText(path,futureJson);
     lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();
     check(!lobby.CreateCharacter("거부검사")&&lobby.Characters.Count==2&&lobby.Characters.SelectedName=="아린","failed persistent write does not change live roster");
     check(File.ReadAllText(path)==futureJson,"future-version file is not overwritten");
     yield return SkillCapture(output,"store-write-blocked-720p");
     lobby.CloseCharacterCreation();
    }finally{File.WriteAllText(path,original);}
   }else if(phase=="reload-delete"){
    check(lobby.CharacterStoreState==CharacterStoreStatus.Loaded&&lobby.Characters.Count==2&&lobby.Characters.NameAt(0)=="아린"&&lobby.Characters.NameAt(1)=="루나"&&lobby.Characters.SelectedName=="아린","fresh process restores names and selected index");
    yield return SkillCapture(output,"store-restored-720p");
    check(lobby.RequestCharacterDelete(0)&&lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==1&&lobby.Characters.SelectedName=="루나"&&lobby.CharacterStoreState==CharacterStoreStatus.Saved,"confirmed deletion persists updated selection");
   }else if(phase=="verify-delete"){
    check(lobby.CharacterStoreState==CharacterStoreStatus.Loaded&&lobby.Characters.Count==1&&lobby.Characters.SelectedName=="루나","another fresh process retains deletion");
    check(lobby.RequestCharacterDelete(0)&&lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==0,"persist empty roster after last deletion");
   }else if(phase=="verify-empty"){
    check(lobby.CharacterStoreState==CharacterStoreStatus.Loaded&&lobby.Characters.Count==0&&lobby.Characters.SelectedIndex==-1&&!lobby.EnterSelectedCharacter(),"empty roster restores with entry disabled");
    check(lobby.OpenCharacterCreation(),"restored empty roster permits new creation");
    Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);yield return SkillCapture(output,"store-ready-1080p");
   }else check(false,"known fixture phase required");
   File.WriteAllText(Path.Combine(output,"store-"+phase+".json"),JsonUtility.ToJson(new CharacterSmokeReceipt{scope="Isolated character roster persistence across fresh Player processes; no battle saves or native OS input claim",passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   lobbySmoke=false;lobby.AutomatedInput=false;
   if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-character-smoke")>=0)Application.Quit(failures==0?0:2);
  }
 }
}
