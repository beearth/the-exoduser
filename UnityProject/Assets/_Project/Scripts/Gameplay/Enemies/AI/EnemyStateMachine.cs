using UnityEngine;
using System.Collections.Generic;

namespace Exoduser.Gameplay.Enemies.AI
{
    /// <summary>
    /// Enemy states used by the state machine.
    /// </summary>
    public enum EnemyState
    {
        Idle,
        Patrol,
        Chase,
        Attack,
        Stagger,
        Dead
    }

    /// <summary>
    /// Generic state machine for enemy AI. Manages state transitions with
    /// enter/exit/update callbacks and tracks time spent in the current state.
    /// Attach to any enemy GameObject alongside <see cref="EnemyAI"/>.
    /// </summary>
    public class EnemyStateMachine : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>The state the machine is currently in.</summary>
        public EnemyState CurrentState { get; private set; } = EnemyState.Idle;

        /// <summary>Seconds elapsed since the last state change.</summary>
        public float StateTimer { get; private set; }

        /// <summary>The state that was active before the current one.</summary>
        public EnemyState PreviousState { get; private set; } = EnemyState.Idle;

        // ──────────────────────────────────────────────
        //  Internal
        // ──────────────────────────────────────────────

        private readonly Dictionary<EnemyState, System.Action> _enterActions = new();
        private readonly Dictionary<EnemyState, System.Action> _exitActions = new();
        private readonly Dictionary<EnemyState, System.Action> _updateActions = new();

        private bool _initialized;

        // ──────────────────────────────────────────────
        //  Registration
        // ──────────────────────────────────────────────

        /// <summary>
        /// Registers callbacks for a specific state. Call this during Awake/Start
        /// before any state transitions occur.
        /// </summary>
        /// <param name="state">The state to configure.</param>
        /// <param name="onEnter">Invoked once when entering this state. May be null.</param>
        /// <param name="onUpdate">Invoked every frame while in this state. May be null.</param>
        /// <param name="onExit">Invoked once when leaving this state. May be null.</param>
        public void RegisterState(EnemyState state, System.Action onEnter = null,
            System.Action onUpdate = null, System.Action onExit = null)
        {
            if (onEnter != null) _enterActions[state] = onEnter;
            if (onUpdate != null) _updateActions[state] = onUpdate;
            if (onExit != null) _exitActions[state] = onExit;
        }

        /// <summary>
        /// Transitions to a new state. Fires exit on the old state, then enter on
        /// the new state. No-op if <paramref name="newState"/> equals the current state.
        /// </summary>
        public void ChangeState(EnemyState newState)
        {
            if (_initialized && CurrentState == newState) return;

            // Exit current state
            if (_initialized && _exitActions.TryGetValue(CurrentState, out var exit))
                exit.Invoke();

            PreviousState = CurrentState;
            CurrentState = newState;
            StateTimer = 0f;
            _initialized = true;

            // Enter new state
            if (_enterActions.TryGetValue(newState, out var enter))
                enter.Invoke();
        }

        /// <summary>
        /// Forces the state machine into <paramref name="state"/> even if it is
        /// already in that state. Useful for re-triggering Stagger, etc.
        /// </summary>
        public void ForceState(EnemyState state)
        {
            if (_exitActions.TryGetValue(CurrentState, out var exit))
                exit.Invoke();

            PreviousState = CurrentState;
            CurrentState = state;
            StateTimer = 0f;

            if (_enterActions.TryGetValue(state, out var enter))
                enter.Invoke();
        }

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void Update()
        {
            if (!_initialized) return;

            StateTimer += Time.deltaTime;

            if (_updateActions.TryGetValue(CurrentState, out var update))
                update.Invoke();
        }
    }
}
