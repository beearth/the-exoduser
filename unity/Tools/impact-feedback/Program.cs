using System;
using Exoduser.UnityPort.Vfx;

static class Program
{
    static int checks;
    static void Check(bool ok, string message) { checks++; if (!ok) throw new Exception(message); }
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
            Console.WriteLine($"타격 표현 시간·방향·예산 {checks}개 검사 통과"); return 0;
        } catch(Exception e) { Console.Error.WriteLine("실패: "+e.Message); return 1; }
    }
}
