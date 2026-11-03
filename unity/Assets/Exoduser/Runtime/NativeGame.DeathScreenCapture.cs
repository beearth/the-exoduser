using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-death-screen-smoke -output <dir>` (Mac 검수용, 무음): 실제 NativeGame 월드 위에서 Core PlayerDie로 쓰러뜨리고
    // 사망 대기 화면을 고정 시각으로 찍는다. 해상도는 실행 인자(-screen-width/-screen-height)로 1920x1080·3840x1080·5120x1440을 바꿔 돌린다.
    // 찍는 장면: 충격(0.25s)·대기(2.0s)·부활 직전(4.8s)·부활 불가·부활 페이드 중간·부활 후·사망 패널 진입, 대기 장면 6개 언어.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class DeathScreenReceipt
        {
            public bool passed; public string failures; public int width, height, labelEntries;
            public string[] files; public string[] incompleteLabels; public float filterAtWait, volumeAtWait, filterAfterRevive;
        }

        IEnumerator DeathScreenCaptureRun()
        {
            AudioListener.volume = 0; AudioListener.pause = true; Running = false; smokeActive = true;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) yield break; Directory.CreateDirectory(output);
            var sim = Simulation; sim.Config.EnemyAiEnabled = false; sim.Enemies.Clear(); sim.Config.RevivePow = 1.0;
            var fails = new List<string>(); var files = new List<string>(); Action<bool, string> check = (ok, what) => { if (!ok) fails.Add(what); };
            var rec = new DeathScreenReceipt { width = Screen.width, height = Screen.height, labelEntries = NativeReviveHud.DeathLabelCount };
            var incomplete = new List<string>(); for (int i = 0; i < LobbyLanguage.Count; i++) if (!NativeReviveHud.DeathLabelComplete(LobbyLanguage.GetCode(i))) incomplete.Add(LobbyLanguage.GetCode(i));
            rec.incompleteLabels = incomplete.ToArray(); check(incomplete.Count == 0, "labels incomplete: " + string.Join(",", incomplete.ToArray()));
            string language = lobby.Language;
            yield return null; yield return null;
            var p = sim.Player; p.Iframes = 0;
            for (int i = 0; i < 400 && p.State != "fallen" && p.State != "dead"; i++) { p.Iframes = 0; sim.HurtPlayer(99999); }
            check(p.State == "fallen", "fell: " + p.State);
            Func<string, float, float, IEnumerator> shot = (name, age, ticks) => DeathShot(output, name, files, age, ticks);
            yield return shot("death_01_impact", .25f, 300);
            yield return shot("death_02_wait", 2f, 180);
            rec.filterAtWait = revive.FilterAmount; rec.volumeAtWait = revive.VolumeWeight;
            check(rec.filterAtWait > .99f, "filter at 2s " + rec.filterAtWait); check(rec.volumeAtWait > .99f, "saturation volume at 2s " + rec.volumeAtWait);
            yield return shot("death_03_last", 4.8f, 12);
            foreach (var code in new[] { "ko", "en", "ja", "ru", "th", "el" }) { lobby.SetLanguage(code); yield return shot("death_lang_" + code, 2f, 180); }
            lobby.SetLanguage(language);
            p.FallenCanRevive = false; yield return shot("death_04_cannot", 2.4f, 150);
            p.FallenCanRevive = true; revive.ForcedAge = 4.95f; p.StateTicks = 3; yield return null;
            // 부활 성공과 같은 상태 변화(Core TickFallen 성공 분기 결과)를 연출 확인용으로만 만든다.
            p.State = "idle"; p.Hp = p.MaxHp; p.StateTicks = 0; revive.ForcedReviveAge = .25f; yield return null; yield return null;
            check(revive.ScreenPhase == "Reviving", "phase after revive " + revive.ScreenPhase);
            yield return DeathCapture(output, "death_05_revive_mid", files);
            revive.ForcedReviveAge = null; revive.ForcedAge = null; yield return new WaitForSecondsRealtime(.7f);
            rec.filterAfterRevive = revive.FilterAmount; check(revive.ScreenPhase == "None" && rec.filterAfterRevive <= 0, "filter cleared " + revive.ScreenPhase + " " + rec.filterAfterRevive);
            yield return DeathCapture(output, "death_06_revived", files);
            // 사망 확정: 부활 불가 쓰러짐 뒤 dead. 사망 패널이 필터 위로 들어온다.
            for (int i = 0; i < 400 && p.State != "fallen"; i++) { p.Iframes = 0; sim.HurtPlayer(99999); }
            p.FallenCanRevive = false; revive.ForcedAge = 5f; yield return null; p.State = "dead"; yield return new WaitForSecondsRealtime(.6f);
            yield return DeathCapture(output, "death_07_panel_enter", files);
            revive.ForcedAge = null;
            rec.files = files.ToArray(); rec.failures = string.Join(" | ", fails.ToArray()); rec.passed = fails.Count == 0;
            File.WriteAllText(Path.Combine(output, "death-screen-capture.json"), JsonUtility.ToJson(rec, true));
            Application.Quit(rec.passed ? 0 : 2);
        }
        IEnumerator DeathShot(string dir, string name, List<string> files, float age, float ticks)
        {
            revive.ForcedAge = age; Simulation.Player.StateTicks = ticks;
            yield return new WaitForSecondsRealtime(.25f);
            yield return DeathCapture(dir, name, files);
        }
        IEnumerator DeathCapture(string dir, string name, List<string> files)
        {
            yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(dir, name + "_" + Screen.width + "x" + Screen.height + ".png")); files.Add(name); yield return null;
        }
    }
}
