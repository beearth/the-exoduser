# PC·Mac·Git 통합 — 2026-10-16

| 항목 | 이번 통합의 계약·현재 한계 |
|---|---|
| 첫 웹 통합 기준 | base main c844a3ecd38973e2bc53b8db8af8efe5ca880794. 현재 반영 상태는 아래 후속 단위를 따른다. build-target·player-attack-remaster·WarriorDashFlight·Skill Forge·최신 튜토리얼 배지/난이도 마커를 보존한다. |
| 엔진 원작업 | codex/fdg-engine-studio-20261010 a3fa607f0d27549b6fc269593cb6a3a1af0fb0e1. 공통 base a5537745ca6a9785f704887bc1b4f9d7c80f703f 이후 main407/엔진126 커밋을 분리 보존한다. |
| 원본 보존 | 원 W/R 작업 폴더의 미커밋 파일을 덮어쓰지 않는다. 엔진 원126 DAG는 원 branch와 외부 engine-126-before-sync.bundle로 보존한다. |
| 원격 반영 방식 | 로컬 HTTPS credential 부재/SSH trusted host 부재. 공식 GitHub connector로 검증된 tree를 현재 main의 자식 commit으로 생성하고 expected_sha·force=false로 갱신한다. 원126 SHA가 그대로 원격 merge됐다는 뜻은 아니다. 반영 전까지 원격 완료 아님. |
| 문서 충돌 | 독립 추가는 양쪽 보존, 실제 대체·공식 충돌은 최신 main 우선. POE2_REFERENCE_STUDY.md는 main 원문 byte 그대로 유지. 네이티브 부분 계약은 아래 source pin을 따른다. |
| 네이티브 기준 | 현재 source_combat_commit=9a4534b42f74093095ebc3364a25dd104e93b379. 새 Git 통합은 네이티브 전체 게임의 최신 콘텐츠 이식 완료가 아니다. latest_full_game=false / 전체 시각 RETOUCH. |
| 필수 readonly 이송 | 인수된 런타임 모듈22개를 원 byte 그대로 등록. character_clip·black/parry·map_resource 공개 조립/검사 모듈을 포함. 타인 원파일 수정·HOLD mask/새 geometry/새 아트 없음. |
| combat_qe 추가 채택 | 현재 runtime Git blob a6029ef6efc1d3c36bc29509beb44c5faea9177f를 이번 sync 의존 범위로 새 채택. 56abed32 이후 canonical_q_reflection/reflect_blackbean_q 교정과 BLACK_FIELD_ORDER. 과거 전체 byte 인수로 소급하지 않는다. |
| black 경계 | carrier=trunc(pParryProjDmg(incoming, actual_sbPW)×1.5), bank_add=carrier 또는0일 때10; 기존 0035/0051 계약. 실제 Main의 blackbean_source_carrier_not_adopted 거절 guard를 유지하며 자연 black 활성화 증거가 아니다. |
| Mac 실행 | godot/run.command. FDG_GODOT_BIN→/Applications/Godot.app→사용자 .codex/tools/godot-4.7.2→PATH godot4/godot 순으로 선택. 실행 프로젝트는 런처 자신의 godot 폴더. |
| Windows 실행 | godot/run.cmd. FDG_GODOT_BIN 또는 PATH godot4.exe/godot.exe. 실행 프로젝트는 런처 자신의 godot 폴더. Windows 실기동 미검증. |
| 원근 인자 | 두 source 런처 모두 --fdg-native-perspective-first 사용. 이식 부분본임을 표시하고 전달받은 실행 인자를 보존. 과거 EXE/PCK와 기존 검토 후보를 덮어쓰지 않는다. |
| cold import | 초기 fresh check-only는 slash/hit 시트 캐시 부재로 실패. 공식 Godot asset-only 격리 importer에 실제 필수 whitelist29→31→79개만 노출해 준비한 뒤 Main check-only ERROR0. 파생 cache는 Git에 넣지 않는다. 신규 실제 필수 VFX import descriptor7개만 source에 등록한다. |
| fresh Main 한계 | 같은 실제 입구의 다음 image-wait 준비가 res://assets/map/ch1/collision/pit_lava.png를 요구했다. 해당 HOLD 리소스를 복사·스캔·import하기 전에 중단. 원본 전체 이미지 준비 guard를 건너뛰지 않았고 현재 fresh Main startup 성공은 미완료다. 광범위 자동 import 없음. |
| 웹 소스 이미지 | server.cjs의 FDG_SOURCE_ROOT=path.join(ROOT,'assets','map','ch1'). /fdg-source/ch1-1의 기존 정확10개 whitelist·GET/HEAD·symlink 거절·no-store 유지. 외부 Mac R 폴더 추정 경로를 제거했다. |
| player 방향 병합 | 최신 _playerSpriteDirection/WarriorDashFlight가 고른 방향을 유지하고, 명시 원근 모드에서만 그 방향을 화면으로 투영. 일반 모드의 이동 방향·잔상·깊이 slice·기검참 charge 표시를 보존. |
| 렌더 병합 | 최신 _syncTextFont/드루이드 ground ring/정수 셀 경계/rot tree/보이는 독탄 fallback을 보존. 기존 명시 opt-in의 삼각 투영·billboard push/pop/flush만 함께 유지. |
| QA·저장 | exact r4 QA storage gate에서만 격리 저장·카메라·직진탄/가시 표시 예외. normal saveSettings는 diffV2=1, 실제 저장 data.opt의 구마커 이관과 기본 diff5 유지. 배지 hidden/획득 toastId/render 동작은 최신 main 유지. |
| Mac 현재 실행 | 확인 당시 localhost3333 Node PID18797의 cwd는 /Users/fordeargamers/Projects/exoduser-migration-20261001. 기존 서버/사용자 창을 자동 재시작하지 않았고 통합 WT를 소비한다고 주장하지 않는다. |
| PC 현재 실행 | 직접 실행 경로·HEAD·dirty·기동 확인 미완료. Git ref 존재만으로 PC/Mac/Git 세 곳 완료로 올리지 않는다. |
| 검증 범위 | 새 통합 game9개 inline JS와 server/badge/parry3개 구문 PASS·최신 main named function 삭제0·zsh 런처 구문 PASS. 필요한 새 compile만 수행. 과거 품질 suite·PNG·원화 hash 재검수 아님. GUI 전체 플레이·성능·새 빌드/Steam 배포 미수행. |

## archive 경로 보존

Mac에서 NFC/NFD 이름이 같은 물리 경로로 겹치고 서로 다른 내용인 과거 backup 문서21개는 NFD본을 아래 별도 경로로 옮긴다. 두 원문 blob은 그대로 유지하며 현재 docs·게임 자산 이름은 바꾸지 않는다.

| 원 Git 경로 | 내용 보존 경로 | 원 blob |
|---|---|---|
| docs_backup_before_normalize_20260726/12퍼포먼스·최적화/12퍼포먼스·최적화.md | docs_backup_before_normalize_20260726/_unicode_variants/6278175208ff__NFD.md | 6278175208ffa87afd3cbecce335428df3fa04a3 |
| docs_backup_before_normalize_20260726/14밸런스+수치테이블/스킬_밸런스_리포트.md | docs_backup_before_normalize_20260726/_unicode_variants/9796f71ebb63__NFD.md | 9796f71ebb6362d71fd63112bd992ac912bd25fb |
| docs_backup_before_normalize_20260726/14밸런스+수치테이블/스킬데미지공식표.md | docs_backup_before_normalize_20260726/_unicode_variants/1340585e50dc__NFD.md | 1340585e50dc578a56db5f255f96c0b301ccc4bc |
| docs_backup_before_normalize_20260726/14밸런스+수치테이블/스킬별_DPS_자원소비표.md | docs_backup_before_normalize_20260726/_unicode_variants/d7de6f4b2e06__NFD.md | d7de6f4b2e067ca9fb0b1d58b21f97e88c5167fb |
| docs_backup_before_normalize_20260726/16번역·로컬라이제이션/번역_가이드.md | docs_backup_before_normalize_20260726/_unicode_variants/5103ed2de04b__NFD.md | 5103ed2de04bcbc10d333983ce377c61f2f6ea4b |
| docs_backup_before_normalize_20260726/16번역·로컬라이제이션/번역대상_전체목록.md | docs_backup_before_normalize_20260726/_unicode_variants/a30fe8612644__NFD.md | a30fe8612644897f53421abfe499fafabd301016 |
| docs_backup_before_normalize_20260726/16번역·로컬라이제이션/번역대상_펫대사.md | docs_backup_before_normalize_20260726/_unicode_variants/e887e5c562d7__NFD.md | e887e5c562d7568aa7233b5620c135deee2ce769 |
| docs_backup_before_normalize_20260726/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md | docs_backup_before_normalize_20260726/_unicode_variants/3da46a540312__NFD.md | 3da46a540312adda0d619169c208087569bd18c0 |
| docs_backup_before_normalize_20260726/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md | docs_backup_before_normalize_20260726/_unicode_variants/dacb69f36dd0__NFD.md | dacb69f36dd06608f75b840e4b33d646bbff892c |
| docs_backup_before_normalize_20260726/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md | docs_backup_before_normalize_20260726/_unicode_variants/bb58a9d72cca__NFD.md | bb58a9d72ccadb42a984027e21cdb7a5e7014afb |
| docs_backup_before_normalize_20260726/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md | docs_backup_before_normalize_20260726/_unicode_variants/8b9d93096abc__NFD.md | 8b9d93096abce920d28b85c2f6db919e147b9250 |
| docs_backup_before_normalize_20260726/2_4 펫시스템/대사_스크립트.md | docs_backup_before_normalize_20260726/_unicode_variants/adcd84ba6da0__NFD.md | adcd84ba6da0e8275e81533e98eceed9acf56dca |
| docs_backup_before_normalize_20260726/2게임디자인레벨디자인/2게임디자인레벨디자인.md | docs_backup_before_normalize_20260726/_unicode_variants/e9f0627f9659__NFD.md | e9f0627f96599059522598e1042f79bd8e1b3dc2 |
| docs_backup_before_normalize_20260726/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md | docs_backup_before_normalize_20260726/_unicode_variants/c4990a15ccf9__NFD.md | c4990a15ccf9701a5e3212e61feb2f8ab5e15b4e |
| docs_backup_before_normalize_20260726/3.3 키바인딩+설정/3.3 키바인딩+설정.md | docs_backup_before_normalize_20260726/_unicode_variants/f6033c1ac5f0__NFD.md | f6033c1ac5f0806c8cc7b131c8b52d31613e6607 |
| docs_backup_before_normalize_20260726/5.1임펙트디자인/VFX_구현가이드.md | docs_backup_before_normalize_20260726/_unicode_variants/c3356b4c2057__NFD.md | c3356b4c20578d4c7718d77d39e669ce57ead6fe |
| docs_backup_before_normalize_20260726/8.0몬스터디자인/몬스터_공격시스템.md | docs_backup_before_normalize_20260726/_unicode_variants/589ddf51a424__NFD.md | 589ddf51a4248fa1ed466bcc8a9778cdce644ae5 |
| docs_backup_before_normalize_20260726/8.0몬스터디자인/몬스터_총관리.md | docs_backup_before_normalize_20260726/_unicode_variants/6e126a4682cb__NFD.md | 6e126a4682cb81019da46790fb754cc72eba1829 |
| docs_backup_before_normalize_20260726/8.0몬스터디자인/탄막시스템_총정리.md | docs_backup_before_normalize_20260726/_unicode_variants/8ee9b0e7ed3b__NFD.md | 8ee9b0e7ed3b491334944c2f7187b64bd1bf0fa3 |
| docs_backup_before_normalize_20260726/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md | docs_backup_before_normalize_20260726/_unicode_variants/2d499f92989b__NFD.md | 2d499f92989b9de376c574a3105151adb0b3a053 |
| docs_backup_before_normalize_20260726/9적ai패턴디자인/9_적AI패턴디자인.md | docs_backup_before_normalize_20260726/_unicode_variants/b353b2732ec2__NFD.md | b353b2732ec2ba16a497b24b93c8f4d5cbbd2de9 |

## 필요한 리소스 준비 경계

공식 importer에 게임 프로젝트 전체를 노출하지 않는다. 실제 실패에 나온 허용 리소스만 동일 res:// 상대경로로 빈 격리 프로젝트에 복사하고 기존 .import 설정을 유지해 필요한 캐시를 최초 생성한다. 실제 승인된 whitelist79개 중 파생 cache만 해당 checkout에 두며 Mac 생성 cache를 PC 자립 실행 증거로 삼지 않는다. LAVA 등 HOLD 경로가 필요하면 정확 경로와 caller를 보고하고 해당 준비를 중단한다. 별도 리소스 대체·이미지 가공·준비 guard 제거는 허용되지 않는다.

| 새 필수 importer source descriptor | 동작 |
|---|---|
| godot/assets/vfx/proj_bolt_comet.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Lightning_ImpactLightning_Sheet.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Lightning_Lightning_FBF_4x3.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Fire_FBF_4x4.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Light_ImpactLight_Sheet.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Dark_MediumImpact.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |
| godot/assets/vfx/Dark_DarkSmoke_FBF_4x4.png.import | 원본 PNG byte 불변, 공식 texture importer 설정·res:// 캐시 목적지만 기록 |

## 최신 웹 본편 소스 실행

| OS / 실행 파일 | 현재 checkout 소비 |
|---|---|
| Mac play.command | 런처 자신의 root로 cd 후 FDG_NODE_BIN→확인된 사용자 Node24.15.0→PATH node. 현재 Git HEAD·소스 경로를 표시하고 해당 server.cjs를 실행한다. |
| Windows play.cmd | 런처 자신의 root로 cd 후 FDG_NODE_BIN→C:\\nvm4w\\nodejs\\node.exe→G:\\NODE.JS\\node.exe. 깨진 system32 node shim을 사용하지 않는다. Windows 실기동은 미검증. |
| 포트 | 기존3333을 유지. 이미 사용 중이면 기존 서버를 사용자가 직접 종료한 뒤 실행한다. 기존 서버 강제 종료·자동 재시작·브라우저 입력 없음. |
| 주소 | http://127.0.0.1:3333/index.html. 새 런처의 존재·dry run만으로 기존 실행 프로세스가 최신으로 바뀐 것은 아니다. |

## R 기존 VFX의 main 소비 연결 · 첫 단위

d9e1cbce는 기존 main+W 통합이다. R/main 공통 base aacc7b02 대비 실제 R 변경 중 아래 승인된 VFX 소비만 이번에 3way 결합한다. 다른 R 정상 변경은 판단·통합이 남으며 이번 main-parent child에서 R 전체를 기병합으로 표시하지 않는다.

| 범위 | 실제 현재 계약 |
|---|---|
| 리소스 | 기존 PNG13+JSON13(assets9/data4), atlas runtime1. 원 byte 이송/새 그림0. roots48·다른12계열24장 유지. |
| 보존 | main remaster/Skill Forge/배지·Q/E·원근 opt-in·QA 저장·본체 v3·기존 함수·피해/반경·수명·RNG 유지. Godot 소비 변경0. |
| caller | 기존 draw/BOOM/VFX·비행/착지/사망/Q 표시 경로. deathFX 선택8번째 impactId는 시각 선택이고 기존 caller는 생략. |
| 미채택 | R 신규 boss_lava_erupt24 loader/caller/PNG/JSON·f0/isolated3387·새 모델/리깅·새 패링 cue·비행 크기 변경. main 기존 허용 기능 삭제0. |
| MIME | server.cjs/node-main.js의 .mjs=application/javascript. 기존 서버/포트/저장 경로 변경0. |
| 패키징 소스 | build-nwjs.mjs FILES에 atlas runtime1/data JSON4/필수 QA storage JS1의 정확6파일 추가. assets 재귀 복사에PNG13/metadata9 포함. 실제 빌드/Steam 배포0. |
| 새 정적 영향 | game9 inline+server/node-main/build/runtime4 구문 PASS. main 함수 삭제0, 소비 caller13 정적 연결/crop13/packaging6 확인. 실제 server handler에 포트 bind/저장 없이 mjs 요청→HTTP200/type 확인. |
| 새 Main 로더 | 격리 headless Chrome의 합친 game.html에서13계열 Image decode/clip ready·QA storage active=true/legacy rig explicit=false/page error0. lazy loader5개만 준비용 호출. actor/clock/HP 조작·기존 창 입력0. |
| 검사 이력 | 첫 브라우저 검사는 meteor의 실제 등록 sh.img를 놓쳐 null 읽기로 실패. 검사만 실제 소비 표면으로 교정한 뒤 같은 실패 범위 재실행. 실패 기록 유지. clip 정규화 객체의 name은 공개 필드가 아니므로 계약표 id는 원 JSON을 사용. |
| 한계 | 자연 전투13계열 재생·GPU 픽셀/성능·전체 품질 증거 아님. 옛 suite/PNG hash/receipt 재검사0. native latest_full_game=false/RETOUCH 및 LAVA 준비 미완료. R 다른 정상 변경/실 R source·PC 실제 실행 미완료. |

### 장수와 시간 계약

장수·리소스 fps·기존 게임 진행·화면 fps를 구분한다. 전부24FPS로 변경한 것이 아니다.

| id | 장수 | 리소스 fps | loop | 원화 크기 | grid |
|---|---:|---:|---|---|---|
| boss_death_blood | 24 | 15 | false | 3840×2560 | 6×4 |
| boss_meteor_hit | 24 | 30 | false | 4608×3072 | 6×4 |
| druid_dust | 24 | 25.714285714285715 | false | 3264×2176 | 6×4 |
| druid_hit | 24 | 25.714285714285715 | false | 3072×3072 | 6×4 |
| druid_orb | 24 | 42.857142857142854 | true | 3840×2560 | 6×4 |
| druid_poison_hit | 24 | 60 | false | 3840×2560 | 6×4 |
| druid_poison_pool | 24 | 24 | true | 4608×3072 | 6×4 |
| druid_roots | 48 | 41.142857142857146 | false | 3584×2688 | 8×6 |
| druid_shockring | 24 | 25.714285714285715 | false | 4608×3072 | 6×4 |
| boss_fire_impact | 24 | 16 | false | 3840×2560 | 6×4 |
| boss_water_impact | 24 | 16 | false | 3840×2560 | 6×4 |
| firedevil_orb | 24 | 19.8 | true | 3840×2560 | 6×4 |
| kraken_water_orb | 24 | 10.8 | true | 3840×2560 | 6×4 |

| 새 웹 staging 선택 확인 | build-web의 기존 selectWebRuntimeFiles를 현재 후보 source 목록에 적용해 새 필수27파일 누락0. staging 출력 생성이나 export 실행 없이 선택 결과만 확인했다. |


## 실 Mac 웹 소스 정렬·서버 오류 처리 후속 (2026-10-16)

| 범위 | 반영 상태·한계 |
|---|---|
| 실 Mac 웹 첫 정렬 | R codex/mac-live-main-20261016을 main2ad26d93에 정상 tracking 전환. localhost3333 GET game.html 4178768B와 atlas mjs가 WORK/HEAD와 byte일치. 기존 탭 메모리/실행 중 server.cjs 코드 재로드 증거가 아님 |
| 원 작업 보존 | 원9a branch와 exact30physical/51logical의 INDEX·WORK 분리 stash, 이름 있는 refs/fdg-preserved/r-source30-20261016 및 r-source30-resume1-20261016 보존. 새 main apply/pop/push 없음 |
| 추적 설정 | 기존 backup 전용 fetch refspec 보존 후 비강제 refs/heads/main:refs/remotes/origin/main만 repo-local 추가. 전후 exact fetch값은 외부 기록, 변경 전 전체 config byte backup은 없음 |
| 이번 서버 소스 | R 공통base aacc7b02의 committed server.cjs/node-main.js delta만3way 결합. 개발 PORT/HOST·EXODUSER_SAVE_DIR·atomicSaveJSON/ETag/Range, NW save/mats 오류500. main gzip·release/saveNamespace·mjs MIME·FDG source whitelist 보존 |
| 저장·HTTP 정본 | docs/15 세이브+데이터구조/15 세이브+데이터구조.md 및 docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md의 2026-10-16 현행 계약. 새 저장 포맷·사용자 데이터 이관 없음 |
| 새 검증 | JS2 구문 및 포트 없는 자기 임시 파일/VM handler의 13검사 묶음 PASS. 기존 VFX/served/old suite·PNG proof 재실행 없음. 실제 API/save/환경 접근·서버 재시작0 |
| 남은 범위 | 실행 중 서버 자동 재로드0. PC 실행·나머지 R delta·Godot 전체 이식/품질·native cold LAVA 준비 미완료. 이번 commit의 parent에 R9a를 연결해 전체 통합으로 표시하지 않는다 |


## 환불 합계 계산 source 통합 (2026-10-16)

| 항목 | 현재 계약 |
|---|---|
| 제품 | R의 refundTotals 한 함수만 채택. SP는 Number(grit)+ΣNumber(stats 값), AP는 기존 COSTS=[1,1,1,2,2,2,3,3,3,5]/10단계23/초과5 유지 |
| 반복·경계 | level 숫자 변환·ceil·음수/NaN→0. passive당 최대10단계 순회 후 초과비용 곱셈. 레벨 cap·새 경제·저장 포맷 변경 없음. 세부 Infinity/NaN 의미는 정본 유지 |
| 실제 소비·캐시 | 공개 evaluatePlan/실game 초기화 환불을 사용. game.html의 stat-panel-ui.js query만20261016-refund-totals로 갱신 |
| 검증·제한 | 격리 새영향6묶음/module구문/cache 한줄 변경 PASS. 첫 fixture export lookup 실패 후 fixture만 수리, 이력 보존. 실제 사용자 상태·save/API·서버 재시작·PC 확인0 |
| 정본 | docs/3.1 ui hud 디자인/능력치_패시브_개편_20260909.md의 환불 합계 절. 기존 단계비용·계획 원자 적용·확인/저장 권위 유지 |


## 입장 예약의 요청 수명 가드 (2026-10-16)

기존 R의 showCharGate request 가드만 main에 결합했다. isolated3387 query carry·새 저장 복원·새 진입 권위를 추가하지 않는다.

| id / 적용 위치 | 현재 계약 |
|---|---|
| 예약 시작 | index.html showCharGate(charId,storySeen=false) 진입 시 const request=_characterLoadSeq 캡처. 이 함수는 요청 번호를 증가시키지 않는다 |
| 예약 실행 | 기존 setTimeout 1200ms 유지. callback 첫머리에서 request!==_characterLoadSeq이면 return. 같을 때만 기존 window.location.href 대입 |
| 기존 취소·재요청 | _goLogin/_goCinematic 및 loadCharacters/loadLocalCharacters의 기존 ++_characterLoadSeq가 이전 예약을 무효화. 새 취소 writer나 timer clear·debouncer 없음 |
| 반복 요청 의미 | 요청 번호가 달라진 두 예약은 실행 순서에 관계없이 새 번호만 이동. 같은 번호에서 두 번 호출한 경우 두 callback 모두 허용하는 기존 R 의미 유지 |
| 정상 경로 | offline test slot 인코딩, online char/선택 slot 이름, demo의 slot=demo&demo=1, storySeen의 story=warrior-v21 suffix 유지. 1200ms/로고 preload/선택·remaster 변경 없음 |
| 부수효과 경계 | demo 활성화·loading·로고 preload는 기존처럼 예약 전에 수행. stale callback은 이동만 중단하며 기존 activation·loading을 되돌리지 않는다. demo 활성화 실패는 기존 hideLoading/오류/예약0 유지 |
| 새 검수 | 격리 실제 showCharGate/직접 callback의 정상URL·demo실패·늦은취소·서로 다른 요청의 양쪽 실행순서·같은번호반복·가드외본문불변6묶음 PASS. 해당 inline script1개 구문 PASS. 전체 Startup/실브라우저·사용자 save/API 실행은 아님 |
| 보호 범위 | 3387/classic/ch1Three/ch1Rig/webgpu carry 미채택. MAP·package·패링별도dependency·game-easy-test/Godot/HUD 변경0. PC/잔여R전체이식 미완료 |


## R 상호작용 입력 freshness·reset의 main 통합 (2026-10-16)

기존 R committed 입력 전용 변경을 현재 main에 분리 결합했다. 일반 isJust/isHeld/_chkJust/_chkHeld, 포털·줍기 본문, Q/E 판정·피해·자원·HOLD 기능은 변경하지 않는다.

| id / 실제 적용 위치 | 현재 계약 |
|---|---|
| _interactKeyFresh | 키 코드별 Map. 기존 public keydown의 통과 지점에서 현재 주요/보조 interact 코드이며 !e.repeat일 때만 true. 기존 K/KH 등록 유지 |
| _consumeInteractCode | 기존 _chkJust를 소비한 뒤 키보드는 fresh=true와 함께 성립해야 새 누름. 존재하는 Map 항목은 false로 변경, keyup은 항목 삭제 |
| 주요/보조 | _consumeInteractPressed는 두 코드 소비를 모두 실행 후 OR. 주요키가 true여도 보조키를 남기지 않는다. 기존 실습 allows('interact')가 거부하면 소비하지 않음 |
| current update | 기존 R 소비 위치에서 pending이면 P._pickHoldT=0 후 pending=false. _interactPressed를 한 번 계산·재사용. 새 누름에서 기존 _usePlayerPortal 우선, 포털이 사용되지 않았을 때만 기존 상호작용 본문 |
| 홀드 | 같은 tick의 fresh가 false이고 _interactHeld가 true인 경우만 기존 홀드 본문. 키보드는 Map 등록과 기존 KH 모두 필요. 기존 P._pickHoldT+=sp/임계>=9 게임 tick·획득 배열/순서/수치 그대로 |
| 마우스·패드 | mouse 바인딩은 Map을 우회하고 기존 MBjust/MB 소비·홀드 유지. 패드 키보드는 기존 _gpInjectKey의 public KeyboardEvent 경유. 물리 패드 실기 검증 아님 |
| _resetInteractInput | Map.clear와 pending=true만 수행. P/HP/좌표/clock 접근 없음. 초기 P 부재에도 안전. reset 뒤 다음 유효 새 누름은 정상 처리 |
| reset caller | _clearHeldInput의 기존 blur/hidden 경로, initStage, 실제 dead 전이, 기존 retry handler, interact 주/보조 재지정·보조삭제, 키초기화·프리셋, 패드 키보드/마우스 재지정·패드초기화 |
| retry 경계 | 현재 main의 기존 retry handler 시작에 입력 reset 한 줄만 추가. R의 별도 유효 retry guard/메뉴 동기소비·focus·재시작 권위는 미채택이고 그 기존 main 본문은 유지 |
| 공유 레슨 | parry-lesson.js resetPose의 기존 K cleanup 직전에 typeof 확인 후 reset1줄. API가 없는 Easy/다른 consumer는 기존 cleanup. main script query만20261016-interact-reset으로 갱신. Q/E·반사·피해·실습자원/동작 본문 변경 없음 |
| 미채택 | h102 추가 inventory selector, h107/199 HG·rift, h431 retry권위·3387 carry·기타HOLD. game-easy-test 본문 변경0. docs/2_3 수정0 |
| 새 검수 | 격리된 현재 public keyboard handlers + 실제 update dispatch 표현식의8묶음 PASS. 목적 동작은 stub이며 포털·줍기/홀드 본문 byte 불변을 별도 확인. 공통 edge/held 함수 불변·현재패드 주입·실습reset API 부재fallback·전체 inverse 복원 확인 |
| 구문·실패 이력 | 변경 inline1과 공유 레슨1 구문 PASS. 초기 작성 스크립트의 preset 중복2곳 guard에서 쓰기전 중단 후 _loadPreset로 scope 한정. 검사 fixture는 keydown3개 중 실제소비자 선택 및 최소 DOM stub 부재를 교정; 각 실패 JSON 보존. 제품을 검사 편의로 변경하지 않음 |
| 실제 미검증 | 사용자 GUI/save/API·실player HP/coords/clock/AI 강제설정·Startup전체·GPU/화면 품질/전체게임·물리패드·PC 실행 없음. 실행 중 서버 재시작0. 잔여 R 문맥 분류·전체 이식 완료 아님 |

## 인게임 공유 확인창의 단일 대기 요청 (2026-10-16)

R의 기존 gameConfirm pending resolver 가드 한 줄을 main에 결합했다. 로비의 별도 삭제/종료 확인창과 _delConfirmBusy 계약은 변경하지 않는다.

| id / 실제 적용 위치 | 현재 계약 |
|---|---|
| pending 검사 | game.html gameConfirm의 첫 줄에서 if(_gcResolve)return Promise.resolve(false). 기존 대기 요청이 있을 때 후속 요청만 취소값 false로 비동기 반환 |
| 첫 요청 보존 | pending 요청의 메시지·HTML 모드·확인/취소 문구·onclick·resolver를 덮어쓰지 않음. 중복 요청에서는 DOM 쓰기/창 재열기0 |
| 정상 응답 | 기존 첫 확인은 true, 취소는 false. 기존 버튼 handler가 on 제거와 _gcResolve=null을 처리. 반환값·기본 확인/취소 문구 유지 |
| 다음 요청 | 창이 닫혀 resolver가 null이면 새 요청을 기존처럼 표시. 큐·자동 확인·새 timer·새 authority 없음 |
| 실제 소비 | _skResetSkill 등의 기존 if(!await gameConfirm(...))return 경로. 첫 요청 처리와 취소 반환/이후 비용·스킬·세이브 검증 본문 유지 |
| DOM 범위 | 기존 gameConfirm 본문은 그대로. 신규 DOM parent 내용 교체·UI 디자인·초점 권위 변경 없음. 실제 HTML 렌더링/전체 Startup 검수 아님 |
| 새 검수 | 격리 public gameConfirm 및 실제 스킬 확인 gate+목적stub의5묶음 PASS. 동시요청 거부·첫 resolver/메시지/버튼 보존·확인/취소·재개·기존 HTML 모드·전체파일 inverse 확인. 변경 function 구문/실행 확인 |
| 한계 | 실user GUI/state/save/API 접근·자동입력0. 실제 스킬 비용집행/화면품질/PC 검수 없음. game-easy-test·Godot/HOLD·기인수기능·docs/2_3 변경0. 잔여R statement 의도·승인 분류와 전체 이식 미완료 |

## 세이브 패시브의 기존 R 숫자 변환 (2026-10-16)

현재 main의 dbRestore known-key 복원에 빠진 R h18의 unary + 한 글자만 통합한다. 새로운 패시브·기본값·상한·비용·마이그레이션이나 저장 권위를 추가하지 않는다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| 생산 복원 seam | if(d.passives) 순회에서 PASSIVES.hasOwnProperty(k)인 대상 키에만 PASSIVES[k]=+d.passives[k]\|\|0. 기존 순서/키 허용목록 유지 |
| 바깥 필드 | passives 자체가 absent/null/false/0/빈문자열 등 falsy이면 기존 PASSIVES 객체·값 유지. raw에 없는 개별 키도 기존 값 유지 |
| 개별 값 | 존재하는 허용 키의 숫자 문자열은 숫자로 변환. NaN/undefined/null/빈문자열/false 등 변환 뒤 falsy는0, true는1. R의 unary + 후 논리OR0 의미 그대로 |
| 범위 정책 | 음수·소수·Infinity 등 truthy 숫자는 R과 동일하게 유지. 정수화·유한값 검사·clamp/cap을 추가하지 않는다 |
| identity | 기존 PASSIVES 객체를 유지하고 허용 키의 값만 대입. 알 수 없는 키·다른 save field·unique/item/slot identity에 변경 없음 |
| 현행 숫자 소비 | renderStatPanel.queuePassive의 기존 (PASSIVES[key]\|\|0)+대기개수+amount 조건에 숫자를 공급. 정상숫자·기존상한/투자비용/피해공식 유지 |
| 별도 미채택 | h17 unique명, h19 legacy qslots, h20 bagMax 및 h14/21 저장producer owner는 이 단위에서 변경0. 폐지된 퀵슬롯 UI·자동사용을 복원하지 않음 |
| 새 검수 | 생산 PASSIVE_DEF/known-key 초기화·dbRestore의 실제 해당 statement와 current queuePassive guard를 합성 데이터에서 격리 실행한6묶음 PASS. 목적 동작은 stub이며 투자·전체dbRestore/Bootstrap·실사용자save/settings/API/HPcoordsclockAI/GUI를 실행하지 않음 |
| 변경 범위 | game.html 해당 한 줄의 +만 변경·전체파일 inverse 확인. 기존 복원 순서·기인수기능·Q/E·initStage·3387/HOLD·docs/2_3 미변경. 전체R/PC/품질 이식 완료 아님 |

## 2026-10-16 가방 용량 복원의 기존 R NaN 방어

| id / 적용 위치 | 현재 계약 |
|---|---|
| bagMax → BAG_MAX | dbRestore의 기존 위치에서 BAG_MAX=Number.isNaN(+d.bagMax)?300:d.bagMax\|\|300. 원 R h20의 독립 누락만 채택 |
| 잘못된 숫자 텍스트 | 숫자 변환 결과가 NaN이면 기존 기본 용량 300을 사용. 예: invalid 문자열로 행 수가 NaN이 되고 용량 비교가 무효화되는 경로 방지 |
| 결측·falsy | absent/undefined/null/false/0/빈문자열은 기존 논리 OR와 동일하게 300 |
| 기존 값 보존 | 숫자로 변환 가능한 truthy 입력은 원래 값·형식 유지. 숫자 문자열을 숫자로 저장하지 않으며 새 상한·하한·정수화·유한값 검사 추가 없음 |
| 현재 소비 | _invRows의 Math.max(10,Math.ceil(BAG_MAX*4/INV_COLS)), INV_COLS=10 및 withdrawStorage/withdrawBonePart의 INV.bag.length>=BAG_MAX 검사. 가방 공통 기본 용량 300 유지 |
| 저장·범위 | 직렬화 키 bagMax·복원 순서·아이템·좌표·이동 성공 시 기존 저장 호출 유지. uniqueArt, legacy QSLOTS, 지연 저장 owner 및 HP/QE 변경 없음 |
| 검수 범위 | 자기 합성 입력과 실제 복원 statement/_invRows/withdrawStorage를 격리 실행. 목적 함수는 stub. 실제 사용자 세이브/API·전체 dbRestore·열린 게임·PC 검수의 증거로 사용하지 않음 |

## 2026-10-16 구세이브 qslots 파서의 기존 R 입력 방어

| id / 적용 위치 | 현재 계약 |
|---|---|
| 기존 분기 | dbRestore의 if(d.qslots)는 그대로. absent/null/false/0/빈문자열이면 기존 QSLOTS 객체·값 유지 |
| 복원 길이 | truthy 배열은 Math.max(4,d.qslots.length), truthy 비배열은 4. Array.from으로 빈 원소를 포함해 채움. 추가 슬롯은 자르지 않음 |
| 원소 | null·primitive·배열 원소는 {type:null,count:0}. 배열이 아닌 truthy 객체는 기존 POT 타입 검사만 거쳐 보존 |
| 호환 | 객체의 truthy type이 POT에 없으면 기존과 같이 빈 슬롯. 그 외 객체의 참조·count·추가 필드는 그대로 보존하며 원본 세이브 배열을 수정하지 않음 |
| 실제 잔여 소비 | updateHUD의 앞 4개 QSLOTS[i].type 읽기와 qsCooldown[i]>0이면 POT 초 표시하는 기존 루프가 남아 있음. 짧은 배열·null 원소 때문에 파서나 이 루프가 예외를 내던 누락 방어 |
| 폐지 UI | 1~4 스킬 전용, 빈 슬롯 클릭 스킬 배정, 구 useQuickslot 수동 마시기·qsAuto 토글 폐지 유지. 이번 변경은 구세이브 호환 파서이며 UI 복원이 아님 |
| 검수·경계 | 자기 합성 입력과 실제 복원 if/updateHUD 내부 루프만 격리 실행. 전체 dbRestore/HUD·실제 세이브/API/화면 검수 아님. bagMax·uniqueArt·저장 producer·HP/QE 변경 없음 |

## 2026-10-16 기존 R 지연 저장 요청 소유자·완료 연결

| id / 적용 위치 | 현재 계약 |
|---|---|
| 채택 범위 | 원 R h14/h21/h453/h455. dbSaveNow·새 _drainPendingSaveNow와 기존 cloud/local/web 3개 완료 tail의 호출만. RIFT boot h454/h456·saveStateReady·초기화 권위 미채택 |
| 예약 | 기존 _dbReady 검사·이전 _saveDebounce 취소·500ms 유지. 요청 시 charId=_charId, charIdx=_charIdx, player=P 참조, save=dbSave 함수 참조만 캡처. 게임 데이터 snapshot·새 serializer 없음 |
| 타이머 만료 | 먼저 _saveDebounce=null. _dbReady가 false이거나 네 소유자 값 중 하나라도 다르면 dbSave를 호출하지 않음. 같은 소유자는 실행 시점 현재 데이터로 기존 dbSave 호출 |
| 저장 중 요청 | _saving이면 dbSaveNow.pending에 요청을 보관하고 반환. 저장 중이 아니면 pending=null 후 기존 dbSave 호출 |
| 완료 tail | 기존 _saving=false 직후 _drainPendingSaveNow 호출. pending을 읽고 즉시 null로 비운 후 현재 준비·동일 소유자 검사 통과 시 기존 dbSave 호출. cloud catch 뒤/local·web finally의 원 위치 유지 |
| 기존 강제 저장 | 뒤따르는 _pendingForce 처리와 Date.now()-_lastSaveTime>=5000 식 유지. 자동 저장 간격 30000ms·최근 성공 10000ms 게이트 및 dbSaveForce 최소 5000ms 정책 불변 |
| 저장 권위 | 실제 dbSave의 QA/연습/준비·busy admission, backend·직렬화·성공 시각은 원 함수 소유. helper는 성공을 기록하지 않고 기존 저장을 요청할 뿐. 최신 상태의 영구 저장 완료 보장은 아님 |
| 범위·검수 | 자기 합성 소유자·가짜 timeout callback·목적 primitive stub로 실제 helper/공통 완료 tail을 검수. 실제 시계·게임 타이머·세이브/API·부팅 실행 없음. native helper/current collector·HOLD·3387 수정 없음 |

## 2026-10-16 기존 R BGM 페이드 타이머 소유자 방어

| id / 적용 위치 | 현재 계약 |
|---|---|
| 채택 | R h23~h28의 BGM _onEnded/play/stop/fadeOut만. 현재 본편 death·victory·INTRO의 fadeOut 호출에서 쓰는 기존 객체이며 다른 구현으로 재정의되지 않음 |
| stop | 기존 _fade를 지역 fade로 캡처하고 _fade=null 후 fade!==null이면 clearInterval. 기존 onended 해제/pause/currentTime=0/_cur·_curKey 정리 유지 |
| fadeOut | 현재 Audio a와 step=a.volume/(dur/50), 50ms interval 유지. 이전 fade 정리 뒤 지역 interval 핸들 fade를 저장하고 this._fade=fade |
| 늦은 callback | this._fade!==fade이면 즉시 반환하여 새 fade를 건드리지 않음. this._cur!==a이면 자신의 fade만 clearInterval/null 후 반환. 같은 캐시 Audio를 다시 재생해도 이전 callback은 새 재생 음량을 바꾸지 않음 |
| 정상 완료 | a.volume=Math.max(0,a.volume-step). 0 도달 시 캡처한 fade만 해제하고 기존 Audio의 onended=null/pause/currentTime=0, 동일 _cur의 참조·키 정리 |
| 곡 종료 전환 | _onEnded가 다음 src를 찾은 뒤 기존 fade를 해제/null로 만들고 기존 다음 곡 재생 경로를 실행. 다음 src가 없으면 기존 return 유지 |
| bgmTrack 입력 | 개별 트랙 잠금은 !force && typeof OPT.bgmTrack==='string' && OPT.bgmTrack.startsWith('t:'). 비문자 truthy 설정에서 startsWith 예외 방지. 설정값을 교정·저장하거나 새 기본값을 만들지 않음 |
| 기존 계약 | _vol=0.3·트랙 목록·장 우선/전체 랜덤·t: 직접 선택·force·INTRO 게이트 및 300/500/800ms fadeOut 호출 유지. autoplay 지연 재생·오디오 캐시 정책 변경 없음 |
| 검수 경계 | 실제 BGM 객체와 공개 메서드를 자기 Audio/interval 대역에서 검수. 실제 오디오·시계·게임 창·설정/API 변경 없음. 음질·주관 청취·실제 브라우저 autoplay/전체 플레이 검수의 증거는 아님 |
