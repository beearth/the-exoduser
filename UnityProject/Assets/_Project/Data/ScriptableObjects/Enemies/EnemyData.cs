using UnityEngine;

namespace Exoduser.Data.Enemies
{
    /// <summary>
    /// Enemy type configuration. Defines stats, behavior, and loot.
    /// Create via Assets > Create > Exoduser/Data/Enemy Data.
    /// </summary>
    [CreateAssetMenu(fileName = "NewEnemy", menuName = "Exoduser/Data/Enemy Data")]
    public class EnemyData : ScriptableObject
    {
        [Header("Identity")]
        public string enemyName;
        public EnemyCategory category = EnemyCategory.Normal;

        [Header("Stats")]
        public float maxHp = 50f;
        public float moveSpeed = 4f;
        public float defense = 5f;
        public int element = 0;                   // Element enum value

        [Header("Poise")]
        public float maxPoise = 30f;
        public float poiseRegenRate = 5f;          // per second
        public float staggerDuration = 1.5f;

        [Header("Combat")]
        public EnemyAttackType attackType = EnemyAttackType.Melee;
        public float attackDamage = 10f;
        public float attackRange = 2f;
        public float attackCooldown = 1.5f;
        public float attackWindup = 0.3f;          // telegraph duration
        public float attackArc = 90f;              // melee cone angle

        [Header("Ranged (if applicable)")]
        public string projectilePoolKey = "";
        public float projectileSpeed = 10f;
        public float projectileDamage = 8f;

        [Header("AI")]
        public float detectRange = 12f;
        public float leashRange = 18f;            // return if player too far
        public float patrolRadius = 5f;
        public float idleDuration = 2f;            // time before patrol

        [Header("Boss Settings")]
        public bool isBoss = false;
        public float bossKnockbackResist = 0.05f;
        public float bossStaggerResistPhysical = 0.5f;
        public float bossStaggerResistElemental = 0.2f;
        public float bossStunDuration = 1.6f;
        public float bossImmunityWindow = 5f;

        [Header("Loot")]
        public int expReward = 20;
        public DropEntry[] dropTable;

        [Header("Visual")]
        public Color tintColor = Color.white;
        public float scale = 1f;
    }

    public enum EnemyCategory
    {
        Normal,
        Elite,
        MiniBoss,
        Boss
    }

    public enum EnemyAttackType
    {
        Melee,
        Ranged,
        Hybrid
    }

    [System.Serializable]
    public struct DropEntry
    {
        public string itemId;
        [Range(0f, 1f)]
        public float dropChance;
        public int minCount;
        public int maxCount;
    }
}
