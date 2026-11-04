using System;
using System.Collections.Generic;
using System.IO;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    [Serializable] internal sealed class FullRunBossWarning
    {
        public string moveId, kind, shape; public int serial, index; public bool live;
        public double x, y, radius, dir, length, width, total, remaining;
    }
    [Serializable] internal class FullRunBossSnapshot
    {
        public int tick, bossLife = -1, bossPhase, submittedViewEntries, hurtCount, lastHurtAmount;
        public bool bossLifeKnown, druidRemodel; public float x, y, hp;
        public string bossState, bossMove, previousBossMove, objective, decision, inputKeys;
        public List<FullRunBossWarning> activeTelegraphs = new List<FullRunBossWarning>();
    }
    [Serializable] internal sealed class FullRunBossDeath
    {
        public int deathIndex, retryIndex, tick, bossLife = -1; public bool bossLifeKnown, druidRemodel;
        public float x, y, hp; public string bossStateAtDeath, bossMoveAtDeath;
        public string lastHitMoveId = "미확인"; public bool lastHitMoveKnown;
        public string attributionScope = "No authoritative incoming damage move ID is exposed; current boss move is context, not the fatal source.";
        public List<FullRunBossWarning> activeTelegraphs = new List<FullRunBossWarning>();
        public List<FullRunBossSnapshot> recentTicks = new List<FullRunBossSnapshot>();
    }
    // QA-only snapshots and death log. No Unity dependency or Simulation writes.
    internal sealed class FullRunBossTrace
    {
        readonly List<FullRunBossSnapshot> recent = new List<FullRunBossSnapshot>();
        internal void Remember(FullRunBossSnapshot row)
        {
            recent.Add(row);
            if (recent.Count > 120) recent.RemoveAt(0);
        }
        internal void Clear() { recent.Clear(); }
        internal FullRunBossDeath Death(int index, int retry, FullRunBossSnapshot atDeath)
        {
            return new FullRunBossDeath {
                deathIndex = index, retryIndex = retry, tick = atDeath.tick,
                bossLife = atDeath.bossLife, bossLifeKnown = atDeath.bossLifeKnown, druidRemodel = atDeath.druidRemodel,
                x = atDeath.x, y = atDeath.y, hp = atDeath.hp,
                bossStateAtDeath = atDeath.bossState, bossMoveAtDeath = atDeath.bossMove,
                lastHitMoveId = "미확인", lastHitMoveKnown = false,
                activeTelegraphs = new List<FullRunBossWarning>(atDeath.activeTelegraphs),
                recentTicks = new List<FullRunBossSnapshot>(recent)
            };
        }
        internal static List<FullRunBossWarning> Warnings(List<DruidTelegraph> warnings)
        {
            var result = new List<FullRunBossWarning>();
            foreach (var t in warnings) result.Add(new FullRunBossWarning {
                moveId = t.MoveId, kind = t.Kind.ToString(), shape = t.Shape.ToString(), serial = t.Serial, index = t.Index,
                live = t.Live, x = t.X, y = t.Y, radius = t.Radius, dir = t.Dir, length = t.Length, width = t.Width,
                total = t.Total, remaining = t.Remaining
            });
            return result;
        }
        internal static string[] RenderArguments(string[] args)
        {
            var result = new List<string>();
            for (int i = 0; i < args.Length; i++)
            {
                string value = args[i]; if (value == null) continue;
                if (value.StartsWith("--boss-render=", StringComparison.Ordinal) || value.StartsWith("--hero-render=", StringComparison.Ordinal)
                    || value.StartsWith("--enemy-render=", StringComparison.Ordinal)) result.Add(value);
                else if ((value == "--boss-render" || value == "--hero-render" || value == "--enemy-render") && i + 1 < args.Length)
                    result.Add(value + "=" + args[++i]);
                else if (value == "--remodel3d" || value == "--unity-druid-remodel" || value == "--unity-druid-legacy"
                    || value == "--unity-boss-arena-review" || value == "--qa-boss-telegraph-off") result.Add(value);
            }
            return result.ToArray();
        }
        internal static void Append(string file, string json) { File.AppendAllText(file, json + "\n"); }
    }
}
