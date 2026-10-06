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
