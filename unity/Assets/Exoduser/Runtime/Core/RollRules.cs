using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // Warrior base mobility "roll" (web game.html _ROLL_* / _canRoll / activateRoll / _finishRoll / _tickBladeDash roll branch, origin/main 614cf73a0).
    // Pure rules: the oracle (Tools/roll-oracle) runs the web functions and compares every number with these.
    public static class RollRules
    {
        public const double Dist = 250 * 0.7;     // _ROLL_DIST (175)
        public const int Frames = 6;              // _ROLL_FRAMES
        public const int Iframes = 5;             // _ROLL_IFRAMES (first 5 of 6 frames)
        public static double GaugeCost { get { return ChainDash.GaugeCost[1]; } }   // _ROLL_GAUGE_COST = _HARP_GAUGE_COST[1] (45)

        // _canRoll(): not already rolling and one full gauge cell
        public static bool CanRoll(double moveT, double gauge) { return !(moveT > 0) && gauge >= GaugeCost; }

        // activateRoll direction: dir 0 up / 1 down / 2 left / 3 right, a held perpendicular key makes it diagonal
        public static double Angle(int dir, bool up, bool down, bool left, bool right)
        {
            double dx = 0, dy = 0;
            if (dir == 0) dy = -1; else if (dir == 1) dy = 1; else if (dir == 2) dx = -1; else dx = 1;
            if (dir == 0 || dir == 1) { if (left) dx = -1; else if (right) dx = 1; }
            if (dir == 2 || dir == 3) { if (up) dy = -1; else if (down) dy = 1; }
            return Math.Atan2(dy, dx);
        }

        // gauge after the spend (Math.max(0,gauge-cost)), cells left shown as the "n/max" floater
        public static double GaugeAfter(double gauge) { return Math.Max(0, gauge - GaugeCost); }
        public static int CellsLeft(double gaugeAfter) { return (int)Math.Floor(gaugeAfter / GaugeCost); }
        public static int CellsMax(double gaugeMax) { return (int)Math.Floor(gaugeMax / GaugeCost); }

        // _tickBladeDash(sp): step = min(sp, moveT); distance this step = Dist/6*step
        public static double Step(double sp, double moveT) { return Math.Min(sp, moveT); }
        public static double StepDistance(double step) { return Dist / 6 * step; }

        // u_d06 _uqMoveRefund(cost): back = min(cost*value, max(0, gaugeMax-gauge)); the caller only asks while the 180f token is up
        public static double WarpRefund(double cost, double value, double gauge, double gaugeMax)
        {
            if (value <= 0 || !(cost > 0)) return 0;
            return Math.Min(cost * value, Math.Max(0, gaugeMax - gauge));
        }
    }
}
