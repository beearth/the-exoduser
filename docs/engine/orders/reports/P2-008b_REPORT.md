# P2-008b PC 보고서 — 누적 체크포인트

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
| `godot/tests/fixtures/type47_discarded_clone_oracle.json` / `tools/verify_type47_clone_oracle.cjs` | 원본 mkEn 직접 실행 독립 oracle7case·재현 도구 |
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
