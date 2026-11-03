using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Unity.Profiling;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class Map25DPerformance
        {
            public string scope="Actual Core combat after product lobby-to-camp walk. No injected enemies or coordinate assignment. Stationary auto-aim basic attack, invulnerability fixture; not a balance test. Main/render counters may overlap. GPU counter unavailable is not zero GPU time.";
            public int width,height,frames,firstTick,lastTick,peakAlive,peakNear1000,peakVisible,simSteps;
            public float seconds,fps,p50Ms,p95Ms,maxMs,mainThreadMeanMs,renderThreadMeanMs,gpuMeanMs,meanDrawCalls,meanTriangles;
            public bool mainValid,renderValid,gpuValid,densityGate,frameRateGate;
        }
        IEnumerator Map25DDenseCombatBench()
        {
            foreach(var size in new[]{new Vector2Int(3840,1080),new Vector2Int(5120,1440)}){
                Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);float deadline=Time.realtimeSinceStartup+10;
                while((Screen.width!=size.x||Screen.height!=size.y)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=size.x||Screen.height!=size.y){map25DPlayReceipt.failures.Add("Combat benchmark resolution "+size);continue;}
                var receipt=new Map25DPerformance{width=Screen.width,height=Screen.height,firstTick=Simulation.TickCount};
                var samples=new List<float>();var main=ProfilerRecorder.StartNew(ProfilerCategory.Internal,"Main Thread",1);var render=ProfilerRecorder.StartNew(ProfilerCategory.Internal,"Render Thread",1);var gpu=ProfilerRecorder.StartNew(ProfilerCategory.Render,"GPU Frame Time",1);var draws=ProfilerRecorder.StartNew(ProfilerCategory.Render,"Draw Calls Count",1);var triangles=ProfilerRecorder.StartNew(ProfilerCategory.Render,"Triangles Count",1);
                float start=Time.realtimeSinceStartup,next=start,last=start;double mainTotal=0,renderTotal=0,gpuTotal=0,drawTotal=0,triTotal=0;
                try{
                    while(Time.realtimeSinceStartup-start<10){float now=Time.realtimeSinceStartup;int catchup=0;
                        while(next<=now&&catchup++<8){var p=Simulation.Player;p.Iframes=600;float aimX=p.X+100,aimY=p.Y,best=float.MaxValue;foreach(var e in Simulation.Enemies)if(e.Alive){float dx=e.X-p.X,dy=e.Y-p.Y,d=dx*dx+dy*dy;if(d<best){best=d;aimX=e.X;aimY=e.Y;}}StepInput(0,0,aimX,aimY,true,false);Map25DTrackEnemies();receipt.simSteps++;next+=1/60f;}
                        UpdateViews();yield return null;now=Time.realtimeSinceStartup;float elapsed=(now-last)*1000;last=now;samples.Add(elapsed);receipt.frames++;receipt.maxMs=Mathf.Max(receipt.maxMs,elapsed);
                        if(main.Valid)mainTotal+=main.LastValue/1000000.0;if(render.Valid)renderTotal+=render.LastValue/1000000.0;if(gpu.Valid)gpuTotal+=gpu.LastValue/1000000.0;if(draws.Valid)drawTotal+=draws.LastValue;if(triangles.Valid)triTotal+=triangles.LastValue;
                        int alive=0,near=0,visible=0;foreach(var e in Simulation.Enemies)if(e.Alive){alive++;float dx=e.X-Simulation.Player.X,dy=e.Y-Simulation.Player.Y;if(dx*dx+dy*dy<1000000)near++;var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y));if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1)visible++;}receipt.peakAlive=Mathf.Max(receipt.peakAlive,alive);receipt.peakNear1000=Mathf.Max(receipt.peakNear1000,near);receipt.peakVisible=Mathf.Max(receipt.peakVisible,visible);
                    }
                    receipt.seconds=Time.realtimeSinceStartup-start;receipt.fps=receipt.frames/receipt.seconds;samples.Sort();receipt.p50Ms=samples[samples.Count/2];receipt.p95Ms=samples[Mathf.Min(samples.Count-1,(int)(samples.Count*.95f))];receipt.lastTick=Simulation.TickCount;receipt.mainValid=main.Valid;receipt.renderValid=render.Valid;receipt.gpuValid=gpu.Valid;receipt.mainThreadMeanMs=(float)(mainTotal/receipt.frames);receipt.renderThreadMeanMs=(float)(renderTotal/receipt.frames);receipt.gpuMeanMs=(float)(gpuTotal/receipt.frames);receipt.meanDrawCalls=(float)(drawTotal/receipt.frames);receipt.meanTriangles=(float)(triTotal/receipt.frames);receipt.densityGate=receipt.peakVisible>=18;receipt.frameRateGate=receipt.fps>=60;
                }finally{main.Dispose();render.Dispose();gpu.Dispose();draws.Dispose();triangles.Dispose();}
                File.WriteAllText(Path.Combine(map25DPlayOutput,"14-combat-"+size.x+"-performance.json"),JsonUtility.ToJson(receipt,true));Map25DEnemyAudit(Path.Combine(map25DPlayOutput,"14-combat-"+size.x+"-enemies.json"),false);yield return Map25DPlayShot("14-combat-"+size.x,"Active original Core simulation; stationary combat benchmark, no injected spawns");
            }
        }
    }
}
