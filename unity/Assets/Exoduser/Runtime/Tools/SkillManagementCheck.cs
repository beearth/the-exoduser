using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // 자기 숨은 Player 창에만 WM 메시지를 전달한다. 전역 입력·사용자 캐릭터·일반 실행은 건드리지 않는다.
    internal sealed class SkillManagementCheck : MonoBehaviour
    {
        const string Flag = "--unity-skill-management-check";
        [Serializable] sealed class Check { public string 항목, 상세; public bool 통과; }
        [Serializable] sealed class Receipt
        {
            public string 범위 = "실제 Player·자기 숨은 창 WM 마우스→기존 IMGUI 버튼·격리 캐릭터 저장·새 프로세스 복원. 실제 손조작·자연 전투와 별도", 단계, 저장경로, 고정스킬;
            public bool passed; public int failures, 누름, 해제, Layout, Repaint, SP, 악의, 지옥강타, 얼음보주;
            public string[] 숫자슬롯; public List<Check> 검사 = new List<Check>();
        }
        static string Arg(string name) { var a = Environment.GetCommandLineArgs(); int i = Array.IndexOf(a, name); return i >= 0 && i + 1 < a.Length ? a[i + 1] : null; }
        static bool Has(string name) { return Array.IndexOf(Environment.GetCommandLineArgs(), name) >= 0; }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)] static void Mute() { if (Has(Flag)) { AudioListener.volume = 0; AudioListener.pause = true; } }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)] static void Boot() { if (Has(Flag)) new GameObject("격리 스킬 관리 검수").AddComponent<SkillManagementCheck>(); }
        NativeGame game; NativeLobby lobby; NativeSkills skills; string output, phase; Receipt receipt = new Receipt(); bool failed;
        static FieldInfo Field(object o, string name) { return o.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic); }
        static object Get(object o, string name) { return Field(o, name).GetValue(o); }
        static void Set(object o, string name, object value) { Field(o, name).SetValue(o, value); }
        static object Call(object o, string name, params object[] args) { return o.GetType().GetMethod(name, BindingFlags.Instance | BindingFlags.NonPublic).Invoke(o, args); }
        void CheckThat(bool ok, string label, string detail = "") { receipt.검사.Add(new Check { 통과 = ok, 항목 = label, 상세 = detail }); if (!ok) throw new InvalidOperationException(label + " " + detail); }
        void Save()
        {
            var s = game?.Simulation; receipt.단계 = phase; receipt.passed = !failed && receipt.검사.Count > 0; receipt.failures = failed ? 1 : 0;
            if (s != null) { receipt.SP = s.Player.StatPoints; receipt.악의 = s.Materials; receipt.지옥강타 = s.Skills.Level("giantSlam"); receipt.얼음보주 = s.Skills.Level("iceOrb"); receipt.고정스킬 = s.Skills.CtSkill; receipt.숫자슬롯 = (string[])s.Skills.Slots.Clone(); }
            File.WriteAllText(Path.Combine(output, "스킬관리-" + phase + ".json"), JsonUtility.ToJson(receipt, true));
        }
        IEnumerator Start()
        {
            output = Arg("-output"); phase = Arg("-skill-phase");
            if (!NativeQaSandbox.Active || string.IsNullOrEmpty(output) || !Path.IsPathRooted(output) || (phase != "write" && phase != "read" && phase != "verify")) { Application.Quit(3); yield break; }
            Directory.CreateDirectory(output); yield return Guard(Run());
        }
        IEnumerator Guard(IEnumerator run)
        {
            while (true)
            {
                bool more = false; object value = null; Exception error = null;
                try { more = run.MoveNext(); if (more) value = run.Current; } catch (Exception e) { error = e; }
                if (error != null) { failed = true; receipt.검사.Add(new Check { 통과 = false, 항목 = "검수 예외", 상세 = error.ToString() }); Save(); if (lobby != null) lobby.CloseStartupCaptureMedia(); Application.Quit(2); yield break; }
                if (!more) yield break;
                if (value is IEnumerator nested) { yield return Guard(nested); if (failed) yield break; } else yield return value;
            }
        }
        IEnumerator Open(int windowSlot)
        {
            Call(game, "SetSkills", false, 6); Set(game, "menu", false); Set(game, "gameFocused", true); Set(game, "frontendEntryInputFence", false);
            Call(game, "SetSkills", true, windowSlot); Set(game, "<Running>k__BackingField", false); yield return new WaitForSecondsRealtime(.2f); yield return new WaitForEndOfFrame();
            CheckThat(skills.Open && skills.SelectedSlot == windowSlot, "실제 창 슬롯 선택 " + windowSlot);
        }
        IEnumerator SelectOrb(string id)
        {
            var defs = (SkillDefsFile)Get(skills, "defs"); SkillDefsOrb orb = null;
            foreach (var candidate in defs.slots[skills.SelectedSlot].orbs) if (candidate.id == id) { orb = candidate; break; }
            CheckThat(orb != null, "실제 구슬 정의 " + id); yield return Click(393 + orb.x, 295.64f + orb.y, "구슬-" + id);
            CheckThat((string)Get(skills, "selectedOrb") == id, "실제 구슬 클릭 선택 " + id);
        }
        IEnumerator Run()
        {
            float until = Time.realtimeSinceStartup + 30; while (NativeGame.Instance == null && Time.realtimeSinceStartup < until) yield return null;
            game = NativeGame.Instance; CheckThat(game != null, "현재 NativeGame"); lobby = game.GetComponent<NativeLobby>(); yield return null;
            CheckThat(lobby.CharacterStoreDirectory == Path.Combine(NativeQaSandbox.Root, "character-roster-v1"), "명시적 격리 캐릭터 저장");
            Screen.SetResolution(1600, 900, FullScreenMode.Windowed); lobby.ShowLobby(); yield return null;
            if (phase == "write")
            {
                CheckThat(lobby.Characters.Count == 0, "신규 검수 전용 캐릭터 목록"); lobby.OpenCharacterCreation(); lobby.ConfirmCharacterVisual(); CheckThat(lobby.CreateCharacter("스킬왕복"), "격리 캐릭터 생성"); lobby.ShowLobby();
            }
            else CheckThat(lobby.Characters.Count == 1 && lobby.Characters.SelectedName == "스킬왕복" && game.HasCombatSave("스킬왕복"), "새 프로세스의 실제 캐릭터·전투 저장");
            CheckThat(lobby.BeginCharacterEntry(false), "일반 캐릭터 진입");
            if (phase == "write")
            {
                until = Time.realtimeSinceStartup + 12; while (lobby.StartupCaptureState.Page != FrontendEntryPage.Nemesis && Time.realtimeSinceStartup < until) yield return null;
                lobby.StartupCaptureState.Skip(); yield return null; lobby.StartupCaptureState.Skip(); yield return null;
            }
            until = Time.realtimeSinceStartup + 10; while ((lobby.IsBlocking || (bool)Get(game, "frontendEntryInputFence")) && Time.realtimeSinceStartup < until) yield return null;
            CheckThat(!lobby.IsBlocking, "실제 필드 진입"); if (Get(game, "firstPractice") != null) Call(game, "EndFirstPractice", true);
            Set(game, "frontendEntryInputFence", false); Set(game, "gameFocused", true); Set(game, "<Running>k__BackingField", false); game.enabled = true;
            skills = (NativeSkills)Get(game, "skills"); var s = game.Simulation; s.Config.EnemyAiEnabled = false; s.Enemies.Clear(); s.SpawnHoles = null;
            if (phase == "write")
            {
                s.Player.Level = 100; s.Player.StatPoints = 40; s.Materials = 1000; CheckThat(game.SaveCombatNow(), "검수 초기 상태 실제 저장");
                yield return Open(12); yield return Click(117, 602, "강화+" ); CheckThat(s.Skills.Level("giantSlam") == 2 && s.Player.StatPoints == 39, "실제 강화+ 버튼");
                CheckThat((bool)Get(game, "combatPending") || (long)Get(game, "combatRevision") > 1, "버튼에서 실제 저장 요청");
                yield return Click(214, 602, "강화−"); CheckThat(s.Skills.Level("giantSlam") == 1 && s.Player.StatPoints == 40, "실제 강화 감소·SP환급");
                yield return Click(303, 602, "리셋열기"); CheckThat((string)Get(skills, "pendingReset") == "giantSlam", "실제 리셋 확인창"); yield return Shot("리셋-확인창");
                yield return Click(914, 634, "리셋취소"); CheckThat(Get(skills, "pendingReset") == null && s.Skills.Level("giantSlam") == 1 && s.Player.StatPoints == 40, "리셋 취소·수치 보존");
                yield return Click(303, 602, "리셋재열기"); yield return Click(1166, 634, "리셋확인"); CheckThat(s.Skills.Level("giantSlam") == 0 && s.Player.StatPoints == 50 && s.Skills.Slots[4] == null, "리셋 확인·SP10·슬롯 해제"); yield return Shot("지옥강타-미습득");
                yield return Click(117, 602, "지옥강타재학습"); CheckThat(s.Skills.Level("giantSlam") == 1 && s.Player.StatPoints == 40 && s.Materials == 940 && s.Skills.Slots[4] == "giantSlam", "재학습 SP10·악의60·Space자동 배정");
                yield return Open(11); yield return Click(303, 602, "얼음리셋열기"); yield return Click(1166, 634, "얼음리셋확인"); CheckThat(s.Skills.Level("iceOrb") == 0 && s.Skills.CtSkill == "ghostWalk" && s.Player.StatPoints == 50, "얼음보주 리셋·원문 Ctrl 폴백");
                yield return Click(117, 602, "얼음재학습"); CheckThat(s.Skills.Level("iceOrb") == 1 && s.Skills.CtSkill == "ghostWalk" && s.Player.StatPoints == 40 && s.Materials == 890, "얼음 재학습이 Ctrl을 자동 덮어쓰지 않음"); yield return Shot("얼음재학습-고정슬롯보존");
                yield return Open(1); yield return SelectOrb("spikeTrap"); yield return Click(216, 658, "가시덫재배정"); CheckThat(s.Skills.Slots[0] == null && s.Skills.Slots[1] == "spikeTrap", "실제 장착 버튼·중복 숫자슬롯 제거"); yield return Shot("가시덫-2번슬롯");
                yield return Open(7); yield return Click(117, 602, "합체강화"); CheckThat(s.Skills.Level("maliceSwipe") == 2 && s.Skills.Level("shieldThrow") == 2 && s.Player.StatPoints == 38, "합체 두 구성원 실제 강화·SP2");
                yield return Click(214, 602, "합체감소"); CheckThat(s.Skills.Level("maliceSwipe") == 1 && s.Skills.Level("shieldThrow") == 1 && s.Player.StatPoints == 40, "합체 두 구성원 감소·SP2환급");
            }
            else
            {
                CheckThat(game.CombatSaveRestored && s.Player.Level == 100 && s.Player.StatPoints == 40 && s.Materials == (phase=="verify"?840:890), "새 프로세스 레벨·SP·악의 복원");
                CheckThat(s.Skills.Level("giantSlam") == 1 && s.Skills.Level("iceOrb") == 1 && s.Skills.Slots[0] == (phase=="verify"?"spikeTrap":null) && s.Skills.Slots[1] == (phase=="verify"?null:"spikeTrap"), "새 프로세스 스킬·재배정 슬롯 복원");
                CheckThat(s.Skills.CtSkill == "iceOrb", "새 프로세스 진입의 원문 기본 Ctrl 보정", s.Skills.CtSkill);
                if (phase == "read") {
                    yield return Open(11); yield return Click(303,602,"복원후얼음리셋"); yield return Click(1166,634,"복원후얼음리셋확인");
                    CheckThat(s.Skills.CtSkill=="ghostWalk"&&s.Player.StatPoints==50,"현재 세션의 실제 Ctrl 리셋");
                    yield return Click(117,602,"복원후얼음재학습"); yield return Click(216,658,"Ctrl재장착");
                    CheckThat(s.Skills.CtSkill=="iceOrb"&&s.Player.StatPoints==40&&s.Materials==840,"실제 고정 슬롯 재장착 버튼");
                    yield return Open(0);yield return SelectOrb("spikeTrap");yield return Click(216,658,"재학습뒤슬롯원복");
                    CheckThat(s.Skills.Slots[0]=="spikeTrap"&&s.Skills.Slots[1]==null,"실제 번호 슬롯 재배정 원복");yield return Shot("Ctrl-얼음보주-재장착");
                }
            }
            CheckThat(game.SaveCombatNow(), "현재 관리 상태 실제 파일 저장");
            var store = (CombatSaveStore)Call(game, "CombatStore"); receipt.저장경로 = store.PathFor("스킬왕복"); CheckThat(File.Exists(receipt.저장경로), "실제 저장 파일 존재"); Save();
            game.enabled = false; lobby.CloseStartupCaptureMedia(); ((NativeFeedbackAudio)Get(game, "sound")).Reset(); yield return new WaitForSecondsRealtime(1); Application.Quit(0);
        }
        IEnumerator Shot(string name) { yield return new WaitForEndOfFrame(); var texture = ScreenCapture.CaptureScreenshotAsTexture(); File.WriteAllBytes(Path.Combine(output, phase + "-" + name + ".png"), texture.EncodeToPNG()); Destroy(texture); }
        delegate bool WindowCallback(IntPtr window, IntPtr state);
        [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback, IntPtr state);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window, out uint process);
        [DllImport("user32.dll")] static extern bool PostMessageW(IntPtr window, uint message, IntPtr w, IntPtr l);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassNameW(IntPtr window, System.Text.StringBuilder name, int size);
        [DllImport("kernel32.dll")] static extern uint GetCurrentProcessId();
        IntPtr OwnWindow() { IntPtr found = IntPtr.Zero; uint own = GetCurrentProcessId(); EnumWindows((w, state) => { GetWindowThreadProcessId(w, out uint pid); var name = new System.Text.StringBuilder(128); GetClassNameW(w, name, 128); if (pid == own && name.ToString() == "UnityWndClass") { found = w; return false; } return true; }, IntPtr.Zero); return found; }
        void OnGUI() { if (Event.current == null) return; switch (Event.current.rawType) { case EventType.MouseDown: receipt.누름++; break; case EventType.MouseUp: receipt.해제++; break; case EventType.Layout: receipt.Layout++; break; case EventType.Repaint: receipt.Repaint++; break; } }
        IEnumerator Click(float x, float y, string label)
        {
            IntPtr window = OwnWindow(); CheckThat(window != IntPtr.Zero, label + " 자기 숨은 창"); GetWindowThreadProcessId(window, out uint pid); CheckThat(pid == GetCurrentProcessId(), label + " 소유 PID");
            int px = Mathf.RoundToInt(x * Screen.width / 1920f), py = Mathf.RoundToInt(y * Screen.height / 1080f), down = receipt.누름, up = receipt.해제, tick = game.Simulation.TickCount;
            IntPtr point = new IntPtr((py << 16) | (px & 65535)); Set(game, "gameFocused", true); game.enabled = true;
            CheckThat(PostMessageW(window, 0x200, IntPtr.Zero, point) && PostMessageW(window, 0x201, new IntPtr(1), point), label + " 누름 전달"); yield return new WaitForSecondsRealtime(.12f);
            CheckThat(PostMessageW(window, 0x202, IntPtr.Zero, point), label + " 해제 전달"); yield return new WaitForSecondsRealtime(.16f); yield return new WaitForEndOfFrame();
            CheckThat(receipt.누름 > down && receipt.해제 > up, label + " 실제 GUI 이벤트"); CheckThat(game.Simulation.TickCount == tick && !game.Running, label + " 월드 정지 보존");
        }
    }
}
