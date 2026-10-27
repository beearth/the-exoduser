using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering.Universal;

// RM-1 V0 shared render assets. `Unity -batchmode -executeMethod Exoduser.VfxRm1SharedRender.Run -quit` (idempotent):
// Decal renderer feature + postProcessData on both URP renderers. The Volume (Bloom/Tonemapping) belongs to RM0-LIGHT and is not touched.
namespace Exoduser
{
    public static class VfxRm1SharedRender
    {
        const string Dir = "Assets/Exoduser/Rendering";
        const string PostProcessDataPath = "Packages/com.unity.render-pipelines.universal/Runtime/Data/PostProcessData.asset";

        public static void Run()
        {
            foreach (var name in new[] { "URP_PC_High_Renderer", "URP_Mac_Balanced_Renderer" }) PatchRenderer($"{Dir}/{name}.asset");
            AssetDatabase.SaveAssets();
            Debug.Log("[VFXRM1] shared render assets patched");
        }

        static void PatchRenderer(string path)
        {
            var rd = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(path);
            var ppd = AssetDatabase.LoadAssetAtPath<PostProcessData>(PostProcessDataPath);
            var so = new SerializedObject(rd);
            so.FindProperty("postProcessData").objectReferenceValue = ppd;
            var features = so.FindProperty("m_RendererFeatures");
            bool hasDecal = false;
            for (int i = 0; i < features.arraySize; i++) if (features.GetArrayElementAtIndex(i).objectReferenceValue is DecalRendererFeature) hasDecal = true;
            if (!hasDecal)
            {
                var decal = ScriptableObject.CreateInstance<DecalRendererFeature>();
                decal.name = "DecalRendererFeature";
                AssetDatabase.AddObjectToAsset(decal, rd);
                features.arraySize++;
                features.GetArrayElementAtIndex(features.arraySize - 1).objectReferenceValue = decal;
            }
            // Same bookkeeping the renderer-data inspector does: local ids in m_RendererFeatureMap.
            var map = so.FindProperty("m_RendererFeatureMap");
            var ids = new List<long>();
            for (int i = 0; i < features.arraySize; i++)
            {
                var f = features.GetArrayElementAtIndex(i).objectReferenceValue;
                AssetDatabase.TryGetGUIDAndLocalFileIdentifier(f, out _, out long local);
                ids.Add(local);
            }
            map.arraySize = ids.Count;
            for (int i = 0; i < ids.Count; i++) map.GetArrayElementAtIndex(i).longValue = ids[i];
            so.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(rd);
        }
    }
}
