using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public static partial class NativeKeyBindInput
    {
        static readonly SourceInputBuffer sourceState = new SourceInputBuffer();
        static int sourceFrame = -1;
        static void PollSourceState()
        {
            if (sourceFrame == Time.frameCount) return;
            sourceFrame = Time.frameCount;
            foreach (var code in MappedCodes) sourceState.SetPhysical(code, CodeHeld(code), CodeDown(code));
            for (int i = 0; i < 5; i++) { string code = "mouse" + i; sourceState.SetPhysical(code, CodeHeld(code), CodeDown(code)); }
        }
        public static bool SourceAct(string action) { PollSourceState(); return sourceState.Act(Bindings.Primary(action)) || sourceState.Act(Bindings.Secondary(action)); }
        public static bool SourceHeld(string action) { PollSourceState(); return sourceState.Held(Bindings.Primary(action)) || sourceState.Held(Bindings.Secondary(action)); }
        public static bool SourceJust(string action) { PollSourceState(); return sourceState.Just(Bindings.Primary(action)) || sourceState.Just(Bindings.Secondary(action)); }
        public static void ClearSourceCode(string code) { PollSourceState(); sourceState.ClearCode(code); }
        public static void EndSourceTick() { sourceState.EndTick(); }
        public static void ResetSourceState() { sourceState.Reset(); sourceFrame = -1; }
    }
}
