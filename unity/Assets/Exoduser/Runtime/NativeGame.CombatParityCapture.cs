using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Exoduser.UnityPort.Core;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class CombatPetSeed { public double x, y, t; }
        [Serializable] sealed class CombatExecutionSeed
        {
            public double enemyTierFrame, xbowTimer;
            public bool xbowEnabled;
            public CombatPetSeed pet;
        }
        [Serializable] sealed class CombatCaseSeed { public string name; public CombatExecutionSeed execution; }
        [Serializable] sealed class CombatReferenceSeed { public List<CombatCaseSeed> initial; }
        [Serializable] sealed class CombatEnemyFrame
        {
            public float x, y, hp, shield, st2, kbx, kby;
            public string state;
            public bool alive;
        }
        [Serializable] sealed class CombatPlayerFrame
        {
            public string key, state;
            public int frame, bolts;
            public float x, y, hp, shield, st2, kbx, kby, aimError, boltCenterError, petCenterError;
            public CombatEnemyFrame enemy;
        }
        [Serializable] sealed class CombatParityResult
        {
            public string scope = "실제 가상 입력 → 기존 FixedUpdate/Core → 실제 3D Player. 웹과 동일 단일 적·열린 충돌·난수.5 통제; 손조작·자연 전투와 별도";
            public bool passed, remodel3d;
            public int failures;
            public List<CombatPlayerFrame> frames = new List<CombatPlayerFrame>();
            public List<string> checks = new List<string>();
        }

        IEnumerator CombatParityCapture()
        {
            string output = Argument("-output"), reference = Argument("-combat-reference");
            if (string.IsNullOrEmpty(output) || !File.Exists(reference)) { Application.Quit(2); yield break; }
            var input = JsonUtility.FromJson<CombatReferenceSeed>(File.ReadAllText(reference));
            if (input.initial == null || input.initial.Count != 3) { Application.Quit(2); yield break; }
            Directory.CreateDirectory(output);
            AudioListener.volume = 0; AudioListener.pause = true; smokeActive = true; dropSmoke = true; Running = false;
            Screen.SetResolution(1600, 900, FullScreenMode.Windowed);
            lobby.Flow.ShowLobby(); lobby.Flow.SelectPreview(); lobby.Flow.EnterTest();
            if (firstPractice != null) EndFirstPractice(true);
            frontendEntryInputFence = false; menu = false; SetGameFocus(true); Running = false;
            yield return new WaitForSecondsRealtime(.5f);
            float deadline = Time.realtimeSinceStartup + 40;
            while (NativeRemodel3D.Requested && !NativeRemodel3D.Active && Time.realtimeSinceStartup < deadline) { UpdateViews(); yield return null; }
            var result = new CombatParityResult { remodel3d = NativeRemodel3D.Active };
            Action<bool, string> check = (ok, label) => { result.checks.Add((ok ? "통과 " : "실패 ") + label); if (!ok) result.failures++; };
            check(NativeRemodel3D.Active, "실제 3D 필드 로드");
            var oldKeyboard = Keyboard.current; var oldMouse = Mouse.current;
            var keyboard = InputSystem.AddDevice<Keyboard>(); var mouse = InputSystem.AddDevice<Mouse>();
            try
            {
                foreach (var test in input.initial)
                {
                    ResetRun(); if (firstPractice != null) EndFirstPractice(true);
                    menu = false; frontendEntryInputFence = false; SetGameFocus(true); Running = false;
                    var s = Simulation; var p = s.Player;
                    s.Random01 = () => .5; s.SkillRandom01 = () => .5; s.Config.EnemyAiEnabled = true; s.Enemies.Clear(); s.SpawnHoles = null; s.Materials = 1000;
                    // 웹 원문 촬영에서 명시한 열린 충돌 통제를 이 검수 실행에만 적용한다.
                    s.CanMove = (x, y, r) => true; s.HasLineOfSight = (a, b, c, d) => true; s.IsProjectileWall = (x, y) => false;
                    p.X = 4020; p.Y = 7420; p.Hp = p.MaxHp; p.Mana = p.MaxMana; p.Stamina = p.MaxStamina; p.Shield = p.MaxShield; p.Iframes = 0;
                    var e = s.SpawnEnemy(p.X + (test.name == "타격넉백" ? 70 : 300), p.Y, 0);
                    e.Alerted = true; e.State = "idle"; e.StateTicks = 0; e.ProjectileTicks = 0; e.Web.projCd = 1000000000;
                    var flags = BindingFlags.Instance | BindingFlags.NonPublic;
                    typeof(Simulation).GetMethod("EnsureEnemyLoop", flags).Invoke(s, null);
                    var context = (EnemyTickContext)typeof(Simulation).GetField("tickCtx", flags).GetValue(s);
                    context.EnemyTierFrame = test.execution.enemyTierFrame;
                    s.CrossbowAuto = test.execution.xbowEnabled; s.CrossbowTimer = test.execution.xbowTimer;
                    s.CrossbowPetEnabled = true; s.CrossbowPetX = test.execution.pet.x; s.CrossbowPetY = test.execution.pet.y; s.CrossbowPetT = test.execution.pet.t;
                    UpdateViews(); yield return new WaitForEndOfFrame();
                    float maxAim = 0, maxBolt = 0, maxPet = 0; bool boltSeen = false;
                    for (int f = 0; f < 300; f++)
                    {
                        var keys = test.name == "이동추적" ? new[] { Key.D } : new Key[0];
                        keyboard.MakeCurrent(); mouse.MakeCurrent(); InputState.Change(keyboard, new KeyboardState(keys));
                        var target = NativeRemodel3D.Point(p.X + 300, p.Y); target.y = NativeRemodel3D.Point(p.X, p.Y).y;
                        var screen = HudCamera.WorldToScreenPoint(target); var mouseState = new MouseState { position = new Vector2(screen.x, screen.y) };
                        if (test.name == "타격넉백" && f < 14) mouseState = mouseState.WithButton(MouseButton.Left);
                        InputState.Change(mouse, mouseState);
                        var aim = AimWorld(); float aimError = Vector2.Distance(new Vector2(aim.x * 100, -aim.y * 100), new Vector2(p.X + 300, p.Y));
                        Running = true; FixedUpdate(); Running = false; UpdateViews(); yield return new WaitForEndOfFrame();
                        var row = new CombatPlayerFrame { key = test.name, frame = f, x = p.X, y = p.Y, hp = p.Hp, shield = p.Shield, state = p.State, st2 = p.StateTicks, kbx = p.KnockbackX, kby = p.KnockbackY, aimError = aimError,
                            enemy = new CombatEnemyFrame { x = e.X, y = e.Y, hp = e.Hp, shield = e.Shield, state = e.State, st2 = e.StateTicks, kbx = e.KnockbackX, kby = e.KnockbackY, alive = e.Alive } };
                        foreach (var b in s.Bolts)
                        {
                            if (!b.Active) continue; row.bolts++; boltSeen = true;
                            double angle = Math.Atan2(b.Vy, b.Vx);
                            var go = GameObject.Find("Bolt shaft " + b.Id);
                            row.boltCenterError = Mathf.Max(row.boltCenterError, go != null ? Vector3.Distance(go.transform.position, NativeBoltView.Position(b.X - Math.Cos(angle) * 7, b.Y - Math.Sin(angle) * 7)) : 1000);
                        }
                        var pet = GameObject.Find("유령 석궁 2");
                        row.petCenterError = pet != null ? Vector3.Distance(pet.transform.position, NativeBoltView.Position(s.CrossbowPetX, s.CrossbowPetY + Math.Sin(s.CrossbowPetT * .08) * 3)) : 1000;
                        maxAim = Mathf.Max(maxAim, aimError); maxBolt = Mathf.Max(maxBolt, row.boltCenterError); maxPet = Mathf.Max(maxPet, row.petCenterError); result.frames.Add(row);
                        if (f % 3 == 0) RmIntShot(Path.Combine(output, test.name + "-" + f.ToString("000") + ".png"));
                    }
                    check(maxAim < 1, test.name + " 실제 조준 오차 " + maxAim.ToString("F3") + "px");
                    check(!test.execution.xbowEnabled || boltSeen, test.name + " 자동 석궁 실제 발사");
                    check(maxBolt < .02f && maxPet < .02f, test.name + " 석궁·탄환 Core와 표시 중심 일치");
                }
            }
            finally
            {
                InputSystem.RemoveDevice(keyboard); InputSystem.RemoveDevice(mouse);
                if (oldKeyboard != null) oldKeyboard.MakeCurrent(); if (oldMouse != null) oldMouse.MakeCurrent();
            }
            result.passed = result.failures == 0;
            File.WriteAllText(Path.Combine(output, "combat-playtest.json"), JsonUtility.ToJson(result, true));
            lobby.enabled = false; lobby.CloseStartupCaptureMedia(); sound.Reset();
            yield return new WaitForSecondsRealtime(1); Application.Quit(result.passed ? 0 : 2);
        }
    }
}
