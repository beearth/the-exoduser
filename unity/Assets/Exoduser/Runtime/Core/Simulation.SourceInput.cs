using System;

namespace Exoduser.UnityPort.Core
{
    public sealed partial class Simulation
    {
        // 실제 조작 틱만 Native의 웹 입력 상태를 주입한다. 리플레이·CPU·자동 검수는 기존 명시 입력 경로다.
        public Func<string, bool> SourceJustInput, SourceActInput, SourceHeldInput;
        public Action<string> SourceClearInput;
        bool ChainJust(string action)
        {
            return SourceJustInput != null ? SourceJustInput(action) : action == "shield" ? chainShieldJust : chainWeaponJust;
        }
        void ClearSourceCode(string code) { if (SourceClearInput != null) SourceClearInput(code); }
    }
}
