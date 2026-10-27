using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B0 default: every remake is off. Off = the web-port boss of the stage exactly as the oracles check it (si0 / si3: 23-move druid; si1 / si2: no boss Core).
    public static class BossRemodelSettings { public static bool Default = false; }

    // RM-B0: which stage runs a remake. Spec: docs/engine/UNITY_BOSS_RM0_REMODEL_FRAMEWORK_20261028.md.
    //   set   = RemodelSets[si] (BossRemodelSets.Build + whatever a harness adds before AttachDruidBoss)
    //   flag  = BossRemodel (every set) || RemodelBosses contains set.Id || (DruidRemodel && si is 0 or 3: the druid stages, whatever set 1-4 ends up with)
    //   on    = set registered && flag: Stage.BossSpawners[si] builds the boss through the same mkEn path (SpawnDruid) and the remodel AI / lives run it.
    // Set the flags before AttachDruidBoss (or call RefreshRemodelSpawners after changing them).
    public sealed partial class Simulation
    {
        public bool BossRemodel = BossRemodelSettings.Default;                                   // common flag
        public readonly HashSet<string> RemodelBosses = new HashSet<string>();                    // per-boss flag (BossRemodelSet.Id)
        public readonly Dictionary<int, BossRemodelSet> RemodelSets = BossRemodelSets.Build();    // stage index -> set

        public BossRemodelSet RemodelSetFor(int si)
        {
            BossRemodelSet set;
            if (!RemodelSets.TryGetValue(si, out set) || set == null) return null;
            bool on = BossRemodel || RemodelBosses.Contains(set.Id) || (DruidRemodel && (si == 0 || si == 3));
            return on ? set : null;
        }

        // si0 / si3 always have the druid spawner (AttachDruidBoss); any other stage only while its remake is on, so a stage without one keeps BossCoreMissing
        readonly HashSet<int> remodelSpawnerStages = new HashSet<int>();
        void RegisterRemodelSpawners()
        {
            foreach (var kv in RemodelSets)
            {
                if (kv.Key == 0 || kv.Key == 3) continue;
                if (RemodelSetFor(kv.Key) != null) { Stage.BossSpawners[kv.Key] = SpawnDruid; remodelSpawnerStages.Add(kv.Key); }
                else if (remodelSpawnerStages.Remove(kv.Key)) Stage.BossSpawners.Remove(kv.Key);
            }
        }

        public void RefreshRemodelSpawners() { if (Druid != null) RegisterRemodelSpawners(); }

        // the running remake of this simulation (null = none attached)
        public BossRemodelSet ActiveRemodelSet { get { return Druid != null && Druid.Remodel ? Druid.Set : null; } }

        // same list as DruidTelegraphs; the name for the bosses that are not the druid (Move = row of their own set)
        public void RemodelTelegraphs(List<DruidTelegraph> into) { DruidTelegraphs(into); }

        void RemodelHook(BossRmLife h, EnemyState e, DruidLifeState st) { if (h != null) h(this, e, st); }
    }
}
