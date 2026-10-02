# MAP — m5-tile-reachability 결과

기존 백로그 한 건의 **소스·데이터 검수 완료**. 실제 게임·8뷰는 0회이며 **VISUAL VERDICT: RETOUCH**를 유지한다. 검사 **23개 중 20 PASS / 3 FAIL**이다. 실패 3개는 main/easy 생성 계약 불일치를 재현한 결과이며 PASS로 바꾸지 않았다. 생산 HTML·에셋·기존 테스트·공용 docs 수정 및 Git 쓰기는 0이다.

## 수신·Read·실행·산출·검수 구분

| 단계 | 시각 UTC / KST | 근거와 정밀도 |
|---|---|---|
| 최신 과제 첫 실제 Read / 수신 관찰 | 2026-10-02 03:43:43 / 12:43:43 | `task.md` 읽기와 같은 tool batch의 clock. 메시지 전송 원시 시각을 뜻하지 않음 |
| 선행 문서 Read | 첫 과제 Read 이후, fixture 작성 이전 | AGENTS, 기존 native-recovery MAP-task, 가이드 1–1047행, SSOT index 1–343행을 읽음. 개별 Read 정확한 시각은 기록되지 않아 임의 지정하지 않음 |
| 생산 원문 Read | 선행 Read 이후–03:54:30 이전 | 생성기·충돌 함수·메타 병합·hand 배치·정리 분기·M5 전경 데이터 조사. 줄 번호/원문 SHA는 evidence에 보존 |
| 최초 끝까지 실행 | 03:52:47.048–03:52:48.887 / 12:52:47.048–12:52:48.887 | Node VM source fixture, 20 PASS / 3 FAIL |
| 최종 코드 검수 실행 | 03:54:55.370–03:54:57.206 / 12:54:55.370–12:54:57.206 | 검사 23개, 20 PASS / 3 FAIL, exit 1. 중간 실행도 evidence에 보존 |
| docs 전체 검색·최종 산출 검수 | `evidence.json`의 `docsAudit` / `completion` | 코드 산출 후 rg 전체 검색, 보고서·JSON·소유 파일·보호 입력 SHA 검수 |

시작 HEAD는 `96610b6546a31e882962470ea1f2164ce94edca6`. 실제 fixture 실행 HEAD는 `31454dfa49c90bac77351273fc32f0c1eb937928`. 공유 체크아웃의 HEAD가 작업 도중 외부에서 바뀌었으며 이 MAP 작업의 commit/push는 0이다. 결과는 evidence의 **입력 11개 SHA**에 묶는다. 원격 체크포인트 인수는 총괄 몫이며 이 결과는 새 원격 SHA 인수를 주장하지 않는다.

## 확인한 계약과 수치

경로는 프로젝트 루트 `/Users/fordeargamers/Projects/exoduser-migration-20261001` 기준이다. 아래 숫자는 현재 소스 또는 명시한 fixture 결과다. 새 게임 상수·좌표를 제안하지 않는다.

| Source ID | 한글명 | 수치·적용 위치 | 공식 / 동작 | 검수·한계 |
|---|---|---|---|---|
| `CH1_1_PRODUCTION` / `layout.js` | CH1-1 고정 숲 경계 | stage 0, 200×200, T=40, 세계 8000×8000, boundary 53점 | `contains(x+.5,y+.5)` 안쪽을 editor tile 1로 RLE 인코딩 | RLE 40000셀 / 크기 가드 PASS. 이 polygon만으로 최종 통행 판정 불가 |
| `_MAP_COMPOSE[0]` | 수동 밀집 구성 | `hand=1,dense=1,forestBoundary=1,lm=[],mega=[]`, handProps 36개 | 자동 산포 기본 OFF; `_nearFloor`로 hand 좌표를 바닥에 맞춘 뒤 중심에 배치 | 원문 추출. `_visR`은 fixture에서 0 반환하며 dense 분기 때문에 배치·충돌에 영향 없음. `_gridNear` 호출 시 즉시 실패 |
| `_cloneField11(0)` → `genFromTemplate` | 실제 생성 경로 | `game.html:28812`, `28988` | 생산 RLE 디코딩(editor 1→runtime 0), 북측 카빙/출입, 경계 바닥 확장 후 G.map 생성 | 함수 본문 전체 실행. Math.random=.5/.9 fixture이며 라이브 seed 재현은 아님 |
| `genFromTemplate` 7.5 단계 | 경계 바닥 확장 | 완성 G.map와 raw RLE 변환 격자 차이 967셀; raw 벽→runtime 바닥 680셀 | 인접 벽 조건으로 일부 경계 셀을 바닥으로 넓힘. 북측 카빙·특수 타일 등도 격자 차이에 포함 | 967/680을 전부 확장 단계 단독 수치로 해석하면 안 됨 |
| `_applyCh1StartNorthGate` | 북측 출입 잠금값 | x=88..112/y=2..35 바닥; gate x=99..101/y=5; exit x=99..101/y=7 | gate tile 3 / exit tile 2 | 생성 결과 PASS. 실제 출구 사용·보스 플레이 검수 0 |
| `mkP` / `canMv` | 플레이어 통행 | 기본 `P.r=15` (`game.html:27787`), START `(4020,7420)` | `canMv(x,y,r)=!isW(x-r,y-r)&&!isW(x+r,y-r)&&!isW(x-r,y+r)&&!isW(x+r,y+r)` | 실제 함수 원문 실행. 원형 전체를 연속 충돌 판정하는 식으로 바꾸지 않음 |
| `isW` | 벽 판정 | `game.html:30469` | OOB → tile 1 → hill band → 동적 bone wall → `_colObjs` 순으로 검사 | G._boneWalls=[]인 정적 fixture. 동적 전투는 미검수 |
| `_rebuildColObjs` | 오브젝트 충돌 캐시 | fixture MAP_OBJS 37개 / collision 20개 | noCol/retired 제외, `(colSz||(sz||64)*.4)*(scale||1)`; colW/H도 scale 반영 | genFromTemplate 오브젝트 + 실제 CH1 hand 배치와 메타 병합을 사용. 전체 게임 초기화/상호작용 상태는 재현하지 않음 |
| `pit_poison` | 바닥 타일 충돌 반례 | 중심 `(6500,5580)`, tile `(162,139)`=0, `_colSz=80` | sz 200 × .4 × scale 1; 중심 isW=true / canMv=false | 타일만 바닥이면 통행 가능하다는 판정의 반례 PASS |
| `MASSES` M5 / `placements.massPlacements[5]` | 남동 전경 군락 | `[175,172,2,2200,true]`, `fg` | tile 앵커 world `(7000,6880)`; 전경 렌더 인스턴스이며 M5라는 collider 추가 없음 | 에셋 앵커와 플레이어 진입점은 별도 |
| `layout()` M5 투영 | M5 그림 범위 | x=5925.78125, y=6009.765625, w=2148.4375, h=1208.984375 | 베이크 8192좌표 × 1000/1024; h=round(2200×1152/2048); by=round(172×8192/200−h×.72) | source 산식 실행. 이 사각형은 **검사용 그림 범위**이며 확정 주머니 경계가 아님 |
| BFS source fixture | 샘플 도달성 | 반경 15, 중심 간격 40, 축방향 간선 5px 샘플 | canMv를 만족하는 중심/간선만 START에 연결 | 통행 중심 19281개 중 19281개 연결. 샘플에서 거부된 후보 간선 5개는 우회 연결됨. 라이브 이동/연속 공간의 완전증명 아님 |

## M5 접근·막힘 반례

| 대상 | world / tile | G.map / isW / canMv(r15) | 판정 |
|---|---|---|---|
| 기존 START | `(4020,7420)` / `(100,185)` | `0 / false / true` | fixture 출발점. 시작 위치 변경 0 |
| 기존 M5 접근점 | `(6660,6140)` / `(166,153)` | `0 / false / true` | START→접근점 99중심·98간선·3920px 경로 존재. 각 간선 0..40의 5px 샘플 9개씩, 정방향/역방향 각 882검사 통과 |
| 기존 잘못된 촬영점 | `(7000,6900)` / `(175,172)` | `1 / true / false` | 벽. 보행 진입점으로 사용 불가 |
| M5 그림 앵커 | `(7000,6880)` / `(175,172)` | `1 / true / false` | polygon 밖이며 벽. 에셋 배치가 접근 위치의 증거가 아님 |
| 접근점 남쪽 마지막 통과 표본 | `(6660,6304)` / `(166,157)` | `0 / false / true` | 고정 x=6660, y=6141..6900을 1px 간격으로 검사한 직진 반례 |
| 남쪽 최초 막힘 | `(6660,6305)` / `(166,157)` | `0 / false / false` | 중심은 바닥. 아래 모서리 `(6645,6320)` / `(6675,6320)`가 tile `(166,158)`=1이어서 막힘 |
| M5 그림 범위의 통행 중심 | 228개 | 전부 START 샘플 그래프 연결 | 미연결 0. M5 주머니라는 의미 구역의 전체 경로 인수로 확대하지 않음 |
| polygon 밖 통행 중심 | 위 228개 중 27개 | canMv=true / foreground.pip=false | 예 `(6940,6020)`, `(6900,6060)`, `(6900,6100)`, `(6860,6140)`, `(6820,6180)`. 생산 후처리 격자를 사용해야 함 |

START→접근점 경로의 모든 꺾임점은 `evidence.latest.route.turnWorldPoints`에 저장했다. 임의 새 텔레포트 지점·배치 변경·collision 변경은 없다. 소스에는 8개 CH1 region이 있지만 별도 **M5 pocket/entrance polygon 또는 gameplay region ID**는 확인되지 않았다. 그러므로 주머니 내부와 입구를 임의 정의하지 않았고 **주머니 안→입구 전체 경로는 UNMEASURED**로 유지한다.

## 재현한 main/easy 불일치

| 검사 | 결과 | 재현 근거와 영향 |
|---|---|---|
| S03 원문 parity | FAIL | `_buildCh1StartForestRLE`, `_cloneField11`, `genFromTemplate` 원문이 다름. main은 production layout script/hook을 사용하고 easy에는 해당 script/hook이 없음. CH1 구성·deco·hand 배치·메타 병합 5블록, 북측 출입 함수 1개, 비교한 충돌/언덕 함수 6개는 동일 |
| S04 생성 격자 parity | FAIL | 동일 .5 fixture에서 main SHA `8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1`, easy SHA `7c7e8d31ae37a77291cc4fda815031bdfe7b6d0d399d0333a9314d6ad94677d5` |
| M15 선택점 판정 parity | FAIL | main의 `(6660,6305)` canMv=false, easy는 true. 접근점·벽 촬영점·에셋 앵커의 선택점 결과는 같음. **isW/canMv 공식 차이가 아니라 생성 격자 차이** |

easy VM에도 비교를 위해 동일한 순수 layout 정의를 먼저 로드했으나 easy의 builder는 그 정의를 사용하지 않고 원문 legacy fallback을 실행한다. 실제 easy 페이지 실행·script 로딩은 하지 않았다. easy를 CH1-1 동등 검수판으로 사용할 경우 이 차이가 인수 결함이며, 별도 버전이라면 비교의 한계로 명시해야 한다. 이번 소유권 밖이므로 생산 수정·미적용 패치 추가 0이다.

## docs 검색과 총괄용 정확한 동기화안

최종 `checks.mjs` 편집 후 docs 전체에서 `M5|m5-tile-reachability|6660|6140|7000|6900|6305|genFromTemplate|_buildCh1StartForestRLE|CH1_1_PRODUCTION|canMv|isW\(|_colObjs|forestBoundary|depth2`를 rg 검색했다. 마지막 매칭 수·파일 수·검색 출력 SHA와 파일별 매칭 수는 `evidence.docsAudit`에 보존한다. 선행 검색은 **722매칭 / 148파일**이었다. shared docs와 보호 2_3 수정은 0이다. 역사 문서의 당시 PASS/수치는 당시 기록으로 유지하고 최신 상태만 추가해야 한다.

| 총괄 동기화 대상 | 정확한 변경안 | 반영 시점 |
|---|---|---|
| `docs/4.1맵디자인+설정/CH1_BOUNDARY_EDGE_MAP020_20261001.md` §8 뒤 §9 추가 | 제목 `M5 타일 도달성 소스 검수 — 2026-10-02`. 위 계약·반례·main/easy 불일치 표와 입력 SHA를 반영. 상태 `source fixture 20 PASS / parity 3 FAIL; 실제8뷰0; 전체 MAP-020 RETOUCH; 주머니 전체 경로 UNMEASURED` | 총괄의 이 산출 인수/checkpoint 시 |
| `docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` MAP-020 현재 행 | 기존 B·줌37검사·뿌리40검사 이력을 유지하고 `2026-10-02 정적 소스검수: 기존 접근점 왕복 샘플/막힘 반례 확인, main/easy 생성 parity 3 FAIL. 실제8뷰·M5 주머니 전체 왕복 미검수, 전체 RETOUCH.` 추가 | 동일 |
| `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MAP-ART-REVIEW-20261002.md` 현재 MAP 상태/새 후속 절 | 옛 `m5-tile-reachability 미전달·Read 0`을 당시 이력으로 표시하고 최신 팀 과제 `수신·선행Read·소스실행·3산출 검수 완료, 생산적용0, 23검사20PASS/3FAIL` 추가. 정식8뷰0/8과 원담당 과거 실제입력 부분 인수 상태는 유지 | 동일 |
| 총괄 현재 작업표·JSON | 이번 한 건만 source 완료로 인수, runtime/visual 완료로 표시하지 않음. 시작/실행 HEAD 차이 및 실제 입력 SHA를 함께 기록 | 총괄 소유 자료만 총괄이 반영 |

## MAP PRODUCTION REPORT — 가이드 §23 전체 항목

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / MAP-020 D3 / m5-tile-reachability (source/data only)

MASTER
- silhouette: 고정 53점 polygon과 실제 생성 후처리 조사; 변경0
- regions: 기존 layout 8개 유지; M5 의미 주머니/입구의 독립 ID 미확인
- main route: 남측 START→북측 exit 계약 유지; 전체 라이브 종주 미검수
- side spaces: M5 그림 범위 겹침 228통행 중심/START 연결228, 샘플 한정

OUTER MASS
- LEFT: 기존 배치 유지; 새 시각 미검수
- RIGHT: M5 원배치/전경 좌표식 대조; 새 시각 미검수
- TOP: gate y5/exit y7 생성값 검사 PASS; 새 시각 미검수
- SOUTH: 접근점 남쪽 y6305 첫 막힘 반례; 새 시각 미검수
- major holes: 변경0; 실제 시각 미검수

LARGE
- source assets: 기존 M5 mass2/width2200, 새 에셋0
- composites: 변경0
- overlap: M5 그림 범위와 통행 중심의 데이터 겹침만 검사; 시각 미검수
- repeated silhouette: D2 부분 개선 이력 유지; 새 시각 미검수

MEDIUM
- connections: 기존 접근점→START 정적 샘플 연결/역방향 확인
- remaining holes: 시각 미검수; 새 상세 배치0

GROUND
- shadow: 기존 MAP-020 B/깊이 전경 유지; 이번 draw0
- contamination: 변경0; 시각 미검수
- structure integration: polygon 판정과 G.map 후처리를 구분; 시각 미검수

PLAYABLE
- main arenas: 기존 계약 유지; 실제 게임0
- travel space: 99중심/98간선 반경15 왕복 샘플 통과
- breathing space: 새 전투 QA0
- threat space: 동적 bone wall/적 상황 미검수
- combat readability: 미검수

LANDMARK
- primary: corpse tree (4100,3620) 기존 카메라 목표 유지; 새 뷰0
- secondary: 기존 계획 유지; 새 시각 미검수
- tertiary: M5는 보조 경계 진단; primary 대체0

CAMERA QA
- START: (4020,7420), 새 뷰0
- EARLY: (4020,6300), 새 뷰0
- ARENA: (4020,4820), 새 뷰0
- SIDE L: (1980,6060), 새 뷰0
- SIDE R: (6060,5460), 새 뷰0
- LANDMARK: (4100,3620), 새 뷰0
- LATE: (4020,1940), 새 뷰0
- EXIT: (4020,620), 새 뷰0
  위 좌표는 기존 카메라 목표, 전부 통행 가능한 플레이어 위치라는 주장0.

TECH QA
- route: 정적 샘플 기존 접근점 왕복 PASS; 주머니 안→입구 실제 전체 경로 UNMEASURED
- collision: 벽촬영점/반경모서리/바닥오브젝트 반례 PASS; main/easy parity FAIL3
- pageerror: 게임 실행0, UNMEASURED
- 404: 서버/브라우저0, UNMEASURED
- seam: 새 시각 미검수
- loading: UNMEASURED
- performance: 성능 측정0, UNMEASURED

FILES
- stage-owned: project-teams/MAP/result.md, evidence.json, checks.mjs만 작성
- concurrent touched: 타팀 파일은 보존; 상태 수만 시작23/중간31/최종evidence 기록
- unrelated touched: 이 작업의 소유 밖 쓰기0; task.md 편집0

GIT
- staged: 0
- commit: 0
- push: 0
- deploy: 0

VISUAL VERDICT: RETOUCH

NEXT PASS: 총괄 source/docs 인수 후 지정 runtime 슬롯에서 정정8뷰, M5의 의미 주머니/입구 확인 및 실제 전체 왕복·전방벽·밀집 전투 가독성 검사. easy를 동등 검수판으로 쓸 때는 생성 계약 차이를 먼저 처리. 이번 채팅의 새 일감/세션 생성0.
```

## 재실행과 인계

`checks.mjs`는 큰 게임 사본·격자 캐시를 만들지 않고 원문 함수를 메모리에서 추출한다. 지정 Node 전체 경로로 실행하며 기본 실행은 JSON을 stdout에 출력한다. `--evidence`만 소유 `evidence.json` 실행 이력을 갱신한다.

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/project-teams/MAP/checks.mjs
```

현재 exit 1은 위 parity 3 FAIL에 대응한다. 실패를 무시하거나 실제 시각 PASS로 처리하지 않는다. 최종 소유 파일은 task.md 외 **3개**이며 `evidence.completion`에 바이트/SHA/검수 시각을 기록한다. 코드+상세 SSOT 동기화 및 commit/push는 최신 task.md가 총괄에게 배정한 단계로 남는다.
