using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // RB1-8a presentation only. No collision, RNG, player or arena tile writes.
    public static class NativeArena3DPlan
    {
        public const int Margin = 128; // 51.2m of closed background beyond each Core edge, including 32:9.
        public const float Tile = BossArenaLayout.TileSize / 100f, GroundHeight = 0;
        public struct Vertex { public float X,Y,Z; public Vertex(float x,float y,float z){X=x;Y=y;Z=z;} }
        public sealed class Geometry
        {
            public readonly List<Vertex> Vertices = new List<Vertex>();
            public readonly List<int> Triangles = new List<int>();
            public int TopCells,FloorCells,WallCells;
            public float MinWallHeight=6,MaxWallHeight=3;
            internal void Quad(Vertex a,Vertex b,Vertex c,Vertex d)
            {int n=Vertices.Count;Vertices.Add(a);Vertices.Add(b);Vertices.Add(c);Vertices.Add(d);Triangles.Add(n);Triangles.Add(n+1);Triangles.Add(n+2);Triangles.Add(n);Triangles.Add(n+2);Triangles.Add(n+3);}
        }
        static bool Wall(BossArenaLayout a,int x,int y){return x<0||y<0||x>=BossArenaLayout.Width||y>=BossArenaLayout.Height||a.Tiles[y*BossArenaLayout.Width+x]==1;}
        static float Height(int x,int y){return (float)(4.5+1.5*Math.Sin(x*.093)*Math.Cos(y*.081));}
        public static Geometry Build(BossArenaLayout a)
        {
            if(a==null||a.Tiles==null||a.Tiles.Length!=BossArenaLayout.Width*BossArenaLayout.Height)throw new ArgumentException("Invalid BossArenaLayout");
            var g=new Geometry();
            for(int y=-Margin;y<BossArenaLayout.Height+Margin;y++)for(int x=-Margin;x<BossArenaLayout.Width+Margin;x++)
            {
                bool wall=Wall(a,x,y);float x0=x*Tile,x1=(x+1)*Tile,z0=-y*Tile,z1=-(y+1)*Tile;
                float h0=wall?Height(x,y):GroundHeight,h1=wall?Height(x+1,y):GroundHeight,h2=wall?Height(x+1,y+1):GroundHeight,h3=wall?Height(x,y+1):GroundHeight;
                var p0=new Vertex(x0,h0,z0);var p1=new Vertex(x1,h1,z0);var p2=new Vertex(x1,h2,z1);var p3=new Vertex(x0,h3,z1);
                g.Quad(p0,p1,p2,p3);g.TopCells++;
                if(!wall){g.FloorCells++;continue;}
                g.WallCells++;g.MinWallHeight=Math.Min(g.MinWallHeight,Math.Min(Math.Min(h0,h1),Math.Min(h2,h3)));g.MaxWallHeight=Math.Max(g.MaxWallHeight,Math.Max(Math.Max(h0,h1),Math.Max(h2,h3)));
                if(!Wall(a,x,y-1))g.Quad(new Vertex(x0,0,z0),new Vertex(x1,0,z0),p1,p0);
                if(!Wall(a,x+1,y))g.Quad(new Vertex(x1,0,z0),new Vertex(x1,0,z1),p2,p1);
                if(!Wall(a,x,y+1))g.Quad(new Vertex(x1,0,z1),new Vertex(x0,0,z1),p3,p2);
                if(!Wall(a,x-1,y))g.Quad(new Vertex(x0,0,z1),new Vertex(x0,0,z0),p0,p3);
            }
            return g;
        }
    }
    public sealed class NativeArena3DCameraState
    {
        public const float FieldDistance=16.5f,BossDistance=18.3f,TransitionSeconds=.6f;
        public float Distance { get; private set; } = FieldDistance;
        float start=FieldDistance,target=FieldDistance,elapsed=TransitionSeconds;
        public void Step(bool bossOrSink,float seconds)
        {
            float next=bossOrSink?BossDistance:FieldDistance;
            if(next!=target){start=Distance;target=next;elapsed=0;}
            elapsed=Math.Min(TransitionSeconds,elapsed+Math.Max(0,seconds));
            float t=elapsed/TransitionSeconds;t=t*t*(3-2*t);Distance=start+(target-start)*t;
        }
    }
}
