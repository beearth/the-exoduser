using System;
using Exoduser.UnityPort.Vfx;

static class Program
{
    static int checks;
    static void Check(bool ok, string message) { checks++; if (!ok) throw new Exception(message); }
    static double Hue(uint c){double r=(c>>16&255)/255.0,g=(c>>8&255)/255.0,b=(c&255)/255.0,max=Math.Max(r,Math.Max(g,b)),min=Math.Min(r,Math.Min(g,b)),d=max-min;if(d==0)return 0;double h=max==r?(g-b)/d:max==g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360;}
    static int Main()
    {
        try {
            var t = new ImpactResponse();
            Check(t.Hit(1, 0, 0, false, false), "실제 명중은 첫 피드백을 생성해야 한다");
            Check(t.FreezeSeconds >= .05 && t.FreezeSeconds <= .1, "표현 정지는 50~100ms이어야 한다");
            Check(t.Frozen(1, .025), "명중한 적의 표현만 정지해야 한다");
            Check(!t.Frozen(2, .025), "다른 적의 움직임은 계속되어야 한다");
            Check(!t.Frozen(1, .101), "정지가 끝나면 적이 복귀해야 한다");
            Check(t.Hit(2, 0, 0, false, false), "같은 틱의 두 번째 접점은 허용한다");
            Check(!t.Hit(3, 0, 0, false, false), "같은 틱의 세 번째 접점은 생략한다");
            Check(!t.Hit(1, .03, 0, false, false), "같은 적 연속 통지는 광량을 중복 적층하지 않는다");
            Check(t.Hit(3, .12, Math.PI / 2, true, false), "다음 틱은 독립 예산으로 재개한다");
            Check(t.FreezeSeconds >= .075 && t.FreezeSeconds <= .1, "대검 끝타는 더 무겁되 100ms를 넘지 않는다");
            t.Camera(.13, out double x, out double y);
            Check(Math.Abs(y) > Math.Abs(x), "카메라 반동은 명중 방향을 따른다");
            for(int k=0;k<400;k++) { t.Camera(.12+k*.001, out x,out y); Check(x*x+y*y <= .06*.06+1e-9, "카메라 반동은 최대 6px이다"); }
            t.Camera(.5, out x,out y); Check(x==0 && y==0, "잔여 카메라 이동은 0으로 복귀한다");
            Check(t.Flash(3,.13)>0 && t.Flash(3,.3)==0, "피격 섬광은 짧게 소멸한다");
            t.Reset(); Check(!t.Frozen(3,.13), "재시작에 표현 상태를 넘기지 않는다");
            Check(t.Hit(1,0,0,false,true), "시간이 되돌아가는 새 실행도 허용한다");
            Check(!ImpactResponse.IsContact(false,0,100,0), "신규 등장 자체는 명중이 아니다");
            Check(ImpactResponse.IsContact(false,0,80,3), "등장과 같은 틱의 실제 피격도 놓치지 않는다");
            Check(ImpactResponse.IsContact(true,100,80,3), "체력·보호막 감소와 실제 피격 신호가 접점을 만든다");
            Check(!ImpactResponse.IsContact(true,80,100,3), "회복은 타격 섬광을 만들지 않는다");
            Check(!ImpactResponse.IsContact(true,100,99,0), "피격 신호 없는 DOT는 정지를 만들지 않는다");
            Check(SkillPresentation.Supports("spikeTrap")&&SkillPresentation.Supports("giantSlam")&&SkillPresentation.Supports("holyDome")&&SkillPresentation.Supports("iceOrb")&&SkillPresentation.Supports("fireball"), "현행 실행 스킬 5종 전체를 처리해야 한다");
            Check(!SkillPresentation.Supports("unknown"), "미이식 스킬을 처리했다고 주장하지 않는다");
            Check(SkillPresentation.BulletKind(true,false,3)==1, "드루이드 독은 별도 독 표면이다");
            Check(SkillPresentation.BulletKind(false,true,3)==2, "물리 탄은 어둠 속성이라도 가시 실루엣이다");
            Check(SkillPresentation.BulletKind(false,false,3)==3, "마법 어둠 탄은 독과 다른 실루엣이다");
            Check(SkillPresentation.BulletKind(false,false,1)==0, "범위 밖 원소탄은 기존 표시를 유지한다");
            Check(SkillPresentation.KiWidth(1,1)==192&&SkillPresentation.KiWidth(3,1)==252, "기검참 웹 외곽 크기를 보존한다");
            Check(SkillPresentation.KiWidth(3,1.5f)==378, "차지 크기 배율은 그대로 적용한다");
            Check(SkillPresentation.EnemyWidth(true,false,false,1.1)==96, "독탄 표시 외곽은 작은 충돌 반경과 분리된 웹 최소96px이다");
            Check(SkillPresentation.EnemyWidth(true,true,false,1.1)==192, "물리 패링 독탄의 기존 표시2배를 유지한다");
            Check(SkillPresentation.EnemyWidth(true,false,true,1)==240, "독 원소보주의 기존240px 외곽을 유지한다");
            Check(Math.Abs(SkillPresentation.EnemyWidth(false,false,false,1.1)-50.82)<.001, "어둠 탄 표시 길이는 기존 ps와44 배율을 유지한다");
            Check(Math.Abs(SkillPresentation.EnemyWidth(false,true,false,1.1)-56.02905)<.001, "물리탄은 기존 입 시트의2:1 외곽폭을 유지한다");
            Check(SkillPresentation.EnemyWidth(false,false,true,1)==192, "원소보주의2:1 시트 외곽폭을 유지한다");
            Check(SkillPresentation.ContactOpacity(.02)>0.9&&SkillPresentation.ContactOpacity(.09)==0, "선명한 접점 본체는20ms에 보이고90ms 전에 사라진다");
            Check(!SkillPresentation.PuffCanYield(.1,false,true), "막 생긴 잔여 효과를 일회성 폭발이 즉시 잘라내지 않는다");
            Check(SkillPresentation.PuffCanYield(.2,false,true), "중요 폭발은 오래된 잔여 슬롯을 양보받을 수 있다");
            Check(!SkillPresentation.PuffCanYield(.2,true,true), "다른 중요한 폭발은 유지한다");
            Check(!SkillPresentation.PuffCanYield(.79,false,false), "일반 연기는 원래0.8초 예산을 지킨다");
            Check(SkillPresentation.PuffCanYield(.8,true,false), "수명이 끝난 중요 슬롯은 정상 재사용한다");
            Check(!SkillPresentation.PuffCanYield(-.01,false,true), "시계가 되돌아간 슬롯을 임의 재사용하지 않는다");
            Check(SkillPresentation.ContactOrder(7420)>7422, "실제 접점은 표적 몸체·걷기·견갑보다 앞에 그린다");
            Check(SkillPresentation.ContactOrder(7420.8f)==7424, "정렬 기준은 접점 오프셋이 아닌 표적의 Core Y다");
            Check(SkillPresentation.ResidualOrder(7420)<7420, "긴 잔여 연기는 같은 깊이의 몸체를 덮지 않는다");
            Check(SkillPresentation.ContactOrder(1e9f)<=32767&&SkillPresentation.ResidualOrder(-1e9f)>=-32768, "정렬은 Unity의 유효 범위를 넘지 않는다");
            Check(SkillPresentation.VisibleViewport(0,0,10)&&SkillPresentation.VisibleViewport(1,1,10), "화면 가장자리의 접점을 유지한다");
            Check(SkillPresentation.VisibleViewport(-.09f,1.09f,10), "가장자리 파편을 위한 여유를 유지한다");
            Check(!SkillPresentation.VisibleViewport(-.11f,.5f,10)&&!SkillPresentation.VisibleViewport(1.11f,.5f,10), "화면 밖 효과는 예산을 차지하지 않는다");
            Check(!SkillPresentation.VisibleViewport(.5f,.5f,-1), "카메라 뒤 접점은 반동을 만들지 않는다");
            Check(!SkillPresentation.VisibleViewport(float.NaN,.5f,10), "잘못된 투영 좌표는 표시하지 않는다");
            foreach(uint c in new[]{SkillPresentation.EnemyPoisonCore,SkillPresentation.EnemyPoisonMid,SkillPresentation.EnemyPoisonShadow})Check(Hue(c)>=85&&Hue(c)<=95,"적 독은 맵 황록/금지대와 구분되는85~95도 팔레트여야 한다");
            foreach(uint c in new[]{SkillPresentation.EnemyDarkCore,SkillPresentation.EnemyDarkMid,SkillPresentation.EnemyDarkShadow})Check(Hue(c)>=270&&Hue(c)<=295,"적 어둠은 아군 마력의 푸른 보라와 구분해야 한다");
            Console.WriteLine($"타격·스킬 표현 계약 {checks}개 검사 통과"); return 0;
        } catch(Exception e) { Console.Error.WriteLine("실패: "+e.Message); return 1; }
    }
}
