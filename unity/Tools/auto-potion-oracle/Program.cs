using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// Compares the native AutoPotion (Runtime/Core/AutoPotion.cs) with oracle.json, which export.cjs produced by running the ORIGINAL
// game.html functions / blocks in a Node VM. Standalone .NET check, not a Unity runtime or whole-game verdict.
class AutoPotionProgram
{
    static readonly List<object> rows = new List<object>();
    static int failures, total;
    static void Check(bool pass, string name)
    {
        total++;
        if (pass) { if (total % 400 == 1) rows.Add(new { name, passed = true }); }
        else { failures++; if (failures <= 60) rows.Add(new { name, passed = false }); }
    }
    static double D(JsonElement e, string k) => e.GetProperty(k).GetDouble();
    static int I(JsonElement e, string k) => e.GetProperty(k).GetInt32();
    static bool B(JsonElement e, string k) => e.GetProperty(k).GetBoolean();
    // The web floating text carries emoji and the project forbids emoji as game UI: compare the text without them.
    static string Strip(string s)
    {
        var sb = new StringBuilder();
        foreach (var ch in s) { if (char.IsSurrogate(ch) || ch == '️' || ch == '‍') continue; sb.Append(ch); }
        return sb.ToString().TrimStart();
    }
    static AutoPotionInput InputOf(JsonElement c, double hp, int mats) => new AutoPotionInput
    {
        Hp = hp, MaxHp = D(c, "mhp"), Materials = mats, ParryLessonActive = B(c, "parry"), PotionPower = D(c, "power"),
        GlovePotCd = D(c, "glove"), BeltPotCd = D(c, "belt"), RegenLevel = D(c, "regen"), LegendBeltBuff = B(c, "legend")
    };
    static bool SameState(JsonElement o, AutoPotionState s, AutoPotionResult r, JsonElement c, AutoPotionFeedback[] fb)
    {
        if (D(o, "hp") != r.Hp || I(o, "mats") != r.Materials || D(o, "cd") != s.Cooldown || D(o, "beltT") != s.BeltBuffTicks || I(o, "potions") != s.PotionsUsed || I(o, "hC") != s.PotionsUsed) return false;
        if (I(o, "sfx") != (r.Used ? 1 : 0)) return false;
        var texts = o.GetProperty("texts");
        if (texts.GetArrayLength() != fb.Length) return false;
        for (int i = 0; i < fb.Length; i++)
        {
            var t = texts[i];
            if (D(t, 0) != 100 || t[1].GetDouble() != fb[i].DY || Strip(t[2].GetString()) != fb[i].Text || t[3].GetString() != fb[i].Color || t[4].GetInt32() != fb[i].Ttl) return false;
        }
        return true;
    }
    static double D(JsonElement e, int i) => e[i].GetDouble();
    static string Describe(JsonElement c) => c.GetRawText();

    static bool SameDrop(JsonElement o, DropResult r, int draws, string kind)
    {
        if (I(o, "mats") != r.Malice) return false;
        if (o.TryGetProperty("draws", out var d) && (d.GetInt32() != r.Draws || d.GetInt32() != draws)) return false;
        var texts = o.GetProperty("texts");
        if (texts.GetArrayLength() != r.Texts.Length) return false;
        for (int i = 0; i < r.Texts.Length; i++)
        {
            var t = texts[i];double x = t[0].GetDouble(), y = t[1].GetDouble();var want = r.Texts[i];
            bool player = x == 1000;
            if ((want.Anchor == DropAnchor.Player) != player) return false;
            double dx = player ? x - 1000 : x - 30, dy = player ? y - 2000 : y - 40;
            if (dx != want.DX || dy != want.DY || t[2].GetString() != want.Text || t[3].GetString() != want.Color || t[4].GetInt32() != want.Ttl) return false;
        }
        return true;
    }
    static Func<double> Sequence(JsonElement seq, int[] used)
    {
        var values = new List<double>();foreach (var v in seq.EnumerateArray()) values.Add(v.GetDouble());
        return () => { if (used[0] >= values.Count) throw new InvalidOperationException("random sequence exhausted (more draws than the original)"); return values[used[0]++]; };
    }

    static int Main(string[] args)
    {
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        var root = doc.RootElement;
        // 1. auto block grid
        int autoCases = 0, autoUsed = 0;
        foreach (var item in root.GetProperty("auto").EnumerateArray())
        {
            var c = item.GetProperty("in");var o = item.GetProperty("out");autoCases++;
            var s = new AutoPotionState { PotLv = I(c, "potLv"), Cooldown = D(c, "cd") };
            var r = AutoPotion.Tick(s, InputOf(c, D(c, "hp"), I(c, "mats")), D(c, "sp"));if (r.Used) autoUsed++;
            Check(SameState(o, s, r, c, r.Feedback), "auto " + Describe(c));
        }
        Check(autoCases > 1500 && autoUsed > 300, "auto grid size (" + autoCases + " cases, " + autoUsed + " potions drunk)");
        // 2. multi frame cycles (state carried across frames, damage between frames)
        int frames = 0;
        foreach (var seq in root.GetProperty("sequences").EnumerateArray())
        {
            var c = seq.GetProperty("in");var s = new AutoPotionState { PotLv = I(c, "potLv"), Cooldown = D(c, "cd") };double hp = D(c, "hp");int mats = I(c, "mats");bool ok = true;int step = 0;
            foreach (var tick in seq.GetProperty("ticks").EnumerateArray())
            {
                hp = Math.Max(0, hp - D(tick, "damage"));var r = AutoPotion.Tick(s, InputOf(c, hp, mats), D(c, "sp"));hp = r.Hp;mats = r.Materials;frames++;step++;
                if (!SameState(tick.GetProperty("out"), s, r, c, r.Feedback)) { ok = false; Check(false, "sequence " + seq.GetProperty("name").GetString() + " potLv " + I(c, "potLv") + " frame " + step); break; }
            }
            if (ok) Check(true, "sequence " + seq.GetProperty("name").GetString() + " potLv " + I(c, "potLv") + " legend " + B(c, "legend") + " (240 frames)");
        }
        // 3. kill drops
        foreach (var item in root.GetProperty("kill").EnumerateArray())
        {
            var used = new int[1];var r = AutoPotion.KillDrop(B(item, "ib"), Sequence(item.GetProperty("seq"), used));
            Check(SameDrop(item.GetProperty("out"), r, used[0], "kill"), "kill " + item.GetRawText());
        }
        foreach (var item in root.GetProperty("chest").EnumerateArray())
            Check(SameDrop(item.GetProperty("out"), AutoPotion.ChestDrop(I(item, "stage")), 0, "chest"), "chest stage " + I(item, "stage"));
        foreach (var item in root.GetProperty("medium").EnumerateArray())
        {
            var used = new int[1];var seq = JsonDocument.Parse("[" + D(item, "r").ToString("R", System.Globalization.CultureInfo.InvariantCulture) + "]").RootElement;
            var r = AutoPotion.MediumChestDrop(I(item, "tier"), Sequence(seq, used));
            Check(SameDrop(item.GetProperty("out"), r, used[0], "medium"), "medium " + item.GetRawText());
        }
        Check(SameDrop(root.GetProperty("breakable").GetProperty("out"), AutoPotion.BreakablePotionDrop(), 0, "breakable"), "breakable potion drop");
        // 4. forge potion tab
        foreach (var item in root.GetProperty("forgeCards").EnumerateArray())
        {
            int lv = I(item, "lv"), plv = I(item, "playerLevel");var o = item.GetProperty("out");AutoPotion.ForgeHeal(lv, out int cur, out int nxt);
            bool ok = I(o, "cost") == AutoPotion.ForgeCost(lv) && I(o, "reqLv") == AutoPotion.ForgeLevelGate(lv) && B(o, "maxed") == AutoPotion.ForgeMaxed(lv) && B(o, "lvOk") == (plv >= AutoPotion.ForgeLevelGate(lv))
                && I(o, "cur") == cur && I(o, "nxt") == nxt && B(o, "canSelect") == AutoPotion.ForgeCanSelect(lv, plv);
            Check(ok, "forge card lv " + lv + " player level " + plv);
        }
        foreach (var item in root.GetProperty("forgeCrafts").EnumerateArray())
        {
            var s = new AutoPotionState { PotLv = I(item, "potLv") };int mats = I(item, "materials");AutoPotion.ForgeEnhance(s, ref mats, I(item, "cost"), B(item, "repeat"));var o = item.GetProperty("out");
            Check(I(o, "potLv") == s.PotLv && I(o, "materials") == mats, "forge craft " + item.GetRawText());
        }
        // 5. pieces the oracle does not run as a block: potHeal / _malCost themselves
        for (int lv = 0; lv <= 12; lv++) AutoPotion.ForgeHeal(lv, out _, out _);
        Check(AutoPotion.PotHeal(0) == 100 && AutoPotion.PotHeal(1) == 150 && AutoPotion.PotHeal(2) == 200 && AutoPotion.PotHeal(10) == 1000, "potHeal 0/1/2/10 anchors (also covered through every grid case)");
        var result = JsonSerializer.Serialize(new
        {
            scope = "standalone_dotnet_original_function_oracle_not_Unity_runtime", passed = failures == 0, failures, total,
            source = new { sha256 = root.GetProperty("source").GetProperty("sha256").GetString(), lines = root.GetProperty("source").GetProperty("lines").GetInt32() },
            groups = new { auto = autoCases, autoPotionsDrunk = autoUsed, sequenceFrames = frames, kill = root.GetProperty("kill").GetArrayLength(), chest = root.GetProperty("chest").GetArrayLength(), medium = root.GetProperty("medium").GetArrayLength(), forgeCards = root.GetProperty("forgeCards").GetArrayLength(), forgeCrafts = root.GetProperty("forgeCrafts").GetArrayLength() },
            note = "every group compares native results with the original source block executed in Node; failing cases are listed (first 60), passing ones are sampled",
            checks = rows
        }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        File.WriteAllText(args[0], result);
        Console.WriteLine("AUTO_POTION_RESULT " + total + " checks / " + failures + " failures");
        return failures == 0 ? 0 : 2;
    }
}
