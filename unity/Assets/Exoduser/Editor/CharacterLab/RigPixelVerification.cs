using System;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort;
namespace Exoduser.CharacterLab {
 public static class RigPixelVerification {
  // Surface preflight only. This is deliberately separate from actual CH1-1 Player acceptance.
  public static void SurfacePreview(){
   var args=Environment.GetCommandLineArgs();string output=null;
   for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
   if(string.IsNullOrEmpty(output))throw new Exception("SurfacePreview output required");
   Directory.CreateDirectory(output);EditorSceneManager.OpenScene("Assets/Scenes/FirstPlayable.unity");
   foreach(var light in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None))light.enabled=false;
   var sun=new GameObject("Surface preview key").AddComponent<Light>();sun.type=LightType.Directional;sun.intensity=1.4f;sun.transform.rotation=Quaternion.Euler(40,-35,0);RenderSettings.sun=sun;
   RenderSettings.ambientMode=AmbientMode.Flat;RenderSettings.ambientLight=new Color(.25f,.25f,.25f);
   var root=new GameObject("Surface preview rig");var hero=new NativeHeroView(root.transform);hero.Model.transform.parent.localScale=Vector3.one*.87f;hero.Model.transform.parent.rotation=Quaternion.Euler(0,180,0);
   File.WriteAllLines(Path.Combine(output,"clip-metrics.txt"),hero.Model.GetComponent<Animator>().runtimeAnimatorController.animationClips.Select(c=>c.name+" length="+c.length+" averageSpeed="+c.averageSpeed+" apparentSpeed="+c.apparentSpeed));
   var animator=hero.Model.GetComponent<Animator>();animator.Rebind();
   var left=animator.GetBoneTransform(HumanBodyBones.LeftFoot);var right=animator.GetBoneTransform(HumanBodyBones.RightFoot);
   foreach(string state in new[]{"Run","Walk"}){
    var samples=new System.Collections.Generic.List<string>{"phase,leftX,leftY,leftZ,rightX,rightY,rightZ"};
    for(int i=0;i<=64;i++){animator.Play("Base Layer."+state,0,i/64f);animator.Update(0);var l=hero.Model.transform.InverseTransformPoint(left.position);var r=hero.Model.transform.InverseTransformPoint(right.position);samples.Add(string.Join(",",new[]{i/64f,l.x,l.y,l.z,r.x,r.y,r.z}.Select(v=>v.ToString("R",System.Globalization.CultureInfo.InvariantCulture))));}
    File.WriteAllLines(Path.Combine(output,state.ToLowerInvariant()+"-foot-samples.csv"),samples);
   }
   animator.Play("Base Layer.Idle",0,0);animator.Update(0);
   var before=hero.Model.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh;
   var beforeIndices=before.triangles.OrderBy(x=>x).ToArray();var beforeVertices=before.vertices;var beforeWeights=before.boneWeights;
   var camera=new GameObject("Surface preview camera").AddComponent<Camera>();camera.orthographic=true;camera.orthographicSize=6.3f;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.08f,.08f,.08f);camera.nearClipPlane=.1f;camera.farClipPlane=50;
   camera.transform.rotation=Quaternion.Euler(55,0,0);camera.transform.position=Vector3.up*.8f-camera.transform.forward*10;
   var target=new RenderTexture(1920,1080,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB);target.Create();camera.targetTexture=target;
   var pixel=root.AddComponent<NativeRigPixelHero>();pixel.Initialize(hero,()=>camera,null);pixel.RenderNow();
   var after=hero.Model.GetComponentInChildren<SkinnedMeshRenderer>().sharedMesh;
   bool geometry=beforeIndices.SequenceEqual(after.triangles.OrderBy(x=>x))&&beforeVertices.SequenceEqual(after.vertices)&&beforeWeights.SequenceEqual(after.boneWeights);
   var request=new UniversalRenderPipeline.SingleCameraRequest{destination=target};RenderPipeline.SubmitRenderRequest(camera,request);
   var previous=RenderTexture.active;RenderTexture.active=target;var image=new Texture2D(1920,1080,TextureFormat.RGB24,false,false);image.ReadPixels(new Rect(0,0,1920,1080),0,0);image.Apply();RenderTexture.active=previous;File.WriteAllBytes(Path.Combine(output,"surface-preflight.png"),image.EncodeToPNG());
   File.WriteAllText(Path.Combine(output,"surface-preflight.json"),"{\"scope\":\"Editor neutral-light surface preflight; NOT actual gameplay acceptance\",\"geometryPreserved\":"+geometry.ToString().ToLowerInvariant()+",\"ready\":"+pixel.Ready.ToString().ToLowerInvariant()+"}");
   Debug.Log("RIGPIXEL_SURFACE_PREFLIGHT geometry="+geometry+" ready="+pixel.Ready);EditorApplication.Exit(geometry&&pixel.Ready?0:2);
  }
  public static void Verify(){
   var args=Environment.GetCommandLineArgs();string output="I:/EXODUSER-Storage/codex-takeover/rig-pixel/editor-check.json";
   for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
   var type=TypeCache.GetTypesDerivedFrom<MonoBehaviour>().FirstOrDefault(t=>t.FullName=="Exoduser.UnityPort.NativeRigPixelHero");
   var toon=Resources.Load<Shader>("Shaders/RigPixelToon");var composite=Resources.Load<Shader>("Shaders/RigPixelComposite");
   var prefab=Resources.Load<GameObject>("Characters/Warrior");var animator=prefab!=null?prefab.GetComponent<Animator>():null;
   bool renderer=type!=null&&typeof(MonoBehaviour).IsAssignableFrom(type);
   bool shaders=toon!=null&&composite!=null&&!ShaderUtil.ShaderHasError(toon)&&!ShaderUtil.ShaderHasError(composite);
   bool rig=animator!=null&&animator.avatar!=null&&animator.avatar.isValid&&animator.avatar.isHuman;
   bool ok=renderer&&shaders&&rig;
   Directory.CreateDirectory(Path.GetDirectoryName(output));File.WriteAllText(output,"{\"passed\":"+ok.ToString().ToLowerInvariant()+",\"renderer\":"+renderer.ToString().ToLowerInvariant()+",\"shaders\":"+shaders.ToString().ToLowerInvariant()+",\"humanoid\":"+rig.ToString().ToLowerInvariant()+"}");
   Debug.Log("RIGPIXEL_CONTRACT "+(ok?"PASS":"FAIL")+" renderer="+renderer+" shaders="+shaders+" humanoid="+rig);
   EditorApplication.Exit(ok?0:2);
  }
 }
}
