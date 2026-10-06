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
