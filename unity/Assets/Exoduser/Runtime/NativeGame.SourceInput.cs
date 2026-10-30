using System;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static readonly Func<string, bool> sourceJust = NativeKeyBindInput.SourceJust, sourceAct = NativeKeyBindInput.SourceAct, sourceHeld = NativeKeyBindInput.SourceHeld;
        static readonly Action<string> sourceClear = NativeKeyBindInput.ClearSourceCode;
        void AttachSourceInputs()
        {
            Simulation.SourceJustInput = sourceJust; Simulation.SourceActInput = sourceAct;
            Simulation.SourceHeldInput = sourceHeld; Simulation.SourceClearInput = sourceClear;
        }
        void DetachSourceInputs()
        {
            Simulation.SourceJustInput = Simulation.SourceActInput = Simulation.SourceHeldInput = null;
            Simulation.SourceClearInput = null;
        }
    }
}
