using UnityEngine;
using Exoduser.Core;
using Exoduser.Core.Utils;
using Exoduser.Gameplay.Player.Energy;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Player.Combat
{
    /// <summary>
    /// Cone-shaped melee knockback attack. Detects enemies in a forward arc,
    /// deals damage, and applies knockback.
    /// </summary>
    [RequireComponent(typeof(PlayerController))]
    [RequireComponent(typeof(PlayerEnergy))]
    public class PlayerShieldBash : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Inspector — Tuning
        // ──────────────────────────────────────────────

        [Header("Cone Shape")]
        [Tooltip("Total cone angle in degrees (half-angle is used for the check).")]
        [SerializeField] private float _bashAngle = 90f;

        [Tooltip("Maximum range of the shield bash (world units).")]
        [SerializeField] private float _bashRange = 3.5f;

        [Header("Damage & Knockback")]
        [Tooltip("Flat damage dealt to each enemy caught in the cone.")]
        [SerializeField] private float _bashDamage = 15f;

        [Tooltip("Knockback force applied to each hit enemy.")]
        [SerializeField] private float _bashKnockbackForce = 18f;

        [Header("Timing")]
        [Tooltip("Duration of the active bash window (seconds).")]
        [SerializeField] private float _bashDuration = 0.25f;

        [Tooltip("Cooldown between consecutive bashes (seconds).")]
        [SerializeField] private float _bashCooldown = 1.5f;

        [Header("Energy")]
        [Tooltip("Energy cost per bash.")]
        [SerializeField] private float _energyCost = 20f;

        [Header("Physics")]
        [Tooltip("LayerMask used for OverlapSphere to detect enemies.")]
        [SerializeField] private LayerMask _enemyLayerMask;

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private PlayerController _controller;
        private PlayerEnergy _energy;

        private float _cooldownTimer;
        private float _activeTimer;
        private bool _isActive;

        // Reusable buffer for OverlapSphere results to avoid GC allocations.
        private readonly Collider[] _hitBuffer = new Collider[32];

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary><c>true</c> while the bash animation window is active.</summary>
        public bool IsActive => _isActive;

        /// <summary>Remaining cooldown time in seconds.</summary>
        public float CooldownRemaining => Mathf.Max(0f, _cooldownTimer);

        /// <summary>
        /// Attempts to execute a shield bash towards <paramref name="aimDir"/>.
        /// Fails silently if on cooldown or the player lacks energy.
        /// </summary>
        public void Execute(Vector3 aimDir)
        {
            if (_cooldownTimer > 0f) return;
            if (_energy == null || !_energy.Consume(_energyCost)) return;

            _cooldownTimer = _bashCooldown;
            _activeTimer = _bashDuration;
            _isActive = true;

            // Transition player state
            if (_controller != null)
                _controller.ChangeState(PlayerState.ShieldBashing);

            // Normalise aim on XZ plane
            aimDir.y = 0f;
            if (aimDir.sqrMagnitude < 0.001f)
                aimDir = transform.forward;
            else
                aimDir.Normalize();

            // Rotate player to face bash direction
            transform.rotation = Quaternion.LookRotation(aimDir, Vector3.up);

            // Detect and damage enemies in the cone
            PerformBashHitScan(aimDir);
        }

        /// <summary>
        /// Ticks the active bash timer. Called by <see cref="PlayerController"/> each frame
        /// while the player is in the <see cref="PlayerState.ShieldBashing"/> state.
        /// </summary>
        public void Tick(float deltaTime)
        {
            if (_isActive)
            {
                _activeTimer -= deltaTime;
                if (_activeTimer <= 0f)
                    _isActive = false;
            }
        }

        // ──────────────────────────────────────────────
        //  Unity lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _controller = GetComponent<PlayerController>();
            _energy = GetComponent<PlayerEnergy>();
        }

        private void Update()
        {
            if (_cooldownTimer > 0f)
                _cooldownTimer -= Time.deltaTime;
        }

        // ──────────────────────────────────────────────
        //  Internal
        // ──────────────────────────────────────────────

        private void PerformBashHitScan(Vector3 aimDir)
        {
            Vector3 origin = transform.position;
            float halfAngle = _bashAngle * 0.5f;

            int count = Physics.OverlapSphereNonAlloc(origin, _bashRange, _hitBuffer, _enemyLayerMask);

            for (int i = 0; i < count; i++)
            {
                Collider col = _hitBuffer[i];
                if (col == null) continue;

                Vector3 targetPos = col.transform.position;

                // Cone check using the shared utility
                if (!MathUtils.IsInCone(origin, aimDir, targetPos, halfAngle, _bashRange))
                    continue;

                // Knockback direction from player towards the enemy
                Vector3 knockDir = (targetPos - origin);
                knockDir.y = 0f;
                if (knockDir.sqrMagnitude > 0.001f)
                    knockDir.Normalize();
                else
                    knockDir = aimDir;

                Vector3 knockback = knockDir * _bashKnockbackForce;

                // Apply damage via IDamageable
                IDamageable damageable = col.GetComponent<IDamageable>();
                if (damageable != null)
                {
                    DamageData dmg = new DamageData(
                        source: gameObject,
                        baseDamage: _bashDamage,
                        knockbackForce: _bashKnockbackForce,
                        hitDirection: knockDir,
                        element: Element.Physical
                    );
                    damageable.TakeDamage(dmg);
                }

                // Broadcast event for other systems (VFX, camera shake, etc.)
                GameEvents.RaiseShieldBashHit(col.gameObject, knockback);
            }
        }
    }
}
