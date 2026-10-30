using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;

namespace Exoduser.UnityPort.Tools
{
 // 명시적 격리 오디오 회귀만 실행. 3D 무대/M1/일반 실행 진입을 바꾸지 않는다.
 internal sealed class UiTabAudioCheck:MonoBehaviour
 {
  const string Flag="--unity-ui-tab-audio-check";
  [Serializable] sealed class Check {public string id,detail;public bool passed;}
  [Serializable] sealed class Receipt {public string scope="실제 Player의 Requested/확정함수/InputSystem F10·오디오 소스 설정. OS 손조작·청음은 미검증",runtimeSha,coreSha,sandbox,device;public bool passed;public List<Check> checks=new List<Check>();public List<string> lines=new List<string>();}
  static bool Has(string k){return Array.IndexOf(Environment.GetCommandLineArgs(),k)>=0;}
  static string Arg(string k){var a=Environment.GetCommandLineArgs();int n=Array.IndexOf(a,k);return n>=0&&n+1<a.Length?a[n+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)] static void Mute(){if(Has(Flag)){AudioListener.volume=0;AudioListener.pause=true;}}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Has(Flag)&&!Has("--unity-m1-check"))new GameObject("UI tab audio isolated check").AddComponent<UiTabAudioCheck>();}
  NativeGame game;NativeLobby lobby;NativeFeedbackAudio sound;Receipt receipt=new Receipt();string output;Keyboard keyboard,previousKeyboard;
  static FieldInfo Field(object o,string k){return o.GetType().GetField(k,BindingFlags.Instance|BindingFlags.NonPublic);}
  static object Get(object o,string k){return Field(o,k).GetValue(o);}
  static void Set(object o,string k,object v){Field(o,k).SetValue(o,v);}
  static object Call(object o,string k,params object[] a){return o.GetType().GetMethod(k,BindingFlags.Instance|BindingFlags.NonPublic).Invoke(o,a);}
  static string Hash(string p){using(var h=SHA256.Create())using(var f=File.OpenRead(p))return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
  void CheckThat(string id,bool ok,string detail=""){receipt.checks.Add(new Check{id=id,passed=ok,detail=detail});if(!ok)throw new InvalidOperationException(id+" "+detail);}
  void Save(){receipt.passed=receipt.checks.Count>0&&receipt.checks.TrueForAll(c=>c.passed);receipt.lines=new List<string>(sound?.Lines??new List<string>());File.WriteAllText(Path.Combine(output,"Player_오디오_회귀.json"),JsonUtility.ToJson(receipt,true));}
  IEnumerator Start(){output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("UI audio check requires explicit sandbox/output");Application.Quit(3);yield break;}Directory.CreateDirectory(output);yield return Guard(Run());}
  IEnumerator Guard(IEnumerator run){while(true){bool more=false;object current=null;Exception error=null;try{more=run.MoveNext();if(more)current=run.Current;}catch(Exception e){error=e;}if(error!=null){receipt.checks.Add(new Check{id="검수예외",passed=false,detail=error.ToString()});Save();Cleanup();Debug.LogError("UI_TAB_AUDIO_FAILED "+error);Application.Quit(2);yield break;}if(!more)yield break;yield return current;}}
  void Request(string id,int expected,string label){int n=sound.Receipt.played;NativePanelTabBar.Request(id);CheckThat(label,sound.Receipt.played-n==expected,"delta="+(sound.Receipt.played-n));}
  void CloseAll(){Call(game,"SetForge",false);Call(game,"SetStats",false);Call(game,"SetSkills",false,6);Call(game,"SetInventory",false);Set(game,"menu",false);}
  IEnumerator Run(){float until=Time.realtimeSinceStartup+30;while(NativeGame.Instance==null&&Time.realtimeSinceStartup<until)yield return null;game=NativeGame.Instance;CheckThat("NativeGame",game!=null);yield return null;
   lobby=game.GetComponent<NativeLobby>();lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();yield return null;game.enabled=false;game.ResetRun();CloseAll();Set(game,"gameFocused",true);
   sound=(NativeFeedbackAudio)Get(game,"sound");receipt.runtimeSha=Hash(typeof(NativeGame).Assembly.Location);receipt.coreSha=Hash(typeof(Core.Simulation).Assembly.Location);receipt.sandbox=NativeQaSandbox.Root;receipt.device=SystemInfo.graphicsDeviceName;
   CheckThat("무음격리",AudioListener.volume==0&&AudioListener.pause&&NativeQaSandbox.Active);CheckThat("선택원본UI로드",sound.HasClip("ui_tab"));var clip=sound.Clip("ui_tab");var samples=new float[clip.samples*clip.channels];CheckThat("실제디코드",clip.GetData(samples,0)&&Array.Exists(samples,x=>Mathf.Abs(x)>.001f),clip.samples+"/"+clip.channels+"/"+clip.frequency);
   Request("invPanel",0,"최초열기0");Request("invPanel",0,"활성탭0");Request("skillPanel",1,"인벤→스킬1");Request("forge",1,"스킬→대장간1");Request("statPanel",1,"대장간→능력치1");Request("settings",1,"능력치→설정1");Request("unknown",0,"미지원0");Request(null,0,"null0");
   int before=sound.Receipt.played;float hp=game.Simulation.Player.Hp;game.Simulation.Player.Hp=0;Request("invPanel",0,"죽음0");game.Simulation.Player.Hp=hp;
   var f=Field(game,"firstPractice");object old=f.GetValue(game);f.SetValue(game,System.Runtime.Serialization.FormatterServices.GetUninitializedObject(f.FieldType));try{Request("invPanel",0,"firstPractice거부0");}finally{f.SetValue(game,old);}
   var sim=game.Simulation;var backing=typeof(NativeGame).GetField("<Simulation>k__BackingField",BindingFlags.Instance|BindingFlags.NonPublic);backing.SetValue(game,null);try{Request("invPanel",0,"Simulation거부0");}finally{backing.SetValue(game,sim);}
   int tick=sim.TickCount,characters=lobby.Characters.Count;var inv=(NativeInventory)Get(game,"inventory");string state=JsonUtility.ToJson(inv.State),binds=JsonUtility.ToJson(NativeKeyBindInput.Bindings);
   // 기존 F10 입력 경로. OS 키 전송 없이 이 격리 Player에만 가상 장치를 추가한다.
   CloseAll();Request("invPanel",0,"키보드준비최초0");previousKeyboard=Keyboard.current;keyboard=InputSystem.AddDevice<Keyboard>();keyboard.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState());InputSystem.Update();InputSystem.QueueStateEvent(keyboard,new KeyboardState(Key.F10));InputSystem.Update();before=sound.Receipt.played;CheckThat("F10실제핸들러",(bool)Call(game,"HandlePanelHotkeys"));CheckThat("키보드전환1",sound.Receipt.played==before+1);InputSystem.QueueStateEvent(keyboard,new KeyboardState());InputSystem.Update();Cleanup();
   before=sound.Receipt.played;Set(game,"gameFocused",false);game.enabled=true;for(int n=0;n<4;n++)yield return null;game.enabled=false;Set(game,"gameFocused",true);CheckThat("LayoutRepaint추가0",sound.Receipt.played==before);CheckThat("입력선택전투불변",sim.TickCount==tick&&lobby.Characters.Count==characters&&JsonUtility.ToJson(inv.State)==state&&JsonUtility.ToJson(NativeKeyBindInput.Bindings)==binds);
   foreach(int percent in new[]{0,60,100}){sound.SetVolumePercent(percent);before=sound.Receipt.played;Request("invPanel",1,"설정→인벤 "+percent);var voices=(IEnumerable)Get(sound,"voices");AudioSource src=null;float raw=0;foreach(var voice in voices){var t=voice.GetType();var s=(AudioSource)t.GetField("source").GetValue(voice);if(s.clip==clip){src=s;raw=(float)t.GetField("rawVolume").GetValue(voice);}}CheckThat("실제Source계약 "+percent,src!=null&&src.outputAudioMixerGroup.name=="UI"&&src.spatialBlend==0&&!src.loop&&src.pitch==1&&Mathf.Abs(raw-.22f)<.00001f&&Mathf.Abs(src.volume-.22f*percent/100f)<.00001f);sound.Flush();CheckThat("Flush중복0 "+percent,sound.Receipt.played==before+1);Request("settings",1,"인벤→설정 "+percent);}
   sound.SetVolumePercent(60);Screen.SetResolution(1600,900,FullScreenMode.Windowed);game.enabled=true;yield return new WaitForSecondsRealtime(.4f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"1600-settings.png"));yield return null;game.enabled=false;Save();Cleanup();lobby.CloseStartupCaptureMedia();AudioListener.volume=0;AudioListener.pause=true;Debug.Log("UI_TAB_AUDIO_COMPLETE "+receipt.checks.Count);Application.Quit(0);
  }
  void Cleanup(){if(keyboard!=null){InputSystem.RemoveDevice(keyboard);keyboard=null;}if(previousKeyboard!=null&&previousKeyboard.added)previousKeyboard.MakeCurrent();previousKeyboard=null;}
  void OnDestroy(){Cleanup();}
 }
}
