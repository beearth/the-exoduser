# P3-003 작업 보고서 — 검수 대기(부분 연결)

## 1. 기준/범위

- 담당: Mac Codex ENGINE, 브랜치 `codex/p3-003-20261020`.
- 새 worktree: `/Users/fordeargamers/exoduser-wt/P3-003`, 기준 main `efdbf76b34dec0e75a8d9256717921ea6e270174`.
- 공동판 최소 A/B 등록 `af9a59f444409305201ccc20fe4878d4cdd678aa` 및 ROOT 함수명/생성순서 정정 지시를 적용. Main/HUD 외 공용 파일은 무수정.
- 원본·수치·API·환경 상세: [P3-003 현행 문서](../../FDG_P3_003_REGIONS_20261020.md). 옛 corpse WIP/후보를 복사하지 않았다.

## 2. 변경 파일

| 경로 | 변경 |
|---|---|
| godot/scripts/native_regions.gd | 기존 G의4지역 owner·init/kill/tick/gate·미니맵 mask/사이트/lock·지역/구역 제목 |
| godot/tests/test_p3003_regions.gd | 새 source-core fixture/표시mask/실Main A/B 검수, 그룹별 선택 실행 |
| godot/scripts/main.gd | HUD state bind 직후 새 owner 생성/configure만 |
| godot/scripts/hud.gd | base minimap 뒤 지역draw, 현재지역kill·cleared/4 진행 표시와 진단문자열1행만 |
| docs/engine/FDG_P2_002B_MINIMAP_CORNER_20261020.md | 당시 이력 보존·날짜 있는 P3 현행 포인터만 |
| docs/engine/FDG_P3_003_REGIONS_20261020.md | 현행 원본행/수치/구현/미연결/원실패 기록 |
| docs/CHANGELOG_SYNC.md | hook 필수 P3 날짜 append만 |
| docs/engine/orders/reports/P3-003_REPORT.md | 본 보고 |

## 3. 결과/로그

검수는 원 Godot4.7.2, 고유 userdir, `_out/P3-003`만 산출했다. 맵guide를 전문 읽고 기술·시각 인수를 구분했다.

| 범위 | 결과 | 원로그 |
|---|---|---|
| 최초 parse | exit0/stderr0 | check-01.out/.err |
| core fixture | 27검사/0실패 exit0/stderr0 | core-01.out/.err |
| import1회 | asset import [DONE] 후 전역 editor 설정 저장 ERROR→TERM−15 | import-01.result.json/.stdout/.stderr/.channels.log/.godot.log |
| 실제 Main A/B 최초 | PID742,9검사/0실패 exit0/ERROR0/Camera경고1 | actual-01.result.json/.stdout/.stderr/.channels.log/.godot.log |
| 표시 fixture 최초 | 7중6통과/1실패 exit1(storedRGBA8 alpha 반올림 기대 오류) | display-01.out/.err |
| 위 단일 경계 교정 | 제품값.45 유지·native alpha114,1검사/0실패 | quantization-02.out/.err |
| Main 위치 정정 영향 | PID1015,9검사/0실패 exit0/ERROR0/Camera경고1 | actual-order-02.* |

명령:
```text
Godot --headless --path <WT>/godot --script res://tests/test_p3003_regions.gd -- --only-core
Godot --headless --path <WT>/godot --script res://tests/test_p3003_regions.gd -- --only-actual
Godot --headless --path <WT>/godot --script res://tests/test_p3003_regions.gd -- --only-display
Godot --headless --path <WT>/godot --script res://tests/test_p3003_regions.gd -- --only-quantization
```
실Main 명령은 기록된 sandbox/profile/supervise.py로 실행. 통과27/표시6은 재실행하지 않았다. import 오류를 clean 성공으로 바꾸거나 여러 실행을 합산하여 전체 PASS로 표시하지 않는다.

## 4. 반드시 남는 연결

- **C 처치 hook 미연결**: MAC 지시의 공용 피해 집행자 무수정 규칙을 지켰다. PC 총괄이 `_kill_pipeline`42702 stageKills write 뒤 다음 의미를 삽입해야 한다:
```gdscript
var regions: Node = _main.get_node_or_null("NativeRegions")
if is_instance_valid(regions):
    var result: Dictionary = regions.record_actor_kill(_enemy)
    # 거부 시 원 이미 적용된 HP/death/kills prefix 보존, 실패를 보고한다.
```
이 요청은 source `_regKill` 위치이며 현재 제품에 연결했다고 주장하지 않는다.
- **실 분모 확정 미연결**: 현재 actual G.spawnHoles=[]로 원 init 결과 total0이다. 전체 소환굴0의 증거가 아니며 P3-002가 확정된 실제 list를 게시한 뒤 `initialize_stage()`를 연결해야 한다. 임의 분모·초기 적 수를 대입하지 않았다.
- 필드보스 전투/생성, 실제 gate좌표·월드포탈 처리, 정화/게이트 SFX·펫, 방향화살표, Cinzel/CSS blur 등1x 스타일은 미연결/미인수로 남는다.
- actual9는 살아있는 Main의 초기 지역·미니맵·same-ref만 검수했다. 자연 처치→지역증가→정화/게이트 진행·GPU 실창 픽셀·PC·Mac 실플레이 PASS가 아니다.

## 5. Git/보존

- 자기 branch 경로 지정 stage만. 코드 main 병합은 PC Claude 총괄 소유.
- HEAD/INDEX/WORK12 ABSENT·A/B6 백업, saved PRE, tested/failed source·raw logs는 `/Users/fordeargamers/exoduser-wt/_out/P3-003/` 보존.
- Godot 생성 UID/import 파일·override·캐시·raw 산출물은 제품 커밋에 넣지 않는다. 관련 사용자 save/app_userdata·타인 WIP·R 제품 변경0.
- 커밋 SHA·push 결과는 마감 단락에 기록. 이 보고서 자체 SHA는 최종 Git HEAD에서 확인한다.

## MAP PRODUCTION REPORT

STAGE: 기존 CH1-1 지역 시스템 어댑터. 지도 제작/geometry 변경 없음.
MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 기존 맵 보존; 배치·자산·충돌·경로 변경0.
CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 실창 미실행, 미인수.
TECH QA: source 판정·초기 Main 배선 일부 인수; 실제 처치/분모/사이트 전투 연결 미완. import 전역설정 저장 실패 보존.
FILES: 위 소유8경로, 타인파일0.
GIT: 자기branch checkpoint/push만; main merge/deploy0.
**VISUAL VERDICT: RETOUCH** — 렌더/웹1x·실창 검수가 없어 시각 PASS를 부여하지 않음.
NEXT PASS: PC 총괄 C 훅/P3-002 분모 연결 → 실제 지역 진행·게이트·실창1x 검수.

## 마감 체크포인트

- 구현·관련docs 커밋: `84f15d0e69096fb268f189a2747a9f35cc8a507f`(정상 docs-sync-check 통과).
- 첫 commit은 CHANGELOG_SYNC 필수 progress log 누락으로 거부됐고, 등록·백업/PRE 후 해당append를 포함해 정상 커밋했다. ALLOW_MISSING_DOCS/--no-verify 사용0.
- 본 보고서는 implementation SHA를 기재한 report-only 후속 커밋으로 제출한다. 최종 report SHA·원격 push 결과는 `_out/P3-003/delivery.json`과 총괄 인계에서 분리 확인한다. main 병합0.
- 작업 상태: **검수 대기 — C 처치 hook·P3-002 분모·실창 인수 미완**.

원격 전달 시도: 최초 `git push -u origin codex/p3-003-20261020`은 exit128, `fatal: could not read Username for https://github.com: terminal prompts disabled`로 중단됐다. 기존 정상 credential이 없어 총괄의 공식 connector 지원을 요청하며, 인증·전역설정 변경/토큰 조회/반복 push/강제 push는 하지 않았다. 원문은 `_out/P3-003/push-01.stderr`에 보존한다. 원격 반영 완료로 주장하지 않는다.
