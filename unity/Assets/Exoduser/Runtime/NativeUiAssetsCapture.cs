using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // 명시 플래그+격리 세이브에서만 동작하는 실제 Player 화면/흐름 검수.
    public sealed class NativeUiAssetsCapture:MonoBehaviour
    {
        NativeLobby lobby;
        string output;
        readonly List<string> checks=new List<string>();
        int failures;
        bool calibration;Texture2D srgbProbe,linearProbe;
        void OnGUI()
        {
            if(!calibration)return;GUI.depth=-10000;GUI.matrix=Matrix4x4.identity;GUI.enabled=true;GUI.color=Color.black;GUI.DrawTexture(new Rect(0,0,1920,1080),Texture2D.whiteTexture);
            if(srgbProbe==null){srgbProbe=new Texture2D(1,1,TextureFormat.RGBA32,false,false);linearProbe=new Texture2D(1,1,TextureFormat.RGBA32,false,true);srgbProbe.SetPixel(0,0,new Color(.5f,.5f,.5f,1));linearProbe.SetPixel(0,0,new Color(.5f,.5f,.5f,1));srgbProbe.Apply();linearProbe.Apply();}
            GUI.color=new Color(.5f,.5f,.5f,1);GUI.DrawTexture(new Rect(100,100,200,200),Texture2D.whiteTexture);GUI.color=Color.white;GUI.DrawTexture(new Rect(400,100,200,200),srgbProbe);GUI.DrawTexture(new Rect(700,100,200,200),linearProbe);
            var style=new GUIStyle{font=NativeSilverHellUi.Font(),fontSize=60};style.normal.textColor=new Color(.5f,.5f,.5f,1);GUI.Label(new Rect(100,400,1000,100),"가나다 TEXT 0.5",style);style.normal.textColor=NativeSilverHellUi.TextColor(new Color(.5f,.5f,.5f,1));GUI.Label(new Rect(100,700,1000,100),"가나다 TEXT 보정 0.5",style);style.normal.textColor=Color.white;GUI.Label(new Rect(100,550,1000,100),"가나다 TEXT 1.0",style);
            var logo=Resources.Load<Texture2D>("Art/lobby/logo_exoduser");GUI.DrawTexture(new Rect(1100,100,310,148),logo,ScaleMode.ScaleToFit,true);
            GUI.color=Color.white;
        }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]static void Begin()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-assets-capture")<0)return;
            new GameObject("UI원화검수").AddComponent<NativeUiAssetsCapture>();
        }
        [Serializable]sealed class ColorProbe{public string space,guiColor,contentColor;public bool enabled;}
        [Serializable]sealed class Receipt
        {
            public bool passed;
            public int failures;
            public string scope;
            public string[] checks;
        }
        void Check(bool ok,string name)
        {
            checks.Add((ok?"PASS ":"FAIL ")+name);
            if(!ok)failures++;
        }
        [Serializable]sealed class FontRow{public string code,key,font;public bool covered;}
        [Serializable]sealed class FontRows{public List<FontRow> rows=new List<FontRow>();}
        [Serializable]sealed class Labels{public LanguageRow[] entries;}
        [Serializable]sealed class LanguageRow{public string code;public LabelRow[] labels;}
        [Serializable]sealed class LabelRow{public string key,text;}
        IEnumerator CheckFonts()
        {
            var rows=new FontRows();var source=Resources.Load<TextAsset>("Data/visual_select_labels");var data=JsonUtility.FromJson<Labels>(source.text);int missing=0;
            foreach(var language in data.entries)
            {
                foreach(var label in language.labels)
                {
                    var font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(),label.text);bool ok=NativeSilverHellUi.Covers(font,label.text);if(!ok)missing++;rows.rows.Add(new FontRow{code=language.code,key=label.key,font=font==null?"":font.name,covered=ok});
                }
                yield return null;
            }
            File.WriteAllText(Path.Combine(output,"서체_문자검사.json"),JsonUtility.ToJson(rows,true));Check(missing==0,"현재 지원 언어의 직업 문구 누락 글리프 0 (문자 지원 검사, 조판·번역 품질과 구분)");
        }
        IEnumerator Start()
        {
            AudioListener.volume=0;
            AudioListener.pause=true;
            var args=Environment.GetCommandLineArgs();
            int at=Array.IndexOf(args,"-output");
            if(at<0||at+1>=args.Length||!Path.IsPathRooted(args[at+1])||!NativeQaSandbox.Active)
            {
                Application.Quit(3);
                yield break;
            }
            output=args[at+1];
            Directory.CreateDirectory(output);
            yield return null;
            lobby=UnityEngine.Object.FindAnyObjectByType<NativeLobby>();
            if(lobby==null)
            {
                Application.Quit(2);
                yield break;
            }
            lobby.AutomatedInput=true;
            lobby.SetPlaybackFocus(true);
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            yield return new WaitForSecondsRealtime(.5f);
            File.WriteAllText(Path.Combine(output,"색공간_진단.json"),JsonUtility.ToJson(new ColorProbe{space=QualitySettings.activeColorSpace.ToString(),guiColor=GUI.color.ToString(),contentColor=GUI.contentColor.ToString(),enabled=GUI.enabled},true));
            calibration=true;yield return Shot("Unity_색공간_진단");calibration=false;
            yield return CheckFonts();
            lobby.Begin();lobby.AdvanceSplash();lobby.CurrentVideo.SetPlaybackAllowed(false);yield return new WaitForSecondsRealtime(1.2f);yield return Shot("Unity_타이틀_1920");lobby.CurrentVideo.SetPlaybackAllowed(true);
            lobby.ReplayIntro();
            yield return new WaitForSecondsRealtime(1.5f);
            yield return Shot("Unity_인장_등장_1920");
            yield return new WaitForSecondsRealtime(5.5f);
            yield return Shot("Unity_인장_호흡_1920");
            typeof(NativeLobby).GetField("since",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic).SetValue(lobby,16.8f);
            Check(lobby.Flow.Page==LobbyPage.Title,"인장 첫 화면");
            Check(lobby.CurrentVideo.Player==null||!lobby.CurrentVideo.Player.isPlaying,"옛 문 영상 재생 0");
            yield return Shot("Unity_인장_1920");
            Screen.SetResolution(3840,1080,FullScreenMode.Windowed);
            yield return new WaitForSecondsRealtime(.5f);
            yield return Shot("Unity_인장_3840");
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            yield return new WaitForSecondsRealtime(.3f);
            lobby.StartGate();
            yield return null;
            Check(lobby.Flow.Page==LobbyPage.WorldIntro,"ENTER 즉시 현행 세계관 영상으로 이동");
            Check(lobby.CurrentVideo.Player!=null&&lobby.CurrentVideo.Player.url.EndsWith(NativeLobby.WorldMovie,StringComparison.Ordinal),"현행 canonical 영상 경로");
            lobby.ShowLobby();
            Check(lobby.Characters.TryRestore(new[]
            {
                "검수전사"
            },-1),"격리 슬롯 메모리 fixture");
            yield return new WaitForSecondsRealtime(2);
            yield return Shot("Unity_로비_1920");
            lobby.GetComponent<NativeCharacterPresentationPlayback>().Video.SetPlaybackAllowed(false);
            Check(lobby.OpenCharacterCreation(),"실제 캐릭터 생성 메뉴 열기");
            yield return new WaitForSecondsRealtime(2);
            yield return Shot("Unity_캐릭터선택_1920");
            lobby.GetComponent<NativeCharacterPresentationPlayback>().Video.SetPlaybackAllowed(true);
            yield return new WaitForSecondsRealtime(.6f);
            yield return Shot("Unity_캐릭터선택_동작1_1920");
            yield return new WaitForSecondsRealtime(.6f);
            yield return Shot("Unity_캐릭터선택_동작2_1920");
            Check(lobby.GetComponent<NativeCharacterPresentationPlayback>().Video.Frame>=0,"기존 캐릭터 대기 영상 실제 디코드");
            for(int visual=1;visual<5;visual++){lobby.GetComponent<NativeCharacterPresentationPlayback>().Video.SetPlaybackAllowed(false);Check(lobby.ChooseCharacterVisual(visual),"잠긴 직업 UI 선택 "+visual);yield return new WaitForSecondsRealtime(.3f);yield return Shot("Unity_캐릭터선택_"+(visual+1)+"_1920");var clip=lobby.GetComponent<NativeCharacterPresentationPlayback>().Video;clip.SetPlaybackAllowed(true);float deadline=Time.realtimeSinceStartup+5;while(clip.Frame<0&&clip.Error.Length==0&&Time.realtimeSinceStartup<deadline)yield return null;Check(clip.Error.Length==0&&clip.Frame>=0,"잠긴 직업 기존 영상 디코드 "+visual);}
            Check(lobby.ChooseCharacterVisual(0)&&lobby.ConfirmCharacterVisual(),"전사 이름 입력창 도달");yield return null;yield return Shot("Unity_이름생성_1920");Check(!lobby.CreateCharacter("a"),"이름 2~8자 검증 유지");Check(!lobby.CreateCharacter("검수전사"),"중복 이름 검증 유지");lobby.CloseCharacterCreation();lobby.GetComponent<NativeCharacterPresentationPlayback>().Video.SetPlaybackAllowed(true);
            lobby.SelectCharacter(0);
            yield return new WaitForSecondsRealtime(1);
            yield return Shot("Unity_선택로비_1920");
            lobby.AutomatedInput=false;
            Check(lobby.BeginCharacterEntry(false),"실제 신규 입장 API");
            float until=Time.realtimeSinceStartup+10;
            while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<until)yield return null;
            lobby.StartupCaptureState.Skip();
            yield return null;
            Check(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide,"기존 4단계 튜토리얼 도달");
            for(int n=0;n<4;n++)
            {
                // 실제 Guide의 250ms 중복입력 방지를 지난 뒤 각 단계를 확인한다.
                yield return new WaitForSecondsRealtime(.3f);
                Check(lobby.StartupCaptureState.Page==FrontendEntryPage.Guide&&lobby.StartupCaptureState.GuideStep==n,"안내 실제 단계 "+(n+1));
                yield return Shot("Unity_튜토리얼_"+(n+1)+"_1920");
                lobby.StartupCaptureState.Advance();
            }
            Check(lobby.StartupCaptureState.Page==FrontendEntryPage.Curtain,"안내 4단계 완료 후 실제 커튼 전환");
            lobby.CloseStartupCaptureMedia();
            File.WriteAllText(Path.Combine(output,"화면검수.json"),JsonUtility.ToJson(new Receipt
            {
                passed=failures==0,failures=failures,scope="실제 Player 렌더·API/격리 메모리 슬롯. OS 입력·수동 플레이 검증과 구분.",checks=checks.ToArray()
            },true));
            Application.Quit(failures==0?0:2);
        }
        IEnumerator Shot(string name)
        {
            yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));
            yield return null;
        }
    }
}
