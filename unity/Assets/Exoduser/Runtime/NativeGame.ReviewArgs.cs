using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Review-only arguments (see NativeReviewArgs): the glue that applies them to a run. Nothing here runs without the arguments.
    public sealed partial class NativeGame
    {
        // right after ResetRun created the run's Simulation, before StageFlowAttach / the arena
        // which druid set this run fights, and why (NativeReviewArgs.DecideDruidSet); read by the review-args capture
        bool druidSetRemodel; string druidSetReason = "default";

        void ReviewArgsApply()
        {
            // 3D boss arena = the --remodel3d scene (the only path that has the arena); demo = build flavor DemoMode. Core default stays false.
            druidSetRemodel = NativeReviewArgs.DecideDruidSet(Environment.GetCommandLineArgs(), NativeRemodel3D.Requested, BuildFlavor.Current.DemoMode, out druidSetReason);
            Simulation.DruidRemodel = druidSetRemodel;
            Debug.Log("[DruidSet] remodel=" + (druidSetRemodel ? "true" : "false") + " reason=" + druidSetReason);
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
