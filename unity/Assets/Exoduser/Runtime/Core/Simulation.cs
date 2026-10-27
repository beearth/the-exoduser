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
        }

        private double NextRandom()
        {
            double value;
            if (Random01 != null) value = Random01();
            else { randomState = unchecked(randomState * 1664525u + 1013904223u); value = randomState / 4294967296.0; }
            if (double.IsNaN(value) || value < 0 || value >= 1) throw new InvalidOperationException("Random provider must return [0,1).");
            return value;
        }

        private bool Pass(float x, float y, float radius) => CanMove == null || CanMove(x, y, radius);
        private static float Distance(float x, float y, float xx, float yy) { return (float)Math.Sqrt((x-xx)*(x-xx)+(y-yy)*(y-yy)); }
        private static bool Finite(float value) => !float.IsInfinity(value) && !float.IsNaN(value);

        // mkEn 31127-31170: explicitly ordinary etype0, no elite roll or substitution.
        public EnemyState SpawnNormalEnemy(float x, float y)
        {
            if (!Finite(x) || !Finite(y) || !Pass(x, y, 10)) return null;
            int level = Math.Max(1, Player.Level + (Config.DifficultyIndex - 5) * 100);
            double curve = (level <= 500 ? .4 * level * level * level + 199 * level + 100 : 50000000 * Math.Pow(1.0014, level - 500)) * 2.925;
            double pacing = 1 / (1 + Math.Min(9, Math.Max(0, level - 1)) / 18.0);
            int hp = (int)Math.Floor(Math.Floor(curve * pacing * Difficulty[Config.DifficultyIndex]) * (1 + Config.StageIndex * .02));
            var enemy = new EnemyState {
                Id = nextEnemyId++, Etype = 0, X = x, Y = y, Hp = hp, MaxHp = hp,
                Shield = hp, MaxShield = hp, Poise = hp, MaxPoise = hp, Level = level,
                Attack = (int)Math.Floor((50 + level * 1.95) * .6 * Difficulty[Config.DifficultyIndex]),
                Speed = (float)((.3 * 1.3 + NextRandom() * .08) * 1.5),
                Radius = (float)((10 + NextRandom() * 2) * 2),
                StateTicks = (float)(30 + NextRandom() * 50), Facing = (float)(NextRandom() * Math.PI * 2),
                ProjectileTicks = (float)(180 + NextRandom() * 120)
            };
            Enemies.Add(enemy);
            return enemy;
        }

        public void Tick(float moveX, float moveY, float aimX, float aimY, bool attack, bool pickup)
        {
            executingFirstPracticeTick=true;
            try { TickFirstPracticeObserved(moveX,moveY,aimX,aimY,attack,pickup); }
            finally { executingFirstPracticeTick=false; }
        }
        private void TickFirstPracticeObserved(float moveX,float moveY,float aimX,float aimY,bool attack,bool pickup)
        {
            if (!Finite(moveX) || !Finite(moveY) || !Finite(aimX) || !Finite(aimY)) throw new ArgumentException("Non-finite input");
            TickCount++;
            LastHitDamage = 0;
            if (ComboTicks > 0) { ComboTicks--; if (ComboTicks <= 0) Combo = 0; }
            if (Player.Hp <= 0 || Player.State == "dead" || Player.State == "fallen") { UpdateKiProjectiles(); TickKiTimers(); return; }
            Player.Facing = (float)Math.Atan2(aimY - Player.Y, aimX - Player.X);
            float regenDivisor = Player.State == "idle" ? 8 : 16;
            Player.Hp = Math.Min(Player.MaxHp, Player.Hp + Config.PlayerHpRegen / regenDivisor);
            Player.Stamina = Math.Min(Player.MaxStamina, Player.Stamina + Config.PlayerStaminaRegen / regenDivisor);
            Player.Mana = Math.Min(Player.MaxMana, Player.Mana + Config.PlayerManaRegen / regenDivisor);
            Player.StateTicks--;
            Player.Iframes = Math.Max(0, Player.Iframes - 1);
            MoveKnockback();
            if (Player.State == "stagger" || Player.State == "pStun") {
                if (Player.StateTicks <= 0) { Player.State = "idle"; if (Player.Poise <= 0) Player.Poise = 4; }
            }
            else {
                MovePlayer(moveX, moveY, Player.State == "idle" ? 1 : .8f);
                if (Player.State == "idle") {
                    float cost = Config.ActiveAttack == "kiSlash" ? 10 + (Math.Max(1, Config.KiSlashLevel) - 1) * 2 : 5;
                    if (attack && Player.Stamina >= cost) {
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
            foreach (var enemy in Enemies) {
                if (!enemy.Alive) continue;
                enemy.HurtTicks = Math.Max(0, enemy.HurtTicks - 1);
                enemy.HitStun = Math.Max(0, enemy.HitStun - 1);
                if (enemy.Stunned > 0) {
                    enemy.Stunned = Math.Max(0, enemy.Stunned - 1);
                }
                // Source34456 resets poise here only for bosses. This admitted
                // ordinary profile only clears the stun presentation marker.
                if (enemy.Stunned <= 0 && enemy.MaxStunned > 0) enemy.MaxStunned = 0;
                if (Config.EnemyAiEnabled) TickEnemy(enemy);
            }
            UpdateKiProjectiles();
            TickKiTimers();
            // Web update() auto potion block (game.html 35895-35911): runs once per frame after the enemy loop.
            TickAutoPotion();
            if (pickup) { if (pickupHoldTicks == 0 || pickupHoldTicks >= 9) { PickSourcePriorityLoot(); pickupHoldTicks = 0; } pickupHoldTicks++; }
            else pickupHoldTicks = 0;
        }

        private void MovePlayer(float x, float y, float multiplier)
        {
            double length = Math.Sqrt(x*x+y*y);
            if (length <= 0) return;
            float distance = Player.Speed * multiplier;
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
        }

        // Ordinary physical, no-status/affix branch of hurtE. Source shield first.
        public void HurtEnemy(EnemyState enemy, int damage, float angle = 0)
        {
            ApplyEnemyDamage(enemy, damage, angle, false, 1);
        }

        private void ApplyEnemyDamage(EnemyState enemy, int damage, float angle, bool poiseHit, float knockbackMultiplier)
        {
            if (enemy == null || !enemy.Alive || enemy.Hp <= 0) return;
            if (enemy.Etype != 0) throw new NotSupportedException("Only admitted normal etype0 profile is implemented.");
            // Source parryLesson.hurtEnemy: a valid hit defeats this lesson actor
            // directly; its inherited shield is untouched and no rewards roll.
            if(IsFirstPracticeActor(enemy)){enemy.Hp=0;KillEnemy(enemy);return;}
            damage = Math.Max(1, damage);
            if (Config.AccessoryDamageBonus > 0) damage = (int)(damage * (1 + Config.AccessoryDamageBonus));
            if (NextRandom() * 100 < Config.PlayerCriticalChance) damage = (int)(damage * Config.PlayerCriticalMultiplier);
            if (enemy.Stunned > 0) damage = (int)(damage * 1.5);
            int total = damage;
            int shieldAbsorbed = (int)Math.Min(enemy.Shield, damage);
            enemy.Shield = Math.Max(0, enemy.Shield - damage);
            damage = Math.Max(0, damage - shieldAbsorbed);
            LastHitDamage = total; TotalDamage += total; enemy.HurtTicks = 6;
            if (damage > 0) {
                enemy.Alerted = true;
                if (enemy.State == "recover") { enemy.State = "idle"; enemy.StateTicks = 0; }
                else if (enemy.State == "idle" && enemy.StateTicks > 5) enemy.StateTicks = 5;
                enemy.Hp -= damage;
                if (enemy.State == "idle") enemy.HitStun = 8;
            }
            float knockback = Math.Min(damage * .25f * knockbackMultiplier, 15 * knockbackMultiplier);
            enemy.KnockbackX += (float)Math.Cos(angle) * knockback;
            enemy.KnockbackY += (float)Math.Sin(angle) * knockback;
            if (poiseHit && damage > 0) {
                enemy.Poise = Math.Max(0, enemy.Poise - damage);
                enemy.PoiseRegenTicks = 0;
                if (enemy.Poise <= 0) { enemy.Stunned = Math.Max(enemy.Stunned, 180); enemy.MaxStunned = Math.Max(enemy.MaxStunned, 180); }
            }
            if (enemy.Hp <= 0) KillEnemy(enemy);
        }

        private void KillEnemy(EnemyState enemy)
        {
            if (!enemy.Alive) return;
            if(IsFirstPracticeActor(enemy)){enemy.Alive=false;return;}
            enemy.Alive = false; Kills++; Combo++; ComboTicks = Math.Min(1200, ComboTicks + 60);
            Materials += 4;
            // Web kill drop (game.html 43094-43099): hp pays malice (+1, a third of the draws), st/mp are discarded; the old quickslot counters stay unused.
            ApplyKillDrop(enemy);
            RollNormalEquipment(enemy);
            double bonus = 1 + (Combo / 100) * .05 + Math.Max(0, Config.DifficultyIndex - 5) * .10;
            AddExperience((int)(Math.Max(5, (int)(enemy.Level * .4)) * bonus));
        }

        // D01: web rollDrop equipment half (WorldDrop/ItemFactory, oracle-checked against game.html). Bone parts, crystals and socket stones the
        // web rolls afterwards are other bags and not part of this slice. dropBonus = statDropBonus() (Config.DropBonus); no greed curse yet.
        public int MinPickRarity, MinPickLevelTier;
        public Func<double> NowMs = () => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        private void RollNormalEquipment(EnemyState enemy)
        {
            var tier = WorldDrop.Classify(false, enemy.Etype, 0, false);
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

        public static int CalculateMaxExperience(int level)
        {
            if (level < 1) throw new ArgumentOutOfRangeException(nameof(level));
            if (level < 1000) return (int)((15 + level * 2.5 + level * level * .05) * Math.Pow(1.001, level));
            return (int)Math.Floor(5000000 + (double)(level - 999) * (level - 999) * 10000);
        }

        public void AddExperience(int input)
        {
            Player.Experience += input / 3;
            bool levelled = false;
            // This slice excludes transcendence, its date lock and unlock side effects.
            while (Player.Experience >= Player.MaxExperience && Player.Level < 1000) {
                Player.Experience -= Player.MaxExperience; Player.Level++; levelled = true;
                Player.MaxExperience = CalculateMaxExperience(Player.Level); Player.StatPoints += 3;
                if (Player.Level % 2 == 0) Player.PassivePoints++;
            }
            if (levelled) {
                Player.Hp = Math.Min(Player.MaxHp, Player.Hp + (int)(Player.MaxHp * .2));
                Player.Stamina = Math.Min(Player.MaxStamina, Player.Stamina + (int)(Player.MaxStamina * .2));
                Player.Mana = Math.Min(Player.MaxMana, Player.Mana + (int)(Player.MaxMana * .2));
            }
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
            else { enemy.ProjectileTicks--; if (enemy.ProjectileTicks <= 0 && d < 400) { enemy.ProjectileTicks = 240; enemy.ProjectileChargeTicks = 60; } }
        }

        private void MoveEnemyFallback(EnemyState enemy)
        {
            double angle = Math.Atan2(Player.Y-enemy.Y, Player.X-enemy.X);
            float dx = enemy.HasLastMove ? enemy.LastMoveX : (float)Math.Cos(angle);
            float dy = enemy.HasLastMove ? enemy.LastMoveY : (float)Math.Sin(angle);
            float nx=enemy.X+dx*enemy.Speed, ny=enemy.Y+dy*enemy.Speed;
            if (Pass(nx,ny,enemy.Radius)) { enemy.X=nx; enemy.Y=ny; enemy.StuckTicks=0; }
            else if (Pass(nx,enemy.Y,enemy.Radius)) { enemy.X=nx; enemy.LastMoveX=dx; enemy.LastMoveY=0; enemy.HasLastMove=true; enemy.StuckTicks=0; }
            else if (Pass(enemy.X,ny,enemy.Radius)) { enemy.Y=ny; enemy.LastMoveX=0; enemy.LastMoveY=dy; enemy.HasLastMove=true; enemy.StuckTicks=0; }
            else enemy.StuckTicks++; // full flow-field/stuck escape remains pending
        }

        public void HurtPlayer(int damage)
        {
            if (Player.Hp <= 0 || Player.Iframes > 0) return;
            double dr = Math.Min(.75, Config.PlayerPhysicalDefense / (Config.PlayerPhysicalDefense + 2500.0));
            int capped = Math.Min(damage, (int)(Player.MaxHp * .33));
            int amount = Math.Max(Math.Max(1, (int)(Player.MaxHp * .005)), Math.Max(1, (int)(capped * (1-dr))));
            float absorbed = Math.Min(Player.Shield, amount); Player.Shield -= absorbed;
            Player.Hp -= amount-absorbed;
            Player.Poise = Math.Max(0, Player.Poise-1);
            if (Player.Poise <= 0) { Player.State = "pStun"; Player.StateTicks = 240; CancelKiCharge(); }
            else if (!Player.KiChargeActive) { Player.State = "stagger"; Player.StateTicks = 6; }
            if (Player.Hp <= 0) { Player.Hp=0; Player.State="fallen"; Player.StateTicks=300; Player.Iframes=9999; CancelKiCharge(); }
        }
    }
}
