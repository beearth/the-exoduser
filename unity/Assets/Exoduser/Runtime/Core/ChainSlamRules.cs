using System;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core.Combat
{
    // 웹 _chainSlamRayHit. 전방 반평면과 세 갈래 사각 경로를 함께 검사한다.
    public static class ChainSlamRules
    {
        public static int StaminaCost(int level) { return 20 + Math.Max(1, level) * 2; }
        public static int Range(int level) { return 450 + (Math.Max(1, level) - 1) * 25; }
        public static int HalfWidth(int level) { return 36 + (Math.Max(1, level) - 1) * 2; }
        public static int Damage(double reference, int level, double attackMultiplier, double skillBoost, int tier)
        {
            return Js.Int(reference * SkillRules.SkMul("chainSlam", level) * attackMultiplier * Math.Max(1, Math.Min(3, tier)) * (1 + skillBoost));
        }
        public static bool RayHit(double ex, double ey, double er, double x, double y, double angle, double halfWidth, double reach)
        {
            double dx = ex - x, dy = ey - y;
            if (dx * Math.Cos(angle) + dy * Math.Sin(angle) < 0) return false;
            for (int arm = -1; arm <= 1; arm++)
            {
                double a = angle + arm * Math.PI / 7, c = Math.Cos(a), s = Math.Sin(a);
                double along = dx * c + dy * s, across = Math.Abs(-dx * s + dy * c);
                if (along >= 0 && along <= reach + er && across <= halfWidth + er) return true;
            }
            return false;
        }
    }
}
