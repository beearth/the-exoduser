using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static bool BossArenaReviewRequested
        {
            get
            {
                return Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-boss-arena-review")>=0;
            }
        }
        // Edge-hit step (PREP 10.1, extended to every life 11-04): with --unity-boss-arena-edge[=1,2,3] (lives, 1-based, default all three; --unity-boss-arena-p3-edge = life 3 only) the bot, once the boss is on a requested life,
        // stands with its body circle touching the boss body circle edge, attacks the boss centre, and every Core hit on the boss from within the edge band queues the shot edge-p<life>-hit-1..3 plus an "edge-hit" event in moves.jsonl.
        static readonly bool[] ArenaEdgeLives=NativeArenaReviewPolicy.EdgeLives(Environment.GetCommandLineArgs());
        static bool ArenaEdgeLife(int life){return life>=0&&life<ArenaEdgeLives.Length&&ArenaEdgeLives[life];}
        const float ArenaEdgeGapPx=4,ArenaEdgeBandPx=40;
        readonly int[] arenaEdgeShots=new int[3];int arenaEdgeLastTick=-1000,arenaEdgeHp=-1,arenaEdgeLife=-1;
        [Serializable] sealed class ArenaEdgeEvent {public string kind="edge-hit";public int life,tick,hpBefore,hpAfter;public float bossRadiusPx,playerRadiusPx,centreDistancePx,gapPx,bossX,bossY,playerX,playerY;}
        // Continuous-frame QA capture (--unity-boss-arena-seq, needs --unity-boss-arena-review): arena-review/seq-<name>/f<frame>.png (half resolution, 960 wide, one bilinear blit) + frames.jsonl.
        // collapse = P2->P3 kneel -10..+30 frames (max 360); erupt-1..3 = burrowStrike erupt hit tick -20..+40 ticks; contact = P1 body-band contact, 600 frames, bot input only. Absent = the old path, byte for byte.
        static readonly bool ArenaSeqOn=NativeArenaReviewPolicy.SeqRequested(Environment.GetCommandLineArgs());
        const int ArenaSeqWidth=960,ArenaSeqRing=24;
        [Serializable] sealed class ArenaSeqExtra
        {
            public string seq,separationScope="approx: outward centre-distance gain on a tick whose input pointed at the boss (Core RemodelSeparatePlayer is private); 0 while rolling/dashing",contactStep="";
            public int seqIndex;
            public float meanY;
            public bool rolling,dashing;
            public float shellScale,oldManScale,bossScreenHeightPx,pillarCentreDistancePx,pillarRadiusPx,bossRadiusPx,gapPx,playerX,playerY,moveDx,moveDy,separationApproxPx,centreDistancePx;
        }
        sealed class ArenaSeqSlot {public Color32[] pixels;public int width,height,frame,tick;public string baseJson;public ArenaSeqExtra extra;}
        readonly List<ArenaSeqSlot> arenaSeqRing=new List<ArenaSeqSlot>();
        readonly Stack<Color32[]> arenaSeqPool=new Stack<Color32[]>();
        readonly Dictionary<string,int> arenaSeqCount=new Dictionary<string,int>();
        RenderTexture arenaSeqRT;Texture2D arenaSeqRead,arenaSeqEncode;
        int arenaSeqCollapse,arenaSeqCollapseTail=-1,arenaSeqEruptCount,arenaSeqEruptTick=int.MinValue,arenaSeqContactStart=-1,arenaSeqContactTick;
        bool arenaSeqEruptFlush,arenaSeqPrevSet,arenaSeqInputToward;string arenaSeqEruptName="";
        float arenaSeqPrevX,arenaSeqPrevY,arenaSeqPrevCentre,arenaSeqMoveDx,arenaSeqMoveDy,arenaSeqPush,arenaSeqCentre;
        NativeArenaReviewPolicy.ContactStep arenaSeqStep;
        ArenaSeqExtra arenaSeqExtra;
        // B8 / retouch cuts: entry-exit windows (bossless), pure-black measurement, bullet-cut, far-enemy-cut.
        readonly NativeArenaReviewPolicy.EntryExitWindow arenaSeqWindow=new NativeArenaReviewPolicy.EntryExitWindow();
        readonly NativeArenaReviewPolicy.BlackRun arenaSeqBlack=new NativeArenaReviewPolicy.BlackRun();
        bool arenaSeqEntry,arenaSeqExit,arenaSeqBulletCut,arenaSeqFarCut,arenaSeqEnemySeen,arenaSeqFlushExit;int arenaSeqEntryFrames,arenaSeqExitFrames;
        bool arenaReviewMetricsOnly;
        string arenaReviewOutput;
        readonly StringBuilder arenaReviewTrace=new StringBuilder();
        readonly StringBuilder arenaReviewEvents=new StringBuilder();
        readonly HashSet<string> arenaReviewSeen=new HashSet<string>();
        readonly HashSet<string> arenaReviewWarn=new HashSet<string>();
        readonly List<DruidTelegraph> arenaReviewTele=new List<DruidTelegraph>();
        readonly Dictionary<string,DruidTelegraph> arenaReviewBoundaries=new Dictionary<string,DruidTelegraph>();
        readonly List<string> arenaReviewShots=new List<string>();
        Camera arenaReviewHeroCamera;
        RenderTexture arenaReviewHeroRT;
        Texture2D arenaReviewHeroRead;
        string arenaReviewPreviousState="",arenaReviewWindow="";
        int arenaReviewBeat,arenaReviewFissure,arenaReviewTick=-1;
        bool arenaReviewErupt,arenaReviewArena,arenaReviewMode,arenaReviewSink,arenaReviewLastCapture;
        float arenaReviewUntil;
        EnemyState arenaReviewBoss;
        EnemyState arenaCoverageBoss;
        NativeArenaReviewPolicy.LifeCoverageTracker arenaReviewCoverage;
        NativeArenaReviewPolicy.InputStep arenaReviewInputStep;
        ArenaReviewFrame arenaReviewFrame;
        [Serializable] sealed class ArenaReviewFrame
        {
            public int frame,tick,width,height,loadPhase,faded,nearestDraws,meshBuilds;
            public bool arena,arena3d,sink,capture,previousFrameCapture;
            public string window,state,moveId,heroSprite,heroMeasureScope;
            public Vector3 position,rotation,marker,heroScale;
            public Quaternion quaternion;
            public float heroGpuSilhouetteHeightFraction,heroGpuSilhouetteHeightPx,heroModelRestWorldHeight,fieldOfView,distanceToMarker,desiredDistance,heroProjectedBoundsHeightPx,heroProjectedHeightFraction,bossOpaqueHeightPx,bossHeroRatio,deltaMs,prepareCpuMs;
            public Rect heroSourceAlphaRect,bossSourceAlphaRect;
            public NativeDruidRigPixelView.Frame bossRig;
            public Arena8bLighting lighting;public NativeArena3DView.SurfaceReceipt surface;
        }
        [Serializable] sealed class ArenaReviewEvent
        {
            public string kind,moveId,state,proof;
            public int tick,frame,serial,index,phase;
            public double remaining;
            public ArenaReviewBoundary boundary;
        }
        [Serializable] sealed class ArenaReviewCircle {public double x,y,r;}
        [Serializable] sealed class ArenaReviewBoundary {
            public DruidTelegraph geometry;public ArenaReviewCircle[] safe,shadows;
            static ArenaReviewCircle[] Circles(double[][] rows){if(rows==null)return null;var result=new List<ArenaReviewCircle>();foreach(var row in rows)if(row!=null&&row.Length>=3)result.Add(new ArenaReviewCircle{x=row[0],y=row[1],r=row[2]});return result.ToArray();}
            public ArenaReviewBoundary(DruidTelegraph value){geometry=value;safe=Circles(value.Safe);shadows=Circles(value.Shadows);}
        }
        [Serializable] class ArenaReviewResult
        {
            public string result,buildGuid,sandbox,scope,timingScope;
            public bool metricsOnly,coverageTimeout;
            public int width,height;
            public string[] captured,missing,missingScreenshots;
            public NativeArenaReviewPolicy.CoverageLife[] coverage;
        }
        // Only written with --unity-boss-arena-seq: review.json keeps its old shape without it.
        [Serializable] sealed class ArenaReviewSeqResult:ArenaReviewResult
        {
            public string farEnemyCut,bulletCut;
            public int entryFrames,exitFrames,entryBlackFramesLongest;
            public float entryBlackSecondsLongest,entryBlackSecondsTotal;
            public bool entryBlackWithinHalfSecond;
        }
        void BossArenaReviewBegin(string output)
        {
            if(!BossArenaReviewRequested)return;
            if(!NativeQaSandbox.Active)throw new InvalidOperationException("Arena review requires isolated QA sandbox");
            arenaReviewOutput=Path.Combine(output,"arena-review");
            Directory.CreateDirectory(arenaReviewOutput);
            if((File.GetAttributes(arenaReviewOutput)&FileAttributes.ReparsePoint)!=0)throw new IOException("Arena review output cannot be a link");
            foreach(var file in Directory.GetFiles(arenaReviewOutput)){var name=Path.GetFileName(file);bool owned=name.StartsWith("move-",StringComparison.Ordinal)||name.StartsWith("transition-",StringComparison.Ordinal)||name=="camera-frames.jsonl"||name=="moves.jsonl"||name=="review.json"||name=="bullet-cut.png"||name=="bullet-cut.json"||name=="far-enemy-cut.png"||name=="far-enemy-cut.json"||name=="druid-rigpixel.json"||name=="druid-rigpixel-rt.png"||name.StartsWith("material-field-reference.",StringComparison.Ordinal)||name.StartsWith("material-arena-reference.",StringComparison.Ordinal)||name=="material-comparison.html";if(owned&&(name.EndsWith(".png",StringComparison.Ordinal)||name.EndsWith(".json",StringComparison.Ordinal)||name.EndsWith(".jsonl",StringComparison.Ordinal)||name=="material-comparison.html")){if((File.GetAttributes(file)&FileAttributes.ReparsePoint)!=0)throw new IOException("Arena review file cannot be a link");File.Delete(file);}}
            if(ArenaSeqOn)foreach(var dir in Directory.GetDirectories(arenaReviewOutput))
            {
                if(!Path.GetFileName(dir).StartsWith("seq-",StringComparison.Ordinal))continue;
                if((File.GetAttributes(dir)&FileAttributes.ReparsePoint)!=0)throw new IOException("Arena review seq folder cannot be a link");
                Directory.Delete(dir,true);
            }
            arenaReviewMetricsOnly=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-boss-arena-metrics-only")>=0;
            StartCoroutine(BossArenaReviewFrames());
            Debug.Log("ARENA_REVIEW fixed resolution; input-only coverage; capture frames excluded from clean timing; sandbox="+NativeQaSandbox.Root);
        }
        void BossArenaReviewWindow(string name)
        {
            arenaReviewWindow=name;
            arenaReviewUntil=Time.unscaledTime+.6f;
            arenaReviewEvents.AppendLine(JsonUtility.ToJson(new ArenaReviewEvent
            {
                kind="transition",proof=name,tick=Simulation.TickCount,frame=Time.frameCount
            }
            ));
        }
        void BossArenaReviewTick()
        {
            if(arenaReviewOutput==null||Simulation==null||arenaReviewTick==Simulation.TickCount)return;
            arenaReviewTick=Simulation.TickCount;
            var druid=Simulation.Druid;
            var boss=druid==null?null:druid.Boss;
            DruidData d;
            if(boss==null||!druid.Data.TryGetValue(boss,out d))return;
            if(boss!=arenaReviewBoss)
            {
                arenaReviewBoss=boss;
                arenaReviewPreviousState="";
                arenaReviewBeat=0;
                arenaReviewErupt=false;
                arenaReviewFissure=0;
            }
            Simulation.DruidTelegraphs(arenaReviewTele);
            if(ArenaSeqOn&&!arenaSeqBulletCut&&!arenaReviewMetricsOnly)
            {   // bullet-cut: first tick a boss warning / live hazard points at the hero (1920 PNG + JSON through the normal shot path)
                var hero=Simulation.Player;
                foreach(var t in arenaReviewTele)if(NativeArenaReviewPolicy.TeleTowardHero(t,hero.X,hero.Y,hero.Radius)){arenaSeqBulletCut=true;QueueArenaReviewShot("bullet-cut");break;}
            }
            int fissure=arenaReviewFissure;
            foreach(var t in arenaReviewTele)
            {
                if(t.MoveId=="groundFissure"&&t.Live)fissure=Math.Max(fissure,t.Serial);
                if(!t.Live&&t.Remaining>0)
                {
                    arenaReviewBoundaries[t.MoveId]=t;
                    string key=t.MoveId+":"+t.Serial+":"+t.Index;
                    if(!arenaReviewSeen.Contains(t.MoveId)&&(arenaReviewWarn.Add(key)||t.Remaining<=3))QueueArenaReviewShot("move-"+t.MoveId+"-warning");
                }
            }
            string id=NativeArenaReviewPolicy.Activation(d.S,d.St2,arenaReviewPreviousState,d.HbBeat,arenaReviewBeat,d.EruptHit,arenaReviewErupt,fissure,arenaReviewFissure);
            if(id!=null)
            {
                DruidTelegraph boundary;
                arenaReviewBoundaries.TryGetValue(id,out boundary);
                arenaReviewEvents.AppendLine(JsonUtility.ToJson(new ArenaReviewEvent
                {
                    kind="actual-activation",moveId=id,state=d.S,tick=Simulation.TickCount,frame=Time.frameCount,serial=druid.TeleSerial,index=d.SlashIdx,phase=d.BossPhase,remaining=d.St2,boundary=boundary==null?null:new ArenaReviewBoundary(boundary),proof="executor state edge / hit timer / live hazard / pulse increment; no Core writes"
                }
                ));
                if(arenaReviewSeen.Add(id))QueueArenaReviewShot("move-"+id+"-active");
            }
            // All warning geometries are kept, including the last boundary before actual activation.
            foreach(var t in arenaReviewTele)arenaReviewEvents.AppendLine(JsonUtility.ToJson(new ArenaReviewEvent
            {
                kind=t.Live?"live-boundary":"telegraph-boundary",moveId=t.MoveId,state=d.S,tick=Simulation.TickCount,frame=Time.frameCount,serial=t.Serial,index=t.Index,phase=d.BossPhase,boundary=new ArenaReviewBoundary(t)
            }
            ));
            var coverage=BossArenaReviewCoverage(boss);
            coverage.Observe(d.BossPhase,Simulation.TickCount,id);
            bool coverageWaiting=coverage.Waiting(d.BossPhase,Simulation.TickCount);
            if(arenaReviewInputStep==NativeArenaReviewPolicy.InputStep.Edge&&ArenaEdgeLife(d.BossPhase)&&arenaEdgeShots[d.BossPhase]<3)
            {
                var pl=Simulation.Player;var life=Simulation.DruidLife(boss);
                if(arenaEdgeLife!=d.BossPhase){arenaEdgeLife=d.BossPhase;arenaEdgeHp=-1;}
                if(arenaEdgeHp>=0&&boss.Hp<arenaEdgeHp&&(life==null||!life.Collapsing)&&Simulation.TickCount-arenaEdgeLastTick>=60)
                {
                    float dist=Mathf.Sqrt((pl.X-boss.X)*(pl.X-boss.X)+(pl.Y-boss.Y)*(pl.Y-boss.Y));
                    if(dist<=boss.Radius+pl.Radius+ArenaEdgeBandPx)
                    {
                        arenaEdgeShots[d.BossPhase]++;arenaEdgeLastTick=Simulation.TickCount;
                        arenaReviewEvents.AppendLine(JsonUtility.ToJson(new ArenaEdgeEvent{life=d.BossPhase+1,tick=Simulation.TickCount,hpBefore=arenaEdgeHp,hpAfter=boss.Hp,bossRadiusPx=boss.Radius,playerRadiusPx=pl.Radius,centreDistancePx=dist,gapPx=dist-boss.Radius-pl.Radius,bossX=boss.X,bossY=boss.Y,playerX=pl.X,playerY=pl.Y}));
                        QueueArenaReviewShot("edge-p"+(d.BossPhase+1)+"-hit-"+arenaEdgeShots[d.BossPhase]);
                    }
                }
                arenaEdgeHp=boss.Hp;
            }
            else arenaEdgeHp=-1; // seq / residual damage during coverage is not an edge-stage hit
            if(ArenaSeqOn)ArenaSeqTick(boss,d,id,coverageWaiting);
            arenaReviewPreviousState=d.S;
            arenaReviewBeat=d.HbBeat;
            arenaReviewErupt=d.EruptHit;
            arenaReviewFissure=fissure;
        }
        // ---- --unity-boss-arena-seq: read-only observation of Core state + input-only bot (contact). No Core writes. ----
        void ArenaSeqTick(EnemyState boss,DruidData d,string activation,bool coverageWaiting)
        {
            var s=Simulation;var pl=s.Player;
            float cx=pl.X-boss.X,cy=pl.Y-boss.Y,centre=Mathf.Sqrt(cx*cx+cy*cy);
            if(arenaSeqPrevSet)
            {
                arenaSeqMoveDx=pl.X-arenaSeqPrevX;arenaSeqMoveDy=pl.Y-arenaSeqPrevY;
                arenaSeqPush=arenaSeqInputToward&&!s.RollActive&&!s.DashActive&&centre>arenaSeqPrevCentre?centre-arenaSeqPrevCentre:0;
            }
            arenaSeqPrevX=pl.X;arenaSeqPrevY=pl.Y;arenaSeqPrevCentre=centre;arenaSeqCentre=centre;arenaSeqPrevSet=true;
            if(activation=="burrowStrike"&&arenaSeqEruptCount<NativeArenaReviewPolicy.SeqEruptMax)
            {
                arenaSeqEruptCount++;arenaSeqEruptTick=s.TickCount;arenaSeqEruptFlush=true;arenaSeqEruptName="erupt-"+arenaSeqEruptCount;
            }
            if(!coverageWaiting&&d.BossPhase==0&&arenaSeqContactStart==-1&&centre<=boss.Radius+pl.Radius+40)
            {
                arenaSeqContactStart=Time.frameCount;arenaSeqContactTick=s.TickCount;
            }
        }
        // Decides, for this rendered frame, which seq folders get it and whether it must also be kept in the pre-roll ring.
        bool arenaSeqFlushCollapse;
        void ArenaSeqPlan(ArenaReviewFrame row,out List<string> names,out bool buffer)
        {
            names=new List<string>();buffer=false;
            var s=Simulation;
            if(s!=null)
            {   // entry/exit windows do not need a boss (the field fade-out runs before the arena exists)
                bool inEntry,inExit;arenaSeqWindow.Step(s.Stage.LoadPhase,s.Stage.InArena,out inEntry,out inExit);
                arenaSeqEntry=inEntry;arenaSeqExit=inExit;
                if(inEntry)names.Add("entry");
                if(inExit){if(arenaSeqExitFrames==0)arenaSeqFlushExit=true;names.Add("exit");}
                else if(s.Stage.InArena&&s.Stage.StageCleared)buffer=true;   // exit pre-roll ring (24 frames) once the arena is cleared
                if(names.Count>0||buffer)arenaSeqExtra=new ArenaSeqExtra();
            }
            if(s==null||s.Druid==null)return;
            var boss=s.Druid.Boss;DruidData d;
            if(boss==null||!s.Druid.Data.TryGetValue(boss,out d))return;
            var pl=s.Player;var life=s.DruidLife(boss);
            var ex=new ArenaSeqExtra();
            var rig=row.bossRig;
            if(rig!=null){ex.shellScale=rig.rootScale;ex.oldManScale=rig.oldManFactor;ex.bossScreenHeightPx=rig.projectedBoundsHeightPx;}
            ex.bossRadiusPx=boss.Radius;
            double nearest=double.MaxValue,nearR=0;
            foreach(var pillar in s.DruidPillars){double ddx=pillar.X-boss.X,ddy=pillar.Y-boss.Y,dd=Math.Sqrt(ddx*ddx+ddy*ddy);if(dd<nearest){nearest=dd;nearR=pillar.R;}}
            if(nearest<double.MaxValue){ex.pillarCentreDistancePx=(float)nearest;ex.pillarRadiusPx=(float)nearR;ex.gapPx=(float)(nearest-nearR-boss.Radius);}
            ex.playerX=pl.X;ex.playerY=pl.Y;ex.moveDx=arenaSeqMoveDx;ex.moveDy=arenaSeqMoveDy;ex.separationApproxPx=arenaSeqPush;ex.centreDistancePx=arenaSeqCentre;
            ex.rolling=s.RollActive;ex.dashing=s.DashActive;ex.contactStep=arenaSeqContactStart>=0?arenaSeqStep.ToString():"";
            arenaSeqExtra=ex;
            // collapse: P2->P3 kneel
            bool col=life!=null&&life.Collapsing&&d.BossPhase==1;
            int collapseCount;arenaSeqCount.TryGetValue("collapse",out collapseCount);
            if(arenaSeqCollapse==0)
            {
                if(col){arenaSeqCollapse=1;arenaSeqFlushCollapse=true;names.Add("collapse");}
                else if(d.BossPhase==1&&boss.Hp*100<=boss.MaxHp*40)buffer=true;   // pre-roll only while the life is low; keeps the per-frame screenshot cost off the rest of the fight
            }
            else if(arenaSeqCollapse==1)
            {
                if(collapseCount>=NativeArenaReviewPolicy.SeqCollapseMax)arenaSeqCollapse=2;
                else
                {
                    names.Add("collapse");
                    if(!col)
                    {
                        if(arenaSeqCollapseTail<0)arenaSeqCollapseTail=NativeArenaReviewPolicy.SeqCollapsePost;
                        if(--arenaSeqCollapseTail<=0)arenaSeqCollapse=2;
                    }
                }
            }
            // erupt: hit tick -20 .. +40
            if(arenaSeqEruptTick!=int.MinValue)
            {
                if(s.TickCount<=arenaSeqEruptTick+NativeArenaReviewPolicy.SeqEruptPostTicks)names.Add(arenaSeqEruptName);
                else arenaSeqEruptTick=int.MinValue;
            }
            if(arenaSeqEruptCount<NativeArenaReviewPolicy.SeqEruptMax&&(d.S=="bossDruidDive"||d.S=="bossDruidUnder"||d.S=="bossDruidErupt"))buffer=true;
            // contact: P1 body band, 600 frames
            if(arenaSeqContactStart>=0)
            {
                if(Time.frameCount-arenaSeqContactStart<NativeArenaReviewPolicy.SeqContactFrames)names.Add("contact");
                else arenaSeqContactStart=-2;
            }
        }
        void ArenaSeqWriteFrame(string name,Color32[] pixels,int width,int height,int frame,string baseJson,ArenaSeqExtra extra)
        {
            var dir=Path.Combine(arenaReviewOutput,"seq-"+name);
            Directory.CreateDirectory(dir);
            int n;arenaSeqCount.TryGetValue(name,out n);arenaSeqCount[name]=n+1;
            if(arenaSeqEncode==null||arenaSeqEncode.width!=width||arenaSeqEncode.height!=height){if(arenaSeqEncode!=null)Destroy(arenaSeqEncode);arenaSeqEncode=new Texture2D(width,height,TextureFormat.RGBA32,false);}
            arenaSeqEncode.SetPixels32(pixels);arenaSeqEncode.Apply(false);
            File.WriteAllBytes(Path.Combine(dir,"f"+frame.ToString("000000")+".png"),arenaSeqEncode.EncodeToPNG());
            extra.seq=name;extra.seqIndex=n;
            string add=JsonUtility.ToJson(extra);
            File.AppendAllText(Path.Combine(dir,"frames.jsonl"),baseJson.Substring(0,baseJson.Length-1)+","+add.Substring(1)+"\n");
        }
        void ArenaSeqEmit(Texture2D image,ArenaReviewFrame row,List<string> names,bool buffer)
        {
            int w=Mathf.Min(ArenaSeqWidth,image.width),h=Mathf.Max(1,Mathf.RoundToInt(image.height*(w/(float)image.width)));
            if(arenaSeqRT==null||arenaSeqRT.width!=w||arenaSeqRT.height!=h)
            {
                if(arenaSeqRT!=null){arenaSeqRT.Release();Destroy(arenaSeqRT);}
                arenaSeqRT=new RenderTexture(w,h,0,RenderTextureFormat.ARGB32);arenaSeqRT.Create();
                if(arenaSeqRead!=null)Destroy(arenaSeqRead);
                arenaSeqRead=new Texture2D(w,h,TextureFormat.RGBA32,false);
            }
            image.filterMode=FilterMode.Bilinear;
            Graphics.Blit(image,arenaSeqRT);   // the one bilinear downscale; nothing else is added to the pixels
            var old=RenderTexture.active;
            Color32[] pixels;
            try{RenderTexture.active=arenaSeqRT;arenaSeqRead.ReadPixels(new Rect(0,0,w,h),0,0);arenaSeqRead.Apply(false);pixels=arenaSeqPool.Count>0?arenaSeqPool.Pop():new Color32[w*h];if(pixels.Length!=w*h)pixels=new Color32[w*h];var raw=arenaSeqRead.GetPixels32();Array.Copy(raw,pixels,pixels.Length);}
            finally{RenderTexture.active=old;}
            string baseJson=JsonUtility.ToJson(row);
            var ex=arenaSeqExtra;
            if(ex!=null&&(names.Contains("entry")||names.Contains("exit")))
            {   // B8: pure-black measurement on the written 960-wide frames
                double sum=0;for(int i=0;i<pixels.Length;i++)sum+=NativeArenaReviewPolicy.LumaY(pixels[i].r,pixels[i].g,pixels[i].b);
                ex.meanY=(float)(sum/Math.Max(1,pixels.Length));
                if(names.Contains("entry")){arenaSeqEntryFrames++;arenaSeqBlack.Add(ex.meanY,Time.unscaledDeltaTime);}
                if(names.Contains("exit"))arenaSeqExitFrames++;
            }
            if(arenaSeqFlushExit)
            {
                arenaSeqFlushExit=false;
                foreach(var o in arenaSeqRing)if(o.frame>=row.frame-ArenaSeqRing)ArenaSeqWriteFrame("exit",o.pixels,o.width,o.height,o.frame,o.baseJson,o.extra);
            }
            if(arenaSeqFlushCollapse)
            {
                arenaSeqFlushCollapse=false;
                foreach(var o in arenaSeqRing)if(o.frame>=row.frame-NativeArenaReviewPolicy.SeqCollapsePre)ArenaSeqWriteFrame("collapse",o.pixels,o.width,o.height,o.frame,o.baseJson,o.extra);
            }
            if(arenaSeqEruptFlush)
            {
                arenaSeqEruptFlush=false;
                foreach(var o in arenaSeqRing)if(o.tick>=arenaSeqEruptTick-NativeArenaReviewPolicy.SeqEruptPreTicks)ArenaSeqWriteFrame(arenaSeqEruptName,o.pixels,o.width,o.height,o.frame,o.baseJson,o.extra);
            }
            if(ex!=null)foreach(var name in names)ArenaSeqWriteFrame(name,pixels,w,h,row.frame,baseJson,ex);
            if(buffer&&ex!=null)
            {
                arenaSeqRing.Add(new ArenaSeqSlot{pixels=pixels,width=w,height=h,frame=row.frame,tick=row.tick,baseJson=baseJson,extra=ex});
                while(arenaSeqRing.Count>ArenaSeqRing){arenaSeqPool.Push(arenaSeqRing[0].pixels);arenaSeqRing.RemoveAt(0);}
            }
            else arenaSeqPool.Push(pixels);
            arenaSeqExtra=null;
        }
        void QueueArenaReviewShot(string name)
        {
            if(!arenaReviewShots.Contains(name))arenaReviewShots.Add(name);
        }
        void BossArenaReviewLate()
        {
            if(arenaReviewOutput==null||Simulation==null)return;
            var s=Simulation;
            var boss=s.Druid!=null?s.Druid.Boss:s.Stage.Boss;
            bool sink=boss!=null&&BossSinkVisible(boss);
            bool arena=s.Stage.InArena,mode=NativeRemodel3D.ArenaActive;
            if(arena!=arenaReviewArena)BossArenaReviewWindow(arena?"entry-load":"exit");
            if(mode!=arenaReviewMode)BossArenaReviewWindow(mode?"entry-visible":"exit-visible");
            if(sink!=arenaReviewSink)BossArenaReviewWindow(sink?"sink-start":"sink-end");
            arenaReviewArena=arena;
            arenaReviewMode=mode;
            arenaReviewSink=sink;
            var camera=HudCamera;
            if(camera==null)return;
            if(ArenaSeqOn&&!arenaReviewMetricsOnly&&arena&&s.Stage.LoadPhase==0)
            {   // far-enemy-cut: first frame a non-boss enemy stands in the top third of the screen
                foreach(var enemy in s.Enemies)
                {
                    if(!enemy.Alive||enemy.IsBoss)continue;
                    arenaSeqEnemySeen=true;
                    if(arenaSeqFarCut)break;
                    var sp=camera.WorldToScreenPoint(Point(enemy.X,enemy.Y));
                    if(NativeArenaReviewPolicy.InTopThird(sp.y,sp.z,Screen.height)){arenaSeqFarCut=true;QueueArenaReviewShot("far-enemy-cut");break;}
                }
            }
            Rect heroRect,bossRect;
            float hh=NativeArenaActorMetrics.HeightPixels(playerView,camera,out heroRect),bh=NativeArenaActorMetrics.HeightPixels(druidBody==null?null:druidBody.Renderer,camera,out bossRect);
            if(heroView!=null&&heroView.Ready&&!playerView.enabled)hh=NativeArenaActorMetrics.ModelHeightPixels(heroView.Model,camera,out heroRect);
            DruidData d=null;
            if(s.Druid!=null&&boss!=null)s.Druid.Data.TryGetValue(boss,out d);
            bool window=Time.unscaledTime<arenaReviewUntil;
            arenaReviewFrame=new ArenaReviewFrame
            {
                frame=Time.frameCount,tick=s.TickCount,width=Screen.width,height=Screen.height,loadPhase=s.Stage.LoadPhase,arena=arena,arena3d=mode,sink=sink,window=window?arenaReviewWindow:"",state=d==null?"":d.S,moveId=d==null?"":d.RmMoveId,heroSprite=playerView.sprite==null?"":playerView.sprite.texture.name+":"+playerView.sprite.rect,position=camera.transform.position,rotation=camera.transform.eulerAngles,quaternion=camera.transform.rotation,marker=r3Marker==null?Vector3.zero:r3Marker.position,fieldOfView=camera.fieldOfView,distanceToMarker=r3Marker==null?0:Vector3.Distance(camera.transform.position,r3Marker.position),desiredDistance=r3ArenaCamera.Distance,heroScale=playerView.transform.lossyScale,heroModelRestWorldHeight=NativeArenaActorMetrics.HeroModelWorld,heroMeasureScope=playerView.enabled?"source alpha rectangle, includes weapon/occluded pixels":"3D renderer bounds projection; capture JSON additionally has isolated GPU colored silhouette",heroProjectedBoundsHeightPx=hh,heroProjectedHeightFraction=hh/Screen.height,bossOpaqueHeightPx=bh,bossHeroRatio=hh>0?bh/hh:0,heroSourceAlphaRect=heroRect,bossSourceAlphaRect=bossRect,deltaMs=Time.unscaledDeltaTime*1000,prepareCpuMs=r3Arena==null?0:r3Arena.PrepareMs,meshBuilds=r3Arena==null?0:r3Arena.MeshBuilds,faded=r3Arena==null?0:r3Arena.Faded,nearestDraws=r3Arena==null?0:r3Arena.NearestDraws,previousFrameCapture=arenaReviewLastCapture
            };
            BossArenaMaterialLate();
            if(window&&!arenaReviewMetricsOnly)QueueArenaReviewShot("transition-"+arenaReviewWindow+"-f"+Time.frameCount.ToString("000000"));
        }
        IEnumerator BossArenaReviewFrames()
        {
            while(arenaReviewOutput!=null)
            {
                yield return new WaitForEndOfFrame();
                var row=arenaReviewFrame;
                if(row==null||row.frame!=Time.frameCount)continue;
                row.bossRig=druidRig==null?null:druidRig.CaptureFrame();
                if(row.bossRig!=null&&row.bossRig.ready){row.bossOpaqueHeightPx=-1;row.bossHeroRatio=-1;} // Legacy sprite metrics are not the new rig body.
                bool shots=arenaReviewShots.Count>0&&!arenaReviewMetricsOnly;
                List<string> seqNames=null;bool seqBuffer=false;
                if(ArenaSeqOn&&!arenaReviewMetricsOnly)ArenaSeqPlan(row,out seqNames,out seqBuffer);
                bool seq=seqNames!=null&&seqNames.Count>0||seqBuffer;
                bool capture=shots||seq;
                row.capture=capture;
                if(shots)
                {
                    if(row.bossRig!=null&&row.bossRig.ready)row.bossRig.rawAlphaHeightPx=druidRig.CaptureRawRt(Path.Combine(arenaReviewOutput,"druid-rigpixel-rt.png"));
                    row.lighting=BossArenaCaptureLighting();row.surface=r3Arena==null?null:r3Arena.CaptureSurface();
                    row.heroGpuSilhouetteHeightPx=BossArenaReviewHeroPixels();
                    row.heroGpuSilhouetteHeightFraction=row.heroGpuSilhouetteHeightPx>0?row.heroGpuSilhouetteHeightPx/row.height:0;
                }
                if(capture)
                {
                    fullRunCaptureActivity="arena-review";
                    fullRunLastCaptureActivity="arena-review";
                    fullRunLastCaptureFrame=Time.frameCount;
                    var image=ScreenCapture.CaptureScreenshotAsTexture();
                    try
                    {
                        if(shots)
                        {
                            var bytes=image.EncodeToPNG();
                            foreach(var name in arenaReviewShots)
                            {
                                File.WriteAllBytes(Path.Combine(arenaReviewOutput,name+".png"),bytes);
                                File.WriteAllText(Path.Combine(arenaReviewOutput,name+".json"),JsonUtility.ToJson(row,true));
                                if(name.EndsWith("-active",StringComparison.Ordinal)&&arenaReviewHeroRead!=null)File.WriteAllBytes(Path.Combine(arenaReviewOutput,name+"-hero-isolated.png"),arenaReviewHeroRead.EncodeToPNG());
                            }
                        }
                        if(seq)ArenaSeqEmit(image,row,seqNames,seqBuffer);
                    }
                    finally
                    {
                        Destroy(image);
                        fullRunCaptureActivity="";
                    }
                }
                arenaReviewShots.Clear();
                arenaReviewLastCapture=capture;
                arenaReviewTrace.AppendLine(JsonUtility.ToJson(row));
            }
        }
        float BossArenaReviewHeroPixels()
        {
            if(heroView==null||!heroView.Ready||playerView.enabled)return -1;
            if(arenaReviewHeroCamera==null)
            {
                var go=new GameObject("QA isolated hero measurement");
                go.transform.SetParent(transform,false);
                arenaReviewHeroCamera=go.AddComponent<Camera>();
                arenaReviewHeroCamera.enabled=false;
                var data=go.AddComponent<UniversalAdditionalCameraData>();
                data.renderPostProcessing=false;
                data.renderShadows=false;
                data.requiresColorOption=CameraOverrideOption.Off;
                data.requiresDepthOption=CameraOverrideOption.Off;
            }
            var source=HudCamera;
            arenaReviewHeroCamera.CopyFrom(source);
            arenaReviewHeroCamera.enabled=false;
            arenaReviewHeroCamera.transform.SetPositionAndRotation(source.transform.position,source.transform.rotation);
            arenaReviewHeroCamera.cullingMask=1<<30;
            arenaReviewHeroCamera.clearFlags=CameraClearFlags.SolidColor;
            arenaReviewHeroCamera.backgroundColor=Color.clear;
            arenaReviewHeroCamera.allowHDR=false;
            arenaReviewHeroCamera.allowMSAA=false;
            arenaReviewHeroCamera.rect=new Rect(0,0,1,1);
            if(arenaReviewHeroRT==null||arenaReviewHeroRT.width!=Screen.width)
            {
                if(arenaReviewHeroRT!=null)
                {
                    arenaReviewHeroRT.Release();
                    Destroy(arenaReviewHeroRT);
                    Destroy(arenaReviewHeroRead);
                }
                arenaReviewHeroRT=new RenderTexture(Screen.width,Screen.height,24,RenderTextureFormat.ARGB32);
                arenaReviewHeroRT.Create();
                arenaReviewHeroRead=new Texture2D(Screen.width,Screen.height,TextureFormat.RGBA32,false);
            }
            var request=new UniversalRenderPipeline.SingleCameraRequest
            {
                destination=arenaReviewHeroRT
            };
            if(!RenderPipeline.SupportsRenderRequest(arenaReviewHeroCamera,request))return -2;
            RenderPipeline.SubmitRenderRequest(arenaReviewHeroCamera,request);
            var old=RenderTexture.active;
            try
            {
                RenderTexture.active=arenaReviewHeroRT;
                arenaReviewHeroRead.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);
                arenaReviewHeroRead.Apply(false);
                var data=arenaReviewHeroRead.GetRawTextureData<Color32>();
                int min=Screen.height,max=-1;
                for(int y=0;y<Screen.height;y++)
                {
                    int count=0;
                    for(int x=0;x<Screen.width;x++)
                    {
                        var c=data[y*Screen.width+x];
                        if(c.a>64&&c.r+c.g+c.b>12)count++;
                    }
                    if(count>=3)
                    {
                        min=Mathf.Min(min,y);
                        max=y;
                    }
                }
                return max>=min?max-min+1:0;
            }
            finally
            {
                RenderTexture.active=old;
            }
        }
        NativeArenaReviewPolicy.LifeCoverageTracker BossArenaReviewCoverage(EnemyState boss)
        {
            if(arenaReviewCoverage==null||arenaCoverageBoss!=boss)
            {
                arenaCoverageBoss=boss;
                arenaReviewCoverage=new NativeArenaReviewPolicy.LifeCoverageTracker(Simulation.Druid.Set);
                arenaSeqContactStart=-1; // a retry gets a fresh coverage and contact window
            }
            return arenaReviewCoverage;
        }
        void BossArenaReviewInputs(FullRunNavigation navigation,List<Key> keys,ref Vector2 move,ref Vector2 aim,ref bool attack,ref bool magic,bool evade)
        {
            if(arenaReviewOutput==null||Simulation.Druid==null||!Simulation.Stage.BossAlive)return;
            var s=Simulation;
            var boss=s.Druid.Boss;
            DruidData d;
            if(boss==null||!s.Druid.Data.TryGetValue(boss,out d))return;
            arenaSeqInputToward=false;
            bool waiting=BossArenaReviewCoverage(boss).Waiting(d.BossPhase,s.TickCount);
            bool contact=ArenaSeqOn&&d.BossPhase==0&&(arenaSeqContactStart<0||Time.frameCount-arenaSeqContactStart<NativeArenaReviewPolicy.SeqContactFrames);
            bool edge=ArenaEdgeLife(d.BossPhase)&&arenaEdgeShots[d.BossPhase]<3;
            arenaReviewInputStep=NativeArenaReviewPolicy.InputStepFor(true,waiting,contact,edge);
            // Coverage always owns input before either attacking capture stage.
            if(arenaReviewInputStep==NativeArenaReviewPolicy.InputStep.Coverage)
            {
                attack=magic=false;
                keys.Clear(); // release aux skills, digit slots, parries and charged attacks as well
                aim=new Vector2(boss.X,boss.Y);
                var p=s.Player;
                var away=new Vector2(p.X-boss.X,p.Y-boss.Y);if(away.sqrMagnitude<1)away=Vector2.down;
                float shift=(float)s.Druid.Set.ReachShift(d.BossPhase,boss.Radius);
                float range=d.S=="bossHeartWind"?220+shift:s.TickCount%480<240?boss.Radius+p.Radius+ArenaEdgeGapPx:420+shift;
                bool danger=false;foreach(var tell in arenaReviewTele)if(!tell.Live&&tell.Remaining>0&&tell.Remaining<=10)danger=true;
                if(!evade||move.sqrMagnitude<.01f)
                {
                    if(danger&&d.S!="bossHeartWind")range=500+shift;
                    var target=new Vector2(boss.X,boss.Y)+away.normalized*range;
                    move=navigation.Direction(p.X,p.Y,target.x,target.y,p.Radius,FullRunCanMove,s.TickCount);
                }
                if(move.x>.25f)keys.Add(Key.D);else if(move.x<-.25f)keys.Add(Key.A);
                if(move.y>.25f)keys.Add(Key.S);else if(move.y<-.25f)keys.Add(Key.W);
                // Space also binds rage burst: press it only with a real movement direction / legal roll.
                if((evade||danger)&&d.S!="bossHeartWind"&&keys.Count>0&&!s.IceOrbActive&&FullRunRollPress(s))keys.Add(Key.Space);
                return;
            }
            if(arenaReviewInputStep==NativeArenaReviewPolicy.InputStep.Contact)
            {   // contact bot (input only): attack 2 s -> roll at the boss centre -> attack 1 s -> dash at the boss centre -> repeat
                var pc=s.Player;
                if(arenaSeqContactStart<0)
                {   // approach without attacking; the contact capture clock starts on body-band arrival
                    attack=magic=false;keys.Clear();aim=new Vector2(boss.X,boss.Y);
                    var off=new Vector2(pc.X-boss.X,pc.Y-boss.Y);if(off.sqrMagnitude<1)off=Vector2.down;
                    var stand=new Vector2(boss.X,boss.Y)+off.normalized*(boss.Radius+pc.Radius+ArenaEdgeGapPx);
                    move=navigation.Direction(pc.X,pc.Y,stand.x,stand.y,pc.Radius,FullRunCanMove,s.TickCount);
                    if(move.x>.25f)keys.Add(Key.D);else if(move.x<-.25f)keys.Add(Key.A);
                    if(move.y>.25f)keys.Add(Key.S);else if(move.y<-.25f)keys.Add(Key.W);
                    return;
                }
                bool press;
                arenaSeqStep=NativeArenaReviewPolicy.ContactAt(s.TickCount-arenaSeqContactTick,out press);
                var toward=new Vector2(boss.X-pc.X,boss.Y-pc.Y);if(toward.sqrMagnitude<1)toward=Vector2.up;
                aim=new Vector2(boss.X,boss.Y);magic=false;
                keys.Remove(Key.F);keys.Remove(Key.LeftCtrl);keys.Remove(Key.Space);keys.Remove(Key.LeftShift);
                keys.Remove(Key.W);keys.Remove(Key.A);keys.Remove(Key.S);keys.Remove(Key.D);
                if(arenaSeqStep==NativeArenaReviewPolicy.ContactStep.Attack){attack=true;move=Vector2.zero;return;}
                attack=false;
                var dir=toward.normalized;move=dir;arenaSeqInputToward=true;
                if(dir.x>.25f)keys.Add(Key.D);else if(dir.x<-.25f)keys.Add(Key.A);
                if(dir.y>.25f)keys.Add(Key.S);else if(dir.y<-.25f)keys.Add(Key.W);
                if(arenaSeqStep==NativeArenaReviewPolicy.ContactStep.Roll){if(press)keys.Add(Key.Space);}
                else keys.Add(Key.LeftShift);
                return;
            }
            if(arenaReviewInputStep==NativeArenaReviewPolicy.InputStep.Edge)
            {
                var life=s.DruidLife(boss);
                if(life==null||!life.Collapsing)
                {   // stand on the boss body edge and keep attacking its centre
                    var pe=s.Player;
                    var off=new Vector2(pe.X-boss.X,pe.Y-boss.Y);if(off.sqrMagnitude<1)off=Vector2.down;
                    var stand=new Vector2(boss.X,boss.Y)+off.normalized*(boss.Radius+pe.Radius+ArenaEdgeGapPx);
                    attack=true;magic=false;aim=new Vector2(boss.X,boss.Y);
                    keys.Remove(Key.F);keys.Remove(Key.LeftCtrl);
                    move=navigation.Direction(pe.X,pe.Y,stand.x,stand.y,pe.Radius,FullRunCanMove,s.TickCount);
                    keys.Remove(Key.W);keys.Remove(Key.A);keys.Remove(Key.S);keys.Remove(Key.D);
                    if(move.x>.25f)keys.Add(Key.D);else if(move.x<-.25f)keys.Add(Key.A);
                    if(move.y>.25f)keys.Add(Key.S);else if(move.y<-.25f)keys.Add(Key.W);
                    return;
                }
            }
            // Existing stage leaves the caller's ordinary combat inputs unchanged.
        }
        void BossArenaReviewEnd()
        {
            if(arenaReviewOutput==null)return;
            WriteDruidRigReceipt(arenaReviewOutput);
            File.WriteAllText(Path.Combine(arenaReviewOutput,"camera-frames.jsonl"),arenaReviewTrace.ToString());
            File.WriteAllText(Path.Combine(arenaReviewOutput,"moves.jsonl"),arenaReviewEvents.ToString());
            var missing=new List<string>();
            foreach(var id in NativeArenaReviewPolicy.Moves)if(!arenaReviewSeen.Contains(id))missing.Add(id);
            var missingImages=new List<string>();
            if(!arenaReviewMetricsOnly)foreach(var id in NativeArenaReviewPolicy.Moves)foreach(string suffix in new[]
            {
                "-warning.png","-warning.json","-active.png","-active.json"
            }
            )if(!File.Exists(Path.Combine(arenaReviewOutput,"move-"+id+suffix)))missingImages.Add(id+suffix);
            BossArenaMaterialEnd(missingImages);
            var result=new ArenaReviewResult
            {
                result=missing.Count>0?"FAIL_MISSING_ACTIVATIONS":missingImages.Count>0?"FAIL_MISSING_CAPTURE_FILES":"ACTIVATION_COVERAGE_7_OF_7_VISUAL_QA_PENDING",buildGuid=Application.buildGUID,sandbox=NativeQaSandbox.Root,metricsOnly=arenaReviewMetricsOnly,width=Screen.width,height=Screen.height,captured=new List<string>(arenaReviewSeen).ToArray(),missing=missing.ToArray(),missingScreenshots=missingImages.ToArray(),scope="Virtual keyboard/mouse only. 3D bounds and isolated same-pose GPU hero silhouette (alpha>64 RGB sum>12 row>=3 pixels, includes weapon/cape, excludes map occlusion); sprite fallback alpha bounds include weapon and occluded pixels; compare actual PNG body. Pose sampled after final Cinemachine/billboard, PNG same rendered frame. Field hero scale unchanged. No forced move/HP/position edits.",timingScope="Capture PNG encoding/write contaminates current and following frame. Use a separate --unity-boss-arena-metrics-only run, same resolution, one Player, for FPS/long-frame verdict."
            };
            result.coverage=arenaReviewCoverage==null?new NativeArenaReviewPolicy.CoverageLife[0]:arenaReviewCoverage.Results();
            foreach(var life in result.coverage)if(life.coverageTimeout)result.coverageTimeout=true;
            object finalResult=result;
            if(ArenaSeqOn)
            {   // B6/B8 retouch cuts: extra fields only on the seq path
                var seqResult=new ArenaReviewSeqResult{result=result.result,buildGuid=result.buildGuid,sandbox=result.sandbox,scope=result.scope,timingScope=result.timingScope,metricsOnly=result.metricsOnly,width=result.width,height=result.height,captured=result.captured,missing=result.missing,missingScreenshots=result.missingScreenshots};
                seqResult.coverage=result.coverage;seqResult.coverageTimeout=result.coverageTimeout;
                seqResult.farEnemyCut=arenaSeqFarCut?"captured":arenaSeqEnemySeen?"no-top-third-frame":"none-in-arena";
                seqResult.bulletCut=arenaSeqBulletCut?"captured":"none";
                seqResult.entryFrames=arenaSeqEntryFrames;seqResult.exitFrames=arenaSeqExitFrames;
                seqResult.entryBlackFramesLongest=arenaSeqBlack.Longest;seqResult.entryBlackSecondsLongest=(float)arenaSeqBlack.LongestSeconds;seqResult.entryBlackSecondsTotal=(float)arenaSeqBlack.Total;
                seqResult.entryBlackWithinHalfSecond=arenaSeqEntryFrames>0&&arenaSeqBlack.LongestSeconds<=NativeArenaReviewPolicy.PureBlackMaxSeconds;
                finalResult=seqResult;
            }
            File.WriteAllText(Path.Combine(arenaReviewOutput,"review.json"),JsonUtility.ToJson(finalResult,true));
            Debug.Log("ARENA_REVIEW_RESULT "+result.result+" missing="+string.Join(",",missing));
            if(arenaReviewHeroRT!=null)
            {
                arenaReviewHeroRT.Release();
                Destroy(arenaReviewHeroRT);
                Destroy(arenaReviewHeroRead);
            }
            if(arenaReviewHeroCamera!=null)Destroy(arenaReviewHeroCamera.gameObject);
            if(arenaSeqRT!=null){arenaSeqRT.Release();Destroy(arenaSeqRT);Destroy(arenaSeqRead);}
            if(arenaSeqEncode!=null)Destroy(arenaSeqEncode);
            arenaReviewOutput=null;
        }
    }
}
