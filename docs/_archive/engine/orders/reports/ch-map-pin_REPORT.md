# CH-MAP-PIN — 원본 출처 SHA와 승인 리소스 pin 정합성

상태: **요청된 선재 결함2건 수정·회귀 확보·검수 대기**. 두 결함은 공통으로 원본 내용이 같은데 추출 provenance의 main commit이 전진한 경우를 내용 변경과 혼동했다. CH1-06의 기존 맵 Node9실패와는 각각 원인이 다르다. Main·State·저장·맵 형상/배치/충돌/자산 변경0.

## 기준·담당·원로그

| 항목 | 실제 근거 |
|---|---|
| 작업·브랜치 | ch-map-pin / codex/ch-map-pin-20261020 |
| fetch 기준 | 최신 origin/main **249c26fad989071a94c19128e524ce0bbcb2c8c9**에서 --no-checkout·non-cone sparse worktree 생성. 기준/최종 R branch·HEAD·tracked INDEX/WORK 분리 대조 |
| 소유 | WORK_BOARD: CH-MAP-PIN의 맵 소스 도구·테스트, CH1-04/CH2-02 Mac Codex 원담당을 확인. 실제 수정은 Mac CH2 추출 도구1개·CH1 Node 테스트1개·새 Node 회귀1개·보고서/CHANGELOG/작업판 자기 행. Godot 제품 reader/World·핀 상수·데이터·공용 Main/State/저장 수정0 |
| 원로그 경로 | /Users/fordeargamers/exoduser-wt/_out/ch-map-pin/ |
| PC 증거 한계 | Windows G:/exoduser-wt/_out/merge-batch4/는 읽지 못했다. 아래는 **Mac 실제 재현**이며 Windows 자체 재실행·그 원로그와 동일 bytes/원인임을 직접 확인했다고 보고하지 않음 |
| 원본 | 최신 main game.html SHA256 **4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4**. 과거 e556b617·8524bbbb도 git show로 같은 원문 byte임을 검증 |
| 실행 | 기존 Godot 테스트별 USERDIR 상수. 새 Node fixture는 EXODUSER-ch-map-pin-Isolated-20261020- 접두 임시 경로, 실제 제품 파일이 아닌 격리 복사본 사용. 매 Godot 전 pgrep/wc,2이상30초 대기·override 매회 작성/finally0byte. --node-bin 절대경로 인자·stdout/stderr UTF-8 파일 수집. OS.execute 신규 호출0·출력 첫 조각 사용0 |

## 2건 재현·원인·OLD/NEW

### ① CH1 si1 Node 객체 불일치

`baseline-CH1-world`: **5개 중4통과/1실패**, 실패명은 “latest main original full initMapObjects executes with no unseeded RNG; 12 hands plus separate lore”. 실제 불일치는 **오브젝트 수·배치가 아니라 `/source/main_sha` 한 필드**다.

| 위치 | OLD / 관측 | NEW / 보존 |
|---|---|---|
| test/fdgCh1Stage1World.test.mjs 기존17행 | `assert.deepEqual(actual.bundle,stored)`가 원본 내용과 무관한 commit provenance까지 같은 값으로 요구 | 현재19–25행에서 두 main_sha의40자리 형식·각 commit:game.html SHA를 검증. game_sha가 같은 경우에만 main_sha 한 필드를 기록값으로 정규화한 복사본을 **전체 deepEqual** |
| godot/tools/export_ch1_area_resources.mjs:69 source.main_sha | buildAreaSnapshot의 현재 origin/main을 관측값에 기록 | 생성기·리소스 JSON은 수정0. 저장된 과거 관측 기록도 보존 |
| CH1 si1 기록 / 이번 재관측 | e556b617190c325ca39f5add04357f5dea5ca87e → 249c26fad989071a94c19128e524ce0bbcb2c8c9 | 양쪽 원문SHA4d911cdd… 동일, 나머지 전체 필드 byte/JSON 의미 동일 |

원본 `initMapObjects` game.html25735–26471·`_MAP_COMPOSE.1`18172–18177과 실제 메타를 그대로 실행한다. **props13 / hand12 / lore1 / meta77**, 각 위치·role/region·scale/pivot/rotation/flip·PNG byte·벽313rect/25590셀·collider5·isW/canMv6966/LOS400 검사는 유지했다. 메타 전체나 source 전체를 삭제하는 비교가 아니다. `source-field-differences.json`에서 실제 차이가 main_sha 하나임을 먼저 확인했다.

### ② CH2 si4 standalone_scene_ready / resource_manifest_pin

**깨끗한 checkout에서는 reader pin과 리소스 파일 SHA가 이미 일치한다.** 읽기 전용 buildResources로 만든 oracle로 Godot를 실행하면894/0이다. 문서에 안내된 공식 추출 CLI를 실행한 뒤 실패가 재현됐다.

| 단계 / Mac 원로그 | 실제 결과 |
|---|---|
| before/si4_resources.json | SHA **4bf1a8cab02f1ad2b3d199d0b05a155e51bbb59a9ff4911a6cb8c657fd4d0279**. Godot reader RESOURCE_SHA와 같음 |
| readonly-godot | **894/0**, 원본 isW10998/canMv10998/LOS400 차이0·physics40000셀 차이0 |
| baseline-cli-extract | 기존 writeResources가 원문 내용 동일에도 `/source/main_sha`를8524bbbb444fe2e57ce25d773fae24b890747f4a→249c26fad…로 기록해 JSON을 다시 씀. SHA가 **40a3d3ffaac064cb1c873b9e81b84c88caa630c459539faae0f72e5fabc80f38**로 바뀜. 다른 필드 차이0 |
| baseline-cli-godot | **exit1**, `CH2_02_FAIL standalone_scene_ready`, `["resource_manifest_pin"]`. 준비 검사가 false여서 원본 질의 비교 전에 종료. 전체894단정을 실행한 실패로 과장하지 않음 |
| final-cli-extract | 동일 CLI 실행 후 **원래 JSON bytes와4bf1a8ca… SHA·8524bbbb 출처 기록 유지**. 최신 원문 VM oracle은 새로 생성 |
| final-cli-godot | **894/0**, 동일10998/10998/400·40000셀 검사 통과. resource_errors[]·ERROR0 |
| recovery-cli-extract | 실제 baselineCLI가 만든40a3d3ff… 파일을 작업경로에 재현한 뒤 **수정 추출기 자체로4bf1a8ca… 복구**. 깨진 파일 재현 뒤 수동 canonical 복원0·pin 갱신0. recovery-cli-extract.result.json |
| recovered-cli-godot | 복구 후 **894/0**, 원본 질의/physics 차이0·resource_errors[]·ERROR0. verification-summary.json 기준 |

| 원인 / 수정 파일:행 | OLD | NEW |
|---|---|---|
| export_ch2_area_resources.mjs 기존69행·85–86행(현재70·86–115) | source.main_sha는 현재main. writer가 항상 JSON.stringify(new bundle)로 dest를 덮어써 provenance만 변해도 승인 byte pin 깨짐 | main_sha 하나만 기록값으로 치환한 임시 복사본과 기존 **전체 bundle**을 isDeepStrictEqual. 같을 때 현재/각기록 commit의 원문 game SHA까지 증명. HEAD에 버전 관리된 승인 manifest도 전체 native payload와 비교해 같은 경우 그 진짜 출처/바이트를 우선 사용한다. 기존CLI가 이미 main_sha를 다시 쓴 작업파일도 이 검증 뒤 승인 bytes로 재추출 복구. 새 oracle은 항상 최신 원문 실행으로 출력 |
| native_ch2_area_resources.gd:7·27 | RESOURCE_SHA와 파일SHA exact 비교로 불일치 거부 | **변경0**. pin 생략/갱신/자동 허용 안 함. manifest literal·asset SHA/범위·다른 schema·symlink·다른 장/입력 거부도 유지 |
| 실제 내용 변경 | 기존 writer가 새 native bundle 생성 | 같은 경로 유지. 다른 collider 등 native content가 변하면 provenance-only로 취급하지 않고 재추출하며, 다른 byte는 기존 pin에 의해 계속 거부돼 명시 인수가 필요 |
| 잘못된 기록 commit | 내용만 비교하면 없는/위조한 출처도 남길 수 있음 | 잘못된 형식·해석 불가 commit·원문 SHA 불일치는 **쓰기 전에 거부**, 기존 byte·oracle 미생성 보존 |

이 수정은 원래 추출 provenance를 최신 commit으로 꾸미지 않고 과거 artifact의 진짜 기록을 유지한다. 현재 관측의 원본 byte 동일성과 전체 native payload 동일성이 먼저 증명된다. Godot reader·data JSON·원본 PNG·게임 값 수정은 필요 없었다.

## CH1-06 기존 맵9실패와 실패별 대조

같은5파일·37케이스를 재실행해 **28통과/9실패**, CH1-06 원로그의9개 실패 제목과 전부 같았다(`CH1-06-nine-failures-comparison.json`). 요청①/②는 이37개 집합에 들어 있지 않은 별도 테스트다. “낡은 기대값”이라는 넓은 분류가 비슷한 행도 있지만 실제 실패 지점·직접 원인은 다르다.

| # / 기존 실패 | 원인 파일:행 | 직접 원인 | 요청①와 / 요청②와 |
|---|---|---|---|
| 1 overview keeps distant props visible | test/ch1ProductionFinish.test.js:62–66; game.html52292 | 정확 문자열 `_moCull=_mapObjectCullBounds(` 탐색이 실제 `_moCull=_worldViewBounds\|\|_mapObjectCullBounds(`에 안 맞음. VM에 빈 호출 조각이 들어가 `_moCull is not defined` | **다름 / 다름** |
| 2 partial source inspection preserves unknown JSON… | test/fdgMapSourceAdapter.test.mjs:61–62; map-source-adapter.js365–386 | 옛 collision/start/logicalHeight/placements/resources/executionContract pending 경로 기대. 현재는 executionData·engineAuthored 분리 경로 | **다름 / 다름** |
| 3 missing/unknown source stays pending… | test/fdgMapSourceAdapter.test.mjs:185; map-source-adapter.js155 | resources.loadDrawAuthority 기대, 실제 engineAuthored.resourceBindings | **다름 / 다름** |
| 4 regions split at tile midpoint… | test/regionClearGate.test.js:51·harness41; game.html60856 | REGION 전체 block이 브라우저 `new Image()`까지 실행되지만 Node VM Image 없음 | **다름 / 다름** |
| 5 kills attributed to spawn(home) region | 같은 테스트:68·harness41; game.html60856 | 같은 Image 전역 부재(지역 단정 이전 예외) | **다름 / 다름** |
| 6 region clears at80%·Hell Gothic banner | 같은 테스트:80·harness41; game.html60856 | 같은 Image 전역 부재 | **다름 / 다름** |
| 7 stage0 requires Abyssal Angler dead | 같은 테스트:97·harness41; game.html60856 | 같은 Image 전역 부재 | **다름 / 다름** |
| 8 empty region silently cleared at init | 같은 테스트:112·harness41; game.html60856 | 같은 Image 전역 부재 | **다름 / 다름** |
| 9 gate guard kill grants10% | 같은 테스트:128·harness41; game.html60856 | 같은 Image 전역 부재 | **다름 / 다름** |

9건의 원인군은 culling 텍스트 추출1·pending API 경로2·브라우저 부작용 VM 환경6이다. 어느 것도 source.main_sha 비교나 si4 JSON byte pin을 읽지 않는다. legacy-pending-diagnosis.json은 fixture를 현재 호스트의 plain JSON으로 복제한 뒤 실제pending 목록을 읽어 대조했다. 첫 보조 probe의 VM 다른 realm 객체를 그대로 넘긴 진단 오류는 initial-crossrealm 파일로 보존·판정에서 제외했다.

이9건은 이번 요청2건의 수정 대상에 반입하지 않았다. 해당 트랙 검토용 **미적용 OLD/NEW**만 제안한다.

| 원인군 | OLD | NEW 검토안(미적용) |
|---|---|---|
| culling1 | 특정 예전 const 문자열로 시작점 탐색 | 현행 선언·실제 의존을 AST/정확 구간으로 추출하고 worldViewBounds 입력 계약까지 포함해 원래 visibility 단정 유지 |
| pending2 | 옛7개 필드명과 loadDrawAuthority | 현행 SOURCE_INPUT(executionData)·ENGINE_AUTHORING(engineAuthored) 경로 및 분류를 명시 단정. ok=false/project=null/world=null 보호·누락 거부 검사 유지 |
| region6 | 렌더 이미지 초기화까지 포함한 전체REGION block 실행 | 실제 region 함수/상수와 순수 의존만 원문에서 추출해 Node 검사. 브라우저 Image를 임시 전역 주입해 통과시키지 않음 |

## 회귀·RED/GREEN·보존

| 실행 | 실제 결과 |
|---|---|
| 새 fdgMapResourceProvenance | 최초3케이스 RED1통과/2실패. 초기 보존 수정으로3/0이었으나 이미깨진 작업파일 복구2케이스를 강화/추가하여 red-recovery **2통과/2실패**를 확인하고 최종 **4통과/0실패**. 승인 byte 보존·invalid commit 거부·격리 collider 변조 재생성·기존CLI provenance 드리프트 복구, skip0 |
| 대상 CH1/CH2 World Node | **12/0**. CH1은4/1→5/0, 기존 CH2는7/0 유지 |
| 전체 Node | CH1/CH2 source·asset·World + 새4 + QA-007/007b 이식성, **62/0**, skip0. 부하를 줄이기 위해 test-concurrency1 |
| 확장 회귀 초기 실패 | initial-full-CH1-CH2-node는60/1: SV transport oracle이 읽는 server.cjs가 sparse 경로에서 빠져 ENOENT. 필요한 원문 파일1개만 추가한 중간검수61/0, 복구케이스 추가 후 최종62/0 재확인. 서버 실행·저장/제품 수정0, 실패 로그 보존 |
| 기존 맵 Node | **28/9**, skip0, 이전과 동일9제목·새 실패0. 전체 PASS로 합산하지 않음 |
| Godot CH2-02 | 깨끗한 원문894/0 → 기존CLI후 준비 실패1 → 수정CLI후 **894/0**, 실창OpenGL Compatibility/Apple M5 Pro, 오류0 |
| 추가 Godot | CH1-01/02/03/04 **63/0·189/0·75/0·88/0**, CH2-01 **362/0**. CH2-02 포함 native6종 **1671단정/0실패**. P3002 **298/0**·P3003 **43/0**, contracts **5그룹/0**·encounter **3그룹/0**. 모든 exit0·ERROR0·skip0. 기존 Camera2D 보간/P3002 ObjectDB8 WARNING은 원문 유지 |
| native/자산 | CH1 manifest ccb7de62…·CH2 manifest4bf1a8ca…를 포함해 data/PNG와 공유맵 byte 변경0. 원본함수·랜드마크12/105·벽/충돌·P3 분모 변경0 |

새 fixture는 source/PNG/기존 native PNG를 임시 디렉터리에 byte 복사하고 read-only Git pointer·acorn 복사본을 쓴다. symlink/junction 권한을 전제로 하지 않으며 실제 작업 resource JSON을 바꿔 테스트하지 않는다. 격리 fixture의 collider 필드 변조는 provenance-only 비교를 통과하지 못하고 정상 native 재추출 경로로 가는 것을 확인했다. 진짜 원본 내용이 승인본과 다르면 전체 비교에서 탈락하고 새 artifact의 pin 인수가 계속 필요하다. 잘못된출처 거부를 추가했으며 기존 테스트를 삭제/skip하거나 허용 오차를 늘리지 않았다.

## MAP PRODUCTION REPORT (§23)·제출

| 항목 | 이번 범위 |
|---|---|
| MASTER/LARGE/MEDIUM/GROUND | 원본 geometry·outer mass·연결·바닥·배치 변경0 |
| PLAYABLE/LANDMARK | 원본 query·physics·독립 route fixture만 회귀. Main·실제 Player/전투/장 전환 연결0 |
| CAMERA QA | 새 미술·화면 인수 없음, pin 정합성/리소스 로드 실창 회귀만 |
| TECH QA | 기록된 원본 commit/byte 검증·전체 bundle 비교·SHA pin·격리·data byte 보존 |
| VISUAL VERDICT | **기존 FAIL 유지**, 이번 기술 수정으로 시각 PASS를 주장하지 않음. MAPLOOK의 반복 패치·rim·조명·접지 문제는 별도 범위 |
| GIT | 정확 경로 stage·정상 pre-commit·자기 branch만 비강제 push·원격SHA 일치·DONE.txt 후 자기WT 제거. main push/reset/rebase/force/git add -A0 |

최종 SHA·원격 일치·실행 수치·R 보존·제거 영수증은 원로그 DONE.txt/final-receipt.json에 기록한다. PC Windows 자체 회귀 재실행은 미확인이다.
