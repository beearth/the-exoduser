using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

// 11-07 대검 손 키 반입. Blender 손 키(I:/EXODUSER-Storage/study/keyanim)의 프레임별 본 자세를 실제 Warrior 프리팹 계층의
// 일반(Generic) Transform 곡선 클립으로 굽는다. 레퍼런스 원본은 쓰지 않는다(우리 키만).
// job: exo-unity.ps1 run -Method Exoduser.CharacterLab.GreatswordKeyImport.Run -Args '-json,<flat.json>,-clip,<Assets/...anim>,-report,<report.json>'
// 축 변환: Blender 휴지 자세 본 위치와 Unity 프리팹 휴지 자세 본 위치를 48개 부호 있는 축 순열 중 최소 오차로 맞춘다(자동 판정).
// 본 회전: Unity 회전 = M·(Blender 자세 회전·Blender 휴지 회전⁻¹)·Mᵀ · Unity 휴지 회전 (본 축 규약과 무관).
namespace Exoduser.CharacterLab
{
    public static class GreatswordKeyImport
    {
        [Serializable] class Flat { public string motion; public int fps, frameCount, contact; public string[] bones; public float[] rest, frames; }
        [Serializable] class KeyPoseTable { public int fps, frames, contactFrame, hips; public string[] paths; public float[] rot, hipsPos; }
        [Serializable] class Report
        {
            public string clip, motion, prefab, axisMap; public int frames, bones, contactFrame; public float scale, restFitRmsMeters;
            public float maxLeftGripError, gripAlongMin = 9, gripAlongMax = -9; public int maxLeftGripErrorFrame; public float contactTipHeight; public List<string> missingBones = new List<string>(); public bool passed;
        }
        const string Prefab = "Assets/Exoduser/Resources/Characters/Warrior.prefab";

        static string Arg(string[] a, string key, string fallback) { int i = Array.IndexOf(a, key); return i >= 0 && i + 1 < a.Length ? a[i + 1] : fallback; }

        /// <summary>11-08 칼 2.50m(CTO 결정): WeaponImport를 새 길이로 다시 돌리고, 전사 프리팹 안의 칼 사본을 같은 배율로 맞춘다(소켓~자루 끝 .15 x 2.50/1.60).
        /// Blender rig와 같은 균일 배율이다. Core 판정 사거리는 바꾸지 않는다.</summary>
        public static int ResizeWeapon()
        {
            // 재질·텍스처·다른 프리팹 참조는 건드리지 않는다(WeaponImport.Run은 재질 값을 기본으로 되돌리므로 부르지 않음): FBX 배율과 칼 위치만 같은 비율로 바꾼다. 이미 목표 길이면 아무것도 하지 않는다.
            var args = Exoduser.DevTools.ExoArgs.Get();
            string reportPath = Arg(args, "-report", "I:/EXODUSER-Storage/study/keyanim/unity/weapon_resize_report.json");
            float target = WeaponImport.Length;
            var root = PrefabUtility.LoadPrefabContents(Prefab);
            string result;
            try
            {
                var socket = root.GetComponentsInChildren<Transform>(true).First(t => t.name == "Socket_Weapon_R");
                var weapon = socket.Cast<Transform>().First(t => t.name == "Warrior_Greatsword");
                var model = weapon.Find("Model");
                System.Func<float[]> measure = () => { float lo = float.MaxValue, hi = float.MinValue; foreach (var mf in weapon.GetComponentsInChildren<MeshFilter>(true)) foreach (var v in mf.sharedMesh.vertices) { float y = socket.InverseTransformPoint(mf.transform.TransformPoint(v)).y; lo = Mathf.Min(lo, y); hi = Mathf.Max(hi, y); } float sx = socket.lossyScale.y; return new[] { (hi - lo) * sx, hi * sx, -lo * sx }; };
                var before = measure(); float k = target / before[0];
                if (Mathf.Abs(k - 1) > 1e-4f)
                {
                    var imp = (ModelImporter)AssetImporter.GetAtPath(WeaponImport.Fbx);
                    imp.globalScale *= k; imp.isReadable = true; imp.SaveAndReimport();
                    model.localPosition *= k;
                    var art = PrefabUtility.LoadPrefabContents(WeaponImport.PrefabPath);
                    try { var am = art.transform.Find("Model"); if (am != null) { am.localPosition *= k; PrefabUtility.SaveAsPrefabAsset(art, WeaponImport.PrefabPath); } } finally { PrefabUtility.UnloadPrefabContents(art); }
                }
                weapon.localPosition = new Vector3(0, Exoduser.UnityPort.GreatswordKeyDirector.SocketToPommel, 0);
                var after = measure();
                result = "{\"length\":" + after[0].ToString("F4") + ",\"socketToPommel\":" + after[1].ToString("F4") + ",\"socketToTip\":" + after[2].ToString("F4") + ",\"scaleApplied\":" + k.ToString("F5") + ",\"expectLength\":" + target.ToString("F2") + "}";
                PrefabUtility.SaveAsPrefabAsset(root, Prefab);
            }
            finally { PrefabUtility.UnloadPrefabContents(root); }
            AssetDatabase.SaveAssets();
            File.WriteAllText(reportPath, result); Debug.Log("[WEAPON_RESIZE] " + result);
            return 0;
        }

        public static int Run()
        {
            var args = Exoduser.DevTools.ExoArgs.Get();
            string json = Arg(args, "-json", "I:/EXODUSER-Storage/study/keyanim/unity/a1_bones_flat.json");
            string clipPath = Arg(args, "-clip", "Assets/Exoduser/Resources/Characters/Warrior_GS_A1_pose.json");
            string reportPath = Arg(args, "-report", "I:/EXODUSER-Storage/study/keyanim/unity/a1_import_report.json");
            var data = JsonUtility.FromJson<Flat>(File.ReadAllText(json));
            var report = new Report { clip = clipPath, motion = data.motion, prefab = Prefab, frames = data.frameCount, contactFrame = data.contact };
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(Prefab);
            var inst = (GameObject)UnityEngine.Object.Instantiate(prefab);
            try
            {
                var animator = inst.GetComponent<Animator>() ?? inst.GetComponentInChildren<Animator>(true);
                var root = animator.transform;
                var all = root.GetComponentsInChildren<Transform>(true);
                var map = new Dictionary<string, Transform>();
                foreach (var t in all) if (!map.ContainsKey(t.name)) map[t.name] = t;
                int n = data.bones.Length;
                var used = new List<int>();
                for (int i = 0; i < n; i++)
                {
                    if (!map.ContainsKey(data.bones[i])) { report.missingBones.Add(data.bones[i]); continue; }
                    used.Add(i);
                }
                // --- rest fit (Blender char space -> Unity root local)
                var P = new Vector3[n]; var Qb = new Quaternion[n];   // Blender rest (raw components, right-handed Blender convention kept as numbers)
                for (int i = 0; i < n; i++) { P[i] = new Vector3(data.rest[i * 7], data.rest[i * 7 + 1], data.rest[i * 7 + 2]); }
                var U = new Vector3[n];
                foreach (int i in used) U[i] = root.InverseTransformPoint(map[data.bones[i]].position);
                double best = double.MaxValue; int[] bestPerm = null; int[] bestSign = null; float bestScale = 1; Vector3 bestT = Vector3.zero;
                int[][] perms = { new[] { 0, 1, 2 }, new[] { 0, 2, 1 }, new[] { 1, 0, 2 }, new[] { 1, 2, 0 }, new[] { 2, 0, 1 }, new[] { 2, 1, 0 } };
                foreach (var perm in perms)
                    for (int sg = 0; sg < 8; sg++)
                    {
                        var sign = new[] { (sg & 1) != 0 ? -1 : 1, (sg & 2) != 0 ? -1 : 1, (sg & 4) != 0 ? -1 : 1 };
                        Vector3 Map(Vector3 v) => new Vector3(sign[0] * v[perm[0]], sign[1] * v[perm[1]], sign[2] * v[perm[2]]);
                        Vector3 cp = Vector3.zero, cu = Vector3.zero; foreach (int i in used) { cp += Map(P[i]); cu += U[i]; }
                        cp /= used.Count; cu /= used.Count;
                        double num = 0, den = 0; foreach (int i in used) { var a = Map(P[i]) - cp; var b = U[i] - cu; num += Vector3.Dot(a, b); den += a.sqrMagnitude; }
                        float s = (float)(num / Math.Max(1e-9, den)); if (s <= 0) continue;
                        double err = 0; foreach (int i in used) err += ((Map(P[i]) - cp) * s - (U[i] - cu)).sqrMagnitude;
                        if (err < best) { best = err; bestPerm = perm; bestSign = sign; bestScale = s; bestT = cu - cp * s; }
                    }
                report.scale = bestScale; report.restFitRmsMeters = (float)Math.Sqrt(best / used.Count) / Math.Max(1e-6f, bestScale);
                var Mx = new float[3, 3];
                for (int r = 0; r < 3; r++) Mx[r, bestPerm[r]] = bestSign[r];
                report.axisMap = string.Join(",", Enumerable.Range(0, 3).Select(r => (bestSign[r] < 0 ? "-" : "+") + "xyz"[bestPerm[r]]));
                Vector3 MapP(Vector3 v) => new Vector3(bestSign[0] * v[bestPerm[0]], bestSign[1] * v[bestPerm[1]], bestSign[2] * v[bestPerm[2]]) * bestScale + bestT;

                // Blender quaternion (w,x,y,z) -> 3x3 rotation (column-vector convention)
                float[,] QM(float w, float x, float y, float z)
                {
                    return new float[3, 3] {
                        { 1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y) },
                        { 2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x) },
                        { 2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y) } };
                }
                float[,] Mul(float[,] a, float[,] b) { var c = new float[3, 3]; for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) { float s = 0; for (int k = 0; k < 3; k++) s += a[i, k] * b[k, j]; c[i, j] = s; } return c; }
                float[,] T(float[,] a) { var c = new float[3, 3]; for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) c[i, j] = a[j, i]; return c; }
                Quaternion ToUnity(float[,] m)
                {
                    var fwd = new Vector3(m[0, 2], m[1, 2], m[2, 2]); var up = new Vector3(m[0, 1], m[1, 1], m[2, 1]);
                    return Quaternion.LookRotation(fwd, up);
                }
                var restRot = new float[n][,];
                for (int i = 0; i < n; i++) restRot[i] = QM(data.rest[i * 7 + 3], data.rest[i * 7 + 4], data.rest[i * 7 + 5], data.rest[i * 7 + 6]);
                var restLocal = new Dictionary<Transform, (Vector3, Quaternion)>();
                foreach (var t in all) restLocal[t] = (t.localPosition, t.localRotation);
                var restU = new Quaternion[n];
                foreach (int i in used) restU[i] = Quaternion.Inverse(root.rotation) * map[data.bones[i]].rotation;
                // bones in parent-first order, cape excluded (CapeSpring owns it at runtime)
                var order = used.Where(i => !data.bones[i].StartsWith("Cape_")).OrderBy(i => Depth(map[data.bones[i]], root)).ToList();
                int hips = Array.IndexOf(data.bones, "Hips");
                var curves = new Dictionary<string, AnimationCurve[]>();
                var socket = map.ContainsKey("Socket_Weapon_R") ? map["Socket_Weapon_R"] : null; var grip = map.ContainsKey("Grip_L") ? map["Grip_L"] : null;
                report.maxLeftGripError = 0;
                for (int f = 0; f < data.frameCount; f++)
                {
                    foreach (var kv in restLocal) { kv.Key.localPosition = kv.Value.Item1; kv.Key.localRotation = kv.Value.Item2; }
                    foreach (int i in order)
                    {
                        int o = (f * n + i) * 7;
                        var pose = QM(data.frames[o + 3], data.frames[o + 4], data.frames[o + 5], data.frames[o + 6]);
                        var delta = Mul(pose, T(restRot[i]));
                        var du = Mul(Mul(Mx, delta), T(Mx));
                        var bone = map[data.bones[i]];
                        bone.rotation = root.rotation * (ToUnity(du) * restU[i]);
                        if (i == hips) bone.position = root.TransformPoint(MapP(new Vector3(data.frames[o], data.frames[o + 1], data.frames[o + 2])));
                    }
                    if (socket != null && grip != null)
                    {
                        // 왼손 파지 원점은 손잡이 축 위(socket.up 선)에 있어야 한다: 축에서 벗어난 거리 = 오차, 축 방향 거리는 프레임마다 같아야 한다
                        var d = grip.position - socket.position; float along = Vector3.Dot(d, socket.up);
                        float e = (d - socket.up * along).magnitude;
                        report.gripAlongMin = Mathf.Min(report.gripAlongMin, along); report.gripAlongMax = Mathf.Max(report.gripAlongMax, along);
                        if (e > report.maxLeftGripError) { report.maxLeftGripError = e; report.maxLeftGripErrorFrame = f; }
                    }
                    if (f == data.contact && socket != null) report.contactTipHeight = root.InverseTransformPoint(socket.position - socket.up * Exoduser.UnityPort.GreatswordKeyDirector.SocketToTip).y;
                    foreach (int i in order)
                    {
                        var bone = map[data.bones[i]]; string path = AnimationUtility.CalculateTransformPath(bone, root);
                        if (!curves.TryGetValue(path, out var c)) { c = new AnimationCurve[7]; for (int k = 0; k < 7; k++) c[k] = new AnimationCurve(); curves[path] = c; }
                        var q = bone.localRotation;
                        if (c[3].length > 0)
                        {
                            var prev = new Quaternion(c[0].keys[c[0].length - 1].value, c[1].keys[c[1].length - 1].value, c[2].keys[c[2].length - 1].value, c[3].keys[c[3].length - 1].value);
                            if (Quaternion.Dot(prev, q) < 0) q = new Quaternion(-q.x, -q.y, -q.z, -q.w);
                        }
                        float time = f / (float)data.fps;
                        c[0].AddKey(time, q.x); c[1].AddKey(time, q.y); c[2].AddKey(time, q.z); c[3].AddKey(time, q.w);
                        if (i == hips) { var p = bone.localPosition; c[4].AddKey(time, p.x); c[5].AddKey(time, p.y); c[6].AddKey(time, p.z); }
                    }
                }
                // runtime pose table (TextAsset). A generic AnimationClip cannot drive the bones of a humanoid Animator via SampleAnimation,
                // so the runtime writes these local transforms itself (NativeHeroMotion.ApplyKeyClip).
                var table = new KeyPoseTable { fps = data.fps, frames = data.frameCount, contactFrame = data.contact, hips = -1 };
                var paths = curves.Keys.ToList(); table.paths = paths.ToArray();
                table.rot = new float[data.frameCount * paths.Count * 4];
                for (int bi = 0; bi < paths.Count; bi++)
                {
                    var c = curves[paths[bi]];
                    if (c[4].length > 0) { table.hips = bi; table.hipsPos = new float[data.frameCount * 3]; }
                    for (int f = 0; f < data.frameCount; f++)
                    {
                        for (int k = 0; k < 4; k++) table.rot[(f * paths.Count + bi) * 4 + k] = c[k].keys[f].value;
                        if (c[4].length > 0) for (int k = 0; k < 3; k++) table.hipsPos[f * 3 + k] = c[4 + k].keys[f].value;
                    }
                }
                Directory.CreateDirectory(Path.GetDirectoryName(clipPath));
                File.WriteAllText(clipPath, JsonUtility.ToJson(table));
                AssetDatabase.ImportAsset(clipPath);
                report.bones = order.Count;
                report.passed = report.missingBones.All(b => b.EndsWith("_end") || b.Contains("front")) && report.restFitRmsMeters < .01f && report.maxLeftGripError < .003f && report.gripAlongMax - report.gripAlongMin < .003f;
            }
            finally { UnityEngine.Object.DestroyImmediate(inst); }
            File.WriteAllText(reportPath, JsonUtility.ToJson(report, true));
            Debug.Log("[GS-KEY] " + JsonUtility.ToJson(report));
            return report.passed ? 0 : 1;
        }
        // Probe: sample the saved clip the same way the runtime does and measure grip/tip (editor, no play mode)
        public static int Probe()
        {
            var args = Exoduser.DevTools.ExoArgs.Get();
            string tablePath = Arg(args, "-clip", "Assets/Exoduser/Resources/Characters/Warrior_GS_A1_pose.json");
            string outPath = Arg(args, "-report", "I:/EXODUSER-Storage/study/keyanim/unity/a1_probe.txt");
            var table = JsonUtility.FromJson<KeyPoseTable>(AssetDatabase.LoadAssetAtPath<TextAsset>(tablePath).text);
            var inst = (GameObject)UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(Prefab));
            var sb = new System.Text.StringBuilder();
            try
            {
                var animator = inst.GetComponent<Animator>() ?? inst.GetComponentInChildren<Animator>(true);
                var r = animator.transform; var all = r.GetComponentsInChildren<Transform>(true);
                Transform F(string n) => all.FirstOrDefault(t => t.name == n);
                var socket = F("Socket_Weapon_R"); var grip = F("Grip_L"); var hips = F("Hips");
                var bones = table.paths.Select(pth => r.Find(pth)).ToArray();
                sb.AppendLine("bones=" + bones.Length + " missing=" + bones.Count(x => x == null) + " frames=" + table.frames);
                foreach (int f in new[] { 0, 12, 23, 24, 25, 26, 30, 40, 56 })
                {
                    for (int i = 0; i < bones.Length; i++) { int o = (f * bones.Length + i) * 4; bones[i].localRotation = new Quaternion(table.rot[o], table.rot[o + 1], table.rot[o + 2], table.rot[o + 3]); }
                    if (table.hips >= 0) bones[table.hips].localPosition = new Vector3(table.hipsPos[f * 3], table.hipsPos[f * 3 + 1], table.hipsPos[f * 3 + 2]);
                    sb.AppendLine("f" + f + " gripAlong=" + Vector3.Dot(grip.position - socket.position, socket.up).ToString("F4") + " tipY=" + r.InverseTransformPoint(socket.position - socket.up * Exoduser.UnityPort.GreatswordKeyDirector.SocketToTip).y.ToString("F3") + " hipsY=" + r.InverseTransformPoint(hips.position).y.ToString("F3"));
                }
            }
            finally { UnityEngine.Object.DestroyImmediate(inst); }
            File.WriteAllText(outPath, sb.ToString());
            return 0;
        }
        static int Depth(Transform t, Transform root) { int d = 0; for (var p = t; p != null && p != root; p = p.parent) d++; return d; }
    }
}
