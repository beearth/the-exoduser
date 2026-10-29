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
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]static void Begin()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-ui-assets-capture")<0)return;
            new GameObject("UI원화검수").AddComponent<NativeUiAssetsCapture>();
        }
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
            lobby.CloseCharacterCreation();
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
                yield return new WaitForSecondsRealtime(.2f);
                yield return Shot("Unity_튜토리얼_"+(n+1)+"_1920");
                lobby.StartupCaptureState.Advance();
            }
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
