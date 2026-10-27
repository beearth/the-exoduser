using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    public enum MonsterTier { Normal, Elite, Miniboss, StageBoss, ChapterBoss }

    // Port of the equipment half of rollDrop (game.html 32005-32037: tier table, rarity weights, drop count, slot/element/tier draw,
    // mkItem, min-rarity/min-level pick filters, position jitter) and of _wiPush (16724: 20-entry cap evicting the lowest rarity).
    // Bone parts, crystals and socket stones that the same web function rolls afterwards belong to other bags and are not ported here.
    public static class WorldDrop
    {
        static readonly double[] RwNormal = { 65, 22, 9, 3, 1, 0.01 }, RwElite = { 25, 35, 25, 12, 3, 0.03 }, RwMini = { 10, 25, 30, 25, 10, 0.1 },
            RwStageBoss = { 0, 0, 30, 50, 20, 0.2 }, RwChapterBoss = { 0, 0, 0, 30, 70, 0.7 };
        static readonly int[] DropCount = { 1, 1, 2, 3, 5 };
        static readonly double[] DropChance = { .45, 1, 1, 1, 1 };
        public const int LootStateCap = 20;

        // rollDrop classification (32011-32016): chapter boss = boss on the last stage of its chapter; mini boss = non-boss etype 90..99 (rare mobs)
        public static MonsterTier Classify(bool isBoss, int etype, int elite, bool lastStageOfChapter)
        {
            if (isBoss && lastStageOfChapter) return MonsterTier.ChapterBoss;
            if (isBoss) return MonsterTier.StageBoss;
            if (etype >= 90 && etype <= 99) return MonsterTier.Miniboss;
            return elite > 0 ? MonsterTier.Elite : MonsterTier.Normal;
        }

        public static double[] Weights(MonsterTier tier)
        {
            switch (tier) { case MonsterTier.Elite: return RwElite; case MonsterTier.Miniboss: return RwMini; case MonsterTier.StageBoss: return RwStageBoss; case MonsterTier.ChapterBoss: return RwChapterBoss; default: return RwNormal; }
        }

        // _minPickLvThr: OPT.minPickLvTier -> reqLv floor (-1 = off)
        public static double MinPickLevelThreshold(int tierSetting)
        {
            return tierSetting <= 0 ? -1 : Math.Max(0, (tierSetting == 7 ? 1000 : tierSetting * 100) - 100);
        }

        public sealed class Options
        {
            public int MinPickRarity, MinPickLevelTier, PlayerLevel = 1; public double NowMs; public bool DemoMode;
        }

        // Rolls the drops for one kill. dropBonus = statDropBonus()*curse multiplier, dropTier = e.dropTier. Positions are the final (jittered) ones.
        public static List<LootState> Roll(MonsterTier tier, double dropBonus, int dropTier, double enemyX, double enemyY, Options opt, Func<double> rnd, Func<int> nextId)
        {
            var result = new List<LootState>();
            int t = (int)tier;
            int dropCount = DropCount[t];
            double baseChance = DropChance[t] * dropBonus;
            if (tier == MonsterTier.Normal && rnd() > baseChance) return result;
            var rw = Weights(tier);
            double total = rw[0] + rw[1] + rw[2] + rw[3] + rw[4] + rw[5];
            double thr = MinPickLevelThreshold(opt.MinPickLevelTier);
            for (int di = 0; di < dropCount; di++)
            {
                int rarity = 0;
                if (tier == MonsterTier.ChapterBoss && di == 0) rarity = 4;
                else
                {
                    double roll = rnd() * total, acc = 0;
                    for (int ri = 0; ri < 6; ri++) { acc += rw[ri]; if (roll < acc) { rarity = ri; break; } }
                }
                if (rarity < opt.MinPickRarity) continue;
                string slot = DropSlots[Js.Int(rnd() * DropSlots.Length)];
                int el = Js.Int(rnd() * 6);
                var item = ItemFactory.MkItem(slot, dropTier, el, rarity, null, opt.PlayerLevel, rnd, opt.NowMs, opt.DemoMode);
                if (item == null) continue;
                if (item.reqLv < thr) continue;
                double x = enemyX + (rnd() - .5) * 30, y = enemyY + (rnd() - .5) * 30;
                result.Add(new LootState { Item = item, X = (float)x, Y = (float)y, Id = nextId(), Rarity = item.rarity, Tier = item.tier, Element = item.el, Slot = item.slot, Kind = "equipment" });
            }
            return result;
        }

        // DROP_SLOT_POOL = SLOT_NAMES without the ossuary
        public static readonly string[] DropSlots = Array.FindAll(DropTablesData.SlotNames, s => s != "ossuary");

        // _wiPush: append, then while over the cap remove the entry with the lowest rarity (unpicked closed chests are never evicted;
        // non-item entries rank -1); the removed slot is refilled by the last element. Items here are all equipment (rank = rarity).
        public static void Push(List<LootState> items, LootState added)
        {
            items.Add(added);
            while (items.Count > LootStateCap)
            {
                int mi = 0; double mr = double.PositiveInfinity;
                for (int i = 0; i < items.Count; i++)
                {
                    double r = items[i].Item != null ? items[i].Item.rarity : -1;
                    if (r < mr) { mr = r; mi = i; }
                }
                items[mi] = items[items.Count - 1];
                items.RemoveAt(items.Count - 1);
            }
        }

        // R pickup target (game.html 32936-32944): on-screen, highest rarity, nearest within the same rarity
        public static LootState PickTarget(IList<LootState> items, double playerX, double playerY, Func<LootState, bool> onScreen)
        {
            LootState best = null; double bestD = 1e9, bestR = -1;
            foreach (var it in items)
            {
                if (it.Picked || !onScreen(it)) continue;
                double r = it.Item != null ? it.Item.rarity : 0;
                double d = Math.Sqrt((playerX - it.X) * (playerX - it.X) + (playerY - it.Y) * (playerY - it.Y));
                if (r > bestR || (r == bestR && d < bestD)) { bestR = r; bestD = d; best = it; }
            }
            return best;
        }
    }
}
