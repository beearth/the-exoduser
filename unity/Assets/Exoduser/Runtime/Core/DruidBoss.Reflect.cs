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
                Mine = p.Mine, BlackBean = p.BlackBean, Friendly = p.Friendly, Web = p.Web, ElemBall = p.ElemBall, FireMagic = p.FireMagic, RedBean = p.RedBean, WaterBean = p.WaterBean, TitanEye = p.TitanEye, BwBean = p.BwBean, GbBean = p.GbBean,
                BlueBean = p.BlueBean, ParryBlueBean = p.ParryBlueBean, Magic = p.Magic, Homing = p.Homing, FromRainbow = p.FromRainbow, DruidStraight = p.DruidStraight, AoeR = p.AoeR, AoeDmg = p.AoeDmg };
        }

        static void FromReflect(ReflectProjectile r, BossProjectile p)
        {
            p.Vx = r.Vx; p.Vy = r.Vy; p.Dmg = r.Dmg; p.Life = r.Life; p.Ml = r.Ml; p.Col = r.Col; p.Friendly = r.Friendly; p.RedBean = r.RedBean; p.WaterBean = r.WaterBean; p.TitanEye = r.TitanEye; p.BwBean = r.BwBean; p.GbBean = r.GbBean;
            p.BlueBean = r.BlueBean; p.ParryBlueBean = r.ParryBlueBean; p.Magic = r.Magic; p.Homing = r.Homing; p.FromRainbow = r.FromRainbow; p.ElemBall = r.ElemBall; p.AoeR = r.AoeR; p.AoeDmg = r.AoeDmg;
        }

        // The web Q centre consumes without rewards; a physical-mouth Q error hurts with redBean:true. Other Consumed effects remain separate.
        // true means handled; only an active reflected bullet stays in the list.
        bool TryHandleProjectile(BossProjectile p, in ParryReflect.ResolveInput inp)
        {
            if (Remodel) return false;                   // RM-B1 (boss-battle lead 2026-10-28): the only remodel bullet move, #5 spore fan, is not parryable (spec §3), so no remodel bullet is turned around
            if (p.Friendly) return false;
            var rp = ToReflect(p);
            var res = ParryReflect.Resolve(rp, inp);
            if(res.Outcome==ReflectOutcome.Absorb){p.Active=false;return true;}
            if(res.Outcome==ReflectOutcome.Consumed&&p.BlackBean&&host is IBossRainbowContactHost rainbowHost){rainbowHost.RainbowContact(p);p.Active=false;return true;}
            if(res.Outcome==ReflectOutcome.Consumed&&ParryRules.IsPhysicalMouthProjectile(rp.Flags)&&inp.S=="sBlock"&&inp.SbParryT>0&&inp.PDist<ParryReflect.WrongInputRadius&&inp.Iframes<=0&&!inp.IoActive)
            {
                HurtProjectile(I(p.Dmg),true,true,p.DruidPoison,true);host.PIframes=3;RmText(p.X,p.Y-15,"E키로! -"+I(p.Dmg),"#eeeeee",50);p.Active=false;return true;
            }
            if(res.Outcome==ReflectOutcome.Consumed&&p.RedBean&&ParryRules.ProjectileParryClass(rp.Flags)==ParryRules.ProjClass.Physical&&inp.S=="sBlock"&&inp.SbParryT>0&&inp.PDist<ParryReflect.WrongInputRadius&&inp.Iframes<=0&&!inp.IoActive)
            {
                HurtProjectile(I(p.Dmg),true,true,p.DruidPoison,true);
                if(host is IBossRedBeanWrongInputHost wrongHost)wrongHost.RedBeanWrongInput(p.Dmg,p.X,p.Y);
                host.PIframes=3;
                double angle=Atan2(host.PY-p.Y,host.PX-p.X);host.KnockPlayer(Cos(angle)*6,Sin(angle)*6);
                RmText(p.X,p.Y-15,"E키로! -"+I(p.Dmg),"#ff4444",50);host.Shake(12);host.Fx("red-bean-wrong-input",p.X,p.Y,100);
                p.Active=false;return true;
            }
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
