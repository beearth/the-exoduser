using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RB1-3: the root pillars of the remodelled boss arena (DruidBoss.Pillars.cs) as seen by the simulation and the presentation.
    public sealed partial class Simulation
    {
        bool PillarBlocked(float x, float y, float radius) { return Druid != null && Druid.Boss != null && Druid.PillarBlocks(x, y, radius); }

        // the pillars (centre + radius) while a remodelled boss fight is on, empty otherwise; the arena circle they sit in
        public IReadOnlyList<RootPillar> DruidPillars { get { return Druid != null && Druid.Boss != null ? (IReadOnlyList<RootPillar>)Druid.Pillars : new RootPillar[0]; } }
        public void DruidArena(out double cx, out double cy, out double radius) { cx = Druid != null ? Druid.ArenaCx : 0; cy = Druid != null ? Druid.ArenaCy : 0; radius = Druid != null ? Druid.ArenaRadius : 0; }
    }
}
