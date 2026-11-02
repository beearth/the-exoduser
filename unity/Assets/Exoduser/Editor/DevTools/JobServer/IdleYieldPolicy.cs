using System;
using System.Collections.Generic;

namespace Exoduser.DevTools
{
    // Pure policy shared by the server and Unity-free selftest.
    public static class IdleYieldPolicy
    {
        public static bool IsEditorWaiter(string kind)
        {
            return string.IsNullOrEmpty(kind) || string.Equals(kind, "editor", StringComparison.OrdinalIgnoreCase);
        }

        public static bool ShouldYield(string state, long idleSec, int idleYieldSec,
            string owner, IEnumerable<string> waitingOwners)
        {
            if (state != "idle" || idleYieldSec < 1 || idleSec < idleYieldSec || waitingOwners == null) return false;
            foreach (var waiter in waitingOwners)
                if (!string.IsNullOrWhiteSpace(waiter) && !string.Equals(owner, waiter, StringComparison.OrdinalIgnoreCase)) return true;
            return false;
        }
    }
}
