using System;
namespace Exoduser.UnityPort.Core {
 public enum ScreenTransitionPhase {Idle,FadeOut,Preparing,FadeIn}
 // One clock spans fade, preparation and reveal. The host alone owns the actual swap.
 public sealed class ScreenTransitionFlow {
  public ScreenTransitionPhase Phase {get;private set;}
  public double Elapsed {get;private set;}
  public bool Reduced {get;private set;}
  public bool NeedsSwap {get;private set;}
  public bool Failed {get;private set;}
  double phaseElapsed,fadeInFrom=1,mediaInFrom;int preparedFrames;
  public bool Busy {get{return Phase!=ScreenTransitionPhase.Idle;}}
  public bool ShowSigil {get{return Busy&&Elapsed>=.3;}}
  public bool ShowLabel {get{return Busy&&Elapsed>=1;}}
  public double OutSeconds {get{return Reduced?.08:.5;}}
  public double InSeconds {get{return Reduced?.08:.6;}}
  public double Opacity {get{return Phase==ScreenTransitionPhase.FadeOut?Ease(phaseElapsed/OutSeconds):Phase==ScreenTransitionPhase.Preparing?1:Phase==ScreenTransitionPhase.FadeIn?fadeInFrom*(1-Ease(phaseElapsed/InSeconds)):0;}}
  public double MediaGain {get{return Phase==ScreenTransitionPhase.FadeOut?1-Clamp(phaseElapsed/OutSeconds):Phase==ScreenTransitionPhase.Preparing?0:Phase==ScreenTransitionPhase.FadeIn?mediaInFrom+(1-mediaInFrom)*Clamp(phaseElapsed/InSeconds):1;}}
  public double EmberOpacity {get{return Reduced?.3:.12+.63*Pulse();}}
  public double HaloOpacity {get{return Reduced?.3:.25+.15*Pulse();}}
  public bool Begin(bool reduced){if(Busy)return false;Reduced=reduced;fadeInFrom=1;mediaInFrom=0;Elapsed=phaseElapsed=0;preparedFrames=0;NeedsSwap=Failed=false;Phase=ScreenTransitionPhase.FadeOut;return true;}
  public void Tick(double delta,bool ready,bool failed){NeedsSwap=false;if(!Busy)return;if(double.IsNaN(delta)||double.IsInfinity(delta)||delta<0)delta=0;Elapsed+=delta;phaseElapsed+=delta;switch(Phase){
   case ScreenTransitionPhase.FadeOut:if(phaseElapsed>=OutSeconds){Phase=ScreenTransitionPhase.Preparing;phaseElapsed=0;NeedsSwap=true;}break;
   case ScreenTransitionPhase.Preparing:if(failed||phaseElapsed>=12){Failed=true;Phase=ScreenTransitionPhase.FadeIn;phaseElapsed=0;}else{preparedFrames=ready?preparedFrames+1:0;if(preparedFrames>=2){Phase=ScreenTransitionPhase.FadeIn;phaseElapsed=0;}}break;
   case ScreenTransitionPhase.FadeIn:if(phaseElapsed>=InSeconds){Phase=ScreenTransitionPhase.Idle;phaseElapsed=0;}break;
  }}
  public void Cancel(){if(!Busy)return;fadeInFrom=Opacity;mediaInFrom=MediaGain;Phase=ScreenTransitionPhase.FadeIn;NeedsSwap=false;preparedFrames=0;phaseElapsed=0;}
  double Pulse(){double t=Math.Max(0,Elapsed-.3)%2;return t<=1?Ease(t):Ease(2-t);}
  static double Clamp(double x){return Math.Max(0,Math.Min(1,x));}
  static double Ease(double x){x=Clamp(x);if(x==0||x==1)return x;double lo=0,hi=1;for(int i=0;i<24;i++){double t=(lo+hi)/2,u=1-t,bx=3*u*u*t*.42+3*u*t*t*.58+t*t*t;if(bx<x)lo=t;else hi=t;}double v=(lo+hi)/2;return 3*v*v-2*v*v*v;}
 }
}
