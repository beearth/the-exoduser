using System;
using System.Collections;
using System.Collections.Generic;
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
    string ukCue = "";
    string ukText = "";
    string koText = "";

    [Serializable] sealed class Receipt
    {
        public string scope, output, error, ukCue, ukText, koText;
        public bool passed, diagnosticPreview;
        public int failures;
        public string[] checks, images;
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
        while (stack.Count > 0 && !finished)
        {
            if (Time.realtimeSinceStartup - started > LimitSeconds)
            {
                Fail("60 second fixture timeout");
                Finish("timeout");
                yield break;
            }
            bool moved = false;
            object value = null;
            Exception stepError = null;
            try { moved = stack.Peek().MoveNext(); if (moved) value = stack.Peek().Current; }
            catch (Exception e) { stepError = e; }
            if (stepError != null)
            {
                Fail("fixture exception: " + stepError);
                Finish(stepError.ToString());
                yield break;
            }
            if (!moved) { stack.Pop(); continue; }
            if (value is IEnumerator nested) { stack.Push(nested); continue; }
            yield return value;
        }
        if (!finished) Finish("");
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
            passed = failures == 0 && error.Length == 0, diagnosticPreview = diagnosticPreview,
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

    IEnumerator Until(Func<bool> ready, string label, float seconds)
    {
        float deadline = Time.realtimeSinceStartup + seconds;
        while (!ready() && Time.realtimeSinceStartup < deadline)
        {
            if (lobby != null && !string.IsNullOrEmpty(lobby.VideoError)) throw new InvalidOperationException(label + ": " + lobby.VideoError);
            yield return null;
        }
        if (!ready()) throw new TimeoutException(label + " after " + seconds + " seconds");
        Check(true, label);
    }
    IEnumerator Capture(string name, int width, int height)
    {
        Screen.SetResolution(width, height, FullScreenMode.Windowed);
        yield return null;
        yield return null;
        Check(Screen.width == width && Screen.height == height, name + " resolution");
        if (Screen.width != width || Screen.height != height) throw new InvalidOperationException(name + " resolution unavailable");
        string path = Path.Combine(output, name + ".png");
        if (File.Exists(path)) throw new IOException("Refusing to overwrite existing QA image: " + path);
        yield return new WaitForEndOfFrame();
        ScreenCapture.CaptureScreenshot(path);
        yield return Until(() => File.Exists(path) && new FileInfo(path).Length > 1024, name + " screenshot bytes", 5f);
        images.Add(path);
    }

    IEnumerator Review()
    {
        output = Argument("-output");
        if (string.IsNullOrWhiteSpace(output) || output.StartsWith("-", StringComparison.Ordinal) || !Path.IsPathRooted(output))
            throw new ArgumentException("--unity-ui-resume-smoke requires an absolute -output QA directory");
        output = Path.GetFullPath(output);
        Directory.CreateDirectory(output);
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
        lobby.SetLanguage("ko");
        yield return null;
        var koStyle = Style("CaptionStyleForLanguage");
        var koShadow = Style("CaptionShadowForLanguage");
        Check(koStyle != null && koStyle.font != null, "Korean source caption style initialized");
        Check(koShadow != null && koShadow.font == koStyle.font, "Korean shadow uses source caption font");
        koText = lobby.SubtitleText;
        Check(!string.IsNullOrEmpty(koText), "Korean caption visible at probe time");

        lobby.SetLanguage("uk");
        yield return null;
        yield return null;
        var ukStyle = Style("CaptionStyleForLanguage");
        var ukShadow = Style("CaptionShadowForLanguage");
        var ukFont = Resources.Load<Font>("Art/fonts/NativeCaptionNotoSerif");
        Check(ukFont != null && ukStyle != null && ReferenceEquals(ukStyle.font, ukFont), "Ukrainian caption selects dedicated font");
        Check(ukShadow != null && ukStyle != null && ReferenceEquals(ukShadow.font, ukStyle.font), "Ukrainian shadow uses same font");
        if (ukFont == null) throw new InvalidOperationException("Ukrainian caption font missing");
        foreach (char glyph in new[] { 'є', 'і', 'ї' }) Check(Supports(ukFont, glyph), "Ukrainian glyph " + glyph);
        ukText = lobby.SubtitleText;
        Check(!string.IsNullOrEmpty(ukText) && ukText == ukCue, "actual Ukrainian cue after seek");
        yield return Capture("world-uk-720p", 1280, 720);
        yield return Capture("world-uk-1080p", 1920, 1080);
        lobby.SetLanguage("ko");
        yield return null;
        yield return null;
        Check(ReferenceEquals(Style("CaptionStyleForLanguage"), koStyle), "Korean caption restores original style object");
        Check(ReferenceEquals(Style("CaptionShadowForLanguage"), koShadow), "Korean shadow restores original style object");
        Check(!string.IsNullOrEmpty(lobby.SubtitleText), "actual Korean cue after language return");
        yield return Capture("world-ko-720p", 1280, 720);
        yield return Capture("world-ko-1080p", 1920, 1080);

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
        yield return Capture("hud-status-1080p", 1920, 1080);
    }
}
