using System;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // Read-only companion: source actor, atlas, scale, filtering, material and rig path stay untouched.
    [DefaultExecutionOrder(27000)]
    public sealed class A2RHeroReadability : MonoBehaviour
    {
        SpriteRenderer source;Sprite previous;MeshRenderer contour;Mesh mesh;Material material;Light fill;Func<Vector3> foot;
        public void Initialize(SpriteRenderer actor,Func<Vector3> ground)
        {
            source=actor;foot=ground;var go=new GameObject("A2R moon-side one texel hero contour");go.transform.SetParent(transform,false);go.layer=actor.gameObject.layer;
            mesh=new Mesh{name="A2R source frame contour quad"};go.AddComponent<MeshFilter>().sharedMesh=mesh;contour=go.AddComponent<MeshRenderer>();material=new Material(Resources.Load<Shader>("A2R/HeroReadability"));contour.sharedMaterial=material;contour.shadowCastingMode=ShadowCastingMode.Off;contour.receiveShadows=false;
            fill=new GameObject("A2R hero weak ground light").AddComponent<Light>();fill.transform.SetParent(transform,false);fill.type=LightType.Point;fill.range=2.8f;fill.intensity=1.1f;fill.color=new Color(.89f,.88f,.80f);fill.shadows=LightShadows.None;
        }
        void LateUpdate()
        {
            if(source==null)return;contour.enabled=source.enabled&&source.gameObject.activeInHierarchy&&source.sprite!=null;
            if(!contour.enabled)return;var sprite=source.sprite;
            if(previous!=sprite){previous=sprite;var b=sprite.bounds;float pad=1.1f/sprite.pixelsPerUnit;float x0=b.min.x-pad,x1=b.max.x+pad,y0=b.min.y-pad,y1=b.max.y+pad;var uv=sprite.uv;var lo=new Vector2(1,1);var hi=Vector2.zero;foreach(var p in uv){lo=Vector2.Min(lo,p);hi=Vector2.Max(hi,p);}var texel=new Vector2(1f/sprite.texture.width,1f/sprite.texture.height)*1.1f;mesh.Clear();mesh.vertices=new[]{new Vector3(x0,y0,0),new Vector3(x1,y0,0),new Vector3(x0,y1,0),new Vector3(x1,y1,0)};mesh.uv=new[]{lo-texel,new Vector2(hi.x+texel.x,lo.y-texel.y),new Vector2(lo.x-texel.x,hi.y+texel.y),hi+texel};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();material.SetTexture("_MainTex",sprite.texture);material.SetVector("_UVRect",new Vector4(lo.x,lo.y,hi.x,hi.y));}
            contour.transform.SetPositionAndRotation(source.transform.position,source.transform.rotation);var scale=source.transform.lossyScale;if(source.flipX)scale.x=-scale.x;if(source.flipY)scale.y=-scale.y;contour.transform.localScale=scale;
            fill.transform.position=foot()+Vector3.up*.8f;
        }
        void OnDestroy(){if(mesh!=null)Destroy(mesh);if(material!=null)Destroy(material);}
    }
}
