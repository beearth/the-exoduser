using System; using System.IO; using UnityEditor; using UnityEngine;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
public static class PortVerification {
 public static void CheckCorePresence(){
  var found=Type.GetType("Exoduser.UnityPort.Core.Simulation, Assembly-CSharp")!=null;
  var result=new {check="native_CSharp_core_exists",passed=found,engine=Application.unityVersion};
  File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new Receipt{check="native_CSharp_core_exists",passed=found,engine=Application.unityVersion},true));
  Debug.Log("UNITY_CORE_PRESENCE "+found); EditorApplication.Exit(found?0:2);
 }
 public static string Argument(string key){var a=Environment.GetCommandLineArgs();var i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:"";}
 [Serializable]class Receipt {public string check;public bool passed;public string engine;}
 public static void Verify(){
  try {
   var map=new SourceMap(JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text));
   if(!map.CanMove(4020,7420,15)||map.CanMove(0,0,15))throw new Exception("Source map collision mismatch");
   var s=new Simulation(SourceStarterFixture.CreateBasicWeapon());
   if(s.Player.MaxHp!=526||s.Player.Shield!=285)throw new Exception("Source starter mismatch");
   float x=s.Player.X;for(int i=0;i<60;i++)s.Tick(1,0,1000,0,false,false);
   if(Math.Abs(s.Player.X-x-163.176f)>.01)throw new Exception("Source movement mismatch");
   foreach(var c in map.Data.chunks){var t=Resources.Load<Texture2D>(c.texture);if(t==null||t.width!=1026||t.height!=1026)throw new Exception("Original chunk dimensions "+c.texture+" actual="+(t==null?"missing":t.width+"x"+t.height)+" graphics="+SystemInfo.graphicsDeviceType);Resources.UnloadAsset(t);}
   var atlas=Resources.Load<Texture2D>("Art/enemy/atlas_ch1_8dir_walk_south");if(atlas==null||atlas.width!=8192)throw new Exception("Walk atlas imported at wrong scale");
   var ki=Resources.Load<Texture2D>("Art/vfx/ki_slash_silver_sheet");if(ki==null||ki.width!=1254||ki.height!=1254)throw new Exception("Original kiSlash sheet imported at wrong scale");
   foreach(var name in new[]{"Shaders/KiSlashAdditive","Shaders/KiSlashInk"}){
    var shader=Resources.Load<Shader>(name);if(shader==null||ShaderUtil.ShaderHasError(shader))throw new Exception("KiSlash shader import error "+name);
   }
   File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new Receipt{check="Unity_source_runtime_compile_asset_and_model",passed=true,engine=Application.unityVersion},true));
   Debug.Log("UNITY_VERIFY_PASS");EditorApplication.Exit(0);
  }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(2);}
 }
 static string MakeScene(){
  var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
  new GameObject("EXODUSER Native CSharp").AddComponent<NativeGame>();
  const string name="Assets/Scenes/FirstPlayable.unity";
  EditorSceneManager.SaveScene(scene,name);EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(name,true)};
  PlayerSettings.companyName="ForDearGamers";PlayerSettings.productName="EXODUSER · Unity 이식 검증판";
  PlayerSettings.defaultScreenWidth=1920;PlayerSettings.defaultScreenHeight=1080;PlayerSettings.fullScreenMode=FullScreenMode.Windowed;
  PlayerSettings.runInBackground=true;PlayerSettings.colorSpace=ColorSpace.Gamma;
  return name;
 }
 public static void Build(){
  try {
   var scene=MakeScene();var directory=Argument("-output");Directory.CreateDirectory(directory);
   var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{scene},locationPathName=Path.Combine(directory,"EXODUSER-Unity.exe"),target=BuildTarget.StandaloneWindows64,options=BuildOptions.Development});
   bool ok=report.summary.result==BuildResult.Succeeded;
   File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new BuildReceipt{passed=ok,result=report.summary.result.ToString(),errors=report.summary.totalErrors,bytes=report.summary.totalSize,engine=Application.unityVersion},true));
   Debug.Log("UNITY_BUILD "+report.summary.result);EditorApplication.Exit(ok?0:2);
  }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(2);}
 }
 public static void Capture(){MakeScene();EditorApplication.playModeStateChanged+=CaptureState;EditorApplication.isPlaying=true;}
 static void CaptureState(PlayModeStateChange state){if(state==PlayModeStateChange.EnteredPlayMode){EditorApplication.update+=TickCapture;}}
 static int captureTicks;
 static void TickCapture(){
  if(!EditorApplication.isPlaying)return;
  if(++captureTicks<80)return;EditorApplication.update-=TickCapture;
  var game=NativeGame.Instance;if(game==null)throw new Exception("Native game did not start");
  var camera=Camera.main;var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;camera.Render();var previous=RenderTexture.active;RenderTexture.active=rt;
  var image=new Texture2D(1920,1080,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,1920,1080),0,0);image.Apply();
  File.WriteAllBytes(Path.Combine(Argument("-output"),"unity-world.png"),image.EncodeToPNG());RenderTexture.active=previous;camera.targetTexture=null;
  UnityEngine.Object.DestroyImmediate(image);UnityEngine.Object.DestroyImmediate(rt);
  File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new Receipt{check="native_Unity_camera_world_capture_only",passed=game.LoadedChunks>0,engine=Application.unityVersion},true));
  EditorApplication.Exit(0);
 }
 [Serializable]class BuildReceipt{public bool passed;public string result,engine;public int errors;public ulong bytes;}
}
