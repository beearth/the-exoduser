using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Video;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class LoadingTipSample
        {
            public string id, language, mode, tip, png, audit;
            public int requestedWidth, requestedHeight, width, height, stage, fontPixels;
            public bool visibleInAudit, pngWritten;
        }
        [Serializable] sealed class LoadingTipReceipt
        {
            public bool passed, batchMode, listenerPaused;
            public float listenerVolume, outputPeak;
            public int directVideoPlayers;
            public string runtimeSha256, graphicsDevice, error;
            public List<LoadingTipSample> samples = new List<LoadingTipSample>();
            public List<LoadingArtSample> artSamples = new List<LoadingArtSample>();
        }
        [Serializable] sealed class LoadingArtSample
        {
            public string id, audit, png, source, tip;
            public int imageId, width, height;
            public bool fallback, sourceSeen, tipSeen, pngWritten;
        }
        IEnumerator LoadingTipCapture()
        {
            var body = LoadingTipCaptureBody();
            while (true)
            {
                bool more; object current;
                try { more = body.MoveNext(); current = more ? body.Current : null; }
                catch (Exception ex) {
                    Debug.LogError("LOADING_TIP_QA_FAILED " + ex);
                    string output=Argument("-output");
                    if(!string.IsNullOrEmpty(output)&&Path.IsPathRooted(output)&&Directory.Exists(output))
                        File.WriteAllText(Path.Combine(output,"loading-tip-failure.txt"),ex.ToString());
                    Application.Quit(2); yield break;
                }
                if (!more) yield break;
                yield return current;
            }
        }
        IEnumerator LoadingTipCaptureBody()
        {
            string output = Argument("-output");
            if (Application.isBatchMode || !NativeQaSandbox.Active || string.IsNullOrEmpty(output) || !Path.IsPathRooted(output))
                throw new InvalidOperationException("Loading tip GUI QA requires a visible Player, absolute -output and --unity-qa-sandbox");
            Directory.CreateDirectory(output);
            var report = new LoadingTipReceipt { batchMode = Application.isBatchMode, graphicsDevice = SystemInfo.graphicsDeviceName };
            using (var sha = System.Security.Cryptography.SHA256.Create())
            using (var binary = File.OpenRead(typeof(NativeGame).Assembly.Location))
                report.runtimeSha256 = BitConverter.ToString(sha.ComputeHash(binary)).Replace("-", "").ToLowerInvariant();
            string originalLanguage = lobby.Language;
            int originalStage = Simulation.Config.StageIndex, originalPhase = Simulation.Stage.LoadPhase;
            double originalFade = Simulation.Stage.LoadFade, originalTime = Simulation.Stage.LoadT;
            var binds = NativeKeyBindInput.Bindings;
            string inv = binds.Primary("inventory"), inv2 = binds.Secondary("inventory");
            string pickup = binds.Primary("interact"), pickup2 = binds.Secondary("interact");
            string rejected;
            try
            {
                AudioListener.volume = 0; AudioListener.pause = true;
                smokeActive = true; pauseSmoke = true; Application.runInBackground = true;
                lobby.AutomatedInput = true; lobby.ShowLobby(); lobby.SelectPreview();
                if (!lobby.EnterNativeTest()) throw new InvalidOperationException("Native preview entry failed");
                lobby.CloseStartupCaptureMedia(); SetGameFocus(true);
                Running = true; menu = false; areaTitle.Hide(); levelUp.Hide();
                gameObject.AddComponent<NativeUiAudit.Host>();
                foreach (var size in new[] { new Vector2Int(1920,1080), new Vector2Int(3024,1964) })
                {
                    var mode = size.x == 3024 ? FullScreenMode.FullScreenWindow : FullScreenMode.Windowed;
                    Screen.SetResolution(size.x, size.y, mode);
                    yield return new WaitForSecondsRealtime(.8f);
                    foreach (string language in new[] { "ko", "en", "fr" })
                    {
                        lobby.SetLanguage(language);
                        for (int n = 0; n < 8; n++)
                        {
                            int stage = n < 4 ? n : n == 4 || n == 6 ? 1 : 2;
                            string keyMode = n < 4 ? "default" : n < 6 ? "changed" : "missing";
                            binds.TrySet("inventory", inv, false, out rejected); binds.TrySet("inventory", inv2, true, out rejected);
                            binds.TrySet("interact", pickup, false, out rejected); binds.TrySet("interact", pickup2, true, out rejected);
                            if (n == 4) binds.TrySet("inventory", "KeyV", false, out rejected);
                            if (n == 5) binds.TrySet("interact", "F2", false, out rejected);
                            if (n == 6) { binds.TrySet("inventory", null, false, out rejected); binds.TrySet("inventory", null, true, out rejected); }
                            if (n == 7) { binds.TrySet("interact", null, false, out rejected); binds.TrySet("interact", null, true, out rejected); }
                            Simulation.Config.StageIndex = stage; Simulation.Stage.LoadPhase = 2;
                            Simulation.Stage.LoadFade = 1; Simulation.Stage.LoadT = 35;
                            yield return new WaitForSecondsRealtime(.22f);
                            NativeUiAudit.Active = true; yield return null; yield return new WaitForEndOfFrame();
                            string id = size.x + "-" + language + "-" + stage + "-" + keyMode;
                            string audit = Path.Combine(output,id + ".json"), png = Path.Combine(output,id + ".png");
                            NativeUiAudit.Save(audit,"전환로딩",language);
                            ScreenCapture.CaptureScreenshot(png); NativeUiAudit.Active = false;
                            string tip = NativeLoadingTips.Pick(stage, language != "ko", LoadingTipKey("inventory"), LoadingTipKey("interact"));
                            yield return new WaitForSecondsRealtime(.35f);
                            var sample = new LoadingTipSample { id=id, language=language, mode=keyMode, stage=stage,
                                tip=tip, png=png, audit=audit, requestedWidth=size.x, requestedHeight=size.y,
                                width=Screen.width, height=Screen.height, fontPixels=NativeLoadingTips.FontPixels(Screen.height),
                                visibleInAudit=File.ReadAllText(audit).Contains(tip),
                                pngWritten=File.Exists(png) && new FileInfo(png).Length > 1000 };
                            report.samples.Add(sample);
                            if (!sample.visibleInAudit || !sample.pngWritten) throw new InvalidOperationException("Missing real GUI tip: " + id);
                        }
                    }
                }
                // The same visible Player paints all approved art and the missing-wide fallback.
                foreach (var size in new[] { new Vector2Int(1920,1080),new Vector2Int(2560,1080),
                    new Vector2Int(2880,810),new Vector2Int(3024,1964) })
                {
                    Screen.SetResolution(size.x,size.y,size.x==3024?FullScreenMode.FullScreenWindow:FullScreenMode.Windowed);
                    yield return new WaitForSecondsRealtime(.8f);
                    if(Screen.width!=size.x||Screen.height!=size.y)
                        throw new InvalidOperationException("Requested art window unavailable: "+size+" actual "+Screen.width+"x"+Screen.height);
                    lobby.SetLanguage("ko");
                    int variant=size.x/(float)size.y>2560f/1080?32:size.x/(float)size.y>1920f/1080?21:16;
                    for(int n=0;n<=NativeLoadingSelection.Images.Count;n++)
                    {
                        bool fallback=n==NativeLoadingSelection.Images.Count;
                        int imageId=fallback?1:NativeLoadingSelection.Images[n];
                        NativeLoadingArtwork.ForcedImage=imageId;
                        NativeLoadingArtwork.SimulateMissingWide=fallback;
                        int stage=fallback?0:n;
                        Simulation.Config.StageIndex=stage;Simulation.Stage.LoadPhase=2;
                        Simulation.Stage.LoadFade=1;Simulation.Stage.LoadT=35;
                        yield return new WaitForSecondsRealtime(.22f);
                        NativeUiAudit.Active=true;yield return null;yield return new WaitForEndOfFrame();
                        string id=size.x+"x"+size.y+"-art-"+imageId.ToString("00")+(fallback?"-fallback":"");
                        string audit=Path.Combine(output,id+".json"),png=Path.Combine(output,id+".png");
                        NativeUiAudit.Save(audit,"전환로딩",lobby.Language);
                        ScreenCapture.CaptureScreenshot(png);NativeUiAudit.Active=false;
                        string text=File.ReadAllText(audit);
                        string source="mode="+(fallback?"fallback:"+imageId.ToString("00"):"expanded:"+imageId.ToString("00")+"-"+variant);
                        string tip=NativeLoadingTips.Pick(stage,false,LoadingTipKey("inventory"),LoadingTipKey("interact"));
                        yield return new WaitForSecondsRealtime(.35f);
                        var sample=new LoadingArtSample{id=id,audit=audit,png=png,source=source,tip=tip,
                            imageId=imageId,width=Screen.width,height=Screen.height,fallback=fallback,
                            sourceSeen=text.Contains(source),tipSeen=text.Contains(tip),
                            pngWritten=File.Exists(png)&&new FileInfo(png).Length>1000};
                        report.artSamples.Add(sample);
                        if(!sample.sourceSeen||!sample.tipSeen||!sample.pngWritten)
                            throw new InvalidOperationException("Missing art/status/tip in real GUI: "+id+" source="+source);
                    }
                    NativeLoadingArtwork.ForcedImage=-1;NativeLoadingArtwork.SimulateMissingWide=false;
                }
                report.listenerPaused = AudioListener.pause; report.listenerVolume = AudioListener.volume;
                var audio = new float[1024]; AudioListener.GetOutputData(audio,0);
                foreach (float value in audio) report.outputPeak = Mathf.Max(report.outputPeak,Mathf.Abs(value));
                foreach (var video in Resources.FindObjectsOfTypeAll<VideoPlayer>())
                    if (video != null && video.audioOutputMode == VideoAudioOutputMode.Direct) report.directVideoPlayers++;
                report.passed = report.samples.Count == 48 && report.artSamples.Count == 68 && report.listenerPaused && report.listenerVolume == 0 && report.outputPeak == 0 && report.directVideoPlayers == 0;
                File.WriteAllText(Path.Combine(output,"loading-tip-receipt.json"),JsonUtility.ToJson(report,true));
                if (!report.passed) throw new InvalidOperationException("Loading tip receipt failed");
            }
            finally
            {
                NativeUiAudit.Active = false;
                NativeLoadingArtwork.ForcedImage=-1;NativeLoadingArtwork.SimulateMissingWide=false;
                binds.TrySet("inventory", inv, false, out rejected); binds.TrySet("inventory", inv2, true, out rejected);
                binds.TrySet("interact", pickup, false, out rejected); binds.TrySet("interact", pickup2, true, out rejected);
                Simulation.Config.StageIndex=originalStage;Simulation.Stage.LoadPhase=originalPhase;
                Simulation.Stage.LoadFade=originalFade;Simulation.Stage.LoadT=originalTime;
                lobby.SetLanguage(originalLanguage);lobby.CloseStartupCaptureMedia();sound.Reset();
            }
            yield return new WaitForSecondsRealtime(1f);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE LOADING_TIPS");Application.Quit(0);
        }
    }
}
