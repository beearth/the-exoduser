using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.Hd2d;

namespace Exoduser
{
    public static class Hd2dTrialBuilder
    {
        public const string Root = "Assets/Exoduser/HD2DTrial";
        public const string ScenePath = Root + "/HD2D_A2_Trial.unity";
        const string Kit = "Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3";
        static readonly string Output = "I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261031_hd2d";
        static Material Mat(string name, string shader)
        {
            var s = Shader.Find(shader); if (!s) throw new Exception("Missing shader: " + shader);
            var m = new Material(s); AssetDatabase.CreateAsset(m, Root + "/" + name + ".mat"); return m;
        }
        static GameObject Quad(string name, Material m, Transform parent = null)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Quad); go.name = name;
            UnityEngine.Object.DestroyImmediate(go.GetComponent<Collider>());
            if (parent) go.transform.SetParent(parent, false);
            go.GetComponent<Renderer>().sharedMaterial = m;
            go.GetComponent<Renderer>().shadowCastingMode = ShadowCastingMode.Off;
            return go;
        }
        static Light Lamp(string name, Vector3 p, Color color, float power, float range)
        {
            var o = new GameObject(name); o.transform.position = p;
            var l = o.AddComponent<Light>(); l.type = LightType.Point; l.color = color; l.intensity = power; l.range = range;
            return l;
        }
        static Texture2D Texture(string path)
        {
            var t = AssetDatabase.LoadAssetAtPath<Texture2D>(path); if (!t) throw new Exception("Missing sprite: " + path);
            if (t.filterMode != FilterMode.Point) throw new Exception("Sprite must already be Point: " + path);
            return t;
        }
        [MenuItem("EXODUSER/HD2D Trial/Build isolated scene")]
        public static void Build()
        {
            if (EditorSceneManager.GetActiveScene().isDirty) throw new Exception("현재 장면에 미저장 변경이 있습니다.");
            AudioListener.volume = 0; AudioListener.pause = true;
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var source = AssetDatabase.LoadAssetAtPath<GameObject>(Root + "/ForestAssembly.fbx");
            if (!source) throw new Exception("Assembly FBX missing");
            var world = UnityEngine.Object.Instantiate(source); world.name = "HD2D_Forest_R3";
            var privateMaterials = new Dictionary<string,Material>();
            foreach (var r in world.GetComponentsInChildren<Renderer>(true))
            {
                var mm = r.sharedMaterials;
                for (int i = 0; i < mm.Length; i++)
                {
                    string id = mm[i].name.Split(new[] { "_Baked" }, StringSplitOptions.None)[0];
                    var mapped = AssetDatabase.LoadAssetAtPath<Material>(Kit + "/Materials/" + id + ".mat");
                    if (!mapped) throw new Exception("Unmapped material " + mm[i].name);
                    // Use private materials so the shared R3 import contract stays intact.
                    if (!privateMaterials.TryGetValue(id, out var m))
                    {
                        m = new Material(mapped);
                        m.SetFloat("_Smoothness", .14f); m.SetFloat("_BumpScale", .35f);
                        AssetDatabase.CreateAsset(m,Root+"/Trial_"+id+".mat");
                        privateMaterials.Add(id,m);
                    }
                    mm[i] = m;
                }
                r.sharedMaterials = mm;
                if (r.name.Contains("Continuous_Bank_Terrain") || r.name.Contains("Rotten_Wood_Bridge"))
                    r.gameObject.AddComponent<MeshCollider>().sharedMesh = r.GetComponent<MeshFilter>().sharedMesh;
            }
            Physics.SyncTransforms();
            Transform Anchor(string name) { return world.GetComponentsInChildren<Transform>(true).First(t => t.name == name); }
            var co = new GameObject("HD2D_TrialCamera"); var cam = co.AddComponent<Camera>();
            cam.transform.position = Anchor("HD2D_Camera").position;
            cam.transform.LookAt(Anchor("HD2D_Target").position);
            cam.orthographic = true; cam.orthographicSize = 13.5f; cam.nearClipPlane = .2f; cam.farClipPlane = 180;
            cam.backgroundColor = new Color(.055f, .075f, .09f); cam.clearFlags = CameraClearFlags.SolidColor;
            cam.allowHDR = true; cam.allowMSAA = false;
            var cd = cam.GetUniversalAdditionalCameraData(); cd.renderPostProcessing = true;
            cd.requiresDepthTexture = true; cd.antialiasing = AntialiasingMode.None;
            var key = new GameObject("HD2D_ColdCanopyLight").AddComponent<Light>(); key.type = LightType.Directional;
            key.color = new Color(.71f, .81f, 1); key.intensity = 1.05f;
            key.transform.rotation = Quaternion.Euler(45, -38, 0); key.shadows = LightShadows.Soft; key.shadowStrength = .7f;
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(.24f, .31f, .38f);
            RenderSettings.ambientEquatorColor = new Color(.13f, .15f, .15f);
            RenderSettings.ambientGroundColor = new Color(.075f, .065f, .045f);
            RenderSettings.fog = true; RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = new Color(.10f, .15f, .18f); RenderSettings.fogDensity = .013f;
            var vol = new GameObject("HD2D_TiltShiftBloom").AddComponent<Volume>(); vol.isGlobal = true;
            vol.sharedProfile = ScriptableObject.CreateInstance<VolumeProfile>();
            var bloom = vol.sharedProfile.Add<Bloom>(); bloom.active = true; bloom.threshold.Override(1.05f); bloom.intensity.Override(.22f); bloom.scatter.Override(.65f);
            var dof = vol.sharedProfile.Add<DepthOfField>(); dof.active = true; dof.mode.Override(DepthOfFieldMode.Gaussian);
            float focus = Vector3.Dot(Anchor("HD2D_Hero").position - cam.transform.position, cam.transform.forward);
            dof.gaussianStart.Override(focus + 5); dof.gaussianEnd.Override(focus + 23); dof.gaussianMaxRadius.Override(1.2f); dof.highQualitySampling.Override(true);
            var tone = vol.sharedProfile.Add<Tonemapping>(); tone.mode.Override(TonemappingMode.ACES);
            var color = vol.sharedProfile.Add<ColorAdjustments>(); color.saturation.Override(-10); color.postExposure.Override(.30f);
            AssetDatabase.CreateAsset(vol.sharedProfile, Root + "/TrialVolume.asset");
            var riverMat = Mat("TrialRiver", "EXODUSER/HD2DTrial/PoisonRiver");
            var river = Quad("HD2D_ToxicRiver", riverMat); river.transform.rotation = Quaternion.Euler(90, 0, 0);
            river.transform.position = new Vector3(0, -.08f, 0); river.transform.localScale = new Vector3(120, 180, 1);
            // Lit height fog is integrated in a 24-step raymarch; no stochastic noise/dither.
            var fog = GameObject.CreatePrimitive(PrimitiveType.Cube); fog.name = "HD2D_VolumetricFog";
            UnityEngine.Object.DestroyImmediate(fog.GetComponent<Collider>());
            fog.transform.position = Vector3.zero; fog.transform.localScale = Vector3.one * 220;
            fog.GetComponent<Renderer>().sharedMaterial = Mat("TrialFog", "EXODUSER/HD2DTrial/VolumeFog");
            fog.GetComponent<Renderer>().shadowCastingMode = ShadowCastingMode.Off;
            var tl = new GameObject("HD2D_ScriptedPreview").AddComponent<Hd2dTrialTimeline>();
            tl.view = cam; tl.cameraOrigin = cam.transform.position;
            tl.walkSheet = Texture("Assets/Exoduser/Resources/Art/player/north-east.png");
            tl.attackSheet = Texture("Assets/Exoduser/Resources/Art/player/attack-bat-v1.png");
            tl.enemySheet = Texture("Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_south_west.png");
            tl.anchors = new[] { Anchor("HD2D_Hero").position, Anchor("HD2D_Enemy0").position, Anchor("HD2D_Enemy1").position, Anchor("HD2D_Enemy2").position };
            var shadowMat = Mat("TrialContactShadow", "EXODUSER/HD2DTrial/SoftSurface"); shadowMat.SetColor("_Color", new Color(.012f,.009f,.006f,.68f));
            tl.shadows = new Transform[4]; tl.enemies = new Renderer[3];
            for (int i = 0; i < 4; i++)
            {
                var sm = Mat("TrialSprite" + i, "EXODUSER/HD2DTrial/PixelLit");
                var o = Quad(i == 0 ? "HD2D_PixelHero" : "HD2D_PixelEnemy" + i, sm);
                if (i == 0) tl.hero = o.GetComponent<Renderer>();
                else
                {
                    tl.enemies[i - 1] = o.GetComponent<Renderer>(); o.transform.localScale = Vector3.one * 4.8f;
                    sm.SetTexture("_BaseMap", tl.enemySheet); sm.SetFloat("_GridSize", 64);
                    int cell = new[] { 0, 1, 9 }[i - 1];
                    sm.SetVector("_UVRect", new Vector4(cell % 8 * 256f / tl.enemySheet.width, 1 - (cell / 8 + 1) * 256f / tl.enemySheet.height, 256f / tl.enemySheet.width, 256f / tl.enemySheet.height));
                }
                var shadow = Quad("HD2D_ContactShadow" + i, shadowMat); shadow.transform.rotation = Quaternion.Euler(90, 0, 0);
                shadow.transform.localScale = new Vector3(i == 0 ? 1.35f : 2, .85f, 1); tl.shadows[i] = shadow.transform;
            }
            var slashMat = Mat("TrialSlash", "EXODUSER/HD2DTrial/SoftSurface"); slashMat.SetFloat("_Mode", 2); slashMat.SetColor("_Color", new Color(2.8f, 2.5f, 1.4f, .9f));
            tl.slash = Quad("HD2D_PreviewSlash", slashMat).transform; tl.slash.localScale = Vector3.one * 3.6f;
            tl.impact = Lamp("HD2D_ContactLight", tl.anchors[0], new Color(1,.76f,.37f),0,5);
            var torchAnchors = world.GetComponentsInChildren<Transform>().Where(t => t.name.StartsWith("HD2D_Torch_")).ToArray();
            tl.torches = torchAnchors.Select((t,i) => Lamp("HD2D_TorchLight"+i,t.position,new Color(1,.45f,.12f),4.5f,7)).ToArray();
            var flameMat = Mat("TrialFlame", "EXODUSER/HD2DTrial/SoftSurface"); flameMat.SetFloat("_Mode",1);flameMat.SetColor("_Color",new Color(3.8f,1.7f,.35f,.95f));
            foreach(var a in torchAnchors){var q=Quad("HD2D_CleanFlame",flameMat);q.transform.position=a.position;q.transform.rotation=cam.transform.rotation;q.transform.localScale=new Vector3(.4f,.85f,1);}
            tl.automatic = false; tl.SetTime(1);
            EditorSceneManager.SaveScene(scene, ScenePath); AssetDatabase.SaveAssets();
            Debug.Log("[HD2D] isolated scene built: " + ScenePath);
        }

        public static void CaptureStills()
        {
            var tl = UnityEngine.Object.FindFirstObjectByType<Hd2dTrialTimeline>();
            if (!tl) throw new Exception("HD2D trial scene is not active");
            Capture(tl,1,Output+"/01-exploration.png"); Capture(tl,5.82f,Output+"/02-combat.png");
            tl.SetTime(1);
        }
        static RenderTexture mcpTarget, mcpPrevious;
        static Camera mcpCamera;
        static float mcpAspect;
        public static void BeginMcpCapture()
        {
            if(mcpTarget)throw new Exception("MCP capture target already owned");
            var tl=UnityEngine.Object.FindFirstObjectByType<Hd2dTrialTimeline>();
            if(!tl)throw new Exception("HD2D trial scene is not active");
            mcpCamera=tl.view;mcpPrevious=mcpCamera.targetTexture;mcpAspect=mcpCamera.aspect;
            mcpTarget=new RenderTexture(1920,1080,24);mcpCamera.targetTexture=mcpTarget;mcpCamera.aspect=16f/9f;tl.SetTime(1);
        }
        public static void EndMcpCapture()
        {
            if(!mcpTarget)return;
            mcpCamera.targetTexture=mcpPrevious;mcpCamera.aspect=mcpAspect;
            mcpTarget.Release();UnityEngine.Object.DestroyImmediate(mcpTarget);mcpTarget=null;mcpCamera=null;
        }
        public static void CaptureSequence()
        {
            if (sequence != null) throw new Exception("HD2D sequence already running");
            sequence = UnityEngine.Object.FindFirstObjectByType<Hd2dTrialTimeline>();
            if (!sequence) throw new Exception("HD2D trial scene is not active");
            Directory.CreateDirectory(Output+"/frames");
            sequenceFrame=0; EditorApplication.update += SequenceStep;
        }
        static Hd2dTrialTimeline sequence;
        static int sequenceFrame;
        static void SequenceStep()
        {
            try
            {
                Capture(sequence,sequenceFrame/30f,Output+"/frames/"+sequenceFrame.ToString("D4")+".png");
                sequenceFrame++;
                if(sequenceFrame%30==0)File.WriteAllText(Output+"/sequence-progress.json","{\"frames\":"+sequenceFrame+"}");
                if(sequenceFrame<300)return;
                EditorApplication.update-=SequenceStep;sequence.SetTime(1);sequence=null;
                File.WriteAllText(Output+"/capture-receipt.json","{\"frames\":300,\"fps\":30,\"width\":1920,\"height\":1080,\"spriteFilter\":\"Point\",\"scripted\":true,\"userSaveChanged\":null,\"scope\":\"Editor camera scripted art trial; no Core gameplay\"}");
            }
            catch(Exception e)
            {
                EditorApplication.update-=SequenceStep;sequence=null;
                File.WriteAllText(Output+"/sequence-error.txt",e.ToString());Debug.LogException(e);
            }
        }
        static void Capture(Hd2dTrialTimeline tl,float t,string path)
        {
            var cam=tl.view;var old=cam.targetTexture;float aspect=cam.aspect;var active=RenderTexture.active;
            var rt=new RenderTexture(1920,1080,24,RenderTextureFormat.ARGBHalf);var blurred=new RenderTexture(1920,1080,0,RenderTextureFormat.ARGB32);var tex=new Texture2D(1920,1080,TextureFormat.RGB24,false);
            var tilt=new Material(Shader.Find("EXODUSER/HD2DTrial/TiltShift"));
            try {cam.targetTexture=rt;cam.aspect=16f/9f;tl.SetTime(t);cam.Render();Graphics.Blit(rt,blurred,tilt);RenderTexture.active=blurred;tex.ReadPixels(new Rect(0,0,1920,1080),0,0);tex.Apply();File.WriteAllBytes(path,tex.EncodeToPNG());}
            finally {cam.targetTexture=old;cam.aspect=aspect;RenderTexture.active=active;rt.Release();blurred.Release();UnityEngine.Object.DestroyImmediate(rt);UnityEngine.Object.DestroyImmediate(blurred);UnityEngine.Object.DestroyImmediate(tilt);UnityEngine.Object.DestroyImmediate(tex);}
        }
    }
}
