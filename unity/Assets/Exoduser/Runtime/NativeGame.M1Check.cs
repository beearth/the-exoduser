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
        [Serializable] sealed class M1Stage { public string id, name, status, note, capture, overlay; }
        [Serializable] sealed class M1Receipt { public string scope; public List<M1Stage> stages = new List<M1Stage>(); public string firstBlocked; public string device, deviceType, captureMode; public bool headless; public int guiRepaints, guiBridged; }
        M1Receipt m1; string m1Caps; int m1Index;

        // BX art: a stray OS key (ESC / TAB) during the unattended run must not leave the pause menu / a window over the comparison scenes
        void ArtScreenClear() { if (menu) { menu = false; pauseMenu.Reset(); Running = true; } if (inventory.Open) SetInventory(false); if (skills.Open) SetSkills(false); }
        // `--unity-mute` + -batchmode (no -nographics, so the GPU device stays): no window exists, so ScreenCapture has nothing to read. The shot is taken by rendering the world camera into a 1600x900
        // RenderTexture and reading it back. IMGUI (OnGUI, the whole HUD) is drawn into the same RenderTexture only if the player still sends Repaint events in batchmode; guiRepaints in
        // m1-check.json says whether it did (0 = the captures are world only, no HUD). Normal play and the windowed m1-check keep ScreenCapture.
        // Which UI was open when each capture was taken (pause menu / inventory / skills / stats / forge). A pause menu over a capture fails the stage (LT-2: focus loss paused the windowed run).
        readonly Dictionary<string, string> m1Overlays = new Dictionary<string, string>();
        static bool m1ModeFlag { get { return Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-m1-check") >= 0; } }
        string M1Overlay() { var o = new List<string>(); bool inLobby = lobby != null && lobby.IsBlocking; if (inLobby) o.Add("lobby"); else if (menu) o.Add("pause"); if (inventory.Open) o.Add("inventory"); if (skills.Open) o.Add("skills"); if (stats.Open) o.Add("stats"); if (forge.Open) o.Add("forge"); return string.Join(",", o.ToArray()); }
        bool m1Headless; RenderTexture m1GuiTarget; int m1GuiRepaints, m1GuiBridged;
        sealed class M1GuiProbe : MonoBehaviour { public NativeGame game; void OnGUI() { if (game != null && Event.current.type == EventType.Repaint) game.M1GuiRepaint(); } }
        internal void M1GuiRepaint()
        {
            m1GuiRepaints++;
            if (m1GuiTarget == null) return;
            var previous = RenderTexture.active;
            try { RenderTexture.active = m1GuiTarget; OnGUI(); m1GuiBridged++; } finally { RenderTexture.active = previous; m1GuiTarget = null; }
        }
        IEnumerator M1Shot(string name)
        {
            UpdateViews(); yield return new WaitForSecondsRealtime(.15f); yield return new WaitForEndOfFrame();
            m1Overlays[name] = M1Overlay();
            if (playerView != null) Debug.Log("[M1CAP] " + name + " player.enabled=" + playerView.enabled + " active=" + playerView.gameObject.activeInHierarchy + " sprite=" + (playerView.sprite != null) + " visibleToCamera=" + playerView.isVisible + " sort=" + playerView.sortingOrder + " pos=" + playerView.transform.position + " cam=" + view.transform.position + " alpha=" + playerView.color.a + " state=" + (Simulation != null ? Simulation.Player.State : "?") + " inArena=" + (Simulation != null && Simulation.Stage.InArena) + " focus=" + Application.isFocused + " guiRepaints=" + m1GuiRepaints);
            if (!m1Headless) { ScreenCapture.CaptureScreenshot(Path.Combine(m1Caps, name + ".png")); yield return null; yield break; }
            const int w = 1600, h = 900;
            var rt = RenderTexture.GetTemporary(w, h, 24, RenderTextureFormat.ARGB32);
            var previousTarget = view.targetTexture; var previousActive = RenderTexture.active; Texture2D tex = null;
            try
            {
                view.targetTexture = rt; view.Render(); view.targetTexture = previousTarget;
                m1GuiTarget = rt;                       // the next Repaint (if any) draws the IMGUI over this frame's world
            }
            catch (Exception e) { view.targetTexture = previousTarget; Debug.LogWarning("[M1] headless world render failed: " + e.Message); }
            yield return null; yield return new WaitForEndOfFrame();
            m1GuiTarget = null;
            try
            {
                RenderTexture.active = rt; tex = new Texture2D(w, h, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, w, h), 0, 0); tex.Apply();
                File.WriteAllBytes(Path.Combine(m1Caps, name + ".png"), tex.EncodeToPNG());
            }
            finally { RenderTexture.active = previousActive; RenderTexture.ReleaseTemporary(rt); if (tex != null) Destroy(tex); }
        }
        // status: "ok", "fail", "missing", "pending-core" (needs the boss Core, not a flow gap)
        void M1Add(string id, string name, string status, string note, string cap)
        {
            string ov; if (string.IsNullOrEmpty(cap) || !m1Overlays.TryGetValue(Path.GetFileNameWithoutExtension(cap), out ov)) ov = "";
            if (ov.Contains("pause") && status == "ok") { status = "fail"; note += " [pause menu was open over the capture " + cap + "]"; }
            m1.stages.Add(new M1Stage { id = id, name = name, status = status, note = note, capture = cap, overlay = ov });
            if (status != "ok" && status != "pending-core" && m1.firstBlocked == null) m1.firstBlocked = id + " " + name + " (" + status + "): " + note;
        }

        IEnumerator M1Check()
        {
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true;   // (always muted here; --unity-mute below is the explicit flag the build loop passes)
            bool mute = Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-mute") >= 0;
            if (mute) { AudioListener.volume = 0; AudioListener.pause = true; }
            Application.runInBackground = true;   // focus loss must not pause the unattended run (LT-2); NativeGame.OnApplicationFocus also skips the auto-pause in --unity-m1-check
            m1Headless = mute && Application.isBatchMode;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break;
            m1Caps = Path.Combine(output, "caps"); Directory.CreateDirectory(m1Caps);
            m1 = new M1Receipt { scope = "real NativeGame; lobby/story/practice through the lobby API, gameplay through Simulation.Tick (not OS input)" };
            m1.headless = m1Headless; m1.device = SystemInfo.graphicsDeviceName; m1.deviceType = SystemInfo.graphicsDeviceType.ToString(); m1.captureMode = m1Headless ? "headless-rendertexture-1600x900" : "screen-capture";
            { var probe = gameObject.AddComponent<M1GuiProbe>(); probe.game = this; }   // counts IMGUI Repaint events in every mode (guiRepaints in m1-check.json)
            if (!m1Headless) Screen.SetResolution(1600, 900, FullScreenMode.Windowed);
            yield return new WaitForSecondsRealtime(.5f);
            float deadline;

            // ---- 01 lobby -> warrior -> 1-1 ----
            lobby.ShowLobby(); yield return new WaitForSecondsRealtime(.6f);
            // Always a brand-new character: a roster/combat save left in <output> by an earlier run makes BeginCharacterEntry take the "continue" path (HasCombatSave), which skips the
            // story and the first practice arena (step 02 "not shown"). A fresh unique name has no combat save, so the new-character route is always walked.
            {
                string fresh = "M1" + (DateTime.Now.Ticks % 100000).ToString("00000");
                if (lobby.OpenCharacterCreation() && lobby.ChooseCharacterVisual(0) && lobby.ConfirmCharacterVisual()) lobby.CreateCharacter(fresh);
                lobby.ShowLobby();
            }
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
            {   // 02b: the fixed enemies of a fresh 1-1 (before the harness clears the field for the hand-spawned steps)
                int alive0 = 0, guards0 = 0; foreach (var en in sim.Enemies) { if (en.Alive) alive0++; if (en.IsGateGuard) guards0++; }
                bool startOk = sim.StartEyeMasses == 2 && sim.StartGuards == 1 && guards0 == 1 && sim.StartEscorts + sim.StartWave >= 8 && sim.Stage.TotalSpawned == sim.SpawnHoles.TotalPlanned;
                M1Add("02b", "1-1 start enemies (fixed)", startOk ? "ok" : "fail", alive0 + " alive at start: " + sim.StartEyeMasses + " 다안 육괴 + " + sim.StartGuards + " gate guard + " + sim.StartEscorts + " escorts + " + sim.StartWave + " wave (denominator " + sim.Stage.TotalSpawned + ", fixed enemies not counted); " + string.Join(" | ", sim.StartMobLog.ToArray()), "02-stage-1-1-entry.png");
            }
            sim.Config.EnemyAiEnabled = true; sim.Enemies.Clear(); sim.PotionState.Cooldown = 100000; sim.SpawnHoles = null;   // C01-AI: steps 03..09 spawn by hand; the 소환굴 field spawn has its own step (07c)
            Action<float> heal = hp => { if (p.Hp < hp) p.Hp = p.MaxHp; };

            // ---- 03 move ----
            float x0 = p.X, y0 = p.Y;
            for (int i = 0; i < 40; i++) StepInput(1, 0, p.X + 300, p.Y, false, false);
            for (int i = 0; i < 40; i++) StepInput(0, 1, p.X, p.Y + 300, false, false);
            float moved = Mathf.Sqrt((p.X - x0) * (p.X - x0) + (p.Y - y0) * (p.Y - y0));
            yield return M1Shot("03-move");
            M1Add("03", "move", moved > 100 ? "ok" : "fail", "moved " + moved.ToString("0") + " px in 80 ticks", "03-move.png");
            {   // 03b: the four 심연의 앵글러 stand on their sites from the first tick (web _FB_SITES; hp (1800 + lv * 350) * 7.5)
                var fbs = sim.FieldBosses; int n = 0; var sites = new List<string>();
                if (fbs != null) foreach (var a in fbs) if (a != null && a.Hp > 0) { n++; sites.Add("(" + (int)(a.X / 40) + "," + (int)(a.Y / 40) + ") el " + a.El + " hp " + a.Hp + " atk " + a.Atk + (a.Asleep ? " asleep" : " awake")); }
                bool fbOk = n == 4 && !sim.Stage.FieldBossDone && fbs[0].Hp == Simulation.FieldBossHp(p.Level);
                M1Add("03b", "abyssal anglers (4)", fbOk ? "ok" : "fail", n + " alive, field boss flag " + (sim.Stage.FieldBossDone ? "up" : "down") + ": " + string.Join(" | ", sites.ToArray()), "03-move.png");
            }

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
            int bashes0 = sim.BashStrikeCount; p.State = "idle"; p.Stamina = p.MaxStamina; sim.SetPlayerCombatInput(false, true, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool eDraw = p.State == "sDraw"; sim.SetPlayerCombatInput(false, false, false); StepInput(0, 0, p.X + 300, p.Y, false, false); bool eBash = p.State == "sBash";
            for (int i = 0; i < 60 && p.State != "idle"; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            M1Add("06", "parry (Q) and shield strike (E)", q && eDraw && eBash && sim.BashStrikeCount == bashes0 + 1 ? "ok" : "fail", "Q parry " + q + ", E sDraw " + eDraw + " sBash " + eBash + " strike " + (sim.BashStrikeCount - bashes0) + " hits " + sim.BashHitCount + "; E projectile reflection not ported (B07b doc), no sBlock/sBash sprite", "06-parry.png");

            // ---- 07 kill mobs (real hp, AI on) ----
            sim.Config.EnemyAiEnabled = true; sim.Enemies.Clear(); int killsBefore = sim.Kills; int lootBefore = sim.Loot.Count + sim.CollectedLoot.Count; int ticksUsed = 0; int hurt0 = sim.HurtCount; var ttks = new List<int>(); float hpStart = p.Hp;
            for (int k = 0; k < 3; k++)
            {
                var e = sim.SpawnNormalEnemy(p.X + 60 + k * 15, p.Y + k * 10); if (e == null) continue;
                int t0 = ticksUsed; for (int i = 0; i < 900 && e.Alive; i++) { StepInput(0, 0, e.X, e.Y, true, false); ticksUsed++; heal(p.MaxHp * .5f); hpStart = p.Hp; if (!e.Alive) break; }
                ttks.Add(ticksUsed - t0); yield return null;
            }
            yield return M1Shot("07-kill");
            int killed = sim.Kills - killsBefore;
            M1Add("07", "kill mobs", killed >= 1 ? "ok" : "fail", killed + "/3 killed (ticks per enemy " + string.Join(",", ttks.ToArray()) + ") at full enemy hp, loot rolls " + (sim.Loot.Count + sim.CollectedLoot.Count - lootBefore) + ", enemy hits landed on the player " + (sim.HurtCount - hurt0), "07-kill.png");

            // ---- 07b enemy attack hits the player (B09): etype0 contact attack -> shield first -> knock-back, shake, flash, floater, hit sound; second hit after the 40..60 tick cooldown; lethal hit -> fallen ----
            sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = true; p.Hp = p.MaxHp; p.Iframes = 0; p.State = "idle"; p.StateTicks = 0; p.KnockbackX = 0; p.KnockbackY = 0; p.Poise = 4;
            p.Shield = Mathf.Min(p.MaxShield, 40); sim.Feedback.Clear(); revive.Reset(); damage.Clear();   // clean capture: no floaters left over from the parry / kill steps
            var attacker = sim.SpawnNormalEnemy(p.X + 70, p.Y); if (attacker == null) attacker = sim.SpawnNormalEnemy(p.X - 70, p.Y);
            var floaters = new List<string>(); Action<ReviveText> catchText = t => floaters.Add(t.Ko); sim.ReviveTextRaised += catchText;
            int soundsBefore = sound.Receipt.requested, hurtBefore = sim.HurtCount; float hpBefore2 = p.Hp, shBefore = p.Shield;
            int firstHit = -1, secondHit = -1; float kbMag = 0, shakeAtHit = 0, flashAtHit = 0, hpAfter = p.Hp, shAfter = p.Shield; string stateAfter = p.State; bool captured = false;
            if (attacker != null) { attacker.Alerted = true; attacker.StateTicks = 0; }
            for (int i = 0; i < 900 && attacker != null && secondHit < 0; i++)
            {
                int hurtsPre = sim.HurtCount; float shPrev = p.Shield; StepInput(0, 0, p.X + 300, p.Y, false, false);
                if (sim.HurtCount > hurtsPre)
                {
                    if (firstHit < 0) { firstHit = i; shBefore = shPrev; hpAfter = p.Hp; shAfter = p.Shield; stateAfter = p.State; kbMag = Mathf.Sqrt(p.KnockbackX * p.KnockbackX + p.KnockbackY * p.KnockbackY); shakeAtHit = sim.ShakeAmount; flashAtHit = sim.ScreenFlashAlpha; if (!captured) { captured = true; yield return M1Shot("07b-enemy-hit"); } }
                    else secondHit = i;
                }
                if (p.Hp < p.MaxHp * .5f) p.Hp = p.MaxHp;
            }
            sim.ReviveTextRaised -= catchText;
            bool hitOk = firstHit >= 0 && (shAfter < shBefore || hpAfter < hpBefore2) && (shBefore <= 0 || hpAfter >= hpBefore2 - 1) && kbMag > .5f && shakeAtHit >= 3 && flashAtHit > .2f && sound.Receipt.requested > soundsBefore && floaters.Count > 0;
            // lethal: no shield, 1 hp -> the next contact hit lets the player fall (A21 death flow takes over)
            sim.Enemies.Clear(); p.Shield = 0; p.Hp = 1; p.Iframes = 0; p.State = "idle"; p.StateTicks = 0;
            var killer = sim.SpawnNormalEnemy(p.X + 60, p.Y); if (killer != null) { killer.Alerted = true; killer.StateTicks = 0; }
            int fallTick = -1; for (int i = 0; i < 400 && killer != null && p.State != "fallen"; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); if (p.State == "fallen") fallTick = i; }
            bool fell = p.State == "fallen";
            sim.Enemies.Clear(); p.State = "idle"; p.StateTicks = 0; p.Hp = p.MaxHp; p.Iframes = 0; p.KnockbackX = 0; p.KnockbackY = 0; p.Poise = 4;   // back to a living player for the next steps (the fallen -> death flow is covered by the revive smoke)
            int gap = secondHit >= 0 && firstHit >= 0 ? secondHit - firstHit : -1;
            M1Add("07b", "enemy attack hits the player", hitOk && fell && (gap < 0 || (gap >= 40 && gap <= 200)) ? "ok" : "fail",
                "etype0 contact hit after " + firstHit + " ticks: shield " + shBefore.ToString("0") + " -> " + shAfter.ToString("0") + ", hp " + hpBefore2.ToString("0") + " -> " + hpAfter.ToString("0") + ", state " + stateAfter + ", knock-back " + kbMag.ToString("0.0") + " px/tick, shake " + shakeAtHit.ToString("0.0") + ", red flash " + flashAtHit.ToString("0.00") + ", floaters [" + string.Join(",", floaters.ToArray()) + "], hit sounds " + (sound.Receipt.requested - soundsBefore) + ", landed hits " + (sim.HurtCount - hurtBefore) + ", next hit after " + gap + " ticks; lethal hit at 1 hp -> fallen " + fell + " (tick " + fallTick + "). Not ported: etype0 field projectile (60f charge ring + shot, needs the enemy-projectile / projectile-parry owner), chromatic pulse, particles",
                "07b-enemy-hit.png");

            // ---- 07c natural 1-1 field spawn (C01-AI): the player walks up to a 소환굴, the pool summons mixed etypes and each runs its own AI ----
            {
                sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = true; sim.EnableFieldSpawns(); p.Hp = p.MaxHp; p.Iframes = 99999; p.Shield = p.MaxShield;
                var c7_hole = SpawnHoleSystem.Stage0Holes[7]; float c7_hx = (float)c7_hole[0], c7_hy = (float)c7_hole[1];   // size .5 hole at (5620,1820): 15 summons
                float c7_sx = c7_hx - 260, c7_sy = c7_hy + 200; for (int k = 0; k < 30 && !Map.CanMove(c7_sx, c7_sy, 10); k++) { c7_sx -= 20; c7_sy -= 20; }
                p.X = c7_sx; p.Y = c7_sy; int c7_ticks = 0, c7_peak = 0, c7_shots0 = sim.ShotsFired; var c7_etypes = new SortedDictionary<int, int>(); var c7_states = new SortedDictionary<string, int>();
                float c7_travelled = 0; var c7_last = new Dictionary<int, Vector2>(); bool c7_aiFrame = false, c7_midFrame = false;
                while (c7_ticks++ < 1800)
                {
                    StepInput(0, 0, p.X + 1, p.Y, false, false); p.Hp = p.MaxHp; p.Iframes = 99999;
                    int c7_alive = 0; foreach (var e in sim.Enemies) { if (!e.Alive) continue; c7_alive++; c7_states[e.State] = c7_states.ContainsKey(e.State) ? c7_states[e.State] + 1 : 1; Vector2 c7_pos; if (c7_last.TryGetValue(e.Id, out c7_pos)) c7_travelled += Mathf.Abs(e.X - c7_pos.x) + Mathf.Abs(e.Y - c7_pos.y); c7_last[e.Id] = new Vector2(e.X, e.Y); }
                    c7_peak = Mathf.Max(c7_peak, c7_alive);
                    if (!c7_midFrame && sim.Enemies.Count >= 6) { c7_midFrame = true; yield return M1Shot("07c-field-spawn"); }
                    if (!c7_aiFrame && c7_ticks > 700 && sim.Enemies.Count >= 8) { c7_aiFrame = true; yield return M1Shot("07c-field-ai"); }
                }
                foreach (var e in sim.Enemies) { int k7 = e.Etype; c7_etypes[k7] = c7_etypes.ContainsKey(k7) ? c7_etypes[k7] + 1 : 1; }
                bool c7_distinct = c7_etypes.Count >= 3; bool c7_spawned = sim.Enemies.Count >= 8; bool c7_didMove = c7_travelled > 500;
                var c7_typeList = new List<string>(); foreach (var kv7 in c7_etypes) c7_typeList.Add(kv7.Key + "x" + kv7.Value);
                var c7_stateList = new List<string>(); foreach (var kv7 in c7_states) c7_stateList.Add(kv7.Key + ":" + kv7.Value);
                M1Add("07c", "natural field spawn + enemy AI", c7_spawned && c7_distinct && c7_didMove ? "ok" : "fail",
                    "소환굴 (" + c7_hx + "," + c7_hy + ") woke at 2000 px: " + sim.Enemies.Count + " enemies in " + c7_ticks + " ticks (peak alive " + c7_peak + ", stage total " + sim.Stage.TotalSpawned + "), etypes [" + string.Join(" ", c7_typeList.ToArray()) + "], states seen {" + string.Join(" ", c7_stateList.ToArray()) + "}, travelled " + c7_travelled.ToString("0") + " px, enemy shots " + (sim.ShotsFired - c7_shots0) + ", holes left " + (sim.SpawnHoles != null ? sim.SpawnHoles.Holes.Count : 0),
                    "07c-field-spawn.png");
                sim.SpawnHoles = null; sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = true; p.Iframes = 0; p.Hp = p.MaxHp;
                sim.Stage.TotalSpawned = 0;
                {   // 07d: the walk to the hole passes the north-east angler's lair - it wakes (1000 px), rises, hits back
                    int awake = 0, standing = 0; if (sim.FieldBosses != null) foreach (var a in sim.FieldBosses) if (a != null && !a.Asleep) { awake++; if (!a.Hid) standing++; }
                    M1Add("07d", "abyssal angler wakes near the hole", sim.FieldBossAnnounced && awake >= 1 ? "ok" : "fail", awake + " awake (" + standing + " standing), announced " + sim.FieldBossAnnounced + ", contact hits on the player " + sim.FieldBossPlayerHits.Count + ", energy balls " + sim.FieldBossEnergyShots + ", landing slams " + sim.FieldBossSlams, "07c-field-spawn.png");
                }
                // the 소환굴 walk ends 320 px from the north-east abyssal angler (148,42), which now wakes and hits back (M1-REGION R-B): steps 08..09b go on from the start spot, away from the anglers
                p.X = Map.Data.startX; p.Y = Map.Data.startY; p.KnockbackX = 0; p.KnockbackY = 0; p.State = "idle"; p.StateTicks = 0; p.Iframes = 0;
            }

            // ---- 07e field enemy bullets (VFX-D18): one of each kind standing still beside the player, drawn by the field bullet view (07c-field-ai showed them as a lime plate) ----
            {
                var dr = sim.Druid; sim.Enemies.Clear(); sim.Config.EnemyAiEnabled = false; p.Iframes = 1e9f;
                if (dr != null && bossView != null)
                {
                    dr.Projectiles.Clear();
                    Action<double, double, int, string, double> shot = (dx, dy, el, cls, sz) => dr.Projectiles.Add(new BossProjectile { X = p.X + dx, Y = p.Y + dy, Vx = 3, Vy = 0, Sz = sz, R = 4, El = el, ParryClass = cls, Life = 1e6, Ml = 1e6, RedBean = cls == "physical" });
                    for (int i = 0; i < 3; i++) shot(-300 + i * 150, -230, 0, "physical", 2);                    // E-parry bullets: the toothed mouth
                    dr.Projectiles.Add(new BossProjectile { X = p.X + 150, Y = p.Y - 230, Vx = 3, Vy = 0, Sz = 1.5, R = 4, Web = true, ParryClass = "forbidden", Life = 1e6, Ml = 1e6 });   // web bullet: mouth
                    for (int el = 1; el <= 6; el++) shot(-450 + (el - 1) * 150, -90, el, "magic", 2);        // magic bullets: the comet tinted per element
                    for (int el = 1; el <= 6; el++) dr.Projectiles.Add(new BossProjectile { X = p.X - 560 + (el - 1) * 230, Y = p.Y + 90, Vx = 3, Vy = 0, Sz = 18, R = 4, El = el, ElemBall = true, ParryClass = "forbidden", Life = 1e6, Ml = 1e6 });   // element balls: the orb sheet
                    dr.Projectiles.Add(new BossProjectile { X = p.X, Y = p.Y + 260, Vx = 3, Vy = 0, Sz = 2, R = 4, BlackBean = true, ParryClass = "magic", Life = 1e6, Ml = 1e6 });   // rainbow bean: the untinted comet
                }
                yield return M1Shot("07e-field-bullets");
                int mouths = bossView != null ? bossView.FieldMouthsDrawn : -1, comets = bossView != null ? bossView.FieldCometsDrawn : -1, orbs = bossView != null ? bossView.FieldOrbsDrawn : -1, fall = bossView != null ? bossView.FieldBulletFallbacks : -1;
                bool bulletsOk = mouths == 4 && comets == 7 && orbs == 6 && fall == 0;
                M1Add("07e", "field enemy bullets drawn per kind (VFX-D18)", bulletsOk ? "ok" : "fail", "mouths " + mouths + "/4, element comets " + comets + "/7, element orbs " + orbs + "/6, fallback dots " + fall + " (the druid poison orb is not used for field bullets)", "07e-field-bullets.png");
                if (dr != null) dr.Projectiles.Clear();
            }

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

            // ---- 09b skill use (B03; placed after the loot / level-up steps so its random draws and kills do not shift the earlier stages): spike trap (1), giant slam (Space), holy dome (F) and ice orb (Ctrl) through the same SetSkillInput entry FixedUpdate uses ----
            levelUp.Hide(); sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.Loot.Clear(); p.State = "idle"; p.Iframes = 0; p.Hp = p.MaxHp * .6f; p.Stamina = p.MaxStamina; p.Mana = p.MaxMana; sim.Materials = Math.Max(sim.Materials, 100);
            var skA = sim.SpawnNormalEnemy(p.X + 130, p.Y); var skB = sim.SpawnNormalEnemy(p.X - 160, p.Y + 40);
            Action<bool, bool, bool, bool> skPress = (d1, sp, fk, ct) => {
                sim.SetSkillInput(false, false, false, false, false, false, false, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
                sim.SetSkillInput(d1, false, false, false, sp, fk, ct, false); StepInput(0, 0, p.X + 300, p.Y, false, false);
                sim.SetSkillInput(false, false, false, false, false, false, false, false); };
            int skMats0 = sim.Materials; int skHpA = skA != null ? skA.Hp + (int)skA.Shield : 0, skKills0 = sim.Kills;
            // the malice cost is read right after the cast frames: a trap DOT kill later in the window pays the web kill malice (hurtE 42699 death -> G.mats+=4, 43307; DOT is not excepted), and whether the DOT kills within 70 ticks depends on the random stream (O-1 09b)
            skPress(true, false, false, false); int skCost = skMats0 - sim.Materials; for (int i = 0; i < 70; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool spikeOk = sim.FireZones.Exists(z => z.Type == "spikeTrap") && skA != null && skA.Hp + (int)skA.Shield < skHpA && skCost == 5; int skKillsW = sim.Kills - skKills0;
            yield return M1Shot("09b-skill-spike-trap");
            p.Stamina = p.MaxStamina; int slamMats0 = sim.Materials; skPress(false, true, false, false); for (int i = 0; i < 6; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool slamOk = sim.SlamWaves.Count == 1 && sim.GiantSlamCd > 1700 && p.Stamina < p.MaxStamina - 40;   // malice: the slam kills the spike-trapped enemy (+4 each), so the cost is checked by the sim test yield return M1Shot("09b-skill-giant-slam");
            for (int i = 0; i < 40; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            float domeHp0 = p.Hp; skPress(false, false, true, false); for (int i = 0; i < 60; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool domeOk = sim.FireZones.Exists(z => z.Type == "holyDome") && p.Hp > domeHp0 + 10 && sim.HolyDomeCd > 0; yield return M1Shot("09b-skill-holy-dome");
            // holy dome vs enemy bullets (web: zone drawn under the bullets, which must stay readable): 4 inert druid poison bullets around the player; needs the druid Core, which only exists in the arena
            if (sim.Druid != null)
            {
                var domeBullets = new List<BossProjectile>(); var domeIf0 = p.Iframes; p.Iframes = 600;
                foreach (var o in new[] { new[] { -150f, -210f }, new[] { 190f, -70f }, new[] { -260f, 120f }, new[] { 60f, 250f } })
                    domeBullets.Add(new BossProjectile { X = p.X + o[0], Y = p.Y + o[1], Vx = 0, Vy = 0, Dmg = 0, Sz = 5, R = 4, Life = 6000, Ml = 6000, DruidPoison = true, ParryClass = "physical", Active = true });
                sim.Druid.Projectiles.AddRange(domeBullets);
                yield return M1Shot("09b-skill-holy-dome-bullets");
                foreach (var b in domeBullets) { b.Active = false; sim.Druid.Projectiles.Remove(b); }
                p.Iframes = domeIf0;
            }
            else Debug.Log("[m1] 09b-skill-holy-dome-bullets skipped: sim.Druid is null (no druid Core in the field map)");
            float orbMp0 = p.Mana; skPress(false, false, false, true); for (int i = 0; i < 40; i++) StepInput(0, 0, p.X + 300, p.Y, false, false);
            bool orbIn = sim.IceOrbActive && p.State == "iceOrb" && p.Mana < orbMp0 - 40; yield return M1Shot("09b-skill-ice-orb");
            for (int i = 0; i < 90; i++) { StepInput(0, 0, p.X + 300, p.Y, false, false); if (i == 8) yield return M1Shot("09b-skill-ice-shatter"); }
            bool orbOk = orbIn && !sim.IceOrbActive && p.State == "idle" && sim.IceOrbCd > 0;
            sim.SkillBlades.Clear(); sim.FireZones.Clear(); sim.SlamWaves.Clear(); sim.Enemies.Clear(); sim.SpikeTrapCd = sim.GiantSlamCd = sim.HolyDomeCd = sim.IceOrbCd = 0; p.State = "idle"; p.Hp = p.MaxHp; p.Stamina = p.MaxStamina; p.Mana = p.MaxMana;
            M1Add("09b", "skill use (1 / Space / F / Ctrl)", spikeOk && slamOk && domeOk && orbOk ? "ok" : "fail", "spike trap " + spikeOk + " (zone, malice " + skCost + ", DOT, kills in window " + skKillsW + "), giant slam " + slamOk + " (wave, malice 10, cd 1800), holy dome " + domeOk + " (zone, regen), ice orb " + orbOk + " (MP 50, orb -> auto shatter); " + sim.SkillCastCount + " casts, denied " + sim.SkillDeniedCount, "09b-skill-spike-trap.png");

            // ---- 09c LT-10: exercise the real regional kill and angler death paths; never set the gate or field-boss flags by hand. ----
            levelUp.Hide(); sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.Loot.Clear();
            var flow = sim.Stage; bool sealedAtSparseKills = !flow.BossUnlocked && !flow.FieldBossDone && sim.Regions != null && sim.RegionClearedCount() < 4;
            int planned = 0; if (sim.Regions != null) foreach (var region in sim.Regions) planned += region.Total;
            flow.TotalSpawned = planned;   // 07c reset the harness denominator to zero; the field's actual 14-hole plan is 168.
            float[][] spots = { new[] { 2420f, 2420f }, new[] { 5620f, 1820f }, new[] { 2980f, 6740f }, new[] { 5620f, 6420f } };
            bool regionKillsReached = sim.Regions != null;
            if (sim.Regions != null) for (int regionId = 0; regionId < sim.Regions.Length; regionId++)
            {
                var region = sim.Regions[regionId]; int required = (int)Math.Ceiling(region.Total * Simulation.RegionClearRatio - 1e-9); int gateAttempts = 0;
                while (region.Kills < required && gateAttempts++ < required * 40)
                {
                    float x = spots[regionId][0] + (gateAttempts % 8) * 37, y = spots[regionId][1] + (gateAttempts / 8 % 5) * 37;
                    var enemy = sim.SpawnEnemy(x, y, 0, null, false);
                    if (enemy == null) continue;
                    if (sim.RegionIdxAt(enemy.HomeX, enemy.HomeY) != regionId) { enemy.Alive = false; sim.Enemies.Remove(enemy); continue; }
                    sim.HarnessKill(enemy);   // same kill/RegKill path as an actual lethal hit, without inflating TotalSpawned
                }
                if (region.Kills < required) regionKillsReached = false;
            }
            sim.Enemies.Clear(); sim.Loot.Clear(); p.Iframes = 99999;
            for (int i = 0; i < 60; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);
            bool anglersStillBlock = !flow.BossUnlocked && !flow.FieldBossDone && sim.RegionClearedCount() == 0;
            bool anglerHits = sim.FieldBosses != null && sim.FieldBosses.Length == 4;
            for (int k = 0; k < 4 && anglerHits; k++)
            {
                var angler = sim.FieldBosses[k]; if (angler == null) { anglerHits = false; break; }
                p.X = (float)angler.X + 500; p.Y = (float)angler.Y; p.Iframes = 99999;
                for (int i = 0; i < 70; i++) StepInput(0, 0, p.X, p.Y, false, false);
                anglerHits = sim.HurtFieldMobs(angler.X, angler.Y, 10, 1e9, null);
                for (int i = 0; i < 30; i++) StepInput(0, 0, p.X, p.Y, false, false);
            }
            bool naturalUnlock = sealedAtSparseKills && regionKillsReached && anglersStillBlock && anglerHits && flow.FieldBossDone && sim.FieldBossAliveCount() == 0 && sim.RegionClearedCount() == 4 && flow.BossUnlocked;
            M1Add("09c", "LT-10 regional Hell Gate", naturalUnlock ? "ok" : "fail", "sparse kills sealed " + sealedAtSparseKills + ", real kill thresholds reached " + regionKillsReached + ", all four living anglers still blocked " + anglersStillBlock + ", four angler hit paths " + anglerHits + ", all dead " + flow.FieldBossDone + ", regions " + sim.RegionClearedCount() + "/4, naturally unlocked " + flow.BossUnlocked + "; stage kills " + flow.StageKills + "/" + flow.TotalSpawned + " (harness combat, not OS input)", "");
            if (!naturalUnlock) { yield return M1Finish(output); yield break; }
            sim.Enemies.Clear(); sim.Loot.Clear(); p.Hp = p.MaxHp;
            // ---- 10..13 boss arena / boss / kill + exit / stage clear (C07). ----
            string unlockNote = "gate naturally opened by 4/4 regions and all four angler deaths";
            // the field route (~7000 px of forest) is not walked: the player is placed on the gate approach, like the web's own checkRooms would see him
            var gate = flow.Exits[1]; p.X = (gate.X + .5f) * 40; p.Y = (gate.Y + .5f) * 40; p.Hp = p.MaxHp; p.Iframes = 600;
            int guardTicks = 0; while (flow.LoadPhase == 0 && !flow.InArena && guardTicks++ < 120) StepInput(0, 0, p.X + 100, p.Y, false, false);
            bool loadStarted = flow.LoadPhase == 1; int loadTicks = 0;
            while (flow.LoadPhase != 2 && loadTicks++ < 400) StepInput(0, 0, p.X + 100, p.Y, false, false);
            for (int i = 0; i < 70; i++) StepInput(0, 0, p.X + 100, p.Y, false, false);   // name card fully faded in (35 ticks)
            yield return M1Shot("10a-arena-load-namecard");
            while (flow.LoadPhase != 0 && loadTicks++ < 800) StepInput(0, 0, p.X + 100, p.Y, false, false);
            for (int i = 0; i < 30; i++) StepInput(0, 0, p.X + 100, p.Y + 1, false, false);
            var bossActor = flow.FindBoss(); if (bossActor != null) { p.X = bossActor.X; p.Y = bossActor.Y + 220; }   // capture only: the web's ?bosstest places the player at the boss's feet; the real entrance is ~2000 px away
            StepInput(0, 0, p.X, p.Y - 100, false, false); yield return new WaitForSecondsRealtime(2.3f);   // boss bar intro (2.0 s real time)
            yield return M1Shot("10-arena-entry-boss-bar");
            bool arenaOk = loadStarted && flow.InArena && flow.Arena != null && bossActor != null && bossBar.Active && arenaView != null && chunks.Count == 0 && !sim.CanMove(0, 0, 15) && sim.CanMove((flow.Arena.EntryX + .5f) * 40, (flow.Arena.EntryY + .5f) * 40, 15);
            M1Add("10", "boss arena entry", arenaOk ? "ok" : "fail", "exit tile -> fade -> name card -> arena " + BossArenaLayout.Width + "x" + BossArenaLayout.Height + " (type " + flow.Arena?.Type + ") -> player at the 6 o'clock entrance, boss at the centre, boss bar shown; " + unlockNote + "; load ticks " + loadTicks + "; field map, props and chunks swapped out", "10a-arena-load-namecard.png, 10-arena-entry-boss-bar.png");

            // ---- BX art: deterministic comparison scenes against the web (AI off, nothing floating): idle druid + poison volley, pools + orbs, final sink at tick 20 ----
            DruidData cdd; DruidBoss cap = sim.Druid;
            if (bossActor != null && cap != null && cap.Data.TryGetValue(bossActor, out cdd))
            {
                string s0 = cdd.S; double st0 = cdd.St2, f0 = cdd.Facing; float bf0 = bossActor.Facing, py0 = p.Y; string bst0 = bossActor.State; float bstt0 = bossActor.StateTicks;
                cdd.S = "idle"; cdd.St2 = 9999; cdd.Facing = Math.PI / 2; bossActor.Facing = (float)(Math.PI / 2); bossActor.State = "idle"; bossActor.StateTicks = 9999;
                p.X = bossActor.X; p.Y = bossActor.Y + 330; p.Iframes = 600;
                float[][] vol = { new[] { -420f, 180 }, new[] { -250f, 260 }, new[] { -90f, 300 }, new[] { 90f, 300 }, new[] { 250f, 260 }, new[] { 420f, 180 }, new[] { -330f, 40 }, new[] { 330f, 40 } };
                cap.Projectiles.Clear(); cap.Orbs.Clear(); cap.LavaPools.Clear(); cap.PoisonPools.Clear(); cap.ChaseAoes.Clear(); cap.Fissures.Clear(); cap.TideWaves.Clear(); cap.SeekerMines.Clear();
                for (int i = 0; i < 150; i++) { cdd.S = "idle"; cdd.St2 = 9999; StepInput(0, 0, p.X, p.Y - 100, false, false); }   // let the arena-entry screen flash fade (tick based)
                cap.Projectiles.Clear(); cap.Orbs.Clear(); cap.LavaPools.Clear(); cap.PoisonPools.Clear(); cap.ChaseAoes.Clear(); cap.Fissures.Clear(); cap.TideWaves.Clear(); cap.SeekerMines.Clear(); cdd.S = "idle"; cdd.St2 = 9999; p.X = bossActor.X; p.Y = bossActor.Y + 330;
                foreach (var o in vol) cap.Projectiles.Add(new BossProjectile { X = bossActor.X + o[0], Y = bossActor.Y + o[1], Sz = 5, R = 4, DruidPoison = true, ParryClass = "physical", Active = true });
                damage.Clear(); ArtScreenClear(); yield return M1Shot("art-a-idle-volley"); cap.Projectiles.Clear();
                cap.LavaPools.Add(new LavaPool { X = bossActor.X + 40, Y = bossActor.Y + 330, R = 300, T = 150, WarnT = 60, MaxT = 1e9 });
                cap.PoisonPools.Add(new PoisonPool { X = bossActor.X - 380, Y = bossActor.Y + 160, R = 175, T = 60, MaxT = 1e9 });
                cap.Orbs.Add(new DruidOrb { X = bossActor.X + 420, Y = bossActor.Y - 20, R = 40, T = 30 }); cap.Orbs.Add(new DruidOrb { X = bossActor.X + 500, Y = bossActor.Y + 150, R = 40, T = 50 });
                damage.Clear(); ArtScreenClear(); yield return M1Shot("art-b-pools-orbs"); cap.LavaPools.Clear(); cap.PoisonPools.Clear(); cap.Orbs.Clear();
                var corpse = new EnemyState { Id = 99999, IsBoss = true, SinkDruid = true, Alive = false, X = bossActor.X, Y = bossActor.Y, Radius = bossActor.Radius, Hp = 0, MaxHp = 1 };
                int bossIdx = sim.Enemies.IndexOf(bossActor); sim.Enemies.Remove(bossActor); sim.Enemies.Add(corpse); UpdateViews();
                for (int i = 0; i < 20; i++) StepInput(0, 0, p.X, p.Y - 100, false, false);
                damage.Clear(); ArtScreenClear(); yield return M1Shot("art-c-sink"); sim.Enemies.Remove(corpse); sim.Enemies.Insert(Math.Min(Math.Max(bossIdx, 0), sim.Enemies.Count), bossActor); UpdateViews();
                cdd.S = s0; cdd.St2 = st0; cdd.Facing = f0; bossActor.Facing = bf0; bossActor.State = bst0; bossActor.StateTicks = bstt0; p.Y = bossActor.Y + 220; p.Iframes = 0;
            }

            // ---- 11 druid boss fight (BX-02/03/05): the real 23-move AI runs; the player stands in the open and is healed every tick so the fight can be observed ----
            sim.Config.EnemyAiEnabled = true; var druid = sim.Druid; var moveStates = new HashSet<string>(); int maxPhase = 0, maxShots = 0, fightHurt0 = sim.HurtCount, shotCaptures = 0, hazardCaptures = 0, poolCaptures = 0, fightTicks = 0;
            float hpBefore = bossActor != null ? bossActor.Hp : 0; float shieldBefore = bossActor != null ? bossActor.Shield : 0; bool deathNoted = false;
            if (bossActor != null) { p.X = bossActor.X + 260; p.Y = bossActor.Y; }
            while (druid != null && bossActor != null && fightTicks++ < 2600 && bossActor.Alive)
            {
                p.Hp = p.MaxHp; p.Shield = p.MaxShield; if (fightTicks > 420) p.Iframes = 600;   // first 420 ticks: let hits land (the point is to see the moves hit); afterwards untouchable so the captures stay readable
                StepInput(0, 0, bossActor.X, bossActor.Y, false, false);
                DruidData dd; if (druid.Data.TryGetValue(bossActor, out dd)) { if (dd.S != "idle" && dd.S != "recover" && dd.S != "bossRec") moveStates.Add(dd.S); maxPhase = Math.Max(maxPhase, dd.BossPhase); }
                int shots = 0; foreach (var pr in druid.Projectiles) if (pr.Active) shots++; maxShots = Math.Max(maxShots, shots);
                if (shots >= 8 && shotCaptures < 1 && fightTicks > 480) { shotCaptures++; yield return M1Shot("11a-druid-volley"); }
                int hazards = druid.LavaPools.Count + druid.Fissures.Count + druid.TideWaves.Count + druid.SeekerMines.Count + druid.PoisonPools.Count;
                if (hazards > 0 && hazardCaptures < 1 && fightTicks > 540) { hazardCaptures++; yield return M1Shot("11b-druid-hazards"); }
                // BX art: the natural run never reaches the pool moves, so one lava pool + one poison pool are placed by hand to see the web's poison-pool atlas clip, then removed again
                if (fightTicks == 500 && poolCaptures < 1 && bossActor != null)
                {
                    druid.LavaPools.Add(new LavaPool { X = bossActor.X + 40, Y = bossActor.Y + 330, R = 300, T = 150, WarnT = 60, MaxT = 1e9 });
                    druid.PoisonPools.Add(new PoisonPool { X = bossActor.X - 380, Y = bossActor.Y + 160, R = 175, T = 60, MaxT = 1e9 });
                    p.X = bossActor.X; p.Y = bossActor.Y + 260; poolCaptures = 1; yield return null; yield return M1Shot("11c-druid-pools");
                    druid.LavaPools.Clear(); druid.PoisonPools.Clear();
                }
                if (fightTicks % 170 == 0) sim.HurtEnemy(bossActor, (int)Math.Max(1, bossActor.MaxShield * .22f + bossActor.MaxHp * .06f));   // walk the HP phases
                if (maxPhase >= 3 && fightTicks > 900 && shotCaptures > 0 && hazardCaptures > 0 && (poolCaptures > 0 || fightTicks > 2000)) break;
                if (fightTicks % 30 == 0) yield return null;
            }
            bool fightOk = druid != null && moveStates.Count >= 6 && maxPhase >= 2 && maxShots >= 4 && sim.HurtCount > fightHurt0;
            M1Add("11", "druid boss fight", fightOk ? "ok" : "fail", "real 23-move druid AI (BX-02/03/05): " + moveStates.Count + " distinct move states [" + string.Join(",", moveStates) + "], hp phase " + maxPhase + ", bullets in flight up to " + maxShots + ", the player was hit " + (sim.HurtCount - fightHurt0) + "x (hp " + hpBefore + " shield " + shieldBefore + " -> " + (bossActor != null ? bossActor.Hp + " / " + bossActor.Shield : "-") + "), " + druid.Spawned + " bullets spawned, " + druid.Dropped + " dropped by the 1/3 rule; moves are oracle-checked (unity/Tools/druid-boss-oracle)", "11a-druid-volley.png");

            // ---- 12 kill + sink: the final death of the 1-1 druid is a sink into the ground; the exit opens after the judged revive timer ----
            int kills = 0, killGuard = 0; int sinkSeenAt = -1;
            while (flow.BossAlive && killGuard++ < 4000)
            {
                p.Hp = p.MaxHp;
                if (bossActor != null && bossActor.Alive) { sim.HurtEnemy(bossActor, bossActor.MaxHp * 4); kills++; }
                StepInput(0, 0, p.X + 100, p.Y, false, false);
                if (bossActor != null && !bossActor.Alive && bossActor.SinkDruid && sinkSeenAt < 0) { sinkSeenAt = killGuard; p.X = bossActor.X; p.Y = bossActor.Y + 240; p.Iframes = 600; }
            }
            bool sunk = bossActor != null && !bossActor.Alive && bossActor.SinkDruid;
            if (sunk) { p.X = bossActor.X; p.Y = bossActor.Y + 240; p.Iframes = 600; for (int k = 0; k < 90; k++) { StepInput(0, 0, bossActor.X, bossActor.Y, false, false); if (k == 6) yield return M1Shot("12a-druid-sink-start"); if (k == 40) yield return M1Shot("12b-druid-sink-mid"); } }   // the sink plays on the render frames after the final death (66 tick body, 18 hold, 18 fade)
            int open = 0; while (flow.Exits.Count == 0 && open++ < 500) StepInput(0, 0, p.X + 100, p.Y, false, false);
            StepInput(0, 0, p.X + 100, p.Y, false, false);
            yield return new WaitForSecondsRealtime(.8f);
            p.X = (flow.Arena.ExitX + .5f) * 40; p.Y = (flow.Arena.ExitY + 4.5f) * 40;   // in sight of the opened exit
            StepInput(0, 0, p.X, p.Y - 100, false, false); yield return M1Shot("12-boss-dead-exit-open");
            bool exitOpen = !flow.BossAlive && flow.Exits.Count == 1 && flow.Arena.Tile(flow.Arena.ExitX, flow.Arena.ExitY) == 0 && !bossBar.Active;
            M1Add("12", "boss kill and sink", exitOpen && sunk ? "ok" : "fail", "killed with " + kills + " lethal hit(s) (immediate revive rolls included) -> bossAlive=false -> druid sink " + (sunk ? "set" : "MISSING") + " (STY-D9: 66-tick body, 18 hold, 18 fade, no death texts) -> exit tiles opened (" + (exitOpen ? "verified" : "FAILED") + "), boss bar hidden, loot " + sim.Loot.Count + " dropped", "12-boss-dead-exit-open.png");

            p.X = (flow.Arena.ExitX + .5f) * 40; p.Y = (flow.Arena.ExitY + .5f) * 40; int clearTicks = 0;
            while (!flow.StageCleared && clearTicks++ < 120) StepInput(0, 0, p.X, p.Y - 100, false, false);
            yield return new WaitForSecondsRealtime(.9f); yield return M1Shot("13-stage-clear");
            M1Add("13", "stage clear", flow.StageCleared && stageClear.Active && exitOpen ? "ok" : "fail", "exit step -> +10 SP -> stage-clear panel (kills " + flow.StageKills + "/" + flow.TotalSpawned + ", clear time " + flow.BossClearSeconds + "s); next area 1-2 is not ported: the Next button saves and returns to the lobby", "13-stage-clear.png");
            stageClear.Hide();

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
            m1.guiRepaints = m1GuiRepaints; m1.guiBridged = m1GuiBridged;
            {   // 99: no capture of the whole run sits under the pause menu (art-* shots belong to no stage, so they are checked here)
                var paused = new List<string>(); foreach (var kv in m1Overlays) if (kv.Value.Contains("pause")) paused.Add(kv.Key);
                M1Add("99", "captures free of the pause menu", paused.Count == 0 ? "ok" : "fail", m1Overlays.Count + " captures, " + (paused.Count == 0 ? "none under the pause menu" : "pause menu over: " + string.Join(", ", paused.ToArray())), "");
            }
            File.WriteAllText(Path.Combine(output, "m1-check.json"), JsonUtility.ToJson(m1, true), new UTF8Encoding(false));
            yield return null; Application.Quit(0);
        }
    }
}
