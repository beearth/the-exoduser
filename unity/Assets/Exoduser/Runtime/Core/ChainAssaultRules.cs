using System;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core.Combat
{
    public static class ChainAssaultRules
    {
        public static int ManaCost(int level) { return 20 + Math.Max(1, level) * 2; }
        public static int Range(int level) { return 450 + (Math.Max(1, level) - 1) * 25; }
        public static int Damage(double reference, int level, double magicMultiplier, double skillBoost, int tier)
        {
            int t = Math.Max(1, Math.Min(3, tier));
            return Js.Int(reference * SkillRules.SkMul("chainAssault", level) * magicMultiplier * (t == 3 ? 50 : t == 2 ? 30 : 15) * (1 + skillBoost));
        }
        public static double ZoneRadius(int level) { return Range(level) * .6; }
        public static int ZoneDamage(int landingDamage) { return Js.Int(landingDamage * .12); }
    }
}
