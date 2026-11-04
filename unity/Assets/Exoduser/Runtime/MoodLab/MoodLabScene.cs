using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace Exoduser.UnityPort.MoodLab
{
    // Runtime-only assembly: no .unity, prefab, mesh, material or texture asset is created/saved.
    public sealed class MoodLabScene : MonoBehaviour
    {
        readonly List<UnityEngine.Object> owned = new List<UnityEngine.Object>();
        readonly List<Transform> probes = new List<Transform>();
        readonly Vector3 origin = new Vector3(43.2f, 0, -67.8f);
        Camera view;
        Light key;
        ColorAdjustments tone;
        VolumeProfile profile;
        Material litSource;
        int selected;

        public static void Create(char mood)
        {
            var scene = SceneManager.CreateScene("MoodLab");
            if (!SceneManager.SetActiveScene(scene)) throw new InvalidOperationException("Cannot activate MoodLab scene");
            var host = new GameObject("MoodLab isolated runtime").AddComponent<MoodLabScene>();
            try { host.Build(); host.Apply(mood - 'a'); }
            catch { host.gameObject.SetActive(false); Destroy(host.gameObject); throw; }
        }

        T Own<T>(T value) where T : UnityEngine.Object { owned.Add(value); return value; }
        static T Require<T>(string path) where T : UnityEngine.Object
        {
            var value = Resources.Load<T>(path);
            if (value == null) throw new InvalidOperationException("Missing existing Resources asset: " + path);
            return value;
        }

        void Build()
        {
            Application.targetFrameRate = 60;
            litSource = Require<Material>("Art/map/a2/hollow/Materials/A2_Loft_Bark");
            if (litSource.shader == null || !litSource.shader.isSupported)
                throw new InvalidOperationException("Existing URP Lit material shader unavailable");
            var cam = Child("MoodLab camera 34deg 16.5u");
            view = cam.AddComponent<Camera>(); view.tag = "MainCamera";
            view.orthographic = false; view.fieldOfView = MoodLabPresets.FieldOfView;
            view.nearClipPlane = .1f; view.farClipPlane = 120f;
            view.clearFlags = CameraClearFlags.SolidColor; view.allowHDR = true;
            cam.transform.rotation = Quaternion.Euler(MoodLabPresets.Pitch, 0, 0);
            cam.transform.position = origin - cam.transform.forward * MoodLabPresets.Distance;
            var extra = CameraExtensions.GetUniversalAdditionalCameraData(view);
            // Public URP 17.6 properties; exact installed package compilation remains a Mac gate:
            // https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.UniversalAdditionalCameraData.html
            extra.renderPostProcessing = true; extra.dithering = false;
            extra.antialiasing = AntialiasingMode.None;
            extra.volumeLayerMask = 1; // Only isolated layer-0 global volume; base scene roots stay inactive.

            key = Child("MoodLab directional moon").AddComponent<Light>();
            key.type = LightType.Directional; key.shadows = LightShadows.Soft;
            key.shadowBias = .035f; key.shadowNormalBias = .12f;
            key.transform.rotation = Quaternion.Euler(49, -32, 0); // NativeGame.A2Field.cs
            RenderSettings.sun = key; RenderSettings.skybox = null;
            RenderSettings.ambientMode = AmbientMode.Flat;
            RenderSettings.reflectionIntensity = 0;

            profile = Own(ScriptableObject.CreateInstance<VolumeProfile>());
            tone = profile.Add<ColorAdjustments>(true);
            tone.hueShift.Override(0);
            profile.Add<Tonemapping>(true).mode.Override(TonemappingMode.ACES); // existing HellLighting baseline
            // Explicit zero overrides also suppress effects inherited from a pipeline default profile.
            profile.Add<FilmGrain>(true).intensity.Override(0);
            profile.Add<Vignette>(true).intensity.Override(0);
            profile.Add<Bloom>(true).intensity.Override(0);
            var volume = Child("MoodLab isolated color grading").AddComponent<Volume>();
            volume.isGlobal = true; volume.priority = 1000; volume.weight = 1; volume.sharedProfile = profile;
            // No visible grain/vignette/bloom, particles, procedural noise, decals or temporal dithering.

            var soil = Surface(new Color(.80f,.80f,.80f), .08f);
            soil.SetTexture("_BaseMap", Require<Texture2D>("Art/map/a2/ground/A2_ForestSoil_BaseColor"));
            soil.SetTexture("_BumpMap", Require<Texture2D>("Art/map/a2/ground/A2_ForestSoil_Normal"));
            soil.SetFloat("_BumpScale", .55f); soil.EnableKeyword("_NORMALMAP");
            soil.mainTextureScale = new Vector2(8, 12);
            var swamp = Surface(new Color(.16f,.19f,.075f), .65f);
            // Deliberately plain static wet surface. A2ToxicRiver needs the main renderer's custom ground-water pass;
            // invoking that feature/receiver would couple the lab to gameplay. No custom shader/asset is added.
            Quad("Swamp existing Lit surface", -24, 24, -14, 34, -.42f, swamp);
            Quad("North bank and probe lane", -3.2f, 3.2f, 0, 32, -.04f, soil);
            Quad("South bridge approach", -3.2f, 3.2f, -14, -7.8f, -.04f, soil);
            Quad("West tree bank", -24, -5.2f, -14, 34, -.04f, soil);
            Quad("East tree bank", 5.2f, 24, -14, 34, -.04f, soil);

            // Same A2 r3 Resources and authored scale factors (bridge .75, ancient trees .45, log .8).
            Place(Require<GameObject>("Art/map/a2/r3/Models/RF3_Rotten_Wood_Bridge"), "1-1 wood bridge", new Vector3(0,-.06f,-4), new Vector3(.96f,.55f,.85f)*.75f, 24);
            var treeA = Require<GameObject>("Art/map/a2/r3/Models/RF3_Ancient_Tree_A");
            var treeB = Require<GameObject>("Art/map/a2/r3/Models/RF3_Ancient_Tree_B");
            Place(treeA, "West foreground dead tree", new Vector3(-8.4f,-.08f,-2.7f), new Vector3(1.8f,1.6f,1.65f)*.45f, 25);
            Place(treeB, "East middle dead tree", new Vector3(5.8f,-.08f,3), new Vector3(1.3f,1.7f,1.25f)*.45f, 155);
            Place(treeA, "East foreground dead tree", new Vector3(10.1f,-.08f,-9.2f), new Vector3(1.25f,1.5f,1.4f)*.45f, 238);
            Place(treeB, "West background dead tree", new Vector3(-13.7f,-.08f,3.8f), new Vector3(1.2f,1.45f,1.2f)*.45f, 295);
            Place(treeA, "Far west forest closure", new Vector3(-9,-.08f,22), new Vector3(.60f,.68f,.60f), 70);
            Place(treeB, "Far east forest closure", new Vector3(9,-.08f,25), new Vector3(.55f,.72f,.60f), 190);
            Place(Require<GameObject>("Art/map/a2/r3/Models/RF3_Fallen_Log"), "Bank fallen log", new Vector3(-6.2f,-.06f,-6.2f), new Vector3(.8f,.85f,.8f)*.8f, -18);

            // Fogged, shadow-receiving opaque Lit silhouettes. No unlit/emissive readability cheat.
            // 1.61u = current hero display height from map board; these are QA proxies, not live enemies.
            var dark = Surface(new Color(.22f,.23f,.24f), .05f);
            var pale = Surface(new Color(.62f,.60f,.55f), .05f);
            Probe("NEAR 0u", new Vector3(-.8f,0,0), dark, pale);
            Probe("MID 7u", new Vector3(.8f,0,7), dark, pale);
            Probe("FAR 12u", new Vector3(0,0,12), dark, pale);
        }

        GameObject Child(string name)
        {
            var go = new GameObject(name); go.transform.SetParent(transform, false); return go;
        }

        void Place(GameObject source, string name, Vector3 local, Vector3 scale, float yaw)
        {
            var go = Instantiate(source, transform); go.name = name;
            go.transform.SetPositionAndRotation(origin + local, Quaternion.Euler(0, yaw, 0));
            go.transform.localScale = scale;
            foreach (var renderer in go.GetComponentsInChildren<Renderer>(true))
            { renderer.shadowCastingMode = ShadowCastingMode.On; renderer.receiveShadows = true; }
            // Existing model assets remain untouched; lab is visual-only.
            foreach (var collider in go.GetComponentsInChildren<Collider>(true)) collider.enabled = false;
        }

        Material Surface(Color color, float smoothness)
        {
            var mat = Own(new Material(litSource)); mat.name = "MoodLab transient Lit";
            foreach (var property in new[] { "_BaseMap", "_BumpMap", "_OcclusionMap", "_MetallicGlossMap", "_EmissionMap" })
                if (mat.HasProperty(property)) mat.SetTexture(property, null);
            foreach (var keyword in new[] { "_NORMALMAP", "_OCCLUSIONMAP", "_METALLICSPECGLOSSMAP", "_EMISSION", "_ALPHATEST_ON" }) mat.DisableKeyword(keyword);
            mat.SetColor("_BaseColor", color); mat.SetColor("_EmissionColor", Color.black);
            mat.SetFloat("_Metallic", 0); mat.SetFloat("_Smoothness", smoothness);
            return mat;
        }

        void Quad(string name, float x0, float x1, float z0, float z1, float y, Material material)
        {
            var mesh = Own(new Mesh { name = name + " transient geometry" });
            mesh.vertices = new[] { new Vector3(x0,y,z0), new Vector3(x1,y,z0), new Vector3(x0,y,z1), new Vector3(x1,y,z1) };
            mesh.uv = new[] { Vector2.zero, Vector2.right, Vector2.up, Vector2.one };
            mesh.triangles = new[] { 0,2,1, 1,2,3 }; mesh.RecalculateNormals(); mesh.RecalculateTangents(); mesh.RecalculateBounds();
            RenderMesh(name, mesh, material, origin);
        }

        void RenderMesh(string name, Mesh mesh, Material material, Vector3 position)
        {
            var go = Child(name); go.transform.position = position;
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = material;
            renderer.shadowCastingMode = ShadowCastingMode.On; renderer.receiveShadows = true;
        }

        // Six flat faces for a broad, non-speckled proxy. Geometry exists in memory only.
        void Box(string name, Vector3 position, Vector3 size, Material material)
        {
            var vertices = new List<Vector3>(); var triangles = new List<int>();
            var normals = new[] { Vector3.right, Vector3.left, Vector3.up, Vector3.down, Vector3.forward, Vector3.back };
            foreach (var normal in normals)
            {
                var side = Vector3.Cross(normal, Mathf.Abs(normal.y) > .5f ? Vector3.forward : Vector3.up);
                var up = Vector3.Cross(normal, side);
                int n = vertices.Count;
                vertices.Add(Vector3.Scale((normal-side-up)*.5f, size));
                vertices.Add(Vector3.Scale((normal+side-up)*.5f, size));
                vertices.Add(Vector3.Scale((normal-side+up)*.5f, size));
                vertices.Add(Vector3.Scale((normal+side+up)*.5f, size));
                triangles.AddRange(new[] { n,n+1,n+2, n+2,n+1,n+3 });
            }
            var mesh = Own(new Mesh { name = name + " transient geometry" });
            mesh.SetVertices(vertices); mesh.SetTriangles(triangles, 0); mesh.RecalculateNormals(); mesh.RecalculateBounds();
            RenderMesh(name, mesh, material, position);
        }

        void Probe(string name, Vector3 local, Material dark, Material pale)
        {
            var feet = origin + local;
            Box(name + " legs", feet + Vector3.up*.36f, new Vector3(.38f,.72f,.30f), dark);
            Box(name + " torso", feet + Vector3.up*1.01f, new Vector3(.64f,.58f,.32f), dark);
            Box(name + " head", feet + Vector3.up*1.455f, new Vector3(.31f,.31f,.31f), pale);
            var probe = Child(name + " center"); probe.transform.position = feet + Vector3.up*(MoodLabPresets.ProbeHeight*.5f);
            probes.Add(probe.transform);
        }

        void Apply(int index)
        {
            selected = index; var preset = MoodLabPresets.All[index];
            key.intensity = preset.Key; key.color = preset.KeyColor; key.shadowStrength = preset.Shadow;
            RenderSettings.ambientLight = preset.AmbientColor * preset.Ambient;
            RenderSettings.fog = true; RenderSettings.fogMode = FogMode.Linear;
            RenderSettings.fogColor = preset.FogColor; RenderSettings.fogStartDistance = preset.FogStart;
            RenderSettings.fogEndDistance = preset.FogEnd; view.backgroundColor = preset.FogColor;
            tone.postExposure.Override(preset.Exposure); tone.contrast.Override(preset.Contrast);
            tone.saturation.Override(preset.Saturation); tone.colorFilter.Override(preset.Filter);
            Debug.Log("[MoodLab] preset=" + preset.Id + " fog eye-depth=" + preset.FogStart + ".." + preset.FogEnd + "u; camera=34/16.5/46.9453; visual verdict PENDING");
            foreach (var probe in probes)
            {
                var screen = view.WorldToViewportPoint(probe.position);
                float depth = Vector3.Dot(probe.position-view.transform.position, view.transform.forward);
                float transmission = Mathf.Clamp01((preset.FogEnd-depth)/(preset.FogEnd-preset.FogStart));
                bool inside = screen.z > 0 && screen.x > 0 && screen.x < 1 && screen.y > 0 && screen.y < 1;
                Debug.Log("[MoodLab] " + probe.name + " eyeDepth=" + depth.ToString("F3") + "u fogTransmission=" + transmission.ToString("P1") + " inFrustum=" + inside + "; occlusion/darkness UNVERIFIED");
            }
        }

        void OnGUI()
        {
            var preset = MoodLabPresets.All[selected];
            GUI.Box(new Rect(12,12,460,82), "MoodLab " + preset.Id + " | " + preset.Name + " | fog " + preset.FogStart + "-" + preset.FogEnd + "u");
            for (int i = 0; i < MoodLabPresets.All.Length; i++)
                if (GUI.Button(new Rect(24+i*110,47,100,30), "Mood " + MoodLabPresets.All[i].Id)) Apply(i);
        }

        void OnDestroy()
        {
            // Destroy profile subcomponents too; never destroy Resources-owned textures/materials/models.
            if (profile != null) foreach (var component in profile.components) if (component != null) Destroy(component);
            foreach (var value in owned) if (value != null) Destroy(value);
        }
    }
}
