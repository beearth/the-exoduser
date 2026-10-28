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
        public static EnemyHurtBodyResult Body(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtHeadResult h)
        {
            return new EnemyHurtBodyResult { dmg = h.dmg, atkEl = h.atkEl };
        }
        public static EnemyHurtDeathResult DeathHead(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtBodyResult b, out DeathExit exit)
        {
            exit = DeathExit.NotDead;
            return new EnemyHurtDeathResult { __cont = false };
        }
        public static void DeathTail(EnemyHurtContext c, EnemySpawn e, double? ang, bool noSound, EnemyHurtOpts opts, EnemyHurtBodyResult b, EnemyHurtDeathResult d) { }
    }
}
