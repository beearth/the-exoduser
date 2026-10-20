# P2-006a PC 인수 검수 — 미완료

## 1. 원본 근거

| 계약 | 이 worktree game.html 행 | 관측 |
|---|---|---|
| 일반 장비 반입 | 16398–16424 | 빈 장착 슬롯과 무관하게 INV.bag, 공간 부족 시 거부 |
| 유골 | 16400–16409 | 유골함 지급·도감 등록 선행. 현 포트 정직 정지 |
| 드랍 상한 | 16721 | 20개, 미개봉 상자 보호 |
| R 프레스·홀드 | 32932–32979 | 화면 ±40, 최고 등급·동급 근접, 홀드 9틱 |
| 장비 표시 | 52579–52594 | 34px 스킨·60×160 빔·바운스. 이 분기에는 라벨/TTL 없음 |
| 악의 수명 | 41632–41642 | mat만 _matLife 감소, 만료 시 슬라임 생성. 장비 TTL로 적용 금지 |

## 2. 변경 파일·소유권

- 브랜치 `claude/p2-006a-drop-pickup-20261020`, 인수 HEAD `ad7f15777a2b37069f4f493cb2379907774e587f`.
- 기존 tracked WIP: main.gd +6줄, native_source_new_run_state.gd +68줄. tools/guard.baseline.json은 별도 변경으로 보존.
- 기존 untracked: native_world_drops.gd 및 uid, test_p2006a_world_drops.gd, 드랍 빔·스킨·컷아웃·SFX. 원본 바이트 대조 전이므로 반영 후보 확정 아님.
- 이번 추가는 이 보고서뿐. 기존 코드 수정 없음. 백업: G:/exoduser-wt/_out/P2-006a-pc/handoff-backup/.
- 로컬 WORK_BOARD.md 없음. G:/exoduser의 작업판을 읽기 전용 확인: P2-006a 중단·인계 대기. 본 폴더 수정 없음.
- 로컬 MAC_ORDERS_20261020.md에 P2-006a 절 없음. 사용자 직접 배정 범위로 조사.

## 3. 기존 테스트 기준선

명령: `bash C:/Users/심도진/AppData/Local/Temp/claude/G--exoduser/01df6303-6873-40fb-a2e6-1c93fb00612e/scratchpad/run_godot_tests.sh G:/exoduser-wt/p2-002a-hud/godot G:/exoduser-wt/_out/P2-006a-pc/baseline test_p2006a_world_drops:EXODUSER-P2006A-Isolated-20261020`

| 항목 | 관측 |
|---|---|
| 엔진 | 4.7.2.stable.official.ed1daf0bf |
| 검사 | 3그룹, 18 assertions, 0 assertion failures, 0 skipped |
| 반입 | gx [0,2,4], 배치 300개, bonePart 미이식 거부 |
| stderr | Camera2D 경고, ObjectDB 2개 누수 경고, resources still in use ERROR 1개 |
| 로그 | G:/exoduser-wt/_out/P2-006a-pc/baseline/test_p2006a_world_drops.out.log 및 .err.log |

18/18은 전체 PASS가 아니다. 직접 레코드 주입·픽업 함수 호출 테스트이며 실제 처치·키 입력·오디오·실창·세이브 호환을 입증하지 않는다.

## 4. 커밋

구현 인수 커밋·push 미완료. 보고서 커밋 SHA는 최종 전달에서 별도 보고한다. 보고서 자체의 SHA를 본문에 자기참조하지 않는다.

## 5. 남은 것·의존성

| 항목 | 상태 |
|---|---|
| 결정·소켓석 | native_normal_enemy_hurte.gd:723에서 apply_native_drop_bags로 직접 반입. 바닥에서 재지급하면 중복. 해당 공용 피해 집행자는 수정 금지이므로 담당 조율 필요 |
| 유골 | 도감·유골함 지급 미이식. 가짜 가방행 폴백 금지 |
| 렌더 | uniqueArt 미복사 폴백, 가산 합성/블러 근사, 누락 에셋 원형 표시 등 원본 불일치 |
| 자동 줍기·필터·수명 | 각 분기 추적·검증 필요. 장비에 mat TTL 적용 금지 |
| 종료 오류 | 기존 테스트의 자원 누수 원인 진단·해소 필요 |
| 실창 | 1920×1080 실제 처치 후 장면·대상 실제 좌표 1× 크롭 미수행 |
| 에셋 | 인수 파일 원본 SHA-256 대조·누락 확인 필요 |

완료 판정: **미완료 / 시각 미검수**. 기존 진행분·사용자 서버·실제 저장 폴더는 보존한다.
