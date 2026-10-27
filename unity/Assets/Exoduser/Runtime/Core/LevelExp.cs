using System;

namespace Exoduser.UnityPort.Core
{
    // One addExp call that crossed at least one level (web addExp, game.html 43226-43242: SP +3 per level, AP +1 on even levels).
    public sealed class LevelUpEvent
    {
        public int Levels, NewLevel, StatPoints, PassivePoints;
        public bool Transcended; // web `_isTrans = P.lv > 1000`
    }

    // Per-call inputs web addExp reads from outside P: nc().expBonus + _eqAffix('expBonus'), _DEMO_MODE/_DEMO_LV_CAP, today's date key.
    public sealed class ExpContext
    {
        public double NecklaceExpBonus, AffixExpBonus;
        public int DemoLevelCap; // 0 = _DEMO_MODE off
        public string Today = "";
    }

    // Port of game.html _calcMaxExp / addExp / _canTransLv (43191-43243) and the kill XP lines of killE (43181-43184, 43168-43171).
    // Original-function oracle: unity/Tools/level-exp-oracle.
    public static class LevelExp
    {
        public const int TranscendLevel = 1000;

        public static int MaxExperience(int level)
        {
            if (level < 1) throw new ArgumentOutOfRangeException(nameof(level));
            if (level < TranscendLevel) return (int)((15 + level * 2.5 + level * level * .05) * Math.Pow(1.001, level));
            double t = level - 999;
            return (int)Math.Floor(5000000 + t * t * 10000);
        }

        public static string TodayKey(DateTime d) { return d.Year + "-" + d.Month.ToString("00") + "-" + d.Day.ToString("00"); }

        // web `1+~~(G.combo/100)*0.05+Math.max(0,_diffSigned())*0.10` (the combo/difficulty reward multiplier)
        public static double ComboBonus(int combo, int difficultySigned)
        {
            return 1 + (combo / 100) * 0.05 + Math.Max(0, difficultySigned) * 0.10;
        }

        // Value handed to addExp for one kill. `trans` is addExp's second argument (fixed value, no /3, no bonuses).
        public static int KillValue(int playerLevel, int enemyLevel, bool boss, int elite, double comboBonus, out bool trans)
        {
            int eLv = enemyLevel == 0 ? 10 : enemyLevel; // `e.lv||10`
            double expMul = (elite > 0 ? 1 + EliteTables.Tiers[elite].DropBonus : 1) * comboBonus;
            if (playerLevel >= TranscendLevel) { trans = true; return boss ? 10 : elite > 0 ? 2 : 1; }
            trans = false;
            double basis = boss ? Math.Max(30, (int)(eLv * 2)) : Math.Max(5, (int)(eLv * .4));
            return (int)(basis * expMul);
        }

        // web _canTransLv: one level above 1000 per local day; resets the counter when the date key changes.
        static bool CanTransLevel(PlayerState p, string today)
        {
            if (p.TransDate == null || p.TransDate != today) { p.TransDate = today; p.TransCount = 0; }
            return p.TransCount < 1;
        }

        static void Hold(PlayerState p) { p.Experience = Math.Min(p.Experience, p.MaxExperience - 1); }

        // web addExp. Returns null when no level was gained. Resource recovery / unlock toasts stay with the caller (Simulation).
        public static LevelUpEvent Add(PlayerState p, int v, bool trans, ExpContext c)
        {
            if (c.DemoLevelCap > 0 && p.Level >= c.DemoLevelCap) { Hold(p); return null; }
            if (p.Level >= TranscendLevel && !CanTransLevel(p, c.Today)) { Hold(p); return null; }
            if (!trans)
            {
                v = v / 3;
                if (c.NecklaceExpBonus > 0) v = (int)(v * (1 + c.NecklaceExpBonus));
                if (c.AffixExpBonus > 0) v = (int)(v * (1 + c.AffixExpBonus));
            }
            p.Experience += v;
            int gained = 0, ap = 0;
            while (p.Experience >= p.MaxExperience)
            {
                if (c.DemoLevelCap > 0 && p.Level >= c.DemoLevelCap) { p.Experience = p.MaxExperience - 1; break; }
                if (p.Level >= TranscendLevel && !CanTransLevel(p, c.Today)) { p.Experience = p.MaxExperience - 1; break; }
                p.Level++; gained++; p.Experience -= p.MaxExperience;
                p.MaxExperience = MaxExperience(p.Level);
                p.StatPoints += 3;
                if (p.Level % 2 == 0) { p.PassivePoints++; ap++; }
                if (p.Level > TranscendLevel) p.TransCount++;
            }
            if (gained == 0) return null;
            return new LevelUpEvent { Levels = gained, NewLevel = p.Level, StatPoints = gained * 3, PassivePoints = ap, Transcended = p.Level > TranscendLevel };
        }
    }
}
