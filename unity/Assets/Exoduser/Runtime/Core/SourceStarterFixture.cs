namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// Fixed, offline original mkP/defaultItems/applyStats capture. The native
    /// runtime never invokes JavaScript. This is one genuine seeded starting
    /// loadout, with basic weapon selected explicitly; not a full new-run factory.
    /// Full raw equipment and extraction provenance are in starter-fixture.json.
    /// </summary>
    public static class SourceStarterFixture
    {
        public const string SourceSha256 = "dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209";
        public const uint Seed = 0x20261024;
        public const int SourceRandomDrawCount = 505;
        public const string WeaponName = "녹슨 검";
        public const string DefaultSkillPending = "kiSlash";

        public static SimulationConfig CreateBasicWeapon()
        {
            return new SimulationConfig {
                Profile = "source-starter-seed-20261024-basic-weapon",
                PlayerMaxHp = 526, PlayerBaseAttack = 15, PlayerSpeed = 2.7196f,
                PlayerMaxStamina = 240, PlayerMaxMana = 330,
                PlayerMaxShield = 285, PlayerStartingShield = 285,
                PlayerHpRegen = .05f, PlayerStaminaRegen = .05f, PlayerManaRegen = .05f,
                PlayerPhysicalDefense = 100, PlayerCriticalChance = 0, PlayerCriticalMultiplier = 1.5f,
                AttackSpeedMultiplier = 1.0336f, DamageMultiplier = .7, AccessoryDamageBonus = 0,
                DropBonus = 1, WeaponAttack = 18, WeaponSpeed = .45f, WeaponRange = 54, WeaponArc = .95f,
                InitialIframes = 600
            };
        }
    }
}
