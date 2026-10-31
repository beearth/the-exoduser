namespace Exoduser.UnityPort.Vfx
{
    // Presentation admission only. A zero kind deliberately leaves the original renderer active.
    public static class SkillPresentation
    {
        public static bool Supports(string id) { return id=="spikeTrap"||id=="giantSlam"||id=="holyDome"||id=="iceOrb"||id=="fireball"; }
        public static int BulletKind(bool poison,bool physical,int element) { return poison?1:physical?2:element==3?3:0; }
        public static float KiWidth(int step,float chargeScale) { return (step==3?252:192)*chargeScale; }
    }
}
