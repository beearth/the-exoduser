using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

// UCH-03a. `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.WeaponImport.Run -quit`
// Meshy greatsword FBX -> URP/Lit material, scaled to 1.60 units overall length, pivot at pommel top, prefab. Idempotent.
namespace Exoduser.CharacterLab
{
    public static class WeaponImport
    {
        public const string Dir = "Assets/Exoduser/Art/Characters/Warrior/Weapon";
        public const string Fbx = Dir + "/Warrior_Greatsword.fbx";
        public const string MatPath = Dir + "/Warrior_Greatsword_Mat.mat";
        public const string PrefabPath = Dir + "/Warrior_Greatsword.prefab";
        public const float Length = 1.60f;

        public static void Run()
        {
            AssetDatabase.Refresh();
            Tex("BaseColor", TextureImporterType.Default, true);
            Tex("Normal", TextureImporterType.NormalMap, false);
            Tex("MetallicSmoothness", TextureImporterType.Default, false);
            var mat = SetupMaterial();

            var imp = (ModelImporter)AssetImporter.GetAtPath(Fbx);
            imp.globalScale = 1f; imp.isReadable = false; imp.meshCompression = ModelImporterMeshCompression.Off;
            imp.materialImportMode = ModelImporterMaterialImportMode.None; imp.importBlendShapes = false;
            imp.animationType = ModelImporterAnimationType.None; imp.importAnimation = false;
            imp.SaveAndReimport();
            var size = Measure(out _);
            Debug.Log($"[WEAPON] bounds at scale 1: {size.ToString("F4")}");
            int axis = size.x > size.y ? (size.x > size.z ? 0 : 2) : (size.y > size.z ? 1 : 2);
            if (axis != 1) Debug.LogError("[WEAPON] long axis is not Y: " + axis);
            float scale = Length / size[axis];
            imp.globalScale = scale; imp.SaveAndReimport();
            size = Measure(out Vector3 top);
            Debug.Log($"[WEAPON] globalScale={scale:F5} size={size.ToString("F4")} pommelTop(local center)={top.ToString("F4")}");

            // prefab: root at pommel top, child = model offset so that pommel top (max Y, centre x/z) == root origin
            var root = new GameObject("Warrior_Greatsword");
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.name = "Model"; inst.transform.SetParent(root.transform, false);
            inst.transform.localPosition = -top;
            foreach (var r in inst.GetComponentsInChildren<Renderer>(true))
            {
                var ms = new Material[Mathf.Max(1, r.sharedMaterials.Length)];
                for (int i = 0; i < ms.Length; i++) ms[i] = mat;
                r.sharedMaterials = ms;
            }
            PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
            Object.DestroyImmediate(root);
            Report();
        }

        static void Tex(string n, TextureImporterType type, bool srgb)
        {
            var t = (TextureImporter)AssetImporter.GetAtPath($"{Dir}/Warrior_Greatsword_{n}.png");
            t.textureType = type; t.sRGBTexture = srgb; t.mipmapEnabled = true; t.maxTextureSize = 2048;
            t.textureCompression = TextureImporterCompression.CompressedHQ;
            if (n == "MetallicSmoothness") { t.alphaSource = TextureImporterAlphaSource.FromInput; t.alphaIsTransparency = false; }
            else if (n == "BaseColor") t.alphaSource = TextureImporterAlphaSource.None;
            t.SaveAndReimport();
        }

        static Material SetupMaterial()
        {
            var mat = AssetDatabase.LoadAssetAtPath<Material>(MatPath);
            if (mat == null) { mat = new Material(Shader.Find("Universal Render Pipeline/Lit")); AssetDatabase.CreateAsset(mat, MatPath); }
            mat.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Warrior_Greatsword_BaseColor.png")); mat.SetColor("_BaseColor", Color.white);
            mat.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Warrior_Greatsword_Normal.png")); mat.SetFloat("_BumpScale", 1f); mat.EnableKeyword("_NORMALMAP");
            mat.SetTexture("_MetallicGlossMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Warrior_Greatsword_MetallicSmoothness.png")); mat.EnableKeyword("_METALLICSPECGLOSSMAP");
            mat.SetFloat("_Metallic", 1f); mat.SetFloat("_Smoothness", 1f); mat.SetFloat("_SmoothnessTextureChannel", 0f);
            mat.SetFloat("_Surface", 0f); mat.SetFloat("_Cull", 2f);
            EditorUtility.SetDirty(mat); AssetDatabase.SaveAssetIfDirty(mat);
            return mat;
        }

        // bounds of the FBX instance at identity transform; top = (centre.x, max.y, centre.z)
        static Vector3 Measure(out Vector3 top)
        {
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
            Bounds b = default; bool first = true;
            foreach (var mf in inst.GetComponentsInChildren<MeshFilter>())
            {
                var m = mf.sharedMesh; var l2w = mf.transform.localToWorldMatrix;
                foreach (var v in m.vertices) { var w = l2w.MultiplyPoint3x4(v); if (first) { b = new Bounds(w, Vector3.zero); first = false; } else b.Encapsulate(w); }
            }
            foreach (var s in inst.GetComponentsInChildren<SkinnedMeshRenderer>())
            {
                var m = new Mesh(); s.BakeMesh(m);
                foreach (var v in m.vertices) { var w = s.transform.TransformPoint(v); if (first) { b = new Bounds(w, Vector3.zero); first = false; } else b.Encapsulate(w); }
                Object.DestroyImmediate(m);
            }
            top = new Vector3(b.center.x, b.max.y, b.center.z);
            Object.DestroyImmediate(inst);
            return b.size;
        }

        static void Report()
        {
            var p = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            int tris = 0, verts = 0;
            foreach (var mf in p.GetComponentsInChildren<MeshFilter>()) { var m = mf.sharedMesh; verts += m.vertexCount; for (int i = 0; i < m.subMeshCount; i++) tris += (int)(m.GetIndexCount(i) / 3); }
            Debug.Log($"[WEAPON] prefab verts={verts} tris={tris} mat={AssetDatabase.LoadAssetAtPath<Material>(MatPath).shader.name}");
            Debug.Log("[WEAPON] import complete");
        }
    }
}
