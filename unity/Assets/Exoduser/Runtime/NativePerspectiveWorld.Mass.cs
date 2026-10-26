using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Authored view masses. Source of truth (Godot, origin/main):
    //  - rectangles: godot/data/map.json "collision_rects" (292, index order = native_wall_rect_%04d), godot/scripts/world.gd:1086-1100
    //    get_native_floor_wall_packet: ground_footprint = TL,TR,BR,BL of [x,y,w,h]. Exported once to Resources/Data/ch1_view_masses.json
    //    (the rect set covers exactly the 19,755 solid tiles of ch1_map.json; verified at export time).
    //  - height: godot/port_modules/map_resource/wall_draw_owner.gd:43-49 AUTHORED_VIEW_HEIGHT_DEFAULT = 80 (view-only, never physical),
    //    applied at :337 view_height = _authored_view_height(id).
    //  - material: wall_draw_owner.gd:53-61 selection m_c1bw -> godot/scripts/world.gd:525 assets/map/ch1/collision/bound_w.png (914x1800).
    //  - stage 2 visual mesh: the same 292 authored rectangles and texture, tessellated at 40 px; only exposed
    //    sides are drawn. MassTerrainProfile adds continuous visual relief without changing collision or routes.
    public sealed partial class NativePerspectiveWorld
    {
        [Serializable] sealed class MassData { public string schema, source, sourceSha256, viewHeightBasis, materialKey, textureResource, textureSource; public int tileSize, count; public float viewHeight; public int[] rects; }

        readonly List<GameObject> massObjects = new List<GameObject>();
        Material massMaterial;
        Texture2D massTexture;
        MassTerrainProfile massProfile;
        public float MaxMassHeight { get; private set; }
        public string MassTextureResource { get; private set; }

        void BuildMasses()
        {
            var asset = Resources.Load<TextAsset>("Data/ch1_view_masses");
            if (asset == null) throw new InvalidOperationException("Original view mass data is missing");
            var data = JsonUtility.FromJson<MassData>(asset.text);
            if (data.rects == null || data.rects.Length != data.count * 4 || data.viewHeight <= 0f || data.tileSize != Map.tileSize) throw new InvalidOperationException("Invalid view mass data");
            massTexture = Resources.Load<Texture2D>(data.textureResource);
            if (massTexture == null) throw new InvalidOperationException("Missing mass texture " + data.textureResource);
            massTexture.wrapMode = TextureWrapMode.Repeat; // native_perspective_view.gd:582 texture_repeat = true (runtime property, importer untouched)
            MassTextureResource = data.textureResource;
            massMaterial = new Material(litMaterial) { name = "Look3DLit(mass)" };
            massMaterial.SetTexture("_MainTex", massTexture); massMaterial.SetColor("_Color", new Color(0.70f, 0.66f, 0.64f, 1f)); massMaterial.SetFloat("_Cutoff", 0.1f);
            massProfile = new MassTerrainProfile(Map.width, Map.height, data.tileSize, data.rects, data.viewHeight);
            int solidTiles = 0;
            for (int i = 0; i < Map.tiles.Length; i++)
            {
                bool sourceSolid = Map.tiles[i] == 1;
                if (sourceSolid) solidTiles++;
                if (massProfile.IsSolidTile(i % Map.width, i / Map.width) != sourceSolid)
                    throw new InvalidOperationException("View mass footprint differs from source collision at tile " + i);
            }
            if (massProfile.SolidTileCount != solidTiles) throw new InvalidOperationException("View mass tile count differs from source collision");
            MaxMassHeight = data.viewHeight + 181f; // 150 px inward rise + 31 px analytic wave bound
            for (int i = 0; i < data.count; i++)
            {
                var go = new GameObject("native_wall_rect_" + i.ToString("0000")); go.transform.SetParent(massRoot, false);
                go.AddComponent<MeshFilter>().sharedMesh = MassMesh(data.rects[i * 4], data.rects[i * 4 + 1], data.rects[i * 4 + 2], data.rects[i * 4 + 3], data.tileSize, massTexture.width, massTexture.height);
                var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = massMaterial;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false; // stage 1: shadows off
                massObjects.Add(go);
            }
        }

        // Visual mesh only. Source tile/collider data is never edited; tessellation follows the exact authored tile grid.
        Mesh MassMesh(int x, int y, int w, int h, int tileSize, float textureWidth, float textureHeight)
        {
            var vertices = new List<Vector3>(); var normals = new List<Vector3>(); var uvs = new List<Vector2>(); var triangles = new List<int>();
            for (int py = y; py < y + h; py += tileSize)
            {
                for (int px = x; px < x + w; px += tileSize)
                {
                    int qx = px + tileSize, qy = py + tileSize;
                    int tx = px / tileSize, ty = py / tileSize;
                    var a = Unity(px, massProfile.HeightAt(px, py), py);
                    var b = Unity(qx, massProfile.HeightAt(qx, py), py);
                    var c = Unity(qx, massProfile.HeightAt(qx, qy), qy);
                    var d = Unity(px, massProfile.HeightAt(px, qy), qy);
                    AppendMassQuad(vertices, normals, uvs, triangles, a, b, c, d, true, textureWidth, textureHeight);
                    if (massProfile.HasExposedSide(tx, ty, 0, -1)) AppendMassQuad(vertices, normals, uvs, triangles,
                        Unity(px, 0, py), Unity(qx, 0, py), b, a, false, textureWidth, textureHeight);
                    if (massProfile.HasExposedSide(tx, ty, 1, 0)) AppendMassQuad(vertices, normals, uvs, triangles,
                        Unity(qx, 0, py), Unity(qx, 0, qy), c, b, false, textureWidth, textureHeight);
                    if (massProfile.HasExposedSide(tx, ty, 0, 1)) AppendMassQuad(vertices, normals, uvs, triangles,
                        Unity(qx, 0, qy), Unity(px, 0, qy), d, c, false, textureWidth, textureHeight);
                    if (massProfile.HasExposedSide(tx, ty, -1, 0)) AppendMassQuad(vertices, normals, uvs, triangles,
                        Unity(px, 0, qy), Unity(px, 0, py), a, d, false, textureWidth, textureHeight);
                }
            }
            var mesh = new Mesh { name = "Organic mass" };
            mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
            mesh.SetVertices(vertices); mesh.SetNormals(normals); mesh.SetUVs(0, uvs); mesh.SetTriangles(triangles, 0);
            mesh.RecalculateBounds();
            return mesh;
        }

        void AppendMassQuad(List<Vector3> vertices, List<Vector3> normals, List<Vector2> uvs, List<int> triangles,
            Vector3 a, Vector3 b, Vector3 c, Vector3 d, bool top, float textureWidth, float textureHeight)
        {
            int first = vertices.Count;
            var faceNormal = Vector3.Cross(b - a, c - a).normalized;
            foreach (var p in new[] { a, b, c, d })
            {
                vertices.Add(p);
                if (top)
                {
                    float py = -p.z;
                    float dx = (massProfile.HeightAt(p.x + 1, py) - massProfile.HeightAt(p.x - 1, py)) * 0.5f;
                    float dy = (massProfile.HeightAt(p.x, py + 1) - massProfile.HeightAt(p.x, py - 1)) * 0.5f;
                    normals.Add(new Vector3(-dx, 1f, dy).normalized);
                    uvs.Add(new Vector2(p.x / textureWidth, 1f - py / textureHeight));
                }
                else
                {
                    normals.Add(faceNormal);
                    float along = Mathf.Abs(a.x - b.x) < 0.01f ? -p.z : p.x;
                    uvs.Add(new Vector2(along / textureWidth, 1f + p.y / textureHeight));
                }
            }
            triangles.Add(first); triangles.Add(first + 1); triangles.Add(first + 2);
            triangles.Add(first); triangles.Add(first + 2); triangles.Add(first + 3);
        }
    }
}
