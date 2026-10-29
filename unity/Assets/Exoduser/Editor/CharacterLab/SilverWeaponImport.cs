using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

// UCH-05 dagger. `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.SilverWeaponImport.Run -quit`
// Meshy dagger FBX -> URP/Lit material, scaled to 0.45 units overall length (with sheath), pivot at pommel top, blade along -Y, prefab. Idempotent.
namespace Exoduser.CharacterLab
{
    public static class SilverWeaponImport
    {
        public const string Dir = "Assets/Exoduser/Art/Characters/Silvertail/Weapon";
        public const string Fbx = Dir + "/Silvertail_Dagger.fbx";
        public const string MatPath = Dir + "/Silvertail_Dagger_Mat.mat";
        public const string PrefabPath = Dir + "/Silvertail_Dagger.prefab";
        public const float Length = 0.45f;

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
            var size = Measure(false, out _, out _);
            Debug.Log($"[DAGGER] bounds at scale 1: {size.ToString("F4")}");
            int axis = size.x > size.y ? (size.x > size.z ? 0 : 2) : (size.y > size.z ? 1 : 2);
            if (axis != 1) Debug.LogError("[DAGGER] long axis is not Y: " + axis);
            float scale = Length / size[axis];
            imp.globalScale = scale; imp.SaveAndReimport();

            // tip must point down (-Y): compare XZ spread of the top and bottom 12% of vertices
            Measure(false, out _, out bool tipUp);
            bool flip = tipUp;
            size = Measure(flip, out Vector3 top, out _);
            Debug.Log($"[DAGGER] globalScale={scale:F5} size={size.ToString("F4")} flipped={flip} pommelTop(local)={top.ToString("F4")}");

            var root = new GameObject("Silvertail_Dagger");
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.name = "Model"; inst.transform.SetParent(root.transform, false);
            inst.transform.localRotation = flip ? Quaternion.Euler(180f, 0f, 0f) : Quaternion.identity;
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
            var t = (TextureImporter)AssetImporter.GetAtPath($"{Dir}/Silvertail_Dagger_{n}.png");
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
            mat.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_Dagger_BaseColor.png")); mat.SetColor("_BaseColor", Color.white);
            mat.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_Dagger_Normal.png")); mat.SetFloat("_BumpScale", 1f); mat.EnableKeyword("_NORMALMAP");
            mat.SetTexture("_MetallicGlossMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Silvertail_Dagger_MetallicSmoothness.png")); mat.EnableKeyword("_METALLICSPECGLOSSMAP");
            mat.SetFloat("_Metallic", 1f); mat.SetFloat("_Smoothness", 1f); mat.SetFloat("_SmoothnessTextureChannel", 0f);
            mat.SetFloat("_Surface", 0f); mat.SetFloat("_Cull", 2f);
            EditorUtility.SetDirty(mat); AssetDatabase.SaveAssetIfDirty(mat);
            return mat;
        }

        // bounds of the FBX instance (optionally rotated 180 about X); top = (centre.x, max.y, centre.z); tipUp = narrow end is at +Y
        static Vector3 Measure(bool flip, out Vector3 top, out bool tipUp)
        {
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.transform.SetPositionAndRotation(Vector3.zero, flip ? Quaternion.Euler(180f, 0f, 0f) : Quaternion.identity);
            var pts = new System.Collections.Generic.List<Vector3>();
            foreach (var mf in inst.GetComponentsInChildren<MeshFilter>())
            { var l2w = mf.transform.localToWorldMatrix; foreach (var v in mf.sharedMesh.vertices) pts.Add(l2w.MultiplyPoint3x4(v)); }
            foreach (var s in inst.GetComponentsInChildren<SkinnedMeshRenderer>())
            { var m = new Mesh(); s.BakeMesh(m); foreach (var v in m.vertices) pts.Add(s.transform.TransformPoint(v)); Object.DestroyImmediate(m); }
            var b = new Bounds(pts[0], Vector3.zero); foreach (var p in pts) b.Encapsulate(p);
            top = new Vector3(b.center.x, b.max.y, b.center.z);
            float h = b.size.y, spreadTop = 0f, spreadBot = 0f;
            var tp = pts.Where(p => p.y > b.max.y - 0.12f * h).ToList(); var bp = pts.Where(p => p.y < b.min.y + 0.12f * h).ToList();
            if (tp.Count > 0) spreadTop = (tp.Max(p => p.x) - tp.Min(p => p.x)) * (tp.Max(p => p.z) - tp.Min(p => p.z));
            if (bp.Count > 0) spreadBot = (bp.Max(p => p.x) - bp.Min(p => p.x)) * (bp.Max(p => p.z) - bp.Min(p => p.z));
            tipUp = spreadTop < spreadBot;
            Debug.Log($"[DAGGER] end spreads top={spreadTop:F5} bottom={spreadBot:F5} flip={flip}");
            Object.DestroyImmediate(inst);
            return b.size;
        }

        static void Report()
        {
            var p = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            int tris = 0, verts = 0;
            foreach (var mf in p.GetComponentsInChildren<MeshFilter>()) { var m = mf.sharedMesh; verts += m.vertexCount; for (int i = 0; i < m.subMeshCount; i++) tris += (int)(m.GetIndexCount(i) / 3); }
            Debug.Log($"[DAGGER] prefab verts={verts} tris={tris} mat={AssetDatabase.LoadAssetAtPath<Material>(MatPath).shader.name}");
            Debug.Log("[DAGGER] import complete");
        }
    }
}
