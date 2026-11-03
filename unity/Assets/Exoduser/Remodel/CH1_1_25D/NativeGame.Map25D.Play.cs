using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        readonly Dictionary<Renderer,bool> map25DOriginalRenderers=new Dictionary<Renderer,bool>();
        readonly Dictionary<Behaviour,bool> map25DOriginalBehaviours=new Dictionary<Behaviour,bool>();
        readonly Dictionary<Terrain,bool> map25DOriginalTerrain=new Dictionary<Terrain,bool>();
        Terrain map25DOriginalGround;bool map25DOriginalForestA2,map25DPresentationOn;Light map25DHeroLight;
        void RememberMap25DOriginalState()
        {
            map25DOriginalGround=NativeRemodel3D.Ground;map25DOriginalForestA2=NativeRemodel3D.ForestA2;
            foreach(var root in r3Roots){foreach(var r in root.GetComponentsInChildren<Renderer>(true))map25DOriginalRenderers[r]=r.enabled;foreach(var l in root.GetComponentsInChildren<Light>(true))map25DOriginalBehaviours[l]=l.enabled;foreach(var v in root.GetComponentsInChildren<Volume>(true))map25DOriginalBehaviours[v]=v.enabled;foreach(var t in root.GetComponentsInChildren<Terrain>(true))map25DOriginalTerrain[t]=t.drawHeightmap;}
        }
        bool Map25DWantsField {get{return Simulation!=null&&Simulation.Config.StageIndex==0&&!Simulation.Stage.InArena&&firstPractice==null&&lobby!=null&&!lobby.IsBlocking;}}
        IEnumerator Map25DPlayableLoop()
        {
            // No deadline in human play: field loading starts only after the lobby.
            while(true){bool want=Map25DWantsField&&r3Loaded;
                if(want&&map25D==null)Map25DCreateWorld();
                if(map25D!=null&&want!=map25DPresentationOn)Map25DSetPresentation(want);
                yield return null;
            }
        }
        void Map25DSetPresentation(bool on)
        {
            map25DPresentationOn=on;map25D.SetPresentationActive(on);map25D.gameObject.SetActive(on);
            foreach(var pair in map25DOriginalRenderers)if(pair.Key!=null)pair.Key.enabled=on?false:pair.Value;
            foreach(var pair in map25DOriginalBehaviours)if(pair.Key!=null)pair.Key.enabled=on?false:pair.Value;
            foreach(var pair in map25DOriginalTerrain)if(pair.Key!=null)pair.Key.drawHeightmap=on?false:pair.Value;
            NativeRemodel3D.Ground=on?map25D.HeightSurface:map25DOriginalGround;
            // Merged A2 supplies an analytic height before Ground. Greybox owns
            // only its visual height selection; the Core map stays unchanged.
            if(GrayboxRequested)NativeRemodel3D.ForestA2=on?false:map25DOriginalForestA2;
            if(r4PixelActors!=null)r4PixelActors.SetDrawing(on);if(map25DHeroLight!=null)map25DHeroLight.enabled=on;
            Debug.Log("[Map25D] field presentation "+on+" stage="+Simulation.Config.StageIndex+" arena="+Simulation.Stage.InArena);
        }

        [Serializable] sealed class Map25DPlayStep {public string id,lobby,practice,note;public Vector2 player;public float seconds,fps;public int simulationTick,instances;public bool fieldActive;}
        [Serializable] sealed class Map25DPlayReceipt {
            public string scope="Actual product title keys and character/entry callbacks, InputSystem keys for startup, original Core walking through StepInput. No coordinate assignments. Tutorial skip uses the product callback. Walking fixture refreshes invulnerability; not a combat balance or OS hand-play test.";
            public bool passed,arrived,noTeleport=true,settingsHumanArgsAllowed;public int errors,ticks,blockedTicks,resets;public float walkedPixels,seconds,campFps,campP50Ms,campP95Ms;public string sandbox;public List<Map25DPlayStep> steps=new List<Map25DPlayStep>();public List<string> failures=new List<string>();public List<string> notes=new List<string>();
        }
        Map25DPlayReceipt map25DPlayReceipt;string map25DPlayOutput;float map25DPlayStart;
        void Map25DPlayLog(string message,string stack,LogType type){if(type==LogType.Error||type==LogType.Exception||type==LogType.Assert){map25DPlayReceipt.errors++;map25DPlayReceipt.failures.Add(message);}}
        IEnumerator Map25DPlayShot(string id,string note="")
        {
            for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();SaveMap25DScreen(Path.Combine(map25DPlayOutput,id+".png"));if(r4PixelActors!=null)r4PixelActors.WriteReceipt(Path.Combine(map25DPlayOutput,id+"-pixel-actors.json"));if((id=="07-camp-arrival"||id=="05-field-entry")&&r4PixelActors!=null){Shader.SetGlobalFloat("_R4ActorGrid",1);for(int k=0;k<3;k++)yield return null;yield return new WaitForEndOfFrame();SaveMap25DScreen(Path.Combine(map25DPlayOutput,id+"-pixel-grid.png"));Shader.SetGlobalFloat("_R4ActorGrid",0);for(int k=0;k<3;k++)yield return null;}
            map25DPlayReceipt.steps.Add(new Map25DPlayStep{id=id,lobby=lobby.StageName,practice=FirstPracticeStage,note=note,player=new Vector2(Simulation.Player.X,Simulation.Player.Y),seconds=Time.realtimeSinceStartup-map25DPlayStart,simulationTick=Simulation.TickCount,instances=FindObjectsByType<Map25DEnvironment>(FindObjectsInactive.Include).Length,fieldActive=map25DPresentationOn,fps=1/Mathf.Max(.0001f,Time.unscaledDeltaTime)});Map25DWritePlay();
        }
        // Mac review players cannot resize after launch; -screen-width/-screen-height then sets the capture size for the whole run.
        const string Map25DWorldOnlyNote="Captures are world-only RenderTexture renders (batchmode); OnGUI HUD not in images";
        static bool Map25DLaunchSizeFixed=>!string.IsNullOrEmpty(Argument("-screen-width"))&&!string.IsNullOrEmpty(Argument("-screen-height"));
        void Map25DWritePlay(){if(Map25DCaptureWorldOnly&&!map25DPlayReceipt.notes.Contains(Map25DWorldOnlyNote))map25DPlayReceipt.notes.Add(Map25DWorldOnlyNote);File.WriteAllText(Path.Combine(map25DPlayOutput,"play-smoke.json"),JsonUtility.ToJson(map25DPlayReceipt,true));}
        IEnumerator Map25DInputKey(Key key)
        {
            var keyboard=Keyboard.current;if(keyboard==null)keyboard=InputSystem.AddDevice<Keyboard>();
            InputSystem.QueueStateEvent(keyboard,new KeyboardState(key));yield return null;yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());yield return null;yield return null;
        }
        IEnumerator Map25DHoldStorySkip(){var keyboard=Keyboard.current;if(keyboard==null)keyboard=InputSystem.AddDevice<Keyboard>();InputSystem.QueueStateEvent(keyboard,new KeyboardState());for(int i=0;i<4;i++)yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState(Key.Escape));float end=Time.realtimeSinceStartup+6;while(lobby.CharacterStoryActive&&Time.realtimeSinceStartup<end)yield return null;InputSystem.QueueStateEvent(keyboard,new KeyboardState());for(int i=0;i<4;i++)yield return null;}
        IEnumerator Map25DWaitTransition()
        {
            float until=Time.realtimeSinceStartup+25;
            while(NativeScreenTransition.Busy&&Time.realtimeSinceStartup<until)yield return null;
            if(NativeScreenTransition.Busy)map25DPlayReceipt.failures.Add("Product screen transition did not finish");
            for(int i=0;i<3;i++)yield return null;
        }
        IEnumerator Map25DPlaySmoke()
        {
            map25DPlayOutput=Argument("-output");if(string.IsNullOrEmpty(map25DPlayOutput)||!Path.IsPathRooted(map25DPlayOutput)){Application.Quit(2);yield break;}
            Directory.CreateDirectory(map25DPlayOutput);if(GrayboxRequested&&!Map25DLaunchSizeFixed)Screen.SetResolution(1920,1080,FullScreenMode.Windowed);map25DPlayStart=Time.realtimeSinceStartup;map25DPlayReceipt=new Map25DPlayReceipt{sandbox=NativeQaSandbox.Root};Application.logMessageReceived+=Map25DPlayLog;
            Application.runInBackground=true;smokeActive=true;pauseSmoke=true;dropSmoke=true;lobbySmoke=true;introKeysSmoke=true;lobby.AutomatedInput=false;SetGameFocus(true);lobby.SetPlaybackFocus(true);
            string[] human={"--remodel3d","--unity-keyshot-baseline","--unity-map25d",Map25DHumanSave.Flag,"I:/EXODUSER-Storage/map25d/play-sandbox"};map25DPlayReceipt.settingsHumanArgsAllowed=!QaRunPolicy.IsAutomated(human,false);
            // Leave the actual title open beyond the old fatal deadline. No ShowLobby shortcut.
            yield return Map25DPlayShot("00-startup");
            while(Time.realtimeSinceStartup-map25DPlayStart<65)yield return null;
            yield return Map25DPlayShot("01-alive-after-65s","Regression: ordinary lobby wait survives the old 60-second limit");
            float limit=Time.realtimeSinceStartup+100,lastKey=-10;string previous="";
            while(lobby.Flow.Page!=LobbyPage.Lobby&&Time.realtimeSinceStartup<limit){
                string stage=lobby.StageName;if(stage!=previous){previous=stage;yield return Map25DPlayShot("02-"+stage);}
                if(Time.realtimeSinceStartup-lastKey>.8f){if(stage=="FDG"||stage=="SplashTitle"||stage=="Title")LobbyKeys.Press(KeyCode.Return);else if(stage=="WorldIntro")LobbyKeys.Hold(KeyCode.Escape,true);lastKey=Time.realtimeSinceStartup;}
                yield return null;
            }
            LobbyKeys.ReleaseAll();if(lobby.Flow.Page!=LobbyPage.Lobby){map25DPlayReceipt.failures.Add("Product title keys did not reach Lobby");Map25DFinishPlay();yield break;}
            yield return Map25DWaitTransition();yield return Map25DPlayShot("03-lobby");
            int resets=startupResetCount;if(lobby.Characters.Count==0){
                if(!lobby.OpenCharacterCreation())map25DPlayReceipt.failures.Add("Isolated character selection failed");
                yield return Map25DWaitTransition();
                if(!lobby.ChooseCharacterVisual(0)||!lobby.ConfirmCharacterVisual())map25DPlayReceipt.failures.Add("Isolated character visual confirmation failed");
                yield return Map25DWaitTransition();
                if(!lobby.CreateCharacter("맵검수"))map25DPlayReceipt.failures.Add("Isolated character creation failed");
                yield return Map25DWaitTransition();
            }
            limit=Time.realtimeSinceStartup+20;while(lobby.CharacterStoryActive&&Time.realtimeSinceStartup<limit)yield return Map25DHoldStorySkip();
            // A newly created character enters startup automatically after its story.
            if(!lobby.StartupEntryActive&&lobby.IsBlocking&&!lobby.EnterSelectedCharacter()){map25DPlayReceipt.failures.Add("Product EnterSelectedCharacter rejected");Map25DFinishPlay();yield break;}
            limit=Time.realtimeSinceStartup+45;previous="";
            while(lobby.IsBlocking&&Time.realtimeSinceStartup<limit){string stage=lobby.StageName;if(stage!=previous){previous=stage;yield return Map25DPlayShot("04-"+stage);}if(stage=="Nemesis"||stage=="Guide")yield return Map25DInputKey(Key.Escape);else yield return null;}
            if(lobby.IsBlocking){map25DPlayReceipt.failures.Add("Product startup did not enter field");Map25DFinishPlay();yield break;}
            yield return Map25DWaitTransition();if(firstPractice!=null)EndFirstPractice(true); // same callback as the tutorial Skip control
            for(int i=0;i<12;i++)yield return null;
            map25DPlayReceipt.resets=startupResetCount-resets;
            limit=Time.realtimeSinceStartup+30;while((!r3Loaded||!map25DPresentationOn)&&Time.realtimeSinceStartup<limit){UpdateViews();yield return null;}
            if(!map25DPresentationOn){map25DPlayReceipt.failures.Add("1-1 presentation did not activate");Map25DFinishPlay();yield break;}
            yield return Map25DPlayShot("05-field-entry");if(GrayboxRequested){yield return GB1Shot("gb1-01-start");gb1Video1Start=Time.realtimeSinceStartup;}Running=false;frontendEntryInputFence=false;
            Map25DEnemyAudit(Path.Combine(map25DPlayOutput,"05-enemy-entry.json"),true);
            var route=Map25DFindWalkPath(new Vector2(Simulation.Player.X,Simulation.Player.Y),new Vector2(2050,4400));
            if(route.Count==0){map25DPlayReceipt.failures.Add("Actual Core has no radius-safe camp route");Map25DFinishPlay();yield break;}
            File.WriteAllText(Path.Combine(map25DPlayOutput,"route.json"),JsonUtility.ToJson(new Map25DWalkRoute{points=route},true));
            int waypoint=0,stall=0;float next=Time.realtimeSinceStartup,walkDeadline=next+140;int shotAt=0;
            while(waypoint<route.Count&&Time.realtimeSinceStartup<walkDeadline){
                float now=Time.realtimeSinceStartup;int catchup=0;
                while(next<=now&&catchup++<8&&waypoint<route.Count){var player=Simulation.Player;var current=new Vector2(player.X,player.Y);if(Vector2.Distance(current,route[waypoint])<5){waypoint++;continue;}
                    var delta=(route[waypoint]-current).normalized;player.Iframes=600;StepInput(delta.x,delta.y,route[waypoint].x,route[waypoint].y,false,false);Map25DTrackEnemies();var after=new Vector2(player.X,player.Y);float moved=Vector2.Distance(current,after);map25DPlayReceipt.walkedPixels+=moved;map25DPlayReceipt.ticks++;if(moved<.01f){map25DPlayReceipt.blockedTicks++;stall++;}else stall=0;next+=1/60f;
                    if(stall>120){map25DPlayReceipt.failures.Add("Walking stalled near "+current);waypoint=route.Count;break;}
                }
                if(map25DPlayReceipt.ticks>shotAt){shotAt+=600;yield return Map25DPlayShot("06-route-"+map25DPlayReceipt.ticks);}
                UpdateViews();yield return null;if(GrayboxRequested)yield return GB1WalkFrame();
            }
            map25DPlayReceipt.arrived=Vector2.Distance(new Vector2(Simulation.Player.X,Simulation.Player.Y),new Vector2(2050,4400))<55;
            if(!map25DPlayReceipt.arrived)map25DPlayReceipt.failures.Add("Did not reach camp by actual walking");
            yield return Map25DPlayShot("07-camp-arrival");
            Map25DEnemyAudit(Path.Combine(map25DPlayOutput,"07-enemy-arrival.json"),false);
            yield return Map25DSamePlaceProof(map25DPlayOutput);if(GrayboxConnected){yield return GB1ContinueProof();Map25DFinishPlay();yield break;}if(GrayboxRequested){yield return GB1Shot("gb1a-camp");yield return GB1WideShot("gb1a-camp-3840",true);GB1WriteFirstVideo();yield return GB1aBridgeProof();}
            int oldWidth=Screen.width,oldHeight=Screen.height;
            foreach(var size in new[]{new Vector2Int(3840,1080),new Vector2Int(5120,1440)}){if(Map25DLaunchSizeFixed&&(Screen.width!=size.x||Screen.height!=size.y)){map25DPlayReceipt.notes.Add("Wide proof "+size+" skipped: launch size fixed by -screen-width/-screen-height; run again at that size");continue;}Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);float sizeLimit=Time.realtimeSinceStartup+10;while((Screen.width!=size.x||Screen.height!=size.y)&&Time.realtimeSinceStartup<sizeLimit)yield return null;if(Screen.width!=size.x||Screen.height!=size.y){map25DPlayReceipt.failures.Add("Wide product proof resolution failed "+size);continue;}for(int k=0;k<6;k++){UpdateViews();yield return null;}string prefix="07-camp-"+size.x;yield return Map25DPlayShot(prefix+"-combat","Same actual walked arrival, wide proof; no Core steps/teleport");yield return Map25DSamePlaceProof(map25DPlayOutput,prefix);}
            Screen.SetResolution(oldWidth,oldHeight,FullScreenMode.Windowed);for(int k=0;k<8;k++){UpdateViews();yield return null;}
            var fpsSamples=new List<float>();float measuredAt=Time.realtimeSinceStartup,lastFrame=measuredAt;while(Time.realtimeSinceStartup-measuredAt<6){UpdateViews();yield return null;float now=Time.realtimeSinceStartup;fpsSamples.Add((now-lastFrame)*1000);lastFrame=now;}map25DPlayReceipt.campFps=fpsSamples.Count/(Time.realtimeSinceStartup-measuredAt);fpsSamples.Sort();map25DPlayReceipt.campP50Ms=fpsSamples[fpsSamples.Count/2];map25DPlayReceipt.campP95Ms=fpsSamples[Mathf.Min(fpsSamples.Count-1,(int)(fpsSamples.Count*.95f))];Map25DWritePlay();
            yield return Map25DDenseCombatBench();Screen.SetResolution(oldWidth,oldHeight,FullScreenMode.Windowed);for(int k=0;k<8;k++){UpdateViews();yield return null;}
            // Product lobby-return and normal saved-character entry exercise the same single instance.
            lobby.ShowLobby();Running=false;yield return Map25DWaitTransition();for(int i=0;i<8;i++)yield return null;yield return Map25DPlayShot("08-lobby-return");
            if(map25DPresentationOn)map25DPlayReceipt.failures.Add("Map layer leaked into Lobby");
            if(!lobby.EnterSelectedCharacter())map25DPlayReceipt.failures.Add("Re-entry rejected");
            limit=Time.realtimeSinceStartup+40;while(lobby.IsBlocking&&Time.realtimeSinceStartup<limit){if(lobby.StartupStage=="Nemesis"||lobby.StartupStage=="Guide")yield return Map25DInputKey(Key.Escape);else yield return null;}
            if(firstPractice!=null)EndFirstPractice(true);for(int i=0;i<16;i++){UpdateViews();yield return null;}
            yield return Map25DPlayShot("09-field-reentry");if(!map25DPresentationOn||FindObjectsByType<Map25DEnvironment>(FindObjectsInactive.Include).Length!=1)map25DPlayReceipt.failures.Add("Re-entry layer missing or duplicated");
            Simulation.Player.Hp=0;Simulation.Player.State="dead";UpdateViews();for(int i=0;i<8;i++)yield return null;yield return Map25DPlayShot("10-death","Synthetic lethal state; product death UI and retry callback");
            RetryFromDeath();yield return Map25DWaitTransition();for(int i=0;i<16;i++){UpdateViews();yield return null;}yield return Map25DPlayShot("11-retry");if(!map25DPresentationOn||FindObjectsByType<Map25DEnvironment>(FindObjectsInactive.Include).Length!=1)map25DPlayReceipt.failures.Add("Death retry layer missing or duplicated");
            int originalStage=Simulation.Config.StageIndex;Simulation.Config.StageIndex=1;for(int i=0;i<8;i++)yield return null;yield return Map25DPlayShot("12-other-stage-guard","Presentation guard only: synthetic stage index, not a natural 1-2 playthrough");if(map25DPresentationOn)map25DPlayReceipt.failures.Add("Map25D leaked into another stage");Simulation.Config.StageIndex=originalStage;for(int i=0;i<8;i++)yield return null;yield return Map25DPlayShot("13-stage-restored");
            Map25DFinishPlay();
        }
        [Serializable] sealed class Map25DWalkRoute {public List<Vector2> points;}
        List<Vector2> Map25DFindWalkPath(Vector2 start,Vector2 goal)
        {
            const int size=200;int[] previous=new int[size*size];for(int i=0;i<previous.Length;i++)previous[i]=-2;int source=Mathf.Clamp((int)(start.y/40),0,199)*size+Mathf.Clamp((int)(start.x/40),0,199),target=(int)(goal.y/40)*size+(int)(goal.x/40);var queue=new Queue<int>();queue.Enqueue(source);previous[source]=-1;float radius=Simulation.Player.Radius;
            while(queue.Count>0){int index=queue.Dequeue();if(index==target)break;int x=index%size,y=index/size;foreach(var d in new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left}){int xx=x+d.x,yy=y+d.y;if(xx<0||yy<0||xx>=size||yy>=size)continue;int n=yy*size+xx;if(previous[n]!=-2||!Map.CanMove(xx*40+20,yy*40+20,radius+5))continue;bool clear=true;for(int k=1;k<4;k++)if(!Map.CanMove(x*40+20+d.x*k*10,y*40+20+d.y*k*10,radius+5))clear=false;if(!clear)continue;previous[n]=index;queue.Enqueue(n);}}
            var path=new List<Vector2>();if(previous[target]==-2)return path;for(int n=target;n>=0;n=previous[n])path.Add(new Vector2(n%size*40+20,n/size*40+20));path.Reverse();path.Add(goal);return path;
        }
        void Map25DFinishPlay(){LobbyKeys.ReleaseAll();map25DPlayReceipt.seconds=Time.realtimeSinceStartup-map25DPlayStart;map25DPlayReceipt.passed=map25DPlayReceipt.arrived&&map25DPlayReceipt.errors==0&&map25DPlayReceipt.failures.Count==0&&map25DPlayReceipt.settingsHumanArgsAllowed;Map25DWritePlay();Application.logMessageReceived-=Map25DPlayLog;Application.Quit(map25DPlayReceipt.passed?0:2);}
    }
}
