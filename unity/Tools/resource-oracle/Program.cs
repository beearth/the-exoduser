using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// D-U3. 원문 VM 출력과 실제 ApplyEquipment의 Config 및 Player 최대치를 비교한다.
// 불일치는 측정 결과이며 종료 코드 2. 실행/입력 오류는 종료 코드 1.
class Program
{
    static readonly JsonSerializerOptions Json = new JsonSerializerOptions { IncludeFields = true, WriteIndented = true };
    static readonly string[] Resources = { "HP", "MP", "ST", "쉴드" };
    static double[] Values(JsonElement row) { var a = new List<double>(); foreach (var x in row.EnumerateArray()) a.Add(x.GetDouble()); return a.ToArray(); }
    static bool Near(double a, double b) => Math.Abs(a - b) <= .001;
    static int Main(string[] args)
    {
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        Console.InputEncoding = new System.Text.UTF8Encoding(false);
        try { return Compare(args); }
        catch (Exception e) { Console.Error.WriteLine("하니스 오류: " + e); return 1; }
    }
    static int Compare(string[] args)
    {
        if (args.Length != 2) throw new ArgumentException("ResourceOracleTests.dll oracle.json result.json");
        using var doc = JsonDocument.Parse(File.ReadAllText(args[0]));
        var rows = new List<object>(); var isolated = new List<object>();
        var termCounts = new SortedDictionary<string, int>(); var resourceCounts = new int[4];
        int total = 0, mismatches = 0, adapterMismatches = 0, isolatedMismatches = 0, mixedMismatches = 0;
        var baselineWeb = new double[4]; var baselineUnity = new double[4];
        var allocatedWeb = new double[4]; var allocatedUnity = new double[4];
        foreach (var c in doc.RootElement.GetProperty("cases").EnumerateArray())
        {
            string id = c.GetProperty("id").GetString(), group = c.GetProperty("group").GetString();
            var config = new SimulationConfig { EnemyAiEnabled = false, StageIndex = c.GetProperty("stage").GetInt32() - 1, DifficultyIndex = c.GetProperty("difficulty").GetInt32() + 5 };
            var simulation = new Simulation(config);
            simulation.Player.Level = c.GetProperty("level").GetInt32();
            foreach (var p in c.GetProperty("stats").EnumerateObject()) { if (p.Name == "grit") simulation.Growth.Grit = p.Value.GetInt32(); else simulation.Growth.Stats[p.Name] = p.Value.GetInt32(); }
            foreach (var p in c.GetProperty("passives").EnumerateObject()) simulation.Growth.Passives[p.Name] = p.Value.GetInt32();
            var equipment = new InventoryItem[InventoryState.Slots.Length];
            foreach (var j in c.GetProperty("items").EnumerateArray())
            {
                var item = JsonSerializer.Deserialize<InventoryItem>(j.GetRawText(), Json);
                string reason; if (!InventoryState.Admitted(item, out reason)) throw new InvalidOperationException(id + ": " + reason);
                int slot = Array.IndexOf(InventoryState.Slots, item.slot); if (equipment[slot] != null) throw new InvalidOperationException("슬롯 중복 " + id);
                equipment[slot] = item;
            }
            simulation.ApplyEquipment(new InventoryState(new InventorySeedData { equipped = equipment, bag = Array.Empty<InventoryItem>() }));
            double[] web = Values(c.GetProperty("web"));
            double[] unity = { config.PlayerMaxHp, config.PlayerMaxMana, config.PlayerMaxStamina, config.PlayerMaxShield };
            double[] player = { simulation.Player.MaxHp, simulation.Player.MaxMana, simulation.Player.MaxStamina, simulation.Player.MaxShield };
            var different = new List<string>(); var delta = new double[4];
            for (int i = 0; i < 4; i++) { if (!Near(unity[i], player[i])) adapterMismatches++; delta[i] = unity[i] - web[i]; if (!Near(web[i], unity[i])) { resourceCounts[i]++; different.Add(Resources[i]); } }
            total++; bool failed = different.Count != 0;
            if (failed) { mismatches++; if (group == "단독") isolatedMismatches++; if (group == "혼합") mixedMismatches++; }
            rows.Add(new { id, group, web, unity, player, delta, different, matched = !failed });
            if (id == "baseline") { baselineWeb = web; baselineUnity = unity; }
            if (id == "allocated:baseline") { allocatedWeb = web; allocatedUnity = unity; }
            if (group == "단독")
            {
                var webEffect = new double[4]; var unityEffect = new double[4];
                for (int i = 0; i < 4; i++) { webEffect[i] = web[i] - (id.StartsWith("allocated:") ? allocatedWeb[i] : baselineWeb[i]); unityEffect[i] = unity[i] - (id.StartsWith("allocated:") ? allocatedUnity[i] : baselineUnity[i]); }
                isolated.Add(new { term = id, web, unity, webEffect, unityEffect, delta, different });
                string term = id.StartsWith("allocated:") ? "field:" + id.Substring("allocated:".Length) : id;
                if (failed) { if (!termCounts.ContainsKey(term)) termCounts[term] = 0; termCounts[term]++; }
                if (failed) Console.WriteLine("단독 불일치 " + id + " / " + string.Join(",", different) + " / Unity-웹 " + string.Join(",", delta));
            }
        }
        if (total < 300) throw new InvalidOperationException("300건 미만");
        var result = new { scope = "원문 applyStats/recalcSt 대 실제 Core ApplyEquipment; 화면·플레이·드랍확률 미검증", source = doc.RootElement.GetProperty("source"), total, mismatches, isolatedMismatches, mixedMismatches, adapterMismatches, resources = Resources, resourceCounts, termCounts, isolated, cases = rows };
        File.WriteAllText(args[1], JsonSerializer.Serialize(result, Json));
        Console.WriteLine("자원 대조 " + total + "건 / 불일치 " + mismatches + "건 / 단독 " + isolatedMismatches + "건 / 혼합 " + mixedMismatches + "건 / Config-Player 불일치 " + adapterMismatches);
        Console.WriteLine("자원별 불일치 HP/MP/ST/쉴드: " + string.Join("/", resourceCounts));
        foreach (var term in termCounts) Console.WriteLine("단독 원인 항별 불일치 " + term.Key + ": " + term.Value + "건");
        return mismatches == 0 && adapterMismatches == 0 ? 0 : 2;
    }
}
