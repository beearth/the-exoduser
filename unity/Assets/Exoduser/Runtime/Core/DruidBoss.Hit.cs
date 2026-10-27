using System;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    // BX-05: the boss side of hurtE — poise damage of a player hit and _poiseHit(e, amt) (game.html 19972-20005, 42488-42491).
    public sealed partial class DruidBoss
    {
        public bool Owns(EnemyState e) { return Data.ContainsKey(e); }

        // _poiseHit(e,amt): boss immune (5 s after a groggy) -> no change; poise<=0 -> groggy 90 f, immunity 300 f. Returns true when the groggy started.
        public bool PoiseHit(EnemyState e, double amt)
        {
            DruidData d;
            if (e == null || !Data.TryGetValue(e, out d)) return false;
            var r = EnemyPoiseRules.PoiseHit(new EnemyPoiseRules.Enemy { Alive = e.Alive, Boss = true, Poise = e.Poise, MaxPoise = e.MaxPoise, PoiseR = e.PoiseRegenTicks, Stunned = e.Stunned,
                MaxStunned = e.MaxStunned, PImmune = d.PImmune }, amt, 0, 0);
            e.Poise = (float)r.Enemy.Poise; e.PoiseRegenTicks = (float)r.Enemy.PoiseR; e.Stunned = (float)r.Enemy.Stunned; e.MaxStunned = (float)r.Enemy.MaxStunned; d.PImmune = r.Enemy.PImmune;
            if (r.Broke) host.Text(d.X, d.Y - 22, "💥 그로기!", "#ff8800", 60);
            return r.Broke;
        }

    }
}
