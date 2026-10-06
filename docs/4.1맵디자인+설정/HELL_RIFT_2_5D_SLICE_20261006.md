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
| `object3d` | 지면·심연 후경·독립 절벽 측면·동측 뿔 메시 Group |
| `worldToScene(x,y,h=0)` | `THREE.Vector3`. 입력은 유한수, h는 world px |
| `sceneToWorld(vector)` 또는 `(x,y,z)` | fresh `{x,y,h}`. 정사영 역변환 |
| `canWalk(x,y,r=12)` | 전체 기존 nav의 코어 질의. 표시 clip으로 충돌을 잘라내지 않음 |
| `spawn` | fresh `{x:5900,y:3820}` |
| `bounds` | canonical clip, centre, width2260, height1400 |
| `occluders` | 동측 뿔 object3d·objectId·footY4320·원본 mask world polygon |
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
| 동측 뿔 | 원본11점 mask·crop 그대로. world bbox x5640…6000/y3320…4320, footY4320. foot origin 메시를 X축−angle만큼 회전한 camera-facing plane로 배치. 카메라가 fixedangle이면 quaternion 갱신 불필요 |
| 배우 가림 | 지형 단독 재질과 별도로 root lab는 전경과배우모두transparent=true/depthTest=false/depthWrite=false로같은정렬pass 사용. worldY≤4320 actor20/그외40,뿔30; behind겹침opacity.32 선택페이드. 원화front/back 기준이며 측정된물리높이 아님 |
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
