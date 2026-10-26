using UnityEngine;
using System;
using System.Collections;
using System.IO;
using Unity.Profiling;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        NativeFieldLighting worldLighting;

        // Camera image effects finish before IMGUI: HUD, menus and video stay above lighting.
        internal bool WorldLightingVisible => Simulation != null && view.cullingMask != 0 &&
            (lobby == null || !lobby.IsBlocking || lobby.StartupWorldVisible);

        void InitializeWorldLighting()
        {
            worldLighting = view.gameObject.AddComponent<NativeFieldLighting>();
            worldLighting.Initialize(this, view);
            if (Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-field-lighting-smoke") >= 0)
                StartCoroutine(FieldLightingReview());
        }

        [Serializable] sealed class LightingReviewReceipt
        {
            public string mode, scope, product, identifier, settingsDirectory, rosterDirectory;
            public int width, height, samples, loadedChunks, targetFrameRate, vsync, targetRecreates;
            public double averageMs, p95Ms, p99Ms;
            public long lightingRenderAllocatedBytes, lightingUpdateAllocatedBytes, mainThreadAllocatedBytes;
            public long maxMainThreadFrameAllocatedBytes, profilerFrameGcMax;
            public bool profilerGcValid;
            public int runningFrames, focusedFrames, lightingRenderCalls, lightingCacheRefreshes;
            public float playerX, playerY;
        }

        // Explicit QA mode only. Reuses the existing direct preview entry and screenshot path;
        // normal play performs no sampling, file IO or additional per-frame allocation.
        IEnumerator FieldLightingReview()
        {
            yield return null; // Awake finishes before touching the existing lobby/settings.
            string output = Argument("-output"), mode = Argument("-lightingMode");
            if (!SettingsQaIdentity || !Path.IsPathRooted(output) ||
                (mode != "before" && mode != "after") || nativeSettingsStore != null ||
                !string.IsNullOrEmpty(lobby.CharacterStoreDirectory))
            { Debug.LogError("Field lighting review requires isolated QA identity, absolute output and no storage"); Application.Quit(2); yield break; }
            Directory.CreateDirectory(output);
            lobby.ShowLobby(); lobby.SelectPreview();
            if (!lobby.EnterNativeTest()) { Debug.LogError("Field lighting preview entry failed"); Application.Quit(2); yield break; }
            pauseSmoke = true; SetGameFocus(true);
            menu = false; frontendEntryInputFence = false; practiceScripted = true;
            Simulation.Config.EnemyAiEnabled = false;
            Running = true; worldLighting.enabled = mode == "after";
            worldLighting.MeasureAllocations = mode == "after";
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            QualitySettings.vSyncCount = 0; Application.targetFrameRate = 120;
            for (int i=0; i<180; i++) yield return null;
            UpdateViews();
            yield return SkillCapture(output,"field-start-"+mode);
            const int count=900;
            var frameMs=new double[count];
            long totalBytes=0, maxBytes=0, profilerMax=0;
            int runningFrames=0, focusedFrames=0;
            var gc=ProfilerRecorder.StartNew(ProfilerCategory.Memory,"GC Allocated In Frame",1);
            worldLighting.RenderAllocatedBytes=0; worldLighting.UpdateAllocatedBytes=0;
            worldLighting.TargetRecreates=0;
            worldLighting.RenderCalls=0; worldLighting.CacheRefreshes=0;
            // Raw Mono API observations only. Zero is not a GC-free certificate;
            // release counters can be unavailable (see UNITY_MAP_LIGHT_02_20261026.md).
            long previous=GC.GetAllocatedBytesForCurrentThread();
            for (int i=0; i<count; i++)
            {
                yield return null;
                long current=GC.GetAllocatedBytesForCurrentThread();
                long bytes=current-previous; previous=current;
                totalBytes+=bytes; if(bytes>maxBytes)maxBytes=bytes;
                frameMs[i]=Time.unscaledDeltaTime*1000.0;
                if(Running)runningFrames++; if(gameFocused)focusedFrames++;
                if(gc.Valid&&gc.Count>0&&gc.LastValue>profilerMax)profilerMax=gc.LastValue;
            }
            long renderBytes=worldLighting.RenderAllocatedBytes, updateBytes=worldLighting.UpdateAllocatedBytes;
            bool gcValid=gc.Valid&&gc.Count>0; gc.Dispose();
            worldLighting.MeasureAllocations=false;
            double sum=0;foreach(double value in frameMs)sum+=value;
            Array.Sort(frameMs);
            var receipt=new LightingReviewReceipt {
                mode=mode,scope="1920x1080 stationary source start, 180 warmup / 900 frames at cap120 vsync0. Fixed simulation paused with existing pauseSmoke focus fence; render lighting clock runs. Main-thread whole-frame GC and lighting callback GC measured separately; existing user Players left running.",
                product=Application.productName,identifier=Application.identifier,
                settingsDirectory=nativeSettingsDirectory,rosterDirectory=lobby.CharacterStoreDirectory,
                width=Screen.width,height=Screen.height,samples=count,loadedChunks=LoadedChunks,
                targetFrameRate=Application.targetFrameRate,vsync=QualitySettings.vSyncCount,
                averageMs=sum/count,p95Ms=frameMs[(int)Math.Ceiling(count*.95)-1],p99Ms=frameMs[(int)Math.Ceiling(count*.99)-1],
                lightingRenderAllocatedBytes=renderBytes,lightingUpdateAllocatedBytes=updateBytes,
                mainThreadAllocatedBytes=totalBytes,maxMainThreadFrameAllocatedBytes=maxBytes,
                profilerGcValid=gcValid,profilerFrameGcMax=profilerMax,
                runningFrames=runningFrames,focusedFrames=focusedFrames,
                lightingRenderCalls=worldLighting.RenderCalls,lightingCacheRefreshes=worldLighting.CacheRefreshes,
                targetRecreates=worldLighting.TargetRecreates,playerX=Simulation.Player.X,playerY=Simulation.Player.Y
            };
            File.WriteAllText(Path.Combine(output,"performance-"+mode+".json"),JsonUtility.ToJson(receipt,true));
            File.WriteAllText(Path.Combine(output,"frames-"+mode+".json"),"["+string.Join(",",Array.ConvertAll(frameMs,v=>v.ToString("R",System.Globalization.CultureInfo.InvariantCulture)))+"]");
            Simulation.Player.X=5900;Simulation.Player.Y=4060;UpdateViews();
            for(int i=0;i<30;i++)yield return null;
            yield return SkillCapture(output,"field-altar-"+mode);
            yield return new WaitForSecondsRealtime(.5f);
            Application.Quit(0);
        }

        void DisposeWorldLighting()
        {
            if (worldLighting == null) return;
            worldLighting.Release();
            Destroy(worldLighting);
            worldLighting = null;
        }
    }
}
