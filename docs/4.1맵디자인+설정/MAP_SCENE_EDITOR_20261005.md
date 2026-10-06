# 맵 씬 에디터 v1 — 실제 구현·검수 계약

2026-10-05 사용자 최신 지시: 설정 캐릭터 이미지의 크기를 맞추고, 이미지를 재료로 조합하는 맵 에디터를 만든다. 원총괄이 공유 정본 `editor.html`에 레이어 씬 작업 영역을 구현했다. 이전 MAP팀 독립 HTML/WIP의 채택·완료 선언과는 별개다. 현재 버전은 이미지 구성·변형·보행·프로젝트 왕복, 틈 주민 시험대화·환경음 consumer와 Unity 단일 Sprite PNG+.meta 규격 가져오기를 구현했다. 본편 맵 채택·주민 실제지급/quest/save·Unity 전체 기능·native 플레이/청취 인수는 후속이다.

## 1. 실행·파일 소유

| 항목 | 현행 |
|---|---|
| 기본 진입 | `editor.html` — 새 이미지 레이어 씬 작업 영역 |
| 제작 결과 진입 | `editor.html?scene=assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json` — 저장된 틈 구성 우선 로드 |
| 기존 타일 작업 | `editor.html?workspace=tiles` — 기존 타일/방/소환굴/FIXED_MAPS 내보내기 유지 |
| 현재 검수 주소 | `http://127.0.0.1:3387/editor.html` — 실제 checkout의 `server.cjs`, HOST=127.0.0.1, PORT=3387, 격리 save 경로 |
| 다른 서버에서 사용 | 해당 checkout의 `server.cjs`가 서빙하는 `/editor.html`. 사용자3333 서버는 다른 checkout이므로 이번 수정의 검수 주소로 사용하지 않음 |
| 공유 HTML | `editor.html` — UI·모드 분기·외부 씬 스크립트 연결 |
| 구조·수학 | `tools/map-scene-core.js` — validate/decode/encode/local/hit/canWalk/resize/route/History/serializedBytes/projectSource/unityPlacement/placementDefaults/capturePlacement |
| Unity 메타 | `tools/map-scene-unity.js` — 제한된 단일 Sprite TextureImporter 필드 reader, parseMeta |
| 편집·렌더 | `tools/map-scene-editor.js` — preset/asset/변형/레이어/보행/저장·복원·내보내기 |
| 객체 목록·카메라 조회 | `tools/map-scene-object-list.mjs` — inspectLayerObjects/focusObjectFoot, 선택/보기만 제어 (§18) |
| 객체 목록 검수 | `tools/test-map-scene-object-list.cjs` — 신규14/14·실제1회 PASS (§18) |
| 복수 이동 core·검수 | `tools/map-scene-core.js` translateObjects + `tools/test-map-scene-batch-translate.cjs` 신규13/13·실제1회 PASS (§19) |
| 시험 캐릭터 | `tools/map-scene-actor.js` — 기존8방향 전사 idle/walk, 이미지 씬 전용 |
| 화면 | `tools/map-scene-editor.css` — 3열 데스크톱, 760px 이하 속성 패널 토글·상단 액션 가로 스크롤 |
| 검수 | `tools/test-map-scene-core.cjs`, `tools/test-map-scene-ui.cjs`, `tools/test-hell-rift-scene.cjs`, `tools/test-map-scene-unity.cjs` |
| 기존 포크 | `tilemap-editor-src.html`, `docs/4.1맵디자인+설정/tilemap-editor.html` 수정0 |
| 세이브 격리 | 씬 모드에서 기존 초기 슬롯 선택·설정 로드·타일맵 자동저장·draw·game iframe 기동 및 OBJ_DEFS preload/팔레트 생성 차단. `gameFrame.src` 미설정 |

## 2. 원본 해상도와 월드 크기

이미지는 원본 bitmap 크기와 `crop`을 가진다. 배치 객체의 `width/height`는 **월드 px**다. 투명 여백·원본 해상도가 다른 이미지도 월드 너비를 같은 값으로 지정하면 크기를 맞출 수 있다. 기본 발 기준점은 `(pivotX,pivotY)=(0.5,1)`, 회전0°, 불투명도1, 반전false다. 수치 너비/높이 변경은 발 기준점을 유지하며, 모서리 핸들은 회전·반전을 고려해 반대 모서리를 고정한다. 비율 유지 기본 ON, 비율은 필드 편집 시작 시 고정하고 빈 숫자·비유한 값·0 이하 크기는 모델에 반영하지 않는다.

아래 표는 자산별 `placementPreset`이 없을 때의 기본값이다. 명시 저장한 크기·피벗이 Unity 또는 일반 기본값보다 우선한다(§17).

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
| Unity 단일 Sprite PNG+.meta | 각 축1~8192·full crop | 원본width/PPU×world단위 | 현재 잠금해제 층 | 동명2파일, PNG≤10,000,000B/meta≤256,000B, 원본data URI·피벗/PPU metadata 보존 |

제안 층은 카탈로그 메타다. 클릭 배치는 **현재 선택한 잠금 해제 레이어**를 사용한다. 비동기 로딩 중 workspace inert·busy 가드·단축키 차단으로 잠금 검사와 실제 배치 대상이 바뀌지 않는다. 이미지 로드·프로젝트 불러오기·새 씬 시작도 직렬화한다.

일반 이미지의 투명 crop은 원본 ≤16,777,216 pixels에서 alpha>8의 경계를 측정한다. Unity 경로는 원본 full crop을 유지하며 alpha trim을 수행하지 않는다. 그보다 큰 원본은 전체 사각형을 쓴다. 완전 투명한 측정 이미지는 거절한다. file:// 픽셀 읽기 차단 시 기존 세 자산은 검증 crop으로 폴백한다: root-wall `(85,35,1626,827)`, dead-tree `(3,4,61,57)`, glow-mushroom `(7,3,18,27)`. 로컬 HTTP 사용을 권장한다. PNG 내보내기의 file:// tainted canvas 실패는 안내하고 씬을 유지한다.

## 3. 프로젝트 JSON v1

| 필드·제약 | 정확 계약 |
|---|---|
| 식별 | `format='exoduser-map-scene'`, `version=1`, name 비어 있지 않은 문자열 ≤160 |
| world | cols/rows 정수10~300, tileSize 유한수8~128. 기본200×200/T40/8000×8000 world px |
| assets | 최대128, 고유 id·name 문자열 ≤160, width/height 유한수1~8192, crop 필수 |
| src | `assets/` 또는 `img/` 아래 ASCII 경로의 png/jpg/jpeg/webp, `..` 금지. 또는 PNG/JPEG/WebP base64 data URI. 문자열 ≤14,000,000 chars |
| crop | x∈[0,width−1], y∈[0,height−1], w∈[1,width−x], h∈[1,height−y], 소수 허용 |
| placementPreset | assets[] 선택 {kind:'world-placement-v1',width,height,pivotX,pivotY}. 크기 각Number 유한1…32000 world px/피벗0…1. Unity메타 선검증 뒤 다음배치에우선; 기존객체변경0 (§17) |
| unitySprite | assets[] 선택 필드. kind=unity-single-sprite-v1, PPU.001~1,000,000, world단위1~32,000, pivot 각0~1, fullcrop 필수·출력크기각1~32,000. 잘못된 metadata는 import 전 원자거절 (§15) |
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

이 포맷은 기존 FIXED_MAPS/게임 저장 포맷과 다르다. 씬 JSON을 본편 런타임으로 자동 반영하는 bridge는 구현하지 않았다. 외부 PNG/JPEG/WebP와 단일 Sprite PNG+.meta의 PPU·pivot 임포트(§15)는 가능하지만 `.unitypackage`·Prefab·FBX·Unity material/shader 직접 실행·변환은 미구현이다. 이미지 사용권·출처 메타의 별도 카탈로그 확장도 후속이다.

## 4. 레이어·카메라·입력

| 항목 | 동작·기본값 |
|---|---|
| 기본 층 | BACK→GROUND→MID→FOOT→FRONT. 전부 visible=true, locked=false, ground는 두 이미지 프리셋에서 locked=true |
| 층 정렬 | flat=배치 순서. foot=객체 y 오름차순에 시험 캐릭터의 발 y를 병합 |
| 시차 | BACK .965, 나머지1. offset=(viewport center−world center)×(1−parallax). 새 결과 layer는1, 심연 객체 sourceParallax만 .965 |
| 고정 soft mask | 최대8 entry, entry당 image+mask canvas2장/긴 축1024px. 알파 샘플 긴 축256px, smoothing. 최대16 canvas/정사각형RGBA 약64MiB, 기타 원본 이미지 별도. crop/size/polygon/feather stamp 캐시, import 때 clear |
| 자동 카메라 | 8카메라 버튼·보행 시작/이동에 viewport half extent로 월드 경계 clamp. 원본 camera/start/exit·자유 편집 pan 유지 |
| 레이어 편집 | 이름·정렬·시차·가시성·잠금·순서·추가, 객체 레이어 이동/복제/삭제. 복제 offset=(40,40), x/y 최대40000 clamp |
| 시각 선택 | 역회전·반전·pivot를 적용한 객체 좌표, mask polygon 또는 원본 alpha로 투명 여백 선택 방지. foot의 같은y도 렌더 역순으로 나중 객체부터 hit; 활성층 객체 목록의 직접선택 추가 (§18) |
| 타일 맞춤 | 기본 ON, 현재 tileSize 배수에 좌표·모서리 크기 맞춤 |
| 길 브러시 | 반경0~12 tiles, 기본2, 원형 칠하기/막기. 드래그 구간은 T/2 간격 보간 |
| 선택/길/막기 | V/B/E. 시작/출구는 툴 버튼, 월드 범위 clamp |
| 화면 이동·확대 | Space+드래그/가운데 또는 오른쪽 버튼, 휠×1.12/÷1.12, 버튼×1.2/÷1.2, 줌 .025~3. 전체 fit·카메라 프레임 줌은 별도 계산 |
| 단축키 | Ctrl/⌘S 저장, Ctrl/⌘Z Undo, Shift+Z 또는 Y Redo, Delete/Backspace 단일객체 삭제(복수선택중차단), ESC 선택/시험 종료. 입력 필드와 로딩 busy 동안 전역 편집 키 차단. 폼 focusin에서 기존 held 이동·Space 해제 (§19) |
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
| `createRiftDialogue(scene,raw,canWalk,anchors)` | exact4개의 `{npcId,x,y}` 외부 주입, x/y 유한수0…8000미만, 중복ID0. 원본 baked는4점 모두 r12 strict true; 검증된 독립 body는 최소1점 strict true·막힌 주민만 제외(§14) | 구조/profile 또는 생성 보행 조건 무효면 null. 원문 raw.poi는 실행 위치로 쓰지 않음 |
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
| PNG sampling | overview2048², out 2D context willReadFrequently=true/imageSmoothingQuality='high'. §14부터 mask/sample/image 합성 context도 willReadFrequently=true, image 합성 high로 고정. PNG target은 안개·근접 marker·grid/start/exit·선택 UI 제외. 보행 중 export는 player 포함, 보행을 멈춘 전후 export 비교가 byte 동일. JSON 파일/nav/STORY 수정0 |

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


## 14. 독립 주민별 접근 실패와 PNG 마스크 합성 (2026-10-06)

완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 독립 body 이동·편집의 국소 보행 실패를 전체 주민 identity 실패와 구분한다. 원본 baked/proxy의 strict 등록은 유지한다.

| API/상태 | 현재 정확 계약 |
|---|---|
| `independent` | 생성 시 `!!residentPaintingProfile(scene)`. 먼저 `supportsRiftDialogueScene(scene)` 필수. raw/anchors 검증 실패는 어떤 모드도 null |
| anchors | 정확4·서로 다른 기존 npcId·유한 x/y 각각0…8000미만. 독립 모드는 보행 불가 anchor도 구조상 보존하며 원본 모드는 생성 중4점 전부 r12 strict true 필수 |
| `onGround(p)` | `canWalk(scene,p.x,p.y,RIFT_DIALOGUE_LIMITS.radius)===true`; 예외 false. Promise/1/string을 true로 취급0 |
| 생성·`supported()` | 독립 초기 positions.some(onGround)가 false면 null; 이후 strict scene profile과 some(onGround). baked 초기·이후 every(onGround). 플레이 가능한 주민1…4명 범위만 허용 |
| `reachable()` | 기존 range140/max240, distance 및 approachStep20/radius12 유지. 양끝 포함 직선의 각 `canWalk!==true`이면 null. 장애물 밖 다른 주민은 별도 접근 허용 |
| 활성 대화 | 유효 profile·다른 주민은 남았지만 현재 발/접근이 막히면 choose 전에 out-of-range 종료. 모든 발 또는 profile 실패면 inactive-scene. 실패가 기존ledger를 지우거나 새 accept를 만들지 않음 |
| `residentAnchors()` | 현재 strict 독립 anchors 우선. 아니면 `dialogueSceneSupport(current())`가 확인된 씬에서만 RESIDENT_ANCHORS, 그 외 []. dialogue module import 뒤 support를 STORY fetch 전에 저장; STORY 실패와 identity 검증 분리 |
| 마스크 context | mask, feather sample, cached image 모두 CPU readback 요청 `willReadFrequently:true`; 이미지 합성 high smoothing. 기존 sample256/max mask1024/cache8·sourceParallax·rotation/flip/feather 수식 불변 |
| 검수 범위 | 기존 핵심/UI/grounding 검사 재실행0. 변경 관련 의미19/19, 초기 실제3보행의 국소 차단 확인, 합성 뒤 targeted6/6. 최초 PNG FAIL은 별도 보존 |

기획·source 수치·역할별 미인수는 기존 §12/§13과 현재 제작기획서 §16을 유지한다. v2 JSON round trip은 exact deep equal이며 원본 파일에 장애물 시험 좌표4700,6460을 저장하지 않는다. strict profile 오류 opacity .99 시험은 Undo로 복원한다. 기존 광범위 parent textContent 교체/에셋 추가/본편 상태 쓰기0.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| §14 검수 당시 PNG (현행은 아래 주민 환경광 절) | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
## 15. Unity 단일 Sprite PNG + .meta 가져오기 — 2026-10-06

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 격리 editor3387에 저장소의 기존 PNG와 같은 이름의 `.png.meta`를 함께 가져오는 consumer를 구현했다. 이미지 원본·투명 여백을 유지하며 PPU와 피벗으로 배치 크기를 계산한다. 일반 이미지 가져오기의 alpha crop·400world px·pivot(.5,1)은 유지한다.

| 항목/API | 현행 계약 |
|---|---|
| UI | `scene-unity-import` 버튼, `scene-unity-file` multiple input(accept=.png,.meta), `scene-unity-unit` number 입력. 버튼·단위 입력 min-height44px, Unity 버튼 문구는 좁은 패널에서 줄바꿈 |
| 모바일 viewport | 씬 모드에서만 head에 viewport=width=device-width,initial-scale=1 추가(기존 meta가 있으면 유지). workspace=tiles는 추가0. ≤760px 반응형·속성 토글 사용; 확대 금지 설정0 |
| 파일 쌍 | 정확히2파일, 하나 PNG/하나 .png.meta. 이름을 대소문자 무시 비교해 meta.name=png.name+'.meta'. PNG MIME=image/png·≤10,000,000B, meta≤256,000B |
| 텍스트 | fatal UTF-8 decode, `MapSceneUnity.parseMeta(text)`. parser도 UTF-8≤256,000B 확인, 첫 BOM/CRLF 정규화. 제한된 필드 reader이며 일반 YAML·Unity 실행기가 아님 |
| 루트 | `fileFormatVersion=2`, 단일 빈값 TextureImporter mapping. 루트명 허용=fileFormatVersion/guid/timeCreated/licenseType/TextureImporter, 중복 거절 |
| Sprite subset | TextureImporter 바로 아래2공백 `textureType=8`, `spriteMode=1`, `spritePixelsToUnits`, `alignment` 필수. textureShape가 있으면1, spriteBorder가 있으면{x:0,y:0,z:0,w:0} |
| 숫자 | spritePixelsToUnits=PPU 유한수.001~1,000,000. alignment 정수0~9. 소수·부호·exponent 허용, 중복·문자수치·NaN/Infinity·범위밖 거절 |
| Custom 피벗 | alignment9일 때 inline `spritePivot:{x,y}` 필수, x/y각0~1. editor pivotX=x, pivotY=1−y. 0~8은 enum 위치 적용; supplied spritePivot도 유효 범위 검사 |
| 따옴표·부가 필드 | quoted scalar 내부#·escape 보존. plain userData의 apostrophe/따옴표는 일반 문자. 들여쓰기tab·알려진 필드의 가짜중첩·YAML문서/병합/태그/anchor/alias 거절. 기타 importer metadata는 실행·적용0 |
| 원본 crop | `asset(def,false)`, x=y=0,w=원본width,h=원본height. alpha trim0; source data URI를 그대로 JSON에 보존 |
| 단위 | `worldPixelsPerUnit` 기본40world px/Unity단위, 유한수1~32,000. tileSize 변경과 자동 연동0; 가져오기 시 값으로 자산에 고정 |
| 배치 공식 | width=원본width/PPU×worldPixelsPerUnit, height=원본height/PPU×worldPixelsPerUnit. 결과 각각1~32,000world px; 범위밖 자동clamp0·씬 유지 |
| 저장 계약 | assets[].unitySprite={kind:'unity-single-sprite-v1',pixelsPerUnit,worldPixelsPerUnit,pivotX,pivotY}. `MapSceneCore.unityPlacement(asset)`는 선택 metadata를 검증하고 {width,height,pivotX,pivotY} 반환, 일반자산은null |
| Number serialization | Toast uses toFixed(2); JSON retains JS Number values. The 122x69/PPU100/unit40 example stores width=48.8, height=27.599999999999998 (display 48.80x27.60); no rounding/clamping is applied to placement defaults |
| JSON v1 | 기존version1 유지. full crop·PPU·단위·피벗·크기 제한을 validate/import/History에서 검증. malformed metadata/부분crop은 history교체 전 거절; 씬/Undo/Redo 유지 |
| 배치·편집 | 현재 잠금해제 층에 실제 pointer로 위 크기/피벗 배치. 반복 배치와 저장복원 뒤 같은 기본값. 배치후 수동크기/피벗 편집은 기존객체 계약 사용 |
| 원자성·가드 | PNG/meta/단위/decode/PPU 오류에 history·씬 불변. busy는 workspace inert, 보행시험/대화중 Unity버튼 disable 및 filehandler reject. import1회는 Undo/Redo1트랜잭션 |
| 생산 원본 | 기존 `assets/vfx_impact/_unity_preview/Assets/Ultimate Impact Fx/UI/button.png`122×69·8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec / .meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c 불변 |
| 실제 기본 배치 | 위 파일의 PPU100/alignment0/단위40 → 48.8×27.6world px, pivot(.5,.5). Unity source는 QA 임시씬에만 배치; 지옥의 틈 production v2에 채택0 |
| 새 소유 파일 | tools/map-scene-unity.js·tools/test-map-scene-unity.cjs. 기존 editor.html·map-scene-editor.js·map-scene-core.js 수정. parser는 browser global과 명시 VM UMD CJS 호스트 검사; type:module에서 native require('.js') 지원선언0 |
| 미지원 | Multiple/sprite sheet 분할·9-slice·texture import processing/physics·.unitypackage/Prefab/FBX/PSD·Unity material/shader/script·3D/height/runtime bridge |

| alignment | Unity 이름 | editor (pivotX,pivotY) |
|---:|---|---|
| 0 | Center | (.5,.5) |
| 1 | TopLeft | (0,0) |
| 2 | TopCenter | (.5,0) |
| 3 | TopRight | (1,0) |
| 4 | LeftCenter | (0,.5) |
| 5 | RightCenter | (1,.5) |
| 6 | BottomLeft | (0,1) |
| 7 | BottomCenter | (.5,1) |
| 8 | BottomRight | (1,1) |
| 9 | Custom | (x,1−y) |

PPU/단일Sprite의 공식 의미는 [Unity Sprite importer](https://docs.unity.com/en-us/engine/6000.0/manual/materials-and-shaders/textures/textures-reference/texture-type-sprite), alignment 순서는 [Unity SpriteAlignment](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SpriteAlignment.html)를 따른다. metadata의 실제 필드명은 저장소 원본 `spritePixelsToUnits`와 [Unity 공식 source](https://raw.githubusercontent.com/Unity-Technologies/UnityCsReference/master/Runtime/2D/Common/ScriptBindings/Sprites.bindings.cs)의 legacy 이름을 확인했다.


의미검수는 `node --test tools/test-map-scene-unity.cjs` 최종16/16PASS·실제총4회다. 1차 native CJS/ESM loader fixture14실패와2차필수 cameras[]누락fixture2실패는 외부 `first-unit-failure.json`의 실제조건기록(원본전체로그 아님)으로 보존했다. 3차15PASS 후 읽기검수에서 정상 plain userData apostrophe의P2가 발견되어 parser국소수정/회귀1추가,4차16PASS. 기본core33/UI15 등 기존검사 재실행0.

실제3387 브라우저 고유23그룹PASS·headless실행총5회다. 최초16PASS 뒤 cached tree가 request gate를 우회하여 loading완료 이후 정상Undo/Reset이 실행된 harness race를 진단·다운로드JSON으로 보존했다. 두번째진단의 Reset후보조expect실패도 보존; 제품import는 먼저성공했으며 제품수정0. 새plain apostrophe1·실제request-hit를보장한busy/격리sentinel/mobile/protection4·scene-only실제viewport1·잘린Unity버튼문구의 줄바꿈1만 순차검수했다. 이미성공한 다른검사는 재실행0. pageerror/404/foreign-server request0, 생산7파일의최종각run before/after핀불변. root는추가로v2scene/STORY/game 원본핀을대조했다.

390px 실제viewport는 innerWidth/clientWidth/scrollWidth/bodyScrollWidth/visualViewport.width=390, visualViewport.scale=1, media(max-width:760px)=true. 이전 viewport없는축소PNG는 이력으로 유지. actualtap→filechooser→48.8×27.6/pivot(.5,.5)배치와속성열기/닫기 확인, 버튼·단위입력 실제표시≥44px. 최종 Unity 버튼은 실제55px·2줄 텍스트 rect가 영역 안이며 clientWidth=scrollWidth=121px다. root실제데스크톱custompivot/모바일controls·properties·최종captionPNG를시각확인했다. 모바일입력검수PASS를 전체맵재질/전투/본편/native품질PASS로 대체하지 않는다.


전체맵 **VISUAL VERDICT: RETOUCH**. 가져오기 기능의 PASS는 A급맵/Unity전체호환/본편 NPC·실제grant/quest/save·장상승·native6단계·청취 인수가 아니다. 새서버/build/game/Windows/설치/권한/결제/게시/원본재배포0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

## 16. 독립 주민의 발·시작 연결·접근 위치 검사 (2026-10-06)

에디터는 주민을 옮길 수 있었지만, 디자이너에게 현재 발이 막혀 있는지 또는 시작점과 연결돼 있는지 설명하지 않았다. 추가한 도구는 위치/크기를 고친 뒤 inspector에서 수동으로 검사하며 현재 body와 nav를 읽는다. 대화가 여전히 foot을 대상 삼는 구조와 기존 선물·부탁의 시험 ledger는 변경하지 않는다.

| id/API | 입력·결과·제약 |
|---|---|
| `RESIDENT_ACCESS` | frozen radius12/range140/step20/minApproachDistance40/maxCells40000. world tileSize8…128/cols·rows양의정수/셀≤40000/0또는1 walkable/범위 안 유한 start |
| `inspectResidentAccess` | 전달fn 반드시함수. strict residentPaintingProfile + 정확4 residentDialogueAnchors; 원본 baked/generic은 unsupported, 독립 review불일치는 invalid-profile; 함수없음 invalid-query. 모든결과 fresh이며 scene/nav/History/storage 쓰기0 |
| row | `{objectId,npcId,foot:{x,y},footWalkable,startConnected,approach:{x,y,distance}\|null,status}`. `status=foot-blocked\|start-blocked\|no-route\|no-approach\|ready`. 문자열 표시와 반환은 inspector 시험 진단이며 main NPC상태가 아님 |
| 엄격 보행 | 현재foot 및 모든query radius12·canWalk===true. 월드 가장자리 r12초과/Promise/throw/다른truthy는false. 0/1지도와 world를 선검증; 현재주민 좌표는 profile검증을 유지 |
| 시작 연결 | start 및 같은cell center + 사이line 통과해야seed. 4방향 BFS는 center와 edge의 line을 각각 확인. 각line의 sample수=max(1,ceil(distance/20)), i=0…sample로양끝포함. foot도 연결cell center부터line필수 |
| 접근 후보 | 연결된 cell중심으로 foot거리40≤d≤140, distance/y/x 오름차순, candidate→foot line 통과하는 최초점. 고정 historical anchor.approach는 소비0. currentbody를 움직이면 다시 계산. 대화범위140이지만 40최소거리는 편집안내의 여유간격이며 controller 최소거리 변경0 |
| 수명 | 수동 검사 버튼에서만 BFS계산. drag/brush/input/changed/import/Undo 때 캐시null와카드삭제, 다시 검사 전 stale좌표 표시0. API residentAccess()는 결과의 detached clone 또는null. 새 source/nav값 저장0 |
| 화면 | section `scene-resident-access-section`, 버튼 `scene-resident-access-check`, toggle `scene-resident-access-show`, summary role=status/aria-live=polite, 목록 카드 dataset npcId/status. DOM내용은 리프 text만; 지정목록 replaceChildren |
| camera 보기 | objectId로 현재body선택/foot층선택/toolselect/palette해제, viewport x=body.x,y=body.y−60,zoom=min(stageWidth/900,stageHeight/600)·clampCamera. 모바일≤760에서는 inspector닫힘. player/scene/history변경0 |
| overlay | ready `#a4deb9`, 그외 `#f1ba78`; line1.5/zoom·dash5/zoom,4/zoom·range140world·footcross6/zoom·point5/zoom. playing/drag/history.pending 중 off, overlays=false인PNG off. toggle는 UI전용 |
| 접근 제한 | busy/playing/dialogue 중 검사와보기handler차단, workspaceinert/busy 및 검사disabled. 보행 중 overlay off. 모듈load실패는 UI모듈준비불가안내이며 본편/대화 fallback 변경0 |

unit세부와실행로그=`tools/test-map-scene-resident-access.mjs` 및 외부helper-result.json. ready진단은 현재r12/20 샘플링규격의 tile연결과직선접근을 검증하며, 연속 swept collision·카메라전투·상승gate·저장/보상 인수를 주장하지 않는다.

검수한 원본 v2의 접근 안내는 아래와 같다. 현재 연결된 보행 타일 중심에서 계산한 UI 진단값이며, 생산 JSON의 고정 anchor.approach 또는 대화 controller의 최소거리를 바꾸지 않는다.

| npcId | 현재 발 (world px) | 계산된 접근점 (world px) | 거리 | 상태 |
|---|---|---|---:|---|
| rift-rest-haran | (4660,6660) | (4700,6660) | 40 | ready |
| rift-gift-berin | (6020,5580) | (6020,5540) | 40 | ready |
| rift-request-nessa | (6300,5020) | (6300,4980) | 40 | ready |
| rift-prepare-dorik | (5220,2500) | (5220,2460) | 40 | ready |

화면의 no-approach는 발에서 40…140px 떨어진 보행 타일 중심 후보가 없다는 뜻이다. controller는 거리 0에서도 대화할 수 있다. 이 계산 조건을 명시하는 안내문은 ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006에서 반영했다. 접근 계산과 controller 계약은 그대로다.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

## 17. 자산별 다음 배치 규격 — 2026-10-06

선택한 그림의 크기와 발 기준점을 다음 배치에 재사용할 수 있다. 아래 값은 자산에 저장하는 **편집 기본값**이며, 이미 배치된 객체와 원본 그림·투명 crop을 바꾸지 않는다.

| id/API/필드 | 정확 현행 계약 |
|---|---|
| placementPreset | 선택object가참조하는 assets[].placementPreset. kind=`world-placement-v1`, width/height world px, pivotX/pivotY 정규화비율. 이5필드만capture반환 |
| 유효 범위 | width/height 각 typeof Number+finite1…32000, pivotX/pivotY finite0…1. null/array/틀린kind/string/NaN/Infinity/범위밖거절. 추가 metadata의 JSON형식과bytes예산은기존validate사용 |
| placementDefaults(a) | unityPlacement(a)를먼저호출해Unity메타유효성확인. preset유효하면fresh `{width,height,pivotX,pivotY}` 반환, preset없으면기존Unity기본값또는null. 잘못된Unity정보를preset으로우회0 |
| capturePlacement(a,o) | a의Unity유효성·문자열id·o object와정확assetId동일·o의4값검증. fresh `{kind:'world-placement-v1',width,height,pivotX,pivotY}` 반환. 기존a/o쓰기0, a의source/crop전체검증은호출전scene.validate계약 |
| pointer 배치 | 새객체x/y는기존snap·layer시차offset 사용. 새width/pivot은 placementDefaults 우선, 새height도저장값명시적. preset없으면Unity또는builtin너비/일반400·height=width×crop.h/crop.w·pivot(.5,1). rotation0/flipfalse/opacity1·고유objID 유지 |
| 내부·마스크 | internalasset 또는선택mask객체는규격저장·복원UI차단. 잘린합성지형의마스크를새배치에복사한다는기대가생기지않게하며원본분할등록보존 |
| History | 규격저장·복원각1트랜잭션. endDrag 후신선선택/assetId 재확인, 수정후 validate·refresh·로컬씬복구저장. Undo/Redo는동일규격왕복; invalidimport는기존씬/History유지 |
| 복원 | 해당asset의placementPreset 필드만제거. Unity PPU/단위/피벗/원본crop/source, 이미놓인객체의크기·발·좌표는불변 |
| 버튼 | scene-placement-save `이 크기·발 기준으로 다시 배치`, scene-placement-reset `기본 배치 규격으로 복원`. min-height44px, width100%, white-space:normal, 각margin-top8/6px. 선택/잠금/가시성/internal/mask/busy/playing/dialogue조건을버튼과handler에서검사 |
| 안내 | scene-placement-status 리프role=status/aria-livepolite. 저장규격/Unity기본/일반기본의width×height·pivot 표시, 표시만toFixed(3)→Number;JSON은원래Number정밀도유지. 팔레트선택에도현재default표시 |
| 주민 접근 문구 | 발에서40~140px 떨어진보행타일중심으로계산한다는조건을추가했다. 원본검사최소거리40은controller제약이아니며거리0대화가능 |

core 의미검수=`tools/test-map-scene-placement-presets.cjs` 신규14/14·1회PASS. 브라우저측실제일반/Unity·규격pointer·JSON·Undo·복원·guards검수근거는같은완료ID외부영수증을따른다. 본편/NPC다수추가/실제지급이나UnityPrefab/3D물리저장계약은추가하지않았다.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.

## 18. 활성 레이어 객체 목록·발 위치 보기 — 2026-10-06

목록은 현재 층의 **배치 인스턴스**를 보여 준다. 이미지 재료 팔레트나 레이어 이동 메뉴와 역할이 다르다. 승인 원화·독립 주민 등록과 무관하게 유효한 JSON v1 씬에서 사용할 수 있다.

| id/API/필드 | 정확 현행 계약 |
|---|---|
| 파일 | `tools/map-scene-object-list.mjs` 읽기 전용 모듈. 시작 시 dynamic import; 실패하면 목록 오류 안내를 표시하며 기존 씬 시작 경로 유지. `tools/test-map-scene-object-list.cjs`는 신규14그룹 의미검사 |
| inspectLayerObjects | `(scene,layerId,query='',page=0)` → `{layerId,layerName,locked,visible,total,matched,page,pages,rows}`. rows 각 `{objectId,assetId,name,x,y,width,height}` fresh 값; 원본 객체/레이어 배열 참조 반환·쓰기0 |
| 조회 한계 | caller가 전체 scene.validate를 완료한 계약. module은 format=`exoduser-map-scene`/version1/층1…24·층 ID 중복 및 현재층 fields만 검증. 현재층 objects≤2000·객체 ID 중복 거절, id/name/assetId는 비어 있지 않은 문자열≤160, visible/locked boolean, sort flat/foot, parallax 유한0…1. x/y 유한−40000…40000, width/height 유한1…32000 |
| 비용 | 현재 층 정렬/검색만. source image/assets/nav/dataURI 읽기0, 전체씬 clone·validate0, RAF에 목록 query0. refresh·검색·페이지·busy/대화 상태 전환 때만 실행 |
| 검색·페이지 | query 문자열≤160, trim().toLowerCase()를 name/id/assetId의 소문자값에 includes. regex/DOM선택자 해석0. page 유한 정수0…1000000, `OBJECT_LIST_PAGE_SIZE=50`, pages=ceil(matched/50), 끝보다 큰 page는 pages−1. matched0은 page0/pages0/rows[] |
| 순서 | flat: objects 배열 역순. foot: y 오름차순과 동률 원래 index 오름차순 정렬 후 역순. list는 화면의 앞쪽부터 표시한다. `selectAt`도 foot y 오름차순 안정정렬 후 reverse로 수정하여 동일y의 나중 객체를 먼저 검사한다. renderer·원본배열·alpha threshold8·mask hit 변경0 |
| focusObjectFoot | `(scene,layerId,objectId)` exact 현재 객체 조회. world.cols/rows 정수10…300, tileSize 유한8…128. parallax p>0이면 `{x:(o.x−(1−p)×worldWidth/2)/p,y:(o.y−(1−p)×worldHeight/2)/p}` fresh camera 좌표; p0은null. unknown ID/잘못된 필드는 throw, 비유한 camera 거절 |
| focus 한계 | module은 zoom/clamp 없이 발 anchor의 화면중심 해만 반환. root는 zoom=min(stageWidth/900,stageHeight/600)과 기존clampCamera 사용. 월드 가장자리의 clamp 때문에 화면중심이 아닐 수 있다. 객체의 rotation·flip·pivot·원본픽셀·기존 발 좌표를 이동하지 않는다 |
| HTML | scene-object-search(maxlength160), object-summary(role=status/aria-livepolite), object-list, object-prev, object-next, object-page. 행 dataset.objectId, .scene-object-select(aria-pressed), .scene-object-focus(이름+발 위치 보기 aria-label). 새/리프 노드에만 textContent, 지정 목록 replaceChildren |
| 표시 | summary=현재층 이름+matched/total와 숨김/잠금 안내. page=`1 / 2쪽 · 한 번에 최대 50개` 또는 `검색 결과 없음`. 행=이름·assetId·발x/y·width×height, 수치 표시만 소수점2자리 반올림; JSON 정밀도 유지. 활성 층 변경 시 page0, 검색 입력 시 page0, 다른 refresh는 범위 clamp |
| 입력·가드 | search와 prev/next는 busy/playing/dialogue 중 disabled+handler 가드. 행선택/보기는 여기에 locked/!visible 추가, stale layerId와 fresh objectId 확인. p0은 이름 선택만 허용. endDrag 이후 현재 씬 재조회; 새 선택 자체에 History 변경·autosave0 |
| 선택·카메라 | 선택은 selected/layerId 설정, paletteId=null/tool=select, keys/space 해제, palette/refresh. 보기만 viewport 변경·clamp 및 canvas focus. ≤760px에서 보기 뒤 inspector닫힘; 이름선택은 패널 유지. 새목록/페이지 button Enter·Space는 전역Space팬 키 가드의 한정 예외로 기본click 유지 |
| 치수 | 검색/이름선택/발보기/이전/다음 min-height44px. 목록gap7px, 행grid minmax(0,1fr)+auto/gap5px/padding6px/border1px/radius5px, 이름버튼 전체행/줄바꿈, 상세10px·overflow-wrap:anywhere. scene의 일반 CSS/화면예산 유지 |

원본v2/대화STORY/game/주민 ground/access/core와 기존 placement 규격 불변. 가림 때문에 선택이 안 되는 문제를 목록으로 다룬 것이며, 미확정 NPC를 추가하거나 일반이미지를 주민으로 추정하지 않는다. UI 검수와 전체맵 RETOUCH/native/청취 미인수는 분리한다.

### 2026-10-06 — 활성 레이어 객체 목록·직접 선택

완료ID `ROOT-EDITOR-LAYER-OBJECT-LIST-20261006`. 격리 editor3387에서 전경 뒤에 가린 NPC·소품도 이름으로 찾아 직접 선택한다. 이미지를 추가하거나 주민·길을 움직이는 대신 선택과 카메라를 제어하는 제작 도구다.

| 항목 | 현행 계약·인수 경계 |
|---|---|
| 목록 API | `inspectLayerObjects(scene,layerId,query='',page=0)`, 현재 층만 조회, 한 페이지 50행. 검색은 이름/id/assetId에 trim·소문자 includes, 최대160자. page 정수0…1000000, 범위초과는 마지막 페이지; 0매칭은 page0/pages0. fresh rows만 반환 |
| 앞뒤 순서 | flat은 배치 배열 역순, foot은 y 오름차순 안정 정렬 후 역순. 같은 y에서도 나중 배치한 그림이 앞이다. canvas hit도 이 역순으로 수정했으며 alpha threshold8/mask/좌표 변환은 유지 |
| 선택·보기 | fresh layer/object ID 재조회. 선택은 selected/layer/tool/palette/held key 상태만, 발 보기는 시차를 반영한 camera 중심+기존900×600 zoom/clamp만 변경. scene/nav/source/History/autosave/대화 데이터 쓰기0 |
| 가드·화면 | busy·playing·dialogue 및 숨김·잠금 층은 선택/보기 차단. parallax0은 직접 선택만 허용하고 발 보기 차단. 검색/선택/보기/이전/다음 min-height44px, 지정 목록 replaceChildren·리프 text만. Enter/Space는 새 버튼의 기본 활성 동작을 유지 |
| 의미·화면 | 새 의미검사14/14 PASS·실제1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. |
| 보존·Git | code5(editor.html/map-scene-editor.js/css/map-scene-object-list.mjs/test-map-scene-object-list.cjs)+관련docs12 정확17 완료 범위만 정상 checkpoint. 실제 NUL89→72 및 HEAD=remote exact SHA, 타인72/보호8 핀 대조는 외부 receipt. live STATE/LOG·기존23·save·2_3·Q전용·어택티켓금지 유지 |
| 남은 GATE | 도구 선택/입력 검수와 전체 맵을 구분한다. VISUAL VERDICT: RETOUCH. 원화 확대 재질/높이·정적 주민·실제 grant/quest/save/상승·본편 native6단계·실청취 인수는 남아 있다 |

정확 API/UI 계약은 `MAP_SCENE_EDITOR_20261005.md` §18, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은 완료ID. 백업·의미/화면·검색·Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/layer-object-list-20261006/receipt.json`. 새 전문팀/세션/중복 TASK/빌드·게임·서버/Windows/게시0, 기존 paused 자동화와 아침메일 재개0. 오늘19시 단일 보고 조건 유지.

## 19. 활성 층 복수 선택·동시 이동과 입력 초점 경계 — 2026-10-06

| API/UI/경계 | 정확 구현 |
|---|---|
| core API | `MapSceneCore.translateObjects(objects,dx,dy)`, 배열1…2000. 각 객체 plain값의 id/x/y만 읽으며 id 비어있지않은 문자열≤160·중복거절, x/y 유한−40000…40000, dx/dy 유한−80000…80000, 결과x/y 유한−40000…40000. boolean/문자수치/null/비유한/배열객체는 거절. fresh rows `{objectId,x,y}` 전부 검증 뒤 반환, 원본추가field/nav/assets 읽기·쓰기0 |
| 세션 선택 | `batchIds:Set`+batchLayer는 활성층 하나만. `EXODUSER_SCENE_EDITOR.batchSelection()`은 fresh ID 배열 진단; snapshot/JSONv1에 선택/그룹메타0. IDs는 현층에서 재조회하며 삭제된 ID 정리. 검색·50행 페이지에서 선택을 유지 |
| row 체크 | `.scene-object-batch` label(함께 이동), 내부 checkbox dataset.objectId/aria-label=`이름 함께 이동 선택`; 최근 체크를 primary selected로 지정. 해제 시 남은 마지막 ID를 primary로 사용. choose/name 또는 foot-focus는 단일선택으로 돌아가므로 묶음 해제 |
| 모두/해제 | scene-batch-all=현재층 모두선택, 검색/page와무관한 실제objects 전부. 마지막 배열ID를primary로 사용. clear는Set/층만 해제, 기존단일primary는 유지. 둘다endDrag 뒤 fresh층검사 |
| UI 치수 | checkbox label flex/gap8px/min-height44px/margin0, checkbox18²px. 선택rowborder #70cfbc/background#21382e. section 버튼width100%/min-height44px/margin-top6px/줄바꿈, 수치input min-height44px/min-width0 |
| 단일 변형 | 2개 이상 체크 시 TRANSFORM의 input/select/button 및 pivot 찍기/feather/sourceParallax/placement save-reset disabled. property handler/flip/duplicate/delete/object-layer/pivot/savePlacement에서도 다중조건 검사. 묶음 크기·피벗·회전·레이어 이동/삭제를 암묵 수행0 |
| 수치 이동 | scene-batch-dx/dy number입력, min−80000/max80000/default0; 빈 값 거절. snap ON은 공통dx/dy에 Math.round(delta/tileSize)×tileSize 각각1회. OFF는 소수delta 그대로. currentfreshobjects→translateObjects→History.change1→freshIDs에x/y만적용→changed/원래autosave500ms. 두 delta0이면 명시 no-op, History/autosave0 |
| 묶음 드래그 | activegroup 안의 그림을 hit한 뒤 before=`[{id,x,y}]`, 시작world포인터, layerID 보관. resize핸들은 다중에서 비활성. pointermove는 gesture시작에서의 공통delta만 snap1회하고 전원의 결과를 함께적용. 각 객체좌표를 tile에 개별snap/clamp0 |
| 드래그 범위 실패 | 하나라도 ±40000을 넘거나 plan이 거절되면 전원 before좌표 복귀. 연속잘못된입력의toast는 최초1회; 다음유효pointermove에서 다시계산 가능. end/lostcapture/cancel에서 기존validate+History.end, 전체이동 Undo1회·Redo1회. 속성/assets/nav/PNGsource/주민cropprofile값은 변경0 |
| 비용 | fresh객체lookup와 적용은 Map을 만들어 선형처리. pointermove에서 nav BFS/sourcebitmap/wholeSceneClone0. History는 기존begin/end의원자백업을 사용, render는 선택된 각 그림에 기존선택stroke/발표시를 그리되 다중resizehandle0 |
| 선택 해제 | 활성층 변경/import(save=false포함)/UndoRedo/보행 시작/팔레트 클릭/단일 목록choose·focus/다른canvas객체·빈곳hit/Esc 및 walk/block/start/exit툴로전환에서 묶음 해제. canvas에서현재묶음memberhit은묶음 유지 |
| 가드 | busy/playing/dialogue/층locked/!visible 때 체크·전체선택·수치move 불가. clear는busy/playing/dialogue 때불가. freshlayerId/objectId 조회, stale/missing면 move차단. p0은 동일층좌표의공통이동만하며 camera focus는기존계약. import/전체경로/nav편집의기존검증·save격리유지 |
| held 입력 | workspace focusin 대상 INPUT/SELECT/TEXTAREA이면 releaseHeld로 keys.clear+space=false. typingkeydown가드와별개로 이미누른 W/방향키/Space도해제하여 폼입력 중 자동이동/팬 방지. play/player/nav/dialogueController/history/게임save를 변경하지 않음; canvas 새입력은기존규격으로가능 |
| 키보드 | 새list checkbox는 INPUT 기본 Space동작, batch all/clear/move와기존page/list 버튼의 Enter/Space는 전역Space팬가드의한정예외. 다른전역키·Q/E전투계약은불변 |
| 신규검사 | tools/test-map-scene-batch-translate.cjs13그룹1회PASS. fractionalgap/all-or-nothing/2000/원본불변/History1/v2등록·nav보존. UI는 외부 summary/raw report의 고유새그룹·실제launch·첫실패·후속횟수를 따른다. 이전승인suite반복0 |

그룹 이동은 편집 중 x/y의 실제 consumer이며, 원본 후보를 자동 변경하지 않는다. 주민을 움직인 편집씬의 접근 검사와 대화 앵커는 기존 현재body consumer로 다시 계산한다. 승인v2/원화/sourceatlas/보행nav/STORY/game는저장소에서불변. 자동루트수리·높이·그룹정렬/resize·본편exportbridge·실제grant/save는별도 미구현GATE다.

### 2026-10-06 — 여러 그림의 상대 간격을 유지하는 동시 이동

완료ID `ROOT-EDITOR-BATCH-TRANSLATE-20261006`. 격리 editor3387에서 현재 층의 NPC·소품·구조물을 체크해서 함께 이동한다. 같은 이동 거리만 적용하므로 서로의 간격·각 그림 크기와 발 기준은 유지된다.

| 항목 | 정확 현행 계약·인수 경계 |
|---|---|
| 읽기 전용 계산 | `MapSceneCore.translateObjects(objects,dx,dy)` → fresh `[{objectId,x,y}]`. 배열1…2000, ID≤160·중복거절, 입력/결과좌표−40000…40000, 공통dx/dy−80000…80000 유한 Number. 한 개라도 잘못되면 전원 거절; 입력쓰기/개별snap·clamp0 |
| 선택·수명 | 활성층 하나의 UI Set만. 체크/검색/페이지 유지, 현재층 모두선택은 검색과 무관하게 전부. 층 변경/import/UndoRedo/보행 시작/팔레트 선택/단일 목록 선택·보기/다른객체hit/빈곳hit/Esc에 해제. JSON v1에 그룹/선택id 필드 추가0 |
| 소비자 | 수치dxdy와 묶음drag 모두 공통delta에만 tileSize snap1회(OFF면 소수 유지). 한 History로 x/y만 적용, Undo1회 복원. 수치0delta는 History/autosave0. drag 범위 초과는 전원 gesture 시작좌표 복귀; 다음 유효 입력부터 재개 |
| 가드·입력 | busy/playing/dialogue/잠금/숨김/fresh ID 검사. 다중 선택 중 단일 크기·발 기준·회전·mask/규격/복제/삭제/층이동 차단. workspace focusin INPUT/SELECT/TEXTAREA는 held 이동/Space 해제, 씬·대화 상태 쓰기0. 그룹 선택 checkboxlabel와 수치·버튼 min-height44px |
| 실제 검증 | 신규 의미13/13 PASS·최초1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0. |
| 보존·체크포인트 | code5+docs12 정확17 완료 범위만 정상commit/push. actualNUL89→72·원격exactSHA/보호8·타인72 대조는 외부 receipt. 두 담당 STATE/LOG는 본인 소유로 동시 갱신 가능, root덮어쓰기0. 기존23/save/2_3/Q-only/어택티켓금지 보존 |
| 팀 실행 근거 | ROOT-RESTART-FOLLOWUP-20261006-0644. Claude 기존8 실제peer8, 06:48 첫 수집 source6·QA선행1·BOSS대기1은 이력. 06:51:12 수집은 source8·end+idle3(SKILL/BOSS/STORY)·busy5·WriteEdit0·오류0. 완료3은 메모리 diff 미채택; SKILL composer 전체에 BOSS reward HOLD 포함, BOSS count/pet/time-attack 의미 변경 및 STORY save잠금 전 stage·중복confirm 불일치는 추가 검수 대상. Codex7 전문팀 송신은 자동승인심사 거절(approval required, policy never), 새 전달/착수0. 16팀 전원 실행·완료를 선언하지 않음 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 도구 UI/그룹이동 PASS와 환경 재질·높이·정적주민·본편grant/quest/save/상승/native6단계·실청취 미인수 분리. 발 정렬/그룹 크기 변형은 미구현 |

정확 계약=`MAP_SCENE_EDITOR_20261005.md` §19. 가이드§23 MAP PRODUCTION REPORT=`HELL_RIFT_EDITOR_RESULT_20261006.md` 같은ID. 백업·핀·신규검사·화면·docs검색·정상Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/batch-translate-20261006/receipt.json`. 새 전문팀/채팅/실행세션·중복TASK0, 기존paused자동화·아침메일재개0. 오늘19시 단일실제결과보고 조건 유지.


## 20. 독립 주민 재질의 정적 환경광과 실제 축소 품질 — 2026-10-06

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. Claude8가 보존한 ART·ANIMVFX의 memory 제안을 검토해 독립 에디터 renderer에 한정 적용한다. ART의 모든 이미지 smoothing/무제한 축소 캐시 및 ANIM의 ID-prefix·crop-size-only 캐시는 사용하지 않는다. ground bounce와 본편 renderer 적용은 보류한다.

| API·렌더·수치 | 정확 현재 계약 |
|---|---|
| 적용 공간 | editor3387 이미지 씬의 strict `residentPaintingProfile(scene)` 독립4body만. 원본 baked/proxy/CH1/일반 수입 이미지·플레이어는 원래 렌더. `game.html`, source atlas/clean plate/painting, scene JSON/nav/start/exit/world size 쓰기0 |
| 모듈·상수 | `tools/map-scene-resident-lighting.mjs`, `RESIDENT_LIGHTING` deep frozen: sourceSize1254, maxCache4, composite=`source-atop`, stops0/.55/1. `createResidentLighting(makeCanvas=()=>document.createElement('canvas'))`는 frozen prepare/picture/snapshot/clear API 반환 |
| admission | `prepare(scene)`는 render 시작 때1회 strict profile 검사. assets배열≤128/layers배열≤24/총objects≤2000; foot층 정확1/visible/sortfoot/parallax1. resident asset별 정확1·네 body ID 각각전체층에서 정확1; 현재 asset/object 참조만 picture 허용. 임의prefix/복제id/다른src·crop·registration은 추측0 |
| body 추가가드 | 정확 resident-key/obj-resident-key/assetId, atlas source1254²; mask/maskFeather/sourceParallax undefined, rotation0/flipXfalse/opacity1/pivot(.5,1). x/y Number유한0…7999.999999999999, width/height 각각1…32000, crop비율 오차≤1e−6. 전체profile가드 불일치 시 네 body 모두 원래 이미지 폴백. 유효비율 크기·좌표 편집은 기존 값 그대로 소비 |
| crop 하란 | asset=resident-haran, object=obj-resident-haran, source(x169,y27,w350,h578), world 크기·발접지 변경0 |
| crop 베린 | resident-berin/obj-resident-berin, source(748,257,363,352), world 크기·발접지 변경0 |
| crop 네사 | resident-nessa/obj-resident-nessa, source(197,660,262,547), world 크기·발접지 변경0 |
| crop 도릭 | resident-dorik/obj-resident-dorik, source(813,742,240,465), world 크기·발접지 변경0 |
| loaded source | image.currentSrc 또는 src가 정확 상대atlas path 또는 document.baseURI로 해석한 동일절대URL. naturalWidth/naturalHeight 각각1254, complete!==false. src/dimensions/identity가 바뀌면 기존crop 재사용0 |
| crop 합성 | 각원본crop와 같은 w×h canvas를 독립생성, getContext2d `{willReadFrequently:true}`. save→smoothingfalse/globalAlpha1/source-over→원본1:1cropdraw→세로gradient(0,0,0,h)→source-atop fillRect(0,0,w,h)→finallyrestore. 원본 비트맵/알파를 파일에 재작성0 |
| 환경광 세로stop | offset0 `rgba(116,126,130,0.14)`, offset.55 `rgba(116,126,130,0)`, offset1 `rgba(206,120,92,0.16)`. 몸의 기존 알파 안에서 위쪽 중립 냉광→중간 무색→아래쪽 약한 온광. 신규 동적광원/지면lightbounce/가짜 추가그림자0 |
| cache | 키에 현재 object/asset/image 참조+resolved source/src+crop x/y/w/h 전부 비교. 최대4 LRU슬롯; 실패null도슬롯을 차지해 동일입력 build 반복0. 교체전 owned crop backing을 w/h0으로 해제, 성공재사용에서 cropcanvas/URL/key할당0. source이미지메모리나전체FPS개선은 주장0 |
| 수명 | scene참조변경/unsupported profile은 admission/cache 해제. 매prepare로 live in-place crop/body/layer 변경을 확인; picture도 현재body/asset 좁은 검사를 수행. prepare unsupported/import reset은 누적통계유지; publicclear는 통계포함모두0. asset/object참조교체도 해당슬롯 해제 |
| 실패 | canvas/context/builder 오류는 failed++와null을 캐시해 원래draw로폴백. ctx가save된뒤오류면finallyrestore. 새 module import는 별도try로 격리; 조명실패가대화/접지모듈로드를 차단0 |
| 실제 축소 | graded가있는body draw에서 현재target.getTransform의 X basis길이×body.width 또는 Y basis길이×body.height가 해당sourcecrop w/h보다 작으면 target.imageSmoothingEnabled=true/Quality=high. DPR/zoom/회전transform을 포함하며, world크기만으로판정0. 둘다upscale면quality강제0, 일반·pixelart 이미지별기존설정불변 |
| 목적 rect·가림 | gradedcrop draw는 기존 `(-width*pivotX,-height*pivotY,width,height)` 그대로. layer offset/회전/flip/opacity/foot y-sort 유지; target save/try/finallyrestore로 smoothing/alpha/transform/composite다음객체누출0 |
| 정적 PNG | render(target,false)에도 prepare와grade포함. ambient 체크/reduced-motion/animation시간과독립. 기존2048² PNG의 crop/world/그림자배치불변. 예전§14 PNG21b26512…/7018386B는 당시검수 이력, 이 절의 현재PNG와 구분 |
| 진단 | readonly `EXODUSER_SCENE_EDITOR.residentLighting()`→snapshot/null. snapshot fresh `{enabled,profileAdmitted,eligible,cacheSize,builds,hits,failed,entries}`. builds=생성시도, hits=성공재사용, failed=생성실패; entries fresh metadata `{objectId,assetId,src,crop,ready}`만, canvas/image/scene 쓰기노출0 |
| 미포함 | 새그래픽원본/scale자동보정/feet자동이동/지면반사광/3D높이/신규주민애니메이션/지급·부탁save/장gate/본편export·Unity package·Prefab·FBX·PSD/native6·실청취·A급전체맵 인수0 |



### 2026-10-06 — 주민 재질의 정적 환경광 · 현재 PNG와 소비자 범위

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. 현재 독립 주민 렌더 계약은 `MAP_SCENE_EDITOR_20261005.md` §20을 따른다. 앞선 §14의 “현재 PNG”21b26512…·7018386B와 접지/재질 미개선 표기는 해당 시점 이력이다. 현재 PNG는 아래 표이며 원본 atlas·scene·world 크기/발 위치와 본편은 동일하다.

| 항목 | 현행 정확 계약·실제 인수 |
|---|---|
| 소비자 | 독립editor3387의 strict residentPaintingProfile(scene)+exact4body/asset/crop만 정적grade. prefix/다른src/crop/transform/duplicateID/참조불일치는 원래이미지로폴백. 기존원화/atlas/scene/nav/STORY/game/feet/height쓰기0 |
| 페인트 | 원본crop1:1canvas에 세로gradient stop0 rgba(116,126,130,0.14), .55 rgba(116,126,130,0), 1 rgba(206,120,92,0.16)를 source-atop 합성. warmRGB상수로 전구간 계산0; 투명중간stop도실제색보간에 관여. 지면반사광/추가그림자/동적광원0 |
| 캐시·가드 | 최대4슬롯, imageidentity/src/resolvedURL/crop x/y/w/h+object/asset참조검사. 실패null캐시와 원래draw폴백; publicclear는통계도0. prepare render1회,128assets/24layers/2000objects 상한, live profile편집·import/scene교체시무효화 |
| 축소·그리기 | exactsame destinationrect/foot y-sort. actualtargettransform×body크기가 sourcecrop보다작은축이있을때만 해당주민 smoothinghigh. DPR/zoom포함, 일반pixelart·upscale의quality강제0. target와cropcontext finallyrestore. staticPNG에포함, ambient/reducedmotion과독립 |
| 현재 PNG | 2048² / 7018384B SHA `c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21`. 조명OFF동일코드대조는7018386B/21b26512…와exactsame, import/reload 후새PNG동일. 신규변화657pixels=하란222/베린116/네사162/도릭157, 네body rect밖0·최대채널차34 |
| 의미·화면 | 신규unit14/14 actual1/실패0. Chrome고유12 실행항목PASS, actuallaunch3/context4. 최초11PASS+표본harnessFAIL1→2차색보간가정harnessFAIL1→3차미완료group2만PASS. 제품수정0/성공11그룹·이전suite반복0. 오류/404/외부요청0 |
| 픽셀 검증의 범위 | 충분한alpha≥128 RGB표본486/319/348/264개,4251채널·최대오차1.9412/동일per-alpha경계3…4 위반0. source해상도crop alphaMismatch/outsideAlpha/outsideRGB=0의 명시영수증은 하란1명만; 최초중단으로다른3의값은저장되지않아 네명전체alpha정밀인수로계산0. 최종PNG4body영역외0·RGB4명검수는별도실측근거 |
| 시각·GATE | 네원본crop전후board+실제editor300%4명상세·전체맵확인. 주민조명 VISUAL PASS / 전체맵 VISUAL VERDICT RETOUCH. 확대바닥해상도/전체환경재질·높이·정적주민·본편grant/quest/save/상승/native6·실청취·실물폰/A급 미인수 |
| 팀원자료·채택 | ROOT-RESTART-FOLLOWUP-20261006-0644: Claude8기존8 memory전부완료/end8/idle8/write0(06:59:28 이력). ART좁은downsample·ANIM정적bodygrade 제안만 rooteditorconsumer채택; 무제한cache/prefix판정/groundbounce/기타6 wholeDiff·본편채택0. Codex7송신거절(approval required/policy never) 새전달0·재시도/우회0. 전16팀제작완료 선언0 |
| 보존·운영 | code3+docs12 정확15 완료소유만 정상commit/push·원격exactSHA. 실제NUL87→72/타인72status·68bytepin·owner4본인갱신/root쓰기0·검수18sourcepin은외부receipt. 보호2_3/Q-only/어택티켓금지/기존23·세이브보존. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0, 오늘19시 단일실제결과보고 조건유지 |

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-lighting-20261006/receipt.json`. 최초실패2·마지막미완료후속·핀/PNG/화면·docs검색은외부보존. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의동일완료ID 및외부보고서다.

## 21. 선택 이미지의 전사 기준 크기와 실제 화면 해상도 비교 — 2026-10-06

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 독립 editor3387의 크기 편집 결과를 현재 화면에서 읽어 비교한다. 기본 전사 보행 renderer의 BODY_HEIGHT=80 world px를 참조한다. 자동 크기 보정이나 원본 재제작은 수행하지 않는다.

| 항목 | 정확 현재 코드 계약 |
|---|---|
| 계산 모듈 | `tools/map-scene-scale-comparison.mjs`의 `inspectScaleComparison(object,asset,{zoom,rasterScale})`. DOM·scene·source·feet·nav·save·history·cache 쓰기0. 매 호출 fresh plain 반환 |
| 입력 | object/asset/asset.crop/options는 비배열 object. object.width/height, crop.w/h, zoom/rasterScale 6개는 양의 유한 Number만. 문자열/0/음수/NaN/Infinity 거절. getter 오류·파생 overflow도 throw 없이 invalid 반환. editor의 기존1…32000 편집제한은 그대로이며 모듈은 새 hard clamp를 추가하지 않음 |
| 유효 반환 | `{valid:true,referenceHeight:80,heightRatio,world:{width,height},sourceCrop:{width,height},css:{width,height},resolution:{status,scaleX,scaleY,maxScale},bars:{maxHeight:72,reference,object}}` |
| 무효 반환 | `{valid:false,reason,resolution:{status:'invalid',scaleX:null,scaleY:null,maxScale:null}}`. 한국어 사유를 카드에 표시하고 bars/details는 hidden. 씬/선택을 되돌리거나 보정0 |
| 비교 높이 | heightRatio=object.height/80. 표시 영역 높이이며 불투명 몸체·standing pose·충돌 높이를 추정하지 않음. 회전 전 rect 높이, 투명 여백/앉은 포즈에 따라 체감 차이 명시 |
| 막대 | common=max(80,object.height), reference=72*(80/common), object=72*(height/common) CSS px. 나눗셈 먼저 수행해 큰 값 overflow 방지; 둘의 실제 비율을 유지. min-height 보정·별도축척·최소 높이 강제0. 막대는 aria-hidden, 같은 의미의 텍스트 제공 |
| 화면 rect | css.width=world.width*zoom, css.height=world.height*zoom. 회전 전 표시 영역의 CSS px이며 회전 bounding box가 아님 |
| 실제 rasterScale | consumer가 현재 canvas.width/size.w를 전달. renderer ctx.setTransform(d,0,0,d,0,0)의 실제 d와 동일. 캔버스 생성의 min(devicePixelRatio,2) 및 정수 반올림 결과를 이미 포함하므로 별도 DPR cap/추정/height ratio 재적용0 |
| 원본 대비 배율 | scaleX=css.width*rasterScale/crop.w, scaleY=css.height*rasterScale/crop.h, maxScale=max(X,Y). resolutionstatus enlarged는 max>1, native는 max===1, reduced는 max<1. native는 최대축만 정확1인 뜻으로 UI 명시; 다른축도1이라 추정0 |
| 마스크 | Array.isArray(object.mask)이면 status masked, scaleX/Y/maxScale=null. 높이/막대/CSS 크기 비교 유지. 모든마스크의crop배율판정을제외하는UI정책. plain mask는기존directclip/draw, maskFeather또는명시sourceParallax가있을때만별도1024px buffer이므로 모든마스크가버퍼사용이라고설명0. 원본mask·feather·sourceParallax·crop·draw 규칙 수정0 |
| UI 소비자 | `editor.html`의 #scene-scale-comparison 및 명시적 leaf IDs. single selected pair일 때 표시, 다중batch/선택없음/모듈없음이면 숨김. locked/hidden object도 읽기 전용 크기 정보만 표시; 편집금지 기존계약불변 |
| 업데이트 | refresh와 dirty tick에서 현재 선택·width/height·crop·zoom·actualcanvasratio를 다시 읽음. serialized result key가 같으면 leaf/style 재쓰기0. 입력·drag·undo/redo·선택교체·fit/zoom·캔버스resize 갱신. JSON/선택ID/지급/세이브필드 추가0 |
| 포맷 | ko-KR 최대소수3자리. 0<v<.001은 '< 0.001'로 표시하여 양수를0배로 표시0. 모듈 raw값/막대 style은 반올림0. enlarged 카드는 amber 경고·현재 화면에서 흐려질 수 있음을 안내; 인위적 A급/원본 품질PASS 판정0 |
| 실패 격리·진단 | import 별도try/catch 후 카드만 숨김; 기존 에디터 초기화 유지. readonly `EXODUSER_SCENE_EDITOR.scaleComparison()`은 fresh계산/null. source image/canvas/scene 쓰기 참조 노출0 |
| 원본 소비·PNG | 원본 네 resident crop/world80·베린앉은높이/feet·nav·scene·ground/source/renderer 변경0. 이 카드의 숫자는 프로젝트JSON이나 PNG에 들어가지 않음. 이전정적환경광 PNG c0ff307d…/7018384B와 동일 |
| 구현 경계 | 독립 에디터 UI 기능. 이미지 재생성/자동 resize·pivot·crop수리·주민부탁/실지급·본편save/상승·Unity package/Prefab/FBX/PSD·native6·실청취·실물폰/A급전체맵 인수0 |


### 2026-10-06 — 선택 이미지의 전사 기준 크기·원본 대비 화면 배율

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 현행 독립 에디터의 읽기 전용 비교 계약은 `MAP_SCENE_EDITOR_20261005.md` §21이다. 앞선 크기 편집·발접지·조명 계약은 그대로이며 새 카드가 현재 크기와 확대 상태를 설명한다.

| 항목 | 현행 정확 구현·증거 |
|---|---|
| 소비자 | editor3387 single selected object. 높이/전사 기준80, 실제비율72px 막대, world/crop/CSS 크기, X/Y source 배율. refresh/dirtytick 갱신; 다중/선택없음/모듈실패 숨김 |
| 수치 | heightRatio=H/80; bars=72*(80 또는 H)/max(80,H). CSS=W/H*zoom; source배율=CSS*(canvas.width/size.w)/crop.w/h. 최대축 >1 확대경고, ===1 native, <1 축소. 별도DPR cap·min-height·원본 자동보정0 |
| 예외·표기 | mask배열 배율null·선명도판정제외, 높이비교유지. ko-KR 최대소수3/0<값<.001 '< 0.001'. 회전전표시영역·투명여백/포즈의체감차이 명시. 리프DOM만 갱신 |
| 검증 | 신규unit14/14·actual1/실패0. 신규Chrome14/14 고유그룹·actual launch 3/contexts 8, 실패 이력은 외부 원본summary. 이전suite/주민종주/F분기/native6 반복0. QA중제품변경1: 일반마스크도1024buffer를쓰는듯한안내문구만정정, 계산/renderer수정0. 390touch에뮬레이션·실물폰0 |
| 추가 근거의 경계 | 최초11PASS+harness3FAIL→실패05/06/13부분만후속3PASS, 마스크안내문구만별도1증분PASS; actual18 check executions/Chrome3/context8. 최초390px tap/44px/넘침 assertions와화면은보존됐으나callback중단으로수치값은미반환. PNG exact측정은run1/문구정정전이며정정후재export0; 문구는PNG그리기에참여하지않음 |
| 보존 | 원본·feet·geometry·nav·scene/game/source·JSON/history/view-only storage 쓰기0. 현재PNG2048²/7018384B/c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21와 exact동일. 정상code5+docs12 한정checkpoint·actualNUL89→72/원격SHA·타인72status/68pin/owner4본인기록은외부receipt |
| 인수 | 도구 크기비교 UI의 화면/의미 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥확대해상도·실높이·정적주민·본편grant/quest/save/상승/native6·실청취·A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일결과보고 조건유지 |

백업·현재정확핀·화면·실패이력·docs전체검색과disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/scale-comparison-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일 완료ID다. Claude/Codex 전문팀 작업전원완료를 뜻하지 않으며, 이 개선은 root지원 구현을 독립 consumer에 채택한 것이다.

## 22. 주민 접근점에서 보행 시험 시작 — 2026-10-06

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. §16의 현재 시작점 연결 접근 검사를 이용하여, 독립 editor3387에서 선택한 주민 바로 앞의 임시 보행 시험을 시작한다. 아래 버튼은 편집 검수용이며 본편 이동·장 게이트·실제 지급을 승인하지 않는다. 기존 일반 보행은 여전히 scene.start에서 시작한다.

| 항목 | 정확 현재 코드 계약 |
|---|---|
| 준비 모듈 | `tools/map-scene-resident-preview.mjs`의 `prepareResidentPreview(scene,npcId,canWalk)`. 매 진입마다 기존 `inspectResidentAccess`를 fresh 호출. BFS/geometry/반경/좌표 정책 복제0. scene/start/nav/feet/history/storage/player/view 쓰기0 |
| 정확 대상 | rift-rest-haran↔obj-resident-haran, rift-gift-berin↔obj-resident-berin, rift-request-nessa↔obj-resident-nessa, rift-prepare-dorik↔obj-resident-dorik. string ID/독립 profile/mode/유일 row/objectId 일치 확인. 무효 query/profile/unsupported/row/status/getter 예외는 한국어 사유와 ready=false |
| 접근 조건 | ready 상태, footWalkable===true, startConnected===true, foot/approach의 x/y는 유한 Number. 기존 strict canWalk===true·r12·연결 tile중심40…140/step20·40000cell 제한을 재사용. Promise/truthy/throw를 새 성공으로 해석0 |
| 성공 결과 | `{ready:true,npcId,objectId,player:{x,y},foot:{x,y},report}`. player는 현재 fresh 접근점의 좌표 복사. 실패 `{ready:false,reason,report}`; ID 거절 등 검사 전 실패의 report=null. 원본scene.start 수정0 |
| 버튼 | 기존 주민 접근 검사4카드에 `<이름> · 접근점에서 보행 시험`, type=button/data-resident-preview. 상태ready와 모듈/대화 준비 때 사용; 기존 카드 CSS min-height44px 적용. 카드 표시의 이전PASS만으로 진입0, 클릭마다 재검사 |
| 진입 guard | busy/playing/dialogueOpen/drag/history.pending/다중batch>1/모듈·대화자료 미준비이면 handler 즉시 종료. 검사 갱신과 dirty표시는 허용하되 실패 시 player/view/선택/history/scene 쓰기0. 드래그/입력 중 이전 enabled 표시가 남아도 handler guard 적용 |
| 대화 대상 확인 | 새 접근점에서 기존 `dialogueController.nearest(player)`의 npcId가 요청 ID와 정확히 같아야 진입. 다른 주민이 더 가까운 overlap은 한국어 안내 후 거절. 자동대화 open0; 기존 F/이야기 듣기 버튼으로 명시적 대화 |
| 임시 시작 | 동일 scene reference, npcId/objectId/entry, 이전 view/selected/layerId/paletteId/tool/player/batch/batchLayer/inspectorHidden을 내부 origin에 보존. releaseHeld·clearBatch·selected/paletteId=null·tool=select, player=접근점 복사. zoom=min(size.w/900,size.h/600), 중심=player 후 기존 clampCamera. canvas focus, 모바일 inspector hidden |
| ESC·종료 | 대화 열린 동안 첫 ESC는 대화만 종료. 보행 상태의 다음 ESC 또는 보행 종료 버튼은 playing=false/releaseHeld 후 동일scene인 origin의 편집 view/선택/도구/배치/패널 상태를 복구. 원본 start/nav/feet 쓰기0. 평소 일반보행 종료는 origin없음으로 기존동작 유지 |
| 무효화 | changed/Undo·Redo/성공 import/도구전환/일반보행 시작에서 origin 폐기. 실패 import는 기존 검증·이미지 로딩 이전 상태 유지. 성공 import는 새scene에 이전view/선택 복원0. tool변경은 선택한 새tool 유지 |
| 키·초점 | button[data-resident-preview]의 Enter/Space는 전역 이동/space 처리에서 제외하여 native 버튼 활성화 허용. 진입·종료 releaseHeld로 이전키/space 해제. 기존 대화 focus 처리/F repeat 방지 불변 |
| 실패 격리·진단 | 모듈 import 별도try/catch. 실패는 새 버튼 disabled, 기존 접근 검사/에디터 유지. readonly `EXODUSER_SCENE_EDITOR.residentPreview()`는 npcId/objectId/entry 좌표 복사 또는 null. 내부 scene/view/origin 참조 노출0 |
| 출력 경계 | 이 임시 시작점/편집 복귀 정보는 프로젝트JSON·PNG·autosave/history에 추가0. 기본 renderer/조명/정적 주민·바닥/원본 crop·world/nav·게임 코드 불변. 기존 PNG 재export0 |
| 미인수 | 본편지급/quest/save/상승/native6·청취·주민애니메이션·실높이·Unity import·A급전체맵·실물폰은 후속. 390touch viewport는 에뮬레이션, pointer/tap 검사와 직접 DOM click guard 검사는 구분 |


### 2026-10-06 — 주민 접근점에서 임시 보행 시험

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. 현행 정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §22이며, 이전 접근 진단의 읽기 전용 계약은 유지한다. 새 보행 시험 버튼만 transient player/view를 변경하고, 기존 scene.start와 일반 보행 시작은 유지한다.

| 항목 | 현재 구현·인수 경계 |
|---|---|
| 독립 consumer | 접근검사4카드의 이름별 시험 버튼. fresh 시작연결 검사와 nearest 정확대상 확인 후 현재 접근점에서 시작. 자동대화0, F 명시대화·ESC닫기→ESC원편집상태복귀 |
| 조건·수치 | 정확4 NPC/object ID, ready/footWalkable/startConnected/유한좌표. 기존 r12/거리40…140/step20/40000cells 재사용, scene.start 및 nav/feet 불변. 시험zoom=min(stageW/900,stageH/600); 카메라clamp 유지, 카드 min-height44px |
| 조작·수명 | busy/playing/dialogue/drag/pending/multi>1 차단. Enter/Space native 버튼, heldkeysrelease. 성공import/changed/UndoRedo/tool/일반보행은 origin폐기, 실패import 이전상태유지. 모듈실패 새disabled/기존에디터유지 |
| 의미·화면 | 신규unit12/12 actual1 실패0. 신규Chrome 고유12그룹PASS, 실제launch1/contexts3; 원본raw/실패이력은 외부summary. 이전full4walk/분기/scale/old suites 반복0. 직접DOM guard와 actualpointer/390tap 별도기록 |
| 보존·Git | source scene/start/feet/nav/story/game·renderer코드/원본PNG 파일 불변, preview의JSON/history/autosave/user-save쓰기0. 시험중 새PNG에는 현재전사가 포함되는 기존동작 유지·이번export미검수. code3+docs12 정확15 한정checkpoint·actual NUL87→72·원격exactSHA는 receipt. 타인72status/68pins·owner4본인기록 보존/rootwrites0 |
| 시각·남은 것 | 도구 접근점 진입 UI 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥해상도/주민실높이/애니메이션/본편진행·실지급/save/native6/청취/A급/실물폰 인수0. 새팀·실행세션·중복TASK0; paused자동화/아침메일재개0, 19시단일결과보고 조건유지 |

정확코드핀·수정전백업·검색전체/disposition·검사·화면·Git: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-entry-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다. 이 기록은 root지원 구현의 독립 consumer 채택이며 전문팀 전원 제작완료를 의미하지 않는다.

## 23. 보행 시험 버튼의 입력·드래그·로딩 상태 표시 — 2026-10-06

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. §22 완료 시 관찰된 pending/drag/busy의 활성 외형 잔존을 해소한다. 기존 안전 handler는 그대로이며, 화면의 disabled 표시가 현재 guard 상태를 따라가도록 변경했다.

| 항목 | 정확 현재 코드 계약 |
|---|---|
| 캐시 | `residentPreviewButtons` 배열의 현재4카드 `{button,ready:row.status==='ready'}`. 실제 button 참조만 내부 보관. scene/history/player/view/storage 필드 추가0 |
| 캐시 초기화 | `invalidateResidentAccess`와 `residentAccessUI` 시작에서 배열=[]/`residentPreviewBlockedState=null`. 이전 DOM 참조 폐기, unsupported/검사없음/무효mode earlyreturn도 빈캐시 유지 |
| 카드 생성 | 각 preview button의 기존 onclick=`startResidentPreview(npcId)` 유지. 배열push 후 전체4카드 생성 끝에 `syncResidentPreviewButtons()` 최초실행. 이전blocked키가null이므로 새카드 ready/blocked를 적용 |
| 현재 상태 | blocked=`residentPreviewBlocked() || !dialogueController`. busy/playing/dialogueOpen/drag/history.pending/batchIds.size>1/preview·dialogueFactory·dialogueRaw 미준비를 기존guard 그대로 재사용. 계산결과는 boolean |
| 갱신 | `syncResidentPreviewButtons()`는 blocked===이전state면 즉시return. 달라졌을때만 state저장 후 cachedbutton.disabled=blocked||!ready. blocked해제 후에도 row.status!==ready의버튼은 비활성 유지 |
| RAF 비용 | 기존 tick의 updateNearby 뒤·dirty render 앞에서 O(1) guard비교. 동일boolean 동안 disabled DOM쓰기0/DOMquery0/카드재생성0/새BFS0. 상태전이 때만 현재캐시 최대4button의 leaf속성 갱신. 새 RAF/타이머 추가0 |
| 입력 종료 | propertyfocus로history.pending 시작하면 다음기존tick에서비활성. blur/history.end 뒤 기존 changed는 접근결과무효화·카드삭제. 버튼을 억지로 되살리지 않으며 사용자가 다시접근검사하면 fresh4카드 활성. 기존자동저장/History 규칙 불변 |
| 드래그·로딩 | 기존pointerdrag 시작~종료의 표시를 다음tick에 반영. pan종료는현재캐시재활성, 객체·브러시편집drag종료는기존changed의보고서무효화후재검사. busy에서는 기존workspace.inert와표시비활성을 함께 적용. 성공import는 기존report무효화/카드삭제, 새검사 후현재카드활성. 원본geometry/진입좌표/길/renderer 변경0 |
| guard·검수 경계 | 상태변경과다음tick 사이에도 기존handler가진입차단. 접근fresh검사/nearest exactNPC/임시playerview/F/ESC/일반시작/복귀수명 수정0. 이전완료12그룹·unit·F분기/종주/PNG/native6 반복0. 신규단위test0(가역표시만), 새화면상태전이3그룹으로인수 |


### 2026-10-06 — 보행 시험 버튼의 현재 비활성 상태 표시

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. 정확현행계약은 `MAP_SCENE_EDITOR_20261005.md` §23. §22의 pending/drag/busy enabled외형잔존 관찰은 당시이력이며, 이번변경으로 현재표시가 guard와동기화된다.

| 항목 | 현재 구현·검수 |
|---|---|
| 표시 consumer | 현재4카드 button/ready 캐시. report무효화·카드재생성시캐시/상태키 초기화. 기존RAF에서 blockedboolean전이일때만 disabled=blocked||!ready 갱신 |
| 성능·동작 | 동일상태 DOM조회/disabled쓰기/카드재생성/BFS0, 기존tick O(1)비교만. 새타이머0/진입handler·source/player/view/nav/history/storage/renderer·대화 규칙 변경0 |
| 종료 정책 | propertyblur/성공import는 기존report/card무효화 후재검사로fresh활성. pan종료는현재캐시활성복귀, 객체·브러시편집drag종료는기존changed가보고서무효화후재검사. busy workspace.inert 유지. 비ready행은blocked해제후에도disabled |
| 의미·화면 | node --check actual1 PASS; 새unit0. 신규Chrome상태3그룹PASS actuallaunch2/contexts2, 실제propertyfocus·middlepointer·asyncbusy→종료/fresh검사와안정상태leaf쓰기0확인. 별도비활성시각근거1을추가했고 성공3그룹/72·30RAF측정 재실행0. 이전unit12/entry12/분기/종주/native6/PNG재검사0 |
| 보존·Git | code1+docs12 정확13 한정checkpoint·actualNUL85→72/원격exactSHA 외부receipt. 보호24·타인72status/68핀·owner4본인기록 유지, root타인쓰기0 |
| 인수 경계 | 표시 UI PASS, 전체맵 VISUAL VERDICT RETOUCH. 실제높이/바닥해상도·주민애니메이션·본편grant/quest/save/상승/native6·실청취/실물폰/A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일보고 조건유지 |

코드핀·수정전백업·실제화면/원본검사·docs전체검색/disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-state-ui-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID.

## 24. 선택 주민의 배치 규격과 첫 실패 값 진단 — 2026-10-06

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. §12 독립주민 profile의 strict 허용조건을 바꾸지 않고, 수정 중 어느 등록 값이 맞지 않는지 설명한다. 길 연결 PASS와 시각 완성도를 의미하지 않는다.

| 항목 | 정확 현행 계약 |
|---|---|
| 공유 validator | `inspectResidentPaintingRegistration(scene)` → `{supported,valid,profile,issue}`. 기존 `residentPaintingProfile(scene)`은 같은 validator의 `profile/null` wrapper. 기존 BODIES/CROPS/RESIDENT_PREVIEW/anchors/grounding 수치·원자료 unchanged |
| 지원·유효 | `residentLayerReview.kind === independent-resident-preview-v1`에서 supported=true. 알 수 없는 kind는 supported=false/valid=false/profile=null. 모든 기존등록조건 통과시 valid=true/기존profile/issue=null. 실패시 valid=false/profile=null과 첫 issue |
| 첫 실패 대상 | `issue={target,field,actual,expected}`. target=`scene`, `asset:<id>`, `layer:<id>`, `object:<id>`; field는 실제 key/crop.x…crop.h/width/height. 기존 검사순서와 `.find` 첫 일치 정책 유지. 읽기 예외는 scene/read, actual=읽기 실패/expected=검사 가능한 주민 등록 |
| 등록 규칙 보존 | 원화·cleanplate·atlas SHA/1254²·6배경crop 등록/그림피벗0·회전0·반전false·불투명도1·mask undefined, foot visible/sort foot/parallax1,4주민 atlas exactcrop·pivot(.5,1)·rotation0/flipfalse/opacity1/mask undefined. 기존 near 허용오차1e-6; 주민 x/y 유한·0≤값<8000, height 1…32000. standing80 강제/값 자동복구0 |
| 필요한 값 표현 | near 기대값 `{value,tolerance:1e-6}`; x/y `{min:0,maxExclusive:8000,finite:true}`; height `{min:1,max:32000}`. undefined는 문자열 `undefined`; 비유한수는 문자열. actual 복합값은 분리된JSON-safe복사 최대깊이4/최대속성16, accessor·cycle 안전표기. scene 참조 반환0 |
| 선택 UI | known4 object ID obj-resident-haran/berin/nessa/dorik의 단일선택 및 supported만 카드표시. 다른 주민·배경의 첫 실패면 실제 대상의 name/id와 field를 명시. 비주민/다중>1/미지원/모듈없음은숨김. state는 role=status/aria-live polite; current/expected는 JSON정확값·한글field일부 매핑 |
| 갱신·성능 | 기존 refresh/dirty render에서 계산, propertyinput/drag는 기존dirty에 따라 다음tick반영. 결과JSON key가같으면 leaf쓰기0; hidden값이달라질때만 hidden속성갱신. 새로운RAF·timer·BFS·보행query0; 선택당기존등록검사만. 정적유효성은 접근/BFS나품질판정과분리 |
| 소비자·보존 | 읽기전용 `EXODUSER_SCENE_EDITOR.residentRegistration()`에 선택이름/ID와 detached 진단결과. scene/nav/발/크기/원본이미지/대화·History·저장 정책변경0. 실제 property input 자체의 기존편집·autosave/Undo는 유지; 진단이 추가쓰기하지 않음 |
| 검수 경계 | 신규unit 고유14PASS: 최초13PASS/1FAIL(테스트기대값1ULP)→실패그룹만targeted1PASS, unit actual2/기존성공13재실행0. old/new profile540/540 PASS actual1. module syntax1/rootJS syntax2(숨김cache 최종수정후1회), 기존suite/종주/F분기/PNG/native6 반복0 |


### 2026-10-06 — 선택 주민 배치 규격 진단

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. 정본은 `MAP_SCENE_EDITOR_20261005.md` §24. 앞선 크기비교/접근검사/접근점보행/현재비활성표시 계약은 유지된다.

| 항목 | 현재 구현·인수 |
|---|---|
| 신규consumer | 선택한4주민의 배치규격일치/첫실패 대상·field·현재값·필요값 카드. propertyinput에서 다음dirtytick반영, 다른 주민·배경이원인이면 그대상명시. 자동보정/새JSON필드0 |
| 의미·수치 | 공유strictvalidator의 기존허용조건 보존. near1e-6/좌표0≤값<8000/height1…32000/1254²등록/foot sort·parallax1/pivot(.5,1) 유지. 크기80 자동강제0. 읽기전용·BFS0·안정결과leaf쓰기0 |
| 실제검사 | unit 신규14최종PASS actual2(초기테스트기대값1ULP실패1보존→실패1만수정재검사), old/new540동등 actual1PASS; module syntax1/rootJS2 PASS. Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary. 기존성공검사/전체보행/분기/PNG/native6반복0 |
| 채택·Git | 독립editor3387에 code4+docs12 정확16한정정상checkpoint; actualNUL88→72/원격exactSHA 외부receipt. source22핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 그림·scene/start/feet/nav/story/main/save변경0 |
| 인수·남은문제 | 진단UI와전체맵분리, VISUAL VERDICT RETOUCH. 바닥해상도/실높이/정적주민/애니메이션/본편grant·quest·save·상승/native6/청취/실물폰/A급미인수. 전팀생산완료주장0·새팀/실행세션/중복TASK0·paused자동화/아침메일재개0. 19시단일보고조건유지 |

수정전백업·코드핀·docs전체검색/disposition·원본실패/후속·실제화면·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-registration-diagnostics-20261006/receipt.json`. helper unit의 `ROOT-RIFT-RESIDENT-REGISTRATION-DIAGNOSTICS-20261006` raw표기는 이root완료ID에 연결된 지원검사alias이며 별도생산완료가 아니다. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일root완료ID를 따른다.


## 25. 독립 주민의 발 고정 미세 호흡 — 2026-10-06

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. Claude ANIMVFX 공식완료 `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`의 최소 원자료에서 period/amplitude를 소비한 editor3387의 실제 구현이다. 원문의 broad prefix/문자코드 phase와 당시의 오래된 주민 module pin은 그대로 채택하지 않는다. §24 등록 진단/허용조건은 유지한다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| RESIDENT_IDLE_API | 새 `tools/map-scene-resident-idle.mjs`의 `createResidentIdle()` → frozen `{prepare,scaleFor,snapshot}`. `prepare(scene,timeMs,on,excludedIds=[])`는 이전 Map/entries를 비우고 strict `residentPaintingProfile(scene)` 통과 후만 등록한다. 반환 상태는 `snapshot()`으로 읽는다 |
| RESIDENT_IDLE_OBJECTS | `foot` layer에서 `.find` 첫 일치 정확4 객체만: `obj-resident-haran`, `obj-resident-berin`, `obj-resident-nessa`, `obj-resident-dorik` 순서. ID prefix 매칭0. Map의 key는 실제 객체 참조라 같은 ID의 두 번째 객체·일반NPC·다른layer는 scale1 |
| RESIDENT_IDLE_FORMULA | `PERIOD_MS=2600`, `AMPLITUDE=.014`, `PHASE_STEP=.137`. index=0/1/2/3. phase=`(timeMs/2600+index*.137)%1`; scaleY=`1+.014*sin(phase*2*PI)`. 최대 ±1.4%, H80에서 최대1.12 world px, Berin H48.72에서 최대.68208. width/height/x/y/pivot와 source bitmap은 쓰기0 |
| RESIDENT_IDLE_FOOT | strict profile의 pivot(.5,1)·rotation0·flipfalse를 그대로 사용. onscreen drawObject는 translate/rotate/flip 뒤 `scale(1,scaleY)`, pivot origin의 발이 이동하지 않는다. 기존 발그림자·lighting·depth sort는 유지한다. 골격/포즈/걷기 애니메이션 완성으로 계산0 |
| RESIDENT_IDLE_ENABLED | `target===ctx && overlays`에서만 prepare. enabled=`!!ambience && ambient.checked && !reducedMotion.matches && !busy && !drag && !history.pending`. 체크박스를 강제로 켜도 prefers-reduced-motion reduce이면 off. on!==true/비유한 time/excludedIds 비배열/profile실패/읽기예외는 전체clear |
| RESIDENT_IDLE_SELECTION | 선택 ID와 batchIds를 excludedIds로 전달해 해당 주민만 scale1. 다른 주민은 계속 호흡한다. busy/drag/pending은 전체off. 편집 종료 뒤 기존dirty/ambience tick에서 조건이맞으면 재개 |
| RESIDENT_IDLE_EXPORT | offscreen PNG의 target!==ctx에서는 scale하지 않고 prepare/clear도 하지 않는다. 정적 내보내기와 원본 JSON·nav·scene/source bitmap·History·autosave·사용자save 쓰기0. 기존 playing 시 전사 포함 동작은 유지 |
| RESIDENT_IDLE_CLOCK | 기존 ambienceTime/dirty 30Hz 소비만; 새 RAF/timer/redraw0. `EXODUSER_SCENE_EDITOR.residentIdle()` → module없으면 null, 준비되면 detached `{enabled,entries:[{objectId,scaleY}]}`. scene/object 참조 반환0. optional import 실패시 경고·기존editor ready 유지 |
| RESIDENT_IDLE_UNIT | 새 test 파일10/10 PASS·actual1·fail0, editor.js/module syntax각1 PASS. strict profile/주기·진폭/phase/선택/disabled/비유한/duplicate identity/불변snapshot/renderer boundary 검수. 기존14등록unit·540동등·종주/대화분기/native6 반복0 |


### 2026-10-06 — 독립주민 발 고정 미세 호흡 소비자 채택

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. 현행 정본 `MAP_SCENE_EDITOR_20261005.md` §25. 앞선 정적주민·애니메이션 미인수 표기는 당시 이력이다. 이번에 editor의4주민 미세호흡만 구현하며, 골격/걷기/본편 주민 애니메이션은 미인수다.

| 항목 | 정확 현재 구현·검수 |
|---|---|
| 원자료→consumer | Claude ANIMVFX 공식ID `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`/09:18:50.110Z/raw SHA `9e3480641c6a516f1074fb5a6908d8c81919c7ff69326b4fe327ec443f050f17`. 원문·기존pin preserved. root는 최신 strict profile와 exact4 첫 객체/발기준/설정·편집·export gate를 추가하고 phase를 index*.137로 확정 |
| 수치·범위 | period2600ms/amplitude.014, scaleY=1+.014*sin(2PI*((t/2600+index*.137)%1)); index H/B/N/D=0/1/2/3. 최대±1.4%·H80=1.12worldpx·B48.72=.68208. 좌표/원화/JSON/기존등록·lighting·nav값변경0 |
| 동작·보존 | on-screen+overlays에만 prepare/targetctx에만 verticalscale. ambientOFF/reducedON/busy/drag/pending off; selected+batch 해당주민scale1. PNG/offscreen 정적·onscreen Map 보존. module실패 editor유지, 읽기전용 detached snapshot. 기존30Hz만/새RAF·timer0 |
| 실제검수 | 새unit10/10 actual1·syntax각1 PASS. 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작. 새 renderer 영향으로 정적PNG1회 비교·원본결과 raw보존. 기존성공suite/540/종주/F분기/native6 반복0. 영상 인코더 미존재로 영상미제작. 현재시각2스크린/raw256body+640generic/발screen anchor변화0은 browser-qa raw에명시. Canvas scale입력은f32/DOMMatrix곱double; 저장raw 모델오차0·임의tolerance확대0. PNG는이전baseline byte exact, 개별 offscreen matrix는첫1개만검사/4명전부matrix인수로과장0 |
| 실제채택·Git | code3+docs12 정확15경로 정상checkpoint, 실제NUL87→72·원격exactSHA 외부receipt. 수정전백업·보호25핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 본편/game/scene/source원화·세이브 변경0 |
| 팀·실플레이경계 | Claude8는 새공식원자료8개 제출/각1회인계·그중이번ANIM소비자만별도채택. 다른7개는 의존성과 의미검수전 미채택. Codex7 전문팀송신은 자동승인검토거부·actual0이며 담당본인 소스조사만 완료. 전문전원제작/본편완료주장0·새팀/실행세션/중복TASK0 |
| 인수·남은문제 | 전체맵 VISUAL VERDICT RETOUCH. 바닥확대해상도·실높이·골격/걷기·본편grant/quest/원자저장·상승/native6·실청취/실물폰/A급 미인수. paused자동화·아침메일 재개0/19시단일결과보고조건유지 |

백업·코드pin·공식원자료/raw·docs전체keyword검색/disposition·새unit/화면/PNG/영상 존재·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-idle-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다.


## 2026-10-06 남쪽 진입 해상도 상세 후보 v1 — 시각 실패 보존

기존 v2/clean plate1254²/world8000²를 보존한 별도 후보다. generated arrival-detail-v1.png1024×1536을 centre 기존층에 추가한 scene와 [정확 제작·실패 보고](HELL_RIFT_RESOLUTION_DETAIL_20261006.md)를 보존한다. 네 주민 발·nav1192·start/exit·원본 source는 불변이다. native 그림 밀도는 기존 crop 대비 약2.44배지만120%DPR1에서도 약3.13배 확대되어 전체 흐림 해결 완료로 계산하지 않는다. 신규 의미검수10/10 및3387 동일카메라 브라우저2그룹PASS와 별개로 사각 이음새·지형 이동·south-root 전경의 흐린 삼각 조각 때문에 **이 후보 VISUAL VERDICT: FAIL / 본편 미채택**이다. 기존 전체 맵 판정은 RETOUCH를 유지한다. 원본·실패v1 핀과 전후화면은 외부 resolution-detail-20261006에 보존한다. 완료소유 asset2+신규docs1+관련docs6만 정상checkpoint/push하며 root의 현재 후속/타인WIP·ownerSTATELOG·세이브·2_3/Q전용·어택티켓 금지는 보존한다.


## 26. 원형 지형을 보존하는 바닥 재질 상세 레이어 — 2026-10-06

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 전체 재원화 후보 v1의 VISUAL FAIL을 바꾸지 않는다. 그 원자료에서 순수 바닥의 작은 영역만 런타임 재질로 소비하며, 기존 v2의 바닥·절벽·심연 큰 형태와 주민을 유지한다. 가까운 화면의 돌·재 재질 대비를 추가하는 표현이다. 원본 배경의 낮은 픽셀 밀도를 복원한 것이 아니며 전체맵 VISUAL VERDICT RETOUCH를 유지한다.

| id / 위치 | 현행 정확 계약 |
|---|---|
| GROUND_DETAIL_API | tools/map-scene-rift-ground-detail.mjs의 createRiftGroundDetail({loadImage,onReady,makeCanvas?,texture?}) → prepare(scene),draw(target,scene,{enabled}),invalidate(),snapshot(). 로딩 실패·등록 불일치·지원하지 않는 씬은 draw0; 기존 editor ready 유지 |
| GROUND_DETAIL_SOURCE | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 원본1024×1536, 2877605B/SHA a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84. 순수바닥 crop{x:320,y:1120,w:240,h:240}만 사용. 실패 후보의 전체 지형·랜드마크를 올리는 것0; 신규 PNG 생성·기존 PNG 수정0 |
| GROUND_DETAIL_DESCRIPTOR | factory texture는 assets/map/hell_rift/ 하위 PNG 상대경로만 허용하고 .. 차단, sha256 형식64소문자hex·외부 byte pin 보존/런타임 URL·크기 확인(런타임 SHA 계산0). 이미지 width/height 정수1…8192, crop.x/y 정수≥0/crop.w 정수1…1024·h=w·원본범위 내부, worldSpan 유한1…32000, alpha 유한0….45. 출력width/height 정수1…8192·총pixel≤16777216·유한2D 가역transform 필수. descriptor 읽기예외 failclosed |
| GROUND_DETAIL_TILE | crop240²을 런타임480² canvas의4방향 mirror repeat로 구성. crop당 world160, repeat period320. 소스1pixel당 world2/3, 120% DPR1에서는 물리화면.8pixel/sourcepixel. 기존 cleanplate1254²/world8000²의 확대7.6555배는 그대로 남는다 |
| GROUND_DETAIL_COMPOSITE | soft-light/alpha.4. world 좌표 기준 pattern transform, viewport canvas 실제width/height 크기의 offscreen buffer. 카메라·DPR·PNGexport transform 소비. 앞뒤 가림을 지키도록 centre/abyss 이후 foot grounding/주민/전사/foot전경 이전에 합성. target save/finally restore로 ctx상태 보존 |
| GROUND_DETAIL_MASK | 기존 world200×200/tile40/8000²·walkable40000 보존. 보행칸1192로200² mask를 캐시한다. hard 보행alpha255, soft 내부alpha255/4방향 비보행인접·worldedge alpha128/비보행alpha0; soft high-smoothing 뒤 hard nearest mask로 심연 쪽 누출을 막는다. scene/nav reference 변경과 explicit invalidate 후 재구축. 매 프레임40000nav 재검색·새RAF·timer·BFS0 |
| GROUND_DETAIL_GATE | residentPaintingProfile strict 등록을 그대로 사용한다.6배경crop·1254² cleanplate·4주민 atlas/foot·sourcePins 조건의 변경0. strict 주민·분위기 등록 또는 abyss.visible===true/배경·foot visibility 불일치·missing image·image 규격/crop 불일치에서 적용0. 줌 변경은 source 등록 변경이 아니다 |
| GROUND_DETAIL_EDITOR | startup/atomic import에서 prepare await, source로드 onReady에서 기존 dirty만 설정. changed는 invalidate+prepare, 같은walkable배열을 바꾸는 brush는 explicit invalidate. default enabled true; EXODUSER_SCENE_EDITOR.groundDetail() detached 진단, groundDetailEnabled(boolean) view-only A/B 상태. JSON/History/세이브 필드 추가0 |
| GROUND_DETAIL_EXPORT | 정적2048² PNG에도 같은 재질 합성. 기존 발 고정 호흡은 offscreen에 적용0인 상태를 유지한다. sceneJSON/nav/world/start/exit/주민발·높이/원화/atlas/story/main/save 값 변경0 |
| GROUND_DETAIL_LIMIT | 바닥 재질만 개선. 원본의 큰 돌/절벽/뿌리·전경 해상도와 실제높이·본편 grant/quest/atomic save/상승/native6·실청취/실물폰/A급은 미인수 |

검수·실제화면·원본보존·docs검색·Git/원격exactSHA는 외부 /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json 및 browser-qa 근거를 따른다. 19:00 단일 보고는 완료됐고 exoduser-2는 실제 PAUSED이며, 이 변경은 이후 사용자 직접 흐림 개선 요청이다. 기존 paused 자동화/아침메일을 재개하지 않는다.


### 실제 검수 및 잔여 시각 결함

## 2026-10-06 바닥 재질 상세 consumer — 최신 상태

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 지옥의 틈 주민 v2의 원형 지형을 유지한 editor 전용 바닥 재질 consumer를 구현했다. 전체 landscape 재원화 후보 v1의 VISUAL FAIL/미채택은 그대로다. 원본1254² 배경의 픽셀밀도를 복원한 것이 아니며 **전체맵 및 근접 재질 VISUAL VERDICT: RETOUCH**다.

| 항목 | 현행 값 / 실제 근거 |
|---|---|
| 코드 | tools/map-scene-editor.js + tools/map-scene-rift-ground-detail.mjs + tools/test-map-scene-rift-ground-detail.cjs |
| 원자료 / 소비 | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 1024×1536 / crop{x:320,y:1120,w:240,h:240}만 소비. 원자료 전체 맵 채택0 |
| 표현 | 4방향mirror480² pattern, worldSpan160/period320, alpha.4/soft-light. world고정·200² nav mask·비보행alpha0. foot 전경/주민/전사 전 합성. 기본enabled=true, groundDetailEnabled(boolean)은 저장하지 않는 view-only 진단 |
| 등록 / 보존 | strict 주민 v2+분위기 등록+abyss.visible===true. world200²/tile40/8000², nav1192, start(4020,7740)/exit(4020,1740), 기존 주민4 발·높이·원화·atlas·JSON/History 계약 유지. module등록 상세는 MAP_SCENE_EDITOR_20261005.md §26 |
| 새 검수 | unit12/12 PASS 실제1회 + 구문2파일 각각1회. browser Chrome1/context1/page1 기능11PASS·하네스FAIL1(픽셀 QA getImageData 성능 경고3). 재실행0/제품 pageerror·HTTP오류·예기치 않은request실패·API/외부요청0; 원문 및 파생 경고 감사 별도 보존 |
| 실제 화면 | Haran120% 및207.36% 전후, pan 고정, 심연 중앙 변화0표본, 네 주민 접근점→첫F대화→ESC복귀. 선택0/branch0/보상·questcommit0. 정적2048² PNG export1회 |
| 미완료 | 큰돌·절벽·뿌리·불 원본 흐림, 남쪽 뿌리 삼각형 접합, 근접 반복감. 본편 소비/grant·save·상승·실제높이·native6·실청취·실물폰·A급 미인수 |
| docs 검색 | 최초 Markdown302행22문서 검색 원문 경로 충돌 사실 유지; 원문보존 module검색142행28paths, 후속 전체확장자457행23문서 검색→파생 Markdown302행22문서, 현행동기화12/이력보존10/오더STATE보존1/추가consumer충돌0. 원문 재검색·복구 위장0; 보호2_3 매치/수정0 |
| Git / 운영 | 소유code3+docs12만 보존. exact commit/push/remoteSHA·foreign/protected핀은 외부 receipt.json. 19:00 단일보고 완료/exoduser-2 실제PAUSED. 이 변경은 이후 직접 요청 처리이며 기존자동화·아침메일 재개0/새팀·전문팀중복지시0 |

근거: /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json, browser-qa/run1/raw-result.json, browser-qa/root-warning-audit.json, root-visual-review.json, docs-audit-summary.json. 성공검사와 원본이력의 수치/핀은 해당 시점 근거로 보존하며 이번 표현 추가로 과거 결과를 새 PASS로 바꾸지 않는다.

## MAP PRODUCTION REPORT — ROOT-RIFT-GROUND-MATERIAL-20261006

| 항목 | 실제 결과 / 범위 |
|---|---|
| STAGE | 지옥의 틈 주민 v2 독립 editor3387 / 원형 지형 유지 바닥 재질 상세 레이어 |
| MASTER PLAN | 기존 비대칭 균열·남쪽 진입·북쪽 상승로·양측 보행대 유지. 새 지역/큰 지형 변경0 |
| LARGE OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 모두 기존 원화·geometry 유지. 전체 외곽을 새 고해상도로 제작한 것0 |
| LARGE SOURCES / COMPOSITE | 원자료 arrival-detail-v1.png 1024×1536에서 240² 순수 바닥만 사용. 원자료 전체 landscape VISUAL FAIL/미채택 유지. 원형 cleanplate/주민 atlas/foot crop 핀 유지 |
| MEDIUM CONNECTION | 원형 연결 통로·기존 시작/출구 유지. 기존 뿌리 앞쪽 조각의 삼각형 경계와 해상도 대비가 Haran 근접 화면에 남아 있어 RETOUCH |
| GROUND CONNECTION | 보행 1192칸 안쪽만 world period320/alpha.4/soft-light 합성. 발접지·그림자·주민 높이 유지. 원형 큰 돌·뿌리·불 원본 흐림 미해결 |
| PLAYABLE / COMBAT | 시작(4020,7740), 출구(4020,1740), 200²/tile40 nav 원본 유지. 네 주민 접근점에서 첫 F대화 열기/ESC복귀 확인. 본편 전투/보상/장전환·사망부활·재도전은 이번 검수 아님 |
| LANDMARK / CENTER | 균열·북쪽 상승길 primary, 남쪽 주민/불 secondary, 바닥 돌·재 tertiary 모두 큰 위치 유지. 좁은 재질은 반복감이 보이므로 close RETOUCH |
| CAMERA QA | 실제 Haran 120% 및 207.36%, 순수 카메라 pan, 심연 중앙, 정적 전체 PNG 검수. START/EARLY/ARENA/SIDE LEFT/SIDE RIGHT/LANDMARK/LATE/EXIT 전체 카메라 sweep을 새로 수행한 것0 |
| TECH QA — 신규 unit | 모듈12/12 PASS 실제1회, 모듈구문1회 PASS/editor구문1회 PASS. 단위 원문 완료ID ROOT-RIFT-GROUND-DETAIL-20261006은 본 완료ID의 unit 산출 별칭 |
| TECH QA — 실제 browser | 기존 editor3387만 Chrome1/context1/page1. 기능11PASS/하네스FAIL1. 마지막 unexpectedConsole===0 검사가 픽셀 QA의 getImageData 성능 경고3건에 실패한 원본 유지. 제품 pageerror/HTTP오류/예기치 않은 request failure/API요청/외부요청0; 성공 재실행0 |
| TECH QA — 표본 경계 | 120% 보행 표본80818개 변경/비보행0, 207.36% 보행112787개 변경/비보행0, 심연 중앙 비보행21000표본 변화0. 화면 stride3·타일안쪽2worldpx 표본이며 제외 경계/모든pixel의 PASS로 확대0. pan stride5·타일안쪽3worldpx, 8bit 반올림 허용오차2/channel 이내 |
| TECH QA — PNG | 2048² PNG 실제1회. 7042513B/SHA 2c01fb4570311e55e74c746cb6ccb3c826a2db64ce52e8ed7a9fe9a2f13c295c. 보행59201표본 변경/비보행2056714표본 변화0, 타일 경계5.859375worldpx 제외. 원형 PNG byte동일이 아니라 새 합성 결과 |
| TECH QA — 불러오기 / seam / perf | 실패 import 원형유지, 숨긴foot 적용0, navbrush coverage재구축 후undo, source누락3의도실패 후 같은page복구, finalsourcepins exact. 그리기마다40000nav스캔0. 실제FPS/장시간메모리/전체seam PASS를 선언한 것0 |
| FILES | 소유 code3 + docs12. 타인 WIP68 byte핀 및 오더 기록4 상태 보존; 기존23/사용자세이브/보호2_3/main/sourcePNG/씬/atlas/발좌표 변경0 |
| GIT | 정확 소유15만 checkpoint. commit/push/remote exactSHA는 완료 후 외부 receipt.json에 기록. 배포0/자동화·메일 재개0 |
| VISUAL VERDICT | **RETOUCH**. root가 실제120% 전후/207.36% 후/전체 PNG를 봄. 좁은 바닥 재질은 선명해졌지만 원형 환경 흐림, 남쪽 뿌리 조각의 삼각형 경계, 고배율 반복감이 남음. native/청취/실물폰/A급 인수0 |
| NEXT PASS | 원형 contour와 길 위치를 유지하는 바닥·큰돌·뿌리·불 각각의 실제 픽셀밀도 제작, 같은 source 등록으로 앞뒤 가림/접합 맞추기. 본편 아이템 grant/quest/atomic save와 native6·실청취는 별도 미완료 |

원문: 외부 ground-detail-20261006/browser-qa/run1/raw-result.json. root 파생 경고 감사는 browser-qa/root-warning-audit.json이며, 원본11PASS+FAIL1을 대체하지 않는다.

## 2026-10-06 독립 정사영 캐릭터·맵 consumer 포인터

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 이번 독립 `http://127.0.0.1:3387/tools/2_5d-world-lab.html`은 주민v2 scene/cleanplate/기존nav1192를 읽기전용 소비하는 **동측 대표구간**이다. 기존이미지씬에디터의API·저장·Unity package/Prefab/FBX/PSD import 상태·주민/대화consumer를 변경하지 않았다. fullmap/본편교체가 아니다.

| 항목 | 현행범위 |
|---|---|
| 지형 | clipx4300…6560/y3200…4600,50°정사영/scale400,저장원본start4020/7740·exit4020/1740 불변 |
| 높이 | physicalheight UNKNOWN; authoreddepth240/inset90%는 시험 geometry. 실제heightmap/editorheight roundtrip 미구현 |
| 표시 | 전사/실버테일/드루이드12본plane·대표start5480/3740/terrain시험spawn5900/3820; 같은nav질의radius12/clipmargin12 |
| 전경 (최초 이력; 2026-10-07 최신절로대체) | 동측뿔mask11점/footY4320,actor20/40-foreground30 동일transparentpass,겹침시선택페이드opacity.32 |
| 결과 | 실제bone변형/8방향/1회공격/nav밖제한/효과/가림/정지중교체·reset관측. 원화1254²흐림·skirt hardseam **VISUALRETOUCH**,본편native6/청취/NPC실지급·save/상승/완전3D/A급미인수 |

정확맵source/UV/수식/수치/§23 MAP PRODUCTION REPORT는 `HELL_RIFT_2_5D_SLICE_20261006.md`, 캐릭터/공격/효과/UI/실검수는 `../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`를따른다. 현재 MAP v2원자료는editor실행이없는projection검증후보이며실제editorroundtrip 채택으로계산하지않는다. 이전시점의CODE CHANGE NONE은당시조사범위이고이번구현은위별도코드다.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 지옥의 틈 NPC 실제 연결 / 현재 독립 3387 계약 — 2026-10-06T14:38:11.904785+00:00

현재 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전 clip2260×1400/NPC 미연결/실editor 미인수 기록은 당시 관측 이력이다. 이번 lab은 전체8000×8000 원본 nav1192 범위에서 주민4의 원래 발을 표시하고, 기존 대화 consumer와 카메라 추종을 연결한다. 본편 source start/exit·scene/nav·게임·사용자 세이브와 분리한다.

| 항목 | 현재 실제 코드·검수 |
|---|---|
| 소비자 | tools/2_5d-world-lab.html/.mjs + rift-terrain.mjs + scene-registration.mjs + 새 interaction-cue-lifetime.mjs. 기존 주민 billboard 모듈을 실제 연결 |
| 실제 결과 | 최종 Mac Chrome/3387 브라우저 23검사 PASS, pageerror0/HTTP실패0. 원본 atlas 변조 시 ready=false/RAF0. 초기 QA 하니스 오류와 수정 후 최종 PASS를 별도 보존 |
| NPC/대화 | 원본 atlas/발4·displayScale1.8, R대화. 물건 받기1회·재방문 중복0·다른 NPC 부탁 수락을 실제 선택. trialRecords 2, actualGrant=false/editor-session-only. 본편 아이템·퀘스트·save·상승 적용0 |
| 위치 시험 | 원본 NPC foot·nav 불변. 별도 displayApproach로 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500, NPC까지 모두120worldpx. 버튼은 시험 위치 이동이며 전체 여정 실플레이 증거가 아님 |
| 실제 에디터 | 별도 fresh3387에서 저장 버튼 다운로드→그 파일 importProject(...,false)→snapshot 대조. 실제90767B/c508e70d… 원본과 동일. 비동기·입력변조·파일SHA불일치 포함5검사 PASS. lab 현재 editorProvider 없음=PENDING 유지 |
| 시각/영상 | 네 주민 대화·부탁 화면 실제 확인, 캐릭터 겹침 완화. interactive-motion.webm 522811B는 canvas 이동/공격·외형교체 영상이며 DOM대화/소리 미포함. 맵1254² 확대 흐림·hard wedge·마스크 feather 미재현 때문에 VISUAL VERDICT: RETOUCH |
| 남은 Gate | physicalHeight UNKNOWN, NPC 정적billboard, 전용주민리깅·발픽셀IK·본편/native6·보스전 여정·청취·A급 인수0 |
| 팀 현황 | Claude8 기존7 source/end/idle 실제 확인. 완료 raw 누적24(기존17+이번7). public 역할 SKILL/ANIMVFX/MAP/QA4 유지, cue는 ANIMVFX 추가 파생모듈. 신규 MAP/BOSS/STORY/SKILL/QA/ENEMY raw를 일반 본편 소비로 승격0. Codex7 첫 전문송신 자동승인검토 거절/수신0·다른6미송신, ART 기존선택대기; 전원가동 선언0 |

상세 수치·공식·API·원자료 핀·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 이 목표 절을 따른다. 실제 증거는 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json(23), editor-final-result.json(5), actual-editor-export.scene.json, final-rift-*.png, final-nessa-request.png, interactive-motion.webm 및 Git 영수증이다. source/fixture/root browser/native/listening 인수를 서로 대체하지 않는다.

### 실제 저장·불러오기와 format-only 분리

| 항목 | 현재 구현/실관측 |
|---|---|
| public API | async editorRoundtrip(baseline,editorProvider=null); await save(passedClone), await load(saved), 보호payload를변경전baseline과대조. assessRegistration도await |
| format-only | 단순JSON/provider→FORMAT_VERIFIED, realEditor=false. 함수shape나selfdeclaredreal만으로actualeditor PASS0. provider없음PENDING |
| browser provider 조건 | saved는string, kind=browser-export-import, evidence.actualDownload/actualImport/isolatedContext 각각정확true, url=http://127.0.0.1:3387/editor.html, artifactSha256는소문자64hex |
| pin guard | TextEncoder UTF8(saved) SHA256와artifactSha256 대조. 불일치FAIL; save입력변조/비동기load reject/보호payload변조도FAIL |
| 실제 실행 | fresh 격리3387 editor scenequery→scene-save실제download→90767B JSON의 importProject(...,false)→rawsnapshot 대조. artifact SHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a; canonical bytes와동일 |
| 증거 한계 | evidence boolean은암호학적browserattestation아님. root 실제다운로드/실editor실행 기록이이번관측근거. 자동으로모든provider가검수됐다고선언0 |
| UI/link | tools/2_5d-world-lab.html에서 ../editor.html?scene=assets%2Fmap%2Fhell_rift%2Fresident_layers_20261006%2Fhell-rift-residents-v2.scene.json, 새tab/noopener. 원본editor코드변경0. lab로드마다provider를공급하지않으므로metric-editor=PENDING이정확 |
| provenance | 기존MAPv3 raw11746B/e10b79849bdf34230daaaab6c976a759229ee14953ed9d6f467f65e333de555c 유지; rootAdaptation=async save/import + FORMAT_VERIFIED separate from actual browser evidence, adaptationGoal=현재목표 |
| 신규MAP raw | caaf2855…5401B 원본은fakeecho/format승격·실export→import누락 때문에미채택. root 독립수정·실행과구분 |

실editor 새5검사 PASS와 독립lab 최종23검사는 서로 다른 범위다. sourcePNG/씬/nav/보호editor/WIP/세이브를그대로유지한다.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.

### public API·수치·범위

| 위치/ID | 현행 값·계약 |
|---|---|
| entry factory | `createEditorPreviewEntry({readEditor,canonicalBytes,previewPort}) → {enter,cancel,dispose,snapshot}`; readEditor 동기 plain 또는 actual own method handle, Promise/getter/unknown·inherited state 거절; safe JSON copy budget150000/depth64 |
| canonical/payload | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`; bytes최대32000000(32MB), typedbytes copy; payload `{npcId,objectId,x,y}`; public assessRegistration+prepareResidentPreview 소비 |
| host factory | `createEditorPreviewHost({document,window,fetcher,readEditor?,timeoutMs?,pollMs?}) → {open,close,dispose,snapshot}`; sameorigin `tools/2_5d-world-lab.html`; canonical lazy cache; default30000ms/100ms; allowed timeout100..60000ms/poll20..1000ms; 별도RAF0 |
| lab port | `window.__rift25Lab.enterPreview({npcId,objectId,x,y})` sync 성공 frozen `{restore()}`, 실패null; snapshot.previewEntry `{active,token,npcId,objectId,reason}`; radius12/width8000/height8000 nav1192 원계약유지 |
| handle | restore 본인active token1회, oldhandle가새pose덮기0. adapter cancel/dispose/late=restore1+optionaldispose1, 성공교체=old dispose-only; host wrapper restore/release1회; 포커스실패로 승인pose/닫기수명파괴0 |
| DOM ID | scene-preview-25d / scene-preview-25d-panel / scene-preview-25d-frame / scene-preview-25d-status(leaf) / scene-preview-25d-close / scene-preview-25d-title. 부모 innerHTML/textContent 교체0; footerstatus 안전leaf만 갱신 |
| UI 규격 | modal width min1600px/96vw, height/max92vh, radius12px, border1px, close minheight36px; heading16px/line1.5; footer status maxwidth55%/ellipsis. CSS게임수치·발크기변경0 |
| 주민 ID | obj-resident-haran→rift-rest-haran; obj-resident-berin→rift-gift-berin; obj-resident-nessa→rift-request-nessa; obj-resident-dorik→rift-prepare-dorik |
| readonly 경계 | editor scene/nav/start/exit/view/selection 원보존; 게임/저장consumer 호출0. iframe대화 선택은 독립session-only이며 실제 유품grant/quest/save 도입0. 키 격리는 preview모달만이며 기존 본편Q/E/보호2_3 변경0 |


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.


## ROOT-RIFT-MAIN-HOST-PUBLIC-20261007 — 독립 main-context iframe host 현재 계약

기존 선택 주민용 editor preview host와 별개인 main-context public host의 own DOM/iframe 수명을 기록한다. editor scene/nav/start/exit/selection/view를 바꾸는 editor 기능 추가는 이번 범위에 없으며, 실제 본편 admission caller는 별도 소유다.

### 실행 API·입력·수명 계약

이 절의 문서 marker는 `ROOT-RIFT-MAIN-HOST-PUBLIC-20261007`이며, 코드 `MAIN_RIFT_HOST.completionId`는 `ROOT-RIFT-MAIN-IFRAME-HOST-20261007`이다. public host 구현과 별도 진입 gate의 구현·본편 채택은 다른 범위다. 이번 host 검수는 실제 editor3387에서 모의 main-context를 공급한 독립 표시/복귀 검사이며, 본편의 lexical `P/G`와 stage-clear 경로 연결을 인수하지 않는다.

| 항목/API | 현행 코드 계약·수치 | 소유·판정 경계 |
|---|---|---|
| 최종 source | `tools/2_5d/main-rift-host.mjs`, 17683B, SHA256 `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38` | 이전 `6cd3…` 화면 검수와 최종 핀 제한 검수를 구분 |
| factory | `createMainRiftHost({document,window,readContext,timeoutMs,pollMs}) → {enterRift,cancel,dispose,snapshot}`; 반환 API는 shallow frozen | 기본 document/window는 globalThis; document.body/createElement, window.setTimeout/clearTimeout, readContext 함수 필요 |
| host URL | `MAIN_RIFT_HOST.labPath='tools/2_5d-world-lab.html'`, 루트 상대 URL; `allowedPort='3387'`; http 또는 https, 부모/child 동일 origin·정확 pathname | 다른 포트/외부 origin 사용 불가; 본편3333/3340·사용자 save 조작0 |
| 준비 timeout | 기본 `timeoutMs=30000`ms; finite Number `100..60000`ms inclusive, 정수 강제 없음 | loading 상태에만 시간 초과 적용; active 상태의 총 체류 제한 없음 |
| poll | 기본 `pollMs=100`ms; finite Number `20..1000`ms inclusive, 정수 강제 없음; 최초 poll 예약 `0`ms | record마다 outstanding timer 최대1; 자체 RAF0; performance.now() 있으면 사용, 없으면 Date.now() |
| 부모 context 반환 | 동기 own-data plain `{player,character,stage,context,on,stageCleared,status}`; 부모의 정확 Object.prototype 또는 null prototype만 허용; 배열·custom prototype·own `then !== undefined` 거절 | Promise/thenable/필드 accessor 거절; `readContext` 재진입 거절, 예외 시 fail closed |
| player / character | `player`: non-null object, 배열 불가; `character`: 길이>0 string | 실제 lexical caller가 공급해야 함. player 내부 속성·좌표/캐릭터를 host가 deep 검사/복사/child로 전송하지 않음; whitespace-only character도 코드상 거절 규칙 없음 |
| stage / context | `stage`: Number integer≥0, host 자체 상한 없음; `context`: non-null object 또는 string/boolean/finite Number | opaque identity를 엄격 `!==`로 비교하며 object 내부 변경 감시는 없음. 실제 TOTAL_STAGES/difficulty/_charId 허용 계약은 caller gate 책임 |
| on / stageCleared | 정확 `on===false`, `stageCleared===true` | 미클리어·truthy 대체값으로 admission 통과0; host가 G 필드를 만들어 넣지 않음 |
| status | undefined/null 또는 string/boolean/finite Number; 정확 문자열 `dead`, `fallen`, `reviving`, `lastStand` 거절 | 다른 허용 primitive status는 그대로 identity 비교; 사망/부활 의미의 본편 통합 gate와 별도 |
| active context 확인 | 매 poll마다 위7필드를 새 own-data context로 읽고 초기값과 `!==` 비교 | player/context 참조, character/stage/on/stageCleared/status 변경 또는 읽기 실패 시 취소; 부모 객체 쓰기0 |
| enterRift | `enterRift(onExit) → Promise` (resolve: handle 또는 null); onExit 함수 필수. disposed 또는 document.hidden이면 null | 초기 context 거절은 UI 생성0·null; return handle은 표시 준비 증거이며 continue/nextStage job 아님 |
| 중복 호출 | current loading/active에서 같은 onExit 함수+같은 fresh context이면 동일 job 반환, 추가 iframe0 | 다르면 `superseded` 종료+알림 뒤 이번 호출 null; 새 admission의 명시적 재호출 필요 |
| 재시도 | failed record가 있으면 `failed-retry`로 정리 후 새 context 검사·새 token 발급 | 오류 dialog 보존은 valid gate handle을 뜻하지 않음 |
| child port | own `__rift25Lab`의 own `snapshot` 함수 호출; 반환은 정확 `child.Object.prototype` 또는 null prototype의 동기 plain own-data | 같은 origin iframe도 별도 realm. 부모 Object.prototype과 억지 비교하지 않고 custom prototype은 계속 거절 |
| 준비 성공 | child snapshot `ready===true`, error falsy, disposed/contextLost 정확 true 아님; 현재 record의 loaded/path/identity 유효 | active 상태 `ready!==true`, port 상실 또는 경로 변경은 실패; child snapshot truthy error도 실패 |
| handle | once-owned frozen `{restore(),dispose()}` | restore는 최초만 close `restored`, 반복/해제 후 false. dispose 최초 true·반복 false; 이미 restore된 handle의 최초 dispose도 true일 수 있으나 재종료0 |
| 늦은 handle / focus | handle은 자기 record만 닫음; settle은 record별1회, 이미 닫힌 record 재정리0 | 기존 연결된 focus 대상·같은 ownerDocument·fresh sameContext·더 새 current가 없을 때만 focus 복원; 새 token의 dialog/focus 침범0 |
| close cleanup | own timer clear, iframe load/error 및 dialog cancel/close listener 제거; own iframe src=`about:blank`, own dialog close/remove | child가 기존 pagehide에서 WebGL/RAF/resources 정리; parent가 borrowed renderer/DOM을 dispose하지 않음 |
| onExit | 사용자 종료·자동 취소/로드 실패를 record별 최대1회 통지; sync throw 또는 returned rejection은 `notificationErrors++` | callback 반환을 기다려 continue하지 않음. restore/handle.dispose/cancel/host.dispose는 notify0; 실패 알림 `load-failed`는 오류 dialog를 자동 제거하지 않음 |
| cancel / dispose | `cancel()` → current close `cancelled`+focus 복원 요청, notify0; 없으면 false. `dispose()` 최초 true, 반복 false; `host-disposed`, own listeners 제거 | module dispose는 focus 복원0·notify0. pagehide는 dispose 호출; 부모 blur 취소 listener0 |
| 실패 formatter | Error의 non-empty string message만 사용; instanceof 또는 message getter 예외도 catch; fallback `UNKNOWN · 지옥의 틈 표시 실패` | null throw/악성 message getter 때문에 settlement/cleanup가 깨지지 않음 |
| 실패 UI | phase `failed`, timer0, Promise null로1회 settle, leaf status에 오류 표시, exit leaf를 `닫기`로 교체 | 검토용 own dialog는 유지; 유효 handle/본편 완료로 승격0 |
| 입력 keyboard | 부모 capture keydown/keyup에서 current가 살아있으면 stopImmediatePropagation; Escape keydown&&!repeat는 preventDefault+종료 | Tab/Enter/NumpadEnter/Space는 native 동작 보존; 그 외 preventDefault. child iframe 이벤트는 별도 window이며 부모에 bubble하지 않음 |
| 입력 pointer | capture/passive:false 9종: pointerdown, pointerup, mousedown, mouseup, click, dblclick, touchstart, touchmove, wheel | own exit의 click만 user-exit; exit/frame 외 대상 preventDefault. listeners는 module dispose에서 제거 |
| visibility / blur | 실제 document.hidden이면 `parent-hidden`; pagehide는 host dispose; 부모 blur만으로 취소0 | native parent blur 관측 PASS; 실제 hidden 전환은 이번 headless 검수 SKIPPED, synthetic PASS 대체0 |
| 부모 hotpath 미인수 | `inputLimitations='already-held keys/gamepad/earlier same-window capture remain caller-owned'` | 기존 held key/gamepad polling/update·먼저 등록된 capture의 격리는 caller 후속. host만으로 main simulation/input freeze 완료0 |
| 렌더/대화 scope | `ownsRenderer=false`, `ownsRAF=false`, own iframe 최대1; child가 기존 renderer/RAF를 소유; `automaticTalk=false` | 자동 NPC 대화0, child 기본 독립 actor 유지. `childCharacterLinked=false`; parent 캐릭터·선택 주민을 child에 이식한 구현 아님 |
| 쓰기/인수 flag | `mainAccepted=false`, `nativeAccepted=false`, `saveWrites=false`, `rewardWrites=false`, `nextStageCalls=false`, `parentStateWrites=false`, `borrowedDomWrites=false` | 실제 유품grant/durable ACK/save/native6/audio/A급 인수0; host 복귀가 다음 stage 진행을 뜻하지 않음 |

### phase·reason·고정 오류 표시

| 분류 | 정확 값·조건 |
|---|---|
| public phase | current가 없으면 `idle`; current는 `loading`/`active`/`failed`. 내부 record의 `closed`는 close 후 current가 null이므로 public snapshot에서는 idle |
| 닫기 reason | `restored`, `disposed-handle`, `user-exit`, `user-escape`, `dialog-closed`, `parent-hidden`, `parent-context-invalid`, `parent-context-changed`, `owned-dialog-detached`, `superseded`, `failed-retry`, `UI-create-failed`, `cancelled`, `host-disposed` |
| 로드 실패 알림 | `onExit('load-failed')`; snapshot.reason/error에는 실제 오류문구. reason은 고정 enum만 있는 필드가 아니며 loading/ready text·Error message도 보존 |
| context 오류 | `UNKNOWN · host 객체 필요`; `UNKNOWN · host accessor: <key>`; `UNKNOWN · <label>`; `UNKNOWN · <label> plain 동기 객체 필요`; `UNKNOWN · readContext 재진입 금지`; `UNKNOWN · 부모 클리어/정지/identity admission 불일치`; `UNKNOWN · 부모 status primitive 필요`; `UNKNOWN · 부모 status 유한수 필요`; `UNKNOWN · 부모 사망/부활 중` |
| factory/UI 오류 | `지옥의 틈 host 의존성 필요`; `지옥의 틈 대기 수치 범위 오류`; `지옥의 틈 host는 격리 동일 origin 3387만 지원합니다`; `동일 origin dialog API 필요`; `지옥의 틈 onExit(reason) 알림 함수 필요` |
| child/시간 오류 | `지옥의 틈 iframe 로드 실패`; `지옥의 틈 활성 iframe 경로 상실`; `지옥의 틈 iframe origin/경로 변경`; `지옥의 틈 활성 port 사라짐`; `지옥의 틈 snapshot port 없음`; `지옥의 틈 표시 실패 · <error 또는 context/disposed>`; `지옥의 틈 활성 준비 상태 상실`; `지옥의 틈 준비 시간 초과` |
| 초기/ready leaf | 초기 `독립 화면 준비 중 · 본편 저장과 보상은 변경하지 않습니다.`; ready `독립 2.5D 공간 · NPC 대화는 직접 시작 · 본편 캐릭터/보상 연동 미인수`; formatter fallback `UNKNOWN · 지옥의 틈 표시 실패` |

### snapshot·DOM·자원 규격

| 항목 | 정확 현행값·수명 |
|---|---|
| snapshot 반환 | shallow frozen; `disposed,active,pending,phase,token,iframeLoaded,ownedDialog,ownedIframe,ownedTimers,parentStage,parentCharacter,reason,error,completed,cancelled,notificationErrors`, MAIN_RIFT_HOST 상수, override timeoutMs/pollMs 및 inputLimitations/parentStateWrites/borrowedDomWrites/childCharacterLinked |
| snapshot default | current 없음: phase idle/token null/iframeLoaded false/ownedDialog false/ownedIframe false/ownedTimers0/parentStage·parentCharacter null. active/pending는 phase 비교, ownedTimers는0 또는1 |
| counters | sequence 초기0/새 record token마다+1; completed는 ready handle 수이며 main 완료 수 아님; cancelled는 close reason restored/disposed-handle 외 +1; notificationErrors는 onExit throw/rejection 수 |
| 소유 DOM | 새 dialog/header/strong title/span status/button exit/iframe만 생성·삭제. dataset.mainRiftHost=token string; aria-labelledby/title ID `main-rift-host-title-<token>` |
| 기존 leaf 수정 | status/exit는 `children.length===0` 확인 후 textContent 교체; 부모 컨테이너 내용 교체0; 새 leaf의 초기 textContent는 생성 시 설정 |
| dialog style | width min(1400px,96vw), height94vh, max-width96vw, max-height94vh, margin auto, padding0, border1px solid #8c7851, radius14px, background#080d10, color#e7dfca, shadow0 28px 90px #000b, overflow hidden |
| header/status style | header height62px/gap18px/padding0 20px/bottom-border1px solid #384344/background#101719. status flex1/font13px/1.5 system-ui/color#aab9b5/role status/aria-live polite |
| exit/frame style | exit padding9px 16px/border1px solid #8c7851/radius7px/background#202b2a/color#efe3bc/cursor pointer/font600 14px system-ui. frame display block/width100%/height calc(100% - 63px)/border0/background#080d10 |
| UI label | title `지옥의 틈 · 격리 표시`; iframe.title `지옥의 틈 독립 2.5D 표시`; 정상 exit `돌아가기`, failed exit `닫기`; 준비 중 exit focus, ready child window/world-canvas focus는 optional |
| 자원 책임 | host의 own DOM/listeners/timeout만 host가 정리. child renderer·WebGL texture/geometry/material·RAF는 child의 기존 pagehide 수명 책임; parent renderer 재생성·차용dispose0 |

### 실제 증거·검사 핀 분리

영수증 폴더는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-host/`이다. 아래 실행은 서로 다른 코드 핀/범위다. 기존 memory16, 최초 FAIL, GUI14와 최종 제한4를 합쳐 새 총 PASS 숫자를 만들지 않는다.

| 실행/자료 | 실제 결과·코드 핀 | 해석 |
|---|---|---|
| browser-result.json | 최초 실제 iframe 실행 FAIL, checks0; child realm Object.prototype를 부모 prototype으로 판단하여 정상 ready 거절 | 첫 실패1회 원본 보존. PASS로 재분류0 |
| browser-fixed-result.json / screen-review.json | 이전 source17466B SHA `6cd3a13627e5eeccd8484ca843ec29ff1255ede47e1a8299493d65405367d0e6`; 새 고유 실제 browser14 PASS | cross-realm 허용 수정 뒤 실제 editor3387/모의 main-context 검사; 최종008a…에 GUI14를 다시 실행했다고 표기0 |
| 14검사 관측 범위 | own modal/iframe1·중복open0, 실제 WebGL2 CURRENT_PROGRAM/isProgram/LINK_STATUS, childfocus/실제 trusted 부모blur, editor scene/selection/view 보존, Tab·Enter·Space native controls, parent Delete/CtrlZ/CtrlS 격리, Escape/Enter 복귀, stale context, midloadcancel, injected503/timeout, 외부쓰기/미예상오류 경계 | 실제 GL link 관측은 시각/A급 인수와 별도. 당시 canvas1034×713·frames15는 관측값이며 renderer 고정 규격 아님 |
| 실패 주입·오류 | expectedHTTPFailureInjections1(HTTP503), firstFailureAttempts1; fixed run failure null, 미예상 pageErrors0·외부요청0·mutationRequests0·downloads0 | 예상503 HTTP/console 기록을 제거하거나 전체HTTP오류0이라고 쓰지 않음 |
| error-formatter-limited-result.json | 최종 source17683B/SHA `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38`; 신규 negative2 PASS + 최종 source 정상GUI 진입/복귀2 PASS; errors0/failure null | message getter throw/null throw의 admission·owned cancellation 검수2와 normal entry/restore/disposal2만 실행; 이전 memory16/GUI14 재실행·합산0 |
| hidden / blur | nativeParentBlurObserved true; nativeHiddenTransition SKIPPED: 실제 hidden 전환 미유도, synthetic 검수로 계산0 | blur-only 취소0은 관측, hidden cleanup은 코드 계약이며 실제 관측 인수로 승격0 |
| entry.png | 1600×1000, 909641B, SHA `9db547beabfd1cfd5f9b2511b34aa65c44fae53ecbba6aa75e28f6eff90c7ff7` | 이전6cd… 실제 화면: 전사·늑대·기존 lab canvas·오른쪽 controls·돌아가기 표시, blank/error 없음 |
| return.png | 1600×1000, 1229882B, SHA `96c7f995856d003b30da4e9310a76568d65edb603c23261399c4f892a7dec44b` | 이전6cd… 실제 복귀 화면: 기존 editor 하란 선택 유지, own modal/iframe 제거, focus 복귀 |
| 화면 판정 | screen-review.json의 hostUIVisualVerdict PASS / mapVisualVerdict RETOUCH | 호스트 UI 표시/복귀만 PASS. 1254² clean plate의 확대 흐림은 그대로이며 terrain 선명도·접합 개선 claim0; contact 실화면 FAIL/defaultOFF 이력 유지 |
| 현재 미인수 | actualMainGame=false, durableGift=false, saveAccepted=false, native6Accepted=false, audioAccepted=false; mainAccepted/nativeAccepted false | durable reward ACK·실제 저장·6단계 native route·청취·A급·본편 캐릭터 연동 완료0 |

### 본편 접점과 다음 소비자 경계

| 구분 | 이번 확정 상태 | 다음 책임 |
|---|---|---|
| public host | 독립 own DOM/iframe의 준비·입력 focus·오류/취소·복귀 수명 구현 | separate public gate는 이 절에서 import/완료/본편채택으로 단정하지 않음 |
| editor selected-NPC host | 기존 `createEditorPreviewHost`의 editor selection→접근점 preview 계약 유지 | `createMainRiftHost`가 선택NPC payload를 보내거나 그 host를 대체한 것으로 표기0 |
| 본편 caller | lexical player 객체·character string·stage integer·context identity·onfalse·stageClearedtrue를 readContext로 공급해야 함 | 현재 모의 context 검사에서 actual main P/G/캐릭터 이전 완료로 승격0 |
| current1-1 DEMO | 기존 `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0`, nextBtn의 demo 분기가 `_proceedNextStage` 일반 접점을 우회하는 경계 유지 | host만으로 1-1→틈 진입 완료0; DEMO 분기·SP10 clear보상·bossretry/_preArenaBackup 변경0 |
| 전환/입력 후속 | 5초 showStageTransition callback/900ms curtain, job/epoch·P/G/_charId(null 정상)/_charIdx/stage/difficulty·held/gamepad/update 격리 본편 인수 PENDING | host return≠continue job. 취소/실패 뒤 자동nextStage0, 실제 캐릭터port·내구 save ACK/native6/audio는 별도 검수 |

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·관측 |
|---|---|
| STAGE | 독립 지옥의 틈 main-rift own DOM/iframe public host의 실제 editor3387 표시/복귀·문서 동기화; 본편 gate 인수 단계 아님 |
| MASTER | 기존 상승 여정/지옥의 틈 silhouette·구역·main route·side space 계획 그대로; 계획 geometry 추가0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 및 major opening 이미지/외곽 geometry 변경0; 기존 기준 재제작/새 시각검수0 |
| LARGE | source PNG/대형 composite/overlap/repeated silhouette 수정0 |
| MEDIUM | 연결 부품·미해결 구멍 경계 변경0; 이 host로 접합 문제가 해결됐다고 표기0 |
| GROUND | nav1192·ground source·접지/오염/구조물 연결 geometry 변경0; 기존 contact FAIL/defaultOFF 및1254² 확대흐림 유지 |
| PLAYABLE | owned iframe input/focus/lifetime만 구현·검수. main arena/travel/breathing/threat/combat-readability·본편 held/gamepad/update 인수 PENDING |
| LANDMARK | primary/secondary/tertiary landmark 좌표·배치 변경0 |
| CAMERA QA | 실제 entry/return1600×1000 두 화면만 검토. START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT의 새 본편 종주·8시점 QA 미실행 |
| TECH QA | 첫 realm FAIL0체크 보존; 이전6cd… 실제GUI14 PASS; 최종008a… negative2+normalGUI2 PASS 별도. route/collision/nav 신규검사0; expected503/loading/취소 경계만 해당 범위 관측, seam/performance/full native QA PENDING |
| FILES | root public host code1과 관련 문서4가 완료소유 범위. 문서 담당은 지정4개 append만; concurrent source/raw/STATE/LOG·무관파일·이미지·game/editor/nav 수정0 |
| GIT | 이 문서 담당의 stage/commit/push/deploy0. root가 최종 host code+관련 docs를 소유 완료 단위로 보존; 이 절만으로 원격 SHA/push 성공을 선언하지 않음 |
| VISUAL VERDICT | **RETOUCH** — host UI 표시/복귀 화면 PASS, 전체 맵 확대흐림 미해결. contact ON의 이전 실화면 FAIL/defaultOFF와 구분 |
| NEXT PASS | 실제 main lexical admission·DEMO1-1 접점·held/gamepad/update·callback/curtain epoch·child character·save/reward ACK/native6/audio의 별도 구현·실검수. 기존 source/nav/보호2_3/Q 전용패링/어택티켓금지 보존 |

## ROOT-RIFT-PARENT-INPUT-LEASE-20261007 — public 부모 입력 lease 완료 / 본편 훅 미연결

이 절은 앞선 public lease WIP·caller 격리 미구현 문구의 최신 상태를 구분한다. 완료된 것은 `tools/2_5d/rift-parent-input-lease.mjs`의 순수 정책 소비자이며, 실제 game.html 입력·simulation을 정지시키는 main 훅은 아직 연결되지 않았다. raw63/64 원자료는 직접 import하지 않고 provenance로 보존한다. host 닫힘/disposed만으로 예약 중인 root job을 해제하지 않는다.

| id / 적용 위치 | 정확 현행 계약 | 구현·인수 경계 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-PARENT-INPUT-LEASE-20261007; 최종12294B; SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | native rejection observer 최소 보정 뒤 확정된 public derivative 1파일. raw 직접 import0 / game.html main 훅0 |
| factory / ports | `createRiftParentInputLease({ports:{readOwned,clearHeld}})` | options/ports는 own-data plain object, prototype는 같은 realm Object.prototype 또는 null. own/inherited then descriptor 거절; getter 실행으로 검증하지 않음. 함수와 원 ports receiver 캡처 |
| readOwned / 권한 | 동기 own-data plain `{owned:boolean,epoch:safe integer}`; epoch 최솟값0·최댓값9007199254740991 | root-local job의 비감소 epoch가 authoritative. host token/G.revision을 추측하지 않음. host는 닫혔어도 delayed root job이 남으면 owned:true |
| 통과 / 차단 | 현재 유효한 명시적 owned:false만 status inactive·block:false. owned/unknown/stale/disposed는 block:true | UNKNOWN·reflection/proxy throw·동기 재진입·옛 epoch·release된 epoch 재사용은 부모 실행 허가가 아님. Proxy trap 호출0 보장은 아님 |
| clearHeld | 각 새 owned epoch 첫 관측에 시도1회. 동기 undefined 또는 true만 성공; false/객체/thenable/Promise/throw는 실패 | clear 전에 epoch 기록, 외부 호출 후 fresh readOwned 재검사. 실패는 그 epoch에 고정되어 반복 해제0; 더 새 epoch는 별도 준비. clearHeld의 실제 _clearHeldInput→_gpClearAll 연결은 root caller 소유 |
| suppressUpdate | fresh readPolicy().block boolean | 실제 update 첫 실행문·lesson/KeyP/held shortcut 이전 호출은 main 후속 |
| suppressGamepadPoll | fresh block boolean | _pollGamepad 시작 전에 실제 caller 소비 필요; G.onfalse/paused만으로 폴링·UI 클릭이 막히지 않음 |
| suppressGamepadKeyInject | fresh block boolean | 직접 K/MB 주입 이전 소비 필요; poll의 직접 WASD 쓰기와 별개 |
| suppressFacingMutation | fresh block boolean | update 밖 mouse/gamepad facing 변경 이전 소비 필요; 방향 계산·BINDS·보호 패링 변경0 |
| suppressAutoNextStage | fresh block boolean | scheduled root job도 소유 차단 유지. commit 허가/실제 nextStage ACK를 이 boolean 자체로 대신하지 않음 |
| readPolicy / 반환 | frozen null-prototype: status/reason/owned/epoch/block/allowParent/blockParentInput/blockParentSim/blockGamepad/heldClearEpoch/heldClearSucceeded/heldClearAttempts/disposed/parentStateWrites/actualMainHooksAccepted | 각 suppressor는 fresh ownership 읽기. caller가 프레임당1회 정책을 읽는 경우 모든 실제 hotpath에서 block을 소비해야 함 |
| captureFreshOwnership | 안정된 owned:true 및 clear 성공 때 frozen detached `{owned:true,epoch}`, 그 외 null | 진단 캡처이며 persistent permission·restore/release handle이 아님. 이후 root job 변화는 caller가 재검사 |
| dispose | 최초 true / 이후 false. 폐기 뒤 항상 차단 | 내부 수명만 종료. 원 G/P 상태·root job·host·held 입력을 자동 복원하지 않음 |
| 순수 경계 / 수치 | module timer0 / RAF0 / DOM writes0 / parent state writes0 / save0 / reward0 / nextStage0 / automaticTalk0 | 모듈 추가 자체가 실제 freeze가 아님. 실제 gameplay·native input·save/grant/quest 인수0 |
| 초기 핀 의미 검수 이력 | 12058B / SHA256 `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676`; 초기 stdin1회 / 16그룹 / 288조건 / PASS16 / FAIL0 / 미도달0 / exit0 | `parent-input-lease/new-module-raw-result.json`의 초기 핀 검사. 최종12294 핀에서 이 전체 검사 재실행0. 기존 raw63/64의 7 negative failure, gate24/222·hostGUI14·최종host4·interop4와 합산0; 문서 worker 새 실행0 |
| 최종 핀 제한 검수 | 새 제한 stdin 실제1회: 최초FAIL1 / unhandled rejection1 → 외부 byteexact 백업 → 제품 최소 보정1회 → 후속6그룹 / 33조건 / PASS6 / FAIL0 / 미도달0 / newUnhandled0 / overall exit0 | `parent-input-lease/rejected-read-owned-limited-result.json`, final-receipt.json. 최초 실패는 숨기지 않고 보존; 초기16/288 재실행0. 프로세스 전체 exit0와 최초 실패 이력은 별도 |
| 비동기 소유 반환 거부 | 같은 realm native Promise는 캡처된 intrinsic then으로 rejection만 관찰; owned / 성공 승격0, 상태 UNKNOWN / block=true | native prototype 동일, own constructor 없음, native constructor/species 계약 보존일 때만 관찰. value.then getter0. foreign Promise / plain thenable은 getter0 UNKNOWN; 검사 foreign는 fulfilled 값이며 적대 foreign/constructor-accessor rejection 관찰 인수 주장0 |
| 원자료 불변 | SKILL raw63 18140B/SHA `f37496ba97808f0f831c507d90c18b35666295e79bf648de884fcfe4bc7547b6`, end ff7cfaf0-984b-4257-b7ea-c626705f50a9; ENEMY raw64 10122B/SHA `880f204f1a1a7ae7bb5b5ec7587585544c6ebfad20520ef5e82d494730020e03`, end 45bd281e-7659-412d-afc7-2156b118b904 | 신규 검수 시작/종료 pin exact, 문서 작업에서도 fullSHA 재확인. 원자료 수정0 / public 직접 import0 |

`classifyProjectedEvent(projected)`는 advisory만 반환하며 실제 DOM event dispatch/주입·preventDefault·focus를 수행하지 않는다. active일 때 caller가 native event에서 own primitive data를 투영해야 한다. 명시적 inactive에서는 event/type/getter/prototype를 읽지 않고 parent 통과한다. active에서 type·선택 code/key/repeat/isComposing/button own-data 계약과 fresh epoch를 재확인하며 UNKNOWN이면 none으로 차단한다.

| iframe 권고 키 / 이벤트 | 정확 의미 | 실제 소비 경계 |
|---|---|---|
| KeyW/A/S/D·ArrowUp/Down/Left/Right | walk; labWalkSpeed260 | 기존 child lab 기준값. 정책 모듈이 새 이동·주입을 실행하지 않음 |
| ShiftLeft/Right | run; labRunSpeed470 | 기존 child 동작 권고이며 parent charge 입력 변경0 |
| KeyJ / KeyR / Space | attack / dialogue / pause | R은 parent pickup이 아니며 Space는 gate.continue가 아님 |
| Escape / Tab / Enter / NumpadEnter | close-dialogue / modal-native / modal-native / modal-native | child 권고와 parent host 명시적 Return/Escape 취소를 구분 |
| keyup/mouseup/pointerup/pointercancel/touchend/touchcancel/blur/focusout/compositionend | none·parent-release-only·clearHeld:true 권고 | classifier가 release hook을 추가 실행하는 것이 아님. 종료 held/gamepad 재동기화는 root caller 소유 |
| active pointer·wheel/click/contextmenu / composition | pointer는 none; composition은 iframe 권고 | parent mutation 차단 / 전달·포커스·네이티브 Tab/Enter 기본 동작은 실제 host/caller 책임 |

최소 본편 접점의 읽기 전용 계획은 외부 `main-seam/read-only-plan.json` 26436B / SHA256 `c195b898cac382c24680941fee1cd6de393cd3091cf9ab90d19b955e7cc9af72`에 별도 보존한다. 실제 update 첫문·poll·inject/facing·held 해제·root job/epoch 연결, 5000ms callback의 일회 허가와 900ms shared curtain 소유 보호는 미구현이다. 현재 `_DEMO_MODE=true`/`_DEMO_LAST_STAGE=0`에서 nextBtn이 _proceedNextStage를 우회하는 정책, 명시적 Continue UI, public host의 HTTP 동일 origin3387 범위 및 child P/char 실제 연결은 해결되지 않았다. signedDifficulty -5..+5와 stage level offset -100/-50/0/+50/+100을 혼용하지 않는다. 모듈 import나 mock advance로 첫1-1 본편 진입 완료를 선언하지 않는다.

원본문 bytes prefix100%와 타인 WIP를 보존한 LF append만 수행한다. 외부 백업·docs 전체 keyword search·모든 매칭 파일 disposition·6문서 최종핀은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/parent-input-lease/docs-sync/rig-motion-prefix/`에 있다. 운영 정본의 최신 관리 상태는 PROJECT_MANAGEMENT_MASTER의 같은 완료 ID를 따른다. 다른 담당 DPR 문서/코드는 본 작업에서 수치·완료 판정을 추가하지 않는다. 사용자save·보스 retry/_preArenaBackup·SP10 clear 보상·원PNG/scene/nav·보호2_3/Q 전용 magic 패링/E 불가/어택티켓 금지 변경0.

### 에디터 적용 경계

editor snapshot/selection/canonical bytes와 기존 createEditorPreviewHost는 변하지 않았다. 새 main 입력 lease를 editor native 단축키·preview 버튼 consumer가 자동 사용하는 것으로 선언하지 않는다. 실제 main closure의 P/G/char/job이 없는 editor mock 검사와 game.html native 입력 인수는 별개이며, 이 문서 동기화에서 editor/main/브라우저 실행0이다.

### MAP PRODUCTION REPORT — §23 / 문서 동기화 범위

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE | ROOT-RIFT-PARENT-INPUT-LEASE-20261007 public 정책 소비자 완료 계약 동기화. 실제 main hook 미연결 |
| MASTER | 기존 최하층→상승·장/스테이지 사이 지옥의 틈 목표 유지; 새 맵 계획0 |
| OUTER MASS / LARGE | 기존 silhouette·opening·원PNG·composite/crop 등록 변경0 |
| MEDIUM / GROUND | 연결부·절벽 접합·ground·geometry·nav1192·source feet 변경0 |
| PLAYABLE / COMBAT | pure lease 정책만. actual input/main route/실보스 전투/native6 인수0 |
| LANDMARK / SMALL DETAIL | 상승문·균열·주민 배치·에셋·세부 변경0 |
| CAMERA QA | 문서 worker 새 화면·8카메라·DPR A/B·브라우저 실행0 |
| TECH QA | 초기12058 핀 stdin1/16그룹/288조건 PASS 이력; 최종12294 핀 별도 제한 stdin1 최초FAIL1/unhandled1→후속6그룹33조건/PASS6/FAIL0/newUnhandled0/overall exit0. 초기16 재실행0, 문서 worker 새 검사0, 원raw63/64 불변 |
| FILES | 지정 기존 docs6만 원본문 prefix100% + LF append. 코드/game/editor/raw/STATE/타인 WIP 수정0 |
| GIT | 문서 worker stage/commit/push/deploy0. root가 완료 code+docs 한정 checkpoint/push 담당; 여기서 remote SHA 성공 추정0 |
| VISUAL VERDICT | **RETOUCH** — 기존 전체맵 판정 유지, 본 작업 새 실화면 NOT ASSESSED. pure PASS를 visual PASS로 대체0 |
| NEXT PASS | 실제 main update/poll/inject/facing/autoNext + root job/epoch 및 clear/exit release 연결; ContinueUI·DEMO·3387 scope·child P/char·5000ms/900ms·save/reward/native/audio 별도 인수 |

## ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 — 격리 main 소스 훅 연결 / 실제 게임 인수 대기

이 절이 신규 소스 연결 상태의 정본이다. 앞선 public host/gate/lease 절의 “main 훅0·미연결”은 해당 당시 핀의 이력이며, 현재 `game.html` 일반 `_proceedNextStage` 경로에는 lexical root job과 public runtime 소비자가 연결되었다. 적용 origin은 정확히 `http://127.0.0.1:3387`이다. 기본 데모 종료 분기, 실제 본편 플레이·다음 stage ACK·native6·음향·지속 save ACK·child 실제 P/캐릭터 전달은 별도 미인수다. 모듈 구현·fixture PASS를 이 인수로 승격하지 않는다.

### 동결 소스와 적용 범위

| id / 소스 | 현재 값 / 핀 | 적용·제외 |
| --- | --- | --- |
| game.html | 4050426 B / SHA256 `ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230` | root block + 정확15접점. 원본 본체·타인 WIP·보호2_3 수정0 |
| tools/2_5d/main-rift-runtime.mjs | 7519 B / SHA256 `b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69` | 새 public orchestration consumer. raw 직접 import0 |
| public foundation host | 17683 B / SHA256 `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38` | 기존 public import / 동일 origin iframe host |
| public foundation gate | 16280 B / SHA256 `f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd` | 기존 one-shot permission/context 계약 유지 |
| public foundation lease | 12294 B / SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | 기존 strict ownership 계약 유지 |
| origin / 활성 | `location.origin === http://127.0.0.1:3387` | 3333·3340·file: 활성0. 새 서버/게임 실행0 |
| 데모 현재 기본값 | `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0` | nextBtn의 기존 terminal demo 분기는 직접 nextStage 호출 유지. 기본1-1→틈 허브 PENDING |
| foundation 진단 상수 | 기존 public module의 `actualMainHooksAccepted:false` 유지 | foundation 자체 인수 flag와 현재 caller 소스 연결을 구분. 새 runtime은 `mainSeamConnected:true` |
| source 등록/해상도 | canonical nav1192·원PNG/scene/주민 feet·1254² plate→8000² world 그대로 | 맵 확대 흐림·절벽 접합 RETOUCH 미해결. 이 연결은 해상도 개선이 아님 |

### runtime API와 실제 lexical ports

`createMainRiftRuntime({window,document,ports})`는 window/document.body·정확 origin3387 및 아래7개 함수 ports를 요구한다. 이 factory는 외부 임의 context를 본편으로 인증하는 validator가 아니며, game 내부의 실제 lexical 참조를 제공하는 caller와 public foundation guards가 함께 계약을 수행한다.

| ports id | 정확 반환 / 소비 | 수명·저장 경계 |
| --- | --- | --- |
| readOwned() | 동기 `{owned:!!_rootRiftJob&&!job.closed, epoch:_rootRiftEpoch}` | host token이나 G.revision 추정0; root-local epoch authoritative |
| clearHeld() | `_rootRiftClearOnce` → 동기 true/false | 새 job 최초 시도1회. `_clearHeldInput()`로 Shift 무장 해제 후 `_gpClearAll()`; _gpSynced=false·axes0·_gpAiming=false |
| isCurrent(captured) | `_rootRiftCurrent(job)` exact identity boolean | 같은 job/P/G/stage/char/difficulty/save/status·clear/boss/HP·G.onfalse 재검사 |
| readHostContext() | 현재 actual `{player:P,character,stage:G.stage,context:G,on:G.on,stageCleared:G.stageCleared,status:P.s}` | stale이면 throw; parent P 참조 읽기가 child P 전달을 뜻하지 않음 |
| readGateState(captured) | 현재 `{stage,stageCleared,status:clear-continue,difficultyOff,contextId:job.epoch}` 또는 null | 실제 stage offset 사용. 임의 G 필드 추가0 |
| schedule(commit,captured) | 현재 job 확인 후 controlled showStageTransition 설치 / undefined | 5000ms 대기 중 lease 유지; callback은 current→commit→current→기존 nextStage |
| release(captured,why) | `_rootRiftRelease` matching job만 true / 그 외 false | 옛 job이 새 job·curtain을 해제0; 안전한 같은 context에서만 이전 G.on 복원 |

| runtime API | 정확 동작 / 반환 | 상태·실패 경계 |
| --- | --- | --- |
| enter(captured) | async; 성공 frozen null-prototype `{entered:true,fallthrough:false,rootEpoch}` | 중복/disposed/stale는 entered:false. gate await 뒤 fresh ownership과 Continue DOM 설치 확인 |
| continue() | phase=rift·현재 소유 때만 gate.continue; scheduled===true면 true | 명시 Continue만 예약. 자동 advance/failure fallthrough0; 반복 scheduled 클릭 false |
| parentEvent(event) | 처리했으면 true; host native modal 제어에는 false | own Continue click 또는 비반복 Enter/NumpadEnter/Space만 명시 진행. 나머지 parent 이벤트 차단 |
| block(channel) | update/poll/inject/facing/auto → 대응 lease suppressor boolean | 알 수 없는 channel은 true 차단. game caller는 import/기존 save 대기 중에도 먼저 차단 |
| cancel(why=cancelled) | 현재 record close, 성공 true / 없거나 이미 닫혔으면 false | own Continue 제거→gate.dispose→host.cancel→matching release |
| finished(captured) | 현재 captured identity만 close(advanced,false) | root caller finally가 release. 성공 다음 stage에서 이전 G.on 복원0 |
| dispose() | 최초 cancel(page-disposed)·host.dispose·lease.dispose 후 true / 반복 false | 소유 UI/모듈 수명만 종료. parent game save/reward 소유0 |
| snapshot() | frozen null-prototype detached primitive fields + foundation snapshots | disposed/phase/reason/rootEpoch/entered/scheduled/continueButton/host/lease/gate; mainSeamConnected=true |
| snapshot 미인수/소유값 | actualStageAdvanceAccepted=false, childCharacterLinked=false, saveAckAccepted=false | saveWrites0 / rewardWrites0 / automaticTalk=false / raf0 / timers0. game curtain 기존 RAF/timer는 별도 |
| phase / reason | phase idle→entering→rift→scheduled→idle; reason idle/preparing/ready/explicit-continue 등 | 실패 reason stale-or-duplicate/gate-entry-failed/stale-entry/entry-or-continue-ui-failed/continue-failed/continue-refused; 취소 why·advanced 별도 |

### job 캡처·held 입력·epoch·취소·전환

| id / 접점 | 정확 규칙 / 수치 | 인수 경계 |
| --- | --- | --- |
| 진입 admission | stageCleared===true / bossAlive===false / stage safe integer≥0 / finite HP>0 / G.on boolean / finite difficulty / charIdx 유효 정수 | P.s dead/fallen/reviving/lastStand 거부. 현재 job·dead page·default demo terminal·epoch≥9007199254740990 거부 |
| captured job | epoch, P/G 참조, stage, charId, charIdx, character, difficultyOff, difficultyIndex, dbSave 함수 참조, _dbReady, P.s, previousOn | charId null도 identity로 허용. character는 charIdx===1이면 silvertail, 그 외 warrior; child 전송0 |
| job flags | heldCleared/closed/cancelling/advancing 최초 false; begin에서 ++epoch | root job 등록·G.on=false·held 해제는 기존 save await보다 먼저 |
| fresh identity | 현재 job/epoch/P/G/stage/charId/charIdx/(G._stageDiffOff??0)/(OPT.diff??5)/dbSave/_dbReady/P.s 일치 | finite HP>0·cleartrue·bossfalse도 확인. current는 !closed·!cancelling·G.on===false 추가 |
| 기존 난이도 | NEXT_DIFF_OPTS off = -100/-50/0/+50/+100; OPT.diff 기본5 | stage level offset와 difficulty index 분리; signed -5..+5로 임의 역변환0. 기존 선택·수식 무변경 |
| 기존 저장 | job.saveReady일 때 `_proceedNextStage` 기존 dbSave 최대1회 await | 이미 앞선 clear-save는 별도. void/skip/catch resolve는 준비 완료일 뿐 durable ACK가 아님 |
| await 경계 | save 뒤 context-after-save; lazy import 뒤 context-after-import fresh 검사 | matching job에만 invalidate. 실패 rift-entry-failed에서 자동 nextStage0 |
| 입력 해제/복원 | clearOnce 최초1회·release에서 다시 held/axes/aim 해제 | 옛 held 키/축 복원0. 같은 identity·G.onfalse의 안전한 취소에만 previousOn 복원 |
| 부모 hard block | import/준비 중 job이 있으면 차단; stale/lease throw는 invalidate 후 해당 hotpath 차단 | scheduled에서 iframe 닫혀도 root owned 유지. 명시 inactive에서 기존 부모 실행 통과 |
| 자동 stage / 명시 commit | 일반 nextStage는 auto 차단; 현재 job.advancing만 예외 | `_rootRiftAdvance`: current→함수 commit의 truthy 결과→current→기존 nextStage1회; final finally release restore=false |
| curtain 기본 수치 | 기존 RAF bar45% → owned wait5000ms → bar100% → owned hide900ms | 새 runtime RAF/timer0; 기존 game curtain 각 핸들만 소유/취소 |
| curtain 이중 소유 | curtainOwner===_rootRiftCurtainEpoch 및 bootOwner===_bootLoadEpoch | callback 전 current job도 검사. 성공 뒤900ms hide는 옛 stage identity가 아닌 curtain+boot 소유 검사 |
| matching cancel 최소 보정 | `why!==advanced`인 같은 job release가 own curtain.cancel 즉시 호출 | scheduled Escape가5000ms 대기를 즉시 제거. successful advanced의900ms fade는 유지 |
| curtain cancel() | 최초 true / 반복 false; own RAF/wait/hide만 clear; current curtain이면 opacity0/pointerEventsnone | 옛 cancel/hide가 새 curtain·boot cover를 덮지 않음. callback false/throw controlled 경로는 refuse/onCancel |
| context 무효화 | retry/character-change/init-stage/boot-loading/lobby/pagehide/parent-hidden/changed lexical context | advancing 중 authorized init-stage/boot-loading invalidate 제외. active job 중복진입은 거절; 새 job 전에 남은 curtain만 cancel. boot-loading은 새 curtain/boot token 사용 |
| 취소 UX | safe 취소일 때 기존 nextBtn disabled=false·opacity1, leaf status 귀환 안내 | host Return은 job 취소/부모 복귀이며 continue 예약이 아님. parent blur 취소 추가0 |
| 정확 원본 보존 | 15 replacement 역변환 결과 = 최초 원본4039085 B / SHA256 `4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd` | 구조 byte 대조 근거; git reset/checkout0·old suite 재실행0. clear 보상SP10/retry EXP30%/부활/save 기존 동작 보존 |

### 키·DOM·본편15접점

| id / key 또는 DOM | 현행 소비 | 변경하지 않는 경계 |
| --- | --- | --- |
| 명시 Continue | button id root-rift-continue-${captured.epoch}; 문구 “위로 올라가기 · 다음 구역”; aria “지옥의 틈을 떠나 다음 구역으로 이동” | host current token safe integer≥1·open dialog[data-main-rift-host]·첫 HEADER에만 append |
| Continue 입력 | own button target에서 click / 비반복 keydown Enter·NumpadEnter·Space | 전역 Space/Enter가 gate.continue를 뜻하지 않음; host의 native Tab/Return/Escape controls 유지 |
| Continue 스타일 | padding9px16px / border1px #c7b580 / radius7px / bg#544328 / fg#fff0c9 / font600 14px system-ui | 소유 button만 remove; 부모 textContent/innerHTML 교체0 |
| 상태 leaf | root-rift-main-status / role=status / display:block / min-height21px / margin9px0 / #d9bd86 / font13px/1.6 system-ui | nextBtn 앞 own span 삽입. children.length===0에서만 textContent 교체 |
| parent capture18종 | keydown/keyup/pointerdown/pointerup/pointermove/pointercancel/mousedown/mouseup/mousemove/click/dblclick/auxclick/contextmenu/touchstart/touchmove/touchend/touchcancel/wheel | window capture:true/passive:false. 현 job 때 parent mutation 차단; modal 내부는 host control에 양도 |
| Escape/visibility/pagehide | nonrepeat Escape matching cancel; document.hidden이면 parent-hidden; pagehide dead flag·invalidate·runtime.dispose | parent blur 취소0. 오래된 job 취소는 새 job 불변 |
| child 기본 키 | WASD/방향키 walk260; Shift run470; J attack; R dialogue; Space pause | 기존 lab 속도/동작 유지. 자동 dialogue0; child R을 parent pickup으로 해석0 |
| 원래 parent 설정 | BINDS/BINDS2·마우스 aim·패드 twin-stick·Q 전용 magic blackBean 패링 유지 | E magic 패링 추가0 / 어택티켓 제한 신규 구현0 / 보호2_3 변경0 |

아래 줄번호는 동결 `game.html` ece8 핀 기준이며 접점은 root block1 + 기존 함수/이벤트 소비14 = 15개다.

| 접점 id | source line / 함수 | 새 소비 |
| --- | --- | --- |
| root job / orchestration | 3438–3557 root block | job/epoch/capture/quarantine/readonly snapshot |
| character change | 10283 _loadCharAtlas | character-change invalidate |
| mouse facing | 12567 _setMouseFacing | facing lease guard |
| gamepad auto aim | 13132 _gpAutoAim | facing guard |
| gamepad key inject | 13163 _gpInjectKey | inject guard; release는 기존 held clear만 |
| gamepad poll | 13489 _pollGamepad | poll 시작 guard |
| gamepad direct WASD | 13758 직접 K/KH 쓰기 | inject guard로 poll 외 실제 직접 주입 보호 |
| init stage | 30478 initStage | init-stage invalidate / authorized advancing 예외 |
| simulation update | 31041 update | lesson/KeyP/held shortcut보다 먼저 update guard |
| auto next stage | 42610 nextStage | auto guard / authorized advancing만 기존 본체 허용 |
| retry | 61667 기존 retry callback | retry invalidate |
| stage transition | 61739 showStageTransition | optional rootControl + owned RAF/5000/900 lifecycle |
| boot loading | 61791 showBootLoading | boot-loading invalidate 및 curtain token 증분 |
| normal proceed | 61859 _proceedNextStage | capture→기존 save→fresh→runtime import→fresh→enter |
| lobby | 61890 goToLobby | lobby invalidate 후 기존 저장/로비 이동 |

`window.__riftMainIntegration.snapshot()`은 frozen readonly 진단이며 enabled/epoch/owned/reason/phase/guardedAdvanceCalls와 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false를 반환한다. mutable P/G/job·release 함수·save handle을 노출하지 않는다. 정상 demo nextBtn의61880 terminal branch는 `_proceedNextStage`를 우회해 기존 nextStage를 직접 호출하므로, 이 진단의 존재만으로1-1 허브를 인수하지 않는다.

### 핀별 검수·미인수

| 검수 / source pin | 새 실행 / 정확 결과 | 범위 / 승격 금지 |
| --- | --- | --- |
| 과거 source-seam VM | game4050167 B / SHA256 `f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3`; runtime b93c 동일; 실제1회9그룹/133조건 PASS9 FAIL0 exit0 | lexical source+runtime 실제 함수 및 host/gate/lease 인터페이스 double. 본편·HTTP·GPU·save writes·native0 |
| 최종 matching Escape 보정 | game4050426/ece8 + runtime7519/b93c; 제한 신규1회2그룹/20조건 PASS2 FAIL0 exit0 | final release/transition/runtime 경계만. 앞9/133 재실행0·두 핀 결과 합산0 |
| syntax 이력 | 완료 corrected syntax1회 PASS는 과거 f3a inline1 + runtime; 기존 importmap JSON 오분류 checker 실패1회 별도 | 최초 parser 실패는 변경제품 도달 전 tooling 실패. final 제한2/20에서 변경 lexical parse/실행; 옛 syntax 결과 재승격0 |
| 신규 runtime DOMQA | actual Chrome1/context1/QA parent1/child3 직렬; 신규3그룹/15 subchecks PASS3 FAIL0 exit0 | detached stage1 P/G fixture. actual game/5000ms900ms/nextStage/held gamepad/update 검수0; 기존 검수 합산/재실행0 |
| 실제 main 인수 | actualGameExecuted=false / actualStageAdvance=false / nativeSix=false / audio=false / saveAck=false / actualGPU=false | mock nextStage count는 실제 advance가 아님. childUsesActualPCharacter=false / defaultDemoCH1_1HubRoute=false |
| 미래 인수 조건 | DEMO terminal route 정책 별도 확정→actual current parent→host Continue→actual nextStage ACK→game native6·음향·지속 저장 | 현재 source 접점 구현과 실사용/실게임 인수를 분리. NPC grant/quest·영구 보상 후속 PENDING |

근거: 외부 `main-seam-integration/rig-motion-implementation/final-receipt.json`·handoff.md·동결 소스 actual diff/runtime. 문서 worker의 새 테스트·브라우저·게임·Git 실행0. docs 전체 keyword 검색은65파일/520매칭 줄, raw887635 B; 모든 매칭 파일의 수정/보존/타인 소유 disposition과6문서 byteexact 백업은 외부 `main-seam-integration/docs-related-sync/`에 보존한다. 기존 원문 bytes prefix100%·기존 완료 이력·타인 WIP를 유지한 LF append만 적용한다.

### 에디터·격리 iframe 적용

| id | 현재 적용 | 미구현·보호 경계 |
| --- | --- | --- |
| editor 경계 | 기존 editor scene JSON/selection/pivot/access/preview 기능 유지 | main source caller는 별도 game.html; editor import 성공을 본편 stage 인수로 계산0 |
| host 소비 | 실제 origin3387 안에서 public host의 독립 iframe/worldlab 사용 | 새 renderer/RAF/timer는 runtime에 없음. child own renderer/preview P 그대로 |
| 저장/Undo | 새 root job과 curtain는 game transient 수명 | editor History/scene.start/nav/sourcePins·user save 변경0 |
| 등록 | 엄격 resident/profile·source UV/좌표·원본 PNG 기존 정본 | 1254→8000 및2D mask max1024 기존 해상도 한계 별개 |


### ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007 — 신규 실제 DOM 결과 / fixture 경계

문서 작성 중 도착한 helper 결과를 현행으로 반영한다. actual public runtime/host/gate/lease와 실제 child lab을 격리3387에서 사용했다. 부모는 detached own plain P/G/job의 stage1·clear-continue·difficultyOff0·contextId=epoch fixture이며 actual game.html은 실행하지 않았다.

| 관측 id | 정확 신규 결과 | 미인수 경계 |
|---|---|---|
| 실행 / 결과 | actual harness1 / Chrome launch1 / context1 / QA parent1 / child3 직렬 / screenshot3; 신규3그룹·15 observed subchecks PASS3 FAIL0·failedSubchecks0·exit0 | 제품 수정0. source9/133·final2/20·interop4·기존 hostGUI14 재실행/합산0 |
| native Continue click·Enter | 각 trusted own button 입력→scheduled; rootOwned=true/leaseBlock=true/leaseOwned=true; clearHeldCalls1/scheduleCalls1 | host owned dialog0/iframe0/poll timers0. 예약 직후 mockAdvance0·permission false |
| 지연 gate callback | click/Enter 각 최초 permission true1·중복false1·모의advance1·release advanced1 | QA 메모리에 보류한 실제 gate callback 수동 호출. actual nextStage0 /5000ms·900ms timer 검수0 |
| 예약 중 W / Escape | 각 경로 trusted W downstream0. Escape에서 release(parent-escape)1→old callback2 false·mockadvance0 | actual main held/gamepad/update 검수0. matching curtain source2/20과 별도 |
| child readiness | 직렬3 child 각각 ready=true/error=null/frames6/backing canvas1036×714 | 동시 중복 실행0; 기존 지도 route/collision/GPU lifecycle 검사 반복0 |
| 오류 / 외부 영향 | pageerror0/consoleError0/httpErrors0/foreignRequests0/mutationRequests0/downloads0; isolatedStorageUnchanged=true | repoWrites0/gitWrites0·사용자save/보상/schema 쓰기0 |
| 핀 보존 | public code5 + 보호원본6 =11개 전후exact; game4050426/ece8 읽기 핀 전후일치 | lab36039 B / SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`; game 실행0 |
| 시각 판정 | helper tested desktop own Continue/host 제거/부모 귀환 UI PASS; 전체맵 VISUAL RETOUCH | 원1254 plate 확대 흐림·작은 raster 캐릭터·전체맵 A급未인수. mobile NOT_TESTED. 문서 worker 새 화면관찰0 |
| 본편 미인수 | actualMainGame=false/native6Accepted=false/audioAccepted=false/saveAccepted=false/rewardAccepted=false/actualNextStageCalled0/stageAcknowledged=false | child P/캐릭터 전달0·DEMO1-1 hub PENDING·actual5000/900/gamepad/update0 |
| 실제 증거 | runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt | runtime-owned-continue-ready.png /runtime-click-scheduled.png /runtime-escape-cancelled.png; 스크린3과 원시결과 별도 보존 |

### MAP PRODUCTION REPORT — §23 / source consumer 문서 동기화

```text
STAGE: ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007; source consumer 구현 계약 docs6 동기화. 실제 game 인수 대기.
MASTER
- silhouette / regions / main route / side spaces: 원형 맵 계획 그대로; 변경0.
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 원형 지형/마스크/높이 등록 변경0.
LARGE
- source assets / composites / overlap / repeated silhouette: 원PNG/1254 plate/atlas 변경0; 반복 원화 해소 선언0.
MEDIUM
- connections / remaining holes: 원형 접합 유지; 절벽 접합 RETOUCH.
GROUND
- shadow / contamination / structure integration: 기존 접지·재질 소비 유지; 이번 변경0.
PLAYABLE
- main arenas / travel space / breathing space / threat space / combat readability: 일반 caller seam source 구현; 실제 게임(native6) 새 검수0.
LANDMARK
- primary / secondary / tertiary: 원화/배치 변경0.
CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 이번 새 화면검수0; 전체맵 기존 RETOUCH 유지.
TECH QA
- route / collision: nav1192·feet·원본 scene 보존; 실제 본편 종주/전투 완료0.
- pageerror / 404 / loading / performance: 신규 runtime fixture DOMQA3/15 PASS; pageerror/console/HTTP/foreign/mutation/download 각각0. 실제 game5000/900·gamepad/update 검수0.
- seam: oldf3a9/133과 finalece8 제한2/20은 다른 핀/범위이며 합산0.
FILES
- stage-owned: 지정된 관련6문서 LF append; 원문 전체 bytes prefix100% 보존.
- concurrent touched / unrelated touched: rootops6·완료worlddocs3·게임/코드/STATE/타인 WIP 변경0.
GIT
- staged / commit / push: worker0; 완료소유 code+docs checkpoint와 remote exactSHA는 root 담당.
- deploy: 0.
VISUAL VERDICT: RETOUCH. 전체맵 원본1254² 확대 흐림·절벽 접합 미해결; source tests의 visual 승격0.
NEXT PASS: DEMO1-1 허브 정책과 실제 현재 parent→명시 Continue→nextStage ACK, native6·audio·durable save Gate 별도 인수.
```

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.
### ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007 완료 소비자 / NPC canonical 경계

| 항목 | 현재 코드·검수·계획의 정확한 상태 |
|---|---|
| 완료 source | `tools/2_5d-world-lab.mjs` 39715B / `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8`; 이전 36039B/8388efcf 버전은 역사 핀. 원문9접점 역변환 전체 exact |
| 효과 재생성 소비자 | retiring 전 슬롯을 frozen `INERT_EFFECT`로 비활성화하고 기존 `releaseResource`로 오류·중복 cleanup을 집계. epoch/request identity/job owner/slot identity를 callback 뒤 재확인; stale handle는 자기소유만 해제·게시0. generation은 MAX_SAFE_INTEGER에서 포화하지만 새 frozen request identity로 최신요청을 구분 |
| 중첩 요청 | 동기 callback의 재진입을 허용하되 최신 pending 요청1만 기존 frame 시작에서 처리. finally 즉시 재귀0; dispose 시 pending/request 무효화. 초기 생성도 local create→takeInitialized→publish 순서. `createEffects`는 initializationScene을 사용 |
| 진단 계약 | `__rift25Lifecycle.snapshot().effectRebuild` 및 기존 lab snapshot의 frozen `{generation,phase,pending,failures,cueFailures,reasons}`. phase는 idle/cue/retiring/creating/publishing. INERT reason은 rebuild-unavailable; slot reason은 rebuild-pending/factory-failed/slot-replaced. 실패 시 효과 비활성 상태를 리프 UI에 표시 |
| 새 source 검수 | 신규 단일 source VM1 / 11그룹104조건 PASS / FAIL0 / exit0. actual Three와 public producer 사용, lifecycle/RAF/UI ports는 mock. 이번 소스검수로 GUI/GPU/main/native6/save/audio 승격0. source limited-result19801B/`add91a250b887fcd26ba8a85885bc34abf52d3ee71b3ee75f94cf18ea4f5b893` |
| 완료 영수증 | 외부 `actor-rebuild-consumer-guard/final-receipt.json` 8754B / `e2ccde8c49fd9f2f8f23e0f5bb78541b088a473043785965ae3484a15deac2e0`; worker code1+docs3 frozen, root 완료소유 checkpoint 대상. 새 브라우저3범위는 별도 진행중이며 완료0 |
| 불변 producer / 본편 | actor12162B/`a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`; game4050426B/ece8c398 및 mainruntime7519B/b93cb86f 유지. actor cleanup은5856578b, 이전 실제 Chrome 준비2FAIL와 GPU후검사2FAIL 및 제한12조건 관측은4b487cde 역사에 보존. old suite 재실행·합산0 |
| owner memory | reentrant 공식 end `b7c855c2-b213-4860-af41-9a433e5aef9a`@2026-10-06T20:37:33.547Z / endraw `d07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001`. reported9 중 유효7 / 무조건 assert(true)2 제외; root 재실행0. 소스구현 신규104조건과 합산0 |
| 미해결 생성 경계 | producer geometry constructor 부분할당 및 `scene.add→all.push` 소유 등록 전 callback 재진입은 이번 소비자 수정으로 해결 증명0. 기존 owner의 독립조사 수집을 이어감 / 전문TASK 중복송신0 |
| 실제 주민 | Haran/Berin/Nessa/Dorik 4명. 이전 요청의 fifth는 UNCONFIRMED_REQUEST_SCOPE / 기존 NPC5확정0. 읽기영수증 `npc-canonical-identity-lookup/read-only-result.json`30058B/`5385815a9ee00a1426fa0261b23b4dece300407a8565ff31c7a9a19de4415c3d` |
| 베린 유품 | offer/o_take→gift.accept / story.berin.keepsake는 기존 대화 참조. canonical 지급 item definition/quantity/durable ledger는 UNDEFINED. grantOnce:true를 quantity1로 추론0; game mkItem의 Date.now+Math.random은 생성 인스턴스ID이며 contentID가 아님. 사용자 유품 종류 질문 pending / 실제 지급 consumer 미구현 |
| 네사 부탁 / 다른 주민 | story/o_accept→quest.accept / story.nessa.findLin·벌레굴 참조는 기존. 등록 questID/Lin entity/구출조건/보상 UNDEFINED. Haran/Dorik 대화·session met flags는 기존, main durable flags 미등록. 보스/여신/다른 플래그 임의전용0 |
| 다음 승인 미완료 | 기존 owner를 통해 producer부분할당·등록 조사 종료수집, 새 실제 Chrome 재생성 검수, 명시 NPC choice→Continuebusy→동일slot inventory+ledger ACK/readback 소비자 진행. canonical 유품 질문에 의존하는 지급 바인딩은 답 전 보류, 독립 제작 지속 |
| 범위·인수 | 맵 geometry/outermass/ground/landmark/DPR/색/opacity/default motion/원PNG·scene·nav 변경0. 전체맵 VISUAL RETOUCH; defaultdemo CH1-1→hub, childP/char, 본편native6·청취·실보상save·A급 미인수. fixture/raw/lab/소스접점을 실제플레이완료로 계산0 |

전체 docs 검색은 `effectRebuild|updateReducedMotion|createEffects|INERT_EFFECT|actor-effect-lifetime|reduced.motion|재생성|cleanupFailures`로164경로853줄 / raw1164941B/`10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f`, precise19경로223줄과 경로별 disposition을 기록했다. 관련 현재핀·구현상태는 worker3+rootops6+directional/editor/SSOT/dialogue에 동기화하고 과거 원prefix와 EOF LF1을 보존한다. 보호2_3·타인WIP·ownerSTATELOG는 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=기존 지옥의 틈 2.5D 소비자의 효과 수명 보정; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL=지형·원화·배치 변경0, 기존 SSOT/LOCK/guide 유지. CAMERA QA=신규 화면검수 별도 진행중/이번 source 완료판정에는 포함0. TECH QA=신규 source VM11/104 PASS와9접점 역변환 exact; geometry 부분할당은 미해결. ACTUAL PLAY/NATIVE/AUDIO/SAVE=미인수. **VISUAL VERDICT: RETOUCH**.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
### ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007 완료 접점 / 새 후속 근거

| 항목 | 현재 구현·검수·남은 범위 |
|---|---|
| 현재 public actor | `tools/2_5d/actor-effect-lifetime.mjs`12639B/`6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`; 이전12162B/a8089888은 dispose 및 Chrome 검수 당시 역사 핀. source1접점 역변환 전체12162B exact / 외부백업 선행 |
| 생성 실패 회수 | 두 geometry constructor를 local refs dustGeo/attackGeo(null초기값)로 감싸고 throw 시 `unwindGeometryConstruction`으로 반환받은 owned ref만 Set identity중복 없이 각각 dispose 시도. cleanup 실패여도 다음 owned ref 시도·원 thrown value 그대로 전달. cleanup 실패를 성공 회수로 표시0 / 추가오류API·disposed통계 변경0 |
| 불변 생성 arguments | dust RingGeometry(0.55,1,28,1), attack RingGeometry(0.62,1,24,1,-0.9,1.8), 생성 순서 및 normal path 동일. constructor 외 publicAPI/default/depth/spawn/acquire/material/Mesh/place/update/dispose·number성공계약 불변 |
| 새 제한검수 | 단일stdin1 / source6그룹 유의미24조건 PASS / FAIL0 / exit0. normal actualThree·실제geometry dispose event + constructor실패 fake port·actualprivatehelper CPU. 원raw25PASS 중 미연결 disposeCalls assertion1 제외; 첫constructor exact nullthrow·첫constructor1회호출은 유효관측, 미보유ref dispose0를 실제측정으로 주장0. 전체재실행0 |
| 남은 경계 | constructor 내부에서 throw해 반환ref가 없는 allocation은 UNKNOWN. cleanup throw의 실제회수 실패도 해결완료0. material/Mesh/add 실패·acquire재진입·privatependingledger·persistentdedup·frame/update 오류정책은 이번 접점 밖 미해결; public fullproducer 교체완료0 |
| 최종 source 영수증 | `actor-geometry-constructor-unwind/final-receipt.json`11730B/`3d166986f5632c51c8884afce83f01f33bb271533d288db2de1e8165e2acac8c`, workercode1+docs2 frozen / 정상소유checkpoint 대상. newGUI/GPU/main/native6/audio/save 인수0 |
| world / 이전 실제 Chrome | world39715B/`050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변. sourceguard code1+docs14는bd0d89e1, 실제Chrome 후속3/15 PASS와최초3timeout이력은5fffc2e6에보존; 그때actor12162핀 검수였으며 새12639 GUI·GPU검수로승격0. nativeMQL trusted3와callback synthetic2 provenance 유지·old실행/CPU47/104 재실행·합산0 |
| 새 owner memory | CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY-RESULT 공식end `13ccc735-8e0b-4cdb-a218-0a17e82fbb1b`@2026-10-06T21:03:18.621Z/raw7642B/`e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96`. 첫stdin은 미존재snapshot.disposed 검사로exit1, 다음은actualproducer+fakeTHREE/scene 실dispose콜백 결함재현11PASS/exit0. 두실행·FIXED모델·root미채택을 구분, 실제브라우저/GPU·수정완료로세지않음 |
| 다음 승인 단위 | 기존owner가 새 terrain변환콜백 중 종료와 effect.update throw→RAF중단 정책2접점을 조사 중. 새공식end/정확핀만 이어수집하고 동일TASK/7·11모델 재송신·재실행0. root 허용 최소실구현은 성공committed수와pending소유를분리하고 disposed후live재게시·rollback중복해제·attach후remove실패를 숨기지 않는 producer/consumer 순서 |
| 콘텐츠 의존성 | 실제Haran/Berin/Nessa/Dorik4/NPC유품종류질문pending은 그대로. dependent지급item·quantity·Lin퀘스트정의/동일slot inventory+ledger ACK/readback 미구현만답대기, 독립수명·맵·에디터제작지속 / STORY큐중복송신0 |

코드 변경 뒤 whole docs 관련keyword검색49경로662줄/raw1406762B/`2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`, precise20경로313줄 disposition을 기록했다. 처음 overescaped scene.add 항목은 누락구성요소만1회검색·union dedup했고 최초검색파일을보존했다. worker현재source/docs2와 root 관련현재참조16문서에 새핀·계약·인수상태를 동기화하고 과거fullprefix/EOF LF1을 보존한다. ownerSTATELOG·보호2_3·타인WIP·원PNG/scene/nav·user save 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=actor constructor owned resource unwind; OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/SMALL DETAIL=기존맵geometry·배치·원화·nav·대화/보상 변경0, guide/SSOT/LOCK 유지. CAMERA QA=이번 새화면/영상0, 이전endpoint화면에서배경확대흐림미해결. TECH QA=source1접점역변환exact/새6그룹 유의미24조건 PASS와raw25의제외1분리; constructor실패CPU/fakeport이고GPU/실게임아님. ACTUAL MAIN/NATIVE6/AUDIO/SAVE=A급 포함 미인수. **VISUAL VERDICT: RETOUCH / 이번 시각 NOT ASSESSED**. WOLF 거절목적 HOLD·피해UNKNOWN과이전모든실패이력은 그대로보존한다.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

다음 미완료: 맵 흐림·절벽 접합 시각 품질, rig.snapshot/render fatal frame 복구, NPC 유품·부탁의 본편 durable 소비자, 실제 native6·청취·보상 save. 최신 운영 근거는 PROJECT_MANAGEMENT_MASTER와 연속 dispatch 정본을 따른다.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.


## 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 마스크의 원본 해상도 비교

이 절은 실제 `tools/map-scene-editor.js` 소비자 구현을 기록한다. 기본 경로는 기존 긴 축1024 중간 버퍼다. 사용자가 선택한 단일 composed-mask 객체만 로드된 이미지의 원본 crop 해상도로 비교할 수 있다. Three plate 필터, source-native 그림 생성, 원 PNG 변경, 본편 세이브/보상 연결을 의미하지 않는다. 현행 canonical 씬에서는 `obj-rift-depth`가 해당 경로다. 전경3은 mask가 있어도 feather0/sourceParallax 없음으로 직접 clip+원본 draw 경로이며 이 옵션을 적용하지 않는다.

### 현재 코드·소유·선행 근거

| 항목 | 정확 근거 / 상태 |
|---|---|
| 원 source | tools/map-scene-editor.js 77031 B / cd789d1d10c96feeb8decfd8209410640b1baba02f5b28ed32fbf682e1f0c20e. 수정 전 HEAD237bfc3ddc199a5b6ab989b241a83515b71a8a91와 byte exact·git clean, realparent/symlink 검사·fullbyte 외부 백업 선행 |
| 최종 source | tools/map-scene-editor.js 82229 B / 4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd. 소유 code1, 새 helper0. UI leaf 문구 정정 외 마지막 CPU 핀과 계산·cache 코드 동일 |
| source CPU 핀 | 82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6. 단일 신규 Node 실행10그룹129조건 PASS / FAIL0·미도달0·exit0·stderr0. 이 검사는 해당 핀의 이력이며 최종핀 전수 재실행·합산0 |
| 문구 정정 | 기존 옵션의 ‘원본 축소’ 표현은 작은 crop의 확대를 포괄하지 않아 ‘기존 중간 버퍼 · 최대 축1024’로 문자열1개 정정. 원82218/Bd89 bytes 외부 code129-before-label.js 보존, label 역변환 exact. 새 수학검사0/전체source검사 반복0 |
| 맵 선행 | full guide18392 B / 607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b의 이전 전체 읽기 근거 재사용. 이번 _MAP_SSOT_INDEX228193 B / e084a27d788a82c7bb901592cb23b733c214273372e477d4b0bb094d1884015e의 읽기순서237–289·마스크분리920–943·최신1334–1370 읽음. stage LOCK39679 B / 94081b2aef08771384fb2032dab42f12c3cde57227558f8a11b772690e13451a 이전 선행 유지 |
| 원자료 제안 경계 | MAP memory formal end117a2b1c-ca3a-4b43-bf0a-c1c8dfd9241e는 분석/제안. 새 임의8192 cap·feather를 native aspect로 바꾸는 제안은 그대로 채택하지 않음. raw62 7258B/603b… 후보·stub 검수 반복0·직접 import0 |
| 불변 | scene/nav/geometry/카메라·세계크기/기존PNG/rig/player/save·2_3/Q전용/어택티켓 금지·타인WIP. 새 서버·게임·빌드·팀·전문송신·Git/index 변경0 |

### 비교 UI·크기·마스크·수명 계약

| id / 항목 | 기본 / 허용값 | 실제 적용·공식·범위 |
|---|---|---|
| scene-mask-resolution | select값 legacy/native, 초기 legacy/OFF | 기존 SIZE CHECK 카드에 새 label/select/leaf만 append. 기존 자식 내용 교체0. 표시 ‘기존 중간 버퍼 · 최대 축1024 (기본)’ / ‘원본 해상도 · 선택 객체만’. runtime preference이며 scene/history/JSON/localStorage에 기록0 |
| scene-mask-resolution-status | leaf p, role=status/aria-live=polite | 후보 legacy/native 치수·feather256·PNG export 기존 처리·실패 reason을 표시. 부모 textContent/innerHTML 교체0 |
| 선택 admission | 단일 selected 객체, playing=false, batchIds.size≤1 | mask 존재와 truthy maskFeather 또는 sourceParallax가 defined인 기존 composed 경로만 허용. 실제 원본 loaded와 source/crop 검증이 있어야 UI 활성. busy/playing/dialogueOpen·다중선택/무선택·미로드/원본불일치에서 비활성 |
| 표시 target | main ctx이면서 includeSelection=true | native 소비 허용. 다른 ctx/PNG export/render overlays=false는 legacy. 일반 mask의 직접 clip 및 residentLighting의 기존 graded 경로는 그대로 |
| legacy 크기 | ratio=1024/max(object.width,object.height) | w=max(1,round(object.width×ratio)), h=max(1,round(object.height×ratio)). 긴 축1024. source crop가 더 크면 축소, 작으면 확대하므로 ‘모든 원본을1024로 축소’라는 설명은 부정확 |
| source-native 크기 | w=ceil(crop.w), h=ceil(crop.h) | 실제 im.naturalWidth/Height는 양수 안전정수이고 asset.width/height와 같아야 함. crop x/y/w/h 모두 finite number, x/y≥0, w/h≥1, x+w≤naturalWidth, y+h≤naturalHeight. 임의8192 cap 추가0, 기존 picture()의 원본 각축8192 admission 그대로 |
| invalid native plan | source-dimensions-mismatch / invalid-source-crop / invalid-world-size | 새 native 버퍼를 만들지 않고 기존 경로 유지·진단 표시. 기존 scene import의 K.validate를 우회해 malformed scene을 허가하는 API가 아님. legacy 계산은 기존 원형 유지 |
| source registration | drawImage의 원 crop x/y/w/h 그대로 | source RGB/alpha byte·fractional crop 자체 변경0. canvas 정수 ceil 치수 안에 full crop을 매핑하고 출력 전체를 원 object.width/height에 그린다. crop 비율과 world 비율을 새 scene 값으로 덮어쓰지 않음 |
| mask coordinates | normalized polygon×각 canvas width/height | 기존 main draw의 world polygon clip 유지. 회전/flip/pivot/world 크기·불투명도·렌더순서/가림 변경0. native rasterization의 AA 픽셀 결과가 legacy와 같다고 주장하지 않음 |
| feather sample | 긴 축256, 기존 legacy canvas aspect 기준 | native도 legacyWidth/Height로 sample w/h를 계산하여 기존 world sampling 위치를 유지. polygon은 object world width/height 좌표, px=(x+.5)/sampleWidth×object.width 등 기존값. alpha=round(255×v²×(3−2v)), v=min(1,distance/maskFeather), inside만 적용 |
| feather composite | 동일256 alpha array → 현재 mask canvas | 기존 imageSmoothingQuality high와 source-over→destination-in→source-over 순서 유지. native mask/image 크기만 달라짐. 실제 Canvas alpha 보간·edge AA·중간 premultiplication은 별도 실제 검수 대상 |
| sourceParallax | 기존 factor=1−(sourceParallax??1) | dx/dy=(viewport−world centre)×factor, 원 inverse rotation/flip을 거친 lx/ly를 현재 w/h에 비례해 적용. screen CSS/DPR을 world distance나 feather120에 대입0 |
| stamp | legacy 기존 JSON 배열 exact | native만 source-native·actual naturalWidth/Height·buffer w/h 추가. crop/size/polygon/feather 변경은 기존 stamp 무효화. native source치수 바뀌면 무효화, 소스원본/다른 소비자의 cache 쓰기0 |
| cache 정책 | 기존 softMasks Map 최대8 entry | cache hit에서 순서갱신0, 생성/갱신 시 delete+set, 8 초과하면 첫 entry 삭제. 기존 insertion/refresh eviction이며 일반 LRU-hit 승격이라고 부르지 않음 |
| native 수명 | retained native 최대1 | 선택/옵션 전환마다 자기 softMasks의 이전 native entry만 제거. 다른 legacy entry를 전체 삭제0. playing/무선택/다중선택/직접clip 대상은 native entry0. 같은 object에 모드별 cache2개 만들지 않음. import의 기존 softMasks.clear 유지 |
| mode change | 기존 selection/scene 유지 | 문자열 legacy/native만 반영, 임의값은 선택 UI 값 복구. dirty=true로 기존 RAF 재그림, history/change/autosave/asset 재로드/새RAF/timer0. setBusy의 기존 UI 재활성 위치에도 비교 UI 상태 갱신 |

### Canonical 씬 실제 소비 대상과 메모리 구분

| 객체 | actual source/crop px | 기존 버퍼 / 후보 native px | 실제 composed 적용 |
|---|---|---|---|
| obj-rift-depth | 1920×1920 / (0 / 0 / 1920 / 1920) | 1024 × 1024 / 1920 × 1920 | 선택 시 비교 가능 |
| obj-west-root | 1254×1254 / (332.30999999999995 / 727.3199999999999 / 100.32 / 112.85999999999999) | 910 × 1024 / 101 × 113 | 직접 clip 경로: 이 옵션 미적용, 두 치수는 계산 참고만 |
| obj-east-horn | 1254×1254 / (884.0699999999999 / 520.41 / 56.42999999999999 / 156.75) | 369 × 1024 / 57 × 157 | 직접 clip 경로: 이 옵션 미적용, 두 치수는 계산 참고만 |
| obj-south-root | 1254×1254 / (739.8599999999999 / 984.39 / 81.50999999999999 / 100.32) | 832 × 1024 / 82 × 101 | 직접 clip 경로: 이 옵션 미적용, 두 치수는 계산 참고만 |

| 메모리 항목 | 정확 의미 / 계산 |
|---|---|
| owned retained buffer | entry마다 image+mask canvas2장, RGBA 추정8×w×h bytes. snapshot은 실제 현재 canvas 치수의 합계. backend GPU/실제 heap·원본 Image·일시256 sample canvas는 이 추정에서 제외 |
| 기본 legacy 정사각형8개 | 8×2×1024²×4=67,108,864 bytes=64MiB. 기존 최대8 entry 정책 유지 |
| canonical abyss native1 | 2×1920²×4=29,491,200 bytes=28.125MiB. native1+legacy 정사각형7개라면88,211,456 bytes=84.125MiB, 원 이미지/AA backend 제외 |
| 기존 최대원본 admission에서 native1 | 기존8192² full crop의2canvas 추정536,870,912 bytes=512MiB. legacy square7개와 합산하면595,591,168 bytes=568MiB. 새cap이 아니며 기존허용이미지로부터 나온 상한 추정. CPU의8192 case는 실제Canvas 할당이 아닌 port 치수 관측이며 그 할당·OOM/GC/실GPU 인수0 |
| 작은 crop | native 버퍼가1024보다 작을 수 있고 기존 중간 확대를 줄일 뿐 새로운 디테일을 만들지 않음. canonical foot3은 직접 source clip이므로 본 옵션으로 그 절벽·뿌리 흐림이 개선됐다고 계산0 |

### Read-only QA API

`window.EXODUSER_SCENE_EDITOR.maskResolution()`은 frozen plain snapshot이며 모든 필드는 primitive다. 기존 snapshot/view/selection/importProject 등 공개 메서드 계약을 바꾸지 않는다. 런타임 선택·loaded Image·현재 자기 cache를 읽을 뿐 파일·씬·세이브를 쓰지 않는다.

| 필드 | 뜻 / 값 |
|---|---|
| mode / selectedObjectId | 요청 모드 legacy/native / 현재 적격 객체 id 또는 null |
| ready / reason | native source-plan 검증 boolean / source-native-crop, legacy-1024, invalid… 또는 source-not-loaded/selected-composed-mask-required |
| sourceWidth / sourceHeight | 실제 로드된 image natural 치수 또는 null |
| cropWidth / cropHeight | 원 asset crop 치수, 소수 가능 / null |
| legacyWidth / legacyHeight | 기존 world-aspect1024 중간버퍼 계산 / null |
| nativeWidth / nativeHeight | 유효 crop ceil 치수 / invalid 또는 미로드면 null |
| activeMode / activeWidth / activeHeight | 실제 선택 entry의 native/legacy·canvas 치수 또는 null. 요청과 그려진 entry 상태를 구분 |
| cacheEntries / nativeEntries | 현재 자기 cache 크기 / native entry 수 |
| retainedRgbaBytes | 현재 retained2canvas의 치수 기반 RGBA 추정 합계. 실GPU·heap memory 측정 아님 |
| maxEntries / maxNativeEntries | 8 / 1 |
| featherSampleLongAxis | 256 |
| scope / exportMode | selected-main-canvas-composed-mask-only / legacy |
| visualAccepted | false. 이 source/diagnostic 자체는 시각 인수 API가 아님 |

### 새 source 검수와 실제 Canvas 관측 경계

| 신규 source 그룹 | 실제 조건 수 | 검수 범위 |
|---|---|---|
| syntax-full-source-and-current-pins | 4 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| legacy-default-operation-exact-and-feather-bytes | 12 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| native-source-crop-and-world-registration | 8 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| fractional-crop-aspect-and-world-feather-invariant | 5 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| invalid-native-source-bounds-refuse-native-allocation | 42 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| selected-only-export-direct-clip-and-multiple-guard | 7 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| cache-eight-entry-eviction-and-native-selection-lifetime | 19 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| cache-source-size-feather-invalidation-and-bounded-native | 6 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| ui-default-leaf-safety-change-and-readonly-snapshot | 11 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |
| inverse-exact-and-current-canonical-source-unchanged | 15 | PASS, 실제 변경source 경로·fixture boundary는 아래대로 |

검수는 최초 단일 Node1회, 실제 source VM·full script syntax 및 기존/신규 source접점 비교다. Canvas2D·DOM·Image는 software port fixture이고 실제 브라우저/GPU를 실행하지 않았다. 기본 legacy의 Canvas 호출 trace가 기존source와 exact이며 source가 만든 feather RGBA 배열은 두 해상도 모드와 비정방형 crop에서도 exact였다. 이는 실제 Canvas가 합성한 RGB/alpha framebuffer, 경계 AA, premultiplied interpolation, 실제 메모리/GC, export PNG byte equality를 입증하지 않는다. `drawObject`의 main/export/directclip 실제 분기를 fixture에서 호출했으며 renderer 결과 자체는 미관측이다. 기존 raw62/stub/oldChrome/plate11/153 등 재실행·합산0.

실제 byte/IHDR 읽기로 확인한 abyss는 assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png6350749B / ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991,1920²다. canonical scene90767B/c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a를 읽어 상기4마스크 metadata와 소비분기를 대조했다. 이 PNG의 RGB/alpha 픽셀은 worker가 decode/관찰하지 않았다.

| 실제 화면 후속 Gate | 현재 상태 |
|---|---|
| 같은원본·선택·viewport/CSS/DPR/rotation/pivot/parallax에서 legacy→native→legacy | root/helper 신규 실제Canvas 검수 대상. native 치수만으로 시각 개선PASS0 |
| source RGB/투명 alpha·mask 경계·world feather / 원본축소·확대 비교 | CPU source-array와 실제 Canvas pixels를 별도 기록. feather256 한계 유지 |
| selection/option 전환·cache8 evict·export legacy·복귀 / native allocation·GC | 실브라우저 별도. UI programmatic change와 trusted input도 구분 |
| 전체 맵 흐림 | 기존 plate1254→world8000·절벽접합/실높이·foot3 저해상도 유지. 신규 VISUAL NOT ASSESSED / 전체 RETOUCH |
| 본편/native6/audio/save/보상/A급 | 이번 단위 인수0 |

### docs 전체 검색·보존·외부 근거

전체 docs rg pattern `maskedPicture / softMasks / maskFeather / sourceParallax / source.native / 원본 해상도 / 1024.{0,35}(버퍼 / buffer) / 마스크.{0,35}(캐시 / 해상도 / 합성)` 검색57경로/447줄, raw1085255B/SHA 175531c6a1289e6d766334f05a5467e955ad235052e0e7d3792312751347d71a. 해당 원문은 외부 docs-keyword-search.txt, 모든 path의 disposition은 docs-search-disposition.json에 기록했다. 자기 MAP_SCENE_EDITOR 문서만 현재 계약 부록을 append하며 원277500B prefix100% 보존한다. root 현재정본·운영/SSOT·결과·Three 참조는 root에게 별도 전달하여 현행계약을 동기화하고, 과거 이력/다른system 수치/보호문서/ownerSTATELOG는 전역치환하지 않는다. 문서 EOF LF1·GFM table field 수·source 변경접점 전체 inverse exact·diff-check를 완료영수증으로 남긴다.

외부 evidence 전체경로: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-mask-source-native-ab/. preflight.json·before/tools/map-scene-editor.js·before/docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md·source-replacements.json·source-mask-check.mjs·source-mask-result.json·source-mask-process.json·code129-before-label.js·label-correction.json·canonical-mask-registration.json·docs-search-summary.json·docs-search-disposition.json·final-receipt.json을 범위별로 사용한다. final-receipt의 최종 code/doc pins와 root actualCanvas 자료는 서로 분리한다.

추가 새 API 키워드의 docs 전체 좁은검색(maskBufferResolution/maskResolution/scene-mask-resolution/retainedRgbaBytes/nativeEntries)은2경로10줄·raw2226B/SHA eade8ab92f2b99dd7ae7f8f7f986ec5b4af15a25330d873c7bb4cb32b37cec23다. 자기 최신부록과 owner SUPERVISOR_STATE가 매칭되며 후자는 원자료·메모리이력 보존/수정0이다. docs-new-api-search.txt와 docs-new-api-search-summary.json에 원문·처리범위를 남겼다.

### §23 MAP PRODUCTION REPORT

| 항목 | 이번 작업 / 인수 |
|---|---|
| STAGE / MASTER PLAN | 지옥의 틈 editor2D selected composed-mask source-native A/B, 기본legacy1024/OFF. full guide→SSOT reading order→stageLOCK 우선순위 적용 |
| LARGE OUTER MASS / LARGE SOURCES | 기존 LEFT/RIGHT/TOP/SOUTH silhouette·major holes·원PNG·crop metadata·원화 반복/배치 변경0. 기존물리절벽/height UNKNOWN 보존 |
| MEDIUM CONNECTION / GROUND CONNECTION | path/nav1192·world200²/T40·start/exit·원본feet·연결/ground texture 등록 변경0 |
| PLAYABLE / COMBAT | editor 기존보행/선택·protected design 유지. 새실게임/전투/native6·reward/save·audio 인수0 |
| LANDMARK/CENTER / SMALL DETAIL | 원본 landmark/거리·마스크 polygon·feather world120/sourceParallax.965 등 metadata 변경0. 새 에셋·원PNG resize/generation0 |
| CAMERA QA | worker 신규Canvas/실화면·영상0. 같은원본/viewport/DPR/selected object A/B는 root/helper 소유. source-native 크기만으로visual PASS0 |
| TECH QA | 새source10/129 PASS는82218/Bd89핀·Canvas/DOM fixture. 최종82229/4c037핀은 옵션label1교정+inverse exact, 원129 재실행0. cache8/retainednative1 및치수추정은source관측, 실allocation/GC/alpha compositing·GPU 인수0 |
| FILES / GIT | 소유 code1/doc1, 새helper0·원자료/타인WIP/ownerSTATELOG/Git/index 변경0. 원prefix/exactbackup/inverse 보존, code+docs checkpoint/push/remoteexact는 root 후속 |
| VISUAL VERDICT | 신규 필터/버퍼 비교 NOT ASSESSED. 전체 기존맵 RETOUCH. 본편A급/완성맵/실여정·청취·save PASS0 |
| NEXT PASS | root/helper actualCanvas 동일조건 A/B·alpha/mask/feather·cache전환/export/메모리; 그뒤 별도 NPC durable consumer와본편native6/청취/세이브. 모든시각실패이력보존 |
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

선택된composed-mask의기본legacy와실제첫복귀FAIL/관측안정화한정후속을분리하여유지한다. 원화·전경·절벽확대흐림은전체RETOUCH이며본편/native6·청취/save미인수. 다음fatalframe 소비접점과최신운영근거는PROJECT_MANAGEMENT_MASTER를따른다.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |
