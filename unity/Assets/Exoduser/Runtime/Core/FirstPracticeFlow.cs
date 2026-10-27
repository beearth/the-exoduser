using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Web parryLesson steps in the web order: -3 move, -2 left click, -1 right click, 8 spike trap, then 0..7 (parry-lesson.js tick/completeStep).
    public enum PracticeStep { Move, Left, Right, Trap }
    public enum FirstPracticePhase { Intro, Practice, Success, Done, Ended }

    // This checklist consumes actual simulation evidence; input alone never earns a check.
    public sealed class FirstPracticeFlow
    {
        public const int MovePixels=120,LeftKillGoal=10,RightKillGoal=5,TrapKillGoal=10,TransitionTicks=90;
        public static readonly PracticeStep[] Order={PracticeStep.Move,PracticeStep.Left,PracticeStep.Right,PracticeStep.Trap};
        public FirstPracticePhase Phase {get;private set;}=FirstPracticePhase.Intro;
        public int Index {get;private set;}
        public PracticeStep Step {get{return Order[Index];}}
        public double MoveDistance {get;private set;}
        public int LeftKills {get;private set;}
        public int RightKills {get;private set;}
        public int TrapKills {get;private set;}
        public bool FullChargeKill {get;private set;}
        public bool TrapPlaced {get;private set;}
        public bool TrapEscaped {get;private set;}
        public readonly bool[] Checks=new bool[Order.Length];
        public bool MovementDone {get{return Checks[0];}}
        public bool AttackDone {get{return Checks[1];}}
        public bool RightDone {get{return Checks[2];}}
        public bool TrapDone {get{return Checks[3];}}
        public bool Skipped {get;private set;}
        public bool Active {get{return Phase!=FirstPracticePhase.Ended;}}
        // true while the current step is being practised (not the intro, not the 90-tick success pause)
        public bool Practising {get{return Phase==FirstPracticePhase.Practice;}}
        readonly HashSet<int> admitted=new HashSet<int>(),credited=new HashSet<int>();
        int transition,trapZoneId;
        public void Start(){if(Phase==FirstPracticePhase.Intro)Phase=FirstPracticePhase.Practice;}
        public void ObserveMovement(float beforeX,float beforeY,float afterX,float afterY,bool directionHeld)
        {
            if(!Practising||Step!=PracticeStep.Move||!directionHeld)return;
            double dx=afterX-beforeX,dy=afterY-beforeY,distance=Math.Sqrt(dx*dx+dy*dy);
            if(double.IsNaN(distance)||double.IsInfinity(distance))return;
            MoveDistance+=distance;
            if(MoveDistance>=MovePixels)Complete();
        }
        public void Tick(){if(Phase==FirstPracticePhase.Success&&--transition<=0)Advance();}
        public void AdmitEnemy(int id){if(id>0&&Practising&&Step!=PracticeStep.Move)admitted.Add(id);}
        public void ObserveKill(int enemyId,string attackKind,int step,int chargeTier,bool killed,bool fromTick)
        {
            if(!Practising||!fromTick||!killed||!admitted.Contains(enemyId)||credited.Contains(enemyId))return;
            switch(Step)
            {
                case PracticeStep.Left:
                    if(attackKind!="kiSlash"&&attackKind!="weapon")return;
                    credited.Add(enemyId);LeftKills++;
                    if(attackKind=="kiSlash"&&step==3&&chargeTier==3)FullChargeKill=true;
                    if(LeftKills>=LeftKillGoal&&FullChargeKill)Complete();
                    break;
                case PracticeStep.Right:
                    if(attackKind!="fireball")return;
                    credited.Add(enemyId);RightKills++;
                    if(RightKills>=RightKillGoal)Complete();
                    break;
                case PracticeStep.Trap:
                    if(attackKind!="spikeTrap")return;
                    credited.Add(enemyId);TrapKills++;
                    if(TrapKills>=TrapKillGoal&&TrapEscaped)Complete();
                    break;
            }
        }
        // web tickTrapPractice: a new zone resets the escape flag; escape = a direction held while 120+ px from the zone centre
        public void ObserveTrap(int zoneId,float distanceToZone,bool directionHeld)
        {
            if(!Practising||Step!=PracticeStep.Trap)return;
            if(zoneId!=0&&zoneId!=trapZoneId){trapZoneId=zoneId;TrapPlaced=true;TrapEscaped=false;}
            if(trapZoneId!=0&&directionHeld&&distanceToZone>=120)TrapEscaped=true;
            if(TrapKills>=TrapKillGoal&&TrapEscaped)Complete();
        }
        void Complete()
        {
            if(Phase!=FirstPracticePhase.Practice||Checks[Index])return;
            Checks[Index]=true;transition=TransitionTicks;
            Phase=Index==Order.Length-1?FirstPracticePhase.Done:FirstPracticePhase.Success;
        }
        void Advance()
        {
            Index++;Phase=FirstPracticePhase.Practice;admitted.Clear();credited.Clear();
        }
        public void End(bool skipped){Skipped=skipped;Phase=FirstPracticePhase.Ended;admitted.Clear();}
    }
}
