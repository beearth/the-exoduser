using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // Web parry / shield rules as pure functions (game.html: _lParryWinTicks 16624, _lSbParryT 16625, isPWin 38471, projectile loop 34850-34864, _eSwingRadius 3491-3493,
    // _sBlockChargeRadius / _sBlockProjectileZone 14313-14320, _projectileParryClass 16913, stCost 31988, _sBashFire 38451, kiGather 33712-33733, pParry* 28024-28055).
    // Values from equipment / passives are arguments. Compared with the original functions by Tools/dash-parry-oracle. Web quirks are kept
    // (cape-corrected isPWin window vs the uncorrected projectile gate `_PARRY_WIN`, `_chgMP` multiplying the 140/200 radius caps).
    public static class ParryRules
    {
        public const int ParryWin = 16;              // var _PARRY_WIN (8670): active ticks of the 20-tick sBash
        public const int SBashTicks = 20;            // P.st2=20 (38454, 38466)
        public const double SdGrace = 10;            // const _SD_GRACE (33667): E tap vs hold
        public const int SdTapBufferFrames = 3;      // _sdTapOk (38449)
        public const double SBlockReleaseTicks = 12;      // release parry window (33760)
        public const double WrongInputRadius = 100;  // _wrongR (34912)
        public const double QPressParryRadius = 100, QAbsorbRadius = 20;   // _sBlockProjectileZone
        public const double SBashStrikeSt2 = 12;     // strike moment `P.st2<=12&&P.st2+sp>12` (33411)

        public enum Zone { None, Absorb, Parry }
        public enum ProjClass { Forbidden, Magic, Physical }

        // ~~(_PARRY_WIN*(1+cape)) capped at 20
        public static int LParryWinTicks(double capeParry) { return (int)Math.Min(20, Js.Int(ParryWin * (1 + capeParry))); }
        public static int LSbParryT(double capeParry) { return Js.Int(20 * (1 + capeParry)); }

        // isPWin()
        public static bool IsParryWindow(string s, double st2, double kiParryT, double sbParryT, double capeParry)
        {
            return (s == "sBash" && st2 > (20 - LParryWinTicks(capeParry))) || kiParryT > 0 || (s == "sBlock" && sbParryT > 0) || (s == "peaceShield" && sbParryT > 0)
                || (s != "whirlwind" && s != "beam" && s != "elecRepent" && sbParryT > 0);
        }

        // _wingStrikeLevel / _eSkillRangeMul / _eSwingRadius (arguments are the skill levels, 0 = not learned)
        public static double WingStrikeLevel(double maliceSwipe, double shieldThrow) { return Math.Max(1, Math.Min(Js.Or(maliceSwipe, 1), Js.Or(shieldThrow, 1))); }
        public static double SkillRangeMul(double maliceSwipe, double shieldThrow) { return 1 + (WingStrikeLevel(maliceSwipe, shieldThrow) - 1) * .05; }
        public static double SwingRadius(double bonusRange, double maliceSwipe, double shieldThrow, double chargeMul)
        {
            return Math.Floor((70 + bonusRange * 4) * SkillRangeMul(maliceSwipe, shieldThrow) * Js.Or(chargeMul, 1));
        }

        public struct GateInput
        {
            public string S; public double St2, KiParryT, SbParryT, SbReleaseR, SBashChgMul, Detonate, MaliceSwipe, ShieldThrow, BonusRange, PParry, ParryBonus, WRange, WpBonusRange, PCollR;
        }
        public struct Gate
        {
            public bool SbPW, SbPWDet, AnyPW, SbActive, IsAtkState, ReleasePW;
            public double ChgMP, ParryR, ParryRDet, QPulseR, RbDeflR;
        }
        // projectile loop lines 34852-34864 (cape correction is not applied to this gate: web quirk, only isPWin uses it)
        public static Gate ComputeGate(in GateInput g)
        {
            var r = new Gate();
            r.SbPW = g.S == "sBlock" && g.SbParryT > 0;
            r.SbPWDet = r.SbPW && g.Detonate >= 1;
            r.AnyPW = r.SbPW || (g.SbParryT > 0 && g.S != "whirlwind" && g.S != "beam" && g.S != "elecRepent");
            r.SbActive = (g.S == "sBash" && g.St2 > (20 - ParryWin)) || g.KiParryT > 0;
            r.IsAtkState = g.S == "wSwing" || g.S == "wWindup" || g.S == "wRecover" || g.S == "whirlwind" || g.S == "charge" || g.S == "charging";
            r.ChgMP = g.S == "sBash" ? Math.Min(3, Math.Max(1, Js.Or(g.SBashChgMul, 1))) * SkillRangeMul(g.MaliceSwipe, g.ShieldThrow) : 1;
            r.ParryR = Math.Min(140, 110 + g.BonusRange * 4 + g.PParry * 2 + Js.Int(g.ParryBonus * 20)) * r.ChgMP;
            r.ParryRDet = Math.Min(200, 140 + g.BonusRange * 6 + g.PParry * 3 + Js.Int(g.ParryBonus * 30)) * r.ChgMP;
            r.ReleasePW = g.S != "sBlock" && g.SbParryT > 0 && g.SbReleaseR > 0;
            r.QPulseR = g.S == "sBlock" && g.SbParryT > 0 ? 100 : r.ReleasePW ? g.SbReleaseR : 0;
            r.RbDeflR = r.SbActive ? r.ParryR : r.QPulseR > 0 ? r.QPulseR : IsParryWindow(g.S, g.St2, g.KiParryT, g.SbParryT, 0) ? r.ParryR : r.IsAtkState ? (Js.Or(g.WRange, 50) + g.WpBonusRange * 4) * 2 + 60 : g.PCollR + 20;
            return r;
        }

        // _sBlockChargeRadius(holdT): 100 -> 500 over 240 ticks
        public static double SBlockChargeRadius(double holdT) { double p = Math.Min(1, Math.Max(0, holdT) / 240); return 100 + (500 - 100) * p; }
        // _sBlockProjectileZone(distance,parryT)
        public static Zone SBlockProjectileZone(double distance, double parryT)
        {
            if (distance <= 20) return Zone.Absorb;
            return parryT > 0 && distance <= 100 ? Zone.Parry : Zone.None;
        }

        public struct ProjectileFlags
        {
            public string ParryClass;   // explicit p.parryClass (null = none)
            public bool FbEnergy, FdEnergy, Mine, Trap, BlackBean, Friendly, NoParry, Bomb, Web, PoisonZone, IceZone, Blizzard, DimRift, ElemBall, CoralSpike;
            public bool GbBean, BlueBean, FireMagic, WaterBean, TitanEye, BwBean, RedBean, SwordWave, PhantomSword;
            public double El;           // element id, 0 = physical (EL.P); undefined in the web = 0
        }
        // _projectileParryClass(p)
        public static ProjClass ProjectileParryClass(in ProjectileFlags p)
        {
            if (!string.IsNullOrEmpty(p.ParryClass)) return p.ParryClass == "physical" ? ProjClass.Physical : p.ParryClass == "magic" ? ProjClass.Magic : ProjClass.Forbidden;
            if (p.FbEnergy || p.FdEnergy) return ProjClass.Magic;
            if (p.Mine || p.Trap) return ProjClass.Magic;
            if (p.BlackBean) return ProjClass.Magic;
            if (p.Friendly || p.NoParry || p.Bomb || p.Web || p.PoisonZone || p.IceZone || p.Blizzard || p.DimRift || p.ElemBall || p.CoralSpike) return ProjClass.Forbidden;
            if (p.GbBean || p.BlueBean || p.FireMagic || p.WaterBean) return ProjClass.Magic;
            if (p.TitanEye || p.BwBean) return ProjClass.Physical;
            return p.El == 0 ? ProjClass.Physical : ProjClass.Magic;
        }
        // _eCanReflectProjectile(p)
        public static bool ECanReflect(in ProjectileFlags p, string playerState, double stWingT, bool shieldFuse)
        {
            if (p.Friendly || p.NoParry || p.BlackBean || p.FbEnergy || p.FdEnergy) return false;
            var kind = ProjectileParryClass(p);
            return kind == ProjClass.Physical || (kind == ProjClass.Magic && playerState == "sBash" && stWingT > 0 && shieldFuse);
        }
        // _physicalProjectileMultiplier(p): enemy physical bullets give 3x resources
        public static double PhysicalResourceMultiplier(in ProjectileFlags p, bool hasProjectile = true, double physicalScale = 3) { return hasProjectile && !p.Friendly && ProjectileParryClass(p) == ProjClass.Physical ? physicalScale : 1; }
        // _isPhysicalMouthProjectile(p): E only
        public static bool IsPhysicalMouthProjectile(in ProjectileFlags p)
        {
            return ProjectileParryClass(p) == ProjClass.Physical && !p.Friendly && !p.RedBean && !p.TitanEye && !p.BwBean && !p.SwordWave && !p.PhantomSword && !p.FbEnergy && !p.FdEnergy;
        }

        // passives (28024, 28039, 28040, 28054, 28053, 28055)
        public static double ParryCounterDamageMul(double pParry) { return 1 + pParry * .50; }
        public static double ParryRecoverSpeed(double pParry) { return 1 + pParry * .10; }
        public static double ParryRainbowDamageReduction(double pParry) { return Math.Min(.50, pParry * .10); }
        public static double ShieldBlock() { return 0; }
        public static double ShieldDamageMul() { return 1; }
        public static double GuardAbsorb(double pGuard, double shieldBlockDR) { return Math.Min(.50, .30 + pGuard * .02 + shieldBlockDR); }

        public struct CounterInput { public double BulletDmg; public bool IsQ; public double MeleeRef, StatStr, PAtkMul, MagicRef, StatInt, PMagicMul, PParry, ParryBonus, LegShieldParry; }
        // pParryProjDmg(bulletDmg,isQ): counter damage of a parried bullet, never below one ki-slash (14x)
        public static int ParryProjectileDamage(in CounterInput c)
        {
            double scale = c.IsQ ? c.MagicRef * c.StatInt * c.PMagicMul : c.MeleeRef * c.StatStr * c.PAtkMul;
            double gear = Math.Min(1, scale / 300);
            double b = c.BulletDmg * (1 + gear) * 0.5;
            double afx = 1 + c.ParryBonus;
            double leg = c.LegShieldParry > 0 ? c.LegShieldParry : 1;
            int calc = Js.Int(b * ParryCounterDamageMul(c.PParry) * afx * leg);
            int floor = Js.Int(c.MeleeRef * 14 * c.StatStr * c.PAtkMul);
            return Math.Max(calc, floor);
        }

        // stCost('shield') (31988)
        public static double ShieldStaminaCost(double maliceSwipe) { return 5 + (Js.Or(maliceSwipe, 1) - 1) * 2; }
        // sRecover length ~~(28/pParryRmbSpd()) (33533)
        public static int SRecoverTicks(double pParry) { return Js.Int(28 / ParryRecoverSpeed(pParry)); }

        public struct SBashFireResult { public bool Fired; public double St; public string S; public double St2, ChgMul, AtkBon, LastCost; }
        // _sBashFire(): E tap confirmed -> pay stamina, enter sBash (20 ticks), `_atkBon=~~(_lastCost*1.5)`
        public static SBashFireResult SBashFire(double st, double maliceSwipe, string stateBefore, double chgMulBefore, double atkBonBefore)
        {
            var r = new SBashFireResult { St = st, S = stateBefore, ChgMul = chgMulBefore, AtkBon = atkBonBefore, LastCost = 0 };
            double cost = ShieldStaminaCost(maliceSwipe);
            if (st < cost) { r.LastCost = 0; return r; }   // useStPct: "ST 부족!" and no action
            r.St = st - cost; r.LastCost = cost; r.Fired = true;
            r.ChgMul = 1; r.AtkBon = Js.Int(cost * 1.5); r.S = "sBash"; r.St2 = 20;
            return r;
        }
        // ---- sBash strike (33498 `_gsDmg2` + `_gSlamHit` 46675): the E strike is a circular hit like the giant slam, damage 200 % melee (+21 %/Lv, x charge multiplier) ----
        // ~~(meleeRef()*2.0*(1+(_sdLv>=1?(_sdLv-1)*0.21:0))*statStr()*pShieldMul()*_chgM)+(P._atkBon||0)
        public static double BashDamage(double meleeRef, double maliceSwipe, double statStr, double pShieldMul, double chgMul, double atkBon)
        {
            double sd = Js.Or(maliceSwipe, 0);
            return Js.Int(meleeRef * 2.0 * (1 + (sd >= 1 ? (sd - 1) * 0.21 : 0)) * statStr * pShieldMul * chgMul) + Js.Or(atkBon, 0);
        }
        // `dmg=~~(dmg*pAtkMul())+(P._atkBon||0)` at the head of _gSlamHit
        public static double SlamBaseDamage(double dmg, double pAtkMul, double atkBon) { return Js.Int(dmg * pAtkMul) + Js.Or(atkBon, 0); }
        // `_gslLv||giantSlam||1` stun length of a broken ordinary enemy: min(300, 150 + (Lv-1)*15)
        public static double SlamFullStunFrames(double gslLv) { return Math.Min(300, 150 + (Js.Or(gslLv, 1) - 1) * 15); }
        public const double MiniStun = 60;   // _MINI_STUN
        public struct SlamTargetIn { public double D, R, Mult, Poise, MaxPoise, Stunned; public bool Boss; }
        public struct SlamTargetOut
        {
            public bool Targeted, Hurt, Killed; public double Dmg, Stunned, Poise, BossPoiseAmt; public bool BossPoise, Mini, Break, Weak;
        }
        // one enemy of the _gSlamHit loop. `killed` = the enemy died from the damage (the stun part is skipped); `range` damage radius, `stunRange` (0 = same as range)
        public static SlamTargetOut SlamHitTarget(in SlamTargetIn e, double range, double stunRange, double dmg, bool killed, double gslLv)
        {
            var o = new SlamTargetOut { Stunned = e.Stunned, Poise = e.Poise, BossPoiseAmt = -1 };
            double sR = stunRange != 0 ? stunRange : range;
            if (e.D > sR + e.R) return o;
            o.Targeted = true;
            if (e.D <= range + e.R) { o.Hurt = true; o.Dmg = Js.Int(dmg * e.Mult); }
            if (o.Hurt && killed) { o.Killed = true; return o; }
            if (e.Boss) { o.BossPoise = true; o.BossPoiseAmt = Js.Int(e.MaxPoise * 0.25); }
            else
            {
                o.Stunned = Math.Max(o.Stunned, MiniStun);
                if (e.Poise <= 0) { o.Stunned = Math.Max(o.Stunned, Js.Int(SlamFullStunFrames(gslLv) * e.Mult)); o.Poise = 0; o.Break = true; }
                else o.Mini = true;
            }
            if (e.Mult >= 2) o.Weak = true;
            return o;
        }

        // sBash strike moment: P.st2<=12&&P.st2+sp>12
        public static bool SBashStrikes(double st2, double sp) { return st2 <= 12 && st2 + sp > 12; }
        // sDraw: hold (>10) switches to kiGather, tap (<=10 and released) fires sBash
        public static bool SdHoldConfirmed(double sdHold) { return sdHold > SdGrace; }
        // _sdTapOk(): buffered keydown frame within 3 frames; returns whether it fired and the new buffer value
        public static bool SdTapOk(double buffer, double gameFrame, out double bufferAfter)
        {
            if (buffer >= 0 && gameFrame - buffer <= 3) { bufferAfter = -999; return true; }
            bufferAfter = buffer; return false;
        }

        // kiGather (33712-33735): charge ticks -> tier, release multiplier, fizzle, forced release
        public static int KiGatherTier(double kgChg) { return kgChg >= 180 ? 3 : kgChg >= 120 ? 2 : kgChg >= 60 ? 1 : 0; }
        public static bool KiGatherFizzles(double kgChg) { return !(kgChg >= 18); }
        public static bool KiGatherAutoRelease(double kgChg) { return kgChg >= 186; }
        // _kgRelease(tier,mult): P._sBashChgMul=min(3,max(1,mult||1))
        public static double KiGatherReleaseMultiplier(double kgChg) { double t = Math.Min(3, kgChg / 60); return Math.Min(3, 1 + 0.5 * Math.Min(t, 2) + Math.Max(0, t - 2)); }
        public static double ClampChargeMul(double mult) { return Math.Min(3, Math.Max(1, Js.Or(mult, 1))); }

        public struct SBlockState { public double Mp, Mmp, St2, SbParryT, SbHoldT, SbReleaseR, ParryT, SbCd; public string S; }
        // Q press (14306-14308): needs 10 MP, enters sBlock with the 20-tick (cape corrected) parry window
        public static bool SBlockEnter(ref SBlockState p, double capeParry, double shieldCdRed)
        {
            if (p.Mp < 10) return false;
            p.Mp -= 10; p.S = "sBlock"; p.St2 = 999; p.SbParryT = LSbParryT(capeParry); p.SbHoldT = 0; p.SbReleaseR = 0; p.ParryT = 0;
            p.SbCd = Js.Int(30 * (1 + shieldCdRed));
            return true;
        }
        // per-frame sBlock hold (33741-33744): MP drain ~5%/s, parry window countdown
        public static void SBlockTick(ref SBlockState p, double sp)
        {
            p.SbHoldT = p.SbHoldT + sp;
            p.Mp -= p.Mmp * .000833 * sp; if (p.Mp < 0) p.Mp = 0;
            if (p.SbParryT > 0) p.SbParryT -= sp;
        }
        // Q release (33758-33761): window 12, radius grows with the hold time
        public static void SBlockRelease(ref SBlockState p)
        {
            double r = SBlockChargeRadius(p.SbHoldT);
            p.S = "idle"; p.SbParryT = 12;
            p.SbReleaseR = r; p.SbHoldT = 0;
        }
    }
}
