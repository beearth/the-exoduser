using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // A mesh is deliberately used here: the generic SpriteRenderer billboard
    // pass must never tilt or apply an actor's foot lift to a ground zone.
    public sealed class NativeGroundSkillSurface : IDisposable
    {
        readonly GameObject go;
        readonly Mesh mesh;
        readonly MeshRenderer renderer;
        readonly Vector3[] vertices;
        readonly Color[] colors;
        readonly MaterialPropertyBlock block = new MaterialPropertyBlock();
        static readonly Func<float,float,float> SampleHeight = NativeRemodel3D.GroundY;
        static readonly int MainTex = Shader.PropertyToID("_MainTex");

        public NativeGroundSkillSurface(Transform parent)
        {
            go = new GameObject("Ground skill surface"); go.transform.SetParent(parent, false);
            renderer = go.AddComponent<MeshRenderer>();
            renderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            renderer.receiveShadows = false;
            int n = NativeGroundSkillGeometry.Segments, side = n + 1;
            vertices = new Vector3[side * side]; colors = new Color[side * side];
            var uv = new Vector2[side * side]; var triangles = new int[n * n * 6];
            for(int y=0;y<=n;y++)for(int x=0;x<=n;x++)uv[y*side+x]=new Vector2(x/(float)n,y/(float)n);
            int k=0;
            for(int y=0;y<n;y++)for(int x=0;x<n;x++) {
                int a=y*side+x,b=a+1,c=a+side,d=c+1;
                triangles[k++]=a;triangles[k++]=c;triangles[k++]=b;
                triangles[k++]=b;triangles[k++]=c;triangles[k++]=d;
            }
            mesh = new Mesh { name="Terrain-conforming skill zone" }; mesh.MarkDynamic();
            mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=triangles;
            go.AddComponent<MeshFilter>().sharedMesh=mesh;
        }

        public void Sync(SpriteRenderer source,float px,float py)
        {
            renderer.enabled=NativeRemodel3D.Active;
            if(!renderer.enabled)return;
            renderer.sharedMaterial=source.sharedMaterial;renderer.sortingOrder=source.sortingOrder;
            block.SetTexture(MainTex,source.sprite.texture);renderer.SetPropertyBlock(block);
            int n=NativeGroundSkillGeometry.Segments,side=n+1;
            float width=source.sprite.rect.width/source.sprite.pixelsPerUnit*Mathf.Abs(source.transform.lossyScale.x);
            float height=source.sprite.rect.height/source.sprite.pixelsPerUnit*Mathf.Abs(source.transform.lossyScale.y);
            double angle=source.transform.localEulerAngles.z*Math.PI/180;
            for(int y=0;y<=n;y++)for(int x=0;x<=n;x++) {
                var p=NativeGroundSkillGeometry.Place(px,py,(x/(float)n-.5f)*width,(y/(float)n-.5f)*height,angle,SampleHeight,NativeGroundSkillGeometry.SurfaceLift);
                int i=y*side+x;vertices[i]=go.transform.InverseTransformPoint(new Vector3(p.X,p.Y,p.Z));colors[i]=source.color;
            }
            mesh.vertices=vertices;mesh.colors=colors;mesh.RecalculateBounds();
        }

        static void Release(UnityEngine.Object o) { if(Application.isPlaying)UnityEngine.Object.Destroy(o);else UnityEngine.Object.DestroyImmediate(o); }
        public void Dispose() { Release(mesh);Release(go); }
    }
}
