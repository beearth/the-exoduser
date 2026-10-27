using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
class PoolProgram
{
    static int Imul(int a, int b) { return unchecked(a * b); }
    static Func<double> Mulberry(int a) { return () => { a = unchecked(a + 0x6D2B79F5); int t = Imul(a ^ (int)((uint)a >> 15), 1 | a); t = unchecked(t + Imul(t ^ (int)((uint)t >> 7), 61 | t)) ^ t; return (double)(uint)(t ^ (int)((uint)t >> 14)) / 4294967296.0; }; }
    static int Main(string[] args)
    {
        var root = JsonDocument.Parse(File.ReadAllText(args[1])).RootElement; int total = 0, fail = 0, n = 0;
        foreach (var c in root.GetProperty("cases").EnumerateArray())
        {
            int si = (int)c.GetProperty("si").GetDouble(); var rnd = Mulberry((int)c.GetProperty("seed").GetDouble()); int draws = 0; Func<double> r = () => { draws++; return rnd(); };
            foreach (var row in c.GetProperty("res").EnumerateArray())
            {
                int b = draws; int et = EnemyPools.RollEtype(si, r); total++;
                if (et != (int)row[0].GetDouble() || draws - b != (int)row[1].GetDouble()) { fail++; if (fail < 20) Console.WriteLine("MISMATCH si " + si + " C# " + et + "/" + (draws - b) + " web " + row[0] + "/" + row[1]); }
            }
            n++;
        }
        foreach (var h in root.GetProperty("holes").EnumerateArray()) { total++; if (EnemyPools.SpawnHoleCount(h[0].GetDouble(), (int)h[1].GetDouble()) != (int)h[2].GetDouble()) { fail++; Console.WriteLine("HOLECOUNT mismatch " + h); } }
        File.WriteAllText(args[0], "{\"cases\":" + n + ",\"checks\":" + total + ",\"failures\":" + fail + "}");
        Console.WriteLine("POOL_RESULT cases " + n + " checks " + total + " failures " + fail);
        return fail == 0 ? 0 : 1;
    }
}
