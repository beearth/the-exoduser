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
            firstPractice=new FirstPracticeFlow();Simulation.FirstPracticeHit+=OnFirstPracticeHit;
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
            firstPractice.End(skipped);Simulation.FirstPracticeHit-=OnFirstPracticeHit;
            Simulation=practiceSession.End();practiceSession=null;firstPractice=null;practiceActors.Clear();
            ClearPracticeViews();skillInputFence=true;frontendEntryInputFence=true;Running=false;
        }
        void ResetFirstPractice()
        {if(firstPractice!=null){Simulation.FirstPracticeHit-=OnFirstPracticeHit;firstPractice=null;practiceSession=null;practiceActors.Clear();}}
        bool HandleFirstPracticeTick(float x,float y,float aimX,float aimY,bool attack,bool pointerBlocked=false)
        {
            if(firstPractice==null)return false;
            if(firstPractice.Phase==FirstPracticePhase.Intro){if(x!=0||y!=0)firstPractice.Start();else return true;}
            if(firstPractice.Phase==FirstPracticePhase.SupportedComplete)return true;
            firstPractice.Tick();
            practiceSession.PrepareTick();
            if(firstPractice.Phase==FirstPracticePhase.Attack)SupplyFirstPracticeActors();
            float beforeX=Simulation.Player.X,beforeY=Simulation.Player.Y;
            Simulation.Tick(x,y,aimX,aimY,attack&&firstPractice.Phase==FirstPracticePhase.Attack&&!pointerBlocked,false);
            firstPractice.ObserveMovement(beforeX,beforeY,Simulation.Player.X,Simulation.Player.Y,x!=0||y!=0);
            return true;
        }
        void SupplyFirstPracticeActors()
        {
            practiceActors.RemoveAll(e=>!e.Alive);
            for(int i=0;i<48&&practiceActors.Count<3;i++){
                int j=i+firstPractice.LeftKills;double angle=-Math.PI/2+(j%3-1)*.65+(j/3)*Math.PI/4;
                float x=Simulation.Player.X+(float)Math.Cos(angle)*120,y=Simulation.Player.Y+(float)Math.Sin(angle)*120;
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
    }
}
