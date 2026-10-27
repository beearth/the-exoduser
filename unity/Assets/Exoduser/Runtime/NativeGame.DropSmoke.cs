using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-drop-smoke -output <dir>`: the real NativeGame/Simulation kills ordinary enemies with weapon swings, the drops appear on the ground
    // (mkItem items, rarity beams), R (held) collects them into the real inventory bag, an item is equipped, and the screens are captured at 1x.
    public sealed partial class NativeGame
    {
        bool dropSmoke; // the capture window may sit in the background: focus loss must not open the pause menu over the capture
        [Serializable] sealed class DropSmokeReceipt
        {
            public bool passed; public string scope; public int kills, dropsRolled, dropViewsPeak, collected, bagBefore, bagAfter, equippedBefore, rarity0, rarity1, rarity2, rarity3, rarity4, rarity5;
            public bool allInBag, allAdmitted, equipOk, statsChanged; public string firstItem, equippedItem, failures;
        }

        IEnumerator DropSmoke()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            var sim = Simulation; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear();
            sim.Config.DropBonus = 3f; // the web normal-mob chance is .45*dropBonus: raised so a short run shows many drops
            var rec = new DropSmokeReceipt { scope = "actual_native_player_world_drop_to_inventory", bagBefore = inventory.State.Bag.Count };
            var fails = new List<string>(); Action<bool, string> check = (ok, what) => { if (!ok) fails.Add(what); };
            var p = sim.Player; var rolled = new List<LootState>();
            yield return null;
            int attempts = 0;
            while (rolled.Count < 14 && attempts < 80)
            {
                attempts++;
                double a = attempts * 2.399963; float ex = p.X + Mathf.Cos((float)a) * (70 + attempts % 5 * 22), ey = p.Y + Mathf.Sin((float)a) * (60 + attempts % 4 * 20);
                var e0 = sim.SpawnNormalEnemy(ex, ey); if (e0 == null) continue; e0.Hp = 1; e0.MaxHp = 1; int kills = sim.Kills, before = sim.Loot.Count;
                var known = new HashSet<LootState>(sim.Loot);
                for (int i = 0; i < 240 && sim.Kills == kills; i++) StepInput(0, 0, e0.X, e0.Y, i % 12 < 6, false);
                foreach (var l in sim.Loot) if (!known.Contains(l)) rolled.Add(l);
                if (attempts % 6 == 0) yield return new WaitForFixedUpdate();
            }
            rec.kills = sim.Kills; rec.dropsRolled = rolled.Count; rec.dropViewsPeak = drops.Count;
            foreach (var l in rolled) { if (l.Item == null) { check(false, "loot without item"); continue; } switch (l.Item.rarity) { case 0: rec.rarity0++; break; case 1: rec.rarity1++; break; case 2: rec.rarity2++; break; case 3: rec.rarity3++; break; case 4: rec.rarity4++; break; default: rec.rarity5++; break; } }
            check(rolled.Count > 0, "no drop at all"); rec.firstItem = rolled.Count > 0 ? rolled[0].Item.name + " r" + rolled[0].Item.rarity + " t" + rolled[0].Item.tier + " Lv" + rolled[0].Item.itemLv : "";
            // show every rarity beam on the ground for the capture without touching the rolled items (a plain extra kill set would need luck)
            yield return new WaitForSecondsRealtime(.3f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-d01-ground.png")); yield return null;
            rec.dropViewsPeak = Math.Max(rec.dropViewsPeak, drops.Count);
            check(drops.Count == sim.Loot.Count, "views " + drops.Count + " != loot " + sim.Loot.Count);
            // R held: one pickup every 9 ticks, highest rarity first
            var onGround = new List<LootState>(sim.Loot); int collectedBefore = sim.CollectedLoot.Count;
            for (int i = 0; i < 9 * (onGround.Count + 2) && sim.Loot.Count > 0; i++) StepInput(0, 0, p.X + 100, p.Y, false, true);
            rec.collected = sim.CollectedLoot.Count - collectedBefore; rec.bagAfter = inventory.State.Bag.Count;
            rec.allInBag = true; rec.allAdmitted = true;
            for (int i = collectedBefore; i < sim.CollectedLoot.Count; i++)
            {
                var it = sim.CollectedLoot[i].Item; if (!inventory.State.Bag.Contains(it)) rec.allInBag = false;
                string why; if (!InventoryState.Admitted(it, out why)) { rec.allAdmitted = false; fails.Add("not admitted " + it.name + ": " + why); }
            }
            check(rec.collected > 0 && rec.bagAfter == rec.bagBefore + rec.collected, "bag " + rec.bagBefore + " + " + rec.collected + " != " + rec.bagAfter);
            // sorted rarity order: web _invAutoSortIfClosed
            for (int i = 1; i < inventory.State.Bag.Count; i++) check(inventory.State.Bag[i - 1].rarity >= inventory.State.Bag[i].rarity || inventory.State.Bag[i - 1].fav != inventory.State.Bag[i].fav || inventory.State.Bag[i - 1].junk != inventory.State.Bag[i].junk, "bag not sorted by rarity at " + i);
            // equip one dropped item (a weapon if one dropped) and make sure the stat pipeline accepts it
            InventoryItem pick = null;
            for (int i = collectedBefore; i < sim.CollectedLoot.Count && pick == null; i++) if (sim.CollectedLoot[i].Item.slot == "weapon" || sim.CollectedLoot[i].Item.slot == "helmet") pick = sim.CollectedLoot[i].Item;
            if (pick == null && sim.CollectedLoot.Count > collectedBefore) pick = sim.CollectedLoot[collectedBefore].Item;
            if (pick != null)
            {
                var atkBefore = sim.Config.WeaponAttack; var maxHpBefore = p.MaxHp; rec.equippedBefore = 1;
                rec.equipOk = inventory.Equip(pick, p.Level); rec.equippedItem = pick.name + " (" + pick.slot + ")";
                rec.statsChanged = sim.Config.WeaponAttack != atkBefore || p.MaxHp != maxHpBefore || pick.slot != "weapon"; // slots without weapon/hp stats still equip
                check(rec.equipOk, "equip refused");
            }
            SetInventory(true); if (pick != null) inventory.State.Select(pick);
            yield return new WaitForSecondsRealtime(.4f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-d01-inventory.png")); yield return null;
            SetInventory(false);
            yield return new WaitForSecondsRealtime(.2f); yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output, "unity-d01-after-pickup.png")); yield return null;
            rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0 && rec.collected > 0;
            File.WriteAllText(Path.Combine(output, "drop-smoke.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
    }
}
