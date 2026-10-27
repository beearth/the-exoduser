using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // Warrior roll on the player state machine (web activateRoll / _tickBladeDash / _finishRoll). Trigger rules (keydown handler "basic mobility input"): a direction
    // key pressed while the roll key is held, or the roll key pressed while a direction key is held (first held in up, down, left, right order). Consumed in every
    // state except fallen / dead / pStun at the general site, plus the stagger (window ends) and pStun (poise restored to 4) escapes.
    public sealed partial class Simulation
    {
        // equipment inputs (0 until the inventory layer feeds them): u_n02 _uBlinkWeak (damage taken +x for 300f), u_d06 _uWarpStepRefund (x of the cost back,
        // first move within 180f of a time warp; WarpStepRefundTicks is the token the time warp sets to 180)
        public double UniqueBlinkWeak, UniqueWarpStepRefund; public int WarpStepRefundTicks;
        public bool RollActive; public double RollMoveT, RollAngle; public int RollCount, RollDenied;
        internal string PreRollState { get { return preRollState; } }
        string preRollState; bool rollUp, rollDown, rollLeft, rollRight, rollKey, rollPrevUp, rollPrevDown, rollPrevLeft, rollPrevRight, rollPrevKey; int rollPending = -1;

        // called by the owner once per tick before Tick(): held states of the four move keys and the roll key (keyboard keys only)
        public void SetRollInput(bool up, bool down, bool left, bool right, bool roll)
        {
            rollPrevUp = rollUp; rollPrevDown = rollDown; rollPrevLeft = rollLeft; rollPrevRight = rollRight; rollPrevKey = rollKey;
            rollUp = up; rollDown = down; rollLeft = left; rollRight = right; rollKey = roll;
            if (!roll) return;
            bool[] now = { up, down, left, right }, prev = { rollPrevUp, rollPrevDown, rollPrevLeft, rollPrevRight };
            for (int i = 0; i < 4; i++) if (now[i] && !prev[i]) { rollPending = i; return; }               // a direction pressed while the roll key is held
            if (!rollPrevKey) for (int i = 0; i < 4; i++) if (now[i]) { rollPending = i; return; }       // the roll key pressed while a direction is held
        }

        /// <summary>Test / script entry: queue a roll for the next tick (web P._bdTrigger).</summary>
        public void QueueRoll(int dir) { rollPending = dir; }

        public bool CanRollNow { get { return RollRules.CanRoll(RollMoveT, HarpGauge); } }

        // consume P._bdTrigger (general site 32276 + stagger / pStun cases); a trigger that cannot start is dropped like the web does
        internal void ConsumeRollTrigger()
        {
            if (rollPending < 0) return;
            int dir = rollPending; rollPending = -1;
            if (Player.State == "fallen" || Player.State == "dead" || Player.Hp <= 0) return;
            if (IceOrbActive) return;                                                      // B03: the orb blocks every action (web 33178)
            if (!CanRollNow) { RollDenied++; return; }
            if (Player.State == "stagger") Player.StateTicks = 0;
            else if (Player.State == "pStun") Player.Poise = PlayerPoise.MaxPoise;
            StartRoll(dir);
        }

        internal void StartRoll(int dir) { StartRollAngle(RollRules.Angle(dir, rollUp, rollDown, rollLeft, rollRight)); }

        // applyPathOnly: only the u_n02 path marking (oracle entry); otherwise the whole activateRoll after the direction is known
        internal void StartRollAngle(double ang, bool applyPathOnly = false)
        {
            if (applyPathOnly) { ApplyBlinkWeakPath(ang, RollRules.Dist); return; }
            double cost = RollRules.GaugeCost;
            HarpGauge = RollRules.GaugeAfter(HarpGauge);
            if (WarpStepRefundTicks > 0)   // _uqMoveRefund: the token is spent by the first move; the refund only exists when the unique is worn
            {
                WarpStepRefundTicks = 0;
                HarpGauge = Math.Min(HarpGaugeMax, HarpGauge + RollRules.WarpRefund(cost, UniqueWarpStepRefund, HarpGauge, HarpGaugeMax));
            }
            if (UniqueBlinkWeak > 0) ApplyBlinkWeakPath(ang, RollRules.Dist);
            RaisePlayerText(Player.X, Player.Y - 45, RollRules.CellsLeft(HarpGauge) + "/" + RollRules.CellsMax(HarpGaugeMax), "#dfd6c2", 30);   // addTxt(cells/max)
            RollAngle = ang; RollActive = true; RollMoveT = RollRules.Frames; RollCount++;
            preRollState = Player.State == "sBlock" ? "sBlock" : null;
            if (Player.State != "sDraw" && Player.State != "kiGather" && !Player.KiChargeActive) { Player.State = "bladeDash"; Player.StateTicks = RollRules.Frames; }
            Player.Facing = (float)ang;
            Player.Iframes = Math.Max(Player.Iframes, RollRules.Iframes);
            Feedback.Enqueue(new FeedbackEvent { Kind = FeedbackKind.Roll, Tick = TickCount, X = Player.X, Y = Player.Y, Angle = (float)ang });   // RM-1 sound
        }

        // _tickBladeDash(sp = 1): ease-out 175 px over 18 frames (_rollStepDist), stops on a wall
        internal void TickRoll()
        {
            if (!RollActive) return;
            if (Player.Hp <= 0 || Player.State == "fallen" || Player.State == "dead" || Player.State == "pStun") { RollActive = false; RollMoveT = 0; preRollState = null; return; }
            double step = RollRules.Step(1, RollMoveT), distance = RollRules.StepDistance(step, RollMoveT);
            float nx = Player.X + (float)(Math.Cos(RollAngle) * distance), ny = Player.Y + (float)(Math.Sin(RollAngle) * distance);
            if (Pass(nx, Player.Y, Player.Radius)) Player.X = nx; else RollMoveT = 0;
            if (Pass(Player.X, ny, Player.Radius)) Player.Y = ny; else RollMoveT = 0;
            RollMoveT -= step;
            if (Player.State == "bladeDash") { Player.StateTicks = (float)Math.Max(0, RollMoveT); Player.Facing = (float)RollAngle; }
            if (RollMoveT <= 0) FinishRoll();
        }

        private void FinishRoll()
        {
            if (Player.State == "bladeDash") Player.State = preRollState == "sBlock" && combatQHeld && Player.Mana > 0 ? "sBlock" : "idle";
            if (Player.State == "sBlock") Player.StateTicks = 999;
            RollMoveT = 0; RollActive = false; preRollState = null;
            Feedback.Enqueue(new FeedbackEvent { Kind = FeedbackKind.Roll, Step = 1, Tick = TickCount, X = Player.X, Y = Player.Y });   // RM-1 sound: web _finishRoll plays footstep2 here (start event = Step 0)
        }

        // the web addTxt floaters of the player combat states go through the same text channel as the revive floaters
        private void RaisePlayerText(double x, double y, string text, string color, int life)
        {
            var h = ReviveTextRaised; if (h != null) h(new ReviveText { X = x, Y = y, Ko = text, En = text, Color = color, Life = life });
        }

        // u_n02: enemies on the roll line (start to 175 px) take +x damage for 300 frames (the web's shQuery box is only a prefilter)
        private void ApplyBlinkWeakPath(double ang, double len)
        {
            double x0 = Player.X, y0 = Player.Y, dx = Math.Cos(ang) * len, dy = Math.Sin(ang) * len, l2 = dx * dx + dy * dy;
            foreach (var e in Enemies)
            {
                if (!e.Alive) continue;
                double t = l2 > 0 ? ((e.X - x0) * dx + (e.Y - y0) * dy) / l2 : 0; t = Math.Max(0, Math.Min(1, t));
                if (Distance((float)(x0 + dx * t), (float)(y0 + dy * t), e.X, e.Y) > e.Radius + 20) continue;
                e.BlinkWeak = Math.Max(e.BlinkWeak, UniqueBlinkWeak); e.BlinkWeakTicks = 300;
            }
        }

        private static void TickBlinkWeak(EnemyState e)
        {
            if (e.BlinkWeakTicks > 0) { e.BlinkWeakTicks--; if (e.BlinkWeakTicks <= 0) e.BlinkWeak = 0; }
        }
    }
}
