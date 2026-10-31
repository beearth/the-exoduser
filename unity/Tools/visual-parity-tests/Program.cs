using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Text.Json;
using Exoduser.UnityPort;
static class Program {
 static List<string> passed=new List<string>();
 static void Check(bool ok,string text){if(!ok)throw new Exception(text);passed.Add(text);}
 static double Distance(NativeFloatingTextLayout.Box b,float x,float y){return Math.Sqrt(Math.Pow(b.X+b.Width/2-x,2)+Math.Pow(b.Y+b.Height/2-y,2));}
 static int Main(string[] args){try{
 var body=new NativeFloatingTextLayout.Box(760,90,400,500);var l=new NativeFloatingTextLayout();l.BeginFrame(0);l.Reserve(body);
 var warning=l.Place(1,960,450,140,32,3);Check(warning.Width>0&&!warning.Overlaps(body)&&Distance(warning,960,450)<=208,"보스 몸 회피·사건 거리208 이내");
 var buffer=new NativeFloatingTextLayout.Buffer();for(int i=0;i<40;i++)buffer.Add(960,540,"12","#fff","enemy-hp",NativeFloatingTextLayout.DamagePriority,i*.003f,1,true,12);
 Check(buffer.Live(.12f).Count==1&&buffer.Live(.12f)[0].Value==480&&buffer.Live(.12f)[0].Count==40&&buffer.NumericTotal==480,"일반 피해40건 실제 합480·횟수40 보존");
 buffer.Add(960,540,"파괴!","#fff","critical",3,.12f,.9f);buffer.Add(960,540,"Q!","#fff","parry",3,.12f,.9f);
 for(int i=0;i<10;i++)buffer.Add(960,540,"예고"+i+"!","#fff","move"+i,NativeFloatingTextLayout.WarningPriority,.12f+i*.001f,.8f);
 Check(buffer.Live(.14f).Count(n=>n.Priority==NativeFloatingTextLayout.WarningPriority)==2&&buffer.Superseded==8,"일반 예고 현재2개·이전8개 교체");
 Check(buffer.Live(.14f).Count(n=>n.Priority==3)==2,"일반 예고 교체가 패링·파괴 경고를 지우지 않음");
 l.BeginFrame(.14f);l.Reserve(body);foreach(var n in buffer.Live(.14f))l.Offer(n,960,540,n.Numeric?120:n.Text=="Q!"?52:110,32);l.Resolve();
 Check(l.Requests[0].Notice.Priority==3&&l.Requests[1].Notice.Priority==3,"패링·파괴가 숫자보다 먼저 공간 배정");
 var visible=l.Requests.Where(r=>r.Box.Width>0).ToArray();Check(visible.Length>=3,"고밀도에서도 필수 피드백과 집계 숫자를 함께 표시");
 Check(visible.Any(r=>r.Notice.Numeric),"일반 피해 전체 숨김 방지");
 foreach(var r in visible){Check(Distance(r.Box,r.X,r.Y)<=NativeFloatingTextLayout.Radius(r.Notice.Priority)+.1,"유형별 사건 거리 상한");Check(!r.Box.Overlaps(body),"보스 몸 가림0");Check(r.Box.X>=8&&r.Box.X+r.Box.Width<=1912&&r.Box.Y>=128&&r.Box.Y+r.Box.Height<=864,"화면/HUD 경계 보존");}
 for(int i=0;i<visible.Length;i++)for(int j=0;j<i;j++)Check(!visible[i].Box.Overlaps(visible[j].Box),"표시된 근거리 문자 중첩0");
 l.BeginFrame(1);var b0=l.Place(99,500,500,100,32);l.BeginFrame(1.016f);var b1=l.Place(99,512,504,100,32);Check(Math.Abs((b1.X-b0.X)-12)<.01&&Math.Abs((b1.Y-b0.Y)-4)<.01,"이동 앵커는 캐시 오프셋을 유지·재배치 떨림0");
 l.BeginFrame(2);Check(l.Place(100,-500,-500,100,32).Width==0,"화면 밖 사건을 먼 HUD 안으로 끌어오지 않음");
 l.BeginFrame(2);var edge=l.Place(101,12,140,100,32,3);Check(edge.Width>0&&edge.X>=8&&edge.Y>=128&&Distance(edge,12,140)<=208,"화면 모서리의 근거리 클램프");
 var life=new NativeFloatingTextLayout.Buffer();life.Add(0,0,"-12","#f00","loss",NativeFloatingTextLayout.DamagePriority,0,28f/60,true,-12);Check(life.Live(.46f).Count==1&&life.Live(.47f).Count==0,"웹28프레임 숫자 수명·초과 누적0");
 var repeated=new NativeFloatingTextLayout.Buffer();repeated.Add(0,0,"쉴드 파괴!","#fff","break",3,0,1);repeated.Add(0,0,"쉴드 파괴!","#fff","break",3,.1f,1);Check(repeated.Live(.1f)[0].DisplayText=="쉴드 파괴! ×2","동일 상태 반복 횟수 보존");
 Check(NativeFloatingTextLayout.PriorityFor("쉴드 파괴!")==3&&NativeFloatingTextLayout.PriorityFor("PARRY!")==3&&NativeFloatingTextLayout.PriorityFor("Q!")==3,"실제 문구 우선순위 분류");

 var observed=new NativeFloatingTextLayout();observed.BeginFrame(0);observed.Reserve(new NativeFloatingTextLayout.Box(560,90,560,522.854f));
 var observedNotices=new[]{new NativeFloatingTextLayout.Notice{Id=201,Text="Q!",Priority=3},new NativeFloatingTextLayout.Notice{Id=202,Text="쉴드 파괴!",Priority=3},new NativeFloatingTextLayout.Notice{Id=203,Text="연속 베기!",Priority=NativeFloatingTextLayout.WarningPriority},new NativeFloatingTextLayout.Notice{Id=204,Text="독안개!",Priority=NativeFloatingTextLayout.WarningPriority},new NativeFloatingTextLayout.Notice{Id=205,Text="480 ×40",Priority=NativeFloatingTextLayout.DamagePriority,Numeric=true,Count=40}};
 float[] measured={41.36f,131.47f,122.28f,91.56f,120};for(int i=0;i<5;i++)observed.Offer(observedNotices[i],837.215f,558.2f,measured[i],32);observed.Resolve();
 Check(observed.Requests.First(r=>r.Notice.Numeric).Box.Width>0,"실제 GPU 고밀도 치수에서 집계480 ×40 표시 보장");

 observed.BeginFrame(.2f);observed.Reserve(new NativeFloatingTextLayout.Box(560,90,560,522.854f));foreach(var n in observedNotices)observed.Offer(n,837.215f,558.2f,n.Numeric?120:n.Text=="Q!"?41.36f:131.47f,32);observed.Offer(new NativeFloatingTextLayout.Notice{Id=206,Text="159",Priority=NativeFloatingTextLayout.DamagePriority,Numeric=true,Count=1,Last=.2f},837.215f,539,60,32);observed.Resolve();Check(observed.Requests.First(r=>r.Notice.Id==205).Box.Width>0,"이동 중 신규 단발 숫자가40건 집계를 밀어내지 않음");
 var wide=new NativeFloatingTextLayout();typeof(NativeFloatingTextLayout).GetMethod("SetHorizontalBounds")?.Invoke(wide,new object[]{-952f,2872f});wide.BeginFrame(0);
 var left=wide.Place(700,-780,500,120,32);var right=wide.Place(701,2700,500,120,32);Check(left.Width>0&&right.Width>0,"초광폭 실제 왼쪽/오른쪽 사건의 피해 글자를 중앙으로 옮기지 않음");Check(Distance(left,-780,500)<=144&&Distance(right,2700,500)<=144,"확장 가시 영역에서도 원래 사건 반경144 보존");Check(wide.Place(702,-1300,500,120,32).Width==0,"실제 화면 밖 먼 사건은 여전히 표시하지 않음");
 wide.BeginFrame(1);var objective=new NativeFloatingTextLayout.Box(2644,16,216,153.39f);wide.Reserve(objective);var near=wide.Place(703,2700,160,120,32,3);Check(near.Width>0&&!near.Overlaps(objective),"물리 화면 오른쪽 상태판의 실제 예약 영역 회피");
 typeof(NativeFloatingTextLayout).GetMethod("SetHorizontalBounds")?.Invoke(wide,new object[]{8f,1912f});wide.BeginFrame(2);var normal=wide.Place(704,500,500,100,32);var baseline=new NativeFloatingTextLayout();baseline.BeginFrame(2);var prior=baseline.Place(704,500,500,100,32);Check(normal.X==prior.X&&normal.Y==prior.Y&&normal.Width==prior.Width&&normal.Height==prior.Height,"1920 기본 배치와 픽셀 좌표 동일");
 var arrowArea=new NativeFloatingTextLayout.Box(24,24,1872,780);var arrowFoot=new NativeFloatingTextLayout.Box(-125,-55,190,110);var arrowBlocks=new[]{new NativeFloatingTextLayout.Box(1684,16,216,153.39f),new NativeFloatingTextLayout.Box(875,17,170,37),new NativeFloatingTextLayout.Box(8,8,141.1f,141.1f)};
 Check(NativeRegionArrowLayout.TryPlace(1868,88,arrowArea,arrowFoot,arrowBlocks,12,out float ax,out float ay),"실제1920 우상단 화살표 footprint 배치 가능");var arrowPaint=new NativeFloatingTextLayout.Box(ax+arrowFoot.X,ay+arrowFoot.Y,arrowFoot.Width,arrowFoot.Height);Check(arrowBlocks.All(b=>!arrowPaint.Overlaps(b)),"회전 화살표·글로우·두줄라벨이 상태판/시계/미니맵과 겹치지 않음");Check(arrowPaint.X>=24&&arrowPaint.X+arrowPaint.Width<=1896&&arrowPaint.Y>=24&&arrowPaint.Y+arrowPaint.Height<=804,"마지막 배치 뒤에도 전체 footprint 화면/HUD 경계 보존");
 foreach(float width in new[]{1920f,2560f,3840f})for(int direction=0;direction<8;direction++){float angle=direction*(float)Math.PI/4;var area=new NativeFloatingTextLayout.Box((1920-width)/2+24,24,width-48,780);var blocks=new[]{new NativeFloatingTextLayout.Box((1920+width)/2-236,16,216,153.39f),new NativeFloatingTextLayout.Box(875,17,170,37)};Check(NativeRegionArrowLayout.TryPlace(960+(float)Math.Cos(angle)*width/2,540+(float)Math.Sin(angle)*540,area,arrowFoot,blocks,12,out ax,out ay),"3비율×8방향 가시 후보 존재");var b=new NativeFloatingTextLayout.Box(ax+arrowFoot.X,ay+arrowFoot.Y,arrowFoot.Width,arrowFoot.Height);Check(blocks.All(o=>!b.Overlaps(o))&&b.X>=area.X&&b.Y>=area.Y&&b.X+b.Width<=area.X+area.Width&&b.Y+b.Height<=area.Y+area.Height,"3비율×8방향 실제 footprint 교차0");}
 File.WriteAllText(args.Length>0?args[0]:"I:/EXODUSER-Storage/unity-visual/boss-text-20261029/의미있는-검사결과.json",JsonSerializer.Serialize(new{통과=passed.Count,검사=passed,집계합=480,집계건수=40,표시건수=visible.Length,최대거리=visible.Max(r=>Distance(r.Box,r.X,r.Y))},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("PASS "+passed.Count);return 0;
 }catch(Exception e){Console.Error.WriteLine(e);return 1;}}
}
