using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

// UCH-05. `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.SilvertailImport.Run -quit`
// Meshy rigged Silvertail FBX -> Humanoid avatar, URP/Lit material, standalone Walk/Run .anim, locomotion controller, prefab. Idempotent.
// DeleteSourceFbx removes the temporary Walk/Run FBX (clips live on as .anim).
namespace Exoduser.CharacterLab
{
    public static class SilvertailImport
    {
        public const string Dir = "Assets/Exoduser/Art/Characters/Silvertail";
        public const string Rigged = Dir + "/Silvertail_Rigged.fbx";
        public const string Walk = Dir + "/Silvertail_Walk.fbx";
        public const string Run_ = Dir + "/Silvertail_Run.fbx";
        public const string WalkAnim = Dir + "/Silvertail_Walk.anim";
        public const string RunAnim = Dir + "/Silvertail_Run.anim";
        public const string MatPath = Dir + "/Silvertail_Mat.mat";
        public const string CtrlPath = Dir + "/Silvertail_Locomotion.controller";
        public const string PrefabPath = Dir + "/Silvertail.prefab";
        public const float Height = 1.72f;

        static readonly (string human, string meshy)[] Map =
        {
            ("Hips","Hips"),("Spine","Spine02"),("Chest","Spine01"),("UpperChest","Spine"),("Neck","neck"),("Head","Head"),
            ("LeftShoulder","LeftShoulder"),("LeftUpperArm","LeftArm"),("LeftLowerArm","LeftForeArm"),("LeftHand","LeftHand"),
            ("RightShoulder","RightShoulder"),("RightUpperArm","RightArm"),("RightLowerArm","RightForeArm"),("RightHand","RightHand"),
            ("LeftUpperLeg","LeftUpLeg"),("LeftLowerLeg","LeftLeg"),("LeftFoot","LeftFoot"),("LeftToes","LeftToeBase"),
            ("RightUpperLeg","RightUpLeg"),("RightLowerLeg","RightLeg"),("RightFoot","RightFoot"),("RightToes","RightToeBase"),
        };

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
            var b = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Silvertail_BaseColor.png");
            b.textureType = TextureImporterType.Default; b.sRGBTexture = true; b.mipmapEnabled = true; b.maxTextureSize = 2048;
            b.textureCompression = TextureImporterCompression.CompressedHQ; b.alphaSource = TextureImporterAlphaSource.None; b.SaveAndReimport();
            var n = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Silvertail_Normal.png");
            n.textureType = TextureImporterType.NormalMap; n.mipmapEnabled = true; n.maxTextureSize = 2048;
            n.textureCompression = TextureImporterCompression.CompressedHQ; n.SaveAndReimport();
            var m = (TextureImporter)AssetImporter.GetAtPath(Dir + "/Silvertail_MetallicSmoothness.png");
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
            mat.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_BaseColor.png")); mat.SetColor("_BaseColor", Color.white);
            mat.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_Normal.png")); mat.SetFloat("_BumpScale", 1f); mat.EnableKeyword("_NORMALMAP");
            mat.SetTexture("_MetallicGlossMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_MetallicSmoothness.png")); mat.EnableKeyword("_METALLICSPECGLOSSMAP");
            mat.SetFloat("_Metallic", 1f); mat.SetFloat("_Smoothness", 1f); mat.SetFloat("_SmoothnessTextureChannel", 0f);
            mat.SetFloat("_Surface", 0f); mat.SetFloat("_Cull", 2f);
            EditorUtility.SetDirty(mat);
            AssetDatabase.SaveAssetIfDirty(mat);
            return mat;
        }

        static float SetupRigged()
        {
            var imp = (ModelImporter)AssetImporter.GetAtPath(Rigged);
            imp.globalScale = 1f; imp.isReadable = false; imp.meshCompression = ModelImporterMeshCompression.Off;
            imp.materialImportMode = ModelImporterMaterialImportMode.None; imp.importBlendShapes = false;
            imp.animationType = ModelImporterAnimationType.Human; imp.avatarSetup = ModelImporterAvatarSetup.CreateFromThisModel;
            imp.importAnimation = false;
            imp.SaveAndReimport();

            var go = AssetDatabase.LoadAssetAtPath<GameObject>(Rigged);
            float h = MeasureHeight(go);
            Debug.Log($"[SILVERTAIL] measured bbox height at scale 1 = {h:F4}");
            float scale = 1f;
            if (h > 0.01f && Mathf.Abs(h - Height) > 0.01f) scale = Height / h;
            imp.globalScale = scale;

            var skeleton = new List<SkeletonBone>();
            foreach (var t in go.GetComponentsInChildren<Transform>(true))
                skeleton.Add(new SkeletonBone { name = t.name, position = t.localPosition, rotation = t.localRotation, scale = t.localScale });
            var traitNames = HumanTrait.BoneName;
            var human = new List<HumanBone>();
            foreach (var (hn, mn) in Map)
            {
                if (!traitNames.Contains(hn)) { Debug.LogError("[SILVERTAIL] unknown human bone " + hn); continue; }
                if (!skeleton.Any(s => s.name == mn)) { Debug.LogError("[SILVERTAIL] missing meshy bone " + mn); continue; }
                var hb = new HumanBone { humanName = hn, boneName = mn }; hb.limit.useDefaultValues = true; human.Add(hb);
            }
            var hd = imp.humanDescription;
            hd.human = human.ToArray(); hd.skeleton = skeleton.ToArray();
            hd.upperArmTwist = 0.5f; hd.lowerArmTwist = 0.5f; hd.upperLegTwist = 0.5f; hd.lowerLegTwist = 0.5f;
            hd.armStretch = 0.05f; hd.legStretch = 0.05f; hd.feetSpacing = 0f; hd.hasTranslationDoF = false;
            imp.humanDescription = hd;
            imp.SaveAndReimport();
            return scale;
        }

        public static float MeasureHeight(GameObject asset)
        {
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(asset);
            float lo = float.MaxValue, hi = float.MinValue;
            foreach (var s in inst.GetComponentsInChildren<SkinnedMeshRenderer>())
            {
                var m = new Mesh(); s.BakeMesh(m, false);
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
            imp.globalScale = src.globalScale; imp.isReadable = false; imp.meshCompression = ModelImporterMeshCompression.Off;
            imp.materialImportMode = ModelImporterMaterialImportMode.None;
            imp.animationType = ModelImporterAnimationType.Human; imp.avatarSetup = ModelImporterAvatarSetup.CopyFromOther; imp.sourceAvatar = avatar;
            imp.importAnimation = true;
            imp.SaveAndReimport();
            var defs = imp.defaultClipAnimations;
            Debug.Log($"[SILVERTAIL] {path} takes: " + string.Join(", ", defs.Select(d => $"{d.takeName}[{d.firstFrame}-{d.lastFrame}]")));
            var list = new List<ModelImporterClipAnimation>();
            foreach (var d in defs)
            {
                var c = d; c.name = clipName; c.loopTime = true; c.loopPose = true;
                c.lockRootRotation = true; c.lockRootHeightY = true; c.lockRootPositionXZ = false;
                c.keepOriginalOrientation = false; c.keepOriginalPositionY = true; c.keepOriginalPositionXZ = false;
                list.Add(c); break;
            }
            imp.clipAnimations = list.ToArray();
            imp.SaveAndReimport();
        }

        static AnimationClip FromFbx(string fbx, string name)
        {
            return AssetDatabase.LoadAllAssetsAtPath(fbx).OfType<AnimationClip>().FirstOrDefault(c => c.name == name && !c.name.StartsWith("__preview"));
        }

        static AnimationClip CopyClip(string fbx, string name, string path)
        {
            var src = FromFbx(fbx, name);
            if (src == null) return null;
            if (File.Exists(path)) AssetDatabase.DeleteAsset(path);
            var clone = Object.Instantiate(src); clone.name = Path.GetFileNameWithoutExtension(path);
            AssetDatabase.CreateAsset(clone, path);
            var imp = (ModelImporter)AssetImporter.GetAtPath(fbx); var ci = imp.clipAnimations.FirstOrDefault();
            var s = AnimationUtility.GetAnimationClipSettings(clone);
            s.loopTime = true; s.loopBlend = ci.loopPose;
            s.loopBlendOrientation = ci.lockRootRotation; s.loopBlendPositionY = ci.lockRootHeightY; s.loopBlendPositionXZ = ci.lockRootPositionXZ;
            s.keepOriginalOrientation = ci.keepOriginalOrientation; s.keepOriginalPositionY = ci.keepOriginalPositionY; s.keepOriginalPositionXZ = ci.keepOriginalPositionXZ;
            AnimationUtility.SetAnimationClipSettings(clone, s);
            EditorUtility.SetDirty(clone);
            return clone;
        }

        static void BuildControllerAndPrefab(Material mat)
        {
            var walk = CopyClip(Walk, "Walk", WalkAnim); var run = CopyClip(Run_, "Run", RunAnim);
            if (walk == null || run == null) { Debug.LogError("[SILVERTAIL] clips missing walk=" + walk + " run=" + run); return; }
            Debug.Log($"[SILVERTAIL] clip Walk len={walk.length:F3}s humanoid={walk.humanMotion} loop={walk.isLooping}; Run len={run.length:F3}s humanoid={run.humanMotion} loop={run.isLooping}");

            if (File.Exists(CtrlPath)) AssetDatabase.DeleteAsset(CtrlPath);
            var ctrl = UnityEditor.Animations.AnimatorController.CreateAnimatorControllerAtPath(CtrlPath);
            ctrl.AddParameter("Speed", AnimatorControllerParameterType.Float);
            var sm = ctrl.layers[0].stateMachine;
            var idle = sm.AddState("Idle"); idle.motion = walk; idle.speed = 0f;
            var wk = sm.AddState("Walk"); wk.motion = walk;
            var rn = sm.AddState("Run"); rn.motion = run;
            sm.defaultState = idle;
            void T(UnityEditor.Animations.AnimatorState a, UnityEditor.Animations.AnimatorState b, UnityEditor.Animations.AnimatorConditionMode mode, float th)
            { var t = a.AddTransition(b); t.hasExitTime = false; t.duration = 0.1f; t.AddCondition(mode, th, "Speed"); }
            T(idle, wk, UnityEditor.Animations.AnimatorConditionMode.Greater, 0.1f);
            T(wk, idle, UnityEditor.Animations.AnimatorConditionMode.Less, 0.1f);
            T(wk, rn, UnityEditor.Animations.AnimatorConditionMode.Greater, 3.0f);
            T(rn, wk, UnityEditor.Animations.AnimatorConditionMode.Less, 3.0f);

            var model = AssetDatabase.LoadAssetAtPath<GameObject>(Rigged);
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(model);
            inst.name = "Silvertail";
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

        public static void DeleteSourceFbx()
        {
            var ctrl = AssetDatabase.LoadAssetAtPath<UnityEditor.Animations.AnimatorController>(CtrlPath);
            foreach (var l in ctrl.layers) foreach (var st in l.stateMachine.states)
                {
                    var p = AssetDatabase.GetAssetPath(st.state.motion);
                    if (p.EndsWith(".fbx")) { Debug.LogError("[SILVERTAIL] controller still references " + p + " - abort delete"); return; }
                }
            foreach (var p in new[] { Walk, Run_ })
                Debug.Log($"[SILVERTAIL] delete {p} -> {AssetDatabase.DeleteAsset(p)}");
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            foreach (var l in ctrl.layers) foreach (var st in l.stateMachine.states) Debug.Log($"[SILVERTAIL] state {st.state.name} -> {AssetDatabase.GetAssetPath(st.state.motion)}");
        }

        static void Report(float scale)
        {
            var avatar = AssetDatabase.LoadAllAssetsAtPath(Rigged).OfType<Avatar>().FirstOrDefault();
            Debug.Log($"[SILVERTAIL] avatar={(avatar ? avatar.name : "null")} isValid={(avatar && avatar.isValid)} isHuman={(avatar && avatar.isHuman)} globalScale={scale:F4}");
            foreach (var p in new[] { Walk, Run_ })
            {
                var a = AssetDatabase.LoadAllAssetsAtPath(p).OfType<Avatar>().FirstOrDefault();
                Debug.Log($"[SILVERTAIL] {p} avatar={(a ? a.name : "null")} isValid={(a && a.isValid)} isHuman={(a && a.isHuman)}");
            }
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            int tris = 0, verts = 0, nr = 0; var mats = new HashSet<string>();
            foreach (var s in prefab.GetComponentsInChildren<SkinnedMeshRenderer>(true))
            {
                nr++; var m = s.sharedMesh; verts += m.vertexCount;
                for (int i = 0; i < m.subMeshCount; i++) tris += (int)(m.GetIndexCount(i) / 3);
                foreach (var mm in s.sharedMaterials) mats.Add(mm ? mm.name + "/" + mm.shader.name : "NULL");
            }
            Debug.Log($"[SILVERTAIL] skinnedRenderers={nr} verts={verts} tris={tris} mats={string.Join(",", mats)}");
            Debug.Log($"[SILVERTAIL] measured height after scale = {MeasureHeight(AssetDatabase.LoadAssetAtPath<GameObject>(Rigged)):F4}");
            foreach (var p in new[] { "BaseColor", "Normal", "MetallicSmoothness" })
            {
                var t = AssetDatabase.LoadAssetAtPath<Texture2D>($"{Dir}/Silvertail_{p}.png");
                Debug.Log($"[SILVERTAIL] tex {p} {t.width}x{t.height} fmt={t.format}");
            }
            Debug.Log("[SILVERTAIL] import complete");
        }
    }
}
