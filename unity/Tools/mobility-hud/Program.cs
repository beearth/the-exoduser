using System;
using System.Reflection;
using System.IO;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

static class Program
{
    static int checks;
    static void Check(bool ok, string name) { if (!ok) throw new Exception(name); checks++; }
    static void Near(double actual, double expected, string name) { Check(Math.Abs(actual - expected) < .00001, name + ": " + actual); }
    static void Parry(string state, double start, double expected)
    {
        var sim = new Simulation(new SimulationConfig());
        sim.Random01 = () => .99;
        sim.Player.State = state; sim.Player.StateTicks = 20; sim.SbParryT = 10;
        sim.Player.Iframes = 0; sim.HarpGauge = start;
        sim.HurtPlayer(10);
        Check(sim.ParryCount == 1, state + " incoming hit actually parried");
        Near(sim.HarpGauge, expected, state + " mobility reward");
    }
    static int Pixel(double turn)
    {
        int x = (int)Math.Round(127.5 + Math.Sin(turn * Math.PI * 2) * 124);
        int y = (int)Math.Round(127.5 + Math.Cos(turn * Math.PI * 2) * 124);
        return (y * 256 + x) * 4;
    }
    static void BuiltCoreParry(string assemblyPath, string state)
    {
        var assembly = Assembly.LoadFile(Path.GetFullPath(assemblyPath));
        var configType = assembly.GetType("Exoduser.UnityPort.Core.SimulationConfig", true);
        var simType = assembly.GetType("Exoduser.UnityPort.Core.Simulation", true);
        object sim = Activator.CreateInstance(simType, new object[] { Activator.CreateInstance(configType), (uint)1 });
        object player = simType.GetField("Player").GetValue(sim); var pt = player.GetType();
        pt.GetField("State").SetValue(player, state); pt.GetField("StateTicks").SetValue(player, 20f);
        pt.GetField("Iframes").SetValue(player, 0f);
        simType.GetField("SbParryT").SetValue(sim, 10d); simType.GetField("HarpGauge").SetValue(sim, 0d);
        simType.GetField("Random01").SetValue(sim, (Func<double>)(() => .99));
        simType.GetMethod("HurtPlayer", new[] { typeof(int) }).Invoke(sim, new object[] { 10 });
        Check((int)simType.GetField("ParryCount").GetValue(sim) == 1, "built Core " + state + " parry succeeds");
        Near((double)simType.GetField("HarpGauge").GetValue(sim), 20, "built Core " + state + " restores mobility");
    }
    static int Main(string[] args)
    {
        try
        {
            Parry("sBlock", 0, 20); Parry("sBash", 0, 20);
            Parry("peaceShield", 0, 20); Parry("sBlock", 220, 225);
            foreach (var el in new[] { "red", "rainbow" })
            {
                var r = ParryRewards.Apply(new ParryRewards.Input { HarpGaugeMax = 225, ParryEl = el, ResourceMul = 1 });
                Near(r.HarpGauge, el == "red" ? 10 : 30, el + " mobility reward");
            }
            if(args.Length > 0) { BuiltCoreParry(args[0], "sBlock"); BuiltCoreParry(args[0], "sBash"); }
            var type = typeof(Program).Assembly.GetType("Exoduser.UnityPort.NativeMobilityRing");
            Check(type != null, "MISSING: visible segmented mobility ring renderer");
            object ring = Activator.CreateInstance(type);
            var update = type.GetMethod("Update");
            Func<double, double, bool> paint = (g, m) => (bool)update.Invoke(ring, new object[] { g, m });
            Func<byte[]> pixels = () => (byte[])type.GetProperty("Pixels").GetValue(ring);
            paint(0, 225); var p = pixels(); int q = Pixel(.125);
            Check(p[q] == 0 && p[q + 3] > 0, "empty gauge retains visible dark track");
            Check(p[Pixel(.203) + 3] > 200, "empty gauge retains cost separator");
            Check(p[(128 * 256 + 128) * 4 + 3] == 0 && p[3] == 0, "ring center and corners remain transparent");
            paint(112.5, 225); p = pixels();
            Check(p[q] == 255 && p[q + 1] == 204 && p[q + 2] == 51, "first half is source yellow");
            Check(p[Pixel(.625)] == 0, "second half remains empty");
            Check(!paint(112.5, 225), "unchanged gauge avoids texture rebuild");
            paint(270, 270); p = pixels();
            Check(p[Pixel(1.0 / 6 + .003) + 3] > 200 && p[Pixel(1.0 / 6 + .003)] == 0, "capacity change keeps separators at 45 resource units");
            Check(p[Pixel(.2)] == 255, "capacity change does not keep stale five-cell ticks");
            paint(999, 225); Check(pixels()[Pixel(.925)] == 255, "overfull gauge clamps full");
            paint(-1, 225); Check(pixels()[q] == 0, "negative gauge clamps empty");
            paint(0, 0); Check(Array.TrueForAll(pixels(), b => b == 0), "invalid capacity hides ring");
            if(args.Length > 1) foreach(int gauge in new[] { 0, 20, 112, 225 }) {
                paint(gauge,225); File.WriteAllBytes(Path.Combine(args[1],"ring-"+gauge+".rgba"),pixels());
            }
            Console.WriteLine("MOBILITY_HUD PASS " + checks + " checks; standalone Core/raster, not Player"); return 0;
        }
        catch (Exception e) { Console.Error.WriteLine("MOBILITY_HUD FAIL after " + checks + " checks: " + e.Message); return 1; }
    }
}
