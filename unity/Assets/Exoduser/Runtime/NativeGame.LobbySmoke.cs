using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class LobbyMovieSample {public string stage,error;public bool prepared,frameAdvanced,nonBlack;public long firstFrame,lastFrame;public double time;public int width,height;}
  [Serializable] sealed class LobbySmokeReceipt {public string scope;public LobbyMovieSample[] samples;public bool worldCompletedNaturally,captionVisible,originalArtDrawn,replayWorked,holdSkipWorked,simulationPaused,explicitTestEntry;public float voicePeak,musicPeak;}
  LobbySmokeReceipt lobbyReceipt;readonly List<LobbyMovieSample> lobbySamples=new List<LobbyMovieSample>();
  IEnumerator LobbySmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   lobbyReceipt=new LobbySmokeReceipt{scope="actual_native_player_frontend_fixture"};int tick=Simulation.TickCount;
   yield return CaptureLobbyMovie("fdg",.7,output);
   float limit=Time.realtimeSinceStartup+20;while(lobby.StageName=="FDG"&&Time.realtimeSinceStartup<limit)yield return null;
   yield return CaptureLobbyMovie("splash",1.5,output);lobbyReceipt.originalArtDrawn=lobby.OriginalArtDrawn;
   lobby.AdvanceSplash();yield return null;
   limit=Time.realtimeSinceStartup+15;while((!lobby.CurrentVideo.Prepared||lobby.CurrentVideo.Frame<0)&&Time.realtimeSinceStartup<limit)yield return null;
   yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-lobby-enter.png"));yield return null;
   lobby.StartGate();yield return CaptureLobbyMovie("gate",.8,output);
   limit=Time.realtimeSinceStartup+20;while(lobby.Flow.Page==LobbyPage.Gate&&Time.realtimeSinceStartup<limit){ProbeLobbyAudio();yield return null;}
   yield return CaptureLobbyMovie("world",6,output);
   lobbyReceipt.captionVisible=lobby.CaptionVisible;limit=Time.realtimeSinceStartup+145;
   while(lobby.Flow.Page==LobbyPage.WorldIntro&&Time.realtimeSinceStartup<limit){ProbeLobbyAudio();lobbyReceipt.captionVisible|=lobby.CaptionVisible;yield return null;}
   lobbyReceipt.worldCompletedNaturally=lobby.Flow.Page==LobbyPage.Lobby&&lobby.WorldEndedNaturally;
   yield return CaptureLobbyMovie("lobby",.6,output);lobbyReceipt.originalArtDrawn&=lobby.OriginalArtDrawn;
   lobbyReceipt.simulationPaused=Simulation.TickCount==tick;
   lobby.ReplayIntro();yield return null;lobbyReceipt.replayWorked=lobby.StageName=="Title";
   // Same model path used by the normal held ESC/SPACE handler; no OS input is claimed.
   lobby.Flow.HoldSkip(true,5);yield return null;yield return null;lobbyReceipt.holdSkipWorked=lobby.Flow.Page==LobbyPage.Lobby;
   lobby.SelectPreview();lobbyReceipt.explicitTestEntry=lobby.EnterNativeTest();yield return null;
   lobbyReceipt.explicitTestEntry&=!lobby.IsBlocking&&Running;
   lobby.ShowLobby();Running=false;yield return new WaitForSecondsRealtime(.4f);
   lobbyReceipt.samples=lobbySamples.ToArray();File.WriteAllText(Path.Combine(output,"lobby-smoke.json"),JsonUtility.ToJson(lobbyReceipt,true));
   // Leave the actual tested lobby open. Normal focus handling resumes after this fixture.
   lobbySmoke=false;
  }
  IEnumerator CaptureLobbyMovie(string stage,double minimumTime,string output){
   float limit=Time.realtimeSinceStartup+22;
   while((!lobby.CurrentVideo.Prepared||lobby.CurrentVideo.Frame<1||lobby.CurrentVideo.Time<minimumTime)&&Time.realtimeSinceStartup<limit){ProbeLobbyAudio();yield return null;}
   var movie=lobby.CurrentVideo;long first=movie.Frame;
   float end=Time.realtimeSinceStartup+.25f;while(Time.realtimeSinceStartup<end){ProbeLobbyAudio();yield return null;}
   var sample=new LobbyMovieSample{stage=stage,prepared=movie.Prepared,firstFrame=first,lastFrame=movie.Frame,frameAdvanced=movie.Frame>first,time=movie.Time,error=movie.Error};
   if(movie.Texture!=null){sample.width=movie.Texture.width;sample.height=movie.Texture.height;sample.nonBlack=MovieHasPixels(movie.Texture);}
   lobbySamples.Add(sample);Debug.Log("LOBBY_VIDEO_SAMPLE "+JsonUtility.ToJson(sample));yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-lobby-"+stage+".png"));yield return null;
  }
  void ProbeLobbyAudio(){
   if(lobbyReceipt==null)return;var voice=lobby.CurrentVideo?.Voice;if(voice!=null)lobbyReceipt.voicePeak=Mathf.Max(lobbyReceipt.voicePeak,AudioPeak(voice));
   var music=lobby.GetComponent<AudioSource>();if(music!=null)lobbyReceipt.musicPeak=Mathf.Max(lobbyReceipt.musicPeak,AudioPeak(music));
  }
  static readonly float[] lobbyAudioBuffer=new float[256];
  // VideoPlayer owns audio transport; AudioSource's clip/isPlaying state is not
  // a valid predicate for its movie stream. Inspect the real output buffer.
  static float AudioPeak(AudioSource source){source.GetOutputData(lobbyAudioBuffer,0);float peak=0;foreach(float x in lobbyAudioBuffer)peak=Mathf.Max(peak,Mathf.Abs(x));return peak;}
  static bool MovieHasPixels(Texture texture){
   var previous=RenderTexture.active;var small=RenderTexture.GetTemporary(32,18,0,RenderTextureFormat.ARGB32);var pixels=new Texture2D(32,18,TextureFormat.RGB24,false);
   try{Graphics.Blit(texture,small);RenderTexture.active=small;pixels.ReadPixels(new Rect(0,0,32,18),0,0);pixels.Apply();int visible=0;foreach(var c in pixels.GetPixels())if(Mathf.Max(c.r,c.g,c.b)>.035f)visible++;return visible>4;}
   finally{RenderTexture.active=previous;RenderTexture.ReleaseTemporary(small);Destroy(pixels);}
  }
 }
}
