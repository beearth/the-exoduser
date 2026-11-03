using System;using Exoduser.UnityPort.Core.Combat;
namespace Exoduser.UnityPort.Core {
 public sealed partial class Simulation {
  EnemySpawn currentMeleeEnemy;bool lastMeleeHitLanded=true;
  public bool MeleeParry(EnemyState enemy,string source,double? bossPoise=null) {
   if(enemy==null||!enemy.Alive||Player.Hp<=0||Player.Iframes>0||IceOrbActive||DashActive||HarpActive||RollActive)return false;
   if(!ParryRules.IsParryWindow(Player.State,Player.StateTicks,0,SbParryT,CapeParry))return false;
   bool q=Player.State=="sBlock"||Player.State=="peaceShield"||SbParryT>0;
   ParryBank+=enemy.Attack!=0?enemy.Attack:10;ApplyParrySuccess(q,1,null,"melee:"+source,enemy.X,enemy.Y,ParryKind.Melee);
   int window=MeleeAttackRules.CounterTicks(enemy.Etype);enemy.MeleeCounterUntil=TickCount+window;enemy.MeleeFreezeUntil=TickCount+window;enemy.MeleeParriedTick=TickCount;
   var w=enemy.Web??SyncToWeb(enemy);w.s="idle";w.st2=0;w.MeleeTimer=0;w.MeleeCooldown+=30;w.shieldBashT+=30;w.slamT+=30;w._iceSlamT+=30;w.swoopT+=30;w._iceSwoopT+=30;w._iceChargeT+=30;if(w.modT!=null)w.modT.eliteCharge+=30;w._projChargeT=0;
   enemy.State="idle";enemy.StateTicks=0;
   double amount=enemy.IsBoss?(bossPoise??0):enemy.MaxPoise*MeleeAttackRules.PoiseFraction(enemy.Elite>0||enemy.IsGateGuard||enemy.Etype==29);
   var r=EnemyPoiseRules.PoiseHit(new EnemyPoiseRules.Enemy{Alive=enemy.Alive,Boss=enemy.IsBoss,Poise=enemy.Poise,MaxPoise=enemy.MaxPoise,PoiseR=enemy.PoiseRegenTicks,Stunned=enemy.Stunned,MaxStunned=enemy.MaxStunned,PImmune=w._pImmune??0},amount,1,0);
   enemy.Poise=(float)r.Enemy.Poise;enemy.PoiseRegenTicks=(float)r.Enemy.PoiseR;enemy.Stunned=(float)r.Enemy.Stunned;enemy.MaxStunned=(float)r.Enemy.MaxStunned;
   w.poise=enemy.Poise;w.poiseR=enemy.PoiseRegenTicks;w.stunned=enemy.Stunned;w._maxStunned=enemy.MaxStunned;w._pImmune=r.Enemy.PImmune;
   if(r.Broke)CombatStats.Add(Stats.groggy,"meleeParry");return true;
  }
  void HurtFromMelee(EnemySpawn w,int damage,string source,bool forbidden,bool magic=false){EnemyState owner;webOwner.TryGetValue(w,out owner);HurtPlayer(damage,new HurtOptions{Magic=magic,MeleeEnemy=owner,MeleeSource=source,Unparryable=forbidden,Source="meleeEnemy",HasSource=true,SrcX=(float)w.x,SrcY=(float)w.y});}
 }
}
