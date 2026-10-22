# INTEG-12b — 하니스 회귀 보완과 단회 검수

기준 `8d323e2b65c7885a586f5cf32511dde03a1862c7`, 같은 `codex/demo11-integ12-20261022` 브랜치. 제품 화면·PC 코어·PC 소유 테스트·port_modules 변경0. 원본 날짜별 INTEG-12 수치는 이력으로 보존한다. 실행 source는 별도 `~/exoduser-wt/INTEG-12b/godot`; R은 읽기/Git fetch만 수행하며 Godot/import를 실행하지 않았다.

## 수정 계약과 원본 근거

| 대상 | 이전 기대/문제 | 현행 하니스 계약 | 원본/인수 근거 |
|---|---|---|---|
| 47h 생성 직후 | `_create()` 직후 Main만 기다림 | child_entered_tree로 생성 owner를1회 관측(프레임별 child-list 조회0), playing warrior 존재를 검사하고 실제 Space press/1350ms/release. 완료 메서드·타이머 주입0 | `character-story-player.js:4,51–60` HOLD_MS1200; `index.html:3421`; `parity_video_intro.gd` warrior96.4초 |
| 47h 최초 로비 | 초기 gate/world 영상 아래 버튼 callback을 호출해 pause 중첩 | 로비 생성 후 deferred 시작을 기다린 뒤 실제 ESC5150ms, pause 해제 확인 후 슬롯 선택 | `index.html:2509–2550`, `PARITY_INTRO_01_20261022.md` ESC5000ms; `native_demo_lobby_screen._ready/_play_cinematic/_launch_entry` |
| 47h 첫 진입 | held-key 실패 시 `story.finish`/guide signal 폴백 | INTRO 실제 Space2150ms, guide 실제 Space2150ms. 두 폴백 제거. 레슨은 기존 skip_all UI endpoint 유지 | `game.html:62910–62944`, `native_story_intro.gd` HOLD_MS2000 |
| 47h 플레이 입력 | 과거 tracked 47h의 위치·drop·EXP 보충 fixture | INTEG-12 외부 strict 하니스를 tracked 47h로 회수. 위치/facing 쓰기 대신 실제 이동/조준; drop append/EXP 보충 제거. 단계 조건·의존성/Retry/최종사망 신호 검사는 유지 | 기준 `_out/INTEG-12/e2e-strict.gd`; fixture를 natural E2E로 판정하지 않음 |
| 42 실패띠 | 사용자에게 legacy 자체 실패문구 표시 | failure_reason은 엄격히 유지, 웹에 없는 실패띠는 빈 표시값/비가시 검사 | `PARITY_HUD_01_20261022.md` H11; `native_demo11_hud_owner.gd` |
| 42 보스 HP | 내부폭500/부분312.5px | 외부500×14, border1, 내부498×12/부분311.25px, overmax498px. 실제 HP/비율·readonly 검사는 유지 | 고정 `godot/source_snapshot/game.html:387–396`; `PARITY_BOSS_01_20261022.md` M9 |
| 42 MP/SP | legacy ST/MP multirow Label 가시성·즉시 shader값 | 실제 WebOrbTrim 연결·숨긴 legacy 라벨·원본 `/228` 형식·독립 MP/SP 비율. pause 중 실제 UI owner .05초12샘플로 .5초 보간 종료값 검사. owner 미연결 시 새 값 생성0/기존 fill 보존 | source `2639–2662,60300–60305`; `PARITY_HUD_02_20261022.md`; gameplay tick/State 변경0 |
| 44 field final | 부팅 후 가짜 두 번째 PC owner 연결을 성공으로 기대 | 실제 부팅 PC owner가 연결돼 있고 교체가 거부됨을 검사. 기존 owner의 `field_boss_health` 신호를 명시적 fixture로 발행해 family_done·observer 검증. 자연 처치 주장0 | native_field_mob_hit_owner EVENT, anglers 단일 binding; source `60973–61141` |
| 44 iris | marker 위치로 옮겨 demo_iris_key="boss"만 기대 | 실제 boss sample 위치에서 원본10회 재탐색 cadence 진행. ens에 등록된 실제 PC boss body 선택·alive·demo 대체키 공백을 모두 검사 | source `41517–41532`: ens 순회·800px·엄격한 `<`; 같은 거리 대체 sample은 실제 ens body를 이길 수 없음 |
| arena preview | 제품 main_scene=main.tscn | 보존된 원형 프리뷰 검사는 유지하고 웹 index 대응 demo_lobby.tscn 진입을 검사 | `index.html`, `PARITY_INTRO_01_20261022.md` |
| field_runtime | 개념맵 FieldMarkers/4굴32분모/R1700/3px 도착 | WebMarkers22(4field+14굴+4fieldboss), anchors22,14굴/분모168, source count8/15, source field tile+prop·사각 아레나 경계/실제 wall·gate callback·stale/retire 검사. flow는 원본40px 목표 cell 도착, blocked gate 목적지 거부 | source `30491–30599,31030,31744–31785,31847–31908,60692–60694`; `PARITY_MAP_01_20261022.md` 소환굴14/168; BOSS01 M10 사각124×104 |
| product | 개념 early/main/late 경유점·4굴·R1700 | 실제 Main/source start·14굴·prop LOS·남측16개 swept step·명시적 gate-contact fixture·현재 사각경계. State/카메라/HP 보존·default gate denial·별도 transport·retire 검사 유지 | `godot/data/map.json`; source `30042–30050,31682–31712`; transport는 E2E 증거 아님 |
| Mac storage 경계 | non-demo namespace에서 demo persistence ON이 Main boot 차단 | 공통 Mac 하니스가 명시 storage 인자 없을 때만 정확한 fresh-Main fixture5종(move/starter/etype15/product/intro01)에 off 추가. 명시 on 및 제품/E2E on은 보존. C15 정확한 테스트 namespace만 추가 허용 | `PARITY_INTRO_01b_20261022.md`; 실제 저장 EXODUSER-Godot-Native-First 거부 유지 |
| 결과 수집 | `_FAILS []`를 오류로 오인/문자열 RESULT를 JSON으로만 파싱 | 실제 ERROR:/SCRIPT ERROR/_FAIL 행·exit·실패 집계를 유지. 빈 정보배열은 실패로 오인하지 않음. key=value RESULT의 failures 필수 파싱, 불명 형식은 실패 | INTEG-12 원로그/`mac_harness.py`; 원로그/실패값 수정0 |

## 검수 제한 — 실패 후 보완과 검증 완료를 구분

사용자 제한대로 suite 각각1회, E2E1회. 최종47h는 기존 runner의 USERDIR 기본값을 보존하고 `--isolated-userdir=EXODUSER-demo11-…Isolated…`로 별도 namespace를 지정할 수 있다(실제 override 일치·demo11 prefix·Isolated 필수). 이번 단회 실행은 고유 INTEG12b namespace를 상수로 지정했던 보완 중간본이며, 최종 인자 방식도 재실행하지 않았다. 44_pets의 첫 보완본은75검사1실패(실제 ens boss body 선택을 demo key로 잘못 기대). 최종 body identity oracle은 이후 정적 보완으로 **재실행 미검증**이다. field_runtime 첫 보완본은94검사16실패: count의 si0 이중 ceil 누락14건·합계 잘못900 기대1건·source 목표 cell 도착을3px로 오인1건. 최종 기대값8/15·168과40px cell 도착으로 원본 근거에 맞춰 수정했으나 **재실행 미검증**이다. 실패를 PASS로 재표기하지 않는다.

E2E 단회는 실제 warrior Space hold를 통과하여 launch callback까지 갔으나, 초기 lobby 영상 아래 버튼을 호출해 warrior의 `_was_paused=true`를 상속했다. 코드 대조상 Main dispatcher의 `initialization_world_paused` 계약이 부팅을 거부한 것으로 추론하며 (내부 snapshot을 출력한 실측은 아님), 뒤의 request_native_lobby_entry에서 null select 오류가 발생했다. 별도 제품 수치/PC 초기화 결함으로 단정하지 않는다. **최종 초기 lobby ESC prefix는 실패 후 보완으로 재실행 미검증**이다. 실패 당시 엔진 오류를 guard가 수집하고 자기 자식만 종료했으므로 하니스의18단계 RESULT는 생성되지 않았다. 외부18행 보고는 관측2PASS·character_create 오류중단·뒤15행 NOT_REACHED를 구분한다.

PASS13 목표 미달. bossroom_gate 및 이후 실제 도달0. Retry 버튼까지 도달0이므로 life.gd:180 오류 재발0은 검증하지 못했다. 오류 로그에서 그 오류가0건인 것을 실제 Retry 검증으로 바꾸지 않는다. 제품 화면 변경이나 무주입 판정 약화로 경로를 뚫지 않았다.

## 이전 나머지 non-PASS7 원인 분류

| suite | 분류 | 처리/잔여 |
|---|---|---|
| arena_preview | Mac legacy entry expectation | main_scene 기대 교정; 단회35/0 |
| field_runtime | Mac legacy geometry/flow fixture | 현행 wrapper 계약으로 보완; 첫 단회94/16, 후속 정정 미검증 |
| etype15_runtime | 하니스 storage 수집/실행 경계, PC 소유 oracle 보존 | off 명시 후 단회151/0; 테스트 수정0 |
| native_main_source_starter_state | 하니스 namespace + 새 엔진 런타임 중단 | off로 Main boot와 앞4그룹129검사0실패까지 확인. 마지막 lifecycle 중 native Godot signal11/exit-6, GDScript backtrace life._capture_replay:310. GUI 표시 변경·PC 테스트 수정0, 원인 전체 미확정/미해결 |
| product | Mac namespace + 개념맵 fixture | off 및 웹 geometry 기대 수정; 단회47/0 |
| pc_boss_core | PC 테스트/통합 clock·intro 경계 | 외부 wrapper로 논리 root.show + storage off만 제공. 여전히 idle300/boss_pattern_states 실패. PC 코어·테스트 수정0; PC 원인으로 확정하지 않음 |
| pc_combat_pack_b_mac | PC oracle와 Mac source map carrier wall 경계 | 원본 wall 모델 대조/kill_pierce·bounce 등29실패 유지. PC 테스트·oracle 수정0 |

추가 단회에서 `intro01`은 story null로 중단됐다. 메타 native_story_boot=true보다 saved-run restore 분기가 먼저인 Main:447–453 코드 경로에 따라, 재사용 격리 namespace의 저장 복원을 원인으로 추론한다. 첫 진입 owner 단위검사에도 fresh-Main storage off 경계를 추가하고 owner 부재 시 명시적 FAIL/종료를 남겼다. 최종 수정은 재실행 미검증이다. `pc_boss_parity`도 기존 PASS에서 body overlap/pattern idle900 2실패로 바뀌었다. PC 테스트/코어 수정0, clock/intro 통합 경계 미확정이다.

추가 단회에서 `p1002f_dedicated_hurte`는 setup32검사0실패 뒤 dummy texture의 `Parameter "t" is null`로 guard 종료(exit-15)했다. 기준에서는 PASS였으므로 새 non-PASS로 별도 보존한다. PC 테스트/코어는 수정하지 않았고 렌더러/수명 경계의 정확한 원인은 미확정이다.

실패 후 수정한47h·44_pets·field_runtime은 최종 `--check-only` 각1회 exit0으로 문법만 검증했다. intro01 후속 수정도 별도 --check-only1회 exit0/override 원복을 확인했다. 이는 suite/E2E 재실행이나 동작 PASS가 아니다. Python 하니스 문법 검사와 보존30b 로그의 오프라인 파싱/빈 FAILS·실제 FAIL 구분도 통과했다.

PC 실행/동기화는 미확인이다. Windows 결과를 Mac 단회로 대체하지 않는다.

## 단회 회귀 결과

58 suites 각1회: 50 PASS / 8 non-PASS. import1회 exit0/ERROR0. 30b만 보존 로그 오프라인 재파싱으로 분류하며 Godot 재실행0. 아래 실행 결과는 실패 후 최종 보완 코드의 검증을 뜻하지 않는다.

| suite | checks | failures | exit | error rows | result / note |
|---|---:|---:|---:|---:|---|
| 23b | 5 | 0 | 0 | 0 | PASS  |
| 30b | 34 | 0 | 0 | 0 | PASS raw metadata false; preserved-log collector audit 34/0 |
| 37 | 148 | 0 | 0 | 0 | PASS  |
| 41 | 66 | 0 | 0 | 0 | PASS  |
| 42 | 37 | 0 | 0 | 0 | PASS  |
| 43 | 40 | 0 | 0 | 0 | PASS  |
| 44_average | 5 | 0 | 0 | 0 | PASS  |
| 44_pets | 75 | 1 | 1 | 1 | non-PASS final ens-body identity correction after run; NOT REVALIDATED |
| AUDIO-01 | 30 | 0 | 0 | 0 | PASS  |
| BC01 | 681 | 0 | 0 | 0 | PASS  |
| BC02 | 5257 | 0 | 0 | 0 | PASS  |
| BC03 | 31976 | 0 | 0 | 0 | PASS  |
| BC04 | 21899 | 0 | 0 | 0 | PASS  |
| BC05 | 18424 | 0 | 0 | 0 | PASS  |
| BC06 | 14099 | 0 | 0 | 0 | PASS  |
| BC07 | 14531 | 0 | 0 | 0 | PASS  |
| BC08 | 24788 | 0 | 0 | 0 | PASS  |
| BC09 | 56664 | 0 | 0 | 0 | PASS  |
| BC10 | 165774 | 0 | 0 | 0 | PASS  |
| arena_preview | 35 | 0 | 0 | 0 | PASS  |
| bgm_override | 18 | 0 | 0 | 0 | PASS  |
| boss_actor | 165 | 0 | 0 | 0 | PASS  |
| demo11_17_skill_management | 105 | 0 | 0 | 0 | PASS  |
| demo11_23b_inventory | 1281 | 0 | 0 | 0 | PASS  |
| etype-b | 42 | 0 | 0 | 0 | PASS  |
| etype-f | 33 | 0 | 0 | 0 | PASS  |
| etype15_runtime | 151 | 0 | 0 | 0 | PASS  |
| field | 41 | 0 | 0 | 0 | PASS  |
| field_runtime | 94 | 16 | 1 | 16 | non-PASS final si0 count/target-cell correction after run; NOT REVALIDATED |
| field_walk | 49 | 0 | 0 | 0 | PASS  |
| hud02 | 26 | 0 | 0 | 0 | PASS  |
| intro01 | — | — | -15 | 1 | non-PASS  |
| native_main_source_starter_state | 129 partial | 0 partial | -6 | 0 | non-PASS native signal11 / exit-6; suite incomplete |
| outer | 26 | 0 | 0 | 0 | PASS  |
| p1002e_melee_hurte | 94 | 0 | 0 | 0 | PASS  |
| p1002f_dedicated_hurte | — | — | -15 | 1 | non-PASS  |
| p1002g_kislash_hurte | 221 | 0 | 0 | 0 | PASS  |
| parity_boss_01 | 276 | 0 | 0 | 0 | PASS  |
| parity_hud_01 | 17 | 0 | 0 | 0 | PASS  |
| parity_map_01 | 180629 | 0 | 0 | 0 | PASS  |
| parity_ui_01 | 7 | 0 | 0 | 0 | PASS  |
| pc_boss_core | — | — | -15 | 1 | non-PASS  |
| pc_boss_core_death | 73251 | 0 | 0 | 0 | PASS  |
| pc_boss_core_prefix | 25650 | 0 | 0 | 0 | PASS  |
| pc_boss_core_states | 30833 | 0 | 0 | 0 | PASS  |
| pc_boss_parity | — | — | -15 | 2 | non-PASS  |
| pc_combat_pack_b | 378 | 0 | 0 | 0 | PASS  |
| pc_combat_pack_b_mac | — | — | -15 | 29 | non-PASS  |
| pc_enemy_revive | 51 | 0 | 0 | 0 | PASS  |
| pc_final_death | 61 | 0 | 0 | 0 | PASS  |
| pc_m29_parry | 101 | 0 | 0 | 0 | PASS  |
| pc_move_skills | 256 | 0 | 0 | 0 | PASS  |
| pc_source_validation_cache | 280 | 0 | 0 | 0 | PASS  |
| pcia_wire_life | 12 | 0 | 0 | 0 | PASS  |
| pcib_mac_calls | 31 | 0 | 0 | 0 | PASS  |
| product | 47 | 0 | 0 | 0 | PASS  |
| seam | 18 | 0 | 0 | 0 | PASS  |
| stage_provider | 54 | 0 | 0 | 0 | PASS  |


## E2E 18단계 — 실행1회

관측2 PASS, character_create ERROR_ABORT, 이후15 NOT_REACHED. 하니스 자체 최종 RESULT/18행 JSON 미생성. 아래 미도달 행은 외부 보고 구분이며 하니스 verdict를 지어낸 것이 아니다.

| # | stage | 관측 결과 | 근거 |
|---:|---|---|---|
| 1 | isolation | PASS | actual stage result |
| 2 | new_game | PASS | actual stage result |
| 3 | character_create | ERROR_ABORT | real warrior Space reached Main launch; startup rejected/null select; guard stopped child |
| 4 | intro_skip | NOT_REACHED | Main startup failed before this stage |
| 5 | field_MAP11 | NOT_REACHED | Main startup failed before this stage |
| 6 | enemy_kill | NOT_REACHED | Main startup failed before this stage |
| 7 | item_pickup | NOT_REACHED | Main startup failed before this stage |
| 8 | equip | NOT_REACHED | Main startup failed before this stage |
| 9 | auto_potion | NOT_REACHED | Main startup failed before this stage |
| 10 | level_up | NOT_REACHED | Main startup failed before this stage |
| 11 | stat_passive_invest | NOT_REACHED | Main startup failed before this stage |
| 12 | revival_interface | NOT_REACHED | Main startup failed before this stage |
| 13 | bossroom_gate | NOT_REACHED | Main startup failed before this stage |
| 14 | boss_defeat_signal | NOT_REACHED | Main startup failed before this stage |
| 15 | clear | NOT_REACHED | Main startup failed before this stage |
| 16 | demo_end | NOT_REACHED | Main startup failed before this stage |
| 17 | save_handoff | NOT_REACHED | Main startup failed before this stage |
| 18 | lobby_return | NOT_REACHED | Main startup failed before this stage |


## MAP PRODUCTION REPORT

STAGE: harness TECH QA only; 신규 맵 제작/제품 변경0.
MASTER: silhouette/regions/main route/side spaces 변경0.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 major holes 변경0, 시각 재검수 없음.
LARGE: source assets/composites/overlap/repeated silhouette 변경0.
MEDIUM: connections/remaining holes 변경0.
GROUND: shadow/contamination/structure integration 변경0.
PLAYABLE: arenas/travel/breathing/threat 변경0; fixture 경계/route 검사만, 자연 전투 가독성 인수 없음.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 시각 재검수 없음.
TECH QA: route/collision/marker/transport fixture는 표 참조. pageerror/404/seam/loading/GUI performance 별도 측정 없음. 자동 테스트로 시각 PASS 주장0.
FILES: stage-owned tests only; concurrent/unrelated touched0; PC/core/product assets 변경0.
GIT: 경로 지정 add·정상 hooks·동일 브랜치 비강제 push·원격40자SHA 대조, main/deploy0.
VISUAL VERDICT: RETOUCH (기존 인수 유지, 이번 시각 재검수 없음).
NEXT PASS: 허용된 다음 검수에서 최종 fixture/E2E 재검증, starter native crash와 PC clock/wall 경계 분리 확인.
