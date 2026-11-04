using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// D-U2: Unity ApplyEquipment defence totals and the HurtPlayer defence block against the ORIGINAL web _playerDefTotals() / hurtP block (export.cjs).
// usage: DefenseOracleTests.dll <oracle.json> [result.json]
class Program
{
    static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }

    static InventoryState Inventory(JsonElement items)
    {
        var equipped = new InventoryItem[InventoryState.Slots.Length];
        foreach (var j in items.EnumerateArray())
        {
            var it = new InventoryItem { slot = j.GetProperty("slot").GetString(), def = j.GetProperty("def").GetDouble(), eDef = j.GetProperty("eDef").GetDouble(), bGrit = j.GetProperty("bGrit").GetDouble() };
            if (it.slot == "weapon") it.wtype = "sword";
            var aff = new List<InventoryAffix>(); foreach (var a in j.GetProperty("affixes").EnumerateArray()) aff.Add(new InventoryAffix { id = a.GetProperty("id").GetString(), value = a.GetProperty("value").GetDouble(), tier = a.GetProperty("tier").GetInt32() });
            it.affixes = aff.ToArray(); equipped[Array.IndexOf(InventoryState.Slots, it.slot)] = it;
        }
        return new InventoryState(new InventorySeedData { equipped = equipped, bag = new InventoryItem[0] });
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[0]));
        int n = 0, badDef = 0, hurts = 0, badHurt = 0, reduced = 0, affixMoved = 0;
        foreach (var c in doc.RootElement.GetProperty("cases").EnumerateArray())
        {
            var s = new Simulation(new SimulationConfig { EnemyAiEnabled = false }); s.Random01 = () => .99;   // no dodge draw lands
            s.Player.Level = c.GetProperty("level").GetInt32(); s.Growth.Grit = c.GetProperty("grit").GetInt32(); s.Growth.Passives["pArmor"] = c.GetProperty("pArmor").GetInt32();
            s.ApplyEquipment(Inventory(c.GetProperty("items")));
            double pDef = s.Config.PlayerPhysicalDefense, eDef = s.Config.PlayerEnergyDefense, wp = c.GetProperty("pDef").GetDouble(), we = c.GetProperty("eDef").GetDouble();
            n++; if (Math.Abs(pDef - wp) > 1e-3 || Math.Abs(eDef - we) > 1e-3) { badDef++; if (badDef <= 5) Console.WriteLine("  defence differs case " + n + ": web " + wp + "/" + we + " unity " + pDef + "/" + eDef); }
            int mhp = c.GetProperty("mhp").GetInt32();
            foreach (var h in c.GetProperty("hurts").EnumerateArray())
            {
                string kind = h.GetProperty("kind").GetString(); int dmg = h.GetProperty("dmg").GetInt32(), web = h.GetProperty("web").GetInt32();
                var p = s.Player; p.MaxHp = mhp; p.Hp = h.GetProperty("hp").GetInt32(); p.X = h.GetProperty("x").GetSingle(); p.Y = h.GetProperty("y").GetSingle(); p.Iframes = 0; p.Shield = 0; p.State = "idle";
                s.HurtPlayer(dmg, new HurtOptions { Magic = kind == "magic", Dot = kind == "dot" || kind == "label", Labeled = kind == "label" });
                int unity = s.LastHurtAmount; hurts++; if (unity < dmg) reduced++;
                if (unity != web) { badHurt++; if (badHurt <= 8) Console.WriteLine("  hurt differs case " + n + " " + kind + " dmg " + dmg + " hp " + p.Hp + " at " + p.X + "," + p.Y + ": web " + web + " unity " + unity); }
            }
        }
        Check(n > 0 && badDef == 0, "web _playerDefTotals oracle " + n + " equipment cases (7 slot def, 15 slot eDef, defFlat, eDefFlat, bGrit, gritFlatN/R, SP grit, pArmor), mismatches " + badDef);
        Check(hurts > 0 && badHurt == 0, "web hurtP defence block oracle " + hurts + " hits (phys / magic / dot / labelled dot x hp 100/50/20 % x position), mismatches " + badHurt + ", reduced " + reduced);

        // the affix layer moves damage: physDR 22 % armor at 0 def, barrier 65, injured / far DR, energy defence 1000
        var one = new Simulation(new SimulationConfig { EnemyAiEnabled = false }); one.Random01 = () => .99;
        Func<string, double, int, bool, bool, bool, float, int> hit = (id, v, dmg, magic, dot, label, hpf) => {
            var it = new InventoryItem { slot = id == "farDR" ? "shield" : id == "eDef" ? "necklace" : "armor", eDef = id == "eDef" ? v : 0, affixes = id == "eDef" ? new InventoryAffix[0] : new[] { new InventoryAffix { id = id, value = v, tier = 4 } } };
            var eq = new InventoryItem[InventoryState.Slots.Length]; eq[Array.IndexOf(InventoryState.Slots, it.slot)] = it;
            one.ApplyEquipment(new InventoryState(new InventorySeedData { equipped = eq, bag = new InventoryItem[0] }));
            var p = one.Player; p.MaxHp = 100000; p.Hp = p.MaxHp * hpf; p.X = 3000; p.Y = 3000; p.Iframes = 0; p.Shield = 0;
            one.HurtPlayer(dmg, new HurtOptions { Magic = magic, Dot = dot, Labeled = label }); return one.LastHurtAmount; };
        foreach (var t in new[] { ("physDR", .22, false, false, false, 1f, 1000), ("barrier", 65, false, false, false, 1f, 1000), ("injuredDR", .34, false, false, false, .2f, 1000), ("farDR", .3, false, true, true, 1f, 1000), ("eDef", 1000, true, false, false, 1f, 1000) })
        {
            int with = hit(t.Item1, t.Item2, t.Item7, t.Item3, t.Item4, t.Item5, t.Item6), without = hit(t.Item1, 0, t.Item7, t.Item3, t.Item4, t.Item5, t.Item6);
            if (with < without) affixMoved++;
            Check(with < without, "affix " + t.Item1 + " " + t.Item2 + ": " + t.Item7 + " -> " + without + " without, " + with + " with");
        }

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_core_vs_web_playerDefTotals_and_hurtP_defence_block", passed = failed == 0, failed, checks = Rows }, new JsonSerializerOptions { WriteIndented = true });
        if (args.Length > 1) File.WriteAllText(args[1], result);
        Console.WriteLine("DEFENSE_RESULT " + Rows.Count + " checks / " + failed + " failures"); return failed == 0 ? 0 : 2;
    }
}
