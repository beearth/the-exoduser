using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;

// UCH-06 Ivan long gun. `Unity -batchmode -projectPath <proj> -executeMethod Exoduser.CharacterLab.IvanWeaponImport.Run -quit`
// Meshy gun FBX -> URP/Lit material, scaled to 1.25 units overall length, pivot at butt end, barrel along +Z, up = +Y. Idempotent.
namespace Exoduser.CharacterLab
{
    public static class IvanWeaponImport
    {
        public const string Dir = "Assets/Exoduser/Art/Characters/Ivan/Weapon";
        public const string Fbx = Dir + "/Ivan_Gun.fbx";
        public const string MatPath = Dir + "/Ivan_Gun_Mat.mat";
        public const string PrefabPath = Dir + "/Ivan_Gun.prefab";
        public const float Length = 1.25f;

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
            var verts = World();
            var size = Bounds(verts).size;
            Debug.Log($"[IVW] bounds at scale 1: {size.ToString("F4")}");
            int axis = size.x > size.y ? (size.x > size.z ? 0 : 2) : (size.y > size.z ? 1 : 2);
            float scale = Length / size[axis];
            imp.globalScale = scale; imp.SaveAndReimport();
            verts = World(); var b = Bounds(verts);
            Debug.Log($"[IVW] long axis={axis} globalScale={scale:F5} size={b.size.ToString("F4")}");

            // butt = end whose slice (8% of length) has the larger vertical (Y) extent (stock plate vs muzzle ring)
            float lo = b.min[axis], hi = b.max[axis], span = hi - lo, slice = span * 0.08f;
            Vector3 cLo = Vector3.zero, cHi = Vector3.zero; int nLo = 0, nHi = 0; float yLoMin = 9e9f, yLoMax = -9e9f, yHiMin = 9e9f, yHiMax = -9e9f;
            foreach (var v in verts)
            {
                if (v[axis] < lo + slice) { cLo += v; nLo++; yLoMin = Mathf.Min(yLoMin, v.y); yLoMax = Mathf.Max(yLoMax, v.y); }
                if (v[axis] > hi - slice) { cHi += v; nHi++; yHiMin = Mathf.Min(yHiMin, v.y); yHiMax = Mathf.Max(yHiMax, v.y); }
            }
            cLo /= nLo; cHi /= nHi;
            float eLo = yLoMax - yLoMin, eHi = yHiMax - yHiMin;
            bool buttIsHi = eHi > eLo;
            Vector3 butt = buttIsHi ? cHi : cLo, muzzle = buttIsHi ? cLo : cHi;
            // butt pivot: end plane position along axis, centre of the other axes from the bounds
            var pivot = b.center; pivot[axis] = buttIsHi ? hi : lo;
            var dir = new Vector3(); dir[axis] = buttIsHi ? -1f : 1f;
            Debug.Log($"[IVW] sliceExtentY lo={eLo:F4} hi={eHi:F4} buttIsHi={buttIsHi} pivot={pivot.ToString("F4")} barrelDir={dir}");
            var rot = Quaternion.FromToRotation(dir, Vector3.forward);

            var root = new GameObject("Ivan_Gun");
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.name = "Model"; inst.transform.SetParent(root.transform, false);
            inst.transform.localRotation = rot;
            inst.transform.localPosition = -(rot * pivot);
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
            var t = (TextureImporter)AssetImporter.GetAtPath($"{Dir}/Ivan_Gun_{n}.png");
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
            mat.SetTexture("_BaseMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_Gun_BaseColor.png")); mat.SetColor("_BaseColor", Color.white);
            mat.SetTexture("_BumpMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_Gun_Normal.png")); mat.SetFloat("_BumpScale", 1f); mat.EnableKeyword("_NORMALMAP");
            mat.SetTexture("_MetallicGlossMap", AssetDatabase.LoadAssetAtPath<Texture2D>(Dir + "/Ivan_Gun_MetallicSmoothness.png")); mat.EnableKeyword("_METALLICSPECGLOSSMAP");
            mat.SetFloat("_Metallic", 1f); mat.SetFloat("_Smoothness", 1f); mat.SetFloat("_SmoothnessTextureChannel", 0f);
            mat.SetFloat("_Surface", 0f); mat.SetFloat("_Cull", 2f);
            EditorUtility.SetDirty(mat); AssetDatabase.SaveAssetIfDirty(mat);
            return mat;
        }

        static Vector3[] World()
        {
            var inst = (GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Fbx));
            inst.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
            var list = new System.Collections.Generic.List<Vector3>();
            foreach (var mf in inst.GetComponentsInChildren<MeshFilter>())
            {
                var l2w = mf.transform.localToWorldMatrix;
                foreach (var v in mf.sharedMesh.vertices) list.Add(l2w.MultiplyPoint3x4(v));
            }
            Object.DestroyImmediate(inst);
            return list.ToArray();
        }

        static Bounds Bounds(Vector3[] vs)
        {
            var b = new Bounds(vs[0], Vector3.zero);
            foreach (var v in vs) b.Encapsulate(v);
            return b;
        }

        static void Report()
        {
            var p = AssetDatabase.LoadAssetAtPath<GameObject>(PrefabPath);
            int tris = 0, verts = 0;
            foreach (var mf in p.GetComponentsInChildren<MeshFilter>()) { var m = mf.sharedMesh; verts += m.vertexCount; for (int i = 0; i < m.subMeshCount; i++) tris += (int)(m.GetIndexCount(i) / 3); }
            Debug.Log($"[IVW] prefab verts={verts} tris={tris} mat={AssetDatabase.LoadAssetAtPath<Material>(MatPath).shader.name}");
            Debug.Log("[IVW] import complete");
        }
    }
}
