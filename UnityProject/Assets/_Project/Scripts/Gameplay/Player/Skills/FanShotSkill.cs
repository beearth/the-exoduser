using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Player.Energy;

namespace Exoduser.Gameplay.Player.Skills
{
    /// <summary>
    /// Active skill — fires a fan of homing projectiles in an arc.
    /// Each projectile acquires the nearest enemy and curves towards it.
    /// Projectiles are sourced from <see cref="ObjectPool"/>.
    /// </summary>
    [RequireComponent(typeof(PlayerController))]
    [RequireComponent(typeof(PlayerEnergy))]
    public class FanShotSkill : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Inspector — Fan Shape
        // ──────────────────────────────────────────────

        [Header("Fan Shape")]
        [Tooltip("Number of projectiles fired per activation.")]
        [SerializeField] private int _projectileCount = 10;

        [Tooltip("Total spread angle of the fan (degrees).")]
        [SerializeField] private float _fanAngle = 60f;

        // ──────────────────────────────────────────────
        //  Inspector — Projectile Stats
        // ──────────────────────────────────────────────

        [Header("Projectile")]
        [Tooltip("Travel speed of each projectile (world units/s).")]
        [SerializeField] private float _projectileSpeed = 15f;

        [Tooltip("Homing turn strength (higher = tighter tracking).")]
        [SerializeField] private float _homingStrength = 5f;

        [Tooltip("Damage dealt by each individual arrow on hit.")]
        [SerializeField] private float _damagePerArrow = 8f;

        [Tooltip("Maximum lifetime in seconds before the projectile is recycled.")]
        [SerializeField] private float _projectileLifetime = 3f;

        [Tooltip("Pool key used to Get/Return projectiles via ObjectPool.")]
        [SerializeField] private string _projectilePoolKey = "FanArrow";

        // ──────────────────────────────────────────────
        //  Inspector — Cost & Cooldown
        // ──────────────────────────────────────────────

        [Header("Cost & Cooldown")]
        [Tooltip("Energy cost per activation.")]
        [SerializeField] private float _energyCost = 35f;

        [Tooltip("Cooldown between activations (seconds).")]
        [SerializeField] private float _cooldown = 4f;

        // ──────────────────────────────────────────────
        //  Inspector — Targeting
        // ──────────────────────────────────────────────

        [Header("Targeting")]
        [Tooltip("LayerMask for finding the nearest enemy (homing target).")]
        [SerializeField] private LayerMask _enemyLayerMask;

        [Tooltip("Maximum range to scan for a homing target.")]
        [SerializeField] private float _targetScanRange = 20f;

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private PlayerEnergy _energy;
        private ObjectPool _pool;
        private float _cooldownTimer;

        // Reusable buffer for target scan.
        private readonly Collider[] _scanBuffer = new Collider[64];

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>Remaining cooldown in seconds.</summary>
        public float CooldownRemaining => Mathf.Max(0f, _cooldownTimer);

        /// <summary>Whether the skill is currently off cooldown and the player has enough energy.</summary>
        public bool IsReady => _cooldownTimer <= 0f && _energy != null && _energy.Current >= _energyCost;

        /// <summary>
        /// Fires the fan of homing projectiles towards <paramref name="aimDir"/>.
        /// Fails silently if on cooldown or the player lacks energy.
        /// </summary>
        public void Execute(Vector3 aimDir)
        {
            if (_cooldownTimer > 0f) return;
            if (_energy == null || !_energy.Consume(_energyCost)) return;

            _cooldownTimer = _cooldown;

            // Ensure aim direction is on XZ plane
            aimDir.y = 0f;
            if (aimDir.sqrMagnitude < 0.001f)
                aimDir = transform.forward;
            else
                aimDir.Normalize();

            // Find nearest enemy for homing target
            Transform homingTarget = FindNearestEnemy();

            // Spawn projectiles in a fan pattern
            SpawnFan(aimDir, homingTarget);

            GameEvents.RaiseSkillUsed("FanShot");
        }

        // ──────────────────────────────────────────────
        //  Unity lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _energy = GetComponent<PlayerEnergy>();
        }

        private void Start()
        {
            // Retrieve the pool from the ServiceLocator.
            if (ServiceLocator.TryGet(out ObjectPool pool))
            {
                _pool = pool;
            }
            else
            {
                Debug.LogWarning("[FanShotSkill] ObjectPool not found in ServiceLocator. " +
                                 "Projectiles will not spawn.", this);
            }
        }

        private void Update()
        {
            if (_cooldownTimer > 0f)
                _cooldownTimer -= Time.deltaTime;
        }

        // ──────────────────────────────────────────────
        //  Internal — Spawning
        // ──────────────────────────────────────────────

        private void SpawnFan(Vector3 aimDir, Transform homingTarget)
        {
            if (_pool == null) return;
            if (_projectileCount <= 0) return;

            float halfFan = _fanAngle * 0.5f;

            // When only one projectile, fire straight ahead; otherwise, distribute evenly.
            float angleStep = _projectileCount > 1
                ? _fanAngle / (_projectileCount - 1)
                : 0f;

            float startAngle = _projectileCount > 1 ? -halfFan : 0f;

            Vector3 spawnPos = transform.position + Vector3.up * 1f; // Shoulder height offset

            for (int i = 0; i < _projectileCount; i++)
            {
                float angle = startAngle + angleStep * i;
                Vector3 dir = Quaternion.AngleAxis(angle, Vector3.up) * aimDir;

                GameObject projObj = _pool.Get(_projectilePoolKey);
                if (projObj == null)
                {
                    Debug.LogWarning($"[FanShotSkill] Pool '{_projectilePoolKey}' returned null. " +
                                     "Is the pool registered?", this);
                    return;
                }

                projObj.transform.position = spawnPos;
                projObj.transform.rotation = Quaternion.LookRotation(dir, Vector3.up);

                // Configure the projectile component
                HomingProjectile homing = projObj.GetComponent<HomingProjectile>();
                if (homing != null)
                {
                    homing.Initialise(
                        direction: dir,
                        speed: _projectileSpeed,
                        homingStrength: _homingStrength,
                        damage: _damagePerArrow,
                        lifetime: _projectileLifetime,
                        target: homingTarget,
                        poolKey: _projectilePoolKey,
                        owner: gameObject
                    );
                }
            }
        }

        // ──────────────────────────────────────────────
        //  Internal — Targeting
        // ──────────────────────────────────────────────

        private Transform FindNearestEnemy()
        {
            int count = Physics.OverlapSphereNonAlloc(
                transform.position, _targetScanRange, _scanBuffer, _enemyLayerMask);

            Transform nearest = null;
            float nearestDist = float.MaxValue;

            for (int i = 0; i < count; i++)
            {
                if (_scanBuffer[i] == null) continue;

                float dist = (transform.position - _scanBuffer[i].transform.position).sqrMagnitude;
                if (dist < nearestDist)
                {
                    nearestDist = dist;
                    nearest = _scanBuffer[i].transform;
                }
            }

            return nearest;
        }
    }

    // ──────────────────────────────────────────────────────
    //  HomingProjectile — lives on the pooled projectile prefab
    // ──────────────────────────────────────────────────────

    /// <summary>
    /// Behaviour attached to each fan-shot arrow prefab. Handles forward movement,
    /// homing turn towards a target, lifetime expiry, and hit detection.
    /// Returned to <see cref="ObjectPool"/> on expiry or hit.
    /// </summary>
    public class HomingProjectile : MonoBehaviour
    {
        private Vector3 _direction;
        private float _speed;
        private float _homingStrength;
        private float _damage;
        private float _lifetime;
        private Transform _target;
        private string _poolKey;
        private GameObject _owner;

        private float _age;
        private bool _initialised;

        /// <summary>
        /// Configures this projectile for a new flight. Called by <see cref="FanShotSkill"/>
        /// immediately after retrieving the object from the pool.
        /// </summary>
        public void Initialise(
            Vector3 direction,
            float speed,
            float homingStrength,
            float damage,
            float lifetime,
            Transform target,
            string poolKey,
            GameObject owner)
        {
            _direction = direction.normalized;
            _speed = speed;
            _homingStrength = homingStrength;
            _damage = damage;
            _lifetime = lifetime;
            _target = target;
            _poolKey = poolKey;
            _owner = owner;
            _age = 0f;
            _initialised = true;
        }

        private void Update()
        {
            if (!_initialised) return;

            float dt = Time.deltaTime;
            _age += dt;

            // Lifetime expiry
            if (_age >= _lifetime)
            {
                ReturnToPool();
                return;
            }

            // Homing towards target (if alive)
            if (_target != null)
            {
                Vector3 toTarget = (_target.position - transform.position);
                toTarget.y = 0f;
                if (toTarget.sqrMagnitude > 0.01f)
                {
                    Vector3 desiredDir = toTarget.normalized;
                    _direction = Vector3.Slerp(_direction, desiredDir, _homingStrength * dt).normalized;
                }
            }

            // Move forward
            transform.position += _direction * (_speed * dt);
            if (_direction.sqrMagnitude > 0.001f)
                transform.rotation = Quaternion.LookRotation(_direction, Vector3.up);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (!_initialised) return;

            // Ignore the caster
            if (other.gameObject == _owner) return;

            // Try to damage the target
            Exoduser.Gameplay.Combat.Damage.IDamageable damageable =
                other.GetComponent<Exoduser.Gameplay.Combat.Damage.IDamageable>();

            if (damageable != null)
            {
                Exoduser.Gameplay.Combat.Damage.DamageData dmg =
                    new Exoduser.Gameplay.Combat.Damage.DamageData(
                        source: _owner,
                        baseDamage: _damage,
                        knockbackForce: 2f, // Minimal knockback for arrows
                        hitDirection: _direction,
                        element: Exoduser.Gameplay.Combat.Damage.Element.Physical
                    );
                damageable.TakeDamage(dmg);
            }

            ReturnToPool();
        }

        private void OnDisable()
        {
            _initialised = false;
        }

        private void ReturnToPool()
        {
            _initialised = false;

            if (ServiceLocator.TryGet(out ObjectPool pool))
            {
                pool.Return(_poolKey, gameObject);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }
    }
}
