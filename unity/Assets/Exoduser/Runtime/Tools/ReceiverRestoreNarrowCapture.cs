using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Tools {
// QA-only companion to bf3e. No product edits, ticks, probes or full/triad loops.
public sealed partial class ReceiverRestoreNarrowCapture : MonoBehaviour {
 const BindingFlags F=BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Instance;
 const BindingFlags S=BindingFlags.Public|BindingFlags.NonPublic|BindingFlags.Static;
 const string Flag="--unity-receiver-restore-narrow";
 [Serializable] public sealed class OldRenderer {
  public string id,name,category; public bool alive,exact,enabled,off,active; public string[] materials;
  [NonSerialized] public Renderer value; [NonSerialized] public Material[] refs; [NonSerialized] public Sprite sprite; [NonSerialized] public Texture spriteTexture;
 }
 [Serializable] public sealed class ActorRow { public int entity; public string body,walk,contact; public bool registered,overlayLinked,contactLinked,oneContact,valid; }
 [Serializable] public sealed class Result {
  public string source,baseSource,productTip,stage,error,cleanupError,coreBefore,coreAfter,fixtureBefore,fixtureAfter,eventBefore,eventAfter;
  public string scope="One actual original field -> empty-enemy shifted fixture -> original view sync; no Core Tick, no full161/triad replay. Old identities and semantic gate are independent.";
  public int oldCount,oldMissing,oldAliveChanged,oldEnemyMissing,oldContactMissing,oldGroundMissing,initialEnemies,initialChunks,tickBefore,tickAfter,errors;
  public bool originalRefSame,coreSame,eventSame,fixtureCoreSame,stableSurvivorsExact,stableAssetsExact,oldIdentityGate,entityGate,groundGate,registryGate,resourceGate,paused,cameraRootGate,fixtureExercised,cleanupReturned,semanticGate,passed;
  public List<OldRenderer> old=new List<OldRenderer>(); public List<ActorRow> actors=new List<ActorRow>(); public List<string> failures=new List<string>(); public List<int> neededGround=new List<int>(),actualGround=new List<int>();
 }
 sealed class RootState { public GameObject go; public bool active; }
 sealed class CameraState { public Camera camera; public Transform parent; public Vector3 position,scale; public Quaternion rotation; public Matrix4x4 projection; public int mask; public bool enabled; public float fov,ortho,near,far,aspect; public bool orthographic; }
 NativeGame game; Simulation original,fixture; Behaviour late; bool oldEnabled,oldRunning,oldLate,nativeActive; string output;
 Result r=new Result(); List<RootState> roots=new List<RootState>(); List<CameraState> cameras=new List<CameraState>();
 HashSet<Material> assets=new HashSet<Material>(); Dictionary<Material,Shader> assetShaders=new Dictionary<Material,Shader>(); Dictionary<Material,Dictionary<string,Texture>> assetTextures=new Dictionary<Material,Dictionary<string,Texture>>();
 readonly List<string> logErrors=new List<string>(); bool captured,cleaned,cleanupAttempted;
 static string Arg(string key){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:"";}
 static bool Has(string key){return Array.IndexOf(Environment.GetCommandLineArgs(),key)>=0;}
 [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot(){
  if(!Has(Flag))return;
  var a=Environment.GetCommandLineArgs();
  // Never start another capture owner in the same process.
  if(a.Any(x=>x=="--unity-ground-placement-capture"||x=="--unity-m1-check"||x=="--unity-playtest-capture"||x=="--unity-natural-frame-observe"||x.StartsWith("-ground-receiver-",StringComparison.Ordinal))||!Has("--remodel3d")||!Has("--unity-quick-start")||!Path.IsPathRooted(Arg("--unity-qa-sandbox"))||!Path.IsPathRooted(Arg("-output"))){Debug.LogError("RESTORE_NARROW invalid/conflicting explicit arguments");Application.Quit(2);return;}
  new GameObject("Receiver restore narrow QA owner").AddComponent<ReceiverRestoreNarrowCapture>();
 }
 object Get(object o,string name){if(o==null)throw new InvalidOperationException("null owner: "+name);var t=o.GetType();var f=t.GetField(name,F);if(f!=null)return f.GetValue(o);var p=t.GetProperty(name,F);if(p!=null)return p.GetValue(o);throw new MissingMemberException(t.FullName,name);}
 object Field(string name){return Get(game,name);}
 void Call(string name){typeof(NativeGame).GetMethod(name,F).Invoke(game,null);}
 void SimulationSet(Simulation value){typeof(NativeGame).GetProperty("Simulation").GetSetMethod(true).Invoke(game,new object[]{value});}
 void RunningSet(bool value){typeof(NativeGame).GetProperty("Running").GetSetMethod(true).Invoke(game,new object[]{value});}
 static string State(object o){return (string)typeof(GroundPlacementCapture).GetMethod("State",S).Invoke(null,new[]{o});}
 static string Events(object o){if(o==null)return "null";return string.Join("|",o.GetType().GetFields(F).Where(f=>typeof(Delegate).IsAssignableFrom(f.FieldType)).OrderBy(f=>f.Name).Select(f=>f.Name+":"+State(f.GetValue(o))));}
 static string Id(UnityEngine.Object o){return o==null?"null":o.GetEntityId().ToString();}
 static string Category(Renderer x){return x.name.StartsWith("HD2D contact: ",StringComparison.Ordinal)?"contact":x.name.StartsWith("Enemy ",StringComparison.Ordinal)?"enemy":x.name.StartsWith("Ground ",StringComparison.Ordinal)?"ground":"stable";}
 void Check(bool value,string why){if(!value)r.failures.Add(why);}
 void Save(string stage){r.stage=stage;var p=Path.Combine(output,"restore-narrow.json");File.WriteAllText(p,JsonUtility.ToJson(r,true));}
 void OnLog(string message,string stack,LogType type){if(type==LogType.Error||type==LogType.Exception||type==LogType.Assert)logErrors.Add(type+": "+message+"\n"+stack);}
 IEnumerator Start(){
  output=Arg("-output");
  if(!NativeQaSandbox.Active||!Directory.Exists(NativeQaSandbox.Root)||Directory.Exists(output)&&Directory.EnumerateFileSystemEntries(output).Any()){Debug.LogError("RESTORE_NARROW requires active sandbox and empty output");Application.Quit(2);yield break;}
  Directory.CreateDirectory(output);r.source=Arg("-source-sha");r.baseSource=Arg("-restore-base-source-sha");r.productTip=Arg("-product-source-sha");AudioListener.pause=true;AudioListener.volume=0;Application.logMessageReceived+=OnLog;
  var routine=Body();
  while(true){bool next=false;object current=null;try{next=routine.MoveNext();if(next)current=routine.Current;}catch(Exception ex){r.error=ex.ToString();}if(!next)break;yield return current;}
  try{(routine as IDisposable)?.Dispose();}catch(Exception ex){r.cleanupError=ex.ToString();}
  try{Cleanup();}catch(Exception ex){r.cleanupError=(r.cleanupError??"")+ex;}
  // Allow native deferred destruction to settle while all original writers remain paused.
  yield return null;yield return null;
  try{if(captured&&cleaned){Validate();RestoreCameraRoots();ValidateCameraRoots();}else Check(false,"baseline/cleanup did not complete");}catch(Exception ex){r.cleanupError=(r.cleanupError??"")+ex;}
  r.errors=logErrors.Count;r.semanticGate=captured&&cleaned&&string.IsNullOrEmpty(r.error)&&string.IsNullOrEmpty(r.cleanupError)&&r.coreSame&&r.originalRefSame&&r.fixtureCoreSame&&r.eventSame&&r.stableSurvivorsExact&&r.stableAssetsExact&&r.entityGate&&r.groundGate&&r.registryGate&&r.resourceGate&&r.paused&&r.cameraRootGate&&r.fixtureExercised&&r.errors==0;
  r.passed=r.semanticGate; // oldIdentityGate intentionally NOT rewritten or included in semantic gate.
  File.WriteAllText(Path.Combine(output,"error-events.json"),JsonUtility.ToJson(new ErrorEvents{events=logErrors},true));Save("final");Application.logMessageReceived-=OnLog;
  // Original enabled/Running/late states are recorded, not resumed: no hidden Core tick before exit.
  File.WriteAllText(Path.Combine(output,"writer-before.json"),JsonUtility.ToJson(new WriterBefore{enabled=oldEnabled,running=oldRunning,late=oldLate},true));
  Debug.Log("QA_MEDIA_DRAIN_COMPLETE RECEIVER_RESTORE_NARROW");Application.Quit(r.passed?0:2);
 }
 [Serializable] sealed class ErrorEvents { public List<string> events; }
 [Serializable] sealed class WriterBefore { public bool enabled,running,late; }
 IEnumerator Body(){
  if(string.IsNullOrWhiteSpace(r.source)||r.baseSource!="bf3e93a63425a17ede0fa6a0ca16e066374cc984"||r.productTip!="e33ed53574a187db36e00dfbd1f92b4d6f263635")throw new InvalidOperationException("Reviewed bf3e/e33 input identity required; Root must record companion assembly hash separately");
  float deadline=Time.realtimeSinceStartup+60;bool entered=false;
  while(Time.realtimeSinceStartup<deadline){game=FindAnyObjectByType<NativeGame>();if(game!=null&&game.Simulation!=null&&!entered){var lobby=Field("lobby");var flow=Get(lobby,"Flow");flow.GetType().GetMethod("ShowLobby").Invoke(flow,null);flow.GetType().GetMethod("SelectPreview").Invoke(flow,null);if(!(bool)lobby.GetType().GetMethod("EnterNativeTest").Invoke(lobby,null))throw new InvalidOperationException("Native field entry failed");entered=true;}
   if(entered&&NativeRemodel3D.Active&&Field("a2Field")!=null&&Field("r3Cam")!=null)break;yield return null;}
  if(!entered||!NativeRemodel3D.Active)throw new InvalidOperationException("Actual field not ready");
  original=game.Simulation;oldEnabled=game.enabled;oldRunning=game.Running;late=Field("r3Late") as Behaviour;oldLate=late!=null&&late.enabled;game.enabled=false;RunningSet(false);if(late!=null)late.enabled=false;
  var media=Field("lobby");media.GetType().GetMethod("CloseStartupCaptureMedia",F).Invoke(media,null);((Behaviour)media).enabled=false;
  // Establish a real original-view baseline without advancing Simulation.Tick.
  Sync();yield return null;yield return null;Sync();Capture();Save("original-baseline");
  try{
   fixture=new Simulation(new SimulationConfig(),0x671403u);fixture.AttachDruidBoss();fixture.Enemies.Clear();fixture.Player.X=36.2916f*100-180;fixture.Player.Y=73.17135f*100+80;
   r.fixtureBefore=State(fixture);CaptureFixtureBindings();CaptureFixtureGraph("before-fixture");SimulationSet(fixture);Sync();yield return null;yield return null;CaptureFixtureGraph("fixture-settled");Save("fixture-settled");
  }finally{Cleanup();}
 }
 void Sync(){Call("UpdateViews");Call("Remodel3DLate");}
 void Capture(){
  r.coreBefore=State(original);r.eventBefore=Events(original)+"/druid/"+Events(original.Druid);r.tickBefore=original.TickCount;nativeActive=NativeRemodel3D.Active;
  foreach(var x in UnityEngine.Object.FindObjectsByType<Renderer>(FindObjectsInactive.Include,FindObjectsSortMode.None).Where(x=>x!=null&&x.gameObject.scene.IsValid())){
   var mats=x.sharedMaterials;r.old.Add(new OldRenderer{value=x,id=Id(x),name=x.name,category=Category(x),enabled=x.enabled,off=x.forceRenderingOff,active=x.gameObject.activeSelf,refs=mats,materials=mats.Select(Id).ToArray(),sprite=(x as SpriteRenderer)?.sprite,spriteTexture=(x as SpriteRenderer)?.sprite?.texture});
   foreach(var m in mats)if(m!=null&&assets.Add(m)){assetShaders[m]=m.shader;assetTextures[m]=CaptureMaterialTextures(m);}
  }
  foreach(var scene in r.old.Select(x=>x.value.gameObject.scene).Distinct())foreach(var go in scene.GetRootGameObjects())if(go!=gameObject)roots.Add(new RootState{go=go,active=go.activeSelf});
  foreach(var c in UnityEngine.Object.FindObjectsByType<Camera>(FindObjectsInactive.Include,FindObjectsSortMode.None))cameras.Add(new CameraState{camera=c,parent=c.transform.parent,position=c.transform.localPosition,rotation=c.transform.localRotation,scale=c.transform.localScale,projection=c.projectionMatrix,mask=c.cullingMask,enabled=c.enabled,fov=c.fieldOfView,ortho=c.orthographicSize,near=c.nearClipPlane,far=c.farClipPlane,aspect=c.aspect,orthographic=c.orthographic});
  r.initialEnemies=((IDictionary)Field("enemies")).Count;r.initialChunks=((IDictionary)Field("chunks")).Count;
  if(r.initialEnemies==0||r.initialChunks==0)throw new InvalidOperationException("Original scene must contain enemies and ground chunks");captured=true;
 }
 void Cleanup(){
  if(cleanupAttempted||!captured||game==null||original==null)return;cleanupAttempted=true;
  SimulationSet(original);game.enabled=false;RunningSet(false);if(late!=null)late.enabled=false;RestoreCameraRoots();Sync();RestoreCameraRoots();
  // Restore flags/materials only on surviving originals; never substitute new references for old IDs.
  foreach(var x in r.old)if(x.value!=null){x.value.sharedMaterials=x.refs;x.value.forceRenderingOff=x.off;x.value.enabled=x.enabled;x.value.gameObject.SetActive(x.active);}
  CaptureFixtureGraph("after-native-restore");RestoreFixtureViewportBindings();cleaned=true;r.cleanupReturned=true;
 }
 void RestoreCameraRoots(){
  foreach(var x in roots)if(x.go!=null)x.go.SetActive(x.active);
  foreach(var x in cameras)if(x.camera!=null){var c=x.camera;c.transform.SetParent(x.parent,false);c.transform.localPosition=x.position;c.transform.localRotation=x.rotation;c.transform.localScale=x.scale;c.fieldOfView=x.fov;c.orthographicSize=x.ortho;c.nearClipPlane=x.near;c.farClipPlane=x.far;c.aspect=x.aspect;c.orthographic=x.orthographic;c.projectionMatrix=x.projection;c.cullingMask=x.mask;c.enabled=x.enabled;}
 }
 void ValidateCameraRoots(){r.cameraRootGate=NativeRemodel3D.Active==nativeActive&&roots.All(x=>x.go!=null&&x.go.activeSelf==x.active)&&cameras.All(x=>x.camera!=null&&x.camera.transform.parent==x.parent&&x.camera.transform.localPosition.Equals(x.position)&&x.camera.transform.localRotation.Equals(x.rotation)&&x.camera.transform.localScale.Equals(x.scale)&&x.camera.projectionMatrix.Equals(x.projection)&&x.camera.cullingMask==x.mask&&x.camera.enabled==x.enabled);Check(r.cameraRootGate,"camera/root restoration");}
 void Validate(){
  CaptureFixtureGraph("after-binding-cleanup");r.coreAfter=State(original);r.fixtureAfter=State(fixture);r.eventAfter=Events(original)+"/druid/"+Events(original.Druid);r.tickAfter=original.TickCount;r.originalRefSame=ReferenceEquals(game.Simulation,original);r.coreSame=r.coreBefore==r.coreAfter&&r.tickBefore==r.tickAfter;r.fixtureCoreSame=r.fixtureBefore==r.fixtureAfter;r.eventSame=r.eventBefore==r.eventAfter;
  foreach(var x in r.old){x.alive=x.value!=null;x.exact=x.alive&&Id(x.value)==x.id&&x.value.enabled==x.enabled&&x.value.forceRenderingOff==x.off&&x.value.gameObject.activeSelf==x.active&&x.value.sharedMaterials.SequenceEqual(x.refs);}
  r.oldCount=r.old.Count;r.oldMissing=r.old.Count(x=>!x.alive);r.oldAliveChanged=r.old.Count(x=>x.alive&&!x.exact);r.oldEnemyMissing=r.old.Count(x=>!x.alive&&x.category=="enemy");r.oldContactMissing=r.old.Count(x=>!x.alive&&x.category=="contact");r.oldGroundMissing=r.old.Count(x=>!x.alive&&x.category=="ground");r.oldIdentityGate=r.old.All(x=>x.exact);
  r.stableSurvivorsExact=r.old.All(x=>x.alive?x.exact:x.category!="stable");r.stableAssetsExact=ValidateStableAssets();
  var hd=typeof(NativeHd2D);var actors=(IDictionary)hd.GetField("actors",S).GetValue(null);var overlays=(IDictionary)hd.GetField("overlayBases",S).GetValue(null);var shadows=(IDictionary)hd.GetField("shadows",S).GetValue(null);var enemyViews=(IDictionary)Field("enemies");
  var ids=new HashSet<int>(original.Enemies.Select(e=>e.Id));var bodies=new HashSet<SpriteRenderer>();var walks=new HashSet<SpriteRenderer>();var contacts=new HashSet<MeshRenderer>();
  r.entityGate=enemyViews.Count==ids.Count;
  foreach(var e in original.Enemies){var row=new ActorRow{entity=e.Id};r.actors.Add(row);if(!enemyViews.Contains(e.Id)){r.entityGate=false;continue;}var ev=enemyViews[e.Id];var body=Get(ev,"body") as SpriteRenderer;var walk=Get(ev,"walk") as SpriteRenderer;row.body=Id(body);row.walk=Id(walk);row.registered=body!=null&&walk!=null&&actors.Contains(body)&&actors.Contains(walk);row.overlayLinked=walk!=null&&body!=null&&overlays.Contains(walk)&&ReferenceEquals(overlays[walk],body);
   var contact=body!=null&&shadows.Contains(body)?shadows[body] as MeshRenderer:null;row.contact=Id(contact);row.contactLinked=contact!=null&&contact.transform.parent==body.transform.parent&&contact.sharedMaterial!=null&&contact.sharedMaterial.shader!=null&&ReferenceEquals(contact.sharedMaterial,hd.GetField("contact",S).GetValue(null));row.oneContact=contact!=null&&contacts.Add(contact)&&!shadows.Contains(walk);
   row.valid=row.registered&&row.overlayLinked&&row.contactLinked&&row.oneContact&&bodies.Add(body)&&walks.Add(walk)&&body.enabled==e.Alive&&(!walk.enabled||e.Alive)&&(!e.Alive||contact.enabled);r.entityGate &= row.valid;
  }
  // Registry identity relationships, not object-name matching. Detect destroyed actor/contact keys and orphan contact GOs.
  r.registryGate=true;var registeredContacts=new HashSet<MeshRenderer>();
  foreach(DictionaryEntry pair in actors)if((pair.Key as SpriteRenderer)==null)r.registryGate=false;
  foreach(DictionaryEntry pair in overlays)if((pair.Key as SpriteRenderer)==null||(pair.Value as SpriteRenderer)==null||!actors.Contains(pair.Key)||!actors.Contains(pair.Value))r.registryGate=false;
  foreach(DictionaryEntry pair in shadows){var sr=pair.Key as SpriteRenderer;var shadow=pair.Value as MeshRenderer;if(sr==null||shadow==null||!actors.Contains(pair.Key)||!registeredContacts.Add(shadow))r.registryGate=false;}
  var all=UnityEngine.Object.FindObjectsByType<MeshRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None).Where(x=>x!=null&&x.gameObject.scene.IsValid()&&x.name.StartsWith("HD2D contact: ",StringComparison.Ordinal)).ToArray();r.registryGate &= all.Length==registeredContacts.Count&&all.All(registeredContacts.Contains);
  var sceneEnemies=UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None).Where(x=>x!=null&&x.gameObject.scene.IsValid()&&Category(x)=="enemy").ToArray();r.entityGate &= sceneEnemies.Length==bodies.Count+walks.Count&&sceneEnemies.All(x=>bodies.Contains(x)||walks.Contains(x));
  var view=(Camera)Field("view");var range=NativeWorldChunkRange.Fit(view.transform.position.x*100,-view.transform.position.y*100,view.orthographicSize*100*view.aspect,view.orthographicSize*100);var needed=game.Map.Data.chunks.Where(c=>range.Contains((int)(c.x/1000),(int)(c.y/1000))).ToDictionary(c=>(int)(c.y/1000)*8+(int)(c.x/1000));var chunks=(IDictionary)Field("chunks");r.neededGround=needed.Keys.OrderBy(x=>x).ToList();r.actualGround=chunks.Keys.Cast<int>().OrderBy(x=>x).ToList();r.groundGate=r.neededGround.SequenceEqual(r.actualGround);
  foreach(DictionaryEntry pair in chunks){var renderer=Get(pair.Value,"renderer") as SpriteRenderer;var key=(int)pair.Key;bool valid=needed.ContainsKey(key)&&renderer!=null&&renderer.sprite!=null;if(valid){var c=needed[key];var sprite=renderer.sprite;valid=Equals(Get(pair.Value,"path"),c.texture)&&sprite.texture!=null&&sprite.rect.Equals(new Rect(c.sx,sprite.texture.height-c.sy-c.sh,c.sw,c.sh))&&sprite.pivot.Equals(new Vector2(0,c.sh))&&renderer.sortingOrder==-30000;}r.groundGate &= valid;}
  var sceneGround=UnityEngine.Object.FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None).Where(x=>x!=null&&x.gameObject.scene.IsValid()&&Category(x)=="ground").ToArray();var registeredGround=chunks.Values.Cast<object>().Select(x=>Get(x,"renderer") as SpriteRenderer).ToArray();r.groundGate &= sceneGround.Length==registeredGround.Length&&sceneGround.All(registeredGround.Contains);
  r.resourceGate=r.stableAssetsExact&&r.registryGate&&r.fixtureCoreSame&&r.eventSame&&registeredContacts.All(x=>x!=null&&x.sharedMaterial!=null);
  r.paused=!game.enabled&&!game.Running&&(late==null||!late.enabled);r.fixtureExercised=r.oldEnemyMissing>0&&r.oldContactMissing>0&&r.oldGroundMissing>0;
  Check(r.coreSame&&r.originalRefSame,"original Core hash/reference/tick");Check(r.fixtureCoreSame&&r.eventSame,"fixture resource/event binding not restored");Check(r.stableSurvivorsExact&&r.stableAssetsExact,"stable/surviving originals");Check(r.entityGate,"entity body/walk/contact relationship");Check(r.groundGate,"required ground chunk relationship");Check(r.registryGate,"registry duplicate/missing/orphan");Check(r.resourceGate,"resource/event cleanup");Check(r.fixtureExercised,"fixture did not exercise enemy/contact/chunk destruction");
 }
}
}
