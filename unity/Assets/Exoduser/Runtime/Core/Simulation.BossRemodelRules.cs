using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B0b: the common rules the boss remakes RM-B2..B4 need on top of RM-B0. Spec: docs/engine/UNITY_BOSS_RM0_REMODEL_FRAMEWORK_20261028.md §8.
    //   1 props      boss-owned things the player breaks with any damage (RM-B2 sprouts, RM-B4 cord knots): an EnemyState in Enemies (every player attack already
    //                hits Enemies) with IsBoss = true (so the field enemy AI skips it) and no AI of its own; HP 0 = gone without rewards (BossRemodelHooks.PropBroken)
    //   2 damage     BossRemodelHooks.DamageScale: < 1 scales the boss damage taken (web _aDefM), <= 0 blocks it (revive iframes, hits counted in the "blocked" event)
    //   3 death      BossRemodelSet.FinalTicks / DyingTick (a death sequence before the kill), Sink per set (si3 druid does not sink), props end with the boss
    //   4 obstacles  BossRemodelSet.Obstacles: block movement and shots through the arena's CanMove / IsProjectileWall; the boss AI bumping into one -> ObstacleHit
    //   5 lines      the web line keys (BossLines): "intro"+si at the start, "sink"+si or "die"+si at the end, once per fight -> BossLineRaised / BossLineLog
    //   6 floor      BossRemodelSet.CollapseVulnerable / CollapseHpFloor: damage during the change of life comes off the next life, down to a floor
    // Nothing here runs unless a remodel fight is attached (druidLives not empty), and the RM-B1 druid set uses none of it but the lines.
    public sealed partial class Simulation
    {
        public sealed class RemodelProp
        {
            public string Kind; public int Index; public object Tag;
            public EnemyState Body;                 // the hit target (Body.Hp / Body.MaxHp = what is left)
            public bool Alive = true;
            public int SpawnTick, EndTick = -1; public string EndReason;   // "broken" (player), "final" (boss died), or what the boss file passed to EndRemodelProp
            public double X { get { return Body.X; } }
            public double Y { get { return Body.Y; } }
            public double R { get { return Body.Radius; } }
        }

        public sealed class RemodelObstacle
        {
            public RemodelObstacleDef Def; public double X, Y, R; public bool BlocksMove, BlocksShots; public int BossBumps;
        }

        readonly List<RemodelProp> remodelProps = new List<RemodelProp>();
        readonly Dictionary<EnemyState, RemodelProp> remodelPropMap = new Dictionary<EnemyState, RemodelProp>();
        readonly List<EnemyState> remodelPropRemove = new List<EnemyState>();
        public IReadOnlyList<RemodelProp> RemodelProps { get { return remodelProps; } }   // read-only for the presentation: position, HP, alive, end reason
        public bool IsRemodelProp(EnemyState e) { return e != null && remodelPropMap.ContainsKey(e); }   // the presentation draws these itself (not as enemies)

        public readonly List<RemodelObstacle> RemodelObstacles = new List<RemodelObstacle>();
        public readonly List<string> BossLineLog = new List<string>();
        public event Action<string> BossLineRaised;                                        // web _bossLine(key): the presentation shows _BOSS_LINES[key]
        readonly HashSet<string> bossLinesSeen = new HashSet<string>();

        // ---- 1 props ---------------------------------------------------------------------------------------------------------------------------------------
        // A boss file spawns it (sprout, knot ...). hp = hits it survives when every hit does at least 1.
        public RemodelProp SpawnRemodelProp(string kind, double x, double y, double r, int hp = 1, object tag = null)
        {
            var boss = Druid != null ? Druid.Boss : null;
            var body = new EnemyState { Etype = boss != null ? boss.Etype : 0, X = (float)x, Y = (float)y, Radius = (float)r, Hp = Math.Max(1, hp), MaxHp = Math.Max(1, hp),
                Level = boss != null ? boss.Level : Player.Level, IsBoss = true, State = "rmProp", Col = "prop", HasHome = true, HomeX = x, HomeY = y };
            AddEnemy(body);
            var p = new RemodelProp { Kind = kind, Index = remodelProps.Count, Tag = tag, Body = body, SpawnTick = TickCount };
            remodelProps.Add(p); remodelPropMap[body] = p;
            return p;
        }

        // harvest, absorb, wither ... (the boss file's own reasons). The body leaves Enemies after the enemy loop.
        public void EndRemodelProp(RemodelProp p, string reason)
        {
            if (p == null || !p.Alive) return;
            p.Alive = false; p.EndReason = reason; p.EndTick = TickCount;
            p.Body.Alive = false; p.Body.Hp = 0;
            remodelPropRemove.Add(p.Body);
        }

        void EndAllRemodelProps(string reason) { foreach (var p in remodelProps) EndRemodelProp(p, reason); }

        // OnEnemyZeroHp: a prop dies without revive / rewards / kill count
        bool RemodelPropZeroHp(EnemyState e)
        {
            RemodelProp p;
            if (!remodelPropMap.TryGetValue(e, out p)) return false;
            if (!p.Alive) { e.Hp = 0; return true; }
            EndRemodelProp(p, "broken");
            var set = ActiveRemodelSet; var h = set != null ? set.Hooks.PropBroken : null;
            if (h != null) h(this, p);
            return true;
        }

        // AfterEnemyTick: drop the ended bodies (never inside a loop over Enemies)
        void FlushRemodelProps()
        {
            if (remodelPropRemove.Count == 0) return;
            foreach (var b in remodelPropRemove) Enemies.Remove(b);
            remodelPropRemove.Clear();
        }

        void ClearRemodelProps()
        {
            foreach (var p in remodelProps) if (Enemies.Contains(p.Body)) Enemies.Remove(p.Body);
            remodelProps.Clear(); remodelPropMap.Clear(); remodelPropRemove.Clear();
        }

        // ---- 2 damage scale / block ------------------------------------------------------------------------------------------------------------------------
        // before DruidBoss.TickBoss, while a life runs. EnemyHurt takes 1 off reviveIframes per swallowed hit; the enemy loop takes 1 more per tick.
        void RemodelTickHead(EnemyState e)
        {
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st) || st.Done) return;
            if (RemodelObstacles.Count > 0) { InstallObstacleBlock(); obstacleProbe = true; obstacleBumped = null; }
            var h = st.Set.Hooks.DamageScale;
            if (h == null) return;
            if (st.Blocking)
            {
                int hits = (int)Math.Round(st.BlockMark - 1 - e.ReviveIframes); if (hits < 0) hits = 0;
                if (hits > 0) { st.BlockedHits += hits; RemodelEvent("blocked", e, st, hits + " hit(s)"); }
            }
            double sc = h(this, e, st); st.DamageScale = sc;
            if (sc <= 0) { st.Blocking = true; e.ReviveIframes = 90; if (e.Web != null) e.Web._aDefM = 1e-9; }
            else
            {
                if (st.Blocking) { st.Blocking = false; e.ReviveIframes = 0; }
                if (e.Web != null) e.Web._aDefM = sc < 1 ? (double?)sc : null;
            }
        }

        // after DruidBoss.TickBoss
        void RemodelTickTail(EnemyState e)
        {
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st)) return;
            if (st.Blocking) st.BlockMark = e.ReviveIframes;
            if (!obstacleProbe) return;
            obstacleProbe = false;
            var o = obstacleBumped; obstacleBumped = null;
            if (o == null) return;
            o.BossBumps++;
            var h = st.Set.Hooks.ObstacleHit; DruidData d;
            if (h != null && Druid.Data.TryGetValue(e, out d)) h(Druid, e, d, o);
        }

        // ---- 4 obstacles -----------------------------------------------------------------------------------------------------------------------------------
        Func<float, float, float, bool> obstacleMoveInner, obstacleMoveFn;
        Func<float, float, bool> obstacleShotInner, obstacleShotFn;
        bool obstacleProbe; RemodelObstacle obstacleBumped;

        void PlaceRemodelObstacles(BossRemodelSet set)
        {
            RemodelObstacles.Clear();
            foreach (var o in set.Obstacles) RemodelObstacles.Add(new RemodelObstacle { Def = o, X = o.X, Y = o.Y, R = o.R, BlocksMove = o.BlocksMove, BlocksShots = o.BlocksShots });
            if (RemodelObstacles.Count > 0) InstallObstacleBlock();
        }

        RemodelObstacle ObstacleAt(double x, double y, double r, bool move)
        {
            foreach (var o in RemodelObstacles)
            {
                if (move ? !o.BlocksMove : !o.BlocksShots) continue;
                double dx = x - o.X, dy = y - o.Y, rr = o.R + r;
                if (dx * dx + dy * dy < rr * rr) return o;
            }
            return null;
        }

        // wraps the arena's CanMove / IsProjectileWall (StageFlow puts the arena ones in on entry and the field ones back on exit, which drops the wrap)
        void InstallObstacleBlock()
        {
            if (obstacleMoveFn == null)
            {
                obstacleMoveFn = (x, y, r) =>
                {
                    if (obstacleMoveInner != null && !obstacleMoveInner(x, y, r)) return false;
                    var o = ObstacleAt(x, y, r, true); if (o == null) return true;
                    if (obstacleProbe && obstacleBumped == null) obstacleBumped = o;
                    return false;
                };
                obstacleShotFn = (x, y) =>
                {
                    bool wall = obstacleShotInner != null ? obstacleShotInner(x, y) : (obstacleMoveInner != null && !obstacleMoveInner(x, y, 0));
                    return wall || ObstacleAt(x, y, 0, false) != null;
                };
            }
            if (CanMove != obstacleMoveFn) { obstacleMoveInner = CanMove; CanMove = obstacleMoveFn; }
            if (IsProjectileWall != obstacleShotFn) { obstacleShotInner = IsProjectileWall; IsProjectileWall = obstacleShotFn; }
        }

        // ---- 6 change of life that takes damage ------------------------------------------------------------------------------------------------------------
        // every tick of a CollapseVulnerable change of life (RemodelPreTick): the damage of the last tick comes off the pool, never below the floor
        void RemodelVulnerableTick(EnemyState e, DruidLifeState st)
        {
            if (st.WasVulnerable) st.Pool = Math.Max(st.FloorHp, e.Hp);
            RemodelHook(st.Set.Hooks.CollapseTick, e, st);              // may switch st.Vulnerable (a leap is invulnerable, the grief is not)
            e.Shield = 0; e.KnockbackX = 0; e.KnockbackY = 0; e.HitStun = 0; e.Stunned = 0;   // no knock-back or stagger while down
            if (st.Vulnerable) { e.MaxHp = st.NextMaxHp; e.Hp = (int)Math.Round(st.Pool); e.ReviveIframes = 0; }
            else { e.Hp = 1; e.ReviveIframes = 90; }
            st.WasVulnerable = st.Vulnerable;
            if (--st.CollapseTicks > 0) return;
            RemodelNextLife(e, st);
        }

        // ---- 5 lines ---------------------------------------------------------------------------------------------------------------------------------------
        void RemodelLine(string key)
        {
            if (!BossLines.Keys.Contains(key) || !bossLinesSeen.Add(key)) return;
            BossLineLog.Add(key);
            var h = BossLineRaised; if (h != null) h(key);
        }

        // ---- fight start / end (Simulation.DruidRemodel) ----------------------------------------------------------------------------------------------------
        void RemodelRulesAttach(BossRemodelSet set)
        {
            ClearRemodelProps(); bossLinesSeen.Clear(); BossLineLog.Clear();
            PlaceRemodelObstacles(set);
            RemodelLine("intro" + Config.StageIndex);
        }

        // the last life is over (after the death sequence): event, hook, props, line, then the common kill (rewards, StageFlow exit)
        void RemodelFinal(EnemyState e, DruidLifeState st)
        {
            st.Done = true; st.Dying = false; e.Hp = 0; e.Shield = 0; if (st.Set.Sink) e.SinkDruid = true;   // STY-D9: the last fall is the sink, then the common kill
            RemodelEvent("final", e, st, st.Set.Sink ? "sink" : "kill");
            RemodelHook(st.Set.Hooks.OnFinal, e, st);
            EndAllRemodelProps("final");
            RemodelLine((st.Set.Sink ? "sink" : "die") + Config.StageIndex);
            if (st.Set.Sink && Config.StageIndex == 0) QueueLogicalSound("druid_sink", "third fall: sink escape", e.X, e.Y);   // RM-1 sound SND-09 (1-1 druid)
            KillEnemy(e);
        }

        // AfterEnemyTick (TickDruidWorld)
        void TickRemodelRules()
        {
            FlushRemodelProps();
            if (RemodelObstacles.Count > 0 && !Stage.InArena) RemodelObstacles.Clear();
        }
    }
}
