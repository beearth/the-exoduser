using System;
using System.Collections;
using System.IO;
using Unity.Collections;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort.Tools {
 internal sealed partial class UiSoundCapture {
  bool lobbyCapture,mouseHoverPending;int eventBaseline;string lastCue;
  void LobbyCue(string name){CueAt(name);lastCue=name;eventBaseline=sound.UiEvents.Count;}
  void ExpectUi(string key,float gain){CheckThat(lastCue,sound.UiEvents.Count==eventBaseline+1&&sound.UiEvents[eventBaseline].key==key);var e=sound.UiEvents[eventBaseline];CheckThat(lastCue+" 웹 gain/pitch",Mathf.Abs(e.gain-gain)<.00001f&&Mathf.Abs(e.sourceVolume-gain*.6f)<.00001f&&e.pitch==1);}
  void CaptureLobbyPointer(){
   if(!lobbyCapture||!mouseHoverPending||Event.current.type!=EventType.Repaint)return;
   mouseHoverPending=false;var previous=Event.current;
   try{Event.current=new Event{type=EventType.MouseMove,mousePosition=new Vector2(10,10)};NativeUiSounds.Current.BeforeButton(new Rect(0,0,20,20),"title-pointer");}finally{Event.current=previous;}
  }
  IEnumerator RunLobby(){
   lobbyCapture=true;while(NativeGame.Instance==null)yield return null;game=NativeGame.Instance;lobby=game.GetComponent<NativeLobby>();sound=(NativeFeedbackAudio)Get(game,"sound");yield return null;
   game.enabled=false;typeof(NativeGame).GetProperty("Running").SetValue(game,false);Set(game,"smokeActive",true);Set(game,"pauseSmoke",true);Set(game,"dropSmoke",true);Set(game,"gameFocused",true);
   receipt.runtimeSha=Hash(typeof(NativeGame).Assembly.Location);receipt.coreSha=Hash(typeof(Simulation).Assembly.Location);receipt.sandbox=NativeQaSandbox.Root;receipt.device=SystemInfo.graphicsDeviceName;
   Application.runInBackground=true;Application.targetFrameRate=15;Time.captureDeltaTime=1f/15;
   AudioListener.volume=0;AudioListener.pause=true;recording=AudioRenderer.Start();CheckThat("장치무음 출력버퍼 녹음",recording);receipt.deviceSilent=true;receipt.sampleRate=AudioSettings.outputSampleRate;receipt.channels=AudioSettings.speakerMode==AudioSpeakerMode.Mono?1:2;
   CheckThat("스테레오 또는 모노",AudioSettings.speakerMode==AudioSpeakerMode.Stereo||AudioSettings.speakerMode==AudioSpeakerMode.Mono);
   AudioListener.volume=1;AudioListener.pause=false;sound.SetVolumePercent(60);lobby.SetStartupSfxPercent(60);lobby.Begin();lobby.AdvanceSplash();lobby.AutomatedInput=true;
   for(frame=0;frame<390;frame++){
    lobby.SetPlaybackFocus(true);
    if(frame==0){LobbyCue("시작 메뉴 마우스 호버 · 웹 .6 × SFX");NativeUiSounds.Current.ResetHover();mouseHoverPending=true;}
    if(frame==3)ExpectUi("ui_button_hover",.6f);
    if(frame==15){LobbyCue("시작 메뉴 키보드/패드 이동 · 같은 호버");Call(lobby,"BuildTitleRows");Call(lobby,"SelectTitleRow",1);}
    if(frame==18)ExpectUi("ui_button_hover",.6f);
    if(frame==30){LobbyCue("게임 시작 · ENTER 원음 gain 2");int n=lobby.EntryAudioEvents;Call(lobby,"ActivateTitleRow",0);CheckThat("시작 ENTER 매번 재생",lobby.EntryAudioEvents==n+1);}
    if(frame==50){LobbyCue("인장 호버 · 100ms 진입/80ms 이탈");Set(lobby,"entryHoverWanted",true);}
    if(frame>=50&&frame<65)Set(lobby,"entryHoverFrame",Time.frameCount);
    if(frame==65)Call(lobby,"StopEntryHover");
    if(frame==75){LobbyCue("인장 ENTER · 일반 확인음 없음");int n=lobby.EntryAudioEvents;lobby.StartGate();CheckThat("인장 ENTER 매번 재생",lobby.EntryAudioEvents==n+1);}
    if(frame==90){lobby.ShowLobby();LobbyCue("로비 새 캐릭터 · 일반 확인음");CheckThat("실제 생성창 열기",lobby.OpenCharacterCreation());}
    if(frame==93)ExpectUi("ui_button_confirm",.35f);
    if(frame==105){LobbyCue("직업 아이콘 키보드/패드 이동");CheckThat("실제 직업 이동",lobby.ChooseCharacterVisual(1));}
    if(frame==120){LobbyCue("취소 · 일반 확인음");lobby.CloseCharacterCreation();}
    if(frame==123)ExpectUi("ui_button_confirm",.35f);
    if(frame==135){lobby.OpenCharacterCreation();lobby.ChooseCharacterVisual(0);}
    if(frame==150){LobbyCue("전사 선택 확정 · 두둥만");int n=NativeDecisionSound.Events;CheckThat("직업 확정",lobby.ConfirmCharacterVisual());CheckThat("직업 두둥 1회",NativeDecisionSound.Events==n+1);}
    if(frame==153)CheckThat("직업 결정/일반 확인 중복0",sound.UiEvents.Count==eventBaseline);
    if(frame==190){LobbyCue("캐릭터 생성 · 두둥만");int n=NativeDecisionSound.Events;CheckThat("실제 캐릭터 생성",lobby.CreateCharacter("소리검수"));CheckThat("생성 두둥 1회",NativeDecisionSound.Events==n+1);}
    if(frame==193)CheckThat("생성 결정/일반 확인 중복0",sound.UiEvents.Count==eventBaseline);
    if(frame==215){LobbyCue("로비 입장 호버 루프");Set(lobby,"entryHoverWanted",true);}
    if(frame>=215&&frame<230)Set(lobby,"entryHoverFrame",Time.frameCount);
    if(frame==230)Call(lobby,"StopEntryHover");
    if(frame==240){LobbyCue("삭제창 · 일반 확인음");CheckThat("실제 삭제창",lobby.RequestCharacterDelete(lobby.Characters.SelectedIndex));}
    if(frame==243)ExpectUi("ui_button_confirm",.35f);
    if(frame==255){LobbyCue("삭제 확정 · dark 두둥만");int n=NativeDecisionSound.Events;CheckThat("실제 삭제 확정",lobby.ConfirmCharacterDelete());CheckThat("삭제 두둥 1회",NativeDecisionSound.Events==n+1);}
    if(frame==258)CheckThat("삭제 결정/일반 확인 중복0",sound.UiEvents.Count==eventBaseline);
    if(frame==280){LobbyCue("언어 메뉴 열기");Call(lobby,"ToggleLanguages");}
    if(frame==283)ExpectUi("ui_button_confirm",.35f);
    if(frame==295){LobbyCue("언어 키보드/패드 이동");lobby.ProcessLanguageMenuKey(KeyCode.DownArrow,false);}
    if(frame==298)ExpectUi("ui_button_hover",.6f);
    if(frame==310){LobbyCue("언어 메뉴 취소");Call(lobby,"CloseLanguageMenu");}
    if(frame==313)ExpectUi("ui_button_confirm",.35f);
    if(frame==330){LobbyCue("SFX 0% · 일반 UI 무음");sound.SetVolumePercent(0);NativeUiSounds.Current.Navigate("mute-check");CheckThat("음량0 소스",sound.UiEvents[sound.UiEvents.Count-1].sourceVolume==0);}
    if(frame==345){LobbyCue("포커스 없음 · UI 이벤트0");lobby.SetPlaybackFocus(false);int n=sound.UiEvents.Count;NativeUiSounds.Current.Navigate("blur-check");NativeUiSounds.Current.Clicked();CheckThat("포커스 차단",sound.UiEvents.Count==n);}
    yield return new WaitForEndOfFrame();
    var shot=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frame"+frame.ToString("D4")+".png"),shot.EncodeToPNG());Destroy(shot);
    int samples=AudioRenderer.GetSampleCountForCaptureFrame();using(var buffer=new NativeArray<float>(samples*receipt.channels,Allocator.Temp)){CheckThat("로비 출력버퍼 "+frame,AudioRenderer.Render(buffer));for(int i=0;i<buffer.Length;i++)pcm.Add(buffer[i]);}
   }
   receipt.frames=frame;receipt.sampleCount=pcm.Count;receipt.decisionEvents=NativeDecisionSound.Events;double square=0;foreach(float value in pcm){receipt.peak=Mathf.Max(receipt.peak,Mathf.Abs(value));square+=value*value;}receipt.rms=(float)Math.Sqrt(square/Math.Max(1,pcm.Count));CheckThat("로비 실제 출력버퍼 유음",receipt.peak>.001f&&receipt.rms>.00001f);receipt.passed=true;Finish();Debug.Log("LOBBY_UI_SOUND_CAPTURE_COMPLETE "+receipt.checks.Count);Application.Quit(0);
  }
 }
}
