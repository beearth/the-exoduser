using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    // Web key bindings (game.html BINDS/BINDS2 6188-6207, _chainAttackBindingConflict/_setInputBinding 6226-6249, BIND_NAMES 6256-6278, keyName 6279~, key reset in
    // renderSettings 48748-48759). Pure C#, no UnityEngine: web key codes ("KeyW", "mouse0", "ShiftLeft") are the stored values; the Unity KeyCode conversion lives in
    // NativeKeyBindList. `null` = unbound. Behaviour is the web's, including its quirks (see ResetAll).
    public sealed class KeyBindings
    {
        // BINDS order = row order of the web list.
        public static readonly string[] Actions = {"up","down","left","right","weapon","shield","bow","charge","roll","parry","beam","forge","inventory","settings","interact","storage","stats","skill","skillCycle","irisToggle","bladeToggle"};
        static readonly string[] DefaultPrimary = {"KeyW","KeyS","KeyA","KeyD","mouse0","KeyE","Space","ShiftLeft","Space","KeyQ","mouse2","KeyG","Tab","Escape","KeyR","KeyN","KeyJ","KeyK","KeyL","KeyY","KeyU"};
        // window._resetBinds: its BINDS / BINDS2 literals only list these 19 actions (no irisToggle, bladeToggle).
        static readonly string[] ResetActions = {"up","down","left","right","weapon","shield","bow","charge","roll","parry","beam","forge","inventory","settings","interact","storage","stats","skill","skillCycle"};
        static readonly string[] NamesKo = {"위로 이동","아래로 이동","왼쪽 이동","오른쪽 이동","무기 공격","칼등 처내기 (탭=처내기, 홀드=연사)","Space 분노 폭발","사슬 이동","구르기 (방향키 +)","데빌포스 흡수","마법 (탭=투사체, 홀드=빔)","대장간","인벤토리","설정","아이템 줍기","보관함","능력치 (스탯/패시브)","전투 스킬","스킬 슬롯 배정","유령불꽃 켜기/끄기","기동칼날개 자동 켜기/끄기"};
        static readonly string[] NamesEn = {"Move Up","Move Down","Move Left","Move Right","Weapon Attack","Blade Parry (tap=parry, hold=rapid)","Space Rage Burst","Chain Dash","Roll (Arrow Keys +)","Devilforce Absorb","Magic (tap=projectile, hold=beam)","Forge","Inventory","Settings","Pick Up Item","Storage","Stats (Stats/Passives)","Combat Skills","Skill Slot Assign","Ghost Flame On/Off","Bladewing Auto On/Off"};
        public const string ChainConflictKo = "사슬 이동과 공격에는 서로 다른 키를 지정하세요.";
        public const string RollKeyboardKo = "구르기는 키보드 키로 지정하세요.";
        public const string RollKeyboardEn = "Bind Roll to a keyboard key.";
        public const string ChainConflictEn = "Use separate keys for chain movement and attacks.";
        // keyName(): plain keyboard names (mouse buttons and "none" are language dependent)
        static readonly Dictionary<string,string> KeyLabels = new Dictionary<string,string> {
            {"Space","SPACE"},{"ShiftLeft","L-SHIFT"},{"ShiftRight","R-SHIFT"},{"Tab","TAB"},{"Escape","ESC"},{"CapsLock","CAPS"},{"ControlLeft","L-CTRL"},{"ControlRight","R-CTRL"},{"AltLeft","L-ALT"},{"AltRight","R-ALT"},
            {"KeyW","W"},{"KeyA","A"},{"KeyS","S"},{"KeyD","D"},{"KeyE","E"},{"KeyQ","Q"},{"KeyR","R"},{"KeyF","F"},{"KeyG","G"},{"KeyZ","Z"},{"KeyX","X"},{"KeyC","C"},{"KeyV","V"},{"KeyT","T"},{"KeyB","B"},{"KeyH","H"},{"KeyJ","J"},{"KeyK","K"},{"KeyL","L"},{"KeyN","N"},{"KeyM","M"},
            {"Digit1","1"},{"Digit2","2"},{"Digit3","3"},{"Digit4","4"},{"Digit5","5"},{"ArrowUp","↑"},{"ArrowDown","↓"},{"ArrowLeft","←"},{"ArrowRight","→"}};

        readonly Dictionary<string,string> primary = new Dictionary<string,string>();
        readonly Dictionary<string,string> secondary = new Dictionary<string,string>();
        readonly List<string> listed = new List<string>();

        public KeyBindings() { Reset(true); }

        // Object.keys(BINDS): the rows the list shows (21 at start, 19 after the web reset quirk).
        public IReadOnlyList<string> Listed { get { return listed; } }
        // Bumped whenever the interact binding changes (web _resetInteractInput(): pending "fresh press" edges are dropped).
        public int InteractResetCount { get; private set; }
        public int Version { get; private set; }

        public string Primary(string action) { string v; return primary.TryGetValue(action, out v) ? v : null; }
        public string Secondary(string action) { string v; return secondary.TryGetValue(action, out v) ? v : null; }
        public static string DefaultPrimaryOf(string action) { int i = Array.IndexOf(Actions, action); return i < 0 ? null : DefaultPrimary[i]; }
        public static string Name(string action, bool english) { int i = Array.IndexOf(Actions, action); return i < 0 ? action : english ? NamesEn[i] : NamesKo[i]; }

        // _chainAttackBindingConflict(action,key): chain movement ("charge") must not share a key with weapon/shield (and vice versa), on either slot.
        public bool ChainAttackConflict(string action, string key)
        {
            if (string.IsNullOrEmpty(key)) return false;
            string[] others = action == "charge" ? new[] {"weapon","shield"} : (action == "weapon" || action == "shield") ? new[] {"charge"} : new string[0];
            foreach (var o in others) if (Primary(o) == key || Secondary(o) == key) return true;
            return false;
        }

        // _setInputBinding(action,key,alternate)
        public bool TrySet(string action, string code, bool alternate, out string rejection)
        {
            rejection = null;
            if (action == "roll" && code != null && code.StartsWith("mouse", StringComparison.Ordinal)) { rejection = RollKeyboardKo; return false; }   // web _setInputBinding: roll is keyboard only
            if (ChainAttackConflict(action, code)) { rejection = ChainConflictKo; return false; }
            if (!alternate && !primary.ContainsKey(action)) listed.Add(action);   // web: BINDS[action]=key creates the property again
            (alternate ? secondary : primary)[action] = code;
            if (action == "interact") InteractResetCount++;
            Version++;
            return true;
        }

        // the "x" next to a set alternate key
        public void ClearSecondary(string action)
        {
            secondary[action] = null;
            if (action == "interact") InteractResetCount++;
            Version++;
        }

        // window._resetBinds. Web quirk kept: the reset literals leave out irisToggle and bladeToggle, so after a reset those two actions disappear from the list and
        // are unbound (Object.keys(BINDS) has 19 entries) until the page is reloaded. See docs/engine/UNITY_A16_KEYBINDS_20261026.md.
        public void ResetAll() { Reset(false); InteractResetCount++; }

        void Reset(bool initial)
        {
            primary.Clear(); secondary.Clear(); listed.Clear();
            var actions = initial ? Actions : ResetActions;
            foreach (var a in actions) { primary[a] = DefaultPrimaryOf(a); secondary[a] = null; listed.Add(a); }
            Version++;
        }

        // keyName(code,true)
        public static string KeyName(string code, bool english)
        {
            if (string.IsNullOrEmpty(code)) return english ? "None" : "없음";
            switch (code)
            {
                case "mouse0": return english ? "LMB" : "좌클릭";
                case "mouse1": return english ? "MMB" : "휠클릭";
                case "mouse2": return english ? "RMB" : "우클릭";
                case "mouse3": return english ? "Mouse4" : "마우스4";
                case "mouse4": return english ? "Mouse5" : "마우스5";
            }
            string label; return KeyLabels.TryGetValue(code, out label) ? label : code;
        }

        public static IEnumerable<KeyValuePair<string,string>> KeyLabelTable { get { return KeyLabels; } }
    }
}
