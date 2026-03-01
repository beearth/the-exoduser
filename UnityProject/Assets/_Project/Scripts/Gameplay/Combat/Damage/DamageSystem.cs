using UnityEngine;
using Exoduser.Core;

namespace Exoduser.Gameplay.Combat.Damage
{
    /// <summary>
    /// Central damage resolution system. Calculates final damage from DamageData,
    /// applies elemental multipliers, shield interactions, and fires global events.
    /// Register with ServiceLocator on Awake.
    /// </summary>
    public class DamageSystem : MonoBehaviour
    {
        [Header("Balance Tuning")]
        [SerializeField, Tooltip("Global multiplier applied to all damage. Use for difficulty scaling.")]
        private float _globalDamageMultiplier = 1f;

        [SerializeField, Tooltip("Resistance multiplier applied when target is a boss.")]
        private float _bossResistMultiplier = 0.7f;

        [Header("Shield Interaction")]
        [SerializeField, Tooltip("Shield absorption rate for physical damage (0-1).")]
        private float _shieldPhysicalAbsorb = 0.7f;

        [SerializeField, Tooltip("Shield absorption rate for elemental damage (0-1).")]
        private float _shieldElementalAbsorb = 2f;

        [SerializeField, Tooltip("HP leak multiplier when elemental damage hits a shield.")]
        private float _shieldElementalLeakToHp = 0.1f;

        /// <summary>
        /// Element multiplier table [attacker, defender].
        /// Order: Physical(0), Fire(1), Ice(2), Dark(3), Lightning(4).
        ///
        /// Rock-paper-scissors triangle: Fire > Ice > Lightning > Fire
        /// Dark <-> Physical: mutual 1.2x
        /// Same element: 0.5x
        /// </summary>
        private static readonly float[,] ElementMultiplierTable = new float[5, 5]
        {
            //                  Physical  Fire   Ice    Dark   Lightning
            /* Physical  */ {    1.0f,    1.0f,  1.0f,  1.2f,  1.0f },
            /* Fire      */ {    1.0f,    0.5f,  1.5f,  1.0f,  0.5f },
            /* Ice       */ {    1.0f,    0.5f,  0.5f,  1.0f,  1.5f },
            /* Dark      */ {    1.2f,    1.0f,  1.0f,  0.5f,  1.0f },
            /* Lightning */ {    1.0f,    1.5f,  0.5f,  1.0f,  0.5f },
        };

        private void Awake()
        {
            ServiceLocator.Register(this);
        }

        private void OnDestroy()
        {
            ServiceLocator.Deregister(this);
        }

        /// <summary>
        /// Resolves damage against a target. Handles elemental multipliers, shields,
        /// boss resistance, knockback, and fires appropriate GameEvents.
        /// </summary>
        /// <param name="data">The incoming damage payload.</param>
        /// <param name="target">The GameObject receiving damage.</param>
        public void ApplyDamage(DamageData data, GameObject target)
        {
            if (target == null) return;

            var damageable = target.GetComponent<IDamageable>();
            if (damageable == null || !damageable.IsAlive) return;

            // --- Calculate element multiplier ---
            float elementMult = GetElementMultiplier(data.Element, target);

            // --- Boss resistance ---
            bool isBoss = target.CompareTag("Boss");
            float bossMult = isBoss ? _bossResistMultiplier : 1f;

            // --- Final damage before shield ---
            float finalDamage = data.BaseDamage * elementMult * bossMult * _globalDamageMultiplier;

            // --- Shield interaction ---
            float damageToShield = 0f;
            float damageToHp = finalDamage;
            bool shieldAbsorbed = false;

            if (!data.IgnoreShield)
            {
                var shield = target.GetComponent<IShieldProvider>();
                if (shield != null && shield.HasShield)
                {
                    bool isElemental = data.Element != Element.Physical;

                    if (isElemental)
                    {
                        // Elemental damage: shield absorbs more, but some leaks to HP
                        damageToShield = finalDamage * _shieldElementalAbsorb;
                        damageToHp = finalDamage * _shieldElementalLeakToHp;
                    }
                    else
                    {
                        // Physical damage: shield absorbs a portion, rest goes to HP
                        damageToShield = finalDamage * _shieldPhysicalAbsorb;
                        damageToHp = finalDamage * (1f - _shieldPhysicalAbsorb);
                    }

                    shield.AbsorbDamage(damageToShield);
                    shieldAbsorbed = true;
                }
            }

            // --- Apply damage to target ---
            var modifiedData = new DamageData(
                data.Source,
                damageToHp,
                data.KnockbackForce,
                data.HitDirection,
                data.Element,
                data.IgnoreShield,
                data.PoiseBreak,
                data.StaggerDuration
            );

            damageable.TakeDamage(modifiedData);

            // --- Apply knockback ---
            if (data.KnockbackForce > 0f)
            {
                var knockbackable = target.GetComponent<IKnockbackable>();
                if (knockbackable != null && !knockbackable.IsKnockbackImmune)
                {
                    Vector3 knockbackVec = data.HitDirection * data.KnockbackForce;
                    knockbackable.ApplyKnockback(knockbackVec);
                }
            }

            // --- Determine if critical (for event) ---
            bool isCritical = false; // Extend with crit system later

            // --- Fire events ---
            var result = new DamageResult(
                target,
                damageToHp,
                data.HitDirection * data.KnockbackForce,
                isCritical,
                (int)data.Element
            );

            GameEvents.RaiseEnemyHit(result);

            // --- Check for kill ---
            if (!damageable.IsAlive)
            {
                GameEvents.RaiseEnemyKilled(target);
            }
        }

        /// <summary>
        /// Gets the elemental multiplier for an attack element vs a target.
        /// Checks target for an IElementProvider; defaults to Physical if none found.
        /// </summary>
        public float GetElementMultiplier(Element attackElement, GameObject target)
        {
            Element defenseElement = Element.Physical;

            var elementProvider = target.GetComponent<IElementProvider>();
            if (elementProvider != null)
            {
                defenseElement = elementProvider.DefenseElement;
            }

            return ElementMultiplierTable[(int)attackElement, (int)defenseElement];
        }

        /// <summary>
        /// Returns the raw multiplier between two elements.
        /// </summary>
        public static float GetMultiplier(Element attack, Element defense)
        {
            return ElementMultiplierTable[(int)attack, (int)defense];
        }
    }

    /// <summary>
    /// Optional interface for entities that have a shield layer.
    /// </summary>
    public interface IShieldProvider
    {
        bool HasShield { get; }
        void AbsorbDamage(float amount);
    }

    /// <summary>
    /// Optional interface for entities with an elemental affinity.
    /// </summary>
    public interface IElementProvider
    {
        Element DefenseElement { get; }
    }
}
