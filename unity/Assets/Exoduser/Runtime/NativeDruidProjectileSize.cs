using System;

namespace Exoduser.UnityPort
{
    // 기존 2D 탄막의 크기 계약만 분리. 3D 모델/클립/방향 표시는 소유하지 않는다.
    public static class NativeDruidProjectileSize
    {
        public static double ProjectileDiameter(double radius, double size, bool large)
        {
            return Math.Max(Math.Max(0, radius) * 2, Math.Min(large ? 64 : 28, Math.Max(12, size * 14)));
        }
    }
}
