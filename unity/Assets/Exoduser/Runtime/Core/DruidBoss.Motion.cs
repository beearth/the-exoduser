using System;

namespace Exoduser.UnityPort.Core
{
    // RB1-6 per-boss motion state (remodel only)
    public sealed partial class DruidData
    {
        public double RmVel;                            // current walking speed (px per tick)
        public bool RmParryPending, RmBonusApplied;     // a parry landed during this move / the +30 f recovery was already granted
    }

    // RM-B1 RB1-6 (spec §10, boss board §8 M1..M7): heavy, readable movement. Everything is behind DruidBoss.Remodel and every number lives in DruidRemodelData, so with the
    // flag off the oracle-checked web code path is untouched.
    public sealed partial class DruidBoss
    {
        static double WrapAngle(double a)
        {
            while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
            return a;
        }

        static double TurnToward(double cur, double target, double maxStep)
        {
            double diff = WrapAngle(target - cur);
            if (Math.Abs(diff) <= maxStep) return target;
            return cur + Math.Sign(diff) * maxStep;
        }

        // the new facing when the web code would write `d.Facing = target`: remodel turns at most 3 deg per tick walking, 2 deg per tick during a telegraph (frozen for the last 12 f) and
        // not at all in any other state (swing, lunge, recovery)
        double Face(DruidData d, double target)
        {
            if (!Remodel) return target;
            double limit = 0;
            string s = d.S;
            if (s == "idle") limit = Set.WalkTurn;
            else if (s.EndsWith("Wind") || s == "bossDruidDive") limit = d.St2 > Set.AimFixTicks ? Set.TeleTurn : 0;
            return TurnToward(d.Facing, target, limit);
        }

        // floating text of the boss: with the remodel on, only the texts in Set.PopupKeep (wall hit damage, poison tick, "벗어났다!") are raised and only without an emoji / symbol glyph;
        // move names ("균열!", "확산!", "⚔ 난타!"), phase labels, counts and status callouts are dropped. The remodel tells the player what is coming with the telegraph displays,
        // not with words (spec §6). Remodel off = host.Text exactly as before.
        static bool HasGlyph(string s)
        {
            foreach (char c in s) { int u = c; if ((u >= 0x2190 && u <= 0x2BFF) || char.IsSurrogate(c) || u == 0x200D || (u >= 0xFE00 && u <= 0xFE0F)) return true; }   // arrows .. dingbats .. misc symbols, surrogate pairs (emoji), joiner, variation selectors
            return false;
        }
        bool PopupKept(string s)
        {
            var keep = Set.PopupKeep;
            for (int i = 0; keep != null && i < keep.Length; i++) if (s.StartsWith(keep[i], StringComparison.Ordinal)) return true;
            return false;
        }
        void RmText(double x, double y, string ko, string color, int life)
        {
            if (Remodel && (HasGlyph(ko) || !PopupKept(ko))) return;
            host.Text(x, y, ko, color, life);
        }

        // ---- walking: replaces _bossIdleMove, the alerted flow chase and the forward step of `idle` ---------------------------------------------------------------------
        // 1.1 px/tick x the life's speed factor, 0 -> max over 20 f and max -> 0 over 12 f, heading turns 3 deg per tick, no orbit / side dodge
        void RmWalk(EnemyState e, DruidData d, double dist)
        {
            if (e.Stunned > 0) return;
            double vmax = Set.WalkSpeed * Ph(d.BossPhase).SpdM;
            double toP = Atan2(host.PY - d.Y, host.PX - d.X), heading = toP, fx, fy;
            bool walk = d.Alerted && dist > Set.WalkStandOff;
            if (walk && host.FlowDir(d.X, d.Y, out fx, out fy)) heading = Atan2(fy, fx);
            d.Facing = TurnToward(d.Facing, heading, Set.WalkTurn);
            if (walk && Math.Abs(WrapAngle(heading - d.Facing)) < 0.8) d.RmVel = Math.Min(vmax, d.RmVel + vmax / Set.WalkAccelTicks);
            else d.RmVel = Math.Max(0, d.RmVel - vmax / Set.WalkStopTicks);
            RmStep(d);
        }

        // keeps sliding for the last 12 f of the stop while a telegraph or a recovery has begun (no sudden stop)
        void RmDrift(DruidData d)
        {
            if (d.RmVel <= 0) return;
            string s = d.S;
            if (s == "idle") return;   // RmWalk owns the speed while he walks
            if (s.EndsWith("Wind") || s == "bossRec") { d.RmVel = Math.Max(0, d.RmVel - Set.WalkSpeed * Ph(d.BossPhase).SpdM / Set.WalkStopTicks); RmStep(d); }
            else d.RmVel = 0;
        }

        void RmStep(DruidData d)
        {
            if (d.RmVel <= 0) return;
            double mx = Cos(d.Facing) * d.RmVel, my = Sin(d.Facing) * d.RmVel, nx = d.X + mx, ny = d.Y + my;
            if (host.CanMove(nx, ny, d.R)) { d.X = nx; d.Y = ny; }
            else if (host.CanMove(nx, d.Y, d.R)) d.X = nx;
            else if (host.CanMove(d.X, ny, d.R)) d.Y = ny;
            else d.RmVel = 0;
        }

        // ---- recovery: bossRec with the table's frames (the web `recover` state clamps St2 to 20, so it cannot be used), +30 f after a parry ---------------------------------------
        void Recover(DruidData d, double webSt2)
        {
            if (!Remodel) { d.S = "recover"; d.St2 = webSt2; return; }
            int bonus = d.RmParryPending ? DruidRemodelData.ParryRecoveryBonus : 0;
            d.RmBonusApplied = d.RmParryPending; d.RmParryPending = false;
            d.S = "bossRec"; d.St2 = RmRecoveryTicks(d, webSt2) + bonus;
        }

        int RmRecoveryTicks(DruidData d, double webSt2)
        {
            string id = d.RmMoveId ?? "";
            if (id == "grab" && RmGrab) return webSt2 == 40 ? DruidRemodelData.GrabMissRecovery : DruidRemodelData.GrabHeldRecovery;   // 40 = the miss of the web code
            var mv = FindMove(id);
            return mv != null ? mv.Rec : 40;
        }

        // a parry of this boss landed (E / Q on a swing, a dash, the slam, the tide ring): the recovery of that move is 30 f longer, once per move
        public void OnBossParried(DruidData d)
        {
            if (d.S == "bossRec") { if (!d.RmBonusApplied) { d.St2 += DruidRemodelData.ParryRecoveryBonus; d.RmBonusApplied = true; } }
            else d.RmParryPending = true;
        }
    }
}
