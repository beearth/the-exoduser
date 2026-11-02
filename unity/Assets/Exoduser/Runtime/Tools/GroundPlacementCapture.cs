using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

namespace Exoduser.UnityPort.Tools
{
    // Explicit fixture only. Product renderers own every displayed sample.
    public sealed partial class GroundPlacementCapture : MonoBehaviour
    {
        const BindingFlags Flags=BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic;
        [Serializable] public sealed class Shape {
            public string path,kind,sprite,texture,assertionScope; public bool uvRangePreserved=true,uvOrientationPreserved=true,materialPreserved=true,texturePreserved=true,colorPreserved=true,opacityPreserved=true,sortingPreserved=true; public float uvRangeDelta,uvOrientationDelta,colorDelta,opacityDelta; public float uvWorldMappingMaxError,uvWorldTolerance,uvAxisXCorrelation,uvAxisYCorrelation; public bool uvAxesResolvable; public string sourceEntity; public bool normalDiagnosticOnly; public string instanceId; public int sortingOrder; public Vector3 pivot,normal,expectedNormal;
            public Rect atlasRect; public Vector2[] sourceSpriteUv; public Vector2[] uv; public Vector3[] vertices; public float[] expectedVertexY;
            public string sourceShader,sourceMaterial,materialEquivalenceContract; public Color sourceMaterialTint; public float drawFlat,drawNormalBlend,drawDstBlend,sourceGroundUvClip; public RingDiagnostic ring; public bool materialIdentityPreserved=true,defaultSpriteEquivalent,groundClipContract=true,projectedUv; public float groundRingRadius,sourceGroundRingRadius;public float groundUvClip,projectedCoefficientDelta,projectedRectDelta; public Vector4 groundU,groundV,groundRect,expectedGroundU,expectedGroundV,expectedGroundRect; public Vector2[] normalizedShaderUv,shaderUv; public int geometryRevision=-1; public CoverageDiagnostic footprint; public ContributionDiagnostic contribution; public InteriorDiagnostic interior; public float pivotLift,maxGroundError,normalUp,expectedDrawOffset,maxBiasResidual,opacity; public string shader,sharedMaterial; public Color color; public int vertexCount,triangleCount; public bool forceRenderingOff; public bool passed;
        }
        [Serializable] public sealed class InteriorDiagnostic {
            public bool diagnosticOnly=true; public string sampling="each actual triangle: 3 edge midpoints + centroid; shared edges sampled per triangle";
            public int sampleCount,over2cm,invalidSamples; public float maxAbs,meanAbs,p95Abs,meanSigned,minSigned,maxSigned,worstSigned;
            public Vector3 worstActualPoint; public float worstExpectedGround,worstExpectedDrawY; public float expectedDrawOffset=.025f;
        }
        [Serializable] public sealed class Row {
            public string site,consumer,scope,screenshot,direct3840,error; public bool direct3840Captured; public Vector2 core;
            public PerformanceDiagnostic performance; public int level; public float renderTime; public float actualRadius; public string radiusSourceFunction; public bool ground,passed; public List<Shape> shapes=new List<Shape>();
        }
        [Serializable] public sealed class Receipt {
            public string baselineProductSource="1403c5ee6d52c540815ab1cf70d5666b9023aa75",source,qaStorageRoot,audioMeasurementScope="paused/muted fixture; peak is a terminal 1024-sample observation, not continuous output logging",device,api,error;
            public string runtimeDllSha,coreDllSha,originalBefore,originalAfter;
            public int requestedDenseCount,requestedPerformanceFrames;public int contributionShapes,contributionUnverifiedShapes; public bool contributionVerified,subset; public string consumerPrefix,passScope; public int expectedRows; public string[] required,generated,missing; public int width,height,failures,directVideo;
            public bool restored,originalReferenceSame,originalStateSame,listenerPaused,passed;
            public float listenerVolume,peak; public List<Row> rows=new List<Row>();
        }
        static readonly string[] Consumers={"spikeTrap","holyDome","SeekerMines","Mine-first","Projectile-control","Mine-reused","trap","iceZone","blizzard","LavaPools","PoisonPools","GroundRing","Fissures","TideWaves","malice-control","slam-control","character-control","VfxWorld-active","VfxWorld-inactive","telegraph-2D-control","phase-Shock-create","phase-Shock-hold","phase-Shock-tail","phase-Seeker-unarmed","phase-Seeker-armed","phase-Mine-imminent","phase-Lava-warn","phase-Lava-active","phase-Lava-tail","phase-Poison-start","phase-Poison-atlas-middle","phase-Poison-tail","phase-Chase-warning","phase-Chase-hit-create","phase-Chase-hit-hold","phase-Chase-hit-tail","phase-Fissure-warning","phase-Fissure-explode-create","phase-Fissure-explode-hold","phase-Fissure-explode-tail","phase-Tide-create","phase-Tide-hold","phase-Tide-tail","phase-spikeTrap-zero","phase-holyDome-zero","size-spikeTrap-Lv1","size-spikeTrap-Lv20","size-holyDome-Lv1","size-holyDome-Lv20"};
        NativeGame game; Simulation original,sample; bool enabledBefore,runningBefore,lateEnabledBefore; Behaviour lateDriver; string output;
        int performanceFrames,denseCount; string[] selectedConsumers=Consumers; static Camera contributionCamera;
        Receipt receipt=new Receipt(); readonly HashSet<string> generated=new HashSet<string>();
        static string Arg(string key){var a=Environment.GetCommandLineArgs();int n=Array.IndexOf(a,key);return n>=0&&n+1<a.Length?a[n+1]:"";}
        static bool Has(string key){return Array.IndexOf(Environment.GetCommandLineArgs(),key)>=0;}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){
            if(!Has("--unity-ground-placement-capture"))return;
            if(!Has("--remodel3d")||!Has("--unity-quick-start")||!Path.IsPathRooted(Arg("--unity-qa-sandbox"))||!Path.IsPathRooted(Arg("-output"))) {Debug.LogError("GROUND_PLACEMENT invalid explicit QA arguments");Application.Quit(2);return;}
            new GameObject("Ground placement QA owner").AddComponent<GroundPlacementCapture>();
        }
        void SetRunning(bool value){typeof(NativeGame).GetProperty("Running").GetSetMethod(true).Invoke(game,new object[]{value});}
        object Field(string name){return typeof(NativeGame).GetField(name,Flags).GetValue(game);}
        void InvokeRaw(string name){typeof(NativeGame).GetMethod(name,Flags).Invoke(game,null);}
        void Invoke(string name){if(name=="UpdateViews"||name=="Remodel3DLate")TracedProductCall(name);else InvokeRaw(name);}
        double TracedProductCall(string name){Progress("before",name);long start=System.Diagnostics.Stopwatch.GetTimestamp();try{InvokeRaw(name);}catch(Exception ex){double failed=ElapsedMs(start);Progress("error",name,failed,null,ex.ToString());throw;}double ms=ElapsedMs(start);Progress("after",name,ms);return ms;}
        void SyncViews(){TimedSyncViews();}
        double TimedSyncViews(){long prepare=System.Diagnostics.Stopwatch.GetTimestamp();((Camera)Field("view")).cullingMask=(int)Field("worldMask");double prepareMs=ElapsedMs(prepare);double update=TracedProductCall("UpdateViews");return prepareMs+update+TracedProductCall("Remodel3DLate");}
        static string Sha(byte[] b){using(var h=SHA256.Create())return BitConverter.ToString(h.ComputeHash(b)).Replace("-","").ToLowerInvariant();}
        static string Dll(Type t){string p=t.Assembly.Location;return File.Exists(p)?Sha(File.ReadAllBytes(p)):"unavailable-connect-launcher-sha";}
        // Includes private randomState and all nested Core fields. Delegates are identity-only, never called.
        static string State(object value){var b=new StringBuilder();var seen=new HashSet<object>();Snapshot(value,b,seen);return Sha(Encoding.UTF8.GetBytes(b.ToString()));}
        static void Snapshot(object o,StringBuilder b,HashSet<object> seen){
            if(o==null){b.Append("null;");return;}var t=o.GetType();b.Append(t.FullName).Append(':');
            if(t.IsPrimitive||t.IsEnum||o is string||o is decimal){b.Append(Convert.ToString(o,System.Globalization.CultureInfo.InvariantCulture)).Append(';');return;}
            if(o is Delegate callback){foreach(var d in callback.GetInvocationList()){b.Append(d.Method.DeclaringType.FullName).Append(d.Method.Name);if(d.Target!=null)b.Append(System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(d.Target));}return;}
            if(!t.IsValueType&&!seen.Add(o)){b.Append("ref;");return;}
            if(o is IEnumerable seq){foreach(var v in seq)Snapshot(v,b,seen);return;}
            foreach(var f in t.GetFields(Flags).OrderBy(f=>f.Name)){if(f.IsStatic)continue;b.Append(f.Name);Snapshot(f.GetValue(o),b,seen);}
        }
        IEnumerator Start(){
            if(Has("-ground-receiver-full")){var full=ReceiverFullMode();while(full.MoveNext())yield return full.Current;yield break;}
            if(Has("-ground-receiver-smoke")){var smoke=ReceiverSmokeMode();while(smoke.MoveNext())yield return smoke.Current;yield break;}
            if(Has("-ground-geometry-probe")){var probe=GeometryProbeMode();while(probe.MoveNext())yield return probe.Current;yield break;}
            output=Arg("-output");traceOwner=this;receipt.source=Arg("-source-sha");receipt.qaStorageRoot=NativeQaSandbox.Root;receipt.consumerPrefix=Arg("-ground-consumer-prefix");receipt.subset=Has("-ground-consumer-prefix");selectedConsumers=receipt.subset?Consumers.Where(c=>c.StartsWith(receipt.consumerPrefix,StringComparison.Ordinal)).ToArray():Consumers;receipt.required=receipt.subset?selectedConsumers:selectedConsumers.Concat(new[]{"ground-lifecycle","ground-ring-lifecycle"}).ToArray();receipt.expectedRows=selectedConsumers.Length*3+(receipt.subset?0:2);receipt.passScope=receipt.subset?"selected consumer subset only; lifecycle omitted":"full consumer coverage plus lifecycle";AudioListener.pause=true;AudioListener.volume=0;
            var body=Execute();
            while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){receipt.error=ex.ToString();break;}if(!next)break;yield return current;}
            ReleaseDecodedCache();drawSources.Clear();ringSources.Clear();contributionCamera=null;try{(body as IDisposable)?.Dispose();}catch(Exception ex){receipt.error=(receipt.error??"")+" cleanup: "+ex;}
            Progress("after","capture-body");
            receipt.device=SystemInfo.graphicsDeviceName;receipt.api=SystemInfo.graphicsDeviceType.ToString();receipt.width=Screen.width;receipt.height=Screen.height;
            receipt.generated=generated.OrderBy(x=>x).ToArray();receipt.missing=receipt.required.Where(x=>!generated.Contains(x)).ToArray();
            receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;float[] audio=new float[1024];AudioListener.GetOutputData(audio,0);foreach(float x in audio)receipt.peak=Mathf.Max(receipt.peak,Mathf.Abs(x));
            foreach(var v in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())if(v.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideo++;
            receipt.runtimeDllSha=Dll(typeof(NativeGame));receipt.coreDllSha=Dll(typeof(Simulation));
            var contributions=receipt.rows.SelectMany(row=>row.shapes).Where(shape=>shape.contribution!=null).Select(shape=>shape.contribution).ToArray();receipt.contributionShapes=contributions.Length;receipt.contributionUnverifiedShapes=contributions.Count(d=>!d.verified);receipt.contributionVerified=contributions.Length>0&&receipt.contributionUnverifiedShapes==0;
            receipt.failures=receipt.rows.Count(x=>!x.passed);receipt.passed=receipt.error==null&&receipt.failures==0&&receipt.missing.Length==0&&receipt.rows.Count==receipt.expectedRows&&receipt.restored&&receipt.originalStateSame&&receipt.originalReferenceSame&&receipt.width==1920&&receipt.height==1080&&receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.peak==0&&receipt.directVideo==0;
            try{File.WriteAllText(Path.Combine(output,File.Exists(Path.Combine(output,"ground-placement-receipt.json"))?"ground-placement-failure-"+Guid.NewGuid().ToString("N")+".json":"ground-placement-receipt.json"),JsonUtility.ToJson(receipt,true));}catch(Exception ex){receipt.passed=false;Debug.LogError("GROUND_PLACEMENT receipt write failed "+ex);}
            yield return new WaitForSecondsRealtime(1);Debug.Log("QA_MEDIA_DRAIN_COMPLETE GROUND_PLACEMENT");if(game!=null&&original!=null){SetRunning(runningBefore);game.enabled=enabledBefore;if(lateDriver!=null)lateDriver.enabled=lateEnabledBefore;}Progress("end","capture");Application.Quit(receipt.passed?0:2);
        }
        IEnumerator Execute(){
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0){Debug.LogError("QA output must be empty");throw new InvalidOperationException("QA output must be empty");}
            Directory.CreateDirectory(output);Progress("begin","capture");
            if(receipt.subset&&(string.IsNullOrEmpty(receipt.consumerPrefix)||selectedConsumers.Length==0))throw new InvalidOperationException("Empty consumer prefix/selection is forbidden");
            if(Has("-ground-performance-frames")&&(!int.TryParse(Arg("-ground-performance-frames"),out performanceFrames)||performanceFrames<0))throw new InvalidOperationException("Performance frames must be a nonnegative integer");if(performanceFrames>0&&(!receipt.subset||selectedConsumers.Any(c=>!c.StartsWith("size-"))))throw new InvalidOperationException("Performance sampling requires an explicit size-only consumer subset");
            if(Has("-ground-dense-count")&&(!int.TryParse(Arg("-ground-dense-count"),out denseCount)||denseCount<0||denseCount>8))throw new InvalidOperationException("Dense count must be 0(disabled) or 1..8");if(denseCount>0&&performanceFrames==0)throw new InvalidOperationException("Dense diagnostics require performance frames >0");receipt.requestedDenseCount=denseCount;receipt.requestedPerformanceFrames=performanceFrames;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            float end=Time.realtimeSinceStartup+60;
            bool entered=false;
            while(Time.realtimeSinceStartup<end){game=FindAnyObjectByType<NativeGame>();
                if(game!=null&&game.Simulation!=null&&!entered){var lobby=Field("lobby");var flow=lobby.GetType().GetProperty("Flow").GetValue(lobby);flow.GetType().GetMethod("ShowLobby").Invoke(flow,null);flow.GetType().GetMethod("SelectPreview").Invoke(flow,null);Progress("before","field-entry");if(!(bool)lobby.GetType().GetMethod("EnterNativeTest").Invoke(lobby,null))throw new InvalidOperationException("QA field entry failed");entered=true;Progress("after","field-entry");Progress("before","field-ready");}
                if(entered&&NativeRemodel3D.Active&&Field("a2Field")!=null&&Field("r3Cam")!=null){Progress("after","field-ready");break;}yield return null;}
            var run=Run();try{while(run.MoveNext())yield return run.Current;}finally{(run as IDisposable)?.Dispose();}
        }
        IEnumerator Run(){
            if(game==null||!NativeRemodel3D.Active)throw new InvalidOperationException("Actual A2 not ready; launcher must enter field before fixture");
            var lobby=Field("lobby");lobby.GetType().GetMethod("CloseStartupCaptureMedia",Flags).Invoke(lobby,null);((Behaviour)lobby).enabled=false;
            original=game.Simulation;enabledBefore=game.enabled;runningBefore=game.Running;game.enabled=false;SetRunning(false);lateDriver=Field("r3Late") as Behaviour;if(lateDriver!=null){lateEnabledBefore=lateDriver.enabled;lateDriver.enabled=false;}
            receipt.originalBefore=State(original);
            var setter=typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true);
            contributionCamera=(Camera)Field("r3Cam");
            sample=new Simulation(new SimulationConfig(),0x671403u);sample.AttachDruidBoss();
            setter.Invoke(game,new object[]{sample});
            try{
                // Prior actual receiver receipt: soil / root boundary / actual wood bridge.
                var sites=new[]{new Vector2(40.2f,-77),new Vector2(36.2916f,-73.17135f),new Vector2(43.2f,-71.8f)};
                string[] labels={"soil","root-slope","wood-bridge"};
                for(int site=0;site<sites.Length;site++){
                    float x=sites[site].x*100,y=-sites[site].y*100;sample.Player.X=x-180;sample.Player.Y=y+80;
                    foreach(string consumer in selectedConsumers){
                        traceSite=labels[site];traceConsumer=consumer;tracePhase="consumer";Progress("begin","consumer");
                        Clear();bool ground=Populate(consumer,x,y);((Camera)Field("view")).cullingMask=(int)Field("worldMask");double initialUpdateMs=TracedProductCall("UpdateViews");var lineBefore=LineState(Field("skillView"));double initialLateMs=TracedProductCall("Remodel3DLate");
                        var row=new Row{renderTime=Time.unscaledTime,site=labels[site],consumer=consumer,core=new Vector2(x,y),ground=ground,scope=ground?"ground contact/normal":"legacy billboard or 2D control"};
                        if(consumer.StartsWith("size-")){var zone=sample.FireZones[0];row.level=zone.Lv;row.actualRadius=zone.R;row.radiusSourceFunction=consumer.Contains("spikeTrap")?"Exoduser.UnityPort.Core.Skills.SkillRules.SpikeTrapRadius(int)":"Exoduser.UnityPort.Core.Skills.SkillRules.HolyDomeRadius(int)";}
                        if(consumer=="phase-spikeTrap-zero"||consumer=="phase-holyDome-zero")MeasureZeroScale(row,consumer);
                        else if(consumer.StartsWith("VfxWorld"))MeasureVfx(row,x,y,consumer.EndsWith("inactive"));
                        else if(consumer=="telegraph-2D-control"){
                            bool active=NativeRemodel3D.Active;try{
                                NativeRemodel3D.Active=false;
                                var boss=new EnemyState{X=x,Y=y,Radius=60,Hp=100,MaxHp=100};sample.Druid.Boss=boss;sample.Druid.Remodel=true;
                                sample.Druid.Data[boss]=new DruidData{X=x,Y=y,R=60,S="bossSlamWind",St2=30,RmTeleTotal=60};
                                var tele=(NativeDruidTelegraphView)Field("teleView");var priorRenderers=new HashSet<Renderer>();Collect(tele,priorRenderers,new HashSet<object>());var priorPoses=priorRenderers.ToDictionary(r=>r.GetEntityId().ToString(),r=>r.localToWorldMatrix);tele.Update(sample,(Camera)Field("view"));
                                var meshes=new HashSet<Renderer>();Collect(tele,meshes,new HashSet<object>());
                                foreach(var renderer in meshes){var shape=Measure(renderer,false);var mf=renderer.GetComponent<MeshFilter>();var local=mf==null||mf.sharedMesh==null?new Vector3[0]:mf.sharedMesh.vertices;
                                    shape.assertionScope="2D mesh local XY z=0; world transform/sorting depth retained";
                                    shape.passed=local.Length>0&&local.All(v=>Mathf.Abs(v.z)<.0001f)&&(renderer.sortingOrder==-8985||renderer.sortingOrder==30000)&&priorPoses.TryGetValue(renderer.GetEntityId().ToString(),out var priorPose)&&priorPose==renderer.localToWorldMatrix;
                                    if(shape.vertices.Length>0)row.shapes.Add(shape);}
                                row.passed=row.shapes.Count>0&&row.shapes.All(v=>v.passed);row.scope="Actual NativeDruidTelegraphView mesh, Active=false XY plane; 2D arena visual unreviewed";
                            }finally{sample.Druid.Boss=null;sample.Druid.Remodel=false;sample.Druid.Data.Clear();NativeRemodel3D.Active=active;}
                        }else{
                            object owner=consumer.StartsWith("size-")?Field("skillView"):consumer=="character-control"?Field("playerView"):consumer=="spikeTrap"||consumer=="holyDome"||consumer=="malice-control"||consumer=="slam-control"?Field("skillView"):Field("bossView");
                            var renderers=new HashSet<Renderer>();Collect(owner,renderers,new HashSet<object>());
                            foreach(var r in renderers)if(r!=null&&r.enabled&&!r.forceRenderingOff&&r.gameObject.activeInHierarchy){bool shapeGround=ground&&!IsVerticalBurst(r);var shape=Measure(r,shapeGround);if(ground&&!shapeGround)shape.assertionScope="source Clip Hit/Roots/Dust: vertical burst billboard control, not a ground mark";
                                if(!shapeGround){
                                    if(consumer=="malice-control"&&r is LineRenderer){shape.assertionScope="malice trail world points preserved across product billboard pass";shape.passed=lineBefore.TryGetValue(r.GetEntityId().ToString(),out var before)&&before.Length==shape.vertices.Length&&before.Where((v,i)=>(v-shape.vertices[i]).sqrMagnitude>1e-10f).Count()==0;}
                                    else{var expected=Quaternion.Euler(NativeRemodel3D.Pitch*Mathf.Rad2Deg,0,0)*Vector3.forward;shape.assertionScope="legacy sprite billboard";shape.passed=shape.vertices.Length>0&&Mathf.Abs(Vector3.Dot(shape.normal,expected))>.99f;
                                        if(consumer=="malice-control"&&r.name=="orb"){shape.assertionScope="centered malice orb: GroundY+0.25m and billboard";shape.passed &= Mathf.Abs(shape.pivotLift-.25f)<.02f;}
                                        else if(consumer=="slam-control")shape.passed &= Mathf.Abs(shape.pivotLift)<.02f;}
                                }
                                shape.passed &= shape.groundClipContract;row.shapes.Add(shape);}
                            row.passed=row.shapes.Count>0&&row.shapes.All(s=>s.passed);if((consumer=="holyDome"||consumer.StartsWith("size-holyDome"))&&row.ground)row.passed &= row.shapes.Count(shape=>shape.ring!=null&&shape.ring.verified)==2;
                        }
                        if(row.shapes.Count>0||consumer.StartsWith("VfxWorld"))generated.Add(consumer);
                        if(performanceFrames>0&&consumer.StartsWith("size-")){var performance=MeasurePerformance(row,initialUpdateMs,initialLateMs);try{while(performance.MoveNext())yield return performance.Current;}finally{(performance as IDisposable)?.Dispose();}}
                        receipt.rows.Add(row);
                        yield return new WaitForEndOfFrame();
                        row.screenshot=Path.Combine(output,labels[site]+"-"+consumer+"-1920.png");var image=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(row.screenshot,image.EncodeToPNG());Destroy(image);
                        row.direct3840=Path.Combine(output,labels[site]+"-"+consumer+"-3840-direct-rt.png");CaptureDirect(game.Remodel3DCamera,row.direct3840);row.direct3840Captured=true;Progress("after","captures");
                        if(denseCount>0&&consumer.StartsWith("size-")){var dense=MeasureDensePerformance(row);try{while(dense.MoveNext())yield return dense.Current;}finally{(dense as IDisposable)?.Dispose();}}
                    }
                }
                if(!receipt.subset){var lifecycle=Lifecycle();try{while(lifecycle.MoveNext())yield return lifecycle.Current;}finally{(lifecycle as IDisposable)?.Dispose();}var rings=RingLifecycle();try{while(rings.MoveNext())yield return rings.Current;}finally{(rings as IDisposable)?.Dispose();}}
            }finally{
                tracePhase="restore-original";Progress("before","restore-original");setter.Invoke(game,new object[]{original});SyncViews();Progress("after","restore-original");
                receipt.originalAfter=State(original);receipt.originalReferenceSame=ReferenceEquals(original,game.Simulation);receipt.originalStateSame=receipt.originalBefore==receipt.originalAfter;
                receipt.restored=true; // Keep NativeGame disabled through media drain; restore enable flag immediately before Quit.
            }
        }
        IEnumerator Lifecycle(){
            traceSite="soil";traceConsumer="ground-lifecycle";tracePhase="lifecycle";Progress("begin","lifecycle");
            var root=new GameObject("QA isolated product boss lifecycle");var view=new NativeBossView(root.transform);
            var row=new Row{site="soil",consumer="ground-lifecycle",scope="same normal pool: iceZone -> field comet -> iceZone; source enabled/GO/Destroy/real 2D presentation restore",ground=false,passed=true};
            receipt.rows.Add(row);generated.Add("ground-lifecycle");
            try{
                Clear();sample.Player.X=3840;sample.Player.Y=7780;
                sample.FieldZones.Add(new Simulation.FieldZone{Kind="iceZone",X=4020,Y=7700,R=20,Life=180});
                view.Update(sample);SyncViews();
                var source=root.GetComponentsInChildren<SpriteRenderer>(true).FirstOrDefault(r=>r.enabled&&r.sprite!=null);
                if(source==null){row.passed=false;row.error="No source sprite";yield break;}
                string identity=source.GetEntityId().ToString();var ground=SurfaceFor(source) as MeshRenderer;
                if(ground==null){row.passed=false;row.error="Ground lifecycle display mesh missing (baseline remains FAIL)";yield break;}
                var surfaceShape=Measure(ground,true);row.shapes.Add(surfaceShape);row.passed &= surfaceShape.passed&&surfaceShape.vertexCount>=3&&surfaceShape.triangleCount>=1;
                source.enabled=false;SyncViews();row.passed &= !ground.enabled;source.enabled=true;
                source.gameObject.SetActive(false);yield return null;row.passed &= !ground.enabled;source.gameObject.SetActive(true);
                sample.FieldZones.Clear();sample.Druid.Projectiles.Add(new BossProjectile{X=4020,Y=7700,Mine=false,ParryClass="magic",Life=100,Ml=180,Active=true});view.Update(sample);SyncViews();
                var air=root.GetComponentsInChildren<SpriteRenderer>(true).FirstOrDefault(r=>r.enabled&&!r.forceRenderingOff&&r.sprite!=null);
                row.passed &= air==source&&!source.forceRenderingOff&&!ground.enabled&&source.GetEntityId().ToString()==identity;
                sample.Druid.Projectiles.Clear();sample.FieldZones.Add(new Simulation.FieldZone{Kind="iceZone",X=4020,Y=7700,R=20,Life=180});view.Update(sample);SyncViews();row.passed &= ground.enabled&&source.forceRenderingOff&&source.GetEntityId().ToString()==identity;
                var rotation=source.transform.localRotation;var scale=source.transform.localScale;bool active=NativeRemodel3D.Active,wasArena=sample.Stage.InArena;var oldArena=sample.Stage.Arena;
                try{sample.Stage.Arena=BossArenaLayout.Generate(sample.Config.StageIndex);sample.Stage.InArena=true;Invoke("UpdateViews");view.Update(sample);Invoke("UpdateViews");row.passed &= !NativeRemodel3D.Active&&!ground.enabled&&!source.forceRenderingOff&&source.transform.localScale==scale&&source.transform.localRotation==rotation;}
                finally{sample.Stage.InArena=wasArena;sample.Stage.Arena=oldArena;SyncViews();}row.passed &= NativeRemodel3D.Active==active;
                view.Update(sample);SyncViews();
                var surfaceObject=ground.gameObject;Destroy(source.gameObject);yield return null;yield return null;
                row.passed &= source==null&&surfaceObject==null;
            }finally{view.Dispose();Destroy(root);}
        }
        IEnumerator RingLifecycle(){
            traceSite="soil";traceConsumer="ground-ring-lifecycle";tracePhase="ring-lifecycle";Progress("begin","ring-lifecycle");
            var root=new GameObject("QA isolated holy ring lifetime");var view=new NativeSkillView(root.transform);var row=new Row{site="soil",consumer="ground-ring-lifecycle",scope="actual ring shared geometry, enabled/GO/2D/zone removal/Destroy",passed=true};receipt.rows.Add(row);generated.Add(row.consumer);
            var wasArena=sample.Stage.InArena;var oldArena=sample.Stage.Arena;
            try{
                Clear();sample.FireZones.Add(new FireZone{Id=91001,Type="holyDome",X=4020,Y=7700,R=520,T=30,MaxT=180});
                sample.Stage.Arena=BossArenaLayout.Generate(sample.Config.StageIndex);sample.Stage.InArena=true;Invoke("UpdateViews");view.Update(sample,Time.time);
                var lines=root.GetComponentsInChildren<LineRenderer>(true).Where(l=>l.positionCount==72&&l.name=="ring").ToArray();if(lines.Length!=2){row.passed=false;row.error="Original two 72point source rings missing";yield break;}
                var priorForce=lines.Select(l=>l.forceRenderingOff).ToArray();var rotations=lines.Select(l=>l.transform.localRotation).ToArray();var scales=lines.Select(l=>l.transform.localScale).ToArray();var raw2d=lines.Select(l=>Enumerable.Range(0,l.positionCount).Select(l.GetPosition).ToArray()).ToArray();
                sample.Stage.InArena=wasArena;sample.Stage.Arena=oldArena;SyncViews();view.Update(sample,Time.time);SyncViews();
                var draws=lines.Select(RingFor).ToArray();if(draws.Any(d=>d==null)){row.passed=false;row.error="Actual RingSurface missing; source72 is not a substitute PASS";yield break;}
                contributionCamera=game.Remodel3DCamera;for(int i=0;i<draws.Length;i++){var shape=MeasureRing(draws[i],lines[i]);row.shapes.Add(shape);row.passed &= shape.passed;}
                var line=lines[0];var draw=draws[0];line.enabled=false;SyncViews();row.passed &= !draw.enabled;line.enabled=true;
                line.gameObject.SetActive(false);view.Update(sample,Time.time);SyncViews();row.passed &= !draw.enabled;line.gameObject.SetActive(true);
                var owner=SourceFor(draw);if(owner==null){row.passed=false;row.error="Mapped ring body missing";yield break;}
                owner.enabled=false;SyncViews();row.passed &= draws.All(d=>!d.enabled);owner.enabled=true;view.Update(sample,Time.time);SyncViews();
                sample.Stage.Arena=BossArenaLayout.Generate(sample.Config.StageIndex);sample.Stage.InArena=true;Invoke("UpdateViews");view.Update(sample,Time.time);
                for(int i=0;i<lines.Length;i++){row.passed &= !draws[i].enabled&&lines[i].forceRenderingOff==priorForce[i]&&lines[i].transform.localRotation==rotations[i]&&lines[i].transform.localScale==scales[i];for(int j=0;j<72;j++)row.passed &= (lines[i].GetPosition(j)-raw2d[i][j]).sqrMagnitude<1e-10f;}
                sample.Stage.InArena=wasArena;sample.Stage.Arena=oldArena;SyncViews();view.Update(sample,Time.time);SyncViews();
                var objects=draws.Select(d=>d.gameObject).ToArray();sample.FireZones.Clear();view.Update(sample,Time.time);SyncViews();yield return null;yield return null;row.passed &= objects.All(o=>o==null)&&lines.All(l=>l==null);
                sample.FireZones.Add(new FireZone{Id=91002,Type="holyDome",X=4020,Y=7700,R=520,T=30,MaxT=180});view.Update(sample,Time.time);SyncViews();var fresh=root.GetComponentsInChildren<LineRenderer>(true).Where(l=>l.name=="ring"&&l.positionCount==72).ToArray();var freshDraw=fresh.Select(RingFor).ToArray();row.passed &= fresh.Length==2&&freshDraw.All(d=>d!=null&&d.enabled);var meshObjects=freshDraw.Where(d=>d!=null).Select(d=>d.gameObject).ToArray();Destroy(root);yield return null;yield return null;row.passed &= meshObjects.All(o=>o==null);
            }finally{sample.Stage.InArena=wasArena;sample.Stage.Arena=oldArena;view.Dispose();if(root!=null)Destroy(root);Clear();SyncViews();}
        }
        void Clear(){sample.FireZones.Clear();sample.SlamWaves.Clear();sample.MaliceOrbs.Clear();var d=sample.Druid;d.SeekerMines.Clear();d.Projectiles.Clear();d.LavaPools.Clear();d.PoisonPools.Clear();d.ChaseAoes.Clear();d.Fissures.Clear();d.TideWaves.Clear();sample.FieldZones.Clear();}
        bool Populate(string c,float x,float y){
            var d=sample.Druid;
            if(c.StartsWith("size-")){
                bool spike=c.Contains("spikeTrap");int level=c.EndsWith("Lv20")?20:1;
                float radius=(float)(spike?Exoduser.UnityPort.Core.Skills.SkillRules.SpikeTrapRadius(level):Exoduser.UnityPort.Core.Skills.SkillRules.HolyDomeRadius(level));
                sample.FireZones.Add(new FireZone{Id=30000+(spike?0:2)+(level==1?1:2),Type=spike?"spikeTrap":"holyDome",Lv=level,X=x,Y=y,R=radius,T=30,MaxT=180});return true;
            }
            if(c.StartsWith("phase-"))return PopulatePhase(c,x,y);
            if(c=="spikeTrap"||c=="holyDome")sample.FireZones.Add(new FireZone{Id=c=="spikeTrap"?1:2,Type=c,X=x,Y=y,R=100,T=30,MaxT=180});
            else if(c=="SeekerMines")d.SeekerMines.Add(new SeekerMine{X=x,Y=y,R=56,T=61,ArmT=60,MaxT=180});
            else if(c.StartsWith("Mine")||c=="Projectile-control")d.Projectiles.Add(new BossProjectile{X=x,Y=y,Mine=c!="Projectile-control",Life=100,Ml=180,Active=true});
            else if(c=="trap"||c=="iceZone"||c=="blizzard")sample.FieldZones.Add(new Simulation.FieldZone{Kind=c,X=x,Y=y,R=20,Life=180});
            else if(c=="LavaPools")d.LavaPools.Add(new LavaPool{X=x,Y=y,R=100,T=60,WarnT=30,MaxT=180});
            else if(c=="PoisonPools")d.PoisonPools.Add(new PoisonPool{X=x,Y=y,R=100,T=60,MaxT=180});
            else if(c=="GroundRing"){var a=new ChaseAoe();a.Zones.Add(new ChaseZone{X=x,Y=y,R=100,T=30,Delay=60});d.ChaseAoes.Add(a);}
            else if(c=="Fissures")d.Fissures.Add(new Fissure{X=x,Y=y,W=30,Len=100,ExplR=80,MaxT=180});
            else if(c=="TideWaves")d.TideWaves.Add(new TideWave{X=x,Y=y,Rad=100,GapSize=.8,MaxT=180});
            else if(c=="malice-control"){var orb=new MaliceOrb{Id=2,X=x,Y=y,R=20,Active=true,TrailCount=4,TrailHead=4};for(int i=0;i<4;i++){orb.TrailX[i]=x-(4-i)*12;orb.TrailY[i]=y;}sample.MaliceOrbs.Add(orb);}
            else if(c=="slam-control")sample.SlamWaves.Add(new SlamWave{Id=3,X=x,Y=y,MaxR=100,T=5,MaxT=60});
            return !(c.EndsWith("control")||c.StartsWith("Projectile")||c.StartsWith("VfxWorld")||c.StartsWith("telegraph"));
        }
        // Synthetic producer phases only. TickCount belongs to sample; Simulation.Tick is never called.
        bool PopulatePhase(string c,float x,float y){
            var d=sample.Druid;sample.TickCount+=256;d.Boss=null;d.Data.Clear();SyncViews(); // expire prior once-clips and reset transition state
            int serial=1000+Array.IndexOf(Consumers,c); // every synthetic phase has a distinct source identity
            if(c=="phase-spikeTrap-zero"||c=="phase-holyDome-zero"){sample.FireZones.Add(new FireZone{Id=c=="phase-spikeTrap-zero"?20001:20002,Type=c=="phase-spikeTrap-zero"?"spikeTrap":"holyDome",X=x,Y=y,R=100,T=0,MaxT=180});return false;}
            else if(c.StartsWith("phase-Seeker"))d.SeekerMines.Add(new SeekerMine{X=x,Y=y,R=56,T=c.EndsWith("unarmed")?20:61,ArmT=60,MaxT=180});
            else if(c=="phase-Mine-imminent")d.Projectiles.Add(new BossProjectile{X=x,Y=y,Mine=true,Life=20,Ml=180,Active=true});
            else if(c.StartsWith("phase-Lava"))d.LavaPools.Add(new LavaPool{X=x,Y=y,R=100,T=c.EndsWith("warn")?15:c.EndsWith("active")?60:162,WarnT=30,MaxT=180});
            else if(c.StartsWith("phase-Poison"))d.PoisonPools.Add(new PoisonPool{X=x,Y=y,R=100,T=c.EndsWith("start")?5:c.EndsWith("middle")?30:162,MaxT=180});
            else if(c.StartsWith("phase-Chase")){
                bool hit=!c.EndsWith("warning");var zone=new ChaseZone{X=x,Y=y,R=100,T=30,Delay=60,Hit=hit,ExplT=hit?1:0,ExplMax=24,Serial=serial};
                var aoe=new ChaseAoe{Serial=serial};aoe.Zones.Add(zone);d.ChaseAoes.Add(aoe);
                if(hit){SyncViews();int age=c.EndsWith("hold")?9:c.EndsWith("tail")?21:0;sample.TickCount+=age;zone.ExplT=1+age;}
            }
            else if(c.StartsWith("phase-Fissure")){
                bool exploded=!c.EndsWith("warning");var f=new Fissure{X=x,Y=y,W=30,Len=100,ExplR=80,T=30,MaxT=180,Exploded=exploded,Serial=serial};d.Fissures.Add(f);
                if(exploded){SyncViews();sample.TickCount+=c.EndsWith("hold")?12:c.EndsWith("tail")?27:0;}
            }
            else if(c.StartsWith("phase-Tide"))d.TideWaves.Add(new TideWave{X=x,Y=y,Rad=c.EndsWith("create")?40:c.EndsWith("hold")?100:160,T=c.EndsWith("create")?1:c.EndsWith("hold")?60:110,GapSize=.8,MaxT=120,Serial=serial});
            else if(c.StartsWith("phase-Shock")){
                var boss=new EnemyState{X=x,Y=y,Radius=60,Hp=100,MaxHp=100};var data=new DruidData{X=x,Y=y,R=60,S="bossShockWind",St2=30,RmTeleTotal=60};
                d.Boss=boss;d.Data[boss]=data;SyncViews();data.S="bossShock";SyncViews(); // actual product transition creates ShockClip once
                sample.TickCount+=c.EndsWith("hold")?21:c.EndsWith("tail")?49:0; // lifetime=7*8=56; retains nonzero terminal frame
            }
            else throw new InvalidOperationException("Unknown phase fixture "+c);
            return true;
        }
        // New case only: zero deployment is valid absence, never a required mesh.
        void MeasureZeroScale(Row row,string consumer){
            row.scope="T0 zero-deploy: finite source/vertices and no nonzero-area visible geometry; mesh not required";
            var owned=new HashSet<Renderer>();Collect(Field("skillView"),owned,new HashSet<object>());
            string wanted=consumer=="phase-spikeTrap-zero"?"thorn":"dome";
            var sources=owned.OfType<SpriteRenderer>().Where(r=>r!=null&&r.gameObject.activeInHierarchy&&r.name==wanted).ToArray();
            row.passed=sources.Length>0;
            foreach(var source in sources){var shape=Measure(source,false);shape.assertionScope=row.scope;
                shape.passed=shape.groundClipContract&&Finite(source.transform.position)&&Finite(source.transform.lossyScale)&&
                    (Mathf.Abs(source.transform.lossyScale.x)<.000001f||Mathf.Abs(source.transform.lossyScale.y)<.000001f)&&shape.vertices.All(Finite);
                row.shapes.Add(shape);row.passed &= shape.passed;
            }
            foreach(var renderer in owned)if(renderer!=null&&renderer.enabled&&!renderer.forceRenderingOff&&renderer.gameObject.activeInHierarchy){
                var shape=Measure(renderer,false);shape.assertionScope="zero-deploy actual display finite and collapsed";shape.passed=shape.vertices.All(Finite);
                for(int i=2;i<shape.vertices.Length;i++)shape.passed &= Vector3.Cross(shape.vertices[i-1]-shape.vertices[0],shape.vertices[i]-shape.vertices[0]).sqrMagnitude<1e-12f;
                row.passed &= shape.passed;row.shapes.Add(shape);
            }
        }
        static bool Finite(Vector3 v){return !float.IsNaN(v.x)&&!float.IsNaN(v.y)&&!float.IsNaN(v.z)&&!float.IsInfinity(v.x)&&!float.IsInfinity(v.y)&&!float.IsInfinity(v.z);}
        static Dictionary<string,Vector3[]> LineState(object owner){var all=new HashSet<Renderer>();Collect(owner,all,new HashSet<object>());var result=new Dictionary<string,Vector3[]>();foreach(var r in all)if(r is LineRenderer line&&line.enabled){var pts=new Vector3[line.positionCount];for(int i=0;i<pts.Length;i++)pts[i]=line.useWorldSpace?line.GetPosition(i):line.transform.TransformPoint(line.GetPosition(i));result[r.GetEntityId().ToString()]=pts;}return result;}
        static void Collect(object o,HashSet<Renderer> found,HashSet<object> seen){
            if(o==null||!seen.Add(o))return;if(o is Renderer rr){CollectDisplay(rr,found);return;}
            if(o is GameObject go){foreach(var r in go.GetComponentsInChildren<Renderer>(true))CollectDisplay(r,found);return;}
            if(o is UnityEngine.Object||o is Simulation||o is Delegate)return;
            if(o is IEnumerable seq){foreach(var v in seq)Collect(v,found,seen);return;}
            var t=o.GetType();if(t.IsPrimitive||t.IsEnum||o is string)return;
            foreach(var f in t.GetFields(Flags))if(!f.IsStatic)Collect(f.GetValue(o),found,seen);
        }
        static bool IsVerticalBurst(Renderer renderer){var sr=renderer as SpriteRenderer;if(sr==null)sr=SourceFor(renderer);if(sr==null||sr.sprite==null)return false;string name=sr.sprite.texture.name;return name=="druid_hit_24_20261010"||name=="druid_roots_48_20261010"||name=="druid_dust_24_20261010";}
        static Shape Measure(Renderer r,bool ground){Progress("before","Measure",-1,r);long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{var result=MeasureCore(r,ground);Progress("after","Measure",DiagnosticMs(start,overhead),r);return result;}catch(Exception ex){Progress("error","Measure",DiagnosticMs(start,overhead),r,ex.ToString());throw;}}
        static Shape MeasureCore(Renderer r,bool ground){
            if(ringSources.TryGetValue(r,out var ringSource))return MeasureRing(r,ringSource);
            var s=new Shape{forceRenderingOff=r.forceRenderingOff,shader=r.sharedMaterial==null?"none":r.sharedMaterial.shader.name,sharedMaterial=r.sharedMaterial==null?"none":r.sharedMaterial.name,assertionScope="active sibling/child display renderer; all vertex contact hard gate; slope normal diagnostic",path=r.name,kind=r.GetType().Name,instanceId=r.GetEntityId().ToString(),sortingOrder=r.sortingOrder,pivot=r.transform.position};var points=new List<Vector3>();
            var block=new MaterialPropertyBlock();r.GetPropertyBlock(block);s.opacity=block.GetFloat("_Opacity");s.color=r.sharedMaterial!=null&&r.sharedMaterial.HasProperty("_BaseColor")?r.sharedMaterial.GetColor("_BaseColor"):Color.white;
            if(r is SpriteRenderer sr&&sr.sprite!=null){s.color=sr.color;s.sprite=sr.sprite.name;s.texture=sr.sprite.texture.name;s.atlasRect=sr.sprite.rect;s.sourceSpriteUv=sr.sprite.uv;s.uv=sr.sprite.uv;foreach(var v in sr.sprite.vertices)points.Add(sr.transform.TransformPoint(v));}
            else if(r is LineRenderer line){for(int i=0;i<line.positionCount;i++)points.Add(line.useWorldSpace?line.GetPosition(i):line.transform.TransformPoint(line.GetPosition(i)));}
            else if(r is MeshRenderer){var source=SourceFor(r);if(source!=null&&source.sprite!=null){s.sprite=source.sprite.name;s.texture=source.sprite.texture.name;s.atlasRect=source.sprite.rect;s.sourceSpriteUv=source.sprite.uv;}var mf=r.GetComponent<MeshFilter>();if(mf!=null&&mf.sharedMesh!=null){s.color=mf.sharedMesh.colors.Length>0?mf.sharedMesh.colors[0]:s.color;s.triangleCount=mf.sharedMesh.triangles.Length/3;s.uv=mf.sharedMesh.uv;foreach(var v in mf.sharedMesh.vertices)points.Add(mf.transform.TransformPoint(v));}}
            if(r is MeshRenderer){var src=SourceFor(r);var mf=r.GetComponent<MeshFilter>();if(src!=null&&src.sprite!=null&&mf!=null&&mf.sharedMesh!=null){
                s.sourceEntity=src.GetEntityId().ToString();var sourceUv=src.sprite.uv;var meshUv=mf.sharedMesh.uv;
                if(sourceUv.Length==0||meshUv.Length==0){s.uvRangePreserved=false;s.uvOrientationPreserved=false;}
                else if(EffectiveFloat(r,"_GroundUvClip")>.5f){CheckProjectedUv(src,r,mf.sharedMesh,s);}
                else{var lo=new Vector2(sourceUv.Min(v=>v.x),sourceUv.Min(v=>v.y));var hi=new Vector2(sourceUv.Max(v=>v.x),sourceUv.Max(v=>v.y));var mlo=new Vector2(meshUv.Min(v=>v.x),meshUv.Min(v=>v.y));var mhi=new Vector2(meshUv.Max(v=>v.x),meshUv.Max(v=>v.y));s.uvRangeDelta=Mathf.Max((lo-mlo).magnitude,(hi-mhi).magnitude);s.uvRangePreserved=s.uvRangeDelta<=.00001f;s.uvOrientationPreserved=CheckUvWorldMapping(src,points,meshUv,s);}
                var srcBlock=new MaterialPropertyBlock();src.GetPropertyBlock(srcBlock);s.sourceShader=src.sharedMaterial==null?"none":src.sharedMaterial.shader.name;s.sourceMaterial=src.sharedMaterial==null?"none":src.sharedMaterial.name;s.sourceMaterialTint=src.sharedMaterial!=null&&src.sharedMaterial.HasProperty("_Color")?src.sharedMaterial.GetColor("_Color"):Color.white;s.drawFlat=EffectiveFloat(r,"_Flat");s.drawNormalBlend=EffectiveFloat(r,"_NormalBlend");s.drawDstBlend=EffectiveFloat(r,"_DstBlend");s.materialEquivalenceContract="only white Sprites/Default -> SkillAdditive Flat0 NormalBlend1 DstBlend10: same texture and vertexRGBA, premultiplied rgb=p.rgb*vertexRGB*p.a*vertexAlpha; alpha=p.a*vertexAlpha";s.materialIdentityPreserved=r.sharedMaterial==src.sharedMaterial;s.defaultSpriteEquivalent=!s.materialIdentityPreserved&&EquivalentDefaultSprite(src,r);s.materialPreserved=s.materialIdentityPreserved||s.defaultSpriteEquivalent;s.texturePreserved=block.GetTexture("_MainTex")==src.sprite.texture;s.opacityDelta=Mathf.Abs(block.GetFloat("_Opacity")-srcBlock.GetFloat("_Opacity"));s.opacityPreserved=s.opacityDelta<=.000001f;s.sortingPreserved=r.sortingOrder==src.sortingOrder&&r.sortingLayerID==src.sortingLayerID;var colors=mf.sharedMesh.colors;if(colors.Length!=mf.sharedMesh.vertexCount)s.colorPreserved=false;foreach(var color in colors){var delta=(Vector4)color-(Vector4)src.color;s.colorDelta=Mathf.Max(s.colorDelta,delta.magnitude);}s.colorPreserved &= s.colorDelta<=.000001f;
            }}
            s.groundRingRadius=EffectiveFloat(r,"_GroundRingRadius");s.groundUvClip=EffectiveFloat(r,"_GroundUvClip");s.projectedUv=s.groundUvClip>.5f;s.groundClipContract=!(r is SpriteRenderer)&&ground||s.groundUvClip==0;var hiddenSource=SourceFor(r);if(hiddenSource!=null){s.sourceGroundUvClip=EffectiveFloat(hiddenSource,"_GroundUvClip");s.groundClipContract &= s.sourceGroundUvClip==0;}if(r is MeshRenderer&&r.sharedMaterial!=null&&r.sharedMaterial.HasProperty("_GroundUvClip")&&ground)s.groundClipContract &= s.groundUvClip==1;s.sourceGroundRingRadius=hiddenSource==null?0:EffectiveFloat(hiddenSource,"_GroundRingRadius");s.groundClipContract &= s.groundRingRadius==0&&s.sourceGroundRingRadius==0;s.geometryRevision=GeometryRevision(hiddenSource);
            s.vertices=points.ToArray();s.vertexCount=points.Count;s.expectedDrawOffset=ground?(r is LineRenderer ? .03f : .025f):0;s.pivotLift=s.pivot.y-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z);
            s.expectedVertexY=points.Select(p=>NativeRemodel3D.GroundY(p.x,p.z)+s.expectedDrawOffset).ToArray();for(int i=0;i<points.Count;i++)s.maxBiasResidual=Mathf.Max(s.maxBiasResidual,Mathf.Abs(points[i].y-s.expectedVertexY[i]));foreach(var p in points)s.maxGroundError=Mathf.Max(s.maxGroundError,Mathf.Abs(p.y-NativeRemodel3D.GroundY(p.x,p.z)));
            s.normal=r.transform.forward;if(points.Count>2){for(int i=2;i<points.Count;i++){var n=Vector3.Cross(points[i-1]-points[0],points[i]-points[0]);if(n.sqrMagnitude>1e-10f){s.normal=n.normalized;break;}}}s.normalUp=Mathf.Abs(Vector3.Dot(s.normal,Vector3.up));float gx=(NativeRemodel3D.GroundY(s.pivot.x+.01f,s.pivot.z)-NativeRemodel3D.GroundY(s.pivot.x-.01f,s.pivot.z))/.02f;float gz=(NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z+.01f)-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z-.01f))/.02f;s.expectedNormal=new Vector3(-gx,1,-gz).normalized;
            s.normalDiagnosticOnly=s.expectedVertexY.Length>0&&s.expectedVertexY.Max()-s.expectedVertexY.Min()>.001f;
            // Before execution: flat normal hard gate only if sampled ground span <=1mm. Slopes retain vertex contact hard gate, normals diagnostic.
            // Fixed 2cm contact tolerance; every active displayed vertex is measured. No baseline exception.
            if(ground&&r is MeshRenderer){var interiorFilter=r.GetComponent<MeshFilter>();if(interiorFilter!=null&&interiorFilter.sharedMesh!=null){FillShaderUvAndCoverage(r,interiorFilter.sharedMesh,s);s.interior=MeasureInterior(interiorFilter.sharedMesh.triangles,points);s.contribution=MeasureContribution(r,interiorFilter.sharedMesh,points);}}
            s.passed=points.Count>0&&s.groundClipContract&&s.uvRangePreserved&&s.uvOrientationPreserved&&s.materialPreserved&&s.texturePreserved&&s.colorPreserved&&s.opacityPreserved&&s.sortingPreserved&&(!ground||(s.maxBiasResidual<=.02f&&Mathf.Abs(s.pivotLift)<=.02f&&(s.normalDiagnosticOnly||Mathf.Abs(Vector3.Dot(s.normal,Vector3.up))>=.99f)));return s;
        }
        [Serializable] public sealed class TimingStats {public int samples;public double meanMs,p95Ms,maxMs;}
        [Serializable] public sealed class PerformanceDiagnostic {
            public PerformanceDiagnostic dense; public int syntheticDenseCount,lastUniqueMeshes,peakUniqueMeshes,lastDraws,peakDraws; public bool denseSampleRestored; public bool diagnosticOnly=true;public string scope="NativeGame UpdateViews+Remodel3DLate wall-clock only; no GPU completion timing or performance PASS",fixedPoseScope="same frame, identical pose/time; cache-hit-corresponding path inferred, no product cache instrumentation",liveScope="yielded actual-time rotation plus synthetic FireZone T progression; no Simulation.Tick";
            public GeometryRevisionEntry[] initialGeometry,fixedGeometry,liveGeometry; public bool geometryRevisionObserved,fixedGeometryUnchanged,liveGeometryUnchanged; public double initialUpdateMs,initialLateMs,initialCombinedMs;public TimingStats fixedPose,liveFrames;public int peakVertices,peakTriangles,lastVertices,lastTriangles;public bool syntheticDeploymentRestored;
        }
        static double ElapsedMs(long start){return (System.Diagnostics.Stopwatch.GetTimestamp()-start)*1000.0/System.Diagnostics.Stopwatch.Frequency;}
        static TimingStats Summarize(List<double> samples){var result=new TimingStats{samples=samples.Count};if(samples.Count==0)return result;samples.Sort();result.meanMs=samples.Average();result.maxMs=samples[samples.Count-1];result.p95Ms=samples[Mathf.Clamp(Mathf.CeilToInt(.95f*samples.Count)-1,0,samples.Count-1)];return result;}
        void CountPerformanceTopology(PerformanceDiagnostic d){var owned=new HashSet<Renderer>();Collect(Field("skillView"),owned,new HashSet<object>());int vertices=0,triangles=0,draws=0;var meshes=new HashSet<Mesh>();foreach(var renderer in owned)if(renderer is MeshRenderer&&renderer.enabled&&!renderer.forceRenderingOff&&renderer.gameObject.activeInHierarchy){var mf=renderer.GetComponent<MeshFilter>();if(mf!=null&&mf.sharedMesh!=null){draws++;if(meshes.Add(mf.sharedMesh)){vertices+=mf.sharedMesh.vertexCount;triangles+=mf.sharedMesh.triangles.Length/3;}}}d.lastVertices=vertices;d.lastTriangles=triangles;d.peakVertices=Mathf.Max(d.peakVertices,vertices);d.peakTriangles=Mathf.Max(d.peakTriangles,triangles);d.lastUniqueMeshes=meshes.Count;d.peakUniqueMeshes=Mathf.Max(d.peakUniqueMeshes,meshes.Count);d.lastDraws=draws;d.peakDraws=Mathf.Max(d.peakDraws,draws);}
        IEnumerator MeasurePerformance(Row row,double initialUpdate,double initialLate){
            tracePhase="single-performance";Progress("before","single-performance");
            var d=new PerformanceDiagnostic{initialUpdateMs=initialUpdate,initialLateMs=initialLate,initialCombinedMs=initialUpdate+initialLate};row.performance=d;CountPerformanceTopology(d);d.initialGeometry=CaptureGeometryRevisions();d.geometryRevisionObserved=d.initialGeometry.Length>0;
            var repeated=new List<double>();for(int i=0;i<performanceFrames;i++){tracePhase="fixed-"+i;Progress("before","fixed");double ms=TimedSyncViews();repeated.Add(ms);Progress("after","fixed",ms);}d.fixedPose=Summarize(repeated);d.fixedGeometry=CaptureGeometryRevisions();d.fixedGeometryUnchanged=d.geometryRevisionObserved&&SameRevisions(d.initialGeometry,d.fixedGeometry);
            var live=new List<double>();var zones=sample.FireZones.ToArray();var priorT=zones.Select(z=>z.T).ToArray();
            try{for(int i=0;i<performanceFrames;i++){yield return null;foreach(var zone in zones)zone.T=Mathf.RoundToInt(30f*(i+1)/performanceFrames);tracePhase="live-"+i;Progress("before","live");double ms=TimedSyncViews();live.Add(ms);CountPerformanceTopology(d);Progress("after","live",ms);}}
            finally{for(int i=0;i<zones.Length;i++)zones[i].T=priorT[i];SyncViews();d.syntheticDeploymentRestored=zones.Select((z,i)=>z.T==priorT[i]).All(v=>v);}
            d.liveFrames=Summarize(live);d.liveGeometry=CaptureGeometryRevisions();d.liveGeometryUnchanged=d.geometryRevisionObserved&&SameRevisions(d.initialGeometry,d.liveGeometry);
        }
        IEnumerator MeasureDensePerformance(Row row){
            tracePhase="dense-prepare";Progress("before","dense-prepare");
            var originalZones=sample.FireZones.ToArray();if(originalZones.Length!=1||row.performance==null)throw new InvalidOperationException("Dense size fixture needs exactly one original FireZone and performance record");
            var template=originalZones[0];var d=new PerformanceDiagnostic{syntheticDenseCount=denseCount,scope="synthetic dense actual-radius field: new source-ID geometry cold, fixed frame cache and yielded roll/deploy; no gameplay/60fps PASS"};row.performance.dense=d;
            try{
                sample.FireZones.Clear();for(int i=0;i<denseCount;i++){var zone=new FireZone();foreach(var f in typeof(FireZone).GetFields(BindingFlags.Public|BindingFlags.Instance))f.SetValue(zone,f.GetValue(template));zone.Id=500000+template.Id*10+i;zone.X=template.X+(i==0?0:((i-1)%3-1)*120);zone.Y=template.Y+(i==0?0:((i-1)/3+1)*120);zone.T=30;sample.FireZones.Add(zone);}
                tracePhase="dense-cold";Progress("before","dense-cold");d.initialCombinedMs=TimedSyncViews();Progress("after","dense-cold",d.initialCombinedMs);CountPerformanceTopology(d);d.initialGeometry=CaptureGeometryRevisions();d.geometryRevisionObserved=d.initialGeometry.Length>0;
                var fixedSamples=new List<double>();for(int i=0;i<performanceFrames;i++){tracePhase="dense-fixed-"+i;Progress("before","dense-fixed");double ms=TimedSyncViews();fixedSamples.Add(ms);Progress("after","dense-fixed",ms);}d.fixedPose=Summarize(fixedSamples);d.fixedGeometry=CaptureGeometryRevisions();d.fixedGeometryUnchanged=d.geometryRevisionObserved&&SameRevisions(d.initialGeometry,d.fixedGeometry);
                foreach(var zone in sample.FireZones)zone.T=0;SyncViews();var live=new List<double>();for(int i=0;i<performanceFrames;i++){yield return null;foreach(var zone in sample.FireZones)zone.T=Mathf.RoundToInt(30f*(i+1)/performanceFrames);tracePhase="dense-live-"+i;Progress("before","dense-live");double ms=TimedSyncViews();live.Add(ms);CountPerformanceTopology(d);Progress("after","dense-live",ms);}d.liveFrames=Summarize(live);d.liveGeometry=CaptureGeometryRevisions();d.liveGeometryUnchanged=d.geometryRevisionObserved&&SameRevisions(d.initialGeometry,d.liveGeometry);
            }finally{sample.FireZones.Clear();sample.FireZones.AddRange(originalZones);SyncViews();d.denseSampleRestored=sample.FireZones.Count==originalZones.Length&&sample.FireZones.Select((z,i)=>ReferenceEquals(z,originalZones[i])).All(v=>v);if(!d.denseSampleRestored)throw new InvalidOperationException("Dense FireZone restoration failed");}
        }
        [Serializable] public sealed class GeometryRevisionEntry {public string rendererEntity,sourceEntity,meshEntity;public int revision;}
        GeometryRevisionEntry[] CaptureGeometryRevisions(){var owned=new HashSet<Renderer>();Collect(Field("skillView"),owned,new HashSet<object>());return owned.Where(r=>r is MeshRenderer&&r.enabled&&!r.forceRenderingOff&&r.gameObject.activeInHierarchy&&SourceFor(r)!=null).Select(r=>{var source=SourceFor(r);var mf=r.GetComponent<MeshFilter>();return new GeometryRevisionEntry{rendererEntity=r.GetEntityId().ToString(),sourceEntity=source.GetEntityId().ToString(),meshEntity=mf!=null&&mf.sharedMesh!=null?mf.sharedMesh.GetEntityId().ToString():"null",revision=GeometryRevision(source)};}).Where(e=>e.revision>=0).OrderBy(e=>e.rendererEntity).ToArray();}
        static bool SameRevisions(GeometryRevisionEntry[] a,GeometryRevisionEntry[] b){return a.Length==b.Length&&a.Select((e,i)=>e.rendererEntity==b[i].rendererEntity&&e.sourceEntity==b[i].sourceEntity&&e.meshEntity==b[i].meshEntity&&e.revision==b[i].revision).All(v=>v);}
        static bool CheckUvWorldMapping(SpriteRenderer source,List<Vector3> world,Vector2[] uv,Shape shape){
            if(uv.Length!=world.Count||uv.Length<3)return false;
            var sprite=source.sprite;var rect=sprite.rect;var anchor=source.transform.position;var scale=source.transform.lossyScale;
            double angle=source.transform.eulerAngles.z*Math.PI/180,cs=Math.Cos(angle),sn=Math.Sin(angle);
            float magnitude=Mathf.Max(1,Mathf.Max(Mathf.Abs(anchor.x),Mathf.Abs(anchor.z)));float extent=Mathf.Max(Mathf.Abs(rect.width/sprite.pixelsPerUnit*scale.x),Mathf.Abs(rect.height/sprite.pixelsPerUnit*scale.y));
            shape.uvWorldTolerance=.00002f+8*1.1920929e-7f*Mathf.Max(magnitude,extent);
            double sx=0,sy=0,su=0,sv=0,sxx=0,syy=0,suu=0,svv=0,sxu=0,syv=0;
            for(int i=0;i<uv.Length;i++){
                double u=(uv[i].x*sprite.texture.width-rect.x)/rect.width,v=(uv[i].y*sprite.texture.height-rect.y)/rect.height;
                double flippedU=source.flipX?1-u:u,flippedV=source.flipY?1-v:v;
                double dx=(flippedU*rect.width-sprite.pivot.x)/sprite.pixelsPerUnit*scale.x,dy=(flippedV*rect.height-sprite.pivot.y)/sprite.pixelsPerUnit*scale.y;
                double ex=anchor.x+dx*cs-dy*sn,ez=anchor.z+dx*sn+dy*cs;
                float error=(float)Math.Sqrt((world[i].x-ex)*(world[i].x-ex)+(world[i].z-ez)*(world[i].z-ez));shape.uvWorldMappingMaxError=Mathf.Max(shape.uvWorldMappingMaxError,error);
                double wx=world[i].x-anchor.x,wz=world[i].z-anchor.z,x=wx*cs+wz*sn,y=-wx*sn+wz*cs;
                sx+=x;sy+=y;su+=u;sv+=v;sxx+=x*x;syy+=y*y;suu+=u*u;svv+=v*v;sxu+=x*u;syv+=y*v;
            }
            double n=uv.Length,denX=Math.Sqrt(Math.Max(0,(n*sxx-sx*sx)*(n*suu-su*su))),denY=Math.Sqrt(Math.Max(0,(n*syy-sy*sy)*(n*svv-sv*sv)));
            shape.uvAxesResolvable=extent>8*shape.uvWorldTolerance&&denX>1e-14&&denY>1e-14;
            shape.uvAxisXCorrelation=denX>0?(float)((n*sxu-sx*su)/denX):0;shape.uvAxisYCorrelation=denY>0?(float)((n*syv-sy*sv)/denY):0;
            float expectedX=Mathf.Sign(scale.x)*(source.flipX?-1:1),expectedY=Mathf.Sign(scale.y)*(source.flipY?-1:1);
            shape.uvOrientationDelta=shape.uvWorldMappingMaxError;
            return shape.uvWorldMappingMaxError<=shape.uvWorldTolerance&&(!shape.uvAxesResolvable||(shape.uvAxisXCorrelation*expectedX>=.99f&&shape.uvAxisYCorrelation*expectedY>=.99f));
        }
        static void CaptureDirect(Camera camera,string path){
            var target=new RenderTexture(3840,1080,24,RenderTextureFormat.ARGB32);target.Create();var oldTarget=camera.targetTexture;var oldActive=RenderTexture.active;float aspect=camera.aspect;var rect=camera.rect;
            try{camera.aspect=3840f/1080;camera.rect=new Rect(0,0,1,1);var request=new UniversalRenderPipeline.SingleCameraRequest{destination=target};if(!RenderPipeline.SupportsRenderRequest(camera,request))throw new InvalidOperationException("URP direct render request unsupported");RenderPipeline.SubmitRenderRequest(camera,request);RenderTexture.active=target;var image=new Texture2D(3840,1080,TextureFormat.RGBA32,false);try{image.ReadPixels(new Rect(0,0,3840,1080),0,0);image.Apply();File.WriteAllBytes(path,image.EncodeToPNG());}finally{Destroy(image);}}finally{camera.targetTexture=oldTarget;camera.aspect=aspect;camera.rect=rect;RenderTexture.active=oldActive;target.Release();Destroy(target);}
        }
        static InteriorDiagnostic MeasureInterior(int[] triangles,List<Vector3> world,float offset=.025f){Progress("before","MeasureInterior",-1,null);long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{var result=MeasureInteriorCore(triangles,world,offset);Progress("after","MeasureInterior",DiagnosticMs(start,overhead),null);return result;}catch(Exception ex){Progress("error","MeasureInterior",DiagnosticMs(start,overhead),null,ex.ToString());throw;}}
        static InteriorDiagnostic MeasureInteriorCore(int[] triangles,List<Vector3> world,float offset=.025f){
            var d=new InteriorDiagnostic{expectedDrawOffset=offset};var errors=new List<float>();double absSum=0,signedSum=0;
            for(int i=0;i+2<triangles.Length;i+=3){
                int ia=triangles[i],ib=triangles[i+1],ic=triangles[i+2];
                if(ia<0||ib<0||ic<0||ia>=world.Count||ib>=world.Count||ic>=world.Count){d.invalidSamples+=4;continue;}
                Vector3 a=world[ia],b=world[ib],c=world[ic];
                var probes=new[]{(a+b)*.5f,(b+c)*.5f,(c+a)*.5f,(a+b+c)/3f};
                foreach(var point in probes){
                    float ground=NativeRemodel3D.GroundY(point.x,point.z),expected=ground+d.expectedDrawOffset,error=point.y-expected;
                    if(!Finite(point)||float.IsNaN(error)||float.IsInfinity(error)){d.invalidSamples++;continue;}
                    float absolute=Mathf.Abs(error);if(d.sampleCount==0||absolute>d.maxAbs){d.maxAbs=absolute;d.worstSigned=error;d.worstActualPoint=point;d.worstExpectedGround=ground;d.worstExpectedDrawY=expected;}
                    if(d.sampleCount==0){d.minSigned=error;d.maxSigned=error;}else{d.minSigned=Mathf.Min(d.minSigned,error);d.maxSigned=Mathf.Max(d.maxSigned,error);}
                    d.sampleCount++;if(absolute>.02f)d.over2cm++;errors.Add(absolute);absSum+=absolute;signedSum+=error;
                }
            }
            if(d.sampleCount>0){errors.Sort();d.meanAbs=(float)(absSum/d.sampleCount);d.meanSigned=(float)(signedSum/d.sampleCount);d.p95Abs=errors[Mathf.Clamp(Mathf.CeilToInt(.95f*errors.Count)-1,0,errors.Count-1)];}
            return d;
        }
        [Serializable] public sealed class ContributionProbe {
            public Vector3 actualPoint,expectedPoint,actualScreen1920,expectedScreen1920,potentialRGB;
            public bool insideFootprint=true,textureSampled; public Vector2 rawMeshUv,normalizedShaderUv,uv; public Color textureRGBA,vertexRGBA; public float signedResidual,expectedGround,expectedDrawY,textureAlpha,vertexAlpha,flatTintAlpha,flat,opacityRaw,opacityApplied,potentialMax;
            public bool opacityPresent;
        }
        [Serializable] public sealed class ContributionBucket {
            public string rule; public int count,over2cm; public float maxAbs,meanAbs,p95Abs; public ContributionProbe worst;
            [NonSerialized] public List<float> errors=new List<float>(); [NonSerialized] public double sum;
            public void Add(ContributionProbe p){float e=Mathf.Abs(p.signedResidual);if(count==0||e>maxAbs){maxAbs=e;worst=p;}count++;if(e>.02f)over2cm++;sum+=e;errors.Add(e);}
            public void Finish(){if(count==0)return;errors.Sort();meanAbs=(float)(sum/count);p95Abs=errors[Mathf.Clamp(Mathf.CeilToInt(.95f*count)-1,0,count-1)];errors.Clear();}
        }
        [Serializable] public sealed class ContributionDiagnostic {
            public bool diagnosticOnly=true,verified,flatMaterialPresent,flatPropertyBlockPresent,opacityMaterialPresent,opacityPropertyBlockPresent;
            public string error,scope="GPU-decoded mip0 texture contribution; no depth occlusion or final tonemap pixel-difference verdict",shader,texture,graphicsFormat,filterMode,wrapU,wrapV,activeColorSpace;
            public bool projectedUv;public float groundUvClip;public Vector4 groundU,groundV,groundRect;public int width,height,mipCount,cameraPixelWidth,cameraPixelHeight; public float flatMaterialRaw,flatPropertyBlockRaw,flatResolved,opacityMaterialRaw,opacityPropertyBlockRaw,opacityRaw,opacityApplied=1;
            public ContributionBucket worstRaw=new ContributionBucket{rule="all valid probes, transparency retained"},positive=new ContributionBucket{rule="potential RGB max > 0"},oneByte=new ContributionBucket{rule="potential RGB max >= 1/255"},onePercent=new ContributionBucket{rule="potential RGB max >= .01"};
        }
        sealed class DecodedTexture {public int width,height;public Color[] pixels;}
        static readonly Dictionary<Texture2D,DecodedTexture> decodedTextures=new Dictionary<Texture2D,DecodedTexture>();
        static void ReleaseDecodedCache(){decodedTextures.Clear();}
        static DecodedTexture DecodeMip0(Texture2D source){Progress("before",decodedTextures.ContainsKey(source)?"GPU-decode-cache-hit":"GPU-decode-mip0");long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{var result=DecodeMip0Core(source);Progress("after","GPU-decode-mip0",DiagnosticMs(start,overhead));return result;}catch(Exception ex){Progress("error","GPU-decode-mip0",DiagnosticMs(start,overhead),null,ex.ToString());throw;}}
        static DecodedTexture DecodeMip0Core(Texture2D source){
            if(decodedTextures.TryGetValue(source,out var cached))return cached;
            if(!SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBFloat)||!SystemInfo.SupportsTextureFormat(TextureFormat.RGBAFloat))throw new NotSupportedException("ARGBFloat/RGBAFloat GPU diagnostic unsupported; no image fallback");
            if(decodedTextures.Count>=2)ReleaseDecodedCache();
            var target=new RenderTexture(source.width,source.height,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear){useMipMap=false,autoGenerateMips=false,antiAliasing=1};
            Texture2D clone=null;var active=RenderTexture.active;bool srgb=GL.sRGBWrite;
            try{
                if(!target.Create())throw new InvalidOperationException("ARGBFloat RT creation failed");
                GL.sRGBWrite=false;Graphics.Blit(source,target);RenderTexture.active=target;
                clone=new Texture2D(source.width,source.height,TextureFormat.RGBAFloat,false,true);
                clone.ReadPixels(new Rect(0,0,source.width,source.height),0,0);clone.Apply(false,false);
                var result=new DecodedTexture{width=source.width,height=source.height,pixels=clone.GetPixels()};decodedTextures.Add(source,result);return result;
            }finally{GL.sRGBWrite=srgb;RenderTexture.active=active;if(clone!=null)Destroy(clone);target.Release();Destroy(target);}
        }
        static Color SampleDecoded(DecodedTexture data,Vector2 uv,FilterMode filter){
            float u=Mathf.Clamp01(uv.x),v=Mathf.Clamp01(uv.y);
            if(filter==FilterMode.Point)return data.pixels[Mathf.Clamp(Mathf.FloorToInt(v*data.height),0,data.height-1)*data.width+Mathf.Clamp(Mathf.FloorToInt(u*data.width),0,data.width-1)];
            float x=u*data.width-.5f,y=v*data.height-.5f;int x0=Mathf.FloorToInt(x),y0=Mathf.FloorToInt(y);float fx=x-x0,fy=y-y0;
            Color a=data.pixels[Mathf.Clamp(y0,0,data.height-1)*data.width+Mathf.Clamp(x0,0,data.width-1)],b=data.pixels[Mathf.Clamp(y0,0,data.height-1)*data.width+Mathf.Clamp(x0+1,0,data.width-1)],c=data.pixels[Mathf.Clamp(y0+1,0,data.height-1)*data.width+Mathf.Clamp(x0,0,data.width-1)],d=data.pixels[Mathf.Clamp(y0+1,0,data.height-1)*data.width+Mathf.Clamp(x0+1,0,data.width-1)];
            return Color.LerpUnclamped(Color.LerpUnclamped(a,b,fx),Color.LerpUnclamped(c,d,fx),fy);
        }
        static ContributionDiagnostic MeasureContribution(Renderer renderer,Mesh mesh,List<Vector3> world){Progress("before","MeasureContribution",-1,renderer);long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{var result=MeasureContributionCore(renderer,mesh,world);Progress("after","MeasureContribution",DiagnosticMs(start,overhead),renderer);return result;}catch(Exception ex){Progress("error","MeasureContribution",DiagnosticMs(start,overhead),renderer,ex.ToString());throw;}}
        static ContributionDiagnostic MeasureContributionCore(Renderer renderer,Mesh mesh,List<Vector3> world){
            var d=new ContributionDiagnostic();
            try{
                var material=renderer.sharedMaterial;if(material==null)throw new InvalidOperationException("No actual shared material");d.shader=material.shader.name;
                var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);int flatId=Shader.PropertyToID("_Flat"),opacityId=Shader.PropertyToID("_Opacity");
                d.flatMaterialPresent=material.HasProperty(flatId);d.flatPropertyBlockPresent=block.HasFloat(flatId);d.flatMaterialRaw=d.flatMaterialPresent?material.GetFloat(flatId):0;d.flatPropertyBlockRaw=block.GetFloat(flatId);d.flatResolved=d.flatPropertyBlockPresent?d.flatPropertyBlockRaw:d.flatMaterialRaw;
                d.opacityMaterialPresent=material.HasProperty(opacityId);d.opacityPropertyBlockPresent=block.HasFloat(opacityId);d.opacityMaterialRaw=d.opacityMaterialPresent?material.GetFloat(opacityId):0;d.opacityPropertyBlockRaw=block.GetFloat(opacityId);d.opacityRaw=d.opacityPropertyBlockPresent?d.opacityPropertyBlockRaw:d.opacityMaterialRaw;
                // SkillAdditive has no _Opacity uniform. Its absent raw value is never multiplied into RGB.
                d.opacityApplied=d.shader=="EXODUSER/KiSlashAdditive"?d.opacityRaw:1;d.groundUvClip=EffectiveFloat(renderer,"_GroundUvClip");d.projectedUv=d.groundUvClip>.5f;d.groundU=block.GetVector("_GroundUvU");d.groundV=block.GetVector("_GroundUvV");d.groundRect=block.GetVector("_GroundUvRect");
                var texture=block.GetTexture("_MainTex") as Texture2D;if(texture==null&&material.HasProperty("_MainTex"))texture=material.GetTexture("_MainTex") as Texture2D;
                if(texture==null){var source=SourceFor(renderer);if(source!=null&&source.sprite!=null)texture=source.sprite.texture;}
                if(texture==null)throw new InvalidOperationException("No actual GPU Texture2D _MainTex");
                d.texture=texture.name;d.width=texture.width;d.height=texture.height;d.mipCount=texture.mipmapCount;d.graphicsFormat=texture.graphicsFormat.ToString();d.filterMode=texture.filterMode.ToString();d.wrapU=texture.wrapModeU.ToString();d.wrapV=texture.wrapModeV.ToString();d.activeColorSpace=QualitySettings.activeColorSpace.ToString();
                if(d.shader!="EXODUSER/SkillAdditive"&&d.shader!="EXODUSER/KiSlashAdditive")throw new NotSupportedException("No symbolic contribution contract for shader "+d.shader);
                if(contributionCamera==null)throw new InvalidOperationException("No current 1920 diagnostic camera");d.cameraPixelWidth=contributionCamera.pixelWidth;d.cameraPixelHeight=contributionCamera.pixelHeight;
                var decoded=DecodeMip0(texture);var localVertices=mesh.vertices;var uv=mesh.uv;var colors=mesh.colors;var triangles=mesh.triangles;
                if(uv.Length!=world.Count)throw new InvalidOperationException("Actual mesh UV/vertex mismatch");
                Vector3[] weights={new Vector3(.5f,.5f,0),new Vector3(0,.5f,.5f),new Vector3(.5f,0,.5f),new Vector3(1f/3,1f/3,1f/3)};
                for(int i=0;i+2<triangles.Length;i+=3){int a=triangles[i],b=triangles[i+1],c=triangles[i+2];if(a<0||b<0||c<0||a>=world.Count||b>=world.Count||c>=world.Count)throw new InvalidOperationException("Invalid triangle index");
                    foreach(var w in weights){var point=world[a]*w.x+world[b]*w.y+world[c]*w.z;var texUV=uv[a]*w.x+uv[b]*w.y+uv[c]*w.z;Color vertex=colors.Length==world.Count?colors[a]*w.x+colors[b]*w.y+colors[c]*w.z:Color.white;Vector2 rawUv=texUV,normalized=texUV;bool inside=true;if(d.projectedUv){var local=localVertices[a]*w.x+localVertices[b]*w.y+localVertices[c]*w.z;normalized=new Vector2(local.x*d.groundU.x+local.z*d.groundU.y+d.groundU.z,local.x*d.groundV.x+local.z*d.groundV.y+d.groundV.z);inside=normalized.x>=0&&normalized.x<=1&&normalized.y>=0&&normalized.y<=1;texUV=new Vector2(d.groundRect.x+normalized.x*d.groundRect.z,d.groundRect.y+normalized.y*d.groundRect.w);}Color p=inside?SampleDecoded(decoded,texUV,texture.filterMode):Color.clear;
                        float ground=NativeRemodel3D.GroundY(point.x,point.z),tint=d.flatResolved>.5f?Mathf.Max(p.r,Mathf.Max(p.g,p.b)):1,alpha=p.a*vertex.a*tint;Vector3 rgb=d.flatResolved>.5f?Vector3.one:new Vector3(p.r,p.g,p.b);rgb=d.shader=="EXODUSER/KiSlashAdditive"?new Vector3(p.r,p.g,p.b)*p.a*d.opacityApplied:Vector3.Scale(rgb,new Vector3(vertex.r,vertex.g,vertex.b))*alpha;
                        var probe=new ContributionProbe{insideFootprint=inside,textureSampled=inside,rawMeshUv=rawUv,normalizedShaderUv=normalized,actualPoint=point,expectedPoint=new Vector3(point.x,ground+.025f,point.z),uv=texUV,textureRGBA=p,vertexRGBA=vertex,textureAlpha=p.a,vertexAlpha=vertex.a,flatTintAlpha=tint,flat=d.flatResolved,opacityPresent=d.opacityMaterialPresent||d.opacityPropertyBlockPresent,opacityRaw=d.opacityRaw,opacityApplied=d.opacityApplied,potentialRGB=rgb,potentialMax=Mathf.Max(rgb.x,Mathf.Max(rgb.y,rgb.z)),expectedGround=ground,expectedDrawY=ground+.025f,signedResidual=point.y-ground-.025f};
                        if(!Finite(point)||!Finite(rgb)||float.IsNaN(probe.signedResidual)||float.IsInfinity(probe.signedResidual))throw new InvalidOperationException("Non-finite interior contribution probe");
                        if(contributionCamera!=null){probe.actualScreen1920=contributionCamera.WorldToScreenPoint(point);probe.expectedScreen1920=contributionCamera.WorldToScreenPoint(probe.expectedPoint);}
                        d.worstRaw.Add(probe);if(inside&&probe.potentialMax>0)d.positive.Add(probe);if(inside&&probe.potentialMax>=1f/255)d.oneByte.Add(probe);if(inside&&probe.potentialMax>=.01f)d.onePercent.Add(probe);
                    }
                }
                if(d.worstRaw.count==0)throw new InvalidOperationException("No valid contribution probes");d.verified=true;
            }catch(Exception ex){d.error=ex.ToString();d.verified=false;}
            d.worstRaw.Finish();d.positive.Finish();d.oneByte.Finish();d.onePercent.Finish();return d;
        }
        static readonly Dictionary<Renderer,SpriteRenderer> drawSources=new Dictionary<Renderer,SpriteRenderer>();
        static Renderer SurfaceFor(SpriteRenderer source){
            if(source==null)return null;
            foreach(var component in source.GetComponents<Component>())if(component!=null){var property=component.GetType().GetProperty("SurfaceRenderer",Flags);if(property!=null&&typeof(Renderer).IsAssignableFrom(property.PropertyType)){var renderer=property.GetValue(component) as Renderer;if(renderer!=null){drawSources[renderer]=source;return renderer;}}}
            var child=source.GetComponentsInChildren<MeshRenderer>(true).FirstOrDefault();if(child!=null)drawSources[child]=source;return child;
        }
        static SpriteRenderer SourceFor(Renderer renderer){if(renderer is SpriteRenderer sprite)return sprite;if(renderer!=null&&drawSources.TryGetValue(renderer,out var source)&&source!=null)return source;return renderer==null?null:renderer.GetComponentInParent<SpriteRenderer>();}
        static void CollectDisplay(Renderer renderer,HashSet<Renderer> found){foreach(var child in renderer.gameObject.GetComponentsInChildren<Renderer>(true))found.Add(child);if(renderer is SpriteRenderer source){var surface=SurfaceFor(source);if(surface!=null)found.Add(surface);}if(renderer is LineRenderer line){var ring=RingFor(line);if(ring!=null)found.Add(ring);}}
        static int GeometryRevision(SpriteRenderer source){if(source==null)return -1;foreach(var component in source.GetComponents<Component>())if(component!=null){var property=component.GetType().GetProperty("GeometryRevision",Flags);if(property!=null&&property.PropertyType==typeof(int))return (int)property.GetValue(component);}return -1;}
        static float EffectiveFloat(Renderer renderer,string name){var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);int id=Shader.PropertyToID(name);return block.HasFloat(id)?block.GetFloat(id):renderer.sharedMaterial!=null&&renderer.sharedMaterial.HasProperty(id)?renderer.sharedMaterial.GetFloat(id):0;}
        static bool EquivalentDefaultSprite(SpriteRenderer source,Renderer draw){
            var src=source.sharedMaterial;var dst=draw.sharedMaterial;if(src==null||dst==null||src.shader.name!="Sprites/Default"||dst.shader.name!="EXODUSER/SkillAdditive")return false;
            Color tint=src.HasProperty("_Color")?src.GetColor("_Color"):Color.white;var block=new MaterialPropertyBlock();source.GetPropertyBlock(block);if(block.HasColor(Shader.PropertyToID("_Color")))tint*=block.GetColor("_Color");
            return Mathf.Abs(tint.r-1)<1e-6f&&Mathf.Abs(tint.g-1)<1e-6f&&Mathf.Abs(tint.b-1)<1e-6f&&Mathf.Abs(tint.a-1)<1e-6f&&EffectiveFloat(draw,"_Flat")==0&&EffectiveFloat(draw,"_NormalBlend")==1&&EffectiveFloat(draw,"_DstBlend")==10;
        }
        static bool CoefficientMatches(Vector4 actual,Vector4 expected,ref float maximum){bool ok=true;for(int i=0;i<4;i++){float error=Mathf.Abs(actual[i]-expected[i]);maximum=Mathf.Max(maximum,error);float tolerance=1e-5f+8*1.1920929e-7f*Mathf.Max(1,Mathf.Max(Mathf.Abs(actual[i]),Mathf.Abs(expected[i])));ok &= error<=tolerance;}return ok;}
        static void CheckProjectedUv(SpriteRenderer source,Renderer draw,Mesh mesh,Shape shape){
            var block=new MaterialPropertyBlock();draw.GetPropertyBlock(block);shape.groundU=block.GetVector("_GroundUvU");shape.groundV=block.GetVector("_GroundUvV");shape.groundRect=block.GetVector("_GroundUvRect");
            var sprite=source.sprite;var rect=sprite.rect;var scale=source.transform.lossyScale;float width=rect.width/sprite.pixelsPerUnit*scale.x,height=rect.height/sprite.pixelsPerUnit*scale.y,left=-sprite.pivot.x/sprite.pixelsPerUnit*scale.x,bottom=-sprite.pivot.y/sprite.pixelsPerUnit*scale.y;
            if(Mathf.Abs(width)<1e-9f||Mathf.Abs(height)<1e-9f){shape.uvRangePreserved=false;shape.uvOrientationPreserved=false;return;}
            float angle=source.transform.eulerAngles.z*Mathf.Deg2Rad,c=Mathf.Cos(angle),sn=Mathf.Sin(angle),uSign=source.flipX?-1:1,vSign=source.flipY?-1:1;
            Vector3 origin=draw.transform.TransformPoint(Vector3.zero)-source.transform.position,x=draw.transform.TransformVector(Vector3.right),z=draw.transform.TransformVector(Vector3.forward);
            shape.expectedGroundU=new Vector4(uSign*(x.x*c+x.z*sn)/width,uSign*(z.x*c+z.z*sn)/width,(source.flipX?1:0)+uSign*(origin.x*c+origin.z*sn-left)/width,0);
            shape.expectedGroundV=new Vector4(vSign*(-x.x*sn+x.z*c)/height,vSign*(-z.x*sn+z.z*c)/height,(source.flipY?1:0)+vSign*(-origin.x*sn+origin.z*c-bottom)/height,0);
            shape.expectedGroundRect=new Vector4(rect.x/sprite.texture.width,rect.y/sprite.texture.height,rect.width/sprite.texture.width,rect.height/sprite.texture.height);
            var uv=sprite.uv;var lo=new Vector2(uv.Min(v=>v.x),uv.Min(v=>v.y));var hi=new Vector2(uv.Max(v=>v.x),uv.Max(v=>v.y));
            shape.projectedRectDelta=Mathf.Max((new Vector2(shape.groundRect.x,shape.groundRect.y)-lo).magnitude,(new Vector2(shape.groundRect.x+shape.groundRect.z,shape.groundRect.y+shape.groundRect.w)-hi).magnitude);shape.uvRangeDelta=shape.projectedRectDelta;shape.uvRangePreserved=shape.projectedRectDelta<=1e-5f;
            bool coeff=CoefficientMatches(shape.groundU,shape.expectedGroundU,ref shape.projectedCoefficientDelta)&CoefficientMatches(shape.groundV,shape.expectedGroundV,ref shape.projectedCoefficientDelta);
            shape.uvOrientationDelta=shape.projectedCoefficientDelta;shape.uvOrientationPreserved=coeff;
        }
        [Serializable] public sealed class CoverageDiagnostic {public bool diagnosticOnly=true,unionNotComputed=true;public string rule="sum of actual triangles clipped to normalized shader UV unit square";public int triangles,clippedTriangles;public double normalizedAreaSum,missingAreaEstimate,overlapExcess,worldAreaSum,missingWorldAreaEstimate;}
        static Vector2 NormalizedUv(Vector3 local,Vector4 u,Vector4 v){return new Vector2(local.x*u.x+local.z*u.y+u.z,local.x*v.x+local.z*v.y+v.z);}
        static void ClipPolygon(List<Vector2> input,List<Vector2> output,int axis,float boundary,bool lower){output.Clear();if(input.Count==0)return;Vector2 a=input[input.Count-1];bool aInside=lower?a[axis]>=boundary:a[axis]<=boundary;foreach(var b in input){bool bInside=lower?b[axis]>=boundary:b[axis]<=boundary;if(aInside!=bInside){float delta=b[axis]-a[axis];float t=delta==0?0:(boundary-a[axis])/delta;output.Add(a+(b-a)*t);}if(bInside)output.Add(b);a=b;aInside=bInside;}}
        static void FillShaderUvAndCoverage(Renderer renderer,Mesh mesh,Shape shape){Progress("before","UV-and-coverage",-1,renderer);long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{FillShaderUvAndCoverageCore(renderer,mesh,shape);}finally{Progress("after","UV-and-coverage",DiagnosticMs(start,overhead),renderer);}}
        static void FillShaderUvAndCoverageCore(Renderer renderer,Mesh mesh,Shape shape){
            var source=SourceFor(renderer);if(source==null||source.sprite==null)return;
            var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);bool projected=EffectiveFloat(renderer,"_GroundUvClip")>.5f;Vector4 u=block.GetVector("_GroundUvU"),v=block.GetVector("_GroundUvV"),rect=block.GetVector("_GroundUvRect");
            var local=mesh.vertices;var raw=mesh.uv;shape.normalizedShaderUv=new Vector2[local.Length];shape.shaderUv=new Vector2[local.Length];var sprite=source.sprite;var atlas=sprite.rect;
            for(int i=0;i<local.Length;i++){var n=projected?NormalizedUv(local[i],u,v):new Vector2((raw[i].x*sprite.texture.width-atlas.x)/atlas.width,(raw[i].y*sprite.texture.height-atlas.y)/atlas.height);shape.normalizedShaderUv[i]=n;shape.shaderUv[i]=projected?new Vector2(rect.x+n.x*rect.z,rect.y+n.y*rect.w):raw[i];}
            var d=new CoverageDiagnostic();var triangles=mesh.triangles;var a=new List<Vector2>(8);var b=new List<Vector2>(8);
            for(int i=0;i+2<triangles.Length;i+=3){d.triangles++;a.Clear();a.Add(shape.normalizedShaderUv[triangles[i]]);a.Add(shape.normalizedShaderUv[triangles[i+1]]);a.Add(shape.normalizedShaderUv[triangles[i+2]]);
                for(int edge=0;edge<4;edge++){ClipPolygon(a,b,edge/2,edge%2,edge%2==0);var tmp=a;a=b;b=tmp;}
                if(a.Count<3)continue;double area=0;for(int k=0;k<a.Count;k++){var p=a[k];var q=a[(k+1)%a.Count];area+=(double)p.x*q.y-(double)p.y*q.x;}area=Math.Abs(area)*.5;if(area>0)d.clippedTriangles++;d.normalizedAreaSum+=area;
            }
            d.missingAreaEstimate=Math.Max(0,1-d.normalizedAreaSum);d.overlapExcess=Math.Max(0,d.normalizedAreaSum-1);var scale=source.transform.lossyScale;double footprint=Math.Abs(atlas.width/sprite.pixelsPerUnit*scale.x*atlas.height/sprite.pixelsPerUnit*scale.y);d.worldAreaSum=d.normalizedAreaSum*footprint;d.missingWorldAreaEstimate=d.missingAreaEstimate*footprint;shape.footprint=d;
        }
        [Serializable] public sealed class RingDiagnostic {
            public bool centerMeasured,gpuRingMaskVerified;public Vector3 centerActualPoint,centerScreen;public Color centerRgb;public float bodyRadius,sourceRadius,sourceLineRadius;public int gpuBandScreenSamples,gpuBandPositiveSamples;public bool atlasUsed=false,vertexColorUsed=false,opacityUsed=false,verified,sharedBodyMesh,sourceForced,sourceActive,sourceEnabled,gpuVerified;
            public string error,sourceLine,bodySource,bodyMesh,ringMesh,gpuScope="isolated actual renderer/material/PB into linear float RT; actual ring AA, no environment occlusion/tonemap",formula="72polygon distance; raw uniform color; no atlas/vertex color";
            public int sourcePoints,bodyRevision=-1,ringRevision=-1,bandSamples,missingBandSamples,gpuPositivePixels;public float radius,width,lift,radiusDelta,colorDelta,gpuMaxRgb;
            public Color uniformColor;public Vector3[] original72World;public ContributionBucket band=new ContributionBucket{rule="actual mesh support at 72polygon vertices and segment midpoints; GPU RGB from isolated draw"};
        }
        static readonly Dictionary<Renderer,LineRenderer> ringSources=new Dictionary<Renderer,LineRenderer>();
        static Renderer RingFor(LineRenderer line){
            if(line==null)return null;var type=typeof(NativeGame).Assembly.GetType("Exoduser.UnityPort.NativeGroundSkillSurface");if(type==null)return null;
            var method=type.GetMethod("RingSurface",BindingFlags.Static|BindingFlags.Public,null,new[]{typeof(LineRenderer)},null);if(method==null)return null;
            var draw=method.Invoke(null,new object[]{line}) as Renderer;if(draw!=null){ringSources[draw]=line;var parent=line.transform.parent;if(parent!=null){foreach(var source in parent.GetComponentsInChildren<SpriteRenderer>(true)){var body=SurfaceFor(source) as MeshRenderer;var filter=draw.GetComponent<MeshFilter>();if(body!=null&&filter!=null&&body.GetComponent<MeshFilter>().sharedMesh==filter.sharedMesh){drawSources[draw]=source;break;}}}}return draw;
        }
        sealed class RingGpuImage {public Color[] pixels;public int width,height,positive;public float maxRgb;}
        static RingGpuImage RenderRingContribution(Renderer renderer){
            if(contributionCamera==null||!SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBFloat)||!SystemInfo.SupportsTextureFormat(TextureFormat.RGBAFloat))throw new NotSupportedException("Actual ring float GPU contribution unavailable");
            var target=new RenderTexture(1920,1080,24,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear);Texture2D readback=null;var old=RenderTexture.active;bool srgb=GL.sRGBWrite;var cmd=new UnityEngine.Rendering.CommandBuffer{name="QA isolated actual ring contribution"};
            try{if(!target.Create())throw new InvalidOperationException("Ring float target failed");GL.sRGBWrite=false;cmd.SetRenderTarget(target);cmd.ClearRenderTarget(true,true,Color.clear,SystemInfo.usesReversedZBuffer?0f:1f);cmd.SetViewport(new Rect(0,0,1920,1080));cmd.SetViewProjectionMatrices(contributionCamera.worldToCameraMatrix,GL.GetGPUProjectionMatrix(contributionCamera.projectionMatrix,true));cmd.DrawRenderer(renderer,renderer.sharedMaterial,0,0);Graphics.ExecuteCommandBuffer(cmd);
                RenderTexture.active=target;readback=new Texture2D(1920,1080,TextureFormat.RGBAFloat,false,true);readback.ReadPixels(new Rect(0,0,1920,1080),0,0);readback.Apply(false,false);
                var image=new RingGpuImage{width=1920,height=1080,pixels=readback.GetPixels()};foreach(var color in image.pixels){float max=Mathf.Max(color.r,Mathf.Max(color.g,color.b));if(float.IsNaN(max)||float.IsInfinity(max))throw new InvalidOperationException("Nonfinite actual ring GPU RGB");if(max>0)image.positive++;image.maxRgb=Mathf.Max(image.maxRgb,max);}return image;
            }finally{cmd.Release();GL.sRGBWrite=srgb;RenderTexture.active=old;if(readback!=null)Destroy(readback);target.Release();Destroy(target);}
        }
        static bool RingSupport(Vector3[] vertices,int[] triangles,Vector2 localXZ,out Vector3 point){
            for(int i=0;i+2<triangles.Length;i+=3){var a=vertices[triangles[i]];var b=vertices[triangles[i+1]];var c=vertices[triangles[i+2]];double bx=b.x-a.x,bz=b.z-a.z,cx=c.x-a.x,cz=c.z-a.z,det=bx*cz-bz*cx;if(Math.Abs(det)<1e-14)continue;double dx=localXZ.x-a.x,dz=localXZ.y-a.z,u=(dx*cz-dz*cx)/det,v=(bx*dz-bz*dx)/det;if(u>=-1e-5&&v>=-1e-5&&u+v<=1.00001){point=a+(b-a)*(float)u+(c-a)*(float)v;return true;}}
            point=Vector3.zero;return false;
        }
        static Shape MeasureRing(Renderer renderer,LineRenderer line){Progress("before","MeasureRing",-1,renderer);long start=System.Diagnostics.Stopwatch.GetTimestamp(),overhead=traceOverheadTicks;try{var result=MeasureRingCore(renderer,line);Progress("after","MeasureRing",DiagnosticMs(start,overhead),renderer);return result;}catch(Exception ex){Progress("error","MeasureRing",DiagnosticMs(start,overhead),renderer,ex.ToString());throw;}}
        static Shape MeasureRingCore(Renderer renderer,LineRenderer line){
            var s=new Shape{path=renderer.name,kind="actual polygon ring MeshRenderer",assertionScope="uniform ring shader: actual shared mesh+vertex lift, no body UV/texture alpha assertion",instanceId=renderer.GetEntityId().ToString(),pivot=renderer.transform.position,sortingOrder=renderer.sortingOrder,expectedDrawOffset=.03f};var d=new RingDiagnostic();s.ring=d;
            try{
                var source=SourceFor(renderer);var body=SurfaceFor(source);var mf=renderer.GetComponent<MeshFilter>();var bodyFilter=body==null?null:body.GetComponent<MeshFilter>();if(source==null||mf==null||mf.sharedMesh==null||bodyFilter==null)throw new InvalidOperationException("Actual ring/body/source missing");
                var mesh=mf.sharedMesh;d.sourceLine=line.GetEntityId().ToString();d.bodySource=source.GetEntityId().ToString();d.bodyMesh=bodyFilter.sharedMesh==null?"null":bodyFilter.sharedMesh.GetEntityId().ToString();d.ringMesh=mesh.GetEntityId().ToString();d.sharedBodyMesh=mesh==bodyFilter.sharedMesh;d.bodyRevision=GeometryRevision(source);d.ringRevision=GeometryRevision(SourceFor(renderer));d.sourceForced=line.forceRenderingOff;d.sourceActive=line.gameObject.activeInHierarchy;d.sourceEnabled=line.enabled;d.sourcePoints=line.positionCount;
                var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);d.radius=block.GetFloat("_GroundRingRadius");d.width=block.GetFloat("_GroundRingWidth");d.lift=block.GetFloat("_GroundRingLift");s.opacity=block.GetFloat("_Opacity");Vector4 color=block.GetVector("_GroundRingColor");d.uniformColor=new Color(color.x,color.y,color.z,color.w);d.colorDelta=Mathf.Max(Mathf.Abs(color.x-line.startColor.r),Mathf.Abs(color.y-line.startColor.g),Mathf.Abs(color.z-line.startColor.b),Mathf.Abs(color.w-line.startColor.a),Mathf.Abs(color.x-line.endColor.r),Mathf.Abs(color.y-line.endColor.g),Mathf.Abs(color.z-line.endColor.b),Mathf.Abs(color.w-line.endColor.a));
                d.bodyRadius=EffectiveFloat(body,"_GroundRingRadius");d.sourceRadius=EffectiveFloat(source,"_GroundRingRadius");d.sourceLineRadius=EffectiveFloat(line,"_GroundRingRadius");s.groundRingRadius=d.radius;s.sourceGroundRingRadius=d.sourceRadius;s.sourceEntity=d.bodySource;s.geometryRevision=d.bodyRevision;s.groundUvClip=EffectiveFloat(renderer,"_GroundUvClip");s.sourceGroundUvClip=EffectiveFloat(source,"_GroundUvClip");s.groundClipContract=s.groundUvClip==1&&s.sourceGroundUvClip==0&&d.radius>0&&d.bodyRadius==0&&d.sourceRadius==0&&d.sourceLineRadius==0;s.shader=renderer.sharedMaterial==null?"null":renderer.sharedMaterial.shader.name;s.sharedMaterial=renderer.sharedMaterial==null?"null":renderer.sharedMaterial.name;s.materialIdentityPreserved=renderer.sharedMaterial==line.sharedMaterial;s.materialPreserved=s.materialIdentityPreserved;s.color=d.uniformColor;s.sortingPreserved=renderer.sortingOrder==line.sortingOrder&&renderer.sortingLayerID==line.sortingLayerID;
                var local=mesh.vertices;var ringTriangles=mesh.triangles;var raised=new List<Vector3>(local.Length);foreach(var vertex in local)raised.Add(renderer.transform.TransformPoint(vertex+Vector3.up*d.lift));s.vertices=raised.ToArray();s.vertexCount=raised.Count;s.triangleCount=mesh.triangles.Length/3;s.uv=mesh.uv;s.pivotLift=s.pivot.y-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z);s.expectedVertexY=raised.Select(v=>NativeRemodel3D.GroundY(v.x,v.z)+.03f).ToArray();for(int i=0;i<raised.Count;i++){s.maxBiasResidual=Mathf.Max(s.maxBiasResidual,Mathf.Abs(raised[i].y-s.expectedVertexY[i]));s.maxGroundError=Mathf.Max(s.maxGroundError,Mathf.Abs(raised[i].y-NativeRemodel3D.GroundY(raised[i].x,raised[i].z)));}s.interior=MeasureInterior(mesh.triangles,raised,.03f);
                d.original72World=new Vector3[line.positionCount];for(int i=0;i<line.positionCount;i++){var point=line.GetPosition(i);d.original72World[i]=line.useWorldSpace?point:line.transform.TransformPoint(point);var ringLocal=renderer.transform.InverseTransformPoint(d.original72World[i]);d.radiusDelta=Mathf.Max(d.radiusDelta,Mathf.Abs(new Vector2(ringLocal.x,ringLocal.z).magnitude-d.radius));}
                Progress("before","ring-GPU-readback",-1,renderer);long ringGpuStart=System.Diagnostics.Stopwatch.GetTimestamp(),ringGpuOverhead=traceOverheadTicks;var gpu=RenderRingContribution(renderer);Progress("after","ring-GPU-readback",DiagnosticMs(ringGpuStart,ringGpuOverhead),renderer);d.gpuPositivePixels=gpu.positive;d.gpuMaxRgb=gpu.maxRgb;d.gpuVerified=gpu.positive>0;
                var contribution=new ContributionDiagnostic{shader=s.shader,scope="actual ring uniform band GPU-rendered RGB, no texture/vertex color path",verified=d.gpuVerified};s.contribution=contribution;
                Progress("before","ring-144-support",-1,renderer);long supportStart=System.Diagnostics.Stopwatch.GetTimestamp(),supportOverhead=traceOverheadTicks;
                for(int i=0;i<144;i++){
                    float angle=(i/2)*Mathf.PI*2/72;Vector2 xz;if(i%2==0)xz=new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))*d.radius;else{float next=angle+Mathf.PI*2/72;xz=(new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))+new Vector2(Mathf.Cos(next),Mathf.Sin(next)))*(.5f*d.radius);}
                    if(!RingSupport(local,ringTriangles,xz,out var support)){d.missingBandSamples++;continue;}d.bandSamples++;var actual=renderer.transform.TransformPoint(support+Vector3.up*d.lift);float ground=NativeRemodel3D.GroundY(actual.x,actual.z);var screen=contributionCamera.WorldToScreenPoint(actual);Color rgb=Color.clear;if(screen.z>0&&screen.x>=0&&screen.x<1920&&screen.y>=0&&screen.y<1080)rgb=gpu.pixels[Mathf.FloorToInt(screen.y)*1920+Mathf.FloorToInt(screen.x)];
                    if(screen.z>contributionCamera.nearClipPlane&&screen.z<contributionCamera.farClipPlane&&screen.x>=0&&screen.x<1920&&screen.y>=0&&screen.y<1080){d.gpuBandScreenSamples++;if(Mathf.Max(rgb.r,Mathf.Max(rgb.g,rgb.b))>0)d.gpuBandPositiveSamples++;}
                    var probe=new ContributionProbe{actualPoint=actual,expectedPoint=new Vector3(actual.x,ground+.03f,actual.z),actualScreen1920=screen,expectedScreen1920=contributionCamera.WorldToScreenPoint(new Vector3(actual.x,ground+.03f,actual.z)),expectedGround=ground,expectedDrawY=ground+.03f,signedResidual=actual.y-ground-.03f,insideFootprint=true,textureSampled=false,vertexAlpha=1,flatTintAlpha=1,opacityApplied=1,potentialRGB=new Vector3(rgb.r,rgb.g,rgb.b),potentialMax=Mathf.Max(rgb.r,Mathf.Max(rgb.g,rgb.b))};d.band.Add(probe);contribution.worstRaw.Add(probe);if(probe.potentialMax>0)contribution.positive.Add(probe);if(probe.potentialMax>=1f/255)contribution.oneByte.Add(probe);if(probe.potentialMax>=.01f)contribution.onePercent.Add(probe);
                }
                Progress("after","ring-144-support",DiagnosticMs(supportStart,supportOverhead),renderer);
                if(RingSupport(local,ringTriangles,Vector2.zero,out var centerSupport)){
                    d.centerActualPoint=renderer.transform.TransformPoint(centerSupport+Vector3.up*d.lift);d.centerScreen=contributionCamera.WorldToScreenPoint(d.centerActualPoint);var screen=d.centerScreen;
                    d.centerMeasured=screen.z>contributionCamera.nearClipPlane&&screen.z<contributionCamera.farClipPlane&&screen.x>=0&&screen.x<1920&&screen.y>=0&&screen.y<1080&&d.radius*Mathf.Cos(Mathf.PI/72)>d.width*2;
                    if(d.centerMeasured)d.centerRgb=gpu.pixels[Mathf.FloorToInt(screen.y)*1920+Mathf.FloorToInt(screen.x)];
                }
                d.gpuRingMaskVerified=d.gpuVerified&&d.centerMeasured&&Mathf.Max(Mathf.Abs(d.centerRgb.r),Mathf.Abs(d.centerRgb.g),Mathf.Abs(d.centerRgb.b))<=1e-6f&&d.gpuBandScreenSamples>0&&d.gpuBandPositiveSamples>0;
                contribution.verified=d.gpuRingMaskVerified;if(!d.gpuRingMaskVerified){d.error="Actual ring mask not verified: require covered/in-frustum black centre and nonzero actual band probes";contribution.error=d.error;}
                d.band.Finish();contribution.worstRaw.Finish();contribution.positive.Finish();contribution.oneByte.Finish();contribution.onePercent.Finish();
                d.verified=d.sharedBodyMesh&&d.bodyRevision>=0&&d.ringRevision==d.bodyRevision&&d.sourceForced&&d.sourceActive&&d.sourceEnabled&&d.sourcePoints==72&&renderer.enabled&&!renderer.forceRenderingOff&&renderer.gameObject.activeInHierarchy&&s.materialPreserved&&s.sortingPreserved&&s.groundClipContract&&s.shader=="EXODUSER/SkillAdditive"&&EffectiveFloat(renderer,"_DstBlend")==1&&Mathf.Abs(d.width-.03f)<1e-6f&&Mathf.Abs(d.lift-.005f)<1e-6f&&d.radius>0&&d.radiusDelta<1e-4f&&d.colorDelta<1e-5f&&d.gpuRingMaskVerified&&d.bandSamples==144&&d.missingBandSamples==0&&d.band.maxAbs<=.02f&&s.maxBiasResidual<=.02f&&Mathf.Abs(s.pivotLift)<.02f;
                s.passed=d.verified;
            }catch(Exception ex){d.error=ex.ToString();d.verified=false;s.passed=false;}return s;
        }
        [Serializable] sealed class ProgressRow {
            public string utc,site,consumer,phase,eventType,step,renderer,error;public double realtimeSeconds,monotonicSeconds,completedMs=-1;public int frame,draws,uniqueMeshes,vertices,triangles,revisionMax=-1,revisionObserved;
        }
        static GroundPlacementCapture traceOwner;static string traceSite="startup",traceConsumer="startup",tracePhase="startup";static long traceOverheadTicks;
        static double DiagnosticMs(long start,long priorOverhead){return Math.Max(0,(System.Diagnostics.Stopwatch.GetTimestamp()-start-(traceOverheadTicks-priorOverhead))*1000.0/System.Diagnostics.Stopwatch.Frequency);}
        static void Progress(string eventType,string step,double completedMs=-1,Renderer renderer=null,string error=null){
            var owner=traceOwner;if(owner==null||!Has("--unity-ground-placement-capture")||string.IsNullOrEmpty(owner.output)||!Directory.Exists(owner.output))return;
            long overhead=System.Diagnostics.Stopwatch.GetTimestamp();
            try{
                var row=new ProgressRow{utc=DateTime.UtcNow.ToString("O"),realtimeSeconds=Time.realtimeSinceStartupAsDouble,monotonicSeconds=System.Diagnostics.Stopwatch.GetTimestamp()/(double)System.Diagnostics.Stopwatch.Frequency,frame=Time.frameCount,site=traceSite,consumer=traceConsumer,phase=tracePhase,eventType=eventType,step=step,completedMs=completedMs,renderer=renderer==null?null:renderer.name,error=error};
                var display=new HashSet<Renderer>();if(renderer!=null)display.Add(renderer);else if(owner.game!=null)Collect(owner.Field("skillView"),display,new HashSet<object>());
                var meshes=new HashSet<Mesh>();foreach(var draw in display)if(draw!=null&&draw.enabled&&!draw.forceRenderingOff&&draw.gameObject.activeInHierarchy){row.draws++;var filter=draw.GetComponent<MeshFilter>();if(filter!=null&&filter.sharedMesh!=null&&meshes.Add(filter.sharedMesh)){var mesh=filter.sharedMesh;row.vertices+=mesh.vertexCount;for(int sub=0;sub<mesh.subMeshCount;sub++)row.triangles+=(int)(mesh.GetIndexCount(sub)/3);}int revision=GeometryRevision(SourceFor(draw));if(revision>=0){row.revisionObserved++;row.revisionMax=Math.Max(row.revisionMax,revision);}}row.uniqueMeshes=meshes.Count;
                var bytes=Encoding.UTF8.GetBytes(JsonUtility.ToJson(row,false)+"\n");using(var stream=new FileStream(Path.Combine(owner.output,"ground-progress.jsonl"),FileMode.Append,FileAccess.Write,FileShare.ReadWrite)){stream.Write(bytes,0,bytes.Length);stream.Flush(true);}
            }catch(Exception ex){Debug.LogWarning("GROUND_PROGRESS_WRITE_OR_SUMMARY_FAILED "+ex.Message);}finally{traceOverheadTicks+=System.Diagnostics.Stopwatch.GetTimestamp()-overhead;}
        }
        sealed class GeometryProbeBudgetException : Exception {public GeometryProbeBudgetException(string message):base(message){}}
        [Serializable] sealed class GeometryProbeCase {
            public string version,implementationType,sourceCommit,name,status="not-started",error;public int wrapperCalls,heightCalls,vertices,triangles,omitted;public double elapsedMs;public bool wallBudgetExceeded;
            public Vector2 minXZ,maxXZ,lastRequestedXZ;public Vector3 lastSuccessfulXYZ;
        }
        [Serializable] sealed class GeometrySpriteMetadata {
            public bool prepared,requestedExtentFound;public string radiusSourceFunction="SkillRules.SpikeTrapRadius(1)",error,sprite,texture;public int level,tickCount;public float coreRadius,pixelsPerUnit,worldWidth,worldHeight,requestedExtent;public Rect rect;public Vector3 scale,position;
        }
        [Serializable] sealed class GeometryProbeReceipt {
            public Vector2 coreCenter=new Vector2(4020,7700);public float left=-4.25f,bottom=-4.25f,probeWidth=8.5f,probeHeight=8.5f,roll=0,heightBudgetSeconds=2;public int heightWrapperBudget=100000,geometryMethodInvocations,projectionInvocations;public bool gameFieldExists,nativeGameFieldSame;public bool diagnosticOnly=true,fieldExists,forestA2,active,originalReferenceSame,originalStateSame,writersPausedForQuit,completed;
            public string cloneGeometrySource="3c827c1195ff1fb8c4bc5501de99af33c615d8d1",productGeometrySource="6e3ca9a1cb5083ba30c97b4d0b91e6491249bd9d";public int expectedCases=6;public string mode="bounded public Tessellate reflection diagnostic; not product/QA PASS",source,stage,error,cleanupError,device,api,terrainName,fieldType,runtimeDllSha,coreDllSha,originalBefore,originalAfter;
            public string budgetContract="2 seconds or 100000 wrapper calls, checked at height-call boundary; cannot interrupt a single height call or non-height work";
            public int exitCode=2,simulationTickInvocations,width,height,originalTickBefore,originalTickAfter;public bool listenerPaused;public float listenerVolume,peak;public int directVideo;
            public GeometrySpriteMetadata spike=new GeometrySpriteMetadata();public float[] sameXyzHeights=new float[3];public List<GeometryProbeCase> cases=new List<GeometryProbeCase>();
        }
        sealed class HeightProbe {
            public readonly GeometryProbeCase row;readonly Func<float,float,float> source;readonly System.Diagnostics.Stopwatch clock;
            public HeightProbe(GeometryProbeCase row,Func<float,float,float> source,System.Diagnostics.Stopwatch clock){this.row=row;this.source=source;this.clock=clock;}
            public float Height(float x,float z){
                row.wrapperCalls++;row.lastRequestedXZ=new Vector2(x,z);if(row.wrapperCalls==1){row.minXZ=row.maxXZ=row.lastRequestedXZ;}else{row.minXZ=Vector2.Min(row.minXZ,row.lastRequestedXZ);row.maxXZ=Vector2.Max(row.maxXZ,row.lastRequestedXZ);}
                if(clock.Elapsed.TotalSeconds>=2||row.wrapperCalls>=100000)throw new GeometryProbeBudgetException("Diagnostic height boundary budget reached");
                row.heightCalls++;float y=source(x,z);row.lastSuccessfulXYZ=new Vector3(x,y,z);return y;
            }
        }
        sealed class ProbeVersion {public string label,sourceCommit;public MethodInfo method;}
        GeometryProbeReceipt geometryProbe;ProbeVersion[] geometryProbeVersions;Func<float,float,float> actualProbeHeight;
        void WriteGeometryProbe(string stage){geometryProbe.stage=stage;File.WriteAllText(Path.Combine(output,"ground-geometry-probe.json"),JsonUtility.ToJson(geometryProbe,true));}
        IEnumerator GeometryProbeMode(){
            output=Arg("-output");AudioListener.pause=true;AudioListener.volume=0;
            geometryProbe=new GeometryProbeReceipt{source=Arg("-source-sha"),device=SystemInfo.graphicsDeviceName,api=SystemInfo.graphicsDeviceType.ToString()};
            var body=GeometryProbeBody();
            while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){geometryProbe.error=ex.ToString();break;}if(!next)break;yield return current;}
            try{(body as IDisposable)?.Dispose();}catch(Exception ex){geometryProbe.cleanupError=(geometryProbe.cleanupError??"")+ex;}
            geometryProbe.width=Screen.width;geometryProbe.height=Screen.height;geometryProbe.listenerPaused=AudioListener.pause;geometryProbe.listenerVolume=AudioListener.volume;
            var audio=new float[1024];AudioListener.GetOutputData(audio,0);foreach(float value in audio)geometryProbe.peak=Mathf.Max(geometryProbe.peak,Mathf.Abs(value));
            foreach(var video in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())if(video.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)geometryProbe.directVideo++;
            geometryProbe.runtimeDllSha=Dll(typeof(NativeGame));geometryProbe.coreDllSha=Dll(typeof(Simulation));
            geometryProbe.completed=geometryProbe.cases.Count==6;geometryProbe.exitCode=geometryProbe.completed&&geometryProbe.cases.All(c=>c.status=="completed")&&geometryProbe.originalReferenceSame&&geometryProbe.originalStateSame&&string.IsNullOrEmpty(geometryProbe.error)&&string.IsNullOrEmpty(geometryProbe.cleanupError)?0:2;
            try{if(Directory.Exists(output))WriteGeometryProbe("diagnostic-final");}catch(Exception ex){Debug.LogError("GEOMETRY_PROBE_RECEIPT_FAILED "+ex);geometryProbe.exitCode=2;}
            yield return new WaitForSecondsRealtime(1);Debug.Log("QA_MEDIA_DRAIN_COMPLETE GEOMETRY_PROBE");Application.Quit(geometryProbe.exitCode);
        }
        IEnumerator GeometryProbeBody(){
            if(!NativeQaSandbox.Active||!Path.IsPathRooted(output))throw new InvalidOperationException("Explicit absolute sandbox/output required");
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0)throw new InvalidOperationException("Geometry output must be empty");Directory.CreateDirectory(output);WriteGeometryProbe("field-entry-before");
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);float deadline=Time.realtimeSinceStartup+60;bool entered=false;
            while(Time.realtimeSinceStartup<deadline){game=FindAnyObjectByType<NativeGame>();if(game!=null&&game.Simulation!=null&&!entered){var lobby=Field("lobby");var flow=lobby.GetType().GetProperty("Flow").GetValue(lobby);flow.GetType().GetMethod("ShowLobby").Invoke(flow,null);flow.GetType().GetMethod("SelectPreview").Invoke(flow,null);if(!(bool)lobby.GetType().GetMethod("EnterNativeTest").Invoke(lobby,null))throw new InvalidOperationException("Probe field entry failed");entered=true;WriteGeometryProbe("field-ready-wait");}
                if(entered&&NativeRemodel3D.Active&&Field("a2Field")!=null&&Field("r3Cam")!=null)break;yield return null;}
            if(game==null||!entered||!NativeRemodel3D.Active||Field("a2Field")==null)throw new InvalidOperationException("Actual field not ready");
            original=game.Simulation;enabledBefore=game.enabled;runningBefore=game.Running;game.enabled=false;SetRunning(false);lateDriver=Field("r3Late") as Behaviour;if(lateDriver!=null){lateEnabledBefore=lateDriver.enabled;lateDriver.enabled=false;}
            GameObject ownedRoot=null;NativeSkillView ownedView=null;
            try{
                geometryProbe.originalTickBefore=original.TickCount;geometryProbe.originalBefore=State(original);geometryProbe.fieldExists=NativeRemodel3D.Field!=null;geometryProbe.gameFieldExists=Field("a2Field")!=null;geometryProbe.nativeGameFieldSame=ReferenceEquals(NativeRemodel3D.Field,Field("a2Field"));geometryProbe.forestA2=NativeRemodel3D.ForestA2;geometryProbe.active=NativeRemodel3D.Active;geometryProbe.terrainName=NativeRemodel3D.Ground==null?"null":NativeRemodel3D.Ground.name;geometryProbe.fieldType=NativeRemodel3D.Field==null?"null":NativeRemodel3D.Field.GetType().FullName;
                actualProbeHeight=NativeRemodel3D.GroundY;
                var signature=new[]{typeof(float),typeof(float),typeof(float),typeof(float),typeof(float),typeof(float),typeof(double),typeof(Func<float,float,float>)};
                var assembly=typeof(NativeGame).Assembly;var cloneType=assembly.GetType("Exoduser.UnityPort.QaDiagnostics.Original3c.NativeGroundSkillGeometry");var productType=assembly.GetType("Exoduser.UnityPort.NativeGroundSkillGeometry");if(cloneType==null||productType==null)throw new MissingMethodException("Pure clone3c/product6e geometry type absent");
                geometryProbeVersions=new[]{new ProbeVersion{label="clone3c",sourceCommit=geometryProbe.cloneGeometrySource,method=cloneType.GetMethod("Tessellate",BindingFlags.Public|BindingFlags.Static,null,signature,null)},new ProbeVersion{label="product6e",sourceCommit=geometryProbe.productGeometrySource,method=productType.GetMethod("Tessellate",BindingFlags.Public|BindingFlags.Static,null,signature,null)}};
                if(geometryProbeVersions.Any(v=>v.method==null))throw new MissingMethodException("Versioned public Tessellate signature absent");
                WriteGeometryProbe("paused-height-repeat-before");for(int i=0;i<3;i++)geometryProbe.sameXyzHeights[i]=actualProbeHeight(40.2f,-77f);WriteGeometryProbe("paused-height-repeat-after");
                WriteGeometryProbe("sprite-prepare-before");var visualSample=new Simulation(new SimulationConfig(),0x671403u);float radius=(float)Exoduser.UnityPort.Core.Skills.SkillRules.SpikeTrapRadius(1);visualSample.FireZones.Add(new FireZone{Id=93001,Type="spikeTrap",Lv=1,X=4020,Y=7700,R=radius,T=30,MaxT=180});
                ownedRoot=new GameObject("QA geometry probe source metadata");ownedView=new NativeSkillView(ownedRoot.transform);ownedView.Update(visualSample,Time.time);
                var sprite=ownedRoot.GetComponentsInChildren<SpriteRenderer>(true).FirstOrDefault(r=>r.name=="thorn"&&r.sprite!=null);if(sprite==null)throw new InvalidOperationException("Actual R300 spike source sprite missing");var metadata=geometryProbe.spike;metadata.prepared=true;metadata.level=1;metadata.coreRadius=radius;metadata.sprite=sprite.sprite.name;metadata.texture=sprite.sprite.texture.name;metadata.rect=sprite.sprite.rect;metadata.pixelsPerUnit=sprite.sprite.pixelsPerUnit;metadata.scale=sprite.transform.lossyScale;metadata.position=sprite.transform.position;metadata.worldWidth=metadata.rect.width/metadata.pixelsPerUnit*metadata.scale.x;metadata.worldHeight=metadata.rect.height/metadata.pixelsPerUnit*metadata.scale.y;metadata.tickCount=visualSample.TickCount;
                foreach(var component in sprite.GetComponents<Component>())if(component!=null){var requested=component.GetType().GetField("requestedExtent",Flags);if(requested!=null&&requested.FieldType==typeof(float)){metadata.requestedExtent=(float)requested.GetValue(component);metadata.requestedExtentFound=true;break;}}WriteGeometryProbe("sprite-prepare-after");
                foreach(var version in geometryProbeVersions){ProbeGeometryCase(version,"flat0",(x,z)=>0);ProbeGeometryCase(version,"slope",(x,z)=>.1f*x+.1f*z);ProbeGeometryCase(version,"actual-field",actualProbeHeight);}
            }finally{
                try{if(ownedView!=null)ownedView.Dispose();if(ownedRoot!=null)Destroy(ownedRoot);}catch(Exception ex){geometryProbe.cleanupError=ex.ToString();}
                // Never run production UpdateViews, projection Late, or restore/reenable its writer in this mode.
                if(original!=null){if(!ReferenceEquals(game.Simulation,original))typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true).Invoke(game,new object[]{original});geometryProbe.originalTickAfter=original.TickCount;geometryProbe.originalAfter=State(original);geometryProbe.originalReferenceSame=ReferenceEquals(game.Simulation,original);geometryProbe.originalStateSame=geometryProbe.originalBefore==geometryProbe.originalAfter;}
                geometryProbe.writersPausedForQuit=game!=null&&!game.enabled&&!game.Running&&(lateDriver==null||!lateDriver.enabled);WriteGeometryProbe("original-reference-restored-writers-paused");
            }
        }
        void ProbeGeometryCase(ProbeVersion version,string name,Func<float,float,float> height){
            var row=new GeometryProbeCase{version=version.label,implementationType=version.method.DeclaringType.FullName,sourceCommit=version.sourceCommit,name=name,status="running"};geometryProbe.cases.Add(row);WriteGeometryProbe(version.label+"-"+name+"-before");var clock=System.Diagnostics.Stopwatch.StartNew();var probe=new HeightProbe(row,height,clock);
            try{
                geometryProbe.geometryMethodInvocations++;var result=version.method.Invoke(null,new object[]{4020f,7700f,-4.25f,-4.25f,8.5f,8.5f,0.0,new Func<float,float,float>(probe.Height)});var type=result.GetType();row.vertices=((Array)type.GetField("Vertices").GetValue(result)).Length;row.triangles=((Array)type.GetField("Triangles").GetValue(result)).Length/3;row.omitted=(int)type.GetField("OmittedTriangles").GetValue(result);row.status="completed";
            }catch(Exception ex){var cause=ex is TargetInvocationException&&ex.InnerException!=null?ex.InnerException:ex;row.status=cause is GeometryProbeBudgetException?"diagnostic-budget-stop":"exception";row.error=cause.ToString();}
            finally{clock.Stop();row.elapsedMs=clock.Elapsed.TotalMilliseconds;row.wallBudgetExceeded=row.elapsedMs>=2000;if(row.status=="completed"&&row.wallBudgetExceeded)row.status="completed-after-wall-budget-boundary";File.WriteAllText(Path.Combine(output,"geometry-probe-case-"+version.label+"-"+name+".json"),JsonUtility.ToJson(row,true));WriteGeometryProbe(version.label+"-"+name+"-after");}
        }
        [Serializable] sealed class ReceiverSmokeInputs {
            public string sourceEntity,drawEntity,sourceShader,drawShader,texture,graphicsFormat,filterMode,wrapMode,activeColorSpace;
            public bool materialIdentity,sourceOpacityPresent,sourceFlatPresent,texturePreserved,usesReceiverDepth,sourceEnabled,sourceForceOff,drawEnabled,drawForceOff,drawActive;
            public int sourceMode,mipCount,textureWidth,textureHeight,proxyVertices,proxyTriangles,geometryRevision,textureAnisoLevel;public string anisotropicFiltering;
            public float originalOpacityRaw,originalFlatRaw,flat,opacity,normalBlend,destinationBlend,ringRadius,pixelsPerUnit,rollDegrees;
            public Color sourceColor;public Rect sourceRect;public Vector3 sourcePosition,sourceScale,volumePosition,volumeScale;public Vector4 tint,anchor,u,v,atlas;
        }
        [Serializable] sealed class ReceiverSmokeFrame {
            public int frame;public double realtime;public Vector2Int frameSize;public int serial,receiverCount,volumeCount;public bool available;public string apiError,inputHash;public ReceiverSmokeInputs inputs;public Matrix4x4 cameraView,cameraProjection;
        }
        [Serializable] sealed class ReceiverSmokeSample {
            public int pixelX,pixelY;public Color actual,textureRgba,expectedRgba;public Vector3 world;public Vector2 normalizedUv;
            public float expectedWeight,weightError,maxRgbError,cpuGroundDifference;public bool compared;
            public Vector2 capturedDx,capturedDy,modelQuadDx,modelQuadDy;public bool capturedDerivativeValid,modelQuadValid;public Vector2Int modelQuadOrigin;public Color[] modelQuadPixels;public Vector2 modelDx,modelDy;public bool modelDerivativeValid,modelPassed,modelRgbaCompared,modelRgbaPassed;public Color modelSourceRgba,modelExpectedRgba,modelMode4Actual;public float modelExpectedWeight,modelExpectedMaxRgb,modelWeightError,modelRgbError,modelRgbaError;
            public Vector2 referenceDx,referenceDy;public bool referenceDerivativesValid;public Color referenceLevelRgba,referenceGradRgba,referenceLevelExpectedRgba,referenceGradExpectedRgba,referenceLoadBilinear,referenceLoadExpectedRgba;public Color[] referenceLoadedTexels,referenceCachedTexels;public float referenceLevelWeight,referenceGradWeight,referenceLoadWeight,referenceLevelWeightError,referenceGradWeightError,referenceLevelCacheAlphaError,referenceLoadCacheAlphaError,referenceLoadCacheRgbError;
        }
        [Serializable] sealed class ReceiverSmokeBuffer {
            public int mode,requestSerial,completedSerial,width,height,positiveWeight,nonzeroRgb,nonfinite,outsideXz,outsideUv,depthFailures,comparedSamples;
            public bool passed,readbackCompleted,targetStillCreatedAfterCancel,fullRgbaSameFrameCompared=false,mode2ComparisonOnlyFailure;public ReceiverSamplerDiagnostic samplerDiagnostic;
            public string stage,error,rawPath,rawSha256,layout="ReadPixels bottom-left row-major little-endian RGBA float32",comparisonScope;
            public double waitMs;public float maxDepthDifference,maxAlpha,maxWeightError,maxRgbError;public ReceiverSmokeFrame requested,completed;
            public List<ReceiverSmokeSample> samples=new List<ReceiverSmokeSample>();
        }
        [Serializable] sealed class ReceiverSmokeReceipt {
            public string mode="single soil receiver-depth smoke; no legacy vertex-contact verdict",productSource="8f391fea6f157433fcaea2df611d0a9b146c6604",source,stage,error,cleanupError,device,api,runtimeSha,coreSha,originalBefore,originalAfter,screenShot,direct3840,direct3840Error;
            public bool smokePassed,legacySmokePassed,correctedModelPassed,originalReferenceSame,originalStateSame,writersPausedForQuit,metadataPassed,legacyCoverageExecuted=false,fullRgbaSameFrameVerified=false,listenerPaused;
            public string rgbaScope="mode2 same-frame UV/PB verifies expected weight/maxRGB; mode4 captures independent-frame RGBA and additive alpha0; no cross-mode pixel alignment claim",visualVerdict="UNREVIEWED";
            public int width,height,nativeUpdateCalls,nativeLateCalls,directVideo,exitCode=2,level=1;public float actualRadius,listenerVolume,peak,actualDrawBias=0;public double updateMs,lateMs;
            public ReceiverSmokeFrame setup;public List<ReceiverSmokeBuffer> buffers=new List<ReceiverSmokeBuffer>();
        }
        ReceiverSmokeReceipt receiverSmoke;Type receiverApi;MethodInfo receiverRequest,receiverCancel;Dictionary<string,PropertyInfo> receiverProperties;
        SpriteRenderer smokeSource;Renderer smokeDraw;Component smokeSurface;PropertyInfo smokeUsesDepth,smokeRevision;
        object ReceiverValue(string name){return receiverProperties[name].GetValue(null);}
        void SaveReceiverSmoke(string stage){receiverSmoke.stage=stage;File.WriteAllText(Path.Combine(output,"ground-receiver-smoke.json"),JsonUtility.ToJson(receiverSmoke,true));}
        void CheckReceiverApi(Vector2Int expected){
            if(!(bool)ReceiverValue("Available"))throw new InvalidOperationException("Projection API unavailable: "+ReceiverValue("Error"));
            if(!string.IsNullOrEmpty((string)ReceiverValue("Error")))throw new InvalidOperationException("Projection API error: "+ReceiverValue("Error"));
            if((Vector2Int)ReceiverValue("FrameSize")!=expected)throw new InvalidOperationException("FrameSize changed during receiver probe");
        }
        ReceiverSmokeFrame SmokeFrame(){
            var sourceBlock=new MaterialPropertyBlock();smokeSource.GetPropertyBlock(sourceBlock);var block=new MaterialPropertyBlock();smokeDraw.GetPropertyBlock(block);var material=smokeSource.sharedMaterial;var sprite=smokeSource.sprite;var texture=sprite.texture;var filter=smokeDraw.GetComponent<MeshFilter>();
            var data=new ReceiverSmokeInputs{sourceEntity=smokeSource.GetEntityId().ToString(),drawEntity=smokeDraw.GetEntityId().ToString(),sourceShader=material.shader.name,drawShader=smokeDraw.sharedMaterial.shader.name,materialIdentity=material==smokeDraw.sharedMaterial,texture=texture.name,texturePreserved=block.GetTexture("_MainTex")==texture,graphicsFormat=texture.graphicsFormat.ToString(),filterMode=texture.filterMode.ToString(),wrapMode=texture.wrapMode.ToString(),activeColorSpace=QualitySettings.activeColorSpace.ToString(),mipCount=texture.mipmapCount,textureWidth=texture.width,textureHeight=texture.height,textureAnisoLevel=texture.anisoLevel,anisotropicFiltering=QualitySettings.anisotropicFiltering.ToString(),
                sourceOpacityPresent=sourceBlock.HasFloat(Shader.PropertyToID("_Opacity"))||material.HasProperty("_Opacity"),sourceFlatPresent=sourceBlock.HasFloat(Shader.PropertyToID("_Flat"))||material.HasProperty("_Flat"),originalOpacityRaw=sourceBlock.HasFloat(Shader.PropertyToID("_Opacity"))?sourceBlock.GetFloat("_Opacity"):material.HasProperty("_Opacity")?material.GetFloat("_Opacity"):0,originalFlatRaw=sourceBlock.HasFloat(Shader.PropertyToID("_Flat"))?sourceBlock.GetFloat("_Flat"):material.HasProperty("_Flat")?material.GetFloat("_Flat"):0,
                sourceMode=(int)block.GetFloat("_SourceMode"),flat=block.GetFloat("_Flat"),opacity=block.GetFloat("_Opacity"),normalBlend=block.GetFloat("_NormalBlend"),destinationBlend=smokeDraw.sharedMaterial.GetFloat("_DstBlend"),ringRadius=block.GetFloat("_GroundRingRadius"),tint=block.GetVector("_SourceTint"),anchor=block.GetVector("_GroundAnchor"),u=block.GetVector("_GroundUvU"),v=block.GetVector("_GroundUvV"),atlas=block.GetVector("_GroundUvRect"),sourceColor=smokeSource.color,sourceRect=sprite.rect,pixelsPerUnit=sprite.pixelsPerUnit,sourcePosition=smokeSource.transform.position,sourceScale=smokeSource.transform.lossyScale,rollDegrees=smokeSource.transform.eulerAngles.z,volumePosition=smokeDraw.transform.position,volumeScale=smokeDraw.transform.lossyScale,
                sourceEnabled=smokeSource.enabled,sourceForceOff=smokeSource.forceRenderingOff,drawEnabled=smokeDraw.enabled,drawForceOff=smokeDraw.forceRenderingOff,drawActive=smokeDraw.gameObject.activeInHierarchy,usesReceiverDepth=(bool)smokeUsesDepth.GetValue(smokeSurface),geometryRevision=smokeRevision==null?-1:(int)smokeRevision.GetValue(smokeSurface),proxyVertices=filter==null||filter.sharedMesh==null?0:filter.sharedMesh.vertexCount,proxyTriangles=filter==null||filter.sharedMesh==null?0:filter.sharedMesh.triangles.Length/3};
            var camera=game.Remodel3DCamera;return new ReceiverSmokeFrame{frame=Time.frameCount,realtime=Time.realtimeSinceStartupAsDouble,frameSize=(Vector2Int)ReceiverValue("FrameSize"),serial=(int)ReceiverValue("ProbeSerial"),receiverCount=(int)ReceiverValue("ReceiverCount"),volumeCount=(int)ReceiverValue("ActiveVolumeCount"),available=(bool)ReceiverValue("Available"),apiError=(string)ReceiverValue("Error"),inputs=data,inputHash=Sha(Encoding.UTF8.GetBytes(JsonUtility.ToJson(data))),cameraView=camera.worldToCameraMatrix,cameraProjection=camera.projectionMatrix};
        }
        IEnumerator ReceiverSmokeMode(){
            output=Arg("-output");AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;receiverSmoke=new ReceiverSmokeReceipt{source=Arg("-source-sha"),device=SystemInfo.graphicsDeviceName,api=SystemInfo.graphicsDeviceType.ToString()};var body=ReceiverSmokeBody();
            while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){receiverSmoke.error=ex.ToString();break;}if(!next)break;yield return current;}
            try{(body as IDisposable)?.Dispose();}catch(Exception ex){receiverSmoke.cleanupError=(receiverSmoke.cleanupError??"")+ex;}
            yield return new WaitForSecondsRealtime(1);receiverSmoke.width=Screen.width;receiverSmoke.height=Screen.height;receiverSmoke.listenerPaused=AudioListener.pause;receiverSmoke.listenerVolume=AudioListener.volume;var audio=new float[1024];AudioListener.GetOutputData(audio,0);foreach(float value in audio)receiverSmoke.peak=Mathf.Max(receiverSmoke.peak,Mathf.Abs(value));foreach(var video in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())if(video.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receiverSmoke.directVideo++;
            receiverSmoke.runtimeSha=Dll(typeof(NativeGame));receiverSmoke.coreSha=Dll(typeof(Simulation));receiverSmoke.correctedModelPassed=receiverSamplerModel!=null&&receiverSamplerModel.passed&&receiverExact!=null&&receiverExact.passed;receiverSmoke.legacySmokePassed=string.IsNullOrEmpty(receiverSmoke.error)&&string.IsNullOrEmpty(receiverSmoke.cleanupError)&&receiverSmoke.metadataPassed&&receiverSmoke.buffers.Count==4&&receiverSmoke.buffers.All(b=>b.passed&&b.targetStillCreatedAfterCancel)&&receiverSmoke.originalReferenceSame&&receiverSmoke.originalStateSame&&receiverSmoke.writersPausedForQuit&&receiverSmoke.api=="Metal"&&receiverSmoke.width==1920&&receiverSmoke.height==1080&&receiverSmoke.listenerPaused&&receiverSmoke.listenerVolume==0&&receiverSmoke.peak==0&&receiverSmoke.directVideo==0;receiverSmoke.smokePassed=string.IsNullOrEmpty(receiverSmoke.error)&&string.IsNullOrEmpty(receiverSmoke.cleanupError)&&receiverSmoke.metadataPassed&&receiverSmoke.buffers.Count==4&&receiverSmoke.buffers.All(b=>b.targetStillCreatedAfterCancel&&(b.mode==2?receiverSmoke.correctedModelPassed:b.passed))&&receiverSmoke.originalReferenceSame&&receiverSmoke.originalStateSame&&receiverSmoke.writersPausedForQuit&&receiverSmoke.api=="Metal"&&receiverSmoke.width==1920&&receiverSmoke.height==1080&&receiverSmoke.listenerPaused&&receiverSmoke.listenerVolume==0&&receiverSmoke.peak==0&&receiverSmoke.directVideo==0;receiverSmoke.exitCode=receiverSmoke.smokePassed?0:2;
            try{if(Directory.Exists(output))SaveReceiverSmoke("final");}catch(Exception ex){Debug.LogError("RECEIVER_SMOKE_RECEIPT_FAILED "+ex);receiverSmoke.exitCode=2;}Debug.Log("QA_MEDIA_DRAIN_COMPLETE RECEIVER_SMOKE");Application.Quit(receiverSmoke.exitCode);
        }
        IEnumerator ReceiverSmokeBody(){
            if(Application.isBatchMode||Has("-ground-geometry-probe")||!NativeQaSandbox.Active||!Path.IsPathRooted(output))throw new InvalidOperationException("Visible receiver smoke requires exclusive mode and absolute sandbox/output");
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0)throw new InvalidOperationException("Smoke output must be empty");Directory.CreateDirectory(output);SaveReceiverSmoke("field-entry-before");Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            float deadline=Time.realtimeSinceStartup+60;bool entered=false;
            while(Time.realtimeSinceStartup<deadline){game=FindAnyObjectByType<NativeGame>();if(game!=null&&game.Simulation!=null&&!entered){var lobby=Field("lobby");var flow=lobby.GetType().GetProperty("Flow").GetValue(lobby);flow.GetType().GetMethod("ShowLobby").Invoke(flow,null);flow.GetType().GetMethod("SelectPreview").Invoke(flow,null);if(!(bool)lobby.GetType().GetMethod("EnterNativeTest").Invoke(lobby,null))throw new InvalidOperationException("Smoke field entry failed");entered=true;SaveReceiverSmoke("field-ready-wait");}if(entered&&NativeRemodel3D.Active&&Field("a2Field")!=null&&Field("r3Cam")!=null)break;yield return null;}
            if(game==null||!entered||!NativeRemodel3D.Active||Field("a2Field")==null)throw new InvalidOperationException("Smoke actual field not ready");
            original=game.Simulation;enabledBefore=game.enabled;runningBefore=game.Running;game.enabled=false;SetRunning(false);lateDriver=Field("r3Late") as Behaviour;if(lateDriver!=null){lateEnabledBefore=lateDriver.enabled;lateDriver.enabled=false;}receiverSmoke.originalBefore=State(original);
            try{
                var lobby=Field("lobby");lobby.GetType().GetMethod("CloseStartupCaptureMedia",Flags).Invoke(lobby,null);((Behaviour)lobby).enabled=false;
                receiverApi=typeof(NativeGame).Assembly.GetType("Exoduser.UnityPort.NativeGroundSkillProjection");if(receiverApi==null)throw new MissingMethodException("Receiver projection API absent; no proxy-contact fallback");receiverRequest=receiverApi.GetMethod("RequestProbe",BindingFlags.Public|BindingFlags.Static,null,new[]{typeof(RenderTexture),typeof(int)},null);receiverCancel=receiverApi.GetMethod("CancelProbe",BindingFlags.Public|BindingFlags.Static,null,Type.EmptyTypes,null);receiverProperties=new Dictionary<string,PropertyInfo>();foreach(string name in new[]{"ProbeSerial","FrameSize","ReceiverCount","ActiveVolumeCount","Error","Available"}){var property=receiverApi.GetProperty(name,BindingFlags.Public|BindingFlags.Static);if(property==null)throw new MissingMemberException(name);receiverProperties.Add(name,property);}if(receiverRequest==null||receiverCancel==null)throw new MissingMethodException("RequestProbe/CancelProbe absent");
                sample=new Simulation(new SimulationConfig(),0x671403u);sample.AttachDruidBoss();sample.Player.X=4020-180;sample.Player.Y=7700+80;float radius=(float)Exoduser.UnityPort.Core.Skills.SkillRules.SpikeTrapRadius(1);receiverSmoke.actualRadius=radius;sample.FireZones.Add(new FireZone{Id=94001,Type="spikeTrap",Lv=1,X=4020,Y=7700,R=radius,T=30,MaxT=180});typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true).Invoke(game,new object[]{sample});
                ((Camera)Field("view")).cullingMask=(int)Field("worldMask");SaveReceiverSmoke("product-update-before");long clock=System.Diagnostics.Stopwatch.GetTimestamp();InvokeRaw("UpdateViews");receiverSmoke.updateMs=ElapsedMs(clock);receiverSmoke.nativeUpdateCalls++;SaveReceiverSmoke("product-update-after-late-before");clock=System.Diagnostics.Stopwatch.GetTimestamp();InvokeRaw("Remodel3DLate");receiverSmoke.lateMs=ElapsedMs(clock);receiverSmoke.nativeLateCalls++;SaveReceiverSmoke("product-late-after");
                var owned=new HashSet<Renderer>();Collect(Field("skillView"),owned,new HashSet<object>());smokeSource=owned.OfType<SpriteRenderer>().FirstOrDefault(r=>r.name=="thorn"&&r.sprite!=null&&r.gameObject.activeInHierarchy);if(smokeSource==null)throw new InvalidOperationException("Actual spike source absent");smokeDraw=SurfaceFor(smokeSource);if(smokeDraw==null)throw new InvalidOperationException("Actual SurfaceRenderer absent");
                foreach(var component in smokeSource.GetComponents<Component>())if(component!=null){var uses=component.GetType().GetProperty("UsesReceiverDepth",Flags);if(uses!=null){smokeSurface=component;smokeUsesDepth=uses;smokeRevision=component.GetType().GetProperty("GeometryRevision",Flags);break;}}if(smokeUsesDepth==null)throw new MissingMemberException("UsesReceiverDepth missing; legacy vertex tests remain separate");
                // A normal rendered frame establishes the public camera descriptor size. No proxy vertex contact test.
                double warmStart=Time.realtimeSinceStartupAsDouble;SaveReceiverSmoke("normal-frame-wait");yield return new WaitForEndOfFrame();double normalFrameWait=Time.realtimeSinceStartupAsDouble-warmStart;receiverSmoke.screenShot=Path.Combine(output,"receiver-smoke-window-1920.png");var firstNormalImage=ScreenCapture.CaptureScreenshotAsTexture();try{File.WriteAllBytes(receiverSmoke.screenShot,firstNormalImage.EncodeToPNG());}finally{Destroy(firstNormalImage);}SaveReceiverSmoke("first-normal-frame-image");if(normalFrameWait>5)throw new TimeoutException("Normal frame wait exceeded 5s at EOF boundary");receiverSmoke.setup=SmokeFrame();var inputs=receiverSmoke.setup.inputs;
                receiverSmoke.metadataPassed=receiverSmoke.actualRadius==300&&inputs.proxyVertices==8&&inputs.proxyTriangles==12&&receiverSmoke.setup.available&&string.IsNullOrEmpty(receiverSmoke.setup.apiError)&&receiverSmoke.setup.receiverCount>0&&receiverSmoke.setup.volumeCount==1&&inputs.usesReceiverDepth&&inputs.sourceEnabled&&inputs.sourceForceOff&&inputs.drawEnabled&&!inputs.drawForceOff&&inputs.drawActive&&inputs.texturePreserved&&!inputs.materialIdentity&&inputs.sourceShader=="EXODUSER/SkillAdditive"&&inputs.drawShader=="EXODUSER/GroundSkillProjection"&&inputs.sourceMode==0&&inputs.normalBlend==0&&inputs.ringRadius==0&&inputs.destinationBlend==1&&Mathf.Abs(inputs.anchor.x-40.2f)<1e-5f&&Mathf.Abs(inputs.anchor.z+77)<1e-5f&&((Vector4)inputs.sourceColor-inputs.tint).sqrMagnitude<1e-10f&&Mathf.Abs(inputs.flat-inputs.originalFlatRaw)<1e-5f&&Mathf.Abs(inputs.opacity-(inputs.sourceOpacityPresent?inputs.originalOpacityRaw:1))<1e-5f;
                SaveReceiverSmoke("normal-frame-ready");if(!receiverSmoke.metadataPassed)throw new InvalidOperationException("Actual receiver source/draw/API metadata gate failed; inspect setup");
                DecodeMip0(smokeSource.sprite.texture);
                foreach(int mode in new[]{1,2,3,4}){var buffer=new ReceiverSmokeBuffer{mode=mode,stage="created"};receiverSmoke.buffers.Add(buffer);var routine=CaptureReceiverBuffer(buffer);try{while(routine.MoveNext())yield return routine.Current;}finally{(routine as IDisposable)?.Dispose();}SaveReceiverSmoke("mode-"+mode+"-finished");buffer.mode2ComparisonOnlyFailure=mode==2&&!buffer.passed&&buffer.readbackCompleted&&buffer.targetStillCreatedAfterCancel&&string.IsNullOrEmpty(buffer.error)&&buffer.nonfinite==0&&buffer.completedSerial>buffer.requestSerial&&buffer.requested.inputHash==buffer.completed.inputHash&&buffer.positiveWeight>0&&buffer.outsideUv==0&&buffer.comparedSamples>0&&(buffer.maxWeightError>2f/255||buffer.maxRgbError>2f/255);File.WriteAllText(Path.Combine(output,"receiver-mode"+mode+"-summary.json"),JsonUtility.ToJson(buffer,true));if(!buffer.passed&&!buffer.mode2ComparisonOnlyFailure)throw new InvalidOperationException("Receiver mode "+mode+" failed; inspect mode summary/raw data");}
                var exactRoutine=CaptureReceiverExactDerivatives();try{while(exactRoutine.MoveNext())yield return exactRoutine.Current;}finally{(exactRoutine as IDisposable)?.Dispose();}
                // First normal-frame image was preserved before metadata/probe gates, including failure cases.
                receiverSmoke.direct3840=Path.Combine(output,"receiver-smoke-3840-direct.png");try{CaptureDirect(game.Remodel3DCamera,receiverSmoke.direct3840);}catch(Exception ex){receiverSmoke.direct3840Error=ex.ToString();}
            }finally{
                try{receiverCancel?.Invoke(null,null);}catch(Exception ex){receiverSmoke.cleanupError=ex.ToString();}ReleaseDecodedCache();drawSources.Clear();ringSources.Clear();
                if(original!=null){typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true).Invoke(game,new object[]{original});try{(Field("bossView") as NativeBossView)?.Update(original);(Field("skillView") as NativeSkillView)?.Update(original,Time.time);}catch(Exception ex){receiverSmoke.cleanupError=(receiverSmoke.cleanupError??"")+ex;}receiverSmoke.originalAfter=State(original);receiverSmoke.originalReferenceSame=ReferenceEquals(game.Simulation,original);receiverSmoke.originalStateSame=receiverSmoke.originalBefore==receiverSmoke.originalAfter;}
                receiverSmoke.writersPausedForQuit=game!=null&&!game.enabled&&!game.Running&&(lateDriver==null||!lateDriver.enabled);SaveReceiverSmoke("restored-writers-paused");
            }
        }
        IEnumerator CaptureReceiverBuffer(ReceiverSmokeBuffer buffer){
            var body=CaptureReceiverBufferBody(buffer);
            try{
                while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){buffer.error=(buffer.error??"")+ex;buffer.passed=false;break;}if(!next)break;yield return current;}
            }finally{
                try{(body as IDisposable)?.Dispose();}catch(Exception ex){buffer.error=(buffer.error??"")+"Dispose: "+ex;buffer.passed=false;}
                File.WriteAllText(Path.Combine(output,"receiver-mode"+buffer.mode+"-summary.json"),JsonUtility.ToJson(buffer,true));
            }
        }
        IEnumerator CaptureReceiverBufferBody(ReceiverSmokeBuffer buffer){
            RenderTexture target=null;Texture2D readback=null;var oldActive=RenderTexture.active;
            try{
                buffer.requested=SmokeFrame();var size=buffer.requested.frameSize;buffer.width=size.x;buffer.height=size.y;if(size.x<=0||size.y<=0||!SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBFloat)||!SystemInfo.SupportsTextureFormat(TextureFormat.RGBAFloat))throw new NotSupportedException("Actual FrameSize or RGBAFloat support invalid");CheckReceiverApi(size);
                target=new RenderTexture(size.x,size.y,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear){useMipMap=false,autoGenerateMips=false,antiAliasing=1};if(!target.Create()||target.graphicsFormat.ToString()!="R32G32B32A32_SFloat")throw new InvalidOperationException("Created actual RGBAFloat target required");
                buffer.requestSerial=(int)ReceiverValue("ProbeSerial");buffer.stage="request-before";SaveReceiverSmoke("mode-"+buffer.mode+"-request-before");receiverRequest.Invoke(null,new object[]{target,buffer.mode});buffer.stage="waiting-serial-EOF";SaveReceiverSmoke("mode-"+buffer.mode+"-waiting");double started=Time.realtimeSinceStartupAsDouble;
                while(true){yield return new WaitForEndOfFrame();buffer.waitMs=(Time.realtimeSinceStartupAsDouble-started)*1000;CheckReceiverApi(size);if(buffer.waitMs>5000)throw new TimeoutException("Probe serial/normal-frame wait exceeded 5s; frame-boundary timeout only");if((int)ReceiverValue("ProbeSerial")>buffer.requestSerial)break;}
                buffer.completed=SmokeFrame();buffer.completedSerial=buffer.completed.serial;buffer.stage="serial-increased-EOF-readback";SaveReceiverSmoke("mode-"+buffer.mode+"-read-before");
                RenderTexture.active=target;readback=new Texture2D(size.x,size.y,TextureFormat.RGBAFloat,false,true);readback.ReadPixels(new Rect(0,0,size.x,size.y),0,0);readback.Apply(false,false);RenderTexture.active=oldActive;var pixels=readback.GetPixels();buffer.readbackCompleted=true;
                buffer.rawPath=Path.Combine(output,"receiver-mode"+buffer.mode+".rgba32f");using(var stream=new FileStream(buffer.rawPath,FileMode.CreateNew,FileAccess.Write)){using(var writer=new BinaryWriter(new BufferedStream(stream,1024*1024))){foreach(var pixel in pixels){writer.Write(pixel.r);writer.Write(pixel.g);writer.Write(pixel.b);writer.Write(pixel.a);}writer.Flush();}}
                using(var hash=SHA256.Create())using(var stream=File.OpenRead(buffer.rawPath))buffer.rawSha256=BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
                SummarizeReceiverBuffer(buffer,pixels);if(buffer.mode==2)DiagnoseReceiverSampler(buffer,pixels);if(buffer.mode==4)CompareReceiverModelMode4(buffer,pixels);buffer.passed=buffer.nonfinite==0&&buffer.completedSerial>buffer.requestSerial&&buffer.requested.inputHash==buffer.completed.inputHash;
                if(buffer.mode==1)buffer.passed &= buffer.positiveWeight>0&&buffer.outsideXz==0&&buffer.outsideUv==0;
                if(buffer.mode==2)buffer.passed &= buffer.positiveWeight>0&&buffer.outsideUv==0&&buffer.comparedSamples>0&&buffer.maxWeightError<=2f/255&&buffer.maxRgbError<=2f/255;
                if(buffer.mode==3)buffer.passed &= buffer.positiveWeight>0&&buffer.depthFailures==0&&buffer.maxDepthDifference<=.02f;
                if(buffer.mode==4)buffer.passed &= buffer.nonzeroRgb>0&&buffer.maxAlpha<=1e-6f;
                buffer.stage="readback-summary-complete";
            }finally{
                try{receiverCancel?.Invoke(null,null);if(target!=null){buffer.targetStillCreatedAfterCancel=target.IsCreated();if(!buffer.targetStillCreatedAfterCancel)buffer.passed=false;}}
                catch(Exception ex){buffer.error=(buffer.error??"")+"CancelProbe: "+ex;buffer.passed=false;}
                finally{RenderTexture.active=oldActive;if(readback!=null)Destroy(readback);if(target!=null){target.Release();Destroy(target);}File.WriteAllText(Path.Combine(output,"receiver-mode"+buffer.mode+"-summary.json"),JsonUtility.ToJson(buffer,true));}
            }
        }
        [Serializable] sealed class ReceiverExactDerivatives {
            public string stage,error,rawPath,rawSha256,originalProbeMaterialId,qaProbeMaterialId,shaderSourceSha="4e65d469a6bfc65dc7d8f939e531655982a8b93afc17811018557eb140b17a89",apiContract="extra QA RequestProbe mode3 with temporary private probeMaterial override; RGBA=ddx(packed).xy,ddy(packed).xy; original depth mode3 files unchanged";
            public int requestSerial,completedSerial,width,height,nonfinite;public double waitMs;public bool originalSaved,originalRestored,targetStillCreatedAfterCancel,displayMaterialsUnchanged,snapshotCompatible,passed;public ReceiverSmokeFrame requested,completed;
        }
        ReceiverExactDerivatives receiverExact;
        void SaveReceiverExact(string stage){receiverExact.stage=stage;File.WriteAllText(Path.Combine(output,"receiver-exact-derivatives.json"),JsonUtility.ToJson(receiverExact,true));}
        static bool ReceiverFramesExact(ReceiverSmokeFrame a,ReceiverSmokeFrame b){return a!=null&&b!=null&&a.inputHash==b.inputHash&&a.frameSize==b.frameSize&&a.receiverCount==b.receiverCount&&a.volumeCount==b.volumeCount&&ReceiverExactMatrix(a.cameraView,b.cameraView)&&ReceiverExactMatrix(a.cameraProjection,b.cameraProjection);}
        IEnumerator CaptureReceiverExactDerivatives(){
            var body=CaptureReceiverExactDerivativesBody();try{while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){if(receiverExact!=null){receiverExact.error=(receiverExact.error??"")+ex;receiverExact.passed=false;SaveReceiverExact("exception");}throw;}if(!next)break;yield return current;}}finally{(body as IDisposable)?.Dispose();}
        }
        IEnumerator CaptureReceiverExactDerivativesBody(){
            receiverExact=new ReceiverExactDerivatives();RenderTexture target=null;Texture2D readback=null;Material qaMaterial=null,originalProbe=null;FieldInfo privateProbe=null;Color[] values=null;var oldActive=RenderTexture.active;var originalDisplay=smokeDraw.sharedMaterial;var originalSource=smokeSource.sharedMaterial;bool assigned=false;
            var mode2=receiverSmoke.buffers.First(b=>b.mode==2);var mode4=receiverSmoke.buffers.First(b=>b.mode==4);
            File.WriteAllText(Path.Combine(output,"receiver-mode2-quad-model-summary.json"),JsonUtility.ToJson(mode2,true));if(receiverSamplerModel!=null)File.WriteAllText(Path.Combine(output,"receiver-sampler-quad-model.json"),JsonUtility.ToJson(receiverSamplerModel,true));
            try{
                receiverExact.requested=SmokeFrame();var size=receiverExact.requested.frameSize;receiverExact.width=size.x;receiverExact.height=size.y;CheckReceiverApi(size);SaveReceiverExact("private-probe-before");
                if(!ReceiverFramesExact(mode2.completed,receiverExact.requested)||!ReceiverFramesExact(mode4.completed,receiverExact.requested))throw new InvalidOperationException("Exact derivative capture inputs/camera differ from original mode2/mode4");
                privateProbe=receiverApi.GetField("probeMaterial",BindingFlags.NonPublic|BindingFlags.Static);if(privateProbe==null||privateProbe.FieldType!=typeof(Material))throw new MissingFieldException("Private probeMaterial ABI changed; refusing override");originalProbe=privateProbe.GetValue(null) as Material;if(originalProbe==null)throw new InvalidOperationException("Existing four probes must establish a nonnull original probeMaterial");receiverExact.originalSaved=true;receiverExact.originalProbeMaterialId=originalProbe.GetEntityId().ToString();
                var shader=Resources.Load<Shader>("Shaders/GroundReceiverExactDerivatives");if(shader==null||!shader.isSupported)throw new InvalidOperationException("QA exact derivative shader missing/unsupported");qaMaterial=new Material(shader){hideFlags=HideFlags.DontSave};qaMaterial.SetFloat("_DstBlend",0);receiverExact.qaProbeMaterialId=qaMaterial.GetEntityId().ToString();
                target=new RenderTexture(size.x,size.y,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear){useMipMap=false,autoGenerateMips=false,antiAliasing=1};if(!target.Create()||target.graphicsFormat.ToString()!="R32G32B32A32_SFloat")throw new InvalidOperationException("Exact derivative RGBAFloat target unavailable");
                receiverCancel.Invoke(null,null);assigned=true;privateProbe.SetValue(null,qaMaterial);if(!ReferenceEquals(privateProbe.GetValue(null),qaMaterial))throw new InvalidOperationException("Private probe assignment identity mismatch");receiverExact.requestSerial=(int)ReceiverValue("ProbeSerial");receiverRequest.Invoke(null,new object[]{target,3});SaveReceiverExact("waiting-extra-mode3-EOF");double began=Time.realtimeSinceStartupAsDouble;
                while(true){yield return new WaitForEndOfFrame();receiverExact.waitMs=(Time.realtimeSinceStartupAsDouble-began)*1000;CheckReceiverApi(size);if(receiverExact.waitMs>5000)throw new TimeoutException("Exact derivative extra probe exceeded 5s at EOF boundary");if((int)ReceiverValue("ProbeSerial")>receiverExact.requestSerial)break;}
                receiverExact.completed=SmokeFrame();receiverExact.completedSerial=receiverExact.completed.serial;receiverExact.snapshotCompatible=ReceiverFramesExact(mode2.completed,receiverExact.completed)&&ReceiverFramesExact(mode4.completed,receiverExact.completed)&&ReceiverFramesExact(receiverExact.requested,receiverExact.completed);if(!receiverExact.snapshotCompatible)throw new InvalidOperationException("Exact derivative completed frame differs from paired original evidence");
                SaveReceiverExact("extra-mode3-readback");RenderTexture.active=target;readback=new Texture2D(size.x,size.y,TextureFormat.RGBAFloat,false,true);readback.ReadPixels(new Rect(0,0,size.x,size.y),0,0);readback.Apply(false,false);values=readback.GetPixels();RenderTexture.active=oldActive;receiverExact.nonfinite=values.Count(c=>!SmokeFinite(c));
                receiverExact.rawPath=Path.Combine(output,"receiver-exact-derivatives.rgba32f");using(var stream=new FileStream(receiverExact.rawPath,FileMode.CreateNew,FileAccess.Write))using(var writer=new BinaryWriter(new BufferedStream(stream,1024*1024))){foreach(var pixel in values){writer.Write(pixel.r);writer.Write(pixel.g);writer.Write(pixel.b);writer.Write(pixel.a);}}
                using(var hash=SHA256.Create())using(var stream=File.OpenRead(receiverExact.rawPath))receiverExact.rawSha256=BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
            }finally{
                try{receiverCancel?.Invoke(null,null);if(target!=null)receiverExact.targetStillCreatedAfterCancel=target.IsCreated();}
                catch(Exception ex){receiverExact.error=(receiverExact.error??"")+"Cancel: "+ex;}
                finally{
                    try{if(assigned)privateProbe.SetValue(null,originalProbe);receiverExact.originalRestored=receiverExact.originalSaved&&ReferenceEquals(privateProbe.GetValue(null),originalProbe);}
                    catch(Exception ex){receiverExact.error=(receiverExact.error??"")+"Restore private probe: "+ex;receiverSmoke.cleanupError=(receiverSmoke.cleanupError??"")+ex;}
                    finally{receiverExact.displayMaterialsUnchanged=ReferenceEquals(smokeDraw.sharedMaterial,originalDisplay)&&ReferenceEquals(smokeSource.sharedMaterial,originalSource);RenderTexture.active=oldActive;if(readback!=null)Destroy(readback);if(target!=null){target.Release();Destroy(target);}if(qaMaterial!=null)Destroy(qaMaterial);SaveReceiverExact("cancel-restored-cleaned");}
                }
            }
            receiverExact.passed=values!=null&&receiverExact.nonfinite==0&&receiverExact.completedSerial>receiverExact.requestSerial&&receiverExact.snapshotCompatible&&receiverExact.originalRestored&&receiverExact.targetStillCreatedAfterCancel&&receiverExact.displayMaterialsUnchanged&&string.IsNullOrEmpty(receiverExact.error);SaveReceiverExact("final");if(!receiverExact.passed)throw new InvalidOperationException("Exact derivative capture/restoration gate failed");
            var referenceShader=Resources.Load<Shader>("Shaders/GroundReceiverSamplerReference");if(referenceShader==null||!referenceShader.isSupported)throw new InvalidOperationException("Sampler shader missing after exact capture");var reference=new Material(referenceShader);
            try{reference.SetTexture("_ReferenceSource",smokeSource.sprite.texture);DiagnoseReceiverModel(reference,mode2,null,values);var pairs=mode4.completed.frameSize;var rawPath=mode4.rawPath;var mode4Pixels=new Color[pairs.x*pairs.y];using(var reader=new BinaryReader(File.OpenRead(rawPath)))for(int i=0;i<mode4Pixels.Length;i++)mode4Pixels[i]=new Color(reader.ReadSingle(),reader.ReadSingle(),reader.ReadSingle(),reader.ReadSingle());CompareReceiverModelMode4(mode4,mode4Pixels);}
            finally{Destroy(reference);}
        }
        [Serializable] sealed class ReceiverSamplerModel {
            public string status="not-run",error,scope="32 original samples; complete even-aligned 2x2 raw-map candidate gradients; not captured hardware ddx/ddy; incomplete quad FAIL";
            public int selected,valid,invalid;public bool capturedGpuDerivatives;public bool mode2Passed,mode4Compared,frameCompatible,passed;
            public float maxWeightError,maxRgbError,maxRgbaError;public ReceiverSmokeFrame mode2Frame,mode4Frame;
        }
        ReceiverSamplerModel receiverSamplerModel;
        static bool ReceiverQuadDerivative(Color[] pixels,int width,int height,ReceiverSmokeSample sample){
            int x=sample.pixelX&~1,y=sample.pixelY&~1;sample.modelQuadOrigin=new Vector2Int(x,y);sample.modelQuadPixels=new Color[4];
            if(x<0||y<0||x+1>=width||y+1>=height)return false;
            bool valid=true;for(int j=0;j<4;j++){var value=pixels[(y+j/2)*width+x+j%2];sample.modelQuadPixels[j]=value;valid &= SmokeFinite(value)&&value.a>0;}
            if(!valid)return false;int row=sample.pixelY&1,col=sample.pixelX&1;var a=sample.modelQuadPixels[row*2];var b=sample.modelQuadPixels[row*2+1];var c=sample.modelQuadPixels[col];var d=sample.modelQuadPixels[col+2];sample.modelDx=new Vector2(b.r-a.r,b.g-a.g);sample.modelDy=new Vector2(d.r-c.r,d.g-c.g);return true;
        }
        void DiagnoseReceiverModel(Material material,ReceiverSmokeBuffer buffer,Color[] pixels,Color[] captured=null){
            receiverSamplerModel=new ReceiverSamplerModel{status="running",selected=buffer.samples.Count,mode2Frame=buffer.completed,capturedGpuDerivatives=captured!=null};var model=receiverSamplerModel;
            try{
                if(captured!=null)model.scope="32 original samples; QA clone captured ddx/ddy at original packed sampling site; helper output not inferred from cleared raw neighbors; shader/compiler equivalence remains scoped";var inputs=buffer.completed.inputs;if(inputs.ringRadius!=0||inputs.sourceMode<0||inputs.sourceMode>2||!inputs.texturePreserved||inputs.materialIdentity)throw new InvalidOperationException("Unsupported sampler model source/material semantics");
                var uvDx=new Vector4[32];var dy=new Vector4[32];for(int i=0;i<buffer.samples.Count;i++){var sample=buffer.samples[i];if(captured==null){sample.modelQuadValid=ReceiverQuadDerivative(pixels,buffer.width,buffer.height,sample);sample.modelQuadDx=sample.modelDx;sample.modelQuadDy=sample.modelDy;sample.modelDerivativeValid=sample.modelQuadValid;}else{var derivative=captured[sample.pixelY*buffer.width+sample.pixelX];sample.capturedDx=new Vector2(derivative.r,derivative.g);sample.capturedDy=new Vector2(derivative.b,derivative.a);sample.capturedDerivativeValid=SmokeFinite(derivative)&&(sample.capturedDx.sqrMagnitude>0||sample.capturedDy.sqrMagnitude>0);sample.modelDx=sample.capturedDx;sample.modelDy=sample.capturedDy;sample.modelDerivativeValid=sample.capturedDerivativeValid;}if(sample.modelDerivativeValid)model.valid++;else model.invalid++;uvDx[i]=new Vector4(sample.actual.r,sample.actual.g,sample.modelDx.x,sample.modelDx.y);dy[i]=new Vector4(sample.modelDy.x,sample.modelDy.y,0,0);}
                material.SetVectorArray("_SampleUvDx",uvDx);material.SetVectorArray("_SampleDy",dy);material.SetVector("_SourceTint",inputs.tint);material.SetFloat("_SourceMode",inputs.sourceMode);material.SetFloat("_Flat",inputs.flat);material.SetFloat("_NormalBlend",inputs.normalBlend);material.SetFloat("_Opacity",inputs.opacity);
                var source=ReceiverSamplerRead(material,1,buffer.samples.Count);var metrics=ReceiverSamplerRead(material,3,buffer.samples.Count);var rgba=ReceiverSamplerRead(material,4,buffer.samples.Count);
                for(int i=0;i<buffer.samples.Count;i++){var sample=buffer.samples[i];sample.modelSourceRgba=source[i];sample.modelExpectedRgba=rgba[i];sample.modelExpectedWeight=metrics[i].r;sample.modelExpectedMaxRgb=metrics[i].g;sample.modelWeightError=Mathf.Abs(metrics[i].r-sample.actual.a);sample.modelRgbError=Mathf.Abs(metrics[i].g-sample.actual.b);sample.modelPassed=sample.modelDerivativeValid&&sample.modelWeightError<=2f/255&&sample.modelRgbError<=2f/255;model.maxWeightError=Mathf.Max(model.maxWeightError,sample.modelWeightError);model.maxRgbError=Mathf.Max(model.maxRgbError,sample.modelRgbError);}
                model.mode2Passed=model.selected==32&&model.invalid==0&&buffer.nonfinite==0&&buffer.completedSerial>buffer.requestSerial&&buffer.requested.inputHash==buffer.completed.inputHash&&buffer.positiveWeight>0&&buffer.outsideUv==0&&buffer.samples.All(s=>s.modelPassed);model.status="mode2-complete-mode4-pending";
            }catch(Exception ex){model.status="error";model.error=ex.ToString();model.mode2Passed=false;}
            SaveReceiverModel();
        }
        static bool ReceiverExactMatrix(Matrix4x4 a,Matrix4x4 b){for(int i=0;i<16;i++)if(float.IsNaN(a[i])||float.IsInfinity(a[i])||float.IsNaN(b[i])||float.IsInfinity(b[i])||BitConverter.SingleToInt32Bits(a[i])!=BitConverter.SingleToInt32Bits(b[i]))return false;return true;}
        void CompareReceiverModelMode4(ReceiverSmokeBuffer buffer,Color[] pixels){
            var model=receiverSamplerModel;if(model==null)return;model.mode4Frame=buffer.completed;var prior=receiverSmoke.buffers.FirstOrDefault(b=>b.mode==2);
            model.frameCompatible=prior!=null&&model.mode2Frame.inputHash==buffer.completed.inputHash&&prior.width==buffer.width&&prior.height==buffer.height&&ReceiverExactMatrix(model.mode2Frame.cameraView,buffer.completed.cameraView)&&ReceiverExactMatrix(model.mode2Frame.cameraProjection,buffer.completed.cameraProjection);
            if(!model.frameCompatible){model.error=(model.error??"")+" mode2/mode4 inputHash, FrameSize or exact camera matrix mismatch; RGBA pairing forbidden";model.passed=false;model.status="blocked-frame-mismatch";SaveReceiverModel();return;}
            bool all=true;foreach(var sample in prior.samples){var actual=pixels[sample.pixelY*buffer.width+sample.pixelX];sample.modelMode4Actual=actual;sample.modelRgbaCompared=true;sample.modelRgbaError=Mathf.Max(Mathf.Abs(actual.r-sample.modelExpectedRgba.r),Mathf.Abs(actual.g-sample.modelExpectedRgba.g),Mathf.Abs(actual.b-sample.modelExpectedRgba.b),Mathf.Abs(actual.a-sample.modelExpectedRgba.a));sample.modelRgbaPassed=sample.modelDerivativeValid&&SmokeFinite(actual)&&sample.modelRgbaError<=2f/255;model.maxRgbaError=Mathf.Max(model.maxRgbaError,sample.modelRgbaError);all &= sample.modelRgbaPassed;}
            model.mode4Compared=true;model.passed=model.capturedGpuDerivatives&&model.mode2Passed&&all&&string.IsNullOrEmpty(model.error);model.status=model.passed?"scoped-model-pass":"blocked-or-comparison-fail";File.WriteAllText(Path.Combine(output,"receiver-mode2-summary.json"),JsonUtility.ToJson(prior,true));SaveReceiverModel();
        }
        void SaveReceiverModel(){if(receiverSamplerModel!=null)File.WriteAllText(Path.Combine(output,"receiver-sampler-model.json"),JsonUtility.ToJson(receiverSamplerModel,true));}
        [Serializable] sealed class ReceiverSamplerDiagnostic {
            public string status="not-run",error,shader="Hidden/EXODUSER/QA/GroundReceiverSamplerReference",scope="independent source sampling; legacy cache and original mode2 gate preserved",derivativeScope="finite differences from actual mode2 packed UV neighbors; no screen Y flip assumed; not exact fragment quad derivatives";
            public ReceiverSmokeFrame sourceFrame;public List<ReceiverSmokeSample> samples;public int sampleCount,sourceAnisoLevel;public string anisotropicFiltering;public float maxLevelWeightError,maxGradWeightError,maxLevelCacheAlphaError,maxLoadCacheAlphaError,maxLoadCacheRgbError;
        }
        static Color SmokeExpectedRgba(Color p,ReceiverSmokeInputs inputs,out float weight){
            weight=p.a*inputs.tint.w;if(inputs.flat>.5f)weight*=Mathf.Max(p.r,Mathf.Max(p.g,p.b));var rgb=inputs.flat>.5f?Vector3.one:new Vector3(p.r,p.g,p.b);rgb=Vector3.Scale(rgb,new Vector3(inputs.tint.x,inputs.tint.y,inputs.tint.z))*weight;return new Color(rgb.x,rgb.y,rgb.z,inputs.normalBlend>.5f?weight:0);
        }
        static Vector2 ReceiverUvDerivative(Color[] pixels,int width,int height,int x,int y,int dx,int dy,out bool valid){
            var center=pixels[y*width+x];int nx=x+dx,ny=y+dy;
            if(nx>=0&&ny>=0&&nx<width&&ny<height){var next=pixels[ny*width+nx];if(SmokeFinite(next)&&next.a>0){valid=true;return new Vector2(next.r-center.r,next.g-center.g);}}
            nx=x-dx;ny=y-dy;if(nx>=0&&ny>=0&&nx<width&&ny<height){var previous=pixels[ny*width+nx];if(SmokeFinite(previous)&&previous.a>0){valid=true;return new Vector2(center.r-previous.r,center.g-previous.g);}}
            valid=false;return Vector2.zero;
        }
        Color[] ReceiverSamplerRead(Material material,int mode,int width){
            RenderTexture target=null;Texture2D texture=null;var previous=RenderTexture.active;
            try{
                target=new RenderTexture(width,1,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear){useMipMap=false,autoGenerateMips=false,antiAliasing=1};if(!target.Create()||target.graphicsFormat.ToString()!="R32G32B32A32_SFloat")throw new InvalidOperationException("Sampler diagnostic RGBAFloat target unavailable");
                material.SetInt("_ReferenceMode",mode);Graphics.Blit(null,target,material,0);RenderTexture.active=target;texture=new Texture2D(width,1,TextureFormat.RGBAFloat,false,true);texture.ReadPixels(new Rect(0,0,width,1),0,0);texture.Apply(false,false);var values=texture.GetPixels();if(values.Any(c=>!SmokeFinite(c)))throw new InvalidOperationException("Nonfinite sampler reference data");return values;
            }finally{RenderTexture.active=previous;if(texture!=null)Destroy(texture);if(target!=null){target.Release();Destroy(target);}}
        }
        void DiagnoseReceiverSampler(ReceiverSmokeBuffer buffer,Color[] pixels){
            var diagnostic=new ReceiverSamplerDiagnostic{sourceFrame=buffer.completed,samples=buffer.samples};buffer.samplerDiagnostic=diagnostic;Material material=null;
            try{
                var source=smokeSource.sprite.texture;var inputs=buffer.completed.inputs;diagnostic.sourceAnisoLevel=source.anisoLevel;diagnostic.anisotropicFiltering=QualitySettings.anisotropicFiltering.ToString();diagnostic.sampleCount=buffer.samples.Count;
                if(diagnostic.sampleCount<=0||diagnostic.sampleCount>32)throw new InvalidOperationException("Expected 1..32 original mode2 samples");var shader=Resources.Load<Shader>("Shaders/GroundReceiverSamplerReference");if(shader==null||!shader.isSupported)throw new InvalidOperationException("QA-only sampler reference shader missing/unsupported");material=new Material(shader);material.SetTexture("_ReferenceSource",source);material.SetVector("_ReferenceSize",new Vector4(source.width,source.height,0,0));var uvDx=new Vector4[32];var dy=new Vector4[32];
                for(int i=0;i<diagnostic.sampleCount;i++){var sample=buffer.samples[i];bool validX,validY;sample.referenceDx=ReceiverUvDerivative(pixels,buffer.width,buffer.height,sample.pixelX,sample.pixelY,1,0,out validX);sample.referenceDy=ReceiverUvDerivative(pixels,buffer.width,buffer.height,sample.pixelX,sample.pixelY,0,1,out validY);sample.referenceDerivativesValid=validX&&validY;uvDx[i]=new Vector4(sample.actual.r,sample.actual.g,sample.referenceDx.x,sample.referenceDx.y);dy[i]=new Vector4(sample.referenceDy.x,sample.referenceDy.y,0,0);}
                material.SetVectorArray("_SampleUvDx",uvDx);material.SetVectorArray("_SampleDy",dy);var levels=ReceiverSamplerRead(material,0,diagnostic.sampleCount);var gradients=ReceiverSamplerRead(material,1,diagnostic.sampleCount);var texels=ReceiverSamplerRead(material,2,diagnostic.sampleCount*4);var decoded=DecodeMip0(source);
                for(int i=0;i<diagnostic.sampleCount;i++){
                    var sample=buffer.samples[i];sample.referenceLevelRgba=levels[i];sample.referenceGradRgba=gradients[i];sample.referenceLevelExpectedRgba=SmokeExpectedRgba(levels[i],inputs,out sample.referenceLevelWeight);sample.referenceGradExpectedRgba=SmokeExpectedRgba(gradients[i],inputs,out sample.referenceGradWeight);sample.referenceLevelWeightError=Mathf.Abs(sample.referenceLevelWeight-sample.actual.a);sample.referenceGradWeightError=Mathf.Abs(sample.referenceGradWeight-sample.actual.a);sample.referenceLevelCacheAlphaError=Mathf.Abs(levels[i].a-sample.textureRgba.a);
                    float x=sample.actual.r*source.width-.5f,y=sample.actual.g*source.height-.5f;int x0=Mathf.FloorToInt(x),y0=Mathf.FloorToInt(y);float fx=x-x0,fy=y-y0;sample.referenceLoadedTexels=new Color[4];sample.referenceCachedTexels=new Color[4];
                    for(int corner=0;corner<4;corner++){var actual=texels[i*4+corner];int tx=SmokeTexel(x0+corner%2,source.width,source.wrapModeU),ty=SmokeTexel(y0+corner/2,source.height,source.wrapModeV);var cached=decoded.pixels[ty*source.width+tx];sample.referenceLoadedTexels[corner]=actual;sample.referenceCachedTexels[corner]=cached;sample.referenceLoadCacheAlphaError=Mathf.Max(sample.referenceLoadCacheAlphaError,Mathf.Abs(actual.a-cached.a));sample.referenceLoadCacheRgbError=Mathf.Max(sample.referenceLoadCacheRgbError,Mathf.Abs(actual.r-cached.r),Mathf.Abs(actual.g-cached.g),Mathf.Abs(actual.b-cached.b));}
                    sample.referenceLoadBilinear=Color.LerpUnclamped(Color.LerpUnclamped(texels[i*4],texels[i*4+1],fx),Color.LerpUnclamped(texels[i*4+2],texels[i*4+3],fx),fy);sample.referenceLoadExpectedRgba=SmokeExpectedRgba(sample.referenceLoadBilinear,inputs,out sample.referenceLoadWeight);
                    diagnostic.maxLevelWeightError=Mathf.Max(diagnostic.maxLevelWeightError,sample.referenceLevelWeightError);diagnostic.maxGradWeightError=Mathf.Max(diagnostic.maxGradWeightError,sample.referenceGradWeightError);diagnostic.maxLevelCacheAlphaError=Mathf.Max(diagnostic.maxLevelCacheAlphaError,sample.referenceLevelCacheAlphaError);diagnostic.maxLoadCacheAlphaError=Mathf.Max(diagnostic.maxLoadCacheAlphaError,sample.referenceLoadCacheAlphaError);diagnostic.maxLoadCacheRgbError=Mathf.Max(diagnostic.maxLoadCacheRgbError,sample.referenceLoadCacheRgbError);
                }
                diagnostic.status="completed";DiagnoseReceiverModel(material,buffer,pixels);
            }catch(Exception ex){diagnostic.status="error";diagnostic.error=ex.ToString();}finally{if(material!=null)Destroy(material);File.WriteAllText(Path.Combine(output,"receiver-mode2-sampler-reference.json"),JsonUtility.ToJson(diagnostic,true));}
        }
        static bool SmokeFinite(Color c){return !float.IsNaN(c.r)&&!float.IsNaN(c.g)&&!float.IsNaN(c.b)&&!float.IsNaN(c.a)&&!float.IsInfinity(c.r)&&!float.IsInfinity(c.g)&&!float.IsInfinity(c.b)&&!float.IsInfinity(c.a);}
        static Vector2 SmokeNormalized(Vector3 world,ReceiverSmokeInputs inputs){var p=new Vector2(world.x-inputs.anchor.x,world.z-inputs.anchor.z);return new Vector2(p.x*inputs.u.x+p.y*inputs.u.y+inputs.u.z,p.x*inputs.v.x+p.y*inputs.v.y+inputs.v.z);}
        static int SmokeTexel(int index,int size,TextureWrapMode mode){if(mode==TextureWrapMode.Clamp)return Mathf.Clamp(index,0,size-1);if(mode==TextureWrapMode.Repeat){int r=index%size;return r<0?r+size:r;}if(mode==TextureWrapMode.Mirror){int r=index%(size*2);if(r<0)r+=size*2;return r<size?r:size*2-1-r;}if(mode==TextureWrapMode.MirrorOnce)return Mathf.Clamp(index<0?-index-1:index,0,size-1);throw new NotSupportedException("Unknown source wrap mode "+mode);}
        static Color SmokeTexture(DecodedTexture data,Texture2D texture,Vector2 uv){
            float x=uv.x*data.width-.5f,y=uv.y*data.height-.5f;int x0=Mathf.FloorToInt(x),y0=Mathf.FloorToInt(y);if(texture.filterMode==FilterMode.Point)return data.pixels[SmokeTexel(Mathf.FloorToInt(uv.y*data.height),data.height,texture.wrapModeV)*data.width+SmokeTexel(Mathf.FloorToInt(uv.x*data.width),data.width,texture.wrapModeU)];
            Color a=data.pixels[SmokeTexel(y0,data.height,texture.wrapModeV)*data.width+SmokeTexel(x0,data.width,texture.wrapModeU)],b=data.pixels[SmokeTexel(y0,data.height,texture.wrapModeV)*data.width+SmokeTexel(x0+1,data.width,texture.wrapModeU)],c=data.pixels[SmokeTexel(y0+1,data.height,texture.wrapModeV)*data.width+SmokeTexel(x0,data.width,texture.wrapModeU)],d=data.pixels[SmokeTexel(y0+1,data.height,texture.wrapModeV)*data.width+SmokeTexel(x0+1,data.width,texture.wrapModeU)];return Color.LerpUnclamped(Color.LerpUnclamped(a,b,x-x0),Color.LerpUnclamped(c,d,x-x0),y-y0);
        }
        void SummarizeReceiverBuffer(ReceiverSmokeBuffer buffer,Color[] pixels){
            var inputs=buffer.completed.inputs;float xExtent=Mathf.Abs(inputs.volumeScale.x)*.5f,zExtent=Mathf.Abs(inputs.volumeScale.z)*.5f;
            foreach(var pixel in pixels){if(!SmokeFinite(pixel)){buffer.nonfinite++;continue;}float rgb=Mathf.Max(Mathf.Abs(pixel.r),Mathf.Abs(pixel.g),Mathf.Abs(pixel.b));if(rgb>0)buffer.nonzeroRgb++;buffer.maxAlpha=Mathf.Max(buffer.maxAlpha,Mathf.Abs(pixel.a));if(buffer.mode==4||pixel.a<=0)continue;buffer.positiveWeight++;
                if(buffer.mode==1){var world=new Vector3(pixel.r,pixel.g,pixel.b);var uv=SmokeNormalized(world,inputs);if(Mathf.Abs(world.x-40.2f)>xExtent+.0001f||Mathf.Abs(world.z+77)>zExtent+.0001f)buffer.outsideXz++;if(uv.x<-.00001f||uv.y<-.00001f||uv.x>1.00001f||uv.y>1.00001f)buffer.outsideUv++;}
                if(buffer.mode==2){if(pixel.r<inputs.atlas.x-.00001f||pixel.g<inputs.atlas.y-.00001f||pixel.r>inputs.atlas.x+inputs.atlas.z+.00001f||pixel.g>inputs.atlas.y+inputs.atlas.w+.00001f)buffer.outsideUv++;}
                if(buffer.mode==3){buffer.maxDepthDifference=Mathf.Max(buffer.maxDepthDifference,pixel.b);if(pixel.r<=0||pixel.g<=0||pixel.b<0||pixel.b>.02f)buffer.depthFailures++;}
            }
            int foreground=buffer.mode==4?buffer.nonzeroRgb:buffer.positiveWeight,stride=Mathf.Max(1,foreground/32),rank=0;var texture=smokeSource.sprite.texture;var decoded=buffer.mode==2?DecodeMip0(texture):null;
            for(int i=0;i<pixels.Length&&buffer.samples.Count<32;i++){
                var pixel=pixels[i];if(!SmokeFinite(pixel)||(buffer.mode==4?Mathf.Max(Mathf.Abs(pixel.r),Mathf.Abs(pixel.g),Mathf.Abs(pixel.b))<=0:pixel.a<=0))continue;if(rank++%stride!=0)continue;var sample=new ReceiverSmokeSample{pixelX=i%buffer.width,pixelY=i/buffer.width,actual=pixel};
                if(buffer.mode==1){sample.world=new Vector3(pixel.r,pixel.g,pixel.b);sample.normalizedUv=SmokeNormalized(sample.world,inputs);sample.cpuGroundDifference=sample.world.y-NativeRemodel3D.GroundY(sample.world.x,sample.world.z);}
                if(buffer.mode==2){var p=SmokeTexture(decoded,texture,new Vector2(pixel.r,pixel.g));float alpha=p.a*inputs.tint.w;if(inputs.flat>.5f)alpha*=Mathf.Max(p.r,Mathf.Max(p.g,p.b));var rgb=inputs.flat>.5f?Vector3.one:new Vector3(p.r,p.g,p.b);rgb=Vector3.Scale(rgb,new Vector3(inputs.tint.x,inputs.tint.y,inputs.tint.z))*alpha;sample.textureRgba=p;sample.expectedRgba=new Color(rgb.x,rgb.y,rgb.z,inputs.normalBlend>.5f?alpha:0);sample.expectedWeight=alpha;sample.weightError=Mathf.Abs(alpha-pixel.a);sample.maxRgbError=Mathf.Abs(Mathf.Max(rgb.x,Mathf.Max(rgb.y,rgb.z))-pixel.b);sample.compared=true;buffer.maxWeightError=Mathf.Max(buffer.maxWeightError,sample.weightError);buffer.maxRgbError=Mathf.Max(buffer.maxRgbError,sample.maxRgbError);buffer.comparedSamples++;}
                buffer.samples.Add(sample);
            }
            buffer.comparisonScope=buffer.mode==2?"same completed-frame PB+actual packed UV+GPU-decoded texture: expected full RGBA computed, actual weight/maxRGB compared (2/255 tolerance); no mode4 pixel pairing":buffer.mode==4?"actual independent-frame preblendRGBA captured; additive alpha0 checked; no same-frame UV API, full per-channel expectation comparison unverified":"independent-frame actual GPU receiver evidence; no cross-mode pixel alignment assumed";
        }
        static void MeasureVfx(Row row,float x,float y,bool inactive){bool prior=NativeRemodel3D.Active;try{NativeRemodel3D.Active=!inactive;const float lift=.013f;Vector3 a=VfxWorld.ToWorld(x,y,lift),b=VfxWorld.ToWorldMetres(new Vector2(x/100,-y/100),lift);float expected=inactive?lift:NativeRemodel3D.GroundY(x/100,-y/100)+lift;row.shapes.Add(new Shape{kind="VfxWorld.ToWorld",pivot=a,pivotLift=a.y-expected,passed=Mathf.Abs(a.y-expected)<.0001f});row.shapes.Add(new Shape{kind="VfxWorld.ToWorldMetres",pivot=b,pivotLift=b.y-expected,passed=Mathf.Abs(b.y-expected)<.0001f});row.passed=row.shapes.All(s=>s.passed);}finally{NativeRemodel3D.Active=prior;}}
    }
}
