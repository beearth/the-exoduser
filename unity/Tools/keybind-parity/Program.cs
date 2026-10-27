// PC-A16: KeyBindings (Core) against the web. usage: dotnet run -c Release -- <Resources/Data/keybind_web.json>
// The JSON is extracted from game.html by Tools/keybind-web/extract_keybind_defs.cjs; its `scenarios` are produced by running the REAL web functions
// (_chainAttackBindingConflict, _setInputBinding, window._resetBinds) in a sandbox, so defaults, names, key labels, the conflict rule and the reset (with its
// 18-row quirk) are all compared with web output, not with a copy of the same logic.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static void Check(bool ok, string what) { checks++; if (!ok) { bad++; Console.WriteLine("FAIL " + what); } }
    static string S(JsonElement e) { return e.ValueKind == JsonValueKind.Null ? null : e.GetString(); }

    static int Main(string[] a)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(a[0]));
        var root = doc.RootElement;
        // 1. actions, order, defaults
        var webActions = root.GetProperty("actions").EnumerateArray().Select(x => x.GetString()).ToArray();
        Check(webActions.SequenceEqual(KeyBindings.Actions), "action list and order equal the web BINDS keys (" + webActions.Length + ")");
        var kb = new KeyBindings();
        foreach (var act in webActions) Check(kb.Primary(act) == S(root.GetProperty("binds").GetProperty(act)), "default primary of " + act);
        Check(root.GetProperty("binds2Order").GetArrayLength() == webActions.Length, "web BINDS2 has the same actions");
        foreach (var act in webActions) Check(kb.Secondary(act) == S(root.GetProperty("binds2").GetProperty(act)) && kb.Secondary(act) == null, "default alternate of " + act + " is unbound");
        Check(kb.Listed.SequenceEqual(webActions), "initial list rows in BINDS order");
        // 2. names ko / en (web: ko = BIND_NAMES; en = _T(ko) from _EN, else BIND_NAMES_EN)
        foreach (var act in webActions)
        {
            string ko = root.GetProperty("names").GetProperty(act).GetString();
            string en = root.GetProperty("en").TryGetProperty(ko, out var t) ? t.GetString() : root.GetProperty("namesEn").GetProperty(act).GetString();
            Check(KeyBindings.Name(act, false) == ko, "ko name of " + act);
            Check(KeyBindings.Name(act, true) == en, "en name of " + act + " (" + en + ")");
        }
        // 3. keyName: every web label, mouse buttons, none, unknown codes
        var map = root.GetProperty("keyMap").EnumerateObject().ToDictionary(p => p.Name, p => p.Value.GetString());
        Check(map.Count == KeyBindings.KeyLabelTable.Count(), "key label table size " + map.Count);
        foreach (var kv in map) Check(KeyBindings.KeyName(kv.Key, false) == kv.Value && KeyBindings.KeyName(kv.Key, true) == kv.Value, "label of " + kv.Key + " = " + kv.Value);
        var ui = root.GetProperty("ui");
        foreach (var m in ui.GetProperty("mouse").EnumerateObject())
        {
            Check(KeyBindings.KeyName(m.Name, false) == m.Value[0].GetString(), "ko label of " + m.Name);
            Check(KeyBindings.KeyName(m.Name, true) == m.Value[1].GetString(), "en label of " + m.Name);
        }
        Check(KeyBindings.KeyName(null, false) == ui.GetProperty("none")[0].GetString() && KeyBindings.KeyName("", true) == ui.GetProperty("none")[1].GetString(), "none label ko/en");
        foreach (var raw in new[] {"KeyY", "KeyU", "Numpad1", "F5", "Enter", "Minus"}) Check(KeyBindings.KeyName(raw, true) == raw, "unmapped code shown raw: " + raw);
        Check(KeyBindings.ChainConflictKo == ui.GetProperty("chainConflict").GetString(), "chain conflict message (ko)");
        // 4. web scenarios (real web functions replayed): set / conflict / clear / reset incl. the 18-row quirk
        kb = new KeyBindings();
        int step = 0, interactResets = 0;
        foreach (var sc in root.GetProperty("scenarios").EnumerateArray())
        {
            step++; var op = sc.GetProperty("op"); string kind = op[0].GetString(); bool webOk = sc.GetProperty("ok").GetBoolean(); int before = kb.InteractResetCount;
            string rej = null; bool ok = true;
            if (kind == "set") ok = kb.TrySet(op[1].GetString(), S(op[2]), op[3].GetBoolean(), out rej);
            else if (kind == "clear") kb.ClearSecondary(op[1].GetString());
            else kb.ResetAll();
            string tag = "step " + step + " " + kind + (kind == "set" ? " " + op[1] + " " + (op[2].ValueKind == JsonValueKind.Null ? "null" : op[2].GetString()) + (op[3].GetBoolean() ? " alt" : "") : kind == "clear" ? " " + op[1] : "");
            Check(ok == webOk, tag + ": accepted=" + webOk);
            Check(ok || rej == KeyBindings.ChainConflictKo || rej == KeyBindings.RollKeyboardKo, tag + ": rejection message");
            Check(kb.InteractResetCount - before == sc.GetProperty("interactReset").GetInt32(), tag + ": interact reset count " + sc.GetProperty("interactReset"));
            var st = sc.GetProperty("state");
            var listed = st.GetProperty("listed").EnumerateArray().Select(x => x.GetString()).ToArray();
            Check(kb.Listed.SequenceEqual(listed), tag + ": rows " + listed.Length);
            foreach (var act in listed) Check(kb.Primary(act) == S(st.GetProperty("binds").GetProperty(act)), tag + ": primary " + act);
            foreach (var p in st.GetProperty("binds2").EnumerateObject()) Check(kb.Secondary(p.Name) == S(p.Value), tag + ": alternate " + p.Name);
            foreach (var act in webActions.Where(x => !st.GetProperty("binds2").TryGetProperty(x, out _))) Check(kb.Secondary(act) == null, tag + ": alternate " + act + " absent");
            interactResets += sc.GetProperty("interactReset").GetInt32();
        }
        // 5. the reset literals of the web: 18 actions
        var resetKeys = root.GetProperty("resetBinds").EnumerateObject().Select(p => p.Name).ToArray();
        var kb2 = new KeyBindings(); kb2.ResetAll();
        Check(kb2.Listed.SequenceEqual(resetKeys), "reset leaves " + resetKeys.Length + " rows (irisToggle and bladeToggle gone) like the web");
        foreach (var p in root.GetProperty("resetBinds").EnumerateObject()) Check(kb2.Primary(p.Name) == S(p.Value), "reset primary " + p.Name);
        Check(kb2.Primary("irisToggle") == null && kb2.Primary("bladeToggle") == null, "after reset irisToggle / bladeToggle are unbound");
        Console.WriteLine(checks + " checks, " + bad + " failures; scenario steps " + step + ", interact resets " + interactResets);
        Console.WriteLine(bad == 0 ? "KEYBIND_PARITY_OK" : "KEYBIND_PARITY_FAIL");
        return bad == 0 ? 0 : 1;
    }
}
