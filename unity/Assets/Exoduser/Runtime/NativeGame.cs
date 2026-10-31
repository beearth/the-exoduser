using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Unity-native C# input/simulation/sprite view. No web view or JS runtime.
    public sealed partial class NativeGame : MonoBehaviour
    {
        public Simulation Simulation {get; private set;}
        public SourceMap Map {get; private set;}
        public bool Running {get; private set;}
        public int LoadedChunks {get {return chunks.Count;}}
        public int RenderedEnemyCount {get {return enemies.Count;}}
        Camera view; SpriteRenderer playerView; NativeHeroView heroView; Font font; KiSlashView kiView;NativeBoltView boltView;
        KiImpactView impacts; NativeSkillView skillView; NativeFeedbackAudio sound; NativeGameMusic music; NativeAmbientSources ambient; bool smokeActive;
        NativeHud hud;bool hudSmoke;NativeInventory inventory;bool inventorySmoke,inventoryWasRunning;
        NativePauseMenu pauseMenu;NativeSettingsState settings;NativeSkills skills;NativeStatPanel stats;bool skillsWasRunning,statsWasRunning,skillInputFence;
        NativeLobby lobby;bool lobbySmoke,lobbyControlsSmoke;int worldMask;
        NativeForgePanel forge;bool forgeWasRunning;
        NativeLevelUpOverlay levelUp;int levelUpSeen;
        NativeDeathOverlay death;int deathCount;bool deathShown;
        NativeStageClearOverlay stageClear;
        NativeBossBar bossBar;
        NativeAreaTitle areaTitle;NativeObjectivePanel objective;bool areaTitleShown,areaTitleAllowed;
        bool basicWeaponMode;
        readonly Dictionary<string,Sprite> spriteCache=new Dictionary<string,Sprite>();
        readonly Dictionary<int,ChunkView> chunks=new Dictionary<int,ChunkView>();
        readonly Dictionary<int,EnemyView> enemies=new Dictionary<int,EnemyView>();
        readonly List<SpriteRenderer> props=new List<SpriteRenderer>();
        readonly List<DamageText> damage=new List<DamageText>();
        readonly NativeFloatingTextLayout floatingTextLayout=new NativeFloatingTextLayout();
        readonly string[] directions={"south","south-east","east","north-east","north","north-west","west","south-west"};
        readonly string[] enemyDirections={"east","south_east","south","south_west","west","north_west","north","north_east"};
        float walkDistance,lastX,lastY;int renderedTick=-1;bool playerMoving;
        bool menu=true; string notice=""; float noticeUntil; int lastKillCount;
        GUIStyle label,small,title,center,button,characterBadge,statusTitle,statusDetail; bool guiReady;
        public static NativeGame Instance {get;private set;}
        sealed class ChunkView {public SpriteRenderer renderer;public string path;}
        sealed class EnemyView {public SpriteRenderer body,walk,arc;public float distance,lastX,lastY;public int skin,hp;public float shield;public bool moving;}
        sealed class DamageText {public float x,y,until;public int amount;public bool shield,submitted;}
        readonly NativeFloatingTextLayout.Buffer damageFloaters=new NativeFloatingTextLayout.Buffer();
        readonly NativeReviveHud revive=new NativeReviveHud(); // B08: revive/shield floaters + fallen countdown
        bool PlayerDown{get{var q=Simulation.Player;return q.State=="dead"||(q.Hp<=0&&q.State!="fallen");}} // fallen = 5 s revive countdown, not dead yet

        void Awake()
        {
            Instance=this;basicWeaponMode=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-basic-weapon")>=0;Application.targetFrameRate=120;Time.fixedDeltaTime=1f/60f;
            view=Camera.main;
            if(view==null){view=new GameObject("World Camera").AddComponent<Camera>();view.tag="MainCamera";}
            view.orthographic=true;view.orthographicSize=5.4f;view.backgroundColor=new Color(.015f,.02f,.018f);view.clearFlags=CameraClearFlags.SolidColor;
            UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(view).renderPostProcessing=true; // RM-1 VFX V0: HDR core + Bloom
            view.transform.position=new Vector3(40.2f,-74.2f,-10);
            var resource=Resources.Load<TextAsset>("Data/ch1_map");if(resource==null)throw new InvalidOperationException("Original map resource is missing");
            Map=new SourceMap(JsonUtility.FromJson<MapData>(resource.text));
            font=Resources.Load<Font>("Art/fonts/NotoSansKR");
            hud=new NativeHud();skills=new NativeSkills();stats=new NativeStatPanel();hud.SlotSelected=slot=>{if(hud.TracePointerEvents)Debug.Log("[HUD POINTER TRACE] SlotSelected callback slot="+slot+" before menu="+menu+" hp="+Simulation.Player.Hp+" skillsOpen="+skills.Open);if(!menu&&Simulation.Player.Hp>0){SetSkills(true,slot);if(hud.TracePointerEvents)Debug.Log("[HUD POINTER TRACE] SlotSelected result skillsOpen="+skills.Open+" menu="+menu);}};
            NativePanelTabBar.Requested+=OnPanelRequested;forge=new NativeForgePanel();levelUp=new NativeLevelUpOverlay();death=new NativeDeathOverlay();death.OnRetry=RetryFromDeath;stageClear=new NativeStageClearOverlay();bossBar=new NativeBossBar();areaTitle=new NativeAreaTitle();objective=new NativeObjectivePanel();areaTitleAllowed=!Array.Exists(Environment.GetCommandLineArgs(),a=>a.StartsWith("--unity-",StringComparison.Ordinal)&&a!="--unity-world-3d"&&!NativeReviewArgs.IsReviewArgument(a));
            inventory=new NativeInventory(()=>{Simulation.ApplyEquipment(inventory.State);hud.Refresh(Simulation.Player,Simulation.TickCount,true);RequestCombatSave();});
            BuildProps();
            var kiSheet=Resources.Load<Texture2D>("Art/vfx/ki_slash_silver_sheet");
            if(kiSheet==null||kiSheet.width%3!=0||kiSheet.height%3!=0)throw new InvalidOperationException("Invalid original kiSlash 3x3 sheet");
            boltView=new NativeBoltView(transform);
            kiView=new KiSlashView(transform,f=>SpriteFor("Art/vfx/ki_slash_silver_sheet",f%3*(kiSheet.width/3),f/3*(kiSheet.height/3),kiSheet.width/3,kiSheet.height/3,new Vector2(.5f,.5f)));
            var hitSheet=Resources.Load<Texture2D>("Art/vfx/ki_slash_hit_silver_sheet");
            if(hitSheet==null||hitSheet.width!=1254||hitSheet.height!=1254)throw new InvalidOperationException("Invalid original kiSlash 2x2 hit sheet");
            impacts=new KiImpactView(transform,f=>SpriteFor("Art/vfx/ki_slash_hit_silver_sheet",f%2*627,f/2*627,627,627,new Vector2(.5f,.5f)));
            skillView=new NativeSkillView(transform);   // B03 skill effects
            ImpactInitialize();
            sound=new NativeFeedbackAudio(transform,view);
            music=new NativeGameMusic(transform,sound.Bus);ambient=new NativeAmbientSources(transform,sound.Bus);   // RM-1 sound: BGM bus, forest bed, 3D environment sources
            sound.ListenerAt=ambient.ListenerAt=()=>Simulation!=null?Point(Simulation.Player.X,Simulation.Player.Y):Vector3.zero;   // the AudioListener sits on the player
            sound.OnScreen=world=>{var v=view.WorldToViewportPoint(world);return v.x>-.05f&&v.x<1.05f&&v.y>-.05f&&v.y<1.05f;};
            ResetRun();
            worldMask=view.cullingMask;lobby=gameObject.AddComponent<NativeLobby>();
            lobby.Initialize(EnterFromLobby);lobby.HasCombatSave=HasCombatSave;lobby.CharacterDeleted=DeleteCombatSave;lobby.StartupGameplayPrepare=PrepareStartupGameplay;lobby.CinematicCompleted=MarkCinematicSeen;
            InitializeNativeSettings();
            pauseMenu=new NativePauseMenu(Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??font,settings,
                SetSfxPercent,SetBgmPercent,SetFrameCap,
                SetFullscreenPreference);
            pauseMenu.OptionChanged=OnSettingsOptionChanged;pauseMenu.LanguagePicked=code=>{lobby.SetLanguage(code);QueueSettingsSave();};pauseMenu.DiagLine=SettingsDiagLine;
            UpdateSettingsPersistenceNotice();
            var args=Environment.GetCommandLineArgs();
            bool legacyFixture=Array.IndexOf(args,"--unity-playtest-capture")>=0||Array.IndexOf(args,"--unity-boss-text-smoke")>=0||Array.IndexOf(args,"--unity-exp-capture")>=0||Array.IndexOf(args,A15DirectArgument)>=0||Array.IndexOf(args,IntroSilenceFlag)>=0||Array.IndexOf(args,NativeSettingsStorageScope.FixtureArgument)>=0||Array.IndexOf(args,"--unity-inventory-keys-smoke")>=0||Array.IndexOf(args,"--unity-pause-smoke")>=0||Array.IndexOf(args,"--unity-character-story-smoke")>=0||Array.IndexOf(args,"--unity-character-store-smoke")>=0||Array.IndexOf(args,"--unity-character-smoke")>=0||Array.IndexOf(args,"--unity-skill-smoke")>=0||Array.IndexOf(args,"--unity-ui-smoke")>=0||Array.IndexOf(args,"--unity-inventory-smoke")>=0||Array.IndexOf(args,"--unity-hud-smoke")>=0||Array.IndexOf(args,"--unity-hud-blend-smoke")>=0||Array.IndexOf(args,"--unity-drop-smoke")>=0||Array.IndexOf(args,"--unity-revive-smoke")>=0||Array.IndexOf(args,"--unity-smoke")>=0;
            InitializeEntryFlowCapture(args);
            if(!legacyFixture){Running=false;if(Array.IndexOf(args,"--unity-quick-start")>=0)lobby.ShowLobby();else lobby.Begin();}
            if(Array.IndexOf(args,"--unity-entry-flow-capture")>=0)StartCoroutine(EntryFlowCapture());
            if(Array.IndexOf(args,"--unity-exp-capture")>=0){menu=false;Running=true;}
            else if(Array.IndexOf(args,A15DirectArgument)>=0){BeginA15DirectReview(args);}
            else if(Array.IndexOf(args,IntroSilenceFlag)>=0){Running=false;StartCoroutine(IntroSilenceCapture());}
            else if(Array.IndexOf(args,NativeSettingsStorageScope.FixtureArgument)>=0){Running=false;StartCoroutine(SettingsPersistenceFixture());}
            else if(Array.IndexOf(args,"--unity-frontend-pad-qa")>=0){Running=false;StartCoroutine(FrontendPadIntegrationQa());}
            else if(Array.IndexOf(args,"--unity-first-practice-review")>=0||Array.IndexOf(args,"--unity-first-practice-capture")>=0){Running=false;StartCoroutine(FirstPracticeFixture(Array.IndexOf(args,"--unity-first-practice-capture")>=0));}
            else if(Array.IndexOf(args,"--unity-startup-capture")>=0){Running=false;StartCoroutine(StartupCapture());}
            else if(Array.IndexOf(args,CombatSaveCaptureFlag)>=0){Running=false;StartCoroutine(CombatSaveCapture());}
            else if(Array.IndexOf(args,"--unity-c04-dump")>=0){Running=false;StartCoroutine(C04Dump());}
            else if(Array.IndexOf(args,"--unity-boss-text-smoke")>=0){Running=false;pauseSmoke=true;StartCoroutine(BossTextLocalityCapture());}
            else if(Array.IndexOf(args,"--unity-playtest-capture")>=0){Running=false;StartCoroutine(PlaytestCapture());}
            else if(Array.IndexOf(args,"--unity-ui-overlap-check")>=0){Running=false;StartCoroutine(UiOverlapCapture());}
            else if(Array.IndexOf(args,"--unity-hero-review")>=0){Running=false;StartCoroutine(HeroCapture());}
            else if(Array.IndexOf(args,"--unity-impact-review")>=0){Running=false;StartCoroutine(ImpactReview());}
            else if(Array.IndexOf(args,"--unity-m1-check")>=0){Running=false;StartCoroutine(M1Check());}
            else if(Array.IndexOf(args,"--unity-review-args-capture")>=0){Running=false;StartCoroutine(ReviewArgsCapture());}
            else if(Array.IndexOf(args,"--unity-field-compare")>=0){Running=false;StartCoroutine(FieldCompare());}
            else if(Array.IndexOf(args,"--unity-cam-capture")>=0){Running=false;StartCoroutine(CameraClampCapture());}
            else if(Array.IndexOf(args,"--unity-rmint-check")>=0){Running=false;StartCoroutine(RemodelIntCheck());}
            else if(Array.IndexOf(args,"--unity-region-hud-capture")>=0){Running=false;StartCoroutine(RegionHudCapture());}
            else if(Array.IndexOf(args,"--unity-hud-blend-smoke")>=0){menu=true;Running=false;StartCoroutine(HudBlendCapture());}
            else if(Array.IndexOf(args,"--unity-inventory-keys-smoke")>=0){inventoryKeysSmoke=true;traceInventoryKeys=true;pauseSmoke=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();StartCoroutine(InventoryKeysSmoke());}
            else if(Array.IndexOf(args,"--unity-ui-finish-capture")>=0){menu=true;Running=false;pauseSmoke=true;StartCoroutine(UiFinishCapture());}
            else if(Array.IndexOf(args,"--unity-pause-smoke")>=0){pauseSmoke=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();menu=true;Running=false;pauseMenu.Reset();StartCoroutine(PauseSmoke());}
            else if(Array.IndexOf(args,"--unity-character-story-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterStorySmoke());}
            else if(Array.IndexOf(args,"--unity-character-store-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterStoreSmoke());}
            else if(Array.IndexOf(args,"--unity-character-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterSmoke());}
            else if(Array.IndexOf(args,"--unity-skill-smoke")>=0){pauseSmoke=true;menu=false;Running=false;StartCoroutine(SkillSmoke());}
            else if(Array.IndexOf(args,"--unity-ui-smoke")>=0){menu=true;Running=false;StartCoroutine(UiSmoke());}
            else if(Array.IndexOf(args,"--unity-language-menu-smoke")>=0){lobbySmoke=true;lobby.AutomatedInput=true;StartCoroutine(LanguageMenuSmoke());}
            else if(Array.IndexOf(args,"--unity-canonical-world-smoke")>=0){lobbySmoke=true;lobby.AutomatedInput=true;StartCoroutine(CanonicalWorldSmoke());}
            else if(Array.IndexOf(args,"--unity-lobby-controls-smoke")>=0){lobbySmoke=true;lobbyControlsSmoke=true;lobby.AutomatedInput=true;StartCoroutine(LobbyControlsSmoke());}
            else if(Array.IndexOf(args,"--unity-quit-during-video")>=0){StartQuitDuringVideo();}else if(Array.IndexOf(args,"--unity-missing-movie-check")>=0){StartMissingMovieCheck();}else if(Array.IndexOf(args,"--unity-intro-keys-smoke")>=0){StartIntroKeysSmoke();}   // DBT-5 repro
            else if(Array.IndexOf(args,"--unity-lobby-smoke")>=0){lobbySmoke=true;lobby.AutomatedInput=true;StartCoroutine(LobbySmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-b05-smoke")>=0){dropSmoke=true;menu=false;Running=false;StartCoroutine(B05Smoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-b07-smoke")>=0){dropSmoke=true;menu=false;Running=false;StartCoroutine(B07Smoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-rage-malice-smoke")>=0){dropSmoke=true;menu=false;Running=false;StartCoroutine(RageMaliceSmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-drop-smoke")>=0){dropSmoke=true;menu=false;Running=false;StartCoroutine(DropSmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-revive-smoke")>=0){reviveSmoke=true;dropSmoke=true;menu=false;Running=false;StartCoroutine(ReviveSmokeRun());} // B08 (dropSmoke keeps focus loss from opening the pause menu)
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-inventory-smoke")>=0){inventorySmoke=true;menu=false;Running=true;StartCoroutine(InventorySmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-hud-smoke")>=0){hudSmoke=true;menu=false;StartCoroutine(HudSmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-smoke")>=0){menu=false;Running=true;StartCoroutine(Smoke());}
        }
        public void ResetRun()
        {
            ResetFirstPractice();
            contactVfx?.Reset();
            startupResetCount++;
            foreach(var e in enemies.Values){Destroy(e.body.gameObject);Destroy(e.walk.gameObject);}enemies.Clear();damage.Clear();damageFloaters.Clear();ResetFieldBossViews();
            kiView?.Reset();boltView?.Reset();impacts?.Reset();skillView?.Reset();skillRemaster?.Reset();sound?.Reset();
            var config=basicWeaponMode?SourceStarterFixture.CreateBasicWeapon():SourceStarterFixture.CreateKiSlash();config.StartX=Map.Data.startX;config.StartY=Map.Data.startY;if(settings!=null)config.DifficultyIndex=settings.Options.Get("diff");if(BuildFlavor.Current.DemoMode)config.LevelCap=BuildFlavor.Current.LevelCap;CombatBeginRun(config);
            Simulation=new Simulation(config,SourceStarterFixture.Seed);revive.Reset();Simulation.ReviveTextRaised+=revive.Add;Simulation.Config.DemoMode=BuildFlavor.Current.DemoMode;Simulation.Materials=1000;Simulation.CanMove=Map.CanMove;Simulation.HasLineOfSight=Map.LineOfSight;Simulation.IsProjectileWall=Map.Blocked;Simulation.LevelledUp+=OnLevelledUp;ReviewArgsApply();ApplySettingsOptions();
            inventory.Reset();CombatRestoreState();skills.SetOpen(false);stats.SetOpen(false);forge.SetOpen(false);levelUp.Hide();levelUpSeen=Simulation.Player.Level;death.Hide();deathShown=false;stageClear.Hide();bossBar.Hide();areaTitle.Hide();areaTitleShown=false;skillInputFence=false;Simulation.ApplyEquipment(inventory.State);CombatRestoreResources();
            Simulation.IsLootOnScreen=l=>{var p=view.WorldToViewportPoint(NativeRemodel3D.Point2D(l.X,l.Y));return p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1;};   // RM-INT: Core callback, always the 2D logic camera
            // D01: mkItem drops are real; R picks the highest rarity on screen (web 32936) into the bag. Persistent saves stay unimplemented.
            Simulation.TryCollectLoot=CollectLoot;ClearDropViews();
            if(playerView==null)playerView=CreateRenderer("Player");
            if(heroView==null)heroView=new NativeHeroView(transform);
            lastX=config.StartX;lastY=config.StartY;walkDistance=0;lastKillCount=0;renderedTick=-1;playerMoving=false;
            hud.Refresh(Simulation.Player,Simulation.TickCount,true);
            StageFlowAttach();   // C07: gate/exit tiles, arena flow reset for this run
            // C01-AI: the natural 1-1 field spawns come from the 14 소환굴 of initStage(0) (rollEtype pool), not from a fixed ring of etype0.
            Simulation.FloorTile=(tx,ty)=>!Map.Blocked((tx+.5f)*40,(ty+.5f)*40);
            Simulation.EnableFieldSpawns();
            Simulation.SpawnStartEnemies();   // M1 fix: the fixed 다안 육괴 x2 + 문지기 + 호위 12~16 initStage(0) places on top of the holes
            Simulation.InitRegions();   // M1-REGION R-A: _regionInit after the holes, start enemies and the gate guard exist
            Simulation.EnableFieldBosses();   // M1-REGION R-B: the four 심연의 앵글러 (spawned by the first tick); the camera decides when they may shoot (_fieldEnemyCanShoot)
            Simulation.FieldEnemyCanShoot=(x,y)=>{float hh=view.orthographicSize*100f,hw=hh*view.aspect,cx=view.transform.position.x*100f,cy=-view.transform.position.y*100f;return Math.Abs(x-cx)<=Math.Max(0,hw-64)&&Math.Abs(y-cy)<=Math.Max(0,hh-64);};
            UpdateViews();
        }
        bool SafePoint(ref float x,ref float y,float r)
        {
            if(Map.CanMove(x,y,r))return true;
            for(float d=40;d<=200;d+=20)for(int j=0;j<8;j++){
                double a=Math.PI/4*j;float nx=x+(float)Math.Cos(a)*d,ny=y+(float)Math.Sin(a)*d;
                if(Map.CanMove(nx,ny,r)){x=nx;y=ny;return true;}
            }return false;
        }
        void Update()
        {
            UpdateSettingsPersistence();UpdateCombatSave();
            lobby.AutomatedInput=lobbySmoke&&!introKeysSmoke;
            if(lobbySmoke&&!lobbyControlsSmoke)lobby.SetPlaybackFocus(true); // Natural-playback fixture only; controls fixture owns focus transitions.
            if(lobby!=null&&lobby.IsBlocking){if(firstPractice!=null)EndFirstPractice(true);Running=false;view.cullingMask=lobby.StartupWorldVisible?worldMask:0;UpdateGameMusic();return;}
            view.cullingMask=worldMask;UpdateGameMusic();
            // Web _showHudAreaTitle (game.html 60243, called from the HUD slow path when the stage changes): Unity has no stage-change event and only stage 0, so the title is shown once per run when play starts (never inside --unity-* verification fixtures).
            if(!areaTitleShown&&areaTitleAllowed){areaTitleShown=true;areaTitle.Show(0,lobby.Language!="ko");}
            // Web addExp (game.html 43226-43242): the level-up overlay is raised by Simulation.LevelledUp (OnLevelledUp); this only keeps the seen level in step for state resets.
            if(Simulation!=null)levelUpSeen=Simulation.Player.Level;
            // Web _fallenResolve death branch (game.html 43851-43896): Player.Hp <= 0 shows #death once. Unity has no chapter / max-combo / damage-log state: chapter 0 is the only ported chapter, combo and log stay unported.
            if(Simulation!=null&&!pauseSmoke&&!hudSmoke&&!inventorySmoke){
                if(PlayerDown){if(!deathShown){deathShown=true;deathCount++;death.Show(new NativeDeathOverlay.Info{kills=Simulation.Kills,chapter=0,expLoss=-1,maxCombo=-1,deaths=deathCount,damageLog=null});}}
                else if(deathShown){deathShown=false;death.Hide();}
            }
            if(WaitForFrontendEntryInput())return;
            if(traceInventoryKeys)TraceInventoryKeys();
            if(!gameFocused){Running=false;return;}
            if(a15DirectReview&&HandleA15DirectKeys())return;
            if(HandlePanelHotkeys())return;
            // Web stat window: ESC blurs the search box first, then closes; K/TAB switch straight to skills/inventory (not while typing).
            if(stats.Open){
                if(ExoInput.KeyDown(KeyCode.Escape)){if(stats.TextInputActive)stats.BlurSearch();else SetStats(false);}
                else if(!stats.TextInputActive&&NativeKeyBindInput.Down("skill"))OnPanelRequested("skillPanel");
                else if(!stats.TextInputActive&&NativeKeyBindInput.Down("inventory"))OnPanelRequested("invPanel");
                else stats.HandleKeys(()=>SetStats(false));
                return;
            }
            if(menu||PlayerDown){
                if(!pauseSmoke)ApplyPauseCommand(pauseMenu.PollKeys(PlayerDown,Screen.fullScreen));
                UpdateViews();return;
            }
            // Web forge window (#forge): G toggles it in HandlePanelHotkeys; ESC closes (_panelBack); K / TAB switch directly to that window.
            if(forge.Open){
                if(ExoInput.KeyDown(KeyCode.Escape)){SetForge(false);return;}
                if(NativeKeyBindInput.Down("skill")){OnPanelRequested("skillPanel");return;}
                if(NativeKeyBindInput.Down("inventory")){OnPanelRequested("invPanel");return;}
                UpdateViews();return;
            }
            // Web togglePanel: pressing another window's key while a window is open switches directly to that window.
            if(inventory.Open&&!inventoryKeysSmoke&&NativeKeyBindInput.Down("skill")){OnPanelRequested("skillPanel");return;}
            if(inventory.Open){if(!inventoryKeysSmoke&&inventory.PollKeys(Simulation.Player.Level))SetInventory(false);UpdateViews();return;}
            if(skillInputFence&&!ExoInput.Mouse(0))skillInputFence=false;
            if(ExoInput.KeyDown(KeyCode.Escape)||NativeKeyBindInput.Down("settings")){
                if(skills.Open){SetSkills(false);return;}
                if(inventory.Open)SetInventory(false);
                else {menu=true;pauseMenu.OpenSettingsDirect();Running=false;}
                return;
            }
            if(skills.Open&&NativeKeyBindInput.Down("inventory")){OnPanelRequested("invPanel");return;}
            if(skills.Open){skills.HandleKeys(()=>SetSkills(false),EquipSelectedSkill);return;}
            if(!menu&&!inventory.Open&&Simulation.Player.Hp>0&&NativeKeyBindInput.Down("skill")){SetSkills(true);return;}
            if(!menu&&Simulation.Player.Hp>0&&NativeKeyBindInput.Down("inventory"))SetInventory(!inventory.Open);
            if(!menu&&!inventory.Open&&Running&&Simulation.Player.Hp>0&&ExoInput.KeyDown(KeyCode.T))ToggleCrossbow();   // web keydown KeyT (not repeat), G.on && !G.paused
            if(!menu&&!inventory.Open&&!Simulation.PlayerCombatWired&&(NativeKeyBindInput.Down("parry")||NativeKeyBindInput.Down("shield")))Toast("패링·방패 기능은 아직 사용할 수 없습니다");
            UpdateViews();
            if(smokeActive)sound?.Probe();
        }
        void FixedUpdate()
        {
            if(practiceScripted||!Running||!gameFocused||Simulation==null||lobby!=null&&lobby.IsBlocking)return;
            var p=Simulation.Player;var aim=AimWorld();
            float x=(NativeKeyBindInput.Held("right")?1:0)-(NativeKeyBindInput.Held("left")?1:0);
            float y=(NativeKeyBindInput.Held("down")?1:0)-(NativeKeyBindInput.Held("up")?1:0);
            if(firstPractice!=null){x+=(ExoInput.Key(KeyCode.RightArrow)?1:0)-(ExoInput.Key(KeyCode.LeftArrow)?1:0);y+=(ExoInput.Key(KeyCode.DownArrow)?1:0)-(ExoInput.Key(KeyCode.UpArrow)?1:0);}
            bool attack=SkillUiState.AttackHeld(NativeKeyBindInput.Held("weapon"),skillInputFence,NativeHud.PointerOverSlots(ExoInput.MousePosition)||PointerOverStageClear(),p.KiChargeActive);
            Simulation.Stage.Enabled=firstPractice==null;
            if(firstPractice==null){   // the first-practice tick sets these once per tick itself (the combat / roll inputs detect edges against the previous call)
            Simulation.SetPlayerCombatInput(NativeKeyBindInput.Held("parry"),NativeKeyBindInput.Held("shield"),NativeKeyBindInput.Held("charge"));
            Simulation.SetRollInput(NativeKeyBindInput.Held("up"),NativeKeyBindInput.Held("down"),NativeKeyBindInput.Held("left"),NativeKeyBindInput.Held("right"),NativeKeyBindInput.HeldKeyboard("roll"));
            SetSkillKeys();}
            int statPointsBeforeTick=Simulation.Player.StatPoints;
            if(!HandleFirstPracticeTick(x,y,aim.x*100,-aim.y*100,attack,PointerOverPractice()))Simulation.Tick(x,y,aim.x*100,-aim.y*100,attack,NativeKeyBindInput.Held("interact"));
            StageFlowPump(statPointsBeforeTick);DispatchFeedback();
            if(PlayerDown){Running=false;Toast("쓰러졌습니다");}
            if(Simulation.Kills>lastKillCount){lastKillCount=Simulation.Kills;Toast("처치 · 악의 +4");}
        }
        public void StepInput(float x,float y,float aimX,float aimY,bool attack,bool pickup)
        {Simulation.Stage.Enabled=firstPractice==null;int statPointsBeforeTick=Simulation.Player.StatPoints;Simulation.Tick(x,y,aimX,aimY,attack,pickup);StageFlowPump(statPointsBeforeTick);DispatchFeedback();UpdateViews();}
        // RM-1 sound A1/A2: web BGM.play(key) -- hell<N> while exploring, boss in the arena, victory after the boss, death when the player is down; silent in the lobby
        string DesiredMusic()
        {
            if(Simulation==null||menu||lobby!=null&&lobby.IsBlocking)return "";
            if(PlayerDown)return "death";
            var flow=Simulation.Stage;
            if(flow.InArena)return flow.BossAlive?"boss":"victory";
            return "hell"+((int)EnemyTables.SiToHell[Math.Min(Simulation.Config.StageIndex,EnemyTables.SiToHell.Length-1)]+1);
        }
        void UpdateGameMusic()
        {
            if(music==null)return;
            string key=DesiredMusic();
            if(key.Length>0&&music.Wanted.Length==0)lobby?.StopStageMusic();   // the lobby's startup stage music hands over to the game BGM
            music.Sync(key);music.Tick(Time.unscaledDeltaTime);ambient.Tick(Time.unscaledDeltaTime);
        }
        // sounds the host owes the Core's fight timeline: P1 entry (staff taps, root pillars rise), spaced in ticks after the boss intro
        void DispatchFeedback()
        {
            sound.CurrentTick=Simulation.TickCount;
            while(Simulation.Feedback.Count>0){var e=Simulation.Feedback.Dequeue();if(!Impact3DActive||e.Kind!=FeedbackKind.KiSlashHit)impacts.Handle(e);sound.Handle(e);}
            sound.Flush();
        }
        void BuildProps()
        {
            foreach(var p in Map.Data.props){var r=CreateRenderer(p.id);var texture=Resources.Load<Texture2D>(p.texture);
                if(texture==null)throw new InvalidOperationException("Missing original prop "+p.texture);
                r.sprite=SpriteFor(p.texture,0,0,texture.width,texture.height,new Vector2(p.pivotX,1-p.pivotY));
                r.transform.position=Point(p.x,p.y);r.transform.localScale=new Vector3(p.width/texture.width,p.height/texture.height,1);
                r.transform.rotation=Quaternion.Euler(0,0,-p.rotation);r.flipX=p.flip;r.color=new Color(1,1,1,p.alpha);r.sortingOrder=p.ground?-20000:(int)p.y;props.Add(r);
            }
        }
        void StreamChunks(float x,float y)
        {
            int cx=(int)(x/1000),cy=(int)(y/1000);var keep=new HashSet<int>();
            // Visible1920x1080 plus neighbor margin; assets outside are released.
            foreach(var c in Map.Data.chunks){int gx=(int)(c.x/1000),gy=(int)(c.y/1000);if(Math.Abs(gx-cx)>2||Math.Abs(gy-cy)>1)continue;
                int id=gy*8+gx;keep.Add(id);if(chunks.ContainsKey(id))continue;
                var r=CreateRenderer("Ground "+gx+","+gy);r.sprite=SpriteFor(c.texture,c.sx,c.sy,c.sw,c.sh,new Vector2(0,1));
                r.transform.position=Point(c.x,c.y);r.transform.localScale=new Vector3(c.width/c.sw,c.height/c.sh,1);r.sortingOrder=-30000;
                chunks.Add(id,new ChunkView{renderer=r,path=c.texture});
            }
            var remove=new List<int>();foreach(var pair in chunks)if(!keep.Contains(pair.Key))remove.Add(pair.Key);
            foreach(int id in remove){var c=chunks[id];Destroy(c.renderer.gameObject);chunks.Remove(id);ReleaseSprites(c.path);}
        }
        void UpdateViews()
        {
            if(Simulation==null||view==null)return;Remodel3DRestoreBillboards();var p=Simulation.Player;
            contactVfx?.Observe(Simulation,ImpactNow);
            float shk=Simulation.ShakeAmount*OptionShakeScale;   // B09: web G.shake -> camera offset (random +-shake px, game.html 51900)
            float camX=p.X/100,camY=-p.Y/100;BossCameraZoom();ClampCameraToMap(ref camX,ref camY);   // [CAM-CLAMP] web _clampCamToMap before the shake offset
            view.transform.position=new Vector3(camX+(shk>0?(UnityEngine.Random.value-.5f)*shk*2/100:0),camY+(shk>0?(UnityEngine.Random.value-.5f)*shk*2/100:0),-10);StageFlowSyncViews();if(!Simulation.Stage.InArena)StreamChunks(p.X,p.Y);
            bool newTick=renderedTick!=Simulation.TickCount;
            if(newTick){float dx=p.X-lastX,dy=p.Y-lastY;walkDistance+=Mathf.Sqrt(dx*dx+dy*dy);lastX=p.X;lastY=p.Y;playerMoving=dx*dx+dy*dy>.001f;}
            int direction=((int)Math.Floor((Math.PI/2-p.Facing)/(Math.PI/4)+.5)%8+8)%8;
            bool attack=p.State=="wSwing"||p.KiChargeActive;bool moving=playerMoving;
            int frame=p.KiChargeActive?0:attack?Mathf.Clamp((int)(p.SwingProgress*9),0,8):moving?2+(int)(walkDistance/32)%8:(Simulation.TickCount/48)%2;
            playerView.sprite=attack?SpriteFor("Art/player/attack-bat-v1",frame*80,direction*80,80,80,new Vector2(.5f,45f/80)):
                SpriteFor("Art/player/"+directions[direction],frame*48,0,48,48,new Vector2(.5f,.5f));
            playerView.transform.position=Point(p.X,p.Y);playerView.transform.localScale=Vector3.one*2*(NativeRemodel3D.Active?NativeRemodelCamera.HeroScale:1);playerView.sortingOrder=(int)p.Y;
            // web roll: the body curls up and turns once (360 degrees) over the 18 frames, dust trail
            playerView.transform.rotation=Simulation.RollActive?Quaternion.Euler(0,0,-360f*(1f-(float)Simulation.RollMoveT/RollRules.Frames)):Quaternion.identity;
            if(!ImpactHeroHeld)heroView?.Sync(Simulation,playerMoving);playerView.enabled=heroView==null||!heroView.Ready;
            foreach(var e in Simulation.Enemies)
            {
                if(Simulation.IsRemodelProp(e)){if(enemies.TryGetValue(e.Id,out var pv)){pv.body.enabled=false;pv.walk.enabled=false;if(pv.arc!=null)pv.arc.enabled=false;}continue;}   // RM-B0b: a boss prop (sprout, cord knot) is no enemy: the boss presentation draws it from Simulation.RemodelProps
                if(!enemies.TryGetValue(e.Id,out var ev)){
                    // web _assignMobSkin: the fixed atlas cell the factory rolled from the etype and the spawn x (_mob8Col/_mob8Row); revived ghouls have none and keep the position hash
                    int idx=e.Web!=null&&e.Web._mob8Col.HasValue&&e.Web._mob8Row.HasValue?(int)e.Web._mob8Row.Value*8+(int)e.Web._mob8Col.Value:((int)(e.X*31)&0x7fffffff)%40;
                    ev=new EnemyView{body=CreateRenderer("Enemy "+e.Id),walk=CreateRenderer("Enemy walk "+e.Id),skin=idx,lastX=e.X,lastY=e.Y,hp=e.Hp,shield=e.Shield};enemies.Add(e.Id,ev);
                }
                ev.body.enabled=e.Alive;ev.walk.enabled=e.Alive;if(ev.arc!=null&&!e.Alive)ev.arc.enabled=false;if(!e.Alive){BossSinkDraw(e,ev);continue;}
                int dealtHp=Mathf.RoundToInt(ev.hp-e.Hp),dealtShield=Mathf.RoundToInt(ev.shield-e.Shield);if(dealtShield>0)damage.Add(new DamageText{x=e.X,y=e.Y-24,amount=dealtShield,shield=true,until=Time.unscaledTime+1});if(dealtHp>0)damage.Add(new DamageText{x=e.X,y=e.Y,amount=dealtHp,until=Time.unscaledTime+1});ev.hp=e.Hp;ev.shield=e.Shield;
                if(newTick){float ex=e.X-ev.lastX,ey=e.Y-ev.lastY;float travel=Mathf.Sqrt(ex*ex+ey*ey);ev.distance+=travel;ev.lastX=e.X;ev.lastY=e.Y;ev.moving=travel>.001f;}
                if(BossBodyDraw(e,ev,newTick))continue;   // BX: the 1-1 druid has its own sheets (damage numbers and walk bookkeeping above already ran)
                // Keep the struck body's last drawn pose for 55/75/90ms; Core movement and knockback continue unchanged.
                if(Impact3DActive&&contactVfx.EnemyFrozen(e.Id,ImpactNow)&&ev.body.sprite!=null){float flash=contactVfx.Flash(e.Id,ImpactNow);ev.walk.enabled=ev.moving;ev.body.color=ev.walk.color=Color.Lerp(Color.white,new Color(1,.82f,.54f),flash*.8f);continue;}
                double faceAng=e.Facing;if(!ev.moving&&p.Hp>0&&Mathf.Sqrt((p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y))<800)faceAng=Math.Atan2(p.Y-e.Y,p.X-e.X);   // drawEnBody: standing mobs within 800 px look at the player
                int dir=((int)Math.Floor(faceAng/(Math.PI/4)+.5)%8+8)%8,cellX=ev.skin%8,cellY=ev.skin/8;
                ev.body.sprite=SpriteFor("Art/enemy/atlas_ch1_8dir_"+enemyDirections[dir],cellX*256,cellY*256,256,256,new Vector2(.5f,.5f));
                ev.walk.sprite=SpriteFor("Art/enemy/atlas_ch1_8dir_walk_"+enemyDirections[dir],cellX*1024+((int)(ev.distance/128)%4)*256,cellY*256,256,256,new Vector2(.5f,.5f));
                float size=e.Radius*7/256;ev.body.transform.position=ev.walk.transform.position=Point(e.X,e.Y);ev.body.transform.localScale=ev.walk.transform.localScale=Vector3.one*size;
                ev.body.sortingOrder=(int)e.Y;ev.walk.sortingOrder=(int)e.Y+1;ev.walk.enabled=e.Alive&&ev.moving;
                Color tint=Color.white;if(e.IsGhoul&&e.Col!=null)ColorUtility.TryParseHtmlString(e.Col,out tint);if(e.IsGhoul)tint=Color.Lerp(Color.white,tint,.62f); // ghoul: no art of its own, a green-grey body (web draws it procedurally)
                if(e.IsBoss)tint=Color.Lerp(tint,new Color(1,.55f,.45f),.5f);   // C07: a boss actor without art of its own reads as a boss
                if(Simulation.Config.EnemyAiEnabled&&e.Web!=null&&e.Web._spawnT>0)tint.a=Mathf.Max(0,1-(float)e.Web._spawnT/20);   // drawEn: 20 frame fade-in of a fresh spawn
                ev.body.color=ev.walk.color=e.HurtTicks>0?new Color(1,.62f,.62f,tint.a):tint;
                UpdateEnemyShieldArc(e,ev);
            }
            PruneEnemyViews();FieldBossViews();
            UpdateDropViews();
            skillRemaster?.Update(Simulation,ImpactNow);
            if(skillRemaster!=null&&skillRemaster.Active)kiView?.Reset();else kiView?.Update(Simulation);
            boltView?.Update(Simulation);BossViewUpdate();
            impacts?.Update(Simulation.TickCount);
            if(skillRemaster!=null&&skillRemaster.Active)skillView?.Reset();else skillView?.Update(Simulation,Time.time);
            hud?.Refresh(p,Simulation.TickCount);StageFlowBossBar();
            renderedTick=Simulation.TickCount;damage.RemoveAll(d=>Time.unscaledTime>d.until);
        }
        // game.html drawEn (53853-53870): every mob with an energy shield carries a pulsing pale-blue arc (radius r+5, +-1.0 rad around shieldAng, 5 px stroke, 25% wedge fill);
        // once the shield is gone the dark physical-shield arc stays (r+4, +-0.8 rad, 3 px, #445577). Baked per radius, tinted / pulsed per frame.
        static readonly Dictionary<int,Sprite> arcSprites=new Dictionary<int,Sprite>();
        static Sprite ArcSprite(int radius,bool physical)
        {
            int key=radius*2+(physical?1:0);if(arcSprites.TryGetValue(key,out var cached))return cached;
            float ring=radius+(physical?4:5),stroke=physical?3:5,span=physical?.8f:1f;const int ss=2;int n=((int)ring+8)*2*ss;
            var tex=new Texture2D(n,n,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};var px=new Color32[n*n];
            Color sc=physical?new Color(.267f,.333f,.467f):new Color(.267f,.8f,1f),fc=physical?new Color(60/255f,80/255f,110/255f):new Color(68/255f,200/255f,1f);
            for(int y=0;y<n;y++)for(int x=0;x<n;x++)
            {
                float dx=(x+.5f-n/2f)/ss,dy=(n/2f-(y+.5f))/ss,d=Mathf.Sqrt(dx*dx+dy*dy),a=Mathf.Atan2(dy,dx);
                float edge=Mathf.Clamp01(1-(Mathf.Abs(a)-span)*ring*ss*.5f);   // ~1 px soft end
                float sa=Mathf.Clamp01(stroke/2-Mathf.Abs(d-ring)+.5f)*edge,fa=(d<=ring+.5f?Mathf.Clamp01(ring+.5f-d):0)*edge*.25f;
                float oa=sa+fa*(1-sa);Color o=oa>0?(sc*sa+fc*fa*(1-sa))/oa:Color.black;
                px[y*n+x]=new Color(o.r,o.g,o.b,oa);
            }
            tex.SetPixels32(px);tex.Apply(false,true);
            var s=Sprite.Create(tex,new Rect(0,0,n,n),new Vector2(.5f,.5f),100f*ss,0,SpriteMeshType.FullRect);arcSprites[key]=s;return s;
        }
        void UpdateEnemyShieldArc(EnemyState e,EnemyView ev)
        {
            if(e.Web==null||e.IsBoss||e.MaxShield<=0||e.Web.eShieldMax<=0){if(ev.arc!=null)ev.arc.enabled=false;return;}
            if(ev.arc==null)ev.arc=CreateRenderer("Enemy shield "+e.Id);
            bool phys=e.Shield<=0;ev.arc.enabled=true;ev.arc.sprite=ArcSprite(Mathf.Max(1,Mathf.RoundToInt(e.Radius)),phys);
            float now=Time.unscaledTime*1000f,ratio=Mathf.Clamp01(e.Shield/e.MaxShield),pulse=.5f+Mathf.Sin(now/150)*.15f;
            ev.arc.color=phys?Color.white:new Color(1,1,1,(.4f+ratio*.4f)*pulse);
            ev.arc.transform.position=Point(e.X,e.Y);ev.arc.transform.rotation=Quaternion.Euler(0,0,-(float)e.Web.shieldAng*Mathf.Rad2Deg);ev.arc.sortingOrder=(int)e.Y+2;
        }
        SpriteRenderer CreateRenderer(string name){var go=new GameObject(name);go.transform.SetParent(transform);return go.AddComponent<SpriteRenderer>();}
        Sprite SpriteFor(string resource,int x,int top,int width,int height,Vector2 pivot)
        {
            string key=resource+":"+x+":"+top+":"+width+":"+height+":"+pivot.x+":"+pivot.y;
            if(spriteCache.TryGetValue(key,out var value))return value;
            var texture=Resources.Load<Texture2D>(resource);if(texture==null)throw new InvalidOperationException("Missing original texture "+resource);
            if(x<0||top<0||x+width>texture.width||top+height>texture.height)throw new InvalidOperationException("Invalid source sprite rect "+key+" texture"+texture.width+"x"+texture.height);
            value=Sprite.Create(texture,new Rect(x,texture.height-top-height,width,height),pivot,100,0,SpriteMeshType.FullRect);spriteCache.Add(key,value);return value;
        }
        void ReleaseSprites(string resource)
        {
            var keys=new List<string>();foreach(var pair in spriteCache)if(pair.Key.StartsWith(resource+":"))keys.Add(pair.Key);
            Texture2D texture=null;foreach(string key in keys){texture=spriteCache[key].texture;Destroy(spriteCache[key]);spriteCache.Remove(key);}if(texture!=null)Resources.UnloadAsset(texture);
        }
        static Vector3 Point(float x,float y){return NativeRemodel3D.Point(x,y);}   // RM-INT: off = the 2D mapping unchanged
        // B03: held states of the skill keys (web keydown: Digit1-4 slots, Space rage burst, F area, Ctrl fixed skill, Z ult); Space shares the roll key by default
        void SetSkillKeys()
        {
            string bow=NativeKeyBindInput.Bindings.Primary("bow"),roll=NativeKeyBindInput.Bindings.Primary("roll");
            if(menu||skills.Open||inventory.Open||stats.Open||forge.Open){Simulation.SetSkillInput(false,false,false,false,false,false,false,false);Simulation.SetMagicInput(false);return;}   // the panels use the digit keys themselves
            Simulation.SetMagicInput(NativeKeyBindInput.Held("beam"));   // B03b: E-slot malice orb (web 'beam' action, default mouse2)
            Simulation.SetSkillInput(ExoInput.Key(KeyCode.Alpha1),ExoInput.Key(KeyCode.Alpha2),ExoInput.Key(KeyCode.Alpha3),ExoInput.Key(KeyCode.Alpha4),
                NativeKeyBindInput.Held("bow"),ExoInput.Key(KeyCode.F),ExoInput.Key(KeyCode.LeftControl),ExoInput.Key(KeyCode.Z),bow!=null&&bow==roll);
        }
        // Web: _xbowEquipped toggle + showPH('석궁 자동발사 ON/OFF'). OPT.xbowAuto persistence belongs to the settings owner and is not wired here.
        public void ToggleCrossbow(){Toast(Simulation.ToggleCrossbowAuto()?"석궁 자동발사 ON":"석궁 자동발사 OFF");}
        void Toast(string text){notice=text;noticeUntil=Time.unscaledTime+3;}
        void InitGUI()
        {
            if(guiReady)return;guiReady=true;
            label=new GUIStyle(GUI.skin.label){font=font,fontSize=20};label.normal.textColor=new Color(.88f,.85f,.76f);
            small=new GUIStyle(label){fontSize=16};title=new GUIStyle(label){fontSize=32};center=new GUIStyle(label){alignment=TextAnchor.MiddleCenter};
            statusTitle=new GUIStyle(label){fontSize=20,fontStyle=FontStyle.Bold};statusTitle.normal.textColor=new Color(.9f,.84f,.69f);
            statusDetail=new GUIStyle(small){fontSize=16};statusDetail.normal.textColor=new Color(.84f,.82f,.75f);
            button=new GUIStyle(GUI.skin.button){font=font,fontSize=22};
            characterBadge=new GUIStyle(label){font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??font};
        }
        void OnGUI()
        {
            if(Simulation==null)return;
            if(lobby!=null&&lobby.IsBlocking){if(lobby.StartupHudVisible)DrawStartupWorldHud();return;}
            if(stageClear.Active){stageClear.LocaleCode=lobby.Language;stageClear.DiagnosticDetails=lobby.DiagnosticUiEnabled;stageClear.Draw();return;}
            if(stats.Open){stats.Draw(()=>SetStats(false));return;}
            if(forge.Open){forge.Draw(Simulation,inventory.State,()=>SetForge(false));return;}
            if(skills.Open){skills.Draw(Simulation,()=>SetSkills(false),EquipSelectedSkill);return;}
            if(inventory.Open){inventory.Draw(Simulation.Player.Level,Simulation.Player,()=>SetInventory(false));return;}
            if(menu&&!hudSmoke&&!inventorySmoke)
            {
                InitGUI();
                pauseMenu.English=lobby.Language!="ko";pauseMenu.LocaleCode=lobby.Language;
                TraceA15HitRoot("before");ApplyPauseCommand(pauseMenu.Draw(PlayerDown,Screen.fullScreen));TraceA15HitRoot("after");DrawSettingsOverlays();return;
            }
            InitGUI();var old=GUI.matrix;GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,new Vector3(Screen.width/1920f,Screen.height/1080f,1));
            var p=Simulation.Player;
            // B09: web draws the hit flash (_hitFlash) and the red damage flash (scrFlash) over the canvas, under the DOM HUD (game.html 55077-55078)
            if(Simulation.HitFlashAlpha>0){Color hc=Color.white;ColorUtility.TryParseHtmlString(Simulation.HitFlashColor,out hc);hc.a=Simulation.HitFlashAlpha;Fill(new Rect(0,0,1920,1080),hc);}
            // 웹 rgba(200,0,0,.25)의 색 알파와 globalAlpha를 함께 적용한다. Core 감쇠는 그대로 둔다.
            if(Simulation.ScreenFlashAlpha>0)Fill(new Rect(0,0,1920,1080),new Color(200f/255,0,0,Simulation.ScreenFlashAlpha*.25f));
            StageFlowDrawLoad();   // C07: black load screen under the HUD (the web draws it on the canvas, below the DOM HUD)
            var baseMatrix=GUI.matrix;float hudScale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,Vector3.one*hudScale);
            float hudWidth=Screen.width/hudScale,statusX=hudWidth-316;
            if(lobby.DiagnosticUiEnabled&&lobby.ActiveCharacterName.Length>0){Panel(new Rect(16,12,420,50));NativeUiAudit.Label(new Rect(28,20,396,40),lobby.ActiveCharacterName+" · "+(lobby.Language=="ko"?"미리보기":"Preview"),characterBadge);}
            // Web #mmLvl objective panel (game.html 2576-2586): level / experience / area kills / malice from Unity state; Unity has no area-kill total (shown as 미이식).
            if(firstPractice==null){int areaK,areaT;Simulation.AreaKills(regionHud.CurIdx,out areaK,out areaT);objective.Draw(hudWidth,new NativeObjectivePanel.Info{level=p.Level,exp=p.Experience,maxExp=p.MaxExperience,materials=Simulation.Materials,areaKills=areaK,areaTotal=areaT,english=lobby.Language!="ko"});}   // LT-5: "지역 처치" = current region min(kills,total)/total, else G._stageKills/G._totalSpawned (web 60584-60586), not G.kills
            DrawFieldHud(hudWidth);
            hud.Draw(hudWidth,Screen.height/hudScale,Simulation.Config.ActiveAttack,Simulation);DrawFirstPractice(hudWidth);GUI.matrix=baseMatrix;
            // 전환 중 전투 안내·지역 제목·레벨업이 중앙 명패를 덮지 않게 한다. 자원 HUD는 유지한다.
            if(Simulation.Stage.LoadPhase>0){GUI.matrix=old;return;}
            // game.html drawEn 54054: a 4 px bar (r*2+6 wide, r+16 above the centre) once the mob is hurt or its shield is down: black 60%, red hp, the blue shield laid over it
            foreach(var e in Simulation.Enemies){if(!e.Alive||e.IsBoss||!(e.Hp<e.MaxHp||e.MaxShield>0&&e.Shield<e.MaxShield))continue;float ebw=e.Radius*2+6;var ebA=ToGUI(e.X-ebw/2,e.Y-e.Radius-16);var ebB=ToGUI(e.X+ebw/2,e.Y-e.Radius-16);float ebWid=ebB.x-ebA.x,ebHgt=Mathf.Max(2,4*ebWid/ebw);
                Fill(new Rect(ebA.x,ebA.y,ebWid,ebHgt),new Color(0,0,0,.6f));Fill(new Rect(ebA.x,ebA.y,ebWid*Mathf.Clamp01((float)e.Hp/e.MaxHp),ebHgt),new Color(.8f,0,0));if(e.MaxShield>0&&e.Shield>0)Fill(new Rect(ebA.x,ebA.y,ebWid*Mathf.Min(1,e.Shield/e.MaxShield),ebHgt),new Color(.267f,.667f,1f));}
            DrawFieldBossBars();
            floatingTextLayout.BeginFrame(Time.unscaledTime);
            floatingTextLayout.Reserve(new NativeFloatingTextLayout.Box(0,0,160,176));floatingTextLayout.Reserve(new NativeFloatingTextLayout.Box(1600,0,320,190));
            if(Simulation.Stage.InArena&&druidBody!=null&&druidBody.Visible){var bounds=druidBody.Bounds;var a=HudCamera.WorldToScreenPoint(new Vector3(bounds.min.x,bounds.max.y,bounds.center.z));var b=HudCamera.WorldToScreenPoint(new Vector3(bounds.max.x,bounds.min.y,bounds.center.z));floatingTextLayout.Reserve(new NativeFloatingTextLayout.Box(a.x*1920/Screen.width,(Screen.height-a.y)*1080/Screen.height,(b.x-a.x)*1920/Screen.width,(a.y-b.y)*1080/Screen.height));}
            foreach(var d in damage)if(!d.submitted){d.submitted=true;damageFloaters.Add(d.x,d.y,d.amount.ToString(),d.shield?"#66ddff":"#ead7ac",d.shield?"enemy-shield":"enemy-hp",NativeFloatingTextLayout.DamagePriority,d.until-1,1,true,d.amount);}
            foreach(var n in damageFloaters.Live(Time.unscaledTime))NativeReviveHud.Offer(floatingTextLayout,n,ToGUI(n.X,n.Y),center);
            DrawPracticeShots();
            revive.Font=font;revive.English=lobby.Language!="ko";revive.CollectFloaters(ToGUI,center,floatingTextLayout);
            floatingTextLayout.Resolve();NativeReviveHud.DrawRequests(floatingTextLayout,center);
            if(Time.unscaledTime<noticeUntil)NativeUiAudit.Label(new Rect(560,180,800,45),notice,center);
            if(levelUp.Active){var lp=HudCamera.WorldToScreenPoint(Point(p.X,p.Y));levelUp.Draw(new Vector2(lp.x,Screen.height-lp.y));}
            if(areaTitle.Active)areaTitle.Draw();
            DrawRegionHud();   // M1 region HUD: entry/purge banner + direction arrow
            // Boss bar: Unity has no boss actor / boss-entry event yet, so nothing calls bossBar.Show(); once one exists it passes name (BossNameForStage), hp, poise, groggy/immune state and status chips each frame.
            if(bossBar.Active)bossBar.Draw();
            StageFlowDrawWorld();
            if(p.State=="fallen"&&!death.Active)revive.DrawFallen(p,label);
            if(death.Active&&PlayerDown&&!heroReviewActive){death.Draw();}
            else if((menu||PlayerDown)&&!hudSmoke&&!inventorySmoke&&!heroReviewActive){
                pauseMenu.English=lobby.Language!="ko";
                pauseMenu.LocaleCode=lobby.Language;
                TraceA15HitRoot("before");
                ApplyPauseCommand(pauseMenu.Draw(PlayerDown,Screen.fullScreen));
                TraceA15HitRoot("after");
            }
            DrawSettingsOverlays();
            GUI.matrix=old;
        }
        void SetSkills(bool open,int slot=6){
            if(open&&firstPractice!=null)return;
            if(open){skillsWasRunning=Running;Running=false;}
            skills.SetOpen(open,slot);
            if(!open){skillInputFence=true;Running=skillsWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        void SetForge(bool open){
            if(open&&firstPractice!=null)return;
            if(open){forgeWasRunning=Running;Running=false;}
            forge.SetOpen(open);
            if(!open){skillInputFence=true;Running=forgeWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        void SetStats(bool open){
            if(open&&firstPractice!=null)return;
            if(open){statsWasRunning=Running;Running=false;}
            stats.SetOpen(open);
            if(!open){skillInputFence=true;Running=statsWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        // Web _injectPanelNav: a tab click opens that window (openPanel closes the others first); the active tab is ignored by the bar itself.
        // forge: the tab bar never requests the active window, so a request while open is the G key (toggle).
        // Web addExp -> _levelUpVfx.trigger(P,stage,lvd,demonic): one overlay trigger per addExp call that gained levels.
        void OnLevelledUp(LevelUpEvent up){levelUp.Show(up.NewLevel);levelUpSeen=up.NewLevel;RequestCombatSave();}
        void OnPanelRequested(string id){
            if(Simulation==null||Simulation.Player.Hp<=0||firstPractice!=null)return;
            bool TabOpen(string tab){return tab=="settings"?menu:tab=="invPanel"?inventory.Open:tab=="skillPanel"?skills.Open:tab=="statPanel"?stats.Open:tab=="forge"?forge.Open:false;}
            bool hadVisiblePanel=(lobby==null||!lobby.IsBlocking)&&(menu||inventory.Open||skills.Open||stats.Open||forge.Open);
            bool targetWasOpen=TabOpen(id);
            switch(id){
                case "settings":
                    if(forge.Open)SetForge(false);
                    if(stats.Open)SetStats(false);
                    if(skills.Open)SetSkills(false);
                    if(inventory.Open)SetInventory(false);
                    if(!menu){menu=true;pauseMenu.OpenSettingsDirect();Running=false;}
                    break;
                case "invPanel":
                    if(forge.Open)SetForge(false);
                    if(stats.Open)SetStats(false);
                    if(skills.Open)SetSkills(false);
                    if(menu){menu=false;Running=true;}
                    if(!inventory.Open)SetInventory(true);
                    break;
                case "skillPanel":
                    if(forge.Open)SetForge(false);
                    if(stats.Open)SetStats(false);
                    if(inventory.Open)SetInventory(false);
                    if(menu){menu=false;Running=true;}
                    if(!skills.Open)SetSkills(true);
                    break;
                case "statPanel":
                    if(forge.Open)SetForge(false);
                    if(skills.Open)SetSkills(false);
                    if(inventory.Open)SetInventory(false);
                    if(menu){menu=false;Running=true;}
                    SetStats(!stats.Open);
                    break;
                case "forge":
                    if(forge.Open){SetForge(false);break;}
                    if(stats.Open)SetStats(false);
                    if(skills.Open)SetSkills(false);
                    if(inventory.Open)SetInventory(false);
                    if(menu){menu=false;Running=true;}
                    SetForge(true);
                    break;
                default:
                    Debug.Log("[PanelTabBar] "+id+" window is not ported yet");
                    break;
            }
            // 요청 자체가 아니라, 이미 보이던 다른 패널에서 대상 열기가 확정된 뒤에만 재생한다.
            if(hadVisiblePanel&&!targetWasOpen&&!PlayerDown&&TabOpen(id))sound?.PlayUiTab();
        }
        // Web update() 32117~32122: window keys are processed while paused. G = forge, J = stats, F10 = settings toggle.
        // TAB/K switching between inventory and skills is in OnPanelRequested's callers; ESC follows _panelBack (close the open window, else open settings).
        bool HandlePanelHotkeys(){
            if(Simulation==null||Simulation.Player.Hp<=0||firstPractice!=null||stats.TextInputActive||pauseMenu.KeyCaptureActive)return false;   // A16: a key waiting in the binding page must not open windows
            if(NativeKeyBindInput.Down("forge")){OnPanelRequested("forge");return true;}
            if(NativeKeyBindInput.Down("stats")){OnPanelRequested("statPanel");return true;}
            if(ExoInput.KeyDown(KeyCode.F10)){
                if(menu){if(gameFocused){menu=false;skillInputFence=true;Running=true;}}   // togglePanel('settings') while settings is open closes it
                else OnPanelRequested("settings");
                return true;
            }
            return false;
        }
        // Death screen 'retry' button = the pause menu's Restart command.
        void RetryFromDeath(){if(gameFocused){if(RetryInsideArena())return;ResetRun();skillInputFence=true;menu=false;Running=true;}}
        void EquipSelectedSkill(){if(SkillUiState.TryEquipKiSlash(Simulation,skills.SelectedSlot))basicWeaponMode=false;}
        void SetSfxPercent(int percent){settings.SetSfxPercent(percent);sound.SetVolumePercent(settings.SfxPercent);music.SetPercents(settings.SfxPercent,settings.BgmPercent);lobby?.SetStartupSfxPercent(settings.SfxPercent);QueueSettingsSave();}
        void SetBgmPercent(int percent){settings.SetBgmPercent(percent);lobby.SetBgmPercent(settings.BgmPercent);music.SetPercents(settings.SfxPercent,settings.BgmPercent);QueueSettingsSave();}
        void SetFrameCap(int cap){if(settings.TrySetFrameCap(cap)){ApplyFrameCap(cap);QueueSettingsSave();}}
        void ApplyFrameCap(int cap){QualitySettings.vSyncCount=0;Application.targetFrameRate=cap==0?-1:cap;}
        void ApplyPauseCommand(PauseMenuCommand command){
            switch(command){
                case PauseMenuCommand.Resume: if(gameFocused&&Simulation.Player.Hp>0){menu=false;skillInputFence=true;Running=true;} break;
                case PauseMenuCommand.Restart:if(gameFocused){ResetRun();skillInputFence=true;menu=false;Running=true;}break;
                case PauseMenuCommand.ReturnLobby:SaveCombatNow();Running=false;menu=true;sound.Reset();pauseMenu.Reset();lobby.ShowLobby();break;
                case PauseMenuCommand.Quit:if(gameFocused){SaveCombatNow();Application.Quit();}break;
            }
        }
        Vector2 ToGUI(float x,float y){var v=HudCamera.WorldToViewportPoint(Point(x,y));return new Vector2(v.x*1920,(1-v.y)*1080);}
        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        static void Panel(Rect r){Fill(r,new Color(.025f,.032f,.027f,.94f));Fill(new Rect(r.x,r.y,r.width,1),new Color(.49f,.4f,.24f));Fill(new Rect(r.x,r.y+r.height-1,r.width,1),new Color(.28f,.24f,.16f));}
        static void StatusBackdrop(Rect r)
        {
            const int bands=24;
            for(int i=0;i<bands;i++)
            {
                float t=(i+.5f)/bands;
                float left=r.x+r.width*i/bands,right=r.x+r.width*(i+1)/bands;
                Fill(new Rect(left,r.y,right-left,r.height),new Color(.025f,.032f,.027f,Mathf.Lerp(.16f,.4f,t*t)));
            }
        }
        IEnumerator Smoke()
        {
            Running=false;smokeActive=true;float before=Simulation.Player.X;
            var cadence=new WaitForFixedUpdate();
            for(int i=0;i<30;i++){StepInput(1,0,Simulation.Player.X+100,Simulation.Player.Y,false,false);yield return cadence;}
            string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;
            Directory.CreateDirectory(output);bool moved=Simulation.Player.X>before;float finalX=Simulation.Player.X;
            yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-first-playable.png"));yield return null;
            bool charged=false,released=false,impactCaptured=false;float maximumCharge=0;int maximumProjectiles=0;
            // Controlled native-player input through the same Tick adapter as
            // FixedUpdate. This is an automated fixture, not manual play QA.
            for(int i=0;i<300;i++){
                var p=Simulation.Player;EnemyState target=null;float nearest=float.MaxValue;
                foreach(var e in Simulation.Enemies)if(e.Alive){float dx=e.X-p.X,dy=e.Y-p.Y,d=dx*dx+dy*dy;if(d<nearest){nearest=d;target=e;}}
                bool hold=!(p.KiChargeActive&&p.KiChargeTicks>=120);
                if(!hold)released=true;
                StepInput(0,0,target==null?p.X+100:target.X,target==null?p.Y:target.Y,hold,false);
                charged|=p.KiChargeActive;maximumCharge=Mathf.Max(maximumCharge,p.KiChargeTicks);
                int active=0;foreach(var projectile in Simulation.Projectiles)if(projectile.Active)active++;
                maximumProjectiles=Mathf.Max(maximumProjectiles,active);
                if(!impactCaptured&&impacts.Receipt.hitCount>0){impactCaptured=true;yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-ki-impact.png"));}
                if(p.KiChargeActive&&p.KiChargeTicks==120){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-ki-charge.png"));}
                if(!hold){yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-ki-release.png"));}
                yield return cadence;
            }
            File.WriteAllText(Path.Combine(output,"player-smoke.json"),JsonUtility.ToJson(new SmokeReceipt{moved=moved,initialX=before,finalX=finalX,originalMapChunks=Map.Data.chunks.Length,loadedChunks=LoadedChunks,enemyActors=Simulation.Enemies.Count,webViewUsed=false,charged=charged,released=released,maximumCharge=maximumCharge,maximumProjectiles=maximumProjectiles,kills=Simulation.Kills,totalDamage=Simulation.TotalDamage,feedbackAudio=sound.Receipt,feedbackVisual=impacts.Receipt},true));
            yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-after-combat.png"));yield return null;
            smokeActive=false;ResetRun();menu=true;Running=false;
        }
        IEnumerator HudSmoke()
        {
            Running=false;string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
            var cases=new List<HudPixelProbe>();var p=Simulation.Player;
            for(int i=0;i<3;i++){
                p.Hp=i==0?p.MaxHp:i==1?263.9f:0;p.Mana=i==0?p.MaxMana:i==1?82.9f:0;p.Stamina=i==0?p.MaxStamina:i==1?180:0;
                p.Shield=i==0?p.MaxShield:i==1?p.MaxShield/2:0;p.Poise=i==0?4:i==1?2:0;
                p.Experience=i==1?4:0;hud.Refresh(p,Simulation.TickCount,true);
                yield return new WaitForSecondsRealtime(.7f);yield return new WaitForEndOfFrame();
                string name=i==0?"full":i==1?"partial":"empty";
                ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-hud-"+name+".png"));cases.Add(hud.Probe(name));yield return null;
            }
            File.WriteAllText(Path.Combine(output,"hud-smoke.json"),JsonUtility.ToJson(new HudSmokeReceipt{scope="actual_native_player_controlled_HUD_fixture",activeSkill=hud.ActiveSkill,iconResource="Art/ui/skill_icons/kiSlash",iconDrawn=hud.IconDrawn,cases=cases.ToArray()},true));
            hudSmoke=false;ResetRun();menu=true;Running=false;
            // DBT-6: this smoke never quit (the receipt was written, then the pause menu stayed up until the caller killed the player). Unattended -batchmode runs end themselves; a windowed manual run is unchanged.
            if(Application.isBatchMode)Application.Quit(0);
        }
        void SetInventory(bool open){
            if(open&&firstPractice!=null)return;
            if(open){inventoryWasRunning=Running;Running=false;}
            inventory.SetOpen(open);if(!open){skillInputFence=true;Running=gameFocused&&inventoryWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        IEnumerator InventorySmoke(){
            string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
            SetInventory(true);int tick=Simulation.TickCount;
            int count=0;foreach(var it in inventory.State.Equipped)if(it!=null)count++;
            var receipt=new InventorySmokeReceipt{scope="actual_native_player_inventory_fixture",initialEquipped=count,initialBag=inventory.State.Bag.Count};receipt.maxMana=Simulation.Player.MaxMana;receipt.mana=Simulation.Player.Mana;
            inventory.State.Select(inventory.State.GetEquipped("weapon"));
            yield return new WaitForSecondsRealtime(.4f);receipt.paused=!Running&&tick==Simulation.TickCount;
            yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-inventory-equipment.png"));yield return null;
            var p=Simulation.Player;p.Hp=113.75f;p.Mana=47.5f;p.Stamina=61.25f;p.Shield=19.5f;
            var item=inventory.State.Bag.Find(i=>i.slot=="weapon");receipt.equipped=inventory.Equip(item,p.Level);inventory.State.Select(item);
            receipt.resourcesClamped=p.Hp==Mathf.Min(113.75f,p.MaxHp)&&p.Mana==Mathf.Min(47.5f,p.MaxMana)&&p.Stamina==Mathf.Min(61.25f,p.MaxStamina)&&p.Shield==Mathf.Min(19.5f,p.MaxShield);
            receipt.weaponAfterEquip=inventory.State.GetEquipped("weapon").name;receipt.maxHp=p.MaxHp;receipt.weaponAttack=Simulation.Config.WeaponAttack;
            yield return new WaitForSecondsRealtime(.2f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-inventory-swap.png"));yield return null;
            receipt.unequipped=inventory.Unequip("weapon");
            receipt.unarmedSpeed=Simulation.Config.WeaponSpeed;receipt.unarmedAttack=Simulation.Config.WeaponAttack;
            receipt.moved=inventory.DropAt(item,5,5)&&item._gx==4&&item._gy==4;
            receipt.edgeDrop=inventory.DropAt(item,9.9f,119.9f)&&item._gx==8&&item._gy==118;
            inventory.Sort();receipt.sorted=item._gx>=0&&item._gy>=0;
            inventory.State.Select(item);yield return new WaitForSecondsRealtime(.2f);yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,"unity-inventory-bag.png"));yield return null;
            SetInventory(false);receipt.resumed=Running;
            // Controlled fixture mutates its own run only; restore the starter and leave the menu open.
            inventorySmoke=false;ResetRun();menu=true;Running=false;
            File.WriteAllText(Path.Combine(output,"inventory-smoke.json"),JsonUtility.ToJson(receipt,true));
        }
        [Serializable] sealed class InventorySmokeReceipt{public string scope,weaponAfterEquip;public int initialEquipped,initialBag;public bool equipped,unequipped,moved,edgeDrop,sorted,resourcesClamped,paused,resumed;public float maxHp,weaponAttack,unarmedSpeed,unarmedAttack,maxMana,mana;}
        public static string Argument(string key){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:"";}
        [Serializable] sealed class SmokeReceipt{public bool moved,webViewUsed,charged,released;public float initialX,finalX,maximumCharge;public int originalMapChunks,loadedChunks,enemyActors,maximumProjectiles,kills,totalDamage;public FeedbackAudioReceipt feedbackAudio;public ImpactReceipt feedbackVisual;}
        [Serializable] sealed class HudSmokeReceipt{public string scope,activeSkill,iconResource;public bool iconDrawn;public HudPixelProbe[] cases;}
        void OnDestroy(){NativePanelTabBar.Requested-=OnPanelRequested;skillRemaster?.Dispose();contactVfx?.Dispose();kiView?.Dispose();boltView?.Dispose();impacts?.Dispose();skillView?.Dispose();sound?.Dispose();hud?.Dispose();foreach(var s in spriteCache.Values)if(s!=null)Destroy(s);spriteCache.Clear();music?.Dispose();ambient?.Dispose();if(Instance==this)Instance=null;}
        [Serializable] sealed class TextReviewLabel {public string text;public int count,priority;public long value;public float originX,originY,x,y,width,height,distance;}
        [Serializable] sealed class TextReviewShot {public string name,kind,note;public int tick,visible,deferred,stateEvents,damageEvents;public float realSeconds;public List<TextReviewLabel> labels=new List<TextReviewLabel>();}
        readonly List<TextReviewShot> textReviewShots=new List<TextReviewShot>();float textReviewStart;
        IEnumerator TextReviewShotSave(string output,string name,string kind,string note){
            yield return new WaitForEndOfFrame();
            var r=new TextReviewShot{name=name,kind=kind,note=note,tick=Simulation.TickCount,realSeconds=Time.unscaledTime-textReviewStart,stateEvents=revive.SourceEvents,damageEvents=damageFloaters.InputEvents};
            foreach(var q in floatingTextLayout.Requests){var b=q.Box;if(b.Width>0)r.visible++;else r.deferred++;r.labels.Add(new TextReviewLabel{text=q.Notice.DisplayText,count=q.Notice.Count,priority=q.Notice.Priority,value=q.Notice.Value,originX=q.X,originY=q.Y,x=b.X,y=b.Y,width=b.Width,height=b.Height,distance=b.Width>0?Vector2.Distance(new Vector2(q.X,q.Y),new Vector2(b.X+b.Width/2,b.Y+b.Height/2)):0});}
            textReviewShots.Add(r);ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;
            File.WriteAllText(Path.Combine(output,name+".json"),JsonUtility.ToJson(r,true));
        }
        // 이번 문자 재작업의 선택 실행 QA. 일반 실행/M1에는 들어가지 않는다.
        IEnumerator BossTextLocalityCapture(){
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))||!NativeReviewArgs.BossDirect){Debug.LogError("문자 QA는 명시적 출력·격리저장·boss-direct 인자가 필요");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;smokeActive=true;pauseSmoke=true;
            lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest()){Application.Quit(2);yield break;}menu=false;Running=false;frontendEntryInputFence=false;EndFirstPractice(true);BossDirectEnter();
            Screen.SetResolution(1600,900,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
            var sim=Simulation;var p=sim.Player;int entry=0;
            while((!sim.Stage.InArena||sim.Stage.LoadPhase!=0)&&entry++<900){StepInput(0,0,p.X+100,p.Y,false,false);yield return null;}
            var boss=sim.Stage.FindBoss();if(boss==null){Debug.LogError("문자 QA 아레나 진입 실패");Application.Quit(2);yield break;}
            p.X=boss.X+260;p.Y=boss.Y;sim.Config.EnemyAiEnabled=true;damage.Clear();damageFloaters.Clear();revive.Reset();textReviewStart=Time.unscaledTime;
            bool low=false,medium=false;var cadence=new WaitForFixedUpdate();
            for(int tick=0;tick<1500;tick++){
                p.Hp=p.MaxHp;p.Shield=p.MaxShield; // 관찰용 생존 보조. 피해 이벤트/AI/수치 규칙은 실제 경로.
                StepInput(0,0,boss.X,boss.Y,tick%150<100,false);yield return cadence;
                int count=0;foreach(var q in floatingTextLayout.Requests)if(q.Box.Width>0)count++;
                if(!low&&tick>90&&count>=1&&count<=2){low=true;yield return TextReviewShotSave(output,"natural-low","실제 AI·실시간 입력 저밀도","직접 보스 진입·매틱 생존자원 보조. 문자 직접주입0, 약60틱/초의 StepInput 공격 입력");}
                if(!medium&&tick>180&&count>=3){medium=true;yield return TextReviewShotSave(output,"natural-medium","실제 AI·실시간 입력 중밀도","문자 직접주입0. 실제 사건이 3개 이상 함께 표시된 프레임");}
                if(low&&medium&&tick>360)break;
            }
            if(!medium)yield return TextReviewShotSave(output,"natural-observed","실제 AI·관측 밀도","중밀도3개 동시표시 조건이 관측되지 않음. 이 장면을 중밀도 PASS로 세지 않음");
            sim.Config.EnemyAiEnabled=false;damage.Clear();damageFloaters.Clear();revive.Reset();
            float bx=boss.X,by=boss.Y;
            for(int i=0;i<40;i++)damage.Add(new DamageText{x=bx,y=by,amount=12,until=Time.unscaledTime+1});
            string[] words={"휘두르기!","충격파!","강타!","잡기!","돌진!","맹독!","기포 폭풍!","지속 피해!","연속 베기!","독안개!"};
            foreach(var word in words)revive.Add(new ReviveText{X=bx,Y=by,Ko=word,En=word,Color="#44aaff",Life=60});
            revive.Add(new ReviveText{X=bx,Y=by,Ko="Q!",En="Q!",Color="#44ff44",Life=60});revive.Add(new ReviveText{X=bx,Y=by,Ko="쉴드 파괴!",En="Shield Break!",Color="#4488ff",Life=60});
            yield return null;yield return TextReviewShotSave(output,"synthetic-high","별도 합성 고밀도","피해12×40=480 + 서로다른 예고10 + Q/쉴드파괴2 직접주입. 자연플레이 아님");
            for(int i=0;i<12;i++){StepInput(1,0,boss.X,boss.Y,false,false);yield return cadence;}
            yield return TextReviewShotSave(output,"synthetic-moving","합성 사건·실제 이동 입력","12틱 오른쪽 이동으로 카메라/사건 앵커가 이동. 전역 재배치 떨림·몸 가림 확인");
            File.WriteAllText(Path.Combine(output,"text-review.json"),JsonUtility.ToJson(new TextReviewSummary{naturalLow=low,naturalMedium=medium,shots=textReviewShots},true));
            yield return new WaitForSecondsRealtime(.4f);Application.Quit(low&&medium?0:3);
        }
        [Serializable] sealed class TextReviewSummary {public string scope="보스 문자 근거리 표시 QA, 손 조작/자연 입장 종단검수 아님";public bool naturalLow,naturalMedium;public List<TextReviewShot> shots;}

    }
}
