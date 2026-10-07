# CH1-1 A급 제작·인수 기준 — 2026-10-05

사용자 최신 직접 지시: “16팀 다 돌려서 진행해봐 1-1이라도 완벽한 맵을 만들어보자 a급정도”. 첫 품질 인수 대상은 **1-1 썩은숲의 실제 플레이 화면과 한 번의 완결된 도전**이다. 기존 전문15팀+원총괄 통합1=제작 역할16으로 운영하고, 관리3+전문15=전체18과 두 오더담당 유일송신을 유지한다. 새 팀·채팅·Claude 실행 세션은 만들지 않는다. 지옥의 틈과 맵 에디터의 요구·원화·WIP는 보존하며, 이번 1-1에 필요한 기능부터 우선한다.

이 문서는 품질 목표와 실제 관측을 구분한다. 전팀 가동·A급 완성·최신 생산 후보의 native/청취 인수를 선언하는 문서가 아니다. 2026-10-05 12:13 UTC 기록 기준 전문팀의 새 수신/착수 확인은 0이다.

## 1. 선행 정본·변경 경계

맵 guide v0.9 전체를 읽고 MASTER→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL→CAMERA QA→TECH QA 순서와 §23 보고를 적용한다. 수치 충돌 시 최신 사용자 지시와 stage LOCK/SSOT 우선. [_MAP_SSOT_INDEX](_MAP_SSOT_INDEX.md), [현재 구성](CH1_1_COMPOSE_초안.md), [제작 정본](CH1_1_PRODUCTION_FINISH_20260916.md), [4구역 개방](REGION_CLEAR_GATE_20260930.md), [경계](CH1_BOUNDARY_EDGE_MAP020_20261001.md), [해자](CH1_ALTAR_MOAT_20261001.md), [앞뒤 가림](DEPTH_SLICE2_20261001.md)을 함께 따른다.

| 항목 | 현재 계약 / 이번 변경 |
|---|---|
| 생성 | genFromTemplate. genGauntlet은 폴백. 생산 geometry 임의 재생성 없음 |
| 좌표 | GRID=200, T=40, world=8000×8000. 시작(100.5,185.5), 시체나무(102.5,90.5), gate y=5 / exit y=7. 이번 좌표 변경 없음 |
| 지형 | layout.js 53점 polygon / 8 zones / authored62·runtime63 / hand collision21·total22 / scatter0. 원본 보존 |
| bake | 8192², core1024→world1000, 64 chunks1026²(bleed1). 기존 cache/bake 유지 |
| 층 | 기존 border foreground DEFAULT_ON=true. 새 PNG가 기존 baked mass와 겹쳐 두 번 그려지지 않도록 replacement·clean plate·pivot·mask 먼저 설계 |
| 진행 | NW dark / NE lightning / SW water / SE fire의 4구역 기존 kill80% + gate-area guard10% + 해당 CH1 angler 사망 조건. 이번 임의 완화·무료 개방 없음 |
| 보호 | docs 2_3 수정금지, Q전용 magic 패링/E 불가, 어택티켓 금지, 기존 스킬·경제·사용자세이브·타인WIP 보존 |

8개 공간 역할을 같은 사각 경기장으로 만들지 않는다. 아래 좌표는 기존 zone anchor이며 새 POI/새 collision 승인값이 아니다.

| zone | anchor | 화면과 플레이의 역할 |
|---|---|---|
| south_entry | (100,185) | 진입·방향 인지, 전사와 첫 위협이 읽히는 시작 |
| first_clearing | (100,151) | 첫 전투, 획득이 다음 장비 선택으로 이어짐 |
| root_bend | (83,125) | 비대칭 굴곡과 여행, 앞뒤 뿌리/낭떠러지 깊이 |
| west_camp | (45,100) | 서측 선택 경로와 측면 전투 |
| corpse_basin | (102,90) | 시체나무 중심 랜드마크, 접근과 전투 시점 대비 |
| east_terrace | (147,97) | 기존 고지대·경사로의 실제 높이/보행·가림 |
| north_fork | (100,52) | 후기 전투와 출구 예고, 남쪽과 다른 실루엣 |
| north_exit | (100,22) | 구역 진행 확인·보스 접근 방향 |

## 2. 실제 발견과 증거 범위

| 관측 | 근거 | 다음 제작 기준 |
|---|---|---|
| 외곽 비슷한 형태 반복 | 기존 composition-preview.jpg와 rotforest_mass_02.png를 실제 이미지로 열어 확인 | 큰 비대칭 덩어리와 연결부터. 동일 나무의 flip/scale 반복을 다양성 완료로 계산하지 않음 |
| 넓은 바닥의 지역 차이/진행 읽힘이 약함 | 기존 격리 root97bb 앱3386에서 로비→1-1 전사 입장 및 실제 시작 화면 | 밝기·재질·큰 지형으로 길과 전투 공간을 구분. 작은 데코로 빈 곳을 채우는 작업은 뒤로 |
| 안내 초상화가 오른쪽 전투 공간을 크게 가림 | 같은 앱 시작·초기 보행 화면의 Diroi 안내 | UIUX가 전투/HUD/대화 영역을 실제 해상도·배율로 검수, 닫기·재표시 및 입력 소유 함께 확인 |
| 실제 보행과 카메라 움직임 | 같은 저장된 Lv.6 전사로 w 입력20회. 적 등장·위치/화면 변경 관측 | 조작 가능만으로 전투·획득·보스 개방/사망·부활/재도전 완료라고 계산하지 않음 |
| 저장 프로필의 자동 기능 활성 | 입력 중 MP 변화/충전·장비 안내 관측 | w 입력 자체가 공격·새 아이템 획득의 증거라고 추정하지 않음 |
| 현재 중지 상태 | ESC 설정창에서 멈춤. 설정값 변경 없음 | 같은 격리 앱·캐릭터를 이어 사용, 다른 사용자 앱/게임·새 실행/빌드 중복 없음 |

native 대상은 기존 package EXODUSER-97bb3ef9-fff2-4761-9841-e5a24a953847.app, URL 127.0.0.1:3386/game.html?test=1&slot=demo&demo=1이다. 도구 화면 관측은 있으나 새 로컬 screenshot 파일은 만들지 않았다. **고정된 이전 빌드 관측이며 최신 checkout의 시각 PASS가 아니다.** 실제 청취 인수는 수행하지 않았다.

| 파일 | checkout SHA256 | 기존 앱 SHA256 |
|---|---|---|
| game.html | 2596c6b4f233770892f05a28e07c83ba38efef83352a6f1040d368b252480852 | e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea |
| ch1-boundary-edge.js | e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2 | 동일 |
| ch1-altar-moat.js | 0b34f31917e6e347acd0a4b156534ca7017f8284d973b8898d49cd77395cf369 | f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0 |

최신 해자 수정과 이전 앱 화면을 혼동하지 않는다.

## 3. 기존 15팀의 작업 소유 — root와 합산16

아래는 **배정 준비 기준**이다. §24의 아직 미송신된 지옥의 틈 범위보다 우선하며, 이미 진행 중인 작업/기존 MAP 큐를 중복 전송하지 않는다. Codex7은 기존 작업감독, Claude8은 기존 Claude 오더담당만 송신한다. 실제 수신·새 turn·유용한 tool·완료ID를 확인해야 가동으로 바꾼다.

| 역할 | 오더 | CH1-1 우선 책임 | 첫 검수 가능한 산출 |
|---|---|---|---|
| MAP | Claude8 | 8공간의 큰 구도·외곽/접합/접지, 현 지형 LOCK과 에디터 재사용 | 기존 후보를 보존하고 큰 형태 replacement 계획과 8-camera 구성. 기존 WIP 포함 합산max3파일 |
| ART | Claude8 | 반복 실루엣·재질·실제 자산 pivot/크기, 새 root 후보의 게임 시점 적합성 | 실제 경로·규격·레이어별 배치/미채택 목록과 원본 보존 |
| ANIMVFX | Claude8 | 경계 앞뒤/안개·숲 움직임·전투VFX 대비 | 생명주기·가림과 실제 캐릭터/투사체 가독 검수 |
| ENEMY | Claude8 | 초기/측면/후기 위협과 swarm, 공격·이동 읽힘 | 기존 적/AI 경계를 실제 동선에 대조, 동시공격 제한 추가0 |
| BOSS | Claude8 | 보스 접근·개방·전투/사망·부활/재도전 | 기존 gate·보스정본 유지, 같은 후보에서 6단계 재현 가능한 연결 증거 |
| SKILL | Claude8 | 전투·설정·대화 간 입력 수명, Q패링·조준·이동 | held/blur/retry 검수와 플레이 입력 보존, 확정 수치 변경0 |
| STORY | Claude8 | 지옥 상승 동기가 읽히는 1-1 안내/랜드마크·다음 틈 연결 | 기존 로어 기준 문안·node/action·재방문 의미. 새 DLC 약속0 |
| QA | Claude8 | 8-camera와 같은 후보 실제 6단계, 에디터 회귀·성능 | source/native/visual/audio를 분리한 재현·실패 위치·증거표 |
| UIUX | Codex7 | 실제 시작 안내 초상화/HUD·미니맵·보상·설정의 가독·초점 | 전투를 가리는 요소·실해상도/배율·닫기/재표시·입력 수명 검수 |
| QUESTNPC | Codex7 | 안내/NPC·구역 진행·선택/부탁→다음 도전 | 기존1-1 NPC/퀘스트 연결과 실패·재방문·중복검수 |
| ITEM | Codex7 | 첫 획득→비교/장착→다음 전투, 드롭 가독 | 실제 inventory 지급/용량/중복·장착·save 계약. 새 아이템 수치0 |
| SOUND | Codex7 | 숲 환경·위협·타격/획득·보스/부활의 실제 청취 | 기존 자산 cue·gesture/설정·중복loop/stop 수명과 native 청취표 |
| BALANCE | Codex7 | 초반 도전/보상·4구역 gate·재도전 비용의 정본 일치 | 기존 수치로 병목 재현과 근거, 임의 난이도/경제 변경0 |
| BUILD | Codex7 | 이미지/pivot/mask 경로와 candidate→package pin 일치 | 누락/형식/자산 의존 대조. 대형 빌드·새 서버 중복0 |
| MARKETING | Codex7 | 사용자가 보는 완성 화면의 품질 판정 보조 | 8-camera의 반복/빈 바닥/랜드마크·완성도 증거표, 외부게시0 |
| ROOT | 총괄 | 순차 후보 인수·생산 최소연결·정본/Git·실제 카메라/플레이 | 정확 completedID/pins, 백업, 의미검수, 관련 docs 동기화, commit/push·원격SHA |

후보14팀은 각1파일의 소유범위, MAP은 기존요청/WIP 포함max3을 유지한다. 기존 hell-rift 예약과 이번 CH1 후보를 이중으로 발급하지 않는다. 타인WIP 및 직접 사용자 작업의 범위를 바꾸거나 이전 큐를 삭제하지 않는다.

## 4. 가동 실패 — 실제 확인된 경계

| 담당 | 관측 | 실제 전달/착수 | 허용된 다음 단계 |
|---|---|---|---|
| Codex7 | 기존7팀 모두 이전 turn 종료. 7건 send_message 자동 승인 검토에서 “승인이 필요하지만 현재 승인 정책은 never”로 거절. STATE/LOG 쓰기도 해당 담당 허용 범위 밖 | 새 전달0 / 새 전문팀 착수0 | 미송신 초안을 CH1 우선으로 준비. 거절 도구 재시도·직접팀송신·새채팅·CLI/UI 우회·정책/권한 변경0 |
| Claude8 | 기존8역할 등록 UUID/PID가 metadata에서 사라짐. 현재 다른8개의 idle metadata는 동일checkout이지만 공식 역할 이관 증거 없음. ps 조회는 operation not permitted | 새 전달0 / 역할 재연결0 | 정상 읽기 가능한 공식 handoff/역할 등록 근거만 확인. 임의 PID/UUID 대응·새세션·ps 우회0 |

Codex 감사의 상세 오류/미송신 초안은 /private/tmp/exoduser-codex7-rift-20261005-115558-dispatch-audit.json, Claude 기록은 소유 SUPERVISOR_STATE.json의 latestRiftDispatchIdentityFailure/pendingManualRiftAssignments20261005에 있다. 예전 MAP Chrome 사용자선택 대기는 사라진 기존 등록의 이력이며 현재 새8세션 중 MAP 역할/현재 상태라는 증거가 아니다. 자동화는 일시중지 유지한다.

## 5. 제작·인수 GATE

| 순서 | 판정 질문 | 통과에 필요한 실제 증거 |
|---|---|---|
| MASTER | 시작/여행/측면/랜드마크/후기/출구가 공간으로 구별되는가 | 기존 LOCK을 유지한 전체구도와 주요 루트·큰 비대칭 덩어리 배치 계획 |
| OUTER→MEDIUM→GROUND | 숲·절벽이 연속된 환경인가 | 반복/큰 hole/고립 구조·붕뜬 접지 제거, baked/runtime 중복 없음 |
| PLAYABLE/COMBAT | 배경 안에서 캐릭터·다수적·투사체·Q색·loot가 읽히는가 | 실제 전투·회피 공간/보행·경계/가림·시야·입력 검수 |
| LANDMARK→DETAIL | 시체나무/고지대/출구의 위계와 다음 목적이 보이는가 | 먼저 큰 위계, 그 다음 기존 소품·오염·빛 연결. random scatter0 |
| CAMERA | 정상 플레이 카메라8장과 이동 중 깊이·seam이 좋은가 | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실제 화면 |
| TECH | 저장/재진입·캐시/자산·동선·성능이 보존되는가 | 같은 후보 pins·404/pageerror/route/collision/seam/loading/performance 측정 |
| FULL PLAY | 같은 후보 시작→전투·획득→보스방개방→보스전사망·부활→재도전과 인수 | MILESTONE-CH1-1-PLAYABLE-20261002.md의 실제6단계·화면·청취. fixture/이미지/보고서/실행파일을 대신 세지 않음 |

A급은 이번 프로젝트의 위 GATE가 모두 충족된 화면·플레이 품질 목표이며 객관적 외부 등급 또는 테스트 숫자로 판정하지 않는다. 현재 **RETOUCH / 전체6단계 미인수**다.

## 6. root 소유 실제 신규 후보 1점

공식 완료ID **ROOT-CH1-A-OUTER-BUTTRESS-CANDIDATE-20261005**는 이미지 후보의 생성·파일보존 완료만 의미한다. 새 전문팀 완료나 생산 채택/A급 맵 완료가 아니다.

| 항목 | 정확 값 |
|---|---|
| 경로 | assets/map/ch1/a_grade_candidates/20261005/root_buttress_v3.png |
| 파일 | PNG RGBA, 1774×887, 1555137 bytes |
| SHA256 | 8e2b6103bd7cd2e1a73599abf64b563ce1932c88e45d66a58f79e3079e65f5b6 |
| 생성 | built-in image_gen.imagegen / transparent_background=true / 3회. 외부 CLI/API key·PixelLab·캐릭터 생성 없음 |
| 참고 | 기존 rotforest_mass_02.png 재질 참조. v1→v2 큰 형태 교정→v3 여백/잘린 끝 교정. 참조 원본과 세 생성 원본 보존 |
| 실루엣 | 높은 좌측 접힌 뿌리/절벽→사선 중간 선반→낮은 오른쪽 뿌리 부채. 중앙·우측 직립 나무 반복 제거 후보 |
| alpha | 완전투명965861 / 부분투명607327 / 완전불투명350 pixel. 비투명607677의 alpha q10=62/q25=251/q50=253/q99=254, 평균224.23142557641643. 대부분 몸체는 거의 불투명, 얇은 끝·경계 투명은 실제 배경 대비 확인 필요 |
| bounding box | [17,33,1712,864], 좌/상/우/하 여백17/33/61/22px. 요청6% 여백 미달이나 비투명 pixel의 캔버스 접촉0 |
| 적용 | 원본 sibling 후보만 보존. 기존 M1/M2/M3/M5·bake·collision·코드 변경0. 새 규격/pivot/mask·clean plate·실제 카메라 접지 미검수 |
| 판정 | VISUAL VERDICT: RETOUCH. 개별 이미지 깊이·방향/광·마감, 게임 시점 및 기존 환경 연결 보완 필요 |

최종 생성 프롬프트:

> Precise packaging edit of this transparent game environment sprite. Keep the exact diagonal asymmetrical root-buttress design, dark bark/crimson tissue material, lighting, camera perspective and all details intact. Fix ONLY the cut-off contour and padding: reconstruct the small missing upper-left/top root tips where the object currently touches the canvas edge, and scale/reframe the COMPLETE object to fit inside the transparent canvas with an empty transparent margin of at least 6 percent on EVERY edge. Every root tip must terminate visibly before the border. The final object must retain the high folded left mass, low collapsed middle shelf and very low fractured right fan; no upright center/right trees added. Preserve true alpha transparency through all openings and throughout the empty margin. No background, no surrounding floor or text.

생성 원본은 /Users/fordeargamers/.codex/generated_images/01a0faa9-b453-7673-be39-98adedb4c2b3/의 exec-728bb1ce-8062-45f3-abe1-11c6f2a35974.png, exec-d8c21a19-3f50-4e7e-af61-f899d2bd8fa7.png, 선택 exec-c23ffd9d-a005-4347-b4dd-eae9447f805f.png. 원본 이미지에 재편집/덮어쓰기 없음.

## 7. 보존·용량

편집 전 root 정본7파일과 HEAD/실제72변경 목록·보호 source pins를 /Users/fordeargamers/.codex/visualizations/hell-rift-editor-20261005/ch1-a-grade-before-1791202193365/에 백업했다. 선택 이미지 receipt도 이 외부 백업에 있다. 신규이미지 뒤 실제73, 본 문서와 root 관련7정본 완료 배치 뒤 git status NUL 기준 실제81 확인. 실제80부터 이 완료소유 배치만 정확ID/pin으로 후보미채택 checkpoint하고 기존 WIP72는 제외한다. 실제수는 commit 직전/직후 확인한다.100 전 새산출 중단, 삭제·ignore·cleanup·rollback0.

## 8. MAP PRODUCTION REPORT

STAGE: CH1-1 현재정본·이전고정 native 기준 감사 + root 외곽 이미지 미채택 후보1점.

MASTER
- silhouette: 기존53점 유지. 높은 좌측/낮은 우측 비대칭 후보 생성; 전체 새 구도 승인 전.
- regions: 기존8 zones와 4구역 진행 조건 보존.
- main route: 남쪽 시작→굴곡/시체나무/고지대→북쪽 접근 유지.
- side spaces: 서측·동측 기존 anchor 유지, 실제 전구간 검수 미완료.

OUTER MASS
- LEFT: 새 접힌 뿌리 후보 높은 부분. 실제 배치 미채택.
- RIGHT: 낮은 사선/부채 부분. 기존 mass 대체 미채택.
- TOP: 기존정본 보존, 북측 새화면 미검수.
- SOUTH: 이전 앱 진입화면 감사, 새배치 없음.
- major holes: 초기화면 큰 빈 바닥 개선 필요; 전체8-camera 미검수.

LARGE
- source assets: 기존 rotforest_mass_02.png 및 보존된 root_buttress_v3.png.
- composites: 신규1점, 기존bake/runtime 합성0.
- overlap: 접지/mask/replacement 계획 전 적용0.
- repeated silhouette: 개별 후보의 중앙/우측 직립 반복 제거. 전체맵 해소 미검수.

MEDIUM
- connections: 기존정본 유지, 신규접합 없음.
- remaining holes: 초기화면·전체맵 반복/빈공간 잔여.

GROUND
- shadow: 새 후보 자체광/그림자만; 게임 접촉그림자 미검수.
- contamination: 기존 재질 보존.
- structure integration: 아직 미채택. 신규bake/runtime 중복0.

PLAYABLE
- main arenas: 기존 유지, 실제 전체전투 미검수.
- travel space: 이전고정앱 시작/짧은 북측보행만 관측.
- breathing space: 전체루트 미검수.
- threat space: 적 등장 관측, 공격/획득 완료 근거 없음.
- combat readability: 큰 안내초상화 가림과 단조로운 바닥 RETOUCH.

LANDMARK
- primary: 기존 시체나무(102.5,90.5), 현재화면 미검수.
- secondary: 기존 동측고지대(147,97), 현재화면 미검수.
- tertiary: 기존북측출구 접근, 현재화면 미검수.

CAMERA QA
- START: 이전고정 native 실제관측, RETOUCH.
- EARLY: 짧은보행/적등장 관측, 전체전투 미인수.
- ARENA: 이번 실제화면 없음.
- SIDE L: 이번 실제화면 없음.
- SIDE R: 이번 실제화면 없음.
- LANDMARK: 이번 실제화면 없음.
- LATE: 이번 실제화면 없음.
- EXIT: 이번 실제화면 없음.

TECH QA
- route: 기존격리앱 실제보행 partial; 신규전체루트 검사 없음.
- collision: 변경0 / 이번전체검사 없음.
- pageerror: 새런타임 코드 적용0 / 이번전수검사 없음.
- 404: 신규이미지 미연결 / 이번네트워크검수 없음.
- seam: 새bake 없음 / 실제전구간 미검수.
- loading: 기존로비→1-1 입장 관측, 최신소스 패키지 인수와 구분.
- performance: 이번 측정 없음.

FILES
- stage-owned: root 신규이미지1점·본정본·연결된 root 관련7정본.
- concurrent touched: 기존 WIP72 목록과 두 오더담당STATE/LOG는 읽기만, root 변경0.
- unrelated touched: 0. 보호2_3/사용자세이브/생산geometry·게임코드 무변.

GIT
- staged: 첫 완료소유9파일만 실제 commit. 타인WIP 제외.
- commit: 첫 후보/정본9파일 checkpoint f930bc2c5f7380492083dffc5eefa033d77c6e4c 완료.
- push: 첫 배치 origin codex/mac-environment-20261001 원격SHA가 f930bc2c5f7380492083dffc5eefa033d77c6e4c와 정확일치 확인.
- deploy: 0.

VISUAL VERDICT: RETOUCH

NEXT PASS: 담당별 CH1 우선 미송신 범위 준비/정상역할등록 근거 확인, 큰 구도 승인·기존mass replacement/접지 계획→실제8-camera/같은후보6단계·청취. 거절 송신/등록 복구를 우회하지 않는다.


## 9. 오더담당 준비 완료와 실제 미송신 — 2026-10-05 12:20 UTC

| 담당 | 완료 근거 | 실제 상태 |
|---|---|---|
| Codex7 | SUPERVISOR-CH1A-PREP-20261005-121738, /private/tmp/exoduser-codex7-ch1a-20261005-121738-prepared.json, 36129B/SHA25620cf21a1610495caaa1aa624f1479bbf7b23d086881f05a948efaf82ada7d10a. UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING7개 책임·caller·검수·인계 준비 | 미송신. 새전달/turn/착수0. 승인필요/never 및 STATE/LOG 쓰기 제한 미해소. 거절 재시도/우회0 |
| Claude8 | 소유STATE의 latestCH1PriorityAudit20261005/pendingCH1Assignments20261005, 기록12:20:38.497332Z. ART/ANIMVFX/ENEMY/BOSS/SKILL/STORY/QA7개 준비 | 현재8 UUID의 공식역할 handoff 근거 없음. 복구/새전달/착수0. MAP 기존TASK·HTML WIP·3보완큐 보존, 재송신0 |

root가 원문 pin과7개 준비 목록·전달0을 직접 대조했다. 두 담당 준비 완료는 전문팀 제작완료가 아니다. Codex STATE/LOG는 쓰기 제한으로 갱신되지 않았으며 root가 대신 덮어쓰지 않았다. Claude 소유STATE/LOG 갱신은 기존72변경 안에 있고 이번root Git에 포함하지 않았다. 기존 Rift 미송신 슬롯을 재사용해 중복예약/새산출예산0, 자동화중지 유지. 첫 root9파일 checkpoint 후 실제변경72 확인. source 게임·geometry·MAP raw는 무변, **VISUAL RETOUCH / A급·같은후보6단계·청취 미인수** 유지.


## 10. 공유 맵 에디터 첫 버전 완료 — A급 맵 인수와 구분

root가 사용자 최신 이미지 크기 수정·맵 에디터 직접 지시에 따라 editor.html에 씬 편집을 구현했다. [MAP_SCENE_EDITOR_20261005.md](MAP_SCENE_EDITOR_20261005.md)의 이미지 조합·world 크기·pivot·레이어·길/보행·왕복 저장을 core27/실제 Chrome UI15그룹으로 검수했다. 기존 타일 편집은 ?workspace=tiles, 기본은 이미지 씬이다. root 외곽 후보1점은 팔레트 재료로 노출할 뿐 생산 채택0이다.

1-1 프리셋은 v7 ground/left/right/north와 정확 CH1_1_PRODUCTION.buildRLE(200,200), 기존8 regions의 **구성 스케치**다. 최신 production outer/bake/움직임97차를 재현하거나 새 1-1 A급 map를 완성했다고 계산하지 않는다. LOCK/geometry/layout·본편·native 후보 무변, 16 제작 역할의 새 실제송신·착수0 상태는 그대로다. 에디터 기능 완료와 전투/획득·보스6단계·실청취 완료는 별도다. MAP PRODUCTION REPORT는 구현 계약§7, **VISUAL VERDICT: RETOUCH.**


## 11. 기존 Claude8 명시 책임 재배정 — 2026-10-06 KST

공식 배정ID **ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006**. 사용자 직접 지시로 아래 현재 UUID에 담당 책임을 명시 배정한다. 이는 기존 세션의 새 책임 지정이며, 옛 UUID와의 동일역할 승계 또는 Terminal1–8 순서 매칭을 주장하지 않는다. 2026-10-05T23:44:45Z 공식 CLI 조회19개 중 background11/interactive8, 현재8 전부 same checkout/interactive/idle이고 local metadata의 UUID/cwd/kind/status가 일치했다. root의 fresh CUA 화면도 동일 checkout의 기존8 Claude Code 입력대기를 확인했다. 새 세션 생성0.

| 현재 역할 | PID | 현재 정확 UUID | 우선 책임 |
|---|---|---|---|
| ART | 7458 | `94436f2f-74d9-40c2-b0b5-21c6022e8dc4` | 자산 크기·pivot·접지·레이어 교체 |
| MAP | 7537 | `09198e3b-e45c-404e-b2b0-e42ccd9d8af2` | 1-1 큰 구도·외곽·지면 연결·8-camera 후보 |
| SKILL | 7621 | `ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4` | 전투/대화/설정 입력소유·held/blur/retry |
| QA | 7700 | `20094d24-cd9b-404a-89c7-cbafcbcdfcaa` | 실제 source 경계·scene/nav·저장 영향 검수 |
| ENEMY | 7783 | `0d77d1ea-dd83-499f-af15-2cd5ebb94d48` | 8공간 적 배치·swarm·위협 가독 후보 |
| ANIMVFX | 7877 | `f56a2bc8-0cf7-459e-a393-5f93d78d30e1` | 캐릭터 발접지·앞뒤 가림·VFX 수명 후보 |
| BOSS | 7978 | `72ba2963-6065-4d67-889a-4e3a76c97140` | 4구역 gate·보스/죽음/부활/재도전 연결 |
| STORY | 8073 | `48d2bfa5-101f-4c8e-9759-dc0925597905` | 지옥 상승 안내·틈 망자 node/options/action |

Claude 오더담당 `01a0fd2d-8a6f-7f01-b2da-70119654cffe`가 이 표를 공식 handoff로 인수하고 현재 live inventory/metadata/socket을 다시 대조한 뒤 미송신 CH1 후보를 각1회 전달한다. 옛 rows/UUID/완료 이력과 MAP HTML WIP·3개 미소비 큐는 보존하고 현재 배정 필드는 별도로 둔다. MAP은 구 큐 재전송 대신 CH1 큰 형태·8-camera 후보의 독립 책임을 맡으며 기존 WIP 합산max3 안에서 남은 예약만 사용한다. 공유 editor/core/actor/result scene은 root가 구현·보존했으므로 재작성하지 않는다.

ART/ANIMVFX/ENEMY/BOSS/SKILL/STORY/QA는 오더 STATE의 `pendingCH1Assignments20261005`에 준비된 기존 예약1파일을 재사용한다. MAP 및 맵 geometry/가림/카메라 관련 담당은 맵 guide 전체와 stage LOCK/SSOT를 선행 읽고 §23 보고·VISUAL VERDICT를 실제 근거로 제출한다. 후보에는 실제 코드/데이터·OLD/NEW 또는 구체 재현 근거를 담고 단순 계획 반복으로 착수·완료를 대신하지 않는다. 생산/shared docs/Git·게임/세이브/빌드는 root만 변경한다.

배정 기록 시 actualSent=0/actualStarted=0. 현재8 idle 확인과 공식 역할 배정은 실제 제작착수와 구분한다. 이후 유일담당 STATE/LOG에 peer·선행문서 Read·첫 유용 source tool·Write·공식 endID/pins를 구분해 기록한다. 이전 거절된 목적/조회·MAP 큐를 우회 재시도하지 않으며, 이번 별도 CH1 제작 책임을 기존 정상 inbox에 전달한다. 자동화중지·관리3/전문15=18·새팀/세션/권한변경0·보호2_3/Q전용/어택티켓금지/원화/기존23/타인WIP/세이브·80/100 한도를 유지한다.


### 2026-10-06 KST 실제 전달 결과 — 실행환경 연결 차단

오더담당 완료 turn `01a10e77-917e-7590-aaa9-579202ec28d0`가 공식 역할8건을 인수·소유 STATE/LOG에 기록했다. 2026-10-05T23:48:56Z 첫 ART 정상 inbox 연결이 `PermissionError: [Errno 1] Operation not permitted`로 차단되어 송신0/전문팀 착수0/8. 나머지7역할 연결은 시도하지 않았고 재시도·다른채널·권한변경0. 역할 이관 문제는 해소됐지만 현재 실행환경의 연결 차단은 남았다. 현재8팀 제작중으로 계산하지 않는다. 이전 MAP WIP/3큐·UUID/완료 이력 보존. 실제 외부 조치가 있기 전 거절 작업을 반복하지 않는다.


## 12. Claude8 실제 재개·완료 후보7 원자료 보존 — 2026-10-06 KST

공식 보존ID **ROOT-CLAUDE7-CANDIDATE-RAW-CHECKPOINT-20261006**. 앞 절의 EPERM/송신0은 당시 이력이다. 이후 실제 외부 실행환경 조치와 새 권한 context를 받은 유일 Claude 오더담당이 정상 CLI/inbox를 확인했고, 2026-10-06T01:01:43.109~43.778Z 기존 역할8에 각1회 전달했다. 신규 peer8, 선행 Read8, 유용 source8이 확인됐다. root의 권한/인증 수정·우회0, 자동화는 일시중지 유지. Codex7의 이번 실제 재가동은 별도 근거 없이 확인된 것으로 확대하지 않는다.

2026-10-06T01:06:44.758Z~01:11:13.365Z 아래7팀의 최초 후보 end_turn과 파일이 확인됐다. ENEMY의 기존 최초 후보 turn은 보존하며 미완료 원자료를 stage하지 않는다. 완료7팀에는 유일 오더담당이 새 파일0·raw 수정0의 독립 메모리 후속을 각1회 전달했다. 기존 MAP HTML WIP·3큐, 타인 WIP·오더 live STATE/LOG·사용자 세이브·기존23변경은 보존/이번 checkpoint 제외다. 전문팀의 후보 제출과 root의 생산 채택은 별도다.

### 정확 완료 파일·핀

| 역할 | 상대 파일 경로 | bytes | SHA256 | 실제 end_turn UUID | 공식 보고 endID | 검수/채택 |
|---|---|---:|---|---|---|---|
| ART | `tools/team-followup-20261005/hell-rift/ART/rift-asset-catalog.json` | 14089 | `8776078b295b45cc4e6413204f9dbcef194885f05d8d2ca60a1d8388949dec9e` | `96e2d0e3-dd62-4657-a200-c33c4080f93c` | `ART-CH1-1-RIFT-ASSET-CATALOG-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |
| SKILL | `tools/team-followup-20261005/hell-rift/SKILL/rift-input-boundary.mjs` | 21893 | `0239609bd83b8ad84dcc6242656bee014c111e81a08e8ab37dc6bb6c36b5ef55` | `76498de8-e2f1-4a34-964e-dc4513e74293` | `SKILL-CH1-A-RIFT-INPUT-BOUNDARY-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |
| QA | `tools/team-followup-20261005/hell-rift/QA/rift-contract-checks.mjs` | 17118 | `00966bbf8509ba3a38a39142ecad82388ec34f2a235da0e94a64785c803d72e6` | `7ba57a9e-494b-4a2f-b9aa-8615a0a7724c` | `QA-RIFT-CONTRACT-CHECKS-20261006` | 원자료 보존 / 생산 미채택 |
| ANIMVFX | `tools/team-followup-20261005/hell-rift/ANIMVFX/rift-ambience.mjs` | 14603 | `2e1c4decdb189a62df94faaa8c909a4e642dbc98c695f92b8ae4b020f186053f` | `35f25cab-4ad2-4b65-bdbf-ef9cdc5c91f4` | `ANIMVFX-CH1-RIFT-AMBIENCE-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |
| BOSS | `tools/team-followup-20261005/hell-rift/BOSS/rift-boss-gate.mjs` | 20605 | `83fb1e5b67f62e2aeb1a5f8a8d040a54a39406d82803e028b8e9f4ab523b6fd0` | `8d6b2380-d50e-4f1e-b28b-37187341dca9` | `BOSS-CH1-A-RIFT-GATE-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |
| STORY | `tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json` | 25940 | `be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc` | `b55a1b17-6d39-47e4-a787-64555fd84152` | `STORY-CH1A-RIFT-DIALOGUE-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |
| MAP | `tools/team-followup-20261005/hell-rift/MAP/ch1-a-composition.scene.json` | 91606 | `d19d1dd2590bf2f3ce25379e37947f062c8756002b9135e232a1f0a32abad19a` | `aed7cadb-9b0b-4983-a58e-464c14bc77c5` | `MAP-CH1-A-COMPOSITION-CANDIDATE-20261006` | 원자료 보존 / 생산 미채택 |

ART는 기존 자산의 크기/pivot/접지 카탈로그, SKILL은 입력 경계 독립 참조모듈, QA는 source 계약 검사, ANIMVFX는 독립 분위기 렌더 모듈, BOSS는 gate/재도전 참조·검사, STORY는 망자 대사 데이터, MAP은 독립 CH1 구성 씬 후보다. MAP의 JSON은 지옥의 틈 현행 결과 씬을 대체하지 않는다. 공유 editor/core/actor·본편 런타임 변경0. 저장된 틈 nav1192/원화·현재 보행·카메라 결과는 그대로다.

완료 원자료 JSON3 parse 및 MJS4 `node --check` PASS. 실제 함수 의미검수·consumer 연결·후보 화면/청취 인수는 보존 시점 미완료다. harness/source PASS를 실제6단계나 A급 맵 완료로 계산0. **VISUAL VERDICT: 기존 RETOUCH 유지**. 완료 소유 raw7·관련 docs8만 좁게 checkpoint하며, 정확 경로·핀·endID를 보존한다. 외부 백업과 receipt는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/claude7-checkpoint-20261006/`. 문서 쓰기 직전 실제 NUL/untracked 전체 포함 변경 수 **80**; 80부터 상세후보 검수 대기 없이 완료 소유만 보존한다. Git commit/push의 정확 SHA·실제 보존 후 변경 수는 외부 receipt에 기록한다.

NEXT PASS: 안개/입자 좌표계를 에디터 transform·심연 mask·현행 nav에 맞추고, 대사 후보의 접근 불가 POI를 정합 검수한 후 실제 consumer를 연결한다. 원자료를 임의 수정하지 않고 production 수정은 root의 별도 백업·코드/docs 동기화·검수 뒤 채택한다. 같은 후보의 본편 시작→전투·획득→보스방 개방→사망·부활→재도전 및 실제 화면/청취 인수는 남아 있다.


## 13. ENEMY 완료 후보 추가 보존 / source 검수 — 2026-10-06 KST

공식 추가 보존ID **ROOT-CLAUDE8-ENEMY-RAW-CHECKPOINT-20261006**. ENEMY 최초 후보가 2026-10-06T01:14:45.906Z 실제 end_turn `6721d678-7005-422e-99f5-602f2a530f5d`로 종료됐다. 공식 보고 endID `ENEMY-CH1A-RIFT-BOUNDARY-CANDIDATE-20261006`, 정확 경로 `tools/team-followup-20261005/hell-rift/ENEMY/rift-enemy-boundary.mjs`, 20897bytes, SHA256 `ec6b4446984c8d48b8cfe5f680ba1ca41c0c2c337092da936686444d272e15ce`. 이로써 Claude8의 최초 독립 원자료 제출8/8이며 생산 소비자 연결·팀8의 현재 동시 실행·게임 완성은 별도로 확인한다. ENEMY 보고 sourcechecks8/8과 직전 실패7/8 이력은 root의 상세검수와 구분한다. 새 raw는 원문 불변·생산 미채택으로 백업/이 문서와만 보존한다.

§12의 나머지7 raw는 원격 `7054c3450e7e9540fa78262dc308fdd8d0938189`에 정확 보존됐고 actual80→73을 확인했다. 후속 운영은 유일 Claude 오더담당만 송신, 자동화 중지·새팀/세션/권한변경0 유지. 후속 중 일부 담당의 외부 memory/scratch 파일 출력은 '새 파일0/응답만' 범위와 불일치한 관측으로 오더 STATE `memoryOnlyFileScopeObservation20261006`에 별도 기록됐으며 repo/raw 수정과 혼동하지 않는다. 이후 메모리 결과는 응답본문/stdin만으로 제한한다.

root 읽기 전용 semantic 검수: SKILL38/QA33/BOSS20 합계91검사 PASS. SKILL/BOSS는 복제 fixture이며 실제 런타임 import0, QA는 실제 core/layout/nav 실행과 editor/actor source 검사 혼합이다. SKILL의 Ctrl+P/Q/F키/E paused/탭정리 분기가 현행과 다르므로 전체 입력 교체는 미채택. BOSS gate fixture는 호출 전제조건 가드와 실제 보상/부활 수명 검증을 대신하지 않는다. QA는 top-level CLI/process.exit 때문에 production import 금지. blackBean magic/Q 유도반사·본편6단계/시각/청취 인수는 미실시다. ANIMVFX screen projection/world transform 불일치·ground nav 분포와 STORY의4 POI 보행면 밖 문제는 별도 consumer 수정 대상이다. **VISUAL VERDICT: RETOUCH** 유지.

root ENEMY 읽기 전용 검수8/8 PASS·원문 SHA 전후 동일. 실제 브라우저 VM 모듈 평가에서 `process is not defined` 재현; OLD/NEW 고정배치 자기참조 검사와 현행 앵글러/시작 육괴 좌표가 다르고, 설명의 4킬+80%는 현행 각 지역 처치율·지역 문지기/앵글러·_fbDone 안전망과 다르다. 신규18 배치 polygon 내부 검사는 실제 `isW/canMv`·LOS/적 반경·지역 total/kills·중복 스폰/재도전 검증을 대신하지 않는다. 직접 import/배치채택0 유지.


## 14. root 틈 분위기 consumer 완료 — 2026-10-06 KST

공식 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**. §12/13의 미소비 ANIMVFX 원자료를 SHA 불변으로 보존하고, `tools/map-scene-rift-ambience.mjs`의 world/nav/mask adapter를 통해 독립 씬 에디터에만 연결했다. screen projection 이중 transform을 제거하고 ground22안을 nav centre로 고정·clip, 전사 주변 제외영역과 reduced-motion/checkbox·PNG 제외를 구현했다. `.mjs` MIME을 수정하여 실제 browser import/움직임/끄기 검수 완료. [정확 코드 계약·수치·검사](MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [§23 최신 제작 보고](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결)를 따른다.

최초 Claude raw8/8는 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존 완료. 이번 code6은 root 소비자 구현이며 후보8의 생산 전체 채택이 아니다. ART 크기/clean plate, STORY 접근 불가4POI, SKILL/BOSS/QA/ENEMY의 실제 runtime 의미검수·소비자는 후속. 본편 game.html·scene/nav/core/actor/원자료8 변경0. 검사 core29/adapter10/static18, animated browser9그룹/UI15그룹 PASS·8카메라 root 시각확인. **VISUAL VERDICT: RETOUCH**; 실제6단계·청취/A급 인수0. 자동화 일시중지·유일오더·관리3/전문15=18·새팀/세션0 유지, Codex7 새 제작착수 미확인.


## 15. ROOT 틈 대화 시험 완료 / 오늘 저녁 보고 — 2026-10-06 KST

**ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**: STORY 원자료를보존한 helper와 실제editorUI로 네NPC 접근/선택/재방문을 연결했다. [정확contract·limits·logical/visual앵커·preview범위](MAP_SCENE_EDITOR_20261005.md#10-2026-10-06--지옥의-틈-망자-대화-시험), [MAP PRODUCTION REPORT](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--네-망자에게-실제-접근하는-대화-시험) 참조. 대화15·Chrome실제12그룹/4보행·원본UI15·core29·안개10 PASS, source/nav1192·PNG·실제저장 불변. 선물/퀘스트등록/가방실패/장gate/본편native6단계·청취/A급인수0. **VISUAL RETOUCH**.

latest 사용자 “작업을해서 저녁까지 보고해”에 따라 오늘2026-10-06 KST19:00보고까지 승인제작을이어간다. 기존4자동화 PAUSED/전문팀추가0, 오늘만exoduser-2 1시간간격 heartbeat ACTIVE, 변화없는보고0/19시한번보고뒤PAUSED. 기존1분루프/아침메일·음성발송을재개하지않는다. 동시4슬롯 root+재사용worker/읽기검수로이번slice를완료했으며16팀동시가동으로계산0. code6+docs11 완료소유만 checkpoint, 80부터보존/100전새산출중단, liveSTATE/LOG·타인WIP·세이브·기존23무변.


## 2026-10-06 — Claude8 완료 후보6 보존 (생산 미채택)

공식 보존ID **ROOT-CLAUDE8-RAW6-PRESERVATION-20261006**. 실제 NUL Changes83 경계에서 전체 후보 상세검수 완료를 기다리지 않고 현재TASK 성공source·공식end와 정확 byte/SHA가 확인된 완료 소유6만 보존한다. 원총괄 발 기준 도구 code4 WIP와 미완료 MAP/QA 후보는 포함하지 않는다. 이전 원자료와 0123/0124 결과는 불변이다.

| 역할 | 공식 완료ID | 경로 | bytes | SHA256 |
|---|---|---|---:|---|
| ART | ART-RIFT-LAYER-SPLIT-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/ART/rift-layer-split.candidate.mjs` | 10972 | `8527ced270fa98bb74ba4e09bdefd7f7049a5e7dfd0b3ef05b59046837c7c8aa` |
| SKILL | SKILL-CH1-A-RETRY-INPUT-RESET-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/SKILL/retry-input-reset.candidate.mjs` | 9007 | `cb5aa6dfadc0da00206fe47c243ecd01516f83df6a9839fcc3e29d9a9ffc520f` |
| ENEMY | ENEMY-CH1A-AUTHORED-SPAWN-BUDGET-NEUTRAL-20261006 | `tools/team-followup-20261006/hell-rift/ENEMY/ch1-authored-spawn-budget.candidate.mjs` | 14313 | `f32c1a26980d8cf8e665e266f5fb4c18a353e56701ba1655b7ed1962749b1259` |
| ANIMVFX | ANIMVFX-CH1-RIFT-RENDER-LIFECYCLE-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/ANIMVFX/rift-render-lifecycle.candidate.mjs` | 5227 | `eb5dfd644442e98c1ee0110b4a08d199116b09c3397519306d80789b44d64c2a` |
| BOSS | BOSS-REVIVE-KILLTAIL-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/BOSS/boss-revive-kill-tail.candidate.mjs` | 10031 | `de0a34125103250335bab0560e2367ebf2bf87b3169cfdf003963a15d0c9de35` |
| STORY | STORY-CH1A-RIFT-PERSISTENT-ACTIONS-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs` | 13188 | `f9adbea088d9deeddf7beb6f7f652788c86e04a87b465274dfc8c4f8af463691` |

6파일 node --check PASS는 구문 확인이며 실제 코드 소비자 채택·본편/native6단계·청취·A급완료를 의미하지 않는다. ART alpha/인물 extents는 추정·traceNeeded, clean plate fill=null/HELD_PENDING_IMAGEGEN_APPROVAL로 독립 픽셀 미완료. STORY 실제 ITEM/QUESTNPC port·지급+commit 원자성 미연결, BOSS 최종지급 의도/arming~resolve는 상세 검토 후 root만 적용한다. 자동 게임/app/save/build 접속0. code6+관련 docs3 정확 경로만 checkpoint하며 원격 exact SHA는 외부 receipt에 확인한다.

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/claude8-raw6-preservation-20261006/receipt.json`. 소비자 채택은 별도 완료ID로 기록한다.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.

## 16. 현재 제작 기획서 — 1-1·지옥의 틈·맵 스튜디오

이 절은 현재 제작 목적·납품 규격이다. 사용자 요청의 16은 전문15와 통합root1의 기존 제작 역할을 가리킨다. 관리3/전문15 구조를 늘리지 않는다. 아래 목표를 실제 후보 소유와 소비자 검수에 연결하며, 계획·raw 제출·fixture PASS·게임 인수를 따로 기록한다.

### 플레이와 공간의 목적

주인공은 지옥 최하층에서 위로 탈출한다. 1-1 썩은숲의 전투·획득이 장비/스킬의 다음 선택으로 이어지고, 보스 개방→사망·부활→재도전이 같은 후보에서 완결되어야 한다. 장과 스테이지 사이의 지옥의 틈은 기묘한 이공간에 멈춘 망자들이 머무는 장소다. 동일 천막을 반복하는 캠프나 평범한 마을 건물로 구성하지 않는다. 큰 비대칭 절벽/계곡·심연·위로 향한 길, 주민이 흩어진 머무름 자리, 플레이어를 감싸는 앞뒤 층으로 공간을 읽힌다.

하란의 안내, 베린의 유품 선택, 네사의 린을 찾는 부탁, 도릭의 상승 준비가 다음 도전의 이유를 만든다. 주민은 괴물로 확정된 존재가 아니라 아직 변질 중이거나 다시 올라갈 준비를 하는 망자다. 오래 멈추면 썩는 설정은 서사이며 새 실시간 부패 타이머/경제 패널티/DLC 약속을 추가하지 않는다. 장1 이후 벌레굴로 이어지는 방향은 유지한다.

### 납품 단위와 소비자 계약

| 단위 | 제작 목표 | 현재 실제 구현 | 미완료 인수 |
|---|---|---|---|
| 1-1 | 8공간의 큰 질량/연결/접지/랜드마크를 기존 LOCK 안에서 다르게 구성 | 기존 geometry/bake/gate를 보존하는 후보 검수 | 최신 동일후보 실제 전투·획득·개방·보스사망/부활·재도전·청취 |
| 틈 배경 | 승인 계곡 원화의 심연/바닥/절벽/전경 분리 | 원본 후보 보존. 새 인물 없는 plate1254²의6crop+전경3·기존심연1과 독립4body/발접지그림자를 editor consumer에서 구현 | 전체 절벽 alpha/고해상도 재질·높이 모델·본편 gate |
| 주민 | 각 발이 실제 바닥에 있고 전사80world px와 의도된 원근비례 | 독립alpha crop4·standing80/앉은비례·pivot(.5,1), 유효크기/현재foot 편집 대화, 정적nav clip접지그림자, 독립 주민별 보행차단 분리, 네 접근점 실제 키보행·22node/37option 시험 | 생성 파생 인물 재질·주민애니메이션, 유품 실제지급·퀘스트/save 원자성·본편 소비자 |
| 맵 스튜디오 | 이미지를 레이어로 놓고 크기·발·가림·길을 조절해 결과 저장 | PNG 등 일반 이미지·Unity 단일 Sprite PNG+.meta 가져오기/PPU·피벗 배치, crop/크기/회전/flip/pivot·발 찍기, 레이어잠금/정렬/시차, Undo/Redo·JSON/PNG·보행/경로검사·실제 모바일viewport | Unity 패키지/PSD/FBX 자동 읽기와 3D 지형/height 편집은 미구현. 기존 보유 이미지의 가져오기부터 사용 |
| Unity 에셋 활용 | 기존 자산 이미지/규격을 가져와 같은 월드 단위와 피벗으로 정렬 | 기존 PNG+동명.meta 단일Sprite의 spritePixelsToUnits·alignment/Custom pivot, fullcrop·data URI·원본불변·반복배치·Undo/JSON 왕복 구현검수 (§15) | Multiple/9slice/.unitypackage 자동추출/Prefab/3D모델·재질/shader 변환은 미구현. UI버튼 실물검수는 틈production 자산채택0 |
| 사운드 | 환경·접근·대화·선택·상승 cue의 전환/중복/stop 수명 | 기존 cue를 맡긴 담당의 후보/정본검수 | 실제 browser/native gesture/설정과 청취, pause/retry/장전환 lifecycle |

### 기존 팀별 실제 작업 소유

| 역할 / 송신담당 | 다음 실물 책임 | 납품·통합 경계 |
|---|---|---|
| MAP / Claude8 | 기존 후보의 절벽/심연/바닥/전경 transform·nav·4접근점과 source 핀 | rift-depth-layers.candidate.scene.json 공식 완료2로 보존. production 씬 직접 교체0, root 채택 후 실제8camera·보행 |
| ART / Claude8 | 기존 인물 참조·원본 보존·clean plate·player80 기준 크기/foot/alpha | root 파생 plate/atlas·현재 c508 후보와 대조. 픽셀 정확 추출로 표기0. 이전 camera POI/280px body/근사8각마스크는 보류, 동일 TASK 재송신0 |
| ANIMVFX / Claude8 | 절벽 앞뒤 정렬·안개/잔불의 장전환/pause/retry lifecycle | 현행 render lifecycle 후보 완료. root editor consumer에 필요한 순수adapter만 채택, 투사체/전투 가독 확인 전 PASS0 |
| STORY / Claude8 | 네 망자의 지속 action ID/반복방지/취소·재방문·상승 의미 | persistent-actions 후보 완료. dialogue 시험과 실제 inventory/quest/save 성공을 구분 |
| SKILL / Claude8 | 대화/설정/blur/retry에서 held/aim 오염 없이 입력 복귀 | retry-input-reset 후보 완료. Q-only와 기존 자원·수치 불변 |
| ENEMY / Claude8 | 1-1 authored 위협/동선 budget과 전투 가독 | authored-spawn-budget neutral 후보 완료. 실제 스폰/전투 적용 전 인수0, 동시공격 제한0 |
| BOSS / Claude8 | kill-tail/revive/gate의 실제 한 후보 재도전 | revive-kill-tail 후보 완료. 자동 fixture만으로 보스전 완료0 |
| QA / Claude8 | immutable pins·source와 consumer·8camera/보행/오디오 판정의 분리 | candidate-acceptance checker 공식 완료2로 보존. 원본 checker 실행은 root 단계, 자체 fixture를 인수로 계산0 |
| UIUX / Codex7 | 크기/발/레이어 편집 동작과 모바일·대화/HUD 초점/가림 | 기존 미송신1파일 범위만 정상 도구가 허용하면 전달. 실제 해상도·배율/Undo/닫기·복귀 검사 |
| QUESTNPC / Codex7 | 네 주민 접근점/대화 consumer와 본편 action bridge | 임의 접근 teleport/무료 gate0. 선물·부탁의 성공/취소/중복/재방문 계약 |
| ITEM / Codex7 | 유품/전투획득의 실제 inventory 원자성/용량/중복·save | 기존 아이템 수치 보존, 실제 지급 성공 후 action 소비. 새 경제/아이템 제작0 |
| SOUND / Codex7 | 기존 자산으로 환경/대화/선택·상승 cue와 중복 stop | 새 결제/음성 생성/발송0. 청취는 실제 증거 있어야 인수 |
| BALANCE / Codex7 | 기존 전투/보상/gate 비용과 재도전의 연결 | 정본수치 병목표·의미검수, 난이도/경제 임의변경0 |
| BUILD / Codex7 | scene/source asset path·decode·consumer pins·MIME/404 | 새 서버/대형 build/native 실행0, 누락·규격·로드 failure atomicity 후보 |
| MARKETING / Codex7 | 8camera 반복실루엣/빈바닥/랜드마크·캐릭터 원근 증거 | 품질표/캡처 근거만, 외부 게시·A급 완성 선언0 |
| ROOT / 원총괄 | 실제 editor consumer/원화 배경 분리·의미/화면검수·정본/Git | 완료 공식ID/pins→사전백업→최소코드→docs 전체검색·동기화→좁은commit/push/remote exactSHA |

후속은 이미 진행된 TASK를 반복하지 않고 현재 완료파일의 소비자 의존성을 넘긴다. 새7파일까지 Codex7의 기존 미송신 예산만 열고, Claude8 새파일 예산0. 실제 변경80이 되면 새파일 배정/추가산출0, 완료소유를 먼저 보존한다. root는 후보 상세검수 전체가 끝나기 전에도 완료 raw를 미채택으로 보존하여 공간을 확보한다.

### 품질·완료 GATE

| 단계 | 통과 조건 | 실패/보류 조건 |
|---|---|---|
| 큰 형태 | 8camera에서 방향·지역·랜드마크가 읽히고 남/북·좌/우가 반복 천막/나무로 보이지 않음 | 작은 데코 양/flip만으로 다양성 완료 선언 |
| 레이어·접지 | 각 source transform/alpha/foot와 ground/mask가 맞고 캐릭터 뒤·앞 순서가 자연스러움 | 그림 구멍/바닥이 전사 앞에 다시 그려짐, painterly/픽셀 크기 근거 없는 혼합 |
| 에디터 실사용 | 수동 발 찍기/크기/aspect·rotate·flip/레이어/Undo·모바일/저장·PNG 왕복 | 원본/source/nav나 사용자 save 오염·locked 편집·실행중 동시편집 |
| 주민 소비자 | 같은 맵에서 실제 걸어 접근하고 대화·취소·재방문, 성공한 실제 지급/quest만 지속 | editor-session-only trial을 실제보상·세이브 완료로 표기 |
| 게임 인수 | 같은후보에서 시작→전투/획득→보스개방→보스사망/부활→재도전과 실제 화면/청취 | 후보/MJS syntax/fixture/실행파일/보고서만으로 완료 |
| 보존·보고 | stage-owned code+관련docs·exact remoteSHA·실제 화면·실패도 보존 | broad stage/타인WIP 포함/근거없는 A급·음성·이메일 전송 |

맵 §23의 MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA/TECH/FILES/GIT/NEXT PASS 보고를 현재 결과별로 계속 적용한다. 현재 전체 **VISUAL VERDICT: RETOUCH**. 격리editor3387만 사용하므로 최신 본편/native/청취 GATE는 아직 미인수다. 오늘2026-10-06 한국시간19시에 실제 반영·화면/영상·검사·정확Git·남은 문제를 이 채팅으로 한 번 보고한다.

### 2026-10-06 — 현재 16제작 역할과 마지막 완료 후보2

최신 사용자 직접 요청: “16팀 일을시키라고 목적을 정했잖아 어제”, “기획서도 만들고”. 기존 전문15+root통합1=제작 역할16, 관리3+전문15=전체18을 유지한다. 정본 `CH1_1_A_GRADE_PRODUCTION_20261005.md` §16에 1-1/틈/에디터 목적·역할별 실제 납품·소비자/화면 GATE를 구체화했다. 새 팀/채팅/실행세션0, 두 오더담당 유일 송신. 기존 완료 TASK를 다시 보내지 않는다.

Claude8의 기존8 후보 라운드 중 앞선6은 019ba22d3315243a9f60a207672a222c64fef603로 원격 보존, 마지막 MAP/QA2는 아래 공식 end_turn과 bytes/SHA를 대조하여 후보 미채택 상태로 보존한다. 최초 MAP/QA WIP 관측은 이력이며 현재 공식 완료로 정정. QA의 이전22435B/4f51…도 당시 WIP 핀으로 최종 제출에 사용하지 않는다. JSON parse/MJS syntax만 검수했으며 실행·화면·본편 채택으로 계산0.

| 역할 | 공식 완료ID | 정확 경로 | bytes | SHA256 | end UUID / time UTC |
|---|---|---|---:|---|---|
| MAP | `MAP-RIFT-DEPTH-LAYERS-CANDIDATE-20261006` | `tools/team-followup-20261006/hell-rift/MAP/rift-depth-layers.candidate.scene.json` | 91496 | `4f8bafea53fb32faea7945ca9dd6174792697a8380810d04a4f63db935c1679d` | `0f74145a-3b74-4770-83ce-d1d2e528966c` / 2026-10-06T02:29:07.410Z |
| QA | `QA-CH1-RIFT-CANDIDATE-ACCEPTANCE-CHECKER-20261006` | `tools/team-followup-20261006/hell-rift/QA/rift-candidate-acceptance.candidate.mjs` | 24394 | `4ed578105be4925fb5dd8afccda82e47b5184bfe5e13f0b0570d084280b75f6f` | `1ac63ee2-f6fe-4d35-a0a1-14ce5175bb39` / 2026-10-06T02:31:02.015Z |

Codex7 기존7의 이전 송신은 자동 승인 검토 “승인 필요 / 정책 never”로 실제 전달0·착수0. 최신 직접 사람 메시지 확인을 통한 정상 도구의 허용 범위 진단을 해당 오더담당에게만 인계했으며 재거절 시 우회/권한 변경 없이 중단한다. 성공 증거가 오기 전 전팀 가동 선언0. root 발 기준 도구는 code4+docs12 commit 616b22265de6713f5fead9c37bfbc86103fc7db7, 원격 exact SHA 확인; core33/실제pointer13/UI15 PASS, 전체맵 VISUAL RETOUCH.

원화/STORY/scene/native/source/runtime/사용자세이브/기존23/보호2_3/Q전용/어택티켓 금지와 live 타인STATE/LOG·WIP는 무변. 실제 NUL/untracked 전체80부터 완료소유 즉시checkpoint/100전 새산출0. 외부 backup·pins·원격 SHA 영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/raw2-and-production-plan-20261006/receipt.json`. 오늘19시 실제 결과보고 후오늘자동화 pause, 기존paused/메일 재개0.

공식 통합기록 ID: `ROOT-CH1-RIFT-PRODUCTION-PLAN-RAW2-20261006`


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

제작16 역할·기획의 현재 구현/후속 경계는 위 표로 갱신한다. §16 틈 배경의 깨끗한 바닥/독립주민은 이 격리 후보에서 구현; 전체 전경/높이/본편 gate와 actual grant·장 저장은 계속 후속이다. 출발 준비·멈춤·유품·구조 부탁이 다음 도전의 선택으로 이어지는 목표는 유지한다.


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
