using System;

namespace Exoduser.UnityPort.Core
{
    // B05: web WTYPES (7 melee weapons), BOWTYPES (3 crossbows) and RARITY_MUL, in the order of the original tables.
    // The seven melee weapons share every number (atkMul 1, stCost 5, spdMul .45, arcW .95, range 50, stagger 8): only name and emoji differ.
    public static class WeaponCatalog
    {
        public sealed class MeleeDef { public string Key; public double AtkMul, StCost, SpdMul, ArcW, Range, Stagger; }
        public sealed class BowDef { public string Key; public double AtkMul, StCost, SpdMul, Range, ProjSpeed; }

        public static readonly double[] RarityMul = { 1, 1.2, 1.5, 1.8, 2.2, 2.5 };
        public static readonly string[] MeleeKeys = { "sword", "dagger", "hammer", "mace", "club", "axe", "spear" };
        public static readonly string[] BowKeys = { "crossbow", "repeater", "arcane" };

        public static MeleeDef Melee(string key)
        {
            if (Array.IndexOf(MeleeKeys, key) < 0) return null;
            return new MeleeDef { Key = key, AtkMul = 1, StCost = 5, SpdMul = .45, ArcW = .95, Range = 50, Stagger = 8 };
        }

        // BOWTYPES[type] || BOWTYPES.crossbow (the web falls back to the plain crossbow for an unknown or missing type)
        public static BowDef Bow(string key)
        {
            switch (key)
            {
                case "repeater": return new BowDef { Key = "repeater", AtkMul = .65, StCost = 5, SpdMul = 1.5, Range = 700, ProjSpeed = 22 };
                case "arcane": return new BowDef { Key = "arcane", AtkMul = 1.4, StCost = 5, SpdMul = .8, Range = 840, ProjSpeed = 22 };
                default: return new BowDef { Key = "crossbow", AtkMul = 1, StCost = 5, SpdMul = 1, Range = 800, ProjSpeed = 22 };
            }
        }

        public static bool IsMelee(string key) { return Array.IndexOf(MeleeKeys, key) >= 0; }
        public static bool IsBow(string key) { return Array.IndexOf(BowKeys, key) >= 0; }
    }
}
