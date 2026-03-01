using System.Collections.Generic;
using UnityEngine;
using Exoduser.Core;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Systems.CrowDelivery
{
    /// <summary>
    /// Crow Delivery System (까마귀 택배).
    /// Manages delayed aerial deliveries that fly in a parabolic arc to a target
    /// position, then detonate with an AoE damage burst on arrival.
    /// </summary>
    public class CrowDeliverySystem : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Serialized
        // ──────────────────────────────────────────────

        [Header("Pool Keys")]
        [SerializeField, Tooltip("Object pool key for crow visual prefab.")]
        private string _crowPoolKey = "CrowDelivery";

        [SerializeField, Tooltip("Object pool key for the impact VFX.")]
        private string _impactVfxPoolKey = "CrowImpact";

        [Header("Flight")]
        [SerializeField, Tooltip("Peak height of the parabolic flight arc.")]
        private float _arcHeight = 8f;

        [Header("AoE Detection")]
        [SerializeField, Tooltip("LayerMask for AoE damage targets.")]
        private LayerMask _aoeMask;

        [Header("Screen Shake")]
        [SerializeField, Tooltip("Whether to trigger screen shake on impact.")]
        private bool _screenShakeOnImpact = true;

        [SerializeField, Tooltip("Screen shake intensity on impact.")]
        private float _screenShakeIntensity = 0.4f;

        [SerializeField, Tooltip("Screen shake duration on impact.")]
        private float _screenShakeDuration = 0.25f;

        // ──────────────────────────────────────────────
        //  Internal Tracking
        // ──────────────────────────────────────────────

        /// <summary>
        /// Represents a single in-flight crow delivery.
        /// </summary>
        private struct ActiveDelivery
        {
            public Vector3 StartPos;
            public Vector3 TargetPos;
            public float Timer;
            public float Duration;
            public float AoeDamage;
            public float AoeRadius;
            public Element Element;
            public GameObject CrowGO;
        }

        private readonly List<ActiveDelivery> _activeDeliveries = new();

        // Reusable buffer for overlap checks
        private static readonly Collider[] AoeBuffer = new Collider[64];

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>
        /// Requests a crow delivery aimed at <paramref name="targetPos"/>.
        /// A crow will spawn, fly in a parabolic arc over <paramref name="delay"/> seconds,
        /// then deal AoE damage on arrival.
        /// </summary>
        /// <param name="targetPos">World-space position the crow will impact.</param>
        /// <param name="delay">Flight duration in seconds.</param>
        /// <param name="aoeDamage">Damage dealt to entities within the AoE radius.</param>
        /// <param name="aoeRadius">Radius of the AoE explosion.</param>
        /// <param name="element">Elemental type of the AoE damage.</param>
        public void RequestDelivery(Vector3 targetPos, float delay, float aoeDamage,
            float aoeRadius, Element element)
        {
            delay = Mathf.Max(delay, 0.1f);

            // Calculate a start position above and behind the target
            Vector3 startPos = targetPos + new Vector3(
                Random.Range(-6f, 6f),
                _arcHeight + 4f,
                Random.Range(-6f, 6f)
            );

            // Spawn crow from pool
            GameObject crowGO = null;
            ObjectPool pool = ServiceLocator.Get<ObjectPool>();
            if (pool != null && pool.HasPool(_crowPoolKey))
            {
                crowGO = pool.Get(_crowPoolKey);
                if (crowGO != null)
                    crowGO.transform.position = startPos;
            }

            if (crowGO == null)
            {
                Debug.LogWarning($"[CrowDeliverySystem] Pool '{_crowPoolKey}' not available. " +
                    "Delivery will proceed without visual.");
            }

            var delivery = new ActiveDelivery
            {
                StartPos = startPos,
                TargetPos = targetPos,
                Timer = 0f,
                Duration = delay,
                AoeDamage = aoeDamage,
                AoeRadius = aoeRadius,
                Element = element,
                CrowGO = crowGO
            };

            _activeDeliveries.Add(delivery);
        }

        /// <summary>
        /// Returns the number of deliveries currently in flight.
        /// </summary>
        public int ActiveCount => _activeDeliveries.Count;

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void Update()
        {
            for (int i = _activeDeliveries.Count - 1; i >= 0; i--)
            {
                var d = _activeDeliveries[i];
                d.Timer += Time.deltaTime;

                float t = Mathf.Clamp01(d.Timer / d.Duration);

                // Update crow position along parabolic arc
                if (d.CrowGO != null)
                {
                    Vector3 pos = EvaluateArc(d.StartPos, d.TargetPos, t);
                    d.CrowGO.transform.position = pos;

                    // Face movement direction
                    if (t < 1f)
                    {
                        float tNext = Mathf.Clamp01(t + 0.01f);
                        Vector3 nextPos = EvaluateArc(d.StartPos, d.TargetPos, tNext);
                        Vector3 fwd = (nextPos - pos).normalized;
                        if (fwd.sqrMagnitude > 0.001f)
                            d.CrowGO.transform.rotation = Quaternion.LookRotation(fwd, Vector3.up);
                    }
                }

                // Write back timer
                _activeDeliveries[i] = d;

                // Check if arrived
                if (t >= 1f)
                {
                    OnDeliveryArrived(d);
                    _activeDeliveries.RemoveAt(i);
                }
            }
        }

        // ──────────────────────────────────────────────
        //  Impact
        // ──────────────────────────────────────────────

        private void OnDeliveryArrived(ActiveDelivery delivery)
        {
            // AoE damage
            int hitCount = Physics.OverlapSphereNonAlloc(
                delivery.TargetPos, delivery.AoeRadius, AoeBuffer, _aoeMask);

            for (int i = 0; i < hitCount; i++)
            {
                Collider col = AoeBuffer[i];
                if (col == null) continue;

                var damageable = col.GetComponent<IDamageable>();
                if (damageable == null || !damageable.IsAlive) continue;

                Vector3 hitDir = (col.transform.position - delivery.TargetPos).normalized;
                if (hitDir.sqrMagnitude < 0.001f)
                    hitDir = Vector3.forward;

                var damageData = new DamageData(
                    source: gameObject,
                    baseDamage: delivery.AoeDamage,
                    knockbackForce: 5f,
                    hitDirection: hitDir,
                    element: delivery.Element,
                    poiseBreak: delivery.AoeDamage * 0.5f
                );

                damageable.TakeDamage(damageData);

                // Apply knockback
                var knockbackable = col.GetComponent<IKnockbackable>();
                if (knockbackable != null && !knockbackable.IsKnockbackImmune)
                {
                    knockbackable.ApplyKnockback(hitDir * 5f);
                }
            }

            // Return crow to pool
            ObjectPool pool = ServiceLocator.Get<ObjectPool>();
            if (delivery.CrowGO != null && pool != null)
            {
                pool.Return(_crowPoolKey, delivery.CrowGO);
            }

            // Spawn impact VFX
            if (pool != null && pool.HasPool(_impactVfxPoolKey))
            {
                GameObject vfx = pool.Get(_impactVfxPoolKey);
                if (vfx != null)
                {
                    vfx.transform.position = delivery.TargetPos;

                    // Auto-return VFX after 2 seconds
                    pool.ReturnDelayed(_impactVfxPoolKey, vfx, 2f, this);
                }
            }

            // Screen shake
            if (_screenShakeOnImpact)
            {
                // Screen shake can be hooked up via GameEvents or a CameraShake service.
                // For now we log intent; integrate with your camera shake system.
#if UNITY_EDITOR
                Debug.Log($"[CrowDeliverySystem] Impact at {delivery.TargetPos} — " +
                    $"shake intensity={_screenShakeIntensity}, duration={_screenShakeDuration}");
#endif
            }
        }

        // ──────────────────────────────────────────────
        //  Arc Math
        // ──────────────────────────────────────────────

        /// <summary>
        /// Evaluates a parabolic arc between start and end at parameter t [0..1].
        /// The midpoint is elevated by <see cref="_arcHeight"/>.
        /// </summary>
        private Vector3 EvaluateArc(Vector3 start, Vector3 end, float t)
        {
            // Linear interpolation for XZ
            Vector3 linear = Vector3.Lerp(start, end, t);

            // Parabolic Y offset: peaks at t=0.5
            float parabola = 4f * _arcHeight * t * (1f - t);
            float baseY = Mathf.Lerp(start.y, end.y, t);
            linear.y = baseY + parabola;

            return linear;
        }

        // ──────────────────────────────────────────────
        //  Gizmos
        // ──────────────────────────────────────────────

#if UNITY_EDITOR
        private void OnDrawGizmos()
        {
            Gizmos.color = new Color(0.5f, 0f, 1f, 0.6f);

            foreach (var delivery in _activeDeliveries)
            {
                // Draw delivery target
                Gizmos.DrawWireSphere(delivery.TargetPos, delivery.AoeRadius);

                // Draw crow position
                if (delivery.CrowGO != null)
                {
                    Gizmos.DrawLine(delivery.CrowGO.transform.position, delivery.TargetPos);
                }
            }
        }
#endif
    }
}
