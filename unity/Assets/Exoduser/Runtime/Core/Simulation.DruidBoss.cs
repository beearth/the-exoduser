using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // BX-01..05 glue: registers the 1-1 dark druid (DruidBoss) behind Stage.BossSpawners / BossTick and gives it the simulation as IBossHost.
    public sealed partial class Simulation
    {
        public DruidBoss Druid;
        public Action AfterEnemyTick;                        // update(): runs after the enemy loop (projectile + hazard updates of the boss)
        public float PlayerPoison, PlayerWebSlow;            // P.poison (DOT stacks) / P._webSlow (frames, halves the walk speed)
        public event Action<string, double, double, double> BossFx;   // presentation hook: (kind, x, y, radius)
        internal double NextBossRandom() { return NextRandom(); }
        float MoveSlowMultiplier { get { return PlayerWebSlow > 0 || PlayerFreezeSlow > 0 || PlayerTrapSlow > 0 ? .5f : 1f; } }

        public void AttachDruidBoss()
        {
            if (Druid != null) return;
            Druid = new DruidBoss(new BossHostAdapter(this)) { ElementMul = el => EnemyHurt.ElMul(el, ArmorElement()) };
            Stage.BossSpawners[0] = SpawnDruid; Stage.BossSpawners[3] = SpawnDruid;
            RegisterRemodelSpawners();   // RM-B0: other stages with a registered remodel set, only while its flag is on
            BossTick = DruidBossTick;
            AfterEnemyTick += TickDruidWorld;
        }

        // mkEn(x, y, si, 0, true, EL.P, 0): the oracle-checked Core builds the boss record (hp / atk / shield / poise / revive points / RNG order); EnemyState mirrors it.
        EnemyState SpawnDruid(Simulation sim, float x, float y)
        {
            var context = new EnemySpawnContext {
                PlayerLevel = Player.Level, DifficultyIndex = Config.DifficultyIndex, StageDiffOffset = 0, Stage = Config.StageIndex,
                DemoMode = Config.DemoMode, DemoLastStage = Config.DemoLastStage,
                CanMove = (cx, cy, cr) => Pass((float)cx, (float)cy, (float)cr), Random = NextRandom
            };
            var web = EnemyFactory.Create(context, x, y, Config.StageIndex, 0, true, 0, 0);
            if (web == null) return null;
            var e = new EnemyState {
                Etype = (int)web.etype, X = (float)web.x, Y = (float)web.y, Radius = (float)web.r,
                Hp = ToIntClamped(web.hp), MaxHp = ToIntClamped(web.mhp), Attack = ToIntClamped(web.atk), BaseAttack = ToIntClamped(web.baseAtk), Level = (int)web.lv,
                Shield = (float)web.eShield, MaxShield = (float)web.eShieldMax, Poise = (float)web.poise, MaxPoise = (float)web.maxPoise,
                Speed = (float)web.speed, Facing = (float)web.facing, StateTicks = (float)web.st2, ProjectileTicks = (float)web.projT,
                Elite = (int)web.elite, Col = web.col, Web = web, IsBoss = true, RevPts = web._revPts, MaxRevPts = web._maxRevPts, State = "idle"
            };
            webOwner[web] = e;
            AddEnemy(e);
            Druid.ClearHazards();
            var rmSet = RemodelSetFor(Config.StageIndex);   // RM-B0: null unless the remodel flag of this stage's set is on
            Druid.Remodel = rmSet != null; if (rmSet != null) Druid.Set = rmSet;
            Druid.Attach(e);
            if (rmSet != null) RemodelAttach(e, rmSet);
            return e;
        }

        void DruidBossTick(EnemyState e)
        {
            if (remodelPropMap.Count > 0 && remodelPropMap.ContainsKey(e)) return;   // RM-B0b: a boss prop has no AI
            if (druidLives.Count > 0 && RemodelPreTick(e)) return;   // RM-B1: kneeling between lives (the table is empty unless a remodel fight is attached)
            if (Druid != null && (Config.StageIndex == 0 || Config.StageIndex == 3 || Druid.Remodel))
            {
                if (druidLives.Count > 0) RemodelTickHead(e);   // RM-B0b: damage scale / obstacle bump (no-op for a set without them)
                Druid.TickBoss(e);
                if (druidLives.Count > 0) RemodelTickTail(e);
            }
            else TickEnemy(e);
        }

        void TickDruidWorld()
        {
            // PlayerWebSlow / poison belong to the player update of the web (33143, 33151)
            if (PlayerWebSlow > 0) PlayerWebSlow--; if (PlayerFreezeSlow > 0) PlayerFreezeSlow--; if (PlayerTrapSlow > 0) PlayerTrapSlow--;
            if (PlayerPoison > 0 && Player.Hp > 0)
            {
                PlayerPoison -= .02f;
                if ((int)Math.Floor(PlayerPoison * 10) % 6 < 1) { int pd = Js.Int(Player.MaxHp * .008); HurtPlayer(pd, new HurtOptions { Dot = true }); }
            }
            if (Druid == null) return;
            TickRemodelRules();   // RM-B0b: ended props leave Enemies, obstacles end with the arena
            if (Druid.Boss != null && !Enemies.Contains(Druid.Boss)) { Druid.ClearHazards(); Druid.Data.Clear(); Druid.Boss = null; }
            Druid.TickWorld(Stage.Enabled && Stage.InArena && Stage.BossAlive);
        }

        // ---- IBossHost ------------------------------------------------------------------------------------------------------------------------------------
        sealed class BossHostAdapter : IBossHost, IBossReflectHost
        {
            readonly Simulation s;
            public BossHostAdapter(Simulation sim) { s = sim; }
            public double Rand() { return s.NextBossRandom(); }
            public int Stage { get { return s.Config.StageIndex; } }
            public double ArenaW { get { return (s.Stage.InArena ? BossArenaLayout.Width : 50) * 40.0; } }
            public double ArenaH { get { return (s.Stage.InArena ? BossArenaLayout.Height : 42) * 40.0; } }
            public double PX { get { return s.Player.X; } set { s.Player.X = (float)value; } }
            public double PY { get { return s.Player.Y; } set { s.Player.Y = (float)value; } }
            public double PRadius { get { return s.Player.Radius; } }
            public double PFacing { get { return s.Player.Facing; } }
            public double PIframes { get { return s.Player.Iframes; } set { s.Player.Iframes = (float)value; } }
            public bool PlayerAlive { get { return s.Player.Hp > 0; } }
            public bool ParryWindowOpen() { return s.Player.Hp > 0 && ParryRules.IsParryWindow(s.Player.State, s.Player.StateTicks, 0, s.SbParryT, s.CapeParry); }
            public bool CanMove(double x, double y, double r) { return s.Pass((float)x, (float)y, (float)r); }
            public bool TileWall(double x, double y) { return s.IsProjectileWall != null && s.IsProjectileWall((float)x, (float)y); }
            public bool IsWall(double x, double y) { return s.IsProjectileWall != null ? s.IsProjectileWall((float)x, (float)y) : !s.Pass((float)x, (float)y, 0); }
            public bool SafePoint(double x, double y, double r, out double ox, out double oy)
            {   // safePt: the spiral of the web (T..5T step T/2, 8 angles)
                if (CanMove(x, y, r)) { ox = x; oy = y; return true; }
                for (double d = 40; d <= 200; d += 20) for (int a = 0; a < 8; a++)
                {
                    double nx = x + Math.Cos(Math.PI / 4 * a) * d, ny = y + Math.Sin(Math.PI / 4 * a) * d;
                    if (CanMove(nx, ny, r)) { ox = nx; oy = ny; return true; }
                }
                ox = x; oy = y; return false;
            }
            // no flow field is ported: the open boss arena is walked in a straight line towards the player (the web field points the same way without obstacles)
            public bool FlowDir(double x, double y, out double dx, out double dy) { double a = Math.Atan2(s.Player.Y - y, s.Player.X - x); dx = Math.Cos(a); dy = Math.Sin(a); return true; }
            public bool Los(double x, double y, double tx, double ty) { return s.HasLineOfSight == null || s.HasLineOfSight((float)x, (float)y, (float)tx, (float)ty); }
            public void HurtPlayer(int damage, bool magic) { s.HurtPlayer(damage, new HurtOptions { Magic = magic }); }
            public void KnockPlayer(double kx, double ky) { s.Player.KnockbackX += (float)kx; s.Player.KnockbackY += (float)ky; }
            public void StopPlayerKnock() { s.Player.KnockbackX = 0; s.Player.KnockbackY = 0; }
            public void PlayerPoison(double stacks, double webSlow) { s.PlayerPoison += (float)stacks; s.PlayerWebSlow = Math.Max(s.PlayerWebSlow, (float)webSlow); }
            public bool TryParry(EnemyState boss, double dmgMul, double stunFrames, double poiseAmt, double knockAngle)
            {
                if (!ParryWindowOpen()) return false;
                bool q = s.Player.State == "sBlock" || s.Player.State == "peaceShield" || s.SbParryT > 0;
                if (boss != null && boss.Alive)
                {
                    if (stunFrames > 0) boss.Stunned = (float)stunFrames;
                    if (dmgMul > 0)
                    {
                        int pd = Js.Int((s.Player.BaseAttack + s.Config.WeaponAttack + s.Config.WeaponEnhanceAttack) * dmgMul * ParryRules.ParryCounterDamageMul(s.PParry));
                        s.HurtEnemy(boss, pd, (float)knockAngle);
                        s.ParryBank += pd;   // P.parryBank += _pd (the counter damage)
                    }
                }
                s.ApplyParrySuccess(q);
                if (boss != null && boss.Alive && poiseAmt > 0 && s.Druid != null) s.Druid.PoiseHit(boss, poiseAmt);
                return true;
            }
            public void BossHurt(EnemyState boss, int damage, double angle) { s.HurtEnemy(boss, damage, (float)angle); }
            public void Text(double x, double y, string ko, string color, int life) { s.HurtText(x, y, ko, ko, color, life); }
            public void Shake(double n) { s.HurtShake(n); }
            public void Fx(string kind, double x, double y, double r) { var h = s.BossFx; if (h != null) h(kind, x, y, r); }
            public void Sound(string key, string source, double x, double y) { s.QueueLogicalSound(key, source, x, y); }
            public EnemyState SpawnMinion(double x, double y, int element, int etype)
            {
                var m = s.SpawnNormalEnemy((float)x, (float)y);
                if (m == null) return null;
                m.Hp = Js.Int(m.Hp * .5); m.MaxHp = m.Hp; m.Shield = 0; m.MaxShield = 0;   // summons are weak: hp x.5, no shield
                return m;
            }
            public void BossMoved(EnemyState boss) { }
            // parry reflection (ParryReflect.cs)
            public Combat.ParryReflect.ResolveInput ReflectInput(double playerDistance) { return s.ReflectInput(playerDistance); }
            public void PayReflectParry(in Combat.ParryReflect.ResolveResult result) { s.PayReflectParry(result); }
            public bool ReflectHoming(Combat.ReflectProjectile p) { return s.ReflectHoming(p); }
            public bool ReflectContact(Combat.ReflectProjectile p) { return s.ReflectContact(p); }
        }
    }
}
