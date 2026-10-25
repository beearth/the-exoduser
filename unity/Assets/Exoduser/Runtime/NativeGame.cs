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
        Camera view; SpriteRenderer playerView; Font font; KiSlashView kiView;
        KiImpactView impacts; NativeFeedbackAudio sound; bool smokeActive;
        NativeHud hud;bool hudSmoke;NativeInventory inventory;bool inventorySmoke,inventoryWasRunning;
        NativePauseMenu pauseMenu;NativeSettingsState settings;NativeSkills skills;bool skillsWasRunning,skillInputFence;
        NativeLobby lobby;bool lobbySmoke,lobbyControlsSmoke;int worldMask;
        bool basicWeaponMode;
        readonly Dictionary<string,Sprite> spriteCache=new Dictionary<string,Sprite>();
        readonly Dictionary<int,ChunkView> chunks=new Dictionary<int,ChunkView>();
        readonly Dictionary<int,EnemyView> enemies=new Dictionary<int,EnemyView>();
        readonly List<SpriteRenderer> props=new List<SpriteRenderer>();
        readonly List<DamageText> damage=new List<DamageText>();
        readonly string[] directions={"south","south-east","east","north-east","north","north-west","west","south-west"};
        readonly string[] enemyDirections={"east","south_east","south","south_west","west","north_west","north","north_east"};
        float walkDistance,lastX,lastY;int renderedTick=-1;bool playerMoving;
        bool menu=true; string notice=""; float noticeUntil; int lastKillCount;
        GUIStyle label,small,title,center,button,characterBadge; bool guiReady;
        public static NativeGame Instance {get;private set;}
        sealed class ChunkView {public SpriteRenderer renderer;public string path;}
        sealed class EnemyView {public SpriteRenderer body,walk;public float distance,lastX,lastY;public int skin,hp;public float shield;public bool moving;}
        sealed class DamageText {public float x,y,until;public int amount;}

        void Awake()
        {
            Instance=this;basicWeaponMode=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-basic-weapon")>=0;Application.targetFrameRate=120;Time.fixedDeltaTime=1f/60f;
            view=Camera.main;
            if(view==null){view=new GameObject("World Camera").AddComponent<Camera>();view.tag="MainCamera";}
            view.orthographic=true;view.orthographicSize=5.4f;view.backgroundColor=new Color(.015f,.02f,.018f);view.clearFlags=CameraClearFlags.SolidColor;
            view.transform.position=new Vector3(40.2f,-74.2f,-10);
            var resource=Resources.Load<TextAsset>("Data/ch1_map");if(resource==null)throw new InvalidOperationException("Original map resource is missing");
            Map=new SourceMap(JsonUtility.FromJson<MapData>(resource.text));
            font=Resources.Load<Font>("Art/fonts/NotoSansKR");
            hud=new NativeHud();skills=new NativeSkills();hud.SlotSelected=slot=>{if(!menu&&Simulation.Player.Hp>0)SetSkills(true,slot);};
            inventory=new NativeInventory(()=>{Simulation.ApplyEquipment(inventory.State);hud.Refresh(Simulation.Player,Simulation.TickCount,true);});
            BuildProps();
            var kiSheet=Resources.Load<Texture2D>("Art/vfx/ki_slash_silver_sheet");
            if(kiSheet==null||kiSheet.width%3!=0||kiSheet.height%3!=0)throw new InvalidOperationException("Invalid original kiSlash 3x3 sheet");
            kiView=new KiSlashView(transform,f=>SpriteFor("Art/vfx/ki_slash_silver_sheet",f%3*(kiSheet.width/3),f/3*(kiSheet.height/3),kiSheet.width/3,kiSheet.height/3,new Vector2(.5f,.5f)));
            var hitSheet=Resources.Load<Texture2D>("Art/vfx/ki_slash_hit_silver_sheet");
            if(hitSheet==null||hitSheet.width!=1254||hitSheet.height!=1254)throw new InvalidOperationException("Invalid original kiSlash 2x2 hit sheet");
            impacts=new KiImpactView(transform,f=>SpriteFor("Art/vfx/ki_slash_hit_silver_sheet",f%2*627,f/2*627,627,627,new Vector2(.5f,.5f)));
            sound=new NativeFeedbackAudio(transform,view);
            ResetRun();
            worldMask=view.cullingMask;lobby=gameObject.AddComponent<NativeLobby>();
            lobby.Initialize(()=>{ResetRun();skillInputFence=true;pauseMenu.Reset();menu=false;Running=true;});
            settings=new NativeSettingsState(120);
            pauseMenu=new NativePauseMenu(Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??font,settings,
                SetSfxPercent,SetBgmPercent,SetFrameCap,
                value=>Screen.fullScreenMode=value?FullScreenMode.FullScreenWindow:FullScreenMode.Windowed);
            var args=Environment.GetCommandLineArgs();
            bool legacyFixture=Array.IndexOf(args,"--unity-inventory-keys-smoke")>=0||Array.IndexOf(args,"--unity-pause-smoke")>=0||Array.IndexOf(args,"--unity-character-story-smoke")>=0||Array.IndexOf(args,"--unity-character-store-smoke")>=0||Array.IndexOf(args,"--unity-character-smoke")>=0||Array.IndexOf(args,"--unity-skill-smoke")>=0||Array.IndexOf(args,"--unity-ui-smoke")>=0||Array.IndexOf(args,"--unity-inventory-smoke")>=0||Array.IndexOf(args,"--unity-hud-smoke")>=0||Array.IndexOf(args,"--unity-smoke")>=0;
            if(!legacyFixture){Running=false;lobby.Begin();}
            if(Array.IndexOf(args,"--unity-inventory-keys-smoke")>=0){inventoryKeysSmoke=true;traceInventoryKeys=true;pauseSmoke=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();StartCoroutine(InventoryKeysSmoke());}
            else if(Array.IndexOf(args,"--unity-pause-smoke")>=0){pauseSmoke=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();menu=true;Running=false;pauseMenu.Reset();StartCoroutine(PauseSmoke());}
            else if(Array.IndexOf(args,"--unity-character-story-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterStorySmoke());}
            else if(Array.IndexOf(args,"--unity-character-store-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterStoreSmoke());}
            else if(Array.IndexOf(args,"--unity-character-smoke")>=0){menu=true;Running=false;lobbySmoke=true;lobby.AutomatedInput=true;lobby.ShowLobby();StartCoroutine(CharacterSmoke());}
            else if(Array.IndexOf(args,"--unity-skill-smoke")>=0){menu=false;Running=false;StartCoroutine(SkillSmoke());}
            else if(Array.IndexOf(args,"--unity-ui-smoke")>=0){menu=true;Running=false;StartCoroutine(UiSmoke());}
            else if(Array.IndexOf(args,"--unity-lobby-controls-smoke")>=0){lobbySmoke=true;lobbyControlsSmoke=true;lobby.AutomatedInput=true;StartCoroutine(LobbyControlsSmoke());}
            else if(Array.IndexOf(args,"--unity-lobby-smoke")>=0){lobbySmoke=true;lobby.AutomatedInput=true;StartCoroutine(LobbySmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-inventory-smoke")>=0){inventorySmoke=true;menu=false;Running=true;StartCoroutine(InventorySmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-hud-smoke")>=0){hudSmoke=true;menu=false;StartCoroutine(HudSmoke());}
            else if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-smoke")>=0){menu=false;Running=true;StartCoroutine(Smoke());}
        }
        public void ResetRun()
        {
            foreach(var e in enemies.Values){Destroy(e.body.gameObject);Destroy(e.walk.gameObject);}enemies.Clear();damage.Clear();
            kiView?.Reset();impacts?.Reset();sound?.Reset();
            var config=basicWeaponMode?SourceStarterFixture.CreateBasicWeapon():SourceStarterFixture.CreateKiSlash();config.StartX=Map.Data.startX;config.StartY=Map.Data.startY;
            Simulation=new Simulation(config,SourceStarterFixture.Seed);Simulation.Materials=1000;Simulation.CanMove=Map.CanMove;Simulation.HasLineOfSight=Map.LineOfSight;Simulation.IsProjectileWall=Map.Blocked;
            inventory.Reset();skills.SetOpen(false);skillInputFence=false;Simulation.ApplyEquipment(inventory.State);
            Simulation.IsLootOnScreen=l=>{var p=view.WorldToViewportPoint(Point(l.X,l.Y));return p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1;};
            // World drop item factory and persistent saves remain unimplemented.
            // Therefore TryCollectLoot remains absent: R cannot fabricate an item.
            if(playerView==null)playerView=CreateRenderer("Player");
            lastX=config.StartX;lastY=config.StartY;walkDistance=0;lastKillCount=0;renderedTick=-1;playerMoving=false;
            hud.Refresh(Simulation.Player,Simulation.TickCount,true);
            // Source63425-63432: original five ordinary0 enemies on580px ring.
            for(int i=0;i<5;i++)
            {
                double a=Math.PI*2*i/5-Math.PI/2;
                float x=config.StartX+(float)Math.Cos(a)*580,y=config.StartY+(float)Math.Sin(a)*580;
                if(SafePoint(ref x,ref y,10))Simulation.SpawnNormalEnemy(x,y);
            }
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
            lobby.AutomatedInput=lobbySmoke;
            if(lobbySmoke&&!lobbyControlsSmoke)lobby.SetPlaybackFocus(true); // Natural-playback fixture only; controls fixture owns focus transitions.
            if(lobby!=null&&lobby.IsBlocking){Running=false;view.cullingMask=0;return;}
            view.cullingMask=worldMask;
            if(traceInventoryKeys)TraceInventoryKeys();
            if(!gameFocused){Running=false;return;}
            if(menu||Simulation.Player.Hp<=0){
                if(!pauseSmoke)ApplyPauseCommand(pauseMenu.PollKeys(Simulation.Player.Hp<=0,Screen.fullScreen));
                UpdateViews();return;
            }
            if(inventory.Open){if(!inventoryKeysSmoke&&inventory.PollKeys(Simulation.Player.Level))SetInventory(false);UpdateViews();return;}
            if(skillInputFence&&!Input.GetMouseButton(0))skillInputFence=false;
            if(Input.GetKeyDown(KeyCode.Escape)){
                if(skills.Open){SetSkills(false);return;}
                if(inventory.Open)SetInventory(false);
                else {menu=true;pauseMenu.Reset();Running=false;}
                return;
            }
            if(skills.Open){skills.HandleKeys(()=>SetSkills(false),EquipSelectedSkill);return;}
            if(!menu&&!inventory.Open&&Simulation.Player.Hp>0&&Input.GetKeyDown(KeyCode.K)){SetSkills(true);return;}
            if(!menu&&Simulation.Player.Hp>0&&Input.GetKeyDown(KeyCode.Tab))SetInventory(!inventory.Open);
            if(!menu&&!inventory.Open&&Input.GetKeyDown(KeyCode.R))Toast("드랍 아이템 생성 이식 대기");
            if(!menu&&!inventory.Open&&(Input.GetKeyDown(KeyCode.Q)||Input.GetKeyDown(KeyCode.E)))Toast("패링·방패 기능은 아직 사용할 수 없습니다");
            UpdateViews();
            if(smokeActive)sound?.Probe();
        }
        void FixedUpdate()
        {
            if(!Running||!gameFocused||Simulation==null||lobby!=null&&lobby.IsBlocking)return;
            var p=Simulation.Player;var aim=view.ScreenToWorldPoint(Input.mousePosition);
            float x=(Input.GetKey(KeyCode.D)?1:0)-(Input.GetKey(KeyCode.A)?1:0);
            float y=(Input.GetKey(KeyCode.S)?1:0)-(Input.GetKey(KeyCode.W)?1:0);
            Simulation.Tick(x,y,aim.x*100,-aim.y*100,SkillUiState.AttackHeld(Input.GetMouseButton(0),skillInputFence,NativeHud.PointerOverSlots(Input.mousePosition),p.KiChargeActive),Input.GetKey(KeyCode.R));
            DispatchFeedback();
            if(p.Hp<=0){Running=false;Toast("쓰러졌습니다");}
            if(Simulation.Kills>lastKillCount){lastKillCount=Simulation.Kills;Toast("처치 · 악의 +4");}
        }
        public void StepInput(float x,float y,float aimX,float aimY,bool attack,bool pickup)
        {Simulation.Tick(x,y,aimX,aimY,attack,pickup);DispatchFeedback();UpdateViews();}
        void DispatchFeedback()
        {
            while(Simulation.Feedback.Count>0){var e=Simulation.Feedback.Dequeue();impacts.Handle(e);sound.Handle(e);}
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
            if(Simulation==null||view==null)return;var p=Simulation.Player;
            view.transform.position=new Vector3(p.X/100,-p.Y/100,-10);StreamChunks(p.X,p.Y);
            bool newTick=renderedTick!=Simulation.TickCount;
            if(newTick){float dx=p.X-lastX,dy=p.Y-lastY;walkDistance+=Mathf.Sqrt(dx*dx+dy*dy);lastX=p.X;lastY=p.Y;playerMoving=dx*dx+dy*dy>.001f;}
            int direction=((int)Math.Floor((Math.PI/2-p.Facing)/(Math.PI/4)+.5)%8+8)%8;
            bool attack=p.State=="wSwing"||p.KiChargeActive;bool moving=playerMoving;
            int frame=p.KiChargeActive?0:attack?Mathf.Clamp((int)(p.SwingProgress*9),0,8):moving?2+(int)(walkDistance/32)%8:(Simulation.TickCount/48)%2;
            playerView.sprite=attack?SpriteFor("Art/player/attack-bat-v1",frame*80,direction*80,80,80,new Vector2(.5f,45f/80)):
                SpriteFor("Art/player/"+directions[direction],frame*48,0,48,48,new Vector2(.5f,.5f));
            playerView.transform.position=Point(p.X,p.Y);playerView.transform.localScale=Vector3.one*2;playerView.sortingOrder=(int)p.Y;
            foreach(var e in Simulation.Enemies)
            {
                if(!enemies.TryGetValue(e.Id,out var ev)){
                    int idx=((int)(e.X*31)&0x7fffffff)%40;
                    ev=new EnemyView{body=CreateRenderer("Enemy "+e.Id),walk=CreateRenderer("Enemy walk "+e.Id),skin=idx,lastX=e.X,lastY=e.Y,hp=e.Hp,shield=e.Shield};enemies.Add(e.Id,ev);
                }
                ev.body.enabled=e.Alive;ev.walk.enabled=e.Alive;if(!e.Alive)continue;
                int dealt=Mathf.RoundToInt((ev.hp-e.Hp)+(ev.shield-e.Shield));if(dealt>0)damage.Add(new DamageText{x=e.X,y=e.Y,amount=dealt,until=Time.unscaledTime+1});ev.hp=e.Hp;ev.shield=e.Shield;
                if(newTick){float ex=e.X-ev.lastX,ey=e.Y-ev.lastY;float travel=Mathf.Sqrt(ex*ex+ey*ey);ev.distance+=travel;ev.lastX=e.X;ev.lastY=e.Y;ev.moving=travel>.001f;}
                int dir=((int)Math.Floor(e.Facing/(Math.PI/4)+.5)%8+8)%8,cellX=ev.skin%8,cellY=ev.skin/8;
                ev.body.sprite=SpriteFor("Art/enemy/atlas_ch1_8dir_"+enemyDirections[dir],cellX*256,cellY*256,256,256,new Vector2(.5f,.5f));
                ev.walk.sprite=SpriteFor("Art/enemy/atlas_ch1_8dir_walk_"+enemyDirections[dir],cellX*1024+((int)(ev.distance/128)%4)*256,cellY*256,256,256,new Vector2(.5f,.5f));
                float size=e.Radius*7/256;ev.body.transform.position=ev.walk.transform.position=Point(e.X,e.Y);ev.body.transform.localScale=ev.walk.transform.localScale=Vector3.one*size;
                ev.body.sortingOrder=(int)e.Y;ev.walk.sortingOrder=(int)e.Y+1;ev.walk.enabled=e.Alive&&ev.moving;
                ev.body.color=ev.walk.color=e.HurtTicks>0?new Color(1,.62f,.62f):Color.white;
            }
            kiView?.Update(Simulation);
            impacts?.Update(Simulation.TickCount);
            hud?.Refresh(p,Simulation.TickCount);
            renderedTick=Simulation.TickCount;damage.RemoveAll(d=>Time.unscaledTime>d.until);
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
        static Vector3 Point(float x,float y){return new Vector3(x/100,-y/100,0);}
        void Toast(string text){notice=text;noticeUntil=Time.unscaledTime+3;}
        void InitGUI()
        {
            if(guiReady)return;guiReady=true;
            label=new GUIStyle(GUI.skin.label){font=font,fontSize=20};label.normal.textColor=new Color(.88f,.85f,.76f);
            small=new GUIStyle(label){fontSize=16};title=new GUIStyle(label){fontSize=32};center=new GUIStyle(label){alignment=TextAnchor.MiddleCenter};
            button=new GUIStyle(GUI.skin.button){font=font,fontSize=22};
            characterBadge=new GUIStyle(label){font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??font};
        }
        void OnGUI()
        {
            if(Simulation==null||lobby!=null&&lobby.IsBlocking)return;
            if(skills.Open){skills.Draw(Simulation,()=>SetSkills(false),EquipSelectedSkill);return;}
            if(inventory.Open){inventory.Draw(Simulation.Player.Level,Simulation.Player,()=>SetInventory(false));return;}
            InitGUI();var old=GUI.matrix;GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,new Vector3(Screen.width/1920f,Screen.height/1080f,1));
            var p=Simulation.Player;
            var baseMatrix=GUI.matrix;float hudScale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,Vector3.one*hudScale);
            float hudWidth=Screen.width/hudScale,statusX=hudWidth-316;
            if(lobby.ActiveCharacterName.Length>0){Panel(new Rect(16,12,420,50));GUI.Label(new Rect(28,20,396,40),lobby.ActiveCharacterName+" · "+(lobby.Language=="ko"?"미리보기":"Preview"),characterBadge);}
            Panel(new Rect(statusX,0,316,124));GUI.Label(new Rect(statusX+20,12,276,32),"1장 · 썩은 숲",label);
            GUI.Label(new Rect(statusX+20,47,276,30),"Lv."+p.Level+"   경험치 "+p.Experience+" / "+p.MaxExperience,small);
            GUI.Label(new Rect(statusX+20,77,276,30),"처치 "+Simulation.Kills+"   악의 "+Simulation.Materials,small);
            hud.Draw(hudWidth,Screen.height/hudScale,Simulation.Config.ActiveAttack,Simulation);GUI.matrix=baseMatrix;
            foreach(var e in Simulation.Enemies){if(!e.Alive||e.HurtTicks<=0)continue;var pt=ToGUI(e.X,e.Y);Fill(new Rect(pt.x-42,pt.y-85,84,6),new Color(.12f,.08f,.07f));Fill(new Rect(pt.x-42,pt.y-85,84*Mathf.Clamp01((float)e.Hp/e.MaxHp),6),new Color(.66f,.12f,.08f));if(e.Shield>0)Fill(new Rect(pt.x-42,pt.y-93,84*e.Shield/e.MaxShield,4),new Color(.2f,.55f,.8f));}
            foreach(var d in damage){var pt=ToGUI(d.x,d.y);GUI.Label(new Rect(pt.x-60,pt.y-100-(1-(d.until-Time.unscaledTime))*30,120,40),d.amount.ToString(),center);}
            int pending=0;foreach(var loot in Simulation.Loot)if(!loot.Picked)pending++;if(pending>0)GUI.Label(new Rect(42,135,600,30),"장비 드랍 생성 대기 "+pending,small);
            if(Time.unscaledTime<noticeUntil)GUI.Label(new Rect(560,180,800,45),notice,center);
            if((menu||p.Hp<=0)&&!hudSmoke&&!inventorySmoke){
                pauseMenu.English=lobby.Language!="ko";
                ApplyPauseCommand(pauseMenu.Draw(p.Hp<=0,Screen.fullScreen));
            }
            GUI.matrix=old;
        }
        void SetSkills(bool open,int slot=6){
            if(open){skillsWasRunning=Running;Running=false;}
            skills.SetOpen(open,slot);
            if(!open){skillInputFence=true;Running=skillsWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        void EquipSelectedSkill(){if(SkillUiState.TryEquipKiSlash(Simulation,skills.SelectedSlot))basicWeaponMode=false;}
        void SetSfxPercent(int percent){settings.SetSfxPercent(percent);sound.SetVolumePercent(settings.SfxPercent);}
        void SetBgmPercent(int percent){settings.SetBgmPercent(percent);lobby.SetBgmPercent(settings.BgmPercent);}
        void SetFrameCap(int cap){if(settings.TrySetFrameCap(cap))ApplyFrameCap(cap);}
        void ApplyFrameCap(int cap){QualitySettings.vSyncCount=0;Application.targetFrameRate=cap==0?-1:cap;}
        void ApplyPauseCommand(PauseMenuCommand command){
            switch(command){
                case PauseMenuCommand.Resume: if(gameFocused&&Simulation.Player.Hp>0){menu=false;skillInputFence=true;Running=true;} break;
                case PauseMenuCommand.Restart:if(gameFocused){ResetRun();skillInputFence=true;menu=false;Running=true;}break;
                case PauseMenuCommand.ReturnLobby:Running=false;menu=true;sound.Reset();pauseMenu.Reset();lobby.ShowLobby();break;
                case PauseMenuCommand.Quit:if(gameFocused)Application.Quit();break;
            }
        }
        Vector2 ToGUI(float x,float y){var v=view.WorldToViewportPoint(Point(x,y));return new Vector2(v.x*1920,(1-v.y)*1080);}
        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        static void Panel(Rect r){Fill(r,new Color(.025f,.032f,.027f,.94f));Fill(new Rect(r.x,r.y,r.width,1),new Color(.49f,.4f,.24f));Fill(new Rect(r.x,r.y+r.height-1,r.width,1),new Color(.28f,.24f,.16f));}
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
        }
        void SetInventory(bool open){
            if(open){inventoryWasRunning=Running;Running=false;}
            inventory.SetOpen(open);if(!open){skillInputFence=true;Running=gameFocused&&inventoryWasRunning&&!menu&&Simulation.Player.Hp>0;}
        }
        IEnumerator InventorySmoke(){
            string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
            SetInventory(true);int tick=Simulation.TickCount;
            int count=0;foreach(var it in inventory.State.Equipped)if(it!=null)count++;
            var receipt=new InventorySmokeReceipt{scope="actual_native_player_inventory_fixture",initialEquipped=count,initialBag=inventory.State.Bag.Count};
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
        [Serializable] sealed class InventorySmokeReceipt{public string scope,weaponAfterEquip;public int initialEquipped,initialBag;public bool equipped,unequipped,moved,edgeDrop,sorted,resourcesClamped,paused,resumed;public float maxHp,weaponAttack,unarmedSpeed,unarmedAttack;}
        public static string Argument(string key){var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:"";}
        [Serializable] sealed class SmokeReceipt{public bool moved,webViewUsed,charged,released;public float initialX,finalX,maximumCharge;public int originalMapChunks,loadedChunks,enemyActors,maximumProjectiles,kills,totalDamage;public FeedbackAudioReceipt feedbackAudio;public ImpactReceipt feedbackVisual;}
        [Serializable] sealed class HudSmokeReceipt{public string scope,activeSkill,iconResource;public bool iconDrawn;public HudPixelProbe[] cases;}
        void OnDestroy(){kiView?.Dispose();impacts?.Dispose();sound?.Dispose();hud?.Dispose();foreach(var s in spriteCache.Values)if(s!=null)Destroy(s);spriteCache.Clear();if(Instance==this)Instance=null;}
    }
}
