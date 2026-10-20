# P2-008a-FIX — 빙결전사 상속 포이즈 필드 소유권

## 판정

**STATUS=REVIEW_PENDING**. 제품 halt 수정 후, 사용자 `[Mac Claude 맥북총괄]`의 최신 검수 지시에서 `proposed-p1002g-accounting.patch` 적용을 명시 승인했다. 승인된 기존 테스트 집계 정정(+4/−2줄)을 적용한 실제 worktree에서 **p1002g 3회 모두220검사/0실패·halt0·ERROR0·SKIP0·exit0**, 필수 회귀15종 모두0실패를 확인했다. 기존 종료 리소스 ERROR는 QA-003이 진단 중인 선재 문제라는 사용자 판정에 따라 원문을 별도 보존한다.

## 승인 판정·집계 정정

- 승인 근거: etype20도 실제로 처치되므로 전역 G 보상 기대값은 추적 여부와 무관한 모든 `ok=true && killed=true` kiSlash 결과를 포함해야 한다. 기존 `tracked` 필터 앞에서 처치 수·HP물약 전환 보상을 집계하도록 옮긴 **기대값 계산 정정**이다.
- `_verify_kill` 및 추적6개체별 피해/포이즈/처치/RNG 검증은 그대로다. `_check` 정의1곳·호출43곳과 모든 호출문·비교식/임계값·그룹·격리 상수를 유지했고 실제 검사 수는 매번220이다. `approved-test-source-audit.json`에서 이전 검토 사본과 수정 바이트 동일, `_verify_kill` 이후 전체 함수 동일을 확인했다. 단정 삭제·완화0.
- 원본 game.html:42702 모든 처치마다 G.kills/_stageKills 증가,42714–42716 combo/비보스 timer+60 cap1200,42756–42758 chain 증가/5에서0,43103 mats+4,43093–43096 물약 및28249–28255 hp물약 즉시 mats 전환. 원본에 테스트의 추적6개체 한정 조건은 없다. 발췌 `approved-source-reward-lines.txt`.
- 전후: **220/1·halt6 → 제품 수정 후220/6·halt0 → 승인 집계 정정 후220/0·halt0(3회)**. 최초 실패와 미승인 사본 결과를 보존하며 승인 후 실제 worktree 재실행과 구분한다.

| 승인 후 실제 실행 | 검사 / 실패 | halt / ERROR / exit |
|---|---|---|
| 1회 / approved-p1002g-01 | 220 / 0 | 0 / 0 / 0 |
| 2회 / approved-p1002g-02 | 220 / 0 | 0 / 0 / 0 |
| 3회 / approved-p1002g-03 | 220 / 0 | 0 / 0 / 0 |

격리 이름은 변경 없이 파일 상수 `EXODUSER-P1002G-Isolated-20261020`이다. 세 실행의 출력·오류·엔진 로그 및 실행 메타데이터는 각각 `approved-p1002g-01.*`, `-02.*`, `-03.*`에 저장했다.

## 기준·원본 근거

- R=`/Users/fordeargamers/Projects/exoduser-migration-20261001` 불변. 기존 `~/exoduser-wt/p2-008a-fix`가 없어 fetch 후 최신 origin/main `284d7faf49295b2f5061937a47ce96038032ed3c`에서 `codex/p2-008a-fix-20261020` 생성. R의 기존 미추적/WIP 수정·stage 없음.
- game.html SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65,693줄. 원본·encounters.json 변경0.
- 원본 30887–30888 ETYPE_POISE[0]=12 / [20]=15이나, 실제 mkEn31164가 **poise=maxPoise=_hp**로 설치하므로 exact type0 및 type20 세 프로필의 실제 초기값은875다. order4는 이후 elite 보정된 HP2187과 poise875를 혼동하지 않는다.
- 원본 _poiseHit19973–20001: !alive/amt<=0 무변경 false; poise-=amt, poiseR=0; 붕괴 시 poise0, stunned=max(현재,180), _maxStunned=max(현재 또는 부재0,180). 보스 _pImmune 분기는 이번 exact 비보스에 비활성. 42490의 amt는 쉴드 흡수 후 잔여 피해이며 코어 이후 원래 hurtE의 후속 owner를 유지한다.

| 허용 etype | 정확 개체 / 근거 | 보존 조건 |
|---|---|---|
| 0 | ch1_initial_015 / order14, mkEn31164·_poiseHit19973–20001 | elite0·el0 physical·mods[]·crawler exact script |
| 20 | ch1_initial_005 / order4 | elite1·el0 physical·mods[]·ib=false·ice-warrior exact script |
| 20 | ch1_initial_011 / order10 | elite0·el0 physical·mods[]·ib=false·ice-warrior exact script |
| 20 | ch1_initial_013 / order12 | elite0·el4 lightning·mods[]·ib=false·ice-warrior exact script |

## 수정과 보호

- `enemy_melee_flesh_crawler.gd`: 기존 type0 정확 프로필 검증을 virtual predicate로 분리해 configure와 현재 호출 검사에서 재사용. actual World/등록/부모/트리·호출 owner·legacy pending·필드 모양·포이즈 타입/유한수 검사 보존. scope 문자열은 실제 etype을 보고한다.
- `enemy_melee_ch1_ice_warrior.gd`: type20의 위 세 프로필만 override로 명시 허용. 상속 파생 타입21/47과 다른 id/order/script/속성/elite/mods는 계속 거부한다. etype 검사 단순 삭제0, halt 감춤0, 대체 피해 경로0, 원본 수치 변경0.
- 제품 diff: crawler +7/−3, 빙결전사 +8/−0 (계15추가/3삭제). 새 테스트 `test_p2008a_fix_poise.gd`는 명시 fixture를 사용하는 actual Main/World 검사다. 후속 승인으로 기존 `test_p1002g_kislash_hurte.gd`의 전역 보상 집계만 +4/−2줄 정정했으며 검사는 유지한다.
- 공용 `main.gd·hud.gd·world.gd·player.gd·native_normal_enemy_hurte.gd·native_source_new_run_state.gd` 모두 **0줄**, P2-008b 제품 파일·factory·원본 에셋·세이브·Q/E·보호 docs2_3 변경0.
- docs 전체 관련 키워드 검색은 `docs-all-keyword-audit.log` 및 몬스터/AI 검색 `docs-keyword-audit.log`로 보존. P2-008a 정본의 피격 경로를 실제 v3 소유권과 동기화하고 기존 보고서는 당시 검수 이력으로 보존한다.

## 검증·실패 원로그

엔진 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, 4.7.2.stable.official.ed1daf0bf. 원로그 `~/exoduser-wt/_out/p2-008a-fix/`의 각 `<label>.out.log/.err.log/.engine.log/.json`. 실행기는 같은 경로 `run.py`다.

```text
python3 ~/exoduser-wt/_out/p2-008a-fix/run.py import
python3 ~/exoduser-wt/_out/p2-008a-fix/run.py red
python3 ~/exoduser-wt/_out/p2-008a-fix/run.py regression # 승인 전 로그 보존
python3 ~/exoduser-wt/_out/p2-008a-fix/run-approved.py # 승인 후 p1002g3회 + 회귀15종
Godot --headless --path <project> --log-file <원로그> --script res://tests/<test>.gd
```

매 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인, 2 이상일 때30초 대기 후 재확인했다(`godot-count.log`). 새 검사는 `EXODUSER-p2-008a-fix-Isolated-20261020`, 기존 회귀는 각 USERDIR/ISOLATED_DIRECTORY 상수를 읽어 적용했다(상수가 없는 순수 fixture는 작업 격리명). override.cfg는 매 실행마다 기록하고 finally에서0byte로 비웠다. 순차 회귀이며 별도 PC snapshot 검사도 Mac 전체2개 한도를 동일하게 적용했다.

| 단계 | 실제 수치 |
|---|---|
| 수정 전 p1002g | **220검사/1실패**, halt6, exit1. 원 실패와 로그 보존 |
| 신규 집중 검사 | **80검사/0실패**, exit0·ERROR0. exact3프로필·foreign caller/id/order/etype/el/elite/mods/pending 거부, dead/amt0/nonbreak/break/max 보존, 실제 hurtE42490+후속 owner 완료 |
| 원본 JS 발췌 oracle | game.html19973–20001을 Node vm으로 직접 실행한5경계. 무변경/nonbreak/break180/max240·300을 확인. SFX·텍스트·입자는 대역이므로 실제 화면/효과 동등성 근거 아님 |
| 수정 후 기존 p1002g | **220검사/6실패**, halt0, exit1. 추적 대상6개체 전투 검사는 유지·완료됐으나 비추적 etype20 처치까지 증가한 G.kills/_stageKills/combo/comboTimer/_chainCnt/mats를 기존 tracked-only 기대값이 누락 |

| 승인 후 필수 회귀 재실행 | 검사 수 / 실패 | exit / ERROR / WARNING |
|---|---|---|
| test_contracts | 5 / 0 | 0 / 0 / 0 |
| test_p2002a_hud | 36 / 0 | 0 / 0 / 2 |
| test_p2002b_minimap_corner | 16 / 0 | 0 / 0 / 1 |
| test_p2001h_curtain_spawn | 124 / 0 | 0 / 1 / 2 |
| test_p2001i_boot_intro | 18 / 0 | 0 / 0 / 1 |
| test_p2001j_lesson_clock | 21 / 0 | 0 / 1 / 2 |
| test_p2001k_lesson_practice | 32 / 0 | 0 / 0 / 1 |
| test_p2001l_lesson_steps | 66 / 0 | 0 / 0 / 1 |
| test_p3002_spawn_holes | 298 / 0 | 0 / 0 / 2 |
| test_p3003_regions | 43 / 0 | 0 / 0 / 1 |
| test_native_main_source_starter_state | 148 / 0 | 0 / 0 / 1 |
| test_encounter_factory | 3 / 0 | 0 / 0 / 0 |
| test_p1002e_melee_hurte | 93 / 0 | 0 / 0 / 2 |
| test_p1002f_dedicated_hurte | 357 / 0 | 0 / 0 / 2 |
| test_native_qe_binding | 155 / 0 | 0 / 0 / 1 |

승인 후 회귀15종 **1,407 assertion/check + 8 case, 0실패·모두exit0·SKIP0**. 각 원로그 접두는 `approved-test_`이며 이전 회귀 로그는 덮어쓰지 않았다. stderr ERROR 합계2건은 아래 원문이며 assertion 성공과 별도로 기록한다.

`test_p2001h_curtain_spawn` — 사용자 판정: QA-003 진단 중인 선재 종료 리소스 문제.

```text
ERROR: 1 resources still in use at exit (run with --verbose for details).
   at: clear (core/io/resource.cpp:822)
```

`test_p2001j_lesson_clock` — 사용자 판정: QA-003 진단 중인 선재 종료 리소스 문제.

```text
ERROR: 1 resources still in use at exit (run with --verbose for details).
   at: clear (core/io/resource.cpp:822)
```

`test_p2001k_lesson_practice` — 사용자 판정: QA-003 진단 중인 선재 종료 리소스 문제.

```text
이번 재실행 ERROR 없음
```

Camera2D physics interpolation 및 ObjectDB 누수 경고도 원로그를 보존하며 무경고 PASS로 표시하지 않는다. 헤드리스 fixture/공개 request_attack 검수이며 실제 사람 입력·화면·성능·전체 이식 인수는 아니다.

## PC P2-008b 재현 전용

PC 원본은 수정하지 않고 `git archive <고정SHA> godot`로 원로그 하위 독립 snapshot을 만들었다. 추가 진단 스크립트만 별도로 넣어 actual Main·source record order11/9를 조회하고 shield0/base100/poiseHit=true의 명시 fixture로42490에 도달시켰다. branch 소유 원본1279/1284파일의 실행 전후 SHA-256 변경0(`pc-source-unchanged.json`, `pc-b406-source-unchanged.json`). PC 실제 컴퓨터에서 실행했다는 뜻이 아니다.

| 고정 PC ref | order11 / etype47 | order9 / etype21 |
|---|---|---|
| 첫 tracking snapshot f48c94eb6c4067646e3ee7c977266d397c700e08 | **42490 source_field_call_unavailable 재현**, field read exact_normal_factory_actor_not_owned | 아직 factory 미지원, actor 없음 → 같은 halt 여부 판정 불가 |
| 재조회·명시 fetch한 최신 b406e4bc4c104ff42144c3222f7356858959873e | **같은 halt 미재현**, hurtE ok=true·poise100·owner_core | **같은 halt 미재현**, hurtE ok=true·poise100·owner_core |

최신 PC본은 source-field read가 거부되더라도 기존 owner_core 분기로 포이즈를 처리한다. 본 수정의 v3 profile 허용 정책을 PC 파일에 적용하지 않았다. 로그 `pc-poise-repro.*` / `pc-b406-poise-repro.*`를 버전별로 구분한다.

## 제출

브랜치 `codex/p2-008a-fix-20261020`, 자기 브랜치만 정상 commit/push 후 원격SHA 대조. main push·force·git add -A·훅 우회0. `docs/CHANGELOG_SYNC.md` 맨 위에 같은 형식의 절 추가. 최종 SHA·수치·인수 상태는 원로그 `DONE.txt`에 기록한다. 기존 제품 수정 커밋 `c049b2ca880d76111c38339aed36810a93627489` 위에 승인된 집계 정정·본 보고서·CHANGELOG 절만 후속 커밋한다. 최종 상태는 `REVIEW_PENDING`이며 최종 인수 판정과 main 반영은 별도다.
