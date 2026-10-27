// Player -> etype0 damage parity: Simulation (Core) against oracle.json (export.cjs runs the ORIGINAL web functions: meleeRef, _skMul, pAtkMul, spawnCrescent,
// updateCrescents, hitArc, hurtE, _poiseHit, mkEn). Level 1-30 x 7 melee weapon types x kiSlash step/charge x crit/no-crit x up to 4 consecutive hits.
// usage: DamageParityTests.dll <receipt.json> <oracle.json>   (exit code 1 when any check fails)
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static readonly Dictionary<string, int[]> perSection = new Dictionary<string, int[]>();
    static readonly List<string> firstFailures = new List<string>();
    static string section = "", where = "";

    static void Check(bool ok, string detail)
    {
        checks++; var c = perSection[section]; c[0]++;
        if (!ok) { bad++; c[1]++; if (c[1] <= 6) firstFailures.Add(section + " [" + where + "]: " + detail); }
    }
    static bool Near(double a, double b) { return Math.Abs(a - b) <= 1e-9 * Math.Max(1, Math.Max(Math.Abs(a), Math.Abs(b))); }
    static void Begin(string name) { section = name; if (!perSection.ContainsKey(name)) perSection[name] = new int[2]; }

    static int Main(string[] args)
    {
        var opt = new JsonSerializerOptions { IncludeFields = true, NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString };
        using var doc = JsonDocument.Parse(File.ReadAllText(args[1]));
        foreach (var name in new[] { "dmgmul", "crit-stats", "mob-spawn", "ki-packet", "ki-hit", "swing-base", "swing-hit" }) perSection[name] = new int[2];
        int scenarioCount = 0;
        foreach (var sc in doc.RootElement.GetProperty("scenarios").EnumerateArray())
        {
            scenarioCount++;
            int level = sc.GetProperty("level").GetInt32(), si = sc.GetProperty("si").GetInt32(), kiLv = sc.GetProperty("kiLv").GetInt32();
            string wtype = sc.GetProperty("wtype").GetString();
            where = (sc.TryGetProperty("starter", out var st0) && st0.GetBoolean() ? "STARTER " : "") + "Lv" + level + " " + wtype + " stage" + (si + 1) + " kiLv" + kiLv + " atk" + sc.GetProperty("atk").GetDouble();
            var web = sc.GetProperty("web");

            // ---- inventory seed exactly as the web item objects ----
            var eqObj = sc.GetProperty("equipment");
            var data = new InventorySeedData { equipped = new InventoryItem[InventoryState.Slots.Length], bag = new InventoryItem[0] };
            for (int i = 0; i < InventoryState.Slots.Length; i++)
                if (eqObj.TryGetProperty(InventoryState.Slots[i], out var itemJson) && itemJson.ValueKind == JsonValueKind.Object)
                    data.equipped[i] = JsonSerializer.Deserialize<InventoryItem>(itemJson.GetRawText(), opt);
            var inventory = new InventoryState(data);

            SimulationConfig NewConfig(string active) => new SimulationConfig { ActiveAttack = active, KiSlashLevel = kiLv, StageIndex = si, DifficultyIndex = 5, EnemyAiEnabled = false, PlayerStartingShield = 0 };
            Simulation NewSim(string active)
            {
                var sim = new Simulation(NewConfig(active), 7);
                sim.Player.Level = level; sim.CrossbowAuto = false;
                sim.ApplyEquipment(inventory);
                sim.Player.Hp = sim.Player.MaxHp; sim.Player.Stamina = sim.Player.MaxStamina; sim.Player.Iframes = 0;
                return sim;
            }

            var ki = NewSim("kiSlash");
            Begin("dmgmul"); Check(Near(ki.Config.DamageMultiplier, web.GetProperty("pAtkMul").GetDouble()), "DamageMultiplier " + ki.Config.DamageMultiplier + " vs web pAtkMul " + web.GetProperty("pAtkMul").GetDouble());
            Begin("crit-stats");
            Check(Near(ki.Config.PlayerCriticalChance, web.GetProperty("critChance").GetDouble()), "crit% " + ki.Config.PlayerCriticalChance + " vs web " + web.GetProperty("critChance").GetDouble());
            Check(Near(ki.Config.PlayerCriticalMultiplier, web.GetProperty("critMult").GetDouble()), "crit x " + ki.Config.PlayerCriticalMultiplier + " vs web " + web.GetProperty("critMult").GetDouble());

            // ---- ordinary etype0 mob of this stage at the player level ----
            Begin("mob-spawn");
            ki.Random01 = () => .5;
            var probe = ki.SpawnNormalEnemy(60, 0);
            var wm = sc.GetProperty("mob");
            Check(probe != null && probe.MaxHp == wm.GetProperty("mhp").GetInt32() && probe.Hp == wm.GetProperty("hp").GetInt32(), "mob hp " + probe?.Hp + "/" + probe?.MaxHp + " vs web " + wm.GetProperty("hp").GetInt32() + "/" + wm.GetProperty("mhp").GetInt32());
            Check(probe != null && Near(probe.MaxShield, wm.GetProperty("eShieldMax").GetDouble()) && Near(probe.Shield, wm.GetProperty("eShield").GetDouble()), "mob shield " + probe?.Shield + "/" + probe?.MaxShield + " vs web " + wm.GetProperty("eShield").GetDouble());
            Check(probe != null && Near(probe.MaxPoise, wm.GetProperty("poise").GetDouble()), "mob poise " + probe?.MaxPoise + " vs web " + wm.GetProperty("poise").GetDouble());
            Check(probe != null && probe.Attack == wm.GetProperty("atk").GetInt32() && probe.Level == wm.GetProperty("lv").GetInt32(), "mob atk/lv " + probe?.Attack + "/" + probe?.Level + " vs web " + wm.GetProperty("atk").GetInt32() + "/" + wm.GetProperty("lv").GetInt32());

            // ---- kiSlash: packet damage + real hit sequence ----
            foreach (var row in web.GetProperty("ki").EnumerateArray())
            {
                bool crit = row.GetProperty("crit").GetBoolean(); int step = row.GetProperty("step").GetInt32(); int charge = row.GetProperty("charge").GetInt32();
                string tag = " step" + step + "/charge" + charge + (crit ? " crit" : "");
                Begin("ki-packet");
                int unityPacket = ki.CalculateKiSlashDamage(step, charge);
                Check(unityPacket == row.GetProperty("packetDmg").GetInt32(), "kiSlash packet" + tag + " " + unityPacket + " vs web " + row.GetProperty("packetDmg").GetInt32());

                var sim = NewSim("kiSlash"); double rnd = crit ? 0 : .5; sim.Random01 = () => rnd;
                var mob = sim.SpawnNormalEnemy(14, 0);
                Begin("ki-hit");
                if (mob == null) { Check(false, "mob not spawned"); continue; }
                int hitNo = 0;
                foreach (var w in row.GetProperty("seq").EnumerateArray())
                {
                    hitNo++;
                    if (hitNo > 1) { sim.Player.X = 0; sim.Player.Y = 0; }
                    int totalBefore = sim.TotalDamage;
                    sim.SpawnKiSlash(step, charge);
                    sim.Tick(0, 0, 100, 0, false, false);
                    int dealt = sim.TotalDamage - totalBefore;
                    bool webAlive = w.GetProperty("alive").GetBoolean();
                    Check(dealt == w.GetProperty("dealt").GetInt32(), "hit" + hitNo + tag + " damage " + dealt + " vs web " + w.GetProperty("dealt").GetInt32());
                    Check(mob.Alive == webAlive, "hit" + hitNo + tag + " alive " + mob.Alive + " vs web " + webAlive);
                    if (webAlive && mob.Alive)
                    {
                        Check(mob.Hp == w.GetProperty("hp").GetInt32() && Near(mob.Shield, w.GetProperty("eShield").GetDouble()), "hit" + hitNo + tag + " hp/shield " + mob.Hp + "/" + mob.Shield + " vs web " + w.GetProperty("hp").GetInt32() + "/" + w.GetProperty("eShield").GetDouble());
                        Check(Near(mob.Poise, w.GetProperty("poise").GetDouble()) && (mob.Stunned > 0) == (w.GetProperty("stunned").GetDouble() > 0), "hit" + hitNo + tag + " poise/stun " + mob.Poise + "/" + mob.Stunned + " vs web " + w.GetProperty("poise").GetDouble() + "/" + w.GetProperty("stunned").GetDouble());
                    }
                    if (!webAlive) break;
                }
            }

            // ---- ordinary weapon swing (LMB, weapon is the active attack) ----
            Begin("swing-base");
            {
                var sim = NewSim("weapon");
                int baseDmg = (int)((sim.Player.BaseAttack + sim.Config.WeaponAttack + sim.Config.WeaponEnhanceAttack + 15) * 6);
                Check(baseDmg == web.GetProperty("swingBase").GetInt32(), "swing base " + baseDmg + " vs web " + web.GetProperty("swingBase").GetInt32());
            }
            foreach (var row in web.GetProperty("swing").EnumerateArray())
            {
                bool crit = row.GetProperty("crit").GetBoolean(); string tag = crit ? " crit" : "";
                var sim = NewSim("weapon"); double rnd = crit ? 0 : .5; sim.Random01 = () => rnd;
                var mob = sim.SpawnNormalEnemy(30, 0);
                Begin("swing-hit");
                if (mob == null) { Check(false, "mob not spawned"); continue; }
                int hitNo = 0;
                foreach (var w in row.GetProperty("seq").EnumerateArray())
                {
                    hitNo++;
                    var p = sim.Player; p.State = "idle"; p.StateTicks = 0; p.Stamina = p.MaxStamina; p.X = 0; p.Y = 0; mob.X = 30; mob.Y = 0;
                    int totalBefore = sim.TotalDamage; bool landed = false;
                    for (int t = 0; t < 40; t++)
                    {
                        sim.Tick(0, 0, 100, 0, t == 0, false);
                        if (sim.TotalDamage != totalBefore) { landed = true; break; }
                    }
                    int dealt = sim.TotalDamage - totalBefore; bool webAlive = w.GetProperty("alive").GetBoolean();
                    Check(landed, "hit" + hitNo + tag + " swing never landed");
                    Check(dealt == w.GetProperty("dealt").GetInt32(), "hit" + hitNo + tag + " swing damage " + dealt + " vs web " + w.GetProperty("dealt").GetInt32());
                    Check(mob.Alive == webAlive, "hit" + hitNo + tag + " swing alive " + mob.Alive + " vs web " + webAlive);
                    if (webAlive && mob.Alive)
                        Check(mob.Hp == w.GetProperty("hp").GetInt32() && Near(mob.Shield, w.GetProperty("eShield").GetDouble()) && (mob.Stunned > 0) == (w.GetProperty("stunned").GetDouble() > 0), "hit" + hitNo + tag + " swing hp/shield/stun " + mob.Hp + "/" + mob.Shield + "/" + mob.Stunned + " vs web " + w.GetProperty("hp").GetInt32() + "/" + w.GetProperty("eShield").GetDouble() + "/" + w.GetProperty("stunned").GetDouble());
                    if (!webAlive) break;
                }
            }
        }

        var sb = new System.Text.StringBuilder();
        sb.Append("{\"schema\":\"exoduser.unity.damage-parity-receipt.v1\",\"scenarios\":" + scenarioCount + ",\"checks\":" + checks + ",\"failed\":" + bad + ",\"sections\":{");
        bool first = true; foreach (var kv in perSection) { if (!first) sb.Append(','); first = false; sb.Append("\"" + kv.Key + "\":{\"checks\":" + kv.Value[0] + ",\"failed\":" + kv.Value[1] + "}"); }
        sb.Append("},\"firstFailures\":[");
        for (int i = 0; i < firstFailures.Count; i++) { if (i > 0) sb.Append(','); sb.Append(JsonSerializer.Serialize(firstFailures[i])); }
        sb.Append("]}");
        File.WriteAllText(args[0], sb.ToString());
        Console.WriteLine(sb.ToString());
        return bad == 0 ? 0 : 1;
    }
}
