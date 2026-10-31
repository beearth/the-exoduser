using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort;

class Program
{
    static int failures;
    static void Check(bool yes,string name) { Console.WriteLine((yes?"PASS ":"FAIL ")+name);if(!yes)failures++; }
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
            using var cameraJson=JsonDocument.Parse(File.ReadAllText(Path.Combine(Path.GetDirectoryName(args[0]),"remodel_camera.json")));
            double fov=cameraJson.RootElement.GetProperty("verticalFieldOfView").GetDouble(),lookAhead=cameraJson.RootElement.GetProperty("lookAhead").GetDouble();
            double pitch=34*Math.PI/180,sn=Math.Sin(pitch),cs=Math.Cos(pitch),tan=Math.Tan(fov*Math.PI/360);
            var cameras=new float[,]{{40.2f,-74.2f},{35,-62.5f},{40,-50},{22,-44},{64.63045f,-43.84693f},{46,-35},{40,-18.5f},{40.2f,-5}};
            foreach(int width in new[]{1920,3840})
            {
                int outside=0;double minHit=1e9,maxHit=-1e9;
                for(int i=0;i<cameras.GetLength(0);i++)foreach(float raised in new[]{0f,1.1f})foreach(int sx in new[]{-1,1})foreach(int sy in new[]{-1,1})
                {
                    double cx=cameras[i,0],cz=cameras[i,1]+lookAhead-16.5*cs,cy=(float)height.Invoke(field,new object[]{cameras[i,0],cameras[i,1]})+raised+16.5*sn;
                    double dx=sx*(width/1080.0)*tan,dy=-sn+sy*cs*tan,dz=cs+sy*sn*tan,low=0,high=300;
                    for(int k=0;k<32;k++){double t=(low+high)/2,px=cx+dx*t,pz=cz+dz*t,bed=Math.Max(-.45f,terrainAt((float)px,(float)pz));if(cy+dy*t>bed)low=t;else high=t;}
                    double hitX=cx+dx*high,hitZ=cz+dz*high;minHit=Math.Min(minHit,hitX);maxHit=Math.Max(maxHit,hitX);
                    if(hitX<gx0||hitX>gx1||hitZ<gz0||hitZ>gz1)outside++;
                }
                Check(outside==0,width+"x1080·8곳·4모서리·낮은목질상한의 지면/수면 구멍 없음 "+outside+" X["+minHit+","+maxHit+"]");
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
                Check(Cover(-5,-40)>.5f,"외곽 숲의 낮은 식생 연속");
                double total=0;for(int y=0;y<20;y++)for(int x=0;x<20;x++)total+=Cover(30+x,-60+y);
                Check(total/400>.3,"중간 전투구역 주변의 연속 바닥 질량 "+total/400);
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
            }
        }
        Environment.ExitCode=failures==0?0:1;
    }
}
