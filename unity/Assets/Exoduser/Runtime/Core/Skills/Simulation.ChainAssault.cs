using System;
using System.Linq;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;
using Exoduser.UnityPort.Core.Skills;

namespace Exoduser.UnityPort.Core
{
    public sealed class ChainAssaultBurst
    {
        public int Id, Tick, Stack, Tier;
        public float X, Y, Radius;
        public bool Detonation;
    }
    public sealed partial class Simulation
    {
        public readonly List<ChainAssaultBurst> ChainAssaultBursts = new List<ChainAssaultBurst>();
        int nextAssaultBurstId;
        bool assaultBeamJust, assaultBowJust, assaultInputPending, assaultBeamPrevious, assaultBowPrevious, idleChainDetonation;
        public void SetChainAssaultInput(bool beamJust, bool bowJust)
        {
            assaultBeamJust = beamJust; assaultBowJust = bowJust; assaultInputPending = true;
        }
        void BeginChainAssaultInput()
        {
            ChainAssaultBursts.RemoveAll(burst => TickCount - burst.Tick >= 160);
            idleChainDetonation = false;
            if (!assaultInputPending) { assaultBeamJust = magicHeld && !assaultBeamPrevious; assaultBowJust = skSpace && !assaultBowPrevious; }
            assaultBeamPrevious = magicHeld; assaultBowPrevious = skSpace; assaultInputPending = false;
        }
        bool AssaultJust(string action) { return SourceJustInput != null ? SourceJustInput(action) : action == "beam" ? assaultBeamJust : assaultBowJust; }
        void TickChainAssaultInput()
        {
            if (ChainSkillDelay <= 0 && (HarpActive || DashActive) && Skills.Learned("chainAssault") && (AssaultJust("beam") || AssaultJust("bow")) && !ChainAssaultReady && !ChainSlamReady)
            {
                int cost = ChainAssaultRules.ManaCost(Skills.Level("chainAssault"));
                if (Player.Mana >= cost) { Player.Mana -= cost; ChainAssaultReady = true; }
                else RaisePlayerText(Player.X, Player.Y - 25, "MP 부족!", "#4444ff", 30);
            }
            if (!DashActive && !HarpActive) ChainAssaultReady = false;
            assaultBeamJust = assaultBowJust = false;
        }
        void LandChainAssault()
        {
            if (!ChainAssaultReady) return;
            ChainAssaultReady = false;
            int lv = Math.Max(1, Skills.Level("chainAssault")), tier = Math.Max(1, Math.Min(3, HarpTier));
            double boost = EquippedInventory != null ? EquippedInventory.AffixTotal("skillBoost") : 0;
            int damage = ChainAssaultRules.Damage(MagicReference(), lv, MagicDamageMultiplier(), boost, tier);
            double range = ChainAssaultRules.Range(lv);
            foreach (var enemy in Enemies.ToArray())
            {
                if (!enemy.Alive || Distance(Player.X, Player.Y, enemy.X, enemy.Y) > range + enemy.Radius) continue;
                double angle = Math.Atan2(enemy.Y - Player.Y, enemy.X - Player.X);
                int hit = Js.Int(damage * EnemyHurt.ElMul(1, enemy.Web != null ? enemy.Web.el : 0));
                ApplyEnemyDamage(enemy, hit, (float)angle, true, .6f, false, false, 0, 0, false, 1, false, false, false, false, 1.5);
                enemy.KnockbackX += (float)(Math.Cos(angle) * 6); enemy.KnockbackY += (float)(Math.Sin(angle) * 6);
                RaisePlayerText(enemy.X, enemy.Y - 18, "🔥 기동불꽃!", "#ff4400", 35);
            }
            if (!inEnemyLoop) FlushDeathSpawns();
            double radius = ChainAssaultRules.ZoneRadius(lv), dot = ChainAssaultRules.ZoneDamage(damage);
            foreach (var zone in FireZones)
            {
                if (zone.Type != "assaultFlame" || Distance(Player.X, Player.Y, zone.X, zone.Y) > zone.R || zone.AfStack >= 3) continue;
                zone.AfStack++; zone.R = Js.Int(zone.AfBaseR * (1 + zone.AfStack * .15));
                zone.Dmg = zone.AfBaseDmg * (1 + zone.AfStack * .5);
                zone.MaxT = 300 * (zone.AfStack == 3 ? 9 : zone.AfStack == 2 ? 6 : 3);
                zone.T = 0; zone.Revision++; // 원문 _fp=null: 표시 캐시만 다시 만든다. DOT 타이머는 유지한다.
            }
            int count = 0, old = -1; double ratio = -1;
            for (int i = 0; i < FireZones.Count; i++)
            {
                var zone = FireZones[i]; if (zone.Type != "assaultFlame") continue;
                count++; double age = (double)zone.T / zone.MaxT;
                if (age > ratio) { ratio = age; old = i; }
            }
            if (count >= 14 && old >= 0)
            {
                var zone = FireZones[old]; zone.X = Player.X; zone.Y = Player.Y; zone.R = (float)radius; zone.Dmg = dot;
                zone.T = 0; zone.MaxT = 300; zone.AfStack = 0; zone.AfBaseR = radius; zone.AfBaseDmg = dot; zone.Revision++;
            }
            else FireZones.Add(new FireZone { Id = nextZoneId++, Type = "assaultFlame", X = Player.X, Y = Player.Y, R = (float)radius, Dmg = dot, MaxT = 300, AfBaseR = radius, AfBaseDmg = dot, Lv = lv });
            SkillSample("chain_assault_fire", .8, 1); SkillSample(SkillRandom() < .5 ? "voice_grunt" : "male_grunt", 1, 1);
            ChainAssaultBursts.Add(new ChainAssaultBurst { Id = ++nextAssaultBurstId, Tick = TickCount, X = Player.X, Y = Player.Y, Radius = (float)range, Tier = tier });
            HurtShake(tier == 3 ? 60 : tier == 2 ? 35 : 15); Cast("chainAssault");
            ClearSourceCode("mouse0");
        }
        bool DetonateAssaultFlames()
        {
            bool any = false;
            for (int i = FireZones.Count - 1; i >= 0; i--)
            {
                var zone = FireZones[i]; if (zone.Type != "assaultFlame") continue;
                any = true;
                double damage = zone.Dmg * Math.Max(1, Js.Int((zone.MaxT - zone.T) / 20.0)) * 2, radius = zone.R * 3.0;
                foreach (var enemy in Enemies.ToArray())
                {
                    if (!enemy.Alive || Distance(zone.X, zone.Y, enemy.X, enemy.Y) > radius + enemy.Radius) continue;
                    double angle = Math.Atan2(enemy.Y - zone.Y, enemy.X - zone.X);
                    ApplyEnemyDamage(enemy, damage, (float)angle, true, 1.2f, atkEl: 1, poiseMult: 2, explode: true);
                    enemy.KnockbackX += (float)(Math.Cos(angle) * 8); enemy.KnockbackY += (float)(Math.Sin(angle) * 8);
                    var web = enemy.Web ?? SyncToWeb(enemy); web.burnT = Math.Max(web.burnT, 300); web.burnStk = Math.Min(10, web.burnStk + 3);
                }
                if (!inEnemyLoop) FlushDeathSpawns();
                ChainAssaultBursts.Add(new ChainAssaultBurst { Id = ++nextAssaultBurstId, Tick = TickCount, X = zone.X, Y = zone.Y, Radius = zone.R, Stack = zone.AfStack, Detonation = true });
                HurtShake(30 + zone.AfStack * 15); FireZones.RemoveAt(i);
            }
            if (any) { SkillSample("chain_assault_fire", 1, .7); SkillSample("heavy_hit", 1, .8); }
            return any;
        }
    }
}
