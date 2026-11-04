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
        // edge-hit capture (boss board 8.5.5): which lives the bot stands on the body edge for. --unity-boss-arena-p3-edge = life 3 (old arg), --unity-boss-arena-edge = all three,
        // --unity-boss-arena-edge=1,3 = the listed lives (1-based; unknown tokens ignored, nothing valid = all three). Result index = life 0..2.
        public static bool[] EdgeLives(string[] args)
        {
            var lives=new bool[3];
            if(args==null)return lives;
            foreach(var a in args)
            {
                if(a==null)continue;
                if(a=="--unity-boss-arena-p3-edge"){lives[2]=true;continue;}
                if(a=="--unity-boss-arena-edge"){lives[0]=lives[1]=lives[2]=true;continue;}
                if(!a.StartsWith("--unity-boss-arena-edge="))continue;
                bool any=false;
                foreach(var token in a.Substring("--unity-boss-arena-edge=".Length).Split(','))
                {
                    int n;
                    if(int.TryParse(token.Trim(),out n)&&n>=1&&n<=3){lives[n-1]=true;any=true;}
                }
                if(!any)lives[0]=lives[1]=lives[2]=true;
            }
            return lives;
        }
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
