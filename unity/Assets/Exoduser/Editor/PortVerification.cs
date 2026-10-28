using System; using System.IO; using UnityEditor; using UnityEngine;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
public static class PortVerification {
 public static void CheckCorePresence(){
  var core=typeof(Exoduser.UnityPort.Core.Simulation);   // C-01: no hard-coded assembly name (Assembly-CSharp before the asmdef split, Exoduser.Core after)
  var found=Type.GetType(core.AssemblyQualifiedName)!=null;
  var result=new {check="native_CSharp_core_exists",passed=found,engine=Application.unityVersion};
  File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new Receipt{check="native_CSharp_core_exists",passed=found,engine=Application.unityVersion},true));
  Debug.Log("UNITY_CORE_PRESENCE "+found+" "+core.Assembly.GetName().Name); EditorApplication.Exit(found?0:2);
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
   VerifyA15Settings();
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
 static void VerifyA15Settings(){
  var state=new NativeSettingsState(120);int writes=0,savedSfx=-1,bgmWrites=0,savedBgm=-1;
  var menu=new NativePauseMenu(null,state,value=>{writes++;savedSfx=value;},value=>{bgmWrites++;savedBgm=value;},null,null);
  menu.ShowSettings();menu.Navigation.SelectTab(2);
  menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Down,false,false);
  menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Down,false,false);
  if(menu.Navigation.Cursor!=4)throw new Exception("A15 audio SFX keyboard focus");
  menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Right,false,false);
  if(state.SfxPercent!=61||writes!=1||savedSfx!=61)throw new Exception("A15 SFX right must step by one and hand off once");
  state.SetSfxPercent(0);menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Right,false,false);
  if(state.SfxPercent!=1||writes!=2||savedSfx!=1)throw new Exception("A15 SFX minimum step and handoff");
  state.SetSfxPercent(0);menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Left,false,false);
  if(state.SfxPercent!=0||writes!=2||savedSfx!=1)throw new Exception("A15 SFX lower clamp must not write unchanged value");
  state.SetSfxPercent(100);menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Right,false,false);
  if(state.SfxPercent!=100||writes!=2||savedSfx!=1)throw new Exception("A15 SFX upper clamp must not write unchanged value");
  menu.Navigation.PointAt(5);menu.Navigation.ObserveReleased(false);menu.HandleKey(PauseKey.Right,false,false);
  if(state.BgmPercent!=61||bgmWrites!=1||savedBgm!=61)throw new Exception("A15 BGM right must step by one and hand off once");
  var bindings=new KeyBindings();var list=new NativeKeyBindList(bindings);
  list.BeginListening("up",false);list.CancelListening();
  if(list.Listening||bindings.Primary("up")!="KeyW")throw new Exception("A15 Escape cancel must not alter binding");
  list.BeginListening("up",false);if(!list.CaptureApply("Tab")||list.Listening||bindings.Primary("up")!="Tab")throw new Exception("A15 capture Tab must bind without menu navigation");
  Debug.Log("UNITY_A15_SETTINGS_NAV_SFX_CAPTURE_PASS");
 }
 static void VerifyInventory(){
  var data=Resources.Load<TextAsset>("Data/inventory_seed");if(data==null)throw new Exception("Missing original inventory seed");
  var inv=new InventoryState(NativeInventorySeed.Load());int worn=0,affixes=0;
  foreach(var i in inv.Equipped)if(i!=null&&i.slot!="ossuary")worn++;foreach(var i in inv.Bag){if(i.rarity!=1)throw new Exception("Original magic bag rarity");affixes+=i.affixes.Length;}
  var ossuary=inv.GetEquipped("ossuary");
  if(worn!=15||ossuary==null||ossuary.name!="전대의 유골함"||ossuary.rarity!=5||inv.GetEquipped("belt")!=null||inv.Bag.Count!=10||affixes!=20)
   throw new Exception("Original inventory seed counts: starter="+worn+" ossuary="+(ossuary==null?"missing":ossuary.name)+" bag="+inv.Bag.Count+" affixes="+affixes);
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
   // Web .globe-glass has inset:-44px and margin-left:-4px inside a 0.9-scaled
   // 175px globe. Its lower decorative edge intentionally falls below viewport.
   const float webArtScale=.9f;
   float webGlassBottom=height-10f+44f*webArtScale;
   if(left.xMin<0||right.xMax>width||left.yMin<0||right.yMin<0||
      Math.Abs(left.yMax-webGlassBottom)>.1f||Math.Abs(right.yMax-webGlassBottom)>.1f)
    throw new Exception("HUD frame outside web viewport clipping contract "+size);
   float webGlassCenter=width*.5f-4f*webArtScale;
   if(Math.Abs((layout.LeftFrame.xMin+layout.RightFrame.xMax)*.5f-webGlassCenter)>.1f)
    throw new Exception("HUD group lost web glass center "+size);
   float webGlassSpan=(2*490f+263f)*webArtScale;
   if(Math.Abs(layout.RightFrame.xMax-layout.LeftFrame.xMin-webGlassSpan)>.1f||left.yMin<height-260)
    throw new Exception("HUD occupies excessive combat view "+size);
   foreach(var liquid in new[]{layout.LeftLiquid,layout.RightLiquid})
    if(liquid.xMin<0||liquid.xMax>width||liquid.yMin<0||liquid.yMax>height)
     throw new Exception("HUD resource liquid clipped "+size);
   if(!layout.VisibleBar.Contains(layout.ActiveSlot.min)||!layout.VisibleBar.Contains(layout.ActiveSlot.max))throw new Exception("Active skill outside visible slot bar "+size);
   for(int i=0;i<13;i++){
    var slot=layout.SlotRect(i);
    if(slot.xMin<0||slot.xMax>width||slot.yMin<0||slot.yMax>height||
       !layout.VisibleBar.Contains(slot.min)||!layout.VisibleBar.Contains(slot.max))
     throw new Exception("HUD interactive slot clipped "+size+" index="+i);
    var label=NativeHudDockLayout.KeyLabelRect(layout.SlotBar,height,i);
    if(label.xMin<0||label.xMax>width||label.yMin<0||label.yMax>height)
     throw new Exception("HUD key label clipped "+size+" index="+i);
   }
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
    hud.Refresh(p,0,true);
    if(i==0){
     Debug.Log("A06_HUD_GPU_DEVICE type="+SystemInfo.graphicsDeviceType+" name="+SystemInfo.graphicsDeviceName+" colorSpace="+QualitySettings.activeColorSpace);
     try{
      Debug.Log("A06_HUD_GPU_RGBA hpCorner="+HudProbePixel(hud,"hp",2,2)+" hpCenter="+HudProbePixel(hud,"hp",128,128)+" manaBlue="+HudProbePixel(hud,"mana",80,128)+" staminaGreen="+HudProbePixel(hud,"mana",180,128)+" manaCorner="+HudProbePixel(hud,"mana",253,253));
     }catch(Exception e){Debug.Log("A06_HUD_GPU_RGBA_READ_ERROR "+e.GetType().Name+" "+e.Message);}
    }
    var ratios=HudValues.From(p);
    Debug.Log("A06_HUD_GPU_STATE state="+i+" hpTranslatePercent="+ratios.HpTranslatePercent+" manaRatio="+ratios.ManaRatio+" staminaRatio="+ratios.StaminaRatio+
     " hpCenter="+HudProbePixel(hud,"hp",128,128)+" hpUpper="+HudProbePixel(hud,"hp",128,180)+" hpLower="+HudProbePixel(hud,"hp",128,80)+
     " manaCenter="+HudProbePixel(hud,"mana",80,128)+" manaUpper="+HudProbePixel(hud,"mana",80,180)+" staminaCenter="+HudProbePixel(hud,"mana",180,128));
    var v=hud.Probe(i.ToString());
    bool ok=v.cornerTransparent&&(i==0?v.hpRed&&v.manaBlue&&v.staminaGreen:i==1?v.hpUpperEmpty&&v.hpLowerRed&&v.manaUpperEmpty&&v.staminaGreen:v.hpEmpty&&v.manaEmpty&&v.staminaEmpty);
    if(!ok)throw new Exception("Native HUD GPU pixel mismatch "+JsonUtility.ToJson(v));
   }
   Debug.Log("UNITY_HUD_GPU_RESOURCE_MASK_PASS");
  }finally{hud.Dispose();}
 }
 static string HudProbePixel(NativeHud hud,string field,int x,int y){
  var info=typeof(NativeHud).GetField(field,System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic);
  var rt=info==null?null:info.GetValue(hud) as RenderTexture;
  if(rt==null)throw new Exception("HUD diagnostic target unavailable: "+field);
  var old=RenderTexture.active;var pixel=new Texture2D(1,1,TextureFormat.RGBA32,false);
  try{
   RenderTexture.active=rt;pixel.ReadPixels(new Rect(x,y,1,1),0,0);pixel.Apply();
   var c=pixel.GetPixel(0,0);var shader=c;
   if(QualitySettings.activeColorSpace==ColorSpace.Linear){shader.r=Mathf.GammaToLinearSpace(c.r);shader.g=Mathf.GammaToLinearSpace(c.g);shader.b=Mathf.GammaToLinearSpace(c.b);}
   return "raw="+HudPixelText(c)+" shader="+HudPixelText(shader);
  }finally{RenderTexture.active=old;UnityEngine.Object.DestroyImmediate(pixel);}
 }
 static string HudPixelText(Color c){return "("+c.r.ToString("R",System.Globalization.CultureInfo.InvariantCulture)+","+c.g.ToString("R",System.Globalization.CultureInfo.InvariantCulture)+","+c.b.ToString("R",System.Globalization.CultureInfo.InvariantCulture)+","+c.a.ToString("R",System.Globalization.CultureInfo.InvariantCulture)+")";}
 static string MakeScene(){
  var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
  new GameObject("EXODUSER Native CSharp").AddComponent<NativeGame>();
  const string name="Assets/Scenes/FirstPlayable.unity";
  EditorSceneManager.SaveScene(scene,name);EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(name,true)};
  PlayerSettings.companyName="ForDearGamers";PlayerSettings.productName="EXODUSER · Unity 이식 검증판";
  PlayerSettings.defaultScreenWidth=1920;PlayerSettings.defaultScreenHeight=1080;PlayerSettings.fullScreenMode=FullScreenMode.Windowed;
  PlayerSettings.runInBackground=true;
  return name;
 }
 static bool SettingsIdentifierOverride(){var so=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset")[0]);var value=so.FindProperty("overrideDefaultApplicationIdentifier");if(value==null)throw new Exception("Cannot preserve application identifier override state");return value.boolValue;}
 static void SetSettingsIdentifierOverride(bool enabled){var so=new SerializedObject(AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/ProjectSettings.asset")[0]);var value=so.FindProperty("overrideDefaultApplicationIdentifier");if(value==null)throw new Exception("Cannot restore application identifier override state");value.boolValue=enabled;so.ApplyModifiedPropertiesWithoutUndo();}
 // Build kind (full|demo|bic|ea): `-flavor <name>` writes it into the embedded Data/build_flavor.json for this build only; the committed file stays "full" and is restored in finally (also when the build fails).
 const string FlavorFile="Assets/Exoduser/Resources/Data/build_flavor.json";
 static string WriteFlavor(){
  var name=Argument("-flavor");if(string.IsNullOrEmpty(name))return null;
  if(Array.IndexOf(new[]{"full","demo","bic","ea"},name)<0)throw new ArgumentException("-flavor must be full|demo|bic|ea, got "+name);
  var previous=File.ReadAllText(FlavorFile);File.WriteAllText(FlavorFile,"{\"selected\":\""+name+"\"}");AssetDatabase.Refresh();Debug.Log("UNITY_BUILD_FLAVOR "+name);return previous;
 }
 static void RestoreFlavor(string previous){if(previous==null)return;File.WriteAllText(FlavorFile,previous);AssetDatabase.Refresh();}
 public static void Build(){
  bool settingsQa=Argument("-settingsQa")=="true",uiQa=Argument("-a03a04UiQa")=="true";string restoreProduct=null,restoreIdentifier=null,restoreFlavor=null;bool restoreOverride=false;int exitCode=2;
  try {
   if(settingsQa&&uiQa)throw new ArgumentException("Choose one QA build identity");
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
   if(settingsQa||uiQa){restoreOverride=SettingsIdentifierOverride();restoreProduct=PlayerSettings.productName;restoreIdentifier=PlayerSettings.GetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone);}
   restoreFlavor=WriteFlavor();
   VerifyLobby();var scene=MakeScene();var directory=Argument("-output");Directory.CreateDirectory(directory);
   if(settingsQa){PlayerSettings.productName="EXODUSER Settings QA";PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone,"com.fordeargamers.exoduser.settingsqa");SetSettingsIdentifierOverride(true);if(PlayerSettings.GetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone)==restoreIdentifier)throw new Exception("Settings QA must have a distinct application identifier");}
   if(uiQa){PlayerSettings.productName="EXODUSER A03 A04 QA";PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone,"com.fordeargamers.exoduser.a03a04qa20261027");SetSettingsIdentifierOverride(true);if(PlayerSettings.GetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone)==restoreIdentifier)throw new Exception("A03/A04 UI QA must have a distinct application identifier");}
   var output=Path.Combine(directory,target==BuildTarget.StandaloneOSX?"EXODUSER-Unity.app":"EXODUSER-Unity.exe");
   // Local frontend verification needs no development PlayerConnection listener.
   var buildScenes=Argument("-remodel-scenes")=="1"?new[]{scene,"Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity"}:new[]{scene};   // RM-INT: the remodel scene rides along only when asked (-remodel-scenes 1); the default build is unchanged
   var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=buildScenes,locationPathName=output,target=target,options=BuildOptions.None});
   bool ok=report.summary.result==BuildResult.Succeeded;
   File.WriteAllText(Argument("-receipt"),JsonUtility.ToJson(new BuildReceipt{passed=ok,result=report.summary.result.ToString(),errors=report.summary.totalErrors,bytes=report.summary.totalSize,engine=Application.unityVersion,target=target.ToString(),architecture=architecture,output=output,settingsQa=settingsQa,uiQa=uiQa,product=PlayerSettings.productName,identifier=PlayerSettings.GetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone)},true));
   Debug.Log("UNITY_BUILD "+report.summary.result);exitCode=ok?0:2;
  }catch(Exception e){Debug.LogException(e);}
  finally{RestoreFlavor(restoreFlavor);if(restoreProduct!=null){PlayerSettings.productName=restoreProduct;PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Standalone,restoreIdentifier);SetSettingsIdentifierOverride(restoreOverride);}}
  EditorApplication.Exit(exitCode);
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
 [Serializable]class BuildReceipt{public bool passed,settingsQa,uiQa;public string result,engine,target,architecture,output,product,identifier;public int errors;public ulong bytes;}
}
