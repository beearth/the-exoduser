using System;using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public enum EnemyRigState {Idle,Move,Tell,Active,Recover,Hit,Stagger,Death}
 public struct EnemyRigSample {public EnemyRigState State;public int Age;public double Duration,Normalized;}
 // Read-only presentation projection. Never writes enemy/Core state or consumes gameplay RNG.
 public sealed class NativeEnemyRigPolicy {
  int previousTick=int.MinValue,entered,release=-1000,hitUntil=-1000;double previousDistance,charge;bool moving,dead;EnemyRigState state;
  public static bool Requested(string[] args){bool enabled=false;if(args==null)return false;for(int i=0;i<args.Length;i++){string v=null;if(args[i]!=null&&args[i].StartsWith("--enemy-render=",StringComparison.Ordinal))v=args[i].Substring(15);else if(args[i]=="--enemy-render"&&i+1<args.Length)v=args[++i];if(v!=null)enabled=v=="rigpixel";}return enabled;}
  public static double AnchorRatio(double value){return double.IsNaN(value)||double.IsInfinity(value)?.55:Math.Max(0,Math.Min(1,value));}
  public static double AnchorY(double min,double max,double foot,double height,double ratio){return Math.Max(min,Math.Min(max,foot+height*AnchorRatio(ratio)));}
  public static double ImpactRatio(int critical,bool large){return Math.Min(large?1.2:1,critical!=0?1:.6);}
  public EnemyRigSample Sample(EnemyState e,int tick,double distance){
   var w=e.Web;double charging=w!=null?w._projChargeT:e.ProjectileChargeTicks;
   if(tick!=previousTick){moving=distance>previousDistance+.001;previousDistance=distance;if(charge>0&&charging<=0&&e.Alive)release=tick;charge=charging;previousTick=tick;}
   EnemyRigState next;double duration=120,age=-1;
   if(!e.Alive){next=EnemyRigState.Death;duration=45;dead=true;}
   else {if(dead){entered=tick;release=hitUntil=-1000;dead=false;}
    if(tick<e.MeleeFreezeUntil){next=EnemyRigState.Recover;duration=Math.Max(1,e.MeleeFreezeUntil-e.MeleeParriedTick);age=tick-e.MeleeParriedTick;}
    else if(e.Stunned>0||(w!=null&&w.stunned>0)){next=EnemyRigState.Stagger;duration=Math.Max(1,e.MaxStunned>0?e.MaxStunned:e.Stunned);}
    else if(e.HurtTicks>0||e.HitStun>0||tick<hitUntil){next=EnemyRigState.Hit;duration=10;if(state!=next)hitUntil=tick+10;}
    else if(w!=null&&w.s=="g2Tell"){next=EnemyRigState.Tell;duration=Math.Max(1,w.MeleeTellMax);age=duration-w.MeleeTimer;}
    else if(w!=null&&w.s=="g2Active"){next=EnemyRigState.Active;duration=Math.Max(1,w.MeleeActiveMax);age=duration-w.MeleeTimer;}
    else if(w!=null&&w.s=="g2Gap"){next=EnemyRigState.Recover;duration=Math.Max(1,w.MeleeTimer);}
    else if(charging>0){next=EnemyRigState.Tell;duration=60;age=60-charging;}
    else if(tick-release<3){next=EnemyRigState.Active;duration=3;age=tick-release;}
    else if(tick-release<12){next=EnemyRigState.Recover;duration=9;age=tick-release-3;}
    else {next=moving?EnemyRigState.Move:EnemyRigState.Idle;}
   }
   if(next!=state){state=next;entered=tick;}if(age<0)age=tick-entered;
   return new EnemyRigSample{State=state,Age=Math.Max(0,(int)age),Duration=duration,Normalized=Math.Max(0,Math.Min(1,age/duration))};
  }
 }
 [Serializable] public sealed class EnemyRigCatalog {public EnemyRigDefinition[] models;}
 [Serializable] public sealed class EnemyRigDefinition {
  public int etype;public bool startEyeMass;public string modelResource,animator;public float baseRadius,height,chestRatio=.55f,stride=80;public int deathTicks=45;
  public string idle,move,tell,active,recover,hit,stagger,death;
  // 11-04 30-species table. Defaults keep the older 6 rows byte-for-byte equivalent: no cross-fade, no extra data.
  // blendTicks: Core ticks of cross-fade when the clip changes (carapace attack_tele->attack_act joint jump). sockets/extras/retouch/source are documentation read by the editor check and the tests only.
  public int blendTicks;public string[] sockets=Array.Empty<string>(),extras=Array.Empty<string>();public string retouch,source;
  public bool Matches(EnemyState enemy){return enemy!=null&&!enemy.IsBoss&&!enemy.IsGhoul&&enemy.Etype==etype&&enemy.IsStartEyeMass==startEyeMass;}
  public string Clip(EnemyRigState state){switch(state){case EnemyRigState.Move:return move;case EnemyRigState.Tell:return tell;case EnemyRigState.Active:return active;case EnemyRigState.Recover:return recover;case EnemyRigState.Hit:return hit;case EnemyRigState.Stagger:return stagger;case EnemyRigState.Death:return death;default:return idle;}}
 }
}
