using System;
using System.Collections.Generic;
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
        // Review input priority. Without review, none of the diagnostic stages owns input.
        public enum InputStep { Existing,Coverage,Contact,Edge }
        public static InputStep InputStepFor(bool review,bool coverageWaiting,bool contact,bool edge)
        {
            return !review?InputStep.Existing:coverageWaiting?InputStep.Coverage:contact?InputStep.Contact:edge?InputStep.Edge:InputStep.Existing;
        }
        public const int CoverageTimeoutTicks=90*60; // simulation time, 60 Hz; capture pauses do not consume ticks
        [Serializable] public sealed class CoverageLife
        {
            public int life,startTick,elapsedTicks;
            public bool complete,coverageTimeout;
            public string[] expected,activated,missing;
        }
        // One tracker per boss encounter. Cache the live set's phase lists once; never write Core data.
        public sealed class LifeCoverageTracker
        {
            sealed class Life
            {
                public string[] expected;
                public readonly HashSet<string> seen=new HashSet<string>();
                public int start=-1,last,stop=-1;
                public bool timedOut;
            }
            readonly Life[] lives;
            public LifeCoverageTracker(BossRemodelSet set)
            {
                if(set==null)throw new ArgumentNullException(nameof(set));
                lives=new Life[set.Lives];
                for(int i=0;i<lives.Length;i++)lives[i]=new Life{expected=set.MovesOfPhase(i)};
            }
            Life Touch(int phase,int tick)
            {
                if(phase<0||phase>=lives.Length)return null;
                var life=lives[phase];
                if(life.start<0)life.start=tick;
                life.last=tick;
                return life;
            }
            public void Observe(int phase,int tick,string activation)
            {
                var life=Touch(phase,tick);
                if(life==null||activation==null||Array.IndexOf(life.expected,activation)<0)return;
                life.seen.Add(activation);
                if(life.seen.Count==life.expected.Length&&life.stop<0)life.stop=tick;
            }
            public bool Waiting(int phase,int tick)
            {
                var life=Touch(phase,tick);
                if(life==null)return false;
                if(life.seen.Count==life.expected.Length)
                {
                    if(life.stop<0)life.stop=tick;
                    return false;
                }
                if(life.timedOut)return false;
                if(tick-life.start<CoverageTimeoutTicks)return true;
                life.timedOut=true;life.stop=life.start+CoverageTimeoutTicks;
                return false;
            }
            // Allocate only when writing the final receipt, not in the tick/input path.
            public CoverageLife[] Results()
            {
                var rows=new List<CoverageLife>();
                for(int i=0;i<lives.Length;i++)
                {
                    var life=lives[i];if(life.start<0)continue;
                    var activated=new List<string>();var missing=new List<string>();
                    foreach(var id in life.expected)if(life.seen.Contains(id))activated.Add(id);else missing.Add(id);
                    rows.Add(new CoverageLife{life=i+1,startTick=life.start,elapsedTicks=Math.Min(CoverageTimeoutTicks,Math.Max(0,(life.stop<0?life.last:life.stop)-life.start)),complete=missing.Count==0,coverageTimeout=life.timedOut,expected=(string[])life.expected.Clone(),activated=activated.ToArray(),missing=missing.ToArray()});
                }
                return rows.ToArray();
            }
        }
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

        // ---- B8 / retouch cuts (11-04), only with --unity-boss-arena-seq ----
        public const int SeqEntryExitFrames=300;
        public const double PureBlackMeanY=.5,PureBlackMaxSeconds=.5;
        // seq-entry: from the first frame of the field fade-out (Core LoadPhase 0 -> 1 while not yet in the arena; EnterArena follows 50 ticks later) for 300 frames.
        // seq-exit: from the first frame InArena turns false, 300 frames.
        public sealed class EntryExitWindow
        {
            int prevLoad;bool prevArena,have;public int EntryLeft,ExitLeft;
            public void Step(int loadPhase,bool inArena,out bool entry,out bool exit)
            {
                if(have)
                {
                    if(prevLoad==0&&loadPhase>0&&!inArena)EntryLeft=SeqEntryExitFrames;
                    if(prevArena&&!inArena)ExitLeft=SeqEntryExitFrames;
                }
                have=true;prevLoad=loadPhase;prevArena=inArena;
                entry=EntryLeft>0;exit=ExitLeft>0;
                if(entry)EntryLeft--;
                if(exit)ExitLeft--;
            }
        }
        // Longest run of pure-black frames (mean Y < .5 of 255) and its duration in real seconds.
        public sealed class BlackRun
        {
            int run;double seconds;public int Longest;public double LongestSeconds,Total;
            public void Add(double meanY255,double frameSeconds)
            {
                if(meanY255<PureBlackMeanY){run++;seconds+=frameSeconds;Total+=frameSeconds;if(run>Longest)Longest=run;if(seconds>LongestSeconds)LongestSeconds=seconds;}
                else{run=0;seconds=0;}
            }
        }
        public static double LumaY(int r,int g,int b){return .2126*r+.7152*g+.0722*b;}
        // bullet-cut: the first frame a boss warning or live hazard (never the arena-wide pulse) points at / reaches the hero. All numbers come from the read-only Core telegraph snapshot.
        public static bool TeleTowardHero(DruidTelegraph t,double hx,double hy,double heroR)
        {
            if(t==null||t.Kind==DruidTeleKind.None)return false;
            double dx=hx-t.X,dy=hy-t.Y,dist=Math.Sqrt(dx*dx+dy*dy);
            switch(t.Shape)
            {
                case DruidTeleShape.Circle:return dist<=t.Radius+heroR+200;
                case DruidTeleShape.Cone:return dist<=t.Radius+heroR&&AngleDiff(Math.Atan2(dy,dx),t.Dir)<=t.Angle*.5+.35;
                case DruidTeleShape.Line:case DruidTeleShape.Trail:return dist<=t.Length+heroR&&AngleDiff(Math.Atan2(dy,dx),t.Dir)<=.5;
                case DruidTeleShape.RingGap:return t.Live&&dist<=t.Radius+t.Width*.5+heroR+120&&dist>=t.Inner-heroR-400;
                default:return false;
            }
        }
        static double AngleDiff(double a,double b){double d=(a-b)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return Math.Abs(d);}
        // far-enemy-cut: the enemy sits in the top third of the screen (Unity screen y grows upward) and in front of the camera.
        public static bool InTopThird(float screenY,float screenZ,int screenHeight){return screenZ>0&&screenY>=screenHeight*2f/3f&&screenY<=screenHeight;}
    }
}
