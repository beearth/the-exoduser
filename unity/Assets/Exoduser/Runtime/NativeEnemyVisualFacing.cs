using System;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Presentation only. Ordinary web drawEn looks at the living player within
    // 800 px regardless of walking; it does not choose between idle/walk facing.
    public static class NativeEnemyVisualFacing
    {
        public static int Direction(EnemyState enemy, PlayerState player)
        {
            double angle = enemy.Web != null ? enemy.Web.facing : enemy.Facing;
            double dx = (double)player.X - enemy.X, dy = (double)player.Y - enemy.Y;
            double distanceSquared = dx * dx + dy * dy;
            if (player.Hp > 0 && distanceSquared > .000001 && distanceSquared < 800d * 800)
                angle = Math.Atan2(dy, dx);
            return ((int)Math.Floor(angle / (Math.PI / 4) + .5) % 8 + 8) % 8;
        }
    }
}
