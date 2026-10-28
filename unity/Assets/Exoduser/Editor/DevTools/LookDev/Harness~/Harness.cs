using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using Exoduser.DevTools.LookDev;

// DT-03 지표 동일성 하네스: Unity 없이 measure_L.py 의 metrics() 와 같은 순서로 C# 코어를 부른다.
// 사용: Harness <sweepDir> <outJson> [stepNameFilter...]    (sweepDir 안의 e* 폴더마다 sandbox.png / after_out / after_in / meta.txt)
static class Harness
{
    static string F(double v) { return v.ToString("R", CultureInfo.InvariantCulture); }

    static Dictionary<string, double[]> ReadMeta(string path)
    {
        var d = new Dictionary<string, double[]>();
        foreach (var line in File.ReadAllLines(path))
        {
            var p = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries); if (p.Length < 3) continue;
            var nums = new List<double>();
            for (int i = 2; i < p.Length; i++) foreach (var q in p[i].Split(',')) nums.Add(double.Parse(q, CultureInfo.InvariantCulture));
            d[p[0] + " " + p[1]] = nums.ToArray();
        }
        return d;
    }

    static string Metrics(string root, string outSet, string inSet, string sandboxPng, Dictionary<string, double[]> meta)
    {
        var sb = LookDevPng.Load(sandboxPng); int w = sb.Width, h = sb.Height;
        var o = new StringBuilder(); o.Append("{");
        o.Append("\"screen_median\":" + F(LookDevMetricsCore.ScreenMedian(sb)));
        var spec = new[] { new[] { .70, .72 }, new[] { .12, .10 }, new[] { .72, .12 } };
        var rg = new List<string>(); var bok = new List<string>(); var lum = new List<string>(); var lumv = new List<double>();
        foreach (var s in spec)
        {
            var pr = LookDevMetricsCore.Patch(sb, "p", LookDevMetricsCore.FracPatch(w, h, s[0], s[1], 120, 90));
            rg.Add(F(Math.Round(pr.RG, 3))); bok.Add(pr.BLeG ? "true" : "false"); lum.Add(F(Math.Round(pr.LumaMedian, 1))); lumv.Add(pr.LumaMedian);
        }
        o.Append(",\"sandbox_floor_RG\":[" + string.Join(",", rg) + "]");
        o.Append(",\"sandbox_floor_B_le_G\":[" + string.Join(",", bok) + "]");
        o.Append(",\"sandbox_floor_luma\":[" + string.Join(",", lum) + "]");
        o.Append(",\"sandbox_floor_luma_median\":" + F(LookDevMetricsCore.Median(lumv)));
        // 웅덩이 밖
        var img = LookDevPng.Load(Path.Combine(root, outSet, "weapon_scale.png")); var m = LookDevPng.Load(Path.Combine(root, outSet, "weapon_scale_mask.png"));
        o.Append(",\"char_floor_luma_median\":" + F(LookDevMetricsCore.CharFloorLumaMedian(img, m)));
        var chest = meta[outSet + " chest"];
        o.Append(",\"armor_RG\":" + F(LookDevMetricsCore.ArmorRG(img, m, chest[0], chest[1])));
        var fi = LookDevPng.Load(Path.Combine(root, outSet, "weapon_front.png")); var fm = LookDevPng.Load(Path.Combine(root, outSet, "weapon_front_mask.png"));
        var blade = meta[outSet + " blade"];
        o.Append(",\"blade_sat_top5\":" + F(LookDevMetricsCore.BladeSatTop5(fi, fm, blade[1], blade[3])));
        // 웅덩이 안
        var imgi = LookDevPng.Load(Path.Combine(root, inSet, "weapon_scale.png")); var mi = LookDevPng.Load(Path.Combine(root, inSet, "weapon_scale_mask.png"));
        double top30, med; double hue = LookDevMetricsCore.PoolFloorHue(imgi, mi, out top30, out med);
        o.Append(",\"pool_floor_hue_deg\":" + F(hue) + ",\"pool_floor_luma_top30\":" + F(top30) + ",\"pool_in_floor_luma_median\":" + F(med));
        o.Append("}"); return o.ToString();
    }

    static int Main(string[] a)
    {
        if (a[0] == "compare")
        {
            LookDevCompare.SideMetrics rm, um;
            var sheet = LookDevCompare.Build(LookDevPng.Load(a[1]), LookDevPng.Load(a[2]), new LookDevCrop(480, 420, 480, 270), new LookDevCrop(950, 250, 480, 270), out rm, out um);
            File.WriteAllBytes(a[3], LookDevPngWriter.Encode(sheet));
            Console.WriteLine("ref median " + rm.Median + " sat5 " + rm.Sat5Percent + " hue30 " + rm.Hue30 + " | unity median " + um.Median + " sat5 " + um.Sat5Percent + " hue30 " + um.Hue30);
            return 0;
        }
        string root = a[0], outJson = a[1]; var filter = new HashSet<string>(); for (int i = 2; i < a.Length; i++) filter.Add(a[i]);
        var dirs = Directory.GetDirectories(root); Array.Sort(dirs, StringComparer.Ordinal);
        var res = new StringBuilder(); res.Append("{"); bool first = true;
        foreach (var d in dirs)
        {
            string name = Path.GetFileName(d); if (!name.StartsWith("e")) continue; if (filter.Count > 0 && !filter.Contains(name)) continue;
            var sw = System.Diagnostics.Stopwatch.StartNew();
            string j = Metrics(d, "after_out", "after_in", Path.Combine(d, "sandbox.png"), ReadMeta(Path.Combine(d, "meta.txt")));
            Console.Error.WriteLine(name + " " + sw.ElapsedMilliseconds + "ms");
            if (!first) res.Append(","); first = false; res.Append("\"" + name + "\":" + j);
        }
        res.Append("}"); File.WriteAllText(outJson, res.ToString()); return 0;
    }
}
