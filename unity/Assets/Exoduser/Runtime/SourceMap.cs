using System;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class MapData
    {
        public int width, height, tileSize;
        public float startX, startY;
        public int[] tiles;
        public MapEllipse[] colliders;
        public MapChunk[] chunks;
        public MapProp[] props;
        public MapHill hill;
    }
    [Serializable] public sealed class MapEllipse { public float x,y,rx,ry; }
    [Serializable] public sealed class MapChunk { public string texture; public float x,y,width,height; public int sx,sy,sw,sh; }
    [Serializable] public sealed class MapProp { public string id,texture; public float x,y,width,height,pivotX,pivotY,rotation,alpha; public bool ground,flip; }
    [Serializable] public sealed class MapHill { public float cx,cy,rx,ry,inner,outer,rampX0,rampX1,rampY,rampHalf0,rampHalf1; }

    // Original collision geometry, including analytic hill ramp and prop ellipses.
    // world.gd:3317-3375 corresponds to source canMv's four corner samples.
    public sealed class SourceMap
    {
        public readonly MapData Data;
        readonly Func<float,float,bool> additionalBlocked;
        public SourceMap(MapData data,Func<float,float,bool> additionalBlocked=null)
        {
            if(data==null || data.width<=0 || data.height<=0 || data.tileSize<=0 ||
               data.tiles==null || data.tiles.Length!=data.width*data.height)
                throw new ArgumentException("Invalid original map data");
            Data=data;
            this.additionalBlocked=additionalBlocked;
        }
        public bool CanMove(float x,float y,float radius)
        {
            if(!Finite(x)||!Finite(y)||!Finite(radius)||radius<0) return false;
            return !Blocked(x-radius,y-radius) && !Blocked(x+radius,y-radius) &&
                   !Blocked(x-radius,y+radius) && !Blocked(x+radius,y+radius);
        }
        public bool LineOfSight(float x0,float y0,float x1,float y1)
        {
            if(!Finite(x0)||!Finite(y0)||!Finite(x1)||!Finite(y1))return false;
            double dx=x1-x0,dy=y1-y0;
            int steps=Math.Max(1,(int)(Math.Sqrt(dx*dx+dy*dy)/16));
            for(int i=1;i<steps;i++) if(Blocked(x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps)) return false;
            return true;
        }
        public bool Blocked(float x,float y)
        {
            if(!Finite(x)||!Finite(y)||x<0||y<0||x>=Data.width*Data.tileSize||y>=Data.height*Data.tileSize)return true;
            if(additionalBlocked!=null&&additionalBlocked(x,y))return true;
            int tx=(int)Math.Floor(x/Data.tileSize),ty=(int)Math.Floor(y/Data.tileSize);
            {int tv=Data.tiles[ty*Data.width+tx];if(tv==1||tv==3)return true;}   // 3 = boss gate tile: the web blocks it with boss_gate_col (C04-2)
            var h=Data.hill;
            if(h!=null)
            {
                float px=x/Data.tileSize,py=y/Data.tileSize;
                bool ramp=false;
                if(px>=h.rampX0&&px<=h.rampX1)
                {
                    float t=(px-h.rampX0)/(h.rampX1-h.rampX0);
                    ramp=Math.Abs(py-h.rampY)<=h.rampHalf0+(h.rampHalf1-h.rampHalf0)*t;
                }
                if(!ramp)
                {
                    float qx=(px-h.cx)/h.rx,qy=(py-h.cy)/h.ry;
                    float d=(float)Math.Sqrt(qx*qx+qy*qy);
                    if(d>=h.inner&&d<=h.outer)return true;
                }
            }
            if(Data.colliders!=null)foreach(var c in Data.colliders)
            {
                float qx=(x-c.x)/c.rx,qy=(y-c.y)/c.ry;
                if(qx*qx+qy*qy<1)return true;
            }
            return false;
        }
        static bool Finite(float value) { return !float.IsNaN(value)&&!float.IsInfinity(value); }
    }
}
