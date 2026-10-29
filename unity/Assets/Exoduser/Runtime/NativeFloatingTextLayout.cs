using System;
using System.Collections.Generic;
using System.Globalization;

namespace Exoduser.UnityPort
{
    // 표현 전용: 수치 합계와 상태 원문을 보존하고 사건 근처에만 배치한다.
    public sealed class NativeFloatingTextLayout
    {
        public const float MergeSeconds = .18f, MergeX = 96, MergeY = 72;
        public struct Box {
            public float X,Y,Width,Height;
            public Box(float x,float y,float w,float h){X=x;Y=y;Width=w;Height=h;}
            public bool Overlaps(Box b){return X<b.X+b.Width&&X+Width>b.X&&Y<b.Y+b.Height&&Y+Height>b.Y;}
        }
        public sealed class Notice {
            public long Id,Value;public int Count=1,Priority;public float X,Y,Born,Last,Life;public string Text,Color,Channel;public bool Numeric;
            public string DisplayText {get {return (Numeric?(Value>=0&&Channel.EndsWith(":gain",StringComparison.Ordinal)?"+":"")+Value.ToString(CultureInfo.InvariantCulture):Text)+(Count>1?" ×"+Count:"");}}
        }
        public sealed class Buffer {
            static long nextId;
            readonly List<Notice> entries=new List<Notice>();
            public int InputEvents,Aggregated,Superseded;public long NumericTotal;
            public void Clear(){entries.Clear();InputEvents=Aggregated=Superseded=0;NumericTotal=0;}
            public List<Notice> Live(float now){entries.RemoveAll(n=>now-n.Last>n.Life);return entries;}
            public void Add(float x,float y,string text,string color,string channel,int priority,float now,float life,bool numeric=false,long value=0){
                var live=Live(now);InputEvents++;if(numeric)NumericTotal+=value;
                for(int i=live.Count-1;i>=0;i--){var n=live[i];
                    if(n.Channel==channel&&n.Numeric==numeric&&(numeric||n.Text==text)&&now-n.Last<=MergeSeconds&&Math.Abs(n.X-x)<=MergeX&&Math.Abs(n.Y-y)<=MergeY){
                        n.X=(n.X*n.Count+x)/(n.Count+1);n.Y=(n.Y*n.Count+y)/(n.Count+1);n.Count++;n.Value+=value;n.Last=now;n.Life=Math.Max(n.Life,life);Aggregated++;return;
                    }
                }
                // 같은 사건 지점의 일반 예고는 현재 두 개만. 치명 경고/패링/쉴드 파괴는 이 교체 대상이 아니다.
                if(priority==2||priority==0){int cap=priority==2?2:1,count=0;foreach(var n in live)if(n.Priority==priority&&!n.Numeric&&Math.Abs(n.X-x)<=MergeX&&Math.Abs(n.Y-y)<=MergeY)count++;
                    while(count>=cap){int oldest=-1;for(int i=0;i<live.Count;i++){var n=live[i];if(n.Priority==priority&&!n.Numeric&&Math.Abs(n.X-x)<=MergeX&&Math.Abs(n.Y-y)<=MergeY&&(oldest<0||n.Last<live[oldest].Last))oldest=i;}if(oldest<0)break;live.RemoveAt(oldest);Superseded++;count--;}}
                live.Add(new Notice{Id=++nextId,X=x,Y=y,Text=text,Color=color,Channel=channel,Priority=priority,Born=now,Last=now,Life=Math.Max(.1f,life),Numeric=numeric,Value=value});
            }
        }
        public static int PriorityFor(string text){
            string[] urgent={"파괴","패링","PARRY","Q!","E!","사망","부활","구울","쓰러","집중","보호막","Break","Parry","Revive","Dead","Fallen"};
            foreach(string word in urgent)if(text.IndexOf(word,StringComparison.OrdinalIgnoreCase)>=0)return 3;
            return text.IndexOf('!')>=0?2:0;
        }
        public sealed class Request {public Notice Notice;public float X,Y,Width,Height;public Box Box;}
        sealed class Slot {public float DX,DY,Seen;}
        readonly List<Box> occupied=new List<Box>();readonly List<Request> requests=new List<Request>();readonly Dictionary<long,Slot> slots=new Dictionary<long,Slot>();
        float now;public IList<Request> Requests{get{return requests;}}
        public void Clear(){BeginFrame(now);}
        public void BeginFrame(float time){now=time;occupied.Clear();requests.Clear();var dead=new List<long>();foreach(var s in slots)if(time-s.Value.Seen>2)dead.Add(s.Key);foreach(var id in dead)slots.Remove(id);}
        public void Reserve(Box box){if(box.Width>0&&box.Height>0)occupied.Add(box);}
        public void Offer(Notice n,float x,float y,float width,float height){requests.Add(new Request{Notice=n,X=x,Y=y,Width=Math.Min(312,width),Height=Math.Min(68,height)});}
        public void Resolve(){requests.Sort((a,b)=>{int p=b.Notice.Priority.CompareTo(a.Notice.Priority);if(p!=0)return p;p=b.Notice.Last.CompareTo(a.Notice.Last);return p!=0?p:a.Notice.Id.CompareTo(b.Notice.Id);});foreach(var r in requests)r.Box=Place(r.Notice.Id,r.X,r.Y,r.Width,r.Height,r.Notice.Priority);}
        public static float Radius(int priority){return priority>=3?208:priority==2?176:144;}
        bool Fits(Box box,float x,float y,float radius){
            float dx=box.X+box.Width/2-x,dy=box.Y+box.Height/2-y;if(dx*dx+dy*dy>radius*radius+.1f)return false;
            foreach(var o in occupied)if(new Box(box.X-2,box.Y-2,box.Width+4,box.Height+4).Overlaps(o))return false;return true;
        }
        Box At(float x,float y,float width,float height){return new Box(Math.Max(8,Math.Min(1912-width,x-width/2)),Math.Max(128,Math.Min(864-height,y-height/2)),width,height);}
        public Box Place(long id,float x,float y,float width,float height,int priority=1){
            width=Math.Min(312,Math.Max(1,width));height=Math.Min(68,Math.Max(1,height));float radius=Radius(priority);Slot keep;
            if(slots.TryGetValue(id,out keep)){var held=At(x+keep.DX,y+keep.DY,width,height);if(Fits(held,x,y,radius)){occupied.Add(held);keep.Seen=now;return held;}}
            var choices=new List<Box>{At(x,y-30,width,height),At(x,y+30,width,height)};
            // 큰 몸의 가장 가까운 변을 직접 후보로 삼는다. 화면 전체 행/열 탐색은 없다.
            foreach(var o in occupied){for(int side=-2;side<=2;side++)choices.Add(At(x+side*60,o.Y+o.Height+height/2+6,width,height));choices.Add(At(x,o.Y-height/2-6,width,height));choices.Add(At(o.X-width/2-6,y,width,height));choices.Add(At(o.X+o.Width+width/2+6,y,width,height));}
            for(float r=36;r<=radius;r+=36)for(int a=0;a<8;a++){double angle=a*Math.PI/4;choices.Add(At(x+(float)Math.Cos(angle)*r,y+(float)Math.Sin(angle)*r,width,height));}
            Box best=new Box();float score=float.MaxValue;foreach(var b in choices){if(!Fits(b,x,y,radius))continue;float dx=b.X+b.Width/2-x,dy=b.Y+b.Height/2-(y-30),d=dx*dx+dy*dy;if(d<score){score=d;best=b;}}
            if(best.Width>0){occupied.Add(best);slots[id]=new Slot{DX=best.X+best.Width/2-x,DY=best.Y+best.Height/2-y,Seen=now};}
            // 빈 자리가 생길 때 원래 수명 안에서 재시도한다. 먼 열로 전송하지 않는다.
            return best;
        }
    }
}
