using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Druid (remodel) slashCombo body VFX: every number of the "slashCombo" row of docs/5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md §1 / §2 (1), as pure functions.
    // Same rules as DruidSlamVfxTimeline: no Unity types, no Core writes, clock = Core ticks since the bossSlash state began (act 0). The damage check is act +2
    // (St2 == DruidRemodelData.SlashHitAt); the hit fan is Facing +-1.2 rad out to R + pr + 300 (DruidRemodelData.SlashReach). Hits 1 and 2 (SlashIdx 0, 1) draw a
    // thin bone-coloured trail that sweeps the whole fan and is gone at act +8; hit 3 (SlashIdx 2) draws no trail but strikes the ground at the staff tip on the damage
    // tick (core, shards, low dust) and leaves a furrow decal along the fan's middle line. Lengths are Core px.
    public static class DruidSlashVfxTimeline
    {
        public const int ActTicks = DruidRemodelData.SlashActive;                  // 10
        public const int HitAct = DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt;   // damage check on act +2
        public const double HalfAngle = DruidBoss.SlashHalfAngle;                  // 1.2 rad each side of Facing
        public const double ReachExtra = DruidRemodelData.SlashReach;              // 300
        public const double HeroH = DruidSlamVfxTimeline.HeroH;                    // 131
        public const double ForwardPerTick = 2.5;                                  // the boss steps 2.5 px along Facing every swing tick (Core bossSlash)

        // G1 1.2 colours
        public const uint BoneEdge = 0xEFE6D2, TrailMid = 0x9A8A72, Bark = 0x4A3826, GougeShadow = 0x241A10, GougeEdge = 0x364327;

        // the judged radius from the boss centre: body radius + player radius + 300
        public static double Reach(double bossR, double playerR) { return bossR + playerR + ReachExtra; }

        // ---- trail (hits 1 and 2) ----
        public const int TrailLife = 8;                                            // act 0 .. +8 = 0.13 s
        public const double TrailLift = .35 * HeroH;                               // a horizontal band 0.35 H above the floor (45.9 Core px)
        public const double TrailMaxThickness = 17;                                // <= 0.15 H on screen (G1: 13 px; 17 Core px x 0.754 = 12.8 px)
        public const double TrailTailSpan = 1.1;                                   // rad of fading tail behind the leading edge
        public const double TrailOvershoot = .3;                                   // the edge keeps travelling 0.3 rad past the fan until act +4

        // Radial thickness: the band lies in 0.85..1.0 of the reach (outer edge = the judged boundary) and is never thicker than 17 Core px.
        public static double TrailThickness(double reach) { return Math.Min(TrailMaxThickness, .15 * reach); }
        public static double TrailOuter(double reach) { return reach; }
        public static double TrailInner(double reach) { return reach - TrailThickness(reach); }

        // Leading edge, as an offset from Facing: -1.2 at act 0, +1.2 at act +2 (the damage tick), +1.5 at +4, then held while the trail fades out.
        public static double LeadAngle(double act)
        {
            if (act <= 0) return -HalfAngle;
            if (act <= HitAct) return -HalfAngle + 2 * HalfAngle * act / HitAct;
            if (act <= 2 * HitAct) return HalfAngle + TrailOvershoot * (act - HitAct) / HitAct;
            return HalfAngle + TrailOvershoot;
        }
        // Tail edge: the trail never starts before the fan edge; after act +4 the tail catches up with the head.
        public static double TailAngle(double act)
        {
            double lead = LeadAngle(act), span = Math.Min(lead + HalfAngle, TrailTailSpan);
            if (act > 2 * HitAct) span = TrailTailSpan * Math.Max(0, (TrailLife - act) / (TrailLife - 2.0 * HitAct));
            return lead - Math.Max(0, span);
        }
        // Overall opacity of the additive band (1 while it sweeps, then ease to 0 at act +8)
        public static double TrailAlpha(double act)
        {
            if (act < 0 || act >= TrailLife) return 0;
            if (act <= HitAct) return 1;
            return Math.Pow((TrailLife - act) / (TrailLife - (double)HitAct), 1.4);
        }
        // Colour along the band, u = 0 tail .. 1 leading edge: bark -> #9a8a72 -> bone #efe6d2 (the edge itself is the exact bone colour)
        public static uint TrailColor(double u)
        {
            u = Math.Max(0, Math.Min(1, u));
            if (u <= .5) return DruidSlamVfxTimeline.Lerp(Bark, TrailMid, u / .5);
            if (u < .9) return DruidSlamVfxTimeline.Lerp(TrailMid, BoneEdge, (u - .5) / .4);
            return BoneEdge;
        }
        public static double TrailAlphaAlong(double u) { return Math.Pow(Math.Max(0, Math.Min(1, u)), 1.6); }
        // offsets of the n+1 cross-sections of the band at `act`, tail first
        public static double[] TrailAngles(double act, int n)
        {
            var res = new double[n + 1]; double a = TailAngle(act), b = LeadAngle(act);
            for (int i = 0; i <= n; i++) res[i] = a + (b - a) * i / n;
            return res;
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
        public const double StaffReachExtra = DruidBoss.StaffReachExtra;           // 70 (WeaponAng 0)
        // The boss has walked 2 ticks (2.5 px each) when the damage tick comes; tip = that centre + Facing * (R + 70)
        public static double HitCentreAdvance { get { return ForwardPerTick * HitAct; } }

        public const double StrikeCoreDiameter = .8 * HeroH;                       // 104.8
        public static double StrikeCoreAlpha(double age) { return DruidSlamVfxTimeline.CoreAlpha(age); }
        public static double StrikeCoreScale(double age) { return DruidSlamVfxTimeline.CoreScale(age); }
        public static uint StrikeCoreColor(double age) { return DruidSlamVfxTimeline.CoreColor(age); }

        public const double ShardSpread = 35 * Math.PI / 180;                      // +-35 deg around Facing
        // Angle = offset from Facing (view adds Facing). Spawn acts are measured from the swing start.
        public static DruidSlamVfxTimeline.Shard[] Shards(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x3B71C5));
            int n = 6 + rng.Next(3); var res = new DruidSlamVfxTimeline.Shard[n];
            for (int i = 0; i < n; i++)
            {
                double w = 4.5 + rng.NextDouble() * 1.5, pick = rng.NextDouble(), f = n == 1 ? .5 : (double)i / (n - 1);
                res[i] = new DruidSlamVfxTimeline.Shard
                {
                    SpawnAct = HitAct + i * 5 / n, Life = 12 + rng.Next(10),
                    Angle = (-1 + 2 * Math.Max(0, Math.Min(1, f + (rng.NextDouble() - .5) * .12))) * ShardSpread,
                    Reach = 70 + rng.NextDouble() * 60, Width = w, Length = w * (3.6 + rng.NextDouble() * 2.0), Lift = 20 + rng.NextDouble() * 20,
                    Color = pick < .45 ? DruidSlamVfxTimeline.EarthMid : pick < .75 ? DruidSlamVfxTimeline.EarthLight : DruidSlamVfxTimeline.EarthDark
                };
            }
            return res;
        }

        // low earth dust at the tip: 4 puffs, 0.43..0.5 s, alpha <= .5, top <= 0.4 H. X / Y = offsets from the tip (Core px, world axes).
        public const int DustCount = 4, DustFirstAct = HitAct + 5, DustMaxLife = 30;
        public static DruidSlamVfxTimeline.Puff[] Dust(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x47D2A9)); var res = new DruidSlamVfxTimeline.Puff[DustCount]; double start = rng.NextDouble() * Math.PI * 2;
            for (int i = 0; i < DustCount; i++)
            {
                double a = start + Math.PI * 2 * (i + rng.NextDouble() * .7) / DustCount, r = 15 + rng.NextDouble() * 55, pick = rng.NextDouble();
                res[i] = new DruidSlamVfxTimeline.Puff
                {
                    SpawnAct = DustFirstAct + i, Life = 26 + rng.Next(5), X = Math.Cos(a) * r, Y = Math.Sin(a) * r,
                    Size = 44 + rng.NextDouble() * 22, Peak = .30 + rng.NextDouble() * .15, LiftPeak = 8 + rng.NextDouble() * 8,
                    Color = pick < .7 ? DruidSlamVfxTimeline.EarthMid : DruidSlamVfxTimeline.EarthLight, AlphaMul = pick < .7 ? 1 : .7
                };
            }
            return res;
        }

        // ---- hit 3 remainder: furrow decal along the middle line of the fan, 2.5 s (last 60 ticks fade), alpha <= .35 ----
        public const int GougeLife = 150, GougeFade = 60, GougeSteps = 8;
        public const double GougeAlphaPeak = .35;
        // Length from the boss body edge to the judged boundary: (R + pr + 300) - R
        public static double GougeLength(double playerR) { return ReachExtra + playerR; }
        public static double GougeAlpha(double age)   // age = ticks since the damage tick
        {
            if (age <= 0 || age >= GougeLife) return 0;
            double rise = Math.Min(1, age / 4.0), fade = age > GougeLife - GougeFade ? (GougeLife - age) / GougeFade : 1;
            return GougeAlphaPeak * rise * fade;
        }
        // how much of the furrow is carved yet (the staff drags it out over 4 ticks)
        public static double GougeReach(double age, double length) { double k = 1 - Math.Max(0, Math.Min(1, age / 4.0)); return length * (1 - k * k); }
        // Furrow width at `along` Core px past the body edge (11..22 near the middle, narrow at both ends)
        public static double GougeWidth(double along, double length)
        {
            double t = Math.Max(0, Math.Min(1, along / length)); return 8 + 14 * (1 - Math.Pow(Math.Abs(2 * t - 1), 1.5));
        }
        // Centre line, offsets from the swing's hit centre; joint k sits at distance bossR + length k / 8 along Facing, with a small sideways wobble that is 0 at both ends.
        public static DruidSlamVfxTimeline.Pt[] Gouge(int seed, double facing, double bossR, double length, double reachNow)
        {
            var jr = new Random(unchecked(seed * 53 + 977)); var full = new DruidSlamVfxTimeline.Pt[GougeSteps + 1];
            double cx = Math.Cos(facing), cy = Math.Sin(facing), px = -cy, py = cx;
            for (int k = 0; k <= GougeSteps; k++)
            {
                double along = length * k / GougeSteps, wob = (jr.NextDouble() - .5) * 8 * Math.Sin(Math.PI * k / GougeSteps), d = bossR + along;
                if (k == 0 || k == GougeSteps) wob = 0;
                full[k] = new DruidSlamVfxTimeline.Pt { X = cx * d + px * wob, Y = cy * d + py * wob, R = along };
            }
            reachNow = Math.Min(length, reachNow);
            if (reachNow <= 0) return new DruidSlamVfxTimeline.Pt[0];
            var list = new System.Collections.Generic.List<DruidSlamVfxTimeline.Pt>();
            for (int k = 0; k <= GougeSteps; k++)
            {
                if (full[k].R <= reachNow + 1e-9) { list.Add(full[k]); continue; }
                var p = full[k - 1]; var q = full[k]; double t = (reachNow - p.R) / (q.R - p.R);
                if (t > 1e-6) list.Add(new DruidSlamVfxTimeline.Pt { X = p.X + (q.X - p.X) * t, Y = p.Y + (q.Y - p.Y) * t, R = reachNow });
                break;
            }
            return list.ToArray();
        }
    }
}
