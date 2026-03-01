using UnityEngine;

namespace Exoduser.Data.Skills
{
    /// <summary>
    /// Configuration data for player skills (e.g., Fan Shot, Shield Bash).
    /// Create via Assets > Create > Exoduser/Data/Skill Data.
    /// </summary>
    [CreateAssetMenu(fileName = "NewSkill", menuName = "Exoduser/Data/Skill Data")]
    public class SkillData : ScriptableObject
    {
        [Header("Identity")]
        public string skillName;
        [TextArea(2, 4)]
        public string description;
        public Sprite icon;

        [Header("Cost & Cooldown")]
        public float energyCost = 20f;
        public float cooldown = 4f;

        [Header("Damage")]
        public float damageCoefficient = 1.0f;  // multiplied by player ATK
        public float knockbackForce = 5f;
        public int element = 0;  // maps to Element enum (0=Physical)

        [Header("Projectile (if applicable)")]
        public int projectileCount = 1;
        public float fanAngleDegrees = 60f;     // total spread angle
        public float projectileSpeed = 15f;
        public float projectileLifetime = 3f;
        public float homingStrength = 5f;        // 0 = no homing
        public bool projectilePierces = false;
        public int maxPierceCount = 0;

        [Header("AoE (if applicable)")]
        public float aoeRadius = 0f;             // 0 = no AoE
        public float aoeDuration = 0f;

        [Header("Melee (if applicable)")]
        public float meleeArc = 90f;             // cone angle
        public float meleeRange = 3f;
        public float activeDuration = 0.25f;     // active frames window
    }
}
