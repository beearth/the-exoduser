using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Tools
{
 // 명시적 sandbox 검수. 사용자 포인터/창에 입력하지 않고 자기 숨은 창만 클릭한다.
 internal sealed class PauseInputCheck : MonoBehaviour
 {
  const string Flag="--unity-pause-input-check";
  [Serializable] sealed class Check {public string name,detail;public bool passed;}
  [Serializable] sealed class State {public string phase,playerState,page,practice;public int frame,tick,cursor;public float time,timeScale,hp,x,y;public bool running,menu,focus,navigationFocus,releaseFence,entryFence,inputFence,inventory,skills,stats,forge,remodel;}
  [Serializable] sealed class Receipt {public string scope="격리 실제 Player: Input System 가상 키보드 → 제품 Update/PollKeys, 자기 숨은 Windows 창 WM 클릭 → 실제 OnGUI. focus callback 모델 전환. 사용자 손조작/OS 전환/자연 전투 검수와 구분",runtimeSha,coreSha,device,sandbox;public bool passed,quitRequested,quitObserved;public int mouseDown,mouseUp,frames;public List<Check> checks=new List<Check>();public List<State> states=new List<State>();}
  static bool Has(string flag)=>Array.IndexOf(Environment.GetCommandLineArgs(),flag)>=0;
  static string Arg(string flag){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,flag);return i>=0&&i+1<a.Length?a[i+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Has(Flag)&&!Has("--unity-m1-check"))new GameObject("Pause input isolated check").AddComponent<PauseInputCheck>();}
  NativeGame game;NativeLobby lobby;NativePauseMenu pause;Keyboard keyboard,previousKeyboard;Receipt receipt=new Receipt();string output,phase="준비";bool failed,recording;float nextFrame;
  static object Get(object o,string k)=>o.GetType().GetField(k,BindingFlags.Instance|BindingFlags.NonPublic).GetValue(o);
  static object Call(object o,string k,params object[] a)=>o.GetType().GetMethod(k,BindingFlags.Instance|BindingFlags.NonPublic).Invoke(o,a);
  static string Hash(string p){using(var h=SHA256.Create())using(var f=File.OpenRead(p))return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
  void Save(){receipt.passed=!failed&&receipt.checks.Count>0&&receipt.checks.TrueForAll(c=>c.passed);File.WriteAllText(Path.Combine(output,"pause-input.json"),JsonUtility.ToJson(receipt,true));}
  void CheckThat(bool ok,string name,string detail=""){receipt.checks.Add(new Check{name=name,passed=ok,detail=detail});Snapshot(name);Save();if(!ok)throw new InvalidOperationException(name+" "+detail);}
  State Snapshot(string label){var p=game.Simulation.Player;var s=new State{phase=label,frame=Time.frameCount,time=Time.realtimeSinceStartup,timeScale=Time.timeScale,tick=game.Simulation.TickCount,hp=p.Hp,playerState=p.State,x=p.X,y=p.Y,running=game.Running,menu=(bool)Get(game,"menu"),focus=(bool)Get(game,"gameFocused"),page=pause.Navigation.Page.ToString(),cursor=pause.Navigation.Cursor,navigationFocus=pause.Navigation.Focused,releaseFence=pause.Navigation.WaitingForRelease,entryFence=(bool)Get(game,"frontendEntryInputFence"),inputFence=(bool)Get(game,"skillInputFence"),inventory=((NativeInventory)Get(game,"inventory")).Open,skills=((NativeSkills)Get(game,"skills")).Open,stats=((NativeStatPanel)Get(game,"stats")).Open,forge=((NativeForgePanel)Get(game,"forge")).Open,practice=game.FirstPracticeStage,remodel=NativeRemodel3D.Active};receipt.states.Add(s);Debug.Log("PAUSE_INPUT_STATE "+JsonUtility.ToJson(s));return s;}
  IEnumerator Start(){output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("PAUSE_INPUT_REJECT: sandbox/output required");Application.Quit(3);yield break;}Directory.CreateDirectory(output);Directory.CreateDirectory(Path.Combine(output,"frames"));yield return Guard(Run());}
  IEnumerator Guard(IEnumerator run){while(true){bool more=false;object current=null;Exception error=null;try{more=run.MoveNext();if(more)current=run.Current;}catch(Exception e){error=e;}if(error!=null){failed=true;receipt.checks.Add(new Check{name="검수 예외",passed=false,detail=error.ToString()});Save();Cleanup();Debug.LogError("PAUSE_INPUT_FAILED "+error);Application.Quit(2);yield break;}if(!more)yield break;if(current is IEnumerator nested){yield return Guard(nested);if(failed)yield break;}else yield return current;}}
  IEnumerator Key(Key key){phase="키 "+key;Snapshot(phase+" 전");keyboard.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState(key));yield return null;yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());yield return null;yield return null;Snapshot(phase+" 후");}
  IEnumerator Shot(string name){phase=name;yield return new WaitForEndOfFrame();var t=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,name+".png"),t.EncodeToPNG());Destroy(t);yield return null;}
  IEnumerator PauseByFocus(){game.SetGameFocus(false);yield return null;game.SetGameFocus(true);yield return null;yield return null;Snapshot("focus 복귀: 사용자 재개 대기");}
  IEnumerator AssertResumed(string name){CheckThat(game.Running&&!(bool)Get(game,"menu"),name+" 상태");int tick=game.Simulation.TickCount;yield return new WaitForSecondsRealtime(.12f);CheckThat(game.Simulation.TickCount>tick,name+" 실제 틱 재개");}
  IEnumerator Run(){
   float until=Time.realtimeSinceStartup+30;while(NativeGame.Instance==null&&Time.realtimeSinceStartup<until)yield return null;
   game=NativeGame.Instance;lobby=game.GetComponent<NativeLobby>();pause=(NativePauseMenu)Get(game,"pauseMenu");
   receipt.runtimeSha=Hash(typeof(NativeGame).Assembly.Location);receipt.coreSha=Hash(typeof(Simulation).Assembly.Location);receipt.device=SystemInfo.graphicsDeviceName;receipt.sandbox=NativeQaSandbox.Root;
   previousKeyboard=Keyboard.current;keyboard=InputSystem.AddDevice<Keyboard>();keyboard.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState());
   Screen.SetResolution(1600,900,FullScreenMode.Windowed);AudioListener.volume=0;AudioListener.pause=true;
   lobby.ShowLobby();lobby.SelectPreview();CheckThat(lobby.EnterNativeTest(),"일반 미리보기 진입");game.SetGameFocus(true);
   until=Time.realtimeSinceStartup+45;while((lobby.IsBlocking||!game.Running||NativeRemodel3D.Requested&&!NativeRemodel3D.Active)&&Time.realtimeSinceStartup<until)yield return null;
   CheckThat(game.Running,"진입 키 해제 후 실행");CheckThat(!NativeRemodel3D.Requested||NativeRemodel3D.Active,"요청된 숲 3D 로드");recording=true;StartCoroutine(Frames());
   yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(!game.Running&&pause.SettingsOpen,"첫 ESC 설정 정지");int tick=game.Simulation.TickCount;yield return Shot("01-esc-paused");yield return new WaitForSecondsRealtime(.15f);CheckThat(game.Simulation.TickCount==tick,"설정 중 틱 정지");
   yield return Key(UnityEngine.InputSystem.Key.Escape);yield return AssertResumed("두 번째 ESC");yield return Shot("02-esc-resumed");
   yield return PauseByFocus();CheckThat(!game.Running&&(bool)Get(game,"menu"),"focus 복귀 자동 재개 없음");yield return Shot("03-before-resume-click");yield return Click(640,218);yield return AssertResumed("계속하기 실제 WM 클릭");yield return Shot("04-after-resume-click");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.Return);yield return AssertResumed("계속하기 Enter");
   yield return Key(UnityEngine.InputSystem.Key.Escape);yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Return);yield return AssertResumed("직접 설정 닫기 Enter");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.Return);CheckThat(pause.SettingsOpen&&!game.Running,"보조 메뉴 설정 열기");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(pause.Navigation.Page==PausePage.Main&&!game.Running,"설정에서 부모 메뉴 복귀");yield return Key(UnityEngine.InputSystem.Key.Escape);yield return AssertResumed("부모 메뉴 ESC");
   yield return Key(UnityEngine.InputSystem.Key.Tab);CheckThat(((NativeInventory)Get(game,"inventory")).Open&&!game.Running,"TAB 인벤토리 열림");yield return Key(UnityEngine.InputSystem.Key.Tab);CheckThat(!((NativeInventory)Get(game,"inventory")).Open,"TAB 인벤토리 닫힘");yield return AssertResumed("인벤토리 닫기");
   yield return Key(UnityEngine.InputSystem.Key.K);CheckThat(((NativeSkills)Get(game,"skills")).Open&&!game.Running,"K 스킬 정지");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(!((NativeSkills)Get(game,"skills")).Open,"스킬 ESC 닫힘");yield return AssertResumed("스킬 닫기");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Return);CheckThat(pause.Navigation.Page==PausePage.Quit&&!game.Running,"종료 확인 열림");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(pause.Navigation.Page==PausePage.Main&&!game.Running,"종료 확인 취소");
   yield return Key(UnityEngine.InputSystem.Key.Home);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.Return);CheckThat(lobby.IsBlocking&&!game.Running,"로비로 돌아가기");yield return Shot("05-return-lobby");
   lobby.SelectPreview();CheckThat(lobby.EnterNativeTest(),"로비에서 재진입");game.SetGameFocus(true);yield return null;yield return null;yield return AssertResumed("로비 재진입 입력 복구");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Return);yield return Key(UnityEngine.InputSystem.Key.RightArrow);yield return Shot("06-quit-confirm");
   CheckThat(pause.Navigation.Page==PausePage.Quit&&pause.Navigation.Cursor==1,"종료 최종 선택");receipt.quitRequested=true;Save();phase="종료 Enter";InputSystem.QueueStateEvent(keyboard,new KeyboardState(UnityEngine.InputSystem.Key.Return));
   yield return new WaitForSecondsRealtime(2);CheckThat(false,"종료 확인 명령 후 Player 종료");
  }
  IEnumerator Frames(){while(recording){yield return new WaitForEndOfFrame();if(Time.realtimeSinceStartup>=nextFrame){nextFrame=Time.realtimeSinceStartup+.1f;var t=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frames",receipt.frames.ToString("D5")+".png"),t.EncodeToPNG());Destroy(t);receipt.frames++;}}}
  delegate bool WindowCallback(IntPtr w,IntPtr s);
  [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback,IntPtr state);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint process);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr window,uint message,IntPtr w,IntPtr l);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr window,System.Text.StringBuilder name,int size);
  [DllImport("kernel32.dll")] static extern uint GetCurrentProcessId();
  IntPtr OwnWindow(){IntPtr found=IntPtr.Zero;uint own=GetCurrentProcessId();EnumWindows((w,s)=>{GetWindowThreadProcessId(w,out uint pid);var name=new System.Text.StringBuilder(128);GetClassNameW(w,name,128);if(pid==own&&name.ToString()=="UnityWndClass"){found=w;return false;}return true;},IntPtr.Zero);return found;}
  IEnumerator Click(float x,float y){IntPtr window=OwnWindow();CheckThat(window!=IntPtr.Zero,"클릭 자기 Player 창 확인");int px=Mathf.RoundToInt(x*Screen.width/1280f),py=Mathf.RoundToInt(y*Screen.height/720f);IntPtr point=new IntPtr((py<<16)|(px&65535));int down=receipt.mouseDown,up=receipt.mouseUp;CheckThat(PostMessageW(window,0x200,IntPtr.Zero,point)&&PostMessageW(window,0x201,new IntPtr(1),point),"WM 클릭 누름 전달");yield return new WaitForSecondsRealtime(.12f);CheckThat(PostMessageW(window,0x202,IntPtr.Zero,point),"WM 클릭 해제 전달");yield return new WaitForSecondsRealtime(.15f);CheckThat(receipt.mouseDown>down&&receipt.mouseUp>up,"실제 OnGUI MouseDown/MouseUp 수신");}
  void OnGUI(){if(Event.current==null)return;if(Event.current.rawType==EventType.MouseDown)receipt.mouseDown++;if(Event.current.rawType==EventType.MouseUp)receipt.mouseUp++;}
  void OnApplicationQuit(){recording=false;if(receipt.quitRequested){receipt.quitObserved=true;Save();}Cleanup();}
  void Cleanup(){if(keyboard!=null){InputSystem.RemoveDevice(keyboard);keyboard=null;}if(previousKeyboard!=null&&previousKeyboard.added)previousKeyboard.MakeCurrent();previousKeyboard=null;}
  void OnDestroy(){Cleanup();}
 }
}
