# BC03 — 1장 보스 utility score 순수 함수

## 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업 / 브랜치 | `bc03` / `codex/bc03-20261020` / `~/exoduser-wt/bc03` 신규 |
| 시작 main | fetch·원격 확인 `284d7faf49295b2f5061937a47ce96038032ed3c`. game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`·65,692행. 작업 worktree와 byte 동일 |
| 마감 main 재확인 | `e556b617190c325ca39f5add04357f5dea5ca87e`. 284d7faf 이후 맵 문서 변경뿐이며 game.html byte/행·Godot 코드·작업판 보스 소유가 동일. source_receipt의284d7faf는 실제 검증 기준을 유지하고 최신 main과의 동일성은 verification에 별도 기록 |
| BC02 의존 | `codex/bc02-20261020` / `3d510c2b400f26342dcf5e9899a38034fd1e7c0a`. main 미편입이므로 사용자 지시대로 이 끝에서 분기. BC01 catalog와 BC02 spawn 파일·기존 테스트는 읽기만 함 |
| 시작 작업판 | 최신 main WORK_BOARD 전체 읽음. TRACE-BOSS-CH1 행60은 추적 문서, BC01 행66은 catalog. 신규 utility/test와 쓰기 경로 겹침 없음. 다른 진행 행의 enemy_factory·공용 UI·normal AI 파일 수정0 |
| 자기 소유 | 신규 `godot/scripts/native_ch1_boss_utility.gd`·`godot/tests/test_boss_ch1_bc03_utility.gd`·실제 생성된 자기 .uid·이 보고서·사용자 허용 CHANGELOG_SYNC 맨 위 절 |
| 공용·보호 | main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state, 기존 테스트·project.godot·WORK_BOARD·추적/설계 docs·원본 HTML·Q/E·2_3·저장 형식 수정0. R HEAD/branch/INDEX/WORK 불변 |

전체 worktree 최초 checkout은 과거 `output/` 영상 복사 중 공간 부족으로 exit128이었다. Git이 실패 worktree를 자동 제거했고 경로가 없음을 확인했다. 만들어진 브랜치의 BC02 기준 SHA를 유지해 `--no-checkout`과 cone sparse-checkout으로 다시 만들었다. 처음 빈 index는 `git read-tree -mu HEAD`로 같은 HEAD에 초기화하고 INDEX/WORK 차이0을 확인한 뒤 작업했다. 포함 경로는 godot/docs 및 훅 실행에 필요한 .githooks/tools, 최상위 원본 파일이다. 약1.2GB이며 R/타 worktree/기존 자료 정리0이다. sparse 설정은 Git 관리정보이며 제품 커밋에 들어가지 않는다. 훅 파일을 제외한 채 커밋하지 않았다. 최초 오류와 복구 기록은 `_out/bc03/checkout-environment.txt`에 보존한다.

## 이식한 원본 공식·경계

| game.html 행 | 정확 계약 |
|---|---|
| 37650–37654 | cageTrap→-1, phase 불허→-1, 최신 최종 Set 불허→-1, 명시 idx의 CD>0→0 순서. 이 gate까지 난수0. gate에서 아직 읽지 않는 range/ps/RNG 부재를 먼저 요구하지 않음 |
| 37655–37657 | mid=(min+max)/2, span=max(1,(max−min)/2), D=exp(−((d−mid)/span)²). 음수 거리도 임의 clamp 없음; 함수 지원 입력은 유한 숫자 |
| 37658–37668 | repeat=1부터 같은 id의 모든 history 등장을 곱함. 마지막 기준 age0=.15/1=.28/2=.45/더 오래된 것=.70, oldest→newest 순서. history 길이를5로 잘라내지 않음 |
| 37669–37677 | ps가 존재할 때 parryRate>.4&canFeint +.5; dashRate>.5&aoe +.3; healRate>.3&gap-close +.4; kiteRate>.3&gap-close +.5/cc +.4; aggroRate>.5&punish +.5/aoe +.3. 비교는 엄격한 >이며 rate 생성/갱신0 |
| 37679–37685 | retreat&gap-close +.6, approach&ranged +.4, engage&(melee 또는 aoe) +.3. d<130의 slashCombo/slam/sweep +.8, d<80의 slashCombo +.6; teleStrike의100<d<1200 +.7도 식에 유지하되 최종 CH1 Set에서는 거절 |
| 37686–37692 | comboSeq의 현재 index가 id면 combo=2.4. phase≥3의 aoe +.3/multi-hit +.2, phase≤1의 utility +.2. history []는 JS에서 truthy라 novelty .35, missing/null history는0. negative/fractional combo index를 Godot 역인덱스로 사용하지 않음 |
| 37693 | S=(D+repeat×.6+counter×.7+combo×1.2+phasePref×.5+novelty)×(.85+u×.3). gate 통과 시 이 위치에서 정확히 RNG1회 |
| 37694–37699 | si2 얼굴집합 jump/charge/slashCombo/sweep/tailSwipe/beanStorm은 난수 적용 후 +2. si0/3에서 meleeStreak≥3이고 ranged 또는 ambush이면 마지막에 ×3.0. 주석의1.0을 실행값으로 쓰지 않음 |
| 9960–9967 / BC01 | 최종 Set 삽입 순서를 BC01 boss_for_stage에서 읽음. 최초 si0 선언·teleStrike를 복원하지 않으며 cageTrap 제거 유지. 기술 수치·무브셋·BC01 상수 변경0 |

`BOSS_02_FOREST_NORMAL_HELL_ABERRANT.md`의 얼굴6종/+2와 원본이 일치한다. `BOSS_BATTLE_SETTINGS.md`의 gate/기존 상태를 읽었으며 세부 점수 원문은 최신 game.html을 기준으로 삼았다. 관련 docs 전체 검색은 `_out/bc03/docs-keyword-scan.txt`에 보존했다. 새 포팅 범위/상태는 이 보고서와 CHANGELOG에만 기록해 다른 소유 문서를 수정하지 않는다.

| API | 결과·소유 경계 |
|---|---|
| `source_receipt()` static | 최신 원본 해시·행·BC02 의존·얼굴 목록의 독립 복사. live_selection_connected=false |
| `evaluate_move(si,move,distance,ps,phase,enemy,rng)` static | 원본 _bossScore처럼 caller가 주는 move metadata/ps/enemy snapshot을 읽음. 정상 caller의 metadata는 BC01이 소유. 원본은 직접 변형하지 않고 등록/선택/타이머/시계·노드·파일/저장 IO도 없음 |
| READY | score·rng_ledger. 원본 gate이면 -1/0과 gate 원인·ledger[]; 산술 완료이면 term별 진단값과 ledger1. score는 선택 완료나 공격 성공을 뜻하지 않음 |
| NOT_READY | 미소유 si(0..3밖)·미지원 입력 shape·필요 RNG 부재/잘못된 unit이면 score=null. provider나 현재 상태를 중립값으로 위장하지 않음. missing ps/null·missing rate·missing history 등 원본이 읽는 부재는 별도 지원 |
| RNG | caller의 rng("boss_score")→u∈[0,1). gate 후 한 번만 요청. 전역 rand/RNG singleton 사용0. ps는 Dictionary/null, 현재 CD/history/combo shape는 Array/null·numeric index; 문자열 숫자 등 JS의 다른 coercion 전체를 지원한다고 주장하지 않음 |

BC04의 상위6 추첨/콤보 선택·history/streak writer·명시 idx CD 감소·_bossStartPattern은 구현하지 않았다. 원본 입력 snapshot의 상태 소유권과 실제 Q/E 카운터·피해 판정은 각 기존 owner에 둔다.

## 독립 검증·재현

새 테스트는 사용자 지정 `EXODUSER-bc03-Isolated-20261020`을 ProjectSettings 두 값과 실제 OS 경로에서 확인하며 불일치면 exit2다. 자기 `_out/bc03/utility-project`에서 신규 모듈/테스트와 BC01·BC02 의존을 동일 byte 복사해 실행했다. Main·actor 생성0. 테스트의 file read는 공급된 원본 HTML 해시 확인뿐이며 제품 모듈에는 IO가 없다.

원본 BOSS_MOVES59·최종 CH1 Set·_bossScore 본문·얼굴 Set을 최신 main과 같은 HTML에서 뽑아 새 Node VM에서 그대로 실행했다. oracle 6,577개 중 gate/RNG0=961, 산술/RNG1=5,616이며 절대 오차1e-12로 비교한다. 입력 metadata/ps/enemy의 전후 불변, 난수 count/site/unit, 누락 provider, 엄격한 rate·거리 경계, history 부재/[], 모든 반복 등장, 음수 combo index, 얼굴 가산 순서, streak×3, 반환 복사와 엔진/입력/locale 무변경을 단정한다. 실제 BC02 생성 fields를 받아 engage/aoe 점수2.16도 독립 기대값으로 확인한다.

oracle의60번째 move는 등록 기술이 아니라 원본 순수 함수의 미도달 cc 및 span=max(1) 가지를 검증하기 위한 독립 math fixture다. 원본 burst의 복사본에서 테스트 인자 tags/range/canFeint만 바꿔 원본 함수와 대조했다. 제품 catalog/원본 무브·수치·등록 변경0이며 이 표본을 게임에서 도달 가능한 행동으로 보고하지 않는다.

```sh
cd ~/exoduser-wt/bc03
node ~/exoduser-wt/_out/bc03/source_oracle.mjs
python3 ~/exoduser-wt/_out/bc03/run_one.py bc03-01 ~/exoduser-wt/_out/bc03/utility-project test_boss_ch1_bc03_utility --source-game=/Users/fordeargamers/exoduser-wt/bc03/game.html
```

원본 추출/기대값은 `source-extract.js`, `source_oracle.mjs`, `source-oracle.json`, 테스트 전사 도구는 `build_test.py`다. 제품 API를 실행해 expected를 만들지 않았다. 이미 존재하는 run basename은 로그 보호를 위해 재사용하지 않으므로 재검수는 새 basename을 쓴다. 모든 Godot 실행 직전 지정 pgrep 명령을 실행하고 count≥2이면30초씩 대기하며 `*.gate.jsonl`에 보존한다. 다른 엔진/창 종료0이다.


## 실제 실행 결과·마감

버전은 `Godot Engine v4.7.2.stable.official.ed1daf0bf`다. 아래 초 단위는 엔진 실행 시간이며 pgrep 대기와 구분한다. 모든 최종 실행에서 exit0·ERROR0·RESULT 존재를 확인했고 SKIP/단정0을 성공으로 세지 않았다.

| 검사 / 원로그 basename | 실제 결과 | exit | ERROR | 실행 초 |
|---|---|---:|---:|---:|
| 신규 최초 / `bc03-01` | 31,976단정/0실패/skip0 | 0 | 0 | 0.358 |
| BC01 기존 / `bc01-regression-01` | 681단정/0실패/skip0 | 0 | 0 | 0.185 |
| BC02 기존 / `bc02-regression-01` | 5,257단정/0실패/skip0 | 0 | 0 | 0.255 |
| 자기 cold import / `import-01` | 정상 완료 | 0 | 0 | 12.407 |
| test_contracts / `contracts-01` | 5/5 case·failed_assertions0 | 0 | 0 | 2.169 |

기존 회귀의 격리는 각 파일 상수 `EXODUSER-bc01-Isolated-20261020`, `EXODUSER-bc02-Isolated-20261020`을 그대로 썼다. 격리 상수가 없는 test_contracts는 `EXODUSER-bc03-Contracts-Isolated-20261020`의 자기 `_out` wrapper를 사용했다. wrapper project.godot은 custom_user_dir_name만 다르고 나머지 값은 원본 그대로이며, 경로는 이 bc03 worktree의 scripts/tests/assets/data/scenes/port_modules에만 연결한다. 실제 프로젝트·기존 테스트·override.cfg 변경0, 다른 worktree cache·node_modules 차용0이다. 새 모듈이 제품 Main에 연결되지 않아 전체 보스 AI/전투 회귀를 통과했다고 확대하지 않는다.

각 basename `.out/.err`는 stdout/stderr 원문, `.engine.log`는 엔진 로그, `.json`은 정확한 argv/cwd·gate·exit·ERROR·RESULT, `.gate.jsonl`은 매30초 대기 count/시각이다. `_out/bc03/suite-summary.json`과 `verification.json`에 회귀·보존 검수 receipt를 남긴다.

cold import가 생성한 기존 코드/테스트의 미추적 UID 136개는 이번 import 이후 생성된 자기 파일임을 확인해 `_out/bc03/import-generated-uids/`로 옮겨 보존했다. 목록은 `import-generated-uids.json`이며 사전 존재 UID는 건드리지 않았다. 자기 신규 두 .uid만 제출한다.

| 마감 확인 | 결과·한계 |
|---|---|
| 소유 | 신규 제품 .gd/.uid·신규 테스트 .gd/.uid·보고서·허용 CHANGELOG 총6경로만 명시 stage. test_* 광역 ignore로 자기 신규 테스트 .gd/.uid 두 경로만 `git add -f --` 사용; ignore 규칙·타 담당 파일 변경0 |
| 원본·공용 보존 | 원본 HTML2·공용6·BC01/BC02 의존·기존 테스트·project.godot·AGENTS·관련 설계 등 시작17파일 SHA256 동일. 실행한 복사본과 실제 제품/테스트 byte 동일. CHANGELOG 기존 본문 보존 |
| R·전역 | R HEAD/branch/INDEX/WORK·index byte를 시작 snapshot과 대조. Godot 전역 editor_settings-4.7.tres는 사전 사본과 동일. 원본 수치·Q/E·2_3·세이브 형식 수정0 |
| 훅·Git | sparse에 실제 .githooks/tools 포함·정상 pre-commit/docs-sync-check 사용. no-verify/우회 환경 변수·main push·force·git add -A 없음. 자기 브랜치만 push 후 원격 SHA 대조 |
| 인계 | WORK_BOARD는 공용0줄 지시대로 읽기만 하고 이 보고서와 `_out/bc03/DONE.txt`로 검수 요청. 브랜치·최종 SHA는 DONE/verification receipt에 기록 |
| 남은 범위 | BC04 선택기/상위6 추첨·실제 actor/AI/공격·HUD·실플레이·시각/성능·PC 실행은 미인수. 이번 판정은 utility 함수와 관련 격리 계약 검수까지 |
