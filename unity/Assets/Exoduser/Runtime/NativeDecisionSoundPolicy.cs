using System;
namespace Exoduser.UnityPort {
 internal sealed class NativeDecisionSoundPolicy {
  internal double BusyUntil {get;private set;}=double.NegativeInfinity;
  internal double DuckUntil {get;private set;}=double.NegativeInfinity;
  internal static bool Allowed(string kind)=>kind=="hero"||kind=="create"||kind=="enter"||kind=="new-game"||kind=="difficulty"||kind=="delete";
  internal bool TryPlay(string kind,int volume,double now){if(!Allowed(kind)||volume<=0||now<BusyUntil)return false;BusyUntil=now+1.85;DuckUntil=now+.8;return true;}
  internal float MusicGain(double now)=>now<DuckUntil?(float)Math.Pow(10,-6d/20):1;
 }
}
