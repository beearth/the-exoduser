using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

// Executes the shield capture and 09c bodies extracted from the actual M1 source.
// Core + real map only; no Unity, rendering, sound or user save access.
static partial class M1ParryTests
{
    static int checks, failures;
    static Simulation active;
    static MapData data;
    static SourceMap map;
    static void Check(bool ok, string name) { checks++; if (!ok) { failures++; Console.WriteLine("FAIL " + name); } }
    static Dictionary<string, object> Values(object value)
    {
        return value.GetType().GetFields(BindingFlags.Public | BindingFlags.Instance)
            .Where(f => f.FieldType.IsPrimitive || f.FieldType == typeof(string))
            .ToDictionary(f => f.Name, f => f.GetValue(value));
    }
    static void Unchanged(object value, Dictionary<string, object> before, string label)
    {
        var after = Values(value);
        var changed = before.Keys.Where(k => !Equals(before[k], after[k])).ToArray();
        Check(changed.Length == 0, label + " leaked: " + string.Join(",", changed));
    }
    static Simulation Make(uint seed)
    {
        var config = SourceStarterFixture.CreateKiSlash(); config.EnemyAiEnabled = false;
        config.StartX = data.startX; config.StartY = data.startY;
        var sim = new Simulation(config, seed);
        sim.CanMove = map.CanMove; sim.HasLineOfSight = map.LineOfSight;
        sim.IsProjectileWall = map.ProjectileBlocked;
        sim.FloorTile = (x, y) => !map.Blocked((x + .5f) * 40, (y + .5f) * 40);
        sim.Stage.InitializeField(data.tiles, data.width); sim.Stage.Enabled = true;
        sim.EnableFieldSpawns(); sim.SpawnStartEnemies(); sim.InitRegions(); sim.SpawnHoles = null;
        sim.Enemies.Clear(); sim.Player.Iframes = 99999; sim.EnableFieldBosses();
        return sim;
    }
    static void StepInput(float x, float y, float ax, float ay, bool attack, bool pickup)
    {
        active.Tick(x, y, ax, ay, attack, pickup); active.Feedback.Clear(); active.Stage.Events.Clear();
    }
    static void M1Add(string id, string name, string status, string note, string cap)
    {
        Check(status == "ok", "actual M1 " + id + ": " + note);
        Console.WriteLine("M1 " + id + " " + status + ": " + note);
    }
    static int Main(string[] args)
    {
        data = JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[0]), new JsonSerializerOptions { IncludeFields = true });
        map = new SourceMap(data);
        var sim = Make(SourceStarterFixture.Seed);
        var p = sim.Player;
        p.State = "sBash"; p.StateTicks = ParryRules.SBashTicks;
        p.Hp = p.MaxHp - 60; p.Stamina = p.MaxStamina - 60; p.Mana = p.MaxMana - 60;
        p.Poise = 1; sim.HarpGauge = 90; sim.Rage = 7; sim.Materials = 123;
        sim.Feedback.Clear(); var player = Values(p); var core = Values(sim);
        uint rng = sim.FirstPracticeRandomState;
        int count = sim.ParryCount;
        ShieldCut(sim, () => {
            Check(sim.ParryCount == count + 1 && sim.Feedback.Any(e => e.Kind == FeedbackKind.Parry), "capture sees the real shield parry");
            sim.Feedback.Clear(); // same drain boundary as M1Shot
        });
        Unchanged(p, player, "player"); Unchanged(sim, core, "simulation");
        Check(sim.FirstPracticeRandomState == rng, "capture must preserve the gameplay RNG (HurtPlayer draws dodge before parry)");

        // A capture exception must also leave the following gameplay untouched.
        player = Values(p); core = Values(sim); rng = sim.FirstPracticeRandomState;
        try { ShieldCut(sim, () => { throw new InvalidOperationException("capture failed"); }); }
        catch (InvalidOperationException) { }
        Unchanged(p, player, "player after failed capture"); Unchanged(sim, core, "simulation after failed capture");
        Check(sim.FirstPracticeRandomState == rng, "failed capture must preserve RNG");

        var control = Make(SourceStarterFixture.Seed);
        var candidate = Make(SourceStarterFixture.Seed);
        candidate.Player.State = "sBash"; candidate.Player.StateTicks = ParryRules.SBashTicks;
        ShieldCut(candidate, () => candidate.Feedback.Clear());
        candidate.Player.State = control.Player.State; candidate.Player.StateTicks = control.Player.StateTicks;
        // Identical real kill/angler-death route, with and without the extra shot.
        GateRoute(control); GateRoute(candidate);
        Check(candidate.FirstPracticeRandomState == control.FirstPracticeRandomState, "09c RNG agrees with the no-extra-cut control");
        Check(candidate.Stage.BossUnlocked == control.Stage.BossUnlocked && candidate.Stage.StageKills == control.Stage.StageKills && candidate.Stage.CheckT == control.Stage.CheckT,
            "09c gate, kills and room-check phase agree with the control");
        Console.WriteLine("m1-parry: " + checks + " checks, " + failures + " failures");
        return failures == 0 ? 0 : 1;
    }
}
