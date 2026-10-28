using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
using Exoduser.UnityPort.Vfx;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class VfxCheckCase
        {
            public string name, signal, note;
            public int observed;
            public bool captured;
        }
        [Serializable] sealed class VfxCheckReceipt
        {
            public string scope = "RM-1 VFX presentation check; staged Core events and input; player visual verdict pending";
            public bool passed;
            public List<VfxCheckCase> cases = new List<VfxCheckCase>();
        }

        static readonly int[] VfxCheckTicks = { 2, 4, 6, 12, 21 };

        // RM-INT owns the NativeGame entry branch and passes its 3D camera.
        // This partial owns only the --unity-vfx-check scenario and capture code.
        // It cannot be run from the current 2D NativeGame without RM-INT wiring.
        IEnumerator VfxCheck(VfxBridge bridge, KiSlashVfxView ki, Camera renderCamera)
        {
            string output = Argument("-output");
            if (string.IsNullOrEmpty(output) || bridge == null || ki == null || renderCamera == null)
            {
                Debug.LogError("--unity-vfx-check requires -output, VfxBridge, KiSlashVfxView, and RM-INT 3D camera");
                Application.Quit(2); yield break;
            }
            Directory.CreateDirectory(output);
            AudioListener.pause = true;
            AudioListener.volume = 0;
            Running = false;
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed);
            yield return new WaitForSecondsRealtime(.3f);
            var rc = new VfxCheckReceipt();
            var sim = Simulation;
            sim.Config.EnemyAiEnabled = false;
            sim.Stage.Enabled = false;
            sim.Player.Iframes = 1e9f;
            sim.AttachDruidBoss();
            bridge.Bind(sim); ki.Bind(sim);

            // A: three tracked druid poison shots land together; one pool and
            // one chase zone burst. Three more real BossProjectile objects stay
            // on screen so the 1x crop can judge bullet readability.
            var d = sim.Druid;
            var shots = new List<BossProjectile>();
            float px = sim.Player.X, py = sim.Player.Y;
            for (int n = 0; n < 6; n++)
            {
                var shot = new BossProjectile { X = px + 65 + n * 20, Y = py - 40 + n * 10,
                    Vx = -2, Vy = 0, DruidPoison = true, Active = true, R = 8 };
                d.Projectiles.Add(shot); shots.Add(shot);
            }
            bridge.Pump();
            for (int n = 0; n < 3; n++) shots[n].Active = false;
            var pool = new PoisonPool { X = px + 100, Y = py, R = 140, MaxT = 90, T = 90 };
            var zone = new ChaseZone { X = px + 120, Y = py + 20, R = 100, Druid = true, Hit = true };
            var aoe = new ChaseAoe { Druid = true }; aoe.Zones.Add(zone);
            d.PoisonPools.Add(pool); d.ChaseAoes.Add(aoe);
            bridge.Pump();
            var aCase = new VfxCheckCase { name = "poison-A", signal = "3 shot landings + pool + chase", observed = bridge.LastPoisonBurstsA };
            rc.cases.Add(aCase);
            yield return StartCoroutine(VfxCheckTimeline(output, "poison-A", px + 100, py, renderCamera, bridge, ki, aCase));

            // B: actual SetMagicInput cycle, using the Core's MaliceOrbBlasts
            // counter. The three remaining enemy shots stay visible.
            sim.Player.State = "idle"; sim.Player.Mana = sim.Player.MaxMana;
            int beforeB = sim.MaliceOrbBlasts;
            for (int n = 0; n < 240 && sim.MaliceOrbBlasts == beforeB; n++)
            {
                VfxCheckTick(bridge, ki, true);
                if (n % 8 == 0) yield return null;
            }
            sim.SetMagicInput(false);
            var bCase = new VfxCheckCase { name = "poison-B", signal = "SetMagicInput -> MaliceOrbBlasts",
                observed = sim.MaliceOrbBlasts - beforeB };
            rc.cases.Add(bCase);
            if (bCase.observed > 0)
                yield return StartCoroutine(VfxCheckTimeline(output, "poison-B", sim.MaliceOrbLastX,
                    sim.MaliceOrbLastY, renderCamera, bridge, ki, bCase));

            // Ki: Core SpawnKiSlash is the numeric harness entry. Its projectile
            // must hit a real EnemyState and enqueue KiSlashHit. The 3rd-hit
            // charge sizes come from 40/80/120 Core charge ticks.
            int[] steps = { 1, 2, 3, 3, 3, 3 };
            float[] charge = { 0, 0, 0, 40, 80, 120 };
            for (int caseIndex = 0; caseIndex < steps.Length; caseIndex++)
            {
                foreach (var p in sim.Projectiles) p.Active = false;
                sim.Enemies.Clear(); sim.Player.State = "idle"; sim.Player.Facing = 0;
                var target = sim.SpawnEnemy(px + 65, py, 0, null, false);
                var check = new VfxCheckCase { name = "ki-" + steps[caseIndex] + "-tier-" + (int)(charge[caseIndex] / 40),
                    signal = "Core projectile -> KiSlashHit" };
                rc.cases.Add(check);
                if (target == null) { check.note = "enemy spawn failed"; continue; }
                target.Hp = target.MaxHp = 1000000;
                int beforeHit = ki.HitCount;
                sim.SpawnKiSlash(steps[caseIndex], charge[caseIndex]);
                for (int tick = 0; tick < 30 && ki.HitCount == beforeHit; tick++) VfxCheckTick(bridge, ki, false);
                check.observed = ki.HitCount - beforeHit;
                if (check.observed > 0)
                    yield return StartCoroutine(VfxCheckTimeline(output, check.name, target.X, target.Y,
                        renderCamera, bridge, ki, check));
            }

            foreach (var shot in shots) d.Projectiles.Remove(shot);
            d.PoisonPools.Remove(pool); d.ChaseAoes.Remove(aoe);
            rc.passed = rc.cases.TrueForAll(c => c.observed > 0 && c.captured);
            File.WriteAllText(Path.Combine(output, "vfx-check.json"), JsonUtility.ToJson(rc, true));
            yield return new WaitForSecondsRealtime(.5f); // allow screenshot writes to finish
            Application.Quit(rc.passed ? 0 : 2);
        }

        void VfxCheckTick(VfxBridge bridge, KiSlashVfxView ki, bool magic)
        {
            var sim = Simulation;
            sim.Stage.Enabled = false;
            sim.SetMagicInput(magic);
            sim.Tick(0, 0, sim.Player.X + 300, sim.Player.Y, false, false);
            while (sim.Feedback.Count > 0)
            {
                var e = sim.Feedback.Dequeue();
                impacts.Handle(e); sound.Handle(e); ki.Handle(e);
            }
            sound.Flush();
            bridge.Pump(); ki.Update(); UpdateViews();
        }

        IEnumerator VfxCheckTimeline(string output, string name, float coreX, float coreY,
            Camera camera, VfxBridge bridge, KiSlashVfxView ki, VfxCheckCase check)
        {
            for (int tick = 1; tick <= 21; tick++)
            {
                VfxCheckTick(bridge, ki, false);
                yield return new WaitForEndOfFrame();
                if (Array.IndexOf(VfxCheckTicks, tick) < 0) continue;
                string stem = name + "-t" + tick;
                ScreenCapture.CaptureScreenshot(Path.Combine(output, stem + "-1920x1080.png"));
                Vector3 screen = camera.WorldToScreenPoint(VfxWorld.ToWorld(coreX, coreY, 0.25f));
                if (screen.z <= 0) { check.note = "effect behind 3D camera"; continue; }
                int x = Mathf.Clamp(Mathf.RoundToInt(screen.x) - 200, 0, Screen.width - 400);
                int y = Mathf.Clamp(Mathf.RoundToInt(screen.y) - 200, 0, Screen.height - 400);
                var crop = new Texture2D(400, 400, TextureFormat.RGB24, false);
                crop.ReadPixels(new Rect(x, y, 400, 400), 0, 0);
                crop.Apply();
                File.WriteAllBytes(Path.Combine(output, stem + "-crop-1x.png"), crop.EncodeToPNG());
                Destroy(crop);
                check.captured = true;
            }
        }
    }
}
