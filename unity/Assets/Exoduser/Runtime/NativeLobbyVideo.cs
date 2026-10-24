using System;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
namespace Exoduser.UnityPort
{
 // One native decoder; callbacks are detached before a new request is prepared.
 public sealed class NativeLobbyVideo:IDisposable
 {
  readonly GameObject owner;
  readonly bool diagnosticGameClock=HasArgument("--unity-video-clock-game"),diagnosticNoDrop=HasArgument("--unity-video-no-drop"),diagnosticDirect=HasArgument("--unity-video-direct");
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
  public NativeLobbyVideo(Transform parent){owner=new GameObject("Lobby native movie");owner.transform.SetParent(parent,false);}
  public void Open(string filename,bool loop,bool muted,bool freeze)
  {
   Close();Error="";Ended=false;freezeFirst=freeze;wantsPlayback=true;int token=generation;
   player=owner.AddComponent<VideoPlayer>();voice=owner.AddComponent<AudioSource>();voice.playOnAwake=false;voice.spatialBlend=0;
   player.playOnAwake=false;player.source=VideoSource.Url;player.url=Path.Combine(Application.streamingAssetsPath,"Lobby",filename);player.isLooping=loop;player.waitForFirstFrame=true;player.skipOnDrop=!diagnosticNoDrop;player.renderMode=VideoRenderMode.RenderTexture;
   // Opt-in A/B probes only: the normal clock and AudioSource route stay unchanged.
   if(diagnosticGameClock)player.timeUpdateMode=VideoTimeUpdateMode.GameTime;
   player.audioOutputMode=diagnosticDirect?VideoAudioOutputMode.Direct:VideoAudioOutputMode.AudioSource;player.controlledAudioTrackCount=1;player.EnableAudioTrack(0,true);
   if(!diagnosticDirect)player.SetTargetAudioSource(0,voice);
   voice.mute=muted;directMuted=muted;directGain=1;
   player.sendFrameReadyEvents=true;
   player.prepareCompleted+=p=>{if(token!=generation)return;int w=(int)p.width,h=(int)p.height;if(w<=0||h<=0){Error="Invalid video dimensions";return;}float scale=Mathf.Min(1,4096f/Mathf.Max(w,h));texture=new RenderTexture(Mathf.Max(1,(int)(w*scale)),Mathf.Max(1,(int)(h*scale)),0,RenderTextureFormat.ARGB32);texture.Create();p.targetTexture=texture;ApplyDirectMix();TryStartPlayback();};
   player.frameReady+=OnFrame;player.loopPointReached+=OnEnd;player.errorReceived+=OnError;
   try{player.Prepare();}catch(Exception e){Error=e.Message;}
  }
  void OnFrame(VideoPlayer p,long frame){if(p!=player)return;if(freezeFirst){freezeFirst=false;wantsPlayback=false;p.Pause();}}
  void OnEnd(VideoPlayer p){if(p==player&&!p.isLooping){Ended=true;wantsPlayback=false;}}
  void OnError(VideoPlayer p,string message){if(p==player){Error=message;wantsPlayback=false;p.Pause();}}
  // Permission polling and explicit Play cannot repeatedly restart an active decoder.
  void TryStartPlayback(){if(playbackAllowed&&wantsPlayback&&Prepared&&Error.Length==0&&!player.isPlaying)player.Play();}
  public void Play(){if(Error.Length>0)return;freezeFirst=false;wantsPlayback=true;TryStartPlayback();}
  public void Pause(){wantsPlayback=false;if(player!=null)player.Pause();}
  public void SetPlaybackAllowed(bool allowed){playbackAllowed=allowed;if(player==null)return;if(!allowed){if(player.isPlaying)player.Pause();}else TryStartPlayback();}
  public void Toggle(){if(!Prepared)return;if(player.isPlaying)Pause();else Play();}
  public void Seek(double time){if(Prepared){freezeFirst=false;player.time=Math.Max(0,Math.Min(Duration,time));}}
  void ApplyDirectMix(){if(diagnosticDirect&&Prepared){player.SetDirectAudioMute(0,directMuted);if(player.canSetDirectAudioVolume)player.SetDirectAudioVolume(0,directGain);}}
  public void Volume(float value){directGain=Mathf.Clamp01(value);if(voice!=null)voice.volume=directGain;ApplyDirectMix();}
  public void Mute(bool muted){directMuted=muted;if(voice!=null)voice.mute=muted;ApplyDirectMix();}
  public void Close(){generation++;wantsPlayback=false;if(player!=null){player.Stop();player.targetTexture=null;player.frameReady-=OnFrame;player.loopPointReached-=OnEnd;player.errorReceived-=OnError;UnityEngine.Object.Destroy(player);player=null;}if(voice!=null){voice.Stop();UnityEngine.Object.Destroy(voice);voice=null;}if(texture!=null){texture.Release();UnityEngine.Object.Destroy(texture);texture=null;}}
  public void Dispose(){Close();UnityEngine.Object.Destroy(owner);}
 }
}
