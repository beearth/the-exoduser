// RB1-3 / RB1-4 (spec §5, boss-battle lead 2026-10-28): the root pillars of the remodelled arena and the popup rule. Real Simulation + StageFlow arena, scripted injections.
//  geometry  - 4 pillars on a ring of 0.55 x the arena radius (2040 px -> 1122 px), 90 deg apart, radius 80, arena centre (2560, 2160)
//  solid     - the player cannot walk into a pillar
//  bullets   - an enemy bullet dies at the pillar surface
//  fissure   - the head stops at the pillar; the reach the telegraph shows is the same number
//  burrow    - the telegraph circle of the underground strike sits on the side of a pillar (checked in MotionChecks)
//  heartbeat - a player in the shadow of a pillar takes no damage (probe in MotionChecks)
//  popups    - the remodel raises no floating text except the PopupKeep entries (no move names, labels, callouts, glyphs); the web-port druid does (so the watcher works)
using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core;

static partial class P
{
    static int popupTexts, popupGlyphTexts;

    static bool HasGlyphText(string s)
    {
        foreach (char c in s) { int u = c; if ((u >= 0x2190 && u <= 0x2BFF) || char.IsSurrogate(c) || u == 0x200D || (u >= 0xFE00 && u <= 0xFE0F)) return true; }
        return false;
    }
    static Simulation ArenaSim(uint seed, bool remodel, out EnemyState boss)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        s.DruidRemodel = remodel; s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp;
        s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        var p = s.Player; int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
        boss = s.Stage.Boss;
        if (boss != null) for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }
        return s;
    }

    static void PillarChecks()
    {
        EnemyState boss;
        var s = ArenaSim(20261040u, true, out boss);
        Check(boss != null, "pillars: remodel fight started"); if (boss == null) return;
        var pl = s.DruidPillars; double cx, cy, ar; s.DruidArena(out cx, out cy, out ar);
        Check(Math.Abs(cx - 2560) < 1e-9 && Math.Abs(cy - 2160) < 1e-9 && Math.Abs(ar - 2040) < 1e-9, "pillars: arena centre / radius " + cx + "," + cy + " / " + ar);
        Check(pl.Count == 4, "pillars: count " + pl.Count); if (pl.Count != 4) return;
        for (int i = 0; i < 4; i++)
        {
            double dist = Math.Sqrt((pl[i].X - cx) * (pl[i].X - cx) + (pl[i].Y - cy) * (pl[i].Y - cy)), ang = Math.Atan2(pl[i].Y - cy, pl[i].X - cx) * 180 / Math.PI;
            Check(Math.Abs(dist - 0.55 * ar) < 1e-6 && pl[i].R == 80, "pillars: #" + i + " ring " + dist.ToString("0.000") + " radius " + pl[i].R);
            Check(Math.Abs(Math.IEEERemainder(ang - 45 - 90 * i, 360)) < 1e-6, "pillars: #" + i + " angle " + ang.ToString("0.000"));
        }
        // the entry (south) and the exit (north) stay open: no pillar on the axis x = centre
        Check(pl.All(q => Math.Abs(q.X - cx) > 500), "pillars: the north-south axis is open");

        var p = s.Player; var q0 = pl[0];
        // the player walks into a pillar and stops at its surface
        double toward = Math.Atan2(boss.Y - q0.Y, boss.X - q0.X);   // from the pillar towards the arena centre
        p.X = (float)(q0.X + Math.Cos(toward) * 200); p.Y = (float)(q0.Y + Math.Sin(toward) * 200);
        double minD = 1e9;
        for (int i = 0; i < 90; i++)
        {
            double dx = q0.X - p.X, dy = q0.Y - p.Y, l = Math.Sqrt(dx * dx + dy * dy);
            s.Tick((float)(dx / l), (float)(dy / l), (float)q0.X, (float)q0.Y, false, false); p.Hp = p.MaxHp; p.Iframes = 600;
            minD = Math.Min(minD, Math.Sqrt((q0.X - p.X) * (q0.X - p.X) + (q0.Y - p.Y) * (q0.Y - p.Y)));
        }
        Check(minD >= q0.R + p.Radius - 1.0, "pillars: the player walked to " + minD.ToString("0.0") + " px of a pillar centre (surface " + (q0.R + p.Radius) + ")");
        Check(minD < q0.R + p.Radius + 40, "pillars: the player did reach the pillar (" + minD.ToString("0.0") + ")");

        // an enemy bullet dies at the surface
        var d = s.Druid.Data[boss];
        double bx = q0.X + Math.Cos(toward) * 400, by = q0.Y + Math.Sin(toward) * 400, ba = Math.Atan2(q0.Y - by, q0.X - bx);
        p.X = (float)(q0.X - Math.Cos(toward) * 400); p.Y = (float)(q0.Y - Math.Sin(toward) * 400);   // the player stands on the far side so nothing else is in the way
        var bul = s.Druid.SpawnProjectile(boss, d, new ProjSpec { X = bx, Y = by, Vx = Math.Cos(ba) * 3, Vy = Math.Sin(ba) * 3, Dmg = 10, Life = 400, Ml = 400, El = 3, Col = "col", Sz = 1.2, Commit = true }, false);
        double nearest = 1e9; int ticks = 0;
        for (; ticks < 300 && bul.Active; ticks++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; p.Iframes = 600; if (bul.Active) nearest = Math.Min(nearest, Math.Sqrt((bul.X - q0.X) * (bul.X - q0.X) + (bul.Y - q0.Y) * (bul.Y - q0.Y))); }
        Check(!bul.Active && ticks < 300, "pillars: the bullet was stopped (" + ticks + " ticks)");
        Check(nearest >= q0.R - 1, "pillars: the bullet never got inside the pillar (" + nearest.ToString("0.0") + ")");

        // the fissure head stops at the pillar and the telegraph reach is the same number
        double fx = q0.X - Math.Cos(toward) * 600, fy = q0.Y - Math.Sin(toward) * 600;   // the fissure starts 600 px before the pillar, on the line through the arena centre
        double fa2 = Math.Atan2(q0.Y - fy, q0.X - fx);
        double reach = s.Druid.RmFissureReach(fx, fy, fa2, 3000);
        Check(Math.Abs(reach - (600 - q0.R)) < 1e-6, "pillars: fissure reach " + reach.ToString("0.000") + " vs " + (600 - q0.R));
        var f = new Fissure { X = fx, Y = fy, Ang = fa2, Spd = 14, Len = 0, MaxLen = 3000, T = 0, MaxT = 140, W = 140, Dmg = 1, Straight = true, Serial = 9999 };
        s.Druid.Fissures.Add(f);
        for (int i = 0; i < 60 && !f.Done; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; p.Iframes = 600; }
        Check(f.Done && Math.Abs(f.Len - (600 - q0.R)) < 1e-6 && !f.Exploded, "pillars: the fissure head stopped at " + f.Len.ToString("0.000") + " (done " + f.Done + ")");

        // popups: the remodel raises no move-name / phase / callout text, only the PopupKeep entries; the web-port druid raises plenty (so the watcher works)
        popupTexts = 0; popupGlyphTexts = 0;
        Func<string, bool> kept = z => DruidRemodelData.PopupKeep.Any(k => z.StartsWith(k, StringComparison.Ordinal)) && !HasGlyphText(z);
        EnemyState wboss; var w = ArenaSim(20261041u, false, out wboss);
        int webGlyph = 0, webOther = 0; w.ReviveTextRaised += t => { if (HasGlyphText(t.Ko)) webGlyph++; else if (!kept(t.Ko)) webOther++; };
        for (int i = 0; i < 1500 && wboss != null && wboss.Alive; i++) { w.Tick(0, 0, wboss.X, wboss.Y, false, false); w.Player.Hp = w.Player.MaxHp; }
        Check(webGlyph > 0 && webOther > 0, "popups: the web-port druid raised glyph texts (" + webGlyph + ") and plain non-kept texts (" + webOther + ") - the watcher works");
        EnemyState rboss; var r = ArenaSim(20261042u, true, out rboss);
        int remText = 0, remBad = 0; var seen = new List<string>(); var kept2 = new List<string>();
        r.ReviveTextRaised += t => { remText++; if (!kept(t.Ko)) { remBad++; seen.Add(t.Ko); } else kept2.Add(t.Ko); };
        for (int i = 0; i < 1500 && rboss != null && rboss.Alive; i++) { r.Tick(0, 0, rboss.X, rboss.Y, false, false); r.Player.Hp = r.Player.MaxHp; }
        Check(remBad == 0, "popups: the remodel raised texts outside PopupKeep: " + string.Join(" | ", seen.Distinct().Take(8)));
        Check(remText == kept2.Count, "popups: every remodel text is a kept one (" + remText + ")");
        motionNotes.Add("popups: web-port druid " + webGlyph + " glyph + " + webOther + " plain non-kept texts in 1500 ticks, remodel " + remBad + " non-kept of " + remText + " texts (kept: " + string.Join(", ", kept2.Distinct()) + ")");
    }
}
