# P2-008b PC 보고서 — 누적 체크포인트

## 현행 후보 요약 (2차)

**부분 이식 2종/2개체: order11/type47 + order9/type21.** 초기16의 전용 소비자는 지원11/미지원5, 순서[0,1,4,8,9,10,11,12,13,14,15]. 아래 1차10/6·당시17종 수치는 체크포인트 이력이며 최신 결과는 말미 2차 절을 따른다. 소환굴 연결0·Q/E/입력/세이브 변경0.

## ① 원본 근거 / 1차 order11

- 작업 위치 `G:\exoduser-wt\codex-p2-008b`, 브랜치 `codex/p2-008b-ch1-enemies-pc-20261020`, 착수 HEAD `9528ea35b429498fcf42fe3723008219ed0ed7e1`. 착수 tracked INDEX/WORK 깨끗함, `git fetch origin main` 실행. 본 폴더 `G:\exoduser` 수정·브랜치 전환·커밋 없음.
- 작업판·Mac 지시서·몬스터/AI SSOT 선행 확인. 상세 수치 표는 [정본](../../FDG_P2_008B_CH1_ENEMIES_20261020.md).
- `game.html:31120-31362` constructor, `31285-31287` 분신/TP 초기 타이머, `39407-39429` type47 AI, `20006-20048` teleportE 착지, `20122-20155` 공통 탄 완료, `38681-38705` 이동, `40456-40518` idle/접촉 제외/차징.
- **원본 분신은 mkEn 반환 객체만 조정하며 ens.push가 없다.** type40 액터·초기 source record·소환굴 연결을 새로 만들지 않았다. e.el=0은 JS falsy이므로 분신 el3. 원 `_ri` 부재도 보존한다.
- order11만 exact 등록: 초기16 지원9→10 / 미지원7→6. 원본 데이터 SHA·이름·좌표·HP/실드/포이즈/ATK·원 support/runtime snapshot 불변.
- 웹 원본21자원(16atlas+TP4+물리탄1) 26,835,117B, SHA/byte 21일치/0불일치. 새 자원 생성/변형/복사0; 이미 존재하는 원본 바이트 재사용. receipt `G:\exoduser-wt\_out\P2-008b-pc\assets-47.json`.

## ② 변경 파일

| 경로 | 범위 |
|---|---|
| `godot/scripts/enemy_ch1_shadow_twin.gd` | 전용 이동/분신/TP/공통 물리탄·차징 라벨·hurtE owner 상속 |
| `godot/scripts/native_shadow_clone_recipe.gd` | stage0 type40의 폐기 객체 constructor 부작용·RNG·스킨 receipt, null이면 정직 정지 |
| `godot/scripts/native_shadow_teleport.gd` | actual Player 착지325/추가KB120·TP 원본 renderer 재사용 |
| `godot/data/etype47_ch1_shadow_twin.json` | source SHA·order11 exact 프로필·한계 |
| `godot/scripts/enemy_factory.gd` | +25/−3줄. exact gate·원 자원 검증·별도 전용 생성/보고 |
| `godot/scripts/world.gd` | **공용 +13/−0줄**, actual Main의 G/P/OPT 읽기 전용 문맥. 소환굴 변경0 |
| `godot/scripts/native_type7_teleport.gd` | +4/−1줄. TPVisual 색 인수화, 기존7 기본색#8833cc 불변 |
| `godot/tests/test_etype47_*.gd` 3개 | 전용 기능22·clone oracle176·Main bridge5 |
| `godot/tests/fixtures/type47_discarded_clone_oracle.json` / `godot/tests/tools/verify_type47_clone_oracle.cjs` | 원본 mkEn 직접 실행 독립 oracle7case·재현 도구 |
| factory·기존 etype 검사8개 | 정확한 지원10/미지원6·등록순서·옆 개체 index만 갱신, 원 검증 삭제/완화 없음 |
| 설계 docs3개·P2-008b 정본·작업판·본 보고서 | 구현/미완료·원본 근거 동기화 |

main.gd/hud.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 변경0. 레슨·입력·Q/E·세이브·spawn hole 스크립트 변경0. override.cfg·guard.baseline.json 커밋 제외.

## ③ 실행 / 수치 / 로그

Godot 4.7.2, 로그 루트 `G:\exoduser-wt\_out\P2-008b-pc\`. 각 테스트 stdout=`<이름>.out.log`, stderr=`<이름>.err.log`.

명령은 공통으로 다음 헬퍼 사용:

```text
C:\Progra~1\Git\bin\bash.exe C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/codex-p2-008b/godot G:/exoduser-wt/_out/P2-008b-pc/<로그하위> <아래 테스트[:격리명]>
```

| 테스트 | 결과 | 최종 로그 하위 |
|---|---|---|
| `test_etype47_ch1_shadow_twin` | 22check / 0실패 | final-47 |
| `test_etype47_clone_oracle` | 7case·176check / 0실패 | final-47 |
| `test_etype47_main_bridge:EXODUSER-P2008B-Main-Isolated-20261020` | 5check / 0실패, 실제 Main G/P/OPT·분신 비등록·hurtE 실드 | regression-47 |
| `test_encounter_factory` | 3case / 0실패 | regression-47 |
| `test_etype0_physical_burn` | 4case / 0실패 | regression-47 |
| `test_etype0_physical_flesh_crawler` | 3case / 0실패 | regression-47 |
| `test_etype1_lightning_hive_bloater` | 4case / 0실패 | regression-47 |
| `test_etype4_ice_soul_flame` | 4case / 0실패 | regression-47 |
| `test_etype4_physical_spine_beast` | 4case / 0실패 | regression-47 |
| `test_etype20_ch1_admission_boundaries` | 18check / 0실패(47 변조 경계 추가 포함) | regression-47 |
| `test_etype20_ch1_ice_warrior` | 48check / 0실패 | regression-47 |
| `test_etype20_ch1_hurte_bridge:EXODUSER-P2008A-HurtE-Isolated-20261020` | 8check / 0실패 | regression-47 |
| `test_type7_teleport` | 4group / 0실패 | regression-47 |
| `test_p1002f_dedicated_hurte:EXODUSER-P1002F-Isolated-20261020` | 337assert / 0실패·public attack API41swing·fallback0 | regression-47 |
| `test_p3002_spawn_holes:EXODUSER-P3002-Isolated-20261020` | 298assert / 0실패·spawn168/미지원158·기존etype0등록10 유지 | regression-47 |
| `test_native_main_source_starter_state:EXODUSER-MainSourceStarter-Isolated-20261014` | 148check / 0실패 | regression-47 |
| `test_contracts` | 5case / 0실패 | regression-47 |

총 **고유 Godot17종, 최종 실패0·SCRIPT ERROR/ERROR0**. regression-47 stderr 경고8개: Camera2D7개, p1002f 종료시 ObjectDB4instance leak 경고1개. 누수를 해결/완전 무경고라고 주장하지 않는다. 실제 키보드/마우스 플레이·성능·픽셀 PASS 아님.

독립 JS 검증: `C:\nvm4w\nodejs\node.exe godot/tests/tools/verify_type47_clone_oracle.cjs` → 원본 직접 실행7case / 0실패, `clone-source-oracle.log`. 원본 SHA까지 고정하고 normal/M29/M30/Lv500/501/난이도10/safePt 이동/null 경계를 비교한다.

### 실패 원로그 및 최소 조치

1. `red/`: 미등록 order11 검사1/1실패를 먼저 확인. 구현 후 `green-1/` 22/0.
2. `oracle-main/`: oracle176/0. Main bridge stdout5/0이나 stderr에 `ExoduserNativeSpawnHoleSystem` 클래스 캐시 compile 오류·install_native_boot 오류가 있어 **이 최초 Main 실행은 깨끗한 PASS로 집계하지 않음**.
3. 복사된 `.godot` global-class 캐시가 최신 main 클래스와 불일치. 소환굴 소스 수정 없이 `G:\godot-engine\4.7.2\Godot_v4.7.2-stable_win64_console.exe --headless --path godot --import` **1회**. `import.stdout.log` / `import.stderr.log`(stderr0).
4. 실제 Main 재검증5/0·원본 의존 회귀 실행. 성공 범위를 무의미하게 반복하지 않고, 이후 새47 렌더 라벨/지역명 변경 범위만 `final-47/`의22/176 재검증.

## ④ 커밋 / 원격

- order11 구현 SHA `934783ad53a5f4100ec16ddf5ef230cd4087b760`, 자기 브랜치 push 완료. 보고서 기록 커밋과 구현 SHA는 구분한다.
- 자기 브랜치만 경로 지정 스테이징·테스트 force add·`git push origin HEAD`, 원격 ref SHA 읽기 대조. main 병합/푸시 없음.

## ⑤ 남은 것

1. 다음 최근접 순은 order9/type21 → order5/type25 → order2/type29 → order3/type7 → order6/type6 → order7/type7. exact profile별로 별도 검증·체크포인트로 진행한다.
2. TP 경고/착지/분신 비등록/공통탄은 기술 검증했으나, 기존 TP renderer의 literal particle·blast light·shake·전체 공유 RNG/픽셀 동등성은 미완료. `full_teleport_particle_light_shake_parity=false` 유지.
3. 실제 1920×1080 창·1× 크롭·회피 조작·공개 플레이 관측 없음. **VISUAL VERDICT: RETOUCH(미검수)**. headless 결과로 대신하지 않음.
4. 소환굴의 미지원 etype 정직 정지는 그대로 유지. 이번 추가 프로필을 연결하지 않는다.

## 2차 — order9/type21 기능 후보 및 최종 누적

### ① 원본 근거

원본 `39061`은 빙궁수 주석뿐이며 실제 order9는 dark3/spine_beast다. `38681-38705` range800·ideal520/680과 `40462-40464` idle 이동을 각각 보존. `40513`이 실제 el로 dark 차징을 결정한다. `20122-20155` raw dmg31/life240/sz1.6 → `16947-16994` 이동탄 정규화62/3.2/500+U100 → `35016-35028` 기존 dark kernel contact80 magic. 자연 접촉·이름상 얼음 공격을 추가하지 않았다. 정본의 2차 수치 표 참조.

초기16 **지원11/미지원5**. 정확히 추가한 개체는 order11/type47 및 order9/type21 두 개다. `game.html`·`encounters.json`·소환굴·공용 Main/Player/입력/QE/세이브 변경0을 `git diff --exit-code`로 확인.

### ② 추가 변경 / 최종 공용 줄 수

- 추가: `godot/scripts/enemy_ch1_dark_archer.gd`, `godot/data/etype21_ch1_dark_archer.json`, `godot/tests/test_etype21_ch1_dark_archer.gd`, `godot/tests/test_etype21_main_bridge.gd`.
- 수정: factory exact gate, 기존 검사10개의 지원수/순서, 정본·보고서·작업판 및 몬스터/AI/공격/얼음몹 애니메이션 설계4문서.
- 최초 HEAD `9528ea35b` 대비 누적: **world.gd +13/−0**, factory +47/−3, native_type7_teleport +4/−1. main.gd·hud.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd·native_spawn_hole_system.gd 변경0.
- dark 원본 피격시트2개 500,793B 추가 바이트 대조2일치/0불일치, `assets-21.json`. 이전21개 포함 **고유23개/27,335,910B/0불일치**, 신규 그림·자원 복사/변형0. 이미 존재하는 byte-identical 원본 재사용.

### ③ 2차 명령·최종 결과

앞서 명시한 동일 헬퍼, 프로젝트 `G:/exoduser-wt/codex-p2-008b/godot`, 로그 `G:/exoduser-wt/_out/P2-008b-pc/regression-21`에 아래17종 인수를 순서대로 전달했다.

```text
test_etype21_main_bridge:EXODUSER-P2008B-DarkMain-Isolated-20261020
test_encounter_factory
test_etype0_physical_burn
test_etype0_physical_flesh_crawler
test_etype1_lightning_hive_bloater
test_etype4_ice_soul_flame
test_etype4_physical_spine_beast
test_etype20_ch1_admission_boundaries
test_etype20_ch1_ice_warrior
test_etype20_ch1_hurte_bridge:EXODUSER-P2008A-HurtE-Isolated-20261020
test_etype47_ch1_shadow_twin
test_etype47_clone_oracle
test_etype47_main_bridge:EXODUSER-P2008B-Main-Isolated-20261020
test_p1002f_dedicated_hurte:EXODUSER-P1002F-Isolated-20261020
test_p3002_spawn_holes:EXODUSER-P3002-Isolated-20261020
test_native_main_source_starter_state:EXODUSER-MainSourceStarter-Isolated-20261014
test_contracts
```

| 검사 | 최종 수치 / 실패 | 로그 |
|---|---|---|
| 신규21 기능 | 20check/0, 이동5거리·dark62/240/550·실제 kernel contact80·변조3 | green-21/test_etype21_ch1_dark_archer.*.log |
| 신규21 Main | 5check/0, 실제 Main/World/Player·실드·원본 dark kernel | regression-21/test_etype21_main_bridge.*.log |
| factory / burn / type0 / type1 / ice4 / physical4 | 각각3/4/3/4/4/4case, 모두 failed_assertions0 | regression-21/각 test.*.log |
| admission / etype20 / etype20 Main | 20/48/8check, 모두0실패 | regression-21/각 test.*.log |
| etype47 기능 / oracle / Main | 22/176/5check, 모두0실패 | regression-21/각 test.*.log |
| p1002f | **381assert/0·48swing**, fallback0·SKIP0. 랜덤 드랍/교전 진행에 따라 1차337/41과 실제 관측 수가 다르므로 덮어쓰지 않음 | regression-21/test_p1002f_dedicated_hurte.*.log |
| p3002 | 298assert/0, spawn168·정직정지158·etype0 액터10, 소환굴 연결 추가0 | regression-21/test_p3002_spawn_holes.*.log |
| starter / contracts | 148check/0 및 5case/0 | regression-21/각 test.*.log |
| type7 TP | 기존 코드 무변경이므로 성공4group/0을 재실행하지 않고 1차 결과 보존 | regression-47/test_type7_teleport.*.log |

TDD: `red-21/test_etype21_ch1_dark_archer.*.log` 먼저 미등록1/1실패, 구현 후 green-21 20/0. 새 asset이 없고 global class를 추가하지 않아 import 반복0.

**누적 고유 Godot19종, 각 최종 결과 실패0·SCRIPT ERROR/ERROR0.** 2차 regression stderr 경고9개(Camera2D8개+ p1002f 종료 ObjectDB2instance leak 경고1개). 누수 원인·시각·성능은 미해결/미검수이며 실패0을 무경고·전체 게임 완료로 표현하지 않는다. 격리명 없는 Main 테스트 실행0, override.cfg 커밋0.

### ④ 2차 커밋

2차 구현 SHA는 다음 기록 체크포인트에서 기입한다. 1차 구현 `934783ad53a5f4100ec16ddf5ef230cd4087b760`과 기록 `f48c94eb6c4067646e3ee7c977266d397c700e08`은 자기 원격 브랜치에서 읽기 대조 완료.

### ⑤ 다음 경계 — 미지원5 정직 정지

남은 순서: **order5/type25 → order2/type29 → order3/type7 → order6/type6 → order7/type7**(5개체/4종). 이번 2종 후보까지 검수 요청하며 이후 개체를 기이식 타입으로 대체하지 않는다.

다음 order5는 `39078-39083`의 **무피해·무감속 dark 정지 장판**(sz2/life480)과 `42803-42808`의 **사망 ice 장판3개**(sz2.5/life360)를 별도 소비해야 한다. `35074-35077`의 실제 속성 분기, `34671/34745`의 0.667 수명 감소/near-camera life1 연장, `54170-54178`의 원본3층 렌더를 확인했다. 현재 `native_normal_enemy_hurte.gd:648` 부근은 특수 사망 분기가 모두 단락된 범위로 작성되어 있어 이를 정상 처리했다고 주장할 수 없다. stationary-zone·사망 생산자·elite1 후반부가 미인수인 상태로 등록하지 않았다. 원본 행/타이머/후속 의존성은 정본에 기록했다.

전체 TP particle/light/shake·전체 공유 RNG/픽셀 동등성·1920×1080 실제 창 및1× 크롭·공개 입력 플레이는 여전히 미완료. **VISUAL VERDICT: RETOUCH(미검수)**. main 병합은 총괄 검수 후 별도 단계다.
