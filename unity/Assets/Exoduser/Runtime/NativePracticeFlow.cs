using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        FirstPracticeFlow firstPractice;
        FirstPracticeSession practiceSession;
        readonly List<EnemyState> practiceActors=new List<EnemyState>();
        public string FirstPracticeStage {get{return firstPractice==null?"Inactive":firstPractice.Phase.ToString();}}
        public double FirstPracticeDistance {get{return firstPractice==null?0:firstPractice.MoveDistance;}}
        public int FirstPracticeKills {get{return firstPractice==null?0:firstPractice.LeftKills;}}
        public string FirstPracticeStep {get{return firstPractice==null?"Inactive":firstPractice.Step.ToString();}}
        public bool FirstPracticeChargedKill {get{return firstPractice!=null&&firstPractice.FullChargeKill;}}
        void BeginFirstPractice()
        {
            if(firstPractice!=null)return;
            // A separate transient arena preserves the exact original simulation,
            // including five actors, RNG, resources, loot and progression.
            var config=JsonUtility.FromJson<SimulationConfig>(JsonUtility.ToJson(Simulation.Config));
            config.StartX=Simulation.Player.X;config.StartY=Simulation.Player.Y;
            config.ActiveAttack="kiSlash";config.EnemyAiEnabled=false;
            practiceSession=new FirstPracticeSession(Simulation,config);Simulation=practiceSession.Arena;
            Simulation.CanMove=Map.CanMove;Simulation.HasLineOfSight=Map.LineOfSight;Simulation.IsProjectileWall=Map.Blocked;
            firstPractice=new FirstPracticeFlow();Simulation.FirstPracticeHit+=OnFirstPracticeHit;BindPracticeSteps();
            ClearPracticeViews();skillInputFence=true;
        }
        void ClearPracticeViews()
        {
            foreach(var e in enemies.Values){Destroy(e.body.gameObject);Destroy(e.walk.gameObject);}enemies.Clear();damage.Clear();
            kiView?.Reset();impacts?.Reset();sound?.Reset();renderedTick=-1;
            lastX=Simulation.Player.X;lastY=Simulation.Player.Y;walkDistance=0;lastKillCount=Simulation.Kills;
            hud.Refresh(Simulation.Player,Simulation.TickCount,true);UpdateViews();
        }
        void OnFirstPracticeHit(FirstPracticeCombat hit)
        {firstPractice?.ObserveKill(hit.EnemyId,hit.AttackKind,hit.Step,hit.ChargeTier,hit.Killed,hit.FromTick);}
        void EndFirstPractice(bool skipped)
        {
            if(firstPractice==null)return;
            firstPractice.End(skipped);Simulation.FirstPracticeHit-=OnFirstPracticeHit;UnbindPracticeSteps(Simulation);
            Simulation=practiceSession.End();practiceSession=null;firstPractice=null;practiceActors.Clear();
            ClearPracticeViews();skillInputFence=true;frontendEntryInputFence=true;Running=false;
        }
        void ResetFirstPractice()
        {if(firstPractice!=null){Simulation.FirstPracticeHit-=OnFirstPracticeHit;UnbindPracticeSteps(Simulation);firstPractice=null;practiceSession=null;practiceActors.Clear();}}
        // parry-lesson.js allowKey/actions(): which of the weapon, E-slot magic and slot-1 keys reach the arena in each step
        static void PracticeInputAllowed(PracticeStep step,out bool weapon,out bool magic,out bool slot1)
        {weapon=step==PracticeStep.Left;magic=step==PracticeStep.Right;slot1=step==PracticeStep.Trap;}
        bool HandleFirstPracticeTick(float x,float y,float aimX,float aimY,bool attack,bool pointerBlocked=false)
        {
            if(firstPractice==null)return false;
            if(firstPractice.Phase==FirstPracticePhase.Intro){if(x!=0||y!=0)firstPractice.Start();else return true;}
            if(firstPractice.Phase==FirstPracticePhase.Done)return true;
            firstPractice.Tick();
            if((int)firstPractice.Step!=practiceStepSeen&&firstPractice.Practising){practiceStepSeen=(int)firstPractice.Step;OnPracticeStepEnter();}
            practiceDirHeld=x!=0||y!=0;
            practiceSession.PrepareTick(practiceFailTicks>0);
            var step=firstPractice.Step;bool practising=firstPractice.Practising;
            bool weapon,magic,slot1;PracticeInputAllowed(step,out weapon,out magic,out slot1);
            if(!practising){weapon=magic=slot1=false;}
            Simulation.SetMagicInput(magic&&(practiceScripted?scriptMagic:NativeKeyBindInput.Held("beam"))&&!pointerBlocked);
            ApplyStepInputs(step,practising);
            Simulation.SetSkillInput(slot1&&(practiceScripted?scriptSlot1:ExoInput.Key(KeyCode.Alpha1)),false,false,false,practiceSpaceForRage||(practising&&step==PracticeStep.RageBurst&&practiceSpaceForRage),false,false,false,false);
            if(practising)
            {
                if(step==PracticeStep.Left||step==PracticeStep.Right)SupplyFirstPracticeActors();
                else if(step==PracticeStep.Trap){Simulation.PrepareTrapPractice();SupplyTrapActors();Simulation.TickPracticeTrapActors();}
                else if(ParryStep(step))ParryStepTick(step);
                else PrepareStepTick(step);
            }
            float beforeX=Simulation.Player.X,beforeY=Simulation.Player.Y;
            Simulation.Tick(x,y,aimX,aimY,attack&&weapon&&!pointerBlocked,false);
            AfterSimTickParry();
            firstPractice.ObserveMovement(beforeX,beforeY,Simulation.Player.X,Simulation.Player.Y,x!=0||y!=0);
            if(practising)ObserveStepTick(step,practiceScripted?(scriptUp||scriptDown||scriptLeft||scriptRight):DirectionKeysHeld());
            if(step==PracticeStep.Trap)
            {
                var zone=Simulation.PracticeTrapZone();
                firstPractice.ObserveTrap(zone==null?0:zone.Id,zone==null?0:(float)Math.Sqrt((Simulation.Player.X-zone.X)*(Simulation.Player.X-zone.X)+(Simulation.Player.Y-zone.Y)*(Simulation.Player.Y-zone.Y)),x!=0||y!=0);
            }
            return true;
        }
        // spawnAttackEnemies: left = radius 120 (offset by kills), right = radius 220; three alive at once, 40 px apart, one-hit lesson actors
        void SupplyFirstPracticeActors()
        {
            bool left=firstPractice.Step==PracticeStep.Left;
            practiceActors.RemoveAll(e=>!e.Alive);
            if(left?false:firstPractice.RightKills>=FirstPracticeFlow.RightKillGoal)return;
            float radius=left?120:220;
            for(int i=0;i<48&&practiceActors.Count<3;i++){
                int j=i+(left?firstPractice.LeftKills:0);double angle=-Math.PI/2+(j%3-1)*.65+(j/3)*Math.PI/4;
                float x=Simulation.Player.X+(float)Math.Cos(angle)*radius,y=Simulation.Player.Y+(float)Math.Sin(angle)*radius;
                if(!Map.CanMove(x,y,24)||!Map.LineOfSight(Simulation.Player.X,Simulation.Player.Y,x,y))continue;
                bool overlap=false;foreach(var e in practiceActors)if((e.X-x)*(e.X-x)+(e.Y-y)*(e.Y-y)<1600){overlap=true;break;}
                if(overlap)continue;
                var actor=Simulation.SpawnNormalEnemy(x,y);if(actor==null)continue;
                // Exact source spawnAttackEnemies overrides; shield/poise untouched.
                actor.Hp=actor.MaxHp=1;actor.Attack=0;actor.Speed=0;actor.Facing=(float)Math.Atan2(Simulation.Player.Y-y,Simulation.Player.X-x);
                Simulation.RegisterFirstPracticeActor(actor);
                practiceActors.Add(actor);firstPractice.AdmitEnemy(actor.Id);
            }
        }
        // spawnTrapEnemies: ten chasers on an arc 180..260 px away; hp and shield scale so they fall one after another to the trap's damage ticks
        void SupplyTrapActors()
        {
            practiceActors.RemoveAll(e=>!e.Alive);
            int baseDamage=Math.Max(1,Simulation.PracticeSpikeDamage());
            for(int i=0;i<60&&practiceActors.Count<10;i++){
                double angle=-Math.PI/2+(i%10-4.5)*.16+(i/10)*Math.PI/3;float radius=180+(i%3)*40;
                float x=Simulation.Player.X+(float)Math.Cos(angle)*radius,y=Simulation.Player.Y+(float)Math.Sin(angle)*radius;
                if(!Map.CanMove(x,y,24)||!Map.LineOfSight(Simulation.Player.X,Simulation.Player.Y,x,y))continue;
                bool overlap=false;foreach(var e in practiceActors)if((e.X-x)*(e.X-x)+(e.Y-y)*(e.Y-y)<576){overlap=true;break;}
                if(overlap)continue;
                var actor=Simulation.SpawnNormalEnemy(x,y);if(actor==null)continue;
                int hp=(int)Math.Max(1,baseDamage*(5+practiceActors.Count)*.5);
                actor.Hp=actor.MaxHp=hp;actor.Shield=actor.MaxShield=hp;actor.Attack=0;actor.Speed=1.6f;
                actor.Facing=(float)Math.Atan2(Simulation.Player.Y-y,Simulation.Player.X-x);
                Simulation.RegisterFirstPracticeActor(actor,true);
                practiceActors.Add(actor);firstPractice.AdmitEnemy(actor.Id);
            }
        }
    }
}
