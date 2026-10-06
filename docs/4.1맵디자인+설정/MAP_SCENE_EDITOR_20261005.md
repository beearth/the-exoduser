# 맵 씬 에디터 v1 — 실제 구현·검수 계약

2026-10-05 사용자 최신 지시: 설정 캐릭터 이미지의 크기를 맞추고, 이미지를 재료로 조합하는 맵 에디터를 만든다. 원총괄이 공유 정본 `editor.html`에 레이어 씬 작업 영역을 구현했다. 이전 MAP팀 독립 HTML/WIP의 채택·완료 선언과는 별개다. 현재 첫 버전은 이미지 구성·변형·보행·프로젝트 왕복을 실제 편집한다. 본편 맵 채택, NPC/대화/음향, Unity 전체 기능 및 native 플레이 인수는 후속이다.

## 1. 실행·파일 소유

| 항목 | 현행 |
|---|---|
| 기본 진입 | `editor.html` — 새 이미지 레이어 씬 작업 영역 |
| 제작 결과 진입 | `editor.html?scene=assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json` — 저장된 틈 구성 우선 로드 |
| 기존 타일 작업 | `editor.html?workspace=tiles` — 기존 타일/방/소환굴/FIXED_MAPS 내보내기 유지 |
| 현재 검수 주소 | `http://127.0.0.1:3387/editor.html` — 실제 checkout의 `server.cjs`, HOST=127.0.0.1, PORT=3387, 격리 save 경로 |
| 다른 서버에서 사용 | 해당 checkout의 `server.cjs`가 서빙하는 `/editor.html`. 사용자3333 서버는 다른 checkout이므로 이번 수정의 검수 주소로 사용하지 않음 |
| 공유 HTML | `editor.html` — UI·모드 분기·외부 씬 스크립트 연결 |
| 구조·수학 | `tools/map-scene-core.js` — validate/decode/encode/local/hit/canWalk/resize/route/History/serializedBytes/projectSource |
| 편집·렌더 | `tools/map-scene-editor.js` — preset/asset/변형/레이어/보행/저장·복원·내보내기 |
| 시험 캐릭터 | `tools/map-scene-actor.js` — 기존8방향 전사 idle/walk, 이미지 씬 전용 |
| 화면 | `tools/map-scene-editor.css` — 3열 데스크톱, 760px 이하 속성 패널 토글·상단 액션 가로 스크롤 |
| 검수 | `tools/test-map-scene-core.cjs`, `tools/test-map-scene-ui.cjs`, `tools/test-hell-rift-scene.cjs` |
| 기존 포크 | `tilemap-editor-src.html`, `docs/4.1맵디자인+설정/tilemap-editor.html` 수정0 |
| 세이브 격리 | 씬 모드에서 기존 초기 슬롯 선택·설정 로드·타일맵 자동저장·draw·game iframe 기동 및 OBJ_DEFS preload/팔레트 생성 차단. `gameFrame.src` 미설정 |

## 2. 원본 해상도와 월드 크기

이미지는 원본 bitmap 크기와 `crop`을 가진다. 배치 객체의 `width/height`는 **월드 px**다. 투명 여백·원본 해상도가 다른 이미지도 월드 너비를 같은 값으로 지정하면 크기를 맞출 수 있다. 기본 발 기준점은 `(pivotX,pivotY)=(0.5,1)`, 회전0°, 불투명도1, 반전false다. 수치 너비/높이 변경은 발 기준점을 유지하며, 모서리 핸들은 회전·반전을 고려해 반대 모서리를 고정한다. 비율 유지 기본 ON, 비율은 필드 편집 시작 시 고정하고 빈 숫자·비유한 값·0 이하 크기는 모델에 반영하지 않는다.

| 에셋 ID | 원본 px | 기본 배치 너비 world px | 제안 층 | 실제 출처 |
|---|---:|---:|---|---|
| rift-art | 1920×1920 | 8000 | ground | `assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png` |
| abyss | 1920×1920 | 8000 | back | 같은 폴더 `hell-rift-abyss-v3.png` |
| root-wall | 1774×887 | 1800 | foot | `assets/map/ch1/a_grade_candidates/20261005/root_buttress_v3.png` — 생산 미채택 후보 |
| forest-ground | 2048×2048 | 8000 | ground | `assets/map/ch1/rottenwood_living_hell_v7_ground_layer.png` |
| forest-left | 2048×2048 | 8000 | mid | 같은 폴더 `rottenwood_living_hell_v7_left_layer.png` |
| forest-right | 2048×2048 | 8000 | mid | 같은 폴더 `rottenwood_living_hell_v7_right_layer.png` |
| forest-north | 2048×2048 | 8000 | mid | 같은 폴더 `rottenwood_living_hell_v7_north_layer.png` |
| dead-tree | 64×64 | 240 | foot | `assets/objects/tree_dead_01.png` |
| glow-mushroom | 32×32 | 100 | foot | `assets/objects/mushroom_glow_01.png` |
| 사용자 이미지 | 각 축1~8192 | 400 | foot 제안 | PNG/JPEG/WebP ≤10,000,000 bytes, data URI로 프로젝트에 포함 |

제안 층은 카탈로그 메타다. 클릭 배치는 **현재 선택한 잠금 해제 레이어**를 사용한다. 비동기 로딩 중 workspace inert·busy 가드·단축키 차단으로 잠금 검사와 실제 배치 대상이 바뀌지 않는다. 이미지 로드·프로젝트 불러오기·새 씬 시작도 직렬화한다.

투명 crop은 원본 ≤16,777,216 pixels에서 alpha>8의 경계를 측정한다. 그보다 큰 원본은 전체 사각형을 쓴다. 완전 투명한 측정 이미지는 거절한다. file:// 픽셀 읽기 차단 시 기존 세 자산은 검증 crop으로 폴백한다: root-wall `(85,35,1626,827)`, dead-tree `(3,4,61,57)`, glow-mushroom `(7,3,18,27)`. 로컬 HTTP 사용을 권장한다. PNG 내보내기의 file:// tainted canvas 실패는 안내하고 씬을 유지한다.

## 3. 프로젝트 JSON v1

| 필드·제약 | 정확 계약 |
|---|---|
| 식별 | `format='exoduser-map-scene'`, `version=1`, name 비어 있지 않은 문자열 ≤160 |
| world | cols/rows 정수10~300, tileSize 유한수8~128. 기본200×200/T40/8000×8000 world px |
| assets | 최대128, 고유 id·name 문자열 ≤160, width/height 유한수1~8192, crop 필수 |
| src | `assets/` 또는 `img/` 아래 ASCII 경로의 png/jpg/jpeg/webp, `..` 금지. 또는 PNG/JPEG/WebP base64 data URI. 문자열 ≤14,000,000 chars |
| crop | x∈[0,width−1], y∈[0,height−1], w∈[1,width−x], h∈[1,height−y], 소수 허용 |
| layers | 1~24, 고유 id·name, visible/locked boolean, sort=`flat` 또는 `foot`, parallax∈[0,1], objects 배열 |
| 객체 수 | 전체 레이어 합계 ≤2000, 고유 id·name, assetId가 실제 asset을 참조 |
| 객체 위치·크기 | x/y∈[−40000,40000], width/height∈[1,32000] world px |
| 객체 변형 | pivotX/pivotY∈[0,1], rotation∈[−360,360]°, opacity∈[0,1], flipX boolean |
| mask | 선택 필드, 3~256개의 [x,y] 정규화 점, 각 축0~1. 전경3조각·중앙 균열에 사용 |
| maskFeather | 선택 유한수0~160 world px, mask 필수. polygon 내부 경계 거리 d에 smoothstep(min(1,d/maskFeather)); 0은 hard clip |
| sourceParallax | 선택 유한수0~1, mask 필수. mask·객체 위치 고정, 이미지 source만 (viewport center−world center)×(1−sourceParallax) 이동. 회전·flip 역변환으로 local offset 계산 |
| ?scene 경로 | assets/map/ 아래 ASCII 경로의 .scene.json, 최대400 chars, ..·외부URL·query/hash 금지. HTTP/redirect/32MB/JSON/이미지 오류 시 현재 복구 씬 보존 |
| walkable | cols×rows와 길이가 정확히 같은 0/1 배열. 비주얼 배치와 독립 |
| start/exit | x∈[0,cols×tileSize−1], y∈[0,rows×tileSize−1] |
| cameras | 최대32, 고유 id·name, x∈[0,cols×tileSize], y∈[0,rows×tileSize] |
| 크기 한도 | compact JSON UTF-8 ≤32,000,000 bytes. 파일 import도 ≤32,000,000 bytes, JSON export는 compact 직렬화 |
| 이미지 import 원자성 | 구조 검증 → 모든 이미지 decode·원본 크기 일치 → history 교체. 잘못된 JSON/누락·decode 실패/크기 불일치에 현재 씬·history 유지 |
| Undo | 트랜잭션 시작 전 snapshot. 최대40개, undoStack 직렬화 UTF-8 합계 ≤64,000,000 bytes로 오래된 것 제거. JS 실제 heap 상한이라는 뜻은 아님 |
| 복구 저장 | `localStorage['exoduser:map-scene:v1']`만 사용, 사용자 변경 후500ms debounce. 최초 복구·?scene 로드는 저장하지 않아 기존 복구값 보존. quota 실패는 수동 JSON 저장 안내 |

이 포맷은 기존 FIXED_MAPS/게임 저장 포맷과 다르다. 씬 JSON을 본편 런타임으로 자동 반영하는 bridge는 구현하지 않았다. 외부 PNG/JPEG/WebP 임포트는 가능하지만 `.unitypackage`·Prefab·FBX·Unity material/shader 직접 실행·변환은 미구현이다. 이미지 사용권·출처 메타의 별도 카탈로그 확장도 후속이다.

## 4. 레이어·카메라·입력

| 항목 | 동작·기본값 |
|---|---|
| 기본 층 | BACK→GROUND→MID→FOOT→FRONT. 전부 visible=true, locked=false, ground는 두 이미지 프리셋에서 locked=true |
| 층 정렬 | flat=배치 순서. foot=객체 y 오름차순에 시험 캐릭터의 발 y를 병합 |
| 시차 | BACK .965, 나머지1. offset=(viewport center−world center)×(1−parallax). 새 결과 layer는1, 심연 객체 sourceParallax만 .965 |
| 고정 soft mask | 최대8 entry, entry당 image+mask canvas2장/긴 축1024px. 알파 샘플 긴 축256px, smoothing. 최대16 canvas/정사각형RGBA 약64MiB, 기타 원본 이미지 별도. crop/size/polygon/feather stamp 캐시, import 때 clear |
| 자동 카메라 | 8카메라 버튼·보행 시작/이동에 viewport half extent로 월드 경계 clamp. 원본 camera/start/exit·자유 편집 pan 유지 |
| 레이어 편집 | 이름·정렬·시차·가시성·잠금·순서·추가, 객체 레이어 이동/복제/삭제. 복제 offset=(40,40), x/y 최대40000 clamp |
| 시각 선택 | 역회전·반전·pivot를 적용한 객체 좌표, mask polygon 또는 원본 alpha로 투명 여백 선택 방지 |
| 타일 맞춤 | 기본 ON, 현재 tileSize 배수에 좌표·모서리 크기 맞춤 |
| 길 브러시 | 반경0~12 tiles, 기본2, 원형 칠하기/막기. 드래그 구간은 T/2 간격 보간 |
| 선택/길/막기 | V/B/E. 시작/출구는 툴 버튼, 월드 범위 clamp |
| 화면 이동·확대 | Space+드래그/가운데 또는 오른쪽 버튼, 휠×1.12/÷1.12, 버튼×1.2/÷1.2, 줌 .025~3. 전체 fit·카메라 프레임 줌은 별도 계산 |
| 단축키 | Ctrl/⌘S 저장, Ctrl/⌘Z Undo, Shift+Z 또는 Y Redo, Delete/Backspace 객체 삭제, ESC 선택/시험 종료. 입력 필드와 로딩 busy 동안 전역 편집 키 차단 |
| 캔버스 | DPR 최대2, 변경 또는 시험 이동 때 redraw |
| 보행 시험 | MapSceneActor 기존8방향 PNG1008×48/21셀 중 첫10셀. source cell48², idle0~1/850ms, walk2~9/110ms, south 본체29px→80 world px의 고정80/29배율·source foot43, full frame alpha 보존 |
| 방향 중심 | east/se/s/sw/w/nw/n/ne 순 source center [22.5,22.5,22,25.5,25,23.5,23.5,21.5], idle0 기준 고정. 프레임별 recenter/rescale0 |
| actor 수명 | 실제 충돌 반영 뒤 dx/dy로 heading/moving 갱신. frame/heading/moving/load revision 때 redraw. 실패 시 south/다른 loaded 방향→접지 표시. ctx save/restore, shadow25×11 1회. snapshot loaded boolean/moving/heading/frame/errors. tiles모드 Image/API 생성0 |
| 시험 이동 | WASD/방향키320 world px/s, 대각 정규화, dt 최대.05s, 축별 충돌 검사. blur·시험 종료·로딩 시작에 held key 정리 |
| 충돌·연결 | radius12 world px, 중심+4모서리5점 canWalk. 경로 검사는 같은 검사로 4방향 BFS |
| PNG 내보내기 | 긴 축2048px의 전체 구성, 선택/격자/시작·출구 overlay 제외. 청크 베이크/생산 최적화 export는 후속 |

## 5. 첫 프리셋의 정확 경계

| 프리셋 | 구현 상태 |
|---|---|
| 지옥의 틈 | 승인 원화 전체1장 + 기존 정확한 전경 silhouette3조각. 원화 원본·nav 유지. 200²/T40, walkable4107, 시작(4020,7740), 출구(4020,1740), 기존8 cameraAnchors |
| 부분 가림 | 서쪽 뿌리 foot134, 동쪽 뿔108, 남쪽 뿌리173을 tile×40으로 변환, crop+polygon mask로 객체 분리. 완전 clean plate/높이/3D 모델/인물 분리 아님 |
| 심연 | 팔레트 자산이며 기본 씬 BACK는 비어 있음. 사용자가 배치·시차 조절 가능 |
| 1-1 썩은숲 · 구성 스케치 | 기존 v7 ground/left/right/north 4장 + `CH1_1_PRODUCTION.buildRLE(200,200)` 및8 regions. 시작(4020,7420), 출구(4020,300). 최신 본편97차 외곽·움직임을 재현한 생산 베이크가 아님 |
| 빈 씬 | 200²/T40, 전40,000칸 walkable=1, 시작(4020,7740), 출구(4020,300), cameras=[] |

1-1 정본 layout SHA256 `94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab`, 틈 nav SHA256 `52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb`와 원본 에셋은 수정하지 않았다. 이미지 일부를 조합할 수 있는 제작 도구의 완료와 A급 맵·전투/보스6단계 완료를 구분한다.

## 6. 실제 검수·사용 순서

1. 기본 에디터를 열고 템플릿 선택→새 씬으로 시작. 이 전환도 Undo 가능하다.
2. 팔레트 이미지 선택→잠금 해제 층의 화면 클릭. 선택 V로 객체를 잡고 world px 크기·발 기준점·회전·비율을 조절한다.
3. BACK/외곽/발 가림/전경을 조합하고 8 카메라·전체 구도로 반복과 깊이를 확인한다. 그림 높이와 길 충돌은 별도다.
4. 길 칠하기/막기→시작·출구→경로 검사→보행 시험. 실제 걷는 경계가 그림과 일치하는지 직접 검수한다.
5. 프로젝트 저장→열기로 왕복하고 필요하면 PNG를 내보낸다. 로컬 복구 저장은 수동 프로젝트 보존을 대신하지 않는다.

| 검사 | 실제 결과 |
|---|---|
| core | 29/29 PASS: real RLE/nav, 실패 원자성, 트랜잭션, history 한도, 회전·반전·mask 선택, 크기 핸들·충돌/경로·safe query·soft mask 계약 |
| Chrome UI | 실제 설치 Google Chrome의 격리 headless context에서 15 행동그룹 PASS. numeric Undo/지우고 재입력, alpha crop/400px 배치, 핸들, 실패 import, 왕복 JSON, 느린 import 직렬화, WASD 이동, 재로드 복구, 층 순서/실제 pixel 가시성, PNG2048², CH1 프리셋/Undo, 모바일 저장/속성 접근 |
| 실행 격리 | pageerror0, HTTP404/이미지 누락0, 팔레트9장 decode 확인, 새 game iframe0, 기존 slot storage write0. 저장 key는 `exoduser:map-scene:v1`만 관찰 |
| 시각 범위 | 1500×960 에디터·390×844 모바일 및 틈8카메라 캡처. 본편/NW/native/청취/전투 화면을 검수한 근거로 확대하지 않음 |
| 증거 | `/Users/fordeargamers/.codex/visualizations/map-scene-editor-20261005/qa/`의 UI JSON·전체/변형/보행/CH1/모바일/카메라8 PNG·왕복 JSON. 상위 폴더 core/asset-dimensions/related-docs-search, 변경 전 백업 |

## 7. MAP PRODUCTION REPORT

STAGE: 공유 정본의 이미지 씬 에디터 첫 버전. 틈·1-1 참조 프리셋, 생산맵 변경0.

MASTER
- silhouette: 승인 틈의 비대칭 균열, 1-1의 기존 구성 스케치 유지.
- regions: 기존8 cameraAnchors/CH1 regions로 검수 위치 연결.
- main route: 남쪽 진입→북쪽 출구의 기존 nav 유지.
- side spaces: 기존 그림·nav 후보 유지, 신규 주민·퀘스트 구현0.

OUTER MASS
- LEFT / RIGHT / TOP / SOUTH: 기존 원화·v7 참조 layer, 신규 생산 외곽 bake0.
- major holes: 틈 중앙 심연은 시각 균열. 1-1 참조의 빈 외곽은 후속 A급 제작 대상.

LARGE
- source assets: 실제 기존9 bitmap 카탈로그, 원본불변.
- composites: 레이어 순서·world 크기·pivot·rotation·alpha 편집 가능.
- overlap: alpha/mask hit 및 FOOT y 가림. 신규 자동 scatter0, spacing 규칙 변경0.
- repeated silhouette: 편집·카메라 검수 가능, 반복 제거된 새 생산맵 선언0.

MEDIUM
- connections: 이미지와 길을 별도 편집, 길 드래그 보간·경로 BFS.
- remaining holes: full clean plate·완전 전경/인물 분리 후속.

GROUND
- shadow: 기존 원화의 접지 유지, 시험 캐릭터 타원 그림자25×11.
- contamination: 기존 재질, 새 베이크0.
- structure integration: 이미지 배치/그림과 nav의 일치 검수 도구 구현. 실제 높이 모델 후속.

PLAYABLE
- main arenas / travel / breathing / threat: 기존 참조 geometry, 새 적·전투 수치0.
- combat readability: 보행 시험 구현, 전투·보스 가독 실제 인수는 미완료.

LANDMARK
- primary: 틈 균열/북쪽 상승 계단, CH1 참조 북측 문턱.
- secondary / tertiary: 기존 그림, 주민 대화·보상·상호작용 연결 후속.

CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 틈의 시작/잔불/서측/서쪽 길/동측/심연/상승 준비/출구8 프레임을 편집기에서 캡처. 본편 전투 카메라 인수와 구분.

TECH QA
- route: 기본 틈 canWalk BFS PASS, real nav4107칸; CH1 참조 연결 PASS.
- collision: 실제 WASD 이동과 core5점 검사 PASS, 생산 collision 변경0.
- pageerror: 0. HTTP404/이미지 누락0, 팔레트9장 decode 확인.
- seam: 원화 원본 및 참조 기존층 그대로, 새 생산 seam 검수0.
- loading: 구조+decode 확인 뒤 import atomic, 로딩 중 편집 직렬화 PASS.
- performance: DPR2 cap/변경 redraw, 최대 자산·객체 전체 스트레스/FPS 인수는 후속.

FILES
- stage-owned: HTML1 + 씬JS2/CSS1 + 검사2 + 관련 docs8.
- concurrent touched: 기존 오더담당 STATE/LOG·다른 팀 WIP·backup normalize 변경 보존.
- unrelated touched: 0. 보호2_3/Q-only/어택티켓 금지·사용자 세이브·기존23변경 보존.

GIT
- staged / commit / push: 이번 완료 소유 코드+docs만 정확 경로로 checkpoint, 원격 SHA 별도 영수증 확인.
- deploy: 새 게임 패키지·외부 게시·배포0. root3386 및 사용자3333/앱3381·3383 무조작.

VISUAL VERDICT: **RETOUCH** — 에디터 작업 화면은 사용 가능한 첫 버전. 틈 전체 레이어/깊이와 1-1 A급 완성은 미인수.

NEXT PASS: 승인 원화를 완전 배경/바닥/외곽/전경으로 제작하고 최신 CH1 생산 visual을 씬 자산으로 인수한다. 이후 runtime export bridge, NPC/대화/음향·진행, 같은 후보의 실플레이6단계·청취를 각각 검수한다.


## 8. 2026-10-06 — 실제 틈 씬 결과

[잔류자의 계곡 결과·제작 보고서](HELL_RIFT_EDITOR_RESULT_20261006.md). 원화6 crop 조각·전경3·별도 심연1을 조립했다. 10에셋/10객체/6레이어, world8000², 원본 start/exit/8앵커 참조·결과물1192 corridor 사용(기본 프리셋4107 그대로). query에서 편집·PNG/JSON 내보내기와 8방향 전사 보행을 검수한다. 대화/NPC/장 gate/본편 연결은 미구현. 최신 결과의 시각 판정·경계 검수는 위 문서를 따른다. §7은 첫 에디터 시점 이력이다.


### 2026-10-06 결과 씬 보행 정합 보정

저장된 잔류자의 계곡 scene JSON은 초기 허공 통과를 수정해 동측 그림 바닥·계단에 맞춘 34점/반폭2.75tile corridor로 변경했다. 현행 walkable1192 / radius12 BFS1185 / navSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. 원본 PNG/layout와 기본 프리셋 nav4107은 그대로다. 실제 키종주267tiles/158turns/36.445초·오류0, 편집 결과는 본편 미채택. 정확 좌표·시각 한계·검수는 HELL_RIFT_EDITOR_RESULT_20261006.md를 따른다.


## 9. 2026-10-06 — 저장된 틈의 안개·잔불 consumer

공식 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**. `tools/map-scene-rift-ambience.mjs`가 원자료 ANIMVFX의 `field/BANDS`만 소비한다. 원자료 SHA256 `2e1c4decdb189a62df94faaa8c909a4e642dbc98c695f92b8ae4b020f186053f`는 불변. `editor.html`의 `scene-ambient-option`/`scene-ambient`는 **틈의 안개와 잔불** checkbox이며 저장된 틈 계약을 만족할 때만 표시한다. 타일 에디터와 일반 CH1 씬에는 적용0. 실제 높이·NPC·본편 연결은 미구현이다.

### 좌표·활성·렌더 계약

| 항목/id | 코드의 정확 계약 | 적용 위치/상태 |
|---|---|---|
| `supportsRiftAmbience(scene)` | format=`exoduser-map-scene`, version1, status=`ISOLATED_EDITOR_RESULT_NOT_ADOPTED`; world200×200/T40; start4020,7740 / exit4020,1740; navigationReview.basis=`painted-eastern-ledge` | 실패 시 `createRiftAmbience`가 null, 일반 씬은 기존 렌더 유지 |
| sourcePins | painting=`a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4`; abyss=`ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991`; originalNav=`52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb`; nav=`a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` | pin 문자열 비교. 매 프레임 파일 SHA 재계산0 |
| 구조 | west(flat):west-0/1 → east(flat):east-0/1 → centre(flat):centre-0/1 → abyss(flat):rift-depth → foot(foot):west-root/east-horn/south-root → front(flat); layer parallax 전부1, visible boolean | 지정10asset/object 존재, asset source1920²와 경로 일치. rift-depth만 abyss-v3, 나머지 painterly-v2 |
| 제한/유효성 | assets≤128, objects합≤2000; object x/y 절댓값≤40000, rotation절댓값≤360; width/height1…32000; pivot/opacity0…1, flipX boolean; mask3…256점/각좌표0…1; maskFeather0…160/sourceParallax0…1(있으면 mask필수) | nonfinite/변형 계약 실패 시 장식 비활성. 제한은 core 계약을 보수적으로 대조 |
| nav | binary 배열40000칸; 최소 유효 centre1개. radius12 `canWalk`로 tile centre 검사; row run마다 T40 사각 clip | 저장 결과1192칸/155rowruns는 관측값이며 활성 predicate의 고정 count 조건은 아님 |
| world draw | 이미 DPR/viewport transform을 받은 ctx에 world8000² draw. adapter의 translate/scale0 | abyss 객체를 그린 직후 back→ground, foot/actor까지 그린 뒤 front, debug overlay는 이후 |
| mask 변환 | local `(u-pivotX)*width*flipSign`, `(v-pivotY)*height`를 rotation(π/180)→object x/y 이동 | back 실제 abyss polygon clip. `.965`는 그림 source 시차이며 effect에 이중 적용0 |
| ground 캐시 | raw `lifeMs*q/4`, q=0…3에서 footY:size identity22개 수집 → 유효 nav centre의 최소제곱거리점 | nav 배열 참조 교체/brush 재생성 때만 nearest·rowruns·Path2D 재구축. frame당 nearest검색0 |
| front cull | 보이는 foot 객체 polygon 안에 `(particle.x, particle.footY)`가 있으면 제외 | front/foot 레이어 숨김이 front 입자 전체를 끄지는 않음 |
| actor 제외 | x±40, y−96…y+24 rectangle, 입자 bbox overlap cull + evenodd clip | 플레이 중 현재 기존 전사 발 기준. 장식은 scene/input/save 무변 |
| ctx 복구 | source-over, shadowBlur0, save/restore finally | 외부 ctx transform/alpha 누출0 |
| UI/프레임 | reduced-motion이면 기본OFF, reduce로 바뀌면OFF; 해제 때 자동ON0. 수동 toggle 가능. 정지화면 추가 redraw 간격≥1000/30ms; document.hidden이면 추가 redraw0 | 이동 FPS를30으로 제한하지 않음. abyss 숨김은 back+ground 호출을 함께 생략 |
| export/진단 | `render(target,false)`는 장식 제외; `EXODUSER_SCENE_EDITOR.ambience()`는 enabled/stats 읽기 전용 | PNG·JSON·nav·저장키 변경0; checkbox 상태 scene JSON 저장0 |
| 서버 | server.cjs MIME `.mjs = application/javascript` | 이전 octet-stream 반환은 Chrome ESM 로딩 실패. 격리3387만 기존 저장경로로 재시작하여200/import 확인 |
| 정적 검사 출력 | `EXODUSER_RIFT_QA_OUTPUT` 환경변수 우선, 없으면 기존 `final-acceptance` 경로 | test-hell-rift-scene은 장식을 끈 뒤 Undo/pixel 비교. 움직임은 별도 실제 browser 검사 |

### 장식 수치

| band | raw seed | count | lifeMs | RGB | raw parallax/rise/sway | adapter 크기(worldpx 반경) | 개별 alpha cap |
|---|---|---:|---:|---|---|---|---:|
| back | 0x41564258 | 44 | 9000 | 214,120,96 | .965/520/90 | size1.4…3 ×2.4 =3.36…7.2 | .12 |
| ground | 0x47524e44 | 22 | 14000 | 120,128,120 | 1/40/220 | rx=max(48,min(110,size*.4)), size120…300; ry=min(24,rx*.22) | .10 |
| front | 0x46524e54 | 18 | 7000 | 224,123,58 | 1.04/680/60 | size1…2.4 ×2.4 =2.4…5.76 | .10(raw .22를 제한) |

raw fade는 시작15%/마지막30%. ground 위치는 캐시된 nav anchor로 고정되어 raw rise/sway를 추가 이동에 쓰지 않는다. front parallax1.04도 adapter world 위치에 적용하지 않는다. alpha=`min(cap,p.alpha)`이며 back만 `min(1,object.opacity/.38)` 추가곱. .001 이하는 cull. **개별 cap이며 중첩 전체 alpha 상한은 아니다.** back/front radial gradient는 지원 ctx에서만 사용. ground ry 범위10.56…24는 반경이다.

### 검수·제한

core29/29, adapter10/10, 실제 animated browser9그룹, 정적 틈18/18, 기존 editor UI15그룹 PASS. 8카메라 PNG를 root가 실제 열어 확인했고 장식으로 보행 경계가 가려지는 문제는 관측되지 않았다. 큰 갈색 진입면, 확대 원화의 grain·인물 크기·독립 NPC/전경 부족은 남았다. world/source/nav1192와 기존 입력·export 유지, A급 완성은 **VISUAL RETOUCH**. 성능 전체 스트레스·실게임 FPS/native6단계·청취 인수0.

외부 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ambience-integration-20261006/`의 `qa/browser-verification.json`·`static-qa/acceptance-report.json`·`editor-regression/ui-verification.json`·`qa/camera-0…7.png`. 초기 module404/잘못된 MIME 실패는 이력으로 보존하고 현재 PASS와 구분한다. sceneSHA `f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac` 불변. code6+관련 docs를 좁게 checkpoint, 정확 원격 SHA는 외부 receipt로 기록한다.
