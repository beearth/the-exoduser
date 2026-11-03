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
  Light moon;Camera capture;MeshRenderer image,contact;RenderTexture texture;Material composite,shadowMaterial;
  Light[] sceneLights=Array.Empty<Light>();int nextLightScan;
  readonly Vector4[] pointPositions=new Vector4[4],pointColors=new Vector4[4];
  readonly float[] pointDistances=new float[4];
  readonly List<Material> ownedMaterials=new List<Material>();
  readonly List<Mesh> ownedMeshes=new List<Mesh>();
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
    foreach(var skin in hero.Model.GetComponentsInChildren<SkinnedMeshRenderer>(true)){SmoothSurfaceNormals(skin);CleanMaterialRegions(skin);}
    foreach(var filter in hero.Model.GetComponentsInChildren<MeshFilter>(true))filter.sharedMesh=SmoothMeshNormals(filter.sharedMesh,filter.transform);
    foreach(var r in hero.Model.GetComponentsInChildren<Renderer>(true)){
     var sourceMaterials=r.sharedMaterials;var materials=new Material[sourceMaterials.Length];
     for(int i=0;i<materials.Length;i++){
      var old=sourceMaterials[i];var mat=new Material(toon){name="RigPixel: "+(old!=null?old.name:"body")};
      if(old!=null){if(old.HasProperty("_BaseMap")){mat.SetTexture("_BaseMap",old.GetTexture("_BaseMap"));mat.SetTextureScale("_BaseMap",old.GetTextureScale("_BaseMap"));mat.SetTextureOffset("_BaseMap",old.GetTextureOffset("_BaseMap"));}if(old.HasProperty("_BaseColor"))mat.SetColor("_BaseColor",old.GetColor("_BaseColor"));}
      string materialName=(old!=null?old.name:"iron").ToLowerInvariant();
      mat.SetColor("_PaletteColor",Palette(materialName));
      float surfaceTag=SurfaceTag(materialName);mat.SetFloat("_SurfaceTag",surfaceTag);
      bool blade=materialName.Contains("sword")||materialName.Contains("weapon")||materialName.Contains("blade");
      mat.SetFloat("_MetallicPlane",surfaceTag==.6f?1f:(blade?.8f:0f));
      materials[i]=mat;ownedMaterials.Add(mat);
     }
     r.sharedMaterials=materials;
    }
    hero.PixelLighting();
    var cameraObject=new GameObject("RigPixel orthographic camera");cameraObject.transform.SetParent(transform,false);capture=cameraObject.AddComponent<Camera>();
    capture.enabled=false;capture.orthographic=true;capture.clearFlags=CameraClearFlags.SolidColor;capture.backgroundColor=Color.clear;
    capture.cullingMask=1<<RigLayer;capture.nearClipPlane=.05f;capture.farClipPlane=24;capture.allowHDR=false;capture.allowMSAA=false;
    var data=capture.GetUniversalAdditionalCameraData();data.renderPostProcessing=false;data.renderShadows=false;data.requiresColorOption=CameraOverrideOption.Off;data.requiresDepthOption=CameraOverrideOption.Off;data.volumeLayerMask=0;
    composite=new Material(shader){name="RigPixel Point composite"};image=Quad("RigPixel warrior",composite);
    var contactShader=Resources.Load<Shader>("Shaders/HD2DContact");if(contactShader!=null){shadowMaterial=new Material(contactShader);contact=Quad("RigPixel ground contact",shadowMaterial);}
    request=new UniversalRenderPipeline.SingleCameraRequest();
   } catch(Exception e){Fail(e);}
  }
  sealed class NormalCell {public Vector3 position,normal;public int count;}
  sealed class MaterialCell {public Vector3 position,normal;public float area;public float[] support;}
  // R7's colour-classified triangles contain tiny disconnected material islands.
  // Clean their labels on the welded surface, before lighting; screen-space blur cannot fix them.
  void CleanMaterialRegions(SkinnedMeshRenderer skin){
   var mesh=skin.sharedMesh;int parts=mesh.subMeshCount;if(parts<2)return;
   var vertices=mesh.vertices;var weld=new int[vertices.Length];var positions=new Dictionary<Vector3Int,int>();
   var local=new Vector3[vertices.Length];
   for(int i=0;i<vertices.Length;i++){
    var p=hero.Model.transform.InverseTransformPoint(skin.transform.TransformPoint(vertices[i]));local[i]=p;
    var key=new Vector3Int(Mathf.RoundToInt(p.x*100000),Mathf.RoundToInt(p.y*100000),Mathf.RoundToInt(p.z*100000));
    if(!positions.TryGetValue(key,out int id)){id=positions.Count;positions.Add(key,id);}weld[i]=id;
   }
   var indices=new List<int>();var labels=new List<int>();var areas=new List<float>();
   for(int part=0;part<parts;part++){
    var tris=mesh.GetTriangles(part);for(int i=0;i<tris.Length;i+=3){
     indices.Add(tris[i]);indices.Add(tris[i+1]);indices.Add(tris[i+2]);labels.Add(part);
     areas.Add(Vector3.Cross(local[tris[i+1]]-local[tris[i]],local[tris[i+2]]-local[tris[i]]).magnitude*.5f);
    }
   }
   int count=labels.Count;var neighbours=new List<int>[count];var edges=new Dictionary<ulong,List<int>>();
   // Texture-derived face labels must form broad surface planes, not threads of tiny facets.
   // Protect the small face/hair regions, and filter only clothing/armour labels in model space.
   var protectedPart=new bool[parts];for(int p=0;p<parts;p++){string name=skin.sharedMaterials[p].name.ToLowerInvariant();protectedPart[p]=name.Contains("skin")||name.Contains("hair");}
   var centres=new Vector3[count];var directions=new Vector3[count];var normals=mesh.normals;
   for(int i=0;i<count;i++){
    int a=indices[i*3],b=indices[i*3+1],c=indices[i*3+2];centres[i]=(local[a]+local[b]+local[c])/3;
    directions[i]=hero.Model.transform.InverseTransformDirection(skin.transform.TransformDirection(normals[a]+normals[b]+normals[c])).normalized;
   }
   const float radius=.08f;
   for(int pass=0;pass<2;pass++){
    var cells=new Dictionary<Vector3Int,MaterialCell[]>();
    for(int i=0;i<count;i++)if(!protectedPart[labels[i]]){
     var centre=centres[i];var key=new Vector3Int(Mathf.FloorToInt(centre.x/radius),Mathf.FloorToInt(centre.y/radius),Mathf.FloorToInt(centre.z/radius));
     if(!cells.TryGetValue(key,out var groups)){groups=new MaterialCell[6];cells.Add(key,groups);}
     var n=directions[i];int axis=Mathf.Abs(n.x)>Mathf.Abs(n.y)&&Mathf.Abs(n.x)>Mathf.Abs(n.z)?(n.x>0?0:1):Mathf.Abs(n.y)>Mathf.Abs(n.z)?(n.y>0?2:3):(n.z>0?4:5);
     var cell=groups[axis];if(cell==null){cell=new MaterialCell{support=new float[parts]};groups[axis]=cell;}
     float area=areas[i];cell.area+=area;cell.position+=centre*area;cell.normal+=n*area;cell.support[labels[i]]+=area;
    }
    foreach(var groups in cells.Values)foreach(var cell in groups)if(cell!=null){cell.position/=Mathf.Max(.0000001f,cell.area);cell.normal.Normalize();}
    var result=labels.ToArray();
    for(int i=0;i<count;i++)if(!protectedPart[labels[i]]){
     var centre=centres[i];var key=new Vector3Int(Mathf.FloorToInt(centre.x/radius),Mathf.FloorToInt(centre.y/radius),Mathf.FloorToInt(centre.z/radius));var support=new float[parts];float total=0;
     for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++)if(cells.TryGetValue(key+new Vector3Int(x,y,z),out var groups))foreach(var cell in groups){
      if(cell==null||Vector3.Dot(directions[i],cell.normal)<.3f)continue;float distance=(centre-cell.position).sqrMagnitude;if(distance>=radius*radius)continue;
      float weight=1-distance/(radius*radius);for(int p=0;p<parts;p++){float value=cell.support[p]*weight;support[p]+=value;total+=value;}
     }
     int best=0;for(int p=1;p<parts;p++)if(support[p]>support[best])best=p;
     if(total>0&&support[best]>=total*.6f)result[i]=best;
    }
    for(int i=0;i<count;i++)labels[i]=result[i];
   }
   for(int i=0;i<count;i++){
    neighbours[i]=new List<int>(3);for(int j=0;j<3;j++){
     uint a=(uint)weld[indices[i*3+j]],b=(uint)weld[indices[i*3+(j+1)%3]];ulong key=((ulong)Math.Min(a,b)<<32)|Math.Max(a,b);
     if(!edges.TryGetValue(key,out var faces)){faces=new List<int>(2);edges.Add(key,faces);}faces.Add(i);
    }
   }
   foreach(var faces in edges.Values)for(int a=0;a<faces.Count;a++)for(int b=a+1;b<faces.Count;b++){neighbours[faces[a]].Add(faces[b]);neighbours[faces[b]].Add(faces[a]);}
   int changed=0;
   for(int pass=0;pass<3;pass++){
    var component=new int[count];for(int i=0;i<count;i++)component[i]=-1;
    var groups=new List<List<int>>();var groupAreas=new List<float>();
    for(int start=0;start<count;start++)if(component[start]<0){
     int id=groups.Count;var group=new List<int>();group.Add(start);component[start]=id;float area=0;
     for(int cursor=0;cursor<group.Count;cursor++){int face=group[cursor];area+=areas[face];foreach(int next in neighbours[face])if(component[next]<0&&labels[next]==labels[face]){component[next]=id;group.Add(next);}}
     groups.Add(group);groupAreas.Add(area);
    }
    var result=labels.ToArray();
    for(int g=0;g<groups.Count;g++)if(groupAreas[g]<.0025f&&!protectedPart[labels[groups[g][0]]]){
     var support=new float[parts];float total=0;
     foreach(int face in groups[g])foreach(int next in neighbours[face])if(component[next]!=g&&groupAreas[component[next]]>=.0025f){float weight=Mathf.Sqrt(areas[next]);support[labels[next]]+=weight;total+=weight;}
     int best=0;for(int p=1;p<parts;p++)if(support[p]>support[best])best=p;
     if(total>0&&support[best]/total>=.6f)foreach(int face in groups[g]){result[face]=best;if(labels[face]!=best)changed++;}
    }
    for(int i=0;i<count;i++)labels[i]=result[i];
   }
   var regroup=new List<int>[parts];for(int p=0;p<parts;p++)regroup[p]=new List<int>();
   for(int i=0;i<count;i++){var tris=regroup[labels[i]];tris.Add(indices[i*3]);tris.Add(indices[i*3+1]);tris.Add(indices[i*3+2]);}
   for(int p=0;p<parts;p++)mesh.SetTriangles(regroup[p],p,false);
   Debug.Log("[RigPixel] material islands cleaned="+changed+" triangles="+count+"; vertices/weights/UV unchanged");
  }
  void SmoothSurfaceNormals(SkinnedMeshRenderer skin){
   skin.sharedMesh=SmoothMeshNormals(skin.sharedMesh,skin.transform);
  }
  Mesh SmoothMeshNormals(Mesh source,Transform meshTransform){
   if(source==null)return null;
   if(!source.isReadable)throw new InvalidOperationException("RigPixel requires readable R7 skin mesh for surface cleanup");
   var vertices=source.vertices;var normals=source.normals;if(normals.Length!=vertices.Length)return source;
   float scale=hero.Model.transform.InverseTransformVector(meshTransform.TransformVector(Vector3.right)).magnitude;
   float radius=.08f/Mathf.Max(.0001f,scale),radius2=radius*radius;
   for(int pass=0;pass<4;pass++){
   var cells=new Dictionary<Vector3Int,NormalCell[]>();var keys=new Vector3Int[vertices.Length];
   for(int i=0;i<vertices.Length;i++){
    var v=vertices[i];var key=new Vector3Int(Mathf.FloorToInt(v.x/radius),Mathf.FloorToInt(v.y/radius),Mathf.FloorToInt(v.z/radius));keys[i]=key;
    if(!cells.TryGetValue(key,out var groups)){groups=new NormalCell[6];cells.Add(key,groups);}
    var n=normals[i];int axis=Mathf.Abs(n.x)>Mathf.Abs(n.y)&&Mathf.Abs(n.x)>Mathf.Abs(n.z)?(n.x>0?0:1):Mathf.Abs(n.y)>Mathf.Abs(n.z)?(n.y>0?2:3):(n.z>0?4:5);
    var cell=groups[axis];if(cell==null){cell=new NormalCell();groups[axis]=cell;}cell.position+=v;cell.normal+=n;cell.count++;
   }
   foreach(var groups in cells.Values)foreach(var cell in groups)if(cell!=null){cell.position/=cell.count;cell.normal.Normalize();}
   var smooth=new Vector3[normals.Length];
   for(int i=0;i<vertices.Length;i++){
    Vector3 sum=normals[i];float weight=1;
    for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++)
     if(cells.TryGetValue(keys[i]+new Vector3Int(x,y,z),out var groups))foreach(var cell in groups){
      if(cell==null||Vector3.Dot(normals[i],cell.normal)<.35f)continue;float distance=(vertices[i]-cell.position).sqrMagnitude;if(distance>=radius2)continue;
      float w=(1-distance/radius2)*cell.count;sum+=cell.normal*w;weight+=w;
     }
    smooth[i]=(sum/weight).normalized;
   }
   normals=smooth;
   }
   var mesh=Instantiate(source);mesh.name=source.name+" RigPixel broad normals";mesh.normals=normals;ownedMeshes.Add(mesh);return mesh;
   // Positions, skin weights, bind poses, UVs and topology are untouched: Core/feet/blade geometry stays identical.
  }
  // RT alpha is an internal surface label; the composite restores opaque coverage.
  static float SurfaceTag(string name){
   name=name.ToLowerInvariant();
   if(name.Contains("skin")||name.Contains("hair")||name.Contains("sword")||name.Contains("weapon")||name.Contains("blade"))return 1f;
   if(name.Contains("cloth")||name.Contains("cape"))return .7f;
   if(name.Contains("leather"))return .8f;
   return .6f;
  }
  static Color Palette(string name){
   name=name.ToLowerInvariant();
   if(name.Contains("skin"))return new Color(.62f,.42f,.32f,1);
   if(name.Contains("hair"))return new Color(.045f,.035f,.030f,1);
   if(name.Contains("cloth")||name.Contains("cape"))return new Color(.34f,.085f,.065f,1);
   if(name.Contains("leather"))return new Color(.18f,.11f,.07f,1);
   if(name.Contains("sword")||name.Contains("weapon")||name.Contains("blade"))return new Color(.48f,.50f,.52f,1);
   return new Color(.18f,.185f,.195f,1);
  }
  MeshRenderer Quad(string name,Material material){
   var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name=name;go.transform.SetParent(transform,false);if(Application.isPlaying)Destroy(go.GetComponent<Collider>());else DestroyImmediate(go.GetComponent<Collider>());
   var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.enabled=false;return renderer;
  }
  void HideRig(Camera camera){if(camera==null||camera==capture)return;if(!masks.ContainsKey(camera))masks[camera]=camera.cullingMask;camera.cullingMask&=~(1<<RigLayer);}
  void LateUpdate(){RenderNow();}
  void SceneLighting(Vector3 ground){
   if(sceneLights.Length==0||Time.frameCount>=nextLightScan){sceneLights=FindObjectsByType<Light>(FindObjectsSortMode.None);nextLightScan=Time.frameCount+120;}
   moon=null;for(int i=0;i<4;i++){pointPositions[i]=pointColors[i]=Vector4.zero;pointDistances[i]=float.MaxValue;}
   foreach(var light in sceneLights){
    if(light==null||!light.isActiveAndEnabled||light.intensity<=0)continue;
    if(light.type==LightType.Directional){if(moon==null||light.intensity>moon.intensity)moon=light;continue;}
    if(light.type!=LightType.Point)continue;
    float distance=(light.transform.position-ground).sqrMagnitude;if(distance>light.range*light.range)continue;
    int slot=3;if(distance>=pointDistances[slot])continue;while(slot>0&&distance<pointDistances[slot-1]){pointDistances[slot]=pointDistances[slot-1];pointPositions[slot]=pointPositions[slot-1];pointColors[slot]=pointColors[slot-1];slot--;}
    pointDistances[slot]=distance;var p=light.transform.position;pointPositions[slot]=new Vector4(p.x,p.y,p.z,light.range);
    Color c=light.color.linear*light.intensity;pointColors[slot]=new Vector4(c.r,c.g,c.b,1);
   }
   var direction=moon!=null?-moon.transform.forward:Vector3.up;Color color=moon!=null?moon.color.linear*moon.intensity:Color.black;
   Shader.SetGlobalVector("_RigPixelMoonDirection",direction);Shader.SetGlobalColor("_RigPixelMoonColor",color);
   Shader.SetGlobalColor("_RigPixelAmbient",RenderSettings.ambientEquatorColor.linear);
   Shader.SetGlobalVectorArray("_RigPixelPointPositions",pointPositions);Shader.SetGlobalVectorArray("_RigPixelPointColors",pointColors);
  }
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
    Shader.SetGlobalVector("_RigPixelGrid",new Vector4(snappedScreen.x-size*TexelScale*.5f,snappedScreen.y+centre/wpp-size*TexelScale*.5f,TexelScale,1));
    SceneLighting(ground);
    var lightDirection=moon!=null?-moon.transform.forward:new Vector3(-.6f,1,-.4f);
    composite.SetVector("_RimDirection",new Vector4(Vector3.Dot(lightDirection,camera.transform.right),Vector3.Dot(lightDirection,camera.transform.up),0,0));
    composite.SetColor("_RimColor",(moon!=null?moon.color:new Color(.62f,.75f,.9f))*.08f);
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
   foreach(var mesh in ownedMeshes)if(mesh!=null)Destroy(mesh);
   if(composite!=null)Destroy(composite);if(shadowMaterial!=null)Destroy(shadowMaterial);
  }
 }
}
