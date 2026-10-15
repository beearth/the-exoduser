# PC·Mac·Git 통합 — 2026-10-16

| 항목 | 이번 통합의 계약·현재 한계 |
|---|---|
| 최신 웹 기준 | origin/main c844a3ecd38973e2bc53b8db8af8efe5ca880794. build-target·player-attack-remaster·WarriorDashFlight·Skill Forge·최신 튜토리얼 배지/난이도 마커를 보존한다. |
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
