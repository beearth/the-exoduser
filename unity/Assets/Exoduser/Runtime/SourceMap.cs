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
        [NonSerialized] public Core.FieldLayout fieldLayout;
    }
    [Serializable] public sealed class MapEllipse { public float x,y,rx,ry; }
    [Serializable] public sealed class MapChunk { public string texture; public float x,y,width,height; public int sx,sy,sw,sh; }
    [Serializable] public sealed class MapProp { public string id,texture; public float x,y,width,height,pivotX,pivotY,rotation,alpha; public bool ground,flip; }
    [Serializable] public sealed class MapHill { public float cx,cy,rx,ry,inner,outer,rampX0,rampX1,rampY,rampHalf0,rampHalf1; }

    // Original collision geometry, including analytic hill ramp and prop ellipses.
    // world.gd:3317-3375 corresponds to source canMv's four corner samples.
    public sealed class SourceMap
    {
        // Experimental 2D data; the shipped JSON and the k=1 instance remain untouched.
        public static MapData CreateFieldData(MapData source, Core.FieldLayout layout)
        {
            if(layout==null)throw new ArgumentNullException(nameof(layout));
            if(layout.IsOriginal)return source;
            if(source.width!=200||source.height!=200||source.tileSize!=40||source.fieldLayout!=null)throw new ArgumentException("Scale requires the original CH1 field");
            double k=layout.Scale;
            var d=new MapData{width=(int)Math.Round(source.width*k),height=(int)Math.Round(source.height*k),tileSize=source.tileSize,
                startX=(float)(source.startX*k),startY=(float)(source.startY*k),fieldLayout=layout};
            d.tiles=new int[d.width*d.height];
            for(int y=0;y<d.height;y++)for(int x=0;x<d.width;x++) {
                int ox=(int)Math.Floor((x+.5)/k),oy=(int)Math.Floor((y+.5)/k);
                int t=ox<source.width&&oy<source.height?source.tiles[oy*source.width+ox]:1;
                d.tiles[y*d.width+x]=(t==2||t==3)?0:t;
            }
            int gx=(int)Math.Floor(4020*k/d.tileSize),gy=(int)Math.Floor(220*k/d.tileSize),ey=(int)Math.Floor(300*k/d.tileSize);
            for(int x=gx-1;x<=gx+1;x++){d.tiles[gy*d.width+x]=3;d.tiles[ey*d.width+x]=2;}
            if(source.colliders!=null){d.colliders=new MapEllipse[source.colliders.Length];for(int i=0;i<d.colliders.Length;i++){
                var c=source.colliders[i];d.colliders[i]=new MapEllipse{x=(float)(c.x*k),y=(float)(c.y*k),rx=c.rx,ry=c.ry};
            }}
            if(source.hill!=null){var h=source.hill;d.hill=new MapHill{cx=(float)(h.cx*k),cy=(float)(h.cy*k),rx=(float)(h.rx*k),ry=(float)(h.ry*k),inner=h.inner,outer=h.outer,
                rampX0=(float)(h.rampX0*k),rampX1=(float)(h.rampX1*k),rampY=(float)(h.rampY*k),rampHalf0=(float)(h.rampHalf0*k),rampHalf1=(float)(h.rampHalf1*k)};}
            if(source.props!=null){d.props=new MapProp[source.props.Length];for(int i=0;i<d.props.Length;i++){
                var p=source.props[i];d.props[i]=new MapProp{id=p.id,texture=p.texture,x=(float)(p.x*k),y=(float)(p.y*k),width=p.width,height=p.height,
                    pivotX=p.pivotX,pivotY=p.pivotY,rotation=p.rotation,alpha=p.alpha,ground=p.ground,flip=p.flip};
            }}
            if(source.chunks!=null){d.chunks=new MapChunk[source.chunks.Length];for(int i=0;i<d.chunks.Length;i++){
                var c=source.chunks[i];d.chunks[i]=new MapChunk{texture=c.texture,x=(float)(c.x*k),y=(float)(c.y*k),width=(float)(c.width*k),height=(float)(c.height*k),sx=c.sx,sy=c.sy,sw=c.sw,sh=c.sh};
            }}
            return d;
        }
        public readonly MapData Data;
        readonly Func<float,float,bool> additionalBlocked;
        readonly Func<float,float,bool> additionalProjectileBlocked;
        public SourceMap(MapData data):this(data,null) { }
        public SourceMap(MapData data,Func<float,float,bool> additionalBlocked):this(data,additionalBlocked,additionalBlocked) { }
        public SourceMap(MapData data,Func<float,float,bool> additionalBlocked,Func<float,float,bool> additionalProjectileBlocked)
        {
            if(data==null || data.width<=0 || data.height<=0 || data.tileSize<=0 ||
               data.tiles==null || data.tiles.Length!=data.width*data.height)
                throw new ArgumentException("Invalid original map data");
            Data=data;
            this.additionalBlocked=additionalBlocked;
            this.additionalProjectileBlocked=additionalProjectileBlocked;
        }
        public bool CanMove(float x,float y,float radius)
        {
            if(!Finite(x)||!Finite(y)||!Finite(radius)||radius<0) return false;
            return !Blocked(x-radius,y-radius) && !Blocked(x+radius,y-radius) &&
                   !Blocked(x-radius,y+radius) && !Blocked(x+radius,y+radius);
        }
        public int DisplayTile(int x,int y)
        {
            if(x<0||y<0||x>=Data.width||y>=Data.height)return 1;
            if(additionalBlocked!=null&&additionalBlocked((x+.5f)*Data.tileSize,(y+.5f)*Data.tileSize))return 1;
            return Data.tiles[y*Data.width+x];
        }
        public bool LineOfSight(float x0,float y0,float x1,float y1)
        {
            if(!Finite(x0)||!Finite(y0)||!Finite(x1)||!Finite(y1))return false;
            double dx=x1-x0,dy=y1-y0;
            int steps=Math.Max(1,(int)(Math.Sqrt(dx*dx+dy*dy)/16));
            for(int i=1;i<steps;i++) if(ProjectileBlocked(x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps)) return false;
            return true;
        }
        public bool Blocked(float x,float y)
        { return BlockedWith(x,y,additionalBlocked); }
        public bool ProjectileBlocked(float x,float y)
        { return BlockedWith(x,y,additionalProjectileBlocked); }
        bool BlockedWith(float x,float y,Func<float,float,bool> extra)
        {
            if(!Finite(x)||!Finite(y)||x<0||y<0||x>=Data.width*Data.tileSize||y>=Data.height*Data.tileSize)return true;
            if(extra!=null&&extra(x,y))return true;
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
