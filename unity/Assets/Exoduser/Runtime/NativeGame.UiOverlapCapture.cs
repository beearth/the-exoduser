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
        [Serializable] sealed class UiOverlapCoverage {public int schemaVersion=2,inputIsolationChecks,simulationFrozenChecks;public string runtimeSha256,unityVersion,device,deviceType;public string scope="실제 Player OnGUI·제품 API 상태 전환/검수 시계/실제 미디어 seek/8방향 투영 표본, OS 입력/자연 클리어와 구분";public string[] resolutions={"1920x1080","2560x1080","3840x1080","1600x900","2560x1600"};public string[] languages={"ko","de"};public List<string> pages=new List<string>(),frames=new List<string>();public List<UiWideMovie> movies=new List<UiWideMovie>();public List<UiWideTitle> titleArt=new List<UiWideTitle>();public List<UiWideCue> worldCues=new List<UiWideCue>();public List<UiWideTipKeyChange> tipKeyChanges=new List<UiWideTipKeyChange>();public int[] loadingImages=new List<int>(NativeLoadingSelection.Images).ToArray();}
        [Serializable] sealed class UiWideTitle {public int width,height,framesBefore,framesAfter,videoFramesBefore,videoFramesAfter;public string language,mode;public double timeBefore,timeAfter;public bool pausedClockPreserved,resumed;}
        IEnumerator UiWaitTitleArt()
        {
            float deadline=Time.realtimeSinceStartup+10;
            while(lobby.TitleRenderMode!="video"&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}
            if(lobby.TitleRenderMode!="video")throw new InvalidOperationException("C2 영상 타이틀 영상 디코드 실패 "+lobby.TitleRenderMode);
            var row=new UiWideTitle{width=Screen.width,height=Screen.height,language=overlapLanguage,mode=lobby.TitleRenderMode,timeBefore=lobby.TitleMotionTime,framesBefore=lobby.TitleRenderedFrames,videoFramesBefore=lobby.TitleVideoFrames};
            yield return new WaitForSecondsRealtime(.35f);row.timeAfter=lobby.TitleMotionTime;row.framesAfter=lobby.TitleRenderedFrames;row.videoFramesAfter=lobby.TitleVideoFrames;
            if(row.videoFramesAfter<=row.videoFramesBefore||row.framesAfter<=row.framesBefore||row.timeAfter<=row.timeBefore)throw new InvalidOperationException("C2 영상 타이틀 모션 정지");
            bool paused=lobby.TitleMotionPaused;
            try{lobby.TitleMotionPaused=true;double t=lobby.TitleMotionTime;yield return new WaitForSecondsRealtime(.15f);row.pausedClockPreserved=lobby.TitleMotionTime==t;}
            finally{lobby.TitleMotionPaused=paused;}
            double resume=lobby.TitleMotionTime;yield return new WaitForSecondsRealtime(.15f);row.resumed=lobby.TitleMotionTime>resume;
            overlapCoverage.titleArt.Add(row);
            if(!row.pausedClockPreserved||!row.resumed)throw new InvalidOperationException("C2 영상 타이틀 정지/재개 실패");
        }
        [Serializable] sealed class UiWideTipKeyChange {public int width,height,image;public string language,inventoryBefore,pickupBefore,inventoryChanged,pickupChanged,expectedText;public bool restored;}
        UiWideTipKeyChange activeTipKeyChange;
        void BeginLoadingTipKeyChange(int image)
        {
            var keys=NativeKeyBindInput.Bindings;activeTipKeyChange=new UiWideTipKeyChange{width=Screen.width,height=Screen.height,image=image,language=overlapLanguage,inventoryBefore=keys.Primary("inventory"),pickupBefore=keys.Primary("interact")};
            if(!keys.TrySet("inventory","KeyV",false,out string invError)||!keys.TrySet("interact","F2",false,out string pickupError))throw new InvalidOperationException("검수 전용 팁 키 변경 실패");
            activeTipKeyChange.inventoryChanged=LoadingTipKey("inventory");activeTipKeyChange.pickupChanged=LoadingTipKey("interact");activeTipKeyChange.expectedText=NativeLoadingTips.Pick((image-1)%NativeLoadingTips.Count,English,activeTipKeyChange.inventoryChanged,activeTipKeyChange.pickupChanged);
        }
        void RestoreLoadingTipKeyChange()
        {
            if(activeTipKeyChange==null)return;var row=activeTipKeyChange;var keys=NativeKeyBindInput.Bindings;
            keys.TrySet("inventory",row.inventoryBefore,false,out string invError);keys.TrySet("interact",row.pickupBefore,false,out string pickupError);
            row.restored=keys.Primary("inventory")==row.inventoryBefore&&keys.Primary("interact")==row.pickupBefore;overlapCoverage.tipKeyChanges.Add(row);activeTipKeyChange=null;
            if(!row.restored)throw new InvalidOperationException("검수 전용 팁 키 복원 실패");
        }
        [Serializable] sealed class UiWideCue {public int width,height;public string language,caption;public double start,end,requested,observed;}
        [Serializable] sealed class UiWideMovie {public int width,height,visual,textureWidth,textureHeight;public string language,file;public long frameBefore,frameAfter;public double timeBefore,timeAfter;public bool prepared,playing;}
        [Serializable] sealed class UiWideInputCheck {public int width,height;public bool lockedBlocked,nameOpened;public string inputPath;}
        [Serializable] sealed class UiWideInputReport {public List<UiWideInputCheck> checks;}
        readonly List<UiWideInputCheck> wideInputChecks=new List<UiWideInputCheck>();
        UiOverlapCoverage overlapCoverage;
        string overlapOutput,overlapLanguage;
        bool overlapPhysicalClick,overlapUiFreeze,overlapActualFrontend;
        bool UiOverlapFreezesSimulation=>overlapUiFreeze&&overlapCoverage!=null;
        bool UiOverlapOwnsInput=>overlapCoverage!=null&&!overlapPhysicalClick&&!overlapActualFrontend;
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
        IEnumerator UiOverlapShot(string page,bool settle=true)
        {
            int frozenTick=Simulation==null?0:Simulation.TickCount;
            if(settle)yield return new WaitForSecondsRealtime(.18f);NativeUiAudit.Active=true;if(settle)yield return null;yield return new WaitForEndOfFrame();
            if(lobby.enabled){if(!UiOverlapOwnsInput||!lobby.AutomatedInput)throw new InvalidOperationException("실제 캡처 입력 소유권 누락 "+page);overlapCoverage.inputIsolationChecks++;}
            if(UiOverlapFreezesSimulation){if(Simulation!=null&&Simulation.TickCount!=frozenTick)throw new InvalidOperationException("실제 UI 캡처 Simulation 틱 진행 "+page);overlapCoverage.simulationFrozenChecks++;}
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
                if(error!=null){RestoreLoadingTipKeyChange();Debug.LogError("UI_OVERLAP_FAILED "+error);SaveOverlapCaptureProgress();lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(2);yield break;}
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
        IEnumerator UiWidePostClick(int px,int py)
        {
            IntPtr own=IntPtr.Zero;uint pid=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;
            UiWideWindows((w,s)=>{UiWideProcess(w,out uint id);var c=new System.Text.StringBuilder(128);UiWideClass(w,c,128);if(id==pid&&c.ToString()=="UnityWndClass"){own=w;return false;}return true;},IntPtr.Zero);
            if(own==IntPtr.Zero)throw new InvalidOperationException("자기 숨은 Player 창 없음");
            IntPtr point=new IntPtr((py<<16)|(px&65535));
            if(!UiWidePost(own,0x200,IntPtr.Zero,point)||!UiWidePost(own,0x201,new IntPtr(1),point))throw new InvalidOperationException("자기 창 누름 전달 실패");
            yield return new WaitForSecondsRealtime(.12f);
            if(!UiWidePost(own,0x202,IntPtr.Zero,point))throw new InvalidOperationException("자기 창 해제 전달 실패");
            yield return new WaitForSecondsRealtime(.2f);
        }
#endif

        static bool UiUsesGuiClicks {
            get {
#if UNITY_STANDALONE_WIN
                return Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-gui-clicks")>=0;
#else
                return true;
#endif
            }
        }
        IEnumerator UiWideClick(float x,float y)
        {
            var a=NativeUiViewport.Edges;int px=Mathf.RoundToInt(Screen.width-(1920-x)*a.Scale),py=Mathf.RoundToInt(y*a.Scale);
            var history=NativeScreenTransition.History;int before=history==null||history.Count==0?0:history[history.Count-1].id;
            overlapPhysicalClick=true;lobby.AutomatedInput=false;
            try {
                if(UiUsesGuiClicks){
                    foreach(var type in new[]{EventType.MouseDown,EventType.MouseUp}){
                        int serial=lobby.QueueQaPointer(type,new Vector2(px,py));float deliveredBy=Time.realtimeSinceStartup+2;
                        while(lobby.QaPointerDelivered<serial&&Time.realtimeSinceStartup<deliveredBy)yield return null;
                        if(lobby.QaPointerDelivered<serial)throw new InvalidOperationException("제품 OnGUI QA pointer 수신 시간초과");
                        yield return null;
                    }
                }
#if UNITY_STANDALONE_WIN
                else yield return UiWidePostClick(px,py);
#endif
                yield return new WaitForEndOfFrame();float deadline=Time.realtimeSinceStartup+15;
                while(NativeScreenTransition.Busy&&Time.realtimeSinceStartup<deadline)yield return null;
                if(NativeScreenTransition.Busy)throw new InvalidOperationException("클릭 뒤 화면 전환 미완료(15s)");
                history=NativeScreenTransition.History;
                if(history!=null)foreach(var record in history)if(record.id>before&&(record.failed||record.cancelled))throw new InvalidOperationException("이번 클릭 뒤 제품 전환 실패: "+record.error);
                yield return new WaitForEndOfFrame();
            }finally{overlapPhysicalClick=false;lobby.AutomatedInput=true;}
        }
        IEnumerator UiNameGateAtCurrentSize()
        {
            var field=typeof(NativeLobby).GetField("characterStep",BindingFlags.Instance|BindingFlags.NonPublic);
            var check=new UiWideInputCheck{width=Screen.width,height=Screen.height,inputPath=UiUsesGuiClicks?"Unity IMGUI event via actual NativeLobby.OnGUI":"Windows own hidden HWND WM mouse"};
            yield return UiWideClick(1790,1018);check.lockedBlocked=(int)field.GetValue(lobby)==1;
            lobby.ChooseCharacterVisual(0);yield return null;yield return UiWideClick(1790,1018);check.nameOpened=(int)field.GetValue(lobby)==2;
            wideInputChecks.Add(check);File.WriteAllText(Path.Combine(overlapOutput,"실제_마우스_역변환.json"),JsonUtility.ToJson(new UiWideInputReport{checks=wideInputChecks},true));
            if(!check.lockedBlocked||!check.nameOpened)throw new InvalidOperationException("잠긴 직업/이름 열기 실제 OnGUI hit-test 실패");
        }
        IEnumerator UiNameGateOnly()
        {
            overlapCoverage.languages=new[]{"ko"};overlapCoverage.scope="이름 열기 전용 1회 Player: 잠긴 직업 차단/실제 OnGUI hit-test 5해상도; 전투·M1·전체 UI 검사 아님";
            overlapLanguage="ko";lobby.SetLanguage("ko");
            foreach(var size in new[]{new Vector2Int(2560,1600),new Vector2Int(1920,1080),new Vector2Int(2560,1080),new Vector2Int(3840,1080),new Vector2Int(1600,900)}){
                Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
                if(Screen.width!=size.x||Screen.height!=size.y){UiWideSetClientSize(size.x,size.y);yield return null;}
#endif
                float deadline=Time.realtimeSinceStartup+5;
                while((Screen.width!=size.x||Screen.height!=size.y)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=size.x||Screen.height!=size.y)throw new InvalidOperationException("이름 검사 실제 해상도 불일치");
                menu=false;Running=false;pauseMenu.Reset();stageClear.Hide();lobby.ShowLobby();
                float lobbyDeadline=Time.realtimeSinceStartup+15;while(NativeScreenTransition.Busy&&Time.realtimeSinceStartup<lobbyDeadline)yield return null;
                if(NativeScreenTransition.Busy)throw new InvalidOperationException("이름 검사 로비 전환 시간초과");
                if(!lobby.OpenCharacterCreation())throw new InvalidOperationException("이름 검사 직업 선택 열기 실패");yield return null;lobby.ChooseCharacterVisual(4);yield return null;
                yield return UiOverlapShot("이름검사-잠긴직업");yield return UiNameGateAtCurrentSize();yield return UiOverlapShot("이름입력");lobby.CloseCharacterCreation();
            }
        }

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

        IEnumerator UiTitleGrid()
        {
            overlapCoverage.resolutions=Parity1102Capture?new[]{"1920x1080","3840x1080"}:new[]{"5120x1440","1920x1080","2560x1080","3840x1080","1600x900","2560x1600"};
            overlapCoverage.scope="C2 영상 타이틀 실제6해상도/선택3언어/모션·정지·재개; OS 입력/자연플레이와 구분";
            foreach(string resolution in overlapCoverage.resolutions)
            foreach(string language in overlapCoverage.languages)
            {
                var parts=resolution.Split('x');int width=int.Parse(parts[0]),height=int.Parse(parts[1]);overlapLanguage=language;lobby.SetLanguage(language);
                Screen.SetResolution(width,height,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=height){UiWideSetClientSize(width,height);yield return null;}
#endif
                float deadline=Time.realtimeSinceStartup+5;while((Screen.width!=width||Screen.height!=height)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=width||Screen.height!=height)throw new InvalidOperationException("실제 타이틀 해상도 불일치 "+resolution);
                lobby.Begin();lobby.AdvanceSplash();yield return new WaitForSecondsRealtime(1.1f);yield return UiWaitTitleArt();yield return UiOverlapShot("메뉴");
                yield return new WaitForSecondsRealtime(Parity1102Capture?10.5f:.5f);yield return UiOverlapShot("메뉴-모션");
                bool paused=lobby.TitleMotionPaused;
                try{lobby.TitleMotionPaused=true;yield return new WaitForSecondsRealtime(.15f);yield return UiOverlapShot("메뉴-정지1");yield return new WaitForSecondsRealtime(.35f);yield return UiOverlapShot("메뉴-정지2");}
                finally{lobby.TitleMotionPaused=paused;}
                yield return new WaitForSecondsRealtime(.5f);yield return UiOverlapShot("메뉴-재개");
            }
        }

        static bool Parity1102Capture=>Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-parity-1102-check")>=0;
        IEnumerator UiOverlapCaptureBody()
        {
            overlapOutput=Argument("-output");
            if(!NativeQaSandbox.Active||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput)){Debug.LogError("겹침 검사는 격리 저장·절대 출력 경로 필요");Application.Quit(3);yield break;}
            Directory.CreateDirectory(overlapOutput);overlapCoverage=new UiOverlapCoverage();overlapUiFreeze=true;SelectOverlapLanguages();if(Parity1102Capture){overlapCoverage.languages=new[]{"ko"};overlapCoverage.resolutions=new[]{"1920x1080","3840x1080"};}
            using(var hash=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))overlapCoverage.runtimeSha256=BitConverter.ToString(hash.ComputeHash(binary)).Replace("-","").ToLowerInvariant();
            overlapCoverage.unityVersion=Application.unityVersion;overlapCoverage.device=SystemInfo.graphicsDeviceName;overlapCoverage.deviceType=SystemInfo.graphicsDeviceType.ToString();
            smokeActive=true;pauseSmoke=true;lobby.AutomatedInput=true;lobby.SetPlaybackFocus(true);SetGameFocus(true);
            gameObject.AddComponent<NativeUiAudit.Host>();NativeUiAudit.Active=false;yield return null;yield return null;
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-name-gate-only")>=0){
                yield return UiNameGateOnly();NativeUiAudit.Active=false;
                File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));
                lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
                Debug.Log("QA_MEDIA_DRAIN_COMPLETE NAME_GATE");NativeLobbyVideo.RequestQuit(0);yield break;
            }
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-parity-third-check")>=0)
            {
                yield return ParityThirdCapture();NativeUiAudit.Active=false;
                File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));
                lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
                Debug.Log("QA_MEDIA_DRAIN_COMPLETE PARITY_THIRD");Application.Quit(0);yield break;
            }
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-title-a-check")>=0||Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-title-c2-check")>=0)
            {
                yield return UiTitleGrid();NativeUiAudit.Active=false;File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));
                lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Debug.Log("QA_MEDIA_DRAIN_COMPLETE TITLE_A");Application.Quit(0);yield break;
            }
            foreach(var size in Parity1102Capture?new[]{new Vector2Int(1920,1080),new Vector2Int(3840,1080)}:new[]{new Vector2Int(2560,1600),new Vector2Int(1920,1080),new Vector2Int(2560,1080),new Vector2Int(3840,1080),new Vector2Int(1600,900)})
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
                lobby.Begin();yield return UiWaitRootMovie(-3,"fdg_intro.mp4");yield return UiOverlapShot("브랜드인트로");lobby.AdvanceSplash();yield return new WaitForSecondsRealtime(1.1f);yield return UiWaitTitleArt();yield return UiOverlapShot("메뉴");
                lobby.ShowLobby();lobby.Characters.TryRestore(new[]{"검수"+overlapCoverage.frames.Count.ToString("000")},0);yield return UiOverlapShot("로비");
                lobby.OpenCharacterCreation();
                for(int n=0;n<5;n++){lobby.ChooseCharacterVisual(n);yield return UiWaitCharacterMovie(n);yield return UiOverlapShot("캐릭터선택"+n);}
                if(language=="ko")yield return UiNameGateAtCurrentSize();
                else {lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();}yield return UiOverlapShot("이름입력");lobby.CloseCharacterCreation();
                overlapActualFrontend=true;lobby.AutomatedInput=false;
                try{
                    if(!lobby.BeginCharacterEntry(false))throw new InvalidOperationException("실제 신규 캐릭터 입장 요청 실패");
                    float entryDeadline=Time.realtimeSinceStartup+15;
                    while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&NativeScreenTransition.Busy&&Time.realtimeSinceStartup<entryDeadline)yield return null;
                    if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis||NativeScreenTransition.State==null||NativeScreenTransition.State.Phase!=ScreenTransitionPhase.Preparing)throw new InvalidOperationException("실제 신규 입장 검정/준비 경계 누락");
                }finally{overlapActualFrontend=false;lobby.AutomatedInput=true;}
                // The product now replaces the legacy logo loading page with its black
                // preparation boundary. Capture its actual full-black repaint after swap.
                yield return UiOverlapShot("신규입장검정",false);
                float deadline=Time.realtimeSinceStartup+15;while(NativeScreenTransition.Busy&&Time.realtimeSinceStartup<deadline)yield return null;
                if(NativeScreenTransition.Busy||NativeScreenTransition.State.Failed||lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis)throw new InvalidOperationException("신규 연출 실제 전환/상태 실패");yield return new WaitForSecondsRealtime(1);yield return UiOverlapShot("신규연출");for(int attempt=0;attempt<32&&(lobby.StartupCaptureState.Line==null||string.IsNullOrEmpty(lobby.StartupCaptureState.Line.text)||string.IsNullOrEmpty(lobby.StartupCaptureState.Line.speaker));attempt++){lobby.StartupCaptureState.Advance();yield return null;}var line=lobby.StartupCaptureState.Line;if(line==null||string.IsNullOrEmpty(line.text)||string.IsNullOrEmpty(line.speaker))throw new InvalidOperationException("신규 연출 실제 대사 누락");if(lobby.StartupCaptureState.VisibleCharacters<line.text.Replace("\n","").Length)lobby.StartupCaptureState.Advance();lobby.ForceStartupContinue=true;yield return new WaitForSecondsRealtime(1);yield return UiOverlapShot("신규연출완료");lobby.ForceStartupContinue=null;lobby.StartupCaptureState.Skip();yield return null;
                for(int n=0;n<4;n++){yield return new WaitForSecondsRealtime(.3f);if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Guide||lobby.StartupCaptureState.GuideStep!=n)throw new InvalidOperationException("튜토리얼 상태 누락 "+n);yield return UiOverlapShot("튜토리얼"+n);lobby.StartupCaptureState.Advance();}
                lobby.StartupCaptureState.Skip();lobby.SelectPreview();lobby.EnterNativeTest();
                frontendEntryInputFence=false;Running=false;menu=false;EndFirstPractice(true);Running=false;
                areaTitle.Hide();levelUp.Hide();yield return UiOverlapShot("HUD");yield return UiArrowShots();regionHud.ForcedBannerAge=1;regionHud.ShowBanner(Simulation,0,false);yield return UiOverlapShot("지역진입");regionHud.ShowBanner(Simulation,0,true);yield return UiOverlapShot("지역정화");regionHud.ForcedBannerAge=null;regionHud.Reset();
                {var load=Simulation.Stage;int oldPhase=load.LoadPhase;double oldT=load.LoadT,oldFade=load.LoadFade;load.LoadPhase=2;load.LoadT=35;load.LoadFade=1;foreach(int image in NativeLoadingSelection.Images){NativeLoadingArtwork.ForcedImage=image;NativeLoadingArtwork.ForcedTip=(image-1)%NativeLoadingTips.Count;if(image==6||image==7)BeginLoadingTipKeyChange(image);try{if(image==NativeLoadingSelection.Images[0])yield return UiOverlapShot("로딩");yield return UiOverlapShot("전환로딩"+image.ToString("00"));}finally{RestoreLoadingTipKeyChange();}}NativeLoadingArtwork.ForcedImage=1;NativeLoadingArtwork.ForcedTip=NativeLoadingTips.Count-1;NativeLoadingArtwork.SimulateMissingWide=true;yield return UiOverlapShot("전환로딩폴백");NativeLoadingArtwork.ForcedImage=-1;NativeLoadingArtwork.ForcedTip=-1;NativeLoadingArtwork.SimulateMissingWide=false;load.LoadPhase=oldPhase;load.LoadT=oldT;load.LoadFade=oldFade;}
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
