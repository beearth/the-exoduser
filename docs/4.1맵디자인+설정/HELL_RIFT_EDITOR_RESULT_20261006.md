# 지옥의 틈 · 잔류자의 계곡 — 씬 에디터 결과

사용자 요청 “그걸로 결과물 만들어서 보여줘봐”에 따라 공유 이미지 씬 에디터로 실제 저장 가능한 구성 결과를 제작했다. 원화의 분위기를 유지하며 crop6조각·전경3조각·별도 심연1장으로 조립했다. 본편 채택 전의 편집·보행 시제품이다. 원화 속 인물은 그림에 포함되어 있으며 NPC/대화/보상·장 전환은 미연결이다.

## 결과와 실행

| 항목 | 현행 |
|---|---|
| 씬 | `assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json` |
| 직접 열기 | `http://127.0.0.1:3387/editor.html?scene=assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json` |
| 재현 | `node tools/build-hell-rift-scene.cjs` — source PNG/layout 무변, 결과 JSON만 결정적 생성 |
| 편집 | 레이어/객체 변형·크기/pivot·가시성·앞뒤·시차·soft mask·보행/충돌·PNG/JSON 왕복 |
| 규모 | 200×200 tiles / T40 / 8000×8000 world px, 10 assets / 10 objects / 6 layers |
| 현행 보행 | 그림 바닥에 맞춘 동측 corridor1192칸, 반폭2.75tile, radius12·4방향 BFS 방문1185 PASS. 시작(4020,7740), 출구(4020,1740). 원본8 cameraAnchors |
| 기록 | `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/` |
| 출력 | `hell-rift-overview.png` 2048², `editor-result.png`, `hell-rift-walk.webm`, `walking-verification.json` |

## 구성과 정확 수치

| 층 | 객체·배치 |
|---|---|
| west | 원화 서쪽 상·하 crop2, 돌 절벽·머무는 턱 |
| east | 원화 동쪽 상·하 crop2, 생체 절벽 |
| centre | 원화 중앙 상·하 crop2, 남쪽 진입·북쪽 상승로 |
| abyss | 별도1920² 심연 source→8000², opacity .38 / sourceParallax .965 / maskFeather120 world px |
| foot | 서쪽 뿌리 foot134 / 동쪽 뿔108 / 남쪽 뿌리173, 정확한 기존 polygon/crop3, y 정렬 |
| front | 새 전경용 빈 레이어1 |

전 층 layer.parallax=1. 원화1920²→8000²의 월드 배율은 정확히 **25/6**이다. 세 열 x 경계0/640/1280/1920, 두 행 y 경계0/960/1920에서 내부 경계에 원본1px overlap을 넣어 필터링 틈을 방지한다. crop 위치와 크기 모두 같은25/6배율로 변환한다. 이는 원화를 독립 편집 조각으로 만든 것이며, 원화 인물/바닥/절벽 전체를 투명 clean plate로 분리한 결과는 아니다.

심연 polygon tile bbox(74,61)→(115,163). mask는 월드에 고정하고 이미지 source만 viewport에 따라 이동한다. 경계 내부 거리 d에 smoothstep(min(1,d/120))을 적용하고 최종 polygon clip으로 밖으로 번지는 것을 막는다. 기존 nav의 균열 내부 중심·모서리0, 가장 가까운 타일 경계의 여유 최소56.57 world px라는 별도 대조가 있다. source shift는 clamp된 실제 viewport 중심과 world 중심의 차이에 .035를 곱한다. viewport 크기/줌에 따라 달라지며 start/exit metadata의 좌표를 그대로 쓰지 않는다.

원본 SHA256:

| 원본 | SHA256 |
|---|---|
| 승인 원화 | a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4 |
| 별도 심연 | ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991 |
| 원본 nav | 52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb |
| 원본 layout.js | 1b3fe7c4e0e97f6697651fd6c17c52a85de464d8f4f6946d838967f82bbbce21 |

## 결과물 보행 경계 재검수

초기 nav4107은 기술상 연결됐지만 실제 영상에서 (129.4,130.6) 및 x153.5/y79.5~94.5가 파란 허공을 지나갔다. 초기 영상과 trace는 `initial-route-evidence/`에 보존했다. 원본 layout/nav/PNG를 수정하지 않고 **결과 씬 JSON만** 동측 갈색 바닥과 상단 계단을 따라 재작성했다. 원래 서측 후보 길은 이번 결과물에서 보행 활성화하지 않았다.

| 계약 | 값 |
|---|---|
| 원본 nav | 4107칸 / SHA256 52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb, 기본 프리셋 그대로 |
| 결과 nav | 1192칸 / SHA256 a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179 |
| metadata | sourcePins.originalNav / nav / walkableCount, navigationReview.basis=painted-eastern-ledge / halfWidthTiles=2.75 / centreline |
| raster | 각 tile 중심과 polyline segment의 최소거리≤2.75이면1, 나머지0. endpoint도 같은 거리 사용 |
| 경로 | 4방향 radius12 BFS1185 방문 PASS, 실제 키종주267tiles/158turns |

| 순서 | tile x | tile y |
|---:|---:|---:|
| 1 | 100.5 | 193.5 |
| 2 | 102 | 184 |
| 3 | 111 | 176 |
| 4 | 119 | 167 |
| 5 | 123 | 161 |
| 6 | 131 | 154 |
| 7 | 140 | 148 |
| 8 | 145 | 143 |
| 9 | 149 | 138 |
| 10 | 152 | 133 |
| 11 | 155 | 128 |
| 12 | 156 | 123 |
| 13 | 160 | 119 |
| 14 | 161 | 114 |
| 15 | 160 | 110 |
| 16 | 159 | 106 |
| 17 | 156 | 102 |
| 18 | 152 | 100 |
| 19 | 146 | 97 |
| 20 | 140 | 94 |
| 21 | 134 | 92 |
| 22 | 129 | 89 |
| 23 | 129 | 85 |
| 24 | 130 | 81 |
| 25 | 130 | 77 |
| 26 | 131 | 73 |
| 27 | 133 | 69 |
| 28 | 132 | 65 |
| 29 | 126 | 62 |
| 30 | 119 | 59 |
| 31 | 111 | 57 |
| 32 | 103 | 56 |
| 33 | 102 | 50 |
| 34 | 100.5 | 43.5 |

## 캐릭터·카메라

기존 전사8방향 PNG1008×48, cell48²의 idle0~1/850ms·walk2~9/110ms 사용. 고정80/29배율과 source foot43, 방향별 idle 중심 고정으로 무기 스윙에 따른 크기/중심 출렁임을 막았다. 모든 원본 alpha는 보존한다. 실제 충돌 결과 dx/dy로 움직임·방향을 정하며, 막힌 입력은 제자리 idle다. 그림자25×11은1회만 그린다. exact actor 계약은 [에디터 SSOT](MAP_SCENE_EDITOR_20261005.md)를 따른다.

자동8카메라·보행 카메라는 viewport half extent로 월드 안에 clamp한다. 시작점 중심 때문에 하단31%가 그림 밖으로 보이던 검수 결함을 수정했다. 원본 start/exit/camera metadata는 이동하지 않았다. 편집용 자유 pan은 유지한다.

## 검수와 시각 한계

| 검사 | 실제 근거 |
|---|---|
| core | 29/29 PASS, 추가 query 경로·maskFeather/sourceParallax 검증 |
| editor 회귀 | 실제 Google Chrome UI15행동그룹 PASS, 페이지/HTTP4040 |
| 결과 씬 | 최종 독립 Chrome18/18 PASS: 원본/nav 핀·새1192/1185 경로·34점 실제canWalk·query/복구 저장·실제layer pixel/Undo·soft/hard edge·PNG2048²·JSON 왕복·8카메라 clamp·실제 북향85.344px 보행. 페이지/콘솔/요청/HTTP 오류0. final-acceptance/acceptance-report.json |
| actor | source/방향/프레임/접지/실패 처리8검사 및 tiles분기3검사 PASS. 기존8PNG 유지 |
| 실제 종주 | 수정된 길 실제 키 입력267타일/158 turns/36.445초, 도착(4025.184,1740.384), exit 오차5.20world px. JSON 불변/페이지 및 누락오류0/actor8방향loaded·errors0. 영상12,962,149 bytes |
| 화면 | 전체/8camera·실제 보행 중간캡처9장과 출구1장 육안 검수. 발·그림자는 갈색 지면/턱/계단 위이며 초기 허공 통과 수정. walk5/6/7은 y62.58/62.58/61.64로 y70~85 정지포즈가 아니며 그 구간은 실제 연속영상/키trace/nav 오버레이로 확인. 원화 crop joins와 심연 경계에 뚜렷한 직사각 seam 없음 |
| 한계 | 이동 가능 확인을 바닥과 발의 시각 정합성으로 확대하지 않는다. 초기 허공 통과는 결과물 corridor 재보정으로 수정했다. 원화 인물과 전사 간 시각 크기·원근 차이, 주민/잔불의 독립 collision과 전체 전경은 후속이다. 전경3조각 외 완전 깊이/높이 물리는 미구현 |

## MAP PRODUCTION REPORT

STAGE: 독립 이미지 씬 결과. 본편 stage·35필드·LOCK 교체0.

MASTER
- silhouette: 비대칭 돌/생체 절벽과 세로 균열, 남쪽 도착·북쪽 상승.
- regions: 하층진입/잔불/멈춘망자/서쪽우회/부탁의턱/심연/준비/계단8 프레임.
- main route: 동측 그림 바닥/계단을 따라1192칸 corridor, 남쪽→북쪽 실제 키종주. 원본 양측4107 프리셋 불변.
- side spaces: 원화의 인물·잔불 자리, 런타임 대화0.

OUTER MASS
- LEFT / RIGHT / TOP / SOUTH: 승인 원화6crop을 같은world 배율로 연결. 동형 천막/scatter 추가0.
- major holes: 중앙비보행 균열 유지, 고정마스크 안에 후경.

LARGE
- source assets: 원본 bitmap2종, PNG무변.
- composites: crop6/정확 전경3/심연1=10객체.
- overlap: 내부source1px guard, 전경은foot y 정렬.
- repeated silhouette: 새 반복 root 소품0, 재질이 다른 붉은/픽셀 팔레트 소품 미사용.

MEDIUM
- connections: crop/world25/6 통일, 균열 source만 이동.
- remaining holes: clean plate·전경전체·높이 모델·독립 주민과 원근 크기 정합.

GROUND
- shadow: 기존 원화 접지, 캐릭터 타원25×11 1회.
- contamination: 기존 돌·생체 재질 보존.
- structure integration: 원화6파트/soft boundary 연결. 초기 동측 허공 길 수정. 독립 주민·원근 크기·높이는 RETOUCH.

PLAYABLE
- main arenas / travel / breathing / threat: 독립 거점 보행, 새 적/전투 변경0.
- combat readability: 전투·보스 인수 미실시.

LANDMARK
- primary: 밝은 북쪽 계단과 깊은 균열.
- secondary / tertiary: 양측 머무는 턱·잔불·망자, 대화 연결0.

CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 실제 Chrome8카메라 캡처, 최초 하단빈공간 발견→자동뷰 clamp 수정. 최종 외부 final-visual-review 확인. 보행면/카메라/crop 접합 PASS, 전체 원근·NPC·전경은 RETOUCH.

TECH QA
- route: core/실제키종주 PASS; 그림 바닥 정합과 구분.
- collision: radius12, 새 결과1192 corridor만 변경. source PNG/layout/원본nav 변경0.
- pageerror / 404 / loading: 독립검수·실제종주 오류0, query/JSON/decode 원자성.
- seam: crop 접합·심연 soft edge 시각 점검.
- performance: mask cache8entry/16canvas/longaxis1024·alpha256. 최대전체 스트레스/실게임FPS 인수0.

FILES
- stage-owned: editor.html/core/editor/actor/builder/검사3/sceneJSON와 관련docs7.
- concurrent touched: 타인WIP·오더STATE/LOG·사용자세이브·기존23변경 보존.
- unrelated touched: 0. 보호2_3/Q-only/어택티켓금지 유지.

GIT
- staged / commit / push: 완료소유만 정확경로 checkpoint, 원격 exact SHA 영수증 보존.
- deploy: 패키지·외부게시·자동화·Windows0.

VISUAL VERDICT: **RETOUCH** — 구성/저장/기존전사 이동 결과는 제작했지만, 모든 발 위치·높이·인물/NPC를 포함한 A급 본편 맵 인수는 아니다.

NEXT PASS: 전체 전경·원화 인물 분리/크기 정합·런타임 대화·다음 구간 gate를 연결한다. 본편채택 후 같은후보 실제6단계·청취를 인수한다.


### 2026-10-06 KST 최신 — Claude8 실제 재개 / 완료 후보7 보존

유일 Claude 오더담당의 01:01:43Z 기존8 역할 정상 전달·peer8/Read8/source8 및 최초 완료7의 end_turn/정확 파일 핀을 확인했다. 앞의 송신0/EPERM은 조치 전 이력이며 현재 Claude8 재개를 덮어쓰지 않는다. [완료 raw7·정확핀/endID·검수 경계 정본 §12](CH1_1_A_GRADE_PRODUCTION_20261005.md#12-claude8-실제-재개완료-후보7-원자료-보존--2026-10-06-kst)에 따른다. ART/SKILL/QA/ANIMVFX/BOSS/STORY/MAP의 독립 후보7을 생산 미채택으로 보존하고 JSON3 parse/MJS4 문법 검사 PASS를 기록한다. ENEMY 최초 turn·다른 WIP/live STATE/LOG/세이브·기존23 제외. root는 raw7+관련 docs8만 checkpoint하며 실제80부터 상세검수 대기 없이 완료소유를 보존한다.

완료7팀 후속은 유일 오더담당의 독립 메모리 조사 각1회·새 파일0/raw수정0. 자동화 중지·새팀/세션/권한/인증 변경0, 관리3/전문15=전체18 유지. Codex7 새 제작착수는 미확인. 공유 editor/core/actor/틈 결과/nav1192·본편 무변. NPC 대사/보상·분위기 consumer·장 전환/본편6단계·실청취 연결은 미완료이며 **VISUAL RETOUCH** 유지. 후보 제출/문법 PASS/Git 보존을 게임 완성이나 A급 인수로 계산하지 않는다.


## 2026-10-06 최신 — 안개·잔불의 실제 에디터 연결

공식 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**. [씬 에디터 정본 §9](MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer)에 활성·좌표·mask/nav·전사 제외영역·캐시·색/수명/크기/alpha·서버 MIME·UI/export/검사 계약을 기록했다. ANIMVFX raw는 그대로 두고 별도 world adapter로 저장된 틈에 장식만 채택했다. 직전 consumer 미완료는 당시 이력이며 현재 **editor 분위기 consumer 구현**; NPC 대화/보상·장 전환·본편 consumer는 미완료다.

### MAP PRODUCTION REPORT — 분위기 통합 pass

| §23 항목 | 이번 결과 |
|---|---|
| STAGE / MASTER | 격리된 잔류자의 계곡. 비대칭 균열/남쪽→북쪽 보행·8카메라·side space의 기존 scene 유지 |
| OUTER MASS / LARGE | LEFT/RIGHT/TOP/SOUTH·major holes·source2bitmap/crop6+전경3+심연1=10객체 그대로. 신규 scatter·반복 silhouette·생산 bake 변경0 |
| MEDIUM / GROUND | 연결/접지·재질 기존값 유지. ground22안개를 실제nav centre에 clip. clean plate/인물 분리·원근/높이 후속 |
| PLAYABLE | 기존radius12/1192 corridor 유지, 실제 WASD 검수. 적/전투/위협/gate 변경0. 장식 주변 전사 제외 x±40/y−96…+24 |
| LANDMARK | 기존 균열/북쪽 계단·망자/잔불 자리 유지. 실제 대화·보상 아직0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT의 camera0…7 actual PNG를 root가 열어 검수. 새 장식의 큰 가림·허공 위치 문제 미관측. 시작부 큰 빈 지면·원화 grain·독립 NPC 크기/전경은 RETOUCH |
| TECH QA | core29 + adapter10 + animated browser9그룹 + static18 + editor UI15 PASS. source/nav 불변·export on/off PNG 동일·오류0·reduced-motion OFF 확인. loading MIME .mjs 수정. 전체 stress/FPS·본편 combat/native/audio 미인수 |
| FILES | editor.html/server.cjs/scene editor JS/새 adapter/adapter 검사/정적 틈 검사=code6. raw/scene/core/actor·보호2_3·타인WIP/liveSTATE/LOG·세이브·기존23 무변 |
| GIT | 완료 소유 code+관련 docs만 stage/commit/push, 사전백업 및 exact SHA 영수증 외부보존. 게시/게임 패키지/Windows/자동화 재개0 |
| VISUAL VERDICT | **RETOUCH**. 편집/보행·장식 consumer는 구현. A급 본편 맵 완료를 의미하지 않음 |
| NEXT PASS | 원화 인물 분리·캐릭터/NPC 크기/접지, 접근 가능한 NPC 위치와 실제 대화·보상/진행 consumer 연결, 같은후보 native6단계·청취 검수 |

씬SHA `f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac`; navSHA `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` / nav1192·radius12 BFS1185 불변. 격리3387에서 현재 결과를 열 수 있다. `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ambience-integration-20261006/qa/editor-walking.png`는 실제 편집기·전사 화면이다. 기존36.445초 보행영상은 이번 장식 연결 이전 결과로 구분한다.


## 2026-10-06 최신 — 네 망자에게 실제 접근하는 대화 시험

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. [씬 정본 §10](MAP_SCENE_EDITOR_20261005.md#10-2026-10-06--지옥의-틈-망자-대화-시험)에 정확 API·위치·수치·UI·시험기록을 동기화했다. source/raw/nav 불변이며 현재 실제 에디터 대화는 구현, 실제 선물/부탁 등록·저장·장전환·본편/native는 미완료다. 이전 “대화 미구현”은 당시 이력이다.

================= MAP PRODUCTION REPORT =================

STAGE: 지옥의 틈 · 잔류자의 계곡 / isolated editor dialogue preview v1

MASTER
- silhouette: 승인 비대칭 계곡·중앙 심연·상승 계단 유지.
- regions: 현행200×200/T40/8000², source10객체/6층 유지.
- main route: 남쪽4020,7740→동측그림바닥→북쪽4020,1740 유지.
- side spaces: 하란/베린/네사/도릭 접근점4; 서측 새 보행면 추가0.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 기존 원화·큰 질량·심연 그대로. 본 작업 새 bitmap0/대체0.

LARGE
- source assets: painterly-v2/abyss-v3 원본 및 STORY25940B/22nodes/37options 불변.
- composites: 승인 원화6crop을 위치/크기25/6·pivot/rotation0·flipfalse로만 주민활성.
- overlap/repeated silhouette: 추가 주민 body0. 기존 CH1 NPC 재배정0; 원화 인물 반복/크기 후속.

MEDIUM
- connections: 접근8점 radius12/start연결 PASS, rawPOI4는 접근불가여서 소비0.
- remaining holes: 실제 NPC body/collision·장간/스테이지간 본편 거점 연결 미인수.

GROUND
- shadow: 기존전사25×11 그림자 유지, 대화중 idle 전환.
- contamination/structure integration: 기존갈색바닥·grain 그대로; 새clean plate0.

PLAYABLE
- main arenas: 에디터 시험이며 실제 전투arena 인수0.
- travel space: 실제키입력으로4접근점 도달, scene/nav/PNG/저장 불변.
- breathing space: F/버튼→대화·선택·Esc→같은위치로복귀; focus/held/보행잠금 검수.
- threat space/combat readability: 안전대사 시뮬레이션; AI·공격수치·스폰 변경0.

LANDMARK
- primary: 중앙심연/북쪽상승계단 유지.
- secondary: 네 망자의 안내·유품·구출부탁·상승대사 trial.
- tertiary: 가까운NPC1명만 표시foot 이름·logical접근표식.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8camera 장식검수 유지; 이번4접근 실제보행 화면과 desktop1500×960/mobile390×844 대화 화면 확인.
- 추가: viewport중앙 dialog, 모바일가로overflow0, 선택/닫기16px/44px이상. 원화주민과전사크기·확대재질은 RETOUCH.

TECH QA
- route/collision: 기존nav1192/radius12 BFS1185; 실제4보행12dialogue검사 PASS.
- pageerror/404: pageerror0/consoleerror0/HTTP≥400 0.
- seam: 원화/scene/crop/navigation 변경0; 새로운height/Z 인수0.
- loading: STORY fetch256000B/JSON serialized128000chars 이하, 실패 시 시험만비활성.
- performance: nearest4/직선20px검사·ctx추가transform0. 전게임FPS/대형씬스트레스 인수0.
- regression: core29/안개10/대화15/원본UI15그룹 PASS. UI reload race·Tabescape·좌상단dialog를수정하고 실패이력보존.

FILES
- stage-owned: editor.html/map-scene-editor.js/css/map-scene-rift-dialogue.mjs/test-map-scene-rift-dialogue.cjs/test-map-scene-ui.cjs code6 + 관련docs11.
- concurrent touched: 기존오더 STATE/LOG/WIP/backup normalize 그대로.
- unrelated touched: 0. 원화/STORY/scene/core/actor/game.html/index.html·사용자세이브·보호2_3/Q-only/어택티켓금지·기존23 보존.

GIT
- staged/commit/push: 완료소유 code6+docs11만 좁게 checkpoint; 원격정확SHA는 외부receipt.
- deploy: 게임패키지/게시/새서버0. isolated3387 headlesseditor만검수.

VISUAL VERDICT: **RETOUCH** — 대화UI/입력/접근 시험 완료. 원화주민의 독립body/원근·게임높이·실제보상/진행·본편/native/청취는 미완료.

NEXT PASS: 기존오더담당에게 다음 승인 통합 의존성을 전달하고, 네 주민의 독립화/사이즈와 실제 선물·구출부탁·장진행 bridge를 각각 검수한다. 오늘2026-10-06 KST19:00 완료·미완료·화면·기술검사·정확Git을한번보고. 현재전문15/관리3 구조와 타인WIP 유지.

## 2026-10-06 최신 — 그림 위치를 유지하는 접지점 편집

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 정확 API/수식/숫자/UI/저장 계약은 `MAP_SCENE_EDITOR_20261005.md` §11. source 그림과 결과 씬을 재제작하지 않고 이미지 씬 에디터에서 접지점만 편집한다.

================= MAP PRODUCTION REPORT =================

STAGE: 지옥의 틈 · 잔류자의 계곡 / isolated image-scene editor foot-anchor tool

MASTER
- silhouette/regions: 비대칭 계곡·중앙 균열/200×200/T40/8000²/6층10객체 유지.
- main route: 남쪽4020,7740→동측→북쪽4020,1740, corridor1192/radius12/BFS1185 불변.
- side spaces: 기존 네 망자 접근점과 editor dialogue trial 유지. 새 서측 보행면0.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 기존 원화 큰 질량과 심연 유지. 지형·좌표 변경0.

LARGE
- source assets/composites: 승인 원본2bitmap·6crop/전경3/심연1 유지. 실제 픽셀 편집0.
- overlap/repeated silhouette: 새 scatter/캠프0. 새 발 기준은 정렬 anchor이며 FOOT y 앞뒤가림에 사용됨. 원화 주민 분리는 아직0.

MEDIUM
- connections: source/world25/6/crop/nav 불변.
- remaining holes: clean plate·독립 NPC와 크기/원근·높이모델·본편 gate 미인수.

GROUND
- shadow: 기존 전사25×11·body80world px 유지.
- contamination/structure integration: 기존 재질·grain 유지. 포인터 anchor만 바꾸어 그림/마스크 world 점 보존; 자동 feet/body 추정은0.

PLAYABLE
- main arenas/travel/breathing/threat/combat readability: editor-only 접지점 편집. 기존 보행/대화 consumer 유지. 적·전투·보스·실제 지급/세이브·장전환 변경0.

LANDMARK
- primary: 중앙심연/상승계단 유지.
- secondary/tertiary: 네 망자/잔불 및 시험 대화 유지. 새 랜드마크0.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8camera 근거 유지, 이번 새8camera/native 인수 없음.
- 이번 화면: 실제 desktop1500×960 정방향·회전/flip의 앞뒤 PNG 동일, mobile390×844 enabled44px 버튼/지도 클릭/패널 복귀. root가 최종 workspace와 mobile PNG를 열어 확인.

TECH QA
- route/collision: 기존 scene/nav 원본 핀과 JSON 그대로. 단위 검수에서 reanchor 전후 canWalk/route 불변.
- pageerror/404/loading: 최종 pointer13 및 UI15에서 pageerror/HTTP≥400/누락0, 저장 exoduser:map-scene:v1만 사용.
- seam: 전후 PNG byte 동일, crop/mask corner/foot 오차 <1e−8. 원화 접합에 새 seam 추가0.
- performance: 클릭 때 수식/History validation만 추가; frame alpha read/raster 추가0. 대형스트레스/실게임 FPS 인수0.
- regression: core33/33, 실제 pointer/mobile13그룹, 최종 기존 UI15그룹 PASS. 최초 과도한 pointer 좌표 허용오차의 실패 이력도 외부 보존.

FILES
- stage-owned: editor.html, tools/map-scene-editor.js, tools/map-scene-core.js, tools/test-map-scene-core.cjs의 코드4 + 관련docs12.
- concurrent touched: raw6은 별도019ba22d commit의 후보미채택 보존. MAP/QA 공식 완료 미확인 WIP 및 live STATE/LOG는 본 commit 제외.
- unrelated touched: 0. 원화/STORY/scene/actor/game.html/index.html·보호2_3/Q-only/어택티켓 금지·사용자세이브·기존23 유지.

GIT
- staged/commit/push: 완료소유 코드4+docs12만 정확경로 checkpoint, 사전백업·내용핀·원격 exactSHA는 외부 receipt.json.
- deploy: 게시·게임패키지·Windows·새 서버·기존 paused 자동화/메일 재개0. 격리 editor3387만 사용.

VISUAL VERDICT: **RETOUCH** — 접지점 편집은 구현/화면검수했다. NPC 원근 크기·clean plate/독립body·높이·실제보상/진행·본편/native/청취·A급완성은 미인수다.

NEXT PASS: 각 실제 NPC의 foot/body scale과 독립 레이어 clean plate를 정확히 맞춘 후보를 검수하고 채택한다. 기존 player80world px와 scene identity/transform이 맞지 않는 후보는 소비 보류. 오늘19시 실제 화면·검증·Git·남은 문제를 한 번 보고한다.


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


## 독립 주민 후보 MAP PRODUCTION REPORT (2026-10-06)

================= MAP PRODUCTION REPORT =================

STAGE: ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006 / 독립 주민 배경·크기·접지·현재 foot 대화 / 에디터3387

MASTER
- silhouette: 승인 원화의 계곡 양측/상승계단 구성을 유지한 파생 plate; 세부 픽셀·지형은 새 생성이므로 정확 복원 주장0.
- regions: 남쪽 진입/잔불/서측 턱/동측 주민/중앙심연/북쪽 상승.
- main route: 기존1192nav의 남쪽 시작→동측→북쪽 출구; geometry 재제작0.
- side spaces: 서쪽 턱 이미지 보존, 이번 실제 주민 접근4는 검수된 corridor 안.

OUTER MASS
- LEFT: 기존 west2 world/crop 연결, 새 plate source.
- RIGHT: 기존 east2 및 생체뿌리 world/mask 유지.
- TOP: 북쪽 계단·출구 marker(4020,1740) 유지.
- SOUTH: 남쪽 시작(4020,7740), 하란은 기존남쪽뿌리 가림을 피해 foot(4660,6660)으로 이동.
- major holes: 중앙심연 기존 abyss source1920², no_walk 유지.

LARGE
- source assets: 기존 painting1920² 참조의 clean plate/주민atlas1254², 원본 PNG 불변.
- composites: 그림6crop+가림3crop source scaling209/320, abyss1, 독립주민4; assets14/objects14/layers6.
- overlap: 원화 baked사람 제거 후보+독립4body. south-root와 하란 bbox 간격35.77854671280277worldpx. 완전 실루엣 추출은 아님.
- repeated silhouette: 같은 천막 추가0; 원본 cliff/roots 재료 유지.

MEDIUM
- connections: world/map mask/nav 불변, 네 NPC 접근 실제 WASD 완료.
- remaining holes: 전체 절벽 정확 투명층·근사mask의 다른 지점 접지·고해상도 세부·높이 물리 미인수.

GROUND
- shadow: 기존 player25×11 접지 그림자 유지. 주민 개별 접지 그림자/조명 반응은 미구현이며 재질/발시각 RETOUCH.
- contamination: 갈색 토양·생체 뿌리·잔불의 새 생성 grain; 확대시 blur 관찰. 원본과 색/지형 세부 변경을 별도 후보로 명시.
- structure integration: floor/opaque cliffs 원근이 한 그림 기반인 한계 유지. 단위 좌표와 보행 PASS를 높이 구현으로 계산0.

PLAYABLE
- main arenas: 이 씬은 비전투 틈; 1-1 전투장/보스 인수0.
- travel space: 시작→하란→베린→네사→도릭 실제 키보드4보행, nav1192/radius12.
- breathing space: 주민 접근F·4대화22nodes/37options, mobile390×844 실제44px버튼·16px문자.
- threat space: 적/공격/구울/장 gate 제작0.
- combat readability: 전사와 standing주민 본체80 기준 비교만 확인; 전투탄/적밀도 검수0.

LANDMARK
- primary: 심연의 빛과 위로 향한 계단.
- secondary: 네 망자·동측/남쪽 잔불.
- tertiary: west/east 생체뿔/뿌리, 새 장식0.

CAMERA QA
- START: camera-0 하층진입, floor 연속; 확대 grain/인물 재질 RETOUCH.
- EARLY: camera-1 남쪽잔불, 절벽턱/토양 확인; 주민을 카메라POI에 강제 배치0.
- ARENA: 비전투 씬으로 전투장 미인수; camera-2 망자의 턱 실제 프레임 보존.
- SIDE L: camera-3 서쪽우회로, 기존 roots 연결.
- SIDE R: camera-4 부탁을 품은 턱, 네사 본체/잔불 관찰.
- LANDMARK: camera-5 심연의 빛, 고정 abyss 가림 확인.
- LATE: camera-6 상승준비, 도릭/계단 연결 관찰; 높이 이동은 실제Z0.
- EXIT: camera-7 북쪽상승로 marker가 계단 위. 실제 장 전환0.

TECH QA
- route: BFS1185/start→exit PASS, 네 접근/foot radius12, 하란 접근→foot 4px 간격11샘플.
- collision: 원본 nav SHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179, nav편집0.
- pageerror: 실제4보행10완료그룹/최종targeted8/기본UI15의 pageerror0.
- 404: HTTP누락/console error0.
- seam: source1254/1920 등록 계약과 원본world overlap 유지. 최종 high PNG export 전후 byte 동일; 전체절벽 alpha seam 인수0.
- loading: strict source pins/crop/aspect/dimensions와 원본 baked 지원, 주민숨김/Undo 비활성/재활성 검수.
- performance: 새 그림합계3299247B, alpha body4 추가. 기존 foot sort 사용. 실게임 FPS/GPU대형stress 미인수.

FILES
- stage-owned: renderer/ambience/dialogue/residents/builder/test 코드6+새PNG2+미채택씬v1/v2 2=코드10, 관련docs12.
- concurrent touched: live supervisor STATE/LOG·ART_TEAM_MASTER·MAP 독립HTML·기존raw후속WIP 제외.
- unrelated touched: 0. 원본 game/index/PNG/STORY/scene/보호2_3/Q-only/어택티켓금지/사용자세이브/기존23 보존.

GIT
- staged: 위 완료소유22정확경로만 보존. 다른 staged가 있으면 중단.
- commit: code+docs 함께 checkpoint; 내용핀/백업은 외부 receipt.
- push: 정상 origin branch push와 원격 exact SHA 확인 후 receipt에 기록.
- deploy: 게시/패키징/Windows/중복게임/설치/인증0. 기존 paused 자동화/메일 재개0.

VISUAL VERDICT: **RETOUCH** — 독립4body의 크기·실보행·현재foot 대화는 구현. 새 plate grain/원본과 달라진 세부지형/정적 주민 재질·접지그림자/독립 전체절벽·높이·본편/native/청취/A급완성 미인수.

NEXT PASS: 이 후보/정확핀을 기존 ART/MAP/ANIM/QA의 실제foot·가림·카메라 후속에 인계하고, 실제 ITEM/QUESTNPC 원자 지급/진행 포트는 별도 구현한다. 19시 오늘 실제 결과·영상·Git·남은 문제를 한 번 보고한다.


### 2026-10-06 주민 소비자 후속 완료2 미채택 보존 — ROOT-CLAUDE8-RESIDENT-RAW2-BATCH1-20261006

기존 Claude8의 프로세스정보 preflight실패는 송신0인 이력이다. UTC시간/endpoint PID·uid 검증 정정 후 같은8세션·새세션0으로03:26:34~35Z 각1회 정상송신, 현회차 peer8/source8를 확인했다. actual80 경계에서 공식 end/pin이 확보된 SKILL/BOSS2만 먼저 보존한다. ART/MAP/ANIMVFX/QA/ENEMY/STORY 후속은 최종완료 핀을 기다리는 WIP이며 상세검수 완료까지 보존을 미루지 않는다.

| 역할 | 실제 TASK ID | 담당 보고완료ID / 구분 | bytes | SHA256 | 공식 endUUID / UTC | 상태 |
|---|---|---|---:|---|---|---|
| SKILL | `CLAUDE8-RESIDENT-SKILL-20261006-0324` | `ROOTRESIDENT-ROLE-FOLLOWUP-20261006` | 9660 | `09b6e8e57a81f3803aff68936d7ad05f8fb48ee3c4c1d9765aff3c2f0b000445` | `5f142e54-dba0-4ecf-b726-19acbdf95221` / 2026-10-06T03:28:47.747Z | 후보 미채택, MJS syntax만 PASS |
| BOSS | `CLAUDE8-RESIDENT-BOSS-20261006-0324` | `ROOTRESIDENT-ROLE-FOLLOWUP-20261006` | 13431 | `01cb28daf51463eec2bbf88d0285b858f3db08d596723ccf8e4cbc459c6bd861` | `cd34d69a-af37-46e7-8149-dd1e23026827` / 2026-10-06T03:29:26.063Z | 후보 미채택, MJS syntax만 PASS |

정확 경로: `tools/team-followup-20261006/hell-rift/SKILL/retry-input-reset.candidate.mjs`, `tools/team-followup-20261006/hell-rift/BOSS/boss-revive-kill-tail.candidate.mjs`. SKILL/BOSS의 literal `ROOTRESIDENT-ROLE-FOLLOWUP-20261006`는 ROLE 템플릿이 미치환된 담당 보고값이고 감독 alias `ROOTRESIDENT-SKILL-FOLLOWUP-20261006`는 별도식별값이다. 실제 TASK/end/path/SHA의 조합으로 구분하며 완료ID를 새로 꾸며내지 않는다.

SKILL의 현행game SHA는 `4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd`; pin no-op rebase/HEAD provenance 및 drift거절 후보만 보존. BOSS는 full SHA 거절과 보상 의미 HOLD 후속으로, 본편 EXP/drop/부활 타이밍 변경0. 상세 의미·조합 apply·native6단계/화면/청취는 미인수. root 접지그림자 소비자의 작업중 파일은 이번 raw checkpoint에 넣지 않는다. 후보2+관련docs3만 정상commit/push/원격exactSHA로 보존; 원본game/index/scene/PNG/STORY·보호2_3/Q-only/세이브/기존23/타인WIP/liveSTATE·LOG 유지. 기존 paused/메일 재개0, Codex7 새7은 기존 자동승인거절 hold. 외부pins/원격영수증 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-followup-preservation-20261006/batch1/receipt.json`.


### 2026-10-06 주민 소비자 후속 완료6 미채택 보존 — ROOT-CLAUDE8-RESIDENT-RAW6-BATCH2-20261006

03:26:34~35Z에 기존 Claude8의 0324 TASK8이 각각 1회 전달·실제 source/end 완료됐다. 이전 batch1의 나머지6 WIP 표기는 당시 이력이며, 현재 아래6도 공식완료로 보존한다. SKILL/BOSS2는 c9b873cba0f7de366d69e6d053aa4af1d59b1834에 이미 보존. 후속 memory 소비자 접점검토는 파일쓰기0이고 완료 raw를 변경하지 않는다. 실제 NUL/untracked 전체81의 80 경계에서 상세 후보 검수 전에 완료소유6만 보존한다. production adoption/native/청취/A급 인수0.

| 역할 | 실제 TASK ID | 경로 | bytes | SHA256 | 공식 endUUID / UTC | 현 상태 |
|---|---|---|---:|---|---|---|
| ART | `CLAUDE8-RESIDENT-ART-20261006-0324` | `tools/team-followup-20261006/hell-rift/ART/rift-layer-split.candidate.mjs` | 11086 | `2b197b46b84b66f72aeb598f1df35cefc21b85976769e65834d22cb4e715b7e3` | `33205ec4-5694-4018-8d55-8e117989939f` / 2026-10-06T03:30:54.797Z | 1254crop4/80·앉은 비율의 순수계획, 원화·identity 인수0 |
| ENEMY | `CLAUDE8-RESIDENT-ENEMY-20261006-0324` | `tools/team-followup-20261006/hell-rift/ENEMY/ch1-authored-spawn-budget.candidate.mjs` | 17847 | `5a33b8ff4d164cadb4bdcb6b017fa1309a1c110c986eced452d11f5c61532e3f` | `0cbc25f3-4626-4274-bf42-12a4f4804ac1` / 2026-10-06T03:30:38.713Z | 작은 몹수 budget 중립·browser guard 후보, EXP/drop 미인수 |
| ANIMVFX | `CLAUDE8-RESIDENT-ANIMVFX-20261006-0324` | `tools/team-followup-20261006/hell-rift/ANIMVFX/rift-render-lifecycle.candidate.mjs` | 9671 | `c70ab2a23ce8f4230c13272363c87c5690e50020dc47331df28af6e7518551d4` | `39068d7b-0269-412f-bbf8-bc036b9b9982` / 2026-10-06T03:31:43.081Z | 순수 정적접지 후보, root 접지소비자와 별개·채택0 |
| STORY | `CLAUDE8-RESIDENT-STORY-20261006-0324` | `tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs` | 14954 | `694b18d5d71eb9d79c5e14d031ba78cb52e41b2149e1159b6b03d3f2c815651d` | `90852e49-ef3f-4b82-9950-2cabbba12de4` / 2026-10-06T03:31:14.807Z | atomicApply 누락·비동기·부분결과 failclosed 후보, 실제 grant/save 포트 미연결 |
| MAP | `CLAUDE8-RESIDENT-MAP-20261006-0324` | `tools/team-followup-20261006/hell-rift/MAP/rift-depth-layers.candidate.scene.json` | 93372 | `39f4e60012e06051083c161e645840c09e7565319be0201538e9c2a9e96572e8` | `6ae823b6-bfe3-44cc-9db6-09b4c48b70f6` / 2026-10-06T03:32:26.345Z | v2의 body/nav/masks/crop 보존·8camera 별도후보, 화면 미인수 |
| QA | `CLAUDE8-RESIDENT-QA-20261006-0324` | `tools/team-followup-20261006/hell-rift/QA/rift-candidate-acceptance.candidate.mjs` | 34624 | `e0648c2b725f1ae92a71c3da3cbbaecf3082beaf41962187535a53102fccef7a` | `850c9ea8-dc2b-4fbd-bd33-fb1a384f4bc1` / 2026-10-06T03:33:50.229Z | required input 누락 nonzero·frozen pin·resident negative 후보, 본편/native checker0 |

담당 literal 완료ID는 모두 `ROOTRESIDENT-ROLE-FOLLOWUP-20261006`이며 ROLE이 미치환된 원보고를 그대로 남긴다. TASK/end/path/SHA로 구분한다. 여기서는 MJS5 syntax/JSON1 parse 및 exact pin만 확인했고, 담당 자체 unit·source검사는 상세검수 채택으로 계산하지 않았다. QA의 live tooling SHA는 root 동시 WIP와 달라질 수 있으며 frozen scene/plate/atlas pin과 구분한다. 원자료 추가 보존과 소비자 채택은 별도다.

root 접지그림자 code3 WIP·타인 변경·live supervisor STATE/LOG·원본game/index/scene/PNG/STORY·보호2_3/Q-only/어택티켓금지·세이브·기존23 제외. 후보6+관련docs4만 정상commit/push/원격exactSHA를 순차 보존. Codex7 새7은 자동승인 검토 거절(승인 필요/정책 never) hold이며 전16착수 선언0. 기존 paused 자동화/아침메일 재개0. 외부 receipt: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-followup-preservation-20261006/batch2/receipt.json`.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

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


MAP PRODUCTION REPORT - ROOT-RIFT-RESIDENT-GROUNDING-20261006

STAGE: independent resident v2, isolated editor static contact pass. Main game/native adoption: 0.

MASTER
- silhouette / regions: existing asymmetric valley, central abyss, south entry and north ascent. Geometry/crop/nav changes: 0.
- main route / side spaces: actual WASD approach to Haran, Berin, Nessa, Dorik, using original 1192 nav. Combat/ascent gate connection: 0.

OUTER MASS
- LEFT / RIGHT / TOP / SOUTH: registered six ground crops and three foot roots remain unchanged.
- major holes: central abyss is not painted as ground; nav-cell clipping limits contact footprints. Whole-cliff alpha separation remains unaccepted.

LARGE
- source assets / composites: plate aa64cb7b... / atlas ff20e1f5... / scene c508e70d... unchanged. New high-resolution artwork: 0.
- overlap / repeated silhouette: only four contact shadows added. Earlier eight-camera source/outer-mass review remains historical. Current enlarged resident grain/material: RETOUCH.

MEDIUM
- connections: original floor, roots, stairs and approach points retained.
- remaining holes: physical height and whole-cliff alpha separation remain unimplemented.

GROUND
- shadow: current body foot; rx=clamp(width*.42,2,32), ry=clamp(height*.08,1,8); radial alpha .34/.15/0; foot r12 eligibility and r0 nav-cell clipping.
- contamination / structure integration: only 72 pixels differ from prior no-shadow PNG, outside footprints 0. Floor -> shadows -> foot y-sort order.

PLAYABLE
- main arenas / travel: combat arena acceptance 0; four actual keyboard approaches and Haran F dialogue confirmed. Scene/collision/nav/warrior dimensions unchanged.
- breathing / threat / combat readability: noncombat interspace pass. Native/dense-combat FPS and active-threat acceptance 0.

LANDMARK
- primary: central abyss light and north stairs retained.
- secondary / tertiary: four residents and existing ember sites; static poses and painterly/pixel material mismatch remain.

CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: prior c508 eight-camera screenshots preserved; full eight-camera rerun in this pass: 0.
- current direct review: four approach screenshots at 1500x960 and Haran height120 edit screenshot. Contact/UI/F checked. Current whole-camera PASS claim: 0.

TECH QA
- route / collision: actual four WASD approaches. Body/approach/nav/geometry/source immutable. Earlier BFS1185 retained as historical evidence.
- pageerror / 404: normal pageerror/HTTP/console errors 0. Separate injected STORY HTTP503 page retains shadows4 with dialogue null.
- seam: only contact pixels change; stopped PNG before/after/Undo identical 24230e77.... Whole-cliff seam acceptance 0.
- loading: resident import separated from STORY try; invalid profiles, hidden foot and generic scenes disable grounding. Undo restores it.
- performance: four body/profile/nav-cell calculations; added images 0. Actual GPU/FPS/dense-combat/listening acceptance 0.
- tests: unit27 with eight new grounding cases, browser10, actual keyboard walks4. JSON deep-equal and stopped PNG7018879B identical. Initial missing ffmpeg (checks0) and external harness window guard failure (checks1) preserved separately. Installation/new video: 0.

FILES
- stage-owned: tools/map-scene-editor.js, tools/map-scene-rift-residents.mjs, tools/test-hell-rift-resident-scene.cjs and related docs12.
- concurrent touched: existing unrelated WIP/live supervisor STATE/LOG excluded from staging. Claude memory followups allow file writes0.
- unrelated touched: 0. Original game/index/scene/PNG/STORY, protected2_3, Q-only/no attack tickets, user saves and existing23 retained.

GIT
- staged: only completed code3+docs12 exact paths; stop if unrelated index entries exist.
- commit / push: normal code+docs checkpoint, origin branch push, remote exact SHA recorded in external receipt.
- deploy: 0. Existing3387 only; new server/game/build/install/publish/Windows0. Old paused automations/mail remain paused.

VISUAL VERDICT: RETOUCH. Static contact implemented; enlarged grain/material mismatch/static bodies/whole-cliff alpha/depth/main-game grants/gates/save/native/audio remain unaccepted.

NEXT PASS: collect official existing-team memory handoffs by TASK/end, keeping raw preservation separate from adoption. Actual transaction/ascent ports require implemented ITEM/QUESTNPC consumers and normal delivery evidence.


## MAP PRODUCTION REPORT — ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006

| 가이드 §23 항목 | 실제 결과 |
|---|---|
| STAGE | 지옥의 틈 · 잔류자의 계곡 / 독립 주민 editor3387. same candidate c508… |
| MASTER | 비대칭 절벽·중앙 심연·남쪽 진입→북쪽 계단·주민 곁길 유지. 큰 실루엣/지역/메인·side route 재설계0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes: 기존10 geometry·원화 crop·마스크·nav byte 불변. 새로운 지형 높이/빈공간 PASS0 |
| LARGE | clean plate/atlas/abyss 기존 자산 유지·추가이미지0. 배경 반복/원화 grain의 전면 개선 인수0 |
| MEDIUM | 연결/holes 불변. 실제 Haran 장애물 위치4700,6460 시험 뒤 Undo; 기존 Berin/Nessa 접근은 유지 |
| GROUND | 현재 발+nav clip 그림자 기존 계약 유지. soft mask의 CPU/high 합성만 변경; contamination/절벽전체 alpha 통합 미완료 |
| PLAYABLE | Haran의 blocked F 닫힘·기록0, actual WASD로 Berin5980,5620/Nessa6220,5020 접근·F 대화 확인. main arena/dense combat/threat acceptance0 |
| LANDMARK | primary 중앙 심연·북쪽계단, secondary 주민/잔불, tertiary 뿌리. 구성·좌표 변경0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT의 이전8camera 이력 보존; 이번8camera rerun0. 실제1500×960 베린·네사 대화/복원 overview 직접 확인 |
| TECH QA route/collision | 실제3 keyboard walks(하란 차단/베린/네사). 새 v2 전용 nav/BFS 검사 재실행0; 원본 baked nav/r12 회귀는 의미19검사 1회에 포함. v2 nav1192/BFS1185/r12 핀 불변. 동일 v2 scene JSON/source/story 불변 |
| TECH QA errors/loading/seam | normal pageerror/HTTP/console0. 검증 안 된 scene anchor[]·원본 baked4 유지. 최초PNG 불일치 FAIL 보존 후 합성고정·Undo/fresh reload PNG7018386B/21b265… 동일. 전절벽 seam PASS0 |
| TECH QA performance/tests | 의미19/19 1회·현재 targeted6/6. mask캐시8/최대변1024/sample256 불변. FPS/GPU/native/audio 측정 인수0; 새영상0 |
| FILES | 완료소유 tools/map-scene-editor.js, tools/map-scene-rift-dialogue.mjs, tools/test-map-scene-rift-dialogue.cjs+관련docs12. 타인WIP/live STATE/LOG·씬/이미지/본편·세이브/기존23 수정0 |
| GIT | 코드3+docs12 정확15만 정상 checkpoint/push/remote exact SHA 영수증. 기타 staging0·deploy0. 실제87→72 회복 확인 |
| VISUAL VERDICT | **RETOUCH**. 국소 대화 차단과 출력복원 동작 검수; static grain/material/전체 절벽 depth·본편/native/청취는 미인수 |
| NEXT PASS | 원자적 실제 지급·부탁/save·상승과 실제1-1 동일후보 인수는 소비자 포트 구현/검수 후. 기존 오더담당으로만 필요한 차이 전달, 완료TASK 재송신0 |


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
### MAP PRODUCTION REPORT — ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006

```text
================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 editor authoring consumer — Unity single Sprite PNG + .meta import
MASTER
- silhouette: 기존 c508e70d... 독립주민v2·비대칭계곡 구성 불변
- regions: 기존200x200/T40/8000x8000 world px 불변
- main route: 기존 남쪽시작(4020,7740)→북쪽출구(4020,1740) 불변
- side spaces: 4주민 머무름/접근점 불변
OUTER MASS
- LEFT: 기존서쪽절벽/뿌리 불변
- RIGHT: 기존동쪽절벽/뿔 불변
- TOP: 기존상승길/절벽 불변
- SOUTH: 기존진입/전경뿌리 불변
- major holes: 새공간·구멍편집0; 고해상도재질/전체실루엣 개선미완료
LARGE
- source assets: 기존 Unity UI/button.png122x69 + 동명meta만 QA임시import, 원본 bytes/SHA불변
- composites: PNGfullcrop/dataURI·PPU/단위/pivot로 배치기본값계산
- overlap: QA canvas실제pointer 배치·pixel검사; 생산v2합성변경0
- repeated silhouette: Unity반복배치 규격유지 확인; 맵지역반복문제 신규인수0
MEDIUM
- connections: scene geometry/nav/STORY/4foot/접근점 불변
- remaining holes: .unitypackage/Prefab/3Dheight/runtime bridge 미구현
GROUND
- shadow: 이전 navclip 정적접지4그림자 유지, 새그림자제작0
- contamination: Unityfullcrop·source불변, ordinaryalpha trim기존유지
- structure integration: assets[].unitySprite→팔레트→배치→JSON/History consumer
PLAYABLE
- main arenas: 기존map판정 유지; 새전투QA0
- travel space: 기존nav1192/r12/BFS1185 핀유지, 이번route/BFS재실행0
- breathing space: 지옥의 틈4주민 원본구성 유지
- threat space: 신규스폰/어택티켓/보스변경0
- combat readability: 이번import PASS를 전투·본편/native6단계완료로 계산0
LANDMARK
- primary: 기존위로향한북쪽상승로 유지
- secondary: 중앙심연/절벽 유지
- tertiary: 네주민자리 유지; UnityQA버튼에셋 생산채택0
CAMERA QA
- START: 이전카메라/근거유지, 이번8camera재실행0
- EARLY: 이전카메라/근거유지
- ARENA: 이전카메라/근거유지
- SIDE L: 이전카메라/근거유지
- SIDE R: 이전카메라/근거유지
- LANDMARK: 이전카메라/근거유지
- LATE: 이전카메라/근거유지
- EXIT: 이전카메라/근거유지
TECH QA
- route: nav/scene/STORY/game/source불변, 새route실행0
- collision: JSON검증/잘못된Unity metadata 원자거절, 충돌수치변경0
- pageerror: 0, 원래실패2는harness race/진단expect이며제품JS오류0
- 404: 0, foreign-server request0
- seam: fullbitmap/crop/pivot맞춤검사; 실제맵seam인수추가0
- loading: uncached기존PNG실제request-hit1후workspaceinert·입력/Undo차단·정확JSON완료확인; cachedsource의첫harness실패이력보존
- performance: source양축1~8192·PNG10,000,000B/meta256,000B/JSON32,000,000B제한; 새FPS/native profiling0
FILES
- stage-owned: code5+docs12=17
- concurrent touched: 오더담당 기존STATE/LOG는 owner독립소유, 이번stage대상0
- unrelated touched: 기존72 NUL/untracked 경로·contents보존
GIT
- staged: 위완료소유17한정
- commit: 정상commit, 실제SHA는 외부receipt 기록
- push: 기존branch정상push/remoteexactSHA 대조, receipt 기록
- deploy: 0
VISUAL VERDICT: RETOUCH
NEXT PASS: 실제맵에 사용할보유에셋의규격/크기/재질을선정하고 틈의고해상도재질/앞뒤가림·main runtime/실제주민action/native청취인수
```


의미검수는 `node --test tools/test-map-scene-unity.cjs` 최종16/16PASS·실제총4회다. 1차 native CJS/ESM loader fixture14실패와2차필수 cameras[]누락fixture2실패는 외부 `first-unit-failure.json`의 실제조건기록(원본전체로그 아님)으로 보존했다. 3차15PASS 후 읽기검수에서 정상 plain userData apostrophe의P2가 발견되어 parser국소수정/회귀1추가,4차16PASS. 기본core33/UI15 등 기존검사 재실행0.

실제3387 브라우저 고유23그룹PASS·headless실행총5회다. 최초16PASS 뒤 cached tree가 request gate를 우회하여 loading완료 이후 정상Undo/Reset이 실행된 harness race를 진단·다운로드JSON으로 보존했다. 두번째진단의 Reset후보조expect실패도 보존; 제품import는 먼저성공했으며 제품수정0. 새plain apostrophe1·실제request-hit를보장한busy/격리sentinel/mobile/protection4·scene-only실제viewport1·잘린Unity버튼문구의 줄바꿈1만 순차검수했다. 이미성공한 다른검사는 재실행0. pageerror/404/foreign-server request0, 생산7파일의최종각run before/after핀불변. root는추가로v2scene/STORY/game 원본핀을대조했다.

390px 실제viewport는 innerWidth/clientWidth/scrollWidth/bodyScrollWidth/visualViewport.width=390, visualViewport.scale=1, media(max-width:760px)=true. 이전 viewport없는축소PNG는 이력으로 유지. actualtap→filechooser→48.8×27.6/pivot(.5,.5)배치와속성열기/닫기 확인, 버튼·단위입력 실제표시≥44px. 최종 Unity 버튼은 실제55px·2줄 텍스트 rect가 영역 안이며 clientWidth=scrollWidth=121px다. root실제데스크톱custompivot/모바일controls·properties·최종captionPNG를시각확인했다. 모바일입력검수PASS를 전체맵재질/전투/본편/native품질PASS로 대체하지 않는다.


이 실제 Unity source는 UI버튼이며 기능검수에만 사용했다. Unity용맵팩/Prefab·shader·material/3D전체지원이나 틈production에셋채택을 선언하지 않는다. 원화·v2scene90767B/SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`·STORY25940B/`be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc`·gameSHA `4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd` 불변이다. 이전UI/core/8camera/보행/PNG검사의PASS는 당시근거로유지하고이번에중복실행0. 전체맵재질grain/주민애니메이션/실제grant·quest·save·gate/본편/native/청취는 미인수다.
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

## MAP PRODUCTION REPORT — ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006

STAGE: 지옥의 틈 독립주민 편집 후보의 수동 접근 검사 inspector. 생산 geometry/art/본편 변경0.

MASTER
- silhouette: 승인 원화/독립v2 구성 불변.
- regions: 기존8camera와공간역할 불변.
- main route: start4020,7740→exit4020,1740 유지; 별도 주민접근검사추가.
- side spaces:4주민foot/currentnav읽기; 새길/시설/scatter0.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH: 원본10지형 객체와 layer/world/mask 보존.
- major holes: 기존심연·절벽후속 RETOUCH; 신규시각질량0.

LARGE
- source assets: 기존v2 cleanplate/atlas/그림/source pins 불변.
- composites: 렌더조합 변경0.
- overlap: 검사overlay는편집중만;PNG0.
- repeated silhouette: 제거완료선언0.

MEDIUM
- connections: 기존구조물접합불변;BFS는읽기진단.
- remaining holes: 기존절벽alpha/원근 후속.

GROUND
- shadow: 기존nav-clipped접지모듈불변.
- contamination: 신규0.
- structure integration: 발막힘과시작단절을UI에서구분;ground/art변경0.

PLAYABLE
- main arenas: 기존후보불변.
- travel space: 수동검사 시작연결/접근점만추가.
- breathing space: 현재네주민대화시험과기존공간유지.
- threat space: 기존심연불변.
- combat readability: actual본편전투 미인수.

LANDMARK
- primary: 중앙균열/상승길불변.
- secondary: 기존주민4위치불변;focus camera보기가능.
- tertiary: 새디테일0.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8camera재실행0. 신규접근inspector/blockedfoot/mobile 화면은아래영수증근거. 8-camera PASS로확대0.

TECH QA
- route/collision: r12/step20의현재body·시작seed·4방향edge·footcentre·40…140후보읽기. 신규unit12PASS/1회, 기존route1185재실행0.
- pageerror/404/seam/loading/performance: 신규Chrome12/12그룹PASS·launch1·pageerror/404/외부서버요청0·보호14핀불변 및 승인원화 SHA 확인. 검사UI desktop/mobile시각PASS; 기존외곽seam/FPS인수를대신하지않음. 수동BFS1회/RAF계산0, FPS개선주장0.

FILES
- stage-owned: editor.html, tools/map-scene-editor.js, tools/map-scene-resident-access.mjs, tools/test-map-scene-resident-access.mjs +관련docs12.
- concurrent touched: live관리STATE/LOG는각owner소유·root수정0.
- unrelated touched: 보호source/STORY/game/scene/nav·기존72/23/save 변경0.

GIT
- staged/commit/push: 신규consumer unit12/브라우저12검수완료, root소유 code4+docs12 정확16파일만 정상checkpoint 범위. 실제NUL88→보존뒤72·exactSHA·경로/핀의확정결과는외부receipt기록.
- deploy:0.

VISUAL VERDICT: RETOUCH
접근검사UI의desktop/mobile4장실제시각검수는PASS. 기존맵원화 확대흐림/정적주민·전체환경/A급/main/native/청취인수는미완료이며RETOUCH를유지한다.

NEXT PASS: 실제NPC grant/quest/save와장상승consumer; 높이/재질/동적주민·전체맵8camera·native6단계·실청취는별도미완료.

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

## MAP PRODUCTION REPORT — ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006

STAGE: 격리 editor3387의 이미지별 월드 배치 규격 도구. 생산geometry·원화·본편 변경0.

MASTER
- silhouette / regions: 기존 승인v2 그대로.
- main route: start(4020,7740)→exit(4020,1740), nav고정.
- side spaces: 기존4주민body불변; 새본편시설/NPC0.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH / major holes: 기존원화·절벽·심연불변. 기존RETOUCH유지.

LARGE
- source assets / composites / overlap / repeated silhouette: 기존bitmap/crop/배치불변. 새default는사용자가선택한4크기·피벗을후속배치에적용할뿐반복실루엣제거완료가아님.

MEDIUM
- connections / remaining holes: 기존접합·alpha·원근후속유지.

GROUND
- shadow / contamination / structure integration: nav-clipped주민접지consumer불변. 새배치규격을받는현재씬의기존foot위치·ground변경0.

PLAYABLE
- main arenas / travel space / breathing space / threat space / combat readability: 기존원본유지. 도구의반복pointer배치검수는실플레이/전투인수가아님.

LANDMARK
- primary / secondary / tertiary: 균열·상승길·주민4원본불변; 새디테일0.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8camera반복0. 새규격UI desktop/mobile시각·입력만별도근거.

TECH QA
- route/collision: source/nav/start/exit불변, 기존route종주재검수0.
- pageerror/404/seam/loading/performance: 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0. 기존seam/FPS스트레스인수를대신하지않음. 원본그림생성·runtime교체0.

FILES
- stage-owned: editor.html / tools/map-scene-editor.js / tools/map-scene-core.js / tools/test-map-scene-placement-presets.cjs +관련docs12.
- concurrent touched: live관리STATE/LOG owner소유; root수정0.
- unrelated touched: 타인72WIP·기존23/save·원본v2/STORY/game/주민모듈nav불변.

GIT
- staged/commit/push: code4+docs12 정확16완료범위. actualNUL88→checkpoint72 및원격exactSHA는외부receipt확정근거.
- deploy:0.

VISUAL VERDICT: RETOUCH
새도구의시각/입력검수와전체맵그림·본편A급/native/청취인수는분리한다.

NEXT PASS: 높이/확대재질·주민동적이미지·본편grant/quest/save/상승·같은후보6단계native·실청취 별도후속.

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

## MAP PRODUCTION REPORT — ROOT-EDITOR-LAYER-OBJECT-LIST-20261006

STAGE: 격리 editor3387 제작 도구. 실제 geometry/원화/본편 변경0.

MASTER
- silhouette / regions: 승인 v2 유지.
- main route: start(4020,7740)→exit(4020,1740), nav 유지.
- side spaces: 주민4 등록과 기존 공간 유지.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH / major holes: 절벽·심연·접합 원본 유지, 기존 RETOUCH 후속.

LARGE
- source assets / composites / overlap / repeated silhouette: 이미지 불변. 겹친 객체를 현재 층 목록에서 고르며, 실제 반복 실루엣 보완 완료로 계산하지 않음.

MEDIUM
- connections / remaining holes: 기존 접합·alpha·원근 경계 유지.

GROUND
- shadow / contamination / structure integration: 주민 접지 consumer·좌표/nav 불변.

PLAYABLE
- arenas / travel / breathing / threat / combat readability: 선택 도구 검수가 기존 길·전투·획득 인수를 대신하지 않음.

LANDMARK
- primary / secondary / tertiary: 균열·상승길·주민4 불변.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8구도 재실행0. 새 객체 선택·발 보기의 데스크톱/모바일 화면과 시차 focus만 검수.

TECH QA
- route/collision: query 읽기 전용, 원본4주민종주 재실행0.
- pageerror/404/seam/loading/performance: 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. 오류와 핀 수는 동일ID 외부 summary 원자료. 기존 seam/FPS 스트레스 인수0.

FILES
- stage-owned: editor.html / map-scene-editor.js / map-scene-editor.css / map-scene-object-list.mjs / test-map-scene-object-list.cjs + 관련docs12.
- concurrent touched: 두 담당 live STATE/LOG 소유 유지, root수정0.
- unrelated touched: 타인72/기존23/save·원본v2/STORY/game/nav 불변.

GIT
- staged/commit/push: code5+docs12 정확17 완료 범위, NUL89→72·HEAD=remote exact SHA는 외부 receipt 확정 근거.
- deploy:0.

VISUAL VERDICT: RETOUCH
목록 UI와 실제 선택 입력의 PASS를 전체 맵 A급·Unity전체호환·본편/native/청취 인수로 계산하지 않는다.

NEXT PASS: 확대 재질/높이·정적 주민 보완·본편grant/quest/save/상승·같은 후보 native6단계·실청취.

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

## MAP PRODUCTION REPORT — ROOT-EDITOR-BATCH-TRANSLATE-20261006

STAGE: 격리 editor3387 복수 배치 도구. 승인 원본 geometry/그림/본편파일 변경0.

MASTER
- silhouette / regions / main route / side spaces: 승인 지옥의 틈 v2/start(4020,7740)/exit(4020,1740)/4주민/nav 유지. 편집 시험씬에만 그룹이동.

OUTER MASS
- LEFT/RIGHT/TOP/SOUTH / major holes: 기존 비대칭 절벽·중앙균열 유지, 원본재질·높이 RETOUCH 미해결.

LARGE
- source assets / composites / overlap / repeated silhouette: 원본모든그림 불변. 객체 그룹이동은 상대간격 유지, 원화세밀도/반복실루엣 수리완료가 아님.

MEDIUM
- connections / remaining holes: 다른geometry/nav 접합 자동이동0, 이동후 접근 검사·화면 GATE는 기존consumer.

GROUND
- shadow / contamination / structure integration: 기존지면/주민 접지consumer 보존. 그림의 x/y만 공동수정, foot/pivot/crop/width/height/회전/mask값 유지.

PLAYABLE
- arenas / travel / breathing / threat / combat readability: 그룹편집과짧은폼focus입력검증은 전투·획득·보스방개방·죽음/부활·재도전6단계완료가 아님.

LANDMARK
- primary / secondary / tertiary: 균열/상승길/하란·베린·네사·도릭 원본불변.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 기존8장면/4주민종주 재실행0. 새group actualdrag/numeric/mobile44px·묶음outline/PNGoverlay분리 검수만.

TECH QA
- route / collision: 원본nav불변, 그룹신규13/13 의미PASS·최초1회. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0.
- pageerror/404/seam/loading/performance: 오류/pin/실행횟수는 같은ID 외부summary. seam/FPS/native/실청취추가인수0.

FILES
- stage-owned: editor.html/map-scene-editor.js/css/map-scene-core.js/test-map-scene-batch-translate.cjs + 관련docs12.
- concurrent touched: 두오더담당 STATE/LOG는본인만갱신, root편집0.
- unrelated touched: 타인72/기존23/source/STORY/game/save 보존. root소유외변경은영수증에서별도대조.

GIT
- staged / commit / push: code5+docs12정확17 정상완료checkpoint, actualNUL89→72 / HEAD=remote exactSHA와대조핀은외부receipt.
- deploy:0.

VISUAL VERDICT: RETOUCH
새편집 도구 UI 검수 PASS를 전체 맵 A급·Unity전체호환·본편/native/실청취완료로 계산하지 않는다.

NEXT PASS: 기존팀 sourcepatch 실제채택, 확대재질/높이/정적주민 보완, 본편grant·quest·save·상승, same candidate native6단계·실청취.

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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립주민v2 · editor3387 material grade / ROOT-RIFT-RESIDENT-LIGHTING-20261006
MASTER
- silhouette: 기존 비대칭 균열양측절벽 유지; 재설계0.
- regions: 남쪽도착지·서측망자턱·동측상승절벽·중앙심연·북쪽상승문 유지.
- main route: SOUTH→NORTH 기존nav/start/exit 불변; 새보행종주0.
- side spaces: 기존4resident bodyrect/approach 공간 유지.
OUTER MASS
- LEFT: 서측절벽; RIGHT: 동측뿌리/갑각; TOP: 기존계단과상승문; SOUTH: 도착지.
- major holes: 깊은심연은의도된공간; 신규geometry/외곽원화변경0.
LARGE
- source assets: 기존painting/cleanplate/atlas exactpins; 신규원본이미지0.
- composites: 원본crop네개에만정적환경광; overlap·repeated silhouette 변경0.
MEDIUM
- connections: 기존등록/가림/지면연결유지; remaining holes: 전체맵접합/실제높이 미인수.
GROUND
- shadow: 기존접지그림자불변; contamination: 불변.
- structure integration: 주민 body내냉광→중립→온광만추가; 지면bounce0.
PLAYABLE
- main arenas: 독립전이쉼터; 본편전투장인수0.
- travel space / breathing space / threat space: 기존경로/망자턱/심연유지.
- combat readability: player/적/탄/VFX전투 재검수0.
LANDMARK
- primary: 중앙심연+북쪽상승문; secondary: 서측망자턱·동측굴절벽; tertiary: 기존불씨/뿌리.
CAMERA QA
- START: overview에서정적render확인; EARLY: 하란300%재질확인.
- ARENA: 전투미검수; SIDE L: 하란/서측crop전후board.
- SIDE R: 베린·네사300%실제editor; LANDMARK: overview승문/심연보존확인.
- LATE: 도릭300%실제editor; EXIT: overview에서북상승문보존.
- 위항목은신규조명증분screen이며본편8-camera완료아님.
TECH QA
- route: scene/nav exactpin불변, 기존route검사재실행0; collision: geometry불변.
- pageerror: 0; 404: 0; seam: PNG4bodyrect외pixel변화0.
- loading: strict등록/cache/import/imageidentity검수; performance: 캐시최대4/성공hitcropcanvas할당0, 전체FPS인수0.
- 의미14/14실제1; 화면고유12실행항목PASS/Chrome3/context4, harness실패2보존·성공그룹재실행0.
- sourcecropalpha상세명시인수는하란1명; 다른3명값미보존경계유지. RGB4명4251채널/PNG657변화·영역외0별도검수.
FILES
- stage-owned: code3+docs12정확15; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/기존72status·68pins보존.
GIT
- staged: 완료15경로한정; commit: 정상checkpoint; push: 현재branch정상push/원격exactSHA는외부receipt; deploy:0.
VISUAL VERDICT: RETOUCH
- 주민정적조명증분 PASS / 전체맵·실높이·정적주민·본편/native/청취 미인수.
NEXT PASS: 바닥/절벽의실제게임카메라해상도·재질연결·주민생활/진행consumer·동일후보본편6단계·청취.
=========================================================


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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립주민v2 · editor3387 크기 비교 / ROOT-EDITOR-SCALE-COMPARISON-20261006
MASTER
- silhouette: 기존 비대칭 균열/절벽 유지; regions: 남쪽도착지/서측망자턱/동측상승절벽/중앙심연/북상승문 유지.
- main route: SOUTH→NORTH source nav/start/exit 불변; side spaces: 네 주민 머무는 턱 보존.
OUTER MASS
- LEFT: 서측절벽; RIGHT: 동측뿌리/갑각; TOP: 계단/상승문; SOUTH: 도착지; major holes: 기존심연, geometry변경0.
LARGE
- source assets: 원본painting/cleanplate/atlas exactpins. composites: UI만추가; overlap/repeated silhouette 변경0.
MEDIUM
- connections: 기존그림/충돌/발정렬 유지. remaining holes: 실제높이/접합 별도GATE.
GROUND
- shadow: 기존접지 유지; contamination: 기존재질 유지; structure integration: 새world/crop/feet쓰기0.
PLAYABLE
- main arenas: 독립 전이쉼터; travel space/breathing space/threat space: 기존path/주민턱/심연 유지.
- combat readability: 이번범위 UI; 본편전투 인수0.
LANDMARK
- primary: 중앙심연/북상승문; secondary: 서측망자턱/동굴절벽; tertiary: 기존불씨/뿌리.
CAMERA QA
- START: PNG2048² exact동일; EARLY: 단일NPC크기 카드.
- ARENA: 본편전투미검수; SIDE L: 선택교체/발보존; SIDE R: 다른crop/마스크 비교.
- LANDMARK: 원본PNG불변; LATE: 줌/DPR 실제raster 비교; EXIT: 기존북상승문불변.
- 390px touch에뮬레이션 도구 UI이며 본편8카메라/실물폰 인수 아님.
TECH QA
- route/collision: source scene/nav/foot exact핀불변, 기존종주재실행0.
- pageerror/404: 외부raw/summary에 실제기록. module부하실패는 의도된 별도fallback검사와 구분.
- seam: PNG byte/SHA exact동일; loading: 모듈실패격리 검사; performance: 동일결과leaf재쓰기0/전체FPS검수0.
- 의미14/14 actual1; 화면고유14/14 actualChrome3/contexts8; 실패이력외부보존/성공그룹재실행0.
FILES
- stage-owned: code5+docs12 정확17; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/기존72status·68pins보존.
GIT
- staged: 완료17경로 한정; commit: 정상checkpoint; push: 기존branch 정상push/원격exactSHA외부receipt; deploy:0.
VISUAL VERDICT: RETOUCH
- 비교 도구 UI 인수와 전체맵GATE분리; 원본저해상도·실높이·정적주민·본편/native/청취미인수.
NEXT PASS: 현재크기 정보를 활용한 실제에셋시각보정·주민접근/진행consumer·본편동일후보6단계/청취.
=========================================================


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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립주민v2 · editor3387 접근점 보행 시험 / ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006
MASTER
- silhouette: 기존 비대칭 균열/절벽; regions: 남쪽도착지/서측망자턱/동측절벽/심연/북상승문 유지.
- main route: 기존 SOUTH→NORTH start/nav/exit 불변; side spaces: 현재4주민 머무는 턱 유지.
OUTER MASS
- LEFT: 서측절벽; RIGHT: 동측뿌리/갑각; TOP: 계단/상승문; SOUTH: 도착지; major holes: 심연 유지/geometry쓰기0.
LARGE
- source assets: painting/cleanplate/atlas exactpins; composites: 기존정적조명 유지; overlap/repeated silhouette 변경0.
MEDIUM
- connections: 기존그림/충돌/발 보존; remaining holes: 실높이·접합 후속GATE.
GROUND
- shadow/contamination/structure integration: 기존renderer 유지, 원본world/crop/feet/nav쓰기0.
PLAYABLE
- main arenas: 독립전이쉼터; travel/breathing/threat spaces: 기존path/주민턱/심연 유지.
- combat readability: 이번범위 편집시험 진입, 본편전투/대형경로 인수0.
LANDMARK
- primary: 중앙심연/북상승문; secondary: 서측망자턱/동굴절벽; tertiary: 기존불씨/뿌리.
CAMERA QA
- START: 일반보행 source.start 확인; EARLY: 접근검사4카드의 시험버튼.
- ARENA: 전투미인수; SIDE L: 하란fresh진입/F대화; SIDE R: 이동/단절/overlap의거절.
- LANDMARK: 원본renderer불변; LATE: ESC 편집view/선택복귀; EXIT: 성공import의origin폐기.
- 390px 실제tap 에뮬레이션이며 본편8카메라/실물폰 인수0.
TECH QA
- route/collision: 기존접근 검사 재사용; 전체종주 반복0; source scene/start/nav/feet exact불변.
- pageerror/404/loading: 신규모듈fallback은 의도된별도검사; 실제raw/summary 참조.
- seam: renderer코드/원본PNG파일쓰기0·재export미검수, 기존playing export의전사포함유지; performance: 명시클릭마다 fresh검사/RAF상시BFS0, FPS전체미검수.
- unit12/12 actual1; 화면고유12그룹PASS actualChrome1/contexts3; 이력외부보존.
FILES
- stage-owned: code3+docs12 정확15; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/기존72status·68pins보존.
GIT
- staged: 완료15경로 한정; commit: 정상checkpoint; push: 기존branch 정상push/원격exactSHA 외부receipt; deploy:0.
VISUAL VERDICT: RETOUCH
- 접근점 시험 도구 UI와 전체맵인수 분리; 실제높이·바닥해상도·정적주민·본편/native/청취미인수.
NEXT PASS: 실제에셋시각보정과 주민진행consumer·같은후보 본편6단계/실청취.
=========================================================


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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 editor3387 · 보행시험버튼상태 / ROOT-RIFT-PREVIEW-STATE-UI-20261006
MASTER
- silhouette/regions: 기존 비대칭 균열·절벽/남도착지/서망자턱/동상승절벽/심연/북문 유지.
- main route: SOUTH→NORTH 원본start/nav/exit; side spaces: 4주민턱 불변.
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH: 기존서절벽/동뿌리갑각/북계단상승문/남도착지; major holes: 심연 유지/geometry쓰기0.
LARGE
- source assets/composites/overlap/repeated silhouette: 원본painting/cleanplate/atlas/조명·배치 불변.
MEDIUM
- connections: 기존그림/충돌/발; remaining holes: 실높이·접합후속.
GROUND
- shadow/contamination/structure integration: renderer·world/crop/feet/nav변경0.
PLAYABLE
- main arenas: 전이쉼터; travel/breathing/threat spaces: 기존path/주민턱/심연; combat readability: 이번표시수정/본편전투미인수.
LANDMARK
- primary: 심연/북문; secondary: 서턱/동굴절벽; tertiary: 불씨/뿌리 유지.
CAMERA QA
- START/EARLY: 접근4버튼 활성→propertypending 비활성.
- ARENA: 본편전투미검수; SIDE L/SIDE R: 드래그·busy표시만 신규검수.
- LANDMARK/LATE/EXIT: 원본환경불변, 종료후fresh검사 활성/안정DOM쓰기0; 본편8카메라 반복0.
TECH QA
- route/collision: source24핀 불변/기존전체종주0.
- pageerror/404/loading: actualraw/summary의신규3그룹·asyncgate기록.
- seam: 원본PNG쓰기0/재export0; performance: 같은boolean leaf쓰기0 검수/전체FPS미인수.
- syntax actual1PASS/newunit0/화면3그룹PASS actualChrome2/contexts2.
FILES
- stage-owned: code1+docs12 정확13; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/72status·68핀보존.
GIT
- staged: 완료13경로; commit/push: 정상checkpoint/기존branch push·원격exactSHA외부receipt; deploy0.
VISUAL VERDICT: RETOUCH
- 표시UI PASS와 전체맵인수 분리. 바닥해상도/실높이/정적주민/본편/native/청취미인수.
NEXT PASS: 실제에셋 시각보정·주민진행consumer·본편같은후보6단계/실청취.
=========================================================


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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립주민v2 · editor3387 선택규격진단 / ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006
MASTER
- silhouette: 기존비대칭균열; regions: 남도착/서망자턱/동상승절벽/심연/북문.
- main route: SOUTH→NORTH 원본start/nav/exit; side spaces: 기존4주민턱.
OUTER MASS
- LEFT: 서절벽; RIGHT: 동뿌리갑각; TOP: 북계단상승문; SOUTH: 남도착지; major holes: 심연. 신규geometry0.
LARGE
- source assets: painting/cleanplate/atlas불변; composites: 기존조명; overlap/repeated silhouette: 이미지·배치변경0.
MEDIUM
- connections: 기존그림/길/발; remaining holes: 실제높이·접합후속.
GROUND
- shadow/contamination/structure integration: 기존renderer/profile허용조건 유지; 진단만추가.
PLAYABLE
- main arenas: 전이쉼터; travel space: 원본길; breathing space: 주민턱; threat space: 심연; combat readability: 본편전투미인수.
LANDMARK
- primary: 심연/북문; secondary: 서턱/동절벽; tertiary: 불씨/뿌리 유지.
CAMERA QA
- START: 원본불변; EARLY: 선택규격일치카드.
- ARENA: 본편미검수; SIDE L: 실pivot입력/Undo; SIDE R: 다른NPC·배경실패대상.
- LANDMARK: 원본유지; LATE: 모듈미준비/다중숨김; EXIT:390화면overflow검수. 본편8카메라반복0.
TECH QA
- route/collision: 원본source22핀유지/새BFS0/종주0; pageerror/404/loading: 신규Chromeraw의실제경로·modulefailurefixture분리.
- seam: 원본PNG쓰기0/재export0; performance: 캐시leaf쓰기0/전체FPS미인수.
- 신규unit14최종PASS actual2/540동등성actual1/module syntax1/rootJS2; Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary.
FILES
- stage-owned: code4+docs12 정확16; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/72status·68pins유지.
GIT
- staged: 완료16경로; commit/push: 정상checkpoint/기존branch·원격exactSHA외부receipt; deploy:0.
VISUAL VERDICT: RETOUCH
- 진단UI와전체맵인수분리. 바닥해상도/실높이/정적주민/본편/native/청취미인수.
NEXT PASS: 실제에셋시각보정·주민진행consumer·본편동일후보6단계/실청취.
=========================================================


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


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립주민v2 editor3387 미세호흡 / ROOT-RIFT-RESIDENT-IDLE-20261006
MASTER
- silhouette: 기존비대칭균열; regions: 남도착/서망자턱/동상승절벽/심연/북문.
- main route: SOUTH→NORTH 원본start/nav/exit; side spaces: 기존4주민턱.
OUTER MASS
- LEFT: 서절벽; RIGHT: 동뿌리갑각; TOP: 북계단상승문; SOUTH: 남도착지; major holes: 심연. 신규geometry0.
LARGE
- source assets: painting/cleanplate/atlas exact불변; composites: 기존lighting+onscreen4주민미세호흡; overlap/repeated silhouette: 원본배치유지.
MEDIUM
- connections: 기존그림·길·발유지; remaining holes: 실제높이·지형접합 미인수.
GROUND
- shadow: 기존발그림자정적; contamination: 기존합성; structure integration: 발pivot고정/최대상단1.12worldpx호흡.
PLAYABLE
- main arenas: 전이쉼터; travel space: 기존길; breathing space: 주민턱; threat space: 심연; combat readability: 본편전투미인수.
LANDMARK
- primary: 심연/북문; secondary: 서턱/동절벽; tertiary: 불씨/뿌리유지.
CAMERA QA
- START: source불변; EARLY: exact4호흡/발고정; ARENA: 본편미인수; SIDE L: 선택정지; SIDE R: 편집·drag정지.
- LANDMARK: 원본유지; LATE: reduced/ambient/module실패; EXIT: 정적export. 본편8카메라반복0.
TECH QA
- route: source불변/새BFS0; collision: 원본nav불변; pageerror/404/loading: 새Chrome raw의실제계수·intentional abort별도.
- seam: 새정적PNG1회 비교; performance: 기존30Hz소비/새RAF·timer0·전체FPS미인수.
- 신규unit10/10 actual1·syntax2 PASS; 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작.
FILES
- stage-owned: code3+docs12 정확15; concurrent touched: root0/owner4본인기록허용; unrelated touched: root0/72status·68exactpins유지.
GIT
- staged: 완료15경로; commit: 정상checkpoint/외부receipt exactSHA; push: 기존branch·remote exactSHA; deploy:0.
VISUAL VERDICT: RETOUCH
- 4주민미세호흡 인수와전체맵분리. 바닥확대해상도/실높이/골격·걷기/본편/native/청취 미인수.
NEXT PASS: 실제에셋시각보정·주민진행 원자consumer·본편동일후보6단계/실청취.
=========================================================


## 2026-10-06 남쪽 진입 해상도 상세 후보 v1 — 시각 실패 보존

기존 v2/clean plate1254²/world8000²를 보존한 별도 후보다. generated arrival-detail-v1.png1024×1536을 centre 기존층에 추가한 scene와 [정확 제작·실패 보고](HELL_RIFT_RESOLUTION_DETAIL_20261006.md)를 보존한다. 네 주민 발·nav1192·start/exit·원본 source는 불변이다. native 그림 밀도는 기존 crop 대비 약2.44배지만120%DPR1에서도 약3.13배 확대되어 전체 흐림 해결 완료로 계산하지 않는다. 신규 의미검수10/10 및3387 동일카메라 브라우저2그룹PASS와 별개로 사각 이음새·지형 이동·south-root 전경의 흐린 삼각 조각 때문에 **이 후보 VISUAL VERDICT: FAIL / 본편 미채택**이다. 기존 전체 맵 판정은 RETOUCH를 유지한다. 원본·실패v1 핀과 전후화면은 외부 resolution-detail-20261006에 보존한다. 완료소유 asset2+신규docs1+관련docs6만 정상checkpoint/push하며 root의 현재 후속/타인WIP·ownerSTATELOG·세이브·2_3/Q전용·어택티켓 금지는 보존한다.


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


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


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

현재 editor 결과의 독립 화면 진입·복귀 증거를 코드 핀별로 보존한다. 같은 editor를 QA 부모로 사용했지만 main game의 클리어·보상·세이브를 실행한 결과는 아니다.

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

### 독립 맵 결과 적용 경계

public lease는 host/gate 독립 왕복에 필요한 main 입력 수명 소비자이며, 기존 editor selected-NPC entry port나 lab renderer를 교체하지 않는다. 실제 main input freeze·DEMO1-1 진입·캐릭터 이전 완료0이다. geometry/outer mass/nav/가림/physical height/원화 세부·절벽 접합 개선0이며 기존 전체맵 RETOUCH를 유지한다.

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

### 기존 결과물 소비 범위

| id | 현재 적용 | 미구현·보호 경계 |
| --- | --- | --- |
| 원화/geometry | canonical source/1254² plate/world8000²/nav1192/주민 foot 유지 | 신규 맵·외부 에셋·해상도 retouch 적용0 |
| 연결 구현 | 일반 source caller→runtime→public host의 수명 연결만 구현 | 실제 game 플레이·default demo route·child parent P 전달 미인수 |
| 화면 Gate | 기존 전체맵 VISUAL RETOUCH 유지 | 신규 runtime fixture UI3/15 PASS; 기존 지도/8카메라 검사를 반복하거나 sourceVM을 화면PASS로 대체0 |


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

## ROOT-EDITOR-EDITED-SCENE-TERRAIN-20261007 — 현재 편집 씬의 독립 Three factory

현재 편집 씬의 assets/layers/objects/walkable를 실제 Three geometry·texture·material과 같은 씬의 보행 검사로 소비하는 별도 factory를 구현했다. 기존 canonical terrain·NPC 좌표 preview·본편 진입 경로는 이 단위에서 수정하지 않았다. **factory source/CPU 완료이며 실제 에디터 consumer 연결·WebGL·화면 인수는 별도**다. 현재 schema에는 물리적 절벽 높이가 없으므로 모든 이미지 지형 geometry 높이는 0이고, 기존 2D 배치가 3D 좌표계에 투영된다. 실제 높이·입체 절벽을 새로 구현했다고 표현하지 않는다.

| 구분 | 정확 source·선행 근거·완료 범위 |
|---|---|
| 신규 source | tools/2_5d/editor-scene-terrain.mjs, 18576 bytes / SHA256 2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41. ROOT-EDITOR-EDITED-SCENE-TERRAIN-20261007; source=EDITOR_SNAPSHOT; canonicalVerified=false; mainAccepted=false; nativeAccepted=false |
| 의존 source | tools/map-scene-core.js15995/0d45c15a5fdd95b18be3f3f358124543235882e712087bd99fa23653a4f454ff의 실제 validate/clone/canWalk 사용. Three r160 module1272972/76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495. core·Three 원문 수정0 |
| 실제 읽은 에디터 계약 | tools/map-scene-editor.js82229/4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd의 실제 배치·mask·sourceParallax·레이어 시차를 참조. 이 factory 작업에서 에디터 원문 수정0 |
| guide 선행 | EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md18392/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b를 이번 코드 작성 전에 처음부터 §26 끝까지 읽음. 다음 _MAP_SSOT_INDEX.md255243/8a5cc58d616ddf7bda3df8ace33906c28be6a977fdbb44e171ea748d0ff00f4d의 현재 읽기순서224–292와 관련 현재 부록→에디터 schema/render/scope→CH1_VERTICAL_SLICE.md1–38·119–174 LOCK. 거대한 index 전체 본문을 다 읽었다는 주장은 없음 |
| stage LOCK | CH1_VERTICAL_SLICE.md12860/536e2ed88990282aa1f905961d603021f4a463b3b4011c3b694e90b57b374da1. 별도 편집 씬 미리보기 factory이므로 정본 stage 지형/충돌/시작·출구/전투/보상/세이브 수치 불변 |
| root 분담 계획 | 외부 editor-scene-25d-bridge-readonly/read-only-plan.json21654/b564eafefa7f4c98390e66fa45dd7e3621c14ac490a3f0b7666a7b65c5981d4d. root는 별도 viewer·editor host 소비자를 소유. 이 factory 파일 존재나 CPU PASS를 해당 연결 완료로 승격0 |

| 공개 API | 정확 인자·반환·단위 |
|---|---|
| factory | async createEditorSceneTerrain({THREE,scene,core=globalThis.MapSceneCore,loadImage?,signal=null,angle=50,scale=400,centre=null}) → frozen handle. import 시 ../map-scene-core.js를 읽으며 전달 scene을 own-data 복제한 뒤 실제 core.validate로 정규화. canonical fetch0 |
| THREE / scene | 저장소 THREE.REVISION='160' 및 실제 생성자·ShapeUtils·map shader 계약 필요. scene은 현재 exoduser-map-scene/version1. width=world.cols×tileSize, height=world.rows×tileSize. 固定8000·1192·5480/3740·residentPaintingProfile gate 사용0 |
| image loader | loadImage(src,{signal}) → Promise of own-data {image,release?}. image.naturalWidth/Height가 asset.width/height와 정확히 같아야 함. image 자체는 borrowed/read-only이며 암묵 close0; 명시 release 함수가 있을 때 그 handle의 release만 factory가 원 receiver로 1회 호출. borrowed Texture 입력 API0; 실제 THREE.Texture는 factory 생성·소유 |
| 기본 loader | 기존 프로젝트 assets/ 또는 img/ PNG/JPEG/WebP만 Image.decode 후 소비. 경로의 .. 거절, data URI는 core에서 허용될 수 있어도 이 factory에서는 명시 거절. 새 원본/리사이즈/픽셀 편집/설치/외부 요청0. 실패한 자기 Image 또는 명시 release 시 자기 image.src='' 정리 |
| group | object3d와 group은 동일 native THREE.Group. visible 레이어·객체만 native Mesh/BufferGeometry/Texture/Material로 생성. 독립 renderer·scene·RAF·timer 소유0 |
| worldToScene | worldToScene(x,y,h=0) → THREE.Vector3((x−cx)/scale,h/scale,((y−cy)+h×cosθ)/(scale×sinθ)); θ=angle×π/180. 입력 world px, 출력 scene units. default cx=width/2,cy=height/2; centre는 선택적 {x,y}. 실제 ground h=0, physicalHeight='UNKNOWN' |
| sceneToWorld | sceneToWorld(Vector3) 또는 sceneToWorld(x,y,z) → {x:cx+x×scale,y:cy+(z×sinθ−y×cosθ)×scale,h:y×scale}. Ground는 X/Z평면이며 화면 y-down 등록은 viewer camera 책임. camera 방향 (0,sinθ,cosθ), screen up (0,cosθ,−sinθ)일 때 worldY 증가가 화면 아래 |
| 보행·시작·경계 | canWalk(x,y,radius=12) → 같은 private source에 실제 core.canWalk; disposed/비유한수/음수radius는 false. spawn은 scene.start 복제/frozen. bounds={left:0,top:0,right:width,bottom:height} frozen |
| 시점·원자료 | setViewport(x,y) → 정상 true/종료 false, 유한수 오류는 state 변경 전에 throw. sourceSceneSnapshot()은 private source의 core.clone이며 외부 변경이 active nav/geometry에 전파되지 않음. 선택 변경/씬 교체는 새 factory 책임이며 지속 원자료 폴링0 |
| snapshot | frozen primitive source/canonicalVerified/ready/disposed,width/height,angle/scale,centreX/Y,viewX/Y,objects/visibleObjects/meshCount,layerCount/visibleLayers,textures/featherMasks,walkableCount,geometryHeight0/physicalHeightUNKNOWN,maskSampleLongEdge256/layerOrderStride2001,sourceParallaxApplied=true,cleanup:{detachFailures,releaseFailures},mainAccepted/nativeAccepted=false. sourceParallaxApplied는 지원 코드 활성 표시이며 모든 객체에 시차값이 있다는 뜻은 아님 |
| dispose | 첫 정상 true/반복 false. disposed·readyfalse 먼저 확정→signal listener 해제→자기 group detach/clear→자기 texture/material/geometry→명시 image handle release. identity당 1회 시도, 각 실패 독립 집계(MAX_SAFE_INTEGER 포화). 명시 dispose는 모든 해제 시도 뒤 fixed-message AggregateError; 실패를 성공 GPU 해제로 계산0 |

| schema 소비·렌더 정책 | 실제 소비·수치·제한 |
|---|---|
| clone guard | own-data JSON 복제 budget150000/depth64; 숫자 finite. accessor/toJSON 실행0, then own property·순환·__proto__ 거절. 관련 reflection 자체 throw는 factory 실패로 전달. 모든 적대 proxy/provider 경계를 전수 인수했다고 주장0 |
| schema 정본 | core.validate의 world cols/rows10–300·tileSize8–128, assets≤128·source dimension1–8192·crop source범위, layers1–24, 전체 objects≤2000·배치 width/height1–32000·pivot/mask0–1·rotation−360..360°·opacity0–1, walkable row-major0/1 계약 재사용. 별도 scale/order 필드를 발명하지 않음 |
| 배치 변환 | u/v는 객체 normalizedlocal. dx=(u−pivotX)×width×(flipX?−1:1),dy=(v−pivotY)×height. world=(object.x+dx×cosr−dy×sinr,object.y+dx×sinr+dy×cosr), r은 y-down degree. 실제 native vertex를 만들어 core.local inverse와 신규 CPU로 대조 |
| source crop UV | uv=((crop.x+u×crop.w)/asset.width,1−(crop.y+v×crop.h)/asset.height). Texture.flipY=true, SRGBColorSpace, mag LinearFilter/min LinearMipmapLinearFilter. source 원본 alpha×object.opacity 보존; RGB 버퍼 재생성/원본1024축소0 |
| 레이어·정렬 | layers 배열 순서가 실제 layerorder. sort='flat'은 원 object 순서, sort='foot'는 y 오름차순의 stable order. locked는 렌더 제외 조건이 아님. renderOrder=layerIndex×2001+rank+1, 전체 object상한2000에 맞춤. native material transparent=true/depthTest=false/depthWrite=false/DoubleSide/toneMapped=false. 캐릭터 interleave는 별도 viewer 책임 |
| mask geometry | source mask polygon을 THREE.ShapeUtils로 triangulation하며 mask가 없으면 normalized rectangle. covered area 대조로 퇴화/비단순 mask 거절; area≤1e−10 또는 면적차>1e−7 거절. core-valid polygon 전체를 표시 가능하다고 주장0 |
| feather | source maskFeather world px 유지. editor legacy1024 긴축에 맞춘 치수 rounding→긴축256 샘플로 한 번 더 rounding. polygon 내부 minsegment거리/feather의 smoothstep alpha를 procedural RGBA DataTexture에 기록, 양자화 round255. DataTexture row0은 아래/flipY=false, LinearFilter·mipmap0; geometry hard mask와 함께 소비. source PNG alpha 또는 source maskFeather 값을 변경0 |
| 시차 분리 | layer Group offset=(viewport−worldCenter)×(1−layer.parallax)를 world projection으로 적용. sourceParallax는 별도 이미지 offset=(viewport−worldCenter)×(1−sourceParallax)를 inverse rotation/flip으로 local화. texture의 inverse offset만 바꾸며 mask UV·vertex는 고정. crop 밖은 local image0..1 alpha gate. 기존 editor의 전체 resident grade·hover UI·그림자·ambience까지 pixel-identical이라고 주장0 |
| shader guard | actual r160 ShaderChunk.map_fragment의 texture2D(map,vMapUv) 한곳만 offset sampling으로 대체. 원 sampledDiffuseColor 및 diffuseColor multiply/alpha 보존. feather alpha는 고정 localUV 곱. cacheKey='editor-scene-terrain-r160-v1-feather' 또는 '-hard'. include mismatch는 material.visible=false 후 명시 throw. actual WebGL LINK/GPU 오류 인수는 root 별도 |
| 로딩·종료 | visible 사용 src마다 한 번 decode/Texture 생성, 같은 src는 같은 자기소유 Texture 공유. ready 이전에 모든 사용 이미지 metadata 검증. AbortSignal 종료 및 late loader handle/Texture 회수. factory 실패는 자기 allocated만 rollback 후 원 thrown value(undefined/null 포함) 그대로 throw. 참조 미반환 constructor 내부 allocation은 UNKNOWN; borrowed source/core/THREE/scene/loader 변조0 |

| 신규 CPU 실제 한 실행 | 도달한 의미 조건·관측 범위 |
|---|---|
| 결과 | actual full factory import + native Three r160. 8그룹/40조건 PASS40·FAIL0·미도달0·준비오류0/exit0. 제품 Node 실행1회, 재실행0; 이전 canonical/editor/shader/actor/lease/native6 suite 재검사·합산0 |
| 그룹별 조건 | native transform/crop/order8; edited nav/privateclone5; mask/parallax/actual shader source7; normal ownership/dispose4; original null/undefined/constructor/add/load rollback6; late abort/constructor abort3; cleanup failures/borrowed image4; actual current14object scene3 |
| native 관측 | 실제 BufferGeometry position/uv와 core.local inverse·world/scene roundtrip, native Group/Mesh/order, shader source expansion, native Texture/DataTexture/Material/Geometry의 dispose event를 호출·관측. material constructor/Group.add/Texture callback/loader/AbortSignal은 통제 포트. failure cleanup thrown 값과 null/undefined presence 보존 |
| 실제 PNG 근거 | tree64²/4257/e3488c15904fcb949a18b659ec939cb3275e353838265e12fcee817cda70adaa; clean-plate1254²/2417849/aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673; abyss1920²/6350749/ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991; resident-atlas1254²/881398/ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38. 실제 파일 fullSHA/IHDR 사용; CPU image는 해당 치수 placeholder이므로 RGBA decode·GPU upload·원화 실화면 미인수 |
| 영수증 | 외부 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-edited-scene-terrain/. source-cpu.mjs17887/1e5f6f8ab1ffa718813d2cca29bd3ad6b17c2990f5d26bc31d5c0a1a13d33cee, source-cpu-result.json12886/48d6d47e3cdd6400eb584855a338b524050b3ed77447418bd84702a0e087eda2, source-cpu-run.json473/fa31475abfbe4999de7ac72060d031f2fd52acca09e02d90c320c42d4fbfcf48. 앞 미실행 source-before-cpu.mjs17531/335922f749f9f0fbe8113d66d690641c11202da081cb8ad1fe4c8540e353f6a3는 draft 이력, PASS 대상이 아님 |
| 문서·보존 분담 | 코드 동결 후 docs 전체 rg 26경로638행/raw1514168/0db7eecb132f6cc3140a85bc8ee92ee05165115a92dbc69ae9d28b041cb366b9. 본 문서만 원264985/b092dd83700e22aa93eda199d8a1539a2ea370ac7931733d1878c878fc826917 fullprefix 그대로 append. 모든 경로 disposition은 외부 final receipt로 root에 인계, 나머지 현재 정본 동기화·code+docs Git/remote exact는 root 책임. owner STATELOG·역사 수치·보호2_3·Q전용·어택티켓금지·foreign WIP·user save·기존23 보존 |
| 미인수 | 실제 editor consumer 채택·실PNG decode·GPU/link·실카메라/가림·청취·본편/main player·native6·저장ACK·Unity import·A급 완성0. 전용물리높이·바위 geometry·익명 provider의 모든 예외를 해결했다고 주장0 |

§23 MAP PRODUCTION REPORT: MASTER PLAN=현재 편집 씬을 실제 Three 이미지 지형 및 같은 snapshot nav로 만드는 독립 factory. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=편집된 객체의 실제 transform/visible/order/crop/mask와 nav 소비에 한정, authored 구성·원PNG·stageLOCK·canonical·전투값은 변경0. CAMERA QA=미실행, root 별도 viewer의 X/Z ground 투영 카메라 인수 필요. TECH QA=새 actual factory/native Three CPU8그룹40조건만 PASS. VISUAL VERDICT: RETOUCH(기존 전체 맵 유지); 이 factory의 신규 화면은 NOT ASSESSED. CPU나 파일존재를 actual editor 연결·본편/native·A급 시각 PASS로 대체0.

### 2026-10-07 편집 snapshot·가져온 이미지·보행점 현재 정본 동기화

| 항목 | 현재값·인수 경계 |
|---|---|
| 최초 source 보존 이력 | 당시 factory18576/lab10540의 정상 commit/push remote exact 000e6d3c04e7a8e004c6ed3c36f166e81f9846bf, code5/docs4. NUL81→73/index0/foreign68 exact. 최초 commit hook의 CHANGELOG_SYNC 누락 exit1은 진행log 보충 후 정상통과; bypass0 |
| 실제 연결 | 별도 “편집 씬 · 2.5D” 버튼 → current EXODUSER_SCENE_EDITOR detached snapshot → 실제 core.validate/UTF8<=32000000 → fresh owned iframe → actual child.loadScene(...,{entryId:'editor-scene-N'}) → same current/URL/window/API 및 ready/loading/disposed/entryId/error ACK. timeout30000ms/poll100ms. 기존 canonical 주민 선택 미리보기와 분리 |
| source 정확핀 | editor.html258409/b9e3a61dd9c6a11eff220b7f39a6dc9db76e375be2615422b586d12d5186b41e; host14648/39490d20c548a6eb8536439cb962c833ff3ef6e8cdc488ba9a196532121c1a3d; terrain18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf; lab HTML2997/6b988ed8e352276ca8a67b9e4a06a7e0f6a713feb2d061c227dbccd0d31e7653; lab MJS10557/1c5cdf0c8d37e4ecfc8d8a5dfec0e1e436c3d7fce62ccf4a0ed96590c5ccf07d |
| 실제 소비 계약 | 현재 assets crop/원본크기·layer순서/visible/foot정렬/parallax·object transform/pivot/rotation/flipX/opacity·polygon mask/feather/sourceParallax·walkable/start를 소비. 원 PNG/scene/nav 수정0. Three r160 angle50°/scale400 X/Z image-plane, mask alpha longedge256/geometryHeight0/physicalHeightUNKNOWN. layerOrderStride2001. 상세공식·상수·resource ownership은 HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/HELL_RIFT_2_5D_SLICE 최신절 |
| 화면·입력 | 별도 금빛 보행 probe(캐릭터아님), WASD/방향키 world240px/s/radius12/dt<=.05·대각선정규화, orthographic 기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRfinitepositive기본1/cap2. readonly sceneSnapshot clone·pagehide/abort/close/stale cleanup. host/child가 editor history/selection/save에쓰기0 |
| source 검수 | 이전 factory18576/nativeThree 통제Image8그룹40PASS(final14929/027545958decf3ccfc16a28cb19503097eee9829ddea6ef88e482126752bb9f5). 초기host숫자draft12/51PASS는문자열child미검수이력, finalstring strict2/11PASS별도(final9468/323361fe7a824422ba6a2fc37404b12cf4c0bdc6ecc5dd499e82261322c04fe5). oldsuite재실행·합산0 |
| 다른 실제 입력 검사 | 기존world source불변. nativeJ attack/ring/render 관측은최초capturemicrotask조건FAIL1/12미도달과분리. 외부windowbubble후heldrepeat/fresh/idle4PASS·대화동기render DOM조건FAIL1/3미도달/exit1, 이후render/PNG하란패널보였으나neutral240ms/J닫기후공격未인수. E/live-input-fx-consumer-browser/final-receipt.json13800/2ed847c0ce3fa2de3d4ca0abee6bb9880b738ebeb327cdb0608099e196feaa86;전체clean13PASS0/추가FX실행0 |
| 미연결·제한 | Unity PNG+.meta/FileReader dataURI import 출력의 이미지 소비 연결만 추가. Unity 프로젝트/Prefab/FBX/임의 shader 호환 인수0. 본편캐릭터P/UUID/HP/inv/flags/유품·부탁durable save·실native6·청취·A급미인수. 원화1254→8000확대/legacy1024mask흐림 미해결·전체맵RETOUCH |
| 보호·운영 | 사용자save·원PNG/scene/nav·기존23·보호2_3·Q전용magicblackBean(E불가)·어택티켓금지/foreign68/ownerSTATELOG WIP/heldWOLF1 보존. root전문직접중복송신/새팀/세션0, 기존owner후속만. 실제NUL80완료소유checkpoint/100전새산출중단, 기존단일heartbeat/다른paused자동화·아침메일유지 |

| 이번 최소 코드 보정 | 정확 계약·검증 경계 |
|---|---|
| ROOT-EDITOR-PROBE-VISIBILITY-20261007 | lab:103 markerMaterial에 transparent:true 한 flag만 추가. 기존SphereGeometry radius.04/widthSegments12/heightSegments8/color0xf1c67b/depthTestfalse/depthWritefalse/renderOrder100000 불변. 기존 opaque pass 뒤 transparent 지형이 표식을 덮는 실제PNG 실패를 수정. OLD10540/6e298397…→NEW10557/1c5cdf0c… inverse exact |
| ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007 | factory:223 source guard1곳만 추가. 기존 assets/·img/ PNG/JPEG/WebP 경로와 core동일 case-sensitive data:image/(png\|jpeg\|webp);base64,[A-Za-z0-9+/=]+ 허용. core src최대14000000문자/hostUTF8최대32000000B 유지. alias jpg·SVG/GIF/잘못된alphabet/빈URI/HTTP/blob/protocolrelative 거부. native decoder의 format sniffing과 MIME/content 일치 정책은 구분 |
| 수명·크기 | default native Image.decode/naturalWidth·naturalHeight exact·source별Texture 공유·명시release 소유/abort/stale/latecleanup 계약 불변. nativeImage.decode가 허용 alphabet의 손상padding·비이미지 데이터도 거부하는지는 별도 실제GUI 근거. borrowed loader에 release없으면 외부image에 임의cleanup0 |
| 신규 source 검사 | actual factory+Three resource/통제 Image.decode 포트 1회6그룹32조건PASS/FAIL0/미도달0/exit0. source18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf. final-source-receipt.json27161B/bbce82d435dd3e98d2b485660ff912635832fcbfbc042d51bb9eb3de81e2d29a. old40 재실행0, 이 source 검사를 native decode/GPU로 승격0 |

| 실제 편집 scene 검수·새 화면 보정 | 관측 결과와 미도달 경계 |
|---|---|
| 이전 edited scene source epoch | factory18576/2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41·lab10540/6e298397b1c8e5fdc2d28ac010e2e9081329f901b557adbcff821aa3487ffc70. 처음 numeric grid=false fixture는 import 선행FAIL1/0PASS/13미도달, 외부 grid0 보정 후 새GUI6PASS/하네스 geometry summary 누락FAIL1/7미도달. 오류 원자료 2건을 보존하며 clean14PASS로 계산하지 않음 |
| 저장된 실제 geometry 한정 판독 | 새Chrome0. 실제 원래 렌더 관측의 geometry/UV1조건과 hidden/order1조건만2PASS. 27vertices/81positionchannels/54UV 각 두관측 maxerror0; hidden west2 제외·visible12 및 실제 renderOrder 일치. archival-geometry-result.json7494/521325442e658d69aae703e60a0589cb6b80a44d302c1fda89daa319e339d8a6 |
| 이전 epoch 남은 새 native 보행·종료 | 새Chrome1/editor1/child1, G4/G5만6PASS/FAIL0/미도달0/exit0. start4020,7740→S4020,7756.008→W4020,7732.032; blocked0→1·current canWalk true/장애중심 false. actual pagehide trusted·RAF false·dispose attempt1/renderer.dispose return1·geometry13/material13/maptexture3 총29이벤트 각1·hosttimer0·storage{} 및 부모memory보존. private feather·physicalGPU해제 UNKNOWN |
| 이전 epoch 최종 보존 | 전체 물리Chrome3/context3/editor3/child2이며 live6+archival2+remaining6을 별도 기록. completion-receipt.json11894/5ce0c4a0f5cb69a99d780b0b2ebcaf85af506beeb2bb7380d3a86dfca2aca8cc. 당시 gold probe PNG 안보임/markerPixelAcceptedfalse/전체RETOUCH, 현재 source와 혼동0 |
| 새 source epoch 실제 보행점 픽셀 | ROOT-EDITOR-PROBE-VISIBILITY-20261007. Chrome1/context1/editor1/child1 종료·source8+protected9 exact. 자동P1/P2 2PASS/FAIL0/미도달0/exit0 및 PNG직접판독P3 1PASS 별도. canvas1084×716/projectedcentre543.6273,662.3/radius1.3018px, gold2pixels(543,662),(543,661) RGBA[241,198,123,255]/채널오차0. nativeGL LINK5/error0/contextnotlost. OLD_RGBA UNKNOWN·동일장면 AB숫자비교0 |
| 새 probe 근거와 가독성 | final-receipt.json8254/ede3a1645df3f42965d3e5fc61a477af61e1966679a31f0617552006d3abfcbb; actual-probe-visible.png659535/e59e9a503ccfb03531b4d0eaeb70ada802c16edc30d294944bd4c95bb167a96f. root PNG직접확인. 금빛점 표시만인수·여전히작음/맵흐림 RETOUCH. 선택적PNG좌표분석1회는PIL부재exit1/미도달로별도보존·설치/우회/재실행0 |
| 가져온 이미지 새 native 소비자 | ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007-NATIVE-DECODE-GUI. 원editor importProject(false)→원host→원factory/lab. Chrome1/context1/parent1/child1/maxlive1, intrinsic HTMLImageElement.decode 위임·원Promise반환/mock0. PNG122×69/JPEG1280×720/WebP1200×256 native decode3조건 및 actualGL1조건으로4PASS(2그룹). visibleObjects3/frames5/LINK3true/draw35/GLerror0/contextnotlost. root 성공PNG 직접판독. Unity 파일chooser/PNGmeta 전체workflow·본편인수0 |
| native 첫 실패·미도달 | N3-padding(data:image/png;base64,A===)는 실제 editor import 선행예외로 첫FAIL1·child 생성0/해당factory native decode未도달. N4비이미지/N5크기불일치2미도달, exit1/재시도0. native decode negative3 모두未인수이며 통제Image CPU32와 구분. 원자료에 console net::ERR_INVALID_URL1·pageerror0/외부요청0/쓰기0/다운로드0 보존. 제품factory 결함확정0/clean7PASS0 |

| native 최종 영수증·첫 실패 판정 | final-native-receipt.json9203/7e1cf4fa9b5d7cb044fdcb1d4fce21b72fa3b3db25d7a7da07d50f186edaa6be; native-first-failure-adjudication.json4929/d1e2764db4cc11d8e27928f827b782a92ed7d03288babf81772c1255f466e35d. editor.js623 importProject→31 picture()의 onerror 선행구간을 source로 확인. raw의 정확throw stack은 formatter가 객체presence/phase만 남겨 UNKNOWN이며 재구성0. native 손상padding/nonimage/metadata mismatch factory3조건은 모두 NOT_REACHED |

| 전문팀 공식 완료 원자료 | root 의미검토·채택 경계 |
|---|---|
| 실제 착수 | MAP·SKILL·QA·BOSS·ENEMY·ANIMVFX의 현재 TASK별 successful source와 공식 end 6건. 송신/peer/ACK만으로 착수·완료 계산하지 않음. 기존 owner가 후속을 담당하며 root 직접 전문팀 송신0 |
| 원문 보존 | ROOT-SIX-EDITOR-CONSUMER-RAW-PRESERVATION-20261007, 외부 six-editor-consumer-raw-preservation/manifest.json 3777B/db80a57ad7485d87982b70cd90f44d2d5cd0caec8ed7f9e56fc1da4515cb7064. 여섯 raw의 공식 end ID/시각/원문 bytes/fullSHA, 후보 미채택 |
| MAP | 실제 groundDetail 모듈+통제 loader에서 reject/wrong-size가 prepare:false로 흡수됨. 기존 partial-commit 결함 제안 철회. GUI/이미지 decode 인수0 |
| SKILL | source 의미검토: 현재 host hidden/close/dispose 경로 keys/RAF 해제. standalone listener 정리는 선택적 제안, 새 코드 채택0 |
| QA | admission/ACK/stale 차단 source 확인. ACK 뒤 child 렌더 실패가 외부 host active 상태에 반영되지 않는 경계는 source 관찰·실 GPU 미재현 UNKNOWN; 후속 별도 |
| BOSS | crop 검증과 UV 범위 source 확인. 고정 far10000의 극단 scene 경계는 일반 8000px scene과 구분; 현 맵 실제 결함으로 승격0 |
| ENEMY | 첫 stdin export-shape 오류 exit1 보존, 런타임 PASS0. tileSize16/radius12의 5점 collision gap은 손계산 후보, 현재 tileSize40 맵 영향0/미채택. 맵 guide 전체 선행 미수행 사실 유지 |
| ANIMVFX | source+전사 산술 모델 exit0; GPU/픽셀 관측0. atlas crop half-texel bleed·sourceParallax 극단 경계는 필요성 UNKNOWN/미채택. 이전 외부 Write2+Edit1 범위 위반과 피해 UNKNOWN 유지, 해당 3대상 추가 접근·실행·삭제0 |
| owner 보존 | CLAUDE8-SIX-CONSUMER-20261007-2338 완료소유 STATE/LOG2 정상 commit/push remote exact d4c6800385c08ffc88612d800f040e0ad20cac80. NUL73→71/index0/foreign68 exact, 그 뒤 owner 새 기록은 별도 WIP |

| docs 전체 검색·보존 | 정확 범위 |
|---|---|
| 관련 검색 | 최초77경로2044물리행(2038 path-line+장문생략표시6), probe후27경로353행, source guard후34경로415행. 최초 검색의 끝부분 일부 장문 출력은 생략되었고 77문서를 전수 읽었다고 선언하지 않음. 현재18정본+기존팀registry경계절1=19에 동기화, historical/owner WIP/다른모드/보호2_3 보존 |
| disposition 정확핀 | 최초 disposition.json91474/c5301efbe0c5d844755b3306e69b1dc4bedb199f79995f3cea4123237a207b23; finaldelta47882/6091b18084cf714ea65546c76bd620db148b63b04ee2148abbb2097acb8754c3. sourceguard wholeJSONL1618915/28084ad421d86aef4cc0a357c85d982847e05731857e2db2adfbc5be954413c0 |
| append 소유 | code2+currentdocs19만 정상commit/push하며 실제 완료와 remote exactSHA는 외부 editor-scene-combined-preservation/remote-preservation-receipt.json에서 확인한다. priorcode000e 및 ownerd4c680은 이력이며 이번 code2의 commitSHA로 오인하지 않음. docs19 fullbyte백업/fullprefix/EOF1·sourceexact·foreign68exact/index확인 선행 |
| 후속 | 다음 root 승인단위는 작은 probe가독성·흐림/접합/재질 보정, 가져오기 전체workflow/negative 미도달 원인 분리, 최소본편player/NPCdurable consumer·native6이다. 기존owner는 이미 여섯 전문팀에후속배정했고 ANIM·SKILL 성공source확인/나머지4당시도구시작대기. 이 관측을전원가동·완료로승격0. root검수중독립팀보류0·같은TASK재송신0 |

§23 MAP PRODUCTION REPORT — ROOT-EDITOR-EDITED-SCENE-CONSUMER-20261007 / PROBE-VISIBILITY / IMPORTED-IMAGE-CONSUMER
- MASTER PLAN: guide 전수읽기18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b와 _MAP_SSOT_INDEX·stageLOCK의 기존 근거를 적용했다. 이번 단위는 현재 편집 snapshot의 별도 2.5D 소비와 화면·입력 검수다.
- LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL: 기존 원PNG/scene/nav/배치/기존23를 보존했다. 앞 단계 신규제작 완료0·physical geometryHeight0/실제 높이충돌 UNKNOWN.
- PLAYABLE/COMBAT: authored walkable/start·radius12/240px/s probe의 실제 이동/장애차단을 이전 epoch 새조건6 중에서 확인했다. 현재 probe는 캐릭터가 아니며 전투/NPC대화/유품·부탁/보상/save는 이 editor viewer에 미연결이다.
- LAYERS/CAMERA: transform/pivot/rotation/flipX/crop/UV/hidden/order 및 mask/feather/sourceParallax 계약. orthographic기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRcap2. 원 PNG의 실제 깊이/해부학모션 인수0.
- TECH QA: old factory CPU8그룹40/host draft12그룹51조건와 finalstring2그룹11조건은 이력. 새guard actualfactory+Three/통제Image6그룹32PASS; 새probe 실제GL자동2PASS·PNG판독1PASS; 새native3format decode+GL4PASS/첫import예외FAIL1/미도달2를 분리했다. 전체합산 cleanPASS0·기존suite반복0.
- VISUAL VERDICT: RETOUCH. 금빛 probe 표시와 PNG/JPEG/WebP 이미지 소비는 실제 화면에서 확인했으나 probe가 작고 원화1254→8000 확대/legacy1024mask 흐림·절벽전경접합·재질이 남아 있다. 독립preview/fixture/raw보존은 본편native6·청취·실보상save·A급완성의 인수가 아니다.

### ROOT-EDITOR-DIAGONAL-WALL-SLIDE-20261007 — 편집 씬 벽 접촉 보행 현재 계약

이 절은 current lab10712 소스 epoch의 구현·신규 검수 정본이다. 직전 lab10557과 그 시점의 성공·실패·미도달 기록은 당시 이력으로 보존한다.

| 항목 | 현재 구현·인수 범위 |
|---|---|
| 소유 코드 | tools/editor-scene-preview-lab.mjs 10712B / SHA256 698e48c83bb96d89117ba8f9d5d3f0ace321c6fd8493e3f309bfc9d80674a6f3. move 한 구역만 보정. |
| 입력·요청 이동 | WASD/화살표 dx,dy hypot 정규화, 240world px/s, 호출자 tick dt0…0.05초, 최대 요청 이동12world px. |
| 기존 성공 경로 | combined endpoint canWalk(x,y,12)가 통과하면 기존 x,y 동시 이동을 유지한다. |
| 새 실패 경로 | combined 실패 후 blocked를1 증가. dx&&dy&&step>0에서만 X를 검사·적용하고 그 결과 player.x에서 Y를 검사·적용한다. 각 검사 radius12. 막힌 축은 유지. |
| 카운터·속도 | blocked는 combined 실패당1이다. 양축 실패당2가 아니다. 살아남은 축 재정규화0; 대각 한 축 속도240/√2. dt0에서는 fallback을 생략하며 이미 invalid한 발 위치의 combined 실패 카운터는 기존처럼1이다. |
| 검증 한계 | endpoint 검사다. swept collision/실제 신체·높이/모든 tile 크기의 관통0 인수는 아니다. 금빛 점은 보행 표식이며 실캐릭터가 아니다. |
| 원자료와 채택 | ENEMY 공식end3c1224f6-5a08-4a53-ae7e-dc5d6d1a3fa8@2026-10-07T00:04:16.896Z의 raw7099B/827504f177358db7c8fe1964b4f74d481e94896a3b39b799a59183ec8385ab16를 의미 검토했다. raw 무조건 축 이동 제안은 실행하지 않고 root가 combined-first/실패당1/positive-step으로 최소 변형했다. SKILL focus·QA retry 후보는 이번 미채택. |
| 신규 CPU | 실제 private move(dt) 추출 함수+기존 actual core.canWalk, Node1회, 8그룹/8복합조건 PASS, FAIL0/미도달0/unhandled0/exit0. r12 경계·X/Y slide·양축 차단·정규화 최대12·dt0 포함. dt상한은 호출자 계약이며 닫힌 dt0 위치는 합성 fixture. |
| 신규 실제 화면·입력 | 실제 Chrome1/context1/editor1/child1, trusted D+W. 3그룹/3조건 PASS, FAIL0/미도달0/exit0. 원래 에디터→host→child/Three 경로이며 제품 mock0·synthetic input0. |
| 실측 | 시작4020,7740→4025.651197395243,7672.13471956884; 관측8위치 actual core r12 통과. 모서리4025.651197395243,7652.330072841369에서3연속80ms 정지·frames/blocked 증가·held2. 전수 경로/연속 충돌 증명으로 확대하지 않는다. |
| QA 원본 보존 | canonical clone의 메모리 walkable3셀(열100/행191…193), start4020,7740/exit4020,7660만 importProject(false)했다. 원본 scene/nav/PNG·에디터 부모 fixture·local/session storage·save 불변. source8/protected9 전후 exact, pageerror0/4040/변경요청0/download0. |
| 의미·검색 | docs전체 신규 행동/소스핀 검색25경로·중복제거972행: current19/history2/ownerWIP3/다른mode1. 전수문서 fullread로 계산0. helper heading 추출 StopIteration은 준비 읽기 실패이며 제품 미도달로 별도 보존. |
| 시각·본편 경계 | 직접 PNG 판독: 하단 금빛 표식이 작고 원화 구도/레이어 표시 유지. VISUAL VERDICT: RETOUCH. 원화1254→8000 및 legacy1024 mask 흐림·절벽 전경 재질은 미해결. 실캐릭터/NPC durable/main/native6/청취/실보상save/A급완성 인수0. |
| 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/validation-receipt.json 3874B/c66885a2cb7bed74c3c91166aabc0be2e10360db15aba87988f47deb09ab7a11. CPU/native/PNG/의미 검토·검색 정확핀은 해당 영수증 참조. |
| MAP PRODUCTION REPORT §23 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/map-production-report.txt 2498B/6a21ee7a154adac271c92d056e3c2226c08b7c32d7500aec26604b17f61506ea. MASTER/OUTER/LARGE/MEDIUM/GROUND/LANDMARK은 기존 유지, 새 PLAYABLE은 한정 통로 검수, CAMERA는 새 PNG 한 장이며 전수8구역 인수0. |
| 후속 | NPC 대화 선택 후 포커스/Escape/canvas 복귀의 새 정적 후보를 실제 소스 확인 뒤 최소 구현한다. Codex 감독의 읽기 결과만 있으며 아직 구현·GUI 인수0. Claude 감독은 기존 배정6팀의 새 완료/후속을 계속 수집한다. |
| 보존 | source-change fullbyte 백업 선행. foreign68/ownerSTATELOG4 WIP/heldWOLF1/기존23/user save/원PNG·scene·nav/LOCK/보호2_3/Q전용magicblackBean(E불가)/어택티켓금지 유지. denied 목적 재시도·도구/경로/권한 우회0. 기존 WOLF 사후동일출력쓰기/damageUNKNOWN 이력 유지·추가 접근0. |
