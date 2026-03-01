using UnityEngine;
using Exoduser.Core;
using Exoduser.Core.Input;
using Exoduser.Gameplay.Player.Movement;
using Exoduser.Gameplay.Player.Energy;
using Exoduser.Gameplay.Player.Combat;
using Exoduser.Gameplay.Player.Skills;

namespace Exoduser.Gameplay.Player
{
    /// <summary>
    /// All possible states for the player character.
    /// </summary>
    public enum PlayerState
    {
        Idle,
        Moving,
        Dashing,
        Attacking,
        ShieldBashing,
        Parrying,
        Staggered,
        Dead
    }

    /// <summary>
    /// Central state-machine controller for the player character.
    /// Owns references to every sub-component and drives state transitions each frame.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    [RequireComponent(typeof(PlayerMovement))]
    [RequireComponent(typeof(PlayerEnergy))]
    public class PlayerController : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Inspector
        // ──────────────────────────────────────────────

        [Header("Input")]
        [Tooltip("ScriptableObject that exposes New Input System events.")]
        [SerializeField] private InputReader _inputReader;

        [Header("Stagger")]
        [Tooltip("How long the player remains in the Staggered state (seconds).")]
        [SerializeField] private float _staggerDuration = 0.5f;

        // ──────────────────────────────────────────────
        //  Runtime references (populated in Awake)
        // ──────────────────────────────────────────────

        private CharacterController _cc;
        private PlayerMovement _movement;
        private PlayerEnergy _energy;
        private PlayerShieldBash _shieldBash;
        private PlayerParry _parry;
        private FanShotSkill _fanShot;

        // ──────────────────────────────────────────────
        //  State
        // ──────────────────────────────────────────────

        private PlayerState _currentState = PlayerState.Idle;
        private float _staggerTimer;

        // Cached camera reference for aim-direction calculation.
        private Camera _mainCamera;

        // Reusable plane for mouse-to-world raycasts (XZ plane at player height).
        private Plane _groundPlane;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>Current player state.</summary>
        public PlayerState CurrentState => _currentState;

        /// <summary>The attached <see cref="InputReader"/> asset.</summary>
        public InputReader InputReader => _inputReader;

        /// <summary>The attached <see cref="CharacterController"/>.</summary>
        public CharacterController CharacterController => _cc;

        /// <summary>The attached <see cref="PlayerMovement"/>.</summary>
        public PlayerMovement Movement => _movement;

        /// <summary>The attached <see cref="PlayerEnergy"/>.</summary>
        public PlayerEnergy Energy => _energy;

        /// <summary>The attached <see cref="PlayerShieldBash"/>.</summary>
        public PlayerShieldBash ShieldBash => _shieldBash;

        /// <summary>The attached <see cref="PlayerParry"/>.</summary>
        public PlayerParry Parry => _parry;

        /// <summary>The attached <see cref="FanShotSkill"/>.</summary>
        public FanShotSkill FanShot => _fanShot;

        /// <summary>
        /// Returns <c>true</c> when the player is allowed to initiate new actions
        /// (not staggered, dead, or mid-dash).
        /// </summary>
        public bool CanAct()
        {
            return _currentState != PlayerState.Staggered
                && _currentState != PlayerState.Dead
                && _currentState != PlayerState.Dashing;
        }

        /// <summary>
        /// Transition to a new state. Calls exit logic on the old state and enter logic
        /// on the new state. No-ops if the state is unchanged.
        /// </summary>
        public void ChangeState(PlayerState newState)
        {
            if (_currentState == newState)
                return;

            ExitState(_currentState);
            _currentState = newState;
            EnterState(_currentState);
        }

        /// <summary>
        /// Computes a normalised direction from the player towards the mouse cursor
        /// projected onto the XZ ground plane at the player's Y position.
        /// Falls back to <see cref="Vector3.forward"/> when the raycast misses.
        /// </summary>
        public Vector3 GetAimDirection()
        {
            if (_mainCamera == null)
                return transform.forward;

            _groundPlane = new Plane(Vector3.up, transform.position);

            Ray ray = _mainCamera.ScreenPointToRay(UnityEngine.Input.mousePosition);
            if (_groundPlane.Raycast(ray, out float enter))
            {
                Vector3 hitPoint = ray.GetPoint(enter);
                Vector3 dir = (hitPoint - transform.position);
                dir.y = 0f;
                if (dir.sqrMagnitude > 0.001f)
                    return dir.normalized;
            }

            return transform.forward;
        }

        /// <summary>
        /// Force the player into the Staggered state for <see cref="_staggerDuration"/> seconds.
        /// </summary>
        public void ApplyStagger()
        {
            if (_currentState == PlayerState.Dead)
                return;

            _staggerTimer = _staggerDuration;
            ChangeState(PlayerState.Staggered);
        }

        /// <summary>
        /// Kills the player immediately.
        /// </summary>
        public void Kill()
        {
            ChangeState(PlayerState.Dead);
            GameEvents.RaisePlayerDeath();
        }

        // ──────────────────────────────────────────────
        //  Unity lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _cc = GetComponent<CharacterController>();
            _movement = GetComponent<PlayerMovement>();
            _energy = GetComponent<PlayerEnergy>();
            _shieldBash = GetComponent<PlayerShieldBash>();
            _parry = GetComponent<PlayerParry>();
            _fanShot = GetComponent<FanShotSkill>();

            _mainCamera = Camera.main;
        }

        private void OnEnable()
        {
            if (_inputReader == null)
            {
                Debug.LogError("[PlayerController] InputReader is not assigned!", this);
                return;
            }

            _inputReader.OnDash += HandleDash;
            _inputReader.OnAttack += HandleAttack;
            _inputReader.OnShieldBash += HandleShieldBash;
            _inputReader.OnParry += HandleParry;
            _inputReader.OnSkill1 += HandleSkill1;
        }

        private void OnDisable()
        {
            if (_inputReader == null) return;

            _inputReader.OnDash -= HandleDash;
            _inputReader.OnAttack -= HandleAttack;
            _inputReader.OnShieldBash -= HandleShieldBash;
            _inputReader.OnParry -= HandleParry;
            _inputReader.OnSkill1 -= HandleSkill1;
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            switch (_currentState)
            {
                case PlayerState.Idle:
                case PlayerState.Moving:
                    UpdateLocomotion(dt);
                    break;

                case PlayerState.Dashing:
                    _movement.UpdateDash(dt);
                    if (!_movement.IsDashing)
                        ChangeState(PlayerState.Idle);
                    break;

                case PlayerState.Attacking:
                    // Attack state is driven by animation events / attack sub-system.
                    // Falls back to Idle when the attack window expires.
                    break;

                case PlayerState.ShieldBashing:
                    if (_shieldBash != null)
                    {
                        _shieldBash.Tick(dt);
                        if (!_shieldBash.IsActive)
                            ChangeState(PlayerState.Idle);
                    }
                    break;

                case PlayerState.Parrying:
                    if (_parry != null)
                    {
                        _parry.Tick(dt);
                        if (!_parry.IsActive)
                            ChangeState(PlayerState.Idle);
                    }
                    break;

                case PlayerState.Staggered:
                    _staggerTimer -= dt;
                    if (_staggerTimer <= 0f)
                        ChangeState(PlayerState.Idle);
                    break;

                case PlayerState.Dead:
                    // No updates while dead.
                    break;
            }
        }

        // ──────────────────────────────────────────────
        //  Locomotion
        // ──────────────────────────────────────────────

        private void UpdateLocomotion(float dt)
        {
            if (_inputReader == null) return;

            Vector2 input = _inputReader.MoveInput;

            if (input.sqrMagnitude > 0.01f)
            {
                if (_currentState != PlayerState.Moving)
                    ChangeState(PlayerState.Moving);

                _movement.HandleMovement(input, dt);
            }
            else
            {
                if (_currentState != PlayerState.Idle)
                    ChangeState(PlayerState.Idle);

                // Still apply gravity when standing still.
                _movement.HandleMovement(Vector2.zero, dt);
            }
        }

        // ──────────────────────────────────────────────
        //  Input callbacks
        // ──────────────────────────────────────────────

        private void HandleDash()
        {
            if (!CanAct()) return;
            if (_inputReader == null) return;

            Vector2 moveInput = _inputReader.MoveInput;
            // If no directional input, dash towards aim direction (projected to 2D).
            if (moveInput.sqrMagnitude < 0.01f)
            {
                Vector3 aim = GetAimDirection();
                moveInput = new Vector2(aim.x, aim.z).normalized;
            }

            _movement.StartDash(moveInput);
        }

        private void HandleAttack(bool pressed)
        {
            if (!pressed) return;
            if (!CanAct()) return;

            // Attacking state; actual attack logic lives in a dedicated attack component.
            ChangeState(PlayerState.Attacking);
        }

        private void HandleShieldBash(bool pressed)
        {
            if (!pressed) return;
            if (!CanAct()) return;
            if (_shieldBash == null) return;

            _shieldBash.Execute(GetAimDirection());
        }

        private void HandleParry(bool pressed)
        {
            if (!pressed) return;
            if (!CanAct()) return;
            if (_parry == null) return;

            _parry.Execute();
        }

        private void HandleSkill1()
        {
            if (!CanAct()) return;
            if (_fanShot == null) return;

            _fanShot.Execute(GetAimDirection());
        }

        // ──────────────────────────────────────────────
        //  State enter / exit hooks
        // ──────────────────────────────────────────────

        private void EnterState(PlayerState state)
        {
            // Placeholder for future animation triggers, VFX, etc.
        }

        private void ExitState(PlayerState state)
        {
            // Placeholder for cleanup when leaving a state.
        }
    }
}
