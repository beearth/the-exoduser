using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Player.Energy;

namespace Exoduser.Gameplay.Player.Combat
{
    /// <summary>
    /// Energy-based parry mechanic. Transitions through Startup -> Active -> Recovery
    /// sub-states. Incoming damage is absorbed only during the Active window, granting
    /// bonus energy on success.
    /// </summary>
    [RequireComponent(typeof(PlayerController))]
    [RequireComponent(typeof(PlayerEnergy))]
    public class PlayerParry : MonoBehaviour
    {
        /// <summary>Internal sub-states of the parry action.</summary>
        private enum ParryPhase
        {
            /// <summary>Not parrying.</summary>
            None,
            /// <summary>Wind-up before the active window opens.</summary>
            Startup,
            /// <summary>Active deflection window — incoming damage can be parried.</summary>
            Active,
            /// <summary>Cool-down animation after the active window closes.</summary>
            Recovery
        }

        // ──────────────────────────────────────────────
        //  Inspector
        // ──────────────────────────────────────────────

        [Header("Timing")]
        [Tooltip("Duration of the startup phase before the active window (seconds).")]
        [SerializeField] private float _parryWindowStart = 0.08f;

        [Tooltip("Duration of the active parry window (seconds).")]
        [SerializeField] private float _parryActiveDuration = 0.15f;

        [Tooltip("Total parry animation duration including startup + active + recovery (seconds).")]
        [SerializeField] private float _parryTotalDuration = 0.4f;

        [Tooltip("Cooldown between consecutive parry attempts (seconds).")]
        [SerializeField] private float _parryCooldown = 0.6f;

        [Header("Rewards")]
        [Tooltip("Energy restored on a successful parry.")]
        [SerializeField] private float _energyGainOnSuccess = 30f;

        [Tooltip("Damage multiplier applied to the counter-attack after a successful parry.")]
        [SerializeField] private float _counterDamageMultiplier = 2.0f;

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private PlayerController _controller;
        private PlayerEnergy _energy;

        private ParryPhase _phase = ParryPhase.None;
        private float _phaseTimer;
        private float _cooldownTimer;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary><c>true</c> while any parry phase is active (Startup, Active, or Recovery).</summary>
        public bool IsActive => _phase != ParryPhase.None;

        /// <summary><c>true</c> only during the Active deflection window.</summary>
        public bool IsParryActive => _phase == ParryPhase.Active;

        /// <summary>The counter-attack damage multiplier. Consumers (e.g. attack system) read
        /// this after a successful parry to scale follow-up damage.</summary>
        public float CounterDamageMultiplier => _counterDamageMultiplier;

        /// <summary>Remaining cooldown time in seconds.</summary>
        public float CooldownRemaining => Mathf.Max(0f, _cooldownTimer);

        /// <summary>
        /// Attempts to begin a parry. Fails silently if on cooldown or the player is
        /// already parrying.
        /// </summary>
        public void Execute()
        {
            if (_cooldownTimer > 0f) return;
            if (_phase != ParryPhase.None) return;

            _cooldownTimer = _parryCooldown;

            // Enter Startup phase
            _phase = ParryPhase.Startup;
            _phaseTimer = _parryWindowStart;

            if (_controller != null)
                _controller.ChangeState(PlayerState.Parrying);
        }

        /// <summary>
        /// Called by the damage system when the player would receive damage while
        /// in the parry stance.
        /// </summary>
        /// <param name="attacker">The GameObject that attacked the player.</param>
        /// <returns>
        /// <c>true</c> if the parry was successful (Active window), meaning damage
        /// should be negated. <c>false</c> if the timing was wrong.
        /// </returns>
        public bool TryParry(GameObject attacker)
        {
            if (_phase == ParryPhase.Active)
            {
                // Successful parry
                if (_energy != null)
                    _energy.Restore(_energyGainOnSuccess);

                GameEvents.RaiseParrySuccess(attacker);
                return true;
            }

            // Parry attempt failed (wrong timing or not parrying at all).
            GameEvents.RaiseParryFailed();
            return false;
        }

        /// <summary>
        /// Ticks the parry phase timers. Called by <see cref="PlayerController"/> each frame
        /// while the player is in the <see cref="PlayerState.Parrying"/> state.
        /// </summary>
        public void Tick(float deltaTime)
        {
            if (_phase == ParryPhase.None) return;

            _phaseTimer -= deltaTime;

            if (_phaseTimer <= 0f)
            {
                AdvancePhase();
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

        private void AdvancePhase()
        {
            switch (_phase)
            {
                case ParryPhase.Startup:
                    _phase = ParryPhase.Active;
                    _phaseTimer = _parryActiveDuration;
                    break;

                case ParryPhase.Active:
                    // Calculate remaining recovery time
                    float elapsed = _parryWindowStart + _parryActiveDuration;
                    float remaining = _parryTotalDuration - elapsed;
                    _phase = ParryPhase.Recovery;
                    _phaseTimer = Mathf.Max(0f, remaining);
                    break;

                case ParryPhase.Recovery:
                    _phase = ParryPhase.None;
                    _phaseTimer = 0f;
                    break;
            }
        }
    }
}
