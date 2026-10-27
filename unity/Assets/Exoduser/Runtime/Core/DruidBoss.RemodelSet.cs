using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B0: the remodel AI reads its tables and rules from Set (Simulation.SpawnDruid puts the set of the stage in). The default keeps the RM-B1 druid, so a
    // DruidBoss switched to Remodel without a set behaves as before. With Remodel off nothing here is read.
    public sealed partial class DruidBoss
    {
        public BossRemodelSet Set = DruidRemodelData.Set;

        bool RmGrab { get { return Remodel && Set.GrabAbsorb; } }   // druid rule: grab = 2 s hold + absorb + mash out; any other set gets the web grab

        // idle, before the score table: the druid's heartbeat, then the boss's own forced moves
        bool RmForcedPick(EnemyState e, DruidData d, double dist)
        {
            if (Set.Heartbeat && ForceHeartbeat(e, d, dist)) return true;
            var h = Set.Hooks.ForcePick;
            return h != null && h(this, e, d, dist);
        }

        // for ForcePick rules: start `id` now with the bookkeeping of a picked move (no score, no combo, no feint). False when the move is not in the set.
        bool RmStartForced(EnemyState e, DruidData d, string id, double dist, double patT = 30)
        {
            BossMove mv = FindMove(id); if (mv == null) return false;
            d.ComboSeq = null; d.ComboIdx = 0; d.Feinting = false; d.FeintUsed = false;
            d.MoveCDs[mv.Idx] = mv.Cd;
            d.LastMoves.Add(mv.Id); if (d.LastMoves.Count > 5) d.LastMoves.RemoveAt(0);
            d.BossPatT = patT;
            LastPick = mv.Id; StartPattern(e, d, mv, dist, d.BossPhase, 0);
            return true;
        }

        void RmStartHook(EnemyState e, DruidData d, BossMove mv, double dist, int phase, int tele)
        {
            var h = Remodel ? Set.Hooks.StartMove : null;
            if (h != null) h(this, e, d, mv, dist, phase, tele);
        }

        void RmTickHook(EnemyState e, DruidData d, double dist)
        {
            var h = Remodel ? Set.Hooks.TickState : null;
            if (h != null) h(this, e, d, dist);
        }

        void RmTeleHook(DruidData d, List<DruidTelegraph> into)
        {
            var h = Set.Hooks.Telegraphs;
            if (h != null) h(this, d, into);
        }
    }
}
