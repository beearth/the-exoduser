using System;using System.Collections.Generic;using Exoduser.UnityPort.Core.Combat;
namespace Exoduser.UnityPort.Core {
 public interface IMeleeCombatHost { bool MeleeHit(EnemySpawn enemy,int damage,string source,bool unparryable); void MeleeTell(EnemySpawn enemy,string source,bool unparryable); void ProjectileTell(string parryClass); }
 public sealed partial class EnemySpawn {
  public double MeleeTimer{get;set;} public double MeleeTellMax{get;set;} public double MeleeActiveMax{get;set;} public double MeleeCooldown{get;set;} public double MeleeChargeCooldown{get;set;}
  public int MeleeIndex{get;set;} public int MeleeTellSerial{get;set;} public bool MeleeUnparryable{get;set;} public bool MeleeHitDone{get;set;} public string MeleeSource{get;set;}
 }
 public static class MeleeAttackRules {
  public static bool Target(int et){return et==0||et==4||et==6||et==19||et==29;}
  public static int CounterTicks(int et){return et==4?45:et==6?40:et==29?30:36;}
  public static double PoiseFraction(bool eliteOrGate){return eliteOrGate?.20:.30;}
 }
 public static class EnemyProjectilePolicy {
  static readonly HashSet<int> NoProj=new HashSet<int>{0,4,5,6,9,11,19,20,24,29,50,51,52,53,54,55,56,57,58,59};
  static readonly HashSet<int> Ranged=new HashSet<int>{1,7,8,9,13,16,17,25,26};
  public static int Interval(int et){return NoProj.Contains(et)?9999:Ranged.Contains(et)?240:480;}
 }
 public static partial class EnemyAi {
  static void MeleeTell(IEnemyAiHost h,EnemySpawn e,int index,double ticks,string source,bool forbidden,double active) {
   e.s="g2Tell";e.MeleeTellSerial++;e.MeleeIndex=index;e.MeleeTimer=ticks;e.MeleeTellMax=ticks;e.MeleeActiveMax=active;e.MeleeSource=source;e.MeleeUnparryable=forbidden;e.MeleeHitDone=false;
   e.facing=JsMath.Atan2(h.PY-e.y,h.PX-e.x);e.echDx=JsMath.Cos(e.facing);e.echDy=JsMath.Sin(e.facing);
   if(h is IMeleeCombatHost host)host.MeleeTell(e,source,forbidden);
  }
  static void MeleeDamage(IEnemyAiHost h,EnemySpawn e,double mult,string source,bool forbidden) {
   if(h is IMeleeCombatHost host)host.MeleeHit(e,Js.Int(e.atk*mult*h.ElMul(e.el)),source,forbidden);
   else if(!forbidden&&h.IsParryWindow())h.Parry(e,e.atk);else h.HurtPlayer(Js.Int(e.atk*mult*h.ElMul(e.el)),false);
  }
  // Called once per active AI tick after the shared DOT/elite head. No attack tickets.
  static bool TickG2Melee(IEnemyAiHost h,EnemySpawn e,double sp,double d) {
   int et=(int)e.etype;if(e.ib||!MeleeAttackRules.Target(et))return false;
   e.MeleeCooldown=Math.Max(0,e.MeleeCooldown-sp);e.MeleeChargeCooldown=Math.Max(0,e.MeleeChargeCooldown-sp);
   if(e.s=="g2Tell") { e.MeleeTimer-=sp;if(e.MeleeTimer<=0){e.s="g2Active";e.MeleeTimer=e.MeleeActiveMax;}return true; }
   if(e.s=="g2Gap"){e.MeleeTimer-=sp;if(e.MeleeTimer<=0){int next=e.MeleeIndex+1;MeleeTell(h,e,next,et==19?40:16,et==19?"slam":"combo",et==19||next==2,et==19?1:3);}return true;}
   if(e.s=="g2Active") {
    bool charge=e.MeleeSource=="charge";double reach=et==0?e.r+h.PRadius+24:et==4?e.r+h.PRadius+28:et==19&&e.MeleeIndex==1?70+e.r:et==29?70+e.r:e.r+h.PRadius+8;
    double dist=d;
    if(charge){double ox=e.x,oy=e.y,speed=et==6?4.5:5;Step(h,e,e.echDx*speed*sp,e.echDy*speed*sp);double dx=e.x-ox,dy=e.y-oy,len=dx*dx+dy*dy;double t=len>0?Math.Max(0,Math.Min(1,((h.PX-ox)*dx+(h.PY-oy)*dy)/len)):0;dist=Dst(h.PX,h.PY,ox+dx*t,oy+dy*t);}
    if(!e.MeleeHitDone&&dist<reach&&h.PIframes<=0&&h.PState!="charge") { e.MeleeHitDone=true;MeleeDamage(h,e,et==4?1.2:et==6?1.3:et==19&&e.MeleeIndex==1?2:et==29?2:.8,e.MeleeSource,e.MeleeUnparryable);if(e.s!="g2Active")return true; }
    e.MeleeTimer-=sp;if(e.MeleeTimer<=0){if((et==19&&e.MeleeIndex==0)||(et==29&&!charge&&e.MeleeIndex<2)){e.s="g2Gap";e.MeleeTimer=et==19?22:10;}else{if(et==29&&!charge)for(int k=0;k<8;k++)ProjAt(h,e,Math.PI*2*k/8,3,1.2,2,300,"#4455aa",2);e.s="idle";e.st2=0;}}return true;
   }
   if(e.s!="idle")return false; // existing elite M29 charge remains unchanged
   if(e.MeleeCooldown<=0&&d<(et==29?120:et==19?e.r+h.PRadius+30:et==6?200:et==4?e.r+h.PRadius+28:e.r+h.PRadius+24)) {
    double cd=et==0?70+h.Rand()*20:et==4?100+h.Rand()*20:et==6?120+h.Rand()*30:et==19?150+h.Rand()*30:240;e.MeleeCooldown=cd;
    MeleeTell(h,e,0,et==0?24:et==4?36:et==6?24:et==19?18:30,et==6?"charge":et==4?"slam":et==29?"combo":"swing",false,et==4?3:et==6?20:et==29?3:2);return true;
   }
   if(et==29&&e.MeleeChargeCooldown<=0&&d>150&&d<1200&&h.Rand()<.008*sp){e.MeleeChargeCooldown=360;MeleeTell(h,e,0,40,"charge",true,25);return true;}
   Idle(h,e,sp,d,et);return true;
  }
 }
}
