using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// Druid slam body VFX (G1 2 (2)): the numbers of DruidSlamVfxTimeline against the Core facts and the G1 table. No Unity, no windows, no sound.
static partial class Program
{
    static int checks, bad;
    static void Check(bool value, string name) { checks++; if (!value) { bad++; Console.WriteLine("FAIL " + name); } }
    static bool Near(double a, double b, double tol) { return Math.Abs(a - b) <= tol; }
    const double Eps = 1e-9;
    static readonly uint[] Earth = { DruidSlamVfxTimeline.EarthLight, DruidSlamVfxTimeline.EarthMid, DruidSlamVfxTimeline.EarthDark };

    static int Main()
    {
        var T = typeof(DruidSlamVfxTimeline);
        // ---- Core facts the timeline is tied to ----
        Check(DruidSlamVfxTimeline.ActTicks == 6 && DruidSlamVfxTimeline.ActTicks == DruidRemodelData.SlamActive, "act length = Core SlamActive 6");
        Check(DruidSlamVfxTimeline.HitRadius == 260 && DruidSlamVfxTimeline.HitRadius == DruidRemodelData.SlamRadius, "hit radius = Core SlamRadius 260");
        Check(Near(DruidSlamVfxTimeline.SpreadRadius, 286, Eps), "spread radius = 260 x 1.1 = 286");

        // ---- colour table (G1 1.2) ----
        Check(DruidSlamVfxTimeline.CoreHot == 0xFFF4D0 && DruidSlamVfxTimeline.CoreEdge == 0xD49A5C, "core colours #fff4d0 -> #d49a5c");
        Check(DruidSlamVfxTimeline.EarthLight == 0xDCC8A4 && DruidSlamVfxTimeline.EarthMid == 0x7E6236 && DruidSlamVfxTimeline.EarthDark == 0x241A10, "earth colours #dcc8a4 / #7e6236 / #241a10");
        Check(DruidSlamVfxTimeline.CrackCenter == 0x1C2418 && DruidSlamVfxTimeline.CrackEdgeColor == 0x364327, "crack colours #1c2418 centre / #364327 edge");
        Check(DruidSlamVfxTimeline.Lerp(0xFFF4D0, 0xD49A5C, 0) == 0xFFF4D0 && DruidSlamVfxTimeline.Lerp(0xFFF4D0, 0xD49A5C, 1) == 0xD49A5C, "colour lerp ends");

        // ---- earth shock ring ----
        Check(DruidSlamVfxTimeline.RingOuter(0) == 0 && DruidSlamVfxTimeline.RingOuter(-3) == 0, "ring radius 0 at act 0");
        Check(Near(DruidSlamVfxTimeline.RingOuter(6), 260, 4), "ring radius 260 +-4 on the damage tick (act +6)");
        Check(Near(DruidSlamVfxTimeline.RingOuter(26), 286, 4), "ring radius 286 +-4 at act +26");
        Check(Near(DruidSlamVfxTimeline.RingOuter(60), 286, Eps), "ring stays at 286 after its death");
        bool mono = true, widthOk = true, alphaOk = true; double prev = -1;
        for (double a = -2; a <= 40; a += .25)
        {
            double r = DruidSlamVfxTimeline.RingOuter(a); if (r < prev - Eps) mono = false; prev = r;
            double w = DruidSlamVfxTimeline.RingWidth(a); if (w > 30 + Eps || w < 0 || w > r + Eps) widthOk = false;
            double al = DruidSlamVfxTimeline.RingAlpha(a); if (al > .5 + Eps || al < 0) alphaOk = false;
        }
        Check(mono, "ring radius never shrinks");
        Check(widthOk, "ring band width <= 30 Core px, never wider than the radius");
        Check(alphaOk, "ring alpha <= .5");
        Check(DruidSlamVfxTimeline.RingAlpha(26) == 0 && DruidSlamVfxTimeline.RingAlpha(0) == 0, "ring invisible at act 0 and gone at +26");
        Check(DruidSlamVfxTimeline.RingAlpha(6) > .4, "ring is strongest on the damage tick");

        // ---- radial cracks ----
        foreach (int seed in new[] { 1, 7, 12345, -99, 20261104, int.MaxValue })
        {
            bool all7 = true, endOk = true, jagged = true, widthsOk = true, radiusOk = true;
            var angles = new List<double>();
            for (int i = 0; i < DruidSlamVfxTimeline.CrackCount; i++)
            {
                var c = DruidSlamVfxTimeline.Crack(i, seed, 260);
                if (c.Length != DruidSlamVfxTimeline.CrackSteps + 1) all7 = false;
                if (!Near(c[c.Length - 1].R, 260, 4) || !Near(Math.Sqrt(c[c.Length - 1].X * c[c.Length - 1].X + c[c.Length - 1].Y * c[c.Length - 1].Y), 260, 4)) endOk = false;
                double dev = 0;
                for (int k = 1; k < c.Length; k++)
                {
                    double r = Math.Sqrt(c[k].X * c[k].X + c[k].Y * c[k].Y); if (!Near(r, c[k].R, 1e-6)) radiusOk = false;
                    double a0 = Math.Atan2(c[k].Y, c[k].X), a1 = Math.Atan2(c[1].Y, c[1].X); double d = Math.Abs(Math.Atan2(Math.Sin(a0 - a1), Math.Cos(a0 - a1))); dev = Math.Max(dev, d);
                    double w = DruidSlamVfxTimeline.CrackWidth(c[k].R); if (w < 3.9 || w > 15.1) widthsOk = false;
                }
                if (dev < .01) jagged = false;
                angles.Add(Math.Atan2(c[1].Y, c[1].X));
            }
            Check(all7, "7 cracks, 9 joints each, seed " + seed);
            Check(endOk, "every crack ends on r260 +-4, seed " + seed);
            Check(radiusOk, "crack joint radii = 260 k / 8, seed " + seed);
            Check(jagged, "cracks are jagged (not straight spokes), seed " + seed);
            Check(widthsOk, "crack width 4..15 Core px, seed " + seed);
            angles.Sort(); double minGap = double.MaxValue; for (int i = 0; i < angles.Count; i++) { double g = (i + 1 < angles.Count ? angles[i + 1] : angles[0] + Math.PI * 2) - angles[i]; minGap = Math.Min(minGap, g); }
            Check(minGap > .5, "7 cracks stay spread around the circle, seed " + seed);
        }
        Check(DruidSlamVfxTimeline.Crack(0, 5, 0).Length == 0, "no crack drawn at reach 0");
        var part = DruidSlamVfxTimeline.Crack(2, 5, 100);
        Check(part.Length >= 2 && Near(part[part.Length - 1].R, 100, 1e-6), "clipped crack ends exactly at the reach");
        Check(Near(DruidSlamVfxTimeline.CrackReach(6), 260, 4) && DruidSlamVfxTimeline.CrackReach(0) == 0 && DruidSlamVfxTimeline.CrackReach(30) == 260, "cracks grow at the ring speed to 260 on act +6 and stop");
        for (int a = 0; a <= 6; a++) Check(Near(DruidSlamVfxTimeline.CrackReach(a), DruidSlamVfxTimeline.RingOuter(a), Eps), "crack reach = ring radius at act " + a);

        // ---- crack decal: 3.0 s, last 1 s fade, alpha <= .42 ----
        Check(DruidSlamVfxTimeline.DecalLife == 180 && DruidSlamVfxTimeline.DecalFade == 60, "decal 180 ticks (3.0 s), fade 60 ticks (1 s)");
        bool decalOk = true; for (double a = -1; a <= 200; a += .5) if (DruidSlamVfxTimeline.CrackAlpha(a) > .42 + Eps) decalOk = false;
        Check(decalOk, "decal alpha <= .42");
        Check(Near(DruidSlamVfxTimeline.CrackAlpha(60), .42, Eps) && Near(DruidSlamVfxTimeline.CrackAlpha(120), .42, Eps), "decal holds .42 until the last second");
        Check(DruidSlamVfxTimeline.CrackAlpha(185) > 0 && DruidSlamVfxTimeline.CrackAlpha(186) == 0 && DruidSlamVfxTimeline.CrackAlpha(300) == 0, "decal gone at act +186 (= +6 plus 180)");
        bool fade = true; double q = double.MaxValue; for (double a = 126; a < 186; a += 1) { double v = DruidSlamVfxTimeline.CrackAlpha(a); if (v > q + Eps) fade = false; q = v; }
        Check(fade && DruidSlamVfxTimeline.CrackAlpha(156) < .42 * .6, "decal fades steadily over the last 60 ticks");

        // ---- shards ----
        var counts = new HashSet<int>(); bool shardsOk = true, ratioOk = true, sizeOk = true, lifeOk = true, spawnOk = true, perTickOk = true, colorOk = true, alphaShardOk = true, travelOk = true, dirOk = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var sh = DruidSlamVfxTimeline.Shards(seed); counts.Add(sh.Length);
            if (sh.Length < 10 || sh.Length > 14) shardsOk = false;
            var perTick = new int[7];
            var angles = new List<double>();
            foreach (var s in sh)
            {
                if (s.Length / s.Width < 3.3) ratioOk = false;
                if (s.Width * DruidSlamVfxTimeline.ScreenPerCorePx < 3 || s.Length * DruidSlamVfxTimeline.ScreenPerCorePx < 10) sizeOk = false;
                if (s.Life < 12 || s.Life > 21) lifeOk = false;
                if (s.SpawnAct < 0 || s.SpawnAct > 6) spawnOk = false; else perTick[s.SpawnAct]++;
                if (!Earth.Contains(s.Color)) colorOk = false;
                if (DruidSlamVfxTimeline.ShardTravel(s, 0) != 0 || DruidSlamVfxTimeline.ShardTravel(s, s.Life) < 85 || DruidSlamVfxTimeline.ShardTravel(s, s.Life) > 170.001) travelOk = false;
                for (int age = -2; age <= s.Life + 1; age++) { double al = DruidSlamVfxTimeline.ShardAlpha(s, age); if (al < 0 || al > .85 + Eps) alphaShardOk = false; }
                if (DruidSlamVfxTimeline.ShardAlpha(s, -1) != 0 || DruidSlamVfxTimeline.ShardAlpha(s, s.Life) != 0) alphaShardOk = false;
                if (DruidSlamVfxTimeline.ShardHeight(s, 0) != 0 || Math.Abs(DruidSlamVfxTimeline.ShardHeight(s, s.Life)) > 1e-6) travelOk = false;
                angles.Add(s.Angle);
            }
            if (perTick.Max() > 2) perTickOk = false;
            // spread: sorted angles around the circle have no gap wider than 130 deg
            var wrapped = angles.Select(a => (a % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)).OrderBy(a => a).ToList(); double maxGap = 0;
            for (int i = 0; i < wrapped.Count; i++) maxGap = Math.Max(maxGap, (i + 1 < wrapped.Count ? wrapped[i + 1] : wrapped[0] + Math.PI * 2) - wrapped[i]);
            if (maxGap > 130 * Math.PI / 180) dirOk = false;
        }
        Check(shardsOk && counts.Min() == 10 && counts.Max() == 14 && counts.Count == 5, "shard count 10..14 over 2000 seeds (all five values occur)");
        Check(ratioOk, "shard length / width >= 3.3");
        Check(sizeOk, "shards are at least 3 x 10 screen px at 1x (no dots)");
        Check(lifeOk, "shard life 12..21 ticks (0.2..0.35 s)");
        Check(spawnOk, "shards spawn during act 0..+6");
        Check(perTickOk, "at most 2 new shards per tick");
        Check(colorOk, "shard colours are the earth table");
        Check(alphaShardOk, "shard alpha within 0..0.85 and 0 outside its life");
        Check(travelOk, "shards leave the centre, travel 90..170 Core px and land");
        Check(dirOk, "shards fly in all directions (no gap > 130 deg)");

        // ---- dust ----
        bool dustOk = true, dustLife = true, dustAlpha = true, dustTop = true, dustColor = true, spawnTick = true, concurrent = true, dustSpread = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var d = DruidSlamVfxTimeline.Dust(seed); var sh = DruidSlamVfxTimeline.Shards(seed);
            if (d.Length != DruidSlamVfxTimeline.DustCount) dustOk = false;
            var perTick = new int[40]; foreach (var s in sh) perTick[s.SpawnAct]++;
            foreach (var p in d)
            {
                if (p.Life < 36 || p.Life > 48) dustLife = false;
                if (!Earth.Contains(p.Color)) dustColor = false;
                if (Math.Sqrt(p.X * p.X + p.Y * p.Y) > 260 + Eps) dustSpread = false;
                perTick[p.SpawnAct]++;
                for (int age = -1; age <= p.Life + 1; age++)
                {
                    double al = DruidSlamVfxTimeline.DustAlpha(p, age); if (al > .5 + Eps || al < 0) dustAlpha = false;
                    if (age >= 0 && age < p.Life && DruidSlamVfxTimeline.DustTop(p, age) > .4 * 131 + Eps) dustTop = false;
                }
            }
            if (perTick.Max() > 2) spawnTick = false;   // shards and dust together: never more than 2 new body sprites in one tick
            for (int act = 0; act <= 200; act++)
            {
                int alive = 0;
                foreach (var s in sh) if (DruidSlamVfxTimeline.ShardAlpha(s, act - s.SpawnAct) > 0) alive++;
                foreach (var p in d) if (DruidSlamVfxTimeline.DustAlpha(p, act - p.SpawnAct) > 0) alive++;
                if (act < DruidSlamVfxTimeline.CoreLife) alive++;   // the contact core
                if (alive > 24) concurrent = false;
            }
        }
        Check(dustOk, "8 dust puffs");
        Check(dustLife, "dust life 36..48 ticks (0.6..0.8 s)");
        Check(dustAlpha, "dust alpha <= .5");
        Check(dustTop, "dust top <= 0.4 H (52.4 Core px)");
        Check(dustColor, "dust colours are the earth table");
        Check(dustSpread, "dust stays inside the hit circle");
        Check(spawnTick, "shards + dust: at most 2 new body sprites per tick");
        Check(concurrent, "never more than 24 sprites alive for one slam (core included)");

        // ---- contact core ----
        Check(DruidSlamVfxTimeline.CoreLife == 5 && DruidSlamVfxTimeline.CorePeakAct == 2, "core 5 ticks, peak at +2");
        Check(Near(DruidSlamVfxTimeline.CoreDiameter, 1.2 * 131, 1e-6), "core diameter 1.2 H");
        Check(Near(DruidSlamVfxTimeline.CoreAlpha(0), 1, Eps), "core alpha 1 at act 0");
        Check(Near(DruidSlamVfxTimeline.CoreAlpha(1), .225, 1e-6), "core alpha .225 at 20 % of life");
        Check(DruidSlamVfxTimeline.CoreAlpha(5) == 0 && DruidSlamVfxTimeline.CoreAlpha(-1) == 0, "core gone after 5 ticks");
        bool coreMono = true; for (int a = 0; a < 4; a++) if (DruidSlamVfxTimeline.CoreAlpha(a + 1) > DruidSlamVfxTimeline.CoreAlpha(a) + Eps) coreMono = false;
        Check(coreMono, "core alpha only falls");
        Check(DruidSlamVfxTimeline.CoreScale(2) == 1 && DruidSlamVfxTimeline.CoreScale(0) < 1 && DruidSlamVfxTimeline.CoreScale(4) < 1 && DruidSlamVfxTimeline.CoreScale(4) > .6, "core size peaks at +2");
        Check(DruidSlamVfxTimeline.CoreColor(0) == 0xFFF4D0 && DruidSlamVfxTimeline.CoreColor(5) == 0xD49A5C, "core colour #fff4d0 at act 0 to #d49a5c");
        Check(((DruidSlamVfxTimeline.CoreColor(0) >> 16) & 0xFF) >= 240, "core peak red channel >= 240");

        // ---- wind-up chunks ----
        bool chunkOk = true, liftOk = true, chunkSize = true;
        for (int seed = -200; seed < 800; seed++)
        {
            var ch = DruidSlamVfxTimeline.Chunks(seed); if (ch.Length != 6) chunkOk = false;
            foreach (var c in ch)
            {
                if (Math.Sqrt(c.X * c.X + c.Y * c.Y) > .9 * 260 || Math.Sqrt(c.X * c.X + c.Y * c.Y) < 60) chunkOk = false;
                if (c.Width * DruidSlamVfxTimeline.ScreenPerCorePx < 3 || c.Length * DruidSlamVfxTimeline.ScreenPerCorePx < 10) chunkSize = false;
                for (int w = 0; w < 12; w++) { double px = DruidSlamVfxTimeline.ChunkLiftPx(c, w); if (px < 1 - Eps || px > 3 + Eps) liftOk = false; }
            }
        }
        Check(chunkOk, "6 wind-up chunks inside the circle");
        Check(chunkSize, "wind-up chunks are at least 3 x 10 screen px");
        Check(liftOk, "wind-up chunks bob 1..3 screen px");
        Check(DruidSlamVfxTimeline.WindLiftTicks == 12 && !DruidSlamVfxTimeline.ChunkActive(-1) && DruidSlamVfxTimeline.ChunkActive(0) && DruidSlamVfxTimeline.ChunkActive(11) && !DruidSlamVfxTimeline.ChunkActive(12), "wind-up chunks only in the last 12 ticks");
        Check(DruidSlamVfxTimeline.ChunkAlpha(12) == 0 && DruidSlamVfxTimeline.ChunkAlpha(5) <= .85 + Eps && DruidSlamVfxTimeline.ChunkAlpha(0) > 0, "wind-up chunk alpha");

        // ---- determinism ----
        int s0 = DruidSlamVfxTimeline.Seed(1234, 640.4, -210.6);
        Check(s0 == DruidSlamVfxTimeline.Seed(1234, 640.4, -210.6), "seed is a pure function of tick and position");
        Check(s0 != DruidSlamVfxTimeline.Seed(1235, 640.4, -210.6) && s0 != DruidSlamVfxTimeline.Seed(1234, 641.4, -210.6), "seed changes with tick and position");
        Check(Same(DruidSlamVfxTimeline.Shards(s0), DruidSlamVfxTimeline.Shards(s0)), "same seed, same shards");
        Check(DruidSlamVfxTimeline.Dust(s0).Select(p => p.X + p.Size).SequenceEqual(DruidSlamVfxTimeline.Dust(s0).Select(p => p.X + p.Size)), "same seed, same dust");
        Check(DruidSlamVfxTimeline.Chunks(s0).Select(c => c.X).SequenceEqual(DruidSlamVfxTimeline.Chunks(s0).Select(c => c.X)), "same seed, same chunks");
        bool crackSame = true; for (int i = 0; i < 7; i++) { var a = DruidSlamVfxTimeline.Crack(i, s0, 260); var b = DruidSlamVfxTimeline.Crack(i, s0, 260); if (!a.Select(p => p.X + p.Y * 3).SequenceEqual(b.Select(p => p.X + p.Y * 3))) crackSame = false; }
        Check(crackSame, "same seed, same cracks");
        Check(!DruidSlamVfxTimeline.Shards(s0).Select(s => s.Angle).SequenceEqual(DruidSlamVfxTimeline.Shards(s0 + 1).Select(s => s.Angle)), "different seed, different shards");

        SlashChecks();
        Console.WriteLine("druid skill vfx checks: " + checks + " run, " + bad + " failed");
        return bad == 0 ? 0 : 1;
    }

    static bool Same(DruidSlamVfxTimeline.Shard[] a, DruidSlamVfxTimeline.Shard[] b)
    {
        if (a.Length != b.Length) return false;
        for (int i = 0; i < a.Length; i++) if (a[i].Angle != b[i].Angle || a[i].Life != b[i].Life || a[i].Length != b[i].Length || a[i].Color != b[i].Color || a[i].SpawnAct != b[i].SpawnAct) return false;
        return true;
    }
}
