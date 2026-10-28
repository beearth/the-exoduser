using System;

namespace Exoduser.DevTools
{
    // 작업 서버(ExoJobServer)가 job을 실행하는 동안에는 job 인자를, 아니면 실제 명령줄을 돌려준다.
    // 기존 코드의 Array.IndexOf(args, "-key") 방식이 그대로 동작하도록 첫 칸은 실행 파일 자리다.
    public static class ExoArgs
    {
        static string[] _job;

        public static bool InJob { get { return _job != null; } }

        public static string[] Get() { return _job ?? Environment.GetCommandLineArgs(); }

        internal static void Begin(string[] jobArgs)
        {
            int n = jobArgs == null ? 0 : jobArgs.Length;
            var a = new string[n + 1];
            a[0] = "exo-job";
            for (int i = 0; i < n; i++) a[i + 1] = jobArgs[i];
            _job = a;
        }

        internal static void End() { _job = null; }
    }
}
