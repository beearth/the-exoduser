using System;
using Exoduser.UnityPort;

static class Program
{
    static int checks;
    static void Check(bool ok,string label){checks++;if(!ok)throw new Exception(label);}
    public static int Main()
    {
        try
        {
            ImpactChecks.Run(Check);
            foreach(double radius in new[]{-4.0,0,4,14,30,80})
            foreach(double size in new[]{0.0,1,2,8})
            foreach(bool large in new[]{false,true})
            {
                double d=NativeDruidProjectileSize.ProjectileDiameter(radius,size,large);
                Check(d>=Math.Max(0,radius)*2,"독 핵이 실제 원형 판정을 덮음");
                Check(d>=12&&!double.IsNaN(d)&&!double.IsInfinity(d),"최소 가독 크기와 유한 크기");
            }
            Check(NativeDruidProjectileSize.ProjectileDiameter(4,1,false)==14,"일반 독탄14px 기존값");
            Check(NativeDruidProjectileSize.ProjectileDiameter(4,8,false)==28,"일반 독탄 상한28px 기존값");
            Check(NativeDruidProjectileSize.ProjectileDiameter(4,8,true)==64,"대형 독탄 상한64px 기존값");
            Check(NativeDruidProjectileSize.ProjectileDiameter(40,1,false)==80,"큰 판정 원은 시각 상한보다 우선");
            Check(NativeReviewArgs.Any&&NativeReviewArgs.OriginalDruidProjectiles,"원본 비교 검수는 저장 차단 대상");
            Check(NativeReviewArgs.IsReviewArgument("--unity-original-druid-projectiles"),"원본 비교 중 지역명 표시 허용");
            Check(!NativeReviewArgs.IsReviewArgument("--unity-druid-3d"),"제외된 새 3D 선택 옵션 미등록");
            Console.WriteLine("순수2D 검사="+checks+" 실패=0");return 0;
        }
        catch(Exception e){Console.Error.WriteLine("실패: "+e.Message);return 1;}
    }
}
