using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

namespace Exoduser.UnityPort.Tools
{
    // Explicit fixture only. Product renderers own every displayed sample.
    public sealed class GroundPlacementCapture : MonoBehaviour
    {
        const BindingFlags Flags=BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic;
        [Serializable] public sealed class Shape {
            public string path,kind,sprite,texture,assertionScope; public bool normalDiagnosticOnly; public string instanceId; public int sortingOrder; public Vector3 pivot,normal,expectedNormal;
            public Rect atlasRect; public Vector2[] sourceSpriteUv; public Vector2[] uv; public Vector3[] vertices; public float[] expectedVertexY;
            public float pivotLift,maxGroundError,normalUp,expectedDrawOffset,maxBiasResidual,opacity; public string shader,sharedMaterial; public Color color; public int vertexCount,triangleCount; public bool forceRenderingOff; public bool passed;
        }
        [Serializable] public sealed class Row {
            public string site,consumer,scope,screenshot,error; public Vector2 core;
            public bool ground,passed; public List<Shape> shapes=new List<Shape>();
        }
        [Serializable] public sealed class Receipt {
            public string source="1403c5ee6d52c540815ab1cf70d5666b9023aa75",device,api,error;
            public string runtimeDllSha,coreDllSha,originalBefore,originalAfter;
            public string[] required,generated,missing; public int width,height,failures,directVideo;
            public bool restored,originalReferenceSame,originalStateSame,listenerPaused,passed;
            public float listenerVolume,peak; public List<Row> rows=new List<Row>();
        }
        static readonly string[] Consumers={"spikeTrap","holyDome","SeekerMines","Mine-first","Projectile-control","Mine-reused","trap","iceZone","blizzard","LavaPools","PoisonPools","GroundRing","Fissures","TideWaves","malice-control","slam-control","character-control","VfxWorld-active","VfxWorld-inactive","telegraph-2D-control"};
        NativeGame game; Simulation original,sample; bool enabledBefore,runningBefore; string output;
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
            output=Arg("-output");receipt.required=Consumers.Concat(new[]{"ground-lifecycle"}).ToArray();AudioListener.pause=true;AudioListener.volume=0;
            var body=Execute();
            while(true){bool next;object current;try{next=body.MoveNext();current=next?body.Current:null;}catch(Exception ex){receipt.error=ex.ToString();break;}if(!next)break;yield return current;}
            try{(body as IDisposable)?.Dispose();}catch(Exception ex){receipt.error=(receipt.error??"")+" cleanup: "+ex;}
            receipt.device=SystemInfo.graphicsDeviceName;receipt.api=SystemInfo.graphicsDeviceType.ToString();receipt.width=Screen.width;receipt.height=Screen.height;
            receipt.generated=generated.OrderBy(x=>x).ToArray();receipt.missing=receipt.required.Where(x=>!generated.Contains(x)).ToArray();
            receipt.listenerPaused=AudioListener.pause;receipt.listenerVolume=AudioListener.volume;float[] audio=new float[1024];AudioListener.GetOutputData(audio,0);foreach(float x in audio)receipt.peak=Mathf.Max(receipt.peak,Mathf.Abs(x));
            foreach(var v in Resources.FindObjectsOfTypeAll<UnityEngine.Video.VideoPlayer>())if(v.audioOutputMode==UnityEngine.Video.VideoAudioOutputMode.Direct)receipt.directVideo++;
            receipt.runtimeDllSha=Dll(typeof(NativeGame));receipt.coreDllSha=Dll(typeof(Simulation));
            receipt.failures=receipt.rows.Count(x=>!x.passed);receipt.passed=receipt.error==null&&receipt.failures==0&&receipt.missing.Length==0&&receipt.restored&&receipt.originalStateSame&&receipt.originalReferenceSame&&receipt.width==1920&&receipt.height==1080&&receipt.listenerPaused&&receipt.listenerVolume==0&&receipt.peak==0&&receipt.directVideo==0;
            try{File.WriteAllText(Path.Combine(output,File.Exists(Path.Combine(output,"ground-placement-receipt.json"))?"ground-placement-failure-"+Guid.NewGuid().ToString("N")+".json":"ground-placement-receipt.json"),JsonUtility.ToJson(receipt,true));}catch(Exception ex){receipt.passed=false;Debug.LogError("GROUND_PLACEMENT receipt write failed "+ex);}
            yield return new WaitForSecondsRealtime(1);Debug.Log("QA_MEDIA_DRAIN_COMPLETE GROUND_PLACEMENT");if(game!=null&&original!=null){SetRunning(runningBefore);game.enabled=enabledBefore;}Application.Quit(receipt.passed?0:2);
        }
        IEnumerator Execute(){
            if(Directory.Exists(output)&&Directory.GetFileSystemEntries(output).Length!=0){Debug.LogError("QA output must be empty");throw new InvalidOperationException("QA output must be empty");}
            Directory.CreateDirectory(output);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
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
            original=game.Simulation;enabledBefore=game.enabled;runningBefore=game.Running;game.enabled=false;SetRunning(false);
            receipt.originalBefore=State(original);
            var setter=typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true);
            sample=new Simulation(new SimulationConfig(),0x671403u);sample.AttachDruidBoss();
            setter.Invoke(game,new object[]{sample});
            try{
                // Prior actual receiver receipt: soil / root boundary / actual wood bridge.
                var sites=new[]{new Vector2(40.2f,-77),new Vector2(36.2916f,-73.17135f),new Vector2(43.2f,-71.8f)};
                string[] labels={"soil","root-slope","wood-bridge"};
                for(int site=0;site<sites.Length;site++){
                    float x=sites[site].x*100,y=-sites[site].y*100;sample.Player.X=x;sample.Player.Y=y;
                    foreach(string consumer in Consumers){
                        Clear();bool ground=Populate(consumer,x,y);Invoke("UpdateViews");var lineBefore=LineState(Field("skillView"));Invoke("Remodel3DLate");
                        var row=new Row{site=labels[site],consumer=consumer,core=new Vector2(x,y),ground=ground,scope=ground?"ground contact/normal":"legacy billboard or 2D control"};
                        if(consumer.StartsWith("VfxWorld"))MeasureVfx(row,x,y,consumer.EndsWith("inactive"));
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
                            object owner=consumer=="character-control"?Field("playerView"):consumer=="spikeTrap"||consumer=="holyDome"||consumer=="malice-control"||consumer=="slam-control"?Field("skillView"):Field("bossView");
                            var renderers=new HashSet<Renderer>();Collect(owner,renderers,new HashSet<object>());
                            foreach(var r in renderers)if(r!=null&&r.enabled&&!r.forceRenderingOff&&r.gameObject.activeInHierarchy){var shape=Measure(r,ground);
                                if(!ground){
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
                    }
                }
                var lifecycle=Lifecycle();try{while(lifecycle.MoveNext())yield return lifecycle.Current;}finally{(lifecycle as IDisposable)?.Dispose();}
            }finally{
                setter.Invoke(game,new object[]{original});Invoke("UpdateViews");Invoke("Remodel3DLate");
                receipt.originalAfter=State(original);receipt.originalReferenceSame=ReferenceEquals(original,game.Simulation);receipt.originalStateSame=receipt.originalBefore==receipt.originalAfter;
                receipt.restored=true; // Keep NativeGame disabled through media drain; restore enable flag immediately before Quit.
            }
        }
        IEnumerator Lifecycle(){
            var root=new GameObject("QA isolated product boss lifecycle");var view=new NativeBossView(root.transform);
            var row=new Row{site="soil",consumer="ground-lifecycle",scope="source enabled/GO/Destroy/2D restore and Mine-projectile-Mine",ground=false,passed=true};
            receipt.rows.Add(row);generated.Add("ground-lifecycle");
            try{
                Clear();sample.Player.X=4020;sample.Player.Y=7700;
                sample.Druid.Projectiles.Add(new BossProjectile{X=4020,Y=7700,Mine=true,Life=100,Ml=180,Active=true});
                view.Update(sample);Invoke("UpdateViews");Invoke("Remodel3DLate");
                var source=root.GetComponentsInChildren<SpriteRenderer>(true).FirstOrDefault(r=>r.enabled&&r.sprite!=null);
                if(source==null){row.passed=false;row.error="No source sprite";yield break;}
                string identity=source.GetEntityId().ToString();var ground=source.GetComponentsInChildren<MeshRenderer>(true).FirstOrDefault(r=>r.enabled&&!r.forceRenderingOff);
                if(ground==null){row.passed=false;row.error="Ground lifecycle display mesh missing (baseline remains FAIL)";yield break;}
                var surfaceShape=Measure(ground,true);row.shapes.Add(surfaceShape);row.passed &= surfaceShape.passed&&surfaceShape.vertexCount==289&&surfaceShape.triangleCount==512;
                var rotation=source.transform.localRotation;var scale=source.transform.localScale;
                source.enabled=false;Invoke("UpdateViews");Invoke("Remodel3DLate");row.passed &= !ground.enabled;source.enabled=true;
                source.gameObject.SetActive(false);yield return null;row.passed &= !ground.enabled;source.gameObject.SetActive(true);
                sample.Druid.Projectiles[0].Mine=false;view.Update(sample);Invoke("UpdateViews");Invoke("Remodel3DLate");
                row.passed &= !source.forceRenderingOff&&!ground.enabled&&source.GetEntityId().ToString()==identity;
                sample.Druid.Projectiles[0].Mine=true;view.Update(sample);Invoke("UpdateViews");Invoke("Remodel3DLate");row.passed &= ground.enabled&&source.forceRenderingOff&&source.GetEntityId().ToString()==identity;
                bool active=NativeRemodel3D.Active,wasArena=sample.Stage.InArena;var oldArena=sample.Stage.Arena;
                // Drive the real presentation transition: merely setting Active=false is re-enabled by Remodel3DSync while Stage remains in the field.
                try{sample.Stage.Arena=BossArenaLayout.Generate(sample.Config.StageIndex);sample.Stage.InArena=true;Invoke("UpdateViews");row.passed &= !NativeRemodel3D.Active&&!ground.enabled&&!source.forceRenderingOff&&source.transform.localScale==scale&&source.transform.localRotation==rotation;}
                finally{sample.Stage.InArena=wasArena;sample.Stage.Arena=oldArena;NativeRemodel3D.Active=active;Invoke("UpdateViews");}
                view.Update(sample);Invoke("UpdateViews");Invoke("Remodel3DLate");
                var surfaceObject=ground.gameObject;Destroy(source.gameObject);yield return null;yield return null;
                row.passed &= source==null&&surfaceObject==null;
            }finally{view.Dispose();Destroy(root);}
        }
        void Clear(){sample.FireZones.Clear();sample.SlamWaves.Clear();sample.MaliceOrbs.Clear();var d=sample.Druid;d.SeekerMines.Clear();d.Projectiles.Clear();d.LavaPools.Clear();d.PoisonPools.Clear();d.ChaseAoes.Clear();d.Fissures.Clear();d.TideWaves.Clear();sample.FieldZones.Clear();}
        bool Populate(string c,float x,float y){
            var d=sample.Druid;
            if(c=="spikeTrap"||c=="holyDome")sample.FireZones.Add(new FireZone{Id=1,Type=c,X=x,Y=y,R=100,T=30,MaxT=180});
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
        static Dictionary<string,Vector3[]> LineState(object owner){var all=new HashSet<Renderer>();Collect(owner,all,new HashSet<object>());var result=new Dictionary<string,Vector3[]>();foreach(var r in all)if(r is LineRenderer line&&line.enabled){var pts=new Vector3[line.positionCount];for(int i=0;i<pts.Length;i++)pts[i]=line.useWorldSpace?line.GetPosition(i):line.transform.TransformPoint(line.GetPosition(i));result[r.GetEntityId().ToString()]=pts;}return result;}
        static void Collect(object o,HashSet<Renderer> found,HashSet<object> seen){
            if(o==null||!seen.Add(o))return;if(o is Renderer rr){foreach(var sibling in rr.gameObject.GetComponentsInChildren<Renderer>(true))found.Add(sibling);return;}
            if(o is GameObject go){foreach(var r in go.GetComponentsInChildren<Renderer>(true))found.Add(r);return;}
            if(o is UnityEngine.Object||o is Simulation||o is Delegate)return;
            if(o is IEnumerable seq){foreach(var v in seq)Collect(v,found,seen);return;}
            var t=o.GetType();if(t.IsPrimitive||t.IsEnum||o is string)return;
            foreach(var f in t.GetFields(Flags))if(!f.IsStatic)Collect(f.GetValue(o),found,seen);
        }
        static Shape Measure(Renderer r,bool ground){
            var s=new Shape{forceRenderingOff=r.forceRenderingOff,shader=r.sharedMaterial==null?"none":r.sharedMaterial.shader.name,sharedMaterial=r.sharedMaterial==null?"none":r.sharedMaterial.name,assertionScope="active sibling/child display renderer; all vertex contact hard gate; slope normal diagnostic",path=r.name,kind=r.GetType().Name,instanceId=r.GetEntityId().ToString(),sortingOrder=r.sortingOrder,pivot=r.transform.position};var points=new List<Vector3>();
            var block=new MaterialPropertyBlock();r.GetPropertyBlock(block);s.opacity=block.GetFloat("_Opacity");s.color=r.sharedMaterial!=null&&r.sharedMaterial.HasProperty("_BaseColor")?r.sharedMaterial.GetColor("_BaseColor"):Color.white;
            if(r is SpriteRenderer sr&&sr.sprite!=null){s.color=sr.color;s.sprite=sr.sprite.name;s.texture=sr.sprite.texture.name;s.atlasRect=sr.sprite.rect;s.sourceSpriteUv=sr.sprite.uv;s.uv=sr.sprite.uv;foreach(var v in sr.sprite.vertices)points.Add(sr.transform.TransformPoint(v));}
            else if(r is LineRenderer line){for(int i=0;i<line.positionCount;i++)points.Add(line.useWorldSpace?line.GetPosition(i):line.transform.TransformPoint(line.GetPosition(i)));}
            else if(r is MeshRenderer){var source=r.GetComponentInParent<SpriteRenderer>();if(source!=null&&source.sprite!=null){s.sprite=source.sprite.name;s.texture=source.sprite.texture.name;s.atlasRect=source.sprite.rect;s.sourceSpriteUv=source.sprite.uv;}var mf=r.GetComponent<MeshFilter>();if(mf!=null&&mf.sharedMesh!=null){s.color=mf.sharedMesh.colors.Length>0?mf.sharedMesh.colors[0]:s.color;s.triangleCount=mf.sharedMesh.triangles.Length/3;s.uv=mf.sharedMesh.uv;foreach(var v in mf.sharedMesh.vertices)points.Add(mf.transform.TransformPoint(v));}}
            s.vertices=points.ToArray();s.vertexCount=points.Count;s.expectedDrawOffset=ground?(r is LineRenderer ? .03f : .025f):0;s.pivotLift=s.pivot.y-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z);
            s.expectedVertexY=points.Select(p=>NativeRemodel3D.GroundY(p.x,p.z)+s.expectedDrawOffset).ToArray();for(int i=0;i<points.Count;i++)s.maxBiasResidual=Mathf.Max(s.maxBiasResidual,Mathf.Abs(points[i].y-s.expectedVertexY[i]));foreach(var p in points)s.maxGroundError=Mathf.Max(s.maxGroundError,Mathf.Abs(p.y-NativeRemodel3D.GroundY(p.x,p.z)));
            s.normal=r.transform.forward;if(points.Count>2){for(int i=2;i<points.Count;i++){var n=Vector3.Cross(points[i-1]-points[0],points[i]-points[0]);if(n.sqrMagnitude>1e-10f){s.normal=n.normalized;break;}}}s.normalUp=Mathf.Abs(Vector3.Dot(s.normal,Vector3.up));float gx=(NativeRemodel3D.GroundY(s.pivot.x+.01f,s.pivot.z)-NativeRemodel3D.GroundY(s.pivot.x-.01f,s.pivot.z))/.02f;float gz=(NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z+.01f)-NativeRemodel3D.GroundY(s.pivot.x,s.pivot.z-.01f))/.02f;s.expectedNormal=new Vector3(-gx,1,-gz).normalized;
            s.normalDiagnosticOnly=s.expectedVertexY.Length>0&&s.expectedVertexY.Max()-s.expectedVertexY.Min()>.001f;
            // Before execution: flat normal hard gate only if sampled ground span <=1mm. Slopes retain vertex contact hard gate, normals diagnostic.
            // Fixed 2cm contact tolerance; every active displayed vertex is measured. No baseline exception.
            s.passed=points.Count>0&&(!ground||(s.maxBiasResidual<=.02f&&Mathf.Abs(s.pivotLift)<=.02f&&(s.normalDiagnosticOnly||Mathf.Abs(Vector3.Dot(s.normal,Vector3.up))>=.99f)));return s;
        }
        static void MeasureVfx(Row row,float x,float y,bool inactive){bool prior=NativeRemodel3D.Active;try{NativeRemodel3D.Active=!inactive;const float lift=.013f;Vector3 a=VfxWorld.ToWorld(x,y,lift),b=VfxWorld.ToWorldMetres(new Vector2(x/100,-y/100),lift);float expected=inactive?lift:NativeRemodel3D.GroundY(x/100,-y/100)+lift;row.shapes.Add(new Shape{kind="VfxWorld.ToWorld",pivot=a,pivotLift=a.y-expected,passed=Mathf.Abs(a.y-expected)<.0001f});row.shapes.Add(new Shape{kind="VfxWorld.ToWorldMetres",pivot=b,pivotLift=b.y-expected,passed=Mathf.Abs(b.y-expected)<.0001f});row.passed=row.shapes.All(s=>s.passed);}finally{NativeRemodel3D.Active=prior;}}
    }
}
