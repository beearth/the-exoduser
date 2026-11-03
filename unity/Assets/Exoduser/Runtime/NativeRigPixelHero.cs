using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort {
 // Runs after Core-sampled IK (90), cape (100), and the final HD2D camera writer (0).
 [DefaultExecutionOrder(1000)]
 public sealed class NativeRigPixelHero : MonoBehaviour {
  const int RigLayer=30;
  NativeHeroView hero;Func<Camera> cameraSource;SpriteRenderer fallback;
  Camera capture;MeshRenderer image,contact;RenderTexture texture;Material composite,shadowMaterial;
  readonly List<Material> ownedMaterials=new List<Material>();
  readonly Dictionary<Camera,int> masks=new Dictionary<Camera,int>();
  UniversalRenderPipeline.SingleCameraRequest request;
  bool failed,hasFrame;int renderedFrame=-1;
  public bool Ready {get{return hasFrame&&!failed;}}
  public int TextureWidth {get{return texture!=null?texture.width:0;}}
  public int TexelScale {get;private set;}
  public Vector3 GroundAnchor {get;private set;}
  public float AnchorScreenError {get;private set;}
  public int RenderCount {get;private set;}
  public float RenderMilliseconds {get;private set;}
  public void Initialize(NativeHeroView source,Func<Camera> worldCamera,SpriteRenderer sprite){
   hero=source;cameraSource=worldCamera;fallback=sprite;
   try {
    var toon=Resources.Load<Shader>("Shaders/RigPixelToon");var shader=Resources.Load<Shader>("Shaders/RigPixelComposite");
    if(hero==null||!hero.Ready||toon==null||shader==null)throw new InvalidOperationException("Warrior rig or pixel shaders missing");
    foreach(var r in hero.Model.GetComponentsInChildren<Renderer>(true)){
     var sourceMaterials=r.sharedMaterials;var materials=new Material[sourceMaterials.Length];
     for(int i=0;i<materials.Length;i++){
      var old=sourceMaterials[i];var mat=new Material(toon){name="RigPixel: "+(old!=null?old.name:"body")};
      if(old!=null){if(old.HasProperty("_BaseMap")){mat.SetTexture("_BaseMap",old.GetTexture("_BaseMap"));mat.SetTextureScale("_BaseMap",old.GetTextureScale("_BaseMap"));mat.SetTextureOffset("_BaseMap",old.GetTextureOffset("_BaseMap"));}if(old.HasProperty("_BaseColor"))mat.SetColor("_BaseColor",old.GetColor("_BaseColor"));}
      materials[i]=mat;ownedMaterials.Add(mat);
     }
     r.sharedMaterials=materials;
    }
    hero.PixelLighting();
    var cameraObject=new GameObject("RigPixel orthographic camera");cameraObject.transform.SetParent(transform,false);capture=cameraObject.AddComponent<Camera>();
    capture.enabled=false;capture.orthographic=true;capture.clearFlags=CameraClearFlags.SolidColor;capture.backgroundColor=Color.clear;
    capture.cullingMask=1<<RigLayer;capture.nearClipPlane=.05f;capture.farClipPlane=24;capture.allowHDR=false;capture.allowMSAA=false;
    var data=capture.GetUniversalAdditionalCameraData();data.renderPostProcessing=false;data.renderShadows=true;data.requiresColorOption=CameraOverrideOption.Off;data.requiresDepthOption=CameraOverrideOption.Off;data.volumeLayerMask=0;
    composite=new Material(shader){name="RigPixel Point composite"};image=Quad("RigPixel warrior",composite);
    var contactShader=Resources.Load<Shader>("Shaders/HD2DContact");if(contactShader!=null){shadowMaterial=new Material(contactShader);contact=Quad("RigPixel ground contact",shadowMaterial);}
    request=new UniversalRenderPipeline.SingleCameraRequest();
   } catch(Exception e){Fail(e);}
  }
  MeshRenderer Quad(string name,Material material){
   var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name=name;go.transform.SetParent(transform,false);Destroy(go.GetComponent<Collider>());
   var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.enabled=false;return renderer;
  }
  void HideRig(Camera camera){if(camera==null||camera==capture)return;if(!masks.ContainsKey(camera))masks[camera]=camera.cullingMask;camera.cullingMask&=~(1<<RigLayer);}
  void LateUpdate(){RenderNow();}
  public void RenderNow(){
   if(failed||capture==null||hero==null||!hero.Ready||renderedFrame==Time.frameCount)return;
   var camera=cameraSource!=null?cameraSource():null;
   if(camera==null||!camera.isActiveAndEnabled||camera.pixelHeight<1){if(image!=null)image.enabled=false;if(contact!=null)contact.enabled=false;return;}
   try {
    HideRig(camera);if(Camera.main!=camera)HideRig(Camera.main);
    var ground=hero.Model.transform.parent.position;var screen=camera.WorldToScreenPoint(ground);if(screen.z<=0)return;
    float wpp=(camera.ScreenToWorldPoint(screen+Vector3.up)-ground).magnitude;
    TexelScale=NativeRigPixelPolicy.TexelScale(camera.pixelHeight);
    int size=NativeRigPixelPolicy.TextureSize(wpp,TexelScale,5.6f);if(size==0)throw new InvalidOperationException("Pixel projection exceeds safe texture canvas");
    if(texture==null||texture.width!=size){
     if(texture!=null){texture.Release();Destroy(texture);}
     texture=new RenderTexture(size,size,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){name="Warrior rig pixel RT",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,antiAliasing=1,useMipMap=false,autoGenerateMips=false};texture.Create();
     composite.SetTexture("_MainTex",texture);request.destination=texture;
    }
    float extent=size*wpp*TexelScale;
    // The capture and output share one camera-facing plane and one foot baseline.
    // Snap the foot first; keep its offset to the canvas centre an integer number of texels.
    float centre=Mathf.Round(.65f/(wpp*TexelScale))*wpp*TexelScale;
    capture.orthographicSize=extent*.5f;capture.aspect=1;
    capture.transform.SetPositionAndRotation(ground+camera.transform.up*centre-camera.transform.forward*8,camera.transform.rotation);
    var snapped=NativeHd2D.SnapAnchor(camera,ground);GroundAnchor=snapped;
    image.transform.SetPositionAndRotation(snapped+camera.transform.up*centre,camera.transform.rotation);image.transform.localScale=new Vector3(extent,extent,1);
    image.sortingOrder=fallback!=null?fallback.sortingOrder:0;
    var snappedScreen=camera.WorldToScreenPoint(snapped);AnchorScreenError=new Vector2(snappedScreen.x-screen.x,snappedScreen.y-screen.y).magnitude;
    double before=Time.realtimeSinceStartupAsDouble;
    if(!RenderPipeline.SupportsRenderRequest(capture,request))throw new InvalidOperationException("URP SingleCameraRequest unsupported");
    RenderPipeline.SubmitRenderRequest(capture,request);
    RenderMilliseconds=(float)((Time.realtimeSinceStartupAsDouble-before)*1000);RenderCount++;renderedFrame=Time.frameCount;hasFrame=true;
    image.enabled=true;if(fallback!=null)fallback.enabled=false;
    if(contact!=null){
     contact.enabled=true;contact.sortingOrder=image.sortingOrder-1;
     bool world3D=NativeRemodel3D.Active;
     var anchor=world3D?ground:new Vector3(ground.x,ground.y,0);
     contact.transform.SetPositionAndRotation(anchor+(world3D?Vector3.up:Vector3.forward)*.018f,world3D?Quaternion.Euler(90,0,0):Quaternion.identity);
     contact.transform.localScale=new Vector3(.62f,.36f,1);
    }
   } catch(Exception e){Fail(e);}
  }
  void Fail(Exception e){failed=true;hasFrame=false;if(image!=null)image.enabled=false;if(contact!=null)contact.enabled=false;if(hero!=null&&hero.Model!=null)hero.Model.SetActive(false);if(fallback!=null)fallback.enabled=true;Debug.LogError("[RigPixel] sprite fallback: "+e.Message);}
  void OnDestroy(){
   foreach(var pair in masks)if(pair.Key!=null)pair.Key.cullingMask=(pair.Key.cullingMask&~(1<<RigLayer))|(pair.Value&(1<<RigLayer));
   if(texture!=null){texture.Release();Destroy(texture);}foreach(var material in ownedMaterials)if(material!=null)Destroy(material);
   if(composite!=null)Destroy(composite);if(shadowMaterial!=null)Destroy(shadowMaterial);
  }
 }
}
