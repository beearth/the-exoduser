using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Tools
{
 // Explicit sandbox-only regression: Input System devices -> real Lobby Update.
 // No direct HoldSkip/SetHeld calls, OS input, user pointer, or desktop installation.
 [DefaultExecutionOrder(-31000)]
 internal sealed class CinematicInputCheck : MonoBehaviour
 {
  [Serializable] sealed class Check {public string name,detail;public bool passed;}
  [Serializable] sealed class Sample {public string scene,input,page;public float elapsed,progress;public bool deviceHeld,lobbyHeld,automated;}
  [Serializable] sealed class Frame {public int index;public string phase,page;public float time,progress;}
  [Serializable] sealed class Receipt {public string scope="실제 Player 가상 Input System 장치 → 로비 Update. OS 전경 입력/사용자 손조작과 구분",runtimeSha,coreSha;public bool passed;public int width,height,frames;public List<Check> checks=new List<Check>();public List<Sample> samples=new List<Sample>();}
  static string Arg(string name){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,name);return i>=0&&i+1<a.Length?a[i+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-cinematic-input-check")>=0)new GameObject("Cinematic input isolated check").AddComponent<CinematicInputCheck>();}
  NativeGame game;NativeLobby lobby;Keyboard keyboard,previousKeyboard;Gamepad pad,previousPad;Receipt receipt=new Receipt();string output,phase="prepare";bool failed,recording;float nextFrame;
  void Update(){if(keyboard!=null)keyboard.MakeCurrent();if(pad!=null)pad.MakeCurrent();}
  static string Hash(string path){using(var sha=SHA256.Create())using(var stream=File.OpenRead(path))return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant();}
  static string AssemblyFile(Assembly assembly){string file=assembly.Location;if(!string.IsNullOrEmpty(file)&&File.Exists(file))return file;file=Path.Combine(Application.dataPath,"Managed",assembly.GetName().Name+".dll");if(!File.Exists(file))throw new FileNotFoundException("Actual Player assembly is required",file);return file;}
  void Save(){receipt.passed=!failed&&receipt.checks.Count>0&&receipt.checks.TrueForAll(x=>x.passed);File.WriteAllText(Path.Combine(output,"cinematic-input.json"),JsonUtility.ToJson(receipt,true));}
  void CheckThat(bool ok,string name,string detail=""){if(!ok)failed=true;receipt.checks.Add(new Check{name=name,passed=ok,detail=detail});Debug.Log("CINEMATIC_INPUT "+(ok?"PASS ":"FAIL ")+name+" "+detail);Save();}
  IEnumerator Start(){output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("CINEMATIC_INPUT_REJECT sandbox/output required");Application.Quit(3);yield break;}Directory.CreateDirectory(output);Directory.CreateDirectory(Path.Combine(output,"frames"));yield return Guard(Run());}
  IEnumerator Guard(IEnumerator run){while(true){bool more=false;object current=null;Exception error=null;try{more=run.MoveNext();if(more)current=run.Current;}catch(Exception e){error=e;}if(error!=null){CheckThat(false,"검수 예외",error.ToString());Cleanup();Application.Quit(2);yield break;}if(!more)yield break;if(current is IEnumerator nested)yield return Guard(nested);else yield return current;}}
  IEnumerator Run(){
   yield return null;game=NativeGame.Instance;lobby=game.GetComponent<NativeLobby>();
   receipt.runtimeSha=Hash(AssemblyFile(typeof(NativeGame).Assembly));receipt.coreSha=Hash(AssemblyFile(typeof(Simulation).Assembly));
   previousKeyboard=Keyboard.current;previousPad=Gamepad.current;keyboard=InputSystem.AddDevice<Keyboard>();pad=InputSystem.AddDevice<Gamepad>();keyboard.MakeCurrent();pad.MakeCurrent();Release();
   AudioListener.volume=0;AudioListener.pause=true;lobby.AutomatedInput=false;lobby.SetPlaybackFocus(true);
   receipt.width=Screen.width;receipt.height=Screen.height;recording=true;StartCoroutine(Frames());
   foreach(string scene in new[]{"world","character"})foreach(string input in new[]{"Space","Escape","B","Start"}){
    phase=scene+"-"+input;Release();lobby.ShowLobby();yield return null;yield return null;
    if(scene=="world"){lobby.ReplayIntro();yield return null;lobby.StartGate();}
    else {lobby.Characters.TryRestore(new string[0],-1);lobby.OpenCharacterCreation();lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();CheckThat(lobby.CreateCharacter("검수"+receipt.checks.Count),phase+" 캐릭터 생성");}
    float limit=Time.realtimeSinceStartup+25;while(!lobby.CurrentVideo.Prepared&&Time.realtimeSinceStartup<limit)yield return null;
    CheckThat(lobby.CurrentVideo.Prepared&&lobby.VideoError.Length==0,phase+" 실제 영상 준비");
    yield return null;yield return null;int tick=game.Simulation.TickCount;
    // A partial hold, release, then full hold must not share the previous progress.
    Inject(input);yield return new WaitForSecondsRealtime(.35f);
    float partial=Progress(scene);CheckThat(partial>0&&partial<1,phase+" 부분 홀드 진행",partial.ToString("F4"));
    Release();yield return null;yield return null;CheckThat(Progress(scene)==0,phase+" 해제 초기화");
    Inject(input);float started=Time.realtimeSinceStartup;limit=started+(scene=="world"?6.5f:2.5f);
    while(!Complete(scene)&&Time.realtimeSinceStartup<limit){receipt.samples.Add(new Sample{scene=scene,input=input,page=lobby.StageName,elapsed=Time.realtimeSinceStartup-started,progress=Progress(scene),deviceHeld=ExoInput.Key(input=="Space"?KeyCode.Space:input=="Escape"?KeyCode.Escape:input=="B"?KeyCode.JoystickButton1:KeyCode.JoystickButton7),lobbyHeld=LobbyKeys.Held(input=="Escape"?KeyCode.Escape:KeyCode.Space),automated=lobby.AutomatedInput});yield return null;}
    CheckThat(Complete(scene),phase+" 실제 Update 홀드 건너뛰기","elapsed="+(Time.realtimeSinceStartup-started).ToString("F3"));
    CheckThat(game.Simulation.TickCount==tick,phase+" 영상 중 전투 틱 정지");Release();
    // Record the real completion destination before the next case prepares a page.
    // Story's existing 1.2s gate must advance itself; the fixture never substitutes ShowLobby for that transition.
    phase+="-success";yield return new WaitForSecondsRealtime(scene=="world"?.65f:1.5f);
    lobby.ShowLobby();yield return null;
   }
   recording=false;Save();Cleanup();lobby.CloseStartupCaptureMedia();Application.Quit(failed?2:0);
  }
  float Progress(string scene){return scene=="world"?(float)lobby.Flow.SkipProgress:(float)lobby.CharacterStoryHoldProgress;}
  bool Complete(string scene){return scene=="world"?lobby.Flow.Page==LobbyPage.Lobby:lobby.CharacterStoryEntering;}
  void Inject(string input){keyboard.MakeCurrent();pad.MakeCurrent();InputSystem.QueueStateEvent(keyboard,new KeyboardState(input=="Space"?new[]{Key.Space}:input=="Escape"?new[]{Key.Escape}:new Key[0]));var state=new GamepadState();if(input=="B")state=state.WithButton(GamepadButton.East);if(input=="Start")state=state.WithButton(GamepadButton.Start);InputSystem.QueueStateEvent(pad,state);}
  void Release(){if(keyboard!=null)InputSystem.QueueStateEvent(keyboard,new KeyboardState());if(pad!=null)InputSystem.QueueStateEvent(pad,new GamepadState());}
  IEnumerator Frames(){while(recording){yield return new WaitForEndOfFrame();if(Time.realtimeSinceStartup<nextFrame)continue;nextFrame=Time.realtimeSinceStartup+.1f;var frame=new Frame{index=receipt.frames,phase=phase,page=lobby.StageName,time=Time.realtimeSinceStartup,progress=lobby.CharacterStoryActive?(float)lobby.CharacterStoryHoldProgress:(float)lobby.Flow.SkipProgress};var t=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frames",receipt.frames.ToString("D5")+".png"),t.EncodeToPNG());Destroy(t);File.AppendAllText(Path.Combine(output,"frames.jsonl"),JsonUtility.ToJson(frame)+"\n");receipt.frames++;}}
  void Cleanup(){recording=false;if(keyboard!=null){InputSystem.RemoveDevice(keyboard);keyboard=null;}if(pad!=null){InputSystem.RemoveDevice(pad);pad=null;}if(previousKeyboard!=null&&previousKeyboard.added)previousKeyboard.MakeCurrent();if(previousPad!=null&&previousPad.added)previousPad.MakeCurrent();}
  void OnDestroy(){Cleanup();}
 }
}
