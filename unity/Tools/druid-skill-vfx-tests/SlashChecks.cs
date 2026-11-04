using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

// Druid slashCombo body VFX (G1 2 (1), textured rework 11-04): the numbers of DruidSlashVfxTimeline against the Core facts and the G1 table. Partial of Program (Check / Near live there).
static partial class Program
{
    static void SlashChecks()
    {
        Check(DruidSlashVfxTimeline.ActTicks == 10 && DruidSlashVfxTimeline.ActTicks == DruidRemodelData.SlashActive, "slash: swing length = Core SlashActive 10");
        Check(DruidSlashVfxTimeline.HitAct == 2 && DruidRemodelData.SlashHitAt == 8 && DruidSlashVfxTimeline.HitAct == DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt, "slash: damage tick = act +2 (St2 == SlashHitAt 8)");
        Check(DruidSlashVfxTimeline.HalfAngle == 1.2 && DruidSlashVfxTimeline.HalfAngle == DruidBoss.SlashHalfAngle, "slash: fan half angle = Core 1.2 rad");
        Check(DruidSlashVfxTimeline.ReachExtra == 300 && DruidSlashVfxTimeline.ReachExtra == DruidRemodelData.SlashReach, "slash: Core SlashReach 300");
        Check(Near(DruidSlashVfxTimeline.Reach(70, 16), 70 + 16 + 300, Eps), "slash: reach = R + pr + 300");

        // hit-3 telegraph orb glow: last 12 wind ticks, 0 -> .8, #d49a5c, <= 0.15 H, hit 3 only
        Check(DruidSlashVfxTimeline.OrbWindTicks == 12 && DruidSlashVfxTimeline.OrbColor == 0xD49A5C, "slash orb: last 12 wind ticks, #d49a5c");
        Check(Near(DruidSlashVfxTimeline.OrbDiameter, .15 * DruidSlashVfxTimeline.HeroH, Eps), "slash orb: diameter 0.15 H");
        Check(DruidSlashVfxTimeline.OrbAlpha(13) == 0 && DruidSlashVfxTimeline.OrbAlpha(0) == 0 && DruidSlashVfxTimeline.OrbAlpha(12) > 0, "slash orb: off before the last 12 wind ticks and after the wind");
        Check(Near(DruidSlashVfxTimeline.OrbAlpha(1), .8, Eps), "slash orb: peak .8 on the last wind tick");
        bool orbMono = true; for (int r = 12; r > 1; r--) if (DruidSlashVfxTimeline.OrbAlpha(r - 1) < DruidSlashVfxTimeline.OrbAlpha(r)) orbMono = false;
        Check(orbMono, "slash orb: glow only rises through the wind");
        Check(!DruidSlashVfxTimeline.HasOrbGlow(0) && !DruidSlashVfxTimeline.HasOrbGlow(1) && DruidSlashVfxTimeline.HasOrbGlow(2), "slash orb: hit 3 telegraph only");

        // ---- ribbon on the real staff head (hits 1 and 2) ----
        Check(DruidSlashVfxTimeline.RibbonTicks == 8, "ribbon: the last 8 ticks of the staff head's path [r2: was 6]");
        Check(DruidSlashVfxTimeline.RibbonWidth >= .6 * 131 - 1e-9 && DruidSlashVfxTimeline.RibbonWidth <= .8 * 131 + 1e-9, "ribbon: width 0.6..0.8 H [r2: was 0.25..0.35]");
        Check(DruidSlashVfxTimeline.RibbonOldestAct(0) == 0 && DruidSlashVfxTimeline.RibbonOldestAct(5.5) == 0 && DruidSlashVfxTimeline.RibbonOldestAct(8) == 0 && DruidSlashVfxTimeline.RibbonOldestAct(9.5) == 1 && DruidSlashVfxTimeline.RibbonOldestAct(10) == 2, "ribbon: samples older than 8 ticks drop out [r2: was 6]");
        var rv = new HashSet<int>(); for (int seed = -2000; seed < 2000; seed++) { int v = DruidSlashVfxTimeline.RibbonVariant(seed); rv.Add(v); }
        Check(rv.Count == 3 && rv.All(v => v >= 0 && v <= 2), "ribbon: whip_smear variant 0..2 all occur over seeds");
        bool uOk = true; for (int v = 0; v < 3; v++) { double a = DruidSlashVfxTimeline.RibbonU0(v), b = DruidSlashVfxTimeline.RibbonU1(v); if (!(a >= 0 && a < b && b <= 1)) uOk = false; }
        Check(uOk, "ribbon: visible smear u range inside the texture, head < tail");
        // Core staff-tip formula (rig off): radius R + 70, direction Facing + WeaponAng, never the judged boundary R + pr + 300
        Check(DruidSlashVfxTimeline.StaffReachExtra == 70 && DruidSlashVfxTimeline.StaffReachExtra == DruidBoss.StaffReachExtra, "ribbon fallback: Core StaffReachExtra 70");
        bool tipOk = true, offBoundary = true, angleOk = true;
        foreach (var rp in new[] { new double[] { 60, 16 }, new double[] { 70, 16 }, new double[] { 90, 24 }, new double[] { 120, 14 } })
            foreach (double f in new[] { -2.4, 0.3, 1.9 })
                foreach (double wa in new[] { -.8, 0, 1.2 })
                {
                    double x, y; DruidSlashVfxTimeline.StaffTip(100, -50, f, wa, rp[0], out x, out y);
                    double rad = Math.Sqrt((x - 100) * (x - 100) + (y + 50) * (y + 50)), ang = Math.Atan2(y + 50, x - 100), dd = Math.Abs(Math.Atan2(Math.Sin(ang - (f + wa)), Math.Cos(ang - (f + wa))));
                    if (!Near(rad, rp[0] + 70, 1e-6)) tipOk = false;
                    if (dd > 1e-9) angleOk = false;
                    double reach = DruidSlashVfxTimeline.Reach(rp[0], rp[1]);
                    if (Math.Abs(rad - reach) < 2 * DruidSlashVfxTimeline.RibbonWidth || reach - rad < 230) offBoundary = false;   // the old arc sat at 'reach'; the ribbon is >= 230 Core px inside it
                }
        Check(tipOk, "ribbon fallback: staff head at R + 70 +-0 from the boss centre");
        Check(angleOk, "ribbon fallback: direction = Facing + WeaponAng");
        Check(offBoundary, "ribbon: not on the judged boundary R + pr + 300 (staff radius R + 70 is >= 230 Core px inside, more than twice the ribbon width)");

        // r2 ribbon look: tinted (no pure white), fades towards the tail, weak additive head
        Check(DruidSlashVfxTimeline.RibbonHeadTint != 0xFFFFFF && DruidSlashVfxTimeline.RibbonTailTint != 0xFFFFFF && DruidSlashVfxTimeline.RibbonTint(0) == DruidSlashVfxTimeline.RibbonHeadTint && DruidSlashVfxTimeline.RibbonTint(1) == DruidSlashVfxTimeline.RibbonTailTint, "ribbon tint bone #e8d8b8 -> bark #7a5a3c, never pure white");
        bool tintOk = true; for (double t = 0; t <= 1; t += .05) { uint c = DruidSlashVfxTimeline.RibbonTint(t); if (((c >> 16) & 0xFF) > 0xE8 || ((c >> 8) & 0xFF) > 0xD8 || (c & 0xFF) > 0xB8) tintOk = false; }
        Check(tintOk, "ribbon tint stays at or under the bone head colour on every channel");
        bool alongOk = true; double pv2 = 2; for (double t = 0; t <= 1.0001; t += .05) { double al = DruidSlashVfxTimeline.RibbonAlongAlpha(t); if (al > pv2 + Eps || al < 0 || al > 1) alongOk = false; pv2 = al; }
        Check(alongOk && Near(DruidSlashVfxTimeline.RibbonAlongAlpha(0), 1, Eps) && DruidSlashVfxTimeline.RibbonAlongAlpha(1) == 0, "ribbon: front edge brightest (alpha 1), transparent at the tail, only falls");
        Check(DruidSlashVfxTimeline.RibbonAddOpacity <= .4 && DruidSlashVfxTimeline.RibbonBlendAlpha <= .9, "ribbon: additive head is weak (_Opacity <= .4), blend layer <= .9");
        bool gFlat = true; for (double a = -1; a <= 200; a += .5) { double f = DruidSlashVfxTimeline.GougeAlphaFlat(a); if (f < 0 || f > .7 + Eps || f < DruidSlashVfxTimeline.GougeAlpha(a) - Eps || (DruidSlashVfxTimeline.GougeAlpha(a) == 0 && f != 0)) gFlat = false; }
        Check(gFlat && Near(DruidSlashVfxTimeline.GougeAlphaFlat(60), .7, Eps), "flat gouge alpha = projected x2, <= .7, same life");

        // alpha and life
        Check(DruidSlashVfxTimeline.TrailLife == 8 && DruidSlashVfxTimeline.TrailLife <= 12, "ribbon: 8 ticks (0.13 s), well under the 12-tick cover limit");
        Check(DruidSlashVfxTimeline.TrailAlpha(-1) == 0 && DruidSlashVfxTimeline.TrailAlpha(8) == 0 && DruidSlashVfxTimeline.TrailAlpha(9) == 0 && DruidSlashVfxTimeline.TrailAlpha(60) == 0, "ribbon: alpha 0 from act +8 on");
        bool alphaFall = true, alphaRange = true; double pa = 9;
        for (double a = 0; a < 8; a += .125)
        {
            double al = DruidSlashVfxTimeline.TrailAlpha(a); if (al < 0 || al > 1 + Eps) alphaRange = false;
            if (a >= 2) { if (al > pa + Eps) alphaFall = false; pa = al; }
        }
        Check(alphaRange && alphaFall, "ribbon: alpha within 0..1 and only falls after the damage tick");
        Check(DruidSlashVfxTimeline.TrailAlpha(0) > 0 && DruidSlashVfxTimeline.TrailAlpha(7.5) < .1, "ribbon: visible from act 0, almost gone just before +8");

        // which hit draws what
        Check(DruidSlashVfxTimeline.HasTrail(0) && DruidSlashVfxTimeline.HasTrail(1) && !DruidSlashVfxTimeline.HasTrail(2), "hits 1 and 2 draw the ribbon, hit 3 does not");
        Check(!DruidSlashVfxTimeline.HasStrike(0) && !DruidSlashVfxTimeline.HasStrike(1) && DruidSlashVfxTimeline.HasStrike(2), "ground strike, dust and gouge only on hit 3");
        Check(Near(DruidSlashVfxTimeline.HitCentreAdvance, 5, Eps), "slash: boss walks 2 x 2.5 px by the damage tick");

        // strike core (HDR)
        Check(Near(DruidSlashVfxTimeline.StrikeCoreDiameter, .8 * 131, 1e-6), "strike core diameter 0.8 H");
        Check(DruidSlamVfxTimeline.CoreLife == 5 && DruidSlamVfxTimeline.CorePeakAct == 2 && Near(DruidSlashVfxTimeline.StrikeCoreAlpha(0), 1, Eps) && DruidSlashVfxTimeline.StrikeCoreAlpha(5) == 0, "strike core: 5 ticks, peak +2, alpha 1 -> 0");
        Check(DruidSlashVfxTimeline.StrikeCoreColor(0) == 0xFFF4D0 && DruidSlashVfxTimeline.StrikeCoreColor(5) == 0xD49A5C && DruidSlashVfxTimeline.StrikeCoreScale(2) == 1, "strike core: #fff4d0 -> #d49a5c, size peaks at +2");
        Check(Near(DruidSlashVfxTimeline.StrikeCoreOpacity(0), 1.6, Eps) && DruidSlashVfxTimeline.StrikeCoreOpacity(5) == 0, "strike core HDR: _Opacity peaks at 1.6, 0 after 5 ticks [r2: was 2.4]");

        // strike debris and dust
        var counts = new HashSet<int>(); bool cntOk = true, angOk = true, size = true, life = true, spawn = true, perTick = true, alpha = true, travel = true, alive = true, dir = true, frameOk = true;
        for (int seed = -500; seed < 1500; seed++)
        {
            var sh = DruidSlashVfxTimeline.Debrises(seed); counts.Add(sh.Length);
            if (sh.Length < 6 || sh.Length > 8) cntOk = false;
            var pt = new int[40];
            foreach (var s in sh)
            {
                if (Math.Abs(s.Angle) > 35 * Math.PI / 180 + Eps) angOk = false;
                if (s.Frame < 0 || s.Frame > 15) frameOk = false;
                if (s.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMin < 14 - 1e-6 || s.Size * DruidSlamVfxTimeline.ScreenPerCorePx * DruidSlamVfxTimeline.DebrisFillMax > 30 + 1e-6) size = false;
                if (s.Life < 12 || s.Life > 21) life = false;
                if (s.SpawnAct < 2 || s.SpawnAct > 6) spawn = false; else pt[s.SpawnAct]++;
                if (DruidSlamVfxTimeline.DebrisTravel(s, 0) != 0 || DruidSlamVfxTimeline.DebrisTravel(s, s.Life) < 70 - Eps || DruidSlamVfxTimeline.DebrisTravel(s, s.Life) > 130 + Eps || DruidSlamVfxTimeline.DebrisHeight(s, 0) != 0) travel = false;
                for (int age = -2; age <= s.Life + 1; age++) { double al = DruidSlamVfxTimeline.DebrisAlpha(s, age); if (al < 0 || al > .85 + Eps) alpha = false; }
            }
            var angs = sh.Select(x => x.Angle).OrderBy(x => x).ToList();
            if (angs.First() > -20 * Math.PI / 180 || angs.Last() < 20 * Math.PI / 180) dir = false;
            if (pt.Max() > 2) perTick = false;
            for (int act = 0; act <= 200; act++)
            {
                int n = 0;
                foreach (var s in sh) if (DruidSlamVfxTimeline.DebrisAlpha(s, act - s.SpawnAct) > 0) n++;
                if (DruidSlashVfxTimeline.StrikeDustAlpha(act - DruidSlashVfxTimeline.HitAct) > 0) n++;   // the one dust
                if (act >= 2 && act < 7) n++;   // the core
                if (n > 24) alive = false;
            }
        }
        Check(cntOk && counts.Min() == 6 && counts.Max() == 8 && counts.Count == 3, "strike debris: 6..8 over 2000 seeds (all three values occur)");
        Check(angOk, "strike debris: every direction within Facing +-35 deg");
        Check(dir, "strike debris: the wedge is filled (first / last still beyond +-20 deg)");
        Check(frameOk, "strike debris: still index within 0..15");
        Check(size, "strike debris: visible size 14..30 screen px [r2: was 10..24]");
        Check(life, "strike debris: life 12..21 ticks (0.2..0.35 s)");
        Check(spawn, "strike debris: spawn on act +2 .. +6");
        Check(alpha && travel, "strike debris: alpha <= .85, travel 70..130 Core px");
        Check(perTick, "strike: at most 2 new debris per tick");
        Check(alive, "strike: never more than 24 sprites alive for one swing (core and dust included)");

        Check(Near(DruidSlashVfxTimeline.StrikeDustSize, 1.2 * 131, 1e-6), "strike dust: one earth_dust_burst of 1.2 H");
        bool sdAlpha = true; for (double a = -2; a < 40; a += .25) { double al = DruidSlashVfxTimeline.StrikeDustAlpha(a); if (al < 0 || al > .5 + Eps) sdAlpha = false; }
        Check(sdAlpha && DruidSlashVfxTimeline.StrikeDustAlpha(-1) == 0 && DruidSlashVfxTimeline.StrikeDustAlpha(DruidSlashVfxTimeline.StrikeDustLife) == 0, "strike dust: alpha <= .5, 0 outside its 30 ticks (0.5 s)");
        Check(DruidSlashVfxTimeline.StrikeDustSize * DruidSlamVfxTimeline.DustVisibleHeightFraction / 2 <= .4 * 131 + Eps, "strike dust: visible top <= 0.4 H");

        // gouge decal
        Check(DruidSlashVfxTimeline.GougeLife == 150 && DruidSlashVfxTimeline.GougeFade == 60, "gouge: 150 ticks (2.5 s), last 60 ticks (1 s) fade");
        bool gAlpha = true; for (double a = -1; a <= 200; a += .5) if (DruidSlashVfxTimeline.GougeAlpha(a) > .35 + Eps) gAlpha = false;
        Check(gAlpha, "gouge: alpha <= .35");
        Check(Near(DruidSlashVfxTimeline.GougeAlpha(60), .35, Eps) && Near(DruidSlashVfxTimeline.GougeAlpha(90), .35, Eps), "gouge: holds .35 until the last second");
        Check(DruidSlashVfxTimeline.GougeAlpha(149) > 0 && DruidSlashVfxTimeline.GougeAlpha(150) == 0 && DruidSlashVfxTimeline.GougeAlpha(400) == 0 && DruidSlashVfxTimeline.GougeAlpha(0) == 0, "gouge: gone 150 ticks after the damage tick");
        bool gFade = true; double gq = double.MaxValue;
        for (double a = 90; a < 150; a += 1) { double v = DruidSlashVfxTimeline.GougeAlpha(a); if (v > gq + Eps) gFade = false; gq = v; }
        Check(gFade && DruidSlashVfxTimeline.GougeAlpha(120) < .35 * .6, "gouge: fades steadily over the last 60 ticks");
        var gv = new HashSet<int>(); for (int seed = -2000; seed < 2000; seed++) gv.Add(DruidSlashVfxTimeline.GougeVariant(seed));
        Check(gv.Count == 3 && gv.All(v => v >= 0 && v <= 2), "gouge: ground_gouge_linear variant 0..2 all occur over seeds");
        foreach (var rp in new[] { new double[] { 70, 16 }, new double[] { 90, 24 }, new double[] { 60, 14 } })
            for (int v = 0; v < 3; v++)
            {
                double R = rp[0], pr = rp[1], len = DruidSlashVfxTimeline.GougeLength(pr);
                Check(Near(len, DruidSlashVfxTimeline.Reach(R, pr) - R, 4), "gouge: length = judged boundary - body edge +-4, R " + R + " pr " + pr);
                double size2 = DruidSlashVfxTimeline.GougeSize(v, len), vis = DruidSlashVfxTimeline.GougeVisibleLength(v, size2), c = DruidSlashVfxTimeline.GougeCentreAlong(v, size2, R, len);
                double vc = ((DruidEarthSheetTable.GougeX0[v] + DruidEarthSheetTable.GougeX1[v]) / 2.0 - DruidEarthSheetTable.GougeSheetW / 2.0) / DruidEarthSheetTable.GougeSheetW * size2;
                double start = c + vc - vis / 2, end = c + vc + vis / 2;
                Check(Near(vis, len, 4), "gouge: visible length = " + "length +-4, variant " + v + " R " + R);
                Check(Near(start, R, 4) && Near(end, DruidSlashVfxTimeline.Reach(R, pr), 4), "gouge: runs from the body edge to the judged boundary +-4, variant " + v + " R " + R);
            }
        Check(DruidSlashVfxTimeline.GougeSize(0, 316) > 316 && DruidSlashVfxTimeline.GougeSize(0, 316) < 316 * 1.2, "gouge: quad width slightly above the visible length");

        // decal budget: hit 3 adds one decal, hits 1 and 2 add none (the view's cap of 8 is shared with the slam cracks)
        int decals = 0; for (int idx = 0; idx < 3; idx++) if (DruidSlashVfxTimeline.HasStrike(idx)) decals++;
        Check(decals == 1, "one gouge decal per combo");

        // determinism
        int s1 = DruidSlamVfxTimeline.Seed(900, 512.2, 88.9);
        Check(Same(DruidSlashVfxTimeline.Debrises(s1), DruidSlashVfxTimeline.Debrises(s1)), "slash: same seed, same debris");
        Check(DruidSlashVfxTimeline.GougeVariant(s1) == DruidSlashVfxTimeline.GougeVariant(s1) && DruidSlashVfxTimeline.RibbonVariant(s1) == DruidSlashVfxTimeline.RibbonVariant(s1), "slash: same seed, same gouge / ribbon variant");
        Check(!DruidSlashVfxTimeline.Debrises(s1).Select(x => x.Angle).SequenceEqual(DruidSlashVfxTimeline.Debrises(s1 + 1).Select(x => x.Angle)), "slash: different seed, different debris");
    }
}
