using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

class DruidMovesetTests
{
    static int checks, failures;
    static void Near(double actual, double expected, string label)
    {
        checks++;
        if (Math.Abs(actual - expected) > .00001) { failures++; Console.WriteLine("FAIL " + label + " actual=" + actual + " expected=" + expected); }
    }
    static DruidData Data(string state, string move, double remaining)
    { return new DruidData { S = state, RmMoveId = move, St2 = remaining }; }
    static void Phase(string state, string move, string clip, int ticks, int slash = 0, int beat = 0)
    {
        var data = Data(state, move, ticks);
        data.RmTeleTotal = ticks; data.SlashIdx = slash; data.HbBeat = beat;
        if (state == "bossDruidDive") data.DiveMax = ticks;
        double previous = -1;
        for (int t = 0; t <= ticks; t++)
        {
            data.St2 = ticks - t;
            var plan = NativeDruidRigPolicy.Select(data, false, false, move);
            plan = NativeDruidMoveTiming.Recovery(plan, data, false, previous);
            Near(plan.Name == clip ? 1 : 0, 1, "clip " + clip);
            Near(plan.CoreTicks, ticks, "Core duration " + clip);
            Near(plan.Frame >= previous ? 1 : 0, 1, "monotonic " + clip);
            Near(data.St2, ticks - t, "read only " + clip);
            previous = plan.Frame;
        }
        Near(previous, NativeDruidRigPolicy.Frames(clip), "last pose " + clip);
    }
    static int Main()
    {
        // Rendering first sees the warning late. It must use Core age, never replay at full strength.
        Near(NativeDruidMoveTiming.ParryGlint(0), 0, "before telegraph onset");
        Near(NativeDruidMoveTiming.ParryGlint(2), 1, "Core onset at tick 2");
        Near(NativeDruidMoveTiming.ParryGlint(6.5), .140625, "late first sample is already fading");
        Near(NativeDruidMoveTiming.ParryGlint(11), 0, "first observation after window stays off");
        Near(NativeDruidMoveTiming.ParryGlint(80), 0, "warning never restarts");

        var feint = Data("bossRec", "charge", DruidRemodelData.FeintRecovery);
        var plan = NativeDruidRigPolicy.Select(feint, false, false, "charge");
        plan = NativeDruidMoveTiming.Recovery(plan, feint, true, -1);
        Near(plan.CoreTicks, 25, "feint uses its actual Core recovery");
        Near(plan.Frame, 0, "feint starts at beginning of recovery pose");
        feint.St2 = 0;
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(feint, false, false, "charge"), feint, true, -1);
        Near(plan.Frame, 70, "feint finishes authored recovery inside 25 ticks");

        var recovery = Data("bossRec", "slam", 46); // 30 ticks into the 76 tick recovery.
        var before = NativeDruidRigPolicy.Select(recovery, false, false, "slam");
        recovery.St2 += DruidRemodelData.ParryRecoveryBonus;
        recovery.RmBonusApplied = true;
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(recovery, false, false, "slam"), recovery, false, before.Frame);
        Near(plan.Frame, before.Frame, "late parry extension holds pose instead of rewinding");
        Near(recovery.St2, 76, "Core remaining counter is not written");
        recovery.St2 = 0;
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(recovery, false, false, "slam"), recovery, false, before.Frame);
        Near(plan.Frame, 70, "extended recovery still reaches its final pose");

        var escape = Data("recover", "grab", 40);
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(escape, false), escape, false, -1);
        Near(plan.Frame, 0, "escape entry pose");
        escape.St2 = 20; // StateSwitch clamps generic recover to 20 on its next tick.
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(escape, false), escape, false, -1);
        Near(plan.Frame, 0, "Core clamp does not skip half of escape clip");
        Near(plan.CoreTicks, 20, "escape clip fits actual clamped window");
        escape.St2 = 10;
        plan = NativeDruidMoveTiming.Recovery(NativeDruidRigPolicy.Select(escape, false), escape, false, -1);
        Near(plan.Frame, 40, "escape midpoint");
        Near(escape.St2, 10, "escape leaves Core untouched");

        // Current seven-move document table, including all three slash winds/actives.
        string[] ids = { "slashCombo", "slam", "charge", "grab", "burrowStrike", "groundFissure", "heartbeat" };
        int[] tele = { 36, 52, 58, 64, 56, 42, 90 }, rec = { 84, 76, 74, 84, 76, 60, 90 };
        int activeMoves = 0;
        foreach (var move in DruidRemodelData.Moves)
        {
            if (move.Phase.Length == 0) continue;
            activeMoves++;
            int index = Array.IndexOf(ids, move.Id);
            Near(index >= 0 ? 1 : 0, 1, "documented active move " + move.Id);
            if (index >= 0) { Near(move.Tele, tele[index], "document tele " + move.Id); Near(move.Rec, rec[index], "document rec " + move.Id); }
        }
        Near(activeMoves, 7, "complete active move coverage");
        for (int hit = 0; hit < 3; hit++)
        {
            Phase("bossSlashWind", "slashCombo", "slash" + (hit + 1) + "_tele", hit == 0 ? 36 : 26, hit);
            Phase("bossSlash", "slashCombo", "slash" + (hit + 1) + "_act", 10, hit);
        }
        Phase("bossRec", "slashCombo", "slash_rec", 84);
        Phase("bossSlamWind", "slam", "slam_tele", 52); Phase("bossSlam", "slam", "slam_act", 6); Phase("bossRec", "slam", "slam_rec", 76);
        Phase("bossChargeWind", "charge", "charge_tele", 58); Phase("bossCharge", "charge", "charge_run", 40); Phase("bossRec", "charge", "charge_rec", 74);
        Phase("bossGrabWind", "grab", "grab_tele", 64); Phase("bossGrabLunge", "grab", "grab_lunge", 20); Phase("bossGrab", "grab", "grab_hold", 120); Phase("bossRec", "grab", "grab_miss_rec", 84);
        Phase("bossDruidDive", "burrowStrike", "burrow_dive", 56); Phase("bossRec", "burrowStrike", "burrow_rec", 76);
        Phase("bossRmWind", "groundFissure", "fissure_tele", 42);
        Phase("bossHeartWind", "heartbeat", "heart_tele", 90); Phase("bossHeartWind", "heartbeat", "heart_beat", 60, 0, 1); Phase("bossHeartPause", "heartbeat", "heart_pause", 30); Phase("bossRec", "heartbeat", "heart_rec", 90);
        var fissure = Data("bossRec", "groundFissure", 60);
        Near(NativeDruidRigPolicy.Select(fissure, false).Name == "fissure_act" ? 1 : 0, 1, "instant fissure does not add a Core active window");
        fissure.St2 = 40;
        Near(NativeDruidRigPolicy.Select(fissure, false).Name == "fissure_rec" ? 1 : 0, 1, "fissure recovery tail after 20 ticks");
        var erupt = Data("bossDruidErupt", "burrowStrike", 6); erupt.EruptMax = 40; erupt.EruptHit = true;
        Near(NativeDruidRigPolicy.Select(erupt, false).Name == "burrow_erupt" ? 1 : 0, 1, "eruption hit boundary");
        using (var asset = JsonDocument.Parse(File.ReadAllText("unity/Assets/Exoduser/Resources/Art/Bosses/Druid/oldman-import.json")))
        {
            int count = 0;
            foreach (var clip in asset.RootElement.GetProperty("clips").EnumerateArray())
            {
                count++;
                Near(clip.GetProperty("duration").GetDouble() * 60, NativeDruidRigPolicy.Frames(clip.GetProperty("name").GetString()), "asset frame span");
            }
            Near(count, 38, "all source clips including seven move families and overlays");
        }

        Console.WriteLine("B1 focused timing: checks=" + checks + " failures=" + failures);
        return failures == 0 ? 0 : 1;
    }
}
