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
        static readonly int GroundClip=Shader.PropertyToID("_GroundUvClip"),GroundU=Shader.PropertyToID("_GroundUvU"),GroundV=Shader.PropertyToID("_GroundUvV"),GroundRect=Shader.PropertyToID("_GroundUvRect");
        static Material spriteAlpha;
        static readonly int RingRadius=Shader.PropertyToID("_GroundRingRadius"),RingWidth=Shader.PropertyToID("_GroundRingWidth"),RingColor=Shader.PropertyToID("_GroundRingColor"),RingLift=Shader.PropertyToID("_GroundRingLift");
        sealed class Ring
        {
            public LineRenderer Source; public MeshRenderer Draw; public MeshFilter Filter;
            public float Radius; public Color Color; public bool Forced, PriorForceOff;
            public readonly MaterialPropertyBlock Block=new MaterialPropertyBlock();
        }
        readonly List<Ring> rings=new List<Ring>();
        SpriteRenderer source;
        GameObject surface;
        Mesh mesh;
        MeshRenderer draw;
        Vector3[] vertices;
        Vector2[] uv;
        Color[] colors;
        Vector2[] footprintUv;
        Matrix4x4 geometryTransform;
        Vector4 geometryFootprint;
        Terrain geometryTerrain;
        A2FieldLayout geometryField;
        bool geometryValid, geometryProjected;
        float requestedExtent, geometryExtent, geometryRoll;
        Color lastColor;
        public int OmittedTriangles { get; private set; }
        public int GeometryRevision { get; private set; }
        public MeshRenderer SurfaceRenderer { get { return draw; } }

        public static void SetRing(LineRenderer line,SpriteRenderer owner,float radius,Color color)
        {
            NativeGroundSkillSurface entry;
            if(line==null || owner==null || !registered.TryGetValue(owner,out entry) || entry==null)return;
            Ring ring=entry.rings.Find(x=>x.Source==line);
            if(ring==null) { ring=new Ring { Source=line };entry.rings.Add(ring); }
            ring.Radius=radius;ring.Color=color;
            if(NativeRemodel3D.Active && !ring.Forced)
            { ring.PriorForceOff=line.forceRenderingOff;line.forceRenderingOff=true;ring.Forced=true; }
        }
        public static MeshRenderer RingSurface(LineRenderer line)
        {
            foreach(var entry in registered.Values)if(entry!=null)
                foreach(var ring in entry.rings)if(ring.Source==line)return ring.Draw;
            return null;
        }
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        Sprite uvSprite;
        bool ground, forced, priorForceOff, uvFlipX, uvFlipY;

        public static void Mark(SpriteRenderer sprite, bool isGround = true, float maximumExtent = 0)
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
            entry.requestedExtent = maximumExtent;
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
            // Sibling of the source: its roll/scale animate UVs, never the terrain mesh.
            surface.transform.SetParent(transform.parent, false);
            surface.layer = gameObject.layer;
            draw = surface.AddComponent<MeshRenderer>();
            draw.enabled = false;
            draw.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            draw.receiveShadows = false;
            mesh = new Mesh { name = "Terrain-conforming ground effect" }; mesh.MarkDynamic();
            surface.AddComponent<MeshFilter>().sharedMesh = mesh;
        }

        void Sync()
        {
            if (!NativeRemodel3D.Active) { RestoreSprite(); return; }
            if (!forced) { priorForceOff = source.forceRenderingOff; source.forceRenderingOff = true; forced = true; }
            bool visible = source.enabled && source.sprite != null && source.gameObject.activeInHierarchy && !priorForceOff;
            draw.enabled = visible;
            if (!visible) { HideRings();return; }
            var sprite = source.sprite; var rect = sprite.rect; var texture = sprite.texture;
            var material=source.sharedMaterial;
            if(material!=null && material.shader!=null && material.shader.name=="Sprites/Default")
            {
                if(spriteAlpha==null)
                {
                    spriteAlpha=new Material(Shader.Find("EXODUSER/SkillAdditive")) { name="Ground sprite alpha (original premultiplied blend)" };
                    spriteAlpha.SetFloat("_NormalBlend",1);spriteAlpha.SetFloat("_DstBlend",(float)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                }
                material=spriteAlpha;
            }
            draw.sharedMaterial = material;
            bool projected=material!=null && material.HasProperty(GroundClip);
            draw.sortingLayerID = source.sortingLayerID; draw.sortingOrder = source.sortingOrder;
            surface.layer = source.gameObject.layer;
            // Preserve per-renderer _Opacity and other original overrides as well as the
            // exact atlas cell. Treating the entire ward sheet as one texture mixes mine/trap art.
            source.GetPropertyBlock(block); block.SetTexture(MainTex, texture);
            bool updateUv = uvSprite != sprite || uvFlipX != source.flipX || uvFlipY != source.flipY;
            var anchor = source.transform.position; var scale = source.transform.lossyScale;
            // A just-created zone deploys from zero size. Its inverse transform is
            // singular at that instant, and the original zero-size sprite is invisible.
            if (Mathf.Abs(scale.x) < .000001f || Mathf.Abs(scale.y) < .000001f) { draw.enabled = false;HideRings();return; }
            float left=-sprite.pivot.x/sprite.pixelsPerUnit*scale.x, bottom=-sprite.pivot.y/sprite.pixelsPerUnit*scale.y;
            float width=rect.width/sprite.pixelsPerUnit*scale.x, height=rect.height/sprite.pixelsPerUnit*scale.y;
            float roll=source.transform.eulerAngles.z*Mathf.Deg2Rad;
            var footprint=new Vector4(left,bottom,width,height);
            surface.transform.SetPositionAndRotation(anchor,Quaternion.identity);
            surface.transform.localScale=Vector3.one;
            var matrix=surface.transform.localToWorldMatrix;
            float extent=projected?Mathf.Max(requestedExtent,NativeGroundSkillGeometry.FootprintExtent(left,bottom,width,height)):0;
            bool rebuild=!geometryValid || geometryTransform!=matrix || geometryProjected!=projected ||
                (projected?extent>geometryExtent:geometryFootprint!=footprint || geometryRoll!=roll) ||
                geometryTerrain!=NativeRemodel3D.Ground || geometryField!=NativeRemodel3D.Field;
            if(rebuild)
            {
                // The terrain is world-aligned and covers every source rotation. Texture
                // footprint clipping happens on the GPU; deploy/roll need no retessellation.
                float radius=projected?Mathf.Ceil(extent*4)*.25f:0;
                var data=NativeGroundSkillGeometry.Tessellate(anchor.x*100,-anchor.z*100,
                    projected?-radius:left,projected?-radius:bottom,projected?radius*2:width,projected?radius*2:height,
                    projected?0:roll,sampleHeight);
                vertices=new Vector3[data.Vertices.Length];uv=new Vector2[vertices.Length];colors=new Color[vertices.Length];
                footprintUv=new Vector2[vertices.Length];
                for(int i=0;i<vertices.Length;i++)
                {
                    var p=data.Vertices[i];vertices[i]=surface.transform.InverseTransformPoint(new Vector3(p.X,p.Y,p.Z));
                    footprintUv[i]=uv[i]=new Vector2(p.U,p.V);
                }
                mesh.Clear();mesh.indexFormat=vertices.Length>65535?UnityEngine.Rendering.IndexFormat.UInt32:UnityEngine.Rendering.IndexFormat.UInt16;
                mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=data.Triangles;mesh.RecalculateBounds();
                var bounds=mesh.bounds;bounds.Expand(new Vector3(0,2*Mathf.Abs(NativeGroundSkillGeometry.RingLift-NativeGroundSkillGeometry.SurfaceLift),0));mesh.bounds=bounds;
                OmittedTriangles=data.OmittedTriangles;geometryTransform=matrix;geometryFootprint=footprint;
                geometryTerrain=NativeRemodel3D.Ground;geometryField=NativeRemodel3D.Field;geometryValid=true;
                geometryExtent=radius;geometryRoll=roll;geometryProjected=projected;GeometryRevision++;
                updateUv=true;
            }
            if(projected)
            {
                var map=NativeGroundSkillGeometry.TextureMap(left,bottom,width,height,roll,source.flipX,source.flipY);
                block.SetFloat(GroundClip,1);block.SetVector(GroundU,new Vector4(map.Ux,map.Uz,map.Uo,0));
                block.SetVector(GroundV,new Vector4(map.Vx,map.Vz,map.Vo,0));
                block.SetVector(GroundRect,new Vector4(rect.x/texture.width,rect.y/texture.height,rect.width/texture.width,rect.height/texture.height));
            }
            else if(updateUv)
            {
                for(int i=0;i<uv.Length;i++)
                {
                    float u=footprintUv[i].x,v=footprintUv[i].y;
                    uv[i]=new Vector2((rect.x+(source.flipX?1-u:u)*rect.width)/texture.width,
                        (rect.y+(source.flipY?1-v:v)*rect.height)/texture.height);
                }
                mesh.uv=uv;uvSprite=sprite;uvFlipX=source.flipX;uvFlipY=source.flipY;
            }
            draw.SetPropertyBlock(block);
            if(rebuild || lastColor!=source.color)
            {
                for(int i=0;i<colors.Length;i++)colors[i]=source.color;
                mesh.colors=colors;lastColor=source.color;
            }
            SyncRings();
        }

        void HideRings() { foreach(var ring in rings)if(ring.Draw!=null)ring.Draw.enabled=false; }
        void SyncRings()
        {
            foreach(var ring in rings)
            {
                if(ring.Source==null)continue;
                if(!ring.Forced) { ring.PriorForceOff=ring.Source.forceRenderingOff;ring.Source.forceRenderingOff=true;ring.Forced=true; }
                if(ring.Draw==null)
                {
                    var go=new GameObject("Ground skill ring");go.transform.SetParent(surface.transform,false);
                    ring.Filter=go.AddComponent<MeshFilter>();ring.Draw=go.AddComponent<MeshRenderer>();
                    ring.Draw.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;ring.Draw.receiveShadows=false;
                }
                ring.Draw.enabled=ring.Source.enabled && ring.Source.gameObject.activeInHierarchy && !ring.PriorForceOff && ring.Radius>0;
                ring.Draw.gameObject.layer=ring.Source.gameObject.layer;
                ring.Filter.sharedMesh=mesh;ring.Draw.sharedMaterial=ring.Source.sharedMaterial;
                ring.Draw.sortingLayerID=ring.Source.sortingLayerID;ring.Draw.sortingOrder=ring.Source.sortingOrder;
                ring.Source.GetPropertyBlock(ring.Block);ring.Block.SetFloat(GroundClip,1);
                ring.Block.SetFloat(RingRadius,ring.Radius);ring.Block.SetFloat(RingWidth,ring.Source.widthMultiplier);
                ring.Block.SetFloat(RingLift,NativeGroundSkillGeometry.RingLift-NativeGroundSkillGeometry.SurfaceLift);
                var c=ring.Color;ring.Block.SetVector(RingColor,new Vector4(c.r,c.g,c.b,c.a));
                ring.Draw.SetPropertyBlock(ring.Block);
            }
        }

        void RestoreSprite()
        {
            if (draw != null) draw.enabled = false;
            if (forced && source != null) source.forceRenderingOff = priorForceOff;
            forced = false;
            HideRings();
            foreach(var ring in rings)
            {
                if(ring.Forced && ring.Source!=null)ring.Source.forceRenderingOff=ring.PriorForceOff;
                ring.Forced=false;
            }
        }

        void OnDisable() { RestoreSprite(); }
        void OnDestroy()
        {
            RestoreSprite();
            if (!ReferenceEquals(source, null)) registered.Remove(source);
            Release(mesh); Release(surface);
            if(registered.Count==0) { Release(spriteAlpha);spriteAlpha=null; }
        }
        static void Release(UnityEngine.Object value)
        {
            if (value == null) return;
            if (Application.isPlaying) Destroy(value); else DestroyImmediate(value);
        }
    }
}
