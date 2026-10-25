using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  IEnumerator CharacterDeleteSmoke()
  {
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);
   check(!lobby.RequestCharacterDelete(0)&&!lobby.ConfirmCharacterDelete(),"empty roster and absent confirmation reject deletion");
   foreach(string name in new[]{"첫번째","두번째","세번째"}){lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();lobby.CreateCharacter(name);}
   lobby.SelectCharacter(2);lobby.RequestCharacterDelete(1);
   check(lobby.Characters.Count==3&&lobby.Characters.SelectedName=="세번째","request preserves roster and selection");
   check(!lobby.EnterSelectedCharacter()&&!lobby.OpenCharacterCreation()&&!lobby.SelectCharacter(0),"confirmation owns lobby inputs");
   yield return SkillCapture(output,"delete-confirm-720p");
   lobby.CloseCharacterCreation();check(lobby.Characters.Count==3&&lobby.Characters.SelectedName=="세번째","cancel preserves list");
   lobby.RequestCharacterDelete(1);check(lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==2&&lobby.Characters.SelectedName=="세번째","delete other row preserves selected identity");
   lobby.RequestCharacterDelete(1);check(lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==1&&lobby.Characters.SelectedName=="첫번째","delete last selected row selects previous identity");
   lobby.RequestCharacterDelete(0);check(lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==0&&lobby.Characters.SelectedIndex==-1&&!lobby.EnterSelectedCharacter(),"delete only row clears selection and entry");
   yield return SkillCapture(output,"delete-empty-720p");
   lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();check(lobby.CreateCharacter("첫번째"),"removed name can be recreated");
   lobby.OpenCharacterCreation();lobby.ConfirmCharacterVisual();lobby.CreateCharacter("새캐릭터");lobby.RequestCharacterDelete(0);lobby.Characters.TryRemove(0);
   check(!lobby.ConfirmCharacterDelete()&&lobby.Characters.Count==1&&lobby.Characters.SelectedName=="새캐릭터","stale confirmation cannot remove shifted identity");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.3f);lobby.RequestCharacterDelete(0);yield return SkillCapture(output,"delete-confirm-1080p");lobby.CloseCharacterCreation();
   File.WriteAllText(Path.Combine(output,"delete-smoke.json"),JsonUtility.ToJson(new CharacterSmokeReceipt{passed=failures==0,failures=failures,checks=checks.ToArray()},true));
   lobbySmoke=false;lobby.AutomatedInput=false;if(Array.IndexOf(Environment.GetCommandLineArgs(),"--quit-after-character-smoke")>=0)Application.Quit(failures==0?0:2);
  }
 }
}
