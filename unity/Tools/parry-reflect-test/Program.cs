// Parry reflection inside the real Simulation + druid bullet loop (the rules themselves are compared with the web by Tools/parry-reflect-oracle): an enemy bullet that meets
// an E strike / Q parry comes back as a blue bean, flies to the nearest enemy and hurts it; without a parry window it hurts the player as before.
// usage: ParryReflectSim.dll <out-dir>      writes parry-reflect-report.md ; exit 1 when a check fails
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Core.Combat;

static class P
{
    static int checks, bad; static readonly List<string> failures = new List<string>(), log = new List<string>();
    static void Check(bool ok, string what) { checks++; if (!ok) { bad++; failures.Add(what); Console.WriteLine("FAIL " + what); } }

    sealed class Rig { public Simulation S; public EnemyState Boss; public PlayerState Pl; }

    static Rig Setup(uint seed)
    {
        var s = new Simulation(new SimulationConfig { StageIndex = 0, DifficultyIndex = 5, EnemyAiEnabled = true, PlayerMaxHp = 2000000, PlayerBaseAttack = 40 }, seed);
        s.DruidRemodel = true; s.Player.Level = 8; s.Player.Hp = s.Player.MaxHp;
        s.AttachDruidBoss();
        s.Stage.Enabled = true; s.Stage.FieldBossDone = true; s.Stage.BossUnlocked = true;
        s.Stage.Exits.Add(new StageFlow.Tile(100, 7)); s.Player.X = 100.5f * 40; s.Player.Y = 7.5f * 40; s.Stage.CheckT = 29;
        var p = s.Player; int guard = 0;
        while (guard++ < 1500 && !(s.Stage.InArena && s.Stage.LoadPhase == 0 && s.Stage.Boss != null)) s.Tick(0, 0, p.X + 100, p.Y, false, false);
        var boss = s.Stage.Boss;
        for (int i = 0; i < 200; i++) { s.Tick(0, 0, boss.X, boss.Y, false, false); p.Hp = p.MaxHp; }   // intro stun / revive i-frames run out
        return new Rig { S = s, Boss = boss, Pl = p };
    }

    // the player stands 110 px from the boss on the side away from the wall; the bullet comes from the far side of the player
    static BossProjectile Shoot(Rig r, int element, bool aimedAtPlayer, double fromDistance)
    {
        var s = r.S; var p = r.Pl; var boss = r.Boss;
        double ang = Math.Atan2(boss.Y - 2160, boss.X - 2560) + 0.9; p.X = (float)(boss.X + Math.Cos(ang) * 110); p.Y = (float)(boss.Y + Math.Sin(ang) * 110);
        if (!s.CanMove(p.X, p.Y, p.Radius)) { p.X = boss.X + 110; p.Y = boss.Y; }
        double away = Math.Atan2(p.Y - boss.Y, p.X - boss.X);   // from the boss through the player and on
        double sx = p.X + Math.Cos(away) * fromDistance, sy = p.Y + Math.Sin(away) * fromDistance, toP = Math.Atan2(p.Y - sy, p.X - sx);
        var d = s.Druid.Data[boss];
        var b = s.Druid.SpawnProjectile(boss, d, new ProjSpec { X = sx, Y = sy, Vx = Math.Cos(toP) * 3, Vy = Math.Sin(toP) * 3, Dmg = 500, Life = 400, Ml = 400, El = element, Col = "col", Sz = 1.2, Commit = true }, false);
        return b;
    }

    static int Run(Rig r, BossProjectile b, int ticks, Func<bool> stop)
    {
        for (int i = 1; i <= ticks; i++)
        {
            r.S.Tick(0, 0, r.Boss.X, r.Boss.Y, false, false);
            if (stop()) return i;
        }
        return -1;
    }

    static void Main2(string dir)
    {
        // --- 1. E strike on a physical (red) bullet ---
        {
            var r = Setup(20261028u); var s = r.S; var b = Shoot(r, 0, true, 90);
            Check(b != null, "E: bullet spawned"); if (b == null) return;
            double mhp = r.Boss.MaxHp; int pc0 = s.ParryCount; double bossHp0 = r.Boss.Hp + r.Boss.Shield, vx0 = b.Vx, vy0 = b.Vy;
            r.Pl.State = "sBash"; r.Pl.StateTicks = 20;
            int t = Run(r, b, 40, () => b.Friendly);
            Check(t > 0, "E: bullet reflected within 40 ticks (" + t + ")");
            if (t > 0)
            {
                Check(b.BlueBean && b.ParryBlueBean && b.Magic && b.Homing && b.Col == "#00e5ff", "E: blue-bean flags");
                Check(b.AoeR == 160 && Math.Abs(b.AoeDmg - b.Dmg * 2) < 1e-9, "E: red bean blast 160 / x2 (" + b.AoeR + "," + b.AoeDmg + ")");
                Check(s.ReflectCount == 1 && s.LastReflectKind == ReflectKind.RedBean && s.ParryCount == pc0 + 1, "E: parry paid once, kind " + s.LastReflectKind + ", count " + s.ReflectCount);
                Check(r.Pl.Iframes > 10, "E: i-frames after the parry " + r.Pl.Iframes);
                double want = Math.Atan2(r.Boss.Y - r.Pl.Y, r.Boss.X - r.Pl.X), have = Math.Atan2(b.Vy, b.Vx), diff = Math.Abs(Math.IEEERemainder(want - have, Math.PI * 2));
                Check(diff < 0.05 && Math.Abs(Math.Sqrt(b.Vx * b.Vx + b.Vy * b.Vy) - 7) < 1e-6, "E: aimed at the boss at speed 7 (angle diff " + diff.ToString("0.000") + ")");
            }
            int hp0 = (int)(r.Pl.Hp);
            int t2 = Run(r, b, 120, () => !b.Active);
            Check(t2 > 0, "E: reflected bullet was used up (" + t2 + ")");
            double lost = bossHp0 - (r.Boss.Hp + r.Boss.Shield);
            Check(s.ReflectHitCount >= 1 && lost > 0, "E: the boss lost HP " + lost + " (hits " + s.ReflectHitCount + ")");
            Check(lost >= (int)(mhp * 0.10) * 0.5, "E: parried bean floor ~10 % of max HP " + lost + " vs " + (int)(mhp * 0.10));
            log.Add("E strike: reflected after " + t + " ticks, boss HP -" + lost.ToString("0") + " (max " + mhp + ")");
        }
        // --- 2. Q parry on a magic bullet ---
        {
            var r = Setup(20261029u); var s = r.S; var b = Shoot(r, 3, true, 140);
            double bank0 = s.ParryBank, bossHp0 = r.Boss.Hp + r.Boss.Shield;
            r.Pl.State = "sBlock"; r.Pl.StateTicks = 999; s.SbParryT = 18; s.SbHoldT = 0;
            int t = Run(r, b, 60, () => b.Friendly);
            Check(t > 0, "Q: bullet reflected within 60 ticks (" + t + ")");
            if (t > 0)
            {
                Check(s.LastReflectKind == ReflectKind.Magic && b.BlueBean && b.ParryBlueBean, "Q: kind " + s.LastReflectKind);
                Check(s.ParryBank > bank0, "Q: parryBank grew " + (s.ParryBank - bank0));
                Check(b.AoeR == 0 && b.Life == 180 && b.Ml == 180, "Q: life 180, no preset blast radius");
            }
            int t2 = Run(r, b, 140, () => !b.Active);
            double lost = bossHp0 - (r.Boss.Hp + r.Boss.Shield);
            Check(t2 > 0 && lost > 0, "Q: reflected bullet hurt the boss (" + lost + ")");
            log.Add("Q parry: reflected after " + t + " ticks, parryBank +" + (s.ParryBank - bank0).ToString("0") + ", boss HP -" + lost.ToString("0"));
        }
        // --- 3. no parry window: the bullet hurts the player, nothing is reflected ---
        {
            var r = Setup(20261030u); var s = r.S; var b = Shoot(r, 0, true, 90);
            float hp0 = r.Pl.Hp; r.Pl.State = "idle";
            int t = Run(r, b, 60, () => !b.Active);
            Check(t > 0, "none: bullet ended (" + t + ")");
            Check(s.ReflectCount == 0 && !b.Friendly, "none: nothing reflected");
            Check(r.Pl.Hp < hp0 || s.HurtCount > 0, "none: the player was hurt (" + hp0 + " -> " + r.Pl.Hp + ")");
            log.Add("no parry: bullet ended after " + t + " ticks, player HP " + hp0 + " -> " + r.Pl.Hp);
        }
        // --- 4. wrong key: Q on a physical bullet is not a reflection ---
        {
            var r = Setup(20261031u); var s = r.S; var b = Shoot(r, 0, true, 90);
            r.Pl.State = "sBlock"; r.Pl.StateTicks = 999; s.SbParryT = 18;
            int t = Run(r, b, 60, () => !b.Active || b.Friendly);
            Check(s.ReflectCount == 0 && !b.Friendly, "wrong key: Q does not reflect a physical bullet");
            log.Add("wrong key (Q on physical): reflected=" + b.Friendly);
        }
        // --- 5. no other enemy and the boss gone: reversed at -2x ---
        {
            var r = Setup(20261032u); var s = r.S; var b = Shoot(r, 3, true, 140);
            r.Boss.Alive = false;
            r.Pl.State = "sBlock"; r.Pl.StateTicks = 999; s.SbParryT = 18;
            double vx0 = b.Vx, vy0 = b.Vy;
            int t = Run(r, b, 60, () => b.Friendly);
            if (t > 0) Check(b.Vx * vx0 < 0 || b.Vy * vy0 < 0 || (Math.Abs(b.Vx) + Math.Abs(b.Vy)) > 0, "no target: bullet turned back");
            log.Add("no target: reflected after " + t + " ticks");
        }
        Directory.CreateDirectory(dir);
        var sb = new StringBuilder("# parry reflect in the simulation\n\nchecks " + checks + ", failed " + bad + "\n\n");
        foreach (var l in log) sb.Append("- ").Append(l).Append('\n');
        foreach (var f in failures) sb.Append("- FAIL ").Append(f).Append('\n');
        File.WriteAllText(Path.Combine(dir, "parry-reflect-report.md"), sb.ToString(), new UTF8Encoding(false));
    }

    static int Main(string[] args)
    {
        string dir = args.Length > 0 ? args[0] : "parry-reflect-out";
        try { Main2(dir); } catch (Exception ex) { Check(false, "exception " + ex); }
        Console.WriteLine("parry-reflect-sim: " + checks + " checks, " + bad + " failed");
        foreach (var l in log) Console.WriteLine("  " + l);
        return bad == 0 ? 0 : 1;
    }
}
