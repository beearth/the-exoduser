# 지옥의 틈 · 독립 정사영 2.5D 대표 구간

완료 식별: `ROOT-RIFT-2_5D-TERRAIN-SLICE-20261006`. 현재 상태는 **독립3387 통합 consumer 구현·브라우저 검수 / VISUAL RETOUCH / 본편 생산 미채택**이다. 캐릭터·lab 소비자는 총괄 담당이며, 이 문서의 지형 제작 범위는 `tools/2_5d/rift-terrain.mjs`다. 기존 원화·씬 JSON·nav·에디터·주민 atlas·사용자 저장을 변경하지 않는다.

## 1. 정본과 보존 계약

`_MAP_SSOT_INDEX.md`와 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체를 선행했다. 제작 순서는 MASTER PLAN → LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE → LANDMARK/CENTER → SMALL DETAIL → CAMERA QA → TECH QA다. 기존 대형 덩어리·길·랜드마크를 재사용하고 새 전체 지형을 반복 생성하지 않는다. 그림의 가림 폴리곤을 충돌이나 측정된 절벽 높이로 해석하지 않는다.

| 항목 | 현행 값 |
|---|---|
| 원본 씬 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json` |
| 씬 SHA256 | `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a` |
| clean plate | `assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png`, 1254×1254 |
| clean plate SHA256 | `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673` |
| 심연 | `assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png`, 1920×1920 |
| 심연 SHA256 | `ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991` |
| nav SHA256 | `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` |
| world | 200×200 / tile40 / 8000×8000 world px |
| 전체 보행 | 기존1192칸. `MapSceneCore.canWalk` 중심+radius12 대각4점의5샘플 유지 |
| 기존 시작 / 출구 | (4020,7740) / (4020,1740), 원본 불변 |
| 대표 표시 영역 | x4300…6560, y3200…4600 / 2260×1400 |
| 좌표 원점 | canonical (5430,3900) |
| 독립 시험 spawn | (5900,3820). 원본 scene.start를 변경하지 않는다 |
| 원본 높이 | **UNKNOWN**. 실제 heightmap·물리적 cliff footprint 없음 |

1254 clean plate는 생성 파생 이미지이며 원본 픽셀의 정확 추출로 주장하지 않는다. Three 전환 자체가 해당 원화의 해상도를 복구하지 않는다. 주민 등록은 현재 공유 `residentPaintingProfile`로 검증하며 원본4주민 발·크기를 변경하지 않는다. 대표 영역 밖 주민은 이 지형 모듈에서 새로 배치하지 않는다.

## 2. API와 정사영 등록

`createRiftTerrain({THREE,angle=50,scale=400})`는 async다. Three Group/ShapeUtils, MapSceneCore, Web Crypto SHA256, 브라우저 Image 디코딩이 필요하다. HTTP 오류·핀/크기/등록 실패는 reject하며 다른 지도로 폴백하지 않는다.

| 반환 | 계약 |
|---|---|
| `object3d` | 지면·심연 후경·독립 절벽 측면·동/서/남 전경3 메시 Group |
| `worldToScene(x,y,h=0)` | `THREE.Vector3`. 입력은 유한수, h는 world px |
| `sceneToWorld(vector)` 또는 `(x,y,z)` | fresh `{x,y,h}`. 정사영 역변환 |
| `canWalk(x,y,r=12)` | 전체 기존 nav의 코어 질의. 표시 clip으로 충돌을 잘라내지 않음 |
| `spawn` | fresh `{x:5900,y:3820}` |
| `bounds` | canonical clip, centre, width2260, height1400 |
| `occluders` | footY순3개 east4320/west5360/south6920, object3d/objectId/footY/polygon/triangles/sourceCrop/feather. 최신절 exact표 |
| `snapshot()` | 배율·각도·핀·nav1192·메시 수·미인수 경계 진단 |
| `dispose()` | Group 제거 및 모든 geometry/material/GPU texture 해제. 중복 호출 안전 |

각도 θ=angle, S=scale, 중심(cx,cy)=(5430,3900)일 때:

```text
X=(x-cx)/S
Y=h/S
Z=((y-cy)+h*cosθ)/(S*sinθ)
x=cx+X*S
y=cy+(Z*sinθ-Y*cosθ)*S
h=Y*S
```

각도는10…85°, scale은0초과…32000이며 기본50°/400이다. 카메라 yaw/roll0, 같은 고도각으로 ground foot를 추적해야 원화 등록이 유지된다. 바닥은 h0 수평 메시다. canonical y를 그냥 Three Z에 복사하면 sin50°만큼 축소되므로 위 보정을 유지한다. 카메라 구도 변경은 별도 검수이며 자유 orbit은 현재 계약 밖이다.

## 3. 메시·UV·가림

| 대상 | 구현 / 수치 / 한계 |
|---|---|
| 지면 | 전체8000² 사각형에서 원본 심연28점 mask를 hole로 triangulate한 뒤 대표 clip에 자른다. clean plate UV는 canonical x/8000, 1−y/8000로 정확 등록. 6crop이 같은 전체 이미지/배율을 공유하는 관계를 이용한 단일 지면 |
| 심연 | 원본 mask28점의 중심 방향90% inset 후경. 검수용 h−240worldpx, 원본 높이 의미 없음. 현재 물리적 낭떠러지/추락 판정 추가0 |
| 측면 | 원본 opening과90% inset 사이의 단일 chasm skirt. 깊이0…240worldpx, clean plate UV(x/8000,1−y/8000) × 정적 vertex color(.15−.11f,.19−.13f,.22−.14f), f=0…1. `skirtTextureApplied=true`. 기존 랜드마크/길 위치를 바꾸지 않음. 큰 벽 반복 생성0 |
| 심연 시차 | sourceParallax .965. 카메라 중심 ray의 h0 교차점으로 texture offset만 이동, 메시 opening 경계 고정 |
| feather | 기존120worldpx soft mask를 새 3D hole에 재현하지 않음. `snapshot.maskFeatherApplied=false`; seam은 실제 화면에서 RETOUCH 대상 |
| 동측 뿔 (최초 이력; 현행3전경 최신절) | 원본11점 mask·crop 그대로. world bbox x5640…6000/y3320…4320, footY4320. foot origin 메시를 X축−angle만큼 회전한 camera-facing plane로 배치. 카메라가 fixedangle이면 quaternion 갱신 불필요 |
| 배우 가림 (최초 이력; 현행연속order 최신절) | 지형 단독 재질과 별도로 root lab는 전경과배우모두transparent=true/depthTest=false/depthWrite=false로같은정렬pass 사용. worldY≤4320 actor20/그외40,뿔30; behind겹침opacity.32 선택페이드. 원화front/back 기준이며 측정된물리높이 아님 |
| 텍스처 | 원본 PNG 수정0. SRGB/Linear mag/LinearMipmapLinear min. 기본 지면 원화색 유지, 심연 tint0x8396a7 |

동측 뿔 tile mask(×40=world): `[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]`.

바닥의 회화적 절벽 얼굴은 원래 그림에 남아 있다. 새 측면/심연은 **높이가 있는 대표 구간을 검수하기 위한 독립 geometry**이며, painted mask가 진짜 3D cliff footprint였다고 소급하지 않는다. MeshBasicMaterial로 원화색과 정적 skirt 음영을 사용하며 동적 지형 광원 완료로 계산하지 않는다. 원래 심연 opacity.38 합성을 그대로 복제한 2D 그림이 아니라 대표 opening의 독립 후경이며, GPU재질의 색/깊이/경계는 시각 인수 전이다.

## 4. 검수와 관련 문서 연결

코드 변경 후 docs 전체에서 `2.5D|정사영|심연|sourceParallax|footY|지옥의 틈`을 검색했다. 관련 상세 기준은 `HELL_RIFT_EDITOR_RESULT_20261006.md`, `MAP_SCENE_EDITOR_20261005.md`, `DEPTH_2_5D_BENCHMARK_20260930.md`, `_MAP_SSOT_INDEX.md`, 지옥의 틈 기획 및 총괄 문서다. 기존 완료 이력은 유지하고 이번 독립 지형 상태는 이 문서를 기준으로 총괄이 동기화한다.

담당 작성시점 모듈 syntax검사 이후 총괄이3387 독립lab의 첫화면·WASD·원화등록·동측뿔앞뒤를 실제검수했다. 신규9+8+13그룹 및 마지막정지중3검사 PASS를 아래범위로만 인수한다. 기존 unit/보행 종주/native6단계 PASS를 새 Three 검수로 재사용하지 않는다. 본편 연결·NPC대화·광원/높이 물리·native·사운드·A급 완료는0이다.

## 5. 실제 통합 인수와 MAP PRODUCTION REPORT (§23)

현재 root의 독립3387 lab가 지형 및 세캐릭터·모션·FX를 소비한다. 이전 terrain 작성시점 실제화면 대기는 이력이다. 실측원본height UNKNOWN은 그대로다. 독립start5480/3740은 뿔 앞 화면에서 캐릭터를 확인하기 위해 선택했으며 terrain 시험spawn5900/3820 및 원본scene.start/exit는 유지한다. 전체 지도·북쪽 출구 종주/전투·에디터height 저장 roundtrip을 완성한 것이 아니다. 정확배우/키/수명/실검수 계약은 `../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 실제통합절이다.

```text
================= MAP PRODUCTION REPORT =================
STAGE: ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006 / 지옥의 틈 동측 대표 구간
MASTER
- silhouette: 기존 회화 원형·동측 뿔·균열 보존, clip2260×1400만 표시
- regions: 지면 / authored skirt / 심연 후경 / 동측 전경
- main route: 기존 nav1192의 동측 통로; 원본 남쪽시작→북쪽출구 불변
- side spaces: 이번 clip 밖 새 공간 생성0
OUTER MASS
- LEFT: 기존 균열 opening mask; 원화UV skirt 단일 연결
- RIGHT: 기존 동측 plate 지면
- TOP: 원본 뿔 crop와11점 mask
- SOUTH: clip y4600 표시경계; 원본남쪽시작은 clip밖
- major holes: 기존28점 opening; physical height UNKNOWN
LARGE
- source assets: 주민v2 scene(c508e70d…),1254²clean plate(aa64cb7b…),1920²abyss(ace0c853…)
- composites: clippedground17triangles, authoreddepth240/inset90%, camera-fixed foreground
- overlap: 동일transparentpass actor20/40-foreground30; 선택적opacity.32
- repeated silhouette: 기존 원형 재사용; 새 반복 large mass0
MEDIUM
- connections: canonical XY/UV 및 기존nav 질의 유지
- remaining holes: 원본feather120 미재현; hard seam RETOUCH
GROUND
- shadow: 실제선택배우foot 기준 Circle opacity.26/y.002/order15
- contamination: 새 바닥 랜덤데코0; skirt plateUV×정적 vertex 음영
- structure integration: world→scene 정사영50°등록; 실제heightmap추가0
PLAYABLE
- main arenas: 실제전투/보스arena검수없음
- travel space: WASD/방향키8방향·260/470worldpx/s, radius12/clipmargin12
- breathing space: 독립 캐릭터비교 화면, NPC거점 기능 추가0
- threat space: 피해/낙하/적spawn추가0
- combat readability: 공격 시트/arc만 표시; 실제피해·전투완료없음
LANDMARK
- primary: 심연 opening
- secondary: 동측 뿔11점/footY4320
- tertiary: 기존 지면 원화재질; 새atlas없음
CAMERA QA
- START: 5480/3740에서세외형·접지 실제확인, 기존5900/3820초기전체가림관찰보존
- EARLY: 8방향입력·클립경계 실제검사
- ARENA: 본편arena/전투 미검수
- SIDE L: clip내위치관측; 전체서측카메라 미검수
- SIDE R: 뿔겹침·opacity.32/전체가림OFF 실제비교
- LANDMARK: 뿔앞뒤actor20/40-foreground30 실제재질 계약확인
- LATE: 전체상승경로 미검수
- EXIT: 원본4020/1740 불변; 실제출구 인수없음
TECH QA
- route: 독립8방향/nav밖제한PASS; 본편6단계미인수
- collision: 원본nav/radius12/5샘플 질의; 새높이충돌없음
- pageerror: 최신consumer13check와정지중3check의runtimeexception0
- 404: 정상source로드·원본29핀확인; 의도실패로딩은readyfalse/RAF중지
- seam: plate UV skirt 구현, feather미재현/hardedge RETOUCH
- loading: 실패관측8그룹중포함; 다른지도/외형폴백0
- performance: renderer1/RAF최대1/DPR≤2; 장시간FPS/실물폰미인수
FILES
- stage-owned: tools/2_5d-world-lab.html/.mjs, tools/2_5d/rift-terrain.mjs 및 관련docs
- concurrent touched: 오더담당 소유 STATE/LOG4의 정상업데이트 별도보존; v2미완료WIP미stage
- unrelated touched: 원총괄0; game/index/editor/에셋/씬/nav/세이브/2_3보존
GIT
- staged: 완료소유 code+관련docs만 즉시checkpoint
- commit: 정확SHA는외부 receipt.json에서확인
- push: 정상Git push 및원격exactSHA 외부영수증
- deploy: 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 원본형태·nav유지한고밀도바닥/큰절벽·전경alpha와feather접합. 보스전용mode/NPC·상승·save/native·청취연결은별도필수Gate.
```

실제근거: `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/`의 원본QA·화면·WebM·마지막정지중제어검사·백업·검색·핀·Git receipt. fixture PASS와 실제화면/native·청취 인수를 구분하며 시각 판정은 맵 확대 흐림과 hard seam이 남아 **RETOUCH**다.

## 실제 MAP·QA v3 public 소비와 표시 위치 검사 — 2026-10-06T13:35:21.135000+00:00

공식 root 구현 ID `ROOT-2_5D-LIVE-REGISTRATION-ANCHOR-20261006`. 기존 3387 lab의 단일 renderer/RAF 안에서 MAP·QA v3 public 파생본을 실제 소비한다. 기존 SKILL·ANIMVFX2에 MAP·QA2를 더해 현재 public 소비 역할4이다. 제출 raw 원본은 변경하지 않았다.

| 항목 | 현재 코드 계약 / 실제 관측 |
|---|---|
| QA public | `tools/2_5d/slice-acceptance.mjs`, 원 raw13173 B / SHA `d5be0daa4a4581be086840a97a5b9678775d216706586e60f08b4344eb5b0886`, 공식 `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE` |
| MAP public | `tools/2_5d/scene-registration.mjs`, 원 raw11746 B / SHA `e10b79849bdf34230daaaab6c976a759229ee14953ed9d6f467f65e333de555c`, 공식 `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE` |
| frame source gate | catalog 명시 frames ×8방향, 지원3 id ×4 mode. source rect/anchor 범위·referenceHeight 및 asset width/height를 finite number·양수로 검사. Infinity/NaN/숫자문자열/0은 FAIL. crop마다 다른 정상 anchor 비율은 허용. Node self-check는 public에서 제외 |
| 실제 scene 대조 | `terrain.sourceSceneSnapshot()`은 실제 로딩해 사용하는 scene의 `K.clone(source)` 반환. 3387의90767 B canonical raw를 SHA256 대조 후 보호 world/walkable/start/exit/sourcePins/assets/layers/residentLayerReview와 비교. clone 변경은 원 nav에 미반영 |
| MAP 상태 | canonical pin VERIFIED, canonicalCompare VERIFIED, projectionRoundtrip.ok=true,1192 walkable. editorProvider 미공급이므로 editorRoundtrip=PENDING 유지. 물리 높이 UNKNOWN, A급/native/에디터 save 왕복 완료로 승격하지 않음 |
| 좌표 관측 | 실제 `object3d.getWorldPosition(new THREE.Vector3())`를 현재 terrain.sceneToWorld로 역변환해 world px `{x,y}`로 관측. raw Three units나 anchorY/h 비율을 world 접지 오차로 사용하지 않음 |
| 표시 위치 검사 | `#check-foot` 클릭 시 현재 mode의 제자리 표시 시작, 기존 RAF의 실제 렌더 프레임12개 관측. id/mode/direction/world XY 유지 조건. drift 허용4 world px, clip inset과 canonical nav 질의 반경12 world px. 추가 RAF·renderer·mixer·게임/세이브0 |
| 무효화 | 검사 중·완료 후 이동 키/초점/캐릭터/모션/reset/일시정지 전환 시 기존 PASS/FAIL을 PENDING으로 무효화. 자동 attack→idle 전이도 동일. 정지 상태 요청은0 samples·PENDING, 새 관측 완료로 계산0 |
| 결과 snapshot | __rift25Lab.snapshot()의 acceptance와 registration을 structuredClone하여 반환. 결과를 외부에서 바꿔도 live 값에 미반영. provenance의 raw bytes/fullSHA·공식 ID 유지 |
| UI | 화면 앵커 검사12프레임·편차·nav 반경 및 editor PENDING 표시. 확대 label nowrap으로 두 글자 줄바꿈 방지. 부모 DOM textContent 교체0 |
| 새 root 검증 | 실제 Mac headless Chrome/3387 21검사 PASS + 자동 모션 해제 후속5검사 PASS. 3 id ×4 mode의144 실제 프레임 앵커/nav 관측 포함. 새 코드 runtime 예외0. canonical HTTP 변조시 ready=false/RAF중지 확인 |
| 접촉의 한계 | PASS는 **actor 원점의 월드 표시 앵커와 nav 질의**에 한정. 변형된 heel/발 픽셀 접촉·IK·전투 판정·본편/native6·청취 인수 아님 |
| 시각 | 실제 드루이드·실버테일 화면 확인. 맵1254² 확대 흐림/hard wedge/skirt seam 유지 — **VISUAL VERDICT: RETOUCH**. 새 높이·전체 맵/상승 경로 완료0 |

실제 새 증거: `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json(21), mode-release-result.json(5), dark-druid-diagnostics.png, silvertail-diagnostics.png, final-diagnostics.png. 이전502/9+8+13+3 검사를 재실행하지 않았다. 실물 휴대폰·NW native·청취 인수와 구분한다.

STORY v3의 plain thenable 회귀와 ports/ctx.snapshot try 경계 P2를 찾아 Claude8에게만 `CH1-2_5D-STORY-ASYNC-GUARD-20261006`을1회 인계했다. v4 raw **10164 B / SHA `0473eb649fafd16374bca26455972255ec3ef1988d44bf32fb5bdbfac2ffa8de`**, 경로 `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v4.candidate.mjs`, 공식 ID `CH1-2_5D-STORY-ASYNC-GUARD-20261006-V4-CANDIDATE`, end `e2aff546-5762-4ea1-89d2-70538445478e`@13:31:54.525Z, end textSHA `edb5d367cd3c379dfb861833a73f8ab9d3477b88a4d0778fb409a1ff40464b79`. source1/end1/idle·정확 핀/syntax 확인으로 후보 미채택 보존한다. 원총괄 검토상 요청2결함은 해결됐으나 provider 메서드 분리 호출의 this=ports 소실 P2가 남아 일반 consumer 채택0이다. 이전 raw15 불변. BOSS v3는 이전2결함 해결·좁은 표시 어댑터 후보이며 public 소비0·특수 dive/emerge/transform/beast catalog 등록0.

실제 NUL80 도달 시 완료 root code5+STORY v4 raw1+상세 docs2만 즉시 checkpoint한다. 상세 관리 docs 동기화는 다음 정상 commit으로 이어간다. 담당 STATE/LOG4·foreign WIP·보호10·게임/index/editor·source PNG/scene/nav/save는 보존하며 새 팀/실행 세션·paused 자동화/메일 재개0. 기존 source 판정·미구현 이력은 현재 관측 시각과 구분한다.

### §23 MAP PRODUCTION REPORT — 이번 등록·표시 검사 연결

앞선 geometry/원형·경계·여정 검수 범위를 유지하고 현재 추가 관측만 반영한다.

```text
MAP PRODUCTION REPORT =================
STAGE: ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006 / 지옥의 틈 동측 대표 구간
MASTER
- silhouette: 기존 회화 원형·동측 뿔·균열 보존, clip2260×1400만 표시
- regions: 지면 / authored skirt / 심연 후경 / 동측 전경
- main route: 기존 nav1192의 동측 통로; 원본 남쪽시작→북쪽출구 불변
- side spaces: 이번 clip 밖 새 공간 생성0
OUTER MASS
- LEFT: 기존 균열 opening mask; 원화UV skirt 단일 연결
- RIGHT: 기존 동측 plate 지면
- TOP: 원본 뿔 crop와11점 mask
- SOUTH: clip y4600 표시경계; 원본남쪽시작은 clip밖
- major holes: 기존28점 opening; physical height UNKNOWN
LARGE
- source assets: 주민v2 scene(c508e70d…),1254²clean plate(aa64cb7b…),1920²abyss(ace0c853…)
- composites: clippedground17triangles, authoreddepth240/inset90%, camera-fixed foreground
- overlap: 동일transparentpass actor20/40-foreground30; 선택적opacity.32
- repeated silhouette: 기존 원형 재사용; 새 반복 large mass0
MEDIUM
- connections: canonical XY/UV 및 기존nav 질의 유지
- remaining holes: 원본feather120 미재현; hard seam RETOUCH
GROUND
- shadow: 실제선택배우foot 기준 Circle opacity.26/y.002/order15
- contamination: 새 바닥 랜덤데코0; skirt plateUV×정적 vertex 음영
- structure integration: world→scene 정사영50°등록; 실제heightmap추가0
PLAYABLE
- main arenas: 실제전투/보스arena검수없음
- travel space: WASD/방향키8방향·260/470worldpx/s, radius12/clipmargin12
- breathing space: 독립 캐릭터비교 화면, NPC거점 기능 추가0
- threat space: 피해/낙하/적spawn추가0
- combat readability: 공격 시트/arc만 표시; 실제피해·전투완료없음
LANDMARK
- primary: 심연 opening
- secondary: 동측 뿔11점/footY4320
- tertiary: 기존 지면 원화재질; 새atlas없음
CAMERA QA
- START: 5480/3740에서세외형·접지 실제확인, 기존5900/3820초기전체가림관찰보존
- EARLY: 8방향입력·클립경계 실제검사
- ARENA: 본편arena/전투 미검수
- SIDE L: clip내위치관측; 전체서측카메라 미검수
- SIDE R: 뿔겹침·opacity.32/전체가림OFF 실제비교
- LANDMARK: 뿔앞뒤actor20/40-foreground30 실제재질 계약확인
- LATE: 전체상승경로 미검수
- EXIT: 원본4020/1740 불변; 실제출구 인수없음
TECH QA
- route: 독립8방향/nav밖제한PASS; 본편6단계미인수
- collision: 원본nav/radius12/5샘플 질의; 새높이충돌없음
- pageerror: 새 live 등록/앵커21check+모션해제5check의runtimeexception0
- 404: 정상source로드·원본29핀확인; 의도실패로딩은readyfalse/RAF중지
- seam: plate UV skirt 구현, feather미재현/hardedge RETOUCH
- loading: 실패관측8그룹중포함; 다른지도/외형폴백0
- performance: renderer1/RAF최대1/DPR≤2; 장시간FPS/실물폰미인수
FILES
- stage-owned: tools/2_5d-world-lab.html/.mjs, tools/2_5d/rift-terrain.mjs, scene-registration.mjs, slice-acceptance.mjs 및 관련docs
- concurrent touched: 오더담당 소유 STATE/LOG4의 정상업데이트 별도보존; STORY v4 공식완료raw는미채택보존;그밖WIP미stage
- unrelated touched: 원총괄0; game/index/editor/에셋/씬/nav/세이브/2_3보존
GIT
- staged: 완료소유 code+관련docs만 즉시checkpoint
- commit: 정확SHA는외부 receipt.json에서확인
- push: 정상Git push 및원격exactSHA 외부영수증
- deploy: 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 원본형태·nav유지한고밀도바닥/큰절벽·전경alpha와feather접합. 보스전용mode/NPC·상승·save/native·청취연결은별도필수Gate.
```


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

### 수치·API·원자료 계약

| 항목 | 코드와 같은 현행 값 |
|---|---|
| terrain 표시 범위 | RIFT_TERRAIN.clip={left:0,top:0,right:8000,bottom:8000}, centre5430/3900, groundTriangles32. reset5480/3740; terrain 기본 spawn5900/3820 별도. 원본 source start4020/7740·exit4020/1740 불변 |
| 투영/카메라 | 정사영50°/scale400/yaw0. camera position=(target.x,sin50°×16,target.z+cos50°×16), lookAt(target). 기본 높이3.5, 확대80…220%/step5/초기100%, DPR≤2 |
| authored 절벽 | depth240/inset.9/physicalHeight UNKNOWN. 상단 source RGB×shade, shade=1−.78f(f0…1)→1… .22. skirtTopSourceMatched=true/skirtTextureApplied=true/sourceParallaxApplied=true/maskFeatherApplied=false |
| 보행/시간 | WASD·방향키8방향260worldpx/s, Shift470. 각 bounds12안쪽+nav radius12. 기존 RAF1의dt0… .04seconds·UI갱신180ms. 새 RAF/mixer/서버0 |
| 배우·주민 정렬 | renderOrder=30+(footY−4320)/8000×10, 기존뿔30, 전경 낮추기 opacity.32. 배우 hero mesh 전부 같은 foot order, helper70·그림자15. 주민 source 발 이동0 |
| 원본 주민v2 scene | 90767B/SHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a, nav1192·원본 sourcePins 불변 |
| clean plate / abyss | clean1254² SHA aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673 / abyss1920² SHA ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991 |
| 주민 atlas | 881398B/1254²/SHA ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38. 실제 HTTP bytes SHA 확인, texture1 공유/Linear min·mag/no mipmaps. 원본 픽셀/crop 불변 |
| 주민 표시 API | createRiftResidentBillboards({THREE,terrain,camera,scene,displayScale=1.8})→object3d/update/snapshot/residents/dispose. scale 유한 Number .5…3; 스스로 scene.add; own RAF/timer/input0 |
| 주민 그림자 | 공유 CircleGeometry48/material, opacity.26/order15/y+.002. display radii .42/.08의 rx2…32/ry1…8 clamp, radius12 보행 불가면 숨김. 기존 editor의 nav-clipped radial과 별도 lab 타원 |
| 주민 자원 | unique geometry/material/texture 해제, atlas image=null/cleanupErrors. snapshot count=4. 모듈 dialogueImplemented=false는 billboard 자체 범위이며 실제 lab은 별도 대화 consumer 연결 |
| 기존 대사 raw | tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json,25940B/SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. HTTP SHA 검증 후 createRiftDialogue 사용, NPC Map 기반 |
| 대화 접근·전환 | range140worldpx, 최대 range240/node 전환64, line step≤20/radius12/정확true 보행검사. inspectResidentAccess 4ready/startConnected를 실제검사. 최대값은 기존 consumer 계약 |
| displayApproach 알고리즘 | 발에 [120,0],[-120,0],[80,80],[-80,80],[80,-80],[-80,-80],[0,120],[0,-120] 순서. nearest(point)?.npcId 일치 첫점 선택, 없으면 기존 row.approach. 원본40거리 approach 검사 결과를 덮어쓰지 않음 |
| 대화 입력/pose | R/KeyR·대화버튼, nearest 방향으로8방향 회전 후 clearIntent/release. 대화 중 pose에 neutral{dx:0,dy:0,facing} 전달. ready/paused에서 시작·선택 거부. E/Q변경0 |
| 대화 닫기 | movement-input/character-switch/motion-preview/preview-location-change/pause-change/escape/manual/pagehide. reset은 기존setMode로 닫음. playerXY는 동일RAF에서 갱신 |
| 보상 경계 | editor-session-only, 베린 gift trial record1·재방문 afterGift, 네사 story.nessa.findLin quest record1, 총2/allactualGrantfalse. 아이템·퀘스트·save·chapter gate0 |

| NPC ID / 한글명 | 원본 발 XY | 원본 접근검사 XY/거리 | 현재 displayApproach XY/거리 | display W×H | renderOrder |
|---|---|---|---|---|---:|
| rift-rest-haran / 하란 | 4660/6660 | 4700/6660 /40 | 4780/6660 /120 | 87.19723183391004×144 | 32.925 |
| rift-gift-berin / 베린 | 6020/5580 | 6020/5540 /40 | 5900/5580 /120 | 90.43598615916956×87.69550173010381 | 31.575 |
| rift-request-nessa / 네사 | 6300/5020 | 6300/4980 /40 | 6180/5020 /120 | 68.97257769652651×144 | 30.875 |
| rift-prepare-dorik / 도릭 | 5220/2500 | 5220/2460 /40 | 5100/2500 /120 | 74.3225806451613×144 | 27.725 |

### Interaction cue 파생 consumer

| 항목 | 코드와 같은 계약 |
|---|---|
| 원자료 / 파생본 | ANIMVFX raw9287B/SHA140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567 불변. tools/2_5d/interaction-cue-lifetime.mjs 14063B/SHA1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7 |
| API | createInteractionCueLifetime({THREE,scene,camera,terrain,options})→update(dtSeconds,player,provider)/setReducedMotion(boolean)/onActorChange(reason)/onSceneChange(reason)/dispose()/snapshot() |
| 자원·시간 | 접근ring1+열림삼각1/mesh2 pool; 독자RAF/timer0; module dt 유한seconds0… .1 clamp·root0… .04. providerWrites=false/actualGrant=false/nativeAccepted=false |
| 접근 ring | RGB0xcdbb86/opacity.55/size.16sceneunits/RingGeometry(.5,1,32,1). 닫힌대화의nearest NPC foot XY에 groundLift.003으로 표시 |
| 열린 대화 표시 | RGB0xc8623a/opacity.8/size.12/RingGeometry(0,1,3,1). 현재anchor XY·openLift.42/camera world quaternion 복사. player/displayApproach에 표시하지 않음 |
| pulse | 1.6Hz/depth.22/p=1+.22sin(clock/1000×1.6×2π). 접근size=.16p·열림size=.12고정. opacity=clamp(base×(.75+.25p),0,1) |
| reduced-motion | boolean만, true이면p1·기본opacity·clock0. prefers-reduced-motion 실시간 연결·새mesh추가0 |
| order/재질 | root orderFor=riftResidentFootOrder→30+(anchorY−4320)/8000×10+.5. 미주입 defaultfixedOrder31과 구분. transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse/frustumCulledfalse |
| XY/ID guard | player/anchor Number유한0≤x,y<8000; ID1…96자 ASCII영숫자/_.:-. 소비 필드 accessor 호출0/거부, method prototype 조회 최대8단계·receiver유지·playerCopy 전달 |
| option guard | opacity0…1,size>0…32,lift0…32,Hz0…10,depth0…1,RGB정수0…0xffffff. fixedOrder/orderOffset 유한수; maxAnchors4/worldSize8000/orderOffset.5고정; anchorFor/orderFor=null 또는함수 |
| cache/실패 | 최근anchor최대4. provider/actor/scene변경→retire+cache/clock초기화. root anchorFor null이면cache위치재사용0. getter/NaN/provider·투영·order 예외→양쪽숨김/cache삭제/provider참조폐기. error최대160자/reason최대96자 |
| 종료/진단 | 부분생성실패unique2geo/2material해제, dispose중복안전. snapshot worldFoot/scenePosition/size/opacity/order·spawn/retire/cache/meshes는복사본. publicroot stdin 새1회6그룹PASS와 실제3387 최종23check 구분 |

### §23 MAP PRODUCTION REPORT — 전체 주민 위치와 실제 대화 연결

```text
MAP PRODUCTION REPORT =================
STAGE: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006 / 지옥의 틈 독립3387
MASTER
- silhouette: 승인된 기묘한 이공간 원형·균열·회화재질 보존; 마을건물/반복캠프 추가0
- regions: 전체8000² world의 지면/주민4·심연후경/기존뿔전경
- main route: source남쪽4020/7740→북쪽4020/1740/nav1192 유지; 연속여정 실플레이 미관찰
- side spaces: 기존 하란/베린/네사/도릭 공간; 신규 geometry/nav 쓰기0
OUTER MASS
- LEFT: 기존균열·opening mask
- RIGHT: 기존동측plate/뿔
- TOP: 기존상승계단과출구
- SOUTH: 기존남쪽진입/하란 공간
- major holes: 기존28점opening/authoreddepth240·physicalHeight UNKNOWN
LARGE
- source assets: 원본scene90767B/cleanplate1254²/abyss1920²/주민atlas1254²
- composites: ground32triangles/fullworldclip·sourceUVskirt·후경시차
- overlap: 배우/주민footY공식+기존뿔order30; lateral120접근으로두몸겹침완화
- repeated silhouette: 큰원형재사용/신규반복천막0
MEDIUM
- connections: sourceXY/UV/nav1192 유지; 카메라가현재배우를따라주민위치까지이동
- remaining holes: 원본feather미재현·hard wedge/경계보정필요
GROUND
- shadow: 배우/주민발기준opacity.26/order15; 주민정적타원radius12gate
- contamination: 원본그림보존/새랜덤데코0
- structure integration: skirt상단RGB source 일치→아래.22배음영; 실제heightmap추가0
PLAYABLE
- main arenas: 본편전투/보스arena검수0
- travel space: 8방향260/470worldpx/s·boundsmargin12/navradius12
- breathing space: 실제주민4대화/물건·부탁trial 선택; 본편보상/세이브연결0
- threat space: 적spawn/피해/낙하추가0
- combat readability: 기존전사/실버테일/드루이드공격표시; 새피해판정0
LANDMARK
- primary: 기존심연opening
- secondary: 북쪽계단·동측뿔
- tertiary: 주민4/접근ring/열린대화marker
CAMERA QA
- START: labreset5480/3740; 원본sourceSTART 실입장미관찰
- EARLY: 하란4780/6660 실제대화화면
- ARENA: 본편전투미검수
- SIDE L: 남쪽하란공간/그밖서측전체미관찰
- SIDE R: 베린5900/5580·네사6180/5020 실제화면/원본뿔겹침옵션유지
- LANDMARK: 도릭5100/2500·북쪽계단주변화면/막힌여정완료로계산0
- LATE: 네사부탁수락실화면; 전체상승여정미관찰
- EXIT: 원본4020/1740 불변; 장전환인수0
TECH QA
- route: inspector4ready/startConnected·lateral120nearest 실제검사; 연결성은전체실플레이완료아님
- collision: canonicalnav/radius12 유지; 물리높이·캐릭터IK미인수
- pageerror: 최종3387 actual23check runtime0
- 404: 정상자산HTTP실패0; NPCatlas변조시readyfalse/RAF0
- seam: source상단skirt음영보정; hardedge·blur RETOUCH
- loading: sourceSHA확인·실패닫힘; 새atlas/다른map폴백0
- performance: renderer1/RAF최대1/cuemesh2pool·pagehide해제실검사; 장시간FPS/폰미인수
FILES
- stage-owned: root labhtml/mjs·terrain·scene-registration·NPCbillboards·cue 및관련docs
- concurrent touched: owner STATE/LOG4 정상갱신만별도; 신규raw7후보미채택보존
- unrelated touched: root0/game/index/editor·sourcePNG/scene/nav/save·보호10/foreign68불변
GIT
- staged: 완료소유code+docs만80부터즉시checkpoint
- commit: 코드/docs/raw정확목록은외부Gitreceipt
- push: 정상push/remoteexactSHA를각checkpoint영수증으로확인
- deploy: 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 고밀도지면·큰절벽/전경alpha와feather경계, 주민전용리깅/실여정·본편consumer·native6/청취/IK 인수.
```


## 2026-10-07 public 지면 재질 모듈 — 통합 진행 중

| 항목 | 정확 계약 |
|---|---|
| 파일/API | tools/2_5d/rift-ground-detail.mjs · await createRiftGroundDetailMaterial({THREE,sourceScene,plateTexture,enabled=true,fetcher?,makeCanvas?}) → material/setEnabled(boolean)/snapshot/dispose |
| 원자료 | arrival-detail-v1.png 1024×1536/2,877,605B/full SHA a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84; crop x320/y1120/w240/h240 |
| 표시 | mirror480² · world period320 · alpha.4 · sRGB soft-light · globalUV/바닥1메시만 |
| 마스크 | 200²/40px/nav1192 · nav 실제40,000byte SHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179 · hardNearest×softLinear inward; edge128/interior255 |
| 수명 | 자체3texture+1material 소유/빌린 plate 미dispose; RAF0/timer0/geometry·nav·scene 쓰기0. setEnabled는 view-only A/B |
| Gate | worker 신규 CPU stdin6그룹 PASS. 실제 WebGL compile/link·화면은 root 진행 중. 새 ANIMVFX raw candidatePin=null/candidateAdopted=false |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM/경로/랜드마크/geometry/충돌 불변, GROUND 색재질 public 모듈1개 완료, PLAYABLE1192 유지 계약, CAMERA 신규 시각검수 대기, TECH CPU6그룹 PASS. **VISUAL VERDICT: RETOUCH**; 원본1254²의 큰 형태 해상도 복원/native 높이 인수로 계산하지 않는다.


## 2026-10-07 현행 실WebGL 재질·경계 통합

| ID/적용 위치 | 정확 구현 계약 |
|---|---|
| rift-terrain/createRiftTerrain | groundDetail async controller의 material을 ground1 mesh에 연결; controller가 자체3textures+1material 해제, borrowedplate는terrain에서1회해제. setGroundDetailEnabled(boolean) view-only |
| obj-rift-depth/source boundary | 원 mask28선분의 world 고정 최단거리d, outside0/inside smoothstep(0,120,d), opacity.38×alpha; feather=0은hardclip. sourceParallax.965→카메라지면투영view와centre4000의 offset ±(view−4000)×.035/8000 |
| skirt/backplane | 공용 MeshBasicMaterial opaque·mapplate+abyss sRGB sourceover색합성. 기존shade1−.78f/abyssTint0x8396a7 제거. 같은onBeforeRender로각meshparallax갱신. 120은새depth비율/추정값아님 |
| XY/UV/geometry | globalUV=(x/8000,1−y/8000), 원opening28/nav1192/scene90767B·c508e70d…불변. floor32triangles/authoredInset.9/authoredDepth240/camera50°/scale400 유지. 실제높이UNKNOWN |
| ground detail | 원 PNG1024×1536/2,877,605B/fullSHA a38117e… /crop320·1120·240·240/mirror480²/period320/alpha.4/sRGB soft-light. 실제nav200²/40,000byteSHA a4508aa… 검증. hardnearest×softlinear edge385칸=128/interior807칸=255 |
| UI | 지면 재질 상세 checkbox A/B; 기존renderer/RAF1에 통합, 추가RAF/timer0, scene/save/정본에 checkbox 저장0 |
| snapshot | openingComposite.compiled/featherWorldPx120/opacity.38/segments28/blendSpace sRGB/opaqueSurfaces/globalUV/maskWorldFixed; maskFeatherApplied는shader연결후true. groundDetail.compiled/compileCalls1/source.fullPinVerified/navPinVerified 확인 |
| 실제 검사 | 신규Chrome phase1 유효18checks PASS(모션7 시작/1회종료·under숨김 포함), phase2 신규lifecycle/대화/이동/PNG변조9checks PASS. 첫phase19번은blur를발생시키지않고focus만주면서취소를기대한harness오류FAIL로 보존/정정. 18개성공항목 전체재실행0 |
| 실제 pixels | 같은정지camera의지면A/B 1160cell-centre관측: 비보행967곳 pixel delta0, 보행193중156곳 변화. 전체맵·모든경계검수완료 주장은0. 기본python PIL불가→설치없이번들Python 사용 |
| 캡처 범위 | 외부before-qa 캡처파일명을재사용하여 그파일도수정후화면이다. after-initial-qa에이사실명시. 동일시점before/after파일쌍으로비교했다는주장0. 실제after-start/after-Haran/after-Nessa/special3캡처를root가열어검수 |
| 수명수정 | 정지중special취소는기본actor/helpers/shadow즉시복구; same-druid특수시작은이전effect풀반환. 동작select는다음재생설정이며표시지표는실제special.id로계산 |

MAP PRODUCTION REPORT (§23): MAP 지옥의틈/rootqualitynow; MASTER/OUTER/MEDIUM/경로/좌표불변; GROUND 원navgated재질만변경; PLAYABLE1192/canonicalradius12불변; LANDMARK/CENTER 원foot/horn불변; SMALL DETAIL mirror480²; CAMERA 실제start/Haran/Nessa/7특수동작관측·초점/정지/추적검사; TECH 신규27유효Chromechecks/noerrors, 음향/native0. 외부영수증 `rift-quality-live-20261007/live-quality-result.json`, `lifecycle-quality-result.json`, `ground-ab-pixels.json`.

**VISUAL VERDICT: RETOUCH** — 이전하드왼쪽wedge색단절은현재화면에서완화됐지만원plate1254²의큰지형확대흐림은남음. erupt셀상단에잔여띠가보이며원PNG/fullcell을보존했으므로root임의삭제·새foot추정0. 특수foot/referenceHeight UNKNOWN, 실제본편/native·청취·보상save·A급인수0.


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


## ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007 — 등록 상세·§23

| object ID | x | footY | width | height | pivotX/Y | mask | triangles | crop x/y/w/h (원 JSON double) | order |
|---|---:|---:|---:|---:|---|---:|---:|---|---:|
| obj-east-horn | 5640 | 4320 | 360 | 1000 | 0/1 | 11 | 9 | 884.0699999999999 / 520.41 / 56.42999999999999 / 156.75 | 30 |
| obj-west-root | 2120 | 5360 | 640 | 720 | 0/1 | 12 | 10 | 332.30999999999995 / 727.3199999999999 / 100.32 / 112.85999999999999 | 31.3 |
| obj-south-root | 4720 | 6920 | 520 | 640 | 0/1 | 10 | 8 | 739.8599999999999 / 984.39 / 81.50999999999999 / 100.32 | 33.25 |

전경 source의 rotation0/flipXfalse/opacity1/maskFeather(default0)/cleanplate1254² 등록을 검사한다. CPU local vertex=((wx-objectX)/scale,(footY-wy)/scale,0). atlasUV=((cropX+(wx-objectX)/width*cropW)/1254,1-(cropY+(wy-(footY-height))/height*cropH)/1254). 기본camera50°/scale400이면 X축−50° 회전. source mask와 crop는 바꾸지 않는다.

공용 shader key=`rift-foreground-canonical-nav-v1`. `riftForegroundUV` attribute→`riftForegroundWorldUV` varying→`riftForegroundNav` uniform. r160 map_fragment 직후 alpha 차단/alphatest discard이며 compile태그 불일치는 throw, exception cleanup도 Set dispose. 이 draw gate는 보행칸의 그림을 가림에서 제외하며, 뿌리의 실제 silhouette/물리 높이를 측정한 것으로 해석하지 않는다.

| 근거 파일 | 관측/한계 |
|---|---|
| foreground-before-{east,south,north}.png / foreground-before-result.json | 수정 전 동일카메라 실제캡처, 이전 턴 이름재사용과 구분 |
| foreground-after-result.json / foreground-after-south-no-fade.png | 첫3전경 11유효성공. paused disabled #talk 기대 harness timeout FAIL 별도. south 몸가림 실제발견 |
| foreground-mask-result.json / foreground-mask-south-no-fade.png | navalpha 수정후 fadeOFF1 몸가림 해결 실제열람. 신규4항목 PASS. 11이전항목 전체재실행0 |
| foreground-mask-dialogue.png / foreground-mask-east.png | 실제Haran meet 및 east 표면. session-only flags/보상save 미기록. west전체/실전투/출구/음향 미관측 |
| raw FIX checkpoint | 83a7324ed651deb954e04825a4a8cad43d719ff7 remoteexact. 완료소유7+docs2만, 실제prestage83→after74/foreign68불변/index0. raw45 직접import/본편채택0 |

```text
MAP PRODUCTION REPORT
STAGE: 지옥의 틈 / 독립3387 world-lab / ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007
MASTER PLAN
- silhouette: 승인된 비대칭 계곡 원화 유지
- regions: 원8000²/남도착/양측균열/북상승로 유지
- main route: canonical start4020,7740→exit4020,1740; 대표spawn5900,3820 불변
- side spaces: 원4주민 좌표 유지/새전체region 생성0
OUTER MASS
- left/right/top/south: 큰바위·뿌리·상승계단 그림 유지
- major holes: 원심연28점/inset.9/authored240 유지; 물리높이UNKNOWN
LARGE ASSETS
- source assets/composites: cleanplate1254²/심연1920² 유지/전경3 exactcrop 같은plate 등록
- overlap: actor/resident/전경 commonfootY pass; nav보행칸은전경alpha0
- repeat risk: 새scatter0/원판확대흐림RETOUCH
MEDIUM CONNECTION
- cliff connections/valley mouth/remaining holes: geometry 불변/전체경계인수UNKNOWN
GROUND CONNECTION
- foot shadows: 기존배우/주민그림자 유지
- contamination: 이전groundDetail3textures/period320/alpha.4 유지
- structure-ground connection: source ground의upright 몸가림을navalpha로차단
PLAYABLE
- arenas/travel/breathing/threat routes: nav1192/radius12 유지
- actual travel: KeyS200ms 4780,6660→4780,6712.025999999998 관측
- combat cameras: fixture를실전투로재계산0/실전투UNKNOWN
LANDMARK/CENTER
- primary: 중앙균열 유지
- secondary: 북쪽계단/동측뿔; tertiary: 남·서뿌리/원4주민
CAMERA QA
- START: 남쪽Haran4780,6660 검수; scene.start exact구도는미관측
- EARLY/LANDMARK: east5480,3740 검수
- ARENA/SIDE-L/SIDE-R/LATE: 전체인수UNKNOWN
- EXIT: northDorik5100,2500 등록캡처; scene.exit/장전환미관측
TECH QA
- route/collision: 원nav/K.canWalk 변경0/전체종주검사반복0
- pageerror/consoleerror: 수정후0/새404 검사완료주장0
- seam: 남쪽몸가림수정/뿌리silhouette·큰지형흐림RETOUCH
- loading: 기존3387/기존renderer·RAF1/새server·loop0
- performance: geometry/material3+navtexture1; 전체성능인수UNKNOWN
FILES
- stage-owned: root terrain.mjs/world-lab.mjs +관련docs16
- concurrent touched: ownerSTATELOG4 별도/수정0; FIXraw7 별도보존완료
- unrelated touched: root0; foreign68/PNG/scene/nav/game/index/save/보호2_3불변
GIT
- staged: 완료소유code2+docs16 exactlist
- commit/push: 정상hook/check/push 및외부public-foreground-receipt.json remoteexact확인
- deploy: 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: NPC pose/관측·실corrupted_wolf idle/유효walkconsumer 최소통합; 큰지형흐림/서측가림·본편native6/청취·보상save 미완료
```


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

| 현행 항목 | 값·적용 위치·인수 범위 |
|---|---|
| 코드 | `tools/2_5d-world-lab.mjs/.html` + `tools/2_5d/dialogue-observation.mjs`, `dialogue-pose.mjs`, `corrupted-wolf.mjs`; 독립3387 public 파생 소비자 |
| 실제 대화 | 기존 `createRiftDialogue` controller의 snapshot을 관찰. `trialFlags` 4 / `trialRecords` 2 / `view.options` 8 / prototype 검사 16단계 / id 96자 |
| 포즈 | 3 actor별 `createDialoguePoseArbiter`; 기존 `createVisualPoseConsumer`만 import. run 1.55 / walk 1 / facing 0..7 / 기존 phase·attackDuration·top-level attackRemaining 유지 |
| 대화 수명 | open 또는 UNKNOWN은 idle, 옛 공격 폐기. close/actor변경/blur/reset 뒤 새 입력 허용. canvas→대화 선택지 blur는 close하지 않음, window blur는 close+release |
| 대화 관측 | `linked/stateKnown/supported/isOpen/scope/sessionOnly/view/trial/providersUnknown` frozen. accessor/throw/thenable/잘못된 구조는 UNKNOWN+null, getter 실행0 |
| 실제 보상 | `editor-session-only`, `actualGrant:false`, `committed:false`, `committedPromoted:false`, `grant/reward/save:null`. 본편 지급·저장 채택0 |
| 늑대 | skin `corrupted_wolf`; JSON2+PNG16 실제bytes/fullSHA/IHDR→ImageBitmap→원본RGBA 셀→Three DataTexture. raw placeholder Texture 경로는 직접 채택0 |
| 늑대 셀 | cell256 / cols8 / rows5 / idx13 / col5 / row1 / framesPerMob4. idle2048×1280 / walk8192×1280. 8방향 `south,south-east,east,north-east,north,north-west,west,south-west` |
| 늑대 frame | 방향 모두 walk0,1,2 유효 / walk3 빈 셀. alpha>16인 픽셀0이면 같은방향 검증된idle0로 fallback; alphaTest .01 |
| 늑대 timing | native walkDistance 128/프레임; 거리 미제공 lab previewFps6. 원JSON metadataFPS UNKNOWN, 임의로 sourceFPS6 선언0. previewFps>0·≤60; update dt finite≥0·최대.05초 사용 |
| 늑대 표시·자원 | displayHeight .36 시험값 / 셀 하단 중앙 배치 / anatomical foot·referenceHeight UNKNOWN. loadConcurrency2; 256² RGBA DataTexture32 / 8,388,608B / atlas16close / liveAtlasBitmaps0 |
| 늑대 재질 | Linear mag/min, ClampToEdge, mipmapsfalse, colorSpaceSRGB, bottom-up 복사·flipYfalse, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse |
| 공통 정렬 | actor/resident/전경/늑대=`30+(footY-4320)/8000*10`. 새RAF/timer0; 기존 lab RAF1만 소비 |
| 시험 배치 | root 시작5480,3740 유지; 늑대는 캐릭터 주변 offsets `(180,100),(-180,100),(180,-100),(-180,-100),(0,180),(0,-180)` 중 canWalk radius12가 true인 첫 위치 |
| 새 UI | `wolf-visible/wolf-mode/wolf-facing/wolf-near/wolf-status`, `dialogue-session`. 늑대8방향 idle/walk·현재캐릭터옆 배치·유품/부탁 각개수 표시; 리프만 textContent |
| 의미 검수 | observation/pose 최초14중6PASS·8FAIL(배열 descriptor 오류); 제품1행수정 후 실패8+가려진 index-getter1=9PASS, 성공6재실행0. wolf새17/17PASS |
| 실WebGL 검수 | 이번 새고유25유효PASS=첫11+대화10+수명4. Chrome/3387 실제PNGdecode·8dirGPU·3actor R대화·선택click·유품·부탁·run·blur·reset. pageerror/consoleerror/HTTPerror0 |
| 보존된 검사 실패 | 첫 harness 방향 기대 `E`≠실제`east`; 후속 walk setup 누락 timeout(0검수); `pose.running` 없음으로 false FAIL. source/pose 실제결함으로 둔갑0; 한정 후속에서 수정된 기대 검수 |
| 영상 | Playwright ffmpeg 미설치로 페이지 생성 전 UNAVAILABLE/검수0. 설치0. 실제 스크린샷은 별도 성공; 영상 생성 주장0 |
| 시각 판정 | 실제 start·베린 유품·네사 부탁 화면 열람. 캐릭터/주민/늑대 표시와 대화는 관측; 큰1254²판 확대흐림·절벽재질/접합·해부학적발·전체stageCamera 미인수. VISUAL VERDICT RETOUCH |
| 다음 실제 작업 | owner Claude8만 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP` 송신/peer/firstsource 확인. 선택주민 접근점→2.5D previewPort 실행 adapter 제작; root editorbutton/labport/GUI 검수는 다음 최소단위 |
| 원자료·Git 범위 | raw52는 48fa4a43f95541ec3a1c9cc55c650aefdba2185a remoteexact로 미채택보존. 이번 root code5+관련docs20만 정상checkpoint; PNG/scene/nav/game/index/save/foreign68/보호2_3불변 |

| NPC id | 실제 flag | 관찰하는 trial record | 적용 범위 |
|---|---|---|---|
| rift-rest-haran | rift.haran.met | 없음 | 실제 R/닫기 후 session flag |
| rift-gift-berin | rift.berin.giftGiven | gift / story.berin.keepsake / actualGrant:false | 유품 선택당 최대1, 재진입 중복0 |
| rift-request-nessa | rift.nessa.questAccepted | quest / story.nessa.findLin / actualGrant:false | 부탁 수락 최대1, game quest 등록0 |
| rift-prepare-dorik | rift.dorik.met | 없음 | 기존 위층 안내 / 실제 gate 전환0 |

| root owned code | bytes | fullSHA256 |
|---|---:|---|
| tools/2_5d-world-lab.mjs | 27959 | `efccd3adca2af8fecfa72327ea2ed1f7c4afa34f113f629dce4b0367ba73f2e7` |
| tools/2_5d-world-lab.html | 11829 | `72619d05fe7f92200b40d209320b452e4b5d1c4a9b53d617df2f6fedd79fc06a` |
| tools/2_5d/dialogue-observation.mjs | 9830 | `3a08185ffa567736fe9c4333e6a2fd293261842becced48e0b13d4370fc836a5` |
| tools/2_5d/dialogue-pose.mjs | 5937 | `5ff101af0e891c9be279212dab503ff583da4f92bfda6abe44b74c6a624f262a` |
| tools/2_5d/corrupted-wolf.mjs | 20662 | `ac3fd86a5441c84cd477a716e86af8cec92b61589781a8296b4b59acdec17acc` |

| 새 실제 근거 | 경계 |
|---|---|
| npc-wolf-browser-result.json | 새11유효PASS + 방향 expected-label harness FAIL 보존 |
| npc-wolf-dialogue-followup-result.json | walk설정누락 timeout / 실제검수0 |
| npc-wolf-dialogue-actual-result.json | 새10유효PASS + pose.running 없는 harness FAIL 보존 |
| npc-wolf-lifetime-result.json | 한정 신규4PASS / page·console·HTTPerror0 |
| npc-wolf-start.png / npc-wolf-final-motion.png | 실제PNG GPU·전사와늑대 표시 / foot UNKNOWN |
| npc-wolf-berin-gift.png / npc-wolf-nessa-request.png | 실제controller 유품/부탁 선택·3actor dialogue 수명과 구분 |
| npc-wolf-video-unavailable.json | 영상FFmpeg 미설치 / 설치0 / 실제페이지생성·검수0 |

```text
MAP PRODUCTION REPORT
STAGE: 지옥의 틈 / 독립3387 / ROOT-RIFT-NPC-WOLF-CONSUMER-20261007
MASTER PLAN: 승인 비대칭 계곡 silhouette·8000²regions·남도착/양측균열/북상승 route·기존side spaces 유지.
OUTER MASS: left/right/top/south 큰바위·뿌리·계단/중앙심연 유지; 물리높이UNKNOWN.
LARGE ASSETS: cleanplate1254²/심연1920²/전경3 exactcrop 유지. 같은지형에 기존늑대1 표시; 새scatter0. 확대흐림RETOUCH.
MEDIUM CONNECTION: cliff/valley mouth/holes geometry불변; 새접합 제작0.
GROUND CONNECTION: 기존actor/resident그림자/groundDetail3/period320/alpha.4/nav-alpha 유지. 늑대셀바닥 표시기준≠실제발접촉.
PLAYABLE: nav1192/radius12 유지; actual run after dialogue 6180,5020→약6235,5020; 전투/획득/gate/사망/부활/재도전 미인수.
LANDMARK/CENTER: 중앙균열 primary / 북계단·동뿔 secondary / 원4주민·남서뿌리 tertiary 유지.
CAMERA QA: START원scene.start 미관측; EARLY/LANDMARK 5480,3740 / NPC베린5900,5580·네사6180,5020 실제열람. 3actor Haran 접근 관측. ARENA/SIDE-L/SIDE-R/LATE/EXIT 전체인수UNKNOWN.
TECH QA: route/collision불변; 새고유25 실WebGL 유효검수. pageerror/consoleerror/HTTPerror0. loading: JSON2+PNG16 실제pins; 새server/RAF0. 성능: cropped256²textures32/8,388,608B/liveAtlasBitmaps0, 전체FPS인수UNKNOWN.
FILES: root code5+docs20 / owner STATELOG4 별도 / 동시MAP adapter max1 별도. unrelated root0; foreign68/원자료/save/game/protected불변.
GIT: 완료소유 exactpins만 정상stage/commit/push; commit 자체SHA는 외부 npc-wolf-public-preservation-receipt.json의 remote exact값. deploy0.
VISUAL VERDICT: RETOUCH
NEXT PASS: 선택NPC editor→2.5D port 연결 / 큰지형흐림·전경재질·접합 / 최소본편consumer 및 native6·청취·보상save.
```


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

### 이번 정확 코드·원자료 핀

| 파일 | bytes | SHA256 | 채택 |
|---|---:|---|---|
| `editor.html` | 258258 | `9f3ef622a4f8d7399f404ea4a2c05e340af90c1332885614758b8d0931841294` | root public 구현·새실화면 인수 |
| `tools/2_5d-world-lab.mjs` | 31196 | `9a97b78d9db61e72158b2cf44733a233781e732ecc0a177966f5b7825b615867` | root public 구현·새실화면 인수 |
| `tools/2_5d/editor-preview-entry.mjs` | 7557 | `b26f9c07ee833b55363b9f4c6d6f4c3c6cbe86893593654567d82d53f662ed47` | root public 구현·새실화면 인수 |
| `tools/2_5d/editor-preview-host.mjs` | 12236 | `63085fb0fbccd03c3957495aa0bc34559d74399b5d119a05389281effbd4ed22` | root public 구현·새실화면 인수 |
| `tools/team-followup-20261007/hell-rift/MAP/editor-preview-entry-2_5d.candidate.mjs` | 6092 | `d4b805be94ae4a55901ecc6987221569b58e463d0b5d3d32933708af1c668c2e` | 미채택 원자료53/공식end 확인 |


================= MAP PRODUCTION REPORT =================
STAGE: 지옥의 틈 독립 resident-v2 · 실제 editor→2.5D preview 왕복
MASTER
- silhouette: 승인원화의 비대칭 심연 불변
- regions: 현행 정본 불변, 새 배치0
- main route: 남쪽START→북쪽EXIT 원계약 불변
- side spaces: 네 주민의 기존 접근점만 소비
OUTER MASS
- LEFT: 원서측 절벽 보존
- RIGHT: 원동측 생체절벽 보존
- TOP: 원상승로 보존
- SOUTH: 원진입지 보존
- major holes: 현행무변, fullstage 재인수0
LARGE
- source assets: 원1254² plate/abyss·기존 주민/캐릭터
- composites: 기존전경3 보존
- overlap: 기존mask/UV 불변
- repeated silhouette: 이번 변경없음/미인수
MEDIUM
- connections: 이번 변경없음
- remaining holes: 절벽/전경 seam RETOUCH
GROUND
- shadow: 기존renderer 보존
- contamination: 기존재질 보존
- structure integration: 원판 확대흐림 잔여
PLAYABLE
- main arenas: 독립 접근점4/전투arena 인수0
- travel space: 실제Haran freshWASD/닫기 경로관측
- breathing space: 기존불변
- threat space: 기존불변
- combat readability: 실제전투0/기존대화idle·공격취소 보존
LANDMARK
- primary: 심연과상승로 원보존
- secondary: 기존주민4
- tertiary: 새장식0
CAMERA QA
- START: canonical5480,3740 초기발복원3명관측/본편START 인수0
- EARLY: Haran접근4700,6660 canvas/modal 실PNG 열람
- ARENA: 새인수0
- SIDE L: 전체board 미인수
- SIDE R: Berin/Nessa접근실진입; 전체board 미인수
- LANDMARK: 추가검수0
- LATE: Dorik5220,2460 진입관측
- EXIT: native미인수
TECH QA
- route: 선택주민4의actualprepare/nearest/navradius12
- collision: scene/nav1192 쓰기0/별도collision변경0
- pageerror: 0
- 404: 0
- seam: 신규미인수/RETOUCH
- loading: sameorigin iframe4/load→ready/최대30000ms/취소
- performance: 추가RAF0/성능bench 미실시
FILES
- stage-owned: public4+완료raw1 / 관련docs17
- concurrent touched: 기존foreign68/ownerSTATELOG4 보존
- unrelated touched: 0
GIT
- staged: 위소유code+docs만 정상checkpoint
- commit: 정상새commit/정확SHA외부영수증
- push: 원격ref exact검증은외부영수증
- deploy: 0
VISUAL VERDICT: RETOUCH
NEXT PASS: 맵재질/절벽접합/8camera/실발/최소본편/NPC실보상save/native6/청취


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

지옥의 틈 독립 2.5D slice를 표시하는 main-context용 iframe host의 현재 실행 계약을 추가한다. 앞선 원화/지형/선택NPC preview 기록은 당시 구현 이력이며, 아래 host 완료가 전체 맵·본편 전환 완료를 뜻하지 않는다.

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

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 — resize 시 현재 DPR 재평가

이 절은 독립3387 lab의 DPR 갱신 구현 상태다. 직전 해상도 원인 표의 “lab resize DPR 재평가 미구현”은 수정 전 source 관측으로 보존하며 현재 상태는 아래 표를 따른다. 원판1254² 확대 흐림·2D maskedPicture1024 버퍼·contact ON 시각 FAIL/defaultOFF는 별개의 경계로 유지한다.

### 선행 문서·수정·수명 계약

| 항목 | 실제 현재 계약 | 보호·미인수 경계 |
|---|---|---|
| 이번 TASK 선행 | _MAP_SSOT_INDEX 전체1…961행, EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 처음부터끝, AGENTS 전체, CH1_1_BLOCKOUT_MASTER의 LOCK 전체를 이번 구현 전 실제 다시 읽음. 출력 잘림 구간은 재독하여 누락을 보완 | 이전 TASK 읽기를 이번 선행 Read로 소급하지 않음. 독립 틈의 현재 정본·원본핀 우선, CH1 원본 LOCK·보호2_3/Q전용·어택티켓금지 유지 |
| 소유 코드 | tools/2_5d-world-lab.mjs의 resize()에3줄 추가, 현재33105B/SHA 2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12 | init·shader·terrain·nav·원화·child키·host/gate·기존 JSON·main/game/save 쓰기0 |
| DPR 입력 | resize마다 globalThis.devicePixelRatio를 현재값으로 읽음. typeof number·Number.isFinite·값>0인 경우 Math.min(값,2), 나머지1 | 유효 양수 소수는 반올림/최소1 강제0. undefined·문자·NaN·Infinity·0·음수는 fallback1. 새 옵션·저장값0 |
| 적용 | renderer.getPixelRatio()가 새 pixelRatio와 다를 때만 renderer.setPixelRatio(pixelRatio). 그 뒤 기존 setSize(width,height,false) 유지 | 같은 DPR에서 pixelRatio setter 재호출0. 새 renderer/RAF/timer/ResizeObserver·DPR watcher 추가0 |
| 기존 초기화 | 초기 devicePixelRatio가 falsy면1로 대체한 뒤 cap2인 기존 초기 setter 유지. 최초 startup resize가 현재값에 위 엄격 검증을 적용 | 정상 browser DPR에서 초기화·resize의 cap2 정책 동일. 초기 setter 줄 자체를 변경하지 않았으며 비정상 전역값의 초기 WebGL 생성 인수는 없음 |
| 크기·카메라 | parent bounding rect를 기존대로 Math.round하고 각 width/height 최소1. 기존 setSize(...,false), 정사영 기본 높이3.5·half1.75·50°/scale400·zoom100% 그대로 | scene/world8000²/nav1192/UV/sourcecrop/주민발/start/exit·화면비율/등록 변경0 |
| 갱신 진입점 | 기존 ResizeObserver 또는 확대 range input이 resize를 호출할 때 DPR 갱신 | CSS 크기가 그대로인 모니터 이동/DPR만의 변화가 기존 observer를 자동 깨우는지 미인수. 별도 window resize/matchMedia listener·polling 추가0 |

### 이번 신규 실제 Chrome 실험1회

설치된 Google Chrome을 headless로 launch1/context1/top editor page1/lab iframe1 실행했다. origin은 127.0.0.1:3387이며 기존 서버를 사용했다. fresh editor 위 QA iframe에서 실제 lab module을 로드하고 대기 pose를 정지한 뒤 CDP Emulation.setDeviceMetricsOverride의 실제 deviceScaleFactor를 바꿨다. DPR 전환 뒤 기존 zoom range의 input 경로를 호출해 resize를 실행했다. 이는 실물 모니터 이동이나 브라우저 UI 줌 자동 이벤트 인수가 아니다.

| 관측 | 현재 window DPR | renderer 기대 배율 | canvas·GL drawing buffer | CSS·안전 조건 |
|---|---|---|---|---|
| CDP1 | 1 | 1 | 1036×714 | 실제 canvas CSS1034×712.46875, parent1036×714.46875·logical1036×714 |
| CDP2 | 2 | 2 | 2072×1428 | CSS·원pose·source 등록 동일 |
| CDP3 | 3 | cap2 | 2072×1428 | DPR>2에서 최대2 유지, 신규 GPU resource 추가 선언0 |
| CDP 소수 | 1.25 | 1.25 | 1295×892 | Three backing 차원 floor 때문에 Y실측892/714=1.2492997198879552; 소수 DPR을1로 자르지 않음 |
| WebGL | 위4관측 각각 현재13개 program | 모두 actual gl.LINK_STATUS=true | GLerror0/contextLostfalse/readytrue | shader snapshot 등록 플래그만으로 LINK PASS 대체0 |
| 오류·요청 | pageerror0/consoleerror0/HTTP400이상0 | 외부요청0·nonGET0 | 새 API/save 호출0 | 사용자게임3333/3340·앱3381/3383/Windows·새 서버/빌드0 |
| 불변 | 전사5480/3740·idle·방향0·pausedtrue·zoom100, contactOFF | terrain snapshot exact동일 | editor scene JSON exact동일 | 원source/scene/nav/발·기존camera/source 보존 |
| fallback 별도 | 같은 launch에서 window DPR 값을 NaN/Infinity/0/−1/string/undefined로 임시 주입한6조건 | 모두 fallback1 | 1036×714 및 GLerror0 | synthetic invalid-value 관측이며 실제 장치 DPR6개로 계산0. 원 descriptor 복원 |
| 검수 묶음 | 새로운 DPR launch1에 CDP4단계+synthetic6조건, 제품 source 수정 뒤 syntax actual1 PASS | 실패0·이전 성공 suite/Chrome/native6 반복0 | DPR와 아래 parent lease 검사 합산0 | 새 repository 테스트·PNG source·asset 생성0 |

parent rect는 기존 border 포함 값이고 canvas CSS는 border를 제외한 실제 표시 크기다. ratio는 logical rounded dimensions와 실제 CSS denominator를 구분하며 정수 DPR에서 backing/logical 각1·2·2, 소수 Y는 floor 오차다. 새로운 정사영/world→CSS 배율 공식이나 Three zoom1.2를 editor zoom1.2와 같은 배율이라고 정의하지 않는다.

### 실제 화면·해상도·채택 경계

| 항목 | 확인한 값·판정 |
|---|---|
| 화면 근거 | dpr-resize/dpr-1-canvas.png·dpr-2-canvas.png·dpr-3-canvas.png를 작업자가 실제 열람. CSS 기준 screenshot1034×713 각1장. DPR2/3 캡처는759209B/SHA231773da6f5fb9f6b0b25731a757af97db6ee11731560a55353bdef843a258fe exact동일 |
| 화면 판정 | 전사·늑대·바닥·전경 배치 유지와 DPR buffer/cap 동작 확인. 원화 지면·뿌리의 확대 softness는 남음. VISUAL VERDICT: RETOUCH |
| 원화 밀도 | cleanplate1254²→world8000², 8000/1254=6.379585326953748worldpx/sourcepx. source PNG·UV·crop·정적 재질/절벽 depth 추가 수정0 |
| 별도2D 문제 | map-scene-editor.js maskedPicture 장축1024 임시 buffer와 alpha256 sample은 변경0. MAPraw62 prerequisiteFAIL·public 미채택 상태 유지 |
| 별도 실패 | arrival-detail 전체지형 등록 FAIL·contact ON 실화면 FAIL/defaultOFF 유지. 이번 DPR 통과로 접합/ground registration/physical height 개선 완료 선언0 |
| 미인수 | 실물 모니터 transfer·브라우저 UI zoom 자동전환·native6 여정/청취/실보상·영구save·본편 main 연결·장시간FPS·A급 인수0 |
| 전체 docs 검색 | 코드 수정 뒤 docs 전체 확장자 포함 DPR/devicePixelRatio/pixelRatio/2_5d-world-lab 및 해상도 키워드 검색141files/1035matches. own3 current appendix, 관련 root7문서 후속 인계, 타시스템/ownerSTATELOG/과거 영수증은 보존 |
| 외부 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/dpr-resize/receipt.json, browser-result.json, screen-review.json, syntax-result.json, docs-keyword-search.txt, docs-search-disposition.json. 코드·문서 수정전 exactbytes backup 및 prefix 대조 |

### 별도 public parent 입력 lease의 현재 경계

아래는 root가 별도 구현·검수한 입력 소유권 도구다. DPR 코드가 이 모듈을 import하거나 main 입력·simulation을 정지시킨 것이 아니다. 상세 정본은 [키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md) 및 [총괄 마스터](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 ROOT-RIFT-PARENT-INPUT-LEASE-20261007 계약을 따른다.

| 항목 | 정확 현재 public 계약·미인수 |
|---|---|
| 파일·출처 | tools/2_5d/rift-parent-input-lease.mjs12058B/SHA01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676. raw SKILL63/ENEMY64 semanticFAIL 원문보존·direct raw importfalse |
| factory·입력 | createRiftParentInputLease({ports:{readOwned,clearHeld}}). readOwned는 동기 own-data plain {owned:boolean,epoch:safe integer≥0}; authoritative root job epoch, host token/G.revision으로 추정0. readPolicy·suppression 함수는 fresh 소유권 재검사 |
| 해제·실패 | 명시적 현재 inactive만 parent passthrough. owned/unknown/stale/disposed는 input/update/gamepad/facing/자동전환 차단 판정. 최초 owned epoch마다 clearHeld 동기1회·undefined/true만 성공. callback의 this=ports 보존; Promise/throw/truthy는 성공0 |
| 수명·의도 | host 닫힘/dispose만으로 root lease 해제0. classifyProjectedEvent는 advisory only·DOM dispatch/preventDefault/focus를 직접 조작0. root caller의 actual main hook/held release/gamepad 재동기화는 미연결 |
| 검수·인수 | root의 새 stdin1회16groups/288conditions PASS16·FAIL0·exit0. 문서 worker 재실행0, 이번 DPR launch와 합산0. timers0/RAF0/parentState·save·reward 쓰기0/nextStage 호출0/mainAcceptedfalse/nativeAcceptedfalse |

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·판정 |
|---|---|
| STAGE | ROOT-RIFT-LAB-DPR-RESIZE-20261007. 기존 lab resize DPR 업데이트+docs3, parent lease는 별도 완료 경계 인용 |
| MASTER | silhouette/regions/main route/side spaces 기존 유지·설계 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major opening 원화 유지·새 질량 배치0 |
| LARGE | source1254 plate/3전경 composites/crop/overlap/repeated silhouette 유지 |
| MEDIUM | connections/remaining holes·절벽 접합 변경0 |
| GROUND | shadow/contamination/structure integration 기존 유지, 원source 확대흐림 잔여·contact ON FAIL/defaultOFF |
| PLAYABLE | 기존 nav1192 travel/breathing 유지. arenas/threat/combat readability 본편 인수 PENDING·새 native 여정0 |
| LANDMARK | primary 상승문/secondary 균열/tertiary 주민·발 불변 |
| CAMERA QA | 동측 전사5480/3740·zoom100%·CSS고정 DPR1/2/3 화면 실제열람. START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 전체8camera 신규검수0 |
| TECH QA | actual CDP4+synthetic6, GPU13link/error0, syntax1; route/collision/원pin보존. seam 개선·loading 전체회귀·장시간performance 신규인수0 |
| FILES | 소유 lab.mjs resize3줄+기존docs3 append만. concurrent/unrelated 원본source/assets/editor/terrain/game/save/STATELOG 쓰기0 |
| GIT | worker stage/commit/push/deploy0. root가 검수완료code1+docs3 범위 checkpoint·원격exactSHA 기록; 이 절로 push 성공 추정0 |
| VISUAL VERDICT | **RETOUCH**. DPR buffer 갱신 PASS와 원plate1254² 흐림/절벽 접합·본편 미인수 분리 |
| NEXT PASS | 원등록 보존한 고해상도 source 상세·2D buffer 별도 A/B, 실물 DPR 이벤트 수명 및 main input lease 실제caller/update/gamepad Gate·native6/save/audio |

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 부록 — parent lease 최종 핀과 제한 보정 이력

직전 절의 parent lease **12058 B / `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676` 및 16그룹·288조건 PASS는 초기 버전의 검증 이력**이다. 아래가 현재 public 최종 핀과 그 버전에 대한 제한 보정 근거다. 초기 16그룹을 최종 버전에서 다시 실행한 것으로 취급하거나 DPR Chrome 실험과 합산하지 않는다.

| 구분 | 정확한 근거와 결과 | 현재 해석 |
|---|---|---|
| 최종 public 파일 | `tools/2_5d/rift-parent-input-lease.mjs` **12294 B**, SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | root의 최종 구현 핀. 이 문서 보정 담당은 코드 수정·검사 재실행 0 |
| 초기 전체 검사 | 초기 12058 B 핀에서 신규 stdin 1회, 16그룹·288조건 PASS16/FAIL0/exit0 | 기존 검증 이력 그대로 보존; 최종 버전의 전체 검사로 승격 0 |
| 새 제한 검사 최초 실패 | 별도 제한 stdin 1회의 첫 단계 PASS0/FAIL1, 도달 조건 3, unhandled rejection **1** | `readOwned`가 거절된 native Promise를 반환할 때의 실패를 보존. 첫 단계만의 별도 프로세스 exit는 없음 |
| 백업과 최소 보정 | 외부 `parent-input-lease/before-rejected-read-owned.mjs`에 초기 소스 보존 후 제품 코드 보정 **1회** | 원자료 후보·gate·다른 작업자의 파일 변경 0 |
| 같은 제한 stdin의 후속 | 6개 고유그룹·33조건 PASS6/FAIL0/미도달0, **새 unhandled rejection 0**, 전체 프로세스 exit0 | 최초 실패를 지우거나 무상 PASS로 합산하지 않음. 초기 전체 suite 재실행 0 |
| 실제 stdin 실행 수 | 초기 전체 1회 + 새 제한 1회 = 총 **2회** | 새 제한 프로세스 안의 최초 실패/보정/후속 단계를 별도 stdin 실행으로 세지 않음 |
| Promise 처리 경계 | 캡처한 same-realm native Promise prototype, own `constructor` 없음, native prototype constructor 및 캡처한 species getter가 유지된 경우만 거절 관찰 | 동기 ownership은 계속 UNKNOWN. own `then` getter를 실행하거나 비동기 결과를 소유권으로 채택하지 않음 |
| foreign/비정상 Promise | foreign Promise/일반 thenable은 raw `then`을 실행하거나 채택하지 않음. 해당 foreign 검사는 fulfilled Promise와 getter 실행 0을 확인 | hostile foreign 또는 constructor-accessor의 **rejected** Promise를 안전하게 관찰했다는 주장 0 |
| 본편 경계 | parent main hook 0, 실제 gamepad·native·main game·save·reward 인수 0 | root job/epoch의 권한 계약과 동기 `undefined`/`true`만 허용하는 held-clear 계약 유지 |
| 독립 DPR 결과 | DPR code **33105 B / `2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12`**, syntax 1회/실제 Chrome 실험 1회 | parent lease 제한 검사와 별도. source 1254²→world 8000² 확대 흐림과 실물 모니터 전환 미인수 유지 |

근거는 외부 `parent-input-lease/final-receipt.json`과 `parent-input-lease/rejected-read-owned-limited-result.json`이다. root의 관련 키워드 전체 검색은 `rift-parent-input-lease`, `readOwned`, `observeNativeRejection`, `nativeThen`, `unhandled`, `rejection`, `RIFT-MAIN-GATE-PUBLIC`로 **41파일·210매치**를 보존했다. 다른 시스템·owner 이력은 역편집하지 않는다. 정확한 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md)과 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 root 정본을 따른다.

**MAP PRODUCTION REPORT 부록:** 변경 단계는 위 DPR/parent lease 검증 이력의 문서 동기화뿐이며, master·outer mass·medium/ground connection·playable/combat·landmark·small detail·카메라·geometry·nav·원화·주민 발·소스 등록의 새 변경은 0이다. 새 화면/단위검사/실게임/오디오/저장 인수 0, worker Git 변경 0. 직전 §23의 DPR 실제 화면 관찰과 전체맵 판정을 그대로 유지한다. **VISUAL VERDICT: RETOUCH** — parent lease의 실제 화면은 NOT ASSESSED, 전체맵 원본 확대 흐림은 미해결이다.

## ROOT-RIFT-CHILD-LIFETIME-20261007 — 로딩 중 페이지 종료와 늦은 자원 수명

현재 `tools/2_5d-world-lab.mjs`는 renderer 생성과 무거운 첫 top-level await 이전에 pagehide를 등록한다. 로딩 중 종료는 초기화를 폐기하고 늦은 소유 자원을 해제하며, 닫힌 페이지의 scene·DOM·ready·RAF를 다시 활성화하지 않는다. 독립 child lab의 수명 보강이며 parent input lease/main 훅, 맵 선명도, 원화, native 플레이 완료와는 별개다.

| id / 적용 위치 / API | 정확 현행 구현 | 경계·불변 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-20261007; `tools/2_5d-world-lab.mjs` **36039 B**, SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 조기 pagehide·dispose·async-init 수명·읽기 전용 진단만 변경. 원 PNG/scene/nav/renderer 수치·DPR 3줄 변경 0 |
| 선행 읽기 | AGENTS 26076 B/`fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4`; guide 18392 B/`607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b`; LOCK 39679 B/`94081b2aef08771384fb2032dab42f12c3cde57227558f8a11b772690e13451a` | 직전 전체 완독 핀과 동일함을 이번에 확인. SSOT 이전 전체 156633 B prefix도 동일, 추가 11017 B는 이번에 전부 읽음. 현재 SSOT 167650 B/`a588deb05dac1a8e57f6f235d95afce69fcfc2841ac137679a8872e2360fcfa0` |
| early pagehide | `window.addEventListener('pagehide',dispose,{once:true})` 1개를 renderer 생성·terrain await 전에 등록 | 모듈 평가가 시작된 이후의 수명. 아직 모듈을 실행하지 않은 의존 모듈 다운로드 구간에 리스너가 있다고 주장하지 않음 |
| epoch / ready | lifecycleEpoch=0 / initializationEpoch=0. 최초 dispose는 disposed=true·ready=false·epoch+1·anchorJob=null·keys.clear·attackQueued=false를 외부 cleanup보다 먼저 적용 | 반복 dispose는 즉시 반환. epoch·해제 시도 추가 0, 폐기한 페이지에서 초기화 재개 0 |
| `releaseResource(resource,release,kind)` | object/function identity를 해제 시도 전에 WeakSet에 기록. 같은 identity 시도 1회; 각 release는 독립 try/catch | 한 자원의 throw가 이후 다른 해제를 막지 않음. throw한 같은 자원 재시도 0. cleanupFailures는 잡힌 해제 예외 수이며 GPU-free 성공 수가 아님 |
| 해제 대상 | observer.disconnect, reduced-motion listener 제거, effects, helper geometry/material, wolf abort, wolf, rigs, specialMotion, contactUnderlay, terrain, shadow geometry/material, renderer, interactionCue, residents, dialogue.close('pagehide') | 존재하는 자원만 시도. factory 내부 세부 자원과 실제 GPU 해제는 factory/브라우저 검수 경계. 강제 context-loss API 추가 0 |
| `takeInitialized(resource,kind)` | epoch 일치·disposed=false일 때만 소유 변수에 대입. 늦은 resource는 lateResourceRejected+1, release 시도 1회 뒤 종료 오류 | terrain/contact/residents/각 rig/special/wolf await 결과에 적용. 늦은 결과를 scene에 추가하거나 ready로 승격 0 |
| 비자원 await guard | canonical fetch·arrayBuffer·assessRegistration, STORY fetch·arrayBuffer·SHA digest 뒤 `ensureInitialization()` | 뒤늦은 Promise 완료 후 다음 초기화 진행 0. 새 polling/타이머/RAF/파일·세이브 쓰기 0 |
| async scene attachment | resident/special factory에만 `initializationScene` add/remove 전달. add는 epoch·disposed 확인 후 종료 상태 거절; remove는 기존 scene.remove로 해제 허용 | factory 내부 늦은 scene.add도 차단. factory 자체 해제는 caller release count와 별도. source/world/geometry/nav 등록 변경 0 |
| fail / 최종 등록 | fail(error)는 disposed이면 UI·오류 상태를 다시 쓰지 않음. ready 승격 직전 epoch 검사. 폐기 상태에서는 후단 키 이벤트와 `__rift25Lab` 신규 노출도 수행하지 않음 | 살아 있는 페이지의 실패 UI 유지. child 폐기로 parent root job/epoch 권한 해제 0 |
| readonly 초기 진단 | 첫 await 이전 `window.__rift25Lifecycle=Object.freeze({snapshot})`. snapshot은 새 frozen record와 새 frozen counts 반환 | ready:boolean, disposed:boolean, frames:number, raf:boolean, epoch:number, cleanupFailures:number, rendererCreated:boolean, lateResourceRejected:number. mutable release 함수·renderer·자원 handle 노출 0 |
| `disposeAttemptCounts` | 시도한 kind별 nonnegative integer: observer, reduced-motion-listener, effects, helper-geometry, helper-material, wolf-abort, wolf, rigs, special-motion, contact-underlay, terrain, shadow-geometry, shadow-material, renderer, interaction-cue, residents, dialogue | 미시도 kind는 필드 없음. rendererCreated는 생성 여부라 disposed 뒤에도 true일 수 있음. count는 시도 횟수로 실제 GPU/native 인수가 아님 |
| 늦은 자원 진단 | lateResourceRejected는 종료 뒤 takeInitialized 또는 guarded scene.add에서 거절한 횟수 | canonical/STORY bytes는 소유 GPU 자원이 아니므로 이 counter로 세지 않음 |
| 기존 렌더·보행 | 대표 foot5480/3740, nav1192, angle50/scale400, DPR cap2·양의 분수·invalid fallback1 기존 3줄 그대로 | source1254²→world8000² 확대 흐림, 2D mask1024, contact 기본 OFF·실패 이력, 본편/native6·오디오·세이브 미인수 경계 유지 |

### 제한 검수 이력 — 하네스 실패·성공 이력·최종 핀 분리

| 구분 | 실제 실행·결과 | 의미 |
|---|---|---|
| ANIM 메모리 선행 근거 | 공식 end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`, 2026-10-06T19:33:53.039Z. `animParentChildLifetime20261007LatestReceipt-root-observed.json`의 평탄 해제 체인 모델 3/3 PASS | 전문 memory 이력이며 새 public 제품 검사가 아님. 재실행 0, 실제 iframe/pagehide/GPU 미관측 |
| 제품 syntax | 초기 lifetime patch에서 node --check 1회 exit0 | 이후 add/remove guard·readonly 진단 추가. 최종 소스 parse/evaluate는 제한 VM 후속에서 검증; 최초 syntax를 최종 전체 런타임 인수로 승격 0 |
| 최초 actual-source VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`; 신규 의미 실행 1회, 10그룹 중 PASS5/FAIL5/110도달조건, exit1 | 5 FAIL은 mock STORY bytes가 빈 JSON이라 resident/rig/special/wolf 단계에 미도달한 하네스 결함. 제품 늦은 자원 실패를 관측한 것이 아님. 성공5 재실행 0 |
| 두 번째 Node 시도 | 외부 stdin 하네스 객체의 닫는 중괄호 누락으로 SyntaxError, 제품 도달0/검사그룹0/exit1 | tooling 실패 이력 별도 보존. 제품FAIL·제품 의미 실행으로 섞지 않음 |
| 제한 후속 준비 | 외부 `limited-followup.mjs` syntax-only 1회 exit0 | repo 새 검사 파일 0. 최초 성공5·DPR·memory3·host·interop·Chrome 재검사 0 |
| 최종 핀 제한 후속 | 36039 B 최종핀 actual-source VM 의미 실행 1회, 앞선 미도달5만 **PASS5/FAIL0/100조건/exit0** | 실제 immutable STORY 25940 B/SHA `be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc`. GPU·DOM·factory는 mock, 신규 readonly snapshot도 같은 후속에 검증 |
| 후속 확인 내용 | resident/special 내부 add 차단, warrior/silvertail/dark-druid 각 rig 경계, 늦은 wolf 해제, terrain/renderer/cue dispose 3개 throw에도 후속 해제, identity 1회·재폐기0·snapshot detached/frozen | 초기5+최종5를 같은 핀 전체10 PASS로 합산하지 않음. 110+100도 최종 단일조건 수로 합산 0 |
| 실행 총계 | 제품 소스를 실행한 의미 검수 2회. 하네스 parse 실패 포함 해당 Node 실행 3회. 제품 syntax1·외부 harness syntax1은 별도 | 실제 about:blank/pagehide·GPU 해제·WebGL은 root 단일 Chrome QA까지 PENDING. 이 담당 Chrome0/native0 |
| docs 전체 검색 | pagehide/dispose/async.init/수명/2_5d-world-lab/late terrain·rig·wolf 및 신규 epoch/adopt/scene/release 이름으로 **239파일·2649매치** | child-lifetime/docs-keyword-search.txt 원문과 docs-search-disposition.json 보존. own3 정확 추가, 다른 시스템·owner 역사·관리 정본은 root 소유로 역편집 0 |

외부 영수증·원 fullbytes 백업·최초 실패와 제한 후속 raw는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime/`에 있다. 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md), 전체 운영과 root 관측은 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 정본을 따른다. 예약 root job의 owned/epoch와 child 폐기는 별개이며 child dispose로 부모작업 재개를 허가하지 않는다.

### MAP PRODUCTION REPORT — §23 / child lifetime

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-20261007 독립 child lab async-init·teardown 보강. guide/SSOT/LOCK 선행, 최하층→상승 목표 유지 |
| OUTER MASS / LARGE | 원화·실루엣·opening·랜드마크·crop·UV·source 등록 변경 0 |
| MEDIUM / GROUND | 절벽 접합·고도·geometry·보행1192·주민 발·start/exit 변경 0 |
| PLAYABLE / COMBAT | 독립 lab 자원 수명만 보강. 본편 입력·전투·보스·Q 전용 magic 패링/E 불가·어택티켓 금지·보상·세이브 변경 0 |
| LANDMARK / SMALL DETAIL | 원 PNG·atlas·리깅·주민 스케일·모션 수치·조명·detail 변경 0 |
| CAMERA QA | 새 브라우저·8카메라·실 GPU·DPR A/B 실행 0. root 새 Chrome 관측 전 PENDING |
| TECH QA | 초기 의미1 PASS5/하네스미도달5 보존; 두 번째 tooling parse 실패 제품도달0; 최종 제한 의미1 PASS5/100조건/exit0. 성공 이력·memory·DPR·host·interop 합산/반복 0 |
| FILES | tools/2_5d-world-lab.mjs 지정 수명 구역과 own docs3만. 기존 docs fullbytes prefix100%+LF append/EOF LF1. 타인 WIP·전문 raw·game·STATE 쓰기 0 |
| GIT | worker add/commit/push/reset 0. root가 완료 code1+docs3 한정 checkpoint. 여기서 원격 보존 성공 추정 0 |
| VISUAL VERDICT | **RETOUCH** — 기존 전체맵 확대 흐림·경계 미해결. 이번 수명 실화면은 root 관측 전 NOT ASSESSED. pure PASS를 visual PASS로 대체 0 |
| NEXT PASS | root 단일 실제 Chrome에서 초기 await 중 about:blank/pagehide·ready/RAF 미부활·해제 시도 관측. 실제 GPU 해제·native 플레이·오디오·durable save 별도 |

## ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007 — 실제 child 수명 인수 / 최종 소스 동결

직전 ROOT-RIFT-CHILD-LIFETIME-20261007의 실제 브라우저 수명 QA PENDING은 아래 **한정 실제 Chrome 실험**에서 확인한 범위만 완료로 갱신한다. 최종 public 소스는 36039 B/SHA `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`로 동결되어 검수 중 제품 변경 0이다. 미완료 HTTP 응답 중 취소, OS/드라이버 물리 GPU 메모리 반환, 본편/native6·청취·저장 인수는 이 실험의 완료로 계산하지 않는다.

| 항목 / API·증거 | 실제 새 관측 | 인수 범위·제한 |
|---|---|---|
| 실행 / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007; 신규 Chrome 실험1/launch1/context1/parent page1/직렬 child document6 | 기존 DPR·VM·memory3·host·interop 검사 재실행 0. screenshot2, 새 harness 실행1, process exit0 |
| 고유 검수 | 신규 **6그룹 PASS6/FAIL0**, 관측 subcheck **21/21 PASS**, partialUnknown0 | 아래 수명 범위의 검사 상태. 물리 GPU 메모리 UNKNOWN을 전체게임 PASS로 승격하지 않음 |
| 정상 actual GPU 해제 | ready child를 실제 host.cancel 경로로 닫고 native pagehide 관측. cancellation frames13→late 후13, ready=false/disposed=true/epoch1/RAF=false/actual RAF pending0 | 이미 ready였던 lab port는 존재하지만 ready·draw·RAF·DOM은 부활하지 않음 |
| terrain 늦은 반환 | 실제 factory 생성완료 결과를 return gate에서 보류→실제 취소→gate 해제. lateResourceRejected1, actual dispose completion1, frames0→0 | source fetch 지연 요청100ms/관측103ms 뒤 반환 gate가 취소 지점. 미완료 응답 취소 실험이 아님 |
| residents 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | atlas fetch 지연100ms/관측102ms. 실제 주민 factory 사용, mock/source-regex 대체 0 |
| 첫 rig 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | 첫 rig 이미지는 browser cache를 재사용해 새 matching fetch 없음. 실제 factory 결과 반환 경계는 관측 |
| special-motion 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | dive 원화 fetch 지연100ms/관측102ms. renderer 업로드·렌더 전 결과 보류의 범위 |
| cleanup 예외 격리 | 실제 terrain.dispose를 먼저 실행한 다음 예상 예외1 주입. cleanupFailures1, 나머지 renderer/residents/dialogue 등 release 지속, frames6→6 | factory/GPU를 mock으로 교체한 예외 검사가 아님. 이미 실제 release를 호출한 뒤 주입한 throw임 |
| native 종료 / 비부활 | trusted native pagehide **6/6**; 각 child에서 종료 뒤 draw0/DOM mutation0/actual RAF pending0, ready=false/disposed=true/epoch1 | synthetic pagehide0. 여기서 native는 브라우저 DOM 이벤트이며 게임 milestone native6가 아님 |
| 실제 native GL delete | 정상 ready 해제와 예외 주입 해제 **각각** deleteProgram13/deleteTexture13/deleteBuffer38 | 두 그룹 수를 전체6의 단일 총량으로 합산하지 않음. GL delete 호출·JS dispose는 물리 GPU memory-free 증거가 아님 |
| 늦은 반환 GL 경계 | terrain deleteProgram0/texture0/buffer0; residents·rig·special는 각각 program5/texture0/buffer0 | 늦은 실제 자원은 gate 반환 전에 렌더/업로드하지 않았음. texture/buffer delete0을 driver allocation 부재·메모리 반환 인수로 해석하지 않음 |
| 오류 / 외부 쓰기 | pageerror0/consoleError0/HTTP error0/foreign request0/mutation request0/download0, native GL error 종료 전후 child6 각각0 | source18 전후 exact, editor scene·격리 storage 불변, productCodeChangesDuringQA0. 실험 worker repo/Git 쓰기0 |
| old realm 관측 | QA parent가 제거된 child의 readonly snapshot과 gate resolver를 의도적으로 보존하여 실제 pagehide 뒤 late return 관측 | 일반 discarded realm이 다시 실행된다는 주장 0. 생산용 mutable resource handle·추가타이머·RAF·scene/nav/source 변경 0 |
| readonly 진단 | 실제 `__rift25Lifecycle.snapshot()`의 ready/disposed/frames/raf/epoch/cleanupFailures/rendererCreated/disposeAttemptCounts/lateResourceRejected와 native draw/delete/pagehide 관측 | disposal count는 실제 시도 횟수. 강제 context loss·OS GPU 메모리 계측 추가 0 |
| 시각 관측 | actual ready canvas와 normal parent return의 실제 screenshot2 직접 검수. 한정 ready/return UI PASS | 전체맵 **VISUAL RETOUCH** 유지. source1254²→world8000² 확대 흐림·작은 raster 캐릭터 미해결, A급·맵 선명도·본편 완료 주장 0 |
| 실제 물리 GPU | physicalGpuMemoryFreeAccepted=false / **UNKNOWN** | native delete13/13/38이나 renderer.dispose1을 드라이버 메모리 반환으로 승격 0 |
| 본편 / 저장 / 청취 | actualMainGame=false, native6Accepted=false, audioAccepted=false, saveAccepted=false | main 연결·전투/획득/보스 사망·부활·재도전·durable save·청취 인수는 별도 |

정상 ready와 예외 주입 child에서 readonly releaseAttemptCounts는 observer1/reduced-motion-listener1/effects3/helper-geometry3/helper-material3/wolf-abort1/wolf1/rigs3/special-motion1/contact-underlay1/terrain1/shadow-geometry1/shadow-material1/renderer1/interaction-cue1/residents1/dialogue1을 관측했다. loading gate child는 당시 이미 생성한 자원과 늦은 해당 자원만 각각 시도1이며, 미생성 자원의 count를 만들어 채우지 않는다. loading 4개 child에서 lab port 신규 노출은 false, 정상·예외 ready child는 기존 port가 true인 채 disposed/ready=false를 유지했다.

### 독립 증거·이력 핀

| 증거 | 정확 bytes / SHA256 | 구분 |
|---|---|---|
| public source | 36039 B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 브라우저 actual6/21과 최종 VM5/100은 같은 소스라도 **서로 다른 검사**로 유지 |
| acceptance-summary.json | 11120 B / `d7d5b4df81b6c70c8bacee8ec0828bb8470e170a16b8ae5f4278f5701e275bb4` | 신규 actual Chrome6/21 요약 |
| raw-result.json | 84980 B / `9a6b60b96fe30a81fc6672bfc7734f82cf16171a9b6619c7fcf92b28c23a0da5` | 실제 native event·GL·source18·gate 원 관측 |
| map-production-report.txt | 2601 B / `82a591ad9eb945e3c3f4b9baa9f1e5ad4e229ab01010ff3f2f656cc3067eebb3` | §23 실제 수명 QA, VISUAL RETOUCH |
| actual-ready-gpu.png | 913111 B / `2e094e4b27c005382b17a13ae0d001730d762de55068266fcc8fbacb6f7baf14` | 실제 ready UI 화면 |
| parent-after-cleanup.png | 1242952 B / `ba81df0e7e7e99de9be6ea2b39311d51ad2da552fccc8798dccf5c875522b7e3` | 실제 parent return 화면 |
| 초기 prototype VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`: PASS5/하네스미도달 FAIL5/110조건 | 원 핀 이력 보존. 제품FAIL/현재 전체PASS로 바꾸지 않음, 재실행0 |
| 하네스 parse 실패 | 두 번째 Node 시도 제품도달0/그룹0/exit1 | tooling 이력 보존; actual Chrome 실패나 제품 의미검사로 합산0 |
| 최종 VM 한정 후속 | 최종36039핀에서 PASS5/FAIL0/100조건/exit0 | 최초 성공5 재실행0. 이 5/100과 actual6/21을 11그룹·121조건의 같은 검사로 합산0 |
| 전문 memory | end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`의 모델3PASS | 전문 이력과 이번 실제 소스/GPU 관측 분리, 재실행0 |

실제 QA 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime-browser/acceptance-summary.json`, `final-receipt.json`, `map-production-report.txt`다. 문서 담당은 이 결과만 읽어 own3에 원 fullbytes prefix100%+LF append/EOF LF1로 동기화했으며 코드·검사·브라우저·Git 실행0이다. 전체 docs 관련키워드검색은 ROOT-RIFT-CHILD-LIFETIME/__rift25Lifecycle/pagehide/deleteProgram/deleteTexture/deleteBuffer/physical GPU·GPU 메모리/2_5d-world-lab로 **69파일·535매치**, 원문과 파일별 disposition를 `child-lifetime-browser/docs-sync/`에 보존했다. 다른 root 관리·메인 문서와 owner 이력은 역편집0이다.

### MAP PRODUCTION REPORT — §23 / 실제 child 수명 QA 문서 인수

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007의 한정 실제 child 수명 인수. 기존 맵 SSOT·guide·LOCK·최하층 상승 목표 유지 |
| OUTER MASS / LARGE | silhouette·regions·main route·source18·원PNG/composite/crop·UV·opening 변경0 |
| MEDIUM / GROUND | 연결부·낭떠러지·shadow·contamination·geometry·nav1192·등록·foot·start/exit 변경0 |
| PLAYABLE / COMBAT | 실제본편/native6 인수0, arena/travel/threat/combat readability 새 검수0, 보상·저장·보스·보호2_3·Q-only/E 불가·어택티켓 금지 변경0 |
| LANDMARK / SMALL DETAIL | 기존 랜드마크·상승문·주민·소스·모션·detail 변경0 |
| CAMERA QA | 기존8카메라 반복0. 신규 ready/return 실제2화면을 QA가 관찰, camera 수치 변경0 |
| TECH QA | actual Chrome launch1/context1/parent1/child6, 새6그룹 PASS/관측21 subcheck PASS, trusted pagehide6/6/GLerror0, 늦은4 실제 자원 각 dispose1, 정상·예외 각각 native delete13/13/38, 비부활0 |
| FILES | 문서 담당 own docs3만 원문 prefix100% LF append/EOF LF1. 실제QA는 외부 계획/runner/raw/요약/화면만, code source36039/8388 동결 |
| GIT | 담당 stage/commit/push/reset0. root 완료소유 checkpoint 담당, 여기서 remote 성공 추정0 |
| VISUAL VERDICT | **RETOUCH** — 한정 ready/return UI PASS와 전체맵 판정 분리. 물리 GPU 메모리 UNKNOWN/본편·native6·audio·save false |
| NEXT PASS | root 실제 본편 연결·게임6단계·오디오 청취·save/reward 인수. 신규 수명6/21 또는 옛 성공검사 재실행0 |


## 2026-10-07 ROOT-RIFT-MAIN-SEAM: 정상 전환 소스 연결과 신규 소비자 화면

| id·적용 위치 | 현재 값·구현·인수 경계 |
|---|---|
| ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 | game.html 4050426B / SHA256 ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230; tools/2_5d/main-rift-runtime.mjs 7519B / SHA256 b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69. 初期 game4039085B/4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd bytebackup 및 최종15접점 역변환 원문 exact |
| 실행 범위·원 DEMO | location.origin === http://127.0.0.1:3387일 때만 lexical root 소비자 활성. 정상 _proceedNextStage clear-route에 소스 hook 구현, 사용자3333/3340/file 경로 동작과 기존 demo terminal nextBtn은 유지. _DEMO_MODE=true/_DEMO_LAST_STAGE=0 기본 CH1-1은 terminal branch를 우회하지 않아 허브 진입 PENDING |
| 실제 capture·admission | _rootRiftBegin 이전의 P/G/player/context/stage/_charId/_charIdx/difficultyOff=(G._stageDiffOff??0)/difficultyIndex=(OPT.diff??5)/save=dbSave/saveReady=_dbReady/status=P.s/previousOn=G.on을 root job에 보존. stage safe integer>=0, hp finite>0, stageCleared===true/bossAlive===false·charIdx범위·MAX_SAFE_INTEGER epoch 경계·dead/fallen/reviving/lastStand 차단. 정상 clear의 G.on=true 및 _bossArena=true 자체를 오인 차단하지 않음. G.on=false 전환 뒤 held clear, 기존 dbSave 호출1 await 및 import·enter 뒤 동일 capture 검사 |
| input·epoch | _rootRiftEpoch/job이 권한 정본. _clearHeldInput 이후 _gpClearAll, _gpSynced=false·axes0·G._gpAiming=false. held restore0. update 맨앞(systemLesson/panelkey 이전), gamepad poll/inject/direct WASD/facing/autoAim, autoNext·nextStage에 lease guard. parent capture quarantine은 legacy gameplay 이벤트를 차단하고 host native modal 컨트롤 및 자기 Continue를 허용. init-stage/boot-loading/retry/char/lobby/hidden/pagehide에서 matching-job 무효화; advancing 중 자기 init-stage/boot-loading은 예외 |
| runtime API | createMainRiftRuntime({window,document,ports}); ports own functions readOwned/clearHeld/isCurrent/readHostContext/readGateState/schedule/release. enter(captured), continueStage(), parentEvent(event), block(channel), finished(captured), cancel(reason), dispose(), snapshot(). foundation publichost17683/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38·gate16280/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd·lease12294/d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1은 변경0 |
| Continue·5000ms·900ms | 자기 leaf button '위로 올라가기 · 다음 구역', click·Enter/NumpadEnter/Space 명시동작만 continue. gate.restore()/dispose()로 hostUI만 닫고 gate.cancel0; rootowned는 예약5000ms 동안 유지. 현재job 검사→gate one-shot commit1→현재job 재검사→기존 nextStage1. 성공한 fade900ms는 별도 curtain epoch와 boot epoch로 보호. parent Escape 등 advanced 이외 matching-job release는 자기 curtain RAF/wait/hide를 즉시 cancel; queued old callback이 새job/새curtain을 취소하지 않음 |
| 상태·캐릭터 | readHostContext {player:P,character,stage:G.stage,context:G,on:G.on,stageCleared,status:P.s}; readGateState {stage,stageCleared,status:'clear-continue',difficultyOff,contextId:epoch}. character는 _charIdx===1이면 silvertail, 그 외 warrior인 host admission 문자열이며 child P/char 연동 인수가 아님. runtime snapshot.mainSeamConnected=true는 소스 연결 상태; actualStageAdvanceAccepted/childCharacterLinked/saveAckAccepted=false, save/reward/RAF/timer0는 runtime 자신 범위. classicgame curtain timer는 위 별도소유. __riftMainIntegration.snapshot()의 durableSaveAccepted/demoHubAccepted/childCharacterLinked=false |
| source 검수 이력 | 구 game4050167B/f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3에서 신규 source9그룹133조건 PASS9/FAIL0/exit0. final ece8에서 matching-job Escape 취소 보정 신규 제한2그룹20조건 PASS2/FAIL0/exit0. 원9/133 재실행0/최종전체suite로합산0. 최초 syntax checker는 importmap JSON 오분류로 변경 main/module 도달 전 실패; 보정 checker의 main+module syntax PASS와 final 제한section parse를 별도 보존 |
| 신규 소비자 실제 DOM | ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007: 고유3그룹/15subchecks PASS/exit0, 실제 Chrome launch1/context1/QA부모page1/child3직렬. runtime의 실제 자기 Continue click·Enter 각각 hostUI/polltimer0·예약 rootowned/leaseblock 유지·지연 permissiontrue1/duplicatefalse1·모의advance1. 예약 중 trusted W downstream0, Escape release(parent-escape)1→oldcallback2false·모의advance0. publiccode5+원자료6 핀11 exact/gamefinal핀 전후 exact; pageerror/console/HTTP/외부·변경요청0 |
| DOM fixture의 한계 | QA 부모는 detached P/G/stage1 ports로 실제 runtime과 host iframe을 연결한 fixture. 실제 game.html·nextStage·5000ms/900ms·save·본편 held/gamepad/update·mobile 인수0. 이 신규3/15는 이전 host-gate interop4·source9/133·final2/20·child수명6/21과 합산·반복하지 않음 |
| 문서·외부 영수증 | API·save/input/editor 계약은 키바인딩/세이브/RIFT_DIALOGUE_PUBLIC_CONSUMER/HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/_MAP_SSOT_INDEX 정본6 및 lifecycle3·rootops6에 정확 동기화. 외부 main-seam-integration/rig-motion-implementation/final-receipt.json·handoff.md와 runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·runtime-owned-continue-ready.png·runtime-click-scheduled.png·runtime-escape-cancelled.png를 구분. 앞선 child 수명 code1+docs9 정상 보존 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f |
| 다음 승인 미완료 | 기본 demo1-1 종료→허브 정책/실제캐릭터 전달, NPC 유품·부탁의 명시선택과 동일save ledger의 async durable ACK, 맵 확대 흐림/절벽·전경 재질접합, 실제 editor/main/native6·청취·보상save 검수. 기존 tools/map-scene-rift-dialogue.mjs session choose(actualGrant:false) 또는 async void dbSave의 resolve를 durable 승인으로 간주0. 24시간 제작은 완료핀·보존 후 다음 미완료를 이어가며 기존 owner 송신독점/거절경계/타인WIP·user save·원PNG·scene/nav/보호2_3/Q전용/어택티켓금지 유지 |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL 순서에서 지형·원PNG·scene/nav 수정0, 기존 2.5D 보행화면을 normal parent consumer에 연결; CAMERA 신규 desktop Continue/예약/취소 UI PASS, 맵 RETOUCH; TECH source 핀·prototype/final/신규DOM fixture 분리, 실제 main(native6)·audio·durable save 미인수. 관련 docs 전체검색·fullprefix backup·새 append EOF LF1·완료소유 code+docs 정상 commit/push/remote exact은 외부보존 영수증으로 확인. VISUAL VERDICT: RETOUCH. 소스 구현과 실제 CH1-1 플레이 인수를 구분하며 A급완성 선언0.


## 2026-10-07 ROOT-ACTOR-OWNED-DISPOSE-20261007: 효과 소유 자원 해제의 예외 격리

`tools/2_5d/actor-effect-lifetime.mjs`의 private `dispose()`만 보강했다. 한 mesh/material/shared geometry 해제의 예외가 나머지 자원 해제를 중단하지 않으며, 모든 시도 후 기존 lab의 `cleanupFailures` 소비자가 알아볼 수 있는 고정 메시지 Error를 던진다. 새 raw69 모듈을 producer에 대체하거나 직접 import하지 않는다. 이 절의 CPU 검수는 실제 브라우저·GPU 해제 또는 본편 인수가 아니다.

| id·적용 위치 | 정확 계약·현재 값 |
|---|---|
| source 이전 핀 | actor-effect-lifetime.mjs 11238 bytes / SHA256 c4fd8fdce92b61d086f480a0466e1dfa37fac9b49b4f1bfc20368318d545a3ab. 변경 전 fullbytes 외부 백업 보존 |
| source 완료 핀 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. dispose L182–216만 변경; 새 구역을 원 dispose로 역변환하면 원본 전체 bytes와 일치 |
| API·provenance | createActorEffectLifetime({THREE,scene,camera,terrain,options}) → frozen {update,onActorChange,onSceneChange,dispose,snapshot}; default export와 ACTOR_EFFECT_DEFAULTS/ACTOR_EFFECT_PROVENANCE 변경0. ROOT-ADOPTED 원출처 9201 bytes / SHA256 1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400 유지 |
| 종료·capture | 반복 호출이면 즉시 0. 첫 호출은 disposed=true로 generation을 닫은 뒤 그 시점의 all.slice()를 capture한다. 생성 시점 빈 목록을 복사해 놓는 방식0 |
| mesh·material | capture된 각 entry의 mesh/material 조회를 독립 시도. 같은 mesh는 identity Set에 먼저 기록하고 visible=false 및 scene.remove(mesh)를 각각 독립 시도. material은 별도 resource identity Set에 먼저 기록하고 dispose가 함수인 경우 호출 |
| shared geometry | dustGeo/attackGeo는 풀 전체가 공유하는 factory 소유 geometry이며 entry마다 해제0. 모든 material 후 같은 resource Set을 통해 해제한다. 동일 handle은 종류가 겹쳐도 dispose 최대1회. borrowed scene/camera/terrain 자체 dispose0 |
| 실패·finally | entry 조회·hide·remove·resource.dispose에서 잡힌 예외마다 failures+=1. caught error의 message 조회0. finally에서 live/free length=0, stats.active=false/reason='disposed'/live=0/pool=0. 전 시도 뒤 failures>0이면 Error('actor effects 소유 자원 해제 실패: N')를 throw |
| return·재호출 | 성공 첫 dispose는 기존 all.length 숫자를 반환한다. 빈 풀은 0, duplicate entry는 역사적 entry 수 그대로 반환. 실패 첫 dispose도 종료 상태를 유지하며 다음 dispose는 0, 재시도·중복 해제0. snapshot.meshes=all.length 유지 |
| 진단의 의미 | active=false/reason='disposed'는 수명 닫힘이다. 실패한 resource의 물리적 GPU 반환 성공을 뜻하지 않는다. lab releaseResource가 controlled Error 1개를 catch하면 cleanupFailures는 1 증가; 메시지 N은 내부 예외 수이며 둘을 혼동0 |
| 고정값·렌더 | maxLive24, dustLifeMs520, attackLifeMs240, stepMinIntervalMs110, footBand4320, dustColor0x1a140f/opacity0.5/size0.14, attackColor0xc8623a/opacity0.8/size0.17, groundLift0.003, reducedMotion=false/depthTest=true defaults 유지. lab 공급 size 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145 및 depthTest=false 변경0 |
| 범위 제외 | update/clear/spawn/onActorChange/onSceneChange/snapshot, reduced-motion 재생성 및 factory 생성 예외·재진입 조사 변경0. 추가 helper/import/RAF/timer0. worldlab·main code2·원raw69·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0 |

| 신규 제한 검수 그룹 | 조건 수 | 결과·근거 |
|---|---:|---|
| 현재 생성된 소유 풀·성공 숫자 | 8 | PASS; 나중에 생성된 실제 Three Mesh 2개를 해제하고 첫 return2, borrowed 해제0 |
| remove 예외와 기존 lab 실패 집계 | 9 | PASS; 첫 remove throw 후 나머지 remove/material/shared 해제 지속. 현행 releaseResource 소스를 VM에서 소비해 cleanupFailures1 및 시도1 확인 |
| 동일 소유·shared identity | 7 | PASS; 두 entry가 같은 실제 Mesh/material/geometry를 가리켜도 각 handle1회, return2/다음0 |
| geometry entry별 해제 금지 | 5 | PASS; factory shared geometry2만 해제하고 원 mesh.geometry 관계 유지 |
| material 예외·고정 메시지·종료 상태 | 7 | PASS; throwing message getter를 가진 예외의 message를 읽지 않고 fixed Error 실패1, 후속 자원 도달·재호출0 |
| 빈 풀·종료 후 spawn 차단 | 5 | PASS; 빈 풀 숫자0, factory geometry2 해제, 이후 update 새 mesh0 |
| 공개 계약·dispose 밖 bytes | 6 | PASS; API/defaults/provenance 동일, dispose 역변환 전체 원문 exact |
| 실행 단위 | 47 | 신규 Node stdin 1회, 고유7그룹 PASS7/FAIL0/exit0. 저장소 Three r160 CPU 객체와 자원 method 예외 주입. 기존 팀14·child6/21·DPR·runtime DOM 검사 재실행·합산0 |

전체 docs 관련키워드 검색은 코드 변경 후 제외 경로 없이 수행했다. `actor-effect-lifetime`, `actor-effect-release`, `createActorEffectLifetime`, `dustGeo`, `attackGeo`, `cleanupFailures`, owned/dispose 관계는 22개 파일·336개 매칭 줄이며 원출력은 외부에 보존했다. 이 소유 문서3에는 현재 해제 계약을 동기화한다. API·수명·렌더 값이 그대로인 기존 캐릭터/애니메이션 참조는 유지하고, root 소유 운영문서 및 raw69 완료 이력은 root가 새 완료 단위와 구분해 동기화한다. 원raw69 productionAdopted=false 및 팀14 PASS 이력을 이 구현 인수로 승격0.

증거·fullbyte backup 위치: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-20261007/`의 preflight.json, before/1.before–4.before, dispose-replacement.json, limited-check-result.json, docs-keyword-search.txt, docs-search-summary.json, docs-search-disposition.json, source.diff, final-receipt.json. 문서3은 root 최신 main append를 포함한 원 fullprefix를 100% 보존하고 새 append EOF LF1을 유지한다. 코드+docs 완료소유 commit/push·원격 exact SHA는 root가 수행할 다음 보존 단계이며 이 지원 작업에서 Git mutation0.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원 지형·원화·nav·접지·전투 변경0; CAMERA 신규 화면 검수0; TECH 소유 효과 dispose 신규 CPU7그룹47조건 PASS, 기존 시각/GPU 이력 재실행0·새 핀 GPU 미인수. 맵 확대 흐림·재질 접합 개선을 주장하지 않는다. VISUAL VERDICT: RETOUCH. actual main/native6/audio/durable save 미인수 유지, A급완성 선언0.

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


## 2026-10-07 ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007: 종료·중첩 요청을 보호하는 효과 재생성

현재 `tools/2_5d-world-lab.mjs`는 OS reduced-motion 변경의 효과 재생성 consumer를 보강했다. 정상 변경은 기존처럼 동기로 반영하며, cleanup/factory/cue 콜백이 종료나 새 요청을 일으킨 경우 오래된 루프가 효과를 다시 등록하지 않는다. 이 절은 앞선 계획의 구현0 상태를 갱신한다. producer의 부분 할당·등록 전 재진입 문제는 여전히 별도 미해결이다.

| id·적용 위치 | 정확 현재 계약·수치 |
|---|---|
| 완료 코드 | worldlab 39715 bytes / SHA256 050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8. 이전36039 bytes / SHA256 8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93 fullbytes 백업. 소유9접점 역변환 전체 원문 exact |
| producer 불변 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. raw69 직접import/전체producer 대체0. 이전 dispose CPU7/47·Chrome 오류 이력을 이 소비자 검사로 교체0 |
| createEffects L276 | createEffects(id,reducedMotion=reducedQuery.matches). ensureInitialization()을 먼저 호출하고 actor factory에 raw scene 대신 initializationScene add/remove facade를 공급. geometry/color/opacity/defaults/DPR 값 변경0 |
| 초기 등록 L428 | local effect=createEffects(id) → takeInitialized(effect,'effects') → effects[id]=effect. 초기 ready=false를 이유로 생성 자체를 막지 않으며, 생성 콜백 중 종료한 뒤 반환된 완성 handle은 epoch 확인 뒤 해제하고 등록0 |
| 실행 가드 L280 | 재생성은 state.ready 및 !disposed/!error/!contextLost, lifecycleEpoch===initializationEpoch일 때만 허용. cue·old cleanup·factory 각각 반환 후 captured epoch와 current request identity 및 소유 slot identity 재검사 |
| 요청·phase L282·L289 | private effectRebuildGeneration은 0 시작, 요청마다 증가하며 Number.MAX_SAFE_INTEGER=9007199254740991에서 진단 숫자 포화. 요청마다 fresh frozen identity를 생성하므로 숫자 포화에서도 stale publication 차단. owner phase는 cue/retiring/creating/publishing, 종료 후 idle |
| 중첩 latest pending | owner가 있으면 새 요청 identity와 pending=true만 보존하고 즉시 반환. cue/cleanup/factory를 재귀 실행0, finally에서 즉시 재실행0. 한 pending boolean·한 latest request만 보존하며 actor id 목록·reducedMotion boolean은 accepted job 시작에 capture |
| retire·해제 | effects[id]=INERT_EFFECT를 old cleanup보다 먼저 설정. 실제 old controller는 기존 releaseResource를 소비해 identity를 callback 전에 WeakSet 기록하고 controlled cleanup Error를 cleanupFailures에 집계. 한 actor 해제 실패가 다른 actor 재생성을 막지 않음 |
| 생성 실패·새 참조 | factory 예외는 effectRebuildFailures에 별도 기록하고 해당 소유 slot은 INERT로 유지; 아직 current면 다른 actor 계속 처리. next는 local로 보유하고 current epoch/request/slot을 통과할 때만 publish. stale next는 releaseResource로 1회 해제, lifecycle 종료이면 lateResourceRejected 증가. callback이 바꾼 slot·새로 추가한 id를 stale 루프가 덮거나 임의 채택0 |
| 고정 per-id reason | rebuild-pending / factory-failed / slot-replaced / 성공 시 빈 문자열. caught error.message 등 외부 예외 내용 조회0. 생성 오류와 cleanup 오류를 성공으로 삼키지 않음 |
| INERT 반환 계약 | frozen update/onActorChange/onSceneChange/dispose/snapshot 5메서드. update/snapshot은 frozen active=false/inert=true/reason='rebuild-unavailable' 및 live/spawned/expired/recycled/pool/bandWrites/suppressed/meshes=0. 나머지3메서드는 숫자0. GPU 소유 자원으로 releaseResource에 집계0 |
| 기존 RAF L267 | frame의 기존 ready/disposed 확인 다음 pending을 최대1회 flush. 즉시 ready/disposed/error/contextLost 재검사 뒤 pose/render 진행. 추가 RAF·timer·server·recursive queue0. 미종료 정상 frame의 기존 requestAnimationFrame1회 경로 유지 |
| dispose L343 | root disposed=true/ready=false/lifecycleEpoch++ 이후, 외부 cleanup 전에 request=null/pending=false/owner=null. teardown은 INERT를 제외한 현재 실제 controller만 해제. 반복 종료 기존 가드 유지 |
| readonly 진단 L281 | effectRebuildSnapshot() → frozen generation/phase/pending/failures/cueFailures 및 새 frozen reasons 복사. __rift25Lifecycle L370와 __rift25Lab L473의 effectRebuild 필드로 관측. mutable token/controller/Map handle 노출0 |
| 오류 숫자·화면 leaf | factory failures 및 cueFailures는 0 시작, 각 caught failure마다 +1, MAX_SAFE_INTEGER에서 포화. 기존 status leaf에 고정 '효과 재생성 오류 N · 접근 표시 오류 M'을 추가하고 선택 slot이 INERT면 '효과 비활성' 표시. parent container 교체0. 실제 DOM 화면 검수는 미실행 |
| 해제 시도 숫자 의미 | disposeAttemptCounts.effects는 초기 actor 수3이 아니라 현재 수명 전체의 실제 controller 해제 시도 누계. 정상 토글이면 old3 및 이후 new3 등의 시도가 추가되며, shared old identity는1회·INERT는0회. 이전 Chrome 이력의 effects3은 그 당시 관측값으로 유지 |
| 고정 효과 값 | maxLive24/possiblepool72(3×24), dust520ms/attack240ms/간격110ms, public defaults dust size0.14/attack0.17·groundLift0.003·footBand4320 유지. lab 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145·depthTest=false 및 기존 RGB/opacity 유지 |

| 신규 source consumer 제한 검수 | 조건 수 | 결과·범위 |
|---|---:|---|
| 전체 module syntax·소유9접점 exact | 12 | PASS; module parse 후 링크·전체 lab 실행0, 역변환 원문 exact/producer 핀 불변 |
| 정상 동기 토글·actual Three options·dedup | 15 | PASS; 실제 Three r160/public actor factory 반환, captured reduced-motion/options/facade 및 동일 old handle1회 |
| cleanup throw·다른 actor 계속 | 7 | PASS; 실제 변경 source releaseResource로 cleanupFailures1, factory3 도달·오류 종류 분리 |
| factory throw·INERT·진단·teardown | 13 | PASS; throwing message getter 미조회, INERT 메서드·0수치·fixed reason, CPU leaf 문자열 및 실제 old3/new2 시도5 |
| cue throw 격리 | 4 | PASS; factory3 계속·cueFailures1 및 CPU leaf 문구 |
| old cleanup의 동기 pagehide callback | 10 | PASS; source dispose 호출로 종료·pending 취소·factory0·old3 각1회·후속RAF0 |
| factory 반환 중 종료 | 7 | PASS; 반환된 완성 public controller 해제·등록0, old3/late1 시도4, reject1·RAF0 |
| cleanup 중첩 최신 요청·기존 frame | 12 | PASS; 실제 source callback이 새 요청을 호출. 즉시 factory0·generation2 pending, frame1회로 latest false 세actor 일관 적용·RAF1 |
| factory 중첩·readonly 진단 | 10 | PASS; creating snapshot의 frozen record, nested 요청의 pending, stale 반환 해제·latest frame1회 |
| slot identity·captured ids | 6 | PASS; callback의 새 ref/new id 보존·stale next 해제·slot-replaced 진단 |
| 초기 late admission·post-flush 종료 | 8 | PASS; local 반환 takeInitialized 거부/해제·slot등록0 및 frame flush 후 render/RAF0 |
| 실행 단위 | 104 | 신규 Node stdin 1회·고유11그룹 PASS11/FAIL0/exit0. VM의 actual 변경 소스 추출, 저장소 Three r160/public actor factory 사용. pagehide/RAF/UI/scene lifecycle ports는 fixture이며 실제 Chrome/GPU/native 인수0 |

검수 소스 핀은 위 39715/050f627b…이다. Node의 experimental VM Modules 경고는 실행 도구 경고이며 코드 검사 실패가 아니다. 기존 CPU7/47·GUI6/3·actor Chrome2·owner 모델11·DPR suite 재실행 및 합산0. fixture 호출의 pagehide/모의 RAF1을 trusted browser 이벤트 또는 실제 렌더 loop 인수로 승격0.

기존 owner memory 공식 end519bf6c5-b01d-4943-a74c-5f59fcfb4419@2026-10-06T20:24:59.163Z / rawSHA7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e의 모델11은 이전 이력이다. 새 endb7c855c2-b213-4860-af41-9a433e5aef9a@2026-10-06T20:37:33.547Z / rawSHAd07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001의 보고9 중 유의미7·U2 assert(true)2개는 근거 제외로 구분한다. 자연 matchMedia 별도 task 설명을 Three.dispose/EventDispatcher/주입 scene callback의 동기 재진입 불가 근거로 채택0. 직접 catch로 실패를 삼키기·finally 즉시 재귀 제안은 채택0, 전문 새 TASK/재송신0.

미해결 producer 경계는 actor-effect-lifetime.mjs L84–85의 두 번째 geometry ctor 실패 시 첫 할당의 반환 전 회수, L94–99의 material/Mesh/scene.add→all.push 사이 종료·등록 경합 및 진행 중 spawn의 등록 후 취소이다. consumer의 scene facade는 add 전 admission이며 이 경계의 leak-free/실제 물리 GPU 해제를 증명하지 않는다. 별도 owner 조사와 실제 검수를 기다리며 producer 원본·raw69·main code2·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0.

코드 변경 후 전체 docs 검색(제외 경로0)은164파일853줄/raw1164941 bytes/SHA10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f이다. 이 출력 중 actor/source 정확키워드로 좁힌19파일223줄과 모든164파일의 disposition을 외부에 보존한다. 소유 lifecycle docs3은 현재 구현·정확 값·인수 경계를 append로 동기화하고 이전 actual Chrome 실패/UNKNOWN·owner 모델·root main 문서 fullprefix를100% 보존한다. 운영docs6 및 다른 consumer 교차참조는 root 소유로 인계하며, 일반 자산 재생성·다른 시스템 reduced-motion 참조의 값을 임의 수정0.

외부 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-rebuild-consumer-guard/`의 preflight.json, before/, source-replacements-final.json, limited-source-result.json, docs-keyword-search.txt, docs-precise-matches.json, docs-search-disposition.json, final-receipt.json. 코드1+docs3 완료 핀을 root에 인계하며 Git mutation/commit/push는 지원 작업0, 원격 정확 SHA 보존은 root 다음 단계이다.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 이력 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원화·지형·배치·접지·nav·전투 변경0; CAMERA 신규 화면 검수0; TECH 신규 변경 source VM11그룹104조건 PASS, 이전 검수 반복0·실제 GPU/native6/audio/durable save 미인수. VISUAL VERDICT: RETOUCH / NOT ASSESSED. 화면 선명도·A급완성·실제 CH1-1 플레이 완료 선언0.
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

### 2026-10-07 편집 씬 → 별도 2.5D 소비자 구현 checkpoint

현재 편집 씬을 고정 resident v2와 구분해 실제 소비하는 별도 경로다. 기존 NPC 선택 미리보기·본편 연결·승인 PNG/scene/nav는 그대로 보존한다. 이 checkpoint는 화면 인수 전 구현 보존이며, 실제 GUI 결과는 후속 영수증으로 별도 기록한다.

| 항목 | 현재 계약 |
|---|---|
| 새 진입 | editor.html의 기존 모듈 옆 import/create 2줄과 별도 “편집 씬 · 2.5D” 버튼. 기존 NPC 버튼 유지. host가 EXODUSER_SCENE_EDITOR.ready/snapshot/player(null) 확인 후 detached own-JSON 복사·actual MapSceneCore.validate·실 UTF8 32,000,000 bytes 이하를 통과해야 iframe 생성 |
| 전송·소유 | 별도 editor-scene-preview-host.mjs → tools/editor-scene-preview-lab.html/mjs. epoch별 문자열 entryId·동일 origin/path/href/contentWindow·own-data API·loadScene 완료 뒤 ready=true/loading=false/disposed=false/exact entryId/error없음 ACK. stale/close/timeout은 active 승격0. timeout30,000ms/poll100ms |
| 지형 소비 | tools/2_5d/editor-scene-terrain.mjs: 현재 snapshot의 assets crop/실원본크기, layer array 순서·visible·foot y정렬·parallax, object x/y/width/height/pivot/회전degrees/flipX/opacity·polygon mask/maskFeather/sourceParallax, 현재 walkable/start를 소비. 고정 canonical scene 재fetch0. 데이터 이미지 경로는 지원하지 않고 프로젝트 assets/·img/ PNG/JPEG/WebP만 지원 |
| 투영·재질 | Three r160 실제 Group/BufferGeometry/Texture/MeshBasicMaterial. angle50°/scale400, world ground X/Z·geometryHeight0/physicalHeight UNKNOWN. worldToScene=(x-centreX)/400, h/400, ((y-centreY)+h*cos50)/(400*sin50). 원본 Texture src별공유·개별 UV/material offset·native polygon triangulation·mask long edge256 world-distance alpha DataTexture. layerOrderStride2001. 원PNG 재작성0 |
| child 화면 | orthographic 기본/원근45° 선택, near.01/far10000, angle50° 방향, 전체구도margin1.1, 확대 .5..3 step.1, finitepositive DPR 기본1/cap2/실변경시 setPixelRatio. actual original render 후 shader failure/contextLost/getError 검사. canvas와 fixed leaf 상태문구. 금빛 SphereGeometry radius.04/12x8 probe는 캐릭터·NPC가 아닌 보행 위치 |
| 현재 보행 | 현재 start에서 WASD/방향키, world속도240px/s·반경12·대각선정규화·dt최대.05s. canWalk는 현재 snapshot MapSceneCore 소비. blocked count, 시작지점 복귀. 별도 sceneSnapshot()은 detached clone 읽기만 제공 |
| 수명 | child 1회loadScene/entryId문자열1..128. AbortController·stale결과 dispose·단조상태·firstcause private/fixed UI. visibility시held clear/RAF중단·복귀, pagehide/dispose idempotent. factory는 자기 native 자원·명시 release handle만 해제. host open/close 기존 editor keyup으로held 해제, blur endDrag/history 호출0 |
| 수정 불가 경계 | editor scene/history/selection/save에 host·child 쓰기0. 현재 씬을 본편에 자동 채택0. 기존 canonical NPC admission/대화/본편5000ms·900ms/주민기록·아이템·퀘스트·원23·보호2_3·Q전용 magic blackBean(E불가)·어택티켓금지 보존 |
| 최초 factory 검수 | 새 actual full factory/nativeThree+통제 Image·fault injection 8그룹40조건PASS/FAIL0/미도달0/exit0. code18576B/2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41. RGBA decode/GPU shader LINK/GUI 인수0. rootlab syntax PASS, camera X/Z alignment와 layerCount 계약 보정은 첫GUI 전 source수정 |
| host 검수 경계 | 초기 숫자 entryId draft의 actualhost/core+통제ports12그룹51조건PASS는 문자열 child 계약 미검수. 실제 child는 문자열을 요구하므로 epoch문자열 보정과 새 제한 검수를 별도 기록; 초기12전체 재실행·합산0 |
| 실제 입력/FX 별개 | native J→rig attack/작은arc/original WebGLrender 도달 관측. 최초 capture-microtask 관측FAIL1/12미도달, 외부 관측부만windowbubble 보정 뒤 held-repeat/fresh/idle4조건PASS·대화 DOM 동기render 시점조건FAIL1/3미도달/exit1. 전체clean13PASS 아님. 뒤 실제render/PNG에 하란 대화패널 관측됐으나 neutral240ms/J닫기후공격未인수. final13800B/2ed847c0ce3fa2de3d4ca0abee6bb9880b738ebeb327cdb0608099e196feaa86. source변경0 |
| docs 검색 | docs 전체 새keyword77경로2044행, evidence editor-scene-preview-lab-consumer/docs-whole-keyword-search.json, matches777528B/6e56630b39db61e3496d6d5048d45b061aa6379fcfe0f75d86c5a44e92149c46. worker 관련2정본+현재절 checkpoint 뒤 나머지 관련정본 정확동기화를 이어감; 과거 이력·ownerWIP·보호문서 임의변경0 |

§23 MAP PRODUCTION REPORT: MASTER=current editor snapshot의 별도실제소비. 가이드 fullSHA607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK 선행근거 적용. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존 승인원자료 보존·새원화/배치제작0. CAMERA QA=새consumer 실제GUI PENDING. TECH QA=새factory40조건·host초기51조건의정확범위와rootlabsyntax. VISUAL VERDICT: RETOUCH(실제새GUI未관측, 전체맵1254→8000확대/legacy1024 mask흐림 미해결). 독립 편집미리보기는 본편native6·청취·실reward save·A급완성을 뜻하지 않는다.

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
