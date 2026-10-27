using System;

// RED stub: the public shape of EnemyTick that does nothing (what the project had before CX-03a: no enemy tick head at all).
namespace Exoduser.UnityPort.Core
{
    public static class EnemyTick
    {
        public static EnemyTickFrame BeginFrame(EnemyTickContext c, double sp) { return new EnemyTickFrame { Bonfire = c.Bonfire }; }
        public static bool Step(EnemyTickContext c, EnemyTickFrame f, System.Collections.Generic.IList<EnemySpawn> ens, int ei, double sp) { return false; }
        public static bool UpdateHead(EnemyTickContext c, EnemySpawn e, double sp, out double d) { d = 0; return false; }
    }
}
