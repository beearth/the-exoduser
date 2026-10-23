# INTEG-17d — PC 스폰 동일성 사용자 플레이 후보 통합

## 재료와 병합

| 항목 | 인수 값 |
|---|---|
| 기준 | `c436c5a1a392cd06c25ad93e989899e1e10c8467` (INTEG-17c) |
| PC | `4f4fe928dfb617e75cff5064dc430247dd7ea446`, 이전 부모 `ff23449e6` |
| 방식 | 정상 merge, 충돌 0; HUD·lesson·번역·sweep 자동 병합 리뷰 |
| 원본 | SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 원격 확인 | 명시 fetch 및 ls-remote 두 재료 SHA 일치, 생성 전 대상 원격 없음 |
| 보존 | 기준 로딩·성능·17b/17c 및 Mac UI/맵/HUD 레이아웃, PC 구현·테스트·양쪽 docs |

## Mac 파일 두 개 내용 리뷰

| 파일 | 실제 인수 내용 | 제한 |
|---|---|---|
| native_natural_enemy_base.gd | G35660~35673 각·반경 샘플/최대30시도·나선1~19·중심 fallback; G31124 canMv 반경10/safePt/null; 좌표 1회 전달/회수, null 이외 간격 커브 진행 | **B/F/D/29 HOLD 유지**. PC 보고서 연결/14등록·11종은 중간 시험 설명이며 최종 코드 완료가 아님. PC 계약 문서 §표·§시험과 실제 tip 일치 |
| native_stage_spawn_adapter.gd | provider 수락 뒤 같은 그룹 1회분 원본 좌표 사용, set/clear; provider revision/site/region 검사는 유지 | actor 공급·HOLD 해제 아님 |

HUD stats_changed는 dirty만 표시하고 process에서 재계산을 합친다. 기준 레이아웃 그대로. 레슨 배경막은 웹 CSS의 45% 투명→오른쪽 끝 alpha166/255, 전체 opacity .5; finish는 저장한 st/iframes 복원. crawler 벽 탈출·돌진 라벨과 E 중복 조회 제거를 인수한다. 틱 목록 API/ResourceLoader 신규 추가 없음. 번역 CRLF 변환 없음.

## 검수

실행 증거: `~/exoduser-wt/_out/INTEG-17d/`. 테스트마다 새 namespace, PC storage off·07/E2E on. 실패 재실행 0, 새 진단 테스트 파일 0, 기준판 재실행 0. 기존 실패 판정 근거는 PC 보고서 §3.

Import 첫1회 exit0 / ERROR0 / 캐시 복사0.

| 테스트 | 검사 | 실패 | ERROR | 판정 | 실행 |
|---|---:|---:|---:|---|---|
| p2001h_curtain_spawn | 124 | 2 | 0 | 기존 실패 | 첫1회 |
| demo11_etype_a | — | 2 | 0 | 기존 실패 | 첫1회 |
| demo11_etype_d_runtime | — | 7 | 0 | 기존 실패 | 첫1회 |
| demo11_etype15_runtime | 151 | 1 | 0 | 기존 실패 | 첫1회 |
| p3002_spawn_holes | 59 | 2 | 3 | 기존 실패 | 첫1회 |
| pc_player_shield | 166 | 0 | 0 | PASS | 첫1회 |
| pc_m29_parry | 101 | 0 | 0 | PASS | 첫1회 |
| pc_boss_parity | 44 | 0 | 0 | PASS | 첫1회 |
| pc_combat_kill | 47 | 0 | 0 | PASS | 첫1회 |
| pc_move_skills | 271 | 0 | 0 | PASS | 첫1회 |
| native_main_source_starter_state | 148 | 0 | 0 | PASS | 첫1회 |
| parity_hud_01 | 17 | 0 | 0 | PASS | 첫1회 |
| demo11_07_lobby_entry | 56 | 0 | 0 | PASS | 첫1회 |

기존 실패 원인: curtain 초기 actor/bonfire 가정2; A Marker adapter/등록2; D Marker adapter/unknown_spawn_group7; 15 기존1; p3002 생성/등록2와 fixture `_index`/`hole` 누락 SCRIPT ERROR3. 이 실패들을 PASS로 바꾸거나 판정을 약화하지 않았다.

## 안전 경계

R은 파일 읽기와 명시 Git fetch/ref만 수행했으며 R Godot/import 0. 다른 worktree 수정 0. 새 worktree만 사용, `.godot` 캐시 복사0. 보호 PID81277에 신호/종료0. 단위 검사와 E2E는 순차 실행했으며 사용자 Godot 포함 동시2개였다. project.godot의 실제 저장 namespace를 쓰지 않고 실행별 임시 override 및 필요한 테스트 USERDIR 상수만 바꾼 뒤 byte 복원한다. 훅 비활성·force·reset·rebase·전체 add·main push 없음. 소스 병합은 cherry-pick 없이 merge만 수행한다.

## 마지막 E2E 1회

**13 PASS / 5 NOT_READY / 0 FAIL**, exit0 / ERROR0. 새 격리 namespace·storage on, 게임 상태 주입0. 기존 하니스·판정 그대로.

| # | E2E 단계 | 결과 | 사유 |
|---|---|---|---|
| 1 | isolation | PASS |  |
| 2 | new_game | PASS |  |
| 3 | character_create | PASS |  |
| 4 | intro_skip | PASS |  |
| 5 | field_MAP11 | PASS |  |
| 6 | enemy_kill | PASS |  |
| 7 | item_pickup | PASS |  |
| 8 | equip | PASS |  |
| 9 | auto_potion | PASS |  |
| 10 | level_up | PASS |  |
| 11 | stat_passive_invest | PASS |  |
| 12 | revival_interface | PASS |  |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS |  |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |

## GUI 실플레이 1세션

로비 신규 전사 `Integ17d` 생성 → 전사 영상 Space 홀드 → 필드 인트로 건너뛰기 → 레슨 표시/배경막 관측 → 학습 건너뛰기 → 시작 링 5마리 접근 → 머리 위 `물리탄 차징 · E로 패링` 표시 관측 → 좌클릭 근접 공격. 실제 세션 event에 ring_01·02·04·05·03 `enemy_death` 5건, G.kills=5 / HUD 지역처치3/32·경험치5/15. ring_04도 플레이어 주변 도달·죽음 확인. 임의 HP/피해/위치/적 생성/상태 주입 없음.

필드 FPS 단 1회 `Engine.get_frames_per_second()` = **163 FPS** (M5 Pro, compatibility, 1280×720 창·viewport 캡처, 사용자 Godot 매니저 PID81277 동시 존재). 특정 장면 단일 관측이며 PC 보고서 헤드리스 수치·최저사양 보장은 아니다. `captures/field.json`에 당시 세션 wall interval 표본8433 / 평균6.242ms·p95 10.828ms·p99 11.885ms 보존.

엔진 `get_viewport().get_texture().get_image()` 결과 `captures/lesson.png`와 `captures/field.png` 2장. 임시 F10/F11 관측 코드는 게임 상태를 쓰지 않으며 저장 뒤 Main 원byte로 복원했다. 최초 field 캡처에 후속 Escape 설정 화면이 들어가 별도 archive에 보존하고, **FPS 재측정 없이** F10으로 필드 프레임만 다시 저장했다. 처음 일반 Godot 앱 ID가 사용자 프로젝트 매니저와 겹쳐 실제 조작 없이 자기 창을 닫고, 동일 공식 엔진 실행 파일에 별도 로컬 앱 ID/서명을 준 관측용 실행본을 사용했다. 첫 서명 전 복사본은 OS 종료137로 부팅하지 않았으며 서명 후 한 세션에서 신규 생성·플레이했다. 별도 앱 bundle에는 캐시를 복사하지 않았다.

## MAP PRODUCTION REPORT

STAGE: MAP11 시작 지점 관측만, 신규 맵 제작/변경0.

- MASTER: silhouette/regions/main route/side spaces 기준판 보존; 전체맵 재검수 미수행.
- OUTER MASS: LEFT·RIGHT·SOUTH 시작 시야의 생체나무/뿌리·어두운 바닥 유지; TOP·major holes 전체범위 미검수.
- LARGE: source assets/composites/overlap/repeated silhouette 변경0; 전범위 미검수.
- MEDIUM: connections/remaining holes 변경0; 전범위 미검수.
- GROUND: 기존 shadow/contamination/structure integration 유지.
- PLAYABLE: 시작 주변 전투 공간과 링 적 접근·근접 처치 확인; main arenas/travel/breathing/threat 전체범위 미검수. 전투 후 일부 적 본체가 화면에서 사라지고 경고 링·라벨만 남아 보이는 결함을 관측. 회귀 여부는 기준 재실행 없이 미확정.
- LANDMARK: primary/secondary/tertiary 변경0·전범위 미검수.
- CAMERA QA: START 관측, EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미검수.
- TECH QA: route/collision 시작 링 접근·처치만; pageerror/404 웹 해당 없음; seam 전범위 미검수; loading importERROR0·GUI입구 성공; performance 필드163FPS 단1회.
- FILES: stage-owned 맵 변경0; concurrent touched0; unrelated touched0.
- GIT: 이 통합 브랜치의 PC 코드/docs만 정상 merge/명시 경로 stage; main/Steam/deploy0. 최종 commit·원격 SHA는 외부 DONE/remote-after-push 근거.

**VISUAL VERDICT: RETOUCH** — 배경막/라벨은 관측되지만 적 본체 표시 결함과 나머지 맵 시야 미검수를 남긴다. 기술 PASS를 시각 PASS로 환산하지 않는다.

NEXT PASS: 적 본체 표시의 실제 owner/기준 회귀 여부 확인, 자연 B/F/D/29 HOLD·미등록 종, E2E NOT_READY5는 후속 작업. 본 통합에서 판정 완화·UI 개선·HOLD 해제 없음.
