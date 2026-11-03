# BC02 — 1장 일반 보스 생성 수치 packet

## 기준·의존·소유 확인

| 항목 | 확인 |
|---|---|
| 작업 / 브랜치 | `bc02` / `codex/bc02-20261020`, 기존 `~/exoduser-wt/bc02` 재개 |
| 기존 진행 | HEAD `e4396da5e7541562542ab65053d8ecac0bf16e52`(BC01), tracked INDEX/WORK 변경0·해당 신규 경로의 untracked0. 이전 `_out/bc02`의 preflight/oracle 자료 보존 |
| 최신 main | `284d7faf49295b2f5061937a47ce96038032ed3c`를 fetch·원격 대조. game.html 65,692행 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`는 이 worktree와 byte 동일 |
| 선행 의존 | BC01 `codex/bc01-20261020` / `e4396da5e7541562542ab65053d8ecac0bf16e52`. 최신 main에 미편입이므로 사용자 허용대로 이 끝점에서 분기된 기존 브랜치 유지. BC01 파일은 읽기만 함 |
| 작업판 충돌 | 최신 main WORK_BOARD 전체 읽음. BC01 행66은 catalog 신규 파일·테스트, TRACE-BOSS-CH1 행60은 추적 문서 소유. 이번 spawn_contract/BC02 테스트와 쓰기 경로가 겹치지 않음. BC03 이후 모듈 구현·보스 actor/factory/World 등록 없음 |
| 소유 / 공용 | 신규 `godot/scripts/native_ch1_boss_spawn_contract.gd`, `godot/tests/test_boss_ch1_bc02_spawn.gd`, 이 보고서, 허용된 CHANGELOG_SYNC 맨 위 절. 실제 생성된 자기 .uid만 포함. main/hud/world/player/피해 집행자/상태 owner·기존 테스트·project.godot·WORK_BOARD·추적/설계 문서 수정0 |
| 보호 | R HEAD/branch/INDEX/WORK·원본 HTML·Q/E·2_3·저장 형식 불변. 신규 파일 외 기존 파일의 수치·동작 변경 없음 |

## 구현 범위·원본 행

이 모듈은 actor를 생성하지 않고 81개 공통/보스 수치 필드와 난수·배치 read ledger를 반환한다. 일반 etype 조건부 타이머 전체·스킨·GPU 프리핀·전투 AI·부활 집행·현재 게임 진입은 이 단위의 결과물이 아니다. 요청한 BC02의 독립 packet 검수까지만 담당한다.

| 원본 game.html | 실제 계약 |
|---|---|
| 9272/9276 | DIFF_LV_OFF 11개·DIFF_MUL 11개. 범위 밖 정수 index는 source `\|\|`처럼 offset0/dm1, 음수 index를 Godot 배열 역인덱스로 읽지 않음 |
| 31033–31037 / 31131–31140 | ib 보스는 elite0/mods[]/aura null·tier0 배율1·speed/baseSpd.5·몸 r44. 일반몹 elite/속도/반경 난수 호출0 |
| 31119 / 31125–31126 | L=max(1,(P.lv\|\|1)+(DIFF_LV_OFF[OPT.diff]\|\|0)+(G._stageDiffOff\|\|0)); pacing=1/(1+min(9,max(0,L−1))/18). 현재 numeric snapshot의 zero/NaN falsy를 보존 |
| 31145–31152 | C=(L≤500 ? .4×L×L×L+199×L+100 : 50000000×1.0014^(L−500))×2.925. H0=floor(C×pacing×24×dm), H=floor(H0×(1+si×.02)). ATK=floor((75+L×2.9)×.6×dm). HP는 JS double 유지·Int32 변환 없음. 예: si1/Lv1/dm1은 H0=21017→H21437, floor를 합치면21438이므로 불일치 |
| 31120–31124 / 31210 | 좌표 nonfinite면 read/RNG0으로 거절. can_move→필요할 때만 safe_point, 검사 반경22. 옮겨진 좌표로 x/y와 _homeX/Y 기록. 별도 이동 재검사나 지터 없음 |
| 31162–31185 | poise/maxPoise/eShield/eShieldMax=최종 HP; projCd50·bossPatCd35·_combatSt engage·phase0; _revPts/max=200+round(si×5.882)=[200,206,212,218] |
| 31176 / 9820–9880 | _moveCDs는 BOSS_MOVES.length=59개의 0. sparse idx60이 있어도 61개로 수정하지 않음. BC01 receipt의 원본 등록 수를 읽음 |
| 31165/31168/31171/31260/31300 | 난수는 st2→facing→projT→bossPatT→_bossOrbitAng→_erraticAng 순서로 정확히6회. 단위 u는 [0,1). st2=30+u×50, projT=70+u×50, bossPatT=30+u×20, 세 각도=u×PI×2 |
| 16644–16648 / 17054–17055 | 현행 laststage0과 finale의 stage3 조건은 동시 충족 불가. 일반 생성 공식만 이식하며 미도달 finale를 새로 활성화하지 않음 |

| 공개 API / 입력 | 결과·오류 경계 |
|---|---|
| `source_receipt()` static | 최신 main/game 해시·BC01 의존·원본 행·RNG site의 독립 복사. 전역 상태 접근0 |
| `build_spawn_packet(request,rng,can_move,safe_point=Callable())` static | request는 si/int0..3·difficulty_index/int·room/int·x/y/player_level/stage_diff_offset/numeric snapshot. callable은 rng(field)→unit, can_move(x,y,r)→bool, safe_point(x,y,r)→{x,y}/null. 실제 provider의 소유권/제품 배선은 후속 단위 |
| READY | fields81·rng_ledger6·placement_reads·계산 중간값(첫 floor 포함). 매 호출 중첩값 독립 |
| REJECTED | 원본 null 생성에 대응하는 nonfinite 좌표·막힘+safe point null. fields{}·난수0 |
| NOT_READY | 누락/미지원 shape·si범위 밖·필요 reader/RNG 부재·잘못된 반환값. fields{}와 지금까지의 ledger만 반환, dummy/default actor나 전역 RNG로 진행하지 않음. 무한 레벨 입력은 지원 shape 밖이며 실제 무한 레벨의 source 실행 인수는 아님 |

## 검증 방식·재현

새 테스트의 이름은 사용자 지정 `EXODUSER-bc02-Isolated-20261020`다. ProjectSettings의 두 격리 값과 실제 OS user directory 마지막 이름을 모두 확인하고 불일치 시 exit2다. `_out/bc02/packet-project`에는 신규 모듈·신규 테스트와 BC01 의존 2파일만 동일 byte로 복사한다. Main/actor 생성0, 프로젝트/사용자 설정 덮어쓰기0. 다음은 이번 작업용 명령이며 각 실행 직전 별도 runner가 지정 pgrep 명령을 수행한다.

```sh
python3 ~/exoduser-wt/_out/bc02/run_one.py bc02-03   ~/exoduser-wt/_out/bc02/packet-project test_boss_ch1_bc02_spawn   --source-game=/Users/fordeargamers/exoduser-wt/bc02/game.html
```

원본 oracle는 최신 main과 같은 game.html의 실제 mkEn/상수/관련 helper 본문을 새 Node VM에서 실행한 56case×81필드다. 부작용 경계는 주입된 canMv/safePt/Math.random으로 기록하고 보스에서 호출되면 안 되는 elite roll은 throw한다. 테스트는 이 독립 결과를 공통 literal+case별 override로 보유하며 제품의 공식을 expected 생성에 사용하지 않는다. 현재 원본 HTML 해시도 실행 시 검사한다. Lv0/음수/소수/1/10/100/500/501, 난이도0..10/범위 밖, stage offset, 이동/막힘, 모든 중첩 반환의 독립성을 대조한다.

최초 `bc02-01`은 실패다. GDScript에서 literal `0.9999999999999999`가 1.0으로 해석되어 unit 검증이 `_bossOrbitAng`에서 거절됐고, 초기 테스트의 후속 접근에서 script ERROR도 발생했다. `diagnose-01`의 값 비교·직렬화 byte로 이 원인을 확인했다. 원본 임의 주입 수열은 정확히 표현 가능한 .875로 새 oracle를 만들었으며, 상한 경계 자체는 `1.0−1.0/9007199254740992.0`으로 별도 검증한다. 제품의 [0,1) gate나 source 상수/공식은 완화하지 않았다. 실패 원로그·초기 oracle는 보존하고 non-READY 후의 후속 접근도 차단했다. `bc02-02`는 JS 수열 문자열 교체 누락으로 기대 fixture에 옛 상한값이 남아 111실패였으며, 제품 오류로 위장하지 않는다. `source-oracle-v3.mjs/json`에서 수열을 명시 확인한 뒤 새 `bc02-03` 실행이 5,257단정/0실패/skip0/ERROR0으로 통과했다.

검증 실행 결과는 아래 마감 표에 실제 수치로 기록한다. parse/ERROR/RESULT 누락·skip·단정0은 PASS로 세지 않는다.


## 실제 실행 결과·로그

실행 버전은 `Godot Engine v4.7.2.stable.official.ed1daf0bf`다. runner는 **모든 Godot 실행 직전** `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 실행했고 2 이상일 때30초씩 대기했다. gate.jsonl에 각 count/시각을 기록했다. 다른 작업의 엔진·기존 창 종료0이며 병렬 회귀 실행도 하지 않았다.

| 검사 / 원로그 basename | 실제 결과 | exit | stderr/실행 ERROR | 엔진 실행 초 |
|---|---|---:|---|---:|
| 신규 최초 / `bc02-01` | 127단정/86실패, fixture 상한 literal·후속 SCRIPT ERROR5 | 1 | 5 | 0.19 |
| 신규 중간 / `bc02-02` | 5,257단정/111실패, fixture 수열 교체 누락 | 1 | 0 | 0.287 |
| 신규 최종 / `bc02-03` | 5,257단정/0실패/skip0 | 0 | 0 | 0.237 |
| BC01 기존 / `bc01-regression-01` | 681단정/0실패/skip0 | 0 | 0 | 0.185 |
| 격리 cold import / `import-01` | 정상 완료 | 0 | 0 | 12.125 |
| test_contracts / `contracts-01` | 5/5 case·failed_assertions0 | 0 | 0 | 2.104 |
| test_encounter_factory / `factory-01` | 3/3 case·failed_assertions0 | 0 | 0 | 3.149 |
| test_p3002_spawn_holes / `spawn-holes-01` | 298단정/0실패/skip0 | 0 | 0 | 8.377 |
| test_p3003_regions / `regions-01` | 43단정/0실패 | 0 | 0 | 7.508 |

초 단위는 엔진 실행 시간이며 대기 시간과 분리했다. 최초 실패 2건을 최종 통과로 덮어쓰지 않는다. `diagnose-01`은 literal 문제를 확인한 별도 진단이며 통과 단정에 합산0이다. 각 basename의 `.out/.err`는 stdout/stderr 원문, `.engine.log`는 엔진 로그, `.json`은 argv/cwd·gate·exit·ERROR·RESULT, `.gate.jsonl`은 대기 원기록이다.

원로그 전체 위치: `~/exoduser-wt/_out/bc02/`. 독립 원본 oracle 최종본은 `source-oracle-v3.mjs/json/out`, 보존본은 기존 `source_oracle.mjs/source-oracle.json` 및 `resume-source-oracle*`, `source-oracle-v2*`다. `build_test.py`는 최종 독립 oracle literal을 신규 테스트에만 전사하는 재현 도구다. `suite-summary.json`은 통과한 회귀 receipt 목록이다. 외부 로그/fixture는 Git 제품 파일에 추가하지 않았다.

기존 회귀의 격리는 BC01 상수 `EXODUSER-bc01-Isolated-20261020`, 소환굴 상수 `EXODUSER-P3002-Isolated-20261020`, 지역 상수 `EXODUSER-P3003-Isolated-20261020`를 그대로 썼다. 격리 상수가 없는 test_contracts/factory는 각각 `EXODUSER-bc02-Contracts-Isolated-20261020` / `EXODUSER-bc02-Factory-Isolated-20261020`의 자기 `_out` 프로젝트를 사용했다. wrapper의 project.godot만 원본과 custom_user_dir_name이 다르며 scripts/tests/assets/data/scenes/port_modules는 **이 bc02 worktree 경로만** 연결한다. cache도 자기 `_out`에 생성한 동일 import 결과다. 원본 project.godot·기존 테스트·override.cfg 수정0. 다른 worktree cache·node_modules 차용0이다.

cold import가 이 worktree에 자동 생성한 기존 제품/테스트의 미추적 UID136개는 이번 import 시각 이후 생성된 파일임을 확인하고 `_out/bc02/import-generated-uids/`로 옮겨 보존했다. 목록은 `import-generated-uids.json`이다. 이미 존재하던 파일은 이 정리에서 건드리지 않으며, 자기 신규 두 `.uid`만 제출한다. 기존 제품/테스트 본문·기존 tracked UID 변경0이다.

## 마감·보호 확인

| 확인 | 결과·경계 |
|---|---|
| 소유 6경로 | 신규 제품 .gd/.uid·신규 테스트 .gd/.uid·bc02_REPORT.md·허용된 CHANGELOG_SYNC 절만 명시 스테이징. test_* 광역 ignore 때문에 자기 신규 테스트 .gd/.uid 두 경로만 `git add -f --` 사용; ignore 규칙 변경·force push·훅 우회 없음 |
| 기존 파일 보존 | 원본 game/index·공용6파일·BC01 의존2파일·기존 회귀5파일·project.godot의 시작16개 SHA256을 재대조해 모두 동일. CHANGELOG 기존 본문은 byte 그대로 보존 |
| 전역·R | editor_settings-4.7.tres는 import/회귀 전 사본과 동일 byte. R의 HEAD/branch/INDEX/WORK 및 INDEX byte를 시작 snapshot과 대조. R 소스는 이식 기준으로 사용하지 않음 |
| 검증 범위 | 생성 수치·초기 필드·난수/배치 provider 순서의 격리 계약 검수. 관련 기존 회귀5종 실패0. 일반몹 피해를 보스 피해로 우회하는 코드·공용 연결은 없음 |
| 남은 것 | BC03 이후 phase/AI/공격·실제 보스 actor/World 등록·HUD·부활/실드 집행·승리/지역 진행·실플레이·시각/성능 인수는 이 결과에 포함하지 않음. PC 실행은 미확인 |
| 인계 | 자기 브랜치만 정상 commit/push·원격 SHA 대조 후 `_out/bc02/DONE.txt` 기록. WORK_BOARD는 공용0줄 지시대로 수정하지 않고 이 보고서와 DONE으로 총괄에 검수 인계 |
