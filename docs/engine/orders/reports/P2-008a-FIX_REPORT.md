# P2-008a-FIX — 빙결전사 포이즈 정지 결함

## ① 원본 근거 / 원인

작업 위치 `G:\exoduser-wt\codex-p2-008b`, 브랜치 `codex/p2-008b-ch1-enemies-pc-20261020`, 착수 HEAD `2a05d13f706fbd53d26e178fc489ed632c68c6de`. 기존 INDEX 비어 있음, WORK에는 이전 guard 훅이 만든 `tools/guard.baseline.json`만 존재했고 그대로 제외/보존했다. fetch한 origin/main `b887183126eccd05e06fd793b9b8cb7d889cecd6`을 merge/checkout하지 않았다. `G:\exoduser` 본 폴더 수정0.

원본 `game.html` SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, `encounters.json` SHA256 `91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa` 불변.

| 근거 | 원본 / 보존 값 |
|---|---|
| `game.html:19972-19977` | `_poiseHit`: !e/사망/amt≤0은 무변경 false. 일반 적은 poise−=amt 한 번, poiseR=0 |
| `19978-19983` | poise≤0이면0, stunned=max(current,180), _maxStunned=max(current||0,180). 일반 적에게 boss90/면역300을 넣지 않음 |
| `20000-20004` | _poiseReset은 maxPoise로 복귀하고 poiseR0. 이번 수정에서 별도 reset/clock 추가0 |
| `31164`, 원본 초기 record4/10/12 | poise/maxPoise875, poiseR0. HP는2187/875/875로 서로 다름. HP로 최대 포이즈를 재계산하지 않음 |
| `38660-38664` | 일반 자연 회복200tick마다 trunc(maxPoise×.15), 원875에서131, max cap875 |
| `42486-42490` | hurtE는 poiseHit 옵션의 잔여 피해×poiseMult와 어픽스를 포이즈 양으로 전달. 실드 전량 흡수·amt0은 변화 없음 |

**원인:** etype20은 crawler를 상속하여 type0 전용 `apply_native_source_poise_hit`와 별도 `apply_native_normal_enemy_poise_core`를 둘 다 가진다. 기존 dispatch는 전자 메서드 존재만 먼저 검사했다. 실제 type0 필드 권한 검사에서는 거부되어 World invocation=null→`42490 source_field_call_unavailable`. 기존 직접 core/실드100 검사만으로는 이 양수 잔여 피해 경로를 검증하지 못했다.

**수정:** field-call은 source 메서드가 **있고 전용 core가 없을 때만** 선택한다. 명시된 dedicated core가 있으면 그것 하나만 실행한다. 일반 crawler는 core 메서드가 없으므로 기존 v3 경로 그대로다. type0 도메인 검사 확대0·fallback0·halt 삭제/숨김0·이중 core 실행0. 수치/상태/저장/입력 계산 변경0.

## ② 변경 파일 / 소유권

| 파일 | 변경 |
|---|---|
| `godot/scripts/native_normal_enemy_hurte.gd:876` | **유일한 제품 수정 +1/−1줄**, owner 선택 조건. 원 `_halt`·core 위임·후반부·World/actor 검사는 그대로 |
| `godot/tests/test_etype20_ch1_poise_hurte.gd` | actual Main/World/Player/Crescent 충돌 재현55check. order4/10/12 각각 검사 |
| `godot/tests/test_p1002g_kislash_hurte.gd` | +17/−2줄. 기존6종별 원본 수치·포이즈 route·사망 검증 유지. 전역 G 처치 집계에 빠져 있던 실제 비추적 actor 처치도 포함하고, 완료 receipt/World의 실제 죽은 노드/중복 없음 검증을 처치당3개 추가 |
| `FDG_P2_008A_CH1_ENEMIES_20261020.md`, `FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md` | 원인·원본 포이즈/회복·단일 owner 경계 정정 |
| 몬스터/공격/AI 설계3문서, P2-008a/b 기존 보고서, WORK_BOARD, 본 보고서 | 최초 검사 범위의 구멍과 이번 실제 검증을 구분·동기화 |

enemy_melee_flesh_crawler.gd·enemy_melee_ch1_ice_warrior.gd 수정0. main.gd/hud.gd/world.gd/player.gd/native_source_new_run_state.gd 수정0. 레슨·Q/E·세이브·소환굴·factory·원본 game.html/encounters.json·에셋 변경0. 새 적·기능 이식0, 새 import0. 이미 커밋된 P2-008b 구현과 이번 FIX diff는 구분한다.

### p1002g 검사 집계 보정은 약화가 아님

원본 `42702` G.kills/_stageKills, `42714-42717` combo, `42756-42759` chain, `43103` 기본 mats는 테스트가 지정한6종만이 아니라 **실제로 처치한 모든 적**에 적용된다. 기존 테스트는 실제 Crescent 무제한 관통으로 발생한 비추적 적 결과를 `tracked.has(id)`에서 건너뛰고 G 증가도6종만 계산했다.

제품 수정 후 정상 처치가 완료되면서 이 누락이 드러났다. 현재 실제 로그의 죽은 owner는 총9명: 기존6종+order4/12/11 세 명. p1002g의 기존6종 검증·기존6개 G 등식·타이머/계산식/임계값은 유지하고, 모든 실제 kill receipt를 actual World 노드 생존/HP와 대조하는27검사를 추가했다. 결과220→247assert. 적 수 감소·배치 변경·무피해/무포이즈 설정·공격 티켓·검사 스킵·halt 필터링·G 값 보정 없음.

## ③ 재현 및 검증

엔진 `G:\godot-engine\4.7.2\Godot_v4.7.2-stable_win64_console.exe` / 4.7.2.stable.official.ed1daf0bf. 로그 루트 `G:\exoduser-wt\_out\P2-008a-FIX-pc\`. 원로그 `<테스트>.out.log` / `.err.log`를 보존한다.

공통 명령:

```text
C:\Progra~1\Git\bin\bash.exe C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p2-008b/godot G:/exoduser-wt/_out/P2-008a-FIX-pc/<로그폴더> <아래 테스트[:격리명]>
```

### 실패 원로그 → 원인 → 최소 조치

| 실행 | 결과 / 판단 |
|---|---|
| `red/test_etype20_ch1_poise_hurte` | 최초 fixture는 SceneTree paused라 HP 잔여 피해의 G owner 쓰기가 먼저 거부:40check/13실패·3halt. **원인 재현 PASS로 세지 않음**. 제품 수정 없이 fixture의 pause1줄 제거. 기존 원로그 보존 |
| `red-02/test_etype20_ch1_poise_hurte:EXODUSER-P2008A-FIX-Isolated-20261020` | 40check/13실패·3halt. 실제 근접 검기 충돌로 HP는 각100 감소하지만 포이즈875 유지, 세 개체 모두 정확히 `source_field_call_unavailable` |
| `red-02/test_p1002g_kislash_hurte:EXODUSER-P1002G-Isolated-20261020` | 220assert/1실패·halt8, 총괄 보고와 같은 `no native_hurte_halt emitted across combat` 실패 재현 |
| 제품 선택 조건1줄 수정 후 `green/test_etype20_ch1_poise_hurte` | **55check/0실패·halt0**, 세 개체 모두 HP−100/poise875→775/R0. no_entry0/R 유지·회복131·그로기180·단일 owner 추가 경계 포함 |
| 같은 제품의 `green/test_p1002g_kislash_hurte` | 220assert/12실패·**halt0**. 전역 G 등식6개×2cast 실패만 남음: 정상 완료된 비추적 처치를 테스트가 합산하지 않은 집계 결함. 이를 전체 PASS라고 보고하지 않음 |
| 집계 보정 후 `p1002g-ledger/test_p1002g_kislash_hurte` | **247assert/0실패·halt0·SKIP0·7cast**, public attack API 실제 호출. 실제 죽은 owner9명을 대조한27assert 추가. 제품 수정은 앞선1줄 그대로 |

새 재현 테스트는 actual Main과 실제 imported Crescent/충돌·hurtE/actual World registry/HP·포이즈 owner를 사용한다. 단, **damage100·실드0·근접64px·regen37/199는 명시 fixture 상태**이며, 정상 플레이를 가장하지 않는다. 기존 p1002g는 공개 attack API를 그대로 쓰고 GUI 입력/실창 인수는 아니다. 성공한55검사는 p1002g 집계 보정 후 반복하지 않았다(제품 코드 추가 변경0).

### 필수 P2-008a 전체 회귀 및 동일 상속 소비자

최종 **Godot 고유19종 실패0 / SCRIPT ERROR·ERROR0**, 아래 표의 원로그로 확인했다. Main은 각 테스트의 USERDIR와 일치하는 격리 이름을 사용했다. 일반 fixture spec의 `FIX`는 `EXODUSER-P2008A-FIX-Isolated-20261020`을 뜻한다. 테스트명 뒤 `:<격리명>`으로 위 헬퍼에 전달했다.

| test | 격리명 | 최종 결과 | 로그 폴더 |
|---|---|---|---|
| `test_etype20_ch1_poise_hurte` | FIX | 55check/0·halt0 | green |
| `test_p1002g_kislash_hurte` | EXODUSER-P1002G-Isolated-20261020 | 247assert/0·halt0·SKIP0·7cast | p1002g-ledger |
| `test_encounter_factory` | FIX | 3case/0 | p1002g-ledger |
| `test_etype0_physical_burn` | FIX | 4case/0 | p1002g-ledger |
| `test_etype0_physical_flesh_crawler` | FIX | 3case/0 | p1002g-ledger |
| `test_etype1_lightning_hive_bloater` | FIX | 4case/0 | p1002g-ledger |
| `test_etype4_ice_soul_flame` | FIX | 4case/0 | p1002g-ledger |
| `test_etype4_physical_spine_beast` | FIX | 4case/0 | p1002g-ledger |
| `test_etype20_ch1_admission_boundaries` | FIX | 20check/0 | p1002g-ledger |
| `test_etype20_ch1_ice_warrior` | EXODUSER-P2008A-Isolated-20261020 | 48check/0(원 이동3검사 포함 전체) | p1002g-ledger |
| `test_etype20_ch1_hurte_bridge` | EXODUSER-P2008A-HurtE-Isolated-20261020 | 8check/0 | p1002g-ledger |
| `test_etype21_ch1_dark_archer` | FIX | 20check/0 | p1002g-ledger |
| `test_etype21_main_bridge` | EXODUSER-P2008B-DarkMain-Isolated-20261020 | 5check/0 | p1002g-ledger |
| `test_etype47_ch1_shadow_twin` | FIX | 22check/0 | p1002g-ledger |
| `test_etype47_clone_oracle` | FIX | 176check/0 | p1002g-ledger |
| `test_etype47_main_bridge` | EXODUSER-P2008B-Main-Isolated-20261020 | 5check/0 | p1002g-ledger |
| `test_p1002f_dedicated_hurte` | EXODUSER-P1002F-Isolated-20261020 | 269assert/0·halt0·SKIP0 | p1002g-ledger |
| `test_p2001b_death_fx` | EXODUSER-P2001B-Isolated-20261020 | 37assert/0·SKIP0 | p1002g-ledger |
| `test_contracts` | FIX | 5case/0 | p1002g-ledger |

P2-008a 보고서의 필수 factory/p1002f/deathFX/contracts·기존 전용4종·etype20 본체/bridge/admission 전부 포함. 현재 branch에서 같은 상속의 etype21/47도 추가 회귀했다. p1002f/deathFX의 실제 검사 수는 최초 보고서337/42와 다르며 시작 장비 RNG·실제 교전 진행에 따른 관측269/37을 그대로 기재했다. 시드/기대값/테스트 대상을 바꿔 수를 맞추지 않았다.

최종 원로그 경고11개 = Camera2D10개 + p1002g 종료시 ObjectDB2instance leak 경고1개. 무경고·누수 해결·실창 PASS라고 주장하지 않는다. raw 로그의 실패 내역·fixture 오류·집계 오류와 최종 결과를 모두 보존했다. 추가 성공 반복0, source/asset import0, override.cfg 커밋0.

## ④ 커밋 / 원격

FIX 구현·재현 테스트·집계 보정·관련 docs만 별도 커밋한다. 실제 구현 SHA는 후속 기록 체크포인트에 기재한다. 자기 브랜치 `git push origin HEAD` 후 원격 ref와 대조하며 main push/merge 없음. 기존 `tools/guard.baseline.json`은 스테이징/커밋하지 않는다.

## ⑤ 남은 것

이 FIX는 포이즈 선택 경로만 해결하며 전체 hurtE 미이식 선택 분기·엘리트 후반부·사운드/파티클·source 전역 clock·실화면/공개 입력 인수까지 완료했다는 뜻이 아니다. P2-008b 기존 etype47/21 후보는 보존하고 이번 FIX에 새 적 이식을 섞지 않는다. P2-008b의 남은5개체/TP 전체FX/실창 미검수는 기존 보고서 범위 그대로다.
