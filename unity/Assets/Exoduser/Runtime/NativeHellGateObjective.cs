using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Presentation only. The Core owns thresholds, angler state, purification and gate unlock.
    public readonly struct NativeHellGateObjective
    {
        public readonly bool Visible, GateOpen, RegionCleared, AnglerAlive, HasAngler;
        public readonly int Region, Cleared, Kills, Required;
        NativeHellGateObjective(Simulation sim, int index)
        {
            var r = sim.Regions[index];
            Visible = true; Region = index; Cleared = sim.RegionClearedCount();
            GateOpen = sim.Stage.BossUnlocked; RegionCleared = r.Cleared;
            HasAngler = r.FbIdx >= 0 && sim.Config.StageIndex == 0;
            AnglerAlive = sim.RegionFbAlive(r);
            // Read the bonus through Core's ratio instead of maintaining a second guard/region rule.
            double bonus = r.Total > 0 ? sim.RegionRatio(r, index) - (double)r.Kills / r.Total : 0;
            // Core's 1e-9 comparison tolerance matters at exact integer boundaries (e.g. 70/100 + .1).
            Required = r.Total > 0 ? Math.Max(0, (int)Math.Ceiling((Simulation.RegionClearRatio - bonus - 1e-9) * r.Total)) : 0;
            Kills = Math.Max(0, Math.Min(r.Kills, Required));
        }
        public static NativeHellGateObjective Read(Simulation sim)
        {
            if (sim == null || !sim.Stage.Enabled || sim.Stage.InArena || sim.Stage.StageCleared || !sim.Stage.BossAlive || sim.Regions == null) return default;
            int index = sim.RegionIdxAt(sim.Player.X, sim.Player.Y);
            return index >= 0 && index < sim.Regions.Length && sim.Regions[index] != null ? new NativeHellGateObjective(sim, index) : default;
        }
    }
}
