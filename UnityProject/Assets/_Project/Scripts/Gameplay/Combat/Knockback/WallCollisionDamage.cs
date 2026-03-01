using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Combat.Damage;
using Exoduser.Gameplay.Combat.Hit;

namespace Exoduser.Gameplay.Combat.Knockback
{
    /// <summary>
    /// Listens for wall collision events and applies speed-based damage and stun
    /// to entities that slam into walls during knockback. Attach to a persistent
    /// scene manager object.
    /// </summary>
    public class WallCollisionDamage : MonoBehaviour
    {
        [Header("Wall Damage Settings")]
        [SerializeField, Tooltip("Damage dealt per unit of collision speed.")]
        private float _damagePerSpeed = 3f;

        [SerializeField, Tooltip("Minimum collision speed to trigger wall damage.")]
        private float _minSpeedForDamage = 5f;

        [SerializeField, Tooltip("Stun/stagger duration applied on wall impact.")]
        private float _stunDuration = 1.5f;

        [SerializeField, Tooltip("Element type for wall collision damage.")]
        private Element _wallDamageElement = Element.Physical;

        [Header("Visual Feedback")]
        [SerializeField, Tooltip("Pool key for wall impact VFX.")]
        private string _wallImpactVfxKey = "VFX_WallImpact";

        [SerializeField, Tooltip("Screen shake intensity on wall collision.")]
        private float _shakeIntensity = 0.5f;

        [SerializeField, Tooltip("Screen shake duration on wall collision.")]
        private float _shakeDuration = 0.2f;

        private void OnEnable()
        {
            GameEvents.OnWallCollision += HandleWallCollision;
        }

        private void OnDisable()
        {
            GameEvents.OnWallCollision -= HandleWallCollision;
        }

        /// <summary>
        /// Handles wall collision events. Calculates and applies damage based on
        /// the speed at which the entity hit the wall.
        /// </summary>
        /// <param name="entity">The entity that collided with the wall.</param>
        /// <param name="speed">Speed at point of collision.</param>
        private void HandleWallCollision(GameObject entity, float speed)
        {
            if (entity == null) return;
            if (speed < _minSpeedForDamage) return;

            // Calculate damage from collision speed
            float damage = speed * _damagePerSpeed;

            // Apply damage via IDamageable
            var damageable = entity.GetComponent<IDamageable>();
            if (damageable != null && damageable.IsAlive)
            {
                var damageData = new DamageData(
                    source: null, // Wall damage has no source entity
                    baseDamage: damage,
                    knockbackForce: 0f, // No additional knockback from wall hit
                    hitDirection: Vector3.zero,
                    element: _wallDamageElement,
                    ignoreShield: true, // Wall damage bypasses shields
                    poiseBreak: damage * 0.5f,
                    staggerDuration: _stunDuration
                );

                damageable.TakeDamage(damageData);
            }

            // Spawn wall impact VFX from pool
            SpawnWallImpactVfx(entity.transform.position);

            // Screen shake for feedback
            var hitFx = ServiceLocator.Get<HitFx>();
            if (hitFx != null)
            {
                hitFx.DoScreenShake(_shakeIntensity, _shakeDuration);
            }
        }

        private void SpawnWallImpactVfx(Vector3 position)
        {
            var pool = ServiceLocator.Get<ObjectPool>();
            if (pool == null) return;

            GameObject vfx = pool.Get(_wallImpactVfxKey);
            if (vfx != null)
            {
                vfx.transform.position = position;
                vfx.SetActive(true);
            }
        }
    }
}
