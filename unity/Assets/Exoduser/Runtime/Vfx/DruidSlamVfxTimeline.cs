using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Vfx
{
    // Druid (remodel) slam body VFX: every number of the "slam" row of docs/5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md §1 / §2 (2), as pure functions.
    // No Unity types and no Core writes: the view (DruidSkillVfxView) only asks "what is drawn at act tick N". Clock = Core ticks since the bossSlam state began
    // (act 0), so pause, restart and frame stepping cannot consume the effect. The damage check is act +6 (DruidRemodelData.SlamActive); the ring reaches
    // the Core radius (DruidRemodelData.SlamRadius = 260) on exactly that tick. Lengths are Core px (1 px = 0.754 screen px across the floor at 1080p, 34 deg).
    public static class DruidSlamVfxTimeline
    {
        public const int ActTicks = DruidRemodelData.SlamActive;             // bossSlam state length; the damage check runs when it hits 0 = act +6
        public const double HitRadius = DruidRemodelData.SlamRadius;         // Core hit radius
        public const double SpreadRadius = HitRadius * 1.1;                   // the ring keeps travelling to x1.1 and dies there
        public const int RingEndAct = 26;                                     // ring gone at act +26
        public const int WindLiftTicks = 12;                                  // last 12 ticks of bossSlamWind: earth chunks lift
        public const int CrackCount = 7, CrackSteps = 8;
        public const double HeroH = 131;                                      // hero display height 1.31 u = 131 Core px (G1 1.1)
        public const double ScreenPerCorePx = 0.754;                          // floor width, 1 Core px in 1080p screen px
        public const double ScreenPerCorePxVertical = 0.684;                  // billboard height (68.4 px per world unit)

        // G1 1.2 colour table (RGB hex)
        public const uint CoreHot = 0xFFF4D0, CoreEdge = 0xD49A5C, EarthLight = 0xDCC8A4, EarthMid = 0x7E6236, EarthDark = 0x241A10, CrackCenter = 0x1C2418, CrackEdgeColor = 0x364327;

        // ---- contact core: act 0 at the staff tip, 1.2 H, additive, peak at +2, 5 ticks, alpha 1 -> .225 (20 % of life) -> 0 ----
        public const int CoreLife = 5, CorePeakAct = 2;
        public const double CoreDiameter = 1.2 * HeroH, CoreAlphaPeak = 1.0;
        public static double CoreAlpha(double age)
        {
            if (age < 0 || age >= CoreLife) return 0;
            double f = age / CoreLife;
            return f < .2 ? 1 - f / .2 * .775 : .225 * (1 - (f - .2) / .8);
        }
        public static double CoreScale(double age)
        {
            if (age < 0 || age >= CoreLife) return 0;
            return age <= CorePeakAct ? .55 + .45 * age / CorePeakAct : 1 - .3 * (age - CorePeakAct) / (CoreLife - CorePeakAct);
        }
        public static uint CoreColor(double age)
        {
            double f = Math.Max(0, Math.Min(1, age / CoreLife));
            return Lerp(CoreHot, CoreEdge, f);
        }

        // ---- earth shock ring: radius 0 at act 0, exactly 260 at act +6, 286 at +26 (outer edge, ease-out), band <= 30 Core px ----
        static double EaseOut(double t) { t = Math.Max(0, Math.Min(1, t)); return 1 - (1 - t) * (1 - t); }
        public static double RingOuter(double act)
        {
            if (act <= 0) return 0;
            if (act < ActTicks) return HitRadius * EaseOut(act / ActTicks);
            if (act < RingEndAct) return HitRadius + (SpreadRadius - HitRadius) * EaseOut((act - ActTicks) / (double)(RingEndAct - ActTicks));
            return SpreadRadius;
        }
        public static double RingWidth(double act)
        {
            if (act < 0 || act > RingEndAct) return 0;
            return Math.Min(RingOuter(act), 28 - 12 * Math.Min(1, act / RingEndAct));
        }
        public const double RingAlphaPeak = .48;
        public static double RingAlpha(double act)
        {
            if (act <= 0 || act >= RingEndAct) return 0;
            if (act <= ActTicks) return RingAlphaPeak * Math.Min(1, act / 2.0);
            double k = 1 - (act - ActTicks) / (RingEndAct - ActTicks);
            return RingAlphaPeak * Math.Pow(Math.Max(0, k), 1.5);
        }

        // ---- radial cracks: 7 jagged polylines grown at the ring's speed to r260, then kept as a decal for 3.0 s (last 1 s fade, alpha <= .42) ----
        public const int DecalLife = 180, DecalFade = 60;                     // act +6 .. +186
        public const double DecalAlphaPeak = .42;
        public static double CrackReach(double act) { return Math.Min(HitRadius, RingOuter(act)); }
        public static double CrackAlpha(double act)
        {
            double end = ActTicks + DecalLife;
            if (act <= 0 || act >= end) return 0;
            double rise = Math.Min(1, act / 4.0), fade = act > end - DecalFade ? (end - act) / DecalFade : 1;
            return DecalAlphaPeak * rise * fade;
        }
        public static double CrackWidth(double r) { return 4 + 11 * (1 - Math.Max(0, Math.Min(1, r / HitRadius))); }   // 15 at the root -> 4 at the tip

        public struct Pt { public double X, Y, R; }
        // Polyline of crack `index` clipped to `reach`; offsets from the slam centre. Joint k sits at radius exactly 260 * k / 8 (so the last joint is on the hit circle).
        public static Pt[] Crack(int index, int seed, double reach)
        {
            double turn = new Random(unchecked(seed * 7919 + 101)).NextDouble() * Math.PI * 2;   // the same turn for all 7 cracks: they stay evenly spread
            var full = new Pt[CrackSteps + 1];
            double baseA = turn + Math.PI * 2 * index / CrackCount + (new Random(unchecked(seed * 31 + index * 977)).NextDouble() - .5) * .22;
            var jr = new Random(unchecked(seed * 131 + index * 7331 + 5));
            for (int k = 0; k <= CrackSteps; k++)
            {
                double r = HitRadius * k / CrackSteps, a = baseA + (k == 0 ? 0 : (jr.NextDouble() - .5) * .12);
                full[k] = new Pt { X = Math.Cos(a) * r, Y = Math.Sin(a) * r, R = r };
            }
            reach = Math.Min(HitRadius, reach);
            if (reach <= 0) return new Pt[0];
            var list = new System.Collections.Generic.List<Pt>();
            for (int k = 0; k <= CrackSteps; k++)
            {
                if (full[k].R <= reach + 1e-9) { list.Add(full[k]); continue; }
                var p = full[k - 1]; var q = full[k]; double t = (reach - p.R) / (q.R - p.R);
                if (t > 1e-6) list.Add(new Pt { X = p.X + (q.X - p.X) * t, Y = p.Y + (q.Y - p.Y) * t, R = reach });
                break;
            }
            return list.ToArray();
        }

        // ---- earth shards: 10..14 stretched chunks fly outward during act 0..+6, 0.2..0.35 s, normal blend ----
        public sealed class Shard
        {
            public int SpawnAct, Life; public double Angle, Reach, Width, Length, Lift; public uint Color;
        }
        public const double ShardAlphaPeak = .85;
        public static Shard[] Shards(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x51ED2B));
            int n = 10 + rng.Next(5); var res = new Shard[n]; double start = rng.NextDouble() * Math.PI * 2;
            for (int i = 0; i < n; i++)
            {
                double w = 4.5 + rng.NextDouble() * 1.5; double pick = rng.NextDouble();
                res[i] = new Shard
                {
                    SpawnAct = i * (ActTicks + 1) / n, Life = 12 + rng.Next(10),
                    Angle = start + Math.PI * 2 * (i + rng.NextDouble() * .8) / n, Reach = 90 + rng.NextDouble() * 80,
                    Width = w, Length = w * (3.6 + rng.NextDouble() * 2.0), Lift = 30 + rng.NextDouble() * 40,
                    Color = pick < .45 ? EarthMid : pick < .75 ? EarthLight : EarthDark
                };
            }
            return res;
        }
        // age = ticks since this shard spawned
        public static double ShardTravel(Shard s, double age) { return s.Reach * EaseOut(age / s.Life); }
        public static double ShardHeight(Shard s, double age) { double u = Math.Max(0, Math.Min(1, age / s.Life)); return s.Lift * 4 * u * (1 - u); }
        public static double ShardAlpha(Shard s, double age)
        {
            if (age < 0 || age >= s.Life) return 0;
            double u = age / s.Life; return ShardAlphaPeak * Math.Min(1, (age + 1) / 2.0) * (u < .55 ? 1 : 1 - (u - .55) / .45);
        }

        // ---- low earth dust: 8 soft puffs, 0.6..0.8 s, alpha <= .5, height <= 0.4 H ----
        public sealed class Puff
        {
            public int SpawnAct, Life; public double X, Y, Size, Peak, LiftPeak, AlphaMul; public uint Color;
        }
        public const int DustCount = 8;
        public const double DustAlphaMax = .5, DustTopMax = .4 * HeroH;
        public static Puff[] Dust(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x2D7F11)); var res = new Puff[DustCount]; double start = rng.NextDouble() * Math.PI * 2;
            for (int i = 0; i < DustCount; i++)
            {
                double a = start + Math.PI * 2 * (i + rng.NextDouble() * .7) / DustCount, r = HitRadius * (.45 + rng.NextDouble() * .55), pick = rng.NextDouble();
                res[i] = new Puff
                {
                    SpawnAct = ActTicks + 1 + i, Life = 36 + rng.Next(13), X = Math.Cos(a) * r, Y = Math.Sin(a) * r,
                    Size = 56 + rng.NextDouble() * 28, Peak = .30 + rng.NextDouble() * .15, LiftPeak = 10 + rng.NextDouble() * 10,
                    Color = pick < .7 ? EarthMid : EarthLight, AlphaMul = pick < .7 ? 1 : .7
                };
            }
            return res;
        }
        public static double DustAlpha(Puff p, double age)
        {
            if (age < 0 || age >= p.Life) return 0;
            return p.Peak * p.AlphaMul * (age < 4 ? age / 4.0 : Math.Pow((p.Life - age) / (p.Life - 4.0), 1.5));
        }
        public static double DustHeight(Puff p) { return p.Size * .7; }
        public static double DustLift(Puff p, double age) { return p.LiftPeak * EaseOut(age / p.Life); }
        public static double DustTop(Puff p, double age) { return DustLift(p, age) + DustHeight(p) / 2; }

        // ---- wind-up (last 12 ticks of bossSlamWind): 6 chunks inside the circle bob 1..3 screen px ----
        public sealed class Chunk { public double X, Y, Angle, Width, Length, Phase; public uint Color; }
        public const int ChunkCount = 6;
        public static Chunk[] Chunks(int seed)
        {
            var rng = new Random(unchecked(seed ^ 0x6A3C95)); var res = new Chunk[ChunkCount]; double start = rng.NextDouble() * Math.PI * 2;
            for (int i = 0; i < ChunkCount; i++)
            {
                double a = start + Math.PI * 2 * (i + rng.NextDouble() * .6) / ChunkCount, r = 70 + rng.NextDouble() * 160, w = 5 + rng.NextDouble() * 1.5;
                res[i] = new Chunk { X = Math.Cos(a) * r, Y = Math.Sin(a) * r, Angle = (rng.NextDouble() - .5) * 1.0, Width = w, Length = w * (3.6 + rng.NextDouble() * 1.4), Phase = rng.NextDouble() * Math.PI * 2, Color = rng.NextDouble() < .6 ? EarthMid : EarthLight };
            }
            return res;
        }
        // windAge 0..11 = ticks since St2 first <= 12. Lift in 1080p screen px, always within 1..3 while active.
        public static bool ChunkActive(double windAge) { return windAge >= 0 && windAge < WindLiftTicks; }
        public static double ChunkLiftPx(Chunk c, double windAge) { return 2 + Math.Sin(windAge * .9 + c.Phase); }
        public static double ChunkLiftCore(Chunk c, double windAge) { return ChunkLiftPx(c, windAge) / ScreenPerCorePxVertical; }
        public static double ChunkAlpha(double windAge) { return ChunkActive(windAge) ? ShardAlphaPeak * Math.Min(1, (windAge + 1) / 3.0) : 0; }

        // deterministic seed from Core ticks and the boss position
        public static int Seed(int tick, double x, double y)
        {
            unchecked
            {
                int h = 17; h = h * 31 + tick; h = h * 31 + (int)Math.Round(x); h = h * 31 + (int)Math.Round(y);
                h ^= h >> 13; h *= 0x5bd1e995; return h ^ (h >> 15);
            }
        }

        public static uint Lerp(uint a, uint b, double t)
        {
            t = Math.Max(0, Math.Min(1, t)); uint c = 0;
            for (int s = 16; s >= 0; s -= 8) { double ca = (a >> s) & 0xFF, cb = (b >> s) & 0xFF; c |= (uint)Math.Round(ca + (cb - ca) * t) << s; }
            return c;
        }
    }
}
