using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public enum FirstPracticePhase { Intro, Movement, MovementSuccess, Attack, SupportedComplete, Ended }

    // This checklist consumes actual simulation evidence; input alone never earns a check.
    public sealed class FirstPracticeFlow
    {
        public FirstPracticePhase Phase {get;private set;}=FirstPracticePhase.Intro;
        public double MoveDistance {get;private set;}
        public int LeftKills {get;private set;}
        public bool FullChargeKill {get;private set;}
        public bool MovementDone {get;private set;}
        public bool AttackDone {get;private set;}
        public bool Skipped {get;private set;}
        public bool Active {get{return Phase!=FirstPracticePhase.Ended;}}
        readonly HashSet<int> admitted=new HashSet<int>(),credited=new HashSet<int>();
        int transition;
        public void Start(){if(Phase==FirstPracticePhase.Intro)Phase=FirstPracticePhase.Movement;}
        public void ObserveMovement(float beforeX,float beforeY,float afterX,float afterY,bool directionHeld)
        {
            if(Phase!=FirstPracticePhase.Movement||!directionHeld)return;
            double dx=afterX-beforeX,dy=afterY-beforeY,distance=Math.Sqrt(dx*dx+dy*dy);
            if(double.IsNaN(distance)||double.IsInfinity(distance))return;
            MoveDistance+=distance;
            if(MoveDistance>=120){MovementDone=true;Phase=FirstPracticePhase.MovementSuccess;transition=90;}
        }
        public void Tick(){if(Phase==FirstPracticePhase.MovementSuccess&&--transition<=0)Phase=FirstPracticePhase.Attack;}
        public void AdmitEnemy(int id){if(id>0&&Phase==FirstPracticePhase.Attack)admitted.Add(id);}
        public void ObserveKill(int enemyId,string attackKind,int step,int chargeTier,bool killed,bool fromTick)
        {
            if(Phase!=FirstPracticePhase.Attack||!fromTick||!killed||!admitted.Contains(enemyId)||credited.Contains(enemyId))return;
            if(attackKind!="kiSlash"&&attackKind!="weapon")return;
            credited.Add(enemyId);LeftKills++;
            if(attackKind=="kiSlash"&&step==3&&chargeTier==3)FullChargeKill=true;
            if(LeftKills>=10&&FullChargeKill){AttackDone=true;Phase=FirstPracticePhase.SupportedComplete;}
        }
        public void End(bool skipped){Skipped=skipped;Phase=FirstPracticePhase.Ended;admitted.Clear();}
    }
}
