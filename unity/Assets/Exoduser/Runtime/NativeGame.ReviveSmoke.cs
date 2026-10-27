using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-revive-smoke -output <dir>`: the real NativeGame/Simulation runs the B08 rules at 1x and captures them. Energy shield (absorb, overflow, HP untouched while it holds),
    // the ordinary-mob revive (own body + ghoul), the 1-1 boss death (immediate revive, final death without the sink texts), the player energy shield and the fallen countdown (revive / dead).
    public sealed partial class NativeGame
    {
        bool reviveSmoke;
        [Serializable] sealed class ReviveSmokeReceipt
        {
            public bool passed; public string scope, failures;
            public int shieldBefore, shieldAfterFirstHit, hpAfterFirstHit, hpAfterOverflow, shieldAfterOverflow;
            public int bodyRevivedHp, bodyRevivedMaxHp, ghoulEtype, ghoulHp, ghoulMaxHp, ghoulShield; public bool bodyAlive, ghoulBorn, ghoulIsGhoul;
            public double bossDeaths, bossRevPts, bossHpAfter; public bool bossRevived, bossFinalSink, bossFinalTextsHidden;
            public float playerShieldBefore, playerShieldAfterHit, playerHpAfterShieldHit; public bool playerFell, playerRevived, playerSecondFallDead;
            public double fallenChance; public int textsSeen;
        }

        IEnumerator ReviveSmokeRun()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            var sim = Simulation; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear();
            var rec = new ReviveSmokeReceipt { scope = "actual_native_energy_shield_and_revive_rules" };
            var fails = new List<string>(); Action<bool, string> check = (ok, what) => { if (!ok) fails.Add(what); };
            var p = sim.Player; var forced = new Queue<double>(); sim.Random01 = () => forced.Count > 0 ? forced.Dequeue() : .99;
            var seen = new List<string>(); sim.ReviveTextRaised += t => seen.Add(t.Ko);
            yield return null;
            Func<float, float, EnemyState> spawn = (dx, dy) => { for (int k = 0; k < 6; k++) { var s = sim.SpawnNormalEnemy(p.X + dx + k * 8, p.Y + dy); if (s != null) return s; } return null; };
            // ---- A. energy shield: spent before HP, HP never moves while it holds, only the overflow reaches HP ----
            var e1 = spawn(150, -40); check(e1 != null, "no spawn A");
            yield return null; yield return null; // let UpdateViews create the enemy view first so the hit numbers are drawn
            rec.shieldBefore = (int)e1.Shield; check(e1.Shield == e1.MaxShield && e1.MaxShield == e1.MaxHp, "enemy shield starts equal to HP");
            sim.HurtEnemy(e1, 300); rec.shieldAfterFirstHit = (int)e1.Shield; rec.hpAfterFirstHit = e1.Hp;
            check(e1.Hp == e1.MaxHp && e1.Shield == rec.shieldBefore - 300, "first hit: shield " + e1.Shield + " hp " + e1.Hp);
            yield return new WaitForSecondsRealtime(.25f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-b08-shield.png")); yield return null;
            sim.HurtEnemy(e1, 700); rec.shieldAfterOverflow = (int)e1.Shield; rec.hpAfterOverflow = e1.Hp;
            check(e1.Shield == 0 && e1.Hp == e1.MaxHp - (700 - (rec.shieldBefore - 300)), "overflow: shield " + e1.Shield + " hp " + e1.Hp);
            // DOT skips the shield unless shieldHit; here the shield is 0, so use a fresh enemy
            var e1b = spawn(150, 40); int sb = (int)e1b.Shield; sim.HurtEnemy(e1b, 100, 0, true, false); check(e1b.Shield == sb && e1b.Hp == e1b.MaxHp - 100, "DOT passes the shield");
            sim.HurtEnemy(e1b, 100, 0, true, true); check(e1b.Shield == sb - 100, "shieldHit DOT hits the shield");
            // ---- B. ordinary mobs: one revive (own body / ghoul), reserved at death, resolved after 90 frames ----
            sim.Enemies.Clear(); yield return null;
            var eb = spawn(-130, -30); var eg = spawn(-130, 50); check(eb != null && eg != null, "no spawn B");
            eb.Shield = 0; eg.Shield = 0; eb.Hp = 1; eg.Hp = 1; int ghoulMhp = eg.MaxHp, ghoulAtk = eg.BaseAttack;
            forced.Enqueue(.99); forced.Enqueue(0); forced.Enqueue(.9); sim.HurtEnemy(eb, 50);
            check(!eb.Alive && eb.Revived && eb.ReviveTimer == 90 && !eb.ReviveAsGhoul, "body reserved");
            forced.Enqueue(.99); forced.Enqueue(0); forced.Enqueue(.1); sim.HurtEnemy(eg, 50);
            check(!eg.Alive && eg.Revived && eg.ReviveAsGhoul, "ghoul reserved");
            int kills = sim.Kills; for (int i = 0; i < 90; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            rec.bodyAlive = eb.Alive; rec.bodyRevivedHp = eb.Hp; rec.bodyRevivedMaxHp = eb.MaxHp;
            check(eb.Alive && eb.Hp == eb.MaxHp, "body revived at full HP");
            EnemyState gh = null; foreach (var x in sim.Enemies) if (x.IsGhoul) gh = x;
            rec.ghoulBorn = gh != null; if (gh != null) { rec.ghoulIsGhoul = gh.IsGhoul; rec.ghoulEtype = gh.Etype; rec.ghoulHp = gh.Hp; rec.ghoulMaxHp = gh.MaxHp; rec.ghoulShield = (int)gh.Shield; check(gh.Etype >= 100 && gh.Hp == ghoulMhp * 2 && gh.Attack == ghoulAtk * 2 && gh.Revived && gh.Shield == gh.MaxShield, "ghoul stats"); }
            else check(false, "no ghoul");
            check(sim.Kills == kills, "kills not counted twice"); // the kills of the first death were counted at death time, not at revive
            yield return new WaitForSecondsRealtime(.12f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-b08-revive.png")); yield return null;
            // a revived enemy dies for good: no second revive
            if (eb.Alive) { eb.Shield = 0; eb.Hp = 1; forced.Enqueue(.99); sim.HurtEnemy(eb, 50); check(!eb.Alive && eb.ReviveTimer == 0, "no second revive"); }
            // ---- C. 1-1 boss: immediate revive with revive points, then the last death (sink: no death texts) ----
            sim.Enemies.Clear(); sim.Config.StageIndex = 0; yield return null;
            var boss = spawn(160, 0); boss.IsBoss = true; boss.Radius = 60; boss.Shield = 0; boss.MaxShield = 0; boss.Hp = 1; boss.MaxRevPts = 200; boss.RevPts = 200; boss.MaxPoise = 400; boss.BossPatCd = 100; boss.Attack = 120;
            int textsBefore = seen.Count; bool revivedEvent = false; sim.BossRevived += (b, plan) => revivedEvent = true;
            p.Iframes = 0; forced.Enqueue(.99); forced.Enqueue(0); forced.Enqueue(.5); sim.HurtEnemy(boss, 50);
            rec.bossRevived = boss.Alive && revivedEvent; rec.bossDeaths = boss.Deaths; rec.bossRevPts = boss.RevPts; rec.bossHpAfter = boss.Hp;
            check(boss.Alive && revivedEvent && boss.Deaths == 1 && boss.Hp == boss.MaxHp && boss.RevPts == 200 - 12 && boss.ReviveIframes == 90, "boss immediate revive: deaths " + boss.Deaths + " pts " + boss.RevPts + " hp " + boss.Hp);
            yield return new WaitForSecondsRealtime(.15f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-b08-boss-revive.png")); yield return null;
            // after an immediate revive the judgement is done (_bossRevJudged): the next death has no timer; the 1-1 druid sinks without death texts (STY-D9)
            boss.ReviveIframes = 0; boss.RevPts = 0; boss.Hp = 1; textsBefore = seen.Count; p.Iframes = 0; forced.Enqueue(.99); sim.HurtEnemy(boss, 50);
            var late = seen.GetRange(textsBefore, seen.Count - textsBefore);
            check(!boss.Alive && boss.ReviveTimer == 0 && boss.SinkDruid && !late.Exists(t => t.Contains("부활 실패") || t.Contains("고갈")), "judged boss dies for good, sinking, no death text: " + string.Join("|", late.ToArray()));
            // a boss that never revived: points gone -> 3 s fallback countdown with chance 0, then the final death (still no texts, STY-D9)
            var boss2 = spawn(160, 60); boss2.IsBoss = true; boss2.Radius = 60; boss2.Shield = 0; boss2.MaxShield = 0; boss2.Hp = 1; boss2.MaxRevPts = 200; boss2.RevPts = 0; textsBefore = seen.Count; p.Iframes = 0; forced.Enqueue(.99); sim.HurtEnemy(boss2, 50);
            check(!boss2.Alive && boss2.BossRevJudged && boss2.ReviveTimer == 180 && boss2.BossRevChance == 0 && boss2.BossRevRoll == 1 && boss2.SinkDruid, "fallback reserved: timer " + boss2.ReviveTimer);
            for (int i = 0; i < 180; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            late = seen.GetRange(textsBefore, seen.Count - textsBefore);
            rec.bossFinalSink = boss2.SinkDruid; rec.bossFinalTextsHidden = !late.Exists(t => t.Contains("완전 사망") || t.Contains("부활력 고갈"));
            check(!boss2.Alive && boss2.ReviveTimer == 0 && boss2.SinkDruid && rec.bossFinalTextsHidden, "1-1 druid final death after the countdown sinks without death texts: " + string.Join("|", late.ToArray()));
            // ---- D. player: energy shield first, then the fallen countdown with the pre-rolled revive ----
            sim.Enemies.Clear(); sim.Config.RevivePow = 1.0; p.Iframes = 0; p.State = "idle"; p.Hp = p.MaxHp; p.Shield = p.MaxShield; p.ShieldRegenTicks = 0; yield return null;
            rec.playerShieldBefore = p.Shield; float hpBefore = p.Hp; sim.HurtPlayer(60); rec.playerShieldAfterHit = p.Shield; rec.playerHpAfterShieldHit = p.Hp;
            check(p.Shield < rec.playerShieldBefore && p.Hp == hpBefore && p.ShieldRegenTicks == 180, "player shield absorbs first, HP untouched, regen timer 180");
            for (int i = 0; i < 400 && p.State != "fallen" && p.State != "dead"; i++) { p.Iframes = 0; sim.HurtPlayer(99999); }
            rec.playerFell = p.State == "fallen"; check(rec.playerFell && p.Hp == 0 && p.StateTicks == 300, "fell: " + p.State);
            rec.fallenChance = p.FallenReviveChance; check(p.FallenCanRevive && p.FallenReviveChance == 100, "revive chance " + p.FallenReviveChance);
            for (int i = 0; i < 120; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            check(p.State == "fallen" && p.StateTicks == 180, "countdown " + p.StateTicks);
            yield return new WaitForSecondsRealtime(.2f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-b08-fallen.png")); yield return null;
            for (int i = 0; i < 180; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            rec.playerRevived = p.State == "idle" && p.Hp == p.MaxHp; check(rec.playerRevived && p.Iframes > 0 && p.DemonReviveCd > 0, "revived: " + p.State + " hp " + p.Hp);
            yield return new WaitForSecondsRealtime(.15f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-b08-fallen-revived.png")); yield return null;
            // second fall inside the cooldown: no revive, dead after the countdown
            for (int i = 0; i < 400 && p.State != "fallen"; i++) { p.Iframes = 0; sim.HurtPlayer(99999); }
            check(p.State == "fallen" && !p.FallenCanRevive, "second fall cannot revive (cooldown)");
            for (int i = 0; i < 300; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            rec.playerSecondFallDead = p.State == "dead"; check(rec.playerSecondFallDead, "second fall ends dead: " + p.State);
            rec.textsSeen = seen.Count; check(seen.Contains("악마화 부활!") && seen.Contains("💀본모습 부활!") && seen.Contains("💀구울화!"), "revive texts raised: " + string.Join("|", seen.ToArray()));
            rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0;
            File.WriteAllText(Path.Combine(output, "revive-smoke.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
    }
}
