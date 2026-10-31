using System;

namespace Exoduser.UnityPort
{
    // 1-1 전체 숲의 시각 좌표. 원본 SourceMap은 유일한 보행/투사체 계약이다.
    public sealed class A2FieldLayout
    {
        readonly MapData data;
        readonly float[] signed;
        readonly float tile;
        const int SurfaceCells=501;
        const float SurfaceStep=.16f;
        float[] surfaces;
        float[] terrainSamples;
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
            float ground=TerrainHeight(x,z);
            float along=Math.Abs(A2ForestLayout.Along(x,z)),across=Math.Abs(A2ForestLayout.Across(x,z));
            float deck=(1-Smooth(Clamp((along-3.8f)/.8f,0,1)))*(1-Smooth(Clamp((across-1.4f)/.3f,0,1)));
            ground=Math.Max(ground,Lerp(ground,.12f,deck));
            if(surfaces==null||x<0||x>80||z>0||z< -80)return ground;
            float u=x/SurfaceStep,v=-z/SurfaceStep;int ix=Math.Min((int)u,SurfaceCells-2),iy=Math.Min((int)v,SurfaceCells-2);
            float a=Surface(ix,iy),b=Surface(ix+1,iy),c=Surface(ix,iy+1),d=Surface(ix+1,iy+1);
            return Math.Max(ground,Lerp(Lerp(a,b,u-ix),Lerp(c,d,u-ix),v-iy));
        }
        float Surface(int x,int y)
        {
            float value=surfaces[y*SurfaceCells+x];
            return float.IsNaN(value)?BaseSample(x,y):value;
        }
        float BaseSample(int x,int y) { int n=y*SurfaceCells+x;float v=terrainSamples[n];if(float.IsNaN(v)){v=TerrainHeight(x*SurfaceStep,-y*SurfaceStep);terrainSamples[n]=v;}return v; }
        public float TerrainHeight(float x,float z)
        {
            float d=Distance(x,z);
            float surface=.14f*(float)Math.Sin(x*.29+z*.12)+.10f*(float)Math.Cos(z*.31-x*.08)+.055f*(float)Math.Sin(x*.73-z*.37);
            surface+=.32f*(float)(Math.Sin(x*.12)*Math.Cos(z*.11));
            var h=data.hill;
            if(h!=null)
            {
                float dx=(x-h.cx*tile)/(h.rx*tile),dz=(-z-h.cy*tile)/(h.ry*tile);
                surface+=1.7f*(1-Smooth(Clamp(((float)Math.Sqrt(dx*dx+dz*dz)-.65f)/.7f,0,1)));
            }
            float outside=Smooth(Clamp(-d/2.8f,0,1));
            float east=Smooth(Clamp((x-43)/6,0,1))*(1-Smooth(Clamp((z+58)/12,0,1)));
            float northEast=Smooth(Clamp((x-62)/6,0,1))*Smooth(Clamp((z+34)/10,0,1));
            surface+=outside*(.25f-1.9f*Math.Max(east,northEast));
            // 키샷 지류는 발목 깊이의 실제 얕은 개울이다. 원본 XY 보행 경계는 바꾸지 않는다.
            float channel=1-Smooth(Clamp((A2ForestLayout.BranchDistance(x,z)+.15f)/1.4f,0,1));
            return Lerp(surface,-.55f,channel);
        }
        public bool Water(float x,float z) { return TerrainHeight(x,z)<-.45f; }
        // 낮은 쓰러진 고목·뿌리의 실제 삼각형을 래스터화한다. Core는 여전히 같은 XY 경계를 쓴다.
        public void RegisterSurface(float[] xyz,int[] triangles)
        {
            if(surfaces==null){surfaces=new float[SurfaceCells*SurfaceCells];terrainSamples=new float[surfaces.Length];for(int i=0;i<surfaces.Length;i++){surfaces[i]=float.NaN;terrainSamples[i]=float.NaN;}}
            for(int i=0;i<triangles.Length;i+=3)
            {
                int a=triangles[i]*3,b=triangles[i+1]*3,c=triangles[i+2]*3;
                float ax=xyz[a],az=-xyz[a+2],bx=xyz[b],bz=-xyz[b+2],cx=xyz[c],cz=-xyz[c+2];
                float det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.Abs(det)<.000001f)continue;
                float minX=Math.Min(ax,Math.Min(bx,cx)),maxX=Math.Max(ax,Math.Max(bx,cx)),minZ=Math.Min(az,Math.Min(bz,cz)),maxZ=Math.Max(az,Math.Max(bz,cz));
                if(maxX<0||minX>80||maxZ<0||minZ>80)continue;
                int x0=Math.Max(0,(int)Math.Floor(minX/SurfaceStep)),x1=Math.Min(SurfaceCells-1,(int)Math.Ceiling(maxX/SurfaceStep));
                int y0=Math.Max(0,(int)Math.Floor(minZ/SurfaceStep)),y1=Math.Min(SurfaceCells-1,(int)Math.Ceiling(maxZ/SurfaceStep));
                for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++)
                {
                    float px=x*SurfaceStep,pz=y*SurfaceStep;
                    float u=((bz-cz)*(px-cx)+(cx-bx)*(pz-cz))/det,v=((cz-az)*(px-cx)+(ax-cx)*(pz-cz))/det,w=1-u-v;
                    if(u<-.001f||v<-.001f||w<-.001f)continue;
                    float height=u*xyz[a+1]+v*xyz[b+1]+w*xyz[c+1],bed=BaseSample(x,y);
                    if(height<bed||height>bed+.9f)continue;
                    int n=y*SurfaceCells+x;if(float.IsNaN(surfaces[n])||height>surfaces[n])surfaces[n]=height;
                }
            }
        }
        public bool TreeSite(float x,float z,float radius) { return Distance(x,z)<-radius-.6f; }
        public static SourceMap CreateMap(MapData map) { return new SourceMap(map); }
        public static bool ShowEnemyStatus(bool alive,bool boss,bool damaged,bool targeted) { return alive&&!boss&&(damaged||targeted); }
        static float Clamp(float x,float min,float max) { return Math.Max(min,Math.Min(max,x)); }
        static float Lerp(float a,float b,float t) { return a+(b-a)*t; }
        static float Smooth(float t) { return t*t*(3-2*t); }
    }
}
