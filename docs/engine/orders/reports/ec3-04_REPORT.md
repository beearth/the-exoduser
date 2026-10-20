# EC3-04 — etype41 방어자세·강타 순수 상태/명령

## 첫 절 — EC3-03 WARNING 3건은 main 249c26fad에서도 재현되는 선재 현상

요청한 main `249c26fad989071a94c19128e524ce0bbcb2c8c9`의 별도 detached sparse worktree `~/exoduser-wt/ec3-04-main249`에서 원래 두 회귀를 그대로 실행했다. EC3-02/03/04 파일을 이 baseline에 넣지 않았고, 테스트/제품/설정 원본을 수정하지 않았다. Godot4.7.2 / 같은 Node / 기존 파일 상수 격리 이름(상수 없는 element는 작업 격리 이름) / cold import 후 실행이다.

| main249 기준 검사 | 실제 결과 | exit / ERROR / WARNING | EC3-03 stderr 대조 |
|---|---|---|---|
| test_p3002_spawn_holes | 298단정 / 실패0 | 0 / 0 / 2 | 전체 stderr byte 동일 |
| test_native_element_projectiles | 4그룹 / 실패0 | 0 / 0 / 1 | 전체 stderr byte 동일 |
| baseline cold import | 정상 종료 | 0 / 0 / 0 | 원로그 별도 |

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

Camera 문구는 spawn_holes와 element에 각1회, ObjectDB 문구는 spawn_holes에1회다. EC3-03의3건은 이 main249 환경에서도 그대로 재현되므로 **이번 leaf에서 새로 생긴 경고가 아닌 선재 현상**이다. 누수의 원인·수정은 이번 범위 밖이며 해결했다고 주장하지 않는다. 원문 `baseline-*.out.log/err.log/engine.log/json`, exact 비교 `baseline-warning-comparison.json`에 보존한다. 로그 경로는 모두 `~/exoduser-wt/_out/ec3-04/`다.

## 기준·의존·소유권

| 항목 | 근거 |
|---|---|
| 작업 | ec3-04 / codex/ec3-04-20261020 / ~/exoduser-wt/ec3-04 |
| fetch 최신 main | `56c939fb010cb29d8ff262442339e11a68634817`, 요청 최소249c26fad 이후 |
| 승인 의존 | EC3-03 `01d036d43234f25a2bad28df5362ad4bb5781de9`, 그 안의 승인 EC3-02 fb8e80d03dfb7fa073ed9aaf1820bb86306b2c75 |
| 정상 merge | `491ae9aa2c921f7e1e1a68be7b269071f7ad915b`(첫 부모 최신 main, 둘째 부모 EC3-03). rebase/reset/force0 |
| 병합 정리 기준점 | `4453ca21e04fb2064b7eddc44f176a040131bb02`. 최신 main CHANGELOG의 선재 literal 충돌 표식을 잘못 구분한 첫 병합 결과를 docs-only 정상 후속 commit으로 정리했다. 승인 EC3-02/03 절을 앞에 추가하고 **최신 main의 CHANGELOG 전체 byte를 연속 suffix로 보존**. 기존 표식/타인 본문 정리·삭제0 |
| 지시서 | codex/trace-enemies-ch3-20261020 `20b2139a7f140f13dc37deb082e471c494d6fa77`, FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md §4.2 EC3-04 행 |
| WORK_BOARD | main의 P2-008a/FIX 완료·P2-008b etype47/factory 진행 행을 확인. 이번은 신규41 pure leaf/test라 소유 파일 중복0. actor/crawler/factory/World/공용/다른 담당·기존 테스트 수정0 |
| 재사용 | EC2-02 native_ch2_enemy_constructor_policy::Draws 직접 preload. 기존 combat_stat_formula/producer.gd:228 js_to_int32 직접 호출. EC3-02 초기41의4draw를 새 step과 동일 stream으로 이어 검수. 공통식/HP식/ToInt32 복제0 |
| 변경6파일 | 신규 native_ch3_enemy_guard_policy.gd·test_ch3_enemy_guard_policy.gd·자기 UID2개, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | 정리 기준점 이후 기존 game.html·Godot scripts/tests/data/scene 등397파일 SHA256 불변. 공용/다른 담당/기존 테스트/저장0줄. R HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / branch codex/mac-live-play-time-main-20261017 / tracked INDEX·WORK 불변 |

## 최신 main 원문·정확 계약

game.html 전체 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 최신 main과 byte 동일함을 확인했다. 전용 if SHA256 `48c917b48221179057b342667db5f1dd74a3ba6a1fa3faa04d2ed3843b8353dd`, hurtE 한 줄 SHA256 `1fab0a1f9cee51ab27ff2e39e03deb3e7e6c6a405db133b23b700e2c9ba81b7f`, 해당 줄부터 parryBlueBean 뒤까지 prefix SHA256 `5df1251ce9999fc9e34ba54eb228b679092923a2dea763e318d7f173874f551b`. 테스트가 모두 pin하며 원문을 변형 없이 발췌한다.

| 원본 행 | 보존한 동작 |
|---|---|
| 39318–39319 | etype===41 && s==='idle' 외곽 검사 한 번. GuardT와 SlashT 각각 먼저−sp |
| 39320–39322 | GuardT<=0 && d<1200 && !guarding이면 true / GuardT=90+40U. 기존 guarding true면 재진입 RNG0 |
| 39323–39326 | guarding true이면 GuardT를 다시−sp. 진입한 같은 tick에도 감소. GuardT<=0이면 false/T=GuardCd, 그 뒤 추가 감소0 |
| 39327–39333 | 별도 if SlashT<=0 && d<45. SlashT=SlashCd → telegraph20 → s=windup → st2=18 → 즉시 hurtP(ToInt32(atk×1.3)) → P 위치/e.col parts6 → e 위치 y−15 강타 text(#ff4422/life30) → shake3 |
| 42156 | etype41 && guarding인 경우에만 local dmg=ToInt32(dmg×.5). idle·facing·정면 각도 조건 없음. 부활/phase 게이트 뒤이며 parryBlueBean/bleed·저항·쉴드·포이즈 전 |
| 31266–31270 | EC3-02 소유 초기 GuardCd150+50U → GuardT80+40U → guarding=false → SlashCd100+40U → SlashT40+20U, 이 leaf는 복제/초기화0 |

GuardT는 guarding 중2회, SlashT는1회 감소다. guard 진입/만료와 slash는 한 tick에서 동시 가능하며 guard 분기를 elif로 바꾸지 않았다. 외곽 idle이 거짓이면 두 timer·guardflag·telegraph·st2 전부 그대로다. windup18을 지연 피해18f로 해석하지 않고 **진입 시 즉시 피해 명령**을 내며, 이후 FSM/공통 timer는 별도다. 정면 방패·반격·2연참·block percent·추가 poise 조정0.

## API·순수 계산과 실제 집행의 경계

`step(actor,context,random_unit)`은 RefCounted의 순수 snapshot 계산이다. actor는 etype41·s·atk·st2·GuardT/Cd/SlashT/Cd/guarding, 선택 telegraph를 받는다. context는 원본 블록 진입 시 이미 계산한 d/sp다. 로컬 복사만 갱신해 `READY/fields/fields_timing="before_commands"/commands/draws/full_tick=false/product_connected=false`를 반환한다. caller 중첩 Dictionary, 실제 Node/Player/Main/State에 쓰지 않는다. NOT_READY는 reason/실제draws를 반환하고 부분 fields/commands는 없다. 자체 RNG/되감기/fallback0이다.

| 순서 / 반환 | 필요 집행 계약 |
|---|---|
| fields | T·flag·s/st2와 존재하거나 새로 쓴 telegraph만. **명령보다 먼저** 실제 owner가 적용해야 한다. 명령 뒤 stale snapshot 재적용 금지 |
| hurtP | 첫 명령은 kind=hurtP / dmg=기존 ToInt32(atk×1.3). 지연·옵션·마법/원소·각도·추가 타격을 만들지 않는다. 실제 hurtP 호출은 미구현 |
| addParts | position_ref=player / color_ref=actor.col / count6. hurtP가 끝난 뒤 해당 명령 위치에서 현재 P 좌표/e.col을 읽어야 한다 |
| addTxt | position_ref=actor / offset_y−15 / text_key=강타! / col#ff4422 / life30. 해당 명령 시점 e 좌표를 읽는 symbolic 요청 |
| shake | amount3 요청. 실제 G.shake/OPT/진동 writer가 아님 |
| hurt_damage_projection(actor,damage) | 원본42156에서만 사용할 local value/applied/source_line42156/complete_hurte=false. guard=true인41만 half ToInt32. 타 etype·guard=false는 float도 원래값 그대로. HP/poise 쓰기/전체 hurtE 구현0 |

**후속 FX를 미리 수치화하지 않은 근거:** 원본 hurtP(43415+)는 thorns/reflect 등에서 hurtE로 재진입할 수 있다(43602/43604 부근). 그 뒤 원본39330–39331이 읽는 e/P 좌표·색상은 이전 snapshot과 달라질 수 있다. symbolic ref는 그 읽기 시점을 보존하기 위한 명령 계약이다. 새 실제 writer/dispatcher/반격 기능을 추가한 것이 아니다. actor/Player가 바뀌는 Dictionary-only fixture로 원본 순서를 검수했으며, 실제 반사·사망·FX owner 통합 성공으로 세지 않는다.

## 독립 oracle·필수 검사

Node24.15.0 내장 fs/vm/crypto로 최신 원본 전용 if와42156 한 줄, 이후 parryBlueBean prefix를 발췌해 실행한다. Math.random은 원래 호출 위치에만 주입하고 hurtP/FX는 관측 fixture다. 생산 코드 계산식을 JS로 다시 적어 expected를 만들지 않는다. 새 helper/result는 지정 격리 userdir의 UTF-8 임시 파일, 명시 `--node-bin` 절대 경로, OS.execute 출력 join 진단, 성공/실패 종료·receipt 파싱을 구분한다. 사용 후 임시 파일 삭제, 모든 double은 binary64/base64 복원이며 **허용오차0**다.

| 검사 | 범위 |
|---|---|
| 단일 tick2262건 | GuardT−1/0/1/2/90 × SlashT−1/0/1/2/50 × sp0/.5/1/2/135 × guard bool × d0/45바로아래·동일·위/1200바로아래·동일·위 + seed500임의/ToInt32경계·overflow + non-idle8 + 명시재진입4 |
| 연속640tick | 8×80. 이전 source 출력과 Godot 출력 각각 다음 입력에 사용. 외부 FSM의 idle/hurt 전환은 명시 fixture로 구분 |
| 피해256건 | etype0/20/40/41/42/47/49/90 × guard bool × 음수·소수·int32/uint32/큰 binary64 16값. guard=false의 trunc 없음도 비교 |
| suffix16건 | 원본42156 뒤 parryBlueBean 적용 위치 관측. 19→guard9→원본minimum100 사례, 순서 반대의50과 구분. 실제 parry 구현 추가0 |
| golden | Guard5→3/Slash4→3, 진입 U.5 110→109, guard/slash 동시, 진입/만료 같은 tick, d45/1200 strict, windup18/telegraph20·즉시1.3/명령4순서, idle 밖 동결·facing 무관, 음수 half trunc0방향 |
| 무효·보호 | invalid context/actor/Callable/난수 bool/null/문자열/NaN/Inf/범위밖·소비 수·부분 slash 반환금지·caller 입력 불변·다른 etype admission 금지. EC3-02 4초기draw 뒤 동일stream guard 진입 검수 |

Dictionary-only command consumer fixture는 projection fields를 먼저 적용하고 hurtP 시점 상태를 관측한다. 재진입 fixture가 actor/P 위치·색상·s/st2·guardflag를 바꿔도 후속 FX는 새 값을 읽고 마지막에 stale fields를 덮어쓰지 않는지를 원문 event/최종 상태와 대조한다. 실제 Player/World/가짜 제품 actor를 만든 검사가 아니다.

초기 `new-first`는29532검사/1272실패·exit1·ERROR0/WARNING0이었다. 연속8×80 fixture의 base가 원본31268의 초기 `_dkGuarding=false`를 빠뜨려 pure policy의 입력 검증에서640회 NOT_READY, 이어진 source 입력 비교가632회 불일치했다. 단일 tick2262건·피해/위치 검사 실패는 없었다. fixture base에 원본 bool 초기값을 넣었으며 제품 leaf·입력 guard·원문 블록·단정은 수정/삭제/완화하지 않았다. 초기 source-oracle-first.cjs/json·test-first.gd와 실패 stderr 전체를 보존한다. 이후 정상 chain 실행으로 단정 수가 달라지는 것은 초기 NOT_READY가 건너뛴 상태/명령/불변 검사를 실제로 수행하기 때문이다.

## 실행 결과

신규 test_ch3_enemy_guard_policy 최종 **36588검사/0실패**(new-final), 원문2902tick/피해256/suffix16, exit0·ERROR0·WARNING0·skip0·허용오차0. 처음29532/1272 실패와 구분하며, 원문·제품 leaf의 변경 없이 fixture bool 초기값만 복원한 뒤 모든 chain 단정을 수행했다.

새 격리 이름은 EXODUSER-ec3-04-Isolated-20261020이며 기존 파일 상수가 있으면 각 상수 이름을 사용한다. 상수가 없는 contracts/factory/element는 작업 격리 이름을 명시한다. Godot 실행 직전 요청한 정확한 pgrep 명령을 확인하고2개 이상이면30초씩 대기했으며, Godot3개가 관측된 때도 새 실행0/대기했다(godot-count.log). 자기 runner는 직렬 실행하고 override.cfg는 각 실행 finally0byte. baseline/main 작업 cold import는 각각exit0/ERROR0/WARNING0이다.

| 기존 회귀 | 실제 수치 | exit / ERROR / WARNING |
|---|---:|---|
| test_ch3_enemy_phase_policy | 33177 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_catalog_policy | 12602 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_spawn_policy | 10234 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_constructor_policy | 159902 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_spawn_policy | 7483 / 0실패 | 0 / 0 / 0 |
| test_contracts | 5그룹 / 0실패 | 0 / 0 / 0 |
| test_encounter_factory | 3그룹 / 0실패 | 0 / 0 / 0 |
| test_p3002_spawn_holes | 298 / 0실패 | 0 / 0 / 2 |
| test_native_element_projectiles | 4그룹 / 0실패 | 0 / 0 / 1 |

회귀9종은 기존 검사/파일 변경0, 숫자 단정223696/0과 그룹12/0을 구분한다. 신규 포함 숫자 단정260284/0이다. only=[]/skipped=[] 또는 모든 예정 그룹 실행을 확인했다. stdout/stderr/engine 로그와 결과JSON을 분리 기록했으며, 성공 실행의 engine 로그에도 ERROR가 없음을 확인했다. 최신 병합 기반의 종료 WARNING3건도 첫 절 main249의 전체 stderr와 byte 동일하다(regression-summary.json). 초기 신규1272실패 원문은 별도로 유지하고 성공 결과에 합쳐 숨기지 않는다.

## 공용 접점·HOLD

| 필요 위치 | 원본 근거·별도 통합 필요 / 이번 변경 |
|---|---|
| 실제 etype41 actor tick | G39318 위치의 admission·cached d/sp와 EC3-02 초기 snapshot readback, 결과 fields 적용·명령 순서 소비가 필요. 기존 actor/FSM/writer/World/factory 0줄 |
| 실제 Player damage / FX owner | G39329–39332. windup fields 선적용 → 동기 hurtP → FX late read → shake. 단순 지연 callback·hurtP 이후 stale overwrite로 대체 금지. 실제 소비/재진입 readback은 미확인/HOLD |
| native_normal_enemy_hurte.gd:156–160 부근 | 기존 SPECIAL_HIT_ETYPES 활성 차단 유지. 41을 단순 삭제하지 않고42156 local damage projection을 정확한 순서에 소비할 별도 승인 필요. 현재 field owner·피격/포이즈/사망 연결0 |
| common tail / State / 저장 | G38884·40458이후 common clock/FSM·피격/쉴드·Player상태·실제 보상/생성·save whitelist를 이 leaf에 가져오지 않음. 공용 Main/State/저장형식0. EC3-05 착수0 |

원문/관련 docs 키워드 전체 검색은 docs-keywords.log에 보존하고, 기획의 정면가드/반격/2연참과 다른 현행 원문 계약은 이 보고서·CHANGELOG에 수치/구현 상태로 동기화한다. 제품 연결·실플레이·성능·PC·전체 hurtE/가독성 검수는 **미확인/HOLD**다.
