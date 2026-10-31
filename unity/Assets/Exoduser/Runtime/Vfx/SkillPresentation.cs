namespace Exoduser.UnityPort.Vfx
{
    // Presentation admission only. A zero kind deliberately leaves the original renderer active.
    public static class SkillPresentation
    {
        public const uint EnemyPoisonCore=0xc8e8a8,EnemyPoisonMid=0x5f8a2e,EnemyPoisonShadow=0x1c2810;
        public const uint EnemyDarkCore=0xcdb2e0,EnemyDarkMid=0x5e3478,EnemyDarkShadow=0x170c20;
        public static bool Supports(string id) { return id=="spikeTrap"||id=="giantSlam"||id=="holyDome"||id=="iceOrb"||id=="fireball"; }
        public static int BulletKind(bool poison,bool physical,int element) { return poison?1:physical?2:element==3?3:0; }
        public static float KiWidth(int step,float chargeScale) { return (step==3?252:192)*chargeScale; }
        static int Order(float y,int offset) { if(float.IsNaN(y))return offset;return (int)System.Math.Min(32767-offset,System.Math.Max(-32768-offset,(double)y))+offset; }
        public static int ContactOrder(float actorY) { return Order(actorY,4); }
        public static int ResidualOrder(float actorY) { return Order(actorY,-4); }
        public static bool VisibleViewport(float x,float y,float depth) { return depth>0&&!float.IsInfinity(depth)&&x>=-.1f&&x<=1.1f&&y>=-.1f&&y<=1.1f; }
    }
}
