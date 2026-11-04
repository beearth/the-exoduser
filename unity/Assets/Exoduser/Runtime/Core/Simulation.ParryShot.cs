using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // The five water shots of a Q-parried angler energy ball (web _splitParriedBigEnergy: _getPProj objects with magic, _parryMagicShot, r 8, kb 1, maxDist 900, pierce 0).
    // In the web they are PLAYER projectiles: the pProjs loop of update() (game.html 35624-36077) flies and hits with them. Here they stay in DruidBoss.Projectiles
    // (Friendly + ParryMagicShot) and DruidBoss.UpdateProjectiles hands every tick of them to TickParryShot. Compared with the web loop run as written by
    // Tools/parry-reflect-oracle section `parryShot`.
    // Not modelled (docs/8.0몬스터디자인/몬스터_공격시스템.md "남는 차이"): the _pprojFree pool (an empty pool gives a fresh _mkPProj object without _pierceRate = no pierce;
    // here the rate is always 50 + pierceFlat), the unique _uBowPierce (Core UEq is 0), worms / fire devils (no such field mobs in the Core), trails, particles, sound.
    public sealed partial class Simulation
    {
        public const double ParryShotRange = 900, ParryShotTurn = 0.7, ParryShotKnock = 1;   // maxDist / _turnSpd / p.kb
        public const int ParryShotBounceMax = 3, ParryShotBounceCool = 6, ParryShotStunBonus = 35;   // _maxBounce||3, _bounceCool, e.stunned += 35 on a weakness hit
        public const double ParryShotSplashBase = 45, ParryShotSplashMul = 0.5;                       // splR = 45 + r*3 + hel.splashR, splMul = .5 + hel.splashMul
        /// <summary>Test hook: replaces the hurtE calls of a parry shot (enemy, damage, angle, splash: false = the shot's own hit, true = magic splash). Null = the real ApplyEnemyDamage.</summary>
        public Action<EnemyState, int, double, bool> ParryShotHurt;
        public int ParryShotHits;   // monotonic: enemies / field bosses a parry shot touched (presentation, logs)

        // hurtE(e, dmg, ang, false, p, p.el) with the shot as opts (magic, no kbMult / poiseHit) and the splash hurtE(e2, sd, sa, false, {magic:true}, p.el): the same Core branch
        private void HurtByParryShot(EnemyState enemy, int damage, double angle, int el, bool splash)
        {
            if (ParryShotHurt != null) { ParryShotHurt(enemy, damage, angle, splash); return; }
            ApplyEnemyDamage(enemy, damage, (float)angle, false, 1, atkEl: el, magicHit: true);
        }

        // _parryMagicHitFx (presentation only): water = _addBoom 'waterImpact' r72, other elements _projHitFx
        private void ParryMagicHitFx(BossProjectile p)
        {
            ParryShotHits++;
            var h = BossFx; if (h != null) h("parryMagicHit", p.X, p.Y, 72);
        }

        // hm(): the equipped helmet's splash radius / ratio and magic pierce
        private void ParryShotHelmet(out double splashR, out double splashMul, out double magicPen)
        {
            var h = EquippedInventory != null ? EquippedInventory.GetEquipped("helmet") : null;
            splashR = h != null ? h.splashR : 0; splashMul = h != null ? h.splashMul : 0; magicPen = h != null ? h.magicPen : 0;
        }

        // One tick of one shot, in the order of the web loop. `index` = its position in the projectile list (the web `i` of (G._gcT+i)%2). true = the shot is gone.
        public bool TickParryShot(BossProjectile p, int index)
        {
            if (!p.ShotReady)
            {   // _getPProj -> _resetPProj: _pierceRate = 50 + _eqAffix('pierceFlat'), empty _hitSet, bounces 0, _bounceCool 0
                p.ShotReady = true; if (p.MaxDist <= 0) p.MaxDist = ParryShotRange;
                p.PierceRate = 50 + Crossbow.PierceFlat; p.Pierced = 0; p.Bounces = 0; p.BounceCool = 0;
                p.HitSet = new HashSet<EnemyState>(); p.HitFieldSet = new HashSet<FieldBossState>();
            }
            double spd = Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy);
            if (p.BounceCool > 0) p.BounceCool -= 1;
            // homing every 2nd frame toward the nearest enemy within 900 px not hit yet, then the field bosses (_parryMagicFieldTarget), 0.7 rad per frame
            if (!(p.BounceCool > 0) && spd > 0 && (TickCount + index) % 2 == 0)
            {
                double bestD = ParryShotRange, tx = 0, ty = 0; bool found = false;
                foreach (var e in ShQuery(p.X, p.Y, bestD, true))
                {
                    if (!e.Alive || p.HitSet.Contains(e)) continue;
                    double d = Dist(p.X, p.Y, e.X, e.Y); if (d < bestD) { bestD = d; tx = e.X; ty = e.Y; found = true; }
                }
                var fbs = FieldBosses;
                if (fbs != null) for (int k = 0; k < fbs.Length; k++)
                {
                    var m = fbs[k];
                    if (m == null || m.Asleep || !FieldBossCanHit(m) || p.HitFieldSet.Contains(m)) continue;
                    double mx, my; FieldBossXY(m, out mx, out my);
                    double d = Dist(p.X, p.Y, mx, my); if (d < bestD) { bestD = d; tx = mx; ty = my; found = true; }
                }
                if (found)
                {
                    double ta = Math.Atan2(ty - p.Y, tx - p.X), ca = Math.Atan2(p.Vy, p.Vx), da = ta - ca;
                    while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
                    double turn = Math.Min(Math.Abs(da), ParryShotTurn) * Math.Sign(da);
                    p.Vx = Math.Cos(ca + turn) * spd; p.Vy = Math.Sin(ca + turn) * spd;
                }
            }
            p.X += p.Vx; p.Y += p.Vy; p.Dist += spd;
            if (p.Dist > p.MaxDist) return true;                     // range end: gone (no blast)
            if (BoltWall(p.X, p.Y))
            {   // magic: up to 3 wall bounces (step back, escape up to 5 more steps, mirror by the blocked axis), the 4th wall ends it
                if (p.Bounces >= ParryShotBounceMax) return true;
                p.X -= p.Vx; p.Y -= p.Vy;
                for (int esc = 0; esc < 5 && BoltWall(p.X, p.Y); esc++) { p.X -= p.Vx; p.Y -= p.Vy; }
                bool hWall = BoltWall(p.X + p.Vx, p.Y), vWall = BoltWall(p.X, p.Y + p.Vy);
                if (hWall) p.Vx = -p.Vx; if (vWall) p.Vy = -p.Vy; if (!hWall && !vWall) { p.Vx = -p.Vx; p.Vy = -p.Vy; }
                p.Bounces++; p.BounceCool = ParryShotBounceCool;
            }
            // field bosses first: every angler the shot overlaps (hitR = r + 8) takes p.dmg; touching one ends the shot even when its hit cooldown swallowed the damage
            if (HurtFieldMobs(p.X, p.Y, (p.R != 0 ? p.R : 6) + 8, p.Dmg != 0 ? p.Dmg : 10, p.HitFieldSet, p)) return true;
            foreach (var e in ShQuery(p.X, p.Y, p.R + 20, true))
            {
                if (!e.Alive || p.HitSet.Contains(e)) continue;
                if (!(Dist(p.X, p.Y, e.X, e.Y) < e.Radius + p.R)) continue;
                double ang = Math.Atan2(e.Y - p.Y, e.X - p.X);
                double mult = EnemyHurt.ElMul(p.El, e.Web != null ? e.Web.el : null);
                int dmg = Js.Int(p.Dmg * mult);
                HurtByParryShot(e, dmg, ang, p.El, false);
                ParryMagicHitFx(p);
                // magic projectile knock-back on top of hurtE's own, and the weakness stun
                e.KnockbackX += (float)(Math.Cos(ang) * ParryShotKnock * mult); e.KnockbackY += (float)(Math.Sin(ang) * ParryShotKnock * mult);
                if (mult >= 2) e.Stunned += ParryShotStunBonus;
                // magic splash around the target: 45 + r*3 (+ helmet) px, p.dmg * (.5 + helmet) * elMul, no knock-back / stun
                double hSplashR, hSplashMul, hMagicPen; ParryShotHelmet(out hSplashR, out hSplashMul, out hMagicPen);
                double splR = ParryShotSplashBase + p.R * 3 + hSplashR, splMul = ParryShotSplashMul + hSplashMul;
                foreach (var e2 in ShQuery(e.X, e.Y, splR + 20, true))
                {
                    if (!e2.Alive || e2 == e) continue;
                    if (!(Dist(e.X, e.Y, e2.X, e2.Y) < splR + e2.Radius)) continue;
                    double sa = Math.Atan2(e2.Y - e.Y, e2.X - e.X), sm = EnemyHurt.ElMul(p.El, e2.Web != null ? e2.Web.el : null);
                    HurtByParryShot(e2, Js.Int(p.Dmg * splMul * sm), sa, p.El, true);
                }
                // helmet magic pierce (counts in the same _pierced, does not mark the enemy)
                if (hMagicPen > 0) { p.Pierced++; if (p.Pierced <= hMagicPen) continue; }
                // unified pierce: _pierceRate 50 = floor(50*91/1000) = 4 guaranteed passes, then 90 / 80 / ... % chance
                double rate = p.PierceRate;
                if (rate > 0)
                {
                    if (p.HitSet.Contains(e)) continue;
                    p.HitSet.Add(e); p.Pierced++;
                    int gtd = (int)Math.Floor(rate * 91 / 1000);
                    if (p.Pierced <= gtd) continue;
                    int ov = p.Pierced - gtd;
                    double sP = Math.Max(0, 1 - ov * 0.1);
                    if (sP > 0 && NextRandom() < sP) continue;
                }
                return true;   // used up (the web recycles it)
            }
            return false;
        }
    }
}
