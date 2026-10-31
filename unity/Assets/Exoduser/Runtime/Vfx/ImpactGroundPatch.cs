using System;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort.Vfx
{
    // A terrain-conforming presentation mesh also works on renderers that do not
    // receive URP decals. Sampling never writes terrain, collision or Core state.
    public sealed class ImpactGroundPatch : IDisposable
    {
        const int Segments=12;
        readonly GameObject go;
        readonly MeshFilter filter;
        readonly MeshRenderer render;
        readonly MaterialPropertyBlock block=new MaterialPropertyBlock();
        readonly Mesh mesh;
        readonly Vector3[] vertices=new Vector3[(Segments+1)*(Segments+1)];
        float lastX=float.NaN,lastY,lastRadius;bool last3D;
        public ImpactGroundPatch(Transform parent,Material material,int order)
        {
            go=new GameObject("지형 밀착 임팩트 표면");go.transform.SetParent(parent,false);
            filter=go.AddComponent<MeshFilter>();render=go.AddComponent<MeshRenderer>();
            render.sharedMaterial=material;render.sortingOrder=order;render.shadowCastingMode=ShadowCastingMode.Off;render.receiveShadows=true;
            mesh=new Mesh{name="임팩트 표면 12x12"};mesh.MarkDynamic();
            var uv=new Vector2[vertices.Length];var triangles=new int[Segments*Segments*6];int n=0;
            for(int z=0;z<=Segments;z++)for(int x=0;x<=Segments;x++)uv[z*(Segments+1)+x]=new Vector2(x/(float)Segments,z/(float)Segments);
            for(int z=0;z<Segments;z++)for(int x=0;x<Segments;x++)
            {
                int a=z*(Segments+1)+x,b=a+Segments+1;
                triangles[n++]=a;triangles[n++]=b;triangles[n++]=b+1;
                triangles[n++]=a;triangles[n++]=b+1;triangles[n++]=a+1;
            }
            mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=triangles;
        }
        public void Draw(float x,float y,float radius,Color fill,Color edge,float alpha,float glow)
        {
            if(radius<=.001f||alpha<=0){render.enabled=false;return;}
            bool world=NativeRemodel3D.Active;
            go.transform.SetPositionAndRotation(ImpactSpace.Point(x,y),ImpactSpace.FloorRotation);
            go.transform.localScale=Vector3.one;
            if(world)
            {
                filter.sharedMesh=mesh;
                if(!last3D||x!=lastX||y!=lastY||Mathf.Abs(radius-lastRadius)>.001f)
                {
                    float center=RemodelWorld.GroundHeight(x,y);
                    for(int z=0;z<=Segments;z++)for(int q=0;q<=Segments;q++)
                    {
                        float dx=(q/(float)Segments*2-1)*radius,dz=(z/(float)Segments*2-1)*radius;
                        vertices[z*(Segments+1)+q]=new Vector3(dx,RemodelWorld.GroundHeight(x+dx*100,y-dz*100)-center+.025f,dz);
                    }
                    mesh.vertices=vertices;mesh.RecalculateNormals();mesh.RecalculateBounds();
                }
            }
            else{filter.sharedMesh=ImpactSpace.FloorQuad;go.transform.localScale=Vector3.one*(radius*2);go.transform.position=ImpactSpace.Point(x,y,.02f);}
            lastX=x;lastY=y;lastRadius=radius;last3D=world;
            block.SetColor("_FillColor",fill);block.SetColor("_EdgeColor",edge);block.SetFloat("_Fade",alpha);block.SetFloat("_EdgeGlow",glow);
            render.SetPropertyBlock(block);render.enabled=true;go.SetActive(true);
        }
        public void Fade(float alpha){block.SetFloat("_Fade",alpha);render.SetPropertyBlock(block);render.enabled=alpha>0;}
        public void Hide(){render.enabled=false;}
        public void Dispose(){UnityEngine.Object.Destroy(mesh);UnityEngine.Object.Destroy(go);}
    }
}
