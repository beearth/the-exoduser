using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class UiOverlapCoverage {public int schemaVersion=2;public string runtimeSha256,unityVersion,device,deviceType;public string scope="실제 Player OnGUI·원본 API 상태 전환, OS 입력/자연 클리어와 구분";public string[] languages={"ko","de"};public List<string> pages=new List<string>(),frames=new List<string>();}
        UiOverlapCoverage overlapCoverage;
        string overlapOutput,overlapLanguage;
        [Serializable] sealed class OverlapOptionBundle {public string[] codes;public OverlapOptionEntry[] entries;}
        [Serializable] sealed class OverlapOptionEntry {public string key;public string[] texts;}
        [Serializable] sealed class OverlapVisualBundle {public OverlapVisualLanguage[] entries;}
        [Serializable] sealed class OverlapVisualLanguage {public string code;public OverlapVisualLabel[] labels;}
        [Serializable] sealed class OverlapVisualLabel {public string key,text;}
        [Serializable] sealed class OverlapLocaleScore {public string category,code;public float measuredWidth;}
        [Serializable] sealed class OverlapLanguageScores {public List<OverlapLocaleScore> scores=new List<OverlapLocaleScore>();}
        void SelectOverlapLanguages()
        {
            var report=new OverlapLanguageScores();var chosen=new List<string>{"ko","de"};
            var options=JsonUtility.FromJson<OverlapOptionBundle>(Resources.Load<TextAsset>("Data/a15_options_web").text);
            string longest="de";float maximum=0;
            for(int n=0;n<options.codes.Length;n++)
            {
                string code=options.codes[n];if(code=="ar")continue;float width=0;
                var font=NativeA15SettingsLabels.FontForLocale(code,NativeSilverHellUi.Font());var style=new GUIStyle{font=font,fontSize=16};
                foreach(var entry in options.entries)foreach(string text in entry.texts[n].Split('\u0001'))width+=style.CalcSize(new GUIContent(text)).x;
                report.scores.Add(new OverlapLocaleScore{category="설정",code=code,measuredWidth=width});if(width>maximum){maximum=width;longest=code;}
            }
            if(!chosen.Contains(longest))chosen.Add(longest);
            var visual=JsonUtility.FromJson<OverlapVisualBundle>(Resources.Load<TextAsset>("Data/visual_select_labels").text);maximum=0;
            foreach(var language in visual.entries)
            {
                if(language.code=="ar")continue;float width=0;
                foreach(var label in language.labels){var font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(),label.text);width+=new GUIStyle{font=font,fontSize=16}.CalcSize(new GUIContent(label.text)).x;}
                report.scores.Add(new OverlapLocaleScore{category="직업선택",code=language.code,measuredWidth=width});if(width>maximum){maximum=width;longest=language.code;}
            }
            if(!chosen.Contains(longest))chosen.Add(longest);overlapCoverage.languages=chosen.ToArray();
            File.WriteAllText(Path.Combine(overlapOutput,"최장언어_실측.json"),JsonUtility.ToJson(report,true));
        }
        IEnumerator UiOverlapShot(string page)
        {
            yield return new WaitForSecondsRealtime(.18f);yield return new WaitForEndOfFrame();
            string name=Screen.width+"-"+overlapLanguage+"-"+page;
            NativeUiAudit.Save(Path.Combine(overlapOutput,name+".json"),page,overlapLanguage);
            ScreenCapture.CaptureScreenshot(Path.Combine(overlapOutput,name+".png"));
            overlapCoverage.frames.Add(name);if(!overlapCoverage.pages.Contains(page))overlapCoverage.pages.Add(page);
            yield return null;
        }
        IEnumerator UiOverlapCapture()
        {
            var pending=new Stack<IEnumerator>();pending.Push(UiOverlapCaptureBody());
            while(pending.Count>0)
            {
                object current=null;bool more=false;Exception error=null;
                try{more=pending.Peek().MoveNext();if(more)current=pending.Peek().Current;}catch(Exception caught){error=caught;}
                if(error!=null){Debug.LogError("UI_OVERLAP_FAILED "+error);Application.Quit(2);yield break;}
                if(!more){pending.Pop();continue;}
                if(current is IEnumerator child){pending.Push(child);continue;}
                yield return current;
            }
        }
        IEnumerator UiOverlapCaptureBody()
        {
            overlapOutput=Argument("-output");
            if(!NativeQaSandbox.Active||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput)){Debug.LogError("겹침 검사는 격리 저장·절대 출력 경로 필요");Application.Quit(3);yield break;}
            Directory.CreateDirectory(overlapOutput);overlapCoverage=new UiOverlapCoverage();SelectOverlapLanguages();
            using(var hash=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))overlapCoverage.runtimeSha256=BitConverter.ToString(hash.ComputeHash(binary)).Replace("-","").ToLowerInvariant();
            overlapCoverage.unityVersion=Application.unityVersion;overlapCoverage.device=SystemInfo.graphicsDeviceName;overlapCoverage.deviceType=SystemInfo.graphicsDeviceType.ToString();
            smokeActive=true;pauseSmoke=true;lobby.AutomatedInput=true;lobby.SetPlaybackFocus(true);
            gameObject.AddComponent<NativeUiAudit.Host>();NativeUiAudit.Active=true;
            foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(1600,900)})
            foreach(string language in overlapCoverage.languages)
            {
                overlapLanguage=language;lobby.SetLanguage(language);stageClear.LocaleCode=language;
                Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
                menu=false;Running=false;pauseMenu.Reset();stageClear.Hide();
                lobby.ReplayIntro();typeof(NativeLobby).GetField("since",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(lobby,16f);
                yield return UiOverlapShot("첫화면");
                lobby.Begin();yield return UiOverlapShot("브랜드인트로");lobby.AdvanceSplash();yield return new WaitForSecondsRealtime(1.1f);yield return UiOverlapShot("메뉴");
                lobby.ShowLobby();lobby.Characters.TryRestore(new[]{"검수"+overlapCoverage.frames.Count.ToString("000")},0);yield return UiOverlapShot("로비");
                lobby.OpenCharacterCreation();
                for(int n=0;n<5;n++){lobby.ChooseCharacterVisual(n);yield return UiOverlapShot("캐릭터선택"+n);}
                lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();yield return UiOverlapShot("이름입력");lobby.CloseCharacterCreation();
                lobby.AutomatedInput=false;
                if(!lobby.BeginCharacterEntry(false)||lobby.StartupCaptureState.Page!=FrontendEntryPage.Loading)throw new InvalidOperationException("실제 신규 캐릭터 로딩 진입 누락");
                yield return UiOverlapShot("로딩");
                float deadline=Time.realtimeSinceStartup+12;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
                lobby.StartupCaptureState.Skip();yield return null;
                for(int n=0;n<4;n++){yield return new WaitForSecondsRealtime(.3f);if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Guide||lobby.StartupCaptureState.GuideStep!=n)throw new InvalidOperationException("튜토리얼 상태 누락 "+n);yield return UiOverlapShot("튜토리얼"+n);lobby.StartupCaptureState.Advance();}
                lobby.StartupCaptureState.Skip();lobby.SelectPreview();lobby.EnterNativeTest();
                frontendEntryInputFence=false;Running=false;menu=false;EndFirstPractice(true);Running=false;
                areaTitle.Hide();levelUp.Hide();yield return UiOverlapShot("HUD");
                menu=true;pauseMenu.Reset();pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("일시정지");
                pauseMenu.Navigation.PointAt(3);ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Accept,false,false));pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("종료확인");
                pauseMenu.Reset();pauseMenu.ShowSettings();
                for(int n=0;n<4;n++){pauseMenu.Navigation.SelectTab(n);pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("설정"+n);pauseMenu.A15SetScrollForQa(9999);yield return UiOverlapShot("설정스크롤"+n);pauseMenu.A15SetScrollForQa(0);}
                pauseMenu.Navigation.SelectTab(2);pauseMenu.Navigation.ObserveReleased(false);pauseMenu.A15OpenSelectForQa("optBgmTrack");yield return UiOverlapShot("설정목록");
                pauseMenu.Reset();menu=false;Running=false;
                stageClear.Show(new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=137,totalSpawned=168,clearSeconds=88,regionsCleared=4,bossKilled=true,deaths=0,dmgTaken=120,comboMax=32,statPointsAwarded=10,statPointsBalance=20});stageClear.ForcedAge=2;
                yield return UiOverlapShot("클리어");stageClear.Hide();
            }
            NativeUiAudit.Active=false;File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE UI_OVERLAP");Application.Quit(0);
        }
    }
}
