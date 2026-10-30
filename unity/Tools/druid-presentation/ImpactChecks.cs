using System;
using Exoduser.UnityPort;

static class ImpactChecks
{
    public static void Run(Action<bool, string> check)
    {
        var c = new NativeDruidImpactClock();
        c.Begin(100, 7, 100, 200, 20, "idle", true, 190, 200);
        c.OfferHit(100, 100, 200, false);
        var r = c.Finish(100);
        check(r.Hit && r.DrawHit && !r.Critical && r.Width == 48 && r.Life == 6 && r.HoldTicks == 2, "일반 보스 피격은 국소48px·6틱·배우 자세2틱");
        check(c.Holding(100) && c.Holding(101) && !c.Holding(102), "일반 자세 정지는 정확히2Core틱 뒤 풀림");
        check(c.Shake(100) == 2 && c.Shake(101) < 2 && c.Shake(108) == 0, "일반 보조 흔들림2px·감쇠·8틱 종료");
        check(!c.Finish(100).Hit, "같은 Core틱의 반복 배출은 추가 접점0");
        c.Begin(110, 7, 100, 200, 20, "idle", true, 190, 200);
        c.OfferHit(110, 100, 200, false); c.OfferHit(110, 100, 200, true); c.OfferHit(110, 100, 200, false);
        r = c.Finish(110);
        check(r.Hit && r.Critical && r.Width == 72 && r.Life == 8 && r.HoldTicks == 4, "동일틱 일반/치명타는 치명타72px·8틱 하나");
        check(c.Holding(113) && !c.Holding(114) && c.Shake(110) == 4, "치명타 자세4틱·보조흔들림4px");
        c.Begin(120, 7, 100, 200, 20, "idle", true, 190, 200);
        c.OfferHit(120, 100, 200, true); c.OfferKi(120, 119, 200);
        r = c.Finish(120);
        check(r.Hit && !r.DrawHit && c.Holding(120), "동일틱 실제보스반경 내 기검참 광은 추가접점광만 억제");
        c.Begin(130, 7, 100, 200, 20, "idle", true, 190, 200);
        c.OfferKi(130, 121, 200); c.OfferHit(130, 100, 200, false);
        check(c.Finish(130).DrawHit, "보스반경 밖의 다른 적 기검참 광은 억제 근거가 아님");
        c.Begin(140, 7, 100, 200, 20, "idle", true, 190, 200);
        c.OfferHit(139, 100, 200, true); c.OfferHit(140, 121, 200, false);
        check(!c.Finish(140).Hit && !c.Holding(140), "과거틱 이벤트·다른 위치 보스 이벤트 거절");
        c.Begin(150, 7, 100, 200, 20, "bossSlamWind", true, 190, 200); c.Finish(150);
        c.Begin(151, 7, 100, 200, 20, "bossSlam", true, 190, 200);
        check(!c.Finish(151).Slam, "슬램 예비 끝에는 접촉광을 터뜨리지 않음");
        c.Begin(157, 7, 100, 200, 20, "bossRec", true, 185, 210);
        r = c.Finish(157);
        check(r.Slam && r.TipX == 185 && r.TipY == 210, "실제 bossSlam→bossRec에만 기존 지팡이 접촉점 사용");
        check(!c.Finish(157).Slam, "슬램 접촉은 같은틱1회");
        c.Begin(158, 7, 100, 200, 20, "bossRec", true, 185, 210);
        check(!c.Finish(158).Slam, "후속 회복 틱에서 슬램 재발동 없음");
        c.Begin(159, 7, 100, 200, 20, "bossSlam", true, 185, 210); c.Finish(159);
        c.Begin(160, 7, 100, 200, 20, "bossRec", true, 185, 210); c.OfferHit(160, 100, 200, false);
        check(c.Finish(160).HoldTicks == 4, "슬램 접촉과 일반 피격이 겹쳐도 강한 자세정지4틱 보존");
        c.Begin(161, 7, 100, 200, 20, "bossDruidUnder", true, 190, 200);
        check(!c.Holding(161) && c.Shake(161) == 0, "지하상태는 자세정지와 보조흔들림 즉시해제");
        c.Begin(162, 7, 100, 200, 20, "idle", true, 190, 200); c.OfferHit(162, 100, 200, true); c.Finish(162);
        c.Begin(163, 7, 100, 200, 20, "eDeath", true, 190, 200);
        check(!c.Holding(163) && c.Shake(163) == 0, "죽음상태는 자세정지와 보조흔들림 즉시해제");
        c.Begin(170, 7, 100, 200, 20, "idle", true, 190, 200); c.OfferHit(170, 100, 200, true); c.Finish(170);
        c.Begin(171, 8, 100, 200, 20, "idle", true, 190, 200);
        check(!c.Holding(171) && c.Shake(171) == 0, "새 드루이드 객체로 이전 배우의 효과를 넘기지 않음");
        c.Reset();
        check(!c.Holding(171) && c.Shake(171) == 0, "새런/정리에서 표현 상태 해제");
        foreach (string recoveryState in new[] { "recover", "bossRec" })
        {
            var branch = new NativeDruidImpactClock();
            branch.Begin(1, 1, 0, 0, 20, "bossSlamWind", true, 90, 0); branch.Finish(1);
            branch.Begin(2, 1, 0, 0, 20, "bossSlam", true, 90, 0);
            check(!branch.Finish(2).Slam, "기본/리모델 예비 끝에서 슬램 추가접점0: " + recoveryState);
            branch.Begin(10, 1, 0, 0, 20, recoveryState, true, 90, 0);
            check(branch.Finish(10).Slam, "실제 Core Recover 분기의 슬램 접촉: " + recoveryState);
        }
        var observed = new NativeDruidImpactClock();
        observed.Begin(1, 7, 0, 0, 20, "idle", true, 90, 0); observed.OfferHit(1, 0, 0, true); observed.Finish(1);
        check(observed.LastContactTick == 1 && observed.LastContact.Critical && observed.LastContact.Width == 72, "읽기 진단은 새 피해틱의 실제 치명 접점을 보존");
        observed.Finish(1); observed.Begin(2, 7, 0, 0, 20, "idle", true, 90, 0); observed.Finish(2);
        check(observed.LastContactTick == 1, "중복배출과 무접점 틱은 마지막 실제접점 진단을 덮지 않음");
        observed.Reset(); check(observed.LastContactTick == -1 && !observed.LastContact.Hit, "Reset은 접점 진단도 초기화");
        var actorHold = new NativeDruidPoseHold<string>();
        actorHold.Select(10, "이전보스", false, false, 7);
        check(actorHold.Select(11, "새보스", true, false, 8) == "새보스", "새 배우 첫틱 hit는 이전 보스 자세를 가져오지 않음");
        check(actorHold.Select(12, "새보스현재", false, false, 8) == "새보스현재", "새 배우 해제는 새 배우의 현재 자세");
        var sheetHold = new NativeDruidPoseHold<NativeDruidSheetPose>();
        var sheet = new NativeDruidSheetPose { Sheet = "attack", Columns = 4, Rows = 8, Frame = 2, DirectionRow = true };
        sheetHold.Select(1, sheet, false, false, 7);
        var nextSheet = sheet; nextSheet.Frame = 3;
        var heldSheet = sheetHold.Select(2, nextSheet, true, false, 7);
        int col, row; heldSheet.Cell(5, out col, out row);
        check(col == 2 && row == 5, "2D 공격 hold는 시간셀만고정·방향row는현재5");
        sheet = new NativeDruidSheetPose { Sheet = "walk", Columns = 4, Rows = 8, Frame = 1, DirectionRow = true };
        sheet.Cell(7, out col, out row); check(col == 1 && row == 7, "2D 걷기 현재 방향row 유지");
        foreach (string directional in new[] { "base8", "beast" })
        {
            sheet = new NativeDruidSheetPose { Sheet = directional, Columns = 4, Rows = 2, Frame = 1, DirectionCell = true };
            sheet.Cell(6, out col, out row); check(col == 2 && row == 1, "방향 자체가셀인 자세는현재dir6: " + directional);
        }
        sheet = new NativeDruidSheetPose { Sheet = "dive", Columns = 4, Rows = 2, Frame = 5 };
        sheet.Cell(7, out col, out row); check(col == 1 && row == 1, "다이브/등장 시간셀은 방향과 독립적으로 유지");
        var actors = new[] { new NativeDruidImpactClock.Actor { Id = 7, Etype = 0, X = 0, Y = 0, Radius = 20, Alive = true, IsBoss = true } };
        check(NativeDruidImpactClock.SourceMatches(7, 0, 0, true, 0, 0, actors), "IsBoss+etype+현재좌표가유일하게본체와일치");
        check(!NativeDruidImpactClock.SourceMatches(7, 0, 1, true, 0, 0, actors), "다른etype의 보스사건 제외");
        check(!NativeDruidImpactClock.SourceMatches(7, 0, 0, false, 0, 0, actors), "필드 일반몹/IsBoss아닌사건 제외");
        var overlap = new[] { actors[0], new NativeDruidImpactClock.Actor { Id = 8, Etype = 0, X = 10, Y = 0, Radius = 20, Alive = true, IsBoss = true } };
        check(!NativeDruidImpactClock.SourceMatches(7, 0, 0, true, 0, 0, overlap), "같은etype 복수생존보스의 반경겹침은 모호하므로효과생략");
        overlap[1].Alive = false;
        check(NativeDruidImpactClock.SourceMatches(7, 0, 0, true, 0, 0, overlap), "죽은 다른보스는 모호성에 포함하지않음");
        check(!NativeDruidImpactClock.SourceMatches(8, 0, 0, true, 0, 0, actors), "현재본체id가목록에없으면사건을수락하지않음");

        var hold = new NativeDruidPoseHold<string>();
        check(hold.Select(10, "공격셀1", false, false) == "공격셀1", "2D 기저 그림은 평상시 그대로 표시");
        check(hold.Select(11, "공격셀2", true, false) == "공격셀1" && hold.Select(12, "회복셀1", true, false) == "공격셀1", "2D 자세정지 동안 그림만 유지·기저 자세는 계속 관찰");
        check(hold.Select(13, "회복셀3", false, false) == "회복셀3", "정지 해제는 과거공격 대신 현재회복으로 즉시 복귀");
        check(hold.Select(14, "사망셀1", true, true) == "사망셀1", "사망 그림이 자세정지보다 우선");
        check(hold.Select(15, "지하셀", true, true) == "지하셀" && hold.Select(16, "등장셀", true, false) == "등장셀", "지하상태 해제 뒤 과거 그림 재사용 없음");
        var motion = new NativeDruidMotionClock();
        var poseHold = new NativeDruidPoseHold<NativeDruidMotionClock.Pose>();
        var pose = motion.Sample(0, "bossSlamWind", "slam", 48, 48, false, false, false);
        poseHold.Select(0, pose, false, false);
        pose = motion.Sample(47, "bossSlamWind", "slam", 1, 48, false, false, false);
        var displayed = poseHold.Select(47, pose, false, false);
        pose = motion.Sample(48, "bossSlam", "slam", 6, 48, false, false, false);
        check(poseHold.Select(48, pose, true, false).Time == displayed.Time, "3D 자세정지는 표시 결과만 유지");
        pose = motion.Sample(49, "bossSlam", "slam", 5, 48, false, false, false); poseHold.Select(49, pose, true, false);
        pose = motion.Sample(50, "bossSlam", "slam", 4, 48, false, false, false);
        check(Math.Abs(poseHold.Select(50, pose, false, false).Time - 50.0/124) < .00001, "3D 기저시계는 정지 중에도 발동2틱을 진행·복귀되감김0");
        check(Math.Abs(NativeDruidImpactClock.CombineShake(14, 4, .8) - 11.2) < .00001 && NativeDruidImpactClock.CombineShake(0, 4, 0) == 0, "기존슬램14px와 보조4px는 max·사용자옵션 한번·shake0존중");
    }
}
