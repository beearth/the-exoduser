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
            public float seconds, x, y, hp, shield, mana, stamina, fps, maxHp, maxShield, maxMana, maxStamina, poison, iceCd, slamCd, aimX, aimY;public double rage;public bool iceActive;public List<FullRunNearby> nearby;
            public int tick, kills, level, experience, loot, bag, regions, anglers, holes, bossHp, sp, ap, strength, fortify, human, melee;
            public bool arena, cleared, gate;
            public int[] regionKills, regionTotals;
        }
        [Serializable] sealed class FullRunNearby {public string kind;public int id,type;public double hp,x,y,distance;public bool line;}
        [Serializable] sealed class FullRunStageMark {public string kind;public int tick,kills;public float seconds;}
        Action<StageEvent> fullRunStageEvent;
        string fullRunCapturePrefix="",fullRunCaptureActivity="",fullRunLastCaptureActivity="";int fullRunLastCaptureFrame=-10000;float fullRunAimX,fullRunAimY;
        [Serializable] sealed class FullRunReceipt
        {
            public string scope = "Actual GPU Player; virtual InputSystem keyboard/mouse -> NativeGame.FixedUpdate. No direct position/HP/resource edits, enemy injection, forced kill or gate unlock. Boss retries use the real death screen callback and its ordinary resource restoration; deaths and retries are counted. Story and first practice use supported skip. Earned growth points use the ordinary transactional stat purchase API; owned usable gear is equipped through NativeInventory.Equip. No forced healing.";
            public string result, device, buildGuid;
            public string frontendFailure;public List<string> frontendBoundaries=new List<string>();
            public int width, height;
            public float seconds, averageFps, minFps, frameP95Ms, frameP99Ms, longestFrameMs;
            public int renderedFrames, gearChanges, deaths, retries, policyChanges;
            public string controlPolicyScope="Optional fullrun-policy.json changes virtual boss inputs only; accepted settings are recorded in policy-history.jsonl. Disabled by default.";
            public string timingScope="Raw frames include capture/resizes and concurrent work. Long-frame records are buffered and flushed after play; the final trace flush is outside the timing sample.";
            public bool worldCleared, clearModalNotApplicable, clearModalBlockedBackground, clearCancelRearmed, clearReturnedLobby, clearSaveExists;
            public float worldClearSeconds;
            public string clearUiScope = "After natural clear: actual panel callbacks and virtual Escape through NativeGame.Update; not OS/IMGUI button injection.";
            public List<FullRunSample> samples = new List<FullRunSample>();
            public List<FullRunStageMark> stageMarks = new List<FullRunStageMark>();
            public double fieldScale;public string fieldEnemies;public int seed;
        }
        [Serializable] sealed class FullRunLongFrame {public float seconds,ms;public int tick,loadPhase;public bool arena;public string capture,state;}
        sealed class FullRunFrameProbe : MonoBehaviour
        {
            public readonly List<float> milliseconds=new List<float>();
            public NativeGame game;public string output;public float started;
            readonly List<FullRunLongFrame> longFrames=new List<FullRunLongFrame>();
            void Update(){float ms=Time.unscaledDeltaTime*1000;milliseconds.Add(ms);if(ms>100&&game!=null&&game.Simulation!=null){var s=game.Simulation;longFrames.Add(new FullRunLongFrame{seconds=Time.realtimeSinceStartup-started,ms=ms,tick=s.TickCount,loadPhase=s.Stage.LoadPhase,arena=s.Stage.InArena,capture=FullRunFrameCapture(game.fullRunCaptureActivity,game.fullRunLastCaptureFrame,Time.frameCount,game.fullRunLastCaptureActivity),state=s.Player.State});}}
            public void Flush(){var text=new System.Text.StringBuilder();foreach(var row in longFrames)text.AppendLine(JsonUtility.ToJson(row));File.WriteAllText(Path.Combine(output,"long-frames.jsonl"),text.ToString());}
        }

        IEnumerator FullRunQa()
        {
            string output = Argument("-output");
            if (string.IsNullOrEmpty(output)) { NativeLobbyVideo.RequestQuit(2); yield break; }
            Directory.CreateDirectory(output); Directory.CreateDirectory(Path.Combine(output, "caps"));
            AudioListener.volume = 0; AudioListener.pause = true;
            smokeActive = true; dropSmoke = true; Running = false;
            areaTitleAllowed = true; // Natural input review includes the ordinary area title UI.
            Application.runInBackground = true;
            int width; if (!int.TryParse(Argument("-qa-width"), out width)) width = 1920;
            Screen.SetResolution(width, 1080, FullScreenMode.Windowed);
            var receipt = new FullRunReceipt { device = SystemInfo.graphicsDeviceName, buildGuid = Application.buildGUID, width = width, height = 1080 };
            float started = Time.realtimeSinceStartup;
            receipt.fieldScale=fieldLayout.Scale;receipt.fieldEnemies=fieldLayout.EnemyMode;receipt.seed=(int)SourceStarterFixture.Seed;
            fullRunStageEvent=e=>receipt.stageMarks.Add(new FullRunStageMark{kind=e.Kind.ToString(),tick=e.Tick,kills=Simulation.Kills,seconds=Time.realtimeSinceStartup-started});
            yield return new WaitForSecondsRealtime(1);
            lobby.SetPlaybackFocus(true); // Hidden desktop has no foreground focus; retain the ordinary entry flow.
            Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
            lobby.ShowLobby();yield return FullRunWaitFrontend("initial-lobby",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            string fresh = "F" + (DateTime.Now.Ticks % 1000000).ToString("000000");
            bool opened=lobby.OpenCharacterCreation();yield return FullRunWaitFrontend("character-selection",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            bool chosen=opened&&lobby.ChooseCharacterVisual(0);bool confirmed=chosen&&lobby.ConfirmCharacterVisual();yield return FullRunWaitFrontend("character-name",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            bool created=confirmed&&lobby.CreateCharacter(fresh);yield return FullRunWaitFrontend("created-story",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            lobby.ShowLobby();yield return FullRunWaitFrontend("entry-lobby",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            yield return FullRunShot(output, "00-lobby");
            if (!created || !lobby.BeginCharacterEntry(false)) { receipt.result = "lobby-entry-blocked"; yield return FullRunEnd(output, receipt, started); yield break; }
            yield return FullRunWaitFrontend("lobby-game",receipt);if(!string.IsNullOrEmpty(receipt.frontendFailure)){receipt.result="frontend-boundary-blocked";yield return FullRunEnd(output,receipt,started);yield break;}
            float deadline = Time.realtimeSinceStartup + 30;
            while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) { lobby.SetPlaybackFocus(true); yield return null; }
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 20;
            while (lobby.IsBlocking && Time.realtimeSinceStartup < deadline) { lobby.SetPlaybackFocus(true); yield return null; }
            if (lobby.IsBlocking) { receipt.result = "startup-blocked"; yield return FullRunEnd(output, receipt, started); yield break; }
            yield return FullRunShot(output, "01-practice");
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; menu = false; SetGameFocus(true); Running = false;
            Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
            receipt.width=Screen.width;receipt.height=Screen.height;
            var oldKeyboard = Keyboard.current; var oldMouse = Mouse.current;
            var keyboard = InputSystem.AddDevice<Keyboard>(); var mouse = InputSystem.AddDevice<Mouse>();
            var visits = new HashSet<int>();
            var patterns = new HashSet<string>();
            var performance = gameObject.AddComponent<FullRunFrameProbe>();performance.game=this;performance.output=output;performance.started=started;
            var navigation = new FullRunNavigation(Math.Max(210,Map.Data.width+10));
            var controlPolicy=new FullRunControlPolicy();string policyText=null;
            string policyPath=Path.Combine(output,"fullrun-policy.json");int lastChainTick=-10000;
            if(!File.Exists(policyPath))File.WriteAllText(policyPath,JsonUtility.ToJson(controlPolicy,true));
            float nextSample = 0, nextStep = Time.realtimeSinceStartup;
            int maxTicks; if (!int.TryParse(Argument("-qa-max-ticks"), out maxTicks)) maxTicks = 54000;
            int retryLimit;if(!int.TryParse(Argument("-qa-retries"),out retryLimit))retryLimit=5;retryLimit=Mathf.Clamp(retryLimit,0,20);
            int firstTick = Simulation.TickCount, previousLevel = Simulation.Player.Level, previousBag = inventory.State.Bag.Count;
            bool pickupShot=false;bool battleShot = false, arenaShot = false, dropShot = false, gateShot = false, exitShot = false;
            float previousX = Simulation.Player.X, previousY = Simulation.Player.Y;
            int stalled = 0;
            string objective = "field";
            try
            {
                while (Simulation.TickCount - firstTick < maxTicks)
                {
                    var sim = Simulation; var p = sim.Player; var flow = sim.Stage;
                    if (PlayerDown)
                    {
                        receipt.deaths++;yield return new WaitForSecondsRealtime(2.7f);yield return FullRunShot(output,"death");
                        if(flow.InArena&&receipt.retries<retryLimit)
                        {
                            InputState.Change(keyboard,new KeyboardState());InputState.Change(mouse,new MouseState());
                            death.OnRetry?.Invoke();Running=false;yield return FullRunWaitFrontend("death-retry",receipt);Running=false;
                            if(!string.IsNullOrEmpty(receipt.frontendFailure)||PlayerDown||Simulation.Stage.InArena){receipt.result="death-retry-blocked";break;}
                            receipt.retries++;fullRunCapturePrefix="retry-"+receipt.retries.ToString("00")+"-";
                            navigation=new FullRunNavigation(Math.Max(210,Map.Data.width+10));patterns.Clear();yield return FullRunShot(output,"retry-field");continue;
                        }
                        receipt.result="player-death";break;
                    }
                    if (flow.StageCleared)
                    {
                        receipt.worldCleared=true;receipt.worldClearSeconds=Time.realtimeSinceStartup-started;
                        yield return new WaitForSecondsRealtime(.6f); // Respect the clear button's ordinary .5 s input fence.
                        yield return FullRunShot(output,"clear");
                        yield return FullRunClearTransition(output,keyboard,receipt);
                        receipt.result=receipt.clearModalBlockedBackground&&receipt.clearCancelRearmed&&receipt.clearReturnedLobby&&receipt.clearSaveExists?"stage-cleared":"stage-cleared-transition-blocked";
                        break;
                    }
                    if(sim.TickCount%60==0||sim.TickCount==firstTick)
                    {
                        for(int changes=0;changes<InventoryState.Slots.Length;changes++)
                        {
                            var upgrade=FullRunUpgradeItem(inventory.State,p.Level);if(upgrade==null||!inventory.Equip(upgrade,p.Level))break;
                            receipt.gearChanges++;
                            File.AppendAllText(Path.Combine(output,"equipment.jsonl"),"{\"tick\":"+sim.TickCount+",\"itemId\":"+upgrade.id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"power\":"+InventoryState.ItemPower(upgrade)+"}\n");
                        }
                    }
                    if(FullRunAllocateGrowth(sim)){hud.Refresh(p,sim.TickCount,true);RequestCombatSave();}
                    Vector2 destination = new Vector2(p.X, p.Y), aim = destination + Vector2.up * 200;
                    bool fighting = false,selectedAngler=false; float nearest = 850 * 850,targetScore=float.MaxValue;
                    foreach (var e in sim.Enemies)
                    {
                        if (!e.Alive || Simulation.IsRemodelProp(e)) continue;
                        float d = (e.X - p.X) * (e.X - p.X) + (e.Y - p.Y) * (e.Y - p.Y);
                        if(d>=850*850)continue;nearest=Math.Min(nearest,d);float score=p.Level>=6&&e.Etype==7&&d<550*550&&FullRunLine(p.X,p.Y,e.X,e.Y)?d/20:d;if(score<targetScore){targetScore=score;aim=new Vector2(e.X,e.Y);fighting=true;}
                    }
                    if (sim.FieldBosses != null) foreach (var a in sim.FieldBosses)
                    {
                        if (a == null || a.Hp <= 0) continue;
                        float d = (float)((a.X - p.X) * (a.X - p.X) + (a.Y - p.Y) * (a.Y - p.Y));
                        if(d>=850*850)continue;nearest=Math.Min(nearest,d);float score=sim.SpawnHoles!=null&&sim.SpawnHoles.Holes.Count==0?d/100:d;if(score<targetScore){targetScore=score;aim=new Vector2((float)a.X,(float)a.Y);fighting=selectedAngler=true;}
                    }
                    if (flow.InArena && !flow.BossAlive && flow.Exits.Count > 0)
                    {
                        var ex = flow.Exits[0]; destination = new Vector2((ex.X + .5f) * 40, (ex.Y + .5f) * 40); objective = "arena-exit"; fighting = false;
                    }
                    else if (fighting)
                    {
                        objective = "combat";
                        var away = new Vector2(p.X, p.Y) - aim;
                        float range=selectedAngler?360:210;
                        destination = aim + away.normalized * range;
                        if (away.magnitude >= range-40 && away.magnitude <= range+50 && FullRunLine(p.X, p.Y, aim.x, aim.y)) destination = new Vector2(p.X, p.Y);
                    }
                    else if (flow.InArena)
                    {
                        var arenaBoss=flow.FindBoss();
                        if(arenaBoss!=null){destination=new Vector2(arenaBoss.X,arenaBoss.Y);aim=destination;objective="approach-boss";}
                        else objective="arena-revive-wait";
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
                            if (!pending && (sim.SpawnHoles!=null||Vector2.Distance(new Vector2(p.X,p.Y),q)<750)) { visits.Add(i); continue; }
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
                    bool parryG2=Array.IndexOf(Environment.GetCommandLineArgs(),"--parry-g2-bot")>=0;
                    if(parryG2&&fighting&&!selectedAngler){var away=new Vector2(p.X,p.Y)-aim;destination=aim+away.normalized*50;}
                    var move = navigation.Direction(p.X,p.Y,destination.x,destination.y,p.Radius,FullRunCanMove,sim.TickCount,flow.InArena&&!flow.BossAlive);
                    if(fighting&&Vector2.SqrMagnitude(new Vector2(p.X,p.Y)-aim)>=(selectedAngler?320*320:170*170)&&Vector2.SqrMagnitude(new Vector2(p.X,p.Y)-aim)<(selectedAngler?410*410:260*260)&&FullRunLine(p.X,p.Y,aim.x,aim.y)){var offset=new Vector2(p.X,p.Y)-aim;var tangent=new Vector2(-offset.y,offset.x).normalized;if(FullRunCanMove(p.X+tangent.x*80,p.Y+tangent.y*80,p.Radius))move=tangent;}
                    var keys = new List<Key> { Key.R };
                    bool defend=false,evade=false,shield=false;Vector2 threat=aim;double shieldDistance=0,shieldSpeed=0;
                    if(sim.Druid!=null&&p.Iframes<=0)
                    {
                        double closestThreat=260*260;
                        foreach(var bullet in sim.Druid.Projectiles)
                        {
                            if(!bullet.Active||bullet.Friendly)continue;
                            double dx=p.X-bullet.X,dy=p.Y-bullet.Y,d=dx*dx+dy*dy;
                            if(d>=closestThreat||dx*bullet.Vx+dy*bullet.Vy<=0)continue;
                            closestThreat=d;threat=new Vector2((float)bullet.X,(float)bullet.Y);
                            defend=bullet.ParryClass=="magic"&&p.Mana>30;
                            evade=!defend;
                            shield=FullRunPhysicalShield(bullet.ParryClass,p,sim.MaliceSwipeLevel);
                            shieldDistance=Math.Sqrt(d);shieldSpeed=Math.Sqrt(bullet.Vx*bullet.Vx+bullet.Vy*bullet.Vy);
                            if(shield)evade=false;
                        }
                    }
                    // A real resource-limited run needs defensive inputs, not forced healing.
                    if(!shield&&!defend&&fighting&&p.Hp<p.MaxHp*.35f&&nearest<240*240&&p.Iframes<=0)evade=true;
                    if(evade)
                    {
                        var away=new Vector2(p.X,p.Y)-threat;
                        var escape=new Vector2(-away.y,away.x).normalized;
                        if(!FullRunCanMove(p.X+escape.x*80,p.Y+escape.y*80,p.Radius))escape=-escape;
                        move=escape;if(FullRunRollPress(sim))keys.Add(Key.Space);objective="evade";
                    }
                    else if(defend){if(FullRunMagicShieldPress(p.State))keys.Add(Key.Q);aim=threat;objective="parry";}
                    else if(shield){if(FullRunShieldPress(p.State,shieldDistance,shieldSpeed))keys.Add(Key.E);aim=threat;objective="physical-parry";}
                    int aux=FullRunAuxSkills(sim,fighting,nearest);
                    if((aux&1)!=0)keys.Add(Key.F);
                    if((aux&2)!=0){keys.Add(Key.LeftCtrl);keys.Remove(Key.Space);objective="ice-escape";}
                    else if((aux&4)!=0){move=Vector2.zero;keys.Add(Key.Space);objective="rage-burst";}
                    if(sim.IceOrbActive){keys.Remove(Key.Space);keys.Remove(Key.Q);keys.Remove(Key.E);move=Vector2.zero;}
                    if (move.x > .25f) keys.Add(Key.D); else if(move.x < -.25f) keys.Add(Key.A);
                    if (move.y > .25f) keys.Add(Key.S); else if(move.y < -.25f) keys.Add(Key.W);
                    // Release the third charged slash periodically; continuous hold never releases it.
                    bool attack = fighting&&!defend&&!shield&&!evade&&(p.Stamina>=10||p.KiChargeActive)&&(!p.KiChargeActive||p.KiChargeTicks<(flow.InArena?120:30));
                    bool magic = fighting&&!defend&&!shield&&!evade&&p.Mana>=40&&sim.TickCount%150<(p.Stamina<20?60:18);
                    if(aux!=0||sim.IceOrbActive){attack=false;magic=false;}
                    if(flow.InArena&&p.KiChargeActive&&p.KiChargeTicks<120&&!sim.IceOrbActive)attack=true;
                    if (fighting && sim.TickCount % 600 < 1) keys.Add(Key.Digit1);
                    keyboard.MakeCurrent(); mouse.MakeCurrent(); InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
                    if(sim.TickCount%60==0||policyText==null)
                    {
                        try
                        {
                            string raw=File.ReadAllText(policyPath);
                            if(raw!=policyText)
                            {
                                var nextPolicy=new FullRunControlPolicy();JsonUtility.FromJsonOverwrite(raw,nextPolicy);nextPolicy.Normalize();
                                controlPolicy=nextPolicy;policyText=raw;receipt.policyChanges++;
                                File.AppendAllText(Path.Combine(output,"policy-history.jsonl"),"{\"tick\":"+sim.TickCount+",\"policy\":"+JsonUtility.ToJson(controlPolicy)+"}\n");
                            }
                        }
                        catch(Exception ex)when(ex is IOException||ex is ArgumentException){Debug.LogWarning("FULLRUN_POLICY_RETAINED "+ex.GetType().Name);}
                    }
                    FullRunControlInputs.Apply(sim,controlPolicy,navigation,FullRunCanMove,keys,ref move,ref aim,ref attack,ref magic,evade,aux,ref lastChainTick);
                    if(parryG2){keys.Remove(Key.E);keys.Remove(Key.Q);keys.Remove(Key.Space);int input=g2ParryBot.Input(sim);if((input&1)!=0)keys.Add(Key.E);if((input&2)!=0)keys.Add(Key.Q);if((input&4)!=0)keys.Add(Key.Space);if(input!=0){attack=false;magic=false;}if(input!=0&&(input&4)==0){move=Vector2.zero;keys.Remove(Key.W);keys.Remove(Key.A);keys.Remove(Key.S);keys.Remove(Key.D);}}
                    InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
                    var aimPoint = NativeRemodel3D.Active ? NativeRemodel3D.Point(aim.x,aim.y) : Point(aim.x,aim.y);
                    if (NativeRemodel3D.Active) aimPoint.y = NativeRemodel3D.Point(p.X,p.Y).y;
                    var screen = HudCamera.WorldToScreenPoint(aimPoint);
                    var ms = new MouseState { position = new Vector2(screen.x,screen.y) };
                    if (attack) ms=ms.WithButton(MouseButton.Left); if (magic) ms=ms.WithButton(MouseButton.Right);
                    InputState.Change(mouse,ms);fullRunAimX=aim.x;fullRunAimY=aim.y;
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
                    if(inventory.State.Bag.Count>previousBag){previousBag=inventory.State.Bag.Count;if(!pickupShot){pickupShot=true;yield return FullRunShot(output,"pickup-"+previousBag);}}
                    if(!gateShot&&flow.BossUnlocked){gateShot=true;yield return FullRunShot(output,"gate-open");}
                    if(!arenaShot&&flow.InArena&&flow.LoadPhase==0){arenaShot=true;yield return FullRunShot(output,"boss-entry");}
                    if(!exitShot&&flow.InArena&&!flow.BossAlive&&flow.Exits.Count>0){exitShot=true;yield return FullRunShot(output,"exit-open");}
                    var liveBoss=flow.FindBoss();DruidData pattern;
                    if(flow.InArena&&flow.LoadPhase==0&&liveBoss!=null&&sim.Druid!=null&&sim.Druid.Data.TryGetValue(liveBoss,out pattern)&&patterns.Add(pattern.S))
                        yield return FullRunShot(output,"boss-pattern-"+pattern.S);
                    // One actual simulation tick at 60 Hz, with real render frames between inputs.
                    nextStep+=1f/60; float wait=nextStep-Time.realtimeSinceStartup;
                    if(wait>0)yield return new WaitForSecondsRealtime(wait);else nextStep=Time.realtimeSinceStartup;
                }
                if(receipt.result==null)receipt.result="time-limit";
                var timings=performance.milliseconds;receipt.renderedFrames=timings.Count;
                if(timings.Count>0){double total=0;foreach(float ms in timings)total+=ms;timings.Sort();receipt.averageFps=(float)(1000*timings.Count/total);receipt.frameP95Ms=timings[(int)((timings.Count-1)*.95)];receipt.frameP99Ms=timings[(int)((timings.Count-1)*.99)];receipt.longestFrameMs=timings[timings.Count-1];receipt.minFps=receipt.longestFrameMs>0?1000/receipt.longestFrameMs:0;}
            }
            finally
            {
                Running=false;InputSystem.RemoveDevice(keyboard);InputSystem.RemoveDevice(mouse);
                try{performance.Flush();}catch(Exception ex)when(ex is IOException||ex is UnauthorizedAccessException){receipt.result="qa-trace-write-error";Debug.LogError("FULLRUN_TRACE_WRITE "+ex.GetType().Name);}
                Destroy(performance);
                if(oldKeyboard!=null&&oldKeyboard.added)oldKeyboard.MakeCurrent();if(oldMouse!=null&&oldMouse.added)oldMouse.MakeCurrent();
            }
            receipt.samples.Add(FullRunObserve(objective,started));
            yield return FullRunEnd(output,receipt,started);
        }
        static bool FullRunPhysicalShield(string kind,PlayerState player,double level)
        {
            return kind=="physical"&&(player.State=="sDraw"||player.State=="sBash"||(player.State=="idle"&&player.Stamina>=Exoduser.UnityPort.Core.Combat.ParryRules.ShieldStaminaCost(level)));
        }
        static bool FullRunShieldPress(string state,double distance,double speed) { return state=="idle"&&distance<=110+speed*10; }
        static bool FullRunMagicShieldPress(string state) { return state=="idle"||state=="sRecover"||state=="sBlock"; }
        static bool FullRunRollPress(Simulation sim) { return sim.CanRollNow&&sim.TickCount%2==0; }
        static string FullRunFrameCapture(string current,int capturedFrame,int frame,string captured) { return !string.IsNullOrEmpty(current)?current:capturedFrame>=frame-1&&capturedFrame<=frame?captured:""; }
        static bool FullRunAllocateGrowth(Simulation sim)
        {
            var p=sim.Player;var g=sim.Growth;
            if(p.StatPoints<=0&&p.PassivePoints<=0)return false;
            var plan=g.CreatePlan();
            while(plan.Change("str",1,g,p.StatPoints,p.PassivePoints)){}
            // Ordinary earned points and the same transactional purchase API as the stat panel.
            foreach(var key in new[]{"pFortify","pHuman","pMelee","pParry","pArmor","pRegen"})
                while(plan.Draft.Value(key)<3&&plan.Change(key,1,g,p.StatPoints,p.PassivePoints)){}
            foreach(var key in new[]{"pFortify","pHuman","pMelee","pParry","pArmor","pRegen"})
                while(plan.Change(key,1,g,p.StatPoints,p.PassivePoints)){}
            return sim.ApplyGrowthPlan(plan);
        }
        static InventoryItem FullRunUpgradeItem(InventoryState inventory,int level)
        {
            InventoryItem best=null;int gain=0;
            foreach(var item in inventory.Bag)
            {
                if(item==null||item.slot=="ossuary"||item.reqLv>level)continue;
                int delta=InventoryState.ItemPower(item)-InventoryState.ItemPower(inventory.GetEquipped(item.slot));
                if(delta>gain){gain=delta;best=item;}
            }
            return best;
        }
        static int FullRunAuxSkills(Simulation sim,bool fighting,float nearest)
        {
            var p=sim.Player;if(sim.IceOrbActive||p.Hp<=0)return 0;int flags=0;
            if(sim.Skills.Learned("holyDome")&&sim.HolyDomeCd<=0&&p.Hp<p.MaxHp*.9f)flags|=1;
            if(sim.Skills.Learned("iceOrb")&&sim.IceOrbCd<=0&&p.Mana>=sim.SkillMpCost("iceOrb","iceOrb")&&
               (p.State=="pStun"||(sim.PlayerPoison>1&&p.Hp<p.MaxHp*.7f)||p.Hp<p.MaxHp*.4f))return flags|2;
            if(sim.Skills.Learned("giantSlam")&&sim.Rage>=40&&sim.GiantSlamCd<=0&&fighting&&nearest<500*500&&
               p.Stamina>=sim.SkillStCost("giantSlam","giantSlam")&&sim.CanSpendMalice(Exoduser.UnityPort.Core.Skills.SkillRules.GiantSlamMalice))flags|=4;
            return flags;
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
            var row=new FullRunSample{scene=s.Stage.InArena?"arena":"field",state=p.State,target=target,bossState=state,seconds=Time.realtimeSinceStartup-started,x=p.X,y=p.Y,hp=p.Hp,shield=p.Shield,mana=p.Mana,stamina=p.Stamina,fps=1/Mathf.Max(.0001f,Time.unscaledDeltaTime),sp=p.StatPoints,ap=p.PassivePoints,strength=s.Growth.Value("str"),fortify=s.Growth.Value("pFortify"),human=s.Growth.Value("pHuman"),melee=s.Growth.Value("pMelee"),tick=s.TickCount,kills=s.Kills,level=p.Level,experience=p.Experience,loot=s.Loot.Count,bag=inventory.State.Bag.Count,regions=s.RegionClearedCount(),anglers=s.FieldBossAliveCount(),holes=s.SpawnHoles!=null?s.SpawnHoles.Holes.Count:0,bossHp=b!=null?b.Hp:0,arena=s.Stage.InArena,cleared=s.Stage.StageCleared,gate=s.Stage.BossUnlocked};
            row.maxHp=p.MaxHp;row.maxShield=p.MaxShield;row.maxMana=p.MaxMana;row.maxStamina=p.MaxStamina;row.poison=s.PlayerPoison;row.iceCd=s.IceOrbCd;row.slamCd=s.GiantSlamCd;row.rage=s.Rage;row.iceActive=s.IceOrbActive;row.aimX=fullRunAimX;row.aimY=fullRunAimY;
            row.nearby=new List<FullRunNearby>();
            foreach(var e in s.Enemies){if(!e.Alive||Simulation.IsRemodelProp(e))continue;double dx=e.X-p.X,dy=e.Y-p.Y,dist=Math.Sqrt(dx*dx+dy*dy);if(dist<1300)row.nearby.Add(new FullRunNearby{kind="enemy",id=e.Id,type=e.Etype,hp=e.Hp,x=e.X,y=e.Y,distance=dist,line=FullRunLine(p.X,p.Y,e.X,e.Y)});}
            if(s.FieldBosses!=null)foreach(var a in s.FieldBosses){if(a==null||a.Hp<=0)continue;double dx=a.X-p.X,dy=a.Y-p.Y,dist=Math.Sqrt(dx*dx+dy*dy);if(dist<1300)row.nearby.Add(new FullRunNearby{kind="angler",id=a.Index,hp=a.Hp,x=a.X,y=a.Y,distance=dist,line=FullRunLine(p.X,p.Y,(float)a.X,(float)a.Y)});}
            row.nearby.Sort((a,c)=>a.distance.CompareTo(c.distance));if(row.nearby.Count>5)row.nearby.RemoveRange(5,row.nearby.Count-5);
            if(s.Regions!=null){row.regionKills=new int[4];row.regionTotals=new int[4];for(int i=0;i<4;i++){row.regionKills[i]=s.Regions[i].Kills;row.regionTotals[i]=s.Regions[i].Total;}}
            return row;
        }
        IEnumerator FullRunWaitFrontend(string label,FullRunReceipt receipt)
        {
            float until=Time.realtimeSinceStartup+25;
            while((NativeScreenTransition.Busy||lobby.CinematicEntryPending)&&Time.realtimeSinceStartup<until){lobby.SetPlaybackFocus(true);yield return null;}
            if(NativeScreenTransition.Busy||lobby.CinematicEntryPending)receipt.frontendFailure="timeout:"+label;
            else if(NativeScreenTransition.History!=null&&NativeScreenTransition.History.Count>0){var last=NativeScreenTransition.History[NativeScreenTransition.History.Count-1];if(last.failed||last.cancelled)receipt.frontendFailure=label+":"+last.boundary+":"+last.error;}
            receipt.frontendBoundaries.Add(label);yield return null;
        }
        IEnumerator FullRunClearTransition(string output,Keyboard keyboard,FullRunReceipt receipt)
        {
            InputState.Change(keyboard,new KeyboardState());yield return null;
            if(!stageClear.RequestNext())yield break;
            if(nextDifficulty.Active)
            {
                yield return FullRunShot(output,"clear-difficulty");
                InputState.Change(keyboard,new KeyboardState(Key.Escape));Update();
                receipt.clearModalBlockedBackground=nextDifficulty.Active&&!menu&&!stats.Open&&!forge.Open&&!inventory.Open&&!skills.Open;
                InputState.Change(keyboard,new KeyboardState());yield return null;
                nextDifficulty.Cancel();
                receipt.clearCancelRearmed=stageClear.Active&&!nextDifficulty.Active&&stageClear.RequestNext();
                if(!receipt.clearCancelRearmed)yield break;
                nextDifficulty.Confirm();
            }
            else
            {
                receipt.clearModalNotApplicable=stageClear.ShownKind==NativeStageClearOverlay.Kind.DemoEnd;
                receipt.clearModalBlockedBackground=receipt.clearCancelRearmed=receipt.clearModalNotApplicable;
            }
            yield return FullRunWaitFrontend("clear-lobby",receipt);
            receipt.clearReturnedLobby=string.IsNullOrEmpty(receipt.frontendFailure)&&lobby.IsBlocking&&lobby.Flow.Page==LobbyPage.Lobby&&!Running;
            receipt.clearSaveExists=HasCombatSave(lobby.ActiveCharacterName);
            yield return FullRunShot(output,"clear-lobby");
        }
        IEnumerator FullRunShot(string output,string name)
        {
            bool wide=name=="00-lobby"||name=="combat"||name=="boss-entry"||name=="death"||name=="clear"||name=="clear-difficulty"||name=="clear-lobby";name=fullRunCapturePrefix+name;fullRunCaptureActivity=name;
            yield return new WaitForEndOfFrame();
            fullRunLastCaptureActivity=name;fullRunLastCaptureFrame=Time.frameCount;
            var image=ScreenCapture.CaptureScreenshotAsTexture();
            try{File.WriteAllBytes(Path.Combine(output,"caps",name+".png"),image.EncodeToPNG());File.AppendAllText(Path.Combine(output,"capture-sizes.jsonl"),"{\"name\":\""+name+"\",\"width\":"+image.width+",\"height\":"+image.height+"}\n");}finally{Destroy(image);}
            if(wide)
            {
                int previousWidth=Screen.width,previousHeight=Screen.height;
                foreach(int captureWidth in new[]{2560,3840})
                {
                    if(captureWidth==previousWidth)continue;
                    Screen.SetResolution(captureWidth,1080,FullScreenMode.Windowed);
                    yield return new WaitForSecondsRealtime(.25f);yield return new WaitForEndOfFrame();
                    string captureName=name+"-"+captureWidth;fullRunLastCaptureActivity=captureName;fullRunLastCaptureFrame=Time.frameCount;
                    image=ScreenCapture.CaptureScreenshotAsTexture();
                    try{File.WriteAllBytes(Path.Combine(output,"caps",captureName+".png"),image.EncodeToPNG());File.AppendAllText(Path.Combine(output,"capture-sizes.jsonl"),"{\"name\":\""+captureName+"\",\"width\":"+image.width+",\"height\":"+image.height+"}\n");}finally{Destroy(image);}
                }
                Screen.SetResolution(previousWidth,previousHeight,FullScreenMode.Windowed);
                yield return null;yield return null;
            }
            fullRunCaptureActivity="";
        }
        IEnumerator FullRunEnd(string output,FullRunReceipt receipt,float started)
        {
            WriteCombatStats(output);
            File.WriteAllText(Path.Combine(output,"parry-bot.json"),"{\"opportunities\":"+g2ParryBot.opportunities+",\"attempts\":"+g2ParryBot.attempts+",\"targetInputRate\":0.7}");
            receipt.seconds=Time.realtimeSinceStartup-started;
            fullRunStageEvent=null;
            File.WriteAllText(Path.Combine(output,"fullrun.json"),JsonUtility.ToJson(receipt,true));
            Debug.Log("FULLRUN_RESULT "+receipt.result+" seconds="+receipt.seconds);
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
            NativeLobbyVideo.RequestQuit(receipt.result=="stage-cleared"?0:2);
        }
    }

    // Collision-aware navigation for QA input. A path is sampled against the same host collision callback.
    sealed class FullRunNavigation
    {
        readonly int fieldSide;
        public FullRunNavigation(int fieldSide=210){this.fieldSide=Math.Max(210,fieldSide);}
        readonly List<Vector2> path=new List<Vector2>();Vector2 goal;int nextPlan,probeTick,fineUntil;Vector2 probePosition,probeGoal;
        public Vector2 Direction(float x,float y,float tx,float ty,float radius,Func<float,float,float,bool> canMove,int tick,bool precise=false)
        {
            var from=new Vector2(x,y);var target=new Vector2(tx,ty);
            if(Vector2.Distance(from,target)<12)return Vector2.zero;
            if(tick>=probeTick){if(probeTick>0&&Vector2.Distance(probePosition,from)<40&&Vector2.Distance(probeGoal,target)<100&&Vector2.Distance(from,target)>100){fineUntil=tick+900;nextPlan=0;}probeTick=tick+300;probePosition=from;probeGoal=target;}
            if(tick>=nextPlan||Vector2.Distance(goal,target)>100)
            {
                nextPlan=tick+90;goal=target;path.Clear();
                bool fine=tick<fineUntil;int side=fine?fieldSide*2+1:fieldSide;float cell=fine?20:40;
                int sx=Mathf.Clamp((int)(x/cell),0,side-1),sy=Mathf.Clamp((int)(y/cell),0,side-1),start=sy*side+sx;
                float ox=fine?x-sx*cell:cell*.5f,oy=fine?y-sy*cell:cell*.5f;var previous=new int[side*side];for(int i=0;i<previous.Length;i++)previous[i]=-1;
                var queue=new Queue<int>();queue.Enqueue(start);previous[start]=start;int closest=start;float best=float.MaxValue;
                while(queue.Count>0)
                {
                    int at=queue.Dequeue(),ax=at%side,ay=at/side;var point=new Vector2(ax*cell+ox,ay*cell+oy);
                    float distance=Vector2.SqrMagnitude(point-target);if(distance<best){best=distance;closest=at;}if(distance<(fine?225:900))break;
                    for(int d=0;d<4;d++)
                    {
                        int nx=ax+(d==0?1:d==1?-1:0),ny=ay+(d==2?1:d==3?-1:0);if(nx<0||ny<0||nx>=side||ny>=side)continue;
                        int n=ny*side+nx;if(previous[n]>=0)continue;
                        float px=nx*cell+ox,py=ny*cell+oy;
                        if(!canMove(px,py,radius)||!canMove((point.x+px)/2,(point.y+py)/2,radius))continue;
                        previous[n]=at;queue.Enqueue(n);
                    }
                }
                for(int n=closest;n!=start&&n>=0;n=previous[n])path.Add(new Vector2(n%side*cell+ox,n/side*cell+oy));path.Reverse();
            }
            while(path.Count>0&&Vector2.Distance(from,path[0])<12)path.RemoveAt(0);
            var to=path.Count>0?path[0]:target;var delta=to-from;
            float alignment=precise?1:8;
            var move=new Vector2(Mathf.Abs(delta.x)>alignment?Mathf.Sign(delta.x):0,Mathf.Abs(delta.y)>alignment?Mathf.Sign(delta.y):0);
            if(!canMove(x+move.x*6,y+move.y*6,radius)){nextPlan=0;if(move.x!=0&&canMove(x+move.x*6,y,radius))return new Vector2(move.x,0);if(move.y!=0&&canMove(x,y+move.y*6,radius))return new Vector2(0,move.y);return Vector2.zero;}
            return move;
        }
    }
}
