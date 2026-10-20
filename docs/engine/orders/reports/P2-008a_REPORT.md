# P2-008a PC — 1-1 미지원 적 부분 이식 보고

## 판정

**etype20 한 종류의 exact 세 프로필(order4/10/12) 등록. 이 worktree의 source16은 지원9/미지원7. 나머지7개체와 실제 화면/정상 입력 플레이는 미완료.** main/Mac/배포 동기화 완료가 아니다.

## ① 원본 근거

정본 [FDG_P2_008A_CH1_ENEMIES_20261020.md](../../FDG_P2_008A_CH1_ENEMIES_20261020.md)에 초기 미지원10 전원의 원본 etype·코드 이름·HP/쉴드/포이즈·ATK·radius·speed·좌표·스킨 셀/높이와 타입별 AI/투사체 근거를 표로 기록했다. 기존 source records의 `name='native etype N'`은 개명하지 않았다.

| 항목 | 근거 |
|---|---|
| 시작 기준 | branch codex/p2-008a-ch1-enemies-pc-20261020, HEAD c7c910fd04559a78be0e64295a97390d01fd2d09, tracked INDEX/WORK clean |
| source game.html | 65,693줄 / SHA-256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| encounters.json | SHA-256 91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa, 원16개 전체 bytes 불변 |
| 우선순위 | 시작점(4020,7420)에서 직선거리 기준 최초 미지원 order10 etype20. 동일 원분기의 order4/12도 exact 등록. 실제 경로/조우 시간 실측은 아님 |
| 공통 이동 | game.html:38681–38705 LOS800/d>30 flow1배 → 40483 idle1.6배 → 40485–40497 분리, 원순서 유지 |
| 원본 무공격 경계 | game.html:39057–39060의20 전용 분기 빈 본문. 40499 _meleeET에20 없음, 31154 _noProjEtypes[20]=1/9999. 자연 접촉 피해·탄막·빙결을 임의 추가하지 않음 |
| 피격 owner | native_dedicated_enemy_hurte_owner.gd 재사용. Main 실제 hurtE.execute로 세 actor의 원본 쉴드 흡수 확인. 원본 Q/E·레슨·세이브 형식 변경0 |

1차 레퍼런스 docs/8.0몬스터디자인/ 및 docs/9적ai패턴디자인/ 관련 문서를 대조했다. 이름상 얼음/빙결과 source el·스킨·실제 공격 분기를 구분한다. 인수한 MAC_ORDERS 문서에는 P2-008a 별도 절이 없어 사용자 최신 PC 배정을 작업 정의로 적용했다.

## ② 변경 파일·소유권

| 파일 | 변경 |
|---|---|
| godot/scripts/enemy_melee_ch1_ice_warrior.gd | 전용 AI 추가. 기존 body/쉴드/poise/hurtE owner만 상속, super AI 호출0. 원본 생략 공격 생성0 |
| godot/data/etype20_ch1_ice_warrior.json | source SHA·허용 order[4,10,12]·원본 행·지원 경계 |
| godot/scripts/enemy_factory.gd | +33/−4줄. exact source 검증·새 전용 script 등록·생성 및 report. 임의 다른20으로 일반화하지 않음 |
| godot/tests/test_etype20_ch1_ice_warrior.gd | factory·원값·스킨·AI 이동/시계·공격 미생성·owner HP/death/poise 계약 |
| godot/tests/test_etype20_ch1_hurte_bridge.gd | 실제 Main/providers→hurtE→새 세 actor의 쉴드 흡수. base100은 명시 fixture 입력, 플레이어 입력 전투 아님 |
| godot/tests/test_etype20_ch1_admission_boundaries.gd | 변경된 el/HP/좌표9개 거부, 미지원7개 alias 금지 |
| godot/tests/test_encounter_factory.gd | 기존 원본 SHA/전필드/원순서/원자거부 검사 유지, 9/7·새 전용 class와 생성 순서 검사 추가 |
| 기존 etype0/4 physical/4 ice/1 lightning 테스트 | factory 수·배열 위치 기대값만 신규9/7 순서에 정정. 나머지 수치/AI 검사 약화0 |
| 몬스터/AI SSOT·정본·WORK_BOARD·CHANGELOG_SYNC | 후보의9/7과 main/옛6/10 이력·남은 목록을 구분 |
| P2-008a_ASSETS.json | 기존 원본 atlas16개의 SHA-256/bytes/원경로·resource 경로 |

공용 파일 변경 줄 수: main.gd **0**, hud.gd **0**, world.gd **0**, player.gd **0**, native_normal_enemy_hurte.gd **0**, native_source_new_run_state.gd **0**. 레슨·Q/E·보호 docs2_3·game.html·map.json·encounters.json·저장 형식·서버3333 수정0. 본 폴더 G:/exoduser 수정0. 타 팀 staged/untracked를 포함하지 않는다.

아트: base8+walk8 **16개/22,734,844 bytes**가 원 `img/`와 SHA-256 동일한 기존 패키지 복사본임을 확인해 그대로 재사용했다. 신규 이미지/AI 생성/원본 가공/새 에셋0이므로 import 재실행0. 캐시/override.cfg는 커밋하지 않는다.

## ③ 테스트 명령·수치·로그

엔진 `G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe`, 실제 Godot 4.7.2. 모든 로그 루트 `G:/exoduser-wt/_out/P2-008a-pc/`.

공통 명령:

~~~~text
C:/Program Files/Git/bin/bash.exe C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p2-008a-ch1-enemies/godot <로그폴더> <test>[:<격리userdir>]
~~~~

각 폴더의 `<test>.out.log`/`.err.log` 원로그를 보존했다. Main 2종은 각각 원 USERDIR, 새 Main bridge는 EXODUSER-P2008A-HurtE-Isolated-20261020, 나머지 World/actor fixture는 EXODUSER-P2008A-Isolated-20261020. 순수 admission 경계는 Main 미생성. 실제 저장 폴더 사용0, 종료 후 override.cfg 비움.

| 검사 | 로그 폴더 / 격리 spec | 결과 |
|---|---|---|
| 신규 RED | red / test_etype20_ch1_ice_warrior:EXODUSER-P2008A-Isolated-20261020 | 6check/4fail: 미등록 상태를 먼저 재현 |
| 첫 GREEN 시도 | green / 같은 spec | 6/4, JSON float/int 배열 직접 비교 때문에 gate 거부. 기존 _json_equal 적용 |
| 신규 본체 | green-02 / 같은 spec | 48check 중45 PASS/3 FAIL. 실패는 세 이동 좌표를 원본 double delta와 Vector2 float32 결과로 혼동한 fixture |
| 이동3개만 재검 | motion-recheck / motion.sh | **3/0·exit0·ERROR0**. 원본1배→1.6배를 각각 Vector2로 변환하여 **정확 좌표 동등 비교**, epsilon 확대0. 나머지45 성공 검사 반복0 |
| 실제 Main bridge | hurte-bridge / test_etype20_ch1_hurte_bridge:EXODUSER-P2008A-HurtE-Isolated-20261020 | **8/0·exit0·ERROR0**. 실제 세 actor·providers·쉴드 owner, public 입력 아님 |
| exact 경계 | admission-boundaries / test_etype20_ch1_admission_boundaries | **16/0·exit0·ERROR0** |
| 필수 factory | regression / test_encounter_factory:EXODUSER-P2008A-Isolated-20261020 | **3케이스/0fail·exit0·ERROR0** |
| 필수 dedicated hurtE | regression / test_p1002f_dedicated_hurte:EXODUSER-P1002F-Isolated-20261020 | **337 assertions/0fail·exit0·ERROR0**, 기존4종 실제 근접 33 swings. 실제 원로그 값이며 RNG에 따라 검사 수 변동 가능 |
| 필수 death FX | regression / test_p2001b_death_fx:EXODUSER-P2001B-Isolated-20261020 | **42 assertions/0fail·exit0·ERROR0** |
| 필수 contracts | regression / test_contracts:EXODUSER-P2008A-Isolated-20261020 | **5케이스/0fail·exit0·ERROR0** |
| 관련 기존 admission | admission-regression / etype0 physical, etype4 physical, etype4 ice, etype1 lightning | **3+4+4+4=15케이스/0fail**, 모두 exit0·ERROR0. 각 테스트명은 변경 파일과 동일 |

신규 검사의 최종 근거는 **48+8+16=72 check/0fail ledger**다. 첫48개를 깨끗한 전체 재실행으로 포장하지 않는다. 45개 최초 성공+실패 이동3개의 한정 재검을 합산했다. 필수 회귀는 별도 **379 assertions+8케이스/0fail**. 기존 Camera2D physics interpolation 경고가 Main/일부 fixture에 있고 dedicated hurtE stderr에는 `Unicode parsing error ... Unexpected NUL character` 1건도 남는다. assertion PASS와 경고 없음은 다른 게이트다.

이동 재검 명령: `bash G:/exoduser-wt/_out/P2-008a-pc/motion.sh`; 내부 실제 호출은 위 엔진 `--headless --path . --script res://tests/test_etype20_ch1_ice_warrior.gd -- --only=motion`이며 원본 공통 헬퍼는 수정하지 않았다.

추가 증거: `assets.json`, `source-ten-records.json`, `docs-keyword-audit.log`, `summary.cjs`; 수정 전 factory/기존 factory 테스트 사본은 `backup/`. 실제 화면·실측 성능·새 etype20의 정상 Player 입력 전투는 검수하지 않았다. 헤드리스·기존 아트·직접 hurtE 호출을 visual/public-play PASS로 확대하지 않는다.

## ④ 커밋·원격

현재 작업 브랜치에 코드+관련 docs를 경로 지정으로 커밋한다. 구현 커밋 SHA는 커밋 뒤 후속 보고서 업데이트에 기록하고 원격 branch ref와 대조한다. main push/병합/브랜치 전환 없음. 시작 fetch 관측 origin/main은 작업 HEAD와 별도이며 가져온 변경을 이 worktree에 merge하지 않았다.

## ⑤ 남은 것

- 미지원 **7개체(order2/3/5/6/7/9/11)**, 타입은29/7/25/6/21/47. 각 원본 수치·AI·투사체·스킨은 정본 전수표 참조.
- 가장 가까운 다음 원형은 order11 type47. type40 분신 constructor/RNG와 TP 경고·착지 서비스의 exact 추적이 필요하다. 해당 clone 분기에 직접 ens.push가 없다는 점도 보존하고 실제 등록 동작을 임의 추가하지 않는다. 기존 type7 pending/assembly만으로 등록 완료라 하지 않는다.
- 새로운 세 프로필의 정상 입력·생존/사망 플레이·8방향 실제 화면/고등급 elite 시각·성능 QA, 전역 source scheduler·모든 optional 상태/오라 parity는 미확인. 공격 티켓을 새로 넣지 않는다.
- source상 etype20 자연 공격 부재는 이번에 발견한 **원본 동작/설계 불일치**다. 원본 숫자·분기를 임의로 ‘수정’하지 않았으며 별도 소유자 판단 사항이다.
- 이 후보는 10개체 전부 이식 완료가 아니라 **1종/3개체 부분 제출**이다. 총괄 검수·main 통합은 별도 게이트다.
