using System;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
namespace Exoduser.UnityPort
{
 // One native decoder; callbacks are detached before a new request is prepared.
 public sealed class NativeLobbyVideo:IDisposable
 {
  readonly GameObject owner;NativeIntroGateAudioSync introAudioSync;
  public bool UsesIntroAudioFallback{get;private set;}
  public const double IntroAudioMediaOffset=1105d/44100d;
  readonly bool diagnosticGameClock=HasArgument("--unity-video-clock-game"),diagnosticNoDrop=HasArgument("--unity-video-no-drop"),diagnosticAllowDrop=HasArgument("--unity-video-allow-drop"),diagnosticDirect=HasArgument("--unity-video-direct");
  VideoPlayer player;AudioSource voice;RenderTexture texture;bool freezeFirst,playbackAllowed=true,wantsPlayback,directMuted;float directGain=1;int generation;
  static bool HasArgument(string flag){return Array.IndexOf(Environment.GetCommandLineArgs(),flag)>=0;}
  public RenderTexture Texture{get{return texture;}}
  public VideoPlayer Player{get{return player;}}
  public AudioSource Voice{get{return voice;}}
  public string Error{get;private set;}="";
  public bool Ended{get;private set;}
  public bool Prepared{get{return player!=null&&player.isPrepared;}}
  public double Time{get{return Prepared?player.time:0;}}
  public double Duration{get{return Prepared?player.length:0;}}
  public long Frame{get{return player==null?-1:player.frame;}}
  // DBT-8 measurement: how often a movie is requested / prepared / reported broken, and `--unity-lobby-hide-movie <file>` points one file at a name that does not exist.
  public static int OpenCalls,PrepareCalls,ErrorEvents;
  public static string HiddenMovie;
  // DBT-8: a movie file that fails is requested at most MaxRequests times in a row; after that Open() answers with an error at once and never touches the file again (until RetryNow()).
  public const int MaxRequests=3;
  static readonly System.Collections.Generic.Dictionary<string,int> failures=new System.Collections.Generic.Dictionary<string,int>();
  string currentFile="";bool gaveUpLogged;
  static NativeLobbyVideo(){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"--unity-lobby-hide-movie");if(i>=0&&i+1<a.Length)HiddenMovie=a[i+1];}
  public static void RetryNow(){failures.Clear();}
  public bool CanRetry{get{int n;return !failures.TryGetValue(currentFile,out n)||n<MaxRequests;}}
  void NoteFailure(){int n;failures.TryGetValue(currentFile,out n);failures[currentFile]=n+1;if(n+1>=MaxRequests&&!gaveUpLogged){gaveUpLogged=true;Debug.Log("LOBBY_VIDEO_GIVE_UP "+currentFile+" after "+(n+1)+" failed requests");}}
  public NativeLobbyVideo(Transform parent){owner=new GameObject("Lobby native movie");owner.transform.SetParent(parent,false);live.Add(this);HookQuit();}
  // DBT-5: closing the game while a movie is decoding (Media Foundation) ended in 0xC000041D inside the window callback. The first quit request closes every decoder
  // (events off, Stop, targetTexture null, RenderTexture released, component destroyed), is refused once, and the quit is repeated a few frames later so the
  // deferred destroys have run while the player loop is still alive.
  static readonly System.Collections.Generic.List<NativeLobbyVideo> live=new System.Collections.Generic.List<NativeLobbyVideo>();
  static bool quitHooked,quitCleaned;
  public static readonly bool DiagnosticSkipQuitCleanup=HasArgument("--unity-skip-video-quit-cleanup");
  static void HookQuit(){if(quitHooked)return;quitHooked=true;Application.wantsToQuit+=OnWantsToQuit;}
  static bool OnWantsToQuit()
  {
   if(DiagnosticSkipQuitCleanup||quitCleaned)return true;
   quitCleaned=true;bool any=false;
   foreach(var v in live.ToArray())if(v.player!=null||v.texture!=null){any=true;v.Close();}
   if(!any)return true;
   var helper=new GameObject("Video quit helper");UnityEngine.Object.DontDestroyOnLoad(helper);helper.AddComponent<NativeVideoQuitHelper>();
   return false;
  }
  public void Open(string filename,bool loop,bool muted,bool freeze)
  {
   OpenCalls++;if(OpenCalls<=12)Debug.Log("LOBBY_VIDEO_OPEN #"+OpenCalls+" "+filename+(HiddenMovie==filename?" (hidden)":""));
   Close();Error="";Ended=false;currentFile=filename;gaveUpLogged=false;
   int failed;if(failures.TryGetValue(filename,out failed)&&failed>=MaxRequests){Error="Video unavailable: "+filename;return;}
   freezeFirst=freeze;wantsPlayback=true;int token=generation;
   player=owner.AddComponent<VideoPlayer>();voice=owner.AddComponent<AudioSource>();voice.playOnAwake=false;voice.spatialBlend=0;
   player.playOnAwake=false;player.source=VideoSource.Url;player.url=Path.Combine(Application.streamingAssetsPath,"Lobby",HiddenMovie==filename?"hidden-"+filename:filename);player.isLooping=loop;player.waitForFirstFrame=true;player.skipOnDrop=diagnosticAllowDrop&&!diagnosticNoDrop;player.renderMode=VideoRenderMode.RenderTexture;
   // Opt-in A/B probes only: the normal clock and AudioSource route stay unchanged.
   if(diagnosticGameClock)player.timeUpdateMode=VideoTimeUpdateMode.GameTime;
   player.audioOutputMode=diagnosticDirect?VideoAudioOutputMode.Direct:VideoAudioOutputMode.AudioSource;player.controlledAudioTrackCount=1;player.EnableAudioTrack(0,true);
   if(!diagnosticDirect)player.SetTargetAudioSource(0,voice);
   voice.mute=muted;directMuted=muted;directGain=1;
   player.sendFrameReadyEvents=true;
   player.prepareCompleted+=p=>{if(token!=generation)return;int w=(int)p.width,h=(int)p.height;if(w<=0||h<=0){Error="Invalid video dimensions";NoteFailure();return;}failures.Remove(filename);float scale=Mathf.Min(1,4096f/Mathf.Max(w,h));texture=new RenderTexture(Mathf.Max(1,(int)(w*scale)),Mathf.Max(1,(int)(h*scale)),0,RenderTextureFormat.ARGB32);texture.Create();p.targetTexture=texture;ConfigureIntroAudio(filename);ApplyDirectMix();TryStartPlayback();};
   player.frameReady+=OnFrame;player.loopPointReached+=OnEnd;player.errorReceived+=OnError;
   PrepareCalls++;try{player.Prepare();}catch(Exception e){Error=e.Message;NoteFailure();}
  }
  void OnFrame(VideoPlayer p,long frame){if(p!=player)return;if(freezeFirst){freezeFirst=false;wantsPlayback=false;p.Pause();PauseIntroAudio();}}
  void OnEnd(VideoPlayer p){if(p==player&&!p.isLooping){Ended=true;wantsPlayback=false;PauseIntroAudio();}}
  // One failed request counts once: the decoder keeps raising errorReceived for the same broken url (90 events in 10 s were measured), so repeats are only counted, not handled.
  void OnError(VideoPlayer p,string message){if(p!=player)return;ErrorEvents++;if(Error.Length>0)return;if(ErrorEvents<=5)Debug.Log("LOBBY_VIDEO_ERROR #"+ErrorEvents+" "+message);Error=message;NoteFailure();wantsPlayback=false;p.Pause();PauseIntroAudio();}
  void ConfigureIntroAudio(string filename)
  {
   // The original MP3-in-MP4 track is absent in macOS native decoding. Other movies/routes stay native.
   if(filename!="intro.mp4"||player.audioTrackCount!=0)return;
   var clip=Resources.Load<AudioClip>("Audio/Lobby/intro_gate_original");
   if(clip==null){Error="Missing original intro audio fallback";return;}
   UsesIntroAudioFallback=true;player.audioOutputMode=VideoAudioOutputMode.None;voice.clip=clip;voice.loop=player.isLooping;
   introAudioSync=owner.AddComponent<NativeIntroGateAudioSync>();introAudioSync.Poll=SyncIntroAudio;
  }
  void PauseIntroAudio(){if(UsesIntroAudioFallback&&voice!=null)voice.Pause();}
  void SyncIntroAudio()
  {
   if(!UsesIntroAudioFallback||voice==null||player==null)return;
   if(!playbackAllowed||!wantsPlayback||freezeFirst||!player.isPlaying||Error.Length>0||Ended){PauseIntroAudio();return;}
   if(player.time+IntroAudioMediaOffset>=voice.clip.length){PauseIntroAudio();return;}
   if(!voice.isPlaying){voice.time=(float)Math.Max(0,Math.Min(voice.clip.length-.001,player.time+IntroAudioMediaOffset));voice.Play();}
  }
  // Permission polling and explicit Play cannot repeatedly restart an active decoder.
  void TryStartPlayback(){if(playbackAllowed&&wantsPlayback&&Prepared&&Error.Length==0&&!player.isPlaying)player.Play();}
  public void Play(){if(Error.Length>0)return;freezeFirst=false;wantsPlayback=true;TryStartPlayback();}
  public void Pause(){wantsPlayback=false;if(player!=null)player.Pause();PauseIntroAudio();}
  public void SetPlaybackAllowed(bool allowed){playbackAllowed=allowed;if(player==null)return;if(!allowed){if(player.isPlaying)player.Pause();PauseIntroAudio();}else TryStartPlayback();}
  public void Toggle(){if(!Prepared)return;if(player.isPlaying)Pause();else Play();}
  public void Seek(double time){if(Prepared){freezeFirst=false;double target=Math.Max(0,Math.Min(Duration,time));player.time=target;if(UsesIntroAudioFallback&&voice!=null)voice.time=(float)Math.Max(0,Math.Min(voice.clip.length-.001,target+IntroAudioMediaOffset));}}
  void ApplyDirectMix(){if(diagnosticDirect&&Prepared&&!UsesIntroAudioFallback){player.SetDirectAudioMute(0,directMuted);if(player.canSetDirectAudioVolume)player.SetDirectAudioVolume(0,directGain);}}
  public void Volume(float value){directGain=Mathf.Clamp01(value);if(voice!=null)voice.volume=directGain;ApplyDirectMix();}
  public void Mute(bool muted){directMuted=muted;if(voice!=null)voice.mute=muted;ApplyDirectMix();}
  public void Close(){generation++;wantsPlayback=false;if(introAudioSync!=null){introAudioSync.Poll=null;UnityEngine.Object.Destroy(introAudioSync);introAudioSync=null;}UsesIntroAudioFallback=false;if(player!=null){player.Stop();player.targetTexture=null;player.frameReady-=OnFrame;player.loopPointReached-=OnEnd;player.errorReceived-=OnError;UnityEngine.Object.Destroy(player);player=null;}if(voice!=null){voice.Stop();UnityEngine.Object.Destroy(voice);voice=null;}if(texture!=null){texture.Release();UnityEngine.Object.Destroy(texture);texture=null;}}
  public void Dispose(){live.Remove(this);Close();UnityEngine.Object.Destroy(owner);}
 }
 // Runtime-only polling for the one unsupported intro soundtrack; detached synchronously on Close.
 sealed class NativeIntroGateAudioSync:MonoBehaviour{public Action Poll;void Update(){Poll?.Invoke();}}
 // Repeats the quit a few frames after the movie decoders were closed (see NativeLobbyVideo.OnWantsToQuit).
 sealed class NativeVideoQuitHelper:MonoBehaviour{int frames=3;void Update(){if(--frames>0)return;Destroy(gameObject);Application.Quit();}}
}
