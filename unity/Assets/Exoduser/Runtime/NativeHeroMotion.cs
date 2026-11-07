using System;
#if UNITY_5_3_OR_NEWER
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Exoduser.UnityPort.Core;
#endif
namespace Exoduser.UnityPort
{
    // Original warrior-bat-swing.js frame(), including the .85-speed follow-through during recovery.
    public static class NativeHeroSpriteMotion
    {
        const double Speed=.85;
        public static bool UsesAttackSheet(string state) => state=="wWindup"||state=="wSwing"||state=="wRecover"||state=="sBash"||state=="sRecover";
        public static int Frame(string state,double left,double windupTicks,double recoveryTicks)
        {
            if(state=="wWindup")return BaseFrame(state,windupTicks-(windupTicks-left)*Speed,windupTicks,recoveryTicks);
            bool bash=state=="sBash"||state=="sRecover";double duration=bash?20:5;
            if(state=="wSwing"||state=="sBash")return BaseFrame(state,duration-(duration-left)*Speed,windupTicks,recoveryTicks);
            if(left<=0)return 8;
            double recovery=Math.Max(1,recoveryTicks),elapsed=recovery-left,delay=duration*(1/Speed-1);
            if(elapsed<delay)return BaseFrame(bash?"sBash":"wSwing",duration-(duration+elapsed)*Speed,windupTicks,recoveryTicks);
            return BaseFrame(state,left,windupTicks,Math.Max(.001,recovery-delay));
        }
        static int BaseFrame(string state,double left,double windupTicks,double recoveryTicks)
        {
            double Clamp(double value)=>Math.Max(0,Math.Min(1,value));
            if(state=="wWindup")return Math.Min(2,(int)Math.Floor(Clamp(1-left/Math.Max(1,windupTicks))*3));
            if(state=="wSwing")return Math.Min(6,2+(int)Math.Floor(Math.Max(0,5-left)));
            if(state=="sBash"){double elapsed=20-left;return elapsed<2?0:elapsed<4?1:elapsed<7?2:elapsed<8?3:elapsed<11?4:elapsed<14?5:6;}
            double progress=Clamp(1-left/Math.Max(1,recoveryTicks));return progress<.45?6:progress<.8?7:8;
        }
    }
    public sealed class RigPixelLocomotionClock
    {
        int lastTick=-1;double lastX,lastZ,phase;
        public float Phase => (float)phase;
        public void Reset(){lastTick=-1;phase=0;}
        public float Observe(int tick,double x,double z,double modelUnitsPerWorld,double stride,bool moving)
        {
            if(lastTick<0||tick<lastTick){lastTick=tick;lastX=x;lastZ=z;phase=0;return 0;}
            if(tick==lastTick)return Phase;
            double dx=x-lastX,dz=z-lastZ;lastTick=tick;lastX=x;lastZ=z;
            double distance=Math.Sqrt(dx*dx+dz*dz)*modelUnitsPerWorld;
            if(moving&&distance>=0&&distance<=2.5&&stride>.01&&!double.IsInfinity(stride))phase=(phase+distance/stride)%1;
            return Phase;
        }
    }
    public sealed class RigPixelTurnClock
    {
        int lastTick=-1;float lastTarget,offset;
        public float Offset => offset;
        public float Lead => Math.Max(-55,Math.Min(55,-offset));
        public void Reset(){lastTick=-1;offset=0;}
        static float Wrap(float angle){angle%=360;if(angle>180)angle-=360;if(angle< -180)angle+=360;return angle;}
        public float Observe(int tick,float target,bool canLag)
        {
            if(float.IsNaN(target)||float.IsInfinity(target))return offset;
            if(lastTick<0||tick<lastTick||!canLag){lastTick=tick;lastTarget=target;offset=0;return 0;}
            if(tick==lastTick)return offset;
            offset=Wrap(offset-Wrap(target-lastTarget));float step=12*(tick-lastTick);
            offset=offset>0?Math.Max(0,offset-step):Math.Min(0,offset+step);
            lastTarget=target;lastTick=tick;return offset;
        }
    }
    public enum HeroMotionKind { Idle,Run,Roll,Swing,Recover,Charge,SlamWindup,SlamStrike,SlamRecover,Cast,Hurt,Dead,Guard,Bash,BashRecover,Chain }
    public struct HeroMotionInput
    {
        public string State;
        public int Tick,Combo,SkillCastCount;
        public float RemainingTicks,RollRemaining,EffectiveHealth,Charge;
        public bool Rolling,Moving,KiAttack,Chain,ChainPull;
        public bool BasicWindup;   // D-MO-2: Core PlayerState.BasicWindup (first-strike windup, not the ki charge)
    }
    public struct HeroMotionSample { public HeroMotionKind Kind; public float Phase,ContactPhase; public int Combo; }
    public struct HeroBodyWeight
    {
        public bool Active;
        public float Side,Forward,Drop,PelvisYaw,ChestYaw,ChestPitch;
        public HeroBodyWeight(float side,float forward,float drop,float pelvisYaw,float chestYaw,float chestPitch)
        {Active=true;Side=side;Forward=forward;Drop=drop;PelvisYaw=pelvisYaw;ChestYaw=chestYaw;ChestPitch=chestPitch;}
    }
    public struct HeroSlamPose
    {
        public float HandX,HandY,HandZ,BladeX,BladeY,BladeZ,Lower;
        public HeroSlamPose(float handX,float handY,float handZ,float bladeX,float bladeY,float bladeZ,float lower)
        {HandX=handX;HandY=handY;HandZ=handZ;BladeX=bladeX;BladeY=bladeY;BladeZ=bladeZ;Lower=lower;}
    }
    public struct HeroFootwork
    {
        public float LeftPitch,LeftYaw,RightPitch,RightYaw;
    }
    public sealed class NativeHeroMotionClock
    {
        int lastTick=-1,enteredTick,deathTick,skillTick=-1000,hurtTick=-1000,lastCast,basicCombo,chainTick;
        string previousState;
        float previousHealth,recoveryLength=1;
        bool initialized,wasDying,wasChain;
        public void Reset() { initialized=false;wasDying=wasChain=false;lastTick=-1;previousState=null;skillTick=hurtTick=-1000;basicCombo=0; }
        static float Clamp(float v) => float.IsNaN(v)||float.IsInfinity(v)?0:Math.Max(0,Math.Min(1,v));
        static float Smooth(float t){t=Clamp(t);return t*t*(3-2*t);}
        public static float PoseWeight(HeroMotionSample sample)
        {
            float t=Clamp(sample.Phase);
            switch(sample.Kind)
            {
                case HeroMotionKind.Idle:case HeroMotionKind.Run:return 0;
                case HeroMotionKind.Recover:case HeroMotionKind.BashRecover:case HeroMotionKind.SlamRecover:return 1-Smooth((t-.5f)*2);
                case HeroMotionKind.Cast:case HeroMotionKind.Roll:return t<=0||t>=1?0:(float)Math.Sin(t*Math.PI);
                case HeroMotionKind.Hurt:return 1-Smooth(t);
                default:return 1;
            }
        }
        public static float RollLowering(float phase)
        {
            float t=Clamp(phase);if(t<=0||t>=1)return 0;
            float wave=(float)Math.Sin(t*Math.PI);return .20f*wave*wave;
        }
        public static float LocomotionTime(int coreTick,float clipSeconds,bool moving)
        {
            if(!moving||coreTick<=0||float.IsNaN(clipSeconds)||float.IsInfinity(clipSeconds)||clipSeconds<=0)return 0;
            return (float)((coreTick/(60d*clipSeconds))%1d);
        }
        public static float RollTuckWeight(float phase)
        {
            float t=Clamp(phase);return Smooth(t/.15f)*Smooth((1-t)/.15f);
        }
        public static void TuckFootOffset(float legLength,out float down,out float back)
        {
            float length=float.IsNaN(legLength)||float.IsInfinity(legLength)?0:Math.Max(0,legLength);
            down=length*.20f;back=length*.10f;
        }
        static HeroBodyWeight WeightLerp(HeroBodyWeight a,HeroBodyWeight b,float t)
        {
            t=Smooth(t);float Mix(float x,float y){return x+(y-x)*t;}
            return new HeroBodyWeight(Mix(a.Side,b.Side),Mix(a.Forward,b.Forward),Mix(a.Drop,b.Drop),Mix(a.PelvisYaw,b.PelvisYaw),Mix(a.ChestYaw,b.ChestYaw),Mix(a.ChestPitch,b.ChestPitch));
        }
        static HeroBodyWeight SwingWeight(int combo,float phase,float contact)
        {
            HeroBodyWeight start,hit,end;
            if(combo==3)
            {
                start=new HeroBodyWeight(.015f,-.065f,.015f,-3,-3,-18);
                hit=new HeroBodyWeight(0,.09f,.025f,0,0,22);
                end=new HeroBodyWeight(0,.055f,.020f,1,1,12);
            }
            else
            {
                float side=combo==2?1:-1;
                start=new HeroBodyWeight(-side*.06f,-.045f,.015f,-side*6,-side*14,-6);
                hit=new HeroBodyWeight(side*.03f,.08f,.025f,side*7,side*15,12);
                end=new HeroBodyWeight(side*.07f,.055f,.015f,side*8,side*16,-5);
            }
            if(contact>0&&phase<contact)return WeightLerp(start,hit,phase/contact);
            return WeightLerp(hit,end,(phase-contact)/Math.Max(.01f,1-contact));
        }
        static HeroBodyWeight BashWeight(float phase)
        {
            var start=new HeroBodyWeight(.03f,-.055f,.015f,-4,-10,-12);
            var hit=new HeroBodyWeight(-.015f,.09f,.025f,5,12,18);
            var end=new HeroBodyWeight(-.025f,.065f,.015f,7,12,8);
            return phase<.4f?WeightLerp(start,hit,phase/.4f):WeightLerp(hit,end,(phase-.4f)/.6f);
        }
        public static HeroBodyWeight BodyWeight(HeroMotionSample sample)
        {
            float t=Clamp(sample.Phase);var zero=new HeroBodyWeight(0,0,0,0,0,0);
            var slamImpact=new HeroBodyWeight(0,.09f,.025f,0,0,22);
            var slamCompressed=new HeroBodyWeight(0,.095f,.030f,1,1,25);
            var slamRebound=new HeroBodyWeight(0,.04f,.010f,1,1,8);
            switch(sample.Kind)
            {
                case HeroMotionKind.Swing:return SwingWeight(sample.Combo,t,Clamp(sample.ContactPhase));
                case HeroMotionKind.Recover:return WeightLerp(SwingWeight(sample.Combo,1,Clamp(sample.ContactPhase)),zero,t);
                case HeroMotionKind.Bash:return BashWeight(t);
                case HeroMotionKind.BashRecover:return WeightLerp(BashWeight(1),zero,t);
                case HeroMotionKind.SlamWindup:return WeightLerp(slamImpact,slamCompressed,t);
                case HeroMotionKind.SlamStrike:return WeightLerp(slamCompressed,slamRebound,t);
                case HeroMotionKind.SlamRecover:return WeightLerp(slamRebound,zero,t);
                case HeroMotionKind.Chain:return new HeroBodyWeight(0,.06f*t,.06f*t,0,0,22*t);
                default:return default(HeroBodyWeight);
            }
        }
        public static HeroFootwork Footwork(HeroMotionSample sample,bool moving)
        {
            if(moving||(sample.Combo!=1&&sample.Combo!=2))return default(HeroFootwork);
            float t=Clamp(sample.Phase),amount;
            if(sample.Kind==HeroMotionKind.Swing)
            {
                float contact=Clamp(sample.ContactPhase);
                amount=contact>0&&t<contact?Smooth(t/contact):1-.35f*Smooth((t-contact)/Math.Max(.01f,1-contact));
            }
            else if(sample.Kind==HeroMotionKind.Recover)amount=.65f*(1-Smooth(t));
            else return default(HeroFootwork);
            // 첫 베기는 왼발, 되베기는 오른발로 지지한다. 뒷발의 발끝을 고정한 작은 회전만 허용한다.
            return sample.Combo==1?new HeroFootwork{RightPitch=12*amount,RightYaw=-16*amount}:new HeroFootwork{LeftPitch=12*amount,LeftYaw=16*amount};
        }
        static HeroSlamPose SlamLerp(HeroSlamPose a,HeroSlamPose b,float t)
        {
            t=Smooth(t);float Mix(float x,float y){return x+(y-x)*t;}
            return new HeroSlamPose(Mix(a.HandX,b.HandX),Mix(a.HandY,b.HandY),Mix(a.HandZ,b.HandZ),Mix(a.BladeX,b.BladeX),Mix(a.BladeY,b.BladeY),Mix(a.BladeZ,b.BladeZ),Mix(a.Lower,b.Lower));
        }
        public static HeroSlamPose SlamPose(HeroMotionSample sample)
        {
            // Core는 gSlamWindup 진입과 동시에 피해·타격음·파동을 낸다. 상태 이름은 예비 동작이 아니다.
            var impact=new HeroSlamPose(.04f,1.20f,.38f,0,-.78f,.63f,.10f);
            var compressed=new HeroSlamPose(.04f,1.17f,.40f,0,-.80f,.60f,.12f);
            var rebound=new HeroSlamPose(.08f,1.30f,.30f,.04f,-.38f,.92f,.04f);
            var readyPose=new HeroSlamPose(.24f,1.18f,.23f,.20f,.28f,.94f,0);
            switch(sample.Kind)
            {
                case HeroMotionKind.SlamWindup:return SlamLerp(impact,compressed,sample.Phase);
                case HeroMotionKind.SlamStrike:return SlamLerp(compressed,rebound,sample.Phase);
                case HeroMotionKind.SlamRecover:return SlamLerp(rebound,readyPose,sample.Phase);
                default:return default(HeroSlamPose);
            }
        }
        public static float BladeContactLift(HeroMotionKind kind,float tipHeight,float phase=0)
        {
            if(kind!=HeroMotionKind.SlamWindup||float.IsNaN(tipHeight)||float.IsInfinity(tipHeight))return 0;
            float strength=1-Smooth((Clamp(phase)-.25f)/.75f);
            return (.01f-tipHeight)*strength;
        }
        public HeroMotionSample Evaluate(HeroMotionInput q)
        {
            if(initialized&&q.Tick<lastTick)Reset();
            bool fresh=!initialized;
            if(q.Chain&&!wasChain)chainTick=q.Tick;wasChain=q.Chain;
            if(fresh){previousHealth=q.EffectiveHealth;lastCast=q.SkillCastCount;previousState=null;}
            bool dying=q.State=="dead"||q.State=="fallen"||q.EffectiveHealth<=0;
            if(dying&&!wasDying)deathTick=q.Tick;
            wasDying=dying;
            if(q.State!=previousState)
            {
                enteredTick=q.Tick;
                if(q.State=="wRecover"||q.State=="sRecover")recoveryLength=Math.Max(1,q.RemainingTicks);
                if(q.State=="wSwing"&&!q.KiAttack)basicCombo=basicCombo%3+1;
            }
            if(!fresh&&q.Tick!=lastTick)
            {
                if(q.EffectiveHealth<previousHealth-.001f)hurtTick=q.Tick;
                if(q.SkillCastCount!=lastCast)skillTick=q.Tick;
            }
            previousState=q.State;previousHealth=q.EffectiveHealth;lastCast=q.SkillCastCount;lastTick=q.Tick;initialized=true;
            var s=new HeroMotionSample {Kind=HeroMotionKind.Idle,Combo=q.KiAttack?Math.Max(1,Math.Min(3,q.Combo)):Math.Max(1,basicCombo),ContactPhase=q.KiAttack?0:.4f};
            if(dying){s.Kind=HeroMotionKind.Dead;s.Phase=Clamp((q.Tick-deathTick)/48f);return s;}
            if(q.Rolling){s.Kind=HeroMotionKind.Roll;s.Phase=Clamp(1-q.RollRemaining/18f);return s;}
            if(q.Chain){s.Kind=HeroMotionKind.Chain;s.Phase=q.ChainPull?1:Clamp((q.Tick-chainTick)/12f);return s;}
            switch(q.State)
            {
                case "wSwing":s.Kind=HeroMotionKind.Swing;s.Phase=Clamp((5-q.RemainingTicks)/5f);break;
                case "wRecover":s.Kind=HeroMotionKind.Recover;s.Phase=Clamp(1-q.RemainingTicks/recoveryLength);break;
                case "sRecover":s.Kind=HeroMotionKind.BashRecover;s.Phase=Clamp(1-q.RemainingTicks/recoveryLength);break;
                case "sBash":s.Kind=HeroMotionKind.Bash;s.Phase=Clamp(1-q.RemainingTicks/20f);s.ContactPhase=.4f;break;
                case "wWindup":
                    if(q.BasicWindup)goto default;   // D-MO-2 (11-05): the 6-tick first-strike windup is not a charge; keep the idle/run pose so the swing starts with the existing idle->Swing transition (anticipation clip = motion pipeline)
                    goto case "kiGather";
                case "kiGather":case "sDraw":s.Kind=HeroMotionKind.Charge;s.Phase=Clamp(q.Charge/120f);break;
                case "gSlamWindup":s.Kind=HeroMotionKind.SlamWindup;s.Phase=Clamp(1-q.RemainingTicks/10f);s.ContactPhase=0;break;
                case "gSlam1":s.Kind=HeroMotionKind.SlamStrike;s.Phase=Clamp(1-q.RemainingTicks/10f);s.ContactPhase=0;break;
                case "gSlamRecover":s.Kind=HeroMotionKind.SlamRecover;s.Phase=Clamp(1-q.RemainingTicks/12f);s.ContactPhase=0;break;
                case "stagger":case "pStun":s.Kind=HeroMotionKind.Hurt;s.Phase=Clamp((q.Tick-enteredTick)/18f);break;
                case "sBlock":case "peaceShield":s.Kind=HeroMotionKind.Guard;break;
                case "iceOrb":s.Kind=HeroMotionKind.Cast;s.Phase=Clamp((q.Tick-enteredTick)/18f);break;
                default:
                    if(q.Tick-hurtTick<12){s.Kind=HeroMotionKind.Hurt;s.Phase=Clamp((q.Tick-hurtTick)/12f);}
                    else if(q.Tick-skillTick<18){s.Kind=HeroMotionKind.Cast;s.Phase=Clamp((q.Tick-skillTick)/18f);}
                    else if(q.Moving)s.Kind=HeroMotionKind.Run;
                    break;
            }
            return s;
        }
    }

    /// <summary>
    /// 대검 1타 손 키 클립(11-07, Warrior_GS_A1: 57프레임 = Core 1타 24/5/28틱)의 재생 프레임.
    /// 클립 프레임 = Core 경과 틱: wWindup(BasicWindup) 진입 틱 = f0, wSwing 진입 = f24, HitArc 틱 = f26(클립 접점), wRecover = f29~f56.
    /// 회복 길이가 공속으로 28이 아니면 회복 구간만 비율로 늘이고 줄인다(접점 프레임은 고정). 표현 전용, Core를 읽기만 한다.
    /// </summary>
    public sealed class GreatswordKeyClock
    {
        public const int WindupFrames=24,SwingFrames=5,RecoverFrames=28,Length=WindupFrames+SwingFrames+RecoverFrames,ContactFrame=26;
        const int BlendInFrames=4,BlendOutFrames=8;
        string previousState;int enteredTick,lastTick=-1;float recoveryLength=RecoverFrames;bool firstStrike;
        public bool Active {get;private set;}
        public float Frame {get;private set;}
        public float Weight {get;private set;}
        public void Reset(){previousState=null;firstStrike=false;Active=false;Frame=0;Weight=0;lastTick=-1;}
        public void Observe(HeroMotionInput q)
        {
            if(lastTick>=0&&q.Tick<lastTick)Reset();
            lastTick=q.Tick;
            if(q.State!=previousState)
            {
                enteredTick=q.Tick;
                if(q.State=="wWindup")firstStrike=q.BasicWindup;
                else if(q.State=="wRecover")recoveryLength=Math.Max(1,q.RemainingTicks);
                else if(q.State!="wSwing")firstStrike=false;
                previousState=q.State;
            }
            bool interrupted=q.Rolling||q.Chain||q.EffectiveHealth<=0;
            Active=firstStrike&&!interrupted&&(q.State=="wWindup"||q.State=="wSwing"||q.State=="wRecover");
            if(!Active){Weight=0;return;}
            int elapsed=Math.Max(0,q.Tick-enteredTick);
            if(q.State=="wWindup")Frame=Math.Min(elapsed,WindupFrames-1);
            else if(q.State=="wSwing")Frame=WindupFrames+Math.Min(elapsed,SwingFrames-1);
            else
            {
                float phase=Math.Max(0,Math.Min(1,1-q.RemainingTicks/recoveryLength));
                Frame=WindupFrames+SwingFrames+phase*(RecoverFrames-1);
            }
            float fadeIn=Math.Min(1,(Frame+1)/BlendInFrames),fadeOut=Math.Min(1,(Length-1-Frame)/BlendOutFrames+.125f);
            Weight=Math.Max(0,Math.Min(fadeIn,fadeOut));
        }
    }


    public enum GreatswordClip { None=-1, A1=0, Combo=1, Bash=2, Charge=3, Release=4 }
    /// <summary>대검 손 키 5클립(1타·콤보·우클·차징·놓기)을 Core 상태·틱으로 고른다. 표현만 읽고 Core 수치·판정은 바꾸지 않는다.
    /// 클립 프레임 = Core 경과 틱이라 칼 접점 프레임이 HitArc 틱과 항상 같다(1타 f26, 2타 f59, 3타 탭 f99, 놓기 f12, 우클 f12).</summary>
    public sealed class GreatswordKeyDirector
    {
        public const int A1SwingStart=24,A1RecoverStart=29,A1RecoverEnd=56;
        public const int Hit2Swing=57,Hit2RecoverStart=62,Hit2RecoverEnd=95,Hit3Swing=97,Hit3RecoverStart=102,Hit3RecoverEnd=135;
        public const int ReleaseSwing=10,ReleaseRecoverStart=15,ReleaseRecoverEnd=48;
        public const int BashDrawEnd=3,BashStrike=4,BashRecoverStart=24,BashRecoverEnd=51;
        public const int ChargeEnd=170,ChargeLoopStart=122,ChargeLoop=48;   // 3단 뒤 숨쉬기 12틱 x4 반복
        public const int TapChargeTicks=8;      // 8틱 안에 놓으면 탭 3타, 그보다 길면 차지 놓기
        public const float LeftGrip=.20f,BladeLength=2.50f,SocketToPommel=.15f*BladeLength/1.60f,SocketToTip=BladeLength-SocketToPommel;
        public const int BlendIn=4,BlendOut=8,Cross=3,Rejoin=8;   // 직전 키 클립이 Rejoin틱 안에 끝났으면 운반 포즈를 거치지 않고 그 자세에서 이어 받는다
        enum Hit { None, First, Second, Third, Charge, Release, Bash, Idle }
        Hit hit;string previousState;int enteredTick,lastTick=-1,activeStart,switchTick=-1000,lastActiveTick=-1000;GreatswordClip lastClip=GreatswordClip.None;float lastFrame;float recoveryLength=1,lastCharge;bool comboMode;
        public GreatswordClip Clip {get;private set;}=GreatswordClip.None;
        public bool Active => Clip!=GreatswordClip.None;
        public float Frame {get;private set;}
        public float Weight {get;private set;}
        /// <summary>앞 클립·타격에서 이어진 전환이면 0부터 세는 틱(혼합용), 아니면 큰 값.</summary>
        public int SinceSwitch {get;private set;}=1000;
        /// <summary>키 자세에서 기존 절차 포즈(달리기 등)로 빠져나가는 중(Weight가 1→0).</summary>
        public bool Exiting {get;private set;}
        public void Reset(){hit=Hit.None;previousState=null;lastTick=-1;activeStart=0;switchTick=-1000;lastActiveTick=-1000;lastClip=GreatswordClip.None;Exiting=false;Clip=GreatswordClip.None;Frame=0;Weight=0;SinceSwitch=1000;}
        public void Observe(HeroMotionInput q)
        {
            if(lastTick>=0&&q.Tick<lastTick)Reset();
            lastTick=q.Tick;
            var oldHit=hit;var oldClip=Clip;
            if(q.State!=previousState)
            {
                string from=previousState;enteredTick=q.Tick;previousState=q.State;
                if(q.State=="wWindup"){if(q.BasicWindup){hit=Hit.First;comboMode=q.KiAttack;}else hit=Hit.Charge;}
                else if(q.State=="wSwing"){if(from=="wWindup"&&hit==Hit.First){}else if(from=="wWindup"&&hit==Hit.Charge)hit=lastCharge<=TapChargeTicks?Hit.Third:Hit.Release;else hit=Hit.Second;}
                else if(q.State=="wRecover"||q.State=="sRecover")recoveryLength=Math.Max(1,q.RemainingTicks);
                else if(q.State=="sDraw")hit=Hit.Bash;
                else if(q.State=="sBash"){if(hit!=Hit.Bash)hit=Hit.Bash;}
                else if(q.State=="idle")hit=Hit.Idle;
                else hit=Hit.None;
            }
            if(q.State=="wWindup"&&hit==Hit.Charge)lastCharge=q.Charge;
            bool interrupted=q.Rolling||q.Chain||q.EffectiveHealth<=0;
            int e=Math.Max(0,q.Tick-enteredTick);
            float phase=Math.Max(0,Math.Min(1,1-q.RemainingTicks/recoveryLength));
            var clip=GreatswordClip.None;float frame=0,end=0;
            switch(hit)
            {
                case Hit.First:
                    clip=comboMode?GreatswordClip.Combo:GreatswordClip.A1;
                    if(q.State=="wWindup")frame=Math.Min(e,A1SwingStart-1);
                    else if(q.State=="wSwing")frame=A1SwingStart+Math.Min(e,4);
                    else if(q.State=="wRecover")frame=A1RecoverStart+phase*(A1RecoverEnd-A1RecoverStart);
                    else clip=GreatswordClip.None;
                    end=A1RecoverEnd;break;
                case Hit.Second:case Hit.Third:
                    clip=GreatswordClip.Combo;bool two=hit==Hit.Second;
                    if(q.State=="wSwing")frame=(two?Hit2Swing:Hit3Swing)+Math.Min(e,4);
                    else if(q.State=="wRecover")frame=two?Hit2RecoverStart+phase*(Hit2RecoverEnd-Hit2RecoverStart):Hit3RecoverStart+phase*(Hit3RecoverEnd-Hit3RecoverStart);
                    else clip=GreatswordClip.None;
                    end=two?Hit2RecoverEnd:Hit3RecoverEnd;break;
                case Hit.Charge:
                    clip=q.State=="wWindup"?GreatswordClip.Charge:GreatswordClip.None;
                    frame=e<=ChargeEnd?e:ChargeLoopStart+((e-ChargeLoopStart)%ChargeLoop);end=1e9f;break;
                case Hit.Release:
                    clip=GreatswordClip.Release;
                    if(q.State=="wSwing")frame=ReleaseSwing+Math.Min(e,4);
                    else if(q.State=="wRecover")frame=ReleaseRecoverStart+phase*(ReleaseRecoverEnd-ReleaseRecoverStart);
                    else clip=GreatswordClip.None;
                    end=ReleaseRecoverEnd;break;
                case Hit.Idle:
                    // 제자리 대기 = 1타 f0(양손 운반, 두손 파지). 움직이면 기존 절차 보행으로 빠져나간다
                    clip=q.State=="idle"&&!q.Moving?GreatswordClip.A1:GreatswordClip.None;frame=0;end=1e9f;break;
                case Hit.Bash:
                    clip=GreatswordClip.Bash;
                    if(q.State=="sDraw")frame=Math.Min(e,BashDrawEnd);
                    else if(q.State=="sBash")frame=BashStrike+Math.Min(e,BashRecoverStart-BashStrike-1);
                    else if(q.State=="sRecover")frame=BashRecoverStart+phase*(BashRecoverEnd-BashRecoverStart);
                    else clip=GreatswordClip.None;
                    end=BashRecoverEnd;break;
            }
            if(interrupted)clip=GreatswordClip.None;
            if(clip==GreatswordClip.None)
            {
                // 회복 끝에서 운반 포즈로 섞지 않는다. 키가 끝난 뒤 다른 절차 상태로 가면 BlendOut틱 동안 마지막 키 자세에서 빠져나간다(구르기·체인·사망은 즉시)
                int dt=q.Tick-lastActiveTick;
                if(!interrupted&&lastClip!=GreatswordClip.None&&dt>0&&dt<BlendOut){Clip=lastClip;Frame=lastFrame;Weight=1-dt/(float)BlendOut;SinceSwitch=1000;Exiting=true;return;}
                Clip=clip;Weight=0;SinceSwitch=1000;Exiting=false;return;
            }
            Exiting=false;
            if(oldClip!=GreatswordClip.None&&(oldClip!=clip||oldHit!=hit))switchTick=q.Tick;   // 앞 클립·타격 자세에서 이어 받는다
            if(oldClip==GreatswordClip.None)
            {
                bool rejoin=q.Tick-lastActiveTick<=Rejoin;
                activeStart=rejoin?q.Tick-BlendIn:q.Tick;
                if(rejoin)switchTick=q.Tick;
            }
            lastActiveTick=q.Tick;
            Clip=clip;Frame=frame;SinceSwitch=Math.Max(0,q.Tick-switchTick);
            Weight=Math.Min(1,(q.Tick-activeStart+1f)/BlendIn);   // 회복 끝은 대기(1타 f0)로 이어지므로 빠져나가는 혼합을 하지 않는다
            lastClip=clip;lastFrame=frame;
        }
    }

#if UNITY_5_3_OR_NEWER
    /// <summary>Core를 읽는 전사 표현. 루트 위치·방향·충돌·판정의 writer는 NativeGame이다.</summary>
    [DefaultExecutionOrder(90)]
    public sealed class NativeHeroMotion : MonoBehaviour
    {
        readonly NativeHeroMotionClock clock=new NativeHeroMotionClock();
        readonly GreatswordKeyDirector keyDirector=new GreatswordKeyDirector();
        [Serializable] sealed class KeyPoseTable { public int fps=60,frames,contactFrame,hips=-1; public string[] paths; public float[] rot,hipsPos,lh; }
        static readonly string[] KeyClipNames={"A1","Combo","Bash","Charge","Release"};   // GreatswordClip 순서
        readonly KeyPoseTable[] keyTables=new KeyPoseTable[5];Transform[] keyBones;Quaternion[] keyLastRot,keyFromRot;Vector3 keyLastHips,keyFromHips;bool keyHasLast;
        KeyPoseTable KeyTable => keyDirector.Active?keyTables[(int)keyDirector.Clip]:null;
        public bool KeyClipActive => keyBones!=null&&KeyTable!=null;
        public float KeyClipFrame => keyDirector.Frame;
        public GreatswordClip KeyClip => keyDirector.Clip;
        float keyLeftHold=1;
        /// <summary>지금 키 자세에서 왼손이 손잡이를 쥔 비율(대기 한손 운반 = 0).</summary>
        public float KeyLeftHold => KeyClipActive?keyLeftHold:1;
        readonly RigPixelLocomotionClock gait=new RigPixelLocomotionClock();
        readonly RigPixelTurnClock turn=new RigPixelTurnClock();
        bool rigPixelMotion;
        bool leftPlanted,rightPlanted;Vector3 leftPlant,rightPlant,plantFacing;
        public float GaitPhase => gait.Phase;
        public float VisualTurnOffset => rigPixelMotion?turn.Offset:0;
        public float GaitFootPlantError {get;private set;}
        public bool GaitFootPlanted => leftPlanted||rightPlanted;
        public void EnableRigPixelMotion(){rigPixelMotion=true;gait.Reset();turn.Reset();leftPlanted=rightPlanted=false;}
        Animator animator;
        HumanPoseHandler poseHandler;
        HumanPose pose;
        Simulation observedSimulation;
        Transform rightUpper,rightFore,rightHand,leftUpper,leftFore,leftHand,socket,leftGrip;
        Transform bladeTipTransform;
        Vector3 bladeTipLocal;
        Transform hips,chest,head,leftThigh,leftShin,leftFoot,leftToes,rightThigh,rightShin,rightFoot,rightToes;
        SkinnedMeshRenderer bodyRenderer;
        Mesh rollBakeMesh;
        readonly List<Vector3> rollVertices=new List<Vector3>();
        int[] rollBodyIndices;
        int rollGroundTick=-1;
        float rollGroundPhase=-1,rollGroundShift;
        Quaternion leftGripRelative;
        int speedHash=Animator.StringToHash("Speed");
        readonly int runStateHash=Animator.StringToHash("Base Layer.Run"),idleStateHash=Animator.StringToHash("Base Layer.Idle"),holdStateHash=Animator.StringToHash("ArmR_HoldWeapon.HoldWeapon");
        int holdLayer=-1;
        float runSeconds=1,holdSeconds=1;
        int spineBend=-1,chestBend=-1,spineTwist=-1,chestTwist=-1;
        bool ready;
        HeroMotionSample current;
        HeroMotionInput observed;
        public HeroMotionKind MotionKind {get{return current.Kind;}}
        public float MotionPhase {get{return current.Phase;}}
        public int ComboStep {get{return current.Combo;}}
        public float FootPlantError {get;private set;}
        public bool FootPivotActive {get;private set;}
        public bool TryGetBladeTip(out Vector3 world)
        {
            if(bladeTipTransform==null){world=Vector3.zero;return false;}
            world=bladeTipTransform.TransformPoint(bladeTipLocal);return true;
        }

        void Awake(){Bind();}
        void Bind()
        {
            animator=GetComponent<Animator>()??GetComponentInChildren<Animator>(true);
            if(animator==null||animator.avatar==null||!animator.avatar.isValid||!animator.avatar.isHuman||animator.runtimeAnimatorController==null)return;
            animator.applyRootMotion=false;
            animator.speed=0;
            animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
            holdLayer=animator.GetLayerIndex("ArmR_HoldWeapon");
            foreach(var clip in animator.runtimeAnimatorController.animationClips)
            {
                if(clip.name=="Warrior_Run")runSeconds=clip.length;
                else if(clip.name=="Warrior_Walk_ArmR_Hold")holdSeconds=clip.length;
            }
            rightUpper=animator.GetBoneTransform(HumanBodyBones.RightUpperArm);rightFore=animator.GetBoneTransform(HumanBodyBones.RightLowerArm);rightHand=animator.GetBoneTransform(HumanBodyBones.RightHand);
            leftUpper=animator.GetBoneTransform(HumanBodyBones.LeftUpperArm);leftFore=animator.GetBoneTransform(HumanBodyBones.LeftLowerArm);leftHand=animator.GetBoneTransform(HumanBodyBones.LeftHand);
            hips=animator.GetBoneTransform(HumanBodyBones.Hips);chest=animator.GetBoneTransform(HumanBodyBones.Chest)??animator.GetBoneTransform(HumanBodyBones.Spine);head=animator.GetBoneTransform(HumanBodyBones.Head);
            leftThigh=animator.GetBoneTransform(HumanBodyBones.LeftUpperLeg);leftShin=animator.GetBoneTransform(HumanBodyBones.LeftLowerLeg);leftFoot=animator.GetBoneTransform(HumanBodyBones.LeftFoot);
            rightThigh=animator.GetBoneTransform(HumanBodyBones.RightUpperLeg);rightShin=animator.GetBoneTransform(HumanBodyBones.RightLowerLeg);rightFoot=animator.GetBoneTransform(HumanBodyBones.RightFoot);
            leftToes=animator.GetBoneTransform(HumanBodyBones.LeftToes);rightToes=animator.GetBoneTransform(HumanBodyBones.RightToes);
            foreach(var t in GetComponentsInChildren<Transform>(true))
            {
                if(t.name=="Socket_Weapon_R")socket=t;
                else if(t.name=="Grip_L")leftGrip=t;
            }
            if(rightHand==null||leftHand==null||socket==null)return;
            leftGripRelative=Quaternion.Inverse(rightHand.rotation)*leftHand.rotation;
            poseHandler=new HumanPoseHandler(animator.avatar,animator.transform);
            poseHandler.GetHumanPose(ref pose);
            spineBend=Muscle("Spine Front-Back");chestBend=Muscle("Chest Front-Back");spineTwist=Muscle("Spine Twist Left-Right");chestTwist=Muscle("Chest Twist Left-Right");
            CacheBladeTip();
            PrepareRollContact();
            BindKeyClip();
            ready=true;
        }
        // 11-07 대검 손 키 1타. Humanoid Animator는 일반 Transform 곡선 클립을 SampleAnimation으로 적용하지 않는다
        // → 반입 job(GreatswordKeyImport)이 실제 프리팹 계층에 구운 본별 로컬 자세 표를 LateUpdate에서 직접 쓴다. 망토는 CapeSpring 몫이라 표에 없다.
        void BindKeyClip()
        {
            keyBones=null;Array.Clear(keyTables,0,keyTables.Length);string[] paths=null;
            for(int c=0;c<KeyClipNames.Length;c++)
            {
                var asset=Resources.Load<TextAsset>("Characters/Warrior_GS_"+KeyClipNames[c]+"_pose");if(asset==null){Debug.LogWarning("[대검 키] 표 없음: "+KeyClipNames[c]);continue;}
                var table=JsonUtility.FromJson<KeyPoseTable>(asset.text);
                if(table==null||table.paths==null||table.frames<=0||table.rot==null||table.rot.Length!=table.frames*table.paths.Length*4)continue;
                if(paths==null)paths=table.paths;else if(!paths.SequenceEqual(table.paths)){Debug.LogWarning("[대검 키] 본 순서 불일치: "+KeyClipNames[c]);continue;}
                keyTables[c]=table;
            }
            if(paths==null)return;
            var bones=new Transform[paths.Length];
            for(int i=0;i<bones.Length;i++){bones[i]=animator.transform.Find(paths[i]);if(bones[i]==null){Debug.LogWarning("[대검 키] 본 경로 없음: "+paths[i]);return;}}
            keyBones=bones;keyLastRot=new Quaternion[bones.Length];keyFromRot=new Quaternion[bones.Length];keyHasLast=false;
        }
        void ApplyKeyClip()
        {
            // 기존 대기 운반 포즈에서 들어오고(4f) 회복 끝에서 다시 대기 포즈로 돌아간다(8f). 클립·타격이 바뀌면 직전에 적용한 키 자세에서 3틱 동안 이어 받는다.
            // 표는 모델 로컬 공간이라 조준 yaw는 루트가 맡는다.
            if(leftGrip!=null)ApplyCarryPose(false);
            var t=KeyTable;int n=keyBones.Length;
            float frame=Mathf.Clamp(keyDirector.Frame,0,t.frames-1);int f0=(int)frame,f1=Math.Min(f0+1,t.frames-1);float u=frame-f0,w=keyDirector.Weight;
            int since=keyDirector.SinceSwitch;bool cross=keyHasLast&&since<GreatswordKeyDirector.Cross;
            if(cross&&since==0){Array.Copy(keyLastRot,keyFromRot,n);keyFromHips=keyLastHips;}
            float c=cross?(since+1f)/(GreatswordKeyDirector.Cross+1f):1;
            for(int i=0;i<n;i++)
            {
                int a=(f0*n+i)*4,b=(f1*n+i)*4;
                var q=Quaternion.Slerp(new Quaternion(t.rot[a],t.rot[a+1],t.rot[a+2],t.rot[a+3]),new Quaternion(t.rot[b],t.rot[b+1],t.rot[b+2],t.rot[b+3]),u);
                if(cross)q=Quaternion.Slerp(keyFromRot[i],q,c);
                keyBones[i].localRotation=w>=.999f?q:Quaternion.Slerp(keyBones[i].localRotation,q,w);
                keyLastRot[i]=q;
            }
            if(t.hips>=0&&t.hipsPos!=null)
            {
                var p=Vector3.Lerp(new Vector3(t.hipsPos[f0*3],t.hipsPos[f0*3+1],t.hipsPos[f0*3+2]),new Vector3(t.hipsPos[f1*3],t.hipsPos[f1*3+1],t.hipsPos[f1*3+2]),u);
                if(cross)p=Vector3.Lerp(keyFromHips,p,c);
                keyBones[t.hips].localPosition=w>=.999f?p:Vector3.Lerp(keyBones[t.hips].localPosition,p,w);
                keyLastHips=p;
            }
            // 칼끝 접지 하한 4cm(Blender 키와 같은 규칙): 운반 포즈와 섞이는 회복 끝에서 칼이 땅을 뚫지 않게 오른팔을 들어 올린다
            bool lifted=false;
            if(rightUpper!=null&&rightFore!=null&&rightHand!=null&&TryGetBladeTip(out var keyTip))
            {
                float h=Vector3.Dot(keyTip-transform.position,transform.up);
                if(h<.04f)
                {
                    var rot=rightHand.rotation;var hint=rightFore.position-(rightUpper.position+rightHand.position)*.5f;if(hint.sqrMagnitude<1e-6f)hint=transform.right;
                    SolveArm(rightUpper,rightFore,rightHand,rightHand.position+transform.up*(.04f-h),hint.normalized);rightHand.rotation=rot;lifted=true;
                }
            }
            // 양손 파지 유지: 키 자세가 켜져 있는 동안 왼팔 2본 IK로 손잡이(소켓에서 칼머리 쪽 LeftGrip)에 붙인다(혼합·전환·접지 보정 중에도 끝까지).
            // 왼팔이 닿지 않으면 오른손(칼)을 그만큼 왼어깨 쪽으로 당긴다. 절차 포즈로 빠져나갈 때만 남은 비율만큼 놓는다.
            if(leftGrip!=null&&socket!=null&&leftUpper!=null&&leftFore!=null&&leftHand!=null&&rightUpper!=null&&rightFore!=null&&rightHand!=null)
            {
                // 표의 프레임별 왼손 파지 비율(대기 한손 운반 = 0)을 따른다
                float lhNow=t.lh!=null&&t.lh.Length==t.frames?Mathf.Lerp(t.lh[f0],t.lh[f1],u):1;
                float hold=lhNow*(keyDirector.Exiting?Mathf.Clamp01(w):1);keyLeftHold=hold;
                var handRot=leftHand.rotation;float reach=(Vector3.Distance(leftUpper.position,leftFore.position)+Vector3.Distance(leftFore.position,leftHand.position))*.995f;
                for(int it=0;it<4;it++)
                {
                    var off=leftGrip.position-leftHand.position;
                    var want=socket.position+socket.up*GreatswordKeyDirector.LeftGrip-off;
                    var toWant=want-leftUpper.position;float over=toWant.magnitude-reach;
                    if(over>0&&hold>=.999f&&lhNow>=.999f)
                    {
                        var rRot=rightHand.rotation;var rHint=rightFore.position-(rightUpper.position+rightHand.position)*.5f;if(rHint.sqrMagnitude<1e-6f)rHint=transform.right;
                        SolveArm(rightUpper,rightFore,rightHand,rightHand.position-toWant.normalized*over,rHint.normalized);rightHand.rotation=rRot;
                        want=socket.position+socket.up*GreatswordKeyDirector.LeftGrip-off;
                    }
                    var target=Vector3.Lerp(leftHand.position,want,hold);
                    var pole=leftFore.position-(leftUpper.position+leftHand.position)*.5f;if(pole.sqrMagnitude<1e-6f)pole=-transform.right;
                    SolveArm(leftUpper,leftFore,leftHand,target,pole.normalized);leftHand.rotation=handRot;
                }
            }
            keyHasLast=true;
        }
        void CacheBladeTip()
        {
            bladeTipTransform=null;
            Vector3 axis=-socket.up,origin=socket.position;float furthest=0;
            foreach(var filter in socket.GetComponentsInChildren<MeshFilter>(true))
            {
                var mesh=filter.sharedMesh;if(mesh==null||!mesh.isReadable)continue;
                var localToWorld=filter.transform.localToWorldMatrix;
                var vertices=mesh.vertices; // 바인딩 때 한 번만 읽고 실제 끝 정점·Transform만 보존한다.
                foreach(var vertex in vertices)
                {
                    float distance=Vector3.Dot(localToWorld.MultiplyPoint3x4(vertex)-origin,axis);
                    if(float.IsNaN(distance)||float.IsInfinity(distance)||distance<=furthest)continue;
                    furthest=distance;bladeTipTransform=filter.transform;bladeTipLocal=vertex;
                }
            }
        }
        void PrepareRollContact()
        {
            foreach(var renderer in GetComponentsInChildren<SkinnedMeshRenderer>(true))
                if(renderer.sharedMesh!=null&&(bodyRenderer==null||renderer.sharedMesh.vertexCount>bodyRenderer.sharedMesh.vertexCount))bodyRenderer=renderer;
            if(bodyRenderer==null)return;
            var mesh=bodyRenderer.sharedMesh;var bones=bodyRenderer.bones;
            var cape=new bool[bones.Length];for(int i=0;i<bones.Length;i++)cape[i]=bones[i]!=null&&bones[i].name.StartsWith("Cape_",StringComparison.Ordinal);
            var weights=mesh.isReadable?mesh.boneWeights:null;var indices=new List<int>(mesh.vertexCount);
            bool IsCape(int index,float weight){return weight>0&&index>=0&&index<cape.Length&&cape[index];}
            for(int i=0;i<mesh.vertexCount;i++)
            {
                if(weights!=null&&i<weights.Length)
                {
                    var w=weights[i];
                    if(IsCape(w.boneIndex0,w.weight0)||IsCape(w.boneIndex1,w.weight1)||IsCape(w.boneIndex2,w.weight2)||IsCape(w.boneIndex3,w.weight3))continue;
                }
                indices.Add(i);
            }
            rollBodyIndices=indices.ToArray();rollVertices.Capacity=mesh.vertexCount;
            rollBakeMesh=new Mesh{name="Hero roll body contact",hideFlags=HideFlags.HideAndDontSave};rollBakeMesh.MarkDynamic();
        }
        static int Muscle(string name){return Array.IndexOf(HumanTrait.MuscleName,name);}
        void SetMuscle(int index,float value){if(index>=0)pose.muscles[index]=Mathf.Clamp(value,-1,1);}
        void BlendMuscle(int index,float value,float weight){if(index>=0)pose.muscles[index]=Mathf.Lerp(pose.muscles[index],Mathf.Clamp(value,-1,1),weight);}
        void OnDestroy(){poseHandler?.Dispose();poseHandler=null;if(rollBakeMesh!=null){if(Application.isPlaying)Destroy(rollBakeMesh);else DestroyImmediate(rollBakeMesh);}}

        public void Sync(Simulation sim,bool moving)
        {
            if(sim==null)return;
            if(!ReferenceEquals(observedSimulation,sim)){clock.Reset();keyDirector.Reset();keyHasLast=false;gait.Reset();turn.Reset();leftPlanted=rightPlanted=false;observedSimulation=sim;rollGroundTick=-1;rollGroundPhase=-1;}
            if(!ready)Bind();
            var p=sim.Player;
            observed=new HeroMotionInput {State=p.State,Tick=sim.TickCount,RemainingTicks=p.StateTicks,RollRemaining=(float)sim.RollMoveT,Rolling=sim.RollActive,Moving=moving,EffectiveHealth=p.Hp+p.Shield,Combo=sim.KiComboStep,KiAttack=sim.Config.ActiveAttack=="kiSlash",Charge=p.KiChargeActive?p.KiChargeTicks:(float)sim.KgChg,BasicWindup=p.BasicWindup,SkillCastCount=sim.SkillCastCount,Chain=rigPixelMotion&&(sim.HarpActive||sim.DashActive),ChainPull=sim.DashActive};
            current=clock.Evaluate(observed);
            keyDirector.Observe(observed);
            if(rigPixelMotion)turn.Observe(sim.TickCount,Mathf.Atan2(Mathf.Cos(p.Facing),-Mathf.Sin(p.Facing))*Mathf.Rad2Deg,current.Kind==HeroMotionKind.Idle||current.Kind==HeroMotionKind.Run);
            if(rigPixelMotion)gait.Observe(sim.TickCount,transform.position.x,NativeRemodel3D.Active?transform.position.z:transform.position.y,1/Math.Max(.01f,transform.lossyScale.y),3.0126457,moving&&current.Kind!=HeroMotionKind.Roll&&current.Kind!=HeroMotionKind.Chain&&current.Kind!=HeroMotionKind.Dead);
            if(ready)SampleLocomotion();
        }

        void SampleLocomotion()
        {
            // 자동 시간은 멈추고 실제 Core의 절대 tick만 표본 시각으로 쓴다.
            // 같은 tick에도 다시 표본화하므로 이전 LateUpdate의 HumanPose/IK가 누적되지 않는다.
            bool moving=observed.Moving&&current.Kind!=HeroMotionKind.Dead&&current.Kind!=HeroMotionKind.Chain;
            animator.speed=0;
            animator.SetFloat(speedHash,moving?4f:0f);
            animator.Play(moving?runStateHash:idleStateHash,0,LocomotionTime(runSeconds,moving));
            if(holdLayer>=0)
            {
                animator.SetLayerWeight(holdLayer,1);
                animator.Play(holdStateHash,holdLayer,LocomotionTime(holdSeconds,moving));
            }
            animator.Update(0f);
            if(leftGrip!=null)ApplyCarryPose(moving);
        }
        float LocomotionTime(float seconds,bool moving){return rigPixelMotion?(moving?gait.Phase:0):NativeHeroMotionClock.LocomotionTime(observed.Tick,seconds,moving);}

        void ApplyCarryPose(bool moving)
        {
            float cycle=LocomotionTime(runSeconds,moving);
            float swing=moving?Mathf.Sin(cycle*Mathf.PI*2)*.08f:0;
            var lead=Quaternion.Euler(0,rigPixelMotion?turn.Lead:0,0);
            var rightTarget=transform.TransformPoint(lead*new Vector3(.30f,1.10f,.06f));
            var direction=transform.TransformDirection(lead*new Vector3(.16f,-.58f,-.80f).normalized);
            SolveArm(rightUpper,rightFore,rightHand,rightTarget,transform.right+transform.forward*.10f);
            rightHand.rotation=Quaternion.FromToRotation(-socket.up,direction)*rightHand.rotation;
            var rotation=rightHand.rotation;
            if(TryGetBladeTip(out var tip))
            {
                float height=Vector3.Dot(tip-transform.position,transform.up);
                if(height<.06f){rightTarget+=transform.up*(.06f-height);SolveArm(rightUpper,rightFore,rightHand,rightTarget,transform.right+transform.forward*.10f);rightHand.rotation=rotation;}
            }
            SolveArm(leftUpper,leftFore,leftHand,transform.TransformPoint(lead*new Vector3(-.30f,1.08f,.03f+swing)),-transform.right+transform.forward*.10f);
        }

        struct GripPose
        {
            public Vector3 Hand,Blade;
            public float Bend,Twist,Lower;
            public GripPose(Vector3 hand,Vector3 blade,float bend=0,float twist=0,float lower=0){Hand=hand;Blade=blade;Bend=bend;Twist=twist;Lower=lower;}
        }
        static float Ease(float t){t=Mathf.Clamp01(t);return t*t*(3-2*t);}
        static GripPose Lerp(GripPose a,GripPose b,float t)
        {
            t=Ease(t);return new GripPose(Vector3.Lerp(a.Hand,b.Hand,t),Vector3.Slerp(a.Blade,b.Blade,t),Mathf.Lerp(a.Bend,b.Bend,t),Mathf.Lerp(a.Twist,b.Twist,t),Mathf.Lerp(a.Lower,b.Lower,t));
        }
        static GripPose ReadyPose(){return new GripPose(new Vector3(.24f,1.18f,.23f),new Vector3(.2f,.28f,.94f),-.08f,.05f);}
        static GripPose SwingPose(int combo,float progress,float contact)
        {
            GripPose start,hit,end;
            if(combo==3)
            {
                start=new GripPose(new Vector3(.10f,1.64f,.03f),new Vector3(.05f,.92f,-.35f),.14f,-.10f);
                hit=new GripPose(new Vector3(.05f,1.33f,.35f),new Vector3(.02f,-.68f,.73f),-.38f,.04f,.08f);
                end=new GripPose(new Vector3(.03f,1.15f,.40f),new Vector3(.02f,-.66f,.75f),-.42f,.08f,.10f);
            }
            else
            {
                float side=combo==2?-1:1;
                start=new GripPose(new Vector3(side*.30f,1.30f,.06f),new Vector3(side*.86f,.28f,-.40f),.06f,-side*.30f);
                hit=new GripPose(new Vector3(side*.12f,1.15f,.40f),new Vector3(-side*.18f,.02f,.98f),-.22f,side*.16f,.025f);
                end=new GripPose(new Vector3(-side*.12f,1.02f,.30f),new Vector3(-side*.91f,-.26f,.30f),-.18f,side*.32f,.025f);
            }
            if(contact>0&&progress<contact)return Lerp(start,hit,progress/contact);
            return Lerp(hit,end,(progress-contact)/Mathf.Max(.01f,1-contact));
        }
        static GripPose BashPose(float progress)
        {
            var start=new GripPose(new Vector3(.20f,1.22f,.10f),new Vector3(-.15f,.84f,.52f),.10f,-.18f);
            var contact=new GripPose(new Vector3(.10f,1.18f,.48f),new Vector3(-.10f,.16f,.98f),-.22f,.16f,.05f);
            var end=new GripPose(new Vector3(.08f,1.14f,.50f),new Vector3(-.12f,.08f,.99f),-.26f,.18f,.06f);
            return progress<.4f?Lerp(start,contact,progress/.4f):Lerp(contact,end,(progress-.4f)/.6f);
        }
        static GripPose SlamGrip(HeroMotionSample sample)
        {
            var key=NativeHeroMotionClock.SlamPose(sample);
            return new GripPose(new Vector3(key.HandX,key.HandY,key.HandZ),new Vector3(key.BladeX,key.BladeY,key.BladeZ),0,0,key.Lower);
        }

        Vector3 FitTwoHandTarget(Vector3 requested,Quaternion rightRotation)
        {
            if(leftGrip==null)return requested;
            var socketRotation=rightRotation*(Quaternion.Inverse(rightHand.rotation)*socket.rotation);
            var rightOffset=Quaternion.Inverse(rightHand.rotation)*(socket.position-rightHand.position);
            var leftRotation=socketRotation*Quaternion.Inverse(Quaternion.Inverse(leftHand.rotation)*leftGrip.rotation);
            var leftOffset=Quaternion.Inverse(leftHand.rotation)*(leftGrip.position-leftHand.position);
            var delta=rightRotation*rightOffset+socketRotation*Vector3.up*.09f-leftRotation*leftOffset;
            float rightReach=Vector3.Distance(rightUpper.position,rightFore.position)+Vector3.Distance(rightFore.position,rightHand.position)-.002f;
            float leftReach=Vector3.Distance(leftUpper.position,leftFore.position)+Vector3.Distance(leftFore.position,leftHand.position)-.002f;
            var normal=transform.up;
            var originalA=rightUpper.position;var originalB=leftUpper.position-delta;
            var ca=originalA;var cb=originalB;
            float ha=Vector3.Dot(requested-ca,normal),hb=Vector3.Dot(requested-cb,normal);
            ca+=normal*ha;cb+=normal*hb;
            float ra=Mathf.Sqrt(Mathf.Max(0,rightReach*rightReach-ha*ha)),rb=Mathf.Sqrt(Mathf.Max(0,leftReach*leftReach-hb*hb));
            Vector3 ClampCircle(Vector3 p,Vector3 center,float radius){var d=p-center;return d.sqrMagnitude<=radius*radius?p:center+d.normalized*radius;}
            Vector3 FitSpheres(){
                var first=ClampCircle(requested,originalA,rightReach);if((first-originalB).sqrMagnitude<=leftReach*leftReach)return first;
                var second=ClampCircle(requested,originalB,leftReach);if((second-originalA).sqrMagnitude<=rightReach*rightReach)return second;
                var direction=originalB-originalA;float length=direction.magnitude;
                if(length<.00001f)return ClampCircle(requested,originalA,Mathf.Min(rightReach,leftReach));
                if(length>rightReach+leftReach)return first;
                direction/=length;float x=(rightReach*rightReach-leftReach*leftReach+length*length)/(2*length);
                var center=originalA+direction*x;float radius=Mathf.Sqrt(Mathf.Max(0,rightReach*rightReach-x*x));
                var radial=Vector3.ProjectOnPlane(requested-center,direction);
                if(radial.sqrMagnitude<.000001f)radial=Vector3.Cross(direction,transform.up);
                if(radial.sqrMagnitude<.000001f)radial=Vector3.Cross(direction,transform.right);
                return center+radial.normalized*radius;
            }
            // 낮은 되베기 등에서 높이 고정 자체가 불가능하면 도달구의 교차 원으로 재타깃한다.
            if(Mathf.Abs(ha)>rightReach||Mathf.Abs(hb)>leftReach)return FitSpheres();
            // 손 높이와 칼 방향을 유지한 채 양팔 도달 원의 교집합으로 맞춘다.
            if((requested-ca).sqrMagnitude<=ra*ra&&(requested-cb).sqrMagnitude<=rb*rb)return requested;
            var a=ClampCircle(requested,ca,ra);if((a-cb).sqrMagnitude<=rb*rb)return a;
            var b=ClampCircle(requested,cb,rb);if((b-ca).sqrMagnitude<=ra*ra)return b;
            var axis=cb-ca;float distance=axis.magnitude;
            if(distance<.00001f)return ClampCircle(requested,ca,Mathf.Min(ra,rb));
            if(distance>ra+rb)return FitSpheres();
            axis/=distance;float along=(ra*ra-rb*rb+distance*distance)/(2*distance);
            float side=Mathf.Sqrt(Mathf.Max(0,ra*ra-along*along));var middle=ca+axis*along;var across=Vector3.Cross(normal,axis).normalized*side;
            var first=middle+across;var second=middle-across;
            return (first-requested).sqrMagnitude<(second-requested).sqrMagnitude?first:second;
        }

        void LateUpdate()
        {
            if(!ready||observedSimulation==null)return;
            FootPlantError=0;
            GaitFootPlantError=0;if(current.Kind!=HeroMotionKind.Run)leftPlanted=rightPlanted=false;
            FootPivotActive=false;
            SampleLocomotion();
            if(rigPixelMotion)transform.localRotation=Quaternion.Euler(0,turn.Offset,0);
            if(KeyClipActive){ApplyKeyClip();return;}
            var leftFootPosition=leftFoot!=null?leftFoot.position:Vector3.zero;var rightFootPosition=rightFoot!=null?rightFoot.position:Vector3.zero;
            var leftFootRotation=leftFoot!=null?leftFoot.rotation:Quaternion.identity;var rightFootRotation=rightFoot!=null?rightFoot.rotation:Quaternion.identity;
            var leftToePosition=leftToes!=null?leftToes.position:leftFootPosition;var rightToePosition=rightToes!=null?rightToes.position:rightFootPosition;
            // 이 Core tick의 기본포즈 위에 절대 자세를 덮는다. Core와 이동 루트에는 쓰지 않는다.
            poseHandler.GetHumanPose(ref pose);
            float t=current.Phase;
            float weight=NativeHeroMotionClock.PoseWeight(current);
            var bodyWeight=NativeHeroMotionClock.BodyWeight(current);
            var grip=ReadyPose();bool twoHands=true;
            switch(current.Kind)
            {
                case HeroMotionKind.Idle:
                case HeroMotionKind.Run:
                    // 승인된 보행/무기 홀드 포즈를 유지하고 흉곽 호흡만 더한다.
                    SetMuscle(chestBend,Mathf.Sin(observed.Tick*.025f)*.025f);
                    poseHandler.SetHumanPose(ref pose);
                    if(rigPixelMotion){if(chest!=null)chest.rotation=Quaternion.AngleAxis(turn.Lead,transform.up)*chest.rotation;if(head!=null)head.rotation=Quaternion.AngleAxis(Mathf.Clamp(-turn.Offset-turn.Lead,-25,25),transform.up)*head.rotation;}
                    if(leftGrip!=null)ApplyCarryPose(current.Kind==HeroMotionKind.Run);if(rigPixelMotion&&current.Kind==HeroMotionKind.Run)PlantRunFeet();return;
                case HeroMotionKind.Swing:grip=SwingPose(current.Combo,t,current.ContactPhase);break;
                case HeroMotionKind.Recover:grip=Lerp(SwingPose(current.Combo,1,current.ContactPhase),ReadyPose(),t);break;
                case HeroMotionKind.Bash:grip=BashPose(t);break;
                case HeroMotionKind.BashRecover:grip=Lerp(BashPose(1),ReadyPose(),t);break;
                case HeroMotionKind.Charge:grip=Lerp(ReadyPose(),new GripPose(new Vector3(.08f,1.62f,.02f),new Vector3(.05f,.94f,-.32f),.12f,-.10f,.03f),Mathf.Min(1,.5f+t));break;
                case HeroMotionKind.Chain:grip=new GripPose(new Vector3(.30f,1.10f,.06f),new Vector3(.16f,-.58f,-.80f),.25f,0);twoHands=false;break;
                case HeroMotionKind.SlamWindup:case HeroMotionKind.SlamStrike:case HeroMotionKind.SlamRecover:grip=SlamGrip(current);break;
                case HeroMotionKind.Guard:grip=new GripPose(new Vector3(.14f,1.25f,.30f),new Vector3(-.18f,.88f,.43f),-.15f,-.12f,.025f);break;
                case HeroMotionKind.Cast:grip=Lerp(ReadyPose(),new GripPose(new Vector3(.32f,1.20f,.15f),new Vector3(.7f,-.38f,.6f),-.15f,.12f),Mathf.Sin(t*Mathf.PI));twoHands=false;break;
                case HeroMotionKind.Hurt:grip=Lerp(new GripPose(new Vector3(.20f,1.12f,.18f),new Vector3(.55f,-.40f,.73f),.32f,-.15f,.06f),ReadyPose(),t);break;
                case HeroMotionKind.Roll:
                    grip=new GripPose(new Vector3(.12f,1.15f,.22f),new Vector3(.15f,.58f,-.8f),-.40f,0,NativeHeroMotionClock.RollLowering(t));
                    pose.bodyRotation=pose.bodyRotation*Quaternion.Euler(360*Ease(t),0,0);break;
                case HeroMotionKind.Dead:
                    grip=new GripPose(new Vector3(.22f,1.05f,.12f),new Vector3(.75f,-.35f,.5f),-.5f,0,.70f*Ease(t));
                    pose.bodyRotation=pose.bodyRotation*Quaternion.Euler(84*Ease(t),0,-8*Ease(t));twoHands=false;break;
            }
            if(!bodyWeight.Active)
            {BlendMuscle(spineBend,grip.Bend*.6f,weight);BlendMuscle(chestBend,grip.Bend*.4f,weight);BlendMuscle(spineTwist,grip.Twist*.6f,weight);BlendMuscle(chestTwist,grip.Twist*.4f,weight);}
            float lowering=current.Kind==HeroMotionKind.Roll?grip.Lower:grip.Lower*weight;
            lowering+=bodyWeight.Drop;
            pose.bodyPosition+=Vector3.down*(lowering/Mathf.Max(.1f,animator.humanScale));
            poseHandler.SetHumanPose(ref pose);
            if(current.Kind==HeroMotionKind.Roll){ApplyRollTuck(t);FitRollBodyToFloor(t);return;}
            if(current.Kind==HeroMotionKind.Dead)return;
            if(bodyWeight.Active&&hips!=null)
            {
                // 몸의 체중만 옮긴다. 손/칼의 기존 목표와 게임 루트·조준축은 유지한다.
                hips.position+=transform.TransformVector(new Vector3(bodyWeight.Side,0,bodyWeight.Forward));
                hips.rotation=Quaternion.AngleAxis(bodyWeight.PelvisYaw,transform.up)*hips.rotation;
                if(chest!=null)chest.rotation=Quaternion.AngleAxis(bodyWeight.ChestYaw,transform.up)*Quaternion.AngleAxis(bodyWeight.ChestPitch,transform.right)*chest.rotation;
            }
            if(lowering>.00001f||bodyWeight.Active)
            {
                // 정지 1·2타의 뒷발만 실제 발가락 본을 축으로 굴린다. 지지발과 이동 보행은 원 포즈를 보존한다.
                var footwork=NativeHeroMotionClock.Footwork(current,observed.Moving);
                bool leftPivot=leftToes!=null&&PivotFoot(ref leftFootPosition,ref leftFootRotation,leftToePosition,footwork.LeftPitch,footwork.LeftYaw);
                bool rightPivot=rightToes!=null&&PivotFoot(ref rightFootPosition,ref rightFootRotation,rightToePosition,footwork.RightPitch,footwork.RightYaw);
                SolveArm(leftThigh,leftShin,leftFoot,leftFootPosition,transform.forward-transform.right*.12f);
                SolveArm(rightThigh,rightShin,rightFoot,rightFootPosition,transform.forward+transform.right*.12f);
                if(leftFoot!=null)leftFoot.rotation=leftFootRotation;if(rightFoot!=null)rightFoot.rotation=rightFootRotation;
                if(leftToes!=null&&rightToes!=null&&(leftPivot||rightPivot))
                {
                    FootPivotActive=true;
                    FootPlantError=Mathf.Max(Vector3.Distance(leftToes.position,leftToePosition),Vector3.Distance(rightToes.position,rightToePosition));
                }
            }
            var rightBaseUpper=rightUpper.localRotation;var rightBaseFore=rightFore.localRotation;var rightBaseHand=rightHand.localRotation;
            var desiredHand=transform.TransformPoint(grip.Hand);
            SolveArm(rightUpper,rightFore,rightHand,desiredHand,transform.right+transform.forward*.25f);
            var desiredBlade=transform.TransformDirection(grip.Blade.normalized);
            rightHand.rotation=Quaternion.FromToRotation(-socket.up,desiredBlade)*rightHand.rotation;
            var fixedHandRotation=rightHand.rotation;
            if(twoHands&&leftGrip!=null)
            {
                desiredHand=FitTwoHandTarget(desiredHand,fixedHandRotation);
                SolveArm(rightUpper,rightFore,rightHand,desiredHand,transform.right+transform.forward*.25f);
                rightHand.rotation=fixedHandRotation;
            }
            if(current.Kind==HeroMotionKind.SlamWindup&&TryGetBladeTip(out var bladeTip))
            {
                // 첫10틱의 접점만 실제 칼끝으로 맞춘다. 원래 손 목표에서 매번 재계산하여 누적하지 않는다.
                float height=Vector3.Dot(bladeTip-transform.position,transform.up);
                desiredHand+=transform.up*NativeHeroMotionClock.BladeContactLift(current.Kind,height,current.Phase);
                if(twoHands&&leftGrip!=null)desiredHand=FitTwoHandTarget(desiredHand,fixedHandRotation);
                SolveArm(rightUpper,rightFore,rightHand,desiredHand,transform.right+transform.forward*.25f);
                rightHand.rotation=leftGrip!=null?fixedHandRotation:Quaternion.FromToRotation(-socket.up,desiredBlade)*rightHand.rotation;
            }
            BlendArm(rightUpper,rightFore,rightHand,rightBaseUpper,rightBaseFore,rightBaseHand,weight);
            var leftBaseUpper=leftUpper.localRotation;var leftBaseFore=leftFore.localRotation;var leftBaseHand=leftHand.localRotation;
            if(twoHands)
            {
                // 손잡이 -0.15m의 오른손 중심보다 폼멜 쪽 9cm에 보조 손을 고정한다.
                var target=socket.position+socket.up*.09f;
                var handRotation=rightHand.rotation*leftGripRelative;
                if(leftGrip!=null)
                {
                    // 새 장갑은 손목과 파지 중심이 다르다. 실제 모델의 본 부착 중심을 손잡이에 맞춘다.
                    var gripRotation=Quaternion.Inverse(leftHand.rotation)*leftGrip.rotation;
                    var gripOffset=Quaternion.Inverse(leftHand.rotation)*(leftGrip.position-leftHand.position);
                    handRotation=socket.rotation*Quaternion.Inverse(gripRotation);
                    target-=handRotation*gripOffset;
                }
                SolveArm(leftUpper,leftFore,leftHand,target,-transform.right+transform.forward*.20f);
                leftHand.rotation=handRotation;
            }
            else if(current.Kind==HeroMotionKind.Cast||current.Kind==HeroMotionKind.Chain)
            {
                SolveArm(leftUpper,leftFore,leftHand,transform.TransformPoint(new Vector3(-.18f,1.26f,.48f)),-transform.right);
            }
            BlendArm(leftUpper,leftFore,leftHand,leftBaseUpper,leftBaseFore,leftBaseHand,weight);
        }

        void PlantRunFeet()
        {
            if(leftToes==null||rightToes==null)return;
            if((leftPlanted||rightPlanted)&&Vector3.Dot(plantFacing,transform.forward)<.9063f)leftPlanted=rightPlanted=false;
            float phase=gait.Phase;
            PlantFoot(leftThigh,leftShin,leftFoot,leftToes,phase>=.29f&&phase<=.43f,ref leftPlanted,ref leftPlant,transform.forward-transform.right*.12f);
            PlantFoot(rightThigh,rightShin,rightFoot,rightToes,phase>=.83f&&phase<=.96f,ref rightPlanted,ref rightPlant,transform.forward+transform.right*.12f);
            if(leftPlanted||rightPlanted)plantFacing=transform.forward;
        }
        void PlantFoot(Transform thigh,Transform shin,Transform foot,Transform toe,bool contact,ref bool planted,ref Vector3 point,Vector3 hint)
        {
            if(!contact){planted=false;return;}
            if(!planted||Vector3.Distance(point,toe.position)>.15f){point=toe.position;planted=true;}
            var rotation=foot.rotation;var target=foot.position+(point-toe.position);
            SolveArm(thigh,shin,foot,target,hint);foot.rotation=rotation;
            GaitFootPlantError=Mathf.Max(GaitFootPlantError,Vector3.Distance(toe.position,point));
        }

        bool PivotFoot(ref Vector3 ankle,ref Quaternion rotation,Vector3 toe,float pitch,float yaw)
        {
            if(pitch==0&&yaw==0)return false;
            var forward=Vector3.ProjectOnPlane(toe-ankle,transform.up);
            if(forward.sqrMagnitude<.000001f)return false;
            var axis=Vector3.Cross(transform.up,forward.normalized);
            var turn=Quaternion.AngleAxis(yaw,transform.up)*Quaternion.AngleAxis(pitch,axis);
            ankle=toe+turn*(ankle-toe);rotation=turn*rotation;return true;
        }

        void ApplyRollTuck(float phase)
        {
            if(hips==null)return;
            float tuck=NativeHeroMotionClock.RollTuckWeight(phase);
            var rolling=transform.rotation*Quaternion.Euler(360*Ease(phase),0,0);
            if(chest!=null)chest.rotation=Quaternion.AngleAxis(50*tuck,transform.right)*chest.rotation;
            if(head!=null)head.rotation=Quaternion.AngleAxis(20*tuck,transform.right)*head.rotation;
            TuckLeg(leftThigh,leftShin,leftFoot,rolling,tuck);TuckLeg(rightThigh,rightShin,rightFoot,rolling,tuck);
            var r0=rightUpper.localRotation;var r1=rightFore.localRotation;var r2=rightHand.localRotation;
            SolveArm(rightUpper,rightFore,rightHand,hips.position+rolling*new Vector3(.14f,.14f,.12f),rolling*(Vector3.right+Vector3.forward*.20f));
            // 긴 대검은 바닥에 가까운 진행축을 유지하고, 파지점과 팔꿈치만 몸 가까이 묶는다.
            rightHand.rotation=Quaternion.FromToRotation(-socket.up,transform.TransformDirection(new Vector3(.10f,.10f,-.99f).normalized))*rightHand.rotation;
            BlendArm(rightUpper,rightFore,rightHand,r0,r1,r2,tuck);
            var l0=leftUpper.localRotation;var l1=leftFore.localRotation;var l2=leftHand.localRotation;
            SolveArm(leftUpper,leftFore,leftHand,socket.position+socket.up*.09f,rolling*(-Vector3.right+Vector3.forward*.20f));
            leftHand.rotation=rightHand.rotation*leftGripRelative;BlendArm(leftUpper,leftFore,leftHand,l0,l1,l2,tuck);
        }
        static void TuckLeg(Transform thigh,Transform shin,Transform foot,Quaternion rolling,float tuck)
        {
            if(thigh==null||shin==null||foot==null)return;
            float length=Vector3.Distance(thigh.position,shin.position)+Vector3.Distance(shin.position,foot.position);
            NativeHeroMotionClock.TuckFootOffset(length,out float down,out float back);
            var target=Vector3.Lerp(foot.position,thigh.position+rolling*new Vector3(0,-down,-back),tuck);
            var rotation=foot.rotation;SolveArm(thigh,shin,foot,target,rolling*Vector3.forward);foot.rotation=rotation;
        }
        void FitRollBodyToFloor(float phase)
        {
            if(bodyRenderer==null||rollBakeMesh==null||rollBodyIndices==null||rollBodyIndices.Length==0||hips==null)return;
            if(rollGroundTick!=observed.Tick||rollGroundPhase!=phase)
            {
                bodyRenderer.BakeMesh(rollBakeMesh,false);rollBakeMesh.GetVertices(rollVertices);
                var toModel=transform.worldToLocalMatrix*bodyRenderer.transform.localToWorldMatrix;
                float min=float.MaxValue;foreach(int index in rollBodyIndices)if(index<rollVertices.Count)min=Mathf.Min(min,toModel.MultiplyPoint3x4(rollVertices[index]).y);
                float clearance=.03f*NativeHeroMotionClock.RollTuckWeight(phase);
                rollGroundShift=min<float.MaxValue?clearance-min:0;
                rollGroundTick=observed.Tick;rollGroundPhase=phase;
            }
            // 모델/게임 루트는 건드리지 않는다. 양끝 clearance0으로 기립 복귀의 새 높이 팝을 피한다.
            hips.position+=transform.TransformVector(Vector3.up*rollGroundShift);
        }

        static void BlendArm(Transform upper,Transform fore,Transform hand,Quaternion baseUpper,Quaternion baseFore,Quaternion baseHand,float weight)
        {
            upper.localRotation=Quaternion.Slerp(baseUpper,upper.localRotation,weight);
            fore.localRotation=Quaternion.Slerp(baseFore,fore.localRotation,weight);
            hand.localRotation=Quaternion.Slerp(baseHand,hand.localRotation,weight);
        }

        static void SolveArm(Transform upper,Transform fore,Transform hand,Vector3 target,Vector3 hint)
        {
            if(upper==null||fore==null||hand==null)return;
            var a=upper.position;float l1=Vector3.Distance(a,fore.position),l2=Vector3.Distance(fore.position,hand.position);
            if(l1<.001f||l2<.001f)return;
            Vector3 delta=target-a;float distance=Mathf.Clamp(delta.magnitude,Mathf.Abs(l1-l2)+.001f,l1+l2-.001f);
            Vector3 direction=delta.sqrMagnitude>.000001f?delta.normalized:Vector3.forward;
            var bend=Vector3.ProjectOnPlane(hint,direction).normalized;
            if(bend.sqrMagnitude<.001f)bend=Vector3.Cross(direction,Vector3.up).normalized;
            float along=(l1*l1+distance*distance-l2*l2)/(2*distance),height=Mathf.Sqrt(Mathf.Max(0,l1*l1-along*along));
            var elbow=a+direction*along+bend*height;
            upper.rotation=Quaternion.FromToRotation(fore.position-a,elbow-a)*upper.rotation;
            fore.rotation=Quaternion.FromToRotation(hand.position-fore.position,(a+direction*distance)-fore.position)*fore.rotation;
        }
    }
#endif
}
