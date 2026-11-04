using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    [DisallowMultipleComponent]
    public sealed class NativeGroundSkillSurface : MonoBehaviour
    {
        static readonly Dictionary<SpriteRenderer,NativeGroundSkillSurface> registered=new Dictionary<SpriteRenderer,NativeGroundSkillSurface>();
        static readonly int MainTex=Shader.PropertyToID("_MainTex"),Mode=Shader.PropertyToID("_SourceMode"),Tint=Shader.PropertyToID("_SourceTint"),Flat=Shader.PropertyToID("_Flat"),Normal=Shader.PropertyToID("_NormalBlend"),Opacity=Shader.PropertyToID("_Opacity"),Anchor=Shader.PropertyToID("_GroundAnchor"),UvU=Shader.PropertyToID("_GroundUvU"),UvV=Shader.PropertyToID("_GroundUvV"),UvRect=Shader.PropertyToID("_GroundUvRect"),Radius=Shader.PropertyToID("_GroundRingRadius"),Width=Shader.PropertyToID("_GroundRingWidth");
        sealed class Ring
        {
            public LineRenderer Source;public MeshRenderer Draw;public float Radius;public Color Color;public bool Forced,PriorForceOff;
            MaterialPropertyBlock blockValue;
            public MaterialPropertyBlock Block { get { return blockValue ?? (blockValue=new MaterialPropertyBlock()); } }
        }
        readonly List<Ring> rings=new List<Ring>();
        MaterialPropertyBlock blockValue;
        // Project can run for an inactive owner, before Awake/OnEnable.
        MaterialPropertyBlock block { get { return blockValue ?? (blockValue=new MaterialPropertyBlock()); } }
        SpriteRenderer source;GameObject surface;MeshRenderer draw;
        bool ground,forced,priorForceOff;float requestedExtent;
        public MeshRenderer SurfaceRenderer { get { return draw; } }
        public int GeometryRevision { get;private set; }
        public int OmittedTriangles { get { return 0; } }
        public bool UsesReceiverDepth { get { return true; } }
        public static void Mark(SpriteRenderer sprite,bool isGround=true,float maximumExtent=0)
        {
            if(sprite==null)return;
            NativeGroundSkillSurface entry;
            if(!registered.TryGetValue(sprite,out entry)||entry==null)
            {
                if(!isGround)return;entry=sprite.gameObject.AddComponent<NativeGroundSkillSurface>();entry.Initialize(sprite);registered[sprite]=entry;
            }
            entry.ground=isGround;entry.requestedExtent=maximumExtent;if(!isGround)entry.RestoreSprite();
        }
        public static bool Project(SpriteRenderer sprite)
        {
            NativeGroundSkillSurface entry;if(!registered.TryGetValue(sprite,out entry)||entry==null||!entry.ground)return false;
            entry.Sync();return true;
        }
        public static void RestoreAll() { foreach(var entry in registered.Values)if(entry!=null)entry.RestoreSprite(); }
        public static void SetRing(LineRenderer line,SpriteRenderer owner,float radius,Color color)
        {
            NativeGroundSkillSurface entry;if(line==null||owner==null||!registered.TryGetValue(owner,out entry)||entry==null)return;
            Ring ring=null;foreach(var item in entry.rings)if(item.Source==line){ring=item;break;}
            if(ring==null){ring=new Ring{Source=line};entry.rings.Add(ring);}ring.Radius=radius;ring.Color=color;
            if(NativeRemodel3D.Active&&!ring.Forced){ring.PriorForceOff=line.forceRenderingOff;line.forceRenderingOff=true;ring.Forced=true;}
        }
        public static MeshRenderer RingSurface(LineRenderer line)
        {
            foreach(var entry in registered.Values)if(entry!=null)foreach(var ring in entry.rings)if(ring.Source==line)return ring.Draw;
            return null;
        }
        void Initialize(SpriteRenderer sprite)
        {
            source=sprite;surface=new GameObject("Actual-surface ground projection") { hideFlags=HideFlags.DontSave };surface.transform.SetParent(transform.parent,false);surface.layer=gameObject.layer;
            surface.AddComponent<MeshFilter>().sharedMesh=NativeGroundSkillProjection.VolumeMesh;draw=surface.AddComponent<MeshRenderer>();Prepare(draw);
            NativeGroundSkillProjection.RegisterVolume(draw);GeometryRevision=1;
        }
        static void Prepare(MeshRenderer renderer)
        {
            renderer.enabled=false;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.allowOcclusionWhenDynamic=false;
        }
        static float Read(Material material,MaterialPropertyBlock properties,int id,float fallback)
        { return properties.HasFloat(id)?properties.GetFloat(id):material!=null&&material.HasProperty(id)?material.GetFloat(id):fallback; }
        static int Kind(Material material)
        {
            if(material==null||material.shader==null)return -1;
            string name=material.shader.name;
            if(name=="EXODUSER/SkillAdditive")return 0;if(name=="EXODUSER/KiSlashAdditive")return 1;if(name=="Sprites/Default")return 2;return -1;
        }
        void Sync()
        {
            if(!NativeRemodel3D.Active){RestoreSprite();return;}
            if(!forced){priorForceOff=source.forceRenderingOff;source.forceRenderingOff=true;forced=true;}
            // A 3D receiver failure must never resurrect the upright source card.
            if(!NativeGroundSkillProjection.Available){draw.enabled=false;HideRings();return;}
            bool visible=source.enabled&&source.sprite!=null&&source.gameObject.activeInHierarchy&&!priorForceOff;
            draw.enabled=visible;if(!visible){HideRings();return;}
            var sprite=source.sprite;var rect=sprite.rect;var texture=sprite.texture;var scale=source.transform.lossyScale;
            if(Mathf.Abs(scale.x)<.000001f||Mathf.Abs(scale.y)<.000001f){draw.enabled=false;HideRings();return;}
            var material=source.sharedMaterial;int kind=Kind(material);
            if(kind<0){draw.enabled=false;HideRings();Debug.LogError("Unsupported registered ground material: "+(material!=null?material.name:"null"));return;}
            float left=-sprite.pivot.x/sprite.pixelsPerUnit*scale.x,bottom=-sprite.pivot.y/sprite.pixelsPerUnit*scale.y;
            float width=rect.width/sprite.pixelsPerUnit*scale.x,height=rect.height/sprite.pixelsPerUnit*scale.y;
            float extent=Mathf.Max(requestedExtent,NativeGroundSkillGeometry.FootprintExtent(left,bottom,width,height));
            foreach(var ring in rings)if(ring.Source!=null)extent=Mathf.Max(extent,ring.Radius+ring.Source.widthMultiplier);
            var anchor=source.transform.position;
            surface.transform.SetPositionAndRotation(anchor,Quaternion.identity);surface.transform.localScale=new Vector3(extent*2,16,extent*2);
            surface.layer=source.gameObject.layer;draw.sortingLayerID=source.sortingLayerID;draw.sortingOrder=source.sortingOrder;
            int destination=material.HasProperty("_DstBlend")?(int)material.GetFloat("_DstBlend"):kind==2?(int)BlendMode.OneMinusSrcAlpha:(int)BlendMode.One;
            draw.sharedMaterial=NativeGroundSkillProjection.MaterialFor(destination);
            source.GetPropertyBlock(block);block.SetFloat("_GroundVertexShape",0);block.SetTexture(MainTex,texture);block.SetFloat(Mode,kind);block.SetFloat(Radius,0);
            block.SetFloat(Flat,Read(material,block,Flat,0));block.SetFloat(Normal,Read(material,block,Normal,kind==2?1:0));block.SetFloat(Opacity,Read(material,block,Opacity,1));
            var color=source.color;if(kind==2&&material.HasProperty("_Color"))color*=material.GetColor("_Color");
            block.SetVector(Tint,new Vector4(color.r,color.g,color.b,color.a));block.SetVector(Anchor,new Vector4(anchor.x,anchor.y,anchor.z,0));
            var map=NativeGroundSkillGeometry.TextureMap(left,bottom,width,height,source.transform.eulerAngles.z*Mathf.Deg2Rad,source.flipX,source.flipY);
            block.SetVector(UvU,new Vector4(map.Ux,map.Uz,map.Uo,0));block.SetVector(UvV,new Vector4(map.Vx,map.Vz,map.Vo,0));
            block.SetVector(UvRect,new Vector4(rect.x/texture.width,rect.y/texture.height,rect.width/texture.width,rect.height/texture.height));draw.SetPropertyBlock(block);
            SyncRings(anchor);
        }
        void SyncRings(Vector3 anchor)
        {
            foreach(var ring in rings)
            {
                if(ring.Source==null){if(ring.Draw!=null)ring.Draw.enabled=false;continue;}
                if(!ring.Forced){ring.PriorForceOff=ring.Source.forceRenderingOff;ring.Source.forceRenderingOff=true;ring.Forced=true;}
                if(ring.Draw==null)
                {
                    var go=new GameObject("Actual-surface ground ring");go.transform.SetParent(surface.transform,false);go.AddComponent<MeshFilter>().sharedMesh=NativeGroundSkillProjection.VolumeMesh;
                    ring.Draw=go.AddComponent<MeshRenderer>();Prepare(ring.Draw);NativeGroundSkillProjection.RegisterVolume(ring.Draw);
                }
                ring.Draw.enabled=ring.Source.enabled&&ring.Source.gameObject.activeInHierarchy&&!ring.PriorForceOff&&ring.Radius>0;
                ring.Draw.gameObject.layer=ring.Source.gameObject.layer;ring.Draw.sortingLayerID=ring.Source.sortingLayerID;ring.Draw.sortingOrder=ring.Source.sortingOrder;
                var material=ring.Source.sharedMaterial;int destination=material!=null&&material.HasProperty("_DstBlend")?(int)material.GetFloat("_DstBlend"):(int)BlendMode.One;
                ring.Draw.sharedMaterial=NativeGroundSkillProjection.MaterialFor(destination);ring.Source.GetPropertyBlock(ring.Block);
                ring.Block.SetFloat("_GroundVertexShape",0);
                ring.Block.SetFloat(Mode,0);ring.Block.SetFloat(Flat,0);ring.Block.SetFloat(Normal,Read(material,ring.Block,Normal,0));ring.Block.SetFloat(Opacity,1);
                ring.Block.SetFloat(Radius,ring.Radius);ring.Block.SetFloat(Width,ring.Source.widthMultiplier);var c=ring.Color;
                ring.Block.SetVector(Tint,new Vector4(c.r,c.g,c.b,c.a));ring.Block.SetVector(Anchor,new Vector4(anchor.x,anchor.y,anchor.z,0));ring.Draw.SetPropertyBlock(ring.Block);
            }
        }
        void HideRings(){foreach(var ring in rings)if(ring.Draw!=null)ring.Draw.enabled=false;}
        void RestoreSprite()
        {
            if(draw!=null)draw.enabled=false;if(forced&&source!=null)source.forceRenderingOff=priorForceOff;forced=false;HideRings();
            foreach(var ring in rings){if(ring.Forced&&ring.Source!=null)ring.Source.forceRenderingOff=ring.PriorForceOff;ring.Forced=false;}
        }
        void OnDisable(){RestoreSprite();}
        void OnDestroy()
        {
            RestoreSprite();if(!ReferenceEquals(source,null))registered.Remove(source);NativeGroundSkillProjection.UnregisterVolume(draw);
            foreach(var ring in rings)NativeGroundSkillProjection.UnregisterVolume(ring.Draw);Release(surface);
        }
        static void Release(UnityEngine.Object value){if(value==null)return;if(Application.isPlaying)Destroy(value);else DestroyImmediate(value);}
    }
}
