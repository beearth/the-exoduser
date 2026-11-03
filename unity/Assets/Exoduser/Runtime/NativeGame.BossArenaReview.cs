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
        int arenaReviewBeat,arenaReviewFissure,arenaReviewTick=-1,arenaReviewPhase=-1,arenaReviewPhaseTick;
        bool arenaReviewErupt,arenaReviewArena,arenaReviewMode,arenaReviewSink,arenaReviewLastCapture;
        float arenaReviewUntil;
        EnemyState arenaReviewBoss;
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
        [Serializable] sealed class ArenaReviewResult
        {
            public string result,buildGuid,sandbox,scope,timingScope;
            public bool metricsOnly;
            public int width,height;
            public string[] captured,missing,missingScreenshots;
        }
        void BossArenaReviewBegin(string output)
        {
            if(!BossArenaReviewRequested)return;
            if(!NativeQaSandbox.Active)throw new InvalidOperationException("Arena review requires isolated QA sandbox");
            arenaReviewOutput=Path.Combine(output,"arena-review");
            Directory.CreateDirectory(arenaReviewOutput);
            if((File.GetAttributes(arenaReviewOutput)&FileAttributes.ReparsePoint)!=0)throw new IOException("Arena review output cannot be a link");
            foreach(var file in Directory.GetFiles(arenaReviewOutput)){var name=Path.GetFileName(file);bool owned=name.StartsWith("move-",StringComparison.Ordinal)||name.StartsWith("transition-",StringComparison.Ordinal)||name=="camera-frames.jsonl"||name=="moves.jsonl"||name=="review.json"||name=="druid-rigpixel.json"||name=="druid-rigpixel-rt.png"||name.StartsWith("material-field-reference.",StringComparison.Ordinal)||name.StartsWith("material-arena-reference.",StringComparison.Ordinal)||name=="material-comparison.html";if(owned&&(name.EndsWith(".png",StringComparison.Ordinal)||name.EndsWith(".json",StringComparison.Ordinal)||name.EndsWith(".jsonl",StringComparison.Ordinal)||name=="material-comparison.html")){if((File.GetAttributes(file)&FileAttributes.ReparsePoint)!=0)throw new IOException("Arena review file cannot be a link");File.Delete(file);}}
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
            arenaReviewPreviousState=d.S;
            arenaReviewBeat=d.HbBeat;
            arenaReviewErupt=d.EruptHit;
            arenaReviewFissure=fissure;
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
                bool capture=arenaReviewShots.Count>0&&!arenaReviewMetricsOnly;
                row.capture=capture;
                if(capture)
                {
                    if(row.bossRig!=null&&row.bossRig.ready)row.bossRig.rawAlphaHeightPx=druidRig.CaptureRawRt(Path.Combine(arenaReviewOutput,"druid-rigpixel-rt.png"));
                    row.lighting=BossArenaCaptureLighting();row.surface=r3Arena==null?null:r3Arena.CaptureSurface();
                    row.heroGpuSilhouetteHeightPx=BossArenaReviewHeroPixels();
                    row.heroGpuSilhouetteHeightFraction=row.heroGpuSilhouetteHeightPx>0?row.heroGpuSilhouetteHeightPx/row.height:0;
                    fullRunCaptureActivity="arena-review";
                    fullRunLastCaptureActivity="arena-review";
                    fullRunLastCaptureFrame=Time.frameCount;
                    var image=ScreenCapture.CaptureScreenshotAsTexture();
                    try
                    {
                        var bytes=image.EncodeToPNG();
                        foreach(var name in arenaReviewShots)
                        {
                            File.WriteAllBytes(Path.Combine(arenaReviewOutput,name+".png"),bytes);
                            File.WriteAllText(Path.Combine(arenaReviewOutput,name+".json"),JsonUtility.ToJson(row,true));
                            if(name.EndsWith("-active",StringComparison.Ordinal)&&arenaReviewHeroRead!=null)File.WriteAllBytes(Path.Combine(arenaReviewOutput,name+"-hero-isolated.png"),arenaReviewHeroRead.EncodeToPNG());
                        }
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
        void BossArenaReviewInputs(FullRunNavigation navigation,List<Key> keys,ref Vector2 move,ref Vector2 aim,ref bool attack,ref bool magic,bool evade)
        {
            if(arenaReviewOutput==null||Simulation.Druid==null||!Simulation.Stage.BossAlive)return;
            var s=Simulation;
            var boss=s.Druid.Boss;
            DruidData d;
            if(boss==null||!s.Druid.Data.TryGetValue(boss,out d))return;
            if(d.BossPhase!=arenaReviewPhase)
            {
                arenaReviewPhase=d.BossPhase;
                arenaReviewPhaseTick=s.TickCount;
            }
            bool missing=false;
            int count=d.BossPhase==0?4:d.BossPhase==1?6:7;
            for(int i=0;i<count;i++)if(!arenaReviewSeen.Contains(NativeArenaReviewPolicy.Moves[i]))missing=true;
            if(!missing||s.TickCount-arenaReviewPhaseTick>3600)return;
            attack=magic=false;
            keys.Remove(Key.F);
            keys.Remove(Key.LeftCtrl);
            if(evade)return;
            var p=s.Player;
            var away=new Vector2(p.X-boss.X,p.Y-boss.Y);
            if(away.sqrMagnitude<1)away=Vector2.down;
            float range=d.S=="bossHeartWind"?220:s.TickCount%480<240?110:420;
            bool danger=false;foreach(var tell in arenaReviewTele)if(!tell.Live&&tell.Remaining>0&&tell.Remaining<=10)danger=true;
            if(danger&&d.S!="bossHeartWind"&&FullRunRollPress(s)){keys.Add(Key.Space);range=500;}
            var target=new Vector2(boss.X,boss.Y)+away.normalized*range;
            move=navigation.Direction(p.X,p.Y,target.x,target.y,p.Radius,FullRunCanMove,s.TickCount);
            keys.Remove(Key.W);
            keys.Remove(Key.A);
            keys.Remove(Key.S);
            keys.Remove(Key.D);
            if(move.x>.25f)keys.Add(Key.D);
            else if(move.x<-.25f)keys.Add(Key.A);
            if(move.y>.25f)keys.Add(Key.S);
            else if(move.y<-.25f)keys.Add(Key.W);
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
            File.WriteAllText(Path.Combine(arenaReviewOutput,"review.json"),JsonUtility.ToJson(result,true));
            Debug.Log("ARENA_REVIEW_RESULT "+result.result+" missing="+string.Join(",",missing));
            if(arenaReviewHeroRT!=null)
            {
                arenaReviewHeroRT.Release();
                Destroy(arenaReviewHeroRT);
                Destroy(arenaReviewHeroRead);
            }
            if(arenaReviewHeroCamera!=null)Destroy(arenaReviewHeroCamera.gameObject);
            arenaReviewOutput=null;
        }
    }
}
