using System;

namespace Exoduser.UnityPort
{
    // 1-1 전체 숲의 시각 좌표. 원본 SourceMap은 유일한 보행/투사체 계약이다.
    public sealed class A2FieldLayout
    {
        readonly MapData data;
        readonly float[] signed;
        readonly float tile;
        public A2FieldLayout(MapData data)
        {
            this.data=data;tile=data.tileSize/100f;
            var toLand=new float[data.tiles.Length];var toForest=new float[data.tiles.Length];
            for(int i=0;i<signedLength(data);i++)
            {
                bool land=data.tiles[i]!=1;
                toLand[i]=land?0:10000;toForest[i]=land?10000:0;
            }
            Sweep(toLand);Sweep(toForest);signed=new float[data.tiles.Length];
            for(int i=0;i<signed.Length;i++)signed[i]=(data.tiles[i]!=1?toForest[i]-.5f:.5f-toLand[i])*tile;
        }
        static int signedLength(MapData map) { return map.tiles.Length; }
        void Sweep(float[] values)
        {
            int w=data.width,h=data.height;
            for(int y=0;y<h;y++)for(int x=0;x<w;x++)
            {
                int i=y*w+x;float d=values[i];
                if(x>0)d=Math.Min(d,values[i-1]+1);
                if(y>0){d=Math.Min(d,values[i-w]+1);if(x>0)d=Math.Min(d,values[i-w-1]+1.41421356f);if(x<w-1)d=Math.Min(d,values[i-w+1]+1.41421356f);}
                values[i]=d;
            }
            for(int y=h-1;y>=0;y--)for(int x=w-1;x>=0;x--)
            {
                int i=y*w+x;float d=values[i];
                if(x<w-1)d=Math.Min(d,values[i+1]+1);
                if(y<h-1){d=Math.Min(d,values[i+w]+1);if(x>0)d=Math.Min(d,values[i+w-1]+1.41421356f);if(x<w-1)d=Math.Min(d,values[i+w+1]+1.41421356f);}
                values[i]=d;
            }
        }
        public float Distance(float x,float z)
        {
            float px=x/tile-.5f,py=-z/tile-.5f;
            float u=Clamp(px,0,data.width-1),v=Clamp(py,0,data.height-1);
            int ix=Math.Min((int)u,data.width-2),iy=Math.Min((int)v,data.height-2);
            float dx=u-ix,dy=v-iy;
            float value=Lerp(Lerp(signed[iy*data.width+ix],signed[iy*data.width+ix+1],dx),Lerp(signed[(iy+1)*data.width+ix],signed[(iy+1)*data.width+ix+1],dx),dy);
            return value-(float)Math.Sqrt((px-u)*(px-u)+(py-v)*(py-v))*tile;
        }
        public float Height(float x,float z)
        {
            float d=Distance(x,z);
            float surface=.14f*(float)Math.Sin(x*.29+z*.12)+.10f*(float)Math.Cos(z*.31-x*.08)+.055f*(float)Math.Sin(x*.73-z*.37);
            // 바깥은 침식 둑→얕은 독액→침수 숲으로 이어진다. 배우도 같은 표면을 쓴다.
            float bank=Smooth(Clamp(-d/2.8f,0,1));
            return surface-bank*1.65f;
        }
        public bool Water(float x,float z) { return Distance(x,z)<-.8f&&Height(x,z)<-.45f; }
        public bool TreeSite(float x,float z,float radius) { return Distance(x,z)<-radius-.6f; }
        public static SourceMap CreateMap(MapData map) { return new SourceMap(map); }
        public static bool ShowEnemyStatus(bool alive,bool boss,bool damaged,bool targeted) { return alive&&!boss&&(damaged||targeted); }
        static float Clamp(float x,float min,float max) { return Math.Max(min,Math.Min(max,x)); }
        static float Lerp(float a,float b,float t) { return a+(b-a)*t; }
        static float Smooth(float t) { return t*t*(3-2*t); }
    }
}
