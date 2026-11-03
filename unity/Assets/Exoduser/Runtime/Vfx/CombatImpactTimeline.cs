using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Web game.html: _addBoom/_boomGrow, _addImpact/_impactSpriteFor,
    // doParry TVFX2, deathFX and activateRoll/_finishRoll. No Unity or gameplay state.
    public enum CombatClipMode { Boom, Impact, Flipbook, Death, Electric, SlashBurst, Blood }
    public sealed class CombatClip
    {
        public string Sheet, Fallback;
        public int Cols, Rows, Frames, Life, Delay;
        public double FrameTicks, Scale = 1, Width, Angle, Opacity = 1, Stretch = 1;
        public bool Additive, Flat;
        public CombatClipMode Mode;
        public int Frame(double age) {
            age -= Delay;
            if(age<0||age>=Life)return -1;
            return Math.Min(Frames-1,(int)(FrameTicks>0?age/FrameTicks:age/Life*Frames));
        }
        public double DrawWidth(double age,double cellWidth) {
            double p=Math.Max(0,Math.Min(1,(age-Delay)/Life));
            if(Mode==CombatClipMode.Boom)return Width*(.6+.4*Math.Sqrt(Math.Min(1,p*8)));
            if(Mode==CombatClipMode.Impact)return cellWidth*Scale*((Scale==2.5?.92:.8)+p*.6);
            if(Mode==CombatClipMode.Flipbook)return cellWidth*Scale*(1+p*.4);
            return Width>0?Width:cellWidth*Scale;
        }
        public double Alpha(double age) {
            if(age<Delay||age>=Delay+Life)return 0;
            double p=Math.Max(0,Math.Min(1,(age-Delay)/Life));int f=Math.Max(0,Frame(age));
            // The longer critical stream remains peripheral/transparent after
            // 12 ticks (.2s), even though its last frames live until tick18.
            if(Mode==CombatClipMode.Blood)return Math.Min(.8,Math.Max(0,(Life-(age-Delay))/Math.Max(1,Life-6)))*Opacity;
            if(Mode==CombatClipMode.Boom)return (1-p*.5)*Opacity;
            if(Mode==CombatClipMode.Impact)return (1-p)*(Scale==2.5?.62:.45);
            if(Mode==CombatClipMode.Electric)return (f<5?1:1-(f-5)/4.0*.9)*.45;
            if(Mode==CombatClipMode.SlashBurst)return .45;
            if(Mode==CombatClipMode.Death)return Math.Min(1,1.5*(1-p*.3));
            if(Mode==CombatClipMode.Flipbook)return Math.Max(0,(p<.6?1:1-(p-.6)/.4)*.7);
            return 1;
        }
    }
    public sealed class CombatImpactTimeline
    {
        int budgetTick=int.MinValue,hitCount;
        public const int SortOrder=-10000, HitCapacity=12, BoomCapacity=12, MaxHitDraw=4;
        public static double ParticleTravel(double velocity,double gravity,double age) {
            double terminal=gravity*.9/.1;
            return terminal*age+(velocity-terminal)*(1-Math.Pow(.9,age))/.1;
        }
        public bool AdmitHit(int tick,bool boss) {if(tick!=budgetTick){budgetTick=tick;hitCount=0;}return ++hitCount<=2||boss;}
        public void Reset(){budgetTick=int.MinValue;hitCount=0;}
        static CombatClip Boom(string sheet,int life,double width,int frames=16,bool flat=false) {
            return new CombatClip{Sheet=sheet,Cols=4,Rows=4,Frames=frames,Life=Math.Max(66,life),Width=width,Flat=flat,Mode=CombatClipMode.Boom};
        }
        static CombatClip Flip(string sheet,int cols,int rows,double scale,int delay,int ticks) {
            return new CombatClip{Sheet=sheet,Cols=cols,Rows=rows,Frames=cols*rows,Scale=scale,Delay=delay,Life=cols*rows*ticks,FrameTicks=ticks,Additive=true,Mode=CombatClipMode.Flipbook};
        }
        public static List<CombatClip> Plan(FeedbackEvent e) {
            var result=new List<CombatClip>();
            if(e.Kind==FeedbackKind.Parry){
                if(new CombatParryPresentation().IsMelee(e))return result;
                if(e.Source=="waterBean") {
                    result.Add(Boom("Ice_ImpactIce_Sheet",72,96*3));
                    var mist=Boom("Ice_MistSmoke_FBF_4x4",72,96*3.4);mist.Delay=3;mist.Life=69;mist.Opacity=.8;result.Add(mist);
                }else if(e.SampleKey=="rainbow") {
                    string[] sheets={"Poison_MediumImpact","Dark_DarkSmoke_FBF_4x4","Light_ImpactLight_Sheet","Ice_ImpactIce_Sheet"};
                    for(int i=0;i<4;i++){var c=Boom(sheets[i],72,80*(2.8+i*.3));c.Additive=true;c.Delay=(int)Math.Round(72*i*.03);c.Life=72-c.Delay;c.Angle=i*Math.PI*.5;c.Opacity=1-i*.15;result.Add(c);}
                }else if(e.Step==1)result.Add(Boom("Dark_MediumImpact",72,80*3));
                else if(e.Source=="physicalProjectile")result.Add(Boom("Fire_ImpactFire_Sheet",12,60*3,4,true));
                else {
                    result.Add(Flip("Lightning_ImpactLightning_Sheet_el4",4,4,1.2,0,5));
                    result.Add(Flip("Lightning_Lightning_FBF_4x3_el4",4,3,1.1*1.2,1,7));
                    result.Add(Flip("Lightning_BasicImpact_el4",3,3,.5*1.2,0,7));
                }
            }else if(e.VisualOnly&&(e.Kind==FeedbackKind.EnemyHit||e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit)) {
                int el=e.Element;bool hasElement=el>=0&&el<=5;
                result.Add(new CombatClip{Sheet=hasElement?"impact_el"+el+(e.IsBoss?"_boss_sheet":"_sheet"):"impact_basic_sheet",Fallback="impact_basic_sheet",Cols=e.IsBoss&&hasElement?16:9,Rows=1,Frames=e.IsBoss&&hasElement?16:9,Life=16,Scale=e.IsBoss?2.5:1,Mode=CombatClipMode.Impact,Additive=true});
                if(el==4){var c=Flip("boss/vfx_holy_burst",3,3,e.IsBoss?.18:.1,0,3);c.Mode=CombatClipMode.Electric;result.Add(c);}
                else{var c=Flip("impact_basic_sheet",9,1,e.IsBoss?.7:.4,0,3);c.FrameTicks=2.4;c.Life=22;c.Mode=CombatClipMode.SlashBurst;result.Add(c);}
                bool heavy=e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit||e.IsBoss;
                result.Add(new CombatClip{Sheet="Blood_FBF_4x4_dark",Cols=4,Rows=4,Frames=16,Life=heavy?18:9,
                    Width=Math.Max(1,e.Size)*2*(heavy?1:.6),Stretch=1.6,Angle=e.Angle,Additive=false,Mode=CombatClipMode.Blood,
                    Opacity=heavy?.7:1});
            }else if((e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath)&&e.Source!="druid_sink") {
                double scale=Math.Max(.8,Math.Min(4.8,.35+Math.Max(1,e.Size)*.075));
                result.Add(new CombatClip{Sheet="Blood_FBF_4x4_dark",Cols=4,Rows=4,Frames=16,
                    Life=e.IsBoss?96:64,Width=128*scale,Angle=e.Angle,Additive=false,Mode=CombatClipMode.Death});
            }
            return result;
        }
    }

    // Pure presentation policy. Never reads/writes simulation rules or its RNG.
    public sealed class CombatParryPresentation
    {
        public sealed class Spark {public int Delay,Life;public double Angle,Length,Thickness,Speed,Color;public bool ReverseFan;}
        public bool IsMelee(FeedbackEvent e) {
            if(e.Kind!=FeedbackKind.Parry||!string.IsNullOrEmpty(e.SampleKey))return false;
            return string.IsNullOrEmpty(e.Source)||e.Source=="contact"||e.Source=="swing"||e.Source=="slam"||e.Source=="charge"||e.Source=="combo"||e.Source.StartsWith("melee",StringComparison.Ordinal);
        }
        public bool HasFlash(FeedbackEvent e){return IsMelee(e)&&e.Step==1;}
        public Spark[] Sparks(FeedbackEvent e,int seed) {
            if(!IsMelee(e))return Array.Empty<Spark>();
            var rng=new Random(seed);int n=e.Step==1?rng.Next(80,131):rng.Next(30,61);
            var lines=new Spark[n];int initial=(int)Math.Round(n*.3),fan=(int)Math.Round(n*.7);
            for(int i=0;i<n;i++) {
                bool reverse=i<fan;
                lines[i]=new Spark{Delay=i<initial?0:1+(i-initial)*3/(n-initial),Life=rng.Next(18,31),
                    ReverseFan=reverse,Angle=e.Angle+Math.PI+(rng.NextDouble()-.5)*(reverse?Math.PI:Math.PI*2),
                    Length=.10+rng.NextDouble()*.15,Thickness=1+rng.NextDouble(),Speed=.025+rng.NextDouble()*.04,Color=rng.NextDouble()};
            }
            return lines;
        }
        public double SparkAlpha(Spark s,double age) {
            if(age<s.Delay||age>=s.Life)return 0;
            return age<=3?.3+.7*age/3:Math.Pow((s.Life-age)/(s.Life-3),1.5);
        }
        public double SparkLength(Spark s,double age){return Math.Max(.05,s.Length*(1-Math.Max(0,age-3)/(s.Life-3)*.7));}
        public double FlashAlpha(double age,bool linear) {
            if(age<0||age>=6)return 0;
            // Linear framebuffer blending needs the stricter cap: sRGB(0.02)*255
            // is 38.7 even over black. Gamma framebuffer maximum is 38.25.
            return (linear?.02:.15)*(age<1?age:1-(age-1)/5);
        }
        public bool ParsePushIn(string[] args){return Array.IndexOf(args,"--unity-parry-camera=pushin")>=0;}
        public double CameraScale(double age,bool pushIn) {
            if(!pushIn||age<=0||age>=28)return 1;
            return 1-.025*(age<=8?age/8:1-(age-8)/20);
        }
    }

    // Presentation-only clock and fixed pool; the view owns eight reusable
    // ground projections. Core events and its random stream are never modified.
    public sealed class CombatBloodDecals
    {
        public const int Capacity=8, HoldTicks=210, FadeTicks=60;
        public sealed class Stamp {public int Born,Frame;public float X,Y,Width;public double Angle;public bool Active;public long Serial;}
        public readonly Stamp[] Slots=new Stamp[Capacity];long serial;
        public CombatBloodDecals(){for(int i=0;i<Capacity;i++)Slots[i]=new Stamp();}
        public static bool ShouldStamp(FeedbackEvent e) {
            if(e.Source=="druid_sink")return false;
            return e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath||
                (e.VisualOnly&&(e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit));
        }
        public int Add(FeedbackEvent e,int frame,double angle) {
            int index=0;long oldest=long.MaxValue;
            for(int i=0;i<Capacity;i++) {
                if(Alpha(i,e.Tick)<=0){index=i;break;}
                if(Slots[i].Serial<oldest){oldest=Slots[i].Serial;index=i;}
            }
            var s=Slots[index];s.Born=e.Tick;s.X=e.X;s.Y=e.Y;s.Width=Math.Max(1,e.Size)*2;
            s.Frame=Math.Max(12,Math.Min(15,frame));s.Angle=angle;s.Active=true;s.Serial=++serial;return index;
        }
        public double Alpha(int index,int tick) {
            var s=Slots[index];long age=(long)tick-s.Born;
            return !s.Active||age<0||age>=HoldTicks+FadeTicks?0:age<=HoldTicks?1:1-(age-HoldTicks)/(double)FadeTicks;
        }
        public void Reset(){foreach(var s in Slots)s.Active=false;serial=0;}
    }
}
