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

    // 11-07 대검 손 키 1타: 클립 프레임 = Core 경과 틱(예비24·스윙5·회복28), HitArc 틱 = 클립 접점 f26
    static void RegressionGreatswordKeyClock()
    {
        var k=new GreatswordKeyClock();int t=100;
        Func<string,float,bool,HeroMotionInput> q=(state,left,basic)=>new HeroMotionInput{State=state,Tick=t,RemainingTicks=left,BasicWindup=basic,EffectiveHealth=100};
        k.Observe(q("idle",0,false));Check(!k.Active,"대기에서는 키 클립 비활성");
        t++;int input=t;k.Observe(q("wWindup",24,true));Check(k.Active&&k.Frame==0,"1타 입력 틱 = 클립 f0");
        for(int i=1;i<24;i++){t++;k.Observe(q("wWindup",24-i,true));}
        Check(k.Frame==23,"예비 마지막 틱 = f23");
        t++;k.Observe(q("wSwing",5,false));Check(k.Frame==24,"wSwing 진입 = f24");
        t++;k.Observe(q("wSwing",4,false));t++;k.Observe(q("wSwing",3,false));
        Check(k.Frame==GreatswordKeyClock.ContactFrame&&t-input==26,"HitArc 틱(StateTicks 3) = 클립 접점 f26 = 입력+26");
        t++;k.Observe(q("wSwing",2,false));t++;k.Observe(q("wSwing",1,false));
        t++;k.Observe(q("wRecover",28,false));Check(Math.Abs(k.Frame-29)<1e-4,"회복 진입 = f29");
        for(int i=27;i>=1;i--){t++;k.Observe(q("wRecover",i,false));}
        Check(k.Frame>55&&k.Frame<56&&k.Weight<.3f,"회복 끝 = f55, 대기 포즈로 혼합 복귀");
        t++;k.Observe(q("idle",0,false));Check(!k.Active,"idle 복귀 = 비활성");
        t++;k.Observe(q("wWindup",999,false));Check(!k.Active,"기검참 충전 예비는 1타 클립이 아님");
        t++;k.Observe(q("wSwing",5,false));Check(!k.Active,"예비 없는 2·3타 스윙은 1타 클립이 아님");
        t++;k.Observe(q("wWindup",24,true));t++;var roll=q("wWindup",23,true);roll.Rolling=true;k.Observe(roll);Check(!k.Active,"구르기로 끊기면 비활성");
    }
    static void RegressionGreatswordKeyDirector()
    {
        var k=new GreatswordKeyDirector();int t=500;
        Func<string,float,bool,bool,float,HeroMotionInput> q=(state,left,basic,ki,charge)=>new HeroMotionInput{State=state,Tick=t,RemainingTicks=left,BasicWindup=basic,KiAttack=ki,Charge=charge,EffectiveHealth=100};
        Action<string,int,bool,bool> run=(state,len,basic,ki)=>{for(int i=0;i<len;i++){k.Observe(q(state,len-i,basic,ki,0));t++;}};
        // 1타 (검기 모드 = 콤보 클립, 무기 모드 = 1타 클립): 입력+26 = 접점 f26
        k.Observe(q("idle",0,false,true,0));t++;Check(!k.Active,"대기 = 키 비활성");
        int input=t;for(int i=0;i<24;i++){k.Observe(q("wWindup",24-i,true,true,0));t++;}
        Check(k.Clip==GreatswordClip.Combo&&k.Frame==23,"검기 1타 예비 = 콤보 클립 f23");
        for(int i=0;i<3;i++){k.Observe(q("wSwing",5-i,false,true,0));if(i<2)t++;}
        Check(k.Frame==26&&t-input==26,"1타 HitArc 틱 = 콤보 f26 = 입력+26");t++;
        k.Observe(q("wSwing",2,false,true,0));t++;k.Observe(q("wSwing",1,false,true,0));t++;
        run("wRecover",28,false,true);Check(k.Frame>55&&k.Weight<.3f,"1타 회복 끝 f55 이후, 혼합 복귀");
        // 2타: 예비 없이 바로 휘두르기 -> 콤보 f57, HitArc(StateTicks 3) = f59
        k.Observe(q("idle",0,false,true,0));t++;
        k.Observe(q("wSwing",5,false,true,0));Check(k.Clip==GreatswordClip.Combo&&k.Frame==57&&k.Weight>.99f&&k.SinceSwitch==0,"2타 스윙 진입 = 콤보 f57, 1타 회복 키 자세에서 바로 이어 받음(운반 포즈 혼합 없음)");t++;
        k.Observe(q("wSwing",4,false,true,0));t++;k.Observe(q("wSwing",3,false,true,0));Check(k.Frame==59,"2타 HitArc = 콤보 f59");t++;
        k.Observe(q("wSwing",2,false,true,0));t++;k.Observe(q("wSwing",1,false,true,0));t++;
        k.Observe(q("wRecover",34,false,true,0));Check(Math.Abs(k.Frame-62)<1e-4,"2타 회복 진입 = f62");t++;
        // 3타 탭: 충전 1틱 뒤 놓기 -> 콤보 f97, HitArc f99
        k.Observe(q("idle",0,false,true,0));t++;
        k.Observe(q("wWindup",999,false,true,1));Check(k.Clip==GreatswordClip.Charge&&k.Frame==0,"3타 충전 시작 = 차징 f0");t++;
        k.Observe(q("wSwing",5,false,true,0));Check(k.Clip==GreatswordClip.Combo&&k.Frame==97&&k.SinceSwitch==0,"탭 놓기 = 콤보 f97, 앞 자세에서 혼합");t++;
        k.Observe(q("wSwing",4,false,true,0));t++;k.Observe(q("wSwing",3,false,true,0));Check(k.Frame==99,"3타 탭 HitArc = 콤보 f99");t++;
        k.Observe(q("wRecover",34,false,true,0));t++;k.Observe(q("idle",0,false,true,0));t++;
        // 차징 3단 -> 놓기: 40·80·120틱 단계, 170틱 뒤 숨쉬기 반복, 놓으면 놓기 f10, HitArc f12
        for(int i=0;i<200;i++){k.Observe(q("wWindup",999,false,true,Math.Min(120,i+1)));if(i==120)Check(k.Frame==120,"차징 120틱 = 3단 f120");if(i<199)t++;}
        Check(k.Clip==GreatswordClip.Charge&&k.Frame>=GreatswordKeyDirector.ChargeLoopStart&&k.Frame<GreatswordKeyDirector.ChargeEnd,"170틱 넘게 버티면 숨쉬기 반복 구간");t++;
        k.Observe(q("wSwing",5,false,true,0));Check(k.Clip==GreatswordClip.Release&&k.Frame==10,"차지 놓기 = 놓기 f10");t++;
        k.Observe(q("wSwing",4,false,true,0));t++;k.Observe(q("wSwing",3,false,true,0));Check(k.Frame==12,"놓기 HitArc = f12");t++;
        // 우클: sDraw 길이와 무관하게 f3에서 버티고, sBash 남은 틱 12(진입+8) = f12
        k.Observe(q("idle",0,false,true,0));t++;
        for(int i=0;i<30;i++){k.Observe(q("sDraw",999,false,true,0));t++;}
        Check(k.Clip==GreatswordClip.Bash&&k.Frame==3,"긴 sDraw는 가드 f3 유지");
        for(int i=0;i<9;i++){k.Observe(q("sBash",20-i,false,true,0));if(i<8)t++;}
        Check(k.Frame==12,"sBash 타격(남은 12) = 우클 f12");t++;
        k.Observe(q("sRecover",28,false,true,0));Check(Math.Abs(k.Frame-24)<1e-4,"sRecover 진입 = f24");t++;
        // 무기 모드 1타 = 1타 클립, 구르기로 끊기면 비활성
        k.Observe(q("idle",0,false,false,0));t++;k.Observe(q("wWindup",24,true,false,0));Check(k.Clip==GreatswordClip.A1&&k.Frame==0,"무기 모드 1타 = 1타 클립 f0");t++;
        var roll=q("wWindup",23,true,false,0);roll.Rolling=true;k.Observe(roll);Check(!k.Active,"구르기로 끊기면 비활성");
        Check(Math.Abs(GreatswordKeyDirector.SocketToTip-2.265625f)<1e-5,"칼 2.50m: 소켓~칼끝 2.2656m");
    }
    static void Main(){RegressionFootwork();RegressionGreatswordKeyClock();RegressionGreatswordKeyDirector();Console.WriteLine("전사 정지 베기 발 회전·대검 키 시계·5클립 지휘: "+checks+"개 통과");}
}
