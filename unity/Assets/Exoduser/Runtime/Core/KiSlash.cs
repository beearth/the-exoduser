using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    [Serializable]
    public sealed class ProjectileState
    {
        public int Id, Damage, Step;
        public bool Active, PoiseHit = true, NoImpact = true;
        public float X, Y, Vx, Vy, Angle, Life, MaxLife, Radius, ChargeScale;
        public float KnockbackMultiplier = .5f;
        public readonly float[] TrailX = new float[5], TrailY = new float[5];
        public int TrailHead;
        // The original Set stores actor identity, not an ID that could be reused.
        internal readonly HashSet<EnemyState> HitEnemies = new HashSet<EnemyState>();
    }

    public sealed partial class Simulation
    {
        public readonly List<ProjectileState> Projectiles = new List<ProjectileState>();
        public Func<float, float, bool> IsProjectileWall;
        public int KiComboStep;
        public float KiComboTicks, KiCooldownTicks;
        private int nextProjectileId = 1;

        public static int KiChargeTier(float frames)
        {
            return Math.Min(3, (int)Math.Floor(Math.Max(0, frames) / 40));
        }

        public int CalculateKiSlashDamage(int step, float chargeFrames = 0)
        {
            int level = Math.Max(1, Config.KiSlashLevel);
            double reference = Config.WeaponAttack + Config.WeaponEnhanceAttack + Player.BaseAttack + Config.StrengthFlat + (int)(Player.Level * .5);
            double skill = 12 + (level - 1) * 10.08 * .5;
            double charge = step == 3 ? Math.Pow(2, KiChargeTier(chargeFrames)) : 1;
            return (int)(reference * 7.0 * Config.DamageMultiplier * skill * charge);
        }

        // Source _fireKiSlashCrescent + spawnCrescent. Direct calls are a numeric
        // harness API; real Tick admission is responsible for stamina/state.
        public ProjectileState SpawnKiSlash(int step, float chargeFrames = 0)
        {
            if (step < 1 || step > 3 || !Finite(chargeFrames)) throw new ArgumentOutOfRangeException(nameof(step));
            KiComboStep = step; KiComboTicks = 120; KiCooldownTicks = step == 3 ? 20 : 12;
            ProjectileState projectile = null;
            foreach (var candidate in Projectiles) if (!candidate.Active) { projectile = candidate; break; }
            if (projectile == null) {
                if (Projectiles.Count >= 16) return null;
                projectile = new ProjectileState(); Projectiles.Add(projectile);
            }
            projectile.Id = nextProjectileId++; projectile.Active = true;
            projectile.X = Player.X; projectile.Y = Player.Y; projectile.Angle = Player.Facing;
            projectile.Vx = (float)Math.Cos(Player.Facing) * 14;
            projectile.Vy = (float)Math.Sin(Player.Facing) * 14;
            projectile.Life = (int)(((step == 1 ? 250 : step == 2 ? 300 : 350) + (Math.Max(1, Config.KiSlashLevel) - 1) * 15) / 14.0);
            projectile.MaxLife = projectile.Life;
            projectile.ChargeScale = step == 3 ? (float)(1 + KiChargeTier(chargeFrames) * .4) : 1;
            projectile.Radius = (step == 3 ? 120 : 55) * projectile.ChargeScale;
            projectile.Step = step; projectile.Damage = CalculateKiSlashDamage(step, chargeFrames);
            for (int i = 0; i < 5; i++) { projectile.TrailX[i] = Player.X; projectile.TrailY[i] = Player.Y; }
            projectile.TrailHead = 0;
            projectile.HitEnemies.Clear();
            return projectile;
        }

        private void UpdateKiProjectiles()
        {
            foreach (var projectile in Projectiles) {
                if (!projectile.Active) continue;
                projectile.Life--;
                if (projectile.Life <= 0) { projectile.Active = false; continue; }
                projectile.X += projectile.Vx; projectile.Y += projectile.Vy;
                projectile.TrailHead = (projectile.TrailHead + 1) % 5;
                projectile.TrailX[projectile.TrailHead] = projectile.X;
                projectile.TrailY[projectile.TrailHead] = projectile.Y;
                bool wall = IsProjectileWall != null ? IsProjectileWall(projectile.X, projectile.Y) : !Pass(projectile.X, projectile.Y, 0);
                if (wall) { projectile.Active = false; continue; }
                foreach (var enemy in Enemies) {
                    if (!enemy.Alive || !Finite(enemy.X) || !Finite(enemy.Y) || projectile.HitEnemies.Contains(enemy)) continue;
                    if (!(Distance(projectile.X, projectile.Y, enemy.X, enemy.Y) < projectile.Radius + enemy.Radius)) continue;
                    if (HasLineOfSight != null && !HasLineOfSight(projectile.X, projectile.Y, enemy.X, enemy.Y)) continue;
                    projectile.HitEnemies.Add(enemy);
                    float angle = (float)Math.Atan2(enemy.Y - projectile.Y, enemy.X - projectile.X);
                    // Admitted ordinary physical profile has no impact/element
                    // reaction owner. Never invent noElReact (absent in source).
                    ApplyEnemyDamage(enemy, projectile.Damage, angle, true, .5f);
                }
            }
        }

        private void TickKiTimers()
        {
            if (KiCooldownTicks > 0) KiCooldownTicks--;
            if (KiComboTicks > 0) { KiComboTicks--; if (KiComboTicks <= 0) KiComboStep = 0; }
        }

        private void CancelKiCharge()
        {
            Player.KiChargeActive = false; Player.KiChargeTicks = 0;
            KiComboStep = 0; KiComboTicks = 0;
        }
    }
}
