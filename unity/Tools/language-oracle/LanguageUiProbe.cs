// QA-only. Never include in the product Assets tree.
using System;
using System.Collections;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort;
[DefaultExecutionOrder(-10000)]
public sealed class LanguageUiProbe:MonoBehaviour
{
 const string Root="/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025";
 [Serializable] sealed class Profile {public int width=1280,height=720;public string name="720p",language="en";}
 Profile profile;string output;NativeLobby lobby;bool lastPopup;string lastLanguage;
 [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
 static void Install(){new GameObject("Language UI diagnostic").AddComponent<LanguageUiProbe>();}
 IEnumerator Start(){
  profile=JsonUtility.FromJson<Profile>(File.ReadAllText(Path.Combine(Root,"language-ui-profile.json")));
  output=Path.Combine(Root,"language-ui-"+profile.name);Directory.CreateDirectory(output);
  File.WriteAllText(Path.Combine(output,"events.jsonl"),"");
  Screen.SetResolution(profile.width,profile.height,FullScreenMode.Windowed);
  yield return null;yield return null;
  lobby=UnityEngine.Object.FindFirstObjectByType<NativeLobby>();
  lobby.SetPlaybackFocus(true);lobby.ShowLobby();lobby.SetLanguage(profile.language);
  for(int i=0;i<10;i++)yield return null;
  Log("ready","");
  yield return Capture("closed");
 }
 bool Popup(){return (bool)typeof(NativeLobby).GetField("showLanguages",BindingFlags.NonPublic|BindingFlags.Instance).GetValue(lobby);}
 void Update(){
  if(lobby==null||output==null)return;
  bool popup=Popup();
  if(popup!=lastPopup||lobby.Language!=lastLanguage){lastPopup=popup;lastLanguage=lobby.Language;Log("state","popup="+popup+" language="+lastLanguage);StartCoroutine(Capture(popup?"open":"selected"));}
  if(Input.GetMouseButtonDown(0)||Input.GetMouseButtonUp(0))Log("input","down="+Input.GetMouseButtonDown(0)+" up="+Input.GetMouseButtonUp(0)+" position="+Input.mousePosition);
 }
 void OnGUI(){if(output==null)return;var e=Event.current;if(e.type==EventType.MouseDown||e.type==EventType.MouseUp)Log("gui",e.type+" position="+e.mousePosition+" matrix="+GUI.matrix);}
 IEnumerator Capture(string tag){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,tag+".png"));}
 void Log(string kind,string detail){File.AppendAllText(Path.Combine(output,"events.jsonl"),JsonUtility.ToJson(new Entry{kind=kind,detail=detail,width=Screen.width,height=Screen.height,focus=Application.isFocused,time=Time.realtimeSinceStartup})+"\n");}
 [Serializable] sealed class Entry{public string kind,detail;public int width,height;public bool focus;public float time;}
}
