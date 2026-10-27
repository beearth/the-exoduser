// RB1-6 (spec §10.3, boss board §8 M1..M5) checks on the remodelled druid, driven from the fights of Program.cs:
//  table  - every move's telegraph / recovery / cooldown equals the §10.2 table (the table is the answer); M1 / M3 principles are listed
//  M2     - the aim turns at most 2 deg per tick in a telegraph, is frozen for the last 12 f, and never changes in a swing / lunge / recovery; walking turns at most 3 deg
//  M4     - recovery end -> next telegraph: life 1 / 2 / 3 = 45 / 36 / 30 f, 12 f inside a combo
//  M5     - walking speed <= 1.1 x 1.2 = 1.32 px/tick, acceleration <= max / 20 per tick
//  #12    - heartbeat: first beat Total 90, beats 2-3 Total 60, 30 f pause, a player at r 259 around the boss takes no damage, at r 261 he does
//  API    - the first Total of every telegraph entry equals the new telegraph (+ the fixed lead of the move)
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;

static partial class P
{
    // spec §10.2: telegraph (tele), recovery (rec), cooldown (cd) per move, Moves[] order
    static readonly int[] SpecTele = { 32, 48, 54, 40, 38, 60, 50, 30, 60, 70, 40, 90 };
    static readonly int[] SpecRec = { 80, 70, 70, 60, 60, 80, 70, 60, 60, 70, 60, 90 };   // 2026-10-28 M3 unification: #4 and #5 -> 60, #10 -> 70
    static readonly int[] SpecCd = { 110, 160, 130, 160, 120, 200, 220, 200, 320, 180, 200, 2400 };
    static readonly List<string> motionNotes = new List<string>();
    static double maxWalkEver, maxTurnWalkEver, maxTurnWindEver, maxVelEver, maxDashEver; static int parryBonusChecks;
    static int gapSamples, gapNear12, gapNearPhase, heartProbes;

    static void VerifyMoveTable()
    {
        var mv = DruidRemodelData.Moves;
        Check(mv.Length == 12, "move table has 12 rows");
        for (int i = 0; i < mv.Length && i < 12; i++)
        {
            Check(mv[i].Tele == SpecTele[i], "§10.2 #" + (i + 1) + " " + mv[i].Id + " tele " + mv[i].Tele + " vs " + SpecTele[i]);
            Check(mv[i].Rec == SpecRec[i], "§10.2 #" + (i + 1) + " " + mv[i].Id + " rec " + mv[i].Rec + " vs " + SpecRec[i]);
            Check(mv[i].Cd == SpecCd[i], "§10.2 #" + (i + 1) + " " + mv[i].Id + " cooldown " + mv[i].Cd + " vs " + SpecCd[i]);
            Check(mv[i].Tele >= 24, "M1 #" + (i + 1) + " telegraph >= 24 (" + mv[i].Tele + ")");
        }
        var big = mv.Where((m, i) => i != 0 && i != 7).Select(m => m.Tele).Min();
        Check(big >= 30, "M1 smallest non-slash telegraph " + big);
        // M3 (boss-battle lead 2026-10-28): every move with a telegraph of 40 f or more recovers at least max(telegraph, 60) f; the fan (telegraph 38) was raised to 60 with it
        for (int i = 0; i < mv.Length; i++) if (mv[i].Tele >= 40) Check(mv[i].Rec >= Math.Max(mv[i].Tele, 60), "M3 #" + (i + 1) + " " + mv[i].Id + " recovery " + mv[i].Rec + " >= max(" + mv[i].Tele + ", 60)");
        Check(mv[4].Rec >= 60, "M3 fan recovery " + mv[4].Rec);
        Check(DruidRemodelData.PoisonDashSpeed == 4 && DruidRemodelData.PoisonDashTicks == 45, "#8 poison dash 4 px/tick x 45 f");
        Check(DruidRemodelData.GapTicks.SequenceEqual(new[] { 45, 36, 30 }) && DruidRemodelData.ComboLinkTicks == 12, "M4 gaps 45 / 36 / 30, combo link 12");
        Check(DruidRemodelData.WalkSpeed == 1.1 && DruidRemodelData.WalkAccelTicks == 20 && DruidRemodelData.WalkStopTicks == 12, "M5 walk 1.1 px/tick, accel 20 f, stop 12 f");
        Check(Math.Abs(DruidRemodelData.WalkTurn - 3 * Math.PI / 180) < 1e-12 && Math.Abs(DruidRemodelData.TeleTurn - 2 * Math.PI / 180) < 1e-12 && DruidRemodelData.AimFixTicks == 12, "M2 turn 3 deg / 2 deg, aim fixed 12 f before");
        Check(DruidRemodelData.Phases.Max(p => p.SpdM) * DruidRemodelData.WalkSpeed <= 1.32 + 1e-9, "§10.1 maximum 1.32 px/tick");
        Check(DruidRemodelData.ParryRecoveryBonus == 30 && DruidRemodelData.HeartbeatSafeRadius == 260 && DruidRemodelData.HeartbeatPause == 30, "parry +30 f, heartbeat safe ring 260, pause 30");
    }

    sealed class Motion
    {
        public string Name; public bool Placed;
        string ps = ""; double pst2, pface, px, py, pvel; bool has; int idleSince = -1, lastMoveCount, probeSerial = -1, probeBeat; int pendingProbe = -1; float hpBefore; bool probeDone, paradeDone;
        readonly Dictionary<string, double> totalSeen = new Dictionary<string, double>();

        static bool IsWind(string s) { return s.EndsWith("Wind") || s == "bossDruidDive"; }
        static bool WalkSet(string s) { return s == "idle" || IsWind(s) || s == "bossRec" || s == "bossHeartPause"; }

        // before the tick: place the player at r 259 / 261 around the boss in the last tick before each beat of the first heartbeat of the fight
        bool kbPre; int hurtsBefore;
        public void PreTick(EnemyState boss) { kbPre = Math.Abs(boss.KnockbackX) + Math.Abs(boss.KnockbackY) > .1; }   // knock-back of this tick is applied inside Tick

        public bool Before(Simulation s, EnemyState boss, PlayerState pl)
        {
            Placed = false; pendingProbe = -1;
            DruidData d; if (!s.Druid.Data.TryGetValue(boss, out d)) return false;
            if (d.S == "bossHeartWind" && d.St2 <= 1)
            {
                foreach (var m in d.Minions) m.Alive = false;   // only the pulse may hurt the probe player
                if (probeSerial != s.Druid.TeleSerial) { probeSerial = s.Druid.TeleSerial; probeBeat = 0; }
                if (!probeDone && probeBeat < 3 && probeBeat == d.HbBeat)
                {
                    double r = probeBeat == 1 ? 261 : 259;
                    for (int k = 0; k < 16; k++)
                    {
                        double a = Math.PI * 2 * k / 16, x = d.X + Math.Cos(a) * r, y = d.Y + Math.Sin(a) * r;
                        if (!s.CanMove((float)x, (float)y, pl.Radius)) continue;
                        pl.X = (float)x; pl.Y = (float)y; pl.Iframes = 0; s.PlayerPoison = 0; pl.Hp = pl.MaxHp; hpBefore = pl.Hp; hurtsBefore = s.HurtCount; pendingProbe = probeBeat == 1 ? 1 : 0; Placed = true; break;
                    }
                }
            }
            return Placed;
        }

        public void After(string name, Simulation s, EnemyState boss, PlayerState pl)
        {
            DruidData d; if (!s.Druid.Data.TryGetValue(boss, out d)) return;
            bool kb = kbPre || Math.Abs(boss.KnockbackX) + Math.Abs(boss.KnockbackY) > .1;
            if (pendingProbe >= 0)
            {
                bool damaged = pl.Hp < hpBefore;
                Check(damaged == (pendingProbe == 1), name + ": heartbeat beat " + probeBeat + " with the player at r " + (pendingProbe == 1 ? 261 : 259) + ": damaged " + damaged + " (boss now " + d.X.ToString("0.0") + "," + d.Y.ToString("0.0") + " player " + pl.X.ToString("0.0") + "," + pl.Y.ToString("0.0") + " dist " + Math.Sqrt((d.X - pl.X) * (d.X - pl.X) + (d.Y - pl.Y) * (d.Y - pl.Y)).ToString("0.0") + " state " + d.S + " lost " + (hpBefore - pl.Hp) + " hurts " + (s.HurtCount - hurtsBefore) + " last " + s.LastHurtAmount + " atk*1.5 " + (int)(d.Atk * 1.5) + " others " + string.Join(",", s.Enemies.Where(en => en.Alive && en != boss).Select(en => en.Etype + "@" + Math.Sqrt((en.X - pl.X) * (en.X - pl.X) + (en.Y - pl.Y) * (en.Y - pl.Y)).ToString("0"))) + " iframes " + " shield " + pl.Shield + ")");
                heartProbes++; probeBeat++; if (probeBeat >= 3) probeDone = true;   // only the first heartbeat of the fight: later ones can have other hazards on the floor
            }
            if (has)
            {
                double moved = Math.Sqrt((d.X - px) * (d.X - px) + (d.Y - py) * (d.Y - py));
                if (ps == "bossPoisonDash" && d.S == "bossPoisonDash" && !kb)
                {   // #8: 4 px/tick, straight along the frozen aim
                    Check(moved <= DruidRemodelData.PoisonDashSpeed + 1e-4, name + ": #8 poison dash moved " + moved.ToString("0.000"));
                    maxDashEver = Math.Max(maxDashEver, moved);
                }
                if (WalkSet(ps) && WalkSet(d.S) && !kb)
                {
                    maxWalkEver = Math.Max(maxWalkEver, moved);
                    Check(moved <= DruidRemodelData.WalkSpeed * 1.2 + 1e-4, name + ": M5 moved " + moved.ToString("0.000") + " px in one tick in " + ps + " -> " + d.S);
                }
                // aim
                double dTurn = Math.Abs(WrapA(d.Facing - pface));
                double limit = ps == "idle" ? DruidRemodelData.WalkTurn : IsWind(ps) ? (pst2 - 1 > DruidRemodelData.AimFixTicks ? DruidRemodelData.TeleTurn : 0) : 0;
                if (ps == "idle" && IsWind(d.S)) limit = DruidRemodelData.WalkTurn + DruidRemodelData.TeleTurn;   // the same tick: the walk turn, then the first telegraph turn
                if (ps == "idle") maxTurnWalkEver = Math.Max(maxTurnWalkEver, dTurn); else if (IsWind(ps)) maxTurnWindEver = Math.Max(maxTurnWindEver, dTurn);
                Check(dTurn <= limit + 1e-4, name + ": M2 aim turned " + (dTurn * 180 / Math.PI).ToString("0.000") + " deg in " + ps + " (St2 " + pst2 + ") -> " + d.S);
                // acceleration of the walking model (RmVel): at most max / 20 per tick up, max / 12 per tick down; displacement alone can include pushes from other bodies
                double vmaxNow = DruidRemodelData.WalkSpeed * DruidRemodelData.Phases[Math.Min(Math.Max(d.BossPhase, 0), 2)].SpdM;
                Check(d.RmVel - pvel <= vmaxNow / DruidRemodelData.WalkAccelTicks + 1e-9, name + ": M5 walking speed rose " + (d.RmVel - pvel).ToString("0.0000") + " in one tick");
                Check(d.RmVel <= vmaxNow + 1e-9, name + ": M5 walking speed " + d.RmVel.ToString("0.000") + " above " + vmaxNow.ToString("0.000"));
                maxVelEver = Math.Max(maxVelEver, d.RmVel);
            }
            pvel = d.RmVel;
            // +30 f recovery after a parry, once per move run (also when the parry lands during the recovery)
            if (d.S == "bossRec" && d.St2 > 45 && !paradeDone && d.RmMoveId == "slam")
            {
                double before = d.St2; bool appliedBefore = d.RmBonusApplied;
                s.Druid.OnBossParried(d); s.Druid.OnBossParried(d);
                Check(!appliedBefore && Math.Abs(d.St2 - before - DruidRemodelData.ParryRecoveryBonus) < 1e-9, name + ": parry during recovery: +30 once (" + before + " -> " + d.St2 + ")");
                paradeDone = true; parryBonusChecks++;
            }
            // gap: the tick the boss reaches idle after a recovery -> the tick the next move starts
            int mc = s.Druid.MoveLog.Count;
            if (ps == "bossRec" && d.S == "idle") idleSince = s.TickCount;
            if (mc > lastMoveCount)
            {
                var m = s.Druid.MoveLog[mc - 1];
                if (idleSince >= 0 && mc - lastMoveCount == 1 && m.Move != "heartbeat")   // the heartbeat is forced by its own cooldown, not by the gap
                {
                    int gap = Math.Max(0, m.Tick - idleSince), want = DruidRemodelData.GapTicks[Math.Min(m.Phase, 2)];
                    gapSamples++;
                    bool near12 = Math.Abs(gap - DruidRemodelData.ComboLinkTicks) <= 2, nearPhase = gap >= want - 2;
                    if (near12) gapNear12++; else if (nearPhase) gapNearPhase++;
                    Check(near12 || nearPhase, name + ": M4 gap " + gap + " f before " + m.Move + " (life " + (m.Phase + 1) + ", expected " + want + " or " + DruidRemodelData.ComboLinkTicks + ")");
                }
                idleSince = -1; lastMoveCount = mc;
            }
            // API: first Total of each entry
            var cur = new List<DruidTelegraph>(); s.DruidTelegraphs(cur);
            foreach (var t in cur)
            {
                if (t.Live) continue;
                string key = t.MoveId + "/" + (int)t.Kind + "/" + t.Index + "/" + t.Serial;
                if (!totalSeen.ContainsKey(key)) { totalSeen[key] = t.Total; CheckTotal(name, t); }
            }
            ps = d.S; pst2 = d.St2; pface = d.Facing; px = d.X; py = d.Y; has = true;
        }

        static double WrapA(double a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }

        static void CheckTotal(string name, DruidTelegraph t)
        {
            var mv = DruidRemodelData.Moves; int i = t.Move - 1; double want = -1;
            switch (t.MoveId)
            {
                case "slashCombo": want = (t.Index == 0 ? mv[0].Tele : DruidRemodelData.SlashLinkTele) + DruidRemodelData.SlashActive - DruidRemodelData.SlashHitAt; break;
                case "slam": want = mv[1].Tele + DruidRemodelData.SlamActive; break;
                case "charge": case "groundFissure": case "fan": case "grab": case "summon": case "tideWave": case "seekerMines": want = mv[i].Tele; break;
                case "burrowStrike": want = mv[6].Tele + 45 + DruidRemodelData.BurrowEruptWarn; break;
                case "chaseAoe": want = DruidRemodelData.ChaseZoneWarn; break;
                case "heartbeat": want = t.Index == 0 ? mv[11].Tele : DruidRemodelData.HeartbeatBeatWind; break;
            }
            if (t.MoveId == "groundFissure" && t.Shape == DruidTeleShape.Circle) return;
            if (want >= 0) Check(Math.Abs(t.Total - want) < 1e-9, name + ": API Total of " + t.MoveId + " (index " + t.Index + ") " + t.Total + " vs " + want);
            if (t.MoveId == "heartbeat") Check(t.Safe != null && t.Safe.Length >= 1 && t.Safe[0][2] == DruidRemodelData.HeartbeatSafeRadius, name + ": API heartbeat Safe carries the ring of 260");
        }
    }

    static void VerifyMotionTotals()
    {
        Check(heartProbes >= 6, "heartbeat probes " + heartProbes);
        Check(parryBonusChecks >= 1, "parry bonus checks " + parryBonusChecks);
        Check(gapSamples >= 40, "gap samples " + gapSamples);
        motionNotes.Add("max walking step " + maxWalkEver.ToString("0.000") + " px/tick, max walking speed " + maxVelEver.ToString("0.000") + " (limit 1.32); max turn walking " + (maxTurnWalkEver * 180 / Math.PI).ToString("0.00") + " deg, in a telegraph " + (maxTurnWindEver * 180 / Math.PI).ToString("0.00") + " deg; gaps " + gapSamples + " (combo link " + gapNear12 + ", phase gap " + gapNearPhase + "); heartbeat probes " + heartProbes + "; max poison dash step " + maxDashEver.ToString("0.000") + "; parry-bonus checks " + parryBonusChecks);
    }
}
