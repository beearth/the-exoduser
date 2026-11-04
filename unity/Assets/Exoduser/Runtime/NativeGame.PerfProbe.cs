using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // 11-04 QA perf probe segment (NativePerfProbe). Read-only view of the current state; no rule or Core change.
        Vector2? perfCamp; float perfPlayingSince = -1;
        internal string PerfSegment()
        {
            if (lobby == null || Simulation == null) return "boot";
            string stage = lobby.StageName;
            if (stage != "Playing") { perfPlayingSince = -1; return stage == "Lobby" ? "lobby" : stage.ToLowerInvariant(); }
            if (perfPlayingSince < 0) perfPlayingSince = Time.unscaledTime;
            if (Simulation.Stage.InArena) return "boss-arena";
            var p = new Vector2(Simulation.Player.X, Simulation.Player.Y);
            if (perfCamp == null) { perfCamp = Vector2.positiveInfinity; foreach (var prop in Map.Data.props) if (prop.id == "m_c1camp") { perfCamp = new Vector2(prop.x, prop.y); break; } }
            if (Vector2.Distance(p, perfCamp.Value) < 350) return "camp";
            if (Time.unscaledTime - perfPlayingSince < 10) return "field-entry";
            int far = 0; foreach (var e in Simulation.Enemies) if (e.Alive && Vector2.Distance(p, new Vector2(e.X, e.Y)) > 800) far++;
            return far >= 6 ? "far-enemies" : "field";
        }
    }
}
