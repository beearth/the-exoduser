using UnityEngine;
using Exoduser.Core;

namespace Exoduser.Gameplay.Player.Energy
{
    /// <summary>
    /// Manages the player's energy resource. Energy is consumed by skills,
    /// parries, and shield bashes, and regenerates passively after a short delay.
    /// </summary>
    public class PlayerEnergy : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Inspector
        // ──────────────────────────────────────────────

        [Header("Energy Pool")]
        [Tooltip("Maximum energy the player can hold.")]
        [SerializeField] private float _maxEnergy = 100f;

        [Tooltip("Energy restored per second during passive regeneration.")]
        [SerializeField] private float _regenRate = 5f;

        [Tooltip("Seconds of inactivity (no consumption) before regen begins.")]
        [SerializeField] private float _regenDelay = 2f;

        // ──────────────────────────────────────────────
        //  Runtime
        // ──────────────────────────────────────────────

        private float _currentEnergy;
        private float _regenTimer;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>Current energy value.</summary>
        public float Current => _currentEnergy;

        /// <summary>Maximum energy capacity.</summary>
        public float Max => _maxEnergy;

        /// <summary>Energy ratio from 0 (empty) to 1 (full).</summary>
        public float Ratio => _maxEnergy > 0f ? _currentEnergy / _maxEnergy : 0f;

        /// <summary>
        /// Attempts to consume the specified amount of energy.
        /// Returns <c>true</c> if the player had enough energy and the cost was deducted.
        /// Returns <c>false</c> without modifying energy if insufficient.
        /// </summary>
        public bool Consume(float amount)
        {
            if (amount <= 0f) return true;

            if (_currentEnergy < amount)
                return false;

            _currentEnergy -= amount;
            _regenTimer = _regenDelay; // Reset regen delay on consumption.

            BroadcastChange();
            return true;
        }

        /// <summary>
        /// Restores energy up to <see cref="Max"/>. Does not reset the regen delay
        /// (restoration is considered a bonus, not active use).
        /// </summary>
        public void Restore(float amount)
        {
            if (amount <= 0f) return;

            float prev = _currentEnergy;
            _currentEnergy = Mathf.Min(_currentEnergy + amount, _maxEnergy);

            if (!Mathf.Approximately(_currentEnergy, prev))
                BroadcastChange();
        }

        /// <summary>
        /// Sets energy to the given value clamped to [0, max]. Use for initialization
        /// or cheat/debug purposes.
        /// </summary>
        public void SetEnergy(float value)
        {
            _currentEnergy = Mathf.Clamp(value, 0f, _maxEnergy);
            _regenTimer = 0f;
            BroadcastChange();
        }

        /// <summary>
        /// Updates the maximum energy capacity. Current energy is clamped if it exceeds
        /// the new maximum.
        /// </summary>
        public void SetMaxEnergy(float newMax)
        {
            _maxEnergy = Mathf.Max(1f, newMax);
            _currentEnergy = Mathf.Min(_currentEnergy, _maxEnergy);
            BroadcastChange();
        }

        // ──────────────────────────────────────────────
        //  Unity lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            _currentEnergy = _maxEnergy;
        }

        private void Start()
        {
            // Broadcast initial values so that the UI can sync on scene load.
            BroadcastChange();
        }

        private void Update()
        {
            if (_currentEnergy >= _maxEnergy)
                return;

            // Wait for regen delay
            if (_regenTimer > 0f)
            {
                _regenTimer -= Time.deltaTime;
                return;
            }

            // Regenerate
            float prev = _currentEnergy;
            _currentEnergy = Mathf.Min(_currentEnergy + _regenRate * Time.deltaTime, _maxEnergy);

            if (!Mathf.Approximately(_currentEnergy, prev))
                BroadcastChange();
        }

        // ──────────────────────────────────────────────
        //  Internal
        // ──────────────────────────────────────────────

        private void BroadcastChange()
        {
            GameEvents.RaiseEnergyChanged(_currentEnergy, _maxEnergy);
        }
    }
}
