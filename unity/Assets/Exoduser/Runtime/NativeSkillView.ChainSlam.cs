using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkillView
    {
        // 원본 균열의 좌→우 reveal과 42개 암석. 지면과 떠오른 조각을 따로 그린다.
        sealed class CleaveMesh
        {
            public GameObject Go; public Mesh Mesh;
            public readonly List<Vector3> Vertices = new List<Vector3>();
            public readonly List<Vector2> Uv = new List<Vector2>();
            public readonly List<Color> Colors = new List<Color>();
            public readonly List<int> Triangles = new List<int>();
            public void Clear() { Vertices.Clear(); Uv.Clear(); Colors.Clear(); Triangles.Clear(); }
            public void Quad(Vector3 a, Vector3 b, Vector3 c, Vector3 d, Rect uv, Color color)
            {
                int n = Vertices.Count; Vertices.Add(a); Vertices.Add(b); Vertices.Add(c); Vertices.Add(d);
                Uv.Add(new Vector2(uv.xMin, uv.yMin)); Uv.Add(new Vector2(uv.xMax, uv.yMin)); Uv.Add(new Vector2(uv.xMax, uv.yMax)); Uv.Add(new Vector2(uv.xMin, uv.yMax));
                for (int j = 0; j < 4; j++) Colors.Add(color);
                Triangles.Add(n); Triangles.Add(n + 1); Triangles.Add(n + 2); Triangles.Add(n); Triangles.Add(n + 2); Triangles.Add(n + 3);
            }
            public void Apply() { Mesh.Clear(); Mesh.SetVertices(Vertices); Mesh.SetUVs(0, Uv); Mesh.SetColors(Colors); Mesh.SetTriangles(Triangles, 0); Mesh.RecalculateBounds(); }
            public void Destroy() { UnityEngine.Object.Destroy(Mesh); UnityEngine.Object.Destroy(Go); }
        }
        sealed class CleaveItem { public CleaveMesh Ground, Rubble, Shadow; }
        readonly Dictionary<int, CleaveItem> chainCleaves = new Dictionary<int, CleaveItem>();
        Material chainGroundMaterial, chainRubbleMaterial, chainShadowMaterial;
        Texture2D chainRubbleTexture;
        CleaveMesh NewCleaveMesh(string name, Material material, int order)
        {
            var go = new GameObject(name); go.transform.SetParent(parent, false);
            var mesh = new Mesh { name = name }; mesh.MarkDynamic(); go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = material; renderer.sortingOrder = order;
            return new CleaveMesh { Go = go, Mesh = mesh };
        }
        Material CleaveMaterial(Texture texture)
        {
            var material = new Material(alpha); material.mainTexture = texture;
            material.SetInt("_DepthTest", NativeRemodel3D.Active ? (int)UnityEngine.Rendering.CompareFunction.Always : (int)UnityEngine.Rendering.CompareFunction.LessEqual);
            return material;
        }
        static float CleaveLift(float t, float at) { float age = t - at; return age <= 0 || age >= 18 ? 0 : Mathf.Sin(age / 18 * Mathf.PI); }
        static Vector3 CleaveGround(float x, float y) { return Point(x, y) + (NativeRemodel3D.Active ? Vector3.up * .04f : Vector3.zero); }
        void UpdateChainSlamView(Simulation sim)
        {
            stale.Clear(); foreach (var id in chainCleaves.Keys) stale.Add(id);
            foreach (var wave in sim.ChainSlamWaves)
            {
                ActiveWaves++; stale.Remove(wave.Id);
                if (chainGroundMaterial == null)
                {
                    var texture = Resources.Load<Texture2D>("Art/vfx/skill_chain_earth_cleave");
                    chainRubbleTexture = Resources.Load<Texture2D>("Art/vfx/skill_chain_earth_rubble");
                    if (texture == null || chainRubbleTexture == null) throw new InvalidOperationException("기동파괴 원본 균열·암석 누락");
                    chainGroundMaterial = CleaveMaterial(texture); chainRubbleMaterial = CleaveMaterial(chainRubbleTexture); chainShadowMaterial = CleaveMaterial(Texture2D.whiteTexture);
                }
                if (!chainCleaves.TryGetValue(wave.Id, out var item))
                {
                    item = new CleaveItem { Ground = NewCleaveMesh("chainCleave" + wave.Id, chainGroundMaterial, -18750), Shadow = NewCleaveMesh("chainCleaveShadow" + wave.Id, chainShadowMaterial, -18740), Rubble = NewCleaveMesh("chainRubble" + wave.Id, chainRubbleMaterial, (int)wave.Y + 2) };
                    chainCleaves.Add(wave.Id, item);
                }
                item.Ground.Clear(); item.Rubble.Clear(); item.Shadow.Clear();
                float t = (float)wave.T, progress = t / (float)wave.MaxT, fade = progress < .55f ? 1 : Mathf.Max(0, (1 - progress) / .45f), travel = Mathf.Min(1, t / 10);
                for (int arm = -1; arm <= 1; arm++)
                {
                    float angle = (float)wave.Angle + arm * Mathf.PI / 7, c = Mathf.Cos(angle), s = Mathf.Sin(angle);
                    float height = (float)wave.HalfWidth * (arm == 0 ? 10.2f : 8.8f) * (1 + .08f * CleaveLift(t, 3));
                    float tip = Mathf.Min(travel, .06f), body = travel - tip;
                    for (int strip = 0; strip < 7; strip++)
                    {
                        float left = strip == 0 ? 0 : body + tip * (strip - 1) / 6, right = strip == 0 ? body : body + tip * strip / 6;
                        if (right <= left) continue;
                        float opacity = fade * .92f * (strip == 0 ? 1 : 1 - (strip - .5f) / 6 * Mathf.Min(1, (1 - travel) * 10));
                        Vector3 P(float along, float across) { return CleaveGround((float)wave.X + c * along - s * across, (float)wave.Y + s * along + c * across); }
                        item.Ground.Quad(P(left * (float)wave.MaxR, height / 2), P(right * (float)wave.MaxR, height / 2), P(right * (float)wave.MaxR, -height / 2), P(left * (float)wave.MaxR, -height / 2), new Rect(left, 0, right - left, 1), new Color(1, 1, 1, opacity));
                    }
                    for (int j = 1; j <= 7; j++) for (int side = -1; side <= 1; side += 2)
                    {
                        int seed = (j * 13 + (arm + 1) * 7 + (side + 1) * 3) % 19;
                        float f = j / 8f + (seed % 3 - 1) * .014f, distance = (float)wave.MaxR * f, bank = (float)wave.HalfWidth * (.62f + seed % 5 * .09f) * side, lift = CleaveLift(t, f * 10);
                        if (lift <= 0) continue;
                        float age = t - f * 10, settle = Mathf.Min(1, (18 - age) / 5), x = (float)wave.X + c * distance - s * bank - s * side * lift * (float)wave.HalfWidth * .34f, y = (float)wave.Y + s * distance + c * bank + c * side * lift * (float)wave.HalfWidth * .34f;
                        float z = ((float)wave.HalfWidth * .20f + 5 + seed % 3 * 2) * (.70f + .30f * lift), skew = (seed % 5 - 2) * .18f * z, hop = (float)wave.HalfWidth * .60f + 8 + seed % 7;
                        item.Shadow.Quad(CleaveGround(x - z * 1.25f, y), CleaveGround(x + skew, y - z * .28f), CleaveGround(x + z * 1.25f, y + z * .08f), CleaveGround(x - skew, y + z * .36f), new Rect(0, 0, 1, 1), new Color(16 / 255f, 12 / 255f, 9 / 255f, fade * settle * .28f));
                        float rw = z * 2.7f, rh = rw * (chainRubbleTexture.height / 2f) / (chainRubbleTexture.width / 4f);
                        Vector3 center = Point(x, y), rightVector = Vector3.right, upVector = Vector3.up;
                        if (NativeRemodel3D.Active) { center += Vector3.up * (lift * hop / 100); var camera = Camera.main; if (camera != null) { rightVector = camera.transform.right; upVector = camera.transform.up; } }
                        else center += Vector3.up * (lift * hop / 100);
                        Vector3 dx = rightVector * (rw / 200), dy = upVector * (rh / 200); int cell = seed % 8;
                        item.Rubble.Quad(center - dx - dy, center + dx - dy, center + dx + dy, center - dx + dy, new Rect(cell % 4 / 4f, 1 - (cell / 4 + 1) / 2f, .25f, .5f), new Color(1, 1, 1, fade * settle * .94f));
                    }
                }
                item.Ground.Apply(); item.Rubble.Apply(); item.Shadow.Apply();
            }
            foreach (var id in stale) { var item = chainCleaves[id]; item.Ground.Destroy(); item.Rubble.Destroy(); item.Shadow.Destroy(); chainCleaves.Remove(id); }
        }
        void ResetChainSlamView()
        {
            foreach (var item in chainCleaves.Values) { item.Ground.Destroy(); item.Rubble.Destroy(); item.Shadow.Destroy(); }
            chainCleaves.Clear();
            UnityEngine.Object.Destroy(chainGroundMaterial); UnityEngine.Object.Destroy(chainRubbleMaterial); UnityEngine.Object.Destroy(chainShadowMaterial);
            chainGroundMaterial = chainRubbleMaterial = chainShadowMaterial = null;
        }
    }
}
