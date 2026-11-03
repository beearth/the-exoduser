# EL-01 — hell0 정예 선택·owner 단일 lock·강제 후처리

기준 최신 main `45be76e49d0090316b91a6b7b383d81835e29192`(969c194e6 이후). `94d26012985d830c0ec916ec3f329d9455e2ab0e`를 정상 merge한 지점은 `b46dd5f2`다. CHANGELOG 충돌은 DEMO11-30의 추가 절과 main 전체를 모두 보존했다. rebase/cherry-pick/보호 경로 반입 없음. 작업 브랜치 `codex/el-01-20261021`. 설계 근거는 trace-elites `48681a12`의 §5.1/5.2와 DEMO11-30 `94d26012` 보고서이며, 이번 사용자 배정에 따라 hell0 및 Mac owner/forced 부품으로 범위를 한정했다.

**배정된 Mac 부품은 구현했다. DEMO11-30 전체 자연 입장 완료는 아니다.** `claude/pc-m29-parry-20261021` 조회는 정상 exit0/원격 ref 없음이며 PC merge는 0건이다. type3/native_type7 binding의 실제 M29 서비스가 없으면 기존 readiness/configure 실패를 유지한다. `type3_native_binding.gd:251`의 `handle_m29_parry(actor,target,event)` 호출 위치·인자·반환 거절 처리는 그대로다. dummy callback/항상 false인 parry window를 제품에 주입하지 않았다. PC 비투사체 패링·기존 Q/E·피해 수식은 수정하지 않았다.

| 범위·최신 원본 근거 | 구현·완료 경계 |
|---|---|
| G16633–16641/G31033–31097 선택 | `port_modules/elite_spawn_rules_source/producer.gd`. configure 1회, roll_elite/mods/aura 독립 API와 방어적 catalog 사본. **hell0 stage0..3만**, magic .03/rare0/champion0, 자연 magic은 M29/M30 중1개. tier0..3 순수 선택은 원 공격 우선/splice 순서, aura tier<2는 draw0/나머지 hell0 warCry draw1. 후속장 접사/오라 이식0·stage4 이상 NOT_READY. 메타데이터 M01~04를 실제 효과 입장으로 승격하지 않음 |
| G31131–31167 constructor 순서 | `constructor_prefix`를 type3 recipe·인트로 링·소환굴에서 원래 rollElite 위치에 재사용. 기존 journal 목적 이름 유지. elite1회→magic 때만 mods1회→기존 speed/radius→idle/facing→그 뒤 조건부 aura 위치 유지. prefix에 aura/RNG 선소비0, 보스/rare 제외 시 draw0. 원래 collision/safePt 거절보다 앞당기지 않음. type3 전체 constructor9/10 draws와 후속 literal/소환 FX interleave 보존 |
| G31038–31039/G38798–38809 owner | `elite_owner_attack_order/producer.gd`가 실제 같은 modT의 busy를1회 감소→M29 trigger→M30/zone update. M29는 기존 trigger/charge FSM 재사용. M30는 standalone advance_native의 기존 lock 감소를 유지하고 **advance_owner_managed**에서만 그 감소를 생략. type3 binder와 기존 type7 owner에 연결. 같은 tick 두 번 감소 금지, 다른 actor의 modT 혼입/누락 kernel/후속장 modifier 거절. 실제 World clock·RNG·이동/공격 writer 복제0 |
| G31620–31636 강제 후처리 | `apply_forced_constructor(raw,role)`는 완료된 미등록 constructor Dictionary에만 적용하는 hell0 API. 문지기 HP=ToInt32(mhp×4)→mhp, ATK×2→baseAtk, r×1.4, poise/maxPoise80, elite3, gate flag, dropTier2. 호위는 elite1→HP=ToInt32(mhp×2.5)→mhp만. mods/aura/쉴드·다른 필드 보존·RNG0·추가 등급 배율0. null 후대입의 원본 실패는 NOT_READY로 명시. **실제 etype29 constructor/문지기 G reference·등록 caller는 후행**, 이 API 성공을 실제 보스전으로 주장하지 않음 |
| PC/기존 carrier 경계 | 실제 M29 `player_context`/handle_m29_parry/FX/audio readiness 없이는 type3/native_type7 binding 거절. M29/M30 원소·피해·KB·패링 판단 수식 무변경. 기존 etype0 인트로/소환굴 carrier는 선택·stats·기록을 유지하지만 이 carrier의 접사 공격 consumer 전체 연결은 이번에 하지 않음. 일반 factory admission·다중 접사 actor·후속장 효과·오라 효과·자연 플레이 완료로 확대하지 않음 |
| 공용·성능 | Main/State/World/Player/hurtE/hurtP/저장/맵/export_ch1_area_source/export_ch2_area_resources **0줄**. 새 tick 목록 생성 API0. type7 owner context는 초기화 시 만들고 매 tick 기존 ref를 재사용. 기존7개 파일의 좁은 수정 범위는 아래에 명시. 성능 벤치/실제 FPS·GUI/PC 검증은 미실행 |

원본 대조는 `export_el01_hell0_oracle.mjs`가 Acorn으로 최신 game.html의 실제 정의를 발췌해 Node VM에서 실행한다. 제품 출력으로 기대값을 만들지 않았다. UTF-8 파일에 쓰고 Godot가 읽으며 Node 경로는 `--node-bin`으로 명시한다. OS.execute 출력은 오류 진단에만 join하며 JSON 권위로 사용하지 않는다. 원본 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` 및 발췌 행/해시를 oracle에 포함했다.

fixture 경계: constructor의 collision/safePt는 제공된 fixture 응답이며 STG의 사용되지 않는 `_plvMul` projection·ELC 색·GPU 자원은 서비스 scaffold다. HP/ATK/선택/constructor 본문은 원본이다. 비교는 공통 constructor leaf와 type3 자식 후처리 projection이지 전체337필드/실맵 충돌이 아니다. owner phase의 P 좌표는 실제 Godot Vector2 입력 경계와 같은 Float32 수를 원본 JS에 제공하고 값 비교는 정확한 수치로 했다. 그래픽/음향 함수는 phase fixture에서 요청만 기록하며 시각·청감 인수를 뜻하지 않는다.

| 검증(각 관련 suite1회) | 실제 결과·오류/경고 |
|---|---|
| 신규 test_el01_hell0 | **3,327/0**, exit0/ERROR0/WARNING0. 선택220·constructor72·forced12·owner phase162 = 원본466사례. catalog/잘못된 RNG·prefix 소비/다른 actor lock·후속장 거절 등 포함 |
| test_enemy_mod_m29 | **143/0**, ERROR/WARNING0. 기존 ledger 형식을 외부 runner가 그대로 해석 |
| test_m30_epicenter | **4그룹/0 failed assertions**. `__missing_required_M30_original__.png`를 일부러 주는 L329–336 거절 검사에서 정확히 ERROR1, expected_missing_resource_rejections=1, 미완 그룹0/exit0. 원 runner의 blanket ERROR 판정 false와 원로그를 보존하고 별도 classification JSON에 이 사실만 기록. 재실행/검사 변경0 |
| test_type3_spawn_recipe | **1,982/0**, ERROR/WARNING0. Git에 없던 기본 외부 fixture를 가짜로 채우지 않고 새 도구의 최신 원본 constructor72사례 파일을 --oracle로 제공, 기존 검사 전체1회 |
| test_type3_native_binding | **4그룹/0 failed assertions**, ERROR/WARNING0. 기존 540/480 owner phases와 lock78/54·birth53·원 damage/추가KB 호출 순서 검증 유지 |
| test_native_type7_runtime | atomicity 그룹 통과, assembly 그룹 **낡은 count 기대2실패**. 지원6/10→7/9를 기대하지만 현재 main의 실제 기본9/7→명시 설치 후10/6. owner phase/원본 payload/clock 검사는 추가 실패0, Camera WARNING1 |
| type7 기준 main 대조(실패 그룹만) | 기존7개 제품 파일을 base45be76e4의 byte로 임시 교체해 **똑같은 count2실패** 재현. own 제품 bytes는 finally 원래 SHA로 복원(`baseline-restoration.json`). 선재 낡은 기대값으로 판정, 다른 담당 테스트 수정/기대 삭제0. 전체 PASS로 숨기지 않음 |
| test_p2001h_curtain_spawn / test_p3002_spawn_holes | **124/0 · 298/0**, 각1회. 각각 Camera WARNING1, 소환굴에는 ObjectDB8 종료 누수 WARNING도 기록. 누수 원인의 main A/B 판정은 하지 않았으며 선재로 단정하지 않음 |

제품 수정 뒤 통과 suite를 반복하지 않았다. 초기 oracle 개발 중 browser window/global alias scaffold 오류가 있어 수정한 로그는 보존했다. 이 실패를 통과 수로 합산하지 않았다. import exit0/ERROR0/WARNING0. test7 기준 비교는 실패 판정에 필요한 해당 그룹만 실행했다. 위 결과는 서로 다른 검사 단위이므로 모두 합쳐 ‘전체 전투 PASS’로 표현하지 않는다.

기존 파일 최종 변경 행(정확한 diff는 `common-ranges.diff`/`common-final-ranges.json`): enemy_mod_m29.gd 74–76; native_m30_modifier.gd 128–141/151–152; type3_spawn_recipe.gd 8/58–61; type3_native_binding.gd 7/120/217–225; enemy_type7_physical_flesh_crawler.gd 7–11/56/90/173–178; native_intro_curtain_sequence.gd 58/271–276; native_spawn_hole_system.gd 30/539–542. 타입3 패링 caller L251과 기존 피해 계산은 무수정이다. 특히 HP authority는 기존 constructor 코드를 재사용하며 selector의 tier 배율은 읽기 metadata다.

재현 준비: 필요한 sparse 경로에 godot/tools·godot/tests·game.html·package.json/lock을 포함한다. Node 전체 경로를 사용하고 `npm ci --ignore-scripts`로 Acorn을 준비하거나 `--acorn-root=<이미 설치한 repo>`로 readonly 의존을 제공한다(이번에는 기존 main repo의 node_modules 사용, 신규 설치/lock 변경0). 먼저 `export_el01_hell0_oracle.mjs --source-game=<최신 game.html> --output=<UTF8 oracle> --constructor-output=<기존 type3 test용 파일>`을 실행할 수 있다. 신규 test는 같은 옵션을 Node로 전달하며 `--node-bin=<절대 경로> --acorn-root=<repo> --oracle-out=<파일> --constructor-out=<파일>`을 받는다. 기존 recipe test에는 `--oracle=<constructor 파일>`을 넘긴다. 최소 격리 복사본은 새 selector/owner port_modules 의존도 포함하고 class-name import를 수행한다.

신규 격리 이름 `EXODUSER-el-01-Isolated-20261021`; 기존 상수가 있는 검사는 그 이름, 상수가 없는 순수 fixture는 신규 격리 이름을 사용했다. 모든 Godot 실행 전 pgrep 수2 이상이면30초 대기, override는 finally 제거. 실제 사용자 게임 저장 폴더 접근·복사0. 원로그 `~/exoduser-wt/_out/el-01/`에 source/결과/실패 비교/복원/pgrep/의존/원격 확인을 보존한다. R tracked branch/HEAD/INDEX/WORK 불변 확인 후 자기 브랜치 일반 push·원격 SHA 일치·DONE 작성·자기 worktree 제거한다.

후행: PC M29 실제 서비스 인수/merge 및 caller 연결, etype0 carrier의 실제 modifier consumer, 문지기 constructor/등록/G reference 접점, 일반 자연 actor admission·전체 source33x/시각/청감/PC 검증. type7 count 기대값은 해당 테스트 소유자에게 별도 정합 수정을 인계한다. 후속장 선택/효과와 EL 전체35stage 완료는 미확인/미구현이며 이번 결과로 승격하지 않는다.
