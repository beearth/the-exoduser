using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 // Presentation-host policy for screen-transition preparation (not Core; no rule or assembly result lives here).
 // Heavy field assembly reports real steps here; the transition host waits while steps keep arriving. It gives up only on an
 // error, when reports stop for StallSeconds of clamped frame time, or at the HardCapSeconds absolute cap (frames clamped to
 // HardCapMaxFrame). Giving up never rolls back to the lobby: the screen opens as is and a half-built 3D field is stopped and
 // torn down, so play continues in 2D (the 3D field is retried at the next field entry, see FieldLoadGate).
 internal static class NativeTransitionProgress {
  static long beats;static int depth,generation;static string stage="",failure;static float fraction;
  // Set by the owner of the assembly coroutine: true while that coroutine is still running. Progress left Active without a live owner is an orphan.
  internal static Func<bool> OwnerAlive;
  internal static string Failure{get{return failure;}}
  internal static bool Active{get{return depth>0;}}
  internal static long Beats{get{return beats;}}
  internal static string Stage{get{return stage;}}
  internal static float Fraction{get{return fraction;}}
  // Returns the owner token. Only the generation that began a stage can end it; a Release() invalidates older tokens.
  internal static int Begin(string name){if(depth==0)fraction=0;depth++;beats++;stage=name??"";return generation;}
  // Monotonic: a later, smaller report never moves the visible progress backwards.
  internal static void Report(string name,float done){beats++;stage=name??"";float f=done<0?0:done>1?1:done;if(f>fraction)fraction=f;}
  internal static void End(int token){if(token!=generation)return;if(depth>0)depth--;beats++;if(depth==0){fraction=1;stage="";}}
  // Forced clear (orphaned or aborted assembly). Older owners' End() calls are ignored afterwards.
  internal static bool Release(){if(depth==0)return false;generation++;depth=0;beats++;stage="";return true;}
  internal static bool ReleaseOrphan(){if(depth>0&&OwnerAlive!=null&&!OwnerAlive())return Release();return false;}
  // First failure reason of the field assembly (exception, hard cap); read by the transition host.
  internal static void Fail(string why){if(string.IsNullOrEmpty(failure))failure=why;}
  // A new transition starts: clear the previous failure and any progress state left behind by a dead owner.
  internal static void NewTransition(){failure=null;ReleaseOrphan();}
  // Field-bound transitions wait for assembly (Active) and for a requested-but-unfinished 3D field (pending).
  internal static bool Blocks(bool fieldBound,bool pending){return fieldBound&&(depth>0||pending);}
  internal static void Reset(){beats=0;depth=0;generation++;stage="";failure=null;fraction=0;}
 }
 // Counts frame time without progress. Frame time is clamped, so one long frame (a synchronous assembly step,
 // a GC or disk hitch) can never by itself look like a hang; only reports that stop while frames keep running do.
 internal sealed class TransitionPrepareWatchdog {
  internal const double StallSecondsAssembly=20,StallSecondsIdle=12,MaxFrame=.25,HardCapSeconds=120,HardCapMaxFrame=2;
  double idle,total;long seen;bool started;string reason;
  internal double Idle{get{return idle;}}
  internal double Total{get{return total;}}
  internal string Reason{get{return reason;}}
  internal void Begin(long beats){idle=0;total=0;reason=null;seen=beats;started=true;}
  internal void End(){started=false;idle=0;total=0;}
  // The first recorded reason wins: later frames of the same failed transition cannot overwrite it.
  internal static string FirstReason(string kept,string next){return string.IsNullOrEmpty(kept)?next:kept;}
  internal static bool IsPrepareFailure(string reason){return reason!=null&&(reason.StartsWith("prepare-stalled",StringComparison.Ordinal)||reason.StartsWith("prepare-hard-cap",StringComparison.Ordinal));}
  internal static bool FieldBound(string boundary){return boundary=="lobby-game"||boundary=="story-game";}
  internal bool Started{get{return started;}}
  // Returns true when preparation must be treated as failed (no progress for the allowed frame time).
  internal bool Tick(double delta,long beats,bool assemblyActive){
   if(!started)Begin(beats);
   if(double.IsNaN(delta)||double.IsInfinity(delta)||delta<0)delta=0;
   // Absolute cap on one preparation: continuous reports cannot keep the black screen forever. Each frame counts at most HardCapMaxFrame (2 s), so a
   // debugger stop, an OS sleep or a throttled background tab (one 125 s frame, 0.2 fps) is not mistaken for a hang.
   total+=Math.Min(delta,HardCapMaxFrame);if(total>=HardCapSeconds){reason="prepare-hard-cap("+HardCapSeconds+"s)";return true;}
   if(beats!=seen){seen=beats;idle=0;return false;}
   idle+=Math.Min(delta,MaxFrame);
   if(idle>=(assemblyActive?StallSecondsAssembly:StallSecondsIdle)){reason="prepare-stalled (no progress for "+(assemblyActive?StallSecondsAssembly:StallSecondsIdle)+"s)";return true;}
   return false;
  }
  // One host frame. While Preparing the flow clock is held (delta 0) so Core's own 12 s cap and one-long-frame failure cannot fire;
  // failure comes only from an error the host already has, or from this watchdog. Returns the (possibly new) error text.
  internal static string Advance(ScreenTransitionFlow flow,TransitionPrepareWatchdog dog,double delta,bool ready,string error,bool assemblyActive,long beats){
   bool holding=flow.Phase==ScreenTransitionPhase.Preparing;
   if(holding){if(string.IsNullOrEmpty(error)&&dog.Tick(delta,beats,assemblyActive))error=dog.Reason;}
   else dog.End();
   flow.Tick(holding?0:delta,ready,!string.IsNullOrEmpty(error));
   return error;
  }
 }
 // Decides when the 3D field assembly may (re)start. One shared counter for every kind of abort (stall, hard-cap, owner disabled, exception):
 // the first abort defers one retry to the next field entry, the second abort makes it permanent (2D for the session). Scene loads/unloads still in flight (orphans) block a restart so RM1_Slice is never loaded twice.
 internal sealed class FieldLoadGate {
  internal const int MaxRetries=1;
  int aborts,pendingOps;bool deferred,permanent;
  internal bool Permanent{get{return permanent;}}
  internal bool Deferred{get{return deferred;}}
  internal int PendingOps{get{return pendingOps;}}
  internal bool CanStart{get{return !permanent&&!deferred&&pendingOps==0;}}
  internal int Aborts{get{return aborts;}}
  internal void Abort(bool exception){if(++aborts>MaxRetries)MarkPermanent();else deferred=true;}
  internal void MarkPermanent(){permanent=true;deferred=false;}
  internal void FieldEntry(){deferred=false;}
  // Unload-only wait: no retry is used, but nothing may start the assembly outside a transition either; the next field entry clears this.
  internal void Defer(){if(!permanent)deferred=true;}
  // Waiting only for a scene unload (no assembly running): an idle stall there is not an assembly failure and must not use up the retry.
  internal bool WaitingOnOps(bool loading){return !loading&&pendingOps>0;}
  internal void OpStarted(){pendingOps++;}
  internal void OpDone(){if(pendingOps>0)pendingOps--;}
 }
 // Cached assembly objects may have been destroyed by an abort; callers pass a Unity-null predicate (a plain C# null check would miss them).
 internal static class CacheValidity {
  internal static bool NeedsRebuild<T>(T single,T[] many,Func<T,bool> dead)where T:class{
   if(single==null||dead(single)||many==null)return true;foreach(var m in many)if(m==null||dead(m))return true;return false;}
  // Prefer the untouched original; fall back to the current entry; default when both are dead.
  internal static T PickSource<T>(T[] originals,T[] current,int i,Func<T,bool> dead)where T:class{
   if(originals!=null&&current!=null&&originals.Length==current.Length&&originals[i]!=null&&!dead(originals[i]))return originals[i];
   return current!=null&&i<current.Length&&current[i]!=null&&!dead(current[i])?current[i]:null;}
 }
 // Loading line target: on failure it freezes where it was (no run to 100%), the flow's fade-in then takes it away.
 internal static class TransitionProgressBar {
  internal static float Target(bool sawAssembly,bool assembling,float fraction,bool failed,float shown){if(failed)return shown;return sawAssembly?(assembling?fraction:1):0;}
 }
 // Runs a nested coroutine chain on the host so an exception anywhere in it is caught (Unity would only log it and silently stop).
 // Nested IEnumerators are flattened here; on failure every pending iterator is disposed so its finally blocks run.
 internal static class AssemblyGuard {
  internal static System.Collections.IEnumerator Run(System.Collections.IEnumerator root,Action<Exception> fail){
   var stack=new System.Collections.Generic.Stack<System.Collections.IEnumerator>();stack.Push(root);Exception error=null;
   while(stack.Count>0){
    var top=stack.Peek();bool more=false;object current=null;
    try{more=top.MoveNext();if(more)current=top.Current;}catch(Exception e){error=e;}
    if(error!=null)break;
    if(!more){stack.Pop();continue;}
    var inner=current as System.Collections.IEnumerator;if(inner!=null){stack.Push(inner);continue;}
    yield return current;
   }
   if(error!=null){while(stack.Count>0){var d=stack.Pop() as IDisposable;try{if(d!=null)d.Dispose();}catch(Exception){}}fail(error);}
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
