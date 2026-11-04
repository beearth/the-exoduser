using System;using System.Collections.Generic;using System.IO;using UnityEngine;using UnityEngine.Rendering;using UnityEngine.Rendering.Universal;using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public struct EnemyRigSprites {public SpriteRenderer Body,Walk;public double Distance;}
 public struct EnemyRigImpactAnchor {public Vector3 Point,Ground;public float WorldHeight,ProjectedHeightPx,ChestRatio;public int DeathStartTick,DeathTicks;public bool Large;}
 // After hero rig-pixel and final world-camera writers. One shared capture camera, an isolated layer, one Point RT per visible actor.
 [DefaultExecutionOrder(1001)] public sealed class NativeEnemyRigRenderer:MonoBehaviour {
  const int Layer=28;
  sealed class Actor {
   public EnemyState enemy;public EnemyRigDefinition def;public GameObject root,model;public Renderer[] skins;public MeshRenderer image,contact;public Material composite;
   public RenderTexture texture;public NativeEnemyRigAnimator motion;public NativeEnemyRigPolicy policy=new NativeEnemyRigPolicy();public EnemyRigSample sample;public EnemyRigSprites sprites;
   public int deathTick=-1,lastSeen;public bool ready,hasFrame,failed;public Vector3 ground;public Bounds bounds;
  }
  readonly Dictionary<int,Actor> actors=new Dictionary<int,Actor>();readonly HashSet<int> failedIds=new HashSet<int>();
  readonly Dictionary<string,Material> toonMaterials=new Dictionary<string,Material>();readonly Dictionary<Camera,int> masks=new Dictionary<Camera,int>();
  EnemyRigDefinition[] definitions=Array.Empty<EnemyRigDefinition>();Func<Camera> cameraSource;Func<int,EnemyRigSprites> spriteSource;Func<int,bool> poseFrozen;Simulation simulation;
  Camera capture;UniversalRenderPipeline.SingleCameraRequest request;Shader toon,compositeShader;Material shadow;string output;bool failed;
  Light[] lights=Array.Empty<Light>();int nextLights;readonly Vector4[] lightPositions=new Vector4[4],lightColors=new Vector4[4];readonly float[] lightDistances=new float[4];Light moon;
  public int RenderCount {get;private set;}public int Fallbacks {get;private set;}public int ActiveCount {get{return actors.Count;}}public float RenderMilliseconds {get;private set;}
  public void Initialize(Func<Camera> cameraSource,Func<int,EnemyRigSprites> spriteSource,string output,Func<int,bool> poseFrozen=null){
   this.cameraSource=cameraSource;this.spriteSource=spriteSource;this.output=output;this.poseFrozen=poseFrozen;
   try {
    var data=Resources.Load<TextAsset>("Data/enemy_rig_models");if(data==null)throw new InvalidOperationException("enemy_rig_models missing");definitions=JsonUtility.FromJson<EnemyRigCatalog>(data.text).models??Array.Empty<EnemyRigDefinition>();
    var keys=new HashSet<string>();foreach(var d in definitions){if(d==null||d.baseRadius<=0||d.height<=0||string.IsNullOrEmpty(d.modelResource)||!keys.Add(d.etype+":"+d.startEyeMass))throw new InvalidOperationException("Invalid/duplicate enemy rig model key");}
    toon=Resources.Load<Shader>("Shaders/RigPixelToon");compositeShader=Resources.Load<Shader>("Shaders/RigPixelComposite");if(toon==null||compositeShader==null)throw new InvalidOperationException("Shared rig-pixel shaders missing");
    capture=new GameObject("Enemy rig-pixel capture").AddComponent<Camera>();capture.transform.SetParent(transform,false);capture.enabled=false;capture.orthographic=true;capture.clearFlags=CameraClearFlags.SolidColor;capture.backgroundColor=Color.clear;capture.cullingMask=1<<Layer;capture.nearClipPlane=.01f;capture.farClipPlane=24;capture.allowHDR=false;capture.allowMSAA=false;
    var extra=capture.GetUniversalAdditionalCameraData();extra.renderPostProcessing=false;extra.renderShadows=false;extra.requiresColorOption=CameraOverrideOption.Off;extra.requiresDepthOption=CameraOverrideOption.Off;extra.volumeLayerMask=0;
    request=new UniversalRenderPipeline.SingleCameraRequest();var contact=Resources.Load<Shader>("Shaders/HD2DContact");if(contact!=null)shadow=new Material(contact);
   }catch(Exception e){failed=true;Debug.LogWarning("[EnemyRig] sprite fallback: "+e.Message);}
  }
  EnemyRigDefinition Definition(EnemyState enemy){foreach(var d in definitions)if(d.Matches(enemy))return d;return null;}
  Material ToonMaterial(Material source){
   string name=source!=null?source.name:"enemy_47291a";if(toonMaterials.TryGetValue(name,out var cached))return cached;
   Color color=new Color(.28f,.16f,.10f);int at=name.IndexOf("enemy_",StringComparison.Ordinal);if(at>=0&&name.Length>=at+12)ColorUtility.TryParseHtmlString("#"+name.Substring(at+6,6),out color);
   var m=new Material(toon){name="Enemy rig-pixel "+name};m.SetColor("_PaletteColor",color);m.SetFloat("_SurfaceTag",.55f+toonMaterials.Count*.05f);m.SetFloat("_MetallicPlane",0);toonMaterials.Add(name,m);return m;
  }
  MeshRenderer Quad(string name,Material material){var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name=name;go.transform.SetParent(transform,false);Destroy(go.GetComponent<Collider>());var r=go.GetComponent<MeshRenderer>();r.sharedMaterial=material;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;r.enabled=false;return r;}
  Actor Create(EnemyState e,EnemyRigDefinition d){
   var prefab=Resources.Load<GameObject>(d.modelResource);if(prefab==null)throw new InvalidOperationException("Model missing: "+d.modelResource);
   var a=new Actor{enemy=e,def=d};try {
    a.root=new GameObject("Enemy rig "+e.Id);a.root.transform.SetParent(transform,false);a.model=Instantiate(prefab,a.root.transform);a.model.name=prefab.name;
    a.model.transform.localPosition=Vector3.zero;a.model.transform.localRotation=Quaternion.identity;a.model.transform.localScale=Vector3.one;
    foreach(var tr in a.model.GetComponentsInChildren<Transform>(true))tr.gameObject.layer=Layer;
    a.skins=a.model.GetComponentsInChildren<Renderer>(true);if(a.skins.Length==0)throw new InvalidOperationException("Model has no renderer");
    // Table height/ground are the BODY: weapon props (ritual staff reaches above the head) must not shrink the model, so size by the skinned meshes when there are any.
    var b=default(Bounds);bool hasSkin=false;foreach(var r in a.skins)if(r is SkinnedMeshRenderer){if(hasSkin)b.Encapsulate(r.bounds);else{b=r.bounds;hasSkin=true;}}
    if(!hasSkin){b=a.skins[0].bounds;foreach(var r in a.skins)b.Encapsulate(r.bounds);}
    if(b.size.y<.001f)throw new InvalidOperationException("Model height is zero");
    float scale=d.height/b.size.y;a.model.transform.localScale=Vector3.one*scale;a.model.transform.localPosition=-new Vector3(b.center.x,b.min.y,b.center.z)*scale;
    foreach(var r in a.skins){var old=r.sharedMaterials;var materials=new Material[old.Length];for(int i=0;i<old.Length;i++)materials[i]=ToonMaterial(old[i]);r.sharedMaterials=materials;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;r.forceRenderingOff=true;if(r is SkinnedMeshRenderer skin)skin.updateWhenOffscreen=true;}
    a.motion=new NativeEnemyRigAnimator(a.model,d);a.composite=new Material(compositeShader);a.image=Quad("Enemy rig-pixel "+e.Id,a.composite);if(shadow!=null)a.contact=Quad("Enemy rig ground "+e.Id,shadow);return a;
   }catch{Release(a);throw;}
  }
  void SyncActor(Actor a,int tick){
   a.sprites=spriteSource(a.enemy.Id);if(a.enemy.Alive&&a.hasFrame&&poseFrozen!=null&&poseFrozen(a.enemy.Id))return;a.ground=NativeRemodel3D.Point(a.enemy.X,a.enemy.Y);a.root.transform.SetPositionAndRotation(a.ground,Quaternion.Euler(0,Mathf.Atan2(Mathf.Cos(a.enemy.Facing),-Mathf.Sin(a.enemy.Facing))*Mathf.Rad2Deg,0));a.root.transform.localScale=Vector3.one*Mathf.Max(.01f,a.enemy.Radius/a.def.baseRadius);
   a.sample=a.policy.Sample(a.enemy,tick,a.sprites.Distance);if(!a.enemy.Alive&&a.deathTick<0)a.deathTick=tick;else if(a.enemy.Alive)a.deathTick=-1;
   a.motion.Sample(a.sample,a.sprites.Distance);a.bounds=a.skins[0].bounds;foreach(var r in a.skins)a.bounds.Encapsulate(r.bounds);
  }
  public void Sync(Simulation current){
   if(failed||current==null)return;if(!ReferenceEquals(simulation,current)){Reset();simulation=current;}int tick=current.TickCount;
   if(!NativeRemodel3D.Active){foreach(var a in actors.Values)Fallback(a);return;}
   foreach(var e in current.Enemies){if(current.IsRemodelProp(e))continue;if(!actors.TryGetValue(e.Id,out var a)){if(!e.Alive||failedIds.Contains(e.Id))continue;var d=Definition(e);if(d==null)continue;try{a=Create(e,d);actors.Add(e.Id,a);}catch(Exception ex){failedIds.Add(e.Id);Fallbacks++;Debug.LogWarning("[EnemyRig] "+e.Id+" sprite fallback: "+ex.Message);continue;}}
    // Revived ghouls and any identity changes must return to their own existing art.
    if(!a.def.Matches(e)){Release(a);actors.Remove(e.Id);continue;}a.lastSeen=tick;if(a.failed){Fallback(a);continue;}try{SyncActor(a,tick);if(a.ready)HideSprites(a);}catch(Exception ex){a.failed=true;failedIds.Add(e.Id);Fallbacks++;Fallback(a);Debug.LogWarning("[EnemyRig] animation fallback "+e.Id+": "+ex.Message);}
   }
   var gone=new List<int>();foreach(var pair in actors){var a=pair.Value;if(a.lastSeen==tick)continue;if(a.enemy.Alive||a.deathTick<0||tick-a.deathTick>a.def.deathTicks+96)gone.Add(pair.Key);else if(!a.failed){try{SyncActor(a,tick);}catch(Exception ex){a.failed=true;failedIds.Add(pair.Key);Fallbacks++;Fallback(a);Debug.LogWarning("[EnemyRig] gone-sync fallback "+pair.Key+": "+ex.Message);}}}
   foreach(int id in gone){Release(actors[id]);actors.Remove(id);}
  }
  public void Observe(FeedbackEvent feedback,int tick){if(feedback.Kind==FeedbackKind.EnemyDeath&&actors.TryGetValue(feedback.TargetId,out var a)){a.deathTick=tick;if(!a.failed){try{SyncActor(a,tick);}catch(Exception ex){a.failed=true;failedIds.Add(feedback.TargetId);Fallbacks++;Fallback(a);Debug.LogWarning("[EnemyRig] observe fallback "+feedback.TargetId+": "+ex.Message);}}}}
  static void HideSprites(Actor a){if(a.sprites.Body!=null)a.sprites.Body.enabled=false;if(a.sprites.Walk!=null)a.sprites.Walk.enabled=false;}
  static void Fallback(Actor a){a.ready=false;if(a.image!=null)a.image.enabled=false;if(a.contact!=null)a.contact.enabled=false;if(a.sprites.Body!=null)a.sprites.Body.enabled=a.enemy.Alive;if(a.sprites.Walk!=null)a.sprites.Walk.enabled=false;}
  static Rect ScreenBounds(Camera camera,Bounds b){var min=new Vector2(float.MaxValue,float.MaxValue);var max=new Vector2(float.MinValue,float.MinValue);for(int x=0;x<2;x++)for(int y=0;y<2;y++)for(int z=0;z<2;z++){var p=camera.WorldToScreenPoint(new Vector3(x==0?b.min.x:b.max.x,y==0?b.min.y:b.max.y,z==0?b.min.z:b.max.z));min=Vector2.Min(min,p);max=Vector2.Max(max,p);}return Rect.MinMaxRect(min.x,min.y,max.x,max.y);}
  public EnemyRigImpactAnchor? ImpactAnchor(FeedbackEvent feedback,Camera camera){
   if(failed||!NativeRemodel3D.Active||camera==null)return null;Actor target=null;if(feedback.TargetId!=0)actors.TryGetValue(feedback.TargetId,out target);
   if(target==null){foreach(var a in actors.Values)if(a.enemy.Etype==feedback.Etype&&Mathf.Abs(a.enemy.X-feedback.X)<.1f&&Mathf.Abs(a.enemy.Y-feedback.Y)<.1f){if(target!=null)return null;target=a;}}
   if(target==null||!target.hasFrame||target.failed)return null;var box=ScreenBounds(camera,target.bounds);if(box.height<=0)return null;var foot=camera.WorldToScreenPoint(target.ground);float ratio=(float)NativeEnemyRigPolicy.AnchorRatio(target.def.chestRatio);float y=(float)NativeEnemyRigPolicy.AnchorY(box.yMin,box.yMax,foot.y,box.height,ratio);
   var point=camera.ScreenToWorldPoint(new Vector3(Mathf.Clamp(foot.x,box.xMin,box.xMax),y,foot.z));float wpp=(camera.ScreenToWorldPoint(foot+Vector3.up)-target.ground).magnitude;
   return new EnemyRigImpactAnchor{Point=point,Ground=target.ground,WorldHeight=box.height*wpp,ProjectedHeightPx=box.height,ChestRatio=ratio,DeathStartTick=target.deathTick,DeathTicks=target.def.deathTicks,Large=target.enemy.IsGateGuard||target.enemy.Etype==19};
  }
  void HideLayer(Camera camera){if(camera==null||camera==capture)return;if(!masks.ContainsKey(camera))masks.Add(camera,camera.cullingMask);camera.cullingMask&=~(1<<Layer);}
  void Lighting(Vector3 ground){
   if(lights.Length==0||Time.frameCount>=nextLights){lights=FindObjectsByType<Light>(FindObjectsSortMode.None);nextLights=Time.frameCount+120;}moon=null;for(int i=0;i<4;i++){lightPositions[i]=lightColors[i]=Vector4.zero;lightDistances[i]=float.MaxValue;}
   foreach(var l in lights){if(l==null||!l.isActiveAndEnabled||l.intensity<=0)continue;if(l.type==LightType.Directional){if(moon==null||l.intensity>moon.intensity)moon=l;continue;}if(l.type!=LightType.Point)continue;float d=(l.transform.position-ground).sqrMagnitude;if(d>l.range*l.range||d>=lightDistances[3])continue;int k=3;while(k>0&&d<lightDistances[k-1]){lightDistances[k]=lightDistances[k-1];lightPositions[k]=lightPositions[k-1];lightColors[k]=lightColors[k-1];k--;}lightDistances[k]=d;var p=l.transform.position;lightPositions[k]=new Vector4(p.x,p.y,p.z,l.range);var c=l.color.linear*l.intensity;lightColors[k]=new Vector4(c.r,c.g,c.b,1);}
   Shader.SetGlobalVector("_RigPixelMoonDirection",moon!=null?-moon.transform.forward:Vector3.up);Shader.SetGlobalColor("_RigPixelMoonColor",moon!=null?moon.color.linear*moon.intensity:Color.black);Shader.SetGlobalColor("_RigPixelAmbient",RenderSettings.ambientEquatorColor.linear);Shader.SetGlobalVectorArray("_RigPixelPointPositions",lightPositions);Shader.SetGlobalVectorArray("_RigPixelPointColors",lightColors);
  }
  void LateUpdate(){
   if(failed||simulation==null||capture==null)return;var camera=cameraSource();if(camera==null||!camera.isActiveAndEnabled||!NativeRemodel3D.Active){foreach(var a in actors.Values)Fallback(a);return;}HideLayer(camera);HideLayer(Camera.main);double before=Time.realtimeSinceStartupAsDouble;
   foreach(var a in actors.Values){
    if(a.failed){Fallback(a);continue;}
    if(a.deathTick>=0&&simulation.TickCount-a.deathTick>=a.def.deathTicks){a.ready=false;a.image.enabled=false;if(a.contact!=null)a.contact.enabled=false;continue;}
    var ground=camera.WorldToScreenPoint(a.ground);var viewport=camera.WorldToViewportPoint(a.ground);if(ground.z<=0||viewport.x<-.2||viewport.x>1.2||viewport.y<-.2||viewport.y>1.2){Fallback(a);continue;}
    try{Render(a,camera,ground);}catch(Exception ex){a.failed=true;Fallback(a);failedIds.Add(a.enemy.Id);Fallbacks++;Debug.LogWarning("[EnemyRig] render fallback "+a.enemy.Id+": "+ex.Message);}
   }
   RenderMilliseconds=(float)((Time.realtimeSinceStartupAsDouble-before)*1000);
  }
  void Render(Actor a,Camera camera,Vector3 foot){
   var box=ScreenBounds(camera,a.bounds);float wpp=(camera.ScreenToWorldPoint(foot+Vector3.up)-a.ground).magnitude;if(wpp<=0)throw new InvalidOperationException("Invalid projection");int texel=NativeRigPixelPolicy.TexelScale(camera.pixelHeight);
   int size=NativeRigPixelPolicy.TextureSize(wpp,texel,(Mathf.Max(box.width,box.height)+4*texel)*wpp);if(size==0)throw new InvalidOperationException("Model exceeds safe RT canvas");
   if(a.texture==null||a.texture.width!=size){if(a.texture!=null){a.texture.Release();Destroy(a.texture);}a.texture=new RenderTexture(size,size,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){name="Enemy "+a.enemy.Id+" Point RT",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,antiAliasing=1,useMipMap=false,autoGenerateMips=false};a.texture.Create();a.composite.SetTexture("_MainTex",a.texture);}
   float extent=size*wpp*texel,cx=Mathf.Round((box.center.x-foot.x)/texel)*wpp*texel,cy=Mathf.Round((box.center.y-foot.y)/texel)*wpp*texel;
   capture.orthographicSize=extent*.5f;capture.aspect=1;capture.transform.SetPositionAndRotation(a.ground+camera.transform.right*cx+camera.transform.up*cy-camera.transform.forward*8,camera.transform.rotation);request.destination=a.texture;
   var snap=NativeHd2D.SnapAnchor(camera,a.ground);a.image.transform.SetPositionAndRotation(snap+camera.transform.right*cx+camera.transform.up*cy,camera.transform.rotation);a.image.transform.localScale=new Vector3(extent,extent,1);a.image.sortingOrder=(int)a.enemy.Y;
   Lighting(a.ground);var direction=moon!=null?-moon.transform.forward:new Vector3(-.6f,1,-.4f);a.composite.SetVector("_RimDirection",new Vector4(Vector3.Dot(direction,camera.transform.right),Vector3.Dot(direction,camera.transform.up),0,0));a.composite.SetColor("_RimColor",(moon!=null?moon.color:new Color(.62f,.75f,.9f))*.08f);
   foreach(var r in a.skins)r.forceRenderingOff=false;
   try{if(!RenderPipeline.SupportsRenderRequest(capture,request))throw new InvalidOperationException("URP SingleCameraRequest unsupported");RenderPipeline.SubmitRenderRequest(capture,request);}finally{foreach(var r in a.skins)r.forceRenderingOff=true;}
   a.hasFrame=a.ready=true;a.image.enabled=true;HideSprites(a);RenderCount++;
   if(a.contact!=null){a.contact.enabled=a.enemy.Alive;a.contact.sortingOrder=a.image.sortingOrder-1;a.contact.transform.SetPositionAndRotation(a.ground+Vector3.up*.018f,Quaternion.Euler(90,0,0));float radius=a.enemy.Radius*.02f;a.contact.transform.localScale=new Vector3(radius*2,radius,1);}
  }
  [Serializable] sealed class Receipt {public string gate="PC compile only; Mac visual QA pending";public int renders,fallbacks,actors,missingClips;public float renderMs;public Entry[] entries;}
  [Serializable] sealed class Entry {public int id,etype;public bool startEyeMass,ready;public string model,state;public int deathStartTick,deathTicks,missingClips;public float height,chestRatio;}
  public void WriteReceipt(string directory){if(string.IsNullOrEmpty(directory))return;var rows=new List<Entry>();int missing=0;foreach(var a in actors.Values){missing+=a.motion.MissingStates;rows.Add(new Entry{id=a.enemy.Id,etype=a.enemy.Etype,startEyeMass=a.enemy.IsStartEyeMass,ready=a.ready,model=a.def.modelResource,state=a.sample.State.ToString(),deathStartTick=a.deathTick,deathTicks=a.def.deathTicks,height=a.def.height,chestRatio=a.def.chestRatio,missingClips=a.motion.MissingStates});}Directory.CreateDirectory(directory);File.WriteAllText(Path.Combine(directory,"enemy3d-render.json"),JsonUtility.ToJson(new Receipt{renders=RenderCount,fallbacks=Fallbacks,actors=actors.Count,missingClips=missing,renderMs=RenderMilliseconds,entries=rows.ToArray()},true));}
  void Release(Actor a){Fallback(a);a.motion?.Dispose();if(a.texture!=null){a.texture.Release();Destroy(a.texture);}if(a.composite!=null)Destroy(a.composite);if(a.image!=null)Destroy(a.image.gameObject);if(a.contact!=null)Destroy(a.contact.gameObject);if(a.root!=null)Destroy(a.root);}
  public void Reset(){foreach(var a in actors.Values)Release(a);actors.Clear();failedIds.Clear();simulation=null;}
  void OnDestroy(){WriteReceipt(output);Reset();foreach(var p in masks)if(p.Key!=null)p.Key.cullingMask=(p.Key.cullingMask&~(1<<Layer))|(p.Value&(1<<Layer));foreach(var m in toonMaterials.Values)if(m!=null)Destroy(m);if(shadow!=null)Destroy(shadow);}
 }
}
