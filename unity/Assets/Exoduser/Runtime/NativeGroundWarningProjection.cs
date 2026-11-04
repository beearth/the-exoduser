using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    // Extrude the existing uniformly coloured warning triangles into projector
    // volumes. The visible pixels come from receiver depth, never these faces.
    public sealed class NativeGroundWarningProjection : IDisposable
    {
        readonly MeshRenderer renderer;readonly MeshFilter filter;readonly Mesh source,volume;
        readonly Material original;readonly bool priorForceOff;readonly uint priorRenderingLayer;readonly MaterialPropertyBlock saved=new MaterialPropertyBlock(),block=new MaterialPropertyBlock();
        readonly List<Vector3> vertices=new List<Vector3>();readonly List<Color> colors=new List<Color>();readonly List<int> indices=new List<int>();
        readonly List<Vector4> ab=new List<Vector4>();readonly List<Vector2> cc=new List<Vector2>();
        readonly HashSet<(int,int,int)> triangles=new HashSet<(int,int,int)>();
        static readonly int[] faces={0,1,2,3,5,4,0,3,1,1,3,4,1,4,2,2,4,5,2,5,0,0,5,3};
        public NativeGroundWarningProjection(MeshRenderer value,Mesh mesh)
        {
            renderer=value;filter=value.GetComponent<MeshFilter>();source=mesh;original=value.sharedMaterial;priorForceOff=value.forceRenderingOff;priorRenderingLayer=value.renderingLayerMask;value.GetPropertyBlock(saved);
            volume=new Mesh{name="Receiver-projected warning volumes",indexFormat=IndexFormat.UInt32};
        }
        public void Update(IList<Vector3> points,IList<Color> tint,IList<int> faces2D)
        {
            if(!NativeRemodel3D.Active){Restore();return;}
            renderer.forceRenderingOff=true;NativeGroundSkillProjection.UnregisterVolume(renderer);
            if(!NativeGroundSkillProjection.Available||points.Count==0)return;
            bool linear=QualitySettings.activeColorSpace==ColorSpace.Linear;
            vertices.Clear();colors.Clear();indices.Clear();ab.Clear();cc.Clear();triangles.Clear();
            float minX=float.PositiveInfinity,maxX=float.NegativeInfinity,minZ=minX,maxZ=maxX;
            foreach(var p in points){minX=Mathf.Min(minX,p.x);maxX=Mathf.Max(maxX,p.x);minZ=Mathf.Min(minZ,p.y);maxZ=Mathf.Max(maxZ,p.y);}
            // One height query per warning layer, not per vertex or triangle.
            float centerY=NativeRemodel3D.Point((minX+maxX)*50,-(minZ+maxZ)*50).y,low=centerY-8,high=centerY+8;
            var inverse=renderer.worldToLocalMatrix;
            for(int i=0;i+2<faces2D.Count;i+=3)
            {
                int ia=faces2D[i],ib=faces2D[i+1],ic=faces2D[i+2],lo=Math.Min(ia,Math.Min(ib,ic)),hi=Math.Max(ia,Math.Max(ib,ic));
                if(!triangles.Add((lo,ia+ib+ic-lo-hi,hi)))continue; // source has both windings
                var a=points[ia];var b=points[ib];var c=points[ic];
                float area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Mathf.Abs(area)<.00000001f)continue;
                if(area<0){var swap=b;b=c;c=swap;}
                int start=vertices.Count;var uv=new Vector4(a.x,a.y,b.x,b.y);var last=new Vector2(c.x,c.y);
                // The projection shader writes vertex colours as linear values; callers pass sRGB tints (VFX palette hex).
                // Without this conversion a Linear project lifted the dark toxic stain to an opaque-looking mint disc (G2 capture 11-04).
                var tc=linear?tint[ia].linear:tint[ia];
                for(int v=0;v<6;v++){var p=v%3==0?a:v%3==1?b:c;vertices.Add(inverse.MultiplyPoint3x4(new Vector3(p.x,v<3?low:high,p.y)));colors.Add(tc);ab.Add(uv);cc.Add(last);}
                foreach(int index in faces)indices.Add(start+index);
            }
            volume.Clear();volume.SetVertices(vertices);volume.SetColors(colors);volume.SetUVs(1,ab);volume.SetUVs(2,cc);volume.SetTriangles(indices,0,false);volume.RecalculateBounds();
            filter.sharedMesh=volume;renderer.sharedMaterial=NativeGroundSkillProjection.MaterialFor((int)BlendMode.OneMinusSrcAlpha);
            block.Clear();block.SetFloat("_GroundVertexShape",1);block.SetVector("_GroundShapeHeight",new Vector4(low,high,0,0));renderer.SetPropertyBlock(block);
            renderer.forceRenderingOff=priorForceOff;NativeGroundSkillProjection.RegisterVolume(renderer);
        }
        void Restore()
        {
            NativeGroundSkillProjection.UnregisterVolume(renderer);if(renderer==null)return;
            filter.sharedMesh=source;renderer.sharedMaterial=original;renderer.forceRenderingOff=priorForceOff;renderer.renderingLayerMask=priorRenderingLayer;renderer.SetPropertyBlock(saved);
        }
        public void Dispose(){Restore();if(Application.isPlaying)UnityEngine.Object.Destroy(volume);else UnityEngine.Object.DestroyImmediate(volume);}
    }
}
