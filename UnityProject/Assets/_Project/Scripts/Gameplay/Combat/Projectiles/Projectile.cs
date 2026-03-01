using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Combat.Projectiles
{
    /// <summary>
    /// Base projectile behaviour. Designed to be used with ObjectPool --
    /// call Initialize() when spawning from pool instead of relying on Awake/Start.
    /// Supports piercing, element types, and automatic pool return.
    /// </summary>
    public class Projectile : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField, Tooltip("Projectile travel speed in units/sec.")]
        protected float _speed = 20f;

        [Header("Damage")]
        [SerializeField, Tooltip("Base damage dealt on hit.")]
        protected float _damage = 10f;

        [SerializeField, Tooltip("Knockback force applied to hit targets.")]
        protected float _knockbackForce = 5f;

        [SerializeField, Tooltip("Elemental type of this projectile's damage.")]
        protected Element _element = Element.Physical;

        [Header("Behavior")]
        [SerializeField, Tooltip("Time in seconds before the projectile auto-despawns.")]
        protected float _lifetime = 5f;

        [SerializeField, Tooltip("Number of targets this projectile can pierce through. 0 = destroyed on first hit.")]
        protected int _pierceCount;

        [SerializeField, Tooltip("Tag of the owner (Player or Enemy). Projectile won't damage same-tag entities.")]
        protected string _ownerTag = "Player";

        [Header("Pool")]
        [SerializeField, Tooltip("Key used to return this projectile to the ObjectPool.")]
        protected string _poolKey = "Projectile_Default";

        [Header("VFX")]
        [SerializeField, Tooltip("Pool key for impact VFX spawned on hit or wall collision.")]
        protected string _impactVfxKey = "VFX_ProjectileImpact";

        [Header("Collision")]
        [SerializeField, Tooltip("Layer mask for walls that destroy the projectile.")]
        protected LayerMask _wallLayer;

        protected GameObject _owner;
        protected float _remainingLifetime;
        protected int _remainingPierces;
        protected bool _isActive;

        /// <summary>
        /// Initializes the projectile with runtime parameters. Call this instead of
        /// setting fields directly when spawning from a pool.
        /// </summary>
        /// <param name="speed">Travel speed.</param>
        /// <param name="damage">Base damage.</param>
        /// <param name="knockback">Knockback force.</param>
        /// <param name="lifetime">Seconds before auto-despawn.</param>
        /// <param name="element">Elemental type.</param>
        /// <param name="poolKey">Pool key for return.</param>
        public virtual void Initialize(float speed, float damage, float knockback,
            float lifetime, Element element, string poolKey)
        {
            _speed = speed;
            _damage = damage;
            _knockbackForce = knockback;
            _lifetime = lifetime;
            _element = element;
            _poolKey = poolKey;

            _remainingLifetime = _lifetime;
            _remainingPierces = _pierceCount;
            _isActive = true;
        }

        /// <summary>
        /// Sets the owner of this projectile. The projectile will not damage
        /// GameObjects with the same tag as the owner.
        /// </summary>
        /// <param name="owner">The GameObject that fired this projectile.</param>
        public void SetOwner(GameObject owner)
        {
            _owner = owner;
            _ownerTag = owner != null ? owner.tag : "Player";
        }

        protected virtual void Update()
        {
            if (!_isActive) return;

            // Move forward
            transform.Translate(Vector3.forward * (_speed * Time.deltaTime), Space.Self);

            // Lifetime countdown
            _remainingLifetime -= Time.deltaTime;
            if (_remainingLifetime <= 0f)
            {
                ReturnToPool();
            }
        }

        protected virtual void OnTriggerEnter(Collider other)
        {
            if (!_isActive) return;

            // Wall collision check
            if ((_wallLayer.value & (1 << other.gameObject.layer)) != 0)
            {
                SpawnImpactVfx(transform.position);
                ReturnToPool();
                return;
            }

            // Don't damage same-tag entities (friendly fire prevention)
            if (other.CompareTag(_ownerTag)) return;

            // Try to damage the target
            var damageable = other.GetComponent<IDamageable>();
            if (damageable == null || !damageable.IsAlive) return;

            // Calculate hit direction from projectile to target
            Vector3 hitDir = (other.transform.position - transform.position).normalized;

            var damageData = new DamageData(
                source: _owner,
                baseDamage: _damage,
                knockbackForce: _knockbackForce,
                hitDirection: hitDir,
                element: _element
            );

            // Apply damage through DamageSystem if available, otherwise direct
            var damageSystem = ServiceLocator.Get<DamageSystem>();
            if (damageSystem != null)
            {
                damageSystem.ApplyDamage(damageData, other.gameObject);
            }
            else
            {
                damageable.TakeDamage(damageData);
            }

            // Spawn impact VFX at hit point
            SpawnImpactVfx(other.ClosestPoint(transform.position));

            // Pierce handling
            _remainingPierces--;
            if (_remainingPierces < 0)
            {
                ReturnToPool();
            }
        }

        /// <summary>
        /// Returns this projectile to the object pool and deactivates it.
        /// </summary>
        protected virtual void ReturnToPool()
        {
            _isActive = false;

            var pool = ServiceLocator.Get<ObjectPool>();
            if (pool != null)
            {
                pool.Return(_poolKey, gameObject);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Spawns an impact VFX at the given position from the object pool.
        /// </summary>
        protected void SpawnImpactVfx(Vector3 position)
        {
            if (string.IsNullOrEmpty(_impactVfxKey)) return;

            var pool = ServiceLocator.Get<ObjectPool>();
            if (pool == null) return;

            GameObject vfx = pool.Get(_impactVfxKey);
            if (vfx != null)
            {
                vfx.transform.position = position;
                vfx.transform.rotation = Quaternion.LookRotation(-transform.forward);
                vfx.SetActive(true);
            }
        }
    }
}
