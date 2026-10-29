using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public enum StageEventKind
    {
        GateAnglerBlocked,   // exit tile stepped on while the stage-0 field boss is not done (web 42043)
        GateSealed,          // exit tile stepped on while the Hell Gate is sealed (web 42046-42053); Percent = kill progress
        GateUnlocked,        // Hell Gate opened (web 42027-42032)
        BossCoreMissing,     // gate open but no boss spawner is registered for this stage (Unity extension point, see StageFlow.BossSpawners)
        ArenaLoadStart,      // fade-out begins (web 42055-42058)
        ArenaEntered,        // _enterBossArena finished: tiles/player/boss placed (web 30887-30952)
        BossIntro,           // load phase 4 first tick: boss stunned 90 / revive iframes 110, howl, flash (web 41938-41952)
        BossDefeated,        // arena boss gone: bossAlive=false, clear time snapshot (web 41969-41981)
        ChestSpawned,        // web pushes a treasure chest at the arena centre (chest pickup is not ported)
        ExitOpened,          // arena exit tiles opened (web 41983-41994)
        StageCleared,        // exit stepped on after the boss: +10 SP, stage-clear panel (web 42062-42147)
        FieldRestored,       // death retry inside the arena: back to the field gate (web retryBtn 63627-63657)
        GateGuardDefeated,   // the Hell Gate guardian died: +10 % clear progress, gate released (web 42945-42950)
        RegionCleared,       // one of the four regions reached its clear condition (web _regionCheckClears 61032); Percent = regions cleared so far
        AnglerWoke,          // the first 심연의 앵글러 woke (showPH '심연의 앵글러', web 61338); Percent = its element
        AnglerSlain          // an angler died (showPH '필드보스 처치!', web 18890); Percent = its element
    }

    public sealed class StageEvent
    {
        public StageEventKind Kind; public int Tick, Percent; public float X, Y; public int Stage;
        public bool Regions;   // GateSealed: Percent is the number of cleared regions (of 4), not a kill percentage
    }

    public delegate EnemyState BossSpawner(Simulation sim, float x, float y);

    /// <summary>
    /// C07: the 1-1 progress flow of game.html checkRooms (41909-42153) around the boss arena: exit tile -> Hell Gate check -> fade/name-card/fade-in/intro
    /// (genBossArena + _enterBossArena) -> boss alive check every 30 frames -> exit opens -> stepping on it clears the stage. One Tick = one web frame (dtSp 1).
    /// The boss itself is a plug-in: nothing here knows the druid. A boss Core registers <see cref="BossSpawners"/> (stage index -> spawner) and, for a
    /// custom AI, <see cref="Simulation.BossTick"/>. Disabled until <see cref="Enabled"/> is set, so the other oracles/fixtures never see it.
    /// </summary>
    public sealed class StageFlow
    {
        public const int T = BossArenaLayout.TileSize;
        private readonly Simulation sim;
        public StageFlow(Simulation simulation) { sim = simulation; }

        public bool Enabled;
        public readonly Dictionary<int, BossSpawner> BossSpawners = new Dictionary<int, BossSpawner>();
        public readonly Queue<StageEvent> Events = new Queue<StageEvent>();

        // field map (the original exit tile 2 / gate tile 3 positions come from the map data)
        public struct Tile { public int X, Y; public Tile(int x, int y) { X = x; Y = y; } }
        public readonly List<Tile> Exits = new List<Tile>();
        private readonly List<Tile> fieldExits = new List<Tile>();
        private int fieldBossCx = 100, fieldGateY = 5;
        public bool HasFieldGate;          // the map has boss gate tiles (web G.bossGate.length > 0 && G._gateY != null)
        public EnemyState GateGuard;       // G._gateGuard: the sub-boss standing 3 tiles below the gate (null after it died)

        // G._bossArena / bossAlive / _bossUnlocked / stageCleared / _bossLoadPhase / _bossLoadT / _bossLoadFade / _crT
        public bool InArena, BossAlive = true, BossUnlocked, StageCleared;
        public bool FieldBossDone;         // G._fbDone (stage-0 abyssal angler): not ported, the host decides
        public bool GateGuardKilled;       // G._gateGuardKilled (+10% progress)
        public int LoadPhase; public double LoadT, LoadFade;
        public int CheckT, HeavyRuns;   // HeavyRuns: how often the 30-frame block ran (oracle)
        public int FieldGateCx { get { return fieldBossCx; } }
        public int FieldGateY { get { return fieldGateY; } }
        public int TotalSpawned;           // G._totalSpawned; counted by Simulation.SpawnNormalEnemy
        public int SurvivorKills;          // G._stageKills part added by _enterBossArena (field survivors vanish = counted as kills)
        public int BossClearSeconds;       // G._bossClearT snapshot at boss death
        public BossArenaLayout Arena;
        public EnemyState Boss;            // G._bossRef

        // G._stageKills: initStage (31750) sets it to 0 while G.kills runs on through the save, and every web kill site raises both (34557 34623 37623 39872 40231
        // 40620 42702 42901), so it is the kills since InitializeField (the Unity initStage hook, after the save restored Kills) plus the arena survivors (30940).
        public int StageKills { get { return sim.Kills - killsAtFieldStart + SurvivorKills; } }
        private int killsAtFieldStart;

        private Func<float, float, float, bool> fieldCanMove; private Func<float, float, float, float, bool> fieldLos; private Func<float, float, bool> fieldWall;

        // The map data owner calls this once with the 200x200 original tiles: tile 2 = exit (gate approach), tile 3 = boss gate.
        public void InitializeField(int[] tiles, int width)
        {
            Exits.Clear(); fieldExits.Clear();
            int gMinX = int.MaxValue, gMaxX = -1, gY = -1;
            for (int i = 0; i < tiles.Length; i++)
            {
                if (tiles[i] == 2) { fieldExits.Add(new Tile(i % width, i / width)); }
                else if (tiles[i] == 3) { gMinX = Math.Min(gMinX, i % width); gMaxX = Math.Max(gMaxX, i % width); gY = i / width; }
            }
            HasFieldGate = gY >= 0; GateGuard = null; GateGuardKilled = false;
            if (gY >= 0) { fieldBossCx = (gMinX + gMaxX) / 2; fieldGateY = gY; }
            Exits.AddRange(fieldExits);
            InArena = false; BossAlive = true; BossUnlocked = false; StageCleared = false; LoadPhase = 0; LoadT = 0; LoadFade = 0; CheckT = 0; SurvivorKills = 0; killsAtFieldStart = sim.Kills; Arena = null; Boss = null;
        }

        private void Raise(StageEventKind kind, float x = 0, float y = 0, int percent = 0, bool regions = false)
        {
            Events.Enqueue(new StageEvent { Kind = kind, Tick = sim.TickCount, X = x, Y = y, Percent = percent, Regions = regions, Stage = sim.Config.StageIndex });
        }

        public void RaiseRegionCleared(int region, int clearedCount) { Raise(StageEventKind.RegionCleared, 0, 0, clearedCount); }
        public void RaiseAngler(StageEventKind kind, float x, float y, int element) { Raise(kind, x, y, element); }

        public EnemyState FindBoss()
        {
            if (Boss != null && Boss.Alive) return Boss;
            foreach (var e in sim.Enemies) if (e != null && e.Alive && e.IsBoss) { Boss = e; return e; }
            return null;
        }

        // Force the Hell Gate open (harness / debug). Not used by the normal flow.
        public void ForceUnlock() { BossUnlocked = true; }

        public void Tick()
        {
            if (!Enabled) return;
            CheckRooms();
        }

        private void CheckRooms()
        {
            var p = sim.Player;
            if (LoadPhase > 0)
            {
                p.State = "idle"; p.StateTicks = 0;
                LoadT += 1;
                if (LoadPhase == 1)
                {
                    LoadFade = Math.Min(1.0, LoadT / 50.0);
                    if (LoadFade >= 1) { LoadPhase = 2; LoadT = 0; EnterArena(); }
                }
                else if (LoadPhase == 2)
                {
                    LoadFade = 1;
                    if (LoadT >= 130) { LoadPhase = 3; LoadT = 0; }
                }
                else if (LoadPhase == 3)
                {
                    LoadFade = Math.Max(0.0, 1 - LoadT / 50.0);
                    if (LoadFade <= 0) { LoadPhase = 4; LoadT = 0; LoadFade = 0; }
                }
                else if (LoadPhase == 4)
                {
                    if (LoadT < 2)
                    {
                        var b = FindBoss();
                        if (b != null) { b.Stunned = 90; b.ReviveIframes = 110; Raise(StageEventKind.BossIntro, b.X, b.Y); sim.ScheduleDruidIntroSounds(); }
                    }
                    if (LoadT >= 100) { LoadPhase = 0; LoadT = 0; LoadFade = 0; }
                }
            }
            // heavy logic every 30 frames only (web _crT)
            CheckT++;
            if (CheckT < 30) return;
            CheckT = 0; HeavyRuns++;

            if (BossAlive && InArena)
            {
                bool live = FindBoss() != null;
                if (!live) foreach (var e in sim.Enemies) if (e.IsBoss && e.ReviveTimer > 0) { live = true; break; }   // a boss waiting to revive still counts as alive
                if (!live) OnBossDefeated();
            }

            if (!InArena && BossAlive && !BossUnlocked)
            {
                // web 42069-42094: with regions the gate opens on 4/4 cleared regions (+ the stage-0 angler flag); the global 80 % rule is the region-less fallback
                int tot = TotalSpawned; bool krakenOk = sim.Config.StageIndex != 0 || FieldBossDone;
                if (sim.Regions != null)
                {
                    if (krakenOk && sim.RegionClearedCount() >= 4) { BossUnlocked = true; Raise(StageEventKind.GateUnlocked, p.X, p.Y); }
                }
                else if (tot <= 0) { if (krakenOk) BossUnlocked = true; }
                else
                {
                    double gk = GateGuardKilled ? 0.10 : 0;
                    if (krakenOk && (double)StageKills / tot + gk >= 0.8) { BossUnlocked = true; Raise(StageEventKind.GateUnlocked, p.X, p.Y); }
                }
            }

            if (!StageCleared && Exits.Count > 0 && LoadPhase <= 0)
            {
                int ptx = (int)(p.X / T), pty = (int)(p.Y / T);
                foreach (var ex in Exits)
                {
                    if (ptx != ex.X || pty != ex.Y) continue;
                    if (BossAlive && !InArena)
                    {
                        if (sim.Config.StageIndex == 0 && !FieldBossDone) { if (sim.TickCount % 45 == 0) Raise(StageEventKind.GateAnglerBlocked, p.X, p.Y); break; }
                        if (!BossUnlocked)
                        {
                            if (sim.TickCount % 45 == 0)
                            {
                                if (sim.Regions != null) Raise(StageEventKind.GateSealed, p.X, p.Y, sim.RegionClearedCount(), true);   // web 42106: "지옥문이 봉인됨 — 지역 클리어 N/4"
                                else
                                {
                                    int total = Math.Max(1, TotalSpawned), pct = Math.Min(100, (int)((double)StageKills / total * 100) + (GateGuardKilled ? 10 : 0));
                                    Raise(StageEventKind.GateSealed, p.X, p.Y, pct);
                                }
                            }
                            break;
                        }
                        if (!BossSpawners.ContainsKey(sim.Config.StageIndex)) { if (sim.TickCount % 45 == 0) Raise(StageEventKind.BossCoreMissing, p.X, p.Y); break; }
                        LoadPhase = 1; LoadT = 0; LoadFade = 0;
                        Raise(StageEventKind.ArenaLoadStart, p.X, p.Y);
                        break;
                    }
                    if (!BossAlive)
                    {
                        StageCleared = true; p.StatPoints += 10;   // P.sp+=10
                        Raise(StageEventKind.StageCleared, p.X, p.Y);
                        break;
                    }
                }
            }
        }

        // _enterBossArena (30887-30952), first entry (retry=false)
        private void EnterArena()
        {
            var p = sim.Player; int stage = sim.Config.StageIndex;
            int survivors = 0; foreach (var e in sim.Enemies) if (e.Alive && !e.IsBoss) survivors++;
            SurvivorKills += survivors;
            sim.Enemies.Clear(); sim.Loot.Clear();
            foreach (var pr in sim.Projectiles) pr.Active = false;
            Arena = BossArenaLayout.Generate(stage);
            fieldCanMove = sim.CanMove; fieldLos = sim.HasLineOfSight; fieldWall = sim.IsProjectileWall;
            var arena = Arena;
            sim.CanMove = arena.CanMove; sim.HasLineOfSight = arena.LineOfSight; sim.IsProjectileWall = arena.Blocked;
            InArena = true; Exits.Clear();
            p.X = (arena.EntryX + .5f) * T; p.Y = (arena.EntryY + .5f) * T;
            p.State = "idle"; p.Iframes = 90; p.KnockbackX = 0; p.KnockbackY = 0;
            BossAlive = true; Boss = null; CheckT = 0;
            BossSpawner spawner;
            if (BossSpawners.TryGetValue(stage, out spawner))
            {
                var boss = spawner(sim, (arena.BossX + .5f) * T, (arena.BossY + .5f) * T);
                if (boss != null) { boss.IsBoss = true; Boss = boss; }
            }
            Raise(StageEventKind.ArenaEntered, p.X, p.Y);
        }

        // web 42945-42950: e._isGateGuard died -> G._gateGuard=null, G._gateGuardKilled=true (+10 % progress weight)
        public void OnGateGuardKilled(EnemyState guard)
        {
            GateGuard = null; GateGuardKilled = true;
            Raise(StageEventKind.GateGuardDefeated, guard.X, guard.Y);
        }

        private void OnBossDefeated()
        {
            var p = sim.Player; var arena = Arena;
            BossAlive = false; BossClearSeconds = sim.TickCount / 60;
            Raise(StageEventKind.BossDefeated, p.X, p.Y);
            Raise(StageEventKind.ChestSpawned, (arena.RoomCx + .5f) * T, (arena.RoomCy + .5f) * T);
            int ex = arena.ExitX, ey = arena.ExitY;
            if (ey >= 0 && ey < BossArenaLayout.Height && ex >= 0 && ex < BossArenaLayout.Width)
            {
                arena.Tiles[ey * BossArenaLayout.Width + ex] = 0;
                if (ex > 0 && arena.Tiles[ey * BossArenaLayout.Width + ex - 1] == 1) arena.Tiles[ey * BossArenaLayout.Width + ex - 1] = 0;
                if (ex < BossArenaLayout.Width - 1 && arena.Tiles[ey * BossArenaLayout.Width + ex + 1] == 1) arena.Tiles[ey * BossArenaLayout.Width + ex + 1] = 0;
            }
            Exits.Add(new Tile(ex, ey));
            Raise(StageEventKind.ExitOpened, (ex + .5f) * T, (ey + .5f) * T);
        }

        // Death retry inside the arena (web retryBtn 63627-63657): the field comes back, the player stands at the gate entrance, the boss gate is sealed again.
        public void LeaveArenaToField()
        {
            if (!InArena) return;
            var p = sim.Player;
            sim.Enemies.Clear(); sim.Loot.Clear(); foreach (var pr in sim.Projectiles) pr.Active = false;
            sim.CanMove = fieldCanMove; sim.HasLineOfSight = fieldLos; sim.IsProjectileWall = fieldWall;
            InArena = false; Arena = null; Boss = null; BossAlive = true; StageCleared = false; LoadPhase = 0; LoadT = 0; LoadFade = 0; CheckT = 0;
            Exits.Clear(); Exits.AddRange(fieldExits);
            float gx = (fieldBossCx + .5f) * T, gy = (fieldGateY + 6 + .5f) * T;
            p.X = gx; p.Y = gy;
            if (sim.CanMove != null && !sim.CanMove(gx, gy, p.Radius))
            {
                for (float d = 40; d <= 200; d += 20) for (int j = 0; j < 8; j++)
                {
                    double a = Math.PI / 4 * j; float nx = gx + (float)Math.Cos(a) * d, ny = gy + (float)Math.Sin(a) * d;
                    if (sim.CanMove(nx, ny, p.Radius)) { p.X = nx; p.Y = ny; d = 1000; break; }
                }
            }
            Raise(StageEventKind.FieldRestored, p.X, p.Y);
        }
    }

    public sealed partial class Simulation
    {
        private StageFlow stageFlow;
        public StageFlow Stage { get { return stageFlow ?? (stageFlow = new StageFlow(this)); } }
        // Boss extension point: a boss Core with its own AI replaces the generic enemy tick for IsBoss enemies.
        public Action<EnemyState> BossTick;
        // Adds a fully built enemy (boss actors) to the run; the Id is assigned here.
        public EnemyState AddEnemy(EnemyState enemy)
        {
            if (enemy == null) throw new ArgumentNullException(nameof(enemy));
            enemy.Id = nextEnemyId++; Enemies.Add(enemy); return enemy;
        }
    }
}
