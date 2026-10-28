using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;

// O-1 wire checks on the real Simulation (standalone .NET, no Unity): a kill goes through EnemyHurt.DeathHead + DeathTail (Simulation.Death.cs) and the
// Simulation state the web keeps in G / P comes back in the web order. The numbers of the Core itself are the enemy-hurt-oracle's job (H3 / H4 / CH4);
// this file checks the copy in / copy out and the Unity owners (malice, potions, combo, regions, gate guard, revive bookkeeping, split enemies, loot, autosave).
// Expected values follow the web formulas (game.html origin/main 5286c0464 hurtE 42701-43322) and the Unity smokes they replace (NativeGame.ReviveSmoke B/C,
// NativeAutoPotionSmoke kill drop).  usage: KillWireTests.dll [receipt.json]
class Program
{
    static readonly List<object> Rows = new List<object>(); static int failed;
    static void Check(bool ok, string name) { Rows.Add(new { name, passed = ok }); if (!ok) { failed++; Console.WriteLine("FAIL " + name); } }
    static readonly Queue<double> forced = new Queue<double>(); static double fallback = .99;
    static Simulation Make()
    {
        var s = new Simulation(new SimulationConfig { EnemyAiEnabled = false, DifficultyIndex = 5, StageIndex = 0 });
        forced.Clear(); fallback = .99; s.Random01 = () => forced.Count > 0 ? forced.Dequeue() : fallback;
        return s;
    }
    static EnemyState Spawn(Simulation s, float dx, float dy, int etype = 0)
    {
        for (int k = 0; k < 8; k++) { var e = s.SpawnEnemy(s.Player.X + dx + k * 9, s.Player.Y + dy, etype); if (e != null) return e; }
        return null;
    }
    static int Main(string[] args)
    {
        // ---- 1. ordinary kill, all draws 0 (NativeAutoPotionSmoke "roll 0 (hp)"): revive reserved, kill counted, +4 base +1 hp potion, combo +60 ----
        var s = Make(); fallback = 0;
        DropResult drop = default; bool dropped = false; s.KillDropped += (en, d) => { drop = d; dropped = true; };
        var e = Spawn(s, 120, 0); e.Shield = 0; e.Hp = 1; e.Elite = 0; int mats0 = s.Materials, exp0 = s.Player.Experience, lv0 = s.Player.Level;   // draws 0 also roll an elite in mkEn: undo it
        s.HurtEnemy(e, 50);
        Check(!e.Alive && s.Kills == 1, "kill counted (kills " + s.Kills + ")");
        Check(e.Revived && e.ReviveTimer == 90 && e.ReviveAsGhoul, "revive roll 0 reserves a revive 90 f as a ghoul (web: random<finalRev, then _reviveAsGhoul=random<.5 with draw 0)");
        Check(s.Materials - mats0 == 5 && dropped && drop.Malice == 1 && drop.Texts != null && drop.Texts.Length == 2, "malice +4 base +1 hp potion, KillDropped malice 1 / 2 texts (gained " + (s.Materials - mats0) + ")");
        Check(s.Combo == 1 && s.ComboTicks == 60 && s.ComboMax == 1, "combo 1, timer +60, comboMax 1");
        int expGain = Math.Max(5, (int)(e.Level * .4)) / 3;   // addExp: v=~~(v/3) for a non-transcend kill
        Check(s.Player.Level > lv0 || s.Player.Experience - exp0 == expGain, "exp ~~(max(5, ~~(lv*.4))/3) = " + expGain + " (got " + (s.Player.Experience - exp0) + ")");
        // ---- 2. potion type mp is discarded (all draws .99) ----
        s = Make(); dropped = false; s.KillDropped += (en, d) => { drop = d; dropped = true; };
        e = Spawn(s, 120, 0); e.Shield = 0; e.Hp = 1; mats0 = s.Materials; s.HurtEnemy(e, 50);
        Check(s.Materials - mats0 == 4 && dropped && drop.Malice == 0 && drop.Texts.Length == 0, "roll .99 -> mp potion discarded, only +4 (gained " + (s.Materials - mats0) + ")");
        Check(!e.Revived && e.ReviveTimer == 0, "revive roll .99 fails");
        // ---- 3. combo over three kills ----
        for (int i = 0; i < 2; i++) { var x = Spawn(s, 120, 40 + i * 40); x.Shield = 0; x.Hp = 1; s.HurtEnemy(x, 50); }
        Check(s.Kills == 3 && s.Combo == 3 && s.ComboTicks == 180, "three kills: combo 3, timer 180 (" + s.ComboTicks + ")");
        // ---- 4. elite (rare tier) kill: malice drop ~~((12+0)*12*(1+1.5)) + 4 + extra ~~((2+1)*10*1*2) at draws .99 ----
        s = Make(); e = Spawn(s, 120, 0); e.Shield = 0; e.Hp = 1; e.Elite = 2; mats0 = s.Materials; s.HurtEnemy(e, 50);
        Check(s.Materials - mats0 == 360 + 4 + 60, "elite 2 malice 360 + 4 + 60 (gained " + (s.Materials - mats0) + ")");
        // ---- 5. gate guard ----
        s = Make(); e = Spawn(s, 120, 0); e.Shield = 0; e.Hp = 1; e.IsGateGuard = true; s.HurtEnemy(e, 50);
        Check(s.Stage.GateGuardKilled && s.Stage.GateGuard == null, "gate guard death -> StageFlow guard killed (+10 % progress)");
        // ---- 6. 1-1 boss immediate revive (NativeGame.ReviveSmoke C): .99 crit, 0 revive, .5 tp; points 200 - (10 + 2 full HP) ----
        s = Make(); var texts = new List<string>(); s.ReviveTextRaised += t => texts.Add(t.Ko); bool revivedEvent = false; s.BossRevived += (b, p) => revivedEvent = true;
        var lines = new List<string>(); s.BossLineRaised += k => lines.Add(k);
        var boss = Spawn(s, 160, 0); boss.IsBoss = true; boss.Radius = 60; boss.Shield = 0; boss.MaxShield = 0; boss.Hp = 1; boss.MaxRevPts = 200; boss.RevPts = 200; boss.MaxPoise = 400; boss.BossPatCd = 100; boss.Attack = 120;
        s.Player.Iframes = 0; forced.Enqueue(.99); forced.Enqueue(0); forced.Enqueue(.5); int kills0 = s.Kills; s.HurtEnemy(boss, 50);
        Check(boss.Alive && revivedEvent && boss.Deaths == 1 && boss.Hp == boss.MaxHp && boss.RevPts == 188 && boss.ReviveIframes == 90, "boss immediate revive: alive " + boss.Alive + " deaths " + boss.Deaths + " pts " + boss.RevPts + " iframes " + boss.ReviveIframes);
        Check(boss.MaxPoise == 600 && boss.Attack == 180 && boss.BossRevJudged && s.Kills == kills0, "revive: maxPoise x1.5, atk x1.5, judged, no kill counted");
        Check(boss.Radius < 60 || boss.OrigR == 60, "revive shrink keeps _origR 60 (r " + boss.Radius + ")");
        // the judged boss dies for good: STY-D9 sink, no death texts, sink line, _druidFled
        boss.ReviveIframes = 0; boss.RevPts = 0; boss.Hp = 1; boss.Shield = 0; int t0 = texts.Count; s.Player.Iframes = 0; forced.Enqueue(.99); s.HurtEnemy(boss, 50);
        var late = texts.GetRange(t0, texts.Count - t0);
        Check(!boss.Alive && boss.ReviveTimer == 0 && boss.SinkDruid && !late.Exists(t => t.Contains("부활 실패") || t.Contains("고갈") || t.Contains("완전 사망")), "judged boss sinks without death texts: " + string.Join("|", late.ToArray()));
        Check(lines.Contains("sink0") && s.DruidFled && s.Kills == kills0 + 1, "sink: _bossLine('sink0'), G._druidFled, kill counted");
        Check(s.ComboTicks >= 1800, "boss kill combo timer +1800 (" + s.ComboTicks + ")");
        // a boss that never revived: points gone -> 3 s fallback countdown (chance 0, roll 1), sink flag
        var boss2 = Spawn(s, 160, 80); boss2.IsBoss = true; boss2.Radius = 60; boss2.Shield = 0; boss2.MaxShield = 0; boss2.Hp = 1; boss2.MaxRevPts = 200; boss2.RevPts = 0; s.Player.Iframes = 0; forced.Enqueue(.99); s.HurtEnemy(boss2, 50);
        Check(!boss2.Alive && boss2.BossRevJudged && boss2.ReviveTimer == 180 && boss2.BossRevChance == 0 && boss2.BossRevRoll == 1 && boss2.SinkDruid, "fallback reserved: timer " + boss2.ReviveTimer + " chance " + boss2.BossRevChance + " roll " + boss2.BossRevRoll);
        for (int i = 0; i < 181; i++) s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
        Check(!boss2.Alive && boss2.ReviveTimer == 0, "fallback resolves after 180 f without a revive");
        // ---- 7. split (etype 15): two smaller enemies join the Simulation ----
        s = Make(); e = Spawn(s, 140, 0, 15); Check(e != null, "etype 15 spawned");
        if (e != null)
        {
            e.Shield = 0; e.Hp = 1; int before = s.Enemies.Count; int baseHp = e.MaxHp; s.HurtEnemy(e, 50);
            var kids = s.Enemies.FindAll(x => x != e && x.Alive && x.Etype == 15);
            Check(s.Enemies.Count == before + 2 && kids.Count == 2, "split adds 2 enemies (count " + s.Enemies.Count + ")");
            Check(kids.TrueForAll(k => k.Web != null && k.Web._splitDone && k.Hp == k.MaxHp && k.Hp < baseHp), "split children: _splitDone, hp ~~(hp*.35)");
        }
        // ---- 8. harness kill (no revive), autosave every 10th kill ----
        s = Make(); fallback = 0; int saves = 0; s.AutosaveRequested += () => saves++;
        for (int i = 0; i < 10; i++) { var x = Spawn(s, 100 + (i % 5) * 30, -60 + (i / 5) * 60); if (x == null) continue; s.HarnessKill(x); }
        Check(s.Kills == 10 && saves == 1, "harness kills 10 -> one dbSaveNow (kills " + s.Kills + " saves " + saves + ")");
        Check(!s.Enemies.Exists(x => x.ReviveTimer > 0), "harness kill never reserves a revive");
        // ---- 9. rare 91 treasure demon: +50 malice and a heroic+ item on the ground ----
        s = Make(); e = Spawn(s, 140, 0, 91); Check(e != null, "etype 91 spawned");
        if (e != null) { e.Shield = 0; e.Hp = 1; mats0 = s.Materials; int loot0 = s.Loot.Count; s.HurtEnemy(e, 50);
            Check(s.Loot.Count > loot0 && s.Loot.Exists(l => l.Item != null && l.Rarity >= 3), "treasure demon drops a rarity >= 3 item (loot " + s.Loot.Count + ")");
            Check(s.Materials - mats0 >= 54, "treasure demon malice 50 + 4 (+ potion) (gained " + (s.Materials - mats0) + ")"); }
        // ---- 10. kill-chain rift: the 5th kill within 180 f pushes a rift (the rift spawn of update() is not ported) ----
        s = Make(); for (int i = 0; i < 5; i++) { var x = Spawn(s, 100 + i * 30, 0); if (x == null) continue; x.Shield = 0; x.Hp = 1; s.HurtEnemy(x, 50); }
        Check(s.Rifts.Count == 1 && s.KillChainCount == 0 && s.KillChainTicks == 180, "5 kills in a row -> one rift, chain reset (rifts " + s.Rifts.Count + ")");
        for (int i = 0; i < 181; i++) s.Tick(0, 0, s.Player.X + 100, s.Player.Y, false, false);
        Check(s.KillChainTicks == 0, "kill-chain timer runs out after 180 f");

        var result = JsonSerializer.Serialize(new { scope = "standalone_dotnet_simulation_wire_not_Unity_runtime", passed = failed == 0, failed, checks = Rows }, new JsonSerializerOptions { WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping });
        if (args.Length > 0) File.WriteAllText(args[0], result);
        Console.WriteLine("KILL_WIRE " + Rows.Count + " checks / " + failed + " failures");
        return failed == 0 ? 0 : 2;
    }
}
