using System;
using System.Globalization;

namespace Exoduser.UnityPort
{
    // Review-only command line arguments (boss battle lead 2026-10-28). They never change the default run path; a build started without them behaves exactly as before.
    //   --unity-druid-remodel        the 1-1 boss fight uses the remodelled dark druid (Simulation.DruidRemodel = true, set right after each run's Simulation is created, before the arena is entered).
    //                                DruidRemodelSettings.Default stays false.
    //   --unity-druid-legacy         forces the old web-port druid set (Simulation.DruidRemodel = false); wins over every other source below.
    //   Default of the druid set per run (NativeReviewArgs.DecideDruidSet, logged once per run as `[DruidSet] remodel=<bool> reason=<...>`), first match wins:
    //     legacy-arg (off) > arg (--unity-druid-remodel, on) > 3d-arena (--remodel3d scene, on) > demo (build flavor DemoMode, on) > default (off, Core default).
    //   The 3D boss arena and the demo fight the remodelled 7-skill druid without any argument (11-04: a 3D measured run fought the old web set because the flag was off, board 8.5.4).
    //   Core is untouched: DruidRemodelSettings.Default stays false, so tests/harnesses that construct a Simulation directly still get the web-port druid unless they opt in.
    //   --unity-boss-direct <stage>  the run starts at the entry of that stage's boss arena (only 0 = 1-1 exists): abyssal anglers counted done, gate open, player on the gate tile,
    //                                the first practice is skipped. Stage defaults to 0 when the value is missing.
    // Both are "forced state" runs: the combat save is not written (CombatSaveAllowed) so the review never leaves a forced state in the player's profile.
    public static class NativeReviewArgs
    {
        public const string DruidRemodelArgument = "--unity-druid-remodel";
        public const string BossDirectArgument = "--unity-boss-direct";
        public const string DruidLegacyArgument = "--unity-druid-legacy";

        public static bool DruidRemodel { get { return Array.IndexOf(Environment.GetCommandLineArgs(), DruidRemodelArgument) >= 0; } }
        public static bool BossDirect { get { return Array.IndexOf(Environment.GetCommandLineArgs(), BossDirectArgument) >= 0; } }
        public static bool DruidLegacy { get { return Array.IndexOf(Environment.GetCommandLineArgs(), DruidLegacyArgument) >= 0; } }
        public static bool Any { get { return DruidRemodel || DruidLegacy || BossDirect; } }

        // The one rule for which druid set a run fights. Pure (no engine state) so a test can feed it any combination.
        public static bool DecideDruidSet(string[] args, bool arena3d, bool demo, out string reason)
        {
            args = args ?? new string[0];
            if (Array.IndexOf(args, DruidLegacyArgument) >= 0) { reason = "legacy-arg"; return false; }
            if (Array.IndexOf(args, DruidRemodelArgument) >= 0) { reason = "arg"; return true; }
            if (arena3d) { reason = "3d-arena"; return true; }
            if (demo) { reason = "demo"; return true; }
            reason = "default"; return false;
        }

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
        public static bool IsReviewArgument(string a) { return a == DruidRemodelArgument || a == DruidLegacyArgument || a == BossDirectArgument || a=="--unity-parry-camera=shake" || a=="--unity-parry-camera=pushin"; }
    }
}
