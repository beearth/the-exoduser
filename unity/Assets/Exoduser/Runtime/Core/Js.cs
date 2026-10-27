using System;

namespace Exoduser.UnityPort.Core.Combat
{
    // JavaScript number semantics used by the web formulas (game.html): `~~x` (ToInt32 truncation) and the `a||b` default of a falsy number.
    internal static class Js
    {
        // ~~x
        public static int Int(double v)
        {
            if (double.IsNaN(v) || double.IsInfinity(v)) return 0;
            return unchecked((int)(long)Math.Truncate(v));
        }
        // x||fallback for a number (0 and NaN are falsy)
        public static double Or(double v, double fallback) { return v == 0 || double.IsNaN(v) ? fallback : v; }
    }
}
