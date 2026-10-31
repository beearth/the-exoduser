using System;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort
{
    // 표시 전용. Core의 분류 우선순위와 리모델 반사 금지를 읽으며 판정·색 필드는 쓰지 않는다.
    public static class DruidProjectileAppearance
    {
        public static bool UseDeepBlack(BossProjectile p, bool remodel)
        {
            if (p == null || !p.Active || !p.DruidPoison || p.Friendly || p.Mine) return false;
            return remodel || ParryRules.ProjectileParryClass(new ParryRules.ProjectileFlags {
                ParryClass = p.ParryClass,
                BlackBean = p.BlackBean, ElemBall = p.ElemBall, Web = p.Web,
                GbBean = p.GbBean, BlueBean = p.BlueBean, FireMagic = p.FireMagic,
                WaterBean = p.WaterBean, TitanEye = p.TitanEye, BwBean = p.BwBean,
                RedBean = p.RedBean, El = p.El
            }) == ParryRules.ProjClass.Forbidden;
        }

        // 구면 법선의 좁은 반사광 + 회색 가장자리. 녹색 발광 없이 어두운 바닥에서 윤곽을 보존한다.
        // 좌표 -1..1, 16프레임 순환. 출력은 비선형 색 공간의 RGBA8이며 판정 반경과 무관하다.
        public static void Pixel(double x, double y, int frame, out byte red, out byte green, out byte blue, out byte alpha)
        {
            double r = Math.Sqrt(x * x + y * y), phase = (frame % 16) * Math.PI / 8;
            double a, rr, gg, bb;
            if (r <= .78)
            {
                double nx = x / .78, ny = y / .78, nz = Math.Sqrt(Math.Max(0, 1 - nx * nx - ny * ny));
                double light = Math.Max(0, -.42 * nx + .48 * ny + .77 * nz);
                double gloss = Math.Pow(light, 64) * (.92 + .08 * Math.Cos(phase));
                double rim = Math.Pow(1 - nz, 3) * 65;
                rr = 5 + 10 * nz + rim + 220 * gloss;
                gg = 6 + 11 * nz + rim + 225 * gloss;
                bb = 9 + 14 * nz + rim + 230 * gloss;
                a = Math.Min(1, (.78 - r) * 128);
            }
            else
            {
                // 바깥 연무는 낮은 알파의 중성 회색. 몸체의 불투명한 딥 블랙이 주가 된다.
                double wave = .5 + .5 * Math.Sin(Math.Atan2(y, x) * 9 - phase + r * 30);
                a = Math.Max(0, 1 - (r - .78) / .2) * .18 * wave;
                rr = 56; gg = 59; bb = 66;
            }
            red = Byte(rr); green = Byte(gg); blue = Byte(bb); alpha = Byte(a * 255);
        }
        static byte Byte(double v) { return (byte)Math.Max(0, Math.Min(255, Math.Round(v))); }
    }
}
