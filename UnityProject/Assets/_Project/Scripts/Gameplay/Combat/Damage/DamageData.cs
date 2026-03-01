using UnityEngine;

namespace Exoduser.Gameplay.Combat.Damage
{
    /// <summary>
    /// Immutable damage payload passed between combat systems.
    /// Contains all information needed to resolve a single instance of damage.
    /// </summary>
    public readonly struct DamageData
    {
        public readonly GameObject Source;
        public readonly float BaseDamage;
        public readonly float KnockbackForce;
        public readonly Vector3 HitDirection;
        public readonly Element Element;
        public readonly bool IgnoreShield;
        public readonly float PoiseBreak;
        public readonly float StaggerDuration;

        public DamageData(
            GameObject source,
            float baseDamage,
            float knockbackForce,
            Vector3 hitDirection,
            Element element = Element.Physical,
            bool ignoreShield = false,
            float poiseBreak = 0f,
            float staggerDuration = 0f)
        {
            Source = source;
            BaseDamage = baseDamage;
            KnockbackForce = knockbackForce;
            HitDirection = hitDirection.normalized;
            Element = element;
            IgnoreShield = ignoreShield;
            PoiseBreak = poiseBreak;
            StaggerDuration = staggerDuration;
        }
    }

    /// <summary>
    /// Elemental types used throughout the combat system.
    /// </summary>
    public enum Element
    {
        Physical = 0,
        Fire = 1,
        Ice = 2,
        Dark = 3,
        Lightning = 4
    }

    /// <summary>
    /// Interface for anything that can receive damage.
    /// Implement on player health, enemy health, destructible objects, etc.
    /// </summary>
    public interface IDamageable
    {
        void TakeDamage(DamageData data);
        bool IsAlive { get; }
    }

    /// <summary>
    /// Interface for anything that can be knocked back by a force.
    /// </summary>
    public interface IKnockbackable
    {
        void ApplyKnockback(Vector3 force);
        bool IsKnockbackImmune { get; }
    }
}
