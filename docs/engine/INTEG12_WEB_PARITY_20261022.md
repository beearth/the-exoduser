# INTEG-12 — 웹 동일성 2차 통합 (2026-10-22)

**통합 후보 / VISUAL RETOUCH / E2E FAIL / PC Windows 재검수 필요.**
브랜치 `codex/demo11-integ12-20261022`. R 제품 파일·INDEX/WORK 변경0, R에서 Godot/import0. PC HUD stats는 새 원본 snapshot SHA와 머지 허가가 없어 제외. 실제 PC 실행/동기화는 미확인이다.

## 재료와 통합 경계

명시 fetch와 ls-remote로 다음 SHA를 대조했다. 기준에서 boss 체인은 fast-forward merge, intro와 VRAM은 merge commit만 사용했다. reset/rebase/cherry-pick/force/main push/hook 비활성0. 지정 sparse --no-checkout/read-tree 경로와 초기 tracked clean 확인.

| 재료 | 확인 SHA |
|---|---|
| `refs/heads/codex/demo11-integ11-20261022` | `6c389948edcfecc6b2b5eeb37ac82db280dc6769` |
| `refs/heads/codex/parity-boss-02-20261022` | `1b86c02fc73f286dbac8127a9ff1921c738080ce` |
| `refs/heads/codex/parity-intro-01-20261022` | `015d40344a8abd9f0e59148b91638b113c00a140` |
| `refs/heads/codex/vram-01-20261022` | `50900cfd7cbc51b77b2d6e36166d2f38f296e71e` |
| `refs/heads/main` | `91e2774b769869e59f80953e148a5c95203b0fea` |
| parity tool 고정 기준 | `fae057f7f` (origin/main 과거 pin, git show로 _out/reference에만 추출; 제품 merge0) |
| 고정 웹 snapshot SHA256 | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |

BOSS-01 760b7ea8 → MAP-03 f6272399 → BOSS-02 1b86c02f 및 UI-04 e867f9b3 → HUD-02 bf538259 → INTRO-01 38ddd6cb → HUD-02b a08bd885 → INTRO-01b 015d4034의 HEAD 조상 관계 확인. VRAM DONE은 최초에는 없었으나 검수 도중 도착하여 50900cfd를 추가 fetch/ls-remote/merge했다. ≤1GB 목표는 VRAM 원보고도 PARTIAL이며, 통합본 달성으로 주장하지 않는다.

충돌: intro merge의 번역 전체목록·CHANGELOG_SYNC·PARITY_DIFF_LIST·PARITY_HUD_01 네 문서, VRAM merge의 CHANGELOG_SYNC 한 문서. 양쪽 이력을 순서대로 보존하고 마커만 제거. 번역 결과 CRLF9556/bareLF0. 코드 충돌0. `godot/port_modules`와 PC 이동/보스 테스트는 INTEG-11 대비 delta0. native_move_skills의 수신 체인 delta는 HUD-02 showPH signal/emit 표시 seam뿐이며 전투/이동 계산 수정0. 이번 통합자가 새로 고친 제품 코드는 아래 표시 guard 한 건뿐이다.

## Retry headless 이미지 안전 처리

| 위치 | 현행 동작 | 보존 계약 |
|---|---|---|
| native_demo11_life.gd retry | headless는 표시용 viewport 캡처를 생략. GUI는 Image가 null/empty가 아닐 때만 ImageTexture와 parity_ui_02_retry meta 생성 | respawn·EXP·save·reload·보스방 guard·판정 불변. tick IO/목록 API/ResourceLoader/매틱 할당 추가0. 제품 UI 문구 변경0 |

import가 수정 스크립트를 받아 오류0인 것은 확인했다. 이번 E2E는 Retry까지 미도달하여 **실제 Retry 뒤 headless 런타임 오류 재발0을 검증한 것은 아니다.** 이전 BOSS-02의 오류2건 기록은 역사로 보존한다.

## 단회 테스트

58 suites 각1회: **49 PASS / 9 non-PASS**. import는 최초 ERROR0 및 VRAM 추가 파일 후 delta import ERROR0(별도2회). PC source validation280/0·M29 101/0 두 suite는 VRAM 수신 전 실행, 나머지는 최종 merged tree. VRAM 수정이 PC source/테스트를 변경하지 않은 것을 확인했으나 두 검사를 최종 tree에서 재실행했다고 주장하지 않는다.

PC 이동256/0(skipped0), BOSS-02 관련276/0, 인트로12/0, HUD-02 26/0. PC 테스트는 Mac harness storage=off 경계를 유지하며 test_pc_move_skills의 자동 off 규칙을 그대로 사용. 다른 PC fixture에도 실행 인자로 off를 명시했다. C15만 원본 테스트가 강제하는 EXODUSER-C15-Test-20261022를 외부 guard에서 정확히 허용했고, 제품/PC oracle은 수정하지 않았다.

하니스의 raw errors 배열은 `_FAILS []` 정보 출력도 오류로 수집했다. PC boss death/prefix/states는 exit0·failures0·실제 ERROR0으로 구분했다. MAP11-30b도 일반 문자열 RESULT checks=34 failures=0이므로 PASS. 원본 JSON의 passed=false/원로그는 수정하지 않았다. 표의 counts는 마지막 aggregate를 사용하며 group+suite를 중복 합산하지 않는다.

| suite | checks | failures | exit | ERROR | owner / classification |
|---|---:|---:|---:|---:|---|
| 23b | 5 | 0 | 0 | 0 | Mac |
| 30b | 34 | 0 | 0 | 0 | Mac |
| 37 | 148 | 0 | 0 | 0 | Mac |
| 41 | 66 | 0 | 0 | 0 | Mac |
| 42 | 37 | 10 | 1 | 10 | Mac / legacy HUD display/labels expectations differ |
| 43 | 40 | 0 | 0 | 0 | Mac |
| 44_average | 5 | 0 | 0 | 0 | Mac |
| 44_pets | 75 | 3 | 1 | 3 | Mac / field-final seam/iris expectation |
| AUDIO-01 | 30 | 0 | 0 | 0 | Mac |
| BC01 | 681 | 0 | 0 | 0 | PC |
| BC02 | 5257 | 0 | 0 | 0 | PC |
| BC03 | 31976 | 0 | 0 | 0 | PC |
| BC04 | 21899 | 0 | 0 | 0 | PC |
| BC05 | 18424 | 0 | 0 | 0 | PC |
| BC06 | 14099 | 0 | 0 | 0 | PC |
| BC07 | 14531 | 0 | 0 | 0 | PC |
| BC08 | 24788 | 0 | 0 | 0 | PC |
| BC09 | 56664 | 0 | 0 | 0 | PC |
| BC10 | 165774 | 0 | 0 | 0 | PC |
| arena_preview | 35 | 1 | 1 | 1 | Mac / legacy map provider/marker expectations differ from web parity provider |
| bgm_override | 18 | 0 | 0 | 0 | Mac |
| boss_actor | 166 | 0 | 0 | 0 | Mac |
| demo11_17_skill_management | 105 | 0 | 0 | 0 | Mac |
| demo11_23b_inventory | 1281 | 0 | 0 | 0 | Mac |
| etype-b | 42 | 0 | 0 | 0 | PC |
| etype-f | 33 | 0 | 0 | 0 | PC |
| etype15_runtime | 2 | 1 | 1 | 3 | Mac namespace / C15 namespace rejected by demo persistence ON; Main boot absent |
| field | 41 | 0 | 0 | 0 | Mac |
| field_runtime | — | — | -15 | 2 | Mac / legacy map provider/marker expectations differ from web parity provider |
| field_walk | 49 | 0 | 0 | 0 | Mac |
| hud02 | 26 | 0 | 0 | 0 | Mac |
| import-vram | — | — | 0 | 0 | Mac |
| import | — | — | 0 | 0 | Mac |
| intro01 | 12 | 0 | 0 | 0 | Mac |
| native_main_source_starter_state | 15 | 15 | 1 | 25 | Mac / legacy namespace rejected by demo persistence ON; Main boot absent |
| outer | 26 | 0 | 0 | 0 | Mac |
| p1002e_melee_hurte | 94 | 0 | 0 | 0 | PC |
| p1002f_dedicated_hurte | 358 | 0 | 0 | 0 | PC |
| p1002g_kislash_hurte | 221 | 0 | 0 | 0 | PC |
| parity_boss_01 | 276 | 0 | 0 | 0 | Mac |
| parity_hud_01 | 17 | 0 | 0 | 0 | Mac |
| parity_map_01 | 180629 | 0 | 0 | 0 | Mac |
| parity_ui_01 | 7 | 0 | 0 | 0 | Mac |
| pc_boss_core | — | — | -15 | 1 | PC suite / Mac integration / boss_pattern_states: idle300; core standalone oracles pass; live visibility/clock boundary unverified |
| pc_boss_core_death | 73251 | 0 | 0 | 0 | PC |
| pc_boss_core_prefix | 25650 | 0 | 0 | 0 | PC |
| pc_boss_core_states | 30833 | 0 | 0 | 0 | PC |
| pc_boss_parity | 37 | 0 | 0 | 0 | PC |
| pc_combat_pack_b | 378 | 0 | 0 | 0 | PC |
| pc_combat_pack_b_mac | — | — | -15 | 29 | Mac map / PC oracle / carrier wall model and current web World collision mismatch |
| pc_enemy_revive | 51 | 0 | 0 | 0 | PC |
| pc_final_death | 61 | 0 | 0 | 0 | PC |
| pc_m29_parry | 101 | 0 | 0 | 0 | PC |
| pc_move_skills | 256 | 0 | 0 | 0 | PC |
| pc_source_validation_cache | 280 | 0 | 0 | 0 | PC |
| pcia_wire_life | 12 | 0 | 0 | 0 | PC |
| pcib_mac_calls | 31 | 0 | 0 | 0 | PC |
| product | — | — | 1 | 2 | Mac / legacy namespace rejected by demo persistence ON; Main boot absent |
| seam | 18 | 0 | 0 | 0 | Mac |
| stage_provider | 54 | 0 | 0 | 0 | Mac |

실패 소유: namespace/Main 부재·legacy map/marker·HUD 기대·펫 final seam은 Mac 통합/fixture 경계. combat_pack_b_mac은 Mac map wall 모델과 PC oracle 경계. PC boss core 실제 Main 검사는 idle300 뒤 boss_pattern_states 실패; standalone death/prefix/states/parity 통과와 구분하며 PC 코어 결함으로 단정하지 않는다. PC 테스트 단언 소유와 Mac visibility/clock 통합의 원인 경계는 미확인이다. 범위 밖 수정·실패 은폐를 위한 재실행0.

## E2E 18단계 — 저장 ON, 실행1회

`--demo11-storage=on`, 격리 `EXODUSER-demo11-INTEG12-47h-Isolated-20261022`. BOSS-02의 47h 하니스를 _out의 외부 사본으로 실행했다. 주입 금지를 지키기 위해 RNG drop fallback/append와 XP 보충을 제거하고 모든 player position/facing 쓰기를 실제 move/mouse-aim 입력으로 바꾸었다. 제품/PC 테스트 수정0, 나머지 단계 verdict/의존성·실제 Retry Button·PC 최종사망 신호 검사는 유지했다. 이 부분은 캐릭터 단계에서 중단되어 실행되지 않았다.

**2 PASS / 1 FAIL / 15 NOT_READY / 전체 FAIL.** 원래 하니스는 캐릭터 `_create()` 직후 Main을 기다리지만, INTRO 체인의 warrior 영상 소유자를 실제 Space 홀드로 넘기는 prefix를 수행하지 않는다. 따라서 영상에서 Main handoff를 못 찾았다. 제품 진입 자체의 결함으로 단정하지 않는 **Mac E2E 하니스 경계 실패**이며, 추가 E2E 실행0이다. 전체 18행은 종료 표를 완성한 것이지 18단계 모두 실제로 도달한 것이 아니다. bossroom_gate 이후 **실제 도달0**, Retry·보스 처치·clear·save handoff·lobby return 미검증. 캡처 fixture를 종주 증거로 대체하지 않는다.

| # | 단계 | 결과 | 실제 도달 / 근거 |
|---:|---|---|---|
| 1 | isolation | PASS | 실행·확인 |
| 2 | new_game | PASS | 실행·확인 |
| 3 | character_create | FAIL | character metadata did not hand off to Main |
| 4 | intro_skip | NOT_READY | Main_missing |
| 5 | field_MAP11 | NOT_READY | Main_missing |
| 6 | enemy_kill | NOT_READY | Main_missing |
| 7 | item_pickup | NOT_READY | Main_missing |
| 8 | equip | NOT_READY | Main_missing |
| 9 | auto_potion | NOT_READY | Main_missing |
| 10 | level_up | NOT_READY | Main_missing |
| 11 | stat_passive_invest | NOT_READY | Main_missing |
| 12 | revival_interface | NOT_READY | Main_missing |
| 13 | bossroom_gate | NOT_READY | Main_missing |
| 14 | boss_defeat_signal | NOT_READY | Main_missing |
| 15 | clear | NOT_READY | Main_missing |
| 16 | demo_end | NOT_READY | Main_missing |
| 17 | save_handoff | NOT_READY | Main_missing |
| 18 | lobby_return | NOT_READY | Main_missing |

## 웹↔Godot 나란히 캡처

`~/exoduser-wt/_out/INTEG-12/captures/` — 비교8 PNG, raw 양쪽8 PNG(총24). 원본1920×1080/DPR1, HUD만 동일1130×200 crop. sheet.py는 fae057f7f 그대로 외부 추출. 현재 intro/BOSS 체인 capture helper는 _out 외부 사본으로 사용했다. 제품 에셋/화면 리터치0·확대/리샘플0·1x 결합. 8장 모두 직접 열어 검토했다. 웹 pageerror0, 독립 boss GUI 오류0. 첫 capture의 기존 격리저장 재사용으로 story null 오류, 새 격리 namespace에서 six-shot 회수 후 boss 전환 nil 오류는 원로그 보존. 뒤의 독립 BOSS-02 절차에서 slam을 회수했다. 전체 capture 프로세스가 처음부터 오류0이었다고 주장하지 않는다.

로비 웹 최초 pre-login 및 splash-overlay가 실제 클릭을 가린 보완 실패를 보존하고, 최종은 demoEnter DOM Button.click 실제 handler + 캡처용 overlay 숨김으로 offline 새 캐릭터1개 상태를 회수했다. UI endpoint fixture이지 입력 종주 PASS가 아니다. 웹·native 장비/난수/펫/clock·fallen 생명 상태 전체 일치는 확보하지 못했다. 그 차이를 픽셀 실패의 원인으로 단정하지도, 숨기지도 않는다.

| 장면 | 나란히 파일(captures/) | 판정·남은 차이 |
|---|---|---|
| lobby | `lobby_compare_1x.png` | RETOUCH — 동일 배경·바르칸. first capture의 웹 pre-login 상태는 제외하고 demoEnter 실제 버튼 경로로 보완. 글꼴/우측 슬롯/로고/버튼 위치·영상 시간 차이 검토 필요. |
| intro | `intro_compare_1x.png` | RETOUCH — 양쪽 첫00.png 전체화면. 프레임/폰트·fade 차이 정밀 인수 아님. |
| field | `field_compare_1x.png` | RETOUCH — 소환진 t150/지역명 표시 fixture. 웹0/32↔native0/0·바닥조명·펫 줄바꿈/주체·스탯/스프라이트 상태 차이. 동일 runtime 상태 확보 아님. |
| inventory | `inventory_compare_1x.png` | RETOUCH — 원본 큰 틀·기사/장비 슬롯 유지. RNG 아이템/정렬/전투력1801↔1695·글자/간격·행 높이 차이. 데이터 동일 fixture 아님. |
| skill | `skill_compare_1x.png` | RETOUCH — 기검참 선택13슬롯/기본 배치 유지. 선택 glow·문구/가로선·아이콘·하단칩 폭/폰트 차이. |
| hud | `hud_compare_1x.png` | RETOUCH — 양쪽 같은(400,880)-(1530,1080)1130x200 원픽셀 crop. 웹 비활성2/3슬롯 icon↔native빈칸, HP/MP/SP 수치·펫/배경 상태 차이. |
| fallen | `fallen_compare_1x.png` | RETOUCH — 소환진 위 붉은 화면/중앙문구/바 유지. 웹부활불가·HP0↔native 표시fixture11.4%·3s·HP552. 동등한 life 상태 아님; E2E 증거로 사용0. |
| slam | `slam_compare_1x.png` | RETOUCH — 양쪽 bossSlamWind/st2=26. 조명·탄/독립구체 큐·HP/포이즈/면역·미니맵/지역 표시 차이, 같은 FSM 시점≠동일 전체 상태. |

## GUI 성능·VRAM

1회 실제 Main 필드 GUI 시도, 1920×1080, Godot4.7.2 GL Compatibility / Apple M5 Pro. 자기 PID41061에만 focus를 요청했고 PID81277 조작0. **60초 안에 window focus 미확보 → 미측정.** p95/p99/FPS/통합본 VRAM 수치를 산출/인수하지 않는다. headless 타이밍 또는 VRAM-01의 다른 source 수치를 통합본 GUI 측정으로 사용0. 근거 performance.json 및 performance/field.*.

## MAP PRODUCTION REPORT

STAGE: integration CAMERA/TECH QA, 신규 맵 제작0.
MASTER: 웹 구조·regions·남→북 route·side spaces 보존. 전체 silhouette 재설계0.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 공급 변경0, major holes 전체 재검수 아님.
LARGE: 기존 source chunks/props, 신규 composites/overlap0, 반복 전체 제거 판정 아님.
MEDIUM: 연결/holes 변경0, 전체 연결 QA 미완료.
GROUND: shadow/contamination/structure integration 보존, 비교에서 native 어둠/보스 amber 차이 유지.
PLAYABLE: arenas/travel/breathing/threat 공간 불변, 전투 가독성 전체 승인 아님.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START·ARENA 강타 확인; EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전수재검수 아님.
TECH QA: route/collision 관련 표 참조, web pageerror0, 404/seam 전수PASS 아님, import ERROR0, GUI 성능/VRAM 미측정.
FILES: stage-owned map 수정0 / 수신 체인만 merge / 별도 제품 fix life retry 표시 guard / unrelated0.
GIT: 본인 정확한 경로 add, 정상 hooks, 전용 브랜치 비강제 push 후 원격 SHA 대조; main/배포0.
VISUAL VERDICT: RETOUCH.
NEXT PASS: Windows 실제 경로·올바른 warrior 영상 skip prefix의 무주입18단계, Retry 실제 경로, PC live boss pattern/visibility 경계, 동등 상태 시각 검수 및 GUI focus 확보 측정.

정리 상태·최종40자 SHA·원격 대조·worktree 제거 receipt는 _out/INTEG-12/DONE.txt와 cleanup-final.json에 남긴다. 사용자 실제 저장 폴더 접근0. 자기 Godot/node/browser만 종료하며 보호 PID81277은 유지한다.


## 2026-10-22 INTEG-12b 하니스 후속

아래 INTEG-12 결과는 기준 SHA 당시 이력이다. INTEG-12b의 fixture 수정·단회 실패·최종 미검증 경계는 별도 기록을 따른다. [정확한 계약·단회 검수·제약](INTEG12B_HARNESS_REGRESSION_20261022.md).
