using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // game.html _DEATH_VARIANTS (the pools 1-1 etypes 0..29 and 47 can reach through _deathSfxKey) -- generated from the web source by tools/rm1 collect script, do not edit by hand.
    public static class NativeEnemySfxTables
    {
        public static readonly Dictionary<string, string[]> DeathPools = new Dictionary<string, string[]>
        {
            { "armor", new[] { "death_armor", "death_crush2", "death_bone_shatter3", "death_bone_shatter4", "death_bone2", "death_bone3", "death_skull" } },
            { "humanoid", new[] { "death_monster1", "death_monster2", "death_monster3", "death_monster4", "death_flesh", "death_flesh2", "death_crack1", "death_crack2", "death_bone_shatter1", "death_bone_shatter2" } },
            { "insect", new[] { "death_insect", "death_insect2", "death_crack1", "death_crack2", "death_crack3", "death_crack4", "death_crush2" } },
            { "ghost", new[] { "death_ghost", "death_bone_shatter1", "death_bone_shatter2", "death_bone_shatter3", "death_monster3", "death_monster4" } },
            { "flesh", new[] { "death_flesh", "death_flesh2", "death_crack1", "death_crack2", "death_crack3", "death_crack4", "death_monster1", "death_monster2" } },
            { "bone", new[] { "death_bone", "death_bone2", "death_bone3", "death_skull", "death_bone_shatter1", "death_bone_shatter2", "death_bone_shatter3", "death_bone_shatter4", "death_crush2", "death_ghoul3_v2", "death_ghoul3_v3", "death_ghoul3_v4" } },
            { "beast", new[] { "death_beast1", "death_beast2", "death_beast3", "death_beast4", "death_crack1", "death_crack2", "death_crack3", "death_crack4", "death_crush2", "death_monster1", "death_monster2" } },
            { "magic", new[] { "death_ghost", "death_bone_shatter3", "death_bone_shatter4", "death_monster3", "death_monster4", "death_insect2", "death_crack3" } },
            { "monster", new[] { "death_monster1", "death_monster2", "death_monster3", "death_monster4" } },
        };
    }
}
