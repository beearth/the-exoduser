using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // C07: view / HUD side of the 1-1 progress flow. The rules live in Core/StageFlow.cs (Simulation.Stage); this file turns its events into what the player sees:
    // black load screen + boss name card, arena floor, boss bar, "exit opened" text, the stage-clear panel. The boss itself is a plug-in
    // (Simulation.Stage.BossSpawners[stageIndex] = spawner); until the boss Core registers one the Hell Gate holds with a "boss battle pending" notice.
    public sealed partial class NativeGame
    {
        sealed class WorldText { public float x, y, until; public string text; public Color color; }
        readonly List<WorldText> worldTexts = new List<WorldText>();
        NativeArenaView arenaView; bool arenaViewWasOpen;
        public NativeBossBar.Input LastBossBarInput; public bool BossBarShown;
        Font stageFontNanum, stageFontCinzel;
        bool English { get { return lobby != null && lobby.Language != "ko"; } }

        void WorldTextAdd(float x, float y, string ko, string en, Color color, float seconds = 1.6f)
        {
            string text = English ? en : ko;
            worldTexts.RemoveAll(t => t.text == text);   // the same notice is not stacked while the player keeps standing on the gate
            worldTexts.Add(new WorldText { x = x, y = y, text = text, color = color, until = Time.unscaledTime + seconds });
        }

        // Hooks the Core flow to this run: original exit/gate tiles, the abyssal angler (not ported) counted as done, Core enabled outside the first practice.
        void StageFlowAttach()
        {
            var flow = Simulation.Stage;
            flow.InitializeField(Map.Data.tiles, Map.Data.width);
            flow.Enabled = firstPractice == null;
            DestroyArenaView();BossViewAttach();   // BX: druid boss behind the BossSpawners extension point + its view
            foreach (var r in props) if (r != null) r.enabled = true;
            worldTexts.Clear(); bossBar.Hide(); BossBarShown = false; stageClear.OnNext = StageClearNext;
            RegionHudAttach();
        }

        // Called after every Simulation.Tick (FixedUpdate and the harness StepInput).
        void StageFlowPump()
        {
            var flow = Simulation.Stage; var p = Simulation.Player;
            while (flow.Events.Count > 0)
            {
                var e = flow.Events.Dequeue();
                switch (e.Kind)
                {
                    case StageEventKind.GateUnlocked:
                        WorldTextAdd(e.X, e.Y - 60, "지옥문이 열렸습니다", "The Hell Gate has opened", new Color(.55f, .75f, .95f), 3f); break;
                    case StageEventKind.GateSealed:        // web 42106 addTxt: the floating text is not on the web's draw whitelist (55092-55100: only 시전/그로기/무적/CRIT/사망/탈출 pass outside the test bed),
                    case StageEventKind.GateAnglerBlocked: // so the web player only sees the portal label ("▼ 지옥문 봉인 (지역 N/4) ▼", NativeRegionHud.DrawGateLabel); the event stays for logs / harness
                        break;
                    case StageEventKind.AnglerWoke: case StageEventKind.AnglerSlain: AnglerEvent(e); break;
                    case StageEventKind.BossCoreMissing:
                        WorldTextAdd(e.X, e.Y - 40, "보스전 이식 대기 — 아레나는 아직 열리지 않습니다", "Boss battle not ported yet — the arena stays closed", new Color(.78f, .7f, .55f), 2.2f); break;
                    case StageEventKind.ArenaLoadStart:
                        sound.Reset(); break;
                    case StageEventKind.ArenaEntered:
                        worldTexts.Clear(); WorldTextAdd(p.X, p.Y - 50, "봉인됨!", "Sealed!", new Color(.75f, .45f, .95f), 1.6f); break;
                    case StageEventKind.BossDefeated:
                        WorldTextAdd(p.X, p.Y - 40, "출구가 열렸다!", "The exit is open!", new Color(.5f, .85f, .55f), 2.6f); break;
                    case StageEventKind.ExitOpened:
                        Toast("보스 처치 · 출구가 열렸다"); break;
                    case StageEventKind.StageCleared:
                        WorldTextAdd(p.X, p.Y - 60, "+10 SP", "+10 SP", new Color(.27f, 1f, .67f), 2f);
                        stageClear.Show(NativeStageClearOverlay.WithAutoPotion(new NativeStageClearOverlay.Input {
                            kind = NativeStageClearOverlay.Kind.Zone, hellIndex = 0, stageIndex = Simulation.Config.StageIndex,
                            clearSeconds = flow.BossClearSeconds, totalSpawned = flow.TotalSpawned, stageKills = flow.StageKills, deaths = deathCount, bossKilled = true
                        }, Simulation.PotionState));
                        RequestCombatSave(); break;
                    case StageEventKind.FieldRestored:
                        worldTexts.Clear(); break;
                }
            }
            worldTexts.RemoveAll(t => Time.unscaledTime > t.until);
            RegionHudTick();
        }

        // Boss bar: web 35966-35972 shows it as soon as a boss exists (the bar owns the 2 s intro); it stays off the black load screen.
        void StageFlowBossBar()
        {
            var flow = Simulation.Stage; EnemyState boss = flow.InArena && (flow.LoadPhase == 0 || flow.LoadPhase == 4) ? flow.FindBoss() : null;
            if (boss == null) { if (BossBarShown) { bossBar.Hide(); BossBarShown = false; } return; }
            var input = new NativeBossBar.Input {
                name = bossBar.BossNameForStage(Simulation.Config.StageIndex) ?? "???", hp01 = boss.MaxHp > 0 ? Mathf.Clamp01((float)boss.Hp / boss.MaxHp) : 0,
                poise01 = boss.MaxPoise > 0 ? Mathf.Clamp01(boss.Poise / boss.MaxPoise) : 0, state = NativeBossBar.PoiseState.Normal
            };
            if (boss.Stunned > 0) { input.state = NativeBossBar.PoiseState.Groggy; input.stateRatio01 = boss.MaxStunned > 0 ? Mathf.Clamp01(boss.Stunned / boss.MaxStunned) : 0; input.stateSeconds = boss.Stunned / 60f; }
            LastBossBarInput = input; bossBar.Show(input); BossBarShown = true;
        }

        // Keeps the floor / props / enemy and drop views in step with Simulation.Stage.InArena (also after a death retry).
        void StageFlowSyncViews()
        {
            var flow = Simulation.Stage;
            Remodel3DSync();   // RM-INT: remodel 3D layer on/off (no-op without --remodel3d)
            if (flow.InArena && arenaView == null)
            {
                foreach (var c in chunks.Values) { Destroy(c.renderer.gameObject); ReleaseSprites(c.path); }
                chunks.Clear();
                foreach (var r in props) if (r != null) r.enabled = false;
                foreach (var ev in enemies.Values) { Destroy(ev.body.gameObject); Destroy(ev.walk.gameObject); }
                enemies.Clear(); damage.Clear(); ClearDropViews(); kiView?.Reset(); impacts?.Reset();
                arenaView = new NativeArenaView(transform, flow.Arena); arenaView.Rebuild(false, 0, 0); arenaViewWasOpen = false;
            }
            else if (!flow.InArena && arenaView != null)
            {
                DestroyArenaView();
                foreach (var r in props) if (r != null) r.enabled = true;
                foreach (var ev in enemies.Values) { Destroy(ev.body.gameObject); Destroy(ev.walk.gameObject); }
                enemies.Clear(); damage.Clear(); ClearDropViews(); renderedTick = -1;
            }
            if (arenaView != null && !arenaViewWasOpen && flow.Exits.Count > 0)
            {
                var ex = flow.Exits[0]; arenaView.Rebuild(true, ex.X, ex.Y); arenaViewWasOpen = true;
            }
        }

        void DestroyArenaView() { if (arenaView != null) { arenaView.Dispose(); arenaView = null; } arenaViewWasOpen = false; }

        // OnGUI: black load screen with the boss name card (web 52238-52271), world notices, the exit marker.
        void StageFlowDrawWorld()
        {
            var flow = Simulation.Stage;
            regionHud.DrawWorld(Simulation);   // gate portal label (web 52269)
            foreach (var t in worldTexts)
            {
                var pt = ToGUI(t.x, t.y); float a = Mathf.Clamp01((t.until - Time.unscaledTime) / .5f);
                var c = t.color; c.a = a; var st = center; var keep = st.normal.textColor;
                st.normal.textColor = new Color(0, 0, 0, .85f * a); GUI.Label(new Rect(pt.x - 301, pt.y - 49, 600, 40), t.text, st);
                st.normal.textColor = c; GUI.Label(new Rect(pt.x - 300, pt.y - 50, 600, 40), t.text, st); st.normal.textColor = keep;
            }
            if (flow.InArena && flow.Exits.Count > 0 && !flow.StageCleared)
            {
                var ex = flow.Exits[0]; var pt = ToGUI((ex.X + .5f) * 40, (ex.Y + .5f) * 40 - 34);
                var keep = center.normal.textColor; center.normal.textColor = new Color(.85f, .55f, .3f, .95f);
                GUI.Label(new Rect(pt.x - 60, pt.y - 20, 120, 40), English ? "EXIT" : "출구", center); center.normal.textColor = keep;
            }
        }
        void StageFlowDrawLoad()
        {
            var flow = Simulation.Stage;
            if (flow.LoadPhase > 0)
            {
                float fade = (float)flow.LoadFade; Fill(new Rect(0, 0, 1920, 1080), new Color(0, 0, 0, fade));
                if (flow.LoadPhase >= 2 && fade > .5f)
                {
                    float nt = flow.LoadPhase == 2 ? Mathf.Min(1f, (float)flow.LoadT / 35f) : 1f;
                    if (stageFontNanum == null) { stageFontNanum = Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular") ?? font; }
                    Fill(new Rect(1920 * .15f, 1080 * .46f, 1920 * .70f, 1), new Color(.533f, .4f, .2f, .35f * nt));
                    Fill(new Rect(1920 * .15f, 1080 * .60f, 1920 * .70f, 1), new Color(.533f, .4f, .2f, .35f * nt));
                    DiamondMark(960, 1080 * .46f, new Color(.667f, .467f, .267f, .25f * nt)); DiamondMark(960, 1080 * .60f, new Color(.667f, .467f, .267f, .25f * nt));
                    string name = bossBar.BossNameForStage(Simulation.Config.StageIndex) ?? "???";
                    var st = new GUIStyle(GUI.skin.label) { font = stageFontNanum, fontSize = 40, fontStyle = FontStyle.Bold, alignment = TextAnchor.MiddleCenter };
                    st.normal.textColor = new Color(0, 0, 0, .8f * nt); GUI.Label(new Rect(0, 1080 * .53f - 30 + 2, 1920, 60), name, st);
                    st.normal.textColor = new Color(.867f, .667f, .333f, nt); GUI.Label(new Rect(0, 1080 * .53f - 30, 1920, 60), name, st);
                    var sub = new GUIStyle(st) { fontSize = 15, fontStyle = FontStyle.Normal };
                    sub.normal.textColor = new Color(.533f, .467f, .4f, .5f * nt); GUI.Label(new Rect(0, 1080 * .64f - 12, 1920, 24), StageSubtitle(Simulation.Config.StageIndex), sub);
                }
            }
        }
        static void DiamondMark(float x, float y, Color c)
        {   // web fillRect 8x8 rotated 45 degrees: approximated by a 3-row stack (GUI cannot rotate cheaply), 1px hairline scale
            Fill(new Rect(x - 1, y - 4, 2, 8), c); Fill(new Rect(x - 3, y - 2, 6, 4), c); Fill(new Rect(x - 4, y - 1, 8, 2), c);
        }
        // STG[si].kr = HELL_THEMES[hell][0].kr + ' ' + (floor+1) + '구역'. Unity has one chapter (stage 0) so far.
        string StageSubtitle(int si) { return si == 0 ? (English ? "Rotten Forest Zone 1" : "썩은 숲 1구역") : ""; }

        // "다음 구역으로 ▶": the next area (1-2) is not ported, so the run is saved and the player returns to the lobby.
        void StageClearNext()
        {
            stageClear.Hide(); Toast("다음 구역은 아직 이식되지 않았습니다 — 저장하고 로비로 돌아갑니다");
            SaveCombatNow(); Running = false; menu = true; sound.Reset(); pauseMenu.Reset(); lobby.ShowLobby();
        }
        bool PointerOverStageClear()
        {
            if (!stageClear.Active) return false;
            float s = Mathf.Min(Screen.width / 1920f, Screen.height / 1080f);
            float x0 = (Screen.width - 1920 * s) / 2 + 850 * s, y0 = (Screen.height - 1080 * s) / 2 + 956 * s; var m = Input.mousePosition;
            return m.x >= x0 && m.x <= x0 + 220 * s && Screen.height - m.y >= y0 && Screen.height - m.y <= y0 + 44 * s;
        }

        // Death retry inside the arena (web retryBtn): back to the field gate with full resources; the field is not regenerated.
        bool RetryInsideArena()
        {
            if (!Simulation.Stage.InArena) return false;
            var p = Simulation.Player; Simulation.Stage.LeaveArenaToField();
            p.Hp = p.MaxHp; p.Mana = p.MaxMana; p.Stamina = p.MaxStamina; p.Shield = p.MaxShield; p.State = "idle"; p.StateTicks = 0; p.Iframes = 120;
            death.Hide(); deathShown = false; bossBar.Hide(); BossBarShown = false; skillInputFence = true; menu = false; Running = true;
            return true;
        }
    }
}
