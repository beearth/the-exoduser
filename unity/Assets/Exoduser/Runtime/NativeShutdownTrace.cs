using System;
using System.IO;
using System.Text;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 명시한 격리 검수에서만 종료 경계를 기록한다. 종료 방식·대기·강제 종료는 바꾸지 않는다.
    internal static class NativeShutdownTrace
    {
        static readonly object sync = new object();
        static string path;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Init()
        {
            var args = Environment.GetCommandLineArgs();
            if (Array.IndexOf(args, "--unity-shutdown-trace") < 0 || !NativeQaSandbox.Active) return;
            int i = Array.IndexOf(args, "-output");
            if (i < 0 || i + 1 >= args.Length || string.IsNullOrEmpty(args[i + 1])) return;
            try { Directory.CreateDirectory(args[i + 1]); path = Path.Combine(args[i + 1], "종료-경계.tsv"); }
            catch { return; }
            Record("진단 등록");
            Application.wantsToQuit += () => { Record("Application.wantsToQuit"); return true; };
            Application.quitting += () => Record("Application.quitting");
            AppDomain.CurrentDomain.DomainUnload += (s, e) => Record("AppDomain.DomainUnload");
            AppDomain.CurrentDomain.ProcessExit += (s, e) => Record("AppDomain.ProcessExit");
        }

        internal static void Record(string stage)
        {
            if (path == null) return;
            try
            {
                lock (sync)
                using (var file = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.ReadWrite))
                {
                    byte[] data = Encoding.UTF8.GetBytes(DateTime.UtcNow.ToString("o") + "\t" + stage.Replace('\n', ' ').Replace('\r', ' ') + "\n");
                    file.Write(data, 0, data.Length); file.Flush();
                }
            }
            catch { /* 진단 파일 오류가 기존 종료 동작에 영향을 주지 않는다. */ }
        }
    }
}
