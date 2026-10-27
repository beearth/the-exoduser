using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // Web enemy poise / groggy rules (game.html _poiseHit 19974, _poiseReset 20002, hurtE poise amount 42488-42491 and poiseMult default 42268, groggy x1.5 42338,
    // timer / groggy end block 34451-34456, 38618-38638, poise regeneration 38663-38666). Poise starts equal to max HP (31166).
    // This file does NOT replace the Codex enemy poise in Core/Simulation.cs; it carries the web formulas for the later connection step. Differences with the existing
    // Simulation code are listed in docs/engine/UNITY_B07_CORE_20261026.md.
    public static class EnemyPoiseRules
    {
        public const double BossGroggyFrames = 90, NormalGroggyFrames = 180, StunCap = 180, BossImmuneFrames = 300, MiniStun = 60, FullStun = 180, GroggySlowMo = 20;
        public const double GroggyDamageMul = 1.5, BossResistPhysical = 0.5, BossResistElemental = 0.2, OrdinaryRegenTicks = 200, OrdinaryRegenFraction = 0.15, ShieldBashBossFraction = 0.15;

        public struct Enemy
        {
            public bool Alive, Boss; public double Poise, MaxPoise, PoiseR, Stunned, MaxStunned, PImmune, HitStun, StunImmune;
            public string S; public double St2, TeleDropY;
        }
        public struct HitResult { public Enemy Enemy; public bool Broke; public double SlowMo; }

        // _poiseHit(e,amt): false when dead / amt<=0 / boss immune; poise<=0 -> groggy (boss 90f + immunity 300f, normal 180f), slow motion unless hit-stop is suppressed
        public static HitResult PoiseHit(Enemy e, double amt, double noHitStopT, double slowMoBefore)
        {
            var r = new HitResult { Enemy = e, SlowMo = slowMoBefore };
            if (!e.Alive || amt <= 0) return r;
            if (e.Boss && e.PImmune > 0) return r;
            r.Enemy.Poise = e.Poise - amt; r.Enemy.PoiseR = 0;
            if (r.Enemy.Poise <= 0)
            {
                r.Enemy.Poise = 0;
                double stunT = e.Boss ? BossGroggyFrames : NormalGroggyFrames;
                r.Enemy.Stunned = Math.Max(e.Stunned, stunT);
                r.Enemy.MaxStunned = Math.Max(e.MaxStunned, stunT);
                if (e.Boss) r.Enemy.PImmune = BossImmuneFrames;
                if (!(noHitStopT > 0)) r.SlowMo = GroggySlowMo;
                r.Broke = true;
            }
            return r;
        }
        // _poiseReset(e)
        public static Enemy PoiseReset(Enemy e) { e.Poise = e.MaxPoise; e.PoiseR = 0; return e; }

        // hurtE: poise damage of one hit. Returns false when the hit does not touch poise (DOT, no poiseHit option, boss currently immune).
        public static bool PoiseAmount(double dmg, double poiseMult, bool boss, double atkEl, bool dot, bool poiseHit, double bossImmuneFrames, double staggerBns, out double amt)
        {
            amt = 0;
            if (dot || !poiseHit || (boss && bossImmuneFrames > 0)) return false;
            amt = Js.Int(dmg * poiseMult);
            if (boss) amt = Js.Int(amt * (atkEl > 0 ? BossResistElemental : BossResistPhysical));
            if (staggerBns > 0) amt += Js.Int(staggerBns);
            return true;
        }
        // `psM = opts.poiseMult !== undefined ? opts.poiseMult : 1.0`
        public static double PoiseMultDefault(double? optsPoiseMult) { return optsPoiseMult ?? 1.0; }
        // stunned (groggy) targets take +50 percent from non-DOT hits
        public static double GroggyDamage(double stunned, double dmg, bool dot) { return stunned > 0 && !dot ? Js.Int(dmg * GroggyDamageMul) : dmg; }

        // timers of the update loop (34451-34456) followed by the stun block and ordinary poise regeneration of updateE (38618-38638, 38663-38666), one frame.
        public static Enemy Frame(Enemy e, double sp)
        {
            if (e.Stunned > 0) e.Stunned -= sp;
            if (e.HitStun > 0) e.HitStun -= sp;
            if (e.StunImmune > 0) e.StunImmune -= sp;
            if (e.PImmune > 0) e.PImmune -= sp;
            if (e.Stunned <= 0 && e.MaxStunned != 0)
            {
                e.MaxStunned = 0;
                if (e.Boss) { e = PoiseReset(e); e.PImmune = Math.Max(e.PImmune, BossImmuneFrames); e.S = "idle"; e.St2 = 30; e.TeleDropY = 0; }
            }
            // updateE
            if (e.HitStun > 0) return e;
            if (e.Stunned > 0)
            {
                if (e.Stunned > StunCap) e.Stunned = StunCap;
                if (e.MaxStunned == 0 || e.MaxStunned < e.Stunned) e.MaxStunned = e.Stunned;
                if (e.Stunned <= 0)
                {
                    e.Stunned = 0; e.MaxStunned = 0; e = PoiseReset(e);
                    if (e.Boss) { e.PImmune = Math.Max(e.PImmune, BossImmuneFrames); e.S = "idle"; e.St2 = 30; e.TeleDropY = 0; }
                }
                return e;
            }
            if (!e.Boss && e.Poise < e.MaxPoise)
            {
                e.PoiseR += sp;
                if (e.PoiseR >= OrdinaryRegenTicks) { e.Poise = Math.Min(e.MaxPoise, e.Poise + Js.Int(e.MaxPoise * OrdinaryRegenFraction)); e.PoiseR = 0; }
            }
            return e;
        }
    }
}
