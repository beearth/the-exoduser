using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // Player poise (4 points) and stun, as in hurtP / the update switch (game.html 43415, 43439-43498, 43583-43588, 34333-34347, 27924).
    // Web values kept as they are: pStun lasts ~~(240*(1-min(.5,ccRes+stunRes))) frames (docs 2_3 says 480 / 300: the code is the baseline), a non-DOT hit sets
    // iframes to 0 (no 30-frame protection), the failed-parry stun sets iframes 60, and `(poise||4)-1` turns a 0 poise into 3.
    // Compared with the original statement blocks (executed in a Node VM) by Tools/dash-parry-oracle.
    public static class PlayerPoise
    {
        public const int MaxPoise = 4;
        public const double StunBaseFrames = 240, StunResistCap = .5, StaggerFrames = 6, PStunHitStop = 5, FailedParryStunIframes = 60;
        public const double EscapeIframes = 30, NaturalEndIframes = 60;

        // _isFocusState(): stun / stagger immune skills
        public static bool IsFocusState(string s)
        {
            return s == "sBlock" || s == "peaceShield" || s == "whirlwind" || s == "beam" || s == "burstLoop" || s == "charge" || s == "bowDraw" || s == "rainLightning";
        }
        // ~~(240*(1-min(.5,ccRes+stunRes)))
        public static int StunFrames(double ccRes, double stunRes) { return Js.Int(StunBaseFrames * (1 - Math.Min(StunResistCap, ccRes + stunRes))); }

        public struct State { public string S; public double Poise, PoiseR, St2, Iframes; }
        public struct HitResult { public State Player; public double HitStop; }

        // hurtP tail (43583-43588): DOT hits only clear iframes; other hits clear iframes and cost one poise point unless focused / already stunned.
        public static HitResult OnHit(State p, bool dot, bool kiCharging, double ccRes, double stunRes, double optHitStop, double hitStopBefore)
        {
            var r = new HitResult { Player = p, HitStop = hitStopBefore };
            if (dot) { r.Player.Iframes = 0; return r; }
            r.Player.Iframes = 0;
            if (!IsFocusState(p.S) && p.S != "pStun")
            {
                r.Player.Poise = Math.Max(0, Js.Or(p.Poise, 4) - 1); r.Player.PoiseR = 0;
                if (r.Player.Poise <= 0)
                {
                    r.Player.Poise = 0; r.Player.S = "pStun"; r.Player.St2 = StunFrames(ccRes, stunRes);
                    r.HitStop = Js.Int(PStunHitStop * optHitStop / 100);
                }
                else if (p.S != "kiGather" && p.S != "sDraw" && !kiCharging) { r.Player.S = "stagger"; r.Player.St2 = StaggerFrames; }
            }
            return r;
        }

        public struct BlockInput { public string S; public double SbParryT, Dmg, Poise, PGuard, ShieldBlockDR, CcRes, StunRes, ParryBank, ParryT; public bool Dot, RedBean, Detonate; }
        public struct BlockResult
        {
            public double Dmg, Poise, PoiseR, St2, Iframes, SbParryT, ParryBank, KbMagnitude, Shake;
            public string S; public bool ReachedDamage;   // false = the branch returned early (parry succeeded)
            public int DoParryCalls; public bool DetonateBlast;
        }
        // hurtP shield branches (43442-43497): release parry, peace shield, Q hold. Early return = a successful parry (damage 0, doParry(0,..,true)).
        // A failed parry (window over, still holding): absorb x0.5 capped at .25, damage x1.3, one poise point (focus keeps it at 1), knock-back 5 / shake 8.
        public static BlockResult ShieldBranch(in BlockInput i)
        {
            var r = new BlockResult { Dmg = i.Dmg, Poise = i.Poise, PoiseR = 3, St2 = 0, Iframes = 0, SbParryT = i.SbParryT, ParryBank = i.ParryBank, S = i.S, Shake = double.NaN, ReachedDamage = true };
            // release parry: sBlock was let go and the 12-frame window is still open
            if (i.S != "sBlock" && i.SbParryT > 0 && !i.Dot && !i.RedBean)
            {
                r.SbParryT = 0; r.Dmg = 0; r.DoParryCalls = 1;
                if (i.Detonate) { r.ParryBank = i.ParryBank + 100; if (i.ParryT >= 120) r.DetonateBlast = true; }
                r.ReachedDamage = false; return r;
            }
            bool peace = i.S == "peaceShield", hold = i.S == "sBlock";
            if (peace || hold)
            {
                if (i.SbParryT > 0 && !i.Dot && !i.RedBean)
                {
                    r.SbParryT = 0; r.Dmg = 0; r.DoParryCalls = 1;
                    if (hold && i.Detonate) r.ParryBank = i.ParryBank + 100;
                    r.ReachedDamage = false; return r;
                }
                bool failed = i.SbParryT <= 0 && !i.Dot;
                double blkBase = (ParryRules.GuardAbsorb(i.PGuard, i.ShieldBlockDR) + ParryRules.ShieldBlock()) * (i.Dot ? .5 : 1);
                double blkRate = Math.Min(failed ? .25 : .50, failed ? blkBase * .5 : blkBase);
                double rawDmg = i.Dmg;
                double dmg = Math.Max(1, Js.Int(i.Dmg * (1 - blkRate)));
                if (failed)
                {
                    dmg = Js.Int(dmg * 1.3);
                    r.Poise = Math.Max(0, Js.Or(i.Poise, 4) - 1); r.PoiseR = 0;
                    if (r.Poise <= 0)
                    {
                        r.Poise = 0;
                        if (IsFocusState(i.S)) r.Poise = 1;
                        else { r.S = "pStun"; r.St2 = StunFrames(i.CcRes, i.StunRes); r.Iframes = FailedParryStunIframes; }
                    }
                }
                if (i.Detonate) r.ParryBank = i.ParryBank + (rawDmg - dmg);
                r.KbMagnitude = failed ? 5 : 3; r.Shake = failed ? 8 : 4; r.Dmg = dmg;
            }
            return r;
        }

        public struct EscapeInput { public string S; public double St2; public bool JustCharge, JustParry, JustSkill7, ShiftHeld, DashHold, HarpActive, DashActive, CanBladeDash, HasBladeDashTrigger, SeaParalyzed; }
        public struct EscapeResult { public string S; public double St2, Iframes, Poise, PoiseR; public bool BladeDash, ConsumedTrigger; }
        // update switch cases 'stagger' / 'pStun' (34333-34347): escape skills end the state early; pStun escapes restore poise 4.
        public static EscapeResult Escape(in EscapeInput i)
        {
            var r = new EscapeResult { S = i.S, St2 = i.St2, Iframes = 0, Poise = 0, PoiseR = 9 };
            bool shiftChain = i.ShiftHeld && (i.DashHold || i.HarpActive || i.DashActive);
            bool bd = i.HasBladeDashTrigger && i.CanBladeDash && !i.SeaParalyzed;
            if (i.S == "stagger")
            {
                if (i.JustCharge || shiftChain) { r.S = "idle"; r.St2 = 0; return r; }
                if (i.JustParry) { r.S = "idle"; r.St2 = 0; return r; }
                if (i.JustSkill7) { r.S = "idle"; r.St2 = 0; return r; }
                if (bd) { r.St2 = 0; r.BladeDash = true; r.ConsumedTrigger = true; return r; }
                if (r.St2 <= 0) r.S = "idle";
                return r;
            }
            if (i.S == "pStun")
            {
                if (i.JustCharge || shiftChain) { r.S = "idle"; r.Iframes = EscapeIframes; r.Poise = MaxPoise; r.PoiseR = 0; return r; }
                if (i.JustSkill7) { r.S = "idle"; r.Iframes = EscapeIframes; r.Poise = MaxPoise; r.PoiseR = 0; return r; }
                if (bd) { r.Poise = MaxPoise; r.PoiseR = 0; r.BladeDash = true; r.ConsumedTrigger = true; return r; }
                if (r.St2 <= 0) { r.S = "idle"; r.Iframes = NaturalEndIframes; r.Poise = MaxPoise; r.PoiseR = 0; }
            }
            return r;
        }
    }
}
