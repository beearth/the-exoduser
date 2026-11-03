# RB1-7 / RB1-8 구현 기록 — 2026-11-03

최신 병합: origin/unity/main d6c5bb89b → e575f277cd. 작업본 G:/exoduser-wt/codex-boss-arena, 브랜치 codex/unity-boss-arena-20261103. 20:25 CTO 결정을 적용한다. PC는 CPU 하니스·Roslyn 컴파일, Player 빌드·화면·성능 판정은 Mac 담당이다.

## RB1-7 현재 상태

수치7기술·4콤보·채찍480·돌진폭1.5 연결 완료, CPU 전투 검증 PASS. 실제 플레이 판정 미검증. [정본 §13](UNITY_BOSS_RM1_DARK_DRUID_20261027.md#13-rb1-7--첫-보스-재기획-반영-보스전-카메라-줌--기술-7개-수치-2026-11-03-보스전-총괄-명세).

| id(원래 슬롯 유지) | P | tele | active | rec | cd | 크기 |
|---|---|---|---|---|---|---|
| slashCombo | 1·2·3 | 36/26/26 | 각10, HitAt6 | 84 | 120 | 추가사거리480 |
| slam | 1·2·3 | 52 | 6 | 76 | 160 | r260 |
| charge | 1·2·3 | 58 | 최대40,22px/틱 | 74 | 130 | 전체폭×1.5 |
| grab | 1·2·3 | 64 | 덮치기20,9px/틱,흡수120 | 빗나감84/던진뒤60 | 200 | GrabContact150(+120) |
| burrowStrike | 2·3 | 56 | 땅속45/솟기예고34 | 76 | 220 | 기둥 옆 |
| groundFissure | 2·3 | 42 | 머리14px/틱 | 60 | 160 | 기존 |
| heartbeat | 3 | 90/60/60 | 간격30 | 90 | 2400 | 발치r260+기둥그림자 |

fan/chaseAoe/summon/tideWave/seekerMines는 슬롯·실행기를 남기고 Phase 비움. 콤보 C1·C2(P1~3), C4·C7(P2~3). WalkStandOff220, 걷기1.1/가속20/정지12/회전3°·2°/조준고정12/빈시간45·36·30/연계12는 기존 계약. SFX 데이터 참조 지연은 채찍40/30/30틱·내려찍기58틱(청취 미검증).

## 검증과 잠행 실패 정정

- 이전41d16c6dd는 데이터 부분구현·잠행18실패 체크포인트였다. 재개 전 하니스를 재실행하지 않고 원인을 분리했다.
- 실제 BurrowTarget 출현오차0. HurtEnemy의 넉백0.75px가 출현 뒤 누적되어 9번째틱에 반경오차3.02545px. 검사 전제가 잘못돼, 출현 전·첫 출현은 기존3px 한계, 이후는 예고중심=실제 보스 위치0.001px로 구분했다. Core의 잠행 위치·넉백 수정0.
- 새 실제 피해 경계 테스트 RED4건 확인 뒤 드루이드 전용 값 연결. 처음 GREEN 검사에서 예고상수 연결누락 및 기존 채찍전진2.5px를 빼먹은 테스트 배치2건을 확인·수정했다.
- 최종 druid-remodel100385/0, remodel-frame124/0. flag-off 웹 oracle48케이스·54400틱·5421635검사/0불일치. 로그는 레인 폴더 DruidRemodelTests.out.log·DruidBossTests.out.log·burrow-origin-probe.out.log.
- 전체 디자인·Player·60fps PASS 아님. Mac 같은 SHA1920/3840 실제 플레이 판정 대기.

## RB1-8a

착수 예정: 34°/FOV46.9453/전방1.45 고정, 보스 생존~침강동안18.3·복귀16.5·0.6초 전환. BossArenaLayout 기반 회색 바닥·외곽3~6m·Core 기둥4개3.2m. GroundY 아레나 분기·2D 폴백. 미술마감8d는 맵 총괄이며8b·8c로 승격하지 않는다.

## Mac 검수 인자

<Player경로> --remodel3d --unity-druid-remodel --unity-boss-direct 0 --unity-mute --unity-qa-sandbox <격리프로필경로> -screen-width 1920 -screen-height 1080 -logFile <로그경로>. 같은 SHA3840×1080도 검수한다. 보스직행 강제검수와 자연진입·퇴장 판정을 구분한다.
