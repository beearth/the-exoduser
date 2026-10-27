using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // RM-B1 default: the remodel is a flag. Off = the web-port druid (23 moves, 5 HP phases, judged revive) exactly as the oracle checks it.
    public static class DruidRemodelSettings { public static bool Default = false; }

    public sealed class DruidRemodelEvent { public int Tick, Life; public string Kind, Note; public double Hp, MaxHp, Shield, Radius; }

    // RM-B1 (RB1-1 / RB1-2): three lives instead of the web's HP phases + judged revive. Spec: docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md §2.
    //   life HP = base HP x 1.0 / 0.6 / 0.4, body 100 / 85 / 70 %, energy shield 0 / 15 / 15 % of the life HP.
    //   a zero HP on life 1 / 2 = 2.0 s kneel, invulnerable (hits on the root are counted: 3 of them cut the string = next life -10 %p, once per fight);
    //   a zero HP on life 3 = the sink of STY-D9 (SinkDruid) and the normal kill path, so the exit opens through StageFlow.
    public sealed partial class Simulation
    {
        public bool DruidRemodel = DruidRemodelSettings.Default;   // set before the boss arena is entered
        public sealed class DruidLifeState
        {
            public int Life, BaseMaxHp, CollapseTicks, RootHits, RootHitsTotal;
            public bool Collapsing, RootBonusPending, RootBonusUsed, Done;
            public double OrigR;
            public BossRemodelSet Set;                             // RM-B0: the set this fight runs (DruidRemodelData.Set for the druid)
        }
        public readonly List<DruidRemodelEvent> DruidRemodelLog = new List<DruidRemodelEvent>();
        public event Action<DruidRemodelEvent> DruidRemodelRaised;      // presentation owners (RB1-3 / 4: kneel Timeline, shrink, sink) hook here
        readonly Dictionary<EnemyState, DruidLifeState> druidLives = new Dictionary<EnemyState, DruidLifeState>();

        public DruidLifeState DruidLife(EnemyState e) { DruidLifeState s; return e != null && druidLives.TryGetValue(e, out s) ? s : null; }

        // RM-B1 read-only telegraph list for the presentation (DruidTelegraph.cs): rebuilt from the Core state, empty with the flag off, never written back. Call after Tick.
        public void DruidTelegraphs(List<DruidTelegraph> into) { if (Druid == null) into.Clear(); else Druid.CollectTelegraphs(into); }

        void RemodelEvent(string kind, EnemyState e, DruidLifeState st, string note)
        {
            var ev = new DruidRemodelEvent { Tick = TickCount, Life = st.Life, Kind = kind, Note = note, Hp = e.Hp, MaxHp = e.MaxHp, Shield = e.Shield, Radius = e.Radius };
            DruidRemodelLog.Add(ev);
            var h = DruidRemodelRaised; if (h != null) h(ev);
        }

        // SpawnDruid: the mkEn record keeps its numbers (base HP = life 1), the shield of the web boss is cleared (P1 has none)
        void RemodelAttach(EnemyState e, BossRemodelSet set)
        {
            druidLives.Clear(); DruidRemodelLog.Clear();
            var st = new DruidLifeState { Life = 0, BaseMaxHp = e.MaxHp, OrigR = e.OrigR > 0 ? e.OrigR : e.Radius, Set = set };
            e.OrigR = st.OrigR; e.Shield = 0; e.MaxShield = 0; e.RevPts = 0; e.BossPhase = 0;
            druidLives[e] = st;
            Druid.Remodel = true; Druid.MoveLog = new List<MoveLogEntry>(); Druid.Clock = () => TickCount;
            RemodelEvent("start", e, st, "life 1");
            RemodelHook(set.Hooks.OnAttach, e, st);
        }

        // OnEnemyZeroHp hook. true = handled (the boss neither revives through ReviveRules nor dies here unless it is the last life)
        bool RemodelZeroHp(EnemyState e)
        {
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st) || st.Done) return false;
            if (st.Collapsing) { e.Hp = 1; return true; }                 // a DOT tick during the kneel: swallowed
            if (st.Life >= st.Set.Lives - 1)
            {
                st.Done = true; e.Hp = 0; e.Shield = 0; if (st.Set.Sink) e.SinkDruid = true;   // STY-D9: the last fall is the sink, then the common kill (rewards, StageFlow exit)
                RemodelEvent("final", e, st, st.Set.Sink ? "sink" : "kill");
                RemodelHook(st.Set.Hooks.OnFinal, e, st);
                KillEnemy(e);
                return true;
            }
            st.Collapsing = true; st.CollapseTicks = st.Set.CollapseTicks; st.RootHits = 0;
            e.Hp = 1; e.Shield = 0; e.ReviveIframes = 90;                 // swallowed hits are the root hits (EnemyHurt takes 1 off reviveIframes per hit)
            Druid.BeginCollapse(e);
            RemodelEvent("collapse", e, st, "life " + (st.Life + 1) + " down");
            RemodelHook(st.Set.Hooks.OnCollapse, e, st);
            return true;
        }

        // DruidBossTick hook. true = the boss is kneeling: the druid AI does not run this tick
        bool RemodelPreTick(EnemyState e)
        {
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st) || !st.Collapsing) return false;
            // the enemy loop already took 1 off reviveIframes this tick; every swallowed player hit took 1 more
            int hits = (int)Math.Round(89 - e.ReviveIframes); if (hits < 0) hits = 0;
            if (hits > 0 && st.Set.RootBonus)
            {
                st.RootHits += hits; st.RootHitsTotal += hits;
                if (st.RootHits >= st.Set.RootHitsNeeded && !st.RootBonusPending)
                {
                    if (!st.RootBonusUsed) { st.RootBonusPending = true; RemodelEvent("rootCut", e, st, "3 root hits: next life -10%p"); }
                    else { st.RootHits = -1000000; RemodelEvent("rootCutIgnored", e, st, "bonus already used"); }
                }
            }
            e.ReviveIframes = 90; e.Hp = 1; e.Shield = 0;
            if (--st.CollapseTicks > 0) return true;
            RemodelNextLife(e, st);
            return true;
        }

        void RemodelNextLife(EnemyState e, DruidLifeState st)
        {
            st.Life++; st.Collapsing = false;
            double frac = st.Set.LifeHpFraction[st.Life];
            string note = "life " + (st.Life + 1);
            if (st.RootBonusPending) { frac -= st.Set.RootBonusFraction; st.RootBonusPending = false; st.RootBonusUsed = true; note += " (root cut -10%p)"; }
            int mx = Math.Max(1, (int)Math.Round(st.BaseMaxHp * frac));
            e.MaxHp = mx; e.Hp = mx;
            int sh = (int)Math.Round(mx * st.Set.ShieldFraction[st.Life]); e.MaxShield = sh; e.Shield = sh;
            e.Radius = (float)Math.Max(10, Math.Round(st.OrigR * st.Set.BodyScale[st.Life]));
            e.ReviveIframes = 0; e.Poise = e.MaxPoise;
            Druid.BeginLife(e, st.Life);
            RemodelEvent("life", e, st, note);
            RemodelHook(st.Set.Hooks.OnLife, e, st);
        }
    }
}
