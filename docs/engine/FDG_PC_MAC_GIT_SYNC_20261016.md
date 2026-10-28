> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. D9는 직전 공통 소스 인수이며, 이번 main/I/R 소스 정렬은 아래 통합 정본과 단위 receipt의 실제 HEAD·tree를 기준으로 확인한다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 통합 현황: [Godot 이식 현황](FDG_GODOT_PORT_STATUS.md). 이 문서는 소스 전달·정렬 이력을 관리하며, 현재 작업본과 열린 실행판·빌드·PC 인수의 상태는 현황 문서를 따른다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

# PC·Mac·Git 통합 — 2026-10-16

## 2026-10-29 Mac A15 1% 인수·검증

PC owner `claude/unity-pc-a15-rangestep-20261028:2ac579319…`의 제품 1줄을 Mac 기준 `unity/main:e4fc056ae…`에 정상 merge했다. Mac 추가는 `PortVerification.VerifyA15Settings`의 SFX/BGM 1% callback·clamp 검증이다. Metal Editor 전체 PASS, ARM64 Settings QA build PASS, 격리 M1 Player 자동 시나리오 PASS. 공통 `79907fac`는 GitHub `unity/main`·Mac·PC 실제 통합 checkout에 반영됐고 핵심 두 파일 raw bytes가 일치한다. 별도 Mac 일반 UI 실창의 SFX/BGM 60→61·격리 저장 복원도 PASS. PC 실행 앱의 최종 source 버전 확인은 pending이다. [원본·수치·영수증](UNITY_MAC_A15_M1_FINAL_20261029.md). 아래 2026-10-28 5% HOLD는 당시 이력이다.

## 2026-10-28 Unity PC↔GitHub↔Mac 현행 동기화 규칙

사용자 최신 지시대로 Unity의 공통 줄기는 GitHub `unity/main`이며 웹 본편 `main`과 구분한다. 매 개발 단위 시작에 fetch한 뒤 실제 소유 checkout·실행 source 경로, 원격 SHA, branch/HEAD, tracked INDEX/WORK와 미추적 파일을 확인한다. 자기 코드+관련 docs만 commit → 최신 `unity/main` 정상 merge → 비강제 push → 반대편 소유자 fetch·정상 반영 → PC/Mac **각 실제 checkout**의 공통 checkpoint 조상 관계와 필요한 파일 byte 일치 순서로 확인한다. WIP는 보존해 담당자와 조율하고, PC checkout을 읽지 못했으면 `PC pending`이다. 작업 브랜치 push만으로 세 곳 동기화 완료라고 쓰지 않는다. 소스 정렬은 Editor/Player/기존 실행 앱의 검증 및 자동 교체와 별개이며, 통과 검사 재실행·자동 서버 재시작·새 자동화/팀 생성은 하지 않는다. 아래 2026-10-16 웹/Godot 통합 기록과 당시 한계는 이력으로 보존한다.

Mac Unity 현재 인수 범위는 `unity/main:444ee86fc16d862edce5eb2897f777253ec257dd`의 자식 `codex/unity-mac-sync-20261028:f8447bc66ebad5c66d003b32d8261f01d7636ee6`에 있는 HUD Linear probe 수리·관련 docs다. Metal HUD 3상태 GPU 판정 PASS/C# 오류0, 전체 `PortVerification.Verify`는 별개 A15 SFX 현행 5%와 Editor 기대 1% 불일치로 종료2/receipt 없음. 이번 공통 원격 반영은 이 HOLD를 해제하거나 PC 실제 checkout·Player 인수를 뜻하지 않는다.

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


## 2026-10-16 필터된 가방 Y키의 원본 아이템 식별 — R h104+h353

| 항목 | 현재 코드·범위 |
|---|---|
| 결함과 정상 경로 | 인벤토리 keydown의 Y(KeyY)는 기존 _jfIdx를 원가방 인덱스로 받지만, 이전에는 필터된 .inv-item NodeList의 같은 표시 순서를 선택했다. 가방 i와 화면 순서가 다르면 다른 카드 또는 없음으로 연결될 수 있었음 |
| h353 producer | renderInv의 filtered 원가방 i 반복에서 .inv-item 생성 직후 div.dataset.inventoryBagIndex=String(i). data-inventory-bag-index는 원가방 인덱스의 문자열이며 표시 순서로 재번호를 부여하지 않음 |
| h104 consumer | 기존 invGrid의 .inv-item 목록에서 [..._xi].find(card=>card.dataset.inventoryBagIndex===String(_jfIdx))로 첫 일치 카드를 찾고, 있을 때만 기존 contextmenu MouseEvent를 bubbles:true/cancelable:true로 1회 전달 |
| 기존 입력 소유 | invPanel.on 확인 → _invHover 우선/숫자 INV.selected 폴백으로 기존 _jfIdx 선택 → 실제 가방 항목 확인 → 기존 Space/X·F·Y 순서. 이 진입 조건·키 우선순서·선택 정책·키바인딩을 변경하지 않음 |
| 빈 결과·예외 | grid 없음/일치 카드 없음이면 기존 return 경로로 끝남. 임의 카드·표시 순서·다른 인덱스로 새 폴백하지 않음. 기존 querySelectorAll/MouseEvent/dispatchEvent 예외를 새로 삼키거나 재시도하지 않음 |
| 불변 경계 | 카드의 우클릭은 기존 원 i를 닫아둔 _invBagRightClick(i)를 그대로 호출. 필터·정렬·가방 좌표·현재 선택·마크업·부모 DOM·장착/저장·자원 정책 변경 없음 |
| 별도 미채택 | inventory focus factory·Tab·새 focus 진입·h102 selector·다른 키보드/입력 변경을 채택하지 않음. 이 속성은 위 Y키가 실제 소비하므로 진단 전용/소비자 없음으로 분류하지 않음 |
| 검증 | 실제 setter와 Y 분기 fragment + own plain 카드/dataset/NodeList/원가방 index/event 대역 신규6군 및 main inline 구문1 첫 통과. index0·필터/숨김 [0,2,5]·표시 재배열·미발견·예외 전파·문자열 타입·두 문장 외 소스/입력순서/마크업 불변 확인 |
| 한계 | 실제 DOM/GUI·물리 키보드/패드·장착/스탯/자원·save/API·사용자 창·native·PC 실행 0. 대역 검사로 최신 게임 전체·화질·캐릭터·맵·원근감 인수를 주장하지 않음 |


## 2026-10-16 선택/고물 분해 확인 전후 객체 재검사 — R h355+h356

| 적용 위치·항목 | 현행 코드 계약 |
|---|---|
| 정상 소비자 | renderInv의 _isBtn.onclick(선택분해), _jkBtn.onclick(고물 일괄 분해). 기존 확인창·성공 후 SFX.pickup → dbSaveNow → renderInv 순서 유지 |
| 원래 대상 범위 | 고물은 기존 filtered에서 만든 _jkItems 객체만 시작 후보로 사용. 선택분해는 클릭 시 _invSalSel의 원가방 인덱스로 가방 객체를 얻음. 다른 필터/가방/신규 객체를 대신 분해하지 않음 |
| _canSelected | it가 있고 fav가 아니며 현재 INV.bag에 동일 객체로 존재하고 INV.equipped의 값에 동일 객체가 없어야 함. salvageVal(it) 결과가 Number.isFinite이고 0 이상이어야 함 |
| _canJunk | _canSelected와 같은 소유·잠금·장착·결과 조건에 it.junk 조건 추가. 선택분해에는 새 junk 조건을 추가하지 않음 |
| h355 확인 전 | 선택 인덱스를 객체로 바꾼 뒤 Set으로 동일 객체를 중복 제거하고 _canSelected로 필터. 후보가 없으면 반환. _pendingTotal을 합산하고 유한·0 이상인지 확인한 후 후보 개수/합계로 기존 확인창 표시 |
| h355 확인 후 | 취소면 반환. 확인 전의 같은 후보 객체를 _canSelected로 다시 필터하고 없으면 반환. 현 salvageVal 합계 _currentTotal을 다시 유한·0 이상 검사 → INV.bag를 해당 객체 제외 배열로 교체 → G.mats+=_currentTotal → _invSalSel.clear()/INV.selected=null → 기존 성공 후속 |
| h356 확인 전 | 기존 _jkItems를 _canJunk로 필터하고 없으면 반환. 그 후보의 _pendingTotal과 개수로 기존 확인창 표시. 이 경로에는 원R에 없는 합계 유한성 검사를 추가하지 않음 |
| h356 확인 후 | 취소면 반환. 같은 후보 객체를 _canJunk로 다시 필터하고 없으면 반환. 현 salvageVal 합계 _currentTotal → INV.bag에서 같은 객체만 제외 → G.mats+=_currentTotal → 선택 초기화 → 기존 성공 후속 |
| 원본 차이 보존 | 선택분해는 객체 Set 중복 제거와 개별/합계 유한·비음수 검사. 고물분해는 기존 후보 목록의 중복 개수 및 개별 검사만 보존. 두 경로를 임의 통일하거나 cap/default/clamp/합계 guard/새 중복·롤백·트랜잭션 정책을 만들지 않음 |
| 수치·저장 범위 | 기존 salvageVal/PM-013-D 대기 환수식·h122/h187·분해액·비용·장착/잠금 producer·직접 저장 API/직렬화 형식 변경 없음. 갱신된 소비자는 기존 함수 결과만 다시 합산하며 실제 저장 호출 소유는 기존 성공 후속에 유지 |
| 기존 예외·부분효과 | 함수·confirm Promise·SFX/save/render 예외를 새 catch로 삼키지 않음. 제거/보상 후 후속 예외가 나도 자동 롤백을 추가하지 않음. 이는 원R 순서 보존이며 실제 데이터 안전 인수 선언이 아님 |
| 신규 검수 | 실제 두 handler와 own Promise-confirm/bag/item/lock/equipped/salvageVal 결과/SFX·저장·렌더 대역 신규10군 + main inline 구문1 첫 통과. 취소·인덱스 이동·삭제/교체·잠금/장착/고물 변화·현재 보상 재합산·원 guard/중복 차이·기존 예외/부분효과·두 block 외 소스 불변 확인 |
| 엄격한 한계 | 확인창 중 실제 정상 bag mutation producer와 입력차단 불변성은 미확인. Promise 대역 중 변경 사례는 합성 조건의 consumer 검수이며 live race·실분해 버그 재현 증거가 아님. actual salvageVal/실자원/DOM/GUI/saveAPI/사용자 창/native/PC 실행0. 기존 confirm helper·과거 검사 재개봉0 |


## 2026-10-16 로비 비율·생성/입장 배치 수리 — 현행 우선

사용자 지시인 로비 UI 비율/버튼 수리이며 전투 밸런스 변경이 아니다. 아래 index.html scoped CSS가 이 문서의 앞선 로비 크기·스크롤·입장 배율 표보다 우선한다. 기존 기본 CSS/과거 실측은 이력으로 유지한다.

| 항목 | 현행 구조·계약 |
|---|---|
| 변경 파일·범위 | index.html head 마지막 lobby-layout-20261016 CSS만 추가. 기존 로비 JS/DOM 자식/asset URL byte 불변, 새 제품 asset0. 원본 아트·로고·배경·생성/삭제/선택/입장·데모/요청guard/API·저장 권위 그대로 |
| 패널·카드 | 우측 clamp(340px,35vw,560px), 폭700px 이하100%. 카드 기본84px→높이760 이하76px→560 이하64px→440 이하56px. 카드 gap10px/낮은높이8px, 같은 단계의 저장 카드는 균일 |
| 목록·생성 | 기존 VIEW2·wheel/nav 인덱스 정책 유지. vp 선호=카드2개+gap/최소1개/내부 세로 스크롤. 별도 생성행64px→560 이하56px→440 이하48px. 440 이하 최소 목록122px/nav164px/coarse nav176px로 행 겹침 방지 |
| 입장 | 하단 구분선·margin/padding으로 분리. 기존 이미지 비율·색/점등 유지, max-height clamp(64px,14dvh,132px), vh fallback 동일. min-height64px. 앞선 min(500px,28dvh) 실측은 이전 배율 이력 |
| Steam CTA | 기존 버튼·URL·동작 유지. 버튼44px, 이미지100%×100% object-fit:contain. 높이760 이하/560 이하 보조행48px와 padding2px0. 최소44px 대상과 충돌하던 초기36/32px 검수안을 대체. 원본 PNG 치수는 읽지 않았고 어떤 비율도 contain 상자에 맞춤 |
| 입력 새영향 | 실제 online/local wheel/nav 산술 callback만 own slot/index/event/render/높이178/162/136/120/56 대역으로 신규4군, CSS 외 소스 불변1군·inline4개 구문. 전체 index 초기화·실목록/API·기인수 guard suite 실행0 |
| 레이아웃 검수 | 실제 lobby markup+scroll-vp/track과 ui-refinement 포함4개 linked CSS. own 카드/neutral intrinsic SVG/fallback 폰트 headless13조건. 1366×650 before 생성 bottom444 > content413.97로 잘림 재현. 최종 after 생성 bottom398 <= content458/footer466. 1280×720/800×480/320폭/844×390/coarse·긴이름/빈목록 확인 |
| 보완 이력 | 브라우저 경로2건 미존재, fixture CSS sanitizer2건으로 초기 시도 실패/무효. 이후 짧은높이·CTA placeholder/기존44px 최소·목록 최소공간 새영향 subset 보완. firstWholeClean=false. 새 CTA 자연높이가 닿은 after조건은 그 영향으로 재검수, 440 이하 변경도 해당 subset 검수 |
| 한계 | neutral 비율상자 화면은 실제 원화·폰트/브라우저 완성화면·물리기기/화질 PASS 증거가 아님. 실제 슬롯/생성/삭제/입장/saveAPI·사용자 창/reload·서버·PC 실행0. 아주 낮은 화면의 뒤 CTA는 기존 outer content 스크롤·초점으로 접근 가능, 행 자체와 이미지 fit/버튼 접근 검수 |

아래 CSS 전량이 현행 수치·간격·색·미디어 조건의 정확한 기준이다.

```css
/* Character selection: bounded cards, a separate create row and a compact entry. */
#lobby>.lobby-right{--lobby-card:84px;--lobby-card-gap:10px;flex:0 0 clamp(340px,35vw,560px);min-width:0;min-height:0;padding:24px 28px;justify-content:center;}
#lobby .lobby-content{flex:0 1 auto;min-height:0;gap:12px;padding-inline-end:6px;scroll-padding-block:6px;}
#lobby .lobby-content>.lobby-header{min-height:36px;margin:0;align-items:center;}
#lobby .lobby-content>.lobby-divider{height:104px!important;margin:0;}
#lobby .lobby-content>.char-list{display:flex;flex-direction:column;gap:10px;flex:0 1 auto;min-height:0;overflow:visible;padding:4px;}
#lobby .char-scroll-vp{flex:0 1 calc(var(--lobby-card)*2 + var(--lobby-card-gap));height:calc(var(--lobby-card)*2 + var(--lobby-card-gap));min-height:var(--lobby-card);overflow-x:hidden;overflow-y:auto;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:#96714e #121012;scroll-padding-block:4px;}
#lobby .char-scroll-track{gap:var(--lobby-card-gap);}
#lobby .char-scroll-track>.char-item{flex:0 0 var(--lobby-card);height:var(--lobby-card);min-height:var(--lobby-card);}
#lobby .char-scroll-nav{flex:0 0 auto;margin:0;gap:12px;opacity:1;}
#lobby .char-nav-btn{min-width:36px;min-height:32px;border:1px solid #75604766;background:#171214;}
#lobby .char-list>.char-item-new{flex:0 0 64px;height:64px;min-height:64px;margin-top:0!important;padding:8px 16px;gap:12px;border-color:#96714e!important;}
#lobby .char-item-new .char-thumb{flex-basis:40px;width:40px;height:40px;}
#lobby .char-item-new .char-name{font-size:.95rem;letter-spacing:.04em;}
#lobby .lobby-card-gap{display:none;}
#lobby .lobby-mid-area{flex:0 1 auto;min-height:0;max-height:152px;padding:0;overflow-y:auto;}
#lobby .lma-banner-inner{padding:8px 0;gap:6px;}
#lobby .lma-main-txt{font-size:14px;line-height:1.35;}
#lobby .lma-sub-txt{font-size:11px;line-height:1.4;letter-spacing:.03em;}
#lobby .lma-steam-btn{width:min(200px,70%);height:44px;display:flex;align-items:center;justify-content:center;}
#lobby .lma-steam-btn img{width:100%;height:100%;object-fit:contain;}
#lobby .lobby-footer{margin-top:14px;padding:10px 4px 4px;gap:0;border-top:1px solid #96714e55;}
#lobby .enter-game-btn{min-height:64px;}
#lobby .enter-game-btn img{width:100%;height:auto;max-height:clamp(64px,14vh,132px)!important;max-height:clamp(64px,14dvh,132px)!important;object-fit:contain;}
#lobby .lobby-bottom-actions{min-height:36px;margin-top:4px;}
@media(max-height:760px){
 #lobby>.lobby-right{--lobby-card:76px;padding-block:16px;}
 #lobby .lobby-content{gap:8px;}
 #lobby .lobby-content>.lobby-divider{height:72px!important;}
 #lobby .lma-txt-group{display:none;}
 #lobby .lobby-mid-area{flex:0 0 48px;max-height:48px;}
 #lobby .lma-banner-inner{padding:2px 0;}
 #lobby .lma-steam-btn{width:min(170px,60%);}
 #lobby .lobby-footer{margin-top:8px;padding-top:8px;}
}
@media(max-height:560px){
 #lobby>.lobby-right{--lobby-card:64px;--lobby-card-gap:8px;padding-block:10px;}
 #lobby .lobby-content{gap:6px;}
 #lobby .lobby-content>.lobby-header{min-height:30px;}
 #lobby .lobby-content>.lobby-divider{height:44px!important;}
 #lobby .char-list>.char-item-new{flex-basis:56px;height:56px;min-height:56px;}
 #lobby .char-scroll-track>.char-item{padding-top:6px;padding-bottom:6px;}
 #lobby .lobby-mid-area{flex-basis:48px;max-height:48px;}
 #lobby .lma-steam-btn{width:140px;height:44px;}
 #lobby .lobby-footer{margin-top:6px;padding-top:6px;}
}
@media(max-width:700px){
 #lobby>.lobby-left{display:none;}
 #lobby>.lobby-right{flex-basis:100%;width:100%;padding-inline:24px;}
 #lobby .lobby-content>.lobby-divider{height:76px!important;}
 #lobby .char-name:has(.char-name-label){flex-direction:column;align-items:flex-start;gap:2px;}
 #lobby .char-name:has(.char-name-label) .char-cls{max-width:100%;margin:0;}
}
@media(max-width:700px) and (max-height:560px){#lobby .lobby-content>.lobby-divider{height:44px!important;}}
@media(max-height:440px){
 #lobby>.lobby-right{--lobby-card:56px;}
 #lobby .lobby-content>.lobby-divider{height:32px!important;}
 #lobby .char-list>.char-item-new{flex-basis:48px;height:48px;min-height:48px;}
 #lobby .char-item-new .char-thumb{flex-basis:32px;width:32px;height:32px;}
 #lobby .char-scroll-track .char-thumb{flex-basis:36px;width:36px;height:36px;}
}
@media(pointer:coarse){#lobby .char-nav-btn{min-width:44px;min-height:44px;}}
@media(max-height:440px){
 #lobby .lobby-content>.char-list{min-height:122px;}
 #lobby .lobby-content>.char-list:has(>.char-scroll-nav){min-height:164px;}
}
@media(pointer:coarse) and (max-height:440px){
 #lobby .lobby-content>.char-list:has(>.char-scroll-nav){min-height:176px;}
 #lobby .lobby-content>.lobby-divider{height:24px!important;}
}
```


## 2026-10-16 deathFX 동기 음향 dispatch 예외 경계 — R h167 audio 부분+h168

| 항목 | 현재 코드·제한 |
|---|---|
| 채택 범위 | deathFX의 기존 if(!noSound) 안에 원R try를 열고, 기존 음향 block 끝에 catch(e){console.error('[SFX] death dispatch error:',e)}만 추가. h167 기인수 impactId/signature와 시각부·h169는 변경하지 않음 |
| 정상·noSound | noSound guard 밖의 정책은 그대로. 원 _playSampleNow/provider/음량/키·인자·호출 횟수/순서·RNG 소비·사망 후속 변경 없음. noSound이면 음향과 counter 변경을 건너뛰고 기존 후속 진행 |
| 기존 burst | 일반 최대6보이스/보스1, 프레임 경계 reset와 _deathSfxCd=5 유지. 동기 예외 전 이미 일어난 frame mark/count/cooldown/RNG 부분효과는 되돌리지 않음. 새 cap/volume/회복/재시도 정책 없음 |
| 동기 예외 | 음향 block 내부 throw만 원 prefix로1회 기록하고 기존 비음향 deathFX 후속으로 진행. 실제 정상 callee의 throw producer나 live 사망 오류를 확인했다는 뜻이 아님 |
| 예외 한계 | console.error 자체 throw는 그대로 전파. 기존 비음향 후속의 throw는 새 guard 밖에서 전파. Promise rejection/queue/등록 전 복구/외부 인자 평가를 감싸거나 변경·재검수하지 않음 |
| 구현 권위 | 기존 명시 R 소스통합의 독립 audio consumer 경계 채택. 과거 기능 전체 승인·실제 사망 안전·청감·성능·field 피해/HP/VFX 동일성으로 승격하지 않음 |
| 신규 검수 | 실제 audio fragment+own SFX/key/volume/RNG/framecounter/logger/후속 spy 신규7군 및 main inline구문1 첫 통과. 정상/armored/ghoul/boss·noSound·기존throttle/cap상태·동기throw/부분효과·loggerthrow·후속throw·음향2구문 외 전체소스 byte불변 확인 |
| 미실행 | actual _playSampleNow/queue/providers/Promise·AudioContext/미디어·사망VFX/corpse/gibs/HP·사용자 창·saveAPI·native·PC 실행0. 기존 helper/원화/기인수 guard·검사·proof 재개봉0. b836 로비/index 변경·재검수0 |


## 2026-10-16 인트로 진동 반환 Promise 거부 처리 — 원R h430 소스 채택

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 범위 / 호출 소유 | game.html `_renderIntroCutscene()`의 기존 진동 요청 1곳. 메인 loop의 `_cutsceneState==='INTRO_CUTSCENE'` 분기에서 호출한다. 원R h430의 `.catch(()=>{})` suffix만 채택했다. |
| 2 / guard / one-shot | `ln.vfx&&ln.vfx.shake&&!_cutVibDone` 조건과 진입 직후 `_cutVibDone=true` 선행 기록을 유지한다. 같은 줄 재렌더에서 재요청하지 않는다. |
| 3 / 장치 선택 / 순서 | 기존 `navigator.getGamepads()` 결과를 인덱스 순서로 순회한다. `gp&&gp.vibrationActuator` 조건을 유지하고 해당 actuator의 `playEffect`를 호출한다. |
| 4 / effect / startDelay | `dual-rumble` / `0` ms. 기존 값 유지. |
| 5 / duration | `Math.min(ln.dur,1200)` ms. 기존 상한 1200 ms와 식 유지. |
| 6 / weakMagnitude / strongMagnitude | 둘 다 `_mag=Math.min(1,ln.vfx.shake/3)`. 기존 상한 1과 나눗수 3 유지. |
| 7 / 비동기 거부 | 기존 `playEffect(...)` 반환값에 `.catch(()=>{})`를 직접 연결한다. 해당 반환 Promise의 거부를 빈 콜백으로 소비한다. |
| 8 / 동기 예외 / 호출 중단 | 기존 전체 순회의 `try{...}catch(e){}`를 유지한다. 동기 예외 뒤 남은 장치 요청을 재시도하지 않는다. 선행 `_cutVibDone=true`도 되돌리지 않는다. |
| 9 / 새 동작 제한 | 다른 진동 호출, Promise 정규화, await, retry, 로그, 시간·강도, 스토리 텍스트·분기·렌더·진행·입력 소유 변경은 없다. 이 consumer 채택은 기존 STORY/rig/InputRoot/native/기타 HOLD의 해제가 아니다. |
| 10 / 검증 / 수치 표본 | 실제 if-fragment와 자기 격리 VM·navigator·actuator·controlled own native Promise 6개 검증군 통과. 정상, 거부, navigator 동기 throw, actuator 동기 throw와 순회 중단, 미지원/복수 장치 선택, guard/one-shot을 확인했다. 표본 shake 1.5 / dur 480 → 강도 0.5 / 480 ms, shake 6 / dur 1500 → 강도 1 / 1200 ms. |
| 11 / 문법 / 검사 실행 한계 | 메인 inline script 1개 문법 통과. 최초 검사기의 비JavaScript importmap 분류 오류는 기능군 실행 전에 발생했다. 검사기만 범위를 고쳐 기능 6군을 처음 실행했고 통과군은 재실행하지 않았다. 최초 오류 전 전체 소스의 suffix 1곳 이외 byte 일치 검사는 통과했다. 전체 최초 실행 무결점은 아니다. |
| 12 / 인수 / 실물 한계 | 기존 로비·문 열림 진동 문서는 이 인트로 consumer의 과거 완료 승인이나 실거부 발생 근거가 아니다. 이번은 원R 비중단 진동 실패정책의 해당 consumer 소스 통합이다. 실제 패드·인트로 전체 실행·그림·실입력·저장·자원·사용자 GUI 검증은 수행하지 않았다. 전체 최신판 완료를 뜻하지 않는다. |


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / Player 소유 | NativeArmorElementScript는 기존 item_armor_element/producer.gd. _native_armor_element는 Player가 소유하는 RefCounted이며 bind_native_armor_inventory(reader: Callable)->bool은 유효한 무인수 reader를 한 번 바인딩한다. 무효·중복 바인딩은 false이며 기존 바인딩을 변경하지 않는다. |
| 4 / 기존 피격 소비 | get_native_element_multiplier(attacker_element_id:int)->float가 현재 provider를 위임한다. 기존 enemy_projectile_fire.gd의 실제 contact는 이 getter→int(damage×multiplier)→기존 receive_damage 요청을 그대로 사용한다. 새 피해·resource sink나 패링/탄 수명 정책은 추가하지 않는다. |
| 5 / 현재 장비 / identity | 매 조회마다 실제 SourceState.read_current_inventory의 현재 equipped.armor와 el을 읽는다. armor/INV/equipped를 복제·캐시하거나 id로 재검색하지 않는다. 같은 id의 객체 교체·동일 객체 el 변경·inventory/equipped 교체가 다음 조회에 반영된다. |
| 6 / 없음 / null / falsy | unbound·무효/소멸 reader·비Dictionary INV/equipped·누락/null/빈 armor·누락/null/문자열/bool el은 기존 producer의 neutral1 의미를 유지한다. 누락 el을 물리0으로 만들지 않는다. |
| 7 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 8 / 새 검수 | Godot4.7.2 headless의 자기격리5군/13접촉 첫 실행 통과. 실제 새 Main 바인딩3줄과 Player 변경 메서드, 변경 없는 기존 fire projectile의 contact를 소비했다. owned base37의 요청은 현재 fire armor18/ice armor74/neutral37로 관측했다. 이는 실 Player HP 손실값·실물 장착·자연 탄 생성 증거가 아니다. |
| 9 / 검수 분리 | Main 전체 startup/GPU와 Player 원화 preload를 실행하지 않았다. 격리 장면은 새 Main fragment/Player 메서드를 그대로 추출하고 기존 projectile 전체 script를 복사하되 visual lifecycle만 fixture에서 비활성화·owned contact 상태를 시드한다. 실제 Main/Player 전체 실행·configure/import/spawn·PNG/샘플·실 save/API/사용자창/PC 검증0. 옛75검사 재실행0. |
| 10 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |


## 2026-10-17 사용자 확정 운영 기준 / project model-only 정상 통합

| id / 항목 | 현재 기준·구현 범위 |
|---|---|
| 1 / 기준 / PC·Mac·Git | 최신 canonical main을 공통 source 기준으로 삼고 기존 각 로컬 source/WIP를 보존해 정상 통합한다. PC/Mac 경로·런타임 차이는 허용한다. Git ref·파일 전달·실제 실행 source 경로의 확인 단계를 구분한다. |
| 2 / 범위 / 완료 주장 | PC 실행 source가 미확인이면 PC 동기화 미확인. 웹 본편·Godot 부분 이식·외부 검토 사본·배포본을 구분한다. 로컬 commit/remote ref/정적 GET만으로 전체 최신게임·GUI·PC/Native 완료를 주장하지 않는다. |
| 3 / 정상 Git / 소유권 | 자기 소유 경로만 stage/정상 commit하며 현재 remote parent·expected_sha·force=false를 보존한다. tracked INDEX/WORK를 분리 확인하고 전체 untracked 반복스캔·수량감소용 타인WIP stage/삭제/ignore는 하지 않는다. 인증/권한 변경·우회0. |
| 4 / 현재 Claude 사용자 기준 | Opus 5.5, 프로젝트 재시작/다음 실행 기본 model=claude-opus-5-5. 이후 배정·재개 시 실제 사용 가능한 최신 최상위 모델을 확인·적용하며 임의 하향하지 않는다. |
| 5 / 현재 선택 / 다음 기본값 / 실제 실행 | 선택 표시·프로젝트 기본값·새 응답 model ID를 구분한다. Claude 담당 인계상 live7 선택은5.5, SKILL 새 응답의 claude-opus-5-5 확인, MAP live session 없음/다음 기본값5.5. ENGINE이 전팀 응답을 새로 검증한 것으로 소급하지 않는다. |
| 6 / project model-only 인계 | Claude 담당이 R/W 두 project settings의 유일 model키를 claude-opus-4-8→claude-opus-5-5로 변경한 원작성자다. ENGINE은 자신의 fresh WORK/HEAD backup과 canonical base/원담당 backup/current WORK 3way 뒤 정확한 model-only 변경을 통합한다. hooks 등 비model JSON값·키·인증/권한은 변경하지 않는다. R/W 최초변경을 ENGINE 작성/사전backup으로 소급하지 않는다. |
| 7 / 비수송 / 보호 | user-global MEMORY·설정·credentials·permission·host 설정을 Git에 넣지 않는다. 기존 HOLD/2_3/MAP/ART/STORY/rig/SW/native3387/NativeHUD/LAVA/ENEMY_GL_BODY_FALLBACK와 서버/save/사용자창/PC·Steam 보호 유지. |
| 8 / 산출물 구분 | ARMOR source consumer의 별도 완료 commit은 a17560969df27b567d90e3c94c71290816b7d651. 이번은 지침/프로젝트 model 기준 통합이며 팀 수·설정 완료를 제품 기능 완료나 이식률로 더하지 않는다. 전체 게임 최신 이식은 미완료. |
| 9 / GitHub 기준 완료 조건 | 지침과 안전한 project model-only 변경이 실제 canonical main ref에 반영되고 R의 자기 target이 정상 정렬된 뒤에만 GitHub 기준 반영 완료로 보고한다. 아직 미확인 PC/실행본은 그대로 미확인으로 둔다. |


## 2026-10-17 인수 native source의 main·R 디스크 정렬

| 항목 | 적용 범위 / 완료 판정 |
|---|---|
| 승인 source | f8 이후 인수12 local/remote paired-tree chain, localc7dc6bbe/remote c43d164c, treefce4b2b6. source union50=code16/docs34, 통합상태docs2를더해exact52 |
| Git/R source 판정 | fresh main expectedSHA/forcefalse 정상FF→I/R actual mainHEAD/tree/upstream 및 scope WORK/INDEX 정렬→새경계static. 실제 최종값/시각은 아래 정본의외부finalreceipt에서확인하며사전f8관측을최신HEAD로사용하지않음 |
| 새 기능/실행 | sourcecode새개발0·기수송blob/통과suite재연0. R디스크source와사용자창/process/export/PC·Steam 실행은구분하고reload/input/restart/GET/save/asset/import0 |
| 미완/보호 | DCP/sourceclock/fullhurtE/poise19985tail/KB42483·원RNG/전체startup·24고유장24FPS·표시·실전/전체최신未. 별도crossbow/옛R9/R30·held/ART/LAVA/HUD/GL/rig/asset/save0. 원실패/partial/NOT_RECORDED·latest_full_gamefalse유지 |
| 정본 | [인수 소스 main 정렬 계약](FDG_ACCEPTED_NATIVE_SOURCE_MAIN_SYNC_20261017.md); 실제 main·I/R 적용은 새 final receipt의 관측으로 판단 |


## 승인 provider4 소스 통합 / V4 실패3 후속 (2026-10-17)

| 항목 | 현재 기록 |
|---|---|
| 승인 소스 | local6f06006ea8ed1048a6562bc8f4fe1ef3ee41ab9e / remote03e9f62a991e05e01de7e012d4b5cf80bb63d18b / tree634ea60fc5c018b1bf5293346f5a999a688c8612. code2/docs11의 네 실제 Callable 접점만 통합한다. |
| 최초 V4 | 원108 중3FAIL과 통과105/원 로그 동결. 전체108 재검수 PASS로 소급하지 않는다. |
| 후속3 진단 | 같은 frozen V4·동일 A1/A2 입력의 새 행동9/FAIL0, setup 실제8/FAIL0, exit0, 양로그 ERROR/WARNING/leak0. 후보/contract/제품 코드 수정0. A1 hp100−100=0 및 A2 nested hp50−100=−50의 DEAD/normal_death_entry_42702가 원 계약이다. A1 raw32행 중 seq17 u_eq(_uAxeLeech)는 slot=''·int0·origin부재, eq31은 origin=absent_zero·0.0이므로 callback별 부재 검사가 필요했다. A2 condition→rand→재조회→weapon_el×2 순서 보존. |
| 원 자료 한계 | 후속 종료문 setup9와 실제 setup8을 구별. PRE 내부01:30:10Z와 실제 Write use01:30:07.358Z/result01:30:07.775Z 차이 보존. 결과19173B/SHA256 d91d94dcf7ca643946100eb9eb80c5e12e22001d6598e240dd8d9c72d4c55dff는 ROOT 첫 인수 캐시이며 재실행0. |
| 실제 접점 | 앞선 메서드 추출/명시 대역 첫31 PASS와 별개다. synthetic25 owner/후속9를 actual Main/Services/configure/provider 수명·원수식·전체 전투 parity로 세지 않는다. 다른21 owner·source clock·hurtE caller·효과 미연결, 실제 게임/PC/export 미검증 유지. |
| 과거 backup 한계 | 당시26행/52WORKHEAD슬롯=48copy+4absent→PRE→code기록 선행 확인. code recorded_at은 개별 실제 쓰기시각이 아니며 당시 realparent/nonlink·split INDEX/WORK 상세 flag는 NOT_RECORDED. 새 증거로 소급하지 않는다. |
| 통합 증거 | 이번 정확15경로의 새 backup·ancestor/realpath guard·분리 INDEX/WORK·main expectedSHA/forcefalse·R FF·최종pin은 NORMAL-HURTE-PROVIDER-MAIN-SYNC-20261017/final-receipt.json에 기록한다. 소스 정렬은 열린 게임/served 빌드의 최신성 증거가 아니다. |


# Normal lesson active-only 메인·R 소스 통합 (2026-10-17)

| 항목 | 소스 통합 계약 |
|---|---|
| 기존 main | fresh GitHub main216126d70c2b1d280b55bd578fde2d24e15a3d23 확인, 이 expected SHA로 force=false 정상 FF만 사용한다. |
| 승인 단위 | local5e096983bc5652aaacb5175580e176a8d26987a6 / remotea0d36a20fdbf94e410e2a1fd0ae44874ccff9b37 / tree9a5964836c73e9dd325bfaef1501d91e8269b8db, code2/docs9. 원 local/remote WIP ref 보존. |
| 정확 변경 | 새 구현 코드0. 이 통합 문서 및 PC_MAC_GIT_SYNC만 갱신한다. 전체 source union13경로(code2/docs11); 승인된11 blob 재업로드0. |
| 실제 API | SourceLesson.read_active_status() 및 Main.read_native_normal_enemy_lesson_status(). 기존 current/authority/optional weak publisher/epoch만 사용, active1회/chapter0. 선언 weak publisher 유실은 CURRENT와 witness 모두 NR. 새state/epochcounter/그림자 없음. |
| 미준비 | UNKNOWN을 false로 만들지 않고 active 키를 생략한다. Main 교체/epoch변경은 원 read_result 보존. 기존 regen/finish/controller 본문은 변경하지 않는다. |
| 검수 이력 | 첫 fixture seed 이름이 내장함수와 충돌하여 parse실패/exit0/result없음/기능0. fixture명만 수리한 새49PASS/양로그0, 별도 정적10PASS. first_whole_clean=false. literal protected-call0은 선언 scope이며 실제 실행 계측값이 아니다. |
| 실행 범위 | 실제 수정 SourceLesson의 fresh 기존필드seed·Main 메서드추출 검수. 자연publication/전체Main/실게임/PC/export 수명 통합은 미검증. 기존49/31/9/108/oldproof/parse 재연0. |
| 새 사전보존 | 정확13경로×I/R26행, WORK/HEAD52슬롯=46copy+6absent. 첫 doc쓰기 전에 각복사 시각·nonlink ancestor/realpath·분리INDEX/WORK 저장. R은 FF 직전 같은 union만 새로 재보존한다. 과거 steering의 별도ancestor시각 미기록은 유지/소급0. |
| 정상 Git | 승인 a0 부모에서 docs commit→main expectedSHA/forcefalse→I filtered fetch/새tracking branch→R 로컬 I 객체재사용/정상 origin fetch→merge --ff-only --no-overwrite-ignore. 원 refs/foreignWIP 보존. |
| R Git 경고 | 기존 promisor/config shorthand 경고는 소스 정렬 성공과 별개로 보존한다. config 정리/원 부재 추정0, 전송byte 미기록을 0으로 주장하지 않는다. |
| 완료 판정 | 새13경로의 I/R 실제26파일↔최종commit blob 일치를 새 정적검사1회로 확인하고 외부 final receipt에 actual main/I/R commit/tree를 기록한다. |
| 남은 실제 연결 | normal parry_lesson_active callback 미등록. 기존 ENEMY v5는 API팩을 받아 같은SID에서 source/parse 대기 중이라는 ROOT 인수 시점 기록이며 제작/등록 완료가 아니다. 다른21 owner·전체25/sourceclock/hurtE/effects·전체게임 최신성은 미완/미검증이다. |

정확 API·원 first-failure/새49·한계는 FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md를 따른다. actual normal callback이 아직 추가되지 않았으므로 기존 typed4 map은4이고, 기존 미연결 callback 수는21이다. v5 후보가 오더에 배정됐다는 사실로 그 수를20으로 줄이지 않는다.

최종 정상 소스 정렬의 exact pin/새guard/정적결과는 NORMAL-HURTE-LESSON-ACTIVE-MAIN-SYNC-20261017/final-receipt.json에 남긴다. source 정렬은 사용자가 보고 있는 served 게임/export/PC의 최신버전 증거가 아니다. GUI/server/API/save/original media read/copy/import0.


# Normal lesson callback5 메인·R 소스 통합 (2026-10-17)

| 항목 | 현재 통합 계약 |
|---|---|
| fresh main | 7023c3815ce0de027fdfa766ab2bfa9996968ea0를 기대SHA로 정상 force=false FF만 수행한다. |
| 승인 소스 | local684d41c32ecfe1ba25d6e213022b5ceea5ca17a2 / remote232434f96df8c271c9816e22195ab65a507a82d0 / tree4b7bfc040671d8e0d54d0a958d31fc6a1819f0f4. code1/docs13, 원 local/remote WIP ref 보존. |
| 정확 scope | 새 구현코드0/통합문서2만 갱신. 전체 union16경로(code1/docs15). 승인된 기존14blob 재업로드0. |
| 실제 등록 | Services getter는 기존 typed4 뒤 parry_lesson_active 한 Callable을 추가한 map5/미연결20. 신규 wrapper read_normal_enemy_parry_lesson_active는 current actualMain.read_native_normal_enemy_lesson_status1회와 전후 ownership-only guard2를 사용한다. |
| 원 결과·수명 | context 유효 시 Main의 원Dictionary 그대로, context 손실 시 topNOT_READY/active생략/context_reason 및 원 read_result 보존. 새 domain5/OPT/chapter/controller 조회·state/epochcounter·scalarfalse없음. 기존4 helper/dispatch·원Main/SourceLesson본문불변. |
| 검수 이력 | callback-first 최초25/FAIL0/exit0/양로그0, 별도정적10PASS. 25는검사수이며25owner ready가아니다. 첫25뒤 Four→Five comment만수리했고원fullhash/실행메서드본문동일성을구별했다. 실제Service/Main 메서드+명시holder/provider/lessonAPI stand-in 범위로, wholeMain/configure/자연SourceLesson수명은미검증. |
| V5 독립 범위 | ROOT가 별도 source/parse 및 lesson 경계15case/행동64/setup7의첫결과를인수했다. synthetic enemy/owner에서42111 typedstop/raw보존만의결과이며 실제20owner/25ready/nativecaller를증명하지않는다. 이통합에서V5제품copy/등록0. |
| 새 사전 보존 | 16경로×I/R32행, WORK/HEAD64슬롯=58copy+6absent. 첫doc쓰기前개별copy시각/ancestor nonlink/realpath/분리INDEXWORK 저장. R은FF직전같은union만fresh보존하며foreignWIP/광범위untracked 조사0. |
| Git | 원232부모에통합문서commit→main 기대SHA/nonforce→I정상filteredfetch/새trackingbranch→R로컬I Git객체재사용/정상originfetch→merge --ff-only --no-overwrite-ignore. 기존promisor경고raw유지·config정리/원부재추정0·정확전송byte未. |
| 완료 검수 | 새변경16경로의I/R실제32파일과최종commitblob을새정적1회대조. old25/64/49/31/9/108/parse·원proof재연0. 최종pin/개별guards/결과는외부NORMAL-HURTE-LESSON-CALLBACK-MAIN-SYNC-20261017/final-receipt.json. |
| 남은 게임 연결 | 실제normal hurtE/kernel caller·미연결20 callback·전체25/sourceclock/effects/fullhurtE/latestfullgame 미완. 다음실kernel target/실caller/정확owner 근거를먼저고정하며dummy/noop/preflight우회금지. 실제opened/served/export/PC검증아님. GUI/server/API/save/원assets read/copy/import0. |

정확callback 계약과최초25의범위는 FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md를따른다. 정상Git소스정렬을최신전체게임 실행완료로표시하지않는다.


# Normal player_view callback6 메인·R 소스 통합 (2026-10-17)

| 항목 | 통합 계약 |
|---|---|
| 원 main | fresh7a332689853a18fb63b930111bd925edbf3af9c1 기대SHA로 정상force=false FF. |
| 승인 단위 | local8b868e718f3551a4144403a284b3b75c02e18e0f / remotea7ea4cec997b3f0995ee270fa774ae5197b329cd / tree17843ebad23eb5e31f4c195bf6ca292e23625685, code1/docs15. 원WIP/local8b/remotea7 ref 보존. |
| 이번 scope | 구현코드 추가0·통합문서2만갱신. 전체union18경로(code1/docs17). 승인old16blob재업로드0. |
| 실제 등록 | 기존5순서뒤 player_view 추가로map6/미연결19. read_normal_enemy_player_view()->Variant: 기존ownershipprefix→같은actualState.read_current_p1회→동일prefix. 유효rawP참조/원null 또는context유실null. |
| 원 계약 | hp/mhp/x/y/s와optional전체는같은ownedP로전달. SourceState기존sync 책임을소비하며clone/filter/default/envelope/status정책/다른domain·OPT·clock환산없음. postloss뒤이미적용된ownedP sync를rollback하지않음. 기존5본문불변. |
| 첫검수 이력 | 새26/FAIL0/exit0/양로그0 및별도정적10PASS. 실제Services/Main메서드+State/public5sync·holder/provider대역범위. State본문/Resource6·wholeconfigure·자연수명실행이아니다. 기존26/25/64/49/31/9/108/parse/proof재연0. |
| 새 사전보존 | 18경로×I/R36행, WORK/HEAD72슬롯=66copy+6absent. 각copy시각/source·dstancestor nonlink/realpath/분리INDEXWORK를첫doc쓰기前저장. R은FF직전동일union만fresh재보존. |
| 정상 Git | 승인a7부모에서docscommit→main expectedSHA/nonforce→I filteredfetch/새trackingbranch→R로컬I객체재사용/정상originfetch→merge --ff-only --no-overwrite-ignore. 원refs/foreignWIP보존, 기존promisor경고raw유지/설정정리·원부재추정0·정확전송bytes未. |
| 새 통합검수 | 변경18경로의I/R실제36파일↔최종commitblob을단1새static으로대조하고exactpin/guards/결과를외부NORMAL-HURTE-PLAYER-VIEW-MAIN-SYNC-20261017/final-receipt.json에기록. |
| 남은 실연결 | actualV5/kernel/normalhurtE caller未·미연결19/전체25ready/sourceclock/fullkill/effects/fullhurtE/latestfullgame미완. requiredWorld.get_native_source_fireball_bindings hook부재/partialenemyfields한계유지. unusedkernelcopy·dummy/noop·25presence우회금지. |

정확API/첫26과검증한계는 FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md를따른다. 이소스정렬은사용자opened/served게임·새export/PC완료증거가아니다. GUI/server/API/save/원media read/copy/import0, 과거원실패/계측한계/자연publication미검증을소급하지않는다.


## Normal stat_str 메인·R 소스 통합 — 2026-10-17

| 항목 | 인수된 소스와 통합 계약 |
|---|---|
| 이전 main | d47af4a462cfa989fee190c5fc10c3c4377a0e23. 실제 원격 ref를 새로 확인한 값으로 expected_sha/force=false를 적용한다. |
| 인수 소스 | 원 로컬 0ea40a3ad8064853c52c9722621dd84c7ddf5ccc / 원격 WIP 9f3eaee5ec1d14552171531d4bce1dccd0b79aa6, 동일 tree e3f32a3887b094a84f0478cf0ac3c797e140144a. 원 branch와 ref를 보존한다. |
| 정확한 범위 | 인수 코드2 + 인수 docs17을 그대로 유지하고 이 통합 문서와 FDG_PC_MAC_GIT_SYNC_20261016.md만 추가 갱신한다. union21개. 인수19 blob 재업로드0. |
| 실제 공개 API | formula.stat_str()->Dictionary(0), Services.read_normal_enemy_strength_multiplier()->Dictionary(0), callback stat_str. 원 STAT_STR=1.0을 같은 소유자의 기존 _ok로 반환한다. |
| raw / 실패 | 정상 raw는 status/value(float1.0)/non_finite=false/source/undefined_reads=[]/reason. 실제 Main/Services/Providers 및 formula 객체·Script·수명 전후 검증. 실패 NOT_READY, query 후 raw read_result 보존, 최상위 numeric value 폴백0. |
| 현행 노출 | eq_affix/u_eq/p_atk_mul/melee_ref/parry_lesson_active/player_view/stat_str, 7/25·미18. V5의 scalar 세 위치는 아직 typed 미지원이며 실제 V5 바인딩0/unused kernel copy0. 25 presence 불변. |
| 첫 검사 이력 | 새25/25 PASS, exit0·양로그 오류/leak0, 별도 정적10/10. 실제 full formula 새 reader/own _ok 및 정확 추출 Services·명시적 Main/actor/holder/provider 대역 범위. 전체 Main configure/자연 수명/게임플레이/V6 caller 실행 아님. 기존 성공 suite 재실행0. |
| 선행 보존 | I/R exact union42행84 WORK/HEAD slots: 실제 복사78/absent6. INDEX/WORK 별도 scoped clean 및 각 복사 전 source/destination ancestor nonlink/realpath·개별 UTC 기록을 저장한 manifest 뒤에 통합 작업한다. |
| R 반영 | 교체 직전에 exact union21개의 fresh WORK/HEAD·scoped INDEX/WORK·nonlink guard를 다시 보존하고 저장한 manifest 이후 정상 fast-forward한다. 기존 원 branch/WIP·타인 파일 유지. |
| Git 경고 | R의 기존 absolute-path promisor 경고를 원문 로그로 보존한다. config 정리0. local object reuse fetch는 filter 인자를 쓰지 않고 origin은 정상 filtered fetch. 네트워크/blob 전송 byte 수는 NOT_RECORDED. |
| 완료 증거 | source main/I/R 실제 SHA/tree/upstream, scoped INDEX/WORK, union 실제 파일 대조는 이번 새 통합 경계 static1회와 외부 finalreceipt가 확정한다. 소스 검사와 실행판 최신화를 구분한다. |
| 실행/품질 한계 | runtime/Web export/PC 기동/사용자 창·서버·save·asset/import 변경0. 실사용 host/URL 미확정. full25/full hurtE/latest_full_game=false/content_parity=INCOMPLETE. VISUAL VERDICT 신규 판정 없음, 기존 RETOUCH 유지. |
| 후속 | 기존 ENEMY V6의 stat_str 세 원 query 위치만 typed 소비하도록 별도 인수한다. V6 미인수를 실제 consumer 완료로 올리지 않는다. |

[실제 API·원형·검수 범위](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)를 따른다. 이전 source 동기화 기록의 pin·검사·품질 한계는 당시 이력으로 보존한다.


## Normal p_dot_pool 메인·R 소스 통합 — 2026-10-17

| 항목 | 인수된 소스와 통합 경계 |
|---|---|
| 이전 main | 7a49449ab994ce4d942a5aff31e26b4219017745. 새 실제 원격 ref 확인값을 expected_sha로 사용하며 force=false. |
| 인수 소스 | local 6b04ea32c8297b4f581f14b1152881c1146937f9 / remote WIP 6923d23d08123a42f4c75f765e628f621746959d, 동일 tree e1110087fa62cd070c87bf0bd1637457231bfaaf. 두 원 ref를 보존한다. |
| 정확 union | 인수 코드3/docs19 = 22개를 그대로 유지하고 이 문서와 FDG_PC_MAC_GIT_SYNC_20261016.md만 갱신한다. 총24개, 이전22 blob 재업로드0. 타인·보류·미인수 파일 추가0. |
| Formula | p_dot_pool()->Dictionary(0), 원식 1+(PASSIVES.pDot\|\|0)*.05. 기존 _container/_passive_or0_mul/own _ok/_fail 재사용. 원 Q/E·State/Providers body 변경0. |
| binding / Services | Formula.is_passives_reader_bound_to 및 Passives.is_current_passives_reader_bound_to는 기존 Callable metadata만 검사. Services.read_normal_enemy_dot_pool_multiplier가 실제 현재 Formula/Passives/current reader·Script/life/binding을 전후 대조하여 원 raw를 전달한다. |
| 값 / 상태 | 유효 PASSIVES Dict 안의 knownabsence/null/falsy/NaN은 원 truthiness로1.0. owner/context 유실을1/{}로 채우지 않는다. 기존 bound null SOURCE_THROW·status 손실, invalid String/Infinity non_finite를 보존한다. post loss는 topNR/read_result 원 raw·최상위 numeric value 없음. |
| 현재 / 다음 | map8/25·미17. 기존 V6의 p_dot_pool scalar 전체4곳(170/173/566/570)은 typed 미지원이며 직접 Dict 연결0. 첫 접점은170/173이다. V7 인수 전 실제 kernel 등록·full25/full hurtE 완료0. 전체 clock/실전/latest_full_game=false/content_parity=INCOMPLETE. |
| 첫 신규 검사 이력 | 행동76/76+setup37/37 PASS, exit0·양로그 오류/leak0 및 정적10/10. 실제 Formula/Passives/Affix/SOURCE_CURRENT bind+observer super 호출·정확 Services 추출/명시 holder/current-reader fixture 범위. 전체 State/Main configure/자연 수명·HP/clock·실전 아님. |
| 부분 도메인 | 실제 rawgrit/resource inner query 미측정·0 주장 없음. custom JS Object·전체 string grammar는 기존 부분 지원이며 reader Script 변경 case의 제거된 counter는 재독하지 않았다. 과거 AST 실패/helper 범위 위반과 다른 원 실패 기록은 원대로 보존한다. |
| 선행 보존 | I/R exact union48행96 WORK/HEAD slots: 실제 복사90/absent6. 각 source/destination ancestor nonlink/realparent·개별 copy UTC와 분리 INDEX/WORK를 저장한 manifest 이후에 변경한다. R은 FF 직전에 동일24경로 fresh WORK/HEAD/INDEX/WORK 보존을 별도 저장한다. |
| Git / 완료 증거 | 정상 fetch/새 branch/fast-forward와 현재 main expectedSHA lease를 사용한다. R의 기존 promisor 경고는 원 raw로 보존하고 config 정리0. 전송 bytes NOT_RECORDED. main/I/R HEAD/tree/upstream·실제 union 파일·원 ref는 새 통합 경계 static1회/finalreceipt로 확정한다. |
| 실행판 한계 | R disk 동기화는 열린 창/process/Web package 교체 증명이 아니다. GUI input/reload/restart·server/GET/save·asset/import/export/PC 실기동0. 실제 사용 host/URL 질문은 아직 미응답이며 재질문하지 않는다. 시각 기존 RETOUCH 유지, 새 VISUAL PASS 주장0. |

[실제 API·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)를 따른다. 이전 인수 pin과 source 동기화 결과를 최신 실행판으로 승격하지 않는다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 LEQ 인수본 main·I·R 디스크 소스 정렬

| 항목 | 이번 통합 계약 |
|---|---|
| 인수 원본 | remotee1564e9355c10a6501cf735ea609fed6ee1c0a73 / local1c45217cd43ed05cc88902a79bf07e286080da50, 같은tree9b8eb2ebc75db166af659bda2d6c4f1f3437bfdd·부모SHA 다름. 원52/f83/1c/e156 ref 보존. |
| 경계 | 인수33(code5/docs28)+통합docs2 중 본 문서1개 중복=union34(code5/docs29). 코드 수식/수명/기존9 callback 본문 변경0, 통합 새blob2만. |
| 현행/검증 | callback9/25·미16; 신규행동 최초41/41·새map static9/9(runtime0) 인수. 원parse실패와selector초과이력 유지·first_whole_clean=false. 이번 통합에서 기존 성공 검수 재실행0. |
| 소스 적용 | 원main71a246b8dfa3ebee21e1aedd6154442d20088d19를 새로1회 확인하고 정상 expectedSHA/forcefalse로 갱신한다. actual 최종HEAD/tree·I/R branch/upstream·union SHA/OID·각fresh PRE시각은 외부 final-sync-receipt.json이 기록한다. |
| 구별 | 디스크 소스 정렬은 사용자 열린 창/process/export/PC/최신 전체 게임 완료 증거가 아니다. GUI/입력/새로고침/재시작/server/GET/assets/save/import/export는 실행하지 않는다. |
| 백업/경고 | per-copy exactfile/realparent/ancestor nonlink·WORKHEAD·분리INDEXWORK·시각을 fresh manifest에 남긴다. 초기 absence4 가정 실패는 제품쓰기 전에 보존, fresh v2의136slot/130copy/6absence만 쓰기 권위로 사용. 기존promisor/config 경고 정리0, 미측정전송량 NOT_RECORDED. |

자세한 인수·한계·최종 증거 경로: [LEQ Main 소스 통합](FDG_NATIVE_NORMAL_ENEMY_LEQ_MAIN_SYNC_20261017.md).


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


## 2026-10-17 typed rand owner+등록10 main·Mac 디스크 소스 통합

| 항목 | 현재 소스 통합 계약 |
|---|---|
| 원본 | remote89992841a14bc87ec2e82410263eb970b9dff1f2 / localc2fb8960e5258e23fdeb3cb4e0f5277a6aa9b614, 같은tree383085826f4cf11be2534a756c91a2fa39a600cd·부모4ba/bf는다름. 원899/4ba/c2/bf/3ccb refs보존. |
| 범위 | 인수33(code3/docs30)+통합docs2중본PC문서중복1=union34(code3/docs31). 새구현0/새blob2만·old33재업로드0. 32개원OID/size는최종그대로, PC문서는원전체bytes保append·새통합문서1추가. |
| actual callback | 현재인수소스10/25·미15, rand sameServices0arg Dictionary reader. legacydeclared0와single sharedoperation은기인수상태그대로다. |
| 이전 기록 | 앞선WIP9·미등록·당시main/R미반영/FAIL/API팩은그당시이력으로보존한다. 이번disk소스체크포인트의actualHEAD/tree/branch/upstream·freshPRE/각쓰기/FF·unionSHA는외부final-sync-receipt.json이정한다. |
| 검사 | owner9/30·등록7은기인수·재연0. 이번단위는새통합경계static1회만수행, 실제구현/primitive/QAparse/자연runtime/PC/fullgame추가검증0. |
| 한계 | source정렬은열린창/process/export/PC완료아님. GUI/input/reload/restart/GET/server/save/assets/import/export·V9scalarDict직결·Worldhook·15dummy우회0. 경고보존·미측정전송량NOT_RECORDED. |

상세 checkpoint와증거경로: [rand Main 소스 통합](FDG_NATIVE_NORMAL_ENEMY_RAND_MAIN_SYNC_20261017.md).


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |



## 2026-10-17 el_mul 등록 11개 main 소스 통합

| 항목 | 계약과 범위 |
|---|---|
| 승인 commit/tree | d38d4e68ad14682dd2d82c50a041b4716875bc3b / 61ccd7de9df30eec6b6195a78b72f62ccdc1d597 |
| main 사전 조건 | c91e41749d698b2b0d40c4acd4b1898dd0a0c2af, expected_sha 일치, force=false 정상 FF |
| 등록 | 기존 10개 순서 후 el_mul, 실제 11개 / 미등록 14개 |
| 소유 계약 | Main mutable EL Dictionary 1개 + 현재 Script WeakRef 1개; typed el_mul(a,d) arity 2 |
| 승인 입력 | code 3 / docs 37, 총 40 paths |
| 이번 작성 | 통합 문서 신규 1개 + 본 문서 전체 원문 바이트 보존 append, 신규 blob 2개 |
| 최종 합집합 | code 3 / docs 38, 총 41 paths. 기존 39개 불변 + 본 문서 전체 prefix 보존 + 신규 문서 1개 |
| I 브랜치 | codex/mac-native-el-mul-main-20261017, origin/main 추적 |
| R 브랜치 | codex/mac-live-el-mul-main-20261017, origin/main 추적 |
| 통합 보존 브랜치 | codex/el-mul-main-source-integration-local-20261017 |
| 검증 | 새 소스 동기화 경계 static 1회 / runtime 0. 이전 검사 재실행 0 |
| 미인수 | typed consumer V11, World hook, 실행 게임·빌드·PC 배포·최신 화면 |

기존 검증은 분리된 이력이다. 최초 static 14/14; 최초 owner 23 case / 46 check 중 45 true / 1 false, whole=false 유지; 별도 숫자 진단 8 records / Variant 8 / typed 7; 승인 입력 보정 후 최초 미실행 경계 25 case / 74 true + setup 4 true; 등록 static 12/12. 이번 소스 통합에서 최초 실패를 전체 통과로 바꾸지 않는다.

I/R 첫 WORK·HEAD 백업과 PRE는 fetch 및 작성 전에 저장한다. R 실제 fetch/FF 직전 추가 WORK·HEAD 백업과 PRE를 저장한다. I 기존 60710e16fc8af90dcb4601ace9c67cad6fc6baf3 / 138c64305efac08d1d220c56a2abb43f69369311, remote D38/3357, main c91, R 기존 브랜치, W a3를 보존한다. 강제 갱신·reset·clean·일괄 stage를 사용하지 않는다.

이 절은 소스 통합 계약이다. 실제 게시·정렬 결과는 NORMAL-HURTE-EL-MUL-MAIN-SOURCE-SYNC-20261017의 final-graph.json, physical-match.json, static-check.json, receipt.json에 기록한다. 소스 일치는 실행 파일이나 인게임 화면의 최신 버전 확인을 뜻하지 않는다. 브라우저·게임 입력·서버·세이브·에셋·import/export 작업은 0이다.

사용량 시작 실제 누적 62%를 재사용하고 종료 실제 조회는 1회다. 공유 계정이며 일간 소비는 미상이다. 새 일일 20%를 배정하거나 작업 단독 소비로 해석하지 않는다.

## 2026-10-17 play_time typed owner — 검증 WIP 소스 경계

| id / 항목 | 코드와 동일한 현행 계약 |
|---|---|
| 공개 API | Services `read_normal_enemy_play_time() -> Dictionary`, arity 0. callback 등록: 실제 12/25, 미13. el_mul 바로 다음 play_time=Callable(self, read_normal_enemy_play_time), 동일 Services self·arity0 |
| Main 검사 | `is_native_source_play_time_context_current(services, state, raw_g=null, require_g_identity=false)`: 총 4인자, 필수 2 / 메타데이터 선택 2 |
| State 검사 | `is_native_play_time_owner_current(main, expected_player, expected_world, expected_resources, raw_g=null, require_g_identity=false)`: 총 6인자, 필수 4 / 선택 2 |
| State 관측 | `read_native_normal_enemy_play_time(main, services) -> Dictionary`, arity 2 |
| Script 증명 메타데이터 | Main `_native_source_play_time_owner_script: WeakRef = weakref(get_script())` 필드 1개, 생성 시 1회. Script 객체 identity 확인용이며 clock 값·counter·writer·setter·epoch는 추가하지 않음 |
| 범위 | 동일 Services self와 weak Main/State → Main의 현재 `source_initialization_services/source_state/player/world/source_resources` → 기존 State `_g`의 literal `playTime`. 새 native source-context mapping이며 원JS G identity/초기화/자연수명/clock 증가 동등성 증거는 아님 |
| 직접 소유 검사 | 실제 Main Script weak witness / Services·State 실제 Script 객체 / 현재 역할 ref / live 같은 Tree와 parent / State strict bool `_initialized` / actor `INITIALIZED_META` strict bool true / `CLAIM_META` live WeakRef(self). Script path 문자열을 실제 Script-token 대신 사용하지 않음 |
| 제외된 검사 | 기존 일반 getter·legacy guard·Provider/Formula를 호출하거나 수정하지 않음. HP/state/facing/resource parameters/regen/clock domain query 없음. 미검증 `world.player`·resource-ready·legacy 전체 권위가 통과했다고 주장하지 않음. pre-Tree는 지원하지 않음 |
| 실제 값 조회 | precheck 실패는 scalar query 0. `_g` ref 확보 후 literal key presence 1회, present일 때 값 lookup 정확히 1회. post는 같은 G ref/역할/Script/Tree/claim만 검사하며 scalar 재조회·같은 값 불변 검사 없음 |
| READY 부분지원 | present finite native int/float. raw type/value 및 int0/float+0/raw-0 보존. int 범위 [-9007199254740991,9007199254740991]는 local 정확표현 지원 부분집합이며 게임 cap·전역 finite 정책이 아님 |
| raw NOT_READY | copied key 미확정/부재, bool/String/StringName/null/NaN/Infinity/reference, int 지원범위 밖, owner pre/postloss. top `value` 없음. 결손을 JS undefined/known absence로 인증하거나 0으로 채우지 않음 |
| 원 ref / prefix | 관측 Dict의 `raw_g/raw_value/raw_owner/raw_main/raw_services/query_prefix`는 원 ref/type/value를 보존. presence prefix 뒤 present면 value prefix만 추가. clone/snapshot/cache strip/JSON 대체/retry/refund/rollback 없음 |
| postloss | State 새 NR envelope의 `read_result`는 원 관측 Dict, Services 새 NR의 `read_result`는 State 원 반환 Dict를 그대로 가리킴. `query_prefix`와 사용 가능한 raw alias도 같은 ref. 기존 Dict의 READY value를 삭제하거나 변형하지 않음 |
| schema | 정상 상태 `READY` 또는 `NOT_READY`; `source/reason` 필수. READY만 `value` 존재. State source `native.State._g.playTime`, Services source `native.Services.play_time`. 원시 값이 관측되지 않은 필드는 임의 null/0 대신 부재로 남김 |
| State reason | `native_play_time_owner_not_current`, `native_play_time_observation_pending_validation`(postloss 안쪽 원기록), `native_play_time_owner_changed_after_observation`, `native_play_time_field_unresolved`, `unsupported_native_play_time_integer`, `unsupported_native_play_time_non_finite`, `unsupported_native_play_time_type` |
| Services reason | `native_play_time_services_owner_not_current`, `native_play_time_services_context_not_current`, `native_play_time_services_owner_changed_after_observation`, `native_play_time_owner_result_malformed` |
| 미래 consumer | 원42328/42329의 서로 다른 lazy 0/1/2 query와 두 번째 write=두 번째 query값을 유지해야 함. owner raw-0와 미래 consumer의 supported numeric0→literal+0 `||0` 투영은 별개. 이번 단위는 callback 등록12만 반영하며 consumer 투영/V11/V12 제품 copy/World hook/13 dummy·25 gate 우회는 구현하지 않음 |
| 검수 현행 | 첫 소스 정적 17개 중15통과2실패(원 wholefalse 보존), 후속 문서·경로 독립2확인 true, 첫 공개 API 격리34case·477확인(설정163·행동314) ROOT 인수. 각 실행은 별개이며 원17 전체 PASS로 합산하지 않음. 실제 게임·자연 clock·원JS identity는 미인수 |
| 현재 한계 | 실제 Main/State clock 필드 presence·진행·게임 실행·PC 배포·전체 hurtE·전체 게임 완료율은 미확인. 이번 보존·등록 단위에서는 새 격리 fixture를 만들거나 재실행하지 않음. 이미 인수한 owner 첫 격리34case477확인은 유지 |

현재 원시 Dictionary는 JSON wire 형식으로 변환하지 않는다. 강한 참조를 포함한 결과의 동기 관측 범위와 실제 게임의 자연수명 증거는 구분한다. 새 경계는 소유 메타데이터를 관측하는 직접 검사이며 기존 모든 getter나 실행 중 엔진 전체의 순수성을 인증하지 않는다.

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | D9는 직전 공통 소스 인수이고 owner 브랜치 codex/native-play-time-owner-20261017의 이력은 보존한다. 이번 main/I/R 현재 소스 정렬은 통합 정본·receipt의 실제 HEAD·tree를 따른다. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |


## 2026-10-17 play_time main/I/R 소스 통합 체크포인트 — 현행

| 항목 | 현재 범위와 인수 한계 |
|---|---|
| 직전 인수 / 이번 소스 | 직전 공통 인수 D9(d9b886c). owner 실제 NUL diff42(code3/docs39)에 통합 정본1을 추가한 최종 범위는 실제 union NUL·tree 목록과 아래 receipt를 기준으로 확인. main/I/R의 실제 현재 HEAD·tree·branch·upstream 및 정렬 결과도 receipt 기준 |
| 코드·provider | 인수된 Main/Services/State 코드3 그대로, callback 12/25·미13. play_time은 el_mul 직후 동일 Services self·arity0, 새entry 생성의 값 query0만 확인. 기존 getter/준비 guard 전체 순수성은 인증하지 않음 |
| 값·실패·참조 | finite native int/float 부분지원·safe int ±9007199254740991·raw-0·원 type/ref/prefix·postloss read_result·NOT_READY 계약 그대로. dummy13/25 gate 우회·clock writer/default0 추가 없음 |
| 검수 분리 | 기존 owner34case477(설정163·행동314) 인수, 원17 중15통과2실패와 별도2true는 보존. V12 후보 원11case43행동true/setup signedzero1false·exit1 전체FAIL과 별도4case19행동+setup4 true의 한정 보완은 각각 유지. 원성공 검수·parse 재실행 없음 |
| 실제 실행·보류 | 이번은 소스 정렬이다. 사용자 열린 앱·compiled export·PC 실행·실제 Main/State clock·자연 전투·JS·최신 게임 인수는 미확인. V12 제품 copy·World hook·build/reload/import/PC 전달 없음 |
| 정본 / 증거 | [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) · [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
