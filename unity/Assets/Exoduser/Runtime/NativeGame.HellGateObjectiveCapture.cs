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
        [Serializable] sealed class HellGateShot
        {
            public string file,locale,state,heading,detail;
            public int width,height,kills,required,cleared,liveAnglers,remainingRegions,repaints;
            public bool anglerAlive,gateOpen,textFits,tickFrozen;
        }
        [Serializable] sealed class HellGateCaptureReport
        {
            public string scope="실제 HUD 표시 전용 명시적 상태 fixture. 자연 전투·처치·클리어 증거가 아님. 시각 판정은 Mac 검수자 담당.";
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
                    NativeGuiCapture.End();report.error=failure.ToString();Debug.LogError("HELLGATE_OBJECTIVE_CAPTURE_FAILED "+failure);
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
            Directory.CreateDirectory(output);hellGateCaptureActive=true;AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            menu=false;Running=false;pauseSmoke=true;frontendEntryInputFence=false;lobby.enabled=false;lobby.CloseStartupCaptureMedia();areaTitle.Hide();
            var sim=Simulation;if(sim.Regions==null||sim.Regions.Length!=4)throw new InvalidOperationException("4지역 필드가 필요합니다");
            sim.Stage.Enabled=true;sim.TickFieldBosses();int index=sim.RegionIdxAt(sim.Player.X,sim.Player.Y);
            if(index<0||sim.Regions[index].FbIdx<0)throw new InvalidOperationException("현재 지역 아귀 없음");
            sim.Config.EnemyAiEnabled=false;sim.Stage.GateGuardKilled=false;int frozen=sim.TickCount;
            string code=Argument("-qa-locale");if(string.IsNullOrEmpty(code))code="ko";lobby.SetLanguage(code);
            foreach(int width in new[]{1920,3840}){
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return null;yield return null;
                float deadline=Time.realtimeSinceStartup+5;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080)throw new InvalidOperationException("요청/실제 해상도 불일치 "+width+"x1080 / "+Screen.width+"x"+Screen.height);
                foreach(string state in new[]{"17-of-19-angler-alive","17-of-19-angler-slain","region-purified","gate-open-4-of-4"}){
                    worldTexts.Clear();
                    for(int i=0;i<4;i++){sim.Regions[i].Cleared=false;if(sim.FieldBosses[i]!=null)sim.FieldBosses[i].Hp=sim.FieldBosses[i].MaxHp;}
                    var r=sim.Regions[index];r.Total=23;r.Kills=17;sim.Stage.BossUnlocked=false;sim.Stage.FieldBossDone=false;
                    if(state!="17-of-19-angler-alive"&&sim.FieldBosses[r.FbIdx]!=null)sim.FieldBosses[r.FbIdx].Hp=0;
                    if(state=="region-purified"){r.Kills=19;r.Cleared=true;}
                    if(state=="gate-open-4-of-4"){
                        for(int i=0;i<4;i++){sim.Regions[i].Cleared=true;if(sim.FieldBosses[i]!=null)sim.FieldBosses[i].Hp=0;}
                        sim.Stage.FieldBossDone=true;sim.Stage.BossUnlocked=true;
                        string text=NativeHellGateLabels.OpenNotice(code);WorldTextAdd(sim.Player.X,sim.Player.Y-60,text,text,new Color(.55f,.75f,.95f),3);
                    }
                    RegionHudAttach();regionHud.Sync(sim);UpdateViews();yield return null;
                    string name=width+"x1080-"+LobbyLanguage.Normalize(code)+"-"+state;
                    yield return HellGateCaptureFrame(output,name);
                    var objectiveState=NativeHellGateObjective.Read(sim);NativeHellGateLabels.Lines(objectiveState,code,out string heading,out string detail);
                    var markers=new List<NativeMinimapObjective>();NativeMinimapObjectives.Collect(sim,markers);int regions=0,anglers=0;
                    foreach(var marker in markers){if(marker.Kind==NativeMinimapObjectiveKind.Region)regions++;if(marker.Kind==NativeMinimapObjectiveKind.Angler)anglers++;}
                    report.shots.Add(new HellGateShot{file=name+".png",locale=code,state=state,heading=heading,detail=detail,width=Screen.width,height=Screen.height,kills=objectiveState.Kills,required=objectiveState.Required,cleared=objectiveState.Cleared,anglerAlive=objectiveState.AnglerAlive,gateOpen=objectiveState.GateOpen,textFits=objective.GoalTextFits,tickFrozen=sim.TickCount==frozen,remainingRegions=regions,liveAnglers=anglers,repaints=NativeGuiCapture.RepaintFrames});
                    File.WriteAllText(Path.Combine(output,"hellgate-objectives.json"),JsonUtility.ToJson(report,true));
                    if(!objective.GoalTextFits||sim.TickCount!=frozen)throw new InvalidOperationException("목표 글자 잘림 또는 fixture 중 틱 진행");
                }
            }
            Debug.Log("HELLGATE_OBJECTIVE_CAPTURE_READY_FOR_VISUAL_REVIEW "+report.shots.Count);Application.Quit(0);
        }
        IEnumerator HellGateCaptureFrame(string output,string name)
        {
            var camera=HudCamera;var rt=new RenderTexture(Screen.width,Screen.height,24,RenderTextureFormat.ARGB32);
            try{
                NativeGuiCapture.Begin(rt,target=>{var previous=camera.targetTexture;try{camera.targetTexture=target;camera.Render();}finally{camera.targetTexture=previous;}});
                for(int i=0;i<3;i++)yield return null;yield return new WaitForEndOfFrame();
                if(NativeGuiCapture.RepaintFrames<1)throw new InvalidOperationException("HUD Repaint 없음");
                NativeGuiCapture.Save(Path.Combine(output,name+".png"));
                var previous=RenderTexture.active;var frame=new Texture2D(rt.width,rt.height,TextureFormat.RGB24,false);
                try{
                    RenderTexture.active=rt;frame.ReadPixels(new Rect(0,0,rt.width,rt.height),0,0);frame.Apply();
                    float scale=NativeUiViewport.Edges.Scale;
                    HellGateCrop(frame,NativeObjectivePanel.Bounds(NativeUiViewport.Edges.Width,true),scale,Path.Combine(output,name+"-goal-3x.png"));
                    HellGateCrop(frame,new Rect(4,4,150,150),scale,Path.Combine(output,name+"-minimap-3x.png"));
                }finally{RenderTexture.active=previous;Destroy(frame);}
            }finally{NativeGuiCapture.End();rt.Release();Destroy(rt);}
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
