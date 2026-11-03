using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Presentation only: a sealed ground sheet, existing forest meshes on the collision contour.
    public static class NativeArena3DPlan
    {
        public const int Margin=128;
        public const float Tile=BossArenaLayout.TileSize/100f,GroundHeight=0;
        public struct Vertex
        {
            public float X,Y,Z;
            public Vertex(float x,float y,float z)
            {
                X=x;
                Y=y;
                Z=z;
            }
        }
        public struct Grove
        {
            public float X,Z,Yaw,Height;
            public bool South;
        }
        public sealed class Geometry
        {
            public readonly List<Vertex> Vertices=new List<Vertex>();
            public readonly List<int> Triangles=new List<int>();
        }
        public static Geometry Build(BossArenaLayout a)
        {
            if(a==null||a.Tiles==null||a.Tiles.Length!=BossArenaLayout.Width*BossArenaLayout.Height)throw new ArgumentException("Invalid BossArenaLayout");
            var g=new Geometry();
            float x=-Margin*Tile,z=Margin*Tile,xx=(BossArenaLayout.Width+Margin)*Tile,zz=-(BossArenaLayout.Height+Margin)*Tile;
            g.Vertices.AddRange(new[]
            {
                new Vertex(x,0,z),new Vertex(xx,0,z),new Vertex(xx,0,zz),new Vertex(x,0,zz)
            }
            );
            g.Triangles.AddRange(new[]
            {
                0,1,2,0,2,3
            }
            );
            return g;
        }
        public static List<Grove> Forest(BossArenaLayout a)
        {
            var result=new List<Grove>();
            float cx=(a.RoomCx+.5f)*Tile,cy=(a.RoomCy+.5f)*Tile;
            for(int i=0;i<72;i++)
            {
                double angle=i*Math.PI*2/72;
                float dx=(float)Math.Cos(angle),dy=(float)Math.Sin(angle),r=0;
                while(r<80&&!a.Blocked((cx+dx*r)*100,(cy+dy*r)*100))r+=.2f;
                float bx=cx+dx*r,by=cy+dy*r;
                if(Math.Abs(bx-(a.ExitX+.5f)*Tile)<2.2f&&by<cy)continue;
                bool south=dy>.35f;
                float offset=south?4:1.6f;
                result.Add(new Grove
                {
                    X=bx+dx*offset,Z=-(by+dy*offset),Yaw=i*137.507f,Height=3+(float)(1+Math.Sin(i*2.399)) *1.5f,South=south
                }
                );
            }
            return result;
        }
    }
    public sealed class NativeArena3DCameraState
    {
        public const float FieldDistance=16.5f,BossDistance=16.5f,TransitionSeconds=.6f;
        public float Distance
        {
            get
            {
                return FieldDistance;
            }
        }
        public void Step(bool bossOrSink,float seconds)
        {
        }
    }
}
