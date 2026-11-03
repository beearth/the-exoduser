# META-04 — SP/AP 투자·환불 순수 계산

## 판정·의존

**STATUS=REVIEW_PENDING.** 최신 origin/main `FDG_SOURCE_TRACE_META_20261020.md` §7의 META-04를 구현했다. 투자·환불·할당 계획의 메모리 계산만 제공하며 실제 State·raw-grit holder·큐·재계산·UI·저장 writer 연결은0이다. 이 단위에는 공용 파일 수정이 필요하지 않다. 다음 소비 연결 권한을 추론하지 않는다.

명시 fetch 후 main=`284d7faf49295b2f5061937a47ce96038032ed3c`, META-03 끝=`5b672e7cd09c6070364cde99181e0d473054635a`를 확인했다. META-03은 main에 없어 사용자 지정대로 후자를 parent로 `codex/meta-04-20261020` / `~/exoduser-wt/meta-04`를 생성했다. META-02/01도 parent 계보에 포함된다. 이전 checkout의 디스크 부족을 반복하지 않도록 처음부터 worktree-local sparse-checkout으로 Godot·docs·game.html·stat-panel-ui.js·AGENTS·정상 훅 경로만 채웠다. 새 index 초기화 후 tracked INDEX/WORK0을 확인했고 R/다른 파일 정리·삭제는 하지 않았다.

## 최신 원본·API

행 근거는 모두 착수 최신 main284d7faf다. worktree의 game.html·stat-panel-ui.js는 해당 ref와 바이트가 같으며 소스 SHA-256은 `meta04-final-source-comparison.json`에 기록했다. 원본·기존 확정 수치 변경0. 신규 `godot/scripts/native_meta_point_policy.gd`는 아래8개 static 순수 API를 제공한다.

| API | 원본 위치 | 보존 계산·거부 |
|---|---|---|
| rank_cost | stat-panel-ui.js:4–5 | 구매 전 rank0..9 비용[1,1,1,2,2,2,3,3,3,5], 그 외 numeric index는5. 10rank 합23 AP |
| stat_change | stat-panel-ui.js:6–9 | amount 정수·0아님·결과value0..max·결과points>=0일 때만 `{value,points}`. 초과 bulk 일부구매0. 감소는 SP 환불. direct API에 원본에 없는 safe-count 사전검사 추가0 |
| passive_change | stat-panel-ui.js:10–15 | amount 정확±1만. 구매는 현재rank 비용, 감소는 도착rank 비용 환급. next0..max·새잔액>=0. rank10 이상 legacy 비용은5, 소수 current rank는 source index fallback대로 처리 |
| refund_totals | stat-panel-ui.js:16–23 | SP=모든 STATS 값의 합+직접grit. 레거시 VIT도 포함. AP는 max(0,ceil(rank))개를10단계까지 누적하고 초과분당5. 반환 상한10으로 임의clamp하지 않음 |
| grit_cost·grit_batch_cost | game.html:27894–27896 | 단가1 SP, batch max(0,n). 무한근성의 실제 거래는 stat_change의 max=Infinity로 검증. 레벨/장비 gritTotal 계산이나 구 저장 보정은 미포함 |
| create_plan | stat-panel-ui.js:256–259 | base.stats/passives/grit snapshot과 별도 변경 사본. base에SP/AP wallet snapshot을 추가하지 않음 |
| evaluate_plan | stat-panel-ui.js:260–274 | 기준할당 stale·키 불일치·목표/현재SP/AP safe nonnegative integer·상한·최종잔액을 원순서로 검사. before/after 환불총액으로 live.sp+before.sp−after.sp 등 **좌→우 Number 연산** 후 최종 safe잔액 검사. 거부null, 정상은 새할당/잔액·changes·spentSP/AP |

직접 UI 스탯은 game.html27690–27694의 STR/DEX/INT/LCK4종 각500이며 STATS/STAT_MAX27696–27697에는 legacy VIT도 있다. 새 정책은 caller caps/defs를 그대로 받고 VIT UI를 만들지 않는다. oracle에서5키 caps500 및 PASSIVE_DEF26종/max10이 최신 game 정의와 일치하는지도 확인했다. 패시브 효과·Q/E·자원 소비 수치는 계산하거나 변경하지 않는다.

원본 계획의 중요한 경계:

- base가 현재 **할당**과 같으면 SP/AP 잔액만 바뀐 계획은 stale로 거부하지 않고 최신잔액으로 다시 계산한다. 할당이 바뀐 같은 plan 재적용은 거부한다. 별도 transactionID·사용기록 저장소 없음.
- 목표상한은 `max(caps[key],live.stats[key])`, 패시브는 `max(def.max 또는0,live.passives[key])`. 과거600stat/15rank의 유지·감소를 허용하며 증가만 거부. unknown legacy passive도 현재값 이하로 내릴 수 있다. direct stat_change의 고정max 검사와 이 plan 경계를 임의 통일하지 않음.
- refundTotals는 레거시 초과·소수 rank를 ceil/초과5로 계산한다. evaluate_plan은 목표와 최종 잔액을 safe integer로 검사하므로 소수 legacy 환급이 최종잔액을 소수로 만들면 거부한다. 현재alloc에 새 사전safe검사를 넣지 않음.
- `changes`는 바뀐 **키 수+grit 변경1**이다. 무변경 계획도 changes0인 결과를 반환하며 writer의 `!next.changes` 거부(game.html51242–51243)를 정책 안으로 옮기지 않음. 환불 때 spentSP/AP는 음수로 남는다.

입력 지원: 구조를 갖춘 plain Dictionary plan/live/caps/defs 및 numeric allocation 값. 직접 함수의 finite numeric 값, 근성 max=+Infinity, amount의 JS 정수/정확±1 타입 거부를 지원한다. rank_cost의 numeric index 범위 외5를 보존하되 문자열 index의 Array-property lookup은 이식하지 않았다. refundTotals의 Number(string/null/object) 강제변환·잘못된 plan 구조의 JS exception 전체·prototype 상속키 의미는 미지원이며 임의 기본0 정상값으로 주장하지 않는다. safe integer 상한은 원본 plan 검사9007199254740991이며 새 게임 레벨/근성 상한이 아니다.

## raw_grit_restore 재사용 가능 경계·보호

기존 `godot/port_modules/save_adapter/raw_grit_restore.gd`는 자기 실제 raw holder와 좁은 writer다. 이번에는 읽기만 했다. 해당 `apply_plan`은 evaluator Callable에서 `{ready:true,next:<승인 결과>}` 형태를 받고 원본 queue/stats/passives prefix가 준비된 뒤 자기 grit/SP/AP를 쓴다. 신규 evaluate_plan은 순수 next/null 계산이므로 추후 정확한 owner 승인 아래 adapter가 될 수 있지만 이번에 Callable 배선·holder 초기화·writer 실행을 하지 않았다.

`refund_all`도 refund authority와 allocation clear callback 및 tail owner가 필요하다. `restore`의 gritCostModeV2/legacySpent=3g+(g−1)g/2 보정은 **저장 복구 보호**이며 이번1SP 환불과 합치거나 재호출하지 않는다. game.html51204–51215의 확인 대기 뒤 live 환불 재계산,51235–51274의 실제 할당/큐/재계산/UI/save는 이후 담당 연결 범위다. 제품 연결이 이번 순수 계산 단위의 필수 작업은 아니므로 BLOCKED가 아니다.

## 검증·원로그

지정 원앱 Godot4.7.2.stable.official.ed1daf0bf. 새 격리명 `EXODUSER-meta-04-Isolated-20261020`, 기존 회귀는 각 파일 USERDIR 상수(contracts는 상수가 없어 작업 격리명). 매 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인·2이상30초 대기. override.cfg 매회설정·finally0byte. 새 worktree import1회, stdout/stderr/exit/명령 JSON은 `~/exoduser-wt/_out/meta-04/`의 label별로 보존했다.

```text
python3 ~/exoduser-wt/_out/meta-04/run.py # 초기 실패·선행 회귀 보존
python3 ~/exoduser-wt/_out/meta-04/run-final.py # 최종 소스 신규검사+회귀5종
node ~/exoduser-wt/_out/meta-04/compare-source.cjs goldens
node ~/exoduser-wt/_out/meta-04/compare-source.cjs meta04-final
```

| label | 검사/case / 실패 | exit / ERROR / WARNING | 실제 격리 이름 |
|---|---|---|---|
| meta04-final | 1076 / 0 | 0 / 0 / 0 | EXODUSER-meta-04-Isolated-20261020 |
| regression-final-meta03 | 68 / 0 | 0 / 0 / 0 | EXODUSER-meta-03-Isolated-20261020 |
| regression-final-meta02 | 70 / 0 | 0 / 0 / 0 | EXODUSER-meta-02-Isolated-20261020 |
| regression-final-meta01 | 20 / 0 | 0 / 0 / 0 | EXODUSER-meta-01-Isolated-20261020 |
| regression-final-contracts | 5 / 0 | 0 / 0 / 0 | EXODUSER-meta-04-Isolated-20261020 |
| regression-final-kill-rewards | 40 / 0 | 0 / 0 / 1 | EXODUSER-P2001C-Isolated-20261020 |

새 테스트 **1076단정/0실패**는38개 독립 source golden, 각 호출 입력 불변, create/result 사본 독립, full SP/AP·VIT/근성 환불, stale·키·상한·잔액·safe integer·no-op 경계를 검증한다. broad census의 실제 출력까지 포함한 **969개 API 결과**를 Node에서 최신 원본 stat-panel-ui.js를 VM에 그대로 로드해 exact 숫자/구조 대조했고 불일치0이었다. 근성2함수만 game.html의 실제 함수 본문을 별도 추출했다. Godot 공식을 다시 작성해 oracle로 사용하지 않았다. 결과 `meta04-final-source-comparison.json`·`.out.log/.err.log`, script `compare-source.cjs`를 보존한다.

최초 Node golden 하니스는 `_gritBatchCost` 줄끝 주석에 뒤의 return을 붙여 return이 주석 처리되는 TypeError가 있었다. 원본/기대값/제품 수정 없이 반환 앞 newline만 추가해38golden 전부 일치(v2/v3)로 정정했다. 첫 실패 `goldens-source-check.err.log`와 수정 후 로그를 구분하고 이를 Godot 제품 실패/성공 수치에 섞지 않는다. Godot 신규 결과와 독립 원본 대조를 모두 확인한 후에만 완료 판정했다.

최초 Godot `meta04` 실행은 새 테스트의 `POLICY.callv()`가 static class에서 허용되지 않아 **SCRIPT Parse Error**, 결과행/단정 실행0이었다. 엔진 exit0이었지만 stderr2건을 근거로 실패로 판정하고 PASS에 포함하지 않았다. 테스트 probe를8개 명시적 static 호출로 바꾼 뒤 `meta04-corrected.*`에서 전체 새 테스트를 재실행했다. 제품 정책·38golden 기대값·단정 조건 삭제/완화0. 이후 아래 safe integer 상수 결함을 수정했으므로 최종 소스로 신규 검사와 기존5회귀를 모두 재실행했다.


### 최대 safe integer 실제 결함·수정

`meta04-corrected`는 MAX_SAFE_INTEGER 경계에서 예상 결과가 null이 되어 테스트 접근이 중단됐다. 직접 탐침 `safe-boundary-probe.out.log`에서 정수입력9007199254740991의 float 변환은 정확했으나 정책의 **부동소수 리터럴9007199254740991.0이9007199254740990으로 읽혔고** int_valid/float_valid가 모두false였다. 신규 정책의 상수를 정확한 정수 리터럴9007199254740991로 바꿔 원본 Number.isSafeInteger 상한을 복구했다. 테스트도 null을 명시 검사한 뒤 sp를 읽도록 고쳐 중단 대신 정상 실패 보고가 가능하게 했다. 기대값·safe 상한·원본 판정은 낮추지 않았다.

중단된 자기 프로세스만 SIGTERM으로 정리해 `meta04-corrected.json` exit−15·SCRIPT ERROR1·결과행0으로 보존했고 override는finally0byte였다. 진단 probe는 정책 읽기만 하며 단정/완료 PASS로 집계하지 않는다. 정정 후 `meta04-final` 전체 신규 검사와 `regression-final-*`5종을 실행해 실제 성공 수치를 확인했다. 최종 oracle에는 MAX safe 허용·MAX+1 및 최종 환급 잔액 초과/소수 거부도 포함된다.

기존 테스트는 parent5b672e7c 파일 그대로다. 최신 main QA-002 p2001c seed4줄을 임의 반입하지 않았다. p2001c의 Camera2D/종료 경고 원문은 해당 stderr에 보존하며 ERROR0과 구분한다. 선행 META-03의 golden 정정 이력은 그 보고서의 과거 기록으로 유지한다.

## 소유·제출

신규 정책/자기UID·새 테스트/자기UID·본 보고서·CHANGELOG_SYNC 맨 위 절만 커밋한다. docs 관련 검색은 `docs-keyword-audit.log`, 기존 수치 표는 동일해 타 담당 문서 수정0. 공용 main.gd·hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd, raw_grit_restore, 기존 META 정책/테스트, game/stat-panel 원본·저장 형식·Q/E·보호docs2_3 모두0줄이다.

R=`/Users/fordeargamers/Projects/exoduser-migration-20261001` 불변. 자기 `codex/meta-04-20261020`만 정상 훅 commit/push·원격SHA 대조하며 main push·force·git add -A·훅 우회0. 최종SHA·수치·보호해시·override0은 `_out/meta-04/DONE.txt`에 기록한다. 메모리 계산 검증을 실제 투자 UI·State 적용·장비/자원 효과·세이브·자연플레이 완료로 확대하지 않는다.

## 마감 소스 재확인

구현·검수 커밋 `8931d4af` 이후 main 갱신을 관측해 명시 fetch했다. 마감 main `e556b617190c325ca39f5add04357f5dea5ca87e`의 game.html·stat-panel-ui.js·메타 추적 문서는 착수284d7faf와 모두 **동일 바이트**다(`main-refresh-check.json`). 따라서 기존969개 원본 대조의 행·값은 마감 최신 main에도 그대로 유효하다. 작업 브랜치에 main을 병합하거나 제품/테스트를 변경하지 않았다.
