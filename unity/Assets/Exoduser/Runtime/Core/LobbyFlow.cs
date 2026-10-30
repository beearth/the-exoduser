using System;
namespace Exoduser.UnityPort.Core
{
 public enum LobbyPage{Title,Gate,WorldIntro,Lobby,Playing}
 // Session-only frontend. Does not inspect, create, overwrite or mark user saves.
 public sealed class LobbyFlow
 {
  public static readonly double[] WorldCuts={0,4.041667,12.75,17.291667,27.791667,46.291667,56.291667,69.291667,76.291667,78.041667,80.291667,84.791667,87.791667,90.791667,95.791667,102.791667,109.291667};
  public LobbyPage Page{get;private set;}=LobbyPage.Title;
  public bool PreviewCharacter{get;private set;}
  public double SkipProgress{get;private set;}
  public double VoiceGain{get;private set;}=1;
  public double MusicGain{get;private set;}=.22;
  public void EnterGate(){if(Page==LobbyPage.Title){Page=LobbyPage.WorldIntro;SkipProgress=0;}}
  public void TickGate(double elapsed,double time,bool error,double duration){if(Page!=LobbyPage.Gate)return;if(error||(elapsed>3&&time<.2)||elapsed>15||(duration>0&&time>=duration-.05))Page=LobbyPage.WorldIntro;}
  public void FinishIntro(){if(Page!=LobbyPage.Playing){Page=LobbyPage.Lobby;SkipProgress=0;}}
  public void HoldSkip(bool holding,double delta){if(Page==LobbyPage.Lobby||Page==LobbyPage.Playing){SkipProgress=0;return;}SkipProgress=holding?Math.Min(1,SkipProgress+Math.Max(0,delta)/5):0;if(SkipProgress>=1)FinishIntro();}
  public void Replay(){Page=LobbyPage.Title;SkipProgress=0;}
  public void ShowLobby(){Page=LobbyPage.Lobby;SkipProgress=0;}
  public void SelectPreview(){if(Page==LobbyPage.Lobby)PreviewCharacter=true;}
  public bool EnterTest(){if(Page!=LobbyPage.Lobby||!PreviewCharacter)return false;Page=LobbyPage.Playing;return true;}
  public double NextCut(double time){foreach(double cut in WorldCuts)if(cut>time+.05)return cut;return -1;}
  public void SetMix(double voice,double music){if(!double.IsNaN(voice)&&!double.IsInfinity(voice))VoiceGain=Math.Max(0,Math.Min(1,voice));if(!double.IsNaN(music)&&!double.IsInfinity(music))MusicGain=Math.Max(0,Math.Min(1,music));}
 }
 [Serializable] public sealed class LobbySubtitleData{public string schema,worldVideo;public double holdSeconds;public double[] cuts;public LobbyCaptionLanguage[] captions;}
 [Serializable] public sealed class LobbyCaptionLanguage{public string code;public LobbyCaptionCue[] cues;}
 [Serializable] public sealed class LobbyCaptionCue{public double start,end;public string text;}
 // Source timeupdate refreshes the twelve-second watchdog even after preparation.
 // elapsed is the frontend's monotonic active clock, held while unfocused.
 public sealed class FdgPlaybackWatchdog
 {
  double lastTime=-1,lastProgress,fallbackAt=-1;
  public bool FallingBack{get{return fallbackAt>=0;}}
  public void Reset(){lastTime=-1;lastProgress=0;fallbackAt=-1;}
  public bool Tick(double elapsed,double playbackTime,bool error,bool ended)
  {
   if(ended||playbackTime>=3.2)return true;
   if(!FallingBack)
   {
    if(!double.IsNaN(playbackTime)&&!double.IsInfinity(playbackTime)&&Math.Abs(playbackTime-lastTime)>.000001){lastTime=playbackTime;lastProgress=elapsed;}
    if(error||elapsed-lastProgress>=12)fallbackAt=elapsed;
   }
   return FallingBack&&elapsed-fallbackAt>=3.2;
  }
 }
}
