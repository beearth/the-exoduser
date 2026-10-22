# INTEG-14 — PC HUD·새 snapshot 통합 / HS-M7

| 재료 | 확정값 |
|---|---|
| INTEG-13 | `06f3db984e88797e902cf57601b53c08673d9b2d` |
| PC HUD | `1a2e88b2f1c27b94fd86682c39a142cafdf427aa` |
| merge | `6497ac5eb` — merge만 사용, CHANGELOG 충돌 양쪽 이력 보존 |
| snapshot 원본 | `91e2774b769869e59f80953e148a5c95203b0fea` |
| snapshot SHA256 | `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 조회 시 remote main | `806be864816bc5bf2146688b72c1ebeab7d5817f` — 이번 입력으로 교체하지 않음 |
| 실행 source | `~/exoduser-wt/INTEG-14/godot` — R Godot/import 0 |

명시 fetch·ls-remote로 두 재료의 40자 SHA 일치 확인. `native_source_new_run_state.gd`는 skill-writers와 HUD 양쪽 변경을 자동 merge했고 충돌 0. PC 첫 렌더 지급·유골함 raw key 제거를 정상 인수하고 Mac UI는 INTEG-13을 유지한다. HUD MP/SP 최댓값의 `/ ` 공백을 HP와 맞췄다. PC 테스트 원본의 Git byte는 변경하지 않았다.

## HS-M7 처리

| 대상 | 처리 | 근거 |
|---|---|---|
| bc10·bc2_02~07·bc3_01·demo11_16 (9종) | 원본 16156행 이상 +2. 소스 oracle와 포트 source_line 반환 메타데이터·단정 모두 갱신 | 이전 n행과 새 n+2행의 실제 코드 동일. 검사/기대값·피해·RNG·타이머 유지 |
| ch2_01·p3004a·p3004c (3종) | 원래 `export_ch1_area_source.mjs`로 si4/si0/si1 재추출, CH2 SYMBOLS·AST 단정도 새 원본에 맞춤 | source 외 데이터 동일, 모든 심볼 content SHA 동일. main SHA·files SHA·추출 HEAD·심볼 행 변화만 있음 |
| sound backend/bgm_lifecycle/bgm_selection/cue/mix/queue/voice (7종) | 원래 build_sound_source_* 7개를 `git show 91e2774b7:game.html`로 실행, SOURCE_MAIN 갱신 | source_ref/source_sha256 외 내용 동일. source_snapshot 경로 보존 |
| parity-* | boss 원본 SHA 단정, map01 manifest 고정행/현재 SHA, map02 고정행, map/hud source 행 label 갱신 | 생성 bitmap/GPU 자산 재생성 없음. 과거 생성 SHA는 lineage로 보존하고 current revalidation 별도 추가 |

상세 숫자 참조 표: `INTEG14_HS_M7_LINE_REFERENCES_20261022.json`. 외부 `line-audit.json`, `module-line-audit.json`, `reextract.json`, `si*-symbol-diff.json`에 실행 근거 보존. 역사적 보고서와 PC 구현의 과거 원본 설명은 현행 snapshot으로 위장하지 않는다.

첫 실행에서 포트의 source_line 메타데이터·AST 위치 단정 미갱신이 발견되어 10종을 수정 후 재검증했다. HUD 공백 실패 2건도 수정 후 재검증했다. 따라서 모든 검사가 총 실행 1회였다고 주장하지 않는다. 수정 전 결과는 tests, 영향받은 최종 결과는 final-tests로 구분했다. 영향 없는 9종과 관련 회귀는 각 1회다. CH2 AST 최종 추가 확인 1회도 별도로 보존했다. import 1회, E2E 1회다.

## 검수

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
| test_demo11_16_dispatch | 393 | 0 | 0 | 0 | PASS |
| test_demo11_17_skill_management | 105 | 0 | 0 | 0 | PASS |
| test_fieldboss_unify | 14 | 3 | 1 | 0 | FAIL |
| test_p3004a_ch1_area_source | 63 | 0 | 0 | 0 | PASS |
| test_p3004c_ch1_stage1_source | 75 | 0 | 0 | 0 | PASS |
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
| test_parity_boss_01 | 276 | 0 | 0 | 0 | PASS |
| test_pc_followups_fieldboss | 154 | 1 | 1 | 0 | FAIL |
| test_demo11_08_story_intro | 12 | 0 | 0 | 0 | PASS |
| test_parity_hud_01 | 17 | 0 | 0 | 0 | PASS |

PC equality-only fixture는 원본 테스트를 변경하지 않고 외부 invocation copy의 namespace 문자열만 새 UUID로 바꿔 실행했다. 판정·케이스·expected·숫자 변경 0, 원본 파일 SHA 보존. storage=off, 원래 mac_harness 프로세스 guard/override finally 복원 사용. intro/E2E/capture도 매회 UUID. 실제 저장 폴더 사용 0. 병렬 suite 실행 0, Godot PID 81277 포함 상한 3 유지.

## 원래부터 실패한 7종 — 분류만

| 테스트 | 기존 원인 / 경계 |
|---|---|
| bc_integ_01 | accepted BC08/BC02 baseline byte CLI 미제공/격리 문제. 제품 회귀 근거가 아님 |
| demo11_29 | 원래부터 acorn ESM 모듈 해석 실패, 새 snapshot의 유골함 변경과 무관 |
| demo11_38 | 기존 42검사/1실패 end-flow 계약 잔여. 정확한 하위 원인은 이번에 재확정하지 않음 |
| gate_guard | 기존 isolation 계약 실패 |
| nw01 | 기존 2304/2, 새 snapshot에서는 distance/gate 발췌 고정행 실패가 앞섬 |
| nw02 | 기존 1851/2, 동일 발췌 위치 원인 + 기존 계약 잔여 |
| nw03 | 기존 3060/1, 동일 발췌 위치 원인 + 기존 계약 잔여 |

위 수치는 PC 원 보고서 §9-5의 양쪽 snapshot 측정 결과를 인용한 분류다. 이번 재실행/해소/PASS로 보고하지 않는다. 판정을 약화하거나 owner 코어를 임의 수정하지 않았다. 요청된 PC followups fieldboss는 Mac에서 154검사/1실패(`arrow_passes_through_on_hitcd(n=0):recycled`)였다. PC 보고의 167/0으로 대체하지 않는다. PC owner 구현·테스트 변경 없이 실측을 보존한다. 추가 fieldboss_unify 14/3은 angler 순서·Marker 초기화·provider loss fixture 계약 불일치로 보존하며, 요청된 PC followups fieldboss suite와 구분한다.


## E2E — 단 1회, storage=on

7 PASS / 11 NOT_READY / 0 FAIL, 엔진 ERROR 0/exit 0. 전투 입력15승인/15회, 자동석궁7발/8hit/0kill, 자연 HP0. source_field_call_unavailable/halt 관측은 PC claude/pc-combat-kill 조사 범위로 보존하고 이 통합에서 코어를 수정하지 않았다. 실제 공격·사망 결과로 드랍·성장·보스 종주 PASS를 만들지 않는다.

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

실행한 E2E 소스는 `_out/INTEG-14/e2e-executed.gd`, 전체 18단계와 readback은 `e2e/stages.json` 및 원문 로그에 보존했다. HP/피해/처치/드랍/XP/위치/원장 주입0. E2E 재실행0.


## HUD 1x 화면 확인

`captures/01_hud_start_compare_1x.png`: 왼쪽 웹/오른쪽 Godot, 각각 1920×1080 원본을 무축소 배치한 3840×1080 PNG다. 양쪽 모두 새 실행·유골함 지급 이후이며 RNG·스탯·아이템·시간을 주입하지 않았다. Godot은 정식 `native_intro_boot=intro` 진입과 제품 guide advance/finish를 사용하고 커튼 fade 이후 촬영했다. 웹은 새 캐릭터 생성 UI 및 실제 `ikSkip` 버튼으로 진입했다. E2E 종주 증거와 별도다.

| 시작 표시 | 웹 | Godot | 판정 |
|---|---|---|---|
| HP | 521 / 521 | 550 / 550 | 별개 생성 상태의 절대 숫자 다름 |
| MP | 262 / 412 | 256 / 406 | 별개 생성 상태·재생 시각 다름 |
| SP | 256 / 256 | 268 / 268 | 별개 생성 상태의 절대 숫자 다름 |
| 전투력 | 1,718 | 1,786 | 별개 생성 상태의 절대 숫자 다름 |

따라서 이 두 독립 시작 화면의 수치 동일성은 **미충족**이며, 이미지로 같은 입력 상태의 동일성을 증명했다고 보고하지 않는다. 시작 장비가 RNG로 생성되므로 원장·장비를 동일하게 정렬하지 않은 비교다. 동일 웹 fixture 입력의 HP/MP/SP·CP 단정은 원본 PC HUD 테스트 199/0으로 별도 검증했다. 유골함 최대 MP +150, 현재 MP 무료 충전 없음과 원시 효과 키 0도 그 테스트에 포함된다.

직접 화면 검수: HUD 숫자·CP는 보이며 Godot 필드는 더 어둡고 폰트·펫 대사 줄바꿈·지역 표시·상단 timer가 다르다. 동일 화면 PASS를 선언하지 않는다. **VISUAL VERDICT: RETOUCH**. 최초 로비 capture Main 미도달, 커튼/guide 이전 캡처와 웹 splash locator 실패는 외부 로그·이전 PNG로 보존했다. 완성된 나란히 캡처는 위 1장이다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 source provenance·HUD 캡처. 맵 제작 변경0.
MASTER: silhouette/regions/main route/side spaces 기존 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경0.
LARGE: source assets/composites/overlap/repeated silhouette 변경0; GPU output 340개 및 input PNG hash 대조.
MEDIUM: connections/remaining holes 변경0.
GROUND: shadow/contamination/structure integration 변경0.
PLAYABLE: main arenas/travel/breathing/threat 변경0; combat readability의 새 승인 없음.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START HUD 화면 확인. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 추가 camera board 미실행.
TECH QA: import ERROR0; collision owner 변경0; E2E7PASS/11NOT_READY; pageerror/404/seam/loading/성능 전체 새 검증 아님.
FILES: stage-owned 맵 geometry/asset 변경0, 출처 데이터·메타데이터만 갱신; 타인 WIP 변경0.
GIT: 관련 코드+docs 경로 지정 add/정상 hook commit·별도 브랜치 비강제 push; main/deploy0.
VISUAL VERDICT: RETOUCH.
NEXT PASS: PC fieldboss pass-through 1실패·PC 전투 처치0 조사 인계, 동일 시작 원장 화면 정렬 및 기존 시각 차이 후속 검수.
