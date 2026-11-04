#if UNITY_EDITOR
using System;
using System.Globalization;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public static class A2RSwampDressEditor
    {
        [Serializable] sealed class Receipt
        {
            public string scope = "Actual Unity Editor mesh/asset checks; not a Player screen or visual approval";
            public string unityVersion;
            public bool passed, playerRun = false, visualVerified = false;
            public float heroHeight = 1.61f, minWidth, maxWidth, minAlpha10Width, minShoreNormalY = 1, fleshTopNormalY, boneTopNormalY;
            public int segments, vertices, triangles, unchangedMovementQueries;
        }

        public static void VerifyAndBake()
        {
            string output = "I:/EXODUSER-Storage/codex-takeover/map-swamp/editor-current";
            Directory.CreateDirectory(output);
            var data = JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text);
            var field = new A2FieldLayout(data); var map = new SourceMap(data); var before = new bool[40000];
            for (int i = 0; i < before.Length; i++) before[i] = map.CanMove((i % 200 + .5f) * 40, (i / 200 + .5f) * 40, 20);
            var contours = A2RSwampDressGeometry.Contours(field.TerrainHeight, .4f, -79.6f, 79.6f, -.4f, .4f, -.46f);
            var mesh = A2RSwampDress.CreateShoreMesh(field, -.45f, contours);
            try
            {
                var v = mesh.vertices; var c = mesh.colors;
                var result = new Receipt { unityVersion = Application.unityVersion, segments = contours.Count,
                    vertices = v.Length, triangles = mesh.triangles.Length / 3, minWidth = float.PositiveInfinity,
                    minAlpha10Width = float.PositiveInfinity };
                if (v.Length != contours.Count * 10 || contours.Count == 0) throw new InvalidOperationException("Shore strip topology missing");
                for (int first = 0; first < v.Length; first += 10) for (int end = 0; end < 2; end++)
                {
                    Vector2 a = XZ(v[first + end]), b = XZ(v[first + 8 + end]);
                    float width = Vector2.Distance(a, b);
                    Vector2 low = Vector2.Lerp(a, XZ(v[first + 2 + end]), .1f / c[first + 2 + end].a);
                    Vector2 high = Vector2.Lerp(XZ(v[first + 6 + end]), b, (c[first + 6 + end].a - .1f) / c[first + 6 + end].a);
                    result.minWidth = Mathf.Min(result.minWidth, width); result.maxWidth = Mathf.Max(result.maxWidth, width);
                    result.minAlpha10Width = Mathf.Min(result.minAlpha10Width, Vector2.Distance(low, high));
                    if (width < result.heroHeight || Vector2.Distance(low, high) < result.heroHeight)
                        throw new InvalidOperationException("Actual shore transition is below 1H");
                    if (c[first + end].a != 0 || c[first + 8 + end].a != 0) throw new InvalidOperationException("Shore must feather at both ends");
                }
                for (int i = 0; i < before.Length; i++)
                {
                    if (before[i] != map.CanMove((i % 200 + .5f) * 40, (i / 200 + .5f) * 40, 20)) throw new InvalidOperationException("Movement query changed");
                    result.unchangedMovementQueries++;
                }
                foreach (var normal in mesh.normals) result.minShoreNormalY = Mathf.Min(result.minShoreNormalY, normal.y);
                if (result.minShoreNormalY < 0) throw new InvalidOperationException("Bank top normals face downward");
                result.fleshTopNormalY = RemainsTopNormalY(false); result.boneTopNormalY = RemainsTopNormalY(true);
                if (result.fleshTopNormalY < .5f || result.boneTopNormalY < .5f) throw new InvalidOperationException("Remains top normals face inward/downward");
                using (var writer = new StreamWriter(Path.Combine(output, "shoreline.obj"), false, new System.Text.UTF8Encoding(false)))
                {
                    writer.WriteLine("# Unity-generated shoreline in metres; static geometry, not a game screenshot");
                    foreach (var p in v) writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "v {0:R} {1:R} {2:R}", p.x, p.y, p.z));
                    var indices = mesh.triangles;
                    for (int i = 0; i < indices.Length; i += 3) writer.WriteLine("f " + (indices[i] + 1) + " " + (indices[i + 1] + 1) + " " + (indices[i + 2] + 1));
                }
                var image = new Texture2D(512, 64, TextureFormat.RGB24, false, true);
                try
                {
                    var pixels = new Color[512 * 64];
                    for (int x = 0; x < 512; x++)
                    {
                        float distance = x / 511f * result.minWidth; int row = 0;
                        while (row < 3 && Vector2.Distance(XZ(v[0]), XZ(v[(row + 1) * 2])) < distance) row++;
                        float from = Vector2.Distance(XZ(v[0]), XZ(v[row * 2])), to = Vector2.Distance(XZ(v[0]), XZ(v[(row + 1) * 2]));
                        float alpha = Mathf.Lerp(c[row * 2].a, c[(row + 1) * 2].a, Mathf.InverseLerp(from, to, distance));
                        for (int y = 0; y < 64; y++) pixels[y * 512 + x] = new Color(alpha, alpha, alpha);
                    }
                    image.SetPixels(pixels); image.Apply(); File.WriteAllBytes(Path.Combine(output, "shore-alpha.png"), image.EncodeToPNG());
                }
                finally { UnityEngine.Object.DestroyImmediate(image); }
                result.passed = true;
                File.WriteAllText(Path.Combine(output, "shore-check.json"), JsonUtility.ToJson(result, true));
                Debug.Log("A2R_SWAMP_SHORE_PASS minWidth=" + result.minWidth + " minAlpha10Width=" + result.minAlpha10Width + " H=" + result.heroHeight + " movement=" + result.unchangedMovementQueries);
            }
            finally { UnityEngine.Object.DestroyImmediate(mesh); }
        }
        static float RemainsTopNormalY(bool bone)
        {
            var mesh = A2RSwampDress.CreateRemainsMesh(bone, 0);
            try { var v = mesh.vertices; int top = 0; for (int i = 1; i < v.Length; i++) if (v[i].y > v[top].y) top = i; return mesh.normals[top].y; }
            finally { UnityEngine.Object.DestroyImmediate(mesh); }
        }
        static Vector2 XZ(Vector3 p) { return new Vector2(p.x, p.z); }
    }
}
#endif
