using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-m1-check -output <dir>`: M1 route walk-through with the real NativeGame (lobby character creation and story entry, first practice, then gameplay driven through the
    // same Tick / input entry points FixedUpdate uses). Reports "ok / fail / not implemented" per stage with one capture each (<dir>/caps). Nothing is fixed here; the run is isolated
    // (roster and combat save live under <dir>), so a normal player's save is never touched.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class M1Stage { public string id, name, status, note, capture; }
        [Serializable] sealed class M1Receipt { public string scope; public List<M1Stage> stages = new List<M1Stage>(); public string firstBlocked; }
        M1Receipt m1; string m1Caps; int m1Index;

        IEnumerator M1Shot(string name)
        {
            UpdateViews(); yield return new WaitForSecondsRealtime(.15f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(m1Caps, name + ".png")); yield return null;
        }
        // status: "ok", "fail", "missing"
        void M1Add(string id, string name, string status, string note, string cap)
        {
            m1.stages.Add(new M1Stage { id = id, name = name, status = status, note = note, capture = cap });
            if (status != "ok" && m1.firstBlocked == null) m1.firstBlocked = id + " " + name + " (" + status + "): " + note;
        }

        IEnumerator M1Check()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break;
            m1Caps = Path.Combine(output, "caps"); Directory.CreateDirectory(m1Caps);
            m1 = new M1Receipt { scope = "real NativeGame; lobby/story/practice through the lobby API, gameplay through Simulation.Tick (not OS input)" };
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            float deadline;

            // ---- 01 lobby -> warrior -> 1-1 ----
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            if (lobby.Characters.Count == 0) { lobby.OpenCharacterCreation(); lobby.ChooseCharacterVisual(0); lobby.ConfirmCharacterVisual(); lobby.CreateCharacter("M1점검"); lobby.ShowLobby(); }
            yield return M1Shot("01-lobby-warrior-selected");
            bool entered = lobby.BeginCharacterEntry(false);
            deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            string storyPage = lobby.StartupCaptureState.Page.ToString();
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            bool inGame = entered && !lobby.IsBlocking;
            yield return M1Shot("02-stage-1-1-entry");
            M1Add("01", "lobby -> warrior -> 1-1 entry", inGame ? "ok" : "fail", inGame ? "character created, story entry (page " + storyPage + ") skipped, gameplay reached (title/gate/world-intro videos not walked: lobby smoke covers them)" : "did not reach gameplay: blocking=" + lobby.IsBlocking, "01-lobby-warrior-selected.png, 02-stage-1-1-entry.png");
            if (!inGame) { yield return M1Finish(output); yield break; }

            bool practice = firstPractice != null;
            M1Add("02", "first practice arena after a new character", practice ? "ok" : "fail", practice ? "active (parry lesson gate); ended by script to reach the free 1-1" : "not shown", "02-stage-1-1-entry.png");
            if (practice) EndFirstPractice(true);
            frontendEntryInputFence = false; Running = false; yield return null;
            var sim = Simulation; var p = sim.Player;   // EndFirstPractice rebuilds the run: take the live simulation only now
            sim.Config.EnemyAiEnabled = true; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000;
            Action<float> heal = hp => { if (p.Hp < hp) p.Hp = p.MaxHp; };

            // ---- 03 move ----
            float x0 = p.X, y0 = p.Y;
            for (int i = 0; i < 40; i++) StepInput(1, 0, p.X + 300, p.Y, false, false);
            for (int i = 0; i < 40; i++) StepInput(0, 1, p.X, p.Y + 300, false, false);
            float moved = Mathf.Sqrt((p.X - x0) * (p.X - x0) + (p.Y - y0) * (p.Y - y0));
            yield return M1Shot("03-move");
            M1Add("03", "move", moved > 100 ? "ok" : "fail", "moved " + moved.ToString("0") + " px in 80 ticks", "03-move.png");

            // ---- 04 attack (LMB, real enemy hp) ----
            sim.Enemies.Clear(); var target = sim.SpawnNormalEnemy(p.X + 45, p.Y); if (target == null) target = sim.SpawnNormalEnemy(p.X - 45, p.Y);
            sim.Config.EnemyAiEnabled = false; int hp0 = target != null ? target.Hp : 0; int swings = 0, kills0 = sim.Kills, ttk = -1;
            for (int i = 0; i < 600 && target != null && target.Alive; i++) { StepInput(0, 0, target.X, target.Y, true, false); if (p.State == "wSwing" && p.StateTicks == 5) swings++; heal(1); if (!target.Alive) ttk = i + 1; }
            yield return M1Shot("04-attack");
            M1Add("04", "attack (LMB)", target != null && (target.Hp < hp0 || !target.Alive) ? "ok" : "fail", target == null ? "no enemy could be spawned" : "enemy hp " + hp0 + " -> " + (target.Alive ? target.Hp.ToString() : "dead") + " in " + ttk + " ticks (cap 600), swing starts seen " + swings, "04-attack.png");
            sim.Enemies.Clear();

            // ---- 05 roll ----
            sim.HarpGauge = 225; float rx = p.X, ry = p.Y; int dir = 3;
            sim.SetRollInput(false, false, false, true, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
            sim.SetRollInput(false, false, false, true, true); for (int i = 0; i < RollRules.Frames + 1; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); if (i == 8) yield return M1Shot("05-roll"); }
            sim.SetRollInput(false, false, false, false, false);
            float rd = Mathf.Sqrt((p.X - rx) * (p.X - rx) + (p.Y - ry) * (p.Y - ry));
            M1Add("05", "roll", Mathf.Abs(rd - 175) < 1 || (rd > 20 && rd < 175.5f) ? "ok" : "fail", "rolled " + rd.ToString("0.0") + " px, gauge " + sim.HarpGauge.ToString("0.0") + ", count " + sim.RollCount, "05-roll.png");

            // ---- 06 parry / shield strike ----
            for (int i = 0; i < 60; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            p.Iframes = 0; p.State = "idle"; sim.SbCd = 0; int parries = sim.ParryCount; float hpq = p.Hp;
            sim.SetPlayerCombatInput(true, false, false); StepInput(0, 0, p.X + 300, p.Y, false, false); sim.HurtPlayer(500);
            yield return M1Shot("06-parry");
            bool q = sim.ParryCount == parries + 1 && p.Hp >= hpq;
            sim.SetPlayerCombatInput(false, false, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
            for (int i = 0; i < 60; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            p.State = "idle"; p.Stamina = p.MaxStamina; sim.SetPlayerCombatInput(false, true, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool eDraw = p.State == "sDraw"; sim.SetPlayerCombatInput(false, false, false); StepInput(0, 0, p.X + 300, p.Y, false, false); bool eBash = p.State == "sBash";
            for (int i = 0; i < 60 && p.State != "idle"; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            M1Add("06", "parry (Q) and shield strike (E)", q && eDraw && eBash ? "ok" : "fail", "Q parry " + q + ", E sDraw " + eDraw + " sBash " + eBash + "; E deals no damage / reflects no projectile yet (§6 of B07 doc), no sBlock/sBash sprite", "06-parry.png");

            // ---- 07 kill mobs (real hp, AI on) ----
            sim.Config.EnemyAiEnabled = true; sim.Enemies.Clear(); int killsBefore = sim.Kills; int lootBefore = sim.Loot.Count + sim.CollectedLoot.Count; int ticksUsed = 0; int playerHitTicks = 0; var ttks = new List<int>(); float hpStart = p.Hp;
            for (int k = 0; k < 3; k++)
            {
                var e = sim.SpawnNormalEnemy(p.X + 60 + k * 15, p.Y + k * 10); if (e == null) continue;
                int t0 = ticksUsed; for (int i = 0; i < 900 && e.Alive; i++) { StepInput(0, 0, e.X, e.Y, true, false); ticksUsed++; if (p.Hp < hpStart - 1) playerHitTicks++; heal(p.MaxHp * .5f); hpStart = p.Hp; if (!e.Alive) break; }
                ttks.Add(ticksUsed - t0); yield return null;
            }
            yield return M1Shot("07-kill");
            int killed = sim.Kills - killsBefore;
            M1Add("07", "kill mobs", killed >= 1 ? "ok" : "fail", killed + "/3 killed (ticks per enemy " + string.Join(",", ttks.ToArray()) + ") at full enemy hp, loot rolls " + (sim.Loot.Count + sim.CollectedLoot.Count - lootBefore) + ", enemy hits on player ticks " + playerHitTicks, "07-kill.png");

            // ---- 08 drop pickup + equip ----
            sim.Config.EnemyAiEnabled = false; int attempts = 0;
            while (sim.Loot.Count < 3 && attempts < 40)
            {
                attempts++; var e = sim.SpawnNormalEnemy(p.X + 50 + attempts % 4 * 12, p.Y + attempts % 3 * 12); if (e == null) continue; e.Hp = 1; e.MaxHp = 1;
                for (int i = 0; i < 120 && e.Alive; i++) StepInput(0, 0, e.X, e.Y, true, false);
            }
            int groundBefore = sim.Loot.Count; int bagBefore = inventory.State.Bag.Count; int collectedBefore = sim.CollectedLoot.Count;
            yield return M1Shot("08a-drops-on-ground");
            for (int i = 0; i < 9 * (groundBefore + 2) && sim.Loot.Count > 0; i++) StepInput(0, 0, p.X + 100, p.Y, false, true);
            int collected = sim.CollectedLoot.Count - collectedBefore; bool bagGrew = inventory.State.Bag.Count == bagBefore + collected && collected > 0;
            InventoryItem pick = null; for (int i = collectedBefore; i < sim.CollectedLoot.Count && pick == null; i++) { var it = sim.CollectedLoot[i].Item; if (it.reqLv <= p.Level && it.slot != "ossuary") pick = it; }
            bool equipped = pick != null && inventory.Equip(pick, p.Level);
            SetInventory(true); if (pick != null) inventory.State.Select(pick); yield return M1Shot("08-pickup-equip"); SetInventory(false);
            M1Add("08", "pick up drop and equip", bagGrew && (pick == null || equipped) ? "ok" : "fail", "ground " + groundBefore + ", collected " + collected + ", bag " + bagBefore + " -> " + inventory.State.Bag.Count + ", equip " + (pick == null ? "no equippable item" : pick.name + " " + equipped), "08-pickup-equip.png");

            // ---- 09 level up ----
            int lv0 = p.Level; int guard = 0, lvKills = 0, nullSpawns = 0, exp0 = p.Experience;
            while (p.Level == lv0 && guard++ < 400) { double a = guard * 2.399963; var e = sim.SpawnNormalEnemy(p.X + Mathf.Cos((float)a) * (50 + guard % 4 * 15), p.Y + Mathf.Sin((float)a) * (50 + guard % 3 * 15)); if (e == null) { nullSpawns++; continue; } e.Hp = 1; e.MaxHp = 1; int k0 = sim.Kills; p.Stamina = p.MaxStamina; for (int i = 0; i < 60 && e.Alive; i++) StepInput(0, 0, e.X, e.Y, true, false); lvKills += sim.Kills - k0; sim.Enemies.Clear(); for (int i = 0; i < 4; i++) StepInput(0, 0, p.X + 50, p.Y, false, false); }   // release LMB between mobs (a held LMB keeps the 3rd ki slash charging)
            yield return null; yield return M1Shot("09-levelup");
            M1Add("09", "level up", p.Level > lv0 ? "ok" : "fail", "level " + lv0 + " -> " + p.Level + ", overlay active " + levelUp.Active + ", exp " + exp0 + " -> " + p.Experience + "/" + p.MaxExperience + " over " + lvKills + " kills (null spawns " + nullSpawns + ")", "09-levelup.png");

            // ---- 10..13 boss arena / druid / kill+sink / stage clear : no way to reach them (checked) ----
            bool bossEntry = false; // Unity has no boss-entry event, boss actor or arena trigger: NativeGame.cs 326 / 329 comments, SpawnNormalEnemy throws for etype != 0
            bool notSupported = false; try { var t = sim.SpawnNormalEnemy(p.X + 50, p.Y); if (t != null) { t.Etype = 1; sim.HurtEnemy(t, 1); } } catch (NotSupportedException) { notSupported = true; }
            sim.Enemies.Clear();
            yield return M1Shot("10-boss-arena-no-entry");
            M1Add("10", "boss arena entry", bossEntry ? "ok" : "missing", "no arena trigger / boss-entry event in the native game (stage ends only by walking); a non-etype0 enemy throws NotSupported=" + notSupported, "10-boss-arena-no-entry.png");
            M1Add("11", "druid boss fight", "missing", "no boss actor: the simulation only admits the ordinary etype0 profile; BossBar.Show is never called", "10-boss-arena-no-entry.png");
            M1Add("12", "boss kill and sink", "missing", "B08 druid sink / boss revive rules exist in Core but only a flagged ordinary enemy in ReviveSmoke reaches them; nothing spawns a druid", "10-boss-arena-no-entry.png");
            M1Add("13", "stage clear", "missing", "stageClear.Show is never called (no stage-clear / exit event, NativeGame.cs 326)", "10-boss-arena-no-entry.png");

            // ---- 14 save and continue ----
            p.Hp = p.MaxHp; sim.Materials = 4321; bool saved = SaveCombatNow(); var before = SnapshotCombat("before");
            string name = lobby.ActiveCharacterName; bool hasSave = HasCombatSave(name);
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.3f);
            bool continueOk = lobby.BeginCharacterEntry(false) && !lobby.StartupEntryActive;
            deadline = Time.realtimeSinceStartup + 10; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            Running = false; yield return null;
            var after = SnapshotCombat("after"); yield return M1Shot("14-continue");
            bool same = after.level == before.level && after.exp == before.exp && after.mats == before.mats && after.kills == before.kills && string.Join("|", after.equipped) == string.Join("|", before.equipped) && after.bagCount == before.bagCount;
            M1Add("14", "save and continue", saved && hasSave && continueOk && CombatSaveRestored && same ? "ok" : "fail", "saved " + saved + ", file " + hasSave + ", continue " + continueOk + ", restored " + CombatSaveRestored + ", lv " + before.level + "->" + after.level + " bag " + before.bagCount + "->" + after.bagCount + " equipped " + before.equipped.Length + "->" + after.equipped.Length + " (position resets to the stage start like the web)", "14-continue.png");
            yield return M1Finish(output);
        }

        IEnumerator M1Finish(string output)
        {
            File.WriteAllText(Path.Combine(output, "m1-check.json"), JsonUtility.ToJson(m1, true), new UTF8Encoding(false));
            yield return null; Application.Quit(0);
        }
    }
}
