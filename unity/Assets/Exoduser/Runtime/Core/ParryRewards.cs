using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // doParry() numeric outcome (game.html 38472-38577): invulnerability, HP/ST/MP recovery, poise +1, mobility gauge, rage, malice, hit stop / slow motion / shake.
    // Everything else doParry does (sound, particles, pet/unique hooks, the 분노스킬 cooldown refunds `_gslCd`/`_scCd`, parryExplosion AoE) is presentation or a later step.
    // Equipment / passive values are arguments. Compared with the original function (executed whole in a Node VM) by Tools/dash-parry-oracle.
    public static class ParryRewards
    {
        public const double HitStopParry = 6, HitStopParryReflect = 7;   // _HS.parry / _HS.parryReflect (8677)
        public const double SlowMoFrames = 25, ShakeParry = 14, ShakeDetonateCharge = 6;
        public const double BaseRecovery = 50, InvulnerableFrames = 25;

        public struct Input
        {
            // situation
            public string PlayerState; public bool ForceQ; public double SbParryT;
            public string ParryEl;            // "red" (red bean), "rainbow", or any other value / null (normal)
            public double ResourceMul;        // _physicalProjectileMultiplier: 3 for enemy physical bullets, 10 for big energy balls, 0/1 otherwise
            public bool LessonActive;         // parry lesson: no hit stop / slow motion
            public double Detonate, ParryT;   // P.skills.detonate (truthy) and P.parryT (>0 while charging the detonation arm)
            // equipment / passives
            public double ParryBonus, PRegen, ShieldRageUnique;
            // options (percent, 100 = default)
            public double OptHitStop, OptShake;
            // player values before
            public double Iframes, Hp, Mhp, St, Mst, Mp, Mmp, Poise, MaxPoise, Rage, RageMax, Mats, HarpGauge, HarpGaugeMax;
            public double HitStop, SlowMo, Shake;      // current G values (kept when doParry does not assign them)
        }
        public struct Result
        {
            public double Iframes, Hp, St, Mp, Poise, Rage, Mats, HarpGauge, HitStop, SlowMo, Shake;
            public bool IsQParry;
        }

        public static Result Apply(in Input i)
        {
            var r = new Result { Iframes = i.Iframes, Hp = i.Hp, St = i.St, Mp = i.Mp, Poise = i.Poise, Rage = i.Rage, Mats = i.Mats, HarpGauge = i.HarpGauge, HitStop = i.HitStop, SlowMo = i.SlowMo, Shake = i.Shake };
            double resourceBonus = Math.Max(1, Js.Or(i.ResourceMul, 1));
            bool isQ = i.ForceQ || i.PlayerState == "sBlock" || i.PlayerState == "peaceShield" || i.SbParryT > 0;
            r.IsQParry = isQ;
            r.Iframes = Math.Max(i.Iframes, 18);
            if (i.LessonActive) { r.HitStop = 0; r.SlowMo = 0; }
            else if (i.Detonate != 0 && i.ParryT > 0) { r.Shake = ShakeDetonateCharge * i.OptShake / 100; }
            else { r.HitStop = Js.Int(HitStopParry * i.OptHitStop / 100); r.SlowMo = SlowMoFrames; r.Shake = ShakeParry * i.OptShake / 100; }
            bool red = i.ParryEl == "red", rainbow = i.ParryEl == "rainbow";
            double pbMul = 1 + i.ParryBonus;
            double regenMul = 1 + i.PRegen * .20;
            double raw = BaseRecovery * pbMul * regenMul;
            int prBase = Js.Int((red ? raw * 0.5 : rainbow ? raw * 1.5 : raw) * resourceBonus);
            r.Iframes = InvulnerableFrames;
            r.Hp = Math.Min(i.Mhp, i.Hp + prBase);
            r.St = Math.Min(i.Mst, i.St + prBase);
            r.Mp = Math.Min(i.Mmp, i.Mp + prBase);
            r.Poise = Math.Min(Js.Or(i.MaxPoise, 4), Js.Or(i.Poise, 0) + 1);
            double harpAdd = (red ? 5 : rainbow ? 15 : 10) * resourceBonus * 2;
            r.HarpGauge = Math.Min(i.HarpGaugeMax, i.HarpGauge + harpAdd);
            double uSR = isQ ? Js.Or(i.ShieldRageUnique, 0) : 0;
            double rageAdd = ((red ? 5 : rainbow ? 15 : 10) * resourceBonus + uSR) * 2;
            r.Rage = Math.Min(i.RageMax, i.Rage + rageAdd);
            r.Mats = i.Mats + (red ? 500 : rainbow ? 2000 : 1000) * resourceBonus * 2;
            return r;
        }
    }
}
