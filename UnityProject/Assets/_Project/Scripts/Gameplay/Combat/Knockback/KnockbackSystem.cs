using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Combat.Knockback
{
    /// <summary>
    /// Manages knockback state for an entity. Attach to both player and enemy GameObjects.
    /// Applies decelerating knockback movement via CharacterController or raw transform,
    /// and detects wall collisions during knockback.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class KnockbackSystem : MonoBehaviour, IKnockbackable
    {
        [Header("Knockback Settings")]
        [SerializeField, Tooltip("Rate at which knockback velocity decelerates (units/sec^2).")]
        private float _knockbackDeceleration = 40f;

        [SerializeField, Tooltip("Minimum velocity threshold before knockback ends.")]
        private float _knockbackEndThreshold = 0.5f;

        [SerializeField, Tooltip("If true, this entity cannot be knocked back.")]
        private bool _isKnockbackImmune;

        [Header("Wall Collision")]
        [SerializeField, Tooltip("Layer mask for walls that trigger wall collision damage.")]
        private LayerMask _wallLayer;

        [SerializeField, Tooltip("Minimum knockback speed to trigger wall collision event.")]
        private float _wallCollisionMinSpeed = 3f;

        private CharacterController _characterController;
        private Vector3 _knockbackVelocity;
        private bool _isBeingKnockedBack;
        private bool _wallCollisionTriggered;

        /// <summary>
        /// True if this entity is currently being knocked back.
        /// Other systems can check this to suppress normal movement.
        /// </summary>
        public bool IsBeingKnockedBack => _isBeingKnockedBack;

        /// <summary>
        /// If true, ApplyKnockback calls are ignored.
        /// </summary>
        public bool IsKnockbackImmune
        {
            get => _isKnockbackImmune;
            set => _isKnockbackImmune = value;
        }

        /// <summary>
        /// Current knockback velocity. Useful for wall collision damage calculation.
        /// </summary>
        public Vector3 KnockbackVelocity => _knockbackVelocity;

        private void Awake()
        {
            _characterController = GetComponent<CharacterController>();
        }

        /// <summary>
        /// Initiates a knockback with the given force vector.
        /// The force direction and magnitude determine initial knockback velocity.
        /// </summary>
        /// <param name="force">Knockback force vector (direction * magnitude).</param>
        public void ApplyKnockback(Vector3 force)
        {
            if (_isKnockbackImmune) return;

            _knockbackVelocity = force;
            _isBeingKnockedBack = true;
            _wallCollisionTriggered = false;
        }

        private void Update()
        {
            if (!_isBeingKnockedBack) return;

            float speed = _knockbackVelocity.magnitude;

            if (speed <= _knockbackEndThreshold)
            {
                EndKnockback();
                return;
            }

            // Decelerate
            Vector3 decelDir = -_knockbackVelocity.normalized;
            _knockbackVelocity += decelDir * (_knockbackDeceleration * Time.deltaTime);

            // Check if deceleration overshot (velocity reversed direction)
            if (Vector3.Dot(_knockbackVelocity, decelDir) > 0f)
            {
                EndKnockback();
                return;
            }

            // Apply movement
            if (_characterController != null && _characterController.enabled)
            {
                _characterController.Move(_knockbackVelocity * Time.deltaTime);
            }
            else
            {
                transform.position += _knockbackVelocity * Time.deltaTime;
            }
        }

        /// <summary>
        /// Called by CharacterController when it collides with another collider during Move().
        /// Detects wall collision during knockback and fires the wall collision event.
        /// </summary>
        private void OnControllerColliderHit(ControllerColliderHit hit)
        {
            if (!_isBeingKnockedBack) return;
            if (_wallCollisionTriggered) return;

            // Check if hit object is on wall layer
            if ((_wallLayer.value & (1 << hit.gameObject.layer)) == 0) return;

            float speed = _knockbackVelocity.magnitude;
            if (speed < _wallCollisionMinSpeed) return;

            _wallCollisionTriggered = true;

            // Fire wall collision event with the colliding entity and its speed
            GameEvents.RaiseWallCollision(gameObject, speed);

            // Kill most of the velocity on wall impact
            _knockbackVelocity *= 0.1f;
        }

        private void EndKnockback()
        {
            _knockbackVelocity = Vector3.zero;
            _isBeingKnockedBack = false;
            _wallCollisionTriggered = false;
        }
    }
}
