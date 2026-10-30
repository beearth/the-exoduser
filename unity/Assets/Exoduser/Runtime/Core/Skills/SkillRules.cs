using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core.Skills
{
    // PC-B03: the web skill formulas for the warrior's Lv1~10 starting set (spikeTrap / giantSlam / holyDome / iceOrb) and the common tables they read
    // (_SK_MUL + _skMul, _COST_BASE / _dpsCostMul / stCost / mpCost, _skLvLock, _skillUpSpCost). Pure functions with the web's integer truncation (`~~`);
    // every number below is compared with the original game.html functions by unity/Tools/skill-oracle (export.cjs runs the web source, Program.cs runs this file).
    public static class SkillRules
    {
        public const int SlotCount = 6, SlotSpace = 4, SlotF = 5, MaxSkillLevel = 20;

        // _SK_MUL: id -> {b, g};  _skMul(id) = b + (Lv-1) * g * 0.5   (unknown id = 1)
        static readonly Dictionary<string, double[]> SkMulTable = new Dictionary<string, double[]> {
            {"giantSlam",new[]{20.0,19.0}},{"maliceMortar",new[]{10.0,8.0}},{"iceOrb",new[]{8.0,6.4}},{"boneWall",new[]{9.0,7.2}},{"chainSlam",new[]{8.0,6.4}},{"detonate",new[]{8.0,6.4}},
            {"plagueBurst",new[]{7.0,5.6}},{"maliceHuntBurst",new[]{28.0,22.4}},{"blueShell",new[]{8.0,6.4}},{"maliceStorm",new[]{14.0,11.2}},{"fireAura",new[]{10.0,8.0}},{"darkPillar",new[]{20.0,16.0}},
            {"spikeTrap",new[]{14.0,11.2}},{"skyCrusher",new[]{60.0,48.0}},{"bladeDash",new[]{3.5,2.1}},{"thunderStake",new[]{2.4,1.6}},{"arcLaser",new[]{8.0,6.4}},{"omniBeam",new[]{.75,.6}},
            {"whirlwind",new[]{25.0,24.0}},{"maliceHunt",new[]{1.0,.8}},{"venomBlade",new[]{3.0,2.4}},{"ltnChaser",new[]{4.0,3.2}},{"blueShot",new[]{1.8,1.44}},{"fireball",new[]{13.2,10.56}},
            {"fireBeam",new[]{3.0,2.4}},{"needleShot",new[]{4.0,3.2}},{"blastShot",new[]{4.0,3.2}},{"hellRay",new[]{5.0,4.0}},{"burstLoop",new[]{5.0,4.0}},{"kiSlash",new[]{12.0,10.08}},
            {"chargeBoost",new[]{8.0,6.4}},{"chainAssault",new[]{3.0,2.4}},{"chainSlash",new[]{3.5,2.8}},{"magicBlink",new[]{4.0,3.2}},{"ghostWalk",new[]{4.0,3.2}},{"elemMissile",new[]{2.0,1.6}},
            {"ancestorSummon",new[]{6.0,4.8}},
        };
        public static IEnumerable<string> SkMulIds { get { return SkMulTable.Keys; } }

        public static double SkMul(string id, int lv)
        {
            double[] t; if (id == null || !SkMulTable.TryGetValue(id, out t)) return 1;
            int l = lv < 1 ? 1 : lv;   // `P.skills[id]||1`
            return t[0] + (l - 1) * t[1] * 0.5;
        }

        // ---- costs (31986-31998): _COST_BASE x _dpsCostMul (1+(Lv-1)*scale) x discount; ST capped at 90 % of the maximum ----
        public static double CostBase(string key) { switch (key) { case "giantSlam": case "charge": case "blink": return 50; case "iceOrb": return 50; case "mortar": return 50; case "magic": return 10; case "weapon": return 10; default: return 5; } }
        static double DpsScale(string key) { switch (key) { case "giantSlam": case "charge": return .45; case "blink": return .30; case "iceOrb": return .35; case "mortar": return .35; default: return .10; } }
        public static double DpsCostMul(string key, int skillLv) { return 1 + (Math.Max(1, skillLv) - 1) * DpsScale(key); }
        // stDisc = pAtkCost * pMeleeStCost * (1 + min(0, stCostRed))
        public static int StCost(string key, int skillLv, double maxStamina, double pAtkCost, double pMeleeStCost, double stCostRed)
        {
            double disc = pAtkCost * pMeleeStCost * (1 + (stCostRed < 0 ? stCostRed : 0));
            double raw = Js.Int(CostBase(key) * DpsCostMul(key, skillLv) * 1 * disc);
            return (int)Math.Min(raw, Js.Int(maxStamina * 0.90));
        }
        public static double PAtkCost(double pAtk) { return Math.Max(.60, 1 - pAtk * .04); }
        public static double PMeleeStCost(double pMelee) { return Math.Max(.5, 1 - pMelee * .05); }
        public static double PMagicCost(double pMagic, double mpCostRedAffix, double uHelmMagic) { return Math.Max(.40, 1 - pMagic * .04 - mpCostRedAffix - uHelmMagic); }
        public static int MpCost(string key, int skillLv, double pMagicCost) { return Js.Int(CostBase(key) * DpsCostMul(key, skillLv) * pMagicCost); }

        // ---- skill level rules ----
        public static int SkillLevelLock(int playerLevel) { return Math.Min(20, (int)Math.Floor(playerLevel / 50.0) + 1); }   // _skLvLock
        public const int UpgradeSpCost = 1;                                                                                  // _skillUpSpCost
        public static bool CanUpgrade(bool learned, int skillLv, int sp, int playerLevel) { return learned && skillLv < MaxSkillLevel && skillLv < SkillLevelLock(playerLevel) && sp >= UpgradeSpCost; }

        // ---- 가시덫 (45654-45671) ----
        public const int SpikeTrapMalice = 10, SpikeTrapMaxT = 600, SpikeTrapTick = 25, SpikeTrapBaseCd = 600, SpikeTrapSlowFrames = 90, SpikeTrapBleedFrames = 300;
        public static double SpikeTrapSlowPct(int lv) { return Math.Min(.95, .91 + (Math.Max(1, lv) - 1) * .02); }
        public static double SpikeTrapRadius(int lv) { return 300 + (lv - 1) * 15; }
        public static int SpikeTrapDamage(double magicRef, double statInt, double pMagicMul, int lv) { return Js.Int(magicRef * statInt * pMagicMul * SkMul("spikeTrap", lv) * .75); }
        public static int SpikeTrapCooldown(double cdRed) { return Js.Int(600 * (1 + cdRed)); }

        // ---- 지옥강타 1 (46596-46674, _gSlamHit 46675-46722) ----
        public const int GiantSlamMalice = 20, GiantSlamWindup = 10, GiantSlamStrike = 10, GiantSlamRecover = 12, GiantSlamMiniStun = 60, GiantSlamWaveMaxT = 45;
        public static double GiantSlamRange(int lv) { return 500 + (lv - 1) * 15; }
        public static int GiantSlamBaseCd(int lv) { return Math.Max(60, 1800 - (lv - 1) * 12); }
        public static int GiantSlamCooldown(int lv, double cdRed) { return Js.Int(GiantSlamBaseCd(lv) * (1 + cdRed)); }
        public static int GiantSlamDamage(double meleeRef, double statStr, int lv, double rageMul) { return Js.Int(meleeRef * statStr * SkMul("giantSlam", lv) * rageMul); }
        public static int GiantSlamHitDamage(int dmg, double pAtkMul, int atkBonus) { return Js.Int(dmg * pAtkMul) + atkBonus; }
        public static int GiantSlamFullStun(int lv) { return Math.Min(300, 150 + (lv - 1) * 15); }

        // ---- 회복의 영역 (46854-46877, tick 32838-32845) ----
        public const int HolyDomeCooldown = 1800;
        public static double HolyDomeRadius(int lv) { return 500 + lv * 20; }
        public static int HolyDomeDuration(int lv) { return 720 + lv * 30; }
        public static double HolyDomeRegenPerFrame(int lv, double fuseMul) { return (10 + lv * 2) / 60.0 * 1 * fuseMul; }

        // ---- 얼음보주 (46904-46985, tick 36830-36852) ----
        public const int IceOrbAutoShatter = 120, IceOrbBlinkDistance = 180, IceOrbEscapeIframes = 30, IceOrbBladeStun = 30;
        public const double IceOrbBladeMaxDist = 3000, IceOrbBladeRadius = 12, IceOrbBladePierce = .95;
        public static int IceOrbBlades(int lv) { return 4 + lv * 4; }
        public static double IceOrbLevelScale(int lv) { return 1 + (lv - 1) * .1; }
        public static int IceOrbBaseDamage(double magicRef, double statInt, double pMagicMul, int lv, int bonus) { return Js.Int(magicRef * statInt * pMagicMul * SkMul("iceOrb", lv)) + bonus; }
        public static int IceOrbBladeDamage(int baseDmg) { return Math.Max(1, Js.Int(baseDmg * 0.3)); }
        public static int IceOrbShatterDamage(int baseDmg) { return Js.Int(baseDmg * 0.3); }
        public static double IceOrbSpawnRadius(double playerRadius, int lv) { return (playerRadius + 32) * IceOrbLevelScale(lv); }
        public static double IceOrbShatterRadius(int lv) { return (100 + lv * 5) * IceOrbLevelScale(lv); }
        public static int IceOrbCooldown(int lv) { return Math.Max(600, 1200 - (lv - 1) * 60); }
        // unified pierce (35701-35712): guaranteed floor(rate*91/1000) hits, then 1 - 0.1 per extra hit
        public static int GuaranteedPierce(double rate) { return (int)Math.Floor(rate * 91 / 1000); }
        public static double PierceSurvive(int pierced, double rate) { int over = pierced - GuaranteedPierce(rate); return Math.Max(0, 1 - over * 0.1); }
        // ---- 악의구 (E 마법 슬롯 기본, 33727+ "악의구 (기본 폴백)", 투사체 루프 35322+, _fireballExplode 24710, _maliceWeakMul 24707) ----
        public const double FireballSpeed = 5.5, FireballRadius0 = 12, FireballHomingRange = 280, FireballTurn = .35, FireballKnockback = .1, FireballElement = 3, MaliceWeakStep = .3;
        public const int FireballMaxBounce = 3, FireballBounceCool = 6, FireballPoisonFrames = 600, MaliceWeakMax = 10;
        public static double FireballScale(int lv) { return 1 + (Math.Max(1, lv) - 1) * 0.50; }
        public static int FireballDamage(double magicRef, double statInt, double pMagicMul, int lv) { return Js.Int(magicRef * statInt * pMagicMul * SkMul("fireball", lv)); }
        public static double FireballRange(int lv, double bonusRange) { return 400 + (Math.Max(1, lv) - 1) * 50 + bonusRange * 20; }
        public static double FireballRadiusMax(int lv) { return Js.Int(12 * FireballScale(lv)); }
        public static double FireballExplosionRadius(int lv) { return Js.Int(80 * FireballScale(lv)); }
    }
}
