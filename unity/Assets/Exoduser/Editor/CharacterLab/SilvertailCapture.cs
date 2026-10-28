using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// UCH-05 capture (neutral judging light only). `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.SilvertailCapture.Run -outdir <dir> -quit` (no -nographics)
namespace Exoduser.CharacterLab
{
    public static class SilvertailCapture
    {
        const int W = 1920, H = 1080;
        const float Height = SilvertailImport.Height;
        static Camera cam; static UniversalAdditionalCameraData camData;
        static RenderTexture rt;
        static GameObject chr; static Animator anim; static SkinnedMeshRenderer[] smrs;
        static Transform head, headFront, hips;
        static Vector3 face = Vector3.forward;
        static string outDir;
        static GameObject sunGo, rimGo;

        static Color Hex(string h) { ColorUtility.TryParseHtmlString(h, out var c); return c; }
        static Transform Find(string n) { return chr.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == n); }

        public static void Run()
        {
            var args = System.Environment.GetCommandLineArgs();
            int oi = System.Array.IndexOf(args, "-outdir");
            outDir = oi >= 0 ? args[oi + 1] : "capture_silvertail";
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

            ResetChar();
            face = Vector3.forward;
            if (head && headFront) { var d = headFront.position - head.position; d.y = 0; if (d.magnitude > 1e-4f) face = d.normalized; }
            Debug.Log("[ST] facing " + face + " headFront=" + (headFront ? headFront.name : "none"));

            ConfigureKey();
            ResetChar(); Ground("bind");
            var t1 = CloseShot("shot_front_close.png", face);
            FaceCrop(t1, "crop_face_front.png");
            CloseShot("shot_34_close.png", Quaternion.AngleAxis(40f, Vector3.up) * face);
            var t3 = CloseShot("shot_back_close.png", -face);
            var spB = cam.WorldToScreenPoint(new Vector3(hips.position.x, Height * 0.60f, hips.position.z));
            Save(Crop(t3, (int)spB.x, (int)spB.y, 512, 512), "crop_back_blade_fold.png");
            var spH = cam.WorldToScreenPoint(head.position);
            Save(Crop(t3, (int)spH.x, (int)spH.y - 40, 512, 512), "crop_hair_back.png");
            var t34 = CloseShot("shot_34b_close.png", Quaternion.AngleAxis(-140f, Vector3.up) * face); // rear 3/4 (blade + ponytail)
            Object.DestroyImmediate(t1); Object.DestroyImmediate(t3); Object.DestroyImmediate(t34);

            SideWalk();
            GameGrid();
            WeaponShots();
            Debug.Log("[ST] done " + outDir);
        }

        // ---- character
        static void ResetChar()
        {
            if (chr) Object.DestroyImmediate(chr);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(SilvertailImport.PrefabPath);
            chr = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            chr.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
            anim = chr.GetComponent<Animator>();
            smrs = chr.GetComponentsInChildren<SkinnedMeshRenderer>();
            foreach (var s in smrs) { s.forceMatrixRecalculationPerRender = true; s.updateWhenOffscreen = true; }
            head = Find("Head"); headFront = Find("headfront"); hips = Find("Hips");
            if (cam != null) { cam.fieldOfView = 30f; cam.transform.position = new Vector3(0, 1.2f, 7f); cam.transform.rotation = Quaternion.LookRotation(new Vector3(0, 0.9f, 0) - cam.transform.position); RenderOnly(); }
        }

        static void Pose(float norm)
        {
            for (int k = 0; k < 2; k++) { anim.Rebind(); anim.speed = 1f; anim.Play("Walk", 0, norm); anim.Update(0f); }
        }

        // lowest skinned-mesh point -> y=0 (x/z of the character are kept)
        static void Ground(string tag)
        {
            var p = chr.transform.position; chr.transform.position = new Vector3(p.x, 0, p.z);
            RenderOnly();
            float minY = BakeMinY();
            chr.transform.position = new Vector3(p.x, -minY, p.z);
            RenderOnly();
            Debug.Log($"[ST] ground {tag}: bakeMinY before={minY:F4} after={BakeMinY():F4} hipsY={hips.position.y:F3}");
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

        // ---- lighting: neutral judging set (key + red rim)
        static void ConfigureKey()
        {
            sunGo = new GameObject("Sun"); var sun = sunGo.AddComponent<Light>(); sun.type = LightType.Directional; sun.shadows = LightShadows.Soft;
            var baseRot = Quaternion.LookRotation(-face, Vector3.up);
            sun.color = Hex("#d9d0c4"); sun.intensity = 1.1f;
            sunGo.transform.rotation = baseRot * Quaternion.Euler(50f, -35f, 0f);
            RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = Hex("#2a2224");
            cam.backgroundColor = Hex("#1a1416");
            camData.renderPostProcessing = false;
            rimGo = new GameObject("Rim"); var rim = rimGo.AddComponent<Light>(); rim.type = LightType.Directional;
            rim.color = Hex("#6e1d1d"); rim.intensity = 0.35f; rim.shadows = LightShadows.None;
            rimGo.transform.rotation = Quaternion.LookRotation(face, Vector3.up) * Quaternion.Euler(35f, 0f, 0f);
        }

        // ---- camera
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
        static void Save(Texture2D t, string file) { var p = Path.Combine(outDir, file); File.WriteAllBytes(p, t.EncodeToPNG()); Debug.Log("[ST] wrote " + p); }

        static Texture2D CloseShot(string file, Vector3 dirFromChar)
        {
            var foot = new Vector3(hips.position.x, 0, hips.position.z);
            PlaceCamera(dirFromChar, 3f, 22f, 0.80f, foot + Vector3.up * (Height * 0.5f), foot);
            var t = Render(); Save(t, file); return t;
        }

        static Texture2D Crop(Texture2D src, int cx, int cy, int w, int h)
        {
            int x = Mathf.Clamp(cx - w / 2, 0, W - w), y = Mathf.Clamp(cy - h / 2, 0, H - h);
            var c = new Texture2D(w, h, TextureFormat.RGB24, false); c.SetPixels(src.GetPixels(x, y, w, h)); c.Apply(); return c;
        }
        static void FaceCrop(Texture2D src, string file) { var sp = cam.WorldToScreenPoint(head.position); Save(Crop(src, (int)sp.x, (int)sp.y, 512, 512), file); }

        // ---- side walk: 8 frames, 1.4 m/s advance, camera tracks, floor tick marks show the advance
        static void SideWalk()
        {
            var ticks = new GameObject("Ticks");
            var tm = new Material(Shader.Find("Universal Render Pipeline/Lit")); tm.SetColor("_BaseColor", Hex("#7a6a5c")); tm.SetFloat("_Smoothness", 0f);
            for (int i = -6; i <= 14; i++)
            {
                var c = GameObject.CreatePrimitive(PrimitiveType.Cube); Object.DestroyImmediate(c.GetComponent<Collider>());
                c.transform.SetParent(ticks.transform); c.transform.position = face * (i * 0.25f) + Vector3.up * 0.003f + Vector3.Cross(Vector3.up, face) * 0.55f;
                c.transform.localScale = new Vector3(0.03f, 0.006f, 0.2f); c.transform.rotation = Quaternion.LookRotation(face);
                c.GetComponent<MeshRenderer>().sharedMaterial = tm;
            }
            ResetChar(); Pose(0f);
            float len = anim.runtimeAnimatorController.animationClips.FirstOrDefault(c => c.name.Contains("Walk"))?.length ?? 1f;
            Debug.Log($"[ST] walk clip length {len:F3}s -> stride travel {1.4f * len:F3} m");
            var grid = new Texture2D(1920, 1080, TextureFormat.RGB24, false);
            var side = Quaternion.AngleAxis(-90f, Vector3.up) * face; // camera sits on the character's left... any fixed side
            for (int i = 0; i < 8; i++)
            {
                float norm = i / 8f;
                ResetChar(); Pose(norm);
                chr.transform.position = face * (1.4f * len * norm);
                Ground("side" + i);
                var foot = new Vector3(chr.transform.position.x, 0, chr.transform.position.z);
                var hp = hips.position;
                PlaceCamera(side, 2f, 22f, 0.80f, new Vector3(hp.x, Height * 0.5f, hp.z), new Vector3(hp.x, 0, hp.z));
                var t = Render();
                int col = i % 4, row = i / 4;
                // 480x540 cell: crop 480 wide column centred, scale 1:1 vertically 540 around the middle
                grid.SetPixels(col * 480, (1 - row) * 540, 480, 540, t.GetPixels(W / 2 - 240, H / 2 - 270, 480, 540));
                Object.DestroyImmediate(t);
            }
            grid.Apply(); Save(grid, "walk_side_grid.png");
            Object.DestroyImmediate(ticks);
        }

        // ---- game view: camera follows pelvis, fov 30, pitch 55, 17%
        static void GameGrid()
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
                cam.transform.position = pelvis + camOffset; cam.transform.rotation = camRot;
                var t = Render();
                int col = i % 2, row = i / 2;
                grid.SetPixels(col * 960, (1 - row) * 540, 960, 540, t.GetPixels(480, 270, 960, 540));
                strip.SetPixels(i * 400, 0, 400, 400, t.GetPixels(W / 2 - 200, H / 2 - 200, 400, 400));
                if (i == 0) Save(Crop(t, W / 2, H / 2, 400, 400), "game_crop_1x.png");
                Object.DestroyImmediate(t);
            }
            grid.Apply(); strip.Apply();
            Save(grid, "game_walk_grid.png"); Save(strip, "game_crop_1x_strip.png");
        }

        // ---- dagger: front / 3-4 / scale next to the character
        static void WeaponShots()
        {
            var wp = AssetDatabase.LoadAssetAtPath<GameObject>(SilverWeaponImport.PrefabPath);
            if (wp == null) { Debug.LogWarning("[ST] dagger prefab missing - skip weapon shots"); return; }
            if (chr) Object.DestroyImmediate(chr);
            var w = (GameObject)PrefabUtility.InstantiatePrefab(wp);
            // prefab root = pommel top, blade hangs along -Y; stand it with tip on the floor
            w.transform.position = new Vector3(0, SilverWeaponImport.Length, 0);
            RenderOnly();
            foreach (var (file, yaw) in new[] { ("weapon_front.png", 0f), ("weapon_34.png", 40f) })
            {
                var dir = Quaternion.AngleAxis(yaw, Vector3.up) * face;
                var tgt = new Vector3(0, SilverWeaponImport.Length * 0.5f, 0);
                cam.fieldOfView = 22f; float dist = 8f;
                for (int i = 0; i < 12; i++)
                {
                    cam.transform.position = tgt + dir * dist; cam.transform.rotation = Quaternion.LookRotation(tgt - cam.transform.position, Vector3.up);
                    float a = cam.WorldToScreenPoint(Vector3.zero).y, b = cam.WorldToScreenPoint(new Vector3(0, SilverWeaponImport.Length, 0)).y;
                    dist *= Mathf.Abs(b - a) / H / 0.85f;
                }
                cam.transform.position = tgt + dir * dist; cam.transform.rotation = Quaternion.LookRotation(tgt - cam.transform.position, Vector3.up);
                var t = Render(); Save(t, file); Object.DestroyImmediate(t);
            }
            // scale: character A-pose at x=-0.35, dagger standing at x=+0.35 (held-upright, tip down at floor)
            ResetChar(); Ground("scale");
            chr.transform.position += new Vector3(-0.35f, 0, 0);
            Ground("scale2");
            w.transform.position = new Vector3(0.45f, SilverWeaponImport.Length, 0);
            var foot = new Vector3(0, 0, 0);
            PlaceCamera(face, 3f, 22f, 0.80f, foot + Vector3.up * (Height * 0.5f), foot);
            var ts = Render(); Save(ts, "weapon_scale.png"); Object.DestroyImmediate(ts);
            Object.DestroyImmediate(w);
        }
    }
}
