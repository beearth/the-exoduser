using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // 11-08 ×2 필드: Core.FieldLayout.Scale(k, 1~2)을 3D 표현층이 읽는 단일 지점. k=1이면 모든 곱셈이 항등이라 ×1 동작은 그대로다.
    // 손으로 넣은 월드 좌표(지역 중심·다리·랜드마크·횃불 등)는 위치만 ×K로 옮기고 크기·반경·높이·카메라·안개는 그대로 둔다.
    // FieldSize(m)는 MapData(width×tileSize/100)와 같다: 200×40/100=80, k=2면 400×40/100=160. A2FieldLayout 생성 때 MapData와 대조한다.
    public static class A2Scale
    {
        public const float BaseFieldSize=80;
        public static readonly float K=(float)Core.FieldLayout.FromArguments(Environment.GetCommandLineArgs()).Scale;
        public static readonly float FieldSize=BaseFieldSize*K;
        public static float FieldSizeOf(MapData data) { return data.width*data.tileSize/100f; }
    }
    // 1-1 전체 숲의 시각 좌표. 원본 SourceMap은 유일한 보행/투사체 계약이다.
    public sealed class A2FieldLayout
    {
        // 지면 메시 범위: 필드 밖 여백(-25 / +105 / +60 / +105)은 그대로, 필드 한 변만 FieldSize로 늘린다.
        public static readonly float GroundMinX=-105,GroundMaxX=A2Scale.FieldSize+105,GroundMinZ=-A2Scale.FieldSize-105,GroundMaxZ=105;
        public static float[] GroundAxis(bool xAxis)
        {
            float F=A2Scale.FieldSize;
            float min=xAxis?GroundMinX:GroundMinZ,max=xAxis?GroundMaxX:GroundMaxZ,nearMin=xAxis?-45:-F-45,nearMax=xAxis?F+45:45;
            var values=new List<float>();
            for(float v=min;v<nearMin;v+=2)values.Add(v);
            for(float v=nearMin;v<=nearMax;v+=.25f)values.Add(v);
            for(float v=nearMax+2;v<max;v+=2)values.Add(v);
            values.Add(max);return values.ToArray();
        }
        // 시각 메시만 원본 막힌 영역 쪽으로 접는다. SourceMap/Collider는 절대 바꾸지 않는다.
        readonly SourceMap treeBoundary;
        public bool FitTreePoint(float x,float z,float centerX,float centerZ,out float fittedX,out float fittedZ)
        {
            fittedX=x;fittedZ=z;
            if(!treeBoundary.CanMove(x*100,-z*100,0)||treeBoundary.CanMove(centerX*100,-centerZ*100,0))return false;
            float low=0,high=1;
            for(int i=0;i<18;i++)
            {
                float t=(low+high)*.5f,px=Lerp(x,centerX,t),pz=Lerp(z,centerZ,t);
                if(treeBoundary.CanMove(px*100,-pz*100,0))low=t;else high=t;
            }
            float dx=centerX-x,dz=centerZ-z,length=(float)Math.Sqrt(dx*dx+dz*dz);
            float inset=Math.Min(1,high+.02f/Math.Max(.0001f,length));
            fittedX=Lerp(x,centerX,inset);fittedZ=Lerp(z,centerZ,inset);return true;
        }
        readonly MapData data;
        readonly float[] signed;
        readonly float tile;
        // 11-08: 면적 격자 칸 수 = FieldSize/SurfaceStep+1 (×1 501, ×2 1001). 칸 간격 .16m는 그대로.
        readonly float fieldSize;
        readonly int SurfaceCells;
        const float SurfaceStep=.16f;
        public float FieldSize { get { return fieldSize; } }
        float[] surfaces;
        float[] terrainSamples;
        readonly System.Collections.Generic.List<DeckTriangle> deckTriangles=new System.Collections.Generic.List<DeckTriangle>();
        readonly Dictionary<long,List<int>> deckCells=new Dictionary<long,List<int>>();
        static long DeckCell(int x,int z) { return ((long)x<<32)|unchecked((uint)z); }
        float deckMinX=float.PositiveInfinity,deckMaxX=float.NegativeInfinity,deckMinZ=float.PositiveInfinity,deckMaxZ=float.NegativeInfinity;
        struct DeckTriangle { public float ax,ay,az,bx,by,bz,cx,cy,cz,inverse,minX,maxX,minZ,maxZ; }
        public A2FieldLayout(MapData data)
        {
            this.data=data;tile=data.tileSize/100f;treeBoundary=new SourceMap(data);
            fieldSize=A2Scale.FieldSizeOf(data);SurfaceCells=(int)Math.Round(fieldSize/SurfaceStep)+1;
            if(Math.Abs(fieldSize-A2Scale.FieldSize)>.001f)throw new InvalidOperationException("A2 field size "+fieldSize+" != A2Scale "+A2Scale.FieldSize);
            var toLand=new float[data.tiles.Length];var toForest=new float[data.tiles.Length];
            for(int i=0;i<signedLength(data);i++)
            {
                bool land=data.tiles[i]!=1;
                toLand[i]=land?0:10000;toForest[i]=land?10000:0;
            }
            Sweep(toLand);Sweep(toForest);signed=new float[data.tiles.Length];
            for(int i=0;i<signed.Length;i++)signed[i]=(data.tiles[i]!=1?toForest[i]-.5f:.5f-toLand[i])*tile;
        }
        static int BridgeRoot(int[] parents,int i)
        {
            while(parents[i]!=i){parents[i]=parents[parents[i]];i=parents[i];}return i;
        }
        // 기존 메시의 용접된 연결 성분 중 세로 지지목만 찾는다. 상판/난간/UV/인덱스는 보존한다.
        public int ExtendBridgeSupports(float[] xyz,int[] triangles)
        {
            int n=xyz.Length/3;var parents=new int[n];var weld=new Dictionary<string,int>();
            for(int i=0;i<n;i++)
            {
                parents[i]=i;string key=Math.Round(xyz[i*3]*10000)+"/"+Math.Round(xyz[i*3+1]*10000)+"/"+Math.Round(xyz[i*3+2]*10000);int other;
                if(weld.TryGetValue(key,out other))parents[BridgeRoot(parents,i)]=BridgeRoot(parents,other);else weld.Add(key,i);
            }
            for(int i=0;i<triangles.Length;i+=3)
            {
                parents[BridgeRoot(parents,triangles[i])]=BridgeRoot(parents,triangles[i+1]);
                parents[BridgeRoot(parents,triangles[i])]=BridgeRoot(parents,triangles[i+2]);
            }
            var groups=new Dictionary<int,List<int>>();
            for(int i=0;i<n;i++){int key=BridgeRoot(parents,i);List<int> group;if(!groups.TryGetValue(key,out group)){group=new List<int>();groups.Add(key,group);}group.Add(i);}
            int changed=0;
            foreach(var pair in groups)
            {
                float minX=float.PositiveInfinity,minY=minX,minZ=minX,maxX=float.NegativeInfinity,maxY=maxX,maxZ=maxX;
                foreach(int i in pair.Value){minX=Math.Min(minX,xyz[i*3]);maxX=Math.Max(maxX,xyz[i*3]);minY=Math.Min(minY,xyz[i*3+1]);maxY=Math.Max(maxY,xyz[i*3+1]);minZ=Math.Min(minZ,xyz[i*3+2]);maxZ=Math.Max(maxZ,xyz[i*3+2]);}
                if(maxY-minY<.7f||maxX-minX>.6f||maxZ-minZ>.6f||minY>.05f||maxY<.6f)continue;
                float floor=TerrainHeight((minX+maxX)*.5f,(minZ+maxZ)*.5f)-.12f;
                if(floor>=minY-.03f)continue;
                foreach(int i in pair.Value)
                {
                    float y=xyz[i*3+1];if(y>=.10f)continue;
                    float weight=Smooth(Clamp((.10f-y)/(.10f-minY),0,1));xyz[i*3+1]=y+(floor-minY)*weight;
                }
                changed++;
            }
            return changed;
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
            // 원형 상판이 등록되면 이전 사각형 폴백을 발판으로 남기지 않는다.
            if(deckTriangles.Count==0)ground=Math.Max(ground,Lerp(ground,.12f,deck));
            if(surfaces!=null&&x>=0&&x<=fieldSize&&z<=0&&z>=-fieldSize)
            {
                float u=x/SurfaceStep,v=-z/SurfaceStep;int ix=Math.Min((int)u,SurfaceCells-2),iy=Math.Min((int)v,SurfaceCells-2);
                float a=Surface(ix,iy),b=Surface(ix+1,iy),c=Surface(ix,iy+1),d=Surface(ix+1,iy+1);
                ground=Math.Max(ground,Lerp(Lerp(a,b,u-ix),Lerp(c,d,u-ix),v-iy));
            }
            return DeckHeight(x,z,ground);
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
            surface=Math.Max(surface,-.25f);
            float outside=Smooth(Clamp(-d/2.8f,0,1));
            float K=A2Scale.K;   // 늪 경계의 위치(43·62·-58·-34)만 ×K, 램프 폭(6·12·10)과 사인 파장은 그대로
            float east=Smooth(Clamp((x-43*K)/6,0,1))*(1-Smooth(Clamp((z+58*K)/12,0,1)));
            float northEast=Smooth(Clamp((x-62*K)/6,0,1))*Smooth(Clamp((z+34*K)/10,0,1));
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
                if(maxX<0||minX>fieldSize||maxZ<0||minZ>fieldSize)continue;
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
        // 목교의 얇은 널빤지는 16cm 격자에 투영하지 않고 원형 삼각형을 그대로 조회한다.
        // ceiling은 해당 모델의 상판 상한이며 높은 난간을 발판으로 등록하지 않는다.
        public void RegisterDeckSurface(float[] xyz,int[] indices,float ceiling)
        {
            for(int i=0;i<indices.Length;i+=3)
            {
                int a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
                float ax=xyz[a],az=xyz[a+2],bx=xyz[b],bz=xyz[b+2],cx=xyz[c],cz=xyz[c+2];
                float det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);
                if(Math.Abs(det)<.000001f||Math.Max(xyz[a+1],Math.Max(xyz[b+1],xyz[c+1]))>ceiling)continue;
                float minX=Math.Min(ax,Math.Min(bx,cx)),maxX=Math.Max(ax,Math.Max(bx,cx)),minZ=Math.Min(az,Math.Min(bz,cz)),maxZ=Math.Max(az,Math.Max(bz,cz));
                int triangle=deckTriangles.Count;
                deckTriangles.Add(new DeckTriangle{ax=ax,ay=xyz[a+1],az=az,bx=bx,by=xyz[b+1],bz=bz,cx=cx,cy=xyz[c+1],cz=cz,inverse=1/det,minX=minX,maxX=maxX,minZ=minZ,maxZ=maxZ});
                for(int cellZ=(int)Math.Floor((minZ-.0001f)*2);cellZ<=(int)Math.Floor((maxZ+.0001f)*2);cellZ++)
                    for(int cellX=(int)Math.Floor((minX-.0001f)*2);cellX<=(int)Math.Floor((maxX+.0001f)*2);cellX++)
                    {
                        long key=DeckCell(cellX,cellZ);List<int> members;
                        if(!deckCells.TryGetValue(key,out members)){members=new List<int>();deckCells.Add(key,members);}members.Add(triangle);
                    }
                deckMinX=Math.Min(deckMinX,minX);deckMaxX=Math.Max(deckMaxX,maxX);deckMinZ=Math.Min(deckMinZ,minZ);deckMaxZ=Math.Max(deckMaxZ,maxZ);
            }
        }
        bool DeckSample(float x,float z,out float height)
        {
            height=float.NegativeInfinity;
            List<int> members;if(!deckCells.TryGetValue(DeckCell((int)Math.Floor(x*2),(int)Math.Floor(z*2)),out members))return false;
            for(int i=0;i<members.Count;i++)
            {
                var t=deckTriangles[members[i]];if(x<t.minX-.0001f||x>t.maxX+.0001f||z<t.minZ-.0001f||z>t.maxZ+.0001f)continue;
                float u=((t.bz-t.cz)*(x-t.cx)+(t.cx-t.bx)*(z-t.cz))*t.inverse;
                float v=((t.cz-t.az)*(x-t.cx)+(t.ax-t.cx)*(z-t.cz))*t.inverse,w=1-u-v;
                if(u<-.0001f||v<-.0001f||w<-.0001f)continue;
                height=Math.Max(height,u*t.ay+v*t.by+w*t.cy);
            }
            return !float.IsNegativeInfinity(height);
        }
        static readonly float[,] FootprintDirections=new float[,]{{1,0},{.70710678f,.70710678f},{0,1},{-.70710678f,.70710678f},{-1,0},{-.70710678f,-.70710678f},{0,-1},{.70710678f,-.70710678f}};
        float DeckHeight(float x,float z,float ground)
        {
            if(deckTriangles.Count==0||x<deckMinX-.06f||x>deckMaxX+.06f||z<deckMinZ-.06f||z>deckMaxZ+.06f)return ground;
            float top;if(DeckSample(x,z,out top))return Math.Max(ground,top);
            // 실제 발의 작은 접촉 폭으로만 판자 틈을 잇는다. 이미 표면이 있으면 이웃 최대값을 섞지 않는다.
            for(int ring=1;ring<=3;ring++)
            {
                float sum=0;int hits=0;
                for(int j=0;j<8;j++)if(DeckSample(x+FootprintDirections[j,0]*ring*.02f,z+FootprintDirections[j,1]*ring*.02f,out top)){sum+=top;hits++;}
                if(hits>0)return Math.Max(ground,sum/hits);
            }
            return ground;
        }
        // 화면 폭이 늘 때 지면만 확장하고 원경 숲을 옛 사각형에 남기지 않는다.
        // 반환 열: X/Z/row/column. Core 통행과 독립인 안개 속 환경 질량이다.
        public float[,] DistantForestSites()
        {
            var sites=new List<float[]>();
            // 격자: x -85…FieldSize+85, z -(FieldSize+60)…60 (×1: col 0..25, row 0..20), 10u 간격은 그대로
            int cols=(int)Math.Round((fieldSize+170)/10),rows=(int)Math.Round((fieldSize+120)/10);
            for(int row=0;row<=rows;row++)for(int col=0;col<=cols;col++)
            {
                float x=-85+col*10+2.4f*(float)Math.Sin(row*.9f+col*1.7f);
                float z=-(fieldSize+60)+row*10+1.8f*(float)Math.Sin(col*.71f+row*.93f),d=Distance(x,z);
                if(d>-12||d< -110)continue;sites.Add(new[]{x,z,(float)row,(float)col});
            }
            var result=new float[sites.Count,4];for(int i=0;i<sites.Count;i++)for(int j=0;j<4;j++)result[i,j]=sites[i][j];return result;
        }
        public bool TreeSite(float x,float z,float radius) { return Distance(x,z)<-radius-.6f; }
        // 전투 구역 중심(×1 좌표 × K). 11-08: 위치만 ×K.
        public static readonly float[,] Regions=Scaled(new float[,]{{33,-70},{53,-61},{22,-59},{40,-50},{16,-40},{41,-35},{65,-38},{40,-25},{25,-19},{58,-17},{40,-7}});
        static float[,] Scaled(float[,] a) { var r=new float[a.GetLength(0),a.GetLength(1)];for(int i=0;i<r.GetLength(0);i++)for(int j=0;j<r.GetLength(1);j++)r[i,j]=a[i,j]*A2Scale.K;return r; }
        public float GroundCover(float x,float z)
        {
            if(Water(x,z)||Math.Abs(A2ForestLayout.Along(x,z))<5&&Math.Abs(A2ForestLayout.Across(x,z))<2)return 0;
            float d=Distance(x,z);if(d<0)return 1;
            float clear=1;
            for(int i=0;i<Regions.GetLength(0);i++)
            {
                float dx=(x-Regions[i,0])/2.8f,dz=(z-Regions[i,1])/2.4f;
                clear=Math.Min(clear,Smooth(Clamp(((float)Math.Sqrt(dx*dx+dz*dz)-.8f)/.6f,0,1)));
            }
            float grove=.72f+.2f*(float)Math.Sin(x*.23+Math.Sin(z*.19));
            return clear*Lerp(1,grove,Smooth(Clamp(d/5,0,1)));
        }
        public static SourceMap CreateMap(MapData map) { return new SourceMap(map); }
        public static bool ShowEnemyStatus(bool alive,bool boss,bool damaged,bool targeted) { return alive&&!boss&&(damaged||targeted); }
        static float Clamp(float x,float min,float max) { return Math.Max(min,Math.Min(max,x)); }
        static float Lerp(float a,float b,float t) { return a+(b-a)*t; }
        static float Smooth(float t) { return t*t*(3-2*t); }
    }
}
