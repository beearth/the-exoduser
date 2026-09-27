> **2026-09-17 현행 리터치:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

> **2026-09-16 후속 실제 수정:** 사용자 추가 지시에 따라 bake/cache가 `20260916-ground-2`로 변경됐다. 흙길/공터와 이끼·낙엽을 구분하며 geometry/START/EXIT/배치/진행은 유지한다. [현재 지면 구성·전후 증거](CH1_1_GROUND_STRUCTURE_20260916.md). 아래 finish-3 및 ec7bf70d8 동일성 판정은 수정 전 검수 이력이다.

> **후속 검수 정정: VISUAL VERDICT: RETOUCH.** 아래 제작 당시 PASS 및 “필수 미완성 구간 없음” 판단은 철회한다. 게임/맵 ec7bf70d8은 보존했다. [실제 전후 화면·일반 플레이·위치별 결함 검수](CH1_1_FINAL_REVIEW_20260916.md)가 최신 판정이다. 기존 기술/QA 진행 이력은 그대로 유지하며 일반 클리어 증거로 확대하지 않는다.

# EXODUSER CH1-1 PRODUCTION FINISH — 2026-09-16

상태: **실제 1-1 전체 적용, 런타임 리터치, 입력 종주 및 기존 완료 조건/1-2 진입 확인 완료.**

시각 판정은 아래 카메라 검토에 근거한 제작자 판정이다. 일반 난이도 밸런스, 모든 실행 환경의 안정성, 사용자 최종 승인을 의미하지 않는다. 전투 종주의 상당 부분은 QA 피해 무효 상태였다. 무보정 클리어로 보고하지 않는다.

## 1. 실제 적용한 내용

### 대상 및 연결

| 항목 | 실제 계약 |
|---|---|
| 대상 | `STAGES[0]={id:0,hell:0,floor:1,mw:200,mh:200,type:'field',face:true}` |
| 게임 표시 | `제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST` |
| 배치 | `_MAP_COMPOSE[0].handProps` 직접 배열 |
| 혼동 제외 | `_CH1S1` → `_MAP_COMPOSE[1]`은 CH1-2이며 변경하지 않음 |
| 진입 | 기존 `genFromTemplate`, `_cloneField11(0)`, `_buildCh1StartForestRLE`, `CH1_1_PRODUCTION.buildRLE(200,200)` 연결 |
| 기본 배경 | `assets/map/ch1/production_finish/chunk_x_y.png?v=20260916-finish-3` |
| 규모 | 200×200타일, T40, 월드8000² 유지 |
| START | `(100.5,185.5)` 유지 |
| 북쪽 | gate x99..101/y5, exit x99..101/y7, 접근 바닥 x88..112/y2..35 유지 |
| 주 랜드마크 | `m_c1tree` authored102,90 / runtime102.5,90.5, sz1450, colW380/colH230, keepAR 유지 |
| 단구 | 중심147,98, rx18/ry9, inner .84/outer1.04, 서측 ramp x125..135/y98, 폭1.8→3 유지 |
| 배치 개수 | authored62, runtime63(시스템 gate1), hand 충돌21+시스템1=22 |
| 자동 중복 | `hand:1,dense:1,lm:[],mega:[]`; 자동 큰 장식/바닥 carpet 차단. 실제 scatter/decorList0 |
| 남측 성문 | 기존9월12일 철창 제거 상태 유지. 숲 어깨와 진입 흔적으로 문턱을 구성했으며 성문 재설치를 했다고 주장하지 않음 |

남쪽 문턱에서 첫 공터로 벌어지고, 서쪽 숲이 안으로 돌출되는 뿌리 숲길을 지나 시체나무 분지로 이어진다. 나무 양쪽 우회로, 야영지, 단구, 북쪽 고치와 물가를 비대칭 외곽에 연결했다. 북쪽은 기존 출구 축으로 수렴한다. 8개 구역은 역할 데이터이며 별도 사각형 방/로딩 단위가 아니다.

53개 경계점의 고정 polygon이 지형 기준이다. 충돌은 타일 RLE/기존 줄기 충돌을 사용하고, 그림의 경계에는 부드러운 접합을 둔다. 잎·가지 이미지 사각형을 벽으로 추가하지 않는다. 기존 flowfield/스폰/플레이어의 맵 충돌 경로를 유지한다.

### 배경 및 리터치

| 항목 | 최종 값/처리 |
|---|---|
| layout / bake version | `20260916-finish-1` / `20260916-finish-3` |
| 마스터 | 8192², SVG viewBox 0 0 200 200, bake40.96px/타일 |
| 청크 | 8×8=64, source core1024, bleed1 포함1026² |
| 월드 대응 | source1024→world1000, 전체8192→8000. 빌더와 렌더러를 함께 정규화 |
| 배경 x scale | production1, 과거 outer .965 유지 |
| 가시범위 | 배경 요청/표시 camera zoom 최소 .3 반영. props zoom 보정은 stage0 배경 활성 때만 |
| 합성 | 지면23+외곽22+연결11=고정56레이어. 아래 전수표 |
| 소스 | 기존 CH1 원화10종+ground_dark_soil.png. 타 게임 추출 아트 없음 |
| 확대/방향 | 최대1.3, 구조물 회전0/반전0, 랜덤 배치/시드 없음 |
| 바탕 | soil 원본1024², brightness .55/saturation .58 |
| 뒤쪽 경관 | soil brightness .24/saturation .35/tint #273326 |
| mask | polygon stroke1.8타일, mask blur18 bake px. 충돌 polygon 자체는 blur하지 않음 |
| 저주파 재질 | 길/공터/습지/뿌리 색 면만512² 합성, Gaussian1.3타일; 원화 RGB blur0 |
| 지면 접합 | 가장자리24%, 타원 가장자리38% smoothstep alpha, 배치 opacity×.7 |
| 숲 접합 | 가장자리9.5% alpha feather, 원화 RGB 선명도 유지 |
| 성능 구조 | 기존 비동기 decode/warm 캐시 사용. 합성/지형 제작은 빌드 시 수행 |

첫 적용 화면에서 지면 원본 패치가 읽혀 alpha 접합을 다시 제작했다. 전체 조망에서 청크와 props의 zoom 가시범위를 맞추고, 최종200타일 bake 좌표를 명시적으로 통일했다. 이후 기본 카메라9곳을 다시 촬영하고 최종 배경으로 입력 종주를 재실행했다.

### 위치 보정

| 대상 | 이전 authored | 최종 authored | 이유 |
|---|---|---|---|
| m_ctree1, scale .85 | 80,184 | 84,184 | 남측 숲 어깨 접지 |
| m_ctree3, scale .95 | 24,96 | 30,96 | 서측 외곽 접합 |
| m_fbones | 78,182 | 82,180 | 진입 경계 안에 정착 |
| m_vine_pillar | 29,158 | 34,156 | 서남 통로 연결 |
| m_c1sroot | 173,151 | 171,150 | 동남 접합 |
| stage0 spawnHole | 70,170 | 74,168 | 큰 적의 줄기/경계 여유. 종류/개수 유지 |

### Dimraeth 적용 범위

기존 `DIMRAETH_MAP_RESEARCH_20260916.md`, 근거 이미지, 참고 커밋4539c6fbd를 확인했다. 관찰 근거는 이동 바닥/외곽 경관의 역할 분리, 반복 재료의 연결, 장소별 지면 변화다. 이를 고정 polygon·연결 지면·역할 구역으로 옮긴 것은 **EXODUSER 제작을 위한 추론/설계**다. 바닥 재사용만으로 원작 자동 생성 구조를 단정하지 않는다. 이번 결과는 고정1-1이며 범용 절차 생성기가 아니다. 참고 커밋으로 되돌리지 않았다.

## 2. 실제 실행하여 확인한 내용

| 실행 | 결과 | 제한 |
|---|---|---|
| 본편 stage0 진입 | game.html에서 실제1-1 표시, production 로드 | QA test 슬롯 |
| 첫 전투 | Lv1 시작 장비로 피해 무효 적용 전29처치 | 전체 무보정 난이도 검증 아님 |
| 필드 이동/전투 | 실제 키·마우스 입력으로 남측→전투터→양측 주요 전투 지점→북측 이동, 추격/공격/기존 bladeDash 회피 확인 | 이후 피해 무효 P.iframes 사용 |
| 진행 조건 | 네 방면 대상 실제 처치, `_fbDone=true`, `_bossUnlocked=true`, 기존 북쪽 진입으로 보스 전환 | 몬스터 HP/처치 수/게이트/공격력 강제 설정 없음 |
| 보스/출구 | 실제 공격으로 기존 shield/HP/부활 처리. 한 번 사망 후 기존 재도전 사용. arena exit64,2로 실제 걸어 들어가 stageCleared=true | arena에서 피해 무효 재설정 |
| 다음 구간 | 기존 다음 버튼→여정(±0레벨)→G.stage1, stage0 배경 비활성 | CH1-2 전체 전투는 미검증 |
| 최종 배경 재종주 | START100.5,185.5→첫공터→서쪽 야영지→나무 양쪽→단구 ramp 왕복→북쪽101.36975,7.71085, 실제 입력만 사용 | mapqa/Lv500/적 비활성, 이동 전용. 이 실행으로 출구 해제를 주장하지 않음 |

종주 중 텔레포트/좌표 강제 변경은 사용하지 않았다. 비교 사진·전체 조망·성능 측정의 위치/카메라 설정은 **정지 관찰용**이며 종주 실적으로 합산하지 않는다. 전투 기록에는 기존 QA 재화가 있었고 스킬 일괄 UI를 열었으나 레벨 잠금으로 강화되지 않았다. 일반 밸런스 실험과 구별한다.

최종 이동 영상은 실제 게임 canvas의 captureStream 연속 녹화다. 연결 복구로 입력 로그 일부가 누락된 동안에도 녹화는 계속됐다. 이전 전투 영상은 실제 캡처 프레임과 원래 타임스탬프를 사용하여 입력 대기/캡처 공백이 있다. 합성 플레이 장면은 없다.

## 3. 기술 검증 결과

| 검사 | 결과/범위 |
|---|---|
| 회귀 | 최종54/54 PASS, 실패0: production5+기존CH1 21+CH3 28 |
| geometry hash | `719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c`; RLE/bake 일치 |
| 청크 | 64개1026², 대표 수평/수직6이음새 bleed 픽셀 일치 |
| 실제 canMv r15 | 연결19242셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r40 | 연결17808셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r120 | 연결15126셀, 목표12/12, 스폰14/14. 경계 촬영점39,112는 대형 적 경로에서 제외 |
| 배치 | authored62 모두 정확한 +.5타일 runtime 좌표, 강제 재배치0, runtime63/scatter0 |
| 타 스테이지 | stage0 제외 STAGES/compose와 cloneField11(1) 전후 JSON 동일. CH3 28검사 통과 |
| 배경 | 전체 조망64청크 표시/오류0. 기본9카메라 visible 청크 모두 표시 |
| pageerror/404 | 수집609이벤트 중 관찰0. 초기 로그 유실(truncated:true)로 실행 전체0건 보증은 **미검증** |
| 기타 | 탐색 중 취소 Media net::ERR_ABORTED1건. 신규 이미지404로 분류하지 않음 |

```powershell
& 'C:\nvm4w\nodejs\node.exe' --test test/ch1ProductionFinish.test.js test/ch1StartOuterMass.test.js test/ch1StartSmoothingPass.test.js test/ch3HellWinterLayout.test.js
& 'C:\nvm4w\nodejs\node.exe' tools/verify_ch1_production_finish.mjs
```

### 성능

1920×1080 논리 카메라/DPR1.75, 위치100,151/zoom1, high·torch·fog·postfx 유지/FPS제한0, 적 없는 정지 관찰, 약5초씩 측정. 변경 전은 백업한 실제 게임을 같은 서버에서 실행했다. 작은 FPS 차이를 최적화 성과로 단정하지 않는다.

| 항목 | 변경 전 | 최종 bake finish-3 |
|---|---:|---:|
| 평균 FPS | 235.84 | 239.30 |
| 프레임 P50 | 4.2ms | 4.2ms |
| 프레임 P95 | 4.4ms | 4.4ms |
| 프레임 P99 | 8.3ms | 4.5ms |
| 시간 | 5003.4ms | 5002.1ms |

최종 CPU 분해/전투 동일 부하/저사양 GPU/NW.js는 미측정. after/performance.json의 CPU 값은 bake 정규화 전 측정으로 최종 CPU 결과가 아니다. 최종값은 after/performance-final.json이다.

## 4. 시각 검증 및 남은 한계

기본 플레이 카메라9곳과 실제 이동을 확인했다. 미니맵/축소 이미지로 판정을 대신하지 않았다.

| 지점 | 좌표 | 확인 |
|---|---|---|
| 남측 | 100.5,185.5 | 숲 어깨/흙 진입선/이동 여유 |
| 첫공터 | 100,151 | 바닥 패치 완화/열린 전투 공간 |
| 숲길 | 82,122 | 서쪽 뿌리 돌출/폭 변화/지면 연결 |
| 나무 | 102,101 | 뿌리·부식토 접합/양쪽 실제 우회 |
| 서측 경계 | 39,112 | 경관/근경 뿌리/보행 바닥 연결 |
| 북쪽 출구 접근 | 100,22 | 지면과 숲 연결/성문 반복 없음 |
| 야영지 | 45,109 | 장소와 전투 여백/남쪽 뿌리 경계 |
| 단구 | 137,112 | 기존 높이/ramp 유지/실제 왕복 |
| 물가 | 157,54 | 젖은 지면/기존 웅덩이의 장소 차이 |

남은 시각적 한계:

- 전체 조망에는 원화의 얼굴/뿌리 모티프 재사용이 보인다. 기본 카메라에서는 경계·겹침이 달라 동일 간격 울타리로 이어지지는 않지만 원화 다양성에는 한계가 있다.
- 나무 바로 밑은 이미지가 바닥을 많이 덮는다. 캐릭터/적은 기존 렌더 순서상 구조물 이후 표시된다. 나무 전체를 벽으로 만들지 않았고 양쪽 우회를 확인했다.
- 동쪽 단구는 기존 타원형 높이 음영이 읽힌다. 잠긴 단구/ramp 계약을 유지했으며 높이 시스템을 개편하지 않았다.
- 피해 무효로 적을 오래 모으면 기존 전투 효과가 많이 겹친다. 모든 적 밀도에서 위험 지면 식별이 완벽하다는 판정은 하지 않는다.
- 기존 암녹색 조명을 유지해 외곽 세부는 어둡다. 전체 조명으로 이음새를 숨기는 변경은 하지 않았다.

**VISUAL VERDICT: RETOUCH — 후속 원본 비교 검수에서 판정 정정.** 위 잔여 한계와 미검증 환경을 포함한 전면적 품질 보증은 아니다.

## 5. 미검증 항목과 제한

| 항목 | 상태/사유 |
|---|---|
| 무보정 전체 난이도 | 미검증. 긴 진행/충돌 QA에 피해 무효 사용 |
| 모든 초기 오류 로그 | 미검증. 브라우저 이벤트 일부 유실; 관찰0과 전체0 구별 |
| 모든 적/반경/AI 조합 | 미검증. 실제 전투와 r15/40/120가 전 조합 증명은 아님 |
| 패링 | 별도 검증 안 함. 이동/공격/dash와 구별 |
| 모든 해상도/하드웨어/NW.js | 미검증. 로컬 브라우저 기본 카메라 중심 |
| 연속 전투 원본 | 일부 영상은 실제 정지 프레임 샘플링. 고프레임 연속 전투 영상 아님 |
| 최종 이동 영상 | 연속252.601초, canvas만 녹화(HTML HUD/오디오 제외), 적 없는 이동 QA |

필요한 파일/서버는 사용 가능했고 구현을 막는 실행 환경 차단은 없었다. 미검증 항목을 PASS로 대체하지 않는다.

## 6. 산출물과 변경 파일

증거 루트: `captures/ch1_1_production_finish_20260916/` (로컬, 저장소 ignore 대상).

| 산출물 | 경로/성격 |
|---|---|
| 전체 배치 | runtime-full-layout.jpg + .json: 실제 renderer, zoom.3,64청크/63props. 전체 조망만 torch=false |
| 변경 전 | before_full/01_start.png부터6장: 백업 실제 게임, 동일 위치/기본 카메라 |
| 변경 후 | after/01_start.png부터9장+manifest.json: 최종finish-3 |
| 비교 | comparison/01_start.jpg … 06_north_exit.jpg: 실제 전후 화면 나란히 배치 |
| 필드/전투 | START_EXIT_COMBAT_QA.mp4, route-session.json, video-metadata.json |
| 완료/다음 구간 | BOSS_CLEAR_NEXT_STAGE_QA.mp4, boss-finish-session.json, completion.json, stage-clear.jpg, next-stage-1-2.jpg |
| 최종 입력 종주 | FINAL_MAP_INPUT_WALK.mp4/.webm, final-walk-session.json, final-walk-video.json |
| 기술 | runtime-collision-audit.json, technical-verification.json, runtime-issues.json, other-stages-before/after.json |
| 성능 | before_full/performance.json, after/performance-final.json |
| 백업 | tmp/ch1_1_production_finish_20260916/backup/game.html |

composition-preview.jpg는 오프라인 bake 미리보기다. 초기 before/는 잘린 구버전이므로 before_full/만 비교에 사용한다. runtime-full-layout.png는 전송 중 손상되어 증거에서 제외하며 유효 JPEG로 대체한다.

| 변경 파일 | 범위 |
|---|---|
| game.html | stage0 배경/geometry, 월드 변환/zoom,5prop/1spawn 보정 |
| assets/map/ch1/production_finish/layout.js | 고정 경계/8구역/RLE |
| 같은 폴더 master/chunk64/composition.json/preview | 스테이지 배경/재현 가능한 배치 |
| tools/build_ch1_production_finish.mjs | 고정 원화 합성/bake |
| tools/verify_ch1_production_finish.mjs | 충돌 snapshot/청크/배치 기술 검사 |
| tools/package_ch1_production_evidence.mjs | 실제 캡처 영상/비교 패키징 |
| test/ch1ProductionFinish.test.js | 경계/연결/격리/월드크기/가시범위5검사 |
| test/ch1StartOuterMass.test.js, ch1StartSmoothingPass.test.js | 기본 경로 기대값 현행화 |
| 관련 맵 문서11개, 본 보고서, CHANGELOG_SYNC.md | 현행 계약과 과거 기록 구별 |

docs 전체 관련 키워드 검색 기록: tmp/ch1_1_production_finish_20260916/docs-*-audit.txt. 보호 문서 `2_3 돌진+패링+방패시스템`은 수정하지 않았다.

작업 중 외부 자동 체크포인트59a89ebdb에 초기 구현 일부가 포함됐다. 이를 되돌리지 않고 현행 트리에서 마무리한다. 후속 커밋은 이번 맵의 남은 변경만 선택한다. 다른 작업의 guard baseline/userdata/Steam 변경은 포함하지 않는다. **이 작업에서 push/배포/Steam 업로드를 수행하지 않았다.**

## 7. MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0 / 썩은숲1구역
MASTER
- silhouette: 남→북, 좌우 비대칭53점
- regions: 남측/첫공터/뿌리길/야영지/나무분지/단구/북측갈림/출구
- main route: START→첫공터→숲길→나무양옆→북측→EXIT
- side spaces: 서남 뿌리길/야영지/단구/고치/물가
OUTER MASS
- LEFT: 안으로 들어오는 뿌리 어깨와 야영지
- RIGHT: 단구/두 물가에 맞춘 굴곡
- TOP: 기존 북쪽25타일 접근축
- SOUTH: START를 감싸는 숲 문턱
- major holes: 검토 카메라에서 미완성 외곽 없음
LARGE
- source assets: 자체CH1 숲5종/지면5종/soil
- composites: 고정56레이어/64청크
- overlap: alpha접합/RGB선명도 유지
- repeated silhouette: 기본 화면 반복 완화, 조망의 원화 모티프 재사용 남음
MEDIUM
- connections: 명명된 어깨11곳/길·뿌리·습지 전이
- remaining holes: 관찰 구간 없음
GROUND
- shadow: 기존 조명/원화 방향 유지
- contamination: 나무 부식토/물가 습지/진입 흙
- structure integration: 나무/야영지/단구/물가 연결
PLAYABLE
- main arenas: 첫공터/나무양쪽/북측갈림
- travel space: 폭 변화가 있는 중앙/서측 연결
- breathing space: 중앙 작은scatter 없음
- threat space: 기존 적/스폰/게이트 규칙
- combat readability: 실제 추격/이동/회피 확인, 과밀효과 한계 기록
LANDMARK
- primary: 거대 시체나무
- secondary: 야영지/단구/고치/물가
- tertiary: 기존 뼈/뿌리/잔해
CAMERA QA
- START: 01_start/실제 입력 시작
- EARLY: 02_first_clearing/첫전투
- ARENA: 첫공터/나무양쪽
- SIDE L: 05_west_boundary/07_west_camp
- SIDE R: 08_east_terrace/ramp 실제왕복
- LANDMARK: 04_corpse_tree/양쪽우회
- LATE: 09_north_pool/북측이동
- EXIT: 06_north_exit/필드gate/보스완료/실제exit/1-2
TECH QA
- route: 입력 종주와 별도canMv BFS
- collision: r15/40/120,14스폰,authored좌표 유지
- pageerror: 관찰0/초기전체로그 미검증
- 404: 관찰0/초기전체로그 미검증
- seam: 대표6bleed 픽셀일치/기본카메라검토
- loading: 조망64/64표시/오류0
- performance: 정지P95 4.4→4.4ms, 전투/저사양 미측정
FILES
- stage-owned: production_finish/보고서/전용tools·test
- concurrent touched: game.html/CHANGELOG의 이번 변경만 분리
- unrelated touched: 이번작업 없음, 기존dirty 보존
GIT
- staged: 이번 맵 마무리만 선택
- commit: 최종응답의 로컬커밋 참조, 초기일부는 외부체크포인트 포함
- push: 수행안함
- deploy: 수행안함
VISUAL VERDICT: RETOUCH (후속 검수 정정; CH1_1_FINAL_REVIEW_20260916.md 참조)
NEXT PASS: 장소 구분·나무 접지·외곽 반복·단구 접합의 국소 보완 필요. 일반 완주/저사양/손실 없는 전체로그 미검증.
```

## 8. 고정 데이터 전수표

최종 composition.json/layout.js 전사값이다. 레이어 개수는 품질 목표가 아니라 재현용 기록이다.

### 역할 구역

| id | 이름 | anchor | 역할 | 지면 | 연결 |
|---|---|---|---|---|---|
| south_entry | 잠식된 진입로 | 100,185 | arrival | worn-earth | 좁은 남측 문턱에서 첫 공터로 벌어짐 |
| first_clearing | 쓰러진 숲의 공터 | 100,151 | combat | dry-soil | 서쪽 뿌리 통로와 동쪽 웅덩이가 비대칭으로 열림 |
| root_bend | 뿌리 어깨 숲길 | 83,125 | travel | leaves-earth | 서쪽 숲이 안으로 돌출되고 야영지로 길이 갈라짐 |
| west_camp | 버려진 야영지 | 45,100 | side-combat | trampled-earth | 낮고 긴 뿌리 경계와 중앙 공터 연결 |
| corpse_basin | 시체나무 분지 | 102,90 | primary-landmark | root-humus | 줄기 양쪽 우회와 넓은 전투 여백 |
| east_terrace | 부패한 제단 단구 | 147,97 | optional-high-ground | wet-earth | 기존 서측 경사로 유지 |
| north_fork | 고치 숲과 썩은 물가 | 100,52 | late-combat | damp-leaf | 서쪽 고치와 동쪽 습지 사이에서 북쪽 통로로 수렴 |
| north_exit | 숲의 마지막 문턱 | 100,22 | exit-approach | exposed-soil | 기존 gate y5 / exit y7 접근 |

### 경계점 — 순서대로 연결

| 순번 | x | y |
|---|---:|---:|
| 1 | 88 | 2 |
| 2 | 88 | 18 |
| 3 | 74 | 29 |
| 4 | 58 | 34 |
| 5 | 37 | 33 |
| 6 | 29 | 44 |
| 7 | 31 | 59 |
| 8 | 40 | 66 |
| 9 | 52 | 70 |
| 10 | 53 | 77 |
| 11 | 40 | 80 |
| 12 | 26 | 91 |
| 13 | 28 | 107 |
| 14 | 40 | 114 |
| 15 | 53 | 118 |
| 16 | 62 | 126 |
| 17 | 58 | 137 |
| 18 | 40 | 140 |
| 19 | 28 | 147 |
| 20 | 30 | 157 |
| 21 | 43 | 163 |
| 22 | 58 | 167 |
| 23 | 72 | 174 |
| 24 | 81 | 183 |
| 25 | 85 | 192 |
| 26 | 96 | 197 |
| 27 | 109 | 197 |
| 28 | 120 | 190 |
| 29 | 125 | 181 |
| 30 | 137 | 168 |
| 31 | 151 | 161 |
| 32 | 169 | 156 |
| 33 | 179 | 143 |
| 34 | 178 | 134 |
| 35 | 161 | 128 |
| 36 | 143 | 127 |
| 37 | 134 | 121 |
| 38 | 139 | 113 |
| 39 | 160 | 110 |
| 40 | 175 | 105 |
| 41 | 180 | 93 |
| 42 | 172 | 84 |
| 43 | 151 | 79 |
| 44 | 145 | 72 |
| 45 | 154 | 63 |
| 46 | 174 | 59 |
| 47 | 181 | 48 |
| 48 | 177 | 35 |
| 49 | 162 | 30 |
| 50 | 142 | 33 |
| 51 | 126 | 28 |
| 52 | 113 | 18 |
| 53 | 112 | 2 |

### Bake 배치 — 경로 기준 assets/map/ch1/

opacity는 alpha feather/지면×.7 적용 전 값이다. runtime props와 다른 정적 합성 레이어다.

| 번호/층 | 파일 | x | y | scale | opacity | brightness | saturation |
|---|---|---:|---:|---:|---:|---:|---:|
| 1/GROUND | floor_objects/prop_g_battle.png | 100 | 185 | 0.95 | 0.54 | 0.78 | 0.45 |
| 2/GROUND | floor_objects/prop_g_battle.png | 97 | 171 | 1.2 | 0.58 | 0.8 | 0.4 |
| 3/GROUND | floor_objects/prop_g_battle.png | 91 | 153 | 1.3 | 0.65 | 0.8 | 0.4 |
| 4/GROUND | floor_objects/prop_g_battle.png | 112 | 154 | 1.1 | 0.55 | 0.76 | 0.42 |
| 5/GROUND | floor_objects/prop_g_edge.png | 71 | 159 | 1.2 | 0.58 | 0.66 | 0.5 |
| 6/GROUND | floor_objects/prop_g_edge.png | 131 | 163 | 1.1 | 0.5 | 0.62 | 0.5 |
| 7/GROUND | floor_objects/prop_g_root.png | 69 | 131 | 1.1 | 0.52 | 0.62 | 0.38 |
| 8/GROUND | floor_objects/prop_g_battle.png | 90 | 125 | 1.15 | 0.5 | 0.72 | 0.4 |
| 9/GROUND | floor_objects/prop_g_battle.png | 53 | 107 | 1.12 | 0.6 | 0.76 | 0.4 |
| 10/GROUND | floor_objects/prop_g_edge.png | 36 | 117 | 1 | 0.56 | 0.63 | 0.43 |
| 11/GROUND | floor_objects/prop_g_root.png | 88 | 102 | 1.2 | 0.66 | 0.64 | 0.38 |
| 12/GROUND | floor_objects/prop_g_root.png | 113 | 99 | 1.14 | 0.63 | 0.65 | 0.38 |
| 13/GROUND | floor_objects/prop_g_corpse.png | 103 | 79 | 1.15 | 0.44 | 0.65 | 0.4 |
| 14/GROUND | floor_objects/prop_g_battle.png | 81 | 88 | 0.92 | 0.57 | 0.72 | 0.4 |
| 15/GROUND | floor_objects/prop_g_battle.png | 123 | 84 | 0.95 | 0.5 | 0.72 | 0.4 |
| 16/GROUND | floor_objects/prop_g_root.png | 132 | 106 | 0.9 | 0.51 | 0.58 | 0.42 |
| 17/GROUND | floor_objects/prop_g_toxic.png | 163 | 143 | 1.15 | 0.38 | 0.64 | 0.34 |
| 18/GROUND | floor_objects/prop_g_toxic.png | 166 | 48 | 1.1 | 0.4 | 0.6 | 0.33 |
| 19/GROUND | floor_objects/prop_g_edge.png | 143 | 58 | 1.12 | 0.58 | 0.6 | 0.44 |
| 20/GROUND | floor_objects/prop_g_root.png | 53 | 58 | 1 | 0.52 | 0.62 | 0.38 |
| 21/GROUND | floor_objects/prop_g_battle.png | 96 | 54 | 1.25 | 0.56 | 0.75 | 0.4 |
| 22/GROUND | floor_objects/prop_g_battle.png | 105 | 35 | 1.13 | 0.55 | 0.77 | 0.4 |
| 23/GROUND | floor_objects/prop_g_battle.png | 100 | 18 | 0.85 | 0.5 | 0.78 | 0.4 |
| 24/FOREST | collision/bound_w.png | 21 | 30 | 1.15 | 1 | 0.53 | 0.6 |
| 25/FOREST | collision/corner_nw.png | 31 | 23 | 1.25 | 1 | 0.57 | 0.61 |
| 26/FOREST | collision/bound_n.png | 64 | 23 | 1.25 | 1 | 0.56 | 0.59 |
| 27/FOREST | collision/bound_w.png | 20 | 67 | 1.25 | 1 | 0.52 | 0.62 |
| 28/FOREST | collision/corner_nw.png | 37 | 73 | 1.2 | 1 | 0.58 | 0.63 |
| 29/FOREST | collision/bound_w.png | 13 | 109 | 1.3 | 1 | 0.5 | 0.58 |
| 30/FOREST | collision/bound_n.png | 39 | 123 | 1.24 | 1 | 0.58 | 0.58 |
| 31/FOREST | collision/corner_nw.png | 46 | 129 | 1.18 | 1 | 0.61 | 0.62 |
| 32/FOREST | collision/bound_w.png | 19 | 150 | 1.2 | 1 | 0.53 | 0.58 |
| 33/FOREST | collision/bound_n.png | 45 | 171 | 1.25 | 1 | 0.55 | 0.6 |
| 34/FOREST | collision/corner_nw.png | 70 | 184 | 1.2 | 1 | 0.57 | 0.6 |
| 35/FOREST | collision/bound_w.png | 78 | 201 | 0.9 | 1 | 0.55 | 0.58 |
| 36/FOREST | collision/bound_n.png | 148 | 22 | 1.25 | 1 | 0.5 | 0.65 |
| 37/FOREST | collision/bound_e.png | 186 | 44 | 1.2 | 1 | 0.52 | 0.64 |
| 38/FOREST | collision/corner_ne.png | 174 | 70 | 1.25 | 1 | 0.54 | 0.64 |
| 39/FOREST | collision/bound_e.png | 188 | 99 | 1.22 | 1 | 0.48 | 0.65 |
| 40/FOREST | collision/corner_ne.png | 152 | 119 | 1.15 | 1 | 0.56 | 0.61 |
| 41/FOREST | collision/bound_n.png | 180 | 120 | 1.25 | 1 | 0.5 | 0.58 |
| 42/FOREST | collision/bound_e.png | 190 | 151 | 1.25 | 1 | 0.51 | 0.62 |
| 43/FOREST | collision/corner_ne.png | 157 | 168 | 1.25 | 1 | 0.55 | 0.6 |
| 44/FOREST | collision/bound_e.png | 134 | 190 | 1.1 | 1 | 0.55 | 0.6 |
| 45/FOREST | collision/bound_n.png | 144 | 199 | 1.3 | 1 | 0.48 | 0.6 |
| 46/CONNECTION | floor_objects/prop_g_edge.png | 76 | 179 | 0.95 | 0.72 | 0.59 | 0.5 |
| 47/CONNECTION | floor_objects/prop_g_root.png | 126 | 181 | 0.9 | 0.62 | 0.59 | 0.42 |
| 48/CONNECTION | floor_objects/prop_g_edge.png | 63 | 168 | 1.1 | 0.65 | 0.61 | 0.48 |
| 49/CONNECTION | floor_objects/prop_g_edge.png | 146 | 163 | 0.95 | 0.65 | 0.59 | 0.5 |
| 50/CONNECTION | floor_objects/prop_g_root.png | 58 | 129 | 1.1 | 0.7 | 0.63 | 0.44 |
| 51/CONNECTION | floor_objects/prop_g_edge.png | 136 | 120 | 1.2 | 0.68 | 0.58 | 0.5 |
| 52/CONNECTION | floor_objects/prop_g_edge.png | 30 | 109 | 1 | 0.65 | 0.58 | 0.48 |
| 53/CONNECTION | floor_objects/prop_g_root.png | 49 | 73 | 0.9 | 0.67 | 0.59 | 0.45 |
| 54/CONNECTION | floor_objects/prop_g_edge.png | 146 | 74 | 1.05 | 0.7 | 0.58 | 0.5 |
| 55/CONNECTION | floor_objects/prop_g_edge.png | 74 | 28 | 1 | 0.64 | 0.6 | 0.5 |
| 56/CONNECTION | floor_objects/prop_g_root.png | 129 | 28 | 0.95 | 0.64 | 0.58 | 0.45 |

### 고정 지면 색 면/뿌리 좌표 계약

200타일 viewBox 기준. 아래는 런타임 생성기가 아니라 고정 bake 입력이다. 원화 RGB blur와 구별한다.

```svg
<defs><filter id="soft"><feGaussianBlur stdDeviation="1.3"/></filter></defs>
 <g filter="url(#soft)">
  <path d="M101 198 C98 187 108 180 101 169 S87 154 99 145 C106 137 96 129 87 119 S89 103 84 95 C79 83 84 75 94 67 S102 47 100 33 L100 3" fill="none" stroke="#69523a" stroke-width="12" opacity=".3"/>
  <path d="M101 174 C79 169 60 166 60 153 C62 139 88 141 102 143 C117 140 138 146 139 155 C138 168 115 174 101 174Z" fill="#69513d" opacity=".27"/>
  <path d="M75 121 C56 118 32 111 33 99 C36 89 61 90 73 103 C84 113 82 119 75 121Z" fill="#594d3a" opacity=".3"/>
  <path d="M77 109 C67 96 76 73 92 71 C118 68 135 83 130 101 C125 114 94 118 77 109Z" fill="#333c2b" opacity=".26"/>
  <path d="M122 68 C138 67 166 60 177 47 C173 34 154 35 144 43 C139 51 129 56 122 68Z" fill="#304539" opacity=".34"/>
  <path d="M138 148 C148 157 171 157 173 143 C175 128 155 131 144 139Z" fill="#344337" opacity=".35"/>
  <path d="M95 68 C78 67 55 66 41 56 C35 42 46 35 58 39 C68 48 84 45 105 39" fill="none" stroke="#514630" stroke-width="9" opacity=".23"/>
  <path d="M93 43 C98 36 99 29 100 18" fill="none" stroke="#76634b" stroke-width="16" opacity=".26"/>
 </g>
 <g fill="none" stroke-linecap="round">
  <path d="M102 90 C97 100 86 104 78 113 M102 90 C113 98 120 111 132 113 M103 90 C111 79 113 69 123 66" stroke="#232921" stroke-width="1.6" opacity=".5"/>
  <path d="M102 91 C95 101 89 104 81 112 M102 90 C112 98 122 110 131 112 M103 90 C111 79 113 69 123 66" stroke="#74634a" stroke-width=".25" opacity=".3"/>
 </g>
```

빌드 운영값: sharp concurrency2, cache memory128MB/files20/items30, PNG compressionLevel6, offline preview1600px/JPEG90. layer 기본 scale1/opacity1/brightness.62/saturation.65, 경계 밖은 crop한다.


### 2026-09-25 CH1-1 생체 디테일 마감: 중복 독액 장식

| 적용 | 현재 계약 |
|---|---|
| 본편 stage0 렌더 | `m_c1gtoxic` 월드(6740,1620), 타일(168,40)만 기존 `m_c1pool` 이미지 로드 완료(complete 및 naturalWidth>1) 시 숨긴다. `Ch1LivingDetail.hideDuplicate` 사용 |
| 보존 | authored/MAP_OBJS 좌표·개수·충돌 불변. `m_c1gtoxicf`, 다른 좌표/스테이지, bossArena/fieldRebuildQA와 기존 bake에는 적용하지 않음 |
| 폴백 | 웅덩이 이미지 또는 효과 스크립트/API 미로드 시 기존 장식을 그린다 |
| 근거 | 겹친 두 웅덩이 실루엣을 하나로 정리하는 시각 전용 마감. 세부 수치·QA는 `docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` 7차에 기록. 위 날짜별 제작 수치는 해당 시점 이력 |


### 2026-09-26 동측 독구덩이 입체 디테일

| 대상 | 현행 런타임 예외 |
|---|---|
| pit_poison | 본편 stage0의 월드(6500,5580),타일(162,139)만 Ch1LivingDetail.pit의 절차식 투명 atlas로 그린다. 크기200×scale,좌표·collision·배치개수 유지. 안쪽 벽/낮은 수면/앞턱 가림 및 국소 수축 추가 |
| 폴백·범위 | 효과 API 미로드 시 원래 pit_poison.png 렌더. 다른 위치/스테이지/bossArena/fieldRebuildQA에는 원래 그림 유지. 대형 m_c1gtoxicf 원화 보존 |
| 계약 | 상세 수치·검수: CH1_LIVING_DETAIL_RUNTIME_20260925.md 9차. 원본 이미지 파일 변경 없음 |


### 2026-09-26 생체 야영지·대왕나무 국소 움직임

| 대상 | 현재 렌더 계약 |
|---|---|
| m_c1tree / m_c1camp | Ch1LivingDetail.organic: tree는15차에서 좌우뿌리2축의 붙은 밑동을 고정하고 끝을 들었다 내리는 굽힘으로 교체. camp는13차에서 수평출렁임을 제거하고 화로의 시체 손3개만 손목/손가락 관절로 굽혔다 펴는 동작으로 교체. 팔/가시/상자/돌 고정. stage0,bossArena/fieldRebuildQA제외;이미지로드실패/meta.srcRect존재/API없음이면기존sprite폴백 |
| m_c1cocoon / m_c1spod | 기존이미지알파를이용한바닥투영그림자+밑동접촉그림자,밑동고정호흡.다른stage/평면pool제외 |
| 보존·성능 | 좌표/크기/pivot/충돌/원본파일불변.동적canvas _glVer 및기존GPU텍스처재사용.추가캐시18.69968032836914MiB(native,기존나무그림자/GPU복제별도).상세공식·검수는CH1_LIVING_DETAIL_RUNTIME_20260925.md 13차 14차: 손가락별 접힘 지연·연속 관절 연결·투명셀 베이크 생략. 손14차/뿌리15차/매달린물체16차 계약 참조. 16차 고치3개·왼쪽시체1개를 나무 원본에서 분리하여 고정 매듭 중심 진자 회전 추가. |
