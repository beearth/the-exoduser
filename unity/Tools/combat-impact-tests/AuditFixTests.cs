using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

// 소스 계약 검사. Unity 화면 품질이나 실제 탄막 가림 판정을 대체하지 않는다.
static class AuditFixTests
{
    public static void Run(Action<bool, string> check, string root)
    {
        string runtime = Path.Combine(root, "unity/Assets/Exoduser/Runtime");
        string bolt = File.ReadAllText(Path.Combine(runtime, "NativeBoltView.cs"));
        string malice = File.ReadAllText(Path.Combine(runtime, "NativeSkillView.Malice.cs"));
        string field = File.ReadAllText(Path.Combine(runtime, "NativeBossView.FieldBullets.cs"));
        foreach (string hex in new[] { "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44", "#ffaa44", "#88ccff", "#cc77ff", "#ffffaa", "#ffccee" })
            check(!bolt.Contains(hex), "audit: bolt excludes ELC " + hex);
        var tip = Regex.Match(bolt, @"Tip\s*=\s*\{([^}]+)\}");
        check(Regex.Matches(tip.Groups[1].Value, "#[0-9a-fA-F]{6}").Cast<Match>().Select(m => m.Value).SequenceEqual(new[] { "#efe6d2", "#ffd9a0", "#e8f3f8", "#cdb2e0", "#fff4d0", "#fff2d6", "#dcc8a4" }), "audit: all seven bolt tips equal palette 2.2");
        check(bolt.Contains("#2a2220") && bolt.Contains("Color.Lerp") && bolt.Contains("1 - u") && !bolt.Contains("Texture2D.whiteTexture"), "audit: gradient shaft tapers instead of white squares");
        check(bolt.Contains("Mathf.Clamp(p.Element, 0, 6)") && bolt.Contains("Mathf.Min(.35f,"), "audit: earth and glow alpha cap");
        check(!malice.Contains("maliceSquare") && !malice.Contains("153 / 255f, 51 / 255f, 204 / 255f"), "audit: no square embers or magenta explosion");
        check(malice.Contains("#e4dcf4") && malice.Contains("#6a56a8") && malice.Contains("MaliceSparkAspect = 4f") && malice.Contains("spark.size * MaliceSparkAspect") && malice.Contains("1 - u"), "audit: tapered arcane embers length/thickness >=3");
        check(Regex.IsMatch(malice, @"MaliceArcaneTicks\s*=\s*36\b") && Regex.IsMatch(malice, @"MaliceSmokeTicks\s*=\s*48\b") && malice.Contains("age * frames.Length / life") && malice.Contains("age < life"), "audit: arcane <=36 ticks and smoke <=48 ticks with frame zero");
        check(malice.Contains("MaliceCoreTicks = 5") && malice.Contains("#f6f2fc") && malice.Contains("age < 2 ? 1f") && malice.Contains("age < MaliceCoreTicks"), "audit: local arcane core peaks first two ticks and ends at five");
        check(malice.Contains("age >= 12 ? .18f") && malice.Contains("Mathf.Min(12f, spark.life)") && malice.Contains("age >= 12 ? -12000 + layer"), "audit: residuals sort below bullets by 0.2 seconds");
        check(field.Contains("new Color(223 / 255f, 227 / 255f, 230 / 255f, .8f)") && field.Contains("Put(ring,"), "audit: friendly silver rim dfe3e6 alpha .8");
        check(field.IndexOf("if (p.Friendly)", StringComparison.Ordinal) < field.IndexOf("if (p.Web)", StringComparison.Ordinal) && field.Contains("FieldComet(p, friendlyLength, p.El"), "audit: friendly branch precedes hostile kinds and retains element");
        check(field.Contains("p.BlackBean || p.BlueBean || p.BwBean || p.GbBean") && field.Contains("FieldOrb(p, 20 * ps * 2.2, ElemOrbRow[3]"), "audit: rainbow and Q beans use dark orb row");
        check(!field.Contains("rainbow ? 0") && !field.Contains("p.GbBean ? 3"), "audit: bean physical/dark comet substitutions removed");
    }
}
