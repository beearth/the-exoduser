using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // BX: view glue of the 1-1 dark druid (Core/DruidBoss*.cs). Registers the boss behind Simulation.Stage.BossSpawners, draws its projectiles / hazards
    // (NativeBossView) and the STY-D9 final death: the last death of the 1-1 druid is a sink into the ground (66 tick body, 18 tick hold, 18 tick fade of the web).
    public sealed partial class NativeGame
    {
        NativeBossView bossView; readonly Dictionary<int, int> sinkStart = new Dictionary<int, int>();
        public const int SinkBodyTicks = 66, SinkHoldTicks = 18, SinkFadeTicks = 18;

        void BossViewAttach()
        {
            if (bossView != null) bossView.Dispose();
            bossView = new NativeBossView(transform); sinkStart.Clear();
            Simulation.AttachDruidBoss();
        }

        void BossViewUpdate()
        {
            if (bossView != null) bossView.Update(Simulation);
            foreach (var e in Simulation.Enemies) if (e.Alive && e.IsBoss && sinkStart.Count > 0) sinkStart.Remove(e.Id);
        }

        // dead 1-1 druid (SinkDruid): the body sinks, holds on the last frame, then fades. Returns true while the sink is still on screen.
        public bool BossSinkVisible(EnemyState e)
        {
            if (!e.IsBoss || !e.SinkDruid || e.Alive) return false;
            int t0; if (!sinkStart.TryGetValue(e.Id, out t0)) return true;
            return Simulation.TickCount - t0 < SinkBodyTicks + SinkHoldTicks + SinkFadeTicks;
        }

        void BossSinkDraw(EnemyState e, EnemyView ev)
        {
            if (!e.IsBoss || !e.SinkDruid) return;
            int t0; if (!sinkStart.TryGetValue(e.Id, out t0)) { t0 = Simulation.TickCount; sinkStart[e.Id] = t0; }
            int t = Simulation.TickCount - t0;
            if (t >= SinkBodyTicks + SinkHoldTicks + SinkFadeTicks) { ev.body.enabled = false; return; }
            float k = Mathf.Clamp01(t / (float)SinkBodyTicks), a = t < SinkBodyTicks + SinkHoldTicks ? 1f : 1f - (t - SinkBodyTicks - SinkHoldTicks) / (float)SinkFadeTicks;
            float size = e.Radius * 7 / 256;
            ev.body.enabled = true; ev.walk.enabled = false;
            ev.body.transform.position = Point(e.X, e.Y + e.Radius * 1.1f * k);
            ev.body.transform.localScale = new Vector3(size * (1 + .08f * k), size * (1 - .78f * k), 1);
            ev.body.sortingOrder = (int)e.Y;
            ev.body.color = new Color(.62f, .56f, .42f, a);
        }
    }
}
