namespace Exoduser.UnityPort.Core
{
    // game.html _HUMANOID_ET / _INSECT_ET / _GHOST_ET / _FLESH_ET / _BONE_ET / _BEAST_ET / _MAGIC_ET / _ARMOR_ET and _hitSfxForEtype (RM-1 sound track A3).
    // The web picks the variant with Math.random(); the Core only names the category and base pitch, the audio adapter picks the variant.
    public static class EnemySoundTables
    {
        static readonly int[] Humanoid = { 0, 1, 2, 6, 8, 20, 21, 24, 31, 34, 36, 37, 41, 44, 54, 55, 60, 65, 67, 70, 71, 74, 90, 93, 94 };
        static readonly int[] Insect = { 3, 11, 13, 15, 16, 17, 18, 19, 45, 46, 72 };
        static readonly int[] Ghost = { 7, 9, 26, 40, 47, 48, 66, 76, 78, 84, 86, 88, 95, 96 };
        static readonly int[] Flesh = { 5, 42, 50, 51, 52, 53, 56, 57, 58 };
        static readonly int[] Bone = { 4, 10, 12, 14, 23, 82, 83, 85 };
        static readonly int[] Beast = { 22, 27, 30, 33, 35, 38, 39, 43, 63, 64, 73, 75 };
        static readonly int[] Magic = { 25, 59, 69, 79, 89, 97, 98, 99 };
        static readonly int[] Armor = { 28, 29, 32, 49, 61, 62, 68, 77, 80, 81, 87, 91, 92 };

        static bool In(int[] set, int etype) { for (int i = 0; i < set.Length; i++) if (set[i] == etype) return true; return false; }

        // death category (web _deathSfxKey order: armor, humanoid, insect, ghost, flesh, bone, beast, magic, then the etype range fallbacks)
        public static string DeathCategory(int etype)
        {
            if (In(Armor, etype)) return "armor";
            if (In(Humanoid, etype)) return "humanoid";
            if (In(Insect, etype)) return "insect";
            if (In(Ghost, etype)) return "ghost";
            if (In(Flesh, etype)) return "flesh";
            if (In(Bone, etype)) return "bone";
            if (In(Beast, etype)) return "beast";
            if (In(Magic, etype)) return "magic";
            if (etype >= 50) return "demon";
            if (etype >= 40) return "heavy";
            if (etype >= 20) return "ice";
            if (etype >= 10) return "slime";
            return "monster";
        }

        // _hitSfxForEtype order: insect, ghost, flesh, bone, beast, magic, armor, then humanoid / fallback
        public static EnemyHitSfx Hit(int etype)
        {
            string category; double pitch = 1;
            if (In(Insect, etype)) { category = "insect"; pitch = 1.3; }
            else if (In(Ghost, etype)) { category = "ghost"; pitch = .7; }
            else if (In(Flesh, etype)) category = "flesh";
            else if (In(Bone, etype)) { category = "bone"; pitch = 1.15; }
            else if (In(Beast, etype)) { category = "beast"; pitch = .9; }
            else if (In(Magic, etype)) { category = "magic"; pitch = 1.2; }
            else if (In(Armor, etype)) category = "armor";
            else category = "humanoid";
            return new EnemyHitSfx { key = category, pitch = pitch };
        }
    }
}
