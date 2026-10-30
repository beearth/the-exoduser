using System;
using Exoduser.UnityPort;

static class Program
{
    static int checks;
    static void Check(bool ok, string name) { checks++; if (!ok) throw new Exception(name); }
    static bool Near(double a, double b) { return Math.Abs(a - b) < 0.00001; }
    static int Main()
    {
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        try
        {
            var clock = new NativeDruidMotionClock();
            var wind = clock.Sample(100, "bossSlamWind", "slam", 48, 48, false, false, false);
            Check(wind.Clip == "Slam" && Near(wind.Time, 0), "강타 예비 첫 프레임");
            wind = clock.Sample(124, "bossSlamWind", "slam", 24, 48, false, false, false);
            Check(Near(wind.Time, 24.0 / 124), "48프레임 예비의 중간 자세");
            var frozen = clock.Sample(124, "bossSlamWind", "slam", 24, 48, false, false, false);
            Check(Near(wind.Time, frozen.Time), "렌더 반복·타격 정지 중 자세 보존");
            var active = clock.Sample(148, "bossSlam", "slam", 6, 48, false, false, false);
            Check(Near(active.Time, 48.0 / 124), "Core 강타 발동 첫 프레임과 접점 일치");
            active = clock.Sample(151, "bossSlam", "slam", 3, 48, false, false, false);
            Check(Near(active.Time, 51.0 / 124), "강타 발동 6프레임 연속 샘플");
            var recovery = clock.Sample(154, "bossRec", "slam", 70, 48, false, false, false);
            Check(recovery.Clip == "Slam" && Near(recovery.Time, 54.0 / 124), "회복은 같은 강타 클립을 이어서 사용");
            recovery = clock.Sample(189, "bossRec", "slam", 35, 48, false, false, false);
            Check(Near(recovery.Time, 89.0 / 124), "회복 중간의 무게·복귀 자세");
            Check(clock.Sample(224, "bossRec", "slam", 0, 48, false, false, false).Time == 1, "회복 끝에서 클립 마지막 자세");
            var fan = clock.Sample(240, "bossFanWind", "fan", 38, 38, false, false, false);
            Check(fan.Clip == "CastThorn", "가시 부채 시전 동작 분리");
            Check(clock.Sample(241, "bossPoisonTrail", "poisonTrail", 30, 0, false, false, false).Clip == "CastPoison", "독 시전 동작 분리");
            Check(clock.Sample(242, "bossRmWind", "groundFissure", 40, 40, false, false, false).Clip == "CastRoot", "뿌리 시전 동작 분리");
            var walk = clock.Sample(300, "idle", "", 0, 0, true, false, false);
            var walkLater = clock.Sample(330, "idle", "", 0, 0, true, false, false);
            Check(walk.Clip == "Walk" && walkLater.Time > walk.Time, "이동 중 보행 클립을 매 렌더마다 재시작하지 않음");
            var death = clock.Sample(360, "eDeath", "", 0, 0, false, false, true);
            var deathLast = clock.Sample(600, "eDeath", "", 0, 0, false, false, true);
            Check(death.Clip == "Death" && death.Time == 0 && deathLast.Time == 1, "사망은 일회 재생 후 마지막 자세 유지");
            Check(clock.Sample(610, "eHit", "", 10, 0, false, true, false).Clip == "Hit", "피격 동작 분리");
            Check(NativeDruidMotionClock.ProjectileDiameter(4, 1, false) >= 12 && NativeDruidMotionClock.ProjectileDiameter(4, 1, false) <= 24, "일반 독탄의 읽히는 핵·국소 광량 크기");
            Check(NativeDruidMotionClock.ProjectileDiameter(30, 1, true) >= 60, "대형탄은 실제 충돌 원보다 작게 표시하지 않음");
            Check(NativeReviewArgs.Any && NativeReviewArgs.IsReviewArgument("--unity-druid-3d"), "3D 검수 옵션의 실제 세이브 쓰기 금지·지역명 표시 허용");
            Check(NativeReviewArgs.Any && NativeReviewArgs.IsReviewArgument("--unity-original-druid-projectiles"), "원본 탄막 A/B 검수 옵션의 세이브 쓰기 금지·지역명 표시 허용");
            var validSkin = new NativeDruidRigContract.Skin { Vertices = 3, Indices = 3, BindPoses = 1, BonePaths = new[] { "" }, MatricesValid = true, Visible = true };
            string reason;
            Check(!NativeDruidRigContract.Validate(false, false, false, new NativeDruidRigContract.Skin[0], out reason), "빈 프리팹이 2D 본체를 숨기지 않음");
            Check(NativeDruidRigContract.Validate(true, true, false, new[] { validSkin }, out reason), "유효 Generic 리그·루트 자체 바인드 허용");
            Check(!NativeDruidRigContract.Validate(true, false, false, new[] { validSkin }, out reason), "무효 Avatar 거절");
            Check(!NativeDruidRigContract.Validate(true, true, true, new[] { validSkin }, out reason), "Generic 클립 계약에서 Humanoid Avatar 거절");
            Check(!NativeDruidRigContract.Validate(true, true, false, new NativeDruidRigContract.Skin[0], out reason), "Animator/Avatar만 있고 스킨 없는 프리팹 거절");
            var invalidSkin = validSkin; invalidSkin.Vertices = 0;
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "빈 스킨 메시 거절");
            invalidSkin = validSkin; invalidSkin.Indices = 0;
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "정점만 있고 면 없는 메시 거절");
            invalidSkin = validSkin; invalidSkin.BindPoses = 2;
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "바인드행렬/본 개수 불일치 거절");
            invalidSkin = validSkin; invalidSkin.BonePaths = new string[] { null };
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "누락·Animator 밖 본 경로 거절");
            invalidSkin = validSkin; invalidSkin.MatricesValid = false;
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "NaN/무한/퇴화 바인드행렬 거절");
            invalidSkin = validSkin; invalidSkin.Visible = false;
            Check(!NativeDruidRigContract.Validate(true, true, false, new[] { invalidSkin }, out reason), "모든 스킨이 숨겨진 프리팹 거절");
            Check(NativeDruidRigContract.Validate(true, true, false, new[] { validSkin, invalidSkin }, out reason), "추가 비활성 LOD 스킨 허용");
            foreach (double facing in new[] { 0.0, Math.PI / 2, Math.PI, Math.PI * 1.5 })
            {
                double yaw = NativeDruidMotionClock.FacingYawDegrees(facing) * Math.PI / 180;
                Check(Near(-Math.Sin(yaw), Math.Cos(facing)) && Near(-Math.Cos(yaw), -Math.Sin(facing)), "Unity -Z 정면이 Core 동/남/서/북 방향과 일치: " + facing);
            }
            Console.WriteLine("검사=" + checks + " 실패=0");
            return 0;
        }
        catch (Exception e) { Console.Error.WriteLine("실패: " + e.Message); return 1; }
    }
}
