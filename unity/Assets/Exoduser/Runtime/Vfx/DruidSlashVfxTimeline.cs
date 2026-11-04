using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Druid (remodel) slashCombo body VFX: every number of the "slashCombo" row of docs/5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md §1 / §2 (1), as pure functions.
    // Same rules as DruidSlamVfxTimeline: no Unity types, no Core writes, clock = Core ticks since the bossSlash state began (act 0). The damage check is act +2
    // (St2 == DruidRemodelData.SlashHitAt); the hit fan is Facing +-1.2 rad out to R + pr + 300 (DruidRemodelData.SlashReach).
    // Textured version (G2 FAIL rework, 11-04; r2: 0.7 H wide, 8 ticks, bone-to-bark tint): hits 1 and 2 (SlashIdx 0, 1) draw a camera-facing ribbon textured with whip_smear that follows the REAL staff head
    // (rig lantern_orb socket, or the Core staff-tip formula R + 70 along Facing + WeaponAng without the rig) for the last 8 ticks, alpha blend + weak additive head, gone at act +8;
    // the old thin arc on the judged boundary is gone. Hit 3 (SlashIdx 2) draws no ribbon but strikes the ground at the staff tip on the damage tick
    // (HDR core, one small earth_dust_burst, 6..8 debris stills) and leaves a ground_gouge_linear decal down the fan's middle line. Lengths are Core px.
    public static class DruidSlashVfxTimeline
    {
        public const int ActTicks = DruidRemodelData.SlashActive;                  // 10
        public const int HitAct = DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt;   // damage check on act +2
        public const double HalfAngle = DruidBoss.SlashHalfAngle;                  // 1.2 rad each side of Facing
        public const double ReachExtra = DruidRemodelData.SlashReach;              // 300
        public const double HeroH = DruidSlamVfxTimeline.HeroH;                    // 131
        public const double ForwardPerTick = 2.5;                                  // the boss steps 2.5 px along Facing every swing tick (Core bossSlash)

        // the judged radius from the boss centre: body radius + player radius + 300
        public static double Reach(double bossR, double playerR) { return bossR + playerR + ReachExtra; }

        // ---- ribbon (hits 1 and 2) ----
        public const int TrailLife = 8;                                            // act 0 .. +8 = 0.13 s
        public const int RibbonTicks = 8;                                          // length of the ribbon = the staff head's path over the last 8 ticks (r2)
        public const double RibbonWidth = .70 * HeroH;                             // r2: 0.6 .. 0.8 H across (91.7 Core px); 0.25..0.35 H vanished at 1x
        public const double RibbonWidthMinH = .6, RibbonWidthMaxH = .8;
        // r2: the whip_smear texture is drawn twice. Main layer = normal alpha blend, vertex tint head #e8d8b8 (bone) -> tail #7a5a3c (bark), so sheet colours stay;
        // second layer = additive, weak (_Opacity .35), only the head glow. No pure white anywhere in the ribbon.
        public const uint RibbonHeadTint = 0xE8D8B8, RibbonTailTint = 0x7A5A3C;
        public const double RibbonBlendAlpha = .85, RibbonAddOpacity = .35;
        // vertex alpha along the ribbon, t = 0 newest sample (front edge) .. 1 oldest: front edge brightest, transparent at the tail
        public static double RibbonAlongAlpha(double t) { t = Math.Max(0, Math.Min(1, t)); return Math.Pow(1 - t, 1.3); }
        public static uint RibbonTint(double t) { return DruidSlamVfxTimeline.Lerp(RibbonHeadTint, RibbonTailTint, Math.Max(0, Math.Min(1, t))); }
        public const int RibbonVariants = 3;
        public static int RibbonVariant(int seed) { return (int)unchecked(((uint)seed * 2246822519u) >> 28) % RibbonVariants; }
        // texture x range of the visible smear (dense head at the left end): u = 0 head (newest sample), u = 1 tail
        public static double RibbonU0(int variant) { return DruidEarthSheetTable.SmearX0[variant] / DruidEarthSheetTable.SmearSheetW; }
        public static double RibbonU1(int variant) { return DruidEarthSheetTable.SmearX1[variant] / DruidEarthSheetTable.SmearSheetW; }
        // the oldest tick whose staff position still belongs to the ribbon at `act`
        public static int RibbonOldestAct(double act) { return (int)Math.Max(0, Math.Floor(act) - RibbonTicks); }
        // staff head on the Core formula (Facing + WeaponAng, R + StaffReachExtra), used when the rig socket is not available
        public const double StaffReachExtra = DruidBoss.StaffReachExtra;           // 70
        public static double StaffRadius(double bossR) { return bossR + StaffReachExtra; }
        public static void StaffTip(double bossX, double bossY, double facing, double weaponAng, double bossR, out double x, out double y)
        {
            double a = facing + weaponAng, r = StaffRadius(bossR);
            x = bossX + Math.Cos(a) * r; y = bossY + Math.Sin(a) * r;
        }
        // Overall opacity of the ribbon (both layers) (1 while it sweeps, then ease to 0 at act +8)
        public static double TrailAlpha(double act)
        {
            if (act < 0 || act >= TrailLife) return 0;
            if (act <= HitAct) return 1;
            return Math.Pow((TrailLife - act) / (TrailLife - (double)HitAct), 1.4);
        }

        // hit-3 telegraph orb glow (G1 2 (1)): the last 12 wind ticks the lantern orb warms 0 -> .8, additive #d49a5c, diameter <= 0.15 H.
        // Position = the rig's real lantern_orb socket (NativeDruidRigPixelView); no socket = no glow, never a guessed height.
        public const int OrbWindTicks = 12;
        public const double OrbPeak = .8, OrbDiameter = .15 * HeroH;              // 19.65 Core px
        public const uint OrbColor = 0xD49A5C;
        public static bool HasOrbGlow(int slashIdx) { return slashIdx >= 2; }
        // remaining = Core St2 of bossSlashWind: 12 -> first glow tick, 1 -> peak on the last wind tick
        public static double OrbAlpha(double remaining)
        {
            if (remaining < 1 || remaining > OrbWindTicks) return 0;
            return OrbPeak * (OrbWindTicks - remaining + 1) / OrbWindTicks;
        }

        public static bool HasTrail(int slashIdx) { return slashIdx < 2; }

        // ---- hit 3: ground strike at the staff tip on the damage tick ----
        public static bool HasStrike(int slashIdx) { return slashIdx >= 2; }
        // The boss has walked 2 ticks (2.5 px each) when the damage tick comes; tip = that centre + Facing * (R + 70)
        public static double HitCentreAdvance { get { return ForwardPerTick * HitAct; } }

        public const double StrikeCoreDiameter = .8 * HeroH;                       // 104.8 (soft core texture, HDR _Opacity peak 1.6)
        public static double StrikeCoreAlpha(double age) { return DruidSlamVfxTimeline.CoreAlpha(age); }
        public static double StrikeCoreOpacity(double age) { return DruidSlamVfxTimeline.CoreOpacity(age); }   // HDR: 2.4 at the peak
        public static double StrikeCoreScale(double age) { return DruidSlamVfxTimeline.CoreScale(age); }
        public static uint StrikeCoreColor(double age) { return DruidSlamVfxTimeline.CoreColor(age); }

        public const double ShardSpread = 35 * Math.PI / 180;                      // +-35 deg around Facing
        // 6..8 debris stills. Angle = offset from Facing (view adds Facing). Spawn acts are measured from the swing start.
        public static DruidSlamVfxTimeline.Debris[] Debrises(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x3B71C5));
            int n = 6 + rng.Next(3); var res = new DruidSlamVfxTimeline.Debris[n];
            for (int i = 0; i < n; i++)
            {
                double f = n == 1 ? .5 : (double)i / (n - 1);
                res[i] = new DruidSlamVfxTimeline.Debris
                {
                    SpawnAct = HitAct + i * 5 / n, Life = 12 + rng.Next(10), Frame = rng.Next(DruidSlamVfxTimeline.DebrisFrames),
                    Angle = (-1 + 2 * Math.Max(0, Math.Min(1, f + (rng.NextDouble() - .5) * .12))) * ShardSpread,
                    Reach = 70 + rng.NextDouble() * 60, Size = DruidSlamVfxTimeline.DebrisCellCore(rng.NextDouble()), Lift = 20 + rng.NextDouble() * 20,
                    Spin = (rng.NextDouble() - .5) * .6, Phase = rng.NextDouble() * Math.PI * 2
                };
            }
            return res;
        }

        // one small earth_dust_burst at the tip, 1.2 H sprite, 30 ticks (24 frames), alpha <= .5, from the damage tick
        public const double StrikeDustSize = 1.2 * HeroH;                          // 157.2
        public const int StrikeDustLife = 30;
        public const double StrikeDustAlphaPeak = .5;
        public static double StrikeDustAlpha(double age)
        {
            if (age < 0 || age >= StrikeDustLife) return 0;
            return StrikeDustAlphaPeak * Math.Min(1, (age + 1) / 2.0) * (age > StrikeDustLife - 8 ? (StrikeDustLife - age) / 8.0 : 1);
        }

        // ---- hit 3 remainder: ground_gouge_linear decal (variant by seed) along the middle line of the fan, 2.5 s (last 60 ticks fade), alpha <= .35 ----
        public const int GougeLife = 150, GougeFade = 60;
        public const double GougeAlphaPeak = .35;
        // flat fallback (2D arena / no floor projection): dark gouge on dark soil, alpha x2 <= .7
        public const double GougeFlatGain = 2.0, GougeFlatMax = .7;
        public static double GougeAlphaFlat(double age) { return Math.Min(GougeFlatMax, GougeAlpha(age) * GougeFlatGain); }
        public const int GougeVariants = 3;
        public static int GougeVariant(int seed) { return (int)unchecked(((uint)seed * 3266489917u) >> 28) % GougeVariants; }
        // Length from the boss body edge to the judged boundary: (R + pr + 300) - R
        public static double GougeLength(double playerR) { return ReachExtra + playerR; }
        public static double GougeAlpha(double age)   // age = ticks since the damage tick
        {
            if (age <= 0 || age >= GougeLife) return 0;
            double rise = Math.Min(1, age / 4.0), fade = age > GougeLife - GougeFade ? (GougeLife - age) / GougeFade : 1;
            return GougeAlphaPeak * rise * fade;
        }
        // decal quad width (Core px) so the visible gouge is `length` long; the quad is 4:1 (1024 x 256)
        public static double GougeSize(int variant, double length) { return length * DruidEarthSheetTable.GougeSheetW / (DruidEarthSheetTable.GougeX1[variant] - DruidEarthSheetTable.GougeX0[variant]); }
        public static double GougeVisibleLength(int variant, double size) { return size * (DruidEarthSheetTable.GougeX1[variant] - DruidEarthSheetTable.GougeX0[variant]) / DruidEarthSheetTable.GougeSheetW; }
        // distance from the boss centre along Facing to the quad centre: the visible gouge starts on the body edge (R) and ends on the judged boundary
        public static double GougeCentreAlong(int variant, double size, double bossR, double length)
        {
            double visibleCentre = (DruidEarthSheetTable.GougeX0[variant] + DruidEarthSheetTable.GougeX1[variant]) / 2.0 - DruidEarthSheetTable.GougeSheetW / 2.0;
            return bossR + length / 2 - visibleCentre / DruidEarthSheetTable.GougeSheetW * size;
        }
    }
}
