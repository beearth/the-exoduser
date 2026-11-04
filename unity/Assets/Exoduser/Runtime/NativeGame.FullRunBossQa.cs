using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Invoked only by the --unity-fullrun-qa coroutine. Virtual inputs and read-only snapshots.
    public sealed partial class NativeGame
    {
        string FullRunBossDefense(Simulation sim, FullRunNavigation navigation, FullRunControlPolicy policy,
            List<Key> keys, ref Vector2 move, ref Vector2 aim, ref bool attack, ref bool magic,
            ref string objective, int auxiliary, bool enabled)
        {
            if (!enabled) return "comparison-off";
            if (!sim.Stage.InArena || !sim.Stage.BossAlive || sim.Druid == null) return "outside-boss-fight";
            var boss = sim.Stage.FindBoss(); DruidData data;
            if (boss == null || !sim.Druid.Data.TryGetValue(boss, out data)) return "no-boss-snapshot";
            var warnings = new List<DruidTelegraph>(); sim.DruidTelegraphs(warnings);
            var p = sim.Player;
            var decision = FullRunBossThreatPolicy.Decide(p.X, p.Y, p.Radius, data, sim.Druid.Remodel, warnings, FullRunCanMove);
            if (!decision.threat) return "no-threat";
            attack = magic = false;
            // Do not cancel an already-running escape/dash/auxiliary action with new input.
            if (auxiliary != 0 || sim.IceOrbActive || sim.DashActive || sim.HarpActive) return decision.source + ":input-held";
            keys.Remove(Key.Q); keys.Remove(Key.E); keys.Remove(Key.Space);
            move = decision.escape ? navigation.Direction(p.X, p.Y, (float)decision.x, (float)decision.y,
                p.Radius, FullRunCanMove, sim.TickCount) : Vector2.zero;
            if (decision.escape && decision.roll && !policy.noRoll && move.sqrMagnitude > .01f && FullRunRollPress(sim)) keys.Add(Key.Space);
            keys.Remove(Key.W); keys.Remove(Key.A); keys.Remove(Key.S); keys.Remove(Key.D);
            if (move.x > .25f) keys.Add(Key.D); else if (move.x < -.25f) keys.Add(Key.A);
            if (move.y > .25f) keys.Add(Key.S); else if (move.y < -.25f) keys.Add(Key.W);
            objective = "boss-evade-" + (decision.move ?? "unknown");
            return decision.source + (decision.escape ? ":evade" : ":blocked");
        }

        FullRunBossSnapshot FullRunBossSnapshotAt(Simulation sim, string objective, string decision, string inputKeys)
        {
            var boss = sim.Stage.FindBoss(); DruidData data = null;
            if (boss != null && sim.Druid != null) sim.Druid.Data.TryGetValue(boss, out data);
            var life = sim.DruidLife(boss);
            var warnings = new List<DruidTelegraph>(); sim.DruidTelegraphs(warnings);
            var p = sim.Player;
            return new FullRunBossSnapshot {
                tick = sim.TickCount, bossLife = life != null ? life.Life + 1 : -1, bossLifeKnown = life != null,
                bossPhase = data != null ? data.BossPhase : -1, druidRemodel = sim.Druid != null && sim.Druid.Remodel,
                x = p.X, y = p.Y, hp = p.Hp, bossState = data != null ? data.S : "",
                bossMove = data != null ? data.CurMove : "", previousBossMove = data != null ? data.PrevMove : "",
                objective = objective, decision = decision, inputKeys = inputKeys,
                submittedViewEntries = teleView != null ? teleView.DrawnEntries : 0,
                hurtCount = sim.HurtCount, lastHurtAmount = sim.LastHurtAmount,
                activeTelegraphs = FullRunBossTrace.Warnings(warnings)
            };
        }
    }
}
