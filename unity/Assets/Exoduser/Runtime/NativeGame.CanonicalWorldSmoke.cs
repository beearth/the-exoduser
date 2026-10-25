using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class CanonicalWorldReceipt {
   public string sourceFile,sha256;public long bytes;public bool passed;public List<string> checks=new List<string>();
   public List<string> captions=new List<string>();public double cueOffset;public LobbySmokeReceipt playback;public float invitationOpacity,doorOpacity;
  }
  IEnumerator CanonicalWorldSmoke(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var result=new CanonicalWorldReceipt{cueOffset=NativeLobby.WorldCueOffset};int failed=0;Action<bool,string> check=(ok,name)=>{result.checks.Add((ok?"PASS ":"FAIL ")+name);if(!ok)failed++;};
   lobbyFixtureOutput=output;lobbySamples.Clear();lobbyReceipt=new LobbySmokeReceipt{scope="user-designated-world-movie-natural-playback-and-door-transition"};
   Application.logMessageReceived+=LobbyFixtureLog;lobbyLogSubscribed=true;int tick=Simulation.TickCount;
   try{
    Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
    lobby.AdvanceSplash();yield return null;lobby.AdvanceSplash();yield return null;
    double limit=LobbyNow+20;while((!lobby.CurrentVideo.Prepared||lobby.CurrentVideo.Frame<0)&&LobbyNow<limit)yield return null;
    check(lobby.CurrentVideo.Prepared,"door prepared");yield return UiCapture(output,"door-before-enter");
    lobby.StartGate();yield return new WaitForSecondsRealtime(.35f);result.invitationOpacity=lobby.GateInvitationOpacity;
    check(result.invitationOpacity>0&&result.invitationOpacity<1,"invitation fades instead of disappearing on Enter");yield return UiCapture(output,"door-enter-fading");
    limit=LobbyNow+20;bool fadeCaptured=false;
    while(lobby.Flow.Page==LobbyPage.Gate&&LobbyNow<limit){
     if(!fadeCaptured&&lobby.CurrentVideo.Duration>0&&lobby.CurrentVideo.Time>lobby.CurrentVideo.Duration-.8){fadeCaptured=true;result.doorOpacity=lobby.GateMovieOpacity;yield return UiCapture(output,"door-end-fading");}
     yield return null;
    }
    check(fadeCaptured&&result.doorOpacity>0&&result.doorOpacity<1,"door fades using remaining video time");
    check(lobby.Flow.Page==LobbyPage.WorldIntro&&!lobby.UsesGatePoster,"world preparation never draws closed door poster");
    result.sourceFile=lobby.CurrentVideo.Player.url;result.bytes=new FileInfo(result.sourceFile).Length;
    using(var stream=File.OpenRead(result.sourceFile))using(var sha=SHA256.Create())result.sha256=BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
    check(result.bytes==102204634&&result.sha256=="3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f","exact user-designated bytes in running app");
    BeginLobbyWorldObservation();int capture=0;double[] moments={6,35,93};limit=LobbyNow+160;
    while(lobby.Flow.Page==LobbyPage.WorldIntro&&LobbyNow<limit){
     ProbeLobbyAudio();
     if(capture<moments.Length&&lobby.CurrentVideo.Time>=moments[capture]){result.captions.Add(lobby.CurrentVideo.Time.ToString("F3")+"s: "+lobby.SubtitleText);yield return UiCapture(output,"canonical-world-"+moments[capture]);capture++;}
     yield return null;
    }
    ProbeLobbyAudio();var w=lobbyReceipt.worldPlayback;
    check(lobby.WorldEndedNaturally&&w!=null&&w.endedEvent,"new movie ends naturally into lobby");
    check(w!=null&&Math.Abs(w.wallElapsed-w.duration)<w.duration*.05+2,"natural wall clock matches media duration");
    check(w!=null&&w.maxFrameGapSeconds<.75&&w.maxProgressStallSeconds<.75,"no long frame or playback stalls");
    check(w!=null&&w.minimumSpeed==1&&w.maximumSpeed==1,"normal playback speed");
    check(w!=null&&w.voicePeak>.001&&w.listenerPeak>.001,"movie audio and final output have signal");
    check(lobbyReceipt.audioBufferWarnings==0,"no audio buffer warnings");check(Simulation.TickCount==tick,"frontend keeps gameplay stopped");
    StopLobbyWorldObservation();yield return new WaitForSecondsRealtime(.5f);yield return UiCapture(output,"canonical-lobby-after-natural-end");
    result.playback=lobbyReceipt;result.passed=failed==0;File.WriteAllText(Path.Combine(output,"canonical-world.json"),JsonUtility.ToJson(result,true));
   }finally{StopLobbyFixtureObservers();lobbySmoke=false;lobby.AutomatedInput=false;}
  }
 }
}
