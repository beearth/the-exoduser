using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B1 remodel per-boss fields (kept apart from the oracle-checked DruidData block)
    public sealed partial class DruidData
    {
        public bool RmFire, FeintUsed;                 // StartPattern re-entry after a telegraph / one feint per combo
        public BossMove RmPending;                     // move waiting behind the bossRmWind telegraph
        public string CurMove = "", PrevMove = "";   // RM-1 sound: the move now running / the one before (druid_vo_attack is skipped when the same move repeats)
        public int HbBeat;                             // heartbeat: beats already pulsed
        public string RmMoveId;                        // move started last (a grab picked beyond 120 px turns into a charge wind: only the id tells them apart)
        public double RmTeleTotal, RmGap, RmDir;              // frames of the wind state just entered / tide-wave gap angle drawn at the move start (telegraph list)
        public double HeartCd;                         // idle ticks until the next heartbeat (0 = ready: set at P3 entry)
        public int GrabHits; public double GrabLast, GrabAcc;
        public List<EnemyState> Minions = new List<EnemyState>();
    }

    public sealed class MoveLogEntry { public int Tick, Phase; public string Move; }

    // RM-B1 (RB1-1): the 12-move table / 3-phase AI of the remodelled druid and the new move 12 (heartbeat). All of it is behind DruidBoss.Remodel: with the flag off the
    // oracle-checked web code path is untouched (druid-boss-oracle compares exactly that).
    public sealed partial class DruidBoss
    {
        public bool Remodel;                                         // DruidRemodel: 12 moves, lives = phases
        public List<MoveLogEntry> MoveLog;                           // harness: every move the AI started (remodel only)
        public Func<int> Clock;                                      // simulation tick for MoveLog (Tick stops while the boss kneels)
        // SafeZones = centre x, centre y, radius. RB1-3 fills it with the four root pillar shadows; empty means the heartbeat can only be dodged with i-frames.
        public readonly List<double[]> SafeZones = new List<double[]>();

        BossPhaseDef Ph(int phase) { return Remodel ? Set.Phases[Math.Min(Math.Max(phase, 0), Set.Lives - 1)] : DruidBossData.Phases[phase]; }
        BossMove[] MoveTable { get { return Remodel ? Set.Moves : DruidBossData.Moves; } }
        BossCombo[] ComboTable { get { return Remodel ? Set.Combos : DruidBossData.Combos; } }
        double CooldownOf(BossMove mv, BossPhaseDef ph) { return Remodel && Set.Forced.Contains(mv.Id) ? mv.Cd : mv.Cd * ph.CdM; }

        static int AliveMinions(DruidData d)
        {
            int n = 0; for (int i = d.Minions.Count - 1; i >= 0; i--) { if (d.Minions[i].Alive) n++; else d.Minions.RemoveAt(i); }
            return n;
        }

        // move 12 (P3 entry once, then every 40 s of real time, see TickBoss): checked before the normal pick so the score table never has to choose it
        bool ForceHeartbeat(EnemyState e, DruidData d, double dist)
        {
            if (d.BossPhase < 2 || d.HeartCd > 0 || d.S != "idle") return false;
            BossMove mv = FindMove("heartbeat"); if (mv == null) return false;
            d.HeartCd = DruidRemodelData.HeartbeatCooldownTicks;
            d.ComboSeq = null; d.ComboIdx = 0; d.Feinting = false; d.FeintUsed = false;
            d.LastMoves.Add(mv.Id); if (d.LastMoves.Count > 5) d.LastMoves.RemoveAt(0);
            d.BossPatT = 30;
            LastPick = mv.Id; StartPattern(e, d, mv, dist, d.BossPhase, 0);
            return true;
        }

        // RM-1 sound section 6.6: the tell sound of each move (spec section 3 / 4). tell_parry = parryable melee, tell_boss = floor / ranged area, tell_grab = the grab.
        static string TellKey(string id)
        {
            switch (id)
            {
                case "slashCombo": case "slam": case "charge": case "tideWave": return "tell_parry";
                case "grab": return "tell_grab";
                case "burrowStrike": return "druid_burrow";
                case "groundFissure": case "fan": case "chaseAoe": case "summon": case "seekerMines": case "heartbeat": return "tell_boss";
                default: return null;
            }
        }
        void RmTell(BossMove mv, DruidData d, double dist)
        {
            string key = TellKey(mv.Id); if (key == null) return;
            if (mv.Id == "grab" && dist >= 120) key = "tell_parry";   // out of grab range the web turns the grab into a charge wind-up
            int n = Array.FindIndex(DruidRemodelData.Moves, m => m.Id == mv.Id) + 1;
            host.Sound(key, "#" + n + " " + mv.Id + " telegraph", d.X, d.Y);
        }

        // RM-1 sound SND-09: the big-move kiai (slam / charge / tide wave), skipped when the same move just ran
        void AttackVoice(DruidData d, string move) { if (d.PrevMove != move) host.Sound("druid_vo_attack", "#" + (Array.FindIndex(DruidRemodelData.Moves, m => m.Id == move) + 1) + " " + move + " kiai", d.X, d.Y); }

        bool InSafeZone(double x, double y)
        {
            foreach (var z in SafeZones) if (Dst(x, y, z[0], z[1]) < z[2]) return true;
            return false;
        }

        // one beat of the arena wave: unparryable magic damage unless the player stands in a safe zone (or is in i-frames); the boss stays put between beats
        void HeartbeatPulse(EnemyState e, DruidData d)
        {
            host.Fx("druidHeartbeat", d.X, d.Y, 0); host.Shake(10); host.Sound("druid_heartbeat", "#12 heartbeat beat " + (d.HbBeat + 1), d.X, d.Y);
            if (host.PlayerAlive && host.PIframes <= 0 && !InSafeZone(host.PX, host.PY) && !InPillarShadow(host.PX, host.PY, d.X, d.Y) && Dst(host.PX, host.PY, d.X, d.Y) > DruidRemodelData.HeartbeatSafeRadius) PlayerHit(e, d, DruidRemodelData.HeartbeatDamageMul, 6, true);   // safe: the ring of 260 around the boss, plus the root pillar shadows (RB1-3)
            d.HbBeat++;
            if (d.HbBeat >= DruidRemodelData.HeartbeatBeats) Recover(d, 0);   // bossRec with the table's 90 f (`recover` clamps St2 to 20)
            else { d.S = "bossHeartPause"; d.St2 = DruidRemodelData.HeartbeatPause; }
        }

        // move 6 (grab): while held the boss drains the player's tick and heals 3 % of the life HP in total; enough player hits break the hold
        void GrabStart(EnemyState e, DruidData d) { d.GrabHits = 0; d.GrabAcc = 0; d.GrabLast = e.Hp + e.Shield; }
        bool GrabEscaped(EnemyState e, DruidData d)
        {
            double cur = e.Hp + e.Shield;
            if (cur < d.GrabLast - .5) d.GrabHits++;
            d.GrabLast = cur;
            if (d.GrabHits < DruidRemodelData.GrabEscapeHits) return false;
            d.S = "recover"; d.St2 = 40; RmText(host.PX, host.PY - 25, "벗어났다!", "#dfd6c2", 40);
            return true;
        }
        void GrabAbsorb(EnemyState e, DruidData d)
        {
            d.GrabAcc += e.MaxHp * DruidRemodelData.GrabHealFraction / (DruidRemodelData.GrabTicks / 10.0);
            int h = (int)d.GrabAcc; d.GrabAcc -= h;
            if (h > 0 && e.Alive && e.Hp < e.MaxHp) { e.Hp = Math.Min(e.MaxHp, e.Hp + h); host.Fx("druidAbsorb", d.X, d.Y, d.R); }
            d.GrabLast = e.Hp + e.Shield;
        }

        // ---- lives: called by Simulation.DruidRemodel (the Core of the fight knows nothing about HP bars) ------------------------------------------------------------------
        // the boss goes down: kneel for CollapseTicks, no action, hazards cleared (the 2 s breather of spec §2)
        public void BeginCollapse(EnemyState e)
        {
            DruidData d; if (!Data.TryGetValue(e, out d)) return;
            d.S = "bossDruidRest"; d.St2 = DruidRemodelData.CollapseTicks; d.Feinting = false; d.ComboSeq = null; d.ComboIdx = 0; d.ProjChargeT = 0; d.RmPending = null; d.RmFire = false; d.TelegraphT = 0;
            e.Stunned = 0; e.KnockbackX = 0; e.KnockbackY = 0;
            ClearHazards();
            WriteBack(e, d);
        }

        // he gets up as life `life` (0-based): new phase, new numbers, a short stand-up, heartbeat ready on the last life
        public void BeginLife(EnemyState e, int life)
        {
            DruidData d; if (!Data.TryGetValue(e, out d)) return;
            d.BossPhase = life; e.BossPhase = life;
            d.S = "bossRec"; d.St2 = 60; d.BossPatT = Set.GapTicks[Math.Min(Math.Max(life, 0), 2)]; d.PImmune = 0; d.ComboSeq = null; d.ComboIdx = 0; d.Feinting = false; d.FeintUsed = false; d.Delaying = 0;
            d.HeartCd = 0; d.R = e.Radius; d.RmVel = 0; d.RmParryPending = false; d.RmBonusApplied = false;
            for (int i = 0; i < d.MoveCDs.Length; i++) d.MoveCDs[i] = 0;
            WriteBack(e, d);
        }
    }
}
