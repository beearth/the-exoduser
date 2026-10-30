using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-b07-smoke -output <dir>`: the real NativeGame/Simulation runs the connected B07 states (PlayerCombatWired) and the warrior roll through the same
    // input entry points FixedUpdate uses (SetPlayerCombatInput / SetRollInput + Tick), and writes frames: roll sequence, chain dash, parry success.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class B07Receipt { public bool passed; public string scope, failures, notes; public int checks; public double rollDistance, rollGaugeAfter, chainDistance; public int parryCount; public double rageAfterParry; }

        IEnumerator B07Shot(string output, string name)
        {
            UpdateViews(); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, name + ".png")); yield return null;
        }

        IEnumerator B07Smoke()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            lobby.ShowLobby(); lobby.SelectPreview(); lobby.EnterNativeTest(); menu = false; Running = false;
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            var sim = Simulation; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000;
            var fails = new List<string>(); int n = 0; Action<bool, string> check = (ok, what) => { n++; if (!ok) fails.Add(what); };
            var rec = new B07Receipt { scope = "actual_native_player_b07_wired_roll" };
            var p = sim.Player; yield return null;
            check(Simulation.PlayerCombatWired, "PlayerCombatWired is on");

            // ---- roll: pick a free direction (0 up, 1 down, 2 left, 3 right) ----
            int dir = -1; float[] dxs = { 0, 0, -1, 1 }, dys = { -1, 1, 0, 0 };
            for (int d = 0; d < 4 && dir < 0; d++) { bool free = true; for (int s = 1; s <= 8; s++) if (!sim.CanMove(p.X + dxs[d] * 25 * s, p.Y + dys[d] * 25 * s, p.Radius)) free = false; if (free) dir = d; }
            check(dir >= 0, "a free direction for the roll");
            if (dir < 0) dir = 3;
            bool up = dir == 0, down = dir == 1, left = dir == 2, right = dir == 3;
            sim.HarpGauge = 225; float x0 = p.X, y0 = p.Y, aimX = p.X + dxs[dir] * 300, aimY = p.Y + dys[dir] * 300;
            sim.SetRollInput(up, down, left, right, false); sim.Tick(0, 0, aimX, aimY, false, false);               // direction held, roll key not yet
            yield return B07Shot(output, "b07-roll-0-start");
            sim.SetRollInput(up, down, left, right, true);                                                           // roll key pressed while a direction is held
            for (int f = 1; f <= RollRules.Frames; f++)
            {
                sim.Tick(0, 0, aimX, aimY, false, false);
                if (f == 1) { check(p.State == "bladeDash" && sim.RollActive && p.Iframes >= RollRules.Iframes - 1, "roll started: " + p.State + " iframes " + p.Iframes); check(Math.Abs(sim.HarpGauge - 180) < .1, "gauge 225 -> 180 (+ one tick of regen .094): " + sim.HarpGauge); }
                if (f == 3) { sim.QueueRoll(dir); sim.Tick(0, 0, aimX, aimY, false, false); f++; check(sim.RollDenied == 1, "no second roll while rolling: denied " + sim.RollDenied); }
                int hp = (int)p.Hp; if (f <= RollRules.Iframes) { sim.HurtPlayer(500); check((int)p.Hp == hp, "invulnerable frame " + f); }
                if (f == 1 || f % 3 == 0) yield return B07Shot(output, "b07-roll-" + f.ToString("00"));
            }
            double moved = Math.Sqrt((p.X - x0) * (p.X - x0) + (p.Y - y0) * (p.Y - y0)); rec.rollDistance = moved; rec.rollGaugeAfter = sim.HarpGauge;
            check(Math.Abs(moved - 175) < .5, "roll distance 175: " + moved);
            check(p.State == "idle" && !sim.RollActive, "roll finished: " + p.State);
            sim.SetRollInput(false, false, false, false, false); sim.HarpGauge = 44; sim.QueueRoll(dir); sim.Tick(0, 0, aimX, aimY, false, false);
            check(!sim.RollActive && sim.RollDenied >= 2, "no roll with less than one cell (44 < 45)");

            // ---- roll escapes: stagger and pStun (poise restored to 4) ----
            sim.HarpGauge = 225; sim.Tick(0, 0, aimX, aimY, false, false);
            p.State = "pStun"; p.StateTicks = 200; p.Poise = 0; sim.SetRollInput(up, down, left, right, true); sim.QueueRoll(dir); sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "bladeDash" && p.Poise == 4, "pStun escape by roll: " + p.State + " poise " + p.Poise);
            for (int i = 0; i < 20; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            sim.SetRollInput(false, false, false, false, false); sim.HarpGauge = 225;
            p.State = "stagger"; p.StateTicks = 6; sim.SetRollInput(up, down, left, right, true); sim.QueueRoll(dir); sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "bladeDash", "stagger escape by roll: " + p.State);
            for (int i = 0; i < 20; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            sim.SetRollInput(false, false, false, false, false);

            // ---- chain dash: Shift hold then release (tier 3) ----
            p.Iframes = 0; sim.HarpGauge = 225; float cx = p.X, cy = p.Y;
            for (int i = 0; i < 14; i++) { sim.SetPlayerCombatInput(false, false, true); sim.Tick(0, 0, aimX, aimY, false, false); }
            yield return B07Shot(output, "b07-chain-0-hold");
            sim.SetPlayerCombatInput(false, false, false); sim.Tick(0, 0, aimX, aimY, false, false);
            check(sim.HarpActive || sim.DashActive, "chain dash fired after release (tier " + sim.HarpTier + ")");
            int shot = 0, hpDash = (int)p.Hp; bool hitDuring = false;
            for (int i = 0; i < 120 && (sim.HarpActive || sim.DashActive); i++)
            {
                sim.SetPlayerCombatInput(false, false, false); sim.Tick(0, 0, aimX, aimY, false, false); sim.HurtPlayer(500);
                if (i % 5 == 0 && shot < 3) { shot++; yield return B07Shot(output, "b07-chain-" + shot); }
            }
            hitDuring = (int)p.Hp < hpDash;
            rec.chainDistance = Math.Sqrt((p.X - cx) * (p.X - cx) + (p.Y - cy) * (p.Y - cy));
            check(rec.chainDistance > 100, "chain dash moved the player: " + rec.chainDistance);
            check(!hitDuring, "no damage while the chain move runs"); check(sim.HarpGauge < 225, "chain dash spent gauge: " + sim.HarpGauge);
            yield return B07Shot(output, "b07-chain-end");

            // ---- Q parry: success inside the window (rage / iframes / floater) ----
            for (int i = 0; i < 40; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            p.Iframes = 0; p.State = "idle"; sim.SbCd = 0; double rageBefore = sim.Rage; int parries = sim.ParryCount; float hpBefore = p.Hp;
            sim.SetPlayerCombatInput(true, false, false); sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "sBlock" && sim.SbParryT > 0, "Q enters sBlock with a parry window: " + p.State + " " + sim.SbParryT);
            sim.HurtPlayer(500); yield return B07Shot(output, "b07-parry-success");
            check(sim.ParryCount == parries + 1 && p.Hp >= hpBefore, "Q parry success: count " + sim.ParryCount + " hp " + p.Hp + "/" + hpBefore);
            rec.parryCount = sim.ParryCount; rec.rageAfterParry = sim.Rage; check(sim.Rage >= rageBefore, "parry reward rage (B10 API): " + rageBefore + " -> " + sim.Rage);
            sim.SetPlayerCombatInput(false, false, false); sim.Tick(0, 0, aimX, aimY, false, false);

            // ---- E shield strike tap: sDraw -> sBash -> sRecover -> idle ----
            for (int i = 0; i < 60; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            int bash0 = sim.BashStrikeCount; p.State = "idle"; p.Stamina = p.MaxStamina; sim.SetPlayerCombatInput(false, true, false); sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "sDraw", "E press -> sDraw: " + p.State);
            sim.SetPlayerCombatInput(false, false, false); sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "sBash", "E release -> sBash: " + p.State);
            for (int i = 0; i < 60 && p.State != "idle"; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            check(p.State == "idle", "E strike ends idle: " + p.State);
            check(sim.BashStrikeCount == bash0 + 1, "E strike landed once (st2 crosses 12): " + sim.BashStrikeCount);

            // ---- B08 shield: a normal hit with shield up spends the shield first, hp stays ----
            for (int i = 0; i < 120; i++) sim.Tick(0, 0, aimX, aimY, false, false);
            p.Iframes = 0; p.Shield = Math.Max(p.Shield, 500); float hpS = p.Hp, shS = p.Shield; sim.HurtPlayer(100);
            check(p.Hp >= hpS && p.Shield < shS, "shield absorbs before hp (B08): shield " + shS + " -> " + p.Shield + " hp " + hpS + " -> " + p.Hp);

            rec.checks = n; rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0;
            rec.notes = "구르기 먼지 후속; Q 오라·E 기본 합체/모델 모션은 현재 Player 실화면 검수와 구분";
            File.WriteAllText(Path.Combine(output, "b07-smoke.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
    }
}
