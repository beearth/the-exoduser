using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Explicit ground effects bypass actor billboarding. The original sprite remains the
    // source of art, tint, opacity and pooling state; only its 3D display is a surface mesh.
    [DisallowMultipleComponent]
    public sealed class NativeGroundSkillSurface : MonoBehaviour
    {
        static readonly Dictionary<SpriteRenderer, NativeGroundSkillSurface> registered = new Dictionary<SpriteRenderer, NativeGroundSkillSurface>();
        static readonly Func<float, float, float> sampleHeight = NativeRemodel3D.GroundY;
        static readonly int MainTex = Shader.PropertyToID("_MainTex");
        SpriteRenderer source;
        GameObject surface;
        Mesh mesh;
        MeshRenderer draw;
        Vector3[] vertices;
        Vector2[] uv;
        Color[] colors;
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        Sprite uvSprite;
        bool ground, forced, priorForceOff, uvFlipX, uvFlipY;

        public static void Mark(SpriteRenderer sprite, bool isGround = true)
        {
            if (sprite == null) return;
            NativeGroundSkillSurface entry;
            if (!registered.TryGetValue(sprite, out entry) || entry == null)
            {
                if (!isGround) return;
                entry = sprite.gameObject.AddComponent<NativeGroundSkillSurface>();
                entry.Initialize(sprite);
                registered[sprite] = entry;
            }
            entry.ground = isGround;
            if (!isGround) entry.RestoreSprite();
        }

        // Called before the generic enabled/sprite checks, so a pooled sprite that was
        // disabled this frame also disables its last ground mesh.
        public static bool Project(SpriteRenderer sprite)
        {
            NativeGroundSkillSurface entry;
            if (!registered.TryGetValue(sprite, out entry) || entry == null || !entry.ground) return false;
            entry.Sync();
            return true;
        }

        public static void RestoreAll()
        {
            foreach (var entry in registered.Values) if (entry != null) entry.RestoreSprite();
        }

        void Initialize(SpriteRenderer sprite)
        {
            source = sprite;
            surface = new GameObject("Ground skill surface");
            surface.transform.SetParent(transform, false);
            surface.layer = gameObject.layer;
            draw = surface.AddComponent<MeshRenderer>();
            draw.enabled = false;
            draw.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            draw.receiveShadows = false;
            int n = NativeGroundSkillGeometry.Segments, side = n + 1;
            vertices = new Vector3[side * side]; uv = new Vector2[side * side]; colors = new Color[side * side];
            var triangles = new int[n * n * 6]; int k = 0;
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                int a = y * side + x, b = a + 1, c = a + side, d = c + 1;
                triangles[k++] = a; triangles[k++] = c; triangles[k++] = b;
                triangles[k++] = b; triangles[k++] = c; triangles[k++] = d;
            }
            mesh = new Mesh { name = "Terrain-conforming ground effect" }; mesh.MarkDynamic();
            mesh.vertices = vertices; mesh.triangles = triangles;
            surface.AddComponent<MeshFilter>().sharedMesh = mesh;
        }

        void Sync()
        {
            if (!NativeRemodel3D.Active) { RestoreSprite(); return; }
            if (!forced) { priorForceOff = source.forceRenderingOff; source.forceRenderingOff = true; forced = true; }
            bool visible = source.enabled && source.sprite != null && source.gameObject.activeInHierarchy && !priorForceOff;
            draw.enabled = visible;
            if (!visible) return;
            var sprite = source.sprite; var rect = sprite.rect; var texture = sprite.texture;
            draw.sharedMaterial = source.sharedMaterial;
            draw.sortingLayerID = source.sortingLayerID; draw.sortingOrder = source.sortingOrder;
            surface.layer = source.gameObject.layer;
            // Preserve per-renderer _Opacity and other original overrides as well as the
            // exact atlas cell. Treating the entire ward sheet as one texture mixes mine/trap art.
            source.GetPropertyBlock(block); block.SetTexture(MainTex, texture); draw.SetPropertyBlock(block);
            int n = NativeGroundSkillGeometry.Segments, side = n + 1;
            bool updateUv = uvSprite != sprite || uvFlipX != source.flipX || uvFlipY != source.flipY;
            var anchor = source.transform.position; var scale = source.transform.lossyScale;
            // A just-created zone deploys from zero size. Its inverse transform is
            // singular at that instant, and the original zero-size sprite is invisible.
            if (Mathf.Abs(scale.x) < .000001f || Mathf.Abs(scale.y) < .000001f) { draw.enabled = false; return; }
            double angle = source.transform.eulerAngles.z * Mathf.Deg2Rad;
            for (int y = 0; y <= n; y++) for (int x = 0; x <= n; x++)
            {
                float u = x / (float)n, v = y / (float)n;
                float dx = (u * rect.width - sprite.pivot.x) / sprite.pixelsPerUnit * scale.x;
                float dy = (v * rect.height - sprite.pivot.y) / sprite.pixelsPerUnit * scale.y;
                var p = NativeGroundSkillGeometry.Place(anchor.x * 100, -anchor.z * 100, dx, dy, angle, sampleHeight, NativeGroundSkillGeometry.SurfaceLift);
                int index = y * side + x;
                vertices[index] = surface.transform.InverseTransformPoint(new Vector3(p.X, p.Y, p.Z));
                colors[index] = source.color;
                if (updateUv) uv[index] = new Vector2((rect.x + (source.flipX ? 1 - u : u) * rect.width) / texture.width,
                    (rect.y + (source.flipY ? 1 - v : v) * rect.height) / texture.height);
            }
            mesh.vertices = vertices; mesh.colors = colors;
            if (updateUv) { mesh.uv = uv; uvSprite = sprite; uvFlipX = source.flipX; uvFlipY = source.flipY; }
            mesh.RecalculateBounds();
        }

        void RestoreSprite()
        {
            if (draw != null) draw.enabled = false;
            if (forced && source != null) source.forceRenderingOff = priorForceOff;
            forced = false;
        }

        void OnDisable() { RestoreSprite(); }
        void OnDestroy()
        {
            RestoreSprite();
            if (!ReferenceEquals(source, null)) registered.Remove(source);
            Release(mesh); Release(surface);
        }
        static void Release(UnityEngine.Object value)
        {
            if (value == null) return;
            if (Application.isPlaying) Destroy(value); else DestroyImmediate(value);
        }
    }
}
