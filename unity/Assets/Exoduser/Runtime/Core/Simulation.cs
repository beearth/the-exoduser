using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// Native restricted source slice. One Tick is one web frame (60 Hz), pixels,
    /// positive Y down. Renderer, collision, input and saves have separate owners.
    /// Snapshot SHA: dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209.
    /// </summary>
    public sealed partial class Simulation
    {
        public readonly PlayerState Player;
        public readonly List<EnemyState> Enemies = new List<EnemyState>();
        public readonly List<LootState> Loot = new List<LootState>();
        public readonly List<LootState> CollectedLoot = new List<LootState>();
        public readonly SimulationConfig Config;
        public Func<float, float, float, bool> CanMove;
        public Func<float, float, float, float, bool> HasLineOfSight;
        public Func<LootState, bool> IsLootOnScreen;
        public Func<LootState, bool> TryCollectLoot;
        public Func<double> Random01;
        public int TickCount, Kills, Materials, Combo;
        public int TotalDamage, LastHitDamage, PotionHp, PotionStamina, PotionMana;
        public float ComboTicks;
        private uint randomState;
        private int nextEnemyId = 1, nextLootId = 1, attackBonus, pickupHoldTicks;
        private float attackAngle;
        private float actionMoveX, actionMoveY;
        private bool playerActionBranchConsumed;
        private static readonly double[] Difficulty = { .45, .55, .65, .76, .88, 1, 1.12, 1.25, 1.40, 1.58, 1.78 };
        private static readonly string[] DropSlots = { "weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "belt", "necklace", "ring1", "ring2", "cape", "bracelet", "headband", "headband2" };
        private static readonly double[] NormalRarityWeights = { 65, 22, 9, 3, 1, .01 };

        public Simulation(SimulationConfig config, uint seed = 1)
        {
            Config = config ?? throw new ArgumentNullException(nameof(config));
            if (config.DifficultyIndex < 0 || config.DifficultyIndex > 10 || config.StageIndex < 0)
                throw new ArgumentOutOfRangeException(nameof(config));
            randomState = seed;
            Player = new PlayerState {
                X = config.StartX, Y = config.StartY, Hp = config.PlayerMaxHp, MaxHp = config.PlayerMaxHp,
                Stamina = config.PlayerMaxStamina, MaxStamina = config.PlayerMaxStamina,
                Mana = config.PlayerMaxMana, MaxMana = config.PlayerMaxMana,
                Shield = config.PlayerStartingShield, MaxShield = config.PlayerMaxShield, Iframes = config.InitialIframes,
                Speed = config.PlayerSpeed, BaseAttack = config.PlayerBaseAttack
            };
            InitStartingSkills();   // B03: new character start skills
        }

        private double NextRandom()
        {
            double value;
            if (Random01 != null) value = Random01();
            else { randomState = unchecked(randomState * 1664525u + 1013904223u); value = randomState / 4294967296.0; }
            if (double.IsNaN(value) || value < 0 || value >= 1) throw new InvalidOperationException("Random provider must return [0,1).");
            return value;
        }

        private bool Pass(float x, float y, float radius) => (CanMove == null || CanMove(x, y, radius)) && !PillarBlocked(x, y, radius);   // RB1-3: the root pillars of the remodelled boss arena are solid
        private static float Distance(float x, float y, float xx, float yy) { return (float)Math.Sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy)); }
        private static bool Finite(float value) => !float.IsInfinity(value) && !float.IsNaN(value);

        // mkEn (EnemyFactory, oracle-checked field by field and by Random() order): the ordinary etype0 body. Elite rolls, mods and auras are the web's.
        public EnemyState SpawnNormalEnemy(float x, float y) { return SpawnEnemy(x, y, 0); }

        public void Tick(float moveX, float moveY, float aimX, float aimY, bool attack, bool pickup)
        {
            executingFirstPracticeTick=true;
            try { TickFirstPracticeObserved(moveX,moveY,aimX,aimY,attack,pickup); }
            finally { executingFirstPracticeTick=false; }
        }
        private void TickFirstPracticeObserved(float moveX,float moveY,float aimX,float aimY,bool attack,bool pickup)
        {
            if (!Finite(moveX) || !Finite(moveY) || !Finite(aimX) || !Finite(aimY)) throw new ArgumentException("Non-finite input");
            if (Stage.Enabled && Stage.LoadPhase > 0) { moveX = 0; moveY = 0; attack = false; pickup = false; }   // C07: the boss-arena load screen freezes the player (web 43568, 61395)
            BeginChainLandingInput(attack);
            TickCount++;
            if (hitSfxCd > 0) hitSfxCd--; TickScheduledSounds();   // RM-1 sound cooldowns (web _hitSfxCd / _critSfxCd)
            LastHitDamage = 0;
            if (ComboTicks > 0) { ComboTicks--; if (ComboTicks <= 0) Combo = 0; }
            TickCrossbowPet();
            TickDeathFrameStart();   // O-1: _sfxFrameReset (_critSfxCd)
            if (Player.Hp <= 0 || Player.State == "dead" || Player.State == "fallen") { TickFallen(); UpdateKiProjectiles(); UpdateBolts(); TickKiTimers(); TickHurtFx(); return; }
            if (!RollActive) Player.Facing = (float)Math.Atan2(aimY - Player.Y, aimX - Player.X);
            if (PlayerCombatWired) UpdateChainInputEvents();
            if (SkillsWired) DispatchSkillKeys();
            if (Player.State != "pStun") ConsumeRollTrigger(); // 원본 일반 기동 발동은 재생·무적 감소보다 앞선다.
            if (PlayerCombatWired) TickChainDash(); // 기절은 새 홀드·재생만 막고 이미 날아간 사슬은 계속 진행한다.
            TickChainSlamInput();
            if (SourceActInput != null) attack = attack && SourceActInput("weapon");
            if (SourceHeldInput != null) magicHeld = magicHeld && SourceHeldInput("beam");
            float regenMul = ApplySkillRegen();
            float regenDivisor = Player.State == "idle" ? 8 : 16;
            Player.Hp = Math.Min(Player.MaxHp, Player.Hp + Config.PlayerHpRegen * regenMul / regenDivisor);
            Player.Stamina = Math.Min(Player.MaxStamina, Player.Stamina + Config.PlayerStaminaRegen * regenMul / regenDivisor);
            Player.Mana = Math.Min(Player.MaxMana, Player.Mana + Config.PlayerManaRegen * regenMul / regenDivisor);
            Player.StateTicks--;
            Player.Iframes = Math.Max(0, Player.Iframes - 1);
            TickChainStocks();
            attackHeldForMagic = attack;
            actionMoveX = moveX; actionMoveY = moveY; playerActionBranchConsumed = false;
            TickPlayerShieldAndRevive();
            if (Player.State == "pStun") ConsumeRollTrigger(); // 기절 탈출은 원본의 뒤쪽 상태 분기다.
            TickPlayerCombat();
            TickRoll();
            TickSkills();   // B03: 마법 자세·투사체·쿨다운·보주·장판 후반 단계
            MoveKnockback();
            if (Player.State == "bladeDash") { }   // roll: TickRoll moves the player, no walking / attacking meanwhile (web case 'bladeDash')
            else if (Player.State == "stagger" || Player.State == "pStun") {
                bool chainEscape = combatShiftHeld && (!combatShiftPrev || DashHold || HarpActive || DashActive);
                if (chainEscape)
                {
                    if (Player.State == "pStun") { Player.Iframes = 30; Player.Poise = 4; }
                    else Player.StateTicks = 0;
                    Player.State = "idle";
                }
                else if (Player.StateTicks <= 0) { if (Player.State == "pStun") { Player.Iframes = 60; Player.Poise = 4; } Player.State = "idle"; if (Player.Poise <= 0) Player.Poise = 4; }
            }
            else if (TickSkillState(moveX, moveY)) { }   // B03: giant slam windup / strike / recover, ice orb
            else if (playerActionBranchConsumed) { } // 원본 switch는 진입한 자세 한 분기만 실행한다.
            else {
                MovePlayer(moveX, moveY, Player.State == "idle" ? 1 : .8f, Player.State == "idle");
                if (Player.State == "idle") {
                    float cost = Config.ActiveAttack == "kiSlash" ? 10 + (Math.Max(1, Config.KiSlashLevel) - 1) * 2 : 5;
                    if (attack && Player.Stamina >= cost && !HarpActive && !DashActive) {
                        Player.Stamina -= cost; attackBonus = (int)(cost * 1.5);
                        attackAngle = Player.Facing;
                        if (Config.ActiveAttack == "kiSlash" && KiComboStep == 2 && KiComboTicks > 0) {
                            Player.State = "wWindup"; Player.StateTicks = 999;
                            Player.KiChargeActive = true; Player.KiChargeTicks = 0;
                        }
                        else {
                            Player.State = "wSwing"; Player.StateTicks = 5; Player.SwingProgress = 0;
                            if (Config.ActiveAttack == "kiSlash") SpawnKiSlash((KiComboStep % 3) + 1);
                        }
                    }
                }
                else if (Player.State == "wWindup" && Player.KiChargeActive) {
                    attackAngle = Player.Facing;
                    float beforeCharge = Player.KiChargeTicks;
                    Player.KiChargeTicks = Math.Min(120, Player.KiChargeTicks + 1);
                    Player.StateTicks = 999;
                    QueueKiChargeTier(beforeCharge, Player.KiChargeTicks);
                    if (!attack) {
                        float charged = Player.KiChargeTicks;
                        Player.KiChargeActive = false; Player.KiChargeTicks = 0;
                        Player.State = "wSwing"; Player.StateTicks = 5; Player.SwingProgress = 0;
                        SpawnKiSlash(3, charged);
                    }
                }
                else if (Player.State == "wSwing") {
                    Player.SwingProgress = (5 - Player.StateTicks) / 5;
                    if (Player.StateTicks <= 3 && Player.StateTicks + 1 > 3) HitArc();
                    if (Player.StateTicks <= 0) {
                        Player.State = "wRecover";
                        Player.StateTicks = (int)(16 / ((Config.WeaponSpeed!=0?Config.WeaponSpeed:.3f) * Config.AttackSpeedMultiplier));
                    }
                }
                else if (Player.State == "wRecover" && Player.StateTicks <= 0) Player.State = "idle";
            }
            if (Config.EnemyAiEnabled) TickEnemiesWeb();   // C01-AI: web enemy loop (L1 + updateE head + 1-1 body) for the non-boss enemies
            foreach (var enemy in Enemies.ToArray()) {
                if (!enemy.Alive) continue;
                bool webDriven = Config.EnemyAiEnabled && !enemy.IsBoss;   // timers of these enemies run inside the web loop
                if (!webDriven) enemy.HurtTicks = Math.Max(0, enemy.HurtTicks - 1);
                TickBlinkWeak(enemy);
                if (!webDriven) {
                    enemy.HitStun = Math.Max(0, enemy.HitStun - 1);
                    if (enemy.ReviveIframes > 0) enemy.ReviveIframes = Math.Max(0, enemy.ReviveIframes - 1); // updateE 38677
                }
                if (enemy.SpawnTicks > 0) enemy.SpawnTicks--; if (enemy.BossReviveVfxPending > 0) enemy.BossReviveVfxPending--;
                if (!webDriven) {
                    if (enemy.Stunned > 0) enemy.Stunned = Math.Max(0, enemy.Stunned - 1);
                    // Source34456 resets poise here only for bosses. This admitted
                    // ordinary profile only clears the stun presentation marker.
                    if (enemy.Stunned <= 0 && enemy.MaxStunned > 0) enemy.MaxStunned = 0;
                }
                if (Config.EnemyAiEnabled && enemy.IsBoss) { if (BossTick != null) BossTick(enemy); else TickEnemy(enemy); }   // C07: boss Core plug-in
            }
            TickCorpses();
            if (AfterEnemyTick != null) AfterEnemyTick();   // BX: boss projectiles and hazards (Simulation.DruidBoss.cs)
            TickCrossbow(); // B05: auto crossbow fire + bolt update
            UpdateKiProjectiles();
            TickKiTimers();
            // Web update() auto potion block (game.html 35895-35911): runs once per frame after the enemy loop.
            TickAutoPotion();
            TickShieldThrow(); // 원본 _stCd/_stWingT/_stProjs, 적 탄환 이동 뒤 실행
            if (SkillsWired) TickFireZones(); // 원문 후반 장판 DOT: 적 이동·상태 감소가 끝난 뒤 생성 순서대로
            TickChainSlamWaves();
            if (pickup) { if (pickupHoldTicks == 0 || pickupHoldTicks >= 9) { PickSourcePriorityLoot(); pickupHoldTicks = 0; } pickupHoldTicks++; }
            else pickupHoldTicks = 0;
            CapEnemies();   // web 34540: ens hard cap 800 -> 700
            TickFieldBosses();   // M1-REGION R-B: _fbTick
            TickRegions();   // M1-REGION: _regionTick (every 15th frame)
            TickDeathFrameEnd();   // O-1: split / companion spawns, the checkRooms() calls of this frame's kills (web: at the kill, before this checkRooms)
            Stage.Tick();   // C07: checkRooms (arena entry / boss defeat / exit / clear)
            TickSpawnHoles();   // C01-AI: the 소환굴 update follows checkRooms in the web update()
            TickKillChain();   // O-1: kill-chain timer (web 35880, right after the 소환굴 update)
            TickHurtFx();   // B09: screen shake / flash decay
        }

        private float BootMoveSpeed { get { var boots = EquippedInventory != null ? EquippedInventory.GetEquipped("boots") : null; return boots != null ? (float)boots.spd : 0; } }

        private void MovePlayerAction(float multiplier, bool applySlow = false, bool includeBoots = true)
        {
            if (playerActionBranchConsumed) return;
            playerActionBranchConsumed = true;
            MovePlayer(actionMoveX, actionMoveY, multiplier, applySlow, includeBoots);
        }

        private void MovePlayer(float x, float y, float multiplier, bool applySlow, bool includeBoots = true)
        {
            double length = Math.Sqrt(x*x+y*y);
            if (length <= 0) return;
            float distance = (Player.Speed + (includeBoots ? BootMoveSpeed : 0)) * multiplier * (applySlow ? MoveSlowMultiplier : 1); // 원본 감속 상태이상은 idle 이동에만 적용한다.
            float nx = Player.X + (float)(x / length) * distance, ny = Player.Y + (float)(y / length) * distance;
            if (Pass(nx, Player.Y, Player.Radius)) Player.X = nx;
            if (Pass(Player.X, ny, Player.Radius)) Player.Y = ny;
        }

        private void MoveKnockback()
        {
            if (Math.Abs(Player.KnockbackX) <= .1 && Math.Abs(Player.KnockbackY) <= .1) return;
            // Source32764: combined vector collision, half displacement, .65^sp
            // decay. The idle walk's independent axis slide does not apply here.
            float x = Player.X + Player.KnockbackX * .5f, y = Player.Y + Player.KnockbackY * .5f;
            if (Pass(x, y, Player.Radius)) { Player.X = x; Player.Y = y; }
            Player.KnockbackX *= .65f; Player.KnockbackY *= .65f;
        }

        private void HitArc()
        {
            int raw = (int)((Player.BaseAttack + Config.WeaponAttack + Config.WeaponEnhanceAttack + 15) * 6);
            int damage = (int)(raw * Config.DamageMultiplier) + attackBonus;
            attackBonus = 0;
            foreach (var enemy in Enemies) {
                if (!enemy.Alive || Distance(Player.X, Player.Y, enemy.X, enemy.Y) > (Config.WeaponRange!=0?Config.WeaponRange:50) + enemy.Radius) continue;
                double angle = Math.Atan2(enemy.Y - Player.Y, enemy.X - Player.X);
                double difference = ((angle-attackAngle) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI;
                if (Math.Abs(difference) >= (Config.WeaponArc!=0?Config.WeaponArc:.95f)) continue;
                bool wasAlive=enemy.Alive;
                HurtEnemy(enemy, damage, (float)angle);
                EmitFirstPracticeHit(enemy,"weapon",0,0,wasAlive,true);
            }
            HurtFieldMobs(Player.X, Player.Y, Config.WeaponRange != 0 ? Config.WeaponRange : 50, damage, null);   // hitArc ends with _hurtFieldMobs(P.x, P.y, range, baseDmg) (web 37832)
        }

        // Ordinary physical, no-status/affix branch of hurtE. Source shield first.
        public void HurtEnemy(EnemyState enemy, int damage, float angle = 0, bool dot = false, bool shieldHit = false)
        {
            ApplyEnemyDamage(enemy, damage, angle, false, 1, dot, shieldHit);
            if (!inEnemyLoop) FlushDeathSpawns();   // O-1: split / companion enemies of a kill made outside the frame loop (harness, smoke)
        }

        // hurtE: the oracle-checked Core head + middle (EnemyHurt) and, at zero HP, the death part (EnemyHurt.DeathHead + DeathTail, Simulation.Death.cs).
        private void ApplyEnemyDamage(EnemyState enemy, double damage, float angle, bool poiseHit, float knockbackMultiplier, bool dot = false, bool shieldHit = false, double typeDamagePct = 0, double critRateBonus = 0, bool arrow = false, int atkEl = 0, bool iceBlade = false, bool blueBean = false, bool parryBlueBean = false, bool magicHit = false, double? poiseMult = null, bool explode = false)
        {
            if (enemy == null || !enemy.Alive || enemy.Hp <= 0) return;
            // Source parryLesson.hurtEnemy: a valid hit defeats this lesson actor
            // directly; its inherited shield is untouched and no rewards roll.
            if(IsFirstPracticeActor(enemy)){ApplyPracticeDamage(enemy,Exoduser.UnityPort.Core.Combat.Js.Int(damage));return;}
            bool live = inEnemyLoop && enemy.Web != null;   // inside the L1 loop the web object is the live one (see ApplyEnemyDot): no state -> web copy
            var web = live ? enemy.Web : SyncToWeb(enemy);
            var player = HurtPlayerView();
            var context = BuildHurtContext(player, typeDamagePct, critRateBonus); context.CritSfxCd = critSfxCd;
            var opts = new EnemyHurtOpts { dot = dot ? (bool?)true : null, shieldHit = shieldHit ? (bool?)true : null, poiseHit = poiseHit ? (bool?)true : null, kbMult = knockbackMultiplier, noImpact = true, maxDist = arrow ? (double?)1 : null, iceBlade = iceBlade ? (bool?)true : null, blueBean = blueBean ? (bool?)true : null, parryBlueBean = parryBlueBean ? (bool?)true : null, magic = magicHit ? (bool?)true : null, poiseMult = poiseMult, explode = explode ? (bool?)true : null };
            if (live) { enemy.Hp = ToIntClamped(web.hp); enemy.Shield = (float)web.eShield; }
            double hpBefore = enemy.Hp, shieldBefore = enemy.Shield;
            hurtSfxEnemy = enemy;   // RM-1 sound: the hurt context reports hit / crit sounds for this enemy
            var head = EnemyHurt.Head(context, web, damage, angle, true, opts, atkEl);
            hitSfxCd = (int)context.HitSfxCd; hurtSfxEnemy = null;
            if (head == null) { critSfxCd = context.CritSfxCd; SyncFromWeb(enemy, web); ApplyHurtPlayerBack(player); return; }   // revive iframes swallowed it / parry lesson
            hurtSfxEnemy = enemy;
            var body = EnemyHurt.Body(context, web, angle, true, opts, head); critSfxCd = context.CritSfxCd;
            hitSfxCd = (int)context.HitSfxCd; hurtSfxEnemy = null;
            SyncFromWeb(enemy, web); ApplyHurtPlayerBack(player);
            int total = (int)((shieldBefore - enemy.Shield) + (hpBefore - enemy.Hp));
            LastHitDamage = total; TotalDamage += total; BossPainCheck(enemy);
            if (enemy.Hp <= 0) OnEnemyZeroHp(enemy, context, web, angle, opts, body);
            if (live) { web.alive = enemy.Alive; web.hp = enemy.Hp; }
        }

        // hurtE(e, dmg, undefined, true, {dot:true, [maliceHunt:true,] shieldHit:true}, atkEl): the DOT block of updateE. Same as ApplyEnemyDamage without an angle / knockback.
        private void ApplyEnemyDot(EnemyState enemy, int damage, bool maliceHunt, double atkEl)
        {
            if (enemy == null || !enemy.Alive || enemy.Hp <= 0 || IsFirstPracticeActor(enemy)) return;
            bool live = inEnemyLoop && enemy.Web != null;
            var web = live ? enemy.Web : SyncToWeb(enemy);
            var player = HurtPlayerView();
            var context = BuildHurtContext(player, 0, 0); context.CritSfxCd = critSfxCd;
            var opts = new EnemyHurtOpts { dot = true, shieldHit = true, maliceHunt = maliceHunt ? (bool?)true : null, noImpact = true };
            if (live) { enemy.Hp = ToIntClamped(web.hp); enemy.Shield = (float)web.eShield; }
            double hpBefore = enemy.Hp, shieldBefore = enemy.Shield;
            var head = EnemyHurt.Head(context, web, damage, null, true, opts, atkEl);
            if (head == null) { critSfxCd = context.CritSfxCd; SyncFromWeb(enemy, web); ApplyHurtPlayerBack(player); return; }
            var body = EnemyHurt.Body(context, web, null, true, opts, head); critSfxCd = context.CritSfxCd;
            SyncFromWeb(enemy, web); ApplyHurtPlayerBack(player);
            int total = (int)((shieldBefore - enemy.Shield) + (hpBefore - enemy.Hp));
            LastHitDamage = total; TotalDamage += total;
            if (enemy.Hp <= 0) OnEnemyZeroHp(enemy, context, web, null, opts, body);
            if (live) { web.alive = enemy.Alive; web.hp = enemy.Hp; }
        }

        // A kill that must not revive (RM-B1 last life, harness, practice trap): the web death part (Simulation.Death.cs) with the revive judgement already spent.
        // The old hand-assembled path (kills, combo, malice +4, potion, elite malice, equipment, exp in Unity order) is replaced by EnemyHurt.DeathHead + DeathTail (O-1).
        private void KillEnemy(EnemyState enemy)
        {
            if (!enemy.Alive) return;
            if(IsFirstPracticeActor(enemy)){enemy.Alive=false;return;}
            var context = BuildHurtContext(HurtPlayerView(), 0, 0); context.CritSfxCd = critSfxCd;
            var web = SyncToWeb(enemy); if (web.hp > 0) web.hp = 0;
            RunWebDeath(enemy, context, web, null, null, new EnemyHurtBodyResult(), true);
        }

        // D01: web rollDrop equipment half (WorldDrop/ItemFactory, oracle-checked against game.html). Bone parts, crystals and socket stones the
        // web rolls afterwards are other bags and not part of this slice. dropBonus = statDropBonus() (Config.DropBonus); no greed curse yet.
        // CHAPTER_STAGES startSi+stages-1 (game.html 16636-16644): the stage whose boss is the chapter boss
        private static readonly int[] ChapterLastStage = { 3, 9, 13, 20, 25, 31, 34 };
        public int MinPickRarity, MinPickLevelTier;
        public Func<double> NowMs = () => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        private void RollNormalEquipment(EnemyState enemy)
        {
            var tier = WorldDrop.Classify(enemy.IsBoss, enemy.Etype, enemy.Elite, Array.IndexOf(ChapterLastStage, Config.StageIndex) >= 0);
            int dropTier = Math.Min((int)EnemyTables.SiToHell[Math.Min(Config.StageIndex, EnemyTables.SiToHell.Length - 1)], 4);
            var options = new WorldDrop.Options { MinPickRarity = MinPickRarity, MinPickLevelTier = MinPickLevelTier, PlayerLevel = Player.Level, NowMs = NowMs(), DemoMode = BuildIsDemo };
            foreach (var drop in WorldDrop.Roll(tier, Config.DropBonus, dropTier, enemy.X, enemy.Y, options, NextRandom, () => nextLootId++)) WorldDrop.Push(Loot, drop);
        }
        // _DEMO_MODE only bans a few affixes in rollAffixes; the Steam/EA builds are not demo.
        public bool BuildIsDemo;

        private void PickSourcePriorityLoot()
        {
            // R pickup is highest rarity on screen, then nearest (32935-32942).
            // Missing viewport/factory/inventory owners must not fake a pickup.
            if (IsLootOnScreen == null || TryCollectLoot == null) return;
            LootState best = null; float bestDistance = float.MaxValue;
            foreach (var loot in Loot) {
                if (loot.Picked || !IsLootOnScreen(loot)) continue;
                float d = Distance(Player.X, Player.Y, loot.X, loot.Y);
                if (best == null || loot.Rarity > best.Rarity || (loot.Rarity == best.Rarity && d < bestDistance)) { best = loot; bestDistance = d; }
            }
            if (best == null || !TryCollectLoot(best)) return;
            best.Picked = true; CollectedLoot.Add(best); Loot.Remove(best); // the web drops picked entries from worldItems
        }

        public static int CalculateMaxExperience(int level) { return LevelExp.MaxExperience(level); }

        // Raised once per addExp call that gained a level (web addExp 43226-43242); NativeGame shows the A20 overlay from it.
        public event Action<LevelUpEvent> LevelledUp;
        public Func<string> TodayKey = () => LevelExp.TodayKey(DateTime.Now);

        public void AddExperience(int input, bool trans = false)
        {
            var ctx = new ExpContext { AffixExpBonus = Config.ExpBonus, DemoLevelCap = Config.LevelCap, Today = TodayKey() };
            var up = LevelExp.Add(Player, input, trans, ctx);
            if (up == null) return;
            // Web 43228: +20% of each maximum, capped. Passive-queue auto-invest (_processPassiveQueue) and the Lv300/700 skill unlocks belong to the passive/skill rows.
            Player.Hp = Math.Min(Player.MaxHp, Player.Hp + (int)(Player.MaxHp * .2));
            Player.Stamina = Math.Min(Player.MaxStamina, Player.Stamina + (int)(Player.MaxStamina * .2));
            Player.Mana = Math.Min(Player.MaxMana, Player.Mana + (int)(Player.MaxMana * .2));
            var handler = LevelledUp; if (handler != null) handler(up);
        }

        private void TickEnemy(EnemyState enemy)
        {
            if (Math.Abs(enemy.KnockbackX) > .1 || Math.Abs(enemy.KnockbackY) > .1) {
                float x = enemy.X + enemy.KnockbackX, y = enemy.Y + enemy.KnockbackY;
                if (Pass(x, y, enemy.Radius)) { enemy.X = x; enemy.Y = y; }
                else { enemy.KnockbackX = 0; enemy.KnockbackY = 0; } // wall-damage owner pending
                enemy.KnockbackX *= .85f; enemy.KnockbackY *= .85f;
            }
            if (enemy.HitStun > 0) return;
            if (enemy.Stunned > 0) {
                enemy.ProjectileChargeTicks = 0;
                enemy.Stunned = Math.Min(enemy.Stunned, 180);
                enemy.MaxStunned = Math.Max(enemy.MaxStunned, enemy.Stunned);
                return;
            }
            // Source38663-38665: ordinary regen runs only after both early-return
            // gates. Expiring stun does not replenish all ordinary poise.
            if (enemy.Poise < enemy.MaxPoise) {
                enemy.PoiseRegenTicks++;
                if (enemy.PoiseRegenTicks >= 200) {
                    enemy.Poise = Math.Min(enemy.MaxPoise, enemy.Poise + (int)(enemy.MaxPoise * .15));
                    enemy.PoiseRegenTicks = 0;
                }
            }
            float d = Distance(Player.X, Player.Y, enemy.X, enemy.Y);
            // updateE 38764: revive aggro, double-speed chase until the player is within 200
            if (enemy.ReviveChase && d > 200 && (enemy.State == "idle" || enemy.State == "recover")) { MoveEnemyFallback(enemy, 2); d = Distance(Player.X, Player.Y, enemy.X, enemy.Y); if (d <= 200) enemy.ReviveChase = false; }
            if (!enemy.Alerted && d < 800 && (HasLineOfSight == null || HasLineOfSight(enemy.X, enemy.Y, Player.X, Player.Y))) enemy.Alerted = true;
            if (d < 800 && enemy.Alerted) enemy.Facing = (float)Math.Atan2(Player.Y - enemy.Y, Player.X - enemy.X);
            if (enemy.Alerted && d > 30) MoveEnemyFallback(enemy);
            d = Distance(Player.X, Player.Y, enemy.X, enemy.Y);
            if (!enemy.Alerted && d > 400) return;
            enemy.StateTicks--;
            // The source idle pursuit branch at 40484 is in addition to its flow
            // field movement. Tickets are intentionally excluded by project rules.
            float nx = enemy.X + (float)Math.Cos(enemy.Facing) * enemy.Speed * 1.6f;
            float ny = enemy.Y + (float)Math.Sin(enemy.Facing) * enemy.Speed * 1.6f;
            if (Pass(nx, ny, enemy.Radius)) { enemy.X = nx; enemy.Y = ny; }
            if (d < enemy.Radius + Player.Radius + 8 && Player.Iframes <= 0 && enemy.StateTicks <= 0) {
                HurtPlayer((int)(enemy.Attack * .8)); enemy.StateTicks = 40 + (int)(NextRandom() * 20);
            }
            // Ranged/protected projectile classes are not silently replaced by
            // melee or invented bullets. Preserve their source charge countdown.
            if (enemy.ProjectileChargeTicks > 0) enemy.ProjectileChargeTicks--;
            else { enemy.ProjectileTicks--; if (enemy.ProjectileTicks <= 0 && d < 400) { enemy.ProjectileTicks = 240; enemy.ProjectileChargeTicks = 60; QueueLogicalSound("tell_ranged", "ranged 60f attack ring", enemy.X, enemy.Y); } }
        }

        private void MoveEnemyFallback(EnemyState enemy, float speedMultiplier = 1)
        {
            double angle = Math.Atan2(Player.Y-enemy.Y, Player.X-enemy.X);
            float dx = enemy.HasLastMove ? enemy.LastMoveX : (float)Math.Cos(angle);
            float dy = enemy.HasLastMove ? enemy.LastMoveY : (float)Math.Sin(angle);
            float nx=enemy.X+dx*enemy.Speed*speedMultiplier, ny=enemy.Y+dy*enemy.Speed*speedMultiplier;
            if (Pass(nx,ny,enemy.Radius)) { enemy.X=nx; enemy.Y=ny; enemy.StuckTicks=0; }
            else if (Pass(nx,enemy.Y,enemy.Radius)) { enemy.X=nx; enemy.LastMoveX=dx; enemy.LastMoveY=0; enemy.HasLastMove=true; enemy.StuckTicks=0; }
            else if (Pass(enemy.X,ny,enemy.Radius)) { enemy.Y=ny; enemy.LastMoveX=0; enemy.LastMoveY=dy; enemy.HasLastMove=true; enemy.StuckTicks=0; }
            else enemy.StuckTicks++; // full flow-field/stuck escape remains pending
        }

    }
}
