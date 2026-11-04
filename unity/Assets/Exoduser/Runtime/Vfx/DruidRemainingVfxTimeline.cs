using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Presentation math only. All distances passed here come from the live Core.
    public static class DruidRemainingVfxTimeline
    {
        public const int FurrowLife=150, FissureLife=180, HoleLife=180, PulseLife=12;
        public const double PulseWidth=40, BodyAlpha=.45, DustAlpha=.35;
        public static double Saturate(double x) { return Math.Max(0,Math.Min(1,x)); }
        public static double Fade(double age,double life,double tail)
        { return age<0||age>=life?0:Math.Min(1,(life-age)/Math.Max(1,tail)); }
        public static double BurrowReveal(double remaining,double total)
        { return Saturate((total-remaining)/DruidRemodelData.BurrowEruptWarn); }
        public static double PulseRadius(double age,double safe,double outer)
        { return safe+(Math.Max(safe,outer)-safe)*Saturate(age/PulseLife); }
        public static bool FissureEnded(Fissure f) { return f.Exploded||(f.Straight&&f.Done); }
        public static bool GrabStep(double remaining,double previous)
        { return remaining==DruidRemodelData.GrabLungeTicks||(remaining<=10&&previous>10); }
        public static double PathWidth(string kind,double radius)
        { return kind=="charge"?radius*.5:kind=="burrow"?radius*.6:DruidBoss.FissureHitHalfWidth*2; }
        // Grain-free broad facets: a continuous deterministic centre line, always within the judged width.
        public static double EdgeOffset(double along,int seed,double width)
        { return Math.Max(-3,Math.Min(3,Math.Sin(along*.031+seed*.7)*width*.045+Math.Sin(along*.073+seed)*width*.025)); }
        public static double PathHalfWidth(double width) { return Math.Max(1,width*.5-3); }
    }

    public sealed class DruidVfxSpawnBudget
    {
        int tick=int.MinValue, used;
        public bool Take(int coreTick,int active)
        {
            if(coreTick!=tick){tick=coreTick;used=0;}
            if(used>=2||active>=24)return false;
            used++;return true;
        }
        public void Clear(){tick=int.MinValue;used=0;}
    }
}
