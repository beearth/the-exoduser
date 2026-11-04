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
        // Continuous-frame QA capture (boss board 8.5.6 risks 2-4): --unity-boss-arena-seq together with --unity-boss-arena-review. Absent = the old path untouched.
        public static bool SeqRequested(string[] args)
        {
            if(args==null)return false;
            bool review=false,seq=false;
            foreach(var a in args){if(a=="--unity-boss-arena-review")review=true;else if(a=="--unity-boss-arena-seq")seq=true;}
            return review&&seq;
        }
        public const int SeqCollapsePre=10,SeqCollapsePost=30,SeqCollapseMax=360,SeqEruptPreTicks=20,SeqEruptPostTicks=40,SeqEruptMax=3,SeqContactFrames=600;
        public const int ContactAttack1=120,ContactRoll=12,ContactAttack2=60,ContactDash=15,ContactCycle=ContactAttack1+ContactRoll+ContactAttack2+ContactDash;
        public enum ContactStep{Attack,Roll,Dash}
        // contact bot (input only): attack 2 s -> roll toward the boss centre -> attack 1 s -> dash toward the boss centre -> repeat. press = the first ticks of a roll/dash segment (the key edge).
        public static ContactStep ContactAt(int ticksSinceStart,out bool press)
        {
            int t=ticksSinceStart%ContactCycle;press=false;
            if(t<ContactAttack1)return ContactStep.Attack;
            t-=ContactAttack1;
            if(t<ContactRoll){press=t<2;return ContactStep.Roll;}
            t-=ContactRoll;
            if(t<ContactAttack2)return ContactStep.Attack;
            t-=ContactAttack2;
            press=t<2;return ContactStep.Dash;
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
