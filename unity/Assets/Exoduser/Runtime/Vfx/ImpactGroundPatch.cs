using System;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort.Vfx
{
    // Project onto the actual world geometry rather than interpolating across
    // plank gaps and height discontinuities. The legacy XY floor stays a quad.
    public sealed class ImpactGroundPatch : IDisposable
    {
        readonly GameObject go;
        readonly MeshFilter filter;
        readonly MeshRenderer render;
        readonly MaterialPropertyBlock block=new MaterialPropertyBlock();
        readonly Material decalSource;
        DecalProjector projector;Material decal;bool world;
        public ImpactGroundPatch(Transform parent,Material material,int order,Material decalMaterial)
        {
            go=new GameObject("지형 밀착 임팩트 표면");go.transform.SetParent(parent,false);
            filter=go.AddComponent<MeshFilter>();render=go.AddComponent<MeshRenderer>();
            render.sharedMaterial=material;render.sortingOrder=order;render.shadowCastingMode=ShadowCastingMode.Off;render.receiveShadows=true;
            filter.sharedMesh=ImpactSpace.FloorQuad;render.enabled=false;decalSource=decalMaterial;
        }
        void EnsureProjector()
        {
            if(projector!=null)return;
            var child=new GameObject("실제 지면 임팩트 데칼");child.SetActive(false);child.transform.SetParent(go.transform,false);
            child.transform.localRotation=Quaternion.Euler(90,0,0);
            decal=new Material(decalSource){name="임팩트 지면 전용 재질"};
            decal.SetFloat("_Shape",0);decal.SetFloat("_Radius",1);decal.SetFloat("_SizeX",2);decal.SetFloat("_SizeY",2);
            projector=child.AddComponent<DecalProjector>();projector.material=decal;projector.pivot=Vector3.zero;
            projector.fadeFactor=1;projector.drawDistance=60;child.SetActive(true);
        }
        public void Draw(float x,float y,float radius,Color fill,Color edge,float alpha,float glow)
        {
            if(radius<=.001f||alpha<=0){Hide();return;}
            world=NativeRemodel3D.Active;
            go.transform.SetPositionAndRotation(ImpactSpace.Point(x,y,world?0:.02f),ImpactSpace.FloorRotation);
            go.transform.localScale=world?Vector3.one:Vector3.one*(radius*2);go.SetActive(true);
            if(world)
            {
                EnsureProjector();render.enabled=false;projector.enabled=true;projector.size=new Vector3(radius*2,radius*2,2);
                decal.SetColor("_FillColor",fill);decal.SetColor("_EdgeColor",edge);decal.SetFloat("_Progress",alpha);decal.SetFloat("_EdgeGlow",glow);
            }
            else
            {
                if(projector!=null)projector.enabled=false;
                block.SetColor("_FillColor",fill);block.SetColor("_EdgeColor",edge);block.SetFloat("_Fade",alpha);block.SetFloat("_EdgeGlow",glow);
                render.SetPropertyBlock(block);render.enabled=true;
            }
        }
        public void Fade(float alpha)
        {
            if(world){if(decal!=null)decal.SetFloat("_Progress",alpha);if(projector!=null)projector.enabled=alpha>0;}
            else{block.SetFloat("_Fade",alpha);render.SetPropertyBlock(block);render.enabled=alpha>0;}
        }
        public void Hide(){render.enabled=false;if(projector!=null)projector.enabled=false;}
        public void Dispose(){UnityEngine.Object.Destroy(go);if(decal!=null)UnityEngine.Object.Destroy(decal);}
    }
}
