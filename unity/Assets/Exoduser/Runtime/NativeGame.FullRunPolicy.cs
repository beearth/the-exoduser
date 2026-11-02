using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Opt-in QA control preferences. Only virtual input choices; no Simulation writes.
    [Serializable] internal sealed class FullRunControlPolicy
    {
        public bool enabled, parryOnly, qCycle, eCycle, noRoll, chain, chainTowardBoss, iceBlink, magicPriority;
        public bool melee = true, magic = true, orbit = true;
        public float bossRange = 210, retreatHealth, retreatDistance = 650, chainHealth = .7f;
        public int chargeTicks = 120, chainCooldown = 180;
        static float Bound(float value,float fallback,float low,float high)
            =>float.IsNaN(value)||float.IsInfinity(value)?fallback:Math.Max(low,Math.Min(high,value));
        public void Normalize()
        {
            bossRange=Bound(bossRange,210,100,850);retreatHealth=Bound(retreatHealth,0,0,.95f);
            retreatDistance=Bound(retreatDistance,650,bossRange,1000);chainHealth=Bound(chainHealth,.7f,0,1);
            chargeTicks=Math.Max(0,Math.Min(120,chargeTicks));chainCooldown=Math.Max(60,Math.Min(600,chainCooldown));
        }
    }

    internal static class FullRunControlInputs
    {
        internal static void Apply(Simulation sim, FullRunControlPolicy policy, FullRunNavigation navigation,
            Func<float,float,float,bool> canMove, List<Key> keys, ref Vector2 move, ref Vector2 aim,
            ref bool attack, ref bool magic, bool evading, int auxiliary, ref int lastChainTick)
        {
            var p=sim.Player;
            if(!policy.enabled||!sim.Stage.InArena||p.Hp<=0)return;
            EnemyState boss=null;foreach(var e in sim.Enemies)if(e.IsBoss&&e.Alive){boss=e;break;}
            if(boss==null)return; // Preserve the ordinary exit route after the actual kill.
            var here=new Vector2(p.X,p.Y);var target=new Vector2(boss.X,boss.Y);
            var away=(here-target).normalized;if(Vector2.SqrMagnitude(away)<.01f)away=Vector2.up;
            float distance=Vector2.Distance(here,target);aim=target;
            bool retreat=policy.retreatHealth>0&&p.Hp<p.MaxHp*policy.retreatHealth;
            if(retreat)move=navigation.Direction(p.X,p.Y,target.x+away.x*policy.retreatDistance,target.y+away.y*policy.retreatDistance,p.Radius,canMove,sim.TickCount);
            else if(policy.orbit)
            {
                var goal=target+away*policy.bossRange;
                if(Math.Abs(distance-policy.bossRange)<35){var tangent=new Vector2(-away.y,away.x);goal=here+tangent*90;}
                move=navigation.Direction(p.X,p.Y,goal.x,goal.y,p.Radius,canMove,sim.TickCount);
            }
            if(policy.noRoll&&(auxiliary&4)==0)keys.Remove(Key.Space);
            if(policy.qCycle&&p.Mana>=10&&sim.TickCount%40<20)keys.Add(Key.Q);
            if(policy.eCycle&&p.State=="idle"&&sim.TickCount%30==0)keys.Add(Key.E);
            if(p.KiChargeActive&&!sim.IceOrbActive)attack=p.KiChargeTicks<policy.chargeTicks;
            if(policy.magicPriority&&p.Mana>=40&&!sim.IceOrbActive){magic=sim.TickCount%120<45;if(magic)attack=false;}
            if(!policy.melee||policy.parryOnly||retreat)attack=false;
            if(!policy.magic||policy.parryOnly||retreat)magic=false;
            if(policy.chain&&sim.DashHold)
            {
                keys.Remove(Key.LeftShift);aim=here+new Vector2((float)Math.Cos(p.Facing),(float)Math.Sin(p.Facing))*300;attack=magic=false;
            }
            else if(policy.chain&&p.State!="pStun"&&p.Hp<=p.MaxHp*policy.chainHealth&&
                (evading||sim.PlayerPoison>0)&&sim.HarpGauge>=45&&p.Stamina>=p.MaxStamina*.01f&&
                !sim.HarpActive&&!sim.DashActive&&sim.TickCount-lastChainTick>=policy.chainCooldown)
            {
                keys.Remove(Key.Space);keys.Add(Key.LeftShift);lastChainTick=sim.TickCount;
                aim=policy.chainTowardBoss?target:here+away*500;attack=magic=false;
            }
            if(policy.iceBlink&&sim.IceOrbActive&&sim.IceOrbT>=90){keys.Add(Key.LeftShift);aim=here+away*500;}
            keys.Remove(Key.W);keys.Remove(Key.A);keys.Remove(Key.S);keys.Remove(Key.D);
            if(move.x>.25f)keys.Add(Key.D);else if(move.x<-.25f)keys.Add(Key.A);
            if(move.y>.25f)keys.Add(Key.S);else if(move.y<-.25f)keys.Add(Key.W);
        }
    }
}
