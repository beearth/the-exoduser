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
            public int petTicks;
            public string dialogueWho, dialogueId;
            public double[] petState;
            public bool sourcePetFiltering;
        }

        // Explicit QA mode only. Reuses the existing direct preview entry and screenshot path;
        // normal play performs no sampling, file IO or additional per-frame allocation.
        IEnumerator FieldLightingReview()
        {
            yield return null; // Awake finishes before touching the existing lobby/settings.
            string output = Argument("-output"), mode = Argument("-lightingMode");
            string scene = Argument("-lightingScene");
            bool sampleAtAltar = scene == "altar";
            if (!SettingsQaIdentity || !Path.IsPathRooted(output) ||
                (scene != "" && scene != "start" && scene != "altar") ||
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
            if(sampleAtAltar)
            {
                Simulation.Player.X=5900;Simulation.Player.Y=4060;UpdateViews();
            }
            // The old lighting fixture froze all FixedUpdate, including newly integrated pets.
            // Keep combat stationary for the 02 comparison, but run cosmetics at source60Hz.
            pets.Reset(Simulation.Player.X,Simulation.Player.Y,0);petDialogue.Reset();
            double petTime=0;int petTicks=0;
            string capture=sampleAtAltar?"field-altar-":"field-start-";
            for (int i=0; i<180; i++) { yield return null; ReviewPetTicks(ref petTime,ref petTicks); }
            UpdateViews();
            yield return SkillCapture(output,capture+mode);
            File.WriteAllText(Path.Combine(output,"pets-primary.json"),JsonUtility.ToJson(ReviewPetState(petTicks),true));
            // Two actual rendered poses and the natural five-second crow -> cat response.
            for(int i=0;i<30;i++){yield return null;ReviewPetTicks(ref petTime,ref petTicks);}
            yield return SkillCapture(output,capture+"animation");
            File.WriteAllText(Path.Combine(output,"pets-animation.json"),JsonUtility.ToJson(ReviewPetState(petTicks),true));
            while(petDialogue.Who!="cat"&&petTicks<660){yield return null;ReviewPetTicks(ref petTime,ref petTicks);}
            yield return SkillCapture(output,capture+"dialogue-cat");
            File.WriteAllText(Path.Combine(output,"pets-dialogue.json"),JsonUtility.ToJson(ReviewPetState(petTicks),true));
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--lighting-capture-only")>=0)
            {yield return new WaitForSecondsRealtime(.5f);Application.Quit(0);yield break;}
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
                ReviewPetTicks(ref petTime,ref petTicks);
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
                mode=mode,scope="1920x1080 stationary source "+(sampleAtAltar?"altar(5900,4060)":"start(4020,7420)")+", 180 warmup plus pose/dialogue captures / 900 frames at cap120 vsync0. Combat simulation paused with existing pauseSmoke focus fence; pets advance60Hz and render lighting clock runs. Main-thread GC raw observation, not certification; GPU sharing gate checked before launch.",
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
                targetRecreates=worldLighting.TargetRecreates,playerX=Simulation.Player.X,playerY=Simulation.Player.Y,
                petTicks=petTicks,dialogueWho=petDialogue.Who,dialogueId=petDialogue.CurrentId,petState=ReviewPetState(petTicks).petState,
                sourcePetFiltering=petView.SourceFiltering
            };
            File.WriteAllText(Path.Combine(output,"performance-"+mode+".json"),JsonUtility.ToJson(receipt,true));
            File.WriteAllText(Path.Combine(output,"frames-"+mode+".json"),"["+string.Join(",",Array.ConvertAll(frameMs,v=>v.ToString("R",System.Globalization.CultureInfo.InvariantCulture)))+"]");
            yield return new WaitForSecondsRealtime(.5f);
            Application.Quit(0);
        }

        void ReviewPetTicks(ref double time,ref int ticks)
        {
            time+=Time.unscaledDeltaTime;
            while(time>=1.0/60){TickPets();ticks++;time-=1.0/60;}
            RenderPets();
        }
        LightingReviewReceipt ReviewPetState(int ticks)
        {
            return new LightingReviewReceipt{petTicks=ticks,dialogueWho=petDialogue.Who,dialogueId=petDialogue.CurrentId,
                sourcePetFiltering=petView.SourceFiltering,
                playerX=Simulation.Player.X,playerY=Simulation.Player.Y,
                petState=new[]{pets.Crow.X,pets.Crow.Y,pets.Crow.T,pets.Cat.X,pets.Cat.Y,pets.Cat.T,
                    pets.Xbow.X,pets.Xbow.Y,pets.Xbow.T,pets.Iris.X,pets.Iris.Y,pets.Iris.T}};
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
