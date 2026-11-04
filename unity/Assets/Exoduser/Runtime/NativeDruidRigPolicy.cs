using System;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Read-only presentation decisions. Never changes a Core state, timer or RNG.
    public static class NativeDruidRigPolicy
    {
        public static bool Requested(string[] args)
        {
            bool enabled=false;if(args==null)return false;
            for(int i=0;i<args.Length;i++)
            {
                string value=null;
                if(args[i]!=null&&args[i].StartsWith("--boss-render=",StringComparison.Ordinal))value=args[i].Substring(14);
                else if(args[i]=="--boss-render"&&i+1<args.Length)value=args[++i];
                if(value!=null)enabled=value=="rigpixel";
            }
            return enabled;
        }
        public struct Plan
        {
            public string Name; public double CoreTicks, ElapsedTicks, Frame;
            public bool Loop, Held, StripHorizontalRoot;
            // v9.1: life index 0..2 (P1..P3), the 1-frame state clip layered over the action (null for the transition clips), and whether the plan is a whole-body transition clip.
            public int Life; public string Overlay; public bool Transition;
        }
        public static readonly string[] AllClips = {
            "Idle","Walk","slash1_tele","slash1_act","slash2_tele","slash2_act","slash3_tele","slash3_act","slash_rec",
            "slam_tele","slam_act","slam_rec","charge_tele","charge_run","charge_rec",
            "grab_tele","grab_lunge","grab_hold","grab_throw","grab_miss_rec",
            "burrow_dive","burrow_erupt_warn","burrow_erupt","burrow_rec",
            "fissure_tele","fissure_act","fissure_rec","heart_tele","heart_beat","heart_pause","heart_rec",
            "state_P1","state_P2","state_P3","phase12_collapse","phase23_collapse","intro_reveal","death_sink"
        };
        public static readonly string[] StateClips = { "state_P1","state_P2","state_P3" };
        public const int Phase23HuskOffFrame = 108;   // PREP section 10: husk hierarchy off and HuskHeap_P3 on at this frame of phase23_collapse
        public const int Phase23WalkFrom = 50;        // old man starts walking out (authored f50-108)
        public const int IntroTicks = 90;             // Core: StageFlow BossIntro sets the boss stun to 90 ticks (the first tick it can act again)
        public static string StateClip(int life){return StateClips[Math.Max(0,Math.Min(2,life))];}
        public static int Frames(string name)
        {
            switch(name) {
                case "Idle":case "grab_hold":return 120; case "Walk":return 64;
                case "slash1_tele":return 32; case "slash2_tele":case "slash3_tele":return 24;
                case "slash1_act":case "slash2_act":case "slash3_act":return 8;
                case "slash_rec":case "grab_miss_rec":return 80;
                case "slam_tele":return 48;case "slam_act":case "burrow_erupt":return 6;
                case "slam_rec":case "charge_rec":case "burrow_rec":return 70;
                case "charge_tele":return 54;case "charge_run":case "fissure_tele":return 40;
                case "grab_tele":case "grab_throw":case "fissure_rec":case "heart_beat":return 60;
                case "grab_lunge":return 18;case "burrow_dive":return 50;
                case "state_P1":case "state_P2":case "state_P3":return 1;
                case "phase12_collapse":case "phase23_collapse":return 120;case "intro_reveal":return 165;case "death_sink":return 150;
                case "burrow_erupt_warn":case "heart_pause":return 30;
                case "fissure_act":return 20;case "heart_tele":case "heart_rec":return 90;
                default:return 0;
            }
        }
        static double Clamp(double x,double max){return Math.Max(0,Math.Min(max,x));}
        static Plan Phase(string name,double duration,double elapsed,bool loop=false,bool held=false)
        {
            duration=Math.Max(1,duration);elapsed=Clamp(elapsed,duration);
            return new Plan{Name=name,CoreTicks=duration,ElapsedTicks=elapsed,Frame=Frames(name)*elapsed/duration,Loop=loop,Held=held,
                StripHorizontalRoot=name=="charge_run"||name=="grab_lunge"};
        }
        static double Tele(DruidData d,int slot){return d.RmTeleTotal>0?d.RmTeleTotal:DruidRemodelData.Moves[slot].Tele;}
        public static string StateMove(string state)
        {
            switch(state){
                case "bossSlashWind":case "bossSlash":return "slashCombo";
                case "bossSlamWind":case "bossSlam":return "slam";
                case "bossChargeWind":case "bossCharge":case "bossShock":return "charge";
                case "bossGrabWind":case "bossGrabLunge":case "bossGrab":return "grab";
                case "bossDruidDive":case "bossDruidUnder":case "bossDruidErupt":return "burrowStrike";
                case "bossHeartWind":case "bossHeartPause":return "heartbeat";
                case "bossRmWind":return "groundFissure";
                default:return null;
            }
        }
        // All numbers below are read from current Core counters. Source clips never change Core timing.
        public static Plan Select(DruidData d,bool moving,bool grabbed=false,string recoveryMove=null)
        {
            return Select(d,moving,grabbed,recoveryMove,true,-1);
        }
        // remodel=false: the web-phase boss without lives (old man alone, state_P3). collapseElapsed: Core ticks since BeginCollapse (Simulation.DruidLife(e).CollapseTicks counted up), -1 unknown.
        public static Plan Select(DruidData d,bool moving,bool grabbed,string recoveryMove,bool remodel,int collapseElapsed)
        {
            var plan=SelectAction(d,moving,grabbed,recoveryMove,remodel,collapseElapsed);
            plan.Life=Life(d,remodel);
            if(!plan.Transition)plan.Overlay=StateClip(plan.Life);
            return plan;
        }
        public static int Life(DruidData d,bool remodel){return !remodel||d==null?2:Math.Max(0,Math.Min(2,d.BossPhase));}
        // Core stunned the boss for IntroTicks at the BossIntro event; reveal the husk over exactly that window.
        public static Plan Intro(int elapsed)
        {
            var p=Phase("intro_reveal",IntroTicks,elapsed);p.Life=0;p.Transition=true;return p;
        }
        // Final kill: the existing sink schedule (NativeGame.SinkBodyTicks body ticks) carries the 150 f death_sink clip.
        public static Plan Death(int sinkAge,int bodyTicks)
        {
            var p=Phase("death_sink",bodyTicks,sinkAge);p.Life=2;p.Transition=true;return p;
        }
        static Plan SelectAction(DruidData d,bool moving,bool grabbed,string recoveryMove,bool remodel,int collapseElapsed)
        {
            if(d==null)return Phase("Idle",1,0,false,true);
            if(remodel&&d.S=="bossDruidRest"&&collapseElapsed>=0&&d.BossPhase<2)
            {   // d.St2 stays at CollapseTicks during the kneel (the life code counts its own timer), so the elapsed ticks come from the life state.
                var c=Phase(d.BossPhase==0?"phase12_collapse":"phase23_collapse",DruidRemodelData.CollapseTicks,collapseElapsed);c.Transition=true;return c;
            }
            double duration,elapsed;string name;int hit=Math.Max(1,Math.Min(3,d.SlashIdx+1));
            switch(d.S){
                case "idle":case "eWalk":case "eChase":case "eApproach":
                    name=moving||d.S!="idle"?"Walk":"Idle";return Phase(name,Frames(name),0,true);
                case "bossSlashWind":
                    duration=d.SlashIdx==0?Tele(d,0):DruidRemodelData.SlashLinkTele;
                    return Phase("slash"+hit+"_tele",duration,duration-d.St2);
                case "bossSlash":
                    duration=DruidRemodelData.SlashActive;elapsed=Clamp(duration-d.St2,duration);
                    var slash=Phase("slash"+hit+"_act",duration,elapsed);
                    double strike=Math.Max(1,duration-DruidRemodelData.SlashHitAt);
                    slash.Frame=elapsed<=strike?6*elapsed/strike:6+2*(elapsed-strike)/Math.Max(1,duration-strike);
                    return slash;
                case "bossSlamWind":duration=Tele(d,1);return Phase("slam_tele",duration,duration-d.St2);
                case "bossSlam":duration=DruidRemodelData.SlamActive;return Phase("slam_act",duration,duration-d.St2);
                case "bossChargeWind":duration=Tele(d,2);return Phase("charge_tele",duration,duration-d.St2);
                case "bossCharge":duration=DruidRemodelData.ChargeTicks;return Phase("charge_run",duration,duration-d.St2);
                case "bossShock":return Phase("charge_rec",20,20-d.St2);
                case "bossGrabWind":duration=Tele(d,5);return Phase("grab_tele",duration,duration-d.St2);
                case "bossGrabLunge":duration=DruidRemodelData.GrabLungeTicks;return Phase("grab_lunge",duration,duration-d.St2);
                case "bossGrab":duration=DruidRemodelData.GrabTicks;return Phase("grab_hold",duration,duration-d.St2);
                case "bossDruidDive":duration=d.DiveMax>0?d.DiveMax:Tele(d,6);return Phase("burrow_dive",duration,duration-d.St2);
                case "bossDruidUnder":return Phase("burrow_dive",1,1,false,true);
                case "bossDruidErupt":
                    elapsed=(d.EruptMax>0?d.EruptMax:DruidRemodelData.BurrowEruptWarn+DruidRemodelData.BurrowEruptPost)-d.St2;
                    if(!d.EruptHit&&elapsed<DruidRemodelData.BurrowEruptWarn)return Phase("burrow_erupt_warn",DruidRemodelData.BurrowEruptWarn,elapsed);
                    return Phase("burrow_erupt",DruidRemodelData.BurrowEruptPost,elapsed-DruidRemodelData.BurrowEruptWarn);
                case "bossRmWind":
                    if(d.RmMoveId!="groundFissure")break;
                    duration=Tele(d,3);return Phase("fissure_tele",duration,duration-d.St2);
                case "bossHeartWind":
                    duration=d.HbBeat==0?Tele(d,11):DruidRemodelData.HeartbeatBeatWind;
                    return Phase(d.HbBeat==0?"heart_tele":"heart_beat",duration,duration-d.St2);
                case "bossHeartPause":duration=DruidRemodelData.HeartbeatPause;return Phase("heart_pause",duration,duration-d.St2);
                case "recover":
                    if(d.RmMoveId=="grab")return Phase("grab_miss_rec",40,40-d.St2);
                    break;
                case "bossRec":
                    duration=40;
                    foreach(var move in DruidRemodelData.Moves)if(move.Id==d.RmMoveId)duration=move.Rec;
                    if(d.RmMoveId=="grab")duration=grabbed?DruidRemodelData.GrabHeldRecovery:DruidRemodelData.GrabMissRecovery;
                    if(d.RmBonusApplied)duration+=DruidRemodelData.ParryRecoveryBonus;
                    elapsed=duration-d.St2;
                    switch(recoveryMove??d.RmMoveId){
                        case "slashCombo":name="slash_rec";break;case "slam":name="slam_rec";break;case "charge":name="charge_rec";break;
                        case "grab":name=grabbed?"grab_throw":"grab_miss_rec";break;
                        case "burrowStrike":name="burrow_rec";break;case "heartbeat":name="heart_rec";break;
                        case "groundFissure":
                            // Core fires instantly and enters bossRec. Fit act+rec inside that same existing window.
                            if(elapsed<20)return Phase("fissure_act",20,elapsed);
                            return Phase("fissure_rec",Math.Max(1,duration-20),elapsed-20);
                        default:return Phase("Idle",1,0,false,true);
                    }
                    return Phase(name,duration,elapsed);
            }
            return Phase("Idle",1,0,false,true);
        }
        // B5 (arena RETOUCH 11-04): the chest-gap and lantern glow is a withered olive, not primary lime or amber. #b2b57c = RGB(178,181,124), HSV(63 deg, S .315, V .71) <= S .40. Was #d49a5c amber RGB(212,154,92), S .566.
        public const string GlowEmissionHex="#b2b57c",GlowPaletteHex="#7b7d52";
        public static string Palette(string name)
        {
            switch(name)
            {
                case "druid_bone":case "staff_bone":return "#b9ad90";
                case "druid_bark":case "staff_bark":return "#4a3826";
                case "druid_husk_bark":return "#2a2018";   // v9.1 GLB base colour of the husk bark (no texture); darker than the old man's bark
                case "druid_feather":return "#1c2024";
                case "druid_hair":return "#2a2624";
                case "druid_beard":return "#8f8a82";
                case "druid_glow":case "lantern_orb":return GlowPaletteHex;
                case "druid_moss":return "#36421f";
                case "staff_leather":return "#2e231b";
                case "front_panel_cloth":return "#26211d";
                default:return null;
            }
        }
        // Geometric limits skip this frame; actual rendering failures retain the old 2D safety net.
        public enum FrameIssue { NearPlane,CanvasSize,RenderException,RenderTextureCreation }
        public static bool RequiresLegacyFallback(FrameIssue issue)
        {
            return issue!=FrameIssue.NearPlane&&issue!=FrameIssue.CanvasSize;
        }
        // View-only bounds eligibility. Distance is squared world distance from the Core foot anchor.
        public static bool BoundsBone(bool weighted,double distanceSquared,double bodyHeight)
        {
            return weighted&&!double.IsNaN(distanceSquared)&&!double.IsInfinity(distanceSquared)&&distanceSquared>=0
                &&!double.IsNaN(bodyHeight)&&!double.IsInfinity(bodyHeight)&&bodyHeight>0&&distanceSquared<=4*bodyHeight*bodyHeight;
        }
        // Intersect an actual box edge with the camera near plane in positive-forward camera space.
        // Front vertices are projected separately. Fully hidden/coplanar edges contribute no point.
        public static bool ClipNearPlaneEdge(double ax,double ay,double az,double bx,double by,double bz,double near,out double x,out double y,out double z)
        {
            x=y=z=0;
            if(double.IsNaN(ax)||double.IsInfinity(ax)||double.IsNaN(ay)||double.IsInfinity(ay)||double.IsNaN(az)||double.IsInfinity(az)
                ||double.IsNaN(bx)||double.IsInfinity(bx)||double.IsNaN(by)||double.IsInfinity(by)||double.IsNaN(bz)||double.IsInfinity(bz)
                ||double.IsNaN(near)||double.IsInfinity(near)||near<=0||az==bz||(az>near)==(bz>near))return false;
            double t=(near-az)/(bz-az);x=ax+(bx-ax)*t;y=ay+(by-ay)*t;z=near;return true;
        }
        // Receipt/test helper: displayed body height as a multiple of the real hero idle height (design: P1 2.805, P2 2.374; Core footprint rule gives 1.95/1.65).
        public static float HeroRatio(float bodyHeightWorld,float heroIdleWorld){return heroIdleWorld>0?bodyHeightWorld/heroIdleWorld:0;}
    }
}
