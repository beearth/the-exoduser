using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Review-only arguments (see NativeReviewArgs): the glue that applies them to a run. Nothing here runs without the arguments.
    public sealed partial class NativeGame
    {
        // right after ResetRun created the run's Simulation, before StageFlowAttach / the arena
        void ReviewArgsApply()
        {
            if (NativeReviewArgs.DruidRemodel) Simulation.DruidRemodel = true;
        }

        // EnterFromLobby: start at the boss arena entry. Returns true when the run was moved (the first practice is then skipped).
        bool BossDirectEnter()
        {
            int stage; if (!NativeReviewArgs.TryBossDirect(out stage)) return false;
            if (stage != 0) { Debug.LogWarning("--unity-boss-direct " + stage + ": only stage 0 (1-1) has a boss arena in this build, ignored"); return false; }
            var flow = Simulation.Stage; var p = Simulation.Player;
            if (flow == null || flow.Exits.Count < 2) { Debug.LogWarning("--unity-boss-direct: the 1-1 gate tile is missing, ignored"); return false; }
            flow.Enabled = true; flow.FieldBossDone = true; if (!flow.BossUnlocked) flow.ForceUnlock();   // same state the m1-check route sets before it walks the gate
            var gate = flow.Exits[1]; p.X = (gate.X + .5f) * 40; p.Y = (gate.Y + .5f) * 40; p.Hp = p.MaxHp; p.Iframes = 600;
            lastX = p.X; lastY = p.Y; UpdateViews();
            Debug.Log("review: sim " + Simulation.GetHashCode() + " exits " + flow.Exits.Count);
            Debug.Log("review: --unity-boss-direct 0, player on the 1-1 gate tile (" + gate.X + "," + gate.Y + "), druid remodel " + (Simulation.DruidRemodel ? "on" : "off"));
            return true;
        }
    }
}
