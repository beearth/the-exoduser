using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeLobby
 {
  NativeCharacterStagePreview characterStagePreview;
  internal static bool CharacterStageReviewRequested {
   get {var a=Environment.GetCommandLineArgs();return Array.IndexOf(a,"--unity-character-stage-preview")>=0||Array.IndexOf(a,"--unity-character-stage-check")>=0;}
  }
  internal bool CharacterStageVisible {get{return CharacterStageReviewRequested&&NativeQaSandbox.Active&&IsBlocking&&Flow.Page==LobbyPage.Lobby&&characterStep==1&&!CharacterStoryActive;}}
  internal int CharacterStageVisual {get{return characterVisual;}}
  internal int CharacterStageStep {get{return characterStep;}}
  internal NativeCharacterStagePreview CharacterStage {get{return characterStagePreview;}}
  bool TryDrawCharacterStagePreview(Rect box,int visual)
  {
   if(!CharacterStageVisible)return false;
   if(characterStagePreview==null){CloseCharacterPresentationVideo();characterStagePreview=gameObject.AddComponent<NativeCharacterStagePreview>();characterStagePreview.Initialize(this);}
   if(!characterStagePreview.Ready)return false;
   if(Event.current.type==EventType.Repaint)NativeUiAudit.DrawTexture(box,characterStagePreview.Output,ScaleMode.StretchToFill,false);
   return true;
  }
  Event stageReviewEvent;string stageReviewFocus;
  internal bool CharacterStageReviewInputPending {get{return stageReviewEvent!=null;}}
  internal void CharacterStageReviewInput(Event input,string focus)
  {
   if(!CharacterStageReviewRequested||!NativeQaSandbox.Active||stageReviewEvent!=null)throw new InvalidOperationException("명시적 격리 무대 검수 입력만 허용");
   stageReviewEvent=input;stageReviewFocus=focus;
  }
  // GUI.Button hotControl이 실제 로비와 동일한 GUI 문맥에서 down/up을 받도록 한다.
  bool TryDrawCharacterStageReviewInput()
  {
   if(stageReviewEvent==null||Event.current.type!=EventType.Repaint)return false;
   var old=Event.current;bool automatic=AutomatedInput;
   try{Event.current=stageReviewEvent;AutomatedInput=false;if(stageReviewFocus!=null)GUI.FocusControl(stageReviewFocus);Draw();}
   finally{Event.current=old;AutomatedInput=automatic;stageReviewEvent=null;stageReviewFocus=null;}
   return true;
  }

 }

 // 검토 전용 로비 객체의 RT 카메라. 게임 카메라·Core·원본 프리팹·전역 RenderSettings에는 쓰지 않는다.
 [DefaultExecutionOrder(2000)]
 internal sealed class NativeCharacterStagePreview:MonoBehaviour
 {
  const string Resource="CharacterSelectStagePreview/";
  const int Layer=28;
  [Serializable] public sealed class MaterialSpec {public string name;public float[] color,emission;public float metallic,roughness,normalScale;public int albedo,normal,metalRough;}
  [Serializable] public sealed class StageSpec {public int schema,sourceNodes,meshGroups,triangles,vertices;public string sourceSha256;public MaterialSpec[] materials;}
  [Serializable] public sealed class PoseSample {public float time,leftSole,rightSole;public Vector3 leftFoot,rightFoot,bladeTip,heroPosition;public bool bladePresent;public string motion;}
  public NativeLobby Owner {get;private set;}
  public bool Ready {get;private set;}
  public string Error {get;private set;}="";
  public RenderTexture Output {get;private set;}
  public Camera StageCamera {get;private set;}
  public GameObject Hero {get;private set;}
  public StageSpec Spec {get;private set;}
  public int RenderedFrames {get;private set;}
  public bool HeroVisible {get{return Hero!=null&&Hero.activeInHierarchy;}}
  readonly List<UnityEngine.Object> owned=new List<UnityEngine.Object>();
  readonly Dictionary<int,Texture2D> textures=new Dictionary<int,Texture2D>();
  readonly List<Light> lights=new List<Light>();
  GameObject stageRoot;Material[] materials;NativeHeroMotion motion;Animator animator;Simulation idle;
  Transform footL,footR,heroPivot,breathingChest;Mesh baked;int poseWarmup;bool fitted;float started;
  public Vector3 Origin {get{return new Vector3(10000,0,10000);}}
  public void Initialize(NativeLobby owner)
  {
   Owner=owner;started=Time.unscaledTime;
   try {
    Spec=JsonUtility.FromJson<StageSpec>(Resources.Load<TextAsset>(Resource+"stage").text);
    if(Spec==null||Spec.schema!=1||Spec.sourceNodes!=520)throw new InvalidDataException("무대 고정 입력 누락");
    stageRoot=new GameObject("CharacterSelectStagePreview 사슬 재판정");stageRoot.transform.SetParent(transform,false);stageRoot.transform.position=Origin;stageRoot.layer=Layer;
    materials=new Material[Spec.materials.Length];for(int i=0;i<materials.Length;i++)materials[i]=MakeMaterial(Spec.materials[i]);
    LoadGeometry();BuildRearChamber();BuildHero();BuildCamera();BuildLights();
    RenderPipelineManager.beginCameraRendering+=PrepareHero;RenderPipelineManager.endCameraRendering+=OnRendered;Ready=true;
   }catch(Exception e){Error=e.ToString();Debug.LogError("CHARACTER_STAGE_PREVIEW_FAILED "+e);Ready=false;}
  }
  T Own<T>(T value) where T:UnityEngine.Object {owned.Add(value);return value;}
  Texture2D Texture(int index,bool linear)
  {
   if(index<0)return null;if(textures.TryGetValue(index,out var found))return found;
   var data=Resources.Load<TextAsset>(Resource+"texture"+index);if(data==null)throw new InvalidDataException("무대 텍스처 누락 "+index);
   var tex=Own(new Texture2D(2,2,TextureFormat.RGBA32,true,linear));if(!ImageConversion.LoadImage(tex,data.bytes,false))throw new InvalidDataException("무대 텍스처 해독 실패 "+index);
   tex.name="검토무대 texture"+index;tex.wrapMode=TextureWrapMode.Repeat;tex.anisoLevel=8;textures[index]=tex;return tex;
  }
  Material MakeMaterial(MaterialSpec s)
  {
   var shader=Resources.Load<Shader>(Resource+"StagePBR");if(shader==null)throw new InvalidOperationException("검토 전용 StagePBR 누락");
   var m=Own(new Material(shader){name="검토 전용 "+s.name});m.SetFloat("_Cull",0);m.SetFloat("_Metallic",s.metallic);m.SetFloat("_Smoothness",1-s.roughness);
   var color=new Color(s.color[0],s.color[1],s.color[2],s.color[3]);if(s.name.Contains("검게산화"))color*=new Color(.28f,.25f,.23f,1);m.SetColor("_BaseColor",color);
   if(s.albedo>=0)m.SetTexture("_BaseMap",Texture(s.albedo,false));
   if(s.normal>=0){m.SetTexture("_BumpMap",Texture(s.normal,true));m.SetFloat("_BumpScale",s.normalScale);m.EnableKeyword("_NORMALMAP");}
   if(s.metalRough>=0){var source=Texture(s.metalRough,true);var pixels=source.GetPixels32();for(int i=0;i<pixels.Length;i++){var p=pixels[i];pixels[i]=new Color32((byte)(p.b*s.metallic),0,0,(byte)((255-p.g)*(1-s.roughness)));}
    // glTF roughnessFactor는 거칠기에 곱한다. smoothness=1-(G*roughnessFactor).
    var original=source.GetPixels32();for(int i=0;i<pixels.Length;i++)pixels[i].a=(byte)Mathf.RoundToInt(255-original[i].g*s.roughness);
    var packed=Own(new Texture2D(source.width,source.height,TextureFormat.RGBA32,true,true));packed.name="검토 전용 금속·매끄러움 "+s.name;packed.SetPixels32(pixels);packed.Apply(true,true);packed.wrapMode=TextureWrapMode.Repeat;packed.anisoLevel=8;m.SetTexture("_MetallicGlossMap",packed);m.SetFloat("_Smoothness",1);m.EnableKeyword("_METALLICSPECGLOSSMAP");
   }
   if(s.emission!=null&&s.emission.Length>=3&&s.emission[0]+s.emission[1]+s.emission[2]>0){m.EnableKeyword("_EMISSION");m.SetColor("_EmissionColor",new Color(s.emission[0],s.emission[1],s.emission[2]));}
   return m;
  }
  void LoadGeometry()
  {
    var binary=Resources.Load<TextAsset>(Resource+"stage_geometry");if(binary==null)throw new InvalidDataException("기하 binary 누락");
   using(var reader=new BinaryReader(new MemoryStream(binary.bytes))){if(reader.ReadUInt32()!=0x31505343)throw new InvalidDataException("기하 스키마 불일치");int groups=reader.ReadInt32();
    if(groups!=Spec.meshGroups)throw new InvalidDataException("기하 그룹 불일치");
    for(int g=0;g<groups;g++){int material=reader.ReadInt32(),vc=reader.ReadInt32(),ic=reader.ReadInt32();if(vc<=0||vc>500000||ic<=0||ic>1000000||ic%3!=0)throw new InvalidDataException("기하 수량 불일치");
     var vertices=new Vector3[vc];var normals=new Vector3[vc];var uv=new Vector2[vc];var indices=new int[ic];
     for(int i=0;i<vc;i++){vertices[i]=new Vector3(reader.ReadSingle(),reader.ReadSingle(),reader.ReadSingle());normals[i]=new Vector3(reader.ReadSingle(),reader.ReadSingle(),reader.ReadSingle());uv[i]=new Vector2(reader.ReadSingle(),1-reader.ReadSingle());}
     for(int i=0;i<ic;i++){indices[i]=reader.ReadInt32();if(indices[i]<0||indices[i]>=vc)throw new InvalidDataException("기하 인덱스 범위");}
     var mesh=Own(new Mesh{name="사슬 재판정 material "+material,indexFormat=IndexFormat.UInt32});mesh.vertices=vertices;mesh.normals=normals;mesh.uv=uv;mesh.triangles=indices;mesh.RecalculateBounds();mesh.RecalculateTangents();
     var go=new GameObject(mesh.name);go.transform.SetParent(stageRoot.transform,false);go.layer=Layer;go.AddComponent<MeshFilter>().sharedMesh=mesh;
     var renderer=go.AddComponent<MeshRenderer>();renderer.sharedMaterial=materials[material];renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;
    }if(reader.BaseStream.Position!=reader.BaseStream.Length)throw new InvalidDataException("기하 후미 불일치");
   }
  }
  GameObject Box(string name,Vector3 p,Vector3 s,int mat)
  {
   // 월드 1m 단위 평면 UV. 깊은 벽의 텍스처를 기본 큐브처럼 늘리지 않는다.
   var v=new List<Vector3>();var n=new List<Vector3>();var uv=new List<Vector2>();var ind=new List<int>();
   Vector3[] axes={Vector3.right,Vector3.up,Vector3.forward};for(int a=0;a<3;a++)for(int side=-1;side<=1;side+=2){int b=(a+1)%3,c=(a+2)%3;int first=v.Count;
    int[,] corners={{-1,-1},{1,-1},{1,1},{-1,1}};for(int k=0;k<4;k++){Vector3 x=Vector3.zero;x[a]=s[a]*.5f*side;x[b]=s[b]*.5f*corners[k,0];x[c]=s[c]*.5f*corners[k,1];v.Add(x);n.Add(axes[a]*side);uv.Add(new Vector2(x[b]+p[b],x[c]+p[c]));}
    if(side>0)ind.AddRange(new[]{first,first+1,first+2,first,first+2,first+3});else ind.AddRange(new[]{first,first+2,first+1,first,first+3,first+2});
   }
   var mesh=Own(new Mesh{name=name});mesh.SetVertices(v);mesh.SetNormals(n);mesh.SetUVs(0,uv);mesh.SetTriangles(ind,0);mesh.RecalculateBounds();mesh.RecalculateTangents();
   var go=new GameObject(name);go.layer=Layer;go.transform.SetParent(stageRoot.transform,false);go.transform.localPosition=p;go.AddComponent<MeshFilter>().sharedMesh=mesh;var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=materials[mat];r.receiveShadows=true;r.shadowCastingMode=ShadowCastingMode.On;return go;
  }
  void BuildRearChamber()
  {
   // 기존 depth-finish의 7.62m 후실 설계를 Unity 기하로 구현. 원본 blend/glb는 읽기 전용이다.
   Box("좌 문틀 안쪽",new Vector3(-3.62f,2.8f,6.22f),new Vector3(.62f,5.6f,4.35f),1);
   Box("우 문틀 안쪽",new Vector3(3.62f,2.8f,6.02f),new Vector3(.62f,5.6f,3.95f),1);
   Box("후실 좌벽",new Vector3(-5.05f,3,9.35f),new Vector3(.8f,6,6.5f),1);
   Box("후실 우벽",new Vector3(4.45f,3,9.75f),new Vector3(.8f,6,5.7f),1);
   Box("문지방",new Vector3(0,.33f,4.85f),new Vector3(6.5f,.30f,1.4f),1);
   Box("후실 하강 계단",new Vector3(0,.24f,5.9f),new Vector3(6.5f,.18f,.7f),1);
   Box("후실 연속 바닥",new Vector3(-.2f,.08f,9.2f),new Vector3(9.2f,.16f,6.5f),1);
   Box("후실 관문 좌기단",new Vector3(-3.9f,1.95f,11.12f),new Vector3(.75f,3.9f,.95f),1);
   Box("후실 관문 우기단",new Vector3(.8f,1.95f,11.12f),new Vector3(.75f,3.9f,.95f),1);
   Box("후실 흑철문",new Vector3(-1.55f,1.9f,11.72f),new Vector3(3.65f,3.42f,.18f),3);
   foreach(float x in new[]{-3.24f,-1.55f,.14f})Box("후실 철문 세로골",new Vector3(x,1.9f,11.54f),new Vector3(.1f,3.48f,.12f),2);
   foreach(float y in new[]{.53f,3.15f})Box("후실 철문 빗장",new Vector3(-1.55f,y,11.53f),new Vector3(3.5f,.12f,.14f),2);
   // 한 개의 첨두 통석 리브: 작은 직선 모듈 반복 대신 연속 곡선 단면을 연결한다.
   var vv=new List<Vector3>();var ii=new List<int>();for(int k=0;k<=32;k++){float x=-2.35f+4.7f*k/32f,y=3.15f+1.8f*Mathf.Pow(Mathf.Max(0,1-Mathf.Pow(Mathf.Abs(x)/2.35f,1.6f)),.68f);vv.Add(new Vector3(x-1.55f,y,10.9f));vv.Add(new Vector3(x-1.55f,y,11.3f));vv.Add(new Vector3(x-1.55f,y+.30f,10.9f));vv.Add(new Vector3(x-1.55f,y+.30f,11.3f));if(k<32){int a=k*4,b=(k+1)*4;ii.AddRange(new[]{a,b,a+1,b,b+1,a+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,b+1,b+3,a+3});}}
   var arc=Own(new Mesh{name="후실 첨두 통석 리브"});arc.SetVertices(vv);arc.SetTriangles(ii,0);arc.RecalculateNormals();var au=new Vector2[vv.Count];for(int i=0;i<au.Length;i++)au[i]=new Vector2(vv[i].x,vv[i].y);arc.uv=au;arc.RecalculateTangents();arc.RecalculateBounds();var obj=new GameObject(arc.name);obj.layer=Layer;obj.transform.SetParent(stageRoot.transform,false);obj.AddComponent<MeshFilter>().sharedMesh=arc;obj.AddComponent<MeshRenderer>().sharedMaterial=materials[1];
  }
  void BuildHero()
  {
   var prefab=Resources.Load<GameObject>("Characters/Warrior");if(prefab==null)throw new InvalidDataException("현재 전사 프리팹 없음");
   heroPivot=new GameObject("검토 전사 접지 앵커").transform;heroPivot.SetParent(stageRoot.transform,false);heroPivot.localPosition=new Vector3(0,.48f,-.5f);heroPivot.localRotation=Quaternion.Euler(0,-14,0);
   Hero=Instantiate(prefab,heroPivot);Hero.name="검토 전용 현재 전사 1명";Hero.transform.localPosition=Vector3.zero;Hero.transform.localRotation=Quaternion.identity;Hero.transform.localScale=Vector3.one;
   foreach(var t in Hero.GetComponentsInChildren<Transform>(true))t.gameObject.layer=Layer;
   foreach(var r in Hero.GetComponentsInChildren<Renderer>(true)){r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;}
   animator=Hero.GetComponent<Animator>()??Hero.GetComponentInChildren<Animator>();if(animator==null||!animator.isHuman)throw new InvalidDataException("현재 전사 Humanoid 누락");
   animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;footL=animator.GetBoneTransform(HumanBodyBones.LeftFoot);footR=animator.GetBoneTransform(HumanBodyBones.RightFoot);
   motion=Hero.GetComponent<NativeHeroMotion>()??Hero.AddComponent<NativeHeroMotion>();motion.enabled=false;breathingChest=animator.GetBoneTransform(HumanBodyBones.Chest)??animator.GetBoneTransform(HumanBodyBones.Spine);
   // 전투 시뮬레이션과 다른 독립 대기 표본. Tick/입력/피해/세이브 호출 없음.
   idle=new Simulation(new SimulationConfig{EnemyAiEnabled=false},0x53544147);idle.Player.State="idle";idle.Player.Hp=idle.Player.MaxHp;idle.Player.Shield=idle.Player.MaxShield;
   motion.Sync(idle,false);animator.Update(0);baked=Own(new Mesh{name="검토 전사 접지 측정"});

  }
  void BuildCamera()
  {
   var go=new GameObject("CharacterSelectStagePreview 카메라");go.transform.SetParent(stageRoot.transform,false);go.layer=Layer;
   StageCamera=go.AddComponent<Camera>();StageCamera.transform.localPosition=new Vector3(3.0f,2.85f,-7.8f);StageCamera.transform.LookAt(Origin+new Vector3(.95f,1.5f,.4f));
   StageCamera.fieldOfView=24;StageCamera.nearClipPlane=.12f;StageCamera.farClipPlane=42;StageCamera.cullingMask=1<<Layer;StageCamera.clearFlags=CameraClearFlags.SolidColor;StageCamera.backgroundColor=new Color(.016f,.020f,.026f);StageCamera.allowHDR=true;StageCamera.allowMSAA=true;
   var urp=StageCamera.GetUniversalAdditionalCameraData();urp.renderPostProcessing=false;urp.renderShadows=true;urp.volumeLayerMask=0;urp.antialiasing=AntialiasingMode.SubpixelMorphologicalAntiAliasing;Resize();
  }
  void Resize(){if(Output!=null&&Output.width==Screen.width&&Output.height==Screen.height)return;if(Output!=null){StageCamera.targetTexture=null;Output.Release();Destroy(Output);}Output=new RenderTexture(Mathf.Max(1,Screen.width),Mathf.Max(1,Screen.height),24,RenderTextureFormat.ARGBHalf){name="CharacterStagePreview RT",antiAliasing=2};Output.Create();StageCamera.targetTexture=Output;StageCamera.aspect=(float)Output.width/Output.height;}
  Light Light(string name,Vector3 p,Vector3 target,Color color,float intensity,float range,float angle,bool shadows)
  {
   var go=new GameObject(name);go.layer=Layer;go.transform.SetParent(stageRoot.transform,false);go.transform.localPosition=p;go.transform.LookAt(Origin+target);
   var l=go.AddComponent<Light>();l.type=LightType.Spot;l.color=color;l.intensity=intensity;l.range=range;l.spotAngle=angle;l.innerSpotAngle=angle*.55f;l.cullingMask=1<<Layer;l.renderMode=LightRenderMode.ForcePixel;l.shadows=shadows?LightShadows.Soft:LightShadows.None;l.shadowResolution=LightShadowResolution.High;l.shadowBias=.035f;l.shadowNormalBias=.12f;l.shadowNearPlane=.1f;lights.Add(l);return l;
  }
  void BuildLights()
  {
   Light("전사 따뜻한 주광",new Vector3(-2.3f,5.5f,-3.8f),new Vector3(0,1.2f,-.5f),new Color(1,.94f,.84f),14,16,43,true);
   Light("냉색 림",new Vector3(1,7,3.5f),new Vector3(0,1,-.5f),new Color(.52f,.68f,1),18,18,46,true);
   Light("중성 면보조",new Vector3(4,3.8f,-4),new Vector3(0,1.2f,-.5f),new Color(.72f,.78f,.86f),4,18,85,false);
   Light("후실 은회광",new Vector3(-1.8f,5.65f,9.4f),new Vector3(-.7f,.2f,6.7f),new Color(.70f,.79f,.86f),3,14,85,false);
   Light("후실 호박 잔광",new Vector3(-4.2f,2.9f,8.35f),new Vector3(-2.1f,1.1f,7),new Color(1,.69f,.44f),1.4f,7,80,false);
   foreach(var x in new[]{new Vector3(-5,1.6f,-.1f),new Vector3(4.8f,1.6f,1.6f)}){var go=new GameObject("화로 작은 주황광");go.layer=Layer;go.transform.SetParent(stageRoot.transform,false);go.transform.localPosition=x;var l=go.AddComponent<Light>();l.type=LightType.Point;l.color=new Color(1,.43f,.18f);l.intensity=1.3f;l.range=4;l.cullingMask=1<<Layer;l.shadows=LightShadows.None;lights.Add(l);}
  }
  void Update(){if(!Ready||Owner==null)return;bool visible=Owner.CharacterStageVisible;stageRoot.SetActive(visible);if(!visible)return;Resize();Hero.SetActive(Owner.CharacterStageVisual==0);}
  void PrepareHero(ScriptableRenderContext context,Camera camera)
  {
   if(camera!=StageCamera||!Ready||!HeroVisible)return;
   // 현재 전사의 Idle/무기 홀드만 재사용하고 렌더 직전의 실제 스킨을 잰다.
   Hero.transform.localPosition=Vector3.zero;Hero.transform.localRotation=Quaternion.identity;
   idle.TickCount=Mathf.RoundToInt((Time.unscaledTime-started)*60);motion.Sync(idle,false);
   if(breathingChest!=null)breathingChest.localRotation*=Quaternion.Euler(Mathf.Sin((Time.unscaledTime-started)*1.5f)*.8f,0,0);
   if(!fitted&&poseWarmup++>=2){float low=100,high=-100;foreach(var r in Hero.GetComponentsInChildren<SkinnedMeshRenderer>(true)){r.BakeMesh(baked);foreach(var p in baked.vertices){float y=r.transform.TransformPoint(p).y;low=Mathf.Min(low,y);high=Mathf.Max(high,y);}}
    float height=high-low;if(height<.5f||height>5)throw new InvalidDataException("실제 전사 높이 범위 "+height);heroPivot.localScale*=1.85f/height;fitted=true;}
   var pose=Measure();float sole=Mathf.Min(pose.leftSole,pose.rightSole);if(sole> -2&&sole<3)heroPivot.position+=Vector3.up*(.48f-sole);
  }
  void OnRendered(ScriptableRenderContext context,Camera camera){if(camera==StageCamera)RenderedFrames++;}
  public PoseSample Measure()
  {
   var row=new PoseSample{time=Time.unscaledTime-started,heroPosition=Hero==null?Vector3.zero:Hero.transform.position-Origin,motion=motion==null?"":motion.MotionKind.ToString()};if(Hero==null||footL==null||footR==null)return row;
   row.leftFoot=footL.position-Origin;row.rightFoot=footR.position-Origin;row.leftSole=row.rightSole=100;
   foreach(var r in Hero.GetComponentsInChildren<SkinnedMeshRenderer>(true)){if(!r.enabled)continue;r.BakeMesh(baked);foreach(var p in baked.vertices){var w=r.transform.TransformPoint(p)-Origin;
    if(new Vector2(w.x-row.leftFoot.x,w.z-row.leftFoot.z).sqrMagnitude<.04f&&w.y<row.leftFoot.y+.05f)row.leftSole=Mathf.Min(row.leftSole,w.y);
    if(new Vector2(w.x-row.rightFoot.x,w.z-row.rightFoot.z).sqrMagnitude<.04f&&w.y<row.rightFoot.y+.05f)row.rightSole=Mathf.Min(row.rightSole,w.y);
   }}row.bladePresent=motion.TryGetBladeTip(out var tip);row.bladeTip=tip-Origin;return row;
  }
  void OnDisable(){if(stageRoot!=null)stageRoot.SetActive(false);}
  void OnDestroy(){RenderPipelineManager.beginCameraRendering-=PrepareHero;RenderPipelineManager.endCameraRendering-=OnRendered;if(Output!=null){Output.Release();Destroy(Output);}if(stageRoot!=null)Destroy(stageRoot);foreach(var o in owned)if(o!=null)Destroy(o);}
 }
}
