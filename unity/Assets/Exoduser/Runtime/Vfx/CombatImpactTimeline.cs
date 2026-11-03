using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Web game.html: _addBoom/_boomGrow, _addImpact/_impactSpriteFor,
    // doParry TVFX2, deathFX and activateRoll/_finishRoll. No Unity or gameplay state.
    public enum CombatClipMode { Boom, Impact, Flipbook, Death, Electric, SlashBurst }
    public sealed class CombatClip
    {
        public string Sheet, Fallback;
        public int Cols, Rows, Frames, Life, Delay;
        public double FrameTicks, Scale = 1, Width, Angle, Opacity = 1;
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
            double p=Math.Max(0,Math.Min(1,(age-Delay)/Life));int f=Math.Max(0,Frame(age));
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
            }else if((e.Kind==FeedbackKind.EnemyDeath||e.Kind==FeedbackKind.BossDeath)&&e.Source!="druid_sink") {
                double scale=Math.Max(.8,Math.Min(4.8,.35+Math.Max(1,e.Size)*.075));
                result.Add(new CombatClip{Sheet=e.IsBoss?"boss/boss_death_blood_24_20261010":"Blood_FBF_4x4_matte",Fallback=e.IsBoss?"Blood_FBF_4x4_matte":null,
                    Cols=e.IsBoss?6:4,Rows=4,Frames=e.IsBoss?24:16,Life=e.IsBoss?96:64,Width=128*scale,Angle=e.Angle,Additive=false,Mode=CombatClipMode.Death});
            }
            return result;
        }
    }
}
