# IT-06 — 단건 리롤 권위 접점 확인 / BLOCKED

2026-10-20 KST · 작업ID `it-06` · **구현 중단: META 재화·INV 변경·TI-04 실행 중 갱신 권위 인수 필요.** 순서안은 IT-08까지 남아 있다. 다음 단위로 진행하지 않는다.

사용자 최신 지시 “다음 단위가 공용 수정을 요구하면 구현하지 말고 필요한 줄·위치·근거만 보고하고 멈춥니다”를 적용했다. 신규 producer·테스트·writer adapter·읽기 전용 계획 코드도 만들지 않았다. 아래는 소유 담당에게 필요한 접점을 전달하는 정적 확인 결과다.

## 기준과 의존

| 항목 | 확인 결과 |
|---|---|
| 최신 main | 명시 fetch 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`를 고정하여 조사 |
| 선행 의존 | IT-05 `31eb4e125a70892fa04d6ff2384a454c25fb7146`의 main ancestor 검사 exit1. 지시대로 이 끝에서 `codex/it-06-20261020` 분기. IT-01 c01766e1 → IT-02 f7230588 → IT-03 50d1a5a0 → IT-04 b950095b → IT-05 31eb4e12 의존 포함 |
| 작업 공간 | `git -C R worktree add --no-checkout -b codex/it-06-20261020 ~/exoduser-wt/it-06 31eb4e125a70892fa04d6ff2384a454c25fb7146` 후 no-cone sparse-checkout/read-tree. AGENTS·hook·ignore·docs-sync-check·이 보고서 경로만 배치. 생성 직후 약48KiB, 웹 대용량 에셋/엔진 cache 배치0 |
| 지시서 | 최신 main `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md:201`: META 재화·TI-04 refresh·INV writer 필수, 부재 시 readonly 계획까지만, 새 mats writer 우회 금지. :207~218은 공용 접점 보호 명시 |
| 원본 | 같은 main `game.html` 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 아래 행 번호는 이 고정 blob 기준. 지시서 G:50837 인용은 현재 실제 callback :50836으로 보정 |
| 실제 변경 | 이 보고서1경로. 제품 코드·새 테스트·공용 파일·다른 담당 파일·CHANGELOG_SYNC 변경0. 문서만 stage하므로 정상 docs-sync hook의 코드 변경 조건에 해당하지 않음. hook 우회0 |
| 비교 범위 | 아래 State·Services·Main·AffixReader 및 기존 P2-001c 생성기는 최신 main과 IT-05 tip 사이 diff0. 선행 미병합 때문에 최신 권위가 빠진 것으로 오인하지 않도록 양쪽 확인 |

## 원본에서 반드시 지킬 줄과 순서

| 최신 main game.html 위치 | 그대로 인수할 동작 |
|---|---|
| :28080~28084, :50458 | `_MALICE_COST_MUL=0.5`, `_malCost(v)`는 양수에 `max(1,ceil(v*0.5))`. `REROLL_COST=_malCost(200)`의 실제 비용100 |
| :50460 | `item.affixes=rollAffixes(item.rarity,item.slot)`. brType 전달 없음. 이름·implicit·special·socket 등 다른 필드를 다시 생성하거나 덮지 않음 |
| :50836 | `G.mats<REROLL_COST`면 notify 후 return → `G.mats-=REROLL_COST` → `rerollAffixes(rIt)` → `SFX.forge()` → `addTxt(...)` → `recalcSt()` → `applyStats()` → `renderForge()` → `dbSaveNow()` 순서 |
| :16425~16426 | `recalcSt()` 시작에서 `_eqAffixCache`, `_eqStatCache`, `_lEqCache` 모두 null. 어픽스 캐시 하나만 지우면 원본 갱신과 다름 |
| :15131~15174 | 기존 rollAffixes의 후보·RNG·순서 재사용. native `kill_reward/drop_item_source.gd:30~40,50~67`에 주입 RNG와 `roll_affixes(grade,slot,br_type,plv)`가 이미 있음. :60의 brType 후보 필터 때문에 item.brType를 임의 전달하면 원본 리롤과 달라짐. 생성기 수정/복제0 |

저장 호출은 원문 근거이며 이번에 세이브 writer를 구현하거나 저장 범위를 승인한 것이 아니다.

## 필요한 공용 접점과 현재 막히는 근거

행은 최신 main의 현재 코드 위치다. 아래 파일을 수정하지 않았다. 실제 추가 줄 수는 소유 담당의 API 계약이 확정되지 않아 산정하지 않는다.

| 담당·필요 위치 | 현재 근거와 인수해야 할 최소 계약 |
|---|---|
| META / `godot/scripts/native_source_new_run_state.gd:175~185,478~486` 부근 | read_current_g/inventory는 현재 Dictionary 참조를 돌려주지만 리롤 변경 권한이 아님. :478 주석과 :479 `apply_native_skill_cast_cost`는 P2-005b 스킬 시전 전용, :480은 :314~317의 실제 피해 실행자 owner 검사 사용. 이를 리롤 비용100 차감에 전용하지 않는다. META 소유 담당이 실제 현재 G에 대한 리롤 비용 검사·차감의 호출자/생명주기 계약을 제공해야 함 |
| INV / 같은 파일 :828~849 부근 | `_equip_initial_starter_slot`과 `_append_initial_starter_bag`는 `_initial_starter_running`일 때만 실행되는 초기 지급 전용. 현재 선택된 실제 장비 identity를 검증하여 affixes만 교체하는 리롤 writer 계약이 아님. INV 소유 담당의 현재 item 확인·교체 권위 인수 필요. getter가 준 참조에 직접 `item["affixes"]=...`로 우회하지 않음 |
| G 피해 writer / 같은 파일 :204~208,224~249 | mats가 hurtE 쓰기 whitelist에 있어도 :225~228은 실제 피해 실행자/월드/일시정지 검사. 피해 writer를 리롤용 임의 G setter로 사용하지 않음 |
| TI-04 / `godot/scripts/native_source_player_initialization_services.gd:569~599` 부근 | `_write_sink`와 `_invalidate_sink`는 :573~578에서 player가 트리 밖·미ready·부모 null일 때만 허용. :581~587은 초기화 packet/source16934 및 dispatcher 초기화 active까지 검사. :595~596의 두 캐시 무효화는 실행 중 리롤 후 recalc/apply 권위로 사용할 수 없음. 실행 중 원본 recalcSt→applyStats 순서를 보존하는 refresh 계약 인수 필요 |
| TI-04 / `godot/port_modules/equipment_affix_reader/producer.gd:102~117` | invalidate_affix_cache seam은 이미 있지만 호출자에게 live inventory 변경·전체 능력치 갱신 권한까지 주지 않음. 이 파일도 다른 담당 소유로 수정0 |
| Main / `godot/scripts/main.gd:79,2320~2329,2561~2574,2603~2632` 부근 | 실제 affix reader와 별도로 `_source_l_eq_cache`를 Main이 소유. :2565~2567에서 lazy rebuild. 기존 초기화 무효화 sink는 이 Main 캐시를 포함하지 않음. TI-04가 현재 bundle/provider identity 및 세 캐시→재계산→자원 적용을 연결할 소유 계약을 인수해야 함. Main에 새 리롤/refresh 호출을 추가하는 변경은 현재 배정의 공용0줄 제한 밖 |

따라서 현재 인수된 API만으로 실제 단건 리롤 명령을 연결하면 스킬/초기화 전용 권위 재사용, getter 참조 직접 쓰기, 새 mats writer 또는 공용 변경이 필요하다. 어느 경로도 이번 배정에서 수행하지 않는다. META·INV·TI-04가 위 접점의 실제 API와 호출 소유를 인계한 뒤 재배정이 필요하다. 새 API 이름·writer·통과용 대체 권위는 만들지 않았다.

## 실제 수치와 미실행 범위

| 항목 | 실제 결과 |
|---|---|
| 구현/공용 수정 | 신규 제품 파일0, 신규 테스트0, 공용 수정0줄, 다른 담당 수정0줄 |
| Godot/회귀 | Godot 실행0. 신규·test_contracts·test_p2001c_kill_rewards·IT-01~05 회귀 모두 미실행. PASS 주장0. 실행이 없어 pgrep gate·격리 override 생성도0 |
| 격리 이름 | 재개 시 신규 테스트는 사용자 지정 `EXODUSER-it-06-Isolated-20261020`; 기존 회귀는 각 파일 상수. 이번 user://·override·세이브 접근0 |
| P2-006a | 기준 main/IT-05 tree의 native_world_drops/world_drops/pickup_contract 경로 미발견. 이동·구현·수정0. 타 worktree 파일 조사/변경0 |
| 알려진 로비 | 총괄 전달 원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번 독립 재현·수정·추가 PASS 주장0 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 tracked INDEX/WORK diff0. R 코드/INDEX/branch·실행창·서버 조작0.fetch/ref·worktree 관리 메타데이터만 사용 |

## 제출과 원로그

`~/exoduser-wt/_out/it-06/start-snapshot.json`에 기준·의존·R 상태·원본 해시·양 기준 공용 diff를 기록했다. `authority-evidence.txt`에 위 고정 main blob의 실제 행 발췌, `game-latest-main.html`에 원본을 보존했다. 최종 제출 SHA·원격 일치·수치는 `DONE.txt`와 `submission-receipt.json`, worktree 제거 결과는 `cleanup-receipt.json`에 기록한다. 보고서 사본은 같은 OUT의 `review/it-06_REPORT.md`에 남긴다.

자기 브랜치만 정상 commit·비강제 push하고 원격 SHA 일치를 확인한 뒤 DONE을 작성하고 자기 sparse worktree를 제거한다. main push·force·git add -A·hook 우회0. 이 제출은 **BLOCKED 근거 보고 완료**이며 IT-06 구현 완료가 아니다. IT-07 착수0.
