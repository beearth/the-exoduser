using System;
using Exoduser.UnityPort;
static class FootworkTests
{
    static int checks;
    static void Check(bool ok,string message){checks++;if(!ok)throw new Exception(message);}
    static void RegressionFootwork()
    {
        var method=typeof(NativeHeroMotionClock).GetMethod("Footwork");
        Check(method!=null,"1·2타는 고정 발목 외에 지지발/뒷발 발끝 회전 키가 필요");
        Func<HeroMotionKind,int,float,float,bool,object> pose=(kind,combo,t,contact,moving)=>method.Invoke(null,new object[]{new HeroMotionSample{Kind=kind,Combo=combo,Phase=t,ContactPhase=contact},moving});
        Func<object,string,float> n=(p,k)=>(float)p.GetType().GetField(k).GetValue(p);
        string[] fields={"LeftPitch","LeftYaw","RightPitch","RightYaw"};
        var first=pose(HeroMotionKind.Swing,1,.4f,.4f,false);
        Check(n(first,"LeftPitch")==0&&n(first,"LeftYaw")==0,"1타 왼 지지발은 제자리 유지");
        Check(n(first,"RightPitch")>=10&&n(first,"RightPitch")<=15&&n(first,"RightYaw")<0,"1타 뒷발은 발끝 지지로 뒤꿈치를 들어 하체가 회전을 받음");
        var second=pose(HeroMotionKind.Swing,2,.4f,.4f,false);
        Check(n(second,"RightPitch")==0&&n(second,"RightYaw")==0,"2타 오른 지지발은 제자리 유지");
        Check(n(second,"LeftPitch")==n(first,"RightPitch")&&n(second,"LeftYaw")==-n(first,"RightYaw"),"2타는 1타의 반대 발·회전으로 체중 전달");
        foreach(int combo in new[]{1,2})foreach(string field in fields)
        {
            Check(n(pose(HeroMotionKind.Swing,combo,0,.4f,false),field)==0,"일반 공격 첫틱은 원 발목에서 시작: "+field);
            Check(Math.Abs(n(pose(HeroMotionKind.Swing,combo,1,.4f,false),field)-n(pose(HeroMotionKind.Recover,combo,0,.4f,false),field))<.00001,"베기→회복 회전 키 연속: "+field);
            Check(n(pose(HeroMotionKind.Recover,combo,1,.4f,false),field)==0,"회복 끝은 기존 운반포즈: "+field);
            Check(n(pose(HeroMotionKind.Swing,combo,.4f,.4f,true),field)==0,"이동 공격의 보행 발목은 덮지 않음: "+field);
            Check(n(pose(HeroMotionKind.Swing,combo,0,0,false),field)==n(pose(HeroMotionKind.Swing,combo,.4f,.4f,false),field),"즉발 검기는 새 예비틱 없이 첫틱 접점: "+field);
        }
        foreach(var kind in new[]{HeroMotionKind.Roll,HeroMotionKind.Dead,HeroMotionKind.Run,HeroMotionKind.Idle,HeroMotionKind.Bash,HeroMotionKind.BashRecover,HeroMotionKind.SlamWindup,HeroMotionKind.SlamStrike,HeroMotionKind.SlamRecover,HeroMotionKind.Hurt,HeroMotionKind.Cast,HeroMotionKind.Charge,HeroMotionKind.Guard})
            foreach(string field in fields)Check(n(pose(kind,1,.4f,.4f,false),field)==0,"기존 검수 동작은 변경하지 않음: "+kind+"/"+field);
        foreach(string field in fields)Check(n(pose(HeroMotionKind.Swing,3,.4f,.4f,false),field)==0,"기존3타 접지는 보존: "+field);
        foreach(float phase in new[]{float.NaN,float.PositiveInfinity,-1,0,.2f,.4f,.8f,1,2})foreach(string field in fields)
        {float value=n(pose(HeroMotionKind.Swing,1,phase,.4f,false),field);Check(!float.IsNaN(value)&&!float.IsInfinity(value)&&Math.Abs(value)<=16,"경계값 발목 키는 유한 범위: "+field);}
        var repeat=pose(HeroMotionKind.Swing,1,.4f,.4f,false);foreach(string field in fields)Check(n(first,field)==n(repeat,field),"동일 Core 표본은 정지 중 회전 누적 없음: "+field);
    }

    static void Main(){RegressionFootwork();Console.WriteLine("전사 정지 베기 발 회전: "+checks+"개 통과");}
}
