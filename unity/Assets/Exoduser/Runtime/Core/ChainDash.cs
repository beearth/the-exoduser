using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // Web chain movement (Shift, `_harp*` / `_dash*`) numbers as pure functions: tier by hold frames, distance, gauge cost / maximum / regeneration, stamina,
    // flight step, pull velocity, invulnerability and landing (game.html 12851-12883, 13335-13357, 32168-32260, 32262-32366, 32785-32791, 63460-63466).
    // The tier-3 auto fire, wall auto fire, enemy hit loop, fire trails and blade-wing effects are state-machine / skill code (second step).
    // Compared with the original statements (executed in a Node VM) by Tools/dash-parry-oracle.
    public static class ChainDash
    {
        public static readonly int[] TierHoldFrames = { 0, 1, 6, 12 };     // _HARP_TIER_F
        public static readonly int[] IframeByTier = { 0, 8, 14, 24 };      // _HARP_IFRAME (value stored in _dashIframe)
        public static readonly int[] PullFrames = { 0, 7, 11, 16 };        // _HARP_PULL_DUR
        public static readonly int[] GaugeCost = { 0, 45, 98, 150 };       // _HARP_GAUGE_COST
        public static readonly double[] DamageMul = { 0, 0.7, 1.5, 2.5 };  // _HARP_DMG (web: reference not found)
        public const double FlightSpeed = 63;                              // _HARP_SPD px/frame
        public const int BaseGaugeCells = 5;                               // _HARP_GAUGE_BASE_CELLS
        public const int LandingIframes = 48, LandingAnimFrames = 30, MoveIframesMin = 2, HoldFramesCap = 120, InputDelayFrames = 3;
        public const double GaugeRegenPerSecond = .025;                    // of the maximum
        public static double[] BaseDistance = { 0, 300, 500, 700 };
        public static double[] MaxLevelDistance = { 0, 500, 800, 1200 };

        public static double RangeMul(double pCharge) { return 1 + pCharge * .02; }          // pChargeRange
        public static double GaugeRegenMul(double pCharge) { return 1 + pCharge * .03; }     // pChargeGauge

        // _harpDistTier(tier): skill level = max(chargeBoost, magicBlink); linear between level 1 and 10
        public static int DistanceOfTier(int tier, double chargeBoost, double magicBlink, double pCharge)
        {
            double lv = Math.Max(Js.Or(chargeBoost, 0), Js.Or(magicBlink, 0));
            if (tier <= 0) return 0;
            int t = Math.Min(tier, 3);
            if (lv <= 0) return Js.Int(BaseDistance[t] * RangeMul(pCharge));
            if (lv >= 10) return Js.Int(MaxLevelDistance[t] * RangeMul(pCharge));
            return Js.Int((BaseDistance[t] + (MaxLevelDistance[t] - BaseDistance[t]) * (lv - 1) / 9) * RangeMul(pCharge));
        }
        // _harpAvailableDist(tier,gauge)
        public static double AvailableDistance(int tier, double gauge, double chargeBoost, double magicBlink, double pCharge)
        {
            return DistanceOfTier(tier, chargeBoost, magicBlink, pCharge) * Math.Min(1, Math.Max(0, gauge) / GaugeCost[tier]);
        }
        // tier while Shift is held / when it is released
        public static int TierForHoldFrames(double holdFrames) { return holdFrames >= TierHoldFrames[3] ? 3 : holdFrames >= TierHoldFrames[2] ? 2 : 1; }

        public struct ReleaseResult { public bool Fired; public double Gauge, St, MaxDist; }
        // Shift release (13342-13357): gauge cost min(gauge,cost[tier]), stamina mst*0.01*tier, flight distance from the paid gauge
        public static ReleaseResult Release(int tier, double gauge, double st, double mst, double chargeBoost, double magicBlink, double pCharge)
        {
            double gCost = Math.Min(gauge, GaugeCost[tier]);
            double stCost = mst * 0.01 * tier;
            var r = new ReleaseResult { Gauge = gauge, St = st, MaxDist = double.NaN };
            if (gCost > 0 && st >= stCost)
            {
                r.Fired = true; r.Gauge = gauge - gCost; r.St = st - stCost;
                r.MaxDist = AvailableDistance(tier, gCost, chargeBoost, magicBlink, pCharge);
            }
            return r;
        }
        // sBash dash-cancel (33528): tier = min(3, 2 + ~~(chargeBoost/3))
        public static int CancelTier(double chargeBoost) { return Math.Min(3, 2 + Js.Int(Js.Or(chargeBoost, 0) / 3)); }

        // gauge regeneration (32168): only while not holding, flying or pulled, alive, and not in practice chapter 2
        public static double RegenGauge(double gauge, double max, double chargeBoost, double pCharge, double dtSp, bool hold, bool harpActive, bool dashActive, bool dead, bool lessonChapter2)
        {
            if (dead || lessonChapter2) return gauge;
            double regen = max * .025 / 60 * (1 + Js.Or(chargeBoost, 0) * .05) * GaugeRegenMul(pCharge);
            if (gauge < max && !hold && !harpActive && !dashActive) return Math.Min(max, gauge + regen * dtSp);
            return gauge;
        }

        public struct GaugeMaxResult { public int Cells; public double Max; public int MaxStocks; public double CdBase; }
        // maximum gauge (32785-32787 and 63460-63465 give the same numbers) + old stock formula (32785, 32790)
        public static GaugeMaxResult ComputeGaugeMax(bool dimRush, bool dimThunder, bool dimBreach, double chargeBoost, double magicBlink, double extraST, double armorStock, double bootsStock)
        {
            double cb = Js.Or(chargeBoost, 0);
            bool hasCharge = cb >= 1 || Js.Or(magicBlink, 0) >= 1;
            var r = new GaugeMaxResult();
            r.MaxStocks = dimBreach ? 5 : (int)Math.Min(5, (hasCharge ? 3 + Js.Int(cb / 10) : 1) + (Js.Or(armorStock, 0) + Js.Or(bootsStock, 0)));
            r.Cells = dimRush ? 10 : dimThunder ? 9 : dimBreach ? 7 : hasCharge ? 6 : BaseGaugeCells;
            r.Max = r.Cells * GaugeCost[1] + Js.Int(extraST);
            r.CdBase = dimBreach ? Math.Max(180, 420 - cb * 20) : (hasCharge ? 600 : 300);
            return r;
        }

        // flight (32237-32239): distance advanced per frame, stops at the maximum
        public static void FlightStep(double dtSp, double maxDist, ref double dist, out double step)
        {
            step = Math.Min(dtSp, Math.Max(0, maxDist - dist) / FlightSpeed);
            dist = Math.Min(maxDist, dist + FlightSpeed * step);
        }
        public struct PullResult { public double Vx, Vy, Left, Iframe, Poise; }
        // pull start (32250-32257): velocity = distance / duration, poise refilled to 4, move invulnerability by tier
        public static PullResult StartPull(int tier, double px, double py, double hx, double hy)
        {
            double hd = Math.Sqrt((px - hx) * (px - hx) + (py - hy) * (py - hy));
            double dur = PullFrames[tier];
            var r = new PullResult { Iframe = IframeByTier[tier], Poise = 4, Left = dur };
            if (hd > 0) { r.Vx = (hx - px) / hd * (hd / dur); r.Vy = (hy - py) / hd * (hd / dur); }
            else { r.Vx = 0; r.Vy = 0; r.Left = 0; }
            return r;
        }
        // pull frame (32263-32265): step = min(dtSp, left), invulnerable for at least 2
        public static double PullStep(double dtSp, double left) { return Math.Min(dtSp, Math.Max(0, left)); }
        public static double PullIframes(double iframes) { return Math.Max(iframes, MoveIframesMin); }
        // landing (32363-32378): 48 invulnerable frames, 30 animation frames, shake 10/20/30 by tier (not for dim-breach unless a slam is ready)
        public static double LandingInvulnerable(double iframes) { return Math.Max(iframes, LandingIframes); }

        // Pass-through hit while the player is pulled (the `_dashActive` loop, game.html 32474-32505, STR branch; the magicBlink / dimBreach fire branch, the blade-wing
        // wide slash and the crowd refund are skills / uniques that are not ported). Every enemy within e.r + 20 of the player is hit once per chain cast.
        public const double PathHitReachExtra = 20, PathHitKnockbackMult = 2, PathHitPoiseMult = 2.0, PathHitPush = 25, PathHitShake = 4;
        public static bool IsPathHit(double px, double py, double ex, double ey, double er, bool alive, bool alreadyHit)
        {
            if (!alive || alreadyHit) return false;
            double dx = ex - px, dy = ey - py;
            return Math.Sqrt(dx * dx + dy * dy) <= er + PathHitReachExtra;
        }
        // const _cbMul = lv >= 1 ? 1.5 + (lv - 1) * .25 : 1; ~~(((ar().charge || 10) + P.baseAtk) * cbMul * statStr() * (1 + _eqAffix('dashBoost')))
        public static int PathHitDamage(double chargeBoostLevel, double armorCharge, double baseAtk, double statStr, double dashBoost)
        {
            double cbMul = chargeBoostLevel >= 1 ? 1.5 + (chargeBoostLevel - 1) * 0.25 : 1.0;
            return Js.Int(((Js.Or(armorCharge, 10)) + baseAtk) * cbMul * statStr * (1 + dashBoost));
        }
        public static double LandingShake(int tier, bool dimBreach, bool slamLand) { return !dimBreach || slamLand ? (tier >= 3 ? 30 : tier >= 2 ? 20 : 10) : double.NaN; }
    }
}
