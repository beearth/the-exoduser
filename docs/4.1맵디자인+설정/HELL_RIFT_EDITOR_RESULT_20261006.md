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
| 초기 보행 | 원본 nav4107칸, radius12·4방향 BFS 방문4100 PASS. 시작(4020,7740), 출구(4020,1740). 원본8 cameraAnchors |
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

심연 polygon tile bbox(74,61)→(115,163). mask는 월드에 고정하고 이미지 source만 viewport에 따라 이동한다. 경계 내부 거리 d에 smoothstep(min(1,d/120))을 적용하고 최종 polygon clip으로 밖으로 번지는 것을 막는다. 기존 nav의 균열 내부 중심·모서리0, 가장 가까운 타일 경계의 여유 최소56.57 world px라는 별도 대조가 있다. source shift는 시작(.7,130.9) / 출구(.7,−79.1) world px다.

원본 SHA256:

| 원본 | SHA256 |
|---|---|
| 승인 원화 | a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4 |
| 별도 심연 | ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991 |
| 원본 nav | 52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb |
| 원본 layout.js | 1b3fe7c4e0e97f6697651fd6c17c52a85de464d8f4f6946d838967f82bbbce21 |

## 캐릭터·카메라

기존 전사8방향 PNG1008×48, cell48²의 idle0~1/850ms·walk2~9/110ms 사용. 고정80/29배율과 source foot43, 방향별 idle 중심 고정으로 무기 스윙에 따른 크기/중심 출렁임을 막았다. 모든 원본 alpha는 보존한다. 실제 충돌 결과 dx/dy로 움직임·방향을 정하며, 막힌 입력은 제자리 idle다. 그림자25×11은1회만 그린다. exact actor 계약은 [에디터 SSOT](MAP_SCENE_EDITOR_20261005.md)를 따른다.

자동8카메라·보행 카메라는 viewport half extent로 월드 안에 clamp한다. 시작점 중심 때문에 하단31%가 그림 밖으로 보이던 검수 결함을 수정했다. 원본 start/exit/camera metadata는 이동하지 않았다. 편집용 자유 pan은 유지한다.

## 검수와 시각 한계

| 검사 | 실제 근거 |
|---|---|
| core | 29/29 PASS, 추가 query 경로·maskFeather/sourceParallax 검증 |
| editor 회귀 | 실제 Google Chrome UI15행동그룹 PASS, 페이지/HTTP4040 |
| 결과 씬 | 독립 Chrome17검사: query 우선/복구 저장 보존·실제 layer pixel/Undo·soft/hard edge·PNG2048²·JSON 왕복·8카메라. 초기 판17 PASS, 카메라 수정 후 최종판은 final-acceptance 기록 |
| actor | source/방향/프레임/접지/실패 처리8검사 및 tiles분기3검사 PASS. 기존8PNG 유지 |
| 실제 종주 | 실제 키 입력257타일 경로/136 turns/34.048초, 도착(4025.568,1745.600), exit 오차7.90world px. JSON 불변/페이지 및 누락오류0/actor8방향loaded·errors0. 영상12,726,475 bytes |
| 화면 | 전체/8camera·실제 움직임3지점·출구. 원화 crop joins와 심연 경계에 뚜렷한 직사각 seam 없음 |
| 한계 | 이동 가능 확인을 바닥과 발의 시각 정합성으로 확대하지 않는다. 초기 종주 중 동측 중간 턱은 허공/절벽 면을 걷는 듯 보이는 위치가 있어 후속 경계 재검토 대상이다. 전경3조각 외 완전 깊이/높이 물리는 미구현 |

## MAP PRODUCTION REPORT

STAGE: 독립 이미지 씬 결과. 본편 stage·35필드·LOCK 교체0.

MASTER
- silhouette: 비대칭 돌/생체 절벽과 세로 균열, 남쪽 도착·북쪽 상승.
- regions: 하층진입/잔불/멈춘망자/서쪽우회/부탁의턱/심연/준비/계단8 프레임.
- main route: 기존 양측 nav를 참조한 보행 시험. 실제 그림 바닥 정합은 별도 검수.
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
- remaining holes: clean plate·전경전체·높이 모델·동측 보행 시각 정합.

GROUND
- shadow: 기존 원화 접지, 캐릭터 타원25×11 1회.
- contamination: 기존 돌·생체 재질 보존.
- structure integration: 원화6파트/soft boundary 연결. 동측 중간 실제 발 위치는 RETOUCH.

PLAYABLE
- main arenas / travel / breathing / threat: 독립 거점 보행, 새 적/전투 변경0.
- combat readability: 전투·보스 인수 미실시.

LANDMARK
- primary: 밝은 북쪽 계단과 깊은 균열.
- secondary / tertiary: 양측 머무는 턱·잔불·망자, 대화 연결0.

CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 실제 Chrome8카메라 캡처, 최초 하단빈공간 발견→자동뷰 clamp 수정. 최종 외부 final-visual-review 확인.

TECH QA
- route: core/실제키종주 PASS; 그림 바닥 정합과 구분.
- collision: radius12 기존nav, source PNG/layout 변경0.
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

NEXT PASS: 실제 움직임 기준으로 동측 턱의 보행 경계를 맞추고 전체 전경·인물 분리/런타임 대화·다음 구간 gate를 연결한다. 본편채택 후 같은후보 실제6단계·청취를 인수한다.
