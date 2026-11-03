using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// Druid slashCombo body VFX (G1 2 (1)): the numbers of DruidSlashVfxTimeline against the Core facts and the G1 table. Partial of Program (Check / Near / Earth live there).
static partial class Program
{
    static void SlashChecks()
    {
        Check(DruidSlashVfxTimeline.ActTicks == 10 && DruidSlashVfxTimeline.ActTicks == DruidRemodelData.SlashActive, "slash: swing length = Core SlashActive 10");
        Check(DruidSlashVfxTimeline.HitAct == 2 && DruidRemodelData.SlashHitAt == 8 && DruidSlashVfxTimeline.HitAct == DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt, "slash: damage tick = act +2 (St2 == SlashHitAt 8)");
        Check(DruidSlashVfxTimeline.HalfAngle == 1.2 && DruidSlashVfxTimeline.HalfAngle == DruidBoss.SlashHalfAngle, "slash: fan half angle = Core 1.2 rad");
        Check(DruidSlashVfxTimeline.ReachExtra == 300 && DruidSlashVfxTimeline.ReachExtra == DruidRemodelData.SlashReach, "slash: Core SlashReach 300");
        Check(Near(DruidSlashVfxTimeline.Reach(70, 16), 70 + 16 + 300, Eps), "slash: reach = R + pr + 300");
        Check(DruidSlashVfxTimeline.BoneEdge == 0xEFE6D2 && DruidSlashVfxTimeline.TrailMid == 0x9A8A72 && DruidSlashVfxTimeline.Bark == 0x4A3826, "slash: trail colours #efe6d2 / #9a8a72 / #4a3826");
        Check(DruidSlashVfxTimeline.GougeShadow == 0x241A10 && DruidSlashVfxTimeline.GougeEdge == 0x364327, "slash: furrow colours #241a10 / #364327");

        // hit-3 telegraph orb glow: last 12 wind ticks, 0 -> .8, #d49a5c, <= 0.15 H, hit 3 only
        Check(DruidSlashVfxTimeline.OrbWindTicks == 12 && DruidSlashVfxTimeline.OrbColor == 0xD49A5C, "slash orb: last 12 wind ticks, #d49a5c");
        Check(Near(DruidSlashVfxTimeline.OrbDiameter, .15 * DruidSlashVfxTimeline.HeroH, Eps), "slash orb: diameter 0.15 H");
        Check(DruidSlashVfxTimeline.OrbAlpha(13) == 0 && DruidSlashVfxTimeline.OrbAlpha(0) == 0 && DruidSlashVfxTimeline.OrbAlpha(12) > 0, "slash orb: off before the last 12 wind ticks and after the wind");
        Check(Near(DruidSlashVfxTimeline.OrbAlpha(1), .8, Eps), "slash orb: peak .8 on the last wind tick");
        bool orbMono = true; for (int r = 12; r > 1; r--) if (DruidSlashVfxTimeline.OrbAlpha(r - 1) < DruidSlashVfxTimeline.OrbAlpha(r)) orbMono = false;
        Check(orbMono, "slash orb: glow only rises through the wind");
        Check(!DruidSlashVfxTimeline.HasOrbGlow(0) && !DruidSlashVfxTimeline.HasOrbGlow(1) && DruidSlashVfxTimeline.HasOrbGlow(2), "slash orb: hit 3 telegraph only");

        // leading edge angle (offset from Facing)
        Check(Near(DruidSlashVfxTimeline.LeadAngle(0), -1.2, .02), "slash trail: leading edge at -1.2 rad on act 0");
        Check(Near(DruidSlashVfxTimeline.LeadAngle(2), 1.2, .02), "slash trail: leading edge at +1.2 rad on the damage tick (act +2)");
        Check(Near(DruidSlashVfxTimeline.LeadAngle(4), 1.5, .02), "slash trail: leading edge at +1.5 rad on act +4");
        Check(Near(DruidSlashVfxTimeline.LeadAngle(8), 1.5, .02) && Near(DruidSlashVfxTimeline.LeadAngle(-3), -1.2, Eps), "slash trail: edge held at +1.5 after +4, -1.2 before act 0");
        bool leadMono = true, tailOk = true, fanCovered = true, anglesOk = true; double prevLead = -9;
        for (double a = 0; a <= 8; a += .125)
        {
            double lead = DruidSlashVfxTimeline.LeadAngle(a), tail = DruidSlashVfxTimeline.TailAngle(a);
            if (lead < prevLead - Eps) leadMono = false;
            prevLead = lead;
            if (tail > lead + Eps || tail < -1.2 - Eps || lead - tail > DruidSlashVfxTimeline.TrailTailSpan + Eps) tailOk = false;
            foreach (var an in DruidSlashVfxTimeline.TrailAngles(a, 24)) if (an < -1.2 - Eps || an > 1.5 + Eps) anglesOk = false;
        }
        // the union of the swept intervals over act 0..2 covers the whole judged fan -1.2 .. +1.2
        for (double ang = -1.2; ang <= 1.2 + 1e-9; ang += .01)
        {
            bool cov = false;
            for (double a = 0; a <= 2 + 1e-9; a += .05) if (ang >= DruidSlashVfxTimeline.TailAngle(a) - 1e-9 && ang <= DruidSlashVfxTimeline.LeadAngle(a) + 1e-9) { cov = true; break; }
            if (!cov) { fanCovered = false; break; }
        }
        Check(leadMono, "slash trail: leading edge never swings back");
        Check(tailOk, "slash trail: tail behind the head, inside the fan, at most 1.1 rad long");
        Check(fanCovered, "slash trail: act 0..+2 sweeps the whole judged fan (Facing -1.2 .. +1.2)");
        Check(anglesOk, "slash trail: every cross-section stays within -1.2 .. +1.5 rad");
        Check(DruidSlashVfxTimeline.TrailAngles(1, 24).Length == 25, "slash trail: 24 segments");

        // alpha and life
        Check(DruidSlashVfxTimeline.TrailLife == 8 && DruidSlashVfxTimeline.TrailLife <= 12, "slash trail: 8 ticks (0.13 s), well under the 12-tick cover limit");
        Check(DruidSlashVfxTimeline.TrailAlpha(-1) == 0 && DruidSlashVfxTimeline.TrailAlpha(8) == 0 && DruidSlashVfxTimeline.TrailAlpha(9) == 0 && DruidSlashVfxTimeline.TrailAlpha(60) == 0, "slash trail: alpha 0 from act +8 on");
        bool alphaFall = true, alphaRange = true; double pa = 9;
        for (double a = 0; a < 8; a += .125)
        {
            double al = DruidSlashVfxTimeline.TrailAlpha(a); if (al < 0 || al > 1 + Eps) alphaRange = false;
            if (a >= 2) { if (al > pa + Eps) alphaFall = false; pa = al; }
        }
        Check(alphaRange && alphaFall, "slash trail: alpha within 0..1 and only falls after the damage tick");
        Check(DruidSlashVfxTimeline.TrailAlpha(0) > 0 && DruidSlashVfxTimeline.TrailAlpha(7.5) < .1, "slash trail: visible from act 0, almost gone just before +8");

        // size
        foreach (var rc in new[] { new double[] { 60, 16 }, new double[] { 70, 16 }, new double[] { 90, 24 }, new double[] { 120, 14 } })
        {
            double reach = DruidSlashVfxTimeline.Reach(rc[0], rc[1]);
            Check(Near(DruidSlashVfxTimeline.TrailOuter(reach), rc[0] + rc[1] + 300, 4), "slash trail: outer radius = R + pr + 300 +-4, R " + rc[0] + " pr " + rc[1]);
            Check(DruidSlashVfxTimeline.TrailThickness(reach) <= 17 + Eps && DruidSlashVfxTimeline.TrailThickness(reach) > 4, "slash trail: thickness <= 17 Core px, R " + rc[0]);
            Check(DruidSlashVfxTimeline.TrailInner(reach) >= .85 * reach - Eps && DruidSlashVfxTimeline.TrailInner(reach) < reach, "slash trail: band lies in 0.85..1.0 of the reach, R " + rc[0]);
        }
        Check(Near(DruidSlashVfxTimeline.TrailLift, .35 * 131, 1e-6), "slash trail: lifted 0.35 H above the floor");
        Check(DruidSlashVfxTimeline.TrailMaxThickness * DruidSlamVfxTimeline.ScreenPerCorePx <= .15 * 90 + .5, "slash trail: 17 Core px = <= 0.15 H (13 px) on screen");

        // colour ramp
        Check(DruidSlashVfxTimeline.TrailColor(1) == 0xEFE6D2 && DruidSlashVfxTimeline.TrailColor(.95) == 0xEFE6D2, "slash trail: leading edge exactly #efe6d2");
        Check(DruidSlashVfxTimeline.TrailColor(.5) == 0x9A8A72 && DruidSlashVfxTimeline.TrailColor(0) == 0x4A3826, "slash trail: tail cools #9a8a72 -> #4a3826");
        bool rampBright = true; int pl = -1;
        for (int i = 0; i <= 20; i++)
        {
            uint c = DruidSlashVfxTimeline.TrailColor(i / 20.0); int lum = (int)(((c >> 16) & 255) + ((c >> 8) & 255) + (c & 255));
            if (lum < pl) rampBright = false;
            pl = lum;
        }
        Check(rampBright, "slash trail: colour only gets brighter toward the leading edge");
        Check(DruidSlashVfxTimeline.TrailAlphaAlong(0) == 0 && Near(DruidSlashVfxTimeline.TrailAlphaAlong(1), 1, Eps), "slash trail: opacity 0 at the tail, 1 at the leading edge");

        // which hit draws what
        Check(DruidSlashVfxTimeline.HasTrail(0) && DruidSlashVfxTimeline.HasTrail(1) && !DruidSlashVfxTimeline.HasTrail(2), "hits 1 and 2 draw the trail, hit 3 does not");
        Check(!DruidSlashVfxTimeline.HasStrike(0) && !DruidSlashVfxTimeline.HasStrike(1) && DruidSlashVfxTimeline.HasStrike(2), "ground strike, dust and furrow only on hit 3");
        Check(Near(DruidSlashVfxTimeline.HitCentreAdvance, 5, Eps), "slash: boss walks 2 x 2.5 px by the damage tick");

        // strike core
        Check(Near(DruidSlashVfxTimeline.StrikeCoreDiameter, .8 * 131, 1e-6), "strike core diameter 0.8 H");
        Check(DruidSlamVfxTimeline.CoreLife == 5 && DruidSlamVfxTimeline.CorePeakAct == 2 && Near(DruidSlashVfxTimeline.StrikeCoreAlpha(0), 1, Eps) && DruidSlashVfxTimeline.StrikeCoreAlpha(5) == 0, "strike core: 5 ticks, peak +2, alpha 1 -> 0");
        Check(DruidSlashVfxTimeline.StrikeCoreColor(0) == 0xFFF4D0 && DruidSlashVfxTimeline.StrikeCoreColor(5) == 0xD49A5C && DruidSlashVfxTimeline.StrikeCoreScale(2) == 1, "strike core: #fff4d0 -> #d49a5c, size peaks at +2");

        // strike shards and dust
        var counts = new HashSet<int>(); bool cntOk = true, angOk = true, ratio = true, size = true, life = true, spawn = true, perTick = true, color = true, alpha = true, travel = true, alive = true, dir = true, dustSpawn = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var sh = DruidSlashVfxTimeline.Shards(seed); var du = DruidSlashVfxTimeline.Dust(seed); counts.Add(sh.Length);
            if (sh.Length < 6 || sh.Length > 8) cntOk = false;
            var pt = new int[40];
            foreach (var s in sh)
            {
                if (Math.Abs(s.Angle) > 35 * Math.PI / 180 + Eps) angOk = false;
                if (s.Length / s.Width < 3.3) ratio = false;
                if (s.Width * DruidSlamVfxTimeline.ScreenPerCorePx < 3 || s.Length * DruidSlamVfxTimeline.ScreenPerCorePx < 10) size = false;
                if (s.Life < 12 || s.Life > 21) life = false;
                if (s.SpawnAct < 2 || s.SpawnAct > 6) spawn = false; else pt[s.SpawnAct]++;
                if (!Earth.Contains(s.Color)) color = false;
                if (DruidSlamVfxTimeline.ShardTravel(s, 0) != 0 || DruidSlamVfxTimeline.ShardTravel(s, s.Life) < 70 - Eps || DruidSlamVfxTimeline.ShardTravel(s, s.Life) > 130 + Eps || DruidSlamVfxTimeline.ShardHeight(s, 0) != 0) travel = false;
                for (int age = -2; age <= s.Life + 1; age++) { double al = DruidSlamVfxTimeline.ShardAlpha(s, age); if (al < 0 || al > .85 + Eps) alpha = false; }
            }
            // the wedge is filled: first and last shard near its two edges
            var angs = sh.Select(x => x.Angle).OrderBy(x => x).ToList();
            if (angs.First() > -20 * Math.PI / 180 || angs.Last() < 20 * Math.PI / 180) dir = false;
            if (du.Length != 4) dustSpawn = false;
            foreach (var p in du) { if (p.SpawnAct < 7) dustSpawn = false; else pt[p.SpawnAct]++; }
            if (pt.Max() > 2) perTick = false;
            for (int act = 0; act <= 200; act++)
            {
                int n = 0;
                foreach (var s in sh) if (DruidSlamVfxTimeline.ShardAlpha(s, act - s.SpawnAct) > 0) n++;
                foreach (var p in du) if (DruidSlamVfxTimeline.DustAlpha(p, act - p.SpawnAct) > 0) n++;
                if (act >= 2 && act < 7) n++;   // the core
                if (n > 24) alive = false;
            }
        }
        Check(cntOk && counts.Min() == 6 && counts.Max() == 8 && counts.Count == 3, "strike shards: 6..8 over 2000 seeds (all three values occur)");
        Check(angOk, "strike shards: every direction within Facing +-35 deg");
        Check(dir, "strike shards: the wedge is filled (first / last shard beyond +-20 deg)");
        Check(ratio, "strike shards: length / width >= 3.3");
        Check(size, "strike shards: at least 3 x 10 screen px at 1x (no dots)");
        Check(life, "strike shards: life 12..21 ticks (0.2..0.35 s)");
        Check(spawn, "strike shards: spawn on act +2 .. +6");
        Check(color && alpha && travel, "strike shards: earth colours, alpha <= .85, travel 70..130 Core px");
        Check(perTick, "strike: at most 2 new body sprites per tick (shards + dust)");
        Check(dustSpawn, "strike dust: 4 puffs, none before act +7");
        Check(alive, "strike: never more than 24 sprites alive for one swing (core included)");

        bool dLife = true, dAlpha = true, dTop = true, dColor = true, dNear = true;
        for (int seed = -500; seed < 1500; seed++)
            foreach (var p in DruidSlashVfxTimeline.Dust(seed))
            {
                if (p.Life < 26 || p.Life > 30) dLife = false;
                if (!Earth.Contains(p.Color)) dColor = false;
                if (Math.Sqrt(p.X * p.X + p.Y * p.Y) > 70 + Eps) dNear = false;
                for (int age = -1; age <= p.Life + 1; age++)
                {
                    double al = DruidSlamVfxTimeline.DustAlpha(p, age); if (al > .5 + Eps || al < 0) dAlpha = false;
                    if (age >= 0 && age < p.Life && DruidSlamVfxTimeline.DustTop(p, age) > .4 * 131 + Eps) dTop = false;
                }
            }
        Check(dLife, "strike dust: life 26..30 ticks (<= 0.5 s)");
        Check(dAlpha, "strike dust: alpha <= .5");
        Check(dTop, "strike dust: top <= 0.4 H");
        Check(dColor && dNear, "strike dust: earth colours, within 70 Core px of the tip");

        // furrow
        Check(DruidSlashVfxTimeline.GougeLife == 150 && DruidSlashVfxTimeline.GougeFade == 60, "furrow: 150 ticks (2.5 s), last 60 ticks (1 s) fade");
        bool gAlpha = true; for (double a = -1; a <= 200; a += .5) if (DruidSlashVfxTimeline.GougeAlpha(a) > .35 + Eps) gAlpha = false;
        Check(gAlpha, "furrow: alpha <= .35");
        Check(Near(DruidSlashVfxTimeline.GougeAlpha(60), .35, Eps) && Near(DruidSlashVfxTimeline.GougeAlpha(90), .35, Eps), "furrow: holds .35 until the last second");
        Check(DruidSlashVfxTimeline.GougeAlpha(149) > 0 && DruidSlashVfxTimeline.GougeAlpha(150) == 0 && DruidSlashVfxTimeline.GougeAlpha(400) == 0 && DruidSlashVfxTimeline.GougeAlpha(0) == 0, "furrow: gone 150 ticks after the damage tick");
        bool gFade = true; double gq = double.MaxValue;
        for (double a = 90; a < 150; a += 1) { double v = DruidSlashVfxTimeline.GougeAlpha(a); if (v > gq + Eps) gFade = false; gq = v; }
        Check(gFade && DruidSlashVfxTimeline.GougeAlpha(120) < .35 * .6, "furrow: fades steadily over the last 60 ticks");
        foreach (var rp in new[] { new double[] { 70, 16, 0.3 }, new double[] { 90, 24, -2.4 }, new double[] { 60, 14, 1.9 } })
        {
            double R = rp[0], pr = rp[1], f = rp[2], len = DruidSlashVfxTimeline.GougeLength(pr);
            Check(Near(len, DruidSlashVfxTimeline.Reach(R, pr) - R, 4), "furrow: length = judged boundary - body edge +-4, R " + R + " pr " + pr);
            var g = DruidSlashVfxTimeline.Gouge(777, f, R, len, len);
            double endD = Math.Sqrt(g[g.Length - 1].X * g[g.Length - 1].X + g[g.Length - 1].Y * g[g.Length - 1].Y), startD = Math.Sqrt(g[0].X * g[0].X + g[0].Y * g[0].Y);
            Check(g.Length == DruidSlashVfxTimeline.GougeSteps + 1, "furrow: 9 joints");
            Check(Near(endD, DruidSlashVfxTimeline.Reach(R, pr), 4), "furrow: ends on the judged boundary R + pr + 300 +-4, R " + R);
            Check(Near(startD, R, 4), "furrow: starts at the body edge, R " + R);
            bool onLine = true; double cx = Math.Cos(f), cy = Math.Sin(f);
            foreach (var p in g)
            {
                double lateral = -cy * p.X + cx * p.Y; if (Math.Abs(lateral) > 4 + Eps) onLine = false;
                double along = cx * p.X + cy * p.Y; if (along < R - 1e-6 || along > R + len + 1e-6) onLine = false;
            }
            Check(onLine, "furrow: follows the middle line of the fan (Facing +-4 Core px)");
            var half = DruidSlashVfxTimeline.Gouge(777, f, R, len, len * .5);
            Check(half.Length >= 2 && Near(half[half.Length - 1].R, len * .5, 1e-6), "furrow: clipped to the carved part");
        }
        Check(DruidSlashVfxTimeline.GougeReach(0, 300) == 0 && Near(DruidSlashVfxTimeline.GougeReach(4, 300), 300, Eps) && DruidSlashVfxTimeline.GougeReach(40, 300) == 300, "furrow: carved over 4 ticks");
        Check(DruidSlashVfxTimeline.Gouge(1, 0, 70, 300, 0).Length == 0, "furrow: nothing at reach 0");
        bool gw = true; for (double a = 0; a <= 316; a += 4) { double w = DruidSlashVfxTimeline.GougeWidth(a, 316); if (w < 7.9 || w > 22.1) gw = false; }
        Check(gw, "furrow: width 8..22 Core px");

        // decal budget: hit 3 adds one decal, hits 1 and 2 add none (the view's cap of 8 is shared with the slam cracks)
        int decals = 0; for (int idx = 0; idx < 3; idx++) if (DruidSlashVfxTimeline.HasStrike(idx)) decals++;
        Check(decals == 1, "one furrow decal per combo");

        // determinism
        int s1 = DruidSlamVfxTimeline.Seed(900, 512.2, 88.9);
        Check(Same(DruidSlashVfxTimeline.Shards(s1), DruidSlashVfxTimeline.Shards(s1)), "slash: same seed, same shards");
        Check(DruidSlashVfxTimeline.Dust(s1).Select(p => p.X + p.Size + p.Life).SequenceEqual(DruidSlashVfxTimeline.Dust(s1).Select(p => p.X + p.Size + p.Life)), "slash: same seed, same dust");
        Check(DruidSlashVfxTimeline.Gouge(s1, 1.1, 70, 316, 316).Select(p => p.X + p.Y * 3).SequenceEqual(DruidSlashVfxTimeline.Gouge(s1, 1.1, 70, 316, 316).Select(p => p.X + p.Y * 3)), "slash: same seed, same furrow");
        Check(DruidSlashVfxTimeline.TrailAngles(3.5, 24).SequenceEqual(DruidSlashVfxTimeline.TrailAngles(3.5, 24)), "slash: trail is a pure function of the tick");
        Check(!DruidSlashVfxTimeline.Shards(s1).Select(x => x.Angle).SequenceEqual(DruidSlashVfxTimeline.Shards(s1 + 1).Select(x => x.Angle)), "slash: different seed, different shards");
    }
}
