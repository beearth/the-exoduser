using UnityEngine;

namespace Exoduser.UnityPort.Vfx
{
    // The only Core pixel -> RM-1 ground-plane conversion used by VFX.
    // Active RM-INT uses the same terrain/deck height as actors. Flat capture tools
    // and the 2D arena retain their original zero-height ground convention.
    public static class VfxWorld
    {
        public const float MetresPerPixel = 0.01f;

        public static Vector3 ToWorld(double x, double y, float height = 0f)
        {
            float wx = (float)x * MetresPerPixel, wz = -(float)y * MetresPerPixel;
            return new Vector3(wx, height + (NativeRemodel3D.Active ? NativeRemodel3D.GroundY(wx, wz) : 0f), wz);
        }

        public static Vector3 ToWorldMetres(Vector2 ground, float height = 0f)
        {
            return ToWorld(ground.x / MetresPerPixel,
                -ground.y / MetresPerPixel, height);
        }

        public static Vector2 ToPlanar(double x, double y)
        {
            Vector3 p = ToWorld(x, y);
            return new Vector2(p.x, p.z);
        }
    }
}
