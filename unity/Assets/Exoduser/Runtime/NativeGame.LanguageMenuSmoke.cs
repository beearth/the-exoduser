using System;using System.IO;using System.Collections;using System.Collections.Generic;using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class LanguageMenuReceipt {public string scope="Native menu controller and rendering; no OS input claim";public bool passed;public List<string> checks=new List<string>();}
  IEnumerator LanguageMenuSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);AudioListener.volume=0;
   var result=new LanguageMenuReceipt();int failures=0;Action<bool,string> check=(ok,name)=>{result.checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failures++;};
   Action<KeyCode> tap=key=>{lobby.ProcessLanguageMenuKey(key,false);lobby.ProcessLanguageMenuKey(key,true);};
   lobby.ShowLobby();lobby.SetLanguage("ko");Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return null;yield return null;
   lobby.ProcessLanguageMenuKey(KeyCode.L,false);for(int i=0;i<20;i++)lobby.ProcessLanguageMenuKey(KeyCode.L,false);
   check(lobby.LanguageMenuOpen&&lobby.LanguageMenuCursor==0,"held L opens once");lobby.ProcessLanguageMenuKey(KeyCode.L,true);
   yield return UiCapture(output,"language-top-720p");
   tap(KeyCode.DownArrow);check(lobby.LanguageMenuCursor==1,"Down selects next source option, not two rows");tap(KeyCode.Space);
   check(!lobby.LanguageMenuOpen&&lobby.Language=="en","Space accepts and closes");tap(KeyCode.L);tap(KeyCode.UpArrow);tap(KeyCode.Tab);
   check(!lobby.LanguageMenuOpen&&lobby.Language=="en","Tab cancels without selecting");tap(KeyCode.L);tap(KeyCode.End);
   check(lobby.LanguageMenuCursor==28,"End reaches final language");yield return UiCapture(output,"language-bottom-720p");tap(KeyCode.Escape);
   check(!lobby.LanguageMenuOpen&&lobby.Language=="en","Escape cancels without changing language");tap(KeyCode.L);tap(KeyCode.Home);tap(KeyCode.Return);
   check(!lobby.LanguageMenuOpen&&lobby.Language=="ko","Home and Enter select Korean");
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return null;tap(KeyCode.L);yield return UiCapture(output,"language-top-1080p");tap(KeyCode.End);yield return UiCapture(output,"language-bottom-1080p");tap(KeyCode.Escape);
   check(lobby.CharacterStoreDirectory.Length==0,"fixture never opens user character storage");result.passed=failures==0;File.WriteAllText(Path.Combine(output,"language-menu.json"),JsonUtility.ToJson(result,true));Application.Quit(result.passed?0:2);
  }
 }
}
