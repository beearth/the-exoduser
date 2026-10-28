using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // C01 wire: the oracle-checked enemy Core (EnemyFactory = mkEn, EnemyHurt = hurtE head + middle) behind the Simulation's own EnemyState.
    // EnemyState keeps the fields the rest of the port reads; EnemyState.Web is the web-shaped object (EnemySpawn) the Core works on. Fields both sides
    // know are copied before / after every Core call; fields only the web object has (mods, aura, eRes, skin ...) live on Web.
    public sealed partial class Simulation
    {
        private readonly Dictionary<EnemySpawn, EnemyState> webOwner = new Dictionary<EnemySpawn, EnemyState>();
        /// <summary>The equipped inventory of the last ApplyEquipment: the web _eqAffix(id) source for hurtE.</summary>
        public InventoryState EquippedInventory;

        /// <summary>mkEn(x, y, stage, etype, false, undefined, undefined) for any ordinary etype; null where mkEn returns null (no free spot).</summary>
        public EnemyState SpawnEnemy(float x, float y, int etype, double? room = null, bool countSpawned = true, double? el = null)
        {
            if (!Finite(x) || !Finite(y)) return null;
            var context = new EnemySpawnContext {
                PlayerLevel = Player.Level, DifficultyIndex = Config.DifficultyIndex, StageDiffOffset = 0, Stage = Config.StageIndex,
                DemoMode = Config.DemoMode, DemoLastStage = Config.DemoLastStage,
                CanMove = (cx, cy, cr) => Pass((float)cx, (float)cy, (float)cr), Random = NextRandom
            };
            var web = EnemyFactory.Create(context, x, y, Config.StageIndex, etype, false, el, room);
            if (web == null) return null;
            var enemy = new EnemyState {
                Id = nextEnemyId++, Etype = (int)web.etype, X = (float)web.x, Y = (float)web.y, Radius = (float)web.r,
                Hp = ToIntClamped(web.hp), MaxHp = ToIntClamped(web.mhp), Attack = ToIntClamped(web.atk), BaseAttack = ToIntClamped(web.baseAtk), Level = (int)web.lv,
                Shield = (float)web.eShield, MaxShield = (float)web.eShieldMax, Poise = (float)web.poise, MaxPoise = (float)web.maxPoise,
                Speed = (float)web.speed, Facing = (float)web.facing, StateTicks = (float)web.st2, ProjectileTicks = (float)web.projT,
                Elite = (int)web.elite, Col = web.col, Web = web, HomeX = web._homeX, HomeY = web._homeY, HasHome = true
            };
            webOwner[web] = enemy;
            Enemies.Add(enemy); if (countSpawned) Stage.TotalSpawned++;   // C07: G._totalSpawned (gate progress denominator)
            return enemy;
        }

        private static int ToIntClamped(double v) { return v >= int.MaxValue ? int.MaxValue : v <= int.MinValue ? int.MinValue : (int)v; }

        /// <summary>Copies the shared fields EnemyState -> EnemySpawn (creates a minimal web object for enemies the Core never spawned: revived ghouls).</summary>
        private EnemySpawn SyncToWeb(EnemyState e)
        {
            var w = e.Web;
            if (w == null) {
                w = new EnemySpawn {
                    kb = new EnemyVec(), modT = new EnemyModT(), mods = new List<string>(), eRes = new double[7], meteors = new List<object>(), _lastMoves = new List<string>(), el = null
                };
                e.Web = w; webOwner[w] = e;
            }
            w.x = e.X; w.y = e.Y; w.r = e.Radius; w.hp = e.Hp; w.mhp = e.MaxHp; w.atk = e.Attack; w.baseAtk = e.BaseAttack; w.alive = e.Alive;
            w.stunned = e.Stunned; w._maxStunned = e.MaxStunned; w.poise = e.Poise; w.maxPoise = e.MaxPoise; w.poiseR = e.PoiseRegenTicks;
            w.eShield = e.Shield; w.eShieldMax = e.MaxShield; w.reviveIframes = e.ReviveIframes; w.etype = e.Etype; w.ib = e.IsBoss; w.lv = e.Level; w.elite = e.Elite;
            w.s = e.State; w.st2 = e.StateTicks; w.facing = e.Facing; w.kb.x = e.KnockbackX; w.kb.y = e.KnockbackY; w._hitStun = e.HitStun;
            w._alerted = e.Alerted; w._isGhoul = e.IsGhoul; w.deaths = e.Deaths; w._blinkWeak = e.BlinkWeak; w._blinkWeakT = e.BlinkWeakTicks;
            return w;
        }

        private void SyncFromWeb(EnemyState e, EnemySpawn w)
        {
            e.Hp = ToIntClamped(w.hp); e.Shield = (float)w.eShield; e.Poise = (float)w.poise; e.PoiseRegenTicks = (float)w.poiseR;
            e.Stunned = (float)w.stunned; e.MaxStunned = (float)(w._maxStunned ?? 0);
            e.KnockbackX = (float)w.kb.x; e.KnockbackY = (float)w.kb.y; e.X = (float)w.x; e.Y = (float)w.y;
            e.Alerted = w._alerted == true; e.State = w.s; e.StateTicks = (float)w.st2; e.HitStun = (float)(w._hitStun ?? 0);
            e.ReviveIframes = w.reviveIframes;
            if (w._hitFlash.HasValue && w._hitFlash.Value > 0) e.HurtTicks = (float)w._hitFlash.Value;
        }

        private double MeleeReference() { return Config.WeaponAttack + Config.WeaponEnhanceAttack + Config.WeaponFlatAttack + Player.BaseAttack + Config.StrengthFlat + (int)(Player.Level * .5); }

        private EnemyHurtContext BuildHurtContext(EnemyHurtPlayer p, double typeDamagePct, double critRateBonus)
        {
            var inventory = EquippedInventory;
            Func<string, double> eqAffix = name => {
                if (typeDamagePct > 0) { if (name == "rangedDmgPct") return typeDamagePct; if (name == "projDmgPct") return 0; }
                if (critRateBonus != 0 && name == "critRateBow") return critRateBonus / 100;
                return inventory != null ? inventory.AffixTotal(name) : 0;
            };
            Func<string, double> zero = name => 0;
            return new EnemyHurtContext {
                P = p, HasStats = false, OptParts = 0, ViewW = 1e6, ViewH = 1e6, CamX = Player.X, CamY = Player.Y,
                Random = NextRandom, EqAffix = eqAffix, LEq = zero, UEq = zero,
                StatStr = () => 1, StatCrit = () => Config.PlayerCriticalChance, StatCritDmg = () => Config.PlayerCriticalMultiplier, PAtkMul = () => Config.DamageMultiplier,
                MeleeRef = MeleeReference, PDotPool = () => 1, PredBonus = w => 0, HunterMul = w => 1,
                NecklaceDmg = Config.AccessoryDamageSum,
                PetOnAtk = () => { }, ShQuery = (x, y, r) => NearbyWebs(x, y, r), Ens = new List<EnemySpawn>(),
                HurtEnemy = (w, dmg, ang, noSound, opts, atkEl) => { if (w != null && webOwner.TryGetValue(w, out var other)) ApplyEnemyDamage(other, (int)dmg, (float)(ang ?? 0), false, 1, opts != null && opts.dot == true, opts != null && opts.shieldHit == true); },
                ParryLessonHurt = (w, dmg, ang, opts) => { }, HurtPlayer = dmg => HurtPlayer((int)dmg), SpawnBossProjectile = (w, proj) => { },
                AddText = (x, y, text, col, life, size, text2) => { }, AddParts = (x, y, col, n) => { }, Shake = n => { }, DoHitFlash = (col, a) => { }, PlaySample = QueueHurtSample, HitSfxCd = hitSfxCd,
                HitSfxForEtype = EnemySoundTables.Hit, Block = () => { }, Translate = s => s,
                UqS = new EnemyUqS(), CanMove = (x, y, r) => Pass((float)x, (float)y, (float)r),
                PoolPart = (x, y, vx, vy, col, sz, life, tp, rot, grav) => { }, AddImpact = (x, y, el, ang, type, boss, noFlash) => { }, AddBoom = (x, y, r, dur, col) => { },
                TickSkyCrusherRecharge = n => { }, SfxGroggy = () => { }
            };
        }

        private IList<EnemySpawn> NearbyWebs(double x, double y, double r)
        {
            var list = new List<EnemySpawn>();
            foreach (var other in Enemies) {
                if (!other.Alive) continue;
                if (Distance((float)x, (float)y, other.X, other.Y) <= r + other.Radius) list.Add(SyncToWeb(other));
            }
            return list;
        }

        private EnemyHurtPlayer HurtPlayerView()
        {
            return new EnemyHurtPlayer {
                x = Player.X, y = Player.Y, hp = Player.Hp, mhp = Player.MaxHp, mp = Player.Mana, mmp = Player.MaxMana, iframes = Player.Iframes,
                eShield = Player.Shield, eShieldMax = Player.MaxShield, st = Player.Stamina, mst = Player.MaxStamina, s = Player.State
            };
        }

        private void ApplyHurtPlayerBack(EnemyHurtPlayer p)
        {
            Player.Hp = (float)p.hp; Player.Mana = (float)p.mp; Player.Iframes = (float)p.iframes;
            if (p.eShield.HasValue) Player.Shield = (float)p.eShield.Value;
            if (p.st.HasValue) Player.Stamina = (float)p.st.Value;
        }
    }
}
