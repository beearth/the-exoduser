using System;
using UnityEngine;

namespace Exoduser.Core
{
    /// <summary>
    /// Data payload for enemy-hit events. Immutable struct carrying all information
    /// about a single damage instance applied to an enemy.
    /// </summary>
    public readonly struct DamageResult
    {
        /// <summary>The GameObject that received damage.</summary>
        public readonly GameObject Target;

        /// <summary>The final damage value after all modifiers.</summary>
        public readonly float Damage;

        /// <summary>World-space knockback vector applied to the target.</summary>
        public readonly Vector3 Knockback;

        /// <summary>Whether the hit was a critical strike.</summary>
        public readonly bool IsCritical;

        /// <summary>
        /// Element index of the damage source.
        /// 0 = Physical, 1 = Fire, 2 = Ice, 3 = Dark, 4 = Lightning.
        /// </summary>
        public readonly int Element;

        /// <summary>
        /// Creates a new <see cref="DamageResult"/>.
        /// </summary>
        public DamageResult(GameObject target, float damage, Vector3 knockback, bool isCritical, int element)
        {
            Target = target;
            Damage = damage;
            Knockback = knockback;
            IsCritical = isCritical;
            Element = element;
        }
    }

    /// <summary>
    /// Central event bus for the game. Uses C# events (Action delegates) for
    /// decoupled communication between systems.
    /// </summary>
    /// <remarks>
    /// Registered in <see cref="ServiceLocator"/> during bootstrap.
    /// Systems subscribe to the static events and call the static Raise methods.
    /// The instance stored in ServiceLocator exists only so that bootstrap can
    /// manage its lifetime; all events are static for convenience.
    /// </remarks>
    public class GameEvents
    {
        // ──────────────────────────────────────────────
        //  Combat
        // ──────────────────────────────────────────────

        /// <summary>Raised when an enemy takes damage.</summary>
        public static event Action<DamageResult> OnEnemyHit;

        /// <summary>Raised when an enemy's HP reaches zero.</summary>
        public static event Action<GameObject> OnEnemyKilled;

        /// <summary>Raised when the player takes damage.</summary>
        public static event Action<float> OnPlayerHit;

        /// <summary>Raised when the player dies.</summary>
        public static event Action OnPlayerDeath;

        // ──────────────────────────────────────────────
        //  Parry
        // ──────────────────────────────────────────────

        /// <summary>Raised on a successful parry. Passes the parried attacker.</summary>
        public static event Action<GameObject> OnParrySuccess;

        /// <summary>Raised when a parry attempt fails (mistimed).</summary>
        public static event Action OnParryFailed;

        // ──────────────────────────────────────────────
        //  Dash
        // ──────────────────────────────────────────────

        /// <summary>Raised when the player begins a dash.</summary>
        public static event Action OnDashStart;

        /// <summary>Raised when the dash ends (or is interrupted).</summary>
        public static event Action OnDashEnd;

        // ──────────────────────────────────────────────
        //  Shield Bash / Wall Collision
        // ──────────────────────────────────────────────

        /// <summary>Raised when a shield-bash connects with a target.</summary>
        public static event Action<GameObject, Vector3> OnShieldBashHit;

        /// <summary>
        /// Raised when a knocked-back entity collides with a wall.
        /// Passes the entity and the speed at impact.
        /// </summary>
        public static event Action<GameObject, float> OnWallCollision;

        // ──────────────────────────────────────────────
        //  Resource
        // ──────────────────────────────────────────────

        /// <summary>Raised when the player's energy changes. (current, max).</summary>
        public static event Action<float, float> OnEnergyChanged;

        // ──────────────────────────────────────────────
        //  Skills
        // ──────────────────────────────────────────────

        /// <summary>Raised when the player activates a skill. Passes the skill name.</summary>
        public static event Action<string> OnSkillUsed;

        // ──────────────────────────────────────────────
        //  Raise helpers
        // ──────────────────────────────────────────────

        /// <summary>Fire the <see cref="OnEnemyHit"/> event.</summary>
        public static void RaiseEnemyHit(DamageResult result) => OnEnemyHit?.Invoke(result);

        /// <summary>Fire the <see cref="OnEnemyKilled"/> event.</summary>
        public static void RaiseEnemyKilled(GameObject enemy) => OnEnemyKilled?.Invoke(enemy);

        /// <summary>Fire the <see cref="OnPlayerHit"/> event.</summary>
        public static void RaisePlayerHit(float damage) => OnPlayerHit?.Invoke(damage);

        /// <summary>Fire the <see cref="OnPlayerDeath"/> event.</summary>
        public static void RaisePlayerDeath() => OnPlayerDeath?.Invoke();

        /// <summary>Fire the <see cref="OnParrySuccess"/> event.</summary>
        public static void RaiseParrySuccess(GameObject parried) => OnParrySuccess?.Invoke(parried);

        /// <summary>Fire the <see cref="OnParryFailed"/> event.</summary>
        public static void RaiseParryFailed() => OnParryFailed?.Invoke();

        /// <summary>Fire the <see cref="OnDashStart"/> event.</summary>
        public static void RaiseDashStart() => OnDashStart?.Invoke();

        /// <summary>Fire the <see cref="OnDashEnd"/> event.</summary>
        public static void RaiseDashEnd() => OnDashEnd?.Invoke();

        /// <summary>Fire the <see cref="OnShieldBashHit"/> event.</summary>
        public static void RaiseShieldBashHit(GameObject target, Vector3 knockback)
            => OnShieldBashHit?.Invoke(target, knockback);

        /// <summary>Fire the <see cref="OnWallCollision"/> event.</summary>
        public static void RaiseWallCollision(GameObject target, float speed)
            => OnWallCollision?.Invoke(target, speed);

        /// <summary>Fire the <see cref="OnEnergyChanged"/> event.</summary>
        public static void RaiseEnergyChanged(float current, float max)
            => OnEnergyChanged?.Invoke(current, max);

        /// <summary>Fire the <see cref="OnSkillUsed"/> event.</summary>
        public static void RaiseSkillUsed(string skillName) => OnSkillUsed?.Invoke(skillName);

        /// <summary>
        /// Unsubscribes all listeners from every event. Call during teardown
        /// or between test runs to prevent leaks.
        /// </summary>
        public static void ClearAll()
        {
            OnEnemyHit = null;
            OnEnemyKilled = null;
            OnPlayerHit = null;
            OnPlayerDeath = null;
            OnParrySuccess = null;
            OnParryFailed = null;
            OnDashStart = null;
            OnDashEnd = null;
            OnShieldBashHit = null;
            OnWallCollision = null;
            OnEnergyChanged = null;
            OnSkillUsed = null;
        }
    }
}
