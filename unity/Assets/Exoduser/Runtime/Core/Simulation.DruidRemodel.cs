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
            // RM-B0b: death sequence, damage taken during the change of life, blocked damage
            public bool Dying, Vulnerable, WasVulnerable, Blocking;   // Vulnerable: CollapseTick may switch it per tick (RM-B3: leap = invulnerable, grief = not)
            public int DyingTicks, NextMaxHp, FloorHp, BlockedHits;
            public double Pool, BlockMark, DamageScale = 1;           // Pool = what is left of the next life's HP while the change of life takes damage
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
            RemodelRulesAttach(set);   // RM-B0b: props / obstacles / lines
            RemodelHook(set.Hooks.OnAttach, e, st);
        }

        // OnEnemyZeroHp hook. true = handled (the boss neither revives through ReviveRules nor dies here unless it is the last life)
        bool RemodelZeroHp(EnemyState e)
        {
            if (RemodelPropZeroHp(e)) return true;                        // RM-B0b: a boss prop broke
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st) || st.Done) return false;
            if (st.Dying) { e.Hp = 1; return true; }                      // RM-B0b: death sequence, invulnerable
            if (st.Collapsing) { e.Hp = st.Vulnerable ? Math.Max(1, st.FloorHp) : 1; return true; }   // a DOT tick during the kneel: swallowed (RM-B0b: or held at the floor)
            if (st.Life >= st.Set.Lives - 1)
            {
                if (st.Set.FinalTicks > 0)
                {   // RM-B0b: death sequence first (DyingTick), the kill when it ends (RemodelPreTick)
                    st.Dying = true; st.DyingTicks = st.Set.FinalTicks; st.Blocking = false;
                    e.Hp = 1; e.Shield = 0; e.ReviveIframes = 90;
                    Druid.BeginCollapse(e);
                    RemodelEvent("dying", e, st, st.Set.FinalTicks + " ticks");
                    return true;
                }
                RemodelFinal(e, st);
                return true;
            }
            st.Collapsing = true; st.CollapseTicks = st.Set.CollapseTicks; st.RootHits = 0; st.Blocking = false;
            if (Config.StageIndex == 0) { QueueLogicalSound("druid_vo_fall", "P" + (st.Life + 1) + " down: he kneels", e.X, e.Y); scheduledSounds.Add(new KeyValuePair<int, string[]>(TickCount + 40, new[] { "druid_root_pierce", "P" + (st.Life + 2) + " entry: root pierces the back" })); }   // RM-1 sound SND-09
            e.Hp = 1; e.Shield = 0; e.ReviveIframes = 90;                 // swallowed hits are the root hits (EnemyHurt takes 1 off reviveIframes per hit)
            Druid.BeginCollapse(e);
            if (st.Set.CollapseVulnerable)
            {   // RM-B0b: the next life's HP is on the line during the change of life (floor = CollapseHpFloor of it)
                st.NextMaxHp = Math.Max(1, (int)Math.Round(st.BaseMaxHp * st.Set.LifeHpFraction[st.Life + 1]));
                st.FloorHp = Math.Max(1, (int)Math.Round(st.NextMaxHp * st.Set.CollapseHpFloor));
                st.Pool = st.NextMaxHp; st.Vulnerable = true; st.WasVulnerable = true;
                e.MaxHp = st.NextMaxHp; e.Hp = st.NextMaxHp; e.ReviveIframes = 0;
            }
            RemodelEvent("collapse", e, st, "life " + (st.Life + 1) + " down");
            RemodelHook(st.Set.Hooks.OnCollapse, e, st);
            return true;
        }

        // DruidBossTick hook. true = the boss is kneeling: the druid AI does not run this tick
        bool RemodelPreTick(EnemyState e)
        {
            DruidLifeState st;
            if (!druidLives.TryGetValue(e, out st)) return false;
            if (st.Dying)
            {   // RM-B0b: death sequence
                e.ReviveIframes = 90; e.Hp = 1; e.Shield = 0;
                RemodelHook(st.Set.Hooks.DyingTick, e, st);
                if (--st.DyingTicks > 0) return true;
                RemodelFinal(e, st);
                return true;
            }
            if (!st.Collapsing) return false;
            if (st.Set.CollapseVulnerable) { RemodelVulnerableTick(e, st); return true; }   // RM-B0b
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
            RemodelHook(st.Set.Hooks.CollapseTick, e, st);
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
            if (st.Set.CollapseVulnerable)
            {   // RM-B0b: what the player took off during the change of life stays off, down to the floor
                int dealt = Math.Max(0, st.NextMaxHp - (int)Math.Round(st.Pool));
                e.Hp = Math.Max(Math.Max(1, (int)Math.Round(mx * st.Set.CollapseHpFloor)), mx - dealt);
                if (dealt > 0) note += " (-" + dealt + " taken while down)";
                st.Vulnerable = false; st.WasVulnerable = false;
            }
            int sh = (int)Math.Round(mx * st.Set.ShieldFraction[st.Life]); e.MaxShield = sh; e.Shield = sh;
            e.Radius = (float)Math.Max(10, Math.Round(st.OrigR * st.Set.BodyScale[st.Life]));
            e.ReviveIframes = 0; e.Poise = e.MaxPoise;
            Druid.BeginLife(e, st.Life); if (Config.StageIndex == 0) QueueLogicalSound("druid_vo_phase", "P" + (st.Life + 1) + " start", e.X, e.Y);   // RM-1 sound SND-09
            RemodelEvent("life", e, st, note);
            RemodelHook(st.Set.Hooks.OnLife, e, st);
        }
    }
}
