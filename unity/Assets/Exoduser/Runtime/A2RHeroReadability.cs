using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // Read-only companion: source actor, atlas, scale, filtering, material and rig path stay untouched.
    [DefaultExecutionOrder(27000)]
    public sealed class A2RHeroReadability : MonoBehaviour
    {
        SpriteRenderer source;Sprite previous;MeshRenderer contour,ring;Mesh mesh;Material material,ringMaterial;Light fill;Func<Vector3> foot;Camera viewer;
        MeshRenderer rigImage;readonly List<Renderer> rigBodies=new List<Renderer>();float nextRigSearch;bool wasRig;
        bool RigVisible {get{return rigImage!=null&&rigImage.enabled&&rigImage.gameObject.activeInHierarchy;}}
        Renderer VisibleHero {get{return RigVisible?(Renderer)rigImage:source;}}
        bool HeroVisible {get{return VisibleHero!=null&&VisibleHero.enabled&&VisibleHero.gameObject.activeInHierarchy;}}
        public Bounds HeroBounds {get{if(!RigVisible)return source!=null?source.bounds:new Bounds();bool any=false;Bounds bounds=new Bounds();foreach(var r in rigBodies)if(r!=null&&r.enabled&&r.gameObject.activeInHierarchy){if(!any){bounds=r.bounds;any=true;}else bounds.Encapsulate(r.bounds);}if(any)return bounds;float w=source!=null&&source.sprite!=null?source.sprite.bounds.size.x*Mathf.Abs(source.transform.lossyScale.x):.8f;return new Bounds(foot()+viewer.transform.up*.8f,new Vector3(w,1.6f,.2f));}}
        void FindRig(){if(rigImage!=null||Time.unscaledTime<nextRigSearch||source==null)return;nextRigSearch=Time.unscaledTime+.25f;var root=source.transform.parent;foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))if(r.name=="RigPixel warrior"){rigImage=r;break;}if(rigImage!=null)foreach(var r in root.GetComponentsInChildren<Renderer>(true))if(r.gameObject.layer==30)rigBodies.Add(r);}
        Action<List<SpriteRenderer>> collect;readonly List<SpriteRenderer> candidates=new List<SpriteRenderer>();
        struct State{public SpriteRenderer renderer;public int order,layer;public Material material;}
        readonly List<State> restored=new List<State>();readonly Dictionary<Material,Material> behind=new Dictionary<Material,Material>();
        public int OverlapCount {get;private set;}public int PeakOverlapCount {get;private set;}
        public bool CaptureHideEnemies;static A2RHeroReadability active;readonly List<SpriteRenderer> hidden=new List<SpriteRenderer>();
        public string HeroFrame {get {return RigVisible?"rigpixel live Point RT":source!=null&&source.sprite!=null?source.sprite.texture.name+":"+source.sprite.rect:"";}}
        public static void AvoidHeroStatus(ref float x,ref float y,float width)
        {
            if(active==null||!active.isActiveAndEnabled||!active.HeroVisible)return;var p=active.Project(active.HeroBounds);var heroRect=Rect.MinMaxRect(p.xMin-5,Screen.height-p.yMax-5,p.xMax+5,Screen.height-p.yMin+5);
            if(new Rect(x-width*.5f,y-1,width,9).Overlaps(heroRect))x=x<heroRect.center.x?heroRect.xMin-width*.5f-5:heroRect.xMax+width*.5f+5;
        }
        public void SetOverlaps(Action<List<SpriteRenderer>> sourceRenderers){collect=sourceRenderers;}
        public void Initialize(SpriteRenderer actor,Func<Vector3> ground,Camera camera)
        {
            source=actor;foot=ground;viewer=camera;active=this;var go=new GameObject("A2R soft 1.5 screen pixel bone rim");go.transform.SetParent(transform,false);go.layer=actor.gameObject.layer;
            mesh=new Mesh{name="A2R source frame contour quad"};go.AddComponent<MeshFilter>().sharedMesh=mesh;contour=go.AddComponent<MeshRenderer>();material=new Material(Resources.Load<Shader>("A2R/HeroReadability"));contour.sharedMaterial=material;contour.shadowCastingMode=ShadowCastingMode.Off;contour.receiveShadows=false;
            fill=new GameObject("A2R hero weak ground light").AddComponent<Light>();fill.transform.SetParent(transform,false);fill.type=LightType.Point;fill.range=4;fill.intensity=1.1f;fill.color=new Color(.89f,.88f,.80f);fill.shadows=LightShadows.None;
            var disk=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(disk.GetComponent<Collider>());disk.name="A2R soft foot light pool";disk.transform.SetParent(transform,false);ring=disk.GetComponent<MeshRenderer>();ringMaterial=new Material(Resources.Load<Shader>("A2R/FootLight"));ring.sharedMaterial=ringMaterial;ring.shadowCastingMode=ShadowCastingMode.Off;
            RenderPipelineManager.beginCameraRendering+=BeforeCamera;RenderPipelineManager.endCameraRendering+=AfterCamera;
        }
        void LateUpdate()
        {
            if(source==null)return;FindRig();contour.enabled=HeroVisible;ring.enabled=contour.enabled;if(!contour.enabled)return;
            if(RigVisible){if(!wasRig){mesh.Clear();mesh.vertices=new[]{new Vector3(-.5f,-.5f,0),new Vector3(.5f,-.5f,0),new Vector3(-.5f,.5f,0),new Vector3(.5f,.5f,0)};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();previous=null;}wasRig=true;material.SetTexture("_MainTex",rigImage.sharedMaterial.GetTexture("_MainTex"));material.SetVector("_UVRect",new Vector4(0,0,1,1));contour.transform.SetPositionAndRotation(rigImage.transform.position,rigImage.transform.rotation);contour.transform.localScale=rigImage.transform.lossyScale;UpdateFoot();Restore();PrepareSorting();return;}
            wasRig=false;var sprite=source.sprite;if(sprite==null){contour.enabled=false;ring.enabled=false;return;}
            if(previous!=sprite){previous=sprite;var b=sprite.bounds;float pad=1.1f/sprite.pixelsPerUnit;float x0=b.min.x-pad,x1=b.max.x+pad,y0=b.min.y-pad,y1=b.max.y+pad;var uv=sprite.uv;var lo=new Vector2(1,1);var hi=Vector2.zero;foreach(var p in uv){lo=Vector2.Min(lo,p);hi=Vector2.Max(hi,p);}var texel=new Vector2(1f/sprite.texture.width,1f/sprite.texture.height)*1.1f;mesh.Clear();mesh.vertices=new[]{new Vector3(x0,y0,0),new Vector3(x1,y0,0),new Vector3(x0,y1,0),new Vector3(x1,y1,0)};mesh.uv=new[]{lo-texel,new Vector2(hi.x+texel.x,lo.y-texel.y),new Vector2(lo.x-texel.x,hi.y+texel.y),hi+texel};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();material.SetTexture("_MainTex",sprite.texture);material.SetVector("_UVRect",new Vector4(lo.x,lo.y,hi.x,hi.y));}
            contour.transform.SetPositionAndRotation(source.transform.position,source.transform.rotation);var scale=source.transform.lossyScale;if(source.flipX)scale.x=-scale.x;if(source.flipY)scale.y=-scale.y;contour.transform.localScale=scale;
            UpdateFoot();Restore();PrepareSorting();
        }
        void UpdateFoot(){var p0=foot();fill.transform.position=p0+Vector3.up*.8f;ring.transform.SetPositionAndRotation(p0+Vector3.up*.035f,Quaternion.Euler(90,0,0));float radius=Mathf.Max(.25f,HeroBounds.size.x)*1.3f;ring.transform.localScale=new Vector3(radius*2,radius*2,1);}
        Rect Project(Bounds bounds)
        {
            Vector2 lo=new Vector2(float.PositiveInfinity,float.PositiveInfinity),hi=-lo;
            for(int n=0;n<8;n++){var p=viewer.WorldToScreenPoint(bounds.center+Vector3.Scale(bounds.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));if(p.z<=0)continue;lo=Vector2.Min(lo,p);hi=Vector2.Max(hi,p);}return Rect.MinMaxRect(lo.x,lo.y,hi.x,hi.y);
        }
        void BeforeCamera(ScriptableRenderContext context,Camera camera)
        {
            if(camera!=viewer||!isActiveAndEnabled||!HeroVisible||collect==null)return;
            if(restored.Count==0)PrepareSorting();
            if(CaptureHideEnemies)foreach(var r in candidates)if(r!=null&&r.enabled){hidden.Add(r);r.enabled=false;}
        }
        void PrepareSorting()
        {
            if(collect==null||!HeroVisible)return;candidates.Clear();collect(candidates);var rect=Project(HeroBounds);OverlapCount=0;var actor=VisibleHero;int queue=actor.sharedMaterial.renderQueue;
            foreach(var r in candidates){if(r==null||r==source||!r.enabled||!r.gameObject.activeInHierarchy||!Project(r.bounds).Overlaps(rect))continue;
                restored.Add(new State{renderer=r,order=r.sortingOrder,layer=r.sortingLayerID,material=r.sharedMaterial});r.sortingLayerID=actor.sortingLayerID;r.sortingOrder=Mathf.Min(r.sortingOrder,actor.sortingOrder-8);OverlapCount++;
                // Keep source shader/texels/blending; only this camera's overlapping higher queue changes.
                if(r.sharedMaterial!=null&&r.sharedMaterial.renderQueue>queue){Material copy;if(!behind.TryGetValue(r.sharedMaterial,out copy)){copy=new Material(r.sharedMaterial){name=r.sharedMaterial.name+" A2R order only",renderQueue=queue};behind[r.sharedMaterial]=copy;}r.sharedMaterial=copy;}
            }
            PeakOverlapCount=Mathf.Max(PeakOverlapCount,OverlapCount);
        }
        void AfterCamera(ScriptableRenderContext context,Camera camera){if(camera==viewer)Restore();}
        void Restore(){foreach(var r in hidden)if(r!=null)r.enabled=true;hidden.Clear();foreach(var s in restored)if(s.renderer!=null){s.renderer.sortingOrder=s.order;s.renderer.sortingLayerID=s.layer;s.renderer.sharedMaterial=s.material;}restored.Clear();}
        void OnDisable(){Restore();}
        void OnDestroy(){RenderPipelineManager.beginCameraRendering-=BeforeCamera;RenderPipelineManager.endCameraRendering-=AfterCamera;Restore();if(mesh!=null)Destroy(mesh);if(material!=null)Destroy(material);if(ringMaterial!=null)Destroy(ringMaterial);foreach(var m in behind.Values)Destroy(m);}
    }
}
