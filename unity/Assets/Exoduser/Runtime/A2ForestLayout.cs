using System;

namespace Exoduser.UnityPort
{
    // 승인된 A2 수로의 단일 경계. 렌더 구멍과 SourceMap 질의가 같은 함수를 쓴다.
    // Core tick/전투 규칙과 원본 ch1_map 데이터는 변경하지 않는다.
    public static class A2ForestLayout
    {
        public const float BridgeX=43.2f, BridgeZ=-71.8f;
        public const float SinYaw=.406736643f, CosYaw=.913545458f;
        public static float Along(float x,float z) { return (x-BridgeX)*SinYaw+(z-BridgeZ)*CosYaw; }
        public static float Across(float x,float z) { return (x-BridgeX)*CosYaw-(z-BridgeZ)*SinYaw; }
        public static float Shore(float z) { return 48+1.4f*(float)Math.Sin((z+72)*.22f); }
        public static bool Water(float x,float z)
        {
            if(z<=-94||z>=-30)return false;
            float u=Along(x,z),w=Across(x,z);
            return x>Shore(z)||(Math.Abs(u)<2.75f&&w>-8.5f&&w<20);
        }
        public static bool Bridge(float x,float z) { return Math.Abs(Along(x,z))<=4.45f&&Math.Abs(Across(x,z))<=1.25f; }
        public static bool BlockedCore(float x,float y) { return Water(x/100,-y/100)&&!Bridge(x/100,-y/100); }
    }
}
