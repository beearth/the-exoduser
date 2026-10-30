using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
partial class Program
{
    static int ShieldCooldownTrace(string[] args)
    {
        using var reference = JsonDocument.Parse(File.ReadAllText(args[0]));
        var rows = new List<object>(); int failed = 0;
        foreach (var row in reference.RootElement.GetProperty("cases").EnumerateArray())
        {
            var config = SourceStarterFixture.CreateKiSlash(); config.EnemyAiEnabled = false;
            var simulation = new Simulation(config); string state = row.GetProperty("state").GetString();
            simulation.Player.State = state; simulation.Player.StateTicks = 100; simulation.SbCd = row.GetProperty("cd").GetDouble();
            simulation.SetPlayerCombatInput(state == "sBlock", false, false);
            simulation.Tick(0, 0, simulation.Player.X + 300, simulation.Player.Y, false, false);
            double expected = row.GetProperty("expected").GetDouble(); bool passed = simulation.SbCd == expected;
            if (!passed) failed++;
            rows.Add(new { state, before = row.GetProperty("cd").GetDouble(), expected, actual = simulation.SbCd, passed });
        }
        File.WriteAllText(args[1], JsonSerializer.Serialize(new { 범위 = "실제 원문 보호막 쿨다운 대 생존 자세의 전체 Simulation.Tick", checks = rows.Count, failed, cases = rows }, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"Q 쿨다운 생존 자세 {rows.Count}건, 차이 {failed}"); return failed > 0 ? 2 : 0;
    }
    static int StartingSkillsTrace(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        using var reference = JsonDocument.Parse(File.ReadAllText(args[0]));
        var options = new JsonSerializerOptions { IncludeFields = true, PropertyNameCaseInsensitive = true };
        var failures = new List<object>(); var trace = new List<object>(); var cases = new List<object>();
        int checks = 0, failed = 0;
        foreach (string key in reference.RootElement.GetProperty("trace").EnumerateArray().Select(r => r.GetProperty("key").GetString()).Distinct())
        {
            var config = SourceStarterFixture.CreateKiSlash(); config.StartX = 4020; config.StartY = 7420; config.EnemyAiEnabled = false; config.InitialIframes = key == "Roll" ? 0 : 100000;
            var simulation = new Simulation(config); simulation.ApplyEquipment(new InventoryState(JsonSerializer.Deserialize<InventorySeedData>(File.ReadAllText(args[1]), options)));
            simulation.Random01 = () => .5; simulation.Materials = 1000; simulation.IsProjectileWall = (x, y) => false; simulation.CrossbowAuto = false; simulation.SpawnHoles = null;
            var skillRandom = typeof(Simulation).GetField("SkillRandom01");
            if (skillRandom != null) skillRandom.SetValue(simulation, (Func<double>)(() => .5));
            var p = simulation.Player;
            if (key == "Roll") { p.Hp = p.MaxHp; p.Mana = p.MaxMana; p.Stamina = p.MaxStamina; p.Shield = p.MaxShield; }
            int f = 0, caseFailed = 0;
            foreach (var w in reference.RootElement.GetProperty("trace").EnumerateArray().Where(r => r.GetProperty("key").GetString() == key))
            {
                bool held = f < (key == "E" || key == "Roll" ? 1 : 14), rolling = key == "Roll" && held;
                simulation.SetPlayerCombatInput(key == "Q" && held, key == "E" && held, key == "Shift" && held);
                simulation.SetRollInput(false, false, false, rolling, rolling);
                simulation.SetSkillInput(key == "1" && held, key == "2" && held, key == "3" && held, key == "4" && held, (key == "Space" || key == "Roll") && held, key == "F" && held, key == "Ctrl" && held, key == "Z" && held, true);
                simulation.SetMagicInput(key == "RMB" && held);
                simulation.Tick(rolling ? 1 : 0, 0, p.X + 300, p.Y, key == "LMB" && held, false);
                double position = Math.Sqrt(Math.Pow(p.X - w.GetProperty("x").GetDouble(), 2) + Math.Pow(p.Y - w.GetProperty("y").GetDouble(), 2));
                double resource = Math.Max(Math.Abs(p.Mana - w.GetProperty("mp").GetDouble()), Math.Abs(p.Stamina - w.GetProperty("st").GetDouble()));
                var cooldowns = w.GetProperty("cooldowns");
                bool timers = simulation.SpikeTrapCd == cooldowns.GetProperty("trap").GetSingle() && simulation.GiantSlamCd == cooldowns.GetProperty("slam").GetSingle() && simulation.HolyDomeCd == cooldowns.GetProperty("dome").GetSingle() && simulation.IceOrbCd == cooldowns.GetProperty("ice").GetSingle() && simulation.SbCd == cooldowns.GetProperty("shield").GetDouble();
                var blades = simulation.SkillBlades.Where(b => b.Active).ToArray(); var webBlades = w.GetProperty("iceBlades");
                bool bladePositions = blades.Length == webBlades.GetArrayLength();
                if (bladePositions) for (int i = 0; i < blades.Length; i++) if (Math.Abs(blades[i].X - webBlades[i].GetProperty("x").GetDouble()) >= .03 || Math.Abs(blades[i].Y - webBlades[i].GetProperty("y").GetDouble()) >= .03) bladePositions = false;
                bool extra = bladePositions && timers && simulation.Materials == w.GetProperty("mats").GetInt32() && Math.Abs(simulation.HarpGauge - w.GetProperty("gauge").GetDouble()) < .005 && p.Iframes == w.GetProperty("iframes").GetSingle() && simulation.IceOrbActive == w.GetProperty("orb").GetBoolean();
                bool ok = extra && position < .03 && resource < .005 && p.State == w.GetProperty("state").GetString() && p.StateTicks == w.GetProperty("st2").GetSingle() && simulation.HarpActive == w.GetProperty("harp").GetBoolean() && simulation.DashActive == w.GetProperty("dash").GetBoolean();
                if (!ok) { failed++; caseFailed++; if (failures.Count < 32) failures.Add(new { key, frame = f, position, resource, actual = new { state = p.State, timer = p.StateTicks, st = p.Stamina, mp = p.Mana, harp = simulation.HarpActive, dash = simulation.DashActive }, expected = w.ToString() }); }
                checks++; trace.Add(new { key, frame = f++, x = p.X, y = p.Y, state = p.State, timer = p.StateTicks, stamina = p.Stamina, mana = p.Mana, harp = simulation.HarpActive, dash = simulation.DashActive, trapCd = simulation.SpikeTrapCd, slamCd = simulation.GiantSlamCd, domeCd = simulation.HolyDomeCd, iceCd = simulation.IceOrbCd, mats = simulation.Materials });
            }
            cases.Add(new { key, checks = f, failed = caseFailed });
        }
        File.WriteAllText(args[2], JsonSerializer.Serialize(new { 범위 = "실제 웹1350틱 대 실제 Core 시작8개·14입력. 3D Player와 같은 자원 및 입력 조건. 투사체 난수·UI·화면 별도", checks, failed, cases, failures, trace }, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine($"시작 스킬 {checks}틱, 차이 {failed}"); return failed > 0 ? 2 : 0;
    }
}
