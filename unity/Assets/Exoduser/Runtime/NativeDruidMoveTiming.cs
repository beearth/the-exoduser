using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Presentation-only time corrections. Never writes a Core state, counter or judgement.
    public static class NativeDruidMoveTiming
    {
        public static double ParryGlint(double elapsed)
        {
            double age = elapsed - 2;
            if (age < 0 || age >= 9) return 0;
            double f = age / 9;
            return f < .2 ? 1 - f / .2 * .775 : .225 * (1 - (f - .2) / .8);
        }
        public static NativeDruidRigPolicy.Plan Recovery(NativeDruidRigPolicy.Plan plan,
            DruidData data, bool feint, double previousFrame)
        {
            if (data == null) return plan;
            bool escaped = data.S == "recover" && data.RmMoveId == "grab";
            if (data.S != "bossRec" && !escaped) return plan;
            if (escaped || feint)
            {
                // Generic recover is set to 40 on escape, then clamped to 20 by Core.
                // A canceled charge wind recovers for 25, not the normal charge's 74.
                double duration = escaped ? 20 : DruidRemodelData.FeintRecovery
                    + (data.RmBonusApplied ? DruidRemodelData.ParryRecoveryBonus : 0);
                plan.CoreTicks = duration;
                plan.ElapsedTicks = Math.Max(0, Math.Min(duration, duration - data.St2));
                plan.Frame = NativeDruidRigPolicy.Frames(plan.Name) * plan.ElapsedTicks / duration;
            }
            // A parry may extend a recovery already being displayed. Preserve the last
            // pose until the stretched timeline catches up, inside the existing window.
            plan.Frame = Math.Min(NativeDruidRigPolicy.Frames(plan.Name), Math.Max(plan.Frame, previousFrame));
            return plan;
        }
    }
}
