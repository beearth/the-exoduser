# CH1-02 — 정적 환경 자산 동기화 BLOCKED

작업ID `ch1-02`, 2026-10-20. **BLOCKED: 지시서의 필수 `godot/data/map.json` 변경이 이번 사용자 지시의 공유 파일 수정 금지에 해당한다.** 필요한 변경만 조사·기록했다. 제품 구현·자산 동기화·시각 인수 완료가 아니다.

| 기준 | 실제 상태 |
|---|---|
| worktree / branch | `/Users/fordeargamers/exoduser-wt/ch1-02` / `codex/ch1-02-20261020` |
| fetch main | `284d7faf49295b2f5061937a47ce96038032ed3c` |
| CH1-01 의존 | main에 `677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152` 미포함. 사용자 지시대로 그 끝에서 새 worktree·브랜치 생성. main 병합은 미확인/미수행 |
| 지시서 | main에 추적 문서 부재. `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.2·§4.8 적용. L/trace-order-reference.md에 원문 보존 |
| 원본 | 최신 main과 동일한 WT game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 원로그 L | `/Users/fordeargamers/exoduser-wt/_out/ch1-02/` |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 작업 파일 쓰기0; 기존 INDEX/WORK 보존 |

## 필요한 공유 파일 변경 — 실행하지 않음

`godot/data/map.json`은 minified 1행이므로 **모든 대상은 1행**이며 아래 JSON pointer로 구분한다. 최신 원본 `_CH_DECO[0]` 등록값을 실제 재추출해 확정했다. metadata.file 변경에 맞춰 texture도 같은 파일로 연결해야 하므로 PNG만 복사해서는 CH1-02가 성립하지 않는다.

| ID / pointer prefix | 필드 2개 | 기존 → 필요한 값 | 원본 행 |
|---|---|---|---|
| m_ctree17 / `/props/4` | `/texture`, `/metadata/file` | rotforest_tree_03.png → **rotforest_tree_05.png** | game.html:17551 |
| m_ctree18 / `/props/5` | `/texture`, `/metadata/file` | rotforest_tree_04.png → **rotforest_tree_11.png** | game.html:17552 |
| m_ctree19 / `/props/6` | `/texture`, `/metadata/file` | rotforest_tree_02.png → **rotforest_tree_06.png** | game.html:17553 |
| m_ctree20 / `/props/7` | `/texture`, `/metadata/file` | rotforest_tree_01.png → **rotforest_tree_07.png** | game.html:17554 |

texture는 각각 `res://assets/map/props/<파일명>`, metadata.file은 파일명만이다. 좌표·scale 입력은 game.html:18138, 원본 rotTree 연결은18500이다. 시각 동적 모듈의 이식은 이번 정적 범위 밖이다.

추가로 지시서가 요구하는 **범위 출처**를 map.json:1에 새로 기록해야 한다. 예: `/source/asset_updates` 새 배열 항목에 작업ID·기준main·원본WT/game SHA·원exporter SHA·원본 행·대상 PNG SHA를 남긴다. 기존 `/source/root`, `/source/game_sha256`, `/source/collider_updates`는 보존해야 한다. 새 출처 형식의 실제 반영도 공유 파일 수정이므로 실행하지 않았다.

`engine/fdg/map-source-adapter.js`와 `godot/tools/export_world.mjs`의 제품 수정은 필요0줄이다. 기존 exporter는 outRoot가 자기 부모 경로라 제품 위치에서 실행하면 map.json·enemy.json·PNG를 덮어쓴다(`export_world.mjs:9–10,64–69,92–95`). 아래 검수에서는 L로 **동일 byte 복사한 도구만** 실행했다.

## 격리 재추출·바이트 조사

```sh
WT=/Users/fordeargamers/exoduser-wt/ch1-02
L=/Users/fordeargamers/exoduser-wt/_out/ch1-02
mkdir -p "$L/reextract/tools"
cp "$WT/godot/tools/export_world.mjs" "$L/reextract/tools/export_world.mjs"
NODE_PATH=/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules \
  node "$L/reextract/tools/export_world.mjs" "$WT" "$L/export-evidence"
```

원본 HTML 입력은 R이 아닌 WT다. R의 기존 acorn 설치본만 읽기 전용 사용했다. 출력 map/enemy/PNG는 전부 L/reextract 안이며 제품으로 복사하지 않았다. 새로운 PNG 생성·인코딩·픽셀 편집은 없다.

| 대조 항목 | 실측 |
|---|---|
| 원exporter ↔ L 복사 도구 | SHA256 동일 |
| 재추출 | exit0, 40000 tiles / wall292 / collider19 / props36 / chunks64 |
| PNG | 총92개 source↔격리 추출 bytes/SHA 모두 동일. 현 제품과46동일/46차이 |
| 차이46 | production_finish 청크42개 byte 차이 + 제품에 없는 나무 PNG4개 |
| chunk 크기 | 원본64개 모두1026×1026; source_rect `[1,1,1024,1024]`, world_rect 크기1000×1000 유지 |
| 타일 | SHA `655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa`, 기존 전체 타일 동일 |
| 충돌/배치 | collision_rects·prop_colliders·hill·rooms·exits·boss_gate·boundary·regions·START/EXIT 전체 동일 |
| 소품 전체 비교 | texture/file8필드 외 나머지 props 값 동일: position·authored_tile·draw_size·pivot 포함 |
| pit_poison | 기존 collider radii80/58·y offset7 보존. 원본 game.html:18407·31686–31712 의존 |
| JSON 재출력 차이 | 11경로: 나무 texture/file8 + source.root/game_sha256 + 재출력본의 collider_updates 누락1. 따라서 전체 재출력본 채택 금지 |

청크의 원본 경로는 `assets/map/ch1/production_finish/chunk_x_y.png`, 제품 대상은 `godot/assets/map/production_finish/chunk_x_y.png`다. 기본 경로·현행 cache 근거는 game.html:11615–11616이다. 필요한42개를 행(y)별로 나열한다.

| y | 변경이 필요한 chunk x |
|---|---|
| 0 | 1,2,3,4,5,6 |
| 1 | 0,1,2,3,6,7 |
| 2 | 0,1,5,6,7 |
| 3 | 0,1,5,6,7 |
| 4 | 0,1,2,5,6,7 |
| 5 | 0,1,2,7 |
| 6 | 1,2,5,6,7 |
| 7 | 2,3,4,5,6 |

새 나무4개는 `assets/map/ch1/collision/rotforest_tree_{05,11,06,07}.png` → `godot/assets/map/props/`의 동일 파일명이다. 각92개 원본/현재/격리 추출 SHA·byte수 및 정확한11 JSON 경로는 **L/asset-audit.json**에 보존했다. 이 숫자는 동기화 전 차이의 관측이며 동기화 성공 수치가 아니다.

## 회귀 결과

공유 파일 금지로 신규 CH1-02 테스트2개·PNG 반영·8카메라 비교는 미실행이다. 기존 테스트의 통과를 CH1-02 구현 완료로 계산하지 않는다. 지정 Godot4.7.2만 사용했고 실행 전 프로세스 수를 확인하여2 이상이면30초씩 대기했다. 실제 실행 argv·시간·exit·override 이름·stdout/stderr는 L의 각 prefix 파일에 보존했다.

| prefix / 실행 | 최종 수치 | exit / 시간 | 격리 이름 |
|---|---|---|---|
| node-ch1-01 | 9통과/0실패/0SKIP | 0 / 2.683초 | Node; 임시 폴더는 기존 CH1-01 상수 |
| godot-ch1-01 | 62단정/0실패 | 0 / 0.359초 | EXODUSER-ch1-01-Isolated-20261020 |
| map-node | 37개 중28통과/9실패, 기존 실패9개 동일 | 1 / 0.202초 | Node |
| repair-import | 캐시 import 복구 | 0 / 13.296초 | EXODUSER-ch1-02-Isolated-20261020 |
| repair-contracts | 전체5그룹/실패단정0 | 0 / 2.174초 | EXODUSER-ch1-02-Isolated-20261020 |
| repair-p3002 | 전체6그룹·298단정/0실패/0SKIP | 0 / 8.575초 | EXODUSER-P3002-Isolated-20261020 |
| repair-p3003 | core/display/actual43단정/0실패 | 0 / 7.918초 | EXODUSER-P3003-Isolated-20261020 |
| repair-encounter | 전체3그룹/실패단정0 | 0 / 3.175초 | EXODUSER-ch1-02-Isolated-20261020 |

contracts/encounter에는 강제 격리 상수가 없어 작업 격리명을 썼다. 기존 CH1-01·P3002·P3003 상수는 그대로 존중했다. 매 실행 finally에서 override.cfg를0byte로 비웠고 커밋하지 않는다. 실제 P3002는 holes14/분모168·HUD0/32, 실제 P3003 분모23/60/53/32를 보존했다. P3002의 실제 actor등록10/미이식158, 지역의 full_fieldboss_combat=false도 남아 있으며 전체 게임 완성을 뜻하지 않는다.

최종 repair 4suite 및 CH1-01은 stderr ERROR0이다. P3002의 기존 Camera2D 경고·ObjectDB8누수 경고, P3003 Camera2D 경고는 미해결이며 제품/기존 테스트 수정0이다. 맵 Node 실패는 기존 culling fixture1·adapter pending2·Image 없는 지역 VM6이며 정확한 실패 이름 비교는 L/map-baseline-comparison.json이다.

**최초 실패를 별도 보존했다.** 최초 import는 exit -11/1.750초로 중단되어 일부 ctex가 없었다. 이어 실행된 최초 contracts는5그룹/0실패·exit0이어도 리소스/스크립트 오류가 있어 유효 통과로 세지 않는다. 최초 P3002는1단정/1실패, P3003는36단정/1실패, encounter는0그룹 통과/5실패였다. 이는 미완성 import 캐시에서의 관측이며 제품 회귀 원인으로 단정하지 않는다. 원인 미확정인 import 중단을 자동 성공으로 처리하지 않았다. 실행기에 import 실패 시 후속 suite 중단 조건을 추가하고 정상 import 후 영향받은4suite만 재실행했다. 기존 CH1-01 순수62단정은 리소스 오류가 없고 캐시 의존 범위가 아니므로 반복하지 않았다.

## 보존·후속 조건

제출 변경은 본 보고서와 허용된 CHANGELOG_SYNC 최상단 절뿐이다. game.html·원본 에셋·맵 공유3파일·공용6파일·타 담당 제품 변경0줄. 세이브 형식·Q/E·docs/2_3 보호. main push·force·전체 add·배포0. branch·제출 SHA·검증 수치는 L/DONE.txt에 **BLOCKED**로 기록한다.

후속 진행에는 위 map.json:1의8필드와 범위 출처에 대한 소유권/수정 허용, 정적46PNG와 해당 import sidecar의 범위 확정이 필요하다. 현재 지시 아래 해당 변경을 우회하지 않는다. 허용 후에만 신규 Node/Godot 검증2개와8카메라 비교를 실제 수정본으로 수행할 수 있다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: si0 / CH1-02 BLOCKED before product synchronization
MASTER: silhouette·regions·main route·side spaces 변경0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes — 변경0, 시각 미검수
LARGE: 원본 byte 참조만; composites/overlap/repeated silhouette 변경0
MEDIUM: connections/remaining holes — 변경0
GROUND: shadow/contamination/structure integration — 변경0
PLAYABLE: arena/travel/breathing/threat/readability — 변경0, 자연 종주 미실행
LANDMARK: primary/secondary/tertiary 변경0; tree4의 참조 차이만 조사
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미실행
TECH QA: 격리 재추출·바이트/JSON 대조 및 별도 기록한 회귀만 실행
         pageerror/404/seam/loading/performance 새 화면 검수 미실행
FILES: 보고서·CHANGELOG만; concurrent/unrelated 제품 touched0
GIT: 자기 branch만 정상 docs commit/push; deploy0
VISUAL VERDICT: FAIL — 수정본 및 시각 인수 증거 없음. 실측 화면 결함 판정 아님
NEXT PASS: 공유 map의 지정8필드+범위출처 수정 경계를 확정한 뒤 CH1-02 재개
```
