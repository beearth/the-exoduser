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
    //  - mesh/UV: godot/scripts/native_perspective_view.gd:545-590 _build_mass_mesh (top + 4 sides; UV = world / texture size,
    //    texture_repeat, alpha scissor .1). No arbitrary height or terrain is introduced.
    public sealed partial class NativePerspectiveWorld
    {
        [Serializable] sealed class MassData { public string schema, source, sourceSha256, viewHeightBasis, materialKey, textureResource, textureSource; public int tileSize, count; public float viewHeight; public int[] rects; }

        readonly List<GameObject> massObjects = new List<GameObject>();
        Material massMaterial;
        int[] massRects; // [x,y,w,h]*292, simulation px (collision_rects), also drawn by the QA overlay
        Texture2D massTexture;
        public float MaxMassHeight { get; private set; }
        public string MassTextureResource { get; private set; }

        void BuildMasses()
        {
            var asset = Resources.Load<TextAsset>("Data/ch1_view_masses");
            if (asset == null) throw new InvalidOperationException("Original view mass data is missing");
            var data = JsonUtility.FromJson<MassData>(asset.text);
            if (data.rects == null || data.rects.Length != data.count * 4 || data.viewHeight <= 0f) throw new InvalidOperationException("Invalid view mass data");
            massTexture = Resources.Load<Texture2D>(data.textureResource);
            if (massTexture == null) throw new InvalidOperationException("Missing mass texture " + data.textureResource);
            massTexture.wrapMode = TextureWrapMode.Repeat; // native_perspective_view.gd:582 texture_repeat = true (runtime property, importer untouched)
            MassTextureResource = data.textureResource;
            massMaterial = new Material(litMaterial) { name = "Look3DLit(mass)" };
            massMaterial.SetTexture("_MainTex", massTexture); massMaterial.SetColor("_Color", Color.white); massMaterial.SetFloat("_Cutoff", 0.1f);
            MaxMassHeight = data.viewHeight; massRects = data.rects;
            for (int i = 0; i < data.count; i++)
            {
                var go = new GameObject("native_wall_rect_" + i.ToString("0000")); go.transform.SetParent(massRoot, false);
                go.AddComponent<MeshFilter>().sharedMesh = MassMesh(data.rects[i * 4], data.rects[i * 4 + 1], data.rects[i * 4 + 2], data.rects[i * 4 + 3], data.viewHeight, massTexture.width, massTexture.height);
                var renderer = go.AddComponent<MeshRenderer>(); renderer.sharedMaterial = massMaterial;
                renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.TwoSided; renderer.receiveShadows = true; // masses cast DOUBLE_SIDED (look_3d_variant.gd:230-231)
                massObjects.Add(go);
            }
        }

        // native_perspective_view.gd:545-590, Godot coordinates (x, y_up, z=px_y) converted to Unity (x, y, -z) at the end.
        static Mesh MassMesh(float x, float y, float w, float h, float height, float textureWidth, float textureHeight)
        {
            var bottom = new[] { new Vector3(x, 0, y), new Vector3(x + w, 0, y), new Vector3(x + w, 0, y + h), new Vector3(x, 0, y + h) };
            var top = new[] { new Vector3(x, height, y), new Vector3(x + w, height, y), new Vector3(x + w, height, y + h), new Vector3(x, height, y + h) };
            var quads = new List<Vector3[]> { new[] { top[0], top[1], top[2], top[3] } };
            for (int i = 0; i < 4; i++) quads.Add(new[] { bottom[i], bottom[(i + 1) % 4], top[(i + 1) % 4], top[i] });
            var vertices = new List<Vector3>(); var normals = new List<Vector3>(); var uvs = new List<Vector2>(); var triangles = new List<int>();
            foreach (var q in quads)
            {
                var normal = Vector3.Cross(q[1] - q[0], q[2] - q[0]).normalized;
                int baseIndex = vertices.Count;
                foreach (var p in q)
                {
                    Vector2 godotUv;
                    if (Mathf.Abs(normal.y) > 0.5f) godotUv = new Vector2(p.x / textureWidth, p.z / textureHeight);
                    else if (Mathf.Abs(normal.x) > 0.5f) godotUv = new Vector2(p.z / textureWidth, -p.y / textureHeight);
                    else godotUv = new Vector2(p.x / textureWidth, -p.y / textureHeight);
                    vertices.Add(new Vector3(p.x, p.y, -p.z));
                    normals.Add(new Vector3(normal.x, normal.y, -normal.z));
                    uvs.Add(new Vector2(godotUv.x, 1f - godotUv.y)); // Godot v grows downward; Unity v grows upward
                }
                triangles.AddRange(new[] { baseIndex, baseIndex + 1, baseIndex + 2, baseIndex, baseIndex + 2, baseIndex + 3 });
            }
            var mesh = new Mesh { name = "Mass" };
            mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
            mesh.SetVertices(vertices); mesh.SetNormals(normals); mesh.SetUVs(0, uvs); mesh.SetTriangles(triangles, 0);
            mesh.RecalculateBounds();
            return mesh;
        }
    }
}
