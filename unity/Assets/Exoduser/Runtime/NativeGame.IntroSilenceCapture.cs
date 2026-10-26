using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  const string IntroSilenceFlag="--unity-intro-silence-smoke";
  [Serializable] sealed class IntroAudioProbe {public bool exists,mute,isPlaying,wasPlaying;public string clip;public float volume,peak,rms;}
  [Serializable] sealed class IntroSilenceSnapshot
  {
   public string label,stage,url,error,audioOutputMode,expectedVoiceMute;
   public bool prepared,videoPlaying,ended,contractEvaluated,contractMatches,muteMatches,silentOutputMatches,soundOutputObserved;
   public long firstFrame,lastFrame;public double firstTime,lastTime;public int audioTrackCount,controlledAudioTrackCount;
   public float listenerPeak,listenerRms;public IntroAudioProbe voice,music,startupAudio;
  }
  [Serializable] sealed class IntroSilenceReceipt
  {
   public string scope,phase,product,identifier,persistentDataPath,output;
   public bool harnessPassed,contractPassed,finalContractPending;public int failures,bgmPercent;public float bgmRelativeGain;
   public string[] checks,observedDifferences;public IntroSilenceSnapshot[] snapshots;
  }
  readonly float[] introSilenceSamples=new float[1024];
  T IntroLobbyField<T>(string name) where T:class {return typeof(NativeLobby).GetField(name,BindingFlags.Instance|BindingFlags.NonPublic).GetValue(lobby) as T;}
  IntroAudioProbe IntroAudio(AudioSource source)
  {
   var p=new IntroAudioProbe{exists=source!=null};if(source==null)return p;
   p.mute=source.mute;p.isPlaying=source.isPlaying;p.wasPlaying=source.isPlaying;p.volume=source.volume;p.clip=source.clip==null?"":source.clip.name;
   source.GetOutputData(introSilenceSamples,0);float sum=0;foreach(float x in introSilenceSamples){p.peak=Mathf.Max(p.peak,Mathf.Abs(x));sum+=x*x;}p.rms=Mathf.Sqrt(sum/introSilenceSamples.Length);return p;
  }
  IEnumerator IntroObserve(List<IntroSilenceSnapshot> results,string label,NativeLobbyVideo movie,string expectedMute,float seconds)
  {
   float deadline=Time.realtimeSinceStartup+12;while(movie!=null&&!movie.Prepared&&movie.Error.Length==0&&Time.realtimeSinceStartup<deadline)yield return null;
   // Drain old audio buffers before measuring a new stage; source peaks may precede mute.
   if(label!="gate-voice-and-bgm")yield return new WaitForSecondsRealtime(.15f);
   var p=movie==null?null:movie.Player;var s=new IntroSilenceSnapshot{label=label,stage=lobby.StageName,url=p==null?"":p.url,expectedVoiceMute=expectedMute,firstFrame=movie==null?-1:movie.Frame,firstTime=movie==null?0:movie.Time};
   float until=Time.realtimeSinceStartup+seconds,sum=0;int count=0;
   var voice=new IntroAudioProbe();var music=new IntroAudioProbe();var startup=new IntroAudioProbe();
   while(Time.realtimeSinceStartup<until){
    var v=IntroAudio(movie==null?null:movie.Voice);var m=IntroAudio(IntroLobbyField<AudioSource>("music"));var a=IntroAudio(IntroLobbyField<AudioSource>("startupAudio"));
    v.wasPlaying|=voice.wasPlaying;m.wasPlaying|=music.wasPlaying;a.wasPlaying|=startup.wasPlaying;v.peak=Mathf.Max(voice.peak,v.peak);v.rms=Mathf.Max(voice.rms,v.rms);voice=v;m.peak=Mathf.Max(music.peak,m.peak);m.rms=Mathf.Max(music.rms,m.rms);music=m;a.peak=Mathf.Max(startup.peak,a.peak);a.rms=Mathf.Max(startup.rms,a.rms);startup=a;
    AudioListener.GetOutputData(introSilenceSamples,0);foreach(float x in introSilenceSamples){s.listenerPeak=Mathf.Max(s.listenerPeak,Mathf.Abs(x));sum+=x*x;count++;}yield return null;
   }
   s.voice=voice;s.music=music;s.startupAudio=startup;s.listenerRms=count==0?0:Mathf.Sqrt(sum/count);
   s.lastFrame=movie==null?-1:movie.Frame;s.lastTime=movie==null?0:movie.Time;s.error=movie==null?"Missing decoder":movie.Error;s.prepared=movie!=null&&movie.Prepared;s.ended=movie!=null&&movie.Ended;s.videoPlaying=p!=null&&p.isPlaying;s.audioOutputMode=p==null?"":p.audioOutputMode.ToString();s.audioTrackCount=p==null?-1:p.audioTrackCount;s.controlledAudioTrackCount=p==null?-1:p.controlledAudioTrackCount;
   s.contractEvaluated=expectedMute=="true"||expectedMute=="false";s.muteMatches=!s.contractEvaluated||voice.exists&&voice.mute==(expectedMute=="true");
   bool silentStage=label.StartsWith("fdg-",StringComparison.Ordinal)||label.StartsWith("splash-title-",StringComparison.Ordinal)||label=="title-intro-frozen";
   s.silentOutputMatches=s.audioOutputMode=="AudioSource"&&!music.wasPlaying&&!startup.wasPlaying&&s.listenerPeak<=.0001f&&s.listenerRms<=.00001f;
   bool audibleStage=label=="gate-voice-and-bgm"||label=="world-voice-and-bgm"||label=="lobby-bgm";
   s.soundOutputObserved=music.wasPlaying&&music.peak>.000001f&&s.listenerPeak>.000001f;
   bool entrySoundObserved=label!="gate-voice-and-bgm"||startup.wasPlaying&&startup.peak>.000001f;
   bool voicePlaying=label!="gate-voice-and-bgm"&&label!="world-voice-and-bgm"||voice.wasPlaying;
   s.contractMatches=s.muteMatches&&(!silentStage||s.silentOutputMatches)&&(!audibleStage||s.soundOutputObserved&&entrySoundObserved&&voicePlaying);results.Add(s);
  }
  IEnumerator IntroSilenceCapture()
  {
   string output=Argument("-output"),phase=Argument("-intro-silence-phase");
   if(!SettingsQaIdentity||string.IsNullOrWhiteSpace(output)||!Path.IsPathRooted(output)||(phase!="baseline"&&phase!="final")){Debug.LogError("Intro silence fixture requires distinct Settings QA identity, absolute output and baseline/final phase");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);var snapshots=new List<IntroSilenceSnapshot>();var checks=new List<string>();var differences=new List<string>();int failures=0;
   Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   lobbySmoke=true;lobbyControlsSmoke=true;lobby.AutomatedInput=true;Running=false;menu=true;lobby.SetPlaybackFocus(true);SetBgmPercent(45);
   check(nativeSettingsStore==null&&nativeSettingsDirectory==""&&lobby.CharacterStoreDirectory=="","normal settings and roster stores perform zero IO");
   lobby.Begin();yield return IntroObserve(snapshots,"fdg-playing",lobby.CurrentVideo,"true",.55f);yield return UiCapture(output,"intro-silence-fdg");
   lobby.SetPlaybackFocus(false);yield return new WaitForSecondsRealtime(.15f);yield return IntroObserve(snapshots,"fdg-focus-paused",lobby.CurrentVideo,"true",.25f);
   check(!lobby.CurrentVideo.Player.isPlaying,"FDG focus pause stops decoder");
   lobby.SetPlaybackFocus(true);yield return IntroObserve(snapshots,"fdg-focus-restored",lobby.CurrentVideo,"true",.35f);
   lobby.Begin();yield return IntroObserve(snapshots,"fdg-reentered",lobby.CurrentVideo,"true",.35f);
   lobby.AdvanceSplash();yield return IntroObserve(snapshots,"splash-title-playing",lobby.CurrentVideo,"true",.55f);yield return UiCapture(output,"intro-silence-splash-title");
   // Same SD decoder parameters as the existing fallback; this is an explicit media probe, not an injected failure.
   lobby.CurrentVideo.Open("title_motion_20260929.mp4",true,true,false);yield return IntroObserve(snapshots,"splash-title-sd-direct-probe",lobby.CurrentVideo,"true",.55f);
   lobby.AdvanceSplash();yield return IntroObserve(snapshots,"title-intro-frozen",lobby.CurrentVideo,"true",.4f);yield return UiCapture(output,"intro-silence-title");
   yield return null;lobby.StartGate();yield return IntroObserve(snapshots,"gate-voice-and-bgm",lobby.CurrentVideo,"false",1.2f);yield return UiCapture(output,"intro-silence-gate");
   // Exercise the existing gate watchdog boundary, not a claimed natural movie completion.
   lobby.Flow.TickGate(16,lobby.CurrentVideo.Time,false,lobby.CurrentVideo.Duration);yield return null;yield return null;
   yield return IntroObserve(snapshots,"world-voice-and-bgm",lobby.CurrentVideo,"false",1.2f);yield return UiCapture(output,"intro-silence-world");
   lobby.SetPlaybackFocus(false);yield return new WaitForSecondsRealtime(.15f);yield return IntroObserve(snapshots,"world-focus-paused",lobby.CurrentVideo,"false",.25f);
   lobby.SetPlaybackFocus(true);yield return IntroObserve(snapshots,"world-focus-restored",lobby.CurrentVideo,"false",.35f);
   lobby.ShowLobby();yield return IntroObserve(snapshots,"lobby-bgm",lobby.CurrentVideo,"true",.55f);
   lobby.Begin();yield return IntroObserve(snapshots,"fdg-after-audible-lobby",lobby.CurrentVideo,"true",.55f);
   bool contractPassed=true;foreach(var s in snapshots){check(s.prepared&&s.error=="",s.label+" decoder prepared without error");if(s.contractEvaluated&&!s.contractMatches){contractPassed=false;differences.Add(s.label+": expected Voice.mute="+s.expectedVoiceMute+", actual="+s.voice.mute+", muteMatches="+s.muteMatches+", silentOutputMatches="+s.silentOutputMatches+", soundOutputObserved="+s.soundOutputObserved+", startupWasPlaying="+s.startupAudio.wasPlaying+", startupPeak="+s.startupAudio.peak);}}
   bool pending=false;
   check(snapshots[0].lastTime>snapshots[0].firstTime,"FDG decoded time progresses during observation");
   foreach(var s in snapshots){if(s.label=="gate-voice-and-bgm")check(s.voice.exists&&Mathf.Abs(s.voice.volume-.6f)<.0001f&&s.music.exists&&Mathf.Abs(s.music.volume-.6f*settings.BgmRelativeGain)<.0001f,"Gate voice .6 and BGM .6 retain current session relative gain");if(s.label=="world-voice-and-bgm")check(s.voice.exists&&Mathf.Abs(s.voice.volume-1)<.0001f&&s.music.exists&&Mathf.Abs(s.music.volume-.22f*settings.BgmRelativeGain)<.0001f,"World voice1 and BGM .22 return after intro");if(s.label=="lobby-bgm")check(s.music.exists&&Mathf.Abs(s.music.volume-.65f*settings.BgmRelativeGain)<.0001f,"Lobby BGM .65 retains relative gain");}
   if(phase=="final")check(contractPassed,"all accepted stage mute contracts match");
   File.WriteAllText(Path.Combine(output,"intro-silence-"+phase+".json"),JsonUtility.ToJson(new IntroSilenceReceipt{scope="QA-only short scripted stage/audio observations, not OS focus/input, natural gate completion, media completion or audibility certification. Baseline harness success does not mean mute contract passed. Accepted source stage contract is FDG/SplashTitle/Title muted, Gate/World voice enabled.",phase=phase,product=Application.productName,identifier=Application.identifier,persistentDataPath=Application.persistentDataPath,output=output,bgmPercent=settings.BgmPercent,bgmRelativeGain=settings.BgmRelativeGain,harnessPassed=failures==0,contractPassed=contractPassed,finalContractPending=pending,failures=failures,checks=checks.ToArray(),observedDifferences=differences.ToArray(),snapshots=snapshots.ToArray()},true));
   lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(failures==0?0:2);
  }
 }
}
