// QA-only: copy into an isolated Unity project's Assets before a probe build.
// Does not synthesize OS input or claim mouse-click coverage.
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
public sealed class LanguageRuntimeProbe:MonoBehaviour
{
 [Serializable] public sealed class Check { public string name; public bool passed; }
 [Serializable] public sealed class Receipt { public string scope="Native setter/data/GUI rendering; no OS click coverage"; public bool passed; public List<Check> checks=new List<Check>(); }
 readonly Receipt result=new Receipt();
 void CheckValue(string name,bool passed){result.checks.Add(new Check{name=name,passed=passed});}
 [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
 static void Install(){if(Array.IndexOf(Environment.GetCommandLineArgs(),"--language-runtime-probe")>=0)new GameObject("LanguageRuntimeProbe").AddComponent<LanguageRuntimeProbe>();}
 IEnumerator Start()
 {
  yield return null;
  var args=Environment.GetCommandLineArgs();int ix=Array.IndexOf(args,"-output");
  if(ix<0||ix+1>=args.Length){Application.Quit(2);yield break;}
  string output=args[ix+1];Directory.CreateDirectory(output);
  var lobby=UnityEngine.Object.FindFirstObjectByType<NativeLobby>();
  CheckValue("native_lobby_exists",lobby!=null);
  if(lobby==null){Write(output);Application.Quit(2);yield break;}
  lobby.AutomatedInput=true;lobby.SetPlaybackFocus(true);lobby.ShowLobby();
  var captions=JsonUtility.FromJson<LobbySubtitleData>(Resources.Load<TextAsset>("Data/lobby_frontend").text).captions;
  CheckValue("29_caption_languages",captions.Length==29);
  for(int i=0;i<captions.Length;i++){lobby.SetLanguage(captions[i].code);CheckValue("select_"+captions[i].code,lobby.Language==captions[i].code);}
  string[] inputs={"ko-KR","en_US","zh-Hant","zh-TW","pt-BR","nb-NO","nn","fr-FR","unknown"};
  string[] expected={"ko","en","zht","zht","ptbr","no","no","fr","en"};
  for(int i=0;i<inputs.Length;i++){lobby.SetLanguage(inputs[i]);CheckValue("alias_"+inputs[i],lobby.Language==expected[i]);}
  lobby.SetLanguage(null);CheckValue("null_falls_back_to_en",lobby.Language=="en");
  float until=Time.realtimeSinceStartup+12;
  while(!lobby.CurrentVideo.Prepared&&Time.realtimeSinceStartup<until){lobby.SetPlaybackFocus(true);yield return null;}
  var popup=typeof(NativeLobby).GetField("showLanguages",BindingFlags.NonPublic|BindingFlags.Instance);
  CheckValue("popup_field_exists",popup!=null);
  foreach(string code in new[]{"ko","fr","ptbr"}){
   lobby.SetLanguage(code);popup?.SetValue(lobby,true);
   yield return new WaitForEndOfFrame();
   ScreenCapture.CaptureScreenshot(Path.Combine(output,"languages-"+code+".png"));yield return null;
  }
  Write(output);Application.Quit(result.passed?0:2);
 }
 void Write(string output){result.passed=result.checks.TrueForAll(c=>c.passed);File.WriteAllText(Path.Combine(output,"runtime-result.json"),JsonUtility.ToJson(result,true));}
}
