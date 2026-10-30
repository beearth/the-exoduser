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
    }

    public sealed partial class DruidBoss
    {
        readonly IBossReflectHost reflectHost;

        static ReflectProjectile ToReflect(BossProjectile p)
        {
            return new ReflectProjectile { X = p.X, Y = p.Y, Vx = p.Vx, Vy = p.Vy, Dmg = p.Dmg, Life = p.Life, Ml = p.Ml, El = p.El, Sz = p.Sz, R = p.R, Col = p.Col, ParryClass = p.ParryClass,
                FbEnergy = p.FbEnergy, FdEnergy = p.FdEnergy, Mine = p.Mine, BlackBean = p.BlackBean, Friendly = p.Friendly, Web = p.Web, ElemBall = p.ElemBall, FireMagic = p.FireMagic, RedBean = p.RedBean, WaterBean = p.WaterBean, TitanEye = p.TitanEye, BwBean = p.BwBean, GbBean = p.GbBean,
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
            if (Remodel) return false;                   // RM-B1 (boss-battle lead 2026-10-28): the only remodel bullet move, #5 spore fan, is not parryable (spec §3), so no remodel bullet is turned around
            if (p.Friendly || p.Mine) return false;
            double pd = Math.Min(Dst(px, py, p.X, p.Y), SegDist(ox, oy, nx, ny, px, py));
            if (pd > 400) return false;                  // the web skips the whole collision part beyond 400 px (the Q band is checked below)
            var rp = ToReflect(p);
            var inp = reflectHost.ReflectInput(pd);
            var res = ParryReflect.Resolve(rp, inp);
            if (res.Outcome != ReflectOutcome.Reflect) return false;
            FromReflect(rp, p);
            reflectHost.PayReflectParry(res);
            return true;
        }

        void ReflectHoming(BossProjectile p)
        {
            if (!p.BlueBean || !p.Homing) return;
            var rp = ToReflect(p);
            if (reflectHost.ReflectHoming(rp)) { p.Vx = rp.Vx; p.Vy = rp.Vy; }
        }

        bool ReflectContact(BossProjectile p) { return reflectHost.ReflectContact(ToReflect(p)); }
    }
}
