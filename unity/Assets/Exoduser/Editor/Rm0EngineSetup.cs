using System.IO;
using Unity.AI.Navigation;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.Rendering;
using UnityEditor.SceneManagement;
using UnityEditor.VFX;
using UnityEngine;
using UnityEngine.ProBuilder;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.Playables;
using UnityEngine.Timeline;
using UnityEngine.VFX;

// RM-0 engine base. `Unity -batchmode -executeMethod Exoduser.Rm0EngineSetup.Run -quit` (idempotent) builds the URP assets, Global Volume, the Cinemachine rig and Assets/Exoduser/Scenes/RM_Sandbox.unity.
namespace Exoduser
{
    public static class Rm0EngineSetup
    {
        const string Dir = "Assets/Exoduser/Rendering";
        const string SceneDir = "Assets/Exoduser/Scenes";
        const string ScenePath = SceneDir + "/RM_Sandbox.unity";

        public static void Run()
        {
            Directory.CreateDirectory(Dir + "/Sandbox"); Directory.CreateDirectory(SceneDir);
            AssetDatabase.Refresh();
            var pc = CreateUrp("URP_PC_High", true);
            var mac = CreateUrp("URP_Mac_Balanced", false);
            AssignPipelines(pc, mac);
            var profile = CreateVolumeProfile();
            BuildSandbox(profile);
            SetBothInput();
            AssetDatabase.SaveAssets();
            Debug.Log("[RM0] setup complete");
        }

        // `-executeMethod Exoduser.Rm0EngineSetup.Capture -output <png>`: renders the sandbox through the main camera (URP + Global Volume).
        public static void Capture()
        {
            var args = System.Environment.GetCommandLineArgs();
            var i = System.Array.IndexOf(args, "-output");
            var png = i >= 0 ? args[i + 1] : "rm0-sandbox.png";
            EditorSceneManager.OpenScene(ScenePath);
            var cam = Camera.main;
            var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32);
            cam.targetTexture = rt;
            { var brain = Object.FindFirstObjectByType<CinemachineBrain>(); brain.UpdateMethod = CinemachineBrain.UpdateMethods.ManualUpdate; brain.ManualUpdate(); }   // capture only: the scene is not saved
            cam.Render();
            RenderTexture.active = rt;
            var tex = new Texture2D(rt.width, rt.height, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0); tex.Apply();
            File.WriteAllBytes(png, tex.EncodeToPNG());
            Debug.Log("[RM0] captured " + png);
        }

        static UniversalRenderPipelineAsset CreateUrp(string name, bool pc)
        {
            var path = $"{Dir}/{name}.asset";
            var existing = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(path);
            if (existing != null) return existing;
            var renderer = ScriptableObject.CreateInstance<UniversalRendererData>();
            AssetDatabase.CreateAsset(renderer, $"{Dir}/{name}_Renderer.asset");
            var asset = UniversalRenderPipelineAsset.Create(renderer);
            asset.supportsHDR = true;
            asset.msaaSampleCount = pc ? 4 : 2;
            asset.renderScale = 1f;
            asset.shadowDistance = pc ? 45f : 32f;
            asset.shadowCascadeCount = pc ? 3 : 2;
            asset.mainLightShadowmapResolution = pc ? 2048 : 1024;
            asset.maxAdditionalLightsCount = pc ? 8 : 6;
            AssetDatabase.CreateAsset(asset, path);
            var so = new SerializedObject(asset);   // read-only in the public API
            so.FindProperty("m_SoftShadowsSupported").boolValue = true;
            so.FindProperty("m_AdditionalLightsRenderingMode").intValue = (int)LightRenderingMode.PerPixel;
            so.FindProperty("m_MainLightShadowsSupported").boolValue = true;
            so.FindProperty("m_AdditionalLightShadowsSupported").boolValue = pc;
            so.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(asset);
            return asset;
        }

        static void AssignPipelines(UniversalRenderPipelineAsset pc, UniversalRenderPipelineAsset mac)
        {
            GraphicsSettings.defaultRenderPipeline = pc;
            var names = QualitySettings.names;
            for (int i = 0; i < names.Length; i++)
            {
                QualitySettings.SetQualityLevel(i, false);
                // two-step contract: High and above = PC high, below = Mac balanced
                QualitySettings.renderPipeline = i >= 3 ? pc : mac;
            }
            QualitySettings.SetQualityLevel(5, false);
        }

        // RM0-LIGHT: art bible v2 §9 L-5 (weak key). Sun is nearly neutral-warm; crimson comes from pools (Pool_Hell_Test), not from the key.
        public static readonly Color SunColor = new Color(1f, .95f, .92f);
        public const float SunIntensity = 0.6f, SunShadowStrength = 0.85f, ReflectionIntensity = 1.0f;
        public static readonly Color AmbientSky = new Color(.16f, .16f, .18f), AmbientEquator = new Color(.11f, .10f, .095f), AmbientGround = new Color(.05f, .04f, .036f);
        public static readonly Color ColorFilter = new Color(1f, .98f, .97f);
        public const float PostExposure = 1.3f;   // RM0-LIGHT-L (Neutral tonemap re-pick 1.30, was 1.85 under ACES): picked from the 14-step sweep (-0.15..3.00) with the Linear + post-processing pipeline (was -0.15 under Gamma)
        public static readonly Color PoolColor = new Color(0xb0 / 255f, 0x28 / 255f, 0x1c / 255f);   // LIGHT-HELL #b0281c
        const string EnvCubemapPath = "Assets/Exoduser/Remodel/Common/Lighting/Env_NeutralSteel.cubemap";

        // Applies the key light and scene-wide lighting (ambient + custom reflection). Shared by the sandbox and the capture tools, so values cannot drift.
        public static void ApplyHellLighting(Light sun)
        {
            sun.type = LightType.Directional; sun.color = SunColor; sun.intensity = SunIntensity; sun.shadows = LightShadows.Soft; sun.shadowStrength = SunShadowStrength;
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = AmbientSky; RenderSettings.ambientEquatorColor = AmbientEquator; RenderSettings.ambientGroundColor = AmbientGround;
            RenderSettings.ambientIntensity = 1f;
            RenderSettings.defaultReflectionMode = UnityEngine.Rendering.DefaultReflectionMode.Custom;
            RenderSettings.customReflectionTexture = EnsureEnvCubemap();
            RenderSettings.reflectionIntensity = ReflectionIntensity;
        }

        // 64px three-stop gradient (up / horizon / down), written in place when it already exists so the GUID stays stable.
        public static Cubemap EnsureEnvCubemap()
        {
            var up = new Color(.48f, .49f, .53f); var hor = new Color(.24f, .22f, .21f); var down = new Color(.06f, .045f, .04f);
            const int n = 64;
            var cm = new Cubemap(n, TextureFormat.RGBA32, true);
            for (int f = 0; f < 6; f++)
            {
                var px = new Color[n * n];
                for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
                {
                    float u = (x + .5f) / n * 2f - 1f, v = 1f - (y + .5f) / n * 2f;   // v: +1 at the image top row
                    Vector3 d;
                    switch ((CubemapFace)f)
                    {
                        case CubemapFace.PositiveX: d = new Vector3(1, v, -u); break;
                        case CubemapFace.NegativeX: d = new Vector3(-1, v, u); break;
                        case CubemapFace.PositiveY: d = new Vector3(u, 1, -v); break;
                        case CubemapFace.NegativeY: d = new Vector3(u, -1, v); break;
                        case CubemapFace.PositiveZ: d = new Vector3(u, v, 1); break;
                        default: d = new Vector3(-u, v, -1); break;
                    }
                    float dy = d.normalized.y;
                    var c = dy >= 0 ? Color.Lerp(hor, up, dy) : Color.Lerp(hor, down, -dy);
                    c.a = 1f; px[y * n + x] = c;
                }
                cm.SetPixels(px, (CubemapFace)f);
            }
            cm.Apply(true, false);
            Directory.CreateDirectory(Path.GetDirectoryName(EnvCubemapPath));
            var existing = AssetDatabase.LoadAssetAtPath<Cubemap>(EnvCubemapPath);
            if (existing == null) { AssetDatabase.CreateAsset(cm, EnvCubemapPath); existing = cm; }
            else { EditorUtility.CopySerialized(cm, existing); Object.DestroyImmediate(cm); EditorUtility.SetDirty(existing); }
            return existing;
        }

        // Components must be sub-assets of the profile, otherwise the .asset keeps only null references (the e10b54d36 asset was saved empty).
        static T Ensure<T>(VolumeProfile p) where T : VolumeComponent
        {
            if (p.TryGet(out T c)) return c;
            c = p.Add<T>(true); c.name = typeof(T).Name;
            AssetDatabase.AddObjectToAsset(c, p);
            return c;
        }

        // Always (re)applies the values, so an existing GlobalVolume_Hell.asset is brought up to date and re-running changes nothing.
        static VolumeProfile CreateVolumeProfile()
        {
            var path = $"{Dir}/GlobalVolume_Hell.asset";
            var profile = AssetDatabase.LoadAssetAtPath<VolumeProfile>(path);
            if (profile == null) { profile = ScriptableObject.CreateInstance<VolumeProfile>(); AssetDatabase.CreateAsset(profile, path); }
            profile.components.RemoveAll(x => x == null);   // drop the null entries left by the empty e10b54d36 asset
            Ensure<Tonemapping>(profile).mode.Override(TonemappingMode.Neutral);   // RM0-LIGHT-L design-director condition: Neutral (was ACES)
            var bloom = Ensure<Bloom>(profile);
            bloom.threshold.Override(1.05f); bloom.intensity.Override(0.28f); bloom.scatter.Override(0.55f); bloom.tint.Override(new Color(1f, .82f, .72f));
            var grade = Ensure<ColorAdjustments>(profile);
            // Art bible v2: dark oxblood hell. Slightly under-exposed, contrast up, saturation held back, light warm filter (no cold/blue cast; metal must read neutral).
            grade.postExposure.Override(PostExposure); grade.contrast.Override(10f); grade.saturation.Override(-8f); grade.colorFilter.Override(ColorFilter);
            var vig = Ensure<Vignette>(profile);
            vig.intensity.Override(0.28f); vig.smoothness.Override(0.55f); vig.color.Override(new Color(.07f, .025f, .02f));
            EditorUtility.SetDirty(profile);
            return profile;
        }

        // Pool_Hell_Test: one crimson test light so inside/outside of a "light pool" can be compared in the same cut (art bible L-4 rim light).
        static void EnsurePool()
        {
            var go = GameObject.Find("Pool_Hell_Test"); if (go == null) go = new GameObject("Pool_Hell_Test");
            go.transform.position = new Vector3(-3f, 0.3f, -2.5f);
            var l = go.GetComponent<Light>(); if (l == null) l = go.AddComponent<Light>();
            l.type = LightType.Point; l.color = PoolColor; l.range = 3.5f; l.intensity = 3f; l.shadows = LightShadows.None;
        }

        // `-executeMethod Exoduser.Rm0EngineSetup.ApplyLight`: brings the existing sandbox scene and Volume asset to the RM0-LIGHT values (idempotent).
        public static void ApplyLight()
        {
            var profile = CreateVolumeProfile();
            var scene = EditorSceneManager.OpenScene(ScenePath);
            var sun = GameObject.Find("Hell Sun").GetComponent<Light>();
            ApplyHellLighting(sun);
            sun.transform.rotation = Quaternion.Euler(52, -35, 0);
            GameObject.Find("Global Volume").GetComponent<Volume>().sharedProfile = profile;
            EnsurePool();
            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            Debug.Log("[RM0] light applied");
        }

        static Sprite CreateTestSprite()
        {
            var path = $"{Dir}/Sandbox/test_sprite.png";
            if (!File.Exists(path))
            {
                const int w = 96, h = 160;
                var tex = new Texture2D(w, h, TextureFormat.RGBA32, false);
                for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
                {
                    float cx = (x - w / 2f) / (w / 2f), cy = (y - h * .45f) / (h * .45f);
                    bool body = cx * cx + cy * cy < 1f;
                    float hx = (x - w / 2f) / 18f, hy = (y - h * .88f) / 18f;
                    bool head = hx * hx + hy * hy < 1f;
                    tex.SetPixel(x, y, body || head ? new Color(.68f, .6f, .5f, 1f) : new Color(0, 0, 0, 0));
                }
                File.WriteAllBytes(path, tex.EncodeToPNG());
                Object.DestroyImmediate(tex);
                AssetDatabase.ImportAsset(path);
                var imp = (TextureImporter)AssetImporter.GetAtPath(path);
                imp.textureType = TextureImporterType.Sprite; imp.spritePixelsPerUnit = 100; imp.alphaIsTransparency = true;
                imp.SaveAndReimport();
            }
            return AssetDatabase.LoadAssetAtPath<Sprite>(path);
        }

        static Material MakeMat(string name, Shader sh, Color c)
        {
            var path = $"{Dir}/Sandbox/{name}.mat";
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m != null) return m;
            m = new Material(sh);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
            if (m.HasProperty("_Color")) m.SetColor("_Color", c);
            AssetDatabase.CreateAsset(m, path);
            return m;
        }

        static void BuildSandbox(VolumeProfile profile)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var lit = Shader.Find("Universal Render Pipeline/Lit");

            // Camera + Cinemachine: same framing as NativeGame (orthographic 5.4, hard follow, no damping), now looking straight down at the XZ ground (screen y = world z).
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" };
            var cam = camGo.AddComponent<Camera>();
            cam.orthographic = true; cam.orthographicSize = 5.4f; cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = new Color(.015f, .02f, .018f);
            cam.transform.SetPositionAndRotation(new Vector3(0, 10, 0), Quaternion.Euler(90, 0, 0));
            var camData = camGo.AddComponent<UniversalAdditionalCameraData>(); camData.renderPostProcessing = true;
            camGo.AddComponent<CinemachineBrain>().DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.Cut, 0);
            camGo.AddComponent<AudioListener>();

            var vcamGo = new GameObject("CM Top-Down");
            var vcam = vcamGo.AddComponent<CinemachineCamera>();
            vcam.Lens = new LensSettings { OrthographicSize = 5.4f, ModeOverride = LensSettings.OverrideModes.Orthographic, NearClipPlane = 0.3f, FarClipPlane = 100f, FieldOfView = 60f };
            vcamGo.transform.SetPositionAndRotation(new Vector3(0, 10, 0), Quaternion.Euler(90, 0, 0));
            var follow = vcamGo.AddComponent<CinemachineFollow>();
            follow.FollowOffset = new Vector3(0, 10, 0);
            var tracker = follow.TrackerSettings; tracker.PositionDamping = Vector3.zero; tracker.BindingMode = Unity.Cinemachine.TargetTracking.BindingMode.WorldSpace; follow.TrackerSettings = tracker;   // NativeGame hard-locks to the player each frame
            vcam.Priority.Value = 10;

            // Directional sun (red-tinted) and Global Volume.
            var sunGo = new GameObject("Hell Sun");
            var sun = sunGo.AddComponent<Light>(); ApplyHellLighting(sun);
            sunGo.transform.rotation = Quaternion.Euler(52, -35, 0);
            EnsurePool();
            var volGo = new GameObject("Global Volume");
            var vol = volGo.AddComponent<Volume>(); vol.isGlobal = true; vol.sharedProfile = profile;

            // Terrain (1 layer) on the XZ ground plane.
            var world = new GameObject("World");
            var td = new TerrainData { heightmapResolution = 129, size = new Vector3(40, 3, 40) };
            var heights = new float[129, 129];
            for (int y = 0; y < 129; y++) for (int x = 0; x < 129; x++) heights[y, x] = Mathf.PerlinNoise(x * .06f, y * .06f) * .35f;
            td.SetHeights(0, 0, heights);
            var layerTex = new Texture2D(32, 32, TextureFormat.RGBA32, true);
            for (int y = 0; y < 32; y++) for (int x = 0; x < 32; x++) { float n = .85f + Mathf.PerlinNoise(x * .3f, y * .3f) * .3f; layerTex.SetPixel(x, y, new Color(.2f * n, .115f * n, .11f * n)); }
            layerTex.Apply();
            var texPath = $"{Dir}/Sandbox/terrain_oxblood.png"; File.WriteAllBytes(texPath, layerTex.EncodeToPNG()); AssetDatabase.ImportAsset(texPath);
            var layer = new TerrainLayer { diffuseTexture = AssetDatabase.LoadAssetAtPath<Texture2D>(texPath), tileSize = new Vector2(4, 4) };
            AssetDatabase.CreateAsset(layer, $"{Dir}/Sandbox/TerrainLayer_Oxblood.terrainlayer");
            td.terrainLayers = new[] { layer };
            AssetDatabase.CreateAsset(td, $"{Dir}/Sandbox/SandboxTerrain.asset");
            var terrainGo = Terrain.CreateTerrainGameObject(td); terrainGo.name = "Terrain";
            terrainGo.transform.SetParent(world.transform, false);
            terrainGo.transform.localPosition = new Vector3(-20, -0.5f, -20);

            // ProBuilder block.
            var pb = ShapeGenerator.CreateShape(ShapeType.Cube, PivotLocation.Center);
            pb.name = "ProBuilder Block"; pb.transform.SetParent(world.transform, false);
            pb.transform.localPosition = new Vector3(4, 1.2f, 0); pb.transform.localScale = new Vector3(2.5f, 2.5f, 2.5f);
            pb.GetComponent<MeshRenderer>().sharedMaterial = MakeMat("BlockMat", lit, new Color(.23f, .17f, .13f));
            pb.gameObject.AddComponent<MeshCollider>();
            pb.ToMesh(); pb.Refresh();

            // NavMesh surface over the terrain and block.
            var navGo = new GameObject("NavMesh Surface"); navGo.transform.SetParent(world.transform, false);
            var surface = navGo.AddComponent<NavMeshSurface>();
            surface.collectObjects = CollectObjects.All; surface.useGeometry = UnityEngine.AI.NavMeshCollectGeometry.RenderMeshes;
            surface.BuildNavMesh();
            Directory.CreateDirectory(SceneDir + "/RM_Sandbox");
            AssetDatabase.CreateAsset(surface.navMeshData, SceneDir + "/RM_Sandbox/NavMesh.asset");
            var sh = Shader.Find("EXODUSER/SpriteLit3D");
            var tri = UnityEngine.AI.NavMesh.CalculateTriangulation(); Debug.Log($"[RM0] navmesh bounds={surface.navMeshData.sourceBounds.size} tris={tri.indices.Length / 3} spriteLit={(sh != null && !ShaderUtil.ShaderHasError(sh))}");

            // Lit sprite actor: receives sun + point light and casts a shadow.
            var actor = new GameObject("Lit Sprite Actor");
            actor.transform.SetPositionAndRotation(new Vector3(0, 1f, 0), Quaternion.Euler(90, 0, 0));   // sprite lies facing the top-down camera
            var sr = actor.AddComponent<SpriteRenderer>(); sr.sprite = CreateTestSprite();
            sr.sharedMaterial = MakeMat("SpriteLit3D", Shader.Find("EXODUSER/SpriteLit3D"), Color.white);
            sr.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
            var torchGo = new GameObject("Torch"); torchGo.transform.position = new Vector3(-1.5f, 1.8f, 0.5f);
            var torch = torchGo.AddComponent<Light>(); torch.type = LightType.Point; torch.color = new Color(1f, .45f, .2f); torch.range = 6f; torch.intensity = 2.2f;
            vcam.Follow = actor.transform;

            // VFX Graph sample.
            var vfxPath = $"{Dir}/Sandbox/SandboxEmbers.vfx";
            if (AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(vfxPath) == null) CreateVfxAsset(vfxPath);
            var vfxGo = new GameObject("VFX Embers"); vfxGo.transform.position = new Vector3(2, 0.5f, 1);
            var ve = vfxGo.AddComponent<VisualEffect>(); ve.visualEffectAsset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(vfxPath);

            // Timeline: activation track toggling the torch.
            var tl = ScriptableObject.CreateInstance<TimelineAsset>();
            AssetDatabase.CreateAsset(tl, $"{Dir}/Sandbox/SandboxTimeline.playable");
            var track = tl.CreateTrack<ActivationTrack>(null, "Torch");
            var clip = track.CreateDefaultClip(); clip.start = 0.5; clip.duration = 2;
            var dirGo = new GameObject("Timeline Director");
            var director = dirGo.AddComponent<PlayableDirector>(); director.playableAsset = tl; director.playOnAwake = false;
            director.SetGenericBinding(track, torchGo);
            EditorUtility.SetDirty(tl);

            EditorSceneManager.SaveScene(scene, ScenePath);
        }

        static void CreateVfxAsset(string path)
        {
            // Simple_Loop template from the VFX Graph package (looping particle system).
            var src = Path.GetFullPath("Packages/com.unity.visualeffectgraph/Editor/Templates/Simple_Loop.vfx");
            File.Copy(src, path, true);
            AssetDatabase.ImportAsset(path);
        }

        static void SetBothInput()
        {
            var so = new SerializedObject(AssetDatabase.LoadMainAssetAtPath("ProjectSettings/ProjectSettings.asset"));
            var p = so.FindProperty("activeInputHandler");
            if (p != null && p.intValue != 2) { p.intValue = 2; so.ApplyModifiedPropertiesWithoutUndo(); }
        }
    }
}
