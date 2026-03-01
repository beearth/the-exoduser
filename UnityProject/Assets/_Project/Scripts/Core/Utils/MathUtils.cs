using UnityEngine;

namespace Exoduser.Core.Utils
{
    /// <summary>
    /// Static math utilities for isometric ARPG gameplay. All methods are pure
    /// functions with no side-effects.
    /// </summary>
    public static class MathUtils
    {
        /// <summary>Constant for the 45-degree isometric rotation in radians.</summary>
        private const float ISO_ANGLE_RAD = 45f * Mathf.Deg2Rad;

        // Pre-computed sin/cos for the isometric rotation
        private static readonly float _isoCos = Mathf.Cos(ISO_ANGLE_RAD);
        private static readonly float _isoSin = Mathf.Sin(ISO_ANGLE_RAD);

        /// <summary>
        /// Tests whether a <paramref name="target"/> point lies within a cone
        /// defined by an origin, forward direction, half-angle, and range.
        /// Operates on the XZ plane (Y is ignored).
        /// </summary>
        /// <param name="origin">World-space origin of the cone.</param>
        /// <param name="forward">Normalized forward direction of the cone (XZ).</param>
        /// <param name="target">World-space position to test.</param>
        /// <param name="halfAngleDeg">Half-angle of the cone in degrees.</param>
        /// <param name="range">Maximum distance from origin.</param>
        /// <returns>True if <paramref name="target"/> is inside the cone.</returns>
        public static bool IsInCone(Vector3 origin, Vector3 forward, Vector3 target,
            float halfAngleDeg, float range)
        {
            Vector3 toTarget = target - origin;
            toTarget.y = 0f;
            forward.y = 0f;

            float distSqr = toTarget.sqrMagnitude;
            if (distSqr > range * range) return false;
            if (distSqr < 0.0001f) return true; // On top of origin

            float dot = Vector3.Dot(forward.normalized, toTarget.normalized);
            float cosHalf = Mathf.Cos(halfAngleDeg * Mathf.Deg2Rad);
            return dot >= cosHalf;
        }

        /// <summary>
        /// Converts a world-space XZ position to isometric screen coordinates.
        /// Uses a 45-degree rotation: screenX = (x - z) * cos45, screenY = (x + z) * sin45.
        /// The Y component of the input is forwarded as-is (height offset).
        /// </summary>
        /// <param name="worldPos">World-space position.</param>
        /// <returns>Isometric screen-space position.</returns>
        public static Vector3 WorldToIsometric(Vector3 worldPos)
        {
            float isoX = (worldPos.x - worldPos.z) * _isoCos;
            float isoY = (worldPos.x + worldPos.z) * _isoSin * 0.5f + worldPos.y;
            return new Vector3(isoX, isoY, 0f);
        }

        /// <summary>
        /// Converts a 2D isometric input direction (e.g. from WASD or stick) to a
        /// world-space XZ direction. Applies the inverse 45-degree rotation so that
        /// pressing "up" moves along the isometric up axis.
        /// </summary>
        /// <param name="screenDir">2D input direction (not necessarily normalized).</param>
        /// <returns>World-space direction on the XZ plane (Y = 0).</returns>
        public static Vector3 IsometricToWorld(Vector2 screenDir)
        {
            // Inverse of the 45-degree rotation matrix
            float worldX = screenDir.x * _isoCos + screenDir.y * _isoSin * 2f;
            float worldZ = -screenDir.x * _isoCos + screenDir.y * _isoSin * 2f;
            Vector3 result = new Vector3(worldX, 0f, worldZ);
            return result.sqrMagnitude > 0.0001f ? result.normalized : Vector3.zero;
        }

        /// <summary>
        /// Returns the normalized knockback direction from <paramref name="from"/>
        /// to <paramref name="to"/> on the XZ plane.
        /// If the two points are coincident, returns <see cref="Vector3.forward"/>.
        /// </summary>
        public static Vector3 GetKnockbackDirection(Vector3 from, Vector3 to)
        {
            Vector3 dir = to - from;
            dir.y = 0f;
            return dir.sqrMagnitude > 0.0001f ? dir.normalized : Vector3.forward;
        }

        /// <summary>
        /// Returns a random point within a cone on the XZ plane.
        /// Useful for fan-shot spread or shield-bash area selection.
        /// </summary>
        /// <param name="origin">World-space origin of the cone.</param>
        /// <param name="forward">Normalized forward direction (XZ).</param>
        /// <param name="halfAngleDeg">Half-angle of the cone in degrees.</param>
        /// <param name="distance">Distance from origin to the random point.</param>
        /// <returns>A random world-space point inside the cone.</returns>
        public static Vector3 RandomPointInCone(Vector3 origin, Vector3 forward,
            float halfAngleDeg, float distance)
        {
            forward.y = 0f;
            if (forward.sqrMagnitude < 0.0001f)
                forward = Vector3.forward;
            else
                forward.Normalize();

            float randomAngle = Random.Range(-halfAngleDeg, halfAngleDeg);
            Quaternion rotation = Quaternion.AngleAxis(randomAngle, Vector3.up);
            Vector3 direction = rotation * forward;

            float randomDist = Random.Range(0f, distance);
            return origin + direction * randomDist;
        }

        /// <summary>
        /// Remaps a value from one range to another (unclamped).
        /// </summary>
        /// <param name="value">The value to remap.</param>
        /// <param name="fromMin">Source range minimum.</param>
        /// <param name="fromMax">Source range maximum.</param>
        /// <param name="toMin">Target range minimum.</param>
        /// <param name="toMax">Target range maximum.</param>
        /// <returns>The remapped value. Not clamped to [toMin, toMax].</returns>
        public static float Remap(float value, float fromMin, float fromMax, float toMin, float toMax)
        {
            if (Mathf.Approximately(fromMax, fromMin))
                return toMin;

            float t = (value - fromMin) / (fromMax - fromMin);
            return toMin + t * (toMax - toMin);
        }

        /// <summary>
        /// Smooth-damps a value toward a target, clamping the result to [0, 1].
        /// Wraps <see cref="Mathf.SmoothDamp"/> with built-in clamping.
        /// </summary>
        /// <param name="current">Current value.</param>
        /// <param name="target">Value to approach.</param>
        /// <param name="velocity">Reference velocity (modified each call).</param>
        /// <param name="smoothTime">Approximate time to reach the target.</param>
        /// <param name="deltaTime">Time step (typically <c>Time.deltaTime</c>).</param>
        /// <returns>The smoothed and clamped value.</returns>
        public static float SmoothDamp01(float current, float target, ref float velocity,
            float smoothTime, float deltaTime)
        {
            float result = Mathf.SmoothDamp(current, target, ref velocity, smoothTime,
                Mathf.Infinity, deltaTime);
            return Mathf.Clamp01(result);
        }
    }
}
