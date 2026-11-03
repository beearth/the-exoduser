# CH1-01 — si0 읽기 전용 원본 snapshot·검증 모듈

작업ID `ch1-01`, 2026-10-20. **DONE: si0 source contract 격리 검수 완료.** 환경·전투·에리어 전환·시각 인수 완료를 뜻하지 않는다. 기존 맵 교체나 공용 파일 변경은 필요하지 않았다.

| 기준 | 실제 상태 |
|---|---|
| 브랜치 / worktree | `codex/ch1-01-20261020` / `/Users/fordeargamers/exoduser-wt/ch1-01` |
| 재부팅 복구 | 기존 HEAD `b887183126eccd05e06fd793b9b8cb7d889cecd6`, tracked INDEX/WORK 깨끗함. 미커밋 신규 tool/data/producer/Node·Godot 테스트 보존 후 재개. 기존 무관 untracked 문서 보존 |
| 최신 main | fetch 후 `284d7faf49295b2f5061937a47ce96038032ed3c`으로 fast-forward. 원본 game.html 변경 없음 |
| 원본 SHA256 | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 지시서 | main에 해당 문서 부재. `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.1 적용. 원문 사본은 L/trace-order-reference.md |
| 원로그 L | `/Users/fordeargamers/exoduser-wt/_out/ch1-01/` |
| R 보호 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch·tracked INDEX/WORK 시작/종료 동일. R 작업 파일 쓰기0. fetch의 공유 원격 ref 갱신과 구분 |
| 선행 | AGENTS.md, 공통 맵 제작 가이드 전체, SSOT index·si0 production 계약 및 지시서 읽음. 스킬이 가리킨 `EXODUSER_16_TEAM_OPERATING_MEMORY_20261008.md`는 현재 checkout에 부재 |

## 산출물과 API

| 파일 | 구현 범위 |
|---|---|
| `godot/tools/export_ch1_area_source.mjs` | 명시 sourceRoot/output, stage0/uint32 seed만 지원. acorn AST expression/function 및 원문 block을 발췌해 독립 VM에서 원 selector·generator·start 배치·지역 초기화를 실행. 원함수 값/분기 문자열 치환 없음 |
| `godot/data/ch1_map_source/si0.json` | schema `exoduser.ch1-area-source.v1`. main SHA·원본/외부 JS SHA·symbol별 행/끝/해시·seed/RNG 소비·원본 raw 카탈로그·결과 타일/소환굴 기록 |
| `godot/port_modules/ch1_map_source/producer.gd` | `extends RefCounted`, 순수 `read_area`, `validate_area`, `compare_stage0_map`. 파일/리소스 load·노드·시계·RNG·저장 쓰기 없음 |
| `test/fdgCh1AreaSource.test.mjs` | 원본 AST/실제 생성 결과·기존 map과 독립 대조, 결정성·원본 byte 보존·미지원 stage/잘못된 출력 거부 |
| `godot/tests/test_p3004a_ch1_area_source.gd` | snapshot 순서/값·실제 격리 설정·동일 참조·반복/입력 불변·손상 입력·실제 map 비교. Main 부팅0 |
| 새 UID 2개 | 위 producer/test의 Godot 생성 UID만 포함 |

READY는 `scope=source_snapshot_only`와 원 snapshot의 동일 참조를 반환한다. NOT_READY는 reason과 원 raw 참조를 보존하고 최상위 value를 주지 않는다. stage/필수 타입·길이·타일 해시·출처·RNG 기록·환경 참조 해시 교차검사를 수행한다. 출처 SHA 형식과 선언된 pin 검증이며, producer가 디스크 원본을 다시 인증하는 것은 아니다. Node 테스트가 실제 원본 파일·AST SHA를 대조한다.

명시 undefined는 null carrier와 별도 JSON pointer mask로 기록하여 absent/명시 null과 구분한다. 이번 승인 원본은 `undefined_paths=[]`이며 producer는 미지원 carrier를 정직하게 거부한다. 초기 metadata77/deco110은 별개 raw 자료다. 실효 metadata merge와 initMapObjects는 실행하지 않는다.

CLI는 원본 내부 출력으로 새 si0.json만 허용한다. 외부 출력도 `.json`만 허용하고 symlink 및 기존 비snapshot 파일 덮어쓰기를 거부한다. stage1~3은 출력 쓰기 전에 실패한다.

## 최신 main 원본 값과 대조

| 항목 | 원본 근거 | snapshot / 검증값 |
|---|---|---|
| grid / 타일 | game.html:16631,30218–30694 | 200×200/T40, 40000개. 0/1/2/3/4 개수 `19958/19755/3/3/281` |
| tile byte SHA256 | 원문 selector→genFromTemplate 결과 | `655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa`, 기존 map.json tiles 전체 동일 |
| rooms / START | maps_data.js:10–22, game.html:31564–31566 | 6 / tile `[100,185]`, world `[4020,7420]` |
| 북문 / 출구 | game.html:30021–30031,30335–30442 | x99/100/101, gate y5 / exit y7; exit center `[100,7]` |
| raw 배치 / 카탈로그 | game.html:18133–18169,18392–18426,17520–17637 | hand36 / 초기 meta77 / CH1 deco110 |
| pit_poison | game.html:18407,18168 | sz200·collision true·colW80·colH58·colOy7; raw tile162/139 |
| 소환굴 / 분모 | game.html:30486–30626,31029–31030 | 순서 보존14개 / 총168; region `[23,60,53,32]` |
| 지역 | game.html:60697–60718 | 독립 VM의 원 `_regionInit(0)` 실행값. Godot 지역 owner 재구현/설치 없음 |
| timer | game.html:30486–30626 | seed20261020·LCG14회·final3323445034. 600≤timer<660은 발췌 관측이며 자연 부트 RNG 실측 아님 |
| 환경 출처 | HTML script 62–71, baked root11615–11616 | script10개의 file/line/SHA 및 baked_manifest 원문 symbol 출처. PNG 재생성/교체0 |

`compare_stage0_map`은 tiles, raw hand ID/저작 좌표, deco file만 비교한다. 기존 map.json과 나무 파일명 4개 차이를 그대로 반환했다.

| ID | 기존 map | 최신 원본 raw deco |
|---|---|---|
| m_ctree17 | rotforest_tree_03.png | rotforest_tree_05.png |
| m_ctree18 | rotforest_tree_04.png | rotforest_tree_11.png |
| m_ctree19 | rotforest_tree_02.png | rotforest_tree_06.png |
| m_ctree20 | rotforest_tree_01.png | rotforest_tree_07.png |

최종 MAP_OBJS·실효 좌표·collider·runtime·visual은 NOT_OBSERVED다. `full_map_equal=false`, `matches_observed_fields=false`를 유지한다. 이 차이는 후속 CH1-02 소유 범위이며 본 단위에서 기존 map/자산을 고칠 이유가 아니다. CH1-01 BLOCKED 항목 없음.

## 실제 실행과 회귀

지정 Godot `4.7.2.stable.official.ed1daf0bf`만 사용했다. `run_resume.py`가 각 실행 전에 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 확인했다. 최초2개라 30초 대기했고 이후 실행 전에는 각1개였다. 자기 Godot는 순차 실행하고 타 실행은 건드리지 않았다. 실행별 override를 설정한 뒤 finally에서 0byte로 비웠다. contracts/encounter는 파일에 강제 격리 상수가 없어 새 작업 격리명을 사용했다.

| 실행 / 원로그 prefix | 실제 결과 | exit / 시간 | 격리 |
|---|---|---|---|
| resume-export-deps | si0 재추출 성공 | 0 / result.json 참조 | Node; NODE_PATH 아래 참조 |
| resume-node-new-final | 9통과/0실패/0SKIP | 0 / 약2.3초 | 임시 폴더도 새 작업 격리명 |
| resume-godot-new | 62단정/0실패 | 0 / 0.410초 | EXODUSER-ch1-01-Isolated-20261020 |
| resume-contracts | 전체5그룹/실패단정0 | 0 / 2.227초 | EXODUSER-ch1-01-Isolated-20261020 |
| resume-p3002 | 6그룹·298단정/0실패/0SKIP; holes14/168, HUD0/32 | 0 / 8.657초 | EXODUSER-P3002-Isolated-20261020 |
| resume-p3003 | core/display/actual 포함43단정/0실패, actual23/60/53/32 | 0 / 8.004초 | EXODUSER-P3003-Isolated-20261020 |
| resume-encounter | 전체3그룹/실패단정0 | 0 / 3.359초 | EXODUSER-ch1-01-Isolated-20261020 |
| resume-map | **37개 중28통과/9실패**, 재부팅 전 기준선과 실패9개 동일 | 1 / 0.141초 | Node |
| resume-import | headless editor import | 0 / 13.151초 | EXODUSER-ch1-01-Isolated-20261020 |

소환굴 회귀의 168 spawn 중 실제 actor 등록10 / 미이식158을 그대로 보존한다. P3003의 full_fieldboss_combat=false 및 기존 테스트의 미연결 경계도 유지한다. 회귀 성공은 해당 suite의 단정 성공이며 미이식 적·보스·본편 전체 인수가 아니다.

stderr: 신규 Godot/contracts/encounter/import ERROR0. p3002에는 기존 Camera2D 경고와 종료 시 **ObjectDB 8개 누수 경고**, p3003에는 Camera2D 경고가 남았다. 소유권 밖 기존 테스트/제품은 수정하지 않았다. stdout/stderr/engine.log·argv·exit·시간·격리명은 L의 실행별 파일에 보존했다.

Node 맵 실패9개는 culling fixture의 `_moCull` 미정의1개, adapter pending 기대 불일치2개, 지역 VM `Image` 미정의6개다. 실패 수정/제외 없이 동일5파일 전체를 실행했다. 원문은 resume-map.stdout.log, baseline 비교는 preservation-check.json이다.

최초 재개 실행은 acorn 미탐색으로 exporter exit1 및 Node 1실패였다. `NODE_PATH=/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules`로 기존 설치본을 읽기 전용 사용했다. 다음 Node는 macOS `/var` 임시 경로 symlink가 출력 보호에 걸려7통과/2실패였고, 테스트만 `realpathSync(os.tmpdir())`로 보정하여 최종9/0이다. 출력 보호는 유지했다. 재부팅 전57단정 로그는 당시 override 미사용이므로 최종 격리 검수 수치에 합산하지 않는다.

## 재현 명령

```sh
cd /Users/fordeargamers/exoduser-wt/ch1-01
export NODE_PATH=/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules
node godot/tools/export_ch1_area_source.mjs "$PWD" /Users/fordeargamers/exoduser-wt/_out/ch1-01/si0-recheck.json --stage 0 --seed 20261020
node --test test/fdgCh1AreaSource.test.mjs
node --test test/ch1ProductionFinish.test.js test/ch1Si1AuthoredLayout.test.js test/ch1Si1GeometryRedesign.test.js test/regionClearGate.test.js test/fdgMapSourceAdapter.test.mjs
# Godot 각 suite의 capacity/override/finally 절차와 실제 argv는 L/run_resume.py 참조.
```

## 보존 및 제출 경계

보호 baseline240파일 SHA가 모두 같다(`preservation-check.json`). 원 game.html/maps_data/layout/PNG, map-source-adapter/export_world/map.json, 공용6파일 및 다른 담당 제품 변경0줄. Q/E·세이브 형식·docs/2_3 보호. 서버·브라우저·사용자 게임창·Steam·main push·force·전체 add 없음. 작업 import로 생성된 소유권 밖 sidecar111개는 L/generated-sidecars/로 보존 이동했고 제출하지 않는다. 새 UID2개만 포함한다. override.cfg는0byte·커밋 제외다.

docs 전체 관련 키워드 검색 결과는 L/docs-sync-search.log. 기존 추적 문서는 별도 브랜치 소유라 수정하지 않고 새 구현 상태는 이 보고서와 허용된 CHANGELOG 최상단에 기록했다. 상세 branch·최종 SHA·push ref 검증·수치는 L/DONE.txt에 기록한다. PC 실행/동기화는 미확인이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: si0 / CH1-01 source snapshot only
MASTER: 기존53점 silhouette·8시각구역·남→북 동선 보존. 재설계0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes — 변경0, 화면 미검수
LARGE: source assets byte 읽기만; composites/overlap/repetition — 변경0
MEDIUM: connections/remaining holes — 변경0, 시각 미검수
GROUND: shadow/contamination/structure integration — 변경0, 시각 미검수
PLAYABLE: arena/travel/breathing/threat/readability — 변경0, 종주·전투 시각 미검수
LANDMARK: primary/secondary/tertiary — 기존 raw hand36 보존, 실효 배치 미관측
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전부 미실행
TECH QA: 타일·source contract 및 지정 회귀 위 실측; route/collision 전면 종주,
         pageerror/404/seam/loading/performance의 새 화면 검수는 미실행
FILES: 새 tool/data/producer/tests·해당 UID2·보고서·CHANGELOG만 제출
       concurrent/unrelated 제품 touched0, 기존 untracked 보존
GIT: 자기 경로 지정 stage·정상 훅 commit·자기 branch만 push; deploy0
VISUAL VERDICT: FAIL — 시각 인수 증거 미실행으로 인수 기준 미충족.
                화면 결함을 실측했다는 뜻이 아니며 source contract 완료와 별도
NEXT PASS: CH1-02는 별도 배정 후 정적 자산 차이를 검수. 이번 실행에 포함하지 않음
```
