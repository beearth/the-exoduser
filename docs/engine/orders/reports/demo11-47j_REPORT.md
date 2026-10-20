# DEMO11-47j — Mac 연결·펫 틱

**부분 완료. 18단계 E2E 1회: 13 PASS / 5 NOT_READY / 0 FAIL / engine ERROR 0.** 이후 하네스 선행조건 수정과 집중 검증은 E2E를 재실행하지 않고 별도로 수행했다. 최종 제품+집중 테스트는 9 PASS/0 FAIL. 최종 수정된 18단계 하네스는 parse PASS이며 전체 재종주는 미검증이다.

기준 `codex/demo11-47i-20261021` 36155ceac1641b908fff15415aded61a33039af2 (통합 b07f5c56 위). 작업은 `codex/demo11-47j-20261021` 격리 worktree. 제출 SHA/원격 대조/제거 결과는 외부 DONE.txt.

| 단계 | 1회 E2E 판정 | 당시 이유 |
|---|---|---|
| isolation | PASS |  |
| new_game | PASS |  |
| character_create | PASS |  |
| intro_skip | PASS |  |
| field_MAP11 | PASS |  |
| enemy_kill | NOT_READY | MAP11_or_initial_combat_target_absent |
| revival_interface | NOT_READY | PC_life_transition_API_absent |
| item_pickup | PASS |  |
| equip | PASS |  |
| auto_potion | NOT_READY | real hurtP/iframe/threshold/clock did not produce auto-potion |
| level_up | PASS |  |
| stat_passive_invest | PASS |  |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| clear | PASS |  |
| demo_end | PASS |  |
| save_handoff | PASS |  |
| lobby_return | PASS |  |

## 최종 Mac 집중 검증 (18단계 표와 별도)

| 항목 | 최종 실제 증거 |
|---|---|
| 초기 레슨 | 실제 시작(active) 대기 → 기존 skip_all → seen=true/active=false → 실제 update stage_play_time CONTINUE |
| 자연 스폰 | 기존 source 스케줄러 RNG·지연·MAP11 Marker·실제 factory/registry 경유. 등록 2 / source 시도 8; 미지원 선택은 재추첨하지 않음 |
| 실제 처치 | 자연 스폰 etype 4, Player request_attack/release_attack → 실제 hurtE → HP -1189.0 / alive=False. HP/alive 직접 대입·receive_damage 폴백 없음 |
| 지역 집계 | 실제 NativeRegions.kill_calls 0→1. legacy 이벤트 전용 natural_base.counts.origin_kills가 아니라 실제 P3 지역 owner를 관측 |
| 자동 물약 | 인트로 600틱 iframe 자연 소진 후 실제 Player.receive_damage → 자동 사용 1회·악의 차감·CD>0. 테스트 준비 악의가 없으면 기존 HP-pickup→악의 변환 API만 호출. HP·iframe·CD 직접 대입 없음 |
| gate binding | 실제 region owner/encounter/provider/transport 연결 PASS. 지역 4곳 조건 충족·_fbDone·gate 개방·실제 입장은 **미검증/미완료** |
| 9개 집중 확인 | 9 PASS / 0 FAIL. 18단계 E2E 성공으로 대체하지 않음 |

## 코드와 성능

- Main은 MAP11 provider 설치 뒤 기존 소환굴 configure(legacy placement0) → NativeRegions → spawn adapter → encounter/gate → natural scheduler 순서로 설치한다. 1/4/5/6의 이미 선택된 source packet은 기존 A군 생성기로 인계하며 원 RNG/간격/분모를 보존한다. 29종 자연 스폰 전체 완료 아님.
- 펫 `_show_bubble`의 ResourceLoader.exists/load를 기존 crow/cat PNG의 강한 Texture2D preload 상수 2개로 교체했다. 틱 목록 생성 API 추가0, 틱 리소스 조회/로드 제거.
- 펫 callback 최대 **14.633ms → 0.144ms**. 동일 1회 E2E의 auto_potion 단계 **14.633ms → 0.131ms**, equip **14.400ms → 0.093ms**. 47j 전체 physics callback span 최대 **5.736ms**, 120Hz 예산 **8.333ms**. headless wall CPU span(scheduler preemption 포함), GPU/실창/PC 성능 증명 아님.
- E2E 후 레슨 `guide.done` 조기 break를 제거하고 실제 레슨 시작/종료를 기다리도록 수정했다. boss_defeat/clear를 가짜 완료시키던 contract signal injection도 제거했다. 최종 E2E 코드는 parse만 검증했고 user 지정 1회 제한 때문에 재종주하지 않았다.

## 남은 경계 — 전부 PC로 전가하지 않음

| 범위 | 남은 것 |
|---|---|
| Mac bossroom_gate | region/encounter wiring는 연결. MAP11의 fieldboss 역할 Marker·실제 family 배선, 지역/FB 전투 완료에서 _fbDone으로 이어지는 경로, gate spawn_options(room/difficulty/stage offset) 실제 caller 인계 및 입장 증거는 남아 있다. 현재 transport는 빈 spawn_options를 전달하므로 binding만으로 입장이 완료됐다고 말하지 않는다. |
| PC field/final 계약 | fieldboss 피해/최종 readback owner가 인수되지 않아 _fbDone 완료 증거 없음. boss actor는 피해 수신/최종사망 owner가 미바인딩이므로 HP0→PCI-11→exit/clear 증거 없음. |
| PC 일반 적 경계 | etype0 source field/poise 호출은 42490 source_field_call_unavailable, etype6은 42136 special_etype_6에서 실제 HALT를 확인. 해당 경로를 폴백/완화하지 않았다. etype4 실제 처치로 최소 1마리 요구를 집중 검증했다. |
| revival_interface | PCI 묶음 A / PCI-01·PCI-11 대기. 코드 변경·치명 피해 유도0, NOT_READY 유지. |

## 검증·보존

- 기존 자동물약 관련 suite **2569/0**, 원본 JS oracle **420사례**, import ERROR0.
- 집중 테스트 이력: 5/4 → 6/3 → 8/1 → **9/0**. 실패 원인/증거는 외부 파일로 보존. 최초 관련 테스트는 E2E 전, 후속은 발견한 하네스·스폰 누락 수정 뒤에만 실행. E2E 총1회.
- 최종 두 테스트 script check-only **2/0**. 전체 출력은 `~/exoduser-wt/_out/DEMO11-47j/` 파일에 보존하고 단정/실패 수 위주로 읽었다.
- 실제 저장 폴더 접근0. 47h-Isolated(기존 E2E) / 25b-Isolated / 47j-Mac-Isolated만 사용. Godot 동시 실행1 이하. 번역 목록/CRLF 수정0.
- 맵 비주얼/PC 전투 코어/hurtE/hurtP/docs2_3 변경0. 신규 개발 상태 UI 문자열0. R tracked INDEX/WORK·branch·HEAD 보존, 자동 서버 재시작/Steam 배포0.
- docs 전체 keyword 검색 결과는 외부 docs-keyword-matches.txt. 현행 spawn/pet/물약/상태 및 CHANGELOG 동기화. 과거 보고서는 이력으로 보존하고 후속 절로 구분.

## MAP PRODUCTION REPORT (런타임 연결만)

STAGE: MAP11. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK: 기존 저작물 보존, 변경0. PLAYABLE: 자연 소환 etype4 실제 처치·지역 귀속까지 집중 검증. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 이번 headless 검사에서 미수행. TECH QA: import/parse/관련 suite/집중 검사 완료; gate 실제 개방·입장·boss final·최종18단계 재종주 잔여. route/collision/seam/404/시각 QA는 이번 변경으로 재승인하지 않음. FILES: Main/natural base/pets 및 테스트·관련 engine docs, 맵 stage-owned 파일 변경0, concurrent/unrelated 변경0. GIT: 정상 hook+경로 add 후 자기 branch push, 배포0.

**VISUAL VERDICT: RETOUCH** — 이번 세션에서 시각 검수를 하지 않아 PASS 인수할 수 없음(새 시각 결함을 발견했다는 의미 아님). NEXT PASS: Mac gate의 실제 family/options 배선과 PC final 계약 인수 뒤 별도 승인된 E2E 재종주.
