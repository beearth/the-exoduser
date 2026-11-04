using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 // Presentation-host policy for screen-transition preparation (not Core; no rule or assembly result lives here).
 // Heavy field assembly reports real steps here; the transition host waits while steps keep arriving and recovers
 // to the lobby only on an exception or when the reports stop for StallSeconds of real frame time.
 internal static class NativeTransitionProgress {
  static long beats;static int depth;static string stage="";static float fraction;
  internal static bool Active{get{return depth>0;}}
  internal static long Beats{get{return beats;}}
  internal static string Stage{get{return stage;}}
  internal static float Fraction{get{return fraction;}}
  internal static void Begin(string name){if(depth==0)fraction=0;depth++;beats++;stage=name??"";}
  // Monotonic: a later, smaller report never moves the visible progress backwards.
  internal static void Report(string name,float done){beats++;stage=name??"";float f=done<0?0:done>1?1:done;if(f>fraction)fraction=f;}
  internal static void End(){if(depth>0)depth--;beats++;if(depth==0){fraction=1;stage="";}}
  internal static void Reset(){beats=0;depth=0;stage="";fraction=0;}
 }
 // Counts frame time without progress. Frame time is clamped, so one long frame (a synchronous assembly step,
 // a GC or disk hitch) can never by itself look like a hang; only reports that stop while frames keep running do.
 internal sealed class TransitionPrepareWatchdog {
  internal const double StallSecondsAssembly=20,StallSecondsIdle=12,MaxFrame=.25;
  double idle;long seen;bool started;
  internal double Idle{get{return idle;}}
  internal void Begin(long beats){idle=0;seen=beats;started=true;}
  internal void End(){started=false;idle=0;}
  internal bool Started{get{return started;}}
  // Returns true when preparation must be treated as failed (no progress for the allowed frame time).
  internal bool Tick(double delta,long beats,bool assemblyActive){
   if(!started)Begin(beats);
   if(beats!=seen){seen=beats;idle=0;return false;}
   if(double.IsNaN(delta)||double.IsInfinity(delta)||delta<0)delta=0;
   idle+=Math.Min(delta,MaxFrame);
   return idle>=(assemblyActive?StallSecondsAssembly:StallSecondsIdle);
  }
  // One host frame. While Preparing the flow clock is held (delta 0) so Core's own 12 s cap and one-long-frame failure cannot fire;
  // failure comes only from an error the host already has, or from this watchdog. Returns the (possibly new) error text.
  internal static string Advance(ScreenTransitionFlow flow,TransitionPrepareWatchdog dog,double delta,bool ready,string error,bool assemblyActive,long beats){
   bool holding=flow.Phase==ScreenTransitionPhase.Preparing;
   if(holding){if(string.IsNullOrEmpty(error)&&dog.Tick(delta,beats,assemblyActive))error="prepare-stalled (no progress for "+(assemblyActive?StallSecondsAssembly:StallSecondsIdle)+"s)";}
   else dog.End();
   flow.Tick(holding?0:delta,ready,!string.IsNullOrEmpty(error));
   return error;
  }
 }
 // The same curve ScreenTransitionFlow uses for its ember pulse, kept host-side so the pulse keeps breathing
 // while the flow clock is held during a long preparation.
 internal static class TransitionPulse {
  internal static double At(double seconds){double t=Math.Max(0,seconds)%2;return t<=1?Ease(t):Ease(2-t);}
  static double Clamp(double x){return Math.Max(0,Math.Min(1,x));}
  static double Ease(double x){x=Clamp(x);if(x==0||x==1)return x;double lo=0,hi=1;for(int i=0;i<24;i++){double t=(lo+hi)/2,u=1-t,bx=3*u*u*t*.42+3*u*t*t*.58+t*t*t;if(bx<x)lo=t;else hi=t;}double v=(lo+hi)/2;return 3*v*v-2*v*v*v;}
 }
}
