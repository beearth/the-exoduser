using System;

namespace Exoduser.UnityPort
{
    // Presentation only; logical radius/position stay in Core pixel coordinates.
    public static class NativeGroundSkillGeometry
    {
        public const int Segments = 16;
        public const float SurfaceLift = .025f, RingLift = .03f;
        public struct Vertex { public float X, Y, Z; }
        public static Vertex Place(float px, float py, float dx, float dy, double rotation, Func<float,float,float> height, float lift)
        {
            double c = Math.Cos(rotation), s = Math.Sin(rotation);
            float x = px / 100 + (float)(dx * c - dy * s);
            float z = -py / 100 + (float)(dx * s + dy * c);
            return new Vertex { X = x, Y = height(x, z) + lift, Z = z };
        }
    }
}
