using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;

namespace Exoduser
{
    // BX-12 candidate only. Source FBXs and PBR maps are the approved Meshy outputs;
    // the preview is deliberately separate from the 2D arena runtime until 1x design review.
    public sealed class DarkDruidAssetImporter : AssetPostprocessor
    {
        const string Prefix = "Assets/Exoduser/Remodel/Boss/DarkDruid/Source/";

        void OnPreprocessModel()
        {
            if (!assetPath.StartsWith(Prefix, StringComparison.Ordinal) || !assetPath.EndsWith(".fbx", StringComparison.OrdinalIgnoreCase)) return;
            var m = (ModelImporter)assetImporter;
            m.animationType = ModelImporterAnimationType.Human;
            m.importAnimation = true;
            m.materialImportMode = ModelImporterMaterialImportMode.None;
            m.importBlendShapes = true;
            m.meshCompression = ModelImporterMeshCompression.Off;
            m.isReadable = true; // vertex/weight and deformation audit before adoption
        }

        void OnPreprocessTexture()
        {
            if (!assetPath.StartsWith(Prefix, StringComparison.Ordinal)) return;
            var t = (TextureImporter)assetImporter;
            t.textureType = assetPath.EndsWith("_Normal.png", StringComparison.OrdinalIgnoreCase) ? TextureImporterType.NormalMap : TextureImporterType.Default;
            t.sRGBTexture = assetPath.EndsWith("_BaseColor.jpg", StringComparison.OrdinalIgnoreCase);
            t.isReadable = assetPath.EndsWith("_MetalRough.jpg", StringComparison.OrdinalIgnoreCase);
            t.mipmapEnabled = true;
            t.maxTextureSize = 4096;
        }
    }

    public static class DarkDruidAssetBuilder
    {
        const string Root = "Assets/Exoduser/Remodel/Boss/DarkDruid";
        const string Source = Root + "/Source";
        const string Generated = Root + "/Generated";
        const string Rig = Source + "/00_Druid_Rig.fbx";
        const string Slam = Source + "/10_Slam127.fbx";
        const string Walk = Source + "/11_Walk.fbx";

        static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException("[Druid3D] " + message); }
        static AnimationClip Clip(string path)
        {
            foreach (var asset in AssetDatabase.LoadAllAssetsAtPath(path))
                if (asset is AnimationClip clip && !clip.name.StartsWith("__preview", StringComparison.Ordinal)) return clip;
            throw new InvalidOperationException("[Druid3D] animation clip missing: " + path);
        }

        static Texture2D MetalSmooth()
        {
            var src = AssetDatabase.LoadAssetAtPath<Texture2D>(Source + "/Druid_MetalRough.jpg");
            Require(src != null && src.isReadable, "metal/roughness source not readable");
            var dst = new Texture2D(src.width, src.height, TextureFormat.RGBA32, true, true);
            var input = src.GetPixels32(); var output = new Color32[input.Length];
            for (int i = 0; i < input.Length; i++) output[i] = new Color32(input[i].b, 0, 0, (byte)(255 - input[i].g));
            dst.SetPixels32(output); dst.Apply(true);
            Directory.CreateDirectory(Generated);
            var path = Generated + "/Druid_MetalSmooth.png";
            File.WriteAllBytes(path, dst.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(dst);
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate);
            var importer = (TextureImporter)AssetImporter.GetAtPath(path);
            importer.sRGBTexture = false; importer.mipmapEnabled = true; importer.SaveAndReimport();
            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        }

        static Material Material()
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit"); Require(shader != null, "URP Lit shader missing");
            Directory.CreateDirectory(Generated);
            var path = Generated + "/M_Druid_Candidate.mat";
            var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (mat == null) { mat = new Material(shader); AssetDatabase.CreateAsset(mat, path); }
            mat.shader = shader;
            mat.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Source + "/Druid_BaseColor.jpg"));
            mat.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Source + "/Druid_Normal.png"));
            mat.SetTexture("_MetallicGlossMap", MetalSmooth());
            mat.SetFloat("_BumpScale", 1f);
            mat.SetFloat("_Cull", 0f); // source glTF material is double-sided (mantle/feathers)
            mat.EnableKeyword("_NORMALMAP"); mat.EnableKeyword("_METALLICGLOSSMAP");
            EditorUtility.SetDirty(mat); return mat;
        }

        static GameObject CreateCandidate(Material mat)
        {
            var rig = AssetDatabase.LoadAssetAtPath<GameObject>(Rig); Require(rig != null, "rig FBX missing");
            var go = (GameObject)PrefabUtility.InstantiatePrefab(rig);
            go.name = "Dark Druid - candidate";
            var animator = go.GetComponent<Animator>() ?? go.AddComponent<Animator>();
            Require(animator.avatar != null && animator.avatar.isValid && animator.avatar.isHuman, "rig Humanoid Avatar invalid");
            animator.applyRootMotion = false;
            int renderers = 0;
            foreach (var r in go.GetComponentsInChildren<SkinnedMeshRenderer>(true)) { r.sharedMaterial = mat; r.shadowCastingMode = ShadowCastingMode.On; renderers++; }
            Require(renderers > 0, "rigged mesh renderer missing");
            return go;
        }

        // Build an importable prefab and a side-by-side proof scene. This does not enable the 3D boss in the live arena.
        public static void Run()
        {
            AssetDatabase.ImportAsset(Rig, ImportAssetOptions.ForceUpdate);
            AssetDatabase.ImportAsset(Slam, ImportAssetOptions.ForceUpdate);
            AssetDatabase.ImportAsset(Walk, ImportAssetOptions.ForceUpdate);
            var slam = Clip(Slam); var walk = Clip(Walk);
            Require(slam.isHumanMotion && walk.isHumanMotion, "source clips did not import as Humanoid");
            var mat = Material();
            var candidate = CreateCandidate(mat);
            Directory.CreateDirectory(Generated);
            var prefabPath = Generated + "/DarkDruid_Candidate.prefab";
            PrefabUtility.SaveAsPrefabAsset(candidate, prefabPath);
            UnityEngine.Object.DestroyImmediate(candidate);
            AssetDatabase.SaveAssets();
            Debug.Log("[Druid3D] prefab " + prefabPath + " / slam " + slam.length.ToString("F3") + "s " + slam.frameRate + "fps / walk " + walk.length.ToString("F3") + "s " + walk.frameRate + "fps");
            Capture();
        }

        // Capture 127 at the measured section boundaries, with the rig and its final material.
        // Arguments: -outDir I:/EXODUSER-Storage/... (never project Library or C:).
        public static void Capture()
        {
            var args = Environment.GetCommandLineArgs(); string outDir = null;
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == "-outDir") outDir = args[i + 1];
            Require(!string.IsNullOrWhiteSpace(outDir) && Path.IsPathRooted(outDir), "-outDir absolute path required");
            Directory.CreateDirectory(outDir);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(Generated + "/DarkDruid_Candidate.prefab");
            Require(prefab != null, "candidate prefab missing; run Build first");
            var clip = Clip(Slam);
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab); go.transform.position = Vector3.zero;
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name = "contact floor"; floor.transform.localScale = new Vector3(1.5f, 1f, 1.5f);
            var floorMat = new Material(Shader.Find("Universal Render Pipeline/Lit")); floorMat.color = new Color(.10f, .075f, .067f); floor.GetComponent<Renderer>().sharedMaterial = floorMat;
            RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = new Color(.24f, .21f, .19f);
            var lightGo = new GameObject("soft key"); var light = lightGo.AddComponent<Light>(); light.type = LightType.Directional; light.intensity = 1.5f; light.color = new Color(1f, .82f, .67f); lightGo.transform.rotation = Quaternion.Euler(45, -30, 0);
            var camGo = new GameObject("candidate camera"); var cam = camGo.AddComponent<Camera>(); cam.orthographic = true; cam.orthographicSize = 2.9f; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = new Color(.08f, .055f, .052f);
            var rt = new RenderTexture(1600, 900, 24); cam.targetTexture = rt;
            var frames = new[] { 0, 14, 41, 53, 70, 90 };
            var angles = new[] { 55f, 0f };
            AnimationMode.StartAnimationMode();
            try
            {
                foreach (var pitch in angles)
                {
                    foreach (var frame in frames)
                    {
                        AnimationMode.BeginSampling();
                        AnimationMode.SampleAnimationClip(go, clip, Mathf.Min(clip.length, frame / 30f));
                        AnimationMode.EndSampling();
                        go.transform.position = Vector3.zero; // Core owns translation
                        float rad = pitch * Mathf.Deg2Rad;
                        camGo.transform.position = new Vector3(0, 1.25f + Mathf.Sin(rad) * 6f, -Mathf.Cos(rad) * 6f);
                        camGo.transform.LookAt(new Vector3(0, 1.25f, 0));
                        cam.Render();
                        RenderTexture.active = rt;
                        var tex = new Texture2D(1600, 900, TextureFormat.RGB24, false);
                        tex.ReadPixels(new Rect(0, 0, 1600, 900), 0, 0); tex.Apply();
                        File.WriteAllBytes(Path.Combine(outDir, "slam127_" + (int)pitch + "deg_f" + frame.ToString("000") + ".png"), tex.EncodeToPNG());
                        UnityEngine.Object.DestroyImmediate(tex);
                    }
                }
            }
            finally { AnimationMode.StopAnimationMode(); RenderTexture.active = null; cam.targetTexture = null; UnityEngine.Object.DestroyImmediate(rt); }
            EditorSceneManager.SaveScene(scene, Generated + "/DarkDruid_Candidate.unity");
            Debug.Log("[Druid3D] captured 12 frames to " + outDir);
        }
    }
}
