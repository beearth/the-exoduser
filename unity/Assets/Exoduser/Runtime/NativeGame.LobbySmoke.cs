using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class LobbyMovieSample {
   public string stage,error,audioOutputMode,timeUpdateMode;public bool canSetTimeUpdateMode,canSetDirectAudioVolume,prepared,frameAdvanced,nonBlack,stageMatched,voiceMuted,voiceSourcePlaying;
   public long firstFrame=-1,lastFrame=-1;public double firstTime,time,timeAdvanced,wallElapsed,duration,frameRate,playbackSpeed,dspTime;
   public int width,height,frameChanges,audioTracks;public float voicePeak,musicPeak,listenerPeak,voiceVolume;
  }
  [Serializable] sealed class LobbyWorldPlayback {
   public bool endedEvent;public double duration,firstVideoTime,lastVideoTime,wallElapsed,maxFrameGapSeconds,maxProgressStallSeconds,minimumSpeed=double.MaxValue,maximumSpeed;
   public int frameChanges,audioProbeCount;public float voicePeak,musicPeak,listenerPeak;
  }
  [Serializable] sealed class LobbySmokeReceipt {
   public string scope;public LobbyMovieSample[] samples;public LobbyWorldPlayback worldPlayback;
   public bool worldCompletedNaturally,captionVisible,originalArtDrawn,replayWorked,holdSkipWorked,simulationPaused,explicitTestEntry;
   public float voicePeak,musicPeak;public int audioBufferWarnings;
  }
  LobbySmokeReceipt lobbyReceipt;readonly List<LobbyMovieSample> lobbySamples=new List<LobbyMovieSample>();
  VideoPlayer lobbyWorldPlayer;VideoPlayer.FrameReadyEventHandler lobbyWorldFrame;VideoPlayer.EventHandler lobbyWorldEnd;
  double lobbyWorldStarted=-1,lobbyWorldChanged=-1,lobbyWorldLastFrameWall=-1,lobbyWorldVideoTime=-1,lobbyProgressAt;
  string lobbyFixtureOutput;bool lobbyLogSubscribed;
  static double LobbyNow{get{return Time.realtimeSinceStartupAsDouble;}}
  [Serializable] sealed class LobbyControlCheck {public string name;public bool passed;}
  [Serializable] sealed class LobbyControlsReceipt {
   public string scope="native_player_control_api_not_os_input";
   public List<LobbyControlCheck> checks=new List<LobbyControlCheck>();
   public double pausedDelta,blurredDelta;public bool passed;
  }
  IEnumerator LobbyControlsSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;
   Directory.CreateDirectory(output);var result=new LobbyControlsReceipt();
   Action<string,bool> check=(name,passed)=>result.checks.Add(new LobbyControlCheck{name=name,passed=passed});
   int tick=Simulation.TickCount;
   try{
    lobby.SetPlaybackFocus(true);yield return null;lobby.AdvanceSplash();yield return null;lobby.AdvanceSplash();yield return null;
    double limit=LobbyNow+15;
    yield return new WaitForEndOfFrame();
    check("sigil_ready_without_legacy_door",lobby.Flow.Page==LobbyPage.Title&&lobby.OriginalArtDrawn);
    if(!result.checks[0].passed)yield break;
    lobby.StartGate();limit=LobbyNow+25;
    while((lobby.Flow.Page!=LobbyPage.WorldIntro||!lobby.CurrentVideo.Prepared||lobby.CurrentVideo.Time<2)&&LobbyNow<limit)yield return null;
    var movie=lobby.CurrentVideo;var music=lobby.GetComponent<AudioSource>();
    bool ready=lobby.Flow.Page==LobbyPage.WorldIntro&&movie.Prepared&&movie.Player.isPlaying;
    check("world_playing",ready);if(!ready)yield break;
    yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"controls-playing.png"));yield return null;
    lobby.TogglePlayback();yield return new WaitForSecondsRealtime(.2f);double paused=movie.Time;
    yield return new WaitForSecondsRealtime(.8f);result.pausedDelta=Math.Abs(movie.Time-paused);
    check("pause_freezes_video_and_music",!movie.Player.isPlaying&&!music.isPlaying&&result.pausedDelta<.1);
    yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"controls-paused.png"));yield return null;
    lobby.SetPlaybackFocus(false);yield return new WaitForSecondsRealtime(.3f);
    lobby.SetPlaybackFocus(true);yield return new WaitForSecondsRealtime(.5f);
    check("manual_pause_survives_focus_return",!movie.Player.isPlaying&&!music.isPlaying&&Math.Abs(movie.Time-paused)<.1);
    lobby.TogglePlayback();yield return new WaitForSecondsRealtime(.8f);
    check("resume_advances_video_and_music",movie.Player.isPlaying&&music.isPlaying&&movie.Time>paused+.3);
    lobby.SetPlaybackFocus(false);yield return new WaitForSecondsRealtime(.2f);double blurred=movie.Time;
    yield return new WaitForSecondsRealtime(.8f);result.blurredDelta=Math.Abs(movie.Time-blurred);
    check("focus_loss_freezes_video_and_music",!movie.Player.isPlaying&&!music.isPlaying&&result.blurredDelta<.1);
    lobby.SetPlaybackFocus(true);yield return new WaitForSecondsRealtime(.8f);
    check("focus_return_resumes_previous_playback",movie.Player.isPlaying&&music.isPlaying&&movie.Time>blurred+.3);
    check("controls_do_not_advance_gameplay",Simulation.TickCount==tick);
    check("decoder_has_no_error",movie.Error.Length==0);
   }finally{
    result.passed=result.checks.Count==9&&result.checks.TrueForAll(x=>x.passed);
    File.WriteAllText(Path.Combine(output,"lobby-controls.json"),JsonUtility.ToJson(result,true));
    lobby.SetPlaybackFocus(true);lobby.ShowLobby();Running=false;lobbySmoke=false;lobbyControlsSmoke=false;
   }
  }
  IEnumerator LobbySmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   bool probe=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-lobby-probe")>=0;
   lobbyFixtureOutput=output;lobbySamples.Clear();lobbyReceipt=new LobbySmokeReceipt{scope=probe?"actual_native_player_frontend_probe":"actual_native_player_frontend_fixture"};int tick=Simulation.TickCount;
   Application.logMessageReceived+=LobbyFixtureLog;lobbyLogSubscribed=true;
   try{
    yield return CaptureLobbyMovie("fdg",.7,output);
    double limit=LobbyNow+20;while(lobby.StageName=="FDG"&&LobbyNow<limit){ProbeLobbyAudio();yield return null;}
    yield return CaptureLobbyMovie("splash",1.5,output);lobbyReceipt.originalArtDrawn=lobby.OriginalArtDrawn;
    lobby.AdvanceSplash();yield return null;
    yield return new WaitForSecondsRealtime(3.9f);
    yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-lobby-enter.png"));yield return null;
    lobby.StartGate();yield return null;
    limit=LobbyNow+20;while(lobby.Flow.Page==LobbyPage.Gate&&LobbyNow<limit){ProbeLobbyAudio();yield return null;}
    BeginLobbyWorldObservation();yield return CaptureLobbyMovie("world",probe?2:6,output);
    lobbyReceipt.captionVisible=lobby.CaptionVisible;limit=LobbyNow+(probe?10:145);
    while(lobby.Flow.Page==LobbyPage.WorldIntro&&LobbyNow<limit){ProbeLobbyAudio();lobbyReceipt.captionVisible|=lobby.CaptionVisible;yield return null;}
    ProbeLobbyAudio();lobbyReceipt.worldCompletedNaturally=lobby.Flow.Page==LobbyPage.Lobby&&lobby.WorldEndedNaturally&&lobbyReceipt.worldPlayback!=null&&lobbyReceipt.worldPlayback.endedEvent;
    StopLobbyWorldObservation();
    if(probe){lobby.ShowLobby();yield return CaptureLobbyMovie("lobby",.6,output);lobbyReceipt.originalArtDrawn&=lobby.OriginalArtDrawn;WriteLobbyProgress();File.WriteAllText(Path.Combine(output,"lobby-probe.json"),JsonUtility.ToJson(lobbyReceipt,true));lobbySmoke=false;yield break;}
    yield return CaptureLobbyMovie("lobby",.6,output);lobbyReceipt.originalArtDrawn&=lobby.OriginalArtDrawn;
    lobbyReceipt.simulationPaused=Simulation.TickCount==tick;
    lobby.ReplayIntro();yield return null;lobbyReceipt.replayWorked=lobby.StageName=="Title";
    // Same model path as held ESC/SPACE. This does not claim OS input coverage.
    lobby.Flow.HoldSkip(true,5);yield return null;yield return null;lobbyReceipt.holdSkipWorked=lobby.Flow.Page==LobbyPage.Lobby;
    lobby.SelectPreview();lobbyReceipt.explicitTestEntry=lobby.EnterNativeTest();yield return null;
    lobbyReceipt.explicitTestEntry&=!lobby.IsBlocking&&Running;
    lobby.ShowLobby();Running=false;yield return new WaitForSecondsRealtime(.4f);
    WriteLobbyProgress();File.WriteAllText(Path.Combine(output,"lobby-smoke.json"),JsonUtility.ToJson(lobbyReceipt,true));lobbySmoke=false;
   }finally{StopLobbyFixtureObservers();}
  }
  bool LobbyStageMatches(string stage,VideoPlayer player){string expected=stage=="fdg"?"FDG":stage=="splash"?"SplashTitle":stage=="gate"?"Gate":stage=="world"?"WorldIntro":"Lobby";return player!=null&&lobby.StageName==expected&&ReferenceEquals(lobby.CurrentVideo.Player,player);}
  IEnumerator CaptureLobbyMovie(string stage,double minimumTime,string output){
   var player=lobby.CurrentVideo.Player;double started=LobbyNow,lastTime=-1;long previousFrame=-1;float voicePeak=0,musicPeak=0,listenerPeak=0;
   var sample=new LobbyMovieSample{stage=stage};
   VideoPlayer.FrameReadyEventHandler observe=(p,f)=>{
    if(!ReferenceEquals(p,player))return;double time=p.time;
    if(sample.firstFrame<0){sample.firstFrame=f;sample.firstTime=time;}
    if(previousFrame>=0&&f!=previousFrame){sample.frameChanges++;double delta=time-lastTime;if(delta<0&&p.isLooping&&p.length>0)delta+=p.length;if(delta>0)sample.timeAdvanced+=delta;}
    previousFrame=f;lastTime=time;sample.lastFrame=f;sample.time=time;
   };
   if(player!=null){player.frameReady+=observe;if(player.isPrepared&&player.frame>=0)observe(player,player.frame);}
   try{
    double limit=LobbyNow+22;
    while(LobbyNow<limit&&LobbyStageMatches(stage,player)){
     ProbeLobbyAudio();var voice=lobby.CurrentVideo.Voice;if(voice!=null)voicePeak=Mathf.Max(voicePeak,AudioPeak(voice));var music=lobby.GetComponent<AudioSource>();if(music!=null)musicPeak=Mathf.Max(musicPeak,AudioPeak(music));listenerPeak=Mathf.Max(listenerPeak,LobbyListenerPeak());
     if(player.isPrepared&&sample.frameChanges>0&&sample.timeAdvanced>.01&&player.time>=minimumTime)break;
     yield return null;
    }
    sample.stageMatched=LobbyStageMatches(stage,player);sample.prepared=sample.stageMatched&&player.isPrepared;sample.frameAdvanced=sample.frameChanges>0&&sample.timeAdvanced>.01;sample.wallElapsed=LobbyNow-started;
    if(sample.stageMatched){sample.error=lobby.CurrentVideo.Error;sample.duration=player.length;sample.frameRate=player.frameRate;sample.playbackSpeed=player.playbackSpeed;sample.audioTracks=player.audioTrackCount;sample.audioOutputMode=player.audioOutputMode.ToString();sample.timeUpdateMode=player.timeUpdateMode.ToString();sample.canSetTimeUpdateMode=player.canSetTimeUpdateMode;sample.canSetDirectAudioVolume=player.canSetDirectAudioVolume;sample.dspTime=AudioSettings.dspTime;sample.voicePeak=voicePeak;sample.musicPeak=musicPeak;sample.listenerPeak=listenerPeak;var voice=lobby.CurrentVideo.Voice;if(voice!=null){sample.voiceVolume=voice.volume;sample.voiceMuted=voice.mute;sample.voiceSourcePlaying=voice.isPlaying;}}
    else sample.error="Stage/player changed before expected capture";
    // The former extra .25-second wait could cross the end of the short FDG movie.
    yield return new WaitForEndOfFrame();sample.stageMatched&=LobbyStageMatches(stage,player);
    if(sample.stageMatched&&lobby.CurrentVideo.Texture!=null){var texture=lobby.CurrentVideo.Texture;sample.width=texture.width;sample.height=texture.height;sample.nonBlack=MovieHasPixels(texture);ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-lobby-"+stage+".png"));}
    lobbySamples.Add(sample);Debug.Log("LOBBY_VIDEO_SAMPLE "+JsonUtility.ToJson(sample));WriteLobbyProgress();yield return null;
   }finally{if(player!=null)player.frameReady-=observe;}
  }
  void BeginLobbyWorldObservation(){
   StopLobbyWorldObservation();lobbyWorldPlayer=lobby.CurrentVideo.Player;lobbyReceipt.worldPlayback=new LobbyWorldPlayback();lobbyWorldStarted=lobbyWorldChanged=lobbyWorldLastFrameWall=lobbyWorldVideoTime=-1;
   var target=lobbyWorldPlayer;
   lobbyWorldFrame=(p,f)=>{
    if(!ReferenceEquals(p,target))return;var w=lobbyReceipt.worldPlayback;double now=LobbyNow;
    if(lobbyWorldStarted<0){lobbyWorldStarted=lobbyWorldChanged=lobbyWorldLastFrameWall=now;w.firstVideoTime=p.time;}
    else{w.frameChanges++;w.maxFrameGapSeconds=Math.Max(w.maxFrameGapSeconds,now-lobbyWorldLastFrameWall);lobbyWorldLastFrameWall=now;}
    if(Math.Abs(p.time-lobbyWorldVideoTime)>.000001){lobbyWorldChanged=now;lobbyWorldVideoTime=p.time;}
    w.duration=p.length;w.lastVideoTime=p.time;w.wallElapsed=now-lobbyWorldStarted;w.minimumSpeed=Math.Min(w.minimumSpeed,p.playbackSpeed);w.maximumSpeed=Math.Max(w.maximumSpeed,p.playbackSpeed);
   };
   lobbyWorldEnd=p=>{if(!ReferenceEquals(p,target)||p.isLooping)return;var w=lobbyReceipt.worldPlayback;w.endedEvent=true;w.lastVideoTime=p.time;w.duration=p.length;if(lobbyWorldStarted>=0)w.wallElapsed=LobbyNow-lobbyWorldStarted;Debug.Log("LOBBY_WORLD_ENDED "+JsonUtility.ToJson(w));WriteLobbyProgress();};
   if(target!=null){target.frameReady+=lobbyWorldFrame;target.loopPointReached+=lobbyWorldEnd;if(target.isPrepared&&target.frame>=0)lobbyWorldFrame(target,target.frame);}
  }
  void StopLobbyWorldObservation(){if(lobbyWorldPlayer!=null){lobbyWorldPlayer.frameReady-=lobbyWorldFrame;lobbyWorldPlayer.loopPointReached-=lobbyWorldEnd;}lobbyWorldPlayer=null;lobbyWorldFrame=null;lobbyWorldEnd=null;}
  void LobbyFixtureLog(string message,string stack,LogType type){if(lobbyReceipt!=null&&message.IndexOf("AudioSampleProvider",StringComparison.OrdinalIgnoreCase)>=0&&(message.IndexOf("overflow",StringComparison.OrdinalIgnoreCase)>=0||message.IndexOf("underflow",StringComparison.OrdinalIgnoreCase)>=0||message.IndexOf("discard",StringComparison.OrdinalIgnoreCase)>=0))lobbyReceipt.audioBufferWarnings++;}
  void StopLobbyFixtureObservers(){StopLobbyWorldObservation();if(lobbyLogSubscribed){Application.logMessageReceived-=LobbyFixtureLog;lobbyLogSubscribed=false;}}
  void OnDisable(){StopLobbyFixtureObservers();}
  void WriteLobbyProgress(){if(lobbyReceipt==null||string.IsNullOrEmpty(lobbyFixtureOutput))return;lobbyReceipt.samples=lobbySamples.ToArray();File.WriteAllText(Path.Combine(lobbyFixtureOutput,"lobby-progress.json"),JsonUtility.ToJson(lobbyReceipt,true));lobbyProgressAt=LobbyNow;}
  void ProbeLobbyAudio(){
   if(lobbyReceipt==null)return;float voiceValue=0,musicValue=0;var voice=lobby.CurrentVideo?.Voice;if(voice!=null){voiceValue=AudioPeak(voice);lobbyReceipt.voicePeak=Mathf.Max(lobbyReceipt.voicePeak,voiceValue);}
   var music=lobby.GetComponent<AudioSource>();if(music!=null){musicValue=AudioPeak(music);lobbyReceipt.musicPeak=Mathf.Max(lobbyReceipt.musicPeak,musicValue);}
   var w=lobbyReceipt.worldPlayback;if(w!=null&&lobbyWorldStarted>=0&&!w.endedEvent&&lobby.Flow.Page==LobbyPage.WorldIntro){w.audioProbeCount++;w.wallElapsed=LobbyNow-lobbyWorldStarted;w.maxProgressStallSeconds=Math.Max(w.maxProgressStallSeconds,LobbyNow-lobbyWorldChanged);w.voicePeak=Mathf.Max(w.voicePeak,voiceValue);w.musicPeak=Mathf.Max(w.musicPeak,musicValue);w.listenerPeak=Mathf.Max(w.listenerPeak,LobbyListenerPeak());}
   if(LobbyNow-lobbyProgressAt>=5){Debug.Log("LOBBY_PROGRESS "+lobby.StageName+" time="+lobby.CurrentVideo.Time+" frame="+lobby.CurrentVideo.Frame+" dsp="+AudioSettings.dspTime+" voicePeak="+lobbyReceipt.voicePeak+" musicPeak="+lobbyReceipt.musicPeak);WriteLobbyProgress();}
  }
  static readonly float[] lobbyAudioBuffer=new float[256];
  static float LobbyListenerPeak(){Array.Clear(lobbyAudioBuffer,0,lobbyAudioBuffer.Length);AudioListener.GetOutputData(lobbyAudioBuffer,0);float peak=0;foreach(float x in lobbyAudioBuffer)peak=Mathf.Max(peak,Mathf.Abs(x));return peak;}
  // VideoPlayer owns the movie stream; AudioSource.clip/isPlaying is not its transport state.
  static float AudioPeak(AudioSource source){Array.Clear(lobbyAudioBuffer,0,lobbyAudioBuffer.Length);source.GetOutputData(lobbyAudioBuffer,0);float peak=0;foreach(float x in lobbyAudioBuffer)peak=Mathf.Max(peak,Mathf.Abs(x));return peak;}
  static bool MovieHasPixels(Texture texture){
   var previous=RenderTexture.active;var small=RenderTexture.GetTemporary(32,18,0,RenderTextureFormat.ARGB32);var pixels=new Texture2D(32,18,TextureFormat.RGB24,false);
   try{Graphics.Blit(texture,small);RenderTexture.active=small;pixels.ReadPixels(new Rect(0,0,32,18),0,0);pixels.Apply();int visible=0;foreach(var c in pixels.GetPixels())if(Mathf.Max(c.r,c.g,c.b)>.035f)visible++;return visible>4;}
   finally{RenderTexture.active=previous;RenderTexture.ReleaseTemporary(small);Destroy(pixels);}
  }
 }
}
