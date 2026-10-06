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


## 10. 2026-10-06 — 지옥의 틈 망자 대화 시험

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. `tools/map-scene-rift-dialogue.mjs`가 STORY 원문 `tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json`의 4인/22노드/37선택지를 소비한다. 원문25940B/SHA256 `be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc`/endID `STORY-CH1A-RIFT-DIALOGUE-CANDIDATE-20261006` 불변. 이전 대화consumer0 기록은 그 시점의 이력이다. 현재 구현은 **에디터 세션 내 대사·선택지 미리보기**이며 실제 아이템 지급·퀘스트 등록/완료·장 gate·게임 저장·본편 채택은 미구현이다.

### consumer·수명·상한

| id/변수/API | 정확 코드 계약 | 적용/구현 상태 |
|---|---|---|
| `RIFT_DIALOGUE_LIMITS` | range140/maxRange240/approachStep20/radius12/maxTransitions64/maxRawChars128000/maxNodesPerNpc32/maxOptionsPerNode8/maxTextChars2400/maxCloseReasonChars96 | 거리는 world px, raw는 JSON 직렬화 문자 수, 전이는 한 대화의 노드 진입 수 |
| raw 로드 | HTTP ok, `cache:no-store`/`redirect:error`, Content-Length·실제 body 각≤256000B | 실패하면 warning 후 대화만 비활성, 편집기 시작 유지. JSON 파일 변경0 |
| raw validation | schemaVersion1/sceneId=`hell-rift-ch1-ch2`/roleSTORY/candidate=true/endID 고정; geometry grid200/tile40, NPC정확4/ID·role·stateKeys/actions 확인 | 입력 clone. id 1…96문자, `[a-zA-Z0-9_.:-]`; 일반 text/name/speaker≤160, option label≤320, node본문≤2400; entry1…8/default마지막; 허용 flag1개/참조노드 존재 |
| `supportsRiftDialogueScene(scene)` | §9 supportsRiftAmbience와 승인 원화6crop 계약을 함께 검사 | 생성·nearest/open/choose/snapshot 때 재검증. 메타 pin 비교이며 매 프레임 파일 hash 계산0 |
| 승인 crop/transform | west-0 `(0,0,641,961)`,west-1 `(0,959,641,961)`,east-0 `(1279,0,641,961)`,east-1 `(1279,959,641,961)`,centre-0 `(639,0,642,961)`,centre-1 `(639,959,642,961)` | source px. 객체 x/y/width/height는 해당 crop×25/6, 차이≤1e-6. 해당layer visible=true, rotation/pivotX/pivotY0, flipX=false, opacity1, mask없음. 원화를 이동/확대/회전/숨기면 고정 주민 시험 비활성 |
| `createRiftDialogue(scene,raw,canWalk,anchors)` | exact4개의 `{npcId,x,y}` 외부 주입, x/y 유한수0…8000미만, 중복ID0, 4점 모두 radius12 보행 가능 | 무효면 null. 원문 raw.poi는 실행 위치로 쓰지 않음 |
| `nearest(player,range=140)` | range 유한수>0, max240 clamp; player→anchor 직선 `ceil(distance/20)` 구간과 양끝 radius12 canWalk, 최소거리 NPC | `{npcId,name:{ko,en},x,y,distance}` 또는 null. 점프·벽 너머 대화0 |
| `open(npcId,player,range=140)` | 같은 근접/보행 검사, actual player 참조 유지, entry when flag/default 선택 | 최초 노드 포함 max64. player/scene 접근 불일치 시 닫기; 보행 원위치 보존 |
| `choose(optionId)` | 현재 view의 안정 option id만 처리; 잘못된 요청 null, 64진입 상한에서 추가 기록 전 차단 | 허용 action8: dialogue.close/next, gift.offer/accept/decline, quest.accept/decline/recall |
| 보상·부탁 ledger | `gift:story.berin.keepsake`, `quest:story.nessa.findLin`별 Map 기록1회; `{kind,ref,npcId,name,label:{ko,en},scope:'editor-session-only',actualGrant:false}` | onSuccess는 시험 기록 성공 분기만. 실제 bagFull/등록실패 실행0, onFailure 노드/flag 제약은 구조 검증만 |
| `trialFlags` | rift.haran.met,rift.berin.giftGiven,rift.nessa.questAccepted,rift.dorik.met의 boolean 객체 | gift/quest flag는 기록 존재+성공노드 진입 뒤에만 true. 거절/닫기/루프 실패가 실제 보상을 만들지 않음 |
| `snapshot()` | supported/isOpen/view/trialFlags/trialRecords/lastAction/closeReason/transitions/scope | view=`npcId,nodeId,name,speaker,text,options,terminal,notice`; 선택0노드 terminal=true. detached 표시 자료, scene/raw 쓰기0 |
| `close(reason='manual')` | trim한1…96문자 사유 유지, 무효는manual; 자동종료 inactive-scene/out-of-range/transition-limit | 닫아도 같은controller 시험ledger 유지. scene 객체 교체/import/Undo/nav brush 또는 reload에서 controller 재생성·시험기록 초기화 |

### 주민 위치·표시·시험 플래그

표시 foot은 원화 육안 추정(±6 source px)이며 물리 body/높이 계약이 아니다. logical anchor·접근점은 현행1192nav의 검수 좌표이고 원화 표시와 분리한다. 특히 도릭의 그림 발과 logical anchor 거리는 약195.40px이다. 보행 판정은 logical 좌표만 사용한다. 기존 CH1 마렌/에단/이실라 및 동료 NPC를 대체0, 새 주민 스프라이트0.

| npcId/이름/role | logical anchor world px | 접근점 world px | source visual foot px → visualX/Y | labelHeight world px | flag / 노드·선택 수 |
|---|---|---|---|---:|---|
| rift-rest-haran / 하란 / arrival-guide | 4780,6460 | 4820,6500 | 1132,1552 ×25/6 → 4716.666…,6466.666… | 146 | rift.haran.met / 4·8 |
| rift-gift-berin / 베린 / gift-giver | 6020,5580 | 5980,5620 | 1445,1335 ×25/6 → 6020.833…,5562.5 | 188 | rift.berin.giftGiven / 7·10 |
| rift-request-nessa / 네사 / rescue-request | 6300,5020 | 6220,5020 | 1515,1198 ×25/6 → 6312.5,4991.666… | 175 | rift.nessa.questAccepted / 7·11 |
| rift-prepare-dorik / 도릭 / departure-guide | 5220,2500 | 5180,2540 | 1206,603 ×25/6 → 5025,2512.5 | 71 | rift.dorik.met / 4·8 |

기준 scene SHA `f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac`,nav SHA `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179`/walkable1192/radius12 BFS1185/원본4107 불변. 접근8점의 radius12/start연결과 접근점→anchor4px 간격은 별도 읽기 검수 PASS. 위 고정앵커는 본편 NPC collision 인수가 아니다.

### UI·입력·표시 계약

| id/기능 | 구현 계약 |
|---|---|
| `scene-talk` | 보행 시험 중 가까운 주민1명만 `<이름> · 이야기 듣기 [F]` 버튼과 canvas 이름표 표시. 버튼 클릭/F, 이동WASD/방향키320px/s 그대로. circle6screenpx·line1screenpx·name12screenpx; 이름 y=`visualY-labelHeight-8/zoom`, 실제접근표식은logical좌표 |
| `scene-dialogue` | native showModal/closedialog, aria-labelledby=`scene-dialogue-name`; fixed inset0/margin:auto/height:fit-content로 viewport 중앙. width=min(560px,100vw−32px), maxheight=100dvh−48px/overflow:auto. 리프name/role/text/record만 textContent; options 전용목록만 replaceChildren |
| input lifecycle | 열기/닫기/scene변경/nav편집/blur 때 held keys·space 해제. 대화 중 actor.tick(time,0,0)로 idle. 이동·씬 수정·Ctrl/Meta 저장/Undo 차단, Tab/ShiftTab은 enabled button 목록에서 순환. Enter/Space 기본선택 유지하되 repeat차단, ArrowUp/Down/PageUp/Down/Home/End는 스크롤 허용 |
| 선택/닫기 | 숫자1…9는 현재 존재하는 해당 option 버튼만 선택(노드상한8), Esc/닫기 버튼은 대화만 종료·canvas focus 복귀. 이어서 Esc는 보행종료. 열린대화 pointer/wheel의 canvas편집0 |
| 시험 표시 | `대화 시험 · 선택은 게임에 저장되지 않습니다.` 항상 표시. 기록 badge=`이번 시험의 기록 · 베린의 유품을 받는 선택 / 린을 찾는 부탁 수락` 중 현재 시험 선택만. 실제 지급·퀘스트 완료 문구로 처리0 |
| UI 치수 | dialog padding26px/모바일≤600px 20px; border1/radius9; kicker11px, name24px, role12px, 본문17px/모바일16px·line1.85·margin24/20px. 선택gap9px/padding12×15px/minheight44px/16px·line1.5; 닫기min44px/16px; 이야기듣기font16px/padding11×20px/maxwidth100%−32px |
| UI 부가 | prompt bottom64px/left50%/translateX−50%/z3; footer gap14px/marginTop22px/paddingTop18px/borderTop1px, small11px·line1.5; trialrecord12px·line1.6/leftborder2px/padding10px. ≤600px footercolumn; backdrop#0307069c, dialoggradient#202620→#111713/border#8e7b56 |
| export/진단 | PNG render(overlays=false)는 이름표/대화/장식 제외; JSON와nav에는 대화state 추가0. `EXODUSER_SCENE_EDITOR.dialogue()`는 anchors/state 읽기 전용, open/choose/teleport 노출0 |
| UI 검사 race | `tools/test-map-scene-ui.cjs` reload 대기를 `()=>window.EXODUSER_SCENE_EDITOR?.ready`로 변경 |

대화 테스트15/15, 기존core29/29·안개10/10, 최종 원본UI15그룹 PASS. 별도 Chrome 실제 대화12그룹/4회 보행 PASS: 거리밖F 차단, 하란 분기/재방문, Tab 초점/이동·저장 잠금, 베린 거절/선물시험1회, 네사 거절/부탁·단서, 도릭 상승 안내, reload초기화/일반CH1 비활성, PNG동일·source/nav·저장 불변. pageerror/consoleerror/HTTP≥400 모두0. 390×844에서 대화창358×453.1875px, 위치16,195.40625px(중앙), 선택버튼50px/닫기44px, font16px/가로overflow0. source picture/node/text/geometry 불변.

최초 UI검사 reload ReferenceError, 최초 대화의 Tab초점 실패, 중앙정렬 전 화면은 각각 외부 regression/qa/final-qa 이력으로 보존한다. 최종 accepted-qa와 final-ui의 PASS가 현재근거다. 에디터 일부 변화만으로 실게임/native6단계·실청취·A급인수는0. 원화 grain/주민과전사원근크기/clean plate·독립주민애니메이션/높이/실제지급·부탁·장진행/본편연결은 후속, **VISUAL VERDICT: RETOUCH**.

외부 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/dialogue-integration-20261006/`의 accepted-qa/browser-verification.json·주민별PNG/휴대폰PNG·resident-walk.webm, regression/final-ui/ui-verification.json, receipt.json, related-docs-search.before/after.txt. user의 “작업을해서 저녁까지 보고해”에 따라 오늘2026-10-06 KST19:00 결과보고를 설정했다. 기존4자동화는PAUSED 유지, 오늘만exoduser-2(이채팅 heartbeat)가1시간간격으로 승인 작업을 이어가며 변화없으면알림0/19시보고뒤PAUSED. 이메일·음성발송/기존1분루프 재개0.

## 11. 2026-10-06 — 그림을 움직이지 않는 발 기준 찍기

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. `editor.html` 이미지 씬의 선택 오브젝트에 접지점을 직접 찍는다. 자동 발 추정·NPC 크기 변환이 아니라 수동 편집 도구이며 원본 픽셀과 원화 좌표를 보존한다.

| 항목 | 현행 계약 |
|---|---|
| API | `MapSceneCore.reanchor(o,pivotX,pivotY)` → 분리된 `{x,y,pivotX,pivotY}`. 입력 `o`를 수정하지 않으며 호출자가 한 History 거래에서 적용 |
| 새/기존 pivot | 유한 number, `0…1` 양끝 포함. 오브젝트는 null/배열 제외. 자동 clamp 없음 |
| 기존 좌표/결과 | `x,y`와 반환 `x,y` 각각 유한 `−40000…40000` world px. 범위 밖 결과는 throw하며 기존 scene/Undo/Redo 보존 |
| 크기·회전·반전 | width/height 각각 유한 `1…32000` world px; rotation `−360…360` degree; flipX boolean 필수 |
| 보정 수식 | `s=flipX?−1:1`, `a=rotation×π/180`, `dx=(newPX−oldPX)×width×s`, `dy=(newPY−oldPY)×height`; `newX=oldX+dx×cos(a)−dy×sin(a)`, `newY=oldY+dx×sin(a)+dy×cos(a)` |
| 불변 | bitmap/source/crop/mask/opacity/width/height/rotation/flipX/layer/navigation/start/exit/assets 불변. FOOT의 y 정렬은 새 기준 y를 사용하므로 다른 객체와의 가림 순서는 의도적으로 바뀔 수 있음 |
| 버튼 | `scene-pivot-pick`, width100%, min-height44px, margin-top8px, type=button, aria-pressed. 대기 `⊕ 발 기준 찍기`; 활성 `접지점을 클릭 · Esc 취소` |
| 안내 | 리프 `scene-pivot-hint`: 대기 `그림 위치를 유지하며 접지점을 바꿉니다.` / 활성 `선택한 그림 안의 접지점을 클릭하세요. 그림과 길은 움직이지 않습니다.`. cursor=crosshair; view label `발 기준 찍기 · 선택한 그림 안 클릭 · Esc 취소` |
| 진입 | 선택객체가 있고 레이어 visible/unlocked, 편집 중이며 busy/playing/dialogueOpen이면 진입0. drag 종료·paletteId 해제·held keys/space 해제·canvas focus. 같은 버튼은 select로 복귀 |
| 포인터 좌표 | 현재 레이어 offset을 빼고 `K.local`로 회전/flip을 역변환한 crop 사각형 내 좌표를 width/height로 나눔. 그리드 snap·alpha body 자동검출0. 선택그림 밖 클릭은 toast만, scene/선택/찍기모드 그대로 |
| 적용/취소 | 유효 클릭은 `K.reanchor`의 4필드만 `History.change` 안에 적용 후 select 복귀. toast=`그림 위치를 유지한 채 발 기준을 옮겼습니다`. Esc는 선택/scene 유지하며 찍기만 취소; 일반 선택 Esc의 기존 해제 동작 불변 |
| 모바일 | media max-width760px에서 찍기 진입 시 inspector에 mobile-hidden, 유효 클릭 또는 Esc 후 제거. 390×844 실제 버튼202×44px·가로 overflow0. 지도 클릭 중 속성창이 클릭면을 가리지 않음 |
| 차단/자동 종료 | 선택 소실/레이어 잠금 또는 숨김/보행 시작 때 select로 복귀하고 해당 버튼 disabled. 보행 중 편집0 |
| 저장 | `format=exoduser-map-scene, version=1` 유지, 기존 4필드 직렬화, 새 필드0. tool 모드는 저장0. `exoduser:map-scene:v1` 이외 사용자/본편 저장 쓰기0. JSON round trip/Undo1회/Redo1회 검사 |
| 기존 수동 입력 | pivot-x/pivot-y 숫자 편집은 기존 anchor 좌표 고정 동작 그대로. 새 찍기 도구에서만 bitmap 위치를 보정 |
| 비용/한계 | 클릭 시 수식·History validation만 추가. 매 frame alpha 추출/새 bitmap/mask raster 생성0. 기존 alpha threshold·크기 예산 변경0. 전게임 FPS/대형씬 stress 인수0 |

| 검수 | 실제 근거 |
|---|---|
| core33/33 | 기존29 + arbitrary pivot/회전0·90·−137/flip 양쪽의 world corner·foot·mask 보존, nav/route/v1 보존, 전체 Undo/Redo, 입력·결과 범위 거절의 4그룹 |
| 실제 포인터13 | named Rift 활성/본편 실행0, 밖 클릭·Esc, 정방향/rotation70+flip anchor, Undo/Redo, JSON 왕복, 잠금/보행 차단, 모바일 버튼/실제 지도 클릭/패널 복원/모바일 Esc, immutable pins/save/errors |
| 픽셀 보존 | upright 및 rotated-flipped 각각 변경 전후 PNG bytes 완전 동일; 각 world corner/foot 수치오차 <1e−8. 실제 Chromium 포인터의 요청 normalized 좌표 검사는 1e−6 허용 |
| 검수 이력 | 최초 포인터 요청의 1e−9 기대값이 Chromium 좌표 오차 약 8e−8로 실패. 제품 그림 이동 실패가 아니며 첫 qa 이력 보존. 실제 geometry 기준1e−8/PNG byte 동일은 유지하고 accepted-qa 최종13 PASS |
| 회귀15 | 최종 `tools/test-map-scene-ui.cjs` 기존 저장/alpha trim/aspect/resize/atomic import/보행/레이어/PNG2048/LOCK sketch/모바일 PASS. pageerror0·누락 resource0 |
| 원본 핀 | scene f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac; painting a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4; STORY be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc 불변 |
| 화면 판정 | desktop1500×960 회전/반전 anchor와 mobile390×844 버튼/복원 화면을 직접 열어 검수. 도구 동작은 확인했지만 전체 맵은 VISUAL RETOUCH; 새8camera/native/음성 인수0 |

외부 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/pivot-integration-20261006/`의 before/before-pivot-docs 백업, accepted-qa/browser-verification.json·upright/rotated 전후PNG·workspace/mobile 화면, final-regression/ui-verification.json, related-docs-search.before/after.txt 및 receipt.json. 코드4+관련docs12만 보존한다. 다른 팀 raw/STATE/LOG/WIP, 보호2_3, Q전용 패링, 어택티켓 금지, 사용자세이브·기존23은 유지한다.

**VISUAL VERDICT: RETOUCH**. 새 발 기준 도구는 구현했다. baked 원화 주민의 146/188/175/71px와 전사80px의 원근/크기, clean plate/독립 주민, 실제 지급·부탁·장전환·본편/native/청취는 별도 후속이다. raw 후보6개는 별도 commit `019ba22d3315243a9f60a207672a222c64fef603`로 후보미채택 보존했으며 본 도구에 소비하지 않았다.


## 12. 독립 주민 배경·body·대화 편집 계약 (2026-10-06)

완료 ID `ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006`. 기본 rift preset/원본 결과 씬은 유지하며 새 후보 URL은 `http://127.0.0.1:3387/editor.html?scene=assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`이다. v1 씬 SHA `bc22ad3865dceb1bf801d8e069c23bd76412f74c1a90d0edf6aa9ac62ed64c8d`는 하란 발 가림 이력으로 보존; 현재 v2 SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`만 현재 검수 대상이다.

| 에셋 | 크기·SHA256 | 소비 |
|---|---|---|
| clean-plate-v1.png | 1254² / `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673` | `assets/map/hell_rift/resident_layers_20261006/`, 기존 원화6파트+가림3파트의 source만 교체 |
| resident-atlas-v1.png | 1254² RGBA / `ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38` | 같은 폴더. 2×2 정적 주민4. PixelLab 생성0, 전사/몬스터를 주민으로 재분류0 |
| 원본 painting / abyss / 결과씬 | `a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4` / `ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991` / `f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac` | 원본파일 byte 불변, abyss1920² 유지 |

| asset/object id | STORY npcId | source crop x/y/w/h | 최초 foot x/y | 접근 x/y | 최초 width × height world px |
|---|---|---|---|---|---|
| resident-haran / obj-resident-haran | rift-rest-haran | (169,27,350,578) | (4660,6660) | (4660,6700) | 48.44290657439446 × 80 |
| resident-berin / obj-resident-berin | rift-gift-berin | (748,257,363,352) | (6020,5580) | (5980,5620) | 50.24221453287198 × 48.719723183391004 |
| resident-nessa / obj-resident-nessa | rift-request-nessa | (197,660,262,547) | (6300,5020) | (6220,5020) | 38.318098720292504 × 80 |
| resident-dorik / obj-resident-dorik | rift-prepare-dorik | (813,742,240,465) | (5220,2500) | (5180,2540) | 41.29032258064516 × 80 |

공통 rotation0/flipX=false/opacity1/pivotX=.5/pivotY=1/mask없음. bbox는 atlas alpha>8 기준이며 개별 발뼈·애니메이션·높이 물리 규격이 아니다. width=height*crop.w/crop.h, 베린 height=80*352/578, 나머지 height80. body object의 현재 x/y가 logical/visual foot이고 현재 height가 labelHeight다. 접근점은 위 검수 좌표로 고정하며 body를 이동할 때 자동 재배치하지 않는다. controller는 현재 body의 보행가능 여부와 F범위로 판정한다.

| API/항목 | 정확 계약 |
|---|---|
| build(original) / CLI | `tools/build-hell-rift-resident-scene.cjs` pure clone, build 자체 I/O0. CLI만 원본/그림4핀 검사; 명시 --output 필요, 부모폴더 존재 필요, 기존 파일과 race overwrite는 wx로 거절 |
| source/world | 원화9crop의 x/y/w/h에 `1254/1920=209/320` 곱함, image dimensions1254². 기존 world transform/mask는 변경0. `worldPerSourcePixel=8000/1254`; 심연 source/world 불변 |
| layering | west2/east2/centre2/abyss1/foot7/front0, 전층parallax1. foot.sort='foot', y오름차순으로 전사와 주민/뿌리 삽입. 원본 위에 새 주민을 중복 그림0 |
| RESIDENT_PREVIEW | kind=`independent-resident-preview-v1`, size1254, 새2 src/sha 및 originalPaintingSha256 상수 |
| residentLayerReview | kind/cleanPlate/atlas/originalPaintingSha256/bodyScale=`standing80-seated-source-proportion`/notAdopted=true. sourcePins 원본 lineage 유지+cleanPlate/residentAtlas추가; productionStatus 미채택 유지 |
| residentPaintingProfile(scene) | 원본 lineage+새핀/src/dimensions/6ground registration+foot visible/sort/parallax+4body identity/crop/aspect/foot 검증. near허용차1e-6, body height1…32000, x/y유한0이상8000미만 |
| 변형·숨김 | body mask/rotation/flip/opacity/pivot/비율 불일치, 잘못된 그림/좌표 또는 foot/등록ground숨김은 주민 consumer 비활성. 유효 body 크기·위치 편집은 허용. 원본 baked strict 경로도 유지 |
| 대화 lifecycle | `changed()`가 ambienceScene/dialogueScene=null, closeDialogue('scene-edited'), refresh/autosave. play click에서 endDrag 뒤 syncDialogue. 제자리 x/y/size 편집에도 캐시좌표 재생성; 편집 확정은 시험 세션 기록을 초기화 |
| PNG sampling | overview2048², out 2D context willReadFrequently=true/imageSmoothingQuality='high'. PNG target은 안개·근접 marker·grid/start/exit·선택 UI 제외. 보행 중 export는 player 포함, 보행을 멈춘 전후 export 비교가 byte 동일. JSON 파일/nav/STORY 수정0 |

검수19/15/실제10+수정후targeted8과 최초 실패 보존은 아래 현재 반영 절을 따른다. 첫 PNG 비교의 466픽셀 차이와 종료137, v2 샘플링 전 PNG FAIL은 지우지 않았다. 최종 high sampling PNG byte 일치·숨김/Undo·크기/좌표 재생성·JSON 왕복이 현재 근거다.


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


## 13. 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.
