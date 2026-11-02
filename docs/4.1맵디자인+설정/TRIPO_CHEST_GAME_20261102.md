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

## 11/02 최신 재질 후보 — 국소 albedo 실GPU·1x 통과, 최초 비용 진단 마감

같은64px Mac 원본2장과scale1 strip4장을 직접 확인했다. 이전6a 소스/9d 실산출의 반사 후보는 철테 가장자리만 미세하게 바뀌며 목재·철테·잠금쇠·열린 내측의 짙은 회녹색 뭉침이 남아 **RETOUCH/미채택**이다. 반사 강도·전역 노출 미세조정 대신 기존 기본색과금속도B로 부위별 명암/색을 분리하는 한 후보로 방법을 전환한다. 아래는 새 소스 계약이며, 다음 절의128×64 반사장은 과거 후보 이력이다.

| id | 항목 | 현재 소스 후보 계약·검증 경계 |
|---|---|---|
| INPUT | 직접 본 기준 | proof-final-9d2691의 corrected 닫힘/열림1920 원본2장·1920/3840 scale1 strip4장, 기존 내장 basecolor/RM. 원본/판정/비용 경로는 아래REPORT. 기준과 후보의 새 GPU 결과를 혼동하지 않음 |
| METHOD | 적용 범위 | `createChestMaterialSeparation(THREE,model,enabled=true)`, id `chest-local-albedo-v1`. 해당 모델의 고유 MeshStandardMaterial만 onBeforeCompile 적용. 다른 맵/접촉그림자/조명/전역 노출 적용0 |
| MASK | 기존 B 재사용 | r160 metalnessmap_fragment의 기존 `texelMetalness.b`를 `smoothstep(.12,.55,B)`로 사용. 추가 샘플러·텍스처·UV0. RM 없는 목재 내부는 mask0. roughnessFactor/metalnessFactor 및 기존 RM 자체는 불변 |
| ALBEDO | 선형 공식 | 기존 기본색의 SRGB→선형 샘플·vertex color·알파 처리 후, PBR lighting 전 RGB에만 `gain=mix((2.4,1.65,1.05),(5,5.3,5.8),mask)`, `RGB=1-exp(-RGB*gain)`. 목재는 따뜻한 저채도, 철테는 차갑고 더 밝은 톤을 목표로 하며 검정0 유지·하이라이트는1미만으로 완화. 07081a 실64px ON/OFF/A2 원본에서 가독 분리 개선을root확인;271.2ms현재조건비재현/공통첫사용준비후속별도 |
| PIPELINE | r160 유지 | map/normal/RM·base factor·normalScale·emissive·alpha/side·renderer output SRGB·ACES exposure1.25·카메라fov40·기존 광원 보존. 원본GLB2679056B/19452tris·형상/UV·64CSS·44×24충돌·R개봉/전리품·보상/RNG·game/index/title 변경0 |
| AB | 동일 모델 OFF/ON | `_chest3d.setMaterialSeparationEnabled(false)`는 uniform0으로 해당 RGB 연산 전체를 건너뛰어 원래 PBR 입력과 경로를 사용. true=uniform1. 로드 전에도 선택 가능. 저장/UI 설정0. snapshot.materialSeparation은 id/enabled/materials와 준비 후mask/woodGain/metalGain 제공 |
| CACHE | 단일 shader variant | 원래 customProgramCacheKey에 고정 id만 추가. OFF/ON은 uniform만 변경하며 needsUpdate·새함수·cache key 변경0. CPU1000전환에서 key/version/hook 불변 확인. 07081a 실draw40회 자원/program/version/cache불변 확인;장시간누수·전체성능미인증 |
| ENV | 퇴역 반사장 | 기본/ON/OFF 모두 scene.environment=null. createChestEnvironmentTexture·DataTexture/PMREM 준비 코드 제거. 구 `setEnvironmentEnabled`는 항상false를 반환하고 snapshot.environment={enabled:false,prepared:false,intensity:0}. 반사 자원은 준비/업로드하지 않음. 과거 소스는Git450a/6a와정확-byte백업에 보존 |
| FAILURE | 폴백 | r160 revision/필수 shader chunk 불일치 예외와 renderer.debug.checkShaderErrors=true/onShaderError 예외를 기존 render catch→failed/2D폴백/1회해제로 연결. 실제GPU 오류/컴파일 검증은CPU 대역으로 대체하지 않음 |
| LIFETIME | 기존6a 유지 | dispose/failure는 original hook/key descriptor 복원·uniform0·material 참조Map비움 뒤 고유 geometry/texture/material 해제, root/scene.clear·모델/카메라참조 비움·RAF취소·own context loss. 늦은GLB도해제. 기존 공유자원 중복dispose 방지 보존 |
| QA | 소스 검사 | 새계약7 RED(함수부재)→GREEN, 별도shader callback1 RED→GREEN. 재질/수명8+기존상자/패키징12=20 PASS. 가짜 WebGLRenderer/네트워크 + 실제Three CPU 객체/실제 shader 문자열 검사이며 새 GPU 컴파일/시각/비용 PASS 아님 |
| NEXT | 채택 gate | 07081a 실Mac 64px/두viewport OFF/ON/A2·shader오류/PMREM0/추가texture0/40draw/cache·fallback/dispose 검수와root原本판정 완료. 첫271.2ms는현재4case24.1~25.5ms에서비재현/원인단독미확정;취소가능준비source후보와전체성능검수는별도. 같은핵심방법2FAIL이면단계/방법전환 |

새 후보 근거: `I:/EXODUSER-Storage/tripo-chest-game/20261102/local-material-separation/REPORT.md`. **기존 반사 후보 RETOUCH 유지. 새07081a 국소 재질은64px한정 VISUAL PASS/root原本인수,최초비용4case진단마감·공통첫사용준비후보별도/전체성능미인증.** PC GPU/게임/CUA/서버/빌드·유료실행0, main/CI/공개반영0.

위 표는 원 담당7d 재질 단위의 보호 범위다. root 통합 후보에서는 아래 별도94e 최종 타이틀 단위를 함께 선택 반영했으며, 게임·저장·보상은 그대로다.

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
| LIFETIME | 상태 | 스테이지 이동·item 제거·게임 종료 시 overlay 숨김. 일시정지에는 현재 형태 유지. 모델 로드 실패를 반복 재요청하지 않음 |
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

## 2026-11-02 21시 인수 — ea24 정확 합본의 실제 산출물·브라우저 검수

이 절이 이전의 ea24 `실artifact/browser 미착수` 상태보다 우선한다. 검수 runtime은 `ea24a3bfb6d2d381f520eb81ac1978d8bfde9bab`이며 이후 문서 마감은 제품 코드·자산 변경이 아니다. main/public/Unity/Windows Desktop 최신화와 구분한다.

| 항목 | 실제 결과와 검수 경계 |
|---|---|
| 입력·공식 산출 | 필수3346경로 Gitblob mismatch0, selected3244,94논리93물리. 공식 build→prepare→check 각1회 exit0. stage는 sidecar포함3238파일3996969288B, prepare가69482B sidecar를 상위 검수 receipt로 이동한 최종static은 **3237파일3996899806B / 4GB여유3100194B / 최대94795327B**. 수동 파일 보충·상한 완화0 |
| 산출 identity | config SHA256 `1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2`; derived receipt `64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80`. sourceplan과 실제prepare 후 파일수/byte를 혼동하지 않음 |
| HTTP·실행 | 새 loopback artifact의 GLB/chestmodule/titleJS/C2영상3/still/moon/cloud/fall 11URL fullGET200·MIME·전체SHA 일치. 같은 산출물의 격리 headless Chrome DPR1에서 실제 namespace/영상·moon/cloud/flow 증가, 숨김 정지·destroy·motion-reduce/영상오류/plate오류 폴백 확인 |
| 상자·전리품 기능 | 1920×1080의64CSSpx/44×24worldpx 몸통. 닫힘·열림 WASD 정지/우회·겹침 탈출·상자 제거 후 통행, GLB차단의 실제2D draw 확인. 별도 같은artifact fixture에서 R160ms 홀드→장비3개, 순차 분출134샘플·비행중 미수거·착지후 수거·추가보상0·pause/resume 확인. game/chest 최종검사 각각9건 통과. 보상수량/RNG/게임수치를 새로 정의한 것이 아님 |
| 시작·걷기 | 타이틀→시네마틱→데모→빈 offline 로비 earlyInit 경로, pageerror0. 대표 서쪽 걷기0/3의 실제 drawImage 셀256px 확인. 일반본편 skin 주입·상태제어이며 자연AI전투/85걷기전체/OS 손입력 검수가 아님 |
| 실패 보존·fixture | 연습모드의 worldItems 교체/R제한, intro 이전 G.on 대기, skip overlay, 프레임 사이 zero-duration R 입력 실패를 원인별 분리 후 실제 UI순서/프레임을 넘는 홀드로 교정. 제품 코드 변경0. 최종 navigation/closed/fallback/walk와 open-flight-pickup은 분리 fixture이므로 한 번의 연속 자연 플레이 PASS로 확대하지 않음. 과거 실패 JSON은 남지만 일부 중간 PNG는 최종 재촬영으로 덮여 과거 실패 이미지 byte 전체 보존 증거는 없음 |
| 16:9 원본 인수 | root가1920×1080·3840×2160 타이틀 및1920×1080 상자 닫힘/열림 원본4PNG를 파일SHA·IHDR 대조 후 직접 열었다. **3840×2160은16:9이며32:9 증거가 아니다.** 달 전체·발 지지·로고/메뉴 분리는 해당16:9 원범위로 확인 |
| 실제 와이드 추가 검수 | 같은 artifact만 재사용해2560×1080·3840×1080/DPR1/일치하는 canvas·CSS·PNG 치수, 모션 증가·가로넘침0·pageerror0을 별도 확인. 신규 build0·전체suite 반복0. 양발·달은 보이지만 전체그림 center-cover로2560×1280 y=-100 /3840×1920 y=-420을 그리므로 캐릭터 확대와 상하 배경 크롭이 생김. **기술 PASS / 와이드 구도 RETOUCH**. stage의 기존 cover 수치는 임의 변경하지 않았고 DESIGNLOCK 캐릭터 보존·배경 확장 목표의 품질 공백으로 남김 |
| 아트 판정 | **상자 금속·목재가 실제64px 화면에서 너무 어두워 RETOUCH**. 기능 PASS로 금속 조형/재질 완성이나 전체맵 PASS를 선언하지 않음. 조명/노출/IBL 원인 추정은 실제 같은-camera A/B 전 확정하지 않음 |
| 저장·무음·종료 | ordinary11/currentPrefs2 raw사전백업·사후13개동일, installed5/WIP25/공유HEAD·branch·INDEX·WORK/원본7014metadata 불변. 자기출력 후단 gain0·analyser peak0·direct video unmuted0(실OS loopback 청음 아님). 자기 Chrome·loopback 서버 정상종료·PID/listen잔여0, 사용자 Chrome 보존. 이전 소형 proof sender도 /done 정상close와 실제PID/listen0을 확인 |
| 배포 경계 | 일반userprofile/Unity/NW/실모니터/자연보스처치·전체맵/한타FPS·1%low·public/API 완주 PASS가 아니다. `/api/mats`405는 정적 fixture 제한, Supabase/외부font 요청차단은 의도된 격리. public402 조건에서 mainpush/재배포 반복0, Windows/바로가기 전달0 |

근거: Mac `_out/web-chest-final-qa-20261102/{FINAL_RECEIPT.json,REPORT.md,browser-ea24-game-final-result.json,browser-ea24-chest-input-result.json,wide-aspect-qa.json,static-full-manifest-ea24.json}` 및 root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-ea24-final-intake-20261102/`. 원본 화면·해시·보존·정상 종료를 인수한 범위만 판정하며 기능 통합과 아트 재작업을 분리한다.

추가 root 원본 인수: `title-C2-2560x1080-wide-original.png` 3770249B/SHA256 `3269a2153d20674d78356f75bafdef0a9b4cd472c47eb44aa7871bc5b647368f`, `title-C2-3840x1080-wide-original.png` 5073289B/SHA256 `9c76fc071d302bf734bc053b12539e6fd3ddb509abf02e57e4e9004281981cd3`. root가 수신 byte·IHDR를 대조하고 두 전체 원본을 직접 열어 위 구도 RETOUCH를 확인했다. UI 화면맞춤 미리보기는 물리 모니터1:1 검수로 주장하지 않는다.


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
| DISPOSE | 실패·종료 | source texture.dispose→r160 캐시 타깃 해제 이벤트, 실제 고유 geometry/texture/material dispose + renderer.dispose/own context loss. api.dispose는 멱등·RAF취소·ready/active=false. 로드 중 종료 후 늦게 도착한 모델도 해제. snapshot.resources는 해당 renderer의 카운터만 노출 |
| FALLBACK | 예외 | GLB/의존성/환경 준비 또는 첫 render 예외→한 번 failed, 자원 해제·overlay 숨김·기존 native2D 보존. 새 프레임에서 반복 로드/실패 렌더를 하지 않음 |
| CPU QA | 최소 회귀 | 새6건 RED→GREEN + 기존 상자/패키징12건=18 PASS. 실제 Three r160 Texture/Material/Geometry.dispose 이벤트와 PBR 불변 검사. WebGLRenderer/네트워크 GLTFLoader는 CPU 주입 대역이며 하드웨어 해제·색·오버레이 비용은 검증하지 않음 |
| HANDOFF | 다음 gate | 기존MacUI idle/소유 확인 뒤 격리 same-artifact64px baseline/candidate 닫힘·열린 내측 A/B/실제1x·fallback·dispose·오버레이 비용. PC CUA/Chrome/OBS/게임/Unity/Player/빌드/렌더/GPU/인코딩·신규유료0. 후보 시각 판정 미검증, 기존 재질 RETOUCH 유지 |

근거·후보 차이·실행 명령·정확SHA: `I:/EXODUSER-Storage/tripo-chest-game/20261102/material-readability-rework/REPORT.md`. 두 번 같은 핵심 시각 실패 시 수치 미세 반복 대신 재질/표현 방법을 다시 정한다.



## 2026-11-02 21:45 — 상자 반사 환경의 검수용 후보 반입

| 항목 | 정확 범위·현재 검증 |
|---|---|
| 출처/범위 | 원 담당 private450a6bfa2d2a027728280039267d63f8a29dca0d에서 chest3d.mjs 한 개와 신규 CPU회귀 한 개만 선택 반입. 기존 루트2f37의 exactea24 검수/문서·게임/타이틀·95→94활성매핑·걷기/사슴 복구를 보존. wholebranch/main merge·공개 배포·제품아트 채택 아님 |
| 모듈 | 기존5632B/SHA90ea0ef8f285ef507d1b3d8b994fb07cc8b21c5969c9d06ff403f14f9d5f9eac → 후보9256B(+3624)/SHAa16f2f94fe26d4c63ff997701fa6415db6402c65879c9c03a05d16cc2e567da9. 반사128×64 선형RGBA/.65, 같은모델 환경off/on, 실패·dispose해제 경로. 숫자/공식/팔레트·캐시 한계는 TRIPO_CHEST_GAME_20261102.md 새후보표가 정본 |
| 보호 | GLB2679056B/19452tri·PBR입력/노출1.25/원광원·64CSS/44×24body/열기·R분출/수거·보상RNG/save/AI/game/index/title·파생94논리93물리 byte불변. 외부guard/WIP/사용자PC앱조작0 |
| 검증 | 루트 원본에서 신규6회귀 기능부재 RED→정확모듈반입후 신규6+기존12=18 PASS. 실제Three자원 이벤트+주입 renderer/loader의 CPU검사이며 실제PMREM/GPU/시각/비용은 미검증. baseline/candidate 같은64px 닫힘/열림과 실제fallback·dispose를 같은Mac 격리앱에서 다음 검수 |
| 출고 예산 | 추가런타임 파일0·모듈+3624B. 이전ea24 actualstatic3996899806B 기준 예상3996903430B/4GB예상여유3096570B, sidecar포함 sourceplan예상3996972912B/예상여유3027088B. 아직 새공식plan/artifact가 아닌 차이 계산이다. 공식새build→prepare→check/wholemanifest·HTTP SHA는 후보정상commitpush 뒤 같은Mac에서 확인 |
| 판정 | **미채택·GPU시각 미검증 / 기존 상자재질 RETOUCH**. 원인 가설(금속반사환경부재)은 A/B 전 미확정. 이전ea24의 기능한정PASS/와이드구도RETOUCH와 별도. 같은핵심시각2FAIL이면수치미세반복 대신방법전환 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/{candidate.patch,red-root.log,green-root.log,producer-REPORT.md}.

추가 루트 통합 검사: 상자·패키징·웹선택/무손실파생·staging·C2·시작/슬롯/저장/타이틀 이동의 관련15개 테스트파일 **112/112 PASS**. 이 수치는 이전합본133개 전체 재실행 결과가 아니며 GPU/자연전투 검수로 올리지 않는다.


### 21:45 후보의 최종 수명 수정 인수

원 담당 최종 `6a41b6229fd09d05c7568e4720c4a29d54855739`가 초기450 후보를 대체한다. teardown 때 `root.clear()`와 modelRoot/root/lid/light/shadow/foot/camera 참조 비우기만 추가했다. 부모 root에 남은 model을 새 assert로 RED 재현한 뒤 최종모듈에서18/18 PASS. 반사색·광원·환경생성·표시/판정 수치는 초기450과 동일이며 시각 검수는 아직 없다. 초기450 및 루트4a8609의 source검사/원격 이력은 최종GPU 검수로 바꿔 표시하지 않는다.

| 항목 | 최종 후보값 |
|---|---|
| runtime | chest3d.mjs9307B,기존5632B대비+3675B/초기후보대비+51B; SHA256 `4cfa51bafddd65e8fb6a1009eb63f5d10c2e3367052a9d32d8a97a2b95fdc442` |
| 예산 | 이전ea24 actualstatic3996899806+3675=**예상3996903481B/여유3096519B**, sidecar포함 **예상3996972963B/여유3027037B**. 새공식plan/artifact 미실행이며 Mac 실제값으로 대조해야함 |
| 전달 상태 | 초기4a용Mac작업문은 **native전송전 최종수정으로 보류**했다. 최종정확commit/privatepush/remote후 같은Mac에게정정된전체문 단회전달. 중복QA·과거수락재전송아님 |


## 2026-11-02 22:15 — 9d 상자 반사 후보의 실제 GPU 검수 마감

| 항목 | 실제 인수와 판정 |
|---|---|
| 소스/패키지 | runtime9d269179f4dccaf6fd48d6e2d93277181dc8b630/원담당6a41b622. 입력3349/mismatch0/selected3244·94논리93물리,공식build→prepare→check각1회 exit0. stage3238/3996972963B에서69482B sidecar이동 후 실제static3237/3996903481B·4GB여유3096519B/max94795327B. 이전예상값을실산출로인수했다 |
| 실제 경로 | 단일loopback의원본ea24/후보9d분리. module2/GLB2 fullGET200·MIME·SHA 및actualloadedmoduleSHA일치. actual AppleM5Pro/ANGLEMetal/Three r160/WebGL2/DPR1,1920×1080·3840×1080의64CSSpx 같은camera/pose fixture. 자연OS입력/보스처치/전체맵검수 아님 |
| A/B 한계 | 최초render전API setter로env-off freshA확인. 원본baseline과A는camera/PBR/exposure동일하지만배경particle차가있어전체pixel동일주장0. A→A2의닫힘·열림64px crop은각changedpixel0. B뒤A2는PMREM캐시보유이므로freshA비용으로세지않음 |
| 실측 비용 | 닫힘warm각116표본(첫10제외): GPUmean/p95 A0.383/0.515ms→B0.484/0.622ms,CPUmean/p95 A0.218/0.400→B0.203/0.400ms. 실제EXT_disjoint_timer_query_webgl2/disjointfalse·순차클럭/프로브오버헤드한계. 첫B CPU15.400ms/GPU0.914ms. texture4→7/geometry5→13/program3→7. 전체FPS/1%low·VRAM/heapbytes 인증이 아님 |
| 실제수명/폴백 | GLB차단→native2D/R보상·actualcontextlost,실GLB1800ms지연후dispose/late모델해제,첫actualrender호출의제어된Scene예외→catch/release. main dispose멱등·RAF정지/readyactivefalse·scenechildren0,고유dispose texture5/material5/geometry13각1회,expectedcontextlost확인. 자발적인GPU드라이버고장검사는 아님 |
| 잔여카운터 | main해제후JSrenderer.info texture1/program2/geometry0을그대로보존. source/PMREM해제이벤트·actualGLcontextloss·pageclose가근거이며모든카운터0·즉시VRAM회수·GC검수로가장0 |
| root실물 판정 | root는SHA/IHDR검증한4개의scale1 A/B strip과1920후보닫힘·열림전체원본2장을직접열었다. **RETOUCH/재질가독gate미달·반사환경방법미채택**: 일부모서리차이만미미하고금속/목재/잠금쇠·열린내측이여전히어두운회녹색덩어리다. 추가자원/밝기숫자로아트PASS를주지않음 |
| 보존/종료 | ordinary11/currentPrefs2 raw사전backup과사후13동일/installed5·WIP25·공유HEADbranchINDEXWORK·globalGitconfig·원본7014metadata 및이전ea24입력/출력10477metadata동일. 자기최종gain0/peak0/directvideo0,ownChrome잔여0·서버52927/61290 정상close뒤ps/listen0,사용자Chrome보존. 최초828B누락/옛Prefs2FAIL소급해소0 |
| 실패 근거 한계 | 초기prototype계측미연결·pause메뉴가림을교정한rawJSON/log/메뉴witness1장을보존. 담당이중복무효PNG등8723172논리B를삭제했으므로실패이미지byte전체보존은아님. 제품compile/GPU실패로오인하거나삭제로FAIL을숨기지않음 |
| 다음 | 새빛/환경강도/노출미세반복0. 기존원담당에source-only 국소알베도/금속·목재부위명암분리 한개방법후보를이어배정. 실패반사기본경로OFF·추가PMREM없음·수명안전보존·원텍스처/GLB/UV/형상/64px/게임수치불변을검증하고sameMac실1x전미채택. 새유료/생성/PCGPU0. 이문서마감으로새제품효과개선을주장하지않음 |

근거: root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/proof-final-9d2691/{FINAL_RECEIPT.json,REPORT.md,manifest.received.json,receiver-receipt.json,root-review.json}`. 원본6뷰·scale1배치의bbox/SHA는manifest와receipt에있다. runtime9d와이후docs-onlycheckpoint/공개·Windows·일반앱설치를구분한다.


## 2026-11-02 22:35 — 국소 재질7d와 최종 원본영상94e의 검수 후보 통합

이 절이 이전2546의 타이틀 선택동기화 대기와6a/9d 반사 후보 상태보다 우선한다. **private 검수용 소스 통합이며 새 GPU/브라우저 PASS·main/public/Unity/Windows설치 완료가 아니다.** 이전9d 실GPU기술PASS/재질RETOUCH 결과는 해당source의이력으로보존한다.

| 항목 | 정확 통합 계약·현재 증거 |
|---|---|
| 원천 | 기존상자owner7d7929a050305e6531a1a67fe83403e870087e0d의module/test와관련계약,최종title94e3a89eddf8339cb24192bf8ad97e4fed09bcf2의필수자산/module/test/tools만선택이식. wholemain/branchmerge0·사용자G원본/WIP수정0 |
| 재질 | chest3d.mjs10554B/SHA b1011604ad33361f7b0834b5fc324f1f507b987da2b1db0689d553fa0894f89d. 6a/9d 대비+1247B. 반사DataTexture/PMREM생성제거·scene.environment null,금속B smoothstep(.12,.55) 기반 선형RGB 국소 gain mix((2.4,1.65,1.05),(5,5.3,5.8)),RGB=1-exp(-RGB*gain). onBeforeCompile/uniform API·cache·해제·오류수치 전부 TRIPO_CHEST_GAME_20261102.md 최신후보표가정본 |
| 영상 | final-main 제공loop와byte동일 video/title_motion_C2_final_20261102.mp46192566B/SHA869895a608475b694d68718ad5af809e0dc8f6fd65204f04adf7db4f011827c3/2036×1016/24fps206frames8.583008초/무음. 신규생성·재인코딩·업스케일0. 원영상인물/달/구름 그대로+기존폭포2개만. 달plate/맥동/구름보강·합성정지판 소비0. 기존파일은 보존/현재소비와분리 |
| 타이틀 흐름 | 2036:1016 중앙cover·전해상도동일원본,모션감소/저사양은동영상의준비된프레임정지·폭포0. cold진입load,영상오류black+메뉴사용가능/media-error,폭포mask오류flowError는보강만중단. 이정확사용자final-as-is계약을과거달합성판정/일반배경확장요구로덮지않음. 현행상세숫자·좌표는스플래시문서최상단 |
| index 보호 | reviewed title 캐시변경·_titleArt정지판연결제거·phase2 titleLoop정지판draw제거의3hunk만. 나머지index전체byte는2546과동일하여완료한Init끝/earlyslot/savehelper교정을보존. game.html은923/2546과byte동일·상자충돌/보상RNG/AI/진행저장변경0 |
| 회귀 | 새재질·최종영상계약 RED13/PASS5→필수정확source반입후GREEN73. 관련16파일합본 **117/117 PASS**;별도보호회귀가슬롯초기값/legacy저장키/비타이틀helper변이3건을실제거절. 최초새GPU셰이더compile/캐시/색/입력/브라우저미검증 |
| 출고 | 공식selector3242,무손실94논리93물리. **sourceplan3236files3974718398B/4GB여유25281602B/max94795327B**(sidecar포함). 실제static복사/prepare/check아님. 기존3 close영상미선택·final영상1개선택. 기존C2보존자산/파생identity·원본은삭제0. 새공식artifact·wholemanifest/HTTP·decode/ActualGL은다음동일Mac검수 |
| 품질/전달 | 새국소재질은한방법한후보·未채택/실物미검증,기존재질RETOUCH. 직접목재/철테/잠금쇠·내측64px OFF/ON/A2와PMREM0/추가texture0/반복program수/GL·fallback·dispose검증필수. 최종타이틀은producer자체기록/原本직접뷰까지,새합본1920/2560/3840실브라우저검수로대체하지않음. public402/Windows미배송경계유지 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-local-material-final-title-20261102/{source-candidate.patch,index-title-only.patch,red-combined.log,green-combined.log,integration-protection.log,official-source-plan.json,producer-material-REPORT.md}. 새코드·필수자산·docs정상commit/privatepush/remote후기존Mac同exact입력→공식buildpreparecheck→實shader/64px A/B·title3화면비루프/정지·오류·offline초기화·무음/保存/正常終了로이어간다.

## 2026-11-02 23:53 — 정확07081a 공식 산출·실GPU·원본1x 검수 인수

이 절은 22:35의 소스 검수 대기를 마감한다. 검수 runtime은 **07081a0cc5ba56f73b94ae1c445818946abdef1f**로 고정하며 뒤따르는 문서 전용 커밋을 새 runtime으로 재라벨하지 않는다. **상자 재질 가독성과 최종 제공 영상 타이틀의 한정 시각 PASS**, 최초 렌더 비용은 미해결·별도 확인 중이다. 전체 채택·공개·일반 앱/Windows 전달 완료가 아니다.

| 항목 | 실제 검수·한계 |
|---|---|
| 정확 입력 | 같은 기존 Mac UI/보호 checkout에서 APFS COW·변경18개 atomic 새 inode. 필수3355경로 Gitblob mismatch0/selected3242/무손실94논리93물리. game/Init끝/earlyslot/save·보상RNG/AI·기존원본불변 |
| 실제 공식 산출 | build→prepare→check 각1회 exit0. stage3236files3974718398B; prepare가69482B sidecar를상위receipt로이동. 실제static **3235files3974648916B/4GB여유25351084B/max94795327B**. sourceplan만으로PASS라한것아님/수동보충0 |
| config/receipt | config1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2 / 파생receipt64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80. 8필수URL fullGET200/MIME/전체SHA·실loadedmodulebody일치 |
| 실GPU·재질 | Apple M5 Pro/ANGLE Metal/WebGL2/Three160,DPR1. 실제64CSS·1920×1080/3840×1080 닫힘/네이티브R160ms완전열림 baseline/OFF/ON/A2. root scale1strip4+1920전체2직접뷰: ON에서갈색목재결/차가운철테·잠금쇠/열린내측구분개선,OFF/A2복귀·실루엣/접지/전리품가독보존. **VISUAL VERDICT: PASS(이재질범위)**,모델전체AAA/자연전투품질PASS아님 |
| 자원·warm | environment null/새PMREM·추가texture0. baseline/A/B/A2 textures4/geometry5/program3. 실draw40회uniform전환에서program/자원/version/cache누적증가0. warm각첫10제외 A116표본 CPUmean/p95 .178/.400ms·GPU .382/.511ms, B117표본 .145/.300ms·.391/.451ms,A2 137표본 .158/.300ms·.386/.514ms. 개별overlay계측이며전체FPS/1%low/VRAM인증0 |
| 최초 비용 HOLD | 첫Scene.onBeforeRender→onAfterRender CPU baseline30.4ms/새A271.2ms. compile/submission/JIT/cache상태가다른1회관측이므로shader단독인과·전체게임멈춤확정0. 수치를숨기거나warm으로상쇄하지않음. 같은Mac에서최대4개의순서교차freshbrowser계측/실render·GLcompile/link·longtask분리후최소후속결정. 현제품값변경0 |
| 실패·수명 | GLB실패native2D/R보상·lateGLB폐기·idempotentdispose/RAF정지·scene비움/owncontextlost·이번후보texturegeometryprogram0 확인. 최초invalidGLSL probe는진단배열초기화오류로false/원문보존;그case만교정후실compileCalls2/문법오류1→제품onShaderError throw/catch/release/nativeR PASS. 원false를소급PASS로덮지않음 |
| 최종 영상 타이틀 | 제공영상6192566B/SHA869895a608475b694d68718ad5af809e0dc8f6fd65204f04adf7db4f011827c3 그대로+폭포2개뿐. 실제1920/2560/3840×1080각10.8993/10.8978/10.8979초 loopwrap·달/부츠/메뉴/가로넘침0. root세화면원본직접뷰 **PASS(현final-as-isbrief)**. 3840달상단약11.91px/부츠하단981.34px;옛배경확장brief검수와별도 |
| 픽셀·정책·입장 | 같은decodedcanvas3840 t1/1.1·t3/3.1의4프레임에서폭포support밖변경0px/haircape/body/sky/rock기저영상동일. farbridge coreY494~514 maskalpha0(경계493/515 blurfeather한계). OS/localreduce·lowtier·atmos0·coldreduce같은영상정지,videoerrorblack+메뉴/fallerror영상유지·보강OFF·hidden/destroy PASS. 실제title→cinematic skip→demo→빈offline→허구QA생성game입장·pageerror0/earlyInit TDZ0. 자연전투/liveAPI인증0 |
| 보존·종료 | ordinary11/currentPrefs2 현재13형태byte·installed5/WIP25/공유HEADbranchINDEXstatus·원본7014/기존9d7034·ea2410477metadata差0. 자기gain0/peak0/Direct0. 自Chrome잔여0/loopback55371:61660 정상SIGTERM·PIDlisten0,사용자Chrome49060보존. 최초828B누락·옛PrefsFAIL소급해소0 |
| root 원본 인수 | 19files16431165B fullSHA일치·PNG12 IHDR대조. root원본/무변형scale1배치10장직접뷰. 비교순서1920baseline/A/B/A2·3840A/B/A2. 소형증거수신은Windows제품배송과별도. 실패·현재비교원본삭제0. root기록저장64000B제한거절후native가이어진운영오류는영수증에보존·단회수락/재전송0 |
| 미완료 | cold비용인과·자연전투/전체맵·physicalmonitor/OS손입력/NW/Unity/전체FPS·main/public/Windows/일반앱배포별도. public402기존계정미납원인·같은CI실패반복0. 9d반사RETOUCH는이력유지/새local방식과구분 |

근거: root I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-local-material-final-title-20261102/proof-final-07081a/{REPORT.md,FINAL_RECEIPT.json,official-artifact-commands.json,performance-resource-summary.json,preservation-and-return.json,manifest.received.json,receiver-receipt.json,root-review.json}; Mac _out/web-local-material-final-title-07081a-qa-20261102. 이번은실산출과동일candidate의원본검수이며source117회귀와구분한다. 문서만마감하므로runtime/suite/영상재생성0.

## 2026-11-03 01:00 — 최초 렌더 4case 진단 마감과 준비 단계 후속

직전 절의 최초 비용 진단 대기를 마감한다. 동일 runtime **07081a0cc5ba56f73b94ae1c445818946abdef1f**의 제품·산출물 byte는 바꾸지 않았고, 기존 271.2ms 관측과 원시 실패 자료도 보존했다.

| 항목 | 최종 인수·다음 범위 |
|---|---|
| 교차 순서 4case | 새 자기 browser A: baseline→후보ON 첫 renderer.render entry→return 24.1/24.6ms, 다른 새 browser B: 후보ON→baseline24.1/25.5ms. 각각Metal/Three160/동일64CSS·camera·world·pause/4texture5geometry3program. 추가 동기GL조회·cache삭제·제품 변경0,case4초과0 |
| 271.2ms 해석 | 예전firstStart 뒤진단getExtension/getParameter/getSupportedExtensions와 매compileShader 뒤 추가COMPILE_STATUS 조회가포함됐다. 동기대기를혼입시킬수있는구체경로확인. 이번cache조건에서는271.2가재현안됐으나,추가조회만의단독원인·완전coldcache·후보성능완치확정0. 초기invalidprobe진단TypeError와정상case271.2를혼동하지않음 |
| 남은 공통 비용 | 기존r160 getProgramInfoLog3회합16.4~17.6ms가주대기관측위치. shadercallback과compile/link호출자체는clockresolution아래~.1ms이며절대0아님. GLBloadAsync20.5~27.6ms/첫textureupload호출CPU1.1~1.2ms별도. rAFgap40.9~43ms는overlay간격/전체FPS아님. 58/56ms LongTask는첫visible진입보다약44ms앞에끝나첫draw원인으로귀속0 |
| 진단·보존 마감 | turn01a19cc0 2026-11-02T15:08:13Z completed/14분20초. 자기Chrome A/B 정상close잔여0,자기server56820/62001 정상SIGTERM 뒤PID/listen0. ordinary13/raw6files·installed5/WIP25/공유HEADbranchINDEXstatus/원본7014·frozen07081/9d/ea24metadata/기존19증거SHA불변. 첫828B누락·옛PrefsFAIL소급해소0 |
| 다음 최소 source 단위 | 기존상자owner의같은7d privatebranch에서해당상자shader준비만최초visible보다앞으로옮기는취소가능준비후보를TDD로구현중. 현재r160 public compile/compileAsync/KHR/isReady/getUniforms 실제원문검토. 단순await compileAsync 뒤disposed검사만으로내부폴링·dispose경합안전PASS0;준비중dispose/late/error/중복해제/타이머RAF·unhandled rejection을RED→GREEN으로증명. KHR없으면기존안전경로·debug shader오류폴백보존 |
| 미검증·전달 | 새준비후보는아직소스구현중/원격·GPU·firstvisible개선미인수. 새제품코드·이문서의성능완료선언0. source완료뒤root정확module차분과관련docs만선택→정상checkpoint→같은Macfreshartifact/실첫사용·수명·오류·보존검수. 타이틀/재질gain/노출/크기/게임수치·보상RNG·저장·원GLB/texture불변,PC usergame·타Unity보호/새GPU0. main/public/Windows·일반앱전달과별도 |

근거: Mac _out/web-local-material-final-title-07081a-qa-20261102/{cold-render-REPORT.md,cold-render-receipt.json,cold-render-analysis.json,cold-render-raw.json,cold-preservation-return.json,proof-transfer-closeout.json}. root recovery/heartbeat-1553-cold-complete-raw.json은실제생성명령·결과·종료원문을보존한다. 원본 재촬영·85걷기/타이틀 전체 suite·build 반복은 하지 않았다.

root 정확파일 인수: cold-profile-closeout/cold-render-REPORT.md 8871B/SHA c75d865ab84cca34e029bdf39d40ba0bd7c5427af52decc8d2c610fd90e1fad9. Mac receipt48408B/SHA a6b46af388a28193ae38db0557a9fbcf1820b86043a37c07259857d5f824407d는metadata와요청필드원문인수이며root전체파일복사완료로주장하지않는다.

## 2026-11-03 01:16 — 취소 가능한 상자 준비6299의 합본 소스 후보

이번은 새소스 후보 통합이며 기존07081a 실GPU·1x PASS와 별도다. root baseline577ecaac2d152b36437e8a58ff2917a0da8c4fda 위에 원담당 **6299db9aa7763453b06208305b2dacc9587b0d2a**의 module/test만 정확 인수했다. 원 담당 branch 전체·구형 index/game·다른 문서를 통째로 병합하지 않았다.

| 항목 | 계약·검증·미검증 |
|---|---|
| 정확 모듈 | chest3d.mjs13681B/SHA e0fe0899ac70bc9f1ed834d919c63f358c7819344a559e5966d146b4032975ed,기존10554B대비+3127B. 새helper모듈/자산/texture0. 기존 localalbedo/mask/gain/cacheid/빛/노출1.25/fov40/64CSS/몸통44×24/R·보상RNG/AI/save 불변 |
| 준비 순서 | Three/GLB·기존재질/그림자뒤 prepareChestRenderer(renderer,scene,camera,{signal}) 완료후ready=true. KHR지원때publiccompile1회·yield전material.currentProgram 고유Set캡처→기존isReady(KHR완료)→고유getUniforms(onFirstUse diagnostics)1회. 추가COMPILE_STATUS/진단getProgramInfoLog0/debug오류검사끄기0 |
| 수명·상한 | CHEST_PREPARE_POLL_MS=10ms/CHEST_PREPARE_TIMEOUT_MS=5000ms 경과제한. 동기GL선점·harddeadline보장0. privateAbortController를release전에abort·timer/RAF/listener/참조해제·이미queuedcallback/취소재진입재예약0. KHR없음unsupported·기존안전firstdraw. 준비결과ready/unsupported/cancelled/실패reject, snapshot.preparation status/pollMs/timeoutMs 관측 |
| 실패·게임 보호 | 준비중native2D/상호작용 유지·ready/active/isShowing false·중복load0. compile/poll/getUniforms/해제program/contextlost/timeout/falseyreject는failed/2Dfallback·1회해제/ownRAF정지. 늦은GLB는disposed/failed 모두폐기,dispose가resolve/rejectcontinuation보다우선하면ready/failed부활0. actualR보상1회는다음실GPU검수 |
| 소스 회귀 | root새계약 **18FAIL/10PASS RED**(기존module)→정확module반영후45GREEN. 관련16파일 **137/137 PASS**,타이틀/Init끝·earlyslot/legacy저장키·출고closure·보호음성회귀 포함. 원담당40CPU와구분;실GPU/성능검수로대체0 |
| 공식 SOURCE plan | selected3242/94논리93물리,sidecar포함3236files **3974721525B/4GB여유25278475B/max94795327B**. prepared예상3235files3974652043B/여유25347957B,69482B sidecar 이동전제. 아직새actualbuild/prepare/check·모듈HTTP·GPU아님/기준완화0 |
| 동등성 | gameSHA02c8a60ca1d01dbc589cb0131db91dc420a5151278118c897aa1b621930ba06f/index/titleJS/finalMP4/GLB·vendor·94매핑 byte불변. 이전07081a색·시각PASS는이새준비후보의동등성검증을소급대체하지않음 |
| 다음 실제 gate | 코드+docs정상privatecommitpush/remote뒤동일기존Mac exactCOW입력/全Gitblob→fresh공식artifact→baseline07081a 대비같은materialON/64CSS/camera의firstvisible와준비메인스레드/rAF/longtask/GLB→ready→3D전체시간교차A/B. 단순히stall을준비구간으로옮겨개선이라고하지않음. native2D/Rpending보상1회·KHR미지원·실shader오류/prepare中dispose/contextloss/timeout/lateGLB·원본같은색/그림자·자원4/5/3/무음保存/종료검수. 최종영상3비율10초/85walk전체반복0 |
| 한계·전달 | source후보/未GPU·未채택. userDota/타Unity보호·PCGPU/Player/build/encoding/서버/대형LAN0. 공개402·main/public/Unity/일반앱/Windows설치별도. 원본/WIP/기존13save/외부guard보호 |

근거: root recovery/chest-local-material-final-title-20261102/cancellable-prepare-intake/{producer-REPORT.md,producer-git-receipt.json,candidate.patch,red-root.log,green-root.log,integration-root.log,official-source-plan.json}; 원담당 I:/EXODUSER-Storage/tripo-chest-game/20261103/cancellable-shader-prepare. 기존root冷진단4case와새준비후보GPU gate를분리한다. source/code·test정확차분과관련8docs만정상commit하며main/CI재실패유발0.


## 2026-11-03 02:00 — 617807 실검수 마감: 수명 통과·성능 재작업

검수 runtime은 **61780714409fffe1fd954277a3d3bf92f4757c89**, 비교 baseline은07081a 실제산출물/local-albedo ON이다. 기존색·GLB·game·타이틀·94매핑 byte를 보존했다. **전체 성능 RETOUCH / 미채택**이며 첫 그리기 구간 단축만으로 전체 표시 개선이나 공개 전달을 선언하지 않는다.

| 실검수 항목 | 결과·범위 |
|---|---|
| 입력 절차 이탈 | 최초3347/4교체는 비ASCII Git경로인용으로 한국어문서6개가 빠진 상태였다. build뒤 NUL구분으로 교정·최종3353/mismatch0/추가6새inode. 최초manifest/journal 보존, 처음부터 전수docs gate를 충족했다고 하지 않음. 런타임입력은 정확했고 문서교정은 산출물에 영향없음. 같은build 반복0 |
| 공식 산출 | fresh build→prepare→check 각1회 exit0(개별명령로그 인수로 확정). 실제3235files3974652043B/4GB여유25347957B/max94795327B. sidecar69482B는상위receipt, config1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2/derivedreceipt64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80. 07081대비module만+3127B, 나머지3234파일 전체SHA동일·수동보충0. module/GLB baseline+candidate4URL fullGET200/MIME/SHA·실modulebody일치 |
| 실제GPU·시각 | M5 Pro/ANGLE Metal/WebGL2/Three160/KHR지원·64CSS/DPR1·1920/3840×1080 닫힘/실R160ms완전열림. producer원본4strip+대표fullview에서목재/철테/잠금쇠/내측/접지·전리품회귀없음한정PASS. 정상실GLSL6개길이/SHA전부동일·textures4/geometry5/program3. 배경/입자/전리품이서로다른시각이라합성RGBA차0을주장하지않음. root원본직접판정은별도인수기록 |
| 준비·수명 | 실제compile1회→isReady false/true→program3개getUniforms각1회후ready. 준비중native2D·실R보상1회/중복0·body중심차단, 취소/저장callback사후호출·owncontextlost·실GLB지연resolve·unsupported·제품5000ms실timeout5015.3ms·실invalidGLSL→failed/release/native2D/R 등10체크PASS. 제어isReady·확장미지원·GLSL주입과자발오류를구분. late-reject별도변형/WASD전체/자연전투미반복 |
| 종료·보존 | own60284/62309정상SIGTERMexit0후PID/listen없음·자기Chrome잔여0/userChrome49060보존. ordinary13/raw6·installed5/WIP25/sharedHEADbranchINDEXstatus/globalconfig·원본7014/기존07081input/artifact7041·9d7034·ea2410477metadata·19증거SHA동일. 자기gain0/peak0/direct0,사용자Dota/OBS/master변경0. 첫828B누락/옛PrefsFAIL소급해소0 |

| browser·순서 | case | 첫visible render CPU ms | prepare compile ms | 준비→uniforms ms | GLB→첫3D제출 ms | fixture→첫3D제출 ms | 인접rAF최대gap ms |
|---|---|---:|---:|---:|---:|---:|---:|
| A/1 |07081 ON|26.9|0|0|59.8|134.8|44.0|
| A/2 |617 ON|4.8|2.9|16.2|44.9|76.6|21.9|
| B/1 |617 ON|4.7|2.7|15.9|63.8|148.9|21.5|
| B/2 |07081 ON|23.8|0|0|61.8|98.4|40.0|

첫순서끼리후보의GLB→제출+4.0ms/fixture→제출+14.1ms,두번째순서끼리-16.9/-21.8ms로혼재한다. 첫observer이전공백65.2/68.8ms·LongTask57/58ms가남았고 인접rAF만으로이를숨기지않았다. 네case의cache·순서변동으로제품인과/전체지연합격을확정하지않음. 첫3D제출은CSSvisible render복귀proxy이며OS/compositor표시시각이아니다. warm10CPU mean/p95 A-baseline .220/.400,candidate .340/.400;B-candidate .270/.400,baseline .370/.500ms는개별overlay표본이다. 전체FPS/1%low/VRAM/physicalmonitor 인증0. 과거271.2ms/이전4case24.1~25.5는그대로보존하고새측정으로재라벨하지않는다.

현재root인수근거: recovery/heartbeat-1655-mac-qa-raw.json 및 chest-local-material-final-title-20261102/prepare-617807-final-root-intake. 원본·최종REPORT/receipt를별도인수하고다음최소한건은남은최초초기화구간원인검토로한정한다. 동일4case재실행·미세poll/색/노출값탐색으로성능PASS를만들지않는다. main/public·Windows/Desktop/일반앱·Unity전달은없다.

root 추가 인수: 최종 REPORT11948B/SHA5a27f13443f54377f4749375040c42fa89df02f3a754f4a76e982a028359b3de 및 FINAL_RECEIPT85683B/SHA656518842a6b8dda68c5da8f10520c493de0267e4201b411279b279d2146a209 포함16파일9162403B 전수SHA일치·PNG6 IHDR일치. root 비교strip4+1920open/3840closed 원본2를 직접 보아 목재·철테·내측·접지의 눈에 띄는 회귀 없음으로 한정 시각PASS. 성능RETOUCH/미채택 유지. 서로 다른시각 합성RGBA차이를 0으로 덮지 않았다. 소형sender61185/62555는새READY뒤만시작·/done200 정상종료요청,최종PID/listen종료인수는별도영수증. 후속은같은기존sourceowner의57/58ms초기화·observer시작점 읽기분석 한 건뿐이며제품변경/새GPU재측정0.
