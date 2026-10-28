using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-review-args-capture -output <dir> --unity-druid-remodel --unity-boss-direct 0`: proves the two review arguments with the real NativeGame. A new character goes through the
    // lobby API (the same entry the m1-check uses), then the run must start without the first practice, on the 1-1 gate tile, gate open, remodelled druid selected; the gate is walked and
    // the arena must open with the remodelled druid (12-move set, 4 root pillars). Receipt: <dir>/review-args.json, captures in <dir>/caps. Run isolated like the m1-check (-output).
    public sealed partial class NativeGame
    {
        [Serializable] sealed class ReviewCheck { public string name; public bool ok; public string note; }
        [Serializable] sealed class ReviewReceipt { public string scope; public List<ReviewCheck> checks = new List<ReviewCheck>(); public bool passed; }

        IEnumerator ReviewArgsCapture()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break;
            m1Caps = Path.Combine(output, "caps"); Directory.CreateDirectory(m1Caps);
            var rc = new ReviewReceipt { scope = "real NativeGame; args: druid-remodel " + NativeReviewArgs.DruidRemodel + ", boss-direct " + NativeReviewArgs.BossDirect };
            Action<string, bool, string> add = (n, ok, note) => rc.checks.Add(new ReviewCheck { name = n, ok = ok, note = note });
            Screen.SetResolution(1920, 1080, FullScreenMode.Windowed); yield return new WaitForSecondsRealtime(.5f);
            float deadline;

            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            { string fresh = "RV" + (DateTime.Now.Ticks % 100000).ToString("00000"); if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh); lobby.ShowLobby(); }
            bool entered = lobby.BeginCharacterEntry(false);
            deadline = Time.realtimeSinceStartup + 15; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < deadline) yield return null;
            lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            deadline = Time.realtimeSinceStartup + 12; while ((lobby.IsBlocking || frontendEntryInputFence) && Time.realtimeSinceStartup < deadline) yield return null;
            bool inGame = entered && !lobby.IsBlocking;
            add("reached gameplay from the lobby", inGame, "entered " + entered + ", blocking " + lobby.IsBlocking);
            if (!inGame) { yield return ReviewFinish(output, rc); yield break; }
            frontendEntryInputFence = false; Running = false; yield return null;

            var sim = Simulation; var flow = sim.Stage; var p = sim.Player;
            Debug.Log("review-capture: sim " + sim.GetHashCode() + " exits " + flow.Exits.Count + " player " + p.X + "," + p.Y + " practice " + (firstPractice != null) + " unlocked " + flow.BossUnlocked + " enabled " + flow.Enabled);
            add("--unity-druid-remodel: Simulation.DruidRemodel on, default setting still off", sim.DruidRemodel == NativeReviewArgs.DruidRemodel && !DruidRemodelSettings.Default, "sim " + sim.DruidRemodel + ", default " + DruidRemodelSettings.Default);
            add("--unity-boss-direct: first practice skipped", firstPractice == null == NativeReviewArgs.BossDirect, "practice " + (firstPractice != null ? "active" : "none"));
            if (NativeReviewArgs.BossDirect)
            {
                var gate = flow.Exits[1];
                bool onGate = Math.Abs(p.X - (gate.X + .5f) * 40) < 1 && Math.Abs(p.Y - (gate.Y + .5f) * 40) < 1;
                add("--unity-boss-direct: player on the gate tile, gate open, anglers counted done", onGate && flow.BossUnlocked && flow.FieldBossDone, "player " + p.X + "," + p.Y + " gate " + gate.X + "," + gate.Y + " unlocked " + flow.BossUnlocked + " anglers " + flow.FieldBossDone);
                yield return ReviewShot("rv1-boss-direct-start");
                int loadTicks = 0, guard = 0;
                while (flow.LoadPhase == 0 && !flow.InArena && guard++ < 120) StepInput(0, 0, p.X + 100, p.Y, false, false);
                bool loadStarted = flow.LoadPhase == 1;
                while (flow.LoadPhase != 2 && loadTicks++ < 400) StepInput(0, 0, p.X + 100, p.Y, false, false);
                for (int i = 0; i < 70; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
                yield return ReviewShot("rv2-arena-load-namecard");
                while (flow.LoadPhase != 0 && loadTicks++ < 800) StepInput(0, 0, p.X + 100, p.Y, false, false);
                for (int i = 0; i < 30; i++) StepInput(0, 0, p.X + 100, p.Y + 1, false, false);
                var boss = flow.FindBoss(); DruidData dd = null; bool hasData = boss != null && sim.Druid != null && sim.Druid.Data.TryGetValue(boss, out dd);
                add("the gate is walked and the boss arena opens", loadStarted && flow.InArena && boss != null && hasData, "load " + loadStarted + ", arena " + flow.InArena + ", boss " + (boss != null));
                if (hasData)
                {
                    bool rm = sim.Druid.Remodel, pillars = sim.Druid.Pillars.Count == 4;
                    add("arena fight uses the " + (NativeReviewArgs.DruidRemodel ? "remodelled" : "web-port") + " druid", rm == NativeReviewArgs.DruidRemodel && (!NativeReviewArgs.DruidRemodel || pillars), "Remodel " + rm + ", pillars " + sim.Druid.Pillars.Count + ", boss hp " + boss.Hp + "/" + boss.MaxHp);
                }
                for (int i = 0; i < 30; i++) StepInput(0, 0, p.X, p.Y - 100, false, false);
                yield return ReviewShot("rv3-arena-entry");
                if (hasData && NativeReviewArgs.DruidRemodel)
                {
                    // RB1-3: let the remodelled druid fight (the player stands 220 px from him, invulnerable, AI on) and shoot every telegraph kind once, in the middle of its warning
                    sim.Config.EnemyAiEnabled = true; p.X = boss.X; p.Y = boss.Y + 220;
                    var shot = new HashSet<string>(); var tl = new List<DruidTelegraph>(); int shots = 0, seenTicks = 0, maxList = 0;
                    for (int tk = 0; tk < 14000 && shots < 40; tk++)
                    {
                        p.Hp = p.MaxHp; p.Iframes = 600; p.Stamina = p.MaxStamina;
                        StepInput(0, 0, boss.X, boss.Y, false, false);
                        sim.DruidTelegraphs(tl); if (tl.Count > 0) seenTicks++; if (tl.Count > maxList) maxList = tl.Count;
                        foreach (var te in tl)
                        {
                            string key = te.MoveId + "-" + te.Kind + "-" + te.Shape + (te.Live ? "-live" : "");
                            bool mid = te.Live ? te.Progress > 40 : (te.Total > 0 && te.Elapsed >= te.Total * .6 && te.Remaining > 5);
                            if (shot.Contains(key) || !mid) continue;
                            shot.Add(key); shots++; yield return ReviewShot("tele-" + key); break;
                        }
                    }
                    add("RB1-3: telegraphs drawn by the view while the druid fought", teleView != null && teleView.SeenKinds.Count >= 6 && shots >= 6, shots + " shots, " + teleView.SeenKinds.Count + " move/kind/shape combinations seen, ticks with an entry " + seenTicks + ", most entries at once " + maxList + ": " + string.Join(", ", new List<string>(shot).ToArray()));
                }
            }
            yield return ReviewFinish(output, rc);
        }

        // world capture without a window: the world camera renders into a RenderTexture (the ScreenCapture of a windowless player writes nothing). The IMGUI HUD is not part of it.
        IEnumerator ReviewShot(string name)
        {
            UpdateViews(); yield return new WaitForEndOfFrame();
            const int W = 1920, H = 1080; var rt = new RenderTexture(W, H, 24, RenderTextureFormat.ARGB32); var tex = new Texture2D(W, H, TextureFormat.RGB24, false);
            var prevTarget = view.targetTexture; var prevActive = RenderTexture.active;
            view.targetTexture = rt; view.Render(); view.targetTexture = prevTarget;
            RenderTexture.active = rt; tex.ReadPixels(new Rect(0, 0, W, H), 0, 0); tex.Apply(); RenderTexture.active = prevActive;
            File.WriteAllBytes(Path.Combine(m1Caps, name + ".png"), tex.EncodeToPNG());
            UnityEngine.Object.Destroy(tex); rt.Release(); UnityEngine.Object.Destroy(rt);
        }

        IEnumerator ReviewFinish(string output, ReviewReceipt rc)
        {
            rc.passed = rc.checks.TrueForAll(c => c.ok);
            File.WriteAllText(Path.Combine(output, "review-args.json"), JsonUtility.ToJson(rc, true), new UTF8Encoding(false));
            yield return null; Application.Quit(rc.passed ? 0 : 1);
        }
    }
}
