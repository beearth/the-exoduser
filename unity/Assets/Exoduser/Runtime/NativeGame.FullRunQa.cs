using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Opt-in QA only. Does not change Core, enemies, rewards, health, or world coordinates.
    public sealed partial class NativeGame
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void StartFullRunQa()
        {
            if (Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-fullrun-qa") < 0) return;
            var game = UnityEngine.Object.FindFirstObjectByType<NativeGame>();
            if (game != null) game.StartCoroutine(game.FullRunQa());
        }

        [Serializable] sealed class FullRunSample
        {
            public string scene, state, target, bossState;
            public float seconds, x, y, hp, shield, mana, stamina, fps;
            public int tick, kills, level, experience, loot, bag, regions, anglers, holes, bossHp;
            public bool arena, cleared, gate;
            public int[] regionKills, regionTotals;
        }
        [Serializable] sealed class FullRunReceipt
        {
            public string scope = "Actual GPU Player; virtual InputSystem keyboard/mouse -> NativeGame.FixedUpdate. No teleport, HP/resource edits, enemy injection, forced kill or gate unlock. Story and first practice use supported skip.";
            public string result, device;
            public int width, height;
            public float seconds, averageFps, frameP95Ms, frameP99Ms, longestFrameMs;
            public int renderedFrames;
            public List<FullRunSample> samples = new List<FullRunSample>();
        }
        sealed class FullRunFrameProbe : MonoBehaviour
        {
            public readonly List<float> milliseconds=new List<float>();
            void Update(){milliseconds.Add(Time.unscaledDeltaTime*1000);}
        }

        IEnumerator FullRunQa()
        {
            string output = Argument("-output");
            if (string.IsNullOrEmpty(output)) { Application.Quit(2); yield break; }
            Directory.CreateDirectory(output); Directory.CreateDirectory(Path.Combine(output, "caps"));
            AudioListener.volume = 0; AudioListener.pause = true;
            smokeActive = true; dropSmoke = true; Running = false;
            Application.runInBackground = true;
            int width; if (!int.TryParse(Argument("-qa-width"), out width)) width = 1920;
            Screen.SetResolution(width, 1080, FullScreenMode.Windowed);
            var receipt = new FullRunReceipt { device = SystemInfo.graphicsDeviceName, width = width, height = 1080 };
            float started = Time.realtimeSinceStartup;
            yield return new WaitForSecondsRealtime(1);
            lobby.ShowLobby();
            string fresh = "FULL" + (DateTime.Now.Ticks % 1000000).ToString("000000");
            bool created = lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual() && lobby.CreateCharacter(fresh);
            lobby.ShowLobby();
            yield return FullRunShot(output, "00-lobby");
            if (!created || !lobby.BeginCharacterEntry(false)) { receipt.result = "lobby-entry-blocked"; yield return FullRunEnd(output, receipt, started); yield break; }
            float deadline = Time.realtimeSinceStartup + 30;
            while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 20;
            while (lobby.IsBlocking && Time.realtimeSinceStartup < deadline) yield return null;
            if (lobby.IsBlocking) { receipt.result = "startup-blocked"; yield return FullRunEnd(output, receipt, started); yield break; }
            yield return FullRunShot(output, "01-practice");
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; menu = false; SetGameFocus(true); Running = false;
            var oldKeyboard = Keyboard.current; var oldMouse = Mouse.current;
            var keyboard = InputSystem.AddDevice<Keyboard>(); var mouse = InputSystem.AddDevice<Mouse>();
            var visits = new HashSet<int>();
            var patterns = new HashSet<string>();
            var performance = gameObject.AddComponent<FullRunFrameProbe>();
            var navigation = new FullRunNavigation();
            float nextSample = 0, nextStep = Time.realtimeSinceStartup;
            int maxTicks; if (!int.TryParse(Argument("-qa-max-ticks"), out maxTicks)) maxTicks = 54000;
            int firstTick = Simulation.TickCount, previousLevel = Simulation.Player.Level, previousBag = inventory.State.Bag.Count;
            bool battleShot = false, arenaShot = false, dropShot = false, gateShot = false;
            float previousX = Simulation.Player.X, previousY = Simulation.Player.Y;
            int stalled = 0;
            string objective = "field";
            try
            {
                while (Simulation.TickCount - firstTick < maxTicks)
                {
                    var sim = Simulation; var p = sim.Player; var flow = sim.Stage;
                    if (PlayerDown) { receipt.result = "player-death"; yield return FullRunShot(output, "death"); break; }
                    if (flow.StageCleared) { receipt.result = "stage-cleared"; yield return FullRunShot(output, "clear"); break; }
                    Vector2 destination = new Vector2(p.X, p.Y), aim = destination + Vector2.up * 200;
                    bool fighting = false; float nearest = 850 * 850;
                    foreach (var e in sim.Enemies)
                    {
                        if (!e.Alive || Simulation.IsRemodelProp(e)) continue;
                        float d = (e.X - p.X) * (e.X - p.X) + (e.Y - p.Y) * (e.Y - p.Y);
                        if (d < nearest) { nearest = d; aim = new Vector2(e.X, e.Y); fighting = true; }
                    }
                    if (sim.FieldBosses != null) foreach (var a in sim.FieldBosses)
                    {
                        if (a == null || a.Hp <= 0) continue;
                        float d = (float)((a.X - p.X) * (a.X - p.X) + (a.Y - p.Y) * (a.Y - p.Y));
                        if (d < nearest) { nearest = d; aim = new Vector2((float)a.X, (float)a.Y); fighting = true; }
                    }
                    if (flow.InArena && !flow.BossAlive && flow.Exits.Count > 0)
                    {
                        var ex = flow.Exits[0]; destination = new Vector2((ex.X + .5f) * 40, (ex.Y + .5f) * 40); objective = "arena-exit"; fighting = false;
                    }
                    else if (fighting)
                    {
                        objective = "combat";
                        var away = new Vector2(p.X, p.Y) - aim;
                        destination = aim + away.normalized * 290;
                        if (away.magnitude >= 230 && away.magnitude <= 420 && FullRunLine(p.X, p.Y, aim.x, aim.y)) destination = new Vector2(p.X, p.Y);
                    }
                    else if (flow.BossUnlocked && flow.Exits.Count > 1)
                    {
                        var ex = flow.Exits[1]; destination = new Vector2((ex.X + .5f) * 40, (ex.Y + .5f) * 40); objective = "hell-gate";
                    }
                    else
                    {
                        float best = float.MaxValue;
                        // Visit every natural summon site. Persisting at each site gives its real spawner time to finish.
                        for (int i = 0; i < SpawnHoleSystem.Stage0Holes.Length; i++)
                        {
                            if (visits.Contains(i)) continue;
                            var h = SpawnHoleSystem.Stage0Holes[i]; var q = new Vector2((float)h[0], (float)h[1]);
                            bool pending = false;
                            if (sim.SpawnHoles != null) foreach (var live in sim.SpawnHoles.Holes) if (live.X == h[0] && live.Y == h[1]) pending = true;
                            if (!pending && Vector2.Distance(new Vector2(p.X,p.Y),q)<750) { visits.Add(i); continue; }
                            float d = Vector2.SqrMagnitude(q - new Vector2(p.X,p.Y));
                            if (d < best) { best = d; destination = q; objective = "hole-" + i; }
                        }
                        if (best == float.MaxValue && sim.FieldBosses != null) foreach (var a in sim.FieldBosses)
                        {
                            if (a == null || a.Hp <= 0) continue;
                            var q = new Vector2((float)a.X, (float)a.Y); float d = Vector2.SqrMagnitude(q-new Vector2(p.X,p.Y));
                            if (d < best) { best = d; destination = q; objective = "angler-" + a.Index; }
                        }
                        // Enemies left behind still belong to their original regions.
                        if (best == float.MaxValue) foreach (var e in sim.Enemies)
                        {
                            if (!e.Alive || Simulation.IsRemodelProp(e)) continue;
                            float d = Vector2.SqrMagnitude(new Vector2(e.X-p.X,e.Y-p.Y));
                            if (d < best) { best = d; destination = new Vector2(e.X,e.Y); objective = "remaining-" + e.Id; }
                        }
                    }
                    var move = navigation.Direction(p.X,p.Y,destination.x,destination.y,p.Radius,FullRunCanMove,sim.TickCount);
                    var keys = new List<Key> { Key.R };
                    if (move.x > .25f) keys.Add(Key.D); else if(move.x < -.25f) keys.Add(Key.A);
                    if (move.y > .25f) keys.Add(Key.S); else if(move.y < -.25f) keys.Add(Key.W);
                    // Release the third charged slash periodically; continuous hold never releases it.
                    bool attack = fighting && sim.TickCount % 210 < 190;
                    bool magic = fighting && sim.TickCount % 150 < 18;
                    if (fighting && sim.TickCount % 600 < 1) keys.Add(Key.Digit1);
                    keyboard.MakeCurrent(); mouse.MakeCurrent(); InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
                    var aimPoint = NativeRemodel3D.Active ? NativeRemodel3D.Point(aim.x,aim.y) : Point(aim.x,aim.y);
                    if (NativeRemodel3D.Active) aimPoint.y = NativeRemodel3D.Point(p.X,p.Y).y;
                    var screen = HudCamera.WorldToScreenPoint(aimPoint);
                    var ms = new MouseState { position = new Vector2(screen.x,screen.y) };
                    if (attack) ms=ms.WithButton(MouseButton.Left); if (magic) ms=ms.WithButton(MouseButton.Right);
                    InputState.Change(mouse,ms);
                    Running=true; FixedUpdate(); Running=false; UpdateViews();
                    if (Vector2.Distance(destination,new Vector2(p.X,p.Y))>80 && Mathf.Abs(p.X-previousX)+Mathf.Abs(p.Y-previousY)<.01f) stalled++; else stalled=0;
                    previousX=p.X;previousY=p.Y;
                    if (stalled==300) Debug.LogWarning("FULLRUN_STALL " + objective + " " + p.X + "," + p.Y);
                    if (stalled>900) { receipt.result="navigation-stalled-"+objective; yield return FullRunShot(output,"stalled"); break; }
                    yield return null;
                    if (Time.realtimeSinceStartup>=nextSample)
                    {
                        var sample=FullRunObserve(objective,started);receipt.samples.Add(sample);
                        string json=JsonUtility.ToJson(sample);File.AppendAllText(Path.Combine(output,"telemetry.jsonl"),json+"\n");Debug.Log("FULLRUN "+json);
                        yield return FullRunShot(output,"t"+(sim.TickCount-firstTick).ToString("000000"));
                        File.WriteAllText(Path.Combine(output,"fullrun.json"),JsonUtility.ToJson(receipt,true));
                        nextSample=Time.realtimeSinceStartup+10;
                    }
                    if(!battleShot&&sim.Kills>0){battleShot=true;yield return FullRunShot(output,"combat");}
                    if(!dropShot&&sim.Loot.Count>0){dropShot=true;yield return FullRunShot(output,"drops");}
                    if(p.Level!=previousLevel){previousLevel=p.Level;yield return FullRunShot(output,"level-"+p.Level);}
                    if(inventory.State.Bag.Count>previousBag){previousBag=inventory.State.Bag.Count;yield return FullRunShot(output,"pickup-"+previousBag);}
                    if(!gateShot&&flow.BossUnlocked){gateShot=true;yield return FullRunShot(output,"gate-open");}
                    if(!arenaShot&&flow.InArena&&flow.LoadPhase==0){arenaShot=true;yield return FullRunShot(output,"boss-entry");}
                    var liveBoss=flow.FindBoss();DruidData pattern;
                    if(flow.InArena&&flow.LoadPhase==0&&liveBoss!=null&&sim.Druid!=null&&sim.Druid.Data.TryGetValue(liveBoss,out pattern)&&patterns.Add(pattern.S))
                        yield return FullRunShot(output,"boss-pattern-"+pattern.S);
                    // One actual simulation tick at 60 Hz, with real render frames between inputs.
                    nextStep+=1f/60; float wait=nextStep-Time.realtimeSinceStartup;
                    if(wait>0)yield return new WaitForSecondsRealtime(wait);else nextStep=Time.realtimeSinceStartup;
                }
                if(receipt.result==null)receipt.result="time-limit";
                var timings=performance.milliseconds;receipt.renderedFrames=timings.Count;
                if(timings.Count>0){double total=0;foreach(float ms in timings)total+=ms;timings.Sort();receipt.averageFps=(float)(1000*timings.Count/total);receipt.frameP95Ms=timings[(int)((timings.Count-1)*.95)];receipt.frameP99Ms=timings[(int)((timings.Count-1)*.99)];receipt.longestFrameMs=timings[timings.Count-1];}
            }
            finally
            {
                Running=false;InputSystem.RemoveDevice(keyboard);InputSystem.RemoveDevice(mouse);
                Destroy(performance);
                if(oldKeyboard!=null&&oldKeyboard.added)oldKeyboard.MakeCurrent();if(oldMouse!=null&&oldMouse.added)oldMouse.MakeCurrent();
            }
            receipt.samples.Add(FullRunObserve(objective,started));
            yield return FullRunEnd(output,receipt,started);
        }
        bool FullRunCanMove(float x,float y,float radius)
        {
            return (Simulation.CanMove==null||Simulation.CanMove(x,y,radius)) &&
                !(Simulation.Druid!=null&&Simulation.Druid.Boss!=null&&Simulation.Druid.PillarBlocks(x,y,radius));
        }
        bool FullRunLine(float x,float y,float tx,float ty) { return Simulation.HasLineOfSight==null||Simulation.HasLineOfSight(x,y,tx,ty); }
        FullRunSample FullRunObserve(string target,float started)
        {
            var s=Simulation;var p=s.Player;var b=s.Stage.FindBoss();string state="";DruidData data;
            if(b!=null&&s.Druid!=null&&s.Druid.Data.TryGetValue(b,out data))state=data.S;
            var row=new FullRunSample{scene=s.Stage.InArena?"arena":"field",state=p.State,target=target,bossState=state,seconds=Time.realtimeSinceStartup-started,x=p.X,y=p.Y,hp=p.Hp,shield=p.Shield,mana=p.Mana,stamina=p.Stamina,fps=1/Mathf.Max(.0001f,Time.unscaledDeltaTime),tick=s.TickCount,kills=s.Kills,level=p.Level,experience=p.Experience,loot=s.Loot.Count,bag=inventory.State.Bag.Count,regions=s.RegionClearedCount(),anglers=s.FieldBossAliveCount(),holes=s.SpawnHoles!=null?s.SpawnHoles.Holes.Count:0,bossHp=b!=null?b.Hp:0,arena=s.Stage.InArena,cleared=s.Stage.StageCleared,gate=s.Stage.BossUnlocked};
            if(s.Regions!=null){row.regionKills=new int[4];row.regionTotals=new int[4];for(int i=0;i<4;i++){row.regionKills[i]=s.Regions[i].Kills;row.regionTotals[i]=s.Regions[i].Total;}}
            return row;
        }
        IEnumerator FullRunShot(string output,string name)
        {
            yield return new WaitForEndOfFrame();
            var image=ScreenCapture.CaptureScreenshotAsTexture();
            try{File.WriteAllBytes(Path.Combine(output,"caps",name+".png"),image.EncodeToPNG());}finally{Destroy(image);}
        }
        IEnumerator FullRunEnd(string output,FullRunReceipt receipt,float started)
        {
            receipt.seconds=Time.realtimeSinceStartup-started;
            File.WriteAllText(Path.Combine(output,"fullrun.json"),JsonUtility.ToJson(receipt,true));
            Debug.Log("FULLRUN_RESULT "+receipt.result+" seconds="+receipt.seconds);
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
            Application.Quit(receipt.result=="stage-cleared"?0:2);
        }
    }

    // Collision-aware navigation for QA input. A path is sampled against the same host collision callback.
    sealed class FullRunNavigation
    {
        readonly List<Vector2> path=new List<Vector2>();Vector2 goal;int nextPlan;
        public Vector2 Direction(float x,float y,float tx,float ty,float radius,Func<float,float,float,bool> canMove,int tick)
        {
            var from=new Vector2(x,y);var target=new Vector2(tx,ty);
            if(Vector2.Distance(from,target)<12)return Vector2.zero;
            if(tick>=nextPlan||Vector2.Distance(goal,target)>100)
            {
                nextPlan=tick+90;goal=target;path.Clear();
                const int side=210;const float cell=40;
                int sx=Mathf.Clamp((int)(x/cell),0,side-1),sy=Mathf.Clamp((int)(y/cell),0,side-1),start=sy*side+sx;
                var previous=new int[side*side];for(int i=0;i<previous.Length;i++)previous[i]=-1;
                var queue=new Queue<int>();queue.Enqueue(start);previous[start]=start;int closest=start;float best=float.MaxValue;
                while(queue.Count>0)
                {
                    int at=queue.Dequeue(),ax=at%side,ay=at/side;var point=new Vector2((ax+.5f)*cell,(ay+.5f)*cell);
                    float distance=Vector2.SqrMagnitude(point-target);if(distance<best){best=distance;closest=at;}if(distance<900)break;
                    for(int d=0;d<4;d++)
                    {
                        int nx=ax+(d==0?1:d==1?-1:0),ny=ay+(d==2?1:d==3?-1:0);if(nx<0||ny<0||nx>=side||ny>=side)continue;
                        int n=ny*side+nx;if(previous[n]>=0)continue;
                        float px=(nx+.5f)*cell,py=(ny+.5f)*cell;
                        if(!canMove(px,py,radius)||!canMove((point.x+px)/2,(point.y+py)/2,radius))continue;
                        previous[n]=at;queue.Enqueue(n);
                    }
                }
                for(int n=closest;n!=start&&n>=0;n=previous[n])path.Add(new Vector2((n%side+.5f)*cell,(n/side+.5f)*cell));path.Reverse();
            }
            while(path.Count>0&&Vector2.Distance(from,path[0])<12)path.RemoveAt(0);
            var to=path.Count>0?path[0]:target;var delta=to-from;
            var move=new Vector2(Mathf.Abs(delta.x)>8?Mathf.Sign(delta.x):0,Mathf.Abs(delta.y)>8?Mathf.Sign(delta.y):0);
            if(!canMove(x+move.x*6,y+move.y*6,radius)){nextPlan=0;return Vector2.zero;}
            return move;
        }
    }
}
