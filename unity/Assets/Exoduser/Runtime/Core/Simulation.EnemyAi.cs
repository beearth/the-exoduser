using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // C01-AI: the web enemy loop (L1 = EnemyTick.Step) + updateE (U1 head + the 1-1 body = EnemyAi) driven from Simulation.
    // EnemyState keeps the fields the rest of the port reads; the loop works on EnemyState.Web (the web-shaped object), synced both ways around the loop.
    public sealed partial class Simulation
    {
        sealed class ShotWarning { public EnemySpawn Owner; public double T = 60; public bool Dead; public double X, Y; public readonly List<ProjSpec> Shots = new List<ProjSpec>(); }
        public sealed class FieldZone { public string Kind; public double X, Y, Life, R, Dmg, El; }

        public float PlayerFreezeSlow;                              // P._freezeSlow (frames, halves the walk like _webSlow)
        public readonly List<FieldZone> FieldZones = new List<FieldZone>();   // trap / iceZone / blizzard bullets (zero-speed projectiles of the web): TickFieldZones is their projectile-loop half
        public float PlayerTrapSlow;                                // P._trapSlowT (frames, halves the walk like _webSlow)
        bool inEnemyLoop;                                           // true while the L1 loop runs: hurtE then works on the live web objects, no state -> web copy
        public int ShotsFired, EnemySummons;                         // counters for the oracle / QA
        public event Action<string> EnemySfx;                        // charge / groggy / magic ... (presentation hook)

        readonly List<EnemySpawn> webEns = new List<EnemySpawn>();
        readonly List<ShotWarning> shotWarnings = new List<ShotWarning>();
        EnemyTickContext tickCtx; EnemyTickFrame tickFrame; AiHost aiHost; double tickMs;

        void EnsureEnemyLoop()
        {
            if (tickCtx != null) return;
            aiHost = new AiHost(this);
            tickCtx = new EnemyTickContext {
                Random = NextRandom, Now = () => tickMs, Map = new int[1][] { new int[1] }, MapWidth = 1, MapHeight = 1,
                CanMove = (x, y, r) => Pass((float)x, (float)y, (float)r), CanMoveTile = (x, y, r) => true,
                IsWall = (x, y, f) => IsProjectileWall != null ? IsProjectileWall((float)x, (float)y) : !Pass((float)x, (float)y, 0),
                HasLos = (a, b, c, d) => HasLineOfSight == null || HasLineOfSight((float)a, (float)b, (float)c, (float)d),
                WallStuck = (x, y) => false, PushOutWall = w => { }, PushOutsideBonfire = (w, bf, c) => { }, BonfireClearance = w => w.r * 1.5 + 2,
                FlowMove = FlowMove, HurtEnemy = (w, dmg) => { EnemyState o; if (webOwner.TryGetValue(w, out o)) ApplyEnemyDamage(o, (int)dmg, 0, false, 1); }, CancelProjCharge = w => { w._projChargeT = 0; w._projChargeCol = null; w._projChargeBean = null; w._projChargeParryClass = null; },
                RollDrop = w => { EnemyState o; if (webOwner.TryGetValue(w, out o)) RollNormalEquipment(o); }, AddExp = n => AddExperience((int)n),
                RegKill = w => { EnemyState o; if (webOwner.TryGetValue(w, out o)) { Kills++; o.Hp = 0; o.Alive = false; RegKill(o); } },   // EnemyTick 34625 (stuck in a wall): rollDrop(e); addExp(e.exp||1); G.kills++; _stageKills++; _regKill(e) — no hurtE death part (O-1: not KillEnemy)
                 BossReviveGrandVfx = (w, r) => { }, UpdateE = UpdateEnemyBody,
                Translate = s => s, AddText = (x, y, t, c, l) => { }, AddParts = (x, y, c, n) => { }, Block = () => { }, Shake = n => { }, PlaySample = (n, v, r) => { }, RandomRate = (a, b) => a + b * .5,
                Stage = 0, DemoLastStage = Config.DemoLastStage, DemoMode = Config.DemoMode
            };
        }

        // _ffMoveE(e, sp, mul) without a flow field (_ffDir null): last direction or straight to the player, axis slide, 8-way detour, 16-way smaller-radius detour
        void FlowMove(EnemySpawn e, double sp, double mul)
        {
            double dx, dy;
            if (e._lastFdx.HasValue) { dx = e._lastFdx.Value; dy = e._lastFdy.Value; }
            else { double a = JsMath.Atan2(Player.Y - e.y, Player.X - e.x); dx = JsMath.Cos(a); dy = JsMath.Sin(a); }
            double s = e.speed * (e._aSpdM ?? 1) * sp * (mul != 0 ? mul : 1), nx = e.x + dx * s, ny = e.y + dy * s;
            Func<double, double, double, bool> can = (x, y, r) => Pass((float)x, (float)y, (float)r);
            if (can(nx, ny, e.r)) { e.x = nx; e.y = ny; e._stuckT = 0; }
            else if (can(nx, e.y, e.r)) { e.x = nx; e._lastFdx = dx; e._lastFdy = 0; e._stuckT = 0; }
            else if (can(e.x, ny, e.r)) { e.y = ny; e._lastFdx = 0; e._lastFdy = dy; e._stuckT = 0; }
            else
            {
                e._stuckT = (e._stuckT ?? 0) + sp;
                double esc = JsMath.Atan2(dy, dx), escSpd = s * .8; bool escaped = false;
                for (int i = 1; i <= 4 && !escaped; i++)
                {
                    double a1 = esc + i * Math.PI / 4, a2 = esc - i * Math.PI / 4, x1 = e.x + JsMath.Cos(a1) * escSpd, y1 = e.y + JsMath.Sin(a1) * escSpd;
                    if (can(x1, y1, e.r)) { e.x = x1; e.y = y1; e._lastFdx = JsMath.Cos(a1); e._lastFdy = JsMath.Sin(a1); escaped = true; }
                    else { double x2 = e.x + JsMath.Cos(a2) * escSpd, y2 = e.y + JsMath.Sin(a2) * escSpd; if (can(x2, y2, e.r)) { e.x = x2; e.y = y2; e._lastFdx = JsMath.Cos(a2); e._lastFdy = JsMath.Sin(a2); escaped = true; } }
                }
                if (!escaped && e._stuckT > 30)
                {
                    double sr = Math.Max(2, e.r - 2);
                    for (int i = 1; i <= 8 && !escaped; i++)
                    {
                        double a3 = esc + i * Math.PI / 8, a4 = esc - i * Math.PI / 8, x3 = e.x + JsMath.Cos(a3) * escSpd, y3 = e.y + JsMath.Sin(a3) * escSpd;
                        if (can(x3, y3, sr)) { e.x = x3; e.y = y3; e._lastFdx = JsMath.Cos(a3); e._lastFdy = JsMath.Sin(a3); escaped = true; }
                        else { double x4 = e.x + JsMath.Cos(a4) * escSpd, y4 = e.y + JsMath.Sin(a4) * escSpd; if (can(x4, y4, sr)) { e.x = x4; e.y = y4; e._lastFdx = JsMath.Cos(a4); e._lastFdy = JsMath.Sin(a4); escaped = true; } }
                    }
                }
            }
        }

        // updateE(e, sp): head (CX-03a) -> [DOT: pending CX-03b] -> body (EnemyAi)
        void UpdateEnemyBody(EnemySpawn e, double sp)
        {
            double d;
            if (EnemyTick.UpdateHead(tickCtx, e, sp, out d)) return;
            string stateBefore = e.s;
            EnemyAi.UpdateBody(aiHost, e, sp, d);
            if (e.s == "windup" && stateBefore != "windup") QueueLogicalSound("tell_melee", "melee wind-up entry", e.x, e.y);   // RM-1 sound: AD3 stage 2
        }

        // EnemyState <-> web object around the loop (fields both sides know; everything else lives on Web)
        void WebHurtFlash(EnemyState e, EnemySpawn w) { w._hitFlash = e.HurtTicks; }

        void TickEnemiesWeb()
        {
            EnsureEnemyLoop();
            tickMs += 16.6667;
            tickCtx.PlayerX = Player.X; tickCtx.PlayerY = Player.Y; tickCtx.CamX = Player.X; tickCtx.CamY = Player.Y;
            tickCtx.Stage = Config.StageIndex; tickCtx.Kills = Kills; tickCtx.ParryLessonActive = false;
            webEns.Clear();
            int count = Enemies.Count;
            for (int i = 0; i < count; i++)
            {
                var e = Enemies[i];
                if (e.IsBoss) continue;                              // bosses keep BossTick (druid Core)
                var w = SyncToWeb(e); WebHurtFlash(e, w);
                w.speed = e.Speed; w.projT = e.ProjectileTicks;
                w._aAtkM = 1; w._aSpdM = 1;   // aura pass (34477): reset each frame, then slows
                if ((w._webSlow ?? 0) > 0) w._aSpdM *= .5;
                if ((w._spikeSlow ?? 0) > 0) { w._spikeSlow -= 1; double ssP = Math.Min(.95, .91 + (Math.Max(1, w._spikeSlowLv ?? 1) - 1) * .02); w._aSpdM *= (1 - ssP); }
                webEns.Add(w);
            }
            tickFrame = EnemyTick.BeginFrame(tickCtx, 1);
            inEnemyLoop = true;
            try { for (int i = 0; i < webEns.Count; i++) if (EnemyTick.Step(tickCtx, tickFrame, webEns, i, 1)) break; }
            finally { inEnemyLoop = false; }
            TickShotWarnings();
            TickFieldZones();
            foreach (var w in webEns)
            {
                EnemyState e; if (!webOwner.TryGetValue(w, out e)) continue;
                SyncFromWeb(e, w);
                if (e.Alive) { e.Speed = (float)w.speed; e.ProjectileTicks = (float)w.projT; e.HurtTicks = (float)(w._hitFlash ?? 0); }
                if (!w.alive && e.Alive) e.Alive = false;
            }
        }

        void TickShotWarnings()
        {
            int n = 0;
            for (int i = 0; i < shotWarnings.Count; i++)
            {
                var w = shotWarnings[i]; var e = w.Owner;
                bool cancelled = !w.Dead && (!e.alive || e.stunned > 0 || (e._frozen ?? 0) > 0);
                if (!cancelled)
                {
                    w.T -= 1;
                    if (w.T > 0) { shotWarnings[n++] = w; continue; }
                    double dx = w.Dead ? 0 : e.x - w.X, dy = w.Dead ? 0 : e.y - w.Y;
                    foreach (var s in w.Shots) { s.X += dx; s.Y += dy; s.Commit = true; SpawnFieldProjectile(s); }
                }
            }
            if (n < shotWarnings.Count) shotWarnings.RemoveRange(n, shotWarnings.Count - n);
        }

        // the armor element of the web `ar().el` (undefined without armor)
        double? ArmorElement() { var it = EquippedInventory != null ? EquippedInventory.GetEquipped("armor") : null; return it != null ? (double?)it.el : null; }

        // The projectile-loop half of the zero-speed enemy bullets (game.html 34775-34790 trap, 35159-35178 iceZone / blizzard): they stay until touched (the web resets an
        // expired life to 1 while the bullet is near the camera), any touch consumes them, and an invulnerable or dashing player is not affected (the trap vanishes anyway).
        void TickFieldZones()
        {
            if (FieldZones.Count == 0) return;
            double px = Player.X, py = Player.Y, pr = Player.Radius; int w = 0;
            for (int i = 0; i < FieldZones.Count; i++)
            {
                var z = FieldZones[i]; bool dead = false;
                z.Life -= .667;
                double dist = Math.Sqrt((px - z.X) * (px - z.X) + (py - z.Y) * (py - z.Y));
                bool dashing = DashActive || HarpActive || Player.State == "charge";
                if (z.Kind == "trap")
                {
                    if (dist < 28 && !dashing)
                    {
                        if (Player.Iframes <= 0)
                        {
                            HurtPlayer(Js.Int(z.Dmg * EnemyHurt.ElMul(z.El, ArmorElement())), new HurtOptions { Magic = true });
                            double ka = JsMath.Atan2(py - z.Y, px - z.X); Player.KnockbackX += (float)(JsMath.Cos(ka) * 8); Player.KnockbackY += (float)(JsMath.Sin(ka) * 8);
                            double slowRes = EquippedInventory != null ? EquippedInventory.AffixTotal("slowRes") : 0;
                            PlayerTrapSlow = Js.Int(120 * (1 - Math.Min(.5, slowRes)));
                            HurtText(px, py - 20, "⚠ 덫!", "⚠ Trap!", "#ffcc00", 40); HurtShake(4);
                        }
                        dead = true;
                    }
                }
                else if (dist < pr + (z.R != 0 ? z.R : 1) * 3 + 4 && Player.Iframes <= 0 && !dashing)
                {
                    if (z.Kind == "iceZone")
                    {
                        if (z.El == 2) PlayerFreezeSlow = Math.Max(PlayerFreezeSlow, 60);   // ice element: slow; the dark (purple) slime pool does nothing
                    }
                    else if (z.Kind == "blizzard")
                    {
                        HurtPlayer(Js.Int((z.Dmg != 0 ? z.Dmg : 5) * EnemyHurt.ElMul(z.El, ArmorElement())), new HurtOptions { Magic = true });
                        if (z.El == 2) { PlayerFreezeSlow = Math.Max(PlayerFreezeSlow, 90); HurtText(px, py - 20, "🌨빙결!", "🌨Frozen!", "#9999ff", 25); }
                    }
                    dead = true;
                }
                if (!dead && z.Kind != "trap" && z.Life <= 0) { if (dist > 2500) dead = true; else z.Life = 1; }
                if (!dead) FieldZones[w++] = z;
            }
            if (w < FieldZones.Count) FieldZones.RemoveRange(w, FieldZones.Count - w);
        }

        void SpawnFieldProjectile(ProjSpec s)
        {
            ShotsFired++;
            if (Druid != null) Druid.SpawnProjectile(null, null, s, false);
        }

        sealed class AiHost : IEnemyAiHost
        {
            readonly Simulation s;
            public AiHost(Simulation sim) { s = sim; }
            public double Rand() { return s.NextRandom(); }
            public double PX { get { return s.Player.X; } } public double PY { get { return s.Player.Y; } } public double PRadius { get { return s.Player.Radius; } }
            public double PFacing { get { return s.Player.Facing; } } public double PIframes { get { return s.Player.Iframes; } }
            public string PState { get { return s.DashActive || s.HarpActive ? "charge" : s.Player.State; } }
            public int Stage { get { return s.Config.StageIndex; } }
            public bool CanMove(double x, double y, double r) { return s.Pass((float)x, (float)y, (float)r); }
            public bool IsWall(double x, double y) { return s.IsProjectileWall != null ? s.IsProjectileWall((float)x, (float)y) : !s.Pass((float)x, (float)y, 0); }
            public void HurtPlayer(int damage, bool magic) { s.HurtPlayer(damage, new HurtOptions { Magic = magic }); }
            public void KnockPlayer(double kx, double ky) { s.Player.KnockbackX += (float)kx; s.Player.KnockbackY += (float)ky; }
            public void ScaleKnock(double m) { s.Player.KnockbackX *= (float)m; s.Player.KnockbackY *= (float)m; }
            public void FreezeSlow(double frames) { s.PlayerFreezeSlow = Math.Max(s.PlayerFreezeSlow, (float)frames); }
            public void StaggerPlayer(double frames) { s.Player.State = "stagger"; s.Player.StateTicks = (float)frames; }
            public double ElMul(double? attackerElement) { return EnemyHurt.ElMul(attackerElement, s.ArmorElement()); }   // elMul(e.el, ar().el)
            public bool IsParryWindow() { return s.Player.Hp > 0 && ParryRules.IsParryWindow(s.Player.State, s.Player.StateTicks, 0, s.SbParryT, s.CapeParry); }
            public void Parry(EnemySpawn e, double atk)
            {
                bool q = s.Player.State == "sBlock" || s.Player.State == "peaceShield" || s.SbParryT > 0;
                s.ParryBank += atk != 0 ? atk : 10;   // P.parryBank += e.atk||10
                s.ApplyParrySuccess(q);
                EnemyState owner; if (!s.webOwner.TryGetValue(e, out owner)) return;
                var r = EnemyPoiseRules.PoiseHit(new EnemyPoiseRules.Enemy { Alive = owner.Alive, Boss = false, Poise = owner.Poise, MaxPoise = owner.MaxPoise, PoiseR = owner.PoiseRegenTicks, Stunned = owner.Stunned,
                    MaxStunned = owner.MaxStunned, PImmune = e._pImmune ?? 0 }, 20, 0, 0);
                owner.Poise = (float)r.Enemy.Poise; owner.PoiseRegenTicks = (float)r.Enemy.PoiseR; owner.Stunned = (float)r.Enemy.Stunned; owner.MaxStunned = (float)r.Enemy.MaxStunned;
                e.poise = owner.Poise; e.poiseR = owner.PoiseRegenTicks; e.stunned = owner.Stunned; e._maxStunned = owner.MaxStunned; e._pImmune = r.Enemy.PImmune;
            }
            public void Text(double x, double y, string text, string color, int life) { }
            public void Parts(double x, double y, string color, int count) { }
            public void Shake(double n) { s.HurtShake(n); }
            public void Sfx(string name) { var h = s.EnemySfx; if (h != null) h(name); }
            public IList<EnemySpawn> Query(double x, double y, double r)
            {
                var list = new List<EnemySpawn>();
                int cx0 = (int)((x - r) / 128), cx1 = (int)((x + r) / 128), cy0 = (int)((y - r) / 128), cy1 = (int)((y + r) / 128);
                foreach (var w in s.webEns)
                {
                    if (!w.alive) continue;
                    int cx = (int)(w.x / 128), cy = (int)(w.y / 128);
                    if (cx >= cx0 && cx <= cx1 && cy >= cy0 && cy <= cy1) list.Add(w);
                }
                return list;
            }
            public int EnemyCount { get { return s.webEns.Count; } }
            public IList<EnemySpawn> DeadPool
            {
                get
                {
                    var list = new List<EnemySpawn>();
                    foreach (var w in s.webEns) if (!w.alive && !w._absorbed) list.Add(w);
                    return list;
                }
            }
            public EnemySpawn Create(double x, double y, int etype, double? el)
            {
                var ctx = new EnemySpawnContext {
                    PlayerLevel = s.Player.Level, DifficultyIndex = s.Config.DifficultyIndex, StageDiffOffset = 0, Stage = s.Config.StageIndex,
                    DemoMode = s.Config.DemoMode, DemoLastStage = s.Config.DemoLastStage, CanMove = (cx, cy, cr) => s.Pass((float)cx, (float)cy, (float)cr), Random = s.NextRandom
                };
                return EnemyFactory.Create(ctx, x, y, s.Config.StageIndex, etype, false, el, null);
            }
            public void AddEnemy(EnemySpawn w)
            {
                if (w == null) return;
                var e = new EnemyState {
                    Id = s.nextEnemyId++, Etype = (int)w.etype, X = (float)w.x, Y = (float)w.y, Radius = (float)w.r, Hp = ToIntClamped(w.hp), MaxHp = ToIntClamped(w.mhp), Attack = ToIntClamped(w.atk),
                    BaseAttack = ToIntClamped(w.baseAtk), Level = (int)w.lv, Shield = (float)w.eShield, MaxShield = (float)w.eShieldMax, Poise = (float)w.poise, MaxPoise = (float)w.maxPoise,
                    Speed = (float)w.speed, Facing = (float)w.facing, StateTicks = (float)w.st2, ProjectileTicks = (float)w.projT, Elite = (int)w.elite, Col = w.col, Web = w
                };
                s.webOwner[w] = e; s.Enemies.Add(e); s.webEns.Add(w); s.EnemySummons++;
            }
            public void ReviveCorpse(EnemySpawn corpse)
            {
                EnemyState e; if (!s.webOwner.TryGetValue(corpse, out e)) return;
                e.Alive = true; corpse.alive = true; e.Hp = Js.Int(e.MaxHp * .5); corpse.hp = e.Hp; e.Shield = 0; e.MaxShield = 0; corpse.eShield = 0; corpse.eShieldMax = 0;
                e.State = "recover"; e.StateTicks = 60; corpse.s = "recover"; corpse.st2 = 60; e.Stunned = 0; corpse.stunned = 0; e.Poise = e.MaxPoise; corpse.poise = corpse.maxPoise;
                e.ReviveIframes = 0; corpse.reviveIframes = 0; e.Corpse = false;
            }
            public void Shot(EnemySpawn e, ProjSpec shot)
            {
                ShotWarning w = null;
                foreach (var x in s.shotWarnings) if (x.Owner == e && x.T == 60) { w = x; break; }   // same-frame warning of the owner: all shots of one frame share one ring
                if (w == null) { w = new ShotWarning { Owner = e, Dead = !e.alive, X = e.x, Y = e.y }; s.shotWarnings.Add(w); s.QueueLogicalSound("tell_ranged", "ranged 60f attack ring", e.x, e.y); }
                w.Shots.Add(shot);
            }
            public void Proj(EnemySpawn e, ProjSpec shot) { s.SpawnFieldProjectile(shot); }
            public void Teleported(EnemySpawn e, double x, double y) { }
            public void Zone(EnemySpawn e, string kind, double x, double y, double life, double r, double dmg, double el)
            {
                s.FieldZones.Add(new FieldZone { Kind = kind, X = x, Y = y, Life = life, R = r, Dmg = dmg, El = el });
                if (kind == "trap")
                {   // trap cap 50: the oldest (smallest life) goes first
                    int count = 0, oldest = -1; double oldLife = double.PositiveInfinity;
                    for (int i = 0; i < s.FieldZones.Count; i++) { var z = s.FieldZones[i]; if (z.Kind != "trap") continue; count++; if (z.Life < oldLife) { oldLife = z.Life; oldest = i; } }
                    if (count > 50 && oldest >= 0) s.FieldZones.RemoveAt(oldest);
                }
            }
            public double DotDur() { return 1; }   // pDotDur(): 1 + passive pDot * .1 (the passive tree is not ported)
            public double DotDmg() { return 1; }   // pDotDmg(): _passDmgSum('dot')
            public void HurtDot(EnemySpawn e, int damage, bool maliceHunt, double? atkEl) { EnemyState o; if (s.webOwner.TryGetValue(e, out o)) s.ApplyEnemyDot(o, damage, maliceHunt, atkEl ?? 0); }
        }
    }
}
