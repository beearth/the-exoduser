# ZOOM-01b 재촬영 — 부분 제출 / 실제 근접 전투 미완료

기준 ZOOM-01 `2487618121c294d02f4f6cc40658476d0a5c32d1`에 ls-remote 확인한 MAP11-32c `c335f34575c6d45945fa50d69ffeb5628ecfa372`를 merge했다. 같은 codex/zoom-01-20261021 브랜치. 제품 기본 카메라/스케일/UI·PC 전투 코어·맵 비주얼·번역 수정0. R은 조회만, Godot/import는 ZOOM-01b 전용 WT에서만 실행했다.

## 결과·실제 검수

**전체 요청 미완료 / VISUAL VERDICT: RETOUCH.** 새 필드 START와 입장 구도는 재촬영했지만, 실제 보스 공격 프레임은 만들지 못했다. 원본12장은 필드4+입장4+실제 입력 접근 후 idle 실패증거4다. 마지막4장은 요청한 실제 전투 캡처를 대체하지 않는다.

최종 원본12장 각각 직접 열어 눈검수했다. 전부 플레이어 전신이 보이고 하단 구슬/스킬바·우상단 패널 가림 없음. 필드는 새 MAP11-32 첫 구역(0,3700), 흰나무와 회색 길·근처 적3개를 확인했다. 화면 상단의 기존 지역명 UI에는 여전히 기상터 문구가 있지만 구형 붉은 바닥 장면이 아니다. 제품 UI는 변경하지 않았다.

입장 x1은 두 대상 전신 수용, 기존 지역명 오버레이가 보스 몸통 위에 겹치는 한계가 있다. x2/x2.5/x3은 플레이어를 HUD 위에 보존할 때 보스가 화면 밖이다. 배수를 낮추거나 대상 간 거리를 옮겨 위장하지 않았다. 근접 시도 x1은 둘 다 보임, x2는 보스 뿔이 상단 보스 HUD에 걸림, x2.5/x3은 보스 상단 잘림. 해당 비교판과 *_annotated.png에는 **둘 다 안 들어옴**을 표시했다. 원본1920×1080 픽셀은 보존, 비교판7680×1140은 원본 네 장+외부60px 설명띠다.

## 프레이밍과 재현 계약

테스트 `godot/tests/capture_zoom01.gd -- --zoom-preview=all`은 같은 장면을 멈춰 배수4개를 순차 촬영한다. 기존 숫자1.0/2.0/2.5/3.0 인자도 유지한다. 제품 런처 연결0. 필드는 offset을 고정 월드 -180으로 누적하지 않고 player−(0,110)/(base×배수) 중심으로 발을 화면 y650 부근에 유지한다. 보스는 축소한 표시 body와 player alpha bounds 합집합 중심을 사용하고, 두 대상 수용 불가 시 player 바닥 y900 상한을 우선한다. 중앙 x700..1220/y115..900을 보수적인 HUD 안전영역으로 판정했다. 화면 전체 포함과 HUD 안전영역 포함은 구분한다.

보스 표시 루트만1/배수. 충돌/공격범위/HP/AI/전조 수치 수정0. 필드 실제 등록 적3개를 근처에 배치하고 다른 적은 숨긴 캡처 fixture다. 인트로 보호막만 숨기고 player sprite 표시를 보장한다. 필드에서 보스 입장까지 자연 종주 증거는 아니다. 실제 public spawn API로 아레나 입장 fixture를 구성한 뒤, 그 이후에는 player.handle_native_input_event의 move_up 실제 이동만 사용했다. 모든 노드의 원 process/physics flags를 저장·정지·복원하여 ALWAYS 자식과 camera null 오류를 방지한다. 비교 중 shader TIME은 계속 움직일 수 있다.

## 실제 전투 불가 근거

최종600 physics ticks 동안 실제 move_up 입력 accepted=true, 이동 약 590.060 world. boss `ticks_completed=0`, `last_serial=-1`, `s=idle`, `clock_reason=owner_gap_no_receipt`. 첫1800tick 시도도 동일했다. `native_demo11_boss_actor._physics_process`는 World의 실제 source projectile clock 준비를 기다리며, `port_modules/source_frame_entry/producer.gd::_gap`은 owner receipt 부재에서 중단한다. 보스가 공격 전조/모션에 도달하지 않았다. 가짜 source_tick/prefix receipt/AI state/telegraph 주입, PC core/계약 수정, 추가 브랜치 병합은 수행하지 않았다. 따라서 현재 지정 기준으로 (c) 요구를 완료했다고 선언할 수 없다. capture.log와 measurements.json에 증거 보존. 최종 exit6은 이 미완료를 명시하는 종료값이며 SCRIPT ERROR0이다. 이전 camera null 오류/보호막·프레이밍 실패 로그도 보존한다.

## 픽셀 표

alpha used-rect 투영 높이(잘림 전), boss=0은 필드 부재. 실제 화면 조각 높이가 아니다. 월드 폭=1920/(base×배수), HUD 영역 포함. 보스 투영높이는 배수 안에서 일정하다. 필드는 x2가95.2px로 약90px에 가장 가깝다. x3는142.8px이다.

| scene | multiplier | player opaque height px | boss opaque height px | visible world width | both fit safe area |
|---|---:|---:|---:|---:|---|
| field_start | 1.0 | 47.6 | 0.0 | 2742.9 | True |
| field_start | 2.0 | 95.2 | 0.0 | 1371.4 | True |
| field_start | 2.5 | 119.0 | 0.0 | 1097.1 | True |
| field_start | 3.0 | 142.8 | 0.0 | 914.3 | True |
| boss_entry | 1.0 | 38.3 | 349.7 | 3406.1 | True |
| boss_entry | 2.0 | 76.7 | 349.7 | 1703.0 | False |
| boss_entry | 2.5 | 95.8 | 349.7 | 1362.4 | False |
| boss_entry | 3.0 | 115.0 | 349.7 | 1135.4 | False |
| boss_melee_attempt_IDLE_NOT_COMBAT | 1.0 | 54.4 | 496.3 | 2400.0 | True |
| boss_melee_attempt_IDLE_NOT_COMBAT | 2.0 | 108.8 | 496.3 | 1200.0 | False |
| boss_melee_attempt_IDLE_NOT_COMBAT | 2.5 | 136.0 | 496.3 | 960.0 | False |
| boss_melee_attempt_IDLE_NOT_COMBAT | 3.0 | 163.2 | 496.3 | 800.0 | False |


## 안전·파일·인계

격리 user dir `EXODUSER-ZOOM-01b-Isolated`를 import/GUI 모두 임시 override로 지정했다. 실행 직전 Godot count1(PID81277)에서 시작, 자기 importer/GUI 정상 종료, 타 프로세스 조작0. override는 원 byte로 복원. 실제 저장 폴더 접근0. 제품 소스 수정0, 테스트/비교판 생성기/관련 docs만 변경했다. 병합 문서 충돌은 부모3way로 재생성한 양쪽 기록 합집합과 byte 대조했고 원본·중간본은 merge-audit에 보존했다.

캡처: `/Users/fordeargamers/exoduser-wt/_out/ZOOM-01b/captures/`. 장면별 *_comparison.png, 숫자별 원본 및 *_annotated.png, measurements.json/md. 이전 ZOOM-01 보고서는 당시 실패 이력으로 보존한다.

================= MAP PRODUCTION REPORT =================
STAGE: 새 CH1 첫 필드 START / 보스 입장 / 근접 입력 실패증거
MASTER: silhouette/regions/main route/side spaces 기존 유지
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 수정0
LARGE: source assets/composites/overlap/repeated silhouette 수정0
MEDIUM: connections/remaining holes 수정0
GROUND: shadow/contamination/structure integration 수정0
PLAYABLE: arenas/travel/breathing/threat 기존 유지; player HUD 가림 해소; 실전 보스 미검수
LANDMARK: primary/secondary/tertiary 기존 유지
CAMERA QA: START player PASS, EXIT/입장 고배율 둘 다 수용 불가, ARENA 실제공격 미완료; EARLY/SIDE L/SIDE R/LANDMARK/LATE 범위밖
TECH QA: loading/capture 오류0; 실제 이동 accepted; route/collision/seam/performance 미측정; pageerror/404 해당없음
FILES: stage-owned 테스트1/비교판생성기1/docs; merge dependency 이외 unrelated 수정0
GIT: 지정 branch 정상 push·원격SHA 대조는 DONE receipt 참조; main/deploy0
VISUAL VERDICT: RETOUCH — 실제 전투 미완료, 고배율 보스 수용불가
NEXT PASS: 실제 source clock owner 인수된 별도 승인 기준에서 공격 프레임 재촬영 필요. 이 작업에서 core를 우회하지 않음.
