using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Screen pixels, Y up. The enemy lane owns the ratios; no duplicate formula.
    public struct CombatHitAnchor
    {
        public bool UseBody;
        public double OffsetY,DrawWidth;
        public static CombatHitAnchor Resolve(double footY,double bottomY,double topY,FeedbackKind kind,double chestRatio=double.NaN,bool large=false) {
            if(double.IsNaN(footY)||double.IsInfinity(footY)||double.IsNaN(bottomY)||double.IsInfinity(bottomY)||
                double.IsNaN(topY)||double.IsInfinity(topY)||topY<=bottomY)return default;
            double height=topY-bottomY;
            bool heavy=kind==FeedbackKind.EnemyCrit||kind==FeedbackKind.BossHit||kind==FeedbackKind.EnemyDeath||kind==FeedbackKind.BossDeath;
            return new CombatHitAnchor{UseBody=true,OffsetY=bottomY-footY+height*NativeEnemyRigPolicy.AnchorRatio(chestRatio),
                DrawWidth=height*NativeEnemyRigPolicy.ImpactRatio(heavy?1:0,large)};
        }
        public static bool Applies(bool perspective,int targetId,FeedbackKind kind,CombatClipMode mode) {
            return perspective&&targetId!=0&&(kind==FeedbackKind.EnemyHit||kind==FeedbackKind.EnemyCrit||kind==FeedbackKind.BossHit)&&
                (mode==CombatClipMode.Impact||mode==CombatClipMode.Core||mode==CombatClipMode.SlashBurst||mode==CombatClipMode.Electric||mode==CombatClipMode.Blood);
        }
    }
    // Web game.html: _addBoom/_boomGrow, _addImpact/_impactSpriteFor,
    // doParry TVFX2, deathFX and activateRoll/_finishRoll. No Unity or gameplay state.
    public enum CombatClipMode { Boom, Impact, Flipbook, Death, Electric, SlashBurst, Blood, Core }
    public sealed class CombatClip
    {
        public string Sheet, Fallback;
        public int Cols, Rows, Frames, Life, Delay, Element;
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
            // G1: Width>0 is the hero-height based Core px size (long axis = Width*Stretch at the end of life).
            if(Mode==CombatClipMode.Impact)return Width>0?Width*(.8+.2*p):cellWidth*Scale*((Scale==2.5?.92:.8)+p*.6);
            if(Mode==CombatClipMode.Core)return Width;
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
            if(Mode==CombatClipMode.Core)return CombatHitLook.CoreAlpha(age-Delay)*Opacity;
            if(Mode==CombatClipMode.Impact)return Width>0?(1-p)*CombatHitLook.BodyAlpha:(1-p)*(Scale==2.5?.62:.45);
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
        public static List<CombatClip> Plan(FeedbackEvent e,double heroH=CombatHitLook.DefaultHeroH) {
            var result=new List<CombatClip>();
            if(e.Kind==FeedbackKind.Parry){
                if(e.MeleeParry||new CombatParryPresentation().IsMelee(e))return result;
                if(e.Source=="waterBean") {
                    // RETOUCH 4: VFX master water ramp instead of the web's bright cartoon cyan (tools/vfx/recolor_parry_water.py).
                    // Frames 12-15 are only loose droplets, so the impact stops at frame 11.
                    result.Add(Boom("Ice_ImpactIce_Sheet_water",72,96*3,12));
                    var mist=Boom("Ice_MistSmoke_FBF_4x4_water",72,96*3.4);mist.Delay=3;mist.Life=69;mist.Opacity=.6;result.Add(mist);
                }else if(e.SampleKey=="rainbow") {
                    string[] sheets={"Poison_MediumImpact_pal","Dark_DarkSmoke_FBF_4x4","Light_ImpactLight_Sheet","Ice_ImpactIce_Sheet_pal"};
                    for(int i=0;i<4;i++){var c=Boom(sheets[i],72,80*(2.8+i*.3));c.Additive=true;c.Delay=(int)Math.Round(72*i*.03);c.Life=72-c.Delay;c.Angle=i*Math.PI*.5;c.Opacity=1-i*.15;result.Add(c);}
                }else if(e.Step!=1&&e.Source=="physicalProjectile")result.Add(Boom("Fire_ImpactFire_Sheet",12,60*3,4,true));
                // Other bullet parries: warm line sparks only (CombatParryPresentation). The web's dark02 purple star and the
                // three yellow lightning sheets read as an element hit, not a parry (user 11-03 "패링구현이 엉망").
            }else if(e.VisualOnly&&(e.Kind==FeedbackKind.EnemyHit||e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit)) {
                int el=e.Element;bool hasElement=el>=0&&el<=5;
                // G1 ENEMY_HIT_IMPACT 11-04: one body sheet (attack direction, Stretch 1.3) + one warm core. No silver crescent
                // overlay, no lightning burst sheet; sparks are drawn by CombatImpactView from CombatHitLook.Sparks.
                int tier=CombatHitLook.Tier(e);
                result.Add(new CombatClip{Sheet=hasElement?"impact_el"+el+(e.IsBoss?"_boss_sheet_v2":"_sheet_v2"):"impact_basic_sheet",Fallback="impact_basic_sheet",Cols=e.IsBoss&&hasElement?16:9,Rows=1,Frames=e.IsBoss&&hasElement?16:9,
                    Life=CombatHitLook.BodyLife(tier),Delay=CombatHitLook.BodyDelay,Scale=e.IsBoss?2.5:1,Mode=CombatClipMode.Impact,Additive=true,
                    Width=heroH*CombatHitLook.BodySize(tier)/CombatHitLook.BodyStretch,Stretch=CombatHitLook.BodyStretch,Angle=e.Angle});
                result.Add(new CombatClip{Frames=1,Cols=1,Rows=1,Life=CombatHitLook.CoreTicks,Mode=CombatClipMode.Core,Additive=true,
                    Width=heroH*CombatHitLook.CoreSize(tier),Element=CombatHitLook.ElementRow(el)});
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

    // G1 (docs/5.1임펙트디자인/ENEMY_HIT_IMPACT_G1_20261104.md): one hit = warm core -> one body sheet -> thin line sparks -> blood.
    // Sizes are in hero heights H (Core px), colours are the VFX master §2.2 palette only. Pure presentation, no Core state.
    public static class CombatHitLook
    {
        public const double DefaultHeroH=131,BodyStretch=1.3;
        public const int CoreTicks=5,CorePeakTick=2,BodyDelay=1,SparkGainTicks=4;
        // Body opacity (was .45/.62 and under the core at 1x) and spark HDR gain over the first SparkGainTicks ticks.
        public const double BodyAlpha=.85,SparkGain=1.4;
        public const uint CoreStart=0xfff4d0;
        // Soft core texture (11-04 soft-core, hot centre r3): radial, no rim. Alpha (1-r)^3.5 and 0 from r .95; colour CoreStart up to r .25,
        // then -> element core colour at r .5 and beyond. Peak shader opacity 2.6: the centre clips near white and blooms (>1.1), the edge stays soft.
        public const int CoreTexSize=128;
        public const double CoreRimCut=.95,CoreHotRadius=.25,CoreMidRadius=.5,CorePeakOpacity=2.6;
        public static double CoreTexAlpha(double r){r=Math.Max(0,r);return r>=CoreRimCut?0:Math.Pow(1-r,3.5);}
        public static uint CoreTexRgb(int row,double r){return Mix(CoreStart,CoreRgb[Math.Max(0,Math.Min(6,row))],Math.Max(0,Math.Min(1,(r-CoreHotRadius)/(CoreMidRadius-CoreHotRadius))));}
        // Shader _Opacity: the 0..1 beat curve times the peak.
        public static double CoreOpacity(double age){return CoreAlpha(age)*CorePeakOpacity;}
        static uint Mix(uint from,uint to,double t) {
            uint rgb=0;
            for(int shift=16;shift>=0;shift-=8){
                double a=(from>>shift)&255,b=(to>>shift)&255;rgb|=(uint)Math.Round(a+(b-a)*t)<<shift;
            }
            return rgb;
        }
        // physical, fire, ice, dark, lightning, holy, earth/none
        public static readonly uint[] CoreRgb={0xefe6d2,0xffd9a0,0xe8f3f8,0xcdb2e0,0xfff4d0,0xfff2d6,0xdcc8a4};
        public static int ElementRow(int element){return element>=0&&element<=5?element:6;}
        public static int Tier(FeedbackEvent e){return e.IsBoss||e.Kind==FeedbackKind.BossHit?2:e.Kind==FeedbackKind.EnemyCrit?1:0;}
        public static bool Heavy(FeedbackEvent e){return Tier(e)>0;}
        public static double BodySize(int tier){return tier==2?2.6:tier==1?2.2:1.6;}
        public static double CoreSize(int tier){return tier==2?.6:tier==1?.5:.35;}
        // .2s normal, .25s critical/boss (G1: .12-.25s).
        public static int BodyLife(int tier){return tier==0?12:15;}
        public static double CoreAlpha(double age) {
            if(age<0||age>=CoreTicks)return 0;
            return age<CorePeakTick?.35+.65*age/CorePeakTick:(CoreTicks-age)/(CoreTicks-CorePeakTick);
        }
        public static uint CoreColor(int row,double age) {
            return Mix(CoreStart,CoreRgb[Math.Max(0,Math.Min(6,row))],Math.Max(0,Math.Min(1,age/4)));
        }
        sealed class Row {
            public int Min,Max,HMin,HMax,LifeMin,LifeMax;public double LenMin,LenMax,Thick,SpeedMin,SpeedMax,Gravity,Fan;
            public uint From,To;public bool Aged,Normal,Chain;
        }
        static readonly Row[] Rows={
            // physical: metal spark lines, fan behind the strike, falling
            new Row{Min=6,Max=10,HMin=12,HMax=18,LifeMin=14,LifeMax=21,LenMin=.15,LenMax=.375,Thick=2,SpeedMin=.03,SpeedMax=.065,Gravity=.00065,Fan=Math.PI/3,From=0xf5e5d5,To=0xf0debd},
            // fire: short embers that rise and burn out
            new Row{Min=5,Max=8,HMin=10,HMax=14,LifeMin=15,LifeMax=21,LenMin=.15,LenMax=.24,Thick=2,SpeedMin=.012,SpeedMax=.03,Gravity=-.0009,Fan=Math.PI/2,From=0xffd9a0,To=0xd8562a,Aged=true},
            // ice: short straight shards, 2 px
            new Row{Min=4,Max=6,HMin=8,HMax=10,LifeMin=14,LifeMax=20,LenMin=.15,LenMax=.24,Thick=2,SpeedMin=.03,SpeedMax=.055,Gravity=.0007,Fan=Math.PI/3,From=0xe8f3f8,To=0x5f98c0,Aged=true},
            // dark: no lines, the body smoke is the whole read
            new Row{},
            // lightning: 2-3 segment kinked branches, visible 3-4 ticks (count = branches)
            new Row{Min=3,Max=4,HMin=6,HMax=6,LifeMin=3,LifeMax=4,LenMin=.105,LenMax=.1245,Thick=2,SpeedMin=0,SpeedMax=0,Gravity=0,Fan=Math.PI,From=0xfff4d0,To=0xc8a848,Aged=true,Chain=true},
            // holy: thin slow ash lines drifting up
            new Row{Min=4,Max=6,HMin=8,HMax=8,LifeMin=18,LifeMax=21,LenMin=.15,LenMax=.21,Thick=2,SpeedMin=.006,SpeedMax=.015,Gravity=-.0003,Fan=Math.PI,From=0xfff2d6,To=0xc9a45e,Aged=true},
            // earth / none: soil chips, alpha blended, falling
            new Row{Min=4,Max=6,HMin=8,HMax=8,LifeMin=14,LifeMax=20,LenMin=.15,LenMax=.24,Thick=2,SpeedMin=.025,SpeedMax=.05,Gravity=.0009,Fan=Math.PI*.4,From=0xdcc8a4,To=0x7e6236,Aged=true,Normal=true}
        };
        public static CombatParryPresentation.Spark[] Sparks(FeedbackEvent e,int seed) {
            if(!e.VisualOnly||(e.Kind!=FeedbackKind.EnemyHit&&e.Kind!=FeedbackKind.EnemyCrit&&e.Kind!=FeedbackKind.BossHit))return Array.Empty<CombatParryPresentation.Spark>();
            var row=Rows[ElementRow(e.Element)];var rng=new Random(seed);bool heavy=Heavy(e);
            int n=heavy?rng.Next(row.HMin,row.HMax+1):rng.Next(row.Min,row.Max+1);
            var list=new List<CombatParryPresentation.Spark>();
            for(int i=0;i<n;i++) {
                double angle=e.Angle+Math.PI+(rng.NextDouble()*2-1)*row.Fan;
                int segments=row.Chain?rng.Next(2,4):1;var chain=new List<CombatParryPresentation.Spark>();
                for(int k=0;k<segments;k++) {
                    var s=new CombatParryPresentation.Spark{Delay=row.Chain?0:i%2,Life=rng.Next(row.LifeMin,row.LifeMax+1),Angle=angle,
                        Length=row.LenMin+rng.NextDouble()*(row.LenMax-row.LenMin),Thickness=row.Thick,Speed=row.SpeedMin+rng.NextDouble()*(row.SpeedMax-row.SpeedMin),
                        Color=rng.NextDouble(),Gravity=row.Gravity,From=row.From,To=row.To,Aged=row.Aged,Normal=row.Normal,Prior=chain.Count>0?chain.ToArray():null,
                        Gain=row.Normal?1:SparkGain,GainTicks=row.Normal?0:SparkGainTicks,Taper=true};
                    chain.Add(s);list.Add(s);angle+=(rng.NextDouble()-.5)*1.2;
                }
            }
            return list.ToArray();
        }
    }

    // Pure presentation policy. Never reads/writes simulation rules or its RNG.
    public sealed class CombatParryPresentation
    {
        public sealed class Spark {
            public int Delay,Life;public double Angle,Length,Thickness,Speed,Color;public bool ReverseFan;
            // G1 enemy hits: element colour ramp (rgb), screen gravity in key lengths per tick^2 (negative rises), optional chain of
            // earlier segments (lightning branches), alpha-blended instead of additive (earth).
            public uint From=0xf5e5d5,To=0xf0debd;public double Gravity=.00065;public bool Aged,Normal;public Spark[] Prior;
            // HDR gain of an additive hit spark for its first GainTicks ticks (11-04 r3); 1 / 0 = untouched.
            public double Gain=1;public int GainTicks;
            // Hit sparks use the tapered sprite (head 2 px -> tail .5 px, alpha 1 -> 0 along the length; head = +x).
            public bool Taper;
            public const double TailWidth=.25,TailAlphaFloor=0;
            // Pure taper profile over t = 0 (tail) .. 1 (head): half-width fraction and alpha. Baked by CombatImpactView.
            public static double TaperWidth(double t){return TailWidth+(1-TailWidth)*Math.Max(0,Math.Min(1,t));}
            public static double TaperAlpha(double t){t=Math.Max(0,Math.Min(1,t));return t*Math.Max(0,Math.Min(1,(1-t)/.06));}
        }
        public bool IsMelee(FeedbackEvent e) {
            if(e.Kind!=FeedbackKind.Parry||!string.IsNullOrEmpty(e.SampleKey))return false;
            return string.IsNullOrEmpty(e.Source)||e.Source=="contact"||e.Source=="swing"||e.Source=="slam"||e.Source=="charge"||e.Source=="combo"||e.Source.StartsWith("melee",StringComparison.Ordinal);
        }
        public bool HasFlash(FeedbackEvent e){return IsMelee(e)&&e.Step==1;}
        public Spark[] Sparks(FeedbackEvent e,int seed) {
            if(e.Kind!=FeedbackKind.Parry)return Array.Empty<Spark>();
            // Melee: perfect/Q 80-130, shield block 30-60. Bullet parries: a smaller burst of the same lines (perfect 36-50,
            // block 20-30) so the reflected bullet stays the subject.
            var rng=new Random(seed);bool melee=IsMelee(e);
            int n=e.Step==1?(melee?rng.Next(80,131):rng.Next(36,51)):(melee?rng.Next(30,61):rng.Next(20,31));
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
        // One push-in candidate: the VFX flag and the parry G2 flag (--parry-feedback-push-in, which also lowers the Core
        // melee shake to 2) both select the R4 field-of-view push below; there is no second dolly.
        public bool ParsePushIn(string[] args){return Array.IndexOf(args,"--unity-parry-camera=pushin")>=0||Array.IndexOf(args,"--parry-feedback-push-in")>=0;}
        public double CameraScale(double age,bool pushIn) {
            if(!pushIn||age<=0||age>=28)return 1;
            return 1-.025*(age<=8?age/8:1-(age-8)/20);
        }
    }

    // Parry presentation keeps running through the 2-tick melee hit-stop (PBZ R3: pose hold only, sparks keep flying),
    // so the spark peak lands at contact +3 frames as in the parry G1 table instead of +5 behind the frozen simulation.
    public sealed class CombatPresentationClock
    {
        int held;
        public void Hold(){held++;}
        public int Now(int tick){return tick+held;}
        public void Reset(){held=0;}
    }

    // RETOUCH 4 roll dust: soft ground puffs (earth/bone dust, normal alpha) instead of 2-6 px square specks.
    // Start: kicked up behind the feet against the roll direction; end: settles around the feet; during the roll a
    // small trailing puff every 4 ticks. Peak alpha stays at or below .42 so bullets and enemy tells read through it.
    public sealed class CombatRollDust
    {
        public sealed class Puff {public int Delay,Life;public double Dx,Dy,Size,Peak,Shade;}
        public const int TrailEvery=4;
        public static Puff[] Burst(FeedbackEvent e,int seed) {
            var rng=new Random(seed);bool start=e.Step==0;int n=start?3:2;var puffs=new Puff[n];
            for(int i=0;i<n;i++) {
                double a=start?e.Angle+Math.PI+(rng.NextDouble()-.5)*1.4:rng.NextDouble()*Math.PI*2,travel=start?14+rng.NextDouble()*10:8+rng.NextDouble()*6;
                puffs[i]=new Puff{Delay=i,Life=start?26+rng.Next(9):22+rng.Next(7),Dx=Math.Cos(a)*travel,Dy=Math.Sin(a)*travel,
                    Size=start?30+rng.NextDouble()*10:26+rng.NextDouble()*8,Peak=start?.42:.36,Shade=rng.NextDouble()};
            }
            return puffs;
        }
        public static bool Trail(int rollAge){return rollAge>0&&rollAge%TrailEvery==0;}
        public static Puff TrailPuff(int seed) {
            var rng=new Random(seed);double a=rng.NextDouble()*Math.PI*2;
            return new Puff{Life=20+rng.Next(7),Dx=Math.Cos(a)*4,Dy=Math.Sin(a)*4,Size=18+rng.NextDouble()*6,Peak=.26,Shade=rng.NextDouble()};
        }
        public static double Alpha(Puff p,double age) {
            double t=age-p.Delay;if(t<0||t>=p.Life)return 0;
            return p.Peak*(t<3?t/3:Math.Pow((p.Life-t)/(p.Life-3.0),1.5));
        }
        public static double Width(Puff p,double age){return p.Size*(1+.8*Math.Min(1,Math.Max(0,age-p.Delay)/p.Life));}
        public static double Travel(Puff p,double age){double t=Math.Min(1,Math.Max(0,age-p.Delay)/p.Life);return 1-(1-t)*(1-t);}
    }

    // Presentation-only clock and fixed pool; the view owns eight reusable
    // ground projections. Core events and its random stream are never modified.
    public sealed class CombatBloodDecals
    {
        public const int Capacity=8, HoldTicks=210, FadeTicks=60;
        public sealed class Stamp {public int Born,Frame,Delay;public float X,Y,Width;public double Angle;public bool Active;public long Serial;}
        public readonly Stamp[] Slots=new Stamp[Capacity];long serial;
        public CombatBloodDecals(){for(int i=0;i<Capacity;i++)Slots[i]=new Stamp();}
        public static bool ShouldStamp(FeedbackEvent e) {
            if(e.Source=="druid_sink")return false;
            return e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath||
                (e.VisualOnly&&(e.Kind==FeedbackKind.EnemyCrit||e.Kind==FeedbackKind.BossHit));
        }
        public int Add(FeedbackEvent e,int frame,double angle,int delay=0) {
            int index=0;long oldest=long.MaxValue;
            for(int i=0;i<Capacity;i++) {
                if(Alpha(i,e.Tick)<=0&&(!Slots[i].Active||Slots[i].Delay==0||e.Tick>=Slots[i].Born)){index=i;break;}
                if(Slots[i].Serial<oldest){oldest=Slots[i].Serial;index=i;}
            }
            var s=Slots[index];s.Delay=Math.Max(0,delay);s.Born=e.Tick+s.Delay;s.X=e.X;s.Y=e.Y;s.Width=Math.Max(1,e.Size)*2;
            s.Frame=Math.Max(12,Math.Min(15,frame));s.Angle=angle;s.Active=true;s.Serial=++serial;return index;
        }
        public double Alpha(int index,int tick) {
            var s=Slots[index];long age=(long)tick-s.Born;
            return !s.Active||age<0||age>=HoldTicks+FadeTicks?0:age<=HoldTicks?1:1-(age-HoldTicks)/(double)FadeTicks;
        }
        public void Reset(){foreach(var s in Slots)s.Active=false;serial=0;}
    }
}
