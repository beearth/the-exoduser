using System;
using System.Collections.Generic;
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
        public void RegisterFirstPracticeActor(EnemyState actor)
        {
            if(actor==null||!actor.Alive||!Enemies.Contains(actor))throw new ArgumentException("Practice actor must belong to this simulation.");
            firstPracticeActors.Add(actor);
        }
        bool IsFirstPracticeActor(EnemyState actor){return firstPracticeActors.Contains(actor);}
        void EmitFirstPracticeHit(EnemyState enemy,string kind,int step,int tier,bool wasAlive,bool bornInTick)
        {
            FirstPracticeHit?.Invoke(new FirstPracticeCombat(enemy.Id,kind,step,tier,wasAlive&&!enemy.Alive,executingFirstPracticeTick&&bornInTick));
        }
    }
}
