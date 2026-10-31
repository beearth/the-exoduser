# META-03 — 레거시 분해 가치 순수 규칙

## 판정·의존

**STATUS=REVIEW_PENDING.** origin/main `FDG_SOURCE_TRACE_META_20261020.md` §7의 META-03을 구현했다. 레거시 강화 환급·분해 가치 계산만 추가했다. 장비 삭제·악의오브 입금·State/UI/저장 연결은0이며 이 단위에는 공용 수정이 필요하지 않다. 이후 거래/writer 연결 권한으로 확대하지 않는다.

명시 fetch 후 최신 main=`284d7faf49295b2f5061937a47ce96038032ed3c`, META-02 끝=`8171e715ca274207b4d83d9be639436d39c755b1`을 확인했다. META-02가 main에 없으므로 사용자 지시대로 후자에서 새 `codex/meta-03-20261020` / `~/exoduser-wt/meta-03`을 생성했다. META-01 `c428ef20`도 parent 계보에 포함된다. main 병합·체리픽·다른 담당 파일 인수는 없다.

첫 전체 checkout은 `No space left on device`로 실패했고 Git이 불완전한 worktree를 정리했다. 다른 파일 삭제 없이 남아 있는 자기 브랜치로 `--no-checkout` worktree를 만들고, worktree-local sparse-checkout과 새 index 초기화(`git read-tree -mu HEAD`)로 Godot·docs·원본·정상 훅에 필요한 경로만 채웠다. 초기화 후 tracked INDEX/WORK0을 확인했다. `checkout-recovery.json`에 이 도구 관측과 실제 구성을 기록했다. sparse 범위 밖 tracked 파일을 삭제한 커밋은 없으며 R도 변경하지 않았다.

## 원본·구현 계약

최신 main과 작업 game.html SHA-256은 **4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4**로 동일하다. 원본 수치 변경0. 새 파일 `godot/scripts/native_meta_salvage_policy.gd`는 RefCounted static API2개다.

| API / 원본 행 | 정확 계약 |
|---|---|
| `legacy_enh_refund(enh,rarity)` / 28189–28197 | e>0일 때 i=0부터 i<e까지 `ceil(max(1,ceil((1+i×0.15)×1.5))×등급배율)` 순서로 누적한 뒤 **JS signed32 `~~(total×0.5)`**. e<=0이면0. 중간float 연산·ceil 순서와 양수 소수 e의 마지막 반복을 보존 |
| META-02 재사용 / 28186 | `_itemEconomyRarity`: 비음수 정수만 min(r,4), 그 외0. 등급배율0.5/0.7/1/1.3/1.8, 유니크5→경제4. 기존 정책과 상수는 읽기 전용 preload |
| `salvage_value(item)` / 28187–28201 | 기본표[1000,2000,10000,20000,50000] + 레거시 환급 + tier×2. **_enhRefund>0일 때만** 계산 환급과 max. 더하지 않으며 양수가 아닌 저장값은 무시. 원본에 없는 최종0clamp·정수화 없음 |
| 장착 이전 기록 / 16302–16318 | 원본 inline 누적식이 동일 `old._enhRefund=~~(_tc×0.5)`를 기록하고 old.enh=0으로 만든다. 새 helper를 이 거래에 연결하지 않았으며 원본 기록식은 독립 JS oracle로 대조 |
| signed32 helper | 기존 `combat_stat_formula/producer.gd:228–237`의 `js_to_int32`를 읽기 전용 재사용. int64/floor로 대체하거나 환급 음수를 감추지 않음 |

희귀 등급2의 enh1/10/100 환급은 **1/15/656**, tier0 분해 가치는10001/10015/10656이다. 현행 +0 희귀 강화 지출15000의50%=7500과 같은 계산이 아니다. 유니크 +100은 단계별ceil 때문에 기본50000+환급1202=**51202**이며 단순 배율 근사51200이 아니다. 강화 이전·레거시 회계 차이(PM-013-D)는 원본 동작으로 보존하며 밸런스 정정하지 않는다.

signed32 예: 등급4/enh200000의 환급 **−244589796**, 최종분해 **−244539796**. 같은 아이템에 양수 `_enhRefund=0.5`가 있으면 max 후50000.5, 음수 기록−1이면 원 음수 결과가 남는다. 등급0/enh300000 최종−1763538171, 등급4/enh300000 최종523181658도 검증한다. 저장 환급3000000000은 나중 max 단계 값이므로 signed32로 다시 감싸지 않는다. tier0.25는+0.5로 남는다.

입력 계약은 Dictionary 및 누락되었거나 유한 numeric인 enh/tier/_enhRefund다. 누락은 source undefined/falsy 경계의0이고, 실제 양/음수·소수는 보존한다. 해당 키의 문자열/null/bool/객체 JS 강제변환·NaN/Infinity는 미지원이다. rarity만 META-02의 타입 판정을 재사용한다. legacy 누적은 JS safe-integer 정밀도 내 유한 연산을 전제로 하며 검증 범위를 새 강화max로 쓰지 않는다. e0..200 및527/831/1000/9999, 별도200000/300000 경계를 검증했으며 무제한 입력 정밀도·실행시간은 인증하지 않는다. 반복을 닫힌 근사식으로 바꾸거나 cap/예산을 추가하지 않았다.

## 테스트·원로그

원로그 `~/exoduser-wt/_out/meta-03/`, 지정 원앱 Godot4.7.2.stable.official.ed1daf0bf. 새 테스트는 `EXODUSER-meta-03-Isolated-20261020`, 기존 검사는 각 파일 USERDIR 상수, 상수 없는 contracts는 작업 격리명을 쓴다. 매 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인하고2이상이면30초 재확인했다(`godot-count.log`). override.cfg는 매번 설정하고 finally에서0byte로 비웠다. import는 새 worktree 캐시 생성용1회·exit0·ERROR0이다.

```text
python3 ~/exoduser-wt/_out/meta-03/run.py
# 첫 실패 보존 후, 같은 run.run()으로 label=meta03-corrected 전체 검사 재실행
node ~/exoduser-wt/_out/meta-03/compare-source.cjs meta03-corrected
```

| label | 검사/case / 실패 | exit / ERROR / WARNING | 격리 이름 |
|---|---|---|---|
| meta03-corrected | 68 / 0 | 0 / 0 / 0 | EXODUSER-meta-03-Isolated-20261020 |
| regression-meta02 | 70 / 0 | 0 / 0 / 0 | EXODUSER-meta-02-Isolated-20261020 |
| regression-meta01 | 20 / 0 | 0 / 0 / 0 | EXODUSER-meta-01-Isolated-20261020 |
| regression-contracts | 5 / 0 | 0 / 0 / 0 | EXODUSER-meta-03-Isolated-20261020 |
| regression-kill-rewards | 40 / 0 | 0 / 0 / 1 | EXODUSER-P2001C-Isolated-20261020 |

신규68검사는 등급별 기본값·29개 독립 source golden·각 입력Dictionary 미변경·레거시 누적1/15/656·signed32음수wrap·현재강화지출50%와 구분을 확인한다. META-02/01 회귀는 기존 파일 수정 없이 전부 실행했고, contracts·p2001c도 parent8171e715의 원본 그대로다. 최신 main QA-002 p2001c seed4줄을 임의 가져오지 않았다. Main을 만드는 p2001c의 Camera2D physics interpolation 경고는 원로그를 보존하며 ERROR0과 구분한다.

### 최초 실패·정정

`meta03.out.log`는 **68검사/1실패·exit1**이다. 새 테스트의 유니크5/enh100 기대값을51200으로 잘못 적었다. 최신 원본 실제 함수를 Node로 실행한 값과 제품 출력은 모두51202였고, 독립 비교2489건도 이미 불일치0이었다. 제품 코드를 바꾸지 않고 그 golden1개만 **51200→51202**로 정정한 뒤 전체68검사를 `meta03-corrected.*`에서 다시 실행했다. 검사 수·조건·임계값 삭제/완화0, 첫 실패와 첫 비교 로그도 보존한다.

### 실제 JS 본문 대조

`compare-source.cjs`는 최신 main의 `salvageVal` 본문과 `_itemEconomyRarity`, 장착 이전의 실제 inline 환급 루프를 추출해 평가한다. Godot가 출력한29golden 분해값 +1230표본의 분해값/별도환급값 각1개 = **2489 exact 숫자 대조 / 불일치0**. GDScript 공식을 두 번째로 작성해 기대값을 만들지 않았다. transfer 평가의 old 객체는 새 JS 메모리 사본으로 원본 게임·장비/지갑에 쓰지 않는다. `meta03-corrected-source-comparison.json` 및 `.out.log/.err.log`, 소스 스크립트에 보존한다.

## 소유·제출

신규 정책/자기 UID·신규 테스트/자기 UID·본 보고서·CHANGELOG_SYNC 맨 위 절만 커밋한다. 관련 docs 전체 검색은 `docs-keyword-audit.log`에 보존했다. 기존 메타·경제·밸런스 문서의 원본 수치는 같으므로 타 담당 문서 변경0. 공용 main.gd·hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd, META-02 정책, 기존 테스트, game.html, 저장 형식·Q/E·docs2_3·다른 담당 파일은0줄이다.

R=`/Users/fordeargamers/Projects/exoduser-migration-20261001` 불변. 자기 `codex/meta-03-20261020`만 정상 훅 commit/push하고 원격SHA를 대조한다. main push·force·git add -A·훅 우회0. 최종 SHA·보호 해시·수치·override0은 원로그 `DONE.txt`에 기록한다. 순수 계산 검증을 실제 분해·입금·저장·UI·자연 플레이 완료로 확대하지 않는다.
