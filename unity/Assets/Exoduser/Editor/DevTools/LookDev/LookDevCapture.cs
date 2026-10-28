using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Debug = UnityEngine.Debug;
using Object = UnityEngine.Object;

// DT-03 LookDev 캡처 리그.
// 명령줄: Unity -batchmode -projectPath <proj> -executeMethod Exoduser.DevTools.LookDev.LookDevCapture.RunBatch
//          -shots <asset|폴더|builtin> -out <dir> [-override postExposure=1.85]... [-withBase 1] [-compare 1] [-only RM_Sandbox,RM1_Start] [-ref <png>] [-failOnWarn 1]
// 작업 서버: LookDevCapture.RunBatch(string[] args) 를 args 직접 넘겨 호출 (-exoJobServer 가 args 에 있으면 EditorApplication.Exit 를 부르지 않는다).
// 씬은 열기만 하고 저장하지 않는다. -override 값은 메모리에서만 적용하고(Volume 인스턴스 복사본) 에셋은 건드리지 않는다.
namespace Exoduser.DevTools.LookDev
{
    /// <summary>-override 로 넘기는 메모리 전용 덮어쓰기.</summary>
    public sealed class LookDevOverrides
    {
        public float? PostExposure;
        public string Tonemapping;           // ACES / Neutral / None
        public bool? CameraPostProcessing;

        public bool IsEmpty { get { return !PostExposure.HasValue && string.IsNullOrEmpty(Tonemapping) && !CameraPostProcessing.HasValue; } }

        public string Label
        {
            get
            {
                var l = new List<string>();
                if (PostExposure.HasValue) l.Add("postExposure=" + PostExposure.Value.ToString("0.###", CultureInfo.InvariantCulture));
                if (!string.IsNullOrEmpty(Tonemapping)) l.Add("tonemapping=" + Tonemapping);
                if (CameraPostProcessing.HasValue) l.Add("pp=" + (CameraPostProcessing.Value ? "1" : "0"));
                return string.Join(",", l.ToArray());
            }
        }

        public static LookDevOverrides Parse(IEnumerable<string> kvs)
        {
            var o = new LookDevOverrides();
            foreach (var kv in kvs)
            {
                int i = kv.IndexOf('='); if (i <= 0) continue; string k = kv.Substring(0, i).Trim().ToLowerInvariant(), v = kv.Substring(i + 1).Trim();
                if (k == "postexposure") o.PostExposure = float.Parse(v, CultureInfo.InvariantCulture);
                else if (k == "tonemapping") o.Tonemapping = v;
                else if (k == "pp" || k == "postprocessing") o.CameraPostProcessing = v == "1" || v.ToLowerInvariant() == "true";
            }
            return o;
        }
    }

    public sealed class LookDevRenderState
    {
        public string ColorSpace, UrpAsset, RendererHasPostProcessData, VolumeProfile, Tonemapping, HeadSha, UnityVersion, QualityLevel, Scene, Camera, PostExposureSource;
        public bool CameraPostProcessing;
        public double PostExposure = double.NaN;
    }

    public sealed class LookDevResult
    {
        public string Name, Variant, PngPath, JsonPath, ComparePath, Error;
        public LookDevRaw Raw;
        public LookDevRenderState State;
        public List<string> Warn = new List<string>();
        public Dictionary<string, double> Metrics = new Dictionary<string, double>();
        public bool Dark { get { return Warn.Contains("DARK"); } }
    }

    public static class LookDevCapture
    {
        const string DefaultOut = "I:/EXODUSER-Storage/devtools/dt03/out";

        // ================================================================== 진입점
        public static void RunBatch()
        {
            var args = Environment.GetCommandLineArgs();
            int code = RunBatch(args);
            if (Array.IndexOf(args, "-exoJobServer") < 0) EditorApplication.Exit(code);
        }

        public static int RunBatch(string[] args)
        {
            string Arg(string k, string d) { int i = Array.IndexOf(args, k); return i >= 0 && i + 1 < args.Length ? args[i + 1] : d; }
            var ovs = new List<string>(); for (int i = 0; i < args.Length - 1; i++) if (args[i] == "-override") ovs.Add(args[i + 1]);
            string shotsArg = Arg("-shots", "builtin"), outDir = Arg("-out", DefaultOut), only = Arg("-only", ""), refArg = Arg("-ref", "");
            bool withBase = Arg("-withBase", "0") == "1", failOnWarn = Arg("-failOnWarn", "0") == "1";
            bool compare = Arg("-compare", "1") == "1";
            Directory.CreateDirectory(outDir);
            var ov = LookDevOverrides.Parse(ovs); int errors = 0, warns = 0;
            var all = new List<LookDevResult>();
            try
            {
                var shots = LoadShots(shotsArg, only);
                if (shots.Count == 0) { Debug.LogError("[LOOKDEV] 샷 없음: " + shotsArg); return 2; }
                foreach (var shot in shots)
                {
                    var variants = new List<LookDevOverrides>();
                    if (ov.IsEmpty || withBase) variants.Add(new LookDevOverrides());
                    if (!ov.IsEmpty) variants.Add(ov);
                    foreach (var v in variants)
                    {
                        List<LookDevResult> rs;
                        try { rs = CaptureShot(shot, v, outDir, string.IsNullOrEmpty(refArg) ? null : refArg, compare); }
                        catch (Exception e)
                        {
                            Debug.LogError("[LOOKDEV] " + shot.shotName + " 실패: " + e);
                            rs = new List<LookDevResult> { new LookDevResult { Name = shot.shotName, Variant = v.IsEmpty ? "" : v.Label, Error = e.Message } };
                        }
                        foreach (var r in rs)
                        {
                            all.Add(r); if (r.Error != null) errors++; warns += r.Warn.Count;
                            double med; r.Metrics.TryGetValue("screen_median", out med);
                            Debug.Log("[LOOKDEV] " + r.Name + (string.IsNullOrEmpty(r.Variant) ? "" : " [" + r.Variant + "]") + " median=" + med.ToString("0.0", CultureInfo.InvariantCulture) + " warn=" + (r.Warn.Count == 0 ? "none" : string.Join(" | ", r.Warn.ToArray())) + (r.Error != null ? " ERROR=" + r.Error : ""));
                        }
                    }
                }
            }
            catch (Exception e) { Debug.LogError("[LOOKDEV] 치명적 오류: " + e); errors++; }
            WriteSummary(Path.Combine(outDir, "_summary.json"), all);
            Debug.Log("[LOOKDEV] 끝 shots=" + all.Count + " errors=" + errors + " warnings=" + warns + " out=" + outDir);
            return errors > 0 ? 1 : (failOnWarn && warns > 0 ? 3 : 0);
        }

        static List<LookDevShot> LoadShots(string arg, string only)
        {
            var list = new List<LookDevShot>();
            if (string.IsNullOrEmpty(arg) || arg == "builtin") { LookDevPresets.EnsureAssets(); arg = LookDevPresets.Dir; }
            if (AssetDatabase.IsValidFolder(arg))
            {
                foreach (var g in AssetDatabase.FindAssets("t:LookDevShot", new[] { arg }))
                { var s = AssetDatabase.LoadAssetAtPath<LookDevShot>(AssetDatabase.GUIDToAssetPath(g)); if (s != null) list.Add(s); }
                list.Sort((a, b) => string.CompareOrdinal(a.shotName, b.shotName));
            }
            else { var s = AssetDatabase.LoadAssetAtPath<LookDevShot>(arg); if (s != null) list.Add(s); }
            if (!string.IsNullOrEmpty(only))
            {
                var keep = new HashSet<string>(only.Split(',')); list.RemoveAll(s => !keep.Contains(s.shotName));
            }
            return list;
        }

        // ================================================================== 샷 캡처
        /// <summary>샷 한 개(방향이 여럿이면 여러 장)를 렌더하고 지표/경고를 계산한다. outDir 가 null 이면 파일을 쓰지 않는다.</summary>
        public static List<LookDevResult> CaptureShot(LookDevShot shot, LookDevOverrides ov, string outDir, string refOverride, bool compare)
        {
            EnsureScene(shot);
            var results = new List<LookDevResult>();
            using (var s = new Session(shot, ov))
            {
                int views = shot.cameraMode == LookDevCameraMode.TargetOrbit3 ? Math.Max(1, shot.orbitYawsDeg != null ? shot.orbitYawsDeg.Length : 1) : 1;
                for (int vi = 0; vi < views; vi++)
                {
                    string suffix = "";
                    if (shot.cameraMode == LookDevCameraMode.TargetOrbit3 && shot.orbitYawsDeg != null && shot.orbitYawsDeg.Length > 0)
                    {
                        float yaw = shot.orbitYawsDeg[vi]; suffix = vi == 0 && Mathf.Approximately(yaw, 0f) ? "_front" : (Mathf.Approximately(yaw, 90f) ? "_side" : (Mathf.Approximately(yaw, 180f) ? "_back" : "_yaw" + Mathf.RoundToInt(yaw)));
                    }
                    var r = new LookDevResult { Name = shot.shotName + suffix, Variant = ov.IsEmpty ? "" : ov.Label };
                    s.PlaceCamera(vi);
                    r.Raw = s.Render();
                    r.State = s.CollectState();
                    Analyze(shot, r);
                    string fileBase = r.Name + (ov.IsEmpty ? "" : "__ov-" + Sanitize(ov.Label));
                    if (outDir != null)
                    {
                        Directory.CreateDirectory(outDir);
                        r.PngPath = Path.Combine(outDir, fileBase + ".png"); r.JsonPath = Path.Combine(outDir, fileBase + ".json");
                        File.WriteAllBytes(r.PngPath, LookDevPngWriter.Encode(r.Raw));
                        File.WriteAllText(r.JsonPath, BuildJson(shot, r, ov, s));
                        string refPath = !string.IsNullOrEmpty(refOverride) ? refOverride : shot.referenceImage;
                        if (compare && !string.IsNullOrEmpty(refPath) && File.Exists(refPath) && vi == 0)
                        {
                            LookDevCompare.SideMetrics rm, um;
                            var sheet = LookDevCompare.Build(LookDevPng.Load(refPath), r.Raw, shot.cropA, shot.cropB, out rm, out um);
                            r.ComparePath = Path.Combine(outDir, fileBase + "_compare.png"); File.WriteAllBytes(r.ComparePath, LookDevPngWriter.Encode(sheet));
                            File.WriteAllText(Path.Combine(outDir, fileBase + "_compare.json"), "{\n  \"reference\": \"" + Esc(refPath) + "\",\n  \"unity\": \"" + Esc(r.PngPath) + "\",\n  \"reference_median\": " + Num(rm.Median) + ", \"reference_sat5_percent\": " + Num(rm.Sat5Percent) + ", \"reference_hue30_deg\": " + Num(rm.Hue30)
                                + ",\n  \"unity_median\": " + Num(um.Median) + ", \"unity_sat5_percent\": " + Num(um.Sat5Percent) + ", \"unity_hue30_deg\": " + Num(um.Hue30) + "\n}\n");
                        }
                    }
                    results.Add(r);
                }
            }
            return results;
        }

        static string Sanitize(string s) { var sb = new StringBuilder(); foreach (char c in s) sb.Append(char.IsLetterOrDigit(c) || c == '.' || c == '-' ? c : (c == '=' ? '-' : '_')); return sb.ToString(); }

        static void EnsureScene(LookDevShot shot)
        {
            if (string.IsNullOrEmpty(shot.scenePath)) return;
            var active = EditorSceneManager.GetActiveScene();
            if (string.Equals(active.path, shot.scenePath, StringComparison.OrdinalIgnoreCase)) return;
            if (!File.Exists(shot.scenePath)) throw new FileNotFoundException("씬 없음: " + shot.scenePath);
            if (!Application.isBatchMode && !EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) throw new OperationCanceledException("씬 전환 취소");
            EditorSceneManager.OpenScene(shot.scenePath, OpenSceneMode.Single);   // 열기만 한다. 저장하지 않는다.
        }

        // ================================================================== 세션 (씬 변경을 모두 되돌린다)
        public sealed class Session : IDisposable
        {
            readonly LookDevShot shot; readonly LookDevOverrides ov;
            readonly List<Action> undo = new List<Action>(); readonly List<GameObject> created = new List<GameObject>();
            public Camera Cam; Vector3 target; Terrain terrain; bool overridden;
            public string TargetDescription = "";

            public Session(LookDevShot shot, LookDevOverrides ov)
            {
                this.shot = shot; this.ov = ov; terrain = Object.FindAnyObjectByType<Terrain>();
                Cam = Camera.main; if (Cam == null) Cam = Object.FindAnyObjectByType<Camera>();
                if (Cam == null) { var g = new GameObject("LookDev Camera"); created.Add(g); Cam = g.AddComponent<Camera>(); g.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing = true; }
                var cam = Cam; var tr = cam.transform; var pos = tr.position; var rot = tr.rotation; bool ortho = cam.orthographic; float fov = cam.fieldOfView, os = cam.orthographicSize, nc = cam.nearClipPlane, fc = cam.farClipPlane; var tt = cam.targetTexture;
                undo.Add(() => { if (!cam) return; cam.transform.SetPositionAndRotation(pos, rot); cam.orthographic = ortho; cam.fieldOfView = fov; cam.orthographicSize = os; cam.nearClipPlane = nc; cam.farClipPlane = fc; cam.targetTexture = tt; });
                // Cinemachine Brain 이 카메라 자세를 덮어쓰지 않게 잠시 끈다 (타입 의존 없이 이름으로 찾음)
                Behaviour brain = null; foreach (var b in cam.GetComponents<Behaviour>()) if (b != null && b.GetType().Name == "CinemachineBrain") brain = b;
                if (brain != null && brain.enabled) { brain.enabled = false; undo.Add(() => { if (brain) brain.enabled = true; }); }
                // 카메라 아래 전경 카드(FG)는 게임 카메라 컷에서만 보이게 한다 (탑뷰·공전 컷에서는 카메라 바로 앞에 걸려 화면을 가린다)
                var fg = cam.transform.Find("Foreground Cards");
                if (fg != null && shot.cameraMode != LookDevCameraMode.GameLook001) { bool was = fg.gameObject.activeSelf; fg.gameObject.SetActive(false); undo.Add(() => { if (fg) fg.gameObject.SetActive(was); }); }
                try { ResolveTarget();
                PlaceMarkerAndCapsule();
                ApplyOverrides(); }
                catch (Exception) { Dispose(); throw; }
            }

            float Ground(float x, float z, LookDevGround mode)
            {
                if (mode == LookDevGround.RuntimeZero || terrain == null) return 0f;
                return terrain.SampleHeight(new Vector3(x, 0f, z)) + terrain.transform.position.y;
            }

            void ResolveTarget()
            {
                GameObject go = string.IsNullOrEmpty(shot.targetObject) ? null : GameObject.Find(shot.targetObject);
                Vector2 xz;
                if (go != null) { target = go.transform.position; TargetDescription = "object:" + shot.targetObject; }
                else if (shot.TryGetPoint(shot.targetPoint, out xz)) { target = new Vector3(xz.x, Ground(xz.x, xz.y, shot.cameraGround), xz.y); TargetDescription = "point:" + shot.targetPoint + " ground=" + shot.cameraGround; }
                else { target = shot.targetPos; TargetDescription = "pos"; }
            }

            void PlaceMarkerAndCapsule()
            {
                // RM1 의 "Player Marker"(카메라가 따라가는 대상)를 대상 지점으로 옮겨 마커 스프라이트가 같은 자리에 보이게 한다 (게임 카메라 컷)
                var marker = GameObject.Find("Player Marker");
                if (marker != null && shot.cameraMode == LookDevCameraMode.GameLook001)
                { var mp = marker.transform.position; marker.transform.position = target; undo.Add(() => { if (marker) marker.transform.position = mp; }); }
                if (!shot.capsule) return;
                var ms = GameObject.Find("Marker Sprite"); if (ms != null) { ms.SetActive(false); undo.Add(() => { if (ms) ms.SetActive(true); }); }
                float gy = Ground(target.x, target.z, shot.capsuleGround);
                var cap = GameObject.CreatePrimitive(PrimitiveType.Capsule); cap.name = "LookDev Capsule"; created.Add(cap);
                Object.DestroyImmediate(cap.GetComponent<Collider>());
                cap.transform.localScale = new Vector3(0.5f, 0.8f, 0.5f); cap.transform.position = new Vector3(target.x, gy + 0.8f, target.z);
                var m = new Material(Shader.Find("Universal Render Pipeline/Lit")); m.SetColor("_BaseColor", new Color(.25f, .85f, .95f)); cap.GetComponent<MeshRenderer>().sharedMaterial = m;
                TargetDescription += " capsuleY=" + gy.ToString("0.###", CultureInfo.InvariantCulture) + "(" + shot.capsuleGround + ")";
            }

            void ApplyOverrides()
            {
                if (ov == null || ov.IsEmpty) return;
                if (ov.CameraPostProcessing.HasValue)
                {
                    var d = Cam.GetComponent<UniversalAdditionalCameraData>();
                    if (d != null) { bool was = d.renderPostProcessing; d.renderPostProcessing = ov.CameraPostProcessing.Value; undo.Add(() => { if (d) d.renderPostProcessing = was; }); }
                }
                if (!ov.PostExposure.HasValue && string.IsNullOrEmpty(ov.Tonemapping)) return;
                foreach (var v in Object.FindObjectsByType<Volume>())
                {
                    if (v.sharedProfile == null) continue;
                    var prof = v.profile;   // sharedProfile 의 메모리 복사본 — 에셋은 바뀌지 않는다
                    overridden = true; var vol = v; undo.Add(() => { if (vol) vol.profile = null; });
                    if (ov.PostExposure.HasValue)
                    {
                        ColorAdjustments ca; if (!prof.TryGet(out ca)) ca = prof.Add<ColorAdjustments>(true);
                        ca.postExposure.Override(ov.PostExposure.Value);
                    }
                    if (!string.IsNullOrEmpty(ov.Tonemapping))
                    {
                        Tonemapping tm; if (!prof.TryGet(out tm)) tm = prof.Add<Tonemapping>(true);
                        TonemappingMode mode; if (Enum.TryParse(ov.Tonemapping, true, out mode)) tm.mode.Override(mode);
                    }
                }
            }

            public void PlaceCamera(int view)
            {
                var cam = Cam; var t = cam.transform; float H = shot.resolution.y;
                if (shot.nearClip > 0f) cam.nearClipPlane = shot.nearClip;
                if (shot.farClip > 0f) cam.farClipPlane = shot.farClip;
                switch (shot.cameraMode)
                {
                    case LookDevCameraMode.GameLook001:
                        {
                            var off = new Vector3(0f, Mathf.Sin(shot.pitchRad), -Mathf.Cos(shot.pitchRad)) * shot.distanceU;
                            cam.orthographic = false; cam.fieldOfView = 2f * Mathf.Atan(H / (2f * shot.viewDistancePx)) * Mathf.Rad2Deg;
                            t.SetPositionAndRotation(target + off, Quaternion.Euler(shot.pitchRad * Mathf.Rad2Deg, 0f, 0f)); break;
                        }
                    case LookDevCameraMode.TopOrtho:
                        cam.orthographic = true; cam.orthographicSize = shot.orthoSize;
                        t.SetPositionAndRotation(new Vector3(shot.orthoCenterXZ.x, shot.orthoHeight, shot.orthoCenterXZ.y), Quaternion.Euler(90f, 0f, 0f)); break;
                    case LookDevCameraMode.ExplicitPose:
                        cam.orthographic = shot.explicitOrthographic; if (shot.explicitOrthographic) cam.orthographicSize = shot.explicitOrthoSize; else cam.fieldOfView = shot.explicitFov;
                        t.SetPositionAndRotation(shot.position, Quaternion.Euler(shot.euler)); break;
                    case LookDevCameraMode.TargetOrbit3:
                        {
                            float yaw = shot.orbitYawsDeg != null && view < shot.orbitYawsDeg.Length ? shot.orbitYawsDeg[view] : 0f; float p = shot.orbitPitchDeg * Mathf.Deg2Rad;
                            var off = Quaternion.Euler(0f, yaw, 0f) * new Vector3(0f, Mathf.Sin(p), -Mathf.Cos(p)) * shot.orbitDistance;
                            var look = target + Vector3.up * shot.orbitTargetHeight;
                            cam.orthographic = false; cam.fieldOfView = shot.orbitFov; t.position = look + off; t.rotation = Quaternion.LookRotation(look - t.position, Vector3.up); break;
                        }
                }
            }

            public LookDevRaw Render()
            {
                int w = shot.resolution.x, h = shot.resolution.y; var rt = new RenderTexture(w, h, 24, RenderTextureFormat.ARGB32) { antiAliasing = Mathf.Max(1, shot.msaa) }; rt.Create();
                var prevActive = RenderTexture.active; var prevTarget = Cam.targetTexture;
                try
                {
                    Cam.targetTexture = rt;
                    for (int i = 0; i < shot.warmupRenders; i++) Cam.Render();
                    Cam.Render();
                    RenderTexture.active = rt;
                    var tex = new Texture2D(w, h, TextureFormat.RGB24, false); tex.ReadPixels(new Rect(0, 0, w, h), 0, 0); tex.Apply();
                    var raw = LookDevMetrics.FromTexture(tex); Object.DestroyImmediate(tex); return raw;
                }
                finally { RenderTexture.active = prevActive; Cam.targetTexture = prevTarget; rt.Release(); Object.DestroyImmediate(rt); }
            }

            public LookDevRenderState CollectState() { return LookDevState.Collect(Cam, overridden || (ov != null && ov.CameraPostProcessing.HasValue)); }

            public void Dispose()
            {
                for (int i = undo.Count - 1; i >= 0; i--) { try { undo[i](); } catch (Exception e) { Debug.LogWarning("[LOOKDEV] 복원 실패: " + e.Message); } }
                foreach (var g in created) if (g) Object.DestroyImmediate(g);
                undo.Clear(); created.Clear();
            }
        }

        // ================================================================== 분석
        static void Analyze(LookDevShot shot, LookDevResult r)
        {
            var img = r.Raw; var m = r.Metrics; int n; double ml;
            m["screen_median"] = LookDevMetricsCore.ScreenMedian(img);
            m["screen_top5_sat"] = LookDevMetricsCore.TopLumaSat(img, null, 0.95, out n);
            m["screen_top30_hue_deg"] = LookDevMetricsCore.TopLumaHue(img, null, 0.70, out ml, out n);
            var lumas = new List<double>(); int pi = 0;
            foreach (var p in shot.patches)
            {
                var rc = LookDevMetricsCore.FracPatch(img.Width, img.Height, p.fx, p.fy, p.w, p.h);
                var pr = LookDevMetricsCore.Patch(img, p.name, rc);
                string key = "sandbox_floor_";
                m[key + "luma[" + pi + "]"] = pr.LumaMedian; m[key + "RG[" + pi + "]"] = pr.RG; m[key + "B_le_G[" + pi + "]"] = pr.BLeG ? 1 : 0;
                m["patch." + p.name + ".luma"] = pr.LumaMedian; m["patch." + p.name + ".rg"] = pr.RG;
                lumas.Add(pr.LumaMedian); pi++;
            }
            if (lumas.Count > 0) m["sandbox_floor_luma_median"] = LookDevMetricsCore.Median(lumas);

            // ---- 경고
            if (m["screen_median"] < shot.darkMedianThreshold) r.Warn.Add("DARK");
            var s = r.State;
            if (!string.IsNullOrEmpty(shot.expectColorSpace) && !string.Equals(s.ColorSpace, shot.expectColorSpace, StringComparison.OrdinalIgnoreCase)) r.Warn.Add("STATE colorSpace=" + s.ColorSpace + " (expected " + shot.expectColorSpace + ")");
            if (shot.expectCameraPostProcessing && !s.CameraPostProcessing) r.Warn.Add("STATE cameraPostProcessing=false (expected true)");
            if (shot.expectRendererPostProcessData && s.RendererHasPostProcessData == "false") r.Warn.Add("STATE rendererHasPostProcessData=false (expected true)");
            if (shot.checkPostExposure && (double.IsNaN(s.PostExposure) || Math.Abs(s.PostExposure - shot.expectPostExposure) > 0.001)) r.Warn.Add("STATE postExposure=" + Num(s.PostExposure) + " (expected " + Num(shot.expectPostExposure) + ")");
            if (!string.IsNullOrEmpty(shot.expectTonemapping) && !string.Equals(s.Tonemapping, shot.expectTonemapping, StringComparison.OrdinalIgnoreCase)) r.Warn.Add("STATE tonemapping=" + s.Tonemapping + " (expected " + shot.expectTonemapping + ")");
            foreach (var b in shot.baselines)
            {
                double v; if (!m.TryGetValue(b.metric, out v)) { r.Warn.Add("BASELINE metric 없음: " + b.metric); continue; }
                if (Math.Abs(v - b.value) > b.tolerance) r.Warn.Add("BASELINE " + b.metric + "=" + v.ToString("0.###", CultureInfo.InvariantCulture) + " (baseline " + b.value.ToString("0.###", CultureInfo.InvariantCulture) + " +-" + b.tolerance.ToString("0.###", CultureInfo.InvariantCulture) + ")");
            }
        }

        // ================================================================== JSON
        static string Esc(string s) { return (s ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n"); }
        static string Num(double v) { return double.IsNaN(v) || double.IsInfinity(v) ? "null" : v.ToString("R", CultureInfo.InvariantCulture); }

        static string BuildJson(LookDevShot shot, LookDevResult r, LookDevOverrides ov, Session s)
        {
            var sb = new StringBuilder(); var st = r.State;
            sb.Append("{\n");
            sb.Append("  \"name\": \"" + Esc(r.Name) + "\",\n  \"variant\": \"" + Esc(r.Variant) + "\",\n  \"scene\": \"" + Esc(shot.scenePath) + "\",\n");
            sb.Append("  \"image\": \"" + Esc(Path.GetFileName(r.PngPath)) + "\",\n  \"resolution\": [" + r.Raw.Width + ", " + r.Raw.Height + "],\n  \"msaa\": " + shot.msaa + ",\n");
            sb.Append("  \"camera\": { \"mode\": \"" + shot.cameraMode + "\", \"target\": \"" + Esc(s.TargetDescription) + "\", \"fov\": " + Num(s.Cam.fieldOfView) + ", \"orthographic\": " + (s.Cam.orthographic ? "true" : "false") + ", \"orthoSize\": " + Num(s.Cam.orthographicSize)
                + ", \"position\": [" + Num(s.Cam.transform.position.x) + ", " + Num(s.Cam.transform.position.y) + ", " + Num(s.Cam.transform.position.z) + "], \"euler\": [" + Num(s.Cam.transform.eulerAngles.x) + ", " + Num(s.Cam.transform.eulerAngles.y) + ", " + Num(s.Cam.transform.eulerAngles.z) + "] },\n");
            sb.Append("  \"overrides\": \"" + Esc(ov.IsEmpty ? "none" : ov.Label) + "\",\n");
            sb.Append("  \"metrics\": {\n");
            sb.Append("    \"screen_median\": " + Num(r.Metrics["screen_median"]) + ",\n    \"screen_top5_sat\": " + Num(r.Metrics["screen_top5_sat"]) + ",\n    \"screen_top30_hue_deg\": " + Num(r.Metrics["screen_top30_hue_deg"]) + ",\n");
            sb.Append("    \"histogram32\": [" + string.Join(", ", Array.ConvertAll(LookDevMetricsCore.Histogram32(r.Raw), x => x.ToString())) + "],\n");
            sb.Append("    \"patches\": [");
            for (int i = 0; i < shot.patches.Count; i++)
            {
                var p = shot.patches[i]; var rc = LookDevMetricsCore.FracPatch(r.Raw.Width, r.Raw.Height, p.fx, p.fy, p.w, p.h); var pr = LookDevMetricsCore.Patch(r.Raw, p.name, rc);
                int cnt; double ml; var sel = new bool[r.Raw.Width * r.Raw.Height];
                for (int y = Math.Max(0, rc.Y); y < Math.Min(r.Raw.Height, rc.Y + rc.H); y++) for (int x = Math.Max(0, rc.X); x < Math.Min(r.Raw.Width, rc.X + rc.W); x++) sel[y * r.Raw.Width + x] = true;
                double sat5 = LookDevMetricsCore.TopLumaSat(r.Raw, sel, 0.95, out cnt), hue30 = LookDevMetricsCore.TopLumaHue(r.Raw, sel, 0.70, out ml, out cnt);
                sb.Append(i == 0 ? "\n" : ",\n");
                sb.Append("      { \"name\": \"" + Esc(p.name) + "\", \"rect\": [" + rc.X + ", " + rc.Y + ", " + rc.W + ", " + rc.H + "], \"luma_median\": " + Num(pr.LumaMedian) + ", \"rg\": " + Num(pr.RG) + ", \"b_le_g\": " + (pr.BLeG ? "true" : "false")
                    + ", \"med_rgb\": [" + Num(pr.MedR) + ", " + Num(pr.MedG) + ", " + Num(pr.MedB) + "], \"top5_sat\": " + Num(sat5) + ", \"top30_hue_deg\": " + Num(hue30) + " }");
            }
            sb.Append(shot.patches.Count > 0 ? "\n    ],\n" : "],\n");
            double fl; sb.Append("    \"sandbox_floor_luma_median\": " + Num(r.Metrics.TryGetValue("sandbox_floor_luma_median", out fl) ? fl : double.NaN) + "\n  },\n");
            sb.Append("  \"baseline_compare\": [");
            for (int i = 0; i < shot.baselines.Count; i++)
            {
                var b = shot.baselines[i]; double v = double.NaN; r.Metrics.TryGetValue(b.metric, out v); double d = v - b.value;
                sb.Append(i == 0 ? "\n" : ",\n");
                sb.Append("    { \"metric\": \"" + Esc(b.metric) + "\", \"value\": " + Num(v) + ", \"baseline\": " + Num(b.value) + ", \"delta\": " + Num(d) + ", \"tolerance\": " + Num(b.tolerance) + ", \"ok\": " + (Math.Abs(d) <= b.tolerance ? "true" : "false") + ", \"note\": \"" + Esc(b.note) + "\" }");
            }
            sb.Append(shot.baselines.Count > 0 ? "\n  ],\n" : "],\n");
            sb.Append("  \"warn\": [" + string.Join(", ", r.Warn.ConvertAll(w => "\"" + Esc(w) + "\"").ToArray()) + "],\n");
            sb.Append("  \"renderState\": {\n");
            sb.Append("    \"colorSpace\": \"" + st.ColorSpace + "\", \"urpAsset\": \"" + Esc(st.UrpAsset) + "\", \"rendererHasPostProcessData\": \"" + st.RendererHasPostProcessData + "\", \"cameraPostProcessing\": " + (st.CameraPostProcessing ? "true" : "false") + ",\n");
            sb.Append("    \"volumeProfile\": \"" + Esc(st.VolumeProfile) + "\", \"postExposure\": " + Num(st.PostExposure) + ", \"postExposureSource\": \"" + st.PostExposureSource + "\", \"tonemapping\": \"" + st.Tonemapping + "\",\n");
            sb.Append("    \"headSha\": \"" + st.HeadSha + "\", \"unityVersion\": \"" + st.UnityVersion + "\", \"qualityLevel\": \"" + Esc(st.QualityLevel) + "\", \"camera\": \"" + Esc(st.Camera) + "\"\n  },\n");
            sb.Append("  \"expected\": { \"colorSpace\": \"" + shot.expectColorSpace + "\", \"cameraPostProcessing\": " + (shot.expectCameraPostProcessing ? "true" : "false") + ", \"rendererHasPostProcessData\": " + (shot.expectRendererPostProcessData ? "true" : "false")
                + ", \"postExposure\": " + (shot.checkPostExposure ? Num(shot.expectPostExposure) : "null") + ", \"tonemapping\": \"" + shot.expectTonemapping + "\", \"darkMedianThreshold\": " + Num(shot.darkMedianThreshold) + " }\n");
            sb.Append("}\n");
            return sb.ToString();
        }

        static void WriteSummary(string path, List<LookDevResult> all)
        {
            var sb = new StringBuilder("{\n  \"shots\": [");
            for (int i = 0; i < all.Count; i++)
            {
                var r = all[i]; double med = double.NaN; r.Metrics.TryGetValue("screen_median", out med);
                sb.Append(i == 0 ? "\n" : ",\n");
                sb.Append("    { \"name\": \"" + Esc(r.Name) + "\", \"variant\": \"" + Esc(r.Variant) + "\", \"png\": \"" + Esc(r.PngPath) + "\", \"json\": \"" + Esc(r.JsonPath) + "\", \"compare\": \"" + Esc(r.ComparePath) + "\", \"screen_median\": " + Num(med)
                    + ", \"dark\": " + (r.Dark ? "true" : "false") + ", \"warn\": [" + string.Join(", ", r.Warn.ConvertAll(w => "\"" + Esc(w) + "\"").ToArray()) + "], \"error\": \"" + Esc(r.Error) + "\" }");
            }
            sb.Append(all.Count > 0 ? "\n  ]\n}\n" : "]\n}\n");
            File.WriteAllText(path, sb.ToString());
        }
    }

    // ====================================================================== 렌더 상태 수집
    public static class LookDevState
    {
        static string headSha;

        public static string HeadSha()
        {
            if (headSha != null) return headSha;
            try
            {
                var psi = new ProcessStartInfo("git", "rev-parse HEAD") { WorkingDirectory = Path.GetDirectoryName(Application.dataPath), RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false, CreateNoWindow = true };
                using (var p = Process.Start(psi)) { string o = p.StandardOutput.ReadToEnd().Trim(); if (!p.WaitForExit(5000)) { try { p.Kill(); } catch { } } headSha = o.Length >= 7 ? o : "unknown"; }
            }
            catch (Exception) { headSha = "unknown"; }
            return headSha;
        }

        /// <summary>렌더러가 후처리 데이터를 갖는가: URP 에셋의 기본 렌더러 데이터의 postProcessData 참조 (SerializedObject 로 읽어 타입 의존 없음).</summary>
        public static string RendererPostProcessData(RenderPipelineAsset rp)
        {
            var urp = rp as UniversalRenderPipelineAsset; if (urp == null) return "n/a";
            try
            {
                var so = new SerializedObject(urp); var list = so.FindProperty("m_RendererDataList"); var di = so.FindProperty("m_DefaultRendererIndex");
                int idx = di != null ? di.intValue : 0; if (list == null || idx < 0 || idx >= list.arraySize) return "unknown";
                var rd = list.GetArrayElementAtIndex(idx).objectReferenceValue; if (rd == null) return "unknown";
                var pp = new SerializedObject(rd).FindProperty("postProcessData"); if (pp == null) return "unknown";
                return pp.objectReferenceValue != null ? "true" : "false";
            }
            catch (Exception) { return "unknown"; }
        }

        public static LookDevRenderState Collect(Camera cam, bool useInstantiatedProfiles)
        {
            var s = new LookDevRenderState();
            s.ColorSpace = QualitySettings.activeColorSpace.ToString();
            var rp = GraphicsSettings.currentRenderPipeline; s.UrpAsset = rp != null ? rp.name : "none(built-in)";
            s.RendererHasPostProcessData = RendererPostProcessData(rp);
            var cd = cam != null ? cam.GetComponent<UniversalAdditionalCameraData>() : null; s.CameraPostProcessing = cd != null && cd.renderPostProcessing;
            s.Camera = cam != null ? cam.name : "none";
            var vols = new List<Volume>(Object.FindObjectsByType<Volume>()); vols.RemoveAll(v => !v.enabled || !v.gameObject.activeInHierarchy);
            vols.Sort((a, b) => a.priority.CompareTo(b.priority));
            var names = new List<string>(); s.Tonemapping = "none"; s.PostExposureSource = "none";
            foreach (var v in vols)
            {
                if (v.sharedProfile == null) continue; names.Add(v.sharedProfile.name);
                var prof = useInstantiatedProfiles && v.HasInstantiatedProfile() ? v.profile : v.sharedProfile;
                ColorAdjustments ca; if (prof.TryGet(out ca) && ca.active && ca.postExposure.overrideState) { s.PostExposure = ca.postExposure.value; s.PostExposureSource = useInstantiatedProfiles && v.HasInstantiatedProfile() ? "override(memory)" : "asset"; }
                Tonemapping tm; if (prof.TryGet(out tm) && tm.active && tm.mode.overrideState) s.Tonemapping = tm.mode.value.ToString();
            }
            s.VolumeProfile = names.Count > 0 ? string.Join("+", names.ToArray()) : "none";
            s.HeadSha = HeadSha(); s.UnityVersion = Application.unityVersion;
            int q = QualitySettings.GetQualityLevel(); s.QualityLevel = q + ":" + (q >= 0 && q < QualitySettings.names.Length ? QualitySettings.names[q] : "?");
            s.Scene = EditorSceneManager.GetActiveScene().path;
            return s;
        }
    }
}
