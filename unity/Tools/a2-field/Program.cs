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
            Check(terrain!=null&&(float)height.Invoke(field,new object[]{43.2f,-71.8f})-(float)terrain.Invoke(field,new object[]{43.2f,-71.8f})>.12f,"목교는 얕은 수로 위를 가로지름");
            var register=type.GetMethod("RegisterSurface");
            Check(register!=null,"실제 쓰러진 목질 표면을 보행 높이에 연결");
            if(register!=null)
            {
                float baseY=(float)height.Invoke(field,new object[]{40f,-50f});
                register.Invoke(field,new object[]{new float[]{39,baseY+.5f,-51,41,baseY+.5f,-51,39,baseY+.5f,-49,41,baseY+.5f,-49},new int[]{0,2,1,1,2,3}});
                Check((float)height.Invoke(field,new object[]{40f,-50f})>baseY+.4f,"낮은 목질을 관통하지 않고 위에 접지");
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
        }
        Environment.ExitCode=failures==0?0:1;
    }
}
