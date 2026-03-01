using UnityEngine;
using Exoduser.Core;
using Exoduser.Core.Utils;
using Exoduser.Gameplay.Combat.Damage;
using Exoduser.Gameplay.Combat.Knockback;

namespace Exoduser.Gameplay.Enemies.AI
{
    /// <summary>
    /// Main AI brain for enemies. Implements <see cref="IDamageable"/> and
    /// <see cref="IKnockbackable"/>. Works in tandem with <see cref="EnemyStateMachine"/>
    /// and optionally <see cref="Exoduser.Gameplay.Enemies.Combat.EnemyCombat"/>.
    /// </summary>
    [RequireComponent(typeof(EnemyStateMachine))]
    [RequireComponent(typeof(CharacterController))]
    public class EnemyAI : MonoBehaviour, IDamageable, IKnockbackable
    {
        // ──────────────────────────────────────────────
        //  Serialized — Stats
        // ──────────────────────────────────────────────

        [Header("Health")]
        [SerializeField, Tooltip("Maximum hit points.")]
        private float _maxHp = 50f;

        [Header("Movement")]
        [SerializeField, Tooltip("Movement speed in units per second.")]
        private float _moveSpeed = 4f;

        [Header("Detection")]
        [SerializeField, Tooltip("Radius within which the enemy detects the player.")]
        private float _detectRange = 12f;

        [Header("Attack")]
        [SerializeField, Tooltip("Distance at which the enemy can begin an attack.")]
        private float _attackRange = 2f;

        [SerializeField, Tooltip("Cooldown between attacks in seconds.")]
        private float _attackCooldown = 1.5f;

        [SerializeField, Tooltip("Base attack damage.")]
        private float _attackDamage = 10f;

        [Header("Poise")]
        [SerializeField, Tooltip("Maximum poise value. Poise break causes stagger.")]
        private float _maxPoise = 30f;

        [SerializeField, Tooltip("Poise regeneration per second while not staggered.")]
        private float _poiseRegenRate = 5f;

        [Header("Stagger")]
        [SerializeField, Tooltip("Duration of stagger state in seconds.")]
        private float _staggerDuration = 1.2f;

        [Header("Boss")]
        [SerializeField, Tooltip("If true, this enemy is a boss and resists knockback.")]
        private bool _isBoss;

        [Header("Death")]
        [SerializeField, Tooltip("Duration of the death shrink animation in seconds.")]
        private float _deathDuration = 0.5f;

        // ──────────────────────────────────────────────
        //  Runtime State
        // ──────────────────────────────────────────────

        private float _currentHp;
        private float _currentPoise;
        private float _attackCooldownTimer;
        private float _deathTimer;
        private Vector3 _deathOriginalScale;

        // ──────────────────────────────────────────────
        //  References
        // ──────────────────────────────────────────────

        private EnemyStateMachine _stateMachine;
        private CharacterController _controller;
        private KnockbackSystem _knockbackSystem;
        private Transform _player;
        private Collider _collider;

        // ──────────────────────────────────────────────
        //  IDamageable / IKnockbackable
        // ──────────────────────────────────────────────

        /// <inheritdoc />
        public bool IsAlive => _currentHp > 0f;

        /// <inheritdoc />
        public bool IsKnockbackImmune => _isBoss;

        /// <summary>Current HP, exposed for UI health bars.</summary>
        public float CurrentHp => _currentHp;

        /// <summary>Maximum HP.</summary>
        public float MaxHp => _maxHp;

        /// <summary>Current poise value.</summary>
        public float CurrentPoise => _currentPoise;

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _stateMachine = GetComponent<EnemyStateMachine>();
            _controller = GetComponent<CharacterController>();
            _knockbackSystem = GetComponent<KnockbackSystem>();
            _collider = GetComponent<Collider>();

            _currentHp = _maxHp;
            _currentPoise = _maxPoise;

            RegisterStates();
        }

        private void Start()
        {
            // Find the player by tag
            GameObject playerGO = GameObject.FindGameObjectWithTag("Player");
            if (playerGO != null)
                _player = playerGO.transform;

            _stateMachine.ChangeState(EnemyState.Idle);
        }

        // ──────────────────────────────────────────────
        //  State Registration
        // ──────────────────────────────────────────────

        private void RegisterStates()
        {
            // Idle
            _stateMachine.RegisterState(
                EnemyState.Idle,
                onEnter: OnIdleEnter,
                onUpdate: OnIdleUpdate
            );

            // Patrol
            _stateMachine.RegisterState(
                EnemyState.Patrol,
                onUpdate: OnPatrolUpdate
            );

            // Chase
            _stateMachine.RegisterState(
                EnemyState.Chase,
                onUpdate: OnChaseUpdate
            );

            // Attack
            _stateMachine.RegisterState(
                EnemyState.Attack,
                onEnter: OnAttackEnter,
                onUpdate: OnAttackUpdate
            );

            // Stagger
            _stateMachine.RegisterState(
                EnemyState.Stagger,
                onEnter: OnStaggerEnter,
                onUpdate: OnStaggerUpdate
            );

            // Dead
            _stateMachine.RegisterState(
                EnemyState.Dead,
                onEnter: OnDeadEnter,
                onUpdate: OnDeadUpdate
            );
        }

        // ──────────────────────────────────────────────
        //  Idle State
        // ──────────────────────────────────────────────

        private void OnIdleEnter()
        {
            // Reset cooldown timer so enemy doesn't attack instantly after returning to idle
        }

        private void OnIdleUpdate()
        {
            RegeneratePoise();

            if (_player == null) return;

            float distSqr = FlatDistanceSqr(transform.position, _player.position);
            if (distSqr <= _detectRange * _detectRange)
            {
                _stateMachine.ChangeState(EnemyState.Chase);
            }
        }

        // ──────────────────────────────────────────────
        //  Patrol State
        // ──────────────────────────────────────────────

        private void OnPatrolUpdate()
        {
            RegeneratePoise();

            if (_player == null) return;

            float distSqr = FlatDistanceSqr(transform.position, _player.position);
            if (distSqr <= _detectRange * _detectRange)
            {
                _stateMachine.ChangeState(EnemyState.Chase);
            }
        }

        // ──────────────────────────────────────────────
        //  Chase State
        // ──────────────────────────────────────────────

        private void OnChaseUpdate()
        {
            RegeneratePoise();
            _attackCooldownTimer -= Time.deltaTime;

            if (_player == null)
            {
                _stateMachine.ChangeState(EnemyState.Idle);
                return;
            }

            float distSqr = FlatDistanceSqr(transform.position, _player.position);
            float leashRange = _detectRange * 1.5f;

            // Lost the player — return to idle
            if (distSqr > leashRange * leashRange)
            {
                _stateMachine.ChangeState(EnemyState.Idle);
                return;
            }

            // In attack range and cooldown is ready
            if (distSqr <= _attackRange * _attackRange && _attackCooldownTimer <= 0f)
            {
                _stateMachine.ChangeState(EnemyState.Attack);
                return;
            }

            // Move toward player
            MoveToward(_player.position);
        }

        // ──────────────────────────────────────────────
        //  Attack State
        // ──────────────────────────────────────────────

        private float _attackTimer;
        private bool _attackLanded;

        private void OnAttackEnter()
        {
            _attackTimer = 0f;
            _attackLanded = false;

            // Face the player
            if (_player != null)
                FaceTarget(_player.position);
        }

        private void OnAttackUpdate()
        {
            _attackTimer += Time.deltaTime;

            // Windup phase (0.3s) then strike
            if (!_attackLanded && _attackTimer >= 0.3f)
            {
                _attackLanded = true;
                PerformMeleeAttack();
            }

            // Full attack animation done — return to chase
            if (_attackTimer >= 0.6f)
            {
                _attackCooldownTimer = _attackCooldown;
                _stateMachine.ChangeState(EnemyState.Chase);
            }
        }

        private void PerformMeleeAttack()
        {
            if (_player == null) return;

            float distSqr = FlatDistanceSqr(transform.position, _player.position);
            float effectiveRange = _attackRange * 1.2f; // Slight grace range

            if (distSqr > effectiveRange * effectiveRange) return;

            // Check if player is in front of enemy (90-degree cone)
            Vector3 forward = transform.forward;
            forward.y = 0f;
            if (!MathUtils.IsInCone(transform.position, forward, _player.position, 45f, effectiveRange))
                return;

            // Build damage data
            Vector3 hitDir = MathUtils.GetKnockbackDirection(transform.position, _player.position);
            var damageData = new DamageData(
                source: gameObject,
                baseDamage: _attackDamage,
                knockbackForce: 3f,
                hitDirection: hitDir,
                element: Element.Physical
            );

            // Apply to player
            var damageable = _player.GetComponent<IDamageable>();
            if (damageable != null && damageable.IsAlive)
            {
                damageable.TakeDamage(damageData);
                GameEvents.RaisePlayerHit(_attackDamage);
            }
        }

        // ──────────────────────────────────────────────
        //  Stagger State
        // ──────────────────────────────────────────────

        private void OnStaggerEnter()
        {
            // Enemy is stunned — cannot move or attack
        }

        private void OnStaggerUpdate()
        {
            if (_stateMachine.StateTimer >= _staggerDuration)
            {
                // Reset poise and resume combat
                _currentPoise = _maxPoise;
                _stateMachine.ChangeState(EnemyState.Chase);
            }
        }

        // ──────────────────────────────────────────────
        //  Dead State
        // ──────────────────────────────────────────────

        private void OnDeadEnter()
        {
            // Disable collider so enemy can't be hit again
            if (_collider != null)
                _collider.enabled = false;

            if (_controller != null)
                _controller.enabled = false;

            _deathOriginalScale = transform.localScale;
            _deathTimer = 0f;

            // Fire kill event
            GameEvents.RaiseEnemyKilled(gameObject);
        }

        private void OnDeadUpdate()
        {
            _deathTimer += Time.deltaTime;

            // Shrink over _deathDuration seconds
            float t = Mathf.Clamp01(_deathTimer / _deathDuration);
            transform.localScale = Vector3.Lerp(_deathOriginalScale, Vector3.zero, t);

            if (_deathTimer >= _deathDuration)
            {
                // Try to return to pool, otherwise destroy
                Destroy(gameObject);
            }
        }

        // ──────────────────────────────────────────────
        //  IDamageable Implementation
        // ──────────────────────────────────────────────

        /// <inheritdoc />
        public void TakeDamage(DamageData data)
        {
            if (!IsAlive) return;
            if (_stateMachine.CurrentState == EnemyState.Dead) return;

            // Reduce HP
            _currentHp -= data.BaseDamage;
            _currentHp = Mathf.Max(_currentHp, 0f);

            // Reduce poise
            _currentPoise -= data.PoiseBreak;

            // Fire hit event
            Vector3 knockbackVec = data.HitDirection * data.KnockbackForce;
            var result = new DamageResult(
                target: gameObject,
                damage: data.BaseDamage,
                knockback: knockbackVec,
                isCritical: false,
                element: (int)data.Element
            );
            GameEvents.RaiseEnemyHit(result);

            // Check death
            if (_currentHp <= 0f)
            {
                _stateMachine.ChangeState(EnemyState.Dead);
                return;
            }

            // Check poise break → stagger
            if (_currentPoise <= 0f && _stateMachine.CurrentState != EnemyState.Stagger)
            {
                _stateMachine.ForceState(EnemyState.Stagger);
            }
        }

        // ──────────────────────────────────────────────
        //  IKnockbackable Implementation
        // ──────────────────────────────────────────────

        /// <inheritdoc />
        public void ApplyKnockback(Vector3 force)
        {
            if (IsKnockbackImmune) return;

            if (_knockbackSystem != null)
            {
                _knockbackSystem.ApplyKnockback(force);
            }
        }

        // ──────────────────────────────────────────────
        //  Helpers
        // ──────────────────────────────────────────────

        private void MoveToward(Vector3 target)
        {
            if (_controller == null || !_controller.enabled) return;
            if (_knockbackSystem != null && _knockbackSystem.IsBeingKnockedBack) return;

            Vector3 dir = target - transform.position;
            dir.y = 0f;

            if (dir.sqrMagnitude < 0.01f) return;

            dir.Normalize();
            FaceDirection(dir);

            Vector3 move = dir * (_moveSpeed * Time.deltaTime);
            move.y = Physics.gravity.y * Time.deltaTime; // Simple gravity
            _controller.Move(move);
        }

        private void FaceTarget(Vector3 target)
        {
            Vector3 dir = target - transform.position;
            dir.y = 0f;
            if (dir.sqrMagnitude > 0.001f)
                FaceDirection(dir.normalized);
        }

        private void FaceDirection(Vector3 dir)
        {
            if (dir.sqrMagnitude > 0.001f)
                transform.rotation = Quaternion.LookRotation(dir, Vector3.up);
        }

        private void RegeneratePoise()
        {
            if (_currentPoise < _maxPoise)
            {
                _currentPoise += _poiseRegenRate * Time.deltaTime;
                _currentPoise = Mathf.Min(_currentPoise, _maxPoise);
            }
        }

        /// <summary>
        /// Squared distance on the XZ plane (ignores Y).
        /// </summary>
        private static float FlatDistanceSqr(Vector3 a, Vector3 b)
        {
            float dx = a.x - b.x;
            float dz = a.z - b.z;
            return dx * dx + dz * dz;
        }
    }
}
