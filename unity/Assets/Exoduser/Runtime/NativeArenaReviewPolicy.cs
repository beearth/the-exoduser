using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Read-only actual executor evidence. A warning state alone can never satisfy coverage.
    public static class NativeArenaReviewPolicy
    {
        public static readonly string[] Moves=
        {
            "slashCombo","slam","charge","grab","burrowStrike","groundFissure","heartbeat"
        };
        public static string Activation(string state,double remaining,string previousState,int beat,int previousBeat,bool eruptHit,bool previousErupt,int liveFissureSerial,int previousFissureSerial)
        {
            if(state=="bossSlash"&&remaining==DruidRemodelData.SlashHitAt)return "slashCombo";
            if(previousState=="bossSlam"&&state=="bossRec")return "slam";
            if(state=="bossCharge"&&previousState!="bossCharge")return "charge";
            if((state=="bossGrabLunge"||state=="bossGrab")&&previousState!="bossGrabLunge"&&previousState!="bossGrab")return "grab";
            if(state=="bossDruidErupt"&&eruptHit&&!previousErupt)return "burrowStrike";
            if(liveFissureSerial>previousFissureSerial)return "groundFissure";
            if(beat>previousBeat&&(state=="bossHeartPause"||state=="bossRec"))return "heartbeat";
            return null;
        }
    }
}
