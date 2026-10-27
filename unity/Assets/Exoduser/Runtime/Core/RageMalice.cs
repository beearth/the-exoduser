using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// PC-B10 rage (분노, web P.rage) and malice (악의, web G.mats) rules. Every formula is the web statement verbatim:
    /// _rageMax 27974, _maliceMul 27972, _malCost 28164-28169, parry rage 38583-38584, giant slam rage 46560-46580,
    /// unique rage adds 16913 / 42787 / 43660 / 43954, pickup 33034 / 41550, elite kill drop 43170-43201.
    /// The web has no rage decay and does not save rage (P.rage=0 on character init, game.html 3633).
    /// </summary>
    public static class RageMalice
    {
        public const double BaseRageMax = 100, PassiveRageStep = .10, SlamRagePerPoint = .19, MalicePassiveStep = .08;

        /// <summary>_rageMax(): the parry practice pins it to 100, else ~~((100+uniqueMax+affixRageMaxFlat)*(1+pRage*.10)).</summary>
        public static double RageMax(bool parryLessonActive, double uniqueRageMax, double affixRageMaxFlat, double pRage)
        {
            if (parryLessonActive) return 100;
            return Math.Truncate((100 + uniqueRageMax + affixRageMaxFlat) * (1 + pRage * PassiveRageStep));
        }

        /// <summary>P.rage=Math.min(max,P.rage+add). A rage above a lowered maximum is clamped down by the next add, as in the web.</summary>
        public static double Add(double rage, double add, double max) { return Math.Min(max, rage + add); }

        /// <summary>Unique "% of the maximum" adds (_lSwordCombo 16913, _lRingKill 42787): Math.max(1,~~(max*frac)).</summary>
        public static double FractionAdd(double rage, double max, double frac) { return Math.Min(max, rage + Math.Max(1, Math.Truncate(max * frac))); }

        /// <summary>_uArmorRage 43660: +10 on the damage-to-rage proc.</summary>
        public const double ArmorRageAdd = 10;

        /// <summary>Result of the rage part of activateGiantSlam (46560-46580). Rage is spent only when it was above 0.</summary>
        public struct SlamResult
        {
            public double Consumed;      // _rageP
            public double DamageMul;     // _rageMul = 1+(P.rage*0.19*(1+pRage*.10)*(1+rageDmg))
            public double BonusPercent;  // the "+N%" of the floating text: ~~(_rageP*19*(1+pRage*.10)*_rageDmgAf)
            public int Bombs;            // ~~(_rageP/20) lava eruptions
            public double RageAfter;     // 0, or the u_d10 ember remainder
            public double Ember;         // remainder gained (0 = none)
        }

        public static SlamResult Slam(double rage, double max, double pRage, double rageDmgAffix, double emberUnique)
        {
            double af = 1 + rageDmgAffix;
            var r = new SlamResult { Consumed = 0, DamageMul = 1 + (rage * SlamRagePerPoint * (1 + pRage * PassiveRageStep) * af), RageAfter = rage };
            if (!(rage > 0)) return r;
            r.Consumed = rage;
            r.BonusPercent = Math.Truncate(rage * 19 * (1 + pRage * PassiveRageStep) * af);
            r.Bombs = (int)Math.Truncate(rage / 20);
            r.RageAfter = 0;
            if (emberUnique > 0 && rage >= 100)
            {
                double amt = Math.Min(30, Math.Truncate(rage * emberUnique));
                if (amt > 0) { r.Ember = amt; r.RageAfter = Math.Min(max, amt); }
            }
            return r;
        }

        // ---------------- malice ----------------

        /// <summary>_malCost(): every malice cost shown or spent is half of the raw value, rounded up, at least 1 (0 stays 0).</summary>
        public static int Cost(double raw) { return AutoPotion.MalCost(raw); }

        /// <summary>_maliceMul(): 1+pMalice*.08, applied to ground pickups and elite kill drops.</summary>
        public static double PickupMul(double pMalice) { return 1 + pMalice * MalicePassiveStep; }

        /// <summary>Ground mat pickup (33034 / 41550): ~~((it.matVal||1)*(1+goldBonus)*_maliceMul()).</summary>
        public static int PickupAmount(double matVal, double goldBonus, double pMalice)
        {
            return (int)Math.Truncate(Js.Or(matVal, 1) * (1 + goldBonus) * PickupMul(pMalice));
        }

        /// <summary>Elite / boss kill drop, instant half (43170-43174): ~~(~~((12+stage*3)*12*(1+dropBonus))*(1+goldBonus)*_maliceMul()).</summary>
        public static int EliteDrop(int stage, double eliteDropBonus, double goldBonus, double pMalice)
        {
            double matCnt = Math.Truncate((12 + stage * 3) * 12 * (1 + eliteDropBonus));
            return (int)Math.Truncate(matCnt * (1 + goldBonus) * PickupMul(pMalice));
        }

        /// <summary>Elite / boss extra (43198-43200): ~~((2+~~(random()*2))*10*comboBonus*2). Consumes one random draw.</summary>
        public static int EliteExtra(double random, double comboBonus)
        {
            return (int)Math.Truncate((2 + Math.Truncate(random * 2)) * 10 * comboBonus * 2);
        }

        /// <summary>Gate shared by every skill that pays malice: G.mats>=_malCost(raw). The parry practice only waives the giant slam (lessonFree).</summary>
        public static bool CanAfford(double mats, double raw, bool lessonFree = false) { return lessonFree || mats >= Cost(raw); }
    }
}
