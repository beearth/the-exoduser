using System;
using System.IO;
using System.Text.Json;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;

class PoiseProgram
{
    static readonly List<object> rows = new List<object>();
    static readonly Dictionary<string, float[]> samples = new Dictionary<string, float[]>();
    static int failures, frames;
    static void Check(bool pass, string name)
    {
        rows.Add(new { name, passed = pass });
        if (!pass) { failures++; Console.WriteLine("FAIL " + name); }
    }
    static Simulation Make(JsonElement scenario, out EnemyState e)
    {
        var s = new Simulation(new SimulationConfig());
        s.Random01 = () => .5;
        int index = scenario.GetProperty("enemyIndex").GetInt32();
        // A dead, non-boss entry keeps the real enemy at web-loop index 1 for the other T2 phase.
        for (int i = 0; i < index; i++) { var spacer = s.SpawnNormalEnemy(600, 0); spacer.Alive = false; }
        e = s.SpawnNormalEnemy(200, 0);
        var initial = scenario.GetProperty("initial");
        e.Poise = initial.GetProperty("poise").GetSingle();
        e.MaxPoise = initial.GetProperty("maxPoise").GetSingle();
        e.Stunned = initial.GetProperty("stunned").GetSingle();
        e.MaxStunned = initial.GetProperty("_maxStunned").GetSingle();
        e.HitStun = initial.GetProperty("_hitStun").GetSingle();
        e.PoiseRegenTicks = initial.GetProperty("poiseR").GetSingle();
        s.CanMove = (x, y, r) => false;
        return s;
    }
    static void Step(Simulation s) => s.Tick(0, 0, 100, 0, false, false);
    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        Check(root.GetProperty("distance").GetInt32() == 200 && root.GetProperty("samplePoint").GetString() == "end-of-world-frame", "oracle retains 200px T2 and samples every world-frame end");
        foreach (var scenario in root.GetProperty("scenarios").EnumerateArray())
        {
            string name = scenario.GetProperty("name").GetString();
            int index = scenario.GetProperty("enemyIndex").GetInt32();
            var s = Make(scenario, out var e);
            foreach (var row in scenario.GetProperty("trace").EnumerateArray())
            {
                int frame = row.GetProperty("frame").GetInt32();
                Step(s); frames++;
                string label = name + " index" + index + " frame" + frame;
                Check(e.Poise == row.GetProperty("poise").GetSingle(), label + " poise");
                Check(e.PoiseRegenTicks == row.GetProperty("poiseR").GetSingle(), label + " regen ticks");
                Check(e.Stunned == row.GetProperty("stunned").GetSingle(), label + " stun timer");
                Check(e.HitStun == row.GetProperty("_hitStun").GetSingle(), label + " hit-stun timer");
                Check(e.X - s.Player.X == 200 && e.Y == s.Player.Y && e.Alive && !e.IsBoss && e.HurtTicks == 0 && e.State != "eChargeWind" && e.State != "eCharge", label + " remains 200px T2, no T1 exemption");
                Check(s.TickCount == frame, label + " exact world-frame sample alignment");
                samples[name + "/" + index + "/" + frame] = new[] { e.Poise, e.PoiseRegenTicks, e.Stunned, e.HitStun };
            }
        }
        // Keep the seven original boundary observations, now aligned to the actual T2 world frames.
        var expiry = samples["regen/0/1"]; var before = samples["regen/0/199"];
        var at200 = samples["regen/0/200"]; var at400 = samples["regen/0/400"];
        Check(expiry[2] == root.GetProperty("expiry").GetProperty("stunned").GetSingle() && expiry[0] == root.GetProperty("expiry").GetProperty("poise").GetSingle(), "ordinary stun expiry does not restore full poise");
        Check(expiry[1] == root.GetProperty("expiry").GetProperty("poiseR").GetSingle(), "T2 expiry frame regen sample");
        Check(before[0] == root.GetProperty("before").GetProperty("poise").GetSingle() && before[1] == root.GetProperty("before").GetProperty("poiseR").GetSingle(), "T2 frame199 before regeneration boundary");
        Check(at200[0] == root.GetProperty("at200").GetProperty("poise").GetSingle() && at200[1] == root.GetProperty("at200").GetProperty("poiseR").GetSingle(), "T2 frame200 regeneration boundary");
        Check(at400[0] == root.GetProperty("at400").GetProperty("poise").GetSingle() && at400[1] == root.GetProperty("at400").GetProperty("poiseR").GetSingle(), "T2 frame400 second regeneration boundary");
        var stunned = samples["stunned/0/1"]; var hit = samples["hitstun/0/1"];
        Check(stunned[2] == root.GetProperty("stunned").GetProperty("stunned").GetSingle() && stunned[0] == root.GetProperty("stunned").GetProperty("poise").GetSingle() && stunned[1] == root.GetProperty("stunned").GetProperty("poiseR").GetSingle(), "T2 stunned sample");
        Check(hit[3] == root.GetProperty("hitstun").GetProperty("_hitStun").GetSingle() && hit[0] == root.GetProperty("hitstun").GetProperty("poise").GetSingle() && hit[1] == root.GetProperty("hitstun").GetProperty("poiseR").GetSingle(), "T2 hit-stun sample");
        File.WriteAllText(args[0], JsonSerializer.Serialize(new { scope = "200px_T2_both_enemy_index_phases_every_world_frame_not_Unity_runtime", passed = failures == 0, failures, frames, checks = rows }, new JsonSerializerOptions { WriteIndented = true }));
        Console.WriteLine("POISE_RESULT " + rows.Count + " checks / " + failures + " failures (" + frames + " world-frame samples)");
        return failures == 0 ? 0 : 2;
    }
}
