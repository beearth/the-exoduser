using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;
namespace Exoduser.UnityPort
{
    // parry-lesson.js steps 0..3 and 6: the lesson only stages the enemy (ring telegraph, fire timing, volleys) and the retry rules. Bullet flight, the parry decision, the reflection
    // into a blue bean, its homing and its blast are the Core's (ParryReflect / Simulation.Reflect*), as for any enemy bullet.
    public sealed partial class NativeGame
    {
        sealed class LessonShot {public int Id;public ReflectProjectile P=new ReflectProjectile();public bool Magic,Alive=true;public int ColorRgb;public float Size=1;}
        bool scriptQ,scriptE;
        EnemyState parryEnemy;LessonShot parryShot;int parryCooldown,parryCharge,practiceFailTicks,volleyRetryTicks,rageClearTicks,lessonShotIds;bool parryHoldStarted,practiceMissed;
        string prevPlayerState="idle";double prevHoldT,prevKgChg;
        readonly List<LessonShot> lessonShots=new List<LessonShot>(),volleyShots=new List<LessonShot>();
        static readonly string[] MagicKinds={"화염","물","암흑","번개","무지개"},PhysicalKinds={"이빨입탄","혈안탄","관통탄","물리 검기파","물리 환영검"};
        static readonly int[] MagicColors={0xff4422,0x55bbff,0xa44cff,0xffee55,0xff44ff},PhysicalColors={0xcc1100,0xff2233,0x889999,0xcc1100,0xf4f4f4};
        static readonly float[] PhysicalSizes={1.5f,6.4f,3f,1.5f,2f};
        public bool PracticeMissed {get{return practiceMissed;}}
        bool ParryStep(PracticeStep step){return step==PracticeStep.ParryMagic||step==PracticeStep.ParryPhysical||step==PracticeStep.HoldMagic||step==PracticeStep.HoldPhysical||step==PracticeStep.RageParry;}
        void ResetParryState()
        {
            parryEnemy=null;parryShot=null;lessonShots.Clear();volleyShots.Clear();practiceFailTicks=0;volleyRetryTicks=0;rageClearTicks=0;parryHoldStarted=false;practiceMissed=false;parryCooldown=45;parryCharge=0;prevPlayerState="idle";prevHoldT=prevKgChg=0;
        }
        void ClearLessonShots(){lessonShots.Clear();volleyShots.Clear();parryShot=null;firstPractice?.ResetVolley();}
        // web element ids EL = {P:0,F:1,I:2,D:3,L:4}; bean flags per the lesson's type tables (fireVolley)
        LessonShot SpawnLessonShot(double x,double y,double vx,double vy,bool magic,int el,int rgb,float size,Action<ReflectProjectile> flags=null,string parryClass="")
        {
            var s=new LessonShot{Id=++lessonShotIds,Magic=magic,ColorRgb=rgb,Size=size};var p=s.P;
            p.X=x;p.Y=y;p.Vx=vx;p.Vy=vy;p.Dmg=0;p.Life=p.Ml=420;p.El=el;p.Sz=size;p.Col="#"+rgb.ToString("x6");p.ParryClass=parryClass;p.Homing=true;
            if(flags!=null)flags(p);lessonShots.Add(s);return s;
        }
        // parry-lesson.js spawnParryEnemy: eight candidate slots 280 px around the player, 160..450 px away
        void SpawnParryEnemy()
        {
            if(parryEnemy!=null&&parryEnemy.Alive)parryEnemy.Alive=false;
            practiceActors.RemoveAll(a=>!a.Alive);parryEnemy=null;parryShot=null;
            for(int i=0;i<8;i++){
                double a=-Math.PI/2+i*Math.PI/4;float x=Simulation.Player.X+(float)Math.Cos(a)*280,y=Simulation.Player.Y+(float)Math.Sin(a)*280;
                if(!Map.CanMove(x,y,24))continue;
                var actor=Simulation.SpawnNormalEnemy(x,y);if(actor==null)continue;
                actor.Hp=actor.MaxHp=1;actor.Attack=0;actor.Speed=0;actor.Facing=(float)Math.Atan2(Simulation.Player.Y-y,Simulation.Player.X-x);
                Simulation.RegisterFirstPracticeActor(actor);practiceActors.Add(actor);parryEnemy=actor;parryCharge=0;return;
            }
        }
        // tickParryEnemy: 45 ticks wait, 60 ticks ring charge, then a speed-3 shot of the step's class aimed at the player
        void TickParryEnemy()
        {
            bool magic=firstPractice.Step==PracticeStep.ParryMagic;
            if(parryEnemy==null||!parryEnemy.Alive){ClearLessonShots();SpawnParryEnemy();if(parryEnemy==null){parryCooldown=60;return;}}
            var e=parryEnemy;e.Facing=(float)Math.Atan2(Simulation.Player.Y-e.Y,Simulation.Player.X-e.X);
            if(parryShot!=null&&parryShot.Alive)return;
            if(parryShot!=null){parryShot=null;if(!firstPractice.ParriedShot){ResetPracticePose();parryCooldown=60;}return;}
            if(parryCharge>0){
                if(--parryCharge>0)return;
                float ang=e.Facing;
                parryShot=SpawnLessonShot(e.X,e.Y,Math.Cos(ang)*3,Math.Sin(ang)*3,magic,magic?3:0,magic?0xb26dff:0xf4f4f4,1,null,"");
                parryShot.P.Life=parryShot.P.Ml=360;firstPractice.RegisterParryShot(parryShot.Id);return;
            }
            if(--parryCooldown<=0)parryCharge=60;
        }
        // fireVolley: five (ten for the rage step) shots 800 px out on a 0.64 rad fan, all arriving together; the type tables are the lesson's
        void FireVolley(PracticeStep step)
        {
            bool q=step==PracticeStep.HoldMagic||step==PracticeStep.RageParry;
            double baseAngle=q?-Math.PI/2:Simulation.Player.Facing;float speed=q?4.8f:6.4f;int count=step==PracticeStep.RageParry?10:5;
            volleyShots.Clear();firstPractice.ResetVolley();
            for(int i=0;i<count;i++){
                double a=baseAngle+(i/(double)(count-1)-.5)*.64;int k=i%5;
                double x=Simulation.Player.X+Math.Cos(a)*800,y=Simulation.Player.Y+Math.Sin(a)*800,vx=-Math.Cos(a)*speed,vy=-Math.Sin(a)*speed;LessonShot s;
                if(q)
                {
                    Action<ReflectProjectile> f=null;
                    switch(k){case 0:f=p=>p.FireMagic=true;break;case 1:f=p=>p.WaterBean=true;break;case 2:f=p=>p.GbBean=true;break;case 4:f=p=>p.BlackBean=true;break;}
                    s=SpawnLessonShot(x,y,vx,vy,true,k==0?1:k==1?2:k==2?3:k==3?4:0,MagicColors[k],1,f,"magic");
                }
                else
                {
                    Action<ReflectProjectile> f=null;
                    switch(i){case 0:f=p=>p.RedBean=true;break;case 1:f=p=>{p.TitanEye=true;p.R=12;};break;case 3:f=p=>{p.RedBean=true;p.SwordWave=true;};break;case 4:f=p=>{p.RedBean=true;p.PhantomSword=true;};break;}
                    s=SpawnLessonShot(x,y,vx,vy,false,i==1?1:0,PhysicalColors[i],PhysicalSizes[i],f,"");
                }
                s.P.Life=s.P.Ml=420;volleyShots.Add(s);firstPractice.RegisterVolleyShot(s.Id);
            }
        }
        void RetryVolley(){ClearLessonShots();ResetPracticePose();volleyRetryTicks=60;practiceHoldValue=0;practiceHoldLabel=PracticeCopy("holdRetry");}
        // watchHold
        void WatchHold(PracticeStep step)
        {
            if(volleyRetryTicks>0){volleyRetryTicks--;return;}
            bool q=step==PracticeStep.HoldMagic;var p=Simulation.Player;
            bool holding=q?p.State=="sBlock":p.State=="sDraw"||p.State=="kiGather";
            double amount=q?Simulation.SbHoldT:Simulation.KgChg,target=q?120:180;
            if(holding&&!parryHoldStarted){parryHoldStarted=true;FireVolley(step);}
            if(firstPractice.VolleyFailed){RetryVolley();return;}
            if(firstPractice.VolleyReleased){if(--firstPractice.ReleaseTicks<=0&&firstPractice.Practising)RetryVolley();return;}
            if(holding){practiceHoldValue=Mathf.Min(100,Mathf.Floor((float)(amount/target*100)));practiceHoldLabel=amount>=target?PracticeCopy("holdNow"):PracticeCopy("holdCharge").Replace("{p0}",((int)practiceHoldValue).ToString());}
            else if(!parryHoldStarted){practiceHoldValue=0;practiceHoldLabel=PracticeCopy("holdTry");}
            bool incoming=false;foreach(var s in volleyShots)if(s.Alive&&!s.P.Friendly)incoming=true;
            if(parryHoldStarted&&(!holding||!incoming))RetryVolley();
        }
        // rage step tick: volleys fire on their own (45 ticks after the last one cleared), the step ends when something was parried and Rage is 100
        void RageParryTick()
        {
            practiceHoldValue=Mathf.Min(100,(float)Simulation.Rage);practiceHoldLabel=PracticeCopy("rageBox").Replace("{p0}",Mathf.FloorToInt((float)Simulation.Rage).ToString());
            firstPractice.ObserveRage(Simulation.Rage);if(!firstPractice.Practising)return;
            if(volleyShots.Count>0){
                bool incoming=false;foreach(var s in volleyShots)if(s.Alive&&!s.P.Friendly)incoming=true;
                if(incoming)return;
                if(rageClearTicks==0)rageClearTicks=45;
                if(--rageClearTicks>0)return;
                ClearLessonShots();ResetPracticePose();parryCooldown=60;
            }
            if(--parryCooldown<=0){FireVolley(PracticeStep.RageParry);rageClearTicks=0;if(volleyShots.Count==0)parryCooldown=60;}
        }
        // lesson tick for the parry steps; the failure pause (60 ticks) keeps HP down until it ends (web failTicks)
        void ParryStepTick(PracticeStep step)
        {
            if(practiceFailTicks>0){
                ClearLessonShots();
                if(--practiceFailTicks<=0){practiceMissed=false;ResetPracticePose();parryCooldown=45;volleyRetryTicks=0;parryHoldStarted=false;}
                return;
            }
            if(step==PracticeStep.ParryMagic||step==PracticeStep.ParryPhysical)TickParryEnemy();
            else if(step==PracticeStep.HoldMagic||step==PracticeStep.HoldPhysical)WatchHold(step);
            else if(step==PracticeStep.RageParry)RageParryTick();
        }
        // after Simulation.Tick: hold releases (state transitions, with the increment of the release tick), then the shots
        void AfterSimTickParry()
        {
            var s=Simulation;string now=s.Player.State;
            if(firstPractice.Practising){
                if(prevPlayerState=="sBlock"&&now!="sBlock")firstPractice.ObserveHoldRelease(true,prevHoldT+1);
                if(prevPlayerState=="kiGather"&&now!="kiGather")firstPractice.ObserveHoldRelease(false,prevKgChg+2);
            }
            prevPlayerState=now;prevHoldT=s.SbHoldT;prevKgChg=s.KgChg;
            TickLessonShots();
        }
        void LessonMiss(bool absorbed)
        {
            if(practiceFailTicks>0||!firstPractice.Practising)return;
            var s=Simulation;int damage=(int)Math.Min(Math.Max(0,s.Player.Hp-1),Math.Max(1,Math.Ceiling(s.Player.MaxHp*.1)));
            s.Player.Hp-=damage;s.ShakeAmount=Math.Max(s.ShakeAmount,7);s.HitFlashAlpha=Math.Min(.5f,s.HitFlashAlpha+.175f);s.HitFlashColor="#ff4422";
            practiceFailTicks=60;practiceMissed=true;
            if(firstPractice.Step==PracticeStep.HoldMagic||firstPractice.Step==PracticeStep.HoldPhysical)firstPractice.ForceVolleyFail();
        }
        void TickLessonShots()
        {
            var sim=Simulation;
            for(int i=lessonShots.Count-1;i>=0;i--)
            {
                var s=lessonShots[i];if(!s.Alive){lessonShots.RemoveAt(i);continue;}var p=s.P;
                if(p.Friendly)
                {
                    // reflected: the Core steers it, moves it, and blasts when it touches an enemy
                    sim.ReflectHoming(p);p.X+=p.Vx;p.Y+=p.Vy;p.Life--;
                    if(sim.ReflectContact(p)){s.Alive=false;if(parryEnemy==null||!parryEnemy.Alive)firstPractice.ObserveReflectKill(s.Id);}
                    else if(p.Life<=0)s.Alive=false;
                    continue;
                }
                double oldX=p.X,oldY=p.Y;p.X+=p.Vx;p.Y+=p.Vy;p.Life--;
                var pl=sim.Player;double dx=p.X-pl.X,dy=p.Y-pl.Y,dist=Math.Sqrt(dx*dx+dy*dy);
                if(p.Life<=0||dist>1200&&(p.Vx*dx+p.Vy*dy)>0){s.Alive=false;continue;}
                double sx=p.X-oldX,sy=p.Y-oldY,sl2=sx*sx+sy*sy;
                if(sl2>1){double t=Math.Max(0,Math.Min(1,(sx*(pl.X-oldX)+sy*(pl.Y-oldY))/sl2));double cx=oldX+sx*t-pl.X,cy=oldY+sy*t-pl.Y;dist=Math.Min(dist,Math.Sqrt(cx*cx+cy*cy));}
                var ri=sim.ReflectInput(dist);double pCollR=pl.Radius+(p.Sz>0?p.Sz:1)*3;
                var g=ParryRules.ComputeGate(new ParryRules.GateInput{S=ri.S,St2=ri.St2,KiParryT=0,SbParryT=ri.SbParryT,SbReleaseR=ri.SbReleaseR,SBashChgMul=ri.SBashChgMul,Detonate=ri.Detonate,MaliceSwipe=ri.MaliceSwipe,ShieldThrow=ri.ShieldThrow,BonusRange=0,PParry=ri.PParry,ParryBonus=ri.ParryBonus,WRange=ri.WRange,WpBonusRange=0,PCollR=pCollR});
                var zone=ri.S=="sBlock"?ParryRules.SBlockProjectileZone(dist,ri.SbParryT):g.ReleasePW&&dist<=ri.SbReleaseR?ParryRules.Zone.Parry:ParryRules.Zone.None;
                bool qParryActive=g.AnyPW||zone==ParryRules.Zone.Parry;
                bool correct=s.Magic?qParryActive:g.SbActive,wrong=s.Magic?g.SbActive&&!qParryActive:ri.S=="sBlock"&&ri.SbParryT>0&&!g.SbActive;
                // web lesson branch: a wrong input within 100 px, or touching without the right parry, is a miss; so is the Q absorb zone (<= 20 px)
                if((wrong&&dist<ParryReflect.WrongInputRadius)||(!correct&&dist<pCollR+4)){s.Alive=false;LessonMiss(zone==ParryRules.Zone.Absorb);continue;}
                var r=ParryReflect.Resolve(p,ri);
                if(r.Outcome==ReflectOutcome.Reflect)
                {
                    firstPractice.ObserveParry(s.Id,s.Magic,ri.S,ri.SbReleaseR,ri.SbParryT,ri.SBashChgMul);
                    sim.PayReflectParry(r);
                }
                else if(r.Outcome==ReflectOutcome.Absorb||r.Outcome==ReflectOutcome.Consumed){s.Alive=false;LessonMiss(r.Outcome==ReflectOutcome.Absorb);}
            }
        }
        // shots + ring telegraph as GUI discs (world -> screen px through ToGUI)
        void DrawPracticeShots()
        {
            if(firstPractice==null||Simulation==null)return;
            float k=ToGUI(1,0).x-ToGUI(0,0).x;
            foreach(var s in lessonShots){
                if(!s.Alive)continue;var g=ToGUI((float)s.P.X,(float)s.P.Y);float r=Mathf.Max(7,6+s.Size*3)*k;
                Color c=s.P.Friendly?Hex(0x00e5ff):s.ColorRgb!=0?Hex(s.ColorRgb):Hex(0xb26dff);
                Fill(new Rect(g.x-r*1.9f,g.y-r*1.9f,r*3.8f,r*3.8f),new Color(c.r,c.g,c.b,.16f));Fill(new Rect(g.x-r*1.3f,g.y-r*1.3f,r*2.6f,r*2.6f),new Color(c.r,c.g,c.b,.35f));Fill(new Rect(g.x-r*.8f,g.y-r*.8f,r*1.6f,r*1.6f),c);Fill(new Rect(g.x-r*.35f,g.y-r*.35f,r*.7f,r*.7f),new Color(1,1,1,.9f));
            }
            if(parryEnemy!=null&&parryEnemy.Alive&&parryCharge>0&&(firstPractice.Step==PracticeStep.ParryMagic||firstPractice.Step==PracticeStep.ParryPhysical)){
                var g=ToGUI(parryEnemy.X,parryEnemy.Y);float prog=1f-parryCharge/60f;
                Color rc=firstPractice.Step==PracticeStep.ParryMagic?Hex(0xb26dff):Hex(0xf4f4f4);int n=Mathf.Max(1,Mathf.RoundToInt(48*prog));
                for(int i=0;i<n;i++){float a=-Mathf.PI/2+i*Mathf.PI*2/48f;Fill(new Rect(g.x+Mathf.Cos(a)*34*k-2,g.y+Mathf.Sin(a)*34*k-2,4,4),new Color(rc.r,rc.g,rc.b,.9f));}
            }
        }
    }
}
