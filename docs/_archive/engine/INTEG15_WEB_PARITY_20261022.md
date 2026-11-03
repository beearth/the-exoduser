# INTEG-15 — 웹 동일성 3차 통합 / PC Windows 재검수 후보

| 재료 | 40자 SHA / 적용 |
|---|---|
| baseline | `bc2ca2b724eb202f7580d1aa5cc7b4a2f3f37c39` |
| map04 | `58155b0be11baf02b184fb97e455b61ef0d4e5ea` |
| merge | `f5c80316b71248fc865c8c1dc70c2221979d2101` |
| capture_tools | `fae057f7fa14e82c48e5edaf84667631ac1af03e` |
| main_at_fetch | `806be864816bc5bf2146688b72c1ebeab7d5817f` |

기준 UI05 체인은 INTEG13 06f3db98 → INTEG14 de6cccf8 → HS01 8a6adb05 → UI05 bc2ca2b7. 명시 fetch 및 ls-remote 기록은 외부 material-remote.txt에 보존했다. PC claude/pc-combat-kill SHA는 사용자에게 통보되지 않아 인수하지 않았다. 캡처 도구 fae057f7f는 과거 main의 도구 출처이며 현재 main(806be864)으로 통합 입력을 바꾸지 않았다.

새 worktree `~/exoduser-wt/INTEG-15`를 --no-checkout 및 지정 sparse set/read-tree로 전개하고 tracked clean을 확인했다. R의 HEAD/branch/INDEX/WORK는 시작·정리 시 별도 대조한다. R Godot/import 실행0. merge만 사용, .gitignore와 CHANGELOG_SYNC 두 충돌은 양쪽 항목/이력 보존. 맵·보스 표시·미니맵·저장 어댑터 MAP04, UI·HUD·스킬·설정·클리어·캐릭터 선택 UI05 체인 그대로다. PC 코어/원본 PC 테스트/원본 snapshot 변경0.

## 새 snapshot 행 의존 확인

현행 snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` (원본 main 91e2774b7), 과거 4d911cdd 스냅샷의 16156행 이상은 +2 대응이다. MAP04 신규 코드와 테스트의 추가행에는 이 구간의 고정 발췌/이전 SHA 고정 사용처가 없다. 새로 추가된 보스 주석10970–10971은 삽입점 이전이라 이동하지 않는다. MAP04 과거 보고의 실행·행 출처를 현행 실행으로 덮어쓰지 않는다. 기존 native_regions 헤더는 이미 UI05의 현행 행을 유지한다.

| 도구 | 0-based 발췌 인덱스 갱신 | 보존 |
|---|---|---|
| nw01_world_interaction_oracle | dst31722→31724 / gate32826→32828 | SOURCE_SHA, FRAGMENT_SHA, 실제 코드·검사·기대값 동일 |
| nw02_player_portal_oracle | portal[18308,18322)→[18310,18324), zone[30159,30161)→[30161,30163), stage[31533,31535)→[31535,31537), distance31722→31724, tile16630→16632 | HASHES 모든 fragment 동일 |
| nw03_map_action_oracle | distance31722→31724, gate32826→32828, hpBody[28250,28258)→[28252,28260) | LOOP_SHA·원본 hpBody·기대값 동일 |

nw-line-audit.json에 각 이전/새 행 byte 동일 근거, nw-oracle-verification.json에 원래 fragment hash 검사 성공을 기록했다. PC producer/PC 테스트가 노출하는 과거 source label과 provenance 행(32829–32853 등)은 PC 원본 계약으로 유지하며 현행 발췌 행으로 오인하지 않는다. 이번 수정은 실행 발췌 인덱스만이다. 게임 판정·기대값·RNG·타이머·forbidden 의존 목록은 변경하지 않았다. 원본 테스트 byte는 protected-bytes.json으로 보존.

## 실행 원칙

각 suite1회, import1회, E2E1회(storage=on). mac_harness의 storage=off 및 PID guard/override finally 유지. equality-only 테스트는 임시 invocation copy의 userdir 문자열만 UUID로 대체하고 원본 테스트 파일은 보존했다. 단위 테스트 자체의 명시된 fixture 개입은 자연 플레이/E2E로 승격하지 않는다. E2E HP/피해/처치/드랍/XP/위치/원장 주입0. 각 실행 새 namespace, 실제 EXODUSER-Godot-Native-First 경로 사용0. 보호PID81277 포함 상한3, 자기 Godot 직렬 실행.


## 단회 테스트 결과

| 테스트 | 검사 | 실패 | exit | ERROR | 판정 |
|---|---:|---:|---:|---:|---|
| import | None | None | 0 | 0 | PASS |
| test_boss_ch1_bc10_control | 165774 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_02_reuse | 44891 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_03_new_start | 25749 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_04_vortex | 41373 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_05_bean_rain | 35164 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_06_fan_wave | 46009 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_07_shield_bash | 30191 | 0 | 0 | 0 | PASS |
| test_boss_ch3_bc3_01_catalog | 43491 | 0 | 0 | 0 | PASS |
| test_ch2_01_stage4_source | 362 | 0 | 0 | 0 | PASS |
| test_demo11_08_story_intro | 12 | 0 | 0 | 0 | PASS |
| test_demo11_16_dispatch | 393 | 0 | 0 | 0 | PASS |
| test_demo11_17_skill_management | 105 | 0 | 0 | 0 | PASS |
| test_native_map_object_action_proposal | 3060 | 1 | 1 | 0 | FAIL |
| test_native_player_portal_proposal | 1851 | 2 | 1 | 0 | FAIL |
| test_native_world_interaction_query | 2304 | 2 | 1 | 0 | FAIL |
| test_p3004a_ch1_area_source | 63 | 0 | 0 | 0 | PASS |
| test_p3004c_ch1_stage1_source | 75 | 0 | 0 | 0 | PASS |
| test_parity_boss_01 | 276 | 0 | 0 | 0 | PASS |
| test_parity_hud_01 | 17 | 0 | 0 | 0 | PASS |
| test_parity_map_04 | 16 | [] | 0 | 0 | 16 PASS / harness schema FAIL |
| test_parity_ui_05 | 15 | 0 | 0 | 0 | PASS |
| test_pc_followups_fieldboss | 167 | 0 | 0 | 0 | PASS |
| test_pc_hud_stats | 199 | 0 | 0 | 0 | PASS |
| test_pc_move_skills | 256 | 0 | 0 | 0 | PASS |
| test_pc_skill_writers | 80 | 0 | 0 | 0 | PASS |
| test_sound_source_backend | 2004 | 0 | 0 | 0 | PASS |
| test_sound_source_bgm_lifecycle | 2400 | 0 | 0 | 0 | PASS |
| test_sound_source_bgm_selection | 1308 | 0 | 0 | 0 | PASS |
| test_sound_source_cue_recipes | 133 | 0 | 0 | 0 | PASS |
| test_sound_source_mix | 5728 | 0 | 0 | 0 | PASS |
| test_sound_source_queue | 606 | 0 | 0 | 0 | PASS |
| test_sound_source_voice_selector | 2435 | 0 | 0 | 0 | PASS |

HS-M7 19종 모두 PASS. PC followups fieldboss는 **167/0**, skipped0, 원본 byte동일이다. 이전 INTEG14 154/1 `arrow_passes_through_on_hitcd(n=0):recycled`는 이번에 재현되지 않았다. 재실행 없이 얻은 1회 결과이며 MAP04 통합/실행 난수·시점 중 무엇이 원인인지 확정하지 않는다. 자연 E2E 처치 성공 증거로 쓰지 않는다. 단위 fixture forced_test_fields1552는 원본 테스트의 개입 수다.

| 남은 실패 | 원인·소유 | 처리 |
|---|---|---|
| nw01 2304/2 | provenance_and_scope의 `load(`/`preload(` 금지 검사. snapshot.gd를 preload하는 기존 producer와 scope 계약 충돌; `load(`는 `preload(` 문자열에도 매칭. 이전2304/2와 같음 | 원문 oracle source_oracle1256/0·도메인1034/0. PC 원본 producer/test 변경0 |
| nw02 1851/2 | 동일 snapshot preload 대 readonly dependency 계약 충돌 | 이전1851/2와 같음. 기대값/forbidden 목록 변경0 |
| nw03 3060/1 | `only NW01 readonly query dependency`: snapshot.gd preload가 기존 허용 dependency 한정 검사와 충돌 | 이전3060/1과 같음. 판정 약화0 |
| map04 harness | 원문16 PASS/실패[]/exit0/ERROR0. mac_harness가 `failures != 0` 비교하여 []를 FAIL로 분류 | 하니스·테스트 원본 수정/재실행0. 제품 실패와 구분하되 harness FAIL 상태 보존 |

초기 실행 스크립트는 prefix만 검사하는 intro 테스트에 equality namespace를 찾다가 **테스트 실행 전** 중단했다. 이미 완료된25항목은 반복하지 않고 미실행8항목을 정확한 namespace 형식으로 각1회 실행했다. 정상 hook/판정 조건은 유지했다.

## E2E 18단계 — storage=on / 단1회

7 PASS / 11 NOT_READY / 0 FAIL, exit0/ERROR0. 자연 공격12회/승인12회, 석궁7발·9hit·0kill·HP0. 자연 combat kill/아이템/성장/보스 종주 미완료. 원본 player death/intro가 설정하는 iframes는 runtime readback이며 하니스 대입이 아니다. 하니스 HP/피해/드랍/XP/위치/원장 주입0.

| 단계 | 결과 | 사유 |
|---|---|---|
| isolation | PASS |  |
| new_game | PASS |  |
| character_create | PASS |  |
| intro_skip | PASS |  |
| field_MAP11 | PASS |  |
| enemy_kill | NOT_READY | actual combat kill not completed; preserve PC halt/owner boundary |
| item_pickup | NOT_READY | actual R pickup did not admit item |
| equip | NOT_READY | item_or_interface_absent |
| auto_potion | NOT_READY | real hurtP/iframe/threshold/clock did not produce auto-potion |
| level_up | NOT_READY | natural combat XP did not level up |
| stat_passive_invest | NOT_READY | growth/applyStats/queue owner not ready |
| revival_interface | PASS |  |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| clear | NOT_READY | clear consumer did not accept contract |
| demo_end | NOT_READY | next/end route not admitted |
| save_handoff | PASS |  |
| lobby_return | NOT_READY | actual lobby navigation not completed |

PC 보행 약3px는 MAP04의 별도 OS W 1776.641ms→약3.43px 기존 관측으로 PC 조사 중이다. 이번 E2E는 입력으로 (4020,7420)→(3670.096,7330.615) 진행했으나 W만의 고정 시간 속도 검사는 아니다. 두 측정을 동등 비교하거나 PC 이동 문제 해결로 보고하지 않는다. PC combat-kill 추가SHA 통보없음/미인수.

## 나란히 캡처 / 직접 화면 검수

`_out/INTEG-15/captures/`, 왼쪽 웹·오른쪽Godot. 각 원본1920×1080, 도구 fae057f7f의 sheet.compare scale1. 격자/북문·미니맵 crop은 실제 pixels 무축소다. capture-manifest.json에 source/크기/SHA256 기록. 두 독립 신규 게임의 난수 장비/수치/시간을 맞추지 않았다.

| 캡처 | 직접 관측·판정 |
|---|---|
| character_compare_1x.png | 무대/3특성/5원형선택 구조 유지. 웹 잠김표시/영상과 native 정적poster, 특성아이콘·문자·버튼재질 차이 잔여. RETOUCH |
| settings_game_compare_1x.png | 실제 Esc 설정·4탭/게임 페이지 배치 유지. Godot 제목·라벨 폰트 작음/어둡고, 버튼·스크롤·재질 차이. UI05의 기존 미구현 action 제한 유지. RETOUCH |
| guide_compare_1x.png | 양쪽 소환진/본문/버튼 표시. 검정 면으로 원판 가리는 회귀 없음. 폰트·배경 밝기 차이. RETOUCH |
| start_compare_1x.png | 양쪽 지역배너·자연 초기 방향화살표·레슨·HUD 있음. 레슨 중 지역 목표 arrow 숨김 source guard 유지. 방향/목표 강제대입0. Godot 조명 어둡고 펫 대사·HUD font/간격·독립 RNG 숫자/시각 다름. RETOUCH |
| north_gate_hud_compare_1x.png | 남동→북문 위치표시 fixture로 분모 양쪽32 확인. 별도 문앞 full frame은 남서→문앞53. 원본60px 경계 유지. 자연 보행 종주 증거 아님 |
| minimap_compare_1x.png | 큰 보라/노랑/파랑/빨강 표식 확인, 적 위치/위상·native raster/outline 차이 잔여. RETOUCH |
| clear_compare_1x.png | 표시 API만 호출하고 현재 상태로 읽은 카드. HP/처치/시간/점수/원장 대입0. 웹 overlay opacity만 가시화. 자연클리어 아님. 서로 다른 현재시간/지역집계로 점수 다름, 웹 다음구역/native데모종료 라벨 차이. RETOUCH; 자연종주 검증 아님 |

맵 위치 fixture와 UI 표시 확인은 E2E와 엄격히 분리했다. 북문/미니맵 캡처에서 위치만 순서대로 제시하고 HP·처치·정화·원장 변경0. clear API는 결과 표시/격리 저장을 할 수 있으므로 실제 사용자 저장소와 분리했으며 클리어 달성으로 승격하지 않는다.

실패 캡처도 보존했다: 첫 웹 설정은 lesson overlay가 탭을 가로막았고 실제 연습 건너뛰기 버튼으로 재촬영했다. 첫 clear 웹은 overlay가 보이지 않아 비교 원본을 web-attempt1/에 남긴 후 표시 CSS만 가시화하여 다시 촬영했다. E2E 재실행0. 캡처가 끝난 뒤 Playwright close promise가 멈췄으나 자기 browser 자식 종료를 확인한 뒤 자기 node/server만 종료한 근거는 browser-close-recovery.json에 기록했다.

## 성능·VRAM 1회

필드 GUI를 새 namespace/storage=off로 실행했다. **60초 내 포커스 미확보로 미측정**. 재측정0. map positional 캡처가 출력한 texture/video monitor는 캡처 시점 참고값이며 성능/VRAM 측정값으로 대체하지 않는다. Mac shared-memory engine monitor를 전체 맵 상주량 또는 PC VRAM 값으로 주장하지 않는다. 성능 시도 중 다른 자기 Godot suite/브라우저 작업0, 보호PID81277 유지.

## MAP PRODUCTION REPORT

STAGE: CH1-1 통합 CAMERA/TECH QA, 신규 맵 제작0.
MASTER: silhouette/regions/main route/side spaces 원본 보존.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 편집0.
LARGE: source assets/composites/overlap/repeated silhouette 변경0.
MEDIUM: connections/remaining holes 변경0.
GROUND: shadow/contamination/structure integration 변경0.
PLAYABLE: main arenas/travel/breathing/threat 공간 변경0; 자연 전투 처치0·전체 combat readability 새승인0.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START/북문/소환굴C/고스트위치/남서경계/문앞 표시fixture 캡처. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 자연종주 아님.
TECH QA: map04 route/collision/격리저장16 PASS(하니스 schema FAIL 별도), web pageerror0(UI capture), 404 전수새검수0; seam/geometry 신규0, import ERROR0; performance focus미확보 미측정.
FILES: MAP04 merge 인수 + nw oracle3개의 index만5줄 변경. stage 새비주얼/기능0; PC core/test 변경0.
GIT: 지정branch·정상hook·경로지정add·비강제push. main push/force/reset/rebase/deploy0.
VISUAL VERDICT: RETOUCH.
NEXT PASS: PC Windows 나란히 재검수, PC 전투처치/보행/덩굴 spike 조사, nw readonly dependency 계약·하니스 결과 schema 소유자 확인. 이번에 고치거나 완료로 보고하지 않음.

외부 raw tests/e2e/captures/materials/line-audit/protected-bytes 및 정리 근거를 보존한다. PC 접근·동기화·실행은 미확인이다.
