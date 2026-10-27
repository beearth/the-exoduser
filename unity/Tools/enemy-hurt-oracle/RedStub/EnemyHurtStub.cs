using System;

// RED stub: the public shape of EnemyHurt that does nothing (what the project had before CX-04a: no hurtE head at all).
namespace Exoduser.UnityPort.Core
{
    public static class EnemyHurt
    {
        public static EnemyHurtHeadResult Head(EnemyHurtContext c, EnemySpawn e, double dmg, double? ang, bool noSound, EnemyHurtOpts opts, double atkEl)
        {
            return new EnemyHurtHeadResult { dmg = dmg, atkEl = atkEl };
        }
    }
}
