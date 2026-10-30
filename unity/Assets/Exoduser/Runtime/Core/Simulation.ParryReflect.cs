using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // Parry reflection of enemy bullets for the simulation (ParryReflect.cs holds the rules, compared with the web by Tools/parry-reflect-oracle). Any enemy-bullet loop calls
    // ReflectInput -> ParryReflect.Resolve -> PayReflectParry; the reflected (friendly) bullet then uses ReflectHoming every tick and ReflectContact after moving.
    // Open: statInt() / statStr() are 1 here (the same stand-in as the E strike), the unique-item hooks (_uParrySplit, parry pierce) and the enemy poison DOT are not in the Core yet.
    public sealed partial class Simulation
    {
        public const double ReflectAimRange = 600;   // _parryHomingTarget: nearest living enemy to the player within 600 px

        public EnemyState NearestEnemy(double x, double y, double range)
        {
            EnemyState best = null; double bestD = range * range;
            for (int i = 0; i < Enemies.Count; i++)
            {
                var e = Enemies[i]; if (e == null || !e.Alive) continue;
                double dx = e.X - x, dy = e.Y - y, d2 = dx * dx + dy * dy;
                if (d2 < bestD) { bestD = d2; best = e; }
            }
            return best;
        }

        // the player's parry state for ParryReflect.Resolve; `playerDistance` is the sweep-corrected distance of the bullet (the caller measures it)
        public ParryReflect.ResolveInput ReflectInput(double playerDistance)
        {
            var i = new ParryReflect.ResolveInput
            {
                S = Player.State, St2 = Player.StateTicks, KiParryT = 0, SbParryT = SbParryT, SbReleaseR = SbReleaseR, Iframes = Player.Iframes, SBashChgMul = SBashChgMul, Detonate = Skills.Level("detonate"),
                MaliceSwipe = MaliceSwipeLevel, ShieldThrow = ShieldThrowLevel, BonusRange = 0, PParry = PParry, ParryBonus = ParryBonus, WRange = 0, WpBonusRange = 0, PR = Player.Radius, PX = Player.X, PY = Player.Y,
                IoActive = false, WhirlDet = false, PDist = playerDistance,
                Counter = new ParryRules.CounterInput { MeleeRef = MeleeReference(), StatStr = 1, PAtkMul = Config.DamageMultiplier, MagicRef = MagicReference(), StatInt = 1, PMagicMul = MagicDamageMultiplier() * .5, // 원문 pMagicMul(false): 패링 장비스케일에는 공격2배 제외
 PParry = PParry, ParryBonus = ParryBonus, LegShieldParry = 0 },
            };
            var tgt = NearestEnemy(Player.X, Player.Y, ReflectAimRange);
            if (tgt != null) { i.HasTarget = true; i.TargetX = tgt.X; i.TargetY = tgt.Y; }
            return i;
        }

        // doParry(dmg, x, y, false, el, mul, tag) of a reflection + P.parryBank (Q magic parry)
        public void PayReflectParry(in ParryReflect.ResolveResult r)
        {
            ApplyParrySuccess(false, r.ResourceMul, r.ParryEl);
            ParryBank += r.ParryBankAdd;
            ReflectCount++; LastReflectKind = r.Kind; LastReflectDamage = r.ParryDmg;
        }
        public int ReflectCount; public ReflectKind LastReflectKind; public double LastReflectDamage;

        // blue-bean steering: nearest living enemy within 400 px of the bullet
        public bool ReflectHoming(ReflectProjectile p)
        {
            var t = NearestEnemy(p.X, p.Y, ParryReflect.HomingRange);
            if (t == null) return false;
            ParryReflect.HomingTurn(p, t.X, t.Y, 1);
            return true;
        }

        readonly List<ParryReflect.BlastHit> reflectHits = new List<ParryReflect.BlastHit>();
        // a friendly bullet that touches an enemy blasts: every enemy inside is hurt as a blue bean (magic, poise hit, knock-back x2) and shoved away; true = the bullet is used up
        public bool ReflectContact(ReflectProjectile p)
        {
            int n = Enemies.Count; var targets = new ParryReflect.BlastTarget[n];
            for (int k = 0; k < n; k++) { var e = Enemies[k]; targets[k] = new ParryReflect.BlastTarget { X = e.X, Y = e.Y, R = e.Radius, Alive = e != null && e.Alive }; }
            if (!ParryReflect.Blast(p, targets, 0, reflectHits)) return false;
            var snapshot = reflectHits.ToArray();
            for (int h = 0; h < snapshot.Length; h++)
            {
                var e = Enemies[snapshot[h].Index];
                HurtEnemyBlueBean(e, snapshot[h].Damage, (float)snapshot[h].Angle, p.ParryBlueBean);
                e.KnockbackX += (float)snapshot[h].KbX; e.KnockbackY += (float)snapshot[h].KbY;
            }
            ReflectHitCount += snapshot.Length;
            return true;
        }
        public int ReflectHitCount;

        // hurtE(e, dmg, ang, true, {kbMult:2, magic:true, blueBean:true, parryBlueBean}, el): a boss takes at least 10 % of its max HP from a parried bean
        public void HurtEnemyBlueBean(EnemyState enemy, int damage, float angle, bool parryBlueBean)
        {
            ApplyEnemyDamage(enemy, damage, angle, true, 2, false, false, 0, 0, false, 0, false, true, parryBlueBean, true);
        }
    }
}
