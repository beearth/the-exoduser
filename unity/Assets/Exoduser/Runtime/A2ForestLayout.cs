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
            float returning=Math.Max(0,Math.Min(1,(z+52)/10));returning=returning*returning*(3-2*returning);
            return 48+1.4f*(float)Math.Sin((z+72)*.22f)+34*bend-28*returning;
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
        public static bool SolidCore(float x,float y) { return Trunk(x/100,-y/100); }
        // 수로 삼각형의 일부가 남는 가장자리도 높은 원본 정점이 수면 위로 솟지 않게 한다.
        public static float CutHeight(float x,float z,float ground) { return Water(x,z)?WaterLevel-.3f:ground; }
        // 물가의 높은 수직 단면을 침식 경사로 잇는다. 통행 다리의 기존 높이는 보존한다.
        public static float BankHeight(float x,float z,float ground)
        {
            if(z<=-94||z>=-30||Water(x,z)||Bridge(x,z))return ground;
            // 굽은 강에서 X축 간격은 실제 물가 거리가 아니다. 접선의 법선 방향 폭으로 보정한다.
            float slope=(Shore(z+.05f)-Shore(z-.05f))/.1f;
            float d=(Shore(z)-x)/(float)Math.Sqrt(1+slope*slope);
            float u=Math.Abs(Along(x,z))-2.75f,w=Across(x,z);
            float end=Math.Max(-8.5f-w,w-20);
            float branch=(float)Math.Sqrt(Math.Max(0,u)*Math.Max(0,u)+Math.Max(0,end)*Math.Max(0,end))+Math.Min(Math.Max(u,end),0);
            d=Math.Min(d,branch);
            float t=Math.Max(0,Math.Min(1,d/2));t=t*t*(3-2*t);
            return (WaterLevel+.22f)*(1-t)+ground*t;
        }
    }
}
