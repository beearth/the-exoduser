# P3-003 PC 중복 작업 마감 보고 — 구현 제출 아님

## 1. 담당·보존·원본 근거

- PC 지정 브랜치: `codex/p3-003-pc-20261020`, 시작 HEAD `2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353`.
- 최초 작업 위치 `G:/exoduser-wt/codex-p3-003`에서 시작 시 tracked INDEX/WORK는 비어 있었다. 승인 fetch 후 origin/main 관측 SHA는 `af9a59f444409305201ccc20fe4878d4cdd678aa`.
- 최초 공동판의 Mac ENGINE 배정과 사용자 PC 직접 배정이 충돌하여 비동기 확인을 요청했고, 별도 PC 브랜치에서 작업했다.
- 실행 중 약 18:05 KST에 지정 worktree의 `.git`, `game.html`, `docs`, 작성한 지역 구현·테스트가 없어졌다. 삭제 실행 주체·명령은 확인하지 못했다. 최종 단위 회귀는 스크립트 파일 부재로 실행되지 못했다.
- 사용자 재개 지시 후 현재 `G:/exoduser-wt/p3-003-integrate/docs/engine/orders/WORK_BOARD.md`를 읽기 전용 확인: **P3-003은 Mac ENGINE 단독, PC 중복 작업은 중단·FEATURE-INVENTORY 전환**으로 명시되어 있다. 다른 담당 지역 구현은 수정하거나 덮어쓰지 않았다. 해당 통합 worktree의 `native_normal_enemy_hurte.gd` WIP도 건드리지 않았다.
- 기존 PC 브랜치 ref는 남아 있으므로 **소스 복구가 아닌 문서 마감용** 새 worktree `G:/exoduser-wt/codex-p3-003-report-20261020`를 만들었다. 원래 남은 디렉터리·untracked 자원은 이동/삭제하지 않았다. 본 폴더 소스·브랜치·사용자 서버는 무변경이며, worktree 등록을 위한 Git 관리 메타데이터만 정상 갱신했다.

| 원본 game.html 행 | 조사·부분 구현했던 대상 |
|---|---|
| 60688–60732 | 지역명, 4분면, 180타일 조건, 소환굴 기반 지역 분모, 원 스폰 위치 처치 귀속, 80% 조건, 가드 지역 한정 +0.10 |
| 60742–60795 | 진입/정화 배너, 15프레임 tick, 1.5타일 히스테리시스, 300프레임 쿨다운 |
| 60118–60123, 60201–60214 | 바닥 한정 십자선, 필드보스 4점, 자물쇠 |
| 60321–60336 | 현재 지역 처치/분모 및 정화 지역 수 / 4 진행바 |
| 60934–60966 | 클리어 바닥 색 #1e3c1e, 합성 alpha .45, 벡터 자물쇠 |
| 60976–60977, 14338 | 사이트 좌표 SW(58,158)/SE(148,150)/NW(52,42)/NE(148,42), 속성 [2,1,3,4], ELC색 |
| 333–339, 60241 | 별도 #areaTitle 3.1초 구역 제목: PC 작업에서는 미이식 |

설계 1차 참조: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`. 관련 docs 전체에서 `_regions`, `_regCur`, `_regKill`, `지역 시스템`을 검색해 기존 HUD/미니맵·맵 SSOT·처치 추적 문서와 대조했다. 웹 원본은 수정하지 않았다.

## 2. 변경 파일·소유권

### 이번 제출에 실제 포함하는 파일

| 파일 | 변경 |
|---|---|
| docs/engine/orders/reports/P3-003_REPORT.md | 본 PC 중복 작업 마감 보고. **Mac 동명 보고서를 대체하지 않는 PC 브랜치 전용 이력** |
| docs/engine/orders/WORK_BOARD.md | PC 중단·로그 보존 메모만 append. 기존 Mac 담당 행/소유권은 변경하지 않음 |

현재 제출은 문서 전용이다. 게임 코드 0줄, 공용 main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 변경 0줄. Mac 구현·테스트·보고서와 이 PC 보고서를 혼합하거나 이 PC 브랜치를 제품 코드로 병합하지 말 것.

### 소실 전 작성분 — 이번 Git 제출에 포함되지 않음

| 파일 | 작성했던 내용 | 마지막 확인 |
|---|---|---|
| godot/scripts/native_regions.gd | 지역 규칙·명시적 provider 초기화 seam·Main 바인딩·텍스트 배너·미니맵 바닥 마스크/사이트/lock | 파일 소실 |
| godot/scripts/main.gd | HUD state bind 뒤 node 생성/world child/bind **+3줄** | 최종 diff 전 소실 |
| godot/scripts/hud.gd | 지역 분모/정화 진행바/미니맵 view 호출 **+13/-1줄** | 최종 diff 전 소실 |
| godot/tests/test_p3003_regions.gd | source-shaped fixture 지역 규칙 28단언 | 최종 재검사 직전 소실 |
| godot/tests/test_p3003_regions_main.gd | 실제 Main·실 state 바인딩·정직 정지 8단언 | 통과 후 소실 |
| godot/tests/test_p3003_regions_hud.gd | 격리 Main에 명시적 fixture를 넣은 HUD/배너/바닥 mask 13단언 | 통과 후 소실 |

위 코드가 현재 디스크·Git에 보존되었다고 주장하지 않는다. 새로 체크아웃한 과거 HEAD는 그 소실된 구현의 복구가 아니다. Mac ENGINE 구현은 별도 작성물이다.

## 3. 테스트 명령·수치·원로그

공통 실행 헬퍼:

```text
C:/Progra~1/Git/bin/bash.exe C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p3-003/godot G:/exoduser-wt/_out/P3-003-pc/<phase> <spec>
```

모든 아래 로그의 루트는 `G:/exoduser-wt/_out/P3-003-pc/`. 실제 Godot 출력은 `4.7.2.stable.official.ed1daf0bf`. Main 테스트는 아래 격리 이름을 지정했고 실제 저장 폴더를 쓰지 않았다. 헬퍼는 종료 후 override.cfg를 비웠다.

| phase / spec | 결과 | stdout/stderr 파일 |
|---|---|---|
| red / test_p3003_regions | 예상 RED: 구현 없음, 1단언/1실패, exit1 | red/test_p3003_regions.{out,err}.log |
| green / test_p3003_regions | 당시 규칙 28단언/0실패, exit0 | green/test_p3003_regions.{out,err}.log |
| red-main / test_p3003_regions_main:EXODUSER-P3-003-PC-Isolated-20261020 | 예상 RED: 서비스 미연결, 4단언/1실패, exit1 | red-main/test_p3003_regions_main.{out,err}.log |
| green-main / 동일 spec | 당시 Main 8단언/0실패, exit0 | green-main/test_p3003_regions_main.{out,err}.log |
| view / test_p3003_regions_hud:EXODUSER-P3-003-PC-Isolated-20261020 | 표시 fixture 13단언/0실패, exit0; fixture_only=true, gpu_visual_qa=false | view/test_p3003_regions_hud.{out,err}.log |
| view / test_p2002b_minimap_corner:EXODUSER-P2002B-Isolated-20261020 | 기존 회귀 16단언/0실패, exit0 | view/test_p2002b_minimap_corner.{out,err}.log |
| view / test_p3003_regions | **실행 불가**, exit1; File not found 관련 ERROR 3개 | view/test_p3003_regions.{out,err}.log |

성공했던 서로 다른 시점의 관측은 28+8+13+16단언이다. **최종 소스 전체 65 PASS라는 뜻이 아니며 현재 소실된 구현을 검증할 수 없다.** 마지막 실패는 제품 단언 실패가 아니라 스크립트 소실에 따른 실행 실패다. Main 로그에는 기존 Camera2D physics interpolation WARNING이 있으며 ERROR는 없었다. 사용자 재개 후 이 통과 검사들을 반복하지 않았다.

PowerShell 승인 호출의 WindowsApps CreateProcess 장애는 동일 승인 범위의 CMD 호출로 전환했다. 서버 실행·재시작은 하지 않았다.

## 4. 커밋·원격 인계

- 소실 전 **코드 커밋·push 없음**. 소실 원인을 확인하지 못한 상태에서 브랜치 재생성·다른 담당 코드 이식으로 보완하지 않았다.
- 본 보고서는 기존 `codex/p3-003-pc-20261020`의 문서 전용 마감 커밋으로 제출한다. 정상 경로 지정 stage/commit 후 `git push origin HEAD`만 수행한다. main 병합/push·강제 push 없음.
- 보고서에 자기 자신의 최종 SHA를 넣을 수 없으므로, 첫 문서 체크포인트 SHA를 후속 마감 단락에 기록하고 최종 원격 ref SHA는 실행 결과와 `G:/exoduser-wt/_out/P3-003-pc/PC_REPORT_DELIVERY.md`에 별도로 남긴다.
- 이 브랜치는 제품 구현 인수 대상이 아니다. P3-003 제품 인수는 최신 공동판의 Mac ENGINE 제출을 PC Claude 총괄이 검수한다.

## 5. 남은 것·완료 주장 제한

- PC 중복 지역 구현은 재개하지 않는다. FEATURE-INVENTORY는 공동판에서 별도 담당 행으로 전환되어 있음을 확인했으며, 이 보고서 마감에 섞지 않았다.
- 소실 전 PC 구현은 실제 소환굴 확정 후 초기화 provider, 실제 8개 사망 경로의 _regKill, 필드보스 전투·게이트 월드 처리, 방향 화살표, 별도 #areaTitle가 미연결/미이식이었다. 배너 CSS blur/flare/장식·픽셀 동일성도 인수하지 않았다.
- G.spawnHoles·G._totalSpawned·스포너는 읽기만 했다. 당시 실제 G의 mw/mh=0 및 provider 미연결 때문에 가짜 지역 분모를 넣거나 자동으로 지역 진행을 승인하지 않았다. fixture 분모 10/20은 테스트 입력이지 실제 스폰 공식이 아니다.
- 원본 에셋 신규 생성/복사 없음. 레슨·입력·Q/E·저장 형식·보호 docs·localhost:3333 무변경.
- 코드 소실로 코드/docs 동기화·Git 복구 체크포인트는 완수하지 못했다. 이번 문서 커밋은 그 미완료를 보존하는 마감이며, 코드 전달·플레이 인수·시각 PASS를 의미하지 않는다.

## 6. PC 문서 마감 체크포인트

- 첫 문서 커밋: `cf3229452097d9c3044adf8fee2400f6843d10d3` (보고서·공동판 2경로, 제품 코드 0줄).
- 정상 commit hook의 guard.js 검사를 통과했다. 이 검사는 현재 과거 HEAD의 웹 구문/가드 검사이며 소실된 PC Godot 구현이나 Mac 제출의 런타임 검증이 아니다.
- 이 SHA 기록만 후속 문서 커밋으로 남긴 뒤 같은 PC 브랜치를 원격 제출한다. 최종 SHA·원격 ref 일치 여부는 별도 delivery 기록과 최종 응답에서 확인한다.
