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
 // 명시적 sandbox 검수. 합성 GUI/가상 키보드 입력을 제품 경로로 전달하며 사용자 포인터/창은 건드리지 않는다.
 [DefaultExecutionOrder(-31000)]
 internal sealed class PauseInputCheck : MonoBehaviour
 {
  const string Flag="--unity-pause-input-check";
  [Serializable] sealed class Check {public string name,detail;public bool passed;}
  [Serializable] sealed class State {public string phase,playerState,page,practice;public int frame,tick,cursor;public float time,timeScale,hp,stateTicks,x,y;public bool nativeAppFocus,lobbyAutomated,running,menu,focus,navigationFocus,releaseFence,entryFence,inputFence,inventory,skills,stats,forge,remodel;}
  [Serializable] sealed class Receipt {public string scope="격리 실제 Player: Input System 가상 키보드 → 제품 Update/PollKeys, 제목·클라이언트 크기로 검증한 자기 숨은 창 WM 마우스 → 제품 OnGUI/버튼. focus 모델 및 자기 창 앱 활성 알림→Unity 콜백 검수. 사용자 손조작/전역 OS 창 전환/자연 전투와 구분",runtimeSha,coreSha,device,sandbox;public bool passed,quitRequested,quitObserved;public int width,height,mouseDown,mouseUp,productMouseDown,productMouseUp,guiQueued,layoutEvents,repaintEvents,frames,focusEvents;public List<Check> checks=new List<Check>();public List<State> states=new List<State>();}
  static bool Has(string flag)=>Array.IndexOf(Environment.GetCommandLineArgs(),flag)>=0;
  static string Arg(string flag){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,flag);return i>=0&&i+1<a.Length?a[i+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Has(Flag)&&!Has("--unity-m1-check"))new GameObject("Pause input isolated check").AddComponent<PauseInputCheck>();}
  NativeGame game;NativeLobby lobby;NativePauseMenu pause;Keyboard keyboard,previousKeyboard;Receipt receipt=new Receipt();string output,phase="준비";bool failed,recording;float nextFrame;
  static object Get(object o,string k)=>o.GetType().GetField(k,BindingFlags.Instance|BindingFlags.NonPublic).GetValue(o);
  static object Call(object o,string k,params object[] a)=>o.GetType().GetMethod(k,BindingFlags.Instance|BindingFlags.NonPublic).Invoke(o,a);
  static string Hash(string p){using(var h=SHA256.Create())using(var f=File.OpenRead(p))return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
  void Save(){receipt.passed=!failed&&receipt.checks.Count>0&&receipt.checks.TrueForAll(c=>c.passed);File.WriteAllText(Path.Combine(output,"pause-input.json"),JsonUtility.ToJson(receipt,true));}
  void CheckThat(bool ok,string name,string detail=""){receipt.checks.Add(new Check{name=name,passed=ok,detail=detail});Snapshot(name);Save();if(!ok)throw new InvalidOperationException(name+" "+detail);}
  State Snapshot(string label){var p=game.Simulation.Player;var s=new State{phase=label,frame=Time.frameCount,time=Time.realtimeSinceStartup,timeScale=Time.timeScale,tick=game.Simulation.TickCount,hp=p.Hp,stateTicks=p.StateTicks,playerState=p.State,x=p.X,y=p.Y,running=game.Running,menu=(bool)Get(game,"menu"),focus=(bool)Get(game,"gameFocused"),page=pause.Navigation.Page.ToString(),cursor=pause.Navigation.Cursor,navigationFocus=pause.Navigation.Focused,releaseFence=pause.Navigation.WaitingForRelease,entryFence=(bool)Get(game,"frontendEntryInputFence"),inputFence=(bool)Get(game,"skillInputFence"),inventory=((NativeInventory)Get(game,"inventory")).Open,skills=((NativeSkills)Get(game,"skills")).Open,stats=((NativeStatPanel)Get(game,"stats")).Open,forge=((NativeForgePanel)Get(game,"forge")).Open,practice=game.FirstPracticeStage,nativeAppFocus=Application.isFocused,lobbyAutomated=lobby.AutomatedInput,remodel=NativeRemodel3D.Active};receipt.states.Add(s);Debug.Log("PAUSE_INPUT_STATE "+JsonUtility.ToJson(s));return s;}
  IEnumerator Start(){output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("PAUSE_INPUT_REJECT: sandbox/output required");Application.Quit(3);yield break;}Directory.CreateDirectory(output);Directory.CreateDirectory(Path.Combine(output,"frames"));yield return Guard(Run());}
  IEnumerator Guard(IEnumerator run){while(true){bool more=false;object current=null;Exception error=null;try{more=run.MoveNext();if(more)current=run.Current;}catch(Exception e){error=e;}if(error!=null){failed=true;receipt.checks.Add(new Check{name="검수 예외",passed=false,detail=error.ToString()});Save();Cleanup();Debug.LogError("PAUSE_INPUT_FAILED "+error);Application.Quit(2);yield break;}if(!more)yield break;if(current is IEnumerator nested){yield return Guard(nested);if(failed)yield break;}else yield return current;}}
  IEnumerator Key(Key key){phase="키 "+key;Snapshot(phase+" 전");keyboard.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState(key));yield return null;yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());yield return null;yield return null;Snapshot(phase+" 후");}
  IEnumerator Shot(string name){phase=name;yield return new WaitForEndOfFrame();var t=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,name+".png"),t.EncodeToPNG());Destroy(t);yield return null;}
  IEnumerator PauseByFocus(){game.SetGameFocus(false);yield return null;game.SetGameFocus(true);yield return null;yield return null;Snapshot("focus 복귀: 사용자 재개 대기");}
  IEnumerator AssertResumed(string name){CheckThat(game.Running&&!(bool)Get(game,"menu"),name+" 상태");int tick=game.Simulation.TickCount;yield return new WaitForSecondsRealtime(.12f);CheckThat(game.Simulation.TickCount>tick,name+" 실제 틱 재개");}
  IEnumerator Run(){
   yield return null; // 제품 Start 완료 뒤 준비; GUI 관측 순서는 제품보다 앞선다.
   float until=Time.realtimeSinceStartup+30;while(NativeGame.Instance==null&&Time.realtimeSinceStartup<until)yield return null;
   game=NativeGame.Instance;lobby=game.GetComponent<NativeLobby>();pause=(NativePauseMenu)Get(game,"pauseMenu");
   receipt.runtimeSha=Hash(typeof(NativeGame).Assembly.Location);receipt.coreSha=Hash(typeof(Simulation).Assembly.Location);receipt.device=SystemInfo.graphicsDeviceName;receipt.sandbox=NativeQaSandbox.Root;
   game.GetType().GetField("a15HitTrace",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(game,true);Application.logMessageReceived+=ProductLog;
   previousKeyboard=Keyboard.current;keyboard=InputSystem.AddDevice<Keyboard>();keyboard.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState());
   Screen.SetResolution(1600,900,FullScreenMode.Windowed);AudioListener.volume=0;AudioListener.pause=true;yield return new WaitForSecondsRealtime(.5f);
   lobby.SetPlaybackFocus(true);lobby.AutomatedInput=false;lobby.ShowLobby();lobby.SelectPreview();CheckThat(lobby.EnterNativeTest(),"일반 미리보기 진입");game.SetGameFocus(true);
   until=Time.realtimeSinceStartup+10;while((lobby.IsBlocking||(bool)Get(game,"frontendEntryInputFence"))&&Time.realtimeSinceStartup<until)yield return null;
   CheckThat(!lobby.IsBlocking&&!(bool)Get(game,"frontendEntryInputFence"),"정상 진입 키 해제");game.SetGameFocus(false);game.SetGameFocus(true);CheckThat(!game.Running&&(bool)Get(game,"menu"),"숲 로드 중 제품 메뉴로 정지");
   until=Time.realtimeSinceStartup+45;while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<until)yield return null;
   CheckThat(!NativeRemodel3D.Requested||NativeRemodel3D.Active,"요청된 숲 3D 로드");yield return null;yield return null;yield return Key(UnityEngine.InputSystem.Key.Enter);CheckThat(game.Running,"준비 뒤 명시 계속하기");receipt.width=Screen.width;receipt.height=Screen.height;CheckThat(receipt.width==1600&&receipt.height==900,"실제 캡처 화면 크기",receipt.width+"x"+receipt.height);recording=true;StartCoroutine(Frames());
   if(Arg("-pause-case")=="window-focus"){
    IntPtr window=OwnWindow();CheckThat(window!=IntPtr.Zero,"focus 자기 게임 창 확인");
    CheckThat(PostMessageW(window,0x001C,new IntPtr(1),IntPtr.Zero),"자기 게임 창 활성 알림");yield return new WaitForSecondsRealtime(.2f);int events=receipt.focusEvents;
    CheckThat(PostMessageW(window,0x001C,IntPtr.Zero,IntPtr.Zero),"자기 게임 창 비활성 알림");yield return new WaitForSecondsRealtime(.2f);
    CheckThat(receipt.focusEvents>events&&!(bool)Get(game,"gameFocused")&&!game.Running&&(bool)Get(game,"menu"),"실제 Unity focus 콜백으로 정지");yield return Shot("window-focus-lost");events=receipt.focusEvents;
    CheckThat(PostMessageW(window,0x001C,new IntPtr(1),IntPtr.Zero),"자기 게임 창 재활성 알림");yield return new WaitForSecondsRealtime(.2f);
    CheckThat(receipt.focusEvents>events&&(bool)Get(game,"gameFocused")&&!game.Running&&(bool)Get(game,"menu"),"실제 focus 복귀 자동 재개 없음");yield return Key(UnityEngine.InputSystem.Key.Enter);yield return AssertResumed("focus 복귀 뒤 명시 Enter");yield return Shot("window-focus-resumed");Save();Application.Quit(0);yield break;
   }
   if(Arg("-pause-case")=="startup"){
    lobby.ShowLobby();lobby.SetPlaybackFocus(true);var data=JsonUtility.FromJson<StartupIntroData>(Resources.Load<TextAsset>("Data/startup_intro").text);StartupIntroLine[] lines=null;foreach(var language in data.languages)if(language.code=="ko")lines=language.lines;
    CheckThat(lines!=null&&lines.Length>0,"실제 대화 원본 로드");lobby.StartupCaptureState.Begin(lines,false);
    until=Time.realtimeSinceStartup+10;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<until)yield return null;
    CheckThat(lobby.IsBlocking&&!game.Running,"대화 창 전투 정지");yield return Shot("startup-dialogue");yield return Key(UnityEngine.InputSystem.Key.Escape);yield return new WaitForSecondsRealtime(.3f);CheckThat(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide&&!game.Running,"대화 ESC 뒤 안내 진입");
    for(int step=0;step<4;step++){CheckThat(lobby.StartupCaptureState.GuideStep==step,"안내 판 "+(step+1));yield return Shot("startup-guide-"+(step+1));yield return Key(UnityEngine.InputSystem.Key.Enter);yield return new WaitForSecondsRealtime(.3f);}
    until=Time.realtimeSinceStartup+5;while((lobby.IsBlocking||!game.Running)&&Time.realtimeSinceStartup<until)yield return null;CheckThat(!lobby.IsBlocking&&game.Running&&!(bool)Get(game,"frontendEntryInputFence"),"안내 종료 후 키 해제·입력 복귀");
    // 경합 조건만 명시적으로 준비하고, 해제·정지·재개는 제품 Update/PollKeys가 처리한다.
    game.GetType().GetField("frontendEntryInputFence",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(game,true);game.SetGameFocus(false);game.SetGameFocus(true);int pausedTick=game.Simulation.TickCount;yield return null;yield return null;
    CheckThat(!(bool)Get(game,"frontendEntryInputFence")&&(bool)Get(game,"menu")&&!game.Running&&game.Simulation.TickCount==pausedTick,"안내 입력 해제와 focus 메뉴 경합에서 틱 정지 유지");yield return Shot("startup-focus-paused");yield return Key(UnityEngine.InputSystem.Key.Enter);CheckThat(game.Running&&!(bool)Get(game,"menu"),"안내 경합 뒤 명시 계속하기 상태");
    var player=game.Simulation.Player;float x=player.X,y=player.Y;var move=UnityEngine.InputSystem.Key.None;
    foreach(var direction in new[]{new Vector2(1,0),new Vector2(-1,0),new Vector2(0,-1),new Vector2(0,1)})if(game.Map.CanMove(x+direction.x*12,y+direction.y*12,player.Radius)){move=direction.x>0?UnityEngine.InputSystem.Key.D:direction.x<0?UnityEngine.InputSystem.Key.A:direction.y<0?UnityEngine.InputSystem.Key.W:UnityEngine.InputSystem.Key.S;break;}
    CheckThat(move!=UnityEngine.InputSystem.Key.None,"실제 맵의 열린 이동 방향");int moveTick=game.Simulation.TickCount;yield return Key(move);CheckThat((player.X!=x||player.Y!=y)&&game.Simulation.TickCount>moveTick,"안내 뒤 실제 방향키 이동·틱 재개");yield return Shot("startup-input-restored");Save();Application.Quit(0);yield break;
   }
   if((Arg("-pause-case")??"").StartsWith("fallen",StringComparison.Ordinal)){
    Call(game.Simulation,"PlayerDie");CheckThat(game.Simulation.Player.State=="fallen"&&game.Simulation.Player.Hp==0,"Core 실제 부활 대기 진입");
    yield return PauseByFocus();yield return Shot("fallen-before-resume");yield return new WaitForSecondsRealtime(1);
    float countdown=game.Simulation.Player.StateTicks;if(Arg("-pause-case")=="fallen-enter")yield return Key(UnityEngine.InputSystem.Key.Enter);else if(Arg("-pause-case")=="fallen-esc")yield return Key(UnityEngine.InputSystem.Key.Escape);else yield return Click(640,218);yield return Shot("fallen-after-resume");yield return new WaitForSecondsRealtime(.4f);
    CheckThat(game.Running&&!(bool)Get(game,"menu")&&game.Simulation.Player.StateTicks<countdown,"HP0 부활 대기 재개 입력과 실제 카운트 재개");
    yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.Enter);yield return AssertResumed("부활 대기 계속하기 Enter");
    yield return Key(UnityEngine.InputSystem.Key.Escape);yield return Key(UnityEngine.InputSystem.Key.Escape);yield return AssertResumed("부활 대기 ESC 두 번");
    Call(game,"SetInventory",true);yield return Key(UnityEngine.InputSystem.Key.Tab);yield return AssertResumed("부활 대기 인벤토리 닫기");Save();Application.Quit(0);yield break;
   }
   yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(!game.Running&&pause.SettingsOpen,"첫 ESC 설정 정지");int tick=game.Simulation.TickCount;yield return Shot("01-esc-paused");yield return new WaitForSecondsRealtime(.15f);CheckThat(game.Simulation.TickCount==tick,"설정 중 틱 정지");
   yield return Key(UnityEngine.InputSystem.Key.Escape);yield return AssertResumed("두 번째 ESC");yield return Shot("02-esc-resumed");
   yield return PauseByFocus();CheckThat(!game.Running&&(bool)Get(game,"menu"),"focus 복귀 자동 재개 없음");yield return Shot("03-before-resume-click");yield return Click(640,218);yield return AssertResumed("계속하기 실제 GUI 큐 클릭");yield return Shot("04-after-resume-click");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.Enter);yield return AssertResumed("계속하기 Enter");
   yield return Key(UnityEngine.InputSystem.Key.Escape);yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Enter);yield return AssertResumed("직접 설정 닫기 Enter");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.Enter);CheckThat(pause.SettingsOpen&&!game.Running,"보조 메뉴 설정 열기");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(pause.Navigation.Page==PausePage.Main&&!game.Running,"설정에서 부모 메뉴 복귀");yield return Key(UnityEngine.InputSystem.Key.Escape);yield return AssertResumed("부모 메뉴 ESC");
   yield return Key(UnityEngine.InputSystem.Key.Tab);CheckThat(((NativeInventory)Get(game,"inventory")).Open&&!game.Running,"TAB 인벤토리 열림");yield return Key(UnityEngine.InputSystem.Key.Tab);CheckThat(!((NativeInventory)Get(game,"inventory")).Open,"TAB 인벤토리 닫힘");yield return AssertResumed("인벤토리 닫기");
   yield return Key(UnityEngine.InputSystem.Key.K);CheckThat(((NativeSkills)Get(game,"skills")).Open&&!game.Running,"K 스킬 정지");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(!((NativeSkills)Get(game,"skills")).Open,"스킬 ESC 닫힘");yield return AssertResumed("스킬 닫기");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Enter);CheckThat(pause.Navigation.Page==PausePage.Quit&&!game.Running,"종료 확인 열림");yield return Key(UnityEngine.InputSystem.Key.Escape);CheckThat(pause.Navigation.Page==PausePage.Main&&!game.Running,"종료 확인 취소");
   yield return Key(UnityEngine.InputSystem.Key.Home);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.DownArrow);yield return Key(UnityEngine.InputSystem.Key.Enter);CheckThat(lobby.IsBlocking&&!game.Running,"로비로 돌아가기");yield return Shot("05-return-lobby");
   lobby.SelectPreview();CheckThat(lobby.EnterNativeTest(),"로비에서 재진입");game.SetGameFocus(true);yield return null;yield return null;yield return AssertResumed("로비 재진입 입력 복구");
   yield return PauseByFocus();yield return Key(UnityEngine.InputSystem.Key.End);yield return Key(UnityEngine.InputSystem.Key.Enter);yield return Key(UnityEngine.InputSystem.Key.RightArrow);yield return Shot("06-quit-confirm");
   CheckThat(pause.Navigation.Page==PausePage.Quit&&pause.Navigation.Cursor==1,"종료 최종 선택");receipt.quitRequested=true;Save();phase="종료 Enter";InputSystem.QueueStateEvent(keyboard,new KeyboardState(UnityEngine.InputSystem.Key.Enter));
   yield return new WaitForSecondsRealtime(2);CheckThat(false,"종료 확인 명령 후 Player 종료");
  }
  IEnumerator Frames(){while(recording){yield return new WaitForEndOfFrame();if(Time.realtimeSinceStartup>=nextFrame){nextFrame=Time.realtimeSinceStartup+.1f;var t=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frames",receipt.frames.ToString("D5")+".png"),t.EncodeToPNG());Destroy(t);receipt.frames++;}}}
  delegate bool WindowCallback(IntPtr w,IntPtr s);
  [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback,IntPtr state);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint process);
  [DllImport("user32.dll")] static extern IntPtr SetActiveWindow(IntPtr window);
  [DllImport("user32.dll")] static extern IntPtr GetActiveWindow();
  [DllImport("user32.dll")] static extern IntPtr SetFocus(IntPtr window);
  [DllImport("user32.dll")] static extern IntPtr GetFocus();
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassNameW(IntPtr window,System.Text.StringBuilder name,int size);
  [DllImport("kernel32.dll")] static extern uint GetCurrentProcessId();
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowTextW(IntPtr window,System.Text.StringBuilder title,int size);
  [StructLayout(LayoutKind.Sequential)] struct ClientRect{public int left,top,right,bottom;}
  [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr window,out ClientRect rect);
  [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr window,uint message,IntPtr w,IntPtr l);
  IntPtr OwnWindow(){IntPtr found=IntPtr.Zero;uint own=GetCurrentProcessId();EnumWindows((w,state)=>{GetWindowThreadProcessId(w,out uint pid);if(pid!=own)return true;var name=new System.Text.StringBuilder(128);var title=new System.Text.StringBuilder(256);GetClassNameW(w,name,128);GetWindowTextW(w,title,256);GetClientRect(w,out ClientRect r);Debug.Log("PAUSE_OWN_WINDOW hwnd="+w+" class="+name+" title="+title+" client="+(r.right-r.left)+"x"+(r.bottom-r.top));if(name.ToString()=="UnityWndClass"&&title.ToString()==Application.productName&&r.right-r.left==Screen.width&&r.bottom-r.top==Screen.height){found=w;return false;}return true;},IntPtr.Zero);return found;}
  IEnumerator Click(float x,float y){IntPtr window=OwnWindow();CheckThat(window!=IntPtr.Zero,"제목·크기·PID가 맞는 실제 게임 창");lobby.AutomatedInput=false;lobby.SetPlaybackFocus(true);int px=Mathf.RoundToInt(x*Screen.width/1280f),py=Mathf.RoundToInt(y*Screen.height/720f);IntPtr point=new IntPtr((py<<16)|(px&65535));int down=receipt.productMouseDown,up=receipt.productMouseUp;CheckThat(PostMessageW(window,0x200,IntPtr.Zero,point)&&PostMessageW(window,0x201,new IntPtr(1),point),"검증된 게임 창 마우스 누름 전달");yield return new WaitForSecondsRealtime(.12f);CheckThat(PostMessageW(window,0x202,IntPtr.Zero,point),"검증된 게임 창 마우스 해제 전달");yield return new WaitForSecondsRealtime(.2f);CheckThat(receipt.productMouseDown>down&&receipt.productMouseUp>up,"제품 OnGUI MouseDown/MouseUp 수신","down="+(receipt.productMouseDown-down)+" up="+(receipt.productMouseUp-up)+" automated="+lobby.AutomatedInput);}
  void ProductLog(string condition,string stack,LogType type){if(!condition.StartsWith("A15_HIT_ROOT phase=before ",StringComparison.Ordinal))return;if(condition.Contains("raw=MouseDown"))receipt.productMouseDown++;if(condition.Contains("raw=MouseUp"))receipt.productMouseUp++;}
  void OnGUI(){if(Event.current==null)return;if(Event.current.rawType==EventType.MouseDown)receipt.mouseDown++;if(Event.current.rawType==EventType.MouseUp)receipt.mouseUp++;if(Event.current.rawType==EventType.Layout)receipt.layoutEvents++;if(Event.current.rawType==EventType.Repaint)receipt.repaintEvents++;}
  void OnApplicationFocus(bool focus){receipt.focusEvents++;if(game!=null&&pause!=null)Snapshot("실제 Unity focus 콜백 "+focus);}
  void OnApplicationQuit(){recording=false;if(receipt.quitRequested){receipt.quitObserved=true;Save();}Cleanup();}
  void Cleanup(){Application.logMessageReceived-=ProductLog;if(keyboard!=null){InputSystem.RemoveDevice(keyboard);keyboard=null;}if(previousKeyboard!=null&&previousKeyboard.added)previousKeyboard.MakeCurrent();previousKeyboard=null;}
  void OnDestroy(){Cleanup();}
 }
}
