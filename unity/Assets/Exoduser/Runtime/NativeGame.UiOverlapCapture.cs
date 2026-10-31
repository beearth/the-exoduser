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
        [Serializable] sealed class UiOverlapCoverage {public int schemaVersion=2;public string runtimeSha256,unityVersion,device,deviceType;public string scope="실제 Player OnGUI·제품 API 상태 전환/검수 시계/실제 미디어 seek/8방향 투영 표본, OS 입력/자연 클리어와 구분";public string[] resolutions={"1920x1080","2560x1080","3840x1080","1600x900","2560x1600"};public string[] languages={"ko","de"};public List<string> pages=new List<string>(),frames=new List<string>();public List<UiWideMovie> movies=new List<UiWideMovie>();public List<UiWideCue> worldCues=new List<UiWideCue>();public int[] loadingImages=new List<int>(NativeLoadingSelection.Images).ToArray();}
        [Serializable] sealed class UiWideCue {public int width,height;public string language,caption;public double start,end,requested,observed;}
        [Serializable] sealed class UiWideMovie {public int width,height,visual,textureWidth,textureHeight;public string language,file;public long frameBefore,frameAfter;public double timeBefore,timeAfter;public bool prepared,playing;}
        [Serializable] sealed class UiWideInputCheck {public int width,height;public bool lockedBlocked,nameOpened;}
        [Serializable] sealed class UiWideInputReport {public List<UiWideInputCheck> checks;}
        readonly List<UiWideInputCheck> wideInputChecks=new List<UiWideInputCheck>();
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
            yield return new WaitForSecondsRealtime(.18f);NativeUiAudit.Active=true;yield return null;yield return new WaitForEndOfFrame();
            string name=Screen.width+"x"+Screen.height+"-"+overlapLanguage+"-"+page;
            NativeUiAudit.Save(Path.Combine(overlapOutput,name+".json"),page,overlapLanguage);
            ScreenCapture.CaptureScreenshot(Path.Combine(overlapOutput,name+".png"));
            NativeUiAudit.Active=false;
            overlapCoverage.frames.Add(name);if(!page.StartsWith("전환로딩",StringComparison.Ordinal)&&!overlapCoverage.pages.Contains(page))overlapCoverage.pages.Add(page);
            yield return null;
        }
        void SaveOverlapCaptureProgress(){if(overlapCoverage==null||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput)||!Directory.Exists(overlapOutput))return;try{File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));}catch(Exception e){Debug.LogWarning("UI_EVIDENCE_SAVE "+e);}}
        IEnumerator UiOverlapCapture()
        {
            var pending=new Stack<IEnumerator>();pending.Push(UiOverlapCaptureBody());
            while(pending.Count>0)
            {
                object current=null;bool more=false;Exception error=null;
                try{more=pending.Peek().MoveNext();if(more)current=pending.Peek().Current;}catch(Exception caught){error=caught;}
                if(error!=null){Debug.LogError("UI_OVERLAP_FAILED "+error);SaveOverlapCaptureProgress();lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(2);yield break;}
                if(!more){pending.Pop();continue;}
                if(current is IEnumerator child){pending.Push(child);continue;}
                yield return current;
            }
        }

#if UNITY_STANDALONE_WIN
        delegate bool UiWideWindowCallback(IntPtr window,IntPtr state);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="EnumWindows")] static extern bool UiWideWindows(UiWideWindowCallback callback,IntPtr state);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowThreadProcessId")] static extern uint UiWideProcess(IntPtr window,out uint process);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="PostMessageW")] static extern bool UiWidePost(IntPtr window,uint message,IntPtr w,IntPtr l);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClassNameW",CharSet=System.Runtime.InteropServices.CharSet.Unicode)] static extern int UiWideClass(IntPtr window,System.Text.StringBuilder name,int size);
        [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)] struct UiWideRect {public int left,top,right,bottom;}
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClientRect")] static extern bool UiWideClient(IntPtr window,out UiWideRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowRect")] static extern bool UiWideRectOf(IntPtr window,out UiWideRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="SetWindowPos",SetLastError=true)] static extern bool UiWideResize(IntPtr window,IntPtr after,int x,int y,int width,int height,uint flags);
        static void UiWideSetClientSize(int width,int height)
        {
            IntPtr own=IntPtr.Zero;uint pid=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;
            UiWideWindows((w,s)=>{UiWideProcess(w,out uint id);var c=new System.Text.StringBuilder(128);UiWideClass(w,c,128);if(id==pid&&c.ToString()=="UnityWndClass"){own=w;return false;}return true;},IntPtr.Zero);
            if(own==IntPtr.Zero)throw new InvalidOperationException("자기 숨은 Player 창 없음(크기 보정)");
            UiWideProcess(own,out uint owner);if(owner!=pid)throw new InvalidOperationException("자기 창 소유권 불일치");
            if(!UiWideClient(own,out var client)||!UiWideRectOf(own,out var frame))throw new InvalidOperationException("자기 창 크기 조회 실패");
            int outerWidth=width+frame.right-frame.left-(client.right-client.left),outerHeight=height+frame.bottom-frame.top-(client.bottom-client.top);
            if(!UiWideResize(own,IntPtr.Zero,0,0,outerWidth,outerHeight,0x16))throw new InvalidOperationException("자기 창 크기 보정 실패 "+System.Runtime.InteropServices.Marshal.GetLastWin32Error());
            UiWideClient(own,out var after);Debug.Log("UI_CLIENT_RESIZE pid="+pid+" before="+(client.right-client.left)+"x"+(client.bottom-client.top)+" after="+(after.right-after.left)+"x"+(after.bottom-after.top)+" requested="+width+"x"+height+" flags=NOMOVE|NOZORDER|NOACTIVATE");
        }
        IEnumerator UiWideClick(float x,float y){IntPtr own=IntPtr.Zero;uint pid=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;UiWideWindows((w,s)=>{UiWideProcess(w,out uint id);var c=new System.Text.StringBuilder(128);UiWideClass(w,c,128);if(id==pid&&c.ToString()=="UnityWndClass"){own=w;return false;}return true;},IntPtr.Zero);if(own==IntPtr.Zero)throw new InvalidOperationException("자기 숨은 Player 창 없음");var a=NativeUiViewport.Edges;int px=Mathf.RoundToInt(Screen.width-(1920-x)*a.Scale),py=Mathf.RoundToInt(y*a.Scale);IntPtr point=new IntPtr((py<<16)|(px&65535));lobby.AutomatedInput=false;
         if(!UiWidePost(own,0x200,IntPtr.Zero,point)||!UiWidePost(own,0x201,new IntPtr(1),point))throw new InvalidOperationException("자기 창 누름 전달 실패");yield return new WaitForSecondsRealtime(.12f);if(!UiWidePost(own,0x202,IntPtr.Zero,point))throw new InvalidOperationException("자기 창 해제 전달 실패");yield return new WaitForSecondsRealtime(.2f);lobby.AutomatedInput=true;
        }
#endif

        IEnumerator UiWaitCharacterMovie(int visual)
        {
            yield return null;var field=typeof(NativeLobby).GetField("characterPresentationPlayback",BindingFlags.Instance|BindingFlags.NonPublic);NativeLobbyVideo video=null;float deadline=Time.realtimeSinceStartup+10;
            while(Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);var playback=field.GetValue(lobby) as NativeCharacterPresentationPlayback;video=playback==null?null:playback.Video;if(video!=null&&video.Error.Length>0)throw new InvalidOperationException("직업 영상 오류 "+visual+" "+video.Error);if(video!=null&&video.Prepared&&video.Frame>=0)break;yield return null;}
            if(video==null||!video.Prepared||video.Frame<0)throw new InvalidOperationException("실제 직업 영상 준비 시간초과 "+visual);var row=new UiWideMovie{width=Screen.width,height=Screen.height,visual=visual,language=overlapLanguage,file=Path.GetFileName(video.Player.url),frameBefore=video.Frame,timeBefore=video.Time,prepared=video.Prepared,textureWidth=video.Texture.width,textureHeight=video.Texture.height};
            yield return new WaitForSecondsRealtime(.35f);row.frameAfter=video.Frame;row.timeAfter=video.Time;row.playing=video.Player.isPlaying;overlapCoverage.movies.Add(row);if(!row.playing||row.frameAfter==row.frameBefore)throw new InvalidOperationException("실제 직업 영상 프레임 정지 "+visual);
        }

        IEnumerator UiWaitRootMovie(int visual,string expected)
        {
            yield return null;var video=lobby.CurrentVideo;float deadline=Time.realtimeSinceStartup+10;
            while(Time.realtimeSinceStartup<deadline&&(!video.Prepared||video.Frame<0)){lobby.SetPlaybackFocus(true);if(video.Error.Length>0)throw new InvalidOperationException("전면 영상 오류 "+expected+" "+video.Error);yield return null;}
            if(!video.Prepared||video.Frame<0||Path.GetFileName(video.Player.url)!=expected)throw new InvalidOperationException("실제 전면 영상 준비 실패 "+expected);
            var movie=new UiWideMovie{width=Screen.width,height=Screen.height,visual=visual,language=overlapLanguage,file=Path.GetFileName(video.Player.url),frameBefore=video.Frame,timeBefore=video.Time,prepared=true,textureWidth=video.Texture.width,textureHeight=video.Texture.height};yield return new WaitForSecondsRealtime(.35f);movie.frameAfter=video.Frame;movie.timeAfter=video.Time;movie.playing=video.Player.isPlaying;overlapCoverage.movies.Add(movie);if(!movie.playing||movie.frameAfter<0||movie.frameAfter==movie.frameBefore||Path.GetFileName(video.Player.url)!=expected)throw new InvalidOperationException("전면 영상 프레임 정지/교체 "+expected);
        }
        IEnumerator UiCinematicShots()
        {
            lobby.StartGate();yield return UiWaitRootMovie(-1,NativeLobby.WorldMovie);var video=lobby.CurrentVideo;float deadline;
            var catalog=JsonUtility.FromJson<LobbySubtitleData>(Resources.Load<TextAsset>("Data/lobby_frontend").text);LobbyCaptionLanguage selected=null,english=null;foreach(var language in catalog.captions){if(language.code=="en")english=language;if(language.code==lobby.Language)selected=language;}selected=selected??english;LobbyCaptionCue longest=null;foreach(var cue in selected.cues)if(!string.IsNullOrEmpty(cue.text)&&(longest==null||cue.text.Length>longest.text.Length))longest=cue;if(longest==null)throw new InvalidOperationException("실제 자막 cue 누락");
            double seek=longest.start+NativeLobby.WorldCueOffset+Math.Min(.5,(longest.end-longest.start)*.25);video.Seek(seek);deadline=Time.realtimeSinceStartup+10;while(Time.realtimeSinceStartup<deadline&&(video.Time<longest.start+NativeLobby.WorldCueOffset||video.Time>longest.end+NativeLobby.WorldCueOffset))yield return null;yield return new WaitForSecondsRealtime(.35f);if(lobby.SubtitleText.Length==0)throw new InvalidOperationException("실제 시네마틱 자막 미표시");overlapCoverage.worldCues.Add(new UiWideCue{width=Screen.width,height=Screen.height,language=overlapLanguage,start=longest.start,end=longest.end,requested=seek,observed=video.Time,caption=lobby.SubtitleText});
            yield return UiOverlapShot("시네마틱");var toggle=typeof(NativeLobby).GetMethod("ToggleLanguages",BindingFlags.Instance|BindingFlags.Public|BindingFlags.NonPublic);toggle.Invoke(lobby,null);if(!(bool)typeof(NativeLobby).GetField("showLanguages",BindingFlags.Instance|BindingFlags.NonPublic).GetValue(lobby))throw new InvalidOperationException("시네마틱 실제 언어목록 미개방");yield return UiOverlapShot("시네마틱언어");toggle.Invoke(lobby,null);lobby.TogglePlayback();yield return UiOverlapShot("시네마틱일시정지");lobby.ReplayIntro();
        }

        IEnumerator UiArrowShots()
        {
            var prior=regionHud.ToGUI;string[] names={"raT","raHas","raX","raY","raLabel"};var fields=new FieldInfo[names.Length];var values=new object[names.Length];for(int i=0;i<names.Length;i++){fields[i]=typeof(NativeRegionHud).GetField(names[i],BindingFlags.Instance|BindingFlags.NonPublic);values[i]=fields[i].GetValue(regionHud);}
            try{for(int direction=0;direction<8;direction++){float angle=direction*Mathf.PI/4;var screen=NativeUiViewport.ScreenInDesign;var target=screen.center+new Vector2(Mathf.Cos(angle)*screen.width,Mathf.Sin(angle)*screen.height);regionHud.ToGUI=(x,y)=>target;fields[0].SetValue(regionHud,1000000);fields[1].SetValue(regionHud,true);fields[2].SetValue(regionHud,Simulation.Player.X+2000);fields[3].SetValue(regionHud,Simulation.Player.Y-2000);fields[4].SetValue(regionHud,lobby.Language=="ko"?"북동 · 번개":"Northeast · Lightning");yield return UiOverlapShot("지역유도"+direction);}}finally{regionHud.ToGUI=prior;for(int i=0;i<fields.Length;i++)fields[i].SetValue(regionHud,values[i]);}
        }

        IEnumerator UiOverlapCaptureBody()
        {
            overlapOutput=Argument("-output");
            if(!NativeQaSandbox.Active||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput)){Debug.LogError("겹침 검사는 격리 저장·절대 출력 경로 필요");Application.Quit(3);yield break;}
            Directory.CreateDirectory(overlapOutput);overlapCoverage=new UiOverlapCoverage();SelectOverlapLanguages();
            using(var hash=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))overlapCoverage.runtimeSha256=BitConverter.ToString(hash.ComputeHash(binary)).Replace("-","").ToLowerInvariant();
            overlapCoverage.unityVersion=Application.unityVersion;overlapCoverage.device=SystemInfo.graphicsDeviceName;overlapCoverage.deviceType=SystemInfo.graphicsDeviceType.ToString();
            smokeActive=true;pauseSmoke=true;lobby.AutomatedInput=true;lobby.SetPlaybackFocus(true);SetGameFocus(true);
            gameObject.AddComponent<NativeUiAudit.Host>();NativeUiAudit.Active=false;yield return null;yield return null;
            foreach(var size in new[]{new Vector2Int(2560,1600),new Vector2Int(1920,1080),new Vector2Int(2560,1080),new Vector2Int(3840,1080),new Vector2Int(1600,900)})
            foreach(string language in overlapCoverage.languages)
            {
                overlapLanguage=language;lobby.SetLanguage(language);stageClear.LocaleCode=language;
                Debug.Log("UI_SIZE_REQUEST "+size+" before="+Screen.width+"x"+Screen.height+" display="+Screen.currentResolution);Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
                if(Screen.width!=size.x||Screen.height!=size.y){UiWideSetClientSize(size.x,size.y);yield return null;}
#endif
                float sizeDeadline=Time.realtimeSinceStartup+5;while((Screen.width!=size.x||Screen.height!=size.y)&&Time.realtimeSinceStartup<sizeDeadline)yield return null;Debug.Log("UI_SIZE_OBSERVED "+Screen.width+"x"+Screen.height+" mode="+Screen.fullScreenMode);if(Screen.width!=size.x||Screen.height!=size.y)throw new InvalidOperationException("요청/실제 해상도 불일치 "+size+" actual="+Screen.width+"x"+Screen.height);
                menu=false;Running=false;pauseMenu.Reset();stageClear.Hide();
                lobby.ReplayIntro();typeof(NativeLobby).GetField("since",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(lobby,16f);
                yield return UiOverlapShot("첫화면");yield return UiCinematicShots();
                lobby.Begin();yield return UiWaitRootMovie(-3,"fdg_intro.mp4");yield return UiOverlapShot("브랜드인트로");lobby.AdvanceSplash();yield return new WaitForSecondsRealtime(1.1f);yield return UiWaitRootMovie(-2,NativeLobby.TitleMovie);yield return UiOverlapShot("메뉴");
                lobby.ShowLobby();lobby.Characters.TryRestore(new[]{"검수"+overlapCoverage.frames.Count.ToString("000")},0);yield return UiOverlapShot("로비");
                lobby.OpenCharacterCreation();
                for(int n=0;n<5;n++){lobby.ChooseCharacterVisual(n);yield return UiWaitCharacterMovie(n);yield return UiOverlapShot("캐릭터선택"+n);}
                #if UNITY_STANDALONE_WIN
                if(language=="ko"){var field=typeof(NativeLobby).GetField("characterStep",BindingFlags.Instance|BindingFlags.NonPublic);var check=new UiWideInputCheck{width=Screen.width,height=Screen.height};yield return UiWideClick(1790,1018);check.lockedBlocked=(int)field.GetValue(lobby)==1;lobby.ChooseCharacterVisual(0);yield return null;yield return UiWideClick(1790,1018);check.nameOpened=(int)field.GetValue(lobby)==2;wideInputChecks.Add(check);File.WriteAllText(Path.Combine(overlapOutput,"실제_마우스_역변환.json"),JsonUtility.ToJson(new UiWideInputReport{checks=wideInputChecks},true));if(!check.lockedBlocked||!check.nameOpened)throw new InvalidOperationException("실제 마우스 안전영역 역변환 실패");}
                else
#endif
                {lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();}yield return UiOverlapShot("이름입력");lobby.CloseCharacterCreation();
                lobby.AutomatedInput=false;
                if(!lobby.BeginCharacterEntry(false)||lobby.StartupCaptureState.Page!=FrontendEntryPage.Loading)throw new InvalidOperationException("실제 신규 캐릭터 로딩 진입 누락");
                yield return UiOverlapShot("로딩");
                float deadline=Time.realtimeSinceStartup+12;while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline)yield return null;
                if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis)throw new InvalidOperationException("신규 연출 실제 상태 누락");yield return new WaitForSecondsRealtime(1);yield return UiOverlapShot("신규연출");for(int attempt=0;attempt<32&&(lobby.StartupCaptureState.Line==null||string.IsNullOrEmpty(lobby.StartupCaptureState.Line.text)||string.IsNullOrEmpty(lobby.StartupCaptureState.Line.speaker));attempt++){lobby.StartupCaptureState.Advance();yield return null;}var line=lobby.StartupCaptureState.Line;if(line==null||string.IsNullOrEmpty(line.text)||string.IsNullOrEmpty(line.speaker))throw new InvalidOperationException("신규 연출 실제 대사 누락");if(lobby.StartupCaptureState.VisibleCharacters<line.text.Replace("\n","").Length)lobby.StartupCaptureState.Advance();lobby.ForceStartupContinue=true;yield return new WaitForSecondsRealtime(1);yield return UiOverlapShot("신규연출완료");lobby.ForceStartupContinue=null;lobby.StartupCaptureState.Skip();yield return null;
                for(int n=0;n<4;n++){yield return new WaitForSecondsRealtime(.3f);if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Guide||lobby.StartupCaptureState.GuideStep!=n)throw new InvalidOperationException("튜토리얼 상태 누락 "+n);yield return UiOverlapShot("튜토리얼"+n);lobby.StartupCaptureState.Advance();}
                lobby.StartupCaptureState.Skip();lobby.SelectPreview();lobby.EnterNativeTest();
                frontendEntryInputFence=false;Running=false;menu=false;EndFirstPractice(true);Running=false;
                areaTitle.Hide();levelUp.Hide();yield return UiOverlapShot("HUD");yield return UiArrowShots();regionHud.ForcedBannerAge=1;regionHud.ShowBanner(Simulation,0,false);yield return UiOverlapShot("지역진입");regionHud.ShowBanner(Simulation,0,true);yield return UiOverlapShot("지역정화");regionHud.ForcedBannerAge=null;regionHud.Reset();
                if(language=="ko"){var load=Simulation.Stage;int oldPhase=load.LoadPhase;double oldT=load.LoadT,oldFade=load.LoadFade;load.LoadPhase=2;load.LoadT=35;load.LoadFade=1;foreach(int image in NativeLoadingSelection.Images){NativeLoadingArtwork.ForcedImage=image;yield return UiOverlapShot("전환로딩"+image.ToString("00"));}NativeLoadingArtwork.ForcedImage=1;NativeLoadingArtwork.SimulateMissingWide=true;yield return UiOverlapShot("전환로딩폴백");NativeLoadingArtwork.ForcedImage=-1;NativeLoadingArtwork.SimulateMissingWide=false;load.LoadPhase=oldPhase;load.LoadT=oldT;load.LoadFade=oldFade;}
                BeginFirstPractice();Running=false;yield return UiOverlapShot("실습안내");firstPractice.Start();yield return UiOverlapShot("실습진행");practiceScroll=new Vector2(0,9999);yield return UiOverlapShot("실습스크롤");EndFirstPractice(true);Running=false;practiceScroll=Vector2.zero;
                menu=true;pauseMenu.Reset();pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("일시정지");
                pauseMenu.Navigation.PointAt(3);ApplyPauseCommand(pauseMenu.HandleKey(PauseKey.Accept,false,false));pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("종료확인");
                pauseMenu.Reset();pauseMenu.ShowSettings();
                for(int n=0;n<4;n++){pauseMenu.Navigation.SelectTab(n);pauseMenu.Navigation.ObserveReleased(false);yield return UiOverlapShot("설정"+n);pauseMenu.A15SetScrollForQa(9999);yield return UiOverlapShot("설정스크롤"+n);pauseMenu.A15SetScrollForQa(0);}
                pauseMenu.Navigation.SelectTab(2);pauseMenu.Navigation.ObserveReleased(false);pauseMenu.A15OpenSelectForQa("optBgmTrack");yield return UiOverlapShot("설정목록");
                pauseMenu.Reset();menu=false;Running=false;
                SetInventory(true);yield return UiOverlapShot("인벤토리");for(int page=1;page<=3;page++){typeof(NativeInventory).GetMethod("SetPage",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(inventory,new object[]{page});yield return UiOverlapShot(page==1?"봉안함":page==2?"결정체":"보관함");}SetInventory(false);
                SetSkills(true,6);yield return UiOverlapShot("스킬");for(int slot=0;slot<16;slot++){if(slot==6)continue;skills.Select(slot);yield return UiOverlapShot("스킬슬롯"+slot.ToString("00"));}SetSkills(false,6);
                SetForge(true);forge.SelectTab("upgrade");yield return UiOverlapShot("대장간");foreach(string tab in new[]{"potion","salvage","reroll","crystal","craft"}){forge.SelectTab(tab);yield return UiOverlapShot("대장간-"+tab);}SetForge(false);
                SetStats(true);yield return UiOverlapShot("능력치");SetStats(false);
                stageClear.Show(new NativeStageClearOverlay.Input{kind=NativeStageClearOverlay.Kind.Zone,stageKills=137,totalSpawned=168,clearSeconds=88,regionsCleared=4,bossKilled=true,deaths=0,dmgTaken=120,comboMax=32,statPointsAwarded=10,statPointsBalance=20});stageClear.ForcedAge=2;
                yield return UiOverlapShot("클리어");stageClear.Hide();
                Toast(language=="ko"?"희귀한 전리품을 획득했습니다. 가장자리 알림 배치를 확인합니다.":"Rare loot collected. The notification remains at the physical screen edge.");yield return UiOverlapShot("일반알림");noticeUntil=0;
                var oldHp=Simulation.Player.Hp;string oldState=Simulation.Player.State;var oldTicks=Simulation.Player.StateTicks;Simulation.Player.Hp=0;Simulation.Player.State="fallen";Simulation.Player.StateTicks=180;yield return UiOverlapShot("부활대기");
                Simulation.Player.State="dead";death.Show(new NativeDeathOverlay.Info{kills=Simulation.Kills,chapter=0,expLoss=-1,maxCombo=-1,deaths=1,damageLog=null});death.ForcedAge=3;yield return UiOverlapShot("사망");death.Hide();death.ForcedAge=null;Simulation.Player.Hp=oldHp;Simulation.Player.State=oldState;Simulation.Player.StateTicks=oldTicks;
            }
            NativeUiAudit.Active=false;File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE UI_OVERLAP");Application.Quit(0);
        }
    }
}
