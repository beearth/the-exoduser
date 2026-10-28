using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    /// <summary>
    /// The enemy list hard cap of the web update() (game.html 34540~34562): more than 800 entries -> cull down to 700. Bosses and enemies waiting to revive stay; of the rest the ones
    /// beyond a distance pivot (4 bisection steps on the squared distance to the player) are removed and COUNTED AS KILLS (G.kills, _stageKills, _regKill) without drops or xp.
    /// Dead entries that are not waiting to revive are dropped silently. The second pass refills free slots from the culled ones too, exactly as the web does
    /// (a refilled enemy was already counted as a kill - web behaviour, kept), and the in-place packing loses some entries without a kill (see CapEnemies).
    /// </summary>
    public sealed partial class Simulation
    {
        public const int EnemyHardCap = 800, EnemyCapTarget = 700;
        public int EnemyCapRuns, EnemyCapCulled;   // culls so far (logs / tests)

        public void CapEnemies()
        {
            if (Enemies.Count <= EnemyHardCap) return;
            EnemyCapRuns++;
            // The web does this IN PLACE on ens: step 1 packs bosses to the front (overwriting what stood there), step 2 reads the array AFTER that, so a non-boss entry that was
            // overwritten is neither kept nor counted - it simply disappears. Reproduced on a copy.
            var ens = Enemies.ToArray(); int len = ens.Length, w = 0;
            for (int i = 0; i < len; i++) { var e = ens[i]; if (e.IsBoss || (e.ReviveTimer > 0 && !e.Alive)) { ens[w] = e; w++; } }   // 1) bosses / revive-pending first
            var rest = new List<EnemyState>(); var dist = new List<double>();
            for (int i = 0; i < len; i++)
            {
                var e = ens[i];
                if (e.IsBoss || (!e.Alive && e.ReviveTimer > 0)) continue;
                if (!e.Alive) continue;
                double dx = Player.X - e.X, dy = Player.Y - e.Y; rest.Add(e); dist.Add(dx * dx + dy * dy);   // dst2
            }
            int slots = Math.Max(0, EnemyCapTarget - w);
            if (rest.Count <= slots) { for (int i = 0; i < rest.Count; i++) ens[w++] = rest[i]; }
            else
            {
                double lo = 0, hi = 0; for (int i = 0; i < rest.Count; i++) if (dist[i] > hi) hi = dist[i];
                double pivot = (lo + hi) / 2;
                for (int iter = 0; iter < 4; iter++)
                {
                    int cnt = 0; for (int i = 0; i < rest.Count; i++) if (dist[i] <= pivot) cnt++;
                    if (cnt < slots) lo = pivot; else hi = pivot;
                    pivot = (lo + hi) / 2;
                }
                int added = 0;
                for (int i = 0; i < rest.Count; i++)
                {
                    if (dist[i] <= pivot && added < slots) { ens[w++] = rest[i]; added++; }
                    else { Kills++; EnemyCapCulled++; RegKill(rest[i]); }   // G.kills++, G._stageKills++, _regKill
                }
                if (added < slots) for (int i = 0; i < rest.Count; i++) if (dist[i] > pivot && added < slots) { ens[w++] = rest[i]; added++; }
            }
            var kept = new List<EnemyState>(w); for (int i = 0; i < w; i++) kept.Add(ens[i]);
            var keptSet = new HashSet<EnemyState>(kept);
            foreach (var e in Enemies) if (!keptSet.Contains(e) && e.Web != null) webOwner.Remove(e.Web);
            Enemies.Clear(); Enemies.AddRange(kept);
        }
    }
}
