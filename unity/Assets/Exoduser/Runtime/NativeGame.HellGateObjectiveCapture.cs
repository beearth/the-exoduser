using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        const string HellGateObjectiveCaptureFlag="--unity-hellgate-objective-check";
        bool hellGateCaptureActive;
        int hellGateCapturePaints;
        [Serializable] sealed class HellGateShot
        {
            public string file,locale,state,heading,detail,camera;
            public int width,height,kills,required,cleared,liveAnglers,remainingRegions,repaints,tick,worldPixels,worldNonBlack;
            public float playerX,playerY,worldNonBlackRatio;
            public bool anglerAlive,gateOpen,textFits,tickFrozen;
        }
        [Serializable] sealed class HellGateCaptureReport
        {
            public string scope="정상 제품 진입 API로 들어간 실제 1-1 필드 위치·Core 상태의 최종 월드+HUD 화면. 진행 상태 주입 없음. 촬영 중만 틱 정지. 자연 전투·완주 증거가 아님. 시각 판정은 Mac 검수자 담당.";
            public int schemaVersion=2;
            public string sandboxRoot,persistentNamespace,captureMethod="WaitForEndOfFrame + ScreenCapture.CaptureScreenshotAsTexture";
            public List<HellGateShot> shots=new List<HellGateShot>();
            public string error="";
        }
        IEnumerator HellGateObjectiveCapture()
        {
            var report=new HellGateCaptureReport();var stack=new Stack<IEnumerator>();stack.Push(HellGateCaptureBody(report));
            while(stack.Count>0){
                object current=null;bool more=false;Exception failure=null;
                try{more=stack.Peek().MoveNext();if(more)current=stack.Peek().Current;}catch(Exception error){failure=error;}
                if(failure!=null){
                    report.error=failure.ToString();Debug.LogError("HELLGATE_OBJECTIVE_CAPTURE_FAILED "+failure);
                    string output=Argument("-output");if(!string.IsNullOrEmpty(output)&&Directory.Exists(output))File.WriteAllText(Path.Combine(output,"hellgate-objectives.json"),JsonUtility.ToJson(report,true));
                    Application.Quit(2);yield break;
                }
                if(!more){stack.Pop();continue;}if(current is IEnumerator child){stack.Push(child);continue;}yield return current;
            }
        }
        IEnumerator HellGateCaptureBody(HellGateCaptureReport report)
        {
            string output=Argument("-output");
            if(!NativeQaSandbox.Active||string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))throw new InvalidOperationException("격리 세이브와 절대 -output 경로가 필요합니다");
            if(Application.isBatchMode||SystemInfo.graphicsDeviceType==UnityEngine.Rendering.GraphicsDeviceType.Null)throw new InvalidOperationException("최종 게임 프레임 캡처는 GPU 창 렌더 경로가 필요합니다. 무창 실행기를 사용하되 -batchmode/-nographics를 붙이지 마십시오");
            if(!NativeRemodel3D.Requested)throw new InvalidOperationException("실제 3D 필드 캡처에는 --remodel3d가 필요합니다");
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            report.sandboxRoot=NativeQaSandbox.Root;report.persistentNamespace=Application.persistentDataPath;
            Debug.Log("HELLGATE_CAPTURE_SANDBOX root="+report.sandboxRoot+" namespace="+report.persistentNamespace+" product="+Application.productName);
            string code=Argument("-qa-locale");if(string.IsNullOrEmpty(code))code="ko";lobby.SetLanguage(code);
            yield return HellGateEnterActualField();
            // Freeze the real state only while taking the two views. Keep normal world visibility/camera updates.
            menu=false;Running=false;hellGateCaptureActive=true;pauseSmoke=true;frontendEntryInputFence=false;
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();areaTitle.Hide();
            float worldDeadline=Time.realtimeSinceStartup+60;
            do{
                if(r3Failed)throw new InvalidOperationException("RM1_Slice 필드 로드 실패. 빌드에 -remodel-scenes 1이 필요합니다");
                yield return null;
            }while((!Remodel3DReady||!NativeRemodel3D.Active||r3Cam==null||!r3Cam.isActiveAndEnabled)&&Time.realtimeSinceStartup<worldDeadline);
            if(!Remodel3DReady||!NativeRemodel3D.Active||r3Cam==null||!r3Cam.isActiveAndEnabled)throw new InvalidOperationException("실제 필드 카메라 준비 시간 초과");
            var sim=Simulation;var fieldGoal=NativeHellGateObjective.Read(sim);int frozen=sim.TickCount;
            if(!fieldGoal.Visible||sim.Stage.LoadPhase>0||!Map.CanMove(sim.Player.X,sim.Player.Y,sim.Player.Radius))throw new InvalidOperationException("실제 걷기 가능한 1-1 필드 시작 상태가 아닙니다");
            foreach(int width in new[]{1920,3840}){
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return null;yield return null;
                float deadline=Time.realtimeSinceStartup+5;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080)throw new InvalidOperationException("요청/실제 해상도 불일치 "+width+"x1080 / "+Screen.width+"x"+Screen.height);
                string name=width+"x1080-"+LobbyLanguage.Normalize(code)+"-field-live";
                var objectiveState=NativeHellGateObjective.Read(sim);NativeHellGateLabels.Lines(objectiveState,code,out string heading,out string detail);
                var markers=new List<NativeMinimapObjective>();NativeMinimapObjectives.Collect(sim,markers);int regions=0,anglers=0;
                foreach(var marker in markers){if(marker.Kind==NativeMinimapObjectiveKind.Region)regions++;if(marker.Kind==NativeMinimapObjectiveKind.Angler)anglers++;}
                var shot=new HellGateShot{file=name+".png",locale=code,state="field-live",heading=heading,detail=detail,width=Screen.width,height=Screen.height,kills=objectiveState.Kills,required=objectiveState.Required,cleared=objectiveState.Cleared,anglerAlive=objectiveState.AnglerAlive,gateOpen=objectiveState.GateOpen,remainingRegions=regions,liveAnglers=anglers,playerX=sim.Player.X,playerY=sim.Player.Y,tick=frozen};
                report.shots.Add(shot);yield return HellGateCaptureFrame(output,name,shot);
                shot.textFits=objective.GoalTextFits;shot.tickFrozen=sim.TickCount==frozen;
                File.WriteAllText(Path.Combine(output,"hellgate-objectives.json"),JsonUtility.ToJson(report,true));
                if(!shot.textFits||!shot.tickFrozen)throw new InvalidOperationException("목표 글자 잘림 또는 촬영 중 틱 진행");
            }
            Debug.Log("HELLGATE_OBJECTIVE_CAPTURE_READY_FOR_VISUAL_REVIEW "+report.shots.Count);Application.Quit(0);
        }
        IEnumerator HellGateEntryBoundary(string boundary)
        {
            var entry=new FullRunReceipt();yield return FullRunWaitFrontend(boundary,entry);
            if(!string.IsNullOrEmpty(entry.frontendFailure))throw new InvalidOperationException("실제 필드 진입 실패 "+entry.frontendFailure);
        }
        IEnumerator HellGateEnterActualField()
        {
            Running=false;lobby.SetPlaybackFocus(true);lobby.ShowLobby();yield return HellGateEntryBoundary("hellgate-lobby");
            string fresh="HG"+(DateTime.Now.Ticks%1000000).ToString("000000");
            if(!lobby.OpenCharacterCreation())throw new InvalidOperationException("캐릭터 선택 진입 실패");
            yield return HellGateEntryBoundary("hellgate-select");
            if(!lobby.ChooseCharacterVisual(0)||!lobby.ConfirmCharacterVisual())throw new InvalidOperationException("캐릭터 외형 선택 실패");
            yield return HellGateEntryBoundary("hellgate-name");
            if(!lobby.CreateCharacter(fresh))throw new InvalidOperationException("격리 캐릭터 생성 실패");
            yield return HellGateEntryBoundary("hellgate-created");
            lobby.ShowLobby();yield return HellGateEntryBoundary("hellgate-entry-lobby");
            if(!lobby.BeginCharacterEntry(false))throw new InvalidOperationException("정상 캐릭터 게임 진입 실패");
            yield return HellGateEntryBoundary("hellgate-game");
            float deadline=Time.realtimeSinceStartup+30;
            while(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}
            if(lobby.StartupCaptureState.Page!=FrontendEntryPage.Nemesis)throw new InvalidOperationException("시작 장면 진입 시간 초과");
            lobby.StartupCaptureState.Skip();yield return null;lobby.StartupCaptureState.Skip();yield return null;
            deadline=Time.realtimeSinceStartup+25;
            while(lobby.IsBlocking&&Time.realtimeSinceStartup<deadline){lobby.SetPlaybackFocus(true);yield return null;}
            if(lobby.IsBlocking)throw new InvalidOperationException("시작 장면 종료 시간 초과");
            if(firstPractice!=null)EndFirstPractice(true);
        }
        IEnumerator HellGateCaptureFrame(string output,string name,HellGateShot shot)
        {
            int paints=hellGateCapturePaints;
            for(int i=0;i<3;i++)yield return null;
            yield return new WaitForEndOfFrame();
            shot.repaints=hellGateCapturePaints-paints;shot.camera=HudCamera.name;
            if(shot.repaints<1)throw new InvalidOperationException("실제 HUD Repaint 없음");
            var frame=ScreenCapture.CaptureScreenshotAsTexture();
            if(frame==null)throw new InvalidOperationException("최종 게임 화면 읽기 실패");
            try{
                File.WriteAllBytes(Path.Combine(output,name+".png"),frame.EncodeToPNG());
                if(frame.width!=shot.width||frame.height!=shot.height)throw new InvalidOperationException("최종 프레임 크기 불일치");
                float scale=NativeUiViewport.Edges.Scale;
                HellGateCrop(frame,NativeObjectivePanel.Bounds(NativeUiViewport.Edges.Width,true),scale,Path.Combine(output,name+"-goal-3x.png"));
                HellGateCrop(frame,new Rect(4,4,150,150),scale,Path.Combine(output,name+"-minimap-3x.png"));
                int w=Math.Min(600,frame.width/2),h=Math.Min(500,frame.height/2);
                var pixels=frame.GetPixels((frame.width-w)/2,(frame.height-h)/2,w,h);shot.worldPixels=pixels.Length;
                foreach(var pixel in pixels)if(Mathf.Max(pixel.r,Mathf.Max(pixel.g,pixel.b))>.02f)shot.worldNonBlack++;
                shot.worldNonBlackRatio=(float)shot.worldNonBlack/shot.worldPixels;
                Debug.Log("HELLGATE_CAPTURE_WORLD camera="+shot.camera+" position="+shot.playerX+","+shot.playerY+" pixels="+shot.worldNonBlack+"/"+shot.worldPixels);
                if(shot.worldNonBlackRatio<=.1f)throw new InvalidOperationException("월드 영역 검정/미렌더: "+shot.worldNonBlack+"/"+shot.worldPixels);
            }finally{Destroy(frame);}
        }
        static void HellGateCrop(Texture2D source,Rect edge,float scale,string path)
        {
            int x=Mathf.Max(0,Mathf.FloorToInt(edge.x*scale)),y=Mathf.Max(0,Mathf.FloorToInt(source.height-edge.yMax*scale));
            int w=Mathf.Min(source.width-x,Mathf.CeilToInt(edge.width*scale)),h=Mathf.Min(source.height-y,Mathf.CeilToInt(edge.height*scale));
            var pixels=source.GetPixels(x,y,w,h);var enlarged=new Color[w*h*9];int width=w*3;
            for(int py=0;py<h*3;py++)for(int px=0;px<width;px++)enlarged[py*width+px]=pixels[(py/3)*w+px/3];
            var crop=new Texture2D(width,h*3,TextureFormat.RGB24,false);try{crop.SetPixels(enlarged);crop.Apply();File.WriteAllBytes(path,crop.EncodeToPNG());}finally{UnityEngine.Object.Destroy(crop);}
        }
    }
}
