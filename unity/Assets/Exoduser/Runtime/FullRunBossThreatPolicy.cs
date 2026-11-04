using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Used only by opt-in fullrun QA; never writes to the simulation.
    internal static class FullRunBossThreatPolicy
    {
        internal struct Decision { public bool threat, escape, roll; public double x, y; public string move, source; }
        internal static Decision Decide(double x, double y, double radius, DruidData data, bool remodel,
            List<DruidTelegraph> warnings, Func<float, float, float, bool> canMove)
        {
            var result = new Decision { x = x, y = y, source = "none", move = "" };
            var threats = new List<DruidTelegraph>();
            if (warnings != null) foreach (var warning in warnings)
                if (warning.Kind != DruidTeleKind.None && (warning.Live || warning.Remaining > 0)) threats.Add(warning);
            if (threats.Count == 0 && data != null)
            {
                string state = data.S ?? "";
                // Legacy fights expose no remodel telegraphs. Read their existing wind/active
                // states instead of treating an empty remodel list as proof of missing pixels.
                bool charge = state.IndexOf("Charge", StringComparison.Ordinal) >= 0 || state.IndexOf("MultiDash", StringComparison.Ordinal) >= 0;
                bool melee = charge || state.IndexOf("Spin", StringComparison.Ordinal) >= 0 || state.IndexOf("Slam", StringComparison.Ordinal) >= 0
                    || state.IndexOf("Slash", StringComparison.Ordinal) >= 0 || state.IndexOf("Grab", StringComparison.Ordinal) >= 0 || state.IndexOf("Sweep", StringComparison.Ordinal) >= 0;
                if ((!remodel && melee && state.StartsWith("boss", StringComparison.Ordinal)) || remodel && (state == "bossCharge" || state == "bossGrabLunge"))
                {
                    var warning = new DruidTelegraph { MoveId = data.CurMove, Kind = DruidTeleKind.GroundDecal,
                        X = data.X, Y = data.Y, Dir = data.Facing, Remaining = data.St2, Total = data.St2,
                        Live = !state.EndsWith("Wind", StringComparison.Ordinal), Shape = charge ? DruidTeleShape.Line : DruidTeleShape.Circle,
                        Length = 1000, Width = 2 * (data.R + 100), Radius = state.IndexOf("Slam", StringComparison.Ordinal) >= 0 ? 1200
                            : state.IndexOf("Spin", StringComparison.Ordinal) >= 0 ? 500 : Math.Max(data.TelegraphR, data.R + 360) };
                    threats.Add(warning);
                    result.source = remodel ? "core-state-active" : "legacy-state";
                }
            }
            foreach (var warning in threats) if (Danger(warning, x, y, radius))
            {
                result.threat = true; result.move = warning.MoveId;
                result.roll |= warning.Live || warning.Remaining <= 12;
                if (result.source == "none") result.source = "core-telegraph";
            }
            if (!result.threat) return result;
            double best = double.PositiveInfinity, goalX = x, goalY = y;
            Action<double, double> consider = (tx, ty) =>
            {
                if (canMove != null && !canMove((float)tx, (float)ty, (float)radius)) return;
                foreach (var warning in threats) if (Danger(warning, tx, ty, radius)) return;
                double distance = (tx - x) * (tx - x) + (ty - y) * (ty - y);
                if (distance < best) { best = distance; goalX = tx; goalY = ty; }
            };
            foreach (var warning in threats) if (warning.Shape == DruidTeleShape.ArenaMinusSafe && warning.Safe != null)
                foreach (var safe in warning.Safe) if (safe != null && safe.Length >= 3)
                {
                    double dx = x - safe[0], dy = y - safe[1], distance = Math.Sqrt(dx * dx + dy * dy);
                    double scale = distance > 0 ? Math.Max(0, safe[2] - radius * 2) * .85 / distance : 0;
                    consider(safe[0] + dx * scale, safe[1] + dy * scale);
                    consider(safe[0], safe[1]);
                }
            foreach (double distance in new double[] { 90, 180, 360, 600, 960, 1440 })
                for (int direction = 0; direction < 16; direction++)
                { double angle = direction * Math.PI / 8; consider(x + Math.Cos(angle) * distance, y + Math.Sin(angle) * distance); }
            result.escape = !double.IsPositiveInfinity(best); result.x = goalX; result.y = goalY;
            return result;
        }
        static bool Danger(DruidTelegraph t, double x, double y, double radius)
        {
            double dx = x - t.X, dy = y - t.Y, distance = Math.Sqrt(dx * dx + dy * dy);
            switch (t.Shape)
            {
                case DruidTeleShape.Circle: return distance < t.Radius + radius;
                case DruidTeleShape.Cone: return distance < t.Radius + radius && Angle(Math.Atan2(dy, dx) - t.Dir) < t.Angle / 2 + .1;
                case DruidTeleShape.Line: case DruidTeleShape.Trail:
                    double forward = dx * Math.Cos(t.Dir) + dy * Math.Sin(t.Dir), side = -dx * Math.Sin(t.Dir) + dy * Math.Cos(t.Dir);
                    if (t.Live && t.MoveId == "groundFissure") return Math.Abs(forward - t.Progress) <= radius + DruidRemodelData.FissureSpeed && Math.Abs(side) < t.Width / 2 + radius;
                    return forward > -radius && forward < t.Length + radius && Math.Abs(side) < t.Width / 2 + radius;
                case DruidTeleShape.RingGap:
                    return distance > Math.Max(0, t.Inner - radius) && distance < t.Radius + t.Width / 2 + radius
                        && Angle(Math.Atan2(dy, dx) - t.GapDir) > Math.Max(0, t.GapAngle / 2 - .1);
                case DruidTeleShape.ArenaMinusSafe:
                    return !HeartbeatSafe(t, x, y, Math.Max(1, radius + 1));
                default: // GrabEyes has no judgement shape; this is a conservative QA-only escape envelope.
                    return t.Kind == DruidTeleKind.GrabEyes && distance < t.Radius + radius && Angle(Math.Atan2(dy, dx) - t.Dir) < Math.PI / 3;
            }
        }
        static bool HeartbeatSafe(DruidTelegraph t, double x, double y, double margin)
        {
            // Core DruidBoss.Remodel.cs:95 damages at distance > HeartbeatSafeOf(d):
            // Safe[0] (boss centre) is CLOSED. Extra InSafeZone circles use < (:87).
            // The bot keeps that comparison, shrinking the safe radius by its body + 1px.
            if (t.Safe != null) for (int i = 0; i < t.Safe.Length; i++)
            {
                var safe = t.Safe[i]; if (safe == null || safe.Length < 3 || safe[2] < margin) continue;
                double d = Square(x - safe[0]) + Square(y - safe[1]), r = Square(safe[2] - margin);
                if (i == 0 ? d <= r : d < r) return true;
            }
            // Core DruidBoss.Pillars.cs:81: segment crosses the pillar disc AND
            // the player is farther than its radius. Shrink/expand those tests for margin.
            if (t.Shadows != null) foreach (var shadow in t.Shadows)
            {
                if (shadow == null || shadow.Length < 3 || shadow[2] <= margin) continue;
                double sx = x - t.SrcX, sy = y - t.SrcY, length = sx * sx + sy * sy;
                if (length < 1e-9) continue;
                double u = ((shadow[0] - t.SrcX) * sx + (shadow[1] - t.SrcY) * sy) / length;
                if (u > 0 && u < 1 && Square(t.SrcX + sx * u - shadow[0]) + Square(t.SrcY + sy * u - shadow[1]) < Square(shadow[2] - margin)
                    && Square(x - shadow[0]) + Square(y - shadow[1]) > Square(shadow[2] + margin)) return true;
            }
            return false;
        }
        static double Square(double value) { return value * value; }
        static double Angle(double value) { return Math.Abs(Math.Atan2(Math.Sin(value), Math.Cos(value))); }
    }
}
