using System;
using System.Globalization;

namespace Exoduser.UnityPort
{
    // Review-only command line arguments (boss battle lead 2026-10-28). They never change the default run path; a build started without them behaves exactly as before.
    //   --unity-druid-remodel        the 1-1 boss fight uses the remodelled dark druid (Simulation.DruidRemodel = true, set right after each run's Simulation is created, before the arena is entered).
    //                                DruidRemodelSettings.Default stays false.
    //   --unity-boss-direct <stage>  the run starts at the entry of that stage's boss arena (only 0 = 1-1 exists): abyssal anglers counted done, gate open, player on the gate tile,
    //                                the first practice is skipped. Stage defaults to 0 when the value is missing.
    // Both are "forced state" runs: the combat save is not written (CombatSaveAllowed) so the review never leaves a forced state in the player's profile.
    public static class NativeReviewArgs
    {
        public const string DruidRemodelArgument = "--unity-druid-remodel";
        public const string BossDirectArgument = "--unity-boss-direct";
        public const string OriginalDruidProjectilesArgument = "--unity-original-druid-projectiles";

        public static bool DruidRemodel { get { return Array.IndexOf(Environment.GetCommandLineArgs(), DruidRemodelArgument) >= 0; } }
        public static bool BossDirect { get { return Array.IndexOf(Environment.GetCommandLineArgs(), BossDirectArgument) >= 0; } }
        public static bool OriginalDruidProjectiles { get { return Array.IndexOf(Environment.GetCommandLineArgs(), OriginalDruidProjectilesArgument) >= 0; } }
        public static bool Any { get { return DruidRemodel || BossDirect || OriginalDruidProjectiles; } }

        public static bool TryBossDirect(out int stage)
        {
            stage = 0;
            var args = Environment.GetCommandLineArgs(); int i = Array.IndexOf(args, BossDirectArgument);
            if (i < 0) return false;
            int parsed;
            if (i + 1 < args.Length && int.TryParse(args[i + 1], NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)) stage = parsed;
            return true;
        }

        // arguments that must not turn the area title off (every other --unity- argument is a test fixture)
        public static bool IsReviewArgument(string a) { return a == DruidRemodelArgument || a == BossDirectArgument || a == OriginalDruidProjectilesArgument; }
    }
}
