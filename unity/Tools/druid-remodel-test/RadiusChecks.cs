// 11-04 (CTO option a, boss board 8.5.5): "rendered feet = Core collision" at the designed screen size. Pure Core simulation, no Unity.
//  data      - LifeRadiusPx 91 / 77 / 39 reaches the real fight (e.Radius per life), hero multiples from the measured footprints (PREP 10.1) are 2.8 / 2.37 / 1.98
//  shift     - the centre-based distances move out by (radius - design radius); the reach beyond the body edge (slam, stand-off, heartbeat ring) is the old one
//  edge      - edge-based tests (slash, charge, grab contact, erupt) follow the radius and stay edge-based (reach beyond the edge unchanged)
//  hit       - the player's own attack from the body edge (radius + player radius + 4 px) lands in P1, P2 and P3
//  no-trap   - a player on the boss centre / inside the body is pushed out to radius + player radius and stays out; not while rolling / dashing or held
//  burrow    - the burrow arrival point next to a pillar fits the arena (pillar surface + body, wall) for every life
//  legacy    - the web set and every set without LifeRadius keep Round(OrigR x BodyScale) and shift 0
using System;
using System.Collections.Generic;
using System.Linq;
using Exoduser.UnityPort.Core;

static partial class P
{
    // measured by import-oldman.py (PREP 10.1): footprint radius and height of the models in metres, hero idle height 1.12 world units
    static double P3Shift { get { return DruidRemodelData.LifeRadiusPx[2] - DruidRemodelData.LifeRadiusBasis[2]; } }
    const double HuskFootM = 1.3987, ManFootM = 0.4762, HuskTopM = 4.8295, ManHornM = 2.71, HeroWorld = 1.12;
    static double HeroMultiple(int life)
    {
        double world = DruidRemodelData.LifeRadiusPx[life] / 100.0;
        return life == 2 ? world / ManFootM * ManHornM / HeroWorld : world / HuskFootM * HuskTopM / HeroWorld;
    }

    static void SetLifeBody(Simulation s, EnemyState e, DruidData d, int life)
    {
        e.Radius = (float)DruidRemodelData.LifeRadiusPx[life]; d.R = e.Radius; d.BossPhase = life; e.BossPhase = life;
    }

    static void RadiusChecks()
    {
        var set = DruidRemodelData.Set; double[] px = DruidRemodelData.LifeRadiusPx, basis = DruidRemodelData.LifeRadiusBasis;
        // ---- data -------------------------------------------------------------------------------------------------------------------------------------------------
        Check(px.Length == 3 && px[0] == 91 && px[1] == 77 && px[2] == 39, "radius: LifeRadiusPx 91 / 77 / 39");
        Check(set.LifeRadius != null && set.LifeRadius.SequenceEqual(px) && set.LifeRadiusBasis.SequenceEqual(basis) && set.BodySeparation && set.Validate() == null, "radius: the druid set carries LifeRadius, basis, body separation and validates");
        for (int i = 0; i < 3; i++) Check(basis[i] == Math.Max(10, Math.Round(44 * DruidRemodelData.BodyScale[i])), "radius: basis " + i + " = Round(44 x BodyScale) " + basis[i]);
        Check(Math.Abs(HeroMultiple(0) - 2.8) <= .05 && Math.Abs(HeroMultiple(1) - 0.85 * 2.8) <= .05 && Math.Abs(HeroMultiple(2) - 2.0) <= .05, "radius: hero multiples " + HeroMultiple(0).ToString("0.000") + " / " + HeroMultiple(1).ToString("0.000") + " / " + HeroMultiple(2).ToString("0.000") + " vs 2.8 / 2.38 / 2.0");
        double[] shift = { 47, 40, 8 };
        for (int i = 0; i < 3; i++)
        {
            Check(set.ReachShift(i, px[i]) == shift[i] && set.RadiusFor(i, 44) == px[i], "radius: life " + (i + 1) + " shift " + shift[i] + " / RadiusFor " + px[i]);
            Check(260 + shift[i] - px[i] == 260 - basis[i] && 220 + shift[i] - px[i] == 220 - basis[i], "radius: life " + (i + 1) + " slam / stand-off reach beyond the edge is the old one (" + (260 - basis[i]) + " / " + (220 - basis[i]) + ")");
        }
        // legacy: a set without LifeRadius keeps the old rule and no shift
        var legacy = new BossRemodelSet { Id = "legacy", Lives = 3, BodyScale = new[] { 1.0, 0.85, 0.7 }, LifeHpFraction = new[] { 1.0, .6, .4 }, ShieldFraction = new[] { 0, .15, .15 } };
        Check(legacy.RadiusFor(0, 44) == 44 && legacy.RadiusFor(1, 44) == 37 && legacy.RadiusFor(2, 44) == 31 && legacy.ReachShift(2, 31) == 0 && legacy.RadiusFor(0, 4) == 10, "radius: legacy rule Round(OrigR x BodyScale) and no shift");

        // ---- the real fight: the radius of each life ----------------------------------------------------------------------------------------------------------
        for (int life = 0; life < 3; life++)
        {
            EnemyState boss; var s = ArenaSim(20261104u + (uint)life, true, out boss);
            if (boss == null) { Check(false, "radius: fight started"); continue; }
            ToLife(s, boss, life);
            var st = s.DruidLife(boss); DruidData d = s.Druid.Data[boss];
            Check(st != null && st.Life == life && !st.Collapsing, "radius: reached life " + (life + 1));
            Check(boss.Radius == px[life], "radius: real fight life " + (life + 1) + " e.Radius " + boss.Radius);
            s.Tick(0, 0, boss.X, boss.Y, false, false);
            Check(d.R == px[life], "radius: real fight life " + (life + 1) + " DruidData.R " + d.R);
            EdgeHit(life);
            SeparationChecks(life);
        }
        BurrowClearance();
        ReachByLife();
    }

    // kill the lives below `life` through the real RemodelZeroHp path and run the 120-tick kneel
    static void ToLife(Simulation s, EnemyState boss, int life)
    {
        int guard = 0;
        while (guard++ < 3000)
        {
            var st = s.DruidLife(boss); if (st == null || (st.Life >= life && !st.Collapsing)) return;
            s.Player.Hp = s.Player.MaxHp; s.Player.Iframes = 600;
            if (!st.Collapsing) s.HurtEnemy(boss, boss.Hp + (int)boss.Shield + 5);
            s.Tick(0, 0, boss.X, boss.Y, false, false);
        }
    }

    // the player's own attack from the body edge lands (pure Core: Tick with attack=true, aimed at the boss centre)
    static void EdgeHit(int life)
    {
        EnemyState boss; var s = ArenaSim(20261110u + (uint)life, true, out boss); if (boss == null) return;
        ToLife(s, boss, life);
        for (int i = 0; i < 30; i++) { s.Player.Iframes = 600; s.Tick(0, 0, boss.X, boss.Y, false, false); }   // the stand-up of the new life
        var p = s.Player; DruidData d = s.Druid.Data[boss];
        boss.ReviveIframes = 0; boss.Stunned = 0;
        double gap = 4, dist = boss.Radius + p.Radius + gap, ang = Math.Atan2(boss.Y - 800, boss.X - 800) + 0.9;   // a side that is inside the arena
        float x0 = (float)(boss.X + Math.Cos(ang) * dist), y0 = (float)(boss.Y + Math.Sin(ang) * dist);
        Check(s.CanMove(x0, y0, p.Radius), "edge hit: life " + (life + 1) + " stand point is free");
        double before = boss.Hp + boss.Shield; int hits = 0;
        for (int t = 0; t < 120; t++)
        {
            p.Hp = p.MaxHp; p.Iframes = 600; p.X = x0; p.Y = y0;   // Iframes keep the separation and the boss attacks out of this probe; the geometry is what is tested
            double hp0 = boss.Hp + boss.Shield;
            s.Tick(0, 0, boss.X, boss.Y, true, false);
            boss.ReviveIframes = 0;
            if (boss.Hp + boss.Shield < hp0) hits++;
        }
        Check(hits >= 1 && boss.Hp + boss.Shield < before, "edge hit: life " + (life + 1) + " the attack from radius + player + " + gap + " px (" + dist.ToString("0.0") + ") hits the body (" + hits + " hits)");
        // the same attack from beyond the weapon reach does not
        double far = boss.Radius + 50 + 30; before = boss.Hp + boss.Shield; int farHits = 0;
        float fx = (float)(boss.X + Math.Cos(ang) * far), fy = (float)(boss.Y + Math.Sin(ang) * far);
        if (s.CanMove(fx, fy, p.Radius))
        {
            for (int t = 0; t < 60; t++) { p.Hp = p.MaxHp; p.Iframes = 600; p.X = fx; p.Y = fy; double hp0 = boss.Hp + boss.Shield; s.Tick(0, 0, boss.X, boss.Y, true, false); boss.ReviveIframes = 0; if (boss.Hp + boss.Shield < hp0) farHits++; }
            Check(farHits == 0, "edge hit: life " + (life + 1) + " control: from " + far.ToString("0.0") + " (30 px beyond the weapon reach) nothing lands (" + farHits + ")");
        }
    }

    // a player on the boss centre or anywhere inside the body ends up at radius + player radius and stays there
    static void SeparationChecks(int life)
    {
        EnemyState boss; var s = ArenaSim(20261120u + (uint)life, true, out boss); if (boss == null) return;
        ToLife(s, boss, life);
        for (int i = 0; i < 30; i++) { s.Player.Iframes = 600; s.Tick(0, 0, boss.X, boss.Y, false, false); }
        var p = s.Player; DruidData d = s.Druid.Data[boss]; string tag = "no-trap: life " + (life + 1);
        double need = boss.Radius + p.Radius;
        double[][] starts = { new[] { 0.0, 0.0 }, new[] { 30.0, 0.0 }, new[] { 0.0, -30.0 }, new[] { need * .5, need * .5 }, new[] { -(need - 1), 0.0 } };
        foreach (var o in starts)
        {
            p.X = (float)(boss.X + o[0]); p.Y = (float)(boss.Y + o[1]); p.Iframes = 0; p.Hp = p.MaxHp; d.BossPatT = 100000; d.HeartCd = 100000;   // no new move starts: the separation alone is measured
            if (d.S != "idle") { d.S = "idle"; boss.State = "idle"; d.St2 = 0; }
            int ticks = 0; double dd = 0;
            for (; ticks < 40; ticks++)
            {
                p.Hp = p.MaxHp; if (d.S != "idle") { d.S = "idle"; d.St2 = 0; } d.BossPatT = 100000;
                s.Tick(0, 0, boss.X, boss.Y, false, false);
                dd = Dist(p.X, p.Y, boss.X, boss.Y); if (dd >= need) break;
            }
            Check(dd >= need - 1e-3 && ticks <= Math.Ceiling(need / Simulation.BodyPushMax) + 2, tag + " from offset (" + o[0].ToString("0") + "," + o[1].ToString("0") + ") out in " + ticks + " ticks, distance " + dd.ToString("0.00") + " >= " + need);
            // and it stays out while the boss stands (no walk into the player: the stand-off is outside the body)
            double min = 1e9; for (int t = 0; t < 120; t++) { p.Hp = p.MaxHp; s.Tick(0, 0, boss.X, boss.Y, false, false); min = Math.Min(min, Dist(p.X, p.Y, boss.X, boss.Y)); }
            Check(min >= need - 1e-3, tag + " stays outside the body for 120 ticks (min " + min.ToString("0.00") + ")");
        }
        // a dash / roll passes through and the grab hold is exempt; the push resumes when they end
        p.X = boss.X; p.Y = boss.Y; p.Iframes = 0; s.DashActive = true; p.Hp = p.MaxHp; d.BossPatT = 100000; d.HeartCd = 100000;
        s.Tick(0, 0, boss.X, boss.Y, false, false);
        Check(Dist(p.X, p.Y, boss.X, boss.Y) < need, tag + " dash: not pushed while dashing"); s.DashActive = false;
        for (int t = 0; t < 60; t++) { p.Hp = p.MaxHp; d.BossPatT = 100000; d.HeartCd = 100000; s.Tick(0, 0, boss.X, boss.Y, false, false); }
        Check(Dist(p.X, p.Y, boss.X, boss.Y) >= need - 1e-3, tag + " pushed out once the dash ends");
        p.Iframes = 0; d.S = "bossGrab"; boss.State = "bossGrab"; d.St2 = 100; d.GrabAng = 0; p.X = boss.X + 25; p.Y = boss.Y;
        s.Druid.TickBoss(boss);
        Check(Dist(p.X, p.Y, boss.X, boss.Y) < need, tag + " held by the grab: not pushed");
    }

    // burrow: he comes up on the side of the nearest pillar that faces the marker, pillar radius + body + 24 away. The body must fit between the pillar and the wall at every angle.
    static void BurrowClearance()
    {
        EnemyState boss; var s = ArenaSim(20261130u, true, out boss); if (boss == null) return;
        foreach (var q in s.DruidPillars)
            for (int life = 0; life < 3; life++)
            {
                double r = DruidRemodelData.LifeRadiusPx[life], off = q.R + r + 24; int bad = 0, blocked = 0;
                for (int a = 0; a < 360; a += 5)
                {
                    double x = q.X + Math.Cos(a * Math.PI / 180) * off, y = q.Y + Math.Sin(a * Math.PI / 180) * off;
                    if (!s.CanMove((float)x, (float)y, (float)r)) bad++;
                    foreach (var o in s.DruidPillars) if (o != q && Dist(x, y, o.X, o.Y) < o.R + r) blocked++;
                }
                Check(bad == 0 && blocked == 0, "burrow: pillar (" + q.X.ToString("0") + "," + q.Y.ToString("0") + ") life " + (life + 1) + " body " + r + " fits at every angle (blocked " + bad + "/" + blocked + ")");
            }
        // and the boss itself fits between the pillars and the walls where it walks: the open north-south axis is wider than the body
        double cx, cy, ar; s.DruidArena(out cx, out cy, out ar);
        Check(s.DruidPillars.All(q => Math.Abs(q.X - cx) - q.R > 2 * DruidRemodelData.LifeRadiusPx[0]), "burrow: the north-south corridor between the pillars (" + (s.DruidPillars.Min(q => Math.Abs(q.X - cx) - q.R)).ToString("0") + " px each side) is wider than the P1 body diameter");
    }

    // distances by life through the real executors (TickBoss), with the body set to the life's radius
    static void ReachByLife()
    {
        var s = ReachFight(); var e = s.Stage.Boss; var d = s.Druid.Data[e]; var list = new List<DruidTelegraph>();
        double[] shift = { 47, 40, 8 };
        for (int life = 0; life < 3; life++)
        {
            string tag = "reach: life " + (life + 1) + " ";
            // slam: centre-based, 260 + shift = edge reach 216 / 223 / 229 beyond the body
            double slam = 260 + shift[life];
            foreach (bool inside in new[] { true, false })
            {
                PlaceMove(s, "bossSlam", 1, "slam"); SetLifeBody(s, e, d, life); s.Player.X = e.X + (float)(slam + (inside ? -1 : 1)); s.Player.Y = e.Y; float hp = s.Player.Hp;
                s.Druid.TickBoss(e); Check((s.Player.Hp < hp) == inside, tag + "slam boundary " + slam + (inside ? " inside" : " outside"));
            }
            PlaceMove(s, "bossSlamWind", 52, "slam"); SetLifeBody(s, e, d, life); d.RmTeleTotal = 52; s.DruidTelegraphs(list);
            Check(list.Count(t => t.MoveId == "slam" && Math.Abs(t.Radius - slam) < 1e-9) == 2, tag + "slam telegraph radius " + slam);
            if (life == 2)
            {   // the P3 poison pool takes the slam radius
                PlaceMove(s, "bossSlam", 1, "slam"); SetLifeBody(s, e, d, 2); s.Player.X = e.X + 600; s.Player.Y = e.Y; s.Druid.PoisonPools.Clear(); s.Druid.TickBoss(e);
                Check(s.Druid.PoisonPools.Count == 1 && Math.Abs(s.Druid.PoisonPools[0].R - slam) < 1e-9, tag + "poison pool radius " + slam);
            }
            // slash and charge: edge based (reach beyond the body edge unchanged)
            foreach (bool inside in new[] { true, false })
            {
                PlaceMove(s, "bossSlash", 9, "slashCombo"); SetLifeBody(s, e, d, life); s.Player.X = e.X + 2.5f + e.Radius + s.Player.Radius + (inside ? 299 : 301); s.Player.Y = e.Y; float hp = s.Player.Hp;
                s.Druid.TickBoss(e); Check((s.Player.Hp < hp) == inside, tag + "slash reach 300 beyond the edge" + (inside ? " inside" : " outside"));
            }
            // heartbeat ring: 260 + shift around the centre (P3 only is fought, the telegraph carries it for the life)
            PlaceMove(s, "bossHeartWind", 90, "heartbeat"); SetLifeBody(s, e, d, life); d.RmTeleTotal = 90; s.DruidTelegraphs(list);
            Check(list.Where(t => t.MoveId == "heartbeat").All(t => t.Safe != null && Math.Abs(t.Safe[0][2] - (260 + shift[life])) < 1e-9) && list.Any(t => t.MoveId == "heartbeat"), tag + "heartbeat safe ring " + (260 + shift[life]));
            // the stand-off: he walks while the player is farther than 220 + shift from the centre, stands inside it
            foreach (bool far in new[] { true, false })
            {
                PlaceMove(s, "idle", 0, "slashCombo"); SetLifeBody(s, e, d, life); d.S = "idle"; e.State = "idle"; d.Alerted = true; d.BossPatT = 100000; d.RmVel = 0; d.HeartCd = 100000; d.Facing = 0; e.Facing = 0; d.MoveCDs[0] = d.MoveCDs[1] = 100000;
                s.Player.X = e.X + (float)(220 + shift[life] + (far ? 30 : -30)); s.Player.Y = e.Y; s.Player.Iframes = 600;
                for (int t = 0; t < 40; t++) s.Druid.TickBoss(e);
                bool moved = Math.Abs(d.X - 2560) > .5;
                Check(moved == far, tag + "stand-off " + (220 + shift[life]) + " from the centre: " + (far ? "walks when 30 px farther" : "stands when 30 px nearer"));
            }
        }
    }
}
