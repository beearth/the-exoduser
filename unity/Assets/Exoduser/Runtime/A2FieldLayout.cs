using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // 1-1 전체 숲의 시각 좌표. 원본 SourceMap은 유일한 보행/투사체 계약이다.
    public sealed class A2FieldLayout
    {
        public const float GroundMinX=-105,GroundMaxX=185,GroundMinZ=-185,GroundMaxZ=105;
        public static float[] GroundAxis(bool xAxis)
        {
            float min=xAxis?GroundMinX:GroundMinZ,max=xAxis?GroundMaxX:GroundMaxZ,nearMin=xAxis?-45:-125,nearMax=xAxis?125:45;
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
        const int SurfaceCells=501;
        const float SurfaceStep=.16f;
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
            if(surfaces!=null&&x>=0&&x<=80&&z<=0&&z>=-80)
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
            float east=Smooth(Clamp((x-43)/6,0,1))*(1-Smooth(Clamp((z+58)/12,0,1)));
            float northEast=Smooth(Clamp((x-62)/6,0,1))*Smooth(Clamp((z+34)/10,0,1));
            surface+=outside*(.25f-1.9f*Math.Max(east,northEast));
            // 키샷 지류는 발목 깊이의 실제 얕은 개울이다. 원본 XY 보행 경계는 바꾸지 않는다.
            float channel=1-Smooth(Clamp((A2ForestLayout.BranchDistance(x,z)+.15f)/1.4f,0,1));
            float bed=Lerp(surface,-.55f,channel);
            // 숲 안쪽만 완만한 높이 층을 만든다. 보행면과 기존 수면 경계는 보존한다.
            if(d<-.2f&&bed>-.35f)
                bed+=.9f*Smooth(Clamp((-d-.2f)/4.5f,0,1))*(1+.35f*(float)Math.Sin(x*.22+z*.17));
            return bed;
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
            for(int row=0;row<=20;row++)for(int col=0;col<=25;col++)
            {
                float x=-85+col*10+2.4f*(float)Math.Sin(row*.9f+col*1.7f);
                float z=-140+row*10+1.8f*(float)Math.Sin(col*.71f+row*.93f),d=Distance(x,z);
                if(d>-12||d< -110)continue;sites.Add(new[]{x,z,(float)row,(float)col});
            }
            var result=new float[sites.Count,4];for(int i=0;i<sites.Count;i++)for(int j=0;j<4;j++)result[i,j]=sites[i][j];return result;
        }
        // R7: 전투면에 장식을 흩뿌리지 않고 마른 비보행 둑을 중간 높이 목질 군집으로 연결한다.
        // 중심끼리 3.8m 이상. 원본 보행/수면/높이 함수는 바꾸지 않는다.
        public float[,] BankSites()
        {
            var sites=new List<float[]>();
            for(int row=0;row<=32;row++)for(int col=0;col<=32;col++)
            {
                float x=-10+col*3.1f+1.1f*(float)Math.Sin(row*2.13+col*5.71);
                float z=-90+row*3.1f+1.1f*(float)Math.Sin(col*1.37+row*4.79),d=Distance(x,z);
                if(d> -1.3f||d< -4.8f||Water(x,z))continue;
                bool near=false;foreach(var p in sites){float dx=p[0]-x,dz=p[1]-z;if(dx*dx+dz*dz<3.8f*3.8f){near=true;break;}}
                if(near)continue;
                float gx=Distance(x+.1f,z)-Distance(x-.1f,z),gz=Distance(x,z+.1f)-Distance(x,z-.1f);
                float yaw=(float)(Math.Atan2(gx,gz)*180/Math.PI)+35*(float)Math.Sin(row*3.17+col*1.91);
                sites.Add(new[]{x,z,yaw,.9f+.2f*(float)Math.Sin(col*2.71+row*1.39)});
            }
            var result=new float[sites.Count,4];for(int i=0;i<sites.Count;i++)for(int j=0;j<4;j++)result[i,j]=sites[i][j];return result;
        }
        public bool TreeSite(float x,float z,float radius) { return Distance(x,z)<-radius-.6f; }
        public static readonly float[,] Regions=new float[,]{{33,-70},{53,-61},{22,-59},{40,-50},{16,-40},{41,-35},{65,-38},{40,-25},{25,-19},{58,-17},{40,-7}};
        public static float RootReliefHeight(float height,float red)
        {
            return Math.Max(0,height)*Smooth(Clamp((red-.2f)/.8f,0,1));
        }
        public float GroundCover(float x,float z)
        {
            if(Water(x,z)||Math.Abs(A2ForestLayout.Along(x,z))<5&&Math.Abs(A2ForestLayout.Across(x,z))<2)return 0;
            float d=Distance(x,z);
            float moss=.72f*(1-Smooth(Clamp((Math.Abs(d)-.25f)/2.1f,0,1)));
            foreach(var c in data.colliders)
            {
                float r=Math.Min(c.rx,c.ry)/100f;if(r<.45f)continue;
                float dx=x-c.x/100f,dz=z+c.y/100f;
                float edge=(float)Math.Sqrt(dx*dx+dz*dz)-r;
                moss=Math.Max(moss,1-Smooth(Clamp((edge-.1f)/1.15f,0,1)));
            }
            float clear=1;
            for(int i=0;i<Regions.GetLength(0);i++)
            {
                float dx=(x-Regions[i,0])/2.8f,dz=(z-Regions[i,1])/2.4f;
                clear=Math.Min(clear,Smooth(Clamp(((float)Math.Sqrt(dx*dx+dz*dz)-.8f)/.6f,0,1)));
                for(int side=-1;side<=1;side+=2)
                {
                    float lx=Regions[i,0]+side*(3.8f+.8f*(float)Math.Sin(i*2.1f));
                    float lz=Regions[i,1]+side*(2.8f+.6f*(float)Math.Cos(i));
                    if(Distance(lx,lz)<.8f||Water(lx,lz))continue;
                    float ld=(float)Math.Sqrt((x-lx)*(x-lx)+(z-lz)*(z-lz));
                    moss=Math.Max(moss,.65f*(1-Smooth(Clamp((ld-.35f)/1.3f,0,1))));
                }
            }
            return clear*moss;
        }
        static readonly int[,] GroundLinks=new int[,]{{0,1},{0,2},{0,3},{1,3},{1,6},{2,3},{2,4},{3,5},{4,5},{4,8},{5,6},{5,7},{6,9},{7,8},{7,9},{7,10},{8,10},{9,10}};
        static void GroundWarp(float x,float z,out float wx,out float wz)
        {wx=x+.65f*(float)Math.Sin(z*.29f)+.3f*(float)Math.Sin(x*.19f);wz=z+.55f*(float)Math.Sin(x*.25f)+.3f*(float)Math.Sin(z*.16f);}
        static float GroundSegment(float x,float z,float ax,float az,float bx,float bz)
        {
            float dx=bx-ax,dz=bz-az,t=Clamp(((x-ax)*dx+(z-az)*dz)/Math.Max(.00001f,dx*dx+dz*dz),0,1);
            dx=x-ax-dx*t;dz=z-az-dz*t;return dx*dx+dz*dz;
        }
        public static float GroundRouteDistance(float x,float z)
        {
            float wx,wz;GroundWarp(x,z,out wx,out wz);float distance=float.PositiveInfinity;
            for(int i=0;i<GroundLinks.GetLength(0);i++)
            {
                int a=GroundLinks[i,0],b=GroundLinks[i,1];float ax,az,bx,bz;
                GroundWarp(Regions[a,0],Regions[a,1],out ax,out az);GroundWarp(Regions[b,0],Regions[b,1],out bx,out bz);
                distance=Math.Min(distance,GroundSegment(wx,wz,ax,az,bx,bz));
            }
            for(int j=0;j<2;j++){float ax,az,bx,bz;GroundWarp(40.2f,-74.2f,out ax,out az);GroundWarp(Regions[j,0],Regions[j,1],out bx,out bz);distance=Math.Min(distance,GroundSegment(wx,wz,ax,az,bx,bz));}
            return (float)Math.Sqrt(distance);
        }
        // G=낙엽 퇴적/B=밟힌 젖은 흙. 녹색 이끼 R과 독립인 큰 재질 구역이다.
        public void GroundLayerWeights(float x,float z,out float litter,out float wet)
        {
            litter=wet=0;if(Water(x,z)||Math.Abs(A2ForestLayout.Along(x,z))<5&&Math.Abs(A2ForestLayout.Across(x,z))<2)return;
            float width=1.55f+.35f*(float)Math.Sin(x*.19+z*.13);
            float lane=1-Smooth(Clamp((GroundRouteDistance(x,z)-width*.45f)/(width*.75f),0,1));
            float patch=.5f+.3f*(float)Math.Sin(x*.31+1.7*Math.Sin(z*.18))+.2f*(float)Math.Cos(z*.37-x*.11);
            patch=Smooth(Clamp((patch-.12f)/.76f,0,1));
            litter=(.2f+.75f*patch)*(1-.93f*lane);
            float damp=.55f+.25f*(float)Math.Sin(x*.22-z*.29)+.2f*(float)Math.Cos(z*.41+x*.09);
            wet=Clamp(lane*(.3f+.7f*damp),0,1);
        }
        public static SourceMap CreateMap(MapData map) { return new SourceMap(map); }
        public static bool ShowEnemyStatus(bool alive,bool boss,bool damaged,bool targeted) { return alive&&!boss&&(damaged||targeted); }
        static float Clamp(float x,float min,float max) { return Math.Max(min,Math.Min(max,x)); }
        static float Lerp(float a,float b,float t) { return a+(b-a)*t; }
        static float Smooth(float t) { return t*t*(3-2*t); }
    }
}
