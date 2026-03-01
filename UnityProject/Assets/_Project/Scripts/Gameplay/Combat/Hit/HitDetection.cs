using UnityEngine;
using Exoduser.Core.Utils;

namespace Exoduser.Gameplay.Combat.Hit
{
    /// <summary>
    /// Static utility class providing common hit detection shapes for melee attacks,
    /// AoE abilities, and projectile checks. All methods are allocation-light where possible.
    /// </summary>
    public static class HitDetection
    {
        // Shared buffer to reduce allocations in OverlapSphere/Box calls.
        private static readonly Collider[] SharedBuffer = new Collider[64];

        /// <summary>
        /// Performs a cone-shaped hit check. Uses OverlapSphere then filters by angle.
        /// Suitable for melee swings, breath attacks, etc.
        /// </summary>
        /// <param name="origin">Center point of the cone (e.g., attacker position).</param>
        /// <param name="forward">Forward direction of the cone.</param>
        /// <param name="halfAngle">Half-angle of the cone in degrees (e.g., 45 for a 90-degree cone).</param>
        /// <param name="range">Radius of the cone.</param>
        /// <param name="mask">LayerMask to filter colliders.</param>
        /// <returns>Array of colliders within the cone. May contain nulls at the end -- use length.</returns>
        public static Collider[] ConeCheck(Vector3 origin, Vector3 forward, float halfAngle, float range, LayerMask mask)
        {
            int count = Physics.OverlapSphereNonAlloc(origin, range, SharedBuffer, mask);

            // Filter by cone angle
            int validCount = 0;
            for (int i = 0; i < count; i++)
            {
                Vector3 dirToTarget = (SharedBuffer[i].transform.position - origin).normalized;
                if (MathUtils.IsInCone(origin, forward, SharedBuffer[i].transform.position, halfAngle, range))
                {
                    // Swap valid collider to front
                    if (i != validCount)
                    {
                        var temp = SharedBuffer[validCount];
                        SharedBuffer[validCount] = SharedBuffer[i];
                        SharedBuffer[i] = temp;
                    }
                    validCount++;
                }
            }

            var results = new Collider[validCount];
            System.Array.Copy(SharedBuffer, results, validCount);
            return results;
        }

        /// <summary>
        /// Performs a box-shaped hit check. Suitable for broad sword swings or rectangular AoE.
        /// </summary>
        /// <param name="center">Center of the box.</param>
        /// <param name="halfExtents">Half-size of the box along each axis.</param>
        /// <param name="orientation">Rotation of the box.</param>
        /// <param name="mask">LayerMask to filter colliders.</param>
        /// <returns>Array of colliders within the box.</returns>
        public static Collider[] BoxCheck(Vector3 center, Vector3 halfExtents, Quaternion orientation, LayerMask mask)
        {
            int count = Physics.OverlapBoxNonAlloc(center, halfExtents, SharedBuffer, orientation, mask);

            var results = new Collider[count];
            System.Array.Copy(SharedBuffer, results, count);
            return results;
        }

        /// <summary>
        /// Performs a spherical (circle in 2D-plane terms) hit check.
        /// Suitable for AoE explosions, stomp attacks, aura damage.
        /// </summary>
        /// <param name="center">Center of the sphere.</param>
        /// <param name="radius">Radius of the sphere.</param>
        /// <param name="mask">LayerMask to filter colliders.</param>
        /// <returns>Array of colliders within the sphere.</returns>
        public static Collider[] CircleCheck(Vector3 center, float radius, LayerMask mask)
        {
            int count = Physics.OverlapSphereNonAlloc(center, radius, SharedBuffer, mask);

            var results = new Collider[count];
            System.Array.Copy(SharedBuffer, results, count);
            return results;
        }

        /// <summary>
        /// Performs a raycast for line-based hit detection.
        /// Suitable for projectile paths, laser beams, line-of-sight checks.
        /// </summary>
        /// <param name="origin">Start point of the ray.</param>
        /// <param name="direction">Direction of the ray.</param>
        /// <param name="distance">Maximum ray distance.</param>
        /// <param name="mask">LayerMask to filter hits.</param>
        /// <returns>Array of RaycastHit results sorted by distance.</returns>
        public static RaycastHit[] RayCheck(Vector3 origin, Vector3 direction, float distance, LayerMask mask)
        {
            RaycastHit[] hits = Physics.RaycastAll(origin, direction, distance, mask);

            // Sort by distance (closest first)
            System.Array.Sort(hits, (a, b) => a.distance.CompareTo(b.distance));

            return hits;
        }
    }
}
