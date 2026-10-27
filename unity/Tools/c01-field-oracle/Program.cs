using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
// C01 field oracle (spawn part): SpawnHoleSystem replays the scripted walks of oracle.json (export.cjs ran the ORIGINAL 소환굴 update block in a Node VM).
// Compared per scenario: every summon (frame, x, y, etype, room), the number of holes left and the Math.random() count. Standalone .NET check.
class FieldProgram
{
    static int Imul(int a, int b) { return unchecked(a * b); }
    static Func<double> Mulberry(int a) { return () => { a = unchecked(a + 0x6D2B79F5); int t = Imul(a ^ (int)((uint)a >> 15), 1 | a); t = unchecked(t + Imul(t ^ (int)((uint)t >> 7), 61 | t)) ^ t; return (double)(uint)(t ^ (int)((uint)t >> 14)) / 4294967296.0; }; }
    static bool Same(double a, double b) { return a == b || (a == 0 && b == 0); }
    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement; int total = 0, fail = 0, scenarios = 0, spawnsTotal = 0;
        foreach (var r in root.GetProperty("results").EnumerateArray())
        {
            var sc = r.GetProperty("sc"); scenarios++; string name = sc.GetProperty("name").GetString();
            var rnd = Mulberry((int)sc.GetProperty("seed").GetDouble()); int draws = 0; Func<double> rand = () => { draws++; return rnd(); };
            bool hasWall = sc.GetProperty("walls").ValueKind == JsonValueKind.Object; double wx0 = 1, wx1 = 0, wy0 = 1, wy1 = 0;
            if (hasWall) { var w = sc.GetProperty("walls"); wx0 = w.GetProperty("x0").GetDouble(); wx1 = w.GetProperty("x1").GetDouble(); wy0 = w.GetProperty("y0").GetDouble(); wy1 = w.GetProperty("y1").GetDouble(); }
            Func<double, double, bool> isW = (x, y) => x >= wx0 && x <= wx1 && y >= wy0 && y <= wy1;
            int frame = 0; var spawns = new List<double[]>();
            var sys = new SpawnHoleSystem { TileWidth = 200, TileHeight = 200, Random = rand, IsWall = isW, FloorTile = (tx, ty) => !isW((tx + .5) * 40, (ty + .5) * 40), AliveEnemies = () => 0,
                Spawn = (x, y, si, et) => { spawns.Add(new[] { frame, x, y, et, 1 }); return true; } };
            sys.Holes.Clear();
            foreach (var h in root.GetProperty("holes").EnumerateArray()) sys.Holes.Add(new SpawnHole { X = h.GetProperty("x").GetDouble(), Y = h.GetProperty("y").GetDouble(), Size = h.GetProperty("size").GetDouble(), Room = (int)h.GetProperty("room").GetDouble() });
            var path = sc.GetProperty("path"); int frames = (int)sc.GetProperty("frames").GetDouble();
            for (frame = 1; frame <= frames; frame++)
            {
                double px = 0, py = 0; foreach (var p in path.EnumerateArray()) if (frame >= p[0].GetDouble()) { px = p[1].GetDouble(); py = p[2].GetDouble(); }
                if (path[0][0].GetDouble() > frame) { px = path[0][1].GetDouble(); py = path[0][2].GetDouble(); }
                sys.Tick(frame, px, py, 1, 0);
            }
            var web = r.GetProperty("spawns"); total++;
            if (web.GetArrayLength() != spawns.Count) { fail++; Console.WriteLine("COUNT " + name + " C# " + spawns.Count + " web " + web.GetArrayLength()); }
            for (int i = 0; i < Math.Min(spawns.Count, web.GetArrayLength()); i++)
            {
                total++; var w = web[i];
                bool ok = Same(spawns[i][0], w[0].GetDouble()) && Same(spawns[i][1], w[1].GetDouble()) && Same(spawns[i][2], w[2].GetDouble()) && Same(spawns[i][3], w[3].GetDouble());
                if (!ok) { fail++; if (fail < 15) Console.WriteLine("SPAWN " + name + " #" + i + " C# f" + spawns[i][0] + " " + spawns[i][1].ToString("R") + "," + spawns[i][2].ToString("R") + " et" + spawns[i][3] + " web " + w); }
            }
            total++; if (sys.Holes.Count != (int)r.GetProperty("holesLeft").GetDouble()) { fail++; Console.WriteLine("HOLES-LEFT " + name + " C# " + sys.Holes.Count + " web " + r.GetProperty("holesLeft")); }
            total++; if (draws != (int)r.GetProperty("rand").GetDouble()) { fail++; Console.WriteLine("DRAWS " + name + " C# " + draws + " web " + r.GetProperty("rand")); }
            spawnsTotal += spawns.Count;
            Console.WriteLine("  scenario '" + name + "': " + spawns.Count + " summons, holes left " + sys.Holes.Count);
        }
        File.WriteAllText(args[0], "{\"scenarios\":" + scenarios + ",\"summons\":" + spawnsTotal + ",\"checks\":" + total + ",\"failures\":" + fail + "}");
        Console.WriteLine("FIELD_RESULT scenarios " + scenarios + " summons " + spawnsTotal + " checks " + total + " failures " + fail);
        return fail == 0 ? 0 : 1;
    }
}
