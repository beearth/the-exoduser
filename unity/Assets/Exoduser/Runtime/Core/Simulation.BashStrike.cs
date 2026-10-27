using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // PC-B07b: the E strike (sBash) hits. Web sBash branch (33498+): at the strike moment (st2 crosses 12, the 8th frame after sBash starts) the player swings
    // `_gSlamHit(P.facing, _eSwingRadius(chg), PI*.8, _gsDmg2, wp().el, 1.5, .8)`: a circle (the arc argument is unused in the web too) of radius 70 x range multiplier x charge,
    // damage 200 % melee (+21 %/Lv of 칼등 처내기) x charge multiplier, every enemy inside gets hurtE (no poise damage of its own, knock-back x1.5 + 8 px), and the same enemies
    // get a boss poise hit (25 % of max poise) or an ordinary enemy a 60 f mini stun / full stun when its poise is gone. Formulas: ParryRules.BashDamage / SlamHitTarget
    // (dash-parry-oracle sections bashDamage + slamHit run the original `_gsDmg2` line and `_gSlamHit` function). kiGather release is the same strike with the charge multiplier.
    public sealed partial class Simulation
    {
        public int BashStrikeCount, BashHitCount; public double ParryBank;   // P.parryBank: damage absorbed / countered by parries (the detonate / whirlDet fusions spend it)

        private bool BashStrikeMoment { get { return Player.State == "sBash" && ParryRules.SBashStrikes(Player.StateTicks, 1); } }

        private void BashStrike()
        {
            double chg = ParryRules.ClampChargeMul(SBashChgMul);
            double range = ParryRules.SwingRadius(0, MaliceSwipeLevel, ShieldThrowLevel, chg);
            double raw = ParryRules.BashDamage(MeleeReference(), MaliceSwipeLevel, 1, 1, chg, attackBonus); attackBonus = 0;   // statStr() = pShieldMul() = 1
            BashStrikeCount++;
            double dmg = ParryRules.SlamBaseDamage(raw, Config.DamageMultiplier, 0);   // _gSlamHit: ~~(dmg*pAtkMul())+(P._atkBon||0), the bonus was just consumed
            foreach (var e in ShQuery(Player.X, Player.Y, range + 20))
            {
                if (!e.Alive) continue;
                var web = e.Web ?? SyncToWeb(e);
                double d = Distance(Player.X, Player.Y, e.X, e.Y), mult = EnemyHurt.ElMul(0, web.el);
                var probe = ParryRules.SlamHitTarget(new ParryRules.SlamTargetIn { D = d, R = e.Radius, Mult = mult, Boss = e.IsBoss, Poise = e.Poise, MaxPoise = e.MaxPoise, Stunned = e.Stunned }, range, 0, dmg, false, GiantSlamLevel > 0 ? GiantSlamLevel : Math.Max(1, Skills.Level("giantSlam")));
                if (!probe.Targeted) continue;
                float ang = (float)Math.Atan2(e.Y - Player.Y, e.X - Player.X);
                if (probe.Hurt)
                {
                    BashHitCount++;
                    ApplyEnemyDamage(e, (int)probe.Dmg, ang, false, 1.5f, false, false, 0, 0, false, 0);
                    e.KnockbackX += (float)Math.Cos(ang) * 8; e.KnockbackY += (float)Math.Sin(ang) * 8;
                    if (!e.Alive) continue;   // killed by the damage: the stun part is skipped
                }
                var r = ParryRules.SlamHitTarget(new ParryRules.SlamTargetIn { D = d, R = e.Radius, Mult = mult, Boss = e.IsBoss, Poise = e.Poise, MaxPoise = e.MaxPoise, Stunned = e.Stunned }, range, 0, dmg, false, GiantSlamLevel > 0 ? GiantSlamLevel : Math.Max(1, Skills.Level("giantSlam")));
                if (r.BossPoise) PoiseHitEnemy(e, r.BossPoiseAmt);
                else
                {
                    e.Stunned = (float)r.Stunned; e.Poise = (float)r.Poise;
                    var w = e.Web ?? SyncToWeb(e); w.stunned = e.Stunned; w.poise = e.Poise;
                    if (r.Break) RaisePlayerText(e.X, e.Y - 18, "체간 붕괴!", "#ffcc00", 45);
                    else if (r.Mini) RaisePlayerText(e.X, e.Y - 18, "미니스턴!", "#ffaa00", 30);
                }
                if (r.Weak) RaisePlayerText(e.X, e.Y - 28, "약점!", "#bbbbbb", 38);
            }
            HurtShake(10);   // shake(10) of the strike, then _gSlamHit's own shake(18)
            HurtShake(18);
            SlamWaves.Add(new SlamWave { Id = nextWaveId++, X = Player.X, Y = Player.Y, MaxR = (float)(range * 1.6), MaxT = 35, Bash = true });
        }
    }
}
