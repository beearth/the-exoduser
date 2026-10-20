# BC3-04 — laser wind/active 독립 소비자

## 기준·의존과 범위

| 항목 | 근거 |
|---|---|
| 브랜치 | `codex/bc3-04-20261020` |
| 최신 main | `0105159934d0c2a8b167bd51518dca1e0fafe50a` |
| BC3-03 의존 | `1a34782cfee66184c981d603568dee73feb4502d` (main 미포함) |
| 정상 merge 기준 | `a485476945a8b35e60708e0e2af773d7a88d76d6` (위 두 SHA를 부모로 병합) |
| 병합 충돌 | CHANGELOG 한 파일. main 바이트 전체를 보존하고 BC3-03 절만 앞에 추가. 가상 merge-base의 충돌 표식 정규화는 의존 추가분 식별용이며 원문 main 표식을 삭제하지 않음. 원로그에 비교 증거 보존 |
| 변경 경계 | 신규 laser 모듈·전용 oracle/테스트·UID 2개·이 보고서·CHANGELOG. 기존 제품/테스트·Main/World/State/저장·공용 파일 변경 0줄. 원본/에셋 생성·변환 0 |

[3장 추적 지시서](../../FDG_SOURCE_TRACE_BOSS_CH3_20261020.md) §5 4번만 구현했다. `begin_tick`은 공용 시계가 이미 적용된 `st2`와 `sp`를 받으며 시계를 다시 차감하지 않는다. `next_tick`은 명시 ack/readback으로 이어지는 독립 계산이다. BC3 catalog/context와 기존 공용 command/RNG 계약을 재사용한다.

## 원문 계약

최신 main `game.html` SHA256은 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`다. G40710–40747은 SHA256 `b074695108b8fe7a95e3bb0b2a9d4a2db7e1161e546271ad90699ec5fc04139c`, G12463의 `_r`은 `c25172b1b2691a02a5cdd36e68291ec91fd88ac5fa1a65432d16b8acf77b2a48`로 고정했다. oracle은 원본을 스트리밍 해시하고 두 좁은 구간만 추출한다.

G40712–40718: ±π 보정 후 `.04*sp` 추적, 종료 시 각도 lock→방향 RNG→sweepT0→active80, 길이 `1400+stage*60` 순서를 보존한다. G40722–40729: null lock 폴백, 누적 sweepT, 방향의 JS `||1`, `.0065` sweep, `10≤t<laserLen`의 10단위 `isW` 판독과 첫 벽 절단을 보존한다.

G40731–40741: strict 투영/거리/iframe 조건 뒤 `isPWin`을 먼저 읽는다. 패링은 bank의 ToInt32 및 doParry/poise 요청, 그 외 charge가 아니면 HP1% ToInt32의 magic hurtP 요청이다. 보호 호출 뒤 전체 enemy/player readback을 요구한다. 이후 sample 선택→`_r(1.2,.15)` 판독→playSample→iframe max60→옆방향 KB6 순서다. 원문에서 먼저 계산한 축/좌표차/절단길이는 보존하고, 보호 호출 뒤 KB는 갱신된 각도·player 값을 사용한다.

G40745–40747: `random>.5`일 때 거리·XY·속도XY·크기 순서의 직접 RNG를 소비하고 입자 요청 뒤 recover60/beamStop을 처리한다. `_r` 및 보호 owner 내부 RNG 소비는 owner readback의 cursor로 반영하고 직접 laser RNG로 중복 계상하지 않는다. 효과·벽·보호 contact는 실제 실행이 없는 요청/결과 값이다. 실제 피해·패링·물리·SFX·렌더·Main/State 연결과 전체 tick 완료는 검증하지 않았다.

## 검증

| 검사 | 실제 결과 |
|---|---|
| 원문 JS → 신규 Godot | 53사례·865event·193직접 RNG·벽 판독297·보호 readback16·pitch readback12, 단정 966/0·SKIP0 |
| 직접 관련 기존 BC3 catalog (1회) | 단정 43,491/0·SKIP0 |
| 실행 진단 | 최종 두 스위트 exit0·ERROR0·stderr0, override 종료0byte. 신규 테스트 66.52초, catalog 6.51초 |
| 최초 실패 | laser-01: 테스트의 탭/공백 혼용 parse ERROR2, 본 검증 미실행. 들여쓰기만 정리 후 실패 스위트 laser-02 재실행. 원로그 보존 |
| 격리·보호 | 최소 프로젝트 13파일·148,057byte. Godot gate 기록 보존. 기준 추적 파일2,478개는 CHANGELOG 추가 전 전부 동일 |


회귀 범위는 바꾼 모듈과 직접 관련된 BC3 catalog 1회다. 신규 검증 안에서 BC3-03 laser 시작→wind 입력 경계도 확인한다. 전체 보스/맵/저장 회귀는 실행하지 않는다. 원문은 JS 정수/IEEE binary64로 수송하고 기존 공용 정밀도 계약(정수 정확 비교, 실수 절대/상대 1e-12)을 유지한다. 하니스는 UTF-8 임시 파일, `OS.execute` 출력 join, 명시 `--node-bin`/`--source-game` 인자를 쓴다.

결함 검사는 입력 누락, 출처/체크포인트 위조, 벽 readback 누락, 보호 contact 전체 readback 누락, 범위 밖 RNG의 핵심 5종이다. 별도 테스트 복제나 광범위 회귀 반복 없이 전용 테스트에서 NOT_READY와 부분 결과 미노출을 확인한다.

Godot 프로젝트는 필요한 13개 파일만 바이트 복사한 외부 최소 프로젝트다. 매 실행 전 지정 pgrep 수가 2 이상이면 30초 대기한다. 신규 격리명은 `EXODUSER-bc3-04-Isolated-20261020`, 기존 회귀는 파일 상수 `EXODUSER-bc3-01r-Isolated-20261020`를 쓴다. override는 실행별 생성 후 비운다. 실제 전투·화면·PC 검수는 미확인이다.

원로그·병합 증거·실행 인자·프로세스 gate·복사 SHA·제출 수치는 `~/exoduser-wt/_out/bc3-04/`에 보존한다. 정상 훅, 경로 지정 스테이징, 자기 브랜치 push와 원격 SHA 확인, DONE 작성 뒤 자기 worktree를 제거한다. R의 HEAD/브랜치/추적 변경 상태는 시작 값과 대조한다.
