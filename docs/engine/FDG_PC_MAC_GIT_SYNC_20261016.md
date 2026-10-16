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

## 2026-10-16 기존 R 텍스처 작업·컨텍스트 소유권 통합

| id / 적용 위치 | 현재 계약 |
|---|---|
| 채택 범위 | h29의 _texPreJobs, h30~35, h42의 _texPreReset, h43~45, h46의 core reset만. 실제 _warmupEnsAtlas→_texPrewarmHot 및 loop→_texPreDrain 소비에 연결 |
| 작업 | _texPreJobs Map의 URL별 {src,context:_texBySrc,status:'pending',bmp:null}. 같은 컨텍스트의 기존 작업은 URL이 GPU Map에 아직 없을 때 재사용. 상태 pending/decoded/ready/failed/stale |
| 입력·예산 | HTTP(S), finite 양수 px, 기존 _TEXHOT_BUDGET_PX=64e6 유지. 기존 URL 등록·seen 검사 유지. _TEXHOT_INFLIGHT=2, _TEXHOT_QMAX=4; pump는 대기 비트맵 수+진행 중 수<4일 때만 추가 시작 |
| 비동기 완료 | fetch→blob→createImageBitmap(premultiplyAlpha:'none') 유지. 작업이 stale이거나 컨텍스트 Map 참조가 바뀌면 bitmap을 닫고 업로드하지 않음. 실패는 failed, finally에서 busy 감소·pump |
| _texPreClose | bitmap 참조를 먼저 null로 옮기고 close를 try/catch. _texPreReset은 작업을 stale로 표시·대기 비트맵 닫기·Q/Wait/Jobs 비우기. 진행 중 작업의 busy 슬롯은 Promise가 끝날 때까지 유지 |
| init/loss 연결 | 기존 _initWebGL의 새 Map 생성 전에 reset. 기존 contextlost의 _texBySrc/_texAdoptBitmap=null 직후 reset. 원 GL·배치·복원 이벤트·성공 판정·동기 폴백은 변경하지 않음 |
| 프레임말 drain | 기존 프레임당 1장 유지. 컨텍스트/GL/adopter 유효 시 동일 URL 중복 업로드 생략 후 Map 등록 여부로 ready/failed. 조건 불일치 stale, 예외 failed, finally에서 bitmap 닫기 |
| 업로드 | 기존 LINEAR/CLAMP 필터·픽셀·크기 유지. _texAdoptBitmap의 JavaScript 예외는 만든 texture delete 후 throw, finally에서 기존 _curTex 바인딩 복원. GL.getError 검사 추가 없음; ready는 Map 등록 상태이며 실제 GPU 성공 검증이 아님 |
| 분리된 R 부분 | _texPreContextLost flag와 _warmAsyncTarget/_warmAsyncJob 기반 general-Image handoff·_wqGpuImages 재예약은 이번 단위 미채택. 현재 main에 두 helper가 없으므로 해당 의존성을 임의로 연결하지 않음. 별도 잔여 판정 대상 |
| 보존·검수 | 원 시드22/학습96/최소250000px·64MP·기존 호출/동기 Image 경로/에셋 불변. 합성 fetch/Bitmap/GL/컨텍스트 Map과 실제 함수·초기화/loss core statement만 검수. 실제 GPU·context 이벤트 전체·프레임 성능·픽셀/readPixels·사용자 창·localStorage/API 검수 아님 |

## 2026-10-16 기존 R same-render 몹 피격 프레임 소비 통합

2026-10-08 R의 ROOT-CH1-HITFLASH-CURRENT-FRAME own10hunk 계약을 현재 main의 PM-014에 통합한다. 앞선 idle 셀 재선택·고정 크기 설명/검수는 당시 이력이며 아래 레이어 소비를 검수한 것으로 소급하지 않는다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 범위 | R h36~41/159/377/378/380의 관측·flash 소비만. 현재 일반 8dir base→walk 및 전용 중형 본체가 실제 호출한 Image/crop/rect 순서 재사용. stage/URL opt-in 한정 아님 |
| private 상태 | _enemyHFFrames Map(e→layers), _enemyHFSubmitted Set(bucket). _prepEnemyInstanced 진입에서 clear. 기존 GL 준비·일반 body reset·조기 반환 유지 |
| 기록 | hitFlash>0만 [img,sx,sy,sw,sh,x,y,w,h,bucket]. e 객체 identity로 구별. 이미지/animation/텍스처 소유권 없음 |
| GL 관측 | _queueEnemyHFFrame은 기존 queue true 뒤만 기록. nominal world rect=x−VW/2+cam.x−w/2, y−VH/2+cam.y−h/2. GL.drawArraysInstanced가 throw 없이 반환한 뒤 bucket 표시. snapshot은 표시와 _ens8GLImgs[bucket]===img 모두 필요. 실제 body 픽셀/GPU 성공 ACK 아님 |
| Canvas 관측 | _drawEnemyHFBody는 원 X.drawImage 뒤 !e._ensGLMode일 때 e.x+x/e.y+y/w/h 기록. throw는 기록 없음. queued body Canvas 중복은 flash용으로 다시 기록하지 않음 |
| flash | 실제 base→walk 순서, 별도 facing/idle/walk 재선택 없음. pop=1+.05×min(1,hitFlash/6), rect 중심 유지. GL alpha=min(1,hitFlash/6)×.8; Canvas는 기존 sa 곱함. lighter/_setBlend/save/restore 유지 |
| 중형 | 실제 img/sx/sy/fw/fh와 기존 drawH=max(240,r×7), drawW=drawH×fw/fh 기록. 원 4열×8행·방향·공격 column·스폰/반경/전투 공식 유지 |
| 수명·전투 | hitFlash 설정6/4, 고정 update의 max(0,hitFlash−sp)·죽은 적 소거 유지. 피해/HP/CC/보상/자원/시체/save 변경 없음. render는 그리기만 |
| HOLD 분리 | ENEMY_GL_2D_BODY_FALLBACK_GATE의 body 실패·fallback/stride/queue/draw 권위는 미해결·미인수 유지. 보류된 general-Image warm branch도 포함하지 않음 |
| 비용·한계 | Map/Set와 hit 중 per-layer 배열 추가, 비용 UNKNOWN. zoom/shake/native billboard pixel 정렬·base+walk 밝기·실화면 미인수. borrowed close/dispose·새 Image/fetch/RAF/timer/셰이더·맵/에셋 변경 없음 |
| 새 검수 범위 | 자기 actor/Image/Proxy/GL로 실제 본체/walk call·flash if·queue wrapper·제출 뒤 marker·reset·중형 call seam만. 전체 draw/prepare/중형 함수·실GPU/카메라/사용자 창 실행 아님. 기존 통과 검사·에셋·픽셀 proof 재실행 없음 |

## 2026-10-16 기존 R 첫 아이템 안내의 발화 수락

| id / 적용 위치 | 현재 계약 |
|---|---|
| 변경 | R h58의 _checkPetDialogue 첫 아이템 분기 1개만 통합. _petSayCD가 true를 반환한 뒤에만 _petTut.firstItem=true 및 해당 분기 return |
| 기존 조건 | 튜토리얼 바깥 si===0 && P.lv<=200, 안쪽 !firstItem && INV.bag.length>=1 유지 |
| 거절 | 현재 말풍선·id 쿨다운·티어 쿨다운·MAP QA 등의 기존 _petSayCD gate로 false이면 firstItem을 소비하지 않고 이후 기존 대사 검사로 진행. 다음 eligible 호출에서 재시도 가능 |
| 실제 티어 | _petTierOf('tut_firstItem')=1. 기존 _PET_TIER_COOL[1]=720프레임. 새 티어·우선순위·쿨다운 기본값을 만들지 않음 |
| 수락 시 보존 | id=tut_firstItem, crow 5초(300프레임), 기존 cat 응답 4초(240프레임), id 쿨다운9999초(599940프레임), 원문·번역키·음성/표시 호출 유지 |
| 범위 | 다른 tutorial 플래그·말풍선 발화/입찰 정책·pad/언어/리프 DOM 표시·전투·인벤토리·세이브 변경 없음. firstItem 수락 후 기존 일회성 유지 |
| 새 검수 | 자기 말풍선 상태에서 실제 outer predicate/firstItem if 및 _petTierOf/_petSayCD/_petSay를 실행. 표시·음성·번역 목적만 대역. 전체 _checkPetDialogue/update/실제 게임 시계·사용자 창·세이브/API 검수 아님 |

## 2026-10-16 기존 R 펫 입력·언어 표시 연결

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 채택 | h52~57 및 혼합 h364의 _refreshPetBubbleInput 호출 1개만. draw의 기존 if(!X)return 뒤에서 실행. bossCine ownerMap/_ch1DruidBeginFrame 등 나머지 h364는 미채택 |
| 패드 Shift/R | _petPadMappedHint(kc,preferred,glyph,fallback). 기본 preferred ShiftLeft=4/LB, KeyR=10/L3 우선. 재지정은 버튼0/1/2/3/4/5/10/11의 Ⓐ/Ⓑ/Ⓧ/Ⓨ/LB/RB/L3/R3를 검색하고 없으면 원 키 토큰 표시. 실제 _GP_KEY를 읽기만 하며 매핑을 변경하지 않음 |
| 기존 치환 | 패드 모드에만 Shift/쉬프트·R을 동적으로 치환. 그 외 KO/EN 마우스/키 토큰·word-boundary·DEX/STR/INT 보호는 기존 _padifyHint 유지. 모든 종류의 사용자 키 변경을 새로 지원한다는 뜻은 아님 |
| 가시덫 문구 | cat의 기존 원문 '1번! 가시덫으로 적 묶어!'만 실제 SKILL_SLOTS의 spikeTrap 위치0~3을 표시. 키보드1~4, 패드 LT+Ⓐ/Ⓑ/Ⓨ/Ⓧ. 기존 _LT_COMBO A=1/B=2/Y=3/X=4와 일치. 신규 원문/번역키 없음 |
| 화면 갱신 | _refreshPetBubbleInput은 t>0인 현재 말풍선의 실제 petBubbleTxt leaf만 갱신. mode/_GP_KEYIDX 객체 identity/txt/node/who/spikeTrap slot을 _petHintView에 캐시. 동일 상태는 다시 쓰지 않고 변경된 표시 문자열만 textContent에 씀 |
| 입력 설정 연결 | 기존 _rebuildGpKeyIdx가 현재 _GP_KEY로 새 역맵 객체를 생성하는 흐름을 읽음. 설정 저장/키 주입/슬롯 배정/게임 입력 권위는 변경하지 않음 |
| 언어 | _refreshPetBubbleLanguage는 기존 현재/대기 pair 원문 번역 후 _petBubbleShow(who,txt,true). textOnly는 portrait src·위치/크기/opacity를 건드리지 않고 현재 leaf만 갱신. t/mt/pair 시간·쿨다운·음성 재시작 없음 |
| DOM 안전 | _petBubbleShow는 textOnly에서 missing/non-leaf면 반환, 일반 표시도 leaf일 때만 텍스트 설정. _refreshPetBubbleInput도 children.length===0을 확인. 부모/자식 노드 구조를 교체하지 않음 |
| 일반 표시 보존 | portrait v4·480px·기존 crow/cat 박스·연습 패널 옆 cat 위치·ui-scale×1.5·opacity .6·폰트/기존 페이드 유지. 정상 발화/우선순위/h58 firstItem/음성/저장/전투 변경 없음 |
| 검수·한계 | 자기 DOM/매핑/슬롯/번역 대역에서 실제 함수와 draw entry의 guard/call만 검수. 전체 draw/speech/실물 패드/브라우저/설정·localStorage/API·사용자 창 검수 아님. 캐시 밖 외부 DOM 변경 전반의 자동 복구나 모든 번역 언어 키 토큰 지원을 주장하지 않음 |

## 2026-10-16 기존 R 샘플 SFX 등록 노드·프레임 큐 예외 정리

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 채택 | R h79~85. _playSampleNow의 노드 등록 뒤 connect/start 구간 try/catch 및 _sfxFrameReset의 큐 dispatch try/finally만. 음원·호출·버스·우선순위·동시재생/프레임 한도 유지 |
| 등록된 노드 | 기존 _activeNodeCnt++/목록 등록 뒤 try. panner 경로는 _nd._dn을 panner 정리 wrapper로 설치한 다음 src/panner connect. connect/start 예외는 현재 _nd._dn 호출 후 원 예외를 다시 throw |
| 정리 의미 | 기존 _dn의 중복 counter 감소·목록 제거 방지 유지. src/gain과 할당된 panner의 기존 disconnect 처리 사용. 기존 onended/(_dur+.5)×1000 timeout 유지하며 실제 가청 성공을 보장하지 않음 |
| 프레임 큐 | 기존 for dispatch가 throw해도 finally에서 동일 _sfxQueue 배열 length=0, _sfxFrameCnt 각 값=0, SFX._sbSndCd>0이면 기존 1 감소. 원 예외 전파 유지. 다음 프레임에 실패 큐를 재생하지 않음 |
| 원 경계 | actx 획득·등록 전 allocation/gain bus connect는 이번 try 범위 밖. _resumeAudioCtx(false)는 finally 뒤 기존 위치 유지. 모든 WebAudio 예외를 완전 복구하는 새 정책 아님 |
| 현행 한도 | 데스크톱/모바일: _MAX_ACTIVE_NODES=48/16, _SFX_MAX=2/1, _SFX_PER_FRAME=6/3, _MAX_PROJ_NODES=5/2, _MAX_HIT_NODES=3/2. _MAX_STEP_NODES=2. 기존 priority/eviction·동일 키 감쇠식·RNG 불변 |
| 파라미터 | 기존 rate\|\|1, gain=min(1,(vol\|\|1)×sfxVol()), pan clamp[-1,1] 및 abs(pan)>.05, startTime\|\|0, duration\|\|2 유지. 새 음원/로더·음량·타이머/샘플/전투 상태 없음 |
| 새 검수 | 자기 AudioContext/node/timeout 대역으로 실제 _playSampleNow/_sfxFrameReset을 호출. 연결·start 오류 전파/등록 노드 counter·queue 정리와 정상 panned/unpanned·한도 경로만. 실제 WebAudio·가청/성능·사용자 창·저장/API 검수 아님 |

## 2026-10-16 기존 R 실드·빔 반복음 callback 소유자

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 채택 | R h87~91의 _stopShieldLoop 및 SFX.beamStart/beamStop 샘플 callback만. 실드/Q·빔 진입/종료·사망/전환 기존 caller·전투 판정은 변경하지 않음. h86 playTone 예외 처리와 다른 SFX는 이번 단위 미채택 |
| 실드 stop | src/gain을 캡처하고 _shieldLoopSrc/_shieldLoopGain=null로 즉시 비움. src 없으면 반환. 기존 gain ramp(.0001,actx.currentTime+.1)와 150ms 뒤 captured src.stop을 독립 try로 실행 |
| 실드 재시작 | _startShieldLoop의 기존 선행 stop이 예약한 callback은 옛 src만 중지. 새 반복음 source를 전역 참조로 다시 읽지 않음. 기존 shield_loop·loop=true·gain=.25×sfxVol() 불변 |
| 빔 next | _beamLoopNext=function next. 현재 gain===시작 때 lg 및 현재 next===이 next인 경우만 다음 sample 생성. 새 source는 captured lg에 연결. 기존 beam_r1/r2/r3 랜덤 선택·loop=false·gain=.8×sfxVol() 유지 |
| 빔 ended | src.onended는 _beamLoopSrc===src일 때만 captured next() 호출. 중지/재시작 뒤 남은 callback이나 이미 교체된 source callback은 새 반복음을 생성하지 않음 |
| 빔 stop | src/gain 캡처 후 _beamLoopNext/_beamLoopSrc/_beamLoopGain=null. captured src.onended=null, 기존 .0001/+.1 ramp와 150ms captured stop을 각 try로 실행. legacy oscillator stop fallback의 원 200ms 경로는 변경하지 않음 |
| 경계 | stop은 원 소스 중지/기존 fade만 수행하며 새 disconnect/소유권 정책·전역 gate·타이머 간격·음원·리샘플링·음량/mute/RNG·채널 한도·게임 상태를 추가하지 않음. 반복 beamStart의 이전 finite chunk 즉시 제거를 보장하지 않음 |
| 새 검수 | 자기 AudioContext/node·캡처 timeout/onended에서 실제 _startShieldLoop/_stopShieldLoop 및 SFX.beamStart/beamStop을 실행. 종료/재시작·stale callback·ramp 예외·기존 수치 보존만. 실제 WebAudio·청감/지연·실제 timer/gameplay·사용자 창/API/legacy oscillator 분기 실행 아님 |

## 2026-10-16 기존 R playTone 시작·종료 예약 예외 정리

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 채택 | R h86의 playTone 한 줄만. 기존 o/g connect 뒤 o.start(t), o.stop(t+dur+.02) 구간을 try/catch로 감쌈. 같은 줄이 있는 playSub는 변경하지 않음 |
| 예외 | start 또는 예약 stop이 throw하면 o.stop(), o.disconnect(), g.disconnect()를 각각 독립 try/catch로 시도하고 원 예외를 재전달. 정리 중 별도 예외가 나도 다음 정리와 원 예외 보존 |
| 등록 경계 | 성공한 start/stop 뒤 기존 _activeNodeCnt++ 및 onended/timeout _dn 유지. 새 예외 경로는 등록 전에 throw하므로 counter/timeout을 새로 등록하거나 임의 감소시키지 않음 |
| 정상 소리 | type\|\|'sine', a=atk\|\|.004, frequency.setValueAtTime(_r(freq),t), 선택 freqEnd=max(20,_r(freqEnd))→t+dur 유지. gain은 0→vol at t+a→.0001 at t+dur. stop t+dur+.02, 정리 timeout(dur+.5)×1000 불변 |
| 보존 | 기존 _activeNodeCnt/_MAX_ACTIVE_NODES admission·파형/음량/버스·_r 호출 순서/횟수·모든 SFX/게임 caller·에셋 불변. 대체음·cap/priority·새 타이머/전역 복구 정책 없음 |
| 범위 밖 | actx/노드 생성·frequency/gain envelope·connect는 원 위치와 이 try 밖. 등록 전 일반 allocation/연결 예외 복구나 실제 오디오 종료 성공 전체를 보장하지 않음 |
| 새 검수 | 자기 oscillator/gain/timeout 대역에서 실제 playTone의 start/예약stop/정리오류·정상 파라미터/등록 정리만. 실제 WebAudio·가청/성능·게임 시계·사용자 창/설정·저장/API 실행 아님 |
## 2026-10-16 R 스킬 발동 결과 계약 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 7dd8ef1fbc0bb902d66126f1dfcbe8ccd1d4a325 |
| R 원본 선택 | h95–97 호출부 + h294–303 발동 함수 반환 계약, 논리 hunk 13개 |
| 코드 | game.html: activateMaliceHunt/activateVenomBlade/activateLtnChaser의 기존 거절 7개를 false, 함수 정상 종료 3개를 true로 연결. dispatcher 세 case는 ===true에만 기존 쿨다운·_skOk 적용 |
| 최신 main 보존 | 추적전격 _bladeEchoTryStart 우선순위, 기존 자원·피해·합체·숙련도 내부 호출·HP·Q/E 유지 |
| 사전 보존 | 소유 6경로 WORK/HEAD 바이트 백업을 이번 첫 코드 수정 전에 완료 |
| 검증 | 실제 함수 + dispatcher의 합성 VM 6개 검사군 PASS, 인라인 구문 1개 PASS. 실제 게임 상태·창·오디오·세이브 사용 없음 |
| 적용 한계 | 합체 성공 payload·실전 전투·현재 브라우저 메모리·서버 프로세스 재시작·PC·native 전체 최신판은 검증하지 않음 |
| 별도 보류 | general-image warm db56 봉인 함수 범위와 native/맵/캐릭터/타 팀 HOLD는 이번 단위에 포함하지 않음 |

소스 일부의 정상 부모 이식이며 최신 게임 전체 완료나 이식 진행률을 뜻하지 않는다. 외부 단위 기록: R-skill-activation-result-integration-20261016.
## 2026-10-16 R 허수아비 회수 원장 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 75cb7c4a47b65ff800c11c98abbb4e0595724537 |
| R 원본 선택 | h98 한 줄: _vs2.resHP=_vs2.resMP=_vs2.resST=0 |
| 코드 적용 | game.html의 실제 _dispatchSkillSlot 수동 voidScarecrow 회수에서 기존 회복·문구 직후 원장 소비 |
| 문제 | dualScarecrow absorbed>0이면 회수 후 폭발 대기 객체가 남아, 원장을 소비하지 않을 경우 반복 입력으로 같은 축적량을 재차 반환 |
| 사전 보존 | 소유 code1/docs4의 5경로 WORK/HEAD를 이번 첫 코드 수정 전에 바이트 백업 |
| 검증 | 실제 dispatcher + 합성 자원/허수아비 상태의 신규 6군, 인라인 구문 1개 PASS. 정상 수동 회수·상한·합체 지연·빈 원장·pause 확인 |
| 그대로인 동작 | 기존 비용/설치 쿨다운/흡수/피해/QE, 반복 입력의 폭발 타이머 재설정·효과·숙련도, 자동회수·공성유령 |
| 한계 | 실제 HP/시간/AI/흡수/피해/폭발/세이브/창 실행 없음. PC/native 및 최신 전체 실행 검증 아님 |

별도 general-image warm db56 및 모든 타 HOLD는 이번 단위에 포함하지 않는다. 외부 단위 기록: R-scarecrow-recall-ledger-integration-20261016.
## 2026-10-16 R 사망 화면 키보드 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 69a1cb5facb8e6bdeb358d5d944f15f5c5a4372e |
| R 원본 선택 | h99 _handleDeathMenuKeyboard + h101 keydown 소비 + h106 Space keyup 소비 |
| 필요성 | 현재 실제 retryBtn/deathReplayBtn/toLobbyBtn이 있으나 전역 Tab/Space preventDefault 전에 사망 버튼 입력을 분리하는 소비자가 없음 |
| 보존 | 기존 main 버튼/문구/onclick·키 바인딩·패널 가드·게임패드·리스폰/리플레이/로비·HP/QE, native HUD 및 모든 HOLD 유지 |
| 사전 보존 | code1/docs4의 5경로 WORK/HEAD를 이번 첫 코드 수정 전에 바이트 백업 |
| 검증 | 실제 helper + 영향받는 실제 keydown/keyup 문장, 합성 DOM/이벤트 신규 8군 및 구문 1개 PASS. 전체 전역 리스너/실제 브라우저 기본 클릭/렌더 포커스/실제 버튼·세이브·창·패드 실행 없음 |
| 별도 범위 | 인접 h100 F1 보스 가이드, h102 inventory-detail-trigger, Hellgunner·rig·RIFT 변경은 이 단위에 포함하지 않음. 기존 interact freshness 소비는 재이식/재검사하지 않음 |
| 한계 | 소스 수준의 필수 입력 소비자 이식. 최신 전체 게임·PC/native 실행·visual PASS 증거가 아님 |

외부 단위 기록: R-death-menu-keyboard-integration-20261016. general-image warm db56 및 타 HOLD의 해제로 해석하지 않는다.
## 2026-10-16 R 장비 ST 숫자 합산 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 420ed98f4d1da95a0a5e94645c66abea015710a8 |
| R 원본 선택 | h128. recalcSt의 기존 truthy it.bonusSt 합산에 unary + 및 falsy 0 처리 |
| 실제 소비자 / 문제 | 기존 equipItem/unequipItem/스탯 재계산 호출의 recalcSt. 숫자 문자열이 장비 ST 총합을 문자열 이어붙이기로 바꾸는 문제 재현 |
| 코드 보존 | 실제 17슬롯/순서·원본 item 필드·캐시3 무효화·base100/raw DEX*2·강화0.2·어픽스·결정·패시브·투지·~~·현재ST 상한 및 HP/QE 그대로 |
| 사전 보존 | code1/docs5의 6경로 WORK/HEAD를 이번 첫 코드 수정 전에 바이트 백업 |
| docs 정정 | 자원 문서의 최대ST 200/s.dex 잔여 표기를 기존 실제100/raw STATS.dex로 수정. 밸런스 표의 기존 강화·패시브·투지·정수화 항목을 완전 표기 |
| 검증 | actual recalcSt/SLOT_NAMES + 합성 장비/자원 6군 및 구문1 PASS. affix/grit 대역, 전체 equip/restore/native·실자원/HP/시계/save/API/창 실행0 |
| 미포함 | 인접 inventory CP/장착 UI·새 owner·prototype, native 파이프라인·db56 및 모든 타 HOLD. 전체최신/PC/native/visualPASS 주장0 |

외부 단위 기록: R-equipment-stamina-number-integration-20261016. 관련 원·native 이력의 검사 증거는 재실행하거나 덮어쓰지 않는다.
## 2026-10-16 R 수동 장비 공통 자원 갱신 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | f2f8167f4289397eed23ed7c0931b7f574581b89 |
| R 원본 선택 | h120 중복 귀걸이 applyStats 제거, h121 _refreshEquipmentStats, h123 equipItem/h126 unequipItem 성공 소비 |
| 실제 누락 | 일반 장착/해제가 recalcSt만 호출한 뒤 기존 dbSaveForce에 도달. 귀걸이만 외부 applyStats로 보완하던 경로 |
| main 보존 보정 | R helper의 어픽스/스탯 캐시2 외 현재 main의 _lEqCache=null도 선행 무효화에 유지. 실제 수치·HP/QE·예외/저장 권위는 새로 만들지 않음 |
| 사전 보존 | code1/docs5의 6경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 검증 | actual equipItem/unequipItem/_equipEarringTo/helper + 합성 장비/자원/저장 목적지 신규6군·구문1 PASS. applyStats/recalcSt는 대역이며 전체 실제 스탯식·실HP/clock/save/API/native/창 실행0 |
| 인접 미채택 | h124/125/127 bool은 R UI의 결과 소비와 종속. 현재 main caller는 반환값을 읽지 않거나 장비 후조건을 확인하므로 이번 범위에서 채택하지 않음. 원R9a 보존·해당UI 승인은 추론하지 않음 |
| 기타 범위 | CP preview/refund/chestcap/새 inventory UI는 별도 판정. native HUD·db56 및 모든 타 HOLD 미포함. 기인수 ST 검사·oldproof 재연0 |

외부 단위 기록: R-equipment-resource-refresh-integration-20261016. 소스 정렬을 최신 전체 실행·PC/native·visualPASS로 승격하지 않는다.
## 2026-10-16 R 월드 아이템 상자 우선순위 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 23b155bd0a5433b85768d1ee2a564b80ffe51f69 |
| R 원본 선택 | h130 _wiPush의 미개봉/미수거 chest 우선순위 Infinity 식 |
| 실제 caller | 본편 보스 보상 생성의 chest/picked=false/opened=false 및 동일 worldItems 개봉 판정 정적 확인. 20cap에서 상자가 먼저 제거되는 실패를 실제 _wiPush+합성 레코드로 재현 |
| 보존·한계 | 기존 cap20/min-scan/swap-last·item rarity·기타 -1·음향 호출·RNG/경제·상자 생성/개봉·HP/QE 유지. all21 Infinity는 기존 첫항목 제거로 남음 |
| 사전 보존 | code1/docs4의 5경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 검증 | 신규6군 및 구문1 PASS. actual _wiPush만 합성 레코드/음향 대역에서 실행. 실제 보스/드롭/수거/RNG/HPclock/맵/save/API/창0 |
| 미포함 | P01 전체 보존/필터·정산 큐, 맵 제작/배치, CP/refund/inventory UI·native·db56 및 모든 타 HOLD. 기인수 proof 재연0 |

외부 단위 기록: R-world-item-chest-retention-integration-20261016. 최신전체/PC/native/visualPASS 주장0.
## 2026-10-16 R 플레이어 투사체 KB 필드 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | b3f2b4268b6ebb1811c29889f71faa378ee1e0a0 |
| R 원본 선택 | h141 _resetPProj의 p.kbMult=undefined |
| 실제 누락 | 악의구가0.1을 쓴 객체의 회수/대여 후 값이 남고, 기존 p→hurtE opts 경로 및 kbM 초기 선택이 이를 읽는 연결 확인 |
| 보존 | 같은 객체/_hitSet·풀120·기존 관통/부가 필드·피해/KB 공식과 명시 배율·HPQE·생성/반납 정책·RNG 유지 |
| 사전 보존 | code1/docs4의 5경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 신규 검사 | actual _mkPProj/_resetPProj/_recyclePProj/_getPProj + actual hurtE kbM 선택 문장, 합성 pool/record 및 affix대역6군·구문1 PASS. 실제 producer/hit routes는 정적 확인 |
| 검사 도구 이력 | 코드 수정 전 baseline 추출기가 hurtE의 기존 try 내부 kbM을 직접 body 문장에서만 찾아 실패. own-function 중첩 블록 탐색으로 검사기만 수정 후 실패 경로 재현. 제품 교정/성공 검사 재연0, firstWholeClean=false |
| 한계 | 실제 hurtE/피해/KB벡터/충돌/프로젝타일 스폰/HPclock/native/save/API/창 실행0. 전체최신/PC/native/visual/성능PASS 아님 |

외부 단위 기록: R-player-projectile-kb-reset-integration-20261016. db56/타HOLD 및 인접 원본 변경은 자동 채택하지 않는다.
## 2026-10-16 R 숫자 소비자 독립 묶음 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | df8c60f3207236d9aee0fe73ec9dc11bef18bad1 |
| 원R 명시 선택 | h176–183 및 h191–192, 총10구간. 기존 숫자 소비 위치의 unary+/falsy0만 |
| main 3way | h181 statDex의 gl().atkSpd만 변환. 현재 _lGloveElem 전설장갑 +0.20 꼬리·공식·순서 유지 |
| 사전 보존 | code1/docs6의 7경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 신규 검사 | actual 함수12개 및 actual applyStats의 두 루프/슬롯·강화세트 선언만 합성 제공자로 신규8군·구문1 PASS. 캐시/getter·numeric/string 동등·명시 invalid fallback·Infinity 유지 확인 |
| 한계 | 전체 applyStats/파생 HP·MP·쉴드/공격/피해·속도·RNG·native·실HPclock/save/API/창 실행0. fixture의 장비스탯/유니크·전설/강화 공급자는 대역 |
| 제외 | 인접 h184–190 경제/사운드·다른 유사 stat/함수 확장 수정·새 finite/cap·DB마이그레이션0. db56 및 모든 타 HOLD 보존 |

외부 단위 기록: R-equipment-numeric-consumers-integration-20261016. 전체 R 의미판정·최신 전체 실행·PC/native/visual/성능 완료 주장0, 기인수 proof 재연0.
## 2026-10-16 R AI 강화 저장 요청 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 09fc2fbfcde00164c6fb4b4c5aee0457cdf27f2d |
| 실제 누락 | Forge onclick→_doAiEnhance→aiEnhance가 장비/악의를 바꾸고 기존 스탯/렌더 뒤 끝나지만 저장 요청이 없던 경로 |
| R 선택 | h185 res.used>0이면 기존 dbSaveNow 한 번. h184 원가528만·h186 레거시 환수/PM-013-D 주석만 정확히 정정 |
| 사전 보존 | code1/docs5의 6경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 신규 검수 | actual _doAiEnhance + 합성 item/mats 및 강화·비용·스탯·렌더·save 요청 대역 신규6군·구문1 PASS. 성공/부분/무소비/기존거절·예외 및 주석함수 AST 동일 확인 |
| 보존·제외 | 실제 강화 알고리즘/RNG·환수~~/경제/반환·예외·비동기 owner/identity·저장 형식·HPQE·DOM/GUI 그대로. h122/187는 현재 계약·PM-013-D 설계 대기 미채택, 원R9a 보존 |
| 한계 | save 요청만 검사, 영속 완료 아님. 실제 Forge UI/랜덤 시도/전체 applyStats/HPclock/DB/save/API/native/창0. 기인수 저장/숫자/투사체 등 proof 재연0 |

외부 단위 기록: R-ai-enhance-save-integration-20261016. 인접 PM-013 과거 보고 행을 선행 문서에서 읽었으나 그 검사 산출물을 재실행/재계산하지 않았다. db56/모든 타 HOLD 보존, full/PC/native/최신 전체/visual/성능PASS 주장0.
## 2026-10-16 R 자동 물약 CD 입력 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 7a985c144001b41912d25e884c91cdd9f258bd3a |
| R 선택 / 미채택 | h237 update의 glove/belt potCd unary+/falsy0 두 변환만. h188은 현행 수동 포션 UI 폐지·본편 caller0 근거로 미채택/원R9a 보존 |
| 실제 누락 | truthy 비숫자 gear potCd가 기존 Math.min→NaN→~~0 경로로 최소6 CD를 만드는 입력. 실제 생산 CD 문장으로 재현 |
| 사전 보존 | code1/docs4의 5경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 신규 검사 | 실제 const4/대입1 + 합성 gear/passive/cooldown 신규6군·구문1 PASS. 전체update/트리거·실HP/회복·악의/clock/save/API/UI/native0 |
| 선행 설명 정정 | 최초 계획의 regen cap0.5는 미확인 오기였으며 첫 제품쓰기 전 실제 pRegen*0.03/cap0.3으로 정정·fixture는 실제 선언 추출. 이를 맞추기 위한 코드/통과검사 변경0 |
| 보존 | 기존420 CD기준/6최소·glove/belt각0.2·regen0.03/0.3·~~/Math·실발동/소비/HPQE/효과/튜토리얼/autoPotThr·수동UI/데이터형식 그대로 |

외부 단위 기록: R-auto-potion-cooldown-input-integration-20261016. 기인수 proof 재연0·db56/타HOLD보존·최신 전체/Rparent/PC/native/visual/성능 완료 주장0.
## 2026-10-16 R normal 자동 석궁 ST 분기 독립 이식

| 항목 | 이번 범위 |
|---|---|
| 출발 main | 5fbb38d2b598fdd4a1673335fbebac38013a4c00 |
| R 선택 / 필요성 | h190 normal 조기return이 문서상 공통ST 차감을 우회. 실제 update→router와 _fireXbow 직접ST소비 없음 정적 확인 후 actual router 합성 실패 재현 |
| 코드 | preST capture → 기존 _fireXbow → 원 fanShot/discount 식으로 Math.max0 단일 차감 → return. ghostXbowTurret normal 폴백·터렛 기존 할인 유지 |
| 사전 보존 | code1/docs5의 6경로 WORK/HEAD를 첫 코드 수정 전에 바이트 백업 |
| 새 검수 | actual _autoFireBowSkill/_stDisc + 합성 ST/발사·할인·비normal 기술 대역 신규6군·구문1 PASS. 실제 update/발사/투사체/피해/RNG/HPclock/native/saveAPI/창0 |
| 경계 | 기존20% gate/다른 기술CD·상태·방향/원 반환/예외·할인·피해·발수·설치·소유권 그대로. 새 충분ST/성공 판정·환불·오디오guard0 |
| 보호 | h189 dormant helper 등 기분류·기인수 proof 재연0, db56 및 모든 타HOLD/원R·WIPrefs 보존. 전체최신/PC/native/visual/성능 완료 주장0 |

외부 단위 기록: R-auto-bow-normal-st-cost-integration-20261016. 선행 검색에서 과거 밸런스/피해 검사 요약 행을 읽었으나 실제 산출물 재열기·재계산·재실행·새 증거 전용은 하지 않았다.

## 2026-10-16 R h238+239 참회 확정 자원 연결

| 항목 | 이식 범위와 한계 |
|---|---|
| 제품 | game.html의 실제 update hellRay 조준 확정에서 원 R 스택→MP100 거절 순서와 else 래핑만 연결 |
| 원 의미 | MP100/스택1 차감순서, 600f 재충전·지속, 범위·거리·합체·효과·좌표/RNG·입력 소유 유지. 스택 부족은 조준 종료, MP 부족은 조준 유지 |
| h240 | 현재 iceStorm 재검사와 MP40 차감이 이미 있어 정적 동등 판정, 중복 이식·기인수 검사 재연 없음 |
| 검증 | 실제 확정 블록 추출 + own 자원/zone/효과 대역 새6그룹, main inline 구문1. 전체 update·선택·실발사·전투·Native·PC·저장 검증 아님 |
| 보존 | 코드1/docs5 exact6 WORK/HEAD을 첫 제품쓰기 전에 각 별도 시점 기록과 함께 백업. W/기존 HOLD·창·save/API/process 유지 |
| 범위 제한 | prewrite checker의 importmap JS 파싱 오류와 문서 작성 helper의 Python 구문 오류를 해당 helper에서 수정; 제품을 검사에 맞춰 변경하지 않았으며 firstWholeClean=false. 전체 최신 게임 이식 완료 아님 |

## 2026-10-16 R h244+245 뇌전창 확정 MP 연결

| 항목 | 범위·한계 |
|---|---|
| 제품 | 실제 update 수동 조준 확정에서 원 R MP<50→원 안내·조준 종료, else 기존 성공본문 래핑만 |
| 원 의미 | MP50/스택식·clamp/720충전·기존900+(Lv-1)*30 지속·피해·좌표·거리·효과·RNG·입력 소유 유지; 새로운 stack/finite/default/예약/환불 정책 없음 |
| 문서 | 기존600/10초 문서값은 보존·분리하고 현재 수동확정900+(Lv-1)*30f/60f단위와 차이를 명시. 확정목표900 또는 모든Lv15초로 변경한 것이 아님 |
| 검증 | 실제 확정 if + own 자원/창/효과 대역 새6그룹/main inline1. 실제 선택·전투·Native·저장·PC 검증 아님 |
| 백업 순서 | 초기 code1/docs5 exact6 WORK/HEAD은 첫제품쓰기 전. 사후 docs 검색으로 발견한 DPS/공식표2문서는 첫코드쓰기 후 각각 자기 첫쓰기 전 WORK/HEAD 추가 백업·별도 기록. 총code1/docs7 exact8이며 전8을 첫코드전이라고 주장하지 않음 |
| 제외 | h241~243 _hurtFieldMobs 추가·다른 producer/pDot·HOLD·원 WIP·실제 창/save/API/process 변경 없음. 전체 최신 게임 완료 아님 |

## 2026-10-16 R h203 initStage 말미 BGM 동기 예외 연결

| 항목 | 범위·한계 |
|---|---|
| 제품 | game.html initStage 마지막 BGM.play(BGM.stageKey(si))를 원 R try/catch 및 원 console.error("[BGM] stage start",e)로 래핑한 한 statement만 |
| 원 의미 | 정상 호출 순서/인자/this/횟수 유지. 기존 장 큐·BGM 내부·타 caller·boot/스토리·맵 생성/geometry·재시도·복구·정리 정책 변경 없음 |
| 검증 | actual 마지막 statement + own BGM/console/continuation marker 새5그룹/main inline1. 실제 initStage 이후 게임 진행·실 Audio·Promise 거절/재생 성공·다른 caller 안전을 검증한 것이 아님 |
| 보존 | code1/docs3 exact4 WORK/HEAD 개별8 기록은 첫 제품쓰기 전. 원 R9a ref·WIP·HOLD·2_3·실창/save/API/process 유지 |
| 읽기 범위 | 초기 source 검색에 다른 boot/스토리 BGM 호출행과 R246~252 snippet이 표시됨. 읽기만 했으며 별도 채택·검사·완료판정 없음. 성공 proof/검사 재연 없음 |
| 완료 한계 | 소스 이식 범위만. 전체 최신 게임/PC/native 완료 아님 |

## 2026-10-16 R h108 held-input 조준/충전 reset 연결

| 항목 | 현재 main 계약 |
|---|---|
| caller | 기존 blur → _clearHeldInput; visibilitychange는 document.hidden일 때만 같은 함수 호출. visible 상태는 기존 비실행 |
| P guard | 기존 typeof P!=='undefined' && P 안에서 _beamHold 및 원 R의 _mmAiming/_mmCharging/_msAiming/_msCharging/_bwAiming/_tsAiming을 false로 해제 |
| 입력 리셋 | 기존 _resetInteractInput 먼저, K/KH/MB/MBjust 전체 false, _dashHold=false/_dashHoldF=0/_dashTier=0, 컷스킵 _cutSkipHolding=false/_cutSkipHold=0 순서·소유 유지 |
| 범위 한계 | 원 R에 없는 _isAiming/_hrAiming 등 추가 해제 없음. 패드 주입/조준거리·키/자원·충전타이머·캐릭터 state·QE 설계 변경 없음. 예약/환불/자동pause·resume 정책 추가 없음 |
| 검증 | 실제 함수와 기존 등록 callback을 own 입력/P/event target에서 새5그룹/main inline1 확인. _resetInteractInput 내부는 대역이며 기인수 검사 재연 없음. 실제 창·포커스·전투·자원·시계·저장/API·Native·PC 실행 없음 |

code1/docs4 exact5의 WORK/HEAD 개별10 기록은 첫 제품쓰기 전이다. 기존 R9a ref·WIP·HOLD·2_3·보호 창/save/API/process를 유지한다. 초기 넓은 docs 검색535행 출력에는 기존 인수 검사 설명도 포함됐으나 해당 proof/검사를 열거나 재연하지 않았다. h111 _ch1MouseScene 프로젝션 연계는 이번 이식에 포함하지 않으며 그 의미 판정 완료를 주장하지 않는다. 전체 최신 게임 이식 완료가 아니다.

## 2026-10-16 R h193 fireAura MP 소모 이식

| 항목 | 현재 main 계약 |
|---|---|
| id·이름·소유 위치 | fireAura · 지옥진 · _MAGIC_E_HANDLERS.fireAura, 실제 _execMagicE 선택 handler 경로 |
| 비용·시점 | 기존 고정 MP100. 원 level/쿨/MP<100 gate를 통과한 뒤 원 R 위치 P.mp-=100 → 기존 magicCast/st2/atkArc 설정 → true 반환 |
| 거절·fallback | level 미충족은 기존 false/fallback 경계 유지. 쿨 또는 MP 부족은 기존 안내/true로 종료하며 무차감. handler true이면 _execMagicE의 공용 useMp fallback을 실행하지 않아 추가 공용 차감 없음 |
| 보존 | 공통 input gate·선택·속도/캐스트·완료 zone maxT600·쿨720·합체·피해/RNG·다른 실제 handler·QE 그대로. 새 할인/clamp/default/성공gate·예약/환불·예외 복구 없음 |
| 예외 순서 | 원 R처럼 MP 차감 후 기존 캐스트 설정/속도 provider 호출. 해당 원 표현식의 예외를 새로 잡거나 환불하지 않음 |
| 검증 | 실제 fireAura handler/_execMagicE와 own P·속도/안내/공용비용/다른handler 대역 새5그룹/main inline1. 완료 분기 직접 MP 참조 없음/600·720은 정적 확인만. 실제 update·완료 zone·발사/전투·실MPHP/clock/saveAPI·GUI·Native·PC 실행 없음 |

code1/docs4 exact5의 WORK/HEAD 개별10 기록은 첫 제품쓰기 전이다. 현재 다른 HTML byte/기존 원 R ref·WIP·HOLD·2_3·보호창/saveAPI/process를 유지한다. 초기 선택 source 조회에 인접 blueShot/기본마법 완료본문도 표시됐으나 읽기만 했고 해당 실제 handler/완료본문은 실행·별도 검사·수리하지 않았다. 기존 성공 proof/검사 재연 없음. 전체 최신 게임 이식 완료가 아니다.

## 2026-10-16 R h224+225 보스 폴백 음향 wrapper 이식

| id·대상 | 현재 update 호출 경계 |
|---|---|
| boss_revive · 폴백 부활 음향 | 원 playSample('boss_revive',1.0,_r(1.0,.08))를 원 try/catch로 감싸고 console.error('[SFX] boss fallback revive error:',e) 기록 |
| boss_final_death · 완전 사망 음향 | 원 playSample('boss_final_death',1.0,_r(1.0,.05))를 원 try/catch로 감싸고 console.error('[SFX] boss final death error:',e) 기록 |
| 정상 호출 | 기존 _r→playSample 인자 평가/호출 순서·볼륨·rate·priority 및 성공 시 후속 진행 유지 |
| 동기 예외 | 위 expression의 인자/provider/호출 동기 예외만 기록 후 원 후속 update 진행. 이미 일어난 side effect는 원 R처럼 되돌리지 않으며 retry/rollback/refund 없음 |
| 제외 | 후속 큐 소비/WebAudio 오류·실재생 복구는 이 catch 밖. console.error 자체가 던지면 원 R대로 전파. 모든 예외가 동일하거나 모든 boss caller가 안전하다는 계약 아님 |

| 항목 | 범위·한계 |
|---|---|
| 변경·소유 | update의 exact 음향 expression2개와 원 try/catch·원 진단만. 기존 인간의 R 소스 통합/ENGINE 단독 consumer 소유 안의 연결이며 이전 BOSSalpha.7 거절patch 재개/해제 또는 operation집합 판정이 아님 |
| 보존 | 다른 HTML byte·보스 상태/HP·alpha/asset·geometry·phase/gate·hurtE caller·원 WIP/HOLD/2_3·실창/saveAPI/process 유지 |
| 검증 | 실제 두 wrapper + own rate/sample/console/후속 marker 새5그룹/main inline1. 실제 RNG/큐/Audio·보스/update·HP/state/timer·창/saveAPI·Native·PC 실행 없음 |
| 백업 | code1/docs4 exact5 WORK/HEAD 개별10 기록은 첫 제품쓰기 전 |
| 이력 한계 | prewrite helper의 rest parameter 함수 내부 strict directive 구문 오류를 helper module strict로 수정. baseline/제품 실행 전 오류였고 제품맞춤 변경 없음; firstWholeClean=false |
| 완료 한계 | 동결한 앞선 정적 leaf·옛 SFX/보스 검사/proof는 재열람·재연하지 않음. 전체 최신 게임/PC/native 완료 아님 |

## 2026-10-16 R h158+h379 일반 windup 전조 조건 연결

| 항목 | 현재 main 계약 |
|---|---|
| 소유 | 원 R h158 _enemyWindupRemaining(e) 순수 reader와 h379 draw의 일반 근접❗ 조건 한 곳만 연결 |
| reader | e가 존재하고 alive·!ib·s==='windup'이며 stunned/_frozen/_hitStun이 양수가 아닐 때 finite st2의 max(0,st2), 그 외0. actor/AI/timer를 쓰지 않음 |
| 표시 조건 | 기존 e._atkWindup>0 대신 _enemyWindupRemaining(e)>0. 실제 AI의 windup/st2를 읽으며 기존 ❗/X 설정·e.x,e.y-e.r-8 좌표·nativebillboard push→try/finally→pop 본문 유지 |
| 제외 | 별도 _fdgGhoulBillboard 조건·snapshot·다른 전조·actorbody/GL·AI 상태·피해/RNG/QE 변경 없음. 새 변환/default·시간/행동 권위·ticket 구현/연결 없음 |
| 검증 범위 | 실제 reader+해당 if를 frozen own enemy·Canvas/native 대역으로 새5그룹/main inline1 확인. 실제 AI/timer/HP/자원·Canvas/GPU·글리프·실전조/visual·창/saveAPI·Native·PC 실행/검수 아님 |

| 항목 | 보존·한계 |
|---|---|
| 코드 범위 | eProjAt 뒤 원 helper 정의 추가와 일반❗ 조건 교체만. eProjAt 본문·원 글리프/좌표/Canvas/nativebillboard·try/finally/pop 및 예외 복원 순서·다른 HTML byte 유지 |
| 백업 | code1/docs4 exact5 WORK/HEAD 개별10 기록은 첫 제품쓰기 전 |
| 읽기 범위 | 기존 AI 생산자 조회에 atkTicketRequest가 있는 원 행과 인접 hitflash 설명이 표시됐으나 읽기만/새 ticket 구현·연결·유사수리 없음. 옛 성공 proof/검사 재연 없음 |
| 보호 | ENEMY_GL_2D_BODY_FALLBACK_GATE·기존 HOLD/WIP/2_3·실창/saveAPI/process 유지. bodyfallback 해제나 대체 renderer/우회 아님 |
| 완료 한계 | 합성5/main inline1만. 실제 glyph/GPU·AI/전투·visual/native/PC·전체 최신 게임 완료 아님 |

## 2026-10-16 R h174+h175 월드 컷아웃 phys fallback guard

| 항목 | 현재 main 계약 |
|---|---|
| 소유 위치 | _worldItemSkin(it)의 새 Image 생성과 공통 컷아웃 반환 guard만. 원 R h174+h175를 현재 main에 3way 연결 |
| 출처 기록 | img.src=renderSrc 직후 _worldDropCutoutSrc=cutoutSrc?img.src:''로 실제 getter 문자열 보관. 새 URL 정규화·경로 선택/추측 정책 없음 |
| 공통 컷아웃 | cutoutSrc가 있고 현재 img.src가 기록된 컷아웃 src와 같을 때만 raw image 반환. 기존 onerror로 phys fallback src가 바뀌면 기존 canvas/_maskWorldDropBlack·_worldDropMasked 캐시 경로 사용 |
| uniqueArt | 현재 main의 ||it.uniqueArt 우회를 유지. 성공 및 기존 phys fallback도 기존 방식 그대로이며 이번 단위에서 유니크 처리 정책을 수리하지 않음 |
| 보존 | 원 resolver/key/alias/bone·onload/onerror·mask 알고리즘/마스크 재사용·부트/h173·원 PNG 유지. 새 retry·migration·준비/READY 정책·asset 생성/가공 없음 |
| 검증 | 실제 helper와 own Image/Canvas/mask/resolver·자기 load/error callback 새5그룹/main inline1. own URL getter/호출 spy를 실제 browser/알파/픽셀·visualPASS로 확대하지 않음. 실제 Image/네트워크/PNG·사용자 cache/GUI/saveAPI·Native·PC 실행 없음 |

| 항목 | 보존·한계 |
|---|---|
| 코드 범위 | 새 Image의 실제 src 기록과 공통컷아웃 guard만. R에는 없는 main uniqueArt 우회를 포함한 3way이며 그 밖 HTML byte 유지 |
| 백업 | code1/docs4 exact5 WORK/HEAD 개별10 기록은 첫 제품쓰기 전 |
| 테스트 한계 | own onerror는 함수 호출이 반환된 뒤 자기 객체에서 호출. 실제 image event timing·네트워크·픽셀/알파·새로고침/사용자 cache를 검증한 것이 아님. 기존 사용자 cache metadata를 이식/수리하는 정책 없음 |
| 보호 | image/PNG/asset/hash/import/transform·대체 pipeline/new art·부트/h173·HOLD/WIP/2_3·실창/saveAPI/process 조작 없음. 초기 조회에 인접 기존 스탯 helper 행이 표시됐으나 읽기만/수리·검사 없음 |
| 완료 한계 | 새 합성5/main inline1만. 옛 성공검사/proof 재연 없고 전체 최신 게임·visual/native/PC 완료 아님 |

## 2026-10-16 R h172+h448 source head2D 선택적 준비 이식

| 항목 | 현재 source HTML 계약 |
|---|---|
| 연결 | 원 R h172의 _headCaptureWarmDone=false/_headCaptureWarmMs=0 및 _warmHeadCapture2d와 h448 setBootLoading의 pct>=100 tail만 |
| 진입 | 성공 one-shot 미완료·_useGL·!G.on·OPT.deathFx. 기존 chapter1/south atlas meta/ready/image.complete·크기≥(meta.cell 또는 원256), 첫 split 존재/비활성 |
| 기존 리소스 | _gibX/_gibC scratch와 _splits[0].ctx만 사용. scratch clear48×48→atlas cell을48×48로 draw→split cell clear→scratch48×14를 _SPLIT_CELL(현재64)²로 draw. 새 canvas/active debris 생성·상태 변경 없음 |
| 종료 | finally에서 scratch48×48과 split cell을 각각 독립 clear 시도, 실패 시 prepared=false. 원 performance 차이 ms 기록과 done=prepared 반환. flag는 호출 경로 완료 표시이며 픽셀/GL/READY 판정 아님 |
| caller | 기존 pct>=100에서 try helper/catch{} 뒤 기존 hideBootLoading. guard skip/실패에도 원 hide 유지, hide 자체 예외는 전파. 기존 DOM/pct/hide 본문·bootgate/epoch 유지 |
| 보존 | 실제 _addHeadGib/frame 선택·bodyfallback/GL·봉인 atlas warm본문·Native HUD·h49/h173 및 다른 HTML byte 유지. 새 epoch/default/준비READY·retry/비동기wait 정책 없음 |
| 검증 | 실제 helper+tail을 own G/OPT/atlas/scratch/split/performance/hide로 새6그룹/main inline1 확인. 실제 canvas/GL/이미지/픽셀·보호캡처/UI·clock/saveAPI·Native·PC 실행 없음. own ms/spy는 성능·첫사망·head픽셀 성공 증거 아님 |

| 보존·교정 | 범위 |
|---|---|
| fresh 보존 | 이전 미사용5쌍 snapshot은 불변·읽기/재사용 없음. resume1에서 현재 code1/docs4 exact5 WORK/HEAD 개별10을 새 기록하고 첫 제품쓰기 전에 보존 |
| 정적 교정 이력 | 앞선 정적 조사에서 _addHeadGib 첫 선언을 활성으로 고른 한계를 별도 교정해 마지막 top-level binding으로 분리했다. 두 consumer 본문 변경/실행 없음. 이 이력을 보존해 firstWholeClean=false, 새 기능검사는 첫 PASS |
| 검증 한계 | 현재 tail의 own baseline은 hide만 관찰했으며 성능 결함 재현이 아님. 신규 own clock/spy6그룹을 실머리캡처·성능/GL·READY 인수로 쓰지 않음 |
| 보호 | 이전 정적 leaf/기인수 h49/h173·옛 proof 재열람/재연 없음. nativeHUD/bodyfallback/atlas warm 봉인·HOLD/WIP/2_3·실창/saveAPI/process 유지. 동일 거절operation 해제나 대체pipeline 아님 |
| 완료 한계 | source HTML helper/tail 단위만. 전체 R/native/PC/최신 게임 완료 아님 |

## 2026-10-16 R h305+h306 전대/도감 숫자 소비 이식

| 대상 | 현재 main 계약 |
|---|---|
| _ancPartPts | 기존 기록 c가 있으면 (+c.r\|\|0)+(+c.t\|\|0), 미수집은 원 -1. 원 R h305의 두 unary+만 연결하며 수집된0점은 유효 |
| _calcAncestorStats ancPow | pow의 기존 ((oss&&oss.ancPow)\|\|0) 한 operand만 ((oss&&+oss.ancPow)\|\|0)로 소비. 원 R h306의 unary+만 추가 |
| 정상 산식 | 정상 number 결과·4실부위 gate·기존 피해/치명/HP/크기/속도 산식과 상한·ancHP 및 ancDur×.30 최대HP 호환 유지 |
| 기록·권한 | INV.ossCollect의 기존 {ancId_part:{r,t}}/장비 객체 identity·직렬화·등급/티어 producer·등록/교체·해금·실소환 경로 변경 없음. reader가 원 값을 다시 쓰지 않음 |
| 제외 | 새 finite/cap/정수화/default/migration·해금/소환 권위 없음. h307+h308 refresh 및 유사 숫자 함수 수리 없음 |
| 검증 | 실제 두 reader와 own frozen P/INV·roster/provider 새5그룹/main inline1. own 파생 HP/피해 scalar는 실제 actor HP/스폰/전투/UI/saveAPI·창/Native·PC 검증이 아님 |

| 보존·한계 | 범위 |
|---|---|
| 코드 | 지정 reader의 unary+3개만. 현재 main ancHP/ancDur 호환·상한·provider 순서와 그 밖 HTML byte 보존 |
| 백업 | code1/docs4 exact5 WORK/HEAD 개별10 기록은 첫 제품쓰기 전 |
| 검수 | 정상 number의 이전 source/현재 source 결과 동일과 문자열 표현의 own numeric-reference 동일값, 미수집/0점/불변을 확인. 실제 save payload/actor/전투/미리보기 UI를 실행하지 않음 |
| 제외 | 초기 docs 검색에 옛 유골 검사 설명이 표시됐으나 연결 proof/검사 재열람·재연 없음. 인접 h105/h304/h226 및 h307+h308을 수리/재검수하지 않음 |
| 보호 | 원 W/R/WIP·server process/env/save/API/사용자창·HOLD/2_3/PC 전송 유지. 전체 R/최신게임/Native 완료 아님 |

## 2026-10-16 시간왜곡 기록 소유 범위 — R h309+h310+h311

| 항목 | 현행 구현 계약 |
|---|---|
| 본편 소비 | update의 _twRecord 및 CT 시간왜곡 입력의 activateTimeWarp. 두 함수 진입 첫 문장에서 _twSyncSpaceOwner를 호출 |
| 기록 소유 | G/P/map의 참조 동일성, G.stage/G.mw/G.mh의 엄격 비교, !!G._bossArena 값. 하나라도 달라지면 _twFilled=0, _twIdx=0으로 초기화하고 현재 소유 값을 보관 |
| 유효 기록 | G/P/map 중 하나라도 없으면 false로 반환해 기록·발동 본문에 진입하지 않음. record의 기존 G.on/fallen/dead 검사보다 소유 확인이 먼저 실행됨 |
| 같은 공간 | 기록 슬롯·버퍼 배열을 새로 만들거나 지우지 않음. 같은 map 참조의 내부 변경은 이 비교만으로 감지하지 않음. G.on/state만 달라진 경우는 소유 변경으로 추가 분류하지 않음 |
| 기존 기록·발동 | 300슬롯, 원 _twRecord 호출 주기, 최소 기록10, 성공 시 기존 count/index reset 유지. 현재 위치·HP·MP·ST·shield 스냅숏 필드·복원 순서 및 충돌/이동 처리는 변경하지 않음 |
| 현행 비용 식 | 50+(lv-1)*~~(100/19) MP. ~~(100/19)=5이므로 Lv1=50, Lv20=145. 부족 시 기존 안내/반환; 성공의 기존 차감 및 Math.min(차감 후 MP,snap.mp) 유지 |
| 기존 150 표기와 관계 | 기존 설명의 Lv20=150은 현행 정수 산식 결과145와 불일치하는 표기로 보존해 구분한다. 150이 별도 설계목표인지 의도는 이번 범위에서 미확정이다. 150 목표 삭제·145 목표 확정 또는 비용 재밸런스를 하지 않음. 소스의 기존 150 주석도 이식 범위 밖으로 유지 |
| 기존 되감기·쿨 | rewindSec=3+(lv-1)*0.105, rewindFrames=min(기록수,~~(rewindSec*60)). 독립 기본2700f/시간걸음 합체1200f, 무적60f, 환급토큰180f 및 기존 합체 연계 조건을 변경하지 않음 |
| 검사 한계 | 실제 helper/record/activate를 own G/P/map 대역으로 실행한 신규6군 통과. main inline 구문1 통과. 합성 좌표는 실제 이동·충돌·안전복귀·공간명중 증거가 아니며 실제 actor/좌표/stage/map/저장/API/사용자 창/native/PC 실행 없음 |
| 이식 경계 | 원 R h309+h310+h311만. 새 epoch·공간/캐릭터 정책·좌표 보정·dispatcher 성공/반환·부족자원 순서 수리 없음 |

검사 도구의 첫 실행은 기능6군과 인라인9개 구문 파싱 후 전체 스크립트 수를1로 예상한 보고기 assert에서 실패했다. 실제 main inline만 선택하는 구문 검사만 보완·통과했으며 기능6군 재실행·제품 코드 보정은 없었다. firstWholeClean=false를 유지한다. 원R 보존은 codex/mac-environment-20261001@9a4534b42f74093095ebc3364a25dd104e93b379이다.

## 2026-10-16 가방 우클릭 장착의 중복 계산 제거 — R h320

| 항목 | 현행 코드·범위 |
|---|---|
| 소비자 | 가방 아이템의 contextmenu가 _invBagRightClick(idx)를 호출. 기본 장비 경로는 equipItem(item) 다음 renderInv() |
| 이식 변경 | equipItem(item) 뒤의 외부 applyStats() 한 호출만 제거. 성공 장착의 기존 공통 능력치 갱신·저장 호출은 equipItem의 소유로 유지 |
| 기존 반환·렌더 | equipItem 반환값을 새로 검사하지 않음. 대역이 false/true/undefined로 반환해도 기존 renderInv() 경로로 진행하고 router의 기존 undefined 반환 유지 |
| 선행 분기 | 가방 항목이 없으면 반환. inventoryPage=storage면 depositStorage(idx) 후 반환. bonePart면 registerBonePart(item) 후 반환. 순서·인자 불변 |
| 예외·권위 | 기존 equipItem 또는 renderInv 예외를 새로 삼키거나 재시도하지 않음. 새 성공 게이트·자원 회복/차감·직접 save·외부 장착 캐시 처리 없음 |
| 이전 기록과 구분 | 앞선 공통 장비 갱신 이식에서 외부 UI 후속 applyStats를 유지한 기록은 당시 범위 이력이다. 이번에는 _invBagRightClick의 한 호출만 제거했고, 나머지 외부 UI 호출을 일반화해 제거하지 않음 |
| 검사 | 실제 router와 own equip/stats/render/deposit/register/$ 대역의 신규6군 및 main inline 구문1 통과. 원 외부 계산 추가호출을 own stub에서 재현하고 제거 후 단일 위임 계산 관측. 모든 실패 경로·실제 장착/스탯/HP/자원/저장/API/DOM/사용자 창/native/PC 검증을 뜻하지 않음 |
| 별도 미판정 | h319 창고 가방 목록의 null guard는 이번 변경에서 제외. 정상 null producer 미확인만으로 불가능·불필요·동등성을 확정하지 않음 |

## 2026-10-16 설정 캐릭터 첫 셀 프리뷰 — R h321+h322

| 항목 | game.html 현행 계약 |
|---|---|
| 적용 범위 | renderSettings의 캐릭터 카드 프리뷰 자식 canvas와 _drawSettingsCharacterPreview만. 카드 선택·이름·설명·aria·초점·저장·게임 스프라이트와 원 PNG/atlas는 변경하지 않음. game-easy-test.html은 이번 이식 범위 아님 |
| 입력 셀 | fw=ch.fw 또는48, fh=ch.fh 또는48. ch.folder+'/south.png'에서 (0,0,fw,fh) 첫 셀만 같은 크기의 임시 canvas로 복사. idleN에 따른 img/canvas 분기를 없애고 동일 프리뷰 consumer 사용 |
| 알파 경계 | 오른쪽·아래는 마지막 유효 픽셀+1인 경계. all은 alpha>0, body는 alpha>100. body가 없으면 all을 사용하고 둘 다 없으면 false 반환 |
| CSS·bitmap | 출력 bitmap176×176, CSS88×88px, margin0 auto12px, image-rendering:pixelated, display:block, aria-hidden=true. 임시 canvas의 getContext는 willReadFrequently=true; 출력은 clearRect 후 imageSmoothingEnabled=false |
| 배치 식 | below=all.bottom-body.bottom, center=(body.left+body.right)*0.5. scale=min(72/(body.bottom-body.top),40/max(center-all.left,all.right-center),78/(body.bottom-all.top),below>0?8/below:Infinity). dx=44-center*scale, dy=80-body.bottom*scale, ratio=cv.width/88. draw 좌표·크기는 ratio로 곱함 |
| 목표·제약 | CSS 본체 높이 목표상한72px, 발선80px. 전체 알파의 가로 범위4~84px(폭80px), 상단2px 이상/하단88px 이하(발선 아래 최대8px)를 함께 제한. 전체 알파가 넓으면 본체가72px보다 작을 수 있음 |
| 읽기 오류: 전사 | exoduser_warrior의 원 R fallback: body=[11,14,33,43], all=[9,12,35,46] |
| 읽기 오류: 실버테일 | exoduser_silvertail의 원 R fallback: body=[12,2,36,47], all=[11,2,37,47] |
| 읽기 오류: 그 외 | 원 R대로 body와 all 모두 [0,0,fw,fh]. 기존 known/unknown fallback을 수정·재측정하지 않음. 원 주석의 검증 표현은 이번 작업에서 실제 에셋을 새로 검수했다는 뜻이 아님 |
| callback·placeholder | img onload에서 helper를 호출하고 false면 기존 원 R placeholder. onerror도 같은 placeholder: clear176×176 → 배경#443322 → 글자#b4a389/32px sans-serif/가운데 정렬 → '?'를(88,100)에 그림 |
| 예외 경계 | getImageData/경계 판독 try의 오류만 원 fallback으로 처리. 임시 drawImage 등 try 바깥 오류에 새 catch·재시도·다른 경로를 추가하지 않음 |
| DOM 경계 | 프리뷰 canvas를 card.appendChild로 추가. 새 helper·consumer는 부모 textContent/innerHTML을 교체하지 않으며 기존 자식 sentinel 보존을 own DOM 대역으로 확인 |
| 새 검사 | 실제 원 helper·consumer + own 알파 배열/Canvas/Image/DOM 대역 신규6군 및 main inline 구문1 첫 통과. 첫 셀·전체 알파 제약·빈 이미지·read 실패·known/unknown fallback·load/error·자식 보존·원 R와 현 main의3way byte 비교 |
| 검수 한계 | 실제 PNG/atlas/asset byte·실 canvas 픽셀을 읽거나 가공하지 않음. 실 모델/rig/게임 내 sprite·설정 UI창/native/HUD/PC 미검수. 합성 draw 관측은 실제 미리보기·잘림 품질 PASS, 모델 수정, 신규 캐릭터·24장/24FPS 완료 증거가 아님 |

## 2026-10-16 후보 장비 CP 계산·복원 — R h331+h342

| 항목 | 현행 구현 계약 |
|---|---|
| 실제 소비 | _invRenderDetail의 가방 후보/현재 장비 비교 → _invBuildCompare의 CP try 구간에서 _inventoryEquipCP(item,_slot).total 호출. calcCP 공식·CP 차이의 표시 형식은 유지 |
| 기준·범위 | 원 R의 helper와 실제 비교 caller만 이식. 원 R 정렬용 두 consumer를 복구하지 않으며 현행 itemPower 정렬을 변경하지 않음 |
| 조기 반환 | item/slot 없음, 장착 컨테이너에 own slot 없음, 현재 장비와 같은 item, item.reqLv보다 낮은 P.lv이면 기존 calcCP 결과 반환. 새 입력 보정·레벨/장비 정책 없음 |
| 원 참조 보관 | _player=P, _equipped=INV.equipped, _affixCache=_eqAffixCache, _statCache=_eqStatCache를 보관 |
| 강화 미리보기 | 이전 장비 enh>0이면 기존 xferCost(이전 enh)를 G.mats와 비교. 부족하면 현재 calcCP 반환. 충족 시 preview.enh를 이전 enh로 덮어씀. 비용 차감·이전 장비 enh 수정 없음 |
| 보석 미리보기 | 이전 장비 crystals가 있으면 후보 배열을 slice하거나 socketCount 또는0 길이 null 배열 생성. 이전의 비어 있지 않은 보석을 첫 빈칸부터 채우고 여유 없으면 추가하지 않음. 원 보석/배열을 수정하지 않음 |
| 계산 순서 | preview={...item}, P={..._player}, INV.equipped={..._equipped,[slot]:preview}. 두 어픽스/스탯 cache=null → applyStats() → calcCP() 결과 반환. 얕은 복사이며 모든 외부 공급자의 무부작용을 보장하는 규칙은 아님 |
| finally 복원 | 성공·조기반환·오류에서 원 P/INV.equipped/_eqAffixCache/_eqStatCache 참조 복원. helper는 새 catch를 추가하지 않으며 비교 구간의 기존 외부 catch는 유지 |
| 전설 cache 경계 | _lEqCache는 원 helper의 보관·복원 대상이 아님. 현재 정적 callee에서 정상 applyStats→recalcSt 종료는 null 무효화. clear 전 오류는 이전 참조, clear 후 오류는 null로 구분. 현재 resolve된 callee에는 후보 전설 cache를 구성하는 경로가 없으며 새 세 번째 cache snapshot 정책을 추가하지 않음 |
| cache 한계 | 위 경계는 현재 committed plain-data·builtin Array/Set/Math의 정적 callee 범위. 임의 override/Proxy/getter/재진입·전역 cache identity 보존이나 모든 공급자 부작용까지 일반화하지 않음 |
| 저장·자원 | 직접 장착·강화 실행·저장 호출을 추가하지 않음. own fixture에서 원 레코드/직렬화 및 현재 자원 값 복원을 관측했으며 실 P/장비·applyStats/calcCP·save/API를 실행한 검수는 아님 |
| 신규 검사 | 실제 helper와 실제 CP try fragment + own providers/state 6군 및 main inline 구문1 통과. 오류 시 old own 장착 참조 잔류와 새 finally 복원, 조기반환·기존비용·강화/보석·오류/원 catch·나머지 HTML byte 보존 확인 |
| 검사 이력·한계 | 준비 Python quoting과 own 자금부족 fixture 초기 snapshot 오류를 수정해 firstWholeClean=false 유지. 통과2군·조기반환5사례 재실행 없이 실패1사례와 미실행 나머지만 진행했고 제품 코드를 검사에 맞춰 변경하지 않음. 실제 UI·전투력 수치·장착/저장·native·PC·전체 최신 이식 검수 아님 |

## 2026-10-16 강화 이전 비용 부족 안내 — R h344

| 항목 | 현행 계약 |
|---|---|
| 위치 / id | _invBuildCompare의 _xferNote, 후보 장착 시 강화 자동 이전 설명 |
| 표시 문구 | 기존 '악의 부족 → 강화 소멸'을 원 R대로 '악의 부족 → 장착 불가'로 수정 |
| 표시 조건 | _fromE=curEq.enh 또는0. _fromE>0일 때 이전 안내를 만들고 _xc=xferCost(_fromE). (G.mats 또는0)<_xc일 때 위 경고 표시 |
| 실제 권위 | 기존 equipItem은 이전 비용이 부족하면 알림 후 return하여 교체를 차단. 문구를 이 기존 동작에 맞췄으며 새 장착/강화/차감/소멸 규칙은 없음 |
| 보존 | 금액·비용식·조건·원 강화 값·아이템/자원/저장·반환/예외·CP 공식/공급자·스타일·화살표/기존 표시 포맷·locale/사전 코드는 그대로 |
| 검수 | 원 문구 한 곳만 바뀌고 나머지 HTML byte가 같은지 정적으로 확인, main inline 구문1 통과. 저위험 문구 수정이므로 신규 기능 테스트·실 함수 실행 없음 |
| 한계 | 실제 비교창 렌더/장착·계산·자원·저장/API·사용자 창/native/PC 검수 아님. 기존 장착/CP/focus 검사·증거를 다시 실행하거나 재회수하지 않음 |

## 2026-10-16 표준 어픽스 상세·차이 단위 표시 — R h338+h339+h343+h358

| 항목 / id | 현행 표시 계약 |
|---|---|
| 적용 소비자 | _invCardFields의 어픽스 상세 한 줄 → _affixDetailValStr(af). _invBuildCompare의 어픽스 차이 한 줄 → _affixDeltaStr(id,diff). 기존 이름·설명·색·스타일·합산·차이 표시 threshold·CP·DOM 코드는 유지 |
| 상세 대상 | AFFIX_POOL unit이 pct 또는 prob이고 typeof af.value='number', Number.isFinite(af.value)일 때만 새 상세 분기. unit lookup을 먼저 하는 원 R 순서를 유지 |
| 상세 산식 | v=Math.round(af.value*10000)/100. 양수면 '+' 접두, 표시값 -0은0으로 출력, 뒤에 '%' 추가. 예: 0.005→+0.5%, 0.123456→+12.35% |
| 상세 fallback | 그 외는 현재 _affixValStr(af) 그대로 호출. 숫자 문자열/null/undefined/비유한 값·일반 단위·알 수 없는 id에 새 데이터 변환/보정 규칙을 추가하지 않음 |
| 현재 compact 보존 | 기존 간략 pct/prob의 ~~(value*100), dps '/s', tick (value/60).toFixed(2)+_L('초','s'), atk 'ATK×'+정수퍼센트, hp 정수'%HP', 일반 값과 unknown 처리 유지. forge 등 기존 다른 compact 호출부 불변 |
| pct/prob 차이 | n=Number((diff*100).toFixed(2)). 양수 '+' 접두, 표시 -0은0으로 출력 후 '%p'(퍼센트포인트). 예: diff=0.03→+3%p, -0.012345→-1.23%p |
| 일반 차이 | unit이 pct/prob가 아니면 기존 양수 '+' 및 -1<diff<1의 toFixed(3), 그 외 원 diff 표시 유지. 직접 helper의0은0.000이며 실제 호출의 기존 Math.abs(diff)>0.0001 조건을 바꾸지 않음 |
| 반올림 경계 | 상세의 Math.round와 차이의 toFixed→Number는 서로 다른 원 R 방식 그대로. 둘을 새 공통 반올림/정밀도 정책으로 통합하지 않음 |
| 데이터·권위 | finite/type 검사는 원 R의 표시 fallback 선택일 뿐 item 저장값/type/확률/수치/태그/롤/강화/슬롯/캐시/산식/자원/직렬화 검증·마이그레이션을 하지 않음. 표시값은 표준 AF 저장값이며 최종 합산·상한 적용 전투 확률/효과의 실측을 의미하지 않음 |
| 별도 범위 | uniqueSpecial/유니크 롤·이펙트·패링/전투 훅·기존 gameplay helper·locale 사전·focus/lifecycle 미변경. 임의 getter/Proxy/provider와 비정상 af의 모든 예외 동등성을 주장하지 않음. 원 R에 없는 catch/guard 추가 없음 |
| 신규 검사 | 실제 원 두 formatter·현재 compact fallback·실제 두 emitter statement + own frozen AFFIX_POOL/AF/label 대역6군 및 main inline 구문1 첫 통과. finite/작은소수/음수·-0/legacy fallback(tick 포함)/단위·문자열·원값/type/serialization·3way byte 보존 확인 |
| 검수 한계 | 전체 renderer/실제 GUI/DOM·아이템/P/확률/스탯/자원/계산/저장/API/창/native/PC 실행 없음. 실제 화면/줄바꿈/로케일·전투 효과 품질 PASS나 전체 최신 이식 완료를 뜻하지 않음 |


## 2026-10-16 장착·해제 UI 네 소비자의 중복 계산 제거 — R h334/h335/h346/h350 일부

| 적용 위치 | 현행 처리·보존 경계 |
|---|---|
| h334 가방 상세 장착 버튼 | equipItem(INV.bag[idx]);renderInv(). 원 R의 외부 applyStats() 제거를 그대로 적용 |
| h335 장착 상세 해제 버튼 | unequipItem(idx);renderInv(). 외부 applyStats()만 3-way 제거. 기존 undefined 반환을 무시하고 renderInv()로 진행 |
| h346 ossuary contextmenu | preventDefault → oss 없으면 반환 → unequipItem('ossuary') → INV.equipped.ossuary가 남으면 반환 → INV.selected=null → renderInv → _invClearHover. 외부 applyStats()만 제거하고 기존 실제 장착 상태 후조건 유지 |
| h350 장착 그리드 contextmenu | preventDefault → item 있으면 unequipItem(slot);renderInv();return. 외부 applyStats()만 제거. 빈 항목·반환·렌더 순서 보존 |
| 계산 소유 | 성공 장착·해제의 기존 equipItem/unequipItem 내부 _refreshEquipmentStats가 계산 담당. UI에서 추가 계산하거나 새 자원·슬롯·저장 정책을 만들지 않음 |
| 거절·예외 | callee가 장착 상태를 바꾸지 않고 undefined/false를 반환해도 상세 버튼·그리드의 기존 렌더는 유지. ossuary는 반환값 대신 기존 장착 후조건 사용. callee/render/hover 예외는 기존 순서로 전파하며 재시도·새 catch 없음 |
| 부분 채택 범위 | h334는 해당 원 R 변경 전체. h335/h346/h350는 계산 호출 제거만 채택. 원 R의 bool 반환 의존 성공 gate 및 h124/h125/h127 반환 계약 변경은 별도 미채택·미판정이며 이 세 hunk 전체 채택을 뜻하지 않음 |
| 기존 이력과 관계 | 앞선 공통 갱신·h320 기록의 외부 호출 유지 설명은 당시 범위 이력. 이번은 위 네 명시 소비자만 변경하며 유사 UI·focus/DOM·마크업·장비 함수 본체를 확장 수정하지 않음 |
| 신규 검사 | 실제 네 handler fragment + own INV/item/callee/stats/render/event 대역의 신규 7군 및 main inline 구문 1 통과. 성공 위임·no-op 거절·undefined/false/true·ossuary 후조건·예외 순서·네 토큰 외 전체 소스/마크업 불변 확인. 이미 통과한 검사 재실행 없음 |
| 검증 한계 | 실제 equip/stats/자원·HP·저장/API·DOM/GUI·사용자 창·native·PC 실행 0. 합성 대역 검사가 실제 게임 전체/최신 완성본·시각 품질 인수를 뜻하지 않음 |
