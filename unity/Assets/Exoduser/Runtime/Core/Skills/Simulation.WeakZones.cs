using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public sealed partial class Simulation
    {
        static readonly string[] WeakZoneIds = { "weakPhys", "weakMag", "weakPj", "weakRev" };
        readonly Dictionary<string, float> weakZoneCooldowns = new Dictionary<string, float>();
        public static bool IsWeakZoneSkill(string id) { return id != null && Array.IndexOf(WeakZoneIds, id) >= 0; }
        static bool IsPortedAreaSkill(string id) { return id == "holyDome" || IsWeakZoneSkill(id); }
        float WeakZoneCooldown(string id) { float value; return weakZoneCooldowns.TryGetValue(id, out value) ? value : 0; }

        bool CastWeakZone(string id)
        {
            if (WeakZoneCooldown(id) > 0) { DenySkill(id, "cooldown"); return false; }
            int lv = Math.Max(1, Skills.Level(id));
            weakZoneCooldowns[id] = 1500;
            FireZones.Add(new FireZone { Id = nextZoneId++, Type = id, X = Player.X, Y = Player.Y,
                R = 200 + (lv - 1) * 22, MaxT = 600 + lv * 18, Lv = lv });
            string name = id == "weakPhys" ? "⚔ 파쇄의 영역!" : id == "weakMag" ? "🔮 침식의 영역!" : id == "weakPj" ? "🏹 관통의 영역!" : "💀 부활의 영역!";
            string color = id == "weakPhys" ? "#ff6644" : id == "weakMag" ? "#aa66ff" : id == "weakPj" ? "#44aaff" : "#ff4488";
            RaisePlayerText(Player.X, Player.Y - 30, name, color, 50); HurtShake(3); Cast(id);
            return true;
        }

        void TickWeakZoneCooldowns(float holyDomeBonus)
        {
            foreach (string id in WeakZoneIds)
            {
                float value = WeakZoneCooldown(id);
                if (value > 0) weakZoneCooldowns[id] = value - 1 - holyDomeBonus;
            }
        }

        void TickWeakZone(FireZone zone)
        {
            if (zone.Type == "weakRev") return;
            zone.TickTimer++;
            if (zone.TickTimer < 6) return;
            zone.TickTimer = 0;
            double amount = .10 + (Math.Max(1, zone.Lv) - 1) * .01;
            foreach (var enemy in ShQuery(zone.X, zone.Y, zone.R, true))
            {
                if (!enemy.Alive || Distance(zone.X, zone.Y, enemy.X, enemy.Y) > zone.R) continue;
                var web = SyncToWeb(enemy);
                if (zone.Type == "weakPhys") web._weakPhys = Math.Max(web._weakPhys ?? 0, amount);
                else if (zone.Type == "weakMag") web._weakMag = Math.Max(web._weakMag ?? 0, amount);
                else web._weakPj = Math.Max(web._weakPj ?? 0, amount);
                web._weakT = 12;
            }
        }

        public double WeakRevBonusAtPlayer()
        {
            foreach (var zone in FireZones)
                if (zone.Type == "weakRev" && Distance(Player.X, Player.Y, zone.X, zone.Y) < zone.R)
                    return .10 + (Math.Max(1, zone.Lv) - 1) * .01;
            return 0;
        }
    }
}
