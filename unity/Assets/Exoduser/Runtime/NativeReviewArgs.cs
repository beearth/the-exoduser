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

        public static bool DruidRemodel { get { return Array.IndexOf(Environment.GetCommandLineArgs(), DruidRemodelArgument) >= 0; } }
        public static bool BossDirect { get { return Array.IndexOf(Environment.GetCommandLineArgs(), BossDirectArgument) >= 0; } }
        public static bool Any { get { return DruidRemodel || BossDirect; } }

        public static bool TryBossDirect(out int stage)
        {
            stage = 0;
            var args = Environment.GetCommandLineArgs(); int i = Array.IndexOf(args, BossDirectArgument);
            if (i < 0) return false;
            int parsed;
            if (i + 1 < args.Length && int.TryParse(args[i + 1], NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)) stage = parsed;
            return true;
        }

        // -review-width <px> -review-height <px> (latest-build test lead 2026-11-04): capture size of the m1-check (both the headless RenderTexture and the windowed run), default 1600x900.
        // Values outside 320..7680 x 240..4320 fall back to the default. In -batchmode pass the same -screen-width/-screen-height so IMGUI lays the HUD out for that size.
        public const string ReviewWidthArgument = "-review-width";
        public const string ReviewHeightArgument = "-review-height";
        public static void ReviewSize(int defaultWidth, int defaultHeight, out int width, out int height)
        {
            width = ReadInt(ReviewWidthArgument, defaultWidth, 320, 7680); height = ReadInt(ReviewHeightArgument, defaultHeight, 240, 4320);
        }
        static int ReadInt(string name, int fallback, int min, int max)
        {
            var args = Environment.GetCommandLineArgs(); int i = Array.IndexOf(args, name); int v;
            if (i >= 0 && i + 1 < args.Length && int.TryParse(args[i + 1], NumberStyles.Integer, CultureInfo.InvariantCulture, out v) && v >= min && v <= max) return v;
            return fallback;
        }

        // arguments that must not turn the area title off (every other --unity- argument is a test fixture)
        public static bool IsReviewArgument(string a) { return a == DruidRemodelArgument || a == BossDirectArgument || a=="--unity-parry-camera=shake" || a=="--unity-parry-camera=pushin"; }
    }
}
