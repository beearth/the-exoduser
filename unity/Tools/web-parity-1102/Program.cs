using System;using System.Linq;using Exoduser.UnityPort.Core;
class Program{
 static int n;static void Check(bool ok,string why){n++;if(!ok)throw new Exception(why);}
 static Simulation Make(){var s=new Simulation(new SimulationConfig{EnemyAiEnabled=false});s.Random01=()=>.5;return s;}
 static void Main(){
 var s=Make();var e=s.SpawnNormalEnemy(40,0);e.Shield=0;s.Feedback.Clear();s.HurtEnemy(e,20);
 Check(s.Feedback.Count(x=>x.Kind.ToString()=="FeelContact")==1,"단발 실제 HP 피해에 접점 알림 1개");
 s=Make();e=s.SpawnNormalEnemy(40,0);s.Feedback.Clear();s.HurtEnemy(e,20);Check(s.Feedback.All(x=>x.Kind.ToString()!="FeelContact"),"실드가 전부 흡수하면 새 접점 없음");
 s=Make();e=s.SpawnNormalEnemy(40,0);e.Shield=0;s.Feedback.Clear();s.HurtEnemy(e,20,dot:true);Check(s.Feedback.All(x=>x.Kind.ToString()!="FeelContact"),"DOT 제외");
 s=Make();s.Feedback.Clear();s.HurtPlayer(10);Check(s.Feedback.Count(x=>x.Kind.ToString()=="FeelHurt")==1,"허용된 비DOT 피격 표식");
 s=Make();s.Feedback.Clear();s.HurtPlayer(10,new HurtOptions{Dot=true});Check(s.Feedback.All(x=>x.Kind.ToString()!="FeelHurt"),"DOT 피격 제외");
 s=Make();s.Player.Iframes=60;s.Feedback.Clear();s.HurtPlayer(10);Check(s.Feedback.All(x=>x.Kind.ToString()!="FeelHurt"),"무적 거절 시 표식 없음");
 var policy=typeof(Program).Assembly.GetType("Exoduser.UnityPort.NativeCombatFeelPolicy");Check(policy!=null,"웹 접점 프레임 정책 존재");
 var frame=policy.GetMethod("Frame");for(int i=0;i<8;i++){int expected=new[]{0,0,0,0,1,2,2,3}[i];Check((int)frame.Invoke(null,new object[]{(double)i,false})==expected,"접점2틱 홀드 "+i);Check((int)frame.Invoke(null,new object[]{(double)i,true})==i/2,"움직임 감소 홀드0 "+i);}
 Check((int)frame.Invoke(null,new object[]{8d,false})==-1,"8틱 만료");
 var preview=typeof(Program).Assembly.GetType("Exoduser.UnityPort.NativeSkillPreviewPolicy");Check(preview!=null,"빈 전용 슬롯의 습득 우선 정책");
 var pick=preview.GetMethod("Pick");var ids=new[]{"blackStar","lavaSummon","execution"};Func<string,int> levels=id=>id=="execution"?1:0;
 Check((string)pick.Invoke(null,new object[]{ids,levels,"blackStar"})=="execution","습득한 처형이 기본 블랙보다 우선");
 levels=id=>0;Check((string)pick.Invoke(null,new object[]{ids,levels,"blackStar"})=="blackStar","미습득 Z 기본 블랙");
 var cost=preview.GetMethod("MaliceCost");Check((int)cost.Invoke(null,new object[]{100})==50,"Z 악의오브50");Check((int)cost.Invoke(null,new object[]{120})==60,"Space 악의오브60");Check((int)cost.Invoke(null,new object[]{1})==1,"양수 최소 비용1");Check((int)cost.Invoke(null,new object[]{0})==0,"비용0 보존");
 Console.WriteLine("PASS "+n+" 실제 Core 피해→표현 알림 검사");}}
