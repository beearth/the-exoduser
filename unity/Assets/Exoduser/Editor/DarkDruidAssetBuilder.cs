using System;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;

namespace Exoduser
{
    // BX-12 inspection only. The preserved Meshy body was visually rejected on 2026-10-29.
    // Never connect this prefab to the arena runtime without a replacement sculpt and review.
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

        // Read-only geometry/rig report for a separate sculpt candidate. Never rewrites the source FBX.
        public static void Audit()
        {
            var args = Environment.GetCommandLineArgs(); string outDir = null;
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == "-outDir") outDir = args[i + 1];
            Require(!string.IsNullOrWhiteSpace(outDir) && Path.IsPathRooted(outDir), "-outDir absolute path required");
            Directory.CreateDirectory(outDir);
            var rig = AssetDatabase.LoadAssetAtPath<GameObject>(Rig); Require(rig != null, "rig FBX missing");
            var go = (GameObject)PrefabUtility.InstantiatePrefab(rig);
            var report = new StringBuilder();
            try
            {
                foreach (var renderer in go.GetComponentsInChildren<SkinnedMeshRenderer>(true))
                {
                    var mesh = renderer.sharedMesh;
                    report.AppendLine("renderer=" + renderer.name + " vertices=" + mesh.vertexCount + " submeshes=" + mesh.subMeshCount + " bounds=" + mesh.bounds);
                    report.AppendLine("rendererTransform=" + renderer.transform.localToWorldMatrix);
                    foreach (var bone in renderer.bones) report.AppendLine("bone=" + bone.name + " p=" + bone.position.ToString("F4"));
                }
            }
            finally { UnityEngine.Object.DestroyImmediate(go); }
            File.WriteAllText(Path.Combine(outDir, "mesh_audit.txt"), report.ToString());
            Debug.Log("[Druid3D] mesh audit written to " + outDir);
        }

        // Reversible rigged silhouette experiment. The rejected original stays intact;
        // this is a proportion study, not a replacement sculpt or runtime adoption.
        public static void BuildLeanStudy()
        {
            BuildStudy(.72f, 1.39f, "DarkDruid_LeanStudy");
        }

        public static void BuildCursedStudy()
        {
            BuildStudy(.53f, 1.89f, "DarkDruid_CursedStudy");
        }

        static void BuildStudy(float torsoWidth, float headCounterScale, string outputName)
        {
            var original = AssetDatabase.LoadAssetAtPath<GameObject>(Generated + "/DarkDruid_Candidate.prefab");
            Require(original != null, "original inspection prefab missing");
            var go = (GameObject)PrefabUtility.InstantiatePrefab(original);
            try
            {
                Transform Bone(string name)
                {
                    foreach (var t in go.GetComponentsInChildren<Transform>(true)) if (t.name == name) return t;
                    throw new InvalidOperationException("[Druid3D] bone missing: " + name);
                }
                // Local bone scales retain skinning and permit all three source clips to run.
                Bone("Spine").localScale = new Vector3(torsoWidth, 1f, .76f);
                Bone("Head").localScale = new Vector3(headCounterScale, 1f, 1.27f); // restore antler dominance
                Bone("LeftShoulder").localScale = new Vector3(.70f, 1f, .78f);
                Bone("RightShoulder").localScale = new Vector3(.65f, 1f, .75f);
                Bone("LeftShoulder").localPosition += Vector3.down * .05f;
                Bone("RightShoulder").localPosition += Vector3.down * .10f;
                Bone("LeftArm").localScale = new Vector3(.82f, 1f, .82f);
                Bone("RightArm").localScale = new Vector3(.78f, 1f, .80f);
                Bone("LeftUpLeg").localScale = new Vector3(.80f, 1f, .82f);
                Bone("RightUpLeg").localScale = new Vector3(.75f, 1f, .78f);
                Bone("LeftLeg").localScale = new Vector3(.78f, 1f, .80f);
                Bone("RightLeg").localScale = new Vector3(.73f, 1f, .77f);
                Bone("LeftFoot").localScale = new Vector3(.70f, .85f, .82f);
                Bone("RightFoot").localScale = new Vector3(.65f, .85f, .77f);
                PrefabUtility.SaveAsPrefabAsset(go, Generated + "/" + outputName + ".prefab");
                AssetDatabase.SaveAssets();
                Debug.Log("[Druid3D] rigged lean silhouette study saved; original unchanged; visual review required");
            }
            finally { UnityEngine.Object.DestroyImmediate(go); }
        }

        // Build an inspection prefab and proof scene. The source body is VISUAL FAIL for runtime.
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
            var args = Environment.GetCommandLineArgs(); string outDir = null; string prefabName = "DarkDruid_Candidate";
            for (int i = 0; i + 1 < args.Length; i++)
            {
                if (args[i] == "-outDir") outDir = args[i + 1];
                if (args[i] == "-prefab") prefabName = args[i + 1];
            }
            Require(prefabName == "DarkDruid_Candidate" || prefabName == "DarkDruid_LeanStudy" || prefabName == "DarkDruid_CursedStudy", "unsupported inspection prefab");
            Require(!string.IsNullOrWhiteSpace(outDir) && Path.IsPathRooted(outDir), "-outDir absolute path required");
            Directory.CreateDirectory(outDir);
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(Generated + "/" + prefabName + ".prefab");
            Require(prefab != null, "candidate prefab missing; run Build first");
            var clip = Clip(Slam);
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab); go.transform.position = Vector3.zero;
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name = "contact floor"; floor.transform.localScale = new Vector3(.45f, 1f, .45f);
            var floorMat = new Material(Shader.Find("Universal Render Pipeline/Lit")); floorMat.color = new Color(.19f, .145f, .12f); floor.GetComponent<Renderer>().sharedMaterial = floorMat;
            RenderSettings.ambientMode = AmbientMode.Flat; RenderSettings.ambientLight = new Color(.38f, .33f, .30f);
            var lightGo = new GameObject("soft key"); var light = lightGo.AddComponent<Light>(); light.type = LightType.Directional; light.intensity = 2.1f; light.color = new Color(1f, .84f, .70f); light.shadows = LightShadows.Soft; lightGo.transform.rotation = Quaternion.Euler(35, 155, 0);
            var fillGo = new GameObject("cool fill"); var fill = fillGo.AddComponent<Light>(); fill.type = LightType.Directional; fill.intensity = .6f; fill.color = new Color(.65f, .72f, .72f); fillGo.transform.rotation = Quaternion.Euler(55, -50, 0);
            var camGo = new GameObject("candidate camera"); var cam = camGo.AddComponent<Camera>(); cam.orthographic = true; cam.orthographicSize = 2.15f; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = new Color(.08f, .055f, .052f);
            var rt = new RenderTexture(1600, 900, 24); cam.targetTexture = rt;
            var sequences = new[] { new { name = "bind", clip = (AnimationClip)null, frames = new[] { 0 } },
                                    new { name = "walk", clip = Clip(Walk), frames = new[] { 0, 15, 30 } },
                                    new { name = "slam127", clip, frames = new[] { 0, 14, 41, 53, 70, 90 } } };
            var views = new[] { new { name = "game_front", pitch = 55f, yaw = 0f }, new { name = "side", pitch = 0f, yaw = 90f }, new { name = "game_back", pitch = 55f, yaw = 180f } };
            var feet = new StringBuilder("sequence,frame,left_foot_y,right_foot_y,root_y\n");
            Transform leftFoot = null, rightFoot = null;
            foreach (var t in go.GetComponentsInChildren<Transform>(true)) { if (t.name == "LeftFoot") leftFoot = t; if (t.name == "RightFoot") rightFoot = t; }
            Require(leftFoot != null && rightFoot != null, "foot bones missing");
            AnimationMode.StartAnimationMode();
            try
            {
                foreach (var sequence in sequences)
                {
                    foreach (var frame in sequence.frames)
                    {
                        if (sequence.clip != null)
                        {
                            AnimationMode.BeginSampling();
                            AnimationMode.SampleAnimationClip(go, sequence.clip, Mathf.Min(sequence.clip.length, frame / 30f));
                            AnimationMode.EndSampling();
                        }
                        go.transform.position = Vector3.zero; // Core owns translation
                        feet.Append(sequence.name).Append(',').Append(frame).Append(',')
                            .Append(leftFoot.position.y.ToString("F3", System.Globalization.CultureInfo.InvariantCulture)).Append(',')
                            .Append(rightFoot.position.y.ToString("F3", System.Globalization.CultureInfo.InvariantCulture)).Append(',')
                            .Append(go.transform.position.y.ToString("F3", System.Globalization.CultureInfo.InvariantCulture)).Append('\n');
                        foreach (var view in views)
                        {
                            float rad = view.pitch * Mathf.Deg2Rad;
                            var horizontal = Quaternion.Euler(0, view.yaw, 0) * Vector3.forward;
                            camGo.transform.position = new Vector3(0, 1.25f, 0) + horizontal * (Mathf.Cos(rad) * 6f) + Vector3.up * (Mathf.Sin(rad) * 6f);
                            camGo.transform.LookAt(new Vector3(0, 1.25f, 0));
                            cam.Render();
                            RenderTexture.active = rt;
                            var tex = new Texture2D(1600, 900, TextureFormat.RGB24, false);
                            tex.ReadPixels(new Rect(0, 0, 1600, 900), 0, 0); tex.Apply();
                            File.WriteAllBytes(Path.Combine(outDir, sequence.name + "_" + view.name + "_f" + frame.ToString("000") + ".png"), tex.EncodeToPNG());
                            UnityEngine.Object.DestroyImmediate(tex);
                        }
                    }
                }
            }
            finally { AnimationMode.StopAnimationMode(); RenderTexture.active = null; cam.targetTexture = null; UnityEngine.Object.DestroyImmediate(rt); }
            File.WriteAllText(Path.Combine(outDir, "foot_positions.csv"), feet.ToString());
            EditorSceneManager.SaveScene(scene, Generated + "/" + prefabName + "_Inspection.unity");
            Debug.Log("[Druid3D] captured 30 frames and foot positions to " + outDir);
        }
    }
}
