using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// UCH-02b R2: two lighting sets (RM-0 sandbox lighting / judging key+rim), per-frame grounding, material A/B, pelvis-following game view.
// `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.IvanCaptureR2.Run -outdir <dir> -quit` (no -nographics)
namespace Exoduser.CharacterLab
{
    public static class IvanCaptureR2
    {
        const int W = 1920, H = 1080;
        const float Height = 1.85f;
        static Camera cam; static UniversalAdditionalCameraData camData;
        static RenderTexture rt;
        static GameObject chr; static Animator anim; static SkinnedMeshRenderer[] smrs;
        static Transform head, headFront, hips;
        static Vector3 face = Vector3.forward;
        static string outDir;
        static GameObject sunGo, rimGo, volGo;
        static Material matA, matB;

        static Color Hex(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }
        static Transform Find(string n) { return chr.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == n); }

        public static void Run()
        {
            var args = System.Environment.GetCommandLineArgs();
            int oi = System.Array.IndexOf(args, "-outdir");
            outDir = oi >= 0 ? args[oi + 1] : "capture_r2";
            Directory.CreateDirectory(outDir);

            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            RenderSettings.skybox = null;
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name = "Floor";
            Object.DestroyImmediate(floor.GetComponent<Collider>());
            floor.transform.localScale = new Vector3(8, 1, 8);
            var fm = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            fm.SetColor("_BaseColor", Hex("#3a2a24")); fm.SetFloat("_Smoothness", 0f); fm.SetFloat("_Metallic", 0f);
            floor.GetComponent<MeshRenderer>().sharedMaterial = fm;

            rt = new RenderTexture(W, H, 24, RenderTextureFormat.ARGB32) { antiAliasing = 4 }; rt.Create();
            var cg = new GameObject("Cam"); cam = cg.AddComponent<Camera>();
            camData = cg.AddComponent<UniversalAdditionalCameraData>();
            cam.clearFlags = CameraClearFlags.SolidColor; cam.allowMSAA = true; cam.farClipPlane = 200f; cam.nearClipPlane = 0.1f; cam.targetTexture = rt;

            matA = AssetDatabase.LoadAssetAtPath<Material>(IvanImport.MatPath);
            matB = BuildMaterialB();

            ResetChar();
            face = Vector3.forward;
            if (head && headFront) { var d = headFront.position - head.position; d.y = 0; if (d.magnitude > 1e-4f) face = d.normalized; }
            Debug.Log("[R2] facing " + face);

            foreach (var set in new[] { "rm0", "key" })
            {
                ConfigureSet(set);
                var dir = Path.Combine(outDir, set); Directory.CreateDirectory(dir);
                foreach (var pose in new[] { "bind", "walk50" })
                {
                    ResetChar();
                    if (pose == "walk50") Pose(0.5f);
                    Ground(pose);
                    var f = face;
                    var t1 = CloseShot(dir, pose + "_front_close.png", f);
                    FaceCrop(t1, Path.Combine(dir, pose + "_crop_face_front.png"));
                    CloseShot(dir, pose + "_34_close.png", Quaternion.AngleAxis(40f, Vector3.up) * f);
                    var t3 = CloseShot(dir, pose + "_back_close.png", -f);
                    CapeCrop(t3, Path.Combine(dir, pose + "_crop_cape_back.png"));
                }
                MaterialAB(dir);
                GameGrid(dir);
            }
            Debug.Log("[R2] done " + outDir);
        }

        // ---- character
        static void ResetChar()
        {
            if (chr) Object.DestroyImmediate(chr);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(IvanImport.PrefabPath);
            chr = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            chr.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
            anim = chr.GetComponent<Animator>();
            smrs = chr.GetComponentsInChildren<SkinnedMeshRenderer>();
            foreach (var s in smrs) { s.forceMatrixRecalculationPerRender = true; s.updateWhenOffscreen = true; }
            head = Find("Head"); headFront = Find("headfront"); hips = Find("Hips");
            // the Animator of a fresh instance only starts evaluating after the first render
            if (cam != null) { cam.fieldOfView = 30f; cam.transform.position = new Vector3(0, 1.2f, 7f); cam.transform.rotation = Quaternion.LookRotation(new Vector3(0, 0.9f, 0) - cam.transform.position); RenderOnly(); }
        }

        static void Pose(float norm)
        {
            // a freshly instantiated Animator ignores its first evaluation in edit mode; evaluate twice
            for (int k = 0; k < 2; k++) { anim.Rebind(); anim.speed = 1f; anim.Play("Walk", 0, norm); anim.Update(0f); }
            Debug.Log($"[R2] pose {norm}: hipsY={hips.position.y:F3} LF={Find("LeftFoot").position.ToString("F3")} RF={Find("RightFoot").position.ToString("F3")}");
        }

        // frame-accurate grounding: lowest skinned-mesh point (renderer bounds, updated per render) -> y=0
        static void Ground(string tag)
        {
            chr.transform.position = Vector3.zero;
            cam.fieldOfView = 30f; cam.transform.position = new Vector3(0, 1.2f, 7f); cam.transform.rotation = Quaternion.LookRotation(new Vector3(0, 0.9f, 0) - cam.transform.position);
            RenderOnly();
            float minY = MinY();
            chr.transform.position = new Vector3(0, -minY, 0);
            RenderOnly();
            Debug.Log($"[R2] ground {tag}: bakeMinY before={minY:F4} after={MinY():F4} boundsMinY after={BoundsMinY():F4} hipsY={hips.position.y:F3}");
        }

        static float BakeMinY()
        {
            float lo = float.MaxValue;
            foreach (var s in smrs)
            {
                var m = new Mesh(); s.BakeMesh(m, false);
                var l2w = Matrix4x4.TRS(s.transform.position, s.transform.rotation, Vector3.one); var sc = s.transform.lossyScale;
                foreach (var v in m.vertices) lo = Mathf.Min(lo, l2w.MultiplyPoint3x4(Vector3.Scale(v, sc)).y);
                Object.DestroyImmediate(m);
            }
            return lo;
        }
        static float MinY() { return BakeMinY(); }
        static float BoundsMinY() { return smrs.Min(s => s.bounds.min.y); }

        // ---- sets
        static void ConfigureSet(string set)
        {
            if (sunGo) Object.DestroyImmediate(sunGo); if (rimGo) Object.DestroyImmediate(rimGo); if (volGo) Object.DestroyImmediate(volGo);
            sunGo = new GameObject("Sun"); var sun = sunGo.AddComponent<Light>(); sun.type = LightType.Directional; sun.shadows = LightShadows.Soft;
            // light direction is defined in the character-front frame (yaw -35 from the front-facing camera axis) so the face is lit.
            var baseRot = Quaternion.LookRotation(-face, Vector3.up);
            if (set == "rm0")
            {
                // RM-0 sandbox (Rm0EngineSetup.BuildSandbox): Hell Sun (1,.62,.5) x1.1, Euler(52,-35,0), GlobalVolume_Hell, scene default trilight ambient, bg (.015,.02,.018)
                sun.color = new Color(1f, .62f, .5f); sun.intensity = 1.1f;
                sunGo.transform.rotation = baseRot * Quaternion.Euler(52f, -35f, 0f);
                RenderSettings.ambientMode = AmbientMode.Trilight;
                RenderSettings.ambientSkyColor = new Color(0.212f, 0.227f, 0.259f);
                RenderSettings.ambientEquatorColor = new Color(0.114f, 0.125f, 0.133f);
                RenderSettings.ambientGroundColor = new Color(0.047f, 0.043f, 0.035f);
                cam.backgroundColor = new Color(.015f, .02f, .018f);
                volGo = new GameObject("Global Volume"); var v = volGo.AddComponent<Volume>(); v.isGlobal = true;
                v.sharedProfile = AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Exoduser/Rendering/GlobalVolume_Hell.asset");
                camData.renderPostProcessing = true;
            }
            else
            {
                sun.color = Hex("#d9d0c4"); sun.intensity = 1.1f;
                sunGo.transform.rotation = baseRot * Quaternion.Euler(50f, -35f, 0f);
                RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = Hex("#2a2224");
                cam.backgroundColor = Hex("#1a1416");
                camData.renderPostProcessing = false;
                rimGo = new GameObject("Rim"); var rim = rimGo.AddComponent<Light>(); rim.type = LightType.Directional;
                rim.color = Hex("#6e1d1d"); rim.intensity = 0.35f; rim.shadows = LightShadows.None;
                rimGo.transform.rotation = Quaternion.LookRotation(face, Vector3.up) * Quaternion.Euler(35f, 0f, 0f); // from behind & above
            }
            Debug.Log("[R2] set " + set);
        }

        // ---- camera
        // distance so that foot(y=0)..head-top(y=Height) projects to frac of the frame height; look at target; returns after placing camera.
        static void PlaceCamera(Vector3 dirHoriz, float pitch, float fov, float frac, Vector3 target, Vector3 footPt)
        {
            cam.fieldOfView = fov;
            var d = dirHoriz; d.y = 0; d.Normalize();
            var right = Vector3.Cross(Vector3.up, d).normalized;
            var back = Quaternion.AngleAxis(pitch, -right) * d;
            float dist = 8f;
            var top = footPt + Vector3.up * Height;
            for (int i = 0; i < 12; i++)
            {
                cam.transform.position = target + back * dist;
                cam.transform.rotation = Quaternion.LookRotation(target - cam.transform.position, Vector3.up);
                float a = cam.WorldToScreenPoint(footPt).y, b = cam.WorldToScreenPoint(top).y;
                dist *= Mathf.Abs(b - a) / H / frac;
            }
            cam.transform.position = target + back * dist;
            cam.transform.rotation = Quaternion.LookRotation(target - cam.transform.position, Vector3.up);
        }

        static void RenderOnly() { cam.targetTexture = rt; cam.Render(); }

        static Texture2D Render()
        {
            RenderOnly();
            var prev = RenderTexture.active; RenderTexture.active = rt;
            var t = new Texture2D(W, H, TextureFormat.RGB24, false);
            t.ReadPixels(new Rect(0, 0, W, H), 0, 0); t.Apply();
            RenderTexture.active = prev;
            return t;
        }

        static void Save(Texture2D t, string path) { File.WriteAllBytes(path, t.EncodeToPNG()); Debug.Log("[R2] wrote " + path); }

        static Texture2D CloseShot(string dir, string file, Vector3 dirFromChar)
        {
            var foot = new Vector3(hips.position.x, 0, hips.position.z);
            var target = foot + Vector3.up * (Height * 0.5f);
            PlaceCamera(dirFromChar, 3f, 22f, 0.80f, target, foot);
            var t = Render(); Save(t, Path.Combine(dir, file)); return t;
        }

        static Texture2D Crop(Texture2D src, int cx, int cy, int w, int h)
        {
            int x = Mathf.Clamp(cx - w / 2, 0, W - w), y = Mathf.Clamp(cy - h / 2, 0, H - h);
            var c = new Texture2D(w, h, TextureFormat.RGB24, false); c.SetPixels(src.GetPixels(x, y, w, h)); c.Apply(); return c;
        }
        static void FaceCrop(Texture2D src, string path) { var sp = cam.WorldToScreenPoint(head.position); Save(Crop(src, (int)sp.x, (int)sp.y, 512, 512), path); }
        static void CapeCrop(Texture2D src, string path) { var sp = cam.WorldToScreenPoint(new Vector3(hips.position.x, Height * 0.33f, hips.position.z)); Save(Crop(src, (int)sp.x, (int)sp.y, 512, 512), path); }

        // ---- material A/B
        static Material BuildMaterialB()
        {
            var bytes = File.ReadAllBytes(IvanImport.Dir + "/Ivan_MetallicSmoothness.png");
            var tex = new Texture2D(2, 2, TextureFormat.RGBA32, true, true); tex.LoadImage(bytes, false);
            var px = tex.GetPixels32();
            for (int i = 0; i < px.Length; i++) { px[i].r = (byte)(px[i].r / 2); if (px[i].a > 64) px[i].a = 64; } // R x0.5, A cap 0.25
            tex.SetPixels32(px); tex.Apply(true);
            var b = new Material(matA); b.name = "Ivan_Mat_B"; b.SetTexture("_MetallicGlossMap", tex);
            return b;
        }

        static void SetMat(Material m) { foreach (var s in smrs) { var ms = new Material[Mathf.Max(1, s.sharedMaterials.Length)]; for (int i = 0; i < ms.Length; i++) ms[i] = m; s.sharedMaterials = ms; } }

        static void MaterialAB(string dir)
        {
            ResetChar(); Ground("AB");
            var foot = new Vector3(hips.position.x, 0, hips.position.z);
            PlaceCamera(face, 3f, 22f, 0.80f, foot + Vector3.up * (Height * 0.5f), foot);
            SetMat(matA); var a = Render();
            SetMat(matB); var b = Render();
            var o = new Texture2D(1920, 1080, TextureFormat.RGB24, false);
            o.SetPixels(0, 0, 960, 1080, a.GetPixels(480, 0, 960, 1080));
            o.SetPixels(960, 0, 960, 1080, b.GetPixels(480, 0, 960, 1080));
            o.Apply(); Save(o, Path.Combine(dir, "material_AB.png"));
            SetMat(matA);
        }

        // ---- game view: camera follows pelvis, fov 30, pitch 55, 17%
        static void GameGrid(string dir)
        {
            var frames = new[] { 0f, 0.25f, 0.5f, 0.75f };
            var grid = new Texture2D(1920, 1080, TextureFormat.RGB24, false);
            var strip = new Texture2D(1600, 400, TextureFormat.RGB24, false);
            Vector3 camOffset = default; Quaternion camRot = default; bool init = false;
            var gdir = Quaternion.AngleAxis(35f, Vector3.up) * face;
            for (int i = 0; i < 4; i++)
            {
                ResetChar(); Pose(frames[i]); Ground("game" + frames[i]);
                var pelvis = hips.position;
                if (!init)
                {
                    var foot = new Vector3(pelvis.x, 0, pelvis.z);
                    PlaceCamera(gdir, 55f, 30f, 0.17f, pelvis, foot);
                    camOffset = cam.transform.position - pelvis; camRot = cam.transform.rotation; init = true;
                }
                cam.transform.position = pelvis + camOffset; cam.transform.rotation = camRot; // pelvis stays at the frame centre
                var t = Render();
                var sp = cam.WorldToScreenPoint(pelvis);
                Debug.Log($"[R2] game frame {frames[i]} pelvis screen=({sp.x:F1},{sp.y:F1}) feetY={Mathf.Min(Find("LeftFoot").position.y, Find("RightFoot").position.y):F3}");
                int col = i % 2, row = i / 2;
                grid.SetPixels(col * 960, (1 - row) * 540, 960, 540, t.GetPixels(480, 270, 960, 540));
                strip.SetPixels(i * 400, 0, 400, 400, t.GetPixels(W / 2 - 200, H / 2 - 200, 400, 400));
                if (i == 0) Save(Crop(t, W / 2, H / 2, 400, 400), Path.Combine(dir, "game_crop_1x.png"));
                Object.DestroyImmediate(t);
            }
            grid.Apply(); strip.Apply();
            Save(grid, Path.Combine(dir, "game_walk_grid.png"));
            Save(strip, Path.Combine(dir, "game_crop_1x_strip.png"));
        }
    }
}
