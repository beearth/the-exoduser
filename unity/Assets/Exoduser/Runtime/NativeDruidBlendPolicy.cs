using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Presentation only: blend poses, never delay the Core-selected clip clock.
    public static class NativeDruidBlendPolicy
    {
        public const int FadeTicks = 9;
        public static bool Missing(string state, NativeDruidRigPolicy.Plan plan, bool available)
        {
            bool authoredHold = state == "bossDruidUnder" && plan.Name == "burrow_dive";
            return !available || plan.Held && !authoredHold;
        }
        public static int Duration(string state, NativeDruidRigPolicy.Plan plan)
        {
            // These entries can coincide with contact/pulse: no outgoing pose may mask them.
            if (state == "bossCharge" || state == "bossGrabLunge" || state == "bossGrab"
                || state == "bossHeartPause" || state == "bossDruidErupt" && plan.Name == "burrow_erupt"
                || plan.Name == "fissure_act" || plan.Name == "slam_rec" || plan.Name == "charge_rec"
                || plan.Name == "grab_throw" || plan.Name == "heart_rec") return 0;
            double deadline = FadeTicks;
            if (state == "bossSlash") deadline = DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt;
            else if (state == "bossSlam") deadline = DruidRemodelData.SlamActive;
            else return FadeTicks;
            return (int)Math.Max(0, Math.Min(FadeTicks, Math.Floor(deadline - plan.ElapsedTicks)));
        }
        public static double Weight(double elapsed, double duration)
        {
            if (duration <= 0) return 1;
            double t = Math.Max(0, Math.Min(1, elapsed / duration));
            return t * t * (3 - 2 * t);
        }
    }
}
