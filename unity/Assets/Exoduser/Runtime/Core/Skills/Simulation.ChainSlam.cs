using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    public sealed class ChainSlamWave
    {
        public int Id, Element;
        public double X, Y, Angle, MaxR, HalfWidth, Damage, T, MaxT = 32;
        public readonly HashSet<EnemyState> Hits = new HashSet<EnemyState>();
    }

    public sealed partial class Simulation
    {
        public readonly List<ChainSlamWave> ChainSlamWaves = new List<ChainSlamWave>();
        public double ChainSkillDelay, ChainSlamAngle, ChainSlamAim = double.NaN;
        public bool ChainSlamReady, ChainAssaultReady;
        bool chainWeaponJust, chainShieldJust, chainInputPending, chainAttackPrevious;

        // Native는 실제 just 입력을 전달한다. CPU 호출자는 attack의 엣지를 기본으로 쓴다.
        public void SetChainLandingInput(bool weaponJust, bool shieldJust)
        {
            chainWeaponJust = weaponJust; chainShieldJust = shieldJust; chainInputPending = true;
        }
        void BeginChainLandingInput(bool attack)
        {
            if (!chainInputPending) { chainWeaponJust = attack && !chainAttackPrevious; chainShieldJust = combatEHeld && !combatEPrev; }
            chainAttackPrevious = attack; chainInputPending = false;
        }
        void TickChainSlamInput()
        {
            if (ChainSkillDelay <= 0 && (HarpActive || DashActive) && Skills.Learned("chainSlam") && (chainWeaponJust || chainShieldJust) && !ChainSlamReady && !ChainAssaultReady)
            {
                int cost = ChainSlamRules.StaminaCost(Skills.Level("chainSlam"));
                if (Player.Stamina >= cost)
                {
                    Player.Stamina -= cost; ChainSlamReady = true;
                    ChainSlamAngle = double.IsNaN(ChainSlamAim) ? Player.Facing : ChainSlamAim;
                }
                else RaisePlayerText(Player.X, Player.Y - 25, "ST 부족!", "#ff4444", 30);
            }
            if (!DashActive && !HarpActive) ChainSlamReady = false;
            chainWeaponJust = chainShieldJust = false; ChainSlamAim = double.NaN;
        }
        void LandChainSlam()
        {
            if (!ChainSlamReady) return;
            ChainSlamReady = false; int lv = Math.Max(1, Skills.Level("chainSlam"));
            var weapon = EquippedInventory != null ? EquippedInventory.GetEquipped("weapon") : null;
            ChainSlamWaves.Add(new ChainSlamWave { Id = nextZoneId++, X = Player.X, Y = Player.Y, Angle = ChainSlamAngle,
                MaxR = ChainSlamRules.Range(lv), HalfWidth = ChainSlamRules.HalfWidth(lv), Element = weapon != null ? weapon.el : 0,
                Damage = ChainSlamRules.Damage(MeleeReference(), lv, Config.DamageMultiplier, EquippedInventory != null ? EquippedInventory.AffixTotal("skillBoost") : 0, HarpTier) });
            SbCd = Math.Max(SbCd, 30); combatEHeld = false;
            ReflectChainSlam();
            // 기동불꽃 폭발은 해당 장판 생산자 이식과 함께 검증한다.
        }
        void ReflectChainSlam()
        {
            if (Druid == null || Druid.Remodel) return; // 리모델 드루이드 반사 금지 계약 유지
            double radius = 150 + (Math.Max(1, Skills.Level("chainSlam")) - 1) * 15;
            for (int i = Druid.Projectiles.Count - 1; i >= 0; i--)
            {
                var p = Druid.Projectiles[i];
                // 무지개탄은 사용자 확정 Q 전용. 원문의 착지 우회는 복제하지 않는다.
                if (!p.Active || p.Friendly || p.Life == 0 || p.BlackBean || p.FbEnergy || p.FdEnergy) continue;
                double dx = p.X - Player.X, dy = p.Y - Player.Y;
                if (Math.Sqrt(dx * dx + dy * dy) > radius) continue;
                var counter = ReflectInput(0).Counter; counter.BulletDmg = p.Dmg; counter.IsQ = true;
                p.Dmg = Js.Int(ParryRules.ParryProjectileDamage(counter) * 1.5);
                p.Friendly = true; p.Vx *= -1.5; p.Vy *= -1.5; p.Life = p.Ml = 80;
                p.BlueBean = p.ParryBlueBean = p.Magic = p.Homing = true;
                p.Col = "#00e5ff"; p.AoeR = p.AoeDmg = 0;
            }
        }

        // 실제 적 이동·상태 감소가 끝난 장판 후반에서 호출할 균열 갱신이다.
        private void TickChainSlamWaves()
        {
            for (int i = 0; i < ChainSlamWaves.Count; i++)
            {
                var wave = ChainSlamWaves[i]; double old = wave.T; wave.T++;
                if (old < 10)
                {
                    double reach = wave.MaxR * Math.Min(1, wave.T / 10);
                    foreach (var enemy in Enemies.ToArray())
                    {
                        if (!enemy.Alive || wave.Hits.Contains(enemy) || !ChainSlamRules.RayHit(enemy.X, enemy.Y, enemy.Radius, wave.X, wave.Y, wave.Angle, wave.HalfWidth, reach)) continue;
                        wave.Hits.Add(enemy);
                        double angle = Math.Atan2(enemy.Y - wave.Y, enemy.X - wave.X);
                        int damage = Js.Int(wave.Damage * EnemyHurt.ElMul(wave.Element, enemy.Web != null ? enemy.Web.el : 0));
                        if (enemy.IsBoss)
                        {
                            ApplyEnemyDamage(enemy, damage, (float)angle, false, .8f, false, false, 0, 0, false, wave.Element);
                            PoiseHitEnemy(enemy, Js.Int(enemy.MaxPoise * .30));
                        }
                        else
                        {
                            ApplyEnemyDamage(enemy, damage, (float)angle, true, .8f, false, false, 0, 0, false, wave.Element, false, false, false, false, 1.5);
                            enemy.Stunned = Math.Max(enemy.Stunned, 300);
                            if (enemy.Web != null) enemy.Web.stunned = enemy.Stunned;
                            RaisePlayerText(enemy.X, enemy.Y - 18, "💫 기절!", "#c8b69c", 35);
                        }
                        enemy.KnockbackX += (float)(Math.Cos(angle) * 5); enemy.KnockbackY += (float)(Math.Sin(angle) * 5);
                    }
                    if (!inEnemyLoop) FlushDeathSpawns();
                }
                if (wave.T >= wave.MaxT) ChainSlamWaves.RemoveAt(i--);
            }
        }
    }
}
