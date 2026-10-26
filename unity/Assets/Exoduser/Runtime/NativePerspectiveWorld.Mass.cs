using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // S2 visual volume. The 292 authored rectangles still define the exact 19,755 collision-solid tiles;
    // only their appearance changes. Tops reuse the streamed baked CH1 chunk image, then rise smoothly
    // inward from the original ground so the boundary has no rectangular cap or per-tile cut faces.
    public sealed partial class NativePerspectiveWorld
    {
        [Serializable] sealed class MassData
        {
            public string schema, source, sourceSha256, viewHeightBasis, materialKey, textureResource, textureSource;
            public int tileSize, count; public float viewHeight; public int[] rects;
        }

        MassTerrainProfile massProfile;
        int authoredMassCount;
        public float MaxMassHeight { get; private set; }
        public string MassTextureResource { get; private set; }

        void BuildMasses()
        {
            var asset = Resources.Load<TextAsset>("Data/ch1_view_masses");
            if (asset == null) throw new InvalidOperationException("Original view mass data is missing");
            var data = JsonUtility.FromJson<MassData>(asset.text);
            if (data.rects == null || data.rects.Length != data.count * 4 || data.viewHeight <= 0f || data.tileSize != Map.tileSize)
                throw new InvalidOperationException("Invalid view mass data");
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
            authoredMassCount = data.count;
            MaxMassHeight = data.viewHeight + 181f; // 150 px inward rise + 31 px analytic wave bound
            MassTextureResource = "Art/map/production_finish/chunk_*"; // the same per-chunk image as the baked floor
        }

        GameObject CreateMassTop(MapChunk chunk, Texture2D texture, int index)
        {
            int tile = Map.tileSize;
            int tx0 = Mathf.CeilToInt(chunk.x / tile), ty0 = Mathf.CeilToInt(chunk.y / tile);
            int tx1 = Mathf.FloorToInt((chunk.x + chunk.width) / tile), ty1 = Mathf.FloorToInt((chunk.y + chunk.height) / tile);
            var vertices = new List<Vector3>(); var normals = new List<Vector3>(); var uvs = new List<Vector2>(); var triangles = new List<int>();
            for (int ty = ty0; ty < ty1; ty++) for (int tx = tx0; tx < tx1; tx++)
            {
                if (!massProfile.IsSolidTile(tx, ty)) continue;
                float px = tx * tile, py = ty * tile, qx = px + tile, qy = py + tile;
                var quad = new[]
                {
                    Unity(px, massProfile.HeightAt(px, py), py), Unity(qx, massProfile.HeightAt(qx, py), py),
                    Unity(qx, massProfile.HeightAt(qx, qy), qy), Unity(px, massProfile.HeightAt(px, qy), qy)
                };
                int first = vertices.Count;
                foreach (var p in quad)
                {
                    float sourceY = -p.z;
                    vertices.Add(p);
                    float dx = (massProfile.HeightAt(p.x + 1, sourceY) - massProfile.HeightAt(p.x - 1, sourceY)) * 0.5f;
                    float dy = (massProfile.HeightAt(p.x, sourceY + 1) - massProfile.HeightAt(p.x, sourceY - 1)) * 0.5f;
                    normals.Add(new Vector3(-dx, 1f, dy).normalized);
                    uvs.Add(new Vector2((chunk.sx + (p.x - chunk.x) * chunk.sw / chunk.width) / texture.width,
                        1f - (chunk.sy + (sourceY - chunk.y) * chunk.sh / chunk.height) / texture.height));
                }
                triangles.Add(first); triangles.Add(first + 1); triangles.Add(first + 2);
                triangles.Add(first); triangles.Add(first + 2); triangles.Add(first + 3);
            }
            if (vertices.Count == 0) return null;
            var mesh = new Mesh { name = "Baked organic mass top " + index };
            mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
            mesh.SetVertices(vertices); mesh.SetNormals(normals); mesh.SetUVs(0, uvs); mesh.SetTriangles(triangles, 0); mesh.RecalculateBounds();
            var go = new GameObject(mesh.name); go.transform.SetParent(massRoot, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = litMaterial;
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; renderer.receiveShadows = false;
            var block = new MaterialPropertyBlock(); block.SetTexture("_MainTex", texture); block.SetColor("_Color", Color.white); block.SetFloat("_Cutoff", 0f);
            renderer.SetPropertyBlock(block);
            return go;
        }
    }
}
