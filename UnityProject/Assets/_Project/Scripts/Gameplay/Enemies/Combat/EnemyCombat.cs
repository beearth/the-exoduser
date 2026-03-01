using UnityEngine;
using Exoduser.Core;
using Exoduser.Core.Utils;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Enemies.Combat
{
    /// <summary>
    /// Handles enemy attack execution — both melee and ranged.
    /// Attach alongside <see cref="Exoduser.Gameplay.Enemies.AI.EnemyAI"/>
    /// for enemies that need configurable attack behaviour.
    /// </summary>
    public class EnemyCombat : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Attack Type
        // ──────────────────────────────────────────────

        /// <summary>
        /// The type of attack this enemy performs.
        /// </summary>
        public enum AttackType
        {
            Melee,
            Ranged
        }

        // ──────────────────────────────────────────────
        //  Serialized — General
        // ──────────────────────────────────────────────

        [Header("Attack Configuration")]
        [SerializeField, Tooltip("Whether this enemy attacks with melee or ranged.")]
        private AttackType _attackType = AttackType.Melee;

        [SerializeField, Tooltip("Base damage dealt by this enemy's attack.")]
        private float _attackDamage = 10f;

        [SerializeField, Tooltip("Poise damage dealt to the target.")]
        private float _poiseBreak = 5f;

        [SerializeField, Tooltip("Knockback force applied on hit.")]
        private float _knockbackForce = 3f;

        [SerializeField, Tooltip("Element of the attack.")]
        private Element _attackElement = Element.Physical;

        [SerializeField, Tooltip("Windup duration in seconds before the attack lands.")]
        private float _windupDuration = 0.3f;

        // ──────────────────────────────────────────────
        //  Serialized — Melee
        // ──────────────────────────────────────────────

        [Header("Melee Settings")]
        [SerializeField, Tooltip("Melee attack range (distance from enemy center).")]
        private float _meleeRange = 2f;

        [SerializeField, Tooltip("Total arc of the melee swing in degrees.")]
        private float _attackArc = 90f;

        [SerializeField, Tooltip("LayerMask for detecting player.")]
        private LayerMask _targetMask;

        // ──────────────────────────────────────────────
        //  Serialized — Ranged
        // ──────────────────────────────────────────────

        [Header("Ranged Settings")]
        [SerializeField, Tooltip("Object pool key for projectile prefab.")]
        private string _projectilePoolKey = "EnemyProjectile";

        [SerializeField, Tooltip("Speed of ranged projectiles.")]
        private float _projectileSpeed = 12f;

        [SerializeField, Tooltip("Damage dealt by ranged projectile (overrides _attackDamage if set > 0).")]
        private float _projectileDamage;

        [SerializeField, Tooltip("Offset from enemy center where projectile spawns.")]
        private Vector3 _projectileSpawnOffset = new Vector3(0f, 1f, 0.5f);

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private bool _isWindingUp;
        private float _windupTimer;
        private Transform _currentTarget;

        /// <summary>True while the enemy is in the windup phase before an attack.</summary>
        public bool IsWindingUp => _isWindingUp;

        /// <summary>True once the attack has been fully executed this cycle.</summary>
        public bool AttackComplete { get; private set; }

        // Shared overlap buffer to avoid allocations
        private static readonly Collider[] OverlapBuffer = new Collider[32];

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>
        /// Begins an attack directed at <paramref name="target"/>. The attack
        /// resolves after the windup duration.
        /// </summary>
        /// <param name="target">The transform to aim the attack at.</param>
        public void ExecuteAttack(Transform target)
        {
            if (_isWindingUp) return;

            _currentTarget = target;
            _isWindingUp = true;
            _windupTimer = 0f;
            AttackComplete = false;
        }

        /// <summary>
        /// Cancels any in-progress windup (e.g., if the enemy is staggered).
        /// </summary>
        public void CancelAttack()
        {
            _isWindingUp = false;
            _windupTimer = 0f;
            _currentTarget = null;
            AttackComplete = false;
        }

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void Update()
        {
            if (!_isWindingUp) return;

            _windupTimer += Time.deltaTime;

            if (_windupTimer >= _windupDuration)
            {
                _isWindingUp = false;
                ResolveAttack();
                AttackComplete = true;
            }
        }

        // ──────────────────────────────────────────────
        //  Attack Resolution
        // ──────────────────────────────────────────────

        private void ResolveAttack()
        {
            switch (_attackType)
            {
                case AttackType.Melee:
                    ResolveMelee();
                    break;
                case AttackType.Ranged:
                    ResolveRanged();
                    break;
            }
        }

        private void ResolveMelee()
        {
            // Collect all targets in range
            int count = Physics.OverlapSphereNonAlloc(
                transform.position, _meleeRange, OverlapBuffer, _targetMask);

            float halfAngle = _attackArc * 0.5f;
            Vector3 forward = transform.forward;
            forward.y = 0f;

            for (int i = 0; i < count; i++)
            {
                Collider col = OverlapBuffer[i];
                if (col == null) continue;

                // Skip self
                if (col.gameObject == gameObject) continue;

                // Cone check
                if (!MathUtils.IsInCone(transform.position, forward, col.transform.position,
                    halfAngle, _meleeRange))
                    continue;

                // Attempt to damage
                var damageable = col.GetComponent<IDamageable>();
                if (damageable == null || !damageable.IsAlive) continue;

                Vector3 hitDir = MathUtils.GetKnockbackDirection(transform.position, col.transform.position);

                var damageData = new DamageData(
                    source: gameObject,
                    baseDamage: _attackDamage,
                    knockbackForce: _knockbackForce,
                    hitDirection: hitDir,
                    element: _attackElement,
                    poiseBreak: _poiseBreak
                );

                damageable.TakeDamage(damageData);

                // Apply knockback
                var knockbackable = col.GetComponent<IKnockbackable>();
                if (knockbackable != null && !knockbackable.IsKnockbackImmune)
                {
                    knockbackable.ApplyKnockback(hitDir * _knockbackForce);
                }
            }
        }

        private void ResolveRanged()
        {
            if (_currentTarget == null) return;

            ObjectPool pool = ServiceLocator.Get<ObjectPool>();
            if (pool == null || !pool.HasPool(_projectilePoolKey))
            {
                Debug.LogWarning($"[EnemyCombat] Pool '{_projectilePoolKey}' not found. Cannot fire projectile.");
                return;
            }

            // Spawn projectile
            GameObject projGO = pool.Get(_projectilePoolKey);
            if (projGO == null) return;

            // Position at spawn offset (local space)
            Vector3 spawnPos = transform.TransformPoint(_projectileSpawnOffset);
            projGO.transform.position = spawnPos;

            // Aim at target
            Vector3 targetPos = _currentTarget.position;
            targetPos.y = spawnPos.y; // Keep projectile level on XZ plane
            Vector3 direction = (targetPos - spawnPos).normalized;

            if (direction.sqrMagnitude < 0.001f)
                direction = transform.forward;

            projGO.transform.rotation = Quaternion.LookRotation(direction, Vector3.up);

            // Configure projectile via its Rigidbody
            var rb = projGO.GetComponent<Rigidbody>();
            if (rb != null)
            {
                rb.linearVelocity = direction * _projectileSpeed;
            }

            // Configure projectile damage via a generic interface if present
            var projDamageable = projGO.GetComponent<IProjectileDamageSource>();
            if (projDamageable != null)
            {
                float dmg = _projectileDamage > 0f ? _projectileDamage : _attackDamage;
                projDamageable.SetDamageData(new DamageData(
                    source: gameObject,
                    baseDamage: dmg,
                    knockbackForce: _knockbackForce,
                    hitDirection: direction,
                    element: _attackElement,
                    poiseBreak: _poiseBreak
                ));
            }
        }

        // ──────────────────────────────────────────────
        //  Gizmos
        // ──────────────────────────────────────────────

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (_attackType == AttackType.Melee)
            {
                Gizmos.color = new Color(1f, 0.3f, 0.3f, 0.3f);
                Gizmos.DrawWireSphere(transform.position, _meleeRange);

                // Draw arc edges
                Vector3 forward = transform.forward;
                forward.y = 0f;
                if (forward.sqrMagnitude < 0.001f) forward = Vector3.forward;
                forward.Normalize();

                float half = _attackArc * 0.5f;
                Vector3 left = Quaternion.AngleAxis(-half, Vector3.up) * forward;
                Vector3 right = Quaternion.AngleAxis(half, Vector3.up) * forward;

                Gizmos.color = Color.red;
                Gizmos.DrawRay(transform.position, left * _meleeRange);
                Gizmos.DrawRay(transform.position, right * _meleeRange);
            }
            else if (_attackType == AttackType.Ranged)
            {
                Gizmos.color = Color.yellow;
                Vector3 spawnPos = transform.TransformPoint(_projectileSpawnOffset);
                Gizmos.DrawWireSphere(spawnPos, 0.15f);
                Gizmos.DrawRay(spawnPos, transform.forward * 2f);
            }
        }
#endif
    }

    // ──────────────────────────────────────────────
    //  Projectile Interface
    // ──────────────────────────────────────────────

    /// <summary>
    /// Optional interface for pooled projectiles that need damage data set externally.
    /// </summary>
    public interface IProjectileDamageSource
    {
        /// <summary>
        /// Configures the projectile with the given damage payload.
        /// Called by <see cref="EnemyCombat"/> when spawning a ranged attack.
        /// </summary>
        void SetDamageData(DamageData data);
    }
}
