using System;

namespace Exoduser.UnityPort
{
    // 첫 네 주거목의 기존 SourceMap 차단 반경에 맞춘 시각 높이만 조정한다.
    public static class A2RootHeightProfile
    {
        public static float Radius(int placement)
        {
            switch(placement)
            {
                case 0:return 2.6f;
                case 1:return 2f;
                case 2:return 1.8f;
                case 3:return 1.9f;
                default:throw new ArgumentOutOfRangeException("placement");
            }
        }
        public static float Height(float originalHeight,float dx,float dz,int placement)
        {
            float radius=Radius(placement);
            float distance=(float)Math.Sqrt(dx*dx+dz*dz);
            float t=Math.Max(0,Math.Min(1,(distance-(radius-.7f))/.7f));
            return originalHeight*(1-.85f*t*t*(3-2*t));
        }
    }
}
