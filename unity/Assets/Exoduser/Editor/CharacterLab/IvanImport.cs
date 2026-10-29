using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

// UCH-02b. `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.IvanImport.Run -quit`
// Meshy rigged Ivan FBX -> Humanoid avatar, URP/Lit material, locomotion controller, prefab. Idempotent.
namespace Exoduser.CharacterLab
{
    public static class IvanImport
    {
        public const string Dir = "Assets/Exoduser/Art/Characters/Ivan";
        public const string Rigged = Dir + "/Ivan_Rigged.fbx";
        public const string Walk = Dir + "/Ivan_Walk.fbx";
        public const string Run_ = Dir + "/Ivan_Run.fbx";
        public const string MatPath = Dir + "/Ivan_Mat.mat";
        public const string CtrlPath = Dir + "/Ivan_Locomotion.controller";
        public const string PrefabPath = Dir + "/Ivan.prefab";

        // Unity Humanoid bone -> Meshy bone (UCH-02b spec table)
        static readonly (string human, string meshy)[] Map =
        {
            ("Hips","Hips"),("Spine","Spine02"),("Chest","Spine01"),("UpperChest","Spine"),("Neck","neck"),("Head","Head"),
            ("LeftShoulder","LeftShoulder"),("LeftUpperArm","LeftArm"),("LeftLowerArm","LeftForeArm"),("LeftHand","LeftHand"),
            ("RightShoulder","RightShoulder"),("RightUpperArm","RightArm"),("RightLowerArm","RightForeArm"),("RightHand","RightHand"),
            ("LeftUpperLeg","LeftUpLeg"),("LeftLowerLeg","LeftLeg"),("LeftFoot","LeftFoot"),("LeftToes","LeftToeBase"),
            ("RightUpperLeg","RightUpLeg"),("RightLowerLeg","RightLeg"),("RightFoot","RightFoot"),("RightToes","RightToeBase"),
        };

        static string HumanTraitName(string key)
        {
            // HumanTrait.BoneName uses "Left Upper Arm" style
            var sb = new System.Text.StringBuilder();
            for (int i = 0; i < key.Length; i++)
            {
                if (i > 0 && char.IsUpper(key[i])) sb.Append(' ');
                sb.Append(key[i]);
            }
            return sb.ToString();
        }

        public static void Run()
        {
            AssetDatabase.Refresh();
            SetupTextures();
            var mat = SetupMaterial();
            float scale = SetupRigged();
            SetupClip(Walk, "Walk");
            SetupClip(Run_, "Run");
            BuildControllerAndPrefab(mat);
            AssetDatabase.SaveAssets();
            Report(scale);
        }

        static void SetupTextures()
        {
            var b = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Ivan_BaseColor.png");
            b.textureType = TextureImporterType.Default; b.sRGBTexture = true; b.mipmapEnabled = true; b.maxTextureSize = 2048;
            b.textureCompression = TextureImporterCompression.CompressedHQ; b.alphaSource = TextureImporterAlphaSource.None; b.SaveAndReimport();
            var n = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Ivan_Normal.png");
            n.textureType = TextureImporterType.NormalMap; n.mipmapEnabled = true; n.maxTextureSize = 2048;
            n.textureCompression = TextureImporterCompression.CompressedHQ; n.SaveAndReimport();
            var m = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Ivan_MetallicSmoothness.png");
            m.textureType = TextureImporterType.Default; m.sRGBTexture = false; m.mipmapEnabled = true; m.maxTextureSize = 2048;
            m.alphaSource = TextureImporterAlphaSource.FromInput; m.alphaIsTransparency = false;
            m.textureCompression = TextureImporterCompression.CompressedHQ; m.SaveAndReimport();
        }

        static Material SetupMaterial()
        {
            var mat = AssetDatabase.LoadAssetAtPath<Material>(MatPath);
            if (mat == null)
            {
                mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
                AssetDatabase.CreateAsset(mat, MatPath);
            }
            var bc = AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_BaseColor.png");
            var nm = AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_Normal.png");
            var ms = AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_MetallicSmoothness.png");
            mat.SetTexture("_BaseMap", bc); mat.SetColor("_BaseColor", Color.white);
            mat.SetTexture("_BumpMap", nm); mat.SetFloat("_BumpScale", 1f); mat.EnableKeyword("_NORMALMAP");
            mat.SetTexture("_MetallicGlossMap", ms); mat.EnableKeyword("_METALLICSPECGLOSSMAP");
            mat.SetFloat("_Metallic", 1f);
            mat.SetFloat("_Smoothness", 1f);
            mat.SetFloat("_SmoothnessTextureChannel", 0f); // 0 = Metallic Alpha
            mat.SetFloat("_Surface", 0f); mat.SetFloat("_Cull", 2f);
            EditorUtility.SetDirty(mat);
            AssetDatabase.SaveAssetIfDirty(mat);
            return mat;
        }

        static float SetupRigged()
        {
            var imp = (ModelImporter)AssetImporter.GetAtPath(Rigged);
            imp.globalScale = 1f;
            imp.isReadable = false;
            imp.meshCompression = ModelImporterMeshCompression.Off;
            imp.materialImportMode = ModelImporterMaterialImportMode.None;
            imp.importBlendShapes = false;
            imp.animationType = ModelImporterAnimationType.Human;
            imp.avatarSetup = ModelImporterAvatarSetup.CreateFromThisModel;
            imp.importAnimation = false;
            imp.SaveAndReimport();

            // measure height at scale 1, then rescale so bbox height = 1.85
            var go = AssetDatabase.LoadAssetAtPath<GameObject>(Rigged);
            float h = MeasureHeight(go);
            Debug.Log($"[IVAN] measured bbox height at scale 1 = {h:F4}");
            float scale = 1f;
            if (h > 0.01f && Mathf.Abs(h - 1.85f) > 0.01f) scale = 1.85f / h;
            imp.globalScale = scale;

            // explicit humanoid description from the spec table
            var skeleton = new List<SkeletonBone>();
            foreach (var t in go.GetComponentsInChildren<Transform>(true))
                skeleton.Add(new SkeletonBone { name = t.name, position = t.localPosition, rotation = t.localRotation, scale = t.localScale });
            var traitNames = HumanTrait.BoneName;
            var human = new List<HumanBone>();
            foreach (var (hn, mn) in Map)
            {
                var tn = hn;
                if (!traitNames.Contains(tn)) { Debug.LogError("[IVAN] unknown human bone " + tn); continue; }
                if (!skeleton.Any(s => s.name == mn)) { Debug.LogError("[IVAN] missing meshy bone " + mn); continue; }
                var hb = new HumanBone { humanName = tn, boneName = mn }; hb.limit.useDefaultValues = true; human.Add(hb);
            }
            var hd = imp.humanDescription;
            hd.human = human.ToArray(); hd.skeleton = skeleton.ToArray();
            hd.upperArmTwist = 0.5f; hd.lowerArmTwist = 0.5f; hd.upperLegTwist = 0.5f; hd.lowerLegTwist = 0.5f;
            hd.armStretch = 0.05f; hd.legStretch = 0.05f; hd.feetSpacing = 0f; hd.hasTranslationDoF = false;
            imp.humanDescription = hd;
            imp.SaveAndReimport();
            return scale;
        }

        static float MeasureHeight(GameObject asset)
        {
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(asset);
            float lo = float.MaxValue, hi = float.MinValue;
            foreach (var s in inst.GetComponentsInChildren<SkinnedMeshRenderer>())
            {
                var m = new Mesh(); s.BakeMesh(m, false); // smr space, no scale
                var l2w = Matrix4x4.TRS(s.transform.position, s.transform.rotation, Vector3.one);
                var sc = s.transform.lossyScale;
                foreach (var v in m.vertices) { var w = l2w.MultiplyPoint3x4(Vector3.Scale(v, sc)); lo = Mathf.Min(lo, w.y); hi = Mathf.Max(hi, w.y); }
                Object.DestroyImmediate(m);
            }
            Object.DestroyImmediate(inst);
            return hi > lo ? hi - lo : 0f;
        }

        static void SetupClip(string path, string clipName)
        {
            var src = (ModelImporter)AssetImporter.GetAtPath(Rigged);
            var avatar = AssetDatabase.LoadAllAssetsAtPath(Rigged).OfType<Avatar>().FirstOrDefault();
            var imp = (ModelImporter)AssetImporter.GetAtPath(path);
            imp.globalScale = src.globalScale;
            imp.isReadable = false;
            imp.meshCompression = ModelImporterMeshCompression.Off;
            imp.materialImportMode = ModelImporterMaterialImportMode.None;
            imp.animationType = ModelImporterAnimationType.Human;
            imp.avatarSetup = ModelImporterAvatarSetup.CopyFromOther;
            imp.sourceAvatar = avatar;
            imp.importAnimation = true;
            imp.SaveAndReimport();
            var defs = imp.defaultClipAnimations;
            Debug.Log($"[IVAN] {path} takes: " + string.Join(", ", defs.Select(d => $"{d.takeName}[{d.firstFrame}-{d.lastFrame}]")));
            var list = new List<ModelImporterClipAnimation>();
            foreach (var d in defs)
            {
                var c = d; c.name = clipName; c.loopTime = true; c.loopPose = true;
                c.lockRootRotation = true;   // Root Transform Rotation: Bake Into Pose
                c.lockRootHeightY = true;    // Root Transform Position (Y): Bake Into Pose
                c.lockRootPositionXZ = false; // Root Transform Position (XZ): off
                c.keepOriginalOrientation = false; c.keepOriginalPositionY = true; c.keepOriginalPositionXZ = false;
                list.Add(c); break;
            }
            imp.clipAnimations = list.ToArray();
            imp.SaveAndReimport();
        }

        static AnimationClip LoadClip(string path, string name)
        {
            return AssetDatabase.LoadAllAssetsAtPath(path).OfType<AnimationClip>().FirstOrDefault(c => c.name == name && !c.name.StartsWith("__preview"));
        }

        static void BuildControllerAndPrefab(Material mat)
        {
            var walk = LoadClip(Walk, "Walk"); var run = LoadClip(Run_, "Run");
            if (walk == null || run == null) { Debug.LogError("[IVAN] clips missing walk=" + walk + " run=" + run); return; }
            Debug.Log($"[IVAN] clip Walk len={walk.length:F3}s humanoid={walk.humanMotion} loop={walk.isLooping}; Run len={run.length:F3}s humanoid={run.humanMotion} loop={run.isLooping}");

            if (File.Exists(CtrlPath)) AssetDatabase.DeleteAsset(CtrlPath);
            var ctrl = UnityEditor.Animations.AnimatorController.CreateAnimatorControllerAtPath(CtrlPath);
            ctrl.AddParameter("Speed", AnimatorControllerParameterType.Float);
            var sm = ctrl.layers[0].stateMachine;
            var idle = sm.AddState("Idle"); idle.motion = walk; idle.speed = 0f;   // frozen first pose of Walk
            var wk = sm.AddState("Walk"); wk.motion = walk;
            var rn = sm.AddState("Run"); rn.motion = run;
            sm.defaultState = idle;
            void T(UnityEditor.Animations.AnimatorState a, UnityEditor.Animations.AnimatorState b, UnityEditor.Animations.AnimatorConditionMode mode, float th)
            {
                var t = a.AddTransition(b); t.hasExitTime = false; t.duration = 0.1f; t.AddCondition(mode, th, "Speed");
            }
            T(idle, wk, UnityEditor.Animations.AnimatorConditionMode.Greater, 0.1f);
            T(wk, idle, UnityEditor.Animations.AnimatorConditionMode.Less, 0.1f);
            T(wk, rn, UnityEditor.Animations.AnimatorConditionMode.Greater, 3.0f);
            T(rn, wk, UnityEditor.Animations.AnimatorConditionMode.Less, 3.0f);

            var model = AssetDatabase.LoadAssetAtPath<GameObject>(Rigged);
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(model);
            inst.name = "Ivan";
            var anim = inst.GetComponent<Animator>() ?? inst.AddComponent<Animator>();
            anim.runtimeAnimatorController = ctrl;
            anim.avatar = AssetDatabase.LoadAllAssetsAtPath(Rigged).OfType<Avatar>().FirstOrDefault();
            anim.applyRootMotion = false;
            foreach (var r in inst.GetComponentsInChildren<Renderer>(true))
            {
                var ms = new Material[Mathf.Max(1, r.sharedMaterials.Length)];
                for (int i = 0; i < ms.Length; i++) ms[i] = mat;
                r.sharedMaterials = ms;
            }
            PrefabUtility.SaveAsPrefabAsset(inst, PrefabPath);
            Object.DestroyImmediate(inst);
        }

        static void Report(float scale)
        {
            var avatar = AssetDatabase.LoadAllAssetsAtPath(Rigged).OfType<Avatar>().FirstOrDefault();
            Debug.Log($"[IVAN] avatar={(avatar ? avatar.name : "null")} isValid={(avatar && avatar.isValid)} isHuman={(avatar && avatar.isHuman)} globalScale={scale:F4}");
            foreach (var p in new[] { Walk, Run_ })
            {
                var a = AssetDatabase.LoadAllAssetsAtPath(p).OfType<Avatar>().FirstOrDefault();
                Debug.Log($"[IVAN] {p} avatar={(a ? a.name : "null")} isValid={(a && a.isValid)} isHuman={(a && a.isHuman)}");
            }
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            int tris = 0; var mats = new HashSet<string>(); int nr = 0;
            foreach (var s in prefab.GetComponentsInChildren<SkinnedMeshRenderer>(true))
            {
                nr++;
                var m = s.sharedMesh;
                for (int i = 0; i < m.subMeshCount; i++) tris += (int)(m.GetIndexCount(i) / 3);
                foreach (var mm in s.sharedMaterials) mats.Add(mm ? mm.name + "/" + mm.shader.name : "NULL");
            }
            Debug.Log($"[IVAN] skinnedRenderers={nr} tris={tris} mats={string.Join(",", mats)}");
            Debug.Log($"[IVAN] measured height after scale = {MeasureHeight(AssetDatabase.LoadAssetAtPath<GameObject>(Rigged)):F4}");
            foreach (var p in new[] { "BaseColor", "Normal", "MetallicSmoothness" })
            {
                var t = AssetDatabase.LoadAssetAtPath<Texture2D>($"{Dir}/Ivan_{p}.png");
                Debug.Log($"[IVAN] tex {p} {t.width}x{t.height} fmt={t.format}");
            }
            Debug.Log("[IVAN] import complete");
        }
    }
}
