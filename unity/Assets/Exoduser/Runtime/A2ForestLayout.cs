using System;

namespace Exoduser.UnityPort
{
    // 승인된 A2 수로의 단일 경계. 렌더 구멍과 SourceMap 질의가 같은 함수를 쓴다.
    // Core tick/전투 규칙과 원본 ch1_map 데이터는 변경하지 않는다.
    public static class A2ForestLayout
    {
        public const float BridgeX=43.2f, BridgeZ=-71.8f;
        public const float WaterLevel=-1.25f, IslandX=53.3f, IslandZ=-77;
        public const float SinYaw=.406736643f, CosYaw=.913545458f;
        public static float Along(float x,float z) { return (x-BridgeX)*SinYaw+(z-BridgeZ)*CosYaw; }
        public static float Across(float x,float z) { return (x-BridgeX)*CosYaw-(z-BridgeZ)*SinYaw; }
        public static float Shore(float z)
        {
            float bend=Math.Max(0,Math.Min(1,(z+66)/10));bend=bend*bend*(3-2*bend);
            return 48+1.4f*(float)Math.Sin((z+72)*.22f)+34*bend;
        }
        public static bool Water(float x,float z)
        {
            if(z<=-94||z>=-30)return false;
            float u=Along(x,z),w=Across(x,z);
            return x>Shore(z)||(Math.Abs(u)<2.75f&&w>-8.5f&&w<20);
        }
        public static bool Bridge(float x,float z) { return Math.Abs(Along(x,z))<=4.45f&&Math.Abs(Across(x,z))<=1.7f; }
        public static bool Trunk(float x,float z)
        {
            if(Circle(x,z,34.8f,-70.5f,2.2f)||Circle(x,z,49,-64.8f,2)||Circle(x,z,53.3f,-77,1.1f)||Circle(x,z,29.5f,-64,1.1f)||Circle(x,z,47.6f,-67.2f,1.3f))return true;
            for(int layer=0;layer<3;layer++)for(int j=0;j<5;j++)if(Circle(x,z,22+j*9.5f+layer*2.3f,-57+layer*8.5f,.8f))return true;
            for(int layer=0;layer<3;layer++)for(int j=0;j<7;j++)
            {float tx=24+j*6.2f+layer*1.1f,tz=-60+layer*6.5f;if(SecondaryTree(tx,tz)&&Circle(x,z,tx,tz,.5f))return true;}
            return false;
        }
        public static bool SecondaryTree(float x,float z) { return !Circle(x,z,23.4f,-63.4f,3.5f)&&!Circle(x,z,59.4f,-60.2f,3.5f); }
        static bool Circle(float x,float z,float cx,float cz,float r) { return (x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r; }
        public static float IslandRadius(float angle) { return 3.4f*(1+.10f*(float)Math.Sin(angle*3)+.08f*(float)Math.Cos(angle*5)); }
        public static bool Island(float x,float z) { float dx=x-IslandX,dz=z-IslandZ;return Math.Sqrt(dx*dx+dz*dz)<=IslandRadius((float)Math.Atan2(dz,dx)); }
        public static float IslandHeight(float x,float z,float ground)
        {
            float dx=x-IslandX,dz=z-IslandZ,u=(float)Math.Sqrt(dx*dx+dz*dz)/IslandRadius((float)Math.Atan2(dz,dx));
            if(u>1.0001f)return ground;
            u=Math.Min(1,u);
            return (ground-.16f)*(1-u*u*u)+(WaterLevel-.25f)*(u*u*u);
        }
        public static bool BlockedCore(float x,float y) { float wx=x/100,wz=-y/100;return Water(wx,wz)&&!Bridge(wx,wz)||Trunk(wx,wz); }
    }
}
