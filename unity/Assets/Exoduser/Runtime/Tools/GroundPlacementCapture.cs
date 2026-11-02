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
    public sealed class GroundPlacementCapture : MonoBehaviour
    {
        const BindingFlags Flags=BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic;
        [Serializable] public sealed class Shape {
            public string path,kind,sprite,texture,assertionScope; public bool uvRangePreserved=true,uvOrientationPreserved=true,materialPreserved=true,texturePreserved=true,colorPreserved=true,opacityPreserved=true,sortingPreserved=true; public float uvRangeDelta,uvOrientationDelta,colorDelta,opacityDelta; public string sourceEntity; public bool normalDiagnosticOnly; public string instanceId; public int sortingOrder; public Vector3 pivot,normal,expectedNormal;
            public Rect atlasRect; public Vector2[] sourceSpriteUv; public Vector2[] uv; public Vector3[] vertices; public float[] expectedVertexY;
            public ContributionDiagnostic contribution; public InteriorDiagnostic interior; public float pivotLift,maxGroundError,normalUp,expectedDrawOffset,maxBiasResidual,opacity; public string shader,sharedMaterial; public Color color; public int vertexCount,triangleCount; public bool forceRenderingOff; public bool passed;
        }
        [Serializable] public sealed class InteriorDiagnostic {
            public bool diagnosticOnly=true; public string sampling="each actual triangle: 3 edge midpoints + centroid; shared edges sampled per triangle";
            public int sampleCount,over2cm,invalidSamples; public float maxAbs,meanAbs,p95Abs,meanSigned,minSigned,maxSigned,worstSigned;
            public Vector3 worstActualPoint; public float worstExpectedGround,worstExpectedDrawY; public float expectedDrawOffset=.025f;
        }
        [Serializable] public sealed class Row {
            public string site,consumer,scope,screenshot,direct3840,error; public bool direct3840Captured; public Vector2 core;
            public int level; public float renderTime; public float actualRadius; public string radiusSourceFunction; public bool ground,passed; public List<Shape> shapes=new List<Shape>();
        }
        [Serializable] public sealed class Receipt {
            public string baselineProductSource="1403c5ee6d52c540815ab1cf70d5666b9023aa75",source,qaStorageRoot,audioMeasurementScope="paused/muted fixture; peak is a terminal 1024-sample observation, not continuous output logging",device,api,error;
            public string runtimeDllSha,coreDllSha,originalBefore,originalAfter;
            public int contributionShapes,contributionUnverifiedShapes; public bool contributionVerified,subset; public string consumerPrefix,passScope; public int expectedRows; public string[] required,generated,missing; public int width,height,failures,directVideo;
            public bool restored,originalReferenceSame,originalStateSame,listenerPaused,passed;
            public float listenerVolume,peak; public List<Row> rows=new List<Row>();
        }
        static readonly string[] Consumers={"spikeTrap","holyDome","SeekerMines","Mine-first","Projectile-control","Mine-reused","trap","iceZone","blizzard","LavaPools","PoisonPools","GroundRing","Fissures","TideWaves","malice-control","slam-control","character-control","VfxWorld-active","VfxWorld-inactive","telegraph-2D-control","phase-Shock-create","phase-Shock-hold","phase-Shock-tail","phase-Seeker-unarmed","phase-Seeker-armed","phase-Mine-imminent","phase-Lava-warn","phase-Lava-active","phase-Lava-tail","phase-Poison-start","phase-Poison-atlas-middle","phase-Poison-tail","phase-Chase-warning","phase-Chase-hit-create","phase-Chase-hit-hold","phase-Chase-hit-tail","phase-Fissure-warning","phase-Fissure-explode-create","phase-Fissure-explode-hold","phase-Fissure-explode-tail","phase-Tide-create","phase-Tide-hold","phase-Tide-tail","phase-spikeTrap-zero","phase-holyDome-zero","size-spikeTrap-Lv1","size-spikeTrap-Lv20","size-holyDome-Lv1","size-holyDome-Lv20"};
        NativeGame game; Simulation original,sample; bool enabledBefore,runningBefore,lateEnabledBefore; Behaviour lateDriver; string output;
        string[] selectedConsumers=Consumers; static Camera contributionCamera;
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
        void Invoke(string name){typeof(NativeGame).GetMethod(name,Flags).Invoke(game,null);}
        void SyncViews(){((Camera)Field("view")).cullingMask=(int)Field("worldMask");Invoke("UpdateViews");Invoke("Remodel3DLate");}
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
            output=Arg("-output");receipt.source=Arg("-source-sha");receipt.qaStorageRoot=NativeQaSandbox.Root;receipt.consumerPrefix=Arg("-ground-consumer-prefix");receipt.subset=Has("-ground-consumer-prefix");selectedConsumers=receipt.subset?Consumers.Where(c=>c.StartsWith(receipt.consumerPrefix,StringComparison.Ordinal)).ToArray():Consumers;receipt.required=receipt.subset?selectedConsumers:selectedConsumers.Concat(new[]{"ground-lifecycle"}).ToArray();receipt.expectedRows=selectedConsumers.Length*3+(receipt.subset?0:1);receipt.passScope=receipt.subset?"selected consumer subset only; lifecycle omitted":"full consumer coverage plus lifecycle";AudioListener.pause=true;AudioListener.volume=0;
            var body=Execute();
            while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){receipt.error=ex.ToString();break;}if(!next)break;yield return current;}
            ReleaseDecodedCache();contributionCamera=null;try{(body as IDisposable)?.Dispose();}catch(Exception ex){receipt.error=(receipt.error??"")+" cleanup: "+ex;}
            receipt.device=SystemInfo.graphicsDeviceName;receipt.api=SystemInfo.graphicsDeviceType.ToString();receipt.width=Screen.width;receipt.height=Screen.height;
            receipt.generated=generated.OrderBy(x=>x).ToArray();receipt.missing=receipt.required.Where(x=>!generated.Contains(x)).ToArray();
            receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;float[] audio=new float[1024];AudioListener.GetOutputData(audio,0);foreach(float x in audio)receipt.peak=Mathf.Max(receipt.peak,Mathf.Abs(x));
            foreach(var v in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())if(v.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideo++;
            receipt.runtimeDllSha=Dll(typeof(NativeGame));receipt.coreDllSha=Dll(typeof(Simulation));
            var contributions=receipt.rows.SelectMany(row=>row.shapes).Where(shape=>shape.contribution!=null).Select(shape=>shape.contribution).ToArray();receipt.contributionShapes=contributions.Length;receipt.contributionUnverifiedShapes=contributions.Count(d=>!d.verified);receipt.contributionVerified=contributions.Length>0&&receipt.contributionUnverifiedShapes==0;
            receipt.failures=receipt.rows.Count(x=>!x.passed);receipt.passed=receipt.error==null&&receipt.failures==0&&receipt.missing.Length==0&&receipt.rows.Count==receipt.expectedRows&&receipt.restored&&receipt.originalStateSame&&receipt.originalReferenceSame&&receipt.width==1920&&receipt.height==1080&&receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.peak==0&&receipt.directVideo==0;
            try{File.WriteAllText(Path.Combine(output,File.Exists(Path.Combine(output,"ground-placement-receipt.json"))?"ground-placement-failure-"+Guid.NewGuid().ToString("N")+".json":"ground-placement-receipt.json"),JsonUtility.ToJson(receipt,true));}catch(Exception ex){receipt.passed=false;Debug.LogError("GROUND_PLACEMENT receipt write failed "+ex);}
            yield return new WaitForSecondsRealtime(1);Debug.Log("QA_MEDIA_DRAIN_COMPLETE GROUND_PLACEMENT");if(game!=null&&original!=null){SetRunning(runningBefore);game.enabled=enabledBefore;if(lateDriver!=null)lateDriver.enabled=lateEnabledBefore;}Application.Quit(receipt.passed?0:2);
        }
        IEnumerator Execute(){
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0){Debug.LogError("QA output must be empty");throw new InvalidOperationException("QA output must be empty");}
            Directory.CreateDirectory(output);
            if(receipt.subset&&(string.IsNullOrEmpty(receipt.consumerPrefix)||selectedConsumers.Length==0))throw new InvalidOperationException("Empty consumer prefix/selection is forbidden");
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            float end=Time.realtimeSinceStartup+60;
            bool entered=false;
            while(Time.realtimeSinceStartup<end){game=FindAnyObjectByType<NativeGame>();
                if(game!=null&&game.Simulation!=null&&!entered){var lobby=Field("lobby");var flow=lobby.GetType().GetProperty("Flow").GetValue(lobby);flow.GetType().GetMethod("ShowLobby").Invoke(flow,null);flow.GetType().GetMethod("SelectPreview").Invoke(flow,null);if(!(bool)lobby.GetType().GetMethod("EnterNativeTest").Invoke(lobby,null))throw new InvalidOperationException("QA field entry failed");entered=true;}
                if(entered&&NativeRemodel3D.Active&&Field("a2Field")!=null&&Field("r3Cam")!=null)break;yield return null;}
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
                        Clear();bool ground=Populate(consumer,x,y);((Camera)Field("view")).cullingMask=(int)Field("worldMask");Invoke("UpdateViews");var lineBefore=LineState(Field("skillView"));Invoke("Remodel3DLate");
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
                                row.shapes.Add(shape);}
                            row.passed=row.shapes.Count>0&&row.shapes.All(s=>s.passed);
                        }
                        if(row.shapes.Count>0||consumer.StartsWith("VfxWorld"))generated.Add(consumer);
                        receipt.rows.Add(row);
                        yield return new WaitForEndOfFrame();
                        row.screenshot=Path.Combine(output,labels[site]+"-"+consumer+"-1920.png");var image=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(row.screenshot,image.EncodeToPNG());Destroy(image);
                        row.direct3840=Path.Combine(output,labels[site]+"-"+consumer+"-3840-direct-rt.png");CaptureDirect(game.Remodel3DCamera,row.direct3840);row.direct3840Captured=true;
                    }
                }
                if(!receipt.subset){var lifecycle=Lifecycle();try{while(lifecycle.MoveNext())yield return lifecycle.Current;}finally{(lifecycle as IDisposable)?.Dispose();}}
            }finally{
                setter.Invoke(game,new object[]{original});SyncViews();
                receipt.originalAfter=State(original);receipt.originalReferenceSame=ReferenceEquals(original,game.Simulation);receipt.originalStateSame=receipt.originalBefore==receipt.originalAfter;
                receipt.restored=true; // Keep NativeGame disabled through media drain; restore enable flag immediately before Quit.
            }
        }
        IEnumerator Lifecycle(){
            var root=new GameObject("QA isolated product boss lifecycle");var view=new NativeBossView(root.transform);
            var row=new Row{site="soil",consumer="ground-lifecycle",scope="same normal pool: iceZone -> field comet -> iceZone; source enabled/GO/Destroy/real 2D presentation restore",ground=false,passed=true};
            receipt.rows.Add(row);generated.Add("ground-lifecycle");
            try{
                Clear();sample.Player.X=3840;sample.Player.Y=7780;
                sample.FieldZones.Add(new Simulation.FieldZone{Kind="iceZone",X=4020,Y=7700,R=20,Life=180});
                view.Update(sample);SyncViews();
                var source=root.GetComponentsInChildren<SpriteRenderer>(true).FirstOrDefault(r=>r.enabled&&r.sprite!=null);
                if(source==null){row.passed=false;row.error="No source sprite";yield break;}
                string identity=source.GetEntityId().ToString();var ground=source.GetComponentsInChildren<MeshRenderer>(true).FirstOrDefault(r=>r.enabled&&!r.forceRenderingOff);
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
                shape.passed=Finite(source.transform.position)&&Finite(source.transform.lossyScale)&&
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
            if(o==null||!seen.Add(o))return;if(o is Renderer rr){foreach(var sibling in rr.gameObject.GetComponentsInChildren<Renderer>(true))found.Add(sibling);return;}
            if(o is GameObject go){foreach(var r in go.GetComponentsInChildren<Renderer>(true))found.Add(r);return;}
            if(o is UnityEngine.Object||o is Simulation||o is Delegate)return;
            if(o is IEnumerable seq){foreach(var v in seq)Collect(v,found,seen);return;}
            var t=o.GetType();if(t.IsPrimitive||t.IsEnum||o is string)return;
            foreach(var f in t.GetFields(Flags))if(!f.IsStatic)Collect(f.GetValue(o),found,seen);
        }
        static bool IsVerticalBurst(Renderer renderer){var sr=renderer as SpriteRenderer;if(sr==null)sr=renderer.GetComponentInParent<SpriteRenderer>();if(sr==null||sr.sprite==null)return false;string name=sr.sprite.texture.name;return name=="druid_hit_24_20261010"||name=="druid_roots_48_20261010"||name=="druid_dust_24_20261010";}
        static Shape Measure(Renderer r,bool ground){
            var s=new Shape{forceRenderingOff=r.forceRenderingOff,shader=r.sharedMaterial==null?"none":r.sharedMaterial.shader.name,sharedMaterial=r.sharedMaterial==null?"none":r.sharedMaterial.name,assertionScope="active sibling/child display renderer; all vertex contact hard gate; slope normal diagnostic",path=r.name,kind=r.GetType().Name,instanceId=r.GetEntityId().ToString(),sortingOrder=r.sortingOrder,pivot=r.transform.position};var points=new List<Vector3>();
            var block=new MaterialPropertyBlock();r.GetPropertyBlock(block);s.opacity=block.GetFloat("_Opacity");s.color=r.sharedMaterial!=null&&r.sharedMaterial.HasProperty("_BaseColor")?r.sharedMaterial.GetColor("_BaseColor"):Color.white;
            if(r is SpriteRenderer sr&&sr.sprite!=null){s.color=sr.color;s.sprite=sr.sprite.name;s.texture=sr.sprite.texture.name;s.atlasRect=sr.sprite.rect;s.sourceSpriteUv=sr.sprite.uv;s.uv=sr.sprite.uv;foreach(var v in sr.sprite.vertices)points.Add(sr.transform.TransformPoint(v));}
            else if(r is LineRenderer line){for(int i=0;i<line.positionCount;i++)points.Add(line.useWorldSpace?line.GetPosition(i):line.transform.TransformPoint(line.GetPosition(i)));}
            else if(r is MeshRenderer){var source=r.GetComponentInParent<SpriteRenderer>();if(source!=null&&source.sprite!=null){s.sprite=source.sprite.name;s.texture=source.sprite.texture.name;s.atlasRect=source.sprite.rect;s.sourceSpriteUv=source.sprite.uv;}var mf=r.GetComponent<MeshFilter>();if(mf!=null&&mf.sharedMesh!=null){s.color=mf.sharedMesh.colors.Length>0?mf.sharedMesh.colors[0]:s.color;s.triangleCount=mf.sharedMesh.triangles.Length/3;s.uv=mf.sharedMesh.uv;foreach(var v in mf.sharedMesh.vertices)points.Add(mf.transform.TransformPoint(v));}}
            if(r is MeshRenderer){var src=r.GetComponentInParent<SpriteRenderer>();var mf=r.GetComponent<MeshFilter>();if(src!=null&&src.sprite!=null&&mf!=null&&mf.sharedMesh!=null){
                s.sourceEntity=src.GetEntityId().ToString();var sourceUv=src.sprite.uv;var meshUv=mf.sharedMesh.uv;
                if(sourceUv.Length==0||meshUv.Length==0){s.uvRangePreserved=false;s.uvOrientationPreserved=false;}
                else{var lo=new Vector2(sourceUv.Min(v=>v.x),sourceUv.Min(v=>v.y));var hi=new Vector2(sourceUv.Max(v=>v.x),sourceUv.Max(v=>v.y));var mlo=new Vector2(meshUv.Min(v=>v.x),meshUv.Min(v=>v.y));var mhi=new Vector2(meshUv.Max(v=>v.x),meshUv.Max(v=>v.y));s.uvRangeDelta=Mathf.Max((lo-mlo).magnitude,(hi-mhi).magnitude);s.uvRangePreserved=s.uvRangeDelta<=.00001f;var first=new Vector2(src.flipX?hi.x:lo.x,src.flipY?hi.y:lo.y);var last=new Vector2(src.flipX?lo.x:hi.x,src.flipY?lo.y:hi.y);s.uvOrientationDelta=Mathf.Max((meshUv[0]-first).magnitude,(meshUv[meshUv.Length-1]-last).magnitude);s.uvOrientationPreserved=s.uvOrientationDelta<=.00001f;}
                var srcBlock=new MaterialPropertyBlock();src.GetPropertyBlock(srcBlock);s.materialPreserved=r.sharedMaterial==src.sharedMaterial;s.texturePreserved=block.GetTexture("_MainTex")==src.sprite.texture;s.opacityDelta=Mathf.Abs(block.GetFloat("_Opacity")-srcBlock.GetFloat("_Opacity"));s.opacityPreserved=s.opacityDelta<=.000001f;s.sortingPreserved=r.sortingOrder==src.sortingOrder&&r.sortingLayerID==src.sortingLayerID;var colors=mf.sharedMesh.colors;if(colors.Length!=mf.sharedMesh.vertexCount)s.colorPreserved=false;foreach(var color in colors){var delta=(Vector4)color-(Vector4)src.color;s.colorDelta=Mathf.Max(s.colorDelta,delta.magnitude);}s.colorPreserved &= s.colorDelta<=.000001f;
            }}
            s.vertices=points.ToArray();s.vertexCount=points.Count;s.expectedDrawOffset=ground?(r is LineRenderer ? .03f : .025f):0;s.pivotLift=s.pivot.y-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z);
            s.expectedVertexY=points.Select(p=>NativeRemodel3D.GroundY(p.x,p.z)+s.expectedDrawOffset).ToArray();for(int i=0;i<points.Count;i++)s.maxBiasResidual=Mathf.Max(s.maxBiasResidual,Mathf.Abs(points[i].y-s.expectedVertexY[i]));foreach(var p in points)s.maxGroundError=Mathf.Max(s.maxGroundError,Mathf.Abs(p.y-NativeRemodel3D.GroundY(p.x,p.z)));
            s.normal=r.transform.forward;if(points.Count>2){for(int i=2;i<points.Count;i++){var n=Vector3.Cross(points[i-1]-points[0],points[i]-points[0]);if(n.sqrMagnitude>1e-10f){s.normal=n.normalized;break;}}}s.normalUp=Mathf.Abs(Vector3.Dot(s.normal,Vector3.up));float gx=(NativeRemodel3D.GroundY(s.pivot.x+.01f,s.pivot.z)-NativeRemodel3D.GroundY(s.pivot.x-.01f,s.pivot.z))/.02f;float gz=(NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z+.01f)-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z-.01f))/.02f;s.expectedNormal=new Vector3(-gx,1,-gz).normalized;
            s.normalDiagnosticOnly=s.expectedVertexY.Length>0&&s.expectedVertexY.Max()-s.expectedVertexY.Min()>.001f;
            // Before execution: flat normal hard gate only if sampled ground span <=1mm. Slopes retain vertex contact hard gate, normals diagnostic.
            // Fixed 2cm contact tolerance; every active displayed vertex is measured. No baseline exception.
            if(ground&&r is MeshRenderer){var interiorFilter=r.GetComponent<MeshFilter>();if(interiorFilter!=null&&interiorFilter.sharedMesh!=null){s.interior=MeasureInterior(interiorFilter.sharedMesh.triangles,points);s.contribution=MeasureContribution(r,interiorFilter.sharedMesh,points);}}
            s.passed=points.Count>0&&s.uvRangePreserved&&s.uvOrientationPreserved&&s.materialPreserved&&s.texturePreserved&&s.colorPreserved&&s.opacityPreserved&&s.sortingPreserved&&(!ground||(s.maxBiasResidual<=.02f&&Mathf.Abs(s.pivotLift)<=.02f&&(s.normalDiagnosticOnly||Mathf.Abs(Vector3.Dot(s.normal,Vector3.up))>=.99f)));return s;
        }
        static void CaptureDirect(Camera camera,string path){
            var target=new RenderTexture(3840,1080,24,RenderTextureFormat.ARGB32);target.Create();var oldTarget=camera.targetTexture;var oldActive=RenderTexture.active;float aspect=camera.aspect;var rect=camera.rect;
            try{camera.aspect=3840f/1080;camera.rect=new Rect(0,0,1,1);var request=new UniversalRenderPipeline.SingleCameraRequest{destination=target};if(!RenderPipeline.SupportsRenderRequest(camera,request))throw new InvalidOperationException("URP direct render request unsupported");RenderPipeline.SubmitRenderRequest(camera,request);RenderTexture.active=target;var image=new Texture2D(3840,1080,TextureFormat.RGBA32,false);try{image.ReadPixels(new Rect(0,0,3840,1080),0,0);image.Apply();File.WriteAllBytes(path,image.EncodeToPNG());}finally{Destroy(image);}}finally{camera.targetTexture=oldTarget;camera.aspect=aspect;camera.rect=rect;RenderTexture.active=oldActive;target.Release();Destroy(target);}
        }
        static InteriorDiagnostic MeasureInterior(int[] triangles,List<Vector3> world){
            var d=new InteriorDiagnostic();var errors=new List<float>();double absSum=0,signedSum=0;
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
            public Vector2 uv; public Color textureRGBA,vertexRGBA; public float signedResidual,expectedGround,expectedDrawY,textureAlpha,vertexAlpha,flatTintAlpha,flat,opacityRaw,opacityApplied,potentialMax;
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
            public int width,height,mipCount,cameraPixelWidth,cameraPixelHeight; public float flatMaterialRaw,flatPropertyBlockRaw,flatResolved,opacityMaterialRaw,opacityPropertyBlockRaw,opacityRaw,opacityApplied=1;
            public ContributionBucket worstRaw=new ContributionBucket{rule="all valid probes, transparency retained"},positive=new ContributionBucket{rule="potential RGB max > 0"},oneByte=new ContributionBucket{rule="potential RGB max >= 1/255"},onePercent=new ContributionBucket{rule="potential RGB max >= .01"};
        }
        sealed class DecodedTexture {public int width,height;public Color[] pixels;}
        static readonly Dictionary<Texture2D,DecodedTexture> decodedTextures=new Dictionary<Texture2D,DecodedTexture>();
        static void ReleaseDecodedCache(){decodedTextures.Clear();}
        static DecodedTexture DecodeMip0(Texture2D source){
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
        static ContributionDiagnostic MeasureContribution(Renderer renderer,Mesh mesh,List<Vector3> world){
            var d=new ContributionDiagnostic();
            try{
                var material=renderer.sharedMaterial;if(material==null)throw new InvalidOperationException("No actual shared material");d.shader=material.shader.name;
                var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);int flatId=Shader.PropertyToID("_Flat"),opacityId=Shader.PropertyToID("_Opacity");
                d.flatMaterialPresent=material.HasProperty(flatId);d.flatPropertyBlockPresent=block.HasFloat(flatId);d.flatMaterialRaw=d.flatMaterialPresent?material.GetFloat(flatId):0;d.flatPropertyBlockRaw=block.GetFloat(flatId);d.flatResolved=d.flatPropertyBlockPresent?d.flatPropertyBlockRaw:d.flatMaterialRaw;
                d.opacityMaterialPresent=material.HasProperty(opacityId);d.opacityPropertyBlockPresent=block.HasFloat(opacityId);d.opacityMaterialRaw=d.opacityMaterialPresent?material.GetFloat(opacityId):0;d.opacityPropertyBlockRaw=block.GetFloat(opacityId);d.opacityRaw=d.opacityPropertyBlockPresent?d.opacityPropertyBlockRaw:d.opacityMaterialRaw;
                // SkillAdditive has no _Opacity uniform. Its absent raw value is never multiplied into RGB.
                d.opacityApplied=1;
                var texture=block.GetTexture("_MainTex") as Texture2D;if(texture==null&&material.HasProperty("_MainTex"))texture=material.GetTexture("_MainTex") as Texture2D;
                if(texture==null){var source=renderer.GetComponentInParent<SpriteRenderer>();if(source!=null&&source.sprite!=null)texture=source.sprite.texture;}
                if(texture==null)throw new InvalidOperationException("No actual GPU Texture2D _MainTex");
                d.texture=texture.name;d.width=texture.width;d.height=texture.height;d.mipCount=texture.mipmapCount;d.graphicsFormat=texture.graphicsFormat.ToString();d.filterMode=texture.filterMode.ToString();d.wrapU=texture.wrapModeU.ToString();d.wrapV=texture.wrapModeV.ToString();d.activeColorSpace=QualitySettings.activeColorSpace.ToString();
                if(d.shader!="EXODUSER/SkillAdditive")throw new NotSupportedException("No symbolic contribution contract for shader "+d.shader);
                if(contributionCamera==null)throw new InvalidOperationException("No current 1920 diagnostic camera");d.cameraPixelWidth=contributionCamera.pixelWidth;d.cameraPixelHeight=contributionCamera.pixelHeight;
                var decoded=DecodeMip0(texture);var uv=mesh.uv;var colors=mesh.colors;var triangles=mesh.triangles;
                if(uv.Length!=world.Count)throw new InvalidOperationException("Actual mesh UV/vertex mismatch");
                Vector3[] weights={new Vector3(.5f,.5f,0),new Vector3(0,.5f,.5f),new Vector3(.5f,0,.5f),new Vector3(1f/3,1f/3,1f/3)};
                for(int i=0;i+2<triangles.Length;i+=3){int a=triangles[i],b=triangles[i+1],c=triangles[i+2];if(a<0||b<0||c<0||a>=world.Count||b>=world.Count||c>=world.Count)throw new InvalidOperationException("Invalid triangle index");
                    foreach(var w in weights){var point=world[a]*w.x+world[b]*w.y+world[c]*w.z;var texUV=uv[a]*w.x+uv[b]*w.y+uv[c]*w.z;Color vertex=colors.Length==world.Count?colors[a]*w.x+colors[b]*w.y+colors[c]*w.z:Color.white;Color p=SampleDecoded(decoded,texUV,texture.filterMode);
                        float ground=NativeRemodel3D.GroundY(point.x,point.z),tint=d.flatResolved>.5f?Mathf.Max(p.r,Mathf.Max(p.g,p.b)):1,alpha=p.a*vertex.a*tint;Vector3 rgb=d.flatResolved>.5f?Vector3.one:new Vector3(p.r,p.g,p.b);rgb=Vector3.Scale(rgb,new Vector3(vertex.r,vertex.g,vertex.b))*alpha;
                        var probe=new ContributionProbe{actualPoint=point,expectedPoint=new Vector3(point.x,ground+.025f,point.z),uv=texUV,textureRGBA=p,vertexRGBA=vertex,textureAlpha=p.a,vertexAlpha=vertex.a,flatTintAlpha=tint,flat=d.flatResolved,opacityPresent=d.opacityMaterialPresent||d.opacityPropertyBlockPresent,opacityRaw=d.opacityRaw,opacityApplied=1,potentialRGB=rgb,potentialMax=Mathf.Max(rgb.x,Mathf.Max(rgb.y,rgb.z)),expectedGround=ground,expectedDrawY=ground+.025f,signedResidual=point.y-ground-.025f};
                        if(!Finite(point)||!Finite(rgb)||float.IsNaN(probe.signedResidual)||float.IsInfinity(probe.signedResidual))throw new InvalidOperationException("Non-finite interior contribution probe");
                        if(contributionCamera!=null){probe.actualScreen1920=contributionCamera.WorldToScreenPoint(point);probe.expectedScreen1920=contributionCamera.WorldToScreenPoint(probe.expectedPoint);}
                        d.worstRaw.Add(probe);if(probe.potentialMax>0)d.positive.Add(probe);if(probe.potentialMax>=1f/255)d.oneByte.Add(probe);if(probe.potentialMax>=.01f)d.onePercent.Add(probe);
                    }
                }
                if(d.worstRaw.count==0)throw new InvalidOperationException("No valid contribution probes");d.verified=true;
            }catch(Exception ex){d.error=ex.ToString();d.verified=false;}
            d.worstRaw.Finish();d.positive.Finish();d.oneByte.Finish();d.onePercent.Finish();return d;
        }
        static void MeasureVfx(Row row,float x,float y,bool inactive){bool prior=NativeRemodel3D.Active;try{NativeRemodel3D.Active=!inactive;const float lift=.013f;Vector3 a=VfxWorld.ToWorld(x,y,lift),b=VfxWorld.ToWorldMetres(new Vector2(x/100,-y/100),lift);float expected=inactive?lift:NativeRemodel3D.GroundY(x/100,-y/100)+lift;row.shapes.Add(new Shape{kind="VfxWorld.ToWorld",pivot=a,pivotLift=a.y-expected,passed=Mathf.Abs(a.y-expected)<.0001f});row.shapes.Add(new Shape{kind="VfxWorld.ToWorldMetres",pivot=b,pivotLift=b.y-expected,passed=Mathf.Abs(b.y-expected)<.0001f});row.passed=row.shapes.All(s=>s.passed);}finally{NativeRemodel3D.Active=prior;}}
    }
}
