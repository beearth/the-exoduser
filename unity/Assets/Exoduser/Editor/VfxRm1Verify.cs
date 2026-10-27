using System.Linq;
using UnityEditor;
using UnityEngine;

// RM-1 VFX check: `Unity -batchmode -executeMethod Exoduser.VfxRm1Verify.Shaders -quit` logs compile state of every RM-1 Shader Graph.
namespace Exoduser
{
    public static class VfxRm1Verify
    {
        const string Dir = "Assets/Exoduser/VFX/RM1";

        public static void Shaders()
        {
            AssetDatabase.Refresh();
            int bad = 0;
            foreach (var guid in AssetDatabase.FindAssets("t:Shader", new[] { Dir }))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                var shader = AssetDatabase.LoadAssetAtPath<Shader>(path);
                if (shader == null) { Debug.LogError("[VFXRM1] no shader " + path); bad++; continue; }
                var msgs = ShaderUtil.GetShaderMessages(shader).Where(m => m.severity == UnityEditor.Rendering.ShaderCompilerMessageSeverity.Error).ToArray();
                bool ok = ShaderUtil.ShaderHasError(shader) == false && msgs.Length == 0;
                Debug.Log($"[VFXRM1] {path} supported={shader.isSupported} errors={msgs.Length} ok={ok}");
                foreach (var m in msgs) Debug.LogError("[VFXRM1] " + m.message + " @" + m.file + ":" + m.line);
                if (!ok) bad++;
            }
            if (bad > 0) EditorApplication.Exit(1);
        }

        // Block subgraphs must import as VisualEffectSubgraphBlock and expose their blocks; logs the asset names (import errors show as "Shader error"/exception lines in the editor log).
        public static void Subgraphs()
        {
            AssetDatabase.Refresh();
            int bad = 0;
            foreach (var guid in AssetDatabase.FindAssets("", new[] { Dir + "/Subgraphs" }))
            {
                var path = AssetDatabase.GUIDToAssetPath(guid);
                if (!path.EndsWith(".vfxblock")) continue;
                var asset = AssetDatabase.LoadMainAssetAtPath(path);
                Debug.Log("[VFXRM1] subgraph " + path + " loaded=" + (asset != null) + " type=" + (asset != null ? asset.GetType().Name : "-"));
                if (asset == null) bad++;
            }
            if (bad > 0) EditorApplication.Exit(1);
        }
    }
}
