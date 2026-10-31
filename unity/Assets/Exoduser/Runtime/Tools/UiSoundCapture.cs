using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using Unity.Collections;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort.Tools {
 // 명시적 무음 출력파일 검수. AudioRenderer가 성공한 동안만 Listener를 열며 장치에는 silence만 출력한다.
 internal sealed class UiSoundCapture:MonoBehaviour {
  const string Flag="--unity-ui-sound-capture";static bool recording;
  static bool Has(string s)=>Array.IndexOf(Environment.GetCommandLineArgs(),s)>=0;
  static string Arg(string s){var a=Environment.GetCommandLineArgs();int n=Array.IndexOf(a,s);return n>=0&&n+1<a.Length?a[n+1]:null;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]static void Early(){if(Has(Flag)){AudioListener.volume=0;AudioListener.pause=true;}}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]static void Boot(){if(Has(Flag)&&!Has("--unity-m1-check"))new GameObject("UI sound buffer capture").AddComponent<UiSoundCapture>();}
  [Serializable]sealed class Check{public string id,detail;public bool passed;}
  [Serializable]sealed class Cue{public string name;public int frame,sample;public double time;}
  [Serializable]sealed class Receipt{public string scope="실제 GPU Player의 생산 콜백을 스크립트로 실행. 자연플레이/사용자 청음 아님. AudioRenderer는 장치에 silence만 출력",runtimeSha,coreSha,device,sandbox;public bool passed,deviceSilent;public int fps=15,frames,sampleRate,channels,sampleCount;public float peak,rms;public List<Check> checks=new List<Check>();public List<Cue> cues=new List<Cue>();public List<NativeFeedbackAudio.UiAudioEvent> events;}
  Receipt receipt=new Receipt();NativeGame game;NativeLobby lobby;NativeFeedbackAudio sound;string output,label="시작 준비";List<float> pcm=new List<float>();int frame;bool failed;
  const BindingFlags Private=BindingFlags.Instance|BindingFlags.NonPublic;
  static object Get(object o,string n)=>o.GetType().GetField(n,Private).GetValue(o);
  static void Set(object o,string n,object v)=>o.GetType().GetField(n,Private).SetValue(o,v);
  static object Call(object o,string n,params object[] args)=>o.GetType().GetMethod(n,Private).Invoke(o,args);
  static string Hash(string p){using(var h=SHA256.Create())using(var f=File.OpenRead(p))return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
  void CheckThat(string id,bool ok,string detail=""){receipt.checks.Add(new Check{id=id,passed=ok,detail=detail});if(!ok)throw new InvalidOperationException(id+": "+detail);}
  void CueAt(string name){label=name;receipt.cues.Add(new Cue{name=name,frame=frame,sample=pcm.Count,time=Time.realtimeSinceStartupAsDouble});}
  IEnumerator Start(){output=Arg("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Application.Quit(3);yield break;}Directory.CreateDirectory(output);yield return Guard(Run());}
  IEnumerator Guard(IEnumerator run){while(true){object current=null;bool more=false;Exception error=null;try{more=run.MoveNext();if(more)current=run.Current;}catch(Exception e){error=e;}if(error!=null){failed=true;receipt.checks.Add(new Check{id="검수예외",passed=false,detail=error.ToString()});Finish();Debug.LogError("UI_SOUND_CAPTURE_FAILED "+error);Application.Quit(2);yield break;}if(!more)yield break;if(current is IEnumerator nested){yield return Guard(nested);if(failed)yield break;}else yield return current;}}
  IEnumerator Run(){
   while(NativeGame.Instance==null)yield return null;game=NativeGame.Instance;lobby=game.GetComponent<NativeLobby>();sound=(NativeFeedbackAudio)Get(game,"sound");yield return null;
   game.enabled=false;typeof(NativeGame).GetProperty("Running").SetValue(game,false);Set(game,"smokeActive",true);Set(game,"pauseSmoke",true);Set(game,"dropSmoke",true);Set(game,"gameFocused",true);
   receipt.runtimeSha=Hash(typeof(NativeGame).Assembly.Location);receipt.coreSha=Hash(typeof(Simulation).Assembly.Location);receipt.sandbox=NativeQaSandbox.Root;receipt.device=SystemInfo.graphicsDeviceName;
   foreach(var key in new[]{"ui_tab","ui_button_hover","ui_button_confirm","ui_panel_open","ui_panel_close","ui_levelup","pickup_item","pickup_rummage1","pickup_rummage2","pickup_rummage3","pickup_rummage4","pickup_rummage5"}){var clip=sound.Clip(key);var data=new float[clip.samples*clip.channels];CheckThat("실제 클립 디코드 "+key,clip.GetData(data,0)&&Array.Exists(data,x=>Mathf.Abs(x)>.00001f),clip.samples+"/"+clip.channels+"/"+clip.frequency);}
   Application.runInBackground=true;Application.targetFrameRate=15;Time.captureDeltaTime=1f/15;
   AudioListener.volume=0;AudioListener.pause=true;recording=AudioRenderer.Start();CheckThat("장치무음 녹음모드",recording);receipt.deviceSilent=true;
   receipt.sampleRate=AudioSettings.outputSampleRate;receipt.channels=AudioSettings.speakerMode==AudioSpeakerMode.Mono?1:2;CheckThat("스테레오 출력",AudioSettings.speakerMode==AudioSpeakerMode.Stereo||AudioSettings.speakerMode==AudioSpeakerMode.Mono);
   AudioListener.volume=1;AudioListener.pause=false;sound.SetVolumePercent(60);lobby.Begin();lobby.AdvanceSplash();lobby.AutomatedInput=true;
   for(frame=0;frame<450;frame++){
    lobby.SetPlaybackFocus(true);
    if(frame==0)CueAt("타이틀 메뉴 이동은 무음");
    if(frame==30){CueAt("게임 시작 ENTER · 인장과 같은 프레임");Call(lobby,"BuildTitleRows");Call(lobby,"ActivateTitleRow",0);}
    if(frame==75){CueAt("첫 인장 ENTER · 웹 원음 gain 2");int before=lobby.EntryAudioEvents;lobby.StartGate();CheckThat("인장 ENTER 1회",lobby.EntryAudioEvents==before+1);}
    if(frame==135){CueAt("캐릭터 선택은 무음");lobby.ShowLobby();lobby.Characters.TryCreate("음향검수",0,out var error);lobby.Characters.Select(0);}
    if(frame==150){CueAt("입장 호버 루프 · 100ms 페이드인");Set(lobby,"entryHoverWanted",true);}
    if(frame>=150&&frame<165)Set(lobby,"entryHoverFrame",Time.frameCount);
    if(frame==165){CueAt("호버 종료 · 80ms 페이드아웃");Call(lobby,"StopEntryHover");}
    if(frame==180){CueAt("저장 캐릭터 입장 · 웹과 같은 ENTER");lobby.HasCombatSave=_=>true;lobby.AutomatedInput=false;int n=lobby.EntryAudioEvents;CheckThat("저장캐릭터 진입",lobby.EnterSelectedCharacter());CheckThat("저장캐릭터 ENTER 1회",lobby.EntryAudioEvents==n+1);typeof(NativeGame).GetProperty("Running").SetValue(game,false);game.enabled=false;Call(game,"EndFirstPractice",true);Set(game,"menu",false);Set(game,"gameFocused",true);}
    if(frame==195){CueAt("TAB 인벤토리 열기");int n=sound.UiEvents.Count;Call(game,"SetInventory",true);CheckThat("인벤 열기 1회",sound.UiEvents.Count==n+1&&sound.UiEvents[n].key=="ui_panel_open");}
    if(frame==225){CueAt("인벤토리 닫기");int n=sound.UiEvents.Count;Call(game,"SetInventory",false);CheckThat("인벤 닫기 1회",sound.UiEvents.Count==n+1&&sound.UiEvents[n].key=="ui_panel_close");}
    if(frame==240){CueAt("일시정지 설정 열기");Call(game,"OnPanelRequested","settings");}
    if(frame==270){CueAt("설정 → 인벤토리 · 탭 1회");int n=sound.UiEvents.Count;Call(game,"OnPanelRequested","invPanel");CheckThat("전환은 탭만 1회",sound.UiEvents.Count==n+1&&sound.UiEvents[n].key=="ui_tab");}
    if(frame==285){CueAt("활성 탭 재선택은 무음");int n=sound.UiEvents.Count;Call(game,"OnPanelRequested","invPanel");CheckThat("활성 탭 무음",sound.UiEvents.Count==n);}
    if(frame==300){Call(game,"SetInventory",false);CueAt("버튼 호버 · 웹 원음");sound.PlayUiSample("ui_button_hover",.25f);}
    if(frame==315){CueAt("버튼 확정 · 처리기 고유음 중복 억제");NativeUiSounds.Current.Clicked();}
    if(frame==330){CueAt("레벨업 · 웹 합성 아르페지오");int n=sound.UiEvents.Count;game.Simulation.AddExperience(game.Simulation.Player.MaxExperience);CheckThat("실제 레벨업 이벤트",sound.UiEvents.Count==n+1&&sound.UiEvents[n].key=="ui_levelup");}
    if(frame==375){CueAt("드랍 아이템 획득 · 웹 6종 풀");var item=NativeInventorySeed.Load().equipped[0];int n=sound.UiEvents.Count;bool picked=(bool)Call(game,"CollectLoot",new LootState{Item=item,Rarity=item.rarity});CheckThat("실제 가방 획득",picked&&sound.UiEvents.Count==n+1&&sound.UiEvents[n].key.StartsWith("pickup_"));}
    if(frame==405){CueAt("SFX 0% · 창 열기는 무음");sound.SetVolumePercent(0);Call(game,"SetInventory",true);}
    if(frame==420){CueAt("SFX 0% · 레벨업 합성음도 무음");int n=sound.UiEvents.Count;sound.PlayLevelUp();CheckThat("합성음 0퍼센트 소스 무음",sound.UiEvents.Count==n+1&&sound.UiEvents[n].sourceVolume==0);}
    if(frame>=180){Camera.main.cullingMask=(int)Get(game,"worldMask");Call(game,"UpdateViews");}
    yield return new WaitForEndOfFrame();
    var image=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frame"+frame.ToString("D4")+".png"),image.EncodeToPNG());Destroy(image);
    int nFrames=AudioRenderer.GetSampleCountForCaptureFrame();using(var buffer=new NativeArray<float>(nFrames*receipt.channels,Allocator.Temp)){CheckThat("출력버퍼 "+frame,AudioRenderer.Render(buffer));for(int i=0;i<buffer.Length;i++)pcm.Add(buffer[i]);}
   }
   receipt.frames=frame;receipt.sampleCount=pcm.Count;double square=0;foreach(float s in pcm){receipt.peak=Mathf.Max(receipt.peak,Mathf.Abs(s));square+=s*s;}receipt.rms=(float)Math.Sqrt(square/Math.Max(1,pcm.Count));CheckThat("실제 출력버퍼 유음",receipt.peak>.001f&&receipt.rms>.00001f);
   receipt.events=new List<NativeFeedbackAudio.UiAudioEvent>(sound.UiEvents);receipt.passed=true;Finish();Debug.Log("UI_SOUND_CAPTURE_COMPLETE "+receipt.checks.Count);Application.Quit(0);
  }
  void Finish(){AudioListener.volume=0;AudioListener.pause=true;if(recording){AudioRenderer.Stop();recording=false;}Time.captureDeltaTime=0;if(output==null)return;receipt.events=new List<NativeFeedbackAudio.UiAudioEvent>(sound?.UiEvents??new List<NativeFeedbackAudio.UiAudioEvent>());File.WriteAllText(Path.Combine(output,"오디오_검수.json"),JsonUtility.ToJson(receipt,true));using(var w=new BinaryWriter(File.Create(Path.Combine(output,"출력버퍼.wav")))){int bytes=pcm.Count*2;w.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));w.Write(36+bytes);w.Write(System.Text.Encoding.ASCII.GetBytes("WAVEfmt "));w.Write(16);w.Write((short)1);w.Write((short)receipt.channels);w.Write(receipt.sampleRate);w.Write(receipt.sampleRate*receipt.channels*2);w.Write((short)(receipt.channels*2));w.Write((short)16);w.Write(System.Text.Encoding.ASCII.GetBytes("data"));w.Write(bytes);foreach(float s in pcm)w.Write((short)Mathf.Clamp(Mathf.RoundToInt(s*32767),-32768,32767));}lobby?.CloseStartupCaptureMedia();}
  void OnGUI(){if(!recording)return;if(game!=null&&!game.enabled&&lobby!=null&&!lobby.IsBlocking)Call(game,"OnGUI");var old=GUI.color;GUI.color=new Color(0,0,0,.85f);GUI.Box(new Rect(16,Screen.height-64,Screen.width-32,48),"");GUI.color=Color.white;var style=new GUIStyle(GUI.skin.label){fontSize=22,alignment=TextAnchor.MiddleCenter};style.font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");GUI.Label(new Rect(16,Screen.height-64,Screen.width-32,48),label,style);GUI.color=old;}
  void OnDestroy(){AudioListener.volume=0;AudioListener.pause=true;if(recording){AudioRenderer.Stop();recording=false;}Time.captureDeltaTime=0;}
 }
}
