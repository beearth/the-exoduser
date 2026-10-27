using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // Parry reflection of enemy bullets (game.html projectile loop 35064-35248): a successful E strike or Q parry turns the bullet around, flags it as a "blue bean" and sends it
    // back at the nearest enemy. Not specific to the lesson or to the druid: any enemy-bullet loop calls Resolve with the player's parry state and the distance of the bullet,
    // applies the result to its own bullet record (ReflectProjectile) and pays doParry with the returned arguments. The flight (HomingTurn) and the hit on an enemy
    // (FriendlyHit / FriendlyAoeDamage) follow the same loop (34977-34990, 35587-35593, 35688-35695).
    // Compared with the original code (the block above executed in a Node VM) by Tools/dash-parry-oracle section `reflect`; the numbers of the player come in as arguments.
    // Not ported on purpose: sound / particles / floating text, the parry lesson branch (`_lessonShot`), the penalties of the wrong-input / black-bean / whirlwind branches
    // (they only report that the bullet was consumed), the bullet kinds that are not parried (bomb, ice zone ... fall through = Outcome.None / Other).
    public sealed class ReflectProjectile
    {
        public double X, Y, Vx, Vy, Dmg, Life, Ml, El, Sz, R, AoeR, AoeDmg;   // Sz / R 0 = web `p.sz` / `p.r` undefined (the web reads them with ||)
        public string Col = "", ParryClass = "";
        public bool FbEnergy, FdEnergy, Mine, Trap, BlackBean, Friendly, NoParry, Bomb, Web, PoisonZone, IceZone, Blizzard, DimRift, ElemBall, CoralSpike;
        public bool GbBean, BlueBean, FireMagic, WaterBean, TitanEye, BwBean, RedBean, SwordWave, PhantomSword;
        public bool ParryBlueBean, Magic, Homing, FromRainbow, DruidStraight;

        public ParryRules.ProjectileFlags Flags
        {
            get
            {
                return new ParryRules.ProjectileFlags { ParryClass = string.IsNullOrEmpty(ParryClass) ? null : ParryClass, FbEnergy = FbEnergy, FdEnergy = FdEnergy, Mine = Mine, Trap = Trap, BlackBean = BlackBean,
                    Friendly = Friendly, NoParry = NoParry, Bomb = Bomb, Web = Web, PoisonZone = PoisonZone, IceZone = IceZone, Blizzard = Blizzard, DimRift = DimRift, ElemBall = ElemBall, CoralSpike = CoralSpike,
                    GbBean = GbBean, BlueBean = BlueBean, FireMagic = FireMagic, WaterBean = WaterBean, TitanEye = TitanEye, BwBean = BwBean, RedBean = RedBean, SwordWave = SwordWave, PhantomSword = PhantomSword, El = El };
            }
        }
    }

    public enum ReflectKind { None, RedBean, PhysicalMouth, TitanEye, BwBean, GbBean, Magic }

    public enum ReflectOutcome
    {
        None,              // no branch took the bullet (the loop goes on)
        Other,             // the ordinary-bullet branch took it but it is not a Q magic parry (whirlwind absorb, bomb, damage ...): the rest of the web loop decides
        Absorb,            // Q press zone <= 20 px: the bullet is swallowed (recycled)
        BigEnergyParry,    // large energy ball parried by Q: replaced by five comet bullets (_resolveBigEnergyParry), not part of this port
        BigEnergyHit,      // large energy ball touched the player
        Consumed,          // wrong-input penalty / black-bean hit / white-dark ball hit / whirlwind absorb: the bullet is used up, no reflection
        Reflect,           // the bullet was turned around: see Kind and the doParry arguments
    }

    public static class ParryReflect
    {
        public const double WrongInputRadius = 100;   // _wrongR: Q on a physical bullet
        public const double MagicSpeedFloor = 5;      // Math.max(5, |v|) when aimed at a target

        public struct ResolveInput
        {
            // player (P.*)
            public string S; public double St2, KiParryT, SbParryT, SbReleaseR, Iframes, SBashChgMul, Detonate, MaliceSwipe, ShieldThrow, BonusRange, PParry, ParryBonus, WRange, WpBonusRange, PR, PX, PY;
            public bool IoActive;     // P._ioActive: the player is inside an interaction, no parry
            public bool WhirlDet;     // _isFused('whirlDet')
            // geometry the caller measured: distance bullet <-> player (sweep corrected, lines 35050-35063)
            public double PDist;
            // `_parryHomingTarget()`: nearest living enemy to the player within 600 px, or none
            public bool HasTarget; public double TargetX, TargetY;
            // pParryProjDmg(bulletDmg, isQ): the player's counter damage inputs (BulletDmg / IsQ are filled in per branch)
            public ParryRules.CounterInput Counter;
        }

        public struct ResolveResult
        {
            public ReflectOutcome Outcome; public ReflectKind Kind;
            public bool PHit, Fell;              // `_pHit` at the end / the span ended without a `continue` (the loop goes on with this bullet)
            // doParry(dmg, x, y, false, el, resourceMul, tag)
            public bool DoParry; public double ParryDmg, ParryX, ParryY, ResourceMul; public string ParryEl, ParryTag;   // ParryEl: "red" / "rainbow" / null (normal)
            public double ParryBankAdd;          // P.parryBank += (Q magic parry only)
            public bool IceBurst;                // _waterBeanIceBurst(p.x, p.y, true)
            public double SbRadiusDebug;         // diagnostics: rbDeflR
        }

        static double Spd(ReflectProjectile p) { return Math.Sqrt(p.Vx * p.Vx + p.Vy * p.Vy); }

        // the lines `if(_tgt){ang=atan2(ty-P.y,tx-P.x); p.vx=cos*spd...} else {p.vx*=-k;p.vy*=-k}`
        static void Aim(ReflectProjectile p, in ResolveInput i, double fixedSpeed, double floor, double backMul)
        {
            if (i.HasTarget)
            {
                double a = Math.Atan2(i.TargetY - i.PY, i.TargetX - i.PX);
                double spd = fixedSpeed > 0 ? fixedSpeed : Math.Max(floor, Spd(p));
                p.Vx = Math.Cos(a) * spd; p.Vy = Math.Sin(a) * spd;
            }
            else { p.Vx *= backMul; p.Vy *= backMul; }
        }

        static double CounterDamage(in ResolveInput i, double bulletDmg, bool isQ)
        {
            var c = i.Counter; c.BulletDmg = bulletDmg; c.IsQ = isQ;
            return ParryRules.ParryProjectileDamage(c);
        }

        static void BlueBeanFlags(ReflectProjectile p, double life)
        {
            p.Friendly = true; p.Life = life; p.Ml = life; p.BlueBean = true; p.ParryBlueBean = true; p.Magic = true; p.Homing = true; p.Col = "#00e5ff";
        }

        // 35064-35248 for one bullet: which branch takes it, and when it is a reflection the turned bullet (p is changed in place)
        public static ResolveResult Resolve(ReflectProjectile p, in ResolveInput i)
        {
            var r = new ResolveResult { Outcome = ReflectOutcome.None, Fell = true };
            var flags = p.Flags;
            bool bigBall = p.FbEnergy || p.FdEnergy;
            double pCollR = i.PR + (bigBall ? Math.Max(Js.Or(p.R, 16), Js.Or(p.Sz, 48)) : Js.Or(p.Sz, 1) * 3);
            bool sbPW = i.S == "sBlock" && i.SbParryT > 0;
            var gate = ParryRules.ComputeGate(new ParryRules.GateInput { S = i.S, St2 = i.St2, KiParryT = i.KiParryT, SbParryT = i.SbParryT, SbReleaseR = i.SbReleaseR, SBashChgMul = i.SBashChgMul, Detonate = i.Detonate,
                MaliceSwipe = i.MaliceSwipe, ShieldThrow = i.ShieldThrow, BonusRange = i.BonusRange, PParry = i.PParry, ParryBonus = i.ParryBonus, WRange = i.WRange, WpBonusRange = i.WpBonusRange, PCollR = pCollR });
            double pParryR = bigBall ? Math.Max(i.PR + Js.Or(p.Sz, 48) + 90, i.S == "sBlock" && i.SbParryT > 0 ? 100 : Js.Or(i.SbReleaseR, 0)) : pCollR;
            bool sbPWDet = sbPW && i.Detonate >= 1;
            bool anyPW = gate.AnyPW, sbActive = gate.SbActive;
            double normalR = sbActive ? (bigBall ? pCollR + 4 : pCollR * 3 + 12) * ParryRules.SkillRangeMul(i.MaliceSwipe, i.ShieldThrow) : sbPWDet ? (bigBall ? pParryR : pCollR * 3 + 12) : anyPW ? (bigBall ? pParryR : pCollR * 3 + 8) : pCollR + 4;
            double rbDeflR = gate.RbDeflR, qPulseR = gate.QPulseR, d = i.PDist;
            r.SbRadiusDebug = rbDeflR;

            var zone = i.S == "sBlock" ? ParryRules.SBlockProjectileZone(d, i.SbParryT) : gate.ReleasePW && d <= i.SbReleaseR ? ParryRules.Zone.Parry : ParryRules.Zone.None;
            bool qParryActive = anyPW || zone == ParryRules.Zone.Parry;
            var parryClass = ParryRules.ProjectileParryClass(flags);
            bool pHit = false, io = i.IoActive;

            if (zone == ParryRules.Zone.Absorb && !p.Friendly && !p.NoParry && !io) { r.Outcome = ReflectOutcome.Absorb; r.Fell = false; return r; }
            if (bigBall && !p.Friendly && !pHit && !io)
            {
                if (qParryActive && d < pParryR) { pHit = true; r.Outcome = ReflectOutcome.BigEnergyParry; }
                else if (d < pCollR) { pHit = true; r.Outcome = ReflectOutcome.BigEnergyHit; }
                if (pHit) { r.PHit = true; r.Fell = false; return r; }
            }
            double physMul = ParryRules.PhysicalResourceMultiplier(flags);
            bool mouth = ParryRules.IsPhysicalMouthProjectile(flags);
            if (mouth && d < WrongInputRadius && sbPW && !p.NoParry && !io && i.Iframes <= 0) { pHit = true; r.Outcome = ReflectOutcome.Consumed; }
            if (p.RedBean && parryClass == ParryRules.ProjClass.Physical && d < WrongInputRadius && sbPW && !io && i.Iframes <= 0) { pHit = true; r.Outcome = ReflectOutcome.Consumed; }

            // red bean (E only): fixed speed 7 at the target, or back at x4
            if (p.RedBean && parryClass == ParryRules.ProjClass.Physical && !pHit && d < rbDeflR && sbActive)
            {
                Aim(p, i, 7, 0, -4);
                p.Friendly = true; p.Life = 240; p.Ml = 240; p.Dmg = Js.Int(CounterDamage(i, p.Dmg, false) * 1.5); p.AoeR = 160; p.AoeDmg = p.Dmg * 2;
                p.RedBean = false; p.TitanEye = false; p.BlueBean = true; p.Col = "#00e5ff"; p.Homing = true; p.Magic = true; p.ParryBlueBean = true;
                return Reflected(ref r, p, ReflectKind.RedBean, "red", physMul, "physicalProjectile");
            }
            // snake / mouth bullets (E only)
            if (mouth && !pHit && d < rbDeflR && sbActive && !p.NoParry && !io)
            {
                Aim(p, i, 0, MagicSpeedFloor, -2);
                p.Friendly = true; p.Dmg = Js.Int(CounterDamage(i, p.Dmg, false) * 1.5); BlueBeanFlags(p, 180); p.AoeR = 0; p.AoeDmg = 0;
                return Reflected(ref r, p, ReflectKind.PhysicalMouth, ElOf(p), physMul, "physicalProjectile");
            }
            // titan eye (E only)
            if (p.TitanEye && !pHit && d < rbDeflR && sbActive && !io)
            {
                Aim(p, i, 0, MagicSpeedFloor, -2);
                p.Friendly = true; p.Dmg = Js.Int(CounterDamage(i, p.Dmg, false) * 1.5); p.Life = 180; p.Ml = 180; p.TitanEye = false; p.BlueBean = true; p.ParryBlueBean = true; p.Magic = true; p.Homing = true; p.Col = "#00e5ff"; p.AoeR = 0; p.AoeDmg = 0;
                return Reflected(ref r, p, ReflectKind.TitanEye, ElOf(p), physMul, "physicalProjectile");
            }
            // rainbow (black) bean: only Q magic parries it (below); touching it otherwise hurts
            double bkHitR = pCollR + 16; bool bkQParry = qParryActive && parryClass == ParryRules.ProjClass.Magic;
            if (p.BlackBean && !pHit && !bkQParry && d < bkHitR && i.Iframes > 0 && !io && i.S == "whirlwind") { pHit = true; r.Outcome = ReflectOutcome.Consumed; }
            if (p.BlackBean && !pHit && !bkQParry && d < bkHitR && !io)
            {
                if (i.Iframes > 0 && i.S != "whirlwind") { r.Outcome = ReflectOutcome.Consumed; r.PHit = true; r.Fell = false; return r; }
                pHit = true; r.Outcome = ReflectOutcome.Consumed;
            }
            // white ball (E only)
            if (p.BwBean && !pHit && d < normalR && (i.Iframes <= 0 || (sbActive && d < rbDeflR)) && !io)
            {
                if (sbActive && d < rbDeflR)
                {
                    Aim(p, i, 0, MagicSpeedFloor, -2);
                    p.Friendly = true; p.Dmg = Js.Int(CounterDamage(i, p.Dmg, sbPW) * 1.5); p.Life = 180; p.Ml = 180; p.BwBean = false; p.BlueBean = true; p.ParryBlueBean = true; p.Magic = true; p.Homing = true; p.Col = "#00e5ff"; p.AoeR = 0; p.AoeDmg = 0;
                    return Reflected(ref r, p, ReflectKind.BwBean, ElOf(p), physMul, null);
                }
                pHit = true; r.Outcome = ReflectOutcome.Consumed;
            }
            // dark (green) ball (Q only)
            if (p.GbBean && !pHit && d < (qPulseR > 0 ? qPulseR : normalR) && i.Iframes <= 0 && !io)
            {
                if (qParryActive)
                {
                    Aim(p, i, 0, MagicSpeedFloor, -2);
                    p.Friendly = true; p.Dmg = Js.Int(CounterDamage(i, p.Dmg, sbPW) * 2); p.Life = 200; p.Ml = 200; p.GbBean = false; p.BlueBean = true; p.ParryBlueBean = true; p.Magic = true; p.Homing = true; p.Col = "#00e5ff"; p.AoeR = 0; p.AoeDmg = 0;
                    return Reflected(ref r, p, ReflectKind.GbBean, ElOf(p), 0, null);
                }
                pHit = true; r.Outcome = ReflectOutcome.Consumed;
            }
            // whirlwind swallows ordinary bullets in its radius
            if (!p.BlackBean && !bigBall && !p.BwBean && !p.GbBean && !p.PoisonZone && !p.Mine && !p.ElemBall && !p.DimRift && !pHit && d < normalR && !io && i.S == "whirlwind")
            {
                r.Outcome = ReflectOutcome.Consumed; r.PHit = true; r.Fell = false; return r;
            }
            // ordinary bullets: Q parries magic; E physical ones were handled above
            bool wwDetAbs = i.S == "whirlwind" && i.WhirlDet;
            double wwAbsR = qPulseR > 0 ? qPulseR : wwDetAbs ? 90 : normalR;
            if (!bigBall && !p.NoParry && !p.PoisonZone && !pHit && !p.Friendly && d < wwAbsR && (qParryActive || i.Iframes <= 0) && !io)
            {
                if (qParryActive && parryClass == ParryRules.ProjClass.Magic)
                {
                    bool water = p.WaterBean;
                    double npDmg = Js.Int(CounterDamage(i, p.Dmg, sbPW) * 1.5);
                    Aim(p, i, 0, MagicSpeedFloor, -2);
                    p.Friendly = true; p.Dmg = npDmg; p.Life = 180; p.Ml = 180; p.WaterBean = false; p.BlueBean = true; p.ParryBlueBean = true; p.Magic = true; p.Homing = true; p.FromRainbow = p.BlackBean; p.Col = "#00e5ff"; p.AoeR = 0; p.AoeDmg = 0;
                    if (p.DruidStraight && p.ElemBall) p.ElemBall = false;
                    r.ParryBankAdd = Js.Or(p.Dmg, 10);
                    r.IceBurst = water;
                    Reflected(ref r, p, ReflectKind.Magic, p.BlackBean ? "rainbow" : ElOf(p), 0, water ? "waterBean" : null);
                    r.PHit = true; return r;
                }
                r.Outcome = ReflectOutcome.Other;
            }
            r.PHit = pHit;
            return r;
        }

        // doParry's `el` argument: red / rainbow are strings, any element id is "normal" for the rewards
        static string ElOf(ReflectProjectile p) { return null; }

        static ResolveResult Reflected(ref ResolveResult r, ReflectProjectile p, ReflectKind kind, string el, double resourceMul, string tag)
        {
            r.Outcome = ReflectOutcome.Reflect; r.Kind = kind; r.Fell = false; r.PHit = kind != ReflectKind.Magic && kind != ReflectKind.RedBean;   // red bean: `continue` before _pHit is set
            r.DoParry = true; r.ParryDmg = p.Dmg; r.ParryX = p.X; r.ParryY = p.Y; r.ParryEl = el; r.ResourceMul = resourceMul; r.ParryTag = tag;
            return r;
        }

        // ---- the flight of a reflected blue bean (34977-34988): steer toward the nearest enemy within 400 px, 0.08 rad per tick (x sp) ----
        public const double HomingRange = 400, HomingTurnRate = 0.08;
        public static void HomingTurn(ReflectProjectile p, double targetX, double targetY, double sp)
        {
            double ang = Math.Atan2(targetY - p.Y, targetX - p.X), cur = Math.Atan2(p.Vy, p.Vx), diff = ang - cur;
            while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
            double turn = Math.Min(Math.Abs(diff), HomingTurnRate * sp) * Math.Sign(diff), spd = Spd(p), n = cur + turn;
            p.Vx = Math.Cos(n) * spd; p.Vy = Math.Sin(n) * spd;
        }

        // ---- the reflected bullet meets an enemy (35286-35320): the first enemy in contact sets off a blast around the bullet (radius _aoeR or 100, damage falls off to 80 %),
        // every enemy inside is hurt as a blue bean (magic, poise hit, knock-back x2) and gets knocked back and poisoned. Not ported: the bomb branch (reflected bomb / red bean bombs),
        // the unique-item pierce, particles and sound. Enemy poison itself is not simulated by the Core yet: the numbers are returned for the day it is. ----
        public const double BlastRangeDefault = 100, BlastDamageDefault = 15, PoisonTicks = 600, PoisonStackMax = 10, PoisonStackStep = 3, PoisonPoolShare = 0.15, BlastKnock = 18, BluHitCooldown = 3;

        public struct BlastTarget { public double X, Y, R; public bool Alive; public double BluHitCd, PoisonT, PoisonStk, PoisonPool; }
        public struct BlastHit { public int Index; public int Damage; public double Angle; public double KbX, KbY; }

        // contact radius of a friendly bullet: max(6, r + min(18, speed / 2))
        public static double FriendlyHitRadius(ReflectProjectile p) { return Math.Max(6, Js.Or(p.R, 4) + Math.Min(18, Spd(p) * 0.5)); }

        // targets are updated in place (knock-back is returned per hit, poison / cooldown are written back); returns whether the bullet is used up
        public static bool Blast(ReflectProjectile p, BlastTarget[] targets, double dotPool, System.Collections.Generic.List<BlastHit> hits)
        {
            hits.Clear();
            if (!p.Friendly || p.FbEnergy || p.FdEnergy || p.Bomb) return false;
            double hr = FriendlyHitRadius(p);
            for (int i = 0; i < targets.Length; i++)
            {
                var e = targets[i];
                if (!e.Alive || e.BluHitCd > 0) continue;
                if (Dist(p.X, p.Y, e.X, e.Y) < e.R + hr)
                {
                    if (p.RedBean) targets[i].BluHitCd = BluHitCooldown;
                    double blR = Js.Or(p.AoeR, BlastRangeDefault), blD = Js.Or(p.AoeDmg, Js.Or(p.Dmg, BlastDamageDefault));
                    for (int k = 0; k < targets.Length; k++)
                    {
                        var be = targets[k]; if (!be.Alive) continue;
                        double bd = Dist(p.X, p.Y, be.X, be.Y); if (bd > blR) continue;
                        double ba = Math.Atan2(be.Y - p.Y, be.X - p.X), bf = Math.Max(0, 1 - bd / blR);
                        hits.Add(new BlastHit { Index = k, Damage = Js.Int(blD * (.8 + bf * .2)), Angle = ba, KbX = Math.Cos(ba) * BlastKnock * bf, KbY = Math.Sin(ba) * BlastKnock * bf });
                        targets[k].PoisonT = Math.Max(be.PoisonT, PoisonTicks); targets[k].PoisonStk = Math.Min(PoisonStackMax, be.PoisonStk + PoisonStackStep); targets[k].PoisonPool = be.PoisonPool + dotPool * blD * PoisonPoolShare;
                    }
                    return true;
                }
            }
            return false;
        }
        static double Dist(double ax, double ay, double bx, double by) { return Math.Sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)); }
    }
}
