# RB1-7 기술 데이터·RB1-8 아레나 인계 — 2026-11-03

기준: origin/unity/main 9f0d00cf808343fa33f4d7599ec9c619ff1ec895. 작업본 G:/exoduser-wt/codex-boss-arena, 브랜치 codex/unity-boss-arena-20261103. origin/main 80771c8e875886e137d577a136ae80360972e4b2의 UNITY_BOSS_RM1_DARK_DRUID_20261027 §13·§14와 BOSS_1-1_FIRST_BOSS_REPLAN_G0_20261103 §15~§17을 git show로 읽었다. 유료 호출 0, Unity/Player 실행 0, USER_SAVE 접근 0, Library 복사 0.

## 현재 판정

**RB1-7 부분 구현 / 전투 하니스 FAIL / 통합 금지. RB1-8a~c 미착수.** 3D 아레나·카메라·조명·미술 완료를 주장하지 않는다. PC는 지정된 Roslyn 도구의 Player·Editor 어셈블리 컴파일까지만 수행했다. 실제 Player 빌드·화면·60fps·Mac 동기화는 미검증이다.

| 검증 | 결과 | 근거 |
|---|---|---|
| 변경 전 하니스 RED | 드루이드 97,850검사 / 70실패, 프레임 124 / 0 | 새 수치·페이즈 요구의 예상 실패 확인 |
| 데이터 적용 후 전투 하니스 | 드루이드 100,375검사 / **18실패**, 프레임 124 / 0 | 18건 전부 잠행 원이 기둥 옆 고정 반경 ±3px를 벗어남. 수치·정확한 페이즈 목록·콤보·M1~M5의 나머지 검사는 통과 |
| Player·Editor Roslyn | **5어셈블리 오류 0** | Player Core121/Runtime250, Editor Core121/Runtime250/Editor57 소스. 기존 assembly-compile-check.cjs, 읽기 전용 LibraryProject=codex-unity-parity-1102/unity |
| druid-boss-oracle | 미실행 | 데이터 외 실행기 코드는 수정하지 않았지만 0불일치 확인을 주장하지 않음 |
| SDK/MSBuild 준비 | NuGet ConfigurationDefaults path1=null로 2회 실패 | SDK 빌드 재시도 중단. 이후 NuGet 없이 설치된 net8 참조와 Unity Roslyn으로 하니스 컴파일 |

운영 매뉴얼 §2.3·§4의 동일 테스트 두 번 실패 시 중단 규칙에 따라 RED→적용 후 실행에서 멈췄다. 세 번째 하니스 실행·RB1-8 구현·테스트 허용 오차 완화는 하지 않았다. 잠행 실패의 근본 원인은 아직 확정하지 않았다. 원인 규명 후 담당자가 변경하고 재검증해야 한다.

## 실제 데이터 값(60fps ticks, px)

12개의 원래 배열 슬롯·Idx는 예고·사운드 ID 계약 때문에 보존한다. 활성 기술은 7개이고 아래 P는 1부터 표기한다.

| 슬롯 / id | 활성 P | tele | active / 속도 | rec | cd | 실제 적용 크기 |
|---|---|---:|---|---:|---:|---|
| 1 slashCombo | 1·2·3 | 36 / 26 / 26 | 각10, HitAt6 | 84 | 120 | 기존 판정 추가 거리300 유지; 요구 ×1.6 미적용 |
| 2 slam | 1·2·3 | 52 | 6 | 76 | 160 | SlamRadius260 |
| 3 charge | 1·2·3 | 58 | 최대40, 22px/tick | 74 | 130 | 기존 반폭 R+pr+80 유지; 요구 ×1.5 미적용 |
| 4 groundFissure | 2·3 | 42 | 머리14px/tick | 60 | 160 | 기존 판정 유지 |
| 6 grab | 1·2·3 | 64 | 덮치기20, 9px/tick; 흡수120 | 실패84 / 던진 뒤60 | 200 | GrabContact30→150(+120) |
| 7 burrowStrike | 2·3 | 56 | 땅속45 / 솟기 예고34 | 76 | 220 | 기둥 근처 출현 검사 FAIL |
| 12 heartbeat | 3 | 90 / 60 / 60 | 박동 사이30 | 90 | 2400 | 안전 발치r260 + 기둥 그림자 |

fan(5)·chaseAoe(8)·summon(9)·tideWave(10)·seekerMines(11)는 Phase를 빈 배열로 했다. 실행기와 기존 타 보스 경로는 보존한다. 콤보는 C1 채찍→내려찍기(1·2·3), C2 돌진→채찍(1·2·3), C4 잠행→잡기(2·3), C7 줄기→돌진(2·3)만 남겼다. WalkStandOff100→220, 걷기1.1·가속20·정지12·회전3°/2°·조준고정12·빈시간45/36/30·콤보간12·기존 페이즈 확률은 그대로다. SlashHitAt6을 유지하므로 스윙 시작→피해 검사는 기존2→4틱이다. 사운드는 데이터를 읽어 채찍 1타36+4=40틱, 2·3타26+4=30틱, 내려찍기52+6=58틱으로 자동 갱신된다(청취 미검증).

## 데이터만으로 적용할 수 없는 명세

Core 유지 / DruidRemodelData만 수정 지시와 두 배율이 충돌한다. DruidBoss.Moves.cs의 채찍 판정은 R+pr+300, 돌진 판정은 R+pr+80으로 고정돼 있다. DruidTelegraph.cs의 SlashReach=300과 돌진 예고 폭도 같은 고정값을 쓴다. BossMove.RangeMax는 선택 점수용이므로 실제 사거리 대용으로 조작하지 않았다. 두 파일을 데이터 상수에 연결하는 최소 수정 허용 여부를 사용자에게 질문했고, 답변 전 변경하지 않는다. 데이터에 사용되지 않는 상수만 넣어 적용 완료로 보고하지 않는다.

## 다음 작업과 Mac 검수

1. 잠행 18실패 원인을 먼저 확정한다. 현재 로그: I:/EXODUSER-Storage/codex-takeover/boss-arena/harness-green.out.log. 기둥 판정 검사를 삭제하거나 느슨하게 하지 않는다.
2. 승인된 범위에서 채찍 사거리·돌진 폭의 판정과 예고를 같은 데이터에 연결한다. 하니스 PASS와 flag-off oracle 0불일치를 확인한 뒤 RB1-7 검수 후보로 올린다.
3. RB1-8a는 BossArenaLayout 기반 회색 지형·3~6m 외곽·3.2m 기둥4, 아레나 GroundY 분기·실패시2D 폴백, 34°/FOV46.9453/전방1.45/생존거리18.3·0.6초 전환부터 한다. 검수 전 8b·8c로 승격하지 않는다. 8d는 맵 총괄 담당이다.
4. Mac 실행 인자: <Player경로> --remodel3d --unity-mute --unity-qa-sandbox <격리프로필경로> -screen-width 1920 -screen-height 1080 -logFile <로그경로>. 같은 SHA에서 3840×1080도 검수한다. 현 SHA는 RB1-7 미통과이므로 인수·배포 후보가 아니다.

## MAP PRODUCTION REPORT

- STAGE: 1-1 보스 아레나 RB1-8, 미착수.
- MASTER: 기존 Core BossArenaLayout 동선·남쪽 진입·북쪽 출구 보존 예정; 별도 새 geometry 구현 없음.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 모두 실제 화면 미검증.
- LARGE/MEDIUM/GROUND: 소스 자산·composite·접합·그림자·오염·바닥 통합 모두 미착수.
- PLAYABLE: 기존2D 경로 유지. 새3D 전투 가독성 미검증.
- LANDMARK: 3D 기둥·제단 미착수.
- CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두 미검증.
- TECH QA: route/collision 원본 유지; pageerror/404/seam/loading/performance 새 실행 미검증. Roslyn 컴파일만 오류0.
- FILES: DruidRemodelData.cs, druid-remodel-test의 MotionChecks/Program/TelegraphChecks, 자기 docs만 변경. 동시 담당 소스 변경0.
- GIT: 자기 브랜치 경로 지정 커밋·비강제 push. main/unity/main 병합·배포0.
- VISUAL VERDICT: 미검증(화면 없음; PASS/RETOUCH/FAIL 판정 불가).
- NEXT PASS: 잠행 실패·Core 최소 연결 범위를 해결한 후 RB1-7→8a 순서 재개.
