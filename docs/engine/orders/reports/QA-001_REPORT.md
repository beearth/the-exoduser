# QA-001 PC — 기존 실패 테스트 7종 진단·정정 보고

## ① 기준·원본 근거

| 항목 | 확인값 |
|---|---|
| 담당 / 작업 경로 | PC Codex / G:/exoduser-wt/codex-qa-001 |
| 작업 브랜치 | codex/qa-001-pc-20261020 |
| 기준 HEAD | f1df29a86dc3966bab87a7f4910ae6819e167294 |
| 시작 fetch의 origin/main | efdbf76b34dec0e75a8d9256717921ea6e270174 |
| INDEX / tracked WORK | 시작 시 각각 clean. 자기 테스트·관련 docs만 변경 |
| 실제 검사 엔진 | G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe |
| 실제 version 응답 | 4.7.2.stable.official.ed1daf0bf |
| game.html SHA-256 | 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| encounters.json SHA-256 | 91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa |
| 원로그 루트 | G:/exoduser-wt/_out/QA-001-pc/ |

최신 사용자 PC 재배정을 적용했다. 이 작업은 위 기준 HEAD에서 수행했으며 origin/main을 병합하거나 main에 push하지 않는다. Mac 실행·PC/Mac 전체 동기화 완료 증거가 아니다.

아래 행 번호는 이 worktree의 현재 game.html을 직접 대조한 값이다. 기존 추출 패킷·문서의 game.html:285xx/286xx/29655/33359 등 문자열은 이전 추출 당시의 source anchor이며 현재 행 번호와 구분한다. 원본 코드·공식·수치는 변경하지 않았다.

| 원본 위치 | 현재 원본 계약 / 테스트와 관계 |
|---|---|
| game.html:13215, 13330, 14288–14290, 33003–33027 | keydown/keyup → 액션 상태 → 정규화 방향 → speed×sp → 실제 이동. 현재 native 입력 owner에 InputEventAction을 보내야 한다 |
| game.html:16425–16431 | recalcSt 원본 MST/ST 쓰기 |
| game.html:27902–27947 | applyStats: speed 27927/27943, hpR 27930/27944, ST/MP/rates 27929–27947 |
| game.html:31567, 64019, 64025 | 새 게임 applyStats 후 initStage. stage-entry에서 HP/ST/MP/shield를 각 cap으로 충전 |
| game.html:31120–31162, 31517–31530, 31608–31648 | mkEn 수치·타이머, medium 2개 및 초기 생성 순서. 고정 추출 영수증 16개와 현재 전용 consumer 지원 여부를 분리 |
| game.html:35091 | redBean && !_druidPoison이면 일반 피해 이후 화상 요청 _pjD×2. fixture의 피해 24 → 화상 48 |
| game.html:24026, 8926, 18812, 54261–54262 | 물탄 flight 이미지·impact 효과·전용 렌더. native는 원본 PNG의 내부 Resource 복사본을 사용 |

현행 native 근거: player.gd의 handle_native_input_event 및 _native_input_held 소비 경로, native_source_player_initialization.gd의 실제 resource sink 설치, enemy_factory.gd의 정확한 consumer 순서 [0,1,8,13,14,15], enemy_projectile_physical.gd:96–99, enemy_projectile_ice.gd의 ResourceLoader 경로를 대조했다. 독립 읽기 전용 진단 및 diff 검토에서도 제품 코드 수정 필요 근거는 발견하지 못했다.

## 실패별 판정

수정 전 지정 7종에서 단정 실패 18건을 재현했다. 이 외 crawler의 PASS 표시 그룹 안에서 SCRIPT ERROR 1건을 추가로 발견했다.

| 번호 | 테스트 / 실패명 | 판정 | 원인·정정 / 보존한 검사 |
|---|---|---|---|
| 1 | initialization / public movement input moves actual actor | 하니스 | Input.action_press는 현재 이벤트 owner를 거치지 않음. Input.parse_input_event의 pressed/released 이벤트로 교체; 변위 >0.1 유지 |
| 2 | initialization / actual idle movement consumes preserved source speed | 하니스 | 같은 입력 누락. 실제 velocity = source_speed×60 단정 유지 |
| 3 | starter / unpublished stage zone/HP derived field is not manufactured | 낡은 기대값 | constructor packet의 hpR 부재와 post-applyStats current P를 혼동. boot hpR 부재·G._fireZones 부재 유지, current hpR = 최종 원본 쓰기 추가 |
| 4 | starter / parameter binding does not invent a derived command sink | 낡은 기대값 | 최초 provider 영수증과 이후 dispatcher의 같은 helper 재바인딩을 혼동. 최초 missing resource_sink 유지, 현재 ready·dispatcher 완료·쓰기 창 닫힘 추가 |
| 5 | factory / source count and actual admitted actor count stay separate | 낡은 기대값 | 2/14 기대 → 현재 6지원/10미지원 정확 검사 |
| 6 | factory / all source records reported; only two real actors | 낡은 기대값 | 16개 영수증과 6개 실제 actor 구분. 원본 전필드·SHA·타이머 검사 유지 |
| 7 | factory / actual world_ready and enemy registry contain only admitted actors | 낡은 기대값 | registry 6, spawn 6+install 1+ready 1. 전용 class/profile·순서·소유·시간 0 검사 추가 |
| 8 | crawler / actual world startup admits new one, preserves source16 and unsupported13 | 낡은 기대값 | 3/13 → 6/10. crawler order14/index4, hive 지원·guardian 미지원 검증 |
| 9 | spine / source16 into four exact actors and twelve explicit unsupported | 낡은 기대값 | 4/12 → 6/10. spine order13/index3, crawler index4, ice/hive 전용 consumer 검증 |
| 10 | ice / five exact profiles and eleven explicit unsupported | 낡은 기대값 | 5/11 → 6/10 |
| 11 | ice / registry preserves source order and dedicated ice class | 낡은 기대값 | 순서 [0,1,8,13,14,15]와 ice/hive 정확한 class·profile 검사 |
| 12 | ice / external original texture loads, alpha1 and export limit explicit | 낡은 기대값 | 현재 packaged=true. flight/impact 실제 Resource 경로·원본 복사 metadata·alpha1·다른 전용 shader/재질 검사 보존 |
| 13 | authority / current six numeric leaves equal consumed boot | 낡은 기대값 | boot 이력과 초기화 후 current 혼동. 실제 원본 쓰기 ledger + stage refill을 여섯 leaf와 정확 비교 |
| 14 | authority / real holder MP160/MMP160/base .28/0 | 낡은 기대값 | 고정 boot 대신 current P·원본 쓰기의 MP/MMP/stR/mpR와 정확 비교 |
| 15 | authority / constructor current is not derived or full Main authority | 낡은 기대값 | phase source_initialization_partial. derived_ready=false/main_full_ready=false 보존 |
| 16 | authority / public deep copies cannot overwrite actual current or source input | 낡은 기대값 | 원 MP160 대신 복사 전 실제 current MP와 비교. boot 원본 불변·deep-copy 변조 방지 유지 |
| 17 | authority / same actual attacked actor fields | 낡은 기대값 | ST<200 대신 공격 직전 실제 ST보다 감소 검사. 동일 Player ST/state readthrough 유지 |
| 18 | authority / physical attack does not invent MP cost | 낡은 기대값 | MP160 대신 공격 전후 실제 MP 동일 검사 |
| 추가 | crawler native_clock / RecordingTarget.apply_native_burn 누락 SCRIPT ERROR | 하니스 | 기록용 sink의 공개 화상 계약 누락. burn_requests 및 apply_native_burn 추가, 피해24→화상48·투사체 종료 검사 추가 |

제품 결함으로 확정한 항목은 0건이다. 제품 코드를 고쳐 PASS로 만들지 않았다. 전체 게임에 제품 결함이 없다는 뜻은 아니다.

확장된 factory world_registration 검사에서는 새 소수 좌표 4개를 웹 JSON double 배열과 직접 비교하여 추가 단정 실패 4건이 발생했다. 이 중간 원로그도 targeted/에 보존했다. native actor·telemetry가 쓰는 Vector2 float32 표현으로 원본을 동일 변환한 뒤 정확 비교하도록 정정했고, epsilon을 늘리지 않았다. factory-position-recheck/에서 이 그룹만 1/0으로 재확인했다.

## ② 변경 파일·소유권

| 범위 | 변경 |
|---|---|
| godot/tests/test_native_main_source_player_initialization.gd | 입력 이벤트 하니스 |
| godot/tests/test_native_main_source_starter_state.gd | boot/current·sink 단계 분리, 단정 3개 추가 |
| godot/tests/test_native_main_source_authority.gd | 원본 쓰기·충전 후 실제 자원 기대값 |
| godot/tests/test_encounter_factory.gd | 6/10·전용 class/profile·telemetry·정확 좌표 표현 |
| godot/tests/test_etype0_physical_flesh_crawler.gd | 최신 admission 및 누락된 burn 기록 sink |
| godot/tests/test_etype4_physical_spine_beast.gd | 최신 admission·정확한 전용 consumer |
| godot/tests/test_etype4_ice_soul_flame.gd | 최신 admission 및 내부 원본 Resource 포장 검사 |
| 관련 시스템 SSOT 8개 | 이 보고서로 현재 QA 정정 안내, 과거 FIRST/배송 수치 이력 보존 |
| docs/engine/orders/WORK_BOARD.md | QA-001 행만 PC 재배정·검수 대기로 갱신 |
| docs/engine/orders/reports/QA-001_REPORT.md | 이 보고서 |

공용 제품 파일 변경 줄 수: main.gd 0 / hud.gd 0 / world.gd 0 / player.gd 0 / native_normal_enemy_hurte.gd 0 / native_source_new_run_state.gd 0. 레슨 파일·Q/E 판정·세이브 형식·game.html·원본 에셋 변경 0, 신규 에셋·import 0. 본 폴더 G:/exoduser 수정 0, 웹 서버 조작 0.

starter 최종 결과의 과거 고정 진단 키 derived_parameters_applied / automatic_source_phase_activated를 full_derived_parameters_proven / full_automatic_source_pipeline_proven으로 바꿨다(false 유지). 이는 partial 초기화·현재 리젠 배선을 부정하지 않도록 범위를 명확히 한 기록 메타 변경이다. 해당 이름 정정은 targeted 실행 후이며, 실행 로그에는 이전 키가 남는다. 단정·실행 경로는 그 후 변경하지 않았다.

## ③ 테스트 명령·수치·로그

### 격리·실행

모든 9종을 먼저 한 번씩 순차 실행했다. Main을 생성하는 테스트는 각 USERDIR/ISOLATED_DIRECTORY를 사용했다. 나머지 fixture에도 EXODUSER-QA001-Isolated-20261020을 지정했다. 실제 저장 폴더 EXODUSER-Godot-Native-First 접근·사용 0. 실행 후 override.cfg는 0 byte이며 stage/commit하지 않는다.

기준선 명령은 아래 형태이고, 실제 전체 인수는 baseline/command.json에 보존했다. run_godot_tests_pc.sh는 사용자가 지정한 C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh와 byte 동일한 G 드라이브 사본이다.

~~~~text
"C:/Program Files/Git/bin/bash.exe" G:/exoduser-wt/_out/QA-001-pc/run_godot_tests_pc.sh G:/exoduser-wt/codex-qa-001/godot G:/exoduser-wt/_out/QA-001-pc/baseline <test_name>:<isolation> ...
~~~~

통과 검사 반복 금지를 지키기 위해 로컬 헬퍼 사본에 세 번째 필드 그룹 선택만 추가했다. 실제 Godot 호출은 다음과 같다. 원본 헬퍼와 시스템 설정은 수정하지 않았다.

~~~~text
G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe --headless --path . --script res://tests/<test>.gd -- --only=<groups>
"C:/Program Files/Git/bin/bash.exe" G:/exoduser-wt/_out/QA-001-pc/run_godot_targeted_pc.sh G:/exoduser-wt/codex-qa-001/godot <log_dir> <test>:<isolation>:<groups>
~~~~

| 테스트 (test_ 접두어 유지) | 지정 격리 이름 | PC 기준선 | 수정 후 실행한 그룹 / 결과 | 기준선 PASS 보존 + 변경 그룹 대체 집계 |
|---|---|---|---|---|
| test_native_main_source_player_initialization | EXODUSER-MainSourceInitialization-Isolated-20261014 | 117검사/2실패 | movement_damage_preserves_source_speed: 10/0 | 117/0 |
| test_native_main_source_starter_state | EXODUSER-MainSourceStarter-Isolated-20261014 | 145/2 | startup_state_and_items, original_provider_consumers: 110/0 | 148/0 (단정 +3) |
| test_encounter_factory | EXODUSER-QA001-Isolated-20261020 | 3단정 실패 | source_factory: 1케이스/0; world_registration: 최종 1/0 | 3케이스/0 |
| test_etype0_physical_flesh_crawler | EXODUSER-QA001-Isolated-20261020 | 1단정 실패 + SCRIPT ERROR1 | admission,native_clock: 2케이스/0, SCRIPT ERROR0 | 3케이스/0 |
| test_etype4_physical_spine_beast | EXODUSER-QA001-Isolated-20261020 | 1단정 실패 | exact_admission: 1케이스/0 | 4케이스/0 |
| test_etype4_ice_soul_flame | EXODUSER-QA001-Isolated-20261020 | 3단정 실패 | exact_ice_admission,ice_projectile_hit_order: 2케이스/0 | 4케이스/0 |
| test_native_main_source_authority | EXODUSER-MainSourceAuthority-Isolated-20261014 | 71/6 | startup_lineage,public_attack_atomic: 29/0 | 71/0 |
| test_contracts | EXODUSER-QA001-Isolated-20261020 | 5케이스/0 | 변경 없음, 반복 실행 안 함 | 5케이스/0 |
| test_p1002e_melee_hurte | EXODUSER-P1002E-Isolated-20261019 | 83검사/0, skipped=[] | 변경 없음, 반복 실행 안 함 | 83/0 |

마지막 열은 한 번의 최종 full-suite 재실행 수치가 아니다. 초기 PASS 그룹의 원로그와 수정 영향 그룹 재검을 결합한 ledger다. 명시 check 카운터가 있는 네 테스트 합계 419검사, 나머지 다섯 테스트 합계 19케이스이며, 전체 37그룹/케이스의 최종 근거에 단정 실패·SCRIPT ERROR가 없다. 수정 후 12개 영향 그룹을 검사했고, 새 좌표 하니스 수정에 영향받은 world_registration 1개만 추가 재검했다.

모든 최종 영향 그룹의 실제 test exit=0, ERROR·SCRIPT ERROR·Parse Error=0. 기존 Camera2D physics interpolation WARNING은 Main/ice fixture에서 보존했다. 헬퍼 자체 exit만으로 PASS를 판정하지 않고 각 테스트의 exit·실패 카운터·stderr·선택 그룹·skip 여부를 함께 확인했다.

이동 실측 예: 자연 World frame 차이 10, 변위 (27.53906,0), source_speed 2.75392/tick, 실제 velocity (165.2352,0) = source_speed×60. 이는 헤드리스 하니스의 실제 입력·이동 증거이며 화면 체감·성능 FPS 측정이 아니다.

| 로그 / 산출물 | 내용 |
|---|---|
| baseline/<test>.out.log 및 .err.log | 수정 전 9종 원로그, 최초 실패·숨은 script error 보존 |
| baseline/helper.log, baseline/summary.json | 9종 실제 exit·요약 수치 |
| targeted/<test>.out.log 및 .err.log | 수정 그룹 원로그. factory 중간 좌표 4실패도 보존 |
| targeted/root-command.json, enemy-command.json | 그룹·격리를 포함한 실제 실행 전체 인수 |
| targeted/root-helper.log, enemy-helper.log | 그룹 재검 exit·카운터 |
| factory-position-recheck/ | 마지막 world_registration 단독 1/0·명령·stderr |
| pre-edit-tests/ | 편집 전 7개 테스트 원본 사본 |
| isolated-userdirs/, isolated-directories.json | 이번 실행에서 새로 생긴 격리 런타임 로그만 경로·생성시각 확인 후 G 출력 폴더로 이동 |
| docs-keyword-search.log | 코드 변경 후 관련 테스트명·변수로 docs/ 전체 검색한 결과 |
| start-state.json | 기준 HEAD·원격 main·엔진·실제 source 경로 |

PowerShell은 명령 실행 전 WindowsApps pwsh 시작 실패가 났다. 해당 실행을 성공으로 계산하지 않았다. 독립 Node 도구에서 fs 및 child_process.execFile(windowsHide:true)로 Git·Git Bash·Godot를 실행했다. 콘솔을 새로 띄우거나 사용자 서버를 조작하지 않았다.

### 문서·diff 검증

docs/ 전체를 관련 테스트명·movement_damage_preserves_source_speed·apply_native_burn으로 검색하여 27개 매치를 대조했다. 기존 FIRST/배송/PC 기준선 수치는 역사적 실행 결과이므로 덮어쓰지 않고, 현재 QA 정정은 이 보고서 및 관련 SSOT의 안내로 구분한다. 게임 수치·공식·현재 API 변경은 없다. git diff --check 통과.

## ④ 커밋·원격 반영

- 코드·검증·관련 docs 커밋: e9f7d7da43378d91d60ab019f08f2f62aea21eff
- 브랜치: codex/qa-001-pc-20261020
- 최초 push 전 원격 동일 브랜치: 없음(ls-remote 확인).
- 후속 문서 커밋은 위 패치 SHA 및 작업판 검수 대기 상태를 기록한다. 최종 HEAD·원격 readback은 작업 종료 메시지와 G 출력 폴더의 delivery.json에 기록한다.
- staging은 명시 경로만 사용하고 테스트는 git add -f -- <경로>. main push·병합·강제 push 없음.

## ⑤ 남은 것·검수 경계

- 지정된 기존 실패의 하니스/낡은 기대값 정정과 회귀 근거 확보 완료, Claude 총괄 독립 검수·main 병합 대기.
- Mac 테스트·실창 플레이·화면 녹화·공개 빌드·성능·전체 Godot 이식 완료는 이번 작업에서 검증하지 않았다.
- encounter의 미지원 10개는 그대로 정직 정지 상태다. 레슨·지역·소환굴·드랍 등 타 담당 작업을 가져오거나 구현하지 않았다.
- 제품 결함 수정안은 필요 없음(이번 재현 실패에서는 제품 결함 확인 0). 후속 재현에서 제품 결함이 발견되면 하니스 변경과 분리하여 총괄에 전달해야 한다.
