# META-02 — 강화 견적 순수 규칙

## 판정·의존

**STATUS=REVIEW_PENDING.** 최신 origin/main의 `docs/engine/FDG_SOURCE_TRACE_META_20261020.md` §7 순서2를 구현했다. 강화 견적 계산만 추가했으며 RNG·악의오브 차감·장비 변경·UI·State·저장 연결은0이다. 이 단위에는 공용 수정이 필요하지 않다. 거래 실행/제품 State 연결은 META-07 이후 정확한 owner 배정 범위이며 이번 완료로 취급하지 않는다.

기존 `~/exoduser-wt/meta-02`, 브랜치 `codex/meta-02-20261020`을 발견해 이어서 작업했다. 재개 HEAD `c428ef209efed89df62bb34452b58ccdbba3634c`는 META-01 끝이다. 명시 fetch한 최신 origin/main은 `284d7faf49295b2f5061937a47ce96038032ed3c`이며 **META-01은 아직 main에 없다**. 사용자 지정대로 해당 parent를 유지하고 main 병합/체리픽 없이 META-01 의존을 기록한다. 새 강화 견적 API 자체가 XP API를 호출하는 의존은 없다.

재개 시 tracked INDEX/WORK는 깨끗했고, 미추적 정책·ignore된 새 테스트와 이전 검수 로그가 남아 있었다. 초안 두 파일을 `resume-20261020/before-*`로 보존한 뒤 최신 원본 근거 주석과 실행 설명만 갱신했다. 기존 임포트가 만든 다수의 타 파일 UID/import와 이전 한글 경로 미추적 문서는 수정·stage하지 않았다.

## 최신 원본·정확 계약

최신 main과 worktree의 game.html은 **SHA-256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4**,65,693행으로 동일하다. 기존 중단 로그의 8bcc2b6b 기준과 달리 이번 대조는 최신284d7faf를 고정했다. 원본/정책 수치 변경0. 추적 문서는 parent branch에 없는 파일이므로 origin/main의 해당 blob을 읽었으며 다른 담당 문서를 가져오거나 수정하지 않았다.

| API / 원본 행 | 정확 계산·순서 |
|---|---|
| enh_rate / 28077–28079 | `max(0.5,99×0.99^n)`은 **퍼센트**. 견적 rate는 이 값/100. 음수 입력의 source상100%초과값에 새 상한을 추가하지 않음 |
| malice_cost / 28080–28085 | 할인0.5. 유한 numeric subset에서 v<=0→0, v>0→max(1,ceil(v×0.5)) |
| enh_cost_raw / 28086–28088 | max(20000,ceil((20000+n×3500)×1.5)). +100=555000,+1000=5280000 |
| item_economy_rarity / 28185–28186 | `Number.isInteger(r)&&r>=0 ? min(r,4) : 0`. 문자열·bool·부재값·소수·NaN·Infinity를 숫자로 강제 변환하지 않음. 유니크5→경제등급4 |
| enh_cost / 28089–28092 | raw의ceil→등급배율0.5/0.7/1.0/1.3/1.8 곱 후ceil→할인0.5 곱 후ceil. `{rate:enh_rate/100,cost}` 반환 |
| enh_mul·enh_mul_atk / 28093–28100 | DEF/ATK 각각 n×0.25 flat. source 주석의 옛 복리 설명을 실행식으로 오인하지 않음 |
| xfer_cost / 28101–28104 | malice_cost(ceil(n×1000)); +100=50000,+1000=500000 |

+0 실제 비용은 등급0..5에서 **7500/10500/15000/19500/27000/27000**. +0.5 희귀16313,+0.0001 희귀15001처럼 중간ceil을 생략하지 않는다. 확률 하한은527/831/1000/9999에서0.5%=rate0.005이며526과526.5의 교차도 검증했다. UI9999를 강화max로 만들지 않고 +1000000 희귀비용2625015000으로 signed32 초과를 확인했다.

입력 계약: numeric API는 finite 숫자·유한 확률 계산·JS safe integer 범위 내 비용 연산을 전제로 한다. n의 음수/소수를 임의정수화/clamp하지 않는다. `_malCost`의 `Number(v)||0` 중 **문자열/null/bool/객체 변환 전체와 NaN/Infinity는 미지원**이며 기본0 지원으로 포장하지 않는다. rarity는 별도로 JS 정수 타입 판정을 보존한다. 검증은 n0..1000 전수 및-2/-1/분수/9999/1000000의1009샘플이며, 이 표본을 새 제품 상한으로 사용하지 않는다. 무제한 부동소수 전영역 동등성은 인증하지 않는다.

## 변경·소유권

- 신규 `godot/scripts/native_meta_enhancement_policy.gd` 및 자기 UID: RefCounted static 순수 API8개. 파일·저장·시간·RNG·State·입력·노드 접근 없음.
- 신규 `godot/tests/test_meta_enhancement_policy.gd`: 독립 golden 단정과 실제 출력 수집. Main 부팅·지갑/장비 fixture·가짜 provider 없음. 기존 테스트 수정0.
- docs는 이 보고서와 CHANGELOG_SYNC 맨 위 절만 추가. 관련 docs 전체 검색 `resume-20261020/docs-keyword-audit.log`; 기존 메타/경제/밸런스 표와 원본 수치가 일치하므로 타 담당 문서의 수치 변경0.
- 공용 main.gd·hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd **모두0줄**. 저장 형식·Q/E·docs2_3·factory·다른 담당 파일0줄. META-01의 State 미연결 한계도 그대로 유지한다.

## 실행·검증

기존 중단 전 로그를 덮어쓰지 않고 원로그 `~/exoduser-wt/_out/meta-02/resume-20261020/`에 새로 실행했다. 원앱 Godot4.7.2.stable.official.ed1daf0bf, 새 테스트 격리명 `EXODUSER-meta-02-Isolated-20261020`, 기존 회귀는 각 USERDIR 상수다. 상수 없는 contracts는 작업 격리명을 썼다. 실행마다 override.cfg를 기록하고 finally에서0byte로 비웠다. 매 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인·2이상30초 대기를 적용했으며 `godot-count.log`를 보존했다. 재개 시 유효 캐시가 있어 새 import/엔진 version 프로세스는 실행하지 않았다.

```text
python3 ~/exoduser-wt/_out/meta-02/resume-20261020/run.py
node ~/exoduser-wt/_out/meta-02/resume-20261020/compare-source.mjs
Godot --headless --path ~/exoduser-wt/meta-02/godot --log-file <외부로그> --script res://tests/<파일>.gd
```

| 실행 label | 검사/case / 실패 | exit / ERROR / WARNING | 실제 격리 이름 |
|---|---|---|---|
| meta02-resumed | 70 / 0 | 0 / 0 / 0 | EXODUSER-meta-02-Isolated-20261020 |
| regression-contracts | 5 / 0 | 0 / 0 / 0 | EXODUSER-meta-02-Isolated-20261020 |
| regression-kill-rewards | 45 / 0 | 0 / 0 / 2 | EXODUSER-P2001C-Isolated-20261020 |
| regression-meta01 | 20 / 0 | 0 / 0 / 0 | EXODUSER-meta-01-Isolated-20261020 |

META-01 테스트는 순수 곡선20단정이며 State999→1000 이식 완료를 뜻하지 않는다. p2001c는 사용자 지정 parent c428ef20의 기존 테스트를 그대로 실행했다. 최신 main과는 QA-002 seed/관측4줄 차이가 있으나 다른 담당 테스트를 가져오거나 수정하지 않았다. 실제 runtime Main을 부팅하는 p2001c의 Camera2D 경고는 원문을 보존한다.

독립 JS 대조는 **1009 numeric 샘플×17 scalar + rarity17샘플×3 + malice10 = 17,214대조 / 불일치0**. 최신 main에서 enhRate부터xferCost 및 `_itemEconomyRarity` 실제 함수 본문을 추출·평가해 Godot 실제 출력과 비교했으며 두 번째 GDScript 공식으로 기대값을 생성하지 않았다. 비용·등급은 정확 정수 비교, 확률/flat은 `abs<=1e-10×max(1,abs(expected))`로 비교했다. `source-comparison.json`, `compare-source.mjs`, `source-comparison.out.log`에 보존한다.

## 제출·한계

자기 `codex/meta-02-20261020`만 정상 훅 commit/push하고 원격 ref를 대조한다. main push·force·git add -A·훅 우회0. R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`의 branch/HEAD·tracked INDEX/WORK는 보존하며, 최종 SHA·수치·보호 파일 비교·override0은 `~/exoduser-wt/_out/meta-02/DONE.txt`에 기록한다.

실제 강화 성공판정 RNG/차감/장착/이전 거래·예산 반복·UI·저장·자연 플레이는 미연결/미검수다. 이 단위에 필요한 공용 수정은 없으므로 BLOCKED가 아니며, 후속 State 소비 연결 권한을 본 순수 정책 완료에서 추론하지 않는다.
