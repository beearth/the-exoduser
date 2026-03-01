using UnityEngine;
using Exoduser.Core;
using Exoduser.Core.Utils;

namespace Exoduser.Gameplay.Player.Movement
{
    /// <summary>
    /// Handles ground movement, gravity, and dashing for the player character.
    /// All movement goes through <see cref="CharacterController.Move"/> — no Rigidbody.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerMovement : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Inspector — Movement
        // ──────────────────────────────────────────────

        [Header("Movement")]
        [Tooltip("Base move speed in world units per second.")]
        [SerializeField] private float _moveSpeed = 8f;

        [Tooltip("Rotation speed when turning to face movement direction (degrees/s).")]
        [SerializeField] private float _rotationSpeed = 720f;

        // ──────────────────────────────────────────────
        //  Inspector — Dash
        // ──────────────────────────────────────────────

        [Header("Dash")]
        [Tooltip("Speed during a dash in world units per second.")]
        [SerializeField] private float _dashSpeed = 25f;

        [Tooltip("How long a single dash lasts (seconds).")]
        [SerializeField] private float _dashDuration = 0.2f;

        [Tooltip("Minimum time between consecutive dashes (seconds).")]
        [SerializeField] private float _dashCooldown = 0.8f;

        // ──────────────────────────────────────────────
        //  Inspector — Gravity
        // ──────────────────────────────────────────────

        [Header("Gravity")]
        [Tooltip("Gravity acceleration applied on the Y axis (positive value, applied downward).")]
        [SerializeField] private float _gravity = 20f;

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private CharacterController _cc;
        private PlayerController _controller;

        // Dash state
        private bool _isDashing;
        private float _dashTimer;
        private float _dashCooldownTimer;
        private Vector3 _dashDirection;

        // Vertical velocity (gravity accumulation)
        private float _verticalVelocity;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary><c>true</c> while the dash is in progress.</summary>
        public bool IsDashing => _isDashing;

        /// <summary>Current base move speed.</summary>
        public float MoveSpeed
        {
            get => _moveSpeed;
            set => _moveSpeed = Mathf.Max(0f, value);
        }

        /// <summary>
        /// Converts isometric screen-space input to a world-space direction and
        /// moves the <see cref="CharacterController"/>. Call every frame from
        /// <see cref="PlayerController"/>.
        /// </summary>
        /// <param name="input">Raw stick / WASD input (magnitude 0-1).</param>
        /// <param name="deltaTime">Frame delta time.</param>
        public void HandleMovement(Vector2 input, float deltaTime)
        {
            // Convert isometric 2D input to a world-space XZ direction.
            Vector3 worldDir = Vector3.zero;
            if (input.sqrMagnitude > 0.01f)
            {
                worldDir = MathUtils.IsometricToWorld(input);
                if (worldDir.sqrMagnitude > 0.001f)
                    worldDir.Normalize();
            }

            // Horizontal velocity
            Vector3 move = worldDir * (_moveSpeed * deltaTime);

            // Gravity
            if (_cc.isGrounded)
            {
                _verticalVelocity = -1f; // Small downward push to keep grounded.
            }
            else
            {
                _verticalVelocity -= _gravity * deltaTime;
            }
            move.y = _verticalVelocity * deltaTime;

            _cc.Move(move);

            // Rotate towards movement direction
            if (worldDir.sqrMagnitude > 0.001f)
            {
                Quaternion targetRot = Quaternion.LookRotation(worldDir, Vector3.up);
                transform.rotation = Quaternion.RotateTowards(
                    transform.rotation, targetRot, _rotationSpeed * deltaTime);
            }
        }

        /// <summary>
        /// Initiates a dash in the given screen-space direction.
        /// Respects cooldown. Sets player state to <see cref="PlayerState.Dashing"/>.
        /// </summary>
        /// <param name="direction">Raw input direction (will be converted to world space).</param>
        public void StartDash(Vector2 direction)
        {
            if (_isDashing) return;
            if (_dashCooldownTimer > 0f) return;

            // Convert to world direction
            _dashDirection = MathUtils.IsometricToWorld(direction);
            if (_dashDirection.sqrMagnitude < 0.001f)
                _dashDirection = transform.forward;
            else
                _dashDirection.Normalize();

            _isDashing = true;
            _dashTimer = _dashDuration;
            _dashCooldownTimer = _dashCooldown;

            // Snap rotation to dash direction
            transform.rotation = Quaternion.LookRotation(_dashDirection, Vector3.up);

            // Notify controller and event bus
            if (_controller != null)
                _controller.ChangeState(PlayerState.Dashing);

            GameEvents.RaiseDashStart();
        }

        /// <summary>
        /// Ticks the active dash. Must be called from <see cref="PlayerController.Update"/>
        /// while the player is in <see cref="PlayerState.Dashing"/>.
        /// </summary>
        public void UpdateDash(float deltaTime)
        {
            if (!_isDashing) return;

            _dashTimer -= deltaTime;

            // Horizontal dash movement (ignore gravity during dash)
            Vector3 move = _dashDirection * (_dashSpeed * deltaTime);
            _cc.Move(move);

            if (_dashTimer <= 0f)
            {
                EndDash();
            }
        }

        // ──────────────────────────────────────────────
        //  Unity lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _cc = GetComponent<CharacterController>();
            _controller = GetComponent<PlayerController>();
        }

        private void Update()
        {
            // Tick cooldown timer regardless of state.
            if (_dashCooldownTimer > 0f)
                _dashCooldownTimer -= Time.deltaTime;
        }

        // ──────────────────────────────────────────────
        //  Internal
        // ──────────────────────────────────────────────

        private void EndDash()
        {
            _isDashing = false;
            _dashTimer = 0f;
            _verticalVelocity = 0f; // Reset so gravity resumes cleanly.
            GameEvents.RaiseDashEnd();
        }
    }
}
