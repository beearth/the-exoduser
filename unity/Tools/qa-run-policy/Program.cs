// QaRunPolicy unit test (pure C#): argument list + batch flag -> "automated run?". usage: dotnet run -c Release
// Every automated / QA / smoke / capture / review / check run must be classified true (sandboxed, never the player's real save); ordinary play must stay false.
using System;
using Exoduser.UnityPort.Core;

static class P
{
    static int checks, bad;
    static void Check(string[] args, bool batch, bool expected)
    {
        checks++; bool got = QaRunPolicy.IsAutomated(args, batch);
        if (got != expected) { bad++; Console.WriteLine("FAIL [" + (args == null ? "null" : string.Join(" ", args)) + "] batch=" + batch + " expected " + expected + " got " + got); }
    }
    static int Main()
    {
        string[] none = new string[0];
        // ordinary play: nothing automated
        Check(none, false, false);
        Check(new[] { "EXODUSER-Unity.exe" }, false, false);
        Check(new[] { "EXODUSER-Unity.exe", "-screen-width", "1920", "-popupwindow" }, false, false);
        Check(new[] { "x.exe", "--unity-mute" }, false, false);                 // mute alone is not a QA run
        Check(new[] { "x.exe", "--unity-basic-weapon" }, false, false);
        Check(new[] { "x.exe", "--unity-build-flavor", "demo" }, false, false);
        Check(new[] { "x.exe", "--unity-world-3d" }, false, false);
        Check(new[] { "x.exe", "-logFile", "player.log" }, false, false);
        Check(new[] { "x.exe", "--other-smoke" }, false, false);                 // only --unity- prefixed arguments count
        // batchmode is always automated
        Check(none, true, true);
        Check(new[] { "x.exe", "-batchmode" }, true, true);
        // explicit QA arguments
        string[] qa = { "--unity-m1-check", "--unity-rmint-check", "--unity-hud-smoke", "--unity-lobby-smoke", "--unity-b05-smoke", "--unity-autopotion-smoke",
                        "--unity-exp-capture", "--unity-forge-capture", "--unity-region-hud-capture", "--unity-first-practice-capture", "--unity-ui-finish-capture",
                        "--unity-frontend-review", "--unity-patch-notes-review", "--unity-cinematic-persistence-review", "--unity-smoke",
                        "--unity-c04-dump", "--unity-field-compare", "--unity-lobby-probe", "--unity-frontend-pad-qa", "--unity-arabic-caption-preview",
                        "--unity-qa-sandbox", "--unity-qa-anything", "--unity-a15-direct" };
        foreach (string a in qa)
        {
            Check(new[] { "x.exe", a }, false, true);
            Check(new[] { "x.exe", "-output", "C:\\o", a }, false, true);          // position independent
        }
        // a QA argument anywhere in a longer list
        Check(new[] { "x.exe", "-screen-width", "1600", "--unity-mute", "--unity-m1-check", "-output", "C:\\o" }, false, true);
        Check(null, false, false);
        Check(null, true, true);
        // sandbox argument detection
        checks++; if (!QaRunPolicy.SandboxRequested(new[] { "x.exe", "--unity-qa-sandbox", "C:\\s" })) { bad++; Console.WriteLine("FAIL SandboxRequested true"); }
        checks++; if (QaRunPolicy.SandboxRequested(new[] { "x.exe", "--unity-m1-check" })) { bad++; Console.WriteLine("FAIL SandboxRequested false"); }
        Console.WriteLine("QaRunPolicy: " + checks + " checks, " + bad + " failed");
        return bad == 0 ? 0 : 1;
    }
}
