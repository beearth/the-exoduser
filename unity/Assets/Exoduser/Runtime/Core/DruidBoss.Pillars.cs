using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public sealed class RootPillar { public double X, Y, R; }

    // RM-B1 RB1-3 (spec §5): the root pillars of the 1-1 boss arena. They rise when the fight starts, never break, and (remodel only)
    //   - are solid for everybody (Simulation.Pass: player, the boss, his minions),
    //   - stop enemy bullets and cut the thorn-root fissure short,
    //   - cast "shadows" that are safe from the forest heartbeat (behind the pillar as seen from the boss),
    //   - are the only places the underground strike (burrow) comes up: the exit point is on the side of the nearest pillar that faces the player.
    // Placement: BossRemodelSet.PillarCount pillars on a ring of PillarRingFraction (0.55) x the arena radius, first one at PillarStartDeg. The arena radius is the web's
    // circle: min(width, height) / 2 - 3 tiles (genBossArena: radius 51 of a 128 x 108 tile map = 2040 px, ring 1122 px). The entry (south) and the exit (north) stay open.
    public sealed partial class DruidBoss
    {
        public readonly List<RootPillar> Pillars = new List<RootPillar>();
        bool pillarsBuilt;

        public double ArenaCx { get { return host.ArenaW / 2; } }
        public double ArenaCy { get { return host.ArenaH / 2; } }
        public double ArenaRadius { get { return Math.Min(host.ArenaW, host.ArenaH) / 2 - 3 * T; } }

        void ResetPillars() { Pillars.Clear(); pillarsBuilt = false; }

        void EnsurePillars()
        {
            if (pillarsBuilt || !Remodel) return;
            pillarsBuilt = true;
            int n = Set.PillarCount; if (n <= 0) return;
            double ring = ArenaRadius * Set.PillarRingFraction;
            for (int k = 0; k < n; k++)
            {
                double a = (Set.PillarStartDeg + 360.0 * k / n) * Math.PI / 180;
                Pillars.Add(new RootPillar { X = ArenaCx + Cos(a) * ring, Y = ArenaCy + Sin(a) * ring, R = Set.PillarRadius });
            }
        }

        // a body of radius r at (x, y) touches a pillar
        public bool PillarBlocks(double x, double y, double r)
        {
            if (!Remodel || Pillars.Count == 0) return false;
            for (int i = 0; i < Pillars.Count; i++) { var p = Pillars[i]; double dx = x - p.X, dy = y - p.Y, rr = p.R + r; if (dx * dx + dy * dy < rr * rr) return true; }
            return false;
        }

        // distance along the ray (x0, y0) + t (dx, dy) (|d| = 1) to the first pillar surface, or maxLen when nothing is in the way
        public double PillarRayDistance(double x0, double y0, double dx, double dy, double maxLen)
        {
            double best = maxLen;
            for (int i = 0; i < Pillars.Count; i++)
            {
                var p = Pillars[i]; double fx = p.X - x0, fy = p.Y - y0, t = fx * dx + fy * dy;           // closest approach along the ray
                if (t <= 0 && fx * fx + fy * fy > p.R * p.R) continue;
                double px = x0 + dx * t - p.X, py = y0 + dy * t - p.Y, d2 = px * px + py * py;
                if (d2 >= p.R * p.R) continue;
                double hit = t - Math.Sqrt(p.R * p.R - d2);
                if (hit < 0) hit = 0;
                if (hit < best) best = hit;
            }
            return best;
        }

        // how far a thorn-root fissure from (x, y) along `ang` can run: the arena size, the pillars and the arena wall (20 px steps), never more than head speed x lifetime
        public double RmFissureReach(double x, double y, double ang, double maxLen)
        {
            double dx = Cos(ang), dy = Sin(ang), reach = PillarRayDistance(x, y, dx, dy, maxLen);
            for (double t = 20; t <= reach - 10; t += 20) if (!host.CanMove(x + dx * t, y + dy * t, 10)) { reach = Math.Max(0, t - 20); break; }
            return reach;
        }

        // heartbeat: the player is behind a pillar as seen from the boss (the segment boss -> player crosses the pillar disc and the player is farther than the pillar)
        public bool InPillarShadow(double px, double py, double bx, double by)
        {
            for (int i = 0; i < Pillars.Count; i++)
            {
                var p = Pillars[i];
                double sx = px - bx, sy = py - by, l2 = sx * sx + sy * sy; if (l2 < 1e-9) continue;
                double t = ((p.X - bx) * sx + (p.Y - by) * sy) / l2; if (t <= 0 || t >= 1) continue;
                double cx = bx + sx * t - p.X, cy = by + sy * t - p.Y;
                if (cx * cx + cy * cy < p.R * p.R && Dst(px, py, p.X, p.Y) > p.R) return true;
            }
            return false;
        }

        // burrow: where the strike comes up for a marker at (mx, my): the side of the nearest pillar that faces the marker (just outside the pillar, clear of the boss body). No pillars = the marker.
        void BurrowTarget(DruidData d, double mx, double my, out double tx, out double ty)
        {
            tx = mx; ty = my;
            if (!Remodel || Pillars.Count == 0) return;
            RootPillar best = null; double bd = double.MaxValue;
            foreach (var p in Pillars) { double dd = Dst(mx, my, p.X, p.Y); if (dd < bd) { bd = dd; best = p; } }
            double a = Atan2(my - best.Y, mx - best.X), off = best.R + d.R + 24;
            tx = best.X + Cos(a) * off; ty = best.Y + Sin(a) * off;
        }
    }
}
