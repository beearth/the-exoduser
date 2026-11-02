using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // Presentation only. Core positions/radii stay in pixels, with no change to hit tests.
    public static class NativeGroundSkillGeometry
    {
        public const int Segments = 16;
        public const float SurfaceLift = .025f, RingLift = .03f;
        public const float InteriorTolerance = .005f, MaxEdge = .35f;
        public const int MaxRefinement = 8;
        public struct Vertex { public float X, Y, Z, U, V; }
        public struct TextureProjection { public float Ux, Uz, Uo, Vx, Vz, Vo; }
        public sealed class SurfaceMesh { public Vertex[] Vertices; public int[] Triangles; public int OmittedTriangles; }

        public static float FootprintExtent(float left,float bottom,float width,float height)
        {
            float x=Math.Max(Math.Abs(left),Math.Abs(left+width)),z=Math.Max(Math.Abs(bottom),Math.Abs(bottom+height));
            return (float)Math.Sqrt(x*x+z*z);
        }
        // Rotate only the original texture over the static, world-aligned surface.
        // Sprite pivot, non-square scale, roll and flip all remain source-authored.
        public static TextureProjection TextureMap(float left,float bottom,float width,float height,double rotation,bool flipX,bool flipY)
        {
            float c=(float)Math.Cos(rotation),s=(float)Math.Sin(rotation),u=flipX?-1:1,v=flipY?-1:1;
            return new TextureProjection { Ux=u*c/width,Uz=u*s/width,Uo=(flipX?1:0)-u*left/width,
                Vx=-v*s/height,Vz=v*c/height,Vo=(flipY?1:0)-v*bottom/height };
        }

        // A fixed grid follows its vertices but can suspend the whole face above a
        // root/bridge edge. Refine only curved faces; never connect two support levels
        // with a sloping sheet. At a discontinuity the final, millimetre-wide face is
        // omitted instead. UVs remain the original planar footprint on either side.
        public static SurfaceMesh Tessellate(float px, float py, float left, float bottom,
            float width, float height, double rotation, Func<float, float, float> ground)
        {
            return new Builder(px, py, left, bottom, width, height, rotation, ground).Build();
        }

        sealed class GridKeyComparer : IEqualityComparer<long>
        {
            public static readonly GridKeyComparer Instance=new GridKeyComparer();
            public bool Equals(long a,long b) { return a==b; }
            public int GetHashCode(long value) { unchecked { ulong x=(ulong)value+0x9e3779b97f4a7c15UL;x=(x^(x>>30))*0xbf58476d1ce4e5b9UL;x=(x^(x>>27))*0x94d049bb133111ebUL;x^=x>>31;return (int)(x^(x>>32)); } }
        }
        sealed class Builder
        {
            const int Resolution = Segments << MaxRefinement;
            readonly float px, py, left, bottom, width, height;
            readonly double angle;
            readonly Func<float, float, float> ground;
            readonly Dictionary<long, Vertex> samples = new Dictionary<long, Vertex>(GridKeyComparer.Instance);
            readonly Dictionary<long, int> indices = new Dictionary<long, int>(GridKeyComparer.Instance);
            readonly List<Vertex> vertices = new List<Vertex>();
            readonly List<int> triangles = new List<int>();
            int omitted;
            public Builder(float px,float py,float left,float bottom,float width,float height,double angle,Func<float,float,float> ground)
            { this.px=px;this.py=py;this.left=left;this.bottom=bottom;this.width=width;this.height=height;this.angle=angle;this.ground=ground; }
            static long Key(int x,int y) { return ((long)x << 32) | (uint)y; }
            Vertex Sample(int x,int y)
            {
                long key=Key(x,y);Vertex p;
                if(samples.TryGetValue(key,out p))return p;
                float u=x/(float)Resolution,v=y/(float)Resolution;
                p=Place(px,py,left+width*u,bottom+height*v,angle,ground,SurfaceLift);p.U=u;p.V=v;
                samples.Add(key,p);return p;
            }
            int Index(int x,int y)
            {
                long key=Key(x,y);int index;
                if(indices.TryGetValue(key,out index))return index;
                index=vertices.Count;vertices.Add(Sample(x,y));indices.Add(key,index);return index;
            }
            bool Contact(Vertex a,Vertex b,Vertex c,float u,float v)
            {
                float w=1-u-v,x=a.X*w+b.X*u+c.X*v,z=a.Z*w+b.Z*u+c.Z*v;
                return Math.Abs(a.Y*w+b.Y*u+c.Y*v-ground(x,z)-SurfaceLift)<=InteriorTolerance;
            }
            static float Edge(Vertex a,Vertex b) { float x=a.X-b.X,z=a.Z-b.Z;return x*x+z*z; }
            bool BoundsContact(Vertex a,Vertex b,Vertex c)
            {
                float dx=b.X-a.X,dz=b.Z-a.Z,ex=c.X-a.X,ez=c.Z-a.Z,det=dx*ez-dz*ex;
                if(Math.Abs(det)<1e-12f)return false;
                float minX=Math.Min(a.X,Math.Min(b.X,c.X)),maxX=Math.Max(a.X,Math.Max(b.X,c.X));
                float minZ=Math.Min(a.Z,Math.Min(b.Z,c.Z)),maxZ=Math.Max(a.Z,Math.Max(b.Z,c.Z));
                // Include the bounding box: a bridge corner can cross a face while
                // all its vertices and ordinary interior probes miss the tiny sliver.
                for(int i=0;i<4;i++)
                {
                    float x=(i%2==0?minX:maxX)-a.X,z=(i<2?minZ:maxZ)-a.Z;
                    if(!Contact(a,b,c,(x*ez-z*ex)/det,(dx*z-dz*x)/det))return false;
                }
                return true;
            }
            void Triangle(int ax,int ay,int bx,int by,int cx,int cy,int depth)
            {
                Vertex a=Sample(ax,ay),b=Sample(bx,by),c=Sample(cx,cy);
                bool contact=Contact(a,b,c,.5f,0)&&Contact(a,b,c,0,.5f)&&Contact(a,b,c,.5f,.5f)&&
                    Contact(a,b,c,1f/3,1f/3)&&Contact(a,b,c,.25f,.25f)&&Contact(a,b,c,.5f,.25f)&&Contact(a,b,c,.25f,.5f)&&BoundsContact(a,b,c);
                if(contact&&Math.Max(Edge(a,b),Math.Max(Edge(a,c),Edge(b,c)))<=MaxEdge*MaxEdge)
                { triangles.Add(Index(ax,ay));triangles.Add(Index(bx,by));triangles.Add(Index(cx,cy));return; }
                if(depth==MaxRefinement) { omitted++;return; }
                int abx=(ax+bx)/2,aby=(ay+by)/2,acx=(ax+cx)/2,acy=(ay+cy)/2,bcx=(bx+cx)/2,bcy=(by+cy)/2;
                Triangle(ax,ay,abx,aby,acx,acy,depth+1);Triangle(abx,aby,bx,by,bcx,bcy,depth+1);
                Triangle(acx,acy,bcx,bcy,cx,cy,depth+1);Triangle(abx,aby,bcx,bcy,acx,acy,depth+1);
            }
            public SurfaceMesh Build()
            {
                int step=Resolution/Segments;
                for(int y=0;y<Resolution;y+=step)for(int x=0;x<Resolution;x+=step)
                { Triangle(x,y,x,y+step,x+step,y,0);Triangle(x+step,y,x,y+step,x+step,y+step,0); }
                return new SurfaceMesh { Vertices=vertices.ToArray(),Triangles=triangles.ToArray(),OmittedTriangles=omitted };
            }
        }

        public static Vertex Place(float px, float py, float dx, float dy, double rotation,
            Func<float, float, float> height, float lift)
        {
            double c = Math.Cos(rotation), s = Math.Sin(rotation);
            float x = px / 100 + (float)(dx * c - dy * s);
            float z = -py / 100 + (float)(dx * s + dy * c);
            return new Vertex { X = x, Y = height(x, z) + lift, Z = z };
        }
    }
}
