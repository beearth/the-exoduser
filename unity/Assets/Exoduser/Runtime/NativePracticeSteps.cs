using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;
namespace Exoduser.UnityPort
{
    // parry-lesson.js steps 4 (Shift chain move), 5 (Direction + Space roll) and 7 (Rage burst) on the existing Core chain / roll / giant slam systems.
    public sealed partial class NativeGame
    {
        bool scriptShift,scriptSpace,practiceDirHeld;
        string practiceHoldLabel="";float practiceHoldValue;
        int practiceStepSeen=-1;
        void BindPracticeSteps(){ResetParryState();Simulation.ParryLessonActive=true;Simulation.RageCastHook+=OnPracticeRageCast;practiceStepSeen=-1;practiceHoldLabel="";practiceHoldValue=0;}
        void UnbindPracticeSteps(Simulation sim){if(sim!=null){sim.RageCastHook-=OnPracticeRageCast;}}
        void OnPracticeRageCast(double amount){firstPractice?.ObserveRageCast(amount,practiceDirHeld);}
        // resetPose(): back to idle with every hold / chain / roll state cleared
        void ResetPracticePose()
        {
            var s=Simulation;s.Player.State="idle";s.Player.StateTicks=0;s.SbParryT=s.SbHoldT=s.SbReleaseR=s.SbCd=0;s.KgChg=0;s.SBashChgMul=1;s.SdHold=0;
            s.DashHold=false;s.DashHoldF=0;s.HarpActive=false;s.DashActive=false;s.Player.KnockbackX=s.Player.KnockbackY=0;s.HarpGauge=s.HarpGaugeMax;
        }
        // a new step starts clean: previous lesson actors, held states, full mobility gauge; the rage step brings its own ring of monsters
        void OnPracticeStepEnter()
        {
            foreach(var a in practiceActors)if(a.Alive)a.Alive=false;practiceActors.Clear();
            ResetPracticePose();ClearLessonShots();ResetParryState();practiceHoldLabel="";practiceHoldValue=0;
            if(firstPractice.Step==PracticeStep.RageBurst){Simulation.GainRage(Math.Max(0,100-Simulation.Rage));SpawnRageEnemies();firstPractice.FocusTicks=150;}
        }
        // spawnRageEnemies: 24 one-hit monsters in two rings (180 / 280 px)
        void SpawnRageEnemies()
        {
            for(int i=0;i<48&&practiceActors.Count<24;i++){
                double a=(i%12)*Math.PI/6+((i/12)%2)*Math.PI/12;float radius=180+((i/12)%2)*100;
                float x=Simulation.Player.X+(float)Math.Cos(a)*radius,y=Simulation.Player.Y+(float)Math.Sin(a)*radius;
                if(!Map.CanMove(x,y,24))continue;
                var actor=Simulation.SpawnNormalEnemy(x,y);if(actor==null)continue;
                actor.Hp=actor.MaxHp=1;actor.Attack=0;actor.Speed=0;actor.Facing=(float)Math.Atan2(Simulation.Player.Y-y,Simulation.Player.X-x);
                Simulation.RegisterFirstPracticeActor(actor);practiceActors.Add(actor);
            }
        }
        static bool DirectionKeysHeld(){return NativeKeyBindInput.Held("up")||NativeKeyBindInput.Held("down")||NativeKeyBindInput.Held("left")||NativeKeyBindInput.Held("right")||ExoInput.Key(KeyCode.UpArrow)||ExoInput.Key(KeyCode.DownArrow)||ExoInput.Key(KeyCode.LeftArrow)||ExoInput.Key(KeyCode.RightArrow);}
        // inputs that reach the arena in these steps (web allowKey: chain = Shift, roll = direction + Space, rage = Space alone once the focus ends)
        void ApplyStepInputs(PracticeStep step,bool practising)
        {
            bool chain=practising&&step==PracticeStep.Chain,roll=practising&&step==PracticeStep.Roll,rage=practising&&step==PracticeStep.RageBurst&&firstPractice.FocusTicks<=0&&!practiceDirHeld;
            bool shift=practiceScripted?scriptShift:NativeKeyBindInput.Held("charge"),space=practiceScripted?scriptSpace:NativeKeyBindInput.HeldKeyboard("roll");
            bool parry=practising&&(step==PracticeStep.ParryMagic||step==PracticeStep.ParryPhysical||step==PracticeStep.HoldMagic||step==PracticeStep.HoldPhysical||step==PracticeStep.RageParry);
            Simulation.SetPlayerCombatInput(parry&&(practiceScripted?scriptQ:NativeKeyBindInput.Held("parry")),parry&&(practiceScripted?scriptE:NativeKeyBindInput.Held("shield")),chain&&shift);
            if(roll)Simulation.SetRollInput(practiceScripted?scriptUp:NativeKeyBindInput.Held("up")||ExoInput.Key(KeyCode.UpArrow),practiceScripted?scriptDown:NativeKeyBindInput.Held("down")||ExoInput.Key(KeyCode.DownArrow),practiceScripted?scriptLeft:NativeKeyBindInput.Held("left")||ExoInput.Key(KeyCode.LeftArrow),practiceScripted?scriptRight:NativeKeyBindInput.Held("right")||ExoInput.Key(KeyCode.RightArrow),space);
            else Simulation.SetRollInput(false,false,false,false,false);
            practiceSpaceForRage=rage&&space;
        }
        bool scriptUp,scriptDown,scriptLeft,scriptRight,practiceSpaceForRage;
        void PrepareStepTick(PracticeStep step)
        {
            switch(step)
            {
                case PracticeStep.Roll:Simulation.HarpGauge=Simulation.HarpGaugeMax;break;
                case PracticeStep.RageBurst:
                    Simulation.GiantSlamCd=0;Simulation.Materials=Math.Max(Simulation.Materials,Simulation.MaliceCost(Exoduser.UnityPort.Core.Skills.SkillRules.GiantSlamMalice));
                    if(firstPractice.FocusTicks>0)firstPractice.FocusTicks--;break;
            }
        }
        void ObserveStepTick(PracticeStep step,bool dirHeld)
        {
            var s=Simulation;
            if(step==PracticeStep.Chain)
            {
                bool shift=practiceScripted?scriptShift:NativeKeyBindInput.Held("charge");
                if(firstPractice.ObserveChain(s.HarpActive,s.DashActive,s.HarpGauge,s.HarpGaugeMax,s.HarpTier,s.Player.X,s.Player.Y,s.DashHold,shift)){s.HarpGauge=s.HarpGaugeMax;}
                UpdateChainHold();
            }
            else if(step==PracticeStep.Roll)firstPractice.ObserveRoll(s.RollActive,dirHeld,practiceScripted?scriptSpace:NativeKeyBindInput.HeldKeyboard("roll"));
        }
        string Seconds(int tier){return (ChainDash.TierHoldFrames[tier]/60f).ToString("0.##");}
        void UpdateChainHold()
        {
            var f=firstPractice;int done=0;for(int t=1;t<=3;t++)if(f.ChainDone[t])done++;
            practiceHoldValue=Mathf.Min(100,(float)(Simulation.DashHoldF/ChainDash.TierHoldFrames[3]*100));
            practiceHoldLabel=Simulation.DashHold?PracticeCopy("chainCharging").Replace("{p0}",Mathf.Max(1,ChainDash.TierForHoldFrames(Simulation.DashHoldF)).ToString()).Replace("{p1}",f.ChainTarget.ToString()):done==3?PracticeCopy("chainAllDone"):PracticeCopy("chainReady").Replace("{p0}",f.ChainTarget.ToString()).Replace("{p1}",Seconds(2)).Replace("{p2}",Seconds(3));
        }
        string ChainHint()
        {
            var f=firstPractice;var marks=new System.Text.StringBuilder();
            for(int t=1;t<=3;t++){if(t>1)marks.Append(" · ");marks.Append(PracticeCopy("chainTierMark").Replace("{p0}",f.ChainDone[t]?"✓":"□").Replace("{p1}",t.ToString()));}
            int done=0;for(int t=1;t<=3;t++)if(f.ChainDone[t])done++;
            string instruction=f.ChainTarget==1?PracticeCopy("chainI1").Replace("{p0}",Seconds(2)):f.ChainTarget==2?PracticeCopy("chainI2").Replace("{p0}",Seconds(2)).Replace("{p1}",Seconds(3)):PracticeCopy("chainI3").Replace("{p0}",Seconds(3));
            string line=done==3?PracticeCopy("chainAll"):PracticeCopy("chainNow").Replace("{p0}",f.ChainTarget.ToString()).Replace("{p1}",instruction);
            string fb="";
            if(!string.IsNullOrEmpty(f.ChainFeedback)){
                var p=f.ChainFeedback.Split(':');
                fb=p[0]=="launched"?PracticeCopy("chainLaunched").Replace("{p0}",p[1]).Replace("{p1}",p[2]):p[0]=="complete"?PracticeCopy("chainComplete").Replace("{p0}",p[1]).Replace("{p1}",p[2]):p[0]=="wrongTier"?PracticeCopy("chainWrongTier").Replace("{p0}",p[1]).Replace("{p1}",p[2]):PracticeCopy("chainBlocked");
            }
            return marks+"\n"+line+"\n"+fb;
        }
        // rage focus overlay (#lessonRageZoom): points at the SPACE slot for the first 150 ticks; the panel hides meanwhile
        void DrawRageFocus()
        {
            if(firstPractice==null||firstPractice.Step!=PracticeStep.RageBurst||firstPractice.FocusTicks<=0||!firstPractice.Practising)return;
            const float cx=1194,top=860;
            var shadow=LessonStyle(14,TextAnchor.MiddleCenter,new Color(0,0,0,.9f),false,true);var text=LessonStyle(14,TextAnchor.MiddleCenter,Hex(0xffe4c7),false,true);var big=LessonStyle(29,TextAnchor.MiddleCenter,Hex(0xffe4c7),true,false);var bigShadow=LessonStyle(29,TextAnchor.MiddleCenter,new Color(0,0,0,.9f),true,false);
            string a=PracticeCopy("rageFocusA"),b=PracticeCopy("rageFocusB"),z=PracticeCopy("rageZoom").Replace("{p0}",Mathf.FloorToInt((float)Simulation.Rage).ToString());
            var ra=new Rect(cx-140,top,280,22);var rz=new Rect(cx-140,top+24,280,40);var rb=new Rect(cx-140,top+68,280,44);
            NativeUiAudit.Label(new Rect(ra.x+1,ra.y+1,ra.width,ra.height),a,shadow);NativeUiAudit.Label(ra,a,text);NativeUiAudit.Label(new Rect(rz.x+1,rz.y+1,rz.width,rz.height),z,bigShadow);NativeUiAudit.Label(rz,z,big);NativeUiAudit.Label(new Rect(rb.x+1,rb.y+1,rb.width,rb.height),b,shadow);NativeUiAudit.Label(rb,b,text);
            var arrow=LessonStyle(30,TextAnchor.MiddleCenter,Hex(0xffe49c),true);NativeUiAudit.Label(new Rect(cx-20,top+112+Mathf.Sin(Time.unscaledTime*6)*4,40,36),"↓",arrow);
        }
    }
}
