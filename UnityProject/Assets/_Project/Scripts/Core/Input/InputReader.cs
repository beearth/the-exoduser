using System;
using UnityEngine;
using UnityEngine.InputSystem;

namespace Exoduser.Core.Input
{
    /// <summary>
    /// ScriptableObject-based input wrapper that reads from an
    /// <see cref="InputActionAsset"/> at runtime. Decouples gameplay code from
    /// the Input System's generated C# class, allowing the action map to be
    /// edited without recompilation.
    /// </summary>
    /// <remarks>
    /// Create via Assets > Create > Exoduser > Input Reader.
    /// Assign the <c>GameplayActions</c> InputActionAsset in the inspector.
    /// Call <see cref="Enable"/> once during initialization and <see cref="Disable"/>
    /// on teardown.
    /// </remarks>
    [CreateAssetMenu(fileName = "InputReader", menuName = "Exoduser/Input Reader")]
    public class InputReader : ScriptableObject
    {
        /// <summary>
        /// The InputActionAsset containing the "Player" action map.
        /// Assign <c>GameplayActions.inputactions</c> in the inspector.
        /// </summary>
        [SerializeField] private InputActionAsset _actions;

        // ──────────────────────────────────────────────
        //  Events
        // ──────────────────────────────────────────────

        /// <summary>Raised when the move input changes. Passes the 2D direction.</summary>
        public event Action<Vector2> OnMove;

        /// <summary>Raised when the look input changes (mouse position or right stick).</summary>
        public event Action<Vector2> OnLook;

        /// <summary>Raised when the dash button is pressed.</summary>
        public event Action OnDash;

        /// <summary>Raised when the attack button is pressed (true) or released (false).</summary>
        public event Action<bool> OnAttack;

        /// <summary>Raised when the shield-bash button is pressed (true) or released (false).</summary>
        public event Action<bool> OnShieldBash;

        /// <summary>Raised when the parry button is pressed (true) or released (false).</summary>
        public event Action<bool> OnParry;

        /// <summary>Raised when the Skill 1 / Fan-Shot button is pressed.</summary>
        public event Action OnSkill1;

        /// <summary>Raised when the interact button is pressed.</summary>
        public event Action OnInteract;

        /// <summary>Raised when the pause button is pressed.</summary>
        public event Action OnPause;

        // ──────────────────────────────────────────────
        //  Cached values (polled access)
        // ──────────────────────────────────────────────

        /// <summary>Current move input vector (updated every frame the stick/WASD is active).</summary>
        public Vector2 MoveInput { get; private set; }

        /// <summary>Current look input (mouse screen position or right stick).</summary>
        public Vector2 LookInput { get; private set; }

        // ──────────────────────────────────────────────
        //  Internal state
        // ──────────────────────────────────────────────

        private InputActionMap _playerMap;
        private bool _isEnabled;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>
        /// Finds the "Player" action map, subscribes to all actions, and enables input.
        /// Safe to call multiple times (no-ops if already enabled).
        /// </summary>
        public void Enable()
        {
            if (_isEnabled) return;

            if (_actions == null)
            {
                Debug.LogError("[InputReader] InputActionAsset is not assigned.");
                return;
            }

            _playerMap = _actions.FindActionMap("Player", throwIfNotFound: true);

            BindAction("Move", OnMovePerformed, OnMoveCanceled);
            BindAction("Look", OnLookPerformed, null);
            BindAction("Dash", OnDashPerformed, null);
            BindAction("Attack", OnAttackPerformed, OnAttackCanceled);
            BindAction("ShieldBash", OnShieldBashPerformed, OnShieldBashCanceled);
            BindAction("Parry", OnParryPerformed, OnParryCanceled);
            BindAction("Skill1_FanShot", OnSkill1Performed, null);
            BindAction("Interact", OnInteractPerformed, null);
            BindAction("Pause", OnPausePerformed, null);

            _playerMap.Enable();
            _isEnabled = true;
        }

        /// <summary>
        /// Disables input and unsubscribes from all callbacks.
        /// </summary>
        public void Disable()
        {
            if (!_isEnabled) return;

            UnbindAction("Move", OnMovePerformed, OnMoveCanceled);
            UnbindAction("Look", OnLookPerformed, null);
            UnbindAction("Dash", OnDashPerformed, null);
            UnbindAction("Attack", OnAttackPerformed, OnAttackCanceled);
            UnbindAction("ShieldBash", OnShieldBashPerformed, OnShieldBashCanceled);
            UnbindAction("Parry", OnParryPerformed, OnParryCanceled);
            UnbindAction("Skill1_FanShot", OnSkill1Performed, null);
            UnbindAction("Interact", OnInteractPerformed, null);
            UnbindAction("Pause", OnPausePerformed, null);

            _playerMap?.Disable();
            _isEnabled = false;

            MoveInput = Vector2.zero;
            LookInput = Vector2.zero;
        }

        // ──────────────────────────────────────────────
        //  Callbacks
        // ──────────────────────────────────────────────

        private void OnMovePerformed(InputAction.CallbackContext ctx)
        {
            MoveInput = ctx.ReadValue<Vector2>();
            OnMove?.Invoke(MoveInput);
        }

        private void OnMoveCanceled(InputAction.CallbackContext ctx)
        {
            MoveInput = Vector2.zero;
            OnMove?.Invoke(MoveInput);
        }

        private void OnLookPerformed(InputAction.CallbackContext ctx)
        {
            LookInput = ctx.ReadValue<Vector2>();
            OnLook?.Invoke(LookInput);
        }

        private void OnDashPerformed(InputAction.CallbackContext ctx) => OnDash?.Invoke();

        private void OnAttackPerformed(InputAction.CallbackContext ctx) => OnAttack?.Invoke(true);
        private void OnAttackCanceled(InputAction.CallbackContext ctx) => OnAttack?.Invoke(false);

        private void OnShieldBashPerformed(InputAction.CallbackContext ctx) => OnShieldBash?.Invoke(true);
        private void OnShieldBashCanceled(InputAction.CallbackContext ctx) => OnShieldBash?.Invoke(false);

        private void OnParryPerformed(InputAction.CallbackContext ctx) => OnParry?.Invoke(true);
        private void OnParryCanceled(InputAction.CallbackContext ctx) => OnParry?.Invoke(false);

        private void OnSkill1Performed(InputAction.CallbackContext ctx) => OnSkill1?.Invoke();
        private void OnInteractPerformed(InputAction.CallbackContext ctx) => OnInteract?.Invoke();
        private void OnPausePerformed(InputAction.CallbackContext ctx) => OnPause?.Invoke();

        // ──────────────────────────────────────────────
        //  Helpers
        // ──────────────────────────────────────────────

        private void BindAction(string actionName,
            Action<InputAction.CallbackContext> performed,
            Action<InputAction.CallbackContext> canceled)
        {
            InputAction action = _playerMap.FindAction(actionName, throwIfNotFound: false);
            if (action == null)
            {
                Debug.LogWarning($"[InputReader] Action '{actionName}' not found in Player map.");
                return;
            }

            if (performed != null) action.performed += performed;
            if (canceled != null) action.canceled += canceled;
        }

        private void UnbindAction(string actionName,
            Action<InputAction.CallbackContext> performed,
            Action<InputAction.CallbackContext> canceled)
        {
            InputAction action = _playerMap?.FindAction(actionName, throwIfNotFound: false);
            if (action == null) return;

            if (performed != null) action.performed -= performed;
            if (canceled != null) action.canceled -= canceled;
        }
    }
}
