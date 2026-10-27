// RM-B1 read-only telegraph list (Core/DruidTelegraph.cs) checks, driven from the fights of Program.cs: the list must count down like the real state machine,
// every spawn it predicts must follow a last frame of <= 1, and the shapes must equal the numbers of the hazards that really appear.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

static partial class P
{
    static readonly HashSet<int> seenMoves = new HashSet<int>();
    static readonly Dictionary<string, DruidTelegraph> samples = new Dictionary<string, DruidTelegraph>();
    static int teleObservations, teleEvents, fissureHitsTotal;

    sealed class TeleTrack
    {
        public readonly List<DruidTelegraph> Cur = new List<DruidTelegraph>(), Prev = new List<DruidTelegraph>();
        public readonly Dictionary<string, double> PrevRem = new Dictionary<string, double>();
        public int Tide, Mines, Fiss, Beat; public string S = "";
        public readonly Dictionary<Fissure, double[]> Fissures = new Dictionary<Fissure, double[]>();   // fixed direction, length last tick
        public readonly HashSet<Fissure> FissureHit = new HashSet<Fissure>();
    }

    static string TKey(DruidTelegraph t) { return t.Serial + "/" + t.Move + "/" + (int)t.Kind + "/" + t.Index + "/" + (t.Live ? "L" : "W"); }
    static double Dist(double ax, double ay, double bx, double by) { return Math.Sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)); }

    static DruidTelegraph Copy(DruidTelegraph t)
    {
        return new DruidTelegraph { Move = t.Move, MoveId = t.MoveId, Kind = t.Kind, Shape = t.Shape, Serial = t.Serial, Index = t.Index, Live = t.Live, X = t.X, Y = t.Y, Dir = t.Dir, Radius = t.Radius, Angle = t.Angle,
            Length = t.Length, Width = t.Width, Inner = t.Inner, GapDir = t.GapDir, GapAngle = t.GapAngle, Progress = t.Progress, Total = t.Total, Remaining = t.Remaining, TipX = t.TipX, TipY = t.TipY, Safe = t.Safe };
    }

    static void ObserveTelegraphs(string name, Simulation s, EnemyState boss, TeleTrack tr)
    {
        var cur = tr.Cur; var prev = tr.Prev;
        s.DruidTelegraphs(cur); teleObservations++;
        DruidData d = null; if (boss != null) s.Druid.Data.TryGetValue(boss, out d);
        foreach (var t in cur)
        {
            seenMoves.Add(t.Move);
            if (t.Move < 1 || t.Move > 12 || DruidRemodelData.Moves[t.Move - 1].Id != t.MoveId) Check(false, name + ": telegraph move number " + t.Move + " vs id " + t.MoveId);
            string sk = t.Move + "/" + t.Kind + "/" + t.Shape + "/" + t.Index + "/" + (t.Live ? "live" : "warn");
            if (!samples.ContainsKey(sk)) samples[sk] = Copy(t);
            string k = TKey(t); double pr;
            // a running fissure head turns toward the player, so its time to the blast is an estimate that can grow; every other entry counts down
            if (!(t.Live && t.Move == 4) && tr.PrevRem.TryGetValue(k, out pr)) Check(t.Remaining <= pr + 1e-9 && pr - t.Remaining <= 1.5, name + ": telegraph " + k + " Remaining " + pr + " -> " + t.Remaining);
            Check(t.Remaining >= 0 && t.Total >= t.Remaining, name + ": telegraph " + k + " remaining " + t.Remaining + " of " + t.Total);
            if (t.Shape == DruidTeleShape.Circle) Check(t.Radius > 0, name + ": telegraph " + k + " circle radius");
            if (t.Shape == DruidTeleShape.Cone) Check(t.Radius > 0 && t.Angle > 0 && t.Angle < Math.PI * 2, name + ": telegraph " + k + " cone");
            if (t.Shape == DruidTeleShape.RingGap) Check(t.Width > 0 && t.GapAngle > 0 && Math.Abs(t.Inner - Math.Max(0, t.Radius - t.Width / 2)) < 1e-9, name + ": telegraph " + k + " ring");
            if (t.Kind == DruidTeleKind.ParryGlint) Check(t.TipX != 0 || t.TipY != 0, name + ": telegraph " + k + " staff tip");
        }
        if (d != null)
        {   // what the list announced happened: the move's last warning frame was the one before, with Remaining <= 1 (+0.5 tolerance)
            var events = new List<string>();
            if (s.Druid.TideWaves.Count > tr.Tide) events.Add("tideWave");
            if (s.Druid.SeekerMines.Count > tr.Mines) events.Add("seekerMines");
            if (s.Druid.Fissures.Count > tr.Fiss) events.Add("groundFissure");
            if (tr.S == "bossSlam" && d.S != "bossSlam") events.Add("slam");
            if (tr.S != "bossCharge" && d.S == "bossCharge") events.Add(d.RmMoveId == "grab" ? "grab" : "charge");
            if ((d.S == "bossHeartWind" && d.HbBeat > tr.Beat) || (tr.S == "bossHeartWind" && d.S == "bossRec")) events.Add("heartbeat");
            foreach (var ev in events)
            {
                teleEvents++;
                var warned = prev.Where(t => t.MoveId == ev && !t.Live).ToList();
                Check(warned.Count > 0, name + ": " + ev + " fired without a telegraph on the frame before");
                foreach (var w in warned) Check(w.Remaining <= 1.5, name + ": " + ev + " fired with Remaining " + w.Remaining + " on the last telegraph frame");
                if (ev == "tideWave" && s.Druid.TideWaves.Count > 0)
                {   // the gap shown from the first telegraph frame is the gap of the ring that comes
                    var tw = s.Druid.TideWaves[s.Druid.TideWaves.Count - 1]; var ring = warned.FirstOrDefault(w => w.Kind == DruidTeleKind.GroundDecal);
                    Check(ring != null && Math.Abs(ring.GapDir - tw.GapAng) < 1e-9 && Math.Abs(ring.GapAngle - 2 * tw.GapSize) < 1e-9 && Math.Abs(ring.Width - 2 * tw.W) < 1e-9, name + ": tide ring gap/band differ from the telegraph");
                    Check(cur.Any(t => t.Live && t.MoveId == "tideWave" && Math.Abs(t.GapDir - tw.GapAng) < 1e-9), name + ": live tide ring entry missing");
                }
                if (ev == "seekerMines")
                {   // 3 circles at the spawn spots (the mines have moved 1 px since): inside the 4 px of the decal tolerance
                    var circles = warned.Where(w => w.Shape == DruidTeleShape.Circle).OrderBy(w => w.Index).ToList(); int n = s.Druid.SeekerMines.Count; bool all = circles.Count == 3 && n >= 3;
                    for (int i = 0; i < 3 && all; i++) { var m = s.Druid.SeekerMines[n - 3 + i]; all = Dist(m.X, m.Y, circles[i].X, circles[i].Y) <= 4 && Math.Abs(circles[i].Radius - m.R) < 1e-9; }
                    Check(all, name + ": mine spots differ from the telegraph circles by more than 4 px");
                }
                if (ev == "groundFissure")
                {
                    var f = s.Druid.Fissures[s.Druid.Fissures.Count - 1]; var line = warned.FirstOrDefault(w => w.Shape == DruidTeleShape.Line);
                    Check(line != null && Math.Abs(line.Length - f.MaxLen) < 1e-9 && Math.Abs(line.Width - f.W) < 1e-9 && Math.Abs(line.Dir - f.Ang) < 1e-9 && f.Straight, name + ": fissure length/width/direction differ from the telegraph");
                    Check(warned.Count == 1, name + ": fissure telegraph must be one line (" + warned.Count + " entries)");
                }
                if (ev == "slam") Check(warned.Count == 2 && warned.All(w => w.Shape == DruidTeleShape.Circle && Math.Abs(w.Radius - DruidRemodelData.SlamRadius) < 1e-9), name + ": slam telegraph is not 2 circles of the slam radius");
            }
            foreach (var f in s.Druid.Fissures)
            {   // spec #4 (ruling 2026-10-28): fixed direction, no end blast, one hit per cast, only on the segment swept that tick
                double[] st;
                if (!tr.Fissures.TryGetValue(f, out st)) { st = new[] { f.Ang, 0.0 }; tr.Fissures[f] = st; }
                Check(Math.Abs(f.Ang - st[0]) < 1e-12, name + ": fissure turned (" + st[0] + " -> " + f.Ang + ")");
                Check(!f.Exploded, name + ": fissure end blast went off");
                Check(f.Len - st[1] <= f.Spd + 1e-9 && f.Len >= st[1], name + ": fissure head step " + (f.Len - st[1]));
                Check(f.Len <= f.MaxLen + 1e-9, name + ": fissure past its max length");
                if (f.Hit && tr.FissureHit.Add(f))
                {
                    fissureHitsTotal++;
                    double ax = f.X + Math.Cos(f.Ang) * st[1], ay = f.Y + Math.Sin(f.Ang) * st[1], bx = f.X + Math.Cos(f.Ang) * f.Len, by = f.Y + Math.Sin(f.Ang) * f.Len;
                    double dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = l2 <= 0 ? 0 : Math.Max(0, Math.Min(1, ((s.Player.X - ax) * dx + (s.Player.Y - ay) * dy) / l2));
                    Check(Dist(s.Player.X, s.Player.Y, ax + dx * t, ay + dy * t) <= DruidBoss.FissureHitHalfWidth + s.Player.Radius + 3, name + ": fissure hit outside the swept segment");
                }
                st[1] = f.Len;
            }
            tr.Tide = s.Druid.TideWaves.Count; tr.Mines = s.Druid.SeekerMines.Count; tr.Fiss = s.Druid.Fissures.Count; tr.S = d.S; tr.Beat = d.HbBeat;
        }
        tr.PrevRem.Clear(); foreach (var t in cur) tr.PrevRem[TKey(t)] = t.Remaining;
        prev.Clear(); prev.AddRange(cur);
    }

    // end of run: coverage + the flag-off list is empty
    static void VerifyTelegraphs()
    {
        for (int m = 1; m <= 12; m++) Check(seenMoves.Contains(m), "telegraph list never carried move " + m + " (" + DruidRemodelData.Moves[m - 1].Id + ")");
        Check(teleEvents >= 20, "telegraph spawn checks " + teleEvents);
        var off = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, 1u);
        off.AttachDruidBoss(); var l = new List<DruidTelegraph> { new DruidTelegraph() }; off.DruidTelegraphs(l);
        Check(l.Count == 0, "flag off: telegraph list not empty");
    }

    static string TelegraphJson()
    {
        var sb = new StringBuilder("{\n  \"observations\": " + teleObservations + ",\n  \"spawnChecks\": " + teleEvents + ",\n  \"fissureHits\": " + fissureHitsTotal + ",\n  \"samples\": [\n");
        var list = samples.OrderBy(x => x.Value.Move).ThenBy(x => x.Key, StringComparer.Ordinal).ToList();
        for (int i = 0; i < list.Count; i++)
        {
            var t = list[i].Value;
            sb.Append("    {\"move\": ").Append(t.Move).Append(", \"id\": ").Append(J(t.MoveId)).Append(", \"kind\": ").Append(J(t.Kind.ToString())).Append(", \"shape\": ").Append(J(t.Shape.ToString())).Append(", \"index\": ").Append(t.Index).Append(", \"live\": ").Append(t.Live ? "true" : "false");
            sb.Append(", \"x\": ").Append(D(t.X)).Append(", \"y\": ").Append(D(t.Y)).Append(", \"dir\": ").Append(D(t.Dir)).Append(", \"radius\": ").Append(D(t.Radius)).Append(", \"angle\": ").Append(D(t.Angle)).Append(", \"length\": ").Append(D(t.Length)).Append(", \"width\": ").Append(D(t.Width));
            sb.Append(", \"inner\": ").Append(D(t.Inner)).Append(", \"gapDir\": ").Append(D(t.GapDir)).Append(", \"gapAngle\": ").Append(D(t.GapAngle)).Append(", \"progress\": ").Append(D(t.Progress)).Append(", \"total\": ").Append(D(t.Total)).Append(", \"remaining\": ").Append(D(t.Remaining));
            sb.Append(", \"tipX\": ").Append(D(t.TipX)).Append(", \"tipY\": ").Append(D(t.TipY)).Append("}").Append(i + 1 < list.Count ? ",\n" : "\n");
        }
        return sb.Append("  ]\n}\n").ToString();
    }
}
