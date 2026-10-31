using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort;

class Program
{
    static int failures;
    static void Check(bool yes,string name) { Console.WriteLine((yes?"PASS ":"FAIL ")+name);if(!yes)failures++; }
    static float SegmentDistanceSquared(float x,float z,float ax,float az,float bx,float bz)
    {
        float dx=bx-ax,dz=bz-az,den=dx*dx+dz*dz;
        float t=den==0?0:Math.Clamp(((x-ax)*dx+(z-az)*dz)/den,0,1);
        dx=x-ax-dx*t;dz=z-az-dz*t;return dx*dx+dz*dz;
    }
    // 원형 XZ 삼각형과 8cm 원의 실제 최단거리. 발면 함수의 방사 표본 구현과 독립이다.
    static bool NearDeck(float[] xyz,int[] triangles,float ceiling,float x,float z)
    {
        const float r=.08f;
        for(int i=0;i<triangles.Length;i+=3)
        {
            int a=triangles[i]*3,b=triangles[i+1]*3,c=triangles[i+2]*3;
            if(Math.Max(xyz[a+1],Math.Max(xyz[b+1],xyz[c+1]))>ceiling)continue;
            float ax=xyz[a],az=xyz[a+2],bx=xyz[b],bz=xyz[b+2],cx=xyz[c],cz=xyz[c+2];
            if(x<Math.Min(ax,Math.Min(bx,cx))-r||x>Math.Max(ax,Math.Max(bx,cx))+r||z<Math.Min(az,Math.Min(bz,cz))-r||z>Math.Max(az,Math.Max(bz,cz))+r)continue;
            float det=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.Abs(det)<.000001f)continue;
            float u=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/det,v=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/det;
            if(u>=0&&v>=0&&u+v<=1)return true;
            if(Math.Min(SegmentDistanceSquared(x,z,ax,az,bx,bz),Math.Min(SegmentDistanceSquared(x,z,bx,bz,cx,cz),SegmentDistanceSquared(x,z,cx,cz,ax,az)))<=r*r)return true;
        }
        return false;
    }
    static void Main(string[] args)
    {
        var data=JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[0]),new JsonSerializerOptions{IncludeFields=true});
        var original=new SourceMap(data);
        var type=typeof(SourceMap).Assembly.GetType("Exoduser.UnityPort.A2FieldLayout");
        // 수정 전에는 실제 게임의 A2 SourceMap 경로와 같은 입력으로 회귀를 재현한다.
        var actual=type==null?new SourceMap(data,A2ForestLayout.BlockedCore,A2ForestLayout.SolidCore):(SourceMap)type.GetMethod("CreateMap").Invoke(null,new object[]{data});
        int movement=0,tiles=0,sight=0;
        for(int y=0;y<data.height;y++)for(int x=0;x<data.width;x++)
        {
            float px=(x+.5f)*data.tileSize,py=(y+.5f)*data.tileSize;
            foreach(float r in new[]{0f,15f,28f})if(actual.CanMove(px,py,r)!=original.CanMove(px,py,r))movement++;
            if(actual.DisplayTile(x,y)!=original.DisplayTile(x,y))tiles++;
            if(actual.LineOfSight(px,py,px+193,py-127)!=original.LineOfSight(px,py,px+193,py-127))sight++;
        }
        Check(movement==0,"전체 40000타일·3반경 보행 경계 불변 "+movement);
        Check(tiles==0,"전체 미니맵 원본 불변 "+tiles);
        Check(sight==0,"원본 투사체 시야 불변 "+sight);
        Check(type!=null,"일반 필드의 시각 전용 배치 사용");
        if(type!=null)
        {
            var field=Activator.CreateInstance(type,new object[]{data});

            var fit=type.GetMethod("FitTreePoint");
            Check(fit!=null,"나무 몸통을 원본 통행 밖으로 맞추는 시각 전용 경계 함수");
            if(fit!=null)
            {
                int changed=0,leaks=0;float maxShift=0;
                foreach(var c in data.colliders)
                {
                    float cx=c.x/100,cz=-c.y/100;if(original.CanMove(cx*100,-cz*100,0))continue;
                    for(int row=-12;row<=12;row++)for(int col=-12;col<=12;col++)
                    {
                        float x=cx+col*.2f,z=cz+row*.2f;var input=new object[]{x,z,cx,cz,0f,0f};
                        if(!(bool)fit.Invoke(field,input))continue;
                        float fx=(float)input[4],fz=(float)input[5];changed++;
                        if(original.CanMove(fx*100,-fz*100,0))leaks++;
                        maxShift=Math.Max(maxShift,(float)Math.Sqrt((x-fx)*(x-fx)+(z-fz)*(z-fz)));
                    }
                }
                Check(changed>100&&leaks==0,"원본 충돌 주변 실제 통행점 몸통 침범 제거/수정"+changed+" 잔존"+leaks+" 최대이동"+maxShift);
                var safe=new object[]{40f,-50f,40f,-50f,0f,0f};
                Check(!(bool)fit.Invoke(field,safe),"통행 가능한 중심에 가짜 충돌 질량을 만들지 않기");
            }

            if(args.Length>2)
            {
                var extend=type.GetMethod("ExtendBridgeSupports");Check(extend!=null,"기존 목교 지지목을 실제 강바닥까지 연장");
                if(extend!=null)
                {
                    using var exported=JsonDocument.Parse(File.ReadAllText(args[2]));var filter=exported.RootElement.GetProperty("filters")[0];
                    var xyz=JsonSerializer.Deserialize<float[]>(filter.GetProperty("vertices").GetRawText());var ids=JsonSerializer.Deserialize<int[]>(filter.GetProperty("triangles").GetRawText());var old=(float[])xyz.Clone();
                    int count=(int)extend.Invoke(field,new object[]{xyz,ids});int crossings=0,upperChanged=0;
                    for(int i=0;i<xyz.Length;i+=3)if(old[i+1]>=.10f&&(xyz[i]!=old[i]||xyz[i+1]!=old[i+1]||xyz[i+2]!=old[i+2]))upperChanged++;
                    for(int i=0;i<ids.Length;i+=3){float a=xyz[ids[i]*3+1],b=xyz[ids[i+1]*3+1],c=xyz[ids[i+2]*3+1];if(Math.Min(a,Math.Min(b,c))<-.45f&&Math.Max(a,Math.Max(b,c))>-.45f)crossings++;}
                    Check(count>0&&crossings>0&&upperChanged==0,"실제 수면 관통 지지목/수정"+count+" 교차삼각형"+crossings+" 상판·난간변경"+upperChanged);
                }
            }
            var distance=type.GetMethod("Distance");
            Check((float)distance.Invoke(field,new object[]{40.2f,-74.2f})>0,"시작점은 전투 지면");
            Check((float)distance.Invoke(field,new object[]{-20f,-40f})<0,"초광폭 외곽은 숲·심연");
            var height=type.GetMethod("Height");float last=0,maxJump=0;bool finite=true;
            for(int y=0;y<1000;y++) { float h=(float)height.Invoke(field,new object[]{40.2f,-90f+y*.1f});finite&=float.IsFinite(h);if(y>0)maxJump=Math.Max(maxJump,Math.Abs(h-last));last=h; }
            Check(finite&&maxJump<.25f,"원본 Terrain 창 밖도 연속된 지면 "+maxJump);
            var show=type.GetMethod("ShowEnemyStatus");
            bool Bar(bool alive,bool boss,bool damaged,bool target)=>(bool)show.Invoke(null,new object[]{alive,boss,damaged,target});
            Check(!Bar(true,false,false,false),"멀쩡한 비조준 적 표시 숨김");
            Check(Bar(true,false,true,false)&&Bar(true,false,false,true),"피해 적·조준 적 작은 바 표시");
            Check(!Bar(false,false,true,true)&&!Bar(true,true,true,true),"죽은 적·보스 일반 바 제외");
            var water=type.GetMethod("Water");
            Check(!(bool)water.Invoke(field,new object[]{-5f,-40f})&&!(bool)water.Invoke(field,new object[]{40f,-86f}),"서측·시작 외곽은 침수 섬이 아닌 연속 숲");
            int accidentalPools=0;
            for(int z=-78;z<=-4;z++)for(int x=10;x<=70;x++)if((float)distance.Invoke(field,new object[]{(float)x,(float)z})>1&&A2ForestLayout.BranchDistance(x,z)>2&&(bool)water.Invoke(field,new object[]{(float)x,(float)z}))accidentalPools++;
            Check(accidentalPools==0,"수로 밖 전투 지면의 우발적 둥근 웅덩이 제거 "+accidentalPools);
            var terrain=type.GetMethod("TerrainHeight");
            // 실제 카메라의 화면 모서리 광선과 렌더 표면의 교차. 원본 통행 판정과 독립이다.
            float Limit(string name,float fallback){var value=type.GetField(name);return value==null?fallback:Convert.ToSingle(value.GetRawConstantValue());}
            float gx0=Limit("GroundMinX",-45),gx1=Limit("GroundMaxX",125),gz0=Limit("GroundMinZ",-125),gz1=Limit("GroundMaxZ",45);
            var terrainAt=(Func<float,float,float>)terrain.CreateDelegate(typeof(Func<float,float,float>),field);
            var farMethod=type.GetMethod("DistantForestSites");var forestSites=new System.Collections.Generic.List<(float x,float z)>();
            if(farMethod!=null){var points=(float[,])farMethod.Invoke(field,null);for(int i=0;i<points.GetLength(0);i++)forestSites.Add((points[i,0],points[i,1]));}
            else for(int row=0;row<15;row++)for(int col=0;col<18;col++){float x=-34+col*8.5f+2.4f*(float)Math.Sin(row*.9f+col*1.7f),z=-110+row*10.3f,d=(float)distance.Invoke(field,new object[]{x,z});if(d<=-10&&d>=-34)forestSites.Add((x,z));}
            using var cameraJson=JsonDocument.Parse(File.ReadAllText(Path.Combine(Path.GetDirectoryName(args[0]),"remodel_camera.json")));
            double fov=cameraJson.RootElement.GetProperty("verticalFieldOfView").GetDouble(),lookAhead=cameraJson.RootElement.GetProperty("lookAhead").GetDouble();
            double pitch=34*Math.PI/180,sn=Math.Sin(pitch),cs=Math.Cos(pitch),tan=Math.Tan(fov*Math.PI/360);
            var cameras=new float[,]{{40.2f,-74.2f},{35,-62.5f},{40,-50},{22,-44},{64.63045f,-43.84693f},{46,-35},{40,-18.5f},{40.2f,-5}};
            foreach(int width in new[]{1920,3840})
            {
                int outside=0,forestGaps=0,forestSamples=0;double minHit=1e9,maxHit=-1e9,worstForest=0;
                for(int i=0;i<cameras.GetLength(0);i++)foreach(float raised in new[]{0f,1.1f})foreach(int sx in new[]{-1,1})foreach(int sy in new[]{-1,1})
                {
                    double cx=cameras[i,0],cz=cameras[i,1]+lookAhead-16.5*cs,cy=(float)height.Invoke(field,new object[]{cameras[i,0],cameras[i,1]})+raised+16.5*sn;
                    double dx=sx*(width/1080.0)*tan,dy=-sn+sy*cs*tan,dz=cs+sy*sn*tan,low=0,high=300;
                    for(int k=0;k<32;k++){double t=(low+high)/2,px=cx+dx*t,pz=cz+dz*t,bed=Math.Max(-.45f,terrainAt((float)px,(float)pz));if(cy+dy*t>bed)low=t;else high=t;}
                    double hitX=cx+dx*high,hitZ=cz+dz*high;minHit=Math.Min(minHit,hitX);maxHit=Math.Max(maxHit,hitX);
                    if(hitX<gx0||hitX>gx1||hitZ<gz0||hitZ>gz1)outside++;
                    if((float)distance.Invoke(field,new object[]{(float)hitX,(float)hitZ})<-10&&!(bool)water.Invoke(field,new object[]{(float)hitX,(float)hitZ}))
                    {
                        double nearest=1e12;foreach(var site in forestSites){double forestDx=site.x-hitX,forestDz=site.z-hitZ;nearest=Math.Min(nearest,forestDx*forestDx+forestDz*forestDz);}
                        nearest=Math.Sqrt(nearest);worstForest=Math.Max(worstForest,nearest);forestSamples++;if(nearest>12)forestGaps++;
                    }
                }
                Check(outside==0,width+"x1080·8곳·4모서리·낮은목질상한의 지면/수면 구멍 없음 "+outside+" X["+minHit+","+maxHit+"]");
                Check(forestGaps==0,width+"x1080 외부 육지의 원경숲 12m 연결/표본"+forestSamples+" 누락"+forestGaps+" 최장"+worstForest);
            }

            Check(terrain!=null&&(float)height.Invoke(field,new object[]{43.2f,-71.8f})-(float)terrain.Invoke(field,new object[]{43.2f,-71.8f})>.12f,"목교는 얕은 수로 위를 가로지름");
            var register=type.GetMethod("RegisterSurface");
            Check(register!=null,"실제 쓰러진 목질 표면을 보행 높이에 연결");
            if(register!=null)
            {
                float baseY=(float)height.Invoke(field,new object[]{40f,-50f});
                register.Invoke(field,new object[]{new float[]{39,baseY+.5f,-51,41,baseY+.5f,-51,39,baseY+.5f,-49,41,baseY+.5f,-49},new int[]{0,2,1,1,2,3}});
                Check((float)height.Invoke(field,new object[]{40f,-50f})>baseY+.4f,"낮은 목질을 관통하지 않고 위에 접지");
            }
            // 실제 목교에서 재현된 0.16u 격자 사이의 얇은 널빤지: 격자 점에 정점이 없어도 접지해야 한다.
            var deckField=Activator.CreateInstance(type,new object[]{data});
            float deckBase=(float)height.Invoke(deckField,new object[]{40.075f,-50f}),deckY=deckBase+.3f;
            var deck=type.GetMethod("RegisterDeckSurface");
            var thin=new float[]{40.05f,deckY,-50.1f,40.10f,deckY,-50.1f,40.05f,deckY,-49.9f,40.10f,deckY,-49.9f};
            var quad=new int[]{0,2,1,1,2,3};
            if(deck==null)register.Invoke(deckField,new object[]{thin,quad});else deck.Invoke(deckField,new object[]{thin,quad,deckY+.1f});
            Check(Math.Abs((float)height.Invoke(deckField,new object[]{40.075f,-50f})-deckY)<.005f,"16cm 격자 사이 5cm 널빤지의 실제 표면 접지");
            Check(Math.Abs((float)height.Invoke(deckField,new object[]{40.12f,-50f})-deckY)<.005f,"널빤지 틈 2cm는 발 접촉 범위로 잇기");
            Check((float)height.Invoke(deckField,new object[]{40.22f,-50f})<deckY-.2f,"발 접촉 범위 밖을 보행판으로 확장하지 않기");
            if(deck!=null){var rail=(float[])thin.Clone();for(int i=1;i<rail.Length;i+=3)rail[i]=deckY+.8f;deck.Invoke(deckField,new object[]{rail,quad,deckY+.1f});}
            Check(deck!=null&&Math.Abs((float)height.Invoke(deckField,new object[]{40.075f,-50f})-deckY)<.005f,"목교 난간은 보행판 높이에서 제외");
            if(deck!=null)
            {
                var cellField=Activator.CreateInstance(type,new object[]{data});
                var narrow=new float[]{40.52f,deckY,-50.02f,40.56f,deckY,-50.02f,40.52f,deckY,-49.98f,40.56f,deckY,-49.98f};
                deck.Invoke(cellField,new object[]{narrow,quad,deckY+.1f});
                Check(Math.Abs((float)height.Invoke(cellField,new object[]{40.54f,-50f})-deckY)<.005f,"음수Z 셀경계의 정확 목교 표면");
                Check(Math.Abs((float)height.Invoke(cellField,new object[]{40.49f,-50f})-deckY)<.005f,"인접 공간셀의 3cm 틈 발 접촉 유지");
            }
            var cover=type.GetMethod("GroundCover");
            Check(cover!=null,"구역 단위 연속 지면 식생 사용");
            if(cover!=null)
            {
                float Cover(float x,float z)=>(float)cover.Invoke(field,new object[]{x,z});
                Check(Cover(40,-50)==0&&Cover(43.2f,-71.8f)==0,"주 전투 중심·목교 통행면 식생 제외");
                Check(Cover(-5,-40)==0,"목질 접점 없는 먼 바닥의 전역 이끼 제거");
                double total=0;for(int y=0;y<20;y++)for(int x=0;x<20;x++)total+=Cover(30+x,-60+y);
                Check(total/400<.2,"중간 전투구역의 이끼 카펫 제한 20퍼센트미만 "+total/400);
            }

            if(args.Length>3)
            {
                using var baseline=JsonDocument.Parse(File.ReadAllText(args[3]));int wetChange=0,walkGroundChange=0,raisedOutside=0;float maxWalk=0;
                foreach(var sample in baseline.RootElement.GetProperty("rows").EnumerateArray())
                {
                    float x=sample[0].GetSingle(),z=sample[1].GetSingle(),oldY=sample[2].GetSingle();
                    float now=terrainAt(x,z);if(((bool)water.Invoke(field,new object[]{x,z})?1:0)!=sample[3].GetInt32())wetChange++;
                    if(sample[4].GetInt32()==1){float delta=Math.Abs(now-oldY);maxWalk=Math.Max(maxWalk,delta);if(delta>.00001f)walkGroundChange++;}
                    else if(now-oldY>.15f)raisedOutside++;
                }
                Check(wetChange==0,"42960기준표의 실제 수면 경계 불변/변경"+wetChange);
                Check(walkGroundChange==0,"원본 통행점 지형 높이 불변/변경"+walkGroundChange+" 최대차"+maxWalk);
                Check(raisedOutside>500,"비보행숲에만 연속 높이층 제작/15cm이상"+raisedOutside);
            }
            var bankMethod=type.GetMethod("BankSites");
            Check(bankMethod!=null,"R7 원본통행 밖에 이어지는 비대칭 목질 둑 배치");
            if(bankMethod!=null)
            {
                var banks=(float[,])bankMethod.Invoke(field,null);int leaks=0,wet=0;float minGap=float.PositiveInfinity,minZ=float.PositiveInfinity,maxZ=float.NegativeInfinity;
                for(int i=0;i<banks.GetLength(0);i++)
                {
                    float x=banks[i,0],z=banks[i,1];if(original.CanMove(x*100,-z*100,0))leaks++;
                    if((bool)water.Invoke(field,new object[]{x,z}))wet++;minZ=Math.Min(minZ,z);maxZ=Math.Max(maxZ,z);
                    for(int j=0;j<i;j++){float dx=x-banks[j,0],dz=z-banks[j,1];minGap=Math.Min(minGap,(float)Math.Sqrt(dx*dx+dz*dz));}
                }
                Check(banks.GetLength(0)>25&&leaks==0&&wet==0,"R7 목질 둑은 마른 비보행면에만 배치/개수"+banks.GetLength(0)+" 보행"+leaks+" 수면"+wet);
                Check(minGap>=3.8f&&maxZ-minZ>65,"R7 연결군집 간격3.8m/시작부터보스전역/최소"+minGap+" 범위"+(maxZ-minZ));
            }
            var layers=type.GetMethod("GroundLayerWeights");
            Check(layers!=null,"R8 주동선과 낙엽 퇴적을 분리하는 지면 가중");
            if(layers!=null)
            {
                float[] Layers(float x,float z){var a=new object[]{x,z,0f,0f};layers.Invoke(field,a);return new[]{(float)a[2],(float)a[3]};}
                var bridgeLayer=Layers(43.2f,-71.8f);Check(bridgeLayer[0]==0&&bridgeLayer[1]==0,"R8 목교에는 낙엽 퇴적과 흙 웅덩이 없음");
                var lane=Layers(40,-50);Check(lane[0]<.08f&&lane[1]>.1f,"R8 중간 주동선은 밟힌 젖은 흙/낙엽"+lane[0]+" 젖음"+lane[1]);
                float minLeaf=1,maxLeaf=0;bool valid=true;
                for(int row=0;row<40;row++)for(int col=0;col<40;col++)
                {
                    var a=Layers(10+col*1.6f,-78+row*1.8f);foreach(var v in a)valid&=float.IsFinite(v)&&v>=0&&v<=1;
                    minLeaf=Math.Min(minLeaf,a[0]);maxLeaf=Math.Max(maxLeaf,a[0]);
                }
                Check(valid&&maxLeaf-minLeaf>.5f,"R8 전역 가중 범위0..1/큰 재질 구역 변별"+(maxLeaf-minLeaf));
            }
            var rootHeight=type.GetMethod("RootReliefHeight");
            Check(rootHeight!=null,"스캔 흙 둘레를 지면에 연결하는 높이 가중");
            if(rootHeight!=null)
            {
                float Root(float h,float red)=>(float)rootHeight.Invoke(null,new object[]{h,red});
                Check(Root(.2f,0)==0&&Root(.2f,.2f)==0&&Math.Abs(Root(.2f,1)-.2f)<.00001f&&Root(.2f,.5f)<.1f,"흙 둘레 평탄접합/흰 뿌리 높이 보존");
            }
            if(args.Length>1)
            {
                using var model=JsonDocument.Parse(File.ReadAllText(args[1]));var mr=model.RootElement;
                var xyz=JsonSerializer.Deserialize<float[]>(mr.GetProperty("vertices").GetRawText());var indices=JsonSerializer.Deserialize<int[]>(mr.GetProperty("triangles").GetRawText());
                var originalModel=Activator.CreateInstance(type,new object[]{data});var addDeck=type.GetMethod("RegisterDeckSurface");
                addDeck.Invoke(originalModel,new object[]{xyz,indices,mr.GetProperty("ceiling").GetSingle()});
                float maxSupport=0;foreach(var p in mr.GetProperty("samples").EnumerateArray())
                {
                    float h=(float)height.Invoke(originalModel,new object[]{p.GetProperty("worldX").GetSingle(),p.GetProperty("worldZ").GetSingle()});
                    h=Math.Max(h,p.GetProperty("actorY").GetSingle());maxSupport=Math.Max(maxSupport,Math.Abs(h-p.GetProperty("actualTop").GetSingle()));
                }
                Check(mr.GetProperty("maxSourceDifference").GetDouble()<.001,"원형FBX와실제Unity15점 좌표대조 1mm미만 "+mr.GetProperty("maxSourceDifference"));
                Check(maxSupport<.035f,"동일목교15점의원형삼각형접지 3.5cm미만 "+maxSupport);
                int unsupported=0;float phantom=0,worstX=0,worstZ=0;
                for(int step=0;step<=28;step++)foreach(float side in new[]{-1f,1f})for(int edge=0;edge<=8;edge++)
                {
                    float along=-3.5f+step*.25f,across=side*(1.1f+edge*.1f);
                    float x=A2ForestLayout.BridgeX+along*A2ForestLayout.SinYaw+across*A2ForestLayout.CosYaw,z=A2ForestLayout.BridgeZ+along*A2ForestLayout.CosYaw-across*A2ForestLayout.SinYaw;
                    if(!original.CanMove(x*100,-z*100,15)||NearDeck(xyz,indices,mr.GetProperty("ceiling").GetSingle(),x,z))continue;
                    unsupported++;float rise=(float)height.Invoke(originalModel,new object[]{x,z})-terrainAt(x,z);
                    if(rise>phantom){phantom=rise;worstX=x;worstZ=z;}
                }
                Check(unsupported>20&&phantom<.005f,"원형8cm밖의보행가능점에가짜목교발판없음/표본"+unsupported+" 최대부양"+phantom+" X"+worstX+" Z"+worstZ);

            }
        }
        Environment.ExitCode=failures==0?0:1;
    }
}
