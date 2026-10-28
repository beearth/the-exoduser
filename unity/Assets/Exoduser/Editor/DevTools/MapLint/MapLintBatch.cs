using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Debug = UnityEngine.Debug;

// 명령줄: Unity -batchmode -projectPath <p> -executeMethod Exoduser.DevTools.MapLint.MapLintBatch.RunBatch
//        -scene Assets/....unity -grid Assets/....json -out <결과.json> [-profile Assets/....maplint.json] [-shot <탑뷰.png>] [-repeat <n>]
// -scene 을 여러 번 쓰면 씬마다 (-grid -out -profile -shot) 묶음을 따로 읽어 한 번의 Unity 실행으로 모두 검사한다.
// 씬은 열기만 하고 저장하지 않는다. 종료 코드: 0=전부 PASS, 1=위반 있음(L7 경고는 무관), 2=실행 오류.
namespace Exoduser.DevTools.MapLint
{
    public static class MapLintBatch
    {
        public static void RunBatch()
        {
            var args = Environment.GetCommandLineArgs();
            int code = RunBatch(args);
            bool jobServer = Array.IndexOf(args, "-exoJobServer") >= 0;
            if (!jobServer) EditorApplication.Exit(code);
        }

        public static int RunBatch(string[] args)
        {
            int worst = 0;
            try
            {
                // 씬 구간 나누기
                var starts = new List<int>(); for (int i = 0; i < args.Length; i++) if (args[i] == "-scene") starts.Add(i);
                if (starts.Count == 0) { Debug.LogError("[MapLint] 필수 인자: -scene <Assets/...unity> -grid <Assets/...json> -out <json>"); return 2; }
                string repeatS = Arg(args, 0, args.Length, "-repeat"); int repeat = 1; if (repeatS != null) int.TryParse(repeatS, out repeat);
                for (int k = 0; k < starts.Count; k++)
                {
                    int a = starts[k], b = k + 1 < starts.Count ? starts[k + 1] : args.Length;
                    int rc = RunOne(args, a, b, Mathf.Max(1, repeat)); if (rc > worst) worst = rc;
                }
            }
            catch (Exception e) { Debug.LogError("[MapLint] 실행 오류: " + e); return 2; }
            return worst;
        }

        static int RunOne(string[] args, int a, int b, int repeat)
        {
            try
            {
                string scene = Arg(args, a, b, "-scene"), grid = Arg(args, a, b, "-grid"), outJson = Arg(args, a, b, "-out"), profilePath = Arg(args, a, b, "-profile"), shot = Arg(args, a, b, "-shot");
                if (string.IsNullOrEmpty(scene) || string.IsNullOrEmpty(grid) || string.IsNullOrEmpty(outJson)) { Debug.LogError("[MapLint] -scene/-grid/-out 가 모두 필요합니다: " + scene); return 2; }
                var total = Stopwatch.StartNew();
                var p = MapLintCore.LoadProfile(profilePath, scene);
                var so = Stopwatch.StartNew();
                EditorSceneManager.OpenScene(scene, OpenSceneMode.Single);
                long openMs = so.ElapsedMilliseconds;
                ShotCanvas canvas = null;
                if (!string.IsNullOrEmpty(shot)) { canvas = new ShotCanvas(p); canvas.Base(MapLintCore.LoadGrid(grid, p)); }
                var res = MapLintCore.Run(p, grid, scene, canvas);
                var repeatMs = new List<long>();
                for (int r = 1; r < repeat; r++) repeatMs.Add(MapLintCore.Run(p, grid, scene, null).durMs);   // 두 번째 이후(캐시 데워진 뒤) 소요
                if (canvas != null) { canvas.Overlay(res); canvas.Save(shot); }
                string json = res.ToJson();
                json = json.Substring(0, json.Length - 1) + ",\"sceneOpenMs\":" + openMs + ",\"repeatMs\":[" + string.Join(",", repeatMs) + "],\"totalMs\":" + total.ElapsedMilliseconds + "}";
                Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(outJson)));
                File.WriteAllText(outJson, json);
                bool allPass = true;
                foreach (var c in res.checks)
                {
                    Debug.Log("[MapLint] " + Path.GetFileNameWithoutExtension(scene) + " " + c.id + " " + (c.id == "L7" ? "WARN " + c.count : (c.pass ? "PASS" : "FAIL") + " count=" + c.count) + " - " + c.title);
                    if (c.id != "L7" && !c.pass) allPass = false;
                }
                Debug.Log("[MapLint] check " + res.durMs + " ms (repeat " + string.Join(",", repeatMs) + "), scene open " + openMs + " ms, total " + total.ElapsedMilliseconds + " ms -> " + outJson);
                EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);   // 저장하지 않고 닫는다
                return allPass ? 0 : 1;
            }
            catch (Exception e) { Debug.LogError("[MapLint] 실행 오류: " + e); return 2; }
        }

        static string Arg(string[] args, int from, int to, string key)
        {
            for (int i = from; i + 1 < to; i++) if (args[i] == key) return args[i + 1];
            return null;
        }
    }
}
