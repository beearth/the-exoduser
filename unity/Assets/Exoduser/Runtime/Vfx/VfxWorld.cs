using UnityEngine;

namespace Exoduser.UnityPort.Vfx
{
    // The only Core pixel -> RM-1 ground-plane conversion used by VFX.
    // TODO(RemodelWorld): delegate to RemodelWorld.ToWorld(x, y, height) once
    // its RM-INT commit has entered unity/main. Do not merge RM-INT here.
    public static class VfxWorld
    {
        public const float MetresPerPixel = 0.01f;

        public static Vector3 ToWorld(double x, double y, float height = 0f)
        {
            float wx=(float)x*MetresPerPixel,wz=-(float)y*MetresPerPixel;
            return new Vector3(wx,(NativeRemodel3D.Active?NativeRemodel3D.GroundY(wx,wz):0)+height,wz);
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
