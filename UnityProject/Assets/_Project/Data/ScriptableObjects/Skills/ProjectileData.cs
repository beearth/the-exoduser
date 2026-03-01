using UnityEngine;

namespace Exoduser.Data.Skills
{
    /// <summary>
    /// Configuration for individual projectile behavior.
    /// Create via Assets > Create > Exoduser/Data/Projectile Data.
    /// </summary>
    [CreateAssetMenu(fileName = "NewProjectile", menuName = "Exoduser/Data/Projectile Data")]
    public class ProjectileData : ScriptableObject
    {
        [Header("Movement")]
        public float speed = 15f;
        public float lifetime = 3f;
        public float acceleration = 0f;         // speed change per second
        public float maxSpeed = 30f;

        [Header("Homing")]
        public bool isHoming = false;
        public float homingStrength = 5f;        // rotation speed (deg/s)
        public float homingActivationDelay = 0.1f; // straight flight before homing
        public float maxHomingAngle = 120f;       // won't track targets behind

        [Header("Damage")]
        public float baseDamage = 10f;
        public float knockbackForce = 3f;
        public int element = 0;                  // Element enum value

        [Header("Pierce")]
        public bool canPierce = false;
        public int maxPierceCount = 0;           // 0 = destroy on hit
        public float damageFalloffPerPierce = 0.8f; // 80% damage after each pierce

        [Header("Visual")]
        public float scale = 1f;
        public Color trailColor = Color.white;
        public float trailWidth = 0.1f;

        [Header("Impact")]
        public float impactAoeRadius = 0f;       // 0 = no AoE on impact
        public string impactVfxPoolKey = "";
        public string impactSfxKey = "";

        [Header("Pool")]
        public string poolKey = "DefaultProjectile";
    }
}
