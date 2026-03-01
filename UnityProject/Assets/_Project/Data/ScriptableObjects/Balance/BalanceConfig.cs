using UnityEngine;

namespace Exoduser.Data.Balance
{
    /// <summary>
    /// Global balance configuration. Single instance loaded at boot.
    /// Create via Assets > Create > Exoduser/Data/Balance Config.
    /// </summary>
    [CreateAssetMenu(fileName = "BalanceConfig", menuName = "Exoduser/Data/Balance Config")]
    public class BalanceConfig : ScriptableObject
    {
        [Header("Player Base Stats")]
        public float playerBaseHp = 100f;
        public float playerBaseEnergy = 100f;
        public float playerBaseAttack = 15f;
        public float playerBaseDefense = 10f;
        public float playerMoveSpeed = 8f;
        public float playerDashSpeed = 25f;

        [Header("Level Scaling")]
        public int maxLevel = 100;
        public float expBaseRequirement = 100f;
        public float expGrowthRate = 1.15f;        // expRequired = base * rate^level
        public float hpPerLevel = 5f;
        public float attackPerLevel = 1.5f;
        public float defensePerLevel = 0.8f;

        [Header("Combat")]
        public float globalDamageMultiplier = 1.0f;
        public float criticalHitMultiplier = 1.5f;
        public float criticalHitBaseChance = 0.05f;  // 5%
        public float defenseReductionCap = 0.5f;      // max 50% reduction
        public float groggyBonusDamage = 2.0f;        // staggered enemy takes 2x

        [Header("Shield / Poise")]
        public float shieldElementalMultiplier = 2.0f;
        public float shieldPhysicalMultiplier = 0.7f;
        public float hpElementalMultiplier = 0.1f;

        [Header("Parry")]
        public float parryActiveWindow = 0.15f;       // seconds
        public float parryStartupTime = 0.08f;
        public float parryCooldown = 0.6f;
        public float parryEnergyGain = 30f;
        public float parryCounterMultiplier = 2.0f;

        [Header("Shield Bash")]
        public float shieldBashAngle = 90f;
        public float shieldBashRange = 3.5f;
        public float shieldBashKnockback = 18f;
        public float shieldBashDamage = 15f;
        public float shieldBashCooldown = 1.5f;
        public float shieldBashEnergyCost = 20f;

        [Header("Fan Shot")]
        public int fanShotProjectileCount = 10;
        public float fanShotAngle = 60f;
        public float fanShotCooldown = 4f;
        public float fanShotEnergyCost = 35f;
        public float fanShotDamagePerArrow = 8f;
        public float fanShotHomingStrength = 5f;

        [Header("Dash")]
        public float dashDuration = 0.2f;
        public float dashCooldown = 0.8f;
        public float dashIFrameDuration = 0.15f;       // invincibility frames

        [Header("Energy")]
        public float energyRegenRate = 5f;              // per second
        public float energyRegenDelay = 2f;             // seconds after last use

        [Header("Difficulty Scaling")]
        public float enemyHpScalePerFloor = 1.1f;       // 10% more HP per floor
        public float enemyDamageScalePerFloor = 1.05f;
        public float enemySpeedScalePerFloor = 1.02f;

        [Header("Knockback")]
        public float knockbackDeceleration = 40f;
        public float wallDamagePerSpeed = 3f;
        public float wallDamageMinSpeed = 5f;
        public float wallStunDuration = 1.5f;

        [Header("Element Multipliers")]
        [Tooltip("5x5 matrix: attacker[row] vs defender[col]. Order: Phys,Fire,Ice,Dark,Lightning")]
        public float[] elementMatrix = new float[25]
        {
            // Phys  Fire  Ice   Dark  Ltn   <- defender
            1.0f, 1.0f, 1.0f, 1.2f, 1.0f,  // Physical attacker
            1.0f, 0.5f, 1.5f, 1.0f, 0.5f,  // Fire attacker
            1.0f, 0.5f, 0.5f, 1.0f, 1.5f,  // Ice attacker
            1.2f, 1.0f, 1.0f, 0.5f, 1.0f,  // Dark attacker
            1.0f, 1.5f, 0.5f, 1.0f, 0.5f,  // Lightning attacker
        };

        /// <summary>
        /// Get element multiplier for attacker element vs defender element.
        /// </summary>
        public float GetElementMultiplier(int attackerElement, int defenderElement)
        {
            int idx = attackerElement * 5 + defenderElement;
            if (idx >= 0 && idx < elementMatrix.Length)
                return elementMatrix[idx];
            return 1.0f;
        }
    }
}
