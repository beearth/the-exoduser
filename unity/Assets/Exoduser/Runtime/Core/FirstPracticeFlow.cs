using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Web parryLesson steps in the web order: -3 move, -2 left click, -1 right click, 8 spike trap, then 0..7 (parry-lesson.js tick/completeStep).
    public enum PracticeStep { Move, Left, Right, Trap, ParryMagic, ParryPhysical, HoldMagic, HoldPhysical, Chain, Roll, RageParry, RageBurst }
    public enum FirstPracticePhase { Intro, Practice, Success, Done, Ended }

    // This checklist consumes actual simulation evidence; input alone never earns a check.
    public sealed class FirstPracticeFlow
    {
        public const int MovePixels=120,LeftKillGoal=10,RightKillGoal=5,TrapKillGoal=10,TransitionTicks=90;
        public static readonly PracticeStep[] Order={PracticeStep.Move,PracticeStep.Left,PracticeStep.Right,PracticeStep.Trap,PracticeStep.ParryMagic,PracticeStep.ParryPhysical,PracticeStep.HoldMagic,PracticeStep.HoldPhysical,PracticeStep.Chain,PracticeStep.Roll,PracticeStep.RageParry,PracticeStep.RageBurst};
        // steps the native controller implements; the parry steps wait for the Core projectile / reflection rules (docs: UNITY_MAC_FIRST_PRACTICE A18). Unported steps are skipped.
        public static readonly bool[] Ported={true,true,true,true,false,false,false,false,true,true,false,true};
        public static bool IsPorted(PracticeStep step){return Ported[Array.IndexOf(Order,step)];}
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
        public void Start(){if(Phase==FirstPracticePhase.Intro){Phase=FirstPracticePhase.Practice;ResetStepState();}}
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
            Phase=NextPorted()<0?FirstPracticePhase.Done:FirstPracticePhase.Success;
        }
        int NextPorted(){for(int i=Index+1;i<Order.Length;i++)if(Ported[i])return i;return -1;}
        void Advance()
        {
            int next=NextPorted();if(next<0){Phase=FirstPracticePhase.Done;return;}
            Index=next;Phase=FirstPracticePhase.Practice;admitted.Clear();credited.Clear();ResetStepState();
        }
        void ResetStepState(){ChainTarget=1;chainFlight=null;ChainFeedback=null;RollCount=0;rollArmed=rollFlight=false;FocusTicks=0;}
        // ---- Shift chain move (parry-lesson.js tickChainPractice): tiers 1, 2, 3 in order, each needs the matching tier fired and an actual pull ----
        public int ChainTarget {get;private set;}=1;
        public readonly bool[] ChainDone=new bool[4];
        public string ChainFeedback {get;private set;}   // "launched:<tier>:<spent>" / "complete:<tier>:<spent>" / "wrongTier:<fired>:<target>" / "blocked"
        sealed class ChainFlight{public int Tier;public double Spent,X,Y;public bool Pulled,Moved;}
        ChainFlight chainFlight;double chainGauge=-1;
        // returns true when the gauge and stamina should be refilled (between attempts)
        public bool ObserveChain(bool harpActive,bool dashActive,double gauge,double gaugeMax,int tier,float x,float y,bool dashHold,bool shiftHeld)
        {
            if(!Practising||Step!=PracticeStep.Chain)return false;
            if(chainGauge<0)chainGauge=gaugeMax;
            bool active=harpActive||dashActive;
            if(chainFlight==null&&active&&gauge<chainGauge){chainFlight=new ChainFlight{Tier=tier,Spent=chainGauge-gauge,X=x,Y=y};ChainFeedback="launched:"+tier+":"+(int)Math.Round(chainFlight.Spent);}
            if(chainFlight!=null)
            {
                var f=chainFlight;if(dashActive)f.Pulled=true;
                if(f.Pulled&&Math.Sqrt((x-f.X)*(x-f.X)+(y-f.Y)*(y-f.Y))>=1)f.Moved=true;
                if(!active&&!dashHold&&!shiftHeld)
                {
                    if(f.Tier==ChainTarget&&f.Moved)
                    {
                        ChainDone[ChainTarget]=true;ChainFeedback="complete:"+f.Tier+":"+(int)Math.Round(f.Spent);
                        if(ChainTarget==3){chainFlight=null;chainGauge=gaugeMax;Complete();return true;}
                        ChainTarget++;
                    }
                    else ChainFeedback=f.Tier!=ChainTarget?"wrongTier:"+f.Tier+":"+ChainTarget:"blocked";
                    chainFlight=null;chainGauge=gaugeMax;return true;
                }
            }
            return false;
        }
        // ---- roll (Direction + Space): five rolls, each needs Space pressed with a direction held and then released ----
        public int RollCount {get;private set;}
        bool rollArmed,rollFlight;
        public void ObserveRoll(bool rollActive,bool directionHeld,bool rollKeyHeld)
        {
            if(!Practising||Step!=PracticeStep.Roll)return;
            if(rollFlight){if(!rollActive&&!rollKeyHeld){rollFlight=false;rollArmed=false;}}
            else
            {
                if(!rollArmed&&rollKeyHeld&&directionHeld)rollArmed=true;
                if(rollArmed&&rollActive){RollCount++;rollArmed=false;rollFlight=true;if(RollCount>=5)Complete();}
                else if(rollArmed&&!rollKeyHeld&&!rollActive)rollArmed=false;
            }
        }
        // ---- Rage burst (step 7): 150 ticks of focus on the SPACE slot, then Space alone with 100 Rage ----
        public int FocusTicks;
        public void ObserveRageCast(double amount,bool directionHeld){if(Practising&&Step==PracticeStep.RageBurst&&FocusTicks<=0&&!directionHeld&&amount>=100)Complete();}
        public void End(bool skipped){Skipped=skipped;Phase=FirstPracticePhase.Ended;admitted.Clear();}
    }
}
