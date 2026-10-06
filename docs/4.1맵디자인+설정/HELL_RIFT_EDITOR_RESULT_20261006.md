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
