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
   var hit=Resources.Load<Texture2D>("Art/vfx/ki_slash_hit_silver_sheet");if(hit==null||hit.width!=1254||hit.height!=1254)throw new Exception("Original hit sheet imported at wrong scale");
   foreach(var key in new[]{"sword_swing1","sword_swing2","sword_swing3","scarecrow_charge","sword_parry"}){
    var clip=Resources.Load<AudioClip>("Audio/"+key);if(clip==null||clip.samples<=0)throw new Exception("Original audio import failed "+key);
   }
   foreach(var name in new[]{"Shaders/KiSlashAdditive","Shaders/KiSlashInk"}){
    var shader=Resources.Load<Shader>(name);if(shader==null||ShaderUtil.ShaderHasError(shader))throw new Exception("KiSlash shader import error "+name);
   }
   VerifyFeedbackFrames(hit);
   VerifyUiComposition();
   VerifyHudPixels();
   VerifyInventory();
   VerifyLobby();
   File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new Receipt{check="Unity_source_runtime_compile_asset_and_model",passed=true,engine=Application.unityVersion},true));
   Debug.Log("UNITY_VERIFY_PASS");EditorApplication.Exit(0);
  }catch(Exception e){Debug.LogException(e);EditorApplication.Exit(2);}
 }
 static void VerifyFeedbackFrames(Texture2D hit){
  var host=new GameObject("Feedback frame verification");
  var frames=new Sprite[4];for(int i=0;i<4;i++)frames[i]=Sprite.Create(hit,new Rect(i%2*627,hit.height-(i/2+1)*627,627,627),new Vector2(.5f,.5f),100);
  var renderer=new KiImpactView(host.transform,i=>frames[i]);
  try {
   renderer.Handle(new FeedbackEvent{Kind=FeedbackKind.KiSlashHit,Tick=100,FrameCount=4,FrameTicks=3,Size=140,Ink=true,InkCapacity=8});
   int[] additive={0,0,1,1,1,2},ink={0,0,0,1,1,1};
   for(int i=0;i<6;i++){
    renderer.Update(100+i);renderer.Update(100+i); // Rendering twice must not advance the fixed-tick clock.
    foreach(var r in host.GetComponentsInChildren<SpriteRenderer>()){
     int expected=r.gameObject.name=="Ki hit ink"?ink[i]:additive[i];
     if(r.sprite!=frames[expected])throw new Exception("Feedback native frame mismatch "+r.gameObject.name+" age"+i);
    }
   }
   Debug.Log("UNITY_FEEDBACK_FRAME_SEQUENCE_PASS");
  } finally {renderer.Dispose();UnityEngine.Object.DestroyImmediate(host);foreach(var f in frames)UnityEngine.Object.DestroyImmediate(f);}
 }
 static void VerifyLobby(){
  var resource=Resources.Load<TextAsset>("Data/lobby_frontend");if(resource==null)throw new Exception("Missing runtime lobby captions");
  var data=JsonUtility.FromJson<LobbySubtitleData>(resource.text);if(data.captions==null||data.captions.Length!=29||data.cuts.Length!=17)throw new Exception("Original lobby data count mismatch");
  foreach(var language in data.captions)if(language.cues==null||language.cues.Length!=32)throw new Exception("Original caption cue count "+language.code);
  for(int i=0;i<data.cuts.Length;i++)if(data.cuts[i]!=LobbyFlow.WorldCuts[i])throw new Exception("Original next-cut timing mismatch");
  foreach(var name in new[]{"title_logo","enter_art","brand_logo","lobby_enter","lobby_enter_disabled","lobby_panel","lobby_banner","lobby_poster","gate_poster","splash_title","splash_brand","fdg_emblem","varkan_idle","varkan_first"})if(Resources.Load<Texture2D>("Art/lobby/"+name)==null)throw new Exception("Missing native lobby art "+name);
  var sheet=Resources.Load<Texture2D>("Art/lobby/varkan_idle");if(sheet.width!=3072||sheet.height!=7488)throw new Exception("Ancestor 96-frame atlas import dimensions");
  foreach(var name in new[]{"fdg_intro.mp4","intro.mp4",NativeLobby.WorldMovie,"title_motion_hd_20260929.mp4","title_motion_20260929.mp4","lobby_varkan_crypt_loop_v2_unity.mp4"})if(!File.Exists(Path.Combine(Application.streamingAssetsPath,"Lobby",name)))throw new Exception("Missing original movie "+name+"; run Tools/restore-lobby-media.cjs");
  string canonicalWorld=Path.Combine(Application.streamingAssetsPath,"Lobby",NativeLobby.WorldMovie);
  using(var stream=File.OpenRead(canonicalWorld))using(var hash=System.Security.Cryptography.SHA256.Create()){
   string actual=BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
   if(stream.Length!=NativeLobby.WorldMovieBytes||actual!=NativeLobby.WorldMovieSha256)throw new Exception("User-designated world intro bytes differ; restore canonical media");
  }
  foreach(var name in new[]{"prologue_theme","prologue_theme_abyssal_fracture","prologue_theme_rebirth_gate_1","prologue_theme_rebirth_gate_2","lobby"}){var clip=Resources.Load<AudioClip>("Audio/Lobby/"+name);if(clip==null||clip.samples<=0)throw new Exception("Lobby audio import "+name);}
  Debug.Log("UNITY_LOBBY_MEDIA_CAPTIONS_29X32_PASS");
  var story=Resources.Load<TextAsset>("Data/warrior_story");
  if(story==null||!File.Exists(Path.Combine(Application.streamingAssetsPath,"Lobby","warrior_story_v23_clean.mp4")))throw new Exception("Missing warrior story; run Tools/restore-warrior-story.cjs");
  var storyData=JsonUtility.FromJson<LobbySubtitleData>(story.text);
  if(storyData.cuts==null||storyData.cuts.Length!=22||storyData.captions==null||storyData.captions.Length!=29)throw new Exception("Warrior source data mismatch");
  foreach(var language in storyData.captions)if(language.cues.Length!=22)throw new Exception("Warrior caption count "+language.code);
  foreach(var weight in new[]{"Regular","SemiBold","Bold"})if(Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-"+weight)==null)throw new Exception("Missing static lobby font "+weight);
 }
 static void VerifyInventory(){
  var data=Resources.Load<TextAsset>("Data/inventory_seed");if(data==null)throw new Exception("Missing original inventory seed");
  var inv=new InventoryState(NativeInventorySeed.Load());int worn=0,affixes=0;
  foreach(var i in inv.Equipped)if(i!=null)worn++;foreach(var i in inv.Bag){if(i.rarity!=1)throw new Exception("Original magic bag rarity");affixes+=i.affixes.Length;}
  if(worn!=15||inv.Bag.Count!=10||affixes!=20)throw new Exception("Original inventory seed counts");
  var s=new Simulation(SourceStarterFixture.CreateKiSlash());s.ApplyEquipment(inv);if(s.Player.MaxHp!=526||s.Config.WeaponAttack!=18)throw new Exception("Inventory starter adapter mismatch");
  if(s.Config.DamageMultiplier!=.7)throw new Exception("Equipment lost double damage precision");
  s.Player.Level=2;s.ApplyEquipment(inv);if(s.CalculateKiSlashDamage(1)!=1999||s.Config.StrengthFlat!=0)throw new Exception("Equipment double-counted level strength");
  s.Player.Level=1;s.ApplyEquipment(inv);
  s.Player.Hp=113.75f;s.Player.Mana=47.5f;s.Player.Stamina=61.25f;s.Player.Shield=19.5f;
  if(!inv.TryUnequip("weapon",out var why))throw new Exception(why);s.ApplyEquipment(inv);
  if(s.Player.Hp!=113.75f||s.Player.Mana!=47.5f||s.Player.Stamina!=61.25f||s.Player.Shield!=19.5f)throw new Exception("Equipment healed resources");
  if(s.Config.WeaponAttack!=0||s.Config.WeaponSpeed!=0)throw new Exception("Unarmed raw stats");
  if(s.CalculateKiSlashDamage(1)!=882)throw new Exception("Unarmed double damage boundary mismatch");
  for(int i=0;i<200;i++)s.Tick(0,0,5000,7420,true,false);
  if(float.IsNaN(s.Player.StateTicks)||float.IsInfinity(s.Player.StateTicks)||s.Player.StateTicks<0)throw new Exception("Unarmed invalid attack recovery");
  foreach(var name in new[]{"knight","socket","iron"})if(Resources.Load<Texture2D>("Art/ui/inventory/"+name)==null)throw new Exception("Inventory source art "+name);
  Debug.Log("UNITY_INVENTORY_SEED_STATS_UNARMED_PASS");
 }
 static void VerifyUiComposition(){
  foreach(var size in new[]{new Vector2(1280,720),new Vector2(1920,1080),new Vector2(2560,1080)}){
   float scale=Mathf.Min(size.x/1920f,size.y/1080f),width=size.x/scale,height=size.y/scale;
   var layout=NativeHudDockLayout.Create(width,height);
   var left=NativeHudDockLayout.VisibleFrame(layout.LeftFrame);var right=NativeHudDockLayout.VisibleFrame(layout.RightFrame);
   if(left.xMin<0||right.xMax>width||left.yMax>height-4||right.yMax>height-4)throw new Exception("HUD frame clipped "+size);
   if(Math.Abs((layout.LeftFrame.xMin+layout.RightFrame.xMax)*.5f-width*.5f)>.01f)throw new Exception("HUD group lost center "+size);
   if(layout.RightFrame.xMax-layout.LeftFrame.xMin>1100||left.yMin<height-260)throw new Exception("HUD occupies excessive combat view "+size);
   if(!layout.VisibleBar.Contains(layout.ActiveSlot.min)||!layout.VisibleBar.Contains(layout.ActiveSlot.max))throw new Exception("Active skill outside visible slot bar "+size);
   if(width-640-600<640)throw new Exception("Inventory central view too narrow "+size);
  }
  Debug.Log("UNITY_UI_COMPOSITION_BOUNDS_PASS");
 }
 static void VerifyHudPixels(){
  var shader=Resources.Load<Shader>("Shaders/HudOrb");if(shader==null||ShaderUtil.ShaderHasError(shader))throw new Exception("HUD shader import error");
  var hud=new NativeHud();try{
   var p=new PlayerState{MaxHp=526,MaxMana=330,MaxStamina=240,MaxShield=285};
   for(int i=0;i<3;i++){
    p.Hp=i==0?526:i==1?263.9f:0;p.Mana=i==0?330:i==1?82.9f:0;p.Stamina=i==0?240:i==1?180:0;p.Shield=i==0?285:i==1?142.5f:0;
    hud.Refresh(p,0,true);var v=hud.Probe(i.ToString());
    bool ok=v.cornerTransparent&&(i==0?v.hpRed&&v.manaBlue&&v.staminaGreen:i==1?v.hpUpperEmpty&&v.hpLowerRed&&v.manaUpperEmpty&&v.staminaGreen:v.hpEmpty&&v.manaEmpty&&v.staminaEmpty);
    if(!ok)throw new Exception("Native HUD GPU pixel mismatch "+JsonUtility.ToJson(v));
   }
   Debug.Log("UNITY_HUD_GPU_RESOURCE_MASK_PASS");
  }finally{hud.Dispose();}
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
   var target=EditorUserBuildSettings.activeBuildTarget;
   if(target!=BuildTarget.StandaloneWindows64&&target!=BuildTarget.StandaloneOSX)
    throw new NotSupportedException("Verification build requires -buildTarget Win64 or OSXUniversal");
   string architecture="x64";
#if UNITY_EDITOR_OSX
   if(target==BuildTarget.StandaloneOSX){
    UnityEditor.OSXStandalone.UserBuildSettings.architecture=UnityEditor.Build.OSArchitecture.ARM64;
    architecture="ARM64";
   }
#else
   if(target==BuildTarget.StandaloneOSX)throw new NotSupportedException("Build the Mac verification app with the Mac Editor");
#endif
   VerifyLobby();var scene=MakeScene();var directory=Argument("-output");Directory.CreateDirectory(directory);
   var output=Path.Combine(directory,target==BuildTarget.StandaloneOSX?"EXODUSER-Unity.app":"EXODUSER-Unity.exe");
   // Local frontend verification needs no development PlayerConnection listener.
   var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{scene},locationPathName=output,target=target,options=BuildOptions.None});
   bool ok=report.summary.result==BuildResult.Succeeded;
   File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new BuildReceipt{passed=ok,result=report.summary.result.ToString(),errors=report.summary.totalErrors,bytes=report.summary.totalSize,engine=Application.unityVersion,target=target.ToString(),architecture=architecture,output=output},true));
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
 [Serializable]class BuildReceipt{public bool passed;public string result,engine,target,architecture,output;public int errors;public ulong bytes;}
}
