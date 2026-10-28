using System.IO;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

// RM-1 VFX shared-render evidence. `-executeMethod Exoduser.VfxRm1SharedCapture.Sandbox -output <dir> -tag <name>`: renders RM_Sandbox with
// URP_PC_High and URP_Mac_Balanced at 1600x900 (same camera, same scene state). `-tag before` removes postProcessData in memory (never saved)
// to reproduce the unity/main renderer; any other tag renders the asset as committed. Headless, no window.
namespace Exoduser
{
    public static class VfxRm1SharedCapture
    {
        static string Arg(string name)
        {
            var a = System.Environment.GetCommandLineArgs();
            var i = System.Array.IndexOf(a, name);
            return i >= 0 && i + 1 < a.Length ? a[i + 1] : null;
        }

        public static void Sandbox()
        {
            var dir = Arg("-output") ?? "shared_render"; var tag = Arg("-tag") ?? "pp";
            Directory.CreateDirectory(dir);
            EditorSceneManager.OpenScene("Assets/Exoduser/Scenes/RM_Sandbox.unity");
            foreach (var name in new[] { "URP_PC_High", "URP_Mac_Balanced" })
            {
                var asset = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>($"Assets/Exoduser/Rendering/{name}.asset");
                var rd = AssetDatabase.LoadAssetAtPath<UniversalRendererData>($"Assets/Exoduser/Rendering/{name}_Renderer.asset");
                if (tag == "before") { var so = new SerializedObject(rd); so.FindProperty("postProcessData").objectReferenceValue = null; so.ApplyModifiedPropertiesWithoutUndo(); }
                GraphicsSettings.defaultRenderPipeline = asset; QualitySettings.renderPipeline = asset;
                var cam = Camera.main;
                var data = cam.GetUniversalAdditionalCameraData();
                var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32);
                cam.targetTexture = rt;
                Object.FindFirstObjectByType<CinemachineBrain>().ManualUpdate();
                cam.Render();
                RenderTexture.active = rt;
                var tex = new Texture2D(rt.width, rt.height, TextureFormat.RGB24, false);
                tex.ReadPixels(new Rect(0, 0, rt.width, rt.height), 0, 0); tex.Apply();
                var file = Path.Combine(dir, $"sandbox_{name.Substring(4)}_{tag}.png");
                File.WriteAllBytes(file, tex.EncodeToPNG());
                Debug.Log($"[VFXRM1] captured {file} renderPostProcessing={data.renderPostProcessing} colorSpace={PlayerSettings.colorSpace} ppd={(rd.postProcessData != null)}");
                cam.targetTexture = null; RenderTexture.active = null; rt.Release();
                if (tag == "before") AssetDatabase.ImportAsset($"Assets/Exoduser/Rendering/{name}_Renderer.asset", ImportAssetOptions.ForceUpdate);
            }
        }
    }
}
