using System;
using System.Collections.Generic;
using System.Globalization;
namespace Exoduser.UnityPort
{
    // 완료 화면의 읽기 전용 표시 모델과 단일 표시/입력 좌표. 저장 데이터가 아니다.
    public static class NativeStageClearPresentation
    {
        public struct Area
        {
            public float X,Y,Width,Height;
            public Area(float x,float y,float width,float height){X=x;Y=y;Width=width;Height=height;}
            public bool Contains(float x,float y){return x>=X&&x<=X+Width&&y>=Y&&y<=Y+Height;}
        }
        public sealed class Summary
        {
            public int? Kills,Total,Seconds,SpAwarded,SpBalance,Regions,Potions,Deaths,Score;
            public string Rank;
        }
        public sealed class Row
        {
            public string Key,Value;
            public Row(string key,string value){Key=key;Value=value;}
        }
        public sealed class Model
        {
            public readonly List<Row> Metrics=new List<Row>(),Details=new List<Row>();
            public Row Reward;public string Score,Rank;
        }
        public static Model Build(Summary s)
        {
            var m=new Model();
            if(s.Seconds.HasValue){int n=Math.Max(0,s.Seconds.Value);m.Metrics.Add(new Row("time",(n/60)+":"+(n%60).ToString("00",CultureInfo.InvariantCulture)));}
            if(s.Kills.HasValue)m.Metrics.Add(new Row("kills",s.Kills.Value.ToString("N0",CultureInfo.InvariantCulture)+(s.Total.HasValue?" / "+s.Total.Value.ToString("N0",CultureInfo.InvariantCulture):"")));
            if(s.SpAwarded.HasValue)m.Reward=new Row("reward","+"+s.SpAwarded.Value.ToString(CultureInfo.InvariantCulture)+" SP");
            else if(s.SpBalance.HasValue)m.Reward=new Row("sp",s.SpBalance.Value.ToString(CultureInfo.InvariantCulture)+" SP");
            if(s.Regions.HasValue)m.Details.Add(new Row("regions",s.Regions.Value.ToString(CultureInfo.InvariantCulture)));
            if(s.Potions.HasValue)m.Details.Add(new Row("potions",s.Potions.Value.ToString(CultureInfo.InvariantCulture)));
            if(s.Deaths.HasValue)m.Details.Add(new Row("deaths",s.Deaths.Value.ToString(CultureInfo.InvariantCulture)));
            // 부분 점수나 임의 등급으로 빈 상태를 채우지 않는다.
            if(s.Score.HasValue&&!string.IsNullOrEmpty(s.Rank)){m.Score=s.Score.Value.ToString("N0",CultureInfo.InvariantCulture);m.Rank=s.Rank;}
            return m;
        }
        public sealed class Layout
        {
            public float Scale,LogicalHeight,DetailY,ScoreY,RewardY;
            public Area Panel,Next;
            public Area ToScreen(float x,float y,float width,float height){return new Area(Panel.X+x*Scale,Panel.Y+y*Scale,width*Scale,height*Scale);}
            public bool HitNext(float x,float y){return Next.Contains(x,y);}
        }
        public static Layout Arrange(float screenWidth,float screenHeight,Model model)
        {
            float y=272;var l=new Layout();l.RewardY=y;
            if(model.Reward!=null)y+=78;
            l.ScoreY=y;if(model.Score!=null)y+=56;
            l.DetailY=y;y+=model.Details.Count*30;
            float buttonY=y+22;l.LogicalHeight=buttonY+56+28;
            l.Scale=Math.Min(1,Math.Min(Math.Max(1,screenWidth-32)/560,Math.Max(1,screenHeight-32)/l.LogicalHeight));
            l.Panel=new Area((screenWidth-560*l.Scale)/2,(screenHeight-l.LogicalHeight*l.Scale)/2,560*l.Scale,l.LogicalHeight*l.Scale);
            l.Next=l.ToScreen(28,buttonY,504,56);return l;
        }
        public sealed class NextAction
        {
            bool requested;
            public void Reset(){requested=false;}
            public bool Request(bool active,float age,Action callback){if(!active||age<.5f||requested||callback==null)return false;requested=true;callback();return true;}
        }
    }
}
