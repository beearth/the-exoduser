namespace Exoduser.UnityPort.Vfx
{
    // Presentation admission only. A zero kind deliberately leaves the original renderer active.
    public static class SkillPresentation
    {
        public const uint EnemyPoisonCore=0xc8e8a8,EnemyPoisonMid=0x5f8a2e,EnemyPoisonShadow=0x1c2810;
        public const uint EnemyDarkCore=0xcdb2e0,EnemyDarkMid=0x5e3478,EnemyDarkShadow=0x170c20;
        public static float BossImpactOpacity(double age){return age<0||age>=.1?0:(float)System.Math.Pow(1-age/.1,2);}
        public static float KiLayerOpacity(int layer,bool heavy){switch(layer){case 0:return .35f;case 1:return .025f;case 2:return .08f;case 3:return heavy?.08f:.07f;case 4:return heavy?.50f:.72f;default:return 0;}}
        public static int FriendlyKiOrder(float actorY){return Order(actorY,-1024);}
        // Preserve the source image's value structure, with the approved restrained palette.
        public static uint EnemyPixel(uint rgb,bool poison)
        {
            double value=((rgb>>16&255)*.299+(rgb>>8&255)*.587+(rgb&255)*.114)/255;
            uint shadow=poison?EnemyPoisonShadow:EnemyDarkShadow,mid=poison?EnemyPoisonMid:EnemyDarkMid,core=poison?EnemyPoisonCore:EnemyDarkCore;
            uint a=value<.48?shadow:mid,b=value<.48?mid:core;double t=value<.48?value/.48:(value-.48)/.52;
            uint result=0;for(int shift=16;shift>=0;shift-=8)result|=(uint)System.Math.Round((a>>shift&255)*(1-t)+(b>>shift&255)*t)<<shift;
            return result;
        }
        public static bool Supports(string id) { return id=="spikeTrap"||id=="giantSlam"||id=="holyDome"||id=="iceOrb"||id=="fireball"; }
        public static int BulletKind(bool poison,bool physical,int element) { return poison?1:physical?2:element==3?3:0; }
        public static float KiWidth(int step,float chargeScale) { return (step==3?252:192)*chargeScale; }
        public static double EnemyWidth(bool poison,bool physical,bool elementBall,double size)
        {
            if(poison)return (elementBall?240:System.Math.Max(96,System.Math.Min(180,size*24)))*(physical?2:1);
            double sz=size==0?1:size,ps=System.Math.Max(1.2,System.Math.Min(4,sz*1.5))*.7;
            return elementBall?System.Math.Max(96,sz*5.3)*2:physical?22.05*ps*2*.55*2:44*ps;
        }
        public static float ContactOpacity(double age)
        {
            if(age<0||age>=.16)return 0;
            return (float)(age<.04?1:System.Math.Pow(1-(age-.04)/.12,1.4));
        }
        public static bool PuffCanYield(double age,bool existingCritical,bool incomingCritical)
        {
            return age>=.8||incomingCritical&&!existingCritical&&age>=.15;
        }
        static int Order(float y,int offset) { if(float.IsNaN(y))return offset;return (int)System.Math.Min(32767-offset,System.Math.Max(-32768-offset,(double)y))+offset; }
        public static int ContactOrder(float actorY) { return Order(actorY,4); }
        public static int ResidualOrder(float actorY) { return Order(actorY,-4); }
        public static bool VisibleViewport(float x,float y,float depth) { return depth>0&&!float.IsInfinity(depth)&&x>=-.1f&&x<=1.1f&&y>=-.1f&&y<=1.1f; }
    }
}
