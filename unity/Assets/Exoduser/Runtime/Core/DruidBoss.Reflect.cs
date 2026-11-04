using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // What the druid bullets need from the simulation to be parried back (ParryReflect.cs). Optional: a host that does not implement it (the druid-boss-oracle host) keeps the old
    // behaviour, a parried bullet is absorbed by the hurt path.
    public interface IBossReflectHost
    {
        ParryReflect.ResolveInput ReflectInput(double playerDistance);        // the player's parry state + the nearest enemy (the aim) for one bullet
        void PayReflectParry(in ParryReflect.ResolveResult result);           // doParry(dmg, x, y, false, el, mul, tag) + P.parryBank
        bool ReflectHoming(ReflectProjectile p);                              // blue-bean steering toward the nearest enemy within 400 px (changes velocity)
        bool ReflectContact(ReflectProjectile p);                             // a friendly bullet meets an enemy: blast, true = used up
        bool TickParryShot(BossProjectile p, int index);                      // one tick of a Q-split angler water shot (web player projectile loop): true = the shot is gone
    }

    public interface IBossEnergyHost
    {
        void EnergyContact(BossProjectile p, int damage); // no E parry; directional 100px slide survives dodge
    }

    public sealed partial class DruidBoss
    {
        readonly IBossReflectHost reflectHost;

        static ReflectProjectile ToReflect(BossProjectile p)
        {
            return new ReflectProjectile { X = p.X, Y = p.Y, Vx = p.Vx, Vy = p.Vy, Dmg = p.Dmg, Life = p.Life, Ml = p.Ml, El = p.El, Sz = p.Sz, R = p.R, Col = p.Col, ParryClass = p.ParryClass,
                FbEnergy = p.FbEnergy, ParryMagicShot = p.ParryMagicShot,
                Mine = p.Mine, BlackBean = p.BlackBean, Friendly = p.Friendly, Web = p.Web, ElemBall = p.ElemBall, FireMagic = p.FireMagic, RedBean = p.RedBean, WaterBean = p.WaterBean, TitanEye = p.TitanEye, BwBean = p.BwBean, GbBean = p.GbBean,
                BlueBean = p.BlueBean, ParryBlueBean = p.ParryBlueBean, Magic = p.Magic, Homing = p.Homing, FromRainbow = p.FromRainbow, DruidStraight = p.DruidStraight, AoeR = p.AoeR, AoeDmg = p.AoeDmg };
        }

        static void FromReflect(ReflectProjectile r, BossProjectile p)
        {
            p.Vx = r.Vx; p.Vy = r.Vy; p.Dmg = r.Dmg; p.Life = r.Life; p.Ml = r.Ml; p.Col = r.Col; p.Friendly = r.Friendly; p.RedBean = r.RedBean; p.WaterBean = r.WaterBean; p.TitanEye = r.TitanEye; p.BwBean = r.BwBean; p.GbBean = r.GbBean;
            p.BlueBean = r.BlueBean; p.ParryBlueBean = r.ParryBlueBean; p.Magic = r.Magic; p.Homing = r.Homing; p.FromRainbow = r.FromRainbow; p.ElemBall = r.ElemBall; p.AoeR = r.AoeR; p.AoeDmg = r.AoeDmg;
        }

        // an enemy bullet reached the player's parry reach: if the web would turn it around (E strike / Q parry), do it. Returns true when the bullet was reflected (it stays in the list).
        bool TryReflect(BossProjectile p, double px, double py, double pr, double ox, double oy, double nx, double ny)
        {
            // RM-B1 (boss-battle lead 2026-10-28): the only remodel bullet move, #5 spore fan, is not parryable (spec §3), so no remodel bullet is turned around;
            // the field angler's energy ball keeps its Q terminal even when the druid remodel flag is on
            if (Remodel && !p.FbEnergy) return false;
            if (p.Friendly || p.Mine) return false;
            double pd = Math.Min(Dst(px, py, p.X, p.Y), SegDist(ox, oy, nx, ny, px, py));
            if (p.FbEnergy) pd = SegDist(ox - previousPlayerX, oy - previousPlayerY, nx - px, ny - py, 0, 0);
            if (pd > 400 && !p.FbEnergy) return false;   // the web skips the collision part of an ordinary bullet beyond 400 px; a big energy ball is never skipped (!_bigBall), Resolve checks its own reach (Q charge release up to 500)
            var rp = ToReflect(p);
            var inp = reflectHost.ReflectInput(pd);
            var res = ParryReflect.Resolve(rp, inp);
            if (p.FbEnergy) {
                if (res.Outcome == ReflectOutcome.BigEnergyParry) {
                    AddParryShots(rp, res.ParryDmg, p.Col);
                    reflectHost.PayReflectParry(res); p.Active = false; return true;
                }
                if (res.Outcome == ReflectOutcome.BigEnergyHit) {
                    if (host.PIframes <= 0 && inp.S != "charge")
                        (host as IBossEnergyHost)?.EnergyContact(p, I((p.Dmg != 0 ? p.Dmg : 10) * (ElementMul != null ? ElementMul(p.El) : 1)));
                    host.Fx("waterEnergy", p.X, p.Y, 220); p.Active = false; return true;
                }
                if (res.Outcome == ReflectOutcome.Absorb) { p.Active = false; return true; }
                return false;
            }
            if (res.Outcome != ReflectOutcome.Reflect) {
                bool q=inp.S=="sBlock"&&inp.SbParryT>0;bool e=inp.S=="sBash"&&inp.St2>4;
                bool wrong=host.PIframes<=0&&pd<100&&((q&&p.ParryClass=="physical")||(e&&(p.ParryClass!="physical"||p.BlackBean)));
                if(wrong&&!p.WrongInputCounted){p.WrongInputCounted=true;(host as ICombatDamageTelemetry)?.WrongParryInput();}return false;
            }
            FromReflect(rp, p);
            reflectHost.PayReflectParry(res);
            return true;
        }

        // _splitParriedBigEnergy: the five shots join the list as friendly ParryMagicShot projectiles. In the web they are player projectiles (pProjs), so UpdateProjectiles hands
        // their whole tick (homing, flight, wall bounce, field-boss / enemy hit, splash, pierce) to the host's TickParryShot (Simulation.ParryShot.cs). Life / Ml are not used by it.
        public void AddParryShots(ReflectProjectile ball, double totalDamage, string col)
        {
            foreach (var shot in ParryReflect.SplitBigEnergy(ball, totalDamage)) {
                var b = new BossProjectile { X = shot.X, Y = shot.Y, Vx = shot.Vx, Vy = shot.Vy, Dmg = shot.Dmg, El = (int)shot.El, R = shot.R, Sz = 1, Life = 180, Ml = 180, MaxDist = shot.MaxDist,
                    Friendly = true, Magic = true, ParryMagicShot = true, ParryClass = "magic", Col = col };
                Projectiles.Add(b); Spawned++; OnSpawn?.Invoke(b);
            }
        }

        void ReflectHoming(BossProjectile p)
        {
            if (!p.BlueBean || !p.Homing) return;
            var rp = ToReflect(p);
            if (reflectHost.ReflectHoming(rp)) { p.Vx = rp.Vx; p.Vy = rp.Vy; }
        }

        bool ReflectContact(BossProjectile p) { return reflectHost.ReflectContact(ToReflect(p)); }

        // _bigEnergyWallContact: center + eight perimeter samples, swept in <=12px steps.
        bool EnergyWallContact(BossProjectile p, double ox, double oy, double nx, double ny)
        {
            double radius = Math.Max(p.R != 0 ? p.R : 16, p.Sz != 0 ? p.Sz : 48);
            double step = Math.Max(4, Math.Min(12, radius * .25));
            int count = Math.Max(1, (int)Math.Ceiling(Dst(ox, oy, nx, ny) / step));
            double lastX = ox, lastY = oy;
            for (int k = 0; k <= count; k++) {
                double x = ox + (nx - ox) * k / count, y = oy + (ny - oy) * k / count;
                bool blocked = host.IsWall(x, y);
                for (int j = 0; !blocked && j < 8; j++) {
                    double a = Math.PI * 2 * j / 8; blocked = host.IsWall(x + Math.Cos(a) * radius, y + Math.Sin(a) * radius);
                }
                if (blocked) { p.X = lastX; p.Y = lastY; host.Fx("waterEnergy", p.X, p.Y, 220); return true; }
                lastX = x; lastY = y;
            }
            return false;
        }
    }
}
