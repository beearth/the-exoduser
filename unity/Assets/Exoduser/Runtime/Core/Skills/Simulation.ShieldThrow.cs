using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;
namespace Exoduser.UnityPort.Core
{
 public sealed class ShieldWave
 {
  public double X,Y,Vx,Vy,Angle,Dist,MaxDist,Radius,Width,Damage,Age;public int Level;
  internal readonly HashSet<EnemyState> Hit=new HashSet<EnemyState>();
 }
 public sealed partial class Simulation
 {
  public bool ShieldFuse=true;
  public double ShieldThrowCd,ShieldWingTicks;
  public double ShieldThrowFusionMultiplier{get{return (ShieldFuse?1.2:1)*(1+(EquippedInventory!=null?EquippedInventory.AffixTotal("skillBoost"):0));}}
  public readonly List<ShieldWave> ShieldWaves=new List<ShieldWave>();
  readonly List<FireZone> shieldDomeFrame=new List<FireZone>();
  void CaptureShieldDomeFrame(){shieldDomeFrame.Clear();foreach(var z in FireZones)if(z.Type=="holyDome")shieldDomeFrame.Add(z);}
  public int ShieldThrowCount,ShieldWaveHits,ShieldWaveReflections;public double LastShieldThrowDamage;
  // 현행 웹 _autoShieldThrow. 신규 전사는 maliceSwipe1/shieldThrow1/shieldFuse=true다.
  public bool AutoShieldThrow()
  {
   int slv=Skills.Level("shieldThrow");if(slv<1||ShieldThrowCd>0)return false;
   bool fused=ShieldFuse&&Skills.Learned("maliceSwipe");var sh=EquippedInventory!=null?EquippedInventory.GetEquipped("shield"):null;
   if(!fused&&sh==null)return false;
   int level=fused?Math.Max(1,Math.Min(Skills.Level("maliceSwipe"),slv)):0;
   ShieldThrowCd=fused?Math.Max(120,720-level*15):720;
   double atk=sh!=null&&sh.atk!=0?sh.atk:3;
   double a=Player.Facing,damage;
   if(fused)
   {
    damage=Js.Int((atk+Player.BaseAttack*.3+10)*(1+(slv-1)*.12)*10*(1.5+(level-1)*.12)*ShieldThrowFusionMultiplier);
    double range=(1+(Math.Max(1,Math.Min(Skills.Level("maliceSwipe"),slv))-1)*.05)*ParryRules.ClampChargeMul(SBashChgMul);
    ShieldWaves.Add(new ShieldWave{X=Player.X+Math.Cos(a)*25,Y=Player.Y+Math.Sin(a)*25,Vx=Math.Cos(a)*12,Vy=Math.Sin(a)*12,Angle=a,MaxDist=210*range,Radius=50*range,Width=95*range,Damage=damage,Level=slv});
    HurtShake(8);
   }
   else
   {
    damage=Js.Int((atk+Player.BaseAttack*.3+10)*(1+(slv-1))*10*3*ShieldThrowFusionMultiplier);
    double range=180+(slv-1)*20;ShieldInstantHit(range,damage);
    SlamWaves.Add(new SlamWave{Id=nextWaveId++,X=Player.X,Y=Player.Y,MaxR=(float)(range*1.6),MaxT=35,Bash=true,Flame=true});
    HurtShake(10);
   }
   LastShieldThrowDamage=damage;ShieldWingTicks=40;Player.Iframes=Math.Max(Player.Iframes,40);ShieldThrowCount++;return true;
  }
  void ShieldInstantHit(double range,double raw)
  {
   double damage=Js.Int(raw*Config.DamageMultiplier)+attackBonus;attackBonus=0;
   var weapon=EquippedInventory!=null?EquippedInventory.GetEquipped("weapon"):null;int element=weapon!=null?weapon.el:0;
   foreach(var e in ShQuery(Player.X,Player.Y,range+20))
   {
    if(!e.Alive)continue;var web=e.Web??SyncToWeb(e);double d=Distance(Player.X,Player.Y,e.X,e.Y),mult=EnemyHurt.ElMul(element,web.el);
    var r=ParryRules.SlamHitTarget(new ParryRules.SlamTargetIn{D=d,R=e.Radius,Mult=mult,Boss=e.IsBoss,Poise=e.Poise,MaxPoise=e.MaxPoise,Stunned=e.Stunned},range,element,damage,false,GiantSlamLevel>0?GiantSlamLevel:Math.Max(1,Skills.Level("giantSlam")));
    if(!r.Targeted)continue;float a=(float)Math.Atan2(e.Y-Player.Y,e.X-Player.X);
    if(r.Hurt){ApplyEnemyDamage(e,(int)r.Dmg,a,false,0,false,false,0,0,false,element);e.KnockbackX+=(float)Math.Cos(a)*8;e.KnockbackY+=(float)Math.Sin(a)*8;if(!e.Alive)continue;}
    if(r.BossPoise)PoiseHitEnemy(e,r.BossPoiseAmt);else{e.Stunned=(float)r.Stunned;e.Poise=(float)r.Poise;var w=SyncToWeb(e);w.stunned=e.Stunned;w.poise=e.Poise;}
   }
   HurtFieldMobs(Player.X,Player.Y,range,damage,null);HurtShake(18);
  }
  void TickShieldThrow()
  {
   double bonus=0;foreach(var z in shieldDomeFrame)if(Distance(Player.X,Player.Y,z.X,z.Y)<z.R){bonus=1;break;}
   shieldDomeFrame.Clear();if(ShieldThrowCd>0)ShieldThrowCd-=1+bonus;if(ShieldWingTicks>0)ShieldWingTicks--;
   for(int i=0;i<ShieldWaves.Count;)
   {
    var w=ShieldWaves[i];w.X+=w.Vx;w.Y+=w.Vy;w.Dist+=Math.Sqrt(w.Vx*w.Vx+w.Vy*w.Vy);w.Age++;
    if(w.Dist>=w.MaxDist){ShieldWaves.RemoveAt(i);continue;}
    foreach(var e in Enemies.ToArray())
    {
     if(!e.Alive||w.Hit.Contains(e)||!InShieldWave(w,e.X,e.Y,e.Radius))continue;
     w.Hit.Add(e);ShieldWaveHits++;float a=(float)Math.Atan2(e.Y-w.Y,e.X-w.X);
     ApplyEnemyDamage(e,(int)w.Damage,a,false,1);double kb=30+w.Level*3;e.KnockbackX+=(float)(Math.Cos(w.Angle)*kb);e.KnockbackY+=(float)(Math.Sin(w.Angle)*kb);
     if(e.IsBoss)e.Poise=Math.Max(0,e.Poise-30);else{var web=SyncToWeb(e);if(!web._groggy){web._groggy=true;web.groggyT=90;web.s="hit";e.State="hit";}}
     HurtShake(6);
    }
    if(Druid!=null&&!Druid.Remodel)foreach(var p in Druid.Projectiles)
    {
     // 무지개탄은 Q 전용이다. 리모델 보스의 반사 금지 투사체 계약도 유지한다.
     if(!p.Active||p.Friendly||p.BlackBean||!InShieldWave(w,p.X,p.Y,0))continue;
     var flags=new ParryRules.ProjectileFlags{ParryClass=string.IsNullOrEmpty(p.ParryClass)?null:p.ParryClass,El=p.El,Mine=p.Mine,ElemBall=p.ElemBall,FireMagic=p.FireMagic,RedBean=p.RedBean,TitanEye=p.TitanEye,BwBean=p.BwBean,GbBean=p.GbBean,Web=p.Web};
     double resource=ParryRules.PhysicalResourceMultiplier(flags);var target=NearestEnemy(p.X,p.Y,600);
     if(target!=null){double a=Math.Atan2(target.Y-p.Y,target.X-p.X),speed=Math.Max(5,Math.Sqrt(p.Vx*p.Vx+p.Vy*p.Vy));p.Vx=Math.Cos(a)*speed;p.Vy=Math.Sin(a)*speed;}else{p.Vx*=-2;p.Vy*=-2;}
     var counter=ReflectInput(0).Counter;counter.BulletDmg=p.Dmg;counter.IsQ=true;p.Dmg=Js.Int(ParryRules.ParryProjectileDamage(counter)*1.5);
     p.Friendly=true;p.Life=p.Ml=120;p.BlueBean=p.ParryBlueBean=p.Magic=p.Homing=true;p.Col="#00e5ff";p.AoeR=p.AoeDmg=0;
     ApplyParrySuccess(false,resource,null);ShieldWaveReflections++;
    }
    i++;
   }
  }
  public static bool InShieldWave(ShieldWave w,double x,double y,double enemyRadius)
  {
   double dx=x-w.X,dy=y-w.Y,along=dx*Math.Cos(w.Angle)+dy*Math.Sin(w.Angle),perp=dx*Math.Cos(w.Angle+Math.PI/2)+dy*Math.Sin(w.Angle+Math.PI/2);
   return along>-w.Radius&&along<w.Radius+20&&Math.Abs(perp)<w.Width/2+enemyRadius;
  }
 }
}
