# INTEG-13 — 스킬 통합과 웹 맵 전투 접근

## 재료·범위

| 항목 | SHA / 계약 |
|---|---|
| INTEG-12c 기준 | `32d1684d3f95250834175d53259f0ddf934534e0` |
| PARITY-SKILL-01 merge | `0c8fd56f22d83590da729b98563836a147ffd522` (`b6050641c584407e413c04665a6ec6c77b59f0b5` PC writer 포함) |
| merge | `18c6c3999`, merge 방식만 사용. `PARITY_UI_03_20261022.md` 문서 충돌 한 곳의 양쪽 후속 이력 보존. PC 구현/테스트·부팅/life 코드 충돌 없음 |
| 실행 source | `~/exoduser-wt/INTEG-13/godot`, R에서 Godot/import 실행 없음 |
| 제품 변경 | merge로 스킬 UI/writer 인수. 이번 독자 변경은 Mac E2E 하니스뿐. 새 비주얼·PC 코어·PC 테스트·PC hud-stats 변경 없음 |

## 접근 경로 수정

원래 E2E는 `test_demo11_47h_e2e.gd`에서 소환굴 배열의 첫 항목/7초 순회와 etype 1/4 최초 적을 고르고 직선 `steer_input`으로 접근했다. 현재 `web_field.gd`는 웹 40px, 200×200 타일, 언덕 띠/경사로 및 prop ellipse 충돌을 사용한다. 기존 직선 접근은 해당 구조를 따라가지 않는다. 웹 원본 위치는 `game.html` 31744–31785/31847–31908(BFS), 30042–30050/31682–31712(충돌)이며 동결 `godot/source_snapshot/game.html`을 기준으로 한다. 접근 가설과 실제 단회 결과는 구분한다.

| 하니스 항목 | 현행 동작 | 제품/판정 경계 |
|---|---|---|
| 타겟 | 실제 world registry의 살아 있는 가장 가까운 전투 적(커튼 적 포함), 없으면 거리순 실제 provider 소환굴 | etype/RNG/스폰/HP/위치 쓰기 없음 |
| 이동 | `web_flow.gd` 8방향 BFS 거리장, 타겟 셀이 바뀔 때 준비, 실제 player 입력 전송 | 맵/충돌 owner 교체 없음. 12px 예상 이동은 실제 radius 충돌 확인. 거리55px 이내 국소 접근,12px 이내 정지 |
| 처치 | 45초 접근/공격 관측, 근접47+radius−4 안에서 weapon press/release·실제 aim. 자동 석궁은 제품 스케줄러가 실행 | 직접 피해/kill/원장 생성 없음. 공격 수는 입력 횟수와 실제 입력 admission 결과를 구분 |
| 드랍/줍기 | 자연 드랍이 없으면 실제 전투 최대60초, 개별 적8초. 실제 drop x/y로 최대15초 접근 후 R | 드랍 fixture/RNG/아이템 생성 없음. 기존 item identity/가방 증가 판정 유지 |
| 성장 | 실제 보상으로 initial level을 넘을 때까지 최대60초 자연 전투 | XP/레벨/SP/AP 주입 없음. 기존 장착·물약·성장 readback 판정 유지 |
| 자연 접촉 | 실제 접촉 공격자의 위치로 BFS 입력 접근 | player 위치/HP/iframe 쓰기 없음 |

`web_flow`는 원본 타일 그래프다. prop ellipse와 언덕의 세부 국소 장애물까지 새 제품 경로 시스템으로 대체하지 않는다. 이번 검수는 기능 테스트와 화면 비교를 각각 기록하며 PASS13을 가정하지 않는다.

## 검수

검수 원문·18단계·나란히 캡처·종료 확인은 `~/exoduser-wt/_out/INTEG-13/DONE.txt` 및 동일 폴더 JSON에 보존한다. 완료 수치는 아래 최종 결과 절에 기록한다. 기존 INTEG-12/PARITY-SKILL의 시각 RETOUCH와 영상/미이식 HOLD는 테스트 통과로 해제하지 않는다.

### 단회 결과 후 접근 보강 (E2E 재실행 아님)

첫 전투는 14.12초 뒤 자연 사망, 자동 석궁6발/7hit/0kill, 근접 입력0이었다. 실제 시작(4020,7251.912)→(4019.253,7159.671), 자연 등록10/거부29. 단일 최초 target을 쫓으면 더 가까워진 다른 몸체/적과 교전하지 못할 수 있어, 하니스는 20px 이상 가까운 실제 전투 적으로 재선택한다. 실제 관측한 target 목록의 `alive=false`인 actor ID와 원본 region kill 증가를 함께 요구한다. count만으로 처치 PASS를 만들지 않는다. 이 보강은 단회 E2E가 시작된 뒤 추가했으므로 실행본(`e2e-executed.gd`)과 최종본을 구분하며, E2E PASS를 재선언하지 않는다. 제품 body collision을 이 근거만으로 수정하지 않았다.

## 단회 E2E 최종

7 PASS / 11 NOT_READY / 0 FAIL, ERROR0/exit0. PASS13 미달. 수집 runner의 PASS는 프로세스·오류 조건만이며 종주 PASS가 아니다. 실제 Retry 재생성·HP584 복구 후에도 보스 경로 자연 사망(76회 공격 입력/842회 이동), fbDone=false. 원본 판정/주입 경계는 유지한다.

| # | 단계 | 판정 | 사유 |
|---:|---|---|---|
| 1 | isolation | PASS |  |
| 2 | new_game | PASS |  |
| 3 | character_create | PASS |  |
| 4 | intro_skip | PASS |  |
| 5 | field_MAP11 | PASS |  |
| 6 | enemy_kill | NOT_READY | actual combat kill not completed; preserve PC halt/owner boundary |
| 7 | item_pickup | NOT_READY | actual R pickup did not admit item |
| 8 | equip | NOT_READY | item_or_interface_absent |
| 9 | auto_potion | NOT_READY | real hurtP/iframe/threshold/clock did not produce auto-potion |
| 10 | level_up | NOT_READY | natural combat XP did not level up |
| 11 | stat_passive_invest | NOT_READY | growth/applyStats/queue owner not ready |
| 12 | revival_interface | PASS |  |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS |  |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |

## 회귀 단회 결과

| 실행(각1회) | 검사 | exit | ERROR | 판정 |
|---|---:|---:|---:|---|
| 42 | 37 | 0 | 0 | PASS |
| HUD | 17 | 0 | 0 | PASS |
| HUD_toast | 26 | 0 | 0 | PASS |
| boss | 276 | 0 | 0 | PASS |
| import | import | 0 | 0 | PASS |
| intro | 12 | 0 | 0 | PASS |
| pack_b_mac | 402 | 0 | 0 | PASS |
| pc_move | 256 | 0 | 0 | PASS |
| pc_skill_writer | 80 | 0 | 0 | PASS |
| skill | 105 | 0 | 0 | PASS |

PC 이동/pack suite의 forced fixture는 자연 전투 증거가 아니다. equality-only PC fixture는 원문 namespace를 보존하고 storage=off로 실행했다. intro/E2E/GUI는 UUID namespace다. 실제 저장 폴더 사용0. 모든 override는 해당 하니스의 finally에서 원복한다.

### 첫 근접 적 필터 원인

`native_intro_curtain_sequence.gd:308–359`는 `ch1_curtain_ring_01` 등 5마리를 `world.register_native_curtain_ring_enemy`로 등록한다. 이들은 실제 제품 적이지만 `native_natural_enemies.owns_actor`의 소환굴 origin이 아니다. 초기·첫 BFS 하니스는 이들을 제외하고 먼 자연 소환 적을 고정 추적하여 가까운 커튼 적 앞에서 공격0 상태로 사망했다. 마지막 하니스는 실제 world registry에서 살아 있고 `receive_damage`가 있는 모든 전투 적 중 최근접을 선택한다. 타인 PC core/테스트를 수정하지 않고 타겟 조회 필터만 교정했다. 자연 보상·실제 actor death + region kill 증가 조건은 그대로다. 이 수정은 단회 E2E 뒤이므로 전체18단계 회복을 검증한 것으로 기록하지 않는다.

## 별도 GUI 실제 입력 관측

최종 최근접 적 필터를 복사한 외부 GUI 캡처 하니스에서 story=done/guide=done/hidden=false/paused=false를 확인했다. 같은 장면에서 K로 실제 스킬창을 열고 닫고 전투 입력을 보냈다. 최근접 범위 교정 뒤 실제 공격14회/admission14회(교정 전0회)까지 도달했으나 actor death0, HP0으로 종료했다. 공격 경로의 접근 개선은 관측됐고 처치·드랍·성장 완료는 미충족이다. 제품 오류/PC halt/피해량/전투 운용 중 어떤 후속 원인이 남았는지는 이번 자료만으로 확정하지 않는다. 무근거 PC 코어 수정·하니스 HP/위치/드랍/XP 주입·원래 판정 축소는 하지 않았다.

단회 E2E 실행본은 외부 `e2e-executed.gd`, 최종본은 저장소 파일이다. 최종 수정 후 기능 suite/18단계 재실행은 없다. 최종 파일의 check-only는 문법 검사로만 구분한다. GUI capture RESULT의 failures0 역시 자연 처치 PASS가 아니다.

## 나란히 화면 검수

`captures/01_skill_compare_1x.png`, `02_lobby_new_compare_1x.png`, `03_field_combat_compare_1x.png`: 왼쪽 웹/오른쪽 Godot, 각1920×1080을 무축소 배치한다. 새 캐릭터 진입 UI와 실제 필드 전투를 별도 경로로 수집했으며 시계·RNG·전투 결과를 강제로 같게 하지 않았다. 웹 원본은 동결 snapshot route, three build는 기존 검수 폴더의0.186.0 정식 build만 사용한다. 스킬 화면은 UI event로 연다. 자연 종주 E2E가 아니며 수치 동일 fixture 캡처도 아니다.

스킬 UI 원판/프레임·텍스트 굵기·PBR/ember·링크 합성 차이는 기존 RETOUCH다. 로비 생성 UI의 구도/레이아웃·폰트도 완전 동일하지 않다. 필드는 같은 웹 구조 위지만 native가 더 어둡고, 적/교전 결과와 카메라 위치·시간이 다르다. 나란히3장 존재만으로 동일성 PASS를 선언하지 않는다. failed capture namespace/ESC pause/웹 컷씬 잔류 시도는 외부 로그와 pre-final-captures.zip에 구분 보존한다.

================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / INTEG-13 접근 하니스 검수 (맵 제작 변경0)

MASTER: silhouette/regions/main route/side spaces 모두 인수된 웹 구조 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 모두 이번 수정 없음.
LARGE: source assets/composites/overlap/repeated silhouette 모두 이번 수정 없음.
MEDIUM: connections/remaining holes 이번 수정 없음.
GROUND: shadow/contamination/structure integration 이번 수정 없음.
PLAYABLE: main arenas/travel/breathing/threat 공간 변경0. 실제 입력 접근 개선, 최종GUI 공격14승인/처치0·자연 사망. 전투 가독성 비교는 다른 clocks임을 명시.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START/인접 전투/스킬/로비 실제 캡처. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 별도8장 카메라 보드는 이번 미실행.
TECH QA: route 단회18단계7PASS/11NOT_READY; collision owner 수정0; 웹pageerror0; 404 전수/청크seam/전체loading/성능 새 계측은 미실행. import ERROR0와 관련 suite 결과는 위 표.
FILES: stage-owned 맵 파일 변경0; Mac E2E 하니스와 관련 docs만 독자 변경; unrelated touched0.
GIT: 지정 별도 브랜치에 경로 지정 add/정상commit·비강제push 후 원격 SHA 대조. main/PC통합/deploy0.
VISUAL VERDICT: RETOUCH
NEXT PASS: 최종 하니스의 자연 처치·drop/성장 경로 및18단계 재검수, 실패 입력의 피해/owner receipt 추적. 이번 사용자 각1회 제한을 넘어 E2E를 반복하지 않는다.
