using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // 웹 K/KH/MB/MBjust의 소비 상태. 물리 홀드와 행동 입력은 별개다.
    public sealed class SourceInputBuffer
    {
        sealed class State { public bool Physical, Action, Just, Mouse; }
        readonly Dictionary<string, State> states = new Dictionary<string, State>();
        public void SetPhysical(string code, bool held, bool down)
        {
            if (string.IsNullOrEmpty(code)) return;
            if (!states.TryGetValue(code, out var state)) { state = new State { Mouse = code.StartsWith("mouse", StringComparison.Ordinal) }; states.Add(code, state); }
            if (down || held && !state.Physical) { state.Action = true; if (state.Mouse) state.Just = true; }
            state.Physical = held;
            if (!held) state.Action = false; // mouseup은 MBjust를 지우지 않는다.
        }
        public bool Act(string code) { return code != null && states.TryGetValue(code, out var state) && state.Action; }
        public bool Held(string code) { return code != null && states.TryGetValue(code, out var state) && (state.Mouse ? state.Action : state.Physical); }
        public bool Just(string code)
        {
            if (code == null || !states.TryGetValue(code, out var state)) return false;
            bool result = state.Mouse ? state.Just : state.Action;
            if (state.Mouse) state.Just = false; else state.Action = false;
            return result;
        }
        public void ClearCode(string code)
        {
            if (code == null || !states.TryGetValue(code, out var state)) return;
            state.Action = false; if (state.Mouse) state.Just = false;
        }
        public void EndTick() { foreach (var state in states.Values) if (state.Mouse) state.Just = false; }
        public void Reset() { states.Clear(); }
    }
}
