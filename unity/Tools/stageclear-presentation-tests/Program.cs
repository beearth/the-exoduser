using System;using System.IO;using System.Linq;using System.Collections.Generic;using System.Text.Json;using Exoduser.UnityPort;
static class Program {
 static List<string> ok=new List<string>();static void Check(bool v,string n){if(!v)throw new Exception(n);ok.Add(n);}
 static int Main(){try{
 var actual=new NativeStageClearPresentation.Summary{Kills=137,Total=168,Seconds=88,SpAwarded=10,SpBalance=28,Regions=4,Potions=0,Deaths=0};var m=NativeStageClearPresentation.Build(actual);
 Check(m.Metrics.Count==2&&m.Metrics[0].Value=="1:28"&&m.Metrics[1].Value=="137 / 168","실측 처치·경과시간 표시값 정확");Check(m.Reward.Value=="+10 SP","실제 획득SP10 표시");Check(m.Details.Count==3&&m.Details.Any(x=>x.Key=="potions"&&x.Value=="0"),"측정된0과미지원null 구분");Check(m.Score==null&&m.Rank==null,"부족한점수/등급을0·S로채우지않음");
 var empty=NativeStageClearPresentation.Build(new NativeStageClearPresentation.Summary());Check(empty.Metrics.Count==0&&empty.Reward==null&&empty.Details.Count==0&&empty.Score==null,"미측정상태를정상결과로위장하지않음");
 var scoreOnly=NativeStageClearPresentation.Build(new NativeStageClearPresentation.Summary{Score=7110});Check(scoreOnly.Score==null&&scoreOnly.Rank==null,"등급근거없는부분점수표시0");
 foreach(var size in new[]{(1600f,900f),(1280f,720f),(960f,540f),(640f,360f)}){var a=NativeStageClearPresentation.Arrange(size.Item1,size.Item2,m);Check(a.Panel.X>=15.9&&a.Panel.Y>=15.9&&a.Panel.X+a.Panel.Width<=size.Item1-15.9&&a.Panel.Y+a.Panel.Height<=size.Item2-15.9,"뷰포트안패널 "+size);Check(a.Panel.Contains(a.Next.X,a.Next.Y)&&a.Panel.Contains(a.Next.X+a.Next.Width,a.Next.Y+a.Next.Height),"실제버튼패널안 "+size);Check(a.HitNext(a.Next.X+1,a.Next.Y+1)&&a.HitNext(a.Next.X+a.Next.Width-1,a.Next.Y+a.Next.Height-1),"그린버튼좌우모서리동일히트영역 "+size);Check(!a.HitNext(a.Next.X-1,a.Next.Y),"버튼밖입력거부 "+size);if(size.Item1>=960)Check(a.Next.Height>=44,"검수창크기에서클릭높이44px이상 "+size);}
 var action=new NativeStageClearPresentation.NextAction();int calls=0;Check(!action.Request(false,1,()=>calls++),"닫힌결과버튼무효");Check(!action.Request(true,.2f,()=>calls++),"결과직후입력펜스");Check(action.Request(true,1,()=>calls++),"핵심다음행동콜백실행");Check(!action.Request(true,1,()=>calls++)&&calls==1,"중복클릭저장/이동중복호출0");action.Reset();Check(action.Request(true,1,()=>calls++)&&calls==2,"새결과에서버튼다시동작");
 File.WriteAllText("I:/EXODUSER-Storage/unity-visual/stageclear-20261030/표시-데이터-버튼검사.json",JsonSerializer.Serialize(new{통과=ok.Count,검사=ok},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("PASS "+ok.Count);return 0;
 }catch(Exception e){Console.Error.WriteLine(e);return 1;}}
}
