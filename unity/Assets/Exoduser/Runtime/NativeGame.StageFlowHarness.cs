using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // C07 harness only (reached from --unity-m1-check, never from a normal run): a stand-in boss behind the Simulation.Stage.BossSpawners extension point, so the
    // arena -> boss bar -> defeat -> exit -> stage-clear flow can be walked end to end before the real boss Core (druid, boss battle lead) exists.
    // It is an ordinary etype0 body with boss flags, four times the hp, a large radius and the generic chase AI; it has no druid moves.
    public sealed partial class NativeGame
    {
        void RegisterHarnessBoss()
        {
            Simulation.Stage.BossSpawners[Simulation.Config.StageIndex] = (sim, x, y) =>
            {
                var boss = sim.SpawnNormalEnemy(x, y); if (boss == null) return null;
                sim.Stage.TotalSpawned--;   // not a field spawn: keep the gate / clear-panel denominator honest
                boss.IsBoss = true; boss.Hp *= 4; boss.MaxHp = boss.Hp; boss.Shield *= 4; boss.MaxShield = boss.Shield; boss.Radius = 48;
                return boss;
            };
        }
    }
}
