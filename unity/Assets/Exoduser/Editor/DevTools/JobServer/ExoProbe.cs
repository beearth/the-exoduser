using System;
using System.Threading;
using UnityEngine;

namespace Exoduser.DevTools
{
    // DT-01 검증용 작은 작업 모음(서버/배치 양쪽에서 같은 결과를 내는지, 컴파일 갱신·오류 경로를 확인하는 용도).
    public static class ExoProbe
    {
        public const int Value = 1;   // 컴파일 갱신 측정용 상수(측정 때 값만 바꿔 본다)

        // 시그니처 ():  ExoArgs.Get()으로 job 인자를 읽는다
        public static int Run()
        {
            var a = ExoArgs.Get();
            Debug.Log("[ExoProbe] value=" + Value + " inJob=" + ExoArgs.InJob + " args=" + string.Join(" ", a));
            return 0;
        }

        // 시그니처 (string[]):  -ms <밀리초> 만큼 쉰다(동시 제출 순서 확인용)
        public static int Sleep(string[] args)
        {
            int ms = 1000; string tag = "";
            int i = Array.IndexOf(args, "-ms"); if (i >= 0 && i + 1 < args.Length) int.TryParse(args[i + 1], out ms);
            int t = Array.IndexOf(args, "-tag"); if (t >= 0 && t + 1 < args.Length) tag = args[t + 1];
            Debug.Log("[ExoProbe] sleep begin tag=" + tag);
            Thread.Sleep(ms);
            Debug.Log("[ExoProbe] sleep end tag=" + tag);
            return 0;
        }

        public static void Fail() { throw new InvalidOperationException("ExoProbe.Fail: 의도된 예외"); }

        // PROBE_MARKER
    }
}
