using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;

// QA-only component. Include this file only in an isolated verification Player.
public sealed class UiResumeReview : MonoBehaviour
{
    const string Flag = "--unity-ui-resume-smoke";
    const float LimitSeconds = 60f;
    static readonly BindingFlags PrivateInstance = BindingFlags.Instance | BindingFlags.NonPublic;
    readonly List<string> checks = new List<string>();
    readonly List<string> images = new List<string>();
    string output = "";
    float started;
    NativeGame game;
    NativeLobby lobby;
    int failures;
    bool finished;
    bool diagnosticPreview;
    float namedHudTopLeftChangeRatio = -1f;
    bool captionCoverageRequested;
    string captionOraclePath = "";
    readonly List<CaptionCoverageResult> captionCoverage = new List<CaptionCoverageResult>();
    readonly List<CaptionTransitionDiagnostic> captionTransitions = new List<CaptionTransitionDiagnostic>();
    readonly List<string> unresolvedLanguages = new List<string>();
    string expectedWorldCode = "", expectedWorldText = "";
    Font expectedWorldFont;
    string ukCue = "";
    string ukText = "";
    string koText = "";

    [Serializable] sealed class Receipt
    {
        public string scope, output, error, ukCue, ukText, koText;
        public string captionOraclePath;
        public bool passed, diagnosticPreview, captionCoverageRequested;
        public float namedHudTopLeftChangeRatio;
        public int failures;
        public string[] checks, images, unresolvedLanguages;
        public CaptionCoverageResult[] captionCoverage;
        public CaptionTransitionDiagnostic[] captionTransitions;
    }
    [Serializable] sealed class CaptionOracle { public int languageCount; public CaptionOracleRow[] rows; }
    [Serializable] sealed class CaptionOracleRow
    {
        public string code, fontResource;
        public int cueCount, visibleCodePoints;
        public string[] nanumMissing, notoMissing;
        public bool notoFallbackEligible;
    }
    [Serializable] sealed class CaptionCoverageResult
    {
        public string code, status, fontName, fontResource, cueText, missingCharacters;
        public int visibleCharacterCount, missingCharacterCount;
        public bool expectedNoto, captionDrawn, shadowFontMatches;
    }
    [Serializable] sealed class CaptionTransitionDiagnostic
    {
        public string phase, code, language, subtitleText, expectedText;
        public string styleFontName, shadowFontName, expectedFontName;
        public bool captionVisible, cueMatches, styleFontMatches, shadowFontMatches;
        public bool worldPage, videoPrepared, videoFrameReady;
        public string styleFontId, shadowFontId, expectedFontId;
    }

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Install()
    {
        if (Array.IndexOf(Environment.GetCommandLineArgs(), Flag) < 0) return;
        var owner = new GameObject("QA UiResumeReview");
        DontDestroyOnLoad(owner);
        owner.AddComponent<UiResumeReview>();
    }

    void Start()
    {
        started = Time.realtimeSinceStartup;
        StartCoroutine(Guard(Review()));
    }

    IEnumerator Guard(IEnumerator root)
    {
        var stack = new Stack<IEnumerator>();
        stack.Push(root);
        string terminalError = "";
        while (stack.Count > 0 && !finished)
        {
            if (Time.realtimeSinceStartup - started > LimitSeconds)
            {
                Fail("60 second fixture timeout");
                terminalError = "timeout";
                break;
            }
            bool moved = false;
            object value = null;
            Exception stepError = null;
            try { moved = stack.Peek().MoveNext(); if (moved) value = stack.Peek().Current; }
            catch (Exception e) { stepError = e; }
            if (stepError != null)
            {
                Fail("fixture exception: " + stepError);
                terminalError = stepError.ToString();
                break;
            }
            if (!moved) { stack.Pop(); continue; }
            if (value is IEnumerator nested) { stack.Push(nested); continue; }
            yield return value;
        }
        // Native VideoPlayer/RenderTexture destruction is deferred until a later frame.
        Exception closeError = null;
        try { if (lobby != null && lobby.CurrentVideo != null) lobby.CurrentVideo.Close(); }
        catch (Exception e) { closeError = e; }
        if (closeError != null) { Fail("decoder cleanup: " + closeError); terminalError += closeError; }
        yield return new WaitForEndOfFrame();
        yield return null;
        yield return new WaitForSecondsRealtime(.5f);
        if (!finished) Finish(terminalError);
    }

    void Check(bool ok, string name)
    {
        checks.Add((ok ? "PASS " : "FAIL ") + name);
        if (!ok) failures++;
    }
    void Fail(string reason) { Check(false, reason); }
    static object Field(object target, string name)
    {
        var field = target.GetType().GetField(name, PrivateInstance);
        if (field == null) throw new MissingFieldException(target.GetType().Name, name);
        return field.GetValue(target);
    }
    static void SetField(object target, string name, object value)
    {
        var field = target.GetType().GetField(name, PrivateInstance);
        if (field == null) throw new MissingFieldException(target.GetType().Name, name);
        field.SetValue(target, value);
    }
    GUIStyle Style(string method)
    {
        var info = typeof(NativeLobby).GetMethod(method, PrivateInstance);
        if (info == null) throw new MissingMethodException(typeof(NativeLobby).Name, method);
        return (GUIStyle)info.Invoke(lobby, null);
    }
    static bool Supports(Font font, char glyph)
    {
        font.RequestCharactersInTexture(glyph.ToString(), 50, FontStyle.Normal);
        CharacterInfo info;
        return font.HasCharacter(glyph) && font.GetCharacterInfo(glyph, out info, 50, FontStyle.Normal);
    }
    static string Argument(string key)
    {
        var args = Environment.GetCommandLineArgs();
        int at = Array.IndexOf(args, key);
        return at >= 0 && at + 1 < args.Length ? args[at + 1] : "";
    }
    void Finish(string error)
    {
        if (finished) return;
        finished = true;
        var receipt = new Receipt {
            scope = "Controlled verification Player callbacks and screenshots only. No OS mouse or keyboard click proof, no natural-play or production-save claim.",
            output = output, error = error, ukCue = ukCue, ukText = ukText, koText = koText,
            captionOraclePath = captionOraclePath, captionCoverageRequested = captionCoverageRequested,
            captionCoverage = captionCoverage.ToArray(), unresolvedLanguages = unresolvedLanguages.ToArray(),
            captionTransitions = captionTransitions.ToArray(),
            passed = failures == 0 && error.Length == 0, diagnosticPreview = diagnosticPreview,
            namedHudTopLeftChangeRatio = namedHudTopLeftChangeRatio,
            failures = failures, checks = checks.ToArray(), images = images.ToArray()
        };
        try
        {
            if (!string.IsNullOrEmpty(output) && Path.IsPathRooted(output))
            {
                Directory.CreateDirectory(output);
                File.WriteAllText(Path.Combine(output, "ui-resume-review.json"), JsonUtility.ToJson(receipt, true));
            }
            else Debug.LogError("UI resume QA: no valid receipt directory");
        }
        catch (Exception e) { Debug.LogError("UI resume QA receipt write failed: " + e); failures++; }
        Application.Quit(failures == 0 && error.Length == 0 ? 0 : 2);
    }

    IEnumerator Until(Func<bool> ready, string label, float seconds, bool recordSuccess = true)
    {
        float deadline = Time.realtimeSinceStartup + seconds;
        while (!ready() && Time.realtimeSinceStartup < deadline)
        {
            if (lobby != null && !string.IsNullOrEmpty(lobby.VideoError)) throw new InvalidOperationException(label + ": " + lobby.VideoError);
            yield return null;
        }
        if (!ready()) throw new TimeoutException(label + " after " + seconds + " seconds");
        if (recordSuccess) Check(true, label);
    }
    IEnumerator Capture(string name, int width, int height)
    {
        Screen.SetResolution(width, height, FullScreenMode.Windowed);
        yield return null;
        yield return null;
        Check(Screen.width == width && Screen.height == height, name + " resolution");
        if (Screen.width != width || Screen.height != height) throw new InvalidOperationException(name + " resolution unavailable");
        if (name.StartsWith("world-", StringComparison.Ordinal))
            yield return Until(() => WorldCaptionReady(expectedWorldCode, expectedWorldText, expectedWorldFont) && WorldTextureHasContent(),
                name + " actual caption and decoded video frame", 8f);
        string path = Path.Combine(output, name + ".png");
        if (File.Exists(path)) throw new IOException("Refusing to overwrite existing QA image: " + path);
        yield return new WaitForEndOfFrame();
        ScreenCapture.CaptureScreenshot(path);
        yield return Until(() => PngFinished(path), name + " complete closed PNG", 5f);
        if (name.StartsWith("world-", StringComparison.Ordinal))
        {
            bool hasContent = WorldPngHasContent(path);
            Check(hasContent, name + " nonblack world PNG");
            if (!hasContent) throw new InvalidOperationException(name + " is a black world frame");
        }
        images.Add(path);
    }
    static bool PngFinished(string path)
    {
        try
        {
            using(var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                if(stream.Length < 1024) return false;
                stream.Seek(-8, SeekOrigin.End);
                var footer = new byte[8];
                if(stream.Read(footer, 0, 8) != 8) return false;
                byte[] expected = { 73, 69, 78, 68, 174, 66, 96, 130 };
                for(int i=0;i<8;i++) if(footer[i] != expected[i]) return false;
                return true;
            }
        }
        catch(IOException) { return false; }
    }
    bool WorldCaptionReady(string code, string cue, Font expectedFont)
    {
        if (lobby == null || lobby.Flow.Page != LobbyPage.WorldIntro || lobby.CurrentVideo == null ||
            !lobby.CurrentVideo.Prepared || lobby.CurrentVideo.Frame < 0 || !lobby.CaptionVisible ||
            lobby.Language != code || string.IsNullOrEmpty(lobby.SubtitleText) ||
            expectedFont == null || !string.IsNullOrEmpty(cue) && lobby.SubtitleText != cue) return false;
        var style = Style("CaptionStyleForLanguage");
        var shadow = Style("CaptionShadowForLanguage");
        return style != null && shadow != null && ReferenceEquals(style.font, expectedFont) &&
            ReferenceEquals(shadow.font, expectedFont);
    }
    CaptionTransitionDiagnostic RegionalTransition(string phase, string code, string cue, Font expectedFont)
    {
        var style = Style("CaptionStyleForLanguage");
        var shadow = Style("CaptionShadowForLanguage");
        var styleFont = style == null ? null : style.font;
        var shadowFont = shadow == null ? null : shadow.font;
        return new CaptionTransitionDiagnostic {
            phase = phase, code = code, language = lobby.Language, subtitleText = lobby.SubtitleText,
            expectedText = cue, captionVisible = lobby.CaptionVisible,
            cueMatches = lobby.SubtitleText == cue,
            worldPage = lobby.Flow.Page == LobbyPage.WorldIntro,
            videoPrepared = lobby.CurrentVideo != null && lobby.CurrentVideo.Prepared,
            videoFrameReady = lobby.CurrentVideo != null && lobby.CurrentVideo.Frame >= 0,
            styleFontName = styleFont == null ? "" : styleFont.name,
            shadowFontName = shadowFont == null ? "" : shadowFont.name,
            expectedFontName = expectedFont == null ? "" : expectedFont.name,
            styleFontId = styleFont == null ? "" : styleFont.GetEntityId().ToString(),
            shadowFontId = shadowFont == null ? "" : shadowFont.GetEntityId().ToString(),
            expectedFontId = expectedFont == null ? "" : expectedFont.GetEntityId().ToString(),
            styleFontMatches = ReferenceEquals(styleFont, expectedFont),
            shadowFontMatches = ReferenceEquals(shadowFont, expectedFont)
        };
    }
    void ExpectWorld(string code, string cue, Font font)
    {
        expectedWorldCode = code;
        expectedWorldText = cue;
        expectedWorldFont = font;
    }
    bool WorldTextureHasContent()
    {
        var source = lobby.CurrentVideo.Texture;
        if (source == null) return false;
        var previous = RenderTexture.active;
        var small = RenderTexture.GetTemporary(64, 36, 0, RenderTextureFormat.ARGB32);
        var pixels = new Texture2D(64, 36, TextureFormat.RGBA32, false);
        try
        {
            Graphics.Blit(source, small);
            RenderTexture.active = small;
            pixels.ReadPixels(new Rect(0, 0, 64, 36), 0, 0);
            pixels.Apply(false, false);
            int lit = 0;
            foreach (var p in pixels.GetPixels32()) if (p.r > 20 || p.g > 20 || p.b > 20) lit++;
            return lit > 64 * 36 / 100;
        }
        finally
        {
            RenderTexture.active = previous;
            RenderTexture.ReleaseTemporary(small);
            UnityEngine.Object.Destroy(pixels);
        }
    }
    static bool WorldPngHasContent(string path)
    {
        var png = new Texture2D(2, 2, TextureFormat.RGBA32, false);
        try
        {
            if (!png.LoadImage(File.ReadAllBytes(path), false)) return false;
            var pixels = png.GetPixels32();
            int step = Math.Max(1, pixels.Length / 4096), lit = 0, total = 0;
            for (int i = 0; i < pixels.Length; i += step)
            {
                total++;
                if (pixels[i].r > 20 || pixels[i].g > 20 || pixels[i].b > 20) lit++;
            }
            return lit > total / 100;
        }
        finally { UnityEngine.Object.Destroy(png); }
    }
    static float TopLeftChangeRatio(string baselinePath, string changedPath)
    {
        var baseline = new Texture2D(2, 2, TextureFormat.RGBA32, false);
        var changed = new Texture2D(2, 2, TextureFormat.RGBA32, false);
        try
        {
            if (!baseline.LoadImage(File.ReadAllBytes(baselinePath), false) ||
                !changed.LoadImage(File.ReadAllBytes(changedPath), false))
                throw new InvalidOperationException("HUD comparison PNG decode failed");
            if (baseline.width != changed.width || baseline.height != changed.height ||
                baseline.width < 310 || baseline.height < 80)
                throw new InvalidOperationException("HUD comparison resolution mismatch");
            var a = baseline.GetPixels32();
            var b = changed.GetPixels32();
            int different = 0;
            const int areaWidth = 310, areaHeight = 80;
            for (int y = baseline.height - areaHeight; y < baseline.height; y++)
                for (int x = 0; x < areaWidth; x++)
                {
                    int at = y * baseline.width + x;
                    if (Math.Abs(a[at].r - b[at].r) >= 16 ||
                        Math.Abs(a[at].g - b[at].g) >= 16 ||
                        Math.Abs(a[at].b - b[at].b) >= 16) different++;
                }
            return (float)different / (areaWidth * areaHeight);
        }
        finally
        {
            UnityEngine.Object.Destroy(baseline);
            UnityEngine.Object.Destroy(changed);
        }
    }

    static LobbyCaptionLanguage CaptionLanguage(LobbySubtitleData data, string code)
    {
        if (data != null && data.captions != null)
            foreach (var language in data.captions) if (language.code == code) return language;
        return null;
    }
    static string CueAt(LobbyCaptionLanguage language, double sourceTime)
    {
        foreach (var cue in language.cues)
            if (sourceTime >= cue.start && sourceTime < cue.end) return cue.text;
        return "";
    }
    static string VisibleCharacters(LobbyCaptionLanguage language)
    {
        var unique = new SortedSet<char>();
        foreach (var cue in language.cues)
            foreach (char ch in cue.text ?? "")
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (!char.IsWhiteSpace(ch) && category != UnicodeCategory.Control &&
                    category != UnicodeCategory.Format && category != UnicodeCategory.Surrogate &&
                    category != UnicodeCategory.PrivateUse && category != UnicodeCategory.OtherNotAssigned)
                    unique.Add(ch);
            }
        var chars = new char[unique.Count];
        unique.CopyTo(chars);
        return new string(chars);
    }
    IEnumerator VerifyCaptionCoverage(LobbySubtitleData data, Font baseFont, Font notoFont,
        GUIStyle baseStyle, GUIStyle baseShadow)
    {
        captionOraclePath = Argument("-caption-oracle");
        if (string.IsNullOrWhiteSpace(captionOraclePath) || !Path.IsPathRooted(captionOraclePath) ||
            !File.Exists(captionOraclePath))
            throw new ArgumentException("--qa-caption-coverage requires absolute -caption-oracle JSON path");
        captionOraclePath = Path.GetFullPath(captionOraclePath);
        var oracle = JsonUtility.FromJson<CaptionOracle>(File.ReadAllText(captionOraclePath));
        if (oracle == null || oracle.rows == null || oracle.languageCount != 29 || oracle.rows.Length != 29 ||
            data == null || data.captions == null || data.captions.Length != 29)
            throw new InvalidOperationException("Caption oracle and runtime data must each contain 29 languages");
        if (baseFont == null || notoFont == null) throw new InvalidOperationException("Caption font missing");
        int complete = 0, expectedComplete = 0, expectedUnresolved = 0;
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var row in oracle.rows)
        {
            if (row == null || string.IsNullOrEmpty(row.code) || !seen.Add(row.code) ||
                row.nanumMissing == null || row.notoMissing == null || row.cueCount != 32)
                throw new InvalidOperationException("Invalid caption oracle row");
            var language = CaptionLanguage(data, row.code);
            if (language == null || language.cues == null || language.cues.Length != 32)
                throw new InvalidOperationException("Missing runtime cues for " + row.code);
            if (row.notoFallbackEligible && (row.nanumMissing.Length == 0 || row.notoMissing.Length != 0))
                throw new InvalidOperationException("Inconsistent Noto oracle row " + row.code);
            bool regional = !string.IsNullOrEmpty(row.fontResource);
            if (regional && (row.nanumMissing.Length == 0 || row.notoFallbackEligible ||
                !row.fontResource.StartsWith("Art/fonts/", StringComparison.Ordinal)))
                throw new InvalidOperationException("Inconsistent regional oracle row " + row.code);
            bool unresolved = !regional && !row.notoFallbackEligible && row.nanumMissing.Length > 0;
            if (unresolved) expectedUnresolved++; else expectedComplete++;
            var expectedFont = regional ? Resources.Load<Font>(row.fontResource) :
                row.notoFallbackEligible ? notoFont : baseFont;
            if (regional)
            {
                Check(expectedFont != null, row.code + " regional Font resource loaded: " + row.fontResource);
                if (expectedFont == null) throw new InvalidOperationException("Regional Font resource missing: " + row.fontResource);
            }
            string expectedCue = CueAt(language, lobby.CurrentVideo.Time - NativeLobby.WorldCueOffset);
            if (string.IsNullOrEmpty(expectedCue)) throw new InvalidOperationException("No paused cue for " + row.code);
            lobby.SetLanguage(row.code);
            yield return new WaitForEndOfFrame();
            if (regional)
            {
                captionTransitions.Add(RegionalTransition("first-frame", row.code, expectedCue, expectedFont));
                yield return Until(() => WorldCaptionReady(row.code, expectedCue, expectedFont),
                    row.code + " actual caption/style ready", 3f, false);
                captionTransitions.Add(RegionalTransition("settled", row.code, expectedCue, expectedFont));
                bool selected = WorldCaptionReady(row.code, expectedCue, expectedFont);
                Check(selected, row.code + " actual caption and shadow select exact regional Font object");
                if (!selected) throw new InvalidOperationException("Regional caption/style selection failed for " + row.code);
            }
            else yield return Until(() => WorldCaptionReady(row.code, expectedCue, expectedFont),
                row.code + " actual caption/style ready", 3f, false);
            var style = Style("CaptionStyleForLanguage");
            var shadow = Style("CaptionShadowForLanguage");
            var glyphs = VisibleCharacters(language);
            if (glyphs.Length != row.visibleCodePoints)
                throw new InvalidOperationException("Stale caption oracle visible-character count for " + row.code);
            var missing = new List<char>();
            foreach (char ch in glyphs)
            {
                expectedFont.RequestCharactersInTexture(ch.ToString(), 50, FontStyle.Normal);
                CharacterInfo info;
                if (!expectedFont.HasCharacter(ch) || !expectedFont.GetCharacterInfo(ch, out info, 50, FontStyle.Normal))
                    missing.Add(ch);
            }
            var result = new CaptionCoverageResult {
                code = row.code, fontName = expectedFont.name, fontResource = row.fontResource, cueText = expectedCue,
                expectedNoto = row.notoFallbackEligible, captionDrawn = lobby.CaptionVisible,
                shadowFontMatches = ReferenceEquals(style.font, shadow.font),
                visibleCharacterCount = glyphs.Length, missingCharacterCount = missing.Count,
                missingCharacters = new string(missing.ToArray()),
                status = unresolved ? "UNRESOLVED" : missing.Count == 0 ? "COVERED" : "FAIL"
            };
            captionCoverage.Add(result);
            if (unresolved)
            {
                unresolvedLanguages.Add(row.code);
                continue;
            }
            bool preservedBase = regional || row.nanumMissing.Length != 0 ||
                ReferenceEquals(style, baseStyle) && ReferenceEquals(shadow, baseShadow);
            bool passed = result.status == "COVERED" && result.shadowFontMatches && preservedBase;
            Check(passed, row.code + " complete 32-cue visible glyphs and selected style: " +
                result.visibleCharacterCount + " chars, missing=" + result.missingCharacterCount);
            if (!passed) throw new InvalidOperationException("Supported caption coverage failed for " + row.code);
            complete++;
            if (row.notoFallbackEligible || regional)
            {
                ExpectWorld(row.code, expectedCue, expectedFont);
                yield return Capture("world-cover-" + row.code + "-720p", 1280, 720);
            }
        }
        Check(complete == expectedComplete && unresolvedLanguages.Count == expectedUnresolved &&
            complete + unresolvedLanguages.Count == oracle.languageCount,
            "oracle-classified " + expectedComplete + " fully covered and " + expectedUnresolved + " UNRESOLVED languages");
        if (complete != expectedComplete || unresolvedLanguages.Count != expectedUnresolved)
            throw new InvalidOperationException("Unexpected caption coverage partition");
    }

    IEnumerator Review()
    {
        output = Argument("-output");
        if (string.IsNullOrWhiteSpace(output) || output.StartsWith("-", StringComparison.Ordinal) || !Path.IsPathRooted(output))
            throw new ArgumentException("--unity-ui-resume-smoke requires an absolute -output QA directory");
        output = Path.GetFullPath(output);
        Directory.CreateDirectory(output);
        captionCoverageRequested = Array.IndexOf(Environment.GetCommandLineArgs(), "--qa-caption-coverage") >= 0;
        yield return Until(() => NativeGame.Instance != null, "NativeGame instance", 5f);
        game = NativeGame.Instance;
        lobby = (NativeLobby)Field(game, "lobby");
        Check(lobby != null, "NativeLobby initialized");
        if (lobby == null) throw new InvalidOperationException("NativeLobby missing");
        SetField(game, "lobbySmoke", true);
        lobby.AutomatedInput = true;
        diagnosticPreview = (bool)Field(lobby, "diagnosticPreview");
        Check(diagnosticPreview == (Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-ui-diagnostics") >= 0), "diagnostic flag reflection");

        var data = Resources.Load<TextAsset>("Data/lobby_frontend");
        if (data == null) throw new InvalidOperationException("Data/lobby_frontend missing");
        var subtitles = JsonUtility.FromJson<LobbySubtitleData>(data.text);
        LobbyCaptionCue candidate = null;
        if (subtitles != null && subtitles.captions != null)
            foreach (var language in subtitles.captions)
                if (language.code == "uk" && language.cues != null)
                    foreach (var cue in language.cues)
                        if (candidate == null && cue.text != null && cue.text.IndexOfAny(new[] { 'є', 'і', 'ї' }) >= 0) candidate = cue;
        Check(candidate != null, "Ukrainian cue with є/і/ї exists");
        if (candidate == null) throw new InvalidOperationException("No Ukrainian probe cue");
        ukCue = candidate.text;
        double seekTime = candidate.start + NativeLobby.WorldCueOffset + .25;
        Check(seekTime < candidate.end + NativeLobby.WorldCueOffset, "probe point inside Ukrainian cue");

        lobby.Begin();
        yield return null;
        lobby.AdvanceSplash();
        yield return null;
        lobby.AdvanceSplash();
        yield return null;
        lobby.StartGate();
        yield return Until(() => lobby.Flow.Page == LobbyPage.Gate, "normal gate entry", 3f);
        yield return Until(() => lobby.CurrentVideo.Prepared, "gate video prepared", 15f);
        lobby.CurrentVideo.Seek(Math.Max(0, lobby.CurrentVideo.Duration - .08));
        yield return Until(() => lobby.Flow.Page == LobbyPage.WorldIntro, "world intro reached through gate", 18f);
        yield return Until(() => lobby.CurrentVideo.Prepared && lobby.CurrentVideo.Frame >= 0, "world video prepared and decoded", 15f);
        Check(seekTime < lobby.CurrentVideo.Duration, "probe seek within world duration");
        if (seekTime >= lobby.CurrentVideo.Duration) throw new InvalidOperationException("Probe seek beyond world video");
        long before = lobby.CurrentVideo.Frame;
        lobby.CurrentVideo.Seek(seekTime);
        yield return Until(() => lobby.CurrentVideo.Frame != before && Math.Abs(lobby.CurrentVideo.Time - seekTime) < .5, "world seek frame/time settled", 10f);
        lobby.CurrentVideo.Pause();
        yield return null;
        yield return null;
        var sourceCaptionFont = Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");
        var notoCaptionFont = Resources.Load<Font>("Art/fonts/NativeCaptionNotoSerif");
        lobby.SetLanguage("ko");
        yield return Until(() => WorldCaptionReady("ko", "", sourceCaptionFont), "Korean caption actually drawn before style inspection", 8f);
        var koStyle = Style("CaptionStyleForLanguage");
        var koShadow = Style("CaptionShadowForLanguage");
        Check(koStyle != null && koStyle.font != null, "Korean source caption style initialized");
        Check(koShadow != null && koShadow.font == koStyle.font, "Korean shadow uses source caption font");
        koText = lobby.SubtitleText;
        Check(!string.IsNullOrEmpty(koText), "Korean caption visible at probe time");

        lobby.SetLanguage("uk");
        yield return Until(() => WorldCaptionReady("uk", ukCue, notoCaptionFont), "Ukrainian cue and font actually drawn", 8f);
        var ukStyle = Style("CaptionStyleForLanguage");
        var ukShadow = Style("CaptionShadowForLanguage");
        var ukFont = notoCaptionFont;
        Check(ukFont != null && ukStyle != null && ReferenceEquals(ukStyle.font, ukFont), "Ukrainian caption selects dedicated font");
        Check(ukShadow != null && ukStyle != null && ReferenceEquals(ukShadow.font, ukStyle.font), "Ukrainian shadow uses same font");
        if (ukFont == null) throw new InvalidOperationException("Ukrainian caption font missing");
        foreach (char glyph in new[] { 'є', 'і', 'ї' }) Check(Supports(ukFont, glyph), "Ukrainian glyph " + glyph);
        ukText = lobby.SubtitleText;
        Check(!string.IsNullOrEmpty(ukText) && ukText == ukCue, "actual Ukrainian cue after seek");
        ExpectWorld("uk", ukCue, ukFont);
        yield return Capture("world-uk-720p", 1280, 720);
        yield return Capture("world-uk-1080p", 1920, 1080);
        lobby.SetLanguage("ko");
        yield return Until(() => WorldCaptionReady("ko", koText, sourceCaptionFont), "Korean cue and source font redrawn", 8f);
        Check(ReferenceEquals(Style("CaptionStyleForLanguage"), koStyle), "Korean caption restores original style object");
        Check(ReferenceEquals(Style("CaptionShadowForLanguage"), koShadow), "Korean shadow restores original style object");
        Check(!string.IsNullOrEmpty(lobby.SubtitleText), "actual Korean cue after language return");
        ExpectWorld("ko", koText, sourceCaptionFont);
        yield return Capture("world-ko-720p", 1280, 720);
        yield return Capture("world-ko-1080p", 1920, 1080);

        if (captionCoverageRequested)
            yield return VerifyCaptionCoverage(subtitles, sourceCaptionFont, notoCaptionFont, koStyle, koShadow);

        lobby.ShowLobby();
        yield return null;
        Check(lobby.Flow.Page == LobbyPage.Lobby && lobby.IsBlocking, "lobby ready for actual draw");
        yield return Capture("lobby-720p", 1280, 720);
        yield return Capture("lobby-1080p", 1920, 1080);
        lobby.SelectPreview();
        Check(lobby.EnterNativeTest(), "controlled preview enters native gameplay");
        SetField(game, "<Running>k__BackingField", false);
        yield return null;
        Check(!game.Running && !lobby.IsBlocking, "gameplay drawn while simulation stopped");
        yield return Capture("hud-status-720p", 1280, 720);
        string originalName = lobby.ActiveCharacterName;
        SetField(lobby, "<ActiveCharacterName>k__BackingField", "UI 검수");
        yield return null;
        Check(!game.Running && !lobby.IsBlocking && lobby.ActiveCharacterName == "UI 검수", "named HUD controlled state");
        yield return Capture("named-hud-720p", 1280, 720);
        namedHudTopLeftChangeRatio = TopLeftChangeRatio(
            Path.Combine(output, "hud-status-720p.png"), Path.Combine(output, "named-hud-720p.png"));
        Check(diagnosticPreview ? namedHudTopLeftChangeRatio > .02f : namedHudTopLeftChangeRatio < .001f,
            "named HUD upper-left visual gate ratio=" + namedHudTopLeftChangeRatio.ToString("F6") +
            (diagnosticPreview ? " expected >0.02" : " expected <0.001"));
        SetField(lobby, "<ActiveCharacterName>k__BackingField", originalName);
        yield return null;
        yield return Capture("hud-status-1080p", 1920, 1080);
    }
}
