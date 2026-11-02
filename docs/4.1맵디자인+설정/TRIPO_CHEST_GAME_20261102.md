# Tripo 보물상자 — 웹 본편 실제 뚜껑 개봉

사용자 지시: “게임에 상자 넣어서 열어보고”. 대상은 `game.html` 웹 본편의 기존 보스 보물상자다. Unity·Steam 배포·스폰/보상 수량·확률/저장 설계 변경은 포함하지 않는다. 11/02 후속 지시로 상자 전리품의 바깥 분산·분출과 착지 전 수거 대기를 적용한다. 최신 추가 지시 “상자가 너무커 … 충돌도 넣고”로 표시 축소·동적 몸통 충돌을 적용한다.

## 11/03 최신 소스 후보 — 취소 가능한 셰이더 준비·실GPU 미검증

총괄 인수 통보와 정확 docs commit `c5da354e1221a9aa3db23f65786dc64cdb34058e`를 읽었다. 기존7d 국소 albedo의 root runtime07081a 실Metal/64px 원본 가독성 PASS와 이번 준비 후보를 구분한다. 순서를 교차한 첫 표시24.1/24.6ms 및24.1/25.5ms에서는 단독271ms 회귀가 재현되지 않았다. 과거271.2ms 계측에는 backend조회와 추가 COMPILE_STATUS 동기조회가 섞였으며, 공통 getProgramInfoLog3회 합16.4~17.6ms가 주요 첫사용 대기 위치로 관측됐다. **271ms 해결·driver cold 보장·전체FPS/1%low 개선 선언이 아니다.** 아래 준비 경로의 실제 비용·색·자원은 다음 root Mac 실검수 대상이다.

| id | 항목 | 이번 소스 후보 계약·검증 경계 |
|---|---|---|
| GOAL | 표시 전 준비 | Three/GLB/재질/기존 접촉그림자를 만든 뒤 `prepareChestRenderer(renderer,scene,camera,{signal})` 완료를 기다린 다음 ready=true. loading 중 중복 load/compile0, active/isShowing=false·overlay 숨김으로 기존 native2D/보상·수거 유지 |
| KHR | r160 고정 경로 | `renderer.extensions.has('KHR_parallel_shader_compile')` 지원 때만 public `renderer.compile(scene,camera)`1회. 반환 재질의 `renderer.properties.get(material).currentProgram`을 yield 전 고유Set에 캡처. r160 내부 program API 의존을 해당 모듈로 한정, vendor 수정0 |
| READY | 준비 완료 | 캡처 program의 `isReady()`로 기존 COMPLETION_STATUS_KHR 완료를 확인. 모두 완료되면 각 고유 program의 `getUniforms()`1회로 r160 onFirstUse의 기존 link/log 검사·uniform/attribute cache를 채움. 별도 COMPILE_STATUS/getProgramInfoLog 진단 추가0, checkShaderErrors/onShaderError 보존 |
| POLL | 기간·상한 | `CHEST_PREPARE_POLL_MS=10`ms, `CHEST_PREPARE_TIMEOUT_MS=5000`ms. 시작부터 performance.now 경과>=5000이면 실패. event loop/동기 compile·driver 호출을 선점하거나5초 이내 종료를 보장하는 hard deadline은 아님; 숨김 탭 timer 지연도 경과에 포함 |
| CANCEL | 종료 수명 | private AbortController를 자원해제 전에 abort. 준비 타이머 clear·abort listener 제거·program Set/GL/renderer/scene/camera 참조 비움, 이미 큐에 들어간 callback은 settled 검사로 접근0. renderer.properties는 yield 후 재조회0. r160 compileAsync의 취소 불가능한 내부 poll을 호출하지 않음 |
| UNSUPPORTED | 기존 렌더 | KHR 미지원이면 compile/poll/getUniforms 준비0, 결과 unsupported로 원래 첫 product render 경로 사용. 비동기 개선·첫사용 대기 제거 보장0. 기존 첫 render 오류 catch/2D fallback 보존 |
| FAILURE | 실패·경합 | compile/isReady/getUniforms 예외·해제된 program·timeout·contextlost는 failed/ready=false·2D fallback·1회해제. falsey 거절 값도 실패로 처리. contextlost listener는 release 때 제거한 뒤 own context loss. 실패/종료 모두 own RAF 취소·재예약0. 늦은 GLB는 disposed 또는 failed 양쪽에서 즉시 해제, 늦은 거절은 재실패/중복해제0 |
| RESULT | 결과·관측 API | helper 결과 ready/unsupported/cancelled, 오류는 Promise rejection. `snapshot().preparation={status,pollMs:10,timeoutMs:5000}`; status idle→preparing→ready/unsupported, 조기해제 cancelled, 오류 failed. ready/unsupported 완료 뒤 dispose하면 그 준비 결과는 이력으로 유지하되 top-level ready/active=false |
| PRESERVE | 고정 입력 | `chest-local-albedo-v1`/색·gain/mask·캐시id/빛/노출1.25/fov40·64CSS/44×24몸통·개봉/R/보상/RNG/AI/save·game/index/title·GLB/원본texture·vendor 불변. 새 texture/geometry/program variant·helper모듈 추가0. 실제4texture/5geometry/3program 유지 여부는 다음GPU 확인 |
| CPU QA | 검증 | 기존20+준비/경합20=40 PASS. 설치된 r160 compileAsync/실WebGLProperties JS로 해제 뒤 late-poll TypeError를 재현하고 같은 r160 isReady closure를 CPU GL 대역으로 실행. 준비후ready/한번compile·고유program중복방지·unsupported·dispose/resolve/reject/latecallback·GLB지연/contextlost·timeout·falsey거절·RAF/timer0 확인. 실제WebGLRenderer/GPU·driver/firstvisible 비용 증명 아님 |
| NEXT | 실물 gate | root가 정확 module 최소차분만 인수→기존Mac fresh공식artifact/Metal/64px 같은그림·자원·firstvisible A/B/prepare중dispose·실오류/GLB지연·정상종료 검수. 이 준비 후보로 기존07081a 원본 PASS를 소급 재사용하지 않음 |

정확 전후 byte/SHA·RED/GREEN·patch·원격 영수증: `I:/EXODUSER-Storage/tripo-chest-game/20261103/cancellable-shader-prepare/REPORT.md`. 이번 PC에서는 source-only, GPU/CUA/게임/서버/빌드/전송/유료0. 기존branch만 정상 보존하며 main/CI/공개 반영0.

## 11/02 국소 albedo 소스 후보 이력 — 당시 source-only 미검증

아래는7d 제작 당시의 기록이다. 이후 root07081a 한정 실GPU/1x PASS 인수 통보는 위 최신 절과 총괄c5 문서를 따르며, 이번 셰이더 준비 후보의 GPU PASS를 뜻하지 않는다.

같은64px Mac 원본2장과scale1 strip4장을 직접 확인했다. 이전6a 소스/9d 실산출의 반사 후보는 철테 가장자리만 미세하게 바뀌며 목재·철테·잠금쇠·열린 내측의 짙은 회녹색 뭉침이 남아 **RETOUCH/미채택**이다. 반사 강도·전역 노출 미세조정 대신 기존 기본색과금속도B로 부위별 명암/색을 분리하는 한 후보로 방법을 전환한다. 아래는 새 소스 계약이며, 다음 절의128×64 반사장은 과거 후보 이력이다.

| id | 항목 | 현재 소스 후보 계약·검증 경계 |
|---|---|---|
| INPUT | 직접 본 기준 | proof-final-9d2691의 corrected 닫힘/열림1920 원본2장·1920/3840 scale1 strip4장, 기존 내장 basecolor/RM. 원본/판정/비용 경로는 아래REPORT. 기준과 후보의 새 GPU 결과를 혼동하지 않음 |
| METHOD | 적용 범위 | `createChestMaterialSeparation(THREE,model,enabled=true)`, id `chest-local-albedo-v1`. 해당 모델의 고유 MeshStandardMaterial만 onBeforeCompile 적용. 다른 맵/접촉그림자/조명/전역 노출 적용0 |
| MASK | 기존 B 재사용 | r160 metalnessmap_fragment의 기존 `texelMetalness.b`를 `smoothstep(.12,.55,B)`로 사용. 추가 샘플러·텍스처·UV0. RM 없는 목재 내부는 mask0. roughnessFactor/metalnessFactor 및 기존 RM 자체는 불변 |
| ALBEDO | 선형 공식 | 기존 기본색의 SRGB→선형 샘플·vertex color·알파 처리 후, PBR lighting 전 RGB에만 `gain=mix((2.4,1.65,1.05),(5,5.3,5.8),mask)`, `RGB=1-exp(-RGB*gain)`. 목재는 따뜻한 저채도, 철테는 차갑고 더 밝은 톤을 목표로 하며 검정0 유지·하이라이트는1미만으로 완화. 색 보정의 실제 가독성은 미검증 |
| PIPELINE | r160 유지 | map/normal/RM·base factor·normalScale·emissive·alpha/side·renderer output SRGB·ACES exposure1.25·카메라fov40·기존 광원 보존. 원본GLB2679056B/19452tris·형상/UV·64CSS·44×24충돌·R개봉/전리품·보상/RNG·game/index/title 변경0 |
| AB | 동일 모델 OFF/ON | `_chest3d.setMaterialSeparationEnabled(false)`는 uniform0으로 해당 RGB 연산 전체를 건너뛰어 원래 PBR 입력과 경로를 사용. true=uniform1. 로드 전에도 선택 가능. 저장/UI 설정0. snapshot.materialSeparation은 id/enabled/materials와 준비 후mask/woodGain/metalGain 제공 |
| CACHE | 단일 shader variant | 원래 customProgramCacheKey에 고정 id만 추가. OFF/ON은 uniform만 변경하며 needsUpdate·새함수·cache key 변경0. CPU1000전환에서 key/version/hook 불변 확인. 실제GPU 프로그램 수/장시간 토글 누수는 다음Mac 검수 |
| ENV | 퇴역 반사장 | 기본/ON/OFF 모두 scene.environment=null. createChestEnvironmentTexture·DataTexture/PMREM 준비 코드 제거. 구 `setEnvironmentEnabled`는 항상false를 반환하고 snapshot.environment={enabled:false,prepared:false,intensity:0}. 반사 자원은 준비/업로드하지 않음. 과거 소스는Git450a/6a와정확-byte백업에 보존 |
| FAILURE | 폴백 | r160 revision/필수 shader chunk 불일치 예외와 renderer.debug.checkShaderErrors=true/onShaderError 예외를 기존 render catch→failed/2D폴백/1회해제로 연결. 실제GPU 오류/컴파일 검증은CPU 대역으로 대체하지 않음 |
| LIFETIME | 기존6a 유지 | dispose/failure는 original hook/key descriptor 복원·uniform0·material 참조Map비움 뒤 고유 geometry/texture/material 해제, root/scene.clear·모델/카메라참조 비움·RAF취소·own context loss. 늦은GLB도해제. 기존 공유자원 중복dispose 방지 보존 |
| QA | 소스 검사 | 새계약7 RED(함수부재)→GREEN, 별도shader callback1 RED→GREEN. 재질/수명8+기존상자/패키징12=20 PASS. 가짜 WebGLRenderer/네트워크 + 실제Three CPU 객체/실제 shader 문자열 검사이며 새 GPU 컴파일/시각/비용 PASS 아님 |
| NEXT | 채택 gate | 기존Mac idle/소유 확인 뒤 정확moduleSHA/GLB 검증, 같은64px/1920×1080·3840×1080 닫힘/실R열림내측 OFF/ON/A2 원본1x, 실제shader compile/GL오류/새텍스처0·PMREM0·프로그램 반복상한/실비용·failure/dispose 확인. 후보 추가미세조정 없이 한 번 판정. 같은핵심방법2FAIL이면 단계/방법 재검토 |

새 후보 근거: `I:/EXODUSER-Storage/tripo-chest-game/20261102/local-material-separation/REPORT.md`. **기존 재질 VISUAL VERDICT: RETOUCH, 새 후보 시각 미검증·미채택.** PC GPU/게임/CUA/서버/빌드·유료실행0, main/CI/공개반영0.

## 11/02 반사 후보 이력 — 6a/9d 실검수 RETOUCH·미채택

공식 ea24 실행본의1920×1080 닫힘/열림 원본과 Tripo viewer/실제 내장 텍스처를 직접 대조했다.64px에서 목재·철테·장식이 어둡게 뭉치는 결함은 남아 있다. 아래 후보는 기존 작업 브랜치에만 보존하며 main/실행본/아트 채택을 뜻하지 않는다.

| id | 항목 | 후보 계약·검증 경계 |
|---|---|---|
| INPUT | 실제 원본 | CTO ea24 `chest-closed-original.png`/`chest-open-loot-original.png`, 기존 Tripo `viewer.jpg`, GLB 내장 basecolor1024²·normal512²·RM512². 경로/CPU 분석은 아래 REPORT |
| FACT | PBR 경로 | 본편 importmap은 Three r160. 기본색은 GLTFLoader의 SRGBColorSpace, roughness=G/metalness=B의 선형 데이터, glTF 기본 OPAQUE·텍스처 알파255 확인. RM B평균49.55661/max218, G평균137.92878. 채널 반전·색공간·알파 오류를 원인으로 확정하지 않음 |
| HYPOTHESIS | 한 개 방법 | 기존 상자 scene.environment 부재를 분리 시험한다. 어두운 기본색(RGB평균34.97/35.65/34.85)과64px 축소도 관측됐으므로 IBL 부재가 주원인이라는 판정은 GPU A/B 전 미확정 |
| PRESERVE | 고정 기준 | ACESFilmic·exposure1.25·hemi2.5/key3.2/fill.8, PBR map/normal/RM·불투명도·emissive·원GLB/형상·뚜껑·64px·44×24충돌·R 보상/분산·game.html 보존. 전역 노출·크기 확대·흰 발광 추가0 |
| ENV | 반사 데이터 | `createChestEnvironmentTexture`:128×64 RGBA Uint8=32768B, 알파255, srgb-linear, EquirectangularReflectionMapping, 가로Repeat·LinearFilter. 실제 후보 데이터 RGB범위2~149(흰색255 없음). 외부 HDR/이미지/Three 버전/자산 추가0 |
| PALETTE | 선형 RGB | ground(.018,.012,.009), sky(.16,.20,.24), warm(.46,.42,.34), cool(.10,.14,.18). up=sin((v−.5)π), 상하보간(up+1)/2; 주방향(−.6,.55,.58)의 양수 dot^8, 보조(.8,.2,−.56)의 양수 dot^12. 픽셀 셀 중심 표본·RGB×255 반올림 |
| INTENSITY | 재질 국소 | `CHEST_ENV_INTENSITY=.65`를 해당 모델의 고유 MeshStandardMaterial만 적용. 원본 basecolor/metalness/roughness/emissive/alpha를 재작성하지 않음. 기존 접촉 그림자·다른 장면에는 적용0 |
| AB | 같은 실행본 | `_chest3d.setEnvironmentEnabled(false)`=scene.environment null + 원래 envMapIntensity 복원, true=같은 준비된 반사 texture/.65. 저장·게임 UI 설정은 쓰지 않음. snapshot.environment의 prepared는 CPU 데이터 준비이며 GPU/시각 PASS가 아님 |
| PMREM | r160 자동 경로 | 실제 렌더 때 WebGLCubeUVMaps가 source를 PMREM으로 변환·캐시. 소스 계산상 cube32→각336×128 RGBA16F 출력/임시타깃, 원본32768B 포함 명목약720896B(.6875MiB). shader/정렬/드라이버·실측 GPU/프레임 비용 미포함, 실제 비용 검수 전 예산 통과 주장0 |
| DISPOSE | 실패·종료 | source texture.dispose→r160 캐시 타깃 해제 이벤트, 실제 고유 geometry/texture/material dispose + renderer.dispose/own context loss. api.dispose는 멱등·RAF취소·ready/active=false. 모델을 소유 root에서 분리하고 model/root/lid/light/shadow/foot/camera 참조도 비워 CPU 모델 트리가 남지 않게 함. 로드 중 종료 후 늦게 도착한 모델도 해제. snapshot.resources는 해당 renderer의 카운터만 노출 |
| FALLBACK | 예외 | GLB/의존성/환경 준비 또는 첫 render 예외→한 번 failed, 자원 해제·overlay 숨김·기존 native2D 보존. 새 프레임에서 반복 로드/실패 렌더를 하지 않음 |
| CPU QA | 최소 회귀 | 새6건 RED→GREEN + 기존 상자/패키징12건=18 PASS. 실제 Three r160 Texture/Material/Geometry.dispose 이벤트와 PBR 불변 검사. WebGLRenderer/네트워크 GLTFLoader는 CPU 주입 대역이며 하드웨어 해제·색·오버레이 비용은 검증하지 않음 |
| HANDOFF | 다음 gate | 기존MacUI idle/소유 확인 뒤 격리 same-artifact64px baseline/candidate 닫힘·열린 내측 A/B/실제1x·fallback·dispose·오버레이 비용. PC CUA/Chrome/OBS/게임/Unity/Player/빌드/렌더/GPU/인코딩·신규유료0. 후보 시각 판정 미검증, 기존 재질 RETOUCH 유지 |

근거·후보 차이·실행 명령·정확SHA: `I:/EXODUSER-Storage/tripo-chest-game/20261102/material-readability-rework/REPORT.md`. 두 번 같은 핵심 시각 실패 시 수치 미세 반복 대신 재질/표현 방법을 다시 정한다.

## 제작과 런타임 계약

| id | 항목 | 값·경계 |
|---|---|---|
| SOURCE | Tripo Studio H3.1 | 텍스트 생성 작업 `e124bd3b-f5bd-4c63-9f79-9db5dcf901af`, 원본 70,015,768B·1,896,668삼각형. 원본·정확한 프롬프트·비공개 구독 기록은 `I:/EXODUSER-Storage/admin/subscriptions/tripo-20261102/proof.json` |
| REF | 직접 확인한 기준 | 해당 원본의 실제 Tripo 뷰어 `viewer.jpg`·`model-preview.jpg`. 단일 닫힌 목재 상자·단철 장식·중앙 잠금쇠의 큰 실루엣과 재질을 유지한다. 게임용 파생은 원본 생성의 조형 RETOUCH를 전체 아트 PASS로 올리지 않음 |
| DERIVE | 제작 도구 | Blender 5.1 `tools/tripo-chest-game.py`. 원본 read-only import→decimate→몸통/뚜껑 분리→움푹한 목재 내부→`ChestLidPivot` 뒤쪽 경첩. 정확한 절단·축·텍스처/바이트·SHA는 아래 receipt |
| RUNTIME | 기존 런타임 경로 교체 | `assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb`. 파일명은 기존 Meshy 이력과 패키징 경로를 유지하지만 이 버전의 실제 내용은 Tripo 파생본이다. 이전 5,684,980B Meshy 원본은 Git 이력 및 작업 전 정확-byte 백업에 보존 |
| SIZE | 파생본 | 2,679,056B·19,452삼각형. 기존 런타임보다 3,005,924B 감소. 원본 Tripo 70MB와 `.blend`·제작 로그는 출고 폴더에 넣지 않음 |
| LID | 노드 | `TripoChest` 아래 정지 `ChestBody`·`ChestInterior`, `ChestLidPivot` 아래 `ChestLid`. 열린 X축 회전 −1.92rad(약110도). 기본 닫힘, 이미 열린 world item의 늦은 모델 로드도 열린 상태를 따른다 |
| MOTION | `chest3d.mjs` | 개봉 후 0.4초 흔들림 + 0.9초 cubic ease-out 뚜껑 열기, 열린 상태 유지. dt는 0~0.05초, 게임 일시정지 중 진행0. 다시 열어도 재시작/재보상0 |
| DRAW | 접지·카메라 | CSS64×64(최초160에서60% 축소), DPR≤1.5. 모델 폭1.8, Perspective40도/카메라(.7,1.75,3.5)→(0,.62,0). 투영된 바닥 원점과 실제 world item 위치를 맞추고 부유 이동 제거. 작은 접촉 그림자 사용 |
| LOAD | 폴백 | 실제 chest가 있을 때만 Three/GLB·WebGL을 준비한다. KHR 지원 때 취소 가능한 셰이더 준비 완료 뒤ready, 미지원은 기존첫렌더 경로. 준비/로드/컨텍스트/timeout 실패에는2D 목재 몸통44×24px 폴백을 유지한다. 열린 우편함 이모지를 열린 목재 상자로 교체하고 같은 충돌 면적을 따른다. `isShowing(item)`은 표시 중인 바로 그 item만 숨겨 다른 chest의 폴백을 지우지 않음 |
| LIFETIME | 상태 | 스테이지 이동·item 제거·게임 종료 시 overlay 숨김. 일시정지에는 현재 형태 유지. 실패 재요청0, dispose/실패 때 준비취소·상자 RAF종료·1회해제. 실패/종료 뒤 늦은 GLB도 해제하고 준비를 재개하지 않음 |
| GAMEPLAY | 보존 | 보스 사망 후 기존 위치의 chest 생성, 거리<60 상호작용, `opened=true`를 먼저 세운 뒤 장비3~5개·기존 추가 보상. 보상 수량·등급 확률·추가 재화/물약·스폰·저장 보존. 전리품 좌표와 분출/착지 전 수거 대기, 표시 크기·상자 몸통 충돌은 아래 후속 계약으로 변경 |
| PACKAGE | 파일 선택 | `build-nwjs.mjs` FILES에 `chest3d.mjs`1개만 추가. 기존 GLB 경로를 교체해 새70MB master 추가를 막고 기존4GB/단일100MB 제한을 유지 |

## 11/02 최신 — 캐릭터 대비 크기와 몸통 충돌

| id | 적용 위치 | 현행 값·설계 경계 |
|---|---|---|
| SCALE | chest3d.mjs `CHEST_RENDER_SIZE` | 64×64 CSSpx. 초기160의40%, 80px 중간 실물에서 열린 뚜껑까지 더 작게 보이도록64로 마감. 모델/텍스처 원본은 불변 |
| BODY | game.html `_chestBlocks` | 중심(it.x,it.y), 반폭22·반깊이12worldpx =44×24px 몸통 사각형. actor 반경r만큼 확장. 뚜껑/광원/힌트는 충돌 면적에 넣지 않음 |
| STATE | worldItems 수명 | 닫힘/개봉 중/열림 모두 몸통 유지. picked/item제거/스테이지 새 worldItems에 따라 자동 해제. terrain 타일에 영구 기록하지 않음, 모델 준비/실패와 독립 |
| MOVE | canMv/canMvBlink | 기존 지형·MAP_OBJS·bone 처리 뒤 동적 몸통 검사. canMvBlink의 skipBone=1은 유지하되 상자 통과는 허용하지 않음. isW·정적 맵/흐름 그리드·Q/E 패링 수치 불변 |
| SWEEP | 빠른 이동 | 선택적 fromX/fromY→x/y 선분과 확장 몸통 AABB 교차 검사. 실제 플레이어 걷기(idle)·sBlock/peaceShield 중 이동·ghostWalk·넉백·돌진·사슬 끌림·칼날이동 접점에 이전 좌표 전달. 벽 검사 자체는 기존 네 모서리 계약 |
| ESCAPE | 생성 순간 겹침 | 시작점이 몸통 확장 안일 때, 이동이0이 아니며 `(from-center) dot delta >= 0`인 바깥 방향만 허용. 더 안쪽으로 들어가는 이동은 막아 생성 후 갇힘 방지 |
| LOOT | 자기 상자 제외 | 장비 착지 경로 검사에 `canMv(x,y,18,x,y,it)`: 분출 시작점이 자기 몸통 안이라는 이유로 모든 후보가 탈락하지 않게 자기 상자만 제외. 다른 상자·지형은 계속 검사 |
| FALLBACK | 2D 크기 | 닫힌 몸통44×24, 뚜껑48×8; 열린 몸통44×24/내부36×14/뒤로 열린 뚜껑44×14. 기존 고정 접지/2D 힌트와 보상 사용 |
| CACHE | bootstrap | `./chest3d.mjs?v=20261102-size64-collision`. 기존160px 모듈 캐시 혼동 방지 |
| QA | 근거 | `I:/EXODUSER-Storage/tripo-chest-game/20261102/size-collision/REPORT.md`. 크기·닫힘/열림 충돌·실제 WASD 우회·기존 R 개봉·전리품 분산을 같은 최종 소스로 검수. 보스 자연 처치/전체 맵 품질 PASS 아님 |

- 최종64px 실게임: 닫힌 양쪽 중심 간격37.79224/37.35920px에서 정지, 위쪽으로 약72.47px 이동 후 반대편 우회 성공. 개봉 뒤 전투 넉백의 첫 간격46.38px 관측은 충돌 정지로 오인하지 않고 별도 안전 위치에서 다시 A 입력→37.79224px 정지 확인. 상자 제거 시 중심/고속 선분 통과 가능, 복귀 시 다시 차단. 장비4개 반지름150px/최소110.76184px·모두 보행 가능·미수거. Chrome 연결 중단 후 IAB의 같은 소스로 최종 개봉/이동 검수를 마쳤다.

## 11/02 후속 — 전리품 겹침 수정

| id | 항목 | 현행 값·적용 위치 |
|---|---|---|
| LAND | 기본 배치 | game.html `_chestLootPositions`: 중심 ±25px 무작위 정사각형을 폐지. 반지름150worldpx, 화면 아래쪽25~155도 부채꼴에 보상3~5개 균등 배치 |
| SPACE | 공간 검사 | 아이템 사이/기존 미수거 장비 중심 간격64px. 몸통/뚜껑 여유 영역 `abs(dx)<86 && -156<dy<40` 제외. `canMv(x,y,18)`와 중심→착지점20px 이하 구간의 보행 가능 여부 검사 |
| FALLBACK | 좁은 지형 | 150/190/230/270px 고리·15도 간격 후보로 이동. 공간 부족 시64→48→32→0px 간격 순 완화, 최후에는 도달 가능한 후보 또는 중심을 재사용해 보상 손실 방지. 모든 불가능 지형에서64px 보장을 주장하지 않음 |
| FLIGHT | 순차 분출 | 출발(상자x,상자y−35), 지연 `.55+ci*.06`초, 비행 `.42+U*.08`초, 정현 포물선 높이 `38+U*14`px. 뚜껑이 열리기 시작한 뒤 좌우/앞으로 튀어나옴 |
| TIME | 시뮬레이션 | `_tickChestDrops(_dtSp/60)`: 고정60Hz의 배율을 초로 변환. 일시정지 후에만 갱신, 완료 시 임시 `_chestDrop` 제거 |
| PICKUP | R 탭/홀드 | 두 장비 선택 루프에서 비행 중 제외. 착지 후 기존 화면 범위 수거/필터 그대로. 비행 중 룬 빛기둥 숨김, 지상 착지 후 기존 아이콘34px/빛기둥60×160 유지 |
| RNG | 보상 보존 | 계획기는 RNG0회. 기존 mkItem 뒤 좌표용 난수2회를 같은 순서로 비행 높이/시간에 사용. 장비3~5개·등급 확률·악의/물약·개봉1회 보존 |
| EVIDENCE | 근거 | `I:/EXODUSER-Storage/tripo-chest-game/20261102/loot-spread/REPORT.md`. 자동8건·실제 본편 R 개봉/착지·간격/벽 검사. 첫 타이밍 검수 실패도 별도 보존. 검수 상자를 쓴 범위이며 보스 자연 처치 증거가 아님 |

- 후속 최종 실제 R 300ms 홀드: 장비5개, 착지 전0.333초에5개 모두 미수거/표시 대기, 착지 후5개 유지. 반지름150px·최소 간격83.9487px·5개 모두 보행 가능. 악의1027→1034(+7). 1920×1080/3840×1080 실제 표시 확인, 개봉 관측 구간 오류/요청 실패0(이벤트 유실0).

## 검수 근거와 남은 범위

- 기존 상자 보상 조각을 실제 소스에서 실행하는 회귀: 거리 조건·장비3~5개·추가 보상·재입력 무보상 확인. 수량/확률을 새로 정의하지 않는다.
- RED: 분리 경첩/열림 모듈 부재2건 실패, 기존 보상1건 통과. GREEN: 위3건 통과. 자동 검사와 실제 게임의 시각/조작 검수는 별도다.
- 실제 본편1920×1080에서 R 입력→장비3개·악의오브+7, 재입력 추가보상0을 확인했다. 3840×1080 표시·item 제거 시 숨김/열린 상태 복귀·실제 GLB 요청 차단 시2D 폴백 및 기존 R 보상도 확인. 검수 fixture·구간별 일시정지이며 보스 자연 처치/자연 완주 증거가 아니다.
- V1의 뚜껑 안쪽 소실을 실제1x에서 발견해 `ChestLidUnderside`를 추가하고 같은 열기 경로를 재검수했다. 최종19452삼각형·2679056B이며 V1 실패 화면/자산은 소유 검수 폴더에 보존.
- 실제 게임 검수·사진/영상·1x 비교·로딩 실패·최종 패키지 증감·Git 근거는 `I:/EXODUSER-Storage/tripo-chest-game/20261102/REPORT.md`에 기록한다. 검수용 chest를 배치한 경우 보스 자연 처치/자연 완주와 구분한다.
- 큰 형태·경첩 축·내부 빈 공간·재질·지면 접촉이 실제 게임에서 성립하는지 우선 판단한다. 원본의 복잡한 철제 장식/불규칙 모서리 개선, Unity 및 다른 구형 테스트 HTML의 열림 이식은 별도다.

## MAP PRODUCTION REPORT

| 구역 | 이번 범위 |
|---|---|
| STAGE / MASTER | 기존 CH1·보스 보상 상자. 실루엣·지역·남북 주 경로·전투/여유 공간 설계 변경0 |
| OUTER MASS / LARGE / MEDIUM | LEFT/RIGHT/TOP/SOUTH·합성·중형 접합·기존 남은 hole 무변. 기존 맵 PASS를 새로 주장하지 않음 |
| GROUND | 상자 바닥 원점 투영·소형 접촉 그림자만 검수. 바닥 원화·오염·정적 맵 geometry/collision 무변. 최신44×24 상자 동적 몸통 충돌은 위 계약 적용 |
| PLAYABLE / LANDMARK | 기존 보스 보상 tertiary interactable. 랜덤 scatter·주 경로 이동0. 기존 보상 상자 몸통에만 동적 장애물 추가 |
| CAMERA QA | 실제 검수 위치/해상도·닫힘/열림·플레이어/전리품 가독성은 REPORT. 미관측 START/EARLY/SIDE/LATE/EXIT는 전체 맵 검수로 확대하지 않음 |
| TECH QA | route/collision 보존, pageerror/404/GLB 로드/프레임·폴백·보상은 REPORT의 실제 결과 |
| FILES / GIT | 상자 자산·모듈·bootstrap·출고 FILES·테스트·제작도구·관련 docs만 자기 소유 작업본에서 변경. 기존 G 사용자 INDEX·아트 WORK는 보존 |
| VISUAL VERDICT | RETOUCH: 실제 닫힘→뚜껑 개봉·유지와 내측 면은 확인. 원본의 불규칙 금속 장식/거친 재질은 남음. 기능 PASS와 구분하고 원본 조형 RETOUCH 이력은 유지 |

정확한 출처/축/크기/파생 SHA: `I:/EXODUSER-Storage/tripo-chest-game/20261102/asset-receipt-v2.json`. 제작 `.blend`와 이전 런타임 백업도 같은 소유 폴더에 보관한다.
