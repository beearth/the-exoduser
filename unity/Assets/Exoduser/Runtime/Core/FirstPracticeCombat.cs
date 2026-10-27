using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Skills;
namespace Exoduser.UnityPort.Core
{
    public sealed class FirstPracticeCombat
    {
        public readonly int EnemyId,Step,ChargeTier;
        public readonly string AttackKind;
        public readonly bool Killed,FromTick;
        internal FirstPracticeCombat(int id,string kind,int step,int tier,bool killed,bool fromTick)
        {EnemyId=id;AttackKind=kind;Step=step;ChargeTier=tier;Killed=killed;FromTick=fromTick;}
    }
    public sealed partial class Simulation
    {
        public event Action<FirstPracticeCombat> FirstPracticeHit;
        public uint FirstPracticeRandomState {get{return randomState;}}
        bool executingFirstPracticeTick;
        readonly HashSet<EnemyState> firstPracticeActors=new HashSet<EnemyState>();
        readonly HashSet<EnemyState> firstPracticeTrapActors=new HashSet<EnemyState>();
        string practiceHitKind;
        public void RegisterFirstPracticeActor(EnemyState actor,bool trap=false)
        {
            if(actor==null||!actor.Alive||!Enemies.Contains(actor))throw new ArgumentException("Practice actor must belong to this simulation.");
            firstPracticeActors.Add(actor);if(trap)firstPracticeTrapActors.Add(actor);
        }
        // parry-lesson.js hurtEnemy `trap` branch: only the spike-trap zone damages these actors; shield absorbs first, hp falls to 0 = defeated, no rewards.
        void ApplyPracticeDamage(EnemyState enemy,int damage)
        {
            if(!firstPracticeTrapActors.Contains(enemy)){enemy.Hp=0;KillEnemy(enemy);return;}
            if(practiceHitKind!="spikeTrap"||damage<=0)return;
            double rest=damage;
            if(enemy.MaxShield>0&&enemy.Shield>0){double absorbed=Math.Min(enemy.Shield,rest);enemy.Shield=(float)Math.Max(0,enemy.Shield-absorbed);rest-=absorbed;}
            enemy.Hp=(int)Math.Max(0,enemy.Hp-rest);
            if(enemy.Hp>0)return;
            KillEnemy(enemy);
        }
        // parry-lesson.js startTrapPractice / tickTrapPractice (chase + malice refill + cooldown reset). The web flow-field movement is a straight chase with axis sliding here.
        public int PracticeSpikeDamage(){return SkillRules.SpikeTrapDamage(MagicReference(),1,MagicDamageMultiplier(),Math.Max(1,Skills.Level("spikeTrap")));}
        public void PrepareTrapPractice()
        {
            Materials=Math.Max(Materials,MaliceCost(SkillRules.SpikeTrapMalice));
            bool zone=false;foreach(var z in FireZones)if(z.Type=="spikeTrap"&&z.T<z.MaxT){zone=true;break;}
            if(!zone)SpikeTrapCd=0;
        }
        public FireZone PracticeTrapZone(){foreach(var z in FireZones)if(z.Type=="spikeTrap"&&z.T<z.MaxT)return z;return null;}
        public void TickPracticeTrapActors()
        {
            foreach(var e in firstPracticeTrapActors)
            {
                if(!e.Alive)continue;
                e.Facing=(float)Math.Atan2(Player.Y-e.Y,Player.X-e.X);
                var w=e.Web;double slow=w!=null&&(w._spikeSlow??0)>0?SkillRules.SpikeTrapSlowPct((int)(w._spikeSlowLv??1)):0;
                if(w!=null&&(w._spikeSlow??0)>0)w._spikeSlow=w._spikeSlow-1;
                float dx=Player.X-e.X,dy=Player.Y-e.Y,dist=(float)Math.Sqrt(dx*dx+dy*dy);
                if(dist<=45)continue;
                float step=(float)(e.Speed*(1-slow)),nx=e.X+dx/dist*step,ny=e.Y+dy/dist*step;
                if(Pass(nx,e.Y,e.Radius))e.X=nx;if(Pass(e.X,ny,e.Radius))e.Y=ny;
            }
        }
        bool IsFirstPracticeActor(EnemyState actor){return firstPracticeActors.Contains(actor);}
        void EmitFirstPracticeHit(EnemyState enemy,string kind,int step,int tier,bool wasAlive,bool bornInTick)
        {
            FirstPracticeHit?.Invoke(new FirstPracticeCombat(enemy.Id,kind,step,tier,wasAlive&&!enemy.Alive,executingFirstPracticeTick&&bornInTick));
        }
    }
}
